/**
 * کامپوننت FilterBar - نوار فیلتر تسک‌ها
 * 
 * این کامپوننت به کاربر اجازه می‌دهد تسک‌ها را فیلتر کند:
 * - همه تسک‌ها
 * - فقط انجام‌نشده‌ها
 * - فقط انجام‌شده‌ها
 * - بر اساس دسته‌بندی
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTaskContext } from '../context/TaskContext';
import { getCategoryColor } from '../utils/helpers';

export default function FilterBar() {
  const {
    filter,
    setFilter,
    selectedCategory,
    setSelectedCategory,
    getCategories,
    getStats,
  } = useTaskContext();

  const categories = getCategories();
  const stats = getStats();

  // گزینه‌های فیلتر وضعیت
  const statusFilters = [
    { key: 'all', label: 'همه', icon: 'list', count: stats.total },
    { key: 'pending', label: 'در انتظار', icon: 'time-outline', count: stats.pending },
    { key: 'completed', label: 'انجام‌شده', icon: 'checkmark-circle-outline', count: stats.completed },
  ];

  return (
    <View style={styles.container}>
      {/* فیلتر وضعیت */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {statusFilters.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.filterChip,
              filter === item.key && styles.filterChipActive,
            ]}
            onPress={() => setFilter(item.key)}
          >
            <Ionicons
              name={item.icon}
              size={16}
              color={filter === item.key ? '#fff' : '#6B7280'}
            />
            <Text
              style={[
                styles.filterChipText,
                filter === item.key && styles.filterChipTextActive,
              ]}
            >
              {item.label}
            </Text>
            <View
              style={[
                styles.countBadge,
                filter === item.key && styles.countBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.countText,
                  filter === item.key && styles.countTextActive,
                ]}
              >
                {item.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* فیلتر دسته‌بندی (اگر بیش از یک دسته‌بندی وجود داشت) */}
      {categories.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && {
                  backgroundColor: cat === 'همه' ? '#4A90D9' : getCategoryColor(cat),
                },
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterRow: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 16,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#4A90D9',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  countText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  countTextActive: {
    color: '#fff',
  },
  categoryRow: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryChipText: {
    fontSize: 13,
    color: '#6B7280',
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
