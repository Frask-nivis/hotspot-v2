let debugMode = localStorage.getItem('debugMode') === 'true';

(function () {
  // Debug tool: show sun trajectory and allow manual hour selection.
  const PANEL_ID = 'sunpath-debug';
  if (document.getElementById(PANEL_ID)) return;
  if (!debugMode) return;

  const sun = document.querySelector('.sun');
  if (!sun) return;

  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

  // Manual controls (updated via the debug panel)
  // These values are in percent (0-100) relative to the viewport / .sunCon container.
  let sunCenterX = 50;
  let sunCenterY = 93;
  let sunRadius = 76;  // percent of min(width, height)
  let lastHour = new Date().getHours();

  function getViewportSize() {
    const con = document.querySelector('.sunCon');
    if (con && con.getBoundingClientRect) {
      const rect = con.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }
    return { width: window.innerWidth, height: window.innerHeight };
  }

  function computeSunPosition(hour) {
    const start = 6;
    const end = 18;

    const progress = clamp((hour - start) / (end - start), 0, 1);
    const inDay = hour >= start && hour < end;

    const { width: vw, height: vh } = getViewportSize();

    const radiusPx = (Math.min(vw, vh) / 100) * Math.max(0, sunRadius);
    const centerXPx = (clamp(sunCenterX, 0, 100) / 100) * vw;
    const centerYPx = (clamp(sunCenterY, 0, 100) / 100) * vh;

    // Angle traverses from left (180°) to right (0°) across the sky
    const angle = Math.PI * (1 - progress);

    const leftPx = centerXPx + Math.cos(angle) * radiusPx;
    const topPx = centerYPx - Math.sin(angle) * radiusPx;

    const centerX = clamp(sunCenterX, 0, 100);
    const centerY = clamp(sunCenterY, 0, 100);
    const radius = Math.max(0, sunRadius);

    return {
      left: (leftPx / vw) * 100, // percent of viewport width (for vw units)
      top: topPx,
      opacity: inDay ? 1 : 0,
      inDay,
      progress,
      centerX,
      centerY,
      radius,
      centerXPx,
      centerYPx,
      radiusPx,
    };
  }

  function formatTime(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  const styles = `
    #${PANEL_ID} {
      position: fixed;
      top: 12px;
      right: 12px;
      width: 260px;
      padding: 10px 12px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.35);
      background: rgba(0,0,0,0.65);
      color: #f0f0f0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      z-index: 9999;
      backdrop-filter: blur(10px);
      line-height: 1.4;
    }
    #${PANEL_ID} h4 {
      margin: 0 0 6px;
      font-size: 13px;
    }
    #${PANEL_ID} button,
    #${PANEL_ID} input[type=range] {
      width: 100%;
      margin-top: 6px;
    }
    #${PANEL_ID} .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 6px;
    }
    #${PANEL_ID} .row span {
      font-variant-numeric: tabular-nums;
    }
    #${PANEL_ID} .close {
      background: transparent;
      border: 0;
      color: #ccc;
      cursor: pointer;
      font-size: 14px;
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 0;
    }
    #${PANEL_ID} .close:hover {
      color: #fff;
    }
    #${PANEL_ID} .section {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid rgba(255,255,255,0.15);
    }
    #${PANEL_ID} .small {
      font-size: 11px;
      opacity: 0.75;
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = `
    <button class="close" title="Close debug panel">✕</button>
    <h4>Sun path debug</h4>
    <div class="row"><span>device width</span><span id="${PANEL_ID}-device-width">--</span></div>
    <div class="row"><span>device height</span><span id="${PANEL_ID}-device-height">--</span></div>
    <div class="row"><span>Time</span><span id="${PANEL_ID}-time">--:--:--</span></div>
    <div class="row"><span>Sun</span><span id="${PANEL_ID}-pos">--</span></div>
    <div class="row"><span>Status</span><span id="${PANEL_ID}-status">--</span></div>
    <div class="section">
      <label for="${PANEL_ID}-hour">Manual hour</label>
      <input id="${PANEL_ID}-hour" type="range" min="0" max="23" value="12">
      <div class="row"><span>Hour</span><span id="${PANEL_ID}-hour-label">12</span></div>
      <button id="${PANEL_ID}-live" type="button">Live mode</button>
    </div>
    <div class="section">
      <label>Sun path circle</label>
      <div class="row"><span>Center X</span><span id="${PANEL_ID}-centerX-label">50%</span></div>
      <input id="${PANEL_ID}-centerX" type="range" min="0" max="100" value="50">
      <div class="row"><span>Center Y</span><span id="${PANEL_ID}-centerY-label">72%</span></div>
      <input id="${PANEL_ID}-centerY" type="range" min="0" max="100" value="72">
      <div class="row"><span>Radius</span><span id="${PANEL_ID}-radius-label">55%</span></div>
      <input id="${PANEL_ID}-radius" type="range" min="0" max="150" value="55">
      <button id="${PANEL_ID}-fit" type="button" style="margin-top: 8px;">Fit to screen</button>
    </div>
    <div class="small">Use the sliders to manually position the sun path; toggle live mode to follow system time.</div>
  `;
  // append panel SEKALI saja
  if (debugMode) {
    document.body.appendChild(panel);
  }

  // ambil element SEKALI (global scope)
  const deviceWidthEl = document.getElementById(`${PANEL_ID}-device-width`);
  const deviceHeightEl = document.getElementById(`${PANEL_ID}-device-height`);
  const timeEl = document.getElementById(`${PANEL_ID}-time`);
  const posEl = document.getElementById(`${PANEL_ID}-pos`);
  const statusEl = document.getElementById(`${PANEL_ID}-status`);
  const hourSlider = document.getElementById(`${PANEL_ID}-hour`);
  const hourLabel = document.getElementById(`${PANEL_ID}-hour-label`);
  const centerXSlider = document.getElementById(`${PANEL_ID}-centerX`);
  const centerXLabel = document.getElementById(`${PANEL_ID}-centerX-label`);
  const centerYSlider = document.getElementById(`${PANEL_ID}-centerY`);
  const centerYLabel = document.getElementById(`${PANEL_ID}-centerY-label`);
  const radiusSlider = document.getElementById(`${PANEL_ID}-radius`);
  const radiusLabel = document.getElementById(`${PANEL_ID}-radius-label`);
  const liveBtn = document.getElementById(`${PANEL_ID}-live`);
  const fitBtn = document.getElementById(`${PANEL_ID}-fit`);
  const closeBtn = panel.querySelector('.close');

  let liveMode = true;
  let intervalId = 0;

  function updateSlidersFromState() {
    centerXSlider.value = String(sunCenterX);
    centerXLabel.textContent = `${sunCenterX.toFixed(0)}%`;
    centerYSlider.value = String(sunCenterY);
    centerYLabel.textContent = `${sunCenterY.toFixed(0)}%`;
    radiusSlider.value = String(sunRadius);
    radiusLabel.textContent = `${sunRadius.toFixed(0)}%`;
  }

  function fitToScreen() {
    const { width: vw, height: vh } = getViewportSize();
    sunCenterX = 50;
    sunCenterY = 72;
    sunRadius = 55;
    updateSlidersFromState();
    applyCurrentHour();
  }

  function applyHour(hour) {
    const { left, top, opacity, inDay, centerX, centerY, radius } = computeSunPosition(hour);
    sun.style.left = left + "vw";
    sun.style.top = top + "px";
    sun.style.opacity = String(opacity);

    const posText = `L:${left.toFixed(1)}% T:${top.toFixed(0)}px (C:${centerX.toFixed(0)}%,${centerY.toFixed(0)}% R:${radius.toFixed(0)}%)`;
    posEl.textContent = posText;
    statusEl.textContent = inDay ? 'above horizon' : 'below horizon';
  }

  function applyCurrentHour() {
    applyHour(lastHour);
  }
  
  let olheight = window.innerHeight
  let olwidth = window.innerWidth

  if (deviceWidthEl && deviceHeightEl) {
    deviceWidthEl.textContent = olwidth
    deviceHeightEl.textContent = olheight
  }

  function updateSize() {
    const height = window.innerHeight
    const width = window.innerWidth

    if (height !== olheight || width !== olwidth) {
      deviceWidthEl.textContent = width
      deviceHeightEl.textContent = height
      olheight = height
      olwidth = width
    }
  }

  setInterval(updateSize, 100)

  function updateLive() {
    const now = new Date();
    const hour = now.getHours();
    lastHour = hour;
    timeEl.textContent = formatTime(now);
    hourSlider.value = String(hour);
    hourLabel.textContent = String(hour).padStart(2, '0');
    applyHour(hour);
  }

  function setLiveMode(on) {
    liveMode = on;
    if (liveMode) {
      liveBtn.textContent = 'Live mode';
      if (intervalId) clearInterval(intervalId);
      updateLive();
      intervalId = setInterval(updateLive, 1000);
      delete window.__debugHour; // 🔥 remove from theme
    } else {
      liveBtn.textContent = 'Manual mode';
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = 0;
      }
      applyCurrentHour();
    }
  }
  if (hourSlider) {

    hourSlider.addEventListener('input', (event) => {
      const hour = Number(event.target.value);
      lastHour = hour;
  
      window.__debugHour = hour; // 🔥 inject ke theme
  
      hourLabel.textContent = String(hour).padStart(2, '0');
  
      if (typeof window.updateSunPositionByTime === 'function') {
        window.updateSunPositionByTime();
      }
      if (typeof window.updateMoonPositionByTime === 'function') {
        window.updateMoonPositionByTime();
      }
    });
    centerXSlider.addEventListener('input', (event) => {
      sunCenterX = Number(event.target.value);
      centerXLabel.textContent = `${sunCenterX.toFixed(0)}%`;
      document.documentElement.style.setProperty('--sun-center-x', sunCenterX + '%');
      applyCurrentHour();
    });
  
    centerYSlider.addEventListener('input', (event) => {
      sunCenterY = Number(event.target.value);
      centerYLabel.textContent = `${sunCenterY.toFixed(0)}%`;
      document.documentElement.style.setProperty('--sun-center-y', sunCenterY + '%');
      applyCurrentHour();
    });
  
    radiusSlider.addEventListener('input', (event) => {
      sunRadius = Number(event.target.value);
      radiusLabel.textContent = `${sunRadius.toFixed(0)}%`;
      document.documentElement.style.setProperty('--sun-radius', sunRadius + '%');
      applyCurrentHour();
    });
  }


  liveBtn.addEventListener('click', () => {
    setLiveMode(!liveMode);
  });

  fitBtn.addEventListener('click', () => {
    fitToScreen();
  });

  closeBtn.addEventListener('click', () => {
    panel.style.display = 'none';
  });

  // Adjust sun position when window / container size changes
  window.addEventListener('resize', () => {
    applyCurrentHour();
  });

  // Toggle panel visibility with Ctrl+Shift+S
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 's') {
      event.preventDefault();
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
  });

  // Initialize controls and start in live mode
  updateSlidersFromState();
  setLiveMode(true);
})();
