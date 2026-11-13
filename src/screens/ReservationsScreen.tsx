import { Alert, Text } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParams } from '../navigation/types';
import type { Reservation } from '../types/api';
import { reservationService } from '../services/backend';
import { usePaged } from '../hooks/usePaged';
import { useAction } from '../hooks/useAction';
import {
  Badge,
  Body,
  Button,
  Card,
  Empty,
  Field,
  Heading,
  Loading,
  Notice,
  Screen,
  styles,
} from '../components/ui';
import { Pagination } from '../components/Pagination';
import { displayDate } from '../validation/forms';
export function ReservationsScreen() {
  const list = usePaged(reservationService.mine);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  return (
    <Screen>
      <Heading
        title="Minhas reservas"
        subtitle="Da retirada ao recebimento, acompanhe tudo por aqui."
      />
      <Notice error message={list.error} />
      <Button
        title="Atualizar reservas"
        secondary
        busy={list.busy}
        onPress={() => void list.load()}
      />
      {list.busy && <Loading />}
      {!list.busy && !list.error && list.data?.content.length === 0 && (
        <Empty
          icon="bag-handle-outline"
          title="Ainda não há reservas"
          detail="Explore doações próximas e reserve alimentos para sua organização."
        />
      )}
      {list.data?.content.map((r) => (
        <ReservationCard
          key={`${r.id}-${r.status}`}
          reservation={r}
          reload={() => list.load(list.data?.page.number || 0)}
          detail={() => navigation.navigate('Details', { id: r.doacaoId, owned: false })}
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
function ReservationCard({
  reservation: r,
  reload,
  detail,
}: {
  reservation: Reservation;
  reload: () => Promise<void>;
  detail: () => void;
}) {
  const action = useAction();
  const [reason, setReason] = useState('');
  return (
    <Card>
      <Badge value={r.status} />
      <Text style={styles.sectionTitle}>{r.tituloDoacao}</Text>
      <Body>
        Reserva #{r.id} • Doação #{r.doacaoId}
      </Body>
      {r.status === 'ATIVA' && (
        <>
          <Text selectable style={styles.title}>
            {r.codigoRetirada}
          </Text>
          <Body>
            Apresente o ID da reserva e este código ao doador. Retire até {displayDate(r.expiraEm)}.
          </Body>
          <Field
            label="Motivo do cancelamento (opcional)"
            maxLength={300}
            value={reason}
            onChangeText={setReason}
          />
          <Button
            title="Cancelar reserva"
            secondary
            busy={action.busy}
            onPress={() =>
              Alert.alert(
                'Cancelar reserva?',
                'A doação poderá voltar a ficar disponível para outras organizações.',
                [
                  { text: 'Manter', style: 'cancel' },
                  {
                    text: 'Cancelar reserva',
                    style: 'destructive',
                    onPress: () =>
                      void action.run(async () => {
                        await reservationService.cancel(r.id, reason);
                        await reload();
                      }),
                  },
                ],
              )
            }
          />
        </>
      )}
      {r.status === 'RETIRADA' && (
        <Button
          title="Confirmar recebimento"
          busy={action.busy}
          onPress={() =>
            Alert.alert('Confirmar recebimento?', 'Confirme somente após receber os alimentos.', [
              { text: 'Voltar', style: 'cancel' },
              {
                text: 'Recebi os alimentos',
                onPress: () =>
                  void action.run(async () => {
                    await reservationService.receive(r.id);
                    await reload();
                  }),
              },
            ])
          }
        />
      )}
      {r.status === 'CONCLUIDA' && <Body>Recebimento confirmado. Obrigado por fazer parte!</Body>}
      <Notice error message={action.error} />
      <Button title="Ver doação" secondary onPress={detail} />
    </Card>
  );
}
