'use strict';

/*
 global module,
 require
 */

document.addEventListener('DOMContentLoaded', init);

function init () {
  document.querySelector('.create-book').addEventListener('click', event => {
    location.href = '/books/add';
  });
}
