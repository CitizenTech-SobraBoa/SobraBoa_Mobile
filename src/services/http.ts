import { create, isAxiosError } from 'axios';
import type { ApiError } from '../types/api';

export function createApiClient(baseURL: string | undefined) {
  const client = create({ baseURL: baseURL?.replace(/\/$/, ''), timeout: 30000 });
  client.interceptors.request.use((config) => {
    if (!baseURL || !/^https?:\/\//.test(baseURL))
      throw new Error('Configure EXPO_PUBLIC_API_URL antes de conectar.');
    return config;
  });
  return client;
}
export const api = createApiClient(process.env.EXPO_PUBLIC_API_URL);

export function errorMessage(error: unknown): string {
  if (isAxiosError<ApiError>(error)) {
    if (!error.response)
      return error.code === 'ECONNABORTED'
        ? 'O servidor demorou para responder. Ele pode estar iniciando. Confira a operação antes de tentar novamente.'
        : 'Não foi possível conectar. Confira sua internet e tente novamente.';
    const { status, data } = error.response;
    if (status >= 500) return 'O serviço está indisponível no momento. Tente novamente em breve.';
    if (status === 429)
      return 'Limite de tentativas atingido. Aguarde 15 minutos antes de tentar novamente.';
    const fallback: Record<number, string> = {
      400: 'Revise os dados informados.',
      401: 'Sessão ou credenciais inválidas. Entre novamente.',
      403: 'Você não tem permissão ou seu cadastro ainda não foi aprovado.',
      404: 'Registro não encontrado.',
      409: 'Esta operação conflita com o estado atual dos dados.',
      422: 'Não foi possível concluir. Confira as regras desta operação.',
    };
    const fields = Array.isArray(data?.campos)
      ? data.campos.map((c) => `${c.campo}: ${c.mensagem}`).join('\n')
      : '';
    return [
      typeof data?.mensagem === 'string'
        ? data.mensagem
        : fallback[status] || 'Não foi possível concluir.',
      fields,
    ]
      .filter(Boolean)
      .join('\n');
  }
  return error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.';
}
