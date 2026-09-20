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
              background: '#fff',
              border: '1px solid #e4e9f0',
              textDecoration: 'none',
              color: '#1f2937',
            }}
          >
            <strong>{d.code}</strong> — {d.nom}
          </Link>
        ))}
      </div>
    </div>
  );
}
