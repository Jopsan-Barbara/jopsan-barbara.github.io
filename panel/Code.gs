const PANEL_ALLOWED_ = ['scarriont@gmail.com','jopsan.a.v@gmail.com','bamh.3003@gmail.com'];
const PANEL_GUESTS_ = '1ovMgCRmxfnyhUZL69CINtlUW0TJeggHPOghDnIeubcg';
const PANEL_ANSWERS_ = '1WVDs5uB8MjFG2TwyTrhEU5H5U_4hQrfyQRj3mtRxMTY';

function authorize_() {
  const email = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  if (!email || !PANEL_ALLOWED_.includes(email)) throw new Error('Acceso restringido. Usa una de las cuentas autorizadas para este matrimonio.');
  return email;
}
function doGet() {
  try {
    authorize_();
    return HtmlService.createHtmlOutput(PANEL_HTML_).setTitle('Jopsan y Bárbara · Panel de invitados');
  } catch (_) {
    return HtmlService.createHtmlOutput('<!doctype html><html lang="es"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font:18px Arial;padding:40px"><h1>Acceso restringido</h1><p>Ingresa con la cuenta de Google autorizada para este matrimonio.</p></body></html>').setTitle('Acceso restringido');
  }
}
function compile_(guests, answers) {
  const index = new Map(), ids = new Set();
  let unmatched = 0;
  guests.forEach(g => {
    const id = String(g[0]).trim();
    if (!String(g[1]).trim()) return;
    if (id && ids.has(id)) throw new Error('Hay IDs de invitación duplicados. Revisa la planilla Invitados.');
    if (id) ids.add(id);
  });
  answers.forEach(a => {
    const id = String(a[1]).trim();
    if (!id || !String(a[2]).trim()) return;
    if (!ids.has(id)) { unmatched++; return; }
    if (index.has(id)) throw new Error('Hay respuestas duplicadas para una invitación. Revisa la planilla Respuestas.');
    index.set(id,a);
  });
  const rows = guests.filter(g => String(g[1]).trim()).map(g => {
    const id = String(g[0]).trim(), a = index.get(id);
    const capacity = Number(g[4]);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100) throw new Error('Hay una invitación con cupos inválidos. Revisa la planilla Invitados.');
    const status = a ? String(a[5]).trim() : 'Pendiente';
    if (!['Sí','No','Pendiente'].includes(status)) throw new Error('Hay una respuesta sin estado válido. Revisa Respuestas.');
    const people = status === 'Sí' ? Number(a[6]) : 0;
    if (!Number.isInteger(people) || people < 0 || people > capacity || (status === 'Sí' && people < 1)) throw new Error('Revisa personas confirmadas y cupos en las planillas.');
    const diet = a ? String(a[8]).trim() : '';
    const normalized = diet.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[.!]/g,'').trim();
    const dietary = status === 'Sí' && !!diet && !/^(ningun[ao]s?|no|sin restricciones( alimentarias)?|ninguna restriccion( alimentaria)?|no tengo|no tenemos)$/.test(normalized);
    return {name:String(g[1]),capacity,status,people,dietary,diet,companions:a?String(a[7]):'',song:a?String(a[9]):'',message:a?String(a[10]):'',email:a?String(a[4]):String(g[2]),phone:String(g[3]),sent:String(g[5]),updated:a?String(a[0]):'',respondent:a?[a[2],a[3]].join(' '):''};
  });
  return {rows,unmatched,missingIds:guests.filter(g=>String(g[1]).trim()&&!String(g[0]).trim()).length};
}
function getDashboard() {
  const viewer = authorize_();
  const guests = SpreadsheetApp.openById(PANEL_GUESTS_).getSheetByName('Invitados').getRange(6,1,200,9).getDisplayValues();
  const answers = SpreadsheetApp.openById(PANEL_ANSWERS_).getSheetByName('Respuestas').getRange(6,1,200,12).getDisplayValues();
  return Object.assign(compile_(guests,answers),{viewer,refreshedAt:new Date().toISOString()});
}

const PANEL_HTML_ = `<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
:root{--ink:#293c31;--wine:#754458;--muted:#637067;--bg:#f6f3ed;--line:#e0e4db}*{box-sizing:border-box}body{margin:0;color:var(--ink);background:var(--bg);font:14px/1.5 Arial,sans-serif}button,input,select{font:inherit}button{cursor:pointer}header{background:var(--ink);color:white;padding:24px max(24px,calc((100vw - 1180px)/2));display:flex;align-items:center;justify-content:space-between;gap:20px}header h1{font:32px Georgia,serif;margin:0}header p{color:#d9e0d6;margin:6px 0 0}button{border:1px solid var(--line);border-radius:8px;padding:10px 16px;background:white;color:var(--ink)}button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid #a8879f;outline-offset:3px}main{max-width:1228px;margin:auto;padding:28px 24px 50px}.toolbar{display:flex;gap:14px;align-items:end;flex-wrap:wrap;margin-bottom:24px}.toolbar label{display:grid;gap:6px;flex:1;min-width:160px}.toolbar label:first-child{flex:2}.toolbar input,.toolbar select{padding:12px;border:1px solid #b8c3b7;border-radius:8px;background:white;color:var(--ink);width:100%}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.metric{background:white;padding:22px;border:1px solid var(--line);border-radius:12px}.metric strong{display:block;font:40px Georgia,serif;margin-top:6px}.metric small{color:var(--muted)}.middle{display:grid;grid-template-columns:2fr 1fr;gap:20px;margin:22px 0}.card{background:white;border:1px solid var(--line);border-radius:12px;padding:24px}h2{font:24px Georgia,serif;margin:0 0 18px}.bar{display:grid;grid-template-columns:100px 1fr 40px;align-items:center;gap:12px;margin:14px 0}.track{height:12px;background:#eef0eb;border-radius:99px;overflow:hidden}.fill{height:100%;border-radius:99px}.bar button{border:0;padding:2px 0;text-align:left;background:transparent}.bar b{text-align:right}.sage{background:#708467}.plum{background:#9b7d96}.grey{background:#bdc5bc}.meta{color:var(--muted);font-size:12px;margin:14px 0}.alert{background:#f8e7dd;padding:14px;border-radius:8px;margin:18px 0;color:#693f29}.table-wrap{overflow-x:auto}table{border-collapse:collapse;width:100%;min-width:780px}th{text-align:left;color:var(--muted);font-size:12px;font-weight:600;border-bottom:1px solid var(--line);padding:12px 10px}td{border-bottom:1px solid var(--line);padding:16px 10px;vertical-align:top}td:first-child{width:29%}td small{display:block;color:var(--muted)}.badge{display:inline-block;border-radius:99px;padding:5px 10px;background:#edf1e9;white-space:nowrap}.badge.no{background:#f0e7ed}.badge.pending{background:#f1eee7}details{margin-top:8px}summary{cursor:pointer;color:var(--wine)}.detail{max-width:380px;padding:8px 0}.detail p{margin:6px 0;white-space:pre-wrap;overflow-wrap:anywhere}.empty{padding:40px;text-align:center;color:var(--muted)}.source{margin-top:24px;font-size:12px;color:var(--muted)}.source a{color:var(--wine)}#error{color:#7c362c}#notice{margin-bottom:20px}.subtitle{font-size:13px;color:var(--muted)}@media(max-width:800px){.metrics{grid-template-columns:1fr 1fr}.middle{grid-template-columns:1fr}header{padding:22px;align-items:start}header h1{font-size:26px}main{padding:20px 16px}.metric{padding:16px}.metric strong{font-size:32px}.toolbar label{min-width:130px}.card{padding:18px}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}
</style></head><body><header><div><h1>Jopsan & Bárbara</h1><p>Invitados y confirmaciones · 27 de febrero de 2027</p></div><button id="refresh">Actualizar</button></header><main>
<p id="notice" role="status">Cargando invitados…</p><p id="error" role="alert"></p>
<div class="toolbar"><label>Buscar<input id="search" type="search" placeholder="Nombre, acompañante o canción"></label><label>Asistencia<select id="status"><option value="">Todas</option value="Pendiente">Pendiente</option><option value="Sí">Asiste</option><option value="No">No asiste</option></select></label><label>Alimentación<select id="diet"><option value="">Todas</option><option value="yes">Con indicaciones</option><option value="none">Sin indicaciones declaradas</option></select></label><button id="reset">Limpiar filtros</button></div>
<section class="metrics" aria-label="Resumen"><div class="metric">Invitaciones<strong id="total">—</strong><small id="capacity">Cupos asignados: —</small></div><div class="metric">Personas confirmadas<strong id="people">—</strong><small id="yes">Invitaciones que asisten: —</small></div><div class="metric">Invitaciones pendientes<strong id="pending">—</strong><small id="pendingSeats">Cupos por responder: —</small></div><div class="metric">Invitaciones que no asisten<strong id="no">—</strong><small id="responseRate">Respuestas: —</small></div></section>
<section class="middle"><div class="card"><h2>Estado de las invitaciones</h2><div id="bars"></div><p class="subtitle">Selecciona un estado para filtrar la lista.</p></div><div class="card"><h2>Para organizar el día</h2><p id="dietCount">—</p><p id="songCount">—</p><p class="subtitle">Las indicaciones alimentarias se registran por invitación; pueden incluir varias personas.</p></div></section>
<div id="warnings"></div><section class="card"><h2>Detalle de invitados</h2><p class="meta" id="scope"></p><div class="table-wrap"><table><thead><tr><th>Invitación</th><th>Asistencia</th><th>Cupos</th><th>Confirmados</th><th>Información</th></tr></thead><tbody id="rows"></tbody></table></div><div class="empty" id="empty" hidden>No hay invitaciones que coincidan con estos filtros.</div></section>
<p class="source">Fuentes: <a href="https://docs.google.com/spreadsheets/d/1ovMgCRmxfnyhUZL69CINtlUW0TJeggHPOghDnIeubcg/edit" target="_blank" rel="noopener">Invitados</a> y <a href="https://docs.google.com/spreadsheets/d/1WVDs5uB8MjFG2TwyTrhEU5H5U_4hQrfyQRj3mtRxMTY/edit" target="_blank" rel="noopener">Respuestas</a>. Vista de consulta. Capacidad actual: 200 invitaciones.</p></main><script>
let snapshot=null;const $=id=>document.getElementById(id);const clean=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function selectRows(){if(!snapshot)return[];const query=clean($('search').value),status=$('status').value,diet=$('diet').value;return snapshot.rows.filter(r=>(!status||r.status===status)&&(!query||clean([r.name,r.respondent,r.companions,r.song].join(' ')).includes(query))&&(!diet||(diet==='yes'?r.dietary:r.status==='Sí'&&!r.dietary)));}
function text(tag,value,cls){const el=document.createElement(tag);el.textContent=value;if(cls)el.className=cls;return el;}
function render(){if(!snapshot)return;const rows=selectRows(),yes=rows.filter(r=>r.status==='Sí'),no=rows.filter(r=>r.status==='No'),pending=rows.filter(r=>r.status==='Pendiente');$('total').textContent=rows.length;$('capacity').textContent='Cupos asignados: '+rows.reduce((n,r)=>n+r.capacity,0);$('people').textContent=yes.reduce((n,r)=>n+r.people,0);$('yes').textContent='Invitaciones que asisten: '+yes.length;$('pending').textContent=pending.length;$('pendingSeats').textContent='Cupos por responder: '+pending.reduce((n,r)=>n+r.capacity,0);$('no').textContent=no.length;$('responseRate').textContent='Respuestas: '+(rows.length?Math.round((yes.length+no.length)/rows.length*100)+'%':'sin invitados');$('dietCount').textContent=yes.filter(r=>r.dietary).length+' invitaciones con indicaciones alimentarias';$('songCount').textContent=rows.filter(r=>r.song.trim()).length+' canciones sugeridas';$('scope').textContent=rows.length+' de '+snapshot.rows.length+' invitaciones · Resumen y gráficos según filtros actuales.';
$('bars').replaceChildren();[['Asiste','Sí',yes.length,'sage'],['Pendiente','Pendiente',pending.length,'grey'],['No asiste','No',no.length,'plum']].forEach(([label,status,n,cls])=>{const bar=text('div','','bar'),button=text('button',label),track=text('div','','track'),fill=text('div','','fill '+cls);button.onclick=()=>{$('status').value=status;render();};fill.style.width=(rows.length?n/rows.length*100:0)+'%';track.append(fill);bar.append(button,track,text('b',n));$('bars').append(bar);});
$('rows').replaceChildren();$('empty').hidden=rows.length>0;rows.forEach(r=>{const tr=document.createElement('tr'),name=document.createElement('td');name.append(text('strong',r.name));if(r.respondent)name.append(text('small','Respondió: '+r.respondent));const state=document.createElement('td');state.append(text('span',r.status==='Sí'?'Asiste':r.status==='No'?'No asiste':'Pendiente','badge '+(r.status==='No'?'no':r.status==='Pendiente'?'pending':'')));const info=document.createElement('td');if(r.dietary)info.append(text('span','Revisar alimentación','badge no'));const details=document.createElement('details');details.append(text('summary','Ver detalles'));const detail=text('div','','detail');[['Acompañantes',r.companions],['Alimentación',r.diet],['Canción',r.song],['Mensaje',r.message],['Correo',r.email],['Teléfono',r.phone],['Envío',r.sent],['Última respuesta',r.updated]].forEach(([k,v])=>{if(v)detail.append(text('p',k+': '+v));});if(!detail.childNodes.length)detail.append(text('p','Sin información adicional.'));details.append(detail);info.append(details);tr.append(name,state,text('td',r.capacity),text('td',r.status==='Pendiente'?'—':r.people),info);$('rows').append(tr);});
$('warnings').replaceChildren();if(snapshot.unmatched)$('warnings').append(text('p',snapshot.unmatched+' respuestas sin invitación vinculada no se incluyen en los indicadores.','alert'));if(snapshot.missingIds)$('warnings').append(text('p',snapshot.missingIds+' invitaciones todavía no tienen ID. Revisa la planilla antes de enviar sus enlaces.','alert'));
}
function load(){if(!window.google||!google.script||!google.script.run){$('error').textContent='Esta vista debe abrirse desde su dirección privada de Google.';return;}$('refresh').disabled=true;$('error').textContent='';$('notice').textContent='Actualizando…';google.script.run.withSuccessHandler(data=>{snapshot=data;render();$('notice').textContent='Actualizado '+new Date(data.refreshedAt).toLocaleString('es-CL',{timeZone:'America/Santiago'})+' · '+data.viewer;$('refresh').disabled=false;}).withFailureHandler(error=>{$('error').textContent=error.message||'No se pudieron cargar las planillas.';$('notice').textContent=snapshot?'Se mantiene la última consulta; no se ha actualizado.':'Datos no disponibles.';$('refresh').disabled=false;}).getDashboard();}
['search','status','diet'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',render));$('reset').onclick=()=>{['search','status','diet'].forEach(id=>$(id).value='');render();};$('refresh').onclick=load;load();
</script></body></html>`;
