# Activación de formularios Oliva

Las páginas `/` y `/propuestas/olivo.html` muestran formularios nativos y sencillos, sin abrir ventanas: confirmación (Sí/No y nombre completo) y canción (canción y artista).

**Importante:** GitHub Pages publica la interfaz, pero no publica automáticamente Google Apps Script. Los formularios necesitan la versión nueva del script para guardar datos.

## Activación una sola vez

1. Acceder al proyecto de Google Apps Script que gestiona la planilla de respuestas del matrimonio desde la cuenta autorizada.
2. Actualizar su código con `integration/Code.gs` del repositorio, que ahora incluye `doPost(e)`, `submitPublicRsvp` y `submitPublicSong`.
3. En Apps Script, ir a **Implementar > Administrar implementaciones**, editar la implementación web utilizada por `rsvp-config.json`, escoger **Nueva versión** y guardar. Mantener ejecución desde la cuenta propietaria y acceso para que los invitados puedan responder sin iniciar sesión.
4. Comprobar que el enlace web original de `rsvp-config.json` sigue siendo el de la implementación actualizada.
5. Desde la web pública, enviar un **Sí**, un **No** y una canción como pruebas. Verificar las respuestas en Google Sheets y en la pestaña **Vista novios**, y limpiar las pruebas.

El sitio muestra un mensaje de éxito **únicamente cuando el servidor confirma que guardó el registro**. Si el servidor no responde, no informa falsamente de un envío correcto y ofrece un enlace alternativo.

La URL de consulta a los novios no debe publicarse ni añadirse al código de la web.
