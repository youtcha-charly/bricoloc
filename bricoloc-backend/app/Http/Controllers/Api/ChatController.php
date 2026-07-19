<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    /**
     * List all chats for the authenticated user
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $chats = Chat::with(['job', 'client', 'bricoleur', 'messages' => function ($query) {
            $query->latest()->limit(1);
        }])
            ->where('client_id', $user->id)
            ->orWhere('bricoleur_id', $user->id)
            ->orderBy('last_message_at', 'desc')
            ->get();

        // Add unread count and other user info
        $chats->each(function ($chat) use ($user) {
            $chat->unread_count = Message::where('chat_id', $chat->id)
                ->where('sender_id', '!=', $user->id)
                ->where('is_read', false)
                ->count();

            $chat->other_user = (int) $chat->client_id === (int) $user->id
                ? $chat->bricoleur
                : $chat->client;

            $chat->last_message = $chat->messages->first();
        });

        return response()->json([
            'success' => true,
            'data' => $chats,
        ]);
    }

    /**
     * Show a single chat with all messages
     */
    public function show(Request $request, $id)
    {
        $chat = Chat::with(['job', 'client', 'bricoleur'])
            ->findOrFail($id);

        $user = $request->user();

        // Verify user is part of this chat
        if ((int) $chat->client_id !== (int) $user->id && (int) $chat->bricoleur_id !== (int) $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $messages = Message::with('sender')
            ->where('chat_id', $id)
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark unread messages as read
        Message::where('chat_id', $id)
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $chat->other_user = (int) $chat->client_id === (int) $user->id
            ? $chat->bricoleur
            : $chat->client;

        return response()->json([
            'success' => true,
            'data' => [
                'chat' => $chat,
                'messages' => $messages,
            ],
        ]);
    }

    /**
     * Send a message in a chat
     */
    public function sendMessage(Request $request, $id)
    {
        $chat = Chat::findOrFail($id);

        $user = $request->user();

        // Verify user is part of this chat
        if ((int) $chat->client_id !== (int) $user->id && (int) $chat->bricoleur_id !== (int) $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $request->validate([
            'message' => 'required|string|min:1|max:2000',
        ]);

        $message = Message::create([
            'chat_id' => $id,
            'sender_id' => $user->id,
            'message' => $request->message,
            'is_read' => false,
        ]);

        // Update chat last_message_at
        $chat->last_message_at = now();
        $chat->save();

        // Determine recipient
        $recipientId = (int) $chat->client_id === (int) $user->id
            ? $chat->bricoleur_id
            : $chat->client_id;

        // Notify recipient
        \App\Models\Notification::create([
            'user_id' => $recipientId,
            'title' => 'New Message',
            'body' => $user->name . ': ' . substr($request->message, 0, 100),
            'type' => 'new_message',
            'data' => json_encode([
                'chat_id' => $chat->id,
                'message_id' => $message->id,
            ]),
        ]);

        $message->load('sender');

        return response()->json([
            'success' => true,
            'data' => $message,
        ], 201);
    }
}