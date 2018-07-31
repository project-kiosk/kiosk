<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddBooksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('books', function (Blueprint $table) {
            $table->uuid('id');
            $table->primary('id');

            $table->uuid('author_id')->nullable();
            $table->foreign('author_id')->references('id')->on('authors')->onDelete('cascade');

            $table->uuid('publisher_id')->nullable();
            $table->foreign('publisher_id')->references('id')->on('publishers');

            $table->uuid('series_id')->nullable();
            $table->foreign('series_id')->references('id')->on('series')->onDelete('cascade');
            $table->integer('series_index')->nullable()->unsigned();

            $table->string('title')->nullable();
            $table->string('isbn')->nullable();
            $table->string('asin')->nullable();
            $table->string('sorting_name')->nullable();
            $table->date('publishing_date')->nullable();
            $table->integer('rating')->nullable()->unsigned();
            $table->string('language')->nullable();
            $table->text('description')->nullable();

            $table->softDeletes();
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
        Schema::dropIfExists('books');
    }
}
