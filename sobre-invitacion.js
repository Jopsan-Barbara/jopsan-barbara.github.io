(() => {
  'use strict';

  const intro = document.getElementById('sobre-intro');
  const openButton = document.getElementById('sobre-abrir');
  const skipButton = document.getElementById('sobre-omitir');
  const musicButton = document.getElementById('sobre-musica-activar');
  const replay = document.getElementById('sobre-repetir');
  if (!intro || !openButton || !skipButton || !replay) return;

  // Sobre y Herbario están en este mismo documento: no navegar a otra URL.
  // Así el elemento <audio> sigue vivo durante todo el recorrido.
  const otherElements = Array.from(document.body.children).filter(
    element => element !== intro && element !== replay && element.tagName !== 'SCRIPT'
  );
  const focusAfter = document.querySelector('.nav-link') || document.querySelector('.skip-link');
  let timer = null;
  let stageTimer = null;
  let opening = false;

  function clearTimers() {
    window.clearTimeout(timer);
    window.clearTimeout(stageTimer);
    timer = null;
    stageTimer = null;
  }

  function setBackgroundBlocked(blocked) {
    otherElements.forEach(element => { element.inert = blocked; });
    document.body.classList.toggle('sobre-bloqueado', blocked);
    document.documentElement.classList.toggle('sobre-bloqueado-html', blocked);
  }

  function showIntro() {
    clearTimers();
    opening = false;
    intro.hidden = false;
    intro.classList.remove('is-opening', 'is-complete');
    replay.hidden = true;
    window.scrollTo({ top: 0, behavior: 'instant' });
    setBackgroundBlocked(true);
    if (window.SobreMusica) window.SobreMusica.setHerbario(false);
    openButton.disabled = false;
    openButton.focus({ preventScroll: true });
  }

  function closeIntro() {
    clearTimers();
    intro.hidden = true;
    intro.classList.remove('is-opening', 'is-complete');
    openButton.disabled = false;
    opening = false;
    setBackgroundBlocked(false);
    replay.hidden = false;
    replay.textContent = 'Volver al inicio y escuchar';
    if (window.SobreMusica) window.SobreMusica.setHerbario(true);
    if (focusAfter) focusAfter.focus({ preventScroll: true });
  }

  function beginOpening() {
    if (opening) return;
    // El toque en el sello puede habilitar la música en Safari/Chrome.
    // Nunca la silenciamos ni la detenemos por abrir el sobre.
    if (window.SobreMusica) window.SobreMusica.playFromGesture();
    opening = true;
    openButton.disabled = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      closeIntro();
      return;
    }
    intro.classList.add('is-opening');
    stageTimer = window.setTimeout(() => intro.classList.add('is-complete'), 3030);
    timer = window.setTimeout(closeIntro, 3730);
  }

  openButton.addEventListener('click', beginOpening);
  skipButton.addEventListener('click', () => {
    if (window.SobreMusica) window.SobreMusica.playFromGesture();
    closeIntro();
  });
  replay.addEventListener('click', () => {
    // La repetición SOLO ocurre al elegir volver al inicio.
    showIntro();
    if (window.SobreMusica) window.SobreMusica.resetAndPlay();
  });

  window.addEventListener('pageshow', event => {
    if (event.persisted) showIntro();
  });
  intro.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeIntro();
    }
    if (event.key === 'Tab' && !opening) {
      const first = openButton;
      const last = musicButton && !musicButton.disabled ? musicButton : skipButton;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  setBackgroundBlocked(true);
  openButton.focus({ preventScroll: true });
})();
