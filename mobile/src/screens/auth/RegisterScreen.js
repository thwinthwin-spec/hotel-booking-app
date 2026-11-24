/** Registration form with confirmation field and client-side validation. */
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
import { register, clearError } from '../../redux/authSlice';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { COLORS } from '../../utils/constants';
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateRequired,
} from '../../utils/validators';

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth.loading);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState({});

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleRegister = async () => {
    const nextErrors = {};
    if (!validateRequired(form.name)) nextErrors.name = 'Name is required.';
    if (!validateEmail(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (!validatePhone(form.phone)) nextErrors.phone = 'Enter a valid phone number.';
    if (!validatePassword(form.password)) nextErrors.password = 'Use at least 6 characters.';
    if (form.confirm !== form.password || !validateRequired(form.confirm)) {
      nextErrors.confirm = 'Passwords do not match.';
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    dispatch(clearError());
    try {
      const { confirm, ...payload } = form;
      await dispatch(
        register({
          ...payload,
          name: payload.name.trim(),
          email: payload.email.trim(),
          phone: payload.phone.trim(),
        })
      ).unwrap();
      Alert.alert('Welcome!', 'Your account has been created.');
    } catch (error) {
      Alert.alert('Registration failed', error || 'Please try again.');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.logo}>✨</Text>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Book rooms in just a few taps.</Text>
      </View>

      <View style={styles.card}>
        <InputField
          label="Full name"
          icon="👤"
          value={form.name}
          onChangeText={(v) => setField('name', v)}
          placeholder="Your name"
          error={errors.name}
        />
        <InputField
          label="Email"
          icon="✉️"
          value={form.email}
          onChangeText={(v) => setField('email', v)}
          placeholder="you@example.com"
          keyboardType="email-address"
          error={errors.email}
        />
        <InputField
          label="Phone"
          icon="📱"
          value={form.phone}
          onChangeText={(v) => setField('phone', v)}
          placeholder="09xxxxxxxx"
          keyboardType="phone-pad"
          error={errors.phone}
        />
        <InputField
          label="Password"
          icon="🔒"
          value={form.password}
          onChangeText={(v) => setField('password', v)}
          placeholder="At least 6 characters"
          secureTextEntry
          error={errors.password}
        />
        <InputField
          label="Confirm password"
          icon="🔐"
          value={form.confirm}
          onChangeText={(v) => setField('confirm', v)}
          placeholder="Repeat password"
          secureTextEntry
          error={errors.confirm}
        />
        <Button title="Create Account" onPress={handleRegister} loading={loading} />
      </View>

      <TouchableOpacity style={styles.linkRow} onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>Already have an account? </Text>
        <Text style={styles.linkStrong}>Sign in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 22, paddingTop: 48 },
  hero: { alignItems: 'center', marginBottom: 22 },
  logo: { fontSize: 46 },
  title: { fontSize: 25, fontWeight: '800', color: COLORS.text, marginTop: 8 },
  subtitle: { fontSize: 14, color: COLORS.muted, marginTop: 5 },
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
