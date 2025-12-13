const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

const app = express();
app.use(cors());

const upload = multer({ dest: 'uploads/' });

if (!fs.existsSync('uploads')){
    fs.mkdirSync('uploads');
}

const nodemailer = require('nodemailer');

// This route handles the actual order
app.post('/order', upload.single('myFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // 1. Setup the email sender
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // 2. Define the email details
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Sends the email to yourself
            subject: 'New Print Order Received!',
            text: `You have a new order.\n\nFile Name: ${req.file.originalname}`,
            attachments: [
                {
                    filename: req.file.originalname,
                    content: req.file.buffer
                }
            ]
        };

        // 3. Send the email
        await transporter.sendMail(mailOptions);

        res.json({ message: "Order placed successfully! Check your email." });

    } catch (error) {
        console.error("Email Error:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});

app.listen(5000, () => {
    console.log("🚀 DEBUG SERVER RUNNING ON PORT 5000");
});