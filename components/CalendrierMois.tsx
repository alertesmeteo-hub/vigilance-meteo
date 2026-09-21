import Link from 'next/link';
import { COULEUR_INFOS } from '../lib/couleurs';
import type { Couleur } from '../lib/ovh-api-client';

const JOURS_SEMAINE = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

interface Props {
  annee: number;
  mois: number; // 1-12
  jours: { date: string; couleur: Couleur }[];
  hrefMois: (annee: number, mois: number) => string;
  /** Lien d'un jour (carte de France et bulletins du jour). */
  hrefJour?: (date: string) => string;
  /** Texte d'info-bulle par date (ex. les phénomènes du jour). */
  infosJour?: Record<string, string>;
  titre: string;
}

const NOMS_MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export default function CalendrierMois({ annee, mois, jours, hrefMois, hrefJour, infosJour, titre }: Props) {
  const parJour = new Map(jours.map((j) => [j.date, j.couleur]));
  const premierJourMois = new Date(Date.UTC(annee, mois - 1, 1));
  const nbJours = new Date(Date.UTC(annee, mois, 0)).getUTCDate();
  // Lundi = 0 ... Dimanche = 6
  const decalage = (premierJourMois.getUTCDay() + 6) % 7;

  const cases: (number | null)[] = [...Array(decalage).fill(null), ...Array.from({ length: nbJours }, (_, i) => i + 1)];

  const moisPrecedent = mois === 1 ? { annee: annee - 1, mois: 12 } : { annee, mois: mois - 1 };
  const moisSuivant = mois === 12 ? { annee: annee + 1, mois: 1 } : { annee, mois: mois + 1 };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Link href={hrefMois(moisPrecedent.annee, moisPrecedent.mois)} aria-label="Mois précédent">
          ‹
        </Link>
        <h2 style={{ margin: 0 }}>
          {titre} — {NOMS_MOIS[mois - 1]} {annee}
        </h2>
        <Link href={hrefMois(moisSuivant.annee, moisSuivant.mois)} aria-label="Mois suivant">
          ›
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {JOURS_SEMAINE.map((j) => (
          <div key={j} style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: 'var(--texte-3)' }}>
            {j}
          </div>
        ))}
        {cases.map((jour, i) => {
          if (jour === null) return <div key={`vide-${i}`} />;
          const date = `${annee}-${String(mois).padStart(2, '0')}-${String(jour).padStart(2, '0')}`;
          const couleur = parJour.get(date);
          const infos = couleur ? COULEUR_INFOS[couleur] : null;
          const lien = hrefJour && date >= '2001-10-01' ? hrefJour(date) : null;
          const contenu = (
            <>
              <div style={{ fontWeight: 700 }}>{jour}</div>
              <div style={{ fontSize: 11 }}>{infos?.nom ?? '—'}</div>
            </>
          );
          return (
            <div
              key={date}
              title={infosJour?.[date]}
              style={{
                borderRadius: 12,
                padding: '10px 6px',
                textAlign: 'center',
                background: infos?.bg ?? 'var(--bordure-2)',
                color: infos?.texte ?? 'var(--texte-4)',
                minHeight: 60,
              }}
            >
              {lien ? (
                <Link href={lien} title={infosJour?.[date] ?? `Carte et bulletins du ${date}`} style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}>
                  {contenu}
                </Link>
              ) : (
                contenu
              )}
            </div>
          );
        })}
      </div>

      <ul style={{ display: 'flex', gap: 16, listStyle: 'none', padding: 0, marginTop: 20, fontSize: 13, flexWrap: 'wrap' }}>
        {(Object.entries(COULEUR_INFOS) as [string, (typeof COULEUR_INFOS)[Couleur]][]).map(([code, infos]) => (
          <li key={code} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: infos.bg, display: 'inline-block' }} />
            {infos.nom}
          </li>
        ))}
      </ul>
    </div>
  );
}
