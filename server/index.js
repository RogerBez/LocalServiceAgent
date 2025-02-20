// Load environment variables from .env
require('dotenv').config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Use the API key from your .env file
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// URLs for Google Places API
const PLACES_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
const DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

// Route to handle search queries
app.post("/query", async (req, res) => {
  const { query, latitude, longitude } = req.body;

  if (!query || !latitude || !longitude) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  console.log(`🔍 Searching Google Places API with: ${query}`);
  console.log(`📍 Backend Received Location: ${latitude}, ${longitude}`);

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

    // Process up to 10 businesses
    const businesses = await Promise.all(
      results.slice(0, 10).map(async (place) => await getPlaceDetails(place.place_id, latitude, longitude))
    );

    console.log("✅ Final Processed Business Data:", businesses);
    res.json({ businesses });
  } catch (error) {
    console.error("❌ Error fetching businesses:", error);
    res.status(500).json({ error: "Failed to fetch data from Google Places API" });
  }
});

// Function to fetch additional details for a given place
async function getPlaceDetails(place_id, userLat, userLng) {
  try {
    const params = {
      place_id,
      fields: "name,formatted_address,rating,geometry,formatted_phone_number,website,opening_hours,photos,types,user_ratings_total",
      key: GOOGLE_PLACES_API_KEY,
    };

    const response = await axios.get(DETAILS_URL, { params });
    const details = response.data.result;

    // Compute photo URL from the first available photo reference
    let photo_url = null;
    if (details.photos && details.photos.length > 0) {
      const photo_ref = details.photos[0].photo_reference;
      photo_url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo_ref}&key=${GOOGLE_PLACES_API_KEY}`;
    }

    // Calculate distance from user location to business
    let distance = "N/A";
    if (details.geometry && details.geometry.location) {
      distance = getDistance(userLat, userLng, details.geometry.location.lat, details.geometry.location.lng);
    }

    return {
      name: details.name || "N/A",
      address: details.formatted_address || "N/A",
      rating: details.rating || "N/A",
      latitude: details.geometry?.location?.lat || "N/A",
      longitude: details.geometry?.location?.lng || "N/A",
      phone: details.formatted_phone_number || "N/A",
      website: details.website || "N/A",
      distance: distance, // Distance from user
      opening_hours: details.opening_hours && details.opening_hours.weekday_text
        ? details.opening_hours.weekday_text.join("\n") // New: Properly formatted
        : "N/A",
      category: details.types ? details.types[0].replace("_", " ").toUpperCase() : "N/A",
      photo: photo_url,
      aggregatedReviews: details.user_ratings_total || "N/A",
      // Placeholder for social media links – update these if you have real data
      socialLinks: {
        facebook: null,
        instagram: null,
        twitter: null
      }
    };
  } catch (error) {
    console.error(`❌ Error fetching place details for ID ${place_id}:`, error);
    return { name: "N/A", address: "N/A" };
  }
}

// Helper function: Calculate distance between two coordinates
function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = (angle) => (Math.PI * angle) / 180;
  const R = 6371; // Radius of Earth in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2); // Distance in km, rounded to 2 decimal places
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
