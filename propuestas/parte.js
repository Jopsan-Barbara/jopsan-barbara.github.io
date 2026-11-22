const film = document.querySelector('.film');
function moveAlbum(direction) {
  const step = film.children[1].offsetLeft - film.children[0].offsetLeft;
  const last = film.scrollWidth - film.clientWidth;
  let target = film.scrollLeft + direction * step;
  if (direction > 0 && film.scrollLeft >= last - 2) target = 0;
  if (direction < 0 && film.scrollLeft < 2) target = last;
  film.scrollTo({left:target, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
}
document.querySelector('#prev').onclick = () => moveAlbum(-1);
document.querySelector('#next').onclick = () => moveAlbum(1);
function countdown() {
  const remaining = Math.max(0, Math.floor((Date.parse('2027-02-27T14:30:00-03:00') - Date.now()) / 1000));
  const values = [Math.floor(remaining/86400), Math.floor(remaining/3600)%24, Math.floor(remaining/60)%60];
  document.querySelector('#count').textContent = remaining ? 'Faltan ' + values[0] + ' d · ' + values[1] + ' h · ' + values[2] + ' min' : '¡Llegó el gran día!';
}
countdown();
setInterval(countdown, 30000);
function mountForm(form) {
  const prefix = 'jb-propuestas-v1-' + form.id;
  const status = form.querySelector('[role=status]');
  const attendance = form.id === 'asistencia';
  if (attendance && Date.now() >= Date.parse('2027-02-01T03:00:00Z')) {
    form.replaceChildren('El plazo de confirmación ha finalizado.');
    return;
  }
  function syncDiet() {
    if (!attendance) return;
    const hidden = form.elements.attends.value !== 'Sí';
    document.querySelector('#diet').hidden = hidden;
    form.elements.diet.disabled = hidden;
  }
  try {
    const draft = JSON.parse(sessionStorage.getItem(prefix + '-draft') || '{}');
    for (const [name,value] of Object.entries(draft)) {
      if (form.elements.namedItem(name)) form.elements.namedItem(name).value = value;
    }
  } catch (_) { status.textContent = 'El navegador no permite recuperar el borrador.'; }
  syncDiet();
  form.addEventListener('input', () => {
    syncDiet();
    try {
      sessionStorage.setItem(prefix + '-draft', JSON.stringify(Object.fromEntries(new FormData(form))));
      status.textContent = 'Borrador guardado en esta pestaña.';
    } catch (_) { status.textContent = 'El navegador no permite guardar el borrador.'; }
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    if (attendance && Date.now() >= Date.parse('2027-02-01T03:00:00Z')) {
      status.textContent = 'El plazo de confirmación ha finalizado.';
      return;
    }
    try {
      const records = JSON.parse(sessionStorage.getItem(prefix + '-records') || '[]');
      records.push(values);
      sessionStorage.setItem(prefix + '-records', JSON.stringify(records));
      sessionStorage.removeItem(prefix + '-draft');
      form.reset(); syncDiet();
      status.textContent = attendance ? 'Respuesta de prueba guardada en esta pestaña.' : 'Canción de prueba guardada en esta pestaña.';
    } catch (_) { status.textContent = 'El navegador no pudo guardar los datos. Intenta nuevamente.'; }
  });
}
// Carta de olivo usa formularios nativos conectados; las otras propuestas conservan su simulación.
if (document.documentElement.dataset.estilo !== 'olivo') document.querySelectorAll('form').forEach(mountForm);
