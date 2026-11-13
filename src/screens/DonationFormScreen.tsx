import { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParams } from '../navigation/types';
import type { Category } from '../types/api';
import { donationService } from '../services/backend';
import { errorMessage } from '../services/http';
import { useAction } from '../hooks/useAction';
import { useAuth } from '../auth/AuthContext';
import {
  Body,
  Button,
  Field,
  FoodPhoto,
  Heading,
  Loading,
  Notice,
  Screen,
  Toggle,
} from '../components/ui';
import { ItemEditor, itemPayload, newItem, type ItemDraft } from '../components/ItemEditor';
import { checkWindow, editDate, localDateTime, publicPhoto, required } from '../validation/forms';

export function DonationFormScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParams, 'Create' | 'Edit'>) {
  const id = route.name === 'Edit' ? route.params?.id : undefined;
  const { session } = useAuth();
  const action = useAction();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    inicio: '',
    fim: '',
    instrucoes: '',
    foto: '',
  });
  const [cold, setCold] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [items, setItems] = useState<ItemDraft[]>([newItem()]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    void (async () => {
      try {
        const [cats, donation] = await Promise.all([
          donationService.categories(controller.signal),
          id ? donationService.get(id, controller.signal) : Promise.resolve(null),
        ]);
        if (controller.signal.aborted) return;
        setCategories(cats);
        if (!cats.length)
          throw new Error(
            'Nenhuma categoria cadastrada. Solicite a configuração ao administrador.',
          );
        if (donation) {
          if (!['RASCUNHO', 'DISPONIVEL'].includes(donation.status))
            throw new Error('Esta doação não pode mais ser editada.');
          setForm({
            titulo: donation.titulo,
            descricao: donation.descricao || '',
            inicio: editDate(donation.janelaInicio),
            fim: editDate(donation.janelaFim),
            instrucoes: donation.instrucoesRetirada || '',
            foto: donation.fotoUrl || '',
          });
          setCold(donation.requerRefrigeracao);
          setItems(
            donation.itens.map((item) => {
              const matches = cats.filter((c) => c.nome === item.categoria);
              return {
                key: String(item.id),
                category: matches.length === 1 ? String(matches[0]!.id) : '',
                description: item.descricao,
                quantity: String(item.quantidade),
                unit: item.unidade,
                weight: item.pesoEstimadoKg === null ? '' : String(item.pesoEstimadoKg),
                expiry: item.dataValidade ? item.dataValidade.split('-').reverse().join('/') : '',
                prepared: '',
              };
            }),
          );
        }
      } catch (e) {
        if (!controller.signal.aborted) setLoadError(errorMessage(e));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [id, attempt]);
  const change = (key: keyof typeof form, text: string) => setForm({ ...form, [key]: text });
  const submit = () =>
    action.run(async () => {
      if (id && !reviewed)
        throw new Error('Confirme a revisão dos dados de preparo e do endereço de retirada.');
      const start = localDateTime(form.inicio);
      const end = localDateTime(form.fim);
      checkWindow(start, end);
      const body = {
        titulo: required(form.titulo, 'título'),
        descricao: form.descricao.trim(),
        janelaInicio: start,
        janelaFim: end,
        requerRefrigeracao: cold,
        instrucoesRetirada: form.instrucoes.trim(),
        fotoUrl: publicPhoto(form.foto),
        enderecoRetiradaId: null,
        itens: items.map(itemPayload),
      };
      if (!body.itens.length) throw new Error('Adicione pelo menos um alimento.');
      const result = id
        ? await donationService.update(id, body)
        : await donationService.create(body);
      navigation.replace('Details', { id: result.id, owned: true });
    });
  if (loading)
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  if (loadError)
    return (
      <Screen>
        <Notice error message={loadError} />
        <Button title="Tentar novamente" onPress={() => setAttempt(attempt + 1)} />
      </Screen>
    );
  return (
    <Screen>
      <Heading
        title={id ? 'Editar doação' : 'Um novo destino'}
        subtitle={
          id
            ? 'Revise os alimentos e as condições de retirada.'
            : 'Sua doação será salva como rascunho. Você decide quando publicar.'
        }
      />
      {session?.aprovacao !== 'APROVADO' && !id && (
        <Notice message="A criação de doações depende de aprovação administrativa." />
      )}
      <Field
        label="Título *"
        maxLength={150}
        value={form.titulo}
        onChangeText={(t) => change('titulo', t)}
      />
      <Field
        label="Descrição"
        multiline
        value={form.descricao}
        onChangeText={(t) => change('descricao', t)}
      />
      <Field
        label="Início da retirada *"
        hint="Horário local do seu dispositivo. Formato DD/MM/AAAA HH:mm."
        placeholder="DD/MM/AAAA HH:mm"
        maxLength={16}
        value={form.inicio}
        onChangeText={(t) => change('inicio', t)}
      />
      <Field
        label="Fim da retirada *"
        placeholder="DD/MM/AAAA HH:mm"
        maxLength={16}
        value={form.fim}
        onChangeText={(t) => change('fim', t)}
      />
      <Toggle label="Exige refrigeração" value={cold} onChange={setCold} />
      <Field
        label="Instruções de retirada"
        maxLength={500}
        multiline
        value={form.instrucoes}
        onChangeText={(t) => change('instrucoes', t)}
      />
      <Body>
        A retirada usará o endereço do seu cadastro. Inclua nas instruções as orientações
        necessárias para chegar ao local.
      </Body>
      <Field
        label="URL pública da foto (opcional)"
        hint="Informe uma URL HTTP ou HTTPS. Não há upload de imagens."
        autoCapitalize="none"
        maxLength={500}
        value={form.foto}
        onChangeText={(t) => change('foto', t)}
      />
      <FoodPhoto key={form.foto} uri={form.foto} />
      <Heading title="Alimentos" subtitle="Use quantidades e informações de conservação reais." />
      {items.map((item, index) => (
        <ItemEditor
          key={item.key}
          item={item}
          index={index}
          categories={categories}
          onChange={(next) => setItems(items.map((i) => (i.key === next.key ? next : i)))}
          onRemove={
            items.length > 1 ? () => setItems(items.filter((i) => i.key !== item.key)) : undefined
          }
        />
      ))}
      <Button
        title="Adicionar alimento"
        secondary
        onPress={() => setItems([...items, newItem()])}
      />
      {!!id && (
        <>
          <Notice message="A API não devolve o horário de preparo nem o endereço completo desta doação. Informe novamente o preparo, se aplicável; em branco, ele será removido. Ao salvar, a retirada usará o endereço do seu cadastro." />
          <Toggle
            label="Revisei o preparo de cada item e confirmo a retirada no endereço do cadastro"
            value={reviewed}
            onChange={setReviewed}
          />
        </>
      )}
      <Notice error message={action.error} />
      <Button
        title={id ? 'Salvar alterações' : 'Salvar rascunho'}
        busy={action.busy}
        disabled={!!id ? !reviewed : session?.aprovacao !== 'APROVADO'}
        onPress={() => void submit()}
      />
    </Screen>
  );
}
