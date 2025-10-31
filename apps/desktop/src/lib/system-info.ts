import { writable } from 'svelte/store';

export interface SystemInfo {
  offlineMode: boolean;
}

export const systemInfo = writable<SystemInfo>({ offlineMode: true });