<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'Gents Shop API is running.']);
});
