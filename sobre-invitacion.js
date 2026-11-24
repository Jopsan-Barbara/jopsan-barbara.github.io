(() => {
  'use strict';

  const intro = document.getElementById('sobre-intro');
  const openButton = document.getElementById('sobre-abrir');
  const musicButton = document.getElementById('sobre-musica-activar');
  const replay = document.getElementById('sobre-repetir');
  if (!intro || !openButton || !replay) return;

  // Sobre y Herbario son el mismo documento: la canción no se corta al avanzar.
  const otherElements = Array.from(document.body.children).filter(
    element => element !== intro && element !== replay && element.tagName !== 'SCRIPT'
  );
  const focusAfter = document.querySelector('.nav-link') || document.querySelector('.skip-link');
  const REVEAL_AT = 2530;
  const FINISH_AT = 3770;

  let revealTimer = null;
  let finishTimer = null;
  let opening = false;

  function clearTimers() {
    if (revealTimer !== null) window.clearTimeout(revealTimer);
    if (finishTimer !== null) window.clearTimeout(finishTimer);
    revealTimer = null;
    finishTimer = null;
  }

  function blockSite(blocked) {
    otherElements.forEach(element => { element.inert = blocked; });
    document.body.classList.toggle('sobre-bloqueado', blocked);
    document.documentElement.classList.toggle('sobre-bloqueado-html', blocked);
  }

  function showIntro() {
    clearTimers();
    opening = false;
    intro.hidden = false;
    intro.classList.remove('is-opening', 'is-revealing', 'is-complete');
    document.body.classList.remove('sobre-entrada-activa');
    replay.hidden = true;
    window.scrollTo({ top: 0, behavior: 'instant' });
    blockSite(true);
    if (window.SobreMusica) window.SobreMusica.setHerbario(false);
    openButton.disabled = false;
    openButton.focus({ preventScroll: true });
  }

  function closeIntro(withEntrance = true) {
    clearTimers();
    if (!withEntrance) document.body.classList.remove('sobre-entrada-activa');
    intro.hidden = true;
    intro.classList.remove('is-opening', 'is-revealing', 'is-complete');
    openButton.disabled = false;
    opening = false;
    blockSite(false);
    replay.hidden = false;
    replay.textContent = 'Volver al inicio y escuchar';
    if (window.SobreMusica) window.SobreMusica.setHerbario(true);
    if (focusAfter) focusAfter.focus({ preventScroll: true });
  }

  function beginOpening() {
    if (opening) return;
    // El primer toque en el sello también habilita el audio cuando autoplay falla.
    if (window.SobreMusica) window.SobreMusica.playFromGesture();
    opening = true;
    openButton.disabled = true;

    // Accesibilidad: sin flashes, ampliaciones ni movimiento forzado.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      closeIntro(false);
      return;
    }

    // Primero el sello, luego la carta, finalmente se descubre la web.
    document.body.classList.add('sobre-entrada-activa');
    intro.classList.add('is-opening');
    revealTimer = window.setTimeout(() => {
      intro.classList.add('is-revealing');
    }, REVEAL_AT);
    finishTimer = window.setTimeout(() => closeIntro(true), FINISH_AT);
  }

  openButton.addEventListener('click', beginOpening);
  replay.addEventListener('click', () => {
    showIntro();
    // Solo se vuelve a reproducir al regresar voluntariamente al inicio.
    if (window.SobreMusica) window.SobreMusica.resetAndPlay();
  });

  window.addEventListener('pageshow', event => {
    if (event.persisted) showIntro();
  });
  intro.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeIntro(false);
    }
    if (event.key === 'Tab' && !opening) {
      const first = openButton;
      const last = musicButton && !musicButton.disabled ? musicButton : openButton;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  blockSite(true);
  openButton.focus({ preventScroll: true });
})();
