import { ovhApi } from '../lib/ovh-api-client';
import { COULEUR_INFOS } from '../lib/couleurs';
import { DEPARTEMENTS } from '../lib/departements';

export const dynamic = 'force-dynamic';

export default async function AccueilPage() {
  const { date, carte, textes } = await ovhApi.vigilanceFrance();
  const nomDepartement = new Map(DEPARTEMENTS.map((d) => [d.code, d.nom]));

  const dernierHeure = carte.length > 0 ? [...new Set(carte.map((c) => c.heure))].sort().at(-1) : null;
  const lignesDernierBulletin = carte.filter((c) => c.heure === dernierHeure && c.echeance === 'J');
  const dernierTexte = textes.length > 0 ? textes[textes.length - 1] : null;

  const couleurMax = lignesDernierBulletin.reduce((m: number, l) => Math.max(m, l.couleur), 1) as 1 | 2 | 3 | 4;

  return (
    <div>
      <h1>Bulletin de vigilance du {date}</h1>

      {dernierHeure ? (
        <>
          <p style={{ color: '#667085' }}>Dernier bulletin : {dernierHeure} (échéance du jour)</p>

          <div
            style={{
              display: 'inline-block',
              padding: '10px 16px',
              borderRadius: 999,
              background: COULEUR_INFOS[couleurMax].bg,
              color: COULEUR_INFOS[couleurMax].texte,
              fontWeight: 700,
              marginBottom: 20,
            }}
          >
            Niveau maximal : {COULEUR_INFOS[couleurMax].nom}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 8,
            }}
          >
            {lignesDernierBulletin
              .sort((a, b) => b.couleur - a.couleur)
              .map((l) => (
                <div
                  key={l.departement}
                  style={{
                    borderRadius: 10,
                    padding: '8px 10px',
                    background: COULEUR_INFOS[l.couleur].bg,
                    color: COULEUR_INFOS[l.couleur].texte,
                    fontSize: 13,
                  }}
                >
                  <strong>{l.departement}</strong> — {nomDepartement.get(l.departement) ?? l.departement}
                </div>
              ))}
          </div>

          {dernierTexte && (
            <details style={{ marginTop: 24 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Texte de synthèse (brut, {dernierTexte.heure})</summary>
              <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: 12, borderRadius: 8, fontSize: 12, overflowX: 'auto' }}>
                {dernierTexte.contenu.slice(0, 4000)}
              </pre>
            </details>
          )}
        </>
      ) : (
        <p>Aucun bulletin archivé pour aujourd&apos;hui pour le moment.</p>
      )}
    </div>
  );
}
