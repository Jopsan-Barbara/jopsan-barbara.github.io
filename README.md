# Invitación · Jopsan & Bárbara

Invitación web al matrimonio del 27 de febrero de 2027, con llegada a las 14:30 h, en Domos de Chamiza, Puerto Montt.

**Sitio público:** https://jopsan-barbara.github.io/

## Modalidad de invitaciones

La web usa **un único enlace para todos los invitados**. No se requieren enlaces personalizados ni IDs. La invitación es individual, salvo indicación expresa de los novios.

El formulario de asistencia admite respuestas «Sí» y «No» y debe cerrar el 31 de enero de 2027 a las 23:59, hora de Chile. Las sugerencias de canciones se reciben por separado. El panel privado permite consultar asistencias, ausencias y canciones.

## Componentes

- `index.html`: invitación pública, datos del matrimonio, itinerario definitivo, vestimenta, mapa, regalos, confirmación, canciones y preguntas frecuentes.
- `wedding-oliva.css`: hoja de estilos consolidada, cargada por el sitio. Preserva el diseño Oliva, el enfoque mobile-first y los formularios nativos. Se genera a partir de `styles.css`, `romantico.css`, `gifts.css`, `oliva.css` y `forms-inline.css`. Si se cambian las fuentes CSS, también hay que reconstruir el archivo consolidado y cambiar su versión en `index.html`.
- `gallery-data.js` y `gallery.js`: galería de **15 fotografías** originales. El blanco y negro se aplica exclusivamente con CSS, sin alterar los archivos de fotografía. El avance automático no se reanuda tras una interacción manual.
- `assets/lirios-oliva.svg`: decoración botánica de la invitación.
- `gifts.js`: catálogo de **12 caricaturas y regalos**, con enlaces configurados para Mercado Pago, transferencia y acción de copiar datos. Las ilustraciones mantienen sus colores y archivos originales.
- `forms-inline.js` y `rsvp-config.json`: formularios nativos visibles sin abrir una ventana. Cada envío genera un ID `public-UUID` compatible con la validación de Apps Script.
- `integration/Code.gs`: servidor de formularios; procesa confirmaciones y canciones hacia Google Sheets.
- `panel/Code.gs`: panel privado, con conciliación por nombre completo normalizado. Si el nombre aparece varias veces o no coincide con el listado, señala la respuesta para revisión.
- `integration/CREAR_FORMULARIOS.gs`: alternativa con Google Forms. No debe activarse al mismo tiempo que los formularios nativos sin revisar la configuración.

### Horario confirmado

Sábado 27 de febrero de 2027, llegada 14:30, ceremonia 15:15, cóctel y discursos 16:15, dinámicas 17:30, parrillada 18:00, autoservicio 19:15, comida y bendición 19:40, baile 20:30; término 00:00 del domingo 28.

### Revisión técnica de la identidad Oliva (22 de noviembre de 2026)

- Un solo CSS público para reducir solicitudes y evitar diferencias entre versiones de estilos.
- Tipografía manuscrita de inspiración editorial, paleta marfil/arena/salvia/oliva, fotografías monocromáticas mediante filtro.
- Imágenes originales sin retoque de rostros ni modificación de los archivos de origen.
- Móvil: navegación táctil, línea de tiempo compacta, tarjetas de regalos horizontales y formularios integrados.
- Se verificaron por código los recursos referenciados, la sintaxis JavaScript, el balance de reglas CSS y casos de conciliación de invitados.
- **Las pruebas estáticas no equivalen a una prueba visual en navegadores ni a un envío real a Google Sheets.** Validar ambos antes de compartir masivamente.

## Importante antes de enviar la invitación

**Publicar en GitHub Pages no actualiza Google Apps Script.** Aunque el código del panel y de la invitación está actualizado en GitHub, se debe desplegar una versión nueva de `integration/Code.gs` y `panel/Code.gs` desde la cuenta autorizada. Hasta completarlo, los formularios y el panel pueden continuar ejecutando versiones anteriores. No considerar el circuito operativo sin verificar un envío real y su lectura desde el panel.

1. Desplegar y validar la integración Apps Script actualizada, o decidir explícitamente utilizar los dos Google Forms. Las instrucciones están en `integration/ACTIVAR.md` e `integration/GOOGLE_FORMS.md`.
2. Si se usa Google Forms, completar `rsvpForm` y `songForm` en `rsvp-config.json` con enlaces de **respuesta**, nunca de edición.
3. Verificar en navegación privada un «Sí», un «No» y una canción. Comprobar las respuestas en Google Sheets y en el panel, y retirar solo los registros de prueba.
4. Confirmar visualmente en dispositivos móviles y desktop la portada, el diseño, las fotografías, el carrusel, las caricaturas, los formularios, el itinerario y el mapa; el itinerario ya está confirmado por los novios.
5. Revisar con los novios cualquier cambio de dress code o modalidad de pago antes de modificar el contenido.

Las fotografías originales de los novios y la galería testimonial deben conservarse sin alterar rostros.
