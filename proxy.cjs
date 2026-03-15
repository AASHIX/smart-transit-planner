const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'http://localhost:8080' }));

const API_KEY = process.env.VITE_TRANSIT_API_KEY;
const BASE_URL = 'https://external.transitapp.com';

app.get('/api/nearby_routes', async (req, res) => {
  try {
    const params = new URLSearchParams(req.query);
    const response = await fetch(`${BASE_URL}/v3/public/nearby_routes?${params}`, {
      headers: { apiKey: API_KEY }
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/nearby_stops', async (req, res) => {
  try {
    const params = new URLSearchParams(req.query);
    const response = await fetch(`${BASE_URL}/v3/public/nearby_stops?${params}`, {
      headers: { apiKey: API_KEY }
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/vehicles', async (req, res) => {
  try {
    const response = await fetch('https://drtonline.durhamregiontransit.com/gtfsrealtime/VehiclePositions');
    const buffer = await response.arrayBuffer();
    res.set('Content-Type', 'application/octet-stream');
    res.send(Buffer.from(buffer));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3001, () => console.log('Proxy running on http://localhost:3001'));