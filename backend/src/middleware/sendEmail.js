const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT == 465,
    family: 4,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendEmail = async (to, subject, html,) => {
    try {
        await transporter.sendMail({
            from: `"AI-Guard" <developer@iotfiysolutions.com>`,
            to,
            subject,
            html,
        });

        console.log("Email sent ✔");
    } catch (err) {
        console.error("Email error:", err);
        throw err;
    }
};

module.exports = sendEmail;