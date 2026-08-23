import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  UserAccountProfile,
  AvatarConfig,
  PublicProfileData,
  PrivacySettings,
  ProfileGender,
  DEFAULT_PRIVACY_SETTINGS,
} from '../types';
import { AppState } from '../utils/storage';
import { DEFAULT_AVATAR_CONFIG } from '../data/avatarAssets';
import { getFirebaseDb, isFirebaseConfigured } from './firebase';

const USERS_COLLECTION = 'users';
const PUBLIC_PROFILES_COLLECTION = 'publicProfiles';
const USERNAMES_COLLECTION = 'usernames';

export interface UserDocument {
  profile: UserAccountProfile;
  gameState?: AppState;
  updatedAt?: unknown;
}

function userDocRef(uid: string) {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not configured');
  return doc(db, USERS_COLLECTION, uid);
}

function publicProfileRef(username: string) {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not configured');
  return doc(db, PUBLIC_PROFILES_COLLECTION, username.toLowerCase());
}

function usernameRef(username: string) {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not configured');
  return doc(db, USERNAMES_COLLECTION, username.toLowerCase());
}

/** Migra perfiles antiguos con valores seguros por defecto */
export function migrateUserProfile(profile: UserAccountProfile): UserAccountProfile {
  const privacySettings: PrivacySettings = {
    ...DEFAULT_PRIVACY_SETTINGS,
    ...(profile.privacySettings || {}),
  };
  // Forzar salud privada si no estaba definida explícitamente como true
  if (profile.privacySettings?.healthStats !== true) {
    privacySettings.healthStats = false;
  }

  return {
    ...profile,
    profileVisibility: profile.profileVisibility ?? 'private',
    privacySettings,
    healthStatsVisibility: profile.healthStatsVisibility === true ? true : false,
  };
}

export function needsGenderMigration(profile: UserAccountProfile | null | undefined): boolean {
  return Boolean(profile && !profile.gender);
}

export function createDefaultProfile(
  uid: string,
  email: string,
  username: string,
  gender: ProfileGender
): UserAccountProfile {
  const now = Date.now();
  return {
    uid,
    email,
    username,
    trainerName: username,
    gender,
    bio: '',
    avatarConfig: {
      ...DEFAULT_AVATAR_CONFIG,
      base: gender === 'female' ? 'trainer-f' : 'classic',
    },
    themeColor: '#ef4444',
    profileVisibility: 'private',
    privacySettings: { ...DEFAULT_PRIVACY_SETTINGS },
    healthStatsVisibility: false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Construye manualmente el objeto público — NUNCA devolver el perfil completo.
 */
export function buildPublicProfile(
  profile: UserAccountProfile,
  gameState?: AppState
): PublicProfileData | null {
  if (profile.profileVisibility !== 'public') return null;

  const ps = profile.privacySettings;
  const publicData: PublicProfileData = { username: profile.username };

  if (ps.profile) {
    publicData.trainerName = profile.trainerName;
    publicData.avatarConfig = profile.avatarConfig;
    if (profile.bio) publicData.bio = profile.bio;
    if (profile.themeColor) publicData.themeColor = profile.themeColor;
  }

  if (gameState) {
    if (ps.level) publicData.level = gameState.trainer.level;
    if (ps.pokemonTeam && gameState.party.length > 0) {
      publicData.pokemonTeam = gameState.party.map((p) => ({
        name: p.name,
        nickname: p.nickname,
        sprite: p.sprite,
        level: p.level,
      }));
    }
    if (ps.pokedex) publicData.pokedexCount = gameState.capturedPokedexIds.length;
    if (ps.achievements) {
      publicData.achievementsUnlocked = gameState.achievements.filter((a) => a.unlocked).length;
    }
    if (ps.streak) publicData.streak = gameState.trainer.dailyStreak;
    if (ps.tasksCompleted) publicData.tasksCompleted = gameState.trainer.totalTasksCompleted;
    if (ps.steps) publicData.steps = gameState.trainer.stepsToday;
    if (ps.studyStats) {
      publicData.studyStats = {
        pomodorosDone: gameState.trainer.totalPomodorosDone,
        subjectsCount: gameState.subjects.length,
      };
    }
    // Solo métricas educativas agregadas de salud — nunca logs ni datos médicos
    if (ps.healthStats && profile.healthStatsVisibility) {
      publicData.healthStats = {
        educationalLevel: gameState.skillStats?.sexualHealth?.level ?? 0,
        educationalXp: gameState.skillStats?.sexualHealth?.xp ?? 0,
      };
    }
    if (ps.bodyMeasurement && profile.gender === 'male') {
      const measurement = gameState.sexualHealthState?.lastMeasurementCm;
      if (typeof measurement === 'number' && measurement > 0) {
        publicData.bodyMeasurementCm = measurement;
      }
    }
  }

  return publicData;
}

/** Alias solicitado en requisitos */
export function getPublicProfileData(
  profile: UserAccountProfile,
  gameState?: AppState
): PublicProfileData | null {
  return buildPublicProfile(profile, gameState);
}

export async function syncPublicProfileDocument(
  uid: string,
  profile: UserAccountProfile,
  gameState?: AppState
): Promise<void> {
  if (!isFirebaseConfigured()) return;

  const usernameKey = profile.username.toLowerCase();

  try {
    if (profile.profileVisibility === 'public') {
      const publicData = buildPublicProfile(profile, gameState);
      if (publicData) {
        await setDoc(publicProfileRef(profile.username), {
          uid,
          ...publicData,
          updatedAt: serverTimestamp(),
        });
      }
    } else {
      await deleteDoc(publicProfileRef(profile.username)).catch(() => {});
    }

    await setDoc(usernameRef(profile.username), {
      uid,
      username: profile.username,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Error syncing public profile', err);
  }
}

export async function getPublicProfile(username: string): Promise<{
  data: PublicProfileData | null;
  isPrivate: boolean;
  notFound: boolean;
}> {
  if (!isFirebaseConfigured()) {
    return { data: null, isPrivate: false, notFound: true };
  }

  try {
    const snap = await getDoc(publicProfileRef(username));
    if (!snap.exists()) {
      const userSnap = await getDoc(usernameRef(username));
      if (userSnap.exists()) {
        return { data: null, isPrivate: true, notFound: false };
      }
      return { data: null, isPrivate: false, notFound: true };
    }
    const raw = snap.data();
    const { uid: _uid, updatedAt: _updatedAt, ...publicFields } = raw;
    return { data: publicFields as PublicProfileData, isPrivate: false, notFound: false };
  } catch (err) {
    console.error('Error fetching public profile', err);
    return { data: null, isPrivate: false, notFound: true };
  }
}

export async function loadUserData(uid: string): Promise<UserDocument | null> {
  if (!isFirebaseConfigured()) return null;

  try {
    const snap = await getDoc(userDocRef(uid));
    if (!snap.exists()) return null;
    const data = snap.data() as UserDocument;
    if (data.profile) {
      data.profile = migrateUserProfile(data.profile);
    }
    return data;
  } catch (err) {
    console.error('Error loading user data from Firestore', err);
    return null;
  }
}

export async function saveUserData(uid: string, gameState: AppState): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;

  try {
    const existing = await loadUserData(uid);
    await setDoc(
      userDocRef(uid),
      {
        gameState,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    if (existing?.profile) {
      await syncPublicProfileDocument(uid, existing.profile, gameState);
    }
    return true;
  } catch (err) {
    console.error('Error saving game state to Firestore', err);
    return false;
  }
}

export async function updateUserProfile(
  uid: string,
  profileUpdates: Partial<UserAccountProfile>
): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;

  // Nunca permitir cambiar gender desde actualizaciones normales
  const { gender: _gender, ...safeUpdates } = profileUpdates;

  try {
    const existing = await loadUserData(uid);
    const baseProfile = existing?.profile ?? createDefaultProfile(uid, '', 'Entrenador', 'male');

    const merged: UserAccountProfile = migrateUserProfile({
      ...baseProfile,
      ...safeUpdates,
      uid,
      gender: baseProfile.gender,
      updatedAt: Date.now(),
    });

    await setDoc(
      userDocRef(uid),
      {
        profile: merged,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    try {
      await setDoc(usernameRef(merged.username), {
        uid,
        username: merged.username,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Could not update username index', err);
    }

    try {
      await syncPublicProfileDocument(uid, merged, existing?.gameState);
    } catch (err) {
      console.warn('Could not sync public profile', err);
    }
    return true;
  } catch (err) {
    console.error('Error updating user profile', err);
    return false;
  }
}

export async function setUserGender(uid: string, gender: ProfileGender): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;

  try {
    const existing = await loadUserData(uid);
    if (!existing?.profile) return false;
    if (existing.profile.gender) return false;

    const updated: UserAccountProfile = {
      ...existing.profile,
      gender,
      updatedAt: Date.now(),
    };

    await setDoc(
      userDocRef(uid),
      { profile: updated, updatedAt: serverTimestamp() },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('Error setting user gender', err);
    return false;
  }
}

export async function updatePrivacySettings(
  uid: string,
  settings: Partial<PrivacySettings> & {
    profileVisibility?: UserAccountProfile['profileVisibility'];
    healthStatsVisibility?: boolean;
  }
): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;

  try {
    const existing = await loadUserData(uid);
    if (!existing?.profile) return false;

    const { profileVisibility, healthStatsVisibility, ...privacyPartial } = settings;

    const newPrivacy: PrivacySettings = {
      ...existing.profile.privacySettings,
      ...privacyPartial,
    };

    const updated: UserAccountProfile = migrateUserProfile({
      ...existing.profile,
      profileVisibility: profileVisibility ?? existing.profile.profileVisibility,
      privacySettings: newPrivacy,
      healthStatsVisibility:
        healthStatsVisibility !== undefined
          ? healthStatsVisibility
          : newPrivacy.healthStats,
      updatedAt: Date.now(),
    });

    await setDoc(
      userDocRef(uid),
      { profile: updated, updatedAt: serverTimestamp() },
      { merge: true }
    );

    await syncPublicProfileDocument(uid, updated, existing.gameState);
    return true;
  } catch (err) {
    console.error('Error updating privacy settings', err);
    return false;
  }
}

export async function createInitialUserDocument(
  uid: string,
  email: string,
  username: string,
  gender?: ProfileGender,
  gameState?: AppState
): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;

  try {
    const profile = gender
      ? createDefaultProfile(uid, email, username, gender)
      : migrateUserProfile({
          uid,
          email,
          username,
          trainerName: username,
          bio: '',
          avatarConfig: { ...DEFAULT_AVATAR_CONFIG },
          themeColor: '#ef4444',
          profileVisibility: 'private',
          privacySettings: { ...DEFAULT_PRIVACY_SETTINGS },
          healthStatsVisibility: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

    await setDoc(userDocRef(uid), {
      profile,
      gameState: gameState ?? null,
      updatedAt: serverTimestamp(),
    });

    await setDoc(usernameRef(username), { uid, username, updatedAt: serverTimestamp() });
    if (profile.profileVisibility === 'public') {
      await syncPublicProfileDocument(uid, profile, gameState);
    }
    return true;
  } catch (err) {
    console.error('Error creating user document', err);
    return false;
  }
}

export function mergeProfileIntoTrainer(
  profile: UserAccountProfile
): Partial<import('../types').TrainerProfile> {
  return {
    name: profile.trainerName,
    email: profile.email,
    themeColor: profile.themeColor,
    avatarConfig: profile.avatarConfig,
    username: profile.username,
    bio: profile.bio,
  };
}

export type { AvatarConfig };
