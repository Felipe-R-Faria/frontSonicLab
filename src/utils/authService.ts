/**
 * Authentication Service
 * Handles background POST requests to registration and login endpoints.
 */

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  role?: string;
}

export interface RegisterResponse {
  name: string;
  email: string;
  [key: string]: unknown;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  [key: string]: unknown;
}

export const REGISTER_ENDPOINT =
  'https://df5d80cc-a16e-45fd-bd4f-77e15b37d19c.mock.pstmn.io/auth/register';

export const LOGIN_ENDPOINT =
  'https://df5d80cc-a16e-45fd-bd4f-77e15b37d19c.mock.pstmn.io/auth/login';

export const TOKEN_STORAGE_KEY = 'sonic_lab_token';

/**
 * Sends a background POST request to the register endpoint.
 * Returns: { name, email }
 */
export async function apiRegister(payload: RegisterPayload): Promise<RegisterResponse> {
  const response = await fetch(REGISTER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Falha no registro (${response.status}: ${response.statusText})`);
  }

  const data: RegisterResponse = await response.json();
  return data;
}

/**
 * Sends a background POST request to the login endpoint.
 * Returns: { token }
 * Automatically caches token in localStorage.
 */
export async function apiLogin(payload: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(LOGIN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Falha na autenticação (${response.status}: ${response.statusText})`);
  }

  const data: LoginResponse = await response.json();
  if (data?.token) {
    setAuthToken(data.token);
  }
  return data;
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
