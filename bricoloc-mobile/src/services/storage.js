import { Platform } from 'react-native';

let SecureStore = null;
if (Platform.OS !== 'web') {
  try {
    SecureStore = require('expo-secure-store');
  } catch {
    SecureStore = null;
  }
}

const webStorage = {
  getItem: async (key) => localStorage.getItem(key),
  setItem: async (key, value) => localStorage.setItem(key, value),
  removeItem: async (key) => localStorage.removeItem(key),
};

const nativeStorage = {
  getItem: async (key) => {
    try { return await SecureStore.getItemAsync(key); } catch { return null; }
  },
  setItem: async (key, value) => {
    try { await SecureStore.setItemAsync(key, value); } catch {}
  },
  removeItem: async (key) => {
    try { await SecureStore.deleteItemAsync(key); } catch {}
  },
};

const store = Platform.OS === 'web' ? webStorage : nativeStorage;

const Storage = {
  getItem: (key) => store.getItem(key),
  setItem: (key, value) => store.setItem(key, value),
  removeItem: (key) => store.removeItem(key),
  clear: async () => {
    await store.removeItem('auth_token');
    await store.removeItem('user_data');
    await store.removeItem('app_language');
  },
};

export default Storage;
