<article class="book" id="book-{{ $book->id }}">
    <a href="/books/{{ $book->id }}" class="cover"
       style="background-image:url({{ asset('storage/covers/' . $book->id . '.jpg') }})">
        <img src="{{ asset('storage/covers/' . $book->id . '.jpg') }}">
    </a>
    <section class="meta">
        <h2 class="title"><a href="/books/{{ $book->id }}">{{ $book->title }}</a></h2>
        @if ($book->author)
            <h3 class="author">
                <a href="/books/author/{{ $book->author->id }}" title="Bücher von {{ $book->author->name }}">
                    {{ $book->author->name }}
                </a>
            </h3>
        @endif
    </section>
</article>
