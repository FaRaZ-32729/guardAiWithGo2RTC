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

// Roboflow Person Detection
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
        console.error("Roboflow Error:", err.message);
        return false;
    }
};

// Take snapshot using go2rtc (very fast)
const takeSnapshot = async (streamName) => {
    const outputPath = path.join(captureDir, `camera_${Date.now()}.jpg`);

    try {
        const response = await axios({
            method: 'GET',
            url: `${GO2RTC_URL}/api/frame.jpeg?src=${streamName}&cache=0`,
            responseType: 'arraybuffer'
        });

        fs.writeFileSync(outputPath, response.data);
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

    const streamName = camera.cameraName === "Local Webcam" 
        ? "local_webcam" 
        : `cam_${camera._id.toString().slice(-8)}`;

    console.log(`📸 Capturing: ${camera.cameraName} (${streamName})`);

    const snapshotPath = await takeSnapshot(streamName);
    if (!snapshotPath) return;

    isGeminiProcessing = true;

    try {
        const personDetected = await containsPerson(snapshotPath);
        if (personDetected) {
            console.log(`🚨 Person found → Sending to Gemini`);
            await processWithGemini(snapshotPath, camera);
        }
    } catch (err) {
        console.error("Processing Error:", err.message);
    } finally {
        isGeminiProcessing = false;
        // Optional: delete old snapshot after processing
        if (fs.existsSync(snapshotPath)) fs.unlinkSync(snapshotPath);
    }
};

const startCameraCaptureService = async () => {
    console.log("🚀 New Camera Capture Service (go2rtc) Started");

    const refreshCameras = async () => {
        cameraQueue = await Camera.find({});
        console.log(`📋 Camera queue updated: ${cameraQueue.length} cameras`);
    };

    await refreshCameras();
    setInterval(refreshCameras, 30000);

    // Process one camera every 4-5 seconds
    setInterval(processNextCamera, 4500);
};

module.exports = { startCameraCaptureService };