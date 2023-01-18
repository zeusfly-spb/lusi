<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTimeBreaksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('time_breaks', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('work_day_id')->unsigned()->index();
            $table->time('start_time');
            $table->time('finish_time')->nullable()->default(null);
            $table->timestamps();

            $table->foreign('work_day_id')->references('id')->on('work_days')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('time_breaks');
    }
}
