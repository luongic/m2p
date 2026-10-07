'use strict';

const SONGS = [
  { name: "There's no one at all", singer: 'Sơn Tùng M-TP', url: './assets/song/no1atall.mp3', image: './assets/img/no1atall.jpg' },
  { name: 'Đừng làm trái tim anh đau', singer: 'Sơn Tùng M-TP', url: './assets/song/dunglamtraitymanhdau.mp3', image: './assets/img/dunglamtraitymanhdau.jpg' },
  { name: 'good 4 u', singer: 'Olivia Rodrigo', url: './assets/song/good4u.mp3', image: './assets/img/good4u.jpg' },
  { name: "Driver's License", singer: 'Olivia Rodrigo', url: './assets/song/driver.mp3', image: './assets/img/driver.jpg' },
  { name: 'traitor', singer: 'Olivia Rodrigo', url: './assets/song/traitor.mp3', image: './assets/img/traitor.jpg' },
  { name: 'happier', singer: 'Olivia Rodrigo', url: './assets/song/happier.mp3', image: './assets/img/happier.jpg' },
  { name: 'Closer', singer: 'The Chainsmokers', url: './assets/song/closer.mp3', image: './assets/img/closer.jpg' },
  { name: 'Hate Me', singer: 'Ellie Goulding, Juice WRLD', url: './assets/song/hateme.mp3', image: './assets/img/hateme.jpg' },
  { name: 'Circles', singer: 'Post Malone', url: './assets/song/circles.mp3', image: './assets/img/circles.jpg' },
  { name: 'Sunflower', singer: 'Post Malone', url: './assets/song/sunflower.mp3', image: './assets/img/sunflower.jpg' },
  { name: 'Sorry', singer: 'Halsey', url: './assets/song/sorry.mp3', image: './assets/img/sorry.jpg' },
  { name: 'Without Me', singer: 'Halsey', url: './assets/song/withoutme.mp3', image: './assets/img/withoutme.jpg' },
  { name: 'Bring Me Back', singer: 'Miles Away', url: './assets/song/bringmeback.mp3', image: './assets/img/bringmeback.jpg' },
  { name: 'My City', singer: 'Miles Away', url: './assets/song/mycity.mp3', image: './assets/img/mycity.jpg' },
];

const $ = (sel) => document.querySelector(sel);

const el = {
  app: $('#app'),
  audio: $('#audio'),
  greeting: $('#greeting'),
  searchBar: $('#searchBar'),
  search: $('#search'),
  searchClear: $('#searchClear'),
  count: $('#count'),
  playAll: $('#playAll'),
  shuffleAll: $('#shuffleAll'),
  list: $('#songList'),
  empty: $('#empty'),
  miniOpen: $('#miniOpen'),
  miniThumb: $('#miniThumb'),
  miniTitle: $('#miniTitle'),
  miniArtist: $('#miniArtist'),
  miniPlay: $('#miniPlay'),
  miniNext: $('#miniNext'),
  miniBar: $('#miniBar'),
  now: $('#now'),
  nowBg: $('#nowBg'),
  nowClose: $('#nowClose'),
  art: $('#art'),
  nowTitle: $('#nowTitle'),
  nowArtist: $('#nowArtist'),
  seek: $('#seek'),
  cur: $('#cur'),
  dur: $('#dur'),
  play: $('#play'),
  prev: $('#prev'),
  next: $('#next'),
  shuffle: $('#shuffle'),
  repeat: $('#repeat'),
  volume: $('#volume'),
  vol: $('#vol'),
  mute: $('#mute'),
  upNext: $('#upNext'),
  upNextThumb: $('#upNextThumb'),
  upNextTitle: $('#upNextTitle'),
  favicon: $('link[rel="icon"]'),
  touchIcon: $('link[rel="apple-touch-icon"]'),
  themeColor: $('meta[name="theme-color"]'),
};

const audio = el.audio;
const desktop = window.matchMedia('(min-width: 900px)');
const STORE_KEY = 'm2p:state';

const state = {
  index: 0,
  upcoming: 0,
  shuffle: false,
  repeat: false,
  volume: 1,
  muted: false,
  resumeAt: 0,
  seeking: false,
  history: [],
};

/* ---------- Helpers ---------- */

const fmt = (t) => {
  if (!Number.isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

const normalize = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();

function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    if (!saved) return;
    if (Number.isInteger(saved.index) && saved.index >= 0 && saved.index < SONGS.length) {
      state.index = saved.index;
      state.resumeAt = Number(saved.time) || 0;
    }
    state.shuffle = !!saved.shuffle;
    state.repeat = !!saved.repeat;
    state.muted = !!saved.muted;
    if (Number.isFinite(saved.volume)) state.volume = Math.min(1, Math.max(0, saved.volume));
  } catch {}
}

function save() {
  try {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        index: state.index,
        time: audio.currentTime || 0,
        shuffle: state.shuffle,
        repeat: state.repeat,
        volume: state.volume,
        muted: state.muted,
      })
    );
  } catch {}
}

/* ---------- Library ---------- */

function renderList() {
  el.list.innerHTML = SONGS.map(
    (song, i) => `
      <li>
        <button class="song" type="button" data-index="${i}">
          <img class="song-thumb" src="${song.image}" alt="" width="52" height="52" loading="lazy">
          <span class="song-meta">
            <span class="song-title">${song.name}</span>
            <span class="song-artist">${song.singer}</span>
          </span>
          <span class="eq" aria-hidden="true"><span></span><span></span><span></span></span>
        </button>
      </li>`
  ).join('');
  el.count.textContent = `${SONGS.length} bài hát`;
}

function filterList(query) {
  const q = normalize(query.trim());
  let shown = 0;
  el.list.querySelectorAll('li').forEach((li, i) => {
    const song = SONGS[i];
    const match = !q || normalize(`${song.name} ${song.singer}`).includes(q);
    li.hidden = !match;
    if (match) shown++;
  });
  el.empty.hidden = shown > 0;
  el.searchClear.hidden = !query;
}

function markActive() {
  el.list.querySelectorAll('.song').forEach((btn) => {
    const on = Number(btn.dataset.index) === state.index;
    btn.classList.toggle('active', on);
    if (on) btn.setAttribute('aria-current', 'true');
    else btn.removeAttribute('aria-current');
  });
}

function greet() {
  const h = new Date().getHours();
  el.greeting.textContent =
    h < 5 ? 'Khuya rồi, nghe nhẹ thôi nhé'
    : h < 11 ? 'Chào buổi sáng'
    : h < 13 ? 'Chào buổi trưa'
    : h < 18 ? 'Chào buổi chiều'
    : 'Chào buổi tối';
}

/* ---------- Playback ---------- */

function pickUpcoming() {
  const n = SONGS.length;
  if (state.shuffle && n > 1) {
    let i;
    do i = Math.floor(Math.random() * n);
    while (i === state.index);
    state.upcoming = i;
  } else {
    state.upcoming = (state.index + 1) % n;
  }
  const song = SONGS[state.upcoming];
  el.upNextThumb.src = song.image;
  el.upNextTitle.textContent = `${song.name} · ${song.singer}`;
}

function load(index, { autoplay = false, fromHistory = false, resumeAt = 0 } = {}) {
  if (!fromHistory && index !== state.index) {
    state.history.push(state.index);
    if (state.history.length > 50) state.history.shift();
  }
  state.index = index;
  const song = SONGS[index];

  audio.src = song.url;
  if (resumeAt > 0) {
    audio.addEventListener(
      'loadedmetadata',
      () => {
        if (resumeAt < audio.duration - 2) audio.currentTime = resumeAt;
      },
      { once: true }
    );
  }

  el.miniThumb.src = song.image;
  el.art.src = song.image;
  el.art.alt = `Ảnh bìa ${song.name}`;
  el.nowBg.style.backgroundImage = `url("${song.image}")`;
  el.miniTitle.textContent = el.nowTitle.textContent = song.name;
  el.miniArtist.textContent = el.nowArtist.textContent = song.singer;
  document.title = `${song.name} · ${song.singer}`;
  el.favicon.href = el.touchIcon.href = song.image;

  setProgress(0, 0);
  markActive();
  pickUpcoming();
  updateMediaMetadata(song);
  save();

  if (autoplay) play();
}

function play() {
  const p = audio.play();
  if (p) p.catch(() => {});
}

function toggle() {
  if (audio.paused) play();
  else audio.pause();
}

function next() {
  load(state.upcoming, { autoplay: true });
}

function prev({ force = false } = {}) {
  if (!force && audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  const i =
    state.shuffle && state.history.length
      ? state.history.pop()
      : (state.index - 1 + SONGS.length) % SONGS.length;
  load(i, { autoplay: true, fromHistory: true });
}

function setProgress(cur, dur) {
  const p = dur ? cur / dur : 0;
  if (!state.seeking) {
    el.seek.value = Math.round(p * 1000);
    el.seek.style.setProperty('--p', `${p * 100}%`);
    el.cur.textContent = fmt(cur);
    el.dur.textContent = dur ? `−${fmt(dur - cur)}` : '0:00';
  }
  el.miniBar.style.setProperty('--p', p);
}

function setPlayingUI(playing) {
  el.app.classList.toggle('is-playing', playing);
  const label = playing ? 'Tạm dừng' : 'Phát';
  el.play.setAttribute('aria-label', label);
  el.miniPlay.setAttribute('aria-label', label);
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
  }
}

function reflectModes() {
  el.shuffle.classList.toggle('on', state.shuffle);
  el.shuffle.setAttribute('aria-pressed', state.shuffle);
  el.repeat.classList.toggle('on', state.repeat);
  el.repeat.setAttribute('aria-pressed', state.repeat);
}

/* ---------- Volume ---------- */

// iOS Safari ignores audio.volume (always 1); only muting works there.
const canSetVolume = (() => {
  const probe = new Audio();
  probe.volume = 0.5;
  return probe.volume === 0.5;
})();

function applyVolume() {
  audio.muted = state.muted;
  if (canSetVolume) audio.volume = state.volume;
  const level = state.muted ? 0 : state.volume;
  el.vol.value = Math.round(level * 100);
  el.vol.style.setProperty('--p', `${level * 100}%`);
  el.volume.classList.toggle('muted', level === 0);
  el.mute.setAttribute('aria-pressed', state.muted);
  el.mute.setAttribute('aria-label', state.muted ? 'Bật tiếng' : 'Tắt tiếng');
}

function setVolume(v) {
  state.volume = Math.min(1, Math.max(0, v));
  state.muted = state.volume === 0;
  applyVolume();
  save();
}

function toggleMute() {
  if (state.muted || state.volume === 0) {
    state.muted = false;
    if (state.volume === 0) state.volume = 0.5;
  } else {
    state.muted = true;
  }
  applyVolume();
  save();
}

function setupVolume() {
  el.volume.classList.toggle('fixed', !canSetVolume);
  applyVolume();

  el.vol.addEventListener('input', () => setVolume(el.vol.value / 100));
  el.mute.addEventListener('click', toggleMute);
  el.volume.addEventListener(
    'wheel',
    (e) => {
      if (!canSetVolume) return;
      e.preventDefault();
      setVolume(state.volume - Math.sign(e.deltaY) * 0.05);
    },
    { passive: false }
  );
}

/* ---------- Media Session (lock screen / headphones) ---------- */

function setupMediaSession() {
  // Safari 16.4+: mark this page as a media player rather than generic sound.
  if (navigator.audioSession) {
    try {
      navigator.audioSession.type = 'playback';
    } catch {}
  }
  if (!('mediaSession' in navigator)) return;
  const handlers = {
    play,
    pause: () => audio.pause(),
    previoustrack: () => prev(),
    nexttrack: next,
    seekto: (d) => {
      if (d.fastSeek && 'fastSeek' in audio) audio.fastSeek(d.seekTime);
      else audio.currentTime = d.seekTime;
    },
  };
  for (const [action, fn] of Object.entries(handlers)) {
    try {
      navigator.mediaSession.setActionHandler(action, fn);
    } catch {}
  }
}

function updateMediaMetadata(song) {
  if (!('mediaSession' in navigator) || !window.MediaMetadata) return;
  const src = new URL(song.image, location.href).href;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: song.name,
    artist: song.singer,
    album: 'm2p',
    artwork: [
      { src, sizes: '512x512', type: 'image/jpeg' },
      { src, sizes: '256x256', type: 'image/jpeg' },
    ],
  });
}

function updatePositionState() {
  const ms = navigator.mediaSession;
  if (!ms || !ms.setPositionState || !Number.isFinite(audio.duration)) return;
  try {
    ms.setPositionState({
      duration: audio.duration,
      playbackRate: audio.playbackRate,
      position: Math.min(audio.currentTime, audio.duration),
    });
  } catch {}
}

/* ---------- Accent color from cover art ---------- */

const canvas = document.createElement('canvas');
canvas.width = canvas.height = 24;
const ctx = canvas.getContext('2d', { willReadFrequently: true });

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h / 6, s, l];
}

function hslToRgb(h, s, l) {
  const f = (n) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
  };
  return [f(0), f(8), f(4)];
}

function applyPalette(img) {
  try {
    ctx.drawImage(img, 0, 0, 24, 24);
    const data = ctx.getImageData(0, 0, 24, 24).data;
    let r = 0, g = 0, b = 0, w = 0;
    for (let i = 0; i < data.length; i += 4) {
      const R = data[i], G = data[i + 1], B = data[i + 2];
      const max = Math.max(R, G, B);
      const min = Math.min(R, G, B);
      const sat = max ? (max - min) / max : 0;
      const lum = (max + min) / 510;
      // Favor vivid, mid-tone pixels so the accent isn't muddy.
      const weight = 0.05 + sat * sat * (1 - Math.abs(lum - 0.5) * 1.6);
      r += R * weight; g += G * weight; b += B * weight; w += weight;
    }
    const [h, s] = rgbToHsl(r / w, g / w, b / w);
    const root = document.documentElement.style;
    if (s < 0.08) {
      root.removeProperty('--accent-rgb');
      root.removeProperty('--tint-rgb');
      el.themeColor.content = '#0b0b10';
      return;
    }
    const accent = hslToRgb(h, Math.max(s, 0.6), 0.68);
    const tint = hslToRgb(h, Math.min(Math.max(s, 0.3), 0.55), 0.15);
    root.setProperty('--accent-rgb', accent.join(' '));
    root.setProperty('--tint-rgb', tint.join(' '));
    el.themeColor.content = `rgb(${tint.join(',')})`;
  } catch {
    // Canvas is tainted when opened via file:// — keep default colors.
  }
}

/* ---------- Now-playing sheet ---------- */

function isNowOpen() {
  return el.app.classList.contains('now-open');
}

function openNow() {
  if (desktop.matches || isNowOpen()) return;
  el.app.classList.add('now-open');
  el.now.inert = false;
  document.body.classList.add('locked');
  history.pushState({ m2pNow: true }, '');
}

function closeNow(fromPopState = false) {
  if (!isNowOpen()) return;
  el.app.classList.remove('now-open');
  el.now.inert = true;
  document.body.classList.remove('locked');
  if (!fromPopState && history.state && history.state.m2pNow) history.back();
}

function syncLayout() {
  if (desktop.matches) {
    if (isNowOpen()) closeNow();
    el.now.inert = false;
  } else {
    el.now.inert = !isNowOpen();
  }
}

function bindGestures() {
  let sx = 0, sy = 0, t0 = 0;
  let axis = null;
  let tracking = false;
  let onArt = false;

  el.now.addEventListener(
    'touchstart',
    (e) => {
      tracking = !desktop.matches && e.touches.length === 1 && !e.target.closest('input');
      if (!tracking) return;
      const t = e.touches[0];
      sx = t.clientX;
      sy = t.clientY;
      t0 = performance.now();
      axis = null;
      onArt = !!e.target.closest('.art-wrap');
    },
    { passive: true }
  );

  el.now.addEventListener(
    'touchmove',
    (e) => {
      if (!tracking) return;
      const t = e.touches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      if (!axis) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        axis = Math.abs(dy) > Math.abs(dx) ? 'y' : onArt ? 'x' : null;
        if (!axis) {
          tracking = false;
          return;
        }
        (axis === 'y' ? el.now : el.art).classList.add('dragging');
      }
      if (axis === 'y') {
        el.now.style.transform = `translateY(${Math.max(0, dy)}px)`;
      } else {
        el.art.style.translate = `${dx}px 0`;
        el.art.style.opacity = String(1 - Math.min(Math.abs(dx) / 320, 0.6));
      }
    },
    { passive: true }
  );

  const end = (e) => {
    if (!tracking || !axis) {
      tracking = false;
      return;
    }
    tracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - sx;
    const dy = t.clientY - sy;
    const dt = Math.max(1, performance.now() - t0);

    if (axis === 'y') {
      el.now.classList.remove('dragging');
      el.now.style.transform = '';
      if (dy > 140 || (dy > 40 && dy / dt > 0.5)) closeNow();
    } else {
      el.art.classList.remove('dragging');
      el.art.style.translate = '';
      el.art.style.opacity = '';
      if (Math.abs(dx) > 80 || (Math.abs(dx) > 30 && Math.abs(dx) / dt > 0.5)) {
        if (dx < 0) next();
        else prev({ force: true });
      }
    }
  };
  el.now.addEventListener('touchend', end);
  el.now.addEventListener('touchcancel', end);
}

/* ---------- Events ---------- */

function bindEvents() {
  let lastSave = 0;

  audio.addEventListener('play', () => {
    setPlayingUI(true);
    updatePositionState();
  });
  audio.addEventListener('pause', () => {
    setPlayingUI(false);
    updatePositionState();
    save();
  });
  audio.addEventListener('loadedmetadata', () => {
    setProgress(audio.currentTime, audio.duration);
    updatePositionState();
  });
  audio.addEventListener('seeked', updatePositionState);
  audio.addEventListener('timeupdate', () => {
    setProgress(audio.currentTime, audio.duration);
    const now = Date.now();
    if (now - lastSave > 5000) {
      lastSave = now;
      save();
    }
  });
  audio.addEventListener('ended', () => {
    if (state.repeat) {
      audio.currentTime = 0;
      play();
    } else {
      next();
    }
  });

  el.seek.addEventListener('input', () => {
    state.seeking = true;
    const p = el.seek.value / 1000;
    const d = audio.duration || 0;
    el.seek.style.setProperty('--p', `${p * 100}%`);
    el.cur.textContent = fmt(p * d);
    el.dur.textContent = d ? `−${fmt(d - p * d)}` : '0:00';
  });
  el.seek.addEventListener('change', () => {
    if (audio.duration) audio.currentTime = (el.seek.value / 1000) * audio.duration;
    state.seeking = false;
  });

  el.play.addEventListener('click', toggle);
  el.miniPlay.addEventListener('click', toggle);
  el.next.addEventListener('click', next);
  el.miniNext.addEventListener('click', next);
  el.prev.addEventListener('click', () => prev());
  el.upNext.addEventListener('click', next);

  el.shuffle.addEventListener('click', () => {
    state.shuffle = !state.shuffle;
    reflectModes();
    pickUpcoming();
    save();
  });
  el.repeat.addEventListener('click', () => {
    state.repeat = !state.repeat;
    reflectModes();
    save();
  });

  el.playAll.addEventListener('click', () => {
    state.shuffle = false;
    reflectModes();
    load(0, { autoplay: true });
  });
  el.shuffleAll.addEventListener('click', () => {
    state.shuffle = true;
    reflectModes();
    load(Math.floor(Math.random() * SONGS.length), { autoplay: true });
  });

  el.list.addEventListener('click', (e) => {
    const btn = e.target.closest('.song');
    if (!btn) return;
    const i = Number(btn.dataset.index);
    if (i !== state.index) load(i, { autoplay: true });
    else if (audio.paused) play();
    else openNow();
  });

  el.search.addEventListener('input', () => filterList(el.search.value));
  el.searchClear.addEventListener('click', () => {
    el.search.value = '';
    filterList('');
    el.search.focus();
  });

  el.miniOpen.addEventListener('click', openNow);
  el.nowClose.addEventListener('click', () => closeNow());
  window.addEventListener('popstate', () => closeNow(true));
  desktop.addEventListener('change', syncLayout);

  el.art.addEventListener('load', () => applyPalette(el.art));

  window.addEventListener(
    'scroll',
    () => el.searchBar.classList.toggle('stuck', window.scrollY > 70),
    { passive: true }
  );

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') save();
  });
  window.addEventListener('pagehide', save);

  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input')) return;
    switch (e.key) {
      case ' ':
        if (e.target.closest('button')) return;
        e.preventDefault();
        toggle();
        break;
      case 'ArrowRight':
        if (e.shiftKey) next();
        else audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
        break;
      case 'ArrowLeft':
        if (e.shiftKey) prev({ force: true });
        else audio.currentTime = Math.max(0, audio.currentTime - 5);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        if (!canSetVolume) return;
        e.preventDefault();
        setVolume(state.volume + (e.key === 'ArrowUp' ? 0.05 : -0.05));
        break;
      case 'm':
      case 'M':
        toggleMute();
        break;
      case 'Escape':
        closeNow();
        break;
    }
  });
}

/* ---------- Start ---------- */

loadSaved();
renderList();
reflectModes();
greet();
setupMediaSession();
setupVolume();
bindEvents();
bindGestures();
syncLayout();
load(state.index, { resumeAt: state.resumeAt });
