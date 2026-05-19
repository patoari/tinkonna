Server setup

1. Generate VAPID keys (on server or dev machine):

   php artisan tinker
   >>> \Minishlink\WebPush\VAPID::createVapidKeys();

   Or use `vendor/bin/web-push generate-vapid` if you have the tool.

2. Add keys to `.env`:

   VAPID_PUBLIC_KEY=your_public_key_here
   VAPID_PRIVATE_KEY=your_private_key_here
   VAPID_SUBJECT=mailto:you@example.com

3. Install web-push PHP library (optional but recommended for real push deliveries):

   composer require minishlink/web-push

4. Run migrations:

   php artisan migrate

Frontend setup

1. The app registers a service worker `public/sw.js` and attempts to subscribe on app load.
2. Ensure the frontend is served over HTTPS (or localhost) to allow Push API.
3. To test, open the browser devtools -> Application -> Service Workers, and check subscription.
4. To trigger a push from the backend, use the existing Notifications API (`POST /api/notifications`) which will also attempt to send web-push messages to subscribed users.

Notes

- Guests can subscribe; subscriptions without a linked user are stored in the `push_subscriptions` table with `user_id` null.
- If `minishlink/web-push` is not installed the server will log push payloads instead of sending them.
