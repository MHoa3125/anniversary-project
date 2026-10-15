/* ===== Trò chơi: Thẻ bí mật (cào thẻ) =====
   Chạy độc lập: nếu trang không có #scratchCard thì không làm gì.
   Muốn đổi nội dung các thẻ -> sửa mảng PRIZES bên dưới. */
(function(){
  const card = document.getElementById('scratchCard');
  if(!card) return;

  const PRIZES = [
    { emoji:'🥛', text:'Trà đào' },
    { emoji:'☕', text:'Trà tắc' },
    { emoji:'🧋', text:'Trà sữa' },
    { emoji:'🥃', text:'Hồng trà' },
    { emoji:'🍵', text:'Matcha latte' },
    { emoji:'🍹', text:'Trà bí đao' }
  ];

  const BRUSH   = 20;    // bán kính cọ (px) - đủ to cho ngón tay
  const CELL    = 12;    // kích thước ô theo dõi tiến độ cào (px)
  const REVEAL  = 0.5;   // cào được 50% diện tích thì tự mở hết

  const canvas  = document.getElementById('scratchCanvas');
  const ctx     = canvas.getContext('2d');
  const emojiEl = document.getElementById('scratchEmoji');
  const textEl  = document.getElementById('scratchText');
  const btn     = document.getElementById('scratchAgain');

  let idx = 0, w = 0, h = 0, dpr = 1;
  let cols = 0, rows = 0, marked = null, markedCount = 0;
  let scratching = false, last = null, revealed = false;

  function setPrize(){
    const p = PRIZES[idx % PRIZES.length];
    emojiEl.textContent = p.emoji;
    textEl.textContent  = p.text;
  }

  // kích thước canvas = kích thước thẻ trên màn hình, nhân devicePixelRatio cho nét
  function setupSize(){
    w = card.clientWidth;           // clientWidth/Height không bị ảnh hưởng bởi transform
    h = card.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    cols = Math.ceil(w / CELL);
    rows = Math.ceil(h / CELL);
  }

  function drawCover(){
    ctx.globalCompositeOperation = 'source-over';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // lớp bạc
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0,   '#cfd5dc');
    g.addColorStop(.5,  '#eef1f4');
    g.addColorStop(1,   '#c3cad2');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // nét vẽ tay (rough.js) cho giống phong cách cả trang; nếu không có rough thì bỏ qua
    try{
      if(window.rough){
        const rc = rough.canvas(canvas);
        rc.rectangle(5, 5, w - 10, h - 10, {
          stroke:'#3d3a4a', strokeWidth:1.6, roughness:1.6,
          fill:'#b9c1ca', fillStyle:'cross-hatch', hachureGap:9, fillWeight:.8
        });
      }
    }catch(_){}

    // chấm lấp lánh
    for(let i = 0; i < 70; i++){
      ctx.fillStyle = Math.random() < .5 ? 'rgba(255,255,255,.7)' : 'rgba(120,130,145,.25)';
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.8 + .4, 0, 6.283);
      ctx.fill();
    }

    // chữ hướng dẫn
    ctx.fillStyle = 'rgba(61,58,74,.85)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `400 ${Math.round(Math.min(w * 0.12, 36))}px 'Patrick Hand', cursive`;
    ctx.fillText('Cào ở đây', w / 2, h / 2);
  }

  function resetProgress(){
    marked = new Uint8Array(cols * rows);
    markedCount = 0;
  }

  function newRound(){
    revealed = false;
    scratching = false;
    card.classList.remove('revealed');
    btn.hidden = true;
    setupSize();
    drawCover();
    resetProgress();
  }

  // đánh dấu các ô nằm trong bán kính cọ -> biết đã cào được bao nhiêu %
  function markCircle(x, y){
    const c0 = Math.max(0, Math.floor((x - BRUSH) / CELL));
    const c1 = Math.min(cols - 1, Math.floor((x + BRUSH) / CELL));
    const r0 = Math.max(0, Math.floor((y - BRUSH) / CELL));
    const r1 = Math.min(rows - 1, Math.floor((y + BRUSH) / CELL));
    for(let r = r0; r <= r1; r++){
      for(let c = c0; c <= c1; c++){
        const cx = c * CELL + CELL / 2, cy = r * CELL + CELL / 2;
        if((cx - x) * (cx - x) + (cy - y) * (cy - y) <= BRUSH * BRUSH){
          const k = r * cols + c;
          if(!marked[k]){ marked[k] = 1; markedCount++; }
        }
      }
    }
  }

  function scratchSegment(a, b){
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = BRUSH * 2;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x + 0.01, b.y);   // +0.01: chạm 1 điểm vẫn để lại dấu tròn
    ctx.stroke();

    const dist  = Math.hypot(b.x - a.x, b.y - a.y);
    const steps = Math.max(1, Math.ceil(dist / (CELL / 2)));
    for(let i = 0; i <= steps; i++){
      const t = i / steps;
      markCircle(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
    }
    if(markedCount / (cols * rows) >= REVEAL) reveal();
  }

  function point(e){
    const r = canvas.getBoundingClientRect();   // lấy mới mỗi lần: đúng cả khi trang đang cuộn / đang hiệu ứng trượt
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function reveal(){
    if(revealed) return;
    revealed = true;
    scratching = false;
    card.classList.add('revealed');
    btn.hidden = false;
    try{ if(typeof confettiBurst === 'function') confettiBurst(); }catch(_){}
  }

  canvas.addEventListener('pointerdown', e => {
    if(revealed) return;
    if(e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    try{ canvas.setPointerCapture(e.pointerId); }catch(_){}
    scratching = true;
    last = point(e);
    scratchSegment(last, last);
  });
  canvas.addEventListener('pointermove', e => {
    if(!scratching || revealed) return;
    const p = point(e);
    scratchSegment(last, p);
    last = p;
  });
  const stop = () => { scratching = false; };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);
  canvas.addEventListener('contextmenu', e => e.preventDefault());

  btn.addEventListener('click', () => {
    idx = (idx + 1) % PRIZES.length;
    setPrize();
    newRound();
  });

  // xoay màn hình / đổi cỡ cửa sổ: vẽ lại thẻ cho vừa. Chỉ khi RỘNG đổi
  // (thanh địa chỉ điện thoại ẩn/hiện chỉ đổi cao, không được làm mất nét cào).
  let lastW = 0;
  function onResize(){
    if(revealed) return;
    if(Math.abs(card.clientWidth - lastW) < 1) return;
    lastW = card.clientWidth;
    newRound();
  }
  if('ResizeObserver' in window) new ResizeObserver(onResize).observe(card);
  else addEventListener('resize', onResize);

  // khởi tạo (đợi font tải xong để chữ "Cào ở đây" đúng kiểu chữ)
  setPrize();
  const ready = (document.fonts && document.fonts.load)
    ? document.fonts.load("24px 'Patrick Hand'", 'Cào ở đây').catch(() => {})   // chắc chắn font đã tải trước khi vẽ chữ lên canvas
    : Promise.resolve();
  ready.then(() => { lastW = card.clientWidth; newRound(); });
})();