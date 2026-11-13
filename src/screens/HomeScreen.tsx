import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../auth/AuthContext';
import { ApprovalCard } from '../components/ApprovalCard';
import { GreenHeader } from '../components/GreenHeader';
import { Body, Button, Card, Heading } from '../components/ui';
import { useTabBarSpace } from '../hooks/useTabBarSpace';
import type { RootStackParams, TabParams } from '../navigation/types';
import { colors, fonts } from '../theme';

const HERO_RATIO = 1200 / 751;
const PAGE_PADDING = 22;

function firstName(name?: string) {
  const first = name?.trim().split(' ')[0];
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : 'você';
}

export function HomeScreen() {
  const { session } = useAuth();
  const { width } = useWindowDimensions();
  const focused = useIsFocused();
  const tabSpace = useTabBarSpace();
  const heroWidth = width - PAGE_PADDING * 2;
  const root = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const tabs = useNavigation<BottomTabNavigationProp<TabParams>>();
  const donor = session?.papel === 'DOADOR';
  const locked = donor && session?.aprovacao !== 'APROVADO';
  return (
    <View style={s.page}>
      {focused && <StatusBar style="light" />}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 36 + tabSpace }}
      >
        <GreenHeader paddingTop={30} paddingBottom={48} leaf={false}>
          <Text accessibilityRole="header" style={s.greeting}>
            {`Olá, ${firstName(session?.nome)}!`}
          </Text>
          <Text style={s.greetingSub}>Pequenas atitudes. Novos destinos.</Text>
        </GreenHeader>
        <View style={s.body}>
          {donor ? (
            <Image
              accessible
              accessibilityRole="image"
              accessibilityLabel="O que sobra pode fazer a diferença. Compartilhe alimentos. Alimente possibilidades."
              source={require('../../assets/images/home-hero.jpg')}
              resizeMode="cover"
              style={[s.heroImage, { width: heroWidth, height: heroWidth / HERO_RATIO }]}
            />
          ) : (
            <View style={s.hero}>
              <View
                pointerEvents="none"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={s.heroArt}
              >
                <Ionicons name="heart" size={170} color={colors.green} />
              </View>
              <View style={s.heroText}>
                <Text accessibilityRole="header" style={s.heroTitle}>
                  Alimento bom, mais perto de você.
                </Text>
                <Text style={s.heroBody}>
                  Encontre doações e organize a retirada para a sua comunidade.
                </Text>
              </View>
            </View>
          )}
          <ApprovalCard approval={session?.aprovacao ?? null} donor={donor} />
          <Button
            title={donor ? 'Criar uma doação' : 'Explorar doações próximas'}
            icon={locked ? 'lock-closed-outline' : undefined}
            disabled={locked}
            onPress={() => (donor ? root.navigate('Create') : tabs.navigate('Explore'))}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Precisa de uma orientação? Converse com o Assistente IA"
            onPress={() => tabs.navigate('Chat')}
            style={({ pressed }) => [s.assistant, pressed && s.pressed]}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.green} />
            <View style={s.assistantText}>
              <Text style={s.assistantTitle}>Precisa de uma orientação?</Text>
              <Text style={s.assistantDetail}>Converse com o Assistente IA</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </Pressable>
          <Button
            secondary
            title={donor ? 'Ver minhas doações' : 'Acompanhar minhas reservas'}
            onPress={() => (donor ? tabs.navigate('Donations') : tabs.navigate('Reservations'))}
          />
          {donor && (
            <Button
              secondary
              title="Confirmar uma retirada"
              onPress={() => root.navigate('Pickup')}
            />
          )}
          <Card>
            <Heading title="Cada etapa importa" />
            <Body>
              {donor
                ? '1. Cadastre os alimentos e a janela de retirada.\n2. Revise e publique o rascunho.\n3. Confira o código na entrega.'
                : '1. Busque alimentos na sua região.\n2. Reserve e apresente seu código na retirada.\n3. Confirme o recebimento no aplicativo.'}
            </Body>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  body: { padding: PAGE_PADDING, gap: 18 },
  greeting: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, color: colors.surface },
  greetingSub: { fontFamily: fonts.regular, fontSize: 16, color: colors.greenLight },
  heroImage: { borderRadius: 26 },
  hero: {
    minHeight: 200,
    padding: 22,
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: colors.greenLight,
    overflow: 'hidden',
  },
  heroArt: { position: 'absolute', right: -24, bottom: -26, opacity: 0.22 },
  heroText: { width: '64%', gap: 12 },
  heroTitle: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, color: colors.green },
  heroBody: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.muted },
  assistant: {
    minHeight: 72,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  assistantText: { flex: 1, gap: 2 },
  assistantTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  assistantDetail: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  pressed: { opacity: 0.8 },
});
