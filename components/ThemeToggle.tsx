'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

/** Bouton « Mode clair / Mode sombre » : le choix est mémorisé, à défaut on suit le réglage du système. */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  }, []);

  if (!theme) return <span style={{ minWidth: 120 }} />;

  const basculer = () => {
    const suivant: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', suivant);
    try {
      localStorage.setItem('theme', suivant);
    } catch {
      /* stockage indisponible : le choix vaut pour cette page seulement */
    }
    setTheme(suivant);
  };

  return (
    <button
      type="button"
      onClick={basculer}
      aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      style={{ marginLeft: 'auto', background: 'transparent', color: 'var(--texte)', border: '1px solid var(--bordure-champ)', borderRadius: 999, padding: '6px 14px', fontSize: 14, cursor: 'pointer' }}
    >
      {theme === 'dark' ? '☀️ Mode clair' : '🌙 Mode sombre'}
    </button>
  );
}
