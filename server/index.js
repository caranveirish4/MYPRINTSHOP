const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

const upload = multer({ storage: multer.memoryStorage() });

// ✅ FIXED EMAIL CONFIGURATION
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'charanabbagoni926@gmail.com',
    pass: 'dfvb ywzu ieku jchd' 
  }
});

app.get('/', (req, res) => {
  res.json({ message: "✅ Backend is ONLINE and Running!" });
});

app.post('/count', upload.single('myFile'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const data = await pdf(req.file.buffer);
    const pages = data.numpages;
    res.json({ pages: pages, cost: pages * 3 });
  } catch (error) {
    res.status(500).json({ error: "Could not read PDF." });
  }
});

app.post('/order', upload.single('attachment'), async (req, res) => {
  try {
    const { orderId, phone, details, address } = req.body;
    
    const mailOptions = {
      from: '"Tirupati Print Bot" <charanabbagoni926@gmail.com>',
      to: 'charanabbagoni926@gmail.com', 
      subject: `🔥 New Order: ${orderId}`,
      text: `
      📦 NEW ORDER RECEIVED
      ---------------------
      🆔 Order ID: ${orderId}
      📱 Phone: ${phone}
      💰 Details: ${details}
      
      📍 Delivery Address:
      ${address}
      `,
      attachments: [
        {
          filename: req.file.originalname,
          content: req.file.buffer
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order ${orderId} sent successfully!`);
    res.json({ success: true, message: "Order placed successfully!" });

  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ success: false, message: "Server failed to send email." });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});