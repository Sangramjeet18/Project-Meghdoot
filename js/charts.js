/* =================================================================
   Canvas Chart Engine
   Line · Area · Bar · Gauge · Sparkline
   ================================================================= */

class ChartEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = {
      padding: { top: 30, right: 20, bottom: 40, left: 55 },
      gridColor: 'rgba(255,255,255,0.04)',
      gridLines: 5,
      labelColor: '#64748B',
      labelFont: '11px Inter, sans-serif',
      tooltipBg: 'rgba(30, 41, 59, 0.95)',
      tooltipColor: '#F1F5F9',
      tooltipFont: '12px Inter, sans-serif',
      animationDuration: 800,
      responsive: true,
      ...options
    };
    this.animProgress = 0;
    this.hoverIndex = -1;
    this.datasets = [];
    this.labels = [];

    this._resize();
    if (this.options.responsive) {
      window.addEventListener('resize', () => this._resize());
    }
    this._setupHover();
  }

  _resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.ctx.scale(dpr, dpr);
    this.w = rect.width;
    this.h = rect.height;
    if (this.datasets.length) this._draw();
  }

  _setupHover() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const p = this.options.padding;
      const chartW = this.w - p.left - p.right;
      const count = this.labels.length || 1;
      const idx = Math.round(((x - p.left) / chartW) * (count - 1));
      if (idx >= 0 && idx < count && idx !== this.hoverIndex) {
        this.hoverIndex = idx;
        this._draw();
      }
    });
    this.canvas.addEventListener('mouseleave', () => {
      this.hoverIndex = -1;
      this._draw();
    });
  }

  _getPlotArea() {
    const p = this.options.padding;
    return {
      x: p.left,
      y: p.top,
      w: this.w - p.left - p.right,
      h: this.h - p.top - p.bottom
    };
  }

  _getMinMax(datasets) {
    let min = Infinity, max = -Infinity;
    datasets.forEach(ds => {
      ds.data.forEach(v => {
        if (v < min) min = v;
        if (v > max) max = v;
      });
    });
    const range = max - min || 1;
    min = min - range * 0.08;
    max = max + range * 0.08;
    return { min, max };
  }

  _drawGrid(plot, min, max) {
    const ctx = this.ctx;
    const { gridLines, gridColor, labelColor, labelFont } = this.options;

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.font = labelFont;
    ctx.fillStyle = labelColor;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= gridLines; i++) {
      const y = plot.y + (plot.h / gridLines) * i;
      const val = max - ((max - min) / gridLines) * i;

      ctx.beginPath();
      ctx.moveTo(plot.x, y);
      ctx.lineTo(plot.x + plot.w, y);
      ctx.stroke();

      ctx.fillText(val.toFixed(val >= 100 ? 0 : 1), plot.x - 10, y);
    }

    // X labels
    if (this.labels.length) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const step = Math.max(1, Math.floor(this.labels.length / 8));
      this.labels.forEach((lbl, i) => {
        if (i % step === 0 || i === this.labels.length - 1) {
          const x = plot.x + (plot.w / (this.labels.length - 1)) * i;
          ctx.fillText(lbl, x, plot.y + plot.h + 10);
        }
      });
    }
  }

  /* ── Line / Area Chart ─────────────────────────────── */
  drawLineChart(labels, datasets) {
    this.labels = labels;
    this.datasets = datasets;
    this._animate(() => this._draw());
  }

  _draw() {
    if (!this.datasets.length) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);

    const plot = this._getPlotArea();
    const { min, max } = this._getMinMax(this.datasets);
    this._drawGrid(plot, min, max);

    const count = this.labels.length;
    const progress = this.animProgress;

    this.datasets.forEach(ds => {
      const points = ds.data.map((v, i) => ({
        x: plot.x + (plot.w / (count - 1)) * i,
        y: plot.y + plot.h - ((v - min) / (max - min)) * plot.h,
        value: v
      }));

      const visibleCount = Math.floor(count * progress);

      // Area fill
      if (ds.fill) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, plot.y + plot.h);
        for (let i = 0; i <= visibleCount && i < points.length; i++) {
          if (i === 0) ctx.lineTo(points[i].x, points[i].y);
          else {
            const prev = points[i - 1];
            const cpx = (prev.x + points[i].x) / 2;
            ctx.bezierCurveTo(cpx, prev.y, cpx, points[i].y, points[i].x, points[i].y);
          }
        }
        if (visibleCount < points.length) {
          ctx.lineTo(points[visibleCount].x, plot.y + plot.h);
        }
        ctx.lineTo(points[0].x, plot.y + plot.h);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, plot.y, 0, plot.y + plot.h);
        const baseColor = ds.color || '#00C2FF';
        gradient.addColorStop(0, baseColor.replace(')', ',0.2)').replace('rgb', 'rgba').replace('#', ''));
        // Parse hex for gradient
        if (baseColor.startsWith('#')) {
          const r = parseInt(baseColor.slice(1, 3), 16);
          const g = parseInt(baseColor.slice(3, 5), 16);
          const b = parseInt(baseColor.slice(5, 7), 16);
          const grd = ctx.createLinearGradient(0, plot.y, 0, plot.y + plot.h);
          grd.addColorStop(0, `rgba(${r},${g},${b},0.15)`);
          grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = grd;
        } else {
          ctx.fillStyle = gradient;
        }
        ctx.fill();
      }

      // Line
      ctx.beginPath();
      for (let i = 0; i <= visibleCount && i < points.length; i++) {
        if (i === 0) {
          ctx.moveTo(points[i].x, points[i].y);
        } else {
          const prev = points[i - 1];
          const cpx = (prev.x + points[i].x) / 2;
          ctx.bezierCurveTo(cpx, prev.y, cpx, points[i].y, points[i].x, points[i].y);
        }
      }
      ctx.strokeStyle = ds.color || '#00C2FF';
      ctx.lineWidth = ds.lineWidth || 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke();

      // Data points
      points.forEach((pt, i) => {
        if (i > visibleCount) return;
        if (i === this.hoverIndex) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = (ds.color || '#00C2FF') + '33';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = ds.color || '#00C2FF';
          ctx.fill();
        }
      });
    });

    // Hover line & tooltip
    if (this.hoverIndex >= 0 && this.hoverIndex < count) {
      const x = plot.x + (plot.w / (count - 1)) * this.hoverIndex;

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(x, plot.y);
      ctx.lineTo(x, plot.y + plot.h);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Tooltip
      const tooltipY = plot.y + 5;
      const label = this.labels[this.hoverIndex];
      const values = this.datasets.map(ds => `${ds.label || ''}: ${ds.data[this.hoverIndex]}`);
      const text = [label, ...values];

      ctx.font = this.options.tooltipFont;
      const maxW = Math.max(...text.map(t => ctx.measureText(t).width));
      const tw = maxW + 20;
      const th = text.length * 20 + 12;
      let tx = x + 10;
      if (tx + tw > this.w) tx = x - tw - 10;

      ctx.fillStyle = this.options.tooltipBg;
      ctx.beginPath();
      ctx.roundRect(tx, tooltipY, tw, th, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = this.options.tooltipColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      text.forEach((t, i) => {
        if (i === 0) {
          ctx.fillStyle = '#94A3B8';
          ctx.fillText(t, tx + 10, tooltipY + 8);
        } else {
          ctx.fillStyle = this.datasets[i - 1]?.color || '#F1F5F9';
          ctx.fillText(t, tx + 10, tooltipY + 8 + i * 20);
        }
      });
    }
  }

  /* ── Bar Chart ─────────────────────────────────────── */
  drawBarChart(labels, datasets) {
    this.labels = labels;
    this.datasets = datasets;
    this.barMode = true;
    this._animate(() => this._drawBars());
  }

  _drawBars() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);

    const plot = this._getPlotArea();
    const { min: rawMin, max } = this._getMinMax(this.datasets);
    const min = Math.min(0, rawMin);
    this._drawGrid(plot, min, max);

    const count = this.labels.length;
    const groupW = plot.w / count;
    const barW = Math.min(groupW * 0.6 / this.datasets.length, 40);
    const progress = this.animProgress;

    this.datasets.forEach((ds, di) => {
      ds.data.forEach((v, i) => {
        const x = plot.x + groupW * i + (groupW - barW * this.datasets.length) / 2 + barW * di;
        const barH = ((v - min) / (max - min)) * plot.h * progress;
        const y = plot.y + plot.h - barH;
        const color = ds.color || '#00C2FF';

        // Bar with gradient
        const grd = ctx.createLinearGradient(x, y, x, plot.y + plot.h);
        if (color.startsWith('#')) {
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);
          grd.addColorStop(0, `rgba(${r},${g},${b},0.9)`);
          grd.addColorStop(1, `rgba(${r},${g},${b},0.4)`);
        }
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.roundRect(x, y, barW - 2, barH, [4, 4, 0, 0]);
        ctx.fill();

        // Hover highlight
        if (i === this.hoverIndex) {
          ctx.fillStyle = 'rgba(255,255,255,0.08)';
          ctx.fillRect(plot.x + groupW * i, plot.y, groupW, plot.h);
        }
      });
    });
  }

  /* ── Animation ─────────────────────────────────────── */
  _animate(drawFn) {
    const duration = this.options.animationDuration;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      this.animProgress = 1 - Math.pow(1 - t, 3); // ease-out cubic
      drawFn.call(this);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ── Static Methods ────────────────────────────────── */
  static drawSparkline(canvas, data, color = '#00C2FF', fill = true) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pad = 2;

    const points = data.map((v, i) => ({
      x: pad + (i / (data.length - 1)) * (w - pad * 2),
      y: pad + (1 - (v - min) / range) * (h - pad * 2)
    }));

    // Fill
    if (fill) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, h);
      points.forEach((p, i) => {
        if (i === 0) ctx.lineTo(p.x, p.y);
        else {
          const prev = points[i - 1];
          const cpx = (prev.x + p.x) / 2;
          ctx.bezierCurveTo(cpx, prev.y, cpx, p.y, p.x, p.y);
        }
      });
      ctx.lineTo(points[points.length - 1].x, h);
      ctx.closePath();

      if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const grd = ctx.createLinearGradient(0, 0, 0, h);
        grd.addColorStop(0, `rgba(${r},${g},${b},0.15)`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grd;
      }
      ctx.fill();
    }

    // Line
    ctx.beginPath();
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else {
        const prev = points[i - 1];
        const cpx = (prev.x + p.x) / 2;
        ctx.bezierCurveTo(cpx, prev.y, cpx, p.y, p.x, p.y);
      }
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // End dot
    const last = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  /* ── Gauge Chart ───────────────────────────────────── */
  static drawGauge(canvas, value, max, color = '#00C2FF', label = '') {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = Math.min(canvas.clientWidth, canvas.clientHeight);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.38;
    const lineW = size * 0.08;
    const startAngle = 0.75 * Math.PI;
    const endAngle = 2.25 * Math.PI;
    const totalAngle = endAngle - startAngle;
    const fillAngle = startAngle + (value / max) * totalAngle;

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = lineW;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Value arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, fillAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineW;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, fillAngle - 0.1, fillAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineW;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Value text
    ctx.fillStyle = '#F1F5F9';
    ctx.font = `bold ${size * 0.2}px 'Space Grotesk', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(value), cx, cy - 4);

    // Label
    if (label) {
      ctx.fillStyle = '#64748B';
      ctx.font = `500 ${size * 0.09}px Inter, sans-serif`;
      ctx.fillText(label, cx, cy + size * 0.16);
    }
  }
}

window.ChartEngine = ChartEngine;
