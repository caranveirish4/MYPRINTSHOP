const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Good practice to have, just in case

const app = express();

// 1. Enable CORS (Allows your Frontend to talk to this Backend)
app.use(cors()); 

// 2. Configure Uploads to use MEMORY (RAM) instead of Disk
// This is crucial for "req.file.buffer" to work in the email
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- ROUTE 1: Count Pages (For the "Check Price" button) ---
app.post('/count', upload.single('myFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Load the PDF from memory
        const pdfDoc = await PDFDocument.load(req.file.buffer);
        const pages = pdfDoc.getPageCount();

        // Calculate Price (Example: ₹3 per page)
        const cost = pages * 3;

        res.json({ pages: pages, cost: cost });

    } catch (error) {
        console.error("PDF Error:", error);
        res.status(500).json({ error: "Failed to analyze PDF. Is it a valid PDF?" });
    }
});

// --- ROUTE 2: Place Order (For the "Place Order" button) ---
app.post('/order', upload.single('myFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Setup the email sender
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Define the email details
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to yourself
            subject: '🖨️ New Print Order Received!',
            text: `You have a new order.\n\nFile Name: ${req.file.originalname}\nSize: ${req.file.size} bytes`,
            attachments: [
                {
                    filename: req.file.originalname,
                    content: req.file.buffer // This now works because we used memoryStorage()
                }
            ]
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        res.json({ message: "Order placed successfully!" });

    } catch (error) {
        console.error("Email Error:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`);
});