# Enlace general de invitación

La invitación pública es https://jopsan-barbara.github.io/ y no necesita ID ni parámetros. Google Apps Script debe desplegar una versión nueva de integration/Code.gs sobre la implementación existente (mismo endpoint /exec). No se deben publicar las planillas ni exponer credenciales. El sitio solo muestra los formularios cuando recibe la señal de compatibilidad jb-public-form-v1 del servicio, evitando que las versiones anteriores soliciten un enlace personal.

- RSVP: fecha límite 31 de enero de 2027 23:59 Chile. Guarda cada confirmación en Respuestas, con ID aleatorio propio del envío, fuente Web pública. No exige alta previa de invitados, ni permite sobrescribir otras respuestas. Reintentar el mismo envío es idempotente.
- Canciones: registro independiente en Canciones, sin ID de invitación.
- Panel: actualizar también el despliegue privado con panel/Code.gs para mostrar las respuestas y canciones de la modalidad general. Las respuestas antiguas se conservan. No se alteran datos existentes.
- Antes de distribuir: verificar el despliegue real de Google, cargar ambos formularios sin parámetros, realizar prueba de registro y comprobar filas en las planillas privadas y el panel. Eliminar únicamente los registros de prueba identificados.
- Con un enlace público ya no existe comprobación individual de cupos. Revisar duplicidades o respuestas no esperadas; el formulario no debe divulgar la lista de invitados.
