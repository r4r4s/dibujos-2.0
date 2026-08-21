---
name: cross-device-compat
description: >-
  Cross-browser and cross-device compatibility for Nibiru Paint (Astro + React + Tailwind):
  hover guards for touch devices, prefers-reduced-motion, touch target sizes, vendor
  prefixes where still needed, and WebP imagery. Use for any CSS/UI change that must work
  on desktop, iOS Safari and Android Chrome.
---

# 💻 Cross-Device Compatibility

Que **Nibiru Paint** funcione y se vea bien en Chrome/Firefox/Edge/Safari de escritorio,
iOS Safari y Android Chrome — sin renunciar al CSS moderno.

> Nota de stack: aquí **no** hay SCSS ni `.browserslistrc`. Astro/Vite transpila el CSS con
> esbuild y añade prefijos según el target por defecto de Vite. Estas reglas son las que
> siguen dependiendo de ti al escribir estilos o componentes.

## Regla 1 — Hover solo en dispositivos con puntero fino (MANDATORY)

Los `:hover` que cambian layout/estado deben ir tras un guard, o en móvil se quedan
"pegados" al tocar.

```css
/* ✅ Hover solo con puntero fino */
@media (hover: hover) and (pointer: fine) {
  .card:hover { transform: translateY(-2px); }
}
```

Con Tailwind, para efectos que no deban pegarse en táctil, envuélvelos en ese media query
en `global.css` o usa variantes con cuidado. Efectos puramente decorativos que se resetean
solos (p. ej. `opacity`) pueden ir sin guard, pero verifícalo en iOS.

## Regla 2 — prefers-reduced-motion (MANDATORY)

Toda animación/transición respeta la preferencia de movimiento reducido. Ya se aplica en:

- `LoadingScreen.tsx` (salta el zoom, hace fundido simple).
- `global.css` (`.loader-dots` sin animación con `prefers-reduced-motion`).

Patrón para animaciones nuevas:

```css
@media (prefers-reduced-motion: reduce) {
  .algo { animation: none; transition: none; }
}
```

En JS (como el loader) se comprueba con
`window.matchMedia('(prefers-reduced-motion: reduce)').matches`.

## Regla 3 — Objetivos táctiles ≥ 44×44 px

Botones, enlaces e íconos con área táctil mínima 44×44 px (WCAG 2.5.5, esperado por iOS).
Usa `min-h`/`min-w` o padding suficiente.

```tsx
<button className="min-h-11 min-w-11 …">  {/* 44px = 11 * 4px */}
```

## Regla 4 — Prefijos que aún hacen falta

- `backdrop-filter`: acompáñalo **siempre** de `-webkit-backdrop-filter` (Safari).
- La mayoría del resto (flex `gap`, `aspect-ratio`, `inset`) ya no necesita prefijo en los
  navegadores objetivo actuales.

```css
-webkit-backdrop-filter: blur(16px);
backdrop-filter: blur(16px);
```

## Regla 5 — Imágenes

- **WebP** como formato por defecto para raster (el logo ya es `logo.webp`).
- SVG para íconos/vectores.
- Da siempre `width`/`height` (o `aspect-ratio`) para evitar saltos de layout (CLS).

## Verificación

Usa el **preview del navegador**: `resize_window` a móvil/tablet/desktop y modo oscuro,
recarga y comprueba que no hay hovers pegados ni scroll horizontal. Ver flujo en
[[design-responsive-validation]].

## Related skills

- [[theming-styling]]
- [[accessibility]]
- [[performance-optimization]]
- [[design-responsive-validation]]
