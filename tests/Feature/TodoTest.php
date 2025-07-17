<?php

namespace Tests\Feature;

use App\Models\Todo;
use App\Models\User;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TodoTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_todos_page()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('todos.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page->component('Todos/Index'));
    }

    public function test_user_can_create_todo()
    {
        $user = User::factory()->create();

        $todoData = [
            'title' => 'Test Todo',
            'description' => 'This is a test todo',
            'completed' => false
        ];

        $response = $this
            ->actingAs($user)
            ->post(route('todos.store'), $todoData);

        $response->assertRedirect(route('todos.index'));
        $this->assertDatabaseHas('todos', array_merge($todoData, ['user_id' => $user->id]));
    }

    public function test_user_can_update_todo()
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->create(['user_id' => $user->id]);

        $updatedData = [
            'title' => 'Updated Todo',
            'description' => 'This todo has been updated',
            'completed' => true
        ];

        $response = $this
            ->actingAs($user)
            ->put(route('todos.update', $todo->id), $updatedData);

        $response->assertRedirect(route('todos.index'));
        $this->assertDatabaseHas('todos', array_merge(['id' => $todo->id], $updatedData));
    }

    public function test_user_can_delete_todo()
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->create(['user_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->delete(route('todos.destroy', $todo->id));

        $response->assertRedirect(route('todos.index'));
        $this->assertDatabaseMissing('todos', ['id' => $todo->id]);
    }
}
