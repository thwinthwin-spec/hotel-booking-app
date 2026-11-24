/**
 * Hotel list card with image, name, city, rating, and starting price.
 * Usage: <HotelCard hotel={hotel} onPress={() => openHotel(hotel)} />
 */
import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

function imageSource(hotel) {
  const first = hotel.images && hotel.images[0];
  const uri = typeof first === 'string' ? first : first?.url || first?.uri;
  return uri ? { uri } : null;
}

export default function HotelCard({ hotel, onPress }) {
  const source = imageSource(hotel);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {source ? (
        <Image source={source} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>🏨</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {hotel.name || 'Unnamed hotel'}
        </Text>
        <Text style={styles.city}>📍 {hotel.city || 'Unknown city'}</Text>
        <View style={styles.footer}>
          <Text style={styles.rating}>⭐ {hotel.rating || hotel.averageRating || 'New'}</Text>
          <Text style={styles.price}>{formatCurrency(hotel.priceFrom || hotel.price || 0)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: { width: '100%', height: 130 },
  placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF3EF' },
  placeholderText: { fontSize: 42 },
  body: { padding: 12 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  city: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  rating: { fontSize: 13, color: COLORS.accent },
  price: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
});
