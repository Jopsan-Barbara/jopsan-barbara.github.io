# Activar RSVP en la cuenta personal

Estado: código preparado; servicio sin publicar y sin prueba real de envío.

1. En scarriont@gmail.com, abrir la planilla Invitados. Extensiones > Apps Script.
2. Pegar Code.gs. Los IDs de ambas planillas ya están configurados.
3. Cargar invitados desde la fila 6, con nombre y cupos. Ejecutar prepararInvitaciones_ desde el editor para asignar IDs aleatorios a las invitaciones nuevas. Repetir al agregar invitados. No usar IDs correlativos fáciles de adivinar.
4. Publicar como aplicación web, ejecutada por el propietario. Permitir acceso a invitados sin cuenta de Google. Autorizar el proyecto desde la cuenta personal. Las planillas siguen privadas; el servicio solo acepta respuestas de un ID registrado y no ofrece listados públicos.
5. Copiar URL /exec a rsvp-config.json, propiedad endpoint. No usar URL /dev.
6. Probar un invitado de prueba desde la web: guardar Sí, comprobar fila en Respuestas; reenviar No y comprobar actualización de la misma fila. Probar exceso de cupos y un ID desconocido. Eliminar únicamente la prueba al terminar.
7. Compartir las planillas con los novios cuando sus correos hayan sido confirmados. No hay avisos por correo configurados.

El formulario se sirve en un iframe desde Apps Script y guarda con google.script.run. No se considera enviado hasta que el servidor confirma escritura. Cada ID tiene una respuesta vigente; un nuevo envío la actualiza.

Los parámetros invitado/cupos solo personalizan la invitación. El servidor valida los cupos contra Invitados. El ID actúa como enlace privado: compartirlo permite actualizar esa invitación.

Capacidad actual: 200 invitaciones y 200 respuestas. Ajustar rangos y resúmenes antes de superar ese límite.
