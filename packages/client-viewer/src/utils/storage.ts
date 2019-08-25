const temporaryStorage: Record<string, string> = {};

type StorageItems = {
  devToken: string;
};

export const storage = {
  set<T extends keyof StorageItems>(name: T, value: StorageItems[T]) {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch (e) {
      temporaryStorage[name] = value;
    }
  },
  get<T extends keyof StorageItems>(name: T): StorageItems[T] | null {
    try {
      const item = localStorage.getItem(name);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return temporaryStorage[name] || null;
    }
  },
};
