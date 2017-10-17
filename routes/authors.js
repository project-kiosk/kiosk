'use strict';

/*
 global module,
 require
 */

'use strict';

/*
 global module,
 require
 */

const epub      = require( 'epub-metadata' ),
      wikipedia = require( 'wikipedia-js' );

const database = require( '../database' );

module.exports = function ( app ) {
  app.get( '/authors/:name/update', ( req, res, next ) => {
    wikipedia.searchArticle( {
      query:       req.params.name,
      format:      'html',
      summaryOnly: true,
      lang:        'de'
    }, ( error, data ) => {
      if ( error ) {
        return next( error );
      }

      return res.render( 'authors/about', {
        author:  req.params.name,
        summary: data
      } );
    } );
  } );
};
