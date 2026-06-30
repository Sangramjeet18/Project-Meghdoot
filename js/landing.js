/* =================================================================
   Landing Page Logic
   ================================================================= */

const LandingPage = {
  globe: null,
  particles: null,

  init() {
    const container = document.getElementById('page-landing');
    container.innerHTML = this.render();
    this.setupGlobe();
    this.setupParticles();
    this.animateStats();
    this.setupScrollReveal();
  },

  render() {
    return `
      <!-- Hero Section -->
      <section class="landing-hero">
        <canvas class="hero-particles" id="hero-particles"></canvas>

        <div class="hero-badge">
          <span>ISRO × AI Climate Initiative</span>
        </div>

        <div class="hero-globe-container">
          <canvas id="hero-globe"></canvas>
        </div>

        <h1 class="hero-title">AI-Powered Digital Twin of India's Climate</h1>

        <p class="hero-subtitle">
          Real-time climate monitoring, AI-driven forecasting, and advanced simulation
          for India's 1.4 billion people — powered by satellite intelligence and deep learning.
        </p>

        <div class="hero-cta">
          <button class="btn btn-primary btn-lg" onclick="App.navigate('dashboard')">
            ${Components.icon('satellite', 20)}
            Launch Dashboard
          </button>
          <button class="btn btn-secondary btn-lg" onclick="document.querySelector('.features-section').scrollIntoView({behavior:'smooth'})">
            Learn More
          </button>
        </div>

        <div class="scroll-indicator" style="margin-top:var(--space-12)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
          <span>Scroll to explore</span>
        </div>
      </section>

      <!-- Glow Divider -->
      <div class="glow-line"></div>

      <!-- Features Section -->
      <section class="features-section">
        <div class="text-center">
          <span class="badge badge-cyan badge-dot">Core Capabilities</span>
          <h2 class="mt-4">National-Scale Climate Intelligence</h2>
          <p class="mt-2" style="max-width:550px;margin:var(--space-2) auto 0">
            A comprehensive platform combining satellite data, IoT sensors, and AI models
            to monitor, predict, and simulate India's climate systems.
          </p>
        </div>

        <div class="features-grid">
          ${this.renderFeatureCards()}
        </div>
      </section>

      <!-- Stats Section -->
      <section class="stats-section scroll-reveal">
        <div class="text-center mb-8">
          <h2>Platform at a Glance</h2>
          <p class="mt-2">Processing millions of data points every second</p>
        </div>
        <div class="stats-grid">
          <div class="stat-block">
            <div class="counter" data-target="2847">0</div>
            <div class="stat-label">Monitoring Stations</div>
          </div>
          <div class="stat-block">
            <div class="counter" data-target="99" data-suffix=".7%">0</div>
            <div class="stat-label">Prediction Accuracy</div>
          </div>
          <div class="stat-block">
            <div class="counter" data-target="500" data-suffix="+">0</div>
            <div class="stat-label">Districts Covered</div>
          </div>
          <div class="stat-block">
            <div class="counter" data-target="30" data-prefix="< " data-suffix=" min">0</div>
            <div class="stat-label">Alert Response Time</div>
          </div>
        </div>
      </section>

      <div class="glow-line"></div>

      <!-- Footer -->
      <footer class="landing-footer">
        <p>© 2025 Climate Digital Twin — An AI Initiative by ISRO & Government of India</p>
        <div class="footer-links">
          <a href="#" onclick="event.preventDefault()">About</a>
          <a href="#" onclick="event.preventDefault()">Documentation</a>
          <a href="#" onclick="event.preventDefault()">API Access</a>
          <a href="#" onclick="event.preventDefault()">Contact</a>
        </div>
      </footer>
    `;
  },

  renderFeatureCards() {
    const features = [
      {
        icon: 'satellite', color: 'cyan',
        title: 'Real-Time Monitoring',
        desc: 'Live data from 2,847 weather stations, INSAT-3D satellite, and 15,000+ IoT sensors across all states and union territories.'
      },
      {
        icon: 'brain', color: 'purple',
        title: 'AI Forecasting',
        desc: 'Deep learning models trained on 70+ years of climate data delivering 7-day forecasts with 99.7% accuracy for temperature and rainfall.'
      },
      {
        icon: 'shield', color: 'green',
        title: 'Risk Assessment',
        desc: 'Automated risk scoring for floods, droughts, cyclones, and heatwaves with district-level granularity and confidence intervals.'
      },
      {
        icon: 'globe', color: 'cyan',
        title: 'Digital Twin Simulation',
        desc: 'Simulate climate scenarios from 1950 to 2050. Explore what-if scenarios for policy planning and disaster preparedness.'
      },
      {
        icon: 'alert', color: 'orange',
        title: 'Disaster Alerts',
        desc: 'Multi-channel alert system with < 30 minute response time. Automated severity classification and affected population estimation.'
      },
      {
        icon: 'barChart', color: 'green',
        title: 'Climate Analytics',
        desc: 'Professional-grade dashboards for temperature trends, rainfall patterns, air quality indices, and long-term climate anomalies.'
      }
    ];

    return features.map((f, i) => `
      <div class="feature-card scroll-reveal" style="transition-delay:${i * 0.1}s">
        <div class="feature-icon icon-box ${f.color}">
          ${Components.icon(f.icon, 26)}
        </div>
        <h4>${f.title}</h4>
        <p>${f.desc}</p>
      </div>
    `).join('');
  },

  setupGlobe() {
    const canvas = document.getElementById('hero-globe');
    if (canvas) {
      this.globe = Animations.createGlobe(canvas, { rotationSpeed: 0.004 });
    }
  },

  setupParticles() {
    const canvas = document.getElementById('hero-particles');
    if (canvas) {
      this.particles = Animations.createParticles(canvas, {
        count: 45,
        opacity: 0.25,
        speed: 0.2,
        connectDistance: 130,
        maxSize: 1.8
      });
    }
  },

  animateStats() {
    const statsSection = document.querySelector('.stats-section');
    if (!statsSection) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelectorAll('.counter').forEach(el => {
            const target = parseInt(el.dataset.target);
            const prefix = el.dataset.prefix || '';
            const suffix = el.dataset.suffix || '';
            if (target) Animations.animateCounter(el, target, 2200, prefix, suffix);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(statsSection);
  },

  setupScrollReveal() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
  }
};

window.LandingPage = LandingPage;
