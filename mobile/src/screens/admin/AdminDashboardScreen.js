/** Admin overview: platform statistics from GET /admin/dashboard. */
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Header from '../../components/Header';
import Loader from '../../components/Loader';
import api from '../../api/axios';
import { COLORS } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

function StatCard({ icon, label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function AdminDashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setStats(data.stats || data);
      } catch (error) {
        Alert.alert('Error', error.response?.data?.message || 'Could not load dashboard.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader message="Loading dashboard…" />;

  return (
    <View style={styles.screen}>
      <Header title="Admin Dashboard" showBack navigation={navigation} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcome}>🛠️ Management overview</Text>

        <View style={styles.grid}>
          <StatCard icon="🏨" label="Hotels" value={stats?.hotels ?? stats?.totalHotels ?? 0} />
          <StatCard icon="🛏️" label="Rooms" value={stats?.rooms ?? stats?.totalRooms ?? 0} />
          <StatCard icon="👥" label="Users" value={stats?.users ?? stats?.totalUsers ?? 0} />
          <StatCard icon="🎫" label="Bookings" value={stats?.bookings ?? stats?.totalBookings ?? 0} />
        </View>

        {stats?.revenue != null ? (
          <View style={styles.revenueCard}>
            <Text style={styles.revenueLabel}>Total revenue</Text>
            <Text style={styles.revenueValue}>{formatCurrency(stats.revenue)}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Quick links</Text>
        <TouchableOpacity style={styles.linkCard} onPress={() => navigation.navigate('ManageBookings')}>
          <Text style={styles.linkIcon}>📋</Text>
          <View><Text style={styles.linkTitle}>Manage Bookings</Text><Text style={styles.linkHint}>Review and update booking statuses</Text></View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkCard} onPress={() => navigation.navigate('ManageRooms')}>
          <Text style={styles.linkIcon}>🛏️</Text>
          <View><Text style={styles.linkTitle}>Manage Rooms</Text><Text style={styles.linkHint}>Add, edit, or remove rooms</Text></View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 30 },
  welcome: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 16, marginBottom: 12, alignItems: 'center' },
  statIcon: { fontSize: 24 },
  statValue: { fontSize: 24, fontWeight: '800', color: COLORS.primary, marginTop: 6 },
  statLabel: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  revenueCard: { backgroundColor: COLORS.primary, borderRadius: 14, padding: 18, marginTop: 6 },
  revenueLabel: { color: '#D7F0E7', fontSize: 12 },
  revenueValue: { color: COLORS.white, fontSize: 24, fontWeight: '800', marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginTop: 24, marginBottom: 10 },
  linkCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 14, marginBottom: 10 },
  linkIcon: { fontSize: 24, marginRight: 12 },
  linkTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  linkHint: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
});
