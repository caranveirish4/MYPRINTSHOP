const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const cors = require('cors'); // ✅ IMPORT CORS

const app = express();
const port = process.env.PORT || 3001;

// ✅ CRITICAL FIX: Allow frontend to connect
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

const upload = multer({ storage: multer.memoryStorage() });

// 1. Health Check Route (To wake up server)
app.get('/', (req, res) => {
  res.json({ message: "✅ Backend is ONLINE and Running!" });
});

// 2. Count Pages Route
app.post('/count', upload.single('myFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const data = await pdf(req.file.buffer);
    const pages = data.numpages;
    const cost = pages * 3; // ₹3 per page

    console.log(`Processed: ${pages} pages. Cost: ₹${cost}`);
    res.json({ pages: pages, cost: cost });

  } catch (error) {
    console.error("PDF Error:", error);
    res.status(500).json({ error: "Could not read PDF file." });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});