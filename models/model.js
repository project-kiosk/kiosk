'use strict';

/*
 global module,
 require
 */

const database = require( '../database' );

/**
 * abstract model class
 * provides a generic model object to be extended by subclasses. Subclasses should provide all individual fields
 * apart from the ID and extend the save method to create additional indexes for said fields.
 *
 * @property {string} _id
 * @abstract
 */
class Model {

  /**
   * saves an item to the database
   *
   * @returns {Promise}
   */
  save () {
    return database
      .setObject( this, this.modelName )
      .then( ( id ) => database.addObjectIndex( this.modelName + ':' + id, this.collectionName ) );
  }

  /**
   * removes an item
   *
   * @returns {Promise}
   */
  remove () {
    return database.removeObject( this._id );
  }

  update () {
    const previous = this.constructor.findById( this._id );

    return previous;
  }

  /**
   * returns the current model name
   *
   * @returns {string}
   */
  get modelName () {
    return this.constructor.name.toLowerCase();
  }

  /**
   * returns the current collection name
   *
   * @returns {string}
   */
  get collectionName () {
    return this.modelName + 's';
  }

  /**
   * returns the current model name for static methods
   *
   * @static
   * @returns {string}
   */
  static get modelName () {
    return this.name.toLowerCase();
  }

  /**
   * returns the current collection name for static methods
   *
   * @static
   * @returns {string}
   */
  static get collectionName () {
    return this.modelName + 's';
  }

  /**
   * find an item by its ID.
   * this will automatically create a new model instance, passing the database response to the model constructor
   *
   * @param   {string} id            item ID without model name prefix (this will automatically be appended)
   * @returns {Promise.<Model|null>} returns a single model instance holding the item data
   */
  static findById ( id ) {

    // retrieve the item from the database (HGETALL myModel:id123)
    return database
      .getObject( this.modelName + ':' + id )

      // create the model instance with the response
      .then( data => (data
          ? new this.prototype.constructor( data )
          : null
      ) );
  }

  /**
   * finds all items of the current model type
   *
   * @returns {Promise.<Array>}
   */
  static findAll () {
    return database
      .getAllObjectKeys( this.collectionName )
      .then( keys => database.getObjects( keys ) );
  }

  /**
   * finds items by an arbitrary set of fields.
   * all fields must have set a reverse index (field => id) in order to be found. it will build the name of the
   * reverse index automatically by joining model name and field name with a dash (myModel-myField).
   * @TODO multiple chained queries
   *
   * @stub
   * @param fields
   */
  static find ( fields ) {
    const queries = [];

    for ( let field in fields ) {
      if ( fields.hasOwnProperty( field ) ) {
        queries.push( database.getObjectField(
          fields[ field ],
          `${this.modelName}-${field}`
        ) );
      }
    }

    return Promise
      .all( queries )
      .then( results => {
        console.log( 'found results in find query:', fields, results );
        return results;
      } ).catch( error => console.log( 'could not find results: ', error ) );
  }

  /**
   * prepares a string to be used as the key name
   *
   * @param {string} keyName
   *
   * @returns {string}
   */
  static prepareKeyName ( keyName = '' ) {
    return keyName.replace( /\s+/g, '-' ).toLowerCase();
  }
}

module.exports = Model;
