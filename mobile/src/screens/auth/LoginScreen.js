/** Email/password login form. Dispatches login(); Redux token switches tabs. */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../redux/authSlice';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { COLORS } from '../../utils/constants';
import { validateEmail, validatePassword, validateRequired } from '../../utils/validators';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth.loading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleLogin = async () => {
    if (!validateRequired(email) || !validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address.' });
      return;
    }
    if (!validatePassword(password)) {
      setErrors({ password: 'Password must be at least 6 characters.' });
      return;
    }

    setErrors({});
    dispatch(clearError());
    try {
      // unwrap() throws on rejected thunks so we can show the server message.
      await dispatch(login({ email: email.trim(), password })).unwrap();
    } catch (error) {
      Alert.alert('Login failed', error || 'Please check your credentials and try again.');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.logo}>🏨</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue booking your stay.</Text>
      </View>

      <View style={styles.card}>
        <InputField
          label="Email"
          icon="✉️"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          error={errors.email}
        />
        <InputField
          label="Password"
          icon="🔒"
          placeholder="At least 6 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
        />
        <Button title="Sign In" onPress={handleLogin} loading={loading} />
      </View>

      <TouchableOpacity
        style={styles.linkRow}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.linkText}>New here? </Text>
        <Text style={styles.linkStrong}>Create an account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 22, paddingTop: 60 },
  hero: { alignItems: 'center', marginBottom: 28 },
  logo: { fontSize: 54 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginTop: 10 },
  subtitle: { fontSize: 14, color: COLORS.muted, marginTop: 6, textAlign: 'center' },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  linkText: { color: COLORS.muted, fontSize: 14 },
  linkStrong: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
});
