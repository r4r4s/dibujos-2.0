import fs from 'node:fs';
import path from 'node:path';

export type CategoryMeta = {
  slug: string;
  name: string;
  emoji: string;
  tint: string;
  thumb: string;
};

/**
 * Metadatos de cada categoría (nombre visible, emoji, tinte y miniatura).
 * El conteo de dibujos NO se guarda aquí: se calcula leyendo los archivos.
 */
export const CATEGORIES: CategoryMeta[] = [
  { slug: 'animales', name: 'Animales', emoji: '🐾', tint: '#ffe6cc', thumb: '/dibujos/imagenes/animales/Gato/Gato1.webp' },
  { slug: 'abecedario', name: 'Abecedario', emoji: '🔤', tint: '#ffdff0', thumb: '/dibujos/imagenes/abecedario/letra-a/letra-a-1.webp' },
  { slug: 'vehiculos', name: 'Vehículos', emoji: '🚗', tint: '#ffeeb8', thumb: '/dibujos/imagenes/vehiculos/Coches/Coches1.webp' },
  { slug: 'navidad', name: 'Navidad', emoji: '🎄', tint: '#d3efd9', thumb: '/dibujos/imagenes/navidad/ArbolNavidad/ArbolNavidad1.webp' },
  { slug: 'paisajes', name: 'Paisajes', emoji: '🏖️', tint: '#d3ecff', thumb: '/dibujos/imagenes/paisajes/CastillosArena/CastillosArena1.webp' },
  { slug: 'comida', name: 'Comida', emoji: '🍕', tint: '#ffdcd8', thumb: '/dibujos/imagenes/comida/Pizzas/Pizzas7.webp' },
  { slug: 'planetas', name: 'Planetas', emoji: '🪐', tint: '#dcdcff', thumb: '/dibujos/imagenes/planetas/PlanetasAnillos/PlanetasAnillos1.webp' },
  { slug: 'mandalas', name: 'Mandalas', emoji: '🌀', tint: '#e7dbff', thumb: '/dibujos/imagenes/mandalas/Mandala1.webp' },
  { slug: 'edificios', name: 'Edificios', emoji: '🏰', tint: '#cdeee6', thumb: '/dibujos/imagenes/edificios/Casas/Casas2.webp' },
  { slug: 'ositos-de-peluche', name: 'Ositos de peluche', emoji: '🧸', tint: '#f4e3c8', thumb: '/dibujos/imagenes/ositos-de-peluche/OsitosPeluche1.webp' },
  { slug: 'balones', name: 'Balones', emoji: '⚽', tint: '#dbe4ff', thumb: '/dibujos/imagenes/balones/BalonFutbol/BalonFutbol1.webp' },
];

export type Dibujo = {
  nombre: string; // nombre legible del dibujo
  tema: string; // subcarpeta (puede ser '')
  img: string; // URL pública de la imagen webp
  pdf: string; // URL pública del PDF equivalente
};

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const IMG_BASE = path.join(PUBLIC_DIR, 'dibujos', 'imagenes');

function walkWebp(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkWebp(full));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.webp')) out.push(full);
  }
  return out;
}

function toUrl(fullPath: string): string {
  return '/' + path.relative(PUBLIC_DIR, fullPath).split(path.sep).join('/');
}

/** Pasa "BalonFutbol" o "letra-a" a un texto legible: "Balon Futbol", "Letra a". */
export function prettify(s: string): string {
  return s
    .replace(/[-_]+/g, ' ')
    .replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function getCategoryMeta(slug: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/** Nº de dibujos (webp) de una categoría, leyendo el sistema de archivos. */
export function countDibujos(slug: string): number {
  const dir = path.join(IMG_BASE, slug);
  return fs.existsSync(dir) ? walkWebp(dir).length : 0;
}

/** Todos los dibujos de una categoría, ordenados de forma natural. */
export function getDibujos(slug: string): Dibujo[] {
  const dir = path.join(IMG_BASE, slug);
  if (!fs.existsSync(dir)) return [];
  const files = walkWebp(dir).sort((a, b) =>
    a.localeCompare(b, 'es', { numeric: true }),
  );
  return files.map((full) => {
    const img = toUrl(full);
    const pdf = img.replace('/imagenes/', '/pdfs/').replace(/\.webp$/i, '.pdf');
    const parts = img.split('/'); // ['', 'dibujos', 'imagenes', cat, (tema)?, file]
    const tema = parts.length > 5 ? parts[4] : '';
    const fileName = parts[parts.length - 1].replace(/\.webp$/i, '');
    return { nombre: prettify(fileName), tema, img, pdf };
  });
}
