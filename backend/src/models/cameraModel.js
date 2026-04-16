// const mongoose = require("mongoose");

// const cameraSchema = new mongoose.Schema(
//     {
//         cameraName: {
//             type: String,
//             trim: true,
//             default: null
//         },

//         streamUrl: {
//             type: String,
//             required: true,
//             trim: true,
//             unique: true,
//         },
//     },
//     { timestamps: true }
// );

// const cameraModel = mongoose.model("Camera", cameraSchema);

// module.exports = cameraModel;

const mongoose = require("mongoose");

const cameraSchema = new mongoose.Schema(
    {
        cameraName: {
            type: String,
            trim: true,
            required: true,
        },

        // NEW FIELD - This is the main change
        cameraType: {
            type: String,
            enum: ["webcam", "ipcamera"],
            default: "ipcamera"
        },

        // For IP Camera → full RTSP/RTMP/HTTP stream URL
        // For Webcam    → we can store "local_webcam" or leave it as a flag
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