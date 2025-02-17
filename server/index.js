require('dotenv').config({ path: './.env' });

console.log("Google API Key:", process.env.GOOGLE_API_KEY);
console.log("OpenAI API Key:", process.env.OPENAI_API_KEY ? "Loaded" : "Not found");

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 5000;
const apiKey = process.env.GOOGLE_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

console.log('Google API Key:', apiKey);
console.log('OpenAI API Key:', openaiApiKey ? 'Loaded successfully' : 'Not found');

app.use(express.json());

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

app.options('*', cors());

// 🔍 Function to Fetch Business Details
const getBusinessDetails = async (placeId) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        key: apiKey,
        fields: 'name,formatted_address,rating,geometry,formatted_phone_number,website'
      }
    });

    return response.data.result || null;
  } catch (error) {
    console.error(`❌ Error fetching details for place_id ${placeId}:`, error.message);
    return null;
  }
};

// ✅ **Main API Route to Handle Queries**
app.post('/query', async (req, res) => {
  console.log('--- Incoming payload ---');
  console.log('Request body:', req.body);

  const { query, latitude, longitude } = req.body;
  if (!query) return res.status(400).json({ message: 'Query is required' });

  console.log('User Query:', query);
  console.log('Latitude:', latitude);
  console.log('Longitude:', longitude);

  try {
    console.log('🔍 Searching Google Places API with:', query);
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query,
        location: `${latitude},${longitude}`,
        radius: 10000, 
        key: apiKey,
      }
    });

    if (!response.data.results || response.data.results.length === 0) {
      console.warn('❌ No businesses found.');
      return res.json({ businesses: [] });
    }

    console.log(`📍 Google Places API Response: ${response.data.results.length} results found.`);

    let businesses = await Promise.all(
      response.data.results.slice(0, 10).map(async (biz) => {
        const details = await getBusinessDetails(biz.place_id);

        return {
          name: details?.name || biz.name,
          address: details?.formatted_address || biz.formatted_address,
          rating: details?.rating || 'No rating',
          latitude: details?.geometry?.location?.lat || biz.geometry?.location?.lat,
          longitude: details?.geometry?.location?.lng || biz.geometry?.location?.lng,
          phone: details?.formatted_phone_number || 'N/A',
          website: details?.website || 'N/A',
        };
      })
    );

    console.log('✅ Final Processed Business Data:', businesses);

    res.json({ businesses });
  } catch (error) {
    console.error('❌ Error processing request:', error.message);
    res.status(500).json({ message: 'Failed to fetch data from Google Places' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
