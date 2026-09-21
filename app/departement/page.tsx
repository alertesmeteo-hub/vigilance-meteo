import Link from 'next/link';
import { DEPARTEMENTS } from '../../lib/departements';

export default function DepartementIndex() {
  return (
    <div>
      <h1>Choisir un département</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
        {DEPARTEMENTS.map((d) => (
          <Link
            key={d.code}
            href={`/departement/${d.code}`}
            style={{
              display: 'block',
              padding: '10px 14px',
              borderRadius: 10,
              background: 'var(--surface)',
              border: '1px solid var(--bordure)',
              textDecoration: 'none',
              color: 'var(--texte)',
            }}
          >
            <strong>{d.code}</strong> — {d.nom}
          </Link>
        ))}
      </div>
    </div>
  );
}
