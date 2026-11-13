import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import type { Page } from '../types/api';
import { errorMessage } from '../services/http';

export function usePaged<T>(fetchPage: (page: number, signal: AbortSignal) => Promise<Page<T>>) {
  const [data, setData] = useState<Page<T> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  const load = useCallback(
    async (page = 0) => {
      controller.current?.abort();
      const request = new AbortController();
      controller.current = request;
      setBusy(true);
      setError('');
      try {
        const result = await fetchPage(page, request.signal);
        if (!request.signal.aborted) setData(result);
      } catch (e) {
        if (!request.signal.aborted) setError(errorMessage(e));
      } finally {
        if (!request.signal.aborted) setBusy(false);
      }
    },
    [fetchPage],
  );
  useFocusEffect(
    useCallback(() => {
      setData(null);
      void load();
      return () => controller.current?.abort();
    }, [load]),
  );
  return { data, busy, error, load };
}
