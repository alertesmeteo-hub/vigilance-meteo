/** Phénomènes de la vigilance Météo-France (numéros officiels 1 à 9 ; bit = 2^(n-1) dans le masque de l'API). */
export const PHENOMENES: { numero: string; nom: string; bit: number }[] = [
  { numero: '1', nom: 'Vent violent', bit: 1 },
  { numero: '2', nom: 'Pluie-inondation', bit: 2 },
  { numero: '3', nom: 'Orages', bit: 4 },
  { numero: '4', nom: 'Crues', bit: 8 },
  { numero: '5', nom: 'Neige-verglas', bit: 16 },
  { numero: '6', nom: 'Canicule', bit: 32 },
  { numero: '7', nom: 'Grand froid', bit: 64 },
  { numero: '8', nom: 'Avalanches', bit: 128 },
  { numero: '9', nom: 'Vagues-submersion', bit: 256 },
];

export const nomsDepuisMasque = (masque: number | string): string[] => {
  const m = Number(masque) || 0;
  return PHENOMENES.filter((p) => m & p.bit).map((p) => p.nom);
};

export const STATUTS_SUIVI: Record<number, string> = { 1: 'Début de suivi', 2: 'Maintien de suivi', 3: 'Fin de suivi' };

export const ARCHIVE_OFFICIELLE = 'http://vigilance-public.meteo.fr';
