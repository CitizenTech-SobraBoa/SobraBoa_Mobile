import { useCallback, useState } from 'react';
import { Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { adminService } from '../services/backend';
import { errorMessage } from '../services/http';
import type { Metrics } from '../types/api';
import { Body, Card, Notice, styles } from './ui';

function decimal(value: number, digits: number) {
  return value.toFixed(digits).replace('.', ',');
}

export function ImpactMetrics() {
  const [data, setData] = useState<Metrics | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useFocusEffect(
    useCallback(() => {
      const request = new AbortController();
      setBusy(true);
      setError('');
      adminService
        .metrics(request.signal)
        .then((metrics) => {
          if (!request.signal.aborted) setData(metrics);
        })
        .catch((e: unknown) => {
          if (!request.signal.aborted) setError(errorMessage(e));
        })
        .finally(() => {
          if (!request.signal.aborted) setBusy(false);
        });
      return () => request.abort();
    }, []),
  );
  const statuses = data ? Object.entries(data.doacoesPorStatus) : [];
  return (
    <Card>
      <Text style={styles.sectionTitle}>Impacto da plataforma</Text>
      {busy && !data && <Body>Carregando indicadores…</Body>}
      <Notice error message={error} />
      {data && (
        <>
          <Body>{decimal(data.kgDoados, 2)} kg de alimentos com comprovante de doação</Body>
          <Body>
            {data.doadoresAprovados} doadores e {data.receptoresAprovados} receptores aprovados
          </Body>
          <Body>Taxa de aproveitamento: {decimal(data.taxaAproveitamento, 1)}%</Body>
          {statuses.length === 0 ? (
            <Body>Ainda não há doações registradas.</Body>
          ) : (
            <Body>
              Doações por status:{' '}
              {statuses.map(([status, total]) => `${status.toLowerCase()} ${total}`).join(' • ')}
            </Body>
          )}
        </>
      )}
    </Card>
  );
}
