# Privacidad

job-autofill funciona **íntegramente en tu navegador**.

- **Sin servidores:** no existe ningún backend. No enviamos tus datos a nadie.
- **Sin telemetría ni analítica:** no medimos ni rastreamos nada.
- **Sin red:** el código no realiza peticiones de red. Esto se comprueba con tests y en cada build (`pnpm verify:build`).
- **Almacenamiento local:** tu perfil se guarda en el almacenamiento local de tu navegador. Puedes exportarlo, importarlo o borrarlo cuando quieras.
- **Permisos mínimos:** `storage`, `activeTab` y `scripting`. No tiene acceso permanente a ningún sitio web.
- **Campos sensibles desactivados por defecto:** identidad, salario y autorización laboral solo se rellenan si tú lo activas.
- **No envía formularios:** rellena, pero la decisión de enviar siempre es tuya.

Todo el código es abierto y puedes compilarlo y auditarlo tú mismo.
