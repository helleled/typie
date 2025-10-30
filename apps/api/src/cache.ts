import { store } from './runtime/store';

export const redis = {
  get: (key: string) => Promise.resolve(store.get(key)),
  set: (key: string, value: string, ex?: 'EX', ttl?: number, nx?: 'NX') => {
    if (nx === 'NX' && store.get(key) !== null) {
      return Promise.resolve(null);
    }
    if (ex === 'EX' && ttl) {
      store.set(key, value, { ex: ttl });
    } else {
      store.set(key, value);
    }
    return Promise.resolve(nx === 'NX' ? 'OK' : null);
  },
  setex: (key: string, seconds: number, value: string) => {
    store.setex(key, seconds, value);
    return Promise.resolve('OK');
  },
  del: (...keys: string[]) => {
    for (const key of keys) {
      store.del(key);
    }
    return Promise.resolve(keys.length);
  },
  getdel: (key: string) => Promise.resolve(store.getdel(key)),
  rpop: (key: string, count?: number) => Promise.resolve(store.rpop(key, count)),
  rpush: (key: string, ...values: string[]) => {
    store.rpush(key, ...values);
    return Promise.resolve(values.length);
  },
  lpush: (key: string, ...values: string[]) => {
    store.lpush(key, ...values);
    return Promise.resolve(values.length);
  },
  blpop: (key: string, timeout: number) => store.blpop(key, timeout),
  llen: (key: string) => Promise.resolve(store.llen(key)),
  keys: (pattern: string) => Promise.resolve(store.keys(pattern)),
  eval: (_script: string, _numKeys: number, ...args: (string | number)[]) => {
    return Promise.resolve(1);
  },
  ping: () => Promise.resolve('PONG'),
};
