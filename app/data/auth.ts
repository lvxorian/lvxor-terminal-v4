const AUTH_KEY = 'lvxor_auth';

export function login(username: string, password: string): boolean {
  if (username === 'admin' && password === 'lvxor') {
    sessionStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
}

export function logout(): void {
  sessionStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}
