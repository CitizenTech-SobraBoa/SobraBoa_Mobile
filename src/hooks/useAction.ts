import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '../services/http';

export function useAction() {
  const lock = useRef(false);
  const mounted = useRef(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const run = useCallback(async (action: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (e) {
      if (mounted.current) setError(errorMessage(e));
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  }, []);
  return { busy, error, run };
}
