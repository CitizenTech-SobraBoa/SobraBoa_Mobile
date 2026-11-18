import { useCallback, useState } from 'react';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParams } from '../navigation/types';
import { donationService } from '../services/backend';
import { usePaged } from '../hooks/usePaged';
import { useAction } from '../hooks/useAction';
import { Body, Button, Empty, Field, Heading, Loading, Notice, Screen } from '../components/ui';
import { DonationCard } from '../components/DonationCard';
import { Pagination } from '../components/Pagination';
import { numeric } from '../validation/forms';
export function ExploreScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [radius, setRadius] = useState('5');
  const [query, setQuery] = useState<{ lat: number; lng: number; radius: number } | null>(null);
  const action = useAction();
  return (
    <Screen>
      <Heading
        title="Perto de você"
        subtitle="Encontre alimentos disponíveis para retirada agora."
      />
      <Button
        secondary
        title="Usar minha localização"
        busy={action.busy}
        onPress={() =>
          void action.run(async () => {
            const permission = await Location.requestForegroundPermissionsAsync();
            if (permission.status !== 'granted')
              throw new Error('Permissão negada. Digite latitude e longitude abaixo para buscar.');
            const { coords } = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            setLat(String(coords.latitude));
            setLng(String(coords.longitude));
          })
        }
      />
      <Field
        label="Latitude"
        hint="Entre -90 e 90. Exemplo: -23.5505 (São Paulo)."
        placeholder="Ex.: -23.5505"
        keyboardType="numbers-and-punctuation"
        value={lat}
        onChangeText={setLat}
      />
      <Field
        label="Longitude"
        hint="Entre -180 e 180. Exemplo: -46.6333 (São Paulo)."
        placeholder="Ex.: -46.6333"
        keyboardType="numbers-and-punctuation"
        value={lng}
        onChangeText={setLng}
      />
      <Field
        label="Raio em quilômetros"
        placeholder="Ex.: 5"
        hint="Maior que zero e até 50 km."
        keyboardType="decimal-pad"
        value={radius}
        onChangeText={setRadius}
      />
      <Notice error message={action.error} />
      <Button
        title="Buscar doações"
        busy={action.busy}
        onPress={() =>
          void action.run(async () => {
            setQuery({
              lat: numeric(lat, 'Latitude', -90, 90),
              lng: numeric(lng, 'Longitude', -180, 180),
              radius: numeric(radius, 'Raio', 0.001, 50),
            });
          })
        }
      />
      {query ? (
        <Results
          query={query}
          onDetail={(id) => navigation.navigate('Details', { id, owned: false })}
        />
      ) : (
        <Body>
          Use sua localização ou informe coordenadas manualmente. Nenhuma localização é presumida.
        </Body>
      )}
    </Screen>
  );
}
function Results({
  query,
  onDetail,
}: {
  query: { lat: number; lng: number; radius: number };
  onDetail: (id: number) => void;
}) {
  const fetch = useCallback(
    (page: number, signal: AbortSignal) =>
      donationService.nearby(query.lat, query.lng, query.radius, page, signal),
    [query],
  );
  const list = usePaged(fetch);
  return (
    <>
      <Notice error message={list.error} />
      {list.error ? (
        <Button title="Tentar busca novamente" secondary onPress={() => void list.load()} />
      ) : null}
      {list.busy && <Loading />}
      {!list.busy && !list.error && list.data?.content.length === 0 && (
        <Empty
          icon="location-outline"
          title="Nenhuma doação por aqui agora"
          detail="Tente aumentar o raio ou buscar mais tarde. A busca mostra apenas doações com a janela de retirada aberta."
        />
      )}
      {list.data?.content.map((d) => (
        <DonationCard key={d.id} donation={d} onPress={() => onDetail(d.id)} />
      ))}
      {list.data && (
        <Pagination
          page={list.data.page.number}
          totalPages={list.data.page.totalPages}
          busy={list.busy}
          onPage={(n) => void list.load(n)}
        />
      )}
    </>
  );
}
