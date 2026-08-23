import React, { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { STARTERS, createStarterPartyPokemon } from '../data/starters';
import { PartyPokemon, TrainerProfile } from '../types';
import { POKEMON_TYPES } from '../data/pokemonTypes';
import { soundFx } from '../utils/audio';

const AVATAR_BASE_PATH = `${import.meta.env.BASE_URL}assets/avatars/base`;

interface StarterModalProps {
  initialTrainer?: TrainerProfile;
  onComplete: (trainerUpdates: Partial<TrainerProfile>, starter: PartyPokemon) => void;
}

const TRAINER_SKINS = [
  {
    id: 'male',
    name: 'Hombre',
    spriteUrl: `${AVATAR_BASE_PATH}/classic.svg`,
    fallbackUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/red.png',
  },
  {
    id: 'female',
    name: 'Mujer',
    spriteUrl: `${AVATAR_BASE_PATH}/trainer-f.svg`,
    fallbackUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/leaf.png',
  },
] as const;

export const StarterModal: React.FC<StarterModalProps> = ({ initialTrainer, onComplete }) => {
  const [selectedSkin, setSelectedSkin] = useState<'male' | 'female'>('male');
  const [selectedPokemonId, setSelectedPokemonId] = useState(4);
  const starters = STARTERS.filter((starter) => starter.generation === 1);
  const selectedSkinOption = TRAINER_SKINS.find((skin) => skin.id === selectedSkin) || TRAINER_SKINS[0];
  const selectedStarter = starters.find((starter) => starter.pokemonId === selectedPokemonId) || starters[0];

  const handleConfirm = () => {
    soundFx.playVictory();
    confetti({ particleCount: 120, spread: 90 });
    onComplete(
      {
        name: initialTrainer?.name || 'Entrenador',
        avatarSprite: selectedSkinOption.spriteUrl,
        trainerClass: selectedSkin === 'female' ? 'Entrenadora Pokémon' : 'Entrenador Pokémon',
      },
      createStarterPartyPokemon(selectedStarter)
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-red-500 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl space-y-5 text-white text-center animate-scaleUp my-auto">
        <div>
          <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <h2 className="text-xl sm:text-2xl font-black">Elige tu entrenador y tu starter</h2>
          <p className="text-xs text-slate-300 mt-1">Selecciona una skin y el Pokémon con el que comenzarás tu aventura.</p>
        </div>

        <div className="text-left">
          <label className="text-xs font-black uppercase text-slate-300 block mb-2">Skin</label>
          <div className="grid grid-cols-2 gap-3">
            {TRAINER_SKINS.map((skin) => {
              const selected = skin.id === selectedSkin;
              return (
                <button key={skin.id} type="button" onClick={() => { setSelectedSkin(skin.id); soundFx.playClick(); }}
                  className={`relative p-3 rounded-2xl border-2 flex items-center justify-center gap-3 cursor-pointer transition-all ${selected ? 'border-red-500 bg-red-950/40 ring-2 ring-red-500/40' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}>
                  {selected && <Check className="absolute top-2 right-2 w-4 h-4 text-emerald-400" />}
                  <img
                    src={skin.spriteUrl}
                    alt={skin.name}
                    className="w-16 h-16 object-contain pixelated"
                    onError={(event) => {
                      event.currentTarget.src = skin.fallbackUrl;
                    }}
                  />
                  <span className="font-black text-sm">{skin.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-left">
          <label className="text-xs font-black uppercase text-slate-300 block mb-2">Starter</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {starters.map((starter) => {
              const selected = starter.pokemonId === selectedPokemonId;
              const typeInfo = POKEMON_TYPES[starter.types[0]];
              return (
                <button key={starter.pokemonId} type="button" onClick={() => { setSelectedPokemonId(starter.pokemonId); soundFx.playClick(); }}
                  className={`p-2.5 rounded-2xl border-2 text-center cursor-pointer transition-all ${selected ? 'border-red-500 bg-slate-800 ring-2 ring-red-500/50' : 'border-slate-800 bg-slate-800/60 hover:border-slate-600'}`}>
                  <img src={starter.officialArtwork} alt={starter.name} className="w-16 h-16 mx-auto object-contain" />
                  <span className="block text-xs font-black">{starter.name}</span>
                  <span className="text-[9px] font-black uppercase" style={{ color: typeInfo.color }}>{typeInfo.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button type="button" onClick={handleConfirm}
          className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm rounded-xl shadow-xl cursor-pointer transition-transform active:scale-95">
          Comenzar con {selectedStarter.name}
        </button>
      </div>
    </div>
  );
};
