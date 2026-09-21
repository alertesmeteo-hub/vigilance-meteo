import { notFound } from 'next/navigation';
import CalendrierMois from '../../../../components/CalendrierMois';
import { ovhApi } from '../../../../lib/ovh-api-client';

export const dynamic = 'force-dynamic';

export default async function CalendrierNationalPage({ params }: { params: Promise<{ annee: string; mois: string }> }) {
  const { annee: anneeStr, mois: moisStr } = await params;
  const annee = Number(anneeStr);
  const mois = Number(moisStr);
  if (!Number.isInteger(annee) || !Number.isInteger(mois) || mois < 1 || mois > 12 || annee < 2001) notFound();

  const jours = await ovhApi.vigilanceNationalMois(annee, mois);

  return (
    <CalendrierMois
      annee={annee}
      mois={mois}
      jours={jours}
      hrefMois={(a, m) => `/national/${a}/${m}`}
      hrefJour={(d) => `/jour/${d}`}
      titre="Vigilance nationale"
    />
  );
}
