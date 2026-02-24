      // Referensi elemen
      const loginCont = document.getElementById('login-toggle-Container');
      const toggleWrap = document.querySelector('.toggle-container');
      const toggle = document.getElementById('login-toggle');
      const toggleH = document.getElementById('toggle-H');
      const toggleH1 = document.getElementById('toggle-h1');     
      const toggleH2 = document.getElementById('toggle-h1-2');
      const protoLogin = document.getElementById('protoLogin');
      const inToggleH1 = document.getElementById('in-toggle-h1');  
      const greet = document.getElementById("greet");
      const td1 = document.getElementById("td1");
      const td2 = document.getElementById("td2");
      const submit = document.getElementById("submit")


  
      const currentMode = document.getElementById('mode');
      const info = document.getElementById("info");

      const cloudCon = document.querySelector(".cloudCon")
      const starCon = document.querySelector(".starCon")
            // Theme logic moved to script/theme.js — please use that file to manage themeMode (manual/localtime)
      const user = protoLogin.querySelector('input[name="username"]');
      const pass = protoLogin.querySelector('input[name="password"]');

      user.addEventListener('click', () => { 
        if (isvoucher) pass.value = user.value;
      })  

      let isvoucher = true;

      // Tambahkan event listener untuk DOM ready
      document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('ready');
        updateClock();
      });

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
        T.innerHTML = `(${hh}:${mm}:${ss})`;


        const time = T.textContent.match(/\((.*?)\)/)[1];
        const hour = +time.split(":")[0];

        const value = Object.values(timeSignal).map(Number);
        if (value) {
          const closestH = value
            .filter(v => v <= hour)
            .sort((a, b) => b - a)[0] || 0;

          const key = closestH.toString().padStart(2, "0");

          greet.textContent = `${greeting[key]}`

        }
        
        const nextTick = 1000 - now.getMilliseconds();
        setTimeout(updateClock, nextTick);
      }

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

      let starAv = 50;   
      let cloudAv = 10;
      let stars = [];
      let clouds = [];
      function random(min, max) {
        return Math.random() * (max - min) + min;
      }
      function createStar() {
        const frag = document.createDocumentFragment();
        for (let i = 0; i < starAv; i++) {
          const star = document.createElement('div')
          star.classList.add('star')

          const images = starImg[Math.floor(Math.random() * starImg.length)]
          const size = random(10, 20)
          star.style.cssText = `
            background-image: url(${images});
            width: ${size}px;
            height: ${size}px;
            position: relative;
            top: ${random(50, 10)}%;
            left: ${random(7, 97)}%;
            animation-duration: ${random(20, 30)}s;
          `;

          frag.appendChild(star)
          stars.push(star)
        }
        starCon.appendChild(frag);
      }

      function createClouds() {
        const frag = document.createDocumentFragment();
        for (let i = 0; i < cloudAv; i++) {
          const cloud = document.createElement('div')
          cloud.classList.add('cloud')

          const images = img[Math.floor(Math.random() * img.length)];
          const size = random(100, 200)
          const opacity = random(0.3, 1);
          cloud.style.cssText = `
            background-image: url(${images});
            width: ${size}px;
            height: ${size * 0.6}px;
            top: ${random(5, 60)}%;
            opacity: ${opacity};
            animation-duration: ${random(40, 120)}s;
            animation-delay: ${random(-120, 0)}s;
            filter: ${isBright ? 'brightness(50%)' : 'brightness(100%)'};
          `;

          frag.appendChild(cloud)
          clouds.push(cloud)
        }
        cloudCon.appendChild(frag);
      }

      // Tunda animasi sampai load selesai
      window.addEventListener('load', () => {
        requestIdleCallback(() => {
          if (!isBright) createStar();
          createClouds();
        }, { timeout: 1500 });
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
    
    function fixLayoutForKeyboard() {
    const isKeyboardOpen = window.innerHeight < screen.height * 0.75;

    const main = document.querySelector(".main");
    const header = document.querySelector(".site-header");
    const footer = document.querySelector(".footer"); 
    const con = document.querySelector(".con");
    const proto = document.querySelector(".proto");
    const dcon = document.querySelector(".dcon");
    const tc = document.querySelector(".header-grid") || document.querySelector(".timeCon")
    const errorCon = document.querySelector(".errorCon")
        const root = document.documentElement;
        const currMarB = getComputedStyle(root).getPropertyValue('--marginB');
 
  
    if (isKeyboardOpen) {
        // Saat keyboard muncul → rapatkan layout
        header.style.position = "absolute"; 
        header.style.height = "90px";    // jauh lebih rendah
        main.style.top = "0";
        if (tc) tc.style.gap = "0px";
        main.style.paddingTop = "100px";
        footer.style.height = "10px"
        con.style.top = "250px";
        con.style.transform = 'scale(0.6)';
        proto.style.transform = "scale(.8)"
        dcon.style.transform = "translateY(-60px) scale(0.5)" 
        loginCont.style.transform = "scale(0.9) translateY(-50px)"
        currentMode.style.transform = "scale(.6)"
        if (info) info.style.transform = "scale(.8) translateY(-60px)";
          root.style.setProperty('--marginB', '10px');
        root.style.setProperty('--height', '60px');   

        errorCon.style.top = "-49px" 
        errorCon.style.transform = "scale(0.9)"
        if (window.innerWidth > 480) { 
          greet.style.top = "70px"  
        } else {  
          greet.style.top = "10px" 
          greet.style.fontSize = ".87em" 
        }
    } else {  
        header.style.position = "fixed";
        header.style.height = "var(--header-h)";
        main.style.top = "-10%"; 
        if (tc) tc.style.gap = "5px";  
        main.style.paddingTop = "100px";
        footer.style.height = "100px";
        con.style.top = "90px";
        con.style.transform = "translateY(65px) scale(0.7)";
        proto.style.transform = "scale(1)";
        dcon.style.transform = "translateY(-80px)"; 
        loginCont.style.transform = "scale(1) translateY(-25px)";
        currentMode.style.transform = "scale(1)"
        errorCon.style.transform = "scale(1)"
        errorCon.style.top = "-35px"
        root.style.setProperty('--marginB', '100px')
        root.style.setProperty('--height', currMarB)
        info.style.transform = "scale(1) translateY(-20px)"
        if (window.innerWidth > 480) {
          greet.style.top = "70px";
        } else {
          greet.style.top = "-10px";   
          greet.style.fontSize = "1em"
        }
    }
}

window.addEventListener("resize", fixLayoutForKeyboard);
      // Helper untuk set state visual
      function setLeftState() {     
          inToggleH1.style.color = 'white';
          toggleH2.style.color = '#000000';
          inToggleH1.textContent = 'Voucher';
          toggleH2.style.zIndex = '5';
          toggleWrap.style.zIndex = '4'; 
          toggleH1.style.zIndex = '3';  

          // FIX PENTING
          pass.classList.add("hidden-pass");
          td1.classList.add("hidden-row");
          user.style.marginBottom = "0px";
          // atur value password
          pass.value = user.value;

          // label SUBMIT kembali normal
          submit.value = "LOGIN";

            isvoucher = true;   
            console.log("mode voucher");
            currtoggle = "left";
            localStorage.setItem('loginToggleState', currtoggle);
      }
       
      submit.addEventListener('click', () => {
        if (user.value && isvoucher) {
          pass.value = user.value
          submit.textContent = pass.value

        }
      }) 
        
      function setRightState() { 
          toggleH1.style.color = '#000000';
          inToggleH1.style.color = 'white';
          inToggleH1.textContent = 'Member';
          toggleH2.style.zIndex = '3';
          toggleWrap.style.zIndex = '4';
          toggleH1.style.zIndex = '5';


          pass.type = "password"; 
          pass.classList.remove("hidden-pass");
          td1.classList.remove("hidden-row");
          user.style.marginBottom = "10px";

            isvoucher = false;
            console.log("mode member");
            currtoggle = "right";
            localStorage.setItem('loginToggleState', currtoggle);
      }


      // Inisialisasi posisi awal kiri
      const savedState = localStorage.getItem('loginToggleState');
      if (savedState === 'right') {
        toggleWrap.classList.add('is-right');
        setRightState()
      } else {
        toggleWrap.classList.remove('is-right');
        setLeftState();
      }

      let dragging = false;
      let startX = 0;
      let startTransformX = 0;
      let didDrag = false;
      const dragThreshold = 8;
      let suppressClick = false;
      let startFromToggle = false;

      function getTransformXPx() {
        const t = getComputedStyle(toggleWrap).transform; 
        if (t === 'none') return 0;
        try {
          const m = new DOMMatrixReadOnly(t);
          return m.m41 || 0;
        } catch {
          return 0;
        }  
      }

      function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
      }

      function onPointerDown(e) {
          if (toggleH.contains(e.target)) return;
          dragging = true;
          didDrag = false;
          suppressClick = false;
          startFromToggle = !!e.target.closest('#login-toggle');
          startX = e.clientX;

          startTransformX = getTransformXPx();
          toggleWrap.style.transition = 'none';

          try { loginCont.setPointerCapture(e.pointerId); } catch {}
      }

      function onPointerMove(e) {
          if (!dragging) return; 

          const dx = e.clientX - startX;
          if (Math.abs(dx) < dragThreshold) return;
          didDrag = true;

          const maxX = loginCont.clientWidth - toggleWrap.clientWidth - 10;
          const nextX = clamp(startTransformX + dx, 0, maxX);

          toggleWrap.style.transform = `translateX(${nextX}px)`;
      }

      function applyStateFromPosition(posX) {
          const maxX = loginCont.clientWidth - toggleWrap.clientWidth - 10;

          toggleWrap.style.transition = '';

          if (posX > maxX / 2) {
              toggleWrap.classList.add('is-right');
              toggleWrap.style.transform = '';
              setRightState();
          } else {
              toggleWrap.classList.remove('is-right');
              toggleWrap.style.transform = '';   
              setLeftState();
          }
      }

function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;

    if (didDrag) {
        const currentX = getTransformXPx();
        applyStateFromPosition(currentX);

        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 200);
    }

    else if (startFromToggle) {

        // SUDAH Voucher → tetap Voucher
        if (isvoucher) {
            toggleWrap.classList.remove('is-right');
            setLeftState();
        }

        // SUDAH Member → tetap Member
        else {
            toggleWrap.classList.add('is-right');
            setRightState();
        }

        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 200);
    }

    try { loginCont.releasePointerCapture(e.pointerId); } catch {}
}
      // Klik label untuk pindah kiri/kanan tanpa drag
      toggleH1.addEventListener('click', (e) => {
          if (suppressClick) return;
          if (isvoucher) return; // SUDAH VOUCHER → jangan ubah apa pun

          toggleWrap.style.transition = '';
          toggleWrap.classList.remove('is-right');
          toggleWrap.style.transform = '';
          setLeftState();
      });


      toggleH2.addEventListener('click', (e) => {
        if (suppressClick) { e.preventDefault(); return; }
        if (isvoucher) {
          toggleWrap.style.transition = '';
          toggleWrap.style.transform = '';
          toggleWrap.classList.add('is-right');
          setRightState();
        } else {  
          return
        };
      });
      

      loginCont.addEventListener("pointerdown", onPointerDown);
      loginCont.addEventListener("pointermove", onPointerMove);
      loginCont.addEventListener("pointerup", onPointerUp);
      loginCont.addEventListener("pointerleave", onPointerUp);

      // Deteksi error dari Mikrotik dan tampilkan error container
      function handleErrorDisplay() {
        const errorCon = document.querySelector('.errorCon');
        const errorSpan = document.querySelector('.error');
        if (errorSpan && errorSpan.textContent.trim().length > 0) {
          // Ada error → tampilkan container
          errorCon.classList.add('has-error');
        } else {
          // Tidak ada error → sembunyikan container
          errorCon.classList.remove('has-error');
        }
      }

      // Ganti / terjemahkan pesan error agar lebih ramah (klien)
      function customizeErrorText() {
        const errorSpan = document.querySelector('.error');
        if (!errorSpan) return;
        const raw = errorSpan.textContent.trim();
        if (!raw) return;

        const key = raw.toLowerCase();

        // Daftar kemungkinan mapping: gunakan kombinasi exact, includes, regex
        const mappings = [
          {type: 'exact', pattern: 'invalid username or password', replace: 'Username atau password salah. Silakan coba lagi sahabat.'},
          {type: 'includes', pattern: 'invalid username', replace: 'Username sahabat tidak valid.'},
          {type: 'includes', pattern: 'invalid password', replace: 'Password sahabat tidak valid.'},
          {type: 'includes', pattern: 'invalid user', replace: 'Username sahabat tidak ditemukan.'},
          {type: 'includes', pattern: 'user disabled', replace: 'Akun sahabat dinonaktifkan. Hubungi administrator.'},
          {type: 'includes', pattern: 'user suspended', replace: 'Akun sahabat ditangguhkan.'},
          {type: 'includes', pattern: 'account expired', replace: 'Masa aktif akun sahabat telah habis.'},
          {type: 'includes', pattern: 'session expired', replace: 'Sesi sahabat telah berakhir. Silakan login lagi.'},
          {type: 'includes', pattern: 'session limit', replace: 'Kapasitas sesi telah tercapai.'},
          {type: 'includes', pattern: 'too many sessions', replace: 'Terlalu banyak sesi aktif untuk akun ini.'},
          {type: 'includes', pattern: 'no free sessions', replace: 'Tidak ada sesi gratis tersedia saat ini.'},
          {type: 'includes', pattern: 'user already logged in', replace: 'Sahabat sudah login di perangkat lain.'},
          {type: 'includes', pattern: 'mac', replace: 'Autentikasi perangkat gagal (MAC).'},
          {type: 'includes', pattern: 'ip', replace: 'Alamat IP tidak diizinkan.'},
          {type: 'includes', pattern: 'access denied', replace: 'Sahabat ditolak.'},
          {type: 'includes', pattern: 'unable to authenticate', replace: 'Gagal mengautentikasi. Periksa kredensial.'},
          {type: 'includes', pattern: 'voucher', replace: 'Voucher tidak valid atau sudah digunakan.'},
          {type: 'includes', pattern: 'radius', replace: 'Terjadi kesalahan autentikasi (RADIUS). Coba lagi nanti.'},
          {type: 'includes', pattern: 'server error', replace: 'Terjadi kesalahan server. Coba lagi nanti.'},
          {type: 'includes', pattern: 'internal server error', replace: 'Terjadi kesalahan internal. Hubungi admin.'},
          {type: 'includes', pattern: 'please accept', replace: 'Silakan setujui syarat dan ketentuan untuk melanjutkan.'},
          {type: 'includes', pattern: 'login failed', replace: 'Login gagal. Periksa kembali username/password.'},
          {type: 'regex', pattern: /expired/i, replace: 'Sudah kadaluarsa.'},
        ]; 

        for (const m of mappings) {
          if (m.type === 'exact' && key === m.pattern) {
            errorSpan.textContent = m.replace; return;
          }
          if (m.type === 'includes' && key.includes(m.pattern)) { 
            errorSpan.textContent = m.replace; return;
          }
          if (m.type === 'regex' && m.pattern.test(raw)) {
            errorSpan.textContent = m.replace; return;
          }
        }  

        // Fallback: tambahkan prefix agar jelas
        errorSpan.textContent = 'Error: ' + raw;
      }

      // Jalankan saat page load
      document.addEventListener('DOMContentLoaded', () => {
        handleErrorDisplay();
        customizeErrorText(); 
      });
       
      // Jalankan juga saat form di-submit (jika ada error dari server)
      document.querySelector('.vertical-form').addEventListener('submit', () => {
        setTimeout(() => { handleErrorDisplay(); customizeErrorText(); }, 120);
      });  
