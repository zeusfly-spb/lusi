<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAppointmentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('user_id')
                ->unsigned()->index();
            $table->bigInteger('performer_id')
                ->unsigned()->index()->nullable()->default(null);
            $table->bigInteger('service_id')
                ->unsigned()->index()->nullable()->default(null);
            $table->bigInteger('lead_id')
                ->unsigned()->index()->nullable()->default(null);
            $table->bigInteger('island_id')->index();
            $table->string('client_phone')->nullable()->default(null);
            $table->dateTime('date');
            $table->string('client_name');
            $table->string('comment')->nullable()->default(null);
            $table->string('cabinet_id')->nullable()->default(null);
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
        Schema::dropIfExists('appointments');
    }
}
