'use strict';

/*
 global module,
 require
 */

import '../epubjs/libs/zip.min.js';
import '../epubjs/epub.js';

document.addEventListener('DOMContentLoaded', init);

function init () {
  let filename           = document.querySelector('main').dataset.filename,

      nextPageButton     = document.querySelector('.page-navigation .next'),
      previousPageButton = document.querySelector('.page-navigation .previous');

  /**
   * Handle swiping on touch devices and keyboard input on desktop devices
   *
   * @param callback
   * @param renderer
   */
  EPUBJS.Hooks.register('beforeChapterDisplay').swipeDetection = function(callback, renderer) {
    function detectSwipe () {
      let script  = renderer.doc.createElement('script');
      script.text = `
        const swiper = new Hammer(document);
        
        swiper.on('swipeleft', () => parent.Emitter.emit('book:page:next'));
        swiper.on('swiperight', () => parent.Emitter.emit('book:page:prev'));
        
        document.addEventListener('keydown', event => {
          event.preventDefault();
          
          switch (event.keyCode) {
            case 37:
              parent.Emitter.emit('book:page:prev');
              break;
            case 39:
              parent.Emitter.emit('book:page:next');
              break;
            }
          });
          
          document.addEventListener('click', event => parent.Emitter.emit('book:click', parent.document, {
            target: event.target
          }));
      `;

      renderer.doc.head.appendChild(script);

      let style         = renderer.doc.createElement('style');
      style.textContent = `
        svg {height: auto;}
      `;

      renderer.doc.head.appendChild(style);
    }

    EPUBJS.core.addScript('//cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.6/hammer.min.js', detectSwipe, renderer.doc.head);
    if (callback) {
      callback();
    }
  };

  /**
   * create the epub instance
   */
  window.Book = ePub({
    spreads:     false,
    width:       400,
    fixedLayout: false,
    styles:      {
      'line-height': 1.5,
      'width':       '80vw',
      'margin':      '0 auto',
      'transition':  'all .25s'
    }
  });

  /**
   * open the ebook file
   */
  window.Book.open(`/uploads/books/${filename}`);

  /**
   * render the ebook
   */
  const rendered = window.Book.renderTo('area')
    .then(() => {
      console.log('book ready');

      let storedLastPosition = localStorage.getItem('lastPage');
      if (storedLastPosition) {
        window.Book.gotoCfi(storedLastPosition);
      }

      [ 'font-size', 'line-height', 'page-width' ].forEach(option => {
        let storedOption = localStorage.getItem(option);

        if (storedOption) {
          document.querySelector(`.${option}-selector`).value = storedOption;
          Book.setStyle(
            localStorage.getItem(`${option}_cssProperty`),
            storedOption + localStorage.getItem(`${option}_cssUnit`)
          );
        }
      });

      let storedColorScheme = localStorage.getItem('color-scheme');

      if (storedColorScheme) {
        Emitter.emit('ui:scheme:change', document, {
          scheme: storedColorScheme,
          color:  document.querySelector(`.scheme.${storedColorScheme}`).dataset.schemeColor
        });
      }

      window.Book.on('renderer:locationChanged', event => {
        localStorage.setItem('lastPage', event);
      });
    });

  Emitter.attach('ui:scheme:change', document, event => {
    document.documentElement.dataset.scheme = event.detail.scheme;
    localStorage.setItem('color-scheme', event.detail.scheme);
    Book.setStyle('color', event.detail.color);
  });

  Emitter.attach('book:page:prev', document, event => {
    Emitter.emit('book:returnPosition:increment');
    window.Book.prevPage()
  });

  Emitter.attach('book:page:next', document, event => {
    Emitter.emit('book:returnPosition:increment');
    window.Book.nextPage()
  });

  let pageTurnsSinceJump = 0;
  Emitter.attach('book:returnPosition:increment', document, event => {
    pageTurnsSinceJump++;

    if (pageTurnsSinceJump >= 3) {
      Emitter.emit('book:returnPosition:delete');
    }
  });

  Emitter.attach('book:returnPosition:delete', document, event => {
    let returnButton = document.querySelector('.current-position .return');

    returnButton.classList.remove('visible');
    delete returnButton.dataset.lastPosition;
    pageTurnsSinceJump = 0;
  });

  Emitter.attach('book:returnPosition:jump', document, event => {
    let returnToLast = document.querySelector('.current-position .return');
    window.Book.gotoCfi(returnToLast.dataset.lastPosition);
    returnToLast.classList.remove('visible');

    pageTurnsSinceJump = 0;
  });

  // listen to navigation button clicks
  previousPageButton.addEventListener('click', () => Emitter.emit('book:page:prev'));
  nextPageButton.addEventListener('click', () => Emitter.emit('book:page:next'));

  let UiElements    = document.querySelectorAll('.ui'),
      UiHideTimeout = 0,
      UiHidePaused  = false;

  // hide the UI if clicked outside it
  Emitter.attach('click', document, event => {

    // check if the clicked element is a UI element or a descendant of one
    if (!event.target.matches(`.ui ${event.target.tagName}`)) {
      Emitter.emit('ui:hide', UiElements);
    }
  });

  // capture click events inside the book iframe and hide the UI
  Emitter.attach('book:click', document, event => {
    document.body.classList.add('ui-hidden');
    Emitter.emit('ui:hide', UiElements);
  });

  // attach the UI:hide event to hide the UI
  Emitter.attach('ui:hide', UiElements, event => {
    event.detail.element.classList.remove('visible');
  });

  // if the mouse keeps still for 3 seconds, hide the UI
  document.addEventListener('mousemove', debounce(event => {
    document.body.classList.remove('ui-hidden');
    clearTimeout(UiHideTimeout);
    UiHideTimeout = setTimeout(() => {
      if (!UiHidePaused) {
        document.body.classList.add('ui-hidden');
        Emitter.emit('ui:hide', UiElements);
      }
    }, 3000);
  }, 400, true));

  Array.from(UiElements).forEach(element => {

    // keep the UI visible while the mouse hovers it
    element.addEventListener('mouseenter', debounce(event => {
        UiHidePaused = true;
      }, 400, true)
    );

    //hide the UI again if the mouse leaves it
    element.addEventListener('mouseleave', debounce(event => {
        UiHidePaused = false;
      }, 400, true)
    );
  });

  // if option buttons are clicked, toggle their dropdown menus
  Array.from(document.querySelectorAll('.option > button'))
    .forEach(button => button.addEventListener('click', event => {

      // check whether the current dropdown is visible and disable it accordingly
      if (!document.querySelector(`.${event.target.className}-dropdown`).classList.contains('visible')) {
        Array.from(document.querySelectorAll('.dropdown')).forEach(
          dropdown => dropdown.classList.remove('visible')
        );
      }

      document.querySelector(`.${event.target.className}-dropdown`).classList.toggle('visible');
    }));

  // change the book font size on input change and store the value in the local storage
  document.querySelector('.font-size-selector').addEventListener('change', event => {
    let fontSize = Number(event.target.value).toFixed(3);

    localStorage.setItem('font-size', fontSize);
    localStorage.setItem('font-size_cssProperty', 'font-size');
    localStorage.setItem('font-size_cssUnit', 'rem');
    Book.setStyle('font-size', `${fontSize}rem`);
  });

  // change the book page width on input change and store the value in the local storage
  document.querySelector('.page-width-selector').addEventListener('change', event => {
    let pageWidth = Number(event.target.value).toFixed(3);

    localStorage.setItem('page-width', pageWidth);
    localStorage.setItem('page-width_cssProperty', 'width');
    localStorage.setItem('page-width_cssUnit', '%');
    Book.setStyle('width', `${pageWidth}%`);
  });

  // change the book line height on input change and store the value in the local storage
  document.querySelector('.line-height-selector').addEventListener('change', event => {
    let lineHeight = Number(event.target.value).toFixed(3);

    localStorage.setItem('line-height', lineHeight);
    localStorage.setItem('line-height_cssProperty', 'line-height');
    localStorage.setItem('line-height_cssUnit', '');
    Book.setStyle('line-height', lineHeight);
  });

  // change the book line height on input change and store the value in the local storage
  Array.from(document.querySelectorAll('.color-scheme-dropdown .scheme'))
    .forEach(button => button.addEventListener('click', event => {
      let scheme      = button.dataset.scheme,
          schemeColor = button.dataset.schemeColor;

      Emitter.emit('ui:scheme:change', document, {
        scheme: scheme,
        color:  schemeColor
      });
    }));

  let controls     = document.querySelector('.current-position'),
      currentPage  = document.querySelector('#current-percent'),
      slider       = document.querySelector('.current-position-slider'),
      returnToLast = document.querySelector('.current-position .return');

  returnToLast.addEventListener('click', event => Emitter.emit('book:returnPosition:jump'));

  let mouseDown = false;

  window.Book.ready.all.then(() => {

    // Load in stored locations from json or local storage
    let key    = window.Book.settings.bookKey + '-locations',
        stored = localStorage.getItem(key);

    if (stored) {
      return window.Book.locations.load(stored);
    } else {

      // Or generate the locations on the fly
      // Can pass an option number of chars to break sections by
      // default is 150 chars
      return window.Book.locations.generate(1600);
    }
  })
    .then((locations) => {
      slider.addEventListener(
        'change',
        () => {
          let cfi = window.Book.locations.cfiFromPercentage(slider.value);
          window.Book.gotoCfi(cfi);
        },
        false
      );
      slider.addEventListener('mousedown', () => {
        returnToLast.dataset.lastPosition = window.Book.getCurrentLocationCfi();
        returnToLast.classList.add('visible');
        mouseDown = true;
      }, false);
      slider.addEventListener('mouseup', () => mouseDown = false, false);

      // Wait for book to be rendered to get current page
      rendered.then(() => {

        // Get the Percentage (or location) from current CFI
        let currentPagePercentage = window.Book.locations.percentageFromCfi(window.Book.getCurrentLocationCfi());
        slider.value              = currentPagePercentage;
        currentPage.value         = currentPagePercentage;
      });

      controls.appendChild(slider);
      currentPage.addEventListener('change', function() {
        let cfi = window.Book.locations.cfiFromPercentage(currentPage.value / 100);
        window.Book.gotoCfi(cfi);
      }, false);

      // Listen for location changed event, get percentage from CFI
      window.Book.on('renderer:locationChanged', function(location) {
        let percent    = window.Book.locations.percentageFromCfi(location),
            percentage = percent * 100;

        if (!mouseDown) {
          slider.value = percentage;
        }

        currentPage.value = Math.floor(percentage);
      });

      // Save out the generated locations to JSON
      localStorage.setItem(window.Book.settings.bookKey + '-locations', window.Book.locations.save());
    });
}

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 *
 * @param   {Function} func      function to debounce
 * @param   {number}   wait      delay for function calls
 * @param   {boolean}  immediate triggers calling on the leading instead of
 *                               the trailing edge
 * @returns {Function}           debounced function
 */
function debounce (func, wait, immediate) {
  let timeout;

  return () => {
    let later = () => {
      timeout = null;

      if (!immediate) {
        func.apply(this, arguments);
      }
    };

    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) {
      func.apply(this, arguments);
    }
  };
}

/**
 * simple event emitter to ease adding events
 */
class Emitter {

  /**
   * emit an event
   *
   * @param {string} eventName event to emit
   * @param          element   element to emit on
   * @param {object} data      data to pass to the event detail
   */
  static emit (eventName, element = document, data = {}) {
    if (element.length) {
      return Array.from(element).forEach(item => {
        item.dispatchEvent(new CustomEvent(eventName, {
          detail: Object.assign({
            element:    item,
            elementSet: element
          }, data),
        }));
      });
    }

    element.dispatchEvent(new CustomEvent(eventName, {
      detail: data
    }));
  }

  /**
   * attach an event listener
   * @param {string}   eventName event to listen to
   * @param            element   element or a set of elements to attach to
   * @param {Function} callback  callback to fire
   * @param options
   */
  static attach (eventName, element, callback, options) {
    if (element.length) {
      return Array.from(element).forEach(item => {
        item.addEventListener(eventName, callback, options);
      });
    }

    element.addEventListener(eventName, callback, options);
  }
}

// attach the Emitter to window
window.Emitter = Emitter;
