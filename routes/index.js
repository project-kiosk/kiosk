'use strict';

/*
 global module,
 require
 */
const fs   = require( 'fs' ),
      path = require( 'path' );

module.exports = function ( app ) {

  // read route directory
  fs.readdirSync( __dirname )

    // remove all non-js files and the current index file
    .filter( file =>
      file !== path.basename( __filename ) &&
      file.slice( -3 ) === '.js'
    )
    .forEach( file => {
      let router = require( `./${file}` );
      router( app );
    } );
};
