---
name: design-responsive-validation
description: >-
  Mandatory UI gate for Nibiru Paint: keeps a distinctive, cheerful kids' identity (not a
  generic AI layout) and enforces responsive checks from mobile 320px up to desktop, ending
  with a Design & Responsive Validation Report. Use for every UI, layout, styling, component
  or page change.
---

# Design & Responsive Validation

Skill **obligatoria** para cualquier cambio de UI, layout, estilos, componente o página en
**Nibiru Paint**.

## Propósito

Garantizar en cada tarea de UI dos cosas:

1. **Identidad visual** — no parece una web genérica generada por IA; se siente hecha a
   mano y alineada con una app de **dibujo infantil**: alegre, colorida, con carácter (el
   logo arcoíris, el fondo pastel `--bg-joyful`, las animaciones lúdicas).
2. **Integridad responsive** — funciona en móvil, tablet, laptop y desktop, con
   **mobile-first** como suelo (320 px).

## Parte 1 — Originalidad de diseño

### Requisitos

1. Evita layouts SaaS genéricos (hero centrado + 3 columnas de features + CTA).
2. Composición deliberada: jerarquía, espaciado y alineación intencionados.
3. **Sentido de marca infantil**: color, juego, formas amables, motion con gracia — sin
   caer en lo empalagoso ni en lo ilegible.
4. Nada de adornos por defecto sin motivo (degradados vanilla, cards sin tratar).
5. Antes de codear pregúntate: "¿un observador diría que esto es una web genérica de IA?".
   Si sí, rediséñalo.

### Anti-patrones

- Hero centrado con lista de bullets + dos botones pill.
- Fila de 3 cards idénticas icono + título + 2 líneas.
- Acordeones/tablas/testimonios genéricos sin razón editorial.

## Parte 2 — Validación responsive

| Nivel | Ancho | Qué comprobar |
|---|---|---|
| Desktop | ≥ 1440 px | El layout respira; sin huecos huérfanos. |
| Laptop | 1024–1439 px | Sigue funcionando en el breakpoint `lg`. |
| Tablet | 768–1023 px | Transición intencionada, no un desktop aplastado. |
| Mobile | 320–480 px | Suelo mobile-first — 320 px sin scroll horizontal. |

### Checklist (debe pasar en todos los niveles)

- **Sin scroll horizontal** (`overflow-x` limpio).
- **Sin solapes** (z-index, sticky, posicionamiento).
- **Imágenes escalan** (`object-fit`/`aspect-ratio`, `max-width: 100%`).
- **Tipografía legible** — mínimo ~16 px de cuerpo en móvil.
- **Navegación usable** — afordancia visible.
- **Objetivos táctiles ≥ 44×44 px** (ver [[cross-device-compat]]).
- **Espaciado consistente** entre breakpoints.

### Cómo se hace en este stack

- Usa las **variantes responsive de Tailwind** mobile-first: base = móvil, y `sm:`, `md:`,
  `lg:`, `xl:` como mejoras hacia arriba. Nunca desktop-first con overrides `max-*`.

```tsx
// ✅ Mobile-first con Tailwind
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
```

### Cómo validar (obligatorio: contra la app corriendo)

Con las herramientas de **preview del navegador** de esta sesión:

1. `preview_start` con el dev server (`.claude/launch.json` → `dibujos-dev`).
2. `resize_window` a 320 / 768 / 1024 / 1440 y recorre cada uno.
3. `read_console_messages` para errores; `computer` screenshot para inspección visual.
4. `resize_window` con `colorScheme` para modo oscuro si aplica.

## Parte 3 — Informe de validación

Toda tarea de UI termina con este informe:

```
Originalidad de diseño: ✅ / ❌
Desktop (1440px+):      ✅ / ❌
Laptop (1024px+):       ✅ / ❌
Tablet (768px+):        ✅ / ❌
Mobile (320–480px):     ✅ / ❌
Problemas encontrados:
Arreglos aplicados:
```

- La tarea **no está completa** hasta que originalidad y los cuatro breakpoints estén ✅.
- Rellena "Problemas" y "Arreglos" con bullets concretos, o `Ninguno.` si de verdad no hay.

## Related skills

- [[theming-styling]]
- [[accessibility]]
- [[cross-device-compat]]
- [[performance-optimization]]
