<?php

namespace App\Console\Commands;

use App\Models\Booking;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExpireBookings extends Command
{
    protected $signature = 'bookings:expire';
    protected $description = 'Expire bookings that have passed their expiry date';

    public function handle(): void
    {
        $expiredBookings = Booking::where('status', 'active')
            ->where('expiry_date', '<', now())
            ->get();

        $count = 0;
        foreach ($expiredBookings as $booking) {
            DB::beginTransaction();
            try {
                // Restore inventory
                $booking->productVariant->increment('quantity', $booking->quantity);
                $booking->update(['status' => 'expired']);
                DB::commit();
                $count++;
            } catch (\Exception $e) {
                DB::rollBack();
                $this->error("Failed to expire booking {$booking->booking_number}: {$e->getMessage()}");
            }
        }

        $this->info("Expired {$count} bookings.");
    }
}
