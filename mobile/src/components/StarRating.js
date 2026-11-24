/**
 * Five-star rating display. Pass onChange to make it interactive.
 * Usage: <StarRating value={rating} onChange={setRating} size={28} />
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

export default function StarRating({ value = 0, onChange, readonly = false, size = 22 }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={styles.row}>
      {stars.map((star) => {
        const filled = star <= Math.round(Number(value) || 0);
        const content = (
          <Text style={{ fontSize: size, color: filled ? COLORS.accent : COLORS.border }}>
            ★
          </Text>
        );
        if (readonly || !onChange) return <Text key={star}>{content}</Text>;
        return (
          <TouchableOpacity
            key={star}
            onPress={() => onChange(star)}
            style={styles.starButton}
            accessibilityLabel={`${star} star`}
          >
            {content}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  starButton: { paddingHorizontal: 2 },
});
