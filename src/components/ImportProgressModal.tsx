import React from 'react';
import { Download, Sparkles, AlertCircle } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface ImportProgressModalProps {
  onImport: () => void;
  onStartFresh: () => void;
  isLoading?: boolean;
}

export const ImportProgressModal: React.FC<ImportProgressModalProps> = ({
  onImport,
  onStartFresh,
  isLoading = false,
}) => {
  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl w-full max-w-md shadow-2xl text-white overflow-hidden animate-scaleUp">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-5">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-amber-100" />
            <div>
              <h3 className="font-black text-lg">Progreso local detectado</h3>
              <p className="text-xs text-amber-100">Encontramos progreso guardado en este dispositivo.</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-300">
            Puedes importar tu progreso de Pokémon, hábitos, tareas y estadísticas a tu cuenta en la nube,
            o empezar de cero con una partida nueva en Firestore.
          </p>
          <p className="text-xs text-slate-500">
            Tu progreso local no se borrará automáticamente.
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => { soundFx.playVictory(); onImport(); }}
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
            >
              <Download className="w-4 h-4" />
              Importar progreso
            </button>
            <button
              onClick={() => { soundFx.playClick(); onStartFresh(); }}
              disabled={isLoading}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Empezar de cero
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportProgressModal;
