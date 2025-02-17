import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [messages, setMessages] = useState([{ sender: 'agent', text: 'Hi there! What product or service do you need today?' }]);
  const [query, setQuery] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [location, setLocation] = useState(null);
  const [sortOption, setSortOption] = useState('rating');
  const chatWindowRef = useRef(null);

  useEffect(() => {
    localStorage.removeItem("userLocation"); // 🛑 Clear stored location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('📍 Fresh user location detected:', latitude, longitude);
          setLocation({ latitude, longitude });
          console.log("🚀 Sending API Request with:", {
            query,
            latitude: location?.latitude,
            longitude: location?.longitude,
          });
        },
        async (error) => {
          console.error('❌ GPS Location Error:', error);
          console.log('🌍 Falling back to IP-based location...');
          
          // Fetch IP-based location as a backup
          try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            if (data.latitude && data.longitude) {
              console.log('🌍 IP-based location:', data.latitude, data.longitude);
              setLocation({ latitude: data.latitude, longitude: data.longitude });
            } else {
              console.error('⚠️ Could not get location from IP');
            }
          } catch (ipError) {
            console.error('⚠️ IP Location Fetch Failed:', ipError);
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);  

  useEffect(() => {
    chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
  }, [messages]);

  const handleUserResponse = async (userInput) => {
    setMessages((prev) => [...prev, { sender: 'user', text: userInput }]);
    setQuery('');

    // 🛑 Wait for location to be set properly
    if (!location || !location.latitude || !location.longitude) {
      console.log('❌ Location not available. Waiting...');
      setTimeout(() => {
          console.log('🔄 Retrying with updated location:', location);
          handleUserResponse(userInput); // Try again
      }, 1000);
      return;
  }
    //if (!location || !location.latitude || !location.longitude) {
     // console.log('❌ Location not available. Using fallback.');
    //  setMessages((prev) => [...prev, { sender: 'agent', text: 'I need access to your location to find businesses near you.' }]);
    //  return;
   // }
    console.log("🔍 Searching Google Places API with:", userInput);
    console.log("📍 User Location (Latitude, Longitude):", location.latitude, location.longitude);

    setMessages((prev) => [...prev, { sender: 'agent', text: 'Got it! Searching for the best results near you...' }]);

    try {
      const res = await axios.post('https://localserviceagent.onrender.com/query', {
        query: userInput,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      let sortedBusinesses = res.data.businesses;
      if (sortOption === 'rating') {
        sortedBusinesses = sortedBusinesses.sort((a, b) => b.rating - a.rating);
      } else if (sortOption === 'distance') {
        sortedBusinesses = sortedBusinesses.sort((a, b) => a.distance - b.distance);
      }

      setBusinesses(sortedBusinesses);
      setMessages((prev) => [...prev, { sender: 'agent', text: 'Great! Here are the top results for you:' }]);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setMessages((prev) => [...prev, { sender: 'agent', text: 'Something went wrong. Try again!' }]);
    }
  };

  return (
    <div className="App">
      <div className="header">Local Service Finder</div>
      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); handleUserResponse(query); }}>
        <input type="text" placeholder="Type your request..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <button type="submit">Search</button>
      </form>

      <div className="sort-options">
        <label>Sort by: </label>
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="rating">Rating</option>
          <option value="distance">Distance</option>
        </select>
      </div>

      <div className="business-list">
        {businesses.map((biz, index) => (
          <div key={index} className="business-card">
            <h2>{biz.name}</h2>
            <p><strong>Address:</strong> {biz.address}</p>
            <p><strong>Rating:</strong> {biz.rating ? `${biz.rating} ⭐` : 'No rating'}</p>
            <p><strong>Phone:</strong> {biz.phone || 'N/A'}</p>
            <p><strong>Website:</strong> {biz.website ? <a href={biz.website} target="_blank" rel="noopener noreferrer">Visit Website</a> : 'No website'}</p>
            <p><strong>Category:</strong> {biz.category || 'N/A'}</p>
            <p><strong>Opening Hours:</strong> {biz.opening_hours || 'N/A'}</p>
            <p><strong>Service Options:</strong> {biz.service_options || 'N/A'}</p>
            <p><strong>Amenities:</strong> {biz.amenities || 'N/A'}</p>
            {biz.photo && <img src={biz.photo} alt={biz.name} className="business-photo" />}
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${biz.latitude},${biz.longitude}`} className="directions-button" target="_blank" rel="noopener noreferrer">Get Directions</a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
