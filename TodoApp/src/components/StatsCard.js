/**
 * کامپوننت StatsCard - نمایش آمار تسک‌ها
 * 
 * این کامپوننت یک نمای کلی از وضعیت تسک‌ها نشان می‌دهد:
 * - تعداد کل تسک‌ها
 * - تعداد انجام‌شده
 * - تعداد در انتظار
 * - درصد تکمیل
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTaskContext } from '../context/TaskContext';

export default function StatsCard() {
  const { getStats } = useTaskContext();
  const stats = getStats();

  // اگر هیچ تسکی نیست، کارت را نشان نده
  if (stats.total === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* نوار پیشرفت */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${stats.completionRate}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{stats.completionRate}%</Text>
      </View>

      {/* آمار */}
      <View style={styles.statsRow}>
        {/* کل */}
        <View style={styles.statItem}>
          <Ionicons name="layers-outline" size={20} color="#6B7280" />
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>کل</Text>
        </View>

        {/* انجام‌شده */}
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={[styles.statNumber, { color: '#10B981' }]}>
            {stats.completed}
          </Text>
          <Text style={styles.statLabel}>انجام‌شده</Text>
        </View>

        {/* در انتظار */}
        <View style={styles.statItem}>
          <Ionicons name="time" size={20} color="#F59E0B" />
          <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
            {stats.pending}
          </Text>
          <Text style={styles.statLabel}>در انتظار</Text>
        </View>
      </View>

      {/* پیام تشویقی */}
      {stats.completionRate === 100 && (
        <View style={styles.congratsContainer}>
          <Text style={styles.congratsText}>🎉 آفرین! همه کارها انجام شد!</Text>
        </View>
      )}

      {stats.completionRate >= 50 && stats.completionRate < 100 && (
        <View style={styles.motivationContainer}>
          <Text style={styles.motivationText}>💪 عالی پیش میری! ادامه بده!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
    width: 50,
    textAlign: 'left',
  },
  statsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  congratsContainer: {
    marginTop: 16,
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
  },
  congratsText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
  },
  motivationContainer: {
    marginTop: 16,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
  },
  motivationText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
});
