'use strict';

/*
 global module,
 require
 */

document.addEventListener('DOMContentLoaded', init);

function init () {
  document.querySelector('#book-file').addEventListener('change', function(event) {
    let metaContainer = document.querySelector('label .book-meta');

    if (this.files && this.files[ 0 ]) {
      let data = new FormData();

      data.append('file', this.files[ 0 ]);

      fetch(new Request('/api/books/meta', {
        method: 'POST',
        body:   data
      }))
        .then(response => response.json())
        .then(meta => {
          metaContainer.classList.add('loaded');

          metaContainer.querySelector('.title .value').innerText = (
            meta.title
              ? meta.title
              : 'Nicht angegeben'
          );

          metaContainer.querySelector('.isbn .value').innerText = (
            meta.isbn
              ? meta.isbn
              : 'Nicht angegeben'
          );

          metaContainer.querySelector('.publishingDate .value').innerText = (
            meta.date
              ? (new Date(meta.date)).toLocaleDateString()
              : 'Nicht angegeben'
          );

          metaContainer.querySelector('.creator .value').innerText = (
            typeof meta.creator === 'object'
              ? (Array.isArray(meta.creator)
                  ? meta.creator[ 0 ].text
                  : meta.creator.text
            )
              : (meta.creator
                  ? meta.creator
                  : 'Nicht angegeben'
            )
          );

          metaContainer.querySelector('.publisher .value').innerText = (
            typeof meta.publisher === 'object'
              ? meta.publisher.text
              : (meta.publisher
                  ? meta.publisher
                  : 'Nicht angegeben'
            )
          );

          metaContainer.querySelector('.genre .value').innerText = (
            Array.isArray(meta.subject)
              ? meta.subject.join(', ')
              : (meta.subject
                  ? meta.subject
                  : 'Nicht angegeben'
            )
          );

          metaContainer.querySelector('.complete-meta pre').innerText = JSON.stringify(meta, null, 2);
        });
    } else {
      metaContainer.classList.remove('loaded');
    }
  });

  document.querySelector('.toggle-complete-meta').addEventListener('click', event => {
    document.querySelector('.complete-meta pre').classList.toggle('expanded');
  });

  document.querySelector('input#book-cover').addEventListener('change', function(event) {
    if (this.files && this.files[ 0 ]) {
      const reader = new FileReader();

      reader.onload = event => {
        let coverPlaceholder = document.querySelector('.book-cover-placeholder');
        coverPlaceholder.classList.add('loaded');
        coverPlaceholder.style.backgroundImage = `url(data:${event.target.result})`;
      };

      reader.readAsDataURL(this.files[ 0 ]);
    }
  });
}
