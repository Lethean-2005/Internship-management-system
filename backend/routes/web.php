<?php

use Illuminate\Support\Facades\Route;

Route::fallback(function () {
    $path = public_path('index.html');
    if (!file_exists($path)) {
        abort(404);
    }
    return response(file_get_contents($path), 200)
        ->header('Content-Type', 'text/html');
});
