/* Formularios de la invitación: presentación nativa Oliva.
   Envío mediante POST a Apps Script en un iframe técnico oculto,
   con acuse explícito del servidor. Nunca confirmamos un registro
   basándonos solo en que el formulario fue enviado. */
(() => {
  'use strict';
  const forms = Array.from(document.querySelectorAll('form.wedding-form[data-kind]'));
  if (!forms.length) return;

  const cutoff = Date.parse('2027-02-01T03:00:00Z');
  const isClosed = Date.now() >= cutoff;
  const script = document.querySelector('script[data-wedding-forms]');
  const configUrl = new URL('rsvp-config.json', script ? script.src : document.baseURI);
  const registry = new Map();
  let endpoint = '';

  function message(form, text, error = false) {
    const status = form.querySelector('.form-status');
    if (!status) return;
    status.textContent = text;
    status.dataset.error = error ? 'true' : 'false';
  }

  function isGoogleOrigin(origin) {
    try {
      const u = new URL(origin);
      return u.protocol === 'https:' &&
        (u.hostname === 'script.google.com' || u.hostname === 'script.googleusercontent.com' ||
         u.hostname.endsWith('.googleusercontent.com'));
    } catch (_) { return false; }
  }

  // El backend de Google Apps Script admite IDs "public-" seguidos de UUID.
  // Mantener este formato evita que se rechacen las confirmaciones y canciones.
  const newId = () => {
    if (window.crypto && typeof crypto.randomUUID === 'function') {
      return 'public-' + crypto.randomUUID();
    }
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
      const n = Math.floor(Math.random() * 16);
      return (char === 'x' ? n : (n & 3) | 8).toString(16);
    });
    return 'public-' + uuid;
  };

  function field(form, name, value) {
    let input = form.querySelector('input[name="' + name + '"]');
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      form.append(input);
    }
    input.value = value;
  }

  function backupLink(form, kind) {
    const anchor = form.querySelector('.form-backup');
    if (!anchor || !endpoint) return;
    const url = new URL(endpoint);
    url.searchParams.set('view', kind);
    anchor.href = url.href;
    anchor.hidden = false;
  }

  function finish(form, text, ok) {
    const state = registry.get(form);
    if (!state) return;
    clearTimeout(state.timer);
    state.pending = false;
    const button = form.querySelector('.form-submit');
    if (button) button.disabled = !!ok && state.kind === 'public-rsvp';
    message(form, text, !ok);
    if (ok) {
      const fallback = form.querySelector('.form-backup');
      if (fallback) fallback.hidden = true;
      if (state.kind === 'public-song') { form.reset(); state.id = ''; }
      if (state.kind === 'public-rsvp') {
        if (button) button.textContent = 'Respuesta registrada';
        form.querySelectorAll('input:not([type=hidden]), textarea').forEach(el => { el.disabled = true; });
        // Mostrar el regreso a los regalos SOLO después del acuse OK de Apps Script.
        const back = form.querySelector('.post-confirm-link');
        if (back) back.hidden = false;
      }
    } else {
      if (button) button.disabled = false;
      backupLink(form, state.kind);
    }
  }

  for (const form of forms) {
    const kind = form.dataset.kind;
    if (!['public-rsvp', 'public-song'].includes(kind)) continue;
    const state = {kind, pending:false, id:'', timer:null};
    registry.set(form, state);
    if (kind === 'public-rsvp') {
      // La pregunta alimentaria solo corresponde a quienes asistirán.
      const dietaryQuestion = form.querySelector('[data-dietary-question]');
      const dietaryInput = form.querySelector('textarea[name="diet"]');
      const attendRadios = Array.from(form.querySelectorAll('input[type="radio"][name="attends"]'));
      const syncDietary = () => {
        if (!dietaryQuestion || !dietaryInput) return;
        const attends = attendRadios.some(radio => radio.checked && radio.value === 'Sí');
        dietaryQuestion.hidden = !attends;
        dietaryInput.disabled = !attends;
        dietaryInput.required = attends;
        if (!attends) dietaryInput.value = '';
      };
      attendRadios.forEach(radio => radio.addEventListener('change', syncDietary));
      syncDietary();
    }
    if (kind === 'public-rsvp' && isClosed) {
      form.replaceChildren(document.createTextNode('El plazo de confirmación de asistencia ha finalizado.'));
      continue;
    }

    form.addEventListener('submit', event => {
      event.preventDefault();
      if (state.pending || !form.reportValidity()) return;
      if (!endpoint) {
        message(form, 'No se pudo conectar con el registro de respuestas. Inténtalo más tarde.', true);
        return;
      }
      const button = form.querySelector('.form-submit');
      if (button) button.disabled = true;
      state.pending = true;
      // Reutilizamos el identificador si falló el acuse: evita duplicar respuestas.
      state.id = state.id || newId();
      field(form, 'requestId', state.id);
      field(form, 'kind', kind);

      let frame = form.parentElement.querySelector('.form-transport[data-kind="' + kind + '"]');
      if (!frame) {
        frame = document.createElement('iframe');
        frame.className = 'form-transport';
        frame.dataset.kind = kind;
        frame.name = 'jb-transport-' + kind.replace(/[^a-z]/g,'') + '-' + newId();
        frame.title = 'Procesamiento de respuesta';
        frame.tabIndex = -1;
        frame.setAttribute('aria-hidden','true');
        form.parentElement.append(frame);
      }
      form.method = 'POST';
      form.action = endpoint;
      form.target = frame.name;
      message(form, 'Enviando respuesta…');
      const savedId = state.id;
      state.timer = setTimeout(() => {
        if (state.pending && state.id === savedId) {
          finish(form, 'No logramos confirmar el registro. Comprueba tu respuesta antes de volver a enviarla.', false);
        }
      }, 16000);
      HTMLFormElement.prototype.submit.call(form);
    });
  }

  window.addEventListener('message', event => {
    const data = event.data;
    if (!data || data.channel !== 'jb-inline-form-response-v1' || !isGoogleOrigin(event.origin)) return;
    for (const [form, state] of registry) {
      if (state.pending && state.id && state.id === data.requestId && state.kind === data.kind) {
        // Evita anunciar que una alergia fue guardada si responde una
        // versión antigua de Apps Script que todavía ignora el campo diet.
        const dietField = form.querySelector('textarea[name="diet"]');
        const reportedDiet = dietField && dietField.value.trim();
        const hasRestriction = state.kind === 'public-rsvp'
          && form.querySelector('input[name="attends"]:checked')?.value === 'Sí'
          && reportedDiet && !/^(ningun[ao]s?|no|no tengo|sin restricciones( alimentarias)?)$/i.test(reportedDiet);
        const dietUnverified = data.ok === true && hasRestriction && data.dietSaved !== true;
        finish(form, dietUnverified
          ? 'Tu asistencia quedó registrada, pero no pudimos confirmar que la restricción alimentaria se haya guardado. Por favor, avisa directamente a los novios para que puedan considerarla.'
          : (data.ok === true
            ? (data.message || (state.kind === 'public-rsvp' ? '¡Gracias! Tu asistencia quedó registrada.' : '¡Gracias! Tu canción quedó registrada.'))
            : (data.message || 'No fue posible registrar la respuesta. Inténtalo nuevamente.')), data.ok === true);
        if (dietUnverified) {
          const status = form.querySelector('.form-status');
          if (status) status.dataset.error = 'true';
        }
      }
    }
  });

  fetch(configUrl, {cache:'no-store'})
    .then(r => { if (!r.ok) throw Error('Config'); return r.json(); })
    .then(cfg => {
      const url = new URL(cfg.endpoint);
      if (url.protocol !== 'https:' || url.hostname !== 'script.google.com' ||
          !/^\/macros\/s\/[\w-]+\/exec$/.test(url.pathname)) throw Error('Endpoint');
      endpoint = url.href;
    })
    .catch(() => { forms.forEach(form => message(form, 'El registro no está disponible temporalmente.', true)); });
})();
