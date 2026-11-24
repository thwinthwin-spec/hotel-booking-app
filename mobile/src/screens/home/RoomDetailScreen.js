/** Room detail with gallery, facilities, and the Book Now call to action. */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import { fetchRoomByIdApi } from '../../api/roomApi';
import { COLORS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

const { width } = Dimensions.get('window');

function imageUri(image) {
  if (!image) return null;
  return typeof image === 'string' ? image : image.url || image.uri || null;
}

export default function RoomDetailScreen({ navigation }) {
  const route = useRoute();
  const [room, setRoom] = useState(route.params?.room || null);
  const hotel = route.params?.hotel;
  const [loading, setLoading] = useState(!room);

  useEffect(() => {
    const loadRoom = async () => {
      const id = route.params?.id || route.params?.room?._id;
      if (!id) return;
      try {
        const { data } = await fetchRoomByIdApi(id);
        setRoom(data.room || data);
      } catch (error) {
        Alert.alert('Error', error.response?.data?.message || 'Could not load room details.');
      } finally {
        setLoading(false);
      }
    };
    if (!room) loadRoom();
  }, [route.params, room]);

  if (loading || !room) return <Loader message="Loading room…" />;

  const images = (room.images || []).map(imageUri).filter(Boolean);
  const amenities = room.amenities || room.facilities || [];

  return (
    <View style={styles.screen}>
      <Header title={room.type || 'Room'} showBack navigation={navigation} />
      <ScrollView contentContainerStyle={styles.content}>
        {images.length ? (
          <FlatList
            horizontal
            data={images}
            keyExtractor={(item, index) => `${item}-${index}`}
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
            )}
          />
        ) : (
          <View style={styles.noImage}><Text style={styles.noImageText}>🛏️</Text></View>
        )}

        <Text style={styles.title}>
          {room.type || 'Room'} {room.roomNumber ? `· #${room.roomNumber}` : ''}
        </Text>
        {hotel?.name ? <Text style={styles.hotel}>🏨 {hotel.name}</Text> : null}
        <Text style={styles.price}>{formatCurrency(room.price || 0)} <Text style={styles.perNight}>/ night</Text></Text>

        <View style={styles.facts}>
          <View style={styles.fact}><Text style={styles.factIcon}>👥</Text><Text style={styles.factText}>Up to {room.capacity || 2} guests</Text></View>
          <View style={styles.fact}><Text style={styles.factIcon}>🚪</Text><Text style={styles.factText}>{room.totalRooms || 1} available</Text></View>
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {room.description || 'A comfortable, well-appointed room for a relaxing stay.'}
        </Text>

        {amenities.length ? (
          <>
            <Text style={styles.sectionTitle}>Room facilities</Text>
            <View style={styles.chips}>
              {amenities.map((item, index) => (
                <View key={index} style={styles.chip}><Text style={styles.chipText}>✓ {item}</Text></View>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Price per night</Text>
          <Text style={styles.footerPrice}>{formatCurrency(room.price || 0)}</Text>
        </View>
        <View style={styles.bookButton}>
          <Button
            title="Book Now"
            onPress={() => navigation.navigate('Booking', { room, hotel })}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 24 },
  image: { width, height: 250 },
  noImage: { height: 200, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF3EF' },
  noImageText: { fontSize: 60 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginHorizontal: 16, marginTop: 16 },
  hotel: { color: COLORS.muted, fontSize: 13, marginHorizontal: 16, marginTop: 4 },
  price: { color: COLORS.primary, fontSize: 20, fontWeight: '800', marginHorizontal: 16, marginTop: 12 },
  perNight: { fontSize: 13, color: COLORS.muted, fontWeight: '400' },
  facts: { flexDirection: 'row', marginHorizontal: 16, marginTop: 14 },
  fact: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  factIcon: { fontSize: 16 },
  factText: { color: COLORS.text, fontSize: 13, marginLeft: 5 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginHorizontal: 16, marginTop: 22 },
  description: { marginHorizontal: 16, marginTop: 8, color: COLORS.muted, lineHeight: 21, fontSize: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, marginTop: 10 },
  chip: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 7, marginRight: 7, marginBottom: 7 },
  chipText: { fontSize: 12, color: COLORS.text },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerLabel: { color: COLORS.muted, fontSize: 11 },
  footerPrice: { color: COLORS.primary, fontSize: 17, fontWeight: '800' },
  bookButton: { width: 150 },
});
