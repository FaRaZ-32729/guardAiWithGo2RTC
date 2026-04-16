const mongoose = require("mongoose");

const challanSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        challanId: {
            type: String,
            unique: true,
            sparse: true
        },

        isChallanGenerated: {
            type: Boolean,
            default: false
        },

        isAnonymous: {
            type: Boolean,
            default: false
        },

        name: {
            type: String,
            default: "Anonymous"
        },

        previousChallanBalance: {
            type: Number,
            min: [0, "Previous balance cannot be negative"],
            default: 0
        },

        currentChallan: {
            type: Number,
            min: [0, "Current challan cannot be negative"],
            default: 0
        },

        payableAmount: {
            type: Number,
            min: [0, "Payable amount cannot be negative"],
            default: 0
        },

        challanIssueDate: {
            type: Date,
            required: [true, "Challan issue date is required"]
        },

        challanDueDate: {
            type: Date,
            default: null
        },

        status: {
            type: String,
            enum: ["unpaid", "paid", "overdue", null],
            default: null
        },

        violationType: {
            type: String,
            enum: ["smoking", "fighting"],
            required: true
        },

        evidenceImage: {
            type: String,
            default: null
        },

        description: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

challanSchema.pre("save", async function () {
    if (this.challanDueDate < this.challanIssueDate) {
        throw new Error("Due date cannot be before issue date");
    }
    // Auto-calculate payableAmount before saving
    this.payableAmount = (this.currentChallan || 0) + (this.previousChallanBalance || 0);
});

const challanModel = mongoose.model('challan', challanSchema);
module.exports = challanModel;