export interface AppState {
  initialized: boolean;
  loading: boolean;
  error: string | null;
}

export const initialAppState: AppState = {
  initialized: false,
  loading: false,
  error: null,
};