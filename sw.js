// ── Yazdani Repair - Service Worker ──
// این فایل باید در همان دایرکتوری admin HTML باشد

const SW_VERSION = 'v1.0';
const SB_URL = 'https://vufrovnwizovivyyyapx.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1ZnJvdm53aXpvdml2eXl5YXB4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA5MTA3MiwiZXhwIjoyMDk2NjY3MDcyfQ.qbxj3ouHj7aLjUJKkHrGcOmMEFRk6aKr77EfAyn2MOM';

let lastKnownIds = new Set();
let checkInterval = null;
let isFirstCheck = true;

// ── Install ──
self.addEventListener('install', e => {
  self.skipWaiting();
});

// ── Activate ──
self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
  startBackgroundCheck();
});

// ── پیام از صفحه اصلی ──
self.addEventListener('message', e => {
  if (e.data?.type === 'INIT_IDS') {
    // دریافت IDs موجود از صفحه برای جلوگیری از اعلان تکراری
    lastKnownIds = new Set(e.data.ids);
    isFirstCheck = false;
  }
  if (e.data?.type === 'PING') {
    e.source.postMessage({ type: 'PONG', version: SW_VERSION });
  }
});

// ── چک کردن سفارشات جدید ──
async function checkNewOrders() {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/repairs?select=id,code,firstname,lastname,brand,model,created_at&order=created_at.desc&limit=20`,
      { headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` } }
    );
    if (!res.ok) return;
    const data = await res.json();
    if (!Array.isArray(data)) return;

    if (isFirstCheck) {
      // اولین بار فقط IDs رو ذخیره کن، اعلان نده
      data.forEach(r => lastKnownIds.add(r.id));
      isFirstCheck = false;
      return;
    }

    const newOnes = data.filter(r => !lastKnownIds.has(r.id));
    
    for (const r of newOnes) {
      lastKnownIds.add(r.id);
      
      const name = `${r.firstname || ''} ${r.lastname || ''}`.trim() || 'مشتری';
      const device = `${r.brand || ''} ${r.model || ''}`.trim() || 'دستگاه';
      const code = r.code || '—';

      // بررسی آیا صفحه باز است
      const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      
      if (allClients.length > 0) {
        // صفحه بازه - فقط پیام بفرست
        allClients.forEach(c => c.postMessage({ type: 'NEW_ORDER', order: r }));
      } else {
        // صفحه بسته‌ست - اعلان سیستمی نشون بده
        await self.registration.showNotification('📋 سفارش جدید: ' + code, {
          body: `${name} — ${device}`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'new-order-' + r.id,
          renotify: true,
          requireInteraction: true,
          dir: 'rtl',
          lang: 'fa',
          data: { orderId: r.id, url: self.location.origin + self.location.pathname.replace('sw.js', '') + 'admin-7-2-4.html' }
        });
      }
    }
  } catch(err) {
    // خطا نادیده گرفته می‌شه تا SW کرش نکنه
  }
}

// ── کلیک روی اعلان ──
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(allClients => {
      const existing = allClients.find(c => c.url.includes('admin'));
      if (existing) {
        existing.focus();
        existing.postMessage({ type: 'OPEN_ORDER', orderId: e.notification.data?.orderId });
      } else {
        clients.openWindow(url);
      }
    })
  );
});

// ── شروع بررسی پس‌زمینه هر ۳۰ ثانیه ──
function startBackgroundCheck() {
  if (checkInterval) clearInterval(checkInterval);
  checkNewOrders(); // اجرای اول
  checkInterval = setInterval(checkNewOrders, 30000);
}

// ── Push Notification (اختیاری - برای آینده) ──
self.addEventListener('push', e => {
  if (!e.data) return;
  const data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title || '📋 سفارش جدید', {
      body: data.body || '',
      icon: '/favicon.ico',
      dir: 'rtl',
      requireInteraction: true,
    })
  );
});
