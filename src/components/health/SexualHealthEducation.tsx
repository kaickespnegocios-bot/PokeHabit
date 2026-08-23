import React from 'react';
import { Shield, Heart, BookOpen, Droplets, Stethoscope } from 'lucide-react';

interface HealthEducationContentProps {
  compact?: boolean;
}

/** Contenido educativo adaptado — enfoque en prevención, higiene y bienestar */
export const MaleSexualHealthContent: React.FC<HealthEducationContentProps> = ({ compact }) => {
  const topics = [
    { icon: <BookOpen className="w-4 h-4 text-blue-400" />, title: 'Educación sexual', desc: 'Información sobre anatomía, pubertad y cambios corporales.' },
    { icon: <Droplets className="w-4 h-4 text-cyan-400" />, title: 'Higiene personal', desc: 'Hábitos diarios de limpieza y cuidado íntimo.' },
    { icon: <Shield className="w-4 h-4 text-emerald-400" />, title: 'Prevención', desc: 'ETS, métodos anticonceptivos y consentimiento.' },
    { icon: <Stethoscope className="w-4 h-4 text-purple-400" />, title: 'Revisiones médicas', desc: 'Importancia de chequeos urológicos y de salud general.' },
    { icon: <Heart className="w-4 h-4 text-rose-400" />, title: 'Bienestar emocional', desc: 'Autoestima, relaciones saludables y comunicación.' },
  ];

  return (
    <div className={`space-y-${compact ? '2' : '3'}`}>
      <p className="text-xs text-slate-400">
        Sección educativa de salud y bienestar. Tu información personal permanece privada.
      </p>
      <div className="grid gap-2">
        {topics.map((t) => (
          <div key={t.title} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex gap-3">
            <div className="shrink-0 mt-0.5">{t.icon}</div>
            <div>
              <p className="text-xs font-black text-white">{t.title}</p>
              <p className="text-[11px] text-slate-400">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const FemaleSexualHealthContent: React.FC<HealthEducationContentProps> = ({ compact }) => {
  const topics = [
    { icon: <BookOpen className="w-4 h-4 text-pink-400" />, title: 'Educación sexual', desc: 'Ciclo menstrual, anatomía y cambios durante la pubertad.' },
    { icon: <Droplets className="w-4 h-4 text-cyan-400" />, title: 'Higiene personal', desc: 'Cuidado íntimo, productos recomendados y hábitos saludables.' },
    { icon: <Shield className="w-4 h-4 text-emerald-400" />, title: 'Prevención', desc: 'ETS, anticoncepción, vacunas (VPH) y consentimiento.' },
    { icon: <Stethoscope className="w-4 h-4 text-purple-400" />, title: 'Revisiones médicas', desc: 'Citologías, consultas ginecológicas y salud reproductiva.' },
    { icon: <Heart className="w-4 h-4 text-rose-400" />, title: 'Bienestar emocional', desc: 'Autoestima, límites personales y relaciones sanas.' },
  ];

  return (
    <div className={`space-y-${compact ? '2' : '3'}`}>
      <p className="text-xs text-slate-400">
        Sección educativa de salud y bienestar. Tu información personal permanece privada.
      </p>
      <div className="grid gap-2">
        {topics.map((t) => (
          <div key={t.title} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex gap-3">
            <div className="shrink-0 mt-0.5">{t.icon}</div>
            <div>
              <p className="text-xs font-black text-white">{t.title}</p>
              <p className="text-[11px] text-slate-400">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
