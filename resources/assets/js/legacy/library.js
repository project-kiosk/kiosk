webpackJsonp([2],{

/***/ 30:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";


/*
 global module,
 require
 */

/**
 * simple event emitter to ease adding events
 */
class Emitter {

  /**
   * emit an event
   *
   * @param {string} eventName event to emit
   * @param {object} data      data to pass to the event detail
   */
  emit (eventName, data = {}) {
    const event = new CustomEvent(eventName, {
      detail: data
    });

    document.dispatchEvent(event);
  }

  /**
   * emits an event on one or more elements
   *
   * @param {HTMLElement|NodeList|Array} element   element to emit the event on
   * @param {string}                     eventName name of the event to emit
   * @param {object}                     data      object to pass as details
   */
  emitTo (element, eventName, data = {}) {
    if (element.length || element instanceof NodeList) {
      return Array.from(element).forEach(item => {
        let event = new CustomEvent(eventName, {
          detail: Object.assign({
            element:    item,
            elementSet: element
          }, data),
        });

        item.dispatchEvent(event);
      });
    }

    let event = new CustomEvent(eventName, {
      detail: data
    });

    element.dispatchEvent(event);
  }

  /**
   * attach an event listener
   *
   * @param {string}      eventName name of the event
   * @param {Function}    callback  event listener callback
   * @param {boolean}     capture   whether to capture the event
   */
  attach (eventName, callback, capture = false) {
    document.addEventListener(eventName, callback, capture);
  }

  /**
   * attach an event listener to one or more elements
   *
   * @param {HTMLElement|NodeList|Array} element   element to attach to
   * @param {string}                     eventName name of the event
   * @param {Function}                   callback  event listener callback
   * @param {boolean}                    capture   whether to capture the event
   */
  attachTo (element, eventName, callback, capture = false) {
    if (eventName.indexOf(':') > -1) {
      let parts = eventName.split(':'),
          catchAllEvents = [];

      parts.reduceRight(part => catchAllEvents.push(part))
    }

    if (element.length || element instanceof NodeList) {
      return Array.from(element).forEach(item => {
        item.addEventListener(eventName, callback, capture);
      });
    }

    element.addEventListener(eventName, callback, capture);
  }
}

/* harmony default export */ __webpack_exports__["a"] = (Emitter);


/***/ }),

/***/ 57:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__modules_emitter__ = __webpack_require__(30);


/*
 global module,
 require
 */



const emitter = new __WEBPACK_IMPORTED_MODULE_0__modules_emitter__["a" /* default */]();

console.log(emitter);


/***/ })

},[57]);