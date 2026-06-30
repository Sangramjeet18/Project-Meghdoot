/* =================================================================
   Climate Twin Operator Console Page Logic
   ================================================================= */

const TwinPage = {
  activeLayer: 'rainfall',
  physicsWeight: 0.75,
  oceanHeat: 1.2,
  greenspace: 90,
  aerosol: 30,
  showWinds: true,
  showStations: true,
  showTerrain: true,

  init() {
    const container = document.getElementById('page-twin');
    container.innerHTML = this.render();
    this.setupControls();
    this.renderMap();
    this.generateWindVectors();
    this.generateStationPins();
  },

  render() {
    return `
      <div class="twin-page">
        <!-- Curved Console Header -->
        <div class="twin-header-console">
          <div class="twin-header-subtext">BHARATIYA ANTARIKSH HACKATHON 2026</div>
          <div class="twin-header-title">PS5: AI-POWERED CLIMATE TWIN</div>
        </div>

        <div class="twin-layout">
          <!-- Left Panel: India Digital Twin Map -->
          <div class="twin-map-card">
            <div class="twin-map-title-badge">India Digital Twin Console</div>
            
            <!-- Map Container -->
            <div id="twin-map" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center"></div>

            <!-- Wind Vector Overlay -->
            <div class="twin-wind-overlay" id="twin-wind-overlay" style="display: block;"></div>

            <!-- Station Pins Layer -->
            <div class="twin-station-layer" id="twin-station-layer" style="display: block;"></div>

            <!-- Overlay Toggles (Top Right) -->
            <div class="twin-map-overlays-panel">
              <div class="twin-overlay-label">Map Overlays</div>
              <label class="twin-overlay-item">
                <span>Terrain</span>
                <input type="checkbox" id="chk-terrain" ${this.showTerrain ? 'checked' : ''} />
              </label>
              <label class="twin-overlay-item">
                <span>Stations</span>
                <input type="checkbox" id="chk-stations" ${this.showStations ? 'checked' : ''} />
              </label>
              <label class="twin-overlay-item">
                <span>Winds</span>
                <input type="checkbox" id="chk-winds" ${this.showWinds ? 'checked' : ''} />
              </label>
            </div>

            <!-- Legend (Bottom Left) -->
            <div class="twin-map-legend-box">
              <div class="twin-legend-title">Rainfall Intensity (SW Monsoon)</div>
              <div class="twin-legend-gradient-bar"></div>
              <div class="twin-legend-labels">
                <span>0</span>
                <span>250</span>
                <span>500mm</span>
              </div>
            </div>

            <!-- Simulation Loading Overlay -->
            <div class="twin-sim-overlay" id="twin-sim-overlay">
              <div class="twin-spinner"></div>
              <div style="font-weight: 700; color: var(--accent-cyan); font-size: var(--text-base); letter-spacing: 1px;">
                SOLVING PINN-FFNO FLUID EQUATIONS...
              </div>
              <div style="font-size: var(--text-xs); color: var(--text-muted);">
                Surrogate Navier-Stokes Loss Minimization Active
              </div>
            </div>
          </div>

          <!-- Right Panel: Command Center -->
          <div class="twin-console-card">
            <div class="twin-console-title">Climate Simulation Command Center</div>

            <!-- System Status -->
            <div class="twin-section-box">
              <div class="twin-section-hdr">System Status & Data Integrity</div>
              <div class="twin-metric-row">
                <span class="twin-metric-lbl">Model Architecture:</span>
                <div class="twin-status-badge">
                  <span class="twin-status-dot"></span>
                  PINN-FFNO SURROGATE
                </div>
              </div>
              <div class="twin-metric-row">
                <span class="twin-metric-lbl">ISRO Data Sync:</span>
                <span class="twin-metric-val" style="color: var(--accent-green)">ACTIVE (14:02 IST)</span>
              </div>
              <div class="twin-metric-row">
                <span class="twin-metric-lbl">Active Feeds:</span>
                <span class="twin-metric-val" style="font-size:9px">INSAT-3DR, SCATSAT-1, OCEANSAT</span>
              </div>
            </div>

            <!-- Surrogate Parameters -->
            <div class="twin-section-box">
              <div class="twin-section-hdr">Surrogate Model Parameters</div>
              
              <!-- Physics Weight -->
              <div class="twin-slider-group">
                <div class="twin-slider-hdr">
                  <span>Physics Weight (PINN)</span>
                  <span class="twin-slider-val" id="val-physics-weight">${this.physicsWeight.toFixed(2)}</span>
                </div>
                <input type="range" class="twin-range-input" id="range-physics-weight" min="0.0" max="1.0" step="0.05" value="${this.physicsWeight}" />
              </div>

              <div class="twin-metric-row" style="margin-top: 4px;">
                <span class="twin-metric-lbl">Navier-Stokes Constraint:</span>
                <span class="twin-metric-val" style="color: var(--accent-green)">ACTIVE</span>
              </div>
            </div>

            <!-- Scenario Simulator Sliders -->
            <div class="twin-section-box">
              <div class="twin-section-hdr">Scenario Simulator (What-If Analysis)</div>

              <!-- Ocean Heat Content -->
              <div class="twin-slider-group">
                <div class="twin-slider-hdr">
                  <span>Indian Ocean Heat Content</span>
                  <span class="twin-slider-val" id="val-ocean-heat">+${this.oceanHeat.toFixed(1)}°C</span>
                </div>
                <input type="range" class="twin-range-input" id="range-ocean-heat" min="-1.0" max="4.0" step="0.1" value="${this.oceanHeat}" />
              </div>

              <!-- Greenspace Index -->
              <div class="twin-slider-group" style="margin-top: 8px;">
                <div class="twin-slider-hdr">
                  <span>Greenspace Index (NDVI)</span>
                  <span class="twin-slider-val" id="val-greenspace">${this.greenspace}%</span>
                </div>
                <input type="range" class="twin-range-input" id="range-greenspace" min="10" max="100" step="5" value="${this.greenspace}" />
              </div>

              <!-- Aerosol Load -->
              <div class="twin-slider-group" style="margin-top: 8px;">
                <div class="twin-slider-hdr">
                  <span>Aerosol Load</span>
                  <span class="twin-slider-val" id="val-aerosol">Medium (${this.aerosol}%)</span>
                </div>
                <input type="range" class="twin-range-input" id="range-aerosol" min="10" max="100" step="5" value="${this.aerosol}" />
              </div>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; gap: 10px;">
              <button class="twin-run-btn" id="btn-run-simulation" style="flex: 1;">
                Run Simulation
                <span class="twin-btn-subtext">Inference Time: 1.4s</span>
              </button>
              <button class="twin-run-btn" id="btn-export-report" style="flex: 1; background: rgba(0,194,255,0.1); border-color: rgba(0,194,255,0.4); color: #00C2FF; display: none;">
                Export Report
                <span class="twin-btn-subtext" style="color: rgba(0,194,255,0.6);">Download Results</span>
              </button>
            </div>

            <!-- Analysis & Key Insights -->
            <div class="twin-section-box" style="gap: 4px;">
              <div class="twin-section-hdr">Analysis & Key Insights</div>
              <div class="twin-metric-row">
                <span class="twin-metric-lbl">Prediction Accuracy (vs. ERA5):</span>
                <span class="twin-metric-val" id="insight-accuracy" style="color: var(--accent-green)">94.2%</span>
              </div>
              <div class="twin-metric-row">
                <span class="twin-metric-lbl">Delays Onset:</span>
                <span class="twin-metric-val" id="insight-delay" style="color: var(--accent-orange)">Kerala (+5 Days)</span>
              </div>
              <div class="twin-metric-row">
                <span class="twin-metric-lbl">Drought Risk:</span>
                <span class="twin-metric-val" id="insight-drought" style="color: var(--accent-orange)">Rajasthan (Medium)</span>
              </div>
              <div class="twin-metric-row">
                <span class="twin-metric-lbl">Flood Risk:</span>
                <span class="twin-metric-val" id="insight-flood" style="color: var(--accent-red)">Western Ghats (High)</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  },

  setupControls() {
    // Sliders
    const rangePhysics = document.getElementById('range-physics-weight');
    const valPhysics = document.getElementById('val-physics-weight');
    if (rangePhysics && valPhysics) {
      rangePhysics.addEventListener('input', (e) => {
        this.physicsWeight = parseFloat(e.target.value);
        valPhysics.textContent = this.physicsWeight.toFixed(2);
      });
    }

    const rangeOcean = document.getElementById('range-ocean-heat');
    const valOcean = document.getElementById('val-ocean-heat');
    if (rangeOcean && valOcean) {
      rangeOcean.addEventListener('input', (e) => {
        this.oceanHeat = parseFloat(e.target.value);
        valOcean.textContent = (this.oceanHeat >= 0 ? '+' : '') + this.oceanHeat.toFixed(1) + '°C';
      });
    }

    const rangeGreenspace = document.getElementById('range-greenspace');
    const valGreenspace = document.getElementById('val-greenspace');
    if (rangeGreenspace && valGreenspace) {
      rangeGreenspace.addEventListener('input', (e) => {
        this.greenspace = parseInt(e.target.value);
        valGreenspace.textContent = `${this.greenspace}%`;
      });
    }

    const rangeAerosol = document.getElementById('range-aerosol');
    const valAerosol = document.getElementById('val-aerosol');
    if (rangeAerosol && valAerosol) {
      rangeAerosol.addEventListener('input', (e) => {
        this.aerosol = parseInt(e.target.value);
        let category = 'Low';
        if (this.aerosol > 70) category = 'High';
        else if (this.aerosol > 40) category = 'Medium';
        valAerosol.textContent = `${category} (${this.aerosol}%)`;
      });
    }

    // Checkboxes
    const chkTerrain = document.getElementById('chk-terrain');
    if (chkTerrain) {
      chkTerrain.addEventListener('change', (e) => {
        this.showTerrain = e.target.checked;
        const mapContainer = document.querySelector('.twin-map-card');
        if (mapContainer) {
          if (this.showTerrain) {
            mapContainer.style.background = 'radial-gradient(circle at 50% 30%, #0c142c 0%, #050814 100%)';
          } else {
            mapContainer.style.background = 'rgba(8, 12, 28, 0.9)';
          }
        }
      });
    }

    const chkWinds = document.getElementById('chk-winds');
    if (chkWinds) {
      chkWinds.addEventListener('change', (e) => {
        this.showWinds = e.target.checked;
        const windsLayer = document.getElementById('twin-wind-overlay');
        if (windsLayer) windsLayer.style.display = this.showWinds ? 'block' : 'none';
      });
    }

    const chkStations = document.getElementById('chk-stations');
    if (chkStations) {
      chkStations.addEventListener('change', (e) => {
        this.showStations = e.target.checked;
        const stationsLayer = document.getElementById('twin-station-layer');
        if (stationsLayer) stationsLayer.style.display = this.showStations ? 'block' : 'none';
      });
    }

    // Run Button
    const btnRun = document.getElementById('btn-run-simulation');
    if (btnRun) {
      btnRun.addEventListener('click', () => this.runSimulation());
    }

    // Export Button
    const btnExport = document.getElementById('btn-export-report');
    if (btnExport) {
      btnExport.addEventListener('click', () => this.exportReport());
    }
  },

  renderMap() {
    IndiaMap.render('twin-map', { activeLayer: 'rainfall', showLabels: false });
  },

  generateWindVectors() {
    const container = document.getElementById('twin-wind-overlay');
    if (!container) return;
    container.innerHTML = '';

    // Generate 40 drifting wind vector lines over the ocean area
    for (let i = 0; i < 40; i++) {
      const el = document.createElement('div');
      el.className = 'wind-vector';
      el.style.left = `${Math.random() * 90}%`;
      el.style.top = `${55 + Math.random() * 40}%`; // Limit mostly to ocean/bottom half
      el.style.animationDelay = `${Math.random() * 5}s`;
      el.style.animationDuration = `${3 + Math.random() * 4}s`;
      container.appendChild(el);
    }
  },

  generateStationPins() {
    const container = document.getElementById('twin-station-layer');
    if (!container) return;
    container.innerHTML = '';

    // Coordinates of major ISRO monitoring stations
    const stations = [
      { top: '25%', left: '48%' }, // Delhi
      { top: '56%', left: '38%' }, // Mumbai
      { top: '51%', left: '72%' }, // Kolkata
      { top: '78%', left: '50%' }, // Chennai
      { top: '70%', left: '44%' }, // Bangalore
      { top: '35%', left: '32%' }, // Rajasthan
      { top: '28%', left: '84%' }, // Assam
      { top: '15%', left: '46%' }, // Srinagar
    ];

    stations.forEach((pos, idx) => {
      const pin = document.createElement('div');
      pin.className = 'station-pin';
      pin.style.top = pos.top;
      pin.style.left = pos.left;
      pin.title = `INSAT Meteorological Station #${idx + 100}`;
      container.appendChild(pin);
    });
  },

  runSimulation() {
    const overlay = document.getElementById('twin-sim-overlay');
    if (overlay) overlay.classList.add('active');

    const getBaseUrl = () => window.location.protocol === 'file:' ? 'http://localhost:3000' : '';
    const url = `${getBaseUrl()}/api/simulation/run?physics_weight=${this.physicsWeight}&ocean_heat=${this.oceanHeat}&greenspace=${this.greenspace}&aerosol=${this.aerosol}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (overlay) overlay.classList.remove('active');

        if (data.status === 'success') {
          // Update Insights panel from python output
          const accuracyEl = document.getElementById('insight-accuracy');
          const delayEl = document.getElementById('insight-delay');
          const droughtEl = document.getElementById('insight-drought');
          const floodEl = document.getElementById('insight-flood');

          if (accuracyEl) accuracyEl.textContent = data.insights.prediction_accuracy;
          if (delayEl) {
            delayEl.textContent = data.insights.onset_delay;
            const days = parseInt(data.insights.onset_delay.match(/\d+/)?.[0] || 0);
            delayEl.style.color = days > 8 ? 'var(--accent-red)' : days > 4 ? 'var(--accent-orange)' : 'var(--accent-green)';
          }
          if (droughtEl) {
            droughtEl.textContent = data.insights.drought_risk;
            const lvl = data.insights.drought_risk;
            droughtEl.style.color = lvl.includes('Critical') || lvl.includes('High') ? 'var(--accent-red)' : lvl.includes('Medium') ? 'var(--accent-orange)' : 'var(--accent-green)';
          }
          if (floodEl) {
            floodEl.textContent = data.insights.flood_risk;
            const lvl = data.insights.flood_risk;
            floodEl.style.color = lvl.includes('Critical') || lvl.includes('High') ? 'var(--accent-red)' : lvl.includes('Medium') ? 'var(--accent-orange)' : 'var(--accent-green)';
          }

          // Re-render map layer dynamically
          const activeLayer = this.oceanHeat > 2.0 ? 'floodRisk' : 'rainfall';
          IndiaMap.render('twin-map', { activeLayer: activeLayer, showLabels: false });

          const btnSubtext = document.querySelector('.twin-btn-subtext');
          if (btnSubtext && data.metadata && data.metadata.inference_time_seconds) {
            btnSubtext.textContent = `Inference Time: ${data.metadata.inference_time_seconds.toFixed(2)} seconds`;
          }

          const btnExport = document.getElementById('btn-export-report');
          if (btnExport) {
            btnExport.style.display = 'flex';
            this.lastSimulationData = data;
          }

          if (typeof Components !== 'undefined') {
            const inferenceTime = data.metadata && data.metadata.inference_time_seconds ? data.metadata.inference_time_seconds.toFixed(2) : "0.00";
            Components.showToast(`Surrogate FNO model executed in ${inferenceTime} seconds. Climate state updated.`, 'success');
          }
        } else {
          if (typeof Components !== 'undefined') {
            Components.showToast('Error running FNO model simulation', 'error');
          }
        }
      })
      .catch(err => {
        if (overlay) overlay.classList.remove('active');
        console.error(err);
        if (typeof Components !== 'undefined') {
          Components.showToast('Failed to connect to FNO surrogate model backend', 'error');
        }
      });
  },

  exportReport() {
    if (!this.lastSimulationData) return;
    
    // Create a beautifully formatted JSON report
    const reportData = {
      title: "ISRO Climate Digital Twin - AI Simulation Report",
      timestamp: new Date().toISOString(),
      parameters: {
        physics_weight_pinn: this.physicsWeight,
        ocean_heat_anomaly_C: this.oceanHeat,
        greenspace_ndvi_index: this.greenspace,
        aerosol_load: this.aerosol
      },
      insights: this.lastSimulationData.insights,
      model_performance: this.lastSimulationData.performance || {},
      confidence_intervals: this.lastSimulationData.confidence || {}
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `climate_twin_report_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (typeof Components !== 'undefined') {
      Components.showToast('Simulation report downloaded successfully.', 'success');
    }
  }
};

window.TwinPage = TwinPage;
