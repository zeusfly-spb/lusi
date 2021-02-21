<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddIslandIdColumnInPrepaysTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('prepays', function (Blueprint $table) {
            $table->bigInteger('island_id')->unsigned()->nullable()->index()->default(null);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('prepays', function (Blueprint $table) {
            $table->dropColumn('island_id');
        });
    }
}
