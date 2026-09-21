import Link from 'next/link';
import { notFound } from 'next/navigation';
import CalendrierMois from '../../../../../components/CalendrierMois';
import { ovhApi } from '../../../../../lib/ovh-api-client';
import { DEPARTEMENTS } from '../../../../../lib/departements';

export const dynamic = 'force-dynamic';

export default async function CalendrierDepartementPage({
  params,
}: {
  params: Promise<{ code: string; annee: string; mois: string }>;
}) {
  const { code, annee: anneeStr, mois: moisStr } = await params;
  const departement = code.toUpperCase();
  const infos = DEPARTEMENTS.find((d) => d.code === departement);
  const annee = Number(anneeStr);
  const mois = Number(moisStr);
  if (!infos || !Number.isInteger(annee) || !Number.isInteger(mois) || mois < 1 || mois > 12 || annee < 2001) notFound();

  const jours = await ovhApi.vigilanceDepartementMois(departement, annee, mois);

  return (
    <div>
      <p>
        <Link href="/departement">← Changer de département</Link>
      </p>
      <CalendrierMois
        annee={annee}
        mois={mois}
        jours={jours}
        hrefJour={(d) => `/jour/${d}`}
        hrefMois={(a, m) => `/departement/${departement}/${a}/${m}`}
        titre={`${departement} — ${infos.nom}`}
      />
    </div>
  );
}
