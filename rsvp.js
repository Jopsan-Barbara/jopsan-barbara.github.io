(async function () {
  const section = document.querySelector('#rsvp .container');
  if (!section) return;
  if(Date.now()>=Date.parse('2027-02-01T03:00:00Z')) {
    document.getElementById('guest-title').textContent='El tiempo para confirmar asistencia ha finalizado';
    document.getElementById('guest-copy').textContent='Sin embargo, si nos quieres dejar un regalo aún estás a tiempo de hacerlo.';
    section.querySelector('a[aria-disabled="true"]')?.remove();
    const link=document.createElement('a');link.href='#regalos';link.className='button button-dark';link.textContent='Ver regalos';section.append(link);return;
  }
  try {
    const response = await fetch('rsvp-config.json', {cache:'no-store'});
    if (!response.ok) return;
    const config = await response.json();
    if (!config.endpoint) return;
    const endpoint = new URL(config.endpoint);
    if (endpoint.origin !== 'https://script.google.com' || !/^\/macros\/s\/[\w-]+\/exec$/.test(endpoint.pathname)) return;
    const id = new URLSearchParams(location.search).get('id');
    const copy = document.getElementById('guest-copy');
    if (!id) { copy.textContent = 'Abre tu enlace personal para confirmar. Si no lo tienes, contacta a los novios.'; return; }
    endpoint.searchParams.set('id', id);
    const frame = document.createElement('iframe');
    frame.src=endpoint.href;frame.title='Formulario de confirmación de asistencia';frame.loading='lazy';
    frame.style.cssText='width:100%;height:1400px;border:0;display:block;margin-top:24px;border-radius:8px';
    section.querySelector('a[aria-disabled="true"]')?.remove();
    copy.textContent='Confirma por todas las personas de tu invitación en el formulario.';
    section.append(frame);
  } catch (_) { /* Mantener el estado pendiente cuando no se pueda cargar configuración. */ }
})();
