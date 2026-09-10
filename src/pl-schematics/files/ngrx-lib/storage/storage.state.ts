export interface StorageState {
  token: string | null;
  language: string;
  theme: 'light' | 'dark';
}

export const initialStorageState: StorageState = {
  token: null,
  language: 'it',
  theme: 'light',
};