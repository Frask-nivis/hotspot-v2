(function(){
  // Theme manager with 4 time-of-day categories (IIFE) — safe to include on any page
  if (window.__themeManagerInstalled) return;
  window.__themeManagerInstalled = true;

  const MODE_IMG_SUN = 'url("img/sun-dim.png")';
  const MODE_IMG_MOON = 'url("img/moon.png")';
  
  // Time-of-day boundaries (hours)
  const TIME_BOUNDARIES = {
    pagi:  { start: 6,  end: 11 },   // Pagi: 06:00–11:00 (bright, orange)
    siang: { start: 11, end: 15 },   // Siang: 11:00–15:00 (brightest, blue)
    sore:  { start: 15, end: 18 },   // Sore: 15:00–18:00 (bright, orange)
    malam: { start: 18, end: 6 }     // Malam: 18:00–06:00 (dark, purple)
  };

  function computeTimeOfDay() {
    const h = new Date().getHours();
    if (h >= TIME_BOUNDARIES.pagi.start && h < TIME_BOUNDARIES.pagi.end) return 'pagi';
    if (h >= TIME_BOUNDARIES.siang.start && h < TIME_BOUNDARIES.siang.end) return 'siang';
    if (h >= TIME_BOUNDARIES.sore.start && h < TIME_BOUNDARIES.sore.end) return 'sore';
    return 'malam';
  }

  function applyTheme(timeOfDay) {
    // Remove all time-of-day classes
    document.documentElement.classList.remove('pagi', 'siang', 'sore', 'malam', 'dark');
    // Apply the new one
    document.documentElement.classList.add(timeOfDay);
    // Keep 'dark' for malam compatibility
    if (timeOfDay === 'malam') document.documentElement.classList.add('dark');
    
    const modeEl = document.getElementById('mode');
    if (modeEl) {
      // Show sun for bright periods, moon for dark
      const isBright = timeOfDay !== 'malam';
      modeEl.style.backgroundImage = isBright ? MODE_IMG_SUN : MODE_IMG_MOON;
    }
    
    // Notify page of theme change
    if (typeof window.updateStars === 'function') try { window.updateStars(); } catch(e) {}
    if (typeof window.updateClouds === 'function') try { window.updateClouds(); } catch(e) {}
  }

  // Read legacy and canonical keys
  let themeMode = localStorage.getItem('themeMode');
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
    // Manual mode: convert old boolean to a fixed time-of-day (default: siang for true, malam for false)
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

  // Click handling: single click cycles through periods; triple-click enables localtime
  const modeEl = document.getElementById('mode');
  if (!modeEl) return;
  
  const timeOfDayOrder = ['siang', 'sore', 'malam', 'pagi'];
  
  let clickCount = 0, clickTimeout = null;
  modeEl.addEventListener('click', () => {
    clickCount++;
    if (clickTimeout) clearTimeout(clickTimeout);
    clickTimeout = setTimeout(() => { clickCount = 0; clickTimeout = null; }, 700);

    if (clickCount >= 3) {
      clickCount = 0;
      themeMode = 'localtime';
      localStorage.setItem('themeMode', 'localtime');
      localStorage.removeItem('themeIsBright');
      localStorage.setItem('localTime', 'true');
      currentTimeOfDay = computeTimeOfDay();
      applyTheme(currentTimeOfDay);
      startLocaltimeInterval();
      return;
    }

    // Single click: cycle to next period in manual mode
    if (themeMode === 'localtime') stopLocaltimeInterval();
    themeMode = 'manual';
    const currentIndex = timeOfDayOrder.indexOf(currentTimeOfDay);
    const nextIndex = (currentIndex + 1) % timeOfDayOrder.length;
    currentTimeOfDay = timeOfDayOrder[nextIndex];
    
    // Save as binary for backward compatibility (only siang/sore are "bright")
    const isBright = currentTimeOfDay !== 'malam' && currentTimeOfDay !== 'pagi';
    localStorage.setItem('themeMode', 'manual');
    localStorage.setItem('themeIsBright', isBright ? 'true' : 'false');
    localStorage.removeItem('localTime');
    applyTheme(currentTimeOfDay);
  });
})();
