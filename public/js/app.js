/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ({

/***/ 11:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(12);
module.exports = __webpack_require__(43);


/***/ }),

/***/ 12:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
 global window,
 document
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

document.addEventListener('DOMContentLoaded', function () {
  Array.from(document.querySelectorAll('[data-link-button]')).forEach(function (button) {
    return button.addEventListener('click', function () {
      if (button.dataset.hasOwnProperty('target')) {
        window.location = button.dataset.target;

        return;
      }

      window.history.go(-1);
    });
  });

  var coverUpload = document.querySelector('[data-cover-upload-field]');

  if (coverUpload) {
    coverUpload.addEventListener('change', function (event) {
      if (event.target.files && event.target.files[0]) {
        var reader = new FileReader();

        reader.addEventListener('load', function (event) {
          var coverPlaceholder = document.querySelector('.book-cover-placeholder');

          coverPlaceholder.classList.add('loaded');
          coverPlaceholder.style.backgroundImage = 'url(data:' + event.target.result + ')';
        });

        reader.readAsDataURL(event.target.files[0]);
      }
    });
  }

  var bookUpload = document.querySelector('[data-book-upload-field]');

  if (bookUpload) {
    bookUpload.addEventListener('change', function (event) {
      var metaContainer = document.querySelector('label .book-meta');

      if (event.target.files && event.target.files[0]) {
        var data = new FormData();

        data.append('book', event.target.files[0]);

        fetch(new Request('/api/books/meta', {
          method: 'POST',
          body: data
        })).then(function (response) {
          return response.json();
        }).then(function (meta) {
          metaContainer.classList.add('loaded');

          metaContainer.querySelector('.title .value').innerText = meta.title ? meta.title : 'Nicht angegeben';

          metaContainer.querySelector('.language .value').innerText = meta.language ? meta.language : 'Nicht angegeben';

          metaContainer.querySelector('.isbn .value').innerText = meta.isbn ? meta.isbn : 'Nicht angegeben';

          metaContainer.querySelector('.publishingDate .value').innerText = meta.publishing_date ? new Date(meta.publishing_date.date).toLocaleDateString() : 'Nicht angegeben';

          metaContainer.querySelector('.creator .value').innerText = meta.author ? meta.author : 'Nicht angegeben';

          metaContainer.querySelector('.publisher .value').innerText = _typeof(meta.publisher) === 'object' ? meta.publisher.text : meta.publisher ? meta.publisher : 'Nicht angegeben';

          metaContainer.querySelector('.genre .value').innerText = Array.isArray(meta.subject) ? meta.subject.join(', ') : meta.subject ? meta.subject : 'Nicht angegeben';

          metaContainer.querySelector('.complete-meta pre').innerText = JSON.stringify(meta, null, 2);
        });
      } else {
        metaContainer.classList.remove('loaded');
      }
    });
  }

  Array.from(document.querySelectorAll('[data-toggle]')).forEach(function (toggle) {
    return toggle.addEventListener('click', function (event) {
      document.querySelector(toggle.dataset.toggleElement).classList.toggle('expanded');
    });
  });

  Array.from(document.querySelectorAll('[data-download-book-button]')).forEach(function (button) {
    return button.addEventListener('click', function (event) {
      var anchor = document.createElement('a');

      anchor.download = button.dataset.download;
      anchor.href = button.dataset.target;

      document.body.appendChild(anchor);

      anchor.click();
    });
  });

  Array.from(document.querySelectorAll('[data-remove-book-button]')).forEach(function (button) {
    return button.addEventListener('click', function () {
      if (confirm('delete book?')) {
        console.log('would delete');
      }
    });
  });

  var enlargeableCover = document.querySelector('[data-enlargeable-cover]');

  if (enlargeableCover) {
    enlargeableCover.addEventListener('click', function (event) {
      if (event.target.nodeName === 'IMG') {
        return event.target.parentNode.classList.toggle('zoom');
      }

      if (event.target.classList.contains('zoom')) {
        event.target.classList.remove('zoom');
      }
    });
  }
});

/***/ }),

/***/ 43:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })

/******/ });