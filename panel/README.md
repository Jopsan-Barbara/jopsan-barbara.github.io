# Panel privado de los novios

Proyecto de Apps Script independiente del formulario público. Publicar ejecutando como el usuario que accede, con acceso para usuarios con cuenta de Google. Nunca ejecutar este panel como el propietario: getActiveUser no identifica de forma fiable a invitados externos en ese modo.

El servidor comprueba la cuenta en cada lectura y antes de servir la interfaz. Lista permitida: scarriont@gmail.com, Jopsan.a.v@gmail.com y Bamh.3003@gmail.com. Si la cuenta está vacía o no coincide se deniega todo. No se acepta identidad enviada por parámetros.

Compartir exclusivamente las dos planillas con las cuentas de los novios como lectores. El proyecto no tiene funciones de escritura. Los filtros se aplican a las mismas filas usadas por indicadores, barras y detalle. No se guarda información en localStorage ni se incluye en parámetros URL.

Grano: una invitación, con su respuesta vigente. Cupos pendientes son los cupos de invitaciones sin responder; personas confirmadas suma únicamente las respuestas Sí. Las indicaciones alimentarias se cuentan por invitación, no por persona. No se suman respuestas sin ID vinculado. Duplicados o valores inválidos detienen la carga en lugar de producir cifras engañosas.

Límite: 200 invitaciones, coherente con las planillas y el formulario. Sin datos reales cargados, el panel muestra ceros y un estado vacío.


Implementación: https://script.google.com/macros/s/AKfycbyuJCaM-awsmWY3OCfAC1RvWk7dwYNlbcEmTeZI0Pt5yonWSY3GfJ0WgpBgIT4eLw/exec

Estado: publicado con ejecución como usuario; ambas planillas compartidas como lector con los novios. La primera autorización de Google está pendiente; todavía no se ha validado la carga real de datos en la implementación. Pruebas locales: autorización cerrada por defecto, cruce de respuestas, totales, duplicados y estado vacío.
