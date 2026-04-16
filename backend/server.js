const express = require("express");
require("dotenv").config();
const dbConfig = require("./src/config/dbConfig");
const centralRoute = require("./src/routes/centralRoute");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const { loadStudents } = require("./src/helper/geminiService");
const { startGo2rtcStream } = require("./src/helper/startGo2RTC");
const { startCameraCaptureService } = require("./src/helper/cameraCaptureService");


dbConfig();
const port = process.env.PORT || 5051;
const app = express();

// Middlewares
const allowedOrigins = [
    "http://localhost:5173"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));


app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/captures', express.static(path.join(__dirname, 'public', 'captures')));
app.use('/violations', express.static(path.join(__dirname, 'violations')));

startGo2rtcStream();
startCameraCaptureService();

// Routes
app.use("/api", centralRoute)


app.get("/", (req, res) => {
    res.send("Hellow FaRaZ to IOTFIY-AI-Guard");
});

(async () => {
    await loadStudents();
})();





// Start server
app.listen(port, () => {
    console.log(`AI-Guard Server is running on port : ${port}`);
});