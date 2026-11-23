(() => {
  'use strict';

  // Fragmento MP3 aportado por los novios. Ya está recortado a 2:30–3:09.
  // Reproducción mediante interacción del invitado, sin YouTube ni bucles.
  const button = document.getElementById('sobre-musica-activar');
  const status = document.getElementById('sobre-musica-estado');
  const audio = document.getElementById('sobre-musica-audio');
  if (!button || !status || !audio) return;

  const SESSION_KEY = 'jopsan-barbara-sobre-cancion-escuchada-v2';
  const START_VOLUME = 0.82;
  const FADE_DURATION_MS = 1200;
  let consumed = false;
  let playing = false;
  let pending = false;
  let fading = false;
  let fadeFrame = null;

  try { consumed = sessionStorage.getItem(SESSION_KEY) === '1'; } catch (_) {}

  audio.loop = false;
  audio.volume = START_VOLUME;

  function remember() {
    consumed = true;
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (_) {}
  }

  function setStatus(message) {
    status.hidden = !message;
    status.textContent = message || '';
  }

  function lockButton() {
    button.disabled = true;
    button.setAttribute('aria-pressed', 'false');
    button.textContent = 'La canción ya sonó';
    setStatus('Gracias por escuchar nuestra canción.');
  }

  function stopNow() {
    if (fadeFrame !== null) {
      cancelAnimationFrame(fadeFrame);
      fadeFrame = null;
    }
    fading = false;
    pending = false;
    playing = false;
    audio.pause();
    audio.volume = START_VOLUME;
    if (consumed) lockButton();
    else {
      button.disabled = false;
      button.textContent = '♫ Escuchar nuestra canción';
      button.setAttribute('aria-pressed', 'false');
      setStatus('');
    }
  }

  function fadeAndStop() {
    if (fading) return;
    if (!playing) {
      if (pending) stopNow();
      return;
    }
    fading = true;
    const startVolume = Math.max(0, audio.volume);
    const startedAt = performance.now();
    const reduceVolume = now => {
      if (!fading) return;
      const progress = Math.min(1, (now - startedAt) / FADE_DURATION_MS);
      audio.volume = Math.max(0, startVolume * (1 - progress) ** 1.65);
      if (progress >= 1 || audio.paused || audio.ended) stopNow();
      else fadeFrame = requestAnimationFrame(reduceVolume);
    };
    fadeFrame = requestAnimationFrame(reduceVolume);
  }

  audio.addEventListener('playing', () => {
    if (fading) return;
    pending = false;
    playing = true;
    remember();
    button.disabled = false;
    button.textContent = 'Silenciar la canción';
    button.setAttribute('aria-pressed', 'true');
    setStatus('Reproduciendo · 2:30 a 3:09');
  });

  audio.addEventListener('ended', stopNow);
  audio.addEventListener('error', () => {
    stopNow();
    if (!consumed) setStatus('No fue posible cargar el audio. Puedes volver a intentarlo.');
  });

  button.addEventListener('click', () => {
    if (playing) { fadeAndStop(); return; }
    if (consumed || pending || fading) return;
    pending = true;
    button.disabled = true;
    setStatus('Cargando nuestra canción…');
    audio.volume = START_VOLUME;
    try { audio.currentTime = 0; } catch (_) {}
    const result = audio.play();
    if (result && typeof result.catch === 'function') {
      result.catch(() => {
        if (consumed) return;
        pending = false;
        button.disabled = false;
        button.textContent = '♫ Escuchar nuestra canción';
        setStatus('Toca «Escuchar nuestra canción» para activar el audio.');
      });
    }
  });

  if (consumed) lockButton();

  // El otro script detiene la música al abrir el sello o saltar el sobre.
  window.SobreMusica = { fadeAndStop, isPlaying: () => playing && !audio.paused };
})();
