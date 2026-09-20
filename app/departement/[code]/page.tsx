import { redirect, notFound } from 'next/navigation';
import { DEPARTEMENTS } from '../../../lib/departements';

export default async function DepartementCourant({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!DEPARTEMENTS.some((d) => d.code === code.toUpperCase())) notFound();
  const maintenant = new Date();
  redirect(`/departement/${code.toUpperCase()}/${maintenant.getFullYear()}/${maintenant.getMonth() + 1}`);
}
