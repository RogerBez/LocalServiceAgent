import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');

  const handleQuery = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://localserviceagent.onrender.com/query', { query });
      const businesses = res.data.businesses;
  
      console.log('Businesses:', businesses);  // Debugging log
      setResponse(
        businesses.length > 0
          ? businesses.map(biz => `${biz.name}, ${biz.address}, Rating: ${biz.rating}`).join('\n')
          : 'No businesses found for your query.'
      );
    } catch (error) {
      console.error('Error:', error);
      setResponse('Failed to get a response.');
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
      <p>{response}</p>
    </div>
  );
}

export default App;

