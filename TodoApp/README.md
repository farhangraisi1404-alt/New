# 📋 اپلیکیشن مدیریت کارهای روزانه (To-Do List)

یک اپلیکیشن موبایل ساده و زیبا برای مدیریت کارهای روزانه، ساخته شده با React Native و Expo.

![React Native](https://img.shields.io/badge/React_Native-0.73-blue)
![Expo](https://img.shields.io/badge/Expo-50-black)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green)

---

## 📁 ساختار پروژه

```
TodoApp/
├── App.js                    # فایل اصلی برنامه
├── app.json                  # تنظیمات Expo
├── package.json              # لیست وابستگی‌ها
├── babel.config.js           # تنظیمات Babel
│
├── src/                      # کدهای اصلی
│   ├── components/           # کامپوننت‌های قابل استفاده مجدد
│   │   ├── TaskItem.js       # نمایش هر تسک
│   │   ├── TaskForm.js       # فرم افزودن/ویرایش
│   │   ├── EmptyState.js     # نمایش لیست خالی
│   │   ├── FilterBar.js      # نوار فیلتر
│   │   └── StatsCard.js      # کارت آمار
│   │
│   ├── screens/              # صفحات اپلیکیشن
│   │   ├── HomeScreen.js     # صفحه اصلی
│   │   ├── AddTaskScreen.js  # صفحه افزودن
│   │   └── EditTaskScreen.js # صفحه ویرایش
│   │
│   ├── context/              # مدیریت State
│   │   └── TaskContext.js    # Context تسک‌ها
│   │
│   ├── storage/              # ذخیره‌سازی
│   │   └── TaskStorage.js    # توابع AsyncStorage
│   │
│   └── utils/                # توابع کمکی
│       └── helpers.js        # توابع عمومی
│
└── assets/                   # فایل‌های گرافیکی
    ├── icon.png
    ├── splash.png
    └── adaptive-icon.png
```

---

## 🚀 راه‌اندازی پروژه (گام به گام)

### مرحله ۱: نصب Node.js

Node.js یک محیط اجرای JavaScript است که برای React Native لازم است.

**ویندوز:**
1. به [nodejs.org](https://nodejs.org) برو
2. نسخه LTS را دانلود کن (مثلاً 18.x یا 20.x)
3. فایل نصب را اجرا کن و Next بزن تا تمام شود

**مک:**
```bash
# با Homebrew
brew install node

# یا از سایت nodejs.org دانلود کن
```

**لینوکس (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**بررسی نصب:**
```bash
node --version    # باید چیزی مثل v20.x.x نشان دهد
npm --version     # باید چیزی مثل 10.x.x نشان دهد
```

---

### مرحله ۲: نصب Expo CLI

Expo ابزاری است که توسعه React Native را آسان می‌کند.

```bash
npm install -g expo-cli
```

یا اگر از npm استفاده نمی‌کنی:
```bash
npx expo --version
```

---

### مرحله ۳: نصب وابستگی‌های پروژه

ترمینال را باز کن و به پوشه پروژه برو:

```bash
cd TodoApp
npm install
```

این دستور همه کتابخانه‌های لازم را نصب می‌کند (ممکن است چند دقیقه طول بکشد).

---

### مرحله ۴: اجرای پروژه

```bash
npx expo start
```

بعد از اجرا، یک QR Code در ترمینال نشان داده می‌شود.

---

## 📱 تست روی موبایل

### روش ۱: با اپ Expo Go (ساده‌ترین)

1. اپ **Expo Go** را از فروشگاه گوشی دانلود کن:
   - [Android - Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. اپ Expo Go را باز کن

3. **Android:** QR Code را اسکن کن
   **iOS:** دوربین را روی QR Code بگیر

4. اپ روی گوشیت اجرا می‌شود! 🎉

### روش ۲: با شبیه‌ساز (Emulator)

**Android Emulator:**
1. Android Studio را نصب کن
2. یک Virtual Device بساز
3. در ترمینال بزن: `a` (برای Android)

**iOS Simulator (فقط مک):**
1. Xcode را از App Store نصب کن
2. در ترمینال بزن: `i` (برای iOS)

### روش ۳: وب (برای تست سریع)

در ترمینال بزن: `w`
اپ در مرورگر باز می‌شود.

---

## 🎯 امکانات اپلیکیشن

### نسخه اول (MVP):
- ✅ ساخت تسک جدید (عنوان، توضیح، تاریخ، دسته‌بندی)
- ✅ لیست کردن همه تسک‌ها
- ✅ تیک زدن تسک‌ها (انجام شده / نشده)
- ✅ ویرایش تسک
- ✅ حذف تسک
- ✅ ذخیره خودکار در حافظه گوشی
- ✅ نمایش آمار (تعداد کل، انجام‌شده، در انتظار)
- ✅ فیلتر تسک‌ها (همه، انجام‌شده، در انتظار)
- ✅ دسته‌بندی تسک‌ها

### نسخه ۲ (ایده‌ها برای آینده):
- 🔔 یادآور و نوتیفیکیشن
- 🌙 تم تاریک
- 🔍 جستجو در تسک‌ها
- 📊 گزارش هفتگی/ماهانه
- ☁️ همگام‌سازی با سرور
- 👥 اشتراک‌گذاری با دیگران

---

## 🔧 دستورات مفید

```bash
# شروع پروژه
npx expo start

# پاک کردن cache
npx expo start --clear

# اجرا روی Android
npx expo start --android

# اجرا روی iOS
npx expo start --ios

# اجرا در وب
npx expo start --web

# نصب پکیج جدید
npx expo install [package-name]

# ساخت نسخه production
eas build --platform android
eas build --platform ios
```

---

## 📚 منابع یادگیری

اگر می‌خواهی بیشتر یاد بگیری:

1. **React Native - مستندات رسمی:**
   https://reactnative.dev/docs/getting-started

2. **Expo - مستندات:**
   https://docs.expo.dev/

3. **آموزش فارسی React Native:**
   - ویدیوهای یوتیوب
   - دوره‌های آپارات

4. **کتابخانه‌های مفید:**
   - React Navigation (ناوبری)
   - AsyncStorage (ذخیره‌سازی)
   - React Native Paper (کامپوننت‌های UI)

---

## ❓ سوالات متداول

**س: چرا اپ روی گوشی باز نمی‌شود؟**
ج: مطمئن شو گوشی و کامپیوتر به یک WiFi متصل هستند.

**س: نصب وابستگی‌ها خطا می‌دهد؟**
ج: `npm cache clean --force` را اجرا کن و دوباره امتحان کن.

**س: چطور اپ را منتشر کنم؟**
ج: از EAS Build استفاده کن: https://docs.expo.dev/build/introduction/

---

## 📝 چک‌لیست راه‌اندازی

- [ ] Node.js نصب شد
- [ ] npm install اجرا شد
- [ ] Expo Go روی گوشی نصب شد
- [ ] `npx expo start` اجرا شد
- [ ] QR Code اسکن شد
- [ ] اپ روی گوشی باز شد ✨

---

ساخته شده با ❤️ برای یادگیری React Native
