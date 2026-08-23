import React, { useState } from 'react';
import {
  User,
  Edit3,
  Trophy,
  Footprints,
  CheckSquare,
  Users,
  BookOpen,
  Flame,
  Coins,
  Sparkles,
  Shield,
} from 'lucide-react';
import { TrainerProfile, PartyPokemon, UserAccountProfile } from '../types';
import { AvatarRenderer } from './AvatarRenderer';
import { DEFAULT_AVATAR_CONFIG } from '../data/avatarAssets';
import { soundFx } from '../utils/audio';

interface ProfilePageProps {
  trainer: TrainerProfile;
  profile: UserAccountProfile | null;
  party: PartyPokemon[];
  capturedCount: number;
  isAuthenticated: boolean;
  onEditProfile: () => void;
  onOpenPrivacy: () => void;
  onOpenAuth: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  trainer,
  profile,
  party,
  capturedCount,
  isAuthenticated,
  onEditProfile,
  onOpenPrivacy,
  onOpenAuth,
}) => {
  const avatarConfig = profile?.avatarConfig || trainer.avatarConfig || DEFAULT_AVATAR_CONFIG;
  const displayName = profile?.username || trainer.username || trainer.name;
  const trainerName = profile?.trainerName || trainer.name;
  const themeColor = profile?.themeColor || trainer.themeColor || '#ef4444';
  const bio = profile?.bio || trainer.bio || '';
  const currentXp = trainer.currentXp ?? 0;
  const maxXp = trainer.maxXp ?? 100;
  const xpPercent = Math.min(100, Math.round((currentXp / maxXp) * 100));

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Tarjeta principal del entrenador */}
      <div
        className="bg-slate-900/80 border-2 rounded-3xl overflow-hidden shadow-xl"
        style={{ borderColor: themeColor }}
      >
        <div
          className="p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5"
          style={{ background: `linear-gradient(135deg, ${themeColor}30, transparent)` }}
        >
          <div className="relative">
            <AvatarRenderer
              config={avatarConfig}
              size="xl"
              className="border-4 shadow-lg rounded-2xl"
              fallbackSprite={trainer.avatarSprite}
            />
            {isAuthenticated && (
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full border-2 border-slate-900">
                ONLINE
              </span>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">@{displayName}</p>
            <h1 className="font-black text-2xl sm:text-3xl text-white">{trainerName}</h1>
            <p className="text-sm text-amber-400 font-semibold mt-1">
              {trainer.trainerTitle || 'Entrenador Pokémon'} • Nv. {trainer.level}
            </p>
            {bio && <p className="text-sm text-slate-400 mt-2 max-w-md">{bio}</p>}

            {/* Barra XP */}
            <div className="mt-3 max-w-xs mx-auto sm:mx-0">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>XP Entrenador</span>
                <span>{currentXp}/{maxXp}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${xpPercent}%`, backgroundColor: themeColor }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => { soundFx.playClick(); onEditProfile(); }}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-2xl flex items-center gap-2 cursor-pointer shadow active:scale-95"
              >
                <Edit3 className="w-4 h-4" /> Editar perfil
              </button>
              <button
                onClick={() => { soundFx.playClick(); onOpenPrivacy(); }}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-2xl flex items-center gap-2 cursor-pointer shadow active:scale-95"
              >
                <Shield className="w-4 h-4" /> Privacidad
              </button>
            ) : (
              <button
                onClick={() => { soundFx.playClick(); onOpenAuth(); }}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-2xl flex items-center gap-2 cursor-pointer shadow active:scale-95"
              >
                <User className="w-4 h-4" /> Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Flame className="w-5 h-5 text-orange-400" />} label="Racha" value={`${trainer.dailyStreak} días`} />
        <StatCard icon={<CheckSquare className="w-5 h-5 text-emerald-400" />} label="Tareas" value={String(trainer.totalTasksCompleted)} />
        <StatCard icon={<Footprints className="w-5 h-5 text-blue-400" />} label="Pasos hoy" value={trainer.stepsToday.toLocaleString()} />
        <StatCard icon={<Coins className="w-5 h-5 text-amber-400" />} label="Monedas" value={`${trainer.gold} ₽`} />
        <StatCard icon={<Users className="w-5 h-5 text-red-400" />} label="Equipo" value={`${party.length}/6`} />
        <StatCard icon={<BookOpen className="w-5 h-5 text-purple-400" />} label="Capturados" value={String(capturedCount)} />
        <StatCard icon={<Trophy className="w-5 h-5 text-yellow-400" />} label="Mejor racha" value={`${trainer.bestStreak} días`} />
        <StatCard icon={<Sparkles className="w-5 h-5 text-pink-400" />} label="Pomodoros" value={String(trainer.totalPomodorosDone)} />
      </div>

      {/* Equipo Pokémon */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <h3 className="font-black text-white text-sm mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-red-400" /> Equipo Pokémon
        </h3>
        {party.length === 0 ? (
          <p className="text-xs text-slate-500">Aún no tienes Pokémon en tu equipo.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {party.map((p) => (
              <div
                key={p.id}
                className="bg-slate-800/80 border border-slate-700 rounded-xl p-2 text-center"
              >
                <img
                  src={p.sprite}
                  alt={p.name}
                  className="w-12 h-12 mx-auto object-contain pixelated"
                />
                <p className="text-[10px] font-bold text-white truncate mt-1">{p.nickname || p.name}</p>
                <p className="text-[9px] text-slate-400">Nv. {p.level}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isAuthenticated && (
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-4 text-center">
          <p className="text-sm text-slate-400">
            Inicia sesión para sincronizar tu progreso entre dispositivos con Firebase.
          </p>
        </div>
      )}
    </div>
  );
};

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-[10px] text-slate-400 font-semibold uppercase">{label}</p>
      <p className="font-black text-white text-sm">{value}</p>
    </div>
  );
}

export default ProfilePage;
