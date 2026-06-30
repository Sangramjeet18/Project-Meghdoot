/* =================================================================
   Climate Digital Twin — Backend Server
   Real-time weather via Open-Meteo API (free, no key required)
   Air quality via Open-Meteo Air Quality API
   ================================================================= */

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

/* ═══════════════════════════════════════════════════════════════════
   In-Memory Cache — avoid hammering APIs
   ═══════════════════════════════════════════════════════════════════ */
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

/* ═══════════════════════════════════════════════════════════════════
   WMO Weather Code → Human Readable + Icon
   ═══════════════════════════════════════════════════════════════════ */
function decodeWeatherCode(code) {
  const map = {
    0: { condition: 'Clear Sky', icon: 'sun', rain: false },
    1: { condition: 'Mainly Clear', icon: 'sun', rain: false },
    2: { condition: 'Partly Cloudy', icon: 'cloud', rain: false },
    3: { condition: 'Overcast', icon: 'cloud', rain: false },
    45: { condition: 'Fog', icon: 'cloud', rain: false },
    48: { condition: 'Depositing Rime Fog', icon: 'cloud', rain: false },
    51: { condition: 'Light Drizzle', icon: 'cloudRain', rain: true },
    53: { condition: 'Moderate Drizzle', icon: 'cloudRain', rain: true },
    55: { condition: 'Dense Drizzle', icon: 'cloudRain', rain: true },
    56: { condition: 'Freezing Light Drizzle', icon: 'cloudRain', rain: true },
    57: { condition: 'Freezing Dense Drizzle', icon: 'cloudRain', rain: true },
    61: { condition: 'Light Rain', icon: 'cloudRain', rain: true },
    63: { condition: 'Moderate Rain', icon: 'cloudRain', rain: true },
    65: { condition: 'Heavy Rain', icon: 'cloudRain', rain: true },
    66: { condition: 'Freezing Light Rain', icon: 'cloudRain', rain: true },
    67: { condition: 'Freezing Heavy Rain', icon: 'cloudRain', rain: true },
    71: { condition: 'Light Snowfall', icon: 'cloud', rain: false },
    73: { condition: 'Moderate Snowfall', icon: 'cloud', rain: false },
    75: { condition: 'Heavy Snowfall', icon: 'cloud', rain: false },
    77: { condition: 'Snow Grains', icon: 'cloud', rain: false },
    80: { condition: 'Light Rain Showers', icon: 'cloudRain', rain: true },
    81: { condition: 'Moderate Rain Showers', icon: 'cloudRain', rain: true },
    82: { condition: 'Violent Rain Showers', icon: 'cloudRain', rain: true },
    85: { condition: 'Light Snow Showers', icon: 'cloud', rain: false },
    86: { condition: 'Heavy Snow Showers', icon: 'cloud', rain: false },
    95: { condition: 'Thunderstorm', icon: 'cloudLightning', rain: true },
    96: { condition: 'Thunderstorm with Light Hail', icon: 'cloudLightning', rain: true },
    99: { condition: 'Thunderstorm with Heavy Hail', icon: 'cloudLightning', rain: true },
  };
  return map[code] || { condition: 'Unknown', icon: 'cloud', rain: false };
}

/* ═══════════════════════════════════════════════════════════════════
   API Routes
   ═══════════════════════════════════════════════════════════════════ */

// ── Current Weather by Coordinates ───────────────────────────────
app.get('/api/weather/current', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });

    const cacheKey = `weather_${parseFloat(lat).toFixed(2)}_${parseFloat(lon).toFixed(2)}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,rain,showers,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,cloud_cover&timezone=Asia/Kolkata`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.current) throw new Error('No data from Open-Meteo');

    const wmo = decodeWeatherCode(data.current.weather_code);
    const result = {
      source: 'Open-Meteo',
      timestamp: data.current.time,
      temp: Math.round(data.current.temperature_2m * 10) / 10,
      feelsLike: Math.round(data.current.apparent_temperature * 10) / 10,
      humidity: data.current.relative_humidity_2m,
      rain: data.current.rain > 0 || data.current.showers > 0,
      rainfall: Math.round((data.current.rain + data.current.showers) * 10) / 10,
      condition: wmo.condition,
      icon: wmo.icon,
      wind: Math.round(data.current.wind_speed_10m * 10) / 10,
      windDir: data.current.wind_direction_10m,
      pressure: data.current.surface_pressure,
      cloudCover: data.current.cloud_cover,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
    };

    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('Weather API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch weather', detail: err.message });
  }
});

// ── 7-Day Forecast ───────────────────────────────────────────────
app.get('/api/weather/forecast', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });

    const cacheKey = `forecast_${parseFloat(lat).toFixed(2)}_${parseFloat(lon).toFixed(2)}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,rain_sum,showers_sum,wind_speed_10m_max,relative_humidity_2m_max,relative_humidity_2m_min&timezone=Asia/Kolkata&forecast_days=7`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.daily) throw new Error('No forecast data');

    const days = data.daily.time.map((date, i) => {
      const wmo = decodeWeatherCode(data.daily.weather_code[i]);
      return {
        date,
        dayName: new Date(date).toLocaleDateString('en-IN', { weekday: 'short' }),
        maxTemp: data.daily.temperature_2m_max[i],
        minTemp: data.daily.temperature_2m_min[i],
        rain: data.daily.rain_sum[i] + data.daily.showers_sum[i],
        wind: data.daily.wind_speed_10m_max[i],
        humidityMax: data.daily.relative_humidity_2m_max[i],
        humidityMin: data.daily.relative_humidity_2m_min[i],
        condition: wmo.condition,
        icon: wmo.icon,
        isRainy: wmo.rain,
      };
    });

    const result = { source: 'Open-Meteo', days };
    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('Forecast API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch forecast', detail: err.message });
  }
});

// ── Hourly Forecast (24h) ────────────────────────────────────────
app.get('/api/weather/hourly', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });

    const cacheKey = `hourly_${parseFloat(lat).toFixed(2)}_${parseFloat(lon).toFixed(2)}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,rain,showers,weather_code,wind_speed_10m,cloud_cover&timezone=Asia/Kolkata&forecast_hours=24`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.hourly) throw new Error('No hourly data');

    const hours = data.hourly.time.map((time, i) => {
      const wmo = decodeWeatherCode(data.hourly.weather_code[i]);
      return {
        time,
        hour: new Date(time).getHours(),
        temp: data.hourly.temperature_2m[i],
        humidity: data.hourly.relative_humidity_2m[i],
        rain: data.hourly.rain[i] + data.hourly.showers[i],
        wind: data.hourly.wind_speed_10m[i],
        cloudCover: data.hourly.cloud_cover[i],
        condition: wmo.condition,
        icon: wmo.icon,
      };
    });

    const result = { source: 'Open-Meteo', hours };
    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('Hourly API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch hourly data', detail: err.message });
  }
});

// ── Air Quality ──────────────────────────────────────────────────
app.get('/api/weather/aqi', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });

    const cacheKey = `aqi_${parseFloat(lat).toFixed(2)}_${parseFloat(lon).toFixed(2)}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=Asia/Kolkata`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.current) throw new Error('No AQI data');

    const aqi = data.current.us_aqi;
    let category = 'Good';
    let color = '#00E5A8';
    if (aqi > 300) { category = 'Hazardous'; color = '#8B0000'; }
    else if (aqi > 200) { category = 'Very Unhealthy'; color = '#A855F7'; }
    else if (aqi > 150) { category = 'Unhealthy'; color = '#FF5252'; }
    else if (aqi > 100) { category = 'Unhealthy for Sensitive'; color = '#FFA726'; }
    else if (aqi > 50) { category = 'Moderate'; color = '#FACC15'; }

    const result = {
      source: 'Open-Meteo Air Quality',
      aqi, category, color,
      pm25: data.current.pm2_5,
      pm10: data.current.pm10,
      co: data.current.carbon_monoxide,
      no2: data.current.nitrogen_dioxide,
      so2: data.current.sulphur_dioxide,
      o3: data.current.ozone,
    };

    setCache(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('AQI API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch AQI', detail: err.message });
  }
});

// ── Bulk Weather for Multiple Locations ──────────────────────────
app.post('/api/weather/bulk', async (req, res) => {
  try {
    const { locations } = req.body;
    if (!locations || !Array.isArray(locations)) {
      return res.status(400).json({ error: 'locations array required' });
    }

    const results = await Promise.all(
      locations.slice(0, 20).map(async (loc) => {
        try {
          const cacheKey = `weather_${parseFloat(loc.lat).toFixed(2)}_${parseFloat(loc.lon).toFixed(2)}`;
          const cached = getCached(cacheKey);
          if (cached) return { ...cached, name: loc.name };

          const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,rain,showers,weather_code,wind_speed_10m&timezone=Asia/Kolkata`;
          const response = await fetch(url);
          const data = await response.json();

          if (!data.current) return { name: loc.name, error: 'No data' };

          const wmo = decodeWeatherCode(data.current.weather_code);
          const result = {
            name: loc.name,
            temp: Math.round(data.current.temperature_2m * 10) / 10,
            feelsLike: Math.round(data.current.apparent_temperature * 10) / 10,
            humidity: data.current.relative_humidity_2m,
            rain: data.current.rain > 0 || data.current.showers > 0,
            condition: wmo.condition,
            icon: wmo.icon,
            wind: Math.round(data.current.wind_speed_10m * 10) / 10,
            lat: loc.lat,
            lon: loc.lon,
          };

          setCache(cacheKey, result);
          return result;
        } catch (e) {
          return { name: loc.name, error: e.message };
        }
      })
    );

    res.json({ source: 'Open-Meteo', results });
  } catch (err) {
    console.error('Bulk weather error:', err.message);
    res.status(500).json({ error: 'Failed to fetch bulk weather' });
  }
});

// ── FNO Surrogate Simulation Run ─────────────────────────────────
app.get('/api/simulation/run', (req, res) => {
  const pw = parseFloat(req.query.physics_weight) || 0.75;
  const oh = parseFloat(req.query.ocean_heat) || 1.2;
  const gs = parseFloat(req.query.greenspace) || 90.0;
  const ae = parseFloat(req.query.aerosol) || 30.0;

  const scriptPath = path.join(__dirname, 'model', 'inference.py');
  const cmd = `python "${scriptPath}" --physics_weight ${pw} --ocean_heat ${oh} --greenspace ${gs} --aerosol ${ae}`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Simulation Execution Error: ${error.message}`);
      return res.status(500).json({ error: 'Failed to execute simulation', detail: error.message });
    }

    const outputPath = path.join(__dirname, 'model', 'simulation_output.json');
    fs.readFile(outputPath, 'utf8', (readErr, data) => {
      if (readErr) {
        console.error(`Error reading simulation output: ${readErr.message}`);
        return res.status(500).json({ error: 'Failed to read simulation results' });
      }

      try {
        const results = JSON.parse(data);
        res.json(results);
      } catch (parseErr) {
        res.status(500).json({ error: 'Invalid simulation output format' });
      }
    });
  });
});

// ── Health Check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    cacheSize: cache.size,
    timestamp: new Date().toISOString(),
  });
});

// ── SPA Fallback ─────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/* ═══════════════════════════════════════════════════════════════════
   Start Server
   ═══════════════════════════════════════════════════════════════════ */
app.listen(PORT, () => {
  console.log(`\n  🛰️  Climate Digital Twin Server`);
  console.log(`  ─────────────────────────────────`);
  console.log(`  ✅ Running on http://localhost:${PORT}`);
  console.log(`  📡 Weather API: Open-Meteo (free, no key)`);
  console.log(`  💨 AQI API: Open-Meteo Air Quality`);
  console.log(`  📦 Cache TTL: ${CACHE_TTL / 1000}s\n`);
});
