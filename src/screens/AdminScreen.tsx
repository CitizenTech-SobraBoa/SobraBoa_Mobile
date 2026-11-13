import { useCallback, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import type { PendingRegistration } from '../types/api';
import { useAuth } from '../auth/AuthContext';
import { adminService, type RegistrationKind } from '../services/backend';
import { useAction } from '../hooks/useAction';
import { usePaged } from '../hooks/usePaged';
import {
  Body,
  Button,
  Card,
  Choices,
  Empty,
  Heading,
  Loading,
  Notice,
  Screen,
  styles,
} from '../components/ui';
import { ImpactMetrics } from '../components/ImpactMetrics';
import { Pagination } from '../components/Pagination';

const KINDS: { value: RegistrationKind; label: string }[] = [
  { value: 'doadores', label: 'Doadores' },
  { value: 'receptores', label: 'Receptores' },
];

export function AdminScreen() {
  const { session } = useAuth();
  const [kind, setKind] = useState<RegistrationKind>('doadores');
  const fetchPending = useCallback(
    (page: number, signal: AbortSignal) => adminService.pending(kind, page, signal),
    [kind],
  );
  const list = usePaged(fetchPending);
  return (
    <Screen>
      <Heading
        title={`Olá, ${session?.nome}`}
        subtitle="Aprove ou rejeite os cadastros que aguardam análise."
      />
      <ImpactMetrics />
      <Choices label="Cadastros pendentes" value={kind} options={KINDS} onChange={setKind} />
      <Notice error message={list.error} />
      <Button
        title="Atualizar lista"
        secondary
        busy={list.busy}
        onPress={() => void list.load(list.data?.page.number ?? 0)}
      />
      {list.busy && !list.data && <Loading />}
      {!list.busy && !list.error && list.data?.content.length === 0 && (
        <Empty
          icon="checkmark-done-outline"
          title="Nenhum cadastro pendente"
          detail="Quando alguém se cadastrar, a solicitação aparecerá aqui para sua análise."
        />
      )}
      {list.data?.content.map((registration) => (
        <PendingCard
          key={`${kind}-${registration.usuarioId}`}
          kind={kind}
          registration={registration}
          reload={() => list.load(list.data?.page.number ?? 0)}
        />
      ))}
      {list.data && (
        <Pagination
          page={list.data.page.number}
          totalPages={list.data.page.totalPages}
          busy={list.busy}
          onPage={(n) => void list.load(n)}
        />
      )}
    </Screen>
  );
}

function PendingCard({
  kind,
  registration: r,
  reload,
}: {
  kind: RegistrationKind;
  registration: PendingRegistration;
  reload: () => Promise<void>;
}) {
  const action = useAction();
  const decide = (approve: boolean) =>
    Alert.alert(
      approve ? 'Aprovar cadastro?' : 'Rejeitar cadastro?',
      approve
        ? `${r.nome} poderá ${kind === 'doadores' ? 'publicar doações' : 'reservar doações'}.`
        : `${r.nome} não poderá usar as funções de ${kind === 'doadores' ? 'doação' : 'reserva'}.`,
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: approve ? 'Aprovar' : 'Rejeitar',
          style: approve ? 'default' : 'destructive',
          onPress: () =>
            void action.run(async () => {
              await adminService.decide(kind, r.usuarioId, approve);
              await reload();
            }),
        },
      ],
    );
  return (
    <Card>
      <Text style={styles.sectionTitle}>{r.nome}</Text>
      <Body>{r.email}</Body>
      <Body>CNPJ: {r.cnpj ?? 'não informado'}</Body>
      <Body>Identificador do usuário: {r.usuarioId}</Body>
      <View style={{ gap: 10 }}>
        <Button title="Aprovar cadastro" busy={action.busy} onPress={() => decide(true)} />
        <Button
          title="Rejeitar cadastro"
          secondary
          disabled={action.busy}
          onPress={() => decide(false)}
        />
      </View>
      <Notice error message={action.error} />
    </Card>
  );
}
