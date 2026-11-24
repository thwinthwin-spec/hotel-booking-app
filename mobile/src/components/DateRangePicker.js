/**
 * Check-in / check-out picker backed by react-native-calendars DateRangePicker.
 * Usage: <DateRangePicker checkIn={checkIn} checkOut={checkOut} onChange={({checkIn,checkOut}) => ...} />
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DateRangePicker as CalendarDateRangePicker } from 'react-native-calendars';
import { COLORS } from '../utils/constants';
import { formatDate, formatNights } from '../utils/formatters';

export default function DateRangePicker({ checkIn, checkOut, onChange }) {
  const handleStart = (day) => {
    onChange({
      checkIn: day?.dateString || '',
      checkOut: checkOut || '',
    });
  };

  const handleEnd = (day) => {
    onChange({
      checkIn: checkIn || '',
      checkOut: day?.dateString || '',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.label}>CHECK IN</Text>
          <Text style={styles.value}>{formatDate(checkIn)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.label}>CHECK OUT</Text>
          <Text style={styles.value}>{formatDate(checkOut)}</Text>
        </View>
        <View style={styles.nights}>
          <Text style={styles.nightsText}>{formatNights(checkIn, checkOut)} nights</Text>
        </View>
      </View>
      <CalendarDateRangePicker
        initialStartDate={checkIn || undefined}
        initialEndDate={checkOut || undefined}
        onStartChange={handleStart}
        onEndChange={handleEnd}
        minDate={new Date().toISOString().split('T')[0]}
        startDatesLabel="Check in"
        endDatesLabel="Check out"
        renderHeader={(date) => (
          <Text style={styles.calendarHeader}>
            {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  summary: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 12,
    alignItems: 'center',
  },
  summaryItem: { flex: 1 },
  label: { fontSize: 10, color: COLORS.muted, fontWeight: '700' },
  value: { fontSize: 14, color: COLORS.text, fontWeight: '600', marginTop: 3 },
  nights: { backgroundColor: '#EAF3EF', borderRadius: 12, paddingVertical: 5, paddingHorizontal: 9 },
  nightsText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  calendarHeader: { fontSize: 16, fontWeight: '700', color: COLORS.text },
});
