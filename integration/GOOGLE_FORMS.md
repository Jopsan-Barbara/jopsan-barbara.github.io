# Formularios sencillos · Jopsan y Bárbara

La web usará un enlace general y dos Google Forms. No requiere cuentas para responder ni un panel desarrollado a medida.

## Las preguntas
- **Asistencia:** «Nombre y apellido» y «¿Asistirás?» (Sí / No).
- **Canciones:** «Canción y artista».

Cada invitación es individual, salvo autorización expresa de los novios. Cada respuesta «Sí» cuenta como una persona. Los acompañantes invitados deben confirmar individualmente.

## Activación única en Google
1. Desde la cuenta propietaria de la planilla de respuestas, abre un proyecto en Google Apps Script y copia el archivo `integration/CREAR_FORMULARIOS.gs`.
2. Ejecuta `prepararGoogleForms` una sola vez, concede permisos y recupera del registro los valores `rsvpForm` y `songForm`.
3. Copia esas dos URL públicas de respuesta en `rsvp-config.json` de este repositorio. No copies URL de edición. Al existir ambas, la web abre los dos Google Forms directamente, sin depender del formulario de Apps Script.
4. Prueba un «Sí», un «No» y una canción en un navegador sin iniciar sesión. Confirma que aparecen en «Resumen», «Confirmados», «No asistirán», «Playlist DJ» y «Vista novios». Elimina solo los registros de prueba.

**Antes de activar Google Forms:** `rsvp-config.json` mantiene `endpoint` para evitar desconectar de golpe la integración anterior.

## Consulta para los novios
Se añadió la pestaña «Vista novios» a la misma planilla. Muestra únicamente nombres, cantidades y canciones; no correos ni otros datos personales.

Para un enlace sin inicio de sesión, usar en Google Sheets **Archivo > Compartir > Publicar en la Web**, elegir **solo la pestaña «Vista novios»** y copiar el enlace publicado. Compartir ese enlace exclusivamente con los novios y **no incluirlo en la web ni en este repositorio**.

**Importante:** publicar una pestaña no equivale a protegerla con contraseña; cualquiera con el enlace puede verla y este podría reenviarse. Nunca habilites «Cualquier persona con el enlace» en toda la planilla original, porque contiene otras pestañas con datos internos.

La confirmación de asistencia debe cerrar el 31 de enero de 2027 a las 23:59, hora de Chile. La función `cerrarConfirmaciones` programa ese cierre en la creación inicial.
