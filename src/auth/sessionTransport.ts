import { isAxiosError, type AxiosInstance } from 'axios';
import type { Session } from '../types/api';
import { validSession } from './session';

export function bindSessionTransport(
  client: AxiosInstance,
  current: () => Session | null,
  invalidate: () => void,
) {
  const requestId = client.interceptors.request.use((config) => {
    if (config.url?.startsWith('/api/auth/')) return config;
    const session = current();
    if (!session || !validSession(session)) {
      invalidate();
      throw new Error('Sua sessão expirou. Entre novamente.');
    }
    config.headers.Authorization = `Bearer ${session.token}`;
    return config;
  });
  const responseId = client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (
        isAxiosError(error) &&
        error.response?.status === 401 &&
        !error.config?.url?.startsWith('/api/auth/') &&
        current() &&
        error.config?.headers.Authorization === `Bearer ${current()?.token}`
      ) {
        invalidate();
      }
      return Promise.reject(error);
    },
  );
  return () => {
    client.interceptors.request.eject(requestId);
    client.interceptors.response.eject(responseId);
  };
}
