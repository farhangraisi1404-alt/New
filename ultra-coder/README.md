# ⚡ Ultra-Coder - دستیار هوشمند برنامه‌نویسی فارسی

<div dir="rtl">

## معرفی
Ultra-Coder یک اپلیکیشن وب پیشرفته (PWA) است که به عنوان دستیار هوشمند برنامه‌نویسی فارسی‌زبان طراحی شده است. این اپ را می‌توانید روی صفحه اصلی موبایل خود نصب کنید و مانند یک برنامه واقعی از آن استفاده کنید.

## ویژگی‌ها
- 🎯 رابط کاربری فارسی کاملاً واکنش‌گرا
- ⚡ پشتیبانی از چندین ارائه‌دهنده API (OpenAI, Anthropic, Groq, Together AI)
- 💾 ذخیره تاریخچه چت در حافظه محلی
- 📱 قابل نصب روی صفحه اصلی (PWA)
- 🎨 طراحی مدرن با پس‌زمینه متحرک
- 🌙 تم تیره زیبا
- ✨ هایلایت سینتکس کد
- 📋 کپی کد با یک کلیک

## نحوه استفاده

### روش ۱: میزبانی آنلاین (توصیه شده)

1. فایل‌های پروژه را روی یکی از سرویس‌های زیر آپلود کنید:
   - [GitHub Pages](https://pages.github.com/)
   - [Netlify](https://netlify.com/)
   - [Vercel](https://vercel.com/)
   - [Cloudflare Pages](https://pages.cloudflare.com/)

2. لینک سایت را در مرورگر Safari یا Chrome موبایل باز کنید.

3. برای نصب روی آیفون:
   - دکمه Share (اشتراک‌گذاری) را بزنید
   - گزینه "Add to Home Screen" را انتخاب کنید
   - نام دلخواه را وارد و Add را بزنید

4. برای نصب روی اندروید:
   - منوی سه نقطه مرورگر را باز کنید
   - گزینه "Install app" یا "Add to Home screen" را انتخاب کنید

### روش ۲: اجرای محلی

```bash
# کلون کردن پروژه
git clone [your-repo-url]
cd ultra-coder

# اجرا با Python
python -m http.server 8000

# یا با Node.js
npx serve
```

سپس `http://localhost:8000` را در مرورگر باز کنید.

## تنظیمات API

1. پس از باز کردن اپ، روی آیکون ⚙️ (تنظیمات) کلیک کنید
2. ارائه‌دهنده API خود را انتخاب کنید
3. کلید API را وارد کنید
4. مدل مورد نظر را انتخاب کنید
5. ذخیره کنید

### دریافت API Key:
- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/
- **Groq**: https://console.groq.com/keys
- **Together AI**: https://api.together.xyz/
- **OpenRouter**: https://openrouter.ai/keys

## ساختار پروژه

```
ultra-coder/
├── index.html      # فایل اصلی اپلیکیشن
├── manifest.json   # تنظیمات PWA
├── sw.js          # Service Worker برای کش و آفلاین
├── icons/
│   └── icon.svg   # آیکون اپ
└── README.md      # این فایل
```

## قابلیت‌های Ultra-Coder

### ساخت پروژه از صفر
- React / React Native
- Flutter
- Next.js
- Django / Flask
- FastAPI
- Node.js
- اپ موبایل
- ربات و اتوماسیون
- API

### ویرایش و توسعه
- خواندن کل پروژه
- پیشنهاد ساختار بهتر
- اصلاح باگ‌ها
- Refactor حرفه‌ای

### نوشتن کد پیشرفته
- الگوریتم‌ها
- معماری نرم‌افزار
- مدل‌سازی داده
- احراز هویت
- بهینه‌سازی Performance

## لایسنس
MIT License - استفاده آزاد برای همه

</div>

---

## English Summary

Ultra-Coder is a Progressive Web App (PWA) designed as a Persian-speaking AI coding assistant. It features:

- 🎯 Full RTL Persian interface
- ⚡ Multiple API providers support
- 💾 Local storage for chat history
- 📱 Installable on home screen
- 🎨 Modern dark theme UI
- ✨ Syntax highlighting
- 📋 One-click code copy

To use: Host the files on any static hosting service and open in mobile browser, then add to home screen.
