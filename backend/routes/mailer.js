const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "your-email@gmail.com",
        pass: "your-password"
    }
});

async function sendEmail(to, subject, text) {
    await transporter.sendMail({
        from: "your-email@gmail.com",
        to,
        subject,
        text
    });
}

module.exports = { sendEmail };
