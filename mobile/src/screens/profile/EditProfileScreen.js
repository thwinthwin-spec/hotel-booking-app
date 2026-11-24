/** Edit name, phone, and avatar URL through PUT /auth/profile. */
import React, { useState } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/Header';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { updateProfile } from '../../redux/authSlice';
import { COLORS } from '../../utils/constants';
import { validatePhone, validateRequired } from '../../utils/validators';

export default function EditProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user) || {};
  const loading = useSelector((state) => state.auth.loading);
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [errors, setErrors] = useState({});

  const handleSave = async () => {
    const nextErrors = {};
    if (!validateRequired(name)) nextErrors.name = 'Name is required.';
    if (phone && !validatePhone(phone)) nextErrors.phone = 'Enter a valid phone number.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    try {
      await dispatch(
        updateProfile({ name: name.trim(), phone: phone.trim(), avatar: avatar.trim() })
      ).unwrap();
      Alert.alert('Saved', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error || 'Could not update your profile.');
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="Edit Profile" showBack navigation={navigation} />
      <ScrollView contentContainerStyle={styles.content}>
        <InputField label="Full name" icon="👤" value={name} onChangeText={setName} error={errors.name} />
        <InputField
          label="Phone"
          icon="📱"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          error={errors.phone}
        />
        <InputField
          label="Avatar URL (optional)"
          icon="🖼️"
          value={avatar}
          onChangeText={setAvatar}
          placeholder="https://example.com/photo.jpg"
        />
        <Button title="Save Changes" onPress={handleSave} loading={loading} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 18 },
});
