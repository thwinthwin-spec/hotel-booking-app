/** Home tab: search box, popular destinations, and featured hotels. */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import Header from '../../components/Header';
import HotelCard from '../../components/HotelCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { fetchHotelsApi } from '../../api/hotelApi';
import { COLORS } from '../../utils/constants';

const DESTINATIONS = ['Yangon', 'Mandalay', 'Naypyidaw'];

export default function HomeScreen({ navigation }) {
  const user = useSelector((state) => state.auth.user);
  const [search, setSearch] = useState('');
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFeatured = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchHotelsApi({ limit: 10 });
      setHotels(data.items || []);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Could not load hotels.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  const openList = (params = {}) =>
    navigation.navigate('Hotels', { screen: 'HotelList', params });

  const openHotel = (hotel) =>
    navigation.navigate('Hotels', {
      screen: 'HotelDetail',
      params: { id: hotel._id, hotel },
    });

  return (
    <View style={styles.screen}>
      <Header
        title={`Hi, ${user?.name?.split(' ')[0] || 'Traveller'} 👋`}
        right={<TouchableOpacity onPress={() => navigation.navigate('Bookings', { screen: 'MyBookings' })}><Text style={styles.headerIcon}>🎫</Text></TouchableOpacity>}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Find your next stay</Text>
          <Text style={styles.heroSubtitle}>Comfortable rooms across Myanmar</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search hotels or cities…"
              placeholderTextColor={COLORS.muted}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={() => openList({ search })}
            />
            <TouchableOpacity style={styles.searchButton} onPress={() => openList({ search })}>
              <Text style={styles.searchIcon}>🔍</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Popular destinations</Text>
        <View style={styles.chips}>
          {DESTINATIONS.map((city) => (
            <TouchableOpacity key={city} style={styles.chip} onPress={() => openList({ city })}>
              <Text style={styles.chipText}>📍 {city}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured hotels</Text>
          <TouchableOpacity onPress={() => openList()}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Loader message="Finding great stays…" />
        ) : hotels.length ? (
          <FlatList
            data={hotels}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <HotelCard hotel={item} onPress={() => openHotel(item)} />}
            scrollEnabled={false}
          />
        ) : (
          <EmptyState
            icon="🏨"
            title="No hotels yet"
            message="Hotels will appear here once they are added."
            actionLabel="Browse all"
            onAction={() => openList()}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  headerIcon: { fontSize: 20 },
  content: { padding: 16, paddingBottom: 32 },
  hero: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    marginBottom: 22,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: COLORS.white },
  heroSubtitle: { fontSize: 13, color: '#D7F0E7', marginTop: 4 },
  searchRow: { flexDirection: 'row', marginTop: 16 },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 44,
    color: COLORS.text,
  },
  searchButton: {
    width: 46,
    marginLeft: 8,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: { fontSize: 18 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 10,
  },
  seeAll: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  chip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { color: COLORS.text, fontSize: 13 },
});
