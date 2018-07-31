<?php

namespace App\Http\Controllers;

use App\Author;
use App\Book;
use App\Genre;
use App\Publisher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Spatie\Glide\GlideImage;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use function fwrite;
use function tmpfile;

class BooksController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param \Illuminate\Http\Request $request
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $books  = Book::all();
        $filter = '';

        if ($authorId = $request->query('author')) {
            $author = Author::find($authorId);

            if ($author instanceof Author) {
                $books  = $books->intersect($author->books);
                $filter .= ' author:' . (strpos($author->name, ' ')
                        ? '"' . $author->name . '"'
                        : $author->name
                    );
            }
        }

        if ($publisherId = $request->query('publisher')) {
            $publisher = Publisher::find($publisherId);

            if ($publisher instanceof Publisher) {
                $books  = $books->intersect($publisher->books);
                $filter .= ' publisher:' . (strpos($publisher->name, ' ')
                        ? '"' . $publisher->name . '"'
                        : $publisher->name
                    );
            }
        }

        if ($genreId = $request->query('genre')) {
            $genre = Genre::find($genreId);

            if ($genre instanceof Genre) {
                $books  = $books->intersect($genre->books);
                $filter .= ' genre:' . (strpos($genre->name, ' ')
                        ? '"' . $genre->name . '"'
                        : $genre->name
                    );
            }
        }

        return view('books.index', [
            'books'  => $books,
            'filter' => trim($filter)
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return view('books.create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     *
     * @return \Illuminate\Http\RedirectResponse
     * @throws \ePub\Exception\OutOfBoundsException
     * @throws \Throwable
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'cover' => 'image|nullable',
            'book'  => 'mimetypes:application/epub+zip,application/zip'
        ]);

        $file  = $request->file('book');
        $cover = $request->file('cover');

        $metadata = Book::parseEpub($file, true);

        if ( ! $cover && $metadata['cover']) {

            // Generate a new temporary file for the cover
            $epubCoverFile = tmpfile();

            // Write the extracted cover image into the temp file
            fwrite($epubCoverFile, $metadata['cover']);

            // Create a new uploaded file from the temporary file
            $cover = new UploadedFile(
                stream_get_meta_data($epubCoverFile)['uri'],
                'cover.jpg'
            );
        }

        if ($metadata['id']) {
            $existingBook = Book::find($metadata['id']);

            if ($existingBook instanceof Book) {
                return Redirect::back()->withErrors([
                    'message' => __('books.uuid_exists', ['uuid' => $metadata['id']])
                ]);
            }
        }

        $book = new Book($metadata);

        if ($metadata['id']) {
            $book->id = $metadata['id'];
        }

        if ($book->isbn) {
            $existingBooks = Book::where('isbn', '=', $book->isbn)->get();

            if ($existingBooks->isNotEmpty()) {
                return Redirect::back()->withErrors([
                    'message' => __('books.isbn_exists', ['isbn' => $book->isbn])
                ]);
            }
        }

        if ($book->asin) {
            $existingBooks = Book::where('asin', '=', $book->asin)->get();

            if ($existingBooks->isNotEmpty()) {
                return Redirect::back()->withErrors([
                    'message' => __('books.asin_exists', ['asin' => $book->asin])
                ]);
            }
        }

        if ($metadata['author']) {
            $author = Author::where('name', $metadata['author']);

            if ( ! $author instanceof Author) {
                $author = new Author(['name' => $metadata['author']]);
                $author->save();
            }

            $book->author()->associate($author)->save();
        }

        if ($metadata['publisher']) {
            $publisher = Publisher::where('name', $metadata['publisher']);

            if ( ! $publisher instanceof Publisher) {
                $publisher = new Publisher(['name' => $metadata['publisher']]);
                $publisher->save();
            }

            $book->publisher()->associate($publisher)->save();
        }

        if ($metadata['genres']) {
            foreach ($metadata['genres'] as $genreName) {
                $genre = Genre::where('name', $genreName)->first();

                if ( ! $genre instanceof Genre) {
                    $genre = new Genre(['name' => $genreName]);
                    $genre->save();
                }

                $book->genres()->save($genre);
            }
        }

        $book->save();

        Storage::putFileAs(
            'public/books',
            $file,
            $book->id . '.' . $file->getClientOriginalExtension()
        );

        if ($cover) {
            $coverPath = Storage::putFileAs(
                'public/covers',
                $cover,
                $book->id . '.' . $cover->getClientOriginalExtension()
            );

            /** @noinspection PhpUndefinedClassInspection */
            GlideImage::create(Storage::path($coverPath))
                      ->modify([
                          'w'    => 100,
                          'h'    => 200,
                          'bri'  => 10,
                          'blur' => 75
                      ])
                      ->save(
                          Storage::disk('local')
                                 ->getDriver()
                                 ->getAdapter()
                                 ->applyPathPrefix(
                                     'public/covers/' . $book->id . '_preview.' . $cover->getClientOriginalExtension()
                                 )
                      );
        }

        return redirect(route('books.show', ['id' => $book->id]));
    }

    /**
     * Display the specified resource.
     *
     * @param  Book $book
     *
     * @return \Illuminate\Http\Response
     */
    public function show(Book $book)
    {
        return view('books.show', [
            'book' => $book
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int $id
     *
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int                      $id
     *
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     *
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    /**
     *
     *
     * @param \Illuminate\Http\Request $request
     *
     * @return array
     * @throws \ePub\Exception\OutOfBoundsException
     */
    public function parseEpub(Request $request)
    {
        return Book::parseEpub($request->file('book'));
    }

    public function search(Request $request)
    {
        $term = $request->query('term');

        if ( ! $term || strlen($term) < 3) {
            return redirect(route('books.index'));
        }

        $results = Book::search($term);

        return view('books.index', [
            'books'  => $results,
            'filter' => $term
        ]);
    }
}
