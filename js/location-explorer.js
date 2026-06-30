/* =================================================================
   Location Explorer — Drill-down: State → District → Place
   With LIVE weather data from Open-Meteo via backend
   ================================================================= */

const LocationExplorer = {
  breadcrumb: [], // [{type, name}]
  isOpen: false,
  liveMode: false, // true when backend is available

  async init() {
    // Check if backend is available for live data
    const health = await WeatherAPI.checkHealth();
    this.liveMode = health.status === 'ok';
    console.log(`📍 Location Explorer: ${this.liveMode ? '🟢 LIVE data (Open-Meteo)' : '🟡 Offline (simulated data)'}`);
  },

  open(stateName) {
    this.isOpen = true;
    this.breadcrumb = [];
    if (stateName && LocationData.states[stateName]) {
      this.showDistricts(stateName);
    } else {
      this.showStates();
    }
  },

  close() {
    this.isOpen = false;
    const container = document.getElementById('location-explorer-container');
    if (container) {
      container.classList.remove('open');
      const panel = document.getElementById('location-explorer');
      if (panel) panel.classList.remove('open');
      setTimeout(() => container.remove(), 400);
    }
  },

  /* ── Render the Explorer Panel ────────────────────────────────── */
  _renderPanel(title, breadcrumbHTML, contentHTML) {
    let container = document.getElementById('location-explorer-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'location-explorer-container';
      container.className = 'le-modal-wrapper';
      document.body.appendChild(container);
    }

    container.innerHTML = `
      <div class="le-modal-overlay" onclick="LocationExplorer.close()"></div>
      <div class="location-explorer" id="location-explorer">
        <div class="le-header">
          <div class="le-title-row">
            <h4>${Components.icon('mapPin', 18)} ${title}</h4>
            <div class="flex items-center gap-2">
              <span class="badge ${this.liveMode ? 'badge-green badge-dot' : 'badge-orange'}">${this.liveMode ? 'LIVE' : 'Simulated'}</span>
              <button class="le-close" onclick="LocationExplorer.close()" aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
          <div class="le-breadcrumb">
            <span class="le-crumb" onclick="LocationExplorer.showStates()">🇮🇳 India</span>
            ${breadcrumbHTML}
          </div>
          <div class="le-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="le-search-input" placeholder="Search any place in India..." oninput="LocationExplorer.handleSearch(this.value)" />
          </div>
        </div>
        <div class="le-content" id="le-content">
          ${contentHTML}
        </div>
      </div>
    `;

    requestAnimationFrame(() => {
      container.classList.add('open');
      const panel = document.getElementById('location-explorer');
      if (panel) panel.classList.add('open');
    });
  },

  /* ── Show States ──────────────────────────────────────────────── */
  showStates() {
    this.breadcrumb = [];
    const states = LocationData.getStateList();

    const html = `
      <div class="le-grid">
        ${states.map(s => `
          <div class="le-card" onclick="LocationExplorer.showDistricts('${s.name}')">
            <div class="le-card-header">
              <span class="le-card-name">${s.name}</span>
              <span class="le-card-temp" style="color:${s.temp > 35 ? 'var(--accent-red)' : s.temp < 25 ? 'var(--accent-cyan)' : 'var(--accent-orange)'}">${s.temp}°C</span>
            </div>
            <div class="le-card-details">
              <span>${Components.icon(s.rain ? 'cloudRain' : 'sun', 12)} ${s.condition}</span>
              <span>💧 ${s.humidity}%</span>
            </div>
            ${s.rain ? `<div class="le-rain-indicator">🌧️ ${s.rainfall_24h}mm/24h</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;

    this._renderPanel('Select State', '', html);
  },

  /* ── Show Districts ───────────────────────────────────────────── */
  async showDistricts(stateName) {
    this.breadcrumb = [{ type: 'state', name: stateName }];
    const state = LocationData.states[stateName];
    const districts = LocationData.getDistricts(stateName);

    const getProbabilities = (d) => {
      const cond = d.condition.toLowerCase();
      const baseSeed = (d.temp || 27) + (d.humidity || 80);
      const factor = (baseSeed * 7) % 10;
      
      let rainProb = 10;
      let shineProb = 90;

      if (d.rain || cond.includes('rain') || cond.includes('storm') || cond.includes('drizzle')) {
        rainProb = Math.min(Math.max(d.humidity - 5 + factor, 75), 98);
        shineProb = 100 - rainProb;
      } else if (cond.includes('cloud') || cond.includes('overcast') || cond.includes('mist')) {
        rainProb = 35 + factor;
        shineProb = 65 - factor;
      } else {
        rainProb = 5 + factor;
        shineProb = 95 - factor;
      }
      return { rainProb, shineProb };
    };

    const breadcrumbHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      <span class="le-crumb active">${stateName}</span>
    `;

    // State summary card
    const stateSummary = `
      <div class="le-state-summary">
        <div class="le-summary-title">
          <h5>${stateName}</h5>
          <span class="badge ${state.rain ? 'badge-cyan badge-dot' : 'badge-orange'}">${state.condition}</span>
        </div>
        <div class="le-summary-stats">
          <div class="le-stat">
            <span class="le-stat-label">Temperature</span>
            <span class="le-stat-value">${state.temp}°C</span>
          </div>
          <div class="le-stat">
            <span class="le-stat-label">Humidity</span>
            <span class="le-stat-value">${state.humidity}%</span>
          </div>
          <div class="le-stat">
            <span class="le-stat-label">Wind</span>
            <span class="le-stat-value">${state.wind} km/h</span>
          </div>
          <div class="le-stat">
            <span class="le-stat-label">AQI</span>
            <span class="le-stat-value">${state.aqi}</span>
          </div>
          <div class="le-stat">
            <span class="le-stat-label">Rain (24h)</span>
            <span class="le-stat-value">${state.rainfall_24h}mm</span>
          </div>
        </div>
        <div class="le-live-btn-row">
          <button class="btn btn-sm btn-primary" onclick="LocationExplorer.fetchLiveState('${stateName}', ${state.districts[Object.keys(state.districts)[0]]?.places?.[0]?.lat || 0}, ${state.districts[Object.keys(state.districts)[0]]?.places?.[0]?.lon || 0})">
            ${Components.icon('satellite', 14)} Fetch LIVE Data
          </button>
        </div>
      </div>
    `;

    const districtCards = `
      <h6 class="le-section-title">Districts (${districts.length})</h6>
      <div class="le-grid">
        ${districts.map(d => {
          const probs = getProbabilities(d);
          return `
            <div class="le-card" onclick="LocationExplorer.showPlaces('${stateName}', '${d.name.replace(/'/g, "\\'")}')">
              <div class="le-card-header">
                <span class="le-card-name">${d.name}</span>
                <span class="le-card-temp" style="color:${d.temp > 35 ? 'var(--accent-red)' : d.temp < 22 ? 'var(--accent-cyan)' : 'var(--accent-orange)'}">${d.temp}°C</span>
              </div>
              <div class="le-card-details" style="display:flex; flex-direction:column; gap:4px">
                <span style="display:flex; align-items:center; gap:4px">${Components.icon(d.rain ? 'cloudRain' : 'sun', 12)} ${d.condition}</span>
                <span style="display:flex; align-items:center; gap:4px">💧 Humidity: ${d.humidity}%</span>
                <span style="display:flex; align-items:center; gap:4px">🌧️ Rain status: ${d.rain ? 'Yes' : 'No'}</span>
                <span style="display:flex; align-items:center; gap:4px">☔ Rain probability: ${probs.rainProb}%</span>
                <span style="display:flex; align-items:center; gap:4px">☀️ Shiny probability: ${probs.shineProb}%</span>
                <span style="display:flex; align-items:center; gap:4px">🏢 HQ: ${d.hq}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    this._renderPanel(`${stateName}`, breadcrumbHTML, stateSummary + districtCards);
  },

  /* ── Show Places ──────────────────────────────────────────────── */
  async showPlaces(stateName, districtName) {
    this.breadcrumb = [
      { type: 'state', name: stateName },
      { type: 'district', name: districtName },
    ];
    const places = LocationData.getPlaces(stateName, districtName);
    const dist = LocationData.states[stateName]?.districts[districtName];

    const breadcrumbHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      <span class="le-crumb" onclick="LocationExplorer.showDistricts('${stateName}')">${stateName}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      <span class="le-crumb active">${districtName}</span>
    `;

    const placeCards = places.map(p => {
      const hasSub = p.subPlaces && p.subPlaces.length > 0;
      const clickAction = hasSub
        ? `LocationExplorer.showSubPlaces('${stateName}', '${districtName.replace(/'/g, "\\'")}', '${p.name.replace(/'/g, "\\'")}')`
        : `LocationExplorer.showPlaceDetail('${stateName}', '${districtName.replace(/'/g, "\\'")}', '${p.name.replace(/'/g, "\\'")}')`;

      return `
        <div class="le-place-card" id="place-${p.name.replace(/\s+/g,'-')}" onclick="${clickAction}">
          <div class="le-place-header">
            <div>
              <div class="le-place-name">${p.name}</div>
              <div class="le-place-path">${districtName}, ${stateName}</div>
            </div>
            <div class="le-place-temp" style="color:${p.temp > 35 ? 'var(--accent-red)' : p.temp < 22 ? 'var(--accent-cyan)' : 'var(--accent-orange)'}">${p.temp}°</div>
          </div>
          <div class="le-place-weather">
            <span class="le-weather-tag">${Components.icon(p.rain ? 'cloudRain' : p.temp > 35 ? 'sun' : 'cloud', 13)} ${p.condition}</span>
            <span class="le-weather-tag">💧 ${p.humidity}%</span>
            <span class="le-weather-tag">💨 ${p.wind} km/h</span>
            ${p.rain ? `<span class="le-weather-tag rain">🌧️ ${p.rainfall_24h}mm</span>` : `<span class="le-weather-tag dry">☀️ Dry</span>`}
          </div>
          ${p.note ? `<div class="le-place-note">${p.note}</div>` : ''}
          ${hasSub ? `
            <div style="font-size:11px;color:var(--accent-cyan);margin-top:4px;display:flex;align-items:center;gap:4px">
              ${Components.icon('chevronRight', 12)} Click to view ${p.subPlaces.length} sub-locations (e.g. Lhabagan)
            </div>
          ` : ''}
          <div class="le-place-actions">
            <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); LocationExplorer.fetchLivePlace('${p.name.replace(/'/g, "\\'")}', ${p.lat}, ${p.lon}, this)">
              ${Components.icon('satellite', 12)} Live Weather
            </button>
            <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); LocationExplorer.showForecast('${p.name.replace(/'/g, "\\'")}', ${p.lat}, ${p.lon})">
              ${Components.icon('calendar', 12)} 7-Day
            </button>
          </div>
        </div>
      `;
    }).join('');

    this._renderPanel(`${districtName}`, breadcrumbHTML, `
      <div class="le-district-info">
        <span>HQ: <strong>${dist?.hq || districtName}</strong></span>
        <span>${places.length} locations</span>
      </div>
      <div class="le-places-list">${placeCards}</div>
    `);
  },

  /* ── Show Subplaces (Neighborhoods) ── */
  async showSubPlaces(stateName, districtName, placeName) {
    this.breadcrumb = [
      { type: 'state', name: stateName },
      { type: 'district', name: districtName },
      { type: 'place', name: placeName },
    ];
    const subPlaces = LocationData.getSubPlaces(stateName, districtName, placeName);

    const breadcrumbHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      <span class="le-crumb" onclick="LocationExplorer.showDistricts('${stateName}')">${stateName}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      <span class="le-crumb" onclick="LocationExplorer.showPlaces('${stateName}', '${districtName.replace(/'/g, "\\'")}')">${districtName}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      <span class="le-crumb active">${placeName}</span>
    `;

    const subPlaceCards = subPlaces.map(sp => `
      <div class="le-place-card" onclick="LocationExplorer.showPlaceDetail('${stateName}', '${districtName.replace(/'/g, "\\'")}', '${placeName.replace(/'/g, "\\'")}', '${sp.name.replace(/'/g, "\\'")}')">
        <div class="le-place-header">
          <div>
            <div class="le-place-name">${sp.name}</div>
            <div class="le-place-path">${placeName}, ${districtName}, ${stateName}</div>
          </div>
          <div class="le-place-temp" style="color:${sp.temp > 35 ? 'var(--accent-red)' : sp.temp < 22 ? 'var(--accent-cyan)' : 'var(--accent-orange)'}">${sp.temp}°</div>
        </div>
        <div class="le-place-weather">
          <span class="le-weather-tag">${Components.icon(sp.rain ? 'cloudRain' : sp.temp > 35 ? 'sun' : 'cloud', 13)} ${sp.condition}</span>
          <span class="le-weather-tag">💧 ${sp.humidity}%</span>
          <span class="le-weather-tag">💨 ${sp.wind} km/h</span>
          ${sp.rain ? `<span class="le-weather-tag rain">🌧️ ${sp.rainfall_24h}mm</span>` : `<span class="le-weather-tag dry">☀️ Dry</span>`}
        </div>
        ${sp.note ? `<div class="le-place-note">${sp.note}</div>` : ''}
        <div class="le-place-actions">
          <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); LocationExplorer.fetchLivePlace('${sp.name.replace(/'/g, "\\'")}', ${sp.lat}, ${sp.lon}, this)">
            ${Components.icon('satellite', 12)} Live Weather
          </button>
          <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); LocationExplorer.showForecast('${sp.name.replace(/'/g, "\\'")}', ${sp.lat}, ${sp.lon})">
            ${Components.icon('calendar', 12)} 7-Day
          </button>
        </div>
      </div>
    `).join('');

    this._renderPanel(`${placeName}`, breadcrumbHTML, `
      <div class="le-district-info">
        <span>Parent Town: <strong>${placeName}</strong></span>
        <span>${subPlaces.length} neighborhoods/areas</span>
      </div>
      <div class="le-places-list">${subPlaceCards}</div>
    `);
  },

  /* ── Fetch LIVE Weather for a Place ──────────────────────────── */
  async fetchLivePlace(placeName, lat, lon, btnEl) {
    if (btnEl) {
      btnEl.innerHTML = `<span class="le-spinner"></span> Fetching...`;
      btnEl.disabled = true;
    }

    const [weather, aqi] = await Promise.all([
      WeatherAPI.getCurrent(lat, lon),
      WeatherAPI.getAQI(lat, lon),
    ]);

    if (!weather) {
      if (btnEl) { btnEl.innerHTML = '❌ API Offline'; btnEl.disabled = false; }
      Components.showToast('Backend not running. Start with: npm start', 'warning');
      return;
    }

    // Show result in a toast or update the card
    const aqiText = aqi ? ` | AQI: ${aqi.aqi} (${aqi.category})` : '';
    const msg = `<strong>${placeName}</strong> — LIVE: ${weather.temp}°C, ${weather.condition}, 💧${weather.humidity}%, 💨${weather.wind}km/h${aqiText}`;

    Components.showToast(msg, weather.rain ? 'info' : 'success');

    // Update the card in place
    const card = btnEl?.closest('.le-place-card');
    if (card) {
      const tempEl = card.querySelector('.le-place-temp');
      const weatherTags = card.querySelector('.le-place-weather');
      if (tempEl) {
        tempEl.textContent = `${weather.temp}°`;
        tempEl.style.color = weather.temp > 35 ? 'var(--accent-red)' : weather.temp < 22 ? 'var(--accent-cyan)' : 'var(--accent-orange)';
      }
      if (weatherTags) {
        weatherTags.innerHTML = `
          <span class="le-weather-tag">${Components.icon(weather.icon, 13)} ${weather.condition}</span>
          <span class="le-weather-tag">💧 ${weather.humidity}%</span>
          <span class="le-weather-tag">💨 ${weather.wind} km/h</span>
          <span class="le-weather-tag">🌡️ Feels ${weather.feelsLike}°</span>
          ${weather.rain ? `<span class="le-weather-tag rain">🌧️ Rain</span>` : `<span class="le-weather-tag dry">☀️ Dry</span>`}
          <span class="le-weather-tag live">✅ LIVE</span>
        `;
      }
    }

    if (btnEl) {
      btnEl.innerHTML = `✅ Updated`;
      btnEl.disabled = false;
    }
  },

  /* ── Fetch LIVE for State Capital ────────────────────────────── */
  async fetchLiveState(stateName, lat, lon) {
    if (!lat && !lon) return;
    const weather = await WeatherAPI.getCurrent(lat, lon);
    if (!weather) {
      Components.showToast('Backend not running. Start with: npm start', 'warning');
      return;
    }
    Components.showToast(`<strong>${stateName}</strong> LIVE: ${weather.temp}°C, ${weather.condition}, 💧${weather.humidity}%`, 'success');
  },

  /* ── Show 7-Day Forecast Modal ───────────────────────────────── */
  async showForecast(placeName, lat, lon) {
    Components.showToast(`Fetching 7-day forecast for ${placeName}...`, 'info');

    const forecast = await WeatherAPI.getForecast(lat, lon);
    if (!forecast) {
      Components.showToast('Backend not running. Start with: npm start', 'warning');
      return;
    }

    // Create forecast modal
    let modal = document.getElementById('forecast-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'forecast-modal';
    modal.className = 'le-modal';
    modal.innerHTML = `
      <div class="le-modal-overlay" onclick="this.parentElement.remove()"></div>
      <div class="le-modal-content">
        <div class="le-modal-header">
          <h4>${Components.icon('calendar', 18)} 7-Day Forecast — ${placeName}</h4>
          <button class="le-close" onclick="document.getElementById('forecast-modal').remove()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="le-modal-badge">
          <span class="badge badge-green badge-dot">LIVE from Open-Meteo</span>
          <span class="text-xs text-muted">Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}</span>
        </div>
        <div class="le-forecast-grid">
          ${forecast.days.map((d, i) => `
            <div class="le-forecast-day ${i === 0 ? 'today' : ''}">
              <div class="le-fday-name">${i === 0 ? 'Today' : d.dayName}</div>
              <div class="le-fday-date">${d.date.split('-').slice(1).join('/')}</div>
              <div class="le-fday-icon">${Components.icon(d.icon, 24)}</div>
              <div class="le-fday-temps">
                <span class="le-fday-max">${Math.round(d.maxTemp)}°</span>
                <span class="le-fday-min">${Math.round(d.minTemp)}°</span>
              </div>
              <div class="le-fday-condition">${d.condition}</div>
              <div class="le-fday-details">
                ${d.isRainy ? `<span>🌧️ ${Math.round(d.rain)}mm</span>` : '<span>☀️ Dry</span>'}
                <span>💧 ${d.humidityMax}%</span>
                <span>💨 ${Math.round(d.wind)} km/h</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('open'));
  },

  /* ── Place Detail View ───────────────────────────────────────── */
  async showPlaceDetail(stateName, districtName, placeName, subPlaceName = null) {
    let place;
    let pathLabel = `${districtName}, ${stateName}`;
    if (subPlaceName) {
      const subPlaces = LocationData.getSubPlaces(stateName, districtName, placeName);
      place = subPlaces.find(sp => sp.name === subPlaceName);
      pathLabel = `${placeName}, ${districtName}, ${stateName}`;
    } else {
      const places = LocationData.getPlaces(stateName, districtName);
      place = places.find(p => p.name === placeName);
    }
    if (!place) return;

    // Fetch live data in the background
    const weatherPromise = WeatherAPI.getCurrent(place.lat, place.lon);
    const aqiPromise = WeatherAPI.getAQI(place.lat, place.lon);

    // Show detail panel immediately with cached data
    let modal = document.getElementById('place-detail-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'place-detail-modal';
    modal.className = 'le-modal';

    const renderDetail = (w, a) => {
      const temp = w?.temp ?? place.temp;
      const humidity = w?.humidity ?? place.humidity;
      const condition = w?.condition ?? place.condition;
      const wind = w?.wind ?? place.wind;
      const feelsLike = w?.feelsLike ?? temp + 4;
      const isLive = !!w;
      const aqiVal = a?.aqi ?? place.aqi;
      const aqiCat = a?.category ?? (aqiVal < 50 ? 'Good' : aqiVal < 100 ? 'Moderate' : 'Unhealthy');
      const displayName = subPlaceName ? subPlaceName : placeName;

      return `
        <div class="le-modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="le-modal-content le-detail">
          <div class="le-modal-header">
            <div>
              <h4>${displayName}</h4>
              <p class="text-sm text-muted">${pathLabel}</p>
            </div>
            <button class="le-close" onclick="document.getElementById('place-detail-modal').remove()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="le-modal-badge">
            <span class="badge ${isLive ? 'badge-green badge-dot' : 'badge-orange'}">${isLive ? '✅ LIVE — Open-Meteo' : 'Simulated Data'}</span>
            <span class="text-xs text-muted">📍 ${place.lat.toFixed(4)}°N, ${place.lon.toFixed(4)}°E</span>
          </div>

          <div class="le-detail-hero">
            <div class="le-detail-temp">${Math.round(temp)}°<span class="le-detail-unit">C</span></div>
            <div class="le-detail-condition">
              ${Components.icon(w?.icon ?? (place.rain ? 'cloudRain' : 'sun'), 28)}
              <span>${condition}</span>
            </div>
            <div class="le-detail-feels">Feels like ${Math.round(feelsLike)}°C</div>
          </div>

          <div class="le-detail-grid">
            <div class="le-detail-item">
              <span class="le-detail-label">Humidity</span>
              <span class="le-detail-val">💧 ${humidity}%</span>
              <div class="le-mini-bar"><div style="width:${humidity}%;background:var(--accent-cyan)"></div></div>
            </div>
            <div class="le-detail-item">
              <span class="le-detail-label">Wind Speed</span>
              <span class="le-detail-val">💨 ${wind} km/h</span>
              <div class="le-mini-bar"><div style="width:${Math.min(wind*2, 100)}%;background:var(--accent-green)"></div></div>
            </div>
            <div class="le-detail-item">
              <span class="le-detail-label">Air Quality</span>
              <span class="le-detail-val" style="color:${a?.color ?? 'var(--accent-green)'}">AQI ${aqiVal} (${aqiCat})</span>
              <div class="le-mini-bar"><div style="width:${Math.min(aqiVal/3, 100)}%;background:${a?.color ?? 'var(--accent-green)'}"></div></div>
            </div>
            <div class="le-detail-item">
              <span class="le-detail-label">Rainfall (24h)</span>
              <span class="le-detail-val">${place.rain ? `🌧️ ${place.rainfall_24h}mm` : '☀️ No Rain'}</span>
              <div class="le-mini-bar"><div style="width:${Math.min((place.rainfall_24h || 0)/2, 100)}%;background:var(--accent-cyan)"></div></div>
            </div>
          </div>

          ${place.note ? `<div class="le-detail-note">⚠️ ${place.note}</div>` : ''}

          <div class="le-detail-actions">
            <button class="btn btn-sm btn-primary" onclick="LocationExplorer.showForecast('${displayName.replace(/'/g, "\\'")}', ${place.lat}, ${place.lon})">
              ${Components.icon('calendar', 14)} 7-Day Forecast
            </button>
            <button class="btn btn-sm btn-secondary" onclick="document.getElementById('place-detail-modal').remove()">Close</button>
          </div>
        </div>
      `;
    };

    modal.innerHTML = renderDetail(null, null);
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('open'));

    // Update with live data when it arrives
    const [weather, aqi] = await Promise.all([weatherPromise, aqiPromise]);
    if (weather) {
      modal.innerHTML = renderDetail(weather, aqi);
    }
  },

  /* ── Search Handler ──────────────────────────────────────────── */
  handleSearch(query) {
    if (query.length < 2) {
      // Show current view
      if (this.breadcrumb.length === 0) this.showStates();
      return;
    }

    const results = LocationData.searchPlace(query);
    const content = document.getElementById('le-content');
    if (!content) return;

    if (results.length === 0) {
      content.innerHTML = `
        <div class="le-empty">
          ${Components.icon('mapPin', 32)}
          <p>No places found for "<strong>${query}</strong>"</p>
          <p class="text-sm text-muted">Try searching for a city, town, or district name</p>
        </div>
      `;
      return;
    }

    // Check for duplicates (same name, different locations)
    const nameCount = {};
    results.forEach(r => {
      nameCount[r.name] = (nameCount[r.name] || 0) + 1;
    });

    content.innerHTML = `
      <div class="le-search-results">
        <p class="le-results-count">${results.length} result${results.length > 1 ? 's' : ''} for "<strong>${query}</strong>"</p>
        ${results.length > 1 && Object.values(nameCount).some(c => c > 1) ?
          `<div class="le-duplicate-notice">⚠️ Some places share the same name — check district & state to identify the correct location.</div>` : ''}
        <div class="le-places-list">
          ${results.map(r => {
            const clickAction = r.parentPlace 
              ? `LocationExplorer.showPlaceDetail('${r.state}', '${r.district.replace(/'/g, "\\'")}', '${r.parentPlace.replace(/'/g, "\\'")}', '${r.name.replace(/'/g, "\\'")}')`
              : `LocationExplorer.showPlaceDetail('${r.state}', '${r.district.replace(/'/g, "\\'")}', '${r.name.replace(/'/g, "\\'")}')`;
            
            const pathLabel = r.parentPlace 
              ? `${r.parentPlace}, ${r.district}, ${r.state}`
              : `${r.district}, ${r.state}`;

            return `
              <div class="le-place-card" onclick="${clickAction}">
                <div class="le-place-header">
                  <div>
                    <div class="le-place-name">${r.name}${nameCount[r.name] > 1 ? ` <span class="badge badge-orange" style="font-size:9px">DUPLICATE NAME</span>` : ''}</div>
                    <div class="le-place-path">${pathLabel}</div>
                  </div>
                  <div class="le-place-temp" style="color:${r.temp > 35 ? 'var(--accent-red)' : r.temp < 22 ? 'var(--accent-cyan)' : 'var(--accent-orange)'}">${r.temp}°</div>
                </div>
                <div class="le-place-weather">
                  <span class="le-weather-tag">${Components.icon(r.rain ? 'cloudRain' : 'sun', 13)} ${r.condition}</span>
                  <span class="le-weather-tag">💧 ${r.humidity}%</span>
                  <span class="le-weather-tag">💨 ${r.wind} km/h</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },
};

window.LocationExplorer = LocationExplorer;
