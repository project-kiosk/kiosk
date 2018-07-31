<article class="book" id="book-{{ $book->id }}">
    <a href="{{ route('books.show', [ $book->id ]) }}" class="cover"
       style="background-image:url({{ asset('storage/covers/' . $book->id . '.jpg') }})">
        <img src="{{ asset('storage/covers/' . $book->id . '.jpg') }}">
    </a>
    <section class="meta">
        <h2 class="title"><a href="{{ route('books.show', [ $book->id ]) }}">{{ $book->title }}</a></h2>
        @if ($book->author)
            <h3 class="author">
                <a
                        href="{{ route('authors.show', [ $book->author->id ]) }}"
                        title="{{ __('authors.books_by', [ 'author' => $book->author->name ]) }}"
                >
                    {{ $book->author->name }}
                </a>
            </h3>
        @endif
    </section>
</article>
