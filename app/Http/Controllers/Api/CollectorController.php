<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CollectorController extends Controller
{
    public function collect(Request $request)
    {
        return response()->json([
            'message' => 'Random message: ' . Str::random(10),
            'received' => $request->all(),
            'method' => $request->method(),
        ]);
    }
}
