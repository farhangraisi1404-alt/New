/**
 * صفحه ویرایش تسک - EditTaskScreen.js
 * 
 * این صفحه اطلاعات یک تسک موجود را نشان می‌دهد و اجازه ویرایش می‌دهد.
 * 
 * route چیست؟
 * - یک آبجکت که اطلاعات صفحه فعلی را دارد
 * - route.params شامل پارامترهایی است که از صفحه قبل فرستاده شده
 * - در اینجا route.params.taskId شناسه تسک است
 */

import React from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';

// وارد کردن کامپوننت فرم
import TaskForm from '../components/TaskForm';

// وارد کردن Context
import { useTaskContext } from '../context/TaskContext';

export default function EditTaskScreen({ navigation, route }) {
  // گرفتن id تسک از پارامترها
  const { taskId } = route.params;

  // گرفتن توابع از Context
  const { getTaskById, updateTask } = useTaskContext();

  // پیدا کردن تسک
  const task = getTaskById(taskId);

  // اگر تسک پیدا نشد
  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ تسک پیدا نشد!</Text>
      </View>
    );
  }

  // وقتی فرم ارسال می‌شود
  const handleSubmit = (updatedData) => {
    // آپدیت کردن تسک
    updateTask(taskId, updatedData);

    // نمایش پیام موفقیت
    Alert.alert(
      '✅ تسک ویرایش شد',
      'تغییرات با موفقیت ذخیره شد!',
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
        initialData={task}
        onSubmit={handleSubmit}
        submitButtonText="ذخیره تغییرات"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
  },
});
