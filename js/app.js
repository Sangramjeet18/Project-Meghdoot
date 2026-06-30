/* =================================================================
   SPA Router & Application Shell
   ================================================================= */

const App = {
  currentPage: 'landing',
  state: {
    activeLayer: 'temperature',
    selectedDate: new Date(),
    sidebarOpen: false,
    assistantOpen: false,
  },

  pages: {
    'landing':     { title: 'Home',           init: () => typeof LandingPage !== 'undefined' && LandingPage.init() },
    'dashboard':   { title: 'Dashboard',      init: () => typeof DashboardPage !== 'undefined' && DashboardPage.init() },
    'predictions': { title: 'AI Predictions', init: () => typeof PredictionsPage !== 'undefined' && PredictionsPage.init() },
    'simulation':  { title: 'Simulation',     init: () => typeof SimulationPage !== 'undefined' && SimulationPage.init() },
    'twin':        { title: 'Climate Twin',   init: () => typeof TwinPage !== 'undefined' && TwinPage.init() },
    'alerts':      { title: 'Alerts',         init: () => typeof AlertsPage !== 'undefined' && AlertsPage.init() },
    'analytics':   { title: 'Analytics',      init: () => typeof AnalyticsPage !== 'undefined' && AnalyticsPage.init() },
  },

  init() {
    this._setupRouter();
    this._setupNav();
    this._setupScrollEffects();
    this._updateSystemTime();
    this._setupMobileMenu();

    // Navigate to initial page
    const hash = window.location.hash.replace('#/', '') || 'landing';
    this.navigate(hash);

    // Init assistant
    if (typeof AssistantPanel !== 'undefined') AssistantPanel.init();

    // Init location explorer (checks if backend is live for real weather)
    if (typeof LocationExplorer !== 'undefined') LocationExplorer.init();

    console.log('%c🛰️ Climate Digital Twin Initialized', 'color: #00C2FF; font-size: 14px; font-weight: bold;');
  },

  navigate(page) {
    if (!this.pages[page]) page = 'landing';

    // Hide all pages
    document.querySelectorAll('.page-section').forEach(el => {
      el.classList.remove('active');
    });

    // Show target page
    const target = document.getElementById(`page-${page}`);
    if (target) {
      target.classList.add('active');
    }

    // Update nav
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === page);
    });

    // Update browser
    if (page !== 'landing') {
      window.location.hash = `#/${page}`;
    } else {
      history.replaceState(null, '', window.location.pathname);
    }

    // Show/hide nav bar background on landing
    const nav = document.querySelector('.nav-bar');
    if (nav) {
      nav.classList.toggle('nav-transparent', page === 'landing');
    }

    this.currentPage = page;
    document.title = `${this.pages[page].title} — Climate Digital Twin`;

    // Init page
    this.pages[page].init();

    // Close mobile menu
    const navLinks = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');
    if (navLinks) navLinks.classList.remove('open');
    if (hamburger) hamburger.classList.remove('open');

    // Scroll to top
    window.scrollTo(0, 0);
  },

  _setupRouter() {
    window.addEventListener('hashchange', () => {
      const page = window.location.hash.replace('#/', '') || 'landing';
      this.navigate(page);
    });
  },

  _setupNav() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        this.navigate(page);
      });
    });
  },

  _setupScrollEffects() {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const nav = document.querySelector('.nav-bar');
          if (nav) {
            nav.classList.toggle('scrolled', window.scrollY > 30);
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  },

  _updateSystemTime() {
    const tick = () => {
      const el = document.getElementById('system-time');
      if (el) {
        const now = new Date();
        el.textContent = now.toLocaleTimeString('en-IN', {
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        }) + ' IST';
      }
    };
    tick();
    setInterval(tick, 1000);
  },

  _setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navLinks.classList.toggle('open');
      });
    }
  },

  toggleAssistant() {
    this.state.assistantOpen = !this.state.assistantOpen;
    const panel = document.getElementById('ai-assistant-panel');
    const btn = document.getElementById('ai-assistant-btn');
    if (panel) panel.classList.toggle('open', this.state.assistantOpen);
    if (btn) btn.classList.toggle('active', this.state.assistantOpen);
    if (this.state.assistantOpen && typeof AssistantPanel !== 'undefined') {
      AssistantPanel.focus();
    }
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;
