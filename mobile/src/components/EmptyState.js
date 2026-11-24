/** Friendly empty-list placeholder with an optional action button. */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

export default function EmptyState({
  icon = '📭',
  title = 'Nothing here yet',
  message = 'Check back soon.',
  actionLabel,
  onAction,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.action} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  icon: { fontSize: 44, marginBottom: 12 },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  message: { fontSize: 14, color: COLORS.muted, textAlign: 'center', marginTop: 6 },
  action: {
    marginTop: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  actionText: { color: COLORS.white, fontWeight: '700' },
});
