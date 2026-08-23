import React, { useState } from 'react';
import {
  Shield,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import {
  UserAccountProfile,
  PrivacySettings,
  DEFAULT_PRIVACY_SETTINGS,
} from '../types';
import { soundFx } from '../utils/audio';

interface PrivacySettingsPanelProps {
  profile: UserAccountProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: {
    profileVisibility: UserAccountProfile['profileVisibility'];
    privacySettings: PrivacySettings;
    healthStatsVisibility: boolean;
  }) => Promise<void>;
}

type PrivacyKey = keyof PrivacySettings;

const PRIVACY_LABELS: { key: PrivacyKey; label: string; description: string }[] = [
  { key: 'profile', label: 'Mostrar datos básicos del perfil', description: 'Nombre, avatar y bio' },
  { key: 'level', label: 'Mostrar nivel', description: 'Nivel del entrenador' },
  { key: 'pokemonTeam', label: 'Mostrar equipo Pokémon', description: 'Pokémon en tu equipo' },
  { key: 'pokedex', label: 'Mostrar Pokédex', description: 'Cantidad de Pokémon capturados' },
  { key: 'achievements', label: 'Mostrar logros', description: 'Logros desbloqueados' },
  { key: 'streak', label: 'Mostrar racha', description: 'Días de racha activa' },
  { key: 'tasksCompleted', label: 'Mostrar tareas completadas', description: 'Total de tareas' },
  { key: 'steps', label: 'Mostrar pasos', description: 'Pasos de hoy' },
  { key: 'studyStats', label: 'Mostrar estadísticas de estudio', description: 'Pomodoros y asignaturas' },
  { key: 'healthStats', label: 'Mostrar estadísticas de salud', description: 'Progreso educativo de salud' },
  { key: 'bodyMeasurement', label: 'Mostrar medida corporal', description: 'Última medida registrada' },
];

export const PrivacySettingsPanel: React.FC<PrivacySettingsPanelProps> = ({
  profile,
  isOpen,
  onClose,
  onSave,
}) => {
  const [profileVisibility, setProfileVisibility] = useState(profile.profileVisibility);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    ...DEFAULT_PRIVACY_SETTINGS,
    ...profile.privacySettings,
  });
  const [showHealthWarning, setShowHealthWarning] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const toggleSetting = (key: PrivacyKey, value: boolean) => {
    if (key === 'healthStats' && value) {
      setShowHealthWarning(true);
      return;
    }
    setPrivacySettings((prev) => ({ ...prev, [key]: value }));
    soundFx.playClick();
  };

  const confirmHealthSharing = () => {
    setPrivacySettings((prev) => ({ ...prev, healthStats: true }));
    setShowHealthWarning(false);
    soundFx.playSave();
  };

  const handleSave = async () => {
    setSaving(true);
    soundFx.playSave();
    try {
      await onSave({
        profileVisibility,
        privacySettings,
        healthStatsVisibility: privacySettings.healthStats,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
        <div className="bg-slate-900 border-2 border-emerald-600 rounded-3xl w-full max-w-lg shadow-2xl text-white overflow-hidden animate-scaleUp max-h-[90vh] flex flex-col">
          <div className="bg-gradient-to-r from-emerald-700 to-teal-700 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-200" />
              <div>
                <h3 className="font-black text-lg">Privacidad</h3>
                <p className="text-xs text-emerald-100">Tu información es privada por defecto</p>
              </div>
            </div>
            <button onClick={() => { soundFx.playCancel(); onClose(); }} className="p-1.5 bg-black/20 hover:bg-black/40 rounded-xl cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-xs text-slate-300 flex gap-2">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Elige qué estadísticas quieres compartir. Las estadísticas de salud son especialmente privadas.
              </span>
            </div>

            {/* Perfil público master toggle */}
            <ToggleRow
              label="Perfil público"
              description="Permite que otros vean tu perfil en /profile/tu-usuario"
              enabled={profileVisibility === 'public'}
              onToggle={(v) => {
                setProfileVisibility(v ? 'public' : 'private');
                soundFx.playClick();
              }}
              highlight
            />

            <div className="border-t border-slate-800 pt-3 space-y-2">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                Permisos individuales
              </p>
              {PRIVACY_LABELS.map(({ key, label, description }) => (
                <ToggleRow
                  key={key}
                  label={label}
                  description={description}
                  enabled={privacySettings[key]}
                  onToggle={(v) => toggleSetting(key, v)}
                  sensitive={key === 'healthStats'}
                />
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-slate-800 flex gap-2 shrink-0">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-black text-sm rounded-2xl cursor-pointer"
            >
              Guardar privacidad
            </button>
            <button
              onClick={() => { soundFx.playCancel(); onClose(); }}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 font-bold text-sm rounded-2xl cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* Advertencia salud */}
      {showHealthWarning && (
        <div className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
              <p className="text-sm text-slate-200 font-bold">
                Las estadísticas de salud son información personal. Solo actívalas si estás seguro de que quieres compartirlas.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowHealthWarning(false); soundFx.playCancel(); }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmHealthSharing}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-xl text-xs font-black cursor-pointer"
              >
                Compartir estadísticas de salud
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
  highlight,
  sensitive,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  highlight?: boolean;
  sensitive?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border ${
        highlight ? 'bg-red-950/30 border-red-500/30' : sensitive ? 'bg-amber-950/20 border-amber-500/20' : 'bg-slate-800/40 border-slate-700/50'
      }`}
    >
      <div className="flex-1 min-w-0 pr-3">
        <p className="text-xs font-bold text-white">{label}</p>
        <p className="text-[10px] text-slate-400">{description}</p>
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer shrink-0 ${
          enabled ? 'bg-emerald-500' : 'bg-slate-700'
        }`}
        aria-pressed={enabled}
      >
        <span
          className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform flex items-center justify-center ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        >
          {enabled ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-slate-500" />}
        </span>
      </button>
    </div>
  );
}

export default PrivacySettingsPanel;
