"use client";
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ I have added your specific link here!
  const GOOGLE_FORM_LINK = "https://docs.google.com/forms/d/e/1FAIpQLSfPUr_bSUpV-PBLJ91xbT2d2kOiGyuC3S7kVZhV8dJC6VqsOw/viewform?usp=sf_link"; 

  const handleFileChange = (e) => {
    if(e.target.files) {
      setFile(e.target.files[0]);
      setResult(null); 
    }
  };

  const calculatePrice = async () => {
    if (!file) return alert("Please select a PDF file first!");
    setLoading(true);
    setResult(null); 

    const formData = new FormData();
    formData.append('myFile', file);

    try {
      // Connect to your backend for price calculation
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

  const openGoogleForm = () => {
    // Opens your form in a new tab
    window.open(GOOGLE_FORM_LINK, '_blank');
  };

  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)] max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Tirupati Print Service 🖨️</h1>
      
      {/* Step 1: Check Price */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold mb-4">Step 1: Check Price</h2>
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

      {/* Step 2: Order Result */}
      {result && (
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Estimated Cost</h2>
          <div className="text-4xl font-bold text-green-700 my-2">₹{result.cost}</div>
          <p className="text-gray-600 mb-6">{result.pages} Pages x ₹3/page</p>
          
          <div className="border-t border-green-200 pt-4">
            <h3 className="font-bold mb-2">Step 2: Place Order</h3>
            <p className="text-sm text-gray-600 mb-4">
              To finish, click below and upload your file to our Order Form.
            </p>
            <button
              onClick={openGoogleForm}
              className="w-full py-3 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 transition shadow-lg"
            >
              Place Order Now 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}