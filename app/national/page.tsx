import { redirect } from 'next/navigation';

export default function NationalIndex() {
  const maintenant = new Date();
  redirect(`/national/${maintenant.getFullYear()}/${maintenant.getMonth() + 1}`);
}
