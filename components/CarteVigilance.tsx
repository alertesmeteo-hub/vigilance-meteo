import Link from 'next/link';
import { CARTE_DEPARTEMENTS, CARTE_VIEWBOX } from '../lib/carte-france-data';
import { COULEUR_INFOS } from '../lib/couleurs';
import type { Couleur } from '../lib/ovh-api-client';

/**
 * Carte de France métropolitaine : chaque département est coloré selon sa vigilance,
 * avec une info-bulle au survol (nom, code, couleur) et un lien vers la page du département.
 * `couleurs` : code département → couleur (1 à 4) ; un département absent est affiché en vert.
 */
export default function CarteVigilance({ couleurs }: { couleurs: Record<string, number> }) {
  return (
    <svg viewBox={CARTE_VIEWBOX} role="img" aria-label="Carte de vigilance météo des départements" style={{ width: '100%', maxWidth: 620, height: 'auto', display: 'block' }}>
      <g stroke="#ffffff" strokeWidth={0.8} strokeLinejoin="round">
        {CARTE_DEPARTEMENTS.map(([code, nom, d]) => {
          const c = (couleurs[code] ?? 1) as Couleur;
          const info = COULEUR_INFOS[c] ?? COULEUR_INFOS[1];
          return (
            <Link key={code} href={`/departement/${code}`} aria-label={`${nom} (${code}) : ${info.nom}`}>
              <path d={d} fill={info.bg} style={{ cursor: 'pointer' }}>
                <title>{`${nom} (${code}) — ${info.nom}`}</title>
              </path>
            </Link>
          );
        })}
      </g>
    </svg>
  );
}

/** Légende des couleurs. */
export function LegendeCarte() {
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 14, margin: '8px 0 16px' }}>
      {([1, 2, 3, 4] as Couleur[]).map((c) => (
        <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 3, background: COULEUR_INFOS[c].bg, display: 'inline-block' }} />
          {COULEUR_INFOS[c].nom}
        </span>
      ))}
    </div>
  );
}
