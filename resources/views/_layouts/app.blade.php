<html>
    <head>
        <title>KIOSK | @yield('title')</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css?family=Titillium+Web:300,400,600|Material+Icons" rel="stylesheet">
        <link href="{{ mix('css/style.css') }}" rel="stylesheet">
    </head>
    <body>
        <header class="page-header" role="banner">
            @include ('_partials.menu')
            <button class="switch-display-mode minimal material-icons" title="Reader-Modus umschalten">
                chrome_reader_mode
            </button>
        </header>
        <div class="wrapper">
            <header class="content-header">@section('sidebar')
                    @include('_partials.search')
                    <div class="collections">
                        <h3>{{ __('books.library') }}</h3>
                    </div>
                @show</header>
            @yield('content')
        </div>
        <footer>
            <div class="notifications">
                @if($errors->any())
                    <span class="notification">{{$errors->first()}}</span>
                @endif
            </div>
        </footer>
        <script>
          window.routes = [
                  @foreach(app()->routes->getRoutes() as $route)
            {
              as:  '{!! $route->getName() !!}',
              uri: '{!! $route->uri !!}'
            },
              @endforeach
          ];
        </script>
        <script src="{{ mix('js/app.js') }}"></script>
    </body>
</html>
