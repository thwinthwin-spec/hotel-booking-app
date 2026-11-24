/**
 * Room card used in hotel detail and search results; highlights selection.
 * Usage: <RoomCard room={room} selected={id === room._id} onSelect={() => pick(room)} />
 */
import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

function firstImage(room) {
  const first = room.images && room.images[0];
  const uri = typeof first === 'string' ? first : first?.url || first?.uri;
  return uri ? { uri } : null;
}

export default function RoomCard({ room, onSelect, selected = false }) {
  const source = firstImage(room);
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selected]}
      onPress={() => onSelect && onSelect(room)}
      activeOpacity={0.85}
    >
      {source ? (
        <Image source={source} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>🛏️</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {room.roomNumber ? `${room.type || 'Room'} · ${room.roomNumber}` : room.type || 'Room'}
        </Text>
        <Text style={styles.meta}>👥 Up to {room.capacity || 2} guests</Text>
        <Text style={styles.price}>{formatCurrency(room.price || 0)} / night</Text>
      </View>
      {selected ? <View style={styles.check}><Text style={styles.checkText}>✓</Text></View> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    alignItems: 'center',
  },
  selected: { borderColor: COLORS.primary, borderWidth: 2 },
  image: { width: 90, height: 90 },
  placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF3EF' },
  placeholderText: { fontSize: 30 },
  body: { flex: 1, padding: 10 },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  meta: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  price: { fontSize: 13, fontWeight: '700', color: COLORS.primary, marginTop: 6 },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkText: { color: COLORS.white, fontWeight: '700' },
});
