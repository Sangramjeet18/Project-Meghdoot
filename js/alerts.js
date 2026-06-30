/* =================================================================
   Alerts & Disaster Monitoring Page Logic
   ================================================================= */

const AlertsPage = {
  activeFilter: 'all',

  /* ── July 1, 2026 — Active Monsoon Alerts ── */
  alerts: [
    { id:1, type:'Flood Emergency', severity:'critical', icon:'waves', location:'Assam — 22 Districts', affected:'1.2M', time:'Ongoing', desc:'Brahmaputra at 2.8m above danger mark at Guwahati. 22 districts submerged. 1.2 million displaced. 42 NDRF teams deployed. Relief camps activated across Barpeta, Nalbari, Morigaon, Dhemaji.', action:'Deploy NDRF' },
    { id:2, type:'Urban Flooding', severity:'critical', icon:'cloudRain', location:'Mumbai, Maharashtra', affected:'5.8M', time:'2h ago', desc:'184mm rainfall in last 24 hours. Severe waterlogging in Andheri, Dadar, Sion, Kurla. Local trains disrupted on Central & Harbour lines. MCGM pumps at full capacity.', action:'Issue Red Alert' },
    { id:3, type:'Landslide Warning', severity:'warning', icon:'alert', location:'Kerala — Wayanad, Idukki', affected:'0.8M', time:'4h ago', desc:'IMD Orange Alert: Heavy rainfall (120-200mm/day) saturating slopes in Western Ghats. Soil moisture at 92%. Wayanad, Idukki, and Kodagu at high risk. 6 minor slides reported.', action:'Evacuate Villages' },
    { id:4, type:'Flood Warning', severity:'critical', icon:'waves', location:'Bihar — Kosi Basin', affected:'3.2M', time:'3h ago', desc:'Kosi river water level rising rapidly. 14 districts on flood alert. Kosi barrage gates opened. Low-lying areas in Supaul, Saharsa, Madhepura at immediate flood risk.', action:'Open Relief Camps' },
    { id:5, type:'Landslide Alert', severity:'warning', icon:'alert', location:'Uttarakhand, Himachal', affected:'1.5M', time:'6h ago', desc:'Continuous rainfall causing soil saturation in Chamoli, Kinnaur, Kullu. 14 roads closed. NH-5 blocked near Rampur. Debris flow risk high in Kedarnath corridor.', action:'Road Closures' },
    { id:6, type:'Low Pressure System', severity:'warning', icon:'cloudLightning', location:'NW Bay of Bengal', affected:'8.5M', time:'5h ago', desc:'Low-pressure area forming at 19°N, 87°E. May intensify into depression within 72h. Enhancing rainfall along Odisha and AP coasts. SST: 29.8°C.', action:'Monitor System' },
    { id:7, type:'Heavy Rainfall Alert', severity:'watch', icon:'cloudRain', location:'Meghalaya, W. Bengal', affected:'4.2M', time:'1h ago', desc:'200-300mm/day rainfall in Cherrapunji-Mawsynram belt. Sub-Himalayan West Bengal receiving 150mm+. River Teesta rising. Flash flood risk in Jalpaiguri, Alipurduar.', action:'Activate Warning' },
    { id:8, type:'Cooling Breezes', severity:'info', icon:'temperature', location:'Chennai, Tamil Nadu', affected:'9.8M', time:'8h ago', desc:'SW Monsoon cooling coastal areas. Chennai at 27°C with breezy conditions. Light rain showers expected along the coast.', action:'Coastal Alert' },
  ],

  init() {
    const container = document.getElementById('page-alerts');
    container.innerHTML = this.render();
    this.setupFilters();
    this.setupMap();
    this.animateStats();
    requestAnimationFrame(() => {
      Animations.staggerEntrance(document.querySelectorAll('.alert-item'), 70);
    });
  },

  render() {
    const severityBadge = (sev) => {
      const map = { critical: 'red', warning: 'orange', watch: 'muted', info: 'cyan' };
      const pulse = sev === 'critical' ? 'badge-pulse' : '';
      return Components.badge(sev.toUpperCase(), map[sev] || 'muted', true);
    };

    return `
      <div class="alerts-page">
        ${Components.sectionHeader(
          'Alerts & Disaster Monitoring',
          'Real-time monitoring of active weather emergencies across India',
          `<button class="btn btn-sm btn-secondary">${Components.icon('download', 14)} Export Report</button>`
        )}

        <!-- Emergency Stats -->
        <div class="emergency-stats">
          <div class="stat-card accent-red">
            <div class="stat-icon" style="background:var(--accent-red-dim);color:var(--accent-red)">${Components.icon('alert', 20)}</div>
            <div class="stat-label">Active Alerts</div>
            <div class="stat-value"><span class="emergency-counter" data-target="8">0</span></div>
          </div>
          <div class="stat-card accent-orange">
            <div class="stat-icon" style="background:var(--accent-orange-dim);color:var(--accent-orange)">${Components.icon('users', 20)}</div>
            <div class="stat-label">Affected Population</div>
            <div class="stat-value"><span class="emergency-counter" data-target="76" data-suffix=".3M">0</span></div>
          </div>
          <div class="stat-card accent-green">
            <div class="stat-icon" style="background:var(--accent-green-dim);color:var(--accent-green)">${Components.icon('shield', 20)}</div>
            <div class="stat-label">Response Teams</div>
            <div class="stat-value"><span class="emergency-counter" data-target="342">0</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">${Components.icon('map', 20)}</div>
            <div class="stat-label">Districts on Alert</div>
            <div class="stat-value"><span class="emergency-counter" data-target="127">0</span></div>
          </div>
        </div>

        <!-- Filters -->
        <div class="alert-filters">
          <button class="alert-filter-chip active" data-filter="all">All Alerts (${this.alerts.length})</button>
          <button class="alert-filter-chip" data-filter="critical">🔴 Critical (${this.alerts.filter(a => a.severity==='critical').length})</button>
          <button class="alert-filter-chip" data-filter="warning">🟠 Warning (${this.alerts.filter(a => a.severity==='warning').length})</button>
          <button class="alert-filter-chip" data-filter="watch">🟡 Watch (${this.alerts.filter(a => a.severity==='watch').length})</button>
          <button class="alert-filter-chip" data-filter="info">🔵 Info (${this.alerts.filter(a => a.severity==='info').length})</button>
        </div>

        <!-- Main Layout -->
        <div class="alerts-layout">
          <!-- Map -->
          <div class="alerts-map-container">
            <div id="alerts-map" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center"></div>
            <div class="alert-map-legend">
              <div class="legend-item"><span class="legend-dot" style="background:var(--accent-red)"></span> Critical</div>
              <div class="legend-item"><span class="legend-dot" style="background:var(--accent-orange)"></span> Warning</div>
              <div class="legend-item"><span class="legend-dot" style="background:var(--accent-yellow)"></span> Watch</div>
              <div class="legend-item"><span class="legend-dot" style="background:var(--accent-cyan)"></span> Info</div>
            </div>
          </div>

          <!-- Alert List -->
          <div class="alerts-list">
            ${this.alerts.map(a => `
              <div class="alert-item ${a.severity}" data-severity="${a.severity}">
                <div class="alert-icon-box">${Components.icon(a.icon, 20)}</div>
                <div class="alert-content">
                  <div class="alert-title">
                    ${a.type}
                    ${a.severity === 'critical' ? Components.badge('CRITICAL', 'red', true) : ''}
                  </div>
                  <div class="alert-location">${Components.icon('map', 10)} ${a.location}</div>
                  <div class="alert-desc">${a.desc}</div>
                  <div class="alert-footer">
                    <span class="alert-time">${Components.icon('clock', 10)} ${a.time}</span>
                    <span class="alert-affected">${Components.icon('users', 10)} ${a.affected} affected</span>
                    <button class="btn btn-sm btn-ghost" style="padding:.2rem .5rem;font-size:10px">${a.action}</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  setupFilters() {
    document.querySelectorAll('.alert-filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.alert-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeFilter = chip.dataset.filter;
        this.filterAlerts();
      });
    });
  },

  filterAlerts() {
    document.querySelectorAll('.alert-item').forEach(item => {
      const severity = item.dataset.severity;
      const show = this.activeFilter === 'all' || severity === this.activeFilter;
      item.style.display = show ? 'flex' : 'none';
    });
  },

  setupMap() {
    IndiaMap.render('alerts-map', { activeLayer: 'floodRisk', showLabels: true });
  },

  animateStats() {
    document.querySelectorAll('.emergency-counter').forEach(el => {
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      Animations.animateCounter(el, target, 1800, '', suffix);
    });
  }
};

window.AlertsPage = AlertsPage;
