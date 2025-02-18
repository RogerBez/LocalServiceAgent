require("dotenv").config();

// Read and log the contents of the .env file (for debugging)
const fs = require('fs');
try {
  const envFile = fs.readFileSync('.env', 'utf-8');
  console.log("📄 .env file contents:\n", envFile);
} catch (err) {
  console.error("❌ Error reading .env file:", err);
}

// Log all loaded environment variables
console.log("ALL ENV VARIABLES:", process.env);
const express = require("express");
const axios = require("axios");
const cors = require("cors");


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
const DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

// Handle business search requests
app.post("/query", async (req, res) => {
    const { query, latitude, longitude } = req.body;

    if (!query || !latitude || !longitude) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    console.log(`🔍 Searching Google Places API with: ${query}`);
    console.log(`📍 Backend Received Location: ${latitude}, ${longitude}`);
    console.log("GOOGLE_PLACES_API_KEY:", process.env.GOOGLE_PLACES_API_KEY);

    try {
        const params = {
            location: `${latitude},${longitude}`,
            radius: 10000,
            keyword: query,
            key: GOOGLE_PLACES_API_KEY,
        };

        const response = await axios.get(PLACES_URL, { params });
        console.log("📡 Google API Full Response:", response.data);
        const results = response.data.results;

        const businesses = await Promise.all(
            results.slice(0, 10).map(async (place) => await getPlaceDetails(place.place_id))
        );

        console.log("✅ Final Processed Business Data:", businesses);
        res.json({ businesses });
    } catch (error) {
        console.error("❌ Error fetching businesses:", error);
        res.status(500).json({ error: "Failed to fetch data from Google Places API" });
    }
});

// Fetch additional details for each business
async function getPlaceDetails(place_id) {
    try {
        const params = {
            place_id,
            fields: "name,formatted_address,rating,geometry,formatted_phone_number,website,opening_hours,photos,types",
            key: GOOGLE_PLACES_API_KEY,
        };

        const response = await axios.get(DETAILS_URL, { params });
        const details = response.data.result;

        let photo_url = null;
        if (details.photos && details.photos.length > 0) {
            const photo_ref = details.photos[0].photo_reference;
            photo_url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo_ref}&key=${GOOGLE_PLACES_API_KEY}`;
        }

        return {
            name: details.name || "N/A",
            address: details.formatted_address || "N/A",
            rating: details.rating || "N/A",
            latitude: details.geometry?.location?.lat || "N/A",
            longitude: details.geometry?.location?.lng || "N/A",
            phone: details.formatted_phone_number || "N/A",
            website: details.website || "N/A",
            opening_hours: details.opening_hours?.weekday_text?.join(", ") || "N/A",
            category: details.types ? details.types[0].replace("_", " ").toUpperCase() : "N/A",
            photo: photo_url,
        };
    } catch (error) {
        console.error(`❌ Error fetching place details for ID ${place_id}:`, error);
        return { name: "N/A", address: "N/A" };
    }
}

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
