const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const apiKey = process.env.GOOGLE_API_KEY;

console.log('dotenv loaded:', dotenv.config());
console.log('API Key:', apiKey);

// Middleware to parse JSON request body
app.use(express.json());

// Enable CORS for requests from your frontend
app.use(
  cors({
    origin: 'https://local-service-agent.vercel.app', // Your Vercel frontend URL
  })
);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Test API route
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from server!' });
});

// Handle search queries
app.post('/query', async (req, res) => {
  const { query, latitude, longitude } = req.body;

  console.log('--- Incoming payload ---');
  console.log('Query:', query);
  console.log('Latitude:', latitude);
  console.log('Longitude:', longitude);

  if (!latitude || !longitude) {
    console.log('No location provided.');
  } else {
    console.log('Using location for the query.');
  }

  try {
    const params = {
      query,
      key: apiKey,
    };

    if (latitude && longitude) {
      params.location = `${latitude},${longitude}`;
      params.radius = 10000; // 10km radius
      console.log('Request sent to Google Places with location and radius:', params.location);
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', { params });
    console.log('Full Google Places Response:', response.data);

    const businesses = response.data.results.map(biz => ({
      name: biz.name,
      address: biz.formatted_address,
      rating: biz.rating || 'No rating',
    }));

    res.json({ businesses });
  } catch (error) {
    console.error('Error fetching data from Google Places:', error.message);
    res.status(500).json({ message: 'Failed to fetch data from Google Places' });
  }
});

// The "catchall" handler for React's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
