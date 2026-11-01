# Seguridad y privacidad

job-autofill procesa el perfil localmente en el navegador. No envía datos
personales a servidores propios, no incluye telemetría y nunca envía formularios
automáticamente.

Los perfiles personales deben importarse desde archivos locales ignorados por
Git y almacenarse únicamente en `chrome.storage.local` o `browser.storage.local`.
El repositorio solo debe contener `profiles/example.profile.json`, que utiliza
datos ficticios.

Para informar de una vulnerabilidad, abre un aviso privado en GitHub en lugar
de publicar detalles explotables en una issue pública.
