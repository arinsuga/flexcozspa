<?php

use Illuminate\Database\Seeder;

class SheetgroupsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $sheetgroups = [
            // Type 0: Work Categories
            [
                'sheetgroup_code' => 'PREP_WORK',
                'sheetgroup_name' => 'PREPARATION WORK',
                'sheetgroup_description' => 'Preparation and site preparation work',
                'sheetgroup_type' => 0,
                'is_active' => 1,
                'sheetgroup_seqno' => 1,
            ],
            [
                'sheetgroup_code' => 'DEMO_WORK',
                'sheetgroup_name' => 'DEMOLISH WORK',
                'sheetgroup_description' => 'Demolition and removal work',
                'sheetgroup_type' => 0,
                'is_active' => 1,
                'sheetgroup_seqno' => 2,
            ],
            [
                'sheetgroup_code' => 'CIVIL_WORK',
                'sheetgroup_name' => 'CIVIL WORK',
                'sheetgroup_description' => 'Civil construction work',
                'sheetgroup_type' => 0,
                'is_active' => 1,
                'sheetgroup_seqno' => 3,
            ],
            [
                'sheetgroup_code' => 'FINISH_WORK',
                'sheetgroup_name' => 'FINISHING WORK',
                'sheetgroup_description' => 'Finishing and surface work',
                'sheetgroup_type' => 0,
                'is_active' => 1,
                'sheetgroup_seqno' => 4,
            ],
            [
                'sheetgroup_code' => 'INTERIOR_WORK',
                'sheetgroup_name' => 'INTERIOR WORK',
                'sheetgroup_description' => 'Interior decoration and design work',
                'sheetgroup_type' => 0,
                'is_active' => 1,
                'sheetgroup_seqno' => 5,
            ],
            [
                'sheetgroup_code' => 'MEP_WORK',
                'sheetgroup_name' => 'MEP WORK',
                'sheetgroup_description' => 'Mechanical, Electrical, Plumbing work',
                'sheetgroup_type' => 0,
                'is_active' => 1,
                'sheetgroup_seqno' => 60,
            ],
            [
                'sheetgroup_code' => 'LANDSCAPE',
                'sheetgroup_name' => 'LANDSCAPE',
                'sheetgroup_description' => 'Landscape and outdoor work',
                'sheetgroup_type' => 0,
                'is_active' => 1,
                'sheetgroup_seqno' => 7,
            ],
            [
                'sheetgroup_code' => 'OTHER_WORK',
                'sheetgroup_name' => 'OTHER WORK',
                'sheetgroup_description' => 'Other miscellaneous work',
                'sheetgroup_type' => 0,
                'is_active' => 1,
                'sheetgroup_seqno' => 8,
            ],
            [
                'sheetgroup_code' => 'ADD_WORK',
                'sheetgroup_name' => 'ADD WORK',
                'sheetgroup_description' => 'Additional work and extras',
                'sheetgroup_type' => 0,
                'is_active' => 1,
                'sheetgroup_seqno' => 9,
            ],
            // Type 1: Cost Categories
            [
                'sheetgroup_code' => 'BIAYA_PERBAIKAN',
                'sheetgroup_name' => 'BIAYA PERBAIKAN',
                'sheetgroup_description' => 'Biaya perbaikan dan perawatan',
                'sheetgroup_type' => 1,
                'is_active' => 1,
                'sheetgroup_seqno' => 10,
            ],
            [
                'sheetgroup_code' => 'BIAYA_DARURAT',
                'sheetgroup_name' => 'BIAYA DARURAT',
                'sheetgroup_description' => 'Biaya darurat dan situasi mendesak',
                'sheetgroup_type' => 1,
                'is_active' => 1,
                'sheetgroup_seqno' => 11,
            ],
            [
                'sheetgroup_code' => 'BIAYA_KESEHATAN',
                'sheetgroup_name' => 'BIAYA KESEHATAN',
                'sheetgroup_description' => 'Biaya kesehatan dan keselamatan kerja',
                'sheetgroup_type' => 1,
                'is_active' => 1,
                'sheetgroup_seqno' => 12,
            ],
            [
                'sheetgroup_code' => 'OVER_HEAD',
                'sheetgroup_name' => 'OVER HEAD',
                'sheetgroup_description' => 'Biaya overhead dan operasional',
                'sheetgroup_type' => 1,
                'is_active' => 1,
                'sheetgroup_seqno' => 13,
            ],
        ];

        DB::table('sheetgroups')->insert($sheetgroups);
    }
}
