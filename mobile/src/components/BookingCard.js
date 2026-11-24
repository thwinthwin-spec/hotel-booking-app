/**
 * Compact booking summary card for My Bookings and admin lists.
 * Usage: <BookingCard booking={booking} onPress={() => open(booking._id)} />
 */
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';
import { formatDate, formatCurrency, statusColor, statusLabel } from '../utils/formatters';

function nameOf(value, fallback) {
  if (!value) return fallback;
  return value.name || value.roomNumber || value.type || fallback;
}

export default function BookingCard({ booking, onPress }) {
  const hotelName = nameOf(booking.hotelId, 'Hotel');
  const roomName = nameOf(booking.roomId, 'Room');
  const total = booking.total || booking.totalAmount || booking.amount || 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.top}>
        <Text style={styles.hotel} numberOfLines={1}>
          🏨 {hotelName}
        </Text>
        <View style={[styles.pill, { backgroundColor: statusColor(booking.status) }]}>
          <Text style={styles.pillText}>{statusLabel(booking.status)}</Text>
        </View>
      </View>
      <Text style={styles.room}>🛏️ {roomName}</Text>
      <View style={styles.row}>
        <Text style={styles.date}>{formatDate(booking.checkIn)}</Text>
        <Text style={styles.arrow}>→</Text>
        <Text style={styles.date}>{formatDate(booking.checkOut)}</Text>
      </View>
      <View style={styles.bottom}>
        <Text style={styles.id}>#{String(booking._id || '').slice(-6).toUpperCase()}</Text>
        <Text style={styles.total}>{formatCurrency(total)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hotel: { fontSize: 15, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: 8 },
  pill: { borderRadius: 12, paddingVertical: 3, paddingHorizontal: 9 },
  pillText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  room: { fontSize: 13, color: COLORS.muted, marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  date: { fontSize: 12, color: COLORS.text },
  arrow: { color: COLORS.muted, marginHorizontal: 8 },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 10,
    paddingTop: 10,
  },
  id: { fontSize: 11, color: COLORS.muted },
  total: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
});
