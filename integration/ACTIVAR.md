# Publicar la invitación general: formularios y panel

**Invitación pública:** https://jopsan-barbara.github.io/ · **Llegada:** 27 de febrero de 2027, 14:30 h. El enlace es el mismo para todos; no se usan IDs de invitación en la URL.

## 1. Desplegar Google Apps Script

La invitación muestra dos formularios HTML nativos, integrados en el diseño Oliva, sin clic previo. `forms-inline.js` envía las respuestas mediante POST al endpoint `/exec` de `rsvp-config.json`. La función `doPost` de `integration/Code.gs` debe estar publicada en Google Apps Script como una versión nueva de la implementación existente.

El servidor responde mediante un mensaje `jb-inline-form-response-v1`; la página **solo muestra éxito si el servidor confirma expresamente** el registro. Los identificadores enviados siguen el formato `public-UUID`, que el servidor exige para evitar registros duplicados.

Desde el editor de Apps Script de la cuenta propietaria, actualizar el proyecto existente con el contenido vigente de `integration/Code.gs`, guardar y elegir **Implementar > Administrar implementaciones > Editar > Nueva versión > Implementar**, conservando la URL del despliegue si es posible. Verificar los permisos autorizados y que el endpoint del sitio corresponda al despliegue realmente actualizado. No introducir contraseñas, IDs secretos ni credenciales en la web pública.

## 2. Actualizar el panel privado

El panel usa un proyecto Apps Script independiente. Actualizar ese proyecto con `panel/Code.gs` y desplegar una versión nueva. No basta con modificar el código en GitHub.

La versión nueva concilia respuestas recibidas desde el enlace general con invitados previamente registrados por nombre completo, normalizado para diferencias de acentos y mayúsculas. Si un nombre es ambiguo, hay respuestas contradictorias o no se encuentra en la lista original, se informa al operador. Las respuestas repetidas se agrupan para no duplicar los indicadores, tomando la última válida de cada nombre; **dos invitados distintos con exactamente el mismo nombre necesitan revisión manual**.

### Listas numeradas para WhatsApp

La versión actual de `panel/Code.gs` incluye la sección **«Listas para WhatsApp»** con cuatro listas que se actualizan al pulsar **Actualizar**: Confirmados, No asistirán, Pendientes y Canciones solicitadas. Cada botón **«Copiar para WhatsApp»** copia el encabezado con total y una lista numerada desde el número 1. No se copian correos electrónicos ni teléfonos. Si el navegador restringe el portapapeles, aparece un cuadro para seleccionar el texto manualmente.

La dirección del panel es la **URL privada `/exec` del proyecto de Apps Script del panel**, que se obtiene en **Implementar > Administrar implementaciones** dentro de ese proyecto. No corresponde al enlace público de GitHub Pages ni al endpoint de los formularios. **No se ha validado aquí una URL desplegada concreta**.

Para que el correo del usuario esté disponible para `Session.getActiveUser().getEmail()`, configurar el despliegue y sus permisos de forma compatible con la autenticación por cuenta autorizada; validar con las cuentas de los novios y negar acceso a una cuenta no autorizada. Verificar también que los usuarios autorizados tengan los permisos requeridos para leer las hojas de origen. Nunca incluir contraseñas ni listas de invitados en código público, ni compartir la URL del panel en la invitación.

## 3. Prueba obligatoria antes de distribuir

1. Abrir la invitación en una ventana privada, desde teléfono y escritorio, y comprobar que ambos formularios están visibles sin abrir enlaces externos.
2. Registrar una asistencia «Sí» con un nombre de prueba y comprobar que aparece en la pestaña `Respuestas` de la planilla autorizada y en el panel privado. Repetir con una asistencia «No», y comprobar la clasificación.
3. Registrar una canción y comprobar su aparición en la pestaña `Canciones` y en el panel, tanto en el listado visible como en el texto copiado para WhatsApp.
4. Comprobar que las respuestas repetidas no dupliquen personas y que el panel señale respuestas sin coincidencia inequívoca. Probar los cuatro botones de copia en computador y celular y verificar que los elementos copiados tengan numeración consecutiva.
5. Verificar que el contador, la galería, el mapa, las caricaturas y los pagos muestran la experiencia esperada en móviles y desktop. No ejecutar pagos de prueba reales salvo que los novios lo autoricen.
6. Identificar con precisión los registros de prueba y retirarlos solo desde las planillas correspondientes, sin tocar respuestas genuinas.

**Cierre de confirmaciones:** 31 de enero de 2027 a las 23:59, hora de Chile. Las canciones no se cierran automáticamente con RSVP.

**Seguridad:** nunca publicar la planilla privada completa ni incrustar el panel de administración en la invitación. El panel requiere una cuenta Google autorizada. El enlace público no comprueba por sí solo la identidad de los invitados ni los cupos personales.
