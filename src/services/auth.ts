import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from './firebase';

export type AuthErrorCode =
  | 'invalid-email'
  | 'wrong-password'
  | 'user-not-found'
  | 'email-already-in-use'
  | 'weak-password'
  | 'missing-fields'
  | 'not-configured'
  | 'network-error'
  | 'unknown';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: AuthErrorCode;
  message?: string;
}

function mapFirebaseError(code: string): AuthErrorCode {
  switch (code) {
    case 'auth/invalid-email':
      return 'invalid-email';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'wrong-password';
    case 'auth/user-not-found':
      return 'user-not-found';
    case 'auth/email-already-in-use':
      return 'email-already-in-use';
    case 'auth/weak-password':
      return 'weak-password';
    case 'auth/network-request-failed':
      return 'network-error';
    default:
      return 'unknown';
  }
}

export function getAuthErrorMessage(error: AuthErrorCode): string {
  const messages: Record<AuthErrorCode, string> = {
    'invalid-email': 'El correo electrónico no es válido.',
    'wrong-password': 'Contraseña incorrecta. Inténtalo de nuevo.',
    'user-not-found': 'No existe una cuenta con ese correo.',
    'email-already-in-use': 'Este correo ya está registrado.',
    'weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'missing-fields': 'Completa todos los campos obligatorios.',
    'not-configured': 'Firebase no está configurado. Usa modo invitado o añade las variables VITE_FIREBASE_*.',
    'network-error': 'Error de conexión. Comprueba tu internet e inténtalo de nuevo.',
    unknown: 'Ha ocurrido un error. Inténtalo de nuevo.',
  };
  return messages[error];
}

function ensureAuth() {
  if (!isFirebaseConfigured()) {
    throw new Error('not-configured');
  }
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('not-configured');
  return auth;
}

export async function signUp(
  email: string,
  password: string,
  username: string,
  gender: import('../types').ProfileGender
): Promise<AuthResult> {
  if (!email.trim() || !password.trim() || !username.trim() || !gender) {
    return { success: false, error: 'missing-fields', message: getAuthErrorMessage('missing-fields') };
  }

  try {
    const auth = ensureAuth();
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(credential.user, { displayName: username.trim() });
    return { success: true, user: credential.user };
  } catch (err: unknown) {
    const code = (err as { code?: string }).code || 'unknown';
    if (code === 'not-configured' || (err as Error).message === 'not-configured') {
      return { success: false, error: 'not-configured', message: getAuthErrorMessage('not-configured') };
    }
    const mapped = mapFirebaseError(code);
    return { success: false, error: mapped, message: getAuthErrorMessage(mapped) };
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!email.trim() || !password.trim()) {
    return { success: false, error: 'missing-fields', message: getAuthErrorMessage('missing-fields') };
  }

  try {
    const auth = ensureAuth();
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return { success: true, user: credential.user };
  } catch (err: unknown) {
    const code = (err as { code?: string }).code || 'unknown';
    if (code === 'not-configured' || (err as Error).message === 'not-configured') {
      return { success: false, error: 'not-configured', message: getAuthErrorMessage('not-configured') };
    }
    const mapped = mapFirebaseError(code);
    return { success: false, error: mapped, message: getAuthErrorMessage(mapped) };
  }
}

export async function signOut(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) {
    await firebaseSignOut(auth);
  }
}

export function getCurrentUser(): User | null {
  return getFirebaseAuth()?.currentUser ?? null;
}

export async function resetPassword(email: string): Promise<AuthResult> {
  if (!email.trim()) {
    return { success: false, error: 'missing-fields', message: getAuthErrorMessage('missing-fields') };
  }

  try {
    const auth = ensureAuth();
    await sendPasswordResetEmail(auth, email.trim());
    return { success: true };
  } catch (err: unknown) {
    const code = (err as { code?: string }).code || 'unknown';
    const mapped = mapFirebaseError(code);
    return { success: false, error: mapped, message: getAuthErrorMessage(mapped) };
  }
}

export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
