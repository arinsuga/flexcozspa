<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VendortypesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Clear existing data
        DB::table('vendortypes')->truncate();

        // Insert vendor type data
        $vendortypes = [
            [
                'vendortype_code' => 'SUPPLIER',
                'vendortype_name' => 'Supplier',
                'vendortype_description' => 'Material and goods supplier',
                'is_active' => 1,
                'display_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'vendortype_code' => 'CONTRACTOR',
                'vendortype_name' => 'Contractor',
                'vendortype_description' => 'Service contractor or subcontractor',
                'is_active' => 1,
                'display_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'vendortype_code' => 'DISTRIBUTOR',
                'vendortype_name' => 'Distributor',
                'vendortype_description' => 'Goods distributor or wholesaler',
                'is_active' => 1,
                'display_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'vendortype_code' => 'MANUFACTURER',
                'vendortype_name' => 'Manufacturer',
                'vendortype_description' => 'Direct manufacturer or producer',
                'is_active' => 1,
                'display_order' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'vendortype_code' => 'SERVICE_PROVIDER',
                'vendortype_name' => 'Service Provider',
                'vendortype_description' => 'Professional services provider',
                'is_active' => 1,
                'display_order' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'vendortype_code' => 'CONSULTANT',
                'vendortype_name' => 'Consultant',
                'vendortype_description' => 'Consulting firm or expert',
                'is_active' => 1,
                'display_order' => 6,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'vendortype_code' => 'LOGISTICS',
                'vendortype_name' => 'Logistics Provider',
                'vendortype_description' => 'Transportation and logistics company',
                'is_active' => 1,
                'display_order' => 7,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('vendortypes')->insert($vendortypes);
    }
}
