(() => {
  'use strict';

  /* ---------- Konfigurasi ---------- */
  const NAME = 'Muhamad Nova Efendi';
  const SECRET_DATE = '09102026';                       // 09 - 10 - 2026
  const BIRTH = { year: 2007, month: 11, day: 15 };    // 15 November 2007 (Kamis)

  /* ---------- Elemen & state ---------- */
  const $ = (selector, root = document) => root.querySelector(selector);
  const scenes = [...document.querySelectorAll('.scene')];
  const counter = $('#counter');
  const progressFill = $('#progressFill');
  const progressLabel = $('#progressLabel');
  const dateDisplay = $('#dateDisplay');
  const feedback = $('#feedback');
  const keypad = $('#keypad');
  const music = $('#music');
  const musicToggle = $('#musicToggle');
  const loveLayer = $('#loveLayer');
  const burstLayer = $('#burstLayer');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (min, max) => min + Math.random() * (max - min);
  const palette = ['#c94f82', '#e879a5', '#f4a6c1', '#ffb3cf', '#e879a5', '#f4a6c1'];
  let current = 0;
  let unlocked = false;
  let heartTimer = 0;

  /* ---------- Memuat script cadangan (foto & musik versi base64) ---------- */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  /* ---------- FOTO: coba beberapa lokasi, lalu cadangan ---------- */
  const photo = $('#heroPhoto');
  const photoFrame = photo ? photo.closest('.photo-frame') : null;
  const photoPaths = ['nova-photo.jpg', 'assets/nova-photo.jpg', '../assets/nova-photo.jpg'];
  let photoStage = 1; // index 0 sudah dipakai di atribut src HTML
  let photoFallbackTried = false;

  function photoFailed() {
    if (photoStage < photoPaths.length) { photo.src = photoPaths[photoStage++]; return; }
    if (!photoFallbackTried) {
      photoFallbackTried = true;
      loadScript('photo-fallback.js')
        .then(() => { if (window.__PHOTO_B64) photo.src = window.__PHOTO_B64; else photoFrame.classList.add('missing'); })
        .catch(() => photoFrame.classList.add('missing'));
      return;
    }
    photoFrame.classList.add('missing');
  }
  if (photo) {
    photo.addEventListener('error', photoFailed);
    if (photo.complete && photo.naturalWidth === 0) photoFailed();
  }

  /* ---------- MUSIK: coba beberapa lokasi, lalu cadangan ---------- */
  const musicPaths = ['birthday-music.mp3', 'assets/birthday-music.mp3', '../assets/birthday-music.mp3'];
  let musicStage = 1; // index 0 sudah dipakai di atribut src HTML
  let musicFallbackTried = false;
  let musicWanted = false;
  music.volume = 0.8;

  function musicFailed() {
    if (musicStage < musicPaths.length) { music.src = musicPaths[musicStage++]; music.load(); return; }
    if (musicFallbackTried) return;
    musicFallbackTried = true;
    loadScript('music-fallback.js')
      .then(() => { if (window.__MUSIC_B64) { music.src = window.__MUSIC_B64; music.load(); } })
      .catch(() => {});
  }
  function syncMusicButton() {
    const playing = !music.paused;
    musicToggle.textContent = playing ? '♫' : '♪';
    musicToggle.classList.toggle('on', playing);
    musicToggle.setAttribute('aria-label', playing ? 'Matikan musik' : 'Aktifkan musik');
  }
  async function playMusic() {
    musicWanted = true;
    try { await music.play(); } catch { /* menunggu interaksi atau file belum siap; dicoba lagi saat canplay */ }
    syncMusicButton();
  }
  music.addEventListener('error', musicFailed);
  music.addEventListener('canplay', () => { if (musicWanted && music.paused) music.play().catch(() => {}); });
  music.addEventListener('play', syncMusicButton);
  music.addEventListener('pause', syncMusicButton);
  musicToggle.addEventListener('click', () => {
    if (music.paused) playMusic(); else { musicWanted = false; music.pause(); }
  });

  /* ---------- EFEK HATI: layer melayang per halaman ---------- */
  const heartConfigs = [
    { n: 26, min: 12, max: 38, dur: [9, 18],  o: [.22, .62], mode: 'rise' }, // 1 opening
    { n: 10, min: 10, max: 22, dur: [12, 20], o: [.14, .32], mode: 'rise' }, // 2 kunci
    { n: 16, min: 12, max: 30, dur: [10, 18], o: [.20, .50], mode: 'rise' }, // 3 foto
    { n: 24, min: 12, max: 34, dur: [9, 17],  o: [.20, .55], mode: 'rise' }, // 4 kolase cinta
    { n: 14, min: 10, max: 24, dur: [12, 20], o: [.16, .40], mode: 'fall' }, // 5 ucapan
    { n: 12, min: 10, max: 26, dur: [10, 18], o: [.18, .45], mode: 'rise' }, // 6 jarak
    { n: 12, min: 10, max: 24, dur: [12, 20], o: [.16, .38], mode: 'fall' }, // 7 alasan
    { n: 18, min: 12, max: 30, dur: [9, 16],  o: [.20, .50], mode: 'rise' }, // 8 kalender
    { n: 34, min: 14, max: 40, dur: [8, 15],  o: [.25, .60], mode: 'rise' }  // 9 penutup
  ];
  function buildHearts(index) {
    const cfg = heartConfigs[index];
    const factor = (window.innerWidth < 760 ? .6 : 1) * (reduceMotion ? .3 : 1);
    loveLayer.className = `love-layer ${cfg.mode}`;
    loveLayer.textContent = '';
    for (let i = 0; i < Math.round(cfg.n * factor); i++) {
      const heart = document.createElement('i');
      heart.style.cssText = [
        `--x:${rand(0, 96).toFixed(1)}%`,
        `--s:${rand(cfg.min, cfg.max).toFixed(0)}px`,
        `--c:${palette[i % palette.length]}`,
        `--o:${rand(cfg.o[0], cfg.o[1]).toFixed(2)}`,
        `--d:${rand(cfg.dur[0], cfg.dur[1]).toFixed(1)}s`,
        `--delay:${(-rand(0, cfg.dur[1])).toFixed(1)}s`,
        `--drift:${rand(-45, 45).toFixed(0)}px`
      ].join(';');
      loveLayer.appendChild(heart);
    }
  }
  function swapHearts(index, instant) {
    window.clearTimeout(heartTimer);
    if (instant) { buildHearts(index); loveLayer.style.opacity = '1'; return; }
    loveLayer.style.opacity = '0';
    heartTimer = window.setTimeout(() => { buildHearts(index); loveLayer.style.opacity = '1'; }, 330);
  }

  /* ---------- EFEK HATI: ledakan saat momen penting ---------- */
  function burstAt(x, y, amount = 16, spread = 170) {
    const total = reduceMotion ? Math.min(amount, 5) : amount;
    for (let i = 0; i < total; i++) {
      const angle = rand(0, Math.PI * 2), dist = rand(50, spread);
      const pop = document.createElement('i');
      pop.className = 'pop';
      pop.style.cssText = [
        `--x:${x}px`, `--y:${y}px`, `--s:${rand(14, 30).toFixed(0)}px`,
        `--c:${palette[Math.floor(rand(0, palette.length))]}`,
        `--dx:${(Math.cos(angle) * dist).toFixed(0)}px`,
        `--dy:${(Math.sin(angle) * dist - rand(20, 80)).toFixed(0)}px`,
        `--r:${rand(-40, 40).toFixed(0)}deg`, `--d:${rand(1.1, 1.9).toFixed(2)}s`
      ].join(';');
      pop.addEventListener('animationend', () => pop.remove());
      burstLayer.appendChild(pop);
    }
  }
  function burstFrom(el, amount, spread) {
    const r = el.getBoundingClientRect();
    burstAt(r.left + r.width / 2, r.top + r.height / 2, amount, spread);
  }

  /* ---------- PESAWAT & HATI DI PETA (Gorontalo → Bandung) ---------- */
  const map = $('.map');
  const route = $('.route');
  const plane = $('#plane');
  const trail = [];
  let trailFrame = 0;
  if (map && route && !reduceMotion) {
    for (let i = 0; i < 6; i++) {
      const heart = document.createElement('i');
      heart.className = 'heart trail-heart';
      map.appendChild(heart); trail.push(heart);
    }
  }
  function routePoint(progress) {
    const length = route.getTotalLength();
    const sx = map.clientWidth / 700, sy = map.clientHeight / 230;
    const p = route.getPointAtLength(Math.min(Math.max(progress, 0), 1) * length);
    return { x: p.x * sx, y: p.y * sy };
  }
  function placePlane(progress, opacity = 1) {
    const a = routePoint(progress - .006), b = routePoint(progress + .006), p = routePoint(progress);
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    plane.style.opacity = opacity.toFixed(2);
    plane.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-50%) rotate(${angle}rad)`;
  }
  function trailTick(time) {
    const progress = (time / 9000) % 1;
    const planeOpacity = Math.min(1, progress * 10, (1 - progress) * 10);
    placePlane(progress, planeOpacity);
    trail.forEach((el, k) => {
      const pr = progress - (k + 1) * .045;
      if (pr < 0) { el.style.opacity = 0; return; }
      const p = routePoint(pr), strength = 1 - k / trail.length;
      el.style.opacity = (strength * .9 * planeOpacity).toFixed(2);
      el.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-50%) scale(${(.55 + strength * .7).toFixed(2)})`;
    });
    trailFrame = requestAnimationFrame(trailTick);
  }
  function setTrail(active) {
    cancelAnimationFrame(trailFrame);
    if (!active || !plane) return;
    if (reduceMotion) placePlane(.5); else trailFrame = requestAnimationFrame(trailTick);
  }
  window.addEventListener('resize', () => { if (reduceMotion && current === 5) placePlane(.5); });

  /* ---------- Navigasi scene ---------- */
  function showScene(index) {
    if (index < 0 || index >= scenes.length || (index > 1 && !unlocked)) return;
    if (lightbox && !lightbox.hidden) closePhoto(false);
    const first = scenes[index].classList.contains('active') && index === current && !loveLayer.childElementCount;
    scenes.forEach((scene, i) => {
      scene.classList.toggle('active', i === index);
      scene.setAttribute('aria-hidden', String(i !== index));
      if (i === index) scene.scrollTop = 0;
    });
    current = index;
    const number = String(index + 1).padStart(2, '0');
    const total = String(scenes.length).padStart(2, '0');
    counter.textContent = `${number} / ${total}`;
    progressLabel.textContent = `${number} — ${total}`;
    progressFill.style.width = `${((index + 1) / scenes.length) * 100}%`;
    swapHearts(index, first);
    setTrail(index === 5);
    if (index === scenes.length - 1) {
      window.setTimeout(() => { if (current === index) burstAt(window.innerWidth / 2, window.innerHeight * .45, 26, 240); }, 650);
      window.setTimeout(() => { if (current === index) burstAt(window.innerWidth * .25, window.innerHeight * .6, 14, 160); burstAt(window.innerWidth * .75, window.innerHeight * .6, 14, 160); }, 1900);
    }
  }
  document.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => showScene(current + 1)));
  $('#home').addEventListener('click', event => { event.preventDefault(); showScene(0); });

  // Tombol "Mulai kejutan": nyalakan musik (butuh klik pengunjung) + ledakan hati
  const startButton = $('.opening [data-next]');
  if (startButton) startButton.addEventListener('click', () => { playMusic(); burstFrom(startButton, 18, 200); });

  /* ---------- Permainan tanggal rahasia (8 angka: DDMMYYYY) ---------- */
  let entry = '', gameLocked = false, gameTimer = 0;
  const HINT = 'Masukkan delapan angka tanggalnya.';
  function renderDate() {
    let html = '';
    for (let i = 0; i < 8; i++) {
      const filled = i < entry.length;
      html += `<span class="slot${filled ? ' filled' : ''}${filled && i === entry.length - 1 ? ' fresh' : ''}${i === entry.length ? ' cur' : ''}">${filled ? entry[i] : ''}</span>`;
      if (i === 1 || i === 3) html += '<i class="sep" aria-hidden="true">–</i>';
    }
    dateDisplay.innerHTML = html;
    dateDisplay.setAttribute('aria-label', entry ? `Angka dimasukkan: ${entry.split('').join(' ')}` : 'Belum ada angka dimasukkan');
  }
  function setFeedback(text, kind = '') { feedback.textContent = text; feedback.className = `feedback ${kind}`.trim(); }
  function resetGame() {
    window.clearTimeout(gameTimer);
    unlocked = false; gameLocked = false; entry = '';
    renderDate(); setFeedback(HINT);
    keypad.querySelectorAll('button').forEach(button => { button.disabled = false; });
    $('.lock').classList.remove('shake');
  }
  function pressDigit(digit) {
    if (gameLocked || entry.length >= 8) return;
    entry += digit; renderDate();
    if (entry.length === 8) checkDate();
  }
  function eraseDigit() {
    if (gameLocked) return;
    entry = entry.slice(0, -1); renderDate(); setFeedback(HINT);
  }
  function checkDate() {
    gameLocked = true;
    if (entry === SECRET_DATE) {
      unlocked = true;
      setFeedback('Kunci terbuka! Kejutan untukmu dimulai ♡', 'success');
      keypad.querySelectorAll('button').forEach(button => { button.disabled = true; });
      burstFrom($('.lock-icon'), 36, 240);
      window.setTimeout(() => burstFrom($('.lock-icon'), 22, 320), 350);
      gameTimer = window.setTimeout(() => showScene(2), 1700);
    } else {
      setFeedback('Yahh, tanggalnya masih salah! Coba lagi yaa ♡', 'error');
      const card = $('.lock');
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      gameTimer = window.setTimeout(() => { entry = ''; renderDate(); gameLocked = false; setFeedback(HINT); }, 1200);
    }
  }
  keypad.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    if (button.dataset.digit) pressDigit(button.dataset.digit);
    else if (button.dataset.act === 'erase') eraseDigit();
  });
  document.addEventListener('keydown', event => {
    if (current !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
    if (/^[0-9]$/.test(event.key)) pressDigit(event.key);
    else if (event.key === 'Backspace') eraseDigit();
  });
  $('#resetGame').addEventListener('click', resetGame);

  /* ---------- Kalender dinamis (dibuat dari BIRTH) ---------- */
  const calendar = $('#calendarDays');
  const calendarMessage = $('#calendarMessage');
  const defaultMessage = calendarMessage.innerHTML;
  const monthRaw = new Date(BIRTH.year, BIRTH.month - 1, 1).toLocaleDateString('id-ID', { month: 'long' });
  const monthName = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1);
  const birthText = `${BIRTH.day} ${monthName} ${BIRTH.year}`;
  $('#calendarTitle').innerHTML = `${monthName} <em>${BIRTH.year}</em>`;
  const offset = new Date(BIRTH.year, BIRTH.month - 1, 1).getDay();
  const daysInMonth = new Date(BIRTH.year, BIRTH.month, 0).getDate();
  for (let i = 0; i < offset; i++) {
    const blank = document.createElement('span'); blank.setAttribute('aria-hidden', 'true'); calendar.appendChild(blank);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const isBirthday = day === BIRTH.day;
    const cell = document.createElement(isBirthday ? 'button' : 'span');
    cell.textContent = day;
    cell.style.animationDelay = `${(offset + day) * 22}ms`;
    if (isBirthday) {
      cell.type = 'button'; cell.className = 'special';
      cell.setAttribute('aria-label', `${birthText}, tanggal kelahiran ${NAME}`);
      cell.addEventListener('click', () => {
        calendarMessage.innerHTML = `<small>THE DAY YOU WERE BORN</small><p>${birthText} — hari ketika seseorang yang istimewa hadir di dunia. ♡</p>`;
        calendarMessage.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 500 });
        burstFrom(cell, 28, 220);
      });
    }
    calendar.appendChild(cell);
  }
  function resetCalendar() { calendarMessage.innerHTML = defaultMessage; }
  $('#restart').addEventListener('click', () => { resetGame(); resetCalendar(); resetCollage(); bubble.classList.remove('show'); showScene(0); });

  /* ---------- Kolase cinta (scene 4) ---------- */
  const lightbox = $('#lightbox');
  const lbImg = $('#lbImg'), lbCap = $('#lbCap'), lbCount = $('#lbCount'), lbClose = $('#lbClose');
  const pics = [...document.querySelectorAll('.collage .pic')];
  const loveBtn = $('#loveBtn'), loveCountEl = $('#loveCount');
  let lbIndex = 0, lbReturn = null, loveCount = 0, collageFallback = null;
  const COLLAGE_DIRS = ['', 'assets/collage/', 'collage/', '../assets/collage/'];

  // foto kolase: coba beberapa lokasi, lalu cadangan; jika tetap gagal tampilkan hati
  function guardCollageImage(img) {
    const file = img.dataset.file, pic = img.closest('.pic');
    let stage = 1; // index 0 sudah dipakai di atribut src HTML
    const fail = () => {
      if (stage < COLLAGE_DIRS.length) { img.src = COLLAGE_DIRS[stage++] + file; return; }
      if (!collageFallback) collageFallback = loadScript('collage-fallback.js');
      collageFallback.then(() => {
        const data = window.__COLLAGE_B64 && window.__COLLAGE_B64[file];
        if (data && img.src !== data) img.src = data; else pic.classList.add('missing');
      }).catch(() => pic.classList.add('missing'));
    };
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0) fail();
  }
  pics.forEach(pic => guardCollageImage(pic.querySelector('img')));

  function showPhoto(index) {
    lbIndex = (index + pics.length) % pics.length;
    const pic = pics[lbIndex], img = pic.querySelector('img');
    lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt;
    lbCap.textContent = pic.dataset.caption;
    lbCount.textContent = `${lbIndex + 1} / ${pics.length}`;
  }
  function openPhoto(index, trigger) {
    lbReturn = trigger; showPhoto(index);
    lightbox.hidden = false;
    window.requestAnimationFrame(() => lightbox.classList.add('show'));
    lbClose.focus();
  }
  function closePhoto(restoreFocus = true) {
    lightbox.classList.remove('show');
    window.setTimeout(() => { if (!lightbox.classList.contains('show')) lightbox.hidden = true; }, 300);
    if (restoreFocus && lbReturn) lbReturn.focus();
  }
  pics.forEach((pic, i) => pic.addEventListener('click', () => { burstFrom(pic, 14, 150); openPhoto(i, pic); }));
  $('#lbPrev').addEventListener('click', () => { showPhoto(lbIndex - 1); burstFrom($('.lb-frame'), 6, 120); });
  $('#lbNext').addEventListener('click', () => { showPhoto(lbIndex + 1); burstFrom($('.lb-frame'), 6, 120); });
  lbClose.addEventListener('click', () => closePhoto());
  lightbox.addEventListener('click', event => { if (event.target === lightbox) closePhoto(); });
  document.addEventListener('keydown', event => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') closePhoto();
    else if (event.key === 'ArrowLeft') showPhoto(lbIndex - 1);
    else if (event.key === 'ArrowRight') showPhoto(lbIndex + 1);
    else if (event.key === 'Tab') {                       // fokus tetap di dalam pratinjau
      const items = [lbClose, $('#lbPrev'), $('#lbNext')], at = items.indexOf(document.activeElement);
      event.preventDefault();
      items[(at + (event.shiftKey ? items.length - 1 : 1)) % items.length].focus();
    }
  });
  loveBtn.addEventListener('click', () => {
    loveCount++; loveCountEl.textContent = loveCount;
    burstFrom(loveBtn, Math.min(8 + loveCount, 20), 160);
  });
  function resetCollage() {
    loveCount = 0; loveCountEl.textContent = '0';
    if (!lightbox.hidden) closePhoto(false);
  }

  /* ---------- Kucing di halaman pertama ---------- */
  const cat = $('#cat');
  const bubble = $('#catBubble');
  const catLines = [
    'meow~ selamat ulang tahun, Nova! 🤍',
    'mrrp~ ada kejutan buat Muhamad Nova Efendi',
    'purrr... klik "Mulai Kejutan", yaa',
    'nyaa~ aku juga sayang Nova',
    'meow! semoga semua doamu terkabul 💗'
  ];
  let catIndex = 0, bubbleTimer = 0;
  function say(text, ms = 3800) {
    bubble.textContent = text;
    bubble.classList.add('show');
    window.clearTimeout(bubbleTimer);
    bubbleTimer = window.setTimeout(() => bubble.classList.remove('show'), ms);
  }
  cat.addEventListener('click', () => {
    say(catLines[catIndex++ % catLines.length]);
    const r = cat.getBoundingClientRect();
    burstAt(r.left + r.width / 2, r.top + r.height * .25, 12, 130);
  });
  window.setTimeout(() => { if (current === 0) say(catLines[0], 4800); }, 1500);

  /* ---------- Mulai ---------- */
  syncMusicButton();
  resetGame();
  showScene(0);
})();
