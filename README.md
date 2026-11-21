# Invitación · Jopsan & Bárbara

Invitación web al matrimonio del 27 de febrero de 2027, a las 12:00 h, en Domos de Chamiza, Puerto Montt.

**Sitio público:** https://jopsan-barbara.github.io/

## Modalidad de invitaciones

La web usa **un único enlace para todos los invitados**. No se requieren enlaces personalizados ni IDs. La invitación es individual, salvo indicación expresa de los novios.

El formulario de asistencia admite respuestas «Sí» y «No» y debe cerrar el 31 de enero de 2027 a las 23:59, hora de Chile. Las sugerencias de canciones se reciben por separado. El panel privado permite consultar asistencias, ausencias y canciones.

## Componentes

- `index.html`: invitación, ubicación, itinerario, vestimenta, regalos, RSVP y preguntas frecuentes.
- `styles.css`, `romantico.css` y `gifts.css`: estilos visuales y adaptación móvil.
- `gallery-data.js` y `gallery.js`: galería de 14 fotografías.
- `gifts.js`: tarjetas y transferencia (enlaces individuales de Mercado Pago aún no habilitados).
- `rsvp.js` y `rsvp-config.json`: cargan formularios desde Google Apps Script y admiten enlaces públicos alternativos a Google Forms.
- `integration/Code.gs`: backend de formularios para Apps Script.
- `integration/CREAR_FORMULARIOS.gs`: alternativa para crear formularios públicos de Google Forms y sus pestañas de respuestas.
- `panel/Code.gs`: panel de consulta privado; preparado para leer ambos tipos de respuestas.

## Importante antes de enviar la invitación

**Publicar en GitHub Pages no actualiza Google Apps Script.** Los cambios al backend y al panel requieren su propio despliegue desde la cuenta autorizada. Hasta que eso ocurra, los formularios de la web pueden mostrar un error.

1. Activar y validar una sola alternativa: Apps Script actualizado o dos formularios públicos de Google Forms. Las instrucciones están en `integration/ACTIVAR.md` e `integration/GOOGLE_FORMS.md`.
2. Si se usa Google Forms, completar `rsvpForm` y `songForm` en `rsvp-config.json` con enlaces de **respuesta**, nunca de edición.
3. Verificar en navegación privada un «Sí», un «No» y una canción. Comprobar las respuestas en Google Sheets y en el panel, y retirar solo los registros de prueba.
4. Completar los horarios del itinerario cuando los novios los confirmen.
5. Revisar con los novios cualquier cambio de dress code o modalidad de pago antes de modificar el contenido.

Las fotografías originales de los novios y la galería testimonial deben conservarse sin alterar rostros.
