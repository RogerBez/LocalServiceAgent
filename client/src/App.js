import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BusinessCard from './components/BusinessCard';
import MapComponent from './components/MapComponent';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [userName, setUserName] = useState('');
  const [conversationStep, setConversationStep] = useState(1);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
      setConversationStep(2);
    }

    const timeout = setTimeout(() => {
      if (!location) {
        setLocationError('Geolocation is taking too long. Please allow location access.');
      }
    }, 10000);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeout);
          setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        },
        () => {
          clearTimeout(timeout);
          setLocationError('Failed to get location. Please check your browser settings.');
        }
      );
    } else {
      clearTimeout(timeout);
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, [location]);

  const handleUserNameSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('userName', userName);
    setConversationStep(2);
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      setLocationError('Location is required to search for nearby services.');
      return;
    }

    const payload = {
      query,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    try {
      const res = await axios.post('https://localserviceagent.onrender.com/query', payload);
      console.log('Response from backend:', res.data);
      setBusinesses(res.data.businesses);
      setConversationStep(3);
    } catch (error) {
      setLocationError('Failed to fetch businesses. Please try again.');
    }
  };

  return (
    <div className="App">
      <h1>Local Service Finder</h1>
      {conversationStep === 1 && (
        <div className="conversation">
          <p>Hello! What’s your name?</p>
          <form onSubmit={handleUserNameSubmit}>
            <input
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
            <button type="submit">Submit</button>
          </form>
        </div>
      )}

      {conversationStep === 2 && (
        <div className="conversation">
          <p>{`Welcome back, ${userName}! What service are you looking for today?`}</p>
          <form onSubmit={handleQuerySubmit}>
            <input
              type="text"
              placeholder="e.g., plumber, electrician"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
            <button type="submit">Search</button>
          </form>
        </div>
      )}

      {conversationStep === 3 && (
        <>
          <div className="map-container">
            {location ? (
              <MapComponent latitude={location.latitude} longitude={location.longitude} businesses={businesses} />
            ) : (
              <p>Loading map...</p>
            )}
          </div>
          <div className="business-list">
            {businesses.length > 0 ? (
              businesses.map((biz, index) => (
                <BusinessCard
                  key={index}
                  name={biz.name}
                  address={biz.address}
                  rating={biz.rating}
                  latitude={biz.latitude}
                  longitude={biz.longitude}
                  phone={biz.phone}
                />
              ))
            ) : (
              <p>No businesses found for your query.</p>
            )}
          </div>
        </>
      )}

      {locationError && <p className="error-message">{locationError}</p>}
    </div>
  );
}

export default App;
