# 🚀 دليل النشر على Railway

## الخطوة 1: رفع المشروع على GitHub

```bash
cd /workspace/discord-watch-party
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/discord-watch-party.git
git push -u origin main
```

## الخطوة 2: ربط Railway بـ GitHub

1. اذهب إلى [Railway.app](https://railway.app/)
2. سجل الدخول باستخدام GitHub
3. اضغط على "New Project"
4. اختر "Deploy from GitHub repo"
5. اختر repository: `discord-watch-party`

## الخطوة 3: إعدادات Railway

### متغيرات البيئة (Environment Variables)
في لوحة تحكم Railway، أضف:

```
PORT=3000
NODE_ENV=production
```

### Build Settings
Railway سيتعرف تلقائياً على:
- Start Command: `npm start`
- Build Command: `npm run build`

## الخطوة 4: الحصول على URL

بعد اكتمال النشر، ستحصل على URL مثل:
```
https://discord-watch-party-production.up.railway.app
```

## الخطوة 5: تكوين Discord Activity

### 1. Discord Developer Portal

1. اذهب إلى https://discord.com/developers/applications
2. اضغط "New Application"
3. سمّه "Watch Party"

### 2. إعداد Activity

1. من القائمة الجانبية، اختر "Activity"
2. فعل "Activity is embedded app"
3. في خانة "Activity URL"، ضع رابط Railway الخاص بك
4. احفظ التغييرات

### 3. OAuth2 Settings

1. اذهب إلى "OAuth2" → "General"
2. أضف Redirect URI: `https://discord.com/activities/embedded-apps/local-test`
3. احفظ

### 4. Invite Link

لإنشاء رابط دعوة:

```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=applications.commands%20bot
```

استبدل `YOUR_CLIENT_ID` بـ Client ID من تطبيقك.

## الخطوة 6: اختبار Activity

1. انضم إلى Voice Channel في سيرفر ديسكورد
2. اضغط على "Activities" (أيقونة الصاروخ)
3. اختر "Watch Party"
4. شارك الرابط مع أصدقائك!

## ⚠️ ملاحظات مهمة

### HTTPS مطلوب
Discord Activities تتطلب HTTPS فقط. Railway يوفر HTTPS تلقائياً.

### CORS Settings
تأكد من أن الخادم يسمح بـ CORS من Discord domains.

### iframe Headers
بعض المواقع قد ترفض العمل داخل iframe. المواقع المدعومة:
- WeCima ✓
- ArabSeed ✓  
- iMallek ✓

## 🔧 استكشاف الأخطاء

### المشكلة: Activity لا تظهر
**الحل:** تأكد من:
- URL صحيح ويبدأ بـ https://
- Activity enabled في Developer Portal
- التطبيق مثبت في السيرفر

### المشكلة: WebSocket لا يتصل
**الحل:** 
- تحقق من logs في Railway
- تأكد من PORT مضبوطة على 3000
- جرب إعادة deploy

### المشكلة: iframe فارغ
**الحل:**
- بعض المواقع تمنع embedding
- استخدم المواقع المدعومة فقط
- تحقق من console للأخطاء

## 📊 Monitoring

Railway يوفر:
- Real-time logs
- Resource usage
- Automatic restarts
- SSL certificates

## 💰 التكلفة

Railway يقدم:
- $5 مجاناً شهرياً للتجربة
- بعدها: حسب الاستخدام (~$5-10/شهر للاستخدام المتوسط)

## 🎉 جاهز!

الآن يمكنك أنت وأصدقاؤكم مشاهدة المحتوى معاً في perfect sync!
