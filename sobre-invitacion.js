(() => {
  'use strict';
  const intro = document.getElementById('sobre-intro');
  const openButton = document.getElementById('sobre-abrir');
  const skipButton = document.getElementById('sobre-omitir');
  const replay = document.getElementById('sobre-repetir');
  if (!intro || !openButton || !skipButton || !replay) return;

  const otherElements = Array.from(document.body.children).filter(
    element => element !== intro && element !== replay && element.tagName !== 'SCRIPT'
  );
  const focusAfter = document.querySelector('.nav-link') || document.querySelector('.skip-link');
  let timer = null;
  let stageTimer = null;
  let opening = false;

  function setBackgroundBlocked(blocked) {
    otherElements.forEach(element => { element.inert = blocked; });
    document.body.classList.toggle('sobre-bloqueado', blocked);
    document.documentElement.classList.toggle('sobre-bloqueado-html', blocked);
  }

  function showIntro() {
    window.clearTimeout(timer);
    window.clearTimeout(stageTimer);
    opening = false;
    intro.hidden = false;
    intro.classList.remove('is-opening', 'is-complete');
    replay.hidden = true;
    window.scrollTo({ top: 0, behavior: 'instant' });
    setBackgroundBlocked(true);
    openButton.disabled = false;
    openButton.focus({ preventScroll: true });
  }

  function closeIntro() {
    window.clearTimeout(timer);
    window.clearTimeout(stageTimer);
    intro.hidden = true;
    intro.classList.remove('is-opening', 'is-complete');
    openButton.disabled = false;
    opening = false;
    setBackgroundBlocked(false);
    replay.hidden = false;
    if (focusAfter) focusAfter.focus({ preventScroll: true });
  }

  function openIntro() {
    if (opening) return;
    opening = true;
    openButton.disabled = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      closeIntro();
      return;
    }
    intro.classList.add('is-opening');
    stageTimer = window.setTimeout(() => intro.classList.add('is-complete'), 2660);
    timer = window.setTimeout(closeIntro, 3420);
  }

  openButton.addEventListener('click', openIntro);
  skipButton.addEventListener('click', closeIntro);
  replay.addEventListener('click', showIntro);
  intro.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeIntro();
    }
    if (event.key === 'Tab' && !opening) {
      const first = openButton;
      const last = skipButton;
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
