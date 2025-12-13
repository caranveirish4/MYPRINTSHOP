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

app.post('/count', upload.single('myFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log("------------------------------------------------");
        console.log(`📄 ANALYZING FILE: ${req.file.originalname}`);
        console.log(`⚖️  Size: ${req.file.size} bytes`);

        // READ THE RAW BYTES
        const dataBuffer = fs.readFileSync(req.file.path);
        
        // PEEK AT THE FIRST 20 CHARACTERS
        // A real PDF must start with "%PDF"
        const headerPreview = dataBuffer.toString('utf8', 0, 20);
        console.log(`🔍 First 20 chars: "${headerPreview}"`);
        console.log("------------------------------------------------");

        // Try to load it
        const pdfDoc = await PDFDocument.load(dataBuffer, { ignoreEncryption: true });
        const pages = pdfDoc.getPageCount();
        const totalCost = pages * 3;

        console.log(`✅ Success! Pages: ${pages}`);
        fs.unlinkSync(req.file.path);
        res.json({ pages: pages, cost: totalCost });

    } catch (error) {
        console.log("❌ ERROR:", error.message);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.json({ error: "Invalid PDF. Check terminal for details." });
    }
});

app.listen(5000, () => {
    console.log("🚀 DEBUG SERVER RUNNING ON PORT 5000");
});