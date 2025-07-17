<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Laravel\Sanctum\PersonalAccessToken;

class ApiTokenController extends Controller
{
    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'permissions' => ['required', 'array'],
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator->errors());
        }

        $token = $request->user()->createToken(
            $request->name,
            $request->permissions
        );

        return back()->with([
            'token' => [
                'id' => $token->accessToken->id,
                'name' => $token->accessToken->name,
                'abilities' => $token->accessToken->abilities,
                'created_at' => $token->accessToken->created_at,
            ],
            'plainTextToken' => explode('|', $token->plainTextToken)[1],
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $tokenId
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $tokenId)
    {
        $validator = Validator::make($request->all(), [
            'permissions' => ['required', 'array'],
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator->errors());
        }

        $token = $request->user()->tokens()->findOrFail($tokenId);
        $token->abilities = $request->permissions;
        $token->save();

        return back()->with('token', [
            'id' => $token->id,
            'name' => $token->name,
            'abilities' => $token->abilities,
            'created_at' => $token->created_at,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $tokenId
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $tokenId)
    {
        $request->validate([
            'token_id' => 'sometimes|exists:personal_access_tokens,id',
        ]);

        // If a token_id was provided in the request, use that, otherwise use the route parameter
        $tokenIdToDelete = $request->token_id ?? $tokenId;

        $request->user()->tokens()->where('id', $tokenIdToDelete)->delete();

        return back();
    }
}
