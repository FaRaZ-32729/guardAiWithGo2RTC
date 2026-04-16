const mongoose = require("mongoose");

const cameraSchema = new mongoose.Schema(
    {
        cameraName: {
            type: String,
            trim: true,
            default: null
        },

        streamUrl: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
    },
    { timestamps: true }
);

const cameraModel = mongoose.model("Camera", cameraSchema);

module.exports = cameraModel;