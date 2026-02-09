<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {

		/** uncomment if you want integrated authentication */
        // $this->call('UsersTableSeeder');
        // $this->call('UsersHRDTableSeeder');
        // $this->call('UsersCheckpointTableSeeder');
        // $this->call('UsersCostControlTableSeeder');

		/** uncomment if you want integrated authentication */
        // $this->call('AppsTableSeeder');
        // $this->call('RolesTableSeeder');
        // $this->call('AppUserTableSeeder');
        // $this->call('RoleUserTableSeeder');

        $this->call('UomNormalizationSeeder');
        $this->call('RefftypesTableSeeder');
        $this->call('SheetgroupsTableSeeder');
        $this->call('VendortypesTableSeeder');

        $this->call('ProjectstatusesTableSeeder');
        $this->call('ContractstatusesTableSeeder');
        $this->call('OrderstatusesTableSeeder');

        // $this->call('VendorsTableSeeder');
        // $this->call('ProjectsTableSeeder');
        // DB::table('projects')->insert(
        //     [
        //         'project_name' => 'RT. Tirtayasa 001',
        //         'project_description' => 'Renovasi RT. Tirtayasa',
        //         'project_owner' => 'Tirtayasa',
        //         'project_pic' => 'Imam',
        //         'project_number' => 'tirtayasa-renovasi-001',
        //         'project_startdt' => null,
        //         'project_enddt' => null,
        //         'project_address' => 'Jl. Raya Tirtayasa, RT. 01, RW. 01, Kec. Tirtayasa, Kab. Bogor, Jawa Barat',
        //         'project_latitude' => '30.2672',
        //         'project_longitude' => '-97.7431',
        //         'projectstatus_id' => 0,
        //         'created_at' => now(),
        //         'updated_at' => now()
        //     ]
        // );

        // $this->call('ContractsTableSeeder');
        // $this->call('ContractsheetsTableSeeder');

        // $this->call('OrdersTableSeeder');
        // $this->call('OrdersheetsTableSeeder');
        
        // $this->call('UsersTableSeeder');
        // $this->call('AppsTableSeeder');
        // $this->call('AppUserTableSeeder');
        // $this->call('RolesTableSeeder');
        // $this->call('RoleUserTableSeeder');

        //$this->call('AttendsTableSeeder');
    }
}
