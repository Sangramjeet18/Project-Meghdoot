/* =================================================================
   Digital Twin Simulation Page Logic
   ================================================================= */

const SimulationPage = {
  currentYear: 2025,
  isPlaying: false,
  playInterval: null,
  activeScenario: 'baseline',
  speed: 1,

  init() {
    const container = document.getElementById('page-simulation');
    container.innerHTML = this.render();
    this.setupTimeline();
    this.setupScenarios();
    this.setupPlayback();
    this.setupSpeed();
    this.updateSimulation();
    IndiaMap.render('simulation-map', { activeLayer: 'temperature', showLabels: true });
  },

  render() {
    const scenarios = [
      { key: 'baseline', name: 'Current Trajectory', desc: 'Business as usual projections', color: '#00C2FF' },
      { key: 'warming1', name: '+1.5°C Warming', desc: 'Paris Agreement target', color: '#00E5A8' },
      { key: 'warming2', name: '+2.0°C Warming', desc: 'Moderate emissions scenario', color: '#FFA726' },
      { key: 'warming3', name: '+3.0°C Warming', desc: 'High emissions scenario', color: '#FF5252' },
      { key: 'monsoon', name: 'Monsoon Disruption', desc: 'Irregular monsoon patterns', color: '#A855F7' },
    ];

    const decades = ['1950','1960','1970','1980','1990','2000','2010','2020','2030','2040','2050'];

    return `
      <div class="simulation-page">
        ${Components.sectionHeader(
          'Digital Twin Simulation',
          'Explore India\'s climate past, present, and future through advanced simulation models',
          `<span class="badge badge-purple badge-dot">Simulation Engine v3.2</span>`
        )}

        <div class="simulation-layout">
          <!-- Main Area -->
          <div class="simulation-main">
            <!-- Year Display -->
            <div class="year-display">
              <div class="year-number" id="sim-year">${this.currentYear}</div>
              <div class="year-label">Simulation Year</div>
            </div>

            <!-- Map -->
            <div class="sim-map-container">
              <div id="simulation-map" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center"></div>
            </div>

            <!-- Timeline -->
            <div class="timeline-container">
              <div class="timeline-header">
                <div class="playback-controls">
                  <button class="play-btn" id="play-btn" title="Play/Pause">
                    ${Components.icon('play', 20)}
                  </button>
                  <div class="speed-selector">
                    <button class="speed-btn active" data-speed="1">1×</button>
                    <button class="speed-btn" data-speed="2">2×</button>
                    <button class="speed-btn" data-speed="5">5×</button>
                  </div>
                </div>
                <span class="text-xs text-muted">Drag slider or press play to animate</span>
              </div>

              <div class="timeline-slider">
                <input type="range" id="timeline-slider" min="1950" max="2050" value="${this.currentYear}" step="1" />
              </div>
              <div class="timeline-markers">
                ${decades.map(d => `<span>${d}</span>`).join('')}
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div style="display:flex;flex-direction:column;gap:var(--space-5)">
            <!-- Scenario Selection -->
            <div class="scenario-panel">
              <h5 class="flex items-center gap-2 mb-4" style="font-size:var(--text-sm)">
                ${Components.icon('layers', 16)} Select Scenario
              </h5>
              ${scenarios.map(s => `
                <button class="scenario-option ${s.key === this.activeScenario ? 'active' : ''}" data-scenario="${s.key}">
                  <span class="sc-dot" style="background:${s.color}"></span>
                  <div>
                    <div class="sc-name">${s.name}</div>
                    <div class="sc-desc">${s.desc}</div>
                  </div>
                </button>
              `).join('')}
            </div>

            <!-- Simulation Results -->
            <div class="sim-results">
              <h5 class="flex items-center gap-2 mb-4" style="font-size:var(--text-sm)">
                ${Components.icon('activity', 16)} Simulation Results
              </h5>

              <div class="result-metric">
                <div>
                  <div class="rm-label">Avg Temperature</div>
                  <div class="result-value" data-metric="temperature">28.0°C</div>
                </div>
                <span class="rm-change neutral" data-change="temperature">—</span>
              </div>
              <div class="result-metric">
                <div>
                  <div class="rm-label">Sea Level Rise</div>
                  <div class="result-value" data-metric="seaLevel">+0mm</div>
                </div>
                <span class="rm-change neutral" data-change="seaLevel">—</span>
              </div>
              <div class="result-metric">
                <div>
                  <div class="rm-label">Rainfall Change</div>
                  <div class="result-value" data-metric="rainfall">0%</div>
                </div>
                <span class="rm-change neutral" data-change="rainfall">—</span>
              </div>
              <div class="result-metric">
                <div>
                  <div class="rm-label">Extreme Events</div>
                  <div class="result-value" data-metric="extremeEvents">12/yr</div>
                </div>
                <span class="rm-change neutral" data-change="extremeEvents">—</span>
              </div>
              <div class="result-metric">
                <div>
                  <div class="rm-label">Agricultural Impact</div>
                  <div class="result-value" data-metric="agriculture">0%</div>
                </div>
                <span class="rm-change neutral" data-change="agriculture">—</span>
              </div>
              <div class="result-metric">
                <div>
                  <div class="rm-label">Water Stress Index</div>
                  <div class="result-value" data-metric="waterStress">0.30</div>
                </div>
                <span class="rm-change neutral" data-change="waterStress">—</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  setupTimeline() {
    const slider = document.getElementById('timeline-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        this.currentYear = parseInt(e.target.value);
        this.updateSimulation();
      });
    }
  },

  setupScenarios() {
    document.querySelectorAll('.scenario-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.scenario-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        this.activeScenario = opt.dataset.scenario;
        this.updateSimulation();
      });
    });
  },

  setupPlayback() {
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
      playBtn.addEventListener('click', () => this.togglePlay());
    }
  },

  setupSpeed() {
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.speed = parseInt(btn.dataset.speed);
        if (this.isPlaying) {
          clearInterval(this.playInterval);
          this.startPlayback();
        }
      });
    });
  },

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    const btn = document.getElementById('play-btn');
    if (btn) btn.innerHTML = this.isPlaying ? Components.icon('pause', 20) : Components.icon('play', 20);

    if (this.isPlaying) {
      this.startPlayback();
    } else {
      clearInterval(this.playInterval);
    }
  },

  startPlayback() {
    const interval = Math.max(100, 500 / this.speed);
    this.playInterval = setInterval(() => {
      this.currentYear++;
      if (this.currentYear > 2050) this.currentYear = 1950;
      const slider = document.getElementById('timeline-slider');
      if (slider) slider.value = this.currentYear;
      this.updateSimulation();
    }, interval);
  },

  updateSimulation() {
    // Update year display
    const yearEl = document.getElementById('sim-year');
    if (yearEl) yearEl.textContent = this.currentYear;

    // Calculate results
    const results = this.calculateResults();

    // Update result values
    document.querySelectorAll('.result-value').forEach(el => {
      const key = el.dataset.metric;
      if (results[key] !== undefined) el.textContent = results[key].value;
    });

    // Update change badges
    document.querySelectorAll('.rm-change').forEach(el => {
      const key = el.dataset.change;
      if (results[key]) {
        el.textContent = results[key].change;
        el.className = `rm-change ${results[key].direction}`;
      }
    });
  },

  calculateResults() {
    const yearOffset = (this.currentYear - 2025) / 25;
    const absOffset = Math.abs(yearOffset);
    const isFuture = yearOffset > 0;

    const scenarios = {
      baseline: { temp: 1.2, sea: 3.2, rain: -2, events: 15, agri: -5, water: 0.4 },
      warming1: { temp: 1.5, sea: 4.5, rain: -5, events: 22, agri: -8, water: 0.5 },
      warming2: { temp: 2.0, sea: 7.8, rain: -8, events: 35, agri: -15, water: 0.65 },
      warming3: { temp: 3.0, sea: 12, rain: -15, events: 52, agri: -25, water: 0.8 },
      monsoon: { temp: 1.4, sea: 4, rain: -20, events: 40, agri: -18, water: 0.7 },
    };
    const s = scenarios[this.activeScenario] || scenarios.baseline;

    const factor = isFuture ? yearOffset : yearOffset * 0.3; // Past changes are less dramatic

    const tempVal = 28 + s.temp * factor;
    const seaVal = s.sea * Math.max(0, factor) * 10;
    const rainVal = s.rain * factor;
    const eventsVal = Math.round(12 + s.events * Math.max(0, factor));
    const agriVal = s.agri * Math.max(0, factor);
    const waterVal = 0.3 + s.water * Math.max(0, factor);

    const getDir = (v) => v > 0.5 ? 'negative' : v < -0.5 ? 'positive' : 'neutral';

    return {
      temperature: {
        value: tempVal.toFixed(1) + '°C',
        change: (s.temp * factor > 0 ? '+' : '') + (s.temp * factor).toFixed(1) + '°C',
        direction: s.temp * factor > 0.3 ? 'negative' : 'neutral'
      },
      seaLevel: {
        value: '+' + seaVal.toFixed(0) + 'mm',
        change: seaVal > 0 ? '↑' : '—',
        direction: seaVal > 20 ? 'negative' : 'neutral'
      },
      rainfall: {
        value: rainVal.toFixed(0) + '%',
        change: rainVal.toFixed(0) + '%',
        direction: rainVal < -5 ? 'negative' : 'neutral'
      },
      extremeEvents: {
        value: eventsVal + '/yr',
        change: eventsVal > 15 ? '↑ +' + (eventsVal - 12) : '—',
        direction: eventsVal > 20 ? 'negative' : 'neutral'
      },
      agriculture: {
        value: agriVal.toFixed(0) + '%',
        change: agriVal < -3 ? agriVal.toFixed(0) + '%' : '—',
        direction: agriVal < -5 ? 'negative' : 'neutral'
      },
      waterStress: {
        value: waterVal.toFixed(2),
        change: waterVal > 0.5 ? '↑ High' : 'Normal',
        direction: waterVal > 0.5 ? 'negative' : waterVal > 0.35 ? 'neutral' : 'positive'
      }
    };
  }
};

window.SimulationPage = SimulationPage;
