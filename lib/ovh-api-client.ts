/**
 * Client (lecture seule) pour l'API PHP intermédiaire du projet claude-code-dictons (voir son
 * dossier ovh-api/) — même hébergement OVH, même base MySQL bijouxdealertes. Ce site n'écrit
 * jamais dans la base : l'import (temps réel + backfill 2001+) est fait par les scripts de
 * claude-code-dictons ; ce site ne fait que lire pour l'affichage.
 */

const BASE_URL = process.env.OVH_API_URL;
const TOKEN = process.env.OVH_API_TOKEN;

async function appelerApi<T>(route: string): Promise<T> {
  if (!BASE_URL || !TOKEN) {
    throw new Error("OVH_API_URL / OVH_API_TOKEN manquants dans les variables d'environnement");
  }

  const url = `${BASE_URL}/?route=${route}`;
  const reponse = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: 'no-store',
  });

  if (!reponse.ok) {
    const corps = await reponse.text().catch(() => '');
    throw new Error(`API OVH ${route} → ${reponse.status}: ${corps.slice(0, 200)}`);
  }

  return reponse.json();
}

export type Couleur = 1 | 2 | 3 | 4;

export interface VigilanceCarteLigne {
  heure: string;
  echeance: 'J' | 'J1';
  departement: string;
  couleur: Couleur;
}

export interface VigilanceTexte {
  heure: string;
  contenu: string;
  fetched_at: string;
}

export interface VigilanceNationalJour {
  date: string;
  couleur: Couleur;
  commentaire: string | null;
}

export interface VigilanceDepartementJour {
  date: string;
  couleur: Couleur;
}

export const ovhApi = {
  /** Bulletin de vigilance archivé du jour (carte par département + texte de synthèse), mis à jour toutes les heures. */
  vigilanceFrance: () =>
    appelerApi<{ date: string; carte: VigilanceCarteLigne[]; textes: VigilanceTexte[] }>('vigilance/france'),

  /** Couleur nationale par jour, pour un mois donné (historique 2001+). */
  vigilanceNationalMois: (annee: number, mois: number) =>
    appelerApi<VigilanceNationalJour[]>(`vigilance/national&annee=${annee}&mois=${mois}`),

  /** Couleur par jour pour un département donné, pour un mois donné (historique 2001+). */
  vigilanceDepartementMois: (departement: string, annee: number, mois: number) =>
    appelerApi<VigilanceDepartementJour[]>(`vigilance/departement-historique&departement=${departement}&annee=${annee}&mois=${mois}`),
};

// ───────────── Recherche avancée : bulletins de l'archive officielle (lecture seule) ─────────────

export interface RechercheJour {
  date: string;
  couleur: Couleur;
  /** OU binaire des phénomènes des bulletins du jour (le PHP peut le renvoyer sous forme de chaîne). */
  masque: number | string;
  nbBulletins: number;
}

export interface BulletinListe {
  date: string;
  heure: string;
  producteur: string;
  phenomenes: string;
  masque: number;
  bulletinId: number;
  base: string;
}

export interface BulletinComplet {
  date: string;
  heure: string;
  producteur: string;
  phenomenes: string;
  masque: number;
  texte: string | null;
  niveauMax: number | null;
  /** statut : 1 début de suivi, 2 maintien, 3 fin. */
  departements: { code: string; statut: number }[];
}

export interface ParamsRecherche {
  debut: string;
  fin: string;
  /** '' = orange et rouge ; '2' jaune ; '3' orange ; '4' rouge. */
  couleur: string;
  /** '' = tous ; '1' à '9'. */
  phenomene: string;
  /** '' = France entière ; sinon code département. */
  departement: string;
}

export const rechercheApi = {
  recherche: (p: ParamsRecherche) =>
    appelerApi<{ jours: RechercheJour[]; tronque: boolean }>(
      `vigilance/recherche&debut=${p.debut}&fin=${p.fin}&couleur=${p.couleur}&phenomene=${p.phenomene}&departement=${p.departement}`,
    ),

  bulletinsDuJour: (date: string) => appelerApi<BulletinListe[]>(`vigilance/bulletins-jour&date=${date}`),

  bulletin: (base: string, id: number) => appelerApi<BulletinComplet>(`vigilance/bulletin&base=${base}&id=${id}`),
};
