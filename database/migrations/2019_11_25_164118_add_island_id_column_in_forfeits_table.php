<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddIslandIdColumnInForfeitsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('forfeits', function (Blueprint $table) {
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
        Schema::table('forfeits', function (Blueprint $table) {
            $table->dropColumn('island_id');
        });
    }
}
