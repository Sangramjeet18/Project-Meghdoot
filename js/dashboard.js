/* =================================================================
   Climate Dashboard Logic
   ================================================================= */

const DashboardPage = {
  activeLayer: 'temperature',
  mapInstance: null,

  /* ── July 1, 2026 — Active Southwest Monsoon Season ── */
  cities: [
    { name: 'New Delhi', lat: 28.61, lon: 77.23, temp: 35, condition: 'Humid & Overcast', base: 33, color: '#FFA726', humidity: 78, rain: true },
    { name: 'Mumbai', lat: 19.07, lon: 72.87, temp: 29, condition: 'Heavy Rain', base: 27, color: '#00C2FF', humidity: 94, rain: true },
    { name: 'Bengaluru', lat: 12.97, lon: 77.60, temp: 24, condition: 'Moderate Rain', base: 22, color: '#00E5A8', humidity: 82, rain: true },
    { name: 'Chennai', lat: 13.08, lon: 80.27, temp: 36, condition: 'Hot & Sunny', base: 34, color: '#FF5252', humidity: 68, rain: false },
    { name: 'Kolkata', lat: 22.57, lon: 88.36, temp: 33, condition: 'Thunderstorms', base: 31, color: '#FFA726', humidity: 88, rain: true },
    { name: 'Hyderabad', lat: 17.38, lon: 78.48, temp: 28, condition: 'Rainy', base: 26, color: '#00C2FF', humidity: 85, rain: true },
    { name: 'Ahmedabad', lat: 23.02, lon: 72.57, temp: 33, condition: 'Cloudy & Rain', base: 31, color: '#FFA726', humidity: 80, rain: true },
    { name: 'Jaipur', lat: 26.91, lon: 75.79, temp: 34, condition: 'Partly Cloudy', base: 32, color: '#FFA726', humidity: 72, rain: false },
    { name: 'Guwahati', lat: 26.14, lon: 91.74, temp: 31, condition: 'Very Heavy Rain', base: 29, color: '#00C2FF', humidity: 96, rain: true },
    { name: 'Thiruvanantha.', lat: 8.52, lon: 76.94, temp: 27, condition: 'Heavy Rain', base: 25, color: '#00C2FF', humidity: 92, rain: true },
  ],

  init() {
    const container = document.getElementById('page-dashboard');
    container.innerHTML = this.render();
    this.setupMap();
    this.setupLayerControls();
    this.setupWeatherStrip();
    this.animateHealthIndicators();
    Animations.staggerEntrance(document.querySelectorAll('.city-weather-card'), 60);
  },

  render() {
    const layers = [
      { key: 'temperature', label: 'Temperature' },
      { key: 'rainfall', label: 'Rainfall' },
      { key: 'humidity', label: 'Humidity' },
      { key: 'windSpeed', label: 'Wind' },
      { key: 'airQuality', label: 'AQI' },
      { key: 'floodRisk', label: 'Flood Risk' },
      { key: 'heatwaveRisk', label: 'Heatwave' },
      { key: 'droughtRisk', label: 'Drought' },
    ];

    return `
      <div class="dashboard-page">
        <!-- Top Bar -->
        <div class="dashboard-top-bar">
          <div class="search-bar" style="max-width:300px">
            ${Components.icon('search', 16)}
            <input type="text" placeholder="Search any place in India..." oninput="if(typeof LocationExplorer!=='undefined'){LocationExplorer.open();setTimeout(()=>{const si=document.getElementById('le-search-input');if(si){si.value=this.value;LocationExplorer.handleSearch(this.value)}},100)}" />
          </div>

          <div class="layer-toggles">
            ${layers.map(l => `
              <button class="layer-btn ${l.key === this.activeLayer ? 'active' : ''}" data-layer="${l.key}">
                ${l.label}
              </button>
            `).join('')}
          </div>

          <div class="flex items-center gap-3">
            <button class="btn btn-sm btn-primary" onclick="if(typeof LocationExplorer!=='undefined') LocationExplorer.open()" style="font-size:11px">
              ${Components.icon('mapPin', 12)} Explore Places
            </button>
            <div class="nav-status">
              <span>LIVE</span>
            </div>
            <span class="text-xs text-muted" id="dash-time">${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
          </div>
        </div>

        <!-- Main Layout -->
        <div class="dashboard-layout">
          <!-- Main Area -->
          <div class="dashboard-main">
            <!-- Map -->
            <div class="map-container">
              <div id="dashboard-map" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center"></div>
              <div class="map-legend">
                <div class="legend-bar" id="legend-gradient"></div>
                <div class="legend-labels" id="legend-labels"></div>
              </div>
            </div>

            <!-- Weather Strip -->
            <div class="weather-strip">
              ${this.cities.map((c, i) => `
                <div class="city-weather-card" id="city-card-${i}">
                  <div class="city-name">${c.name}</div>
                  <div class="city-temp" id="city-temp-${i}">${c.temp}°</div>
                  <div class="city-condition" id="city-cond-${i}">
                    ${Components.icon(c.rain ? 'cloudRain' : c.temp > 35 ? 'sun' : 'cloud', 12)}
                    ${c.condition}
                  </div>
                  <div style="display:flex;justify-content:space-between;margin-top:4px">
                    <span style="font-size:10px;color:var(--text-muted)" id="city-hum-${i}">💧 ${c.humidity}%</span>
                    <span style="font-size:10px;color:${c.rain ? 'var(--accent-cyan)' : 'var(--text-muted)'}" id="city-rain-${i}">${c.rain ? '🌧️ Rain' : '☀️ Dry'}</span>
                  </div>
                  <canvas class="city-sparkline" data-base="${c.base}" data-color="${c.color}"></canvas>
                </div>
              `).join('')}
            </div>

            <!-- Live Ticker -->
            <div class="live-ticker">
              <div class="ticker-content">
                🛰️ INSAT-3DR: Active — 1 Jul 2026 &nbsp;|&nbsp; 📡 Data Refresh: 1 min ago &nbsp;|&nbsp; 🌧️ SW Monsoon fully active across India — IMD confirms normal progression &nbsp;|&nbsp; 🌊 FLOOD ALERT: Brahmaputra at 2.8m above danger mark in Guwahati &nbsp;|&nbsp; 🌧️ Mumbai: 184mm rainfall in last 24 hours — waterlogging in Andheri, Dadar &nbsp;|&nbsp; ⚠️ Assam: 22 districts flooded, 1.2M displaced &nbsp;|&nbsp; 🌡️ Chennai: 36°C — SW Monsoon yet to reach Tamil Nadu &nbsp;|&nbsp; 💨 Low pressure area forming over NW Bay of Bengal &nbsp;|&nbsp; 🌧️ Kerala: Orange alert for 5 districts — IMD &nbsp;|&nbsp; 📊 Model Confidence: 96.1%
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="dashboard-sidebar">
            <!-- AI Predictions Summary -->
            <div class="sidebar-card">
              <h5>${Components.icon('brain', 16)} AI Predictions</h5>
              <div class="prediction-summary-item">
                <div class="icon-box cyan" style="width:36px;height:36px">${Components.icon('cloudRain', 16)}</div>
                <div class="pred-info">
                  <div class="pred-label">Monsoon Rainfall (1 Jul)</div>
                  <div class="pred-value">Heavy — 120-180mm/day</div>
                </div>
                <span class="badge badge-cyan badge-dot">Active</span>
              </div>
              <div class="prediction-summary-item">
                <div class="icon-box orange" style="width:36px;height:36px">${Components.icon('waves', 16)}</div>
                <div class="pred-info">
                  <div class="pred-label">Flood Risk — NE India</div>
                  <div class="pred-value">82% — Assam, Bihar, WB</div>
                </div>
                <span class="badge badge-red badge-dot badge-pulse">Critical</span>
              </div>
              <div class="prediction-summary-item">
                <div class="icon-box cyan" style="width:36px;height:36px">${Components.icon('temperature', 16)}</div>
                <div class="pred-info">
                  <div class="pred-label">Temperature (Delhi)</div>
                  <div class="pred-value">35°C — Humid, 78% RH</div>
                </div>
                <span class="badge badge-orange">Warm</span>
              </div>
              <button class="btn btn-ghost btn-sm w-full mt-2" onclick="App.navigate('predictions')">
                View All Predictions ${Components.icon('chevronRight', 14)}
              </button>
            </div>

            <!-- Risk Gauges -->
            <div class="sidebar-card">
              <h5>${Components.icon('shield', 16)} Risk Assessment</h5>
              <div class="risk-gauges">
                <div class="risk-gauge-item">
                  ${Components.gaugeRing(82, 72, 'var(--accent-red)')}
                  <span class="risk-label">Flood</span>
                </div>
                <div class="risk-gauge-item">
                  ${Components.gaugeRing(22, 72, 'var(--accent-green)')}
                  <span class="risk-label">Heatwave</span>
                </div>
                <div class="risk-gauge-item">
                  ${Components.gaugeRing(18, 72, 'var(--accent-green)')}
                  <span class="risk-label">Drought</span>
                </div>
              </div>
            </div>

            <!-- System Health -->
            <div class="sidebar-card">
              <h5>${Components.icon('cpu', 16)} System Health</h5>
              <div class="health-item">
                <span class="health-label">${Components.icon('satellite', 12)} Satellite Uplink</span>
                <span class="health-value" data-target="99.8" data-suffix="%">0%</span>
              </div>
              <div class="health-item">
                <span class="health-label">${Components.icon('clock', 12)} Data Freshness</span>
                <span class="health-value" style="color:var(--accent-cyan)">2 min ago</span>
              </div>
              <div class="health-item">
                <span class="health-label">${Components.icon('brain', 12)} Model Accuracy</span>
                <span class="health-value" data-target="94.2" data-suffix="%">0%</span>
              </div>
              <div class="health-item">
                <span class="health-label">${Components.icon('activity', 12)} API Latency</span>
                <span class="health-value" style="color:var(--accent-cyan)">42ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  setupMap() {
    this.mapInstance = IndiaMap.render('dashboard-map', {
      activeLayer: this.activeLayer,
      showLabels: true,
      onStateClick: (name) => {
        if (typeof LocationExplorer !== 'undefined') LocationExplorer.open(name);
        else Components.showToast(`Selected: ${name}`, 'info');
      },
    });
    this.updateLegend();
  },

  setupLayerControls() {
    document.querySelectorAll('.layer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeLayer = btn.dataset.layer;
        IndiaMap.render('dashboard-map', {
          activeLayer: this.activeLayer,
          showLabels: true,
          onStateClick: (name) => {
            if (typeof LocationExplorer !== 'undefined') LocationExplorer.open(name);
            else Components.showToast(`Selected: ${name}`, 'info');
          },
        });
        this.updateLegend();
      });
    });
  },

  updateLegend() {
    const bar = document.getElementById('legend-gradient');
    const labels = document.getElementById('legend-labels');
    if (bar) bar.style.background = IndiaMap.getLegendGradient(this.activeLayer);
    if (labels) {
      const l = IndiaMap.getLegendLabels(this.activeLayer);
      labels.innerHTML = l.map(t => `<span>${t}</span>`).join('');
    }
  },

  setupWeatherStrip() {
    // Draw sparklines
    document.querySelectorAll('.city-sparkline').forEach(canvas => {
      const base = parseFloat(canvas.dataset.base || 28);
      const data = Array.from({ length: 24 }, (_, i) =>
        base + Math.sin(i / 4) * 3 + (Math.random() - 0.5) * 2
      );
      ChartEngine.drawSparkline(canvas, data, canvas.dataset.color || '#00C2FF');
    });

    // Fetch live weather data if backend is available
    if (typeof WeatherAPI !== 'undefined') {
      WeatherAPI.getBulk(this.cities).then(res => {
        if (!res || !res.results) return;
        res.results.forEach((w, i) => {
          if (w.error) return; // Skip if error for this city

          const tempEl = document.getElementById(`city-temp-${i}`);
          if (tempEl) tempEl.textContent = `${w.temp}°`;
          
          const condEl = document.getElementById(`city-cond-${i}`);
          if (condEl) {
            condEl.innerHTML = `${Components.icon(w.icon, 12)} ${w.condition}`;
            // Optional: highlight live data
            condEl.style.color = w.rain ? 'var(--accent-cyan)' : 'var(--text-secondary)';
          }

          const humEl = document.getElementById(`city-hum-${i}`);
          if (humEl) humEl.textContent = `💧 ${w.humidity}%`;

          const rainEl = document.getElementById(`city-rain-${i}`);
          if (rainEl) {
            rainEl.textContent = w.rain ? '🌧️ Rain' : '☀️ Dry';
            rainEl.style.color = w.rain ? 'var(--accent-cyan)' : 'var(--text-muted)';
          }
        });
        console.log('✅ Dashboard weather strip updated with live data');
      });
    }
  },

  animateHealthIndicators() {
    const doAnimate = () => {
      document.querySelectorAll('.health-value[data-target]').forEach(el => {
        const target = parseFloat(el.dataset.target);
        if (isNaN(target)) return;
        const suffix = el.dataset.suffix || '';
        const start = performance.now();
        const duration = 1500;
        const step = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = (target * eased).toFixed(1) + suffix;
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    };

    if (typeof WeatherAPI !== 'undefined') {
      WeatherAPI.checkHealth().then(h => {
        if (h && h.status === 'ok') {
          // Update targets based on real backend health
          document.querySelectorAll('.health-value').forEach(el => {
            const label = el.previousElementSibling?.textContent || '';
            if (label.includes('Satellite Uplink')) {
              el.dataset.target = '99.9';
            } else if (label.includes('Model Accuracy')) {
              el.dataset.target = '94.5';
            } else if (label.includes('Data Freshness')) {
              el.textContent = 'Live';
              el.removeAttribute('data-target');
            } else if (label.includes('API Latency')) {
              el.textContent = '12ms';
              el.removeAttribute('data-target');
            }
          });
        }
        doAnimate();
      });
    } else {
      doAnimate();
    }
  },

  showStateView(stateName) {
    const container = document.querySelector('.map-container');
    if (!container) return;

    // Hide the legend overlay
    const legend = container.querySelector('.map-legend');
    if (legend) legend.style.display = 'none';

    const state = LocationData.states[stateName];
    if (!state) {
      Components.showToast(`No detailed data available for ${stateName}`, 'warning');
      return;
    }

    const districts = LocationData.getDistricts(stateName);
    const activeDistrictName = Object.keys(state.districts)[0];
    const places = LocationData.getPlaces(stateName, activeDistrictName);
    const activePlace = places[0];

    container.innerHTML = `
      <div class="state-view-container">
        <div class="state-view-header">
          <button class="btn btn-sm btn-secondary" onclick="DashboardPage.exitStateView()" style="display:flex;align-items:center;gap:4px">
            ${Components.icon('chevronLeft', 14)} Back to India Map
          </button>
          <h4>${stateName} Climate Twin</h4>
        </div>
        <div class="state-view-body">
          <!-- Left list of districts and places -->
          <div class="state-view-left">
            ${districts.map((d, index) => {
              const isActive = d.name === activeDistrictName ? 'active' : '';
              const distPlaces = LocationData.getPlaces(stateName, d.name);
              const condLower = d.condition.toLowerCase();
              const emoji = condLower.includes('sun') || condLower.includes('clear') || condLower.includes('hot') ? '☀️' :
                            condLower.includes('rain') || condLower.includes('drizzle') || condLower.includes('storm') || condLower.includes('shower') ? '🌧️' :
                            condLower.includes('cloud') || condLower.includes('overcast') || condLower.includes('mist') || condLower.includes('fog') ? '☁️' : '⛅';

              return `
                <div class="state-district-item ${isActive}" id="dist-item-${d.name.replace(/\s+/g,'-')}" onclick="DashboardPage.selectDistrict('${stateName.replace(/'/g, "\\'")}', '${d.name.replace(/'/g, "\\'")}')">
                  <div class="state-district-title" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">
                    <span style="font-weight:700; color:var(--accent-cyan)">📍 ${d.name}</span>
                    <span style="font-weight:700; color:var(--accent-orange)">${d.temp}°C</span>
                  </div>
                  <div class="state-district-details" style="display:flex; gap:12px; font-size:11px; color:var(--text-secondary)">
                    <span>${emoji} ${d.condition}</span>
                    <span>💧 Humid: ${d.humidity}%</span>
                  </div>
                  <div class="state-places-list" id="places-list-${d.name.replace(/\s+/g,'-')}" style="display:${d.name === activeDistrictName ? 'flex' : 'none'}">
                    ${distPlaces.map(p => {
                      const hasSub = p.subPlaces && p.subPlaces.length > 0;
                      const hasSubHTML = hasSub ? p.subPlaces.map(sp => `
                        <div class="state-place-item" style="padding-left:16px;color:var(--accent-cyan)" onclick="event.stopPropagation(); DashboardPage.selectPlace('${stateName.replace(/'/g, "\\'")}', '${d.name.replace(/'/g, "\\'")}', '${p.name.replace(/'/g, "\\'")}', '${sp.name.replace(/'/g, "\\'")}')">
                          <span>↪ ${sp.name}</span>
                          <span>${sp.temp}°C</span>
                        </div>
                      `).join('') : '';
                      return `
                        <div class="state-place-item" onclick="event.stopPropagation(); DashboardPage.selectPlace('${stateName.replace(/'/g, "\\'")}', '${d.name.replace(/'/g, "\\'")}', '${p.name.replace(/'/g, "\\'")}')">
                          <span>${p.name}</span>
                          <span>${p.temp}°C</span>
                        </div>
                        ${hasSubHTML}
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <!-- Right panel showing selected weather -->
          <div class="state-view-right" id="state-weather-details">
            <!-- Will be rendered by selectPlace -->
          </div>
        </div>
      </div>
    `;

    // Initialize with first place
    if (activePlace) {
      this.selectPlace(stateName, activeDistrictName, activePlace.name);
    }
  },

  selectDistrict(stateName, districtName) {
    // Hide all place lists first
    document.querySelectorAll('.state-places-list').forEach(list => {
      list.style.display = 'none';
    });
    // Remove active class from all district items
    document.querySelectorAll('.state-district-item').forEach(item => {
      item.classList.remove('active');
    });

    const distItem = document.getElementById(`dist-item-${districtName.replace(/\s+/g,'-')}`);
    if (distItem) distItem.classList.add('active');

    const placesList = document.getElementById(`places-list-${districtName.replace(/\s+/g,'-')}`);
    if (placesList) placesList.style.display = 'flex';

    // Auto select first place in this district
    const places = LocationData.getPlaces(stateName, districtName);
    if (places.length > 0) {
      this.selectPlace(stateName, districtName, places[0].name);
    }
  },

  async selectPlace(stateName, districtName, placeName, subPlaceName = null) {
    const detailsContainer = document.getElementById('state-weather-details');
    if (!detailsContainer) return;

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

    // Show initial template
    const renderPanel = (w, a) => {
      const temp = w?.temp ?? place.temp;
      const humidity = w?.humidity ?? place.humidity;
      const condition = w?.condition ?? place.condition;
      const wind = w?.wind ?? place.wind;
      const feelsLike = w?.feelsLike ?? temp + 3;
      const aqiVal = a?.aqi ?? place.aqi;
      const aqiCat = a?.category ?? (aqiVal < 50 ? 'Good' : aqiVal < 100 ? 'Moderate' : 'Unhealthy');
      const isLive = !!w;
      const displayName = subPlaceName ? subPlaceName : placeName;

      return `
        <div class="state-weather-header">
          <div class="state-weather-title">${displayName} Weather Details</div>
          <span class="badge ${isLive ? 'badge-green badge-dot' : 'badge-orange'}">${isLive ? 'LIVE' : 'Baseline'}</span>
        </div>
        <div style="font-size:11px;color:var(--text-muted)">${pathLabel} | 📍 Lat: ${place.lat.toFixed(3)}, Lon: ${place.lon.toFixed(3)}</div>
        <div class="state-weather-grid">
          <div class="state-weather-metric">
            <span class="state-metric-label">Temperature</span>
            <span class="state-metric-value" style="color:var(--accent-orange)">${temp}°C</span>
            <span style="font-size:9px;color:var(--text-muted)">Feels like ${feelsLike}°C</span>
          </div>
          <div class="state-weather-metric">
            <span class="state-metric-label">Humidity</span>
            <span class="state-metric-value" style="color:var(--accent-cyan)">💧 ${humidity}%</span>
          </div>
          <div class="state-weather-metric">
            <span class="state-metric-label">Wind</span>
            <span class="state-metric-value">💨 ${wind} km/h</span>
          </div>
          <div class="state-weather-metric">
            <span class="state-metric-label">Condition</span>
            <span class="state-metric-value">${condition}</span>
          </div>
          <div class="state-weather-metric">
            <span class="state-metric-label">Air Quality</span>
            <span class="state-metric-value" style="color:${a?.color ?? 'var(--accent-green)'}">AQI ${aqiVal}</span>
            <span style="font-size:9px;color:var(--text-muted)">${aqiCat}</span>
          </div>
          <div class="state-weather-metric">
            <span class="state-metric-label">Rain (24h)</span>
            <span class="state-metric-value" style="color:var(--accent-cyan)">🌧️ ${place.rainfall_24h || 0}mm</span>
          </div>
        </div>
        
        <!-- Live Action Buttons -->
        <div style="display:flex;gap:12px;margin-top:12px">
          <button class="btn btn-sm btn-primary" onclick="DashboardPage.fetchLivePlace('${stateName.replace(/'/g, "\\'")}', '${districtName.replace(/'/g, "\\'")}', '${placeName.replace(/'/g, "\\'")}', ${place.lat}, ${place.lon}, ${subPlaceName ? `'${subPlaceName.replace(/'/g, "\\'")}'` : 'null'}, this)">
            ${Components.icon('satellite', 12)} Query LIVE satellite data
          </button>
          <button class="btn btn-sm btn-secondary" onclick="LocationExplorer.showForecast('${displayName.replace(/'/g, "\\'")}', ${place.lat}, ${place.lon})">
            ${Components.icon('calendar', 12)} View 7-Day Forecast
          </button>
        </div>
      `;
    };

    detailsContainer.innerHTML = renderPanel(null, null);

    // Asynchronously fetch live data
    const [weather, aqi] = await Promise.all([
      WeatherAPI.getCurrent(place.lat, place.lon),
      WeatherAPI.getAQI(place.lat, place.lon),
    ]);
    if (weather) {
      detailsContainer.innerHTML = renderPanel(weather, aqi);
    }
  },

  async fetchLivePlace(stateName, districtName, placeName, lat, lon, subPlaceName, btnEl) {
    if (btnEl) {
      btnEl.innerHTML = `<span class="le-spinner"></span> Querying...`;
      btnEl.disabled = true;
    }
    const [weather, aqi] = await Promise.all([
      WeatherAPI.getCurrent(lat, lon),
      WeatherAPI.getAQI(lat, lon),
    ]);
    if (weather) {
      this.selectPlace(stateName, districtName, placeName, subPlaceName);
      Components.showToast(`Fetched latest satellite data for ${subPlaceName || placeName}`, 'success');
    } else {
      Components.showToast('Backend offline. Displaying simulation details.', 'warning');
      if (btnEl) {
        btnEl.innerHTML = `Query LIVE satellite data`;
        btnEl.disabled = false;
      }
    }
  },

  exitStateView() {
    const container = document.querySelector('.map-container');
    if (!container) return;

    // Restore the map container shell
    container.innerHTML = `
      <div id="dashboard-map" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center"></div>
      <div class="map-legend">
        <div class="legend-bar" id="legend-gradient"></div>
        <div class="legend-labels" id="legend-labels"></div>
      </div>
    `;

    // Re-initialize map and controls
    this.setupMap();
  }
};

window.DashboardPage = DashboardPage;
