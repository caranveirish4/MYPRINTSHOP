"use client";
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Handles selecting the file
  const handleFileChange = (e) => {
    if(e.target.files) {
      setFile(e.target.files[0]);
      setResult(null); 
    }
  };

  // 2. Calculates the price (Counts pages)
  const calculatePrice = async () => {
    if (!file) return alert("Please select a PDF file first!");
    setLoading(true);
    setResult(null); // Hide old results while calculating

    const formData = new FormData();
    formData.append('myFile', file);

    try {
      const response = await fetch('https://myprintshopbackend.onrender.com/count', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();

      // Check for server errors
      if (data.error) {
        alert("⚠️ Server Error: " + data.error);
        setLoading(false);
        return; 
      }
      
      setResult(data);
    
    } catch (error) {
      alert("❌ Connection Error: Backend is not reachable.");
    }
    setLoading(false);
  };

  // 3. Places the order (Sends email)
  const placeOrder = async () => {
    if (!file) return alert("Please upload a file first!");

    const formData = new FormData();
    formData.append('myFile', file);

    try {
      const response = await fetch('https://myprintshopbackend.onrender.com/order', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert("✅ Order placed successfully! Check your email.");
      } else {
        alert("❌ Failed to place order.");
      }
    } catch (error) {
      console.error(error);
      alert("Error placing order.");
    }
  };

  // 4. The Visual Layout
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

      {/* Result Box: Only shows after calculation */}
      {result && (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e6fffa', border: '1px solid green' }}>
          <h2>Pages: {result.pages}</h2>
          <h2 style={{ color: 'green' }}>Total Cost: ₹{result.cost}</h2>
          <p>Delivery: <b>Free</b> (6 PM - 9 PM)</p>
          
          {/* New Place Order Button */}
          <button
            onClick={placeOrder}
            style={{
              width: '100%',
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#28a745', // Green color
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '15px'
            }}
          >
            Place Order
          </button>

        </div>
      )}
    </div>
  );
}