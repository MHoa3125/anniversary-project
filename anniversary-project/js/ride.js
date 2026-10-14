/* ===== Trò chơi: Chuyến xe của miwa & tuni =====
   Chạm màn hình (hoặc Space / ↑) để nhảy qua chướng ngại, nhặt đủ GOAL trái tim.
   Chạy độc lập: nếu trang không có #rideWrap thì không làm gì.
   Muốn đổi nội dung -> sửa GOAL, WIN_MESSAGE bên dưới. */
(function(){
  const wrap = document.getElementById('rideWrap');
  if(!wrap) return;

  const GOAL        = 10;
  const WIN_MESSAGE = 'Chuyến xe của miwa và tuni vẫn còn đi tiếp thật xa nữa nhé 💞';

  const canvas  = document.getElementById('rideCanvas');
  const ctx     = canvas.getContext('2d');
  const overlay = document.getElementById('rideOverlay');
  const titleEl = document.getElementById('rideTitle');
  const textEl  = document.getElementById('rideText');
  const btn     = document.getElementById('rideBtn');

  // Toạ độ game cố định 360×240 (không phụ thuộc kích thước màn hình), vẽ ra canvas bằng scale
  const W = 360, H = 240, G = 186;          // G = mặt đường
  const GRAV = 1900, JUMP = 600;            // nhảy cao ~95px, bay ~0.63s
  const INK = '#3d3a4a';

  let sx = 1, sy = 1, dpr = 1;
  let state = 'idle';                       // idle | playing | paused | over | won
  let raf = 0, lastT = 0, inView = true;
  let px, py, vy, speed, dist, bgOff, wheel, time;
  let obstacles, hearts, fx, collected, sinceSpawn, gapTarget, jumpBuf;

  const clouds = [
    { x: 30,  y: 32, s: 1.0 },
    { x: 160, y: 62, s: 0.75 },
    { x: 270, y: 26, s: 1.15 }
  ];

  /* ---------- tiện ích vẽ ---------- */
  function rr(c, x, y, w, h, r){
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y,     x + w, y + h, r);
    c.arcTo(x + w, y + h, x,     y + h, r);
    c.arcTo(x,     y + h, x,     y,     r);
    c.arcTo(x,     y,     x + w, y,     r);
    c.closePath();
  }
  function heartPath(c, x, y, s){
    c.beginPath();
    c.moveTo(x, y + s * .35);
    c.bezierCurveTo(x + s * .9, y - s * .2, x + s * .5, y - s * .95, x, y - s * .4);
    c.bezierCurveTo(x - s * .5, y - s * .95, x - s * .9, y - s * .2, x, y + s * .35);
    c.closePath();
  }

  /* ---------- kích thước canvas ---------- */
  function fit(){
    const cw = wrap.clientWidth, ch = wrap.clientHeight;
    if(!cw || !ch) return;
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width  = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    sx = canvas.width / W;
    sy = canvas.height / H;
  }

  /* ---------- trạng thái game ---------- */
  function reset(){
    px = 60; py = G; vy = 0;
    speed = 165; dist = 0; bgOff = 0; wheel = 0; time = 0;
    obstacles = []; hearts = []; fx = [];
    collected = 0; sinceSpawn = 0; gapTarget = 0; jumpBuf = 0;
  }

  function show(title, text, label){
    titleEl.textContent = title;
    textEl.textContent  = text;
    btn.textContent     = label;
    overlay.hidden = false;
  }
  function setState(s){
    state = s;
    canvas.classList.toggle('playing', s === 'playing');
  }

  function start(){
    cancelAnimationFrame(raf);
    reset();
    setState('playing');
    overlay.hidden = true;
    lastT = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function resume(){
    setState('playing');
    overlay.hidden = true;
    lastT = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function pause(){
    if(state !== 'playing') return;
    cancelAnimationFrame(raf);
    setState('paused');
    show('Tạm dừng ⏸', 'Đang chơi dở nè, tiếp tục nhé!', 'Tiếp tục');
  }
  function finish(kind){
    cancelAnimationFrame(raf);
    setState(kind);
    draw();
    if(kind === 'won'){
      show('Đã đến nơi! 💞', WIN_MESSAGE, 'Đi thêm chuyến nữa');
      try{ if(typeof confettiBurst === 'function') confettiBurst(); }catch(_){}
    } else {
      show('Ối, va rồi! 💥', `Mới nhặt được ${collected}/${GOAL} 💗 — thử lại nhé!`, 'Thử lại');
    }
  }

  /* ---------- chướng ngại + trái tim ---------- */
  const TYPES = [
    { t:'cone',    w:18, h:28 },
    { t:'crate',   w:26, h:24 },
    { t:'barrier', w:40, h:18 }
  ];
  function spawn(){
    const o = Object.assign({}, TYPES[Math.floor(Math.random() * TYPES.length)]);
    o.x = W + 20;
    obstacles.push(o);
    // trái tim lơ lửng phía trên chướng ngại -> nhảy qua là nhặt được
    hearts.push({ x: o.x + o.w / 2, y: G - o.h - 46, ph: Math.random() * 6 });
    // khoảng cách tới chướng ngại kế tiếp: luôn đủ rộng để nhảy kịp
    gapTarget = speed * (0.95 + Math.random() * 0.75) + o.w + 30;
    sinceSpawn = 0;
    // thỉnh thoảng có thêm 1 trái tim nằm sát đường giữa 2 chướng ngại
    if(Math.random() < 0.45) hearts.push({ x: o.x + gapTarget * 0.55, y: G - 26, ph: Math.random() * 6 });
  }

  /* ---------- cập nhật ---------- */
  function update(dt){
    time += dt;
    speed = Math.min(290, 165 + dist * 0.035);
    const step = speed * dt;
    dist += step; bgOff += step; wheel += step / 8;

    // nhảy (có "bộ đệm" 0.12s: bấm hơi sớm trước khi chạm đất vẫn tính)
    if(jumpBuf > 0) jumpBuf -= dt;
    if(jumpBuf > 0 && py >= G - 0.01){ vy = -JUMP; jumpBuf = 0; }
    vy += GRAV * dt;
    py += vy * dt;
    if(py >= G){ py = G; vy = 0; }

    // sinh chướng ngại
    sinceSpawn += step;
    if(sinceSpawn >= gapTarget) spawn();

    obstacles.forEach(o => { o.x -= step; });
    hearts.forEach(h => { h.x -= step; });
    obstacles = obstacles.filter(o => o.x + o.w > -10);

    // hộp va chạm của xe (hơi nhỏ hơn hình vẽ cho dễ chơi)
    const hb = { x: px + 8, y: py - 34, w: 32, h: 34 };

    for(const o of obstacles){
      const ox = o.x + 3, oy = G - o.h + 3, ow = o.w - 6, oh = o.h - 3;
      if(hb.x < ox + ow && hb.x + hb.w > ox && hb.y < oy + oh && hb.y + hb.h > oy){
        finish('over');
        return;
      }
    }

    // nhặt tim
    hearts = hearts.filter(h => {
      if(h.x < -15) return false;
      const cx = Math.max(hb.x, Math.min(h.x, hb.x + hb.w));
      const cy = Math.max(hb.y, Math.min(h.y, hb.y + hb.h));
      if(Math.hypot(h.x - cx, h.y - cy) <= 11){
        collected++;
        fx.push({ x: h.x, y: h.y, t: 0 });
        return false;
      }
      return true;
    });
    fx.forEach(f => { f.t += dt; });
    fx = fx.filter(f => f.t < 0.6);

    if(collected >= GOAL) finish('won');
  }

  /* ---------- vẽ ---------- */
  function hill(c, color, amp, base, factor, wl){
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(0, G);
    for(let x = 0; x <= W; x += 6){
      const o = x + bgOff * factor;
      c.lineTo(x, base - amp * (0.6 * Math.sin(o / wl) + 0.4 * Math.sin(o / (wl * 0.43) + 1)));
    }
    c.lineTo(W, G);
    c.closePath();
    c.fill();
  }

  function drawCloud(c, x, y, s){
    c.fillStyle = '#fff';
    c.beginPath();
    c.arc(x, y, 10 * s, 0, 6.283);
    c.arc(x + 13 * s, y - 7 * s, 13 * s, 0, 6.283);
    c.arc(x + 28 * s, y, 10 * s, 0, 6.283);
    c.fill();
    c.fillRect(x, y - 2 * s, 28 * s, 12 * s);
  }

  function drawObstacle(c, o){
    const x = o.x, y = G;
    c.lineWidth = 2; c.strokeStyle = INK; c.lineJoin = 'round';
    if(o.t === 'cone'){
      c.fillStyle = '#ff9b54';
      c.beginPath(); c.moveTo(x + 2, y - 4); c.lineTo(x + o.w - 2, y - 4); c.lineTo(x + o.w / 2, y - o.h); c.closePath();
      c.fill(); c.stroke();
      c.fillStyle = '#fff';
      c.beginPath();
      c.moveTo(x + 5.5, y - 12); c.lineTo(x + o.w - 5.5, y - 12);
      c.lineTo(x + o.w - 8, y - 18); c.lineTo(x + 8, y - 18);
      c.closePath(); c.fill();
      c.fillStyle = INK; c.fillRect(x - 1, y - 4, o.w + 2, 4);
    } else if(o.t === 'crate'){
      c.fillStyle = '#d9a65c';
      c.fillRect(x, y - o.h, o.w, o.h); c.strokeRect(x, y - o.h, o.w, o.h);
      c.beginPath();
      c.moveTo(x, y - o.h); c.lineTo(x + o.w, y); c.moveTo(x + o.w, y - o.h); c.lineTo(x, y);
      c.stroke();
    } else {
      c.fillStyle = INK;
      c.fillRect(x + 4, y - o.h, 3, o.h); c.fillRect(x + o.w - 7, y - o.h, 3, o.h);
      c.fillStyle = '#fff';
      c.fillRect(x, y - o.h, o.w, 10); c.strokeRect(x, y - o.h, o.w, 10);
      c.fillStyle = '#e0483f';
      for(let i = 0; i < o.w; i += 12) c.fillRect(x + 2 + i, y - o.h + 1, 6, 8);
    }
  }

  function drawPlayer(c){
    const bob = (py >= G && state === 'playing') ? Math.sin(time * 22) * 0.8 : 0;
    const tilt = Math.max(-0.14, Math.min(0.14, vy / 3500));   // ngửa lên khi bay lên, chúi xuống khi rơi
    c.save();
    c.translate(px + 24, py + bob);
    c.rotate(tilt);
    c.translate(-24, 0);
    c.lineWidth = 2; c.strokeStyle = INK; c.lineJoin = 'round'; c.lineCap = 'round';

    // bánh xe
    [[9, -8], [39, -8]].forEach(([wx, wy]) => {
      c.fillStyle = '#fff';
      c.beginPath(); c.arc(wx, wy, 8, 0, 6.283); c.fill(); c.stroke();
      c.beginPath();
      c.moveTo(wx, wy); c.lineTo(wx + Math.cos(wheel) * 6, wy + Math.sin(wheel) * 6);
      c.moveTo(wx, wy); c.lineTo(wx + Math.cos(wheel + 2.1) * 6, wy + Math.sin(wheel + 2.1) * 6);
      c.moveTo(wx, wy); c.lineTo(wx + Math.cos(wheel + 4.2) * 6, wy + Math.sin(wheel + 4.2) * 6);
      c.stroke();
    });

    // thân xe + yên + cổ lái
    c.fillStyle = '#ff8fa3'; rr(c, 4, -22, 34, 10, 5); c.fill(); c.stroke();
    c.fillStyle = INK;       rr(c, 6, -27, 24, 6, 3);  c.fill();
    c.lineWidth = 4; c.beginPath(); c.moveTo(36, -16); c.lineTo(38, -34); c.stroke();
    c.lineWidth = 3; c.beginPath(); c.moveTo(33, -36); c.lineTo(43, -36); c.stroke();
    c.lineWidth = 2;

    // miwa (ngồi sau)
    c.fillStyle = '#c9e4ff'; rr(c, 8, -40, 10, 14, 4); c.fill(); c.stroke();
    c.fillStyle = '#ffe3d0'; c.beginPath(); c.arc(13, -47, 6.5, 0, 6.283); c.fill(); c.stroke();
    c.fillStyle = '#8a5a44'; c.beginPath(); c.arc(13, -47, 6.5, Math.PI, 0); c.fill(); c.stroke();
    // tuni (ngồi trước)
    c.fillStyle = '#ffe08a'; rr(c, 24, -40, 10, 14, 4); c.fill(); c.stroke();
    c.fillStyle = '#ffe3d0'; c.beginPath(); c.arc(30, -47.5, 6.5, 0, 6.283); c.fill(); c.stroke();
    c.fillStyle = INK;       c.beginPath(); c.arc(30, -47.5, 6.5, Math.PI, 0); c.fill(); c.stroke();
    // tay: miwa ôm tuni, tuni cầm lái
    c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(16, -37); c.lineTo(27, -36); c.stroke();
    c.beginPath(); c.moveTo(32, -37); c.lineTo(40, -36); c.stroke();
    c.restore();
  }

  function draw(){
    const c = ctx;
    c.setTransform(sx, 0, 0, sy, 0, 0);

    // trời
    const sky = c.createLinearGradient(0, 0, 0, G);
    sky.addColorStop(0, '#9fd3f2'); sky.addColorStop(1, '#e4f5ff');
    c.fillStyle = sky; c.fillRect(0, 0, W, H);

    // mây + đồi trôi chậm (parallax)
    clouds.forEach(cl => {
      const span = W + 90;
      const x = ((cl.x - bgOff * 0.12) % span + span) % span - 45;
      drawCloud(c, x, cl.y, cl.s);
    });
    hill(c, '#b9e0f0', 16, G - 36, 0.25, 55);
    hill(c, '#a5dcc0', 12, G - 14, 0.5, 38);

    // đường
    c.fillStyle = '#6a6779'; c.fillRect(0, G, W, H - G);
    c.fillStyle = INK;       c.fillRect(0, G - 1, W, 4);
    c.strokeStyle = '#fff'; c.lineWidth = 3;
    c.setLineDash([22, 18]); c.lineDashOffset = bgOff % 40;
    c.beginPath(); c.moveTo(0, G + 30); c.lineTo(W, G + 30); c.stroke();
    c.setLineDash([]);

    // vật thể
    obstacles.forEach(o => drawObstacle(c, o));
    hearts.forEach(h => {
      const y = h.y + Math.sin(time * 5 + h.ph) * 3;
      heartPath(c, h.x, y, 10);
      c.fillStyle = '#ff6f8e'; c.fill();
      c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
    });
    drawPlayer(c);
    fx.forEach(f => {
      const k = f.t / 0.6;
      c.globalAlpha = 1 - k;
      heartPath(c, f.x, f.y - k * 26, 10 + k * 6);
      c.fillStyle = '#ffc9d6'; c.fill();
      c.globalAlpha = 1;
    });

    // HUD: số tim + thanh tiến độ chuyến đi
    c.fillStyle = 'rgba(255,250,242,.9)';
    rr(c, 8, 8, 118, 26, 13); c.fill();
    c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
    heartPath(c, 24, 22, 8); c.fillStyle = '#ff6f8e'; c.fill(); c.lineWidth = 1.5; c.stroke();
    c.fillStyle = INK; c.font = "700 18px Caveat, cursive";   // chỉ có chữ số -> dùng đúng Caveat thật c.textAlign = 'left'; c.textBaseline = 'middle';
    c.fillText(`${collected}/${GOAL}`, 38, 22);
    c.fillStyle = '#fff'; rr(c, 76, 17, 42, 10, 5); c.fill();
    c.fillStyle = '#ff8fa3'; rr(c, 76, 17, Math.max(10, 42 * collected / GOAL), 10, 5); c.fill();
    c.strokeStyle = INK; c.lineWidth = 1.5; rr(c, 76, 17, 42, 10, 5); c.stroke();
  }

  function loop(t){
    if(state !== 'playing') return;
    const dt = Math.min(0.033, (t - lastT) / 1000);   // chặn dt quá lớn (vừa quay lại từ tab khác)
    lastT = t;
    update(dt);
    if(state === 'playing'){ draw(); raf = requestAnimationFrame(loop); }
  }

  /* ---------- điều khiển ---------- */
  canvas.addEventListener('pointerdown', e => {
    if(state !== 'playing') return;
    e.preventDefault();
    jumpBuf = 0.12;
  });
  document.addEventListener('keydown', e => {
    if(state !== 'playing') return;
    if(e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW'){
      e.preventDefault();               // không cho Space cuộn trang khi đang chơi
      if(!e.repeat) jumpBuf = 0.12;
    }
  });
  btn.addEventListener('click', () => { state === 'paused' ? resume() : start(); });

  // tự tạm dừng khi cuộn khỏi khung game hoặc chuyển tab (đỡ tốn pin, không chết oan)
  if('IntersectionObserver' in window){
    new IntersectionObserver(entries => {
      inView = entries[0].intersectionRatio >= 0.4;
      if(!inView) pause();
    }, { threshold: [0, 0.4, 1] }).observe(wrap);
  }
  document.addEventListener('visibilitychange', () => { if(document.hidden) pause(); });

  // đổi cỡ màn hình / xoay: chỉ cần đổi scale, game không bị reset
  function onResize(){ fit(); if(state !== 'playing') draw(); }
  if('ResizeObserver' in window) new ResizeObserver(onResize).observe(wrap);
  else addEventListener('resize', onResize);

  /* ---------- khởi tạo ---------- */
  reset();
  fit();
  draw();
  show('Sẵn sàng chưa? 🛵', `Chạm màn hình để nhảy qua chướng ngại, nhặt đủ ${GOAL} trái tim nhé!`, 'Lên xe!');
  const ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  ready.then(() => { if(state !== 'playing') draw(); });
  /*TEST_HOOK*/
})();