import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BusinessCard from './components/BusinessCard';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          console.log('User location:', latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  const handleQuery = async (e) => {
    e.preventDefault();

    const payload = { query };
    if (location) {
      payload.latitude = location.latitude;
      payload.longitude = location.longitude;
    }

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
      <div className="business-list">
        {businesses.length > 0 ? (
          businesses.map((biz, index) => (
            <BusinessCard key={index} name={biz.name} address={biz.address} rating={biz.rating} />
          ))
        ) : (
          <p>No businesses found for your query.</p>
