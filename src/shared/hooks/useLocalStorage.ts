import { useEffect, useState } from "react";
import { toast } from "sonner";

type SetValue<T> = T | ((val: T) => T);

function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: SetValue<T>) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window !== "undefined") {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } else {
        return initialValue;
      }
    } catch  {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch  {
      toast.error("Could not store data in localStorage");
    }
  }, [key, storedValue]);

  const setValue = (value: SetValue<T>) => {
    setStoredValue((prevValue) =>
      value instanceof Function ? value(prevValue) : value,
    );
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
