# Pantalla de carga

Documentación de la pantalla de carga que se muestra **antes que todo** lo demás,
al entrar en la aplicación.

## Objetivo

Dar una entrada con carácter a la app: un logo que cobra vida (de blanco y negro
a color) mientras carga y, al completarse, una transición en la que la cámara
"entra" dentro del logo para revelar la página.

## Idea / Concepto

1. **Logo centrado** en pantalla, inicialmente en **blanco y negro**.
2. Conforme avanza la carga (0% → 100%), el logo **se pinta de color**
   progresivamente.
3. Al llegar al **100%**, con animaciones de **GSAP** el logo **se amplía**
   hasta producir el efecto de **entrar dentro de él** (zoom in), y al terminar
   ese efecto **aparece la página**.

## Comportamiento

- **Cuándo aparece:** al cargar la app, antes de renderizar el contenido
  principal. Es lo primero que ve el usuario.
- **Progreso:** el rellenado de color está ligado al progreso de carga
  (0% → 100%).
- **Cuándo desaparece:** al completar la animación de zoom/entrada tras el 100%.
- **Transición de salida:** zoom in sobre el logo (efecto "entrar dentro")
  que da paso a la página.

## Logo

- **Marca:** NIBIRU PAINT — texto multicolor con una estrella sonriente encima y
  salpicaduras de pintura a los lados.
- **Formato:** imagen **raster** WebP con transparencia (`VP8X`), no SVG.
- **Ubicación:** `public/logo.webp` ✅ (ya en el repo).
- **Dimensiones:** 900 × 237 px (banner horizontal, ratio ≈ 3.8:1). Al ser tan
  apaisado, se centra con un ancho responsive (p. ej. `min(80vw, 640px)`).
- **Implicación técnica:** al ser raster no se pueden animar trazos individuales;
  el coloreado se hace con **dos capas apiladas + máscara/`clip-path`** (ver
  Implementación).

## Diseño

- **Elemento principal:** el logo, centrado.
- **Estados del logo:**
  - Inicial: blanco y negro (escala de grises / desaturado).
  - Progreso: se colorea gradualmente según el %.
  - Final (100%): a todo color, justo antes del zoom.
- **Animación de salida:** escalado del logo con GSAP hasta "entrar" en él y
  revelar la página.
- **Paleta:** la app usa `ink`, `paper`, `ochre`, `ochre-dark`, `moss`, `rule`.

## Implementación

- **Librería de animación:** GSAP (por añadir a las dependencias).
- **Ubicación en el código:** componente React overlay (`client:load`) montado
  sobre la app, con posición fija cubriendo toda la pantalla y un `z-index` alto.
- **Coloreado progresivo (técnica):**
  - Dos copias apiladas del mismo `logo.png`:
    - Capa inferior: a **todo color**.
    - Capa superior: en **blanco y negro** con `filter: grayscale(1)`.
  - Se revela el color animando un **`clip-path`** (o máscara) sobre la capa
    gris, ligado al progreso `0 → 1`.
  - Alternativa más simple si no importa la dirección: animar
    `grayscale(1) → grayscale(0)` de forma uniforme.
- **Salida con GSAP:** timeline que al 100% escala el logo (`scale`) con easing
  de aceleración hasta llenar/atravesar la pantalla, desvaneciendo el overlay
  para "entrar" en el logo y revelar la página.
- **Notas técnicas:** respetar `prefers-reduced-motion` (saltar el zoom y hacer
  un fundido simple).

## Decisiones tomadas

- **Logo:** NIBIRU PAINT, **WebP raster** en `public/logo.webp` (900×237). Se
  descarta vectorizar a SVG (el trazado automático estropearía degradados/brillos
  y no hay archivo vectorial original).
- **Coloreado:** **barrido direccional** con **dos capas** apiladas del PNG
  (color debajo + `grayscale(1)` encima) revelando el color con `clip-path`.
- **Salida:** zoom de entrada con GSAP.

## Preguntas abiertas

- [ ] **¿El progreso es real o simulado?** ¿Se ata a la carga real de recursos
      o es una animación temporizada (p. ej. 2–3 s)?
- [ ] **¿Dirección exacta del barrido?** izquierda→derecha (propuesta por
      defecto, se lee como el texto), abajo→arriba o radial.
- [ ] **¿Se muestra un % o barra**, o solo el logo coloreándose?
- [ ] **¿Fondo de la pantalla de carga?** ¿`paper` (crema de la app), blanco, u
      otro?

## Estado: implementado ✅

- **Componente:** `src/components/LoadingScreen.tsx` (React, `client:load`).
- **Montaje:** en `src/layouts/Layout.astro`, como primer hijo del `<body>`.
- **Estilos:** bloque "Pantalla de carga" en `src/styles/global.css`.
- **Dependencia:** `gsap` ^3.15.0.
- **Parámetros:** `MIN_DURATION_MS = 2200`; zoom de salida `scale: 22`
  (`power3.in`) con fundido del overlay.

### Progreso ligado a la carga real

El barrido sigue el progreso **real** de carga de la página mediante hitos del
navegador (fracción `0..1`):

- DOM listo (`DOMContentLoaded` / `readyState`) → 0.35
- Fuentes listas (`document.fonts.ready`) → 0.65
- Todos los recursos (`window.load`) → 1.0

Cada frame: `mostrado = min(cargaReal_suavizada, tiempo / MIN_DURATION_MS)`.

- Si la página carga **más rápido** que el mínimo, el barrido tarda exactamente
  `MIN_DURATION_MS` (~2,2 s).
- Si carga **más lento**, el barrido sigue la carga real y termina poco después
  de `window.load`.

Solo se suaviza (lerp) la fracción de carga, que llega a saltos; el tope de
tiempo ya es continuo, por eso el suelo es exactamente el mínimo.

### Nota de comportamiento (rAF y pestañas ocultas)

GSAP usa `requestAnimationFrame`, que el navegador **pausa cuando la pestaña no
está visible**. Si la app se abre en una pestaña en segundo plano, el barrido se
congela y se reanuda al enfocar la pestaña (la animación se reproduce cuando el
usuario realmente la mira). Es el comportamiento deseado, no un fallo.

## Pendientes

- [x] Añadir el logo al repo (`public/logo.webp`).
- [x] Añadir GSAP al proyecto.
- [x] Coloreado progresivo (capas + `clip-path`).
- [x] Animación de zoom/entrada con GSAP.
- [x] Integrar con la carga real de la app (`window.load` + duración mínima).
- [x] Soportar `prefers-reduced-motion` (salta el zoom, fundido simple).
