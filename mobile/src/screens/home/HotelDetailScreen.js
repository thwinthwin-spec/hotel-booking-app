/** Hotel detail: image carousel, info, amenities, guest reviews, and rooms. */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Header from '../../components/Header';
import Loader from '../../components/Loader';
import RoomCard from '../../components/RoomCard';
import { fetchHotelByIdApi, fetchRoomReviewsApi } from '../../api/hotelApi';
import { COLORS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const { width } = Dimensions.get('window');

function imageUri(image) {
  if (!image) return null;
  return typeof image === 'string' ? image : image.url || image.uri || null;
}

export default function HotelDetailScreen({ navigation }) {
  const route = useRoute();
  const id = route.params?.id;
  const [hotel, setHotel] = useState(route.params?.hotel || null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const scrollRef = useRef(null);
  const roomsY = useRef(0);

  useEffect(() => {
    const loadHotel = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await fetchHotelByIdApi(id);
        setHotel(data.hotel || data);
      } catch (error) {
        Alert.alert('Error', error.response?.data?.message || 'Could not load hotel details.');
      } finally {
        setLoading(false);
      }
    };
    loadHotel();
  }, [id]);

  useEffect(() => {
    const loadReviews = async () => {
      const roomId = hotel?.rooms?.[0]?._id;
      if (!roomId) return;
      try {
        const { data } = await fetchRoomReviewsApi(roomId);
        setReviews(data.items || []);
      } catch (error) {
        console.warn('Reviews unavailable', error.message);
      }
    };
    loadReviews();
  }, [hotel]);

  if (loading || !hotel) return <Loader message="Loading hotel…" />;

  const images = (hotel.images || [])
    .map(imageUri)
    .filter(Boolean);

  const scrollToRooms = () =>
    scrollRef.current?.scrollTo({ y: roomsY.current - 70, animated: true });

  return (
    <View style={styles.screen}>
      <Header title="Hotel Details" showBack navigation={navigation} />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        {images.length ? (
          <View>
            <FlatList
              horizontal
              data={images}
              keyExtractor={(item, index) => `${item}-${index}`}
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x / width
                );
                setActiveImage(index);
              }}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.carouselImage} resizeMode="cover" />
              )}
            />
            <View style={styles.dots}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[styles.dot, index === activeImage && styles.dotActive]}
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.noImage}><Text style={styles.noImageText}>🏨</Text></View>
        )}

        <View style={styles.titleRow}>
          <Text style={styles.name}>{hotel.name}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {hotel.rating || hotel.averageRating || 'New'}</Text>
          </View>
        </View>
        <Text style={styles.city}>📍 {hotel.city || 'Location not set'}{hotel.address ? ` · ${hotel.address}` : ''}</Text>

        <TouchableOpacity style={styles.viewRoomsButton} onPress={scrollToRooms}>
          <Text style={styles.viewRoomsText}>View Rooms ↓</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>About this hotel</Text>
        <Text style={styles.description}>
          {hotel.description || 'A comfortable place to stay with friendly service.'}
        </Text>

        {hotel.amenities?.length ? (
          <>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.chips}>
              {hotel.amenities.map((amenity, index) => (
                <View key={index} style={styles.chip}>
                  <Text style={styles.chipText}>✓ {amenity}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Guest reviews</Text>
          <Text style={styles.count}>{reviews.length}</Text>
        </View>
        {reviews.length ? (
          reviews.slice(0, 5).map((review) => (
            <View key={review._id} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <Text style={styles.reviewer}>
                  👤 {review.userId?.name || review.user?.name || 'Guest'}
                </Text>
                <Text style={styles.reviewRating}>⭐ {review.rating}/5</Text>
              </View>
              <Text style={styles.reviewComment}>{review.comment || 'No comment'}</Text>
              <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.muted}>No reviews yet — be the first to stay!</Text>
        )}

        <View
          onLayout={(event) => {
            roomsY.current = event.nativeEvent.layout.y;
          }}
        >
          <Text style={[styles.sectionTitle, styles.roomsTitle]}>Available rooms</Text>
          {hotel.rooms?.length ? (
            hotel.rooms.map((room) => (
              <RoomCard
                key={room._id}
                room={room}
                onSelect={() =>
                  navigation.navigate('RoomDetail', { room, hotel })
                }
              />
            ))
          ) : (
            <Text style={styles.muted}>No rooms listed for this hotel.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 30 },
  carouselImage: { width, height: 240 },
  noImage: { height: 180, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF3EF' },
  noImageText: { fontSize: 60 },
  dots: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 10 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.border, margin: 3 },
  dotActive: { backgroundColor: COLORS.primary, width: 16 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
  },
  name: { flex: 1, fontSize: 22, fontWeight: '800', color: COLORS.text },
  ratingBadge: { backgroundColor: '#FFF4D6', borderRadius: 12, padding: 6 },
  ratingText: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  city: { paddingHorizontal: 16, color: COLORS.muted, fontSize: 13, marginTop: 6 },
  viewRoomsButton: {
    alignSelf: 'flex-start',
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  viewRoomsText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginHorizontal: 16, marginTop: 22 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 22 },
  count: { marginLeft: 8, color: COLORS.muted },
  description: { marginHorizontal: 16, marginTop: 8, color: COLORS.muted, lineHeight: 21, fontSize: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, marginTop: 10 },
  chip: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 7, marginRight: 7, marginBottom: 7 },
  chipText: { fontSize: 12, color: COLORS.text },
  reviewCard: { marginHorizontal: 16, marginTop: 10, backgroundColor: COLORS.white, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewer: { fontWeight: '700', color: COLORS.text, fontSize: 13 },
  reviewRating: { color: COLORS.accent, fontSize: 13 },
  reviewComment: { marginTop: 6, color: COLORS.text, fontSize: 13 },
  reviewDate: { marginTop: 6, color: COLORS.muted, fontSize: 11 },
  muted: { marginHorizontal: 16, marginTop: 8, color: COLORS.muted, fontSize: 13 },
  roomsTitle: { marginBottom: 10 },
});
