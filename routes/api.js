'use strict';

/*
 global module,
 require
 */
const fs   = require( 'fs' ),
      path = require( 'path' );

const epub      = require( 'epub-metadata' ),
      wikipedia = require( 'wikipedia-js' );

const Book = require( '../models/book' );

module.exports = function ( app ) {
  app.get( '/api/books/:id', ( req, res, next ) => {
    return Book
      .findById( req.params.id )
      /*.then(book => {
       epub(book.path).then(meta => console.log(meta));

       return book;
       })*/
      .then( book => {
        res.json( book );
      } );
  } );

  app.get( '/api/books/:id/meta', ( req, res, next ) => {
    return Book
      .findById( req.params.id )
      .then( book => {
        return epub( book.path ).then( meta => {
          book.meta = meta;
          return book;
        } );
      } )
      .then( book => {
        res.json( book );
      } );
  } );

  app.post( '/api/books/meta', app.upload.single( 'file' ), ( req, res, next ) => {
    const tempFilename = path.join( __dirname, '..', 'public', 'uploads', 'temp', 'meta_temp.epub' );

    fs.writeFile( tempFilename, req.file.buffer, error => {
      if ( error ) {
        console.log( error );
        return res.status( 400 ).json( {
          error: 'Could not read meta: ' + error.message,
          stack: error.stack
        } );
      }

      epub( tempFilename )
        .then( meta => res.json( meta ) )
        //.then(() => fs.unlink(tempFilename));
        .catch( error => {
          console.log( error );
          return res.status( 400 ).json( {
            error: 'Could not read meta: ' + error.message,
            stack: error.stack
          } );
        } );
    } );
  } );

  app.get( '/api/books/search', ( req, res, next ) => {
    console.log( 'searching for books with', req.query );
    return Book.find( req.query ).then( results => {
      res.json( results );
    } );
  } );

  app.get( '/api/books/:id/update', ( req, res, next ) => {
    return Book.findById( req.params.id ).then( book => {
      book.author = '__TEST__';

      return book.update();
    } ).then( newBook => {
      res.json( newBook );
    } );
  } );

  app.get( '/api/authors/:name', ( req, res, next ) => {
    wikipedia.searchArticle( {
      query:       req.params.name,
      format:      'html',
      summaryOnly: true,
      lang:        'de'
    }, ( error, data ) => {
      if ( error ) {
        return next( error );
      }

      return res.send( {
        author:  req.params.name,
        summary: data
      } );
    } );
  } );
};
