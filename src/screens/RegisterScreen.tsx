import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParams } from '../navigation/types';
import {
  Body,
  Button,
  Card,
  Choices,
  Field,
  Heading,
  Notice,
  Screen,
  Toggle,
} from '../components/ui';
import { AddressForm, addressPayload, emptyAddress } from '../components/AddressForm';
import { useAction } from '../hooks/useAction';
import { authService } from '../services/backend';
import { emailValue, numeric, required } from '../validation/forms';

export function RegisterScreen({
  navigation,
}: NativeStackScreenProps<AuthStackParams, 'Register'>) {
  const [role, setRole] = useState<'DOADOR' | 'RECEPTOR'>('DOADOR');
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    organization: '',
    razaoSocial: '',
    cnpj: '',
    tipo: '',
    pessoas: '',
    horario: '',
  });
  const [address, setAddress] = useState(emptyAddress);
  const [cold, setCold] = useState(false);
  const [terms, setTerms] = useState(false);
  const [success, setSuccess] = useState('');
  const action = useAction();
  const change = (key: keyof typeof form, text: string) => setForm({ ...form, [key]: text });
  const submit = () =>
    action.run(async () => {
      if (form.senha.length < 8) throw new Error('A senha deve ter pelo menos 8 caracteres.');
      if (form.cnpj && !/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/.test(form.cnpj))
        throw new Error('CNPJ inválido.');
      if (!terms) throw new Error('Aceite os termos de responsabilidade para continuar.');
      const base = {
        nome: required(form.nome, 'nome'),
        email: emailValue(form.email),
        telefone: form.telefone.trim(),
        senha: form.senha,
        cnpj: form.cnpj || null,
        endereco: addressPayload(address),
        aceitouTermos: terms,
      };
      const organization = required(
        form.organization,
        role === 'DOADOR' ? 'nome fantasia' : 'nome da organização',
      );
      const people = form.pessoas
        ? numeric(form.pessoas, 'Pessoas atendidas', 0, 2147483647)
        : null;
      if (people !== null && !Number.isInteger(people))
        throw new Error('Pessoas atendidas deve ser um número inteiro.');
      const result =
        role === 'DOADOR'
          ? await authService.registerDonor({
              ...base,
              nomeFantasia: organization,
              razaoSocial: form.razaoSocial,
              tipoEstabelecimento: form.tipo,
            })
          : await authService.registerReceiver({
              ...base,
              nomeOrganizacao: organization,
              tipo: form.tipo,
              pessoasAtendidas: people,
              possuiRefrigeracao: cold,
              horarioFuncionamento: form.horario,
            });
      setForm({ ...form, senha: '' });
      setSuccess(result.mensagem);
    });
  if (success)
    return (
      <Screen>
        <Heading title="Você já faz parte" subtitle={success} />
        <Body>Após a análise administrativa, entre novamente para consultar sua aprovação.</Body>
        <Button title="Ir para o login" onPress={() => navigation.replace('Login')} />
      </Screen>
    );
  return (
    <Screen>
      <Heading
        eyebrow="VAMOS SOMAR"
        title="Crie sua conta"
        subtitle="Preencha os dados da sua organização. Campos com * são obrigatórios."
      />
      <Choices
        label="Como você quer participar?"
        value={role}
        onChange={setRole}
        options={[
          { value: 'DOADOR', label: 'Quero doar' },
          { value: 'RECEPTOR', label: 'Quero receber' },
        ]}
      />
      <Card>
        <Field
          label="Nome do responsável *"
          maxLength={150}
          value={form.nome}
          onChangeText={(t) => change('nome', t)}
        />
        <Field
          label="E-mail *"
          maxLength={255}
          autoCapitalize="none"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(t) => change('email', t)}
        />
        <Field
          label="Telefone"
          maxLength={20}
          keyboardType="phone-pad"
          value={form.telefone}
          onChangeText={(t) => change('telefone', t)}
        />
        <Field
          label="Senha *"
          hint="Pelo menos 8 caracteres."
          secureTextEntry
          autoCapitalize="none"
          value={form.senha}
          onChangeText={(t) => change('senha', t)}
        />
      </Card>
      <Card>
        <Field
          label={role === 'DOADOR' ? 'Nome fantasia *' : 'Nome da organização *'}
          maxLength={200}
          value={form.organization}
          onChangeText={(t) => change('organization', t)}
        />
        {role === 'DOADOR' && (
          <Field
            label="Razão social"
            maxLength={200}
            value={form.razaoSocial}
            onChangeText={(t) => change('razaoSocial', t)}
          />
        )}
        <Field
          label="CNPJ (opcional)"
          maxLength={18}
          value={form.cnpj}
          onChangeText={(t) => change('cnpj', t)}
        />
        <Field
          label={role === 'DOADOR' ? 'Tipo de estabelecimento' : 'Tipo de organização'}
          maxLength={60}
          value={form.tipo}
          onChangeText={(t) => change('tipo', t)}
        />
        {role === 'RECEPTOR' && (
          <>
            <Field
              label="Pessoas atendidas"
              keyboardType="number-pad"
              value={form.pessoas}
              onChangeText={(t) => change('pessoas', t)}
            />
            <Field
              label="Horário de funcionamento"
              maxLength={200}
              value={form.horario}
              onChangeText={(t) => change('horario', t)}
            />
            <Toggle
              label="Possui refrigeração para conservar alimentos"
              value={cold}
              onChange={setCold}
            />
          </>
        )}
      </Card>
      <Heading
        title="Endereço"
        subtitle="Usado na busca por proximidade e como local de retirada do doador."
      />
      <AddressForm value={address} onChange={setAddress} />
      <Card>
        <Body>
          Termos de responsabilidade: declaro que os dados são verdadeiros e assumo o compromisso de
          informar e respeitar as condições de conservação, validade e retirada dos alimentos. O
          cadastro passará por análise administrativa.
        </Body>
        <Toggle
          label="Li e aceito os termos de responsabilidade *"
          value={terms}
          onChange={setTerms}
        />
      </Card>
      <Notice error message={action.error} />
      <Button title="Enviar cadastro" busy={action.busy} onPress={() => void submit()} />
    </Screen>
  );
}
