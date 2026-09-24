import NewsletterBrevo from '../components/NewsletterBrevo';
import Link from 'next/link';
import CarteVigilance, { LegendeCarte } from '../components/CarteVigilance';
import { COULEUR_INFOS } from '../lib/couleurs';
import { DEPARTEMENTS } from '../lib/departements';
import { couleurMax, dernierBulletin, heureParis, jourLongParis } from '../lib/vigilance-du-jour';

export const revalidate = 300;

const nomDep = (code: string) => DEPARTEMENTS.find((d) => d.code === code)?.nom ?? code;

export default async function AccueilPage() {
  const b = await dernierBulletin();

  if (!b) {
    return (
      <div>
        <h1>Bulletin de vigilance</h1>
        <p>Le dernier bulletin n’est pas disponible pour le moment. Réessayez dans quelques instants.</p>
      </div>
    );
  }

  const max = couleurMax(b.jour);
  const enAlerte = b.jour.departements.filter((d) => d.couleur >= 2).sort((x, y) => y.couleur - x.couleur || x.code.localeCompare(y.code));
  const details = Object.fromEntries(enAlerte.map((d) => [d.code, d.phenomenes.join(', ')]));

  return (
    <div>
      <h1>
        Bulletin de vigilance du {jourLongParis(b.jour.debut)} à {heureParis(b.jour.debut)}
      </h1>

      <div
        style={{ display: 'inline-block', padding: '10px 16px', borderRadius: 999, background: COULEUR_INFOS[max].bg, color: COULEUR_INFOS[max].texte, fontWeight: 700, marginBottom: 12 }}
      >
        Niveau maximal : {COULEUR_INFOS[max].nom}
      </div>

      {b.demain && (
        <p style={{ margin: '0 0 16px' }}>
          <Link href="/demain" style={{ color: 'var(--lien)', fontWeight: 600 }}>
            Voir la carte de demain →
          </Link>
        </p>
      )}

      <h2>Carte de France</h2>
      <CarteVigilance couleurs={Object.fromEntries(b.jour.departements.map((d) => [d.code, d.couleur]))} details={details} />
      <LegendeCarte />
      <p style={{ color: 'var(--texte-3)', fontSize: 14 }}>Survolez un département pour voir son niveau et ses phénomènes, cliquez pour ouvrir sa page.</p>

      <h2>Départements en alerte ({enAlerte.length})</h2>
      {enAlerte.length === 0 ? (
        <p>Aucun département en vigilance jaune, orange ou rouge.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--surface)', border: '1px solid var(--bordure)' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: 'var(--surface-2)' }}>
                <th style={{ padding: 10 }}>Département</th>
                <th style={{ padding: 10 }}>Couleur</th>
                <th style={{ padding: 10 }}>Phénomènes</th>
              </tr>
            </thead>
            <tbody>
              {enAlerte.map((d) => (
                <tr key={d.code} style={{ borderTop: '1px solid var(--bordure-2)' }}>
                  <td style={{ padding: 10 }}>
                    <Link href={`/departement/${d.code}`} style={{ color: 'var(--lien)' }}>{nomDep(d.code)} ({d.code})</Link>
                  </td>
                  <td style={{ padding: 10 }}>
                    <span style={{ background: COULEUR_INFOS[d.couleur].bg, color: COULEUR_INFOS[d.couleur].texte, padding: '2px 10px', borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
                      {COULEUR_INFOS[d.couleur].nom}
                    </span>
                  </td>
                  <td style={{ padding: 10 }}>{d.phenomenes.join(', ') || <span style={{ color: 'var(--texte-4)' }}>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <NewsletterBrevo />
    </div>
  );
}
