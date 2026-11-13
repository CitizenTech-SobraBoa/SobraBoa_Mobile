import { create, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { bindSessionTransport } from '../src/auth/sessionTransport';
import type { Session } from '../src/types/api';
const session: Session = {
  token: 'test-token',
  tipo: 'Bearer',
  usuarioId: 1,
  nome: 'Teste',
  papel: 'DOADOR',
  aprovacao: 'APROVADO',
  expiraEm: '2099-01-01T00:00:00Z',
};
const failure = (config: InternalAxiosRequestConfig, status: number) =>
  new AxiosError('test', undefined, config, undefined, {
    data: {},
    status,
    statusText: 'test',
    headers: {},
    config,
  });
describe('authenticated transport', () => {
  it('attaches Bearer only to protected API calls', async () => {
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => ({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }));
    const client = create({ adapter });
    bindSessionTransport(client, () => session, vi.fn());
    await client.get('/api/categorias');
    await client.post('/api/auth/login', {});
    expect(adapter.mock.calls[0]?.[0].headers.Authorization).toBe('Bearer test-token');
    expect(adapter.mock.calls[1]?.[0].headers.Authorization).toBeUndefined();
  });
  it('invalidates the matching session on protected 401, but not on 403', async () => {
    const invalidate = vi.fn();
    let status = 403;
    const client = create({
      adapter: async (config) => {
        throw failure(config, status);
      },
    });
    bindSessionTransport(client, () => session, invalidate);
    await expect(client.get('/api/doacoes')).rejects.toThrow();
    expect(invalidate).not.toHaveBeenCalled();
    status = 401;
    await expect(client.get('/api/doacoes')).rejects.toThrow();
    expect(invalidate).toHaveBeenCalledTimes(1);
  });
  it('ignores a late 401 from the previous account', async () => {
    let current = session;
    const invalidate = vi.fn();
    const client = create({
      adapter: async (config) => {
        current = { ...session, token: 'new-token', usuarioId: 2 };
        throw failure(config, 401);
      },
    });
    bindSessionTransport(client, () => current, invalidate);
    await expect(client.get('/api/categorias')).rejects.toThrow();
    expect(invalidate).not.toHaveBeenCalled();
  });
  it('blocks expired tokens before network and leaves login errors separate', async () => {
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
      throw failure(config, 401);
    });
    const invalidate = vi.fn();
    const client = create({ adapter });
    bindSessionTransport(
      client,
      () => ({ ...session, expiraEm: '2000-01-01T00:00:00Z' }),
      invalidate,
    );
    await expect(client.get('/api/categorias')).rejects.toThrow('expirou');
    expect(adapter).not.toHaveBeenCalled();
    invalidate.mockClear();
    await expect(client.post('/api/auth/login')).rejects.toThrow();
    expect(invalidate).not.toHaveBeenCalled();
  });
});
