import { COULEUR_INFOS } from '../../lib/couleurs';
import { AUTRES_TERRITOIRES, etatTerritoire, TERRITOIRES } from '../../lib/outremer';

export const revalidate = 900;
export const metadata = {
  title: 'Vigilance outre-mer — Vigilance météo',
  description: 'Vigilance météorologique en Nouvelle-Calédonie et en Polynésie française (données publiques Météo-France).',
};

const heureFr = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC' : '';

export default async function OutreMerPage() {
  const etats = await Promise.all(TERRITOIRES.map((t) => etatTerritoire(t)));

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Vigilance outre-mer</h1>
      <p style={{ color: 'var(--texte-2)' }}>
        Dernier bulletin publié pour les territoires dont Météo-France diffuse les données de vigilance.
      </p>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {TERRITOIRES.map((t, i) => {
          const e = etats[i];
          const c = e.couleurMax ? COULEUR_INFOS[e.couleurMax] : null;
          return (
            <section key={t.code} style={{ background: 'var(--surface)', border: '1px solid var(--bordure)', borderRadius: 12, padding: 16 }}>
              <h2 style={{ marginTop: 0 }}>{t.nom}</h2>
              {e.disponible && c ? (
                <>
                  <p style={{ margin: '4px 0' }}>
                    <span style={{ background: c.bg, color: c.texte, padding: '4px 14px', borderRadius: 999, fontWeight: 700 }}>
                      Niveau maximal : {c.nom}
                    </span>
                  </p>
                  <p style={{ margin: '8px 0 0', color: 'var(--texte-3)', fontSize: 14 }}>
                    {e.zonesEnAlerte ? `${e.zonesEnAlerte} zone(s) en jaune ou plus. ` : 'Aucune zone en alerte. '}
                    Bulletin du {heureFr(e.miseAJour)}.
                  </p>
                </>
              ) : (
                <p style={{ color: 'var(--texte-3)' }}>Données momentanément indisponibles.</p>
              )}
              <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--texte-4)' }}>Archive disponible depuis {t.depuis}.</p>
            </section>
          );
        })}
      </div>

      <section style={{ marginTop: 20, background: 'var(--avert-bg)', border: '1px solid var(--avert-bordure)', borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>En préparation</h2>
        <p style={{ margin: 0 }}>
          Calendrier, carte et recherche pour ces territoires, ainsi que {AUTRES_TERRITOIRES.join(', ')} dont les données ne figurent pas encore dans l’archive publique utilisée par ce site.
        </p>
      </section>
    </div>
  );
}
