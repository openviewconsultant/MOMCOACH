import type { Product } from '@/lib/types';

const SUENO_TITLES = new Set([
  'ebook: newborn sleep shaping guide',
  'guía: cómo solucionar las siestas cortas',
  'guía: cómo manejar las regresiones de sueño',
  'guía: transición de siestas',
  'guía: sueño, viajes y eventos especiales',
  'guía: todo sobre el chupo',
  'tabla de sueño',
  'diario de sueño y vigilia',
  'el objeto de apego',
]);

const ALIMENTACION_TITLES = new Set([
  'guía: todo sobre los picky eaters',
  'recetario completo - the mom coach',
  'recetario: postres saludables',
  'recetario booster calórico',
  'guía: destete progresivo, guiado por la madre',
  'recetario alimentación ancestral',
  'estreñimiento infantil',
  'alimentación consciente',
  'checklist alimentos',
  'diario de alimentación',
  'diario tomas de leche',
]);

function isTopic(title: string, set: Set<string>) {
  return set.has(title.trim().toLowerCase());
}

export function filterFreebiesByTopic(freebies: Product[], topic: 'sueno' | 'alimentacion') {
  const set = topic === 'sueno' ? SUENO_TITLES : ALIMENTACION_TITLES;
  const other = topic === 'sueno' ? ALIMENTACION_TITLES : SUENO_TITLES;
  return freebies.filter((item) => isTopic(item.title, set) || !isTopic(item.title, other));
}
