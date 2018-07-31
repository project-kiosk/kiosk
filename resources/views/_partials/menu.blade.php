<nav class="menu" role="navigation">
    <span class="menu-item menu-item-logo">{{ env('APP_NAME') }}</span>
    <a class="menu-item menu-item-link" href="{{ route('books.index') }}">{{ __('books.books') }}</a>
    <a class="menu-item menu-item-link" href="{{ route('books.create') }}">{{ __('books.add') }}</a>
    <a class="menu-item menu-item-link" href="{{ route('authors.index') }}">{{ __('authors.authors') }}</a>
    <a class="menu-item menu-item-link" href="{{ route('publishers.index') }}">{{ __('publishers.publishers') }}</a>
</nav>
