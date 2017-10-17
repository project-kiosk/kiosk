'use strict';

/*
 global module,
 require
 */

const redis  = require( 'redis' ),
      crypto = require( 'crypto' );

let _instance,
    errorCount = 0;

/**
 * @property {object}      _config
 */
class Database {
  constructor ( config ) {
    this._config = Object.assign( {
      host: '127.0.0.1',
      port: 6379
    }, config );

    if ( !_instance ) {
      this.connect();
    }
  }

  connect () {
    _instance = redis.createClient( this._config );

    _instance.on( 'ready', () => console.log( `Database connection established` ) );
    _instance.on( 'error', this.handleError );
  }

  handleError ( error ) {
    errorCount++;

    if ( errorCount > 5 ) {
      throw new Error( 'Unable to recover database connection (more than five retries): ' + error.message );
    }
  }

  static get connection () {
    return _instance;
  }

  flush () {
    return new Promise( ( resolve, reject ) => _instance.send_command( 'flushdb', [], ( error ) => {
      if ( error ) {
        return reject( error );
      }

      return resolve();
    } ) );
  }

  exists ( key ) {
    return new Promise( ( resolve, reject ) => _instance.exists( key, ( error, exists ) => {
      if ( error ) {
        return reject( error );
      }

      return resolve( exists === 1 );
    } ) );
  }

  remove ( key ) {
    return new Promise( ( resolve, reject ) => _instance.del( key, ( error ) => {
      if ( error ) {
        return reject( error );
      }

      return resolve();
    } ) );
  }

  removeAll ( keys ) {
    return new Promise( ( resolve, reject ) => {
      const multi = _instance.multi();

      for ( let i = 0; i < keys.length; i += 1 ) {
        multi.del( keys[ i ] );
      }

      multi.exec( ( error ) => {
        if ( error ) {
          return reject( error );
        }
        return resolve();
      } );
    } );
  };

  get ( key ) {
    return new Promise( ( resolve, reject ) => _instance.get( key, ( error, value ) => {
      if ( error ) {
        return reject( error );
      }

      return resolve( value );
    } ) );
  }

  set ( key, value ) {
    return new Promise( ( resolve, reject ) => _instance.set( key, value, ( error ) => {
      if ( error ) {
        return reject( error );
      }

      return resolve();
    } ) );
  }

  increment ( key ) {
    return new Promise( ( resolve, reject ) => _instance.incr( key, ( error ) => {
      if ( error ) {
        return reject( error );
      }

      return resolve();
    } ) );
  }

  rename ( oldName, newName ) {
    return new Promise( ( resolve, reject ) => _instance.rename( oldName, newName, ( error ) => {
      if ( error && error.message !== 'ERR no such key' ) {
        return reject( error );
      }

      return resolve();
    } ) );
  }

  multiKeys ( command, keys ) {
    return new Promise( ( resolve, reject ) => {
      const multi = _instance.multi();

      for ( let i = 0; i < keys.length; i += 1 ) {
        if ( keys[ i ] === null ) {
          continue;
        }

        multi[ command ]( keys[ i ] );
      }

      return multi.exec( ( error, results ) => {
        if ( error ) {
          return reject( error );
        }

        return resolve( results );
      } );
    } );
  };

  search ( pattern, cursor = '0', found = new Set() ) {
    return _instance.scan( cursor, 'MATCH', pattern, 'COUNT', '100', ( error, reply ) => {
      if ( error ) {
        throw new Error( 'Error scanning: ', error );
      }

      cursor   = reply [ 0 ];
      let keys = reply[ 1 ];

      keys.forEach( ( key, index ) => {
        found.add( key );
      } );

      if ( cursor === '0' ) {
        return Array.from( found );
      }

      return this.search( pattern, cursor, found );
    } );
  }

  /**
   * creates a new hash or updates an existing one
   *
   * @param   {string}  prefix prefix for the key name
   * @param   {object}  data   hash content
   * @returns {Promise}
   */
  setObject ( data = {}, prefix ) {
    if ( !data._id ) {
      data._id = this._createId();
    }

    return new Promise( ( resolve, reject ) => {
      Object.keys( data ).forEach( key => {
        if ( data[ key ] === undefined ) {
          delete data[ key ];
        }
      } );

      if ( Object.keys( data ).length === 0 ) {
        return reject( new Error( 'No data to set' ) );
      }

      return _instance.hmset( (prefix ? prefix + ':' : '') + data._id, data, error => {
        if ( error ) {
          return reject( error );
        }

        return resolve( data._id );
      } );
    } );

    /*
     TODO: Implement index sets
     This is on hold because we need a way to remove stale indexes if fields change

     .then(() => {
     Object.keys(data).forEach(field => {
     if (field === '_id') {
     return;
     }

     _instance.sadd(`${field}_${data[field]}`, key);
     });
     });
     */
  }

  /**
   * retrieves a hash
   *
   * @param   {string}  key hash key
   * @returns {Promise}
   */
  getObject ( key ) {
    return new Promise( ( resolve, reject ) => _instance.hgetall( key, ( error, data ) => {
      if ( error ) {
        return reject( error );
      }

      return resolve( data );
    } ) );
  }

  /**
   * removes a hash
   *
   * @param   {string}  key hash key
   * @returns {Promise}
   */
  removeObject ( key ) {
    return new Promise( ( resolve, reject ) => _instance.del( key, error => {
      if ( error ) {
        return reject( error );
      }

      return resolve();
    } ) );
  }

  setObjectField ( key, field, value ) {
    return new Promise( ( resolve, reject ) => _instance.hget( key, field, ( error, data ) => {
      if ( error ) {
        return reject( error );
      }

      return resolve( data );
    } ) );
  }

  /**
   * retrieves a single hash field
   *
   * @param   {string}  key   hash key
   * @param   {string}  field field name
   * @returns {Promise}
   */
  getObjectField ( key, field ) {
    return new Promise( ( resolve, reject ) => _instance.hget( field, key, ( error, data ) => {
      if ( error ) {
        return reject( error );
      }

      return resolve( data );
    } ) );
  }

  addObjectIndex ( key, setName ) {
    return new Promise( ( resolve, reject ) => _instance.sadd( setName, key, error => {
      if ( error ) {
        return reject( new Error( `Could not add ${key} to object index ${setName}: ${error.message}` ) );
      }

      return resolve( key );
    } ) );
  }

  removeObjectIndex ( key, setName ) {
    return new Promise( ( resolve, reject ) => _instance.srem( setName, key, error => {
      if ( error ) {
        return reject( new Error( `Could not remove ${key} from object index ${setName}: ${error.message}` ) );
      }

      return resolve();
    } ) );
  }

  addReverseIndex ( key, indexName, name ) {
    return new Promise( ( resolve, reject ) => _instance.hset( indexName, name, key, error => {
      if ( error ) {
        return reject( new Error( `Could not add ${key} to reverse index ${indexName}: ${error.message}` ) );
      }

      return resolve( key );
    } ) );
  }

  removeReverseIndex ( key, indexName ) {
    return new Promise( ( resolve, reject ) => _instance.hdel( indexName, key, error => {
      if ( error ) {
        return reject( new Error( `Could not remove ${key} from reverse index ${indexName}: ${error.message}` ) );
      }

      return resolve();
    } ) );
  }

  getAllObjectKeys ( setName ) {
    return new Promise( ( resolve, reject ) => _instance.smembers( setName, ( error, data ) => {
      if ( error ) {
        return reject( error );
      }

      return resolve( data );
    } ) );
  }

  getObjects ( keys ) {
    if ( !Array.isArray( keys ) ) {
      keys = [ keys ];
    }

    return this.multiKeys( 'hgetall', keys );
  }

  addSortedSet ( key, setName, position ) {
    return new Promise( ( resolve, reject ) => _instance.zadd( setName, position, key, error => {
      if ( error ) {
        return reject( new Error( `Could not add ${key} to set ${setName}: ${error.message}` ) );
      }

      return resolve( key );
    } ) );
  }

  removeSortedSet ( key, setName ) {
    console.log( 'this functionality has not yet been implemented' );
    return Promise.resolve();
  }

  getSortedSet ( setName ) {
    return new Promise( ( resolve, reject ) => _instance.zrange( setName ) );
  }

  /**
   * creates a unique ID
   *
   * @private
   * @returns {string} 32 character unique ID
   */
  _createId () {
    return crypto.randomBytes( 16 ).toString( 'hex' );
  }
}

module.exports = new Database;
