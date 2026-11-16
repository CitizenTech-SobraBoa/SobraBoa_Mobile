import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParams } from '../navigation/types';
import { useAuth } from '../auth/AuthContext';
import { GreenHeader } from '../components/GreenHeader';
import { Badge } from '../components/ui';
import { useTabBarSpace } from '../hooks/useTabBarSpace';
import { displayDate } from '../validation/forms';
import { colors, fonts } from '../theme';

function InfoRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View accessible accessibilityLabel={text} style={s.row}>
      <View style={s.rowIcon}>
        <Ionicons name={icon} size={20} color={colors.green} />
      </View>
      <View style={s.rowLine} />
      <Text style={s.rowText}>{text}</Text>
    </View>
  );
}

export function AccountScreen() {
  const { session, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const focused = useIsFocused();
  const tabSpace = useTabBarSpace();
  const admin = session?.papel === 'ADMIN';
  const rows: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
    { icon: 'id-card-outline', text: `Identificador: ${session?.usuarioId ?? ''}` },
    ...(admin
      ? []
      : [
          {
            icon: 'shield-checkmark-outline' as const,
            text: `Aprovação no último login: ${session?.aprovacao || 'Não informada'}`,
          },
        ]),
    {
      icon: 'calendar-outline',
      text: `Sessão válida até: ${session ? displayDate(session.expiraEm) : ''}`,
    },
  ];
  return (
    <View style={s.page}>
      {focused && <StatusBar style="light" />}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.content, { paddingBottom: 36 + tabSpace }]}
      >
        <GreenHeader paddingBottom={72}>
          <View style={s.brandSpace} />
          <Text style={s.eyebrow}>Conta</Text>
          <Text accessibilityRole="header" style={s.title}>
            Minha conta
          </Text>
          <Text style={s.subtitle}>{admin ? ' ' : 'Você faz parte dessa transformação.'}</Text>
        </GreenHeader>

        <View style={s.card}>
          <View style={s.profile}>
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={s.avatar}
            >
              <Ionicons name="person" size={44} color={colors.green} />
            </View>
            <View style={s.profileText}>
              <Text style={s.name}>{session?.nome}</Text>
              {!admin && <Badge value={session?.papel || ''} />}
            </View>
          </View>
          {rows.map((row) => (
            <InfoRow key={row.icon} icon={row.icon} text={row.text} />
          ))}
        </View>

        {!admin && <View style={s.noteSpace} />}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sobre o App"
          onPress={() => navigation.navigate('About')}
          style={({ pressed }) => [s.link, pressed && s.pressed]}
        >
          <Ionicons name="information-circle-outline" size={24} color={colors.green} />
          <Text style={s.linkText}>Sobre o App</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
          onPress={() =>
            Alert.alert(
              'Sair da conta?',
              'Sua sessão e a conversa privada serão removidas deste aplicativo.',
              [
                { text: 'Continuar aqui', style: 'cancel' },
                { text: 'Sair', style: 'destructive', onPress: () => void logout() },
              ],
            )
          }
          style={({ pressed }) => [s.logout, pressed && s.pressed]}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.danger} />
          <Text style={s.logoutText}>Sair da conta</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 36, gap: 18 },
  brandSpace: { height: 27, marginBottom: 10 },
  eyebrow: { fontFamily: fonts.bold, fontSize: 15, color: colors.surface },
  title: { fontFamily: fonts.display, fontSize: 36, lineHeight: 42, color: colors.surface },
  subtitle: { fontFamily: fonts.regular, fontSize: 16, color: colors.greenLight },
  card: {
    marginHorizontal: 20,
    marginTop: -48,
    padding: 20,
    borderRadius: 26,
    backgroundColor: colors.surface,
    shadowColor: '#0B2B21',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingBottom: 18 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: { flex: 1, gap: 8 },
  name: { fontFamily: fonts.display, fontSize: 22, lineHeight: 27, color: colors.text },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLine: { width: 1, alignSelf: 'stretch', marginVertical: 10, backgroundColor: colors.border },
  rowText: { flex: 1, fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: colors.text },
  noteSpace: { height: 40 },
  link: {
    marginHorizontal: 20,
    minHeight: 58,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkText: { flex: 1, fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  logout: {
    marginHorizontal: 20,
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 18,
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: '#F2CFCD',
  },
  logoutText: { fontFamily: fonts.bold, fontSize: 16, color: colors.danger },
  pressed: { opacity: 0.8 },
});
