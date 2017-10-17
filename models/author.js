'use strict';

/*
 global module,
 require
 */
const path = require( 'path' );

const Model    = require( './model' ),
      database = require( '../database' );

/**
 * @property {string} _path
 * @property {object} metadata
 */
class Author extends Model {

  /**
   *
   * @param {object} data book meta data
   */
  constructor ( data ) {
    super();

    for ( let key in data ) {
      if ( data.hasOwnProperty( key ) ) {
        this[ key ] = data[ key ];
      }
    }
  }

  /**
   * overwrites the save method to add an additional index for the book author and add the book to a series, if any.
   *
   * @returns {Promise.<string>}
   */
  save () {
    return Author
      .findByName( this.name )
      .then( result => {

        // check if this book already exists since filenames can be considered unique
        if ( result[ 0 ] ) {
          this._id = result[ 0 ]._id;
          return 'author:' + result[ 0 ]._id;
        } else {
          return super
            .save()
            .then( id => database.addReverseIndex( id, 'author-names', this.name ) );
        }
      } );
  }

  static findByName ( name ) {
    return database.getObjectField( name, 'author-names' )
      .then( keys => database.getObjects( keys ) );
  }

  /*
   static findByBookName (bookName) {
   return database.getAllObjectKeys()
   }*/
}

module.exports = Author;
