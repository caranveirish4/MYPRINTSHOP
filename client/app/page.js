"use client";
import { useState, useRef } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [phone, setPhone] = useState(""); 
  const [orderId, setOrderId] = useState(null);
  
  // Address States
  const [locationLink, setLocationLink] = useState("");
  const [addressDetails, setAddressDetails] = useState({
    hostel: "",
    room: "",
    instructions: ""
  });
  const [locLoading, setLocLoading] = useState(false);

  const formRef = useRef(null);

  // ✅ YOUR WEB3FORMS ACCESS KEY
  const ACCESS_KEY = "57e361ef-3817-4d9f-95c1-e5cdaf4a7d3f"; 

  // ✅ YOUR WHATSAPP NUMBER
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

  // ✅ FIXED: This function now generates a working Google Maps link
  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition((position) => {
      // This is the correct format that opens in the Google Maps App
      const link = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
      setLocationLink(link);
      setLocLoading(false);
    }, () => {
      alert("Unable to retrieve location. Please type it manually.");
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
      alert("💤 The server is waking up! Please wait 30 seconds and click 'Check Price' again.");
      console.error(error);
    }
    setLoading(false);
  };

  const handleOrderSubmit = () => {
    if (!file) return alert("Please upload a file first!");
    if (!phone || phone.length < 10) return alert("Please enter a valid Phone Number!");
    if (!addressDetails.hostel || !addressDetails.room) return alert("Please enter your Hostel/Building and Room Number.");

    const newId = generateOrderId();
    setOrderId(newId);
    setOrderStatus("Sending...");

    const orderIdInput = formRef.current.querySelector('input[name="subject"]');
    if (orderIdInput) orderIdInput.value = `New Order ${newId}`;

    const fullAddress = `
    📍 GPS: ${locationLink || "Not Shared"}
    🏠 Address: ${addressDetails.hostel}, Room ${addressDetails.room}
    📝 Note: ${addressDetails.instructions || "None"}
    `;
    
    const addressInput = formRef.current.querySelector('input[name="Address_Full"]');
    if (addressInput) addressInput.value = fullAddress;

    if(formRef.current) {
        formRef.current.submit();
    }
    
    setTimeout(() => {
        setOrderStatus("Sent!");
    }, 2500);
  };

  const sendWhatsApp = () => {
    if (!orderId) return;
    const message = `Hello! I just placed Order *${orderId}*.\n\n📄 File: ${file.name}\n💰 Amount: ₹${result.cost}\n\n📍 *Delivery Location:*\n${addressDetails.hostel}, Room ${addressDetails.room}\n${locationLink ? `🔗 Map: ${locationLink}` : ''}\n\nPlease confirm!`;
    const url = `https://wa.me/${MY_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 sm:p-6 font-sans text-gray-800">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 blur-xl"></div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight relative z-10">Tirupati Print Service</h1>
          <p className="text-blue-100 mt-2 font-medium relative z-10">Premium Printing • Student Prices</p>
        </div>

        <div className="p-8">
            
            {orderStatus === "Sent!" ? (
                <div className="text-center animate-fade-in-up">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <span className="text-5xl">✅</span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Order Success!</h2>
                    <p className="text-gray-500 mb-6">We have received your file.</p>
                    
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg transform rotate-1 hover:rotate-0 transition duration-300">
                        <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Your Order ID</p>
                        <p className="font-mono text-3xl font-black tracking-wider select-all">{orderId}</p>
                    </div>

                    <p className="text-sm text-gray-500 mt-6 mb-4">Click below to send precise location details</p>

                    <button 
                        onClick={sendWhatsApp}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-green-500/30 transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
                    >
                        <span>💬</span> Send Location on WhatsApp
                    </button>
                </div>
            ) : (
                <>
                    <iframe name="hidden_iframe" style={{display:'none'}}></iframe>
                    {/* Web3Forms Configuration */}
                    <form 
                        ref={formRef}
                        action="https://api.web3forms.com/submit" 
                        method="POST" 
                        encType="multipart/form-data"
                        target="hidden_iframe"
                    >
                        <input type="hidden" name="access_key" value={ACCESS_KEY} />
                        <input type="hidden" name="subject" value={`New Order ${orderId || ''}`} />
                        <input type="hidden" name="from_name" value="Tirupati Print App" />
                        
                        <input type="hidden" name="Order_ID" value={orderId} />
                        <input type="hidden" name="Order_Details" value={`Cost: ₹${result?.cost || 0} | Pages: ${result?.pages || 0}`} />
                        <input type="hidden" name="Address_Full" value="" />

                        {/* File Upload Section */}
                        <div className="mb-8">
                            <label className="block text-gray-700 font-bold mb-3 text-sm uppercase tracking-wide">1. Upload File</label>
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-300 to-purple-300 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
                                <div className="relative border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-xl p-8 text-center cursor-pointer hover:bg-white transition-colors">
                                    <input 
                                        type="file" 
                                        name="attachment" 
                                        accept=".pdf" 
                                        onChange={handleFileChange} 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="text-indigo-400 group-hover:text-indigo-600 transition-colors">
                                        <div className="text-4xl mb-3">📂</div>
                                        <p className="font-semibold text-gray-700">
                                            {file ? <span className="text-indigo-600">{file.name}</span> : "Tap to Upload PDF"}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">{file ? "File selected" : "Max 25MB"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!result && (
                            <button 
                            onClick={calculatePrice}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                            {loading ? "Calculating Price..." : "Check Price ⚡"}
                            </button>
                        )}

                        {result && (
                            <div className="animate-fade-in-up">
                                {/* Price Card */}
                                <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8 text-center shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-bl-lg">BEST VALUE</div>
                                    <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-1">Estimated Cost</p>
                                    <h2 className="text-5xl font-black text-gray-800 tracking-tight">₹{result.cost}</h2>
                                    <div className="inline-block bg-gray-100 rounded-full px-4 py-1 mt-3">
                                        <p className="text-gray-600 text-xs font-medium">{result.pages} Pages × ₹3/page</p>
                                    </div>
                                </div>

                                {/* Address Section */}
                                <div className="space-y-4 mb-8">
                                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">2. Delivery Details</h3>
                                    
                                    <button 
                                        type="button"
                                        onClick={getLocation}
                                        className={`w-full py-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition duration-200 ${
                                            locationLink 
                                            ? 'bg-green-50 border-green-200 text-green-700' 
                                            : 'border-blue-100 text-blue-600 hover:bg-blue-50'
                                        }`}
                                    >
                                        {locLoading ? "Detecting..." : (locationLink ? "✅ Location Pinned" : "📍 Use Current Location")}
                                    </button>

                                    <div className="grid grid-cols-2 gap-4">
                                        <input 
                                            type="text" 
                                            placeholder="Hostel / Building"
                                            className="col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-900"
                                            value={addressDetails.hostel}
                                            onChange={(e) => setAddressDetails({...addressDetails, hostel: e.target.value})}
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="Room No"
                                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-900"
                                            value={addressDetails.room}
                                            onChange={(e) => setAddressDetails({...addressDetails, room: e.target.value})}
                                        />
                                        <input 
                                            type="tel" 
                                            name="Phone_Number"
                                            placeholder="Phone No"
                                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-900"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Note (e.g. Leave at gate)"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-900"
                                        value={addressDetails.instructions}
                                        onChange={(e) => setAddressDetails({...addressDetails, instructions: e.target.value})}
                                    />
                                </div>

                                <button
                                    type="button" 
                                    onClick={handleOrderSubmit}
                                    disabled={orderStatus === "Sending..."}
                                    className="w-full bg-gray-900 text-white font-bold py-5 rounded-xl shadow-xl hover:shadow-2xl hover:bg-black transition transform active:scale-95"
                                >
                                    {orderStatus === "Sending..." ? "Processing..." : "🚀 Place Order Now"}
                                </button>
                            </div>
                        )}
                    </form>
                </>
            )}
        </div>
        
        <div className="bg-gray-50/50 p-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium">© 2025 Tirupati Print Service</p>
        </div>
      </div>
    </div>
  );
}