import { useState } from 'react';
import { useAction } from '../hooks/useAction';
import { reservationService } from '../services/backend';
import { Body, Button, Field, Heading, Notice, Screen } from '../components/ui';
import { numeric, required } from '../validation/forms';
import type { Reservation } from '../types/api';
export function PickupScreen() {
  const [id, setId] = useState('');
  const [code, setCode] = useState('');
  const [result, setResult] = useState<Reservation | null>(null);
  const action = useAction();
  return (
    <Screen>
      <Heading
        title="Confirmar retirada"
        subtitle="Confira os dados na tela Minhas reservas do receptor antes de entregar os alimentos."
      />
      <Body>Peça o ID da reserva e o código de retirada exibidos no aplicativo do receptor.</Body>
      <Field
        label="ID da reserva"
        keyboardType="number-pad"
        value={id}
        onChangeText={setId}
        editable={!result}
      />
      <Field
        label="Código de retirada"
        autoCapitalize="characters"
        maxLength={6}
        value={code}
        onChangeText={setCode}
        editable={!result}
      />
      <Notice error message={action.error} />
      <Notice
        message={
          result
            ? `Retirada confirmada para ${result.tituloDoacao}. O receptor já pode confirmar o recebimento.`
            : ''
        }
      />
      {!result ? (
        <Button
          title="Confirmar entrega dos alimentos"
          busy={action.busy}
          onPress={() =>
            void action.run(async () => {
              const reservaId = numeric(id, 'ID da reserva', 1, Number.MAX_SAFE_INTEGER);
              if (!Number.isSafeInteger(reservaId)) throw new Error('O ID deve ser inteiro.');
              const codigo = required(code, 'código');
              if (!/^[A-Z2-9]{6}$/i.test(codigo))
                throw new Error('Informe o código de 6 caracteres exibido ao receptor.');
              setResult(await reservationService.pickup(reservaId, codigo));
            })
          }
        />
      ) : (
        <Button
          title="Confirmar outra retirada"
          secondary
          onPress={() => {
            setResult(null);
            setId('');
            setCode('');
          }}
        />
      )}
    </Screen>
  );
}
