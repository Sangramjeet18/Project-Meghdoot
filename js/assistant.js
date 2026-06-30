/* =================================================================
   AI Assistant Panel Logic
   ================================================================= */

const AssistantPanel = {
  messages: [
    { role: 'ai', text: 'Hello! I\'m your <strong>AI Climate Assistant</strong> — updated for <strong>1 July 2026</strong>. The SW Monsoon is fully active across India. I can help with weather, flood alerts, rainfall data, and more. What would you like to know?' },
  ],

  responses: {
    weather: '🌡️ <strong>Weather Update — 1 July 2026:</strong><br><br>SW Monsoon fully active across India (arrived 30 Jun).<br><br>• Delhi: 30°C, Humid & Overcast, RH 78%, rain likely by evening<br>• Mumbai: 26°C, <span style="color:#00C2FF">Heavy Rain (184mm/24h)</span>, RH 94%<br>• Bengaluru: 24°C, Moderate Rain, RH 82%<br>• Chennai: 27°C, Cool & Breezy (Monsoon cooling), RH 82%<br>• Kolkata: 27°C, Rainy & Thunderstorms, RH 88%<br>• Guwahati: 28°C, <span style="color:#FF5252">Very Heavy Rain — FLOOD ALERT</span>, RH 96%',
    flood: '🌊 <strong>Flood Status — 1 July 2026:</strong><br><br>• <span style="color:#FF5252">CRITICAL — Assam</span>: Brahmaputra at 2.8m above danger mark at Guwahati. 22 districts flooded, 1.2M displaced. 42 NDRF teams deployed.<br>• <span style="color:#FF5252">CRITICAL — Bihar</span>: Kosi river rising rapidly, 14 districts on alert, barrage gates opened<br>• <span style="color:#FFA726">WARNING — Mumbai</span>: 184mm rain in 24h, urban waterlogging in Andheri, Dadar, Sion<br>• <span style="color:#FFA726">WATCH — W. Bengal</span>: Teesta rising, flash flood risk in Jalpaiguri<br><br>Overall flood risk nationally: <strong>82% (Critical)</strong>',
    heatwave: '🌡️ <strong>Temperature Analysis — 1 July 2026:</strong><br><br>With SW Monsoon now active, the extreme heatwave (45°C+) of June has subsided. Current status:<br><br>• No active heatwave alerts (monsoon has brought relief)<br>• Delhi: 30°C (down from 45°C in mid-June). Humidity 78% makes feels-like temp ~36°C<br>• Chennai: 27°C — cooled down by active coastal monsoon breezes<br>• Kolkata: 27°C — cooled down by active monsoon rainfall<br>• Jaipur: 31°C, partly cloudy, monsoon arriving<br><br>Main concern now: <strong>High humidity + warm temps = heat stress</strong>. Stay hydrated.',
    rainfall: '🌧️ <strong>Monsoon Rainfall — 1 July 2026:</strong><br><br>SW Monsoon fully covered India (30 Jun 2026, on schedule).<br><br>• <strong>Very Heavy (200-300mm/day)</strong>: Assam, Meghalaya, Sub-Himalayan WB<br>• <strong>Heavy (100-200mm/day)</strong>: Mumbai/Konkan, Kerala, Uttarakhand, Bihar<br>• <strong>Moderate (50-100mm/day)</strong>: Central India, Eastern UP, MP, Chhattisgarh<br>• <strong>Light/Nil</strong>: Tamil Nadu (interior), SE Rajasthan, parts of AP<br><br>Cumulative monsoon rainfall (1 Jun–1 Jul): 154mm (2% above normal). Reservoir levels: 41% (rising).',
    aqi: '💨 <strong>Air Quality — 1 July 2026:</strong><br><br>Monsoon rains have significantly improved air quality across North India!<br><br>• Delhi NCR: <span style="color:#00E5A8">68 (Satisfactory)</span> — washed out by rain & humidity<br>• Mumbai: <span style="color:#00E5A8">45 (Good)</span> — continuous rain scrubbing the air<br>• Bangalore: <span style="color:#00E5A8">52 (Satisfactory)</span><br>• Chennai: <span style="color:#00E5A8">58 (Satisfactory)</span> — monsoon sea breeze cleaning the air<br>• Kolkata: <span style="color:#00E5A8">58 (Satisfactory)</span><br><br>Overall: Best air quality period of the year. Monsoon rain acts as natural air purifier.',
    default: '🛰️ <strong>Climate Twin — 1 July 2026</strong><br><br>Key situation today:<br>• 🌧️ <strong>SW Monsoon</strong>: Fully active since 30 Jun<br>• 🌊 <strong>Flooding</strong>: Critical in Assam (22 districts), Bihar (Kosi). Mumbai waterlogging<br>• ⛰️ <strong>Landslide risk</strong>: High in Kerala, Uttarakhand, HP<br>• 🌡️ <strong>Temperatures</strong>: Moderated by monsoon (24-31°C). High humidity (78-96%)<br><br>Ask about: <em>weather, floods, rainfall, air quality, heatwave status</em>'
  },

  init() {
    this.renderMessages();
    this.setupInput();
  },

  focus() {
    const input = document.querySelector('.assistant-input input');
    if (input) setTimeout(() => input.focus(), 300);
  },

  renderMessages() {
    const container = document.getElementById('assistant-messages');
    if (!container) return;
    container.innerHTML = this.messages.map(m =>
      `<div class="assistant-message ${m.role}"><div class="message-text">${m.text}</div></div>`
    ).join('');
    container.scrollTop = container.scrollHeight;
  },

  setupInput() {
    const input = document.querySelector('.assistant-input input');
    const sendBtn = document.querySelector('.assistant-send-btn');

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.sendMessage(input.value);
      });
    }
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        const input = document.querySelector('.assistant-input input');
        if (input) this.sendMessage(input.value);
      });
    }

    // Chip click handlers
    document.querySelectorAll('.assistant-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.sendMessage(chip.dataset.query);
      });
    });
  },

  sendMessage(text) {
    if (!text || !text.trim()) return;

    // Add user message
    this.messages.push({ role: 'user', text: text.trim() });
    this.renderMessages();

    // Clear input
    const input = document.querySelector('.assistant-input input');
    if (input) input.value = '';

    // Show typing indicator
    const container = document.getElementById('assistant-messages');
    const typing = document.createElement('div');
    typing.className = 'assistant-message ai typing-msg';
    typing.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;

    // Respond after realistic delay
    setTimeout(() => {
      typing.remove();
      const response = this.getResponse(text.toLowerCase());
      this.messages.push({ role: 'ai', text: response });
      this.renderMessages();
    }, 1000 + Math.random() * 1000);
  },

  getResponse(text) {
    if (text.includes('weather') || text.includes('temperature') || text.includes('temp') || text.includes('current'))
      return this.responses.weather;
    if (text.includes('flood') || text.includes('water level') || text.includes('river'))
      return this.responses.flood;
    if (text.includes('heat') || text.includes('heatwave') || text.includes('hot'))
      return this.responses.heatwave;
    if (text.includes('rain') || text.includes('monsoon') || text.includes('rainfall') || text.includes('precipitation'))
      return this.responses.rainfall;
    if (text.includes('air') || text.includes('aqi') || text.includes('pollution') || text.includes('quality'))
      return this.responses.aqi;
    return this.responses.default;
  }
};

window.AssistantPanel = AssistantPanel;
