'use strict';

/*
 global module,
 require
 */

module.exports = function ( app ) {
  app.get( '/', ( req, res, next ) => {
    return res.render( 'dashboard' );
  } );
};
