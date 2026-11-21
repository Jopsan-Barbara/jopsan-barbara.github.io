# Activación de Google Forms

La web admite dos enlaces públicos mediante las claves rsvpForm y songForm de rsvp-config.json y mantiene el diseño existente. No publicar URLs de edición ni habilitar los resúmenes públicos de respuestas.

En una sesión autenticada de Google, ejecutar prepararGoogleForms de integration/CREAR_FORMULARIOS.gs una sola vez, verificar que ambos formularios acepten respuestas sin iniciar sesión y que las vistas del libro privado reciban correctamente los registros. El script crea dos formularios vinculados a la planilla existente, conserva los registros previos y prepara el cierre de confirmaciones. Si falla a mitad de ejecución, revisar las propiedades y pestañas antes de reintentar.

Copiar exclusivamente los enlaces públicos devueltos por la función a rsvp-config.json. Probar un Sí, un No y una canción en navegador sin sesión. Verificar y retirar únicamente los registros de prueba. No habilitar la distribución de la invitación hasta completar estas verificaciones.

Panel privado: https://docs.google.com/spreadsheets/d/1WVDs5uB8MjFG2TwyTrhEU5H5U_4hQrfyQRj3mtRxMTY/edit
