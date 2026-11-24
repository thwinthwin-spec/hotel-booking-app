/** Guest bookings split into Upcoming / Past / Cancelled tabs. */
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/Header';
import BookingCard from '../../components/BookingCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { fetchMyBookings } from '../../redux/bookingSlice';
import { COLORS } from '../../utils/constants';

const TABS = ['Upcoming', 'Past', 'Cancelled'];
const UPCOMING = ['pending', 'confirmed', 'checked_in', 'paid'];
const PAST = ['checked_out', 'completed'];
const CANCELLED = ['cancelled'];

export default function MyBookingsScreen({ navigation }) {
  const dispatch = useDispatch();
  const bookings = useSelector((state) => state.booking.bookings);
  const loading = useSelector((state) => state.booking.loading);
  const [tab, setTab] = useState('Upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      await dispatch(fetchMyBookings()).unwrap();
    } catch (error) {
      Alert.alert('Error', error || 'Could not load your bookings.');
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      load();
      return undefined;
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const statuses = tab === 'Upcoming' ? UPCOMING : tab === 'Past' ? PAST : CANCELLED;
  const filtered = bookings.filter((item) => statuses.includes(item.status));

  return (
    <View style={styles.screen}>
      <Header title="My Bookings" />
      <View style={styles.tabs}>
        {TABS.map((item) => (
          <View key={item} style={styles.tabWrapper}>
            <TouchableOpacity
              style={[styles.tab, tab === item && styles.tabActive]}
              onPress={() => setTab(item)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, tab === item && styles.tabTextActive]}>{item}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {loading && !refreshing ? (
        <Loader message="Loading your bookings…" />
      ) : filtered.length ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              onPress={() => navigation.navigate('BookingDetail', { id: item._id })}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        />
      ) : (
        <EmptyState
          icon="🎫"
          title={`No ${tab.toLowerCase()} bookings`}
          message="Your bookings will show up here."
          actionLabel="Find a hotel"
          onAction={() => navigation.navigate('Hotels', { screen: 'HotelList' })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabWrapper: { flex: 1 },
  tab: { paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.muted, fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: COLORS.white },
  list: { padding: 14 },
});
