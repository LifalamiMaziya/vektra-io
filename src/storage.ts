import type { AppState } from "./types";

const STORAGE_KEY = "vektra_app_state";

const defaultState: AppState = {
  currentUserEmail: null,
  users: {}
};

export function getAppState(): AppState {
  if (typeof window === "undefined") return defaultState;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load app state:", error);
  }
  return defaultState;
}

export function saveAppState(state: AppState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save app state:", error);
  }
}
