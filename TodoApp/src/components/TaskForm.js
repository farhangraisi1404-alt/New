/**
 * کامپوننت TaskForm - فرم افزودن/ویرایش تسک
 * 
 * این کامپوننت یک فرم کامل برای وارد کردن اطلاعات تسک است.
 * شامل:
 * - فیلد عنوان (اجباری)
 * - فیلد توضیحات (اختیاری)
 * - انتخاب تاریخ (اختیاری)
 * - انتخاب دسته‌بندی (اختیاری)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DEFAULT_CATEGORIES, getCategoryColor } from '../utils/helpers';

/**
 * props (ورودی‌ها):
 * - initialData: داده‌های اولیه (برای ویرایش)
 * - onSubmit: تابعی که وقتی فرم ارسال شود اجرا می‌شود
 * - submitButtonText: متن دکمه ارسال
 */
export default function TaskForm({
  initialData = {},
  onSubmit,
  submitButtonText = 'ذخیره',
}) {
  // State های فرم
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [dueDate, setDueDate] = useState(initialData.dueDate || '');
  const [category, setCategory] = useState(initialData.category || 'عمومی');

  // اعتبارسنجی و ارسال فرم
  const handleSubmit = () => {
    // بررسی پر بودن عنوان
    if (!title.trim()) {
      Alert.alert('⚠️ خطا', 'لطفاً عنوان تسک را وارد کنید');
      return;
    }

    // ارسال داده‌ها به کامپوننت پدر
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      category,
    });
  };

  // تنظیم تاریخ امروز
  const setToday = () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // فرمت: 2024-01-15
    setDueDate(dateStr);
  };

  // تنظیم تاریخ فردا
  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setDueDate(dateStr);
  };

  // تنظیم تاریخ هفته آینده
  const setNextWeek = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dateStr = nextWeek.toISOString().split('T')[0];
    setDueDate(dateStr);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* فیلد عنوان */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>عنوان تسک *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="مثلاً: خرید نان"
          placeholderTextColor="#9CA3AF"
          textAlign="right"
        />
      </View>

      {/* فیلد توضیحات */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>توضیحات</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="جزئیات بیشتر..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          textAlign="right"
        />
      </View>

      {/* فیلد تاریخ */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>تاریخ سررسید</Text>
        
        {/* دکمه‌های انتخاب سریع */}
        <View style={styles.quickDateButtons}>
          <TouchableOpacity
            style={[styles.quickDateBtn, dueDate && new Date(dueDate).toDateString() === new Date().toDateString() && styles.quickDateBtnActive]}
            onPress={setToday}
          >
            <Text style={styles.quickDateText}>امروز</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickDateBtn}
            onPress={setTomorrow}
          >
            <Text style={styles.quickDateText}>فردا</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickDateBtn}
            onPress={setNextWeek}
          >
            <Text style={styles.quickDateText}>هفته آینده</Text>
          </TouchableOpacity>
        </View>

        {/* نمایش تاریخ انتخاب شده */}
        <View style={styles.dateInputContainer}>
          <TextInput
            style={[styles.input, styles.dateInput]}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD مثلاً 2024-01-15"
            placeholderTextColor="#9CA3AF"
            textAlign="right"
          />
          {dueDate ? (
            <TouchableOpacity
              style={styles.clearDateBtn}
              onPress={() => setDueDate('')}
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* فیلد دسته‌بندی */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>دسته‌بندی</Text>
        <View style={styles.categoriesContainer}>
          {DEFAULT_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                category === cat && {
                  backgroundColor: getCategoryColor(cat),
                },
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  category === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* دکمه ارسال */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        activeOpacity={0.8}
      >
        <Ionicons name="checkmark-circle" size={24} color="#fff" />
        <Text style={styles.submitButtonText}>{submitButtonText}</Text>
      </TouchableOpacity>

      {/* فضای اضافی برای اسکرول راحت‌تر */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  quickDateButtons: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginBottom: 10,
  },
  quickDateBtn: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickDateBtnActive: {
    backgroundColor: '#4A90D9',
  },
  quickDateText: {
    fontSize: 14,
    color: '#374151',
  },
  dateInputContainer: {
    position: 'relative',
  },
  dateInput: {
    paddingRight: 40,
  },
  clearDateBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  categoriesContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#374151',
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#4A90D9',
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
