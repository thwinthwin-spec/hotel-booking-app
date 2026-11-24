/** Bottom tab layout. Admin tab is mounted only for users with role 'admin'. */
import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import BookingStack from './BookingStack';
import HomeScreen from '../screens/home/HomeScreen';
import MyBookingsScreen from '../screens/booking/MyBookingsScreen';
import BookingDetailScreen from '../screens/booking/BookingDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ManageBookingsScreen from '../screens/admin/ManageBookingsScreen';
import ManageRoomsScreen from '../screens/admin/ManageRoomsScreen';
import { COLORS } from '../utils/constants';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BookingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="ManageBookings" component={ManageBookingsScreen} />
      <Stack.Screen name="ManageRooms" component={ManageRoomsScreen} />
    </Stack.Navigator>
  );
}

function tabIcon(emoji) {
  return ({ focused }) => (
    <Text style={{ fontSize: 19, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function MainTabs() {
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: { backgroundColor: COLORS.white, borderTopColor: COLORS.border },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home', tabBarIcon: tabIcon('🏠') }} />
      <Tab.Screen name="Hotels" component={BookingStack} options={{ tabBarLabel: 'Hotels', tabBarIcon: tabIcon('🔍') }} />
      <Tab.Screen name="Bookings" component={BookingsStack} options={{ tabBarLabel: 'Bookings', tabBarIcon: tabIcon('🎫') }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ tabBarLabel: 'Profile', tabBarIcon: tabIcon('👤') }} />
      {isAdmin ? (
        <Tab.Screen name="Admin" component={AdminStack} options={{ tabBarLabel: 'Admin', tabBarIcon: tabIcon('🛠️') }} />
      ) : null}
    </Tab.Navigator>
  );
}
