'use strict';

/*
 global module,
 require
 */
const EventEmitter = require( 'events' ).EventEmitter;

class Collection extends EventEmitter {
  constructor () {
    super();
    this._models = new Set;
  }

  add ( model ) {
    this._models.add( model );
  }
}

module.exports = Collection;
