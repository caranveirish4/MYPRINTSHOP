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

// --- 1. SETUP EMAIL FOR OUTLOOK / HOTMAIL ---
const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", // Microsoft's Server
    port: 587,
    secure: false, // false for TLS - which Outlook uses
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        ciphers:'SSLv3' // Helps with handshake compatibility
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
            to: process.env.EMAIL_USER, // Sends to yourself
            subject: '🖨️ New Print Order Received!',
            text: `You have a new order.\n\nFile Name: ${req.file.originalname}\nSize: ${req.file.size} bytes`,
            attachments: [
                {
                    filename: req.file.originalname,
                    content: req.file.buffer
                }
            ]
        };

        console.log("Attempting to send email via Outlook...");
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