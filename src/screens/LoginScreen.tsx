import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParams } from '../navigation/types';
import { useAuth } from '../auth/AuthContext';
import { useAction } from '../hooks/useAction';
import { Body, Button, Field, Heading, Notice, Screen } from '../components/ui';
import { emailValue, required } from '../validation/forms';
import { colors, fonts } from '../theme';

export function LoginScreen({ navigation }: NativeStackScreenProps<AuthStackParams, 'Login'>) {
  const auth = useAuth();
  const action = useAction();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const submit = () =>
    action.run(async () => {
      required(password, 'senha');
      await auth.login(emailValue(email), password);
    });
  return (
    <Screen>
      <View style={s.hero}>
        <View style={s.mark}>
          <Ionicons name="leaf" size={42} color={colors.green} />
        </View>
        <Text style={s.brand}>
          SobraBoa<Text style={{ color: colors.lime }}>.</Text>
        </Text>
        <Text style={s.tagline}>Bom para compartilhar.\nMelhor para transformar.</Text>
        <View style={s.pill}>
          <Text style={s.pillText}>ALIMENTO • COMUNIDADE • CUIDADO</Text>
        </View>
      </View>
      <Heading
        title="Que bom ter você aqui"
        subtitle="Entre para fazer parte dessa rede de cuidado."
      />
      <Notice message={auth.notice} />
      <Notice error message={action.error} />
      <Field
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <Field
        label="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        onSubmitEditing={() => void submit()}
      />
      <Button title="Entrar" busy={action.busy} onPress={() => void submit()} />
      <Button
        title="Quero fazer parte"
        secondary
        disabled={action.busy}
        onPress={() => navigation.navigate('Register')}
      />
      <Body>Conectamos quem tem alimentos para doar a quem cuida da comunidade.</Body>
    </Screen>
  );
}
const s = StyleSheet.create({
  hero: { backgroundColor: colors.green, padding: 28, borderRadius: 28, gap: 18 },
  mark: { backgroundColor: colors.lime, borderRadius: 20, padding: 14, alignSelf: 'flex-start' },
  brand: { color: colors.surface, fontFamily: fonts.display, fontSize: 42 },
  tagline: { color: colors.surface, fontFamily: fonts.regular, fontSize: 19, lineHeight: 28 },
  pill: { borderTopWidth: 1, borderColor: '#548370', paddingTop: 16 },
  pillText: { color: colors.lime, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.5 },
});
