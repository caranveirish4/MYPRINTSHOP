"use client";
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [phone, setPhone] = useState(""); 
  const [orderId, setOrderId] = useState(null);
  
  const [locationLink, setLocationLink] = useState("");
  const [addressDetails, setAddressDetails] = useState({
    hostel: "",
    room: "",
    instructions: ""
  });
  const [locLoading, setLocLoading] = useState(false);

  // ✅ Your WhatsApp Number
  const MY_WHATSAPP = "917995460846"; 

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

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported.");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition((position) => {
      const link = `http://googleusercontent.com/maps.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
      setLocationLink(link);
      setLocLoading(false);
    }, () => {
      alert("Unable to retrieve location.");
      setLocLoading(false);
    });
  };

  const calculatePrice = async (e) => {
    e.preventDefault(); 
    if (!file) return alert("Please select a PDF file first!");
    setLoading(true);
    setResult(null); 

    const formData = new FormData();
    formData.append('myFile', file);

    try {
      // 1. Calculate Price
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
      alert("Server is waking up. Try again in 10 seconds.");
    }
    setLoading(false);
  };

  // ✅ THE IMPORTANT PART: Sends Data to Your DB + Email
  const handleOrderSubmit = async () => {
    if (!file) return alert("Please upload a file!");
    if (!phone || phone.length < 10) return alert("Enter valid Phone Number");
    if (!addressDetails.hostel) return alert("Enter Hostel/Room");

    const newId = generateOrderId();
    setOrderStatus("Sending...");

    const fullAddress = `📍 GPS: ${locationLink || "Not Shared"} | 🏠 ${addressDetails.hostel}, Room ${addressDetails.room} | 📝 ${addressDetails.instructions}`;

    const formData = new FormData();
    formData.append("orderId", newId);
    formData.append("phone", phone);
    formData.append("details", `Cost: ₹${result.cost} | Pages: ${result.pages}`);
    formData.append("address", fullAddress);
    formData.append("attachment", file); 

    try {
      // 🚀 Send to YOUR Secure Backend
      const response = await fetch("https://myprintshopbackend.onrender.com/order", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setOrderId(newId);
        setOrderStatus("Sent!");
      } else {
        alert("❌ Error: " + data.message);
        setOrderStatus("");
      }

    } catch (error) {
      alert("❌ Network Error. Please try again.");
      console.error(error);
      setOrderStatus("");
    }
  };

  const sendWhatsApp = () => {
    if (!orderId) return;
    const message = `Hello! Order *${orderId}*.\nFile: ${file.name}\nAmount: ₹${result.cost}\nLoc: ${addressDetails.hostel}, ${addressDetails.room}`;
    const url = `https://wa.me/${MY_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-6 text-center text-white">
          <h1 className="text-2xl font-bold">Tirupati Print Service</h1>
        </div>

        <div className="p-6">
            {orderStatus === "Sent!" ? (
                <div className="text-center animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">✅</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Order Success!</h2>
                    <p className="text-gray-500 mb-4">Saved to Database & Emailed.</p>
                    <div className="bg-gray-800 text-white p-4 rounded mb-4">
                        <p className="text-xs uppercase text-gray-400">Order ID</p>
                        <p className="font-mono text-2xl font-bold">{orderId}</p>
                    </div>
                    <button onClick={sendWhatsApp} className="w-full bg-green-500 text-white font-bold py-3 rounded shadow hover:bg-green-600">
                        💬 Send on WhatsApp
                    </button>
                </div>
            ) : (
                <>
                    <div className="mb-6">
                        <label className="block font-bold mb-2">1. Upload PDF</label>
                        <input type="file" accept=".pdf" onChange={handleFileChange} className="w-full p-2 border rounded bg-gray-50" />
                    </div>

                    {!result && (
                        <button onClick={calculatePrice} disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded shadow hover:bg-blue-700">
                        {loading ? "Calculating..." : "Check Price"}
                        </button>
                    )}

                    {result && (
                        <div className="animate-fade-in-up">
                            <div className="bg-green-50 p-4 rounded text-center mb-6 border border-green-200">
                                <h2 className="text-3xl font-bold text-green-700">₹{result.cost}</h2>
                                <p className="text-sm text-green-800">{result.pages} Pages</p>
                            </div>

                            <div className="space-y-3 mb-6">
                                <button onClick={getLocation} className="w-full py-2 border-2 border-blue-500 text-blue-600 rounded font-bold">
                                    {locLoading ? "..." : (locationLink ? "✅ Location Pinned" : "📍 Pin Location")}
                                </button>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" placeholder="Hostel" className="border p-2 rounded" onChange={(e) => setAddressDetails({...addressDetails, hostel: e.target.value})} />
                                    <input type="text" placeholder="Room" className="border p-2 rounded" onChange={(e) => setAddressDetails({...addressDetails, room: e.target.value})} />
                                </div>
                                <input type="tel" placeholder="Phone Number" className="w-full border p-2 rounded" onChange={(e) => setPhone(e.target.value)} />
                            </div>

                            <button onClick={handleOrderSubmit} disabled={orderStatus === "Sending..."} className="w-full bg-black text-white font-bold py-4 rounded text-lg shadow-lg">
                                {orderStatus === "Sending..." ? "Processing..." : "🚀 Place Order"}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
      </div>
    </div>
  );
}