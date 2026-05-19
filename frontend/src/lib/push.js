import api from './axios'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export async function initPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    // Fetch VAPID public key
    const res = await fetch('/api/public/push/vapid-key')
    const data = await res.json()
    const vapidKey = data.vapidPublicKey
    // Request permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return
    // Subscribe
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey)
    })
    // Send subscription to backend (public endpoint)
    await fetch('/api/public/push-subscriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) })
    return sub
  } catch (err) {
    console.error('Push init failed:', err)
  }
}

export async function unsubscribePush() {
  try {
    const reg = await navigator.serviceWorker.getRegistration()
    if (!reg) return
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await fetch('/api/push-subscriptions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) })
      await sub.unsubscribe()
    }
  } catch (e) { console.error('Unsubscribe failed', e) }
}
