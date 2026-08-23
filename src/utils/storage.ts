import {
  Achievement,
  DailyHabit,
  Egg,
  ExamBoss,
  Flashcard,
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
  INITIAL_DAILY_HABITS,
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

const STORAGE_KEY = 'poke_quest_state_v4';

const isSeededContent = (id: string) =>
  /^(task_[1-7]|exam_(mate_1|fq_1)|fc_[1-8])$/.test(id);

export function loadStoredState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        trainer: { ...INITIAL_TRAINER, ...parsed.trainer },
        party: parsed.party || [],
        pcBox: parsed.pcBox || [],
        capturedPokedexIds: parsed.capturedPokedexIds || [4],
        tasks: (parsed.tasks || []).filter((item: Task) => !isSeededContent(item.id)),
        dailyHabits: parsed.dailyHabits || INITIAL_DAILY_HABITS,
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

  return {
    trainer: INITIAL_TRAINER,
    party: [],
    pcBox: [],
    capturedPokedexIds: [4],
    tasks: [],
    dailyHabits: INITIAL_DAILY_HABITS,
    subjects: INITIAL_SUBJECTS,
    examBosses: [],
    flashcards: [],
    skillStats: INITIAL_SKILL_STATS,
    sexualHealthState: INITIAL_SEXUAL_HEALTH,
    berryGarden: INITIAL_BERRY_GARDEN,
    eggs: [],
    inventory: { pokeball: 5, potion_normal: 2, rare_candy: 1, seed_oran: 3, seed_cheri: 2 },
    achievements: INITIAL_ACHIEVEMENTS,
  };
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
    return {
      trainer: { ...INITIAL_TRAINER, ...cloudState.trainer },
      party: cloudState.party || [],
      pcBox: cloudState.pcBox || [],
      capturedPokedexIds: cloudState.capturedPokedexIds || [4],
      tasks: (cloudState.tasks || []).filter((item) => !isSeededContent(item.id)),
      dailyHabits: cloudState.dailyHabits || INITIAL_DAILY_HABITS,
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
