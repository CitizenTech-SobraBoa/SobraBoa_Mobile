import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, fonts } from '../theme';
import type { ChatMessage } from '../chat/types';

export function AssistantAvatar() {
  return (
    <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no">
      <Ionicons name="leaf" size={16} color={colors.lime} />
    </View>
  );
}

function clock(at: number) {
  const date = new Date(at);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function MessageBubble({
  message,
  showAvatar,
  grouped,
  onRetry,
}: {
  message: ChatMessage;
  showAvatar: boolean;
  grouped: boolean;
  onRetry: (id: string) => void;
}) {
  const mine = message.role === 'user';
  const failed = message.state === 'failed';
  const bubble = (
    <View
      style={[
        styles.bubble,
        mine ? styles.mine : styles.theirs,
        mine && failed && styles.failedBubble,
      ]}
    >
      <Text selectable style={[styles.text, mine && styles.mineText]}>
        {message.text}
      </Text>
      <View style={styles.meta}>
        {failed ? (
          <>
            <Ionicons name="alert-circle" size={14} color={colors.lime} />
            <Text style={[styles.time, styles.mineText]}>Falhou · toque para reenviar</Text>
          </>
        ) : (
          <>
            <Text style={[styles.time, mine && styles.mineTime]}>
              {message.state === 'pending' ? 'Enviando…' : clock(message.at)}
            </Text>
            {mine && message.state === 'sent' && (
              <Ionicons name="checkmark" size={14} color={colors.lime} />
            )}
          </>
        )}
      </View>
    </View>
  );
  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs, grouped && styles.grouped]}>
      {!mine && (showAvatar ? <AssistantAvatar /> : <View style={styles.avatarSpace} />)}
      {failed ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Mensagem não enviada: ${message.text}. Toque para tentar novamente.`}
          onPress={() => onRetry(message.id)}
          style={styles.retry}
        >
          {bubble}
        </Pressable>
      ) : (
        bubble
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 12 },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  grouped: { marginTop: 3 },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSpace: { width: 30 },
  retry: { maxWidth: '80%' },
  bubble: {
    maxWidth: '100%',
    paddingHorizontal: 14,
    paddingTop: 9,
    paddingBottom: 6,
    borderRadius: 18,
    gap: 3,
  },
  mine: { backgroundColor: colors.green, borderBottomRightRadius: 5, maxWidth: '82%' },
  theirs: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 5,
    maxWidth: '82%',
  },
  failedBubble: { backgroundColor: colors.danger, maxWidth: '100%' },
  text: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 22, color: colors.text },
  mineText: { color: colors.surface },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  time: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
  mineTime: { color: colors.greenLight },
});
