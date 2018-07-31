# kiosk
Kiosk is a simple web application to manage, read and download your ebooks.  

![Single book](https://github.com/Radiergummi/kiosk/raw/master/docs/screenshots/single-book-with-description.png)

## Requirements
Kiosk **previously** used Redis to store the ebook meta data. In V2, we've switched to a PHP-based backend using SQLite. The books themselves are stored on the filesystem.

## Usage

Clone the repository:

    git clone https://github.com/Radiergummi/kiosk

Install the dependencies:

    composer install

Start the application:

    php artisan serve

Visit the following URL in your browser: [localhost:8000](http://localhost:8000). Welcome to Kiosk.

To run it permanently, set up your favorite webserver as describer in the [Laravel documentation](https://laravel.com/docs/5.6/installation#web-server-configuration).

## Screenshots, features, etc

### Books overview
![Books overview](https://github.com/Radiergummi/kiosk/raw/master/docs/screenshots/books-overview.png)
![Books overview 2](https://github.com/Radiergummi/kiosk/raw/master/docs/screenshots/books-overview-2.png)
![Books overview 3](https://github.com/Radiergummi/kiosk/raw/master/docs/screenshots/books-overview-narrow.png)

### Single book
![Single book](https://github.com/Radiergummi/kiosk/raw/master/docs/screenshots/single-book-with-description.png)
![Single book 2](https://github.com/Radiergummi/kiosk/raw/master/docs/screenshots/single-book-2.png)
![Single book 3](https://github.com/Radiergummi/kiosk/raw/master/docs/screenshots/single-book-narrow.png)

### Upload a new book
![Upload book](https://github.com/Radiergummi/kiosk/raw/master/docs/screenshots/upload-book.png)
![Upload book 2](https://github.com/Radiergummi/kiosk/raw/master/docs/screenshots/upload-book-swap-cover.png)
![Upload book 3](https://github.com/Radiergummi/kiosk/raw/master/docs/screenshots/upload-book-autodiscover-metadata.png)
![Upload book 3](https://github.com/Radiergummi/kiosk/raw/master/docs/screenshots/upload-book-extended-metadata.png)

### Edit a book
![Edit book](https://github.com/Radiergummi/kiosk/raw/master/docs/screenshots/edit-book-calendar.png)
![Edit book 2](https://github.com/Radiergummi/kiosk/raw/master/docs/screenshots/edit-book-description.png)

### Read a book
![Book reader](https://github.com/Radiergummi/kiosk/raw/master/docs/screenshots/book-reader-menu-bar.png)
![Book reader 2](https://github.com/Radiergummi/kiosk/raw/master/docs/screenshots/book-reader-light-mode.png)
![Book reader 2](https://github.com/Radiergummi/kiosk/raw/master/docs/screenshots/book-reader-night-mode.png)

### View books by author (or publisher, or date, or genre, or...)
![Book sorting](https://github.com/Radiergummi/kiosk/raw/master/docs/screenshots/books-by-author.png)
![Book sorting 2](https://github.com/Radiergummi/kiosk/raw/master/docs/screenshots/books-by-author-narrow.png)

## Current state of development
I made Kiosk a while ago to solve a specific problem: Having to manage an ebook library for my family. The goal was to have an easy interface anyone here could upload, view and edit his ebooks and later download them on their reader.  
Since then, I haven't had much time and there is still much left to do. The application works, but there are some bugs to iron out and the ebook meta data parsing could be more reliable. Design wise, there's also room for improvement.  

Therefore, if this project seems interesting to you or possibly solves the same problem for you, I'd be happy if you could participate in Kiosk by creating pull requests or filing issues. Thank you!
