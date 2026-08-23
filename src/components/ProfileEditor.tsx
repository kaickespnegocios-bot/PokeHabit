import React, { useState } from 'react';
import { X, Check, Sparkles, Shield } from 'lucide-react';
import { AvatarConfig, TrainerProfile, UserAccountProfile } from '../types';
import { AvatarRenderer } from './AvatarRenderer';
import {
  AVATAR_MANIFEST,
  DEFAULT_AVATAR_CONFIG,
} from '../data/avatarAssets';
import { soundFx } from '../utils/audio';

const AVATAR_BASE_PATH = `${import.meta.env.BASE_URL}assets/avatars/base`;

interface ProfileEditorProps {
  trainer: TrainerProfile;
  profile: UserAccountProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: {
    profile: Partial<UserAccountProfile>;
    trainer: Partial<TrainerProfile>;
  }) => void;
  onOpenPrivacy: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  trainer,
  profile,
  isOpen,
  onClose,
  onSave,
  onOpenPrivacy,
}) => {
  const emailUsername = (profile?.email || trainer.email || '').split('@')[0].trim();
  const defaultUsername = emailUsername || 'Entrenador';
  const [username, setUsername] = useState(profile?.username || trainer.username || defaultUsername);
  const [trainerName, setTrainerName] = useState(profile?.trainerName || trainer.name);
  const [bio, setBio] = useState(profile?.bio || trainer.bio || '');
  const [themeColor, setThemeColor] = useState(profile?.themeColor || trainer.themeColor || '#ef4444');
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(
    profile?.avatarConfig || trainer.avatarConfig || DEFAULT_AVATAR_CONFIG
  );
  const selectedCharacter = avatarConfig.base === 'trainer-f' ? 'female' : 'male';
  const characterSprite = `${AVATAR_BASE_PATH}/${selectedCharacter === 'female' ? 'mujer' : 'hombre'}.png`;

  if (!isOpen) return null;

  const updateAvatar = (key: keyof AvatarConfig, value: string) => {
    setAvatarConfig((prev) => ({ ...prev, [key]: value }));
    soundFx.playClick();
  };

  const handleSave = () => {
    soundFx.playSave();
    onSave({
      profile: {
        username: username.trim() || defaultUsername,
        trainerName: trainerName.trim() || 'Entrenador',
        bio: bio.trim(),
        themeColor,
        avatarConfig,
        avatarSprite: characterSprite,
      },
      trainer: {
        username: username.trim() || defaultUsername,
        name: trainerName.trim(),
        bio: bio.trim(),
        themeColor,
        avatarConfig,
        avatarSprite: characterSprite,
      },
    });
    onClose();
  };

  const THEME_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#1e293b'];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-red-500 rounded-3xl w-full max-w-2xl shadow-2xl text-white overflow-hidden animate-scaleUp max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-red-600 to-rose-600 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h3 className="font-black text-lg">Editar Perfil</h3>
          </div>
          <button onClick={() => { soundFx.playCancel(); onClose(); }} className="p-1.5 bg-black/20 hover:bg-black/40 rounded-xl cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Preview */}
          <div className="flex items-center gap-4 bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
            <AvatarRenderer config={avatarConfig} size="lg" fallbackSprite={trainer.avatarSprite} />
            <div>
              <p className="font-black text-white">@{username}</p>
              <p className="text-sm text-amber-400">{trainerName}</p>
            </div>
          </div>

          {/* Text fields */}
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Nombre de usuario" value={username} onChange={setUsername} maxLength={25} />
            <Field label="Nombre del entrenador" value={trainerName} onChange={setTrainerName} maxLength={25} />
          </div>
          <button
            type="button"
            onClick={() => { soundFx.playClick(); onOpenPrivacy(); }}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <Shield className="w-4 h-4" /> Configuración de privacidad
          </button>
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-500 resize-none"
              placeholder="Cuéntanos sobre tu aventura Pokémon..."
            />
          </div>

          {/* Character selection */}
          <div>
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-2">Personaje</label>
            <div className="grid grid-cols-2 gap-3">
              {(['male', 'female'] as const).map((gender) => {
                const selected = selectedCharacter === gender;
                const label = gender === 'female' ? 'Mujer' : 'Hombre';
                return (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => updateAvatar('base', gender === 'female' ? 'trainer-f' : 'classic')}
                    className={`relative flex items-center justify-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      selected ? 'border-red-500 bg-red-950/40 ring-2 ring-red-500/40' : 'border-slate-700 bg-slate-800 hover:border-slate-500'
                    }`}
                  >
                    <img
                      src={`${AVATAR_BASE_PATH}/${gender === 'female' ? 'mujer' : 'hombre'}.png`}
                      alt={label}
                      className="w-16 h-16 object-contain pixelated"
                    />
                    <span className="font-black text-sm">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <AvatarLayerPicker
            title="Fondo"
            options={AVATAR_MANIFEST.background}
            selected={avatarConfig.background}
            onSelect={(v) => updateAvatar('background', v)}
          />

          {/* Theme color */}
          <div>
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-2">Color de acento</label>
            <div className="flex flex-wrap gap-2">
              {THEME_COLORS.map((hex) => (
                <button
                  key={hex}
                  onClick={() => { setThemeColor(hex); soundFx.playClick(); }}
                  className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                    themeColor === hex ? 'scale-125 border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 flex gap-2 shrink-0">
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-red-600 hover:bg-red-500 font-black text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" /> Guardar cambios
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
  );
};

function Field({
  label,
  value,
  onChange,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength: number;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-400 block mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-500"
      />
    </div>
  );
}

function AvatarLayerPicker({
  title,
  options,
  selected,
  onSelect,
  showColor,
}: {
  title: string;
  options: readonly { id: string; label: string; color?: string }[];
  selected: string;
  onSelect: (id: string) => void;
  showColor?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-2">{title}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              selected === opt.id
                ? 'bg-red-600 text-white shadow'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:text-white'
            }`}
            style={showColor && opt.color ? { borderColor: opt.color, borderWidth: selected === opt.id ? 2 : 1 } : undefined}
          >
            {showColor && opt.color && (
              <span className="inline-block w-3 h-3 rounded-full mr-1.5 align-middle" style={{ backgroundColor: opt.color }} />
            )}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProfileEditor;
