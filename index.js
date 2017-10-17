'use strict';

/*
 global module,
 require
 */

const server   = require( './server' ),
      database = require( './database' );

const epub = require( 'epub-metadata' );

const Book = require( './models/book' );

//database.flush().then(() => console.log('database flushed'));

/*
let myBooks = [
  new Book(
    'Ein Mann namens Ove - Backman, Fredrik.epub', {
      title:        'Ein Mann namens Ove',
      author:       'Frederik Backman',
      series:       'Alles hat einen Namen',
      seriesVolume: 1
    }).save(),
  new Book(
    'Ein Hund namens Marie - Backman, Fredrik.epub', {
      title:        'Ein Hund namens Marie',
      author:       'Frederik Backman',
      series:       'Alles hat einen Namen',
      seriesVolume: 2
    }).save(),
  new Book(
    'Der Schwarm - Frank Schätzing.epub', {
      title:        'Der Schwarm',
      author:       'Frank Schätzing'
    }).save()
];



Promise.all(myBooks).then(results => {
  console.log('books saved to db:', results);
}).catch(error => console.error(error))

  .then(() => Book.findByAuthor('Frederik Backman'))
  .then(books => console.log('Books by Frederik Backman:', books))
  .catch(error => console.log('Error getting books: ' + error + '\n', error))

  .then(() => Book.findAll())
  .then(books => console.log('All books:', books))
  .catch(error => console.log('Error getting books: ' + error + '\n', error))

  .then(() => Book.findByTitle('Der Schwarm'))
  .then(book => {
    console.log('Found book:', book, myBooks[ 0 ]);
    epub(myBooks[ 0 ].path).then(meta => {
      console.log('meta:', meta);
    })
  })
  .catch(error => console.log('Error getting book: ' + error + '\n', error))

;
*/
