const GOOGLE_FIT_SCOPE = 'https://www.googleapis.com/auth/fitness.activity.read';
const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client';

type GoogleTokenClient = {
  requestAccessToken: (options?: { prompt?: string }) => void;
};

type GoogleIdentity = {
  accounts: {
    oauth2: {
      initTokenClient: (options: {
        client_id: string;
        scope: string;
        callback: (response: { access_token?: string; error?: string }) => void;
      }) => GoogleTokenClient;
    };
  };
};

let scriptPromise: Promise<void> | null = null;
let tokenClient: GoogleTokenClient | null = null;
let accessToken = '';

function loadGoogleIdentityScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GOOGLE_IDENTITY_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar Google Identity Services.')));
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_IDENTITY_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services.'));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export async function connectGoogleFit(): Promise<void> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (!clientId) {
    throw new Error('Configura VITE_GOOGLE_CLIENT_ID para vincular Google Fit.');
  }

  await loadGoogleIdentityScript();
  const googleIdentity = (window as Window & { google?: GoogleIdentity }).google;
  if (!googleIdentity) throw new Error('Google Identity Services no está disponible.');

  await new Promise<void>((resolve, reject) => {
    tokenClient = googleIdentity.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_FIT_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error('No se pudo autorizar el acceso a Google Fit.'));
          return;
        }
        accessToken = response.access_token;
        resolve();
      },
    });
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

export async function readTodaySteps(): Promise<number> {
  if (!accessToken) await connectGoogleFit();

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      aggregateBy: [{ dataTypeName: 'com.google.step_count.delta' }],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis: start,
      endTimeMillis: Date.now(),
    }),
  });

  if (!response.ok) {
    accessToken = '';
    throw new Error('Google Fit no pudo devolver los pasos de hoy.');
  }

  const data = (await response.json()) as {
    bucket?: Array<{ dataset?: Array<{ point?: Array<{ value?: Array<{ intVal?: number }> }> }> }>;
  };
  return (data.bucket || []).reduce(
    (total, bucket) => total + (bucket.dataset || []).flatMap((dataset) => dataset.point || [])
      .reduce((subtotal, point) => subtotal + (point.value?.[0]?.intVal || 0), 0),
    0
  );
}
