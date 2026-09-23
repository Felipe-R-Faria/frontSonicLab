/**
 * Authentication Service
 * Communicates with backend API at http://localhost:8080
 */

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  name?: string;
  email?: string;
  token?: string;
  message?: string;
  [key: string]: unknown;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  name?: string;
  email?: string;
  role?: string;
  user?: {
    name?: string;
    email?: string;
    role?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export const BACKEND_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_BACKEND_URL) ||
  'http://localhost:8080';

export const REGISTER_ENDPOINT = `${BACKEND_BASE_URL}/auth/register`;
export const LOGIN_ENDPOINT = `${BACKEND_BASE_URL}/auth/login`;

export const TOKEN_STORAGE_KEY = 'sonic_lab_token';

/**
 * Internal helper to send POST requests with automatic CORS/proxy fallback
 */
async function postJsonWithFallback(endpoint: string, fallbackPath: string, bodyObj: unknown): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  const body = JSON.stringify(bodyObj);

  try {
    return await fetch(endpoint, {
      method: 'POST',
      headers,
      body,
    });
  } catch (directErr) {
    if (fallbackPath) {
      try {
        return await fetch(fallbackPath, {
          method: 'POST',
          headers,
          body,
        });
      } catch {
        throw directErr;
      }
    }
    throw directErr;
  }
}

/**
 * Sends a POST request to http://localhost:8080/auth/register with { name, email, password }
 */
export async function apiRegister(payload: RegisterPayload): Promise<RegisterResponse> {
  const requestBody = {
    name: payload.name.trim(),
    email: payload.email.trim(),
    password: payload.password,
  };

  try {
    const response = await postJsonWithFallback(
      REGISTER_ENDPOINT,
      '/auth/register',
      requestBody
    );

    const responseText = await response.text();
    let data: Record<string, unknown> = {};
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { message: responseText };
    }

    if (!response.ok) {
      const errorMsg =
        (typeof data.message === 'string' && data.message) ||
        (typeof data.error === 'string' && data.error) ||
        `Falha no registro (${response.status}: ${response.statusText})`;
      throw new Error(errorMsg);
    }

    return data as RegisterResponse;
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) {
      throw new Error(
        'Não foi possível conectar ao backend em http://localhost:8080/auth/register. Certifique-se de que sua API está ativa e rodando na porta 8080.'
      );
    }
    throw err;
  }
}

/**
 * Sends a POST request to http://localhost:8080/auth/login with { email, password }
 * Returns the token and caches it in localStorage.
 */
export async function apiLogin(payload: LoginPayload): Promise<LoginResponse> {
  const requestBody = {
    email: payload.email.trim(),
    password: payload.password,
  };

  try {
    const response = await postJsonWithFallback(
      LOGIN_ENDPOINT,
      '/auth/login',
      requestBody
    );

    const responseText = await response.text();
    let data: Record<string, unknown> = {};
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { message: responseText };
    }

    if (!response.ok) {
      const errorMsg =
        (typeof data.message === 'string' && data.message) ||
        (typeof data.error === 'string' && data.error) ||
        `Falha na autenticação (${response.status}: ${response.statusText})`;
      throw new Error(errorMsg);
    }

    // Extract token in any format: { token: "..." }, { accessToken: "..." }, etc.
    const token =
      (typeof data.token === 'string' && data.token) ||
      (typeof data.accessToken === 'string' && data.accessToken) ||
      (typeof data.access_token === 'string' && data.access_token) ||
      (typeof data.jwt === 'string' && data.jwt) ||
      (typeof data === 'string' ? data : '');

    if (token) {
      setAuthToken(token);
    }

    return {
      token: token || '',
      ...data,
    } as LoginResponse;
  } catch (err: unknown) {
    if (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) {
      throw new Error(
        'Não foi possível conectar ao backend em http://localhost:8080/auth/login. Certifique-se de que sua API está ativa e rodando na porta 8080.'
      );
    }
    throw err;
  }
}

/**
 * Retrieve current cached token from localStorage
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Store token in localStorage
 */
export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // Ignore storage issues in sandboxed environments
  }
}

/**
 * Remove token from localStorage
 */
export function clearAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Ignore
  }
}
