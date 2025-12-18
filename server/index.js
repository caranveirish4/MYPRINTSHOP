require('dotenv').config();
const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3001;

// 1. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Database Connected!"))
  .catch(err => console.error("❌ Database Error:", err));

// 2. Define Order Schema
const OrderSchema = new mongoose.Schema({
  orderId: String,
  phone: String,
  details: String,
  address: String,
  fileName: String,
  fileData: Buffer, // Stores the PDF binary
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', OrderSchema);

app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
const upload = multer({ storage: multer.memoryStorage() });

app.get('/', (req, res) => res.json({ message: "Print Shop Backend is Live!" }));

// 3. Count Pages Route
app.post('/count', upload.single('myFile'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });
    const data = await pdf(req.file.buffer);
    res.json({ pages: data.numpages, cost: data.numpages * 3 });
  } catch (error) {
    res.status(500).json({ error: "PDF Error" });
  }
});

// 4. Place Order Route (Saves to DB, Skips Email)
app.post('/order', upload.single('attachment'), async (req, res) => {
  try {
    const { orderId, phone, details, address } = req.body;

    const newOrder = new Order({
      orderId,
      phone,
      details,
      address,
      fileName: req.file.originalname,
      fileData: req.file.buffer // Saving file to DB
    });
    
    await newOrder.save();
    console.log(`💾 Order ${orderId} saved to DB!`);

    // ✅ We removed the Email code to prevent crashes
    res.json({ success: true, message: "Order Saved Successfully!" });

  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to save order." });
  }
});

// 5. 🆕 ADMIN: Get All Orders (Without the heavy PDF file)
app.get('/orders', async (req, res) => {
  try {
    // Fetch orders but hide the PDF data to make it fast
    const orders = await Order.find().select('-fileData').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch orders" });
  }
});

// 6. 🆕 ADMIN: Download PDF
app.get('/order/:id/download', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send("Order not found");

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${order.fileName}`);
    res.send(order.fileData);
  } catch (error) {
    res.status(500).send("Error downloading file");
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));