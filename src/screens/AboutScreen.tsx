import { Image, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Screen } from '../components/ui';
import { colors, fonts } from '../theme';

const TEAM = [
  { name: 'Pedro Vaz Ferreira', rm: '566551' },
  { name: 'João Victor Luiz Oliveira Resende', rm: '565139' },
  { name: 'Vitor Dias dos Santos', rm: '565422' },
  { name: 'Felipe Kirschner Modesto', rm: '561810' },
];

const STEPS: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }[] = [
  {
    icon: 'storefront-outline',
    title: 'Doadores publicam',
    text: 'Comércios cadastram o que sobrou, com itens, validade e janela de retirada.',
  },
  {
    icon: 'compass-outline',
    title: 'Receptores encontram',
    text: 'Organizações buscam doações próximas e reservam o que atende à comunidade.',
  },
  {
    icon: 'key-outline',
    title: 'Retirada com código',
    text: 'O doador confirma a retirada pelo código e o receptor confirma o recebimento.',
  },
];

export function AboutScreen() {
  return (
    <Screen>
      <View style={s.hero}>
        <Image
          accessibilityLabel="Ícone do SobraBoa"
          source={require('../../assets/images/icon.png')}
          style={s.logo}
        />
        <Text accessibilityRole="header" style={s.appName}>
          SobraBoa
        </Text>
      </View>
      <View style={s.card}>
        <Text accessibilityRole="header" style={s.sectionTitle}>
          Nossa missão
        </Text>
        <Text style={s.body}>
          Conectamos comércios com excedentes de alimentos a organizações que combatem a fome. Uma
          rede local para reduzir o desperdício e fortalecer a comunidade.
        </Text>
        <View style={s.steps}>
          {STEPS.map((step) => (
            <View key={step.title} style={s.step}>
              <View style={s.stepIcon}>
                <Ionicons name={step.icon} size={22} color={colors.green} />
              </View>
              <View style={s.stepText}>
                <Text style={s.stepTitle}>{step.title}</Text>
                <Text style={s.small}>{step.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={s.card}>
        <Text accessibilityRole="header" style={s.sectionTitle}>
          Nossa equipe
        </Text>
        {TEAM.map((member, index) => (
          <View
            key={member.rm}
            accessible
            accessibilityLabel={`${member.name}, RM ${member.rm}`}
            style={[s.member, index > 0 && s.memberDivider]}
          >
            <View style={s.avatar}>
              <Ionicons name="person" size={24} color={colors.green} />
            </View>
            <View style={s.stepText}>
              <Text style={s.memberName}>{member.name}</Text>
              <Text style={s.small}>RM {member.rm}</Text>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: { alignItems: 'center', gap: 12, paddingVertical: 12 },
  logo: { width: 112, height: 112, borderRadius: 28 },
  appName: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40, color: colors.text },
  card: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 22,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 20, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.muted },
  small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.muted },
  steps: { gap: 14, marginTop: 4 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { flex: 1, gap: 2 },
  stepTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  member: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 56 },
  memberDivider: { borderTopWidth: 1, borderColor: colors.border, paddingTop: 14 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberName: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 22, color: colors.text },
});
