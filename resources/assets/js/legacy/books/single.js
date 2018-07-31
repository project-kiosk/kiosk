'use strict';

/*
 global module,
 require
 */

document.addEventListener( 'DOMContentLoaded', init );

function init () {
  const book = document.querySelector( '.book' );

  Array.from( document.querySelectorAll( '.download-book' ) )
       .forEach( button => button.addEventListener( 'click', event => {
         let filename = button.dataset.download;

         location.href = `/uploads/books/${filename}`;
       } ) );

  book.querySelector( '.edit-book' ).addEventListener( 'click', event => {
    location.href = `${location.href.replace( /\/$/, '' )}/edit`;
  } );

  book.querySelector( '.read-book' ).addEventListener( 'click', event => {
    location.href = `${location.href.replace( /\/$/, '' )}/read`;
  } );

  book.querySelector( '.remove-book' ).addEventListener( 'click', event => {
    location.href = `${location.href.replace( /\/$/, '' )}/remove`;
  } );

  book.querySelector( '.cover' ).addEventListener( 'click', event => {
    if ( event.target.nodeName === 'IMG' ) {
      return event.target.parentNode.classList.toggle( 'zoom' );
    }

    if ( event.target.classList.contains( 'zoom' ) ) {
      event.target.classList.remove( 'zoom' );
    }
  } );
}

