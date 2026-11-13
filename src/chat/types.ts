export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  state: 'pending' | 'sent' | 'failed';
  at: number;
}
export interface ChatReply {
  text: string;
  conversationId?: string;
}
export interface ChatTransport {
  available: boolean;
  send: (input: {
    text: string;
    conversationId?: string;
    signal: AbortSignal;
  }) => Promise<ChatReply>;
}
export interface ConversationState {
  draft: string;
  messages: ChatMessage[];
  busy: boolean;
  error: string;
  conversationId?: string;
}
