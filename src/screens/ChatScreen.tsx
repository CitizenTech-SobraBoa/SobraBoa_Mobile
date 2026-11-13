import { useRef } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useConversation } from '../chat/ChatContext';
import { useTabBarSpace } from '../hooks/useTabBarSpace';
import { CHAT_UNAVAILABLE } from '../chat/service';
import { ChatComposer } from '../components/ChatComposer';
import { MessageBubble } from '../components/MessageBubble';
import { TypingIndicator } from '../components/TypingIndicator';
import { Notice } from '../components/ui';
import { colors, fonts } from '../theme';
import type { ChatMessage } from '../chat/types';

const WALLPAPER_RATIO = 1844 / 853;

export function ChatScreen() {
  const chat = useConversation();
  const { width } = useWindowDimensions();
  const list = useRef<FlatList<ChatMessage>>(null);
  const headerHeight = useHeaderHeight();
  const tabSpace = useTabBarSpace();
  const canSend = chat.available && !chat.busy && chat.draft.trim().length > 0;
  return (
    <SafeAreaView edges={['left', 'right']} style={s.page}>
      <KeyboardAvoidingView
        style={[s.page, { paddingBottom: tabSpace }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight}
      >
        {!chat.available && (
          <View accessibilityLiveRegion="polite" style={s.status}>
            <Ionicons name="time-outline" size={18} color={colors.amber} />
            <Text style={s.statusText}>{CHAT_UNAVAILABLE}</Text>
          </View>
        )}
        <View style={s.wallpaper}>
          <Image
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            source={require('../../assets/images/chat-wallpaper.jpg')}
            resizeMode="cover"
            style={[s.wallpaperImage, { width, height: width * WALLPAPER_RATIO }]}
          />
          <FlatList
            ref={list}
            data={chat.messages}
            keyExtractor={(m) => m.id}
            style={s.list}
            contentContainerStyle={s.messages}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={s.welcome}>
                <Text style={s.welcomeTitle}>Assistente SobraBoa</Text>
                <Text style={s.welcomeText}>
                  {chat.available
                    ? 'Escreva uma mensagem para começar a conversa.'
                    : 'Quando o assistente estiver disponível, suas conversas aparecerão aqui.'}
                </Text>
              </View>
            }
            renderItem={({ item, index }) => {
              const previous = chat.messages[index - 1];
              const grouped = previous?.role === item.role;
              return (
                <MessageBubble
                  message={item}
                  grouped={grouped}
                  showAvatar={item.role === 'assistant' && !grouped}
                  onRetry={(id) => void chat.retry(id)}
                />
              );
            }}
            ListFooterComponent={chat.busy ? <TypingIndicator /> : null}
          />
        </View>
        <Notice error message={chat.error} />
        <ChatComposer
          value={chat.draft}
          onChangeText={chat.setDraft}
          onSend={() => void chat.send()}
          canSend={canSend}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  wallpaper: { flex: 1, overflow: 'hidden' },
  wallpaperImage: { position: 'absolute', top: 0, left: 0 },
  list: { flex: 1 },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.amberLight,
  },
  statusText: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.amber },
  messages: { paddingHorizontal: 14, paddingTop: 6, paddingBottom: 16, flexGrow: 1 },
  welcome: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 },
  welcomeTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.text },
  welcomeText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    textAlign: 'center',
  },
});
