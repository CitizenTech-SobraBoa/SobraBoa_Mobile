import { View } from 'react-native';
import { Body, Button } from './ui';
export function Pagination({
  page,
  totalPages,
  busy,
  onPage,
}: {
  page: number;
  totalPages: number;
  busy: boolean;
  onPage: (n: number) => void;
}) {
  if (totalPages < 2) return null;
  return (
    <View style={{ gap: 10 }}>
      <Body>
        Página {page + 1} de {totalPages}
      </Body>
      <Button
        secondary
        title="Página anterior"
        disabled={busy || page === 0}
        onPress={() => onPage(page - 1)}
      />
      <Button
        secondary
        title="Próxima página"
        disabled={busy || page >= totalPages - 1}
        onPress={() => onPage(page + 1)}
      />
    </View>
  );
}
