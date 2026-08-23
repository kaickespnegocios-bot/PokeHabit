import {
  Achievement,
  DailyHabit,
  Egg,
  ExamBoss,
  Flashcard,
  PartyPokemon,
  PokedexEntry,
  ShopItem,
  SkillStats,
  Subject3ESO,
  Task,
  TrainerProfile,
  SexualHealthState,
  BerryGardenState,
} from '../types';
import {
  INITIAL_ACHIEVEMENTS,
  INITIAL_SHOP_ITEMS,
  INITIAL_SKILL_STATS,
  INITIAL_SUBJECTS,
  INITIAL_TRAINER,
  INITIAL_SEXUAL_HEALTH,
  INITIAL_BERRY_GARDEN,
} from '../data/initialData';
import { POKEDEX_DATABASE } from './pokeApi';

export interface AppState {
  trainer: TrainerProfile;
  party: PartyPokemon[];
  pcBox: PartyPokemon[];
  capturedPokedexIds: number[];
  tasks: Task[];
  dailyHabits: DailyHabit[];
  subjects: Subject3ESO[];
  examBosses: ExamBoss[];
  flashcards: Flashcard[];
  skillStats: SkillStats;
  sexualHealthState: SexualHealthState;
  berryGarden: BerryGardenState;
  eggs: Egg[];
  inventory: { [itemId: string]: number };
  achievements: Achievement[];
}

const STORAGE_KEY = 'poke_quest_state_v5';

const isSeededContent = (id: string) =>
  /^(task_[1-7]|exam_(mate_1|fq_1)|fc_[1-8])$/.test(id);

export function createFreshState(party: PartyPokemon[] = []): AppState {
  return {
    trainer: {
      ...INITIAL_TRAINER,
      gold: 0,
      dailyStreak: 0,
      bestStreak: 0,
      stepsToday: 0,
      totalStepsAllTime: 0,
      totalTasksCompleted: 0,
      totalPomodorosDone: 0,
      starterChosen: party.length > 0,
      lastDailyBonusDate: '',
    },
    party,
    pcBox: [],
    capturedPokedexIds: party.map((pokemon) => pokemon.pokemonId),
    tasks: [],
    dailyHabits: [],
    subjects: INITIAL_SUBJECTS.map((subject) => ({
      ...subject,
      currentGrade: 0,
      trimester1: 0,
      trimester2: 0,
      trimester3: 0,
      finalGrade: 0,
    })),
    examBosses: [],
    flashcards: [],
    skillStats: Object.fromEntries(
      Object.entries(INITIAL_SKILL_STATS).map(([key, stat]) => [key, { ...stat, xp: 0 }])
    ) as SkillStats,
    sexualHealthState: {
      ...INITIAL_SEXUAL_HEALTH,
      logs: [],
      gallery: [],
      lastMeasurementCm: undefined,
      totalMasturbationCount: 0,
    },
    berryGarden: {
      plots: INITIAL_BERRY_GARDEN.plots.map((plot) => ({ id: plot.id, state: 'empty', isWatered: false })),
      inventory: {},
    },
    eggs: [],
    inventory: {},
    achievements: INITIAL_ACHIEVEMENTS.map((achievement) => ({
      ...achievement,
      currentCount: 0,
      unlocked: false,
    })),
  };
}

export function loadStoredState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const party = parsed.party || [];
      return {
        trainer: { ...INITIAL_TRAINER, ...parsed.trainer },
        party,
        pcBox: parsed.pcBox || [],
        capturedPokedexIds: [...new Set([...(parsed.capturedPokedexIds || []), ...party.map((pokemon: PartyPokemon) => pokemon.pokemonId)])],
        tasks: (parsed.tasks || []).filter((item: Task) => !isSeededContent(item.id)),
        dailyHabits: [],
        subjects: parsed.subjects || INITIAL_SUBJECTS,
        examBosses: (parsed.examBosses || []).filter((item: ExamBoss) => !isSeededContent(item.id)),
        flashcards: (parsed.flashcards || []).filter((item: Flashcard) => !isSeededContent(item.id)),
        skillStats: { ...INITIAL_SKILL_STATS, ...(parsed.skillStats || {}) },
        sexualHealthState: { ...INITIAL_SEXUAL_HEALTH, ...(parsed.sexualHealthState || {}) },
        berryGarden: { ...INITIAL_BERRY_GARDEN, ...(parsed.berryGarden || {}) },
        eggs: parsed.eggs || [],
        inventory: parsed.inventory || { pokeball: 5, potion_normal: 2, rare_candy: 1, seed_oran: 3, seed_cheri: 2 },
        achievements: parsed.achievements || INITIAL_ACHIEVEMENTS,
      };
    }
  } catch (e) {
    console.error('Error loading stored PokéQuest state', e);
  }

  return createFreshState();
}

export function saveStoredState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save state to localStorage', e);
  }
}

export function resetToInitialState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear state from localStorage', e);
  }
}

/** Detecta si hay progreso local significativo (más allá del estado inicial) */
export function hasLocalProgress(state: AppState): boolean {
  return (
    state.party.length > 0 ||
    state.pcBox.length > 0 ||
    state.tasks.some((t) => t.completed) ||
    state.trainer.level > 1 ||
    state.trainer.gold > 200 ||
    state.trainer.totalTasksCompleted > 0 ||
    state.capturedPokedexIds.length > 1
  );
}

export function loadStateForUser(cloudState: AppState | null | undefined): AppState {
  if (cloudState) {
    const party = cloudState.party || [];
    return {
      trainer: { ...INITIAL_TRAINER, ...cloudState.trainer },
      party,
      pcBox: cloudState.pcBox || [],
      capturedPokedexIds: [...new Set([...(cloudState.capturedPokedexIds || []), ...party.map((pokemon) => pokemon.pokemonId)])],
      tasks: (cloudState.tasks || []).filter((item) => !isSeededContent(item.id)),
      dailyHabits: [],
      subjects: cloudState.subjects || INITIAL_SUBJECTS,
      examBosses: (cloudState.examBosses || []).filter((item) => !isSeededContent(item.id)),
      flashcards: (cloudState.flashcards || []).filter((item) => !isSeededContent(item.id)),
      skillStats: { ...INITIAL_SKILL_STATS, ...(cloudState.skillStats || {}) },
      sexualHealthState: { ...INITIAL_SEXUAL_HEALTH, ...(cloudState.sexualHealthState || {}) },
      berryGarden: { ...INITIAL_BERRY_GARDEN, ...(cloudState.berryGarden || {}) },
      eggs: cloudState.eggs || [],
      inventory: cloudState.inventory || { pokeball: 5, potion_normal: 2, rare_candy: 1, seed_oran: 3, seed_cheri: 2 },
      achievements: cloudState.achievements || INITIAL_ACHIEVEMENTS,
    };
  }
  return loadStoredState();
}
