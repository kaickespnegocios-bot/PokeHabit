import React, { useState } from 'react';
import { User, UserCircle } from 'lucide-react';
import { ProfileGender } from '../types';
import { soundFx } from '../utils/audio';

interface GenderMigrationModalProps {
  onSelect: (gender: ProfileGender) => Promise<void>;
  isLoading?: boolean;
}

export const GenderMigrationModal: React.FC<GenderMigrationModalProps> = ({
  onSelect,
  isLoading = false,
}) => {
  const [loading, setLoading] = useState(false);

  const handleSelect = async (gender: ProfileGender) => {
    soundFx.playSelect();
    setLoading(true);
    try {
      await onSelect(gender);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-red-500 rounded-3xl w-full max-w-md shadow-2xl text-white overflow-hidden animate-scaleUp">
        <div className="bg-gradient-to-r from-red-600 to-rose-600 p-5 text-center">
          <h2 className="font-black text-xl">Actualización de cuenta</h2>
          <p className="text-sm text-red-100 mt-1">Para continuar, selecciona tu perfil.</p>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-400 text-center">
            Esta selección se utiliza únicamente para adaptar el contenido educativo de salud.
            No podrás cambiarla después.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSelect('male')}
              disabled={loading || isLoading}
              className="flex flex-col items-center gap-3 p-5 bg-slate-800 hover:bg-slate-750 border-2 border-slate-700 hover:border-blue-500 rounded-2xl cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              <User className="w-10 h-10 text-blue-400" />
              <span className="font-black text-sm">Hombre</span>
            </button>
            <button
              onClick={() => handleSelect('female')}
              disabled={loading || isLoading}
              className="flex flex-col items-center gap-3 p-5 bg-slate-800 hover:bg-slate-750 border-2 border-slate-700 hover:border-pink-500 rounded-2xl cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              <UserCircle className="w-10 h-10 text-pink-400" />
              <span className="font-black text-sm">Mujer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenderMigrationModal;
