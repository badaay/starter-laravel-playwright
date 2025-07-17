<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

class TestRouteController extends Controller
{
    public static function register()
    {
        Route::middleware(['api'])->group(function () {
            Route::match(['GET', 'POST'], 'api/echo', function (Request $request) {
                return response()->json([
                    'message' => 'Echo test endpoint',
                    'data' => $request->all(),
                    'method' => $request->method(),
                    'time' => now()->toIso8601String()
                ]);
            });
        });
    }
}
