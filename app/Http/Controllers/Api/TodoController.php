<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Todo;
use Illuminate\Http\Request;

class TodoController extends Controller
{
    /**
     * Get all todos
     *
     * @authenticated
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $todos = Todo::latest()->get();
        return response()->json(['todos' => $todos]);
    }

    /**
     * Create a new todo
     *
     * @authenticated
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $todo = Todo::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'completed' => false,
        ]);

        return response()->json(['message' => 'Todo created successfully', 'todo' => $todo], 201);
    }

    /**
     * Get a specific todo
     *
     * @authenticated
     * @param Todo $todo
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Todo $todo)
    {
        return response()->json(['todo' => $todo]);
    }

    /**
     * Update a todo
     *
     * @authenticated
     * @param Request $request
     * @param Todo $todo
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Todo $todo)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'completed' => 'sometimes|boolean',
        ]);

        $todo->update($validated);

        return response()->json(['message' => 'Todo updated successfully', 'todo' => $todo]);
    }

    /**
     * Delete a todo
     *
     * @authenticated
     * @param Todo $todo
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Todo $todo)
    {
        $todo->delete();

        return response()->json(['message' => 'Todo deleted successfully'], 200);
    }
}
