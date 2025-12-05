/**
 * کامپوننت SearchBar - نوار جستجو (نسخه ۲)
 * 
 * این کامپوننت به کاربر اجازه می‌دهد در تسک‌ها جستجو کند.
 * جستجو در عنوان و توضیحات انجام می‌شود.
 */

import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * props (ورودی‌ها):
 * - value: مقدار فعلی جستجو
 * - onChangeText: تابعی که وقتی متن تغییر کند اجرا می‌شود
 * - placeholder: متن راهنما
 */
export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'جستجو در تسک‌ها...',
}) {
  // پاک کردن جستجو
  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={styles.container}>
      {/* آیکون جستجو */}
      <Ionicons name="search" size={20} color="#9CA3AF" style={styles.icon} />

      {/* فیلد جستجو */}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        textAlign="right"
        returnKeyType="search"
      />

      {/* دکمه پاک کردن (وقتی متنی وجود دارد) */}
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  icon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  clearButton: {
    padding: 4,
    marginRight: 8,
  },
});
