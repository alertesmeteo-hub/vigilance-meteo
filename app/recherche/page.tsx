import Link from 'next/link';
import { COULEUR_INFOS } from '../../lib/couleurs';
import { DEPARTEMENTS } from '../../lib/departements';
import { rechercheApi, type Couleur, type RechercheJour } from '../../lib/ovh-api-client';
import { nomsDepuisMasque, PHENOMENES } from '../../lib/phenomenes';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Recherche avancée — Vigilance météo',
  description: 'Retrouvez toutes les journées de vigilance orange ou rouge depuis 2001 par période, département et phénomène, puis ouvrez le bulletin correspondant.',
};

type Params = { couleur?: string; departement?: string; phenomene?: string; debut?: string; fin?: string; go?: string };

const DEBUT_ARCHIVE = '2001-10-01';
const aujourdhui = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());
const dateValide = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));

const dateFr = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

const champ: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 600 };
const saisie: React.CSSProperties = { padding: '9px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 15, background: '#fff' };

/** Séries de jours consécutifs, les plus longues d'abord. */
function series(jours: RechercheJour[]) {
  const out: { debut: string; fin: string; n: number }[] = [];
  let cur: { debut: string; fin: string; n: number } | null = null;
  let prev = 0;
  for (const j of jours) {
    const t = Date.parse(`${j.date}T00:00:00Z`);
    if (cur && t - prev === 86_400_000) {
      cur.fin = j.date;
      cur.n++;
    } else {
      if (cur) out.push(cur);
      cur = { debut: j.date, fin: j.date, n: 1 };
    }
    prev = t;
  }
  if (cur) out.push(cur);
  return out.sort((a, b) => b.n - a.n).slice(0, 10);
}

function Pastille({ couleur }: { couleur: Couleur }) {
  const c = COULEUR_INFOS[couleur];
  return (
    <span style={{ background: c.bg, color: c.texte, padding: '2px 10px', borderRadius: 999, fontSize: 13, fontWeight: 700 }}>{c.nom}</span>
  );
}

export default async function RecherchePage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const fin0 = aujourdhui();
  const couleur = ['2', '3', '4'].includes(sp.couleur ?? '') ? (sp.couleur as string) : '';
  const departement = DEPARTEMENTS.some((d) => d.code === sp.departement) ? (sp.departement as string) : '';
  const phenomene = PHENOMENES.some((p) => p.numero === sp.phenomene) ? (sp.phenomene as string) : '';
  const debut = dateValide(sp.debut) ? (sp.debut as string) : DEBUT_ARCHIVE;
  const fin = dateValide(sp.fin) ? (sp.fin as string) : fin0;

  let erreur: string | null = null;
  let resultat: { jours: RechercheJour[]; tronque: boolean } | null = null;
  if (sp.go) {
    if (debut > fin) erreur = 'La date de début doit être antérieure ou égale à la date de fin.';
    else if (debut < DEBUT_ARCHIVE) erreur = `Les archives commencent le ${dateFr(DEBUT_ARCHIVE)}.`;
    else {
      try {
        resultat = await rechercheApi.recherche({ debut, fin, couleur, phenomene, departement });
      } catch (e) {
        erreur = 'La recherche est momentanément indisponible. Réessayez dans quelques instants.';
        console.error('recherche vigilance', e);
      }
    }
  }

  const jours = resultat?.jours ?? [];
  const parAnnee = new Map<string, Record<number, number>>();
  for (const j of jours) {
    const a = j.date.slice(0, 4);
    const r = parAnnee.get(a) ?? {};
    r[j.couleur] = (r[j.couleur] ?? 0) + 1;
    parAnnee.set(a, r);
  }
  const maxAnnee = Math.max(1, ...[...parAnnee.values()].map((r) => Object.values(r).reduce((s, n) => s + n, 0)));
  const nomDep = DEPARTEMENTS.find((d) => d.code === departement)?.nom;
  const nomPhen = PHENOMENES.find((p) => p.numero === phenomene)?.nom;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Recherche avancée</h1>
      <p style={{ color: '#475467' }}>
        Recherchez toutes les échéances comprises dans une période, puis ouvrez directement le bulletin ancien ou récent
        correspondant.
      </p>

      <form
        method="get"
        style={{ background: '#fff', border: '1px solid #e4e9f0', borderRadius: 12, padding: 16, display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}
      >
        <input type="hidden" name="go" value="1" />
        <label style={champ}>
          Couleur
          <select name="couleur" defaultValue={couleur} style={saisie}>
            <option value="">Toutes les vigilances (orange et rouge)</option>
            <option value="2">Jaune (fiable à partir de 2023)</option>
            <option value="3">Orange</option>
            <option value="4">Rouge</option>
          </select>
        </label>
        <label style={champ}>
          Département
          <select name="departement" defaultValue={departement} style={saisie}>
            <option value="">France entière</option>
            {DEPARTEMENTS.map((d) => (
              <option key={d.code} value={d.code}>
                {d.code} — {d.nom}
              </option>
            ))}
          </select>
        </label>
        <label style={champ}>
          Phénomène
          <select name="phenomene" defaultValue={phenomene} style={saisie}>
            <option value="">Tous les phénomènes</option>
            {PHENOMENES.map((p) => (
              <option key={p.numero} value={p.numero}>
                {p.numero} — {p.nom}
              </option>
            ))}
          </select>
        </label>
        <label style={champ}>
          Date de début
          <input type="date" name="debut" defaultValue={debut} min={DEBUT_ARCHIVE} max={fin0} style={saisie} />
        </label>
        <label style={champ}>
          Date de fin
          <input type="date" name="fin" defaultValue={fin} min={DEBUT_ARCHIVE} max={fin0} style={saisie} />
        </label>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          <button type="submit" style={{ padding: '10px 18px', borderRadius: 8, border: 0, background: '#3157d5', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            Rechercher
          </button>
          <Link href="/recherche" style={{ padding: '10px 6px', color: '#3157d5' }}>
            Réinitialiser
          </Link>
        </div>
      </form>
      <p style={{ fontSize: 13, color: '#667085' }}>Données disponibles du {dateFr(DEBUT_ARCHIVE)} au {dateFr(fin0)}.</p>

      {erreur && (
        <p role="alert" style={{ background: '#fef3f2', border: '1px solid #fecdca', color: '#912018', padding: 12, borderRadius: 10 }}>
          {erreur}
        </p>
      )}

      {resultat && (
        <section id="resultats" style={{ marginTop: 20 }}>
          <div style={{ background: '#fff', border: '1px solid #e4e9f0', borderRadius: 12, padding: 16 }}>
            <p style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>
              {jours.length} <span style={{ fontSize: 16, fontWeight: 500 }}>jour{jours.length > 1 ? 's' : ''} concerné{jours.length > 1 ? 's' : ''}</span>
            </p>
            <p style={{ margin: '4px 0 0', color: '#667085', fontSize: 14 }}>
              {nomPhen ?? 'Tous les phénomènes'} · {couleur ? COULEUR_INFOS[Number(couleur) as Couleur].nom : 'Orange et rouge'} · {departement ? `${departement} — ${nomDep}` : 'France entière'}
            </p>
            {resultat.tronque && <p style={{ color: '#b54708' }}>Résultats limités aux 5 000 premiers jours : réduisez la période pour tout voir.</p>}
            {departement && (
              <p style={{ fontSize: 13, color: '#667085', marginBottom: 0 }}>
                Pour un département, la couleur est celle du département ; les phénomènes viennent des bulletins qui le citent. Le détail complet des bulletins est en cours d’importation.
              </p>
            )}
          </div>

          {jours.length > 0 && (
            <>
              <h2>Nombre de jours par année</h2>
              <div role="list" style={{ display: 'grid', gap: 6 }}>
                {[...parAnnee.entries()].sort().map(([a, r]) => {
                  const total = Object.values(r).reduce((s, n) => s + n, 0);
                  return (
                    <div key={a} role="listitem" style={{ display: 'grid', gridTemplateColumns: '48px 1fr 70px', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700 }}>{a}</span>
                      <div style={{ display: 'flex', height: 16, width: `${(total / maxAnnee) * 100}%`, minWidth: 4, borderRadius: 4, overflow: 'hidden' }} title={`${total} jour(s)`}>
                        {([2, 3, 4] as Couleur[]).map((c) => (r[c] ? <span key={c} style={{ flex: r[c], background: COULEUR_INFOS[c].bg }} /> : null))}
                      </div>
                      <span style={{ color: '#667085', fontSize: 14 }}>{total} j</span>
                    </div>
                  );
                })}
              </div>

              <h2>Plus longues séries de jours consécutifs</h2>
              <ol>
                {series(jours).map((s) => (
                  <li key={s.debut}>
                    <strong>{s.n} jour{s.n > 1 ? 's' : ''}</strong> — du {dateFr(s.debut)}{s.n > 1 ? ` au ${dateFr(s.fin)}` : ''}
                  </li>
                ))}
              </ol>

              <h2>Journées concernées</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #e4e9f0', borderRadius: 10 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', background: '#f8fafc' }}>
                      <th style={{ padding: 10 }}>Date</th>
                      <th style={{ padding: 10 }}>Couleur</th>
                      <th style={{ padding: 10 }}>Phénomènes</th>
                      <th style={{ padding: 10 }}>Bulletins</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jours.map((j) => {
                      const noms = nomsDepuisMasque(j.masque);
                      const [a, m] = j.date.split('-');
                      const cal = departement ? `/departement/${departement}/${a}/${Number(m)}` : `/national/${a}/${Number(m)}`;
                      return (
                        <tr key={j.date} style={{ borderTop: '1px solid #eef2f6' }}>
                          <td style={{ padding: 10, whiteSpace: 'nowrap' }}>
                            <Link href={cal} style={{ color: '#1f2937' }}>{dateFr(j.date)}</Link>
                          </td>
                          <td style={{ padding: 10 }}><Pastille couleur={j.couleur} /></td>
                          <td style={{ padding: 10 }}>{noms.length ? noms.join(', ') : <span style={{ color: '#98a2b3' }}>—</span>}</td>
                          <td style={{ padding: 10, whiteSpace: 'nowrap' }}>
                            {j.nbBulletins > 0 ? (
                              <Link href={`/jour/${j.date}${departement ? `?departement=${departement}` : ''}`} style={{ color: '#3157d5', fontWeight: 600 }}>
                                {j.nbBulletins} bulletin{j.nbBulletins > 1 ? 's' : ''} →
                              </Link>
                            ) : (
                              <span style={{ color: '#98a2b3' }}>aucun dans l’archive</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
