import { nanoid } from 'nanoid';

type StoreEntry = {
  value: string;
  expiresAt?: number;
};

type ListEntry = string[];

type DedupeEntry = {
  expiresAt?: number;
};

class LocalStore {
  #store = new Map<string, StoreEntry>();
  #lists = new Map<string, ListEntry>();
  #dedupe = new Map<string, DedupeEntry>();
  #cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.#cleanupInterval = setInterval(() => this.#cleanup(), 60_000);
    this.#cleanupInterval.unref();
  }

  #cleanup() {
    const now = Date.now();
    
    for (const [key, entry] of this.#store.entries()) {
      if (entry.expiresAt && entry.expiresAt <= now) {
        this.#store.delete(key);
      }
    }

    for (const [key, entry] of this.#dedupe.entries()) {
      if (entry.expiresAt && entry.expiresAt <= now) {
        this.#dedupe.delete(key);
      }
    }
  }

  get(key: string): string | null {
    const entry = this.#store.get(key);
    if (!entry) return null;
    
    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      this.#store.delete(key);
      return null;
    }
    
    return entry.value;
  }

  set(key: string, value: string, options?: { ex?: number }): void {
    const expiresAt = options?.ex ? Date.now() + options.ex * 1000 : undefined;
    this.#store.set(key, { value, expiresAt });
  }

  setex(key: string, seconds: number, value: string): void {
    this.set(key, value, { ex: seconds });
  }

  del(key: string): void {
    this.#store.delete(key);
  }

  getdel(key: string): string | null {
    const value = this.get(key);
    if (value !== null) {
      this.#store.delete(key);
    }
    return value;
  }

  lpush(key: string, ...values: string[]): void {
    const list = this.#lists.get(key) || [];
    list.unshift(...values);
    this.#lists.set(key, list);
  }

  rpush(key: string, ...values: string[]): void {
    const list = this.#lists.get(key) || [];
    list.push(...values);
    this.#lists.set(key, list);
  }

  lpop(key: string, count?: number): string[] | null {
    const list = this.#lists.get(key);
    if (!list || list.length === 0) return null;
    
    const actualCount = count ?? 1;
    const items = list.splice(0, actualCount);
    
    if (list.length === 0) {
      this.#lists.delete(key);
    }
    
    return items;
  }

  rpop(key: string, count?: number): string[] | null {
    const list = this.#lists.get(key);
    if (!list || list.length === 0) return null;
    
    const actualCount = count ?? 1;
    const items = list.splice(-actualCount);
    
    if (list.length === 0) {
      this.#lists.delete(key);
    }
    
    return items;
  }

  blpop(key: string, timeout: number): Promise<string[] | null> {
    return Promise.resolve(this.lpop(key, 1));
  }

  llen(key: string): number {
    const list = this.#lists.get(key);
    return list ? list.length : 0;
  }

  keys(pattern: string): string[] {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const keys: string[] = [];
    
    for (const key of this.#store.keys()) {
      if (regex.test(key)) {
        keys.push(key);
      }
    }
    
    for (const key of this.#lists.keys()) {
      if (regex.test(key)) {
        keys.push(key);
      }
    }
    
    return keys;
  }

  checkDedupe(key: string): boolean {
    const entry = this.#dedupe.get(key);
    if (!entry) return false;
    
    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      this.#dedupe.delete(key);
      return false;
    }
    
    return true;
  }

  setDedupe(key: string, ttl?: number): void {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : undefined;
    this.#dedupe.set(key, { expiresAt });
  }

  close(): void {
    clearInterval(this.#cleanupInterval);
    this.#store.clear();
    this.#lists.clear();
    this.#dedupe.clear();
  }
}

export const store = new LocalStore();
