import { useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParams } from '../navigation/types';
import type { Donation, Reservation } from '../types/api';
import { donationService, reservationService } from '../services/backend';
import { errorMessage } from '../services/http';
import { useAuth } from '../auth/AuthContext';
import { useAction } from '../hooks/useAction';
import {
  Badge,
  Body,
  Button,
  Card,
  FoodPhoto,
  Heading,
  Loading,
  Notice,
  Screen,
  styles,
} from '../components/ui';
import { displayDate } from '../validation/forms';
export function DonationDetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParams, 'Details'>) {
  const { session } = useAuth();
  const action = useAction();
  const focused = useIsFocused();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!focused) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    void donationService
      .get(route.params.id, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setDonation(result);
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted) setError(errorMessage(e));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [route.params.id, attempt, focused]);
  const owned = session?.papel === 'DOADOR' && route.params.owned;
  if (loading)
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  if (error || !donation)
    return (
      <Screen>
        <Notice error message={error || 'Doação não encontrada.'} />
        <Button title="Tentar novamente" onPress={() => setAttempt(attempt + 1)} />
      </Screen>
    );
  const d = donation;
  return (
    <Screen>
      <FoodPhoto key={d.fotoUrl} uri={d.fotoUrl} />
      <Badge value={d.status} />
      <Heading title={d.titulo} subtitle={`${d.doador} • ${d.cidade}`} />
      {!!d.descricao && <Body>{d.descricao}</Body>}
      <Card>
        <Text style={styles.sectionTitle}>Retirada combinada</Text>
        <Body>
          De {displayDate(d.janelaInicio)} até {displayDate(d.janelaFim)}
        </Body>
        <Body>
          {d.requerRefrigeracao
            ? 'Exige refrigeração durante transporte e armazenamento.'
            : 'Sem exigência de refrigeração informada.'}
        </Body>
        <Body>{d.instrucoesRetirada || 'O doador não informou instruções de retirada.'}</Body>
        <Body>A API informa a cidade; o endereço completo não está disponível nesta consulta.</Body>
      </Card>
      <Card>
        <Text style={styles.sectionTitle}>O que está incluído</Text>
        {d.itens.map((i) => (
          <Body key={i.id}>
            {i.quantidade} {i.unidade} — {i.descricao}\n{i.categoria}
            {i.pesoEstimadoKg !== null ? ` • ${i.pesoEstimadoKg} kg estimados` : ''}
            {i.dataValidade ? `\nValidade: ${i.dataValidade.split('-').reverse().join('/')}` : ''}
          </Body>
        ))}
      </Card>
      <Notice error message={action.error} />
      {owned && (
        <>
          {['RASCUNHO', 'DISPONIVEL'].includes(d.status) && (
            <Button
              title="Editar doação"
              disabled={action.busy}
              secondary
              onPress={() => navigation.navigate('Edit', { id: d.id })}
            />
          )}
          {d.status === 'RASCUNHO' && (
            <Button
              title="Publicar doação"
              busy={action.busy}
              onPress={() =>
                void action.run(async () => {
                  setDonation(await donationService.publish(d.id));
                })
              }
            />
          )}
          {['RASCUNHO', 'DISPONIVEL', 'RESERVADA'].includes(d.status) && (
            <Button
              title="Cancelar doação"
              danger
              disabled={action.busy}
              onPress={() =>
                Alert.alert(
                  'Cancelar doação?',
                  'A doação ficará cancelada e seu registro será preservado. Esta ação não apaga os dados.',
                  [
                    { text: 'Manter doação', style: 'cancel' },
                    {
                      text: 'Cancelar doação',
                      style: 'destructive',
                      onPress: () =>
                        void action.run(async () => {
                          await donationService.cancel(d.id);
                          setDonation({ ...d, status: 'CANCELADA' });
                        }),
                    },
                  ],
                )
              }
            />
          )}
          {d.status === 'RESERVADA' && (
            <Button title="Confirmar retirada" onPress={() => navigation.navigate('Pickup')} />
          )}
        </>
      )}
      {session?.papel === 'RECEPTOR' && d.status === 'DISPONIVEL' && (
        <>
          <Notice
            message={
              session.aprovacao !== 'APROVADO'
                ? 'Seu cadastro precisa ser aprovado antes de reservar.'
                : 'Reserve somente se puder retirar dentro da janela e atender às condições de conservação.'
            }
          />
          <Button
            title="Reservar doação"
            busy={action.busy}
            disabled={
              session.aprovacao !== 'APROVADO' ||
              Date.now() < Date.parse(d.janelaInicio) ||
              Date.now() > Date.parse(d.janelaFim)
            }
            onPress={() =>
              void action.run(async () => {
                const result = await reservationService.create(d.id);
                setReservation(result);
                setDonation({ ...d, status: 'RESERVADA' });
              })
            }
          />
        </>
      )}
      {reservation && (
        <Card>
          <Heading title="Reserva confirmada" />
          <Body>
            {`Reserva #${reservation.id}\nCódigo: ${reservation.codigoRetirada}\nRetire até ${displayDate(reservation.expiraEm)}.`}
          </Body>
          <Body>
            Apresente o ID e o código ao doador. Você também encontra esses dados em Minhas
            reservas.
          </Body>
        </Card>
      )}
    </Screen>
  );
}
