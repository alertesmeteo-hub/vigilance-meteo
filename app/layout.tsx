import type { Metadata } from 'next';
import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vigilance météo — archives',
  description: 'Bulletin de vigilance météo France du jour, et archives depuis 2001 (national et par département).',
};

/** Applique le thème avant l'affichage (évite l'éclair clair → sombre) : choix mémorisé, sinon réglage du système. */
const SCRIPT_THEME = "(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){}})()";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_THEME }} />
      </head>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: 'var(--fond)', color: 'var(--texte)' }}>
        <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--bordure)', padding: '14px 20px' }}>
          <nav style={{ display: 'flex', gap: 18, maxWidth: 960, margin: '0 auto', flexWrap: 'wrap' }}>
            <Link href="/" style={{ fontWeight: 700, textDecoration: 'none', color: 'var(--texte)' }}>
              Vigilance météo
            </Link>
            <Link href="/national" style={{ textDecoration: 'none', color: 'var(--lien)' }}>
              Calendrier national
            </Link>
            <Link href="/departement" style={{ textDecoration: 'none', color: 'var(--lien)' }}>
              Calendrier par département
            </Link>
            <Link href="/recherche" style={{ textDecoration: 'none', color: 'var(--lien)' }}>
              Recherche avancée (archive)
            </Link>
            <a href="https://outre-mers.alertes-meteo.com" style={{ textDecoration: 'none', color: 'var(--lien)' }}>
              Outre-mer
            </a>
            <a href="https://carte-pollen.alertes-meteo.com" style={{ textDecoration: 'none', color: 'var(--lien)' }}>
              Carte des pollens
            </a>
            <a href="https://alertes-meteo.systeme.io/meteodujour" style={{ textDecoration: 'none', color: 'var(--lien)' }}>Météo par mail</a>
            <a href="https://outils.alertes-meteo.com/" style={{ textDecoration: 'none', color: 'var(--lien)' }}>Outils</a>
            <ThemeToggle />
          </nav>
        </header>
        <main style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px' }}>{children}</main>
        <footer style={{ borderTop: '1px solid var(--bordure)', padding: '18px 20px', textAlign: 'center', fontSize: 14, color: 'var(--texte-3)' }}>
          <a href="https://www.alertes-meteo.com" style={{ color: 'var(--lien)' }}>www.alertes-meteo.com</a>
        </footer>
      </body>
    </html>
  );
}
