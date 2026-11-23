(() => {
  'use strict';

  // El MP3 alojado en GitHub cubre 2:30–3:09. Iniciamos a los 3 s:
  // lo que escucha el invitado equivale a 2:33–3:09 (36 segundos).
  const audio = document.getElementById('sobre-musica-audio');
  const button = document.getElementById('sobre-musica-activar');
  const status = document.getElementById('sobre-musica-estado');
  if (!audio || !button || !status) return;

  const SESSION_KEY = 'jopsan-barbara-cancion-sobre-0233-v3';
  const CLIP_START = 3;
  const CLIP_END = 39;
  const DEFAULT_VOLUME = .82;
  const FADE_MS = 1200;

  let consumed = false;
  let started = false;
  let pending = false;
  let fading = false;
  let stopping = false;
  let fadeFrame = null;
  let interval = null;

  try { consumed = sessionStorage.getItem(SESSION_KEY) === '1'; } catch (_) {}
  audio.loop = false;
  audio.preload = 'auto';
  audio.volume = DEFAULT_VOLUME;
  audio.muted = false;

  function message(text) {
    status.hidden = !text;
    status.textContent = text || '';
  }

  function remember() {
    if (consumed) return;
    consumed = true;
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (_) {}
  }

  function updateButton() {
    if (stopping || (consumed && !started)) {
      button.disabled = true;
      button.textContent = 'Canción finalizada';
      button.setAttribute('aria-pressed', 'false');
    } else if (started && !audio.paused) {
      button.disabled = false;
      button.textContent = audio.muted ? 'Activar sonido' : 'Silenciar música';
      button.setAttribute('aria-pressed', String(!audio.muted));
    } else {
      button.disabled = false;
      button.textContent = '♫ Activar música';
      button.setAttribute('aria-pressed', 'false');
    }
  }

  function stopNow() {
    if (fadeFrame !== null) cancelAnimationFrame(fadeFrame);
    fadeFrame = null;
    if (interval !== null) clearInterval(interval);
    interval = null;
    fading = false;
    pending = false;
    started = false;
    stopping = true;
    audio.pause();
    audio.loop = false;
    audio.muted = false;
    audio.volume = DEFAULT_VOLUME;
    updateButton();
    message('');
  }

  function fadeAndStop() {
    if (stopping || fading) return;
    if (audio.paused || !started) {
      stopping = true;
      stopNow();
      return;
    }
    fading = true;
    const initial = audio.volume;
    const start = performance.now();
    function tick(now) {
      if (!fading) return;
      const fraction = Math.min(1, (now - start) / FADE_MS);
      audio.volume = Math.max(0, initial * Math.pow(1 - fraction, 1.65));
      if (fraction >= 1 || audio.paused || audio.ended) stopNow();
      else fadeFrame = requestAnimationFrame(tick);
    }
    fadeFrame = requestAnimationFrame(tick);
  }

  function startAtCut() {
    // Nunca reproducir la introducción descartada, ni el resto del tema.
    try {
      if (audio.currentTime < CLIP_START || audio.currentTime >= CLIP_END) {
        audio.currentTime = CLIP_START;
      }
    } catch (_) {}
  }

  audio.addEventListener('loadedmetadata', startAtCut);
  audio.addEventListener('playing', () => {
    if (stopping || fading) return;
    // En conexiones lentas puede empezar un instante antes de terminar el seek.
    // Ajustamos al segundo 3 y registramos igualmente el estado "reproduciendo".
    if (audio.currentTime < CLIP_START - .2) startAtCut();
    pending = false;
    started = true;
    remember();
    updateButton();
    message('');
    if (interval === null) {
      interval = setInterval(() => {
        if (!stopping && audio.currentTime >= CLIP_END - .12) stopNow();
      }, 180);
    }
  });

  audio.addEventListener('timeupdate', () => {
    if (audio.currentTime >= CLIP_END - .12 && !stopping) stopNow();
  });
  audio.addEventListener('ended', stopNow);
  audio.addEventListener('error', () => {
    if (stopping) return;
    pending = false;
    if (!consumed) {
      updateButton();
      message('No se pudo cargar la canción. Toca «Activar música» para reintentar.');
    }
  });

  function attemptPlay() {
    if (consumed || stopping || pending || started) return;
    pending = true;
    button.disabled = true;
    audio.muted = false;
    audio.volume = DEFAULT_VOLUME;
    startAtCut();
    let promise;
    try {
      promise = audio.play();
    } catch (_) {
      pending = false;
      updateButton();
      message('Tu navegador solicita un toque para activar la música.');
      return;
    }
    if (promise && typeof promise.then === 'function') {
      promise.catch(() => {
        if (stopping || started || consumed) return;
        pending = false;
        updateButton();
        message('Toca «Activar música» para escuchar nuestra canción.');
      });
    }
  }

  button.addEventListener('click', () => {
    if (stopping || (consumed && !started)) return;
    if (started) {
      audio.muted = !audio.muted;
      updateButton();
      message('');
      return;
    }
    if (!pending) attemptPlay();
  });

  // Se intenta de forma automática. Chrome, Safari y móviles pueden bloquear
  // el sonido hasta recibir un gesto real; el botón anterior es el respaldo.
  if (consumed) {
    stopping = true;
    updateButton();
  } else {
    updateButton();
    if (audio.readyState === 0) audio.load();
    attemptPlay();
  }

  // El control del sobre invoca un fade-out de 1,2 s al comenzar la apertura.
  window.SobreMusica = {
    fadeAndStop,
    isPlaying: () => !stopping && !audio.paused && !audio.ended
  };
})();
