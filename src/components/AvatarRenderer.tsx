import React from 'react';
import { AvatarConfig } from '../types';
import { AVATAR_BASE_PATH } from '../data/avatarAssets';

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
  const characterSprite = fallbackSprite || `${AVATAR_BASE_PATH}/base/${config.base === 'trainer-f' ? 'mujer' : 'hombre'}.png`;

  return (
    <div
      className={`relative overflow-hidden rounded-full ${sizeClasses[size]} ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {showBackground && config.background && (
        <img
          src={`${AVATAR_BASE_PATH}/backgrounds/${config.background}.png`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}

      <img
        src={characterSprite}
        alt="Avatar del entrenador"
        className="absolute inset-0 z-10 w-full h-full object-contain"
        onError={(event) => {
          if (event.currentTarget.src !== `${AVATAR_BASE_PATH}/base/hombre.png`) {
            event.currentTarget.src = `${AVATAR_BASE_PATH}/base/hombre.png`;
          }
        }}
      />
    </div>
  );
};

export default AvatarRenderer;
