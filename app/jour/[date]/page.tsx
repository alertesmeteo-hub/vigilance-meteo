import Link from 'next/link';
import { notFound } from 'next/navigation';
import CarteVigilance, { LegendeCarte } from '../../../components/CarteVigilance';
import { rechercheApi } from '../../../lib/ovh-api-client';
import { ARCHIVE_OFFICIELLE, nomsDepuisMasque } from '../../../lib/phenomenes';

export const dynamic = 'force-dynamic';

const dateFr = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Bulletins de vigilance d'un jour (archive officielle Météo-France), chacun ouvrable en texte intégral. */
export default async function JourPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`)) || date < '2001-10-01') notFound();

  const [bulletins, departements] = await Promise.all([rechercheApi.bulletinsDuJour(date), rechercheApi.departementsDuJour(date)]);
  const [a, m] = date.split('-');

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
          <CarteVigilance couleurs={Object.fromEntries(departements.map((d) => [d.code, d.couleur]))} />
          <LegendeCarte />
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
