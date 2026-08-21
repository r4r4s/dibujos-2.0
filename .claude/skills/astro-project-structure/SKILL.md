---
name: astro-project-structure
description: >-
  The standard, most-used Astro project structure and where every kind of file belongs
  (pages, components, layouts, styles, assets, content collections, utilities, public
  assets, config). Use whenever creating a new file, page, route, component or asset, or
  deciding where something should live, so the project keeps Astro's conventional layout.
---

# 🗂️ Astro Project Structure

Regla para mantener **Nibiru Paint** con la estructura de proyecto **convencional de
Astro** (la más usada en la comunidad y la que recomienda la doc oficial). Al crear
cualquier archivo, colócalo según esta tabla.

## Estructura estándar

```
/
├── public/                 # Assets estáticos servidos TAL CUAL (no se procesan)
├── src/
│   ├── assets/             # Imágenes/assets que SÍ procesa Astro (astro:assets)
│   ├── components/         # Componentes reutilizables (.astro, .tsx/.jsx, .vue…)
│   ├── content/            # Content collections (Markdown/MDX/datos)
│   ├── content.config.ts   # Config de las content collections (Astro actual)
│   ├── layouts/            # Layouts compartidos (.astro)
│   ├── lib/  (o utils/)    # Helpers/utilidades JS/TS que no son componentes
│   ├── pages/              # OBLIGATORIO — enrutado por archivos
│   └── styles/             # CSS/estilos globales
├── astro.config.mjs        # Config del proyecto (integraciones, adapter, Vite)
├── tsconfig.json           # Config de TypeScript
└── package.json            # Dependencias y scripts
```

### Qué es obligatorio y qué es convención

| Carpeta/archivo | Estado | Propósito |
|---|---|---|
| `src/pages/` | **Obligatorio** | Enrutado por archivos: cada archivo soportado = una ruta. Sin ella no hay páginas. |
| `public/` | Estándar | Assets servidos sin procesar (favicon, `robots.txt`, manifests, fuentes). No pongas aquí JS/CSS propio. |
| `src/components/` | Convención | Componentes reutilizables. |
| `src/layouts/` | Convención | Estructura de página compartida. |
| `src/styles/` | Convención | CSS/estilos (pueden ir en cualquier sitio de `src/` si se importan). |
| `src/assets/` | Convención | Imágenes procesadas por Astro (`<Image />` de `astro:assets`). |
| `src/content/` + `src/content.config.ts` | Convención | Content collections. El config va en `src/content.config.ts` (no `src/content/config.ts`). |
| `src/lib/` o `src/utils/` | Comunidad | Utilidades no-componente (p. ej. este proyecto ya tiene `src/lib/gsap.ts`). |
| `astro.config.mjs`, `tsconfig.json`, `package.json` | Root | Config del proyecto en la raíz. |

## Reglas de dónde va cada cosa

1. **Páginas y rutas** → `src/pages/`. Un archivo `.astro`/`.md`/`.mdx` = una ruta por su
   nombre. Rutas dinámicas con `[param].astro`; endpoints con `.ts` (`export const GET…`).
2. **Componentes** → `src/components/`. Astro para lo estático (cero JS); React (`.tsx`)
   solo cuando hace falta estado/efectos, hidratado con `client:*` (ver
   [[performance-optimization]]).
3. **Layouts** → `src/layouts/`. Un `.astro` con `<slot />` que envuelve páginas.
4. **Estilos** → `src/styles/`. Los globales (como `global.css`) se importan desde el
   layout. Tokens y reglas en [[theming-styling]].
5. **Imágenes a procesar** (optimización/responsive) → `src/assets/` y usa `astro:assets`.
   Imágenes servidas tal cual (como `logo.webp`, `favicon.ico`) → `public/`.
6. **Content collections** (blog, catálogos, datos MD/MDX) → `src/content/<colección>/` con
   el esquema en `src/content.config.ts`.
7. **Utilidades/helpers** (funciones, clientes, config JS/TS) → `src/lib/` (mantén el mismo
   nombre que ya usa el proyecto; no mezcles `lib/` y `utils/`).
8. **Config del proyecto** → siempre en la raíz, nunca dentro de `src/`.

## Convenciones de nombres

- Componentes y layouts `.astro`/`.tsx`: **PascalCase** (`LoadingScreen.tsx`,
  `Layout.astro`).
- Páginas y rutas: **minúsculas/kebab-case** (`index.astro`, `sobre-nosotros.astro`,
  `[slug].astro`) — el nombre del archivo ES la URL.
- Helpers en `src/lib`: **kebab-case** o camelCase coherente con lo existente.

## Antes de crear un archivo

Pregúntate: ¿es una ruta, un componente, un layout, un estilo, un asset, contenido o una
utilidad? Colócalo en la carpeta correspondiente de la tabla. Si no encaja en ninguna
convención, prefiere `src/lib/` para lógica o `src/components/` para UI, antes de inventar
una carpeta nueva.

## Related skills

- [[theming-styling]]
- [[performance-optimization]]
- [[design-responsive-validation]]
