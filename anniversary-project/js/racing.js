/* ===== Concept đường đua: số LAP, chạm xe để rồ ga, confetti ở trang cuối =====
   Chạy độc lập, không làm hỏng trang nếu thiếu phần tử. */
(function(){
  // 1) "LAP n" = số ngày đã bên nhau (lấy từ anniversaryDate trong script.js)
  const lap = document.getElementById('rcLap');
  if(lap){
    try{
      const start = (typeof anniversaryDate !== 'undefined' && anniversaryDate instanceof Date)
        ? anniversaryDate : new Date('2024-11-10T00:00:00');
      const days = Math.floor((Date.now() - start.getTime()) / 86400000);
      if(days >= 0) lap.textContent = 'Lap ' + days;
    }catch(_){}
  }

  // 2) chạm vào xe -> rồ ga (rung + khói). Dùng click nên chạy cả cảm ứng lẫn bàn phím.
  document.querySelectorAll('.rc-car').forEach(car => {
    car.addEventListener('click', () => {
      car.classList.remove('rc-rev');
      void car.offsetWidth;                       // khởi động lại animation
      car.classList.add('rc-rev');
      try{ if(navigator.vibrate) navigator.vibrate(40); }catch(_){}
      clearTimeout(car._rev);
      car._rev = setTimeout(() => car.classList.remove('rc-rev'), 900);
    });
  });

  // 3) về đích: nổ confetti 1 lần khi cuộn tới trang cuối
  const end = document.getElementById('s7');
  if(end && 'IntersectionObserver' in window && typeof confettiBurst === 'function'){
    const io = new IntersectionObserver(es => {
      if(es[0].intersectionRatio >= 0.55){
        io.disconnect();
        setTimeout(() => { try{ confettiBurst(); }catch(_){} }, 900);
      }
    }, { threshold: [0, 0.55, 1] });
    io.observe(end);
  }
})();