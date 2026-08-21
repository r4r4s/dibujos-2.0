---
name: accessibility
description: >-
  WCAG 2.1 AA basics for Nibiru Paint (Astro + React): semantic HTML, color contrast,
  visible focus, keyboard navigation, descriptive alt text and labelled forms. Use when
  building or reviewing any UI, adding interactive controls, images or forms.
---

# ♿ Accessibility (a11y)

WCAG 2.1 AA para **Nibiru Paint**. Al ser una app pensada para niños, la claridad y los
objetivos táctiles grandes importan aún más.

## Checklist

- **HTML semántico**: `<header>`, `<main>`, `<nav>`, `<section>`, `<button>` reales — no
  `<div>` con `onClick`.
- **Jerarquía de encabezados**: un solo `<h1>` por página, sin saltar niveles.
- **Contraste**: ≥ 4.5:1 texto normal, ≥ 3:1 texto grande. Ojo con el texto sobre el fondo
  pastel `--bg-joyful`: verifica el contraste (el texto usa `--color-ink`).
- **Foco visible**: nunca `outline: none` sin sustituto. Usa `focus-visible:` de Tailwind
  (p. ej. `focus-visible:ring-2 focus-visible:ring-ochre`).
- **Teclado**: todo elemento interactivo alcanzable con `Tab`; los modales atrapan el foco.
- **ARIA solo cuando el HTML semántico no basta**: `aria-label`, `aria-current`,
  `aria-expanded`, `aria-live` para regiones dinámicas. Lo decorativo, `aria-hidden="true"`
  (como ya hace la capa gris y los puntos del loader).
- **Alt text**: imágenes informativas con alt descriptivo; decorativas con `alt=""`.
  El logo del loader usa `alt="Nibiru Paint"` y su copia gris `alt="" aria-hidden`.
- **Formularios**: cada input con su `<label>` asociado.
- **Objetivos táctiles** ≥ 44×44 px (ver [[cross-device-compat]]).

## Ejemplos (React / Astro)

```tsx
// ✅ Botón real, foco visible con token
<button
  type="button"
  className="rounded-full bg-ink px-5 py-2.5 text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre"
>
  Elegir color
</button>

// ❌ div clicable, sin foco ni rol
<div className="btn" onClick={pick}>Elegir color</div>
```

```tsx
// ✅ Región viva para anunciar cambios (p. ej. estado de carga)
<p aria-live="polite" className="sr-only">{estado}</p>
```

`sr-only` es una utilidad de Tailwind (ya disponible), no hace falta definirla.

## Herramientas automáticas (opcional, aún no instaladas)

Este proyecto **no** trae todavía auditoría automática. Si se quiere, se pueden añadir:

- `eslint-plugin-jsx-a11y` para los componentes React.
- `@axe-core/playwright` o Lighthouse para auditar en CI.

Mientras tanto, valida a mano con el **preview del navegador** (navegación por teclado,
zoom de texto, inspección de contraste). Ver el flujo de verificación en
[[design-responsive-validation]].

## Related skills

- [[theming-styling]]
- [[design-responsive-validation]]
- [[cross-device-compat]]
