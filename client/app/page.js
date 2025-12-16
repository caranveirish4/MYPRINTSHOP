"use client";
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [phone, setPhone] = useState(""); 

  // ✅ Your Email is set here
  const MY_EMAIL = "charanabbagoni926@gmail.com"; 

  const handleFileChange = (e) => {
    if(e.target.files && e.target.files[0]) {
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-blue-600 p-6 text-center">
          <h1 className="text-3xl font-bold text-white">Tirupati Print Service 🖨️</h1>
          <p className="text-blue-100 mt-2">Fast & Affordable Document Printing</p>
        </div>

        <div className="p-8">
          
          {/* Step 1: File Upload */}
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">1. Upload your PDF</label>
            
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition text-center cursor-pointer group">
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-gray-500 group-hover:text-blue-600">
                <p className="text-2xl mb-2">📂</p>
                <p className="font-medium text-sm">
                  {file ? `Selected: ${file.name}` : "Click or Drag PDF here"}
                </p>
              </div>
            </div>
          </div>

          {/* Check Price Button */}
          {!result && (
            <button 
              onClick={calculatePrice}
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400"
            >
              {loading ? "Calculating Pages..." : "Check Price"}
            </button>
          )}

          {/* Result & Order Form */}
          {result && (
            <div className="animate-fade-in-up">
              {/* Cost Display */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
                <p className="text-gray-600 text-sm uppercase font-bold tracking-wide">Estimated Cost</p>
                <h2 className="text-4xl font-extrabold text-green-700 my-1">₹{result.cost}</h2>
                <p className="text-gray-500 text-sm">{result.pages} Pages x ₹3/page</p>
              </div>

              {/* Step 2: Phone Input */}
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2">2. Your WhatsApp Number</label>
                <input 
                  type="tel" 
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3"
                />
              </div>

              {/* Final Place Order Button */}
              <button
                onClick={placeOrder}
                disabled={orderStatus === "Sending..." || orderStatus === "Sent!"}
                className={`w-full font-bold py-4 rounded-lg shadow-lg text-white transition transform active:scale-95 ${
                  orderStatus === "Sent!" 
                    ? "bg-gray-500 cursor-not-allowed" 
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {orderStatus === "Sending..." ? "Sending Order..." : (orderStatus === "Sent!" ? "✅ Order Sent Successfully!" : "🚀 Place Order Now")}
              </button>
            </div>
          )}

        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-500">© 2024 Tirupati Print Service</p>
        </div>
      </div>
    </div>
  );
}