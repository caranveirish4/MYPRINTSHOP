require('dotenv').config();
const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose'); // Database tool

const app = express();
const port = process.env.PORT || 3001;

// 1. Connect to MongoDB (The Secure Way)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Database Connected!"))
  .catch(err => console.error("❌ Database Error:", err));

// 2. Define what an "Order" looks like
const OrderSchema = new mongoose.Schema({
  orderId: String,
  phone: String,
  details: String,
  address: String,
  fileName: String,
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', OrderSchema);

app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
const upload = multer({ storage: multer.memoryStorage() });

// 3. Email Setup (Also Secure)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'charanabbagoni926@gmail.com',
    pass: process.env.EMAIL_PASS // <--- Hidden Password
  }
});

app.get('/', (req, res) => res.json({ message: "Print Shop Backend is Live!" }));

app.post('/count', upload.single('myFile'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });
    const data = await pdf(req.file.buffer);
    res.json({ pages: data.numpages, cost: data.numpages * 3 });
  } catch (error) {
    res.status(500).json({ error: "PDF Error" });
  }
});

// 4. The "Master" Order Route (Database + Email)
app.post('/order', upload.single('attachment'), async (req, res) => {
  try {
    const { orderId, phone, details, address } = req.body;

    // A. Save to Database
    const newOrder = new Order({
      orderId,
      phone,
      details,
      address,
      fileName: req.file.originalname
    });
    await newOrder.save();
    console.log(`💾 Order ${orderId} saved to DB!`);

    // B. Send Email
    await transporter.sendMail({
      from: '"Print Shop" <charanabbagoni926@gmail.com>',
      to: 'charanabbagoni926@gmail.com',
      subject: `🔥 New Order: ${orderId}`,
      text: `Order ID: ${orderId}\nPhone: ${phone}\nDetails: ${details}\n\nAddress:\n${address}`,
      attachments: [{ filename: req.file.originalname, content: req.file.buffer }]
    });

    res.json({ success: true, message: "Order Saved & Sent!" });
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to process order." });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));