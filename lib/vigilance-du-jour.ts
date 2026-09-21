import { PHENOMENES } from './phenomenes';

/**
 * Dernier bulletin de vigilance publié (données publiques Météo-France sur data.gouv.fr) :
 * carte du jour (échéance J) et de demain (échéance J1), avec les phénomènes en jaune ou plus par département.
 */
const BASE = 'https://files.data.gouv.fr/meteofrance/data/vigilance/metropole';

export interface DepartementCarte {
  code: string;
  couleur: 1 | 2 | 3 | 4;
  /** Phénomènes en jaune ou plus, du plus grave au moins grave : « Canicule (orange) ». */
  phenomenes: string[];
}

export interface Echeance {
  /** Début de validité (ISO, UTC). */
  debut: string;
  /** Fin de validité (ISO, UTC). */
  fin: string;
  departements: DepartementCarte[];
}

export interface DernierBulletin {
  /** Dossier du bulletin : AAAA/MM/JJ/HHMMSS (UTC). */
  dossier: string;
  jour: Echeance;
  demain: Echeance | null;
}

const NOMS_COULEUR = ['', 'vert', 'jaune', 'orange', 'rouge'];
const nomPhenomene = (id: number) => PHENOMENES.find((p) => Number(p.numero) === id)?.nom ?? `Phénomène ${id}`;

interface Domaine {
  domain_id: string;
  max_color_id: number;
  phenomenon_items?: { phenomenon_id: string | number; phenomenon_max_color_id: number }[];
}
interface Periode {
  echeance: 'J' | 'J1';
  begin_validity_time: string;
  end_validity_time: string;
  timelaps?: { domain_ids?: Domaine[] };
}

function versEcheance(p: Periode): Echeance {
  const departements: DepartementCarte[] = [];
  for (const d of p.timelaps?.domain_ids ?? []) {
    if (!/^(\d{2}|2A|2B)$/.test(d.domain_id)) continue; // écarte les zones marines et « FRA »
    const phenomenes = (d.phenomenon_items ?? [])
      .filter((x) => x.phenomenon_max_color_id >= 2)
      .sort((a, b) => b.phenomenon_max_color_id - a.phenomenon_max_color_id)
      .map((x) => `${nomPhenomene(Number(x.phenomenon_id))} (${NOMS_COULEUR[x.phenomenon_max_color_id]})`);
    departements.push({ code: d.domain_id, couleur: d.max_color_id as 1 | 2 | 3 | 4, phenomenes });
  }
  return { debut: p.begin_validity_time, fin: p.end_validity_time, departements };
}

const jourUtc = (decalage: number) => new Date(Date.now() - decalage * 86_400_000).toISOString().slice(0, 10).replace(/-/g, '/');

/** Dernier bulletin publié aujourd'hui (à défaut hier, juste après minuit UTC). `null` si la source est injoignable. */
export async function dernierBulletin(): Promise<DernierBulletin | null> {
  try {
    for (const decalage of [0, 1]) {
      const jour = jourUtc(decalage);
      const listing = await fetch(`${BASE}/${jour}/`, { next: { revalidate: 300 } });
      if (!listing.ok) continue;
      const dossiers = [...(await listing.text()).matchAll(/href="[^"]*\/(\d{6})\/"/g)].map((m) => m[1]).sort();
      const dernier = dossiers.at(-1);
      if (!dernier) continue;
      const r = await fetch(`${BASE}/${jour}/${dernier}/CDP_CARTE_EXTERNE.json`, { next: { revalidate: 300 } });
      if (!r.ok) continue;
      const json = (await r.json()) as { periods?: Periode[]; product?: { periods?: Periode[] } };
      const periodes = json.periods ?? json.product?.periods ?? [];
      const j = periodes.find((p) => p.echeance === 'J');
      if (!j) continue;
      const d1 = periodes.find((p) => p.echeance === 'J1');
      return { dossier: `${jour}/${dernier}`, jour: versEcheance(j), demain: d1 ? versEcheance(d1) : null };
    }
  } catch {
    /* source injoignable : la page affiche un message plutôt qu'une erreur */
  }
  return null;
}

/** « lundi 21 septembre 2026 » (jour de Paris de l'instant donné). */
export const jourLongParis = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });

/** « 16h00 » (heure de Paris). */
export const heureParis = (iso: string) => {
  const [h, m] = new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Paris' }).split(':');
  return `${h}h${m}`;
};

/** Couleur maximale d'une échéance. */
export const couleurMax = (e: Echeance) => Math.max(1, ...e.departements.map((d) => d.couleur)) as 1 | 2 | 3 | 4;
