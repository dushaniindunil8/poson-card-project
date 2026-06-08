/* ============================================================
   POSON POYA WEBSITE - script.js
   - Star & decorative lantern background
   - Lantern matching memory game
   - Wish lantern launcher
   ============================================================ */

/* ==========================
   1. STAR BACKGROUND
========================== */
function createStars() {
  const container = document.getElementById('stars-container');
  const count = Math.min(200, Math.floor(window.innerWidth / 6));
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    star.style.cssText = `
      width:${size}px; height:${size}px;
      top:${Math.random() * 100}%;
      left:${Math.random() * 100}%;
      --dur:${(Math.random() * 4 + 2).toFixed(1)}s;
      animation-delay:${(Math.random() * 4).toFixed(1)}s;
    `;
    container.appendChild(star);
  }
}

/* ==========================
   2. DECORATIVE FLOATING LANTERNS
========================== */
const DECO_EMOJIS = ['🏮','🪔','🌸','🌼','☸️','🌺'];
function createDecoLanterns() {
  const container = document.getElementById('floating-lanterns');
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('div');
    el.className = 'deco-lantern';
    el.textContent = DECO_EMOJIS[i % DECO_EMOJIS.length];
    el.style.cssText = `
      left:${Math.random() * 95}%;
      --spd:${(Math.random() * 12 + 10).toFixed(1)}s;
      animation-delay:${(Math.random() * 15).toFixed(1)}s;
      font-size:${(Math.random() * 1.5 + 1.2).toFixed(1)}rem;
    `;
    container.appendChild(el);
  }
}

/* ==========================
   3. BACKGROUND MUSIC
========================== */
const musicBtn = document.getElementById('music-btn');
const bgMusic  = document.getElementById('bg-music');
let   musicOn  = false;

musicBtn.addEventListener('click', () => {
  if (!bgMusic.src || bgMusic.src === window.location.href) {
    alert('Add your bg_music.mp3 file to the folder and update the <audio> tag in index.html!');
    return;
  }
  if (musicOn) {
    bgMusic.pause();
    musicBtn.textContent = '🎵';
  } else {
    bgMusic.play().catch(() => {});
    musicBtn.textContent = '🔇';
  }
  musicOn = !musicOn;
});

/* ==========================
   4. SCROLL HELPERS
========================== */
function scrollToGame() {
  document.getElementById('game').scrollIntoView({ behavior: 'smooth' });
}
function scrollToWish() {
  document.getElementById('wish').scrollIntoView({ behavior: 'smooth' });
}
function scrollToCard() {
  document.getElementById('greeting-card').scrollIntoView({ behavior: 'smooth' });
}

/* ==========================
   5. LANTERN MATCHING GAME
========================== */

// Each pair has an emoji + a label for accessibility
const LANTERN_PAIRS = [
  { emoji: '🏮', label: 'Red Lantern' },
  { emoji: '🪔', label: 'Oil Lamp' },
  { emoji: '🌸', label: 'Pink Flower' },
  { emoji: '☸️', label: 'Dhamma Wheel' },
  { emoji: '🌙', label: 'Moon' },
  { emoji: '🌼', label: 'Yellow Flower' },
  { emoji: '⭐', label: 'Star' },
  { emoji: '🕯️', label: 'Candle' },
];

let gameCards   = [];
let flippedCards = [];
let matchedCount = 0;
let moves        = 0;
let score        = 0;
let timerVal     = 60;
let timerInterval= null;
let canFlip      = true;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initGame() {
  // Clear
  clearInterval(timerInterval);
  gameCards    = [];
  flippedCards = [];
  matchedCount = 0;
  moves        = 0;
  score        = 0;
  timerVal     = 60;
  canFlip      = true;

  document.getElementById('score').textContent = '0';
  document.getElementById('moves').textContent = '0';
  document.getElementById('timer').textContent = '60';
  document.getElementById('game-message').classList.add('hidden');

  // Build 8 pairs → 16 cards
  const pairs = LANTERN_PAIRS.slice(0, 8);
  const deck  = shuffle([...pairs, ...pairs].map((p, i) => ({ ...p, id: i })));
  gameCards   = deck;

  const board = document.getElementById('game-board');
  board.innerHTML = '';

  deck.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'game-card';
    cardEl.dataset.index = index;
    cardEl.dataset.emoji = card.emoji;
    cardEl.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <span class="card-hidden-symbol">🏮</span>
        </div>
        <div class="card-back" title="${card.label}">
          ${card.emoji}
        </div>
      </div>
    `;
    cardEl.addEventListener('click', () => onCardClick(cardEl));
    board.appendChild(cardEl);
  });

  // Start timer
  timerInterval = setInterval(() => {
    timerVal--;
    document.getElementById('timer').textContent = timerVal;
    if (timerVal <= 0) {
      clearInterval(timerInterval);
      showMessage('⏰', 'Time is Up!', `You matched ${matchedCount} of 8 pairs. Score: ${score}`);
    }
    if (timerVal <= 10) {
      document.getElementById('timer').style.color = '#ff4444';
    }
  }, 1000);
}

function onCardClick(cardEl) {
  if (!canFlip) return;
  if (cardEl.classList.contains('flipped')) return;
  if (cardEl.classList.contains('matched')) return;

  cardEl.classList.add('flipped');
  flippedCards.push(cardEl);

  if (flippedCards.length === 2) {
    canFlip = false;
    moves++;
    document.getElementById('moves').textContent = moves;
    checkMatch();
  }
}

function checkMatch() {
  const [a, b] = flippedCards;
  if (a.dataset.emoji === b.dataset.emoji) {
    // Match!
    setTimeout(() => {
      a.classList.add('matched');
      b.classList.add('matched');
      flippedCards = [];
      canFlip = true;
      matchedCount++;
      score += Math.max(10, 30 - moves);
      document.getElementById('score').textContent = score;

      if (matchedCount === 8) {
        clearInterval(timerInterval);
        setTimeout(() => {
          showMessage('🎉', 'You Did It!', `All lanterns matched! Score: ${score} in ${moves} moves.`);
        }, 400);
      }
    }, 400);
  } else {
    // No match — flip back
    setTimeout(() => {
      a.classList.remove('flipped');
      b.classList.remove('flipped');
      flippedCards = [];
      canFlip = true;
    }, 900);
  }
}

function showMessage(icon, title, text) {
  document.getElementById('message-icon').textContent  = icon;
  document.getElementById('message-title').textContent = title;
  document.getElementById('message-text').textContent  = text;
  document.getElementById('game-message').classList.remove('hidden');
}

/* ==========================
   6. WISH LANTERN LAUNCHER
========================== */
let selectedColor = '#FFB300';

function selectColor(btn) {
  document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedColor = btn.dataset.color;
}

function launchWish() {
  const nameEl = document.getElementById('wish-name');
  const textEl = document.getElementById('wish-text');
  const sky    = document.getElementById('wish-sky');

  const name = nameEl.value.trim();
  const wish = textEl.value.trim();

  if (!wish) {
    textEl.focus();
    textEl.style.borderColor = '#ff4444';
    setTimeout(() => textEl.style.borderColor = '', 1500);
    return;
  }

  // Build lantern element
  const lantern = document.createElement('div');
  lantern.className = 'wish-lantern';

  const w = Math.max(70, Math.min(120, wish.length * 5 + 40));
  const h = w * 1.2;

  lantern.style.cssText = `
    background: ${selectedColor};
    width:${w}px; height:${h}px;
    left:${Math.random() * 65 + 8}%;
    box-shadow: 0 0 20px ${selectedColor}88, 0 0 40px ${selectedColor}44;
  `;

  const displayText = name
    ? `<strong>${name}</strong><br/>${wish.slice(0, 50)}${wish.length > 50 ? '…' : ''}`
    : wish.slice(0, 60) + (wish.length > 60 ? '…' : '');

  lantern.innerHTML = displayText + '<div style="width:2px;height:18px;background:rgba(0,0,0,0.35);margin:4px auto 0;border-radius:2px;"></div>';

  sky.appendChild(lantern);

  // Remove after animation
  setTimeout(() => lantern.remove(), 8500);

  // Clear inputs
  textEl.value = '';
  nameEl.value = '';
}

/* ==========================
   7. GREETING CARD CREATOR (Canvas)
========================== */

let cardNameColor = '#FFD54F';
let cardNameFont  = 'Cinzel Decorative';

function selectNameColor(btn) {
  document.querySelectorAll('.nc-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  cardNameColor = btn.dataset.color;
}

function selectNameStyle(btn) {
  document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  cardNameFont = btn.dataset.style;
}

/* -------------------------------------------------------
   Load bg.jpeg once and cache it so redraws are instant
------------------------------------------------------- */
let _bgImage = null;

function loadBgImage(callback) {
  if (_bgImage) { callback(_bgImage); return; }
  const img = new Image();
  img.onload  = () => { _bgImage = img; callback(img); };
  img.onerror = () => { _bgImage = 'failed'; callback(null); };
  img.src = 'bg.jpeg';   // ← must be in the same folder as index.html
}

/* -------------------------------------------------------
   Draw everything onto the canvas
   1. bg.jpeg stretched to fill
   2. semi-transparent dark overlay so text pops
   3. decorative border + corner ornaments
   4. festival heading & Sinhala text
   5. name (large, glowing) + underline
   6. subtitle message
   7. bottom tagline
------------------------------------------------------- */
function drawCard(name, subtitle) {
  loadBgImage(img => _renderCard(img, name, subtitle));
}

function _renderCard(img, name, subtitle) {
  const canvas = document.getElementById('greeting-canvas');
  const ctx    = canvas.getContext('2d');
  const W = canvas.width;   // 900
  const H = canvas.height;  // 600

  /* ---- 1. Background: photo or fallback gradient ---- */
  if (img && img !== 'failed') {
    // Draw bg.jpeg scaled to cover the whole canvas
    const imgRatio    = img.width / img.height;
    const canvasRatio = W / H;
    let drawW, drawH, offsetX = 0, offsetY = 0;
    if (imgRatio > canvasRatio) {
      // image is wider → fit height, crop sides
      drawH   = H;
      drawW   = H * imgRatio;
      offsetX = (W - drawW) / 2;
    } else {
      // image is taller → fit width, crop top/bottom
      drawW   = W;
      drawH   = W / imgRatio;
      offsetY = (H - drawH) / 2;
    }
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  } else {
    // Fallback: draw a nice night-sky gradient if image is missing
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#030810');
    skyGrad.addColorStop(0.5, '#071535');
    skyGrad.addColorStop(1, '#0a1848');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);
    // show hint if image is missing
    ctx.font = '14px Lato, sans-serif';
    ctx.fillStyle = 'rgba(255,100,100,0.7)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚠️  bg.jpeg not found — add it to your project folder', W / 2, 30);
  }

  /* ---- 2. Dark overlay so text is always readable over photo ---- */
  const overlay = ctx.createLinearGradient(0, 0, 0, H);
  overlay.addColorStop(0,   'rgba(3,8,16,0.55)');
  overlay.addColorStop(0.5, 'rgba(3,8,16,0.30)');
  overlay.addColorStop(1,   'rgba(3,8,16,0.70)');
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, W, H);

  /* ---- 3. Decorative gold border ---- */
  ctx.strokeStyle = 'rgba(255,179,0,0.55)';
  ctx.lineWidth = 3;
  roundRect(ctx, 14, 14, W - 28, H - 28, 18);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,179,0,0.20)';
  ctx.lineWidth = 1;
  roundRect(ctx, 24, 24, W - 48, H - 48, 13);
  ctx.stroke();

  /* corner ornaments */
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,179,0,0.65)';
  ctx.font = '24px serif';
  [[38, 38], [W-38, 38], [38, H-38], [W-38, H-38]].forEach(([cx, cy]) => {
    ctx.fillText('✦', cx, cy);
  });

  /* ---- 4. Top festival heading ---- */
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 16px Lato, sans-serif';
  ctx.fillStyle = 'rgba(255,213,79,0.85)';
  ctx.fillText('✦  POSON POYA GREETINGS  ✦', W / 2, 58);

  /* ---- 5. Sinhala greeting text ---- */
  ctx.font = '24px "Noto Sans Sinhala", sans-serif';
  ctx.fillStyle = 'rgba(255,220,130,0.95)';
  ctx.fillText('පොසොන් පෝය සුභ වේවා!', W / 2, H * 0.63);

  /* ---- 6. NAME — big glowing centrepiece ---- */
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (name) {
    const nameFontSize = name.length > 22 ? 40 : name.length > 16 ? 50 : 60;
    ctx.font = `700 ${nameFontSize}px "${cardNameFont}", serif`;

    // Glow effect: draw blurred shadow first
    ctx.shadowColor  = cardNameColor;
    ctx.shadowBlur   = 32;
    ctx.fillStyle    = cardNameColor;
    ctx.fillText(name, W / 2, H * 0.46);
    ctx.shadowBlur   = 0;
    ctx.shadowColor  = 'transparent';

    // Decorative line beneath name
    const measuredW = ctx.measureText(name).width;
    const lineW     = Math.min(measuredW + 80, W * 0.72);
    const lineY     = H * 0.46 + nameFontSize / 2 + 16;
    const lineGrad  = ctx.createLinearGradient(W/2 - lineW/2, 0, W/2 + lineW/2, 0);
    lineGrad.addColorStop(0,   'rgba(0,0,0,0)');
    lineGrad.addColorStop(0.5, cardNameColor);
    lineGrad.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.moveTo(W/2 - lineW/2, lineY);
    ctx.lineTo(W/2 + lineW/2, lineY);
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 1.8;
    ctx.stroke();

  } else {
    // Placeholder when no name typed yet
    ctx.font = 'italic 28px Georgia, serif';
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillText('— Your Name Will Appear Here —', W / 2, H * 0.46);
  }

  /* ---- 7. Subtitle / personal message ---- */
  if (subtitle) {
    ctx.font = '20px Lato, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText(subtitle, W / 2, H * 0.555);
  }

  /* ---- 8. Bottom blessing tagline ---- */
  ctx.font = '14px Lato, sans-serif';
  ctx.fillStyle = 'rgba(255,179,0,0.55)';
  ctx.fillText('May the light of Dhamma guide your path  🙏', W / 2, H - 42);

  /* Show download button */
  document.getElementById('download-btn').style.display = 'inline-block';
  document.querySelector('.canvas-hint').style.display  = 'none';
}

/* ---- Public: called by Generate button ---- */
function generateCard() {
  const name     = document.getElementById('card-name').value.trim();
  const subtitle = document.getElementById('card-subtitle').value.trim();
  // Fonts may not be loaded yet; force load then draw
  document.fonts.ready.then(() => drawCard(name, subtitle));
}

/* ---- Live preview on input (lighter redraw) ---- */
function updateCardPreview() {
  const name     = document.getElementById('card-name').value.trim();
  const subtitle = document.getElementById('card-subtitle').value.trim();
  document.fonts.ready.then(() => drawCard(name, subtitle));
}

/* ---- Download as PNG ---- */
function downloadCard() {
  const canvas = document.getElementById('greeting-canvas');
  const link   = document.createElement('a');
  const name   = document.getElementById('card-name').value.trim() || 'poson-card';
  link.download = `poson-greeting-${name.replace(/\s+/g,'-')}.png`;
  link.href     = canvas.toDataURL('image/png');
  link.click();
}

/* Helper: rounded rectangle path */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/* Draw empty card on page load so preview isn't blank */
window.addEventListener('load', () => {
  document.fonts.ready.then(() => drawCard('', ''));
});

function setupScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.about-card').forEach(card => {
    card.style.cssText += 'opacity:0; transform:translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease;';
    observer.observe(card);
  });
}

/* ==========================
   8. INIT ON LOAD
========================== */
window.addEventListener('DOMContentLoaded', () => {
  createStars();
  createDecoLanterns();
  initGame();
  setupScrollAnimations();
});