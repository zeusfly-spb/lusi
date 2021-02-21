<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCertificatesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('certificates', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('island_id')->index();
            $table->bigInteger('customer_id')->index();
            $table->bigInteger('user_id')->index();
            $table->bigInteger('deal_id')->index();
            $table->integer('nominal');
            $table->date('start_date');
            $table->integer('duration');
            $table->json('history')->nullable()->default(null);
            $table->string('created_at', 19)->nullable()->default(null)->index();
            $table->string('updated_at', 19)->nullable()->default(null)->index();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('certificates');
    }
}
