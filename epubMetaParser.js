'use strict';

/*
 global module,
 require
 */

const path = require( 'path' );

const epub = require( 'epub-metadata' );

/**
 * parses the metadata from an EPUB file
 *
 * @param   {string}           epubFilePath path to the epub file
 * @returns {Promise.<object>}              parsed metadata
 */
module.exports = function ( epubFilePath ) {
  return epub( epubFilePath )
    .then( meta => {
      const parsed = {
        filename: path.basename( epubFilePath )
      };

      if ( meta ) {
        console.log( 'book has meta:', meta );
        if ( meta.creator ) {
          parsed.author = (Array.isArray( meta.creator )
              ? meta.creator[ 0 ].text
              : meta.creator.text
          );
        }

        if ( meta.title ) {
          parsed.title = meta.title;
        }

        if ( meta.language ) {
          parsed.language = meta.language;
        }

        if ( meta.description ) {
          parsed.description = meta.description;
        }

        if ( meta.date ) {
          parsed.publishingDate = (typeof meta.date === 'object'
              ? (Array.isArray( meta.date )
                  ? meta.date[ 0 ].text
                  : meta.date.text
                                   )
              : meta.date
          );
        }

        if ( meta.publisher ) {
          parsed.publisher = meta.publisher;
        }

        if ( meta.subject ) {
          parsed.genre = (
            Array.isArray( meta.subject )
              ? meta.subject[ 0 ]
              : meta.subject
          );
        }

        if ( meta.isbn ) {
          parsed.isbn = meta.isbn;
        }

        if ( meta[ 'mobi-asin' ] ) {
          parsed.mobiAsin = meta[ 'mobi-asin' ];
        }

        if ( meta[ 'calibre:series' ] ) {
          parsed.series = meta[ 'calibre:series' ];
        }

        if ( meta[ 'calibre:series_index' ] ) {
          parsed.seriesVolume = meta[ 'calibre:series_index' ];
        }

        if ( meta[ 'calibre:rating' ] ) {
          parsed.rating = meta[ 'calibre:rating' ];
        }
      } else {
        console.log( 'book has no meta:', meta );
      }

      return parsed;
    } );
};

