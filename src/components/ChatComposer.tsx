import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, fonts } from '../theme';

export function ChatComposer({
  value,
  onChangeText,
  onSend,
  canSend,
  maxLength = 2000,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  canSend: boolean;
  maxLength?: number;
}) {
  return (
    <View style={styles.bar}>
      <TextInput
        accessibilityLabel="Mensagem"
        placeholder="Digite uma mensagem"
        placeholderTextColor={colors.muted}
        style={styles.input}
        multiline
        maxLength={maxLength}
        value={value}
        onChangeText={onChangeText}
        textAlignVertical="center"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Enviar mensagem"
        accessibilityState={{ disabled: !canSend }}
        disabled={!canSend}
        onPress={onSend}
        style={({ pressed }) => [
          styles.send,
          !canSend && styles.sendDisabled,
          pressed && styles.sendPressed,
        ]}
      >
        <Ionicons name="send" size={20} color={canSend ? colors.surface : colors.muted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 128,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 24,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
  send: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { backgroundColor: colors.greenLight },
  sendPressed: { opacity: 0.85 },
});
