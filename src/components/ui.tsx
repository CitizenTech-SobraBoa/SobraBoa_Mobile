import type { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { colors, fonts } from '../theme';
import { useTabBarSpace } from '../hooks/useTabBarSpace';

export function Screen({ children }: PropsWithChildren) {
  const headerHeight = useHeaderHeight();
  const tabSpace = useTabBarSpace();
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.fill}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView
          contentContainerStyle={[styles.page, { paddingBottom: 36 + tabSpace }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Heading({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <View style={styles.heading}>
      {!!eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {!!subtitle && <Text style={styles.body}>{subtitle}</Text>}
    </View>
  );
}
export function Body({ children }: PropsWithChildren) {
  return <Text style={styles.body}>{children}</Text>;
}
export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}
export function Button({
  title,
  onPress,
  disabled,
  busy,
  secondary,
  danger,
  icon,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  secondary?: boolean;
  danger?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled || !!busy, busy: !!busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        danger && styles.danger,
        (disabled || busy) && styles.disabled,
        pressed && { opacity: 0.8 },
      ]}
    >
      {busy && <ActivityIndicator color={secondary ? colors.green : colors.surface} />}
      {icon && !busy && (
        <Ionicons name={icon} size={20} color={secondary ? colors.green : colors.surface} />
      )}
      <Text style={[styles.buttonText, secondary && { color: colors.green }]}>{title}</Text>
    </Pressable>
  );
}
export function Field({
  label,
  hint,
  ...props
}: TextInputProps & { label: string; hint?: string }) {
  const [visible, setVisible] = useState(false);
  const password = !!props.secureTextEntry;
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.muted}
          {...props}
          secureTextEntry={password && !visible}
          autoCorrect={password ? false : props.autoCorrect}
          style={[
            styles.input,
            props.multiline && styles.multiline,
            password && styles.inputWithIcon,
            props.style,
          ]}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
            hitSlop={8}
            onPress={() => setVisible((v) => !v)}
            style={styles.eye}
          >
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.muted}
            />
          </Pressable>
        )}
      </View>
      {!!hint && <Text style={styles.small}>{hint}</Text>}
    </View>
  );
}
export function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggle}>
      <Text style={[styles.body, { flex: 1 }]}>{label}</Text>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.green, false: colors.border }}
      />
    </View>
  );
}
export function Choices<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choices}>
        {options.map((o) => (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: value === o.value }}
            onPress={() => onChange(o.value)}
            style={[styles.choice, value === o.value && styles.choiceActive]}
          >
            <Text style={[styles.label, value === o.value && { color: colors.surface }]}>
              {o.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
export function Notice({ message, error = false }: { message?: string; error?: boolean }) {
  if (!message) return null;
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.notice, error && { backgroundColor: colors.dangerLight }]}
    >
      <Text style={[styles.body, { color: error ? colors.danger : colors.amber }]}>{message}</Text>
    </View>
  );
}
export function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.green} />
      <Body>Carregando…</Body>
    </View>
  );
}
export function Empty({
  title,
  detail,
  icon = 'leaf-outline',
}: {
  title: string;
  detail: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={36} color={colors.green} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Body>{detail}</Body>
    </View>
  );
}
export function Badge({ value }: { value: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{value.replaceAll('_', ' ')}</Text>
    </View>
  );
}
export function FoodPhoto({ uri }: { uri?: string | null }) {
  const [failed, setFailed] = useState(false);
  if (!uri || !/^https?:\/\//.test(uri) || failed)
    return (
      <View style={styles.photoFallback}>
        <Ionicons name="basket-outline" color={colors.green} size={38} />
        <Text style={styles.small}>Alimento que conecta</Text>
      </View>
    );
  return (
    <Image
      accessibilityLabel="Foto da doação"
      source={{ uri }}
      style={styles.photo}
      onError={() => setFailed(true)}
    />
  );
}
export const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background },
  page: { padding: 22, gap: 18, paddingBottom: 36 },
  heading: { gap: 8, paddingVertical: 8 },
  eyebrow: { fontFamily: fonts.bold, color: colors.green, fontSize: 12, letterSpacing: 2 },
  title: { fontFamily: fonts.display, color: colors.text, fontSize: 30, lineHeight: 36 },
  sectionTitle: { fontFamily: fonts.bold, color: colors.text, fontSize: 20 },
  body: { fontFamily: fonts.regular, color: colors.muted, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: fonts.regular, color: colors.muted, fontSize: 13, lineHeight: 19 },
  card: {
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: 22,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    minHeight: 52,
    backgroundColor: colors.green,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  secondary: { backgroundColor: colors.greenLight },
  danger: { backgroundColor: colors.danger },
  disabled: { opacity: 0.45 },
  buttonText: { fontFamily: fonts.bold, fontSize: 16, color: colors.surface, textAlign: 'center' },
  field: { gap: 7 },
  label: { fontFamily: fonts.bold, color: colors.text, fontSize: 14 },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    minHeight: 52,
    padding: 14,
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  inputWrap: { justifyContent: 'center' },
  inputWithIcon: { paddingRight: 52 },
  eye: {
    position: 'absolute',
    right: 4,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 },
  choices: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  choice: {
    padding: 13,
    borderRadius: 14,
    backgroundColor: colors.greenLight,
    minHeight: 48,
    justifyContent: 'center',
  },
  choiceActive: { backgroundColor: colors.green },
  notice: { backgroundColor: colors.amberLight, padding: 16, borderRadius: 16 },
  loading: { padding: 32, gap: 12, alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: 30, gap: 14 },
  emptyIcon: { padding: 20, borderRadius: 30, backgroundColor: colors.greenLight },
  badge: {
    backgroundColor: colors.greenLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  badgeText: { fontFamily: fonts.bold, color: colors.green, fontSize: 12 },
  photo: { width: '100%', height: 170, borderRadius: 14 },
  photoFallback: {
    width: '100%',
    height: 100,
    borderRadius: 14,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
