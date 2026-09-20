import type { Couleur } from './ovh-api-client';

/** Couleurs officielles de la vigilance météo France (identiques à vigilance.meteofrance.fr). */
export const COULEUR_INFOS: Record<Couleur, { nom: string; bg: string; texte: string }> = {
  1: { nom: 'Vert', bg: '#4caf50', texte: '#0b3d0b' },
  2: { nom: 'Jaune', bg: '#ffeb3b', texte: '#4a3f00' },
  3: { nom: 'Orange', bg: '#ff9800', texte: '#4a2600' },
  4: { nom: 'Rouge', bg: '#f44336', texte: '#ffffff' },
};
