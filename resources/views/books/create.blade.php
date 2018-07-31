@extends('_layouts.app')

@section('title', __('books.add'))

@section('sidebar')
    @parent

    <div class="actions">
        <button class="cancel" data-link-button data-target="{{ route('books.index') }}">
            <span class="material-icons">arrow_back</span>
            <span>{{ __('global.back') }}</span>
        </button>
    </div>
@endsection

@section('content')
    <main role="main">
        <form class="add-book" method="post" action="{{ route('books.store') }}" enctype="multipart/form-data">
            {{ csrf_field() }}

            <h1>{{ __('books.add') }}</h1>
            <p>{{ __('books.add_help') }}</p>
            <label for="book-file">
                <span class="label-text">{{ __('books.book_upload_label') }}</span>
                <input id="book-file" type="file" name="book" accept="application/epub+zip" data-book-upload-field
                       required>
                <ul class="book-meta">
                    <li class="title">{{ __('books.title') }}: <span class="value"></span></li>
                    <li class="creator">{{ __('authors.author') }}: <span class="value"></span></li>
                    <li class="publisher">{{ __('publishers.publisher') }}: <span class="value"></span></li>
                    <li class="publishingDate">{{ __('books.publishing_date') }}: <span class="value"></span></li>
                    <li class="genre">{{ __('books.genre') }}: <span class="value"></span></li>
                    <li class="language">{{ __('books.language') }}: <span class="value"></span></li>
                    <li class="isbn">ISBN: <span class="value"></span></li>
                    <li class="complete-meta">
                        <button type="button" class="toggle-complete-meta" data-toggle data-toggle-element=".complete-meta pre">
                            {{ __('books.show_extended_meta') }}</button>
                        <pre></pre>
                    </li>
                </ul>
            </label>
            <label for="book-cover">
                <span class="label-text">{{ __('books.cover_upload_label') }}</span>
                <div class="book-cover-placeholder"></div>
                <input id="book-cover" type="file" name="cover" accept="image/*" data-cover-upload-field>
            </label>
            <footer class="button-group">
                <button class="cancel" type="button">
                    <span class="material-icons">cancel</span>
                    <span>{{ __('global.cancel') }}</span>
                </button>
                <button class="upload-book submit primary" type="submit">
                    <span class="material-icons">cloud_upload</span>
                    <span>{{ __('global.upload') }}</span>
                </button>
            </footer>
        </form>
    </main>
@endsection

