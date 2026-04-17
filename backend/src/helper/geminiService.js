const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Student = require('../models/userModel');
const { generateChallan } = require('../controllers/challanController');
const compressImageToBase64 = require('../middleware/compressFrames');

let cachedStudents = [];

const loadStudents = async () => {
    cachedStudents = await Student.find({});
    console.log(`Students cached in memory: ${cachedStudents.length} students loaded`);
};

const processWithGemini = async (cameraFramePath, camera) => {
    let snapshotPath = null;
    try {
        console.log("Sending frame to OpenAI...");

        snapshotPath = cameraFramePath.replace('.jpg', `_snapshot_${Date.now()}.jpg`);
        fs.copyFileSync(cameraFramePath, snapshotPath);

        const students = cachedStudents;

        if (students.length === 0) {
            console.warn("No students loaded in cache! Make sure loadStudents() is called on startup.");
        }

        // Compress camera frame
        const cameraBase64 = await compressImageToBase64(snapshotPath);

        const promptText = `
You are an extremely accurate, highly cautious, and responsible school surveillance AI specialized in facial recognition and behavior detection.

## YOUR CRITICAL RESPONSIBILITY:
Analyze the provided camera frame and carefully compare every visible face with the registered student photos.

## STRICT FACIAL MATCHING RULES - MUST FOLLOW:
1. Examine every facial detail with high attention:
   - Face shape, jawline, forehead, cheekbones
   - Eyes (shape, size, spacing, eye color)
   - Nose (shape, width, nostrils)
   - Mouth, lips, and teeth (when visible)
   - Eyebrows (shape, thickness, position)
   - Skin tone, hair style/color, ears, any moles, scars, or marks
   - Overall facial proportions and structure

2. Only declare a match if you are **90% or higher confident**. 
   Even small doubts must result in "Anonymous".

3. Never guess or hallucinate identities.

4. If no clear human faces are visible, return an empty array [].

## ACTION DETECTION (Be Very Alert):
- "smoking" → clearly holding or smoking a cigarette, vape, cigar, or any smoking device (even if not lit)
- "fighting" → any form of physical aggression including:
   - Punching, slapping, kicking, pushing, grabbing, shoving
   - Wrestling, aggressive physical contact with another person
   - Raised fists, aggressive stance, or fighting posture
   - Two or more people in physical conflict
- "normal" → no suspicious or aggressive activity

## SEVERITY LEVEL:
- "high" → smoking or fighting
- "low" → normal behavior

## OUTPUT FORMAT:
Return **ONLY** a valid JSON array. No explanations, no markdown, no extra text.

[
  {
    "matched": true or false,
    "name": "Full Student Name" or "Anonymous",
    "rollNo": "student roll number" or "N/A",
    "action": "smoking" | "fighting" | "normal",
    "severity": "high" | "low",
    "confidence": "92%" or "65%",
    "description": "One short, clear sentence describing exactly what this person is doing"
  }
]

## FINAL IMPORTANT INSTRUCTIONS:
- Be extremely strict and conservative with facial matching.
- Be highly sensitive and accurate when detecting fighting and smoking.
- When in doubt about identity, always choose "Anonymous".
- Analyze the camera frame first, then compare with all registered students.

Now carefully analyze the camera frame and return only the JSON array.
`;

        // Prepare messages for OpenAI
        const messages = [
            { role: "system", content: "You are a highly accurate school surveillance AI. Always respond with valid JSON only." },
            {
                role: "user",
                content: [
                    { type: "text", text: promptText },
                    {
                        type: "image_url",
                        image_url: { url: `data:image/jpeg;base64,${cameraBase64}` }
                    },
                    { type: "text", text: "Here is the camera frame. Now compare with registered students below:" }
                ]
            }
        ];

        // Add all registered student images with logging
        for (const student of students) {
            const studentImagePath = path.join(__dirname, "../../uploads", `${student.studentRollNumber}.jpeg`);

            if (fs.existsSync(studentImagePath)) {
                const studentBase64 = await compressImageToBase64(studentImagePath);

                console.log(`Loaded student image: ${student.name} | RollNo: ${student.studentRollNumber} | Size: ${studentBase64.length} bytes`);

                messages.push({
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Registered Student: ${student.name} | Roll No: ${student.studentRollNumber}`
                        },
                        {
                            type: "image_url",
                            image_url: { url: `data:image/jpeg;base64,${studentBase64}` }
                        }
                    ]
                });
            } else {
                console.warn(`Student image NOT found: ${student.name}, RollNo: ${student.studentRollNumber}`);
            }
        }

        // Final instruction
        messages.push({
            role: "user",
            content: "Now analyze the camera frame carefully, match faces, detect actions, and return ONLY the JSON array as specified."
        });

        // Call OpenAI
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o",
                messages: messages,
                max_tokens: 1500,
                temperature: 0.1
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const text = response.data.choices[0].message.content;
        console.log("Raw OpenAI Response:", text);

        // Parse JSON
        let parsed;
        try {
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            parsed = JSON.parse(cleanText);

            if (!Array.isArray(parsed)) {
                parsed = [parsed];
            }
        } catch (err) {
            console.error("Invalid JSON from OpenAI:", err.message);
            return null;
        }

        console.log("Parsed OpenAI JSON:", parsed);

        // Generate challan
        for (const result of parsed) {
            await generateChallan(result, snapshotPath);
        }

        // Cleanup
        if (fs.existsSync(snapshotPath)) {
            fs.unlinkSync(snapshotPath);
            console.log("Snapshot deleted:", snapshotPath);
        }

        return parsed;

    } catch (error) {
        if (snapshotPath && fs.existsSync(snapshotPath)) {
            fs.unlinkSync(snapshotPath);
        }

        console.error("OpenAI API Error:", error.response ? error.response.data : error.message);
        return null;
    }
};

module.exports = { processWithGemini, loadStudents };