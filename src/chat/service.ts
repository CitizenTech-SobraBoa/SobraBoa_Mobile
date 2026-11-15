import axios from 'axios';
import type { ChatTransport } from './types';

export const CHAT_UNAVAILABLE = 'O assistente está em preparação. Tente novamente em breve.';

const baseURL = process.env.EXPO_PUBLIC_CHAT_URL?.trim() || null;

export const chatConfiguration = {
  baseURL,
  contractImplemented: true,
} as const;

export const chatTransport: ChatTransport = {
  available: baseURL !== null && baseURL.length > 0,

  async send({ text, signal }) {
    const { data } = await axios.post(
      `${baseURL}/chat`,
      { mensagem: text },
      { signal, timeout: 30000 },
    );
    return { text: data.resposta };
  },
};