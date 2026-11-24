// PANEL PRIVADO: la credencial NO se publica en GitHub ni en la invitación.
// Se crea una sola vez en las Propiedades del script, desde el editor de Apps Script.
const PANEL_TOKEN_PROPERTY_ = 'JB_PANEL_LINK_TOKEN';
const PANEL_GUESTS_ = '1ovMgCRmxfnyhUZL69CINtlUW0TJeggHPOghDnIeubcg';
const PANEL_ANSWERS_ = '1WVDs5uB8MjFG2TwyTrhEU5H5U_4hQrfyQRj3mtRxMTY';

function authorize_(received) {
  const secret = PropertiesService.getScriptProperties().getProperty(PANEL_TOKEN_PROPERTY_);
  const candidate = String(received || '').trim();
  if (!secret || !candidate || candidate !== secret)
    throw new Error('Enlace privado no autorizado.');
  return 'Enlace privado de los novios';
}

// Ejecutar desde el editor una vez que la Web App esté publicada.
// Devuelve el único enlace para Jopsan y Bárbara, sin contraseña adicional.
// Una copia del enlace da acceso a la información: compartir únicamente con ellos.
function obtenerEnlaceNovios() {
  const properties = PropertiesService.getScriptProperties();
  let token = properties.getProperty(PANEL_TOKEN_PROPERTY_);
  if (!token) {
    token = Utilities.getUuid().replace(/-/g,'') + Utilities.getUuid().replace(/-/g,'');
    properties.setProperty(PANEL_TOKEN_PROPERTY_, token);
  }
  const url = ScriptApp.getService().getUrl();
  if (!url) throw new Error('Despliega primero la aplicación web del panel y vuelve a ejecutar obtenerEnlaceNovios.');
  const link = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'acceso=' + encodeURIComponent(token);
  Logger.log('ENLACE PRIVADO PARA LOS NOVIOS: ' + link);
  return link;
}

function doGet(e) {
  const token = String(e && e.parameter && e.parameter.acceso || '');
  try {
    authorize_(token);
    // Apps Script muestra el HTML en un iframe de Google; el token se
    // inyecta desde el servidor, nunca se obtiene de window.location.search.
    const rendered = PANEL_HTML_.replace(
      'const PANEL_ACCESS_TOKEN_ = "";',
      'const PANEL_ACCESS_TOKEN_ = ' + JSON.stringify(token).replace(/</g,'\\u003c') + ';'
    );
    return HtmlService.createHtmlOutput(rendered).setTitle('Jopsan y Bárbara · Dashboard privado');
  } catch (_) {
    return HtmlService.createHtmlOutput('<!doctype html><html lang="es"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font:18px Arial;padding:40px"><h1>Acceso restringido</h1><p>Solicita a los novios el enlace privado del panel.</p></body></html>').setTitle('Acceso restringido');
  }
}
/* Conciliación para enlace único: evita contar dos veces a un invitado
   registrado antes y después por su nombre completo. Nunca resuelve
   coincidencias ambiguas automáticamente. */
function normalizeGuestName_(value) {
  return String(value || '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[.,;:!¿?¡'"()]/g,' ').replace(/\s+/g,' ').trim();
}
function compile_(guests, answers) {
  const indexed = new Map(), ids = new Set(), publicAnswers = [];
  let unmatched = 0, repeated = 0, conflicts = 0;
  const reviewNames = [];
  guests.forEach(g => {
    const id = String(g[0] || '').trim();
    if (!String(g[1] || '').trim()) return;
    if (id && ids.has(id)) throw new Error('Hay IDs de invitación duplicados. Revisa la planilla Invitados.');
    if (id) ids.add(id);
  });
  answers.forEach(a => {
    const id = String(a[1] || '').trim();
    if (!id || !String(a[2] || '').trim()) return;
    if (id.startsWith('public-') && String(a[11]) === 'Web pública') {
      publicAnswers.push(a);
      return;
    }
    if (!ids.has(id)) { unmatched++; return; }
    if (indexed.has(id)) throw new Error('Hay respuestas duplicadas para una invitación. Revisa la planilla Respuestas.');
    indexed.set(id, a);
  });
  const rows = guests.filter(g => String(g[1] || '').trim()).map(g => {
    const id = String(g[0] || '').trim(), a = indexed.get(id);
    const capacity = Number(g[4]);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100)
      throw new Error('Hay una invitación con cupos inválidos. Revisa la planilla Invitados.');
    const status = a ? String(a[5]).trim() : 'Pendiente';
    if (!['Sí','No','Pendiente'].includes(status))
      throw new Error('Hay una respuesta sin estado válido. Revisa Respuestas.');
    const people = status === 'Sí' ? Number(a[6]) : 0;
    if (!Number.isInteger(people) || people < 0 || people > capacity || (status === 'Sí' && people < 1))
      throw new Error('Revisa personas confirmadas y cupos en las planillas.');
    const diet = a ? String(a[8] || '').trim() : '';
    const normalized = normalizeGuestName_(diet).replace(/[.!]/g,'');
    const dietary = status === 'Sí' && !!diet && !/^(ningun[ao]s?|no|sin restricciones( alimentarias)?|ninguna restriccion( alimentaria)?|no tengo|no tenemos)$/.test(normalized);
    return {
      url:'', name:String(g[1]), capacity, status, people, dietary, diet,
      companions:a?String(a[7] || ''):'', song:a?String(a[9] || ''):'',
      message:a?String(a[10] || ''):'', email:a?String(a[4] || ''):String(g[2] || ''),
      phone:String(g[3] || ''), sent:String(g[5] || ''),
      updated:a?String(a[0] || ''):'', respondent:a?[a[2],a[3]].join(' ').trim():''
    };
  });
  const hasOriginalGuestList = rows.length > 0;
  const byName = new Map();
  rows.forEach((row, i) => {
    const key = normalizeGuestName_(row.name);
    if (!key) return;
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(i);
  });
  // Un mismo nombre completo puede enviar varias respuestas desde el enlace
  // general. La última respuesta válida reemplaza a la anterior en el panel.
  const latestByName = new Map();
  publicAnswers.forEach(a => {
    const status = String(a[5] || '').trim();
    const people = status === 'Sí' ? Number(a[6]) : 0;
    if (!['Sí','No'].includes(status) || !Number.isInteger(people) ||
        people !== (status === 'Sí' ? 1 : 0)) { unmatched++; return; }
    const name = [a[2],a[3]].join(' ').trim();
    const key = normalizeGuestName_(name);
    if (!key) { unmatched++; return; }
    if (latestByName.has(key)) repeated++;
    latestByName.set(key, {a, status, people, name});
  });
  latestByName.forEach(({a,status,people,name}, key) => {
    const matches = byName.get(key) || [];
    if (matches.length > 1) {
      conflicts++;
      reviewNames.push(name + ' — nombre duplicado en la lista');
      return; // Evitar doble conteo hasta que los novios revisen la identidad.
    }
    const diet = String(a[8] || '');
    const dietary = status === 'Sí' && !!diet.trim() &&
      !/^(no|ninguna|ninguno|sin restricciones)([.!])?$/i.test(diet.trim());
    if (matches.length === 1) {
      const row = rows[matches[0]];
      const previousStatus = row.status;
      if (previousStatus !== 'Pendiente' && previousStatus !== status) {
        conflicts++;
        reviewNames.push(name + ' — cambió su respuesta');
      }
      Object.assign(row, {
        status, people, dietary, diet,
        respondent:name, updated:String(a[0] || ''),
        sent:'Enlace general', public:true,
        review:previousStatus !== 'Pendiente' && previousStatus !== status
      });
    } else {
      // Sin coincidencia segura, mostrarlo una sola vez y señalarlo para revisión.
      rows.push({
        url:'', name, capacity:1, status, people, dietary, diet,
        companions:String(a[7] || ''), song:'', message:String(a[10] || ''),
        email:String(a[4] || ''), phone:'', sent:'Enlace general',
        updated:String(a[0] || ''), respondent:name,
        public:true, review:hasOriginalGuestList
      });
      if (hasOriginalGuestList) reviewNames.push(name + ' — no figura en la lista original');
    }
  });
  return {
    rows, unmatched, repeated, conflicts, reviewNames,
    missingIds:0
  };
}
function getDashboard(accessToken) {
  const viewer = authorize_(accessToken);
  const guests = SpreadsheetApp.openById(PANEL_GUESTS_).getSheetByName('Invitados').getRange(6,1,200,9).getDisplayValues();
  const book=SpreadsheetApp.openById(PANEL_ANSWERS_);
  const answerSheet=book.getSheetByName('Respuestas');
  const answers=answerSheet.getLastRow()>=6?answerSheet.getRange(6,1,answerSheet.getLastRow()-5,12).getDisplayValues():[];
  // Integra, si existen, los dos Google Forms públicos sin reemplazar el histórico.
  const formRsvp=book.getSheetByName('Formulario RSVP');
  if(formRsvp&&formRsvp.getLastRow()>=2){
    formRsvp.getRange(2,1,formRsvp.getLastRow()-1,7).getDisplayValues().forEach((r,i)=>{
      const first=String(r[1]||'').trim(),last=String(r[2]||'').trim(),status=String(r[3]||'').trim();
      if(!first||!last||!['Sí','No'].includes(status))return;
      const people=status==='Sí'?Number(r[4]):0;
      answers.push([r[0],'public-form-'+(i+2),first,last,'',status,people,r[5],r[6],'','','Web pública']);
    });
  }
  const result=compile_(guests,answers);
  const songSheet=book.getSheetByName('Canciones');
  if(songSheet){const songRows=songSheet.getLastRow()>=2?songSheet.getRange(2,1,songSheet.getLastRow()-1,3).getDisplayValues():[];result.publicSongs=songRows.filter(r=>String(r[1]).startsWith('public-')&&r[2]).map(r=>String(r[2]));const songs=new Map(songRows.filter(r=>r[1]).map(r=>[r[1],r[2]]));guests.filter(g=>String(g[1]).trim()).forEach((g,i)=>{if(songs.has(String(g[0]).trim()))result.rows[i].song=songs.get(String(g[0]).trim());});}
  const formSong=book.getSheetByName('Formulario canciones');
  if(formSong&&formSong.getLastRow()>=2){
    const songs=formSong.getRange(2,2,formSong.getLastRow()-1,1).getDisplayValues().map(r=>String(r[0]||'').trim()).filter(Boolean);
    result.publicSongs=(result.publicSongs||[]).concat(songs);
  }
  return Object.assign(result,{viewer,refreshedAt:new Date().toISOString()});
}

const PANEL_HTML_ = `<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
:root{--ink:#293c31;--wine:#754458;--muted:#637067;--bg:#f6f3ed;--line:#e0e4db}*{box-sizing:border-box}body{margin:0;color:var(--ink);background:var(--bg);font:14px/1.5 Arial,sans-serif}button,input,select{font:inherit}button{cursor:pointer}header{background:var(--ink);color:white;padding:24px max(24px,calc((100vw - 1180px)/2));display:flex;align-items:center;justify-content:space-between;gap:20px}header h1{font:32px Georgia,serif;margin:0}header p{color:#d9e0d6;margin:6px 0 0}button{border:1px solid var(--line);border-radius:8px;padding:10px 16px;background:white;color:var(--ink)}button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid #a8879f;outline-offset:3px}main{max-width:1228px;margin:auto;padding:28px 24px 50px}.toolbar{display:flex;gap:14px;align-items:end;flex-wrap:wrap;margin-bottom:24px}.toolbar label{display:grid;gap:6px;flex:1;min-width:160px}.toolbar label:first-child{flex:2}.toolbar input,.toolbar select{padding:12px;border:1px solid #b8c3b7;border-radius:8px;background:white;color:var(--ink);width:100%}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.metric{background:white;padding:22px;border:1px solid var(--line);border-radius:12px}.metric strong{display:block;font:40px Georgia,serif;margin-top:6px}.metric small{color:var(--muted)}.middle{display:grid;grid-template-columns:2fr 1fr;gap:20px;margin:22px 0}.card{background:white;border:1px solid var(--line);border-radius:12px;padding:24px}h2{font:24px Georgia,serif;margin:0 0 18px}.bar{display:grid;grid-template-columns:100px 1fr 40px;align-items:center;gap:12px;margin:14px 0}.track{height:12px;background:#eef0eb;border-radius:99px;overflow:hidden}.fill{height:100%;border-radius:99px}.bar button{border:0;padding:2px 0;text-align:left;background:transparent}.bar b{text-align:right}.sage{background:#708467}.plum{background:#9b7d96}.grey{background:#bdc5bc}.meta{color:var(--muted);font-size:12px;margin:14px 0}.alert{background:#f8e7dd;padding:14px;border-radius:8px;margin:18px 0;color:#693f29}.table-wrap{overflow-x:auto}table{border-collapse:collapse;width:100%;min-width:780px}th{text-align:left;color:var(--muted);font-size:12px;font-weight:600;border-bottom:1px solid var(--line);padding:12px 10px}td{border-bottom:1px solid var(--line);padding:16px 10px;vertical-align:top}td:first-child{width:29%}td small{display:block;color:var(--muted)}.badge{display:inline-block;border-radius:99px;padding:5px 10px;background:#edf1e9;white-space:nowrap}.badge.no{background:#f0e7ed}.badge.pending{background:#f1eee7}details{margin-top:8px}summary{cursor:pointer;color:var(--wine)}.detail{max-width:380px;padding:8px 0}.detail p{margin:6px 0;white-space:pre-wrap;overflow-wrap:anywhere}.empty{padding:40px;text-align:center;color:var(--muted)}.source{margin-top:24px;font-size:12px;color:var(--muted)}.source a{color:var(--wine)}#error{color:#7c362c}#notice{margin-bottom:20px}.subtitle{font-size:13px;color:var(--muted)}@media(max-width:800px){.metrics{grid-template-columns:1fr 1fr}.middle{grid-template-columns:1fr}header{padding:22px;align-items:start}header h1{font-size:26px}main{padding:20px 16px}.metric{padding:16px}.metric strong{font-size:32px}.toolbar label{min-width:130px}.card{padding:18px}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}
/* Listas privadas listas para copiar y compartir por WhatsApp. */
.wa-section{margin:24px 0}
.wa-heading{display:flex;justify-content:space-between;align-items:start;gap:12px;flex-wrap:wrap;margin:0 0 16px}
.wa-heading h2{margin:0 0 6px}
.wa-heading p{margin:0;color:var(--muted);max-width:690px}
.wa-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
.wa-card{background:#fff;border:1px solid #d7dbcf;border-radius:12px;padding:21px;display:flex;flex-direction:column;gap:13px;min-width:0}
.wa-card__head{display:flex;align-items:center;justify-content:space-between;gap:10px}
.wa-card h3{margin:0;color:#354c37;font:normal 23px Georgia,serif}
.wa-count{border-radius:99px;padding:4px 10px;background:#e9efe4;color:#435b3d;font-weight:700;font-size:12px;min-width:30px;text-align:center}
.wa-card[data-list="declined"] .wa-count{background:#f3eaf0;color:#79586b}
.wa-card[data-list="pending"] .wa-count{background:#f3efe7;color:#7d715b}
.wa-card[data-list="songs"] .wa-count{background:#f4eddf;color:#806b43}
.wa-list{list-style:decimal;list-style-position:outside;padding-left:26px;margin:0;max-height:270px;overflow-y:auto;scrollbar-gutter:stable;overscroll-behavior:contain}
.wa-list li{margin:0 0 8px;line-height:1.45;overflow-wrap:anywhere;padding-left:4px}
.wa-card__empty{color:#708074;margin:0;font-size:13px}
.wa-card button[data-copy-list]{border-radius:100px;border:1px solid #526a4c;background:#526a4c;color:#fff;font-weight:600;align-self:start;min-height:43px}
.wa-card button[data-copy-list]:hover:not(:disabled){background:#3f5840}
.wa-card button[data-copy-list]:disabled{opacity:.52;cursor:not-allowed}
.wa-feedback{min-height:20px;font-size:12px;color:#486548;margin:0}
.wa-manual{width:100%;min-height:100px;padding:12px;border-radius:7px;border:1px solid #b7c4b1;font:13px/1.6 monospace;resize:vertical}
.wa-manual[hidden]{display:none}
@media(max-width:800px){.wa-grid{grid-template-columns:1fr}.wa-card{padding:18px}}
</style></head><body><header><div><h1>Jopsan & Bárbara</h1><p>Invitados y confirmaciones · 27 de febrero de 2027</p></div><button id="refresh">Actualizar</button></header><main>
<p id="notice" role="status">Cargando invitados…</p><p id="error" role="alert"></p>
<section class="card" style="margin-bottom:24px"><h2>Enlace general de invitación</h2><p>Comparte la misma dirección con todas las personas invitadas.</p><input readonly value="https://jopsan-barbara.github.io/" aria-label="Enlace general" onclick="this.select()" style="width:100%;padding:12px"></section><div class="toolbar"><label>Buscar<input id="search" type="search" placeholder="Nombre, acompañante o canción"></label><label>Asistencia<select id="status"><option value="">Todas</option><option value="Pendiente">Pendiente</option><option value="Sí">Asiste</option><option value="No">No asiste</option></select></label><label>Alimentación<select id="diet"><option value="">Todas</option><option value="yes">Con indicaciones</option><option value="none">Sin indicaciones declaradas</option></select></label><button id="reset">Limpiar filtros</button></div>
<section class="metrics" aria-label="Resumen"><div class="metric">Invitaciones<strong id="total">—</strong><small id="capacity">Asistentes previstos (incluye registros previos): —</small></div><div class="metric">Personas confirmadas<strong id="people">—</strong><small id="yes">Invitaciones que asisten: —</small></div><div class="metric">Invitaciones pendientes<strong id="pending">—</strong><small id="pendingSeats">Cupos por responder: —</small></div><div class="metric">Invitaciones que no asisten<strong id="no">—</strong><small id="responseRate">Respuestas: —</small></div></section>
<section class="middle"><div class="card"><h2>Estado de las invitaciones</h2><div id="bars"></div><p class="subtitle">Selecciona un estado para filtrar la lista.</p></div><div class="card"><h2>Para organizar el día</h2><p id="dietCount">—</p><p id="songCount">—</p><details><summary>Canciones del enlace general</summary><div id="publicSongs"></div></details><a href="#listas-whatsapp">Ver y copiar las listas numeradas</a><p class="subtitle">Las indicaciones alimentarias se registran por invitación; pueden incluir varias personas.</p></div></section>
<section class="wa-section" id="listas-whatsapp" aria-labelledby="wa-title">
  <div class="wa-heading">
    <div><h2 id="wa-title">Listas para WhatsApp</h2>
      <p>Listas numeradas con datos actualizados. Copia la que necesites y pégala en WhatsApp; no se comparten correos ni teléfonos.</p></div>
  </div>
  <div class="wa-grid">
    <section class="wa-card" data-list="confirmed" aria-labelledby="wa-confirmed-title">
      <div class="wa-card__head"><h3 id="wa-confirmed-title">Confirmados</h3><span class="wa-count" id="wa-confirmed-count">0</span></div>
      <ol id="wa-confirmed" class="wa-list"></ol>
      <p class="wa-card__empty" id="wa-confirmed-empty">Sin confirmaciones todavía.</p>
      <button type="button" data-copy-list="confirmed" disabled>Copiar para WhatsApp</button>
      <p class="wa-feedback" id="wa-confirmed-feedback" role="status"></p>
      <textarea class="wa-manual" id="wa-confirmed-manual" readonly hidden aria-label="Texto para copiar manualmente"></textarea>
    </section>
    <section class="wa-card" data-list="declined" aria-labelledby="wa-declined-title">
      <div class="wa-card__head"><h3 id="wa-declined-title">No asistirán</h3><span class="wa-count" id="wa-declined-count">0</span></div>
      <ol id="wa-declined" class="wa-list"></ol>
      <p class="wa-card__empty" id="wa-declined-empty">Aún no hay respuestas negativas.</p>
      <button type="button" data-copy-list="declined" disabled>Copiar para WhatsApp</button>
      <p class="wa-feedback" id="wa-declined-feedback" role="status"></p>
      <textarea class="wa-manual" id="wa-declined-manual" readonly hidden aria-label="Texto para copiar manualmente"></textarea>
    </section>
    <section class="wa-card" data-list="pending" aria-labelledby="wa-pending-title">
      <div class="wa-card__head"><h3 id="wa-pending-title">Pendientes</h3><span class="wa-count" id="wa-pending-count">0</span></div>
      <ol id="wa-pending" class="wa-list"></ol>
      <p class="wa-card__empty" id="wa-pending-empty">No hay respuestas pendientes.</p>
      <button type="button" data-copy-list="pending" disabled>Copiar para WhatsApp</button>
      <p class="wa-feedback" id="wa-pending-feedback" role="status"></p>
      <textarea class="wa-manual" id="wa-pending-manual" readonly hidden aria-label="Texto para copiar manualmente"></textarea>
    </section>
    <section class="wa-card" data-list="songs" aria-labelledby="wa-songs-title">
      <div class="wa-card__head"><h3 id="wa-songs-title">Canciones solicitadas</h3><span class="wa-count" id="wa-songs-count">0</span></div>
      <ol id="wa-songs" class="wa-list"></ol>
      <p class="wa-card__empty" id="wa-songs-empty">Aún no se han solicitado canciones.</p>
      <button type="button" data-copy-list="songs" disabled>Copiar para WhatsApp</button>
      <p class="wa-feedback" id="wa-songs-feedback" role="status"></p>
      <textarea class="wa-manual" id="wa-songs-manual" readonly hidden aria-label="Texto para copiar manualmente"></textarea>
    </section>
  </div>
  <p class="subtitle">Las respuestas se consolidan por nombre, tal como en el panel. Revisa las alertas de coincidencias ambiguas antes de compartir las listas.</p>
</section>
<div id="warnings"></div><section class="card"><h2>Detalle de invitados</h2><p class="meta" id="scope"></p><div class="table-wrap"><table><thead><tr><th>Invitación</th><th>Asistencia</th><th>Cupos</th><th>Confirmados</th><th>Información</th></tr></thead><tbody id="rows"></tbody></table></div><div class="empty" id="empty" hidden>No hay invitaciones que coincidan con estos filtros.</div></section>
<p class="source">Fuentes: <a href="https://docs.google.com/spreadsheets/d/1ovMgCRmxfnyhUZL69CINtlUW0TJeggHPOghDnIeubcg/edit" target="_blank" rel="noopener noreferrer">Invitados</a> y <a href="https://docs.google.com/spreadsheets/d/1WVDs5uB8MjFG2TwyTrhEU5H5U_4hQrfyQRj3mtRxMTY/edit" target="_blank" rel="noopener noreferrer">Respuestas</a>. Gestión de invitaciones. Capacidad actual: 200 invitaciones.</p></main><script>
const PANEL_ACCESS_TOKEN_ = "";
let snapshot=null;const $=id=>document.getElementById(id);const clean=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function selectRows(){if(!snapshot)return[];const query=clean($('search').value),status=$('status').value,diet=$('diet').value;return snapshot.rows.filter(r=>(!status||r.status===status)&&(!query||clean([r.name,r.respondent,r.companions,r.song].join(' ')).includes(query))&&(!diet||(diet==='yes'?r.dietary:r.status==='Sí'&&!r.dietary)));}
function text(tag,value,cls){const el=document.createElement(tag);el.textContent=value;if(cls)el.className=cls;return el;}
function render(){if(!snapshot)return;const rows=selectRows(),yes=rows.filter(r=>r.status==='Sí'),no=rows.filter(r=>r.status==='No'),pending=rows.filter(r=>r.status==='Pendiente');$('total').textContent=rows.length;$('capacity').textContent='Cupos asignados: '+rows.reduce((n,r)=>n+r.capacity,0);$('people').textContent=yes.reduce((n,r)=>n+r.people,0);$('yes').textContent='Invitaciones que asisten: '+yes.length;$('pending').textContent=pending.length;$('pendingSeats').textContent='Cupos por responder: '+pending.reduce((n,r)=>n+r.capacity,0);$('no').textContent=no.length;$('responseRate').textContent='Respuestas: '+(rows.length?Math.round((yes.length+no.length)/rows.length*100)+'%':'sin invitados');$('dietCount').textContent=yes.filter(r=>r.dietary).length+' invitaciones con indicaciones alimentarias';$('songCount').textContent=(rows.filter(r=>r.song.trim()).length+(snapshot.publicSongs||[]).length)+' canciones sugeridas';$('scope').textContent=rows.length+' de '+snapshot.rows.length+' invitaciones · Resumen y gráficos según filtros actuales.';
$('publicSongs').replaceChildren(...(snapshot.publicSongs||[]).map(song=>text('p',song)));$('bars').replaceChildren();[['Asiste','Sí',yes.length,'sage'],['Pendiente','Pendiente',pending.length,'grey'],['No asiste','No',no.length,'plum']].forEach(([label,status,n,cls])=>{const bar=text('div','','bar'),button=text('button',label),track=text('div','','track'),fill=text('div','','fill '+cls);button.onclick=()=>{$('status').value=status;render();};fill.style.width=(rows.length?n/rows.length*100:0)+'%';track.append(fill);bar.append(button,track,text('b',n));$('bars').append(bar);});
$('rows').replaceChildren();$('empty').hidden=rows.length>0;rows.forEach(r=>{const tr=document.createElement('tr'),name=document.createElement('td');name.append(text('strong',r.name));if(false&&r.url){const link=document.createElement('a');link.href=r.url;link.target='_blank';link.rel='noopener';link.textContent='Abrir invitación';name.append(document.createElement('br'),link);const field=document.createElement('input');field.readOnly=true;field.value=r.url;field.setAttribute('aria-label','Enlace de '+r.name);field.style.width='100%';field.onclick=()=>field.select();name.append(document.createElement('br'),field);}if(r.respondent)name.append(text('small','Respondió: '+r.respondent));if(r.review)name.append(text('small','Revisar identidad o cambio de respuesta.','alert'));const state=document.createElement('td');state.append(text('span',r.status==='Sí'?'Asiste':r.status==='No'?'No asiste':'Pendiente','badge '+(r.status==='No'?'no':r.status==='Pendiente'?'pending':'')));const info=document.createElement('td');if(r.dietary)info.append(text('span','Revisar alimentación','badge no'));const details=document.createElement('details');details.append(text('summary','Ver detalles'));const detail=text('div','','detail');[['Acompañantes',r.companions],['Alimentación',r.diet],['Canción',r.song],['Mensaje',r.message],['Correo',r.email],['Teléfono',r.phone],['Envío',r.sent],['Última respuesta',r.updated]].forEach(([k,v])=>{if(v)detail.append(text('p',k+': '+v));});if(!detail.childNodes.length)detail.append(text('p','Sin información adicional.'));details.append(detail);info.append(details);tr.append(name,state,text('td',r.capacity),text('td',r.status==='Pendiente'?'—':r.people),info);$('rows').append(tr);});
renderWhatsAppLists();
$('warnings').replaceChildren();if(snapshot.unmatched)$('warnings').append(text('p',snapshot.unmatched+' respuestas sin invitación vinculada no se incluyen en los indicadores.','alert'));if(snapshot.repeated)$('warnings').append(text('p',snapshot.repeated+' respuestas repetidas por nombre se consolidaron para evitar contarlas dos veces. Verifica si son personas distintas con el mismo nombre.','alert'));if(snapshot.reviewNames&&snapshot.reviewNames.length)$('warnings').append(text('p','Respuestas a revisar: '+snapshot.reviewNames.join('; ')+'.','alert'));
}
function load(){if(!window.google||!google.script||!google.script.run){$('error').textContent='Esta vista debe abrirse desde su dirección privada de Google.';return;}$('refresh').disabled=true;$('error').textContent='';$('notice').textContent='Actualizando…';google.script.run.withSuccessHandler(data=>{snapshot=data;render();$('notice').textContent='Actualizado '+new Date(data.refreshedAt).toLocaleString('es-CL',{timeZone:'America/Santiago'})+' · '+data.viewer;$('refresh').disabled=false;}).withFailureHandler(error=>{$('error').textContent=error.message||'No se pudieron cargar las planillas.';$('notice').textContent=snapshot?'Se mantiene la última consulta; no se ha actualizado.':'Datos no disponibles.';$('refresh').disabled=false;}).getDashboard(PANEL_ACCESS_TOKEN_);}
const LIST_KEYS=['confirmed','declined','pending','songs'];
let whatsappLists={confirmed:[],declined:[],pending:[],songs:[]};

function getWhatsAppLists(){
  if(!snapshot)return{confirmed:[],declined:[],pending:[],songs:[]};
  const rows=Array.isArray(snapshot.rows)?snapshot.rows:[];
  // Son listas globales, independientes de los filtros de detalle.
  const sorted=rows.filter(r=>String(r.name||'').trim()).slice()
    .sort((a,b)=>String(a.name).localeCompare(String(b.name),'es-CL',{sensitivity:'base'}));
  const name=r=>{
    const people=Number(r.people)||0;
    return String(r.name).trim()+(r.status==='Sí'&&people>1?' ('+people+' personas)':'');
  };
  const songRows=rows.map(r=>String(r.song||'').trim()).filter(Boolean);
  const songPublic=(snapshot.publicSongs||[]).map(s=>String(s||'').trim()).filter(Boolean);
  return{
    confirmed:sorted.filter(r=>r.status==='Sí').map(name),
    declined:sorted.filter(r=>r.status==='No').map(name),
    pending:sorted.filter(r=>r.status==='Pendiente').map(name),
    songs:songRows.concat(songPublic)
  };
}
const LIST_NAMES={confirmed:'Confirmados',declined:'No asistirán',pending:'Pendientes',songs:'Canciones solicitadas'};
function whatsappText(key){
  const list=whatsappLists[key]||[];
  return '*'+LIST_NAMES[key]+' ('+list.length+')*'+
    (list.length?'\\n\\n'+list.map((value,index)=>(index+1)+'. '+value).join('\\n'):'\\n\\nSin registros.');
}
function renderWhatsAppLists(){
  whatsappLists=getWhatsAppLists();
  LIST_KEYS.forEach(key=>{
    const items=whatsappLists[key];
    $( 'wa-'+key+'-count').textContent=String(items.length);
    const ol=$('wa-'+key);
    ol.replaceChildren(...items.map(value=>text('li',value)));
    $('wa-'+key+'-empty').hidden=items.length>0;
    const section=document.querySelector('[data-list="'+key+'"]');
    const button=section.querySelector('[data-copy-list="'+key+'"]');
    button.disabled=!items.length;
    $('wa-'+key+'-feedback').textContent='';
    const manual=$('wa-'+key+'-manual');
    manual.hidden=true;
    manual.value='';
  });
}
async function copyWhatsApp(key){
  const feedback=$('wa-'+key+'-feedback'),content=whatsappText(key);
  if(!(whatsappLists[key]||[]).length){feedback.textContent='No hay registros para copiar.';return;}
  try{
    if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(content);
    else{
      const temp=document.createElement('textarea');
      temp.value=content;temp.setAttribute('readonly','');
      temp.style.position='fixed';temp.style.left='-9999px';
      document.body.append(temp);temp.select();
      const ok=document.execCommand('copy');temp.remove();
      if(!ok)throw Error('clipboard');
    }
    feedback.textContent='Lista copiada ('+whatsappLists[key].length+'). Pégala en WhatsApp.';
    $('wa-'+key+'-manual').hidden=true;
  }catch(_){
    const manual=$('wa-'+key+'-manual');
    manual.value=content;manual.hidden=false;manual.focus();manual.select();
    feedback.textContent='Selecciona el texto y cópialo manualmente.';
  }
}
document.querySelectorAll('[data-copy-list]').forEach(button=>{
  button.addEventListener('click',()=>copyWhatsApp(button.dataset.copyList));
});

['search','status','diet'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',render));$('reset').onclick=()=>{['search','status','diet'].forEach(id=>$(id).value='');render();};$('refresh').onclick=load;load();
</script></body></html>`;
