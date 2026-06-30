/* =================================================================
   AI Predictions Page Logic
   ================================================================= */

const PredictionsPage = {
  init() {
    const container = document.getElementById('page-predictions');
    container.innerHTML = this.render();
    requestAnimationFrame(() => {
      this.animateConfidenceBars();
      this.setupGauges();
      this.fetchLiveForecast();
      Animations.staggerEntrance(document.querySelectorAll('.prediction-card'), 100);
    });
  },

  render() {
    /* ── July 1, 2026 — Peak Monsoon 7-Day Forecast (North India) ── */
    const days = ['1 Jul', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'];
    const dayTemps = [35, 34, 33, 32, 34, 33, 35];
    const dayLows = [27, 27, 26, 26, 27, 26, 27];
    const dayConditions = ['Rain', 'T-Storm', 'Heavy Rain', 'Rain', 'Cloudy', 'Rain', 'P. Cloudy'];
    const dayIcons = ['cloudRain', 'cloudLightning', 'cloudRain', 'cloudRain', 'cloud', 'cloudRain', 'cloud'];

    return `
      <div class="predictions-page">
        <!-- Hero Header -->
        <div class="predictions-hero">
          <div class="hero-icon">${Components.icon('brain', 28)}</div>
          <div>
            <h2>AI Climate Predictions</h2>
            <p>Machine learning models analyzing satellite imagery, weather station data, and historical patterns
              to deliver high-confidence forecasts for temperature, rainfall, and extreme weather events.</p>
          </div>
          <div class="ml-auto flex items-center gap-3 hide-mobile">
            <span class="badge badge-green badge-dot">Models Online</span>
            <span class="text-xs text-muted">Last updated: 5 min ago</span>
          </div>
        </div>

        <!-- Period Selector -->
        <div class="period-selector">
          <div class="toggle-group">
            <button class="toggle-btn active">7-Day</button>
            <button class="toggle-btn">30-Day</button>
            <button class="toggle-btn">90-Day</button>
          </div>
        </div>

        <!-- Prediction Cards Grid -->
        <div class="predictions-grid">
          <!-- Temperature Forecast (Monsoon-adjusted) -->
          <div class="prediction-card border-orange">
            <div class="card-header">
              <div class="icon-box orange" style="width:40px;height:40px">${Components.icon('temperature', 20)}</div>
              <span class="badge badge-orange">Warm & Humid</span>
            </div>
            <div class="predicted-value" style="color:var(--accent-orange)">35°C</div>
            <div class="predicted-label">Predicted Max Temperature (Delhi, 1 Jul)</div>
            <div class="confidence-section">
              <div class="conf-header"><span>Confidence</span><span>94%</span></div>
              <div class="conf-bar"><div class="confidence-fill" data-value="94"></div></div>
            </div>
            <div class="card-gauge"><canvas id="gauge-temp" width="90" height="90"></canvas></div>
            <div class="trend-text">Monsoon has moderated temperatures from the 45°C+ heatwave of June. Humidity at 78%. Feels-like temperature ~42°C due to high moisture. Overnight minimum 27°C. Rain likely by evening.</div>
          </div>

          <!-- Monsoon Rainfall Prediction -->
          <div class="prediction-card border-cyan">
            <div class="card-header">
              <div class="icon-box cyan" style="width:40px;height:40px">${Components.icon('cloudRain', 20)}</div>
              <span class="badge badge-cyan badge-dot badge-pulse">Monsoon Peak</span>
            </div>
            <div class="predicted-value" style="color:var(--accent-cyan)">180mm</div>
            <div class="predicted-label">Expected Rainfall Today (Mumbai)</div>
            <div class="confidence-section">
              <div class="conf-header"><span>Confidence</span><span>91%</span></div>
              <div class="conf-bar"><div class="confidence-fill" data-value="91"></div></div>
            </div>
            <div class="card-gauge"><canvas id="gauge-rain" width="90" height="90"></canvas></div>
            <div class="trend-text">SW Monsoon fully active as of 1 July. Mumbai received 184mm in last 24h. Waterlogging reported. Konkan coast: 150-200mm/day. NE India: 200-300mm/day. Weekly national total: ~380mm. Monsoon trough active from Rajasthan to NE India.</div>
          </div>

          <!-- Flood Risk — CRITICAL -->
          <div class="prediction-card border-red">
            <div class="card-header">
              <div class="icon-box red" style="width:40px;height:40px">${Components.icon('waves', 20)}</div>
              <span class="badge badge-red badge-dot badge-pulse">Critical</span>
            </div>
            <div class="predicted-value" style="color:var(--accent-red)">82%</div>
            <div class="predicted-label">Flood Probability — Assam, Bihar, West Bengal</div>
            <div class="confidence-section">
              <div class="conf-header"><span>Confidence</span><span>93%</span></div>
              <div class="conf-bar"><div class="confidence-fill" data-value="93"></div></div>
            </div>
            <div class="card-gauge"><canvas id="gauge-flood" width="90" height="90"></canvas></div>
            <div class="trend-text">🚨 ACTIVE FLOODING: Brahmaputra at 2.8m above danger mark at Guwahati. 22 districts in Assam, 14 in Bihar submerged. 1.2 million displaced. Kosi barrage under stress. NDRF: 42 teams deployed. Mumbai: Urban flooding in low-lying areas.</div>
          </div>

          <!-- Monsoon Humidity Index -->
          <div class="prediction-card border-green">
            <div class="card-header">
              <div class="icon-box green" style="width:40px;height:40px">${Components.icon('droplet', 20)}</div>
              <span class="badge badge-green">Normal</span>
            </div>
            <div class="predicted-value" style="color:var(--accent-green)">85%</div>
            <div class="predicted-label">Average Relative Humidity (National)</div>
            <div class="confidence-section">
              <div class="conf-header"><span>Confidence</span><span>96%</span></div>
              <div class="conf-bar"><div class="confidence-fill" data-value="96"></div></div>
            </div>
            <div class="card-gauge"><canvas id="gauge-drought" width="90" height="90"></canvas></div>
            <div class="trend-text">Monsoon has recharged water reservoirs to 41% capacity (rising). Humidity: Mumbai 94%, Kolkata 88%, Delhi 78%, Bengaluru 82%. Kharif sowing progressing well with adequate moisture. Drought risk dropped from 34% (June) to 18%.</div>
          </div>

          <!-- Low Pressure / Cyclone Watch -->
          <div class="prediction-card border-purple">
            <div class="card-header">
              <div class="icon-box purple" style="width:40px;height:40px">${Components.icon('cloudLightning', 20)}</div>
              <span class="badge badge-orange badge-dot">Forming</span>
            </div>
            <div class="predicted-value" style="color:var(--accent-purple)">28%</div>
            <div class="predicted-label">Low Pressure Intensification Probability</div>
            <div class="confidence-section">
              <div class="conf-header"><span>Confidence</span><span>88%</span></div>
              <div class="conf-bar"><div class="confidence-fill" data-value="88"></div></div>
            </div>
            <div class="card-gauge"><canvas id="gauge-cyclone" width="90" height="90"></canvas></div>
            <div class="trend-text">Low-pressure area over NW Bay of Bengal (19°N, 87°E) is enhancing monsoon rainfall along Odisha coast. SST: 29.8°C. May intensify into a depression within 72 hours. If it does, Odisha and AP coasts to receive 200mm+ rainfall.</div>
          </div>

          <!-- Landslide Risk -->
          <div class="prediction-card border-orange">
            <div class="card-header">
              <div class="icon-box orange" style="width:40px;height:40px">${Components.icon('alert', 20)}</div>
              <span class="badge badge-orange badge-dot">High Risk</span>
            </div>
            <div class="predicted-value" style="color:var(--accent-orange)">64%</div>
            <div class="predicted-label">Landslide Probability — Western Ghats & Himalaya</div>
            <div class="confidence-section">
              <div class="conf-header"><span>Confidence</span><span>86%</span></div>
              <div class="conf-bar"><div class="confidence-fill" data-value="86"></div></div>
            </div>
            <div class="card-gauge"><canvas id="gauge-heatwave" width="90" height="90"></canvas></div>
            <div class="trend-text">Heavy monsoon rainfall has saturated slopes in Kerala, Karnataka Ghats, Uttarakhand, and Himachal. Soil moisture at 92%. IMD issued Orange alert for Wayanad (Kerala) and Chamoli (Uttarakhand). 14 roads closed in Himachal Pradesh.</div>
          </div>
        </div>

        <!-- 7-Day Forecast Timeline -->
        <div class="forecast-timeline-section">
          ${Components.sectionHeader('7-Day Forecast (1-7 Jul 2026)', 'Monsoon week outlook — Delhi NCR')}
          <div class="forecast-timeline">
            ${days.map((d, i) => `
              <div class="forecast-day ${i === 0 ? 'today' : ''}">
                <div class="day-name">${d}</div>
                <div style="margin:8px 0">${Components.icon(dayIcons[i], 22)}</div>
                <div class="day-temp">${dayTemps[i]}°</div>
                <div class="day-range">${dayLows[i]}° / ${dayTemps[i]}°</div>
                <div class="day-condition">${dayConditions[i]}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- AI Recommendations -->
        ${Components.sectionHeader('AI Recommendations', 'Automated action items — 1 July 2026')}
        <div class="recommendations-grid">
          <div class="recommendation-card sev-critical">
            <div class="rec-icon icon-box red" style="width:40px;height:40px">${Components.icon('waves', 18)}</div>
            <div>
              <h5>Evacuate Flood-Affected Districts in Assam</h5>
              <p>22 districts submerged. Deploy additional 15 NDRF teams. Activate all relief camps in Barpeta, Nalbari, Morigaon.</p>
              <button class="btn btn-sm btn-danger mt-2">Emergency Deploy</button>
            </div>
          </div>
          <div class="recommendation-card sev-critical">
            <div class="rec-icon icon-box red" style="width:40px;height:40px">${Components.icon('alert', 18)}</div>
            <div>
              <h5>Mumbai Waterlogging Alert</h5>
              <p>184mm rain in 24h. Issue advisory for Andheri, Dadar, Sion, Kurla. Activate MCGM pumping stations at full capacity.</p>
              <button class="btn btn-sm btn-danger mt-2">Issue Alert</button>
            </div>
          </div>
          <div class="recommendation-card sev-warning">
            <div class="rec-icon icon-box orange" style="width:40px;height:40px">${Components.icon('alert', 18)}</div>
            <div>
              <h5>Landslide Watch: Western Ghats & Himalayas</h5>
              <p>Close vulnerable roads in Wayanad, Kodagu, Chamoli, Kinnaur. Deploy geological survey teams for slope monitoring.</p>
              <button class="btn btn-sm btn-secondary mt-2">Activate Watch</button>
            </div>
          </div>
          <div class="recommendation-card sev-info">
            <div class="rec-icon icon-box green" style="width:40px;height:40px">${Components.icon('trendUp', 18)}</div>
            <div>
              <h5>Kharif Sowing Update</h5>
              <p>Adequate monsoon moisture across central India. Issue advisory for rice transplantation in Punjab, Haryana. Soybean sowing window open in MP.</p>
              <button class="btn btn-sm btn-secondary mt-2">Draft Advisory</button>
            </div>
          </div>
        </div>

        <!-- AI Insight Panel -->
        <div class="insight-panel">
          <h4>${Components.icon('brain', 20)} AI Analysis Summary — 1 July 2026</h4>
          <p>The Southwest Monsoon has fully covered India as of 30 June 2026, on schedule per IMD's forecast. The monsoon trough runs from
          Ganganagar (Rajasthan) to NW Bay of Bengal, driving heavy rainfall across the Gangetic plains, Northeast India, and Western Ghats.
          Our ensemble model (3 deep learning + 2 physics-based) shows <strong>93% consensus</strong> on continued heavy to very heavy rain (150-250mm/day)
          in Assam, Meghalaya, and Sub-Himalayan West Bengal for the next 5 days. A low-pressure area over NW Bay of Bengal (19°N, 87°E) is
          intensifying monsoon flow, bringing 180mm+ rain to Mumbai's Konkan coast. Brahmaputra is at 2.8m above danger level at Guwahati —
          the highest since July 2022. Flood risk is CRITICAL for NE India. Chennai remains dry as SW Monsoon doesn't directly affect Tamil Nadu coast
          (NE Monsoon arrives Oct-Dec). Landslide risk is HIGH in Western Ghats (Kerala, Karnataka) and Himalayan states (Uttarakhand, HP) due to
          soil saturation. <strong>Overall climate stress index: 7.8/10 (High) — driven by active flooding and landslide risk.</strong></p>
        </div>
      </div>
    `;
  },

  animateConfidenceBars() {
    document.querySelectorAll('.confidence-fill').forEach(bar => {
      const target = bar.dataset.value + '%';
      setTimeout(() => { bar.style.width = target; }, 300);
    });
  },

  setupGauges() {
    const gauges = [
      { id: 'gauge-temp', value: 94, color: '#FFA726', label: 'Confidence' },
      { id: 'gauge-rain', value: 91, color: '#00C2FF', label: 'Confidence' },
      { id: 'gauge-flood', value: 82, color: '#FF5252', label: 'Probability' },
      { id: 'gauge-drought', value: 85, color: '#00E5A8', label: 'Humidity' },
      { id: 'gauge-cyclone', value: 28, color: '#A855F7', label: 'Low Press.' },
      { id: 'gauge-heatwave', value: 64, color: '#FFA726', label: 'Landslide' },
    ];
    gauges.forEach(g => {
      const canvas = document.getElementById(g.id);
      if (canvas) ChartEngine.drawGauge(canvas, g.value, 100, g.color, g.label);
    });
  },

  async fetchLiveForecast() {
    if (typeof WeatherAPI === 'undefined') return;
    const lat = 28.61; // Delhi NCR Coordinates
    const lon = 77.23;
    const forecast = await WeatherAPI.getForecast(lat, lon);
    if (!forecast || !forecast.days) return;
    const timelineEl = document.querySelector('.forecast-timeline');
    if (!timelineEl) return;
    timelineEl.innerHTML = forecast.days.map((d, i) => `
      <div class="forecast-day ${i === 0 ? 'today' : ''}">
        <div class="day-name">${i === 0 ? 'Today' : d.dayName}</div>
        <div style="margin:8px 0">${Components.icon(d.icon, 22)}</div>
        <div class="day-temp">${Math.round(d.maxTemp)}°</div>
        <div class="day-range">${Math.round(d.minTemp)}° / ${Math.round(d.maxTemp)}°</div>
        <div class="day-condition">${d.condition}</div>
      </div>
    `).join('');
    console.log('✅ AI Predictions 7-Day Forecast updated with live data from Open-Meteo');
  }
};

window.PredictionsPage = PredictionsPage;
