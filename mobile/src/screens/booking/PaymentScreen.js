/** Payment method selection: Stripe test mode (intent only) or pay at hotel. */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import { createPaymentIntentApi, payCashApi } from '../../api/paymentApi';
import { updateBookingStatus } from '../../redux/bookingSlice';
import { COLORS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';

function nameOf(value, fallback) {
  if (!value) return fallback;
  return value.name || value.type || fallback;
}

export default function PaymentScreen({ navigation }) {
  const route = useRoute();
  const dispatch = useDispatch();
  const booking = route.params?.booking;
  const [method, setMethod] = useState('stripe');
  const [processing, setProcessing] = useState(false);

  if (!booking) return <Loader message="Missing booking information." />;

  const bookingId = booking._id;
  const total = booking.total || booking.totalAmount || booking.amount || 0;

  const finish = async (message) => {
    try {
      // Keep local status in sync even if the payment endpoint already did it.
      await dispatch(updateBookingStatus({ id: bookingId, status: 'confirmed' })).unwrap();
    } catch (error) {
      console.warn('Status sync skipped', error);
    }
    Alert.alert('Payment', message, [
      { text: 'View my bookings', onPress: () => navigation.navigate('Bookings', { screen: 'MyBookings' }) },
    ]);
    navigation.navigate('Bookings', { screen: 'MyBookings' });
  };

  const handlePay = async () => {
    setProcessing(true);
    try {
      if (method === 'stripe') {
        const { data } = await createPaymentIntentApi(bookingId);
        Alert.alert(
          'Stripe test mode',
          `Complete payment in your test checkout using clientSecret:\n${data.clientSecret}`
        );
        await finish('Payment intent created successfully.');
      } else {
        const { data } = await payCashApi(bookingId);
        await finish(data.message || 'Pay at hotel confirmed. See you soon!');
      }
    } catch (error) {
      Alert.alert('Payment failed', error.response?.data?.message || 'Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="Payment" showBack navigation={navigation} />
      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.label}>Bookings total</Text>
          <Text style={styles.total}>{formatCurrency(total)}</Text>
          <Text style={styles.meta}>
            {nameOf(booking.hotelId, 'Hotel')} · {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Choose payment method</Text>

        <TouchableOpacity
          style={[styles.methodCard, method === 'stripe' && styles.methodActive]}
          onPress={() => setMethod('stripe')}
        >
          <View style={styles.radio}>{method === 'stripe' ? <View style={styles.radioInner} /> : null}</View>
          <View style={styles.methodBody}>
            <Text style={styles.methodTitle}>💳 Card (Stripe)</Text>
            <Text style={styles.methodHint}>Test mode — no real charge is made.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.methodCard, method === 'cash' && styles.methodActive]}
          onPress={() => setMethod('cash')}
        >
          <View style={styles.radio}>{method === 'cash' ? <View style={styles.radioInner} /> : null}</View>
          <View style={styles.methodBody}>
            <Text style={styles.methodTitle}>💵 Pay at hotel (Cash)</Text>
            <Text style={styles.methodHint}>Settle your bill when you check in.</Text>
          </View>
        </TouchableOpacity>

        <Button
          title={method === 'stripe' ? 'Pay with Card' : 'Confirm Cash Payment'}
          onPress={handlePay}
          loading={processing}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  summaryCard: { backgroundColor: COLORS.primary, borderRadius: 14, padding: 18 },
  label: { color: '#D7F0E7', fontSize: 12 },
  total: { color: COLORS.white, fontSize: 28, fontWeight: '800', marginTop: 4 },
  meta: { color: COLORS.white, fontSize: 12, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginTop: 24, marginBottom: 12 },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  methodActive: { borderColor: COLORS.primary, borderWidth: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  methodBody: { marginLeft: 12, flex: 1 },
  methodTitle: { fontWeight: '700', color: COLORS.text, fontSize: 14 },
  methodHint: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
});
