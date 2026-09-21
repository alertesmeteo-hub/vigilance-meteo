import { notFound } from 'next/navigation';
import CalendrierMois from '../../../../components/CalendrierMois';
import { COULEUR_INFOS } from '../../../../lib/couleurs';
import { ovhApi } from '../../../../lib/ovh-api-client';
import { PHENOMENES } from '../../../../lib/phenomenes';

export const dynamic = 'force-dynamic';

export default async function CalendrierNationalPage({ params }: { params: Promise<{ annee: string; mois: string }> }) {
  const { annee: anneeStr, mois: moisStr } = await params;
  const annee = Number(anneeStr);
  const mois = Number(moisStr);
  if (!Number.isInteger(annee) || !Number.isInteger(mois) || mois < 1 || mois > 12 || annee < 2001) notFound();

  const jours = await ovhApi.vigilanceNationalMois(annee, mois);

  // Info-bulle de chaque jour : « mardi 7 juillet 2026 — Orange : Canicule (orange), Orages (jaune) ».
  const nomPhenomene = (n: number) => PHENOMENES.find((x) => Number(x.numero) === n)?.nom ?? `Phénomène ${n}`;
  const infosJour = Object.fromEntries(
    jours.map((j) => {
      const date = new Date(`${j.date}T12:00:00Z`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
      const phenomenes = (j.phenomenes ?? []).map((p) => (p.c >= 1 ? `${nomPhenomene(p.n)} (${COULEUR_INFOS[p.c as 1 | 2 | 3 | 4].nom.toLowerCase()})` : nomPhenomene(p.n)));
      const detail = phenomenes.length > 0 ? phenomenes.join(', ') : j.couleur >= 2 ? 'phénomène non détaillé' : 'aucune alerte';
      return [j.date, `${date} — ${COULEUR_INFOS[j.couleur].nom} : ${detail}`];
    }),
  );

  return (
    <CalendrierMois
      annee={annee}
      mois={mois}
      jours={jours}
      hrefMois={(a, m) => `/national/${a}/${m}`}
      hrefJour={(d) => `/jour/${d}`}
      infosJour={infosJour}
      titre="Vigilance nationale"
    />
  );
}
