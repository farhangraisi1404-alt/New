/**
 * فایل توابع کمکی - helpers.js
 * 
 * توابع کوچک و کاربردی که در جاهای مختلف استفاده می‌شوند
 */

/**
 * ساخت شناسه یکتا (UUID ساده)
 * 
 * چرا به id یکتا نیاز داریم؟
 * - برای شناسایی هر تسک به صورت منحصربفرد
 * - برای ویرایش و حذف دقیق هر تسک
 * 
 * @returns {string} یک رشته یکتا مثل 'abc123xyz789'
 */
export const generateId = () => {
  // ترکیب زمان فعلی با اعداد تصادفی
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${randomPart}`;
};

/**
 * فرمت کردن تاریخ به شکل خوانا
 * 
 * @param {string} dateString - تاریخ به فرمت ISO
 * @returns {string} تاریخ به شکل خوانا
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // بررسی معتبر بودن تاریخ
  if (isNaN(date.getTime())) return dateString;
  
  // نام روزهای هفته به فارسی
  const weekDays = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
  
  // نام ماه‌ها به فارسی
  const months = [
    'ژانویه', 'فوریه', 'مارس', 'آوریل', 'می', 'ژوئن',
    'ژوئیه', 'آگوست', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
  ];
  
  const dayName = weekDays[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  
  return `${dayName}، ${day} ${month}`;
};

/**
 * فرمت کردن تاریخ به شکل ساده (فقط روز و ماه)
 */
export const formatDateSimple = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const day = date.getDate();
  const month = date.getMonth() + 1;
  
  return `${day}/${month}`;
};

/**
 * بررسی اینکه تاریخ گذشته یا نه
 * @param {string} dateString - تاریخ سررسید
 * @returns {boolean} آیا گذشته است؟
 */
export const isOverdue = (dateString) => {
  if (!dateString) return false;
  
  const dueDate = new Date(dateString);
  const today = new Date();
  
  // مقایسه فقط تاریخ (بدون ساعت)
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  
  return dueDate < today;
};

/**
 * بررسی اینکه تاریخ امروز است
 */
export const isToday = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const today = new Date();
  
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * خلاصه کردن متن طولانی
 * @param {string} text - متن اصلی
 * @param {number} maxLength - حداکثر طول
 * @returns {string} متن خلاصه شده با ...
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * لیست دسته‌بندی‌های پیش‌فرض
 */
export const DEFAULT_CATEGORIES = [
  'عمومی',
  'کار',
  'شخصی',
  'خرید',
  'سلامت',
  'تحصیل',
  'خانه',
];

/**
 * رنگ‌های دسته‌بندی‌ها
 */
export const CATEGORY_COLORS = {
  'عمومی': '#6B7280',
  'کار': '#3B82F6',
  'شخصی': '#8B5CF6',
  'خرید': '#10B981',
  'سلامت': '#EF4444',
  'تحصیل': '#F59E0B',
  'خانه': '#EC4899',
};

/**
 * گرفتن رنگ یک دسته‌بندی
 */
export const getCategoryColor = (category) => {
  return CATEGORY_COLORS[category] || '#6B7280';
};
