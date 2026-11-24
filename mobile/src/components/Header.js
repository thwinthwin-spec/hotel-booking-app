/**
 * Screen header with optional back arrow and right-side slot.
 * Usage: <Header title="My Bookings" showBack navigation={navigation} />
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { COLORS } from '../utils/constants';

export default function Header({ title, showBack, navigation, right }) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack && navigation ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        ) : null}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 48 : (StatusBar.currentHeight || 24) + 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backButton: { paddingRight: 10 },
  backText: { fontSize: 24, color: COLORS.primary, lineHeight: 28 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text, flex: 1 },
  right: { marginLeft: 8 },
});
