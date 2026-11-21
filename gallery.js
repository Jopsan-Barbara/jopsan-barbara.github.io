/* Carrusel de recuerdos: fotos originales, navegación manual y avance automático pausado al interactuar. */
(() => {
  const viewport = document.getElementById('memories-viewport');
  const track = document.getElementById('memories-track');
  const prev = document.getElementById('memories-prev');
  const next = document.getElementById('memories-next');
  const counter = document.getElementById('memories-counter');
  if (!viewport || !track) return;

  const memories = Array.isArray(window.JB_GALLERY_PHOTOS) ? window.JB_GALLERY_PHOTOS : [];
  if (memories.length) {
    const fragment = document.createDocumentFragment();
    memories.forEach((photo, i) => {
      const frame = document.createElement('figure');
      frame.className = 'memory-slide';
      frame.setAttribute('role', 'group');
      frame.setAttribute('aria-roledescription', 'fotografía');
      frame.setAttribute('aria-label', (i + 1) + ' de ' + memories.length);
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.alt || ('Recuerdo de Jopsan y Bárbara, fotografía ' + (i + 1));
      img.style.objectPosition = photo.position || 'center';
      img.loading = i < 3 ? 'eager' : 'lazy';
      img.decoding = 'async';
      frame.append(img);
      fragment.append(frame);
    });
    track.replaceChildren(fragment);
  }

  const slides = Array.from(track.children);
  let current = 0;
  let interval = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canCycle = slides.length > 1;
  const motion = reducedMotion ? 'auto' : 'smooth';

  if (!canCycle) {
    if (prev) prev.hidden = true;
    if (next) next.hidden = true;
    return;
  }

  const updateCounter = () => {
    if (!counter) return;
    counter.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    counter.setAttribute('aria-label', 'Fotografía ' + (current + 1) + ' de ' + slides.length);
  };
  const show = (index, behavior = motion) => {
    current = (index + slides.length) % slides.length;
    updateCounter();
    const slide = slides[current];
    const offset = slide.offsetLeft - track.offsetLeft - (viewport.clientWidth - slide.clientWidth) / 2;
    viewport.scrollTo({ left: Math.max(0, offset), behavior });
  };
  const stop = () => { if (interval) clearInterval(interval); interval = null; };
  const start = () => {
    if (reducedMotion || interval || document.hidden) return;
    interval = setInterval(() => show(current + 1, current === slides.length - 1 ? 'auto' : motion), 4600);
  };
  prev?.addEventListener('click', () => { stop(); show(current - 1); });
  next?.addEventListener('click', () => { stop(); show(current + 1); });
  viewport.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    stop();
    show(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  // El contador también refleja las fotografías desplazadas manualmente.
  let scrolling = false;
  viewport.addEventListener('scroll', () => {
    if (scrolling) return;
    scrolling = true;
    requestAnimationFrame(() => {
      scrolling = false;
      const center = viewport.scrollLeft + viewport.clientWidth / 2;
      let closest = current;
      let distance = Infinity;
      slides.forEach((slide, i) => {
        const x = slide.offsetLeft - track.offsetLeft + slide.clientWidth / 2;
        const d = Math.abs(x - center);
        if (d < distance) { distance = d; closest = i; }
      });
      current = closest;
      updateCounter();
    });
  }, { passive: true });
  show(0, 'auto');
  viewport.addEventListener('mouseenter', stop);
  viewport.addEventListener('mouseleave', start);
  viewport.addEventListener('focusin', stop);
  viewport.addEventListener('focusout', start);
  viewport.addEventListener('touchstart', stop, { passive: true });
  viewport.addEventListener('touchend', () => { if (!reducedMotion) start(); }, { passive: true });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting ? start() : stop()), {threshold: .1});
    observer.observe(viewport);
  } else {
    start();
  }
})();
