/* ===== Garage Wishes: máy in giấy bấm giờ =====
   Bấm nút đỏ → giấy chạy ra từng nấc (như máy in kim) với 1 lời nhắn NGẪU NHIÊN.
   Bấm lần nữa → tờ cũ xé bay đi và in ngay tờ mới.
   Cách bốc: xáo cả bộ rồi rút lần lượt (ngầm) → không trùng lời vừa đọc, người xem không thấy số đếm nào.
   Muốn thêm/sửa lời nhắn: sửa mảng WISHES (thêm bao nhiêu cũng được). Chạy độc lập. */
(function(){
  const host = document.getElementById('prHost');
  if(!host) return;

  const WISHES = [
    // 6 lời gốc của bạn
    "You're the best version of \"home\" I've ever known.",
    "Every day with you feels like a page from my favorite story.",
    "I fall for you a little more with every sunrise.",
    "You're my favorite hello and my hardest goodbye.",
    "With you, ordinary days become memories.",
    "Thank you for choosing me, again and again.",
    // 6 lời mới theo chủ đề xe (sửa/xóa tùy ý)
    "You're my favorite co-driver on every road.",
    "Every road I take somehow leads back to you.",
    "Together is our fastest lap.",
    "The longest drives feel short when you're beside me.",
    "My favorite place is the seat next to yours.",
    "No matter the lap, I'd choose you at the finish line."
  ];

  const printer = document.getElementById('prPrinter');
  const hint    = document.getElementById('prHint');
  const led     = document.getElementById('prLed');
  const live    = document.getElementById('prLive');
  const reduce  = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  let bag = [], last = -1;
  let state = 'idle';            // idle | tearing | printing | ready
  let paper = null, anim = null, timer = 0;

  /* ---------- vẽ thân máy in (rough.js, nét hơn trên màn hình retina) ---------- */
  function hiDpi(id){
    const c = document.getElementById(id);
    const w = c.width, h = c.height, d = Math.min(window.devicePixelRatio || 1, 3);
    c.style.width = w + 'px'; c.style.height = h + 'px';
    c.width = Math.round(w * d); c.height = Math.round(h * d);
    c.getContext('2d').scale(d, d);
    return c;
  }
  function drawPrinter(){
    const INK = '#3d3a4a', GOLD = '#d9b872';
    const cv = hiDpi('prBody');
    if(window.rough){
      const b = rough.canvas(cv);
      b.rectangle(8, 36, 254, 96, { stroke:'none', fill:'#6e1f2e', fillStyle:'solid' });                       // nền đặc
      b.rectangle(8, 36, 254, 96, { stroke:INK, strokeWidth:2.4, roughness:1.5, fill:'#a23a50', fillStyle:'hachure', hachureGap:6, fillWeight:1 });
      b.rectangle(4, 12, 262, 26, { stroke:INK, strokeWidth:2.4, roughness:1.3, fill:GOLD, fillStyle:'solid' });  // mặt trên + khe giấy
      b.rectangle(38, 20, 194, 9, { stroke:INK, strokeWidth:1.8, roughness:.8, fill:'#1b1923', fillStyle:'solid' });
      b.rectangle(24, 56, 92, 34, { stroke:INK, strokeWidth:2.2, roughness:1, fill:'#1b1923', fillStyle:'solid' }); // màn hình
      b.circle(204, 86, 72, { stroke:INK, strokeWidth:2.2, roughness:1, fill:'#4d1220', fillStyle:'solid' });      // vòng quanh nút đỏ
      [100, 107, 114].forEach(y => b.line(28, y, 112, y, { stroke:'#e9c98a', strokeWidth:1.6, roughness:1 }));      // khe thoát nhiệt
      b.rectangle(26, 132, 44, 7, { stroke:INK, strokeWidth:1.6, roughness:.8, fill:'#1b1923', fillStyle:'solid' });
      b.rectangle(200, 132, 44, 7, { stroke:INK, strokeWidth:1.6, roughness:.8, fill:'#1b1923', fillStyle:'solid' });
    } else {                                     // dự phòng nếu rough.js không tải được
      const c = cv.getContext('2d');
      c.fillStyle = '#6e1f2e'; c.fillRect(8, 36, 254, 96);
      c.fillStyle = GOLD;      c.fillRect(4, 12, 262, 26);
      c.fillStyle = '#1b1923'; c.fillRect(38, 20, 194, 9); c.fillRect(24, 56, 92, 34);
      c.fillStyle = '#4d1220'; c.beginPath(); c.arc(204, 86, 36, 0, 6.283); c.fill();
      c.strokeStyle = INK; c.lineWidth = 2.4; c.strokeRect(8, 36, 254, 96);
    }
  }

  /* ---------- bốc ngẫu nhiên không lặp (ngầm) ---------- */
  function shuffle(a){ for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function pick(){
    if(!bag.length){
      bag = shuffle(WISHES.map((_, i) => i));
      if(bag.length > 1 && bag[bag.length - 1] === last) bag.unshift(bag.pop());   // không bốc trùng lời vừa in
    }
    last = bag.pop();
    return WISHES[last];
  }
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  function makePaper(msg){
    const el = document.createElement('article');
    el.className = 'pr-paper';
    el.innerHTML =
      '<div class="pr-head"><span>Timing sheet</span><span>Lap 1:10.11</span></div>' +
      '<div class="pr-rule"></div>' +
      `<p class="pr-msg">${esc(msg)}</p>` +
      '<div class="pr-rule"></div>' +
      '<div class="pr-foot">★ miwa · tuni ★</div>';
    return el;
  }
  function setLed(t){ led.textContent = t; }

  /* ---------- in giấy ---------- */
  function startPrint(){
    state = 'printing';
    printer.classList.add('printing');
    setLed('PRINTING');
    hint.classList.add('off');
    const msg = pick();
    paper = makePaper(msg);
    host.appendChild(paper);
    live.textContent = msg;

    const h = paper.offsetHeight;
    const n = Math.max(6, Math.round(h / 16));                       // số nấc = số dòng giấy nhích ra
    if(reduce){ done(); return; }
    anim = paper.animate(
      [{ transform: `translateY(${h + 30}px)` }, { transform: 'translateY(0)' }],
      { duration: Math.min(1100, 480 + n * 30), easing: `steps(${n})`, fill: 'forwards' });
    anim.onfinish = done;
  }
  function done(){
    if(state !== 'printing') return;
    state = 'ready';
    printer.classList.remove('printing');
    setLed('READY');
    if(paper){                                   // tờ giấy nghiêng nhẹ cho tự nhiên
      const p = paper;
      if(anim){ anim.onfinish = null; anim.cancel(); anim = null; }
      p.style.transition = reduce ? 'none' : 'transform .25s ease';
      p.style.transform = 'translateY(0) rotate(-1.4deg)';
    }
  }
  function tear(el){                             // xé tờ cũ: bay lên và chếch sang phải rồi mất
    if(reduce){ el.remove(); return; }
    const a = el.animate(
      [{ transform: el.style.transform || 'none', opacity: 1 },
       { transform: 'translate(54px,-96px) rotate(18deg)', opacity: 0 }],
      { duration: 300, easing: 'cubic-bezier(.5,0,.9,.5)', fill: 'forwards' });
    a.onfinish = () => el.remove();
  }

  function press(){
    if(state === 'printing'){                    // đang in mà bấm thêm → in nốt ngay
      if(anim) anim.finish();
      return;
    }
    if(state === 'tearing') return;
    if(state === 'ready' && paper){
      state = 'tearing';
      setLed('...');
      tear(paper); paper = null;
      timer = setTimeout(startPrint, reduce ? 0 : 260);
    } else startPrint();
  }

  printer.addEventListener('click', press);
  drawPrinter();
})();