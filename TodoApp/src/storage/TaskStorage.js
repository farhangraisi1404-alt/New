/**
 * فایل ذخیره‌سازی - TaskStorage.js
 * 
 * این فایل مسئول ذخیره و خواندن داده‌ها از حافظه گوشی است.
 * از AsyncStorage استفاده می‌کنیم که مثل localStorage در وب است.
 * 
 * AsyncStorage چیست؟
 * - یک فضای ذخیره‌سازی ساده روی گوشی
 * - داده‌ها حتی بعد از بستن اپ باقی می‌مانند
 * - داده‌ها به شکل key-value ذخیره می‌شوند (مثل دیکشنری)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// کلید ذخیره‌سازی - با این نام داده‌ها را پیدا می‌کنیم
const TASKS_STORAGE_KEY = '@todo_app_tasks';

/**
 * ذخیره کردن لیست تسک‌ها
 * @param {Array} tasks - آرایه‌ای از تسک‌ها
 */
export const saveTasks = async (tasks) => {
  try {
    // تبدیل آرایه به رشته JSON
    // چون AsyncStorage فقط رشته می‌پذیرد
    const jsonValue = JSON.stringify(tasks);
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, jsonValue);
    console.log('✅ تسک‌ها با موفقیت ذخیره شدند');
    return true;
  } catch (error) {
    console.error('❌ خطا در ذخیره تسک‌ها:', error);
    return false;
  }
};

/**
 * خواندن لیست تسک‌ها از حافظه
 * @returns {Array} آرایه‌ای از تسک‌ها یا آرایه خالی
 */
export const loadTasks = async () => {
  try {
    // خواندن رشته JSON از حافظه
    const jsonValue = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    
    if (jsonValue !== null) {
      // تبدیل رشته JSON به آرایه
      const tasks = JSON.parse(jsonValue);
      console.log(`📖 ${tasks.length} تسک از حافظه خوانده شد`);
      return tasks;
    }
    
    // اگر چیزی ذخیره نشده، آرایه خالی برگردان
    console.log('📭 هیچ تسکی در حافظه نیست');
    return [];
  } catch (error) {
    console.error('❌ خطا در خواندن تسک‌ها:', error);
    return [];
  }
};

/**
 * پاک کردن همه تسک‌ها از حافظه
 * این تابع برای تست یا ریست کردن اپ کاربرد دارد
 */
export const clearAllTasks = async () => {
  try {
    await AsyncStorage.removeItem(TASKS_STORAGE_KEY);
    console.log('🗑️ همه تسک‌ها پاک شدند');
    return true;
  } catch (error) {
    console.error('❌ خطا در پاک کردن تسک‌ها:', error);
    return false;
  }
};

/**
 * مثال ساختار یک تسک:
 * {
 *   id: '123abc',           // شناسه یکتا
 *   title: 'خرید نان',      // عنوان
 *   description: 'از نانوایی محل',  // توضیحات
 *   dueDate: '2024-01-15',  // تاریخ سررسید
 *   isCompleted: false,     // آیا انجام شده؟
 *   category: 'خرید',       // دسته‌بندی (برای نسخه 2)
 *   createdAt: '2024-01-10T10:30:00'  // زمان ساخت
 * }
 */
