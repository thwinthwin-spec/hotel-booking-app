/**
 * Reusable primary/secondary/outline/danger button.
 * Usage: <Button title="Login" onPress={handleLogin} loading={loading} />
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { COLORS } from '../utils/constants';

export default function Button({
  title,
  onPress,
  loading = false,
  variant = 'primary',
  disabled = false,
}) {
  const isDisabled = disabled || loading;
  const background =
    variant === 'secondary'
      ? COLORS.accent
      : variant === 'danger'
      ? COLORS.danger
      : variant === 'outline'
      ? COLORS.white
      : COLORS.primary;
  const textColor =
    variant === 'outline' || variant === 'secondary'
      ? COLORS.text
      : COLORS.white;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: background },
        variant === 'outline' && { borderWidth: 1, borderColor: COLORS.primary },
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  content: { flexDirection: 'row', alignItems: 'center' },
  text: { fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.55 },
});
