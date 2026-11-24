/** Guest profile with avatar, account details, admin link, and logout. */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/Header';
import Button from '../../components/Button';
import { logout } from '../../redux/authSlice';
import { COLORS } from '../../utils/constants';

function initials(name) {
  return String(name || 'Guest')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function MenuRow({ icon, label, onPress, danger = false }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuLabel, danger && styles.dangerText]}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user) || {};

  const handleLogout = () => {
    Alert.alert('Log out?', 'You will need to sign in again.', [
      { text: 'Stay', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(logout()).unwrap();
          } catch (error) {
            Alert.alert('Error', error || 'Could not log out.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <Header title="Profile" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarCard}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}><Text style={styles.avatarText}>{initials(user.name)}</Text></View>
          )}
          <Text style={styles.name}>{user.name || 'Guest'}</Text>
          <Text style={styles.email}>{user.email || 'No email on file'}</Text>
          {user.role === 'admin' ? (
            <View style={styles.adminBadge}><Text style={styles.adminText}>ADMIN</Text></View>
          ) : null}
        </View>

        <View style={styles.card}>
          <MenuRow icon="✏️" label="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
          <MenuRow icon="🎫" label="My Bookings" onPress={() => navigation.navigate('Bookings', { screen: 'MyBookings' })} />
          {user.role === 'admin' ? (
            <MenuRow
              icon="🛠️"
              label="Admin Dashboard"
              onPress={() => navigation.navigate('Admin', { screen: 'AdminDashboard' })}
            />
          ) : null}
        </View>

        <View style={styles.logoutWrapper}>
          <Button title="Log Out" variant="danger" onPress={handleLogout} />
        </View>
        <Text style={styles.version}>Hotel Booking v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 30 },
  avatarCard: { alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 24 },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 84, height: 84, borderRadius: 42 },
  avatarText: { color: COLORS.white, fontSize: 28, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginTop: 12 },
  email: { color: COLORS.muted, fontSize: 13, marginTop: 4 },
  adminBadge: { backgroundColor: '#FFF4D6', borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10, marginTop: 10 },
  adminText: { color: '#8A6100', fontSize: 11, fontWeight: '800' },
  card: { marginTop: 18, backgroundColor: COLORS.white, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuIcon: { fontSize: 18 },
  menuLabel: { flex: 1, marginLeft: 12, color: COLORS.text, fontSize: 14 },
  dangerText: { color: COLORS.danger },
  chevron: { fontSize: 20, color: COLORS.muted },
  logoutWrapper: { marginTop: 22 },
  version: { textAlign: 'center', color: COLORS.muted, fontSize: 11, marginTop: 20 },
});
