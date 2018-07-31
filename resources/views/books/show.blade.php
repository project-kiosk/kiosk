@extends('_layouts.app')

@section('title', 'Overview')

@section('sidebar')
@endsection

@section('content')
    <main role="main" class="single single-book">
        <article class="book" id="book-{{ $book->id }}">
            <nav class="left-navigation"
                 style="background-image:url({{ asset('storage/covers/' . $book->id . '_preview.jpg' ) }})">
                <button class="previous cancel minimal" data-link-button data-target="{{ route('books.index') }}">
                    <span class="material-icons">arrow_back</span>
                    {{ __('global.back') }}
                </button>
                <div class="actions">
                    <button class="download-book" data-download-book-button data-download="filename">
                        <span class="material-icons">cloud_download</span>{{ __('global.download') }}
                    </button>
                </div>
            </nav>
            <div class="cover" data-enlargeable-cover>
                <img
                        src="{{ asset('storage/covers/' . $book->id . '.jpg') }}"
                        title="{!! __('books.cover_of', [ 'title' => $book->title ]) !!}"
                >
            </div>
            <nav class="top-navigation">
                <a href="{{ route('books.index') }}">{{ __('books.all') }}</a>
                @if ($book->author)
                    <a href="{{ route('books.index', [ 'author' => $book->author->id ]) }}">
                        {{ __('authors.more_from', [ 'author' => $book->author->name ]) }}
                    </a>
                @endif
                @if ($book->publisher)
                    <a href="{{ route('books.index', [ 'publisher' => $book->publisher->id ] ) }}">
                        {{ __('publishers.more_from', [ 'publisher' => $book->publisher->name ]) }}
                    </a>
                @endif
            </nav>
            <section class="meta">
                <h2 class="title">{{ $book->title }}</h2>
                <h3 class="author">
                    <span> </span>
                    @if ($book->author)
                        <a href="{{ route('authors.show', [ $book->author->id ]) }}"
                           title="{{ __('authors.books_by', [ 'author' => $book->author->name ]) }}">
                            {{ __('authors.by', [ 'author' => $book->author->name ]) }}
                        </a>
                    @else
                        <span>{{ __('authors.by', [ 'author' => __('authors.unknown') ]) }}</span>
                    @endif
                </h3>
                <h4 class="more">
                    {{ $book->publisher ? $book->publisher->name : __('publishers.unknown') }}
                    · {{ Carbon\Carbon::parse($book->publishing_date)->format(__('global.date_long')) }}
                </h4>
                @if ($book->genres->isNotEmpty())
                    <h5 class="genres">
                        @foreach($book->genres as $genre)
                            <a class="genre-link"
                               href="{{ route('books.index', [ 'genre' => $genre->id ]) }}">{{ $genre->name }}</a>
                        @endforeach
                    </h5>
                @endif
                <section class="description">
                    {!! $book->description !!}
                    @unless ($book->description)
                        {{ __('books.no_description') }}
                    @endunless
                </section>
                <div class="actions">
                    <button class="read-book" data-link-button data-target="{{ route('books.read', [ $book->id ]) }}">
                        <span class="material-icons">book</span>{{ __('global.read') }}
                    </button>
                    <button class="edit-book" data-link-button data-target="{{ route('books.edit', [ $book->id ]) }}">
                        <span class="material-icons">edit</span>{{ __('global.edit') }}
                    </button>
                    <button class="remove-book danger">
                        <span class="material-icons">delete</span>{{ __('global.delete') }}
                    </button>
                </div>
            </section>
        </article>
    </main>
@endsection
