'use strict';

/*
 global module,
 require
 */
const fs   = require( 'fs' ),
      path = require( 'path' );

const epub    = require( 'epub-metadata' ),
      sharp   = require( 'sharp' ),
      stripJs = require( 'strip-js' );

const database       = require( '../database' ),
      epubMetaParser = require( '../epubMetaParser' ),
      Book           = require( '../models/book' );

/**
 *
 * @param app
 */
module.exports = function ( app ) {
  app.get( '/books', ( req, res, next ) => {
    Book.findAll().then( books => {
      return res.render( 'books/overview', {
        books: books
      } );
    } );
  } );

  app.get( '/books/search', ( req, res, next ) => {
    if ( !req.query.term || req.query.term.length < 3 ) {
      return res.redirect( '/books' );
    }

    return Book
      .findByTitle( req.query.term )
      .then( books => {
        console.log( 'yay, we found ' + books.length + ' book(s)! here they are:', books );
        return res.render( 'books/search', {
          books: books,
          term:  req.query.term
        } );
      } );
  } );

  app.get( '/books/add', ( req, res, next ) => {
    return res.render( 'books/add' );
  } );

  app.get( '/books/add/meta', ( req, res, next ) => {
    return Book
      .findById( req.session.bookId )
      .then( book => {
        return res.render( 'books/completeMeta', book );
      } );
  } );

  app.post( '/books/add/meta', ( req, res, next ) => {
    return Book
      .findById( req.body._id )
      .then( book => {
        for ( let field in req.body ) {
          if ( req.body.hasOwnProperty( field ) ) {
            book[ field ] = req.body[ field ];
          }
        }

        return book.update();
      } )
      .then( () => res.redirect( `/books/${req.body._id}` ) );
  } );

  app.post( '/books/add', app.upload.fields( [ { name: 'file' }, { name: 'cover' } ] ), ( req, res, next ) => {
    let incompleteMetadata = false;

    return new Promise( ( resolve, reject ) => {
      const safeFileName = req.files.file[ 0 ].originalname.replace( /\s+/gi, '_' ),
            filePath     = path.join( __dirname, '..', 'public', 'uploads', 'books', safeFileName );

      return fs.writeFile(
        filePath,
        req.files.file[ 0 ].buffer,
        ( error ) => {
          if ( error ) {
            return reject( error );
          }

          return resolve( filePath );
        }
      );
    } )
      .catch( error => {
        return next( error );
      } )
      .then( filePath => epubMetaParser( filePath ) )
      .then( meta => {
        let newBook = new Book( meta );

        if (
          (!meta.author || !meta.title) ||
          (meta.author === 'unknown' || meta.title === 'unknown')
        ) {
          incompleteMetadata = true;
        }

        return newBook
          .save()
          .then( () => newBook );
      } )
      .then( newBook => {
        return new Promise( ( resolve, reject ) => {
          req.files.cover[ 0 ].id = newBook._id;

          return sharp( req.files.cover[ 0 ].buffer )
            .jpeg()
            .toFile(
              path.join( __dirname, '..', 'public', 'uploads', 'covers', `${newBook._id}.jpg` ),
              function ( error ) {
                if ( error ) {
                  return reject( error );
                }

                return resolve( req.files.cover[ 0 ] );
              }
            );
        } );
      } )
      .catch( error => {
        return next( error );
      } )
      .then( cover => {
        return new Promise( ( resolve, reject ) => {
          return sharp( cover.buffer )
            .jpeg()
            .resize( 437, 614 )
            .blur( 65 )
            .toFile( path.join( __dirname, '..', 'public', 'uploads', 'covers', `${cover.id}_blur.jpg` ),
              function ( error ) {
                if ( error ) {
                  return reject( error );
                }

                return resolve( cover.id );
              }
            );
        } );
      } )
      .then( id => {
        if ( incompleteMetadata ) {
          req.session.bookId = id;
          return res.redirect( '/books/add/meta' );
        }

        return res.redirect( '/books/' + id );
      } );
  } );

  app.get( '/books/:id', ( req, res, next ) => {
    return Book
      .findById( req.params.id )
      .then( book => {
        if ( !book ) {
          return next( new Error( 'Could not find a book with ID ' + req.params.id ) );
        }

        return res.render( 'books/single', Object.assign( book, {
          layout: 'fullscreen'
        } ) );
      } );
  } );

  app.get( '/books/:id/edit', ( req, res, next ) => {
    return Book
      .findById( req.params.id )
      .then( book => {
        if ( !book ) {
          return next( new Error( 'Could not find a book with ID ' + req.params.id ) );
        }

        return res.render( 'books/edit', book );
      } );
  } );

  app.post( '/books/:id/edit', app.upload.single( 'cover' ), ( req, res, next ) => {
      return Book
        .findById( req.params.id )
        .then( book => {
          if ( !book ) {
            return next( new Error( 'Could not find a book with ID ' + req.params.id ) );
          }

          if ( req.body.title ) {
            book.title = req.body.title;
          }

          if ( req.body.author ) {
            book.author = req.body.author;
          }

          if ( req.body.publisher ) {
            book.publisher = req.body.publisher;
          }

          if ( req.body.publishingDate ) {
            let dateParts = req.body.publishingDate.split( '.' );

            book.publishingDate = new Date( dateParts[ 2 ], dateParts[ 1 ] - 1, dateParts[ 0 ], 1, 0, 0 );
          }

          if ( req.body.genre ) {
            book.genre = req.body.genre;
          }

          if ( req.body.description ) {
            book.description = stripJs( req.body.description );
          }

          return book
            .update()
            .then( id => {
              if ( req.file ) {
                return saveCover( req.params.id, req.file );
              }
            } )
            .then( () => res.redirect( '/books/' + req.params.id ) );
        } );
    }
  );

  app.get( '/books/:id/remove', ( req, res, next ) => {
    return Book
      .findById( req.params.id )
      .then( book => {
        if ( !book ) {
          return next( new Error( 'Could not find a book with ID ' + req.params.id ) );
        }

        return res.render( 'books/remove', book );
      } );
  } );

  app.post( '/books/:id/remove', ( req, res, next ) => {
    return Book
      .findById( req.params.id )
      .then( book => book.remove() )
      .then( () => res.redirect( '/books' ) );
  } );

  app.get( '/books/:id/read', ( req, res, next ) => {
    return Book
      .findById( req.params.id )
      .then( book => {
        if ( !book ) {
          return next( new Error( 'Could not find a book with ID ' + req.params.id ) );
        }

        return res.render( 'books/read', Object.assign( book, {
          layout: false
        } ) );
      } );
  } );

  app.get( '/books/author', ( req, res, next ) => {
    return res.redirect( '/books' );
  } );

  app.get( '/books/author/:name', ( req, res, next ) => {
    return Book
      .findByAuthor( req.params.name )
      .then( books => {
        res.render( 'books/author', {
          books:  books,
          author: req.params.name
        } );
      } );
  } );
};

/**
 * saves a book cover and creates an additional blurred thumbnail
 *
 * @param   {string}           id    book ID
 * @param   {object}           image uploaded image object
 * @returns {Promise.<string>}
 */
function saveCover ( id, image ) {
  image.id = id;

  return new Promise( ( resolve, reject ) => {
    return sharp( image.buffer )
      .jpeg()
      .toFile(
        path.join( __dirname, '..', 'public', 'uploads', 'covers', `${id}.jpg` ),
        function ( error ) {
          if ( error ) {
            console.log( 'error saving cover: ' + error.message );
            return reject( error );
          }

          return resolve( image );
        }
      );
  } )
    .then( cover => new Promise(
      ( resolve, reject ) => sharp( cover.buffer )
        .jpeg()
        .resize( 437, 614 )
        .blur( 65 )
        .toFile( path.join( __dirname, '..', 'public', 'uploads', 'covers', `${id}_blur.jpg` ),
          function ( error ) {
            if ( error ) {
              return reject( error );
            }

            return resolve( id );
          }
        )
      )
    );
}
