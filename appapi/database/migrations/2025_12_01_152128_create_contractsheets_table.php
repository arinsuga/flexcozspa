<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateContractsheetsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('contractsheets', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('project_id');
            $table->bigInteger('contract_id');

            $table->date('sheet_dt')->nullable();
            $table->integer('sheet_type')->default(1); // 0=header, 1=item

            $table->integer('sheetgroup_type')->default(0); // 0=work, 1=cost
            $table->bigInteger('sheetgroup_id');
            $table->integer('sheetheader_id')->nullable();
            $table->string('sheet_code')->nullable();
            
            $table->string('sheet_name')->nullable();
            $table->string('sheet_description')->nullable();
            $table->string('sheet_notes')->nullable();

            $table->decimal('sheet_qty', 10, 2)->nullable();
            $table->decimal('sheet_price', 10, 2)->nullable();
            $table->decimal('sheet_grossamt', 10, 2)->nullable();
            $table->decimal('sheet_grossamt2', 10, 2)->nullable();
            $table->decimal('sheet_discountrate', 10, 2)->nullable();
            $table->decimal('sheet_discountvalue', 10, 2)->nullable();
            $table->decimal('sheet_taxrate', 10, 2)->nullable();
            $table->decimal('sheet_taxvalue', 10, 2)->nullable();
            $table->decimal('sheet_netamt', 10, 2)->nullable();
            $table->decimal('sheet_netamt2', 10, 2)->nullable();
            $table->decimal('sheet_realamt', 10, 2)->nullable();

            $table->bigInteger('uom_id')->nullable();
            $table->string('uom_name')->nullable();

            $table->bigInteger('sheetgroup_seqno')->nullable();
            $table->bigInteger('sheet_seqno')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('contractsheets');
    }
}
