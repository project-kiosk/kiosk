'use strict';

/*
 global module,
 require
 */

const express = require( 'express' );

const loadRoutes     = require( './routes' ),
      loadMiddleware = require( './middleware' );

/**
 * create the app
 */
const app = express( {} );

/**
 * load middleware
 */
loadMiddleware( app );

/**
 * load the routes
 */
loadRoutes( app );

/**
 * 404 handler
 */
app.use( function ( req, res ) {
  if ( req.path.match( /\.jpg$/ ) ) {
    return res.sendFile( __dirname + '/public/img/default.jpg' );
  }

  res.status( 404 ).send( 'Page not found' );
} );

/**
 * let the server listen
 */
app.listen( 3000, () => {
  console.log( `KIOSK ${(process.env.NODE_ENV === 'development' ? '[dev]' : '')} listening on port 3000` );
} );
