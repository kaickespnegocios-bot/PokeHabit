import React, { useState, useRef, useEffect } from 'react';
import { TrainerProfile } from '../types';
import { UserAccountProfile } from '../types';
import { Footprints, Coins, Flame, ChevronDown, User, Edit3, LogOut, LogIn } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { AvatarRenderer } from './AvatarRenderer';
import { DEFAULT_AVATAR_CONFIG } from '../data/avatarAssets';

interface HeaderProps {
  trainer: TrainerProfile;
  profile?: UserAccountProfile | null;
  isAuthenticated?: boolean;
  onOpenGoogleFitModal?: () => void;
  onOpenProfile?: () => void;
  onEditProfile?: () => void;
  onSignOut?: () => void;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  trainer,
  profile,
  isAuthenticated = false,
  onOpenGoogleFitModal,
  onOpenProfile,
  onEditProfile,
  onSignOut,
  onOpenAuth,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const avatarConfig = profile?.avatarConfig || trainer.avatarConfig || DEFAULT_AVATAR_CONFIG;
  const displayName = profile?.username || trainer.username || trainer.name;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fitConnected = trainer.googleFitConnected || trainer.isGoogleFitConnected;

  return (
    <header className="bg-slate-900/95 backdrop-blur-md text-white shadow-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2">
        {/* User menu (left on mobile) */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => {
              soundFx.playClick();
              if (!isAuthenticated) {
                onOpenAuth?.();
              } else {
                setMenuOpen(!menuOpen);
              }
            }}
            className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 px-2 py-1.5 rounded-2xl cursor-pointer transition-all active:scale-95"
          >
            {isAuthenticated ? (
              <AvatarRenderer config={avatarConfig} size="sm" fallbackSprite={trainer.avatarSprite} className="rounded-lg" />
            ) : (
              <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-slate-400" />
              </div>
            )}
            <span className="font-bold text-xs text-slate-200 max-w-[80px] truncate hidden xs:inline">
              {isAuthenticated ? displayName : 'Entrar'}
            </span>
            {isAuthenticated && <ChevronDown className="w-3 h-3 text-slate-400" />}
          </button>

          {menuOpen && isAuthenticated && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50 animate-fadeIn">
              <button
                onClick={() => { soundFx.playClick(); onOpenProfile?.(); setMenuOpen(false); }}
                className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4 text-red-400" /> Perfil
              </button>
              <button
                onClick={() => { soundFx.playClick(); onEditProfile?.(); setMenuOpen(false); }}
                className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-amber-400" /> Editar perfil
              </button>
              <button
                onClick={() => { soundFx.playClick(); onSignOut?.(); setMenuOpen(false); }}
                className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-300 hover:bg-red-950/50 flex items-center gap-2 cursor-pointer border-t border-slate-800"
              >
                <LogOut className="w-4 h-4" /> Cerrar sesión
              </button>
            </div>
          )}
        </div>

        {/* Stats center */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-1 justify-center">
          <div
            className="flex items-center gap-1 sm:gap-1.5 bg-orange-500/15 text-orange-300 border border-orange-500/30 px-2 sm:px-3 py-1.5 rounded-2xl"
            title="Racha Diaria"
          >
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 animate-bounce shrink-0" />
            <span className="font-black text-[10px] sm:text-xs text-orange-100 whitespace-nowrap">
              {trainer.dailyStreak || 1}
              <span className="font-bold text-orange-300/80 hidden sm:inline"> días</span>
            </span>
          </div>

          <button
            onClick={() => { onOpenGoogleFitModal?.(); soundFx.playClick(); }}
            className="flex items-center gap-1 sm:gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 px-2 sm:px-3 py-1.5 rounded-2xl cursor-pointer transition-all active:scale-95"
            title="Pasos Hoy"
          >
            <Footprints className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
            <span className="font-black text-[10px] sm:text-xs text-emerald-100 whitespace-nowrap">
              {trainer.stepsToday.toLocaleString()}
            </span>
            {fitConnected && (
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0 hidden sm:block" />
            )}
          </button>

          <div
            className="flex items-center gap-1 sm:gap-1.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 sm:px-3 py-1.5 rounded-2xl"
            title="Poké-Monedas"
          >
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span className="font-black text-[10px] sm:text-xs text-amber-100 whitespace-nowrap">
              {trainer.gold.toLocaleString()}
              <span className="hidden sm:inline"> ₽</span>
            </span>
          </div>
        </div>

        {/* Login shortcut (desktop) */}
        {!isAuthenticated && (
          <button
            onClick={() => { soundFx.playClick(); onOpenAuth?.(); }}
            className="shrink-0 hidden sm:flex items-center gap-1.5 bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-2xl text-xs font-bold cursor-pointer active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" /> Iniciar sesión
          </button>
        )}
      </div>
    </header>
  );
};
