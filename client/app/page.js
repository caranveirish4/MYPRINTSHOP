"use client";
import { useState, useRef } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [phone, setPhone] = useState(""); 
  const [orderId, setOrderId] = useState(null);

  const formRef = useRef(null);

  // ✅ YOUR EMAIL
  const MY_EMAIL = "charanabbagoni926@gmail.com"; 
  
  // ✅ YOUR WHATSAPP NUMBER
  const MY_WHATSAPP = "919876543210"; 

  const generateOrderId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `TPS-${randomNum}`;
  };

  const handleFileChange = (e) => {
    if(e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null); 
      setOrderStatus("");
      setOrderId(null);
    }
  };

  const calculatePrice = async (e) => {
    e.preventDefault(); 
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

  const handleOrderSubmit = () => {
    if (!file) return alert("Please upload a file first!");
    if (!phone || phone.length < 10) return alert("Please enter a valid Phone Number!");
    
    const newId = generateOrderId();
    setOrderId(newId);
    setOrderStatus("Sending...");

    const orderIdInput = formRef.current.querySelector('input[name="Order_ID"]');
    if (orderIdInput) orderIdInput.value = newId;

    if(formRef.current) {
        formRef.current.submit();
    }
    
    setTimeout(() => {
        setOrderStatus("Sent!");
    }, 2000);
  };

  const sendWhatsApp = () => {
    if (!orderId) return;
    const message = `Hello! I just placed Order *${orderId}*.\n\n📄 File: ${file.name}\n💰 Amount: ₹${result.cost}\n\nPlease confirm when printed!`;
    const url = `https://wa.me/${MY_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        
        <div className="bg-blue-600 p-6 text-center">
          <h1 className="text-3xl font-bold text-white">Tirupati Print Service 🖨️</h1>
          <p className="text-blue-100 mt-2">Fast & Affordable Document Printing</p>
        </div>

        <div className="p-8">
            
            {orderStatus === "Sent!" ? (
                <div className="text-center animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">✅</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Order Placed!</h2>
                    <p className="text-gray-600 mt-2">Your Order ID:</p>
                    
                    {/* ✅ FIXED SECTION: HIGH CONTRAST ID BOX */}
                    <div className="bg-blue-50 border-2 border-blue-200 text-blue-900 p-4 rounded-lg font-mono text-2xl font-black tracking-widest my-4 select-all shadow-sm">
                        {orderId}
                    </div>

                    <p className="text-sm text-gray-500 mb-6">Current Status: <span className="text-blue-600 font-bold">Doc Sent 📨</span></p>

                    <button 
                        onClick={sendWhatsApp}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition flex items-center justify-center gap-2"
                    >
                        <span>💬</span> Send to WhatsApp
                    </button>
                    <p className="text-xs text-gray-400 mt-3">Click above to notify us instantly!</p>
                </div>
            ) : (
                <>
                    <iframe name="hidden_iframe" style={{display:'none'}}></iframe>
                    <form 
                        ref={formRef}
                        action={`https://formsubmit.co/${MY_EMAIL}`} 
                        method="POST" 
                        encType="multipart/form-data"
                        target="hidden_iframe"
                    >
                        <input type="hidden" name="_subject" value={`New Order ${orderId || ''}`} />
                        <input type="hidden" name="_captcha" value="false" />
                        <input type="hidden" name="_template" value="table" />
                        <input type="hidden" name="Order_ID" value="" />
                        <input type="hidden" name="Order_Details" value={`Cost: ₹${result?.cost || 0} | Pages: ${result?.pages || 0}`} />

                        <div className="mb-6">
                            <label className="block text-gray-700 font-bold mb-2">1. Upload your PDF</label>
                            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition text-center cursor-pointer group">
                            <input 
                                type="file" 
                                name="attachment" 
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

                        {!result && (
                            <button 
                            onClick={calculatePrice}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400"
                            >
                            {loading ? "Calculating..." : "Check Price"}
                            </button>
                        )}

                        {result && (
                            <div className="animate-fade-in-up">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
                                <p className="text-gray-600 text-sm uppercase font-bold tracking-wide">Estimated Cost</p>
                                <h2 className="text-4xl font-extrabold text-green-700 my-1">₹{result.cost}</h2>
                                <p className="text-gray-500 text-sm">{result.pages} Pages x ₹3/page</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 font-bold mb-2">2. Your Phone Number</label>
                                <input 
                                type="tel" 
                                name="Phone_Number"
                                placeholder="e.g. 9876543210"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3"
                                />
                            </div>

                            <button
                                type="button" 
                                onClick={handleOrderSubmit}
                                disabled={orderStatus === "Sending..."}