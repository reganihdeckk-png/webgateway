<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/health', fn () => response()->json([
        'success' => true,
        'service' => 'GLASYPAY API',
        'status' => 'development-scaffold',
    ]));

    // TODO: Attach authenticated controllers, policies, validation and rate limits.
    // Never expose wallet mutation endpoints without ledger posting + idempotency.
});
