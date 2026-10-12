# Setayesh's Digital Presence

از صفر یک وب‌سایت شخصی، آموزشی و پژوهشی حرفه‌ای برای «ستایش رحمانی» طراحی و پیاده‌سازی کن.
هدف پروژه:
ساخت یک وب‌سایت مدرن، علمی، حرفه‌ای و قابل توسعه که شامل معرفی شخصی، سوابق، فعالیت‌های پژوهشی، مقالات، افتخارات و راه ارتباطی باشد و یک پنل مدیریت کامل برای مدیریت محتوای سایت داشته باشد.
تکنولوژی و معماری
React + TypeScript
Tailwind CSS
Component-based architecture
Supabase برای Database و Authentication
Supabase Storage برای تصاویر در صورت نیاز
Routing استاندارد
ساختار کد تمیز، قابل نگهداری و قابل توسعه
رعایت کامل TypeScript
بدون کد تکراری غیرضروری
بدون اطلاعات حساس Hard-coded
تمام داده‌های اصلی سایت از Database دریافت شوند.
زبان و طراحی
زبان اصلی: فارسی
RTL کامل
طراحی کاملاً Responsive برای موبایل، تبلت و دسکتاپ
فونت فارسی حرفه‌ای و خوانا
Light Mode و Dark Mode
طراحی مدرن، مینیمال، علمی و حرفه‌ای
استفاده محدود و حرفه‌ای از Glassmorphism
انیمیشن‌های ظریف و سریع
Micro-interaction برای دکمه‌ها، کارت‌ها و Navigation
رعایت Accessibility
رعایت اصول SEO
سرعت Loading بالا
تصاویر بهینه و Lazy Loading
جلوگیری از Layout Shift
طراحی Mobile-first
صفحات سایت
1. صفحه اصلی
Route:
/
شامل:
Header
Navigation
Hero Section
تصویر پروفایل
نام «ستایش رحمانی»
معرفی کوتاه
حوزه فعالیت و تخصص
CTA مشاهده پژوهش‌ها
CTA تماس
معرفی کوتاه درباره
آخرین مقالات پژوهشی
فعالیت‌های پژوهشی
افتخارات و جوایز
Footer
2. درباره من
Route:
/about
شامل:
معرفی کامل
تصویر
سوابق تحصیلی
سوابق فعالیت
مهارت‌ها
فعالیت‌های پژوهشی
افتخارات
Awards
Research Activities
3. پژوهش‌ها
Route:
/research
امکانات:
نمایش مقالات
دسته‌بندی مقالات
جستجو
فیلتر
مرتب‌سازی
Pagination یا Load More در صورت نیاز
هر کارت مقاله شامل:
تصویر
عنوان
خلاصه
دسته‌بندی
تاریخ انتشار
دکمه «ادامه مطلب»
4. جزئیات مقاله
Route:
/research/[slug]
شامل:
عنوان
تصویر
دسته‌بندی
تاریخ
خلاصه
محتوای کامل
مقالات مرتبط
دکمه بازگشت به پژوهش‌ها
اگر مقاله وجود نداشت، صفحه 404 مناسب نمایش داده شود.
5. تماس
Route:
/contact
شامل:
اطلاعات تماس
ایمیل
فرم تماس
فرم:
نام و نام خانوادگی
ایمیل
متن پیام
فرم باید:
Validation داشته باشد.
خطاهای مناسب نمایش دهد.
اطلاعات را در Database ذخیره کند.
وضعیت موفقیت ارسال را نمایش دهد.

پنل مدیریت
Route:
/admin/login
ورود مدیر با Supabase Authentication انجام شود.
بعد از ورود:
/admin
پنل مدیریت شامل:
Dashboard
تعداد مقالات
تعداد دسته‌بندی‌ها
تعداد پیام‌ها
تعداد فعالیت‌های پژوهشی
تعداد افتخارات
آمار کلی سایت
Articles
امکانات کامل CRUD:
ایجاد مقاله
ویرایش
حذف
انتشار / عدم انتشار
تصویر
عنوان
Slug
خلاصه
محتوای کامل
دسته‌بندی
تاریخ
Categories
CRUD کامل:
ایجاد
ویرایش
حذف
نام
Slug
توضیحات
About
مدیریت اطلاعات صفحه About:
معرفی
تصویر
تحصیلات
مهارت‌ها
سوابق
Research Activities
مدیریت فعالیت‌های پژوهشی:
عنوان
توضیح
تاریخ
تصویر در صورت نیاز
Awards
مدیریت افتخارات:
عنوان
توضیح
تاریخ
تصویر در صورت نیاز
Messages
نمایش پیام‌های ارسال‌شده از Contact:
نام
ایمیل
متن
تاریخ
خوانده‌شده / خوانده‌نشده
حذف
Settings
اطلاعات پایه سایت
Theme
اطلاعات تماس
تنظیمات عمومی

Database
ساختار Database را اصولی طراحی کن.
حداقل جداول:
profiles / about
articles
categories
awards
research_activities
contact_messages
site_settings
برای مقالات:
id
title
slug
excerpt
content
image_url
category_id
published
published_at
created_at
updated_at
برای Categories:
id
name
slug
description
created_at
برای Awards:
id
title
description
date
image_url
created_at
برای Research Activities:
id
title
description
date
image_url
created_at
برای Contact Messages:
id
full_name
email
message
is_read
created_at
Relationshipهای Database را صحیح ایجاد کن.
Security و RLS را به‌درستی تنظیم کن:
اطلاعات عمومی قابل خواندن باشند.
عملیات مدیریتی فقط برای کاربر Admin مجاز باشد.
کاربران عادی نتوانند اطلاعات مدیریتی را تغییر دهند.
Contact form بتواند پیام جدید ثبت کند، بدون اینکه امکان خواندن پیام‌های دیگران وجود داشته باشد.

Navigation
Header شامل:
خانه
درباره من
پژوهش‌ها
تماس
همراه با:
Theme Toggle
Mobile Menu
در پنل مدیریت Navigation جداگانه داشته باش.

UX
برای Loading:
Skeleton مناسب
Loading state
Empty state
Error state
برای عملیات:
Toast notification
Confirmation برای Delete
جلوگیری از Submit تکراری
برای تصاویر:
Lazy loading
ابعاد مشخص
WebP/AVIF در صورت امکان
جلوگیری از تصاویر بسیار حجیم

SEO
برای صفحات اصلی:
Title مناسب
Meta Description
Open Graph
Canonical
Semantic HTML
Sitemap
Robots.txt
URLهای مناسب
Slug مقالات
برای مقالات:
SEO title
description
canonical
Open Graph image

Performance
سایت باید سریع باشد.
موارد زیر را رعایت کن:
Code splitting
Lazy loading
بهینه‌سازی تصاویر
جلوگیری از JavaScript غیرضروری
جلوگیری از Requestهای غیرضروری
استفاده صحیح از Cache
جلوگیری از Render اضافی
Responsive images

کیفیت کد
کد باید:
TypeScript واقعی داشته باشد.
Componentها قابل استفاده مجدد باشند.
فایل‌ها بیش از حد بزرگ نشوند.
Logic از UI تا حد امکان جدا باشد.
Error handling مناسب داشته باشد.
هیچ TypeScript error وجود نداشته باشد.
هیچ Console error غیرضروری وجود نداشته باشد.

قوانین مهم
پروژه را از صفر بساز.
از Mock Database برای قابلیت‌های اصلی استفاده نکن.
اطلاعات واقعی سایت باید از Supabase دریافت شوند.
قابلیت‌های Admin واقعاً به Database متصل باشند.
Authentication واقعی باشد.
RLS و Security را جدی بگیر.
اطلاعات موجود را بدون دلیل حذف نکن.
Feature غیرضروری اضافه نکن.
طراحی را شلوغ نکن.
RTL را در تمام صفحات و Components رعایت کن.
موبایل اولویت بالایی دارد.
قبل از پایان کار Build را بررسی کن.
تمام Routeها را بررسی کن.
تمام فرم‌ها را تست کن.
تمام CRUDها را تست کن.
مشکلات Console را برطرف کن.
پروژه نباید با Error تحویل داده شود.
ترتیب اجرای پروژه
پروژه را با این ترتیب پیاده‌سازی کن:
طراحی UI و Layout
Routing
Components
Database Schema
Supabase Connection
Authentication
Admin Panel
CRUD
Contact Form
SEO
Performance
Responsive
Error Handling
Final Testing
در پایان، کل پروژه را بررسی کن و هر خطای قابل تشخیص را قبل از اعلام اتمام برطرف کن.
هدف نهایی:
یک وب‌سایت واقعی و Production-ready برای «ستایش رحمانی» که آماده اتصال به دامنه و انتشار باشد.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://setayesh-showcase.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3b1d5443-ae48-49f4-b75d-a60e5857e237).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
