import { Field, Button, Notice } from './ui';
import { useAction } from '../hooks/useAction';
import * as Location from 'expo-location';
import { numeric, required } from '../validation/forms';
import type { Address } from '../types/api';
export interface AddressDraft {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  latitude: string;
  longitude: string;
}
export const emptyAddress: AddressDraft = {
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
  cep: '',
  latitude: '',
  longitude: '',
};
export function addressPayload(d: AddressDraft): Address {
  const uf = required(d.uf, 'UF').toUpperCase();
  if (!/^[A-Z]{2}$/.test(uf)) throw new Error('UF deve ter duas letras.');
  return {
    ...d,
    logradouro: required(d.logradouro, 'logradouro'),
    cidade: required(d.cidade, 'cidade'),
    uf,
    latitude: numeric(d.latitude, 'Latitude', -90, 90),
    longitude: numeric(d.longitude, 'Longitude', -180, 180),
  };
}
export function AddressForm({
  value,
  onChange,
}: {
  value: AddressDraft;
  onChange: (v: AddressDraft) => void;
}) {
  const action = useAction();
  const change = (key: keyof AddressDraft, text: string) => onChange({ ...value, [key]: text });
  return (
    <>
      <Field
        label="Logradouro *"
        maxLength={200}
        value={value.logradouro}
        onChangeText={(t) => change('logradouro', t)}
      />
      <Field
        label="Número"
        maxLength={20}
        value={value.numero}
        onChangeText={(t) => change('numero', t)}
      />
      <Field
        label="Complemento"
        maxLength={100}
        value={value.complemento}
        onChangeText={(t) => change('complemento', t)}
      />
      <Field
        label="Bairro"
        maxLength={100}
        value={value.bairro}
        onChangeText={(t) => change('bairro', t)}
      />
      <Field
        label="Cidade *"
        maxLength={100}
        value={value.cidade}
        onChangeText={(t) => change('cidade', t)}
      />
      <Field
        label="UF *"
        maxLength={2}
        autoCapitalize="characters"
        value={value.uf}
        onChangeText={(t) => change('uf', t)}
      />
      <Field
        label="CEP"
        maxLength={9}
        keyboardType="numbers-and-punctuation"
        value={value.cep}
        onChangeText={(t) => change('cep', t)}
      />
      <Button
        title="Usar coordenadas da minha localização"
        secondary
        busy={action.busy}
        onPress={() =>
          void action.run(async () => {
            const permission = await Location.requestForegroundPermissionsAsync();
            if (permission.status !== 'granted')
              throw new Error(
                'Localização não permitida. Preencha latitude e longitude manualmente.',
              );
            const { coords } = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            onChange({
              ...value,
              latitude: String(coords.latitude),
              longitude: String(coords.longitude),
            });
          })
        }
      />
      <Notice error message={action.error} />
      <Field
        label="Latitude *"
        hint="Do endereço cadastrado, entre -90 e 90."
        value={value.latitude}
        onChangeText={(t) => change('latitude', t)}
        keyboardType="numbers-and-punctuation"
      />
      <Field
        label="Longitude *"
        hint="Entre -180 e 180. Você também pode digitar as coordenadas."
        value={value.longitude}
        onChangeText={(t) => change('longitude', t)}
        keyboardType="numbers-and-punctuation"
      />
    </>
  );
}
