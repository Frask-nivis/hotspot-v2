  (function(){
    // Theme manager with 4 time-of-day categories (IIFE)
    if (window.__themeManagerInstalled) return;
    window.__themeManagerInstalled = true;

    const MODE_IMG_SUN = 'url("img/sun-dim.png")';
    const MODE_IMG_MOON = 'url("img/moon.png")';
    // Icon mapping for each mode (declare before any UI refresh)
    const MODE_ICONS = {
      pagi:      'img/sun-rise.png',
      siang:     'img/sun-dim.png',
      sore:      'img/sun-set.png',
      malam:     'img/moon.png',
      localtime: 'img/mode-localtime.png'
    };
    const MODE_LABELS = {
      pagi: 'Pagi', siang: 'Siang', sore: 'Sore',
      malam: 'Malam', localtime: 'Real-time'
    };

    // Time-of-day boundaries (hours)python
    const TIME_BOUNDARIES = {
      pagi:  { start: 6,  end: 11 },
      siang: { start: 11, end: 15 },
      sore:  { start: 15, end: 18 },
      malam: { start: 18, end: 6 }
    };
    
    function computeTimeOfDay() {
      const h = new Date().getHours();
      if (h >= TIME_BOUNDARIES.pagi.start && h < TIME_BOUNDARIES.pagi.end) return 'pagi';
      if (h >= TIME_BOUNDARIES.siang.start && h < TIME_BOUNDARIES.siang.end) return 'siang';
      if (h >= TIME_BOUNDARIES.sore.start && h < TIME_BOUNDARIES.sore.end) return 'sore';
      return 'malam';
    }

    // Apply theme classes and update UI
    function applyTheme(timeOfDay) {
      document.documentElement.classList.remove('pagi','siang','sore','malam','dark');
      document.documentElement.classList.add(timeOfDay);
      if (timeOfDay === 'malam') {
        document.documentElement.classList.add('dark')
      };

      // refresh icon/menu state (safe because MODE_ICONS defined above)
      try { if (typeof refreshModeUI === 'function') refreshModeUI(); } catch(e) { console.error(e); }

      if (typeof window.updateStars === 'function') try { window.updateStars(); } catch(e) {}
      if (typeof window.updateClouds === 'function') try { window.updateClouds(); } catch(e) {}
      if (typeof updateSunPositionByTime === 'function') {
          updateSunPositionByTime();
      }
      if (typeof updateMoonPositionByTime === 'function') {
          updateMoonPositionByTime();
      }
    }

    // Read saved state
    let themeMode = localStorage.getItem('themeMode') || 'localTime';
    window.__themeMode = themeMode;

    const legacyLocalTime = localStorage.getItem('localTime') === 'true';
    const currState = localStorage.getItem('themeIsBright');

    if (!themeMode) {
      if (legacyLocalTime) themeMode = 'localtime';
      else if (currState !== null) themeMode = 'manual';
      else {
        themeMode = 'manual';
        localStorage.setItem('themeIsBright', (!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)).toString());
      }
      localStorage.setItem('themeMode', themeMode);
    }

    let currentTimeOfDay = (themeMode === 'localtime') ? computeTimeOfDay() : null;
    if (!currentTimeOfDay) {
      const isBright = currState !== null ? currState === 'true' : !(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      currentTimeOfDay = isBright ? 'siang' : 'malam';
    }
    applyTheme(currentTimeOfDay);
    // localtime auto-check
    let localtimeInterval = null; 
    function startLocaltimeInterval() {
      if (localtimeInterval) return;
      localtimeInterval = setInterval(() => {
        const newTod = computeTimeOfDay();
        if (newTod !== currentTimeOfDay) {
          currentTimeOfDay = newTod;
          applyTheme(currentTimeOfDay);
        }
      }, 60 * 1000);
    }
    function stopLocaltimeInterval() {
      if (!localtimeInterval) return;
      clearInterval(localtimeInterval);
      localtimeInterval = null;
    }

    if (themeMode === 'localtime') startLocaltimeInterval();
    // schedule periodic updates of sun/moon positions if the handlers exist
    startCelestialHourlyUpdate();

    // Celestial helper routines (sun/moon motion)
    function parsePercent(value, fallback) {
      if (!value) return fallback;
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    }

    function getSunPathConfig() {
      const style = getComputedStyle(document.documentElement);
      const height = window.innerHeight;
      const width = window.innerWidth;

      let Cy = parsePercent(style.getPropertyValue('--sun-center-y'), 86);

      if (height < 400) {
        Cy = Cy * (height / 400);
      }

      let radiusX = parsePercent(style.getPropertyValue('--sun-radius'), 70);
      let radiusY = radiusX;

      // 📱 Mode HP → jadi lonjong
      if (width < 600) {
        radiusY = radiusX * 0.6; // lebih gepeng ke bawah
      }

      return {
        centerX: parsePercent(style.getPropertyValue('--sun-center-x'), 50),
        centerY: Cy,
        radiusX,
        radiusY
      };
    }

    function getViewportSize() {
      const con = document.querySelector('.sunCon');
      if (con && con.getBoundingClientRect) {
        const rect = con.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }
      return { width: window.innerWidth, height: window.innerHeight };
    }

    function updateSunPositionByTime() {
      const sun = document.querySelector('.sun');
      if (!sun) return;

      const hour = (window.__debugHour ?? new Date().getHours());
      const start = 6, end = 18;
      const h = Math.min(Math.max(hour, start), end);
      const progress = (h - start) / (end - start);

      const { centerX, centerY, radiusX, radiusY } = getSunPathConfig();
      const { width: vw, height: vh } = getViewportSize();

      const radiusXPx = (vw / 100) * Math.max(0, radiusX);
      const radiusYPx = (vh / 100) * Math.max(0, radiusY);

      const centerXPx = (Math.min(100, Math.max(0, centerX)) / 100) * vw;
      const centerYPx = (Math.min(100, Math.max(0, centerY)) / 100) * vh;

      const angle = Math.PI * (1 - progress);
      const leftPx = centerXPx + Math.cos(angle) * radiusXPx;
      const topPx = centerYPx - Math.sin(angle) * radiusYPx;

      const left = (leftPx / vw) * 100;
      const top = (topPx / vh) * 100;

      // Ensure sun stays within screen bounds (accounting for its 100px size)
      const halfSizeW = (50 / vw) * 100;
      const halfSizeH = (50 / vh) * 100;

      const clampedLeft = Math.min(Math.max(left, halfSizeW), 100 - halfSizeW);
      const clampedTop = Math.min(Math.max(top, halfSizeH), 100 - halfSizeH);

      sun.style.left = `${clampedLeft}%`;
      sun.style.top = `${clampedTop}%`;

      sun.style.opacity = (hour >= start && hour < end) ? '1' : '0';
    }

    function updateMoonPositionByTime() {
        const moon = document.querySelector('.moon');
        if (!moon) return;

        let hour = (window.__debugHour ?? new Date().getHours());
        const start = 18, end = 30; // 18 (6 sore) sampai 30 (6 pagi besok)

        if (hour < start) hour += 24;

        const h = Math.min(Math.max(hour, start), end);
        const progress = (h - start) / (end - start);

        const { centerX, centerY, radiusX, radiusY } = getSunPathConfig();
        const { width: vw, height: vh } = getViewportSize();

        const radiusXPx = (vw / 100) * radiusX;
        const radiusYPx = (vh / 100) * radiusY; 
        
        const centerXPx = (centerX / 100) * vw;
        const centerYPx = (centerY / 100) * vh;

        const angle = Math.PI * (1 - progress); 

        const leftPx = centerXPx + Math.cos(angle) * radiusXPx;
        const topPx = centerYPx - Math.sin(angle) * radiusYPx;

        const left = (leftPx / vw) * 100;
        const top = (topPx / vh) * 100;

        const halfSizeW = (50 / vw) * 100;
        const halfSizeH = (50 / vh) * 100;

        const clampedLeft = Math.min(Math.max(left, halfSizeW), 100 - halfSizeW);
        const clampedTop = Math.min(Math.max(top, halfSizeH), 100 - halfSizeH);

        moon.style.left = `${clampedLeft}%`;
        moon.style.top = `${clampedTop}%`;
        moon.style.opacity = (hour >= start && hour < end) ? '1' : '0';
    }

    function startCelestialHourlyUpdate() {
      if (window.__celestialInterval) return;
      // Update langsung saat pertama kali
      if (typeof updateSunPositionByTime === 'function') updateSunPositionByTime();
      if (typeof updateMoonPositionByTime === 'function') updateMoonPositionByTime();
      
      function scheduleNext() {
        const now = new Date();
        const next = new Date(now);
        next.setHours(now.getHours() + 1, 0, 0, 0);
        const delay = next - now;
        window.__celestialInterval = setTimeout(() => {
          if (typeof updateSunPositionByTime === 'function') updateSunPositionByTime();
          if (typeof updateMoonPositionByTime === 'function') updateMoonPositionByTime();
          scheduleNext();
        }, delay);
      }
      scheduleNext();
    }

    // expose helpers globally for legacy pages/scripts
    window.updateSunPositionByTime = updateSunPositionByTime;
    window.updateMoonPositionByTime = updateMoonPositionByTime;

    let lastConfig = JSON.stringify(getSunPathConfig());

    setInterval(() => {
      const currConfig = JSON.stringify(getSunPathConfig());
      if (currConfig !== lastConfig) {
        lastConfig = currConfig;
        updateMoonPositionByTime();
        updateSunPositionByTime();
      }
    }, 200)

    function loop() {
      updateSunPositionByTime();
      updateMoonPositionByTime();
      requestAnimationFrame(loop);
    }
    loop();
    
    // Build and manage the custom dropdown UI
    function refreshModeUI() {
      const container = document.getElementById('mode');
      const icon = document.getElementById('modeIcon');
      if (!container || !icon) return;
      const key = themeMode === 'localtime' ? 'localtime' : currentTimeOfDay;
      icon.src = MODE_ICONS[key] || MODE_ICONS.siang;
      icon.alt = MODE_LABELS[key];

      const menu = container.querySelector('.mode-menu');
      if (!menu) return;
      if (!container._menuBuilt) {
        for (const m of ['pagi','siang','sore','malam','localtime']) {
          const item = document.createElement('div');
          item.className = 'mode-item';
          item.dataset.mode = m;
          const img = document.createElement('img');
          img.src = MODE_ICONS[m];
          img.alt = MODE_LABELS[m];
          item.appendChild(img);
          const span = document.createElement('span');
          span.textContent = MODE_LABELS[m];
          item.appendChild(span);
          menu.appendChild(item);
        }
        container._menuBuilt = true;

        container.addEventListener('click', e => {
          e.stopPropagation();
          menu.classList.toggle('hidden');
        });
        menu.addEventListener('click', e => {
          const it = e.target.closest('.mode-item');
          if (!it) return;
          const sel = it.dataset.mode;
          handleModeSelection(sel);
          menu.classList.add('hidden');
        });
        document.addEventListener('click', () => menu.classList.add('hidden'));
      }
    }

    function handleModeSelection(sel) {
      if (sel === 'localtime') {
        themeMode = 'localtime';
        window.__themeMode = 'localtime';
        localStorage.setItem('themeMode','localtime');
        localStorage.removeItem('themeIsBright');
        localStorage.setItem('localTime','true');
        currentTimeOfDay = computeTimeOfDay();
        applyTheme(currentTimeOfDay);
        startLocaltimeInterval();
      } else {
        if (themeMode === 'localtime') stopLocaltimeInterval();
        themeMode = 'manual';
        window.__themeMode = 'manual';
        currentTimeOfDay = sel;
        const isBright = currentTimeOfDay !== 'malam' && currentTimeOfDay !== 'pagi';
        localStorage.setItem('themeMode','manual');
        localStorage.setItem('themeIsBright', isBright ? 'true' : 'false');
        localStorage.removeItem('localTime');
        applyTheme(currentTimeOfDay);
      }
    }

    // initialize UI once DOM is ready and immediately attempt to refresh
    document.addEventListener('DOMContentLoaded', refreshModeUI);
    refreshModeUI();

  })();

