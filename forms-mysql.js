/* Jopsan & Bárbara · Formularios que guardan directamente en MySQL por API PHP.
   El navegador no conoce credenciales; nunca declara éxito sin acuse del servidor. */
(() => {
  'use strict';
  const endpoint = 'https://shakirachile.cl/jb-api/api.php';
  const forms = Array.from(document.querySelectorAll('form.wedding-form[data-kind]'));
  if (!forms.length) return;
  const cutoff = Date.parse('2027-02-01T03:00:00Z');

  function message(form, text, error = false) {
    const status = form.querySelector('.form-status');
    if (!status) return;
    status.textContent = text;
    status.dataset.error = error ? 'true' : 'false';
  }
  function createId() {
    if (window.crypto && typeof crypto.randomUUID === 'function') {
      return 'jb-' + crypto.randomUUID();
    }
    return 'jb-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, ch => {
      const r = Math.floor(Math.random() * 16);
      return (ch === 'x' ? r : ((r & 3) | 8)).toString(16);
    });
  }
  function configureDiet(form) {
    const question = form.querySelector('[data-dietary-question]');
    const dietary = form.querySelector('textarea[name="diet"]');
    if (!dietary) return () => {};
    const sync = () => {
      const attendance = form.querySelector('input[name="attends"]:checked')?.value || '';
      if (question) question.hidden = false;
      dietary.disabled = attendance === 'No';
      dietary.required = attendance === 'Sí';
      if (attendance === 'No') dietary.value = '';
    };
    form.querySelectorAll('input[name="attends"]').forEach(radio => radio.addEventListener('change', sync));
    sync();
  }
  for (const form of forms) {
    const kind = form.dataset.kind;
    if (kind !== 'public-rsvp' && kind !== 'public-song') continue;
    const button = form.querySelector('.form-submit');
    let saving = false;
    let completed = false;
    let requestId = '';
    if (kind === 'public-rsvp') {
      configureDiet(form);
      if (Date.now() >= cutoff) {
        form.replaceChildren(document.createTextNode('El plazo de confirmación de asistencia ha finalizado.'));
        continue;
      }
    }
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (saving || completed || !form.reportValidity()) return;
      if (kind === 'public-rsvp' && Date.now() >= cutoff) {
        message(form, 'El plazo de confirmación ha finalizado.', true);
        return;
      }
      requestId ||= createId();
      const payload = {kind, requestId, website: ''};
      if (kind === 'public-rsvp') {
        payload.fullName = form.elements.namedItem('fullName')?.value.trim() || '';
        payload.email = form.elements.namedItem('email')?.value.trim() || '';
        payload.attends = form.querySelector('input[name="attends"]:checked')?.value || '';
        payload.diet = form.elements.namedItem('diet')?.value.trim() || '';
      } else {
        payload.song = form.elements.namedItem('song')?.value.trim() || '';
      }
      saving = true;
      if (button) button.disabled = true;
      message(form, 'Guardando respuesta…');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          mode: 'cors',
          cache: 'no-store',
          credentials: 'omit',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        let result;
        try {
          result = await response.json();
        } catch (_) {
          throw new Error('El servidor no devolvió una confirmación válida. Inténtalo nuevamente.');
        }
        if (!response.ok || result?.ok !== true ||
            result.requestId !== requestId || result.kind !== kind) {
          throw new Error(result?.message || 'No se pudo confirmar el registro.');
        }
        message(form, kind === 'public-rsvp'
          ? 'Tu respuesta quedó registrada correctamente. ¡Gracias!'
          : (result.message || 'Tu canción quedó registrada. ¡Gracias!'));
        if (kind === 'public-rsvp') {
          completed = true;
          if (button) button.hidden = true;
          form.querySelectorAll('input, textarea').forEach(input => { input.disabled = true; });
          const status = form.querySelector('.form-status');
          if (status) status.dataset.success = 'true';
        } else {
          form.reset();
          requestId = '';
        }
      } catch (error) {
        const msg = error?.name === 'AbortError'
          ? 'No pudimos confirmar el registro. Revisa tu conexión e inténtalo nuevamente.'
          : (error instanceof TypeError ? 'No se pudo conectar con el registro. Inténtalo nuevamente.' : error?.message);
        message(form, msg || 'No logramos confirmar el registro. Inténtalo nuevamente.', true);
      } finally {
        clearTimeout(timeout);
        saving = false;
        if (button && !completed) button.disabled = false;
      }
    });
  }
})();
