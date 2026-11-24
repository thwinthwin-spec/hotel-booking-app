/** Date/guest selection and price summary before creating a booking. */
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/Header';
import Button from '../../components/Button';
import DateRangePicker from '../../components/DateRangePicker';
import Loader from '../../components/Loader';
import { createBooking } from '../../redux/bookingSlice';
import { COLORS } from '../../utils/constants';
import { formatCurrency, formatNights } from '../../utils/formatters';

/** Local YYYY-MM-DD helper (avoids UTC shifting from toISOString). */
function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function BookingScreen({ navigation }) {
  const route = useRoute();
  const room = route.params?.room;
  const hotel = route.params?.hotel;
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.booking.loading);

  const today = new Date();
  const later = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  const [checkIn, setCheckIn] = useState(dateKey(today));
  const [checkOut, setCheckOut] = useState(dateKey(later));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!room) return <Loader message="Missing room information." />;

  const nights = Math.max(1, formatNights(checkIn, checkOut));
  const nightly = Number(room.price || 0);
  const subtotal = nightly * nights;
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + serviceFee;

  const step = (setter, value, delta, min, max) =>
    setter(Math.min(max, Math.max(min, value + delta)));

  const handleConfirm = async () => {
    if (!checkIn || !checkOut || nights < 1) {
      Alert.alert('Check dates', 'Please select a valid check-in and check-out date.');
      return;
    }
    setSubmitting(true);
    try {
      const booking = await dispatch(
        createBooking({
          hotelId: hotel?._id || room.hotelId?._id || room.hotelId,
          roomId: room._id,
          checkIn,
          checkOut,
          adults,
          children,
          specialRequests: specialRequests.trim(),
        })
      ).unwrap();
      Alert.alert('Booking created', 'Choose how you would like to pay.');
      navigation.navigate('Payment', { booking });
    } catch (error) {
      Alert.alert('Booking failed', error || 'Could not create your booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="Your Booking" showBack navigation={navigation} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.roomTitle}>{room.type || 'Room'} {room.roomNumber ? `#${room.roomNumber}` : ''}</Text>
          <Text style={styles.hotelName}>🏨 {hotel?.name || 'Hotel'}</Text>
          <Text style={styles.price}>{formatCurrency(nightly)} / night</Text>
        </View>

        <Text style={styles.sectionTitle}>Select dates</Text>
        <DateRangePicker
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={({ checkIn: nextIn, checkOut: nextOut }) => {
            setCheckIn(nextIn);
            setCheckOut(nextOut);
          }}
        />

        <Text style={styles.sectionTitle}>Guests</Text>
        <View style={styles.card}>
          <View style={styles.stepperRow}>
            <View><Text style={styles.stepperLabel}>Adults</Text><Text style={styles.stepperHint}>Age 13+</Text></View>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepButton} onPress={() => step(setAdults, adults, -1, 1, 10)}><Text style={styles.stepText}>−</Text></TouchableOpacity>
              <Text style={styles.stepValue}>{adults}</Text>
              <TouchableOpacity style={styles.stepButton} onPress={() => step(setAdults, adults, 1, 1, 10)}><Text style={styles.stepText}>+</Text></TouchableOpacity>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.stepperRow}>
            <View><Text style={styles.stepperLabel}>Children</Text><Text style={styles.stepperHint}>Age 0–12</Text></View>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepButton} onPress={() => step(setChildren, children, -1, 0, 8)}><Text style={styles.stepText}>−</Text></TouchableOpacity>
              <Text style={styles.stepValue}>{children}</Text>
              <TouchableOpacity style={styles.stepButton} onPress={() => step(setChildren, children, 1, 0, 8)}><Text style={styles.stepText}>+</Text></TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Special requests (optional)</Text>
        <TextInputMultiline value={specialRequests} onChangeText={setSpecialRequests} />

        <Text style={styles.sectionTitle}>Price summary</Text>
        <View style={styles.card}>
          <Row label={`${formatCurrency(nightly)} × ${nights} night${nights > 1 ? 's' : ''}`} value={formatCurrency(subtotal)} />
          <Row label="Service fee (10%)" value={formatCurrency(serviceFee)} />
          <View style={styles.divider} />
          <Row label="Total" value={formatCurrency(total)} bold />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Confirm Booking"
          onPress={handleConfirm}
          loading={submitting || loading}
        />
      </View>
    </View>
  );
}

/** Small multiline field kept local to this screen. */
function TextInputMultiline({ value, onChangeText }) {
  return (
    <TextInput
      style={styles.textArea}
      value={value}
      onChangeText={onChangeText}
      placeholder="e.g. quiet room, early check-in…"
      placeholderTextColor={COLORS.muted}
      multiline
      numberOfLines={4}
      textAlignVertical="top"
    />
  );
}

function Row({ label, value, bold = false }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 30 },
  summaryCard: { backgroundColor: COLORS.primary, borderRadius: 14, padding: 16 },
  roomTitle: { color: COLORS.white, fontSize: 19, fontWeight: '800' },
  hotelName: { color: '#D7F0E7', marginTop: 5, fontSize: 13 },
  price: { color: COLORS.accent, marginTop: 10, fontWeight: '700', fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginTop: 22, marginBottom: 10 },
  card: { backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 14 },
  stepperRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepperLabel: { fontWeight: '700', color: COLORS.text, fontSize: 14 },
  stepperHint: { color: COLORS.muted, fontSize: 11 },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepButton: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: COLORS.primary, fontSize: 20, lineHeight: 22 },
  stepValue: { width: 34, textAlign: 'center', fontWeight: '700', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  textArea: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    minHeight: 90,
    color: COLORS.text,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rowLabel: { color: COLORS.muted, fontSize: 13 },
  rowValue: { color: COLORS.text, fontSize: 13 },
  bold: { fontWeight: '800', fontSize: 15, color: COLORS.text },
  footer: { padding: 14, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
});
