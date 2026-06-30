/* =================================================================
   Animation Utilities
   ================================================================= */

const Animations = {

  /* ── Animated Counter ──────────────────────────────── */
  animateCounter(el, target, duration = 2000, prefix = '', suffix = '') {
    const start = performance.now();
    const initial = 0;
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(initial + (target - initial) * eased);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  /* ── Animate Progress Ring (SVG circle) ────────────── */
  animateProgressRing(svgCircle, percent, duration = 1000) {
    const radius = parseFloat(svgCircle.getAttribute('r'));
    const circumference = 2 * Math.PI * radius;
    svgCircle.style.strokeDasharray = circumference;
    const offset = circumference - (percent / 100) * circumference;
    const start = performance.now();
    const initialOffset = circumference;

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentOffset = initialOffset + (offset - initialOffset) * eased;
      svgCircle.style.strokeDashoffset = currentOffset;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  /* ── Staggered Entrance ────────────────────────────── */
  staggerEntrance(elements, delay = 80) {
    elements.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)`;
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, delay * i);
    });
  },

  /* ── Intersection Observer for scroll animations ──── */
  observeElements(selector, className = 'visible') {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(className);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll(selector).forEach(el => observer.observe(el));
  },

  /* ── Typing Effect ─────────────────────────────────── */
  typeText(el, text, speed = 40) {
    return new Promise(resolve => {
      let i = 0;
      el.textContent = '';
      const type = () => {
        if (i < text.length) {
          el.textContent += text.charAt(i);
          i++;
          setTimeout(type, speed);
        } else {
          resolve();
        }
      };
      type();
    });
  },

  /* ── Particle System (Canvas) ──────────────────────── */
  createParticles(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const {
      count = 60,
      color = '#00C2FF',
      maxSize = 2,
      speed = 0.3,
      connectDistance = 120,
      opacity = 0.4
    } = options;

    let particles = [];
    let animId = null;
    let w, h;

    function resize() {
      w = canvas.width = canvas.parentElement.clientWidth;
      h = canvas.height = canvas.parentElement.clientHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: Math.random() * maxSize + 0.5,
        opacity: Math.random() * opacity + 0.1,
      };
    }

    function init() {
      resize();
      particles = Array.from({ length: count }, createParticle);
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectDistance) {
            const alpha = (1 - dist / connectDistance) * 0.15;
            ctx.strokeStyle = color.replace(')', `,${alpha})`).replace('rgb', 'rgba');
            if (color.startsWith('#')) {
              const r = parseInt(color.slice(1, 3), 16);
              const g = parseInt(color.slice(3, 5), 16);
              const b = parseInt(color.slice(5, 7), 16);
              ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            }
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color.startsWith('#')
          ? `rgba(${parseInt(color.slice(1,3),16)},${parseInt(color.slice(3,5),16)},${parseInt(color.slice(5,7),16)},${p.opacity})`
          : color;
        ctx.fill();
      });

      // Update positions
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      });

      animId = requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener('resize', () => { resize(); });

    return {
      stop() { cancelAnimationFrame(animId); },
      restart() { init(); draw(); }
    };
  },

  /* ── Globe Wireframe (Canvas) ──────────────────────── */
  createGlobe(canvas, options = {}) {
    const ctx = canvas.getContext('2d');
    const {
      color = '#00C2FF',
      rotationSpeed = 0.003,
      radius: globeRadius = null,
      lineWidth = 0.8
    } = options;

    let w, h, cx, cy, radius, angle = 0;
    let animId = null;

    function resize() {
      w = canvas.width = canvas.parentElement.clientWidth;
      h = canvas.height = canvas.parentElement.clientHeight;
      cx = w / 2;
      cy = h / 2;
      radius = globeRadius || Math.min(w, h) * 0.35;
    }

    function drawGlobe() {
      ctx.clearRect(0, 0, w, h);

      // Outer glow
      const grd = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.5);
      grd.addColorStop(0, 'rgba(0, 194, 255, 0.06)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      // Main circle
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 194, 255, 0.3)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner atmosphere
      const atm = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
      atm.addColorStop(0, 'rgba(0, 194, 255, 0.05)');
      atm.addColorStop(0.7, 'rgba(0, 194, 255, 0.02)');
      atm.addColorStop(1, 'transparent');
      ctx.fillStyle = atm;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Latitude lines
      ctx.lineWidth = lineWidth;
      for (let lat = -60; lat <= 60; lat += 30) {
        const latRad = (lat * Math.PI) / 180;
        const y = cy + radius * Math.sin(latRad);
        const r = radius * Math.cos(latRad);
        const alpha = 0.12 + Math.cos(latRad) * 0.08;
        ctx.beginPath();
        ctx.ellipse(cx, y, r, r * 0.3, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 194, 255, ${alpha})`;
        ctx.stroke();
      }

      // Longitude lines (rotating)
      for (let lon = 0; lon < 180; lon += 30) {
        const lonRad = ((lon + angle * (180 / Math.PI)) * Math.PI) / 180;
        const alpha = 0.1 + Math.abs(Math.sin(lonRad)) * 0.1;
        ctx.beginPath();
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(Math.cos(lonRad), 1);
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.restore();
        ctx.strokeStyle = `rgba(0, 194, 255, ${alpha})`;
        ctx.stroke();
      }

      // India highlight (simplified triangle shape)
      const indiaAngle = angle + 1.3; // offset for India's longitude
      const indiaX = cx + radius * 0.15 * Math.cos(indiaAngle);
      const indiaLat = 0.35; // roughly 20°N
      const indiaY = cy - radius * indiaLat;

      ctx.save();
      const indiaVisible = Math.cos(indiaAngle) > -0.2;
      if (indiaVisible) {
        const scale = 0.5 + Math.cos(indiaAngle) * 0.5;
        const indiaAlpha = Math.max(0, Math.cos(indiaAngle));

        ctx.beginPath();
        ctx.moveTo(indiaX - 15 * scale, indiaY - 30 * scale);
        ctx.lineTo(indiaX + 20 * scale, indiaY - 25 * scale);
        ctx.lineTo(indiaX + 25 * scale, indiaY - 10 * scale);
        ctx.lineTo(indiaX + 15 * scale, indiaY + 15 * scale);
        ctx.lineTo(indiaX + 5 * scale, indiaY + 35 * scale);
        ctx.lineTo(indiaX - 5 * scale, indiaY + 20 * scale);
        ctx.lineTo(indiaX - 20 * scale, indiaY - 5 * scale);
        ctx.closePath();

        ctx.fillStyle = `rgba(0, 229, 168, ${0.15 * indiaAlpha})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(0, 229, 168, ${0.6 * indiaAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Glow around India
        ctx.shadowColor = 'rgba(0, 229, 168, 0.5)';
        ctx.shadowBlur = 15 * indiaAlpha;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      ctx.restore();

      // Orbital ring 1
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle * 0.7);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.25, radius * 0.3, 0.3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 194, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
      // Dot on orbit
      const dotAngle1 = angle * 2;
      const dotX1 = radius * 1.25 * Math.cos(dotAngle1);
      const dotY1 = radius * 0.3 * Math.sin(dotAngle1);
      ctx.beginPath();
      ctx.arc(dotX1, dotY1, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 194, 255, 0.8)';
      ctx.fill();
      ctx.restore();

      // Orbital ring 2
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-angle * 0.5 + 1);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.15, radius * 0.4, -0.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.06)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 10]);
      ctx.stroke();
      ctx.setLineDash([]);
      // Dot on orbit 2
      const dotAngle2 = -angle * 1.5;
      const dotX2 = radius * 1.15 * Math.cos(dotAngle2);
      const dotY2 = radius * 0.4 * Math.sin(dotAngle2);
      ctx.beginPath();
      ctx.arc(dotX2, dotY2, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.7)';
      ctx.fill();
      ctx.restore();

      // Data points floating
      const dataPoints = [
        { lat: 0.4, lon: 1.2, label: '28.5°C' },
        { lat: -0.2, lon: 2.5, label: 'AQI 142' },
        { lat: 0.1, lon: 0.5, label: '78% RH' },
      ];
      dataPoints.forEach((dp, idx) => {
        const dpAngle = angle + dp.lon;
        const vis = Math.cos(dpAngle);
        if (vis > 0.1) {
          const dpx = cx + radius * 0.7 * vis * Math.cos(dp.lat + idx * 0.5);
          const dpy = cy - radius * dp.lat;
          const alpha = vis * 0.7;
          ctx.fillStyle = `rgba(0, 194, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(dpx, dpy, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = `${10}px Inter, sans-serif`;
          ctx.fillStyle = `rgba(0, 194, 255, ${alpha * 0.8})`;
          ctx.fillText(dp.label, dpx + 6, dpy + 3);
        }
      });

      angle += rotationSpeed;
      animId = requestAnimationFrame(drawGlobe);
    }

    resize();
    drawGlobe();
    window.addEventListener('resize', resize);

    return {
      stop() { cancelAnimationFrame(animId); },
      restart() { angle = 0; resize(); drawGlobe(); }
    };
  },

  /* ── Smooth Value Animator ─────────────────────────── */
  smoothValue(from, to, duration, callback) {
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      callback(from + (to - from) * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  /* ── Pulse Glow Effect ─────────────────────────────── */
  addPulseGlow(element, color = 'rgba(0, 194, 255, 0.3)') {
    element.style.animation = 'none';
    element.offsetHeight; // trigger reflow
    element.style.boxShadow = `0 0 0 0 ${color}`;
    element.style.animation = 'pulseGlow 2s ease-in-out infinite';
  }
};

// Export for use across modules
window.Animations = Animations;
