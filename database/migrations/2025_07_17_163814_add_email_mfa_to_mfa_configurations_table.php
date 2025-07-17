<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('mfa_configurations', function (Blueprint $table) {
            $table->boolean('totp_enabled')->default(false)->after('enabled');
            $table->boolean('email_enabled')->default(false)->after('totp_enabled');
            $table->string('email_code')->nullable()->after('email_enabled');
            $table->timestamp('email_code_expires_at')->nullable()->after('email_code');
            $table->integer('email_code_attempts')->default(0)->after('email_code_expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mfa_configurations', function (Blueprint $table) {
            $table->dropColumn([
                'totp_enabled',
                'email_enabled',
                'email_code',
                'email_code_expires_at',
                'email_code_attempts'
            ]);
        });
    }
};
