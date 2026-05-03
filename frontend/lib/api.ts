function getApiBase(): string {
  // Explicit browser detection — window.location only exists in a real browser.
  // Next.js SSR/SSG will not have window.location, so this safely falls back
  // to the server URL for any server-side code.
  try {
    if (
      typeof window !== 'undefined' &&
      typeof window.location !== 'undefined' &&
      window.location.href
    ) {
      return '/api';  // proxied through Next.js rewrites (same-origin, no CORS)
    }
  } catch {
    // Server-side
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}

function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Request failed');
  }

  return res.json();
}

export async function apiUpload(path: string, formData: FormData) {
  const token = getToken();
  const url = `${getApiBase()}${path}`;

  console.log('[apiUpload] URL:', url);

  const headers = new Headers();
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    console.log('[apiUpload] Response status:', res.status);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      console.error('[apiUpload] Error response:', err);
      throw new Error(err.detail || 'Upload failed');
    }

    return res.json();
  } catch (error: any) {
    console.error('[apiUpload] Fetch error:', error);
    if (error.message === 'Failed to fetch') {
      throw new Error('Network error: unable to reach the server. Please try again.');
    }
    throw error;
  }
}
