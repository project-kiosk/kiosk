'use strict';

/*
 global module,
 require
 */
const bodyParser    = require( 'body-parser' ),
      csurf         = require( 'csurf' ),
      express       = require( 'express' ),
      multer        = require( 'multer' ),
      session       = require( 'express-session' ),
      uploadStorage = multer.memoryStorage(),
      handlebars    = require( 'express-handlebars' );

const render = require( './render' );

module.exports = function ( app ) {
  app.use( express.static( __dirname + '/../public' ) );

  app.use( session( {
    name:   'id',
    secret: '02rj24fh4f0h82d3udj0428fj3u9f24hgjoikdhgure'
  } ) );

  app.use( bodyParser.urlencoded( { extended: true } ) );

  app.upload = multer( {
    storage: uploadStorage,
    limits:  {
      fieldSize: 100 * 1024 * 1024
    }
  } );

  /*
   app.use(csurf({
   cookie: true
   }));
   */

  app.engine( '.hbs', handlebars( {
    defaultLayout: 'default',
    extname:       '.hbs',
    helpers:       {
      formatDate: ( date ) => {
        if ( date == 'Invalid Date' ) {
          date = new Date();
        }

        let formatted = new Date( date ).toLocaleDateString( 'de-DE' ).split( '/' );

        return `${formatted[ 1 ]}.${formatted[ 0 ]}.${formatted[ 2 ]}`;
      },
      inputDate:  ( date ) => {
        let baseDate = (
          new Date( date ) == 'Invalid Date'
            ? new Date()
            : new Date( date )
        );

        return `${baseDate.getFullYear()}-${('00' + (baseDate.getMonth() + 1)).slice( -2 )}-${('00' + (baseDate.getDate())).slice( -2 )}`;
      }
    }
  } ) );

  app.set( 'view engine', '.hbs' );
  app.set( 'views', __dirname + '/../views' );
//app.enable('view cache');

  app.use( render );
};
