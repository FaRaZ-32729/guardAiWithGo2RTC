const sendEmail = require('../middleware/sendEmail');
const Challan = require('../models/challanModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const generateChallanEmail = require('../helper/Emailchallan');


const CHALLAN_AMOUNTS = {
    smoking: process.env.SMOKING,
    fighting: process.env.FIGHTING
};

const generateChallan = async (geminiResult, snapshotPath) => {
    console.log(`gemini result in generate challan`, geminiResult);

    try {

        if (!geminiResult.matched || geminiResult.rollNo === 'N/A') {
            if (['smoking', 'fighting'].includes(geminiResult.action)) {

                const violationsDir = path.join(__dirname, "../../violations");
                if (!fs.existsSync(violationsDir)) {
                    fs.mkdirSync(violationsDir, { recursive: true });
                }

                const filename = `violation_anonymous_${Date.now()}.jpg`;
                const violationImagePath = path.join(violationsDir, filename);
                fs.copyFileSync(snapshotPath, violationImagePath);

                const issueDate = new Date();
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + 7);

                const challan = new Challan({
                    isAnonymous: true,
                    name: "Anonymous",
                    previousChallanBalance: 0,
                    currentChallan: 0,
                    challanIssueDate: issueDate,
                    challanDueDate: dueDate,
                    violationType: geminiResult.action,
                    evidenceImage: violationImagePath,
                    description: geminiResult.description,
                    status: 'unpaid'
                });

                await challan.save();
                console.log(`⚠️ Anonymous challan saved | Action: ${geminiResult.action}`);
            }
            return;
        }

        if (!['smoking', 'fighting'].includes(geminiResult.action)) return;

        // Find student
        const student = await User.findOne({ studentRollNumber: geminiResult.rollNo });

        if (!student) {
            console.warn(`Student not found in DB for rollNo: ${geminiResult.rollNo}`);
            return;
        }

        // ── 5-minute cooldown: skip if any violation saved in last 5 mins ─
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recentViolation = await Challan.findOne({
            studentId: student._id,
            createdAt: { $gte: fiveMinutesAgo }
        });

        if (recentViolation) {
            const nextAllowed = new Date(recentViolation.createdAt.getTime() + 5 * 60 * 1000);
            const secondsLeft = Math.ceil((nextAllowed - Date.now()) / 1000);
            console.log(`⏳ Violation cooldown for ${student.name} — next in ${secondsLeft}s`);
            return;
        }
        // ─────────────────────────────────────────────────────────────────

        // ── Check 24-hour challan cooldown ───────────────────────────────
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const challanAlreadyGenerated = await Challan.findOne({
            studentId: student._id,
            isChallanGenerated: true,
            createdAt: { $gte: twentyFourHoursAgo }
        });
        // ─────────────────────────────────────────────────────────────────

        // Get previous balance
        const lastChallan = await Challan
            .findOne({ studentId: student._id, isChallanGenerated: true })
            .sort({ createdAt: -1 });

        const previousBalance = lastChallan ? lastChallan.payableAmount : 0;

        const issueDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + process.env.DUEDATE);

        const violationAmount = CHALLAN_AMOUNTS[geminiResult.action];

        const violationsDir = path.join(__dirname, "../../violations");
        if (!fs.existsSync(violationsDir)) {
            fs.mkdirSync(violationsDir, { recursive: true });
            console.log("new folder created");
        }

        const filename = `violation_${student.studentRollNumber}_${Date.now()}.jpg`;
        console.log(filename);
        const violationImagePath = path.join(violationsDir, filename);
        fs.copyFileSync(snapshotPath, violationImagePath);

        if (challanAlreadyGenerated) {
            // ── Within 24hrs: save violation record only, no fine, no email ──
            const violationOnly = new Challan({
                studentId: student._id,
                isChallanGenerated: false,
                previousChallanBalance: 0,
                currentChallan: 0,
                payableAmount: 0,
                challanIssueDate: issueDate,
                challanDueDate: dueDate,
                violationType: geminiResult.action,
                status: null,
                evidenceImage: violationImagePath,
                description: geminiResult.description
            });
            await violationOnly.save();
            console.log(`📋 Violation recorded (no challan — 24hr cooldown active) for ${student.name}`);
            return;
        }

        // ── Outside 24hrs: generate full challan + send email ─────────────
        const challanId = Math.floor(10000000 + Math.random() * 90000000).toString();

        const challan = new Challan({
            studentId: student._id,
            challanId,
            isChallanGenerated: true,
            previousChallanBalance: previousBalance,
            currentChallan: violationAmount,
            challanIssueDate: issueDate,
            challanDueDate: dueDate,
            violationType: geminiResult.action,
            status: 'unpaid',
            evidenceImage: violationImagePath,
            description: geminiResult.description
        });

        await challan.save();
        console.log(`Challan generated for ${student.name} | Action: ${geminiResult.action}`);

        try {
            const recipients = [student.email, student.parentsEmail];

            await sendEmail(
                recipients,
                `Violation Fine Challan — ${student.name} | Campus-Guard AI`,
                generateChallanEmail({
                    student,
                    challan,
                    geminiResult,
                    previousBalance,
                    violationAmount,
                    issueDate,
                    dueDate,
                })
            );

            console.log("📧 Challan email sent to student and parent.");
        } catch (emailError) {
            console.error("Email sending failed:", emailError.message);
        }

    } catch (error) {
        console.error("Challan Generation Error:", error.message);
    }
};

const getSingleChallanById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid challan ID" });
        }

        const challan = await Challan.findById(id).populate('studentId', 'name email studentRollNumber department');
        if (!challan) {
            return res.status(404).json({ message: "Challan not found" });
        }

        return res.status(200).json({ challan });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message || "Server error" });
    }
};

// GET /api/challan/user/:userId
const getAllChallansOfUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const student = await User.findById(userId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const challans = await Challan.find({ studentId: userId }).populate('studentId', 'name email studentRollNumber department');

        return res.status(200).json({
            total: challans.length,
            challans
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message || "Server error" });
    }
};

// GET /api/challan
const getAllChallans = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const filter = {};
        if (status) {
            if (!['unpaid', 'paid', 'overdue'].includes(status)) {
                return res.status(400).json({ message: "Invalid status. Use: unpaid, paid, overdue" });
            }
            filter.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [challans, total] = await Promise.all([
            Challan.find(filter)
                .populate('studentId', 'name email studentRollNumber department fatherName ')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Challan.countDocuments(filter)
        ]);

        return res.status(200).json({
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            challans
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message || "Server error" });
    }
};

// PUT /api/challan/:id/status
const updateChallanStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid challan ID" });
        }

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        if (!['unpaid', 'paid'].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Use: unpaid, paid" });
        }

        const challan = await Challan.findById(id);
        if (!challan) {
            return res.status(404).json({ message: "Challan not found" });
        }

        if (challan.status === 'paid') {
            return res.status(400).json({ message: "Paid challan cannot be updated" });
        }

        //  Mark challan as paid and payableAmount amount 0 
        challan.status = 'paid';
        challan.payableAmount = 0;
        await challan.save();

        // Mark all OLDER challans as paid too
        if (challan.studentId) {
            await Challan.updateMany(
                {
                    studentId: challan.studentId,
                    _id: { $ne: challan._id },
                    createdAt: { $lt: challan.createdAt }
                },
                { $set: { status: 'paid' } }
            );

            console.log(`Marked older challan(s) as paid for student ${challan.studentId}`);
        }

        return res.status(200).json({
            message: "Challan marked as paid. All previous records cleared.",
            challan
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message || "Server error" });
    }
};

module.exports = {
    generateChallan,
    getSingleChallanById,
    getAllChallansOfUser,
    getAllChallans,
    updateChallanStatus,
};