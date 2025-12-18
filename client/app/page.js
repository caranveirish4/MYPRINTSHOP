"use client";
import { useState, useEffect } from 'react';

export default function AdminPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simple "Password" to protect the page
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (authorized) fetchOrders();
  }, [authorized]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('https://myprintshopbackend.onrender.com/orders');
      const data = await res.json();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      alert("Failed to load orders");
    }
  };

  const checkPassword = () => {
    if (password === "admin123") { // Change this if you want
      setAuthorized(true);
    } else {
      alert("Wrong Password");
    }
  };

  const downloadPdf = (id) => {
    window.open(`https://myprintshopbackend.onrender.com/order/${id}/download`, '_blank');
  };

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
          <input 
            type="password" 
            placeholder="Enter Password" 
            className="border p-2 rounded mb-4 w-full"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={checkPassword} className="bg-blue-600 text-white px-4 py-2 rounded font-bold w-full">
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">📋 Order Manager</h1>
        
        {loading ? <p>Loading orders...</p> : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white p-6 rounded-lg shadow border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-blue-600">{order.orderId}</h2>
                  <p className="text-gray-600 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
                  <p className="mt-2 font-medium">📞 {order.phone}</p>
                  <p className="text-gray-500 text-sm mt-1">{order.details}</p>
                  <div className="mt-2 bg-gray-100 p-2 rounded text-sm text-gray-700">
                    {order.address}
                  </div>
                </div>
                
                <button 
                  onClick={() => downloadPdf(order._id)}
                  className="mt-4 sm:mt-0 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded shadow flex items-center gap-2"
                >
                  📥 Download PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}