/** Hotel browsing -> room -> booking -> payment flow (used by the Hotels tab). */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HotelListScreen from '../screens/home/HotelListScreen';
import HotelDetailScreen from '../screens/home/HotelDetailScreen';
import RoomDetailScreen from '../screens/home/RoomDetailScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import PaymentScreen from '../screens/booking/PaymentScreen';

const Stack = createNativeStackNavigator();

export default function BookingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HotelList" component={HotelListScreen} options={{ title: 'Hotels' }} />
      <Stack.Screen name="HotelDetail" component={HotelDetailScreen} />
      <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
  );
}
