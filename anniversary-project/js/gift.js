/* ===== Trò chơi: Hộp quà mật mã + lá thư =====
   Chạy độc lập: nếu trang không có #s-gift thì không làm gì.
   Muốn đổi nội dung -> sửa CODE, HINT, LETTER bên dưới. */
(function(){
  const sec = document.getElementById('s-gift');
  if(!sec) return;

  const CODE = '1011';   // mật mã (ngày 10/11 = ngày + tháng). Đổi thành số bạn muốn, bao nhiêu chữ số cũng được.
  const HINT = 'Gợi ý: ngày mình chính thức bắt đầu (ngày rồi đến tháng) 💭';

  const LETTER = {
    to: 'Gửi người thương của mình,',
    paragraphs: [
      'Mình không giỏi nói lời hoa mỹ, nên mình gói hết vào chiếc hộp nhỏ này.',
      'Cảm ơn vì đã cùng mình ngồi chung một chiếc xe, đi qua những ngày vui, những ngày mệt, và cả những lần mình ngốc nghếch.',
      'Mong chuyến xe của hai đứa mình còn đi thật xa, qua thật nhiều con đường, nhặt thật nhiều trái tim nữa.',
      'Happy Anniversary! Cảm ơn vì đã là điều tuyệt nhất của mình 💞'
    ],
    sign: '— của mình, mãi mãi'
  };

  const INK = '#3d3a4a';
  const box      = document.getElementById('giftBox');
  const panel    = document.getElementById('giftPanel');
  const slotsEl  = document.getElementById('giftSlots');
  const msgEl    = document.getElementById('giftMsg');
  const keysEl   = document.getElementById('giftKeys');
  const hintEl   = document.getElementById('giftHint');
  const letter   = document.getElementById('giftLetter');
  const relockBt = document.getElementById('giftRelock');
  const main     = document.getElementById('giftMain');

  let state = 'locked';          // locked | opening | open
  let entry = '';
  let busy = false;
  let wrongCount = 0;
  let inView = false;

  /* ---------- vẽ hộp quà bằng rough.js (nét hơn trên màn hình retina) ---------- */
  function hiDpi(id){
    const c = document.getElementById(id);
    const w = c.width, h = c.height, d = Math.min(window.devicePixelRatio || 1, 3);
    c.style.width = w + 'px'; c.style.height = h + 'px';
    c.width = Math.round(w * d); c.height = Math.round(h * d);
    c.getContext('2d').scale(d, d);
    return c;
  }
  function drawBox(){
    if(!window.rough) return;           // không có rough.js thì bỏ qua, game vẫn chơi được
    const body = rough.canvas(hiDpi('giftBody'));
    body.rectangle(8, 6, 184, 84, { stroke:INK, strokeWidth:2.2, roughness:1.8, fill:'#ffb3c6', fillStyle:'hachure', hachureGap:5 });
    body.rectangle(88, 6, 24, 84, { stroke:INK, strokeWidth:2, roughness:1.3, fill:'#ffe08a', fillStyle:'solid' });

    const lid = rough.canvas(hiDpi('giftLidC'));
    lid.rectangle(4, 28, 212, 38, { stroke:INK, strokeWidth:2.2, roughness:1.8, fill:'#ff8fa3', fillStyle:'hachure', hachureGap:5 });
    lid.rectangle(98, 28, 24, 38, { stroke:INK, strokeWidth:2, roughness:1.3, fill:'#ffe08a', fillStyle:'solid' });
    lid.ellipse(86, 16, 42, 24, { stroke:INK, strokeWidth:2, roughness:1.2, fill:'#ffe08a', fillStyle:'solid' });
    lid.ellipse(134, 16, 42, 24, { stroke:INK, strokeWidth:2, roughness:1.2, fill:'#ffe08a', fillStyle:'solid' });
    lid.circle(110, 20, 16, { stroke:INK, strokeWidth:2, roughness:1.1, fill:'#ffd24d', fillStyle:'solid' });
  }

  /* ---------- ô mật mã + bàn phím ---------- */
  for(let i = 0; i < CODE.length; i++){
    const s = document.createElement('div');
    s.className = 'gift-slot';
    slotsEl.appendChild(s);
  }
  function renderSlots(){
    [...slotsEl.children].forEach((s, i) => {
      s.textContent = entry[i] || '';
      s.classList.toggle('on', i < entry.length);
    });
  }
  function say(t){ msgEl.textContent = t; }

  function press(d){
    if(state !== 'locked' || busy || entry.length >= CODE.length) return;
    entry += d;
    renderSlots();
    say('');
    if(entry.length === CODE.length){
      busy = true;
      setTimeout(() => { entry === CODE ? unlock() : wrong(); }, 220);
    }
  }
  function back(){
    if(state !== 'locked' || busy || !entry) return;
    entry = entry.slice(0, -1);
    renderSlots();
  }

  function wrong(){
    wrongCount++;
    say('Chưa đúng rồi, thử lại nhé 💭');
    slotsEl.classList.add('shake');
    box.classList.add('shake');
    try{ if(navigator.vibrate) navigator.vibrate(120); }catch(_){}
    if(wrongCount >= 2) hintEl.hidden = false;   // sai 2 lần thì tự hiện gợi ý
    setTimeout(() => {
      slotsEl.classList.remove('shake');
      box.classList.remove('shake');
      entry = '';
      renderSlots();
      busy = false;
    }, 650);
  }

  /* ---------- mở hộp ---------- */
  function unlock(){
    state = 'opening';
    say('Đúng rồi! 🎉');
    slotsEl.classList.add('ok');
    box.classList.add('open');
    try{ if(typeof confettiBurst === 'function') confettiBurst(); }catch(_){}
    setTimeout(showLetter, 1100);
  }

  function buildLetter(){
    const parts = [];
    let i = 0;
    parts.push(`<p class="gl-line" style="--i:${i++}">${LETTER.to}</p>`);
    LETTER.paragraphs.forEach(t => parts.push(`<p class="gl-line" style="--i:${i++}">${t}</p>`));
    parts.push(`<p class="gl-line gl-sign" style="--i:${i++}">${LETTER.sign}</p>`);
    letter.querySelector('#giftLetterBody').innerHTML = parts.join('');
    // nút "Gói thư lại" cũng hiện dần ở cuối
    relockBt.parentNode.style.setProperty('--i', i);
  }

  function showLetter(){
    panel.hidden = true;
    buildLetter();
    letter.hidden = false;
    letter.classList.remove('show');
    void letter.offsetWidth;            // khởi động lại animation
    letter.classList.add('show');
    state = 'open';
    const calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => letter.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'nearest' }), 500);
  }

  function relock(){
    letter.classList.remove('show');
    letter.hidden = true;
    box.classList.remove('open');
    slotsEl.classList.remove('ok');
    panel.hidden = false;
    hintEl.hidden = true;
    wrongCount = 0; entry = ''; busy = false;
    renderSlots(); say('');
    state = 'locked';
  }

  /* ---------- sự kiện ---------- */
  keysEl.addEventListener('click', e => {
    const b = e.target.closest('button[data-key]');
    if(!b) return;
    const k = b.dataset.key;
    if(k === 'back') back();
    else if(k === 'hint') hintEl.hidden = !hintEl.hidden;
    else press(k);
  });
  relockBt.addEventListener('click', relock);

  // gõ phím số trên máy tính (chỉ khi đang nhìn thấy hộp quà, để không ảnh hưởng chỗ khác)
  document.addEventListener('keydown', e => {
    if(state !== 'locked' || !inView || e.ctrlKey || e.metaKey || e.altKey) return;
    if(/^[0-9]$/.test(e.key)){ press(e.key); }
    else if(e.key === 'Backspace'){ e.preventDefault(); back(); }
  });
  if('IntersectionObserver' in window){
    new IntersectionObserver(en => { inView = en[0].intersectionRatio >= 0.35; }, { threshold: [0, 0.35, 1] }).observe(main);
  } else inView = true;

  /* ---------- khởi tạo ---------- */
  hintEl.textContent = HINT;
  renderSlots();
  drawBox();
})();