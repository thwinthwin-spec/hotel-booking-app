/** Admin booking table: list all bookings and change their status. */
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/Header';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { fetchAllBookings, updateBookingStatus } from '../../redux/bookingSlice';
import { COLORS, BOOKING_STATUSES } from '../../utils/constants';
import { formatCurrency, formatDate, statusColor, statusLabel } from '../../utils/formatters';

function nameOf(value, fallback) {
  if (!value) return fallback;
  return value.name || value.email || value.type || fallback;
}

export default function ManageBookingsScreen({ navigation }) {
  const dispatch = useDispatch();
  const bookings = useSelector((state) => state.booking.bookings);
  const loading = useSelector((state) => state.booking.loading);
  const [updatingId, setUpdatingId] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const load = async () => {
        try {
          await dispatch(fetchAllBookings()).unwrap();
        } catch (error) {
          Alert.alert('Error', error || 'Could not load bookings.');
        }
      };
      load();
      return undefined;
    }, [dispatch])
  );

  useEffect(() => {
    // Component mounted: focus effect above also runs on first render.
  }, []);

  const changeStatus = (id, status) => {
    Alert.alert('Update status', `Set this booking to "${status}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Update',
        onPress: async () => {
          setUpdatingId(id);
          try {
            await dispatch(updateBookingStatus({ id, status })).unwrap();
            Alert.alert('Updated', 'Booking status has been changed.');
          } catch (error) {
            Alert.alert('Error', error || 'Could not update status.');
          } finally {
            setUpdatingId(null);
          }
        },
      },
    ]);
  };

  if (loading && !bookings.length) return <Loader message="Loading bookings…" />;

  return (
    <View style={styles.screen}>
      <Header title="Manage Bookings" showBack navigation={navigation} />
      {bookings.length ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.count}>{bookings.length} booking(s)</Text>
          {bookings.map((booking) => (
            <View key={booking._id} style={styles.card}>
              <View style={styles.topRow}>
                <Text style={styles.guest} numberOfLines={1}>
                  👤 {nameOf(booking.userId, 'Guest')}
                </Text>
                <View style={[styles.pill, { backgroundColor: statusColor(booking.status) }]}>
                  <Text style={styles.pillText}>{statusLabel(booking.status)}</Text>
                </View>
              </View>
              <Text style={styles.meta}>
                {nameOf(booking.hotelId, 'Hotel')} · {nameOf(booking.roomId, 'Room')}
              </Text>
              <Text style={styles.meta}>
                {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)} · {formatCurrency(booking.total || booking.totalAmount || 0)}
              </Text>
              <Text style={styles.subTitle}>{updatingId === booking._id ? 'Updating…' : 'Change status:'}</Text>
              <View style={styles.statusRow}>
                {BOOKING_STATUSES.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      booking.status === status && styles.statusButtonActive,
                    ]}
                    onPress={() => changeStatus(booking._id, status)}
                    disabled={updatingId === booking._id}
                  >
                    <Text style={[styles.statusText, booking.status === status && styles.statusTextActive]}>
                      {statusLabel(status)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <EmptyState icon="📋" title="No bookings" message="Bookings from all users appear here." />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 14, paddingBottom: 30 },
  count: { color: COLORS.muted, fontSize: 12, marginBottom: 10 },
  card: { backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  guest: { fontSize: 15, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: 8 },
  pill: { borderRadius: 12, paddingVertical: 3, paddingHorizontal: 9 },
  pillText: { fontSize: 10, color: COLORS.white, fontWeight: '700' },
  meta: { color: COLORS.muted, fontSize: 12, marginTop: 6 },
  subTitle: { color: COLORS.text, fontSize: 12, fontWeight: '700', marginTop: 12 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  statusButton: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, paddingVertical: 5, paddingHorizontal: 9, marginRight: 6, marginBottom: 6 },
  statusButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  statusText: { color: COLORS.muted, fontSize: 11 },
  statusTextActive: { color: COLORS.white, fontWeight: '700' },
});
