'use strict';

/*
 global module,
 require
 */

/**
 * Override res.render to do any pre/post processing
 */
module.exports = function ( req, res, next ) {
  const render = res.render;

  res.render = function ( template, variables, callback ) {
    const req             = this.req;
    const defaultCallback = ( error, string ) => {
      if ( error ) {
        return next( error );
      }

      this.send( string );
    };

    variables = variables || {};

    if ( typeof variables === 'function' ) {
      callback  = variables;
      variables = {};
    }

    if ( typeof callback !== 'function' ) {
      callback = defaultCallback;
    }

    const baseVariables                = {};
    baseVariables.loggedIn             = req.hasOwnProperty( 'user' );
    baseVariables.template             = { name: template };
    baseVariables.template[ template ] = true;
    res.locals.template                = template;
    baseVariables._locals              = undefined;

    if ( baseVariables.loggedIn ) {
      baseVariables.user          = JSON.parse( JSON.stringify( req.user ) );
      baseVariables.user.id       = req.user.id;
      baseVariables.user.name     = req.user.firstName + ' ' + req.user.lastName;
      baseVariables.user.language = req.user.language;
      baseVariables.user.email    = req.user.email;
    }

    baseVariables.language = (req.hasOwnProperty( 'user' )
        ? req.query.lang || baseVariables.user.language
        : req.query.lang || 'de_DE'
    );

    baseVariables.bodyClass   = buildBodyClass( req );
    baseVariables.url         = (req.baseUrl + req.path).replace( /^\/api/, '' );
    baseVariables.cacheBuster = Date.now();
    baseVariables.csrfToken   = (req.csrfToken
        ? req.csrfToken()
        : ''
    );

    variables = Object.assign( baseVariables, variables );

    variables.pageTitle = (variables.pageTitle ? variables.pageTitle + ' | Kiosk' : 'Kiosk');

    return render.call( this, template, variables, function ( error, str ) {
      if ( error ) {

        console.log( 'view renderer encountered an error: ' + error.message );
        return callback( error );
      }

      console.log( 'rendering view ' + template );

      return callback( null, str );
    } );
  };

  next();
};

function buildBodyClass ( req ) {
  const clean = req.path.replace( /^\/|\/$/g, '' ),
        parts = clean.split( '/' ).slice( 0, 3 );

  parts.forEach( function ( part, index ) {
    parts[ index ] = index ? parts[ 0 ] + '-' + part : 'page-' + (part || 'home');
  } );

  return parts.join( ' ' );
}
