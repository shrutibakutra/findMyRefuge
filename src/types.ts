export interface RefugeType {
  id: number;
  valeur: string;
}

export interface RefugeProperties {
  nom: string;
  id: number;
  type: RefugeType;
  coord: {
    alt: number;
    long: number;
    lat: number;
  };
  places: { valeur: number };
  lien: string;
  acces?: { nom: string; valeur: string };
  description?: { nom: string; valeur: string };
  remarque?: { nom: string; valeur: string };
  etat?: { nom: string; valeur: string; id: string };
  info_comp?: {
    eau?: { valeur: string };
    cheminee?: { valeur: string };
    couvertures?: { valeur: string };
    latrines?: { valeur: string };
    places_matelas?: { valeur: number };
  };
  proprio?: { nom: string; valeur: string };
}

export interface Refuge {
  type: 'Feature';
  id: number;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: RefugeProperties;
}
