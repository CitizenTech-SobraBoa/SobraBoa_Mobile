import type { ChatTransport } from './types';
export const CHAT_UNAVAILABLE = 'O assistente está em preparação. Tente novamente em breve.';
export const chatConfiguration = {
  baseURL: process.env.EXPO_PUBLIC_CHAT_URL?.trim() || null,
  contractImplemented: false,
} as const;
export const chatTransport: ChatTransport = {
  available: false,
  async send() {
    throw new Error(CHAT_UNAVAILABLE);
  },
};
