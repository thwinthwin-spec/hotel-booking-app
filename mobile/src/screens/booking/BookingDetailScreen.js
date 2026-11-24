/** Full booking details with cancel action and a review modal after checkout. */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import StarRating from '../../components/StarRating';
import { fetchBookingById, cancelBooking } from '../../redux/bookingSlice';
import { createReviewApi } from '../../api/bookingApi';
import { COLORS } from '../../utils/constants';
import { formatCurrency, formatDate, statusColor, statusLabel } from '../../utils/formatters';

function nameOf(value, fallback) {
  if (!value) return fallback;
  return value.name || value.roomNumber || value.type || fallback;
}

export default function BookingDetailScreen({ navigation }) {
  const route = useRoute();
  const id = route.params?.id;
  const dispatch = useDispatch();
  const current = useSelector((state) => state.booking.current);
  const loading = useSelector((state) => state.booking.loading);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        await dispatch(fetchBookingById(id)).unwrap();
      } catch (error) {
        Alert.alert('Error', error || 'Could not load booking details.');
      }
    };
    if (id) load();
  }, [dispatch, id]);

  const handleCancel = () => {
    Alert.alert('Cancel booking?', 'This action cannot be undone.', [
      { text: 'Keep booking', style: 'cancel' },
      {
        text: 'Cancel booking',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(cancelBooking(id)).unwrap();
            Alert.alert('Cancelled', 'Your booking has been cancelled.');
          } catch (error) {
            Alert.alert('Error', error || 'Could not cancel booking.');
          }
        },
      },
    ]);
  };

  const handleReview = async () => {
    if (!rating) {
      Alert.alert('Rating required', 'Please choose a star rating.');
      return;
    }
    setSending(true);
    try {
      await createReviewApi({ bookingId: id, rating, comment: comment.trim() });
      setReviewOpen(false);
      setComment('');
      Alert.alert('Thank you!', 'Your review has been submitted.');
      await dispatch(fetchBookingById(id)).unwrap();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Could not submit review.');
    } finally {
      setSending(false);
    }
  };

  if (loading || !current) return <Loader message="Loading booking…" />;

  const total = current.total || current.totalAmount || current.amount || 0;
  const canCancel = ['pending', 'confirmed'].includes(current.status);

  return (
    <View style={styles.screen}>
      <Header title="Booking Details" showBack navigation={navigation} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.label}>Booking status</Text>
          <View style={[styles.pill, { backgroundColor: statusColor(current.status) }]}>
            <Text style={styles.pillText}>{statusLabel(current.status)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.hotel}>🏨 {nameOf(current.hotelId, 'Hotel')}</Text>
          <Text style={styles.room}>🛏️ {nameOf(current.roomId, 'Room')}</Text>

          <View style={styles.row}><Text style={styles.rowLabel}>Check in</Text><Text style={styles.rowValue}>{formatDate(current.checkIn)}</Text></View>
          <View style={styles.row}><Text style={styles.rowLabel}>Check out</Text><Text style={styles.rowValue}>{formatDate(current.checkOut)}</Text></View>
          <View style={styles.row}><Text style={styles.rowLabel}>Guests</Text><Text style={styles.rowValue}>{current.adults || 1} adult(s), {current.children || 0} child(ren)</Text></View>
          {current.specialRequests ? (
            <View style={styles.row}><Text style={styles.rowLabel}>Requests</Text><Text style={[styles.rowValue, styles.requests]}>{current.specialRequests}</Text></View>
          ) : null}
          <View style={styles.divider} />
          <View style={styles.row}><Text style={styles.totalLabel}>Total paid</Text><Text style={styles.totalValue}>{formatCurrency(total)}</Text></View>
          <Text style={styles.bookingId}>Reference: #{String(current._id || '').slice(-8).toUpperCase()}</Text>
        </View>

        {current.status === 'checked_out' ? (
          <Button title="Leave Review" variant="secondary" onPress={() => setReviewOpen(true)} />
        ) : null}

        {canCancel ? (
          <View style={styles.cancelWrapper}>
            <Button title="Cancel Booking" variant="danger" onPress={handleCancel} />
          </View>
        ) : null}
      </ScrollView>

      <Modal visible={reviewOpen} animationType="slide" transparent onRequestClose={() => setReviewOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rate your stay</Text>
            <StarRating value={rating} onChange={setRating} size={32} />
            <TextInput
              style={styles.commentInput}
              placeholder="Tell others about your experience…"
              placeholderTextColor={COLORS.muted}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Button title="Submit Review" onPress={handleReview} loading={sending} />
            <TouchableOpacity style={styles.closeLink} onPress={() => setReviewOpen(false)}>
              <Text style={styles.closeText}>Not now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 30 },
  statusCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  label: { color: COLORS.muted, fontSize: 13 },
  pill: { borderRadius: 14, paddingVertical: 5, paddingHorizontal: 12 },
  pillText: { color: COLORS.white, fontWeight: '700', fontSize: 12 },
  card: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 16 },
  hotel: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  room: { fontSize: 14, color: COLORS.muted, marginTop: 6, marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowLabel: { color: COLORS.muted, fontSize: 13 },
  rowValue: { color: COLORS.text, fontSize: 13, maxWidth: '60%', textAlign: 'right' },
  requests: { fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  totalLabel: { fontWeight: '700', color: COLORS.text },
  totalValue: { fontWeight: '800', color: COLORS.primary, fontSize: 16 },
  bookingId: { color: COLORS.muted, fontSize: 11, marginTop: 12 },
  cancelWrapper: { marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.white, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  commentInput: { width: '100%', borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 12, minHeight: 90, marginVertical: 16, color: COLORS.text },
  closeLink: { marginTop: 12 },
  closeText: { color: COLORS.muted, fontSize: 13 },
});
