const RSVP_CLOSE_ = Date.parse('2027-02-01T03:00:00Z'); // 00:00 del 1 de febrero, America/Santiago (UTC-3).
function assertOpen_(){if(Date.now()>=RSVP_CLOSE_)throw new Error('El tiempo para confirmar asistencia ha finalizado. Aún puedes dejarnos un regalo en https://jopsan-barbara.github.io/#regalos');}
/* Ejecutar prepararInvitaciones_ desde el editor, nunca desde la web pública. */
const INVITADOS_ID = '1ovMgCRmxfnyhUZL69CINtlUW0TJeggHPOghDnIeubcg';
const RESPUESTAS_ID = '1WVDs5uB8MjFG2TwyTrhEU5H5U_4hQrfyQRj3mtRxMTY';

// Genera el ID al completar nombre y cupos directamente en Google Sheets.
function onEdit(e) {
  if (!e || !e.range || typeof e.range.getSheet !== 'function') return;
  const sheet = e.range.getSheet();
  if (sheet.getName() !== 'Invitados' || e.range.getLastRow() < 6 || e.range.getRow() > 205) return;
  const start = Math.max(6, e.range.getRow()), end = Math.min(205, e.range.getLastRow());
  const rows = sheet.getRange(start, 1, end - start + 1, 5).getValues();
  rows.forEach((row, index) => {
    if (!row[0] && String(row[1]).trim() && Number.isInteger(Number(row[4])) && Number(row[4]) > 0 && Number(row[4]) <= 100) {
      sheet.getRange(start + index, 1).setValue(Utilities.getUuid());
    }
  });
}

function prepararInvitaciones_() {
  const sheet = SpreadsheetApp.openById(INVITADOS_ID).getSheetByName('Invitados');
  const rows = sheet.getRange(6, 1, 200, 9).getValues();
  const seen = new Set();
  rows.forEach((row, index) => {
    if (!String(row[1]).trim()) return;
    const id = String(row[0]).trim() || Utilities.getUuid();
    if (seen.has(id)) throw new Error('ID duplicado en Invitados, fila ' + (index + 6));
    seen.add(id);
    if (!Number.isInteger(Number(row[4])) || Number(row[4]) < 1 || Number(row[4]) > 100) throw new Error('Revisar cupos en fila ' + (index + 6));
    sheet.getRange(index + 6, 1).setValue(id);
  });
}

function doGet(e) {
  if(e && e.parameter && e.parameter.view==='regalos')return renderGifts_();
  if(e && e.parameter && e.parameter.view==='cancion')return HtmlService.createHtmlOutput(SONG_HTML_).setTitle('Sugerir una canción').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  if(Date.now()>=RSVP_CLOSE_) return HtmlService.createHtmlOutput('<!doctype html><html lang="es"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="padding:32px;background:#f6f3ed;color:#293c31;font:18px/1.6 Arial"><h1>El tiempo para confirmar asistencia ha finalizado</h1><p>Sin embargo, si nos quieres dejar un regalo aún estás a tiempo de hacerlo.</p><a href="https://jopsan-barbara.github.io/#regalos" target="_top">Ver regalos →</a></body></html>').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return HtmlService.createHtmlOutput(FORM_HTML_).setTitle('Confirma tu asistencia · Jopsan y Bárbara')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function renderGifts_() {
  const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sheet=SpreadsheetApp.openById(INVITADOS_ID).getSheetByName('Regalos');
  const values=sheet?sheet.getRange(1,2,2,1).getDisplayValues():[[''],['']];
  const bank=String(values[0][0]),gifts=String(values[1][0]).split('\n').map(x=>x.split('|')).filter(x=>x.length===2&&x[0].trim()&&/^\d+$/.test(x[1].trim())&&Number(x[1])>0);
  const cards=gifts.map((x,i)=>'<article><h3>'+esc(x[0].trim())+'</h3><p>$'+Number(x[1]).toLocaleString('es-CL')+' CLP</p><a href="#transferencia">Regalar este aporte →</a></article>').join('');
  return HtmlService.createHtmlOutput('<!doctype html><html lang="es"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:16px/1.6 Arial;color:#293c31;background:#f6f3ed;margin:0;padding:20px}h2,h3{font-family:Georgia}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:16px}article{background:white;border:1px solid #dce2d8;padding:20px;border-radius:12px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}a{color:#754458}</style><h2>Lista de Deseos</h2><section>'+ (cards||'<p>Estamos preparando nuestra Lista de Deseos.</p>')+'</section><h2 id="transferencia">Aporte por transferencia</h2><p>Puedes aportar el monto de un regalo simbólico o elegir un monto libre.</p><article><pre>'+esc(bank||'Pronto compartiremos nuestros datos para transferencia.')+'</pre></article><p>Si eliges un regalo de la lista, escribe su nombre en el comentario de tu transferencia.</p></html>').setTitle('Regalos · Jopsan y Bárbara').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function clean_(value, max, required) {
  if (typeof value !== 'string') value = '';
  value = value.trim();
  if ((required && !value) || value.length > max) throw new Error('Revisa los campos del formulario.');
  // Evita interpretar respuestas de invitados como fórmulas en Sheets.
  return /^[=+@-]/.test(value) ? "'" + value : value;
}

function validate_(data, guests) {
  if (!data || typeof data !== 'object' || data.website) throw new Error('Solicitud no válida.');
  const id = clean_(data.id, 100, true);
  const matches = guests.filter(row => String(row[0]).trim() === id && String(row[1]).trim());
  if (matches.length !== 1) throw new Error('Usa el enlace personal de tu invitación o contacta a los novios.');
  const max = Number(matches[0][4]);
  if (!Number.isInteger(max) || max < 1 || max > 100) throw new Error('Los novios deben revisar los cupos de esta invitación.');
  if (!['Sí','No'].includes(data.attends)) throw new Error('Indica si asistirás.');
  const people = data.attends === 'No' ? 0 : Number(data.people);
  if (!Number.isInteger(people) || people < (data.attends === 'Sí' ? 1 : 0) || people > max) throw new Error('La cantidad de personas supera los cupos de tu invitación.');
  const email = clean_(data.email, 254, true);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Revisa tu correo.');
  const companions = clean_(data.companions, 1000, people > 1);
  return [new Date(), id, clean_(data.firstName, 100, true), clean_(data.lastName, 100, true), email,
    data.attends, people, companions, clean_(data.diet, 1000, data.attends === 'Sí'),
    clean_(data.song, 200, false), clean_(data.message, 1000, false), 'Web'];
}

function submitRsvp(data) {
  assertOpen_();
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) throw new Error('Hay varios envíos en curso. Inténtalo nuevamente en unos segundos.');
  try {
    assertOpen_();
    const guests = SpreadsheetApp.openById(INVITADOS_ID).getSheetByName('Invitados').getRange(6, 1, 200, 9).getValues();
    const row = validate_(data, guests);
    const sheet = SpreadsheetApp.openById(RESPUESTAS_ID).getSheetByName('Respuestas');
    const ids = sheet.getRange(6, 2, 200, 1).getValues().map(r => String(r[0]).trim());
    let index = ids.indexOf(row[1]);
    if (index < 0) index = ids.indexOf('');
    if (index < 0) throw new Error('No se pudo registrar la respuesta. Contacta a los novios.');
    sheet.getRange(index + 6, 1, 1, 12).setValues([row]);
    SpreadsheetApp.flush();
    return {ok:true, message:'Tu respuesta quedó guardada. ¡Gracias por acompañarnos en esta etapa!'};
  } finally { lock.releaseLock(); }
}

const FORM_HTML_ = `<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
*{box-sizing:border-box}body{margin:0;padding:24px;background:#ddd1dd;color:#293c31;font:15px/1.6 Arial,sans-serif}form{max-width:620px;margin:auto}h2{font:38px Georgia,serif;text-align:center}label{display:block;margin:16px 0 5px}input,select,textarea{width:100%;padding:12px;border:1px solid #8c8190;border-radius:6px;background:#fcfaf5;color:#293c31;font:inherit}textarea{resize:vertical}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}button{display:block;margin:24px auto;background:#293c31;color:white;border:0;border-radius:99px;padding:14px 30px;font:inherit;cursor:pointer}button:disabled{opacity:.5;cursor:wait}.trap{position:absolute;left:-9999px}#status{padding:12px;text-align:center}a{color:inherit}@media(max-width:450px){body{padding:18px}.pair{grid-template-columns:1fr;gap:0}}</style></head><body>
<form id="rsvp"><h2>¿Nos acompañas?</h2><p>Responde por todas las personas de tu invitación. Si vuelves a enviar, actualizaremos tu respuesta.</p>
<input type="hidden" name="id" id="invitation-id"><label class="trap" aria-hidden="true">Sitio web<input name="website" tabindex="-1" autocomplete="off"></label>
<div class="pair"><div><label for="firstName">Nombre</label><input id="firstName" name="firstName" maxlength="100" autocomplete="given-name" required></div><div><label for="lastName">Apellido</label><input id="lastName" name="lastName" maxlength="100" autocomplete="family-name" required></div></div>
<label for="email">Correo</label><input id="email" name="email" type="email" autocomplete="email" maxlength="254" required>
<label for="attends">¿Asistirás?</label><select id="attends" name="attends" required><option value="">Selecciona</option><option>Sí</option><option>No</option></select>
<div id="attendance-details"><label for="people">Personas que asistirán, incluyéndote</label><input id="people" name="people" type="number" min="1" max="100" step="1" required>
<label for="companions">Nombres de acompañantes</label><textarea id="companions" name="companions" maxlength="1000"></textarea>
<label for="diet">Alergias o restricciones alimentarias de cada persona</label><textarea id="diet" name="diet" maxlength="1000" required></textarea></div>
<label for="message">Mensaje para los novios (opcional)</label><textarea id="message" name="message" maxlength="1000"></textarea>
<button id="send" type="submit">Guardar respuesta</button><p id="status" role="status" aria-live="polite"></p></form>
<script>
const form=document.getElementById('rsvp'), statusEl=document.getElementById('status'),send=document.getElementById('send');
google.script.url.getLocation(function(location){document.getElementById('invitation-id').value=location.parameter.id||'';if(!location.parameter.id){statusEl.textContent='Abre el formulario desde el enlace personal de tu invitación.';send.disabled=true;}});
document.getElementById('attends').addEventListener('change',function(){const no=this.value==='No';document.getElementById('attendance-details').hidden=no;document.getElementById('people').required=!no;document.getElementById('diet').required=!no;});
form.addEventListener('submit',function(event){event.preventDefault();if(!form.reportValidity())return;const data=Object.fromEntries(new FormData(form));send.disabled=true;statusEl.textContent='Guardando tu respuesta…';google.script.run.withSuccessHandler(function(result){statusEl.textContent=result.message;send.disabled=false;}).withFailureHandler(function(error){statusEl.textContent=error.message||'No pudimos guardar. Inténtalo nuevamente.';send.disabled=false;}).submitRsvp(data);});
</script></body></html>`;

function submitSong(data) {
  if(!data || data.website)throw new Error('Solicitud no válida.');
  const id=clean_(data.id,100,true),song=clean_(data.song,200,true);
  const guests=SpreadsheetApp.openById(INVITADOS_ID).getSheetByName('Invitados').getRange(6,1,200,9).getValues();
  if(guests.filter(r=>String(r[0]).trim()===id&&String(r[1]).trim()).length!==1)throw new Error('Abre tu enlace personal para enviar una canción.');
  const lock=LockService.getScriptLock();if(!lock.tryLock(15000))throw new Error('Inténtalo nuevamente en unos segundos.');
  try {const book=SpreadsheetApp.openById(RESPUESTAS_ID);let sheet=book.getSheetByName('Canciones');if(!sheet){sheet=book.insertSheet('Canciones');sheet.getRange(1,1,1,3).setValues([['Fecha y hora','ID de invitación','Canción sugerida']]);}const ids=sheet.getRange(2,2,200,1).getValues().map(r=>String(r[0]).trim());let index=ids.indexOf(id);if(index<0)index=ids.indexOf('');if(index<0)throw new Error('Contacta a los novios para enviar tu canción.');sheet.getRange(index+2,1,1,3).setValues([[new Date(),id,song]]);SpreadsheetApp.flush();return {message:'¡Gracias! Tu canción quedó guardada.'};}finally{lock.releaseLock();}
}
const SONG_HTML_ = `<!doctype html><html lang="es"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:12px;background:#f6f2e9;color:#293c31;font:15px/1.5 Arial}input{box-sizing:border-box;width:100%;padding:14px;border:1px solid #8c8190;border-radius:6px;background:#fcfaf5;font:inherit}button{margin-top:16px;padding:12px 30px;border:0;border-radius:40px;background:#293c31;color:white;font:inherit;cursor:pointer}button:disabled{opacity:.5}.trap{position:absolute;left:-9999px}</style><form id="songForm"><label for="song">Tu canción</label><input name="song" id="song" maxlength="200" required placeholder="Nombre de la canción y artista"><input name="website" class="trap" tabindex="-1" aria-hidden="true" autocomplete="off"><button id="send">Enviar</button><p id="status" role="status"></p></form><script>let invitationId='';const form=document.getElementById('songForm'),button=document.getElementById('send'),status=document.getElementById('status');button.disabled=true;google.script.url.getLocation(location=>{invitationId=location.parameter.id||'';button.disabled=!invitationId;if(!invitationId)status.textContent='Abre tu enlace personal para enviar una canción.';});form.onsubmit=event=>{event.preventDefault();if(!form.reportValidity()||!invitationId)return;button.disabled=true;status.textContent='Guardando…';const data=Object.fromEntries(new FormData(form));data.id=invitationId;google.script.run.withSuccessHandler(result=>{status.textContent=result.message;button.disabled=false;}).withFailureHandler(error=>{status.textContent=error.message||'Inténtalo nuevamente.';button.disabled=false;}).submitSong(data);};</script></html>`;
