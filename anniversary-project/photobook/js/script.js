/* =====================================================================
   PHOTOBOOK — lật trang
   • Máy tính / máy tính bảng / điện thoại NGANG: xem cả hai trang (giữ nguyên hiệu ứng lật cũ).
   • Điện thoại DỌC: xem TỪNG TRANG một ở cỡ đọc được; chạm mép trái/phải,
     bấm nút Trước/Sau hoặc vuốt ngang để sang trang.
   ===================================================================== */
(() => {
  const pages    = [...document.querySelectorAll('.page')];
  const wrap     = document.getElementById('bookWrap');
  const scaler   = document.getElementById('bookScaler');
  const pageNo   = document.getElementById('pageNo');
  const totalNo  = document.getElementById('totalNo');
  const zonePrev = document.getElementById('zonePrev');
  const zoneNext = document.getElementById('zoneNext');
  const btnPrev  = document.getElementById('btnPrev');
  const btnNext  = document.getElementById('btnNext');

  const DESIGN_W = 980;      // bề rộng "thiết kế" của cả cuốn sách (px) — khớp style.css
  const HALF_W   = 490;      // bề rộng một trang
  const WIN      = { C: 245, L: 0, R: 490 };   // vị trí khung nhìn điện thoại: Bìa (giữa) / trang Trái / trang Phải

  // z-index: trang chưa lật xếp chồng theo thứ tự đọc; trang đã lật luôn nằm dưới đáy
  const pageCount = pages.length;
  const restZ    = i => pageCount - i;
  const flippedZ = i => i - pageCount;

  // phải khớp "transition: transform 1s" của .page. Đúng nửa chặng (90°, trang đứng cạnh)
  // mặt sau trơn sẽ lộ ra, nên ta hạ/nâng z-index ngay lúc đó để không bao giờ thấy mặt sau.
  const FLIP_MS = 1000;
  const PAN_MS  = 500;

  pages.forEach((p, i) => {
    p.style.zIndex = restZ(i);
    p.style.transformOrigin = 'center center';
  });

  const mqPhone = window.matchMedia('(max-width: 700px) and (orientation: portrait)');
  let phone = false;
  let current = 0;            // chỉ số tờ đang nằm trên cùng
  let half = 'C';             // chỉ dùng cho chế độ điện thoại: 'C' bìa, 'L' trang trái, 'R' trang phải
  let busyUntil = 0;

  const busy = ms => { busyUntil = performance.now() + ms; };
  const isBusy = () => performance.now() < busyUntil;

  /* ---------- lật một tờ (dùng chung cho mọi chế độ) ---------- */
  function flipForward(onMid){
    const idx = current, p = pages[idx];
    clearTimeout(p._t);
    p.classList.add('flipped');
    p._t = setTimeout(() => { p.style.zIndex = flippedZ(idx); if (onMid) onMid(); }, FLIP_MS / 2);
    current++;
  }
  function flipBack(){
    current--;
    const idx = current, p = pages[idx];
    clearTimeout(p._t);
    p.classList.remove('flipped');
    p._t = setTimeout(() => { p.style.zIndex = restZ(idx); }, FLIP_MS / 2);
  }

  /* ---------- khung nhìn điện thoại ---------- */
  function setWin(name){ wrap.style.setProperty('--win', phone ? WIN[name] : 0); }

  function fit(){
    const w = wrap.clientWidth;
    if (!w) return;
    scaler.classList.add('no-t');                       // đổi cỡ thì không chạy hiệu ứng trượt
    wrap.style.setProperty('--k', (w / (phone ? HALF_W : DESIGN_W)).toFixed(4));
    void scaler.offsetWidth;
    requestAnimationFrame(() => scaler.classList.remove('no-t'));
    wrap.classList.add('ready');
  }

  /* ---------- hiển thị số trang + trạng thái nút ---------- */
  function step(){ return current === 0 ? 0 : 2 * current - 1 + (half === 'R' ? 1 : 0); }
  function total(){ return phone ? 2 * (pageCount - 1) + 1 : pageCount; }
  function update(){
    const s = phone ? step() : current;
    pageNo.textContent = String(s + 1).padStart(2, '0');
    totalNo.textContent = String(total()).padStart(2, '0');
    const atStart = s === 0, atEnd = s === total() - 1;
    [zonePrev, btnPrev].forEach(b => b.disabled = atStart);
    [zoneNext, btnNext].forEach(b => b.disabled = atEnd);
  }

  /* ---------- điều hướng ---------- */
  function next(){
    if (phone) return phoneNext();
    if (current >= pageCount - 1) return;
    flipForward();
    update();
  }
  function prev(){
    if (phone) return phonePrev();
    if (current <= 0) return;
    flipBack();
    update();
  }

  // Điện thoại — tiến: bìa → trái → phải → (lật tờ) → trái → phải ...
  function phoneNext(){
    if (isBusy()) return;
    if (current === 0){                       // lật bìa, nửa chặng thì trượt khung sang trang trái
      flipForward(() => setWin('L')); half = 'L'; busy(650);
    } else if (half === 'L'){                 // trang trái → trang phải: chỉ trượt khung nhìn
      half = 'R'; setWin('R'); busy(PAN_MS - 60);
    } else if (current < pageCount - 1){      // trang phải → lật tờ → trang trái của tờ kế
      flipForward(() => setWin('L')); half = 'L'; busy(650);
    } else return;
    update();
  }
  // Điện thoại — lùi: đối xứng. Trượt khung nhìn TRƯỚC (lúc mặt sau của tờ còn nằm dưới đáy), rồi mở tờ ra.
  function phonePrev(){
    if (isBusy() || current === 0) return;
    if (half === 'R'){ half = 'L'; setWin('L'); busy(PAN_MS - 60); }
    else {
      const toCover = current === 1;
      half = toCover ? 'C' : 'R';
      setWin(half);
      flipBack(); busy(650);
    }
    update();
  }

  /* ---------- chạm / bấm / phím / vuốt ---------- */
  zonePrev.addEventListener('click', prev);
  zoneNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') next();
    if (e.key === 'ArrowLeft'  || e.key === 'PageUp')   prev();
  });

  let sx = null, sy = null;
  wrap.addEventListener('touchstart', e => {
    if (e.touches.length !== 1){ sx = null; return; }
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  wrap.addEventListener('touchend', e => {
    if (sx === null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    sx = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2){ dx < 0 ? next() : prev(); }
  }, { passive: true });

  /* ---------- đổi chế độ khi xoay màn hình / đổi cỡ ---------- */
  function applyMode(){
    const p = mqPhone.matches;
    phone = p;
    document.documentElement.classList.toggle('phone', p);
    half = p ? (current === 0 ? 'C' : (half === 'R' ? 'R' : 'L')) : 'C';
    setWin(half);
    fit();
    update();
  }
  if (mqPhone.addEventListener) mqPhone.addEventListener('change', applyMode);
  else if (mqPhone.addListener) mqPhone.addListener(applyMode);

  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(wrap);
  else window.addEventListener('resize', fit);

  applyMode();
})();