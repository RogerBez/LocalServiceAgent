import React, { useState } from 'react';
import axios from 'axios';
import BusinessCard from './components/BusinessCard'; // New import for the BusinessCard component
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [businesses, setBusinesses] = useState([]);

  const handleQuery = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://localserviceagent.onrender.com/query', { query });
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
            <BusinessCard
              key={index}
              name={biz.name}
              address={biz.address}
              rating={biz.rating}
            />
          ))
        ) : (
          <p>No businesses found for your query.</p>
        )}
      </div>
    </div>
  );
}

export default App;
