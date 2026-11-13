import type { ChatTransport, ConversationState } from './types';
import { CHAT_UNAVAILABLE } from './service';

const DELIVERY_FAILED =
  'Não foi possível obter a resposta. Toque na mensagem com falha para tentar novamente.';

export class Conversation {
  private state: ConversationState = { draft: '', messages: [], busy: false, error: '' };
  private listeners = new Set<() => void>();
  private request?: AbortController;
  private nextId = 0;
  constructor(private readonly transport: ChatTransport) {}
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private update(next: Partial<ConversationState>) {
    this.state = { ...this.state, ...next };
    this.listeners.forEach((listener) => listener());
  }
  setDraft = (draft: string) => {
    this.update({ draft, error: '' });
  };
  send = async () => {
    const text = this.state.draft.trim();
    if (!text || this.state.busy) return;
    if (!this.transport.available) {
      this.update({ error: CHAT_UNAVAILABLE });
      return;
    }
    const id = `user-${++this.nextId}`;
    this.update({
      draft: '',
      busy: true,
      error: '',
      messages: [
        ...this.state.messages,
        { id, role: 'user', text, state: 'pending', at: Date.now() },
      ],
    });
    await this.deliver(id, text);
  };
  retry = async (id: string) => {
    const failed = this.state.messages.find(
      (m) => m.id === id && m.role === 'user' && m.state === 'failed',
    );
    if (!failed || this.state.busy || !this.transport.available) return;
    this.update({
      busy: true,
      error: '',
      messages: this.state.messages.map((m) =>
        m.id === id ? { ...m, state: 'pending' as const } : m,
      ),
    });
    await this.deliver(id, failed.text);
  };
  private async deliver(id: string, text: string) {
    const request = new AbortController();
    this.request = request;
    try {
      const reply = await this.transport.send({
        text,
        conversationId: this.state.conversationId,
        signal: request.signal,
      });
      if (request.signal.aborted) return;
      if (!reply.text.trim()) throw new Error('Resposta vazia');
      this.update({
        conversationId: reply.conversationId ?? this.state.conversationId,
        messages: [
          ...this.state.messages.map((m) => (m.id === id ? { ...m, state: 'sent' as const } : m)),
          {
            id: `assistant-${++this.nextId}`,
            role: 'assistant',
            text: reply.text,
            state: 'sent',
            at: Date.now(),
          },
        ],
      });
    } catch {
      if (request.signal.aborted) return;
      this.update({
        error: DELIVERY_FAILED,
        messages: this.state.messages.map((m) =>
          m.id === id ? { ...m, state: 'failed' as const } : m,
        ),
      });
    } finally {
      if (!request.signal.aborted) this.update({ busy: false });
    }
  }
  clear = () => {
    this.request?.abort();
    this.state = { draft: '', messages: [], busy: false, error: '' };
    this.listeners.forEach((listener) => listener());
  };
}
