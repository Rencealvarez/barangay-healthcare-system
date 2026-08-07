<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Users: " . App\Models\User::count() . "\n";
echo "Patients: " . App\Models\Patient::count() . "\n";
echo "Appointments: " . App\Models\Appointment::count() . "\n";
echo "Inventory: " . App\Models\Inventory::count() . "\n";

echo "\n--- Patients List ---\n";
foreach (App\Models\Patient::with('user')->get() as $p) {
    echo "- Patient ID: {$p->id} | Name: " . ($p->user->name ?? 'N/A') . " | Resident ID: {$p->resident_id}\n";
}
