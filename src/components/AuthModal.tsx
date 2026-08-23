import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, X, KeyRound, LogIn, UserPlus, AlertCircle, CheckCircle2, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { soundFx } from '../utils/audio';
import { STARTERS } from '../data/starters';
import { POKEMON_TYPES } from '../data/pokemonTypes';

export type AuthMode = 'login' | 'register' | 'reset';

interface AuthModalProps {
  mode?: AuthMode;
  isOpen?: boolean;
  onClose?: () => void;
  standalone?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  mode: initialMode = 'login',
  isOpen = true,
  onClose,
  standalone = false,
}) => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, signUp, resetPassword, isFirebaseReady } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [selectedStarterId, setSelectedStarterId] = useState(4);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen && !standalone) return null;

  const handleClose = () => {
    soundFx.playCancel();
    if (onClose) onClose();
    else navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    soundFx.playClick();

    try {
      if (mode === 'login') {
        const result = await signIn(email, password);
        if (result.success) {
          soundFx.playVictory();
          handleClose();
        } else {
          setError(result.message || 'Error al iniciar sesión');
          soundFx.playCancel();
        }
      } else if (mode === 'register') {
        if (!gender) {
          setError('Debes seleccionar Hombre o Mujer para continuar.');
          soundFx.playCancel();
          setLoading(false);
          return;
        }
        const result = await signUp(email, password, username, gender, selectedStarterId);
        if (result.success) {
          soundFx.playVictory();
          handleClose();
        } else {
          setError(result.message || 'Error al registrarse');
          soundFx.playCancel();
        }
      } else if (mode === 'reset') {
        const result = await resetPassword(email);
        if (result.success) {
          setSuccess('Te hemos enviado un correo para restablecer tu contraseña.');
          soundFx.playSave();
        } else {
          setError(result.message || 'Error al enviar el correo');
          soundFx.playCancel();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    soundFx.playClick();

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        soundFx.playVictory();
        handleClose();
      } else {
        setError(result.message || 'Error al acceder con Google');
        soundFx.playCancel();
      }
    } finally {
      setLoading(false);
    }
  };

  const wrapperClass = standalone
    ? 'min-h-screen bg-slate-950 flex items-center justify-center p-4'
    : 'fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn';

  return (
    <div className={wrapperClass}>
      <div className="bg-slate-900 border-2 border-red-500 rounded-3xl w-full max-w-md shadow-2xl text-white overflow-hidden animate-scaleUp">
        <div className="bg-gradient-to-r from-red-600 to-rose-600 p-4 sm:p-5 flex items-center justify-between">
          <div>
            <h2 className="font-black text-lg">
              {mode === 'login' && 'Iniciar Sesión'}
              {mode === 'register' && 'Crear Cuenta'}
              {mode === 'reset' && 'Recuperar Contraseña'}
            </h2>
            <p className="text-xs text-red-100">PokeHabit • Entrenador Pokémon</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 bg-black/20 hover:bg-black/40 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {!isFirebaseReady && (
            <div className="bg-amber-950/50 border border-amber-500/40 rounded-xl p-3 text-xs text-amber-200 flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Firebase no está configurado. Añade las variables <code className="text-amber-100">VITE_FIREBASE_*</code> en tu archivo <code className="text-amber-100">.env</code>.
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-950/50 border border-red-500/40 rounded-xl p-3 text-xs text-red-200 flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-3 text-xs text-emerald-200 flex gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {success}
            </div>
          )}

          {mode !== 'reset' && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || !isFirebaseReady}
                className="w-full py-3 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-black text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-blue-600">G</span>
                Continuar con Google
              </button>
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span className="h-px flex-1 bg-slate-700" />
                <span>o usa tu correo</span>
                <span className="h-px flex-1 bg-slate-700" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nombre de usuario *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="EntrenadorRed"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
                    maxLength={25}
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Perfil * (obligatorio, no editable después)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setGender('male'); soundFx.playClick(); }}
                    className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      gender === 'male'
                        ? 'bg-blue-600 border-blue-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <User className="w-4 h-4" /> Hombre
                  </button>
                  <button
                    type="button"
                    onClick={() => { setGender('female'); soundFx.playClick(); }}
                    className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      gender === 'female'
                        ? 'bg-pink-600 border-pink-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <UserCircle className="w-4 h-4" /> Mujer
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Solo para adaptar contenido educativo de salud.</p>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Correo electrónico *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
                  required
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Contraseña *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-red-500"
                    minLength={6}
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Starter * (obligatorio)</label>
                <div className="grid grid-cols-4 gap-2">
                  {STARTERS.filter((starter) => starter.generation === 1).map((starter) => {
                    const selected = starter.pokemonId === selectedStarterId;
                    const typeInfo = POKEMON_TYPES[starter.types[0]];
                    return (
                      <button
                        key={starter.pokemonId}
                        type="button"
                        onClick={() => { setSelectedStarterId(starter.pokemonId); soundFx.playClick(); }}
                        className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                          selected
                            ? 'border-red-500 bg-red-950/40 ring-2 ring-red-500/40'
                            : 'border-slate-700 bg-slate-800 hover:border-slate-500'
                        }`}
                      >
                        <img src={starter.officialArtwork} alt={starter.name} className="w-14 h-14 mx-auto object-contain" />
                        <span className="block text-[10px] font-black text-white truncate">{starter.name}</span>
                        <span className="text-[9px] font-bold" style={{ color: typeInfo.color }}>{typeInfo.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isFirebaseReady}
              className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-transform"
            >
              {mode === 'login' && <><LogIn className="w-4 h-4" /> Entrar</>}
              {mode === 'register' && <><UserPlus className="w-4 h-4" /> Registrarse</>}
              {mode === 'reset' && <><KeyRound className="w-4 h-4" /> Enviar enlace</>}
            </button>
          </form>

          <div className="flex flex-col gap-2 text-center text-xs">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => { setMode('reset'); setError(''); setSuccess(''); }}
                  className="text-slate-400 hover:text-red-400 cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
                <p className="text-slate-500">
                  ¿No tienes cuenta?{' '}
                  {standalone ? (
                    <Link to="/register" className="text-red-400 font-bold hover:underline">Regístrate</Link>
                  ) : (
                    <button onClick={() => setMode('register')} className="text-red-400 font-bold hover:underline cursor-pointer">
                      Regístrate
                    </button>
                  )}
                </p>
              </>
            )}
            {mode === 'register' && (
              <p className="text-slate-500">
                ¿Ya tienes cuenta?{' '}
                {standalone ? (
                  <Link to="/login" className="text-red-400 font-bold hover:underline">Inicia sesión</Link>
                ) : (
                  <button onClick={() => setMode('login')} className="text-red-400 font-bold hover:underline cursor-pointer">
                    Inicia sesión
                  </button>
                )}
              </p>
            )}
            {mode === 'reset' && (
              <button
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className="text-red-400 font-bold hover:underline cursor-pointer"
              >
                Volver al inicio de sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
