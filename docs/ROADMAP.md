# Roadmap

Cada paso termina con: `pnpm lint && pnpm typecheck && pnpm test` en verde y un commit.

- [x] **Paso 1: Esquema v2 del perfil** (campos opcionales, personalizados con `matchLabels`, sensibles, migración v1→v2)
- [x] **Paso 2: Test anti-red + CSP** (el CI falla si el código usa fetch/XHR/WebSocket)
- [ ] **Paso 3: Detección por etiqueta** (`<label>`, ES/EN) usando `matchLabels`
- [ ] **Paso 4: Página de opciones** (editor de perfil, desplegable "Más campos", botón "+")
- [ ] **Paso 5: Exportar / importar JSON** (copia de seguridad) y primer uso guiado
- [ ] **Paso 6: Licencia y autoría** (Apache-2.0, NOTICE, CITATION.cff, política de marca)
- [ ] **Paso 7: Publicación** (GitHub Releases, Firefox AMO, Chrome Web Store)

## Para retomar con Claude

Pega este archivo y escribe: "Continúa en el paso N". Si hay algo a medias, pega también `git status` y el último error.
