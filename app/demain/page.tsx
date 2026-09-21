import Link from 'next/link';
import CarteVigilance, { LegendeCarte } from '../../components/CarteVigilance';
import { COULEUR_INFOS } from '../../lib/couleurs';
import { DEPARTEMENTS } from '../../lib/departements';
import { couleurMax, dernierBulletin, heureParis, jourLongParis } from '../../lib/vigilance-du-jour';

export const revalidate = 300;
export const metadata = {
  title: 'Carte de vigilance de demain — Vigilance météo',
  description: 'Carte de vigilance météo de la France pour demain, département par département, avec les phénomènes prévus.',
};

const nomDep = (code: string) => DEPARTEMENTS.find((d) => d.code === code)?.nom ?? code;

export default async function DemainPage() {
  const b = await dernierBulletin();
  const demain = b?.demain;

  if (!b || !demain) {
    return (
      <div>
        <h1>Carte de vigilance de demain</h1>
        <p>La carte de demain n’est pas disponible pour le moment. Réessayez dans quelques instants.</p>
        <p>
          <Link href="/" style={{ color: 'var(--lien)' }}>← Vigilance du jour</Link>
        </p>
      </div>
    );
  }

  const max = couleurMax(demain);
  const enAlerte = demain.departements.filter((d) => d.couleur >= 2).sort((x, y) => y.couleur - x.couleur || x.code.localeCompare(y.code));
  const details = Object.fromEntries(enAlerte.map((d) => [d.code, d.phenomenes.join(', ')]));
  // Le début de validité de J1 tombe à 22h UTC la veille : on prend midi le jour visé pour éviter tout décalage de date.
  const milieu = new Date((new Date(demain.debut).getTime() + new Date(demain.fin).getTime()) / 2).toISOString();

  return (
    <div>
      <p style={{ margin: 0 }}>
        <Link href="/" style={{ color: 'var(--lien)' }}>← Vigilance du jour</Link>
      </p>
      <h1>Carte de vigilance de demain — {jourLongParis(milieu)}</h1>
      <p style={{ color: 'var(--texte-3)' }}>Prévision issue du bulletin de {heureParis(b.jour.debut)}.</p>

      <div
        style={{ display: 'inline-block', padding: '10px 16px', borderRadius: 999, background: COULEUR_INFOS[max].bg, color: COULEUR_INFOS[max].texte, fontWeight: 700, marginBottom: 12 }}
      >
        Niveau maximal : {COULEUR_INFOS[max].nom}
      </div>

      <CarteVigilance couleurs={Object.fromEntries(demain.departements.map((d) => [d.code, d.couleur]))} details={details} />
      <LegendeCarte />

      <h2>Départements en vigilance ({enAlerte.length})</h2>
      {enAlerte.length === 0 ? (
        <p>Aucun département en vigilance jaune, orange ou rouge demain.</p>
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
    </div>
  );
}
