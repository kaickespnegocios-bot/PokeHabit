import React from 'react';
import { PublicProfileData } from '../types';
import { AvatarRenderer } from './AvatarRenderer';
import { DEFAULT_AVATAR_CONFIG } from '../data/avatarAssets';
import {
  Trophy,
  Footprints,
  CheckSquare,
  BookOpen,
  Flame,
  Users,
  Lock,
  GraduationCap,
  Heart,
} from 'lucide-react';

interface PublicProfileProps {
  data: PublicProfileData | null;
  isPrivate: boolean;
  notFound: boolean;
  username: string;
}

export const PublicProfile: React.FC<PublicProfileProps> = ({
  data,
  isPrivate,
  notFound,
  username,
}) => {
  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-8 text-center max-w-md">
          <p className="text-4xl mb-3">🔍</p>
          <h1 className="font-black text-xl text-white">Entrenador no encontrado</h1>
          <p className="text-sm text-slate-400 mt-2">No existe un perfil con el nombre @{username}</p>
        </div>
      </div>
    );
  }

  if (isPrivate || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-8 text-center max-w-md">
          <Lock className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h1 className="font-black text-xl text-white">Este perfil es privado.</h1>
          <p className="text-sm text-slate-400 mt-2">@{username} ha configurado su perfil como privado.</p>
        </div>
      </div>
    );
  }

  const avatarConfig = data.avatarConfig || DEFAULT_AVATAR_CONFIG;
  const themeColor = data.themeColor || '#ef4444';
  const hasAnyStat =
    data.level !== undefined ||
    data.pokemonTeam !== undefined ||
    data.pokedexCount !== undefined ||
    data.achievementsUnlocked !== undefined ||
    data.streak !== undefined ||
    data.tasksCompleted !== undefined ||
    data.steps !== undefined ||
    data.studyStats !== undefined ||
    data.healthStats !== undefined ||
    data.bodyMeasurementCm !== undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-white py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-5 animate-fadeIn">
        {/* Header card — solo si profile permission incluyó datos básicos */}
        {(data.trainerName || data.avatarConfig) && (
          <div
            className="bg-slate-900/80 border-2 rounded-3xl p-6 flex items-center gap-5"
            style={{ borderColor: themeColor }}
          >
            <AvatarRenderer config={avatarConfig} size="xl" className="border-4 rounded-2xl" />
            <div>
              <p className="text-xs font-bold text-slate-400">@{data.username}</p>
              {data.trainerName && (
                <h1 className="font-black text-2xl text-white">{data.trainerName}</h1>
              )}
              {data.bio && <p className="text-sm text-slate-400 mt-1">{data.bio}</p>}
            </div>
          </div>
        )}

        {!data.trainerName && !data.avatarConfig && (
          <div className="text-center py-4">
            <p className="font-black text-lg">@{data.username}</p>
          </div>
        )}

        {/* Stats grid — solo campos autorizados */}
        {hasAnyStat && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {data.level !== undefined && (
              <StatCard icon={<Trophy className="w-5 h-5 text-amber-400" />} label="Nivel" value={String(data.level)} />
            )}
            {data.streak !== undefined && (
              <StatCard icon={<Flame className="w-5 h-5 text-orange-400" />} label="Racha" value={`${data.streak} días`} />
            )}
            {data.tasksCompleted !== undefined && (
              <StatCard icon={<CheckSquare className="w-5 h-5 text-emerald-400" />} label="Tareas" value={String(data.tasksCompleted)} />
            )}
            {data.steps !== undefined && (
              <StatCard icon={<Footprints className="w-5 h-5 text-blue-400" />} label="Pasos" value={data.steps.toLocaleString()} />
            )}
            {data.pokedexCount !== undefined && (
              <StatCard icon={<BookOpen className="w-5 h-5 text-purple-400" />} label="Pokédex" value={String(data.pokedexCount)} />
            )}
            {data.achievementsUnlocked !== undefined && (
              <StatCard icon={<Trophy className="w-5 h-5 text-yellow-400" />} label="Logros" value={String(data.achievementsUnlocked)} />
            )}
            {data.studyStats && (
              <StatCard
                icon={<GraduationCap className="w-5 h-5 text-indigo-400" />}
                label="Estudio"
                value={`${data.studyStats.pomodorosDone} pomos`}
              />
            )}
            {data.healthStats && (
              <StatCard
                icon={<Heart className="w-5 h-5 text-rose-400" />}
                label="Salud educativa"
                value={`Nv. ${data.healthStats.educationalLevel}`}
              />
            )}
            {data.bodyMeasurementCm !== undefined && (
              <StatCard
                icon={<Heart className="w-5 h-5 text-rose-400" />}
                label="Medida corporal"
                value={`${data.bodyMeasurementCm} cm`}
              />
            )}
          </div>
        )}

        {/* Pokémon team */}
        {data.pokemonTeam && data.pokemonTeam.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <h3 className="font-black text-sm mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-red-400" /> Equipo Pokémon
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {data.pokemonTeam.map((p, i) => (
                <div key={i} className="bg-slate-800/80 border border-slate-700 rounded-xl p-2 text-center">
                  <img src={p.sprite} alt={p.name} className="w-12 h-12 mx-auto object-contain pixelated" />
                  <p className="text-[10px] font-bold truncate">{p.nickname || p.name}</p>
                  <p className="text-[9px] text-slate-400">Nv. {p.level}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasAnyStat && !data.pokemonTeam && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 text-center">
            <p className="text-sm text-slate-500">Este entrenador no ha compartido estadísticas públicas.</p>
          </div>
        )}
      </div>
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

export default PublicProfile;
