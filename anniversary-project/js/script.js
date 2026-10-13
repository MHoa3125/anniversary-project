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

const rcJar=rough.canvas(hiDpiCanvas('jarCanvas'));
rcJar.rectangle(18,40,134,160,{stroke:'#3d3a4a',strokeWidth:2.4,roughness:2.4,fill:'#ffffff',fillStyle:'solid',fillWeight:.5});
rcJar.rectangle(45,16,80,26,{stroke:'#3d3a4a',strokeWidth:2.2,roughness:2.2,fill:'#c99a63',fillStyle:'hachure',hachureGap:4});
rcJar.line(18,40,45,42);rcJar.line(152,40,125,42);

const rcBox=rough.canvas(hiDpiCanvas('boxCanvas'));
const boxCx=90,boxCy=52;
rcBox.polygon([[boxCx-72,boxCy-4],[boxCx-14,boxCy-44],[boxCx-8,boxCy+2],[boxCx-58,boxCy+26]],{stroke:'#3d3a4a',strokeWidth:2.2,roughness:2.1,fill:'#e3a361',fillStyle:'hachure',hachureGap:4});
rcBox.polygon([[boxCx+72,boxCy-4],[boxCx+14,boxCy-44],[boxCx+8,boxCy+2],[boxCx+58,boxCy+26]],{stroke:'#3d3a4a',strokeWidth:2.2,roughness:2.1,fill:'#e3a361',fillStyle:'hachure',hachureGap:4});
rcBox.polygon([[boxCx-56,boxCy+18],[boxCx+56,boxCy+18],[boxCx+40,boxCy+96],[boxCx-40,boxCy+96]],{stroke:'#3d3a4a',strokeWidth:2.4,roughness:2.2,fill:'#d9a65c',fillStyle:'hachure',hachureGap:5});
rcBox.line(boxCx-56,boxCy+18,boxCx+56,boxCy+18);

// ---------- wish jar ----------
const wishes=[
  "You're the best version of \"home\" I've ever known.",
  "Every day with you feels like a page from my favorite story.",
  "I fall for you a little more with every sunrise.",
  "You're my favorite hello and my hardest goodbye.",
  "With you, ordinary days become memories.",
  "Thank you for choosing me, again and again."
];
const jar=document.getElementById('jar');
for(let i=0;i<10;i++){
  const s=document.createElement('div');
  s.className='scroll';
  s.style.left=8+Math.random()*118+'px';
  s.style.background=['#ffb3c6','#c9e4ff','#ffe08a'][i%3];
  jar.appendChild(s);
}
jar.onclick=()=>{
  const randomWishIndex = Math.floor(Math.random()*wishes.length);
  const wishText = wishes[randomWishIndex];

  // Create a flying scroll element
  const flyingScroll = document.createElement('div');
  flyingScroll.className = 'scroll-flying';
  flyingScroll.style.background = ['#ffb3c6','#c9e4ff','#ffe08a'][randomWishIndex % 3];
  jar.appendChild(flyingScroll);

  // Listen for animation end to update wishNote and remove flying scroll
  flyingScroll.addEventListener('animationend', () => {
    document.getElementById('wishNote').textContent = wishText;
    flyingScroll.remove();
  }, { once: true });
};

// ---------- photo pinning: ảnh rơi ra khỏi hộp, kéo lên dây phơi ----------
const box=document.getElementById('box');
const polaroids=document.getElementById('polaroids');
let spawned=false;
const filled={};

// filenames of the 4 photos that fall out of the box — replace these files in /images to use your own photos
const boxPhotos=['images/photo4.jpg','images/photo5.jpg','images/photo6.jpg','images/photo7.jpg'];

/*
  Kéo thả dùng Pointer Events: 1 bộ code chạy cho cả chuột, ngón tay và bút.
  (Bản cũ dùng touchmove gắn ở document -> trình duyệt điện thoại coi là "passive",
   preventDefault() bị bỏ qua nên trang cuộn theo và việc kéo bị hủy.)
  CSS .pol-mini { touch-action:none } báo trình duyệt đừng cuộn khi chạm vào ảnh.
  Ảnh được dịch chuyển bằng transform nên không rời khỏi bố cục -> các ảnh khác không bị nhảy vị trí.
*/
let drag = null; // { el, id, startX, startY, lastX, lastY, sx0, sy0 }
let autoScrollRAF = 0;

function applyDrag(){
  if(!drag) return;
  // tính theo toạ độ trang (đã cộng scroll) để vẫn bám ngón tay khi trang tự cuộn
  const dx = (drag.lastX + scrollX) - (drag.startX + drag.sx0);
  const dy = (drag.lastY + scrollY) - (drag.startY + drag.sy0);
  drag.el.style.transform =
    `translate(calc(var(--dx,0px) + ${dx}px), ${dy}px) rotate(var(--rot,0deg)) scale(1.08)`;
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

// chọn ô dây phơi chồng lên ảnh nhiều nhất (cần chồng ≥15% diện tích ảnh)
function pickDropzone(el){
  const r = el.getBoundingClientRect();
  const need = r.width * r.height * 0.15;
  let best = null, bestArea = 0;
  document.querySelectorAll('.dropzone:not(.filled)').forEach(z => {
    const zr = z.getBoundingClientRect();
    const w = Math.min(r.right, zr.right) - Math.max(r.left, zr.left);
    const h = Math.min(r.bottom, zr.bottom) - Math.max(r.top, zr.top);
    if(w > 0 && h > 0 && w*h > bestArea){ best = z; bestArea = w*h; }
  });
  return bestArea >= need ? best : null;
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

function endDrag(e, allowDrop){
  if(!drag || e.pointerId !== drag.id) return;
  const el = drag.el;
  const zone = allowDrop ? pickDropzone(el) : null;
  drag = null;
  el.classList.remove('is-dragging');

  if(zone){
    // thả đúng ô: dán vào ô (vị trí cố định do CSS .pol-mini.placed)
    zone.classList.add('filled');
    el.classList.add('placed');
    el.style.transition = '';
    el.style.transform = '';
    zone.appendChild(el);
    filled[zone.dataset.slot] = true;
    if(Object.keys(filled).length === 4) confettiBurst();
  } else {
    // thả ra ngoài: bay êm về chỗ cũ
    el.style.transition = 'transform .3s ease';
    el.style.transform = '';
    setTimeout(() => { el.style.transition = ''; }, 320);
  }
}
document.addEventListener('pointerup', e => endDrag(e, true));
document.addEventListener('pointercancel', e => endDrag(e, false));

box.onclick = () => {
  if (spawned) return;
  spawned = true;
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
};

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