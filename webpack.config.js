'use strict';

/*
 global module,
 require
 */

const path = require( 'path' );

const webpack = require( 'webpack' );

const javascriptPath = path.resolve( __dirname, 'public', 'js' ),
      sourcePath     = path.resolve( javascriptPath, 'src' ),
      outputPath     = javascriptPath,

      shared         = new webpack.optimize.CommonsChunkPlugin( {
        name:     'base',
        filename: 'base.js'
      } ),
      uglify         = new webpack.optimize.UglifyJsPlugin( {
        compress: {
          warnings: false
        }
      } );

module.exports = {
  entry:   {
    library: path.resolve( sourcePath, 'library.js' ),
    edit:    path.resolve( sourcePath, 'edit.js' ),
    reader:  path.resolve( sourcePath, 'reader.js' )
  },
  output:  {
    filename:          '[name].js',
    sourceMapFilename: '[name].js.map',
    path:              outputPath
  },
  plugins: [
    shared
  ]
};
