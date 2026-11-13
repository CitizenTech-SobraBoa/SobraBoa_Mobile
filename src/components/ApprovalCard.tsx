import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Approval } from '../types/api';
import { colors, fonts } from '../theme';

type StepState = 'done' | 'current' | 'todo' | 'failed';
interface Step {
  label: string;
  state: StepState;
}

function stepsFor(approval: Approval): Step[] {
  switch (approval) {
    case 'APROVADO':
      return [
        { label: 'Enviado', state: 'done' },
        { label: 'Em análise', state: 'done' },
        { label: 'Aprovado', state: 'done' },
      ];
    case 'REJEITADO':
      return [
        { label: 'Enviado', state: 'done' },
        { label: 'Em análise', state: 'done' },
        { label: 'Não aprovado', state: 'failed' },
      ];
    default:
      return [
        { label: 'Enviado', state: 'done' },
        { label: 'Em análise', state: 'current' },
        { label: 'Aprovado', state: 'todo' },
      ];
  }
}

function Marker({ state }: { state: StepState }) {
  if (state === 'done' || state === 'failed') {
    return (
      <View style={[s.marker, state === 'done' ? s.markerDone : s.markerFailed]}>
        <Ionicons
          name={state === 'done' ? 'checkmark' : 'close'}
          size={16}
          color={colors.surface}
        />
      </View>
    );
  }
  return (
    <View style={[s.marker, s.markerRing, state === 'current' && s.markerCurrent]}>
      {state === 'current' && <View style={s.markerDot} />}
    </View>
  );
}

function Steps({ steps }: { steps: Step[] }) {
  const reached = (index: number) => steps[index]?.state === 'done';
  return (
    <View style={s.steps}>
      {steps.map((step, index) => (
        <View key={step.label} style={s.step}>
          <View style={s.stepTop}>
            <View style={[s.line, index === 0 && s.lineHidden, reached(index - 1) && s.lineDone]} />
            <Marker state={step.state} />
            <View
              style={[
                s.line,
                index === steps.length - 1 && s.lineHidden,
                reached(index) && s.lineDone,
              ]}
            />
          </View>
          <Text
            style={[
              s.stepLabel,
              step.state === 'done' && s.labelDone,
              step.state === 'current' && s.labelCurrent,
              step.state === 'failed' && s.labelFailed,
            ]}
          >
            {step.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function ApprovalCard({ approval, donor }: { approval: Approval | null; donor: boolean }) {
  const action = donor ? 'criar doações' : 'reservar alimentos';
  const content = {
    PENDENTE: {
      icon: 'time-outline' as const,
      tint: colors.amber,
      background: colors.amberLight,
      title: 'Cadastro em análise',
      detail: `Assim que seu cadastro for aprovado, você poderá ${action}.`,
    },
    APROVADO: {
      icon: 'checkmark-circle-outline' as const,
      tint: colors.green,
      background: colors.greenLight,
      title: 'Cadastro aprovado',
      detail: `Tudo certo! Você já pode ${action}.`,
    },
    REJEITADO: {
      icon: 'close-circle-outline' as const,
      tint: colors.danger,
      background: colors.dangerLight,
      title: 'Cadastro não aprovado',
      detail: `Com esta conta não é possível ${action}.`,
    },
  };
  const info = approval
    ? content[approval]
    : {
        icon: 'help-circle-outline' as const,
        tint: colors.muted,
        background: colors.greenLight,
        title: 'Aprovação não informada',
        detail: 'O login não trouxe o estado do seu cadastro. Saia e entre novamente.',
      };
  return (
    <View style={s.card}>
      <View style={s.header}>
        <View style={[s.icon, { backgroundColor: info.background }]}>
          <Ionicons name={info.icon} size={30} color={info.tint} />
        </View>
        <View style={s.headerText}>
          <Text accessibilityRole="header" style={s.title}>
            {info.title}
          </Text>
          <Text style={s.detail}>{info.detail}</Text>
        </View>
      </View>
      {approval && <Steps steps={stepsFor(approval)} />}
      {approval === 'PENDENTE' && (
        <Text style={s.footnote}>Após a aprovação, saia e entre novamente.</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    padding: 18,
    gap: 18,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  icon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 3 },
  title: { fontFamily: fonts.display, fontSize: 19, color: colors.text },
  detail: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: colors.muted },
  steps: { flexDirection: 'row' },
  step: { flex: 1, alignItems: 'center', gap: 8 },
  stepTop: { flexDirection: 'row', alignItems: 'center' },
  line: { flex: 1, height: 2, backgroundColor: colors.border },
  lineDone: { backgroundColor: colors.green },
  lineHidden: { opacity: 0 },
  marker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDone: { backgroundColor: colors.green },
  markerFailed: { backgroundColor: colors.danger },
  markerRing: { borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface },
  markerCurrent: { borderColor: '#D9822B' },
  markerDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#D9822B' },
  stepLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.muted, textAlign: 'center' },
  labelDone: { color: colors.green },
  labelCurrent: { color: colors.amber },
  labelFailed: { color: colors.danger },
  footnote: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: colors.border,
    fontFamily: fonts.regular,
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.muted,
    textAlign: 'center',
  },
});
