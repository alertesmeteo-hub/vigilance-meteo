import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Vigilance météo — archives',
  description: 'Bulletin de vigilance météo France du jour, et archives depuis 2001 (national et par département).',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f4f7fb', color: '#1f2937' }}>
        <header style={{ background: '#fff', borderBottom: '1px solid #e4e9f0', padding: '14px 20px' }}>
          <nav style={{ display: 'flex', gap: 18, maxWidth: 960, margin: '0 auto', flexWrap: 'wrap' }}>
            <Link href="/" style={{ fontWeight: 700, textDecoration: 'none', color: '#1f2937' }}>
              Vigilance météo
            </Link>
            <Link href="/national" style={{ textDecoration: 'none', color: '#3157d5' }}>
              Calendrier national
            </Link>
            <Link href="/departement" style={{ textDecoration: 'none', color: '#3157d5' }}>
              Calendrier par département
            </Link>
            <Link href="/recherche" style={{ textDecoration: 'none', color: '#3157d5' }}>
              Recherche avancée
            </Link>
            <Link href="/outre-mer" style={{ textDecoration: 'none', color: '#3157d5' }}>
              Outre-mer
            </Link>
          </nav>
        </header>
        <main style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px' }}>{children}</main>
        <footer style={{ borderTop: '1px solid #e4e9f0', padding: '18px 20px', textAlign: 'center', fontSize: 14, color: '#667085' }}>
          <a href="https://www.alertes-meteo.com" style={{ color: '#3157d5' }}>www.alertes-meteo.com</a>
        </footer>
      </body>
    </html>
  );
}
