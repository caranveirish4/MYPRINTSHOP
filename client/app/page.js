"use client";
import { useState, useRef } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [phone, setPhone] = useState(""); 
  
  // Ref to control the form
  const formRef = useRef(null);

  // ✅ YOUR EMAIL - Make sure this is correct!
  const MY_EMAIL = "charanabbagoni926@gmail.com"; 

  const handleFileChange = (e) => {
    if(e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null); 
      setOrderStatus("");
    }
  };

  const calculatePrice = async (e) => {
    // Prevent the form from submitting when clicking "Check Price"
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
    
    // We update the Status to "Sending..."
    setOrderStatus("Sending...");

    // We submit the form programmatically
    if(formRef.current) {
        formRef.current.submit();
    }
    
    // We fake the "Success" message after 2 seconds because the hidden frame handles the rest
    setTimeout(() => {
        setOrderStatus("Sent!");
        alert("✅ Order Sent! Please check your email for the file.");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 p-6 text-center">
          <h1 className="text-3xl font-bold text-white">Tirupati Print Service 🖨️</h1>
          <p className="text-blue-100 mt-2">Fast & Affordable Document Printing</p>
        </div>

        <div className="p-8">
            
            {/* THE TRICK: A hidden iframe. 
                When the form submits, the result goes here, so the page doesn't reload.
            */}
            <iframe name="hidden_iframe" style={{display:'none'}}></iframe>

            {/* THE REAL FORM: 
                Notice target="hidden_iframe". This sends data to the invisible box.
            */}
            <form 
                ref={formRef}
                action={`https://formsubmit.co/${MY_EMAIL}`} 
                method="POST" 
                encType="multipart/form-data"
                target="hidden_iframe"
            >
                {/* Hidden Settings for FormSubmit */}
                <input type="hidden" name="_subject" value="New Print Order with File!" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_template" value="table" />
                
                {/* We send the detailed message as a hidden field */}
                <input type="hidden" name="Order Details" value={`Cost: ₹${result?.cost || 0} | Pages: ${result?.pages || 0}`} />


                {/* Step 1: File Upload */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-bold mb-2">1. Upload your PDF</label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition text-center cursor-pointer group">
                    {/* The Input MUST have name="attachment" for the file to show up */}
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

                {/* Check Price Button (This is NOT a submit button) */}
                {!result && (
                    <button 
                    onClick={calculatePrice}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400"
                    >
                    {loading ? "Calculating Pages..." : "Check Price"}
                    </button>
                )}

                {/* Result & Phone Input */}
                {result && (
                    <div className="animate-fade-in-up">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
                        <p className="text-gray-600 text-sm uppercase font-bold tracking-wide">Estimated Cost</p>
                        <h2 className="text-4xl font-extrabold text-green-700 my-1">₹{result.cost}</h2>
                        <p className="text-gray-500 text-sm">{result.pages} Pages x ₹3/page</p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 font-bold mb-2">2. Your WhatsApp Number</label>
                        {/* We give this input a name so it appears in the email */}
                        <input 
                        type="tel" 
                        name="Phone Number"
                        placeholder="e.g. 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3"
                        />
                    </div>

                    {/* Final Place Order Button */}
                    <button
                        type="button" 
                        onClick={handleOrderSubmit}
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
            </form>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-500">© 2024 Tirupati Print Service</p>
        </div>
      </div>
    </div>
  );
}