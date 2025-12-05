/**
 * فایل مدیریت State - TaskContext.js
 * 
 * Context چیست؟
 * - راهی برای به اشتراک گذاشتن داده‌ها بین همه صفحات و کامپوننت‌ها
 * - بدون نیاز به پاس دادن props از یک کامپوننت به کامپوننت دیگر
 * - مثل یک "مخزن مرکزی" برای داده‌ها
 * 
 * چرا از Context استفاده می‌کنیم؟
 * - تسک‌ها باید در همه صفحات قابل دسترسی باشند
 * - وقتی تسکی اضافه/حذف/ویرایش شود، همه جا آپدیت شود
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveTasks, loadTasks } from '../storage/TaskStorage';
import { generateId } from '../utils/helpers';

// ساخت Context
const TaskContext = createContext();

/**
 * TaskProvider - این کامپوننت داده‌ها را در دسترس همه قرار می‌دهد
 * در App.js همه صفحات را داخل این قرار می‌دهیم
 */
export function TaskProvider({ children }) {
  // State اصلی: لیست تسک‌ها
  const [tasks, setTasks] = useState([]);
  
  // State برای نشان دادن وضعیت بارگذاری
  const [isLoading, setIsLoading] = useState(true);
  
  // State برای فیلتر کردن (نسخه 2)
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'pending'
  
  // State برای دسته‌بندی انتخاب شده (نسخه 2)
  const [selectedCategory, setSelectedCategory] = useState('همه');
  
  // State برای جستجو (نسخه 2)
  const [searchQuery, setSearchQuery] = useState('');

  // وقتی اپ باز می‌شود، تسک‌ها را از حافظه بخوان
  useEffect(() => {
    const initializeTasks = async () => {
      setIsLoading(true);
      const savedTasks = await loadTasks();
      setTasks(savedTasks);
      setIsLoading(false);
    };
    initializeTasks();
  }, []);

  // هر وقت تسک‌ها تغییر کردند، در حافظه ذخیره کن
  useEffect(() => {
    // فقط بعد از بارگذاری اولیه ذخیره کن
    if (!isLoading) {
      saveTasks(tasks);
    }
  }, [tasks, isLoading]);

  // ======== توابع مدیریت تسک‌ها ========

  /**
   * افزودن تسک جدید
   * @param {Object} taskData - اطلاعات تسک جدید (بدون id و createdAt)
   */
  const addTask = (taskData) => {
    const newTask = {
      id: generateId(),                    // ساخت id یکتا
      title: taskData.title,
      description: taskData.description || '',
      dueDate: taskData.dueDate || '',
      isCompleted: false,
      category: taskData.category || 'عمومی',
      createdAt: new Date().toISOString(), // زمان فعلی
    };
    
    // اضافه کردن تسک جدید به اول لیست
    setTasks(prevTasks => [newTask, ...prevTasks]);
    
    return newTask;
  };

  /**
   * ویرایش تسک موجود
   * @param {string} taskId - شناسه تسک
   * @param {Object} updates - فیلدهایی که باید تغییر کنند
   */
  const updateTask = (taskId, updates) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, ...updates }  // ترکیب داده‌های قدیمی با جدید
          : task
      )
    );
  };

  /**
   * تغییر وضعیت انجام شده/نشده
   * @param {string} taskId - شناسه تسک
   */
  const toggleTaskCompletion = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, isCompleted: !task.isCompleted }
          : task
      )
    );
  };

  /**
   * حذف تسک
   * @param {string} taskId - شناسه تسک
   */
  const deleteTask = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.filter(task => task.id !== taskId)
    );
  };

  /**
   * پیدا کردن یک تسک با id
   * @param {string} taskId - شناسه تسک
   * @returns {Object|undefined} تسک پیدا شده یا undefined
   */
  const getTaskById = (taskId) => {
    return tasks.find(task => task.id === taskId);
  };

  /**
   * گرفتن تسک‌های فیلتر شده
   * بر اساس وضعیت (همه/انجام‌شده/در انتظار)، دسته‌بندی و جستجو
   */
  const getFilteredTasks = () => {
    let filtered = tasks;
    
    // فیلتر بر اساس جستجو (نسخه 2)
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }
    
    // فیلتر بر اساس وضعیت
    if (filter === 'completed') {
      filtered = filtered.filter(task => task.isCompleted);
    } else if (filter === 'pending') {
      filtered = filtered.filter(task => !task.isCompleted);
    }
    
    // فیلتر بر اساس دسته‌بندی (نسخه 2)
    if (selectedCategory !== 'همه') {
      filtered = filtered.filter(task => task.category === selectedCategory);
    }
    
    return filtered;
  };

  /**
   * گرفتن لیست همه دسته‌بندی‌های موجود
   */
  const getCategories = () => {
    const categories = ['همه'];
    tasks.forEach(task => {
      if (task.category && !categories.includes(task.category)) {
        categories.push(task.category);
      }
    });
    return categories;
  };

  /**
   * گرفتن آمار تسک‌ها
   */
  const getStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.isCompleted).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, pending, completionRate };
  };

  // مقادیری که در اختیار همه کامپوننت‌ها قرار می‌گیرد
  const value = {
    // داده‌ها
    tasks,
    isLoading,
    filter,
    selectedCategory,
    searchQuery,
    
    // توابع مدیریت تسک
    addTask,
    updateTask,
    toggleTaskCompletion,
    deleteTask,
    getTaskById,
    
    // توابع فیلتر و آمار
    setFilter,
    setSelectedCategory,
    setSearchQuery,
    getFilteredTasks,
    getCategories,
    getStats,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}

/**
 * useTaskContext - Hook سفارشی برای استفاده راحت از Context
 * 
 * به جای نوشتن:
 *   const context = useContext(TaskContext);
 * 
 * می‌نویسیم:
 *   const { tasks, addTask } = useTaskContext();
 */
export function useTaskContext() {
  const context = useContext(TaskContext);
  
  if (!context) {
    throw new Error('useTaskContext باید داخل TaskProvider استفاده شود');
  }
  
  return context;
}
