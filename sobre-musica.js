(() => {
  'use strict';

  // Reproductor oficial, sin descargas ni reproducción oculta.
  const activate = document.getElementById('sobre-musica-activar');
  const panel = document.getElementById('sobre-musica-panel');
  const mount = document.getElementById('sobre-musica-frame');
  const stopButton = document.getElementById('sobre-musica-detener');
  const state = document.getElementById('sobre-musica-estado');
  if (!activate || !panel || !mount || !stopButton || !state) return;

  const VIDEO_ID = 'YOQGBzNCe-g';
  const START = 150; // 2:30
  const END = 189;   // 3:09
  const KEY = 'jopsan-barbara-sobre-musica-escuchada-v1';

  let consumed = false;
  try { consumed = sessionStorage.getItem(KEY) === '1'; } catch (_) {}
  let started = false;
  let loaded = false;
  let stopping = false;
  let iframe = null;
  let player = null;
  let progress = null;
  let fading = null;

  function message(text) { state.textContent = text; }
  function remember() {
    consumed = true;
    try { sessionStorage.setItem(KEY, '1'); } catch (_) {}
  }
  function lockButton() {
    activate.disabled = true;
    activate.textContent = 'La canción ya sonó';
    message('Fragmento finalizado · sin repetición');
  }
  function clearClocks() {
    if (progress !== null) { window.clearInterval(progress); progress = null; }
    if (fading !== null) { window.clearInterval(fading); fading = null; }
  }
  function ytCommand(func, args = []) {
    try {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args }), 'https://www.youtube.com');
      }
    } catch (_) {}
  }
  function safeCall(func, ...args) {
    try {
      if (player && typeof player[func] === 'function') return player[func](...args);
    } catch (_) {}
    ytCommand(func, args);
  }
  function finishPlayback() {
    if (stopping) return;
    stopping = true;
    clearClocks();
    if (started) remember();
    safeCall('stopVideo');
    panel.hidden = true;
    if (iframe) { iframe.remove(); iframe = null; }
    player = null;
    loaded = false;
    if (consumed) lockButton();
    else {
      activate.disabled = false;
      activate.textContent = 'Escuchar nuestra canción';
      message('Se reproduce una sola vez, del 2:30 al 3:09');
    }
  }

  function trackPlayback() {
    if (progress !== null) return;
    progress = window.setInterval(() => {
      if (!player || stopping) return;
      try {
        const t = player.getCurrentTime();
        if (Number.isFinite(t) && t >= END - 0.15) finishPlayback();
        else if (Number.isFinite(t) && t < START - 1 && started) player.seekTo(START, true);
      } catch (_) {}
    }, 200);
  }

  function onYTReady() {
    if (!iframe || stopping || !window.YT || typeof window.YT.Player !== 'function') return;
    try {
      player = new window.YT.Player(iframe, {
        events: {
          onReady: event => {
            if (stopping) return;
            try { event.target.setVolume(80); } catch (_) {}
            // El video puede comenzar antes de que termine de cargar la API.
            try {
              if (event.target.getPlayerState() === window.YT.PlayerState.PLAYING) {
                started = true;
                remember();
                message('Reproduciendo fragmento · 2:30–3:09');
                trackPlayback();
              }
            } catch (_) {}
          },
          onStateChange: event => {
            if (stopping) return;
            if (event.data === window.YT.PlayerState.PLAYING) {
              started = true;
              remember();
              message('Reproduciendo fragmento · 2:30–3:09');
              trackPlayback();
            } else if (event.data === window.YT.PlayerState.ENDED) {
              finishPlayback();
            }
          },
          onError: () => {
            clearClocks();
            message('No se pudo reproducir aquí. Puedes abrir la canción en YouTube.');
          }
        }
      });
    } catch (_) {}
  }

  function loadAPI() {
    if (window.YT && typeof window.YT.Player === 'function') {
      onYTReady();
      return;
    }
    const oldCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof oldCallback === 'function') oldCallback();
      onYTReady();
    };
    if (!document.querySelector('script[data-sobre-youtube-api]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.dataset.sobreYoutubeApi = 'true';
      document.head.appendChild(script);
    }
  }

  function playOnce() {
    if (consumed || stopping || loaded) return;
    loaded = true;
    activate.disabled = true;
    panel.hidden = false;
    message('Si el audio no inicia, toca Reproducir en el video.');
    const origin = encodeURIComponent(window.location.origin);
    iframe = document.createElement('iframe');
    iframe.id = 'sobre-musica-yt';
    iframe.title = 'Canción de los novios · fragmento 2:30–3:09 (YouTube)';
    iframe.width = '320';
    iframe.height = '214';
    iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.setAttribute('allowfullscreen', '');
    iframe.src = 'https://www.youtube.com/embed/' + VIDEO_ID
      + '?enablejsapi=1&autoplay=1&start=' + START + '&end=' + END
      + '&loop=0&controls=1&playsinline=1&rel=0&origin=' + origin;
    mount.replaceChildren(iframe);
    loadAPI();
  }

  function fadeAndStop() {
    if (!loaded || stopping) return;
    clearClocks();
    if (!started) {
      finishPlayback();
      return;
    }
    let startVolume = 80;
    try {
      const volume = player && typeof player.getVolume === 'function' ? player.getVolume() : 80;
      if (Number.isFinite(volume) && volume > 0) startVolume = volume;
    } catch (_) {}

    const began = performance.now();
    fading = window.setInterval(() => {
      const pct = Math.min(1, (performance.now() - began) / 1150);
      const volume = Math.max(0, Math.round(startVolume * Math.pow(1 - pct, 1.7)));
      safeCall('setVolume', volume);
      if (pct >= 1) finishPlayback();
    }, 55);
  }

  activate.addEventListener('click', playOnce);
  stopButton.addEventListener('click', () => {
    if (!started) finishPlayback();
    else fadeAndStop();
  });
  if (consumed) lockButton();

  // La apertura del sello y el botón "ir directamente" invocan este controlador.
  window.SobreMusica = { fadeAndStop, isPlaying: () => started && loaded && !stopping };
})();
