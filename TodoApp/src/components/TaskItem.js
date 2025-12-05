/**
 * کامپوننت TaskItem - نمایش هر تسک در لیست
 * 
 * این کامپوننت مسئول نمایش یک تسک با همه جزئیاتش است.
 * امکانات:
 * - نمایش عنوان، توضیح، تاریخ و دسته‌بندی
 * - دکمه تیک زدن برای تکمیل/لغو تکمیل
 * - دکمه حذف
 * - قابلیت کلیک برای ویرایش
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDateSimple, isOverdue, isToday, truncateText, getCategoryColor } from '../utils/helpers';
import { useTaskContext } from '../context/TaskContext';

/**
 * props (ورودی‌ها):
 * - task: آبجکت تسک
 * - onPress: تابعی که وقتی روی تسک کلیک شود اجرا می‌شود
 */
export default function TaskItem({ task, onPress }) {
  // گرفتن توابع از Context
  const { toggleTaskCompletion, deleteTask } = useTaskContext();

  // وقتی دکمه تیک زده می‌شود
  const handleToggle = () => {
    toggleTaskCompletion(task.id);
  };

  // وقتی دکمه حذف زده می‌شود
  const handleDelete = () => {
    // نمایش پیام تأیید قبل از حذف
    Alert.alert(
      '🗑️ حذف تسک',
      `آیا مطمئنید می‌خواهید "${task.title}" را حذف کنید؟`,
      [
        {
          text: 'انصراف',
          style: 'cancel',
        },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => deleteTask(task.id),
        },
      ]
    );
  };

  // تعیین وضعیت تاریخ
  const overdue = !task.isCompleted && isOverdue(task.dueDate);
  const today = isToday(task.dueDate);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        task.isCompleted && styles.completedContainer,
        overdue && styles.overdueContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* دکمه تیک */}
      <TouchableOpacity
        style={[
          styles.checkbox,
          task.isCompleted && styles.checkboxCompleted,
        ]}
        onPress={handleToggle}
      >
        {task.isCompleted && (
          <Ionicons name="checkmark" size={18} color="#fff" />
        )}
      </TouchableOpacity>

      {/* محتوای تسک */}
      <View style={styles.content}>
        {/* عنوان */}
        <Text
          style={[
            styles.title,
            task.isCompleted && styles.completedText,
          ]}
          numberOfLines={1}
        >
          {task.title}
        </Text>

        {/* توضیحات (اگر وجود داشت) */}
        {task.description ? (
          <Text
            style={[
              styles.description,
              task.isCompleted && styles.completedText,
            ]}
            numberOfLines={2}
          >
            {truncateText(task.description, 60)}
          </Text>
        ) : null}

        {/* ردیف پایین: تاریخ و دسته‌بندی */}
        <View style={styles.metaRow}>
          {/* تاریخ */}
          {task.dueDate ? (
            <View style={[
              styles.dateContainer,
              overdue && styles.overdueDate,
              today && styles.todayDate,
            ]}>
              <Ionicons
                name="calendar-outline"
                size={12}
                color={overdue ? '#EF4444' : today ? '#3B82F6' : '#6B7280'}
              />
              <Text style={[
                styles.dateText,
                overdue && styles.overdueDateText,
                today && styles.todayDateText,
              ]}>
                {today ? 'امروز' : formatDateSimple(task.dueDate)}
              </Text>
            </View>
          ) : null}

          {/* دسته‌بندی */}
          {task.category && task.category !== 'عمومی' ? (
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: getCategoryColor(task.category) + '20' },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: getCategoryColor(task.category) },
                ]}
              >
                {task.category}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* دکمه حذف */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    // سایه برای iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // سایه برای Android
    elevation: 3,
  },
  completedContainer: {
    backgroundColor: '#F0FDF4',
    opacity: 0.8,
  },
  overdueContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#4A90D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'right',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'right',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  metaRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  dateContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  overdueDate: {
    // استایل اضافی برای تاریخ گذشته
  },
  overdueDateText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  todayDate: {
    // استایل اضافی برای امروز
  },
  todayDateText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});
