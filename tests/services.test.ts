import { afterEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { api, createApiClient, errorMessage } from '../src/services/http';
import { adminService, donationService, reservationService } from '../src/services/backend';
afterEach(() => vi.restoreAllMocks());
describe('real API wire contract', () => {
  it('keeps Spring pages intact', async () => {
    const page = { content: [], page: { size: 10, number: 2, totalElements: 20, totalPages: 2 } };
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: page });
    expect(await donationService.mine(2)).toEqual(page);
    expect(get).toHaveBeenCalledWith(
      '/api/doacoes/minhas',
      expect.objectContaining({ params: { page: 2, size: 10, sort: 'id,desc' } }),
    );
  });
  it('handles DELETE 204 and sends pickup code with real reservation ID', async () => {
    const del = vi.spyOn(api, 'delete').mockResolvedValue({ status: 204, data: '' });
    expect(await donationService.cancel(17)).toBeUndefined();
    expect(del).toHaveBeenCalledWith('/api/doacoes/17');
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { id: 21 } });
    await reservationService.pickup(21, 'ABC234');
    expect(post).toHaveBeenCalledWith('/api/reservas/21/retirada', { codigo: 'ABC234' });
  });
  it('uses the admin approval routes and handles the 204 decision', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: { content: [] } });
    await adminService.pending('receptores', 1);
    expect(get).toHaveBeenCalledWith(
      '/api/admin/receptores/pendentes',
      expect.objectContaining({ params: { page: 1, size: 10 } }),
    );
    const patch = vi.spyOn(api, 'patch').mockResolvedValue({ status: 204, data: '' });
    expect(await adminService.decide('doadores', 7, true)).toBeUndefined();
    expect(patch).toHaveBeenCalledWith('/api/admin/doadores/7/aprovacao', { aprovado: true });
    await adminService.metrics();
    expect(get).toHaveBeenLastCalledWith('/api/admin/metricas', expect.anything());
  });
  it('makes no request without configured URL', async () => {
    const client = createApiClient(undefined);
    await expect(client.get('/api/categorias')).rejects.toThrow('EXPO_PUBLIC_API_URL');
  });
  it('preserves validation and permission messages without exposing server internals', () => {
    const make = (status: number) =>
      new AxiosError('error', undefined, undefined, undefined, {
        status,
        statusText: 'error',
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: {
          mensagem: 'Mensagem de negócio',
          campos: [{ campo: 'titulo', mensagem: 'obrigatório' }],
        },
      });
    expect(errorMessage(make(403))).toContain('Mensagem de negócio');
    expect(errorMessage(make(400))).toContain('titulo: obrigatório');
    expect(errorMessage(make(500))).not.toContain('Mensagem de negócio');
  });
});
