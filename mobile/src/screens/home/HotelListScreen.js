/** Searchable/filterable hotel list with paging inside the BookingStack. */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Header from '../../components/Header';
import HotelCard from '../../components/HotelCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { fetchHotelsApi } from '../../api/hotelApi';
import { COLORS } from '../../utils/constants';

const CITIES = ['All', 'Yangon', 'Mandalay', 'Naypyidaw'];

export default function HotelListScreen({ navigation }) {
  const route = useRoute();
  const initialCity = route.params?.city || 'All';
  const initialSearch = route.params?.search || '';

  const [search, setSearch] = useState(initialSearch);
  const [city, setCity] = useState(initialCity);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = useCallback(
    async (nextPage, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const params = { page: nextPage, limit: 8 };
        if (search.trim()) params.search = search.trim();
        if (city && city !== 'All') params.city = city;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;

        const { data } = await fetchHotelsApi(params);
        const newItems = data.items || [];
        setItems((prev) => (append ? [...prev, ...newItems] : newItems));
        setPage(data.page || nextPage);
        setPages(data.pages || 1);
      } catch (error) {
        Alert.alert('Error', error.response?.data?.message || 'Could not load hotels.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [search, city, minPrice, maxPrice]
  );

  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  const applyFilters = () => fetchPage(1, false);

  const loadMore = () => {
    if (!loading && !loadingMore && page < pages) fetchPage(page + 1, true);
  };

  return (
    <View style={styles.screen}>
      <Header title="Hotels" showBack navigation={navigation} />
      <View style={styles.filters}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search hotels…"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={applyFilters}
          />
          <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
            <Text style={styles.applyText}>Go</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          data={CITIES}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.cityChip, city === item && styles.cityChipActive]}
              onPress={() => setCity(item)}
            >
              <Text style={[styles.cityText, city === item && styles.cityTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />

        <View style={styles.priceRow}>
          <TextInput
            style={styles.priceInput}
            placeholder="Min price"
            keyboardType="numeric"
            value={minPrice}
            onChangeText={setMinPrice}
          />
          <Text style={styles.dash}>—</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="Max price"
            keyboardType="numeric"
            value={maxPrice}
            onChangeText={setMaxPrice}
          />
          <TouchableOpacity style={styles.filterButton} onPress={applyFilters}>
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <Loader message="Searching hotels…" />
      ) : items.length ? (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <HotelCard
              hotel={item}
              onPress={() =>
                navigation.navigate('HotelDetail', { id: item._id, hotel: item })
              }
            />
          )}
          contentContainerStyle={styles.list}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? <Loader message="Loading more…" /> : null
          }
        />
      ) : (
        <EmptyState
          icon="🔎"
          title="No hotels found"
          message="Try changing your search or filters."
          actionLabel="Reset filters"
          onAction={() => {
            setSearch('');
            setCity('All');
            setMinPrice('');
            setMaxPrice('');
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  filters: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchRow: { flexDirection: 'row', marginBottom: 10 },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 9,
    paddingHorizontal: 12,
    minHeight: 42,
    color: COLORS.text,
  },
  applyButton: {
    marginLeft: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 9,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  applyText: { color: COLORS.white, fontWeight: '700' },
  cityChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 13,
    marginRight: 8,
  },
  cityChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  cityText: { fontSize: 12, color: COLORS.text },
  cityTextActive: { color: COLORS.white, fontWeight: '700' },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  priceInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 10,
    minHeight: 38,
    color: COLORS.text,
    fontSize: 12,
  },
  dash: { color: COLORS.muted, marginHorizontal: 6 },
  filterButton: { marginLeft: 8, backgroundColor: COLORS.accent, borderRadius: 8, padding: 10 },
  filterText: { color: COLORS.text, fontWeight: '700', fontSize: 12 },
  list: { padding: 14 },
});
