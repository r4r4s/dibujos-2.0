# Dibujos 2.0

Interfaz web para quitar marcas de procedencia (C2PA, EXIF/XMP y Unicode
invisible) de imágenes, PDF, SVG y documentos. El procesamiento lo hace
[watermarks-remover](https://github.com/guillaumemeyer/watermarks-remover); esta
app es un frontend en Astro + React que expone un proxy hacia ese servicio.

## Requisitos

- Node.js `>=22.12.0`
- El servicio watermarks-remover corriendo (ver abajo)

## Puesta en marcha

1. Instala dependencias:

   ```sh
   npm install
   ```

2. Copia la configuración de entorno:

   ```sh
   cp .env.example .env
   ```

3. Arranca el servicio watermarks-remover (elige **una** opción):

   - **Docker** (recomendado):

     ```sh
     docker compose up -d
     ```

   - **Python** (usa el código en `vendor/watermarks-remover`, requiere
     `python3.11` y sus dependencias):

     ```sh
     npm run watermarks
     ```

4. Arranca la app:

   ```sh
   npm run dev
   ```

   Disponible en `http://localhost:4321`.

## Configuración

Las variables de entorno se leen en runtime desde `.env` (ver `.env.example`):

| Variable                     | Descripción                                                        | Por defecto             |
| :--------------------------- | :----------------------------------------------------------------- | :---------------------- |
| `WATERMARKS_SERVICE_URL`     | URL base del servicio watermarks-remover.                          | `http://127.0.0.1:8765` |
| `WATERMARKS_SERVER_API_KEY`  | API key opcional; se envía como `Authorization: Bearer` al proxy.  | _(vacío)_               |

## Comandos

| Comando            | Acción                                              |
| :----------------- | :-------------------------------------------------- |
| `npm run dev`      | Servidor de desarrollo en `localhost:4321`          |
| `npm run build`    | Compila el sitio a `./dist/`                         |
| `npm run preview`  | Previsualiza el build de producción                 |
| `npm run watermarks` | Arranca el servicio watermarks-remover vía Python |

## Estructura

```text
/
├── public/                       # Assets estáticos (favicon)
├── src/
│   ├── components/
│   │   └── WatermarkRemover.tsx   # UI React (carga, inspección, limpieza)
│   ├── layouts/
│   │   └── Layout.astro
│   ├── lib/
│   │   └── watermarks.ts          # Proxy hacia el servicio (allow-list)
│   ├── pages/
│   │   ├── api/watermarks/[...path].ts
│   │   └── index.astro
│   └── styles/
│       └── global.css
├── compose.yaml                  # Servicio watermarks-remover en Docker
└── vendor/watermarks-remover/    # Código del servicio upstream
```
