<form class="search-form" method="get" action="{{ route('books.search') }}">
    <input name="term" placeholder="{{ __('global.search') }}" minlength="3" value="{{ $filter ?? '' }}">
    <button type="submit" class="material-icons">search</button>
</form>
