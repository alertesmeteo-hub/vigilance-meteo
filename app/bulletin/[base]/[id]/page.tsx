import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DEPARTEMENTS } from '../../../../lib/departements';
import { rechercheApi, type BulletinComplet } from '../../../../lib/ovh-api-client';
import CarteVigilance, { LegendeCarte } from '../../../../components/CarteVigilance';
import { COULEUR_INFOS } from '../../../../lib/couleurs';
import { ARCHIVE_OFFICIELLE, STATUTS_SUIVI } from '../../../../lib/phenomenes';

export const dynamic = 'force-dynamic';

const nomDep = (code: string) => DEPARTEMENTS.find((d) => d.code === code)?.nom ?? (code === '99' ? 'Andorre' : code);

/** Un bulletin de vigilance en texte intégral (archive officielle Météo-France, 2001+). */
export default async function BulletinPage({ params }: { params: Promise<{ base: string; id: string }> }) {
  const { base, id: idStr } = await params;
  const id = Number(idStr);
  if (!/^\w{1,30}$/.test(base) || !Number.isInteger(id) || id < 1) notFound();

  let b: BulletinComplet;
  try {
    b = await rechercheApi.bulletin(base, id);
  } catch {
    notFound(); // bulletin inconnu (l'API répond 404)
  }

  const officiel = `${ARCHIVE_OFFICIELLE}/vigi.php?type=bulletin&id=${id}&base=${base}`;
  const parStatut = new Map<number, string[]>();
  for (const d of b.departements) parStatut.set(d.statut, [...(parStatut.get(d.statut) ?? []), d.code]);

  return (
    <div>
      <p style={{ margin: 0 }}>
        <Link href={`/jour/${b.date}`} style={{ color: '#3157d5' }}>← Bulletins du {b.date}</Link>
      </p>
      <h1>
        Bulletin de vigilance — {b.date} à {b.heure.slice(0, 5)}
      </h1>
      <p style={{ color: '#475467' }}>
        {b.producteur} · {b.phenomenes}
      </p>

      {b.departements.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e4e9f0', borderRadius: 12, padding: 14, marginBottom: 16 }}>
          {[1, 2, 3].filter((s) => parStatut.has(s)).map((s) => (
            <p key={s} style={{ margin: '4px 0' }}>
              <strong>{STATUTS_SUIVI[s]} :</strong>{' '}
              {(parStatut.get(s) ?? []).map((c, i) => (
                <span key={c}>
                  {i > 0 && ', '}
                  {c !== '99' ? <Link href={`/departement/${c}`} style={{ color: '#3157d5' }}>{nomDep(c)} ({c})</Link> : 'Andorre'}
                </span>
              ))}
            </p>
          ))}
        </div>
      )}

      {b.carte && b.carte.length > 0 && (
        <>
          <CarteVigilance couleurs={Object.fromEntries(b.carte.map((d) => [d.code, d.couleur]))} />
          <LegendeCarte />
        </>
      )}

      {b.carte && b.carte.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e4e9f0', borderRadius: 12, padding: 14, marginBottom: 16 }}>
          {([4, 3, 2] as const).map((c) => {
            const liste = b.carte!.filter((d) => d.couleur === c);
            if (liste.length === 0) return null;
            return (
              <p key={c} style={{ margin: '6px 0' }}>
                <strong style={{ background: COULEUR_INFOS[c].bg, color: COULEUR_INFOS[c].texte, padding: '2px 10px', borderRadius: 999 }}>{COULEUR_INFOS[c].nom}</strong>{' '}
                {liste.map((d, i) => (
                  <span key={d.code}>
                    {i > 0 && ', '}
                    <Link href={`/departement/${d.code}`} style={{ color: '#3157d5' }}>{nomDep(d.code)} ({d.code})</Link>
                  </span>
                ))}
              </p>
            );
          })}
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#667085' }}>Les autres départements sont en vert.</p>
        </div>
      )}

      {b.carte ? null : b.texte ? (
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#fff', border: '1px solid #e4e9f0', borderRadius: 12, padding: 16, fontSize: 14, lineHeight: 1.5, fontFamily: 'ui-monospace, Consolas, monospace' }}>
          {b.texte}
        </pre>
      ) : (
        <p style={{ background: '#fffaeb', border: '1px solid #fedf89', borderRadius: 10, padding: 14 }}>
          Le texte de ce bulletin n’a pas encore été importé sur ce site.
        </p>
      )}

      <p style={{ fontSize: 13, color: '#667085' }}>
        Source : {b.carte ? 'Météo-France (données publiques data.gouv.fr)' : 'archive officielle de la vigilance, Météo-France'}{b.carte ? '.' : ' ·'}{' '}
        {!b.carte && <a href={officiel} target="_blank" rel="noopener noreferrer" style={{ color: '#3157d5' }}>
          ouvrir le bulletin original
        </a>}
        {!b.carte && '.'}
      </p>
    </div>
  );
}
