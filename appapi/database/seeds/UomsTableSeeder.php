<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UomsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Clear existing data
        DB::table('uoms')->truncate();

        // Insert common Unit of Measure data (Indonesian names/descriptions)
        $uoms = [
            // Pieces & Units
            [
                'uom_code' => 'PCS',
                'uom_name' => 'Buah',
                'uom_description' => 'Satu unit atau buah',
                'is_active' => 1,
                'display_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'uom_code' => 'BOX',
                'uom_name' => 'Kotak',
                'uom_description' => 'Satuan dalam kotak',
                'is_active' => 1,
                'display_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'uom_code' => 'PACK',
                'uom_name' => 'Paket',
                'uom_description' => 'Satuan per paket',
                'is_active' => 1,
                'display_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'uom_code' => 'SET',
                'uom_name' => 'Set',
                'uom_description' => 'Satu set item',
                'is_active' => 1,
                'display_order' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Weight
            [
                'uom_code' => 'KG',
                'uom_name' => 'Kilogram',
                'uom_description' => 'Berat dalam kilogram',
                'is_active' => 1,
                'display_order' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'uom_code' => 'GR',
                'uom_name' => 'Gram',
                'uom_description' => 'Berat dalam gram',
                'is_active' => 1,
                'display_order' => 6,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'uom_code' => 'TON',
                'uom_name' => 'Ton',
                'uom_description' => 'Berat dalam ton metrik',
                'is_active' => 1,
                'display_order' => 7,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Volume & Liquid
            [
                'uom_code' => 'L',
                'uom_name' => 'Liter',
                'uom_description' => 'Volume dalam liter',
                'is_active' => 1,
                'display_order' => 8,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'uom_code' => 'ML',
                'uom_name' => 'Mililiter',
                'uom_description' => 'Volume dalam mililiter',
                'is_active' => 1,
                'display_order' => 9,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'uom_code' => 'GAL',
                'uom_name' => 'Galon',
                'uom_description' => 'Volume dalam galon',
                'is_active' => 1,
                'display_order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Additional volume units
            [
                'uom_code' => 'M3',
                'uom_name' => 'Meter Kubik',
                'uom_description' => 'Volume dalam meter kubik',
                'is_active' => 1,
                'display_order' => 11,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'uom_code' => 'CC',
                'uom_name' => 'Sentimeter Kubik',
                'uom_description' => 'Volume dalam sentimeter kubik',
                'is_active' => 1,
                'display_order' => 12,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'uom_code' => 'CFT',
                'uom_name' => 'Kaki Kubik',
                'uom_description' => 'Volume dalam kaki kubik',
                'is_active' => 1,
                'display_order' => 13,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Length
            [
                'uom_code' => 'M',
                'uom_name' => 'Meter',
                'uom_description' => 'Panjang dalam meter',
                'is_active' => 1,
                'display_order' => 11,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'uom_code' => 'CM',
                'uom_name' => 'Sentimeter',
                'uom_description' => 'Panjang dalam sentimeter',
                'is_active' => 1,
                'display_order' => 12,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'uom_code' => 'KM',
                'uom_name' => 'Kilometer',
                'uom_description' => 'Panjang dalam kilometer',
                'is_active' => 1,
                'display_order' => 13,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Area
            [
                'uom_code' => 'M2',
                'uom_name' => 'Meter Persegi',
                'uom_description' => 'Luas dalam meter persegi',
                'is_active' => 1,
                'display_order' => 14,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Time
            [
                'uom_code' => 'HR',
                'uom_name' => 'Jam',
                'uom_description' => 'Waktu dalam jam',
                'is_active' => 1,
                'display_order' => 15,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'uom_code' => 'DAY',
                'uom_name' => 'Hari',
                'uom_description' => 'Waktu dalam hari',
                'is_active' => 1,
                'display_order' => 16,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Service
            [
                'uom_code' => 'SVC',
                'uom_name' => 'Layanan',
                'uom_description' => 'Satuan untuk layanan',
                'is_active' => 1,
                'display_order' => 17,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Additional packaging unit
            [
                'uom_code' => 'SACK',
                'uom_name' => 'Sack',
                'uom_description' => 'Satuan Sack atau karung',
                'is_active' => 1,
                'display_order' => 18,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // General
            [
                'uom_code' => 'LOT',
                'uom_name' => 'Lot',
                'uom_description' => 'Satu lot',
                'is_active' => 1,
                'display_order' => 19,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'uom_code' => 'UNIT',
                'uom_name' => 'Unit',
                'uom_description' => 'Satu unit',
                'is_active' => 1,
                'display_order' => 20,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('uoms')->insert($uoms);
    }
}

