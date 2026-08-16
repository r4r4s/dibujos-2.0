# Nibiru Paint

Aplicación web construida con Astro + React.

## Requisitos

- Node.js `>=22.12.0`

## Puesta en marcha

1. Instala dependencias:

   ```sh
   npm install
   ```

2. Arranca la app:

   ```sh
   npm run dev
   ```

   Disponible en `http://localhost:4321`.

## Comandos

| Comando           | Acción                              |
| :---------------- | :---------------------------------- |
| `npm run dev`     | Servidor de desarrollo              |
| `npm run build`   | Compila el sitio a `./dist/`        |
| `npm run preview` | Previsualiza el build de producción |

## Estructura

```text
/
├── public/                       # Assets estáticos (favicon, logo)
├── docs/                         # Documentación del proyecto
├── src/
│   ├── components/
│   │   └── LoadingScreen.tsx     # Pantalla de carga (barrido de color + zoom GSAP)
│   ├── layouts/
│   │   └── Layout.astro
│   ├── lib/
│   │   └── gsap.ts               # GSAP con plugins registrados
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       └── global.css
└── astro.config.mjs
```
