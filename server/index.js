const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const nodemailer = require('nodemailer');
require('dotenv').config(); 

const app = express();

app.use(cors()); 

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- 1. SETUP EMAIL WITH DIAGNOSTIC LOGGING ---
// We use the 'service' shorthand which handles ports automatically
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    logger: true, // Log information to console
    debug: true   // Include SMTP traffic in logs
});

// --- 2. IMMEDIATE CONNECTION TEST ---
// This runs the moment the server starts!
transporter.verify(function (error, success) {
    if (error) {
        console.log("❌ CRITICAL ERROR: Server cannot connect to Gmail!");
        console.log(error);
    } else {
        console.log("✅ SUCCESS: Server is ready to send emails.");
    }
});

app.post('/count', upload.single('myFile'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });
        const pdfDoc = await PDFDocument.load(req.file.buffer);
        const pages = pdfDoc.getPageCount();
        const cost = pages * 3;
        res.json({ pages: pages, cost: cost });
    } catch (error) {
        console.error("PDF Error:", error);
        res.status(500).json({ error: "Failed to analyze PDF" });
    }
});

app.post('/order', upload.single('myFile'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: '🖨️ New Print Order Received!',
            text: `You have a new order.\n\nFile Name: ${req.file.originalname}\nSize: ${req.file.size} bytes`,
            attachments: [
                {
                    filename: req.file.originalname,
                    content: req.file.buffer
                }
            ]
        };

        console.log("Attempting to send email...");
        await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully!");
        res.json({ message: "Order placed successfully!" });

    } catch (error) {
        console.error("❌ Email Error:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`);
});