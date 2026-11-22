/* Formularios visibles en la invitación, sin botones que los abran. */
(async () => {
  'use strict';
  const cutoff = Date.parse('2027-02-01T03:00:00Z');
  const closed = Date.now() >= cutoff;
  const rsvp = document.getElementById('rsvp-public');
  const song = document.getElementById('song-public');

  if (closed && rsvp) {
    const title = document.getElementById('guest-title');
    const text = document.getElementById('guest-copy');
    if (title) title.textContent = 'El tiempo para confirmar asistencia ha finalizado';
    if (text) text.textContent = 'Sin embargo, si quieres dejarnos un regalo, aún estás a tiempo de hacerlo.';
    const link = document.createElement('a');
    link.href = '#regalos';
    link.className = 'button button-dark';
    link.textContent = 'Ver regalos';
    rsvp.replaceChildren(link);
  }

  function createFrame(root, url, title, height) {
    if (!root) return null;
    const frame = document.createElement('iframe');
    frame.title = title;
    frame.src = url;
    frame.loading = 'lazy';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.setAttribute('allow', 'clipboard-write');
    frame.style.display = 'block';
    frame.style.width = '100%';
    frame.style.height = height + 'px';
    frame.style.border = '0';
    frame.style.background = '#fcf9f1';
    root.replaceChildren(frame);
    return frame;
  }

  function mountGoogleForms(root, value, isRsvp) {
    if (!root || !value) return false;
    try {
      const url = new URL(value);
      if (url.origin !== 'https://docs.google.com' ||
          !/^\/forms\/d\/(?:e\/)?[\w-]+\/viewform$/.test(url.pathname)) return false;
      url.searchParams.set('embedded', 'true');
      createFrame(root, url.href, isRsvp ? 'Confirmación de asistencia' : 'Sugerir una canción',
        isRsvp ? 820 : 610);
      return true;
    } catch (_) {
      return false;
    }
  }

  function mountAppScript(root, endpoint, kind) {
    if (!root) return;
    const nonce = (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
    const url = new URL(endpoint);
    url.searchParams.set('view', kind);
    url.searchParams.set('nonce', nonce);

    const isRsvp = kind === 'public-rsvp';
    const frame = createFrame(root, url.href,
      isRsvp ? 'Formulario de confirmación de asistencia' : 'Formulario de canciones',
      isRsvp ? 590 : 310);
    if (!frame) return;
    const notice = document.createElement('p');
    notice.className = 'form-embed-notice';
    notice.setAttribute('role', 'status');
    notice.hidden = true;
    const alternative = document.createElement('a');
    alternative.href = url.href;
    alternative.target = '_blank';
    alternative.rel = 'noopener noreferrer';
    alternative.textContent = isRsvp ? 'Abrir confirmación en otra pestaña' : 'Abrir formulario de canciones';
    alternative.hidden = true;
    alternative.className = 'form-embed-alternative';
    root.append(notice, alternative);

    let ready = false;
    const onMessage = (event) => {
      const data = event.data;
      if (!data || data.channel !== 'jb-public-form-v1' ||
          data.nonce !== nonce || data.kind !== kind || data.ready !== true) return;
      try {
        const origin = new URL(event.origin);
        const allowed = origin.protocol === 'https:' &&
          (origin.hostname === 'script.google.com' ||
           origin.hostname === 'script.googleusercontent.com' ||
           origin.hostname.endsWith('-script.googleusercontent.com') ||
           origin.hostname.endsWith('.googleusercontent.com'));
        if (!allowed) return;
      } catch (_) { return; }
      ready = true;
      notice.hidden = true;
      alternative.hidden = true;
      if (Number.isFinite(data.height)) {
        frame.style.height = Math.max(240, Math.min(1500, Math.ceil(data.height) + 26)) + 'px';
      }
    };
    window.addEventListener('message', onMessage);
    // El iframe se muestra desde el principio; solo se ofrece un enlace si la
    // integración externa no confirma que pudo cargar.
    window.setTimeout(() => {
      if (!ready) {
        notice.textContent = 'Si el formulario no se muestra correctamente, puedes abrirlo en otra pestaña.';
        notice.hidden = false;
        alternative.hidden = false;
      }
    }, 12000);
  }

  function showUnavailable(root) {
    if (!root) return;
    const text = document.createElement('p');
    text.setAttribute('role', 'status');
    text.textContent = 'El formulario no está disponible temporalmente. Inténtalo nuevamente más tarde.';
    root.replaceChildren(text);
  }

  try {
    const response = await fetch('rsvp-config.json', {cache: 'no-store'});
    if (!response.ok) throw Error('Sin configuración');
    const config = await response.json();
    const hasRsvp = closed || mountGoogleForms(rsvp, config.rsvpForm, true);
    const hasSong = mountGoogleForms(song, config.songForm, false);
    if (hasRsvp && hasSong) return;

    const endpoint = new URL(config.endpoint);
    if (endpoint.origin !== 'https://script.google.com' ||
        !/^\/macros\/s\/[\w-]+\/exec$/.test(endpoint.pathname)) throw Error('Endpoint inválido');
    if (!hasRsvp) mountAppScript(rsvp, endpoint, 'public-rsvp');
    if (!hasSong) mountAppScript(song, endpoint, 'public-song');
  } catch (_) {
    if (!closed) showUnavailable(rsvp);
    showUnavailable(song);
  }
})();
