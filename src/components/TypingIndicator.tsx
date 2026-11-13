import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { AssistantAvatar } from './MessageBubble';

const DOTS = [0, 1, 2];

export function TypingIndicator() {
  const values = useRef(DOTS.map(() => new Animated.Value(0.3))).current;
  useEffect(() => {
    const loops = values.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 160),
          Animated.timing(value, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(value, { toValue: 0.3, duration: 320, useNativeDriver: true }),
          Animated.delay((DOTS.length - index) * 160),
        ]),
      ),
    );
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [values]);
  return (
    <View
      accessible
      accessibilityLiveRegion="polite"
      accessibilityLabel="O assistente está digitando"
      style={styles.row}
    >
      <AssistantAvatar />
      <View style={styles.bubble}>
        {values.map((value, index) => (
          <Animated.View key={DOTS[index]} style={[styles.dot, { opacity: value }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 12 },
  bubble: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 18,
    borderBottomLeftRadius: 5,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.muted },
});
