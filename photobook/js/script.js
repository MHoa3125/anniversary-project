const pages = [...document.querySelectorAll('.page')];
const pageNo = document.getElementById('pageNo');

const leftClickArea = document.querySelector('.left-click-area');
const rightClickArea = document.querySelector('.right-click-area');

let current = 0; // index of the topmost, currently-visible page

// z-index scheme, derived only from the page count so it never goes out of
// sync however many pages exist:
//  - a page still "resting" (not yet turned) uses restZ: earlier pages sit
//    on top of later ones (page 1 highest, matching the natural reading order).
//  - a page that has been turned uses flippedZ, which is always lower than
//    any restZ value, so turned pages always stay behind the book.
const pageCount = pages.length;
const restZ = i => pageCount - i;
const flippedZ = i => i - pageCount;

// Must match the "transition: transform 1s ..." duration set on .page in
// style.css. Halfway through that duration the page is rotated exactly 90deg
// (edge-on), which is also the instant backface-visibility swaps its front
// face for its (plain, undecorated) back face. Switching z-index right at
// that instant means the plain back face is never shown sitting on top for
// any stretch of time — it's already sent behind the next page as soon as it
// would otherwise become visible.
const FLIP_DURATION_MS = 1000;

// Every page's spine (see .page-front.spread:after) is drawn dead center,
// so every page always rotates around its own center — this is set once
// here and never needs to change per direction or per page index.
pages.forEach((p, i) => {
  p.style.zIndex = restZ(i);
  p.style.transformOrigin = 'center center';
});

function update(){
  pageNo.textContent = current + 1;
}

function next(){
  if (current >= pages.length - 1) return;
  const pageToFlip = pages[current];
  const pageIndexToFlip = current; // Store current index before incrementing

  // Keep this page's z-index HIGH (its current resting value) for the first
  // half of the turn, so it stays visible over the page underneath while its
  // front face is showing. Right at the halfway point (90deg, edge-on) we
  // drop it behind the stack — that's the same instant its front face would
  // otherwise be replaced by the plain back face, so the back face never
  // gets a chance to sit on top as a blank flash; the real next page shows
  // through instead.
  pageToFlip.classList.add('flipped');
  setTimeout(() => {
    pageToFlip.style.zIndex = flippedZ(pageIndexToFlip);
  }, FLIP_DURATION_MS / 2);

  current++;
  update();
}

function prev(){
  if (current <= 0) return;
  current--; // Decrement current BEFORE acting on the page
  const pageToUnflip = pages[current];
  const pageIndexToUnflip = current;

  // Mirror of next(): for the first half of the turn this page is still
  // showing its plain back face, so leave it at its low (flipped) z-index —
  // hidden behind whichever page is currently on top — and only promote it
  // to the front at the halfway point (90deg, edge-on), the same instant its
  // real front face is about to appear.
  pageToUnflip.classList.remove('flipped');
  setTimeout(() => {
    pageToUnflip.style.zIndex = restZ(pageIndexToUnflip);
  }, FLIP_DURATION_MS / 2);

  update();
}

leftClickArea.addEventListener('click', prev);
rightClickArea.addEventListener('click', next);

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft') prev();
});

// swipe support for touch devices
let touchStartX = null;
const bookWrap = document.querySelector('.book-wrap');
bookWrap.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
bookWrap.addEventListener('touchend', e => {
  if (touchStartX === null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (dx < -40) next();
  else if (dx > 40) prev();
  touchStartX = null;
}, { passive: true });

update();