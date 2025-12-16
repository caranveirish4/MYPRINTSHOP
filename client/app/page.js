"use client";
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");

  // 🔴 IMPORTANT: REPLACE THIS WITH YOUR REAL EMAIL ADDRESS 🔴
  const MY_EMAIL = "YOUR_REAL_EMAIL@gmail.com"; 

  const handleFileChange = (e) => {
    if(e.target.files) {
      setFile(e.target.files[0]);
      setResult(null); 
      setOrderStatus("");
    }
  };

  // 1. Calculate Price (Talks to Backend)
  const calculatePrice = async () => {
    if (!file) return alert("Please select a PDF file first!");
    setLoading(true);
    setResult(null); 

    const formData = new FormData();
    formData.append('myFile', file);

    try {
      // Note: Make sure this URL matches your Render Backend URL exactly
      const response = await fetch('https://myprintshopbackend.onrender.com/count', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();

      if (data.error) {
        alert("⚠️ Server Error: " + data.error);
      } else {
        setResult(data);
      }
    
    } catch (error) {
      alert("❌ Connection Error: Backend is not reachable.");
    }
    setLoading(false);
  };

  // 2. Place Order (Talks DIRECTLY to Email Service)
  const placeOrder = async () => {
    if (!file) return alert("Please upload a file first!");
    setOrderStatus("Sending...");

    const formData = new FormData();
    // Configure FormSubmit settings
    formData.append('email', MY_EMAIL); 
    formData.append('_subject', 'New Print Order Received!');
    formData.append('_captcha', 'false'); // Disable captcha puzzle
    formData.append('attachment', file);
    formData.append('message', `You have a new order. File Name: ${file.name}`);

    try {
      // Send directly to FormSubmit
      const response = await fetch(`https://formsubmit.co/ajax/${MY_EMAIL}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert("✅ Order placed successfully! Check your email.");
        setOrderStatus("Sent!");
      } else {
        alert("❌ Failed to send email.");
        setOrderStatus("Failed");
      }
    } catch (error) {
      console.error(error);
      alert("Error placing order.");
      setOrderStatus("Error");
    }
  };

  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)] max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Tirupati Print Service 🖨️</h1>
      <p className="mb-6">Upload your PDF below.</p>

      <div className="border-2 border-dashed border-gray-300 p-8 mb-6 rounded-lg">
        <input type="file" accept=".pdf" onChange={handleFileChange} />
      </div>

      <button 
        onClick={calculatePrice}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {loading ? "Calculating..." : "Check Price"}
      </button>

      {result && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-xl font-bold">Pages: {result.pages}</h2>
          <h2 className="text-2xl font-bold text-green-700 my-2">Total Cost: ₹{result.cost}</h2>
          <p className="text-sm text-gray-600 mb-4">Delivery: <b>Free</b> (6 PM - 9 PM)</p>
          
          <button
            onClick={placeOrder}
            disabled={orderStatus === "Sending..." || orderStatus === "Sent!"}
            className={`w-full py-3 rounded font-bold text-white transition ${
              orderStatus === "Sent!" ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {orderStatus === "Sending..." ? "Sending..." : (orderStatus === "Sent!" ? "Order Sent!" : "Place Order")}
          </button>
        </div>
      )}
    </div>
  );
}