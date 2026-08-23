import React, { useState } from 'react';
import { TrainerProfile } from '../types';
import {
  Footprints,
  CheckCircle2,
  X,
  Flame,
  Heart,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { connectGoogleFit, readTodaySteps } from '../services/googleFit';

interface GoogleFitModalProps {
  trainer: TrainerProfile;
  isOpen: boolean;
  onClose: () => void;
  onAddSteps: (steps: number) => void;
  onGoogleFitConnected: () => void;
}

export const GoogleFitModal: React.FC<GoogleFitModalProps> = ({
  trainer,
  isOpen,
  onClose,
  onAddSteps,
  onGoogleFitConnected,
}) => {
  const [manualStepsToAdd, setManualStepsToAdd] = useState(1000);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isOpen) return null;

  const handleManualAdd = () => {
    soundFx.playSelect();
    onAddSteps(manualStepsToAdd);
    setSyncFeedback(`✓ Añadidos +${manualStepsToAdd.toLocaleString()} pasos manualmente`);
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  const handleGoogleFitSync = async () => {
    setSyncFeedback(null);
    setIsConnecting(true);
    try {
      await connectGoogleFit();
      const syncedSteps = await readTodaySteps();
      const additionalSteps = Math.max(0, syncedSteps - trainer.stepsToday);
      if (additionalSteps > 0) onAddSteps(additionalSteps);
      onGoogleFitConnected();
      setSyncFeedback(`Google Fit ha registrado ${syncedSteps.toLocaleString()} pasos hoy.`);
    } catch (error) {
      setSyncFeedback(error instanceof Error ? error.message : 'No se pudo vincular Google Fit.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl w-full max-w-md shadow-2xl text-white overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-2xl shadow">
              <Footprints className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">Pasos manuales</h3>
              <p className="text-xs text-emerald-100">Registra tu actividad sin sincronizaciones automáticas</p>
            </div>
          </div>
          {!trainer.isGoogleFitConnected && <button
            onClick={() => {
              soundFx.playCancel();
              onClose();
            }}
            className="p-1.5 bg-black/20 hover:bg-black/40 rounded-xl text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Feedback message */}
          {syncFeedback && (
            <div className="bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-bold p-3 rounded-2xl animate-fadeIn flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{syncFeedback}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleFitSync}
            disabled={isConnecting}
            className="w-full py-2.5 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-900 font-black rounded-xl text-xs cursor-pointer transition-colors"
          >
            {isConnecting ? 'Conectando con Google Fit...' : 'Vincular y leer pasos de Google Fit'}
          </button>

          {/* Live Step Tracker Summary */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Pasos de Hoy
              </span>
              <span className="text-xs text-emerald-400 font-black">
                {Math.min(100, Math.round((trainer.stepsToday / trainer.stepGoal) * 100))}% de la meta
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                {trainer.stepsToday.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-bold">
                / {trainer.stepGoal.toLocaleString()} pasos
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-900 rounded-full h-3 p-0.5 border border-slate-700 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (trainer.stepsToday / trainer.stepGoal) * 100)}%`,
                }}
              />
            </div>

            {/* Calories / Active metrics estimation */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="text-[10px] text-slate-400">Calorías Quemadas</p>
                  <p className="text-xs font-bold text-white">
                    {Math.round(trainer.stepsToday * 0.04)} kcal
                  </p>
                </div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <div>
                  <p className="text-[10px] text-slate-400">Distancia Estimada</p>
                  <p className="text-xs font-bold text-white">
                    {((trainer.stepsToday * 0.75) / 1000).toFixed(2)} km
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Registro manual de pasos */}
          {!trainer.isGoogleFitConnected && <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider">
              Añadir pasos:
            </h4>

            {/* Quick Step Injector */}
            <div className="flex items-center gap-2 pt-1">
              {[500, 1000, 2500, 5000].map((steps) => (
                <button
                  key={steps}
                  onClick={() => {
                    soundFx.playClick();
                    setManualStepsToAdd(steps);
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                    manualStepsToAdd === steps
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  +{steps >= 1000 ? `${steps / 1000}k` : steps}
                </button>
              ))}
              <button
                onClick={handleManualAdd}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-[11px] font-bold text-emerald-300 cursor-pointer"
              >
                Añadir
              </button>
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
};
