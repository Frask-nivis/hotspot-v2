const greet = document.getElementById("greet");
const ver = document.getElementById("ver");

let currVer = "v4.5"

ver.textContent = currVer;

let isBright = localStorage.getItem('themeMode') === 'localtime' ? (new Date().getHours() >= 6 && new Date().getHours() < 18) : localStorage.getItem('themeMode') === 'bright';
    function updateClock() {  
      const now = new Date() 
      //jam
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      //tanggal
      const dd = String(now.getDate()).padStart(2, "0");
      const MM = String(now.getMonth() + 1).padStart(2, "0");
      const yyyy = String(now.getFullYear()).padStart(4, "0");
      const day = [
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY", 
        "SATURDAY"
      ][now.getDay()];

      const greeting = { 
        "05" : "SELAMAT PAGI SAHABAT!",
        "12" : "SELAMAT SIANG SAHABAT!",
        "15" : "SELAMAT SORE SAHABAT!",
        "21" : "SELAMAT MALAM SAHABAT!",
        "00" : "SAHABAT?🤨"
      }

      const timeSignal = {
        "MT" : "05",
        "NT" : "12",
        "AFT" : "15",
        "NgT" : "21",
        "MNT" : "0"
      }

      const calender = document.getElementById("date");
      calender.innerHTML = `${day}, ${dd}-${MM}-${yyyy}`;
      const T = document.getElementById("hour");
      
      function setTime(T) {
        T.innerHTML = `(${hh}:${mm}:${ss})`;

        const time = T.textContent.match(/\((.*?)\)/)[1];
        const hour = +time.split(":")[0];
  
        const value = Object.values(timeSignal).map(Number);
        if (value) {
          const closestH = value
            .filter(v => v <= hour)
            .sort((a, b) => b - a)[0] || 0;
  
          const key = closestH.toString().padStart(2, "0");
          if (greet) {
            greet.textContent = `${greeting[key]}`
          }
        }
      }
      if (T) {
        setTime(T);
      }
      const nextTick = 1000 - now.getMilliseconds();
      setTimeout(updateClock, nextTick);
    }
    updateClock();
    if (typeof updateSunPositionByTime === 'function') updateSunPositionByTime();
    if (typeof updateMoonPositionByTime === 'function') updateMoonPositionByTime();

      const cloudCon = document.querySelector(".cloudCon")
      const starCon = document.querySelector(".starCon")

      const img = [
        'img/cloud1.avif',
        'img/cloud2.avif',
        'img/cloud3.avif',
        'img/cloud4.avif',  
        'img/cloud5.avif'
      ]; 

      const starImg = [ 
        'img/star1.png',
        'img/star2.png',
        'img/star3.png',
      ] 

      let starAv = 5;
      let cloudAv = 30;
      let stars = [];
      let clouds = [];
      function random(min, max) {
        return Math.random() * (max - min) + min;
      }

      function createStar() {
        for (let i = 0; i < starAv; i++) {
          const star = document.createElement('div')
          star.classList.add('star')
  
          const images = starImg[Math.floor(Math.random() * starImg.length)]
          star.style.backgroundImage = `url(${images})`;
  
          const size = random(10, 20)
          star.style.width = `${size}px`
          star.style.height = `${size}px`
  
          star.style.position = 'relative';
          star.style.top = `${random(10, 50)}%`
  
          star.style.left = `${random(7, 97)}%`
  
          star.style.filter = `brightness(100 )`;
  
          star.style.animationDuration = `${random(20, 30)}s`
   
          starCon.appendChild(star)
          stars.push(star)
          
        }
      }
      for (let i = 0; i < cloudAv; i++) {
        const cloud = document.createElement('div')
        cloud.classList.add('cloud')

        const images = img[Math.floor(Math.random() * img.length)];
        cloud.style.backgroundImage = `url(${images})`;

        const size = random(100, 200) 
        cloud.style.width = `${size}px`;
        cloud.style.height = `${size * 0.6}px`;

        cloud.style.top = `${random(5, 60)}%`

        cloud.style.opacity = `${random(1, 100)}%`;

        cloud.style.animationDuration = `${random(40, 120)}s`; 

        cloud.style.animationDelay = `${random(-120, 0)}s`;

        if (isBright) {
          cloud.style.filter = 'brightness(50%)';
        } else {
          cloud.style.filter = 'brightness(100%)';
        }

        cloudCon.appendChild(cloud)
        clouds.push(cloud)
      }

// ===== ANTI-BYPASS COLOR ENFORCEMENT =====
// Ensure form elements maintain their colors across all browsers
function enforceFormColors() {
  const formElements = document.querySelectorAll('.username, .password, .submit, input[type="text"], input[type="password"], input[type="submit"]');
  
  formElements.forEach(el => {
    el.style.setProperty('color', 'black', 'important');
    el.style.setProperty('background-color', 'white', 'important');
    el.style.setProperty('-webkit-text-fill-color', 'black', 'important');
    el.style.setProperty('caret-color', 'black', 'important');
    el.style.setProperty('border-color', 'var(--reverseAccent)', 'important');
    el.style.setProperty('background', 'white', 'important');
  });
  
  // Protect wifi and calendar icons
  const icons = document.querySelectorAll('.wifi, .calender');
  icons.forEach(icon => {
    icon.style.setProperty('filter', 'none', 'important');
    icon.style.setProperty('opacity', '1', 'important');
    icon.style.setProperty('-webkit-filter', 'none', 'important');
  });
}

// Run on page load
document.addEventListener('DOMContentLoaded', enforceFormColors);

// Run on focus events to prevent autofill color override
document.addEventListener('focus', enforceFormColors, true);

// Run periodically in case system tries to override
setInterval(enforceFormColors, 2000);

// Force colors on input events
const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
inputs.forEach(input => {
  input.addEventListener('input', enforceFormColors);
  input.addEventListener('change', enforceFormColors);
  input.addEventListener('focus', enforceFormColors);
  input.addEventListener('blur', enforceFormColors);
  input.addEventListener('autofill', enforceFormColors);
});

      const updateStars = () => {
        if (!isBright) {
          if (stars.length === 0) createStar();
        } else {
          starCon.innerHTML = '';
          stars = [];
        }
      };

      const updateClouds = () => {
        clouds.forEach(cloud => {
          cloud.style.filter = isBright ? 'brightness(50%)' : 'brightness(100%)';
        });
      };

      updateStars();
      updateClouds();