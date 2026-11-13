import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { AppState } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/http';
import { authService } from '../services/backend';
import { validSession } from './session';
import { bindSessionTransport } from './sessionTransport';
import type { Session } from '../types/api';

interface AuthState {
  session: Session | null;
  restoring: boolean;
  notice: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthState | null>(null);
const key = 'sobraboa.session.v1';

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [notice, setNotice] = useState('');
  const current = useRef<Session | null>(null);
  const generation = useRef(0);
  const storageQueue = useRef<Promise<unknown>>(Promise.resolve());
  const persist = useCallback((operation: () => Promise<unknown>) => {
    const next = storageQueue.current.catch(() => undefined).then(operation);
    storageQueue.current = next;
    return next;
  }, []);
  const clear = useCallback(
    async (message = '') => {
      generation.current += 1;
      current.current = null;
      setSession(null);
      setNotice(message);
      try {
        await persist(() => SecureStore.deleteItemAsync(key));
      } catch {
        setNotice(
          'A sessão foi encerrada, mas não foi possível limpar o armazenamento seguro. Feche os dados do app antes de compartilhar este dispositivo.',
        );
      }
    },
    [persist],
  );

  useEffect(() => {
    let active = true;
    const unbind = bindSessionTransport(
      api,
      () => current.current,
      () => {
        void clear('Sua sessão expirou. Entre novamente.');
      },
    );
    void (async () => {
      try {
        const raw = await SecureStore.getItemAsync(key);
        const saved: unknown = raw ? JSON.parse(raw) : null;
        if (!active) return;
        if (validSession(saved)) {
          current.current = saved;
          setSession(saved);
        } else if (raw) await clear('Sua sessão expirou. Entre novamente.');
      } catch {
        if (active) await clear('Não foi possível restaurar a sessão. Entre novamente.');
      } finally {
        if (active) setRestoring(false);
      }
    })();
    return () => {
      active = false;
      unbind();
    };
  }, [clear]);

  useEffect(() => {
    if (!session) return;
    const check = () => {
      if (!validSession(session)) void clear('Sua sessão expirou. Entre novamente.');
    };
    const timer = setTimeout(
      check,
      Math.min(Date.parse(session.expiraEm) - Date.now(), 2147483647),
    );
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });
    return () => {
      clearTimeout(timer);
      listener.remove();
    };
  }, [session, clear]);

  const login = useCallback(
    async (email: string, password: string) => {
      const version = ++generation.current;
      const result = await authService.login(email, password);
      if (!validSession(result)) throw new Error('O servidor retornou uma sessão inválida.');
      if (version !== generation.current) return;
      await persist(() => SecureStore.setItemAsync(key, JSON.stringify(result)));
      if (version !== generation.current) return;
      current.current = result;
      setSession(result);
      setNotice('');
    },
    [persist],
  );
  return (
    <AuthContext.Provider value={{ session, restoring, notice, login, logout: () => clear() }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider ausente');
  return value;
}
