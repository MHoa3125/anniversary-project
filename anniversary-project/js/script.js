// ---------- confetti ----------
const cv=document.getElementById('fx'),ctx=cv.getContext('2d');
function resize(){cv.width=innerWidth;cv.height=innerHeight;}
resize();addEventListener('resize',resize);
function drawHeartShape(ctx, size, color) {
  const x = 0;
  const y = 0;
  const curveFactor = 0.6;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.4);

  ctx.bezierCurveTo(
    x + size * 0.5 * curveFactor, y + size * 0.1,
    x + size * 0.5, y - size * 0.5,
    x, y - size * 0.4
  );

  ctx.bezierCurveTo(
    x - size * 0.5, y - size * 0.5,
    x - size * 0.5 * curveFactor, y + size * 0.1,
    x, y + size * 0.4
  );
  ctx.closePath();
  ctx.fill();
}

function confettiBurst(){
  const colors=['#ff8fa3','#ffc9d6','#ffe08a','#c9e4ff','#b6f0d1'];
  // điện thoại yếu hơn máy tính -> ít hạt hơn cho mượt
  const count = innerWidth < 600 ? 160 : 500;
  let parts=Array.from({length:count},()=> ({
    x:Math.random() * innerWidth, y:Math.random() * innerHeight,
    vx:(Math.random()-.5)*7,vy:(Math.random()-1.4)*7,
    g:.15,size:10+Math.random()*10,color:colors[Math.floor(Math.random()*colors.length)],rot:Math.random()*6,vr:(Math.random()-.5)*.3,life:200
  }));
  function frame(){
    ctx.clearRect(0,0,cv.width,cv.height);
    parts.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.rot+=p.vr;p.life--;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);
      drawHeartShape(ctx, p.size, p.color);
      ctx.restore();
    });
    parts=parts.filter(p=>p.life>0);
    if(parts.length) requestAnimationFrame(frame); else ctx.clearRect(0,0,cv.width,cv.height);
  }
  frame();
}

// ---------- hand-drawn jar & box (rough.js) ----------
// Canvas nét hơn trên màn hình điện thoại (retina): vẽ ở độ phân giải gấp devicePixelRatio,
// nhưng kích thước hiển thị trên trang vẫn giữ nguyên.
function hiDpiCanvas(id){
  const c=document.getElementById(id);
  const w=c.width,h=c.height,d=Math.min(window.devicePixelRatio||1,3);
  c.style.width=w+'px';c.style.height=h+'px';
  c.width=Math.round(w*d);c.height=Math.round(h*d);
  c.getContext('2d').scale(d,d);
  return c;
}

// ---------- hộp đựng ảnh vintage (rough.js): vỏ đỏ đô, góc sắt vàng, nhãn kem, nắp có khóa gài ----------
function drawPhotoBox(){
  const INK='#3d3a4a', GOLD='#d9b872', BURG='#6e1f2e', BURG_L='#a23a50', CREAM='#f1e6d2';
  const body=hiDpiCanvas('boxCanvas'), lid=hiDpiCanvas('boxLid');
  const b=rough.canvas(body), l=rough.canvas(lid);
  // bóng đổ dưới đáy hộp
  const c=body.getContext('2d'); c.save(); c.fillStyle='rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(110,166,98,6,0,0,Math.PI*2); c.fill(); c.restore();
  // ruột hộp tối + mấy tấm ảnh lấp ló (thấy khi nắp mở)
  b.rectangle(14,44,192,22,{stroke:'none',fill:'#2a0c14',fillStyle:'solid'});
  [[[34,62],[38,30],[78,34],[74,62],'#e8b9be'],[[88,62],[90,24],[132,26],[130,62],'#bdd2e6'],[[142,62],[148,32],[186,30],[184,62],'#ffe08a']].forEach(([p1,p2,p3,p4,col])=>{
    b.polygon([p1,p2,p3,p4],{stroke:INK,strokeWidth:1.8,roughness:1,fill:CREAM,fillStyle:'solid'});
    const m=(a,z)=>[a[0]+(z[0]-a[0])*.18,a[1]+(z[1]-a[1])*.18];
    b.polygon([[p1[0]+5,p1[1]-12],[p2[0]+4,p2[1]+6],[p3[0]-4,p3[1]+6],[p4[0]-5,p4[1]-12]],{stroke:'none',fill:col,fillStyle:'solid'});
  });
  // mặt trước hộp
  b.rectangle(10,60,200,104,{stroke:'none',fill:BURG,fillStyle:'solid'});
  b.rectangle(10,60,200,104,{stroke:INK,strokeWidth:2.4,roughness:1.5,fill:BURG_L,fillStyle:'hachure',hachureGap:6,fillWeight:1});
  b.line(26,76,194,76,{stroke:GOLD,strokeWidth:2.4,roughness:1});            // sọc vàng
  b.line(26,150,194,150,{stroke:GOLD,strokeWidth:2.4,roughness:1});
  [[10,60],[196,60],[10,150],[196,150]].forEach(([x,y])=>b.rectangle(x,y,14,14,{stroke:INK,strokeWidth:1.8,roughness:.8,fill:GOLD,fillStyle:'solid'}));   // góc sắt
  b.rectangle(52,88,116,44,{stroke:INK,strokeWidth:2,roughness:1,fill:CREAM,fillStyle:'solid'});                                                       // nhãn kem
  // nắp hộp
  l.rectangle(8,24,220,38,{stroke:'none',fill:'#7d2434',fillStyle:'solid'});
  l.rectangle(8,24,220,38,{stroke:INK,strokeWidth:2.4,roughness:1.5,fill:'#b24a60',fillStyle:'hachure',hachureGap:6,fillWeight:1});
  l.rectangle(8,24,220,9,{stroke:INK,strokeWidth:2,roughness:1,fill:GOLD,fillStyle:'solid'});
  l.rectangle(18,38,200,18,{stroke:GOLD,strokeWidth:1.8,roughness:1});
  l.rectangle(106,46,24,20,{stroke:INK,strokeWidth:2,roughness:.9,fill:GOLD,fillStyle:'solid'});       // khóa gài
  l.circle(118,55,5,{stroke:INK,strokeWidth:1.6,roughness:.6,fill:'#4d1220',fillStyle:'solid'});
}
drawPhotoBox();

// ---------- photo pinning: ảnh rơi ra khỏi hộp, kéo lên dây phơi ----------
const box=document.getElementById('box');
const polaroids=document.getElementById('polaroids');
const memLine=document.getElementById('memLine');
const memTip=document.getElementById('memTip');
let spawned=false;
const filled={};

// filenames of the 4 photos that fall out of the box — replace these files in /images to use your own photos
const boxPhotos=['images/photo4.jpg','images/photo5.jpg','images/photo6.jpg','images/photo7.png'];
// Chú thích hiện dưới ảnh khi chạm để phóng to (theo đúng thứ tự 4 ảnh ở trên). Để '' nếu không cần chú thích.
const CAPTIONS=['','','',''];

const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const buzz = ms => { try{ if(navigator.vibrate) navigator.vibrate(ms); }catch(_){} };   // rung nhẹ trên điện thoại

// bóng đèn dọc dây (tắt sẵn, sáng từng bóng khi dán đủ 4 ảnh)
(function buildBulbs(){
  const colors=['#ff8fa3','#ffe08a','#9fd3f2','#b6f0d1','#ff6f6f'];
  let i=0;
  document.querySelectorAll('.mem-rope').forEach(rope=>{
    for(let k=0;k<14;k++){
      const b=document.createElement('i');
      b.className='mem-bulb';
      b.style.left=((k+.5)/14*100)+'%';
      b.style.setProperty('--i',i++);
      b.style.setProperty('--bc',colors[k%colors.length]);
      rope.appendChild(b);
    }
  });
})();

/*
  Kéo thả dùng Pointer Events: 1 bộ code chạy cho cả chuột, ngón tay và bút.
  CSS .pol-mini { touch-action:none } báo trình duyệt đừng cuộn khi chạm vào ảnh.
  Ảnh được dịch chuyển bằng transform nên không rời khỏi bố cục -> các ảnh khác không bị nhảy vị trí.
*/
let drag = null; // { el, id, startX, startY, lastX, lastY, sx0, sy0 }
let autoScrollRAF = 0;
let hotZone = null;

// ô dây phơi gần ảnh nhất sẽ "sáng lên" để báo sẽ dán vào đâu
function setHot(z){
  if(z === hotZone) return;
  if(hotZone) hotZone.classList.remove('hot');
  hotZone = z;
  if(z){ z.classList.add('hot'); buzz(8); }
}

function applyDrag(){
  if(!drag) return;
  // tính theo toạ độ trang (đã cộng scroll) để vẫn bám ngón tay khi trang tự cuộn
  const dx = (drag.lastX + scrollX) - (drag.startX + drag.sx0);
  const dy = (drag.lastY + scrollY) - (drag.startY + drag.sy0);
  drag.el.style.transform =
    `translate(calc(var(--dx,0px) + ${dx}px), ${dy}px) rotate(var(--rot,0deg)) scale(1.08)`;
  setHot(pickZone(drag.el));
}

// kéo ảnh sát mép trên/dưới màn hình thì trang tự cuộn (ngón tay không thể vừa kéo vừa vuốt)
function autoScroll(){
  if(!drag){ autoScrollRAF = 0; return; }
  const edge = 80, maxSpeed = 16;
  let v = 0;
  if(drag.lastY < edge) v = -maxSpeed * Math.min(1, (edge - drag.lastY) / edge);
  else if(drag.lastY > innerHeight - edge) v = maxSpeed * Math.min(1, (drag.lastY - (innerHeight - edge)) / edge);
  if(v){ window.scrollBy(0, v); applyDrag(); }
  autoScrollRAF = requestAnimationFrame(autoScroll);
}

// chọn ô dán: chồng lên ≥15% diện tích ảnh, hoặc thả gần ô (<90px) thì "nam châm" hút vào
function pickZone(el){
  const r = el.getBoundingClientRect();
  const area = r.width * r.height;
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  let best = null, bestArea = 0, near = null, nearDist = 1e9;
  document.querySelectorAll('.mem-slot:not(.filled)').forEach(z => {
    const dz = z.querySelector('.mem-drop').getBoundingClientRect();
    const w = Math.min(r.right, dz.right) - Math.max(r.left, dz.left);
    const h = Math.min(r.bottom, dz.bottom) - Math.max(r.top, dz.top);
    if(w > 0 && h > 0 && w*h > bestArea){ best = z; bestArea = w*h; }
    const d = Math.hypot(cx - (dz.left + dz.width / 2), cy - (dz.top + dz.height / 2));
    if(d < nearDist){ near = z; nearDist = d; }
  });
  if(best && bestArea >= area * 0.15) return best;
  return nearDist < 90 ? near : null;
}

polaroids.addEventListener('pointerdown', e => {
  if(drag) return;
  if(e.pointerType === 'mouse' && e.button !== 0) return;
  const el = e.target.closest('.pol-mini');
  if(!el || el.classList.contains('placed') || el.classList.contains('falling')) return;

  e.preventDefault();
  try{ el.setPointerCapture(e.pointerId); }catch(_){}
  el.style.transition = 'none';
  el.classList.add('is-dragging');
  drag = { el, id:e.pointerId, startX:e.clientX, startY:e.clientY,
           lastX:e.clientX, lastY:e.clientY, sx0:scrollX, sy0:scrollY };
  applyDrag();
  if(!autoScrollRAF) autoScrollRAF = requestAnimationFrame(autoScroll);
});

document.addEventListener('pointermove', e => {
  if(!drag || e.pointerId !== drag.id) return;
  drag.lastX = e.clientX;
  drag.lastY = e.clientY;
  applyDrag();
});

// ghim ảnh vào ô: ảnh lướt từ chỗ vừa thả vào ô, kẹp bật xuống, ảnh đung đưa như treo trên dây
function pin(el, zone){
  const first = el.getBoundingClientRect();
  zone.classList.add('filled');
  el.classList.add('placed');
  el.style.transition = '';
  el.style.transform = '';
  el.style.setProperty('--hang', ((Math.random() - .5) * 6).toFixed(1) + 'deg');   // mỗi ảnh nghiêng một chút
  el.style.setProperty('--sd', (Math.random() * 1.6).toFixed(2) + 's');             // lắc lệch pha nhau
  el.tabIndex = 0;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', 'Phóng to ảnh');
  zone.appendChild(el);
  filled[zone.dataset.zone] = true;

  if(!reduceMotion && el.animate){
    const last = el.getBoundingClientRect();
    const dx = (first.left + first.width / 2) - (last.left + last.width / 2);
    const dy = first.top - last.top;
    el.animate(
      [{ translate: `${dx}px ${dy}px`, scale: `${first.width / last.width} ${first.height / last.height}` },
       { translate: '0px 0px', scale: '1 1' }],
      { duration: 340, easing: 'cubic-bezier(.3,1.2,.5,1)' });
  }
  zone.classList.add('snap');
  setTimeout(() => zone.classList.remove('snap'), 420);
  buzz(22);
  if(Object.keys(filled).length === 4) finale();
}

function endDrag(e, allowDrop){
  if(!drag || e.pointerId !== drag.id) return;
  const el = drag.el;
  const zone = allowDrop ? pickZone(el) : null;
  drag = null;
  setHot(null);
  el.classList.remove('is-dragging');

  if(zone){
    pin(el, zone);
  } else {
    // thả ra ngoài: bay êm về chỗ cũ
    el.style.transition = 'transform .3s ease';
    el.style.transform = '';
    setTimeout(() => { el.style.transition = ''; }, 320);
  }
}
document.addEventListener('pointerup', e => endDrag(e, true));
document.addEventListener('pointercancel', e => endDrag(e, false));

// dán đủ 4 ảnh: dây đung đưa, bóng đèn sáng từng bóng, rồi mới bắn confetti
function finale(){
  memLine.classList.add('done');
  memTip.classList.add('show');
  setTimeout(() => { try{ confettiBurst(); }catch(_){} }, reduceMotion ? 0 : 1000);
}

// chạm vào ảnh đã ghim để phóng to
const lb = document.createElement('div');
lb.className = 'mem-lb';
lb.setAttribute('role', 'dialog');
lb.setAttribute('aria-modal', 'true');
lb.setAttribute('aria-label', 'Ảnh phóng to');
lb.innerHTML = '<button class="mem-lb-close" type="button" aria-label="Đóng">×</button><figure><img alt=""><figcaption></figcaption></figure>';
document.body.appendChild(lb);
function openLB(el){
  const i = +el.dataset.photo;
  const img = lb.querySelector('img');
  img.src = boxPhotos[i];
  img.alt = (el.querySelector('img') || {}).alt || '';
  lb.querySelector('figcaption').textContent = CAPTIONS[i] || '';
  lb.classList.add('open');
  try{ lb.querySelector('.mem-lb-close').focus({ preventScroll:true }); }catch(_){}
}
function closeLB(){ lb.classList.remove('open'); }
lb.addEventListener('click', closeLB);
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeLB(); });
memLine.addEventListener('click', e => {
  const el = e.target.closest('.pol-mini.placed');
  if(el) openLB(el);
});
memLine.addEventListener('keydown', e => {
  if((e.key === 'Enter' || e.key === ' ') && e.target.matches('.pol-mini.placed')){ e.preventDefault(); openLB(e.target); }
});

box.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); box.click(); } });
box.onclick = () => {
  if (spawned) return;
  spawned = true;
  box.classList.add('shake', 'open');                      // nắp bật mở
  setTimeout(() => box.classList.remove('shake'), 400);
  setTimeout(spawnPhotos, reduceMotion ? 0 : 260);          // ảnh đổ ra ngay sau khi nắp mở
};
function spawnPhotos(){
  for (let i = 0; i < 4; i++) {
    const d = document.createElement('div');
    d.className = 'pol-mini p' + i;
    d.dataset.photo = i;
    d.innerHTML = `<img class="ph" src="${boxPhotos[i]}" alt="Ảnh kỷ niệm" draggable="false" onerror="this.style.display='none'">`;

    // messy, staggered fall-out-of-the-box animation
    const restRot = (Math.random() - 0.5) * 24;      // final resting tilt
    const startRot = restRot + (Math.random() - 0.5) * 160; // wilder tilt mid-tumble
    const dx = (Math.random() - 0.5) * 46;            // random horizontal scatter
    d.style.setProperty('--rot', `${restRot.toFixed(1)}deg`);
    d.style.setProperty('--rot-start', `${startRot.toFixed(1)}deg`);
    d.style.setProperty('--dx', `${dx.toFixed(1)}px`);
    d.style.setProperty('--delay', `${i * 0.12}s`);
    d.classList.add('falling');

    polaroids.appendChild(d);

    // remove falling class after animation so drag works smoothly afterwards
    d.addEventListener('animationend', () => {
      d.classList.remove('falling');
    }, { once: true });
  }
}

// ---------- music toggle (decorative) ----------
const player=document.getElementById('player');
let playing=false;
player.onclick=()=>{playing=!playing;player.textContent=playing?'⏸️':'🎵';};

// ---------- Section Transition with Intersection Observer ----------
const sections = document.querySelectorAll('section');

const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.2 // Trigger when 20% of the section is visible
};

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    } else {
      entry.target.classList.remove('is-visible');
    }
  });
}, observerOptions);

sections.forEach(section => {
  sectionObserver.observe(section);
});

// ---------- Days Together Counter ----------
const anniversaryDate = new Date('2024-11-10T00:00:00'); // Set your anniversary date and time

function updateCountdown() {
  const now = new Date();
  const difference = now.getTime() - anniversaryDate.getTime();

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  document.getElementById('countdown').innerHTML =
    `${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`;
}

updateCountdown();
setInterval(updateCountdown, 1000);