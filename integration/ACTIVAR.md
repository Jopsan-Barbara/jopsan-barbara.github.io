# RSVP activo

Cuenta propietaria: scarriont@gmail.com.

El servicio está publicado y rsvp-config.json contiene el endpoint verificado. Las planillas siguen privadas. Se probaron guardado real, rechazo de exceso de cupos y actualización de la misma respuesta. Los datos ficticios de prueba se retiraron.

## Uso

En Invitados, pestaña Invitados, completar desde la fila 6 el nombre y los cupos. El disparador onEdit del proyecto vinculado genera un UUID cuando se editan esos campos directamente en Google Sheets. La columna H genera el enlace personal. Si se cargan invitados mediante API/importación, el disparador simple no se ejecuta: asignar IDs únicos aleatorios o usar prepararInvitaciones_ desde el editor.

Cada ID permite una respuesta vigente; reenviar actualiza la fila. La planilla Respuestas de asistencia muestra respuestas y totales. Para dar acceso a los novios, confirmar sus correos y compartir directamente las planillas, nunca publicarlas.

Capacidad configurada: 200 invitaciones y 200 respuestas. El endpoint no permite listar invitados ni consultar respuestas. Un enlace privado permite actualizar la invitación correspondiente; no usar IDs predecibles. Los parámetros invitado y cupos personalizan texto; el servidor valida cupos contra la planilla.

No hay avisos por correo configurados. Piscina, horarios y lugares siguen sujetos a confirmación.
