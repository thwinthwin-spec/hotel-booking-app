/**
 * First screen in the AuthStack. Restores the stored JWT, loads the user into
 * Redux, and lets AppNavigator swap to MainTabs. Without a token it shows Login.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { loadUser } from '../../redux/authSlice';
import { COLORS, hello } from '../../utils/constants';

export default function SplashScreen({ navigation }) {
  const dispatch = useDispatch();
  const [message, setMessage] = useState('Preparing your stay…');

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        // Small delay so the branded splash is visible on fast devices.
        await new Promise((resolve) => setTimeout(resolve, 800));
        const token = await AsyncStorage.getItem('token');

        if (!mounted) return;

        if (!token) {
          navigation.replace('Login');
          return;
        }

        setMessage('Restoring your session…');
        const result = await dispatch(loadUser());

        if (!mounted) return;

        // A rejected load means the token is stale: return to the login form.
        if (loadUser.rejected.match(result)) {
          navigation.replace('Login');
        }
        // On success state.auth.token is set and AppNavigator shows MainTabs.
      } catch (error) {
        console.warn('Splash bootstrap failed', error);
        Alert.alert('Session error', 'We could not restore your session. Please sign in again.');
        if (mounted) navigation.replace('Login');
      }
    };

    bootstrap();
    return () => {
      mounted = false;
    };
  }, [dispatch, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🏨</Text>
      <Text style={styles.title}>Hotel Booking</Text>
      <Text style={styles.subtitle}>{hello}</Text>
      <ActivityIndicator style={styles.spinner} size="small" color={COLORS.accent} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary },
  logo: { fontSize: 72 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.white, marginTop: 12 },
  subtitle: { fontSize: 14, color: COLORS.accent, marginTop: 6 },
  spinner: { marginTop: 36 },
  message: { marginTop: 12, color: COLORS.white, fontSize: 13 },
});
