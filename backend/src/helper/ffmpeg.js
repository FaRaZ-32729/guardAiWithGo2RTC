// const ffmpeg = require('fluent-ffmpeg');
// const fs = require('fs');
// const path = require('path');
// const axios = require('axios');
// const Camera = require('../models/cameraModel');
// const { processWithGemini } = require('./geminiService');

// ffmpeg.setFfmpegPath('C:\\ProgramData\\ffmpeg-8.0.1-essentials_build\\bin\\ffmpeg.exe');

// const captureDir = path.join(__dirname, 'public', 'captures');
// if (!fs.existsSync(captureDir)) {
//     fs.mkdirSync(captureDir, { recursive: true });
// }

// let isGeminiProcessing = false;
// let cameraQueue = [];
// let currentQueueIndex = 0;

// // roboflow universe api 
// const containsPerson = async (imagePath) => {
//     try {
//         const image = fs.readFileSync(imagePath, { encoding: "base64" });

//         const response = await axios({
//             method: "POST",
//             url: "https://serverless.roboflow.com/face-i3ibd/1",
//             params: { api_key: "5AClPrAwkdK3SDazhOji" },
//             data: image,
//             headers: { "Content-Type": "application/x-www-form-urlencoded" }
//         });

//         const predictions = response.data.predictions || [];
//         console.log(predictions, ">>>>>")
//         const personFound = predictions.length > 0;

//         console.log(personFound
//             ? ` Person detected (${predictions.length} found) → sending to Gemini`
//             : ` No person detected → skipping Gemini`
//         );

//         return personFound;

//     } catch (err) {
//         console.error("Roboflow Detection Error:", err.message);
//         return false;
//     }
// };

// const captureFrame = (camera) => {
//     return new Promise((resolve) => {
//         const filename = `camera_${camera._id}.jpg`;
//         const outputPath = path.join(captureDir, filename);
//         const isRtsp = camera.streamUrl.toLowerCase().startsWith('rtsp://');

//         // Skip if Gemini is busy
//         if (isGeminiProcessing) {
//             console.log(`Gemini busy → skipping capture for ${camera.cameraName}`);
//             return resolve();
//         }

//         let command = ffmpeg(camera.streamUrl)
//             .outputOptions(['-frames:v 1', '-q:v 2', '-update 1']);

//         if (isRtsp) {
//             command.inputOptions(['-rtsp_transport tcp', '-timeout 10000000']);
//         } else {
//             command.inputOptions(['-re', '-timeout 10000000']);
//         }

//         command
//             .output(outputPath)
//             .on('end', async () => {
//                 console.log(` Screenshot saved for ${camera.cameraName}: ${filename}`);

//                 isGeminiProcessing = true; 

//                 try {
//                     const personDetected = await containsPerson(outputPath);
//                     if (!personDetected) return;

//                     console.log(`Processing ${camera.cameraName} with Gemini...`);
//                     await processWithGemini(outputPath, camera);

//                 } catch (err) {
//                     console.error(`Gemini Processing Error for ${camera.cameraName}:`, err.message);
//                 } finally {
//                     isGeminiProcessing = false;
//                     console.log(`Gemini unlocked after processing ${camera.cameraName}`);
//                     await new Promise(r => setTimeout(r, 1000)); // cooldown
//                     resolve();
//                 }
//             })
//             .on('error', (err) => {
//                 console.error(`Error capturing frame for ${camera.cameraName}:`, err.message);
//                 isGeminiProcessing = false;
//                 resolve();
//             })
//             .run();
//     });
// };

// // Process cameras one by one in a cycle
// const processCameraQueue = async () => {
//     if (cameraQueue.length === 0) return;

//     // Get next camera in cycle
//     if (currentQueueIndex >= cameraQueue.length) {
//         currentQueueIndex = 0; // reset to start
//     }

//     const camera = cameraQueue[currentQueueIndex];
//     currentQueueIndex++;

//     console.log(`Camera turn: ${camera.cameraName} (${currentQueueIndex}/${cameraQueue.length})`);
//     await captureFrame(camera);
// };

// const startCameraCaptureService = () => {
//     console.log('Camera Capture Service Started');

//     // Refresh camera list every 30 seconds
//     const refreshCameras = async () => {
//         try {
//             cameraQueue = await Camera.find({});
//             console.log(`Camera queue refreshed: ${cameraQueue.length} cameras`);
//         } catch (err) {
//             console.error('Error fetching cameras:', err.message);
//         }
//     };

//     refreshCameras();
//     setInterval(refreshCameras, 30000);

//     // Process one camera every 3 seconds in round-robin
//     setInterval(async () => {
//         await processCameraQueue();
//     }, 5000);
// };

// module.exports = { startCameraCaptureService };