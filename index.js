require('dotenv').config();  // Ensure dotenv is loaded first
console.log('dotenv loaded:', require('dotenv').config());  // Debugging line (optional)

const apiKey = process.env.GOOGLE_API_KEY;
console.log('API Key:', apiKey);  // This should log the key if it's loaded correctly

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 5000;

app.use(cors());  // Allow requests from any origin during development
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.post('/query', async (req, res) => {
  const userQuery = req.body.query;
  console.log('User query received:', userQuery);

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query: userQuery,
        key: apiKey,
      },
    });

    // Log the full response for debugging
    console.log('Full Google Places Response:', response.data);

    const businesses = response.data.results.map(biz => ({
      name: biz.name,
      address: biz.formatted_address,
      rating: biz.rating || 'No rating',
    }));

    res.json({ businesses });
  } catch (error) {
    console.error('Error fetching data from Google Places:', error);
    res.status(500).json({ message: 'Failed to fetch data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
