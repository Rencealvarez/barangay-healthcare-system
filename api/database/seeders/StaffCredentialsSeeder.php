<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class StaffCredentialsSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('staff_credentials')->updateOrInsert(
            ['email' => 'admin@gmail.com'],
            [
                'employee_id' => 'EMP-ADM-001',
                'full_name'   => 'System Admin',
                'username'    => 'admin_user',
                'password'    => Hash::make('admin@1'),
                'role'        => 'admin',
                'position'    => 'Chief Health Administrator',
                'department'  => 'Barangay Health Center',
                'status'      => 'active',
                'created_at'  => Carbon::now(),
                'updated_at'  => Carbon::now(),
            ]
        );

        DB::table('staff_credentials')->updateOrInsert(
            ['email' => 'staff@gmail.com'],
            [
                'employee_id' => 'EMP-STF-002',
                'full_name'   => 'Staff',
                'username'    => 'Barangay_Staff',
                'password'    => Hash::make('staff@1'),
                'role'        => 'staff',
                'position'    => 'Healthcare Staff',
                'department'  => 'Barangay Health Center',
                'status'      => 'active',
                'created_at'  => Carbon::now(),
                'updated_at'  => Carbon::now(),
            ]
        );
    }
}
