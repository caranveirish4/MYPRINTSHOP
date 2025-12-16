const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
// No more Nodemailer!

const app = express();
app.use(cors()); 

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Only one route left: Counting Pages
app.post('/count', upload.single('myFile'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });
        
        const pdfDoc = await PDFDocument.load(req.file.buffer);
        const pages = pdfDoc.getPageCount();
        const cost = pages * 3; // ₹3 per page
        
        console.log(`Analyzing file: ${pages} pages`);
        res.json({ pages: pages, cost: cost });
    } catch (error) {
        console.error("PDF Error:", error);
        res.status(500).json({ error: "Failed to analyze PDF" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`);
});