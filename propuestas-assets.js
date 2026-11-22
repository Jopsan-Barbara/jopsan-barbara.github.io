/* Recursos del carrusel en las cuatro vistas previas.
   Se usan las mismas fotografías de la web principal. */
(() => {
  if (!Array.isArray(window.JB_GALLERY_PHOTOS)) return;
  window.JB_GALLERY_PHOTOS.forEach(photo => {
    if (typeof photo.src === 'string' && photo.src.startsWith('assets/')) {
      photo.src = new URL('../' + photo.src, document.baseURI).href;
    }
  });
})();
