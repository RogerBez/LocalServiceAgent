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
const allowedOrigins = [
  'https://local-service-agent.vercel.app',
  'http://localhost:3000',
  'http://localhost:5000'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Preflight handling
app.options('*', cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Test API route
app.post('/query', async (req, res) => {
  console.log('--- Incoming payload ---');
  console.log('Request body:', req.body);

  const { query, latitude, longitude } = req.body;

  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  console.log('Query:', query);
  console.log('Latitude:', latitude);
  console.log('Longitude:', longitude);

  try {
    const params = {
      query,
      location: `${latitude},${longitude}`,
      radius: 5000, // 5 km radius
      key: apiKey,
    };

    console.log('Request params:', params);

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', { params });

    console.log('Full Google Places Response:', JSON.stringify(response.data, null, 2));

    const businesses = response.data.results.map((biz) => ({
      name: biz.name,
      address: biz.formatted_address,
      rating: biz.rating || 'No rating',
      latitude: biz.geometry?.location?.lat, // Add latitude
      longitude: biz.geometry?.location?.lng, // Add longitude
      phone: biz.formatted_phone_number || 'N/A' // Add phone if available
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
