"use client";
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [phone, setPhone] = useState(""); 

  // ✅ Your Email is now set here automatically
  const MY_EMAIL = "charanabbagoni926@gmail.com"; 

  const handleFileChange = (e) => {
    if(e.target.files) {
      setFile(e.target.files[0]);
      setResult(null); 
      setOrderStatus("");
    }
  };

  const calculatePrice = async () => {
    if (!file) return alert("Please select a PDF file first!");
    setLoading(true);
    setResult(null); 

    const formData = new FormData();
    formData.append('myFile', file);

    try {
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

  const placeOrder = async () => {
    if (!file) return alert("Please upload a file first!");
    if (!phone || phone.length < 10) return alert("Please enter a valid Phone Number!");
    
    setOrderStatus("Sending...");

    const formData = new FormData();
    formData.append('email', MY_EMAIL); 
    formData.append('_subject', 'New Print Order Received!');
    formData.append('_captcha', 'false'); 
    formData.append('attachment', file);
    // Send Phone Number + File details in the email body
    formData.append('message', `New Order Details:\n\n📄 File: ${file.name}\n📞 Phone: ${phone}\n💰 Estimated Cost: ₹${result.cost}\n📄 Pages: ${result.pages}`);

    try {
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
      
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold mb-4">Step 1: Upload & Check Price</h2>
        <div className="border-2 border-dashed border-gray-300 p-6 mb-4 rounded-lg">
          <input type="file" accept=".pdf" onChange={handleFileChange} />
        </div>
        <button 
          onClick={calculatePrice}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition w-full"
        >
          {loading ? "Calculating..." : "Check Price"}
        </button>
      </div>

      {result && (
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg shadow-md text-left">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-700">Estimated Cost</h2>
            <div className="text-4xl font-bold text-green-700 my-2">₹{result.cost}</div>
            <p className="text-gray-600">{result.pages} Pages x ₹3/page</p>
          </div>
          
          <div className="border-t border-green-200 pt-4">
            <h3 className="font-bold mb-3 text-center">Step 2: Enter Details & Order</h3>
            
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp / Phone Number:</label>
            <input 
              type="tel" 
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <button
              onClick={placeOrder}
              disabled={orderStatus === "Sending..." || orderStatus === "Sent!"}
              className={`w-full py-3 rounded-lg font-bold text-white transition shadow-lg ${
                orderStatus === "Sent!" ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {orderStatus === "Sending..." ? "Sending..." : (orderStatus === "Sent!" ? "Order Sent! ✅" : "Place Order Now")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}