<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContractStatusTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $statuses = [
            0 => 'open',
            1 => 'closed',
            2 => 'canceled',
            3 => 'pending',
        ];

        foreach ($statuses as $id => $name) {
            DB::table('contract_statuses')->updateOrInsert(
                ['id' => $id],
                [
                    'name' => $name,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
