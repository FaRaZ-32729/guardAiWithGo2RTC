const mongoose = require("mongoose");

const anonymousViolationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: "Anonymous"
        },
        action: {
            type: String,
            enum: ["smoking", "fighting", "normal"],
            required: true
        },
        confidence: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

const AnonymousViolation = mongoose.model("AnonymousViolation", anonymousViolationSchema);

module.exports = AnonymousViolation;