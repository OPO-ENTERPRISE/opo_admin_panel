export interface IArea {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  enabled: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AreaSelection {
  area: IArea;
  selectedAt: string;
}

// Áreas predefinidas del sistema
export const PREDEFINED_AREAS: IArea[] = [
  {
    id: '1',
    name: 'PN - Policía Nacional',
    description: 'Área de Policía Nacional - Oposiciones para acceso a la Policía Nacional',
    icon: 'security',
    color: '#2196F3',
    enabled: true,
    order: 0,
  },
  {
    id: '2',
    name: 'PS - Policía Local/Guardia Civil',
    description:
      'Área de Policía Local y Guardia Civil - Oposiciones para acceso a Policía Local y Guardia Civil',
    icon: 'local_police',
    color: '#4CAF50',
    enabled: true,
    order: 1,
  },
];

// Constantes para las áreas
export const AREA_CONSTANTS = {
  PN: '1',
  PS: '2',
} as const;

export type AreaId = (typeof AREA_CONSTANTS)[keyof typeof AREA_CONSTANTS];
