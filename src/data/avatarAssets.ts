import { AvatarConfig } from '../types';

/** Base path compatible with Vite and GitHub Pages */
export const AVATAR_BASE_PATH = `${import.meta.env.BASE_URL}assets/avatars`.replace(/\/+/g, '/');

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  base: 'classic',
  skinTone: 'medium',
  hair: 'short',
  hairColor: '#4a3728',
  clothes: 'red-jacket',
  accessory: 'none',
  background: 'route',
};

/** Manifesto de assets — añade nuevas imágenes aquí al colocarlas en public/assets/avatars/ */
export const AVATAR_MANIFEST = {
  base: [
    { id: 'classic', label: 'Clásico' },
    { id: 'trainer-f', label: 'Entrenadora' },
  ],
  skinTone: [
    { id: 'light', label: 'Claro', color: '#ffdbac' },
    { id: 'medium', label: 'Medio', color: '#e0ac69' },
    { id: 'tan', label: 'Bronceado', color: '#c68642' },
    { id: 'dark', label: 'Oscuro', color: '#8d5524' },
  ],
  hair: [
    { id: 'none', label: 'Sin pelo' },
    { id: 'short', label: 'Corto' },
    { id: 'long', label: 'Largo' },
    { id: 'spiky', label: 'Espinoso' },
  ],
  hairColor: [
    { id: '#2d1b0e', label: 'Negro' },
    { id: '#8B4513', label: 'Castaño' },
    { id: '#FFD700', label: 'Rubio' },
    { id: '#FF4500', label: 'Pelirrojo' },
    { id: '#1a1a2e', label: 'Azul oscuro' },
  ],
  clothes: [
    { id: 'red-jacket', label: 'Chaqueta roja' },
    { id: 'blue-vest', label: 'Chaleco azul' },
    { id: 'green-hoodie', label: 'Sudadera verde' },
  ],
  accessory: [
    { id: 'none', label: 'Ninguno' },
    { id: 'cap', label: 'Gorra' },
    { id: 'glasses', label: 'Gafas' },
  ],
  background: [
    { id: 'route', label: 'Ruta Pokémon' },
    { id: 'gym', label: 'Gimnasio' },
    { id: 'lab', label: 'Laboratorio' },
    { id: 'night', label: 'Noche estrellada' },
  ],
} as const;

export type AvatarLayer = keyof Omit<AvatarConfig, 'hairColor'>;

export function avatarAssetUrl(layer: AvatarLayer, assetId: string): string {
  if (assetId === 'none') return '';
  const folderMap: Record<AvatarLayer, string> = {
    base: 'base',
    skinTone: 'base',
    hair: 'hair',
    clothes: 'clothes',
    accessory: 'accessories',
    background: 'backgrounds',
  };
  const folder = folderMap[layer];
  return `${AVATAR_BASE_PATH}/${folder}/${assetId}.svg`;
}

export function getSkinToneColor(skinToneId: string): string {
  return AVATAR_MANIFEST.skinTone.find((s) => s.id === skinToneId)?.color ?? '#e0ac69';
}
