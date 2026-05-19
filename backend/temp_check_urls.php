<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$user = App\Models\User::where('email', 'alamin@tinkonna.com')->first();
echo 'id=' . ($user?->id ?? 'null') . "\n";
echo 'avatar=' . ($user?->profile_avatar_url ?? 'null') . "\n";
echo 'cover=' . ($user?->cover_image_url ?? 'null') . "\n";
