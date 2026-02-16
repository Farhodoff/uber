const express = require('express');
const cors = require('cors');
const { Client } = require('@googlemaps/google-maps-services-js');
require('dotenv').config();

const app = express();
const client = new Client({});

const PORT = process.env.PORT || 4006;
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
    res.json({ service: 'location-service', status: 'ok' });
});

// Location Autocomplete
app.get('/autocomplete', async (req, res) => {
    try {
        const { input } = req.query;

        if (!input) {
            return res.status(400).json({ message: 'input parameter is required' });
        }

        if (!GOOGLE_MAPS_API_KEY) {
            // Fallback: return mock data if no API key
            return res.json({
                predictions: [
                    { place_id: 'mock1', description: `${input} - Test Location 1` },
                    { place_id: 'mock2', description: `${input} - Test Location 2` },
                    { place_id: 'mock3', description: `${input} - Test Location 3` },
                ]
            });
        }

        const response = await client.placeAutocomplete({
            params: {
                input,
                key: GOOGLE_MAPS_API_KEY,
                // Bias towards Uzbekistan (optional)
                components: ['country:uz'],
            }
        });

        return res.json(response.data);
    } catch (error) {
        console.error('Autocomplete error:', error.message);
        return res.status(500).json({ message: error.message });
    }
});

// Geocode: Get lat/lng from place ID
app.get('/geocode', async (req, res) => {
    try {
        const { placeId } = req.query;

        if (!placeId) {
            return res.status(400).json({ message: 'placeId parameter is required' });
        }

        if (!GOOGLE_MAPS_API_KEY) {
            // Fallback: return mock coordinates (Tashkent city center)
            return res.json({
                result: {
                    geometry: {
                        location: { lat: 41.2995, lng: 69.2401 }
                    },
                    formatted_address: 'Mock Address, Tashkent, Uzbekistan'
                }
            });
        }

        const response = await client.geocode({
            params: {
                place_id: placeId,
                key: GOOGLE_MAPS_API_KEY,
            }
        });

        if (response.data.results.length === 0) {
            return res.status(404).json({ message: 'Location not found' });
        }

        return res.json({ result: response.data.results[0] });
    } catch (error) {
        console.error('Geocode error:', error.message);
        return res.status(500).json({ message: error.message });
    }
});

// Reverse Geocode: Get address from lat/lng
app.get('/reverse-geocode', async (req, res) => {
    try {
        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ message: 'lat and lng parameters are required' });
        }

        if (!GOOGLE_MAPS_API_KEY) {
            // Fallback: return mock address
            return res.json({
                result: {
                    formatted_address: `Mock Address at ${lat}, ${lng}`
                }
            });
        }

        const response = await client.reverseGeocode({
            params: {
                latlng: { lat: parseFloat(lat), lng: parseFloat(lng) },
                key: GOOGLE_MAPS_API_KEY,
            }
        });

        if (response.data.results.length === 0) {
            return res.status(404).json({ message: 'Address not found' });
        }

        return res.json({ result: response.data.results[0] });
    } catch (error) {
        console.error('Reverse geocode error:', error.message);
        return res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`location-service running on ${PORT}`);
    if (GOOGLE_MAPS_API_KEY) {
        console.log('✓ Google Maps API key configured');
    } else {
        console.warn('⚠ Google Maps API key not found, using mock data');
    }
});
