<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect(route('books.index'));
})->name('home');

Route::get('/books/search', 'BooksController@search')->name('books.search');
Route::get('/books/read', 'BooksController@read')->name('books.read');
Route::resource('books', 'BooksController');

Route::resource('authors', 'AuthorsController');
Route::resource('publishers', 'PublishersController');

