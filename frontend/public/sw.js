/* Service Worker for Web Push notifications */
self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', function (event) {
  let payload = {}
  try { payload = event.data.json() } catch (e) { payload = { title: 'Notification', body: event.data?.text() || '' } }
  const title = payload.title || 'Notification'
  const options = Object.assign(
    {
      body: payload.body || '',
      icon: payload.icon || '/logo192.png',
      badge: payload.badge || '/logo192.png',
      requireInteraction: payload.requireInteraction ?? true,
      vibrate: payload.vibrate || [100, 50, 100],
      timestamp: payload.timestamp || Date.now(),
      data: payload.data || {},
      silent: payload.silent ?? false,
    },
    payload.options || {},
  )

  const message = {
    type: 'PUSH_NOTIFICATION_RECEIVED',
    payload: {
      title,
      body: options.body,
      data: options.data,
      icon: options.icon,
    },
  }

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(windowClients => {
        for (const client of windowClients) {
          client.postMessage(message)
        }
      }),
      (async () => {
        if (typeof BroadcastChannel !== 'undefined') {
          const channel = new BroadcastChannel('notification-channel')
          channel.postMessage(message)
          channel.close()
        }
      })(),
    ]),
  )
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(clients.matchAll({ type: 'window' }).then(windowClients => {
    for (let client of windowClients) {
      if (client.url === url && 'focus' in client) return client.focus()
    }
    if (clients.openWindow) return clients.openWindow(url)
  }))
})
