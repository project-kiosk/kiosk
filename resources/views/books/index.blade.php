@extends('_layouts.app')

@section('title', 'Overview')

@section('sidebar')
    @parent

    <div class="actions">
        <button class="create-book" data-link-button data-target="{{ route('books.create') }}">
            <span class="material-icons">add</span>
            <span>{{ __('books.add') }}</span>
        </button>
    </div>
@endsection

@section('content')
    <main role="main" class="list books-list">
        @if ($books)
            @foreach ($books as $book)
                @include('books.book', $book)
            @endforeach
            <article class="book add-book-pseudo">
                <a href="{{ route('books.create') }}" class="cover">
                    <img src="{{asset('img/default.jpg')}}">
                </a>
                <section class="meta">
                    <h2 class="title"><a href="{{ route('books.create') }}">{{ __('books.add') }}</a></h2>
                    <h3 class="author"></h3>
                </section>
            </article>
            <article class="spacer"></article>
            <article class="spacer"></article>
            <article class="spacer"></article>
        @else
            <span class="no-content">{{ __('books.none_yet') }}</span>
        @endif
    </main>
@endsection
