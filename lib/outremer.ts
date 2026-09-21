/**
 * Vigilance outre-mer (données publiques Météo-France sur data.gouv.fr).
 * Disponibles : Nouvelle-Calédonie (depuis nov. 2024) et Polynésie française (depuis nov. 2023).
 * Les Antilles, la Guyane, La Réunion, Mayotte et Saint-Pierre-et-Miquelon ne figurent pas dans cette archive.
 */
const BASE = 'https://files.data.gouv.fr/meteofrance/data/vigilance';

export interface Territoire {
  code: 'nc' | 'pf';
  nom: string;
  dossier: string;
  fichier: string;
  depuis: string;
}

export const TERRITOIRES: Territoire[] = [
  { code: 'nc', nom: 'Nouvelle-Calédonie', dossier: 'dirnc', fichier: 'CDP_CARTE_EXTERNE_NC.json', depuis: 'novembre 2024' },
  { code: 'pf', nom: 'Polynésie française', dossier: 'dirpf', fichier: 'CDP_CARTE_INTERNE_PF.json', depuis: 'novembre 2023' },
];

export const AUTRES_TERRITOIRES = ['Guadeloupe', 'Martinique', 'Guyane', 'La Réunion', 'Mayotte', 'Saint-Pierre-et-Miquelon'];

export interface EtatTerritoire {
  disponible: boolean;
  /** Date et heure (UTC) du dernier bulletin publié. */
  miseAJour?: string;
  /** Couleur maximale, 1 (vert) à 4 (rouge). */
  couleurMax?: 1 | 2 | 3 | 4;
  /** Nombre de zones à la couleur maximale (jaune ou plus). */
  zonesEnAlerte?: number;
}

const jourIso = (d: Date) => d.toISOString().slice(0, 10);

/** Dernier bulletin du territoire (aujourd'hui, à défaut hier). Ne lève jamais : renvoie `disponible: false`. */
export async function etatTerritoire(t: Territoire): Promise<EtatTerritoire> {
  try {
    for (const decalage of [0, 1]) {
      const jour = jourIso(new Date(Date.now() - decalage * 86_400_000));
      const dossier = `${BASE}/${t.dossier}/${jour.replace(/-/g, '/')}/`;
      const page = await fetch(dossier, { next: { revalidate: 900 } });
      if (!page.ok) continue;
      const heures = [...(await page.text()).matchAll(/href="[^"]*\/(\d{6})\/"/g)].map((m) => m[1]).sort();
      const derniere = heures.at(-1);
      if (!derniere) continue;
      const r = await fetch(`${dossier}${derniere}/${t.fichier}`, { next: { revalidate: 900 } });
      if (!r.ok) continue;
      const json = (await r.json()) as { update_time?: string; timelaps?: { domain_ids?: { max_color_id: number }[] } };
      const domaines = json.timelaps?.domain_ids ?? [];
      const couleurs = domaines.map((d) => d.max_color_id);
      const max = Math.max(1, ...couleurs) as 1 | 2 | 3 | 4;
      return { disponible: true, miseAJour: json.update_time, couleurMax: max, zonesEnAlerte: couleurs.filter((c) => c >= 2).length };
    }
  } catch {
    /* source injoignable : on affiche « indisponible » plutôt qu'une erreur */
  }
  return { disponible: false };
}
