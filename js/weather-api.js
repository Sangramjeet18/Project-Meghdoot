/* =================================================================
   Weather API Client — Fetches REAL weather from backend
   Connects to /api/weather/* endpoints → Open-Meteo
   ================================================================= */

const WeatherAPI = {
  baseUrl: window.location.protocol === 'file:' ? 'http://localhost:3000' : '', // Same origin — backend serves frontend

  /* ── Current Weather ─────────────────────────────────────────── */
  async getCurrent(lat, lon) {
    try {
      const res = await fetch(`${this.baseUrl}/api/weather/current?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Weather API fallback for', lat, lon, err.message);
      return null;
    }
  },

  /* ── 7-Day Forecast ──────────────────────────────────────────── */
  async getForecast(lat, lon) {
    try {
      const res = await fetch(`${this.baseUrl}/api/weather/forecast?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Forecast API fallback', err.message);
      return null;
    }
  },

  /* ── Hourly Forecast ─────────────────────────────────────────── */
  async getHourly(lat, lon) {
    try {
      const res = await fetch(`${this.baseUrl}/api/weather/hourly?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Hourly API fallback', err.message);
      return null;
    }
  },

  /* ── Air Quality Index ───────────────────────────────────────── */
  async getAQI(lat, lon) {
    try {
      const res = await fetch(`${this.baseUrl}/api/weather/aqi?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('AQI API fallback', err.message);
      return null;
    }
  },

  /* ── Bulk Weather for Multiple Cities ────────────────────────── */
  async getBulk(locations) {
    try {
      const res = await fetch(`${this.baseUrl}/api/weather/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Bulk weather API fallback', err.message);
      return null;
    }
  },

  /* ── Health Check ────────────────────────────────────────────── */
  async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`);
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  }
};

window.WeatherAPI = WeatherAPI;
