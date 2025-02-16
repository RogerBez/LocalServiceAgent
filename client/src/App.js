import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BusinessCard from './components/BusinessCard';
import MapComponent from './components/MapComponent'; // Import the map component
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [location, setLocation] = useState({ latitude: -33.9249, longitude: 18.4241 }); // Default to Cape Town

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!location) {
        console.warn('Geolocation is taking too long, using default location.');
        setLocation({ latitude: -33.9249, longitude: 18.4241 }); // Fallback to Cape Town
      }
    }, 10000); // 10 seconds timeout for geolocation

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeout);
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          console.log('User location:', latitude, longitude);
        },
        (error) => {
          clearTimeout(timeout);
          console.error('Error getting location:', error);
        }
      );
    } else {
      clearTimeout(timeout);
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  const handleQuery = async (e) => {
    e.preventDefault();

    const payload = {
      query,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    console.log('Payload being sent to backend:', payload);

    try {
      const res = await axios.post('https://localserviceagent.onrender.com/query', payload);
      console.log('Businesses:', res.data.businesses);
      setBusinesses(res.data.businesses);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <h1>Local Service Finder</h1>
      <form onSubmit={handleQuery}>
        <input
          type="text"
          placeholder="Ask for a service (e.g., Find a plumber near me)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {/* Render the map component */}
      <div className="map-container">
        {businesses.length > 0 ? (
          <MapComponent latitude={location.latitude} longitude={location.longitude} businesses={businesses} />
        ) : (
          <p>Map will display once businesses are found...</p>
        )}
      </div>

      <div className="business-list">
        {businesses.length > 0 ? (
          businesses.map((biz, index) => (
            <BusinessCard key={index} name={biz.name} address={biz.address} rating={biz.rating} />
          ))
        ) : (
          <p>{query ? 'No businesses found for your query.' : 'Search for services to see results.'}</p>
        )}
      </div>
    </div>
  );
}

export default App;
