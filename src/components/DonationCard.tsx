import { Text } from 'react-native';
import { Badge, Body, Button, Card, FoodPhoto, styles } from './ui';
import type { Donation } from '../types/api';
import { displayDate } from '../validation/forms';
export function DonationCard({ donation, onPress }: { donation: Donation; onPress: () => void }) {
  return (
    <Card>
      <FoodPhoto key={donation.fotoUrl} uri={donation.fotoUrl} />
      <Badge value={donation.status} />
      <Text style={styles.sectionTitle}>{donation.titulo}</Text>
      <Body>
        {donation.doador} • {donation.cidade}
      </Body>
      <Body>Retirada até {displayDate(donation.janelaFim)}</Body>
      {donation.requerRefrigeracao && <Body>Exige refrigeração</Body>}
      <Button secondary title="Ver detalhes" onPress={onPress} />
    </Card>
  );
}
