"use client";
import { useState, useRef } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [phone, setPhone] = useState(""); 
  const [orderId, setOrderId] = useState(null);
  
  // 📍 NEW: Address States
  const [locationLink, setLocationLink] = useState("");
  const [addressDetails, setAddressDetails] = useState({
    hostel: "",
    room: "",
    instructions: ""
  });
  const [locLoading, setLocLoading] = useState(false);

  const formRef = useRef(null);
  const MY_EMAIL = "charanabbagoni926@gmail.com"; 
  const MY_WHATSAPP = "9179954608946"; 

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

  // 📍 NEW: Function to get GPS Location
  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition((position) => {
      const link = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
      setLocationLink(link);
      setLocLoading(false);
    }, () => {
      alert("Unable to retrieve your location. Please type it manually.");
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
      alert("❌ Connection Error: Backend is not reachable.");
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

    const orderIdInput = formRef.current.querySelector('input[name="Order_ID"]');
    if (orderIdInput) orderIdInput.value = newId;

    // 📍 Combine address into one string for the email
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
    }, 2000);
  };

  const sendWhatsApp = () => {
    if (!orderId) return;
    // 📍 Add address to WhatsApp message
    const message = `Hello! I just placed Order *${orderId}*.\n\n📄 File: ${file.name}\n💰 Amount: ₹${result.cost}\n\n📍 *Delivery Location:*\n${addressDetails.hostel}, Room ${addressDetails.room}\n${locationLink ? `🔗 Map: ${locationLink}` : ''}\n\nPlease confirm!`;
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
                    
                    {/* High Contrast Order ID */}
                    <div className="bg-blue-50 border-2 border-blue-200 text-blue-900 p-4 rounded-lg font-mono text-2xl font-black tracking-widest my-4 select-all shadow-sm">
                        {orderId}
                    </div>

                    <p className="text-sm text-gray-500 mb-6">Current Status: <span className="text-blue-600 font-bold">Doc Sent 📨</span></p>

                    <button 
                        onClick={sendWhatsApp}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition flex items-center justify-center gap-2"
                    >
                        <span>💬</span> Send Location to WhatsApp
                    </button>
                    <p className="text-xs text-gray-400 mt-3">Click above to send your precise location!</p>
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
                        {/* 📍 Hidden input to send full address to email */}
                        <input type="hidden" name="Address_Full" value="" />

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

                            {/* 📍 NEW: Address Section */}
                            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                                <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">📍 Delivery Details</h3>
                                
                                {/* GPS Button */}
                                <button 
                                    type="button"
                                    onClick={getLocation}
                                    className={`w-full py-2 mb-4 rounded border flex items-center justify-center gap-2 text-sm font-medium transition ${locationLink ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                                >
                                    {locLoading ? "Getting Location..." : (locationLink ? "✅ Location Pinned!" : "📍 Use Current Location")}
                                </button>

                                {/* Address Fields */}
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <input 
                                        type="text" 
                                        placeholder="Hostel / Building Name"
                                        className="col-span-2 p-2 border rounded text-sm"
                                        value={addressDetails.hostel}
                                        onChange={(e) => setAddressDetails({...addressDetails, hostel: e.target.value})}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Room / Flat No."
                                        className="p-2 border rounded text-sm"
                                        value={addressDetails.room}
                                        onChange={(e) => setAddressDetails({...addressDetails, room: e.target.value})}
                                    />
                                    <input 
                                        type="tel" 
                                        name="Phone_Number"
                                        placeholder="Phone Number"
                                        className="p-2 border rounded text-sm"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Instructions (e.g., Leave at gate)"
                                    className="w-full p-2 border rounded text-sm"
                                    value={addressDetails.instructions}
                                    onChange={(e) => setAddressDetails({...addressDetails, instructions: e.target.value})}
                                />
                            </div>

                            <button
                                type="button" 
                                onClick={handleOrderSubmit}
                                disabled={orderStatus === "Sending..."}
                                className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-4 rounded-lg shadow-lg text-white transition transform active:scale-95"
                            >
                                {orderStatus === "Sending..." ? "Processing..." : "🚀 Place Order Now"}
                            </button>
                            </div>
                        )}
                    </form>
                </>
            )}
        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-500">© 2024 Tirupati Print Service</p>
        </div>
      </div>
    </div>
  );
}