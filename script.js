// ─── DATA ───
const PRODUCTS = [
  { id: 1, name: 'Silhouette Overcoat', brand: 'AETHER', price: 580, category: 'outerwear', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop' },
  { id: 2, name: 'Structured Blazer', brand: 'AETHER', price: 420, category: 'outerwear', image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&auto=format&fit=crop' },
  { id: 3, name: 'Linen Button-Down', brand: 'AETHER', price: 190, category: 'tops', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop' },
  { id: 4, name: 'Relaxed Trousers', brand: 'AETHER', price: 260, category: 'bottoms', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop' },
  { id: 5, name: 'Slim Merino Knit', brand: 'AETHER', price: 210, category: 'tops', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop' },
  { id: 6, name: 'Wool Pleated Skirt', brand: 'AETHER', price: 320, category: 'bottoms', image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&auto=format&fit=crop' },
  { id: 7, name: 'Leather Chelsea Boots', brand: 'AETHER', price: 490, category: 'footwear', image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&auto=format&fit=crop' },
  { id: 8, name: 'Minimal Leather Sneaker', brand: 'AETHER', price: 350, category: 'footwear', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop' },
  { id: 9, name: 'Cashmere Scarf', brand: 'AETHER', price: 180, category: 'accessories', image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&auto=format&fit=crop' },
  { id: 10, name: 'Leather Crossbody', brand: 'AETHER', price: 420, category: 'accessories', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop' },
  { id: 11, name: 'Oversized Denim Jacket', brand: 'AETHER', price: 340, category: 'outerwear', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop' },
  { id: 12, name: 'Cargo Pants', brand: 'AETHER', price: 280, category: 'bottoms', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop' },
];

let cart = [];
let currentFilter = 'all';
let currentSort = 'featured';

// ─── DOM REFS ───
const grid = document.getElementById('productsGrid');
const cartDrawer = document.getElementById('cartDrawer');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.querySelector('.cart-count');
const searchOverlay = document.getElementById('searchOverlay');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const sortSelect = document.getElementById('sortSelect');

// ─── RENDER PRODUCTS ───
function renderProducts() {
  let filtered = currentFilter === 'all'
    ? [...PRODUCTS]
    : PRODUCTS.filter(p => p.category === currentFilter);

  switch (currentSort) {
    case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
    case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
    case 'newest': filtered.reverse(); break;
    default: break;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="product-card" data-id="${p.id}">
      <img src="${p.image}" alt="${p.name}" loading="lazy" />
      <div class="product-overlay"></div>
      <div class="product-info">
        <div class="product-brand">${p.brand}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price">$${p.price}</div>
      </div>
      <button class="product-add" data-id="${p.id}" aria-label="Add to cart">+</button>
    </div>
  `).join('');

  // Re-trigger animation
  document.querySelectorAll('.product-card').forEach((el, i) => {
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = `fadeUp 0.6s ease forwards`;
    el.style.animationDelay = `${(i % 8) * 0.05 + 0.05}s`;
  });
}

// ─── CART ───
function updateCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  cartCount.textContent = count;
  cartCount.classList.toggle('visible', count > 0);

  if (!cartDrawer.classList.contains('open')) return renderCartItems();
  renderCartItems();
}

function renderCartItems() {
  if (!cart.length) {
    cartItems.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    cartTotal.textContent = '$0';
    return;
  }

  cartItems.innerHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}" />
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price}</div>
        <div class="cart-item-qty">
          <button data-idx="${idx}" data-dir="-1">−</button>
          <span>${item.qty}</span>
          <button data-idx="${idx}" data-dir="1">+</button>
        </div>
        <button class="cart-item-remove" data-idx="${idx}">Remove</button>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  cartTotal.textContent = `$${total}`;
}

function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  updateCart();

  // Haptic feedback
  cartCount.style.transform = 'scale(1.4)';
  setTimeout(() => cartCount.style.transform = '', 200);
}

function modifyCart(idx, dir) {
  const item = cart[idx];
  if (!item) return;
  item.qty += dir;
  if (item.qty <= 0) cart.splice(idx, 1);
  updateCart();
  renderCartItems(); // re-bind events
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  updateCart();
  renderCartItems();
}

// ─── EVENTS: PRODUCT GRID ───
grid.addEventListener('click', e => {
  const addBtn = e.target.closest('.product-add');
  if (addBtn) {
    e.stopPropagation();
    addToCart(Number(addBtn.dataset.id));
    return;
  }
});

// ─── EVENTS: CART ───
cartItems.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const idx = Number(btn.dataset.idx);
  if (btn.classList.contains('cart-item-remove')) return removeFromCart(idx);
  const dir = Number(btn.dataset.dir);
  if (dir) modifyCart(idx, dir);
});

document.getElementById('cartBtn').addEventListener('click', () => {
  cartDrawer.classList.add('open');
  renderCartItems();
  document.body.style.overflow = 'hidden';
});

document.getElementById('closeCart').addEventListener('click', closeCart);
cartDrawer.querySelector('.cart-backdrop').addEventListener('click', closeCart);

function closeCart() {
  cartDrawer.classList.remove('open');
  document.body.style.overflow = '';
}

// ─── EVENTS: FILTERS ───
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderProducts();
  });
});

// ─── EVENTS: SORT ───
sortSelect.addEventListener('change', () => {
  currentSort = sortSelect.value;
  renderProducts();
});

// ─── EVENTS: SEARCH ───
document.getElementById('searchBtn').addEventListener('click', () => {
  searchOverlay.classList.add('open');
  searchInput.value = '';
  searchResults.innerHTML = '';
  setTimeout(() => searchInput.focus(), 100);
  document.body.style.overflow = 'hidden';
});

document.getElementById('closeSearch').addEventListener('click', closeSearch);
searchOverlay.addEventListener('click', e => {
  if (e.target === searchOverlay) closeSearch();
});

function closeSearch() {
  searchOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase().trim();
  if (!q) { searchResults.innerHTML = ''; return; }
  const matches = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  ).slice(0, 6);
  searchResults.innerHTML = matches.map(p => `
    <div class="search-result-item" data-id="${p.id}">
      <img src="${p.image}" alt="${p.name}" />
      <div>
        <div>${p.name}</div>
        <span>$${p.price}</span>
      </div>
    </div>
  `).join('');
});

searchResults.addEventListener('click', e => {
  const item = e.target.closest('.search-result-item');
  if (item) {
    addToCart(Number(item.dataset.id));
    closeSearch();
  }
});

// ─── HIDE NAV ON SCROLL DOWN ───
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const current = window.scrollY;
  const nav = document.querySelector('.navbar');
  if (current > lastScroll && current > 100) {
    nav.classList.add('hidden');
  } else {
    nav.classList.remove('hidden');
  }
  lastScroll = current;
});

// ─── KEYBOARD ───
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (searchOverlay.classList.contains('open')) closeSearch();
    if (cartDrawer.classList.contains('open')) closeCart();
  }
});

// ─── MUSIC PLAYER ───
const PLAYLIST = [
  { title: 'Blinding Lights', artist: 'The Weeknd', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', art: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2d6e?w=120&h=120&fit=crop&crop=center' },
  { title: 'Levitating', artist: 'Dua Lipa', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', art: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&h=120&fit=crop&crop=center' },
  { title: 'Montero', artist: 'Lil Nas X', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', art: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&h=120&fit=crop&crop=center' },
  { title: 'Good 4 U', artist: 'Olivia Rodrigo', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', art: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=120&h=120&fit=crop&crop=center' },
  { title: 'Kiss Me More', artist: 'Doja Cat', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', art: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&h=120&fit=crop&crop=center' },
  { title: 'Peaches', artist: 'Justin Bieber', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', art: 'https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=120&h=120&fit=crop&crop=center' },
  { title: 'Save Your Tears', artist: 'The Weeknd', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', art: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=120&h=120&fit=crop&crop=center' },
  { title: 'Butter', artist: 'BTS', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', art: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&h=120&fit=crop&crop=center' },
];

let currentTrack = 0;
let isShuffled = false;
let shuffleOrder = [];
let audio = new Audio();
let isPlaying = false;

const player = document.getElementById('musicPlayer');
const playerArt = document.getElementById('playerArt');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const closePlayer = document.getElementById('closePlayer');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const progressFill = document.getElementById('progressFill');
const progressBar = document.getElementById('progressBar');

function generateShuffleOrder() {
  const indices = Array.from({ length: PLAYLIST.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  shuffleOrder = indices;
}

function getNextIndex() {
  if (isShuffled) {
    const pos = shuffleOrder.indexOf(currentTrack);
    return shuffleOrder[(pos + 1) % shuffleOrder.length];
  }
  return (currentTrack + 1) % PLAYLIST.length;
}

function getPrevIndex() {
  if (isShuffled) {
    const pos = shuffleOrder.indexOf(currentTrack);
    return shuffleOrder[(pos - 1 + shuffleOrder.length) % shuffleOrder.length];
  }
  return (currentTrack - 1 + PLAYLIST.length) % PLAYLIST.length;
}

function loadTrack(index) {
  currentTrack = index;
  const track = PLAYLIST[index];
  playerArt.src = track.art;
  playerArt.alt = track.title;
  playerTitle.textContent = track.title;
  playerArtist.textContent = track.artist;
  audio.src = track.src;
  audio.load();
  if (isPlaying) {
    audio.play();
  }
  updatePlayIcon();
}

function updatePlayIcon() {
  document.querySelector('.play-icon').style.display = isPlaying ? 'none' : '';
  document.querySelector('.pause-icon').style.display = isPlaying ? '' : 'none';
}

function togglePlay() {
  if (!audio.src) loadTrack(currentTrack);
  if (audio.paused) {
    audio.play();
    isPlaying = true;
  } else {
    audio.pause();
    isPlaying = false;
  }
  updatePlayIcon();
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function updateProgress() {
  if (audio.duration) {
    const pct = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${pct}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  }
}

audio.addEventListener('loadedmetadata', () => {
  totalTimeEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', updateProgress);

audio.addEventListener('ended', () => {
  loadTrack(getNextIndex());
  audio.play();
});

playBtn.addEventListener('click', togglePlay);

prevBtn.addEventListener('click', () => {
  loadTrack(getPrevIndex());
  if (audio.paused && isPlaying) audio.play();
});

nextBtn.addEventListener('click', () => {
  loadTrack(getNextIndex());
  if (audio.paused && isPlaying) audio.play();
});

shuffleBtn.addEventListener('click', () => {
  isShuffled = !isShuffled;
  shuffleBtn.classList.toggle('active');
  if (isShuffled) generateShuffleOrder();
});

progressBar.addEventListener('click', (e) => {
  if (!audio.duration) return;
  const rect = progressBar.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pct * audio.duration;
});

closePlayer.addEventListener('click', () => {
  player.classList.toggle('collapsed');
});

// Start with first track loaded
loadTrack(0);

// ─── INIT ───
renderProducts();
updateCart();
initTheme();

// ─── THEME TOGGLE ───
function initTheme() {
  const saved = localStorage.getItem('aether-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcons(theme);

  document.getElementById('themeToggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('aether-theme', next);
    updateThemeIcons(next);
  });
}

function updateThemeIcons(theme) {
  document.querySelector('.sun-icon').style.display = theme === 'dark' ? '' : 'none';
  document.querySelector('.moon-icon').style.display = theme === 'light' ? '' : 'none';
}