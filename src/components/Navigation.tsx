import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  GraduationCap,
  Users,
  Footprints,
  BookOpen,
  ShoppingBag,
  Trophy,
  GitBranch,
  Heart,
  Sparkles,
  MoreHorizontal,
  X,
  User,
  LogIn,
  Menu,
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { AvatarRenderer } from './AvatarRenderer';
import { AvatarConfig } from '../types';
import { DEFAULT_AVATAR_CONFIG } from '../data/avatarAssets';

export type TabKey =
  | 'dashboard'
  | 'tasks'
  | 'study'
  | 'party'
  | 'pokemon_care'
  | 'daily'
  | 'pokedex'
  | 'shop'
  | 'achievements'
  | 'skills'
  | 'sexual_health'
  | 'profile';

interface NavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  pendingTasksCount: number;
  pendingHabitsCount: number;
  readyEvolutionsCount: number;
  hungryPokemonCount?: number;
  isAuthenticated?: boolean;
  avatarConfig?: AvatarConfig;
  avatarFallback?: string;
  onOpenAuth?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingTasksCount,
  pendingHabitsCount,
  readyEvolutionsCount,
  hungryPokemonCount = 0,
  isAuthenticated = false,
  avatarConfig,
  avatarFallback,
  onOpenAuth,
}) => {
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [showDesktopMenu, setShowDesktopMenu] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(event.target as Node)) {
        setShowDesktopMenu(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowDesktopMenu(false);
    };
    document.addEventListener('mousedown', closeMenu);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeMenu);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const tabs: {
    id: TabKey;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    highlight?: boolean;
    category?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      category: 'Principal',
    },
    {
      id: 'tasks',
      label: 'Hábitos diarios',
      icon: <CheckSquare className="w-4 h-4" />,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
      category: 'Productividad',
    },
    {
      id: 'study',
      label: 'Estudios',
      icon: <GraduationCap className="w-4 h-4" />,
      category: 'Productividad',
    },
    {
      id: 'party',
      label: 'Equipo & PC',
      icon: <Users className="w-4 h-4" />,
      badge: readyEvolutionsCount > 0 ? readyEvolutionsCount : undefined,
      category: 'Pokémon',
    },
    {
      id: 'pokemon_care',
      label: 'Cuidados & Bayas',
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
      badge: hungryPokemonCount > 0 ? hungryPokemonCount : undefined,
      category: 'Pokémon',
    },
    {
      id: 'daily',
      label: 'Daily & Pasos',
      icon: <Footprints className="w-4 h-4" />,
      badge: pendingHabitsCount > 0 ? pendingHabitsCount : undefined,
      category: 'Salud',
    },
    {
      id: 'pokedex',
      label: 'Pokédex',
      icon: <BookOpen className="w-4 h-4" />,
      category: 'Pokémon',
    },
    {
      id: 'shop',
      label: 'Tienda & Semillas',
      icon: <ShoppingBag className="w-4 h-4" />,
      category: 'Pokémon',
    },
    {
      id: 'achievements',
      label: 'Legendarios',
      icon: <Trophy className="w-4 h-4" />,
      category: 'Logros',
    },
    {
      id: 'skills',
      label: 'Skill Tree',
      icon: <GitBranch className="w-4 h-4" />,
      category: 'Progreso',
    },
    {
      id: 'sexual_health',
      label: 'Salud Sexual',
      icon: <Heart className="w-4 h-4 text-rose-400" />,
      highlight: true,
      category: 'Privado',
    },
    {
      id: 'profile',
      label: isAuthenticated ? 'Perfil' : 'Iniciar sesión',
      icon: isAuthenticated ? (
        <AvatarRenderer
          config={avatarConfig || DEFAULT_AVATAR_CONFIG}
          size="sm"
          className="rounded-md"
          showBackground={false}
          fallbackSprite={avatarFallback}
        />
      ) : (
        <LogIn className="w-4 h-4" />
      ),
      category: 'Cuenta',
    },
  ];

  const handleSelect = (tabId: TabKey) => {
    if (tabId === 'profile' && !isAuthenticated) {
      soundFx.playClick();
      onOpenAuth?.();
      return;
    }
    soundFx.playClick();
    onTabChange(tabId);
    setShowMoreModal(false);
    setShowDesktopMenu(false);
  };

  // Primary mobile tabs
  const mobilePrimaryTabs: TabKey[] = ['dashboard', 'tasks', 'study', 'party', 'pokemon_care'];
  const isMoreActive = !mobilePrimaryTabs.includes(activeTab);

  return (
    <>
      {/* Collapsible sidebar navigation */}
      <nav
        ref={desktopMenuRef}
        className={`fixed left-0 top-[53px] bottom-0 z-40 bg-slate-900 border-r border-slate-800 shadow-2xl transition-all duration-200 ${showDesktopMenu ? 'w-60' : 'w-16'}`}
      >
        <div className="p-2">
          <button
            onClick={() => {
              soundFx.playClick();
              setShowDesktopMenu((open) => !open);
            }}
            aria-expanded={showDesktopMenu}
            aria-haspopup="menu"
            aria-controls="sidebar-section-menu"
            aria-label={showDesktopMenu ? 'Cerrar menú' : 'Abrir menú'}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-700 border border-slate-600 text-white cursor-pointer hover:bg-slate-600 transition-colors"
          >
            {showDesktopMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div id="sidebar-section-menu" role="menu" className="mt-3 space-y-1 overflow-y-auto max-h-[calc(100vh-125px)]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleSelect(tab.id)}
                role="menuitem"
                title={!showDesktopMenu ? tab.label : undefined}
                className={`relative w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-xs font-bold cursor-pointer transition-colors ${
                  activeTab === tab.id ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="shrink-0">{tab.icon}</span>
                {showDesktopMenu && <span className="flex-1 truncate">{tab.label}</span>}
                {tab.badge !== undefined && (
                  <span className={`${showDesktopMenu ? '' : 'absolute top-1 right-1'} bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded-full`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Native-like Mobile Bottom Navigation Bar (Visible on mobile screens) */}
      <div className="hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/98 border-t border-slate-800 backdrop-blur-lg px-2 py-1 items-center justify-around shadow-2xl safe-area-bottom">
        {/* Dashboard */}
        <button
          onClick={() => handleSelect('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] min-h-[48px] touch-manipulation ${
            activeTab === 'dashboard'
              ? 'text-red-500 font-black'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5">Inicio</span>
        </button>

        {/* Tasks */}
        <button
          onClick={() => handleSelect('tasks')}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] min-h-[48px] touch-manipulation ${
            activeTab === 'tasks'
              ? 'text-red-500 font-black'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <CheckSquare className={`w-5 h-5 ${activeTab === 'tasks' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5">Tareas</span>
          {pendingTasksCount > 0 && (
            <span className="absolute top-1 right-2 bg-amber-400 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
              {pendingTasksCount}
            </span>
          )}
        </button>

        {/* Study */}
        <button
          onClick={() => handleSelect('study')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] min-h-[48px] touch-manipulation ${
            activeTab === 'study'
              ? 'text-red-500 font-black'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <GraduationCap className={`w-5 h-5 ${activeTab === 'study' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5">Estudio</span>
        </button>

        {/* Party */}
        <button
          onClick={() => handleSelect('party')}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] min-h-[48px] touch-manipulation ${
            activeTab === 'party'
              ? 'text-red-500 font-black'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <Users className={`w-5 h-5 ${activeTab === 'party' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5">Equipo</span>
          {readyEvolutionsCount > 0 && (
            <span className="absolute top-1 right-2 bg-emerald-400 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow animate-bounce">
              ★
            </span>
          )}
        </button>

        {/* More Menu */}
        <button
          onClick={() => {
            soundFx.playClick();
            setShowMoreModal(true);
          }}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] min-h-[48px] touch-manipulation ${
            isMoreActive
              ? 'text-red-500 font-black'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
        >
          <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5">{isMoreActive ? 'Activo' : 'Más'}</span>
          {(pendingHabitsCount > 0) && (
            <span className="absolute top-1 right-2 w-2 h-2 bg-amber-400 rounded-full" />
          )}
        </button>
      </div>

      {/* Mobile "Más Secciones" Bottom Sheet Modal */}
      {showMoreModal && (
        <div className="hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm items-end animate-fadeIn">
          <div className="bg-slate-900 border-t-2 border-red-500 rounded-t-3xl w-full p-5 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎒</span>
                <h3 className="font-black text-white text-base">Todas las Secciones</h3>
              </div>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setShowMoreModal(false);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid of Sections */}
            <div className="grid grid-cols-2 gap-2.5">
              {tabs.map((t) => {
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelect(t.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer min-h-[52px] touch-manipulation ${
                      isActive
                        ? 'bg-red-600 border-red-500 text-white shadow-lg'
                        : 'bg-slate-800/80 border-slate-700/70 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl ${
                        isActive ? 'bg-white/20' : 'bg-slate-900 text-red-400'
                      }`}
                    >
                      {t.icon}
                    </div>
                    <div className="flex-1 truncate">
                      <p className="text-xs font-black truncate">{t.label}</p>
                      <p className="text-[10px] text-slate-400 truncate">{t.category}</p>
                    </div>
                    {t.badge !== undefined && (
                      <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                        {t.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
