/**
 * صفحه اصلی - HomeScreen.js
 * 
 * این صفحه اولین چیزی است که کاربر می‌بیند.
 * شامل:
 * - کارت آمار (StatsCard)
 * - نوار فیلتر (FilterBar)
 * - لیست تسک‌ها
 * - دکمه افزودن تسک جدید
 */

import React from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// وارد کردن کامپوننت‌ها
import TaskItem from '../components/TaskItem';
import EmptyState from '../components/EmptyState';
import FilterBar from '../components/FilterBar';
import StatsCard from '../components/StatsCard';
import SearchBar from '../components/SearchBar';

// وارد کردن Context
import { useTaskContext } from '../context/TaskContext';

/**
 * navigation چیست؟
 * - یک آبجکت که React Navigation به صفحه می‌دهد
 * - با آن می‌توانیم به صفحات دیگر برویم
 * - مثال: navigation.navigate('AddTask') ما را به صفحه افزودن تسک می‌برد
 */
export default function HomeScreen({ navigation }) {
  // گرفتن داده‌ها و توابع از Context
  const { isLoading, getFilteredTasks, searchQuery, setSearchQuery } = useTaskContext();

  // گرفتن تسک‌های فیلتر شده
  const filteredTasks = getFilteredTasks();

  // اگر در حال بارگذاری است، اسپینر نشان بده
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  // رفتن به صفحه ویرایش تسک
  const handleTaskPress = (task) => {
    // پاس دادن id تسک به صفحه ویرایش
    navigation.navigate('EditTask', { taskId: task.id });
  };

  // رفتن به صفحه افزودن تسک
  const handleAddPress = () => {
    navigation.navigate('AddTask');
  };

  return (
    <View style={styles.container}>
      {/* نوار جستجو (نسخه ۲) */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="جستجو در تسک‌ها..."
      />

      {/* کارت آمار */}
      <StatsCard />

      {/* نوار فیلتر */}
      <FilterBar />

      {/* لیست تسک‌ها */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onPress={() => handleTaskPress(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="هیچ تسکی نداری!"
            message="وقتشه کارهات رو برنامه‌ریزی کنی 📝"
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* دکمه افزودن (FAB - Floating Action Button) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddPress}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 100, // فضا برای دکمه FAB
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90D9',
    justifyContent: 'center',
    alignItems: 'center',
    // سایه برای iOS
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    // سایه برای Android
    elevation: 8,
  },
});
