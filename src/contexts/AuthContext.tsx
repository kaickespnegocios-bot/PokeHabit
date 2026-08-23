import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  signIn as authSignIn,
  signInWithGoogle as authSignInWithGoogle,
  signOut as authSignOut,
  signUp as authSignUp,
  resetPassword,
  subscribeToAuthChanges,
  AuthResult,
} from '../services/auth';
import {
  createInitialUserDocument,
  loadUserData,
  mergeProfileIntoTrainer,
  updateUserProfile,
} from '../services/userService';
import { UserAccountProfile } from '../types';
import { isFirebaseConfigured } from '../services/firebase';
import { STARTERS, createStarterPartyPokemon } from '../data/starters';
import {
  AppState,
  hasLocalProgress,
  createFreshState,
  loadStoredState,
  saveStoredState,
} from '../utils/storage';

interface AuthContextValue {
  user: User | null;
  profile: UserAccountProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isFirebaseReady: boolean;
  pendingImport: boolean;
  signUp: (email: string, password: string, username: string, gender: 'male' | 'female', starterId: number) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  refreshProfile: () => Promise<void>;
  importLocalProgress: () => Promise<AppState | null>;
  startFreshOnCloud: () => Promise<void>;
  updateProfile: (updates: Partial<UserAccountProfile>) => Promise<boolean>;
  dismissImportPrompt: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserAccountProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingImport, setPendingImport] = useState(false);
  const [localSnapshotForImport, setLocalSnapshotForImport] = useState<AppState | null>(null);

  const isFirebaseReady = isFirebaseConfigured();

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const data = await loadUserData(user.uid);
    if (data?.profile) {
      setProfile(data.profile);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setProfile(null);
        setPendingImport(false);
        setLocalSnapshotForImport(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await loadUserData(firebaseUser.uid);
        const username =
          firebaseUser.displayName ||
          firebaseUser.email?.split('@')[0] ||
          'Entrenador';

        if (!data) {
          const localState = loadStoredState();
          const hasProgress = hasLocalProgress(localState);

          if (hasProgress) {
            setLocalSnapshotForImport(localState);
            setPendingImport(true);
            await createInitialUserDocument(
              firebaseUser.uid,
              firebaseUser.email || '',
              username
            );
            const newData = await loadUserData(firebaseUser.uid);
            setProfile(newData?.profile ?? null);
          } else {
            await createInitialUserDocument(
              firebaseUser.uid,
              firebaseUser.email || '',
              username,
              localState
            );
            const newData = await loadUserData(firebaseUser.uid);
            setProfile(newData?.profile ?? null);
          }
        } else {
          setProfile(data.profile);
          if (!data.gameState && hasLocalProgress(loadStoredState())) {
            setLocalSnapshotForImport(loadStoredState());
            setPendingImport(true);
          }
        }
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, username: string, gender: 'male' | 'female', starterId: number) => {
      const result = await authSignUp(email, password, username, gender);
      if (result.success && result.user) {
        const starterOption = STARTERS.find((starter) => starter.pokemonId === starterId) || STARTERS[0];
        const starter = createStarterPartyPokemon(starterOption);
        const initialState = createFreshState([starter]);
        await createInitialUserDocument(result.user.uid, email, username, gender, {
          ...initialState,
          party: [starter],
        });
      }
      return result;
    },
    []
  );

  const signIn = useCallback(async (email: string, password: string) => {
    return authSignIn(email, password);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const result = await authSignInWithGoogle();
    if (result.success && result.user) {
      const data = await loadUserData(result.user.uid);
      if (!data) {
        const username = result.user.displayName || result.user.email?.split('@')[0] || 'Entrenador';
        await createInitialUserDocument(result.user.uid, result.user.email || '', username);
      }
    }
    return result;
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
    setProfile(null);
    setPendingImport(false);
    setLocalSnapshotForImport(null);
  }, []);

  const importLocalProgress = useCallback(async (): Promise<AppState | null> => {
    if (!user || !localSnapshotForImport) return null;

    const mergedTrainer = profile
      ? { ...localSnapshotForImport.trainer, ...mergeProfileIntoTrainer(profile) }
      : localSnapshotForImport.trainer;

    const imported: AppState = {
      ...localSnapshotForImport,
      trainer: mergedTrainer,
    };

    const { saveUserData } = await import('../services/userService');
    await saveUserData(user.uid, imported);
    setPendingImport(false);
    setLocalSnapshotForImport(null);
    return imported;
  }, [user, localSnapshotForImport, profile]);

  const startFreshOnCloud = useCallback(async () => {
    if (!user) return;
    setPendingImport(false);
    setLocalSnapshotForImport(null);
  }, [user]);

  const updateProfile = useCallback(
    async (updates: Partial<UserAccountProfile>) => {
      if (!user) return false;
      const ok = await updateUserProfile(user.uid, updates);
      if (ok) {
        setProfile((prev) => (prev ? { ...prev, ...updates, updatedAt: Date.now() } : prev));
      }
      return ok;
    },
    [user]
  );

  const dismissImportPrompt = useCallback(() => {
    setPendingImport(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isAuthenticated: Boolean(user),
      isLoading,
      isFirebaseReady,
      pendingImport,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      resetPassword,
      refreshProfile,
      importLocalProgress,
      startFreshOnCloud,
      updateProfile,
      dismissImportPrompt,
    }),
    [
      user,
      profile,
      isLoading,
      isFirebaseReady,
      pendingImport,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      refreshProfile,
      importLocalProgress,
      startFreshOnCloud,
      updateProfile,
      dismissImportPrompt,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}

/** Guarda estado híbrido: localStorage siempre + Firestore si autenticado */
export function useHybridPersistence(
  state: AppState,
  isAuthenticated: boolean,
  uid: string | undefined
) {
  useEffect(() => {
    saveStoredState(state);
  }, [state]);

  useEffect(() => {
    if (!isAuthenticated || !uid) return;

    const timer = setTimeout(async () => {
      const { saveUserData } = await import('../services/userService');
      await saveUserData(uid, state);
    }, 1500);

    return () => clearTimeout(timer);
  }, [state, isAuthenticated, uid]);
}
