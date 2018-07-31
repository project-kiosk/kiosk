'use strict';

/*
 global window,
 document
 */

document.addEventListener( 'DOMContentLoaded', () => {
  Array.from( document.querySelectorAll( '[data-link-button]' ) )
       .forEach( button => button.addEventListener( 'click', () => {
         if ( button.dataset.hasOwnProperty( 'target' ) ) {
           window.location = button.dataset.target;

           return;
         }

         window.history.go( -1 );
       } ) );

  const coverUpload = document.querySelector( '[data-cover-upload-field]' );

  if ( coverUpload ) {
    coverUpload.addEventListener( 'change', event => {
      if ( event.target.files && event.target.files[ 0 ] ) {
        const reader = new FileReader();

        reader.addEventListener( 'load', event => {
          const coverPlaceholder = document.querySelector( '.book-cover-placeholder' );

          coverPlaceholder.classList.add( 'loaded' );
          coverPlaceholder.style.backgroundImage = `url(data:${event.target.result})`;
        } );

        reader.readAsDataURL( event.target.files[ 0 ] );
      }
    } );
  }

  const bookUpload = document.querySelector( '[data-book-upload-field]' );

  if ( bookUpload ) {
    bookUpload.addEventListener( 'change', event => {
      const metaContainer = document.querySelector( 'label .book-meta' );

      if ( event.target.files && event.target.files[ 0 ] ) {
        const data = new FormData();

        data.append( 'book', event.target.files[ 0 ] );

        fetch( new Request( '/api/books/meta', {
          method: 'POST',
          body:   data
        } ) )
          .then( response => response.json() )
          .then( meta => {
            metaContainer.classList.add( 'loaded' );

            metaContainer.querySelector( '.title .value' ).innerText = (
              meta.title
              ? meta.title
              : 'Nicht angegeben'
            );

            metaContainer.querySelector( '.language .value' ).innerText = (
              meta.language
              ? meta.language
              : 'Nicht angegeben'
            );

            metaContainer.querySelector( '.isbn .value' ).innerText = (
              meta.isbn
              ? meta.isbn
              : 'Nicht angegeben'
            );

            metaContainer.querySelector( '.publishingDate .value' ).innerText = (
              meta.publishing_date
              ? ( new Date( meta.publishing_date.date ) ).toLocaleDateString()
              : 'Nicht angegeben'
            );

            metaContainer.querySelector( '.creator .value' ).innerText = (
              meta.author
              ? meta.author
              : 'Nicht angegeben'
            );

            metaContainer.querySelector( '.publisher .value' ).innerText = (
              typeof meta.publisher === 'object'
              ? meta.publisher.text
              : ( meta.publisher
                  ? meta.publisher
                  : 'Nicht angegeben'
              )
            );

            metaContainer.querySelector( '.genre .value' ).innerText = (
              Array.isArray( meta.subject )
              ? meta.subject.join( ', ' )
              : ( meta.subject
                  ? meta.subject
                  : 'Nicht angegeben'
              )
            );

            metaContainer.querySelector( '.complete-meta pre' ).innerText = JSON.stringify( meta, null, 2 );
          } );
      } else {
        metaContainer.classList.remove( 'loaded' );
      }
    } );
  }

  Array
    .from( document.querySelectorAll( '[data-toggle]' ) )
    .forEach( toggle => toggle.addEventListener( 'click', event => {
                document.querySelector( toggle.dataset.toggleElement ).classList.toggle( 'expanded' );
              } )
    );

  Array
    .from( document.querySelectorAll( '[data-download-book-button]' ) )
    .forEach( button => button.addEventListener( 'click', event => {
      const anchor = document.createElement( 'a' );

      anchor.download = button.dataset.download;
      anchor.href     = button.dataset.target;

      document.body.appendChild( anchor );

      anchor.click();
    } ) );

  Array
    .from( document.querySelectorAll( '[data-remove-book-button]' ) )
    .forEach( button => button.addEventListener( 'click', () => {
      if ( confirm( 'delete book?' ) ) {
        console.log( 'would delete' );
      }
    } ) );

  const enlargeableCover = document.querySelector( '[data-enlargeable-cover]' );

  if ( enlargeableCover ) {
    enlargeableCover.addEventListener( 'click', event => {
      if ( event.target.nodeName === 'IMG' ) {
        return event.target.parentNode.classList.toggle( 'zoom' );
      }

      if ( event.target.classList.contains( 'zoom' ) ) {
        event.target.classList.remove( 'zoom' );
      }
    } );
  }
} );
