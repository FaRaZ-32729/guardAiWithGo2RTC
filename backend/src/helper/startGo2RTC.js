// const { spawn } = require("child_process");
// const path = require("path");

// let go2rtcProcess = null;

// const startGo2rtcStream = () => {
//     if (go2rtcProcess) {
//         console.log("⚠️ go2rtc already running");
//         return;
//     }

//     const exePath = path.join(__dirname, "go2rtc.exe");
//     const configPath = path.join(__dirname, "go2rtc.yaml");

//     console.log("🎥 Starting go2rtc...");

//     go2rtcProcess = spawn(exePath, ["-c", configPath], {
//         stdio: ["ignore", "pipe", "pipe"]
//     });

//     go2rtcProcess.stdout.on("data", (data) => {
//         console.log(`[go2rtc] ${data.toString()}`);
//     });

//     go2rtcProcess.stderr.on("data", (data) => {
//         console.log(`[go2rtc ERROR] ${data.toString()}`);
//     });

//     go2rtcProcess.on("close", () => {
//         console.log("❌ go2rtc stopped");
//         go2rtcProcess = null;
//     });

//     console.log("✅ go2rtc running at:");
//     console.log("👉 http://localhost:1984/");
//     console.log("👉 Stream: http://localhost:1984/stream.html?src=local_webcam");
// };

// module.exports = { startGo2rtcStream };











// src/helper/startGo2rtc.js   (or keep in root)
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const Camera = require("../models/cameraModel");

let go2rtcProcess = null;

const GO2RTC_PORT = 5000;           // We changed from 1984
const CONFIG_PATH = path.join(__dirname, "../../go2rtc.yaml");

const generateGo2rtcConfig = async () => {
    const cameras = await Camera.find({});

    let streams = {
        local_webcam: [
            "ffmpeg:device?video=1#video=h264#preset=superfast#tune=zerolatency#g=30s"
        ]
    };

    cameras.forEach(cam => {
        const safeName = "cam_" + cam._id.toString().slice(-8); // unique name
        streams[safeName] = [cam.streamUrl];
    });

    const config = {
        api: { listen: `:${GO2RTC_PORT}` },
        rtsp: { listen: ":8554" },
        webrtc: { listen: ":8555" },
        log: { level: "debug" },
        streams
    };

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log(`✅ go2rtc config updated with ${cameras.length} IP cameras + local webcam`);
};

const startGo2rtcStream = async () => {
    if (go2rtcProcess) {
        go2rtcProcess.kill();
        go2rtcProcess = null;
    }

    await generateGo2rtcConfig();

    const exePath = path.join(__dirname, "../../go2rtc.exe");

    console.log("🎥 Starting go2rtc...");

    go2rtcProcess = spawn(exePath, ["-c", CONFIG_PATH], {
        stdio: ["ignore", "pipe", "pipe"]
    });

    go2rtcProcess.stdout.on("data", (data) => {
        console.log(`[go2rtc] ${data.toString().trim()}`);
    });

    go2rtcProcess.stderr.on("data", (data) => {
        console.log(`[go2rtc ERROR] ${data.toString().trim()}`);
    });

    go2rtcProcess.on("close", (code) => {
        console.log(`❌ go2rtc stopped with code ${code}`);
        go2rtcProcess = null;
    });

    console.log(`✅ go2rtc running on port ${GO2RTC_PORT}`);
    console.log(`👉 UI: http://localhost:${GO2RTC_PORT}/`);
};

const restartGo2rtc = async () => {
    console.log("🔄 Restarting go2rtc due to camera change...");
    await startGo2rtcStream();
};

module.exports = { startGo2rtcStream, restartGo2rtc, GO2RTC_PORT };