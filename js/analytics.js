/* =================================================================
   Analytics Page Logic
   ================================================================= */

const AnalyticsPage = {
  charts: {},

  init() {
    const container = document.getElementById('page-analytics');
    container.innerHTML = this.render();
    requestAnimationFrame(() => {
      setTimeout(() => this.initCharts(), 100);
      Animations.staggerEntrance(document.querySelectorAll('.chart-card'), 100);
    });
  },

  render() {
    return `
      <div class="analytics-page">
        ${Components.sectionHeader(
          'Climate Analytics',
          'Comprehensive data analysis and visualization for India\'s climate parameters',
          `<button class="btn btn-sm btn-secondary">${Components.icon('download', 14)} Export Data</button>`
        )}

        <!-- Summary Stats (1 July 2026 — Monsoon Active) -->
        <div class="analytics-summary">
          ${Components.statCard({ label:'Avg Temperature', value:'31.5°C', trend:'−4.2°C from June peak', trendDir:'down', icon:'temperature', accent:'accent-green' })}
          ${Components.statCard({ label:'Jun Rainfall', value:'154mm', trend:'+2% above normal', trendDir:'up', icon:'cloudRain', accent:'accent-cyan' })}
          ${Components.statCard({ label:'Avg Humidity', value:'85%', trend:'+22% from May', trendDir:'up', icon:'droplet', accent:'accent-cyan' })}
          ${Components.statCard({ label:'Avg AQI', value:'62', trend:'Satisfactory — monsoon wash', trendDir:'down', icon:'wind', accent:'accent-green' })}
        </div>

        <!-- Charts Grid -->
        <div class="analytics-grid">
          <!-- Temperature Trends -->
          <div class="chart-card">
            <div class="chart-header">
              <h5>${Components.icon('temperature', 16)} Temperature Trends</h5>
              <div class="chart-period-selector">
                <button class="chart-period-btn active">1M</button>
                <button class="chart-period-btn">3M</button>
                <button class="chart-period-btn">1Y</button>
                <button class="chart-period-btn">5Y</button>
              </div>
            </div>
            <div class="chart-canvas-wrapper"><canvas id="chart-temp"></canvas></div>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-dot" style="background:#FF5252"></span> Max Temp</span>
              <span class="legend-item"><span class="legend-dot" style="background:#00C2FF"></span> Min Temp</span>
              <span class="legend-item"><span class="legend-dot" style="background:#00E5A8"></span> Average</span>
            </div>
          </div>

          <!-- Rainfall Patterns -->
          <div class="chart-card">
            <div class="chart-header">
              <h5>${Components.icon('cloudRain', 16)} Rainfall Patterns</h5>
              <div class="chart-period-selector">
                <button class="chart-period-btn active">1Y</button>
                <button class="chart-period-btn">5Y</button>
              </div>
            </div>
            <div class="chart-canvas-wrapper"><canvas id="chart-rain"></canvas></div>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-dot" style="background:#00C2FF"></span> Rainfall (mm)</span>
            </div>
          </div>

          <!-- Humidity Levels -->
          <div class="chart-card">
            <div class="chart-header">
              <h5>${Components.icon('droplet', 16)} Humidity Levels</h5>
              <div class="chart-period-selector">
                <button class="chart-period-btn active">1Y</button>
              </div>
            </div>
            <div class="chart-canvas-wrapper"><canvas id="chart-humidity"></canvas></div>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-dot" style="background:#A855F7"></span> Relative Humidity (%)</span>
            </div>
          </div>

          <!-- Wind Speed -->
          <div class="chart-card">
            <div class="chart-header">
              <h5>${Components.icon('wind', 16)} Wind Speed</h5>
              <div class="chart-period-selector">
                <button class="chart-period-btn active">1Y</button>
              </div>
            </div>
            <div class="chart-canvas-wrapper"><canvas id="chart-wind"></canvas></div>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-dot" style="background:#FFA726"></span> Avg Wind Speed (km/h)</span>
            </div>
          </div>

          <!-- Air Quality Index -->
          <div class="chart-card">
            <div class="chart-header">
              <h5>${Components.icon('cloud', 16)} Air Quality Index</h5>
              <div class="chart-period-selector">
                <button class="chart-period-btn active">1Y</button>
              </div>
            </div>
            <div class="chart-canvas-wrapper"><canvas id="chart-aqi"></canvas></div>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-dot" style="background:#FF5252"></span> Delhi</span>
              <span class="legend-item"><span class="legend-dot" style="background:#FFA726"></span> Mumbai</span>
              <span class="legend-item"><span class="legend-dot" style="background:#00E5A8"></span> Bangalore</span>
            </div>
          </div>

          <!-- Climate Anomalies -->
          <div class="chart-card">
            <div class="chart-header">
              <h5>${Components.icon('trendUp', 16)} Climate Anomalies</h5>
              <div class="chart-period-selector">
                <button class="chart-period-btn active">10Y</button>
              </div>
            </div>
            <div class="chart-canvas-wrapper"><canvas id="chart-anomaly"></canvas></div>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-dot" style="background:#FF5252"></span> Temperature Anomaly (°C)</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  initCharts() {
    this.drawTempChart();
    this.drawRainChart();
    this.drawHumidityChart();
    this.drawWindChart();
    this.drawAQIChart();
    this.drawAnomalyChart();
  },

  drawTempChart() {
    const canvas = document.getElementById('chart-temp');
    if (!canvas) return;
    const chart = new ChartEngine(canvas);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    chart.drawLineChart(months, [
      { label: 'Max', data: [28,31,36,40,43,42,36,34,35,34,30,27], color: '#FF5252', fill: false, lineWidth: 2 },
      { label: 'Min', data: [12,14,19,24,28,28,26,25,24,20,15,11], color: '#00C2FF', fill: false, lineWidth: 2 },
      { label: 'Avg', data: [20,22,27,32,35,35,31,29,29,27,22,19], color: '#00E5A8', fill: true, lineWidth: 2 },
    ]);
  },

  drawRainChart() {
    const canvas = document.getElementById('chart-rain');
    if (!canvas) return;
    const chart = new ChartEngine(canvas);
    chart.drawBarChart(
      ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      [{ label: 'Rainfall (mm)', data: [15,12,8,22,45,180,285,265,195,85,25,10], color: '#00C2FF' }]
    );
  },

  drawHumidityChart() {
    const canvas = document.getElementById('chart-humidity');
    if (!canvas) return;
    const chart = new ChartEngine(canvas);
    chart.drawLineChart(
      ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      [{ label: 'Humidity', data: [55,48,40,35,42,68,82,85,78,62,55,52], color: '#A855F7', fill: true }]
    );
  },

  drawWindChart() {
    const canvas = document.getElementById('chart-wind');
    if (!canvas) return;
    const chart = new ChartEngine(canvas);
    chart.drawLineChart(
      ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      [{ label: 'Avg Wind', data: [8,10,12,15,18,22,20,16,12,10,8,7], color: '#FFA726', fill: true }]
    );
  },

  drawAQIChart() {
    const canvas = document.getElementById('chart-aqi');
    if (!canvas) return;
    const chart = new ChartEngine(canvas);
    chart.drawLineChart(
      ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      [
        { label: 'Delhi', data: [380,320,250,180,150,95,80,85,120,220,350,400], color: '#FF5252', fill: false, lineWidth: 2 },
        { label: 'Mumbai', data: [180,160,140,120,100,80,75,90,110,145,170,190], color: '#FFA726', fill: false, lineWidth: 2 },
        { label: 'Bangalore', data: [90,85,80,75,70,55,50,55,65,80,85,95], color: '#00E5A8', fill: false, lineWidth: 2 },
      ]
    );
  },

  drawAnomalyChart() {
    const canvas = document.getElementById('chart-anomaly');
    if (!canvas) return;
    const chart = new ChartEngine(canvas);
    chart.drawBarChart(
      ['2015','2016','2017','2018','2019','2020','2021','2022','2023','2024','2025'],
      [{ label: 'Temp Anomaly', data: [0.4,0.8,0.3,0.6,0.9,0.2,0.7,1.1,0.5,1.3,0.8], color: '#FF5252' }]
    );
  }
};

window.AnalyticsPage = AnalyticsPage;
