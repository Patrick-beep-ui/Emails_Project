<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Exception;

class UserController extends Controller
{
    public function users()
    {
        try {
            // Traer todos los usuarios con columnas específicas
            $users = User::select('user_id', 'first_name', 'last_name', 'email', 'role')->get();

            return response()->json([
                'users' => $users
            ], 200);

        } catch (Exception $e) {
            // Capturar cualquier error y devolver mensaje
            return response()->json([
                'success' => false,
                'message' => 'Error getting users',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
