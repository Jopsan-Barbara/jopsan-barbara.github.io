(() => {
  'use strict';

  // Se utiliza el mismo MP3 local (2:30–3:09).
  // Iniciar en el segundo 3 equivale a 2:33–3:09 de la canción original.
  // No hay bucle, ni bloqueo por sesión: solo una reproducción por entrada al sobre.
  const audio = document.getElementById('sobre-musica-audio');
  const button = document.getElementById('sobre-musica-activar');
  const floating = document.getElementById('sobre-musica-flotante');
  const status = document.getElementById('sobre-musica-estado');
  if (!audio || !button || !floating || !status) return;

  const START = 3;
  const END = 39;
  const VOLUME = .82;
  let startedThisVisit = false;
  let pending = false;
  let finished = false;
  let muted = false;
  let inHerbario = false;
  let playRequest = 0;
  let cutoffTimer = null;

  audio.loop = false;
  audio.preload = 'auto';
  audio.volume = VOLUME;
  audio.muted = false;

  function note(value) {
    status.hidden = !value;
    status.textContent = value || '';
  }

  function isActive() {
    return startedThisVisit && !finished && !audio.paused && !audio.ended;
  }

  function updateControls() {
    const sounding = isActive();
    const label = finished
      ? 'Volver a escuchar'
      : sounding
        ? (muted ? 'Activar sonido' : 'Silenciar música')
        : (pending ? 'Preparando música…' : '♫ Activar música');
    button.textContent = label;
    button.disabled = pending && !sounding;
    button.setAttribute('aria-pressed', String(sounding && !muted));

    floating.hidden = !inHerbario || !sounding;
    document.body.classList.toggle('sobre-musica-sonando', inHerbario && sounding);
    floating.textContent = muted ? '♫ Activar sonido' : '♫ Silenciar música';
    floating.setAttribute('aria-pressed', String(sounding && !muted));

    const noteElement = document.getElementById('sobre-musica-nota');
    if (noteElement) {
      noteElement.textContent = finished
        ? 'Terminó · vuelve al principio para escucharla'
        : '36 segundos · sin repetición automática';
    }
  }

  function seekStart() {
    try {
      if (audio.currentTime < START - .08 || audio.currentTime >= END - .08) {
        audio.currentTime = START;
      }
    } catch (_) {}
  }

  function clearCutoff() {
    if (cutoffTimer !== null) {
      window.clearInterval(cutoffTimer);
      cutoffTimer = null;
    }
  }

  function finish() {
    if (finished) return;
    finished = true;
    pending = false;
    clearCutoff();
    audio.pause();
    audio.loop = false;
    updateControls();
    note('');
  }

  function monitorEnd() {
    if (cutoffTimer !== null) return;
    cutoffTimer = window.setInterval(() => {
      if (audio.currentTime >= END - .12 || audio.ended) finish();
    }, 150);
  }

  function tryPlayback() {
    if (finished || isActive()) return;
    // Una solicitud pendiente no debe impedir reintentar desde un gesto humano
    // cuando el primer intento fue bloqueado por el navegador.
    const id = ++playRequest;
    pending = true;
    audio.muted = muted;
    audio.volume = VOLUME;
    seekStart();
    updateControls();
    try {
      const result = audio.play();
      if (result && typeof result.then === 'function') {
        result.then(() => {
          if (id !== playRequest || finished) return;
          pending = false;
          startedThisVisit = true;
          updateControls();
          note('');
          monitorEnd();
        }).catch(() => {
          if (id !== playRequest || finished) return;
          pending = false;
          updateControls();
          note('Si tu navegador lo solicita, toca el sello o «Activar música».');
        });
      }
    } catch (_) {
      if (id !== playRequest) return;
      pending = false;
      updateControls();
      note('Toca el sello para abrir y escuchar la canción.');
    }
  }

  function resetAndPlay() {
    // Un regreso voluntario al inicio es la única acción que reinicia el fragmento.
    ++playRequest;
    clearCutoff();
    audio.pause();
    finished = false;
    startedThisVisit = false;
    pending = false;
    muted = false;
    audio.muted = false;
    audio.volume = VOLUME;
    try { audio.currentTime = START; } catch (_) {}
    updateControls();
    note('');
    // Se llama dentro del evento de clic "Volver al inicio": conserva el permiso.
    tryPlayback();
  }

  function toggleSound() {
    if (finished) {
      if (!inHerbario) resetAndPlay();
      return;
    }
    if (!isActive()) {
      tryPlayback();
      return;
    }
    muted = !muted;
    audio.muted = muted;
    updateControls();
  }

  audio.addEventListener('loadedmetadata', seekStart);
  audio.addEventListener('playing', () => {
    if (finished) { audio.pause(); return; }
    if (audio.currentTime < START - .08) seekStart();
    startedThisVisit = true;
    pending = false;
    updateControls();
    note('');
    monitorEnd();
  });
  audio.addEventListener('timeupdate', () => {
    if (!finished && audio.currentTime >= END - .12) finish();
  });
  audio.addEventListener('ended', finish);
  audio.addEventListener('error', () => {
    if (finished) return;
    pending = false;
    updateControls();
    note('No fue posible cargar el audio. Puedes activarlo con un toque.');
  });

  button.addEventListener('click', toggleSound);
  floating.addEventListener('click', toggleSound);

  if (audio.readyState === 0) audio.load();
  updateControls();

  // Autoplay es un intento, no una garantía. Se verifica la promesa play().
  // Si el navegador lo bloquea, el mismo toque para abrir el sobre activa audio.
  if (document.documentElement.classList.contains('sobre-visual-ready')) tryPlayback();
  else window.addEventListener('sobre-visual-ready', tryPlayback, { once: true });

  window.SobreMusica = {
    playFromGesture: tryPlayback,
    resetAndPlay,
    isPlaying: isActive,
    setHerbario(value) {
      inHerbario = !!value;
      updateControls();
    }
  };
})();
