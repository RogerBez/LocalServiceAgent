import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import BusinessCard from './components/BusinessCard';
import MapComponent from './components/MapComponent';
import './App.css';

function App() {
  const [messages, setMessages] = useState([{ sender: 'agent', text: 'Hi there! What are you looking for?' }]);
  const [query, setQuery] = useState('');
  const [step, setStep] = useState(1);
  const [typing, setTyping] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [location, setLocation] = useState(null);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          console.log('User location:', latitude, longitude);
        },
        (error) => console.error('Error getting location:', error)
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  useEffect(() => {
    chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
  }, [messages]);

  const handleUserResponse = (userInput) => {
    setMessages((prev) => [...prev, { sender: 'user', text: userInput }]);
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      if (step === 1) {
        setQuery(userInput);
        setMessages((prev) => [...prev, { sender: 'agent', text: 'Got it! How far should I search—5 km or 10 km?' }]);
        setStep(2);
      } else if (step === 2) {
        const selectedRadius = userInput.includes('10') ? 10000 : 5000;
        setMessages((prev) => [...prev, { sender: 'agent', text: 'Would you prefer top-rated or closest?' }]);
        setStep(3);
      } else if (step === 3) {
        setMessages((prev) => [...prev, { sender: 'agent', text: 'Searching for the best results...' }]);
        fetchBusinesses();
        setStep(4);
      }
    }, 1000);
  };

  const fetchBusinesses = async () => {
    if (!location) {
      console.error('Location is not available.');
      return;
    }

    const payload = {
      query,
      latitude: location.latitude,
      longitude: location.longitude,
      radius: 5000,
    };

    console.log('Payload being sent to backend:', payload);

    try {
      const res = await axios.post('https://localserviceagent.onrender.com/query', payload);
      console.log('Response from backend:', res.data);

      // Update businesses state with res.data.results
      setBusinesses(res.data.results);

      if (res.data.results.length > 0) {
        setMessages((prev) => [...prev, { sender: 'agent', text: 'Here are the results:' }]);
      } else {
        setMessages((prev) => [...prev, { sender: 'agent', text: 'No businesses found for your query.' }]);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setMessages((prev) => [...prev, { sender: 'agent', text: 'Failed to fetch businesses. Please try again.' }]);
    }
  };

  const handleInputChange = (e) => setQuery(e.target.value);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      handleUserResponse(query);
      setQuery('');
    }
  };

  return (
    <div className="App">
      <h1>Local Service Finder Chat</h1>
      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {typing && <div className="message agent">Agent is typing...</div>}
      </div>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Type your response here..." value={query} onChange={handleInputChange} />
        <button type="submit">Send</button>
      </form>

      <div className="map-container">
        {location && (
          <MapComponent latitude={location.latitude} longitude={location.longitude} businesses={businesses} />
        )}
      </div>

      <div className="business-list">
        {Array.isArray(businesses) && businesses.length > 0 ? (
          businesses.map((biz, index) => (
            <BusinessCard
              key={index}
              name={biz.name}
              address={biz.formatted_address}
              rating={biz.rating}
              latitude={biz.geometry.location.lat}
              longitude={biz.geometry.location.lng}
            />
          ))
        ) : (
          <p>Loading businesses or no results found.</p>
        )}
      </div>
    </div>
  );
}

export default App;
