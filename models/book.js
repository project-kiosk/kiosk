'use strict';

/*
 global module,
 require
 */
const path = require('path');

const Model    = require('./model'),
      database = require('../database');

/**
 * @property {string} _path
 * @property {object} metadata
 */
class Book extends Model {

  /**
   *
   * @param {string|object} filename path to the eBook file
   * @param {object} metadata book meta data
   */
  constructor (filename, metadata = filename) {
    super();

    if (typeof filename === 'object' && filename.hasOwnProperty('filename')) {
      this.filename = metadata.filename;
      delete metadata.filename;
    } else {
      this.filename = filename;
    }

    for (let key in metadata) {
      if (metadata.hasOwnProperty(key)) {
        this[ key ] = metadata[ key ];
      }
    }
  }

  get path () {
    return path.resolve(path.join(__dirname, '..', 'public', 'uploads', 'books', this.filename));
  }

  get publishingDate () {
    return this._publishingDate;
  }

  set publishingDate (date) {
    this._publishingDate = new Date(date);
  }

  /**
   * overwrites the save method to add an additional index for the book author and add the book to a series, if any.
   *
   * @param   {boolean}          force whether to overwrite an item
   * @returns {Promise.<string>}
   */
  save (force = false) {
    return Book
      .findByFilename(this.filename)
      .then(result => {

        // check if this book already exists since filenames can be considered unique
        if (result[ 0 ] && !force) {
          this._id = result[ 0 ]._id;
          return 'book:' + result[ 0 ]._id;
        } else {
          return super
            .save()
            .then(id => database.addReverseIndex(id, 'book-titles', this.title))
            .then(id => database.addReverseIndex(id, 'book-filenames', this.filename))
            .then(id => database.addObjectIndex(id, 'author:' + Model.prepareKeyName(this.author)))
            .then(id => {
              if (this.seriesVolume > 0 && this.series) {
                return database.addSortedSet(id, `series:${Model.prepareKeyName(this.series)}`, this.seriesVolume);
              }

              return id;
            });
        }
      });
  }

  remove () {
    let id = `book:${this._id}`;

    return super
      .remove()
      .then(() => database.removeReverseIndex(id, 'book-titles'))
      .then(() => database.removeReverseIndex(id, 'book-filenames'))
      .then(() => database.removeObjectIndex(id, `author:${Model.prepareKeyName(this.author)}`))
      .then(() => {
        if (this.seriesVolume > 0 && this.series) {
          return database.removeSortedSet(id, `series:${Model.prepareKeyName(this.series)}`);
        }
      });
  }

  /**
   * in order to update
   * @returns {Promise.<string>}
   */
  update () {
    return this.constructor
      .findById(this._id)
      .then(previousBook => previousBook.remove())
      .then(() => this.save(true));
  }

  static findByTitle (title) {
    return database.getObjectField(title, 'book-titles')
      .then(keys => database.getObjects(keys));
  }

  static findByAuthor (author) {
    return database.getAllObjectKeys('author:' + Model.prepareKeyName(author))
      .then(keys => database.getObjects(keys));
  }

  static findByFilename (filename) {
    return database.getObjectField(filename, 'book-filenames')
      .then(keys => database.getObjects(keys));
  }

  static findBySeries (series) {
    return database.getAllObjectKeys()
  }
}

module.exports = Book;
