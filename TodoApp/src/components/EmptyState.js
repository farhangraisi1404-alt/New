/**
 * کامپوننت EmptyState - نمایش وقتی لیست خالی است
 * 
 * این کامپوننت یک پیام دوستانه نشان می‌دهد وقتی که هیچ تسکی وجود ندارد.
 * باعث می‌شود اپ حس خالی و سرد نداشته باشد.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * props (ورودی‌ها):
 * - title: عنوان پیام
 * - message: متن توضیحی
 * - icon: نام آیکون (از مجموعه Ionicons)
 */
export default function EmptyState({
  title = 'لیست خالی است',
  message = 'هنوز تسکی اضافه نکردی!',
  icon = 'clipboard-outline',
}) {
  return (
    <View style={styles.container}>
      {/* آیکون بزرگ */}
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={80} color="#D1D5DB" />
      </View>

      {/* عنوان */}
      <Text style={styles.title}>{title}</Text>

      {/* توضیح */}
      <Text style={styles.message}>{message}</Text>

      {/* راهنما */}
      <View style={styles.hint}>
        <Ionicons name="add-circle" size={20} color="#4A90D9" />
        <Text style={styles.hintText}>
          دکمه + را بزن تا اولین تسکت را اضافه کنی
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconContainer: {
    marginBottom: 24,
    opacity: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  hint: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  hintText: {
    fontSize: 14,
    color: '#4A90D9',
  },
});
