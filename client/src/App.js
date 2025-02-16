import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BusinessCard from './components/BusinessCard';
import MapComponent from './components/MapComponent';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [location, setLocation] = useState(null); // No default location initially
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!location) {
        setLocationError('Geolocation is taking too long. Please allow location access.');
        console.warn('Geolocation is taking too long.');
      }
    }, 10000); // 10-second timeout for geolocation

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
          setLocationError('Failed to get location. Please check your browser settings.');
          console.error('Error getting location:', error);
        }
      );
    } else {
      clearTimeout(timeout);
      setLocationError('Geolocation is not supported by this browser.');
      console.error('Geolocation is not supported.');
    }
  }, []);

  const handleQuery = async (e) => {
    e.preventDefault();

    if (!location) {
      console.error('Location is not available.');
      setLocationError('Location is required to search for nearby services.');
      return;
    }

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
      console.error('Error fetching businesses:', error);
      setLocationError('Failed to fetch businesses. Please try again.');
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

      {locationError && <p className="error-message">{locationError}</p>}

      <div className="map-container">
        {businesses.length > 0 ? (
          <MapComponent latitude={location.latitude} longitude={location.longitude} businesses={businesses} />
        ) : (
          <p>{location ? 'Search for services to see results on the map.' : 'Waiting for your location...'}</p>
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
          <p>{query ? 'No businesses found for your query.' : 'Search for services to see results.'}</p>
        )}
      </div>
    </div>
  );
}

export default App;
