import React from 'react';
import { AvatarConfig } from '../types';
import { avatarAssetUrl, getSkinToneColor } from '../data/avatarAssets';

interface AvatarRendererProps {
  config: AvatarConfig;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBackground?: boolean;
  fallbackSprite?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
  xl: 'w-32 h-32',
};

export const AvatarRenderer: React.FC<AvatarRendererProps> = ({
  config,
  size = 'md',
  className = '',
  showBackground = true,
  fallbackSprite,
}) => {
  const skinColor = getSkinToneColor(config.skinTone);

  return (
    <div
      className={`relative overflow-hidden rounded-xl ${sizeClasses[size]} ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {showBackground && config.background && (
        <img
          src={avatarAssetUrl('background', config.background)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}

      {config.base && (
        <img
          src={avatarAssetUrl('base', config.base)}
          alt=""
          className="absolute inset-0 w-full h-full object-contain z-10"
          style={{ filter: `sepia(1) saturate(0.5) hue-rotate(-10deg) brightness(1.1)` }}
          onError={(e) => {
            if (fallbackSprite) {
              (e.target as HTMLImageElement).src = fallbackSprite;
            }
          }}
        />
      )}

      {/* Tono de piel como overlay */}
      <div
        className="absolute inset-0 z-20 pointer-events-none mix-blend-multiply opacity-40"
        style={{ backgroundColor: skinColor }}
      />

      {config.hair && config.hair !== 'none' && (
        <img
          src={avatarAssetUrl('hair', config.hair)}
          alt=""
          className="absolute inset-0 w-full h-full object-contain z-30"
          style={{
            filter: config.hairColor
              ? `brightness(0) saturate(100%) ${hairColorToFilter(config.hairColor)}`
              : undefined,
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}

      {config.clothes && (
        <img
          src={avatarAssetUrl('clothes', config.clothes)}
          alt=""
          className="absolute inset-0 w-full h-full object-contain z-40"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}

      {config.accessory && config.accessory !== 'none' && (
        <img
          src={avatarAssetUrl('accessory', config.accessory)}
          alt=""
          className="absolute inset-0 w-full h-full object-contain z-50"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
    </div>
  );
};

/** Convierte hex a aproximación CSS filter para teñir capas de pelo */
function hairColorToFilter(hex: string): string {
  const map: Record<string, string> = {
    '#2d1b0e': 'invert(8%) sepia(20%) saturate(500%)',
    '#8B4513': 'invert(35%) sepia(40%) saturate(800%) hue-rotate(10deg)',
    '#FFD700': 'invert(75%) sepia(60%) saturate(600%) hue-rotate(10deg)',
    '#FF4500': 'invert(45%) sepia(90%) saturate(1500%) hue-rotate(350deg)',
    '#1a1a2e': 'invert(10%) sepia(30%) saturate(500%) hue-rotate(200deg)',
  };
  return map[hex] ?? '';
}

export default AvatarRenderer;
