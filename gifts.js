(()=>{"use strict";
const gifts=[["Llenado de medio estanque","$400.000"],["Una cena romántica","$200.000"],["Un sillón mediano para la casa propia","$180.000"],["Dos entradas al teatro, en Cancún","$150.000"],["Parrillada para 4 en Café Plaza + show del doble de Luis Miguel","$120.000"],["Un día de masajes descontracturantes post prueba de vestidos","$100.000"],["Un baby doll de Victoria’s Secret para la luna de miel","$90.000"],["Meet and greet para Barby con Princesa Alba","$80.000"],["Tres varas de leña","$70.000"],["Un juguete para esa perra de la Kimberly Alejandra","$60.000"],["Una caja de huevos de campo para el emprendimiento","$50.000"],["Bóxers del Rayo McQueen para la luna de miel","$40.000"],["Paseo romántico en catamarán","$30.000"]];
/* Añadir aquí el enlace de Mercado Pago correspondiente a cada regalo, por ID (01–13). */
const mercadoPago={
  "10": "",
  "11": "",
  "12": "",
  "13": "",
  "01": "",
  "02": "",
  "03": "",
  "04": "",
  "05": "",
  "06": "",
  "07": "",
  "08": "",
  "09": ""
};
const root=document.getElementById('regalos');if(!root)return;
let available=0;
root.querySelectorAll('[data-pay]').forEach(a=>{const value=mercadoPago[a.dataset.pay];if(!value)return;try{const url=new URL(value);if(url.protocol!=='https:')return;a.href=url.href;a.hidden=false;available++}catch(_){}});
if(available===gifts.length)document.getElementById('gift-payment-intro').textContent='Puedes elegir tu regalo y pagarlo a través de Mercado Pago. Si prefieres realizar una transferencia bancaria, encontrarás nuestros datos más abajo.';
else if(available>0)document.getElementById('gift-payment-intro').textContent='Puedes realizar una transferencia bancaria o elegir Mercado Pago en los regalos que ofrecen esa opción.';
const selection=root.querySelector('#selection');
root.querySelectorAll('[data-transfer]').forEach(a=>a.addEventListener('click',()=>{const g=gifts[Number(a.dataset.transfer)];if(!g)return;const title=document.createElement('strong');title.textContent='Regalo elegido: '+g[1];const detail=document.createElement('span');detail.textContent=g[0];selection.replaceChildren(title,detail);selection.classList.add('show');}));
root.querySelector('#copy-bank').addEventListener('click',async()=>{const data=Array.from(root.querySelectorAll('#bank-details div')).map(x=>x.querySelector('dt').textContent+': '+x.querySelector('dd').textContent).join('\n');const feedback=root.querySelector('#copy-bank-status');try{let copied=false;if(navigator.clipboard&&window.isSecureContext){try{await navigator.clipboard.writeText(data);copied=true}catch(_){}}if(!copied){const t=document.createElement('textarea');t.value=data;t.style.position='fixed';t.style.left='-9999px';document.body.appendChild(t);t.select();try{copied=document.execCommand('copy')}finally{t.remove()}}if(!copied)throw Error('copy');feedback.textContent='Datos bancarios copiados correctamente.'}catch(_){feedback.textContent='Selecciona los datos y cópialos manualmente.'}});
})();