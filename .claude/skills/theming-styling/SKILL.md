---
name: theming-styling
description: >-
  Tailwind CSS v4 design-token system for Nibiru Paint: the @theme tokens in
  src/styles/global.css (colors, fonts) and the no-hardcoded-values rule. Use for any
  styling, color, spacing, typography or theming change so every surface uses the shared
  tokens instead of literal values.
---

# 🎨 Theming & Styling

Design tokens and styling conventions for **Nibiru Paint** (Astro + React + Tailwind CSS v4).

## Purpose

Single source of truth for colors and typography. Components use Tailwind utility classes
that resolve to `@theme` tokens — never literal hex/rgb values inline.

## Where tokens live

All tokens are defined with Tailwind v4's `@theme` block in
[`src/styles/global.css`](../../../src/styles/global.css). That file is imported once from
[`src/layouts/Layout.astro`](../../../src/layouts/Layout.astro).

### Color tokens (current)

| Token | Value | Uso |
|---|---|---|
| `--color-ink` | `#1a1713` | Texto principal |
| `--color-paper` | `#f4efe6` | (Base crema; hoy el fondo usa `--bg-joyful`) |
| `--color-paper-2` | `#ebe4d6` | Superficies secundarias |
| `--color-rule` | `#d8cfc0` | Bordes / separadores |
| `--color-ochre` | `#b4531a` | Acento cálido |
| `--color-ochre-dark` | `#8c3d12` | Acento cálido (hover) |
| `--color-moss` | `#3f6b4a` | Acento verde |

Each `--color-*` token automatically generates Tailwind utilities: `bg-ink`, `text-ochre`,
`border-rule`, `bg-ochre/8` (con opacidad), etc.

### Fonts

- `--font-sans`: **IBM Plex Sans** → `font-sans`.
- `--font-serif`: **Fraunces** → `font-serif`.
- **Roboto** se carga aparte (Google Fonts en `Layout.astro`) y se usa solo en el texto de
  la pantalla de carga (`.loader-text`).

Las fuentes se enlazan desde Google Fonts en el `<head>` de `Layout.astro` con
`display=swap` y `preconnect`.

### Fondo alegre (público infantil)

El fondo de la app es `--bg-joyful` (definido en `:root` de `global.css`): un degradado
claro con burbujas pastel que combinan con el logo. Se aplica a `body` y a
`.loader-overlay`.

## Hard rules

1. **Nunca** hardcodees colores en componentes. Usa utilidades de Tailwind sobre los
   tokens (`bg-ochre`, `text-ink/70`, …).
2. Si necesitas un color nuevo recurrente, **añádelo como token** `--color-*` en el
   `@theme` de `global.css`, no lo inlines.
3. CSS "a mano" (fuera de Tailwind) solo para lo que las utilidades no cubren bien
   (animaciones con `@keyframes`, `clip-path`, gradientes complejos como `--bg-joyful`).
   Va en el bloque correspondiente de `global.css`.
4. Respeta la identidad **alegre e infantil** (ver [[design-responsive-validation]]).
5. Toda animación/transición respeta `prefers-reduced-motion` (ver [[cross-device-compat]]).

## Ejemplo

```tsx
// ✅ Utilidades sobre tokens
<button className="rounded-full bg-ochre px-5 py-2.5 text-sm font-medium text-white hover:bg-ochre-dark">
  Pintar
</button>

// ❌ Color hardcodeado
<button style={{ background: '#b4531a' }}>Pintar</button>
```

## Related skills

- [[design-responsive-validation]]
- [[accessibility]]
- [[cross-device-compat]]
