/* ===== Chuyến xe đã đi được: số ngày chạy trên công-tơ-mét + 3 kim giờ/phút/giây =====
   Chạy độc lập, lấy ngày kỷ niệm từ anniversaryDate trong script.js (không có thì dùng 10/11/2024).
   Dòng chữ đếm bằng chữ (#countdown) vẫn do script.js cập nhật. */
(function(){
  const sec = document.getElementById('s2');
  if(!sec) return;

  const start = (typeof anniversaryDate !== 'undefined' && anniversaryDate instanceof Date)
    ? anniversaryDate : new Date('2024-11-10T00:00:00');

  const drums = [...sec.querySelectorAll('.od-drum')];
  const odo   = document.getElementById('tripOdo');
  const nH = document.getElementById('tgH');
  const nM = document.getElementById('tgM');
  const nS = document.getElementById('tgS');

  // mặt đồng hồ quét 270° (từ -135° đến +135°) như đồng hồ xe hơi
  const angle = (v, max) => (-135 + 270 * Math.min(Math.max(v / max, 0), 1)).toFixed(2) + 'deg';

  function tick(){
    const diff = Math.max(0, Date.now() - start.getTime());
    const days = Math.floor(diff / 86400000);
    const h = Math.floor(diff % 86400000 / 3600000);
    const m = Math.floor(diff % 3600000 / 60000);
    const s = Math.floor(diff % 60000 / 1000);

    const digits = String(Math.min(days, Math.pow(10, drums.length) - 1)).padStart(drums.length, '0');
    drums.forEach((d, i) => d.style.setProperty('--n', digits[i]));
    if(odo) odo.setAttribute('aria-label', `${days} ngày`);

    if(nH) nH.style.transform = `rotate(${angle(h + m / 60, 24)})`;
    if(nM) nM.style.transform = `rotate(${angle(m + s / 60, 60)})`;
    if(nS) nS.style.transform = `rotate(${angle(s, 60)})`;
  }
  tick();
  setInterval(tick, 1000);
})();