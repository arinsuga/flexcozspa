<?php

use Illuminate\Database\Seeder;

class RefftypesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Clear existing data
        DB::table('refftypes')->truncate();

        // Insert reference type data
        $refftypes = [
            [
                'refftype_code' => 'PO',
                'refftype_name' => 'Purchase Order',
                'refftype_description' => 'Purchase Order document',
                'is_active' => 1,
                'display_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'refftype_code' => 'WO (SPK)',
                'refftype_name' => 'Work Order',
                'refftype_description' => 'Work Order document',
                'is_active' => 1,
                'display_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'refftype_code' => 'INV',
                'refftype_name' => 'Invoice',
                'refftype_description' => 'Invoice document',
                'is_active' => 1,
                'display_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'refftype_code' => 'DN',
                'refftype_name' => 'Delivery Note',
                'refftype_description' => 'Delivery Note document',
                'is_active' => 1,
                'display_order' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'refftype_code' => 'PR',
                'refftype_name' => 'Purchase Requisition',
                'refftype_description' => 'Purchase Requisition document',
                'is_active' => 1,
                'display_order' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'refftype_code' => 'GRN',
                'refftype_name' => 'Goods Receipt Note',
                'refftype_description' => 'Goods Receipt Note document',
                'is_active' => 1,
                'display_order' => 6,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('refftypes')->insert($refftypes);
    }
}
use Illuminate\Support\Facades\DB;
