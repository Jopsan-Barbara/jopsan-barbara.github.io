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
 const fallback=document.createElement('a');fallback.href=url.href;fallback.target='_blank';fallback.rel='noopener noreferrer';fallback.className='button button-dark form-open-direct';fallback.textContent=kind==='public-rsvp'?'Abrir confirmación en otra pestaña':'Abrir canciones en otra pestaña';fallback.hidden=true;
 root.replaceChildren(status,retry,fallback,frame);let ready=false;
 const timer=setTimeout(()=>{if(!ready){status.textContent='No pudimos mostrar el formulario dentro de esta página. Puedes intentar abrirlo en otra pestaña.';retry.hidden=false;fallback.hidden=false;}},12000);
 function listener(e){const d=e.data;if(!d||d.channel!=='jb-public-form-v1'||d.nonce!==nonce||d.kind!==kind)return;try{const origin=new URL(e.origin);if(origin.protocol!=='https:'||!(origin.hostname==='script.google.com'||origin.hostname==='script.googleusercontent.com'||origin.hostname.endsWith('-script.googleusercontent.com')||origin.hostname.endsWith('.googleusercontent.com')))return;}catch(_){return;}
 if(d.ready!==true)return;ready=true;clearTimeout(timer);status.hidden=true;retry.hidden=true;frame.hidden=false;
 if(Number.isFinite(d.height))frame.style.height=Math.max(180,Math.min(1700,Math.ceil(d.height)+16))+'px';
 }
 window.addEventListener('message',listener);
 retry.onclick=()=>{clearTimeout(timer);window.removeEventListener('message',listener);mount(root,kind,endpoint);};
}
try{const response=await fetch('rsvp-config.json',{cache:'no-store'});if(!response.ok)throw Error();const config=await response.json();
function mountGoogleForm(root,value,label){if(!root||!value)return false;let url;try{url=new URL(value);if(url.origin!=='https://docs.google.com'||!/^\/forms\/d\/(?:e\/)?[\w-]+\/viewform$/.test(url.pathname))return false;}catch(_){return false;}const link=document.createElement('a');link.className='button button-dark';link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.textContent=label;root.replaceChildren(link);return true;}
const hasRsvp=closed||mountGoogleForm(rsvp,config.rsvpForm,'Confirmar asistencia'),hasSong=mountGoogleForm(song,config.songForm,'Sugerir una canción');if(hasRsvp&&hasSong)return;
const endpoint=new URL(config.endpoint);if(endpoint.origin!=='https://script.google.com'||!/^\/macros\/s\/[\w-]+\/exec$/.test(endpoint.pathname))throw Error();if(!hasRsvp)mount(rsvp,'public-rsvp',endpoint);if(!hasSong)mount(song,'public-song',endpoint);}catch(_){[closed?null:rsvp,song].filter(Boolean).forEach(root=>{root.textContent='El formulario no está disponible en este momento. Por favor, inténtalo nuevamente más tarde.';});}
})();