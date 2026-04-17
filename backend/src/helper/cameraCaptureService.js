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
        console.log(hasPerson ? `Person detected` : `No person → skipping`);
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
        console.log(hasFight ? `Fight detected` : `No fight`);
        return hasFight;
    } catch (err) {
        console.error("Fight Detection Error:", err.message);
        return false;
    }
};

// 3. Smoke / Cigarette Detection
const containsSmoke = async (imagePath) => {
    try {
        const image = fs.readFileSync(imagePath, { encoding: "base64" });
        const response = await axios.post(
            "https://serverless.roboflow.com/cigarette-detect-kx3yu/1",
            image,
            {
                params: { api_key: "gEZIcEYVtrD4x5ODUJ2G" },
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            }
        );

        const hasSmoke = (response.data.predictions || []).length > 0;
        console.log(hasSmoke ? `Cigarette detected` : `No cigarette`);
        return hasSmoke;
    } catch (err) {
        console.error("Cigarette Detection Error:", err.message);
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
        console.log(`Snapshot saved: ${outputPath}`);
        return outputPath;
    } catch (err) {
        console.error(`Snapshot failed for ${streamName}:`, err.message);
        return null;
    }
};

const processNextCamera = async () => {
    if (cameraQueue.length === 0 || isGeminiProcessing) {
        if (isGeminiProcessing) {
            console.log(`Gemini is still processing... skipping snapshot this cycle`);
        }
        return;
    }

    if (currentIndex >= cameraQueue.length) currentIndex = 0;

    const camera = cameraQueue[currentIndex];
    currentIndex++;

    let streamName = camera.cameraType === "webcam"
        ? "local_webcam"
        : `cam_${camera._id.toString().slice(-8)}`;

    console.log(`Capturing: ${camera.cameraName} (${camera.cameraType}) → ${streamName}`);

    const snapshotPath = await takeSnapshot(streamName);
    if (!snapshotPath) return;

    isGeminiProcessing = true;   // Lock until Gemini finishes

    try {
        const personDetected = await containsPerson(snapshotPath);

        if (personDetected) {
            console.log(`Person found → Checking for Fight / Smoke`);

            const [fightDetected, smokeDetected] = await Promise.all([
                containsFight(snapshotPath),
                containsSmoke(snapshotPath)
            ]);

            if (fightDetected || smokeDetected) {
                let alertType = [];
                if (fightDetected) alertType.push(">>Fight");
                if (smokeDetected) alertType.push(">>Smoke");

                console.log(`${alertType.join(" + ")} detected with person → Sending to Gemini`);

                // Send to Gemini and wait for response
                await processWithGemini(snapshotPath, camera);

                console.log(`Gemini processing completed for this alert`);
            } else {
                console.log(`Person detected but no fight or smoke → skipping Gemini`);
            }
        }
    } catch (err) {
        console.error("Processing Error:", err.message);
    } finally {
        isGeminiProcessing = false;           // Unlock for next cycle
        if (fs.existsSync(snapshotPath)) {
            fs.unlinkSync(snapshotPath);
        }
    }
};

const startCameraCaptureService = async () => {
    console.log("Camera Capture Service Started (Person + Fight + Smoke Detection)");

    const refreshCameras = async () => {
        cameraQueue = await Camera.find({});
        console.log(`Camera queue updated: ${cameraQueue.length} cameras`);
    };

    await refreshCameras();
    setInterval(refreshCameras, 30000);

    // Process one camera every 4.5 seconds
    setInterval(processNextCamera, 4500);
};

module.exports = { startCameraCaptureService };