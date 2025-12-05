/**
 * صفحه افزودن تسک - AddTaskScreen.js
 * 
 * این صفحه فرم افزودن تسک جدید را نشان می‌دهد.
 * وقتی کاربر فرم را پر کرد و دکمه ذخیره را زد:
 * 1. تسک جدید به لیست اضافه می‌شود
 * 2. کاربر به صفحه اصلی برمی‌گردد
 */

import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';

// وارد کردن کامپوننت فرم
import TaskForm from '../components/TaskForm';

// وارد کردن Context
import { useTaskContext } from '../context/TaskContext';

export default function AddTaskScreen({ navigation }) {
  // گرفتن تابع addTask از Context
  const { addTask } = useTaskContext();

  // وقتی فرم ارسال می‌شود
  const handleSubmit = (taskData) => {
    // افزودن تسک به لیست
    const newTask = addTask(taskData);

    // نمایش پیام موفقیت
    Alert.alert(
      '✅ تسک اضافه شد',
      `"${newTask.title}" با موفقیت به لیست اضافه شد!`,
      [
        {
          text: 'عالی!',
          onPress: () => {
            // برگشت به صفحه اصلی
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TaskForm
        onSubmit={handleSubmit}
        submitButtonText="افزودن تسک"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
