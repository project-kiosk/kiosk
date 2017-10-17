'use strict';

/*
 global module,
 require
 */

document.addEventListener('DOMContentLoaded', init);

function init () {
  const switchDisplayModeButton = document.querySelector('.switch-display-mode');

  if (switchDisplayModeButton) {
    switchDisplayModeButton
      .addEventListener('click', event => document.documentElement.classList.toggle('reader'));
  }

  /**
   * attach a click listener to all cancel buttons to redirect
   * to the last visited endpoint
   */
  Array.prototype.forEach.call(
    document.querySelectorAll('button.cancel'),
    button => button.addEventListener('click', event => {
      location.href = location.href.split('/').slice(0, -1).join('/');
    })
  );
}
