<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDealsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('deals', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('user_id')->unsigned()->index();
            $table->bigInteger('island_id')->unsigned()->index();
            $table->bigInteger('customer_id')->unsigned()->index()->nullable()->default(null);
            $table->bigInteger('insole_id')->unsigned()->index();
            $table->integer('income');
            $table->integer('expense');
            $table->boolean('is_cache')->default(true);
            $table->timestamps();

            $table->foreign('island_id')->references('id')
                ->on('islands')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('deals');
    }
}
