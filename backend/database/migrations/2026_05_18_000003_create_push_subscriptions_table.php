<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('endpoint');
            $table->text('public_key')->nullable();
            $table->text('auth_token')->nullable();
            $table->json('raw')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('push_subscriptions');
    }
};
