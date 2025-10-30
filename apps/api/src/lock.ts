import { nanoid } from 'nanoid';
import { store } from './runtime/store';

export class Lock {
  #id: string;

  #lockKey: string;

  #acquired = false;
  #timer?: NodeJS.Timeout;
  #controller: AbortController;

  constructor(key: string) {
    this.#id = nanoid();

    this.#lockKey = `lock:${key}`;

    this.#controller = new AbortController();
  }

  get signal(): AbortSignal {
    return this.#controller.signal;
  }

  async acquire() {
    const deadline = Date.now() + 30_000;

    while (Date.now() < deadline) {
      const currentValue = store.get(this.#lockKey);
      if (currentValue === null) {
        store.set(this.#lockKey, this.#id, { ex: 30 });
        this.#acquired = true;
        this.#start();
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return false;
  }

  async tryAcquire() {
    const currentValue = store.get(this.#lockKey);
    if (currentValue === null) {
      store.set(this.#lockKey, this.#id, { ex: 30 });
      this.#acquired = true;
      this.#start();
      return true;
    }
    return false;
  }

  async release() {
    if (!this.#acquired) return false;

    this.#stop();
    this.#controller.abort();

    const currentValue = store.get(this.#lockKey);
    if (currentValue === this.#id) {
      store.del(this.#lockKey);
      this.#acquired = false;
      return true;
    }

    return false;
  }

  #start() {
    if (!this.#acquired) return;

    this.#timer = setInterval(() => {
      try {
        const renewed = this.#extend();
        if (!renewed) {
          this.#stop();
          this.#acquired = false;
          this.#controller.abort();
        }
      } catch {
        this.#stop();
        this.#acquired = false;
        this.#controller.abort();
      }
    }, 10_000);

    this.#timer.unref();
  }

  #stop() {
    if (this.#timer) {
      clearInterval(this.#timer);
      this.#timer = undefined;
    }
  }

  #extend() {
    if (!this.#acquired) return false;

    const currentValue = store.get(this.#lockKey);
    if (currentValue === this.#id) {
      store.set(this.#lockKey, this.#id, { ex: 30 });
      return true;
    }

    return false;
  }
}

export const withLock = async <T>(key: string, fn: (signal: AbortSignal) => Promise<T>) => {
  const lock = new Lock(key);

  const acquired = await lock.acquire();
  if (!acquired) {
    throw new Error(`Failed to acquire lock for key: ${key}`);
  }

  try {
    return await fn(lock.signal);
  } finally {
    await lock.release();
  }
};
