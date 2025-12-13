"use client";
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if(e.target.files) {
      setFile(e.target.files[0]);
      setResult(null); 
    }
  };

  const calculatePrice = async () => {
    if (!file) return alert("Please select a PDF file first!");
    setLoading(true);
    setResult(null); // Hide old results while calculating

    const formData = new FormData();
    formData.append('myFile', file);

    try {
      const response = await fetch('https://myprintshopbackend.onrender.com', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();

      // --- NEW ERROR CHECK ---
      if (data.error) {
        alert("⚠️ Server Error: " + data.error);
        setLoading(false);
        return; // Stop here, don't show the green box
      }
      
      setResult(data);
    
    } catch (error) {
      alert("❌ Connection Error: Backend is not reachable.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ color: '#0070f3' }}>Tirupati Print Service 🖨️</h1>
      <p>Upload your PDF below.</p>

      <div style={{ border: '2px dashed #ccc', padding: '30px', margin: '20px 0' }}>
        <input type="file" accept=".pdf" onChange={handleFileChange} />
      </div>

      <button 
        onClick={calculatePrice}
        disabled={loading}
        style={{ padding: '15px 30px', backgroundColor: '#0070f3', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', borderRadius: '5px' }}>
        {loading ? "Calculating..." : "Check Price"}
      </button>

      {result && (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e6fffa', border: '1px solid green' }}>
          <h2>Pages: {result.pages}</h2>
          <h2 style={{ color: 'green' }}>Total Cost: ₹{result.cost}</h2>
          <p>Delivery: <b>Free</b> (6 PM - 9 PM)</p>
          
          <button style={{ width: '100%', padding: '10px', backgroundColor: '#25D366', color: 'white', border: 'none', marginTop: '10px', borderRadius: '5px' }}>
             <a 
  href={`https://wa.me/917670964247?text=Hi%20Tirupati%20Print%20Service!%20I%20have%20a%20PDF%20file%20with%20${result.pages}%20pages.%20The%20total%20cost%20is%20₹${result.cost}.%20Please%20print%20it.`}
  target="_blank"
  style={{ 
    display: 'block', 
    width: '100%', 
    padding: '10px', 
    backgroundColor: '#25D366', 
    color: 'white', 
    textAlign: 'center',
    textDecoration: 'none',
    marginTop: '10px', 
    borderRadius: '5px',
    fontWeight: 'bold'
  }}>
  Order via WhatsApp 💬
</a>
          </button>
        </div>
      )}
    </div>
  );
}