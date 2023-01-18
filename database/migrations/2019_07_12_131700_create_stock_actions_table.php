<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateStockActionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('stock_actions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('island_id')->unsigned()->index();
            $table->bigInteger('product_id')->unsigned()->index();
            $table->bigInteger('type_id')->unsigned()->index();
            $table->bigInteger('size_id')->unsigned()->index();
            $table->integer('count');
            $table->enum('type', ['receipt', 'expense']);
            $table->string('comment')->nullable()->default(null);
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
        Schema::dropIfExists('stock_actions');
    }
}
