import Link from 'next/link';
import { notFound } from 'next/navigation';
import CarteVigilance, { LegendeCarte } from '../../../components/CarteVigilance';
import { rechercheApi } from '../../../lib/ovh-api-client';
import { DEPARTEMENTS } from '../../../lib/departements';
import { COULEUR_INFOS } from '../../../lib/couleurs';
import { ARCHIVE_OFFICIELLE, nomsDepuisMasque, PHENOMENES } from '../../../lib/phenomenes';

export const dynamic = 'force-dynamic';

const dateFr = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Bulletins de vigilance d'un jour (archive officielle Météo-France), chacun ouvrable en texte intégral. */
export default async function JourPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`)) || date < '2001-10-01') notFound();

  const [bulletins, departements] = await Promise.all([rechercheApi.bulletinsDuJour(date), rechercheApi.departementsDuJour(date)]);
  const [a, m] = date.split('-');
  const nomDep = (code: string) => DEPARTEMENTS.find((d) => d.code === code)?.nom ?? code;
  const nomPhen = (n: number) => PHENOMENES.find((p) => Number(p.numero) === n)?.nom ?? `Phénomène ${n}`;
  const libelle = (d: (typeof departements)[number]) =>
    (d.phenomenes ?? []).map((p) => (p.c >= 1 ? `${nomPhen(p.n)} (${COULEUR_INFOS[p.c as 1 | 2 | 3 | 4].nom.toLowerCase()})` : nomPhen(p.n))).join(', ');
  const details = Object.fromEntries(departements.filter((d) => d.couleur >= 2).map((d) => [d.code, libelle(d)]));
  const enVigilance = departements.filter((d) => d.couleur >= 2).sort((x, y) => y.couleur - x.couleur || x.code.localeCompare(y.code));

  return (
    <div>
      <p style={{ margin: 0 }}>
        <Link href="/recherche" style={{ color: '#3157d5' }}>← Recherche avancée</Link>
      </p>
      <h1 style={{ textTransform: 'capitalize' }}>{dateFr(date)}</h1>
      <p style={{ color: '#475467' }}>
        {bulletins.length} bulletin{bulletins.length > 1 ? 's' : ''} de vigilance archivé{bulletins.length > 1 ? 's' : ''} ce jour-là ·{' '}
        <Link href={`/national/${a}/${Number(m)}`} style={{ color: '#3157d5' }}>calendrier du mois</Link>
      </p>

      {departements.length > 0 && (
        <>
          <h2>Carte de vigilance du jour (couleur maximale)</h2>
          <CarteVigilance couleurs={Object.fromEntries(departements.map((d) => [d.code, d.couleur]))} details={details} />
          <LegendeCarte />

          <h2>Départements en vigilance ({enVigilance.length})</h2>
          {enVigilance.length === 0 ? (
            <p>Aucun département en vigilance jaune, orange ou rouge ce jour-là.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #e4e9f0' }}>
                <thead>
                  <tr style={{ textAlign: 'left', background: '#f8fafc' }}>
                    <th style={{ padding: 10 }}>Département</th>
                    <th style={{ padding: 10 }}>Couleur</th>
                    <th style={{ padding: 10 }}>Phénomènes</th>
                    <th style={{ padding: 10 }}>Bulletins</th>
                  </tr>
                </thead>
                <tbody>
                  {enVigilance.map((d) => (
                    <tr key={d.code} style={{ borderTop: '1px solid #eef2f6' }}>
                      <td style={{ padding: 10 }}>
                        <Link href={`/departement/${d.code}`} style={{ color: '#3157d5' }}>{nomDep(d.code)} ({d.code})</Link>
                      </td>
                      <td style={{ padding: 10 }}>
                        <span style={{ background: COULEUR_INFOS[d.couleur as 1 | 2 | 3 | 4].bg, color: COULEUR_INFOS[d.couleur as 1 | 2 | 3 | 4].texte, padding: '2px 10px', borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
                          {COULEUR_INFOS[d.couleur as 1 | 2 | 3 | 4].nom}
                        </span>
                      </td>
                      <td style={{ padding: 10 }}>{libelle(d) || <span style={{ color: '#98a2b3' }}>non détaillé pour cette période</span>}</td>
                      <td style={{ padding: 10 }}>
                        {(d.bulletins ?? []).length === 0 ? (
                          <span style={{ color: '#98a2b3' }}>—</span>
                        ) : (
                          // Une heure une seule fois : plusieurs bulletins publiés à la même minute sont regroupés (liste complète plus bas).
                          [...(d.bulletins ?? []).reduce((m, b) => m.set(b.heure.slice(0, 5), [...(m.get(b.heure.slice(0, 5)) ?? []), b]), new Map<string, NonNullable<typeof d.bulletins>>())].map(([h, groupe], i) => (
                            <span key={h}>
                              {i > 0 && ' · '}
                              <Link href={`/bulletin/${groupe[0].base}/${groupe[0].id}`} style={{ color: '#3157d5', fontWeight: 600 }}>{h}</Link>
                              {groupe.length > 1 && <span title={`${groupe.length} bulletins à cette heure : liste complète ci-dessous`} style={{ color: '#667085', fontSize: 12 }}> ×{groupe.length}</span>}
                            </span>
                          ))
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {bulletins.length === 0 ? (
        <p style={{ background: '#fff', border: '1px solid #e4e9f0', borderRadius: 10, padding: 14 }}>
          Aucun bulletin n’est disponible dans l’archive officielle pour ce jour.{' '}
          <a href={`${ARCHIVE_OFFICIELLE}/vigilanceDate.php?dateVigi=${date}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3157d5' }}>
            Voir la page officielle
          </a>
          .
        </p>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {bulletins.map((b) => (
            <Link
              key={`${b.base}-${b.bulletinId}`}
              href={`/bulletin/${b.base}/${b.bulletinId}`}
              style={{ display: 'grid', gridTemplateColumns: '64px 90px 1fr', gap: 10, alignItems: 'center', padding: '10px 14px', background: '#fff', border: '1px solid #e4e9f0', borderRadius: 10, textDecoration: 'none', color: '#1f2937' }}
            >
              <strong>{b.heure.slice(0, 5)}</strong>
              <span style={{ color: '#667085' }}>{b.producteur}</span>
              <span>{nomsDepuisMasque(b.masque).join(', ') || b.phenomenes}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
