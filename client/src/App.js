import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

// Helper function to compute distance between two coordinates in km
function computeDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null; // Prevent errors if any value is missing
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2); // Returns distance as a formatted string
}

function App() {
  const [messages, setMessages] = useState([
    { sender: "agent", text: "Hi there! What product or service do you need today?" }
  ]);
  const [query, setQuery] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [location, setLocation] = useState(null);
  const [sortOption, setSortOption] = useState("rating");
  const chatWindowRef = useRef(null);

  useEffect(() => {
    localStorage.removeItem("userLocation"); // Clear any stored location data

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("✅ Fresh user location detected:", latitude, longitude);
          setLocation({ latitude, longitude });
        },
        async (error) => {
          console.error("❌ GPS Location Error:", error);
          console.log("🌍 Falling back to IP-based location...");
          try {
            const response = await fetch("https://ipapi.co/json/");
            const data = await response.json();
            if (data.latitude && data.longitude) {
              console.log("🌍 IP-based location:", data.latitude, data.longitude);
              setLocation({ latitude: data.latitude, longitude: data.longitude });
            } else {
              console.error("⚠️ Could not get location from IP");
            }
          } catch (ipError) {
            console.error("⚠️ IP Location Fetch Failed:", ipError);
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.error("❌ Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleUserResponse = async (userInput) => {
    setMessages((prev) => [...prev, { sender: "user", text: userInput }]);
    setQuery("");

    if (!location || !location.latitude || !location.longitude) {
      setMessages((prev) => [
        ...prev,
        { sender: "agent", text: "I need access to your location to find businesses near you." }
      ]);
      return;
    }

    console.log("🔍 Searching Google Places API with:", userInput);
    console.log("📍 User Location (Latitude, Longitude):", location.latitude, location.longitude);
    setMessages((prev) => [
      ...prev,
      { sender: "agent", text: "Got it! Searching for the best results near you..." }
    ]);

    try {
      const res = await axios.post("http://localhost:5000/query", {
        query: userInput,
        latitude: location.latitude,
        longitude: location.longitude
      });

      // Ensure businesses exist
      let businessesWithDistance = res.data.businesses.map((biz) => {
        if (biz.latitude && biz.longitude) {
          const distance = computeDistance(location.latitude, location.longitude, biz.latitude, biz.longitude);
          return { ...biz, distance: parseFloat(distance) || 99999 }; // Ensure distance is always a valid number
        }
        return { ...biz, distance: 99999 }; // Default high value to avoid sorting issues
      });

      // Sort by rating or distance based on user selection
      let sortedBusinesses = [...businessesWithDistance]; // Clone array before sorting
      if (sortOption === 'rating') {
        sortedBusinesses.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (sortOption === 'distance') {
        sortedBusinesses.sort((a, b) => (a.distance || 99999) - (b.distance || 99999));
      }    

      setBusinesses(sortedBusinesses);
      setMessages((prev) => [
        ...prev,
        { sender: "agent", text: "Great! Here are the top results for you:" }
      ]);
    } catch (error) {
      console.error("❌ Error fetching businesses:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "agent", text: "Something went wrong. Try again!" }
      ]);
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
        <input
          type="text"
          placeholder="Type your request..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
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
            {biz.photo && (
              <img src={biz.photo} alt={biz.name} className="business-photo" />
            )}
            <h2>{biz.name}</h2>
            <p><strong>Address:</strong> {biz.address}</p>
            <p>
              <strong>Rating:</strong> {biz.rating ? `${biz.rating} ⭐` : "No rating"}
            </p>
            {biz.distance !== 99999 ? (
              <p className="text-sm text-gray-600">
                <strong>Distance:</strong> {biz.distance.toFixed(2)} km
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                <strong>Distance:</strong> N/A
              </p>
            )}
            <p><strong>Phone:</strong> {biz.phone || "N/A"}</p>
            <p>
              <strong>Website:</strong> {biz.website ? <a href={biz.website} target="_blank" rel="noopener noreferrer">Visit Website</a> : "No website"}
            </p>
            <p><strong>Category:</strong> {biz.category || "N/A"}</p>
            <p><strong>Opening Hours:</strong> {biz.opening_hours || "N/A"}</p>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${biz.latitude},${biz.longitude}`}
              className="directions-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Directions
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
