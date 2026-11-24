# Dashboard exclusivo de Jopsan y Bárbara

**Este panel no se publica dentro del sitio de invitación ni se enlaza desde sus páginas.** Funciona como una aplicación web independiente alojada en Google Apps Script.

## Qué verán los novios

El panel entrega un resumen de invitados y las listas de **Confirmados**, **No asistirán**, **Pendientes** y **Canciones solicitadas**. Cada lista incluye recuento, elementos numerados y el botón **Copiar para WhatsApp**, que prepara el texto con números y encabezado (ej.: `*Confirmados (3)*`).

La fuente de datos son las dos planillas privadas de Google Sheets ya configuradas en `panel/Code.gs`. No se entregan datos privados a GitHub Pages.

## Activar el único enlace (cuenta propietaria de las planillas)

1. Entra en el proyecto de **Google Apps Script del panel de novios** (no el proyecto público de recepción de formularios). Si todavía no existe, crea un proyecto independiente desde [script.google.com](https://script.google.com/).
2. Sustituye su archivo `Code.gs` por el [código actualizado del panel](https://github.com/jopsan-barbara/jopsan-barbara.github.io/blob/main/panel/Code.gs), guárdalo y no copies las contraseñas ni enlaces completos al repositorio.
3. En Apps Script selecciona **Implementar > Nueva implementación > Aplicación web** (o editar la implementación anterior y seleccionar nueva versión). Para un acceso *sin iniciar sesión*, selecciona **Ejecutar como: Yo** y **Quién tiene acceso: Cualquier usuario**, si tu cuenta de Google lo permite. **Esto no publica los datos sin protección:** el servidor exige además el token secreto que únicamente aparecerá en el enlace generado. La cuenta que implementa debe tener acceso a ambas planillas.
4. Autoriza los permisos que Google solicite para leer las planillas.
5. Cuando el despliegue muestre su URL `/exec`, vuelve al editor de Apps Script y ejecuta la función **`obtenerEnlaceNovios`**. Google mostrará el resultado en el registro de ejecución. **Copia el enlace completo, incluido `?acceso=...`**. No compartas el enlace `/exec` sin token.
6. Abre el enlace completo en una ventana privada. Comprueba que aparecen los indicadores y las cuatro listas, que las respuestas coinciden con Google Sheets y que cada botón copia una lista numerada. Comprueba también que el mismo enlace *sin* `?acceso=...` responde «Acceso restringido».
7. Envía **solo ese enlace completo** a Jopsan y Bárbara. No crees un botón, menú, QR, metadato ni enlace a él dentro de la web de la invitación.

## Seguridad y administración

- El panel **no pide contraseña ni inicio de sesión**. **Cualquier persona que obtenga el enlace completo podrá consultarlo**, por lo que hay que tratarlo como una contraseña. Es adecuado para la modalidad «solo quienes tengan el enlace», pero no equivale a verificar la identidad de los dos novios.
- El token se genera con dos UUID aleatorios y se conserva únicamente en `PropertiesService.getScriptProperties()`, dentro del proyecto privado de Apps Script. GitHub contiene el código, **no el token generado**.
- En caso de filtración o envío equivocado, ejecuta **`renovarEnlaceNovios`** desde el editor. Esto invalida de inmediato el enlace anterior y entrega uno nuevo que debes enviar a los novios.
- No utilices una publicación de GitHub Pages para mostrar el dashboard real: las páginas estáticas no ofrecen control de acceso sobre los datos privados.
- Si el panel ya estaba desplegado, **publicar cambios en GitHub no actualiza Apps Script**. Se debe copiar el nuevo código y editar el despliegue con una **nueva versión**.
- No activar «Cualquiera» si la política de la cuenta Google lo prohíbe; en ese caso, se necesita un modo con autenticación Google (requiere iniciar sesión).

## Comprobación de funcionamiento

La lista de **Confirmados** no debe duplicar respuestas del mismo invitado; las coincidencias ambiguas se muestran como alertas para revisión. Las listas para WhatsApp son independientes de los filtros de la tabla principal y se copian con numeración `1.`, `2.`, `3.`, etc. Los nombres y canciones se toman de Sheets; no se genera contenido ficticio.

**Estado actual:** el código del panel y el acceso por enlace exclusivo están preparados en GitHub. Para obtener una URL real hay que completar el despliegue en Apps Script desde la cuenta propietaria. No debe inventarse una URL antes de terminar esta operación.
