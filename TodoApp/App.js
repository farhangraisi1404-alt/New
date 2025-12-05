/**
 * فایل اصلی برنامه - App.js
 * 
 * این فایل نقطه شروع اپلیکیشن است.
 * کارهایی که انجام می‌دهد:
 * 1. Navigation (ناوبری) را تنظیم می‌کند - یعنی کاربر چطور بین صفحات جابجا شود
 * 2. TaskProvider را فعال می‌کند - یعنی داده‌های تسک‌ها در همه صفحات قابل دسترسی باشند
 * 3. صفحات مختلف اپ را تعریف می‌کند
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// وارد کردن صفحات
import HomeScreen from './src/screens/HomeScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import EditTaskScreen from './src/screens/EditTaskScreen';

// وارد کردن Provider برای مدیریت state
import { TaskProvider } from './src/context/TaskContext';

// ساخت Stack Navigator - این به ما اجازه می‌دهد صفحات را روی هم قرار دهیم
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    // TaskProvider همه داده‌ها را در دسترس تمام صفحات قرار می‌دهد
    <TaskProvider>
      {/* NavigationContainer سیستم ناوبری را مدیریت می‌کند */}
      <NavigationContainer>
        {/* Stack.Navigator صفحات را به شکل پشته مدیریت می‌کند */}
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            // استایل‌های کلی برای همه صفحات
            headerStyle: {
              backgroundColor: '#4A90D9',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          {/* صفحه اصلی - لیست تسک‌ها */}
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
              title: '📋 کارهای من',
            }}
          />
          
          {/* صفحه افزودن تسک جدید */}
          <Stack.Screen 
            name="AddTask" 
            component={AddTaskScreen}
            options={{
              title: '➕ تسک جدید',
            }}
          />
          
          {/* صفحه ویرایش تسک */}
          <Stack.Screen 
            name="EditTask" 
            component={EditTaskScreen}
            options={{
              title: '✏️ ویرایش تسک',
            }}
          />
        </Stack.Navigator>
        
        {/* StatusBar نوار بالای گوشی را تنظیم می‌کند */}
        <StatusBar style="light" />
      </NavigationContainer>
    </TaskProvider>
  );
}
