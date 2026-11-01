# job-autofill

> **Estado: alpha.** Los selectores de Workday y SuccessFactors pueden requerir
> ajustes según el portal, tenant o versión.

Extensión de navegador (Chrome y Firefox) que autocompleta formularios de
empleo repetitivos (Workday, SuccessFactors y formularios genéricos) a partir
de un perfil local. **Rellena, pero nunca envía**: tú revisas y pulsas enviar.

![CI](https://github.com/juanbry/AutoFill/actions/workflows/ci.yml/badge.svg)

## Características

- Motor compatible con React, Angular y Vue (eventos nativos, setter del prototipo).
- Soporte de Shadow DOM, desplegables personalizados y carga diferida (SPA).
- Mapeos declarativos por portal en `mappings/*.json`.
- Modo *dry-run* con informe campo a campo.
- Privacidad: sin servidores, sin telemetría y sin peticiones de red.
- Permisos mínimos: sin acceso permanente a ningún sitio (`activeTab`).

## Requisitos

- Node.js >= 20
- pnpm >= 9 (`corepack enable`)
- Chrome/Chromium >= 120 o Firefox >= 128

## Instalación

```bash
git clone https://github.com/juanbry/AutoFill.git
cd AutoFill
pnpm install
```

## Configurar tu perfil

1. Copia `profiles/example.profile.json` a `profiles/me.local.json`.
2. Edita `profiles/me.local.json` con tus datos.
3. En el popup, importa el archivo. Se valida y se guarda en `chrome.storage.local`.

Los archivos `*.local.json` están ignorados por git.

## Ejecución en local

```bash
pnpm dev
pnpm dev:firefox
```

## Uso

1. Abre el formulario de la oferta.
2. Pulsa el icono de la extensión.
3. Marca **Simulación (dry-run)** para comprobar los campos.
4. Pulsa **Autocompletar**, revisa el informe y envía tú el formulario.

Los campos sensibles se omiten salvo que actives la opción correspondiente.

## Tests y calidad

```bash
pnpm test
pnpm test:e2e
pnpm lint
pnpm typecheck
```

El test e2e usa React 18 sobre Chromium para verificar que los eventos actualizan
el estado interno de inputs controlados. `lefthook` ejecuta gitleaks y Biome
antes de cada commit; instala gitleaks localmente para activar esa protección.

Antes de publicar, comprueba que solo el perfil ficticio esté versionado:

```bash
git ls-files profiles/
gitleaks detect --redact
```

## Seguridad y privacidad

- Consulta [PRIVACY.md](./PRIVACY.md) para conocer las garantías y verificaciones
  de privacidad.
- Ningún dato personal real debe estar en el repositorio.
- El motor ignora campos `password`, `file`, `hidden` y botones de envío.
- Las exportaciones de respaldo pueden cifrarse con AES-GCM y PBKDF2.
- El motor nunca envía formularios automáticamente.

## Licencia

MIT