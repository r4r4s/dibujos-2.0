---
name: performance-optimization
description: >-
  Core Web Vitals discipline for Nibiru Paint (Astro + React): minimal client hydration via
  Astro islands, WebP imagery with explicit dimensions, font-display swap, and keeping the
  shipped JS small. Use for any change that could move LCP, CLS or INP, or add a dependency.
---

# ⚡ Performance Optimization

Mantener **Nibiru Paint** rápido, sobre todo en móvil.

## Objetivos

- **LCP** < 2.5 s en 4G.
- **CLS** < 0.1.
- **INP** < 200 ms.

## Técnicas (stack Astro + React)

- **Islas de Astro**: por defecto los componentes se renderizan a HTML sin JS. Hidrata solo
  lo interactivo y con la directiva más barata posible:
  - `client:visible` para lo que está bajo el pliegue.
  - `client:idle` para interactividad no urgente.
  - `client:load` solo cuando debe estar activo desde el primer instante (como
    `LoadingScreen`, que necesita animar al cargar).
- **Menos JS**: prefiere componentes `.astro` (cero JS) para lo estático; reserva React para
  lo que de verdad necesita estado/efectos.
- **`prerender`**: usa páginas estáticas cuando no necesiten servidor. El proyecto usa
  `output: 'server'` con `@astrojs/node`; marca `export const prerender = true` en las rutas
  que puedan ser estáticas.

## Imágenes

- **WebP** como formato canónico para raster (el logo ya es `public/logo.webp`).
- **SVG** para íconos/logos vectoriales.
- **Dimensiones explícitas siempre** (`width`/`height` o `aspect-ratio`) para no provocar
  CLS.
- Para imágenes procesadas en build, considera el componente `<Image />` de `astro:assets`
  (genera WebP y tamaños responsive). Los assets de `public/` se sirven tal cual, sin
  optimizar — úsalos ya optimizados.

```astro
---
import { Image } from 'astro:assets';
import poster from '../assets/poster.png';
---
<Image src={poster} width={320} height={400} format="webp" alt="Dibujo de ejemplo" />
```

## Fuentes

- Google Fonts con `display=swap` y `preconnect` (ya configurado en `Layout.astro`).
- Pide solo los pesos que uses (hoy: Fraunces 500/700, IBM Plex Sans 400/500/600,
  Roboto 400/500).

## Auditoría

- `npm run build` y revisa el tamaño de los chunks emitidos en `dist/`.
- Antes de añadir una dependencia pesada (p. ej. GSAP ya está), valora si Astro/CSS puro lo
  resuelve.
- Opcional (no instalado): Lighthouse / `web-vitals` para medir en real.

## Related skills

- [[cross-device-compat]]
- [[design-responsive-validation]]
- [[theming-styling]]
