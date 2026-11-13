import { describe, expect, it, vi } from 'vitest';
import { Conversation } from '../src/chat/Conversation';
import { chatTransport, CHAT_UNAVAILABLE } from '../src/chat/service';
import type { ChatReply, ChatTransport } from '../src/chat/types';
describe('conversation lifecycle', () => {
  it('does not send empty messages or contact an unavailable service', async () => {
    const send = vi.fn(chatTransport.send);
    const c = new Conversation({ ...chatTransport, send });
    c.setDraft('   ');
    await c.send();
    expect(send).not.toHaveBeenCalled();
    c.setDraft('Olá');
    await c.send();
    expect(send).not.toHaveBeenCalled();
    expect(c.getSnapshot()).toMatchObject({ draft: 'Olá', messages: [], error: CHAT_UNAVAILABLE });
  });
  it('clears the input on send, locks duplicate submissions and marks the failure', async () => {
    let reject!: (error: Error) => void;
    const send = vi.fn(
      () =>
        new Promise<ChatReply>((_, r) => {
          reject = r;
        }),
    );
    const c = new Conversation({ available: true, send });
    c.setDraft('Minha pergunta');
    const pending = c.send();
    expect(c.getSnapshot().draft).toBe('');
    expect(c.getSnapshot().messages[0]).toMatchObject({ role: 'user', state: 'pending' });
    c.setDraft('Mensagem digitada enquanto aguarda');
    await c.send();
    expect(send).toHaveBeenCalledTimes(1);
    expect(c.getSnapshot().draft).toBe('Mensagem digitada enquanto aguarda');
    reject(new Error('offline'));
    await pending;
    expect(c.getSnapshot().messages).toHaveLength(1);
    expect(c.getSnapshot().messages[0]?.state).toBe('failed');
    expect(c.getSnapshot().busy).toBe(false);
  });
  it('retries a failed message without duplicating it and keeps conversation identity', async () => {
    const send = vi
      .fn<ChatTransport['send']>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({ text: 'Resposta de teste', conversationId: 'test-conversation' });
    const c = new Conversation({ available: true, send });
    c.setDraft('Pergunta');
    await c.send();
    const failed = c.getSnapshot().messages[0];
    expect(failed?.state).toBe('failed');
    await c.retry(failed?.id ?? '');
    expect(send.mock.calls[1]?.[0].text).toBe('Pergunta');
    expect(c.getSnapshot().messages.map((m) => [m.role, m.state])).toEqual([
      ['user', 'sent'],
      ['assistant', 'sent'],
    ]);
    c.setDraft('Outra');
    await c.send();
    expect(send.mock.calls[2]?.[0].conversationId).toBe('test-conversation');
  });
  it('ignores retry for messages that did not fail', async () => {
    const send = vi.fn<ChatTransport['send']>().mockResolvedValue({ text: 'Ok' });
    const c = new Conversation({ available: true, send });
    c.setDraft('Pergunta');
    await c.send();
    await c.retry(c.getSnapshot().messages[0]?.id ?? '');
    await c.retry('inexistente');
    expect(send).toHaveBeenCalledTimes(1);
  });
  it('clears private state and ignores late replies after logout', async () => {
    let resolve!: (r: ChatReply) => void;
    let signal: AbortSignal | undefined;
    const c = new Conversation({
      available: true,
      send: (input) => {
        signal = input.signal;
        return new Promise((r) => {
          resolve = r;
        });
      },
    });
    c.setDraft('Privado');
    const pending = c.send();
    c.clear();
    expect(signal?.aborted).toBe(true);
    resolve({ text: 'Resposta antiga' });
    await pending;
    expect(c.getSnapshot()).toEqual({ messages: [], draft: '', busy: false, error: '' });
  });
});
