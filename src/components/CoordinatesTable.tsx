import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

const PLACES = [
  { city: 'São Paulo (Praça da Sé)', latitude: '-23.5505', longitude: '-46.6333' },
  { city: 'Rio de Janeiro', latitude: '-22.9068', longitude: '-43.1729' },
  { city: 'Porto Alegre', latitude: '-30.0346', longitude: '-51.2177' },
];

export function CoordinatesTable() {
  return (
    <View accessibilityLabel="Coordenadas de exemplo" style={styles.table}>
      <View style={[styles.row, styles.header]}>
        <Text style={[styles.city, styles.headerText]}>Cidade</Text>
        <Text style={[styles.value, styles.headerText]}>Latitude</Text>
        <Text style={[styles.value, styles.headerText]}>Longitude</Text>
      </View>
      {PLACES.map((place, index) => (
        <View key={place.city} style={[styles.row, index > 0 && styles.divider]}>
          <Text style={[styles.city, styles.cell]}>{place.city}</Text>
          <Text selectable style={[styles.value, styles.cell]}>
            {place.latitude}
          </Text>
          <Text selectable style={[styles.value, styles.cell]}>
            {place.longitude}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  header: { backgroundColor: colors.greenLight },
  divider: { borderTopWidth: 1, borderColor: colors.border },
  city: { flex: 1.5 },
  value: { flex: 1, textAlign: 'right' },
  headerText: { fontFamily: fonts.bold, fontSize: 13, color: colors.text },
  cell: { fontFamily: fonts.regular, fontSize: 13, color: colors.text },
});
