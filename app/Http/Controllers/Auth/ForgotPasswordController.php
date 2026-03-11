<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ForgotPasswordController extends Controller
{
    // 1. Fungsi minta link reset
    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $token = Str::random(64);

        // Simpan token ke tabel password_reset_tokens (bawaan Laravel)
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => Hash::make($token),
                'created_at' => Carbon::now()
            ]
        );

        // Buat URL Reset (Arahkan ke URL Frontend)
        $resetUrl = "http://localhost:3000/reset-password?token=".$token."&email=".$request->email;

        // Kirim Email (Sederhana dulu pakai raw mail)
        Mail::raw("Halo! Klik link ini untuk reset password kamu: " . $resetUrl, function ($message) use ($request) {
            $message->to($request->email);
            $message->subject('Reset Password Notification');
        });

        return response()->json([
            'success' => true,
            'message' => 'Link reset password sudah dikirim ke email Anda.',
        ], 200);
    }

    // 2. Fungsi eksekusi ganti password baru
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $resetData = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        // Cek apakah token valid & belum kadaluarsa (misal 60 menit)
        if (!$resetData || !Hash::check($request->token, $resetData->token)) {
            return response()->json(['success' => false, 'message' => 'Token tidak valid atau sudah kadaluarsa.'], 400);
        }

        // Update Password User
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Hapus token biar nggak bisa dipake lagi
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diubah! Silakan login kembali.',
        ], 200);
    }
}