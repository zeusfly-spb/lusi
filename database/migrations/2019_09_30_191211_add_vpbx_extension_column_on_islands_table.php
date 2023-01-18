<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddVpbxExtensionColumnOnIslandsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('islands', function (Blueprint $table) {
            $table->string('vpbx_extension', 4)->nullable()->default(null);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('islands', function (Blueprint $table) {
            $table->dropColumn('vpbx_extension');
        });
    }
}
