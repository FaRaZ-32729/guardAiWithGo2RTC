// const fs = require('fs');
// const path = require('path');
// const axios = require('axios');
// const Camera = require('../models/cameraModel');
// const { processWithGemini } = require('./geminiService');
// const { GO2RTC_PORT } = require('./startGo2RTC');

// const captureDir = path.join(__dirname, '../public/captures');
// if (!fs.existsSync(captureDir)) fs.mkdirSync(captureDir, { recursive: true });

// let isGeminiProcessing = false;
// let cameraQueue = [];
// let currentIndex = 0;

// const GO2RTC_URL = `http://localhost:${GO2RTC_PORT}`;

// // Roboflow Person Detection
// const containsPerson = async (imagePath) => {
//     try {
//         const image = fs.readFileSync(imagePath, { encoding: "base64" });
//         const response = await axios.post(
//             "https://serverless.roboflow.com/face-i3ibd/1",
//             image,
//             {
//                 params: { api_key: "5AClPrAwkdK3SDazhOji" },
//                 headers: { "Content-Type": "application/x-www-form-urlencoded" }
//             }
//         );

//         const hasPerson = (response.data.predictions || []).length > 0;
//         console.log(hasPerson ? `✅ Person detected` : `⏭️  No person → skipping`);
//         return hasPerson;
//     } catch (err) {
//         console.error("Roboflow Error:", err.message);
//         return false;
//     }
// };

// // Take snapshot using go2rtc (very fast)
// const takeSnapshot = async (streamName) => {
//     const outputPath = path.join(captureDir, `camera_${Date.now()}.jpg`);

//     try {
//         const response = await axios({
//             method: 'GET',
//             url: `${GO2RTC_URL}/api/frame.jpeg?src=${streamName}&cache=0`,
//             responseType: 'arraybuffer'
//         });

//         fs.writeFileSync(outputPath, response.data);
//         return outputPath;
//     } catch (err) {
//         console.error(`Snapshot failed for ${streamName}:`, err.message);
//         return null;
//     }
// };

// const processNextCamera = async () => {
//     if (cameraQueue.length === 0 || isGeminiProcessing) return;

//     if (currentIndex >= cameraQueue.length) currentIndex = 0;

//     const camera = cameraQueue[currentIndex];
//     currentIndex++;

//     // const streamName = camera.cameraName === "Local Webcam" 
//     //     ? "local_webcam" 
//     //     : `cam_${camera._id.toString().slice(-8)}`;

//     // console.log(`📸 Capturing: ${camera.cameraName} (${streamName})`);

//     // ==================== MAIN CHANGE HERE ====================
//     let streamName;

//     if (camera.cameraType === "webcam") {
//         streamName = "local_webcam";           // Fixed name used in go2rtc for local webcam
//     } else {
//         // For IP Camera: use the short name derived from _id (your existing logic)
//         streamName = `cam_${camera._id.toString().slice(-8)}`;
//     }
//     // ==========================================================

//     console.log(`📸 Capturing: ${camera.cameraName} (${camera.cameraType}) → ${streamName}`);

//     const snapshotPath = await takeSnapshot(streamName);
//     if (!snapshotPath) return;

//     isGeminiProcessing = true;

//     try {
//         const personDetected = await containsPerson(snapshotPath);
//         if (personDetected) {
//             console.log(`🚨 Person found → Sending to Gemini`);
//             await processWithGemini(snapshotPath, camera);
//         }
//     } catch (err) {
//         console.error("Processing Error:", err.message);
//     } finally {
//         isGeminiProcessing = false;
//         // Optional: delete old snapshot after processing
//         if (fs.existsSync(snapshotPath)) fs.unlinkSync(snapshotPath);
//     }
// };

// const startCameraCaptureService = async () => {
//     console.log("🚀 New Camera Capture Service (go2rtc) Started");

//     const refreshCameras = async () => {
//         cameraQueue = await Camera.find({});
//         console.log(`📋 Camera queue updated: ${cameraQueue.length} cameras`);
//     };

//     await refreshCameras();
//     setInterval(refreshCameras, 30000);

//     // Process one camera every 4-5 seconds
//     setInterval(processNextCamera, 4500);
// };

// module.exports = { startCameraCaptureService };



const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Camera = require('../models/cameraModel');
const { processWithGemini } = require('./geminiService');
const { GO2RTC_PORT } = require('./startGo2RTC');

const captureDir = path.join(__dirname, '../public/captures');
if (!fs.existsSync(captureDir)) fs.mkdirSync(captureDir, { recursive: true });

let isGeminiProcessing = false;
let cameraQueue = [];
let currentIndex = 0;

const GO2RTC_URL = `http://localhost:${GO2RTC_PORT}`;

// ====================== Roboflow Detection Functions ======================

// 1. Person Detection
const containsPerson = async (imagePath) => {
    try {
        const image = fs.readFileSync(imagePath, { encoding: "base64" });
        const response = await axios.post(
            "https://serverless.roboflow.com/face-i3ibd/1",
            image,
            {
                params: { api_key: "5AClPrAwkdK3SDazhOji" },
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            }
        );

        const hasPerson = (response.data.predictions || []).length > 0;
        console.log(hasPerson ? `✅ Person detected` : `⏭️  No person → skipping`);
        return hasPerson;
    } catch (err) {
        console.error("Person Detection Error:", err.message);
        return false;
    }
};

// 2. Fight Detection
const containsFight = async (imagePath) => {
    try {
        const image = fs.readFileSync(imagePath, { encoding: "base64" });
        const response = await axios.post(
            "https://serverless.roboflow.com/fight-yinjf/5",
            image,
            {
                params: { api_key: "gEZIcEYVtrD4x5ODUJ2G" },   
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            }
        );

        const hasFight = (response.data.predictions || []).length > 0;
        console.log(hasFight ? `⚔️  Fight detected` : `⏭️  No fight`);
        return hasFight;
    } catch (err) {
        console.error("Fight Detection Error:", err.message);
        return false;
    }
};

// 3. Smoke Detection
const containsSmoke = async (imagePath) => {
    try {
        const image = fs.readFileSync(imagePath, { encoding: "base64" });
        const response = await axios.post(
            "https://serverless.roboflow.com/smoking-ppkpw/1",
            image,
            {
                params: { api_key: "gEZIcEYVtrD4x5ODUJ2G" },
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            }
        );

        const hasSmoke = (response.data.predictions || []).length > 0;
        console.log(hasSmoke ? `🚬 Smoke detected` : `⏭️  No smoke`);
        return hasSmoke;
    } catch (err) {
        console.error("Smoke Detection Error:", err.message);
        return false;
    }
};

// Take snapshot using go2rtc
const takeSnapshot = async (streamName) => {
    const outputPath = path.join(captureDir, `camera_${Date.now()}.jpg`);

    try {
        const response = await axios({
            method: 'GET',
            url: `${GO2RTC_URL}/api/frame.jpeg?src=${streamName}&cache=0`,
            responseType: 'arraybuffer'
        });

        fs.writeFileSync(outputPath, response.data);
        console.log(`📸 Snapshot saved: ${outputPath}`);
        return outputPath;
    } catch (err) {
        console.error(`Snapshot failed for ${streamName}:`, err.message);
        return null;
    }
};

const processNextCamera = async () => {
    if (cameraQueue.length === 0 || isGeminiProcessing) return;

    if (currentIndex >= cameraQueue.length) currentIndex = 0;

    const camera = cameraQueue[currentIndex];
    currentIndex++;

    let streamName = camera.cameraType === "webcam"
        ? "local_webcam"
        : `cam_${camera._id.toString().slice(-8)}`;

    console.log(`📸 Capturing: ${camera.cameraName} (${camera.cameraType}) → ${streamName}`);

    const snapshotPath = await takeSnapshot(streamName);
    if (!snapshotPath) return;

    isGeminiProcessing = true;

    try {
        const personDetected = await containsPerson(snapshotPath);

        if (personDetected) {
            console.log(`👤 Person found → Checking for Fight / Smoke`);

            const [fightDetected, smokeDetected] = await Promise.all([
                containsFight(snapshotPath),
                containsSmoke(snapshotPath)
            ]);

            if (fightDetected || smokeDetected) {
                let alertType = [];
                if (fightDetected) alertType.push("⚔️ Fight");
                if (smokeDetected) alertType.push("🚬 Smoke");

                console.log(`🚨 ${alertType.join(" + ")} detected with person → Sending to Gemini`);
                await processWithGemini(snapshotPath, camera);
            } else {
                console.log(`✅ Person detected but no fight or smoke → skipping Gemini`);
            }
        }
    } catch (err) {
        console.error("Processing Error:", err.message);
    } finally {
        isGeminiProcessing = false;
        if (fs.existsSync(snapshotPath)) fs.unlinkSync(snapshotPath);
    }
};

const startCameraCaptureService = async () => {
    console.log("🚀 Camera Capture Service Started (Person + Fight + Smoke)");

    const refreshCameras = async () => {
        cameraQueue = await Camera.find({});
        console.log(`📋 Camera queue updated: ${cameraQueue.length} cameras`);
    };

    await refreshCameras();
    setInterval(refreshCameras, 30000);

    setInterval(processNextCamera, 4500);   // Process every 4.5 seconds
};

module.exports = { startCameraCaptureService };