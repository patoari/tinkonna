<?php
require __DIR__ . '/../vendor/autoload.php';

// Generate VAPID keys and append to backend .env
try {
    $keys = Minishlink\WebPush\VAPID::createVapidKeys();
    $envFile = __DIR__ . '/../.env';
    $content = PHP_EOL . 'VAPID_PUBLIC_KEY=' . $keys['publicKey'] . PHP_EOL . 'VAPID_PRIVATE_KEY=' . $keys['privateKey'] . PHP_EOL . 'VAPID_SUBJECT=mailto:you@example.com' . PHP_EOL;
    file_put_contents($envFile, $content, FILE_APPEND);
    echo "VAPID keys generated and appended to .env\n";
    echo "PUBLIC: " . $keys['publicKey'] . "\n";
    echo "PRIVATE: " . $keys['privateKey'] . "\n";
} catch (Throwable $e) {
    echo "Failed to generate VAPID keys: " . $e->getMessage() . "\n";
    exit(1);
}
