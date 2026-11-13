import { api } from './http';
import type {
  Category,
  Donation,
  DonationRequest,
  DonorRegistration,
  Metrics,
  Page,
  PendingRegistration,
  ReceiverRegistration,
  Reservation,
  Session,
} from '../types/api';

export const authService = {
  login: async (email: string, senha: string) =>
    (await api.post<Session>('/api/auth/login', { email: email.trim().toLowerCase(), senha })).data,
  registerDonor: async (body: DonorRegistration) =>
    (await api.post<{ usuarioId: number; mensagem: string }>('/api/auth/registro/doador', body))
      .data,
  registerReceiver: async (body: ReceiverRegistration) =>
    (await api.post<{ usuarioId: number; mensagem: string }>('/api/auth/registro/receptor', body))
      .data,
};
export const donationService = {
  mine: async (page: number, signal?: AbortSignal) =>
    (
      await api.get<Page<Donation>>('/api/doacoes/minhas', {
        params: { page, size: 10, sort: 'id,desc' },
        signal,
      })
    ).data,
  nearby: async (lat: number, lng: number, raioKm: number, page: number, signal?: AbortSignal) =>
    (
      await api.get<Page<Donation>>('/api/doacoes/proximas', {
        params: { lat, lng, raioKm, page, size: 10 },
        signal,
      })
    ).data,
  get: async (id: number, signal?: AbortSignal) =>
    (await api.get<Donation>(`/api/doacoes/${id}`, { signal })).data,
  create: async (body: DonationRequest) => (await api.post<Donation>('/api/doacoes', body)).data,
  update: async (id: number, body: DonationRequest) =>
    (await api.put<Donation>(`/api/doacoes/${id}`, body)).data,
  publish: async (id: number) => (await api.patch<Donation>(`/api/doacoes/${id}/publicar`)).data,
  cancel: async (id: number) => {
    await api.delete(`/api/doacoes/${id}`);
  },
  categories: async (signal?: AbortSignal) =>
    (await api.get<Category[]>('/api/categorias', { signal })).data,
};
export type RegistrationKind = 'doadores' | 'receptores';
export const adminService = {
  pending: async (kind: RegistrationKind, page: number, signal?: AbortSignal) =>
    (
      await api.get<Page<PendingRegistration>>(`/api/admin/${kind}/pendentes`, {
        params: { page, size: 10 },
        signal,
      })
    ).data,
  decide: async (kind: RegistrationKind, id: number, aprovado: boolean) => {
    await api.patch(`/api/admin/${kind}/${id}/aprovacao`, { aprovado });
  },
  metrics: async (signal?: AbortSignal) =>
    (await api.get<Metrics>('/api/admin/metricas', { signal })).data,
};
export const reservationService = {
  mine: async (page: number, signal?: AbortSignal) =>
    (
      await api.get<Page<Reservation>>('/api/reservas/minhas', {
        params: { page, size: 10, sort: 'id,desc' },
        signal,
      })
    ).data,
  create: async (id: number) => (await api.post<Reservation>(`/api/doacoes/${id}/reservas`)).data,
  pickup: async (id: number, codigo: string) =>
    (await api.post<Reservation>(`/api/reservas/${id}/retirada`, { codigo })).data,
  receive: async (id: number) => (await api.post<Reservation>(`/api/reservas/${id}/receber`)).data,
  cancel: async (id: number, motivo: string) =>
    (await api.post<Reservation>(`/api/reservas/${id}/cancelar`, { motivo })).data,
};
