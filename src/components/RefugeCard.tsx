import type { Refuge } from '../types';

const TYPE_CONFIG: Record<number, { gradient: string; label: string }> = {
  10: {
    gradient: 'linear-gradient(160deg, #c0392b 0%, #e74c3c 55%, #f0a500 100%)',
    label: 'Refuge gardé',
  },
  9: {
    gradient: 'linear-gradient(160deg, #1a3a5c 0%, #2980b9 55%, #5dade2 100%)',
    label: 'Refuge non gardé',
  },
  7: {
    gradient: 'linear-gradient(160deg, #1e5631 0%, #27ae60 55%, #82e0aa 100%)',
    label: 'Cabane non gardée',
  },
  8: {
    gradient: 'linear-gradient(160deg, #145a32 0%, #229954 55%, #76d7a0 100%)',
    label: 'Cabane équipée',
  },
  28: {
    gradient: 'linear-gradient(160deg, #1a0a2e 0%, #6c3483 55%, #bb8fce 100%)',
    label: 'Bivouac',
  },
  11: {
    gradient: 'linear-gradient(160deg, #7d4e00 0%, #b7770d 55%, #f0c040 100%)',
    label: "Gîte d'étape",
  },
};

const DEFAULT_CONFIG = {
  gradient: 'linear-gradient(160deg, #2c3e50 0%, #3498db 55%, #85c1e9 100%)',
  label: 'Refuge',
};

function stripBBCode(text: string): string {
  return text
    .replace(/\[url=[^\]]*\](.*?)\[\/url\]/gi, '$1')
    .replace(/\[[^\]]+\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function MountainSVG() {
  return (
    <svg
      className="card-mountain-svg"
      viewBox="0 0 400 240"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <polygon points="0,240 130,90 260,240" fill="rgba(255,255,255,0.06)" />
      <polygon points="140,240 320,55 500,240" fill="rgba(255,255,255,0.06)" />
      <polygon points="60,240 210,25 360,240" fill="rgba(255,255,255,0.11)" />
      <polygon points="185,25 210,5 235,25 228,42 192,42" fill="rgba(255,255,255,0.45)" />
    </svg>
  );
}

interface Props {
  refuge: Refuge;
}

export default function RefugeCard({ refuge }: Props) {
  const p = refuge.properties;
  const config = TYPE_CONFIG[p.type.id] ?? DEFAULT_CONFIG;
  const label = TYPE_CONFIG[p.type.id]?.label ?? p.type.valeur;

  const access = p.acces?.valeur ? stripBBCode(p.acces.valeur) : null;
  const description = p.description?.valeur ? stripBBCode(p.description.valeur) : null;
  const blurb = access || description;

  const hasCapacity = p.places.valeur > 0;
  const alt = p.coord.alt;

  const amenities: string[] = [];
  if (p.info_comp?.eau?.valeur && !p.info_comp.eau.valeur.toLowerCase().includes('inconnu')) {
    amenities.push('Eau');
  }
  if (p.info_comp?.cheminee?.valeur === 'Oui') amenities.push('Cheminée');
  if (p.info_comp?.couvertures?.valeur === 'Oui') amenities.push('Couvertures');

  return (
    <a
      href={p.lien}
      target="_blank"
      rel="noopener noreferrer"
      className="card"
      aria-label={p.nom}
    >
      <div className="card-image" style={{ background: config.gradient }}>
        <MountainSVG />
        <span className="card-type-badge">{label}</span>
        {p.etat?.id === 'ouvert' && (
          <span className="card-status card-status--open">Ouvert</span>
        )}
        {p.etat?.id === 'ferme' && (
          <span className="card-status card-status--closed">Fermé</span>
        )}
      </div>

      <div className="card-body">
        <div className="card-row card-row--top">
          <h3 className="card-name">{p.nom}</h3>
        </div>

        <div className="card-meta">
          <span className="card-alt">{alt > 0 ? `${alt.toLocaleString()} m` : 'Alt. inconnue'}</span>
          {hasCapacity && (
            <>
              <span className="card-dot">·</span>
              <span>{p.places.valeur} places</span>
            </>
          )}
        </div>

        {amenities.length > 0 && (
          <div className="card-amenities">
            {amenities.map((a) => (
              <span key={a} className="card-amenity">{a}</span>
            ))}
          </div>
        )}

        {blurb && <p className="card-blurb">{blurb.slice(0, 100)}{blurb.length > 100 ? '…' : ''}</p>}
      </div>
    </a>
  );
}
