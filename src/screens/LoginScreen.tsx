import { useState } from 'react';
import { Image, StyleSheet, useWindowDimensions } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParams } from '../navigation/types';
import { useAuth } from '../auth/AuthContext';
import { useAction } from '../hooks/useAction';
import { Button, Field, Heading, Notice, Screen } from '../components/ui';
import { emailValue, required } from '../validation/forms';

const BANNER_RATIO = 1000 / 857;
const PAGE_PADDING = 22;

export function LoginScreen({ navigation }: NativeStackScreenProps<AuthStackParams, 'Login'>) {
  const { width } = useWindowDimensions();
  const bannerWidth = width - PAGE_PADDING * 2;
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
      <Image
        accessible
        accessibilityRole="image"
        accessibilityLabel="SobraBoa. Pequenos gestos. Grandes mudanças. Conecte alimentos a quem precisa."
        source={require('../../assets/images/login-banner.jpg')}
        resizeMode="cover"
        style={[s.banner, { width: bannerWidth, height: bannerWidth / BANNER_RATIO }]}
      />
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
        title="Cadastre-se"
        secondary
        disabled={action.busy}
        onPress={() => navigation.navigate('Register')}
      />
    </Screen>
  );
}
const s = StyleSheet.create({
  banner: { borderRadius: 26 },
});
