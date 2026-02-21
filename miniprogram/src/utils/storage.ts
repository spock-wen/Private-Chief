const TOKEN_KEY = 'spockchef_token';
const REFRESH_TOKEN_KEY = 'spockchef_refresh_token';
const USER_KEY = 'spockchef_user';

export function setToken(token: string) {
  uni.setStorageSync(TOKEN_KEY, token);
}

export function getToken(): string | null {
  try {
    return uni.getStorageSync(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function removeToken() {
  uni.removeStorageSync(TOKEN_KEY);
}

export function setRefreshToken(token: string) {
  uni.setStorageSync(REFRESH_TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  try {
    return uni.getStorageSync(REFRESH_TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function removeRefreshToken() {
  uni.removeStorageSync(REFRESH_TOKEN_KEY);
}

export function setUser(user: any) {
  uni.setStorageSync(USER_KEY, JSON.stringify(user));
}

export function getUser(): any | null {
  try {
    const userStr = uni.getStorageSync(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export function removeUser() {
  uni.removeStorageSync(USER_KEY);
}

export function clearAuth() {
  removeToken();
  removeRefreshToken();
  removeUser();
}
