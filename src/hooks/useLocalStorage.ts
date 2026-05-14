import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      } else {
        window.localStorage.setItem(key, JSON.stringify(initialValue));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  // initialValue を依存配列から除外: [] などのリテラルが毎レンダリング新参照になるのを防ぐ
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
