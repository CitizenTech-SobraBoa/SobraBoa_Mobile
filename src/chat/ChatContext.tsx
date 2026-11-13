import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type PropsWithChildren,
} from 'react';
import { Conversation } from './Conversation';
import { chatTransport } from './service';
const ChatContext = createContext<Conversation | null>(null);
export function ChatProvider({ children }: PropsWithChildren) {
  const [conversation] = useState(() => new Conversation(chatTransport));
  useEffect(() => () => conversation.clear(), [conversation]);
  return <ChatContext.Provider value={conversation}>{children}</ChatContext.Provider>;
}
export function useConversation() {
  const conversation = useContext(ChatContext);
  if (!conversation) throw new Error('ChatProvider ausente');
  const state = useSyncExternalStore(conversation.subscribe, conversation.getSnapshot);
  return {
    ...state,
    setDraft: conversation.setDraft,
    send: conversation.send,
    retry: conversation.retry,
    available: chatTransport.available,
  };
}
