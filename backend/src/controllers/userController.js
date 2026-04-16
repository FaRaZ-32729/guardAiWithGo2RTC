const userModel = require("../models/userModel");
const fs = require("fs");
const path = require("path");

const registerStudent = async (req, res) => {
    console.log("req.file:", req.file); 
    console.log("req.body:", req.body); 
    try {
        const { name, email, studentRollNumber, parentsEmail, parentsPhone, fatherName, department } = req.body;

        if (!name || !email || !studentRollNumber || !parentsEmail || !parentsPhone || !fatherName || !department) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Face image is required" });
        }

        const existing = await userModel.findOne({
            $or: [{ email }, { studentRollNumber }]
        });
        if (existing) {
            return res.status(400).json({ message: "Student already exists" });
        }

        // Save URL using studentRollNumber
        const faceUrl = `${req.protocol}://${req.get("host")}/uploads/${studentRollNumber}${path.extname(req.file.originalname)}`;

        const student = new userModel({
            name,
            email,
            studentRollNumber,
            parentsEmail,
            parentsPhone,
            fatherName,
            face: faceUrl,
            department,
            role: "student"
        });

        await student.save();
        return res.status(201).json({ message: "Student registered successfully", student });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message || "Server error" });
    }
};

const getSingleStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await userModel.findOne({ _id: id, role: "student" });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        return res.status(200).json(student);

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getAllStudents = async (req, res) => {
    try {
        const students = await userModel.find({ role: "student" });

        return res.status(200).json({
            count: students.length,
            students
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await userModel.findOne({ _id: id, role: "student" });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Update text fields if provided
        const fields = ["name", "email", "studentRollNumber", "parentsEmail", "department"];

        fields.forEach(field => {
            if (req.body[field]) {
                student[field] = req.body[field];
            }
        });

        // If new image uploaded
        if (req.file) {
            // Delete old image
            if (student.face) {
                const oldImagePath = path.join(
                    __dirname,
                    "../../uploads",
                    path.basename(student.face)
                );

                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            // Save new image
            student.face = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        }

        await student.save();

        return res.status(200).json({
            message: "Student updated successfully",
            student
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await userModel.findOne({ _id: id, role: "student" });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Delete image
        if (student.face) {
            const imagePath = path.join(
                __dirname,
                "../../uploads",
                path.basename(student.face)
            );

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await student.deleteOne();

        return res.status(200).json({
            message: "Student deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerStudent,
    getAllStudents,
    getSingleStudent,
    updateStudent,
    deleteStudent
}