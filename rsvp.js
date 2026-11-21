(async function(){
"use strict";
const deadline=Date.parse('2027-02-01T03:00:00Z');
const rsvp=document.getElementById('rsvp-public'),song=document.getElementById('song-public');
const closed=Date.now()>=deadline;
if(closed&&rsvp){document.getElementById('guest-title').textContent='El tiempo para confirmar asistencia ha finalizado';document.getElementById('guest-copy').textContent='Sin embargo, si nos quieres dejar un regalo, aún estás a tiempo de hacerlo.';const a=document.createElement('a');a.href='#regalos';a.className='button button-dark';a.textContent='Ver regalos';rsvp.replaceChildren(a);}
function mount(root,kind,endpoint){
 if(!root)return;
 const status=document.createElement('p');status.setAttribute('role','status');status.textContent='Cargando formulario…';
 const retry=document.createElement('button');retry.type='button';retry.className='retry';retry.textContent='Reintentar';retry.hidden=true;
 const nonce=crypto.randomUUID(),url=new URL(endpoint);url.searchParams.set('view',kind);url.searchParams.set('nonce',nonce);
 const frame=document.createElement('iframe');frame.hidden=true;frame.title=kind==='public-rsvp'?'Confirmación de asistencia':'Sugerir una canción';frame.src=url.href;frame.style.height=kind==='public-rsvp'?'880px':'220px';
 root.replaceChildren(status,retry,frame);let ready=false;
 const timer=setTimeout(()=>{if(!ready){status.textContent='El formulario no está disponible en este momento. Por favor, inténtalo nuevamente más tarde.';retry.hidden=false;}},12000);
 function listener(e){const d=e.data;if(!d||d.channel!=='jb-public-form-v1'||d.nonce!==nonce||d.kind!==kind)return;try{const origin=new URL(e.origin);if(origin.protocol!=='https:'||!(origin.hostname==='script.google.com'||origin.hostname==='script.googleusercontent.com'||origin.hostname.endsWith('-script.googleusercontent.com')||origin.hostname.endsWith('.googleusercontent.com')))return;}catch(_){return;}
 if(d.ready!==true)return;ready=true;clearTimeout(timer);status.hidden=true;retry.hidden=true;frame.hidden=false;
 if(Number.isFinite(d.height))frame.style.height=Math.max(180,Math.min(1700,Math.ceil(d.height)+16))+'px';
 }
 window.addEventListener('message',listener);
 retry.onclick=()=>{clearTimeout(timer);window.removeEventListener('message',listener);mount(root,kind,endpoint);};
}
try{const response=await fetch('rsvp-config.json',{cache:'no-store'});if(!response.ok)throw Error();const config=await response.json(),endpoint=new URL(config.endpoint);if(endpoint.origin!=='https://script.google.com'||!/^\/macros\/s\/[\w-]+\/exec$/.test(endpoint.pathname))throw Error();if(!closed)mount(rsvp,'public-rsvp',endpoint);mount(song,'public-song',endpoint);}catch(_){[closed?null:rsvp,song].filter(Boolean).forEach(root=>{root.textContent='El formulario no está disponible en este momento. Por favor, inténtalo nuevamente más tarde.';});}
})();