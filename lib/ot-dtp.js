(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.otDtp = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

(function(global) {
  'use strict';

  var dateFormat = (function() {
      var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|'[^']*'|'[^']*'/g;
      var timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
      var timezoneClip = /[^-+\dA-Z]/g;
  
      // Regexes and supporting functions are cached through closure
      return function (date, mask, utc, gmt) {
  
        // You can't provide utc if you skip other args (use the 'UTC:' mask prefix)
        if (arguments.length === 1 && kindOf(date) === 'string' && !/\d/.test(date)) {
          mask = date;
          date = undefined;
        }
  
        date = date || new Date;
  
        if(!(date instanceof Date)) {
          date = new Date(date);
        }
  
        if (isNaN(date)) {
          throw TypeError('Invalid date');
        }
  
        mask = String(dateFormat.masks[mask] || mask || dateFormat.masks['default']);
  
        // Allow setting the utc/gmt argument via the mask
        var maskSlice = mask.slice(0, 4);
        if (maskSlice === 'UTC:' || maskSlice === 'GMT:') {
          mask = mask.slice(4);
          utc = true;
          if (maskSlice === 'GMT:') {
            gmt = true;
          }
        }
  
        var _ = utc ? 'getUTC' : 'get';
        var d = date[_ + 'Date']();
        var D = date[_ + 'Day']();
        var m = date[_ + 'Month']();
        var y = date[_ + 'FullYear']();
        var H = date[_ + 'Hours']();
        var M = date[_ + 'Minutes']();
        var s = date[_ + 'Seconds']();
        var L = date[_ + 'Milliseconds']();
        var o = utc ? 0 : date.getTimezoneOffset();
        var W = getWeek(date);
        var N = getDayOfWeek(date);
        var flags = {
          d:    d,
          dd:   pad(d),
          ddd:  dateFormat.i18n.dayNames[D],
          dddd: dateFormat.i18n.dayNames[D + 7],
          m:    m + 1,
          mm:   pad(m + 1),
          mmm:  dateFormat.i18n.monthNames[m],
          mmmm: dateFormat.i18n.monthNames[m + 12],
          yy:   String(y).slice(2),
          yyyy: y,
          h:    H % 12 || 12,
          hh:   pad(H % 12 || 12),
          H:    H,
          HH:   pad(H),
          M:    M,
          MM:   pad(M),
          s:    s,
          ss:   pad(s),
          l:    pad(L, 3),
          L:    pad(Math.round(L / 10)),
          t:    H < 12 ? 'a'  : 'p',
          tt:   H < 12 ? 'am' : 'pm',
          T:    H < 12 ? 'A'  : 'P',
          TT:   H < 12 ? 'AM' : 'PM',
          Z:    gmt ? 'GMT' : utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
          o:    (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
          S:    ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10],
          W:    W,
          N:    N
        };
  
        return mask.replace(token, function (match) {
          if (match in flags) {
            return flags[match];
          }
          return match.slice(1, match.length - 1);
        });
      };
    })();

  dateFormat.masks = {
    'default':               'ddd mmm dd yyyy HH:MM:ss',
    'shortDate':             'm/d/yy',
    'mediumDate':            'mmm d, yyyy',
    'longDate':              'mmmm d, yyyy',
    'fullDate':              'dddd, mmmm d, yyyy',
    'shortTime':             'h:MM TT',
    'mediumTime':            'h:MM:ss TT',
    'longTime':              'h:MM:ss TT Z',
    'isoDate':               'yyyy-mm-dd',
    'isoTime':               'HH:MM:ss',
    'isoDateTime':           'yyyy-mm-dd\'T\'HH:MM:sso',
    'isoUtcDateTime':        'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\'',
    'expiresHeaderFormat':   'ddd, dd mmm yyyy HH:MM:ss Z'
  };

  // Internationalization strings
  dateFormat.i18n = {
    dayNames: [
      'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ],
    monthNames: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ]
  };

function pad(val, len) {
  val = String(val);
  len = len || 2;
  while (val.length < len) {
    val = '0' + val;
  }
  return val;
}

/**
 * Get the ISO 8601 week number
 * Based on comments from
 * http://techblog.procurios.nl/k/n618/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
 *
 * @param  {Object} `date`
 * @return {Number}
 */
function getWeek(date) {
  // Remove time components of date
  var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Change date to Thursday same week
  targetThursday.setDate(targetThursday.getDate() - ((targetThursday.getDay() + 6) % 7) + 3);

  // Take January 4th as it is always in week 1 (see ISO 8601)
  var firstThursday = new Date(targetThursday.getFullYear(), 0, 4);

  // Change date to Thursday same week
  firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);

  // Check if daylight-saving-time-switch occured and correct for it
  var ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
  targetThursday.setHours(targetThursday.getHours() - ds);

  // Number of weeks between target Thursday and first Thursday
  var weekDiff = (targetThursday - firstThursday) / (86400000*7);
  return 1 + Math.floor(weekDiff);
}

/**
 * Get ISO-8601 numeric representation of the day of the week
 * 1 (for Monday) through 7 (for Sunday)
 * 
 * @param  {Object} `date`
 * @return {Number}
 */
function getDayOfWeek(date) {
  var dow = date.getDay();
  if(dow === 0) {
    dow = 7;
  }
  return dow;
}

/**
 * kind-of shortcut
 * @param  {*} val
 * @return {String}
 */
function kindOf(val) {
  if (val === null) {
    return 'null';
  }

  if (val === undefined) {
    return 'undefined';
  }

  if (typeof val !== 'object') {
    return typeof val;
  }

  if (Array.isArray(val)) {
    return 'array';
  }

  return {}.toString.call(val)
    .slice(8, -1).toLowerCase();
};



  if (typeof define === 'function' && define.amd) {
    define(dateFormat);
  } else if (typeof exports === 'object') {
    module.exports = dateFormat;
  } else {
    global.dateFormat = dateFormat;
  }
})(this);

},{}],4:[function(require,module,exports){
'use strict';

var SingleEvent = require('geval/single');
var MultipleEvent = require('geval/multiple');
var extend = require('xtend');

/*
    Pro tip: Don't require `mercury` itself.
      require and depend on all these modules directly!
*/
var mercury = module.exports = {
    // Entry
    main: require('main-loop'),
    app: app,

    // Base
    BaseEvent: require('value-event/base-event'),

    // Input
    Delegator: require('dom-delegator'),
    // deprecated: use hg.channels instead.
    input: input,
    // deprecated: use hg.channels instead.
    handles: channels,
    channels: channels,
    // deprecated: use hg.send instead.
    event: require('value-event/event'),
    send: require('value-event/event'),
    // deprecated: use hg.sendValue instead.
    valueEvent: require('value-event/value'),
    sendValue: require('value-event/value'),
    // deprecated: use hg.sendSubmit instead.
    submitEvent: require('value-event/submit'),
    sendSubmit: require('value-event/submit'),
    // deprecated: use hg.sendChange instead.
    changeEvent: require('value-event/change'),
    sendChange: require('value-event/change'),
    // deprecated: use hg.sendKey instead.
    keyEvent: require('value-event/key'),
    sendKey: require('value-event/key'),
    // deprecated use hg.sendClick instead.
    clickEvent: require('value-event/click'),
    sendClick: require('value-event/click'),

    // State
    // remove from core: favor hg.varhash instead.
    array: require('observ-array'),
    struct: require('observ-struct'),
    // deprecated: use hg.struct instead.
    hash: require('observ-struct'),
    varhash: require('observ-varhash'),
    value: require('observ'),
    state: state,

    // Render
    diff: require('virtual-dom/vtree/diff'),
    patch: require('virtual-dom/vdom/patch'),
    partial: require('vdom-thunk'),
    create: require('virtual-dom/vdom/create-element'),
    h: require('virtual-dom/virtual-hyperscript'),

    // Utilities
    // remove from core: require computed directly instead.
    computed: require('observ/computed'),
    // remove from core: require watch directly instead.
    watch: require('observ/watch')
};

function input(names) {
    if (!names) {
        return SingleEvent();
    }

    return MultipleEvent(names);
}

function state(obj) {
    var copy = extend(obj);
    var $channels = copy.channels;
    var $handles = copy.handles;

    if ($channels) {
        copy.channels = mercury.value(null);
    } else if ($handles) {
        copy.handles = mercury.value(null);
    }

    var observ = mercury.struct(copy);
    if ($channels) {
        observ.channels.set(mercury.channels($channels, observ));
    } else if ($handles) {
        observ.handles.set(mercury.channels($handles, observ));
    }
    return observ;
}

function channels(funcs, context) {
    return Object.keys(funcs).reduce(createHandle, {});

    function createHandle(acc, name) {
        var handle = mercury.Delegator.allocateHandle(
            funcs[name].bind(null, context));

        acc[name] = handle;
        return acc;
    }
}

function app(elem, observ, render, opts) {
    mercury.Delegator(opts);
    var loop = mercury.main(observ(), render, extend({
        diff: mercury.diff,
        create: mercury.create,
        patch: mercury.patch
    }, opts));
    if (elem) {
        elem.appendChild(loop.target);
    }
    return observ(loop.update);
}

},{"dom-delegator":7,"geval/multiple":20,"geval/single":21,"main-loop":22,"observ":45,"observ-array":33,"observ-struct":40,"observ-varhash":42,"observ/computed":44,"observ/watch":46,"value-event/base-event":47,"value-event/change":48,"value-event/click":49,"value-event/event":50,"value-event/key":51,"value-event/submit":57,"value-event/value":58,"vdom-thunk":60,"virtual-dom/vdom/create-element":71,"virtual-dom/vdom/patch":74,"virtual-dom/virtual-hyperscript":78,"virtual-dom/vtree/diff":91,"xtend":92}],5:[function(require,module,exports){
var EvStore = require("ev-store")

module.exports = addEvent

function addEvent(target, type, handler) {
    var events = EvStore(target)
    var event = events[type]

    if (!event) {
        events[type] = handler
    } else if (Array.isArray(event)) {
        if (event.indexOf(handler) === -1) {
            event.push(handler)
        }
    } else if (event !== handler) {
        events[type] = [event, handler]
    }
}

},{"ev-store":9}],6:[function(require,module,exports){
var globalDocument = require("global/document")
var EvStore = require("ev-store")
var createStore = require("weakmap-shim/create-store")

var addEvent = require("./add-event.js")
var removeEvent = require("./remove-event.js")
var ProxyEvent = require("./proxy-event.js")

var HANDLER_STORE = createStore()

module.exports = DOMDelegator

function DOMDelegator(document) {
    if (!(this instanceof DOMDelegator)) {
        return new DOMDelegator(document);
    }

    document = document || globalDocument

    this.target = document.documentElement
    this.events = {}
    this.rawEventListeners = {}
    this.globalListeners = {}
}

DOMDelegator.prototype.addEventListener = addEvent
DOMDelegator.prototype.removeEventListener = removeEvent

DOMDelegator.allocateHandle =
    function allocateHandle(func) {
        var handle = new Handle()

        HANDLER_STORE(handle).func = func;

        return handle
    }

DOMDelegator.transformHandle =
    function transformHandle(handle, broadcast) {
        var func = HANDLER_STORE(handle).func

        return this.allocateHandle(function (ev) {
            broadcast(ev, func);
        })
    }

DOMDelegator.prototype.addGlobalEventListener =
    function addGlobalEventListener(eventName, fn) {
        var listeners = this.globalListeners[eventName] || [];
        if (listeners.indexOf(fn) === -1) {
            listeners.push(fn)
        }

        this.globalListeners[eventName] = listeners;
    }

DOMDelegator.prototype.removeGlobalEventListener =
    function removeGlobalEventListener(eventName, fn) {
        var listeners = this.globalListeners[eventName] || [];

        var index = listeners.indexOf(fn)
        if (index !== -1) {
            listeners.splice(index, 1)
        }
    }

DOMDelegator.prototype.listenTo = function listenTo(eventName) {
    if (!(eventName in this.events)) {
        this.events[eventName] = 0;
    }

    this.events[eventName]++;

    if (this.events[eventName] !== 1) {
        return
    }

    var listener = this.rawEventListeners[eventName]
    if (!listener) {
        listener = this.rawEventListeners[eventName] =
            createHandler(eventName, this)
    }

    this.target.addEventListener(eventName, listener, true)
}

DOMDelegator.prototype.unlistenTo = function unlistenTo(eventName) {
    if (!(eventName in this.events)) {
        this.events[eventName] = 0;
    }

    if (this.events[eventName] === 0) {
        throw new Error("already unlistened to event.");
    }

    this.events[eventName]--;

    if (this.events[eventName] !== 0) {
        return
    }

    var listener = this.rawEventListeners[eventName]

    if (!listener) {
        throw new Error("dom-delegator#unlistenTo: cannot " +
            "unlisten to " + eventName)
    }

    this.target.removeEventListener(eventName, listener, true)
}

function createHandler(eventName, delegator) {
    var globalListeners = delegator.globalListeners;
    var delegatorTarget = delegator.target;

    return handler

    function handler(ev) {
        var globalHandlers = globalListeners[eventName] || []

        if (globalHandlers.length > 0) {
            var globalEvent = new ProxyEvent(ev);
            globalEvent.currentTarget = delegatorTarget;
            callListeners(globalHandlers, globalEvent)
        }

        findAndInvokeListeners(ev.target, ev, eventName)
    }
}

function findAndInvokeListeners(elem, ev, eventName) {
    var listener = getListener(elem, eventName)

    if (listener && listener.handlers.length > 0) {
        var listenerEvent = new ProxyEvent(ev);
        listenerEvent.currentTarget = listener.currentTarget
        callListeners(listener.handlers, listenerEvent)

        if (listenerEvent._bubbles) {
            var nextTarget = listener.currentTarget.parentNode
            findAndInvokeListeners(nextTarget, ev, eventName)
        }
    }
}

function getListener(target, type) {
    // terminate recursion if parent is `null`
    if (target === null || typeof target === "undefined") {
        return null
    }

    var events = EvStore(target)
    // fetch list of handler fns for this event
    var handler = events[type]
    var allHandler = events.event

    if (!handler && !allHandler) {
        return getListener(target.parentNode, type)
    }

    var handlers = [].concat(handler || [], allHandler || [])
    return new Listener(target, handlers)
}

function callListeners(handlers, ev) {
    handlers.forEach(function (handler) {
        if (typeof handler === "function") {
            handler(ev)
        } else if (typeof handler.handleEvent === "function") {
            handler.handleEvent(ev)
        } else if (handler.type === "dom-delegator-handle") {
            HANDLER_STORE(handler).func(ev)
        } else {
            throw new Error("dom-delegator: unknown handler " +
                "found: " + JSON.stringify(handlers));
        }
    })
}

function Listener(target, handlers) {
    this.currentTarget = target
    this.handlers = handlers
}

function Handle() {
    this.type = "dom-delegator-handle"
}

},{"./add-event.js":5,"./proxy-event.js":17,"./remove-event.js":18,"ev-store":9,"global/document":12,"weakmap-shim/create-store":15}],7:[function(require,module,exports){
var Individual = require("individual")
var cuid = require("cuid")
var globalDocument = require("global/document")

var DOMDelegator = require("./dom-delegator.js")

var versionKey = "13"
var cacheKey = "__DOM_DELEGATOR_CACHE@" + versionKey
var cacheTokenKey = "__DOM_DELEGATOR_CACHE_TOKEN@" + versionKey
var delegatorCache = Individual(cacheKey, {
    delegators: {}
})
var commonEvents = [
    "blur", "change", "click",  "contextmenu", "dblclick",
    "error","focus", "focusin", "focusout", "input", "keydown",
    "keypress", "keyup", "load", "mousedown", "mouseup",
    "resize", "select", "submit", "touchcancel",
    "touchend", "touchstart", "unload"
]

/*  Delegator is a thin wrapper around a singleton `DOMDelegator`
        instance.

    Only one DOMDelegator should exist because we do not want
        duplicate event listeners bound to the DOM.

    `Delegator` will also `listenTo()` all events unless
        every caller opts out of it
*/
module.exports = Delegator

function Delegator(opts) {
    opts = opts || {}
    var document = opts.document || globalDocument

    var cacheKey = document[cacheTokenKey]

    if (!cacheKey) {
        cacheKey =
            document[cacheTokenKey] = cuid()
    }

    var delegator = delegatorCache.delegators[cacheKey]

    if (!delegator) {
        delegator = delegatorCache.delegators[cacheKey] =
            new DOMDelegator(document)
    }

    if (opts.defaultEvents !== false) {
        for (var i = 0; i < commonEvents.length; i++) {
            delegator.listenTo(commonEvents[i])
        }
    }

    return delegator
}

Delegator.allocateHandle = DOMDelegator.allocateHandle;
Delegator.transformHandle = DOMDelegator.transformHandle;

},{"./dom-delegator.js":6,"cuid":8,"global/document":12,"individual":13}],8:[function(require,module,exports){
/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 *
 * Copyright (c) Eric Elliott 2012
 * MIT License
 */

/*global window, navigator, document, require, process, module */
(function (app) {
  'use strict';
  var namespace = 'cuid',
    c = 0,
    blockSize = 4,
    base = 36,
    discreteValues = Math.pow(base, blockSize),

    pad = function pad(num, size) {
      var s = "000000000" + num;
      return s.substr(s.length-size);
    },

    randomBlock = function randomBlock() {
      return pad((Math.random() *
            discreteValues << 0)
            .toString(base), blockSize);
    },

    safeCounter = function () {
      c = (c < discreteValues) ? c : 0;
      c++; // this is not subliminal
      return c - 1;
    },

    api = function cuid() {
      // Starting with a lowercase letter makes
      // it HTML element ID friendly.
      var letter = 'c', // hard-coded allows for sequential access

        // timestamp
        // warning: this exposes the exact date and time
        // that the uid was created.
        timestamp = (new Date().getTime()).toString(base),

        // Prevent same-machine collisions.
        counter,

        // A few chars to generate distinct ids for different
        // clients (so different computers are far less
        // likely to generate the same id)
        fingerprint = api.fingerprint(),

        // Grab some more chars from Math.random()
        random = randomBlock() + randomBlock();

        counter = pad(safeCounter().toString(base), blockSize);

      return  (letter + timestamp + counter + fingerprint + random);
    };

  api.slug = function slug() {
    var date = new Date().getTime().toString(36),
      counter,
      print = api.fingerprint().slice(0,1) +
        api.fingerprint().slice(-1),
      random = randomBlock().slice(-2);

      counter = safeCounter().toString(36).slice(-4);

    return date.slice(-2) +
      counter + print + random;
  };

  api.globalCount = function globalCount() {
    // We want to cache the results of this
    var cache = (function calc() {
        var i,
          count = 0;

        for (i in window) {
          count++;
        }

        return count;
      }());

    api.globalCount = function () { return cache; };
    return cache;
  };

  api.fingerprint = function browserPrint() {
    return pad((navigator.mimeTypes.length +
      navigator.userAgent.length).toString(36) +
      api.globalCount().toString(36), 4);
  };

  // don't change anything from here down.
  if (app.register) {
    app.register(namespace, api);
  } else if (typeof module !== 'undefined') {
    module.exports = api;
  } else {
    app[namespace] = api;
  }

}(this.applitude || this));

},{}],9:[function(require,module,exports){
'use strict';

var OneVersionConstraint = require('individual/one-version');

var MY_VERSION = '7';
OneVersionConstraint('ev-store', MY_VERSION);

var hashKey = '__EV_STORE_KEY@' + MY_VERSION;

module.exports = EvStore;

function EvStore(elem) {
    var hash = elem[hashKey];

    if (!hash) {
        hash = elem[hashKey] = {};
    }

    return hash;
}

},{"individual/one-version":11}],10:[function(require,module,exports){
(function (global){
'use strict';

/*global window, global*/

var root = typeof window !== 'undefined' ?
    window : typeof global !== 'undefined' ?
    global : {};

module.exports = Individual;

function Individual(key, value) {
    if (key in root) {
        return root[key];
    }

    root[key] = value;

    return value;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],11:[function(require,module,exports){
'use strict';

var Individual = require('./index.js');

module.exports = OneVersion;

function OneVersion(moduleName, version, defaultValue) {
    var key = '__INDIVIDUAL_ONE_VERSION_' + moduleName;
    var enforceKey = key + '_ENFORCE_SINGLETON';

    var versionValue = Individual(enforceKey, version);

    if (versionValue !== version) {
        throw new Error('Can only have one copy of ' +
            moduleName + '.\n' +
            'You already have version ' + versionValue +
            ' installed.\n' +
            'This means you cannot install version ' + version);
    }

    return Individual(key, defaultValue);
}

},{"./index.js":10}],12:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"min-document":1}],13:[function(require,module,exports){
(function (global){
var root = typeof window !== 'undefined' ?
    window : typeof global !== 'undefined' ?
    global : {};

module.exports = Individual

function Individual(key, value) {
    if (root[key]) {
        return root[key]
    }

    Object.defineProperty(root, key, {
        value: value
        , configurable: true
    })

    return value
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],14:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],15:[function(require,module,exports){
var hiddenStore = require('./hidden-store.js');

module.exports = createStore;

function createStore() {
    var key = {};

    return function (obj) {
        if ((typeof obj !== 'object' || obj === null) &&
            typeof obj !== 'function'
        ) {
            throw new Error('Weakmap-shim: Key must be object')
        }

        var store = obj.valueOf(key);
        return store && store.identity === key ?
            store : hiddenStore(obj, key);
    };
}

},{"./hidden-store.js":16}],16:[function(require,module,exports){
module.exports = hiddenStore;

function hiddenStore(obj, key) {
    var store = { identity: key };
    var valueOf = obj.valueOf;

    Object.defineProperty(obj, "valueOf", {
        value: function (value) {
            return value !== key ?
                valueOf.apply(this, arguments) : store;
        },
        writable: true
    });

    return store;
}

},{}],17:[function(require,module,exports){
var inherits = require("inherits")

var ALL_PROPS = [
    "altKey", "bubbles", "cancelable", "ctrlKey",
    "eventPhase", "metaKey", "relatedTarget", "shiftKey",
    "target", "timeStamp", "type", "view", "which"
]
var KEY_PROPS = ["char", "charCode", "key", "keyCode"]
var MOUSE_PROPS = [
    "button", "buttons", "clientX", "clientY", "layerX",
    "layerY", "offsetX", "offsetY", "pageX", "pageY",
    "screenX", "screenY", "toElement"
]

var rkeyEvent = /^key|input/
var rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/

module.exports = ProxyEvent

function ProxyEvent(ev) {
    if (!(this instanceof ProxyEvent)) {
        return new ProxyEvent(ev)
    }

    if (rkeyEvent.test(ev.type)) {
        return new KeyEvent(ev)
    } else if (rmouseEvent.test(ev.type)) {
        return new MouseEvent(ev)
    }

    for (var i = 0; i < ALL_PROPS.length; i++) {
        var propKey = ALL_PROPS[i]
        this[propKey] = ev[propKey]
    }

    this._rawEvent = ev
    this._bubbles = false;
}

ProxyEvent.prototype.preventDefault = function () {
    this._rawEvent.preventDefault()
}

ProxyEvent.prototype.startPropagation = function () {
    this._bubbles = true;
}

function MouseEvent(ev) {
    for (var i = 0; i < ALL_PROPS.length; i++) {
        var propKey = ALL_PROPS[i]
        this[propKey] = ev[propKey]
    }

    for (var j = 0; j < MOUSE_PROPS.length; j++) {
        var mousePropKey = MOUSE_PROPS[j]
        this[mousePropKey] = ev[mousePropKey]
    }

    this._rawEvent = ev
}

inherits(MouseEvent, ProxyEvent)

function KeyEvent(ev) {
    for (var i = 0; i < ALL_PROPS.length; i++) {
        var propKey = ALL_PROPS[i]
        this[propKey] = ev[propKey]
    }

    for (var j = 0; j < KEY_PROPS.length; j++) {
        var keyPropKey = KEY_PROPS[j]
        this[keyPropKey] = ev[keyPropKey]
    }

    this._rawEvent = ev
}

inherits(KeyEvent, ProxyEvent)

},{"inherits":14}],18:[function(require,module,exports){
var EvStore = require("ev-store")

module.exports = removeEvent

function removeEvent(target, type, handler) {
    var events = EvStore(target)
    var event = events[type]

    if (!event) {
        return
    } else if (Array.isArray(event)) {
        var index = event.indexOf(handler)
        if (index !== -1) {
            event.splice(index, 1)
        }
    } else if (event === handler) {
        events[type] = null
    }
}

},{"ev-store":9}],19:[function(require,module,exports){
module.exports = Event

function Event() {
    var listeners = []

    return { broadcast: broadcast, listen: event }

    function broadcast(value) {
        for (var i = 0; i < listeners.length; i++) {
            listeners[i](value)
        }
    }

    function event(listener) {
        listeners.push(listener)

        return removeListener

        function removeListener() {
            var index = listeners.indexOf(listener)
            if (index !== -1) {
                listeners.splice(index, 1)
            }
        }
    }
}

},{}],20:[function(require,module,exports){
var event = require("./single.js")

module.exports = multiple

function multiple(names) {
    return names.reduce(function (acc, name) {
        acc[name] = event()
        return acc
    }, {})
}

},{"./single.js":21}],21:[function(require,module,exports){
var Event = require('./event.js')

module.exports = Single

function Single() {
    var tuple = Event()

    return function event(value) {
        if (typeof value === "function") {
            return tuple.listen(value)
        } else {
            return tuple.broadcast(value)
        }
    }
}

},{"./event.js":19}],22:[function(require,module,exports){
var raf = require("raf")
var TypedError = require("error/typed")

var InvalidUpdateInRender = TypedError({
    type: "main-loop.invalid.update.in-render",
    message: "main-loop: Unexpected update occurred in loop.\n" +
        "We are currently rendering a view, " +
            "you can't change state right now.\n" +
        "The diff is: {stringDiff}.\n" +
        "SUGGESTED FIX: find the state mutation in your view " +
            "or rendering function and remove it.\n" +
        "The view should not have any side effects.\n",
    diff: null,
    stringDiff: null
})

module.exports = main

function main(initialState, view, opts) {
    opts = opts || {}

    var currentState = initialState
    var create = opts.create
    var diff = opts.diff
    var patch = opts.patch
    var redrawScheduled = false

    var tree = opts.initialTree || view(currentState)
    var target = opts.target || create(tree, opts)
    var inRenderingTransaction = false

    currentState = null

    var loop = {
        state: initialState,
        target: target,
        update: update
    }
    return loop

    function update(state) {
        if (inRenderingTransaction) {
            throw InvalidUpdateInRender({
                diff: state._diff,
                stringDiff: JSON.stringify(state._diff)
            })
        }

        if (currentState === null && !redrawScheduled) {
            redrawScheduled = true
            raf(redraw)
        }

        currentState = state
        loop.state = state
    }

    function redraw() {
        redrawScheduled = false
        if (currentState === null) {
            return
        }

        inRenderingTransaction = true
        var newTree = view(currentState)

        if (opts.createOnly) {
            inRenderingTransaction = false
            create(newTree, opts)
        } else {
            var patches = diff(tree, newTree, opts)
            inRenderingTransaction = false
            target = patch(target, patches, opts)
        }

        tree = newTree
        currentState = null
    }
}

},{"error/typed":25,"raf":26}],23:[function(require,module,exports){
module.exports = function(obj) {
    if (typeof obj === 'string') return camelCase(obj);
    return walk(obj);
};

function walk (obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (isDate(obj) || isRegex(obj)) return obj;
    if (isArray(obj)) return map(obj, walk);
    return reduce(objectKeys(obj), function (acc, key) {
        var camel = camelCase(key);
        acc[camel] = walk(obj[key]);
        return acc;
    }, {});
}

function camelCase(str) {
    return str.replace(/[_.-](\w|$)/g, function (_,x) {
        return x.toUpperCase();
    });
}

var isArray = Array.isArray || function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};

var isDate = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Date]';
};

var isRegex = function (obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

var has = Object.prototype.hasOwnProperty;
var objectKeys = Object.keys || function (obj) {
    var keys = [];
    for (var key in obj) {
        if (has.call(obj, key)) keys.push(key);
    }
    return keys;
};

function map (xs, f) {
    if (xs.map) return xs.map(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        res.push(f(xs[i], i));
    }
    return res;
}

function reduce (xs, f, acc) {
    if (xs.reduce) return xs.reduce(f, acc);
    for (var i = 0; i < xs.length; i++) {
        acc = f(acc, xs[i], i);
    }
    return acc;
}

},{}],24:[function(require,module,exports){
var nargs = /\{([0-9a-zA-Z]+)\}/g
var slice = Array.prototype.slice

module.exports = template

function template(string) {
    var args

    if (arguments.length === 2 && typeof arguments[1] === "object") {
        args = arguments[1]
    } else {
        args = slice.call(arguments, 1)
    }

    if (!args || !args.hasOwnProperty) {
        args = {}
    }

    return string.replace(nargs, function replaceArg(match, i, index) {
        var result

        if (string[index - 1] === "{" &&
            string[index + match.length] === "}") {
            return i
        } else {
            result = args.hasOwnProperty(i) ? args[i] : null
            if (result === null || result === undefined) {
                return ""
            }

            return result
        }
    })
}

},{}],25:[function(require,module,exports){
var camelize = require("camelize")
var template = require("string-template")
var extend = require("xtend/mutable")

module.exports = TypedError

function TypedError(args) {
    if (!args) {
        throw new Error("args is required");
    }
    if (!args.type) {
        throw new Error("args.type is required");
    }
    if (!args.message) {
        throw new Error("args.message is required");
    }

    var message = args.message

    if (args.type && !args.name) {
        var errorName = camelize(args.type) + "Error"
        args.name = errorName[0].toUpperCase() + errorName.substr(1)
    }

    extend(createError, args);
    createError._name = args.name;

    return createError;

    function createError(opts) {
        var result = new Error()

        Object.defineProperty(result, "type", {
            value: result.type,
            enumerable: true,
            writable: true,
            configurable: true
        })

        var options = extend({}, args, opts)

        extend(result, options)
        result.message = template(message, options)

        return result
    }
}


},{"camelize":23,"string-template":24,"xtend/mutable":93}],26:[function(require,module,exports){
var now = require('performance-now')
  , global = typeof window === 'undefined' ? {} : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = global['request' + suffix]
  , caf = global['cancel' + suffix] || global['cancelRequest' + suffix]
  , isNative = true

for(var i = 0; i < vendors.length && !raf; i++) {
  raf = global[vendors[i] + 'Request' + suffix]
  caf = global[vendors[i] + 'Cancel' + suffix]
      || global[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  isNative = false

  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  if(!isNative) {
    return raf.call(global, fn)
  }
  return raf.call(global, function() {
    try{
      fn.apply(this, arguments)
    } catch(e) {
      setTimeout(function() { throw e }, 0)
    }
  })
}
module.exports.cancel = function() {
  caf.apply(global, arguments)
}

},{"performance-now":27}],27:[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.6.3
(function() {
  var getNanoSeconds, hrtime, loadTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

/*

*/

}).call(this,require('_process'))

},{"_process":2}],28:[function(require,module,exports){
var setNonEnumerable = require("./lib/set-non-enumerable.js");

module.exports = addListener

function addListener(observArray, observ) {
    var list = observArray._list

    return observ(function (value) {
        var valueList =  observArray().slice()
        var index = list.indexOf(observ)

        // This code path should never hit. If this happens
        // there's a bug in the cleanup code
        if (index === -1) {
            var message = "observ-array: Unremoved observ listener"
            var err = new Error(message)
            err.list = list
            err.index = index
            err.observ = observ
            throw err
        }

        valueList.splice(index, 1, value)
        setNonEnumerable(valueList, "_diff", [ [index, 1, value] ])

        observArray._observSet(valueList)
    })
}

},{"./lib/set-non-enumerable.js":34}],29:[function(require,module,exports){
var addListener = require('./add-listener.js')

module.exports = applyPatch

function applyPatch (valueList, args) {
    var obs = this
    var valueArgs = args.map(unpack)

    valueList.splice.apply(valueList, valueArgs)
    obs._list.splice.apply(obs._list, args)

    var extraRemoveListeners = args.slice(2).map(function (observ) {
        return typeof observ === "function" ?
            addListener(obs, observ) :
            null
    })

    extraRemoveListeners.unshift(args[0], args[1])
    var removedListeners = obs._removeListeners.splice
        .apply(obs._removeListeners, extraRemoveListeners)

    removedListeners.forEach(function (removeObservListener) {
        if (removeObservListener) {
            removeObservListener()
        }
    })

    return valueArgs
}

function unpack(value, index){
    if (index === 0 || index === 1) {
        return value
    }
    return typeof value === "function" ? value() : value
}

},{"./add-listener.js":28}],30:[function(require,module,exports){
var ObservArray = require("./index.js")

var slice = Array.prototype.slice

var ARRAY_METHODS = [
    "concat", "slice", "every", "filter", "forEach", "indexOf",
    "join", "lastIndexOf", "map", "reduce", "reduceRight",
    "some", "toString", "toLocaleString"
]

var methods = ARRAY_METHODS.map(function (name) {
    return [name, function () {
        var res = this._list[name].apply(this._list, arguments)

        if (res && Array.isArray(res)) {
            res = ObservArray(res)
        }

        return res
    }]
})

module.exports = ArrayMethods

function ArrayMethods(obs) {
    obs.push = observArrayPush
    obs.pop = observArrayPop
    obs.shift = observArrayShift
    obs.unshift = observArrayUnshift
    obs.reverse = require("./array-reverse.js")
    obs.sort = require("./array-sort.js")

    methods.forEach(function (tuple) {
        obs[tuple[0]] = tuple[1]
    })
    return obs
}



function observArrayPush() {
    var args = slice.call(arguments)
    args.unshift(this._list.length, 0)
    this.splice.apply(this, args)

    return this._list.length
}
function observArrayPop() {
    return this.splice(this._list.length - 1, 1)[0]
}
function observArrayShift() {
    return this.splice(0, 1)[0]
}
function observArrayUnshift() {
    var args = slice.call(arguments)
    args.unshift(0, 0)
    this.splice.apply(this, args)

    return this._list.length
}


function notImplemented() {
    throw new Error("Pull request welcome")
}

},{"./array-reverse.js":31,"./array-sort.js":32,"./index.js":33}],31:[function(require,module,exports){
var applyPatch = require("./apply-patch.js")
var setNonEnumerable = require('./lib/set-non-enumerable.js')

module.exports = reverse

function reverse() {
    var obs = this
    var changes = fakeDiff(obs._list.slice().reverse())
    var valueList = obs().slice().reverse()

    var valueChanges = changes.map(applyPatch.bind(obs, valueList))

    setNonEnumerable(valueList, "_diff", valueChanges)

    obs._observSet(valueList)
    return changes
}

function fakeDiff(arr) {
    var _diff
    var len = arr.length

    if(len % 2) {
        var midPoint = (len -1) / 2
        var a = [0, midPoint].concat(arr.slice(0, midPoint))
        var b = [midPoint +1, midPoint].concat(arr.slice(midPoint +1, len))
        var _diff = [a, b]
    } else {
        _diff = [ [0, len].concat(arr) ]
    }

    return _diff
}

},{"./apply-patch.js":29,"./lib/set-non-enumerable.js":34}],32:[function(require,module,exports){
var applyPatch = require("./apply-patch.js")
var setNonEnumerable = require("./lib/set-non-enumerable.js")

module.exports = sort

function sort(compare) {
    var obs = this
    var list = obs._list.slice()

    var unpacked = unpack(list)

    var sorted = unpacked
            .map(function(it) { return it.val })
            .sort(compare)

    var packed = repack(sorted, unpacked)

    //fake diff - for perf
    //adiff on 10k items === ~3200ms
    //fake on 10k items === ~110ms
    var changes = [ [ 0, packed.length ].concat(packed) ]

    var valueChanges = changes.map(applyPatch.bind(obs, sorted))

    setNonEnumerable(sorted, "_diff", valueChanges)

    obs._observSet(sorted)
    return changes
}

function unpack(list) {
    var unpacked = []
    for(var i = 0; i < list.length; i++) {
        unpacked.push({
            val: ("function" == typeof list[i]) ? list[i]() : list[i],
            obj: list[i]
        })
    }
    return unpacked
}

function repack(sorted, unpacked) {
    var packed = []

    while(sorted.length) {
        var s = sorted.shift()
        var indx = indexOf(s, unpacked)
        if(~indx) packed.push(unpacked.splice(indx, 1)[0].obj)
    }

    return packed
}

function indexOf(n, h) {
    for(var i = 0; i < h.length; i++) {
        if(n === h[i].val) return i
    }
    return -1
}

},{"./apply-patch.js":29,"./lib/set-non-enumerable.js":34}],33:[function(require,module,exports){
var Observ = require("observ")

// circular dep between ArrayMethods & this file
module.exports = ObservArray

var splice = require("./splice.js")
var put = require("./put.js")
var set = require("./set.js")
var transaction = require("./transaction.js")
var ArrayMethods = require("./array-methods.js")
var addListener = require("./add-listener.js")


/*  ObservArray := (Array<T>) => Observ<
        Array<T> & { _diff: Array }
    > & {
        splice: (index: Number, amount: Number, rest...: T) =>
            Array<T>,
        push: (values...: T) => Number,
        filter: (lambda: Function, thisValue: Any) => Array<T>,
        indexOf: (item: T, fromIndex: Number) => Number
    }

    Fix to make it more like ObservHash.

    I.e. you write observables into it.
        reading methods take plain JS objects to read
        and the value of the array is always an array of plain
        objsect.

        The observ array instance itself would have indexed
        properties that are the observables
*/
function ObservArray(initialList) {
    // list is the internal mutable list observ instances that
    // all methods on `obs` dispatch to.
    var list = initialList
    var initialState = []

    // copy state out of initialList into initialState
    list.forEach(function (observ, index) {
        initialState[index] = typeof observ === "function" ?
            observ() : observ
    })

    var obs = Observ(initialState)
    obs.splice = splice

    // override set and store original for later use
    obs._observSet = obs.set
    obs.set = set

    obs.get = get
    obs.getLength = getLength
    obs.put = put
    obs.transaction = transaction

    // you better not mutate this list directly
    // this is the list of observs instances
    obs._list = list

    var removeListeners = list.map(function (observ) {
        return typeof observ === "function" ?
            addListener(obs, observ) :
            null
    });
    // this is a list of removal functions that must be called
    // when observ instances are removed from `obs.list`
    // not calling this means we do not GC our observ change
    // listeners. Which causes rage bugs
    obs._removeListeners = removeListeners

    obs._type = "observ-array"
    obs._version = "3"

    return ArrayMethods(obs, list)
}

function get(index) {
    return this._list[index]
}

function getLength() {
    return this._list.length
}

},{"./add-listener.js":28,"./array-methods.js":30,"./put.js":36,"./set.js":37,"./splice.js":38,"./transaction.js":39,"observ":45}],34:[function(require,module,exports){
module.exports = setNonEnumerable;

function setNonEnumerable(object, key, value) {
    Object.defineProperty(object, key, {
        value: value,
        writable: true,
        configurable: true,
        enumerable: false
    });
}

},{}],35:[function(require,module,exports){
function head (a) {
  return a[0]
}

function last (a) {
  return a[a.length - 1]
}

function tail(a) {
  return a.slice(1)
}

function retreat (e) {
  return e.pop()
}

function hasLength (e) {
  return e.length
}

function any(ary, test) {
  for(var i=0;i<ary.length;i++)
    if(test(ary[i]))
      return true
  return false
}

function score (a) {
  return a.reduce(function (s, a) {
      return s + a.length + a[1] + 1
  }, 0)
}

function best (a, b) {
  return score(a) <= score(b) ? a : b
}


var _rules // set at the bottom  

// note, naive implementation. will break on circular objects.

function _equal(a, b) {
  if(a && !b) return false
  if(Array.isArray(a))
    if(a.length != b.length) return false
  if(a && 'object' == typeof a) {
    for(var i in a)
      if(!_equal(a[i], b[i])) return false
    for(var i in b)
      if(!_equal(a[i], b[i])) return false
    return true
  }
  return a == b
}

function getArgs(args) {
  return args.length == 1 ? args[0] : [].slice.call(args)
}

// return the index of the element not like the others, or -1
function oddElement(ary, cmp) {
  var c
  function guess(a) {
    var odd = -1
    c = 0
    for (var i = a; i < ary.length; i ++) {
      if(!cmp(ary[a], ary[i])) {
        odd = i, c++
      }
    }
    return c > 1 ? -1 : odd
  }
  //assume that it is the first element.
  var g = guess(0)
  if(-1 != g) return g
  //0 was the odd one, then all the other elements are equal
  //else there more than one different element
  guess(1)
  return c == 0 ? 0 : -1
}
var exports = module.exports = function (deps, exports) {
  var equal = (deps && deps.equal) || _equal
  exports = exports || {} 
  exports.lcs = 
  function lcs() {
    var cache = {}
    var args = getArgs(arguments)
    var a = args[0], b = args[1]

    function key (a,b){
      return a.length + ':' + b.length
    }

    //find length that matches at the head

    if(args.length > 2) {
      //if called with multiple sequences
      //recurse, since lcs(a, b, c, d) == lcs(lcs(a,b), lcs(c,d))
      args.push(lcs(args.shift(), args.shift()))
      return lcs(args)
    }
    
    //this would be improved by truncating input first
    //and not returning an lcs as an intermediate step.
    //untill that is a performance problem.

    var start = 0, end = 0
    for(var i = 0; i < a.length && i < b.length 
      && equal(a[i], b[i])
      ; i ++
    )
      start = i + 1

    if(a.length === start)
      return a.slice()

    for(var i = 0;  i < a.length - start && i < b.length - start
      && equal(a[a.length - 1 - i], b[b.length - 1 - i])
      ; i ++
    )
      end = i

    function recurse (a, b) {
      if(!a.length || !b.length) return []
      //avoid exponential time by caching the results
      if(cache[key(a, b)]) return cache[key(a, b)]

      if(equal(a[0], b[0]))
        return [head(a)].concat(recurse(tail(a), tail(b)))
      else { 
        var _a = recurse(tail(a), b)
        var _b = recurse(a, tail(b))
        return cache[key(a,b)] = _a.length > _b.length ? _a : _b  
      }
    }
    
    var middleA = a.slice(start, a.length - end)
    var middleB = b.slice(start, b.length - end)

    return (
      a.slice(0, start).concat(
        recurse(middleA, middleB)
      ).concat(a.slice(a.length - end))
    )
  }

  // given n sequences, calc the lcs, and then chunk strings into stable and unstable sections.
  // unstable chunks are passed to build
  exports.chunk =
  function (q, build) {
    var q = q.map(function (e) { return e.slice() })
    var lcs = exports.lcs.apply(null, q)
    var all = [lcs].concat(q)

    function matchLcs (e) {
      if(e.length && !lcs.length || !e.length && lcs.length)
        return false //incase the last item is null
      return equal(last(e), last(lcs)) || ((e.length + lcs.length) === 0)
    }

    while(any(q, hasLength)) {
      //if each element is at the lcs then this chunk is stable.
      while(q.every(matchLcs) && q.every(hasLength))
        all.forEach(retreat)
      //collect the changes in each array upto the next match with the lcs
      var c = false
      var unstable = q.map(function (e) {
        var change = []
        while(!matchLcs(e)) {
          change.unshift(retreat(e))
          c = true
        }
        return change
      })
      if(c) build(q[0].length, unstable)
    }
  }

  //calculate a diff this is only updates
  exports.optimisticDiff =
  function (a, b) {
    var M = Math.max(a.length, b.length)
    var m = Math.min(a.length, b.length)
    var patch = []
    for(var i = 0; i < M; i++)
      if(a[i] !== b[i]) {
        var cur = [i,0], deletes = 0
        while(a[i] !== b[i] && i < m) {
          cur[1] = ++deletes
          cur.push(b[i++])
        }
        //the rest are deletes or inserts
        if(i >= m) {
          //the rest are deletes
          if(a.length > b.length)
            cur[1] += a.length - b.length
          //the rest are inserts
          else if(a.length < b.length)
            cur = cur.concat(b.slice(a.length))
        }
        patch.push(cur)
      }

    return patch
  }

  exports.diff =
  function (a, b) {
    var optimistic = exports.optimisticDiff(a, b)
    var changes = []
    exports.chunk([a, b], function (index, unstable) {
      var del = unstable.shift().length
      var insert = unstable.shift()
      changes.push([index, del].concat(insert))
    })
    return best(optimistic, changes)
  }

  exports.patch = function (a, changes, mutate) {
    if(mutate !== true) a = a.slice(a)//copy a
    changes.forEach(function (change) {
      [].splice.apply(a, change)
    })
    return a
  }

  // http://en.wikipedia.org/wiki/Concestor
  // me, concestor, you...
  exports.merge = function () {
    var args = getArgs(arguments)
    var patch = exports.diff3(args)
    return exports.patch(args[0], patch)
  }

  exports.diff3 = function () {
    var args = getArgs(arguments)
    var r = []
    exports.chunk(args, function (index, unstable) {
      var mine = unstable[0]
      var insert = resolve(unstable)
      if(equal(mine, insert)) return 
      r.push([index, mine.length].concat(insert)) 
    })
    return r
  }
  exports.oddOneOut =
    function oddOneOut (changes) {
      changes = changes.slice()
      //put the concestor first
      changes.unshift(changes.splice(1,1)[0])
      var i = oddElement(changes, equal)
      if(i == 0) // concestor was different, 'false conflict'
        return changes[1]
      if (~i)
        return changes[i] 
    }
  exports.insertMergeOverDelete = 
    //i've implemented this as a seperate rule,
    //because I had second thoughts about this.
    function insertMergeOverDelete (changes) {
      changes = changes.slice()
      changes.splice(1,1)// remove concestor
      
      //if there is only one non empty change thats okay.
      //else full confilct
      for (var i = 0, nonempty; i < changes.length; i++)
        if(changes[i].length) 
          if(!nonempty) nonempty = changes[i]
          else return // full conflict
      return nonempty
    }

  var rules = (deps && deps.rules) || [exports.oddOneOut, exports.insertMergeOverDelete]

  function resolve (changes) {
    var l = rules.length
    for (var i in rules) { // first
      
      var c = rules[i] && rules[i](changes)
      if(c) return c
    }
    changes.splice(1,1) // remove concestor
    //returning the conflicts as an object is a really bad idea,
    // because == will not detect they are the same. and conflicts build.
    // better to use
    // '<<<<<<<<<<<<<'
    // of course, i wrote this before i started on snob, so i didn't know that then.
    /*var conflict = ['>>>>>>>>>>>>>>>>']
    while(changes.length)
      conflict = conflict.concat(changes.shift()).concat('============')
    conflict.pop()
    conflict.push          ('<<<<<<<<<<<<<<<')
    changes.unshift       ('>>>>>>>>>>>>>>>')
    return conflict*/
    //nah, better is just to use an equal can handle objects
    return {'?': changes}
  }
  return exports
}
exports(null, exports)

},{}],36:[function(require,module,exports){
var addListener = require("./add-listener.js")
var setNonEnumerable = require("./lib/set-non-enumerable.js");

module.exports = put

// `obs.put` is a mutable implementation of `array[index] = value`
// that mutates both `list` and the internal `valueList` that
// is the current value of `obs` itself
function put(index, value) {
    var obs = this
    var valueList = obs().slice()

    var originalLength = valueList.length
    valueList[index] = typeof value === "function" ? value() : value

    obs._list[index] = value

    // remove past value listener if was observ
    var removeListener = obs._removeListeners[index]
    if (removeListener){
        removeListener()
    }

    // add listener to value if observ
    obs._removeListeners[index] = typeof value === "function" ?
        addListener(obs, value) :
        null

    // fake splice diff
    var valueArgs = index < originalLength ? 
        [index, 1, valueList[index]] :
        [index, 0, valueList[index]]

    setNonEnumerable(valueList, "_diff", [valueArgs])

    obs._observSet(valueList)
    return value
}
},{"./add-listener.js":28,"./lib/set-non-enumerable.js":34}],37:[function(require,module,exports){
var applyPatch = require("./apply-patch.js")
var setNonEnumerable = require("./lib/set-non-enumerable.js")
var adiff = require("adiff")

module.exports = set

function set(rawList) {
    if (!Array.isArray(rawList)) rawList = []

    var obs = this
    var changes = adiff.diff(obs._list, rawList)
    var valueList = obs().slice()

    var valueChanges = changes.map(applyPatch.bind(obs, valueList))

    setNonEnumerable(valueList, "_diff", valueChanges)

    obs._observSet(valueList)
    return changes
}

},{"./apply-patch.js":29,"./lib/set-non-enumerable.js":34,"adiff":35}],38:[function(require,module,exports){
var slice = Array.prototype.slice

var addListener = require("./add-listener.js")
var setNonEnumerable = require("./lib/set-non-enumerable.js");

module.exports = splice

// `obs.splice` is a mutable implementation of `splice()`
// that mutates both `list` and the internal `valueList` that
// is the current value of `obs` itself
function splice(index, amount) {
    var obs = this
    var args = slice.call(arguments, 0)
    var valueList = obs().slice()

    // generate a list of args to mutate the internal
    // list of only obs
    var valueArgs = args.map(function (value, index) {
        if (index === 0 || index === 1) {
            return value
        }

        // must unpack observables that we are adding
        return typeof value === "function" ? value() : value
    })

    valueList.splice.apply(valueList, valueArgs)
    // we remove the observs that we remove
    var removed = obs._list.splice.apply(obs._list, args)

    var extraRemoveListeners = args.slice(2).map(function (observ) {
        return typeof observ === "function" ?
            addListener(obs, observ) :
            null
    })
    extraRemoveListeners.unshift(args[0], args[1])
    var removedListeners = obs._removeListeners.splice
        .apply(obs._removeListeners, extraRemoveListeners)

    removedListeners.forEach(function (removeObservListener) {
        if (removeObservListener) {
            removeObservListener()
        }
    })

    setNonEnumerable(valueList, "_diff", [valueArgs])

    obs._observSet(valueList)
    return removed
}

},{"./add-listener.js":28,"./lib/set-non-enumerable.js":34}],39:[function(require,module,exports){
module.exports = transaction

function transaction (func) {
    var obs = this
    var rawList = obs._list.slice()

    if (func(rawList) !== false){ // allow cancel
        return obs.set(rawList)
    }

}
},{}],40:[function(require,module,exports){
var Observ = require("observ")
var extend = require("xtend")

var blackList = ["name", "_diff", "_type", "_version"]
var blackListReasons = {
    "name": "Clashes with `Function.prototype.name`.\n",
    "_diff": "_diff is reserved key of observ-struct.\n",
    "_type": "_type is reserved key of observ-struct.\n",
    "_version": "_version is reserved key of observ-struct.\n"
}
var NO_TRANSACTION = {}

function setNonEnumerable(object, key, value) {
    Object.defineProperty(object, key, {
        value: value,
        writable: true,
        configurable: true,
        enumerable: false
    })
}

/* ObservStruct := (Object<String, Observ<T>>) => 
    Object<String, Observ<T>> &
        Observ<Object<String, T> & {
            _diff: Object<String, Any>
        }>

*/
module.exports = ObservStruct

function ObservStruct(struct) {
    var keys = Object.keys(struct)

    var initialState = {}
    var currentTransaction = NO_TRANSACTION
    var nestedTransaction = NO_TRANSACTION

    keys.forEach(function (key) {
        if (blackList.indexOf(key) !== -1) {
            throw new Error("cannot create an observ-struct " +
                "with a key named '" + key + "'.\n" +
                blackListReasons[key]);
        }

        var observ = struct[key]
        initialState[key] = typeof observ === "function" ?
            observ() : observ
    })

    var obs = Observ(initialState)
    keys.forEach(function (key) {
        var observ = struct[key]
        obs[key] = observ

        if (typeof observ === "function") {
            observ(function (value) {
                if (nestedTransaction === value) {
                    return
                }

                var state = extend(obs())
                state[key] = value
                var diff = {}
                diff[key] = value && value._diff ?
                    value._diff : value

                setNonEnumerable(state, "_diff", diff)
                currentTransaction = state
                obs.set(state)
                currentTransaction = NO_TRANSACTION
            })
        }
    })
    var _set = obs.set
    obs.set = function trackDiff(value) {
        if (currentTransaction === value) {
            return _set(value)
        }

        var newState = extend(value)
        setNonEnumerable(newState, "_diff", value)
        _set(newState)
    }

    obs(function (newState) {
        if (currentTransaction === newState) {
            return
        }

        keys.forEach(function (key) {
            var observ = struct[key]
            var newObservValue = newState[key]

            if (typeof observ === "function" &&
                observ() !== newObservValue
            ) {
                nestedTransaction = newObservValue
                observ.set(newState[key])
                nestedTransaction = NO_TRANSACTION
            }
        })
    })

    obs._type = "observ-struct"
    obs._version = "5"

    return obs
}

},{"observ":45,"xtend":41}],41:[function(require,module,exports){
module.exports = extend

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],42:[function(require,module,exports){
var Observ = require('observ')
var extend = require('xtend')

var NO_TRANSACTION = {}

module.exports = ObservVarhash

function ObservVarhash (hash, createValue) {
  createValue = createValue || function (obj) { return obj }

  var initialState = {}
  var currentTransaction = NO_TRANSACTION

  var obs = Observ(initialState)
  setNonEnumerable(obs, '_removeListeners', {})

  setNonEnumerable(obs, 'set', obs.set)
  setNonEnumerable(obs, 'get', get.bind(obs))
  setNonEnumerable(obs, 'put', put.bind(obs, createValue, currentTransaction))
  setNonEnumerable(obs, 'delete', del.bind(obs))

  for (var key in hash) {
    obs[key] = typeof hash[key] === 'function' ?
      hash[key] : createValue(hash[key], key)

    if (isFn(obs[key])) {
      obs._removeListeners[key] = obs[key](watch(obs, key, currentTransaction))
    }
  }

  var newState = {}
  for (key in hash) {
    var observ = obs[key]
    checkKey(key)
    newState[key] = isFn(observ) ? observ() : observ
  }
  obs.set(newState)

  obs(function (newState) {
    if (currentTransaction === newState) {
      return
    }

    for (var key in hash) {
      var observ = hash[key]

      if (isFn(observ) && observ() !== newState[key]) {
        observ.set(newState[key])
      }
    }
  })

  return obs
}

// access and mutate
function get (key) {
  return this[key]
}

function put (createValue, currentTransaction, key, val) {
  checkKey(key)

  if (val === undefined) {
    throw new Error('cannot varhash.put(key, undefined).')
  }

  var observ = typeof val === 'function' ?
    val : createValue(val, key)
  var state = extend(this())

  state[key] = isFn(observ) ? observ() : observ

  if (isFn(this._removeListeners[key])) {
    this._removeListeners[key]()
  }

  this._removeListeners[key] = isFn(observ) ?
    observ(watch(this, key, currentTransaction)) : null

  setNonEnumerable(state, '_diff', diff(key, state[key]))

  this[key] = observ
  this.set(state)

  return this
}

function del (key) {
  var state = extend(this())
  if (isFn(this._removeListeners[key])) {
    this._removeListeners[key]()
  }

  delete this._removeListeners[key]
  delete state[key]
  delete this[key]

  setNonEnumerable(state, '_diff', diff(key, undefined))
  this.set(state)

  return this
}

// processing
function watch (obs, key, currentTransaction) {
  return function (value) {
    var state = extend(obs())
    state[key] = value

    setNonEnumerable(state, '_diff', diff(key, value))
    currentTransaction = state
    obs.set(state)
    currentTransaction = NO_TRANSACTION
  }
}

function diff (key, value) {
  var obj = {}
  obj[key] = value && value._diff ? value._diff : value
  return obj
}

function isFn (obj) {
  return typeof obj === 'function'
}

function setNonEnumerable(object, key, value) {
  Object.defineProperty(object, key, {
    value: value,
    writable: true,
    configurable: true,
    enumerable: false
  })
}

// errors
var blacklist = {
  name: 'Clashes with `Function.prototype.name`.',
  get: 'get is a reserved key of observ-varhash method',
  put: 'put is a reserved key of observ-varhash method',
  'delete': 'delete is a reserved key of observ-varhash method',
  _diff: '_diff is a reserved key of observ-varhash method',
  _removeListeners: '_removeListeners is a reserved key of observ-varhash'
}

function checkKey (key) {
  if (!blacklist[key]) return
  throw new Error(
    'cannot create an observ-varhash with key `' + key + '`. ' + blacklist[key]
  )
}

},{"observ":45,"xtend":43}],43:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"dup":41}],44:[function(require,module,exports){
var Observable = require("./index.js")

module.exports = computed

function computed(observables, lambda) {
    var values = observables.map(function (o) {
        return o()
    })
    var result = Observable(lambda.apply(null, values))

    observables.forEach(function (o, index) {
        o(function (newValue) {
            values[index] = newValue
            result.set(lambda.apply(null, values))
        })
    })

    return result
}

},{"./index.js":45}],45:[function(require,module,exports){
module.exports = Observable

function Observable(value) {
    var listeners = []
    value = value === undefined ? null : value

    observable.set = function (v) {
        value = v
        listeners.forEach(function (f) {
            f(v)
        })
    }

    return observable

    function observable(listener) {
        if (!listener) {
            return value
        }

        listeners.push(listener)

        return function remove() {
            listeners.splice(listeners.indexOf(listener), 1)
        }
    }
}

},{}],46:[function(require,module,exports){
module.exports = watch

function watch(observable, listener) {
    var remove = observable(listener)
    listener(observable())
    return remove
}

},{}],47:[function(require,module,exports){
var Delegator = require('dom-delegator')

module.exports = BaseEvent

function BaseEvent(lambda) {
    return EventHandler;

    function EventHandler(fn, data, opts) {
        var handler = {
            fn: fn,
            data: data !== undefined ? data : {},
            opts: opts || {},
            handleEvent: handleEvent
        }

        if (fn && fn.type === 'dom-delegator-handle') {
            return Delegator.transformHandle(fn,
                handleLambda.bind(handler))
        }

        return handler;
    }

    function handleLambda(ev, broadcast) {
        if (this.opts.startPropagation && ev.startPropagation) {
            ev.startPropagation();
        }

        return lambda.call(this, ev, broadcast)
    }

    function handleEvent(ev) {
        var self = this

        if (self.opts.startPropagation && ev.startPropagation) {
            ev.startPropagation()
        }

        lambda.call(self, ev, broadcast)

        function broadcast(value) {
            if (typeof self.fn === 'function') {
                self.fn(value)
            } else {
                self.fn.write(value)
            }
        }
    }
}

},{"dom-delegator":7}],48:[function(require,module,exports){
var extend = require('xtend')
var getFormData = require('form-data-set/element')

var BaseEvent = require('./base-event.js')

var VALID_CHANGE = ['checkbox', 'file', 'select-multiple', 'select-one'];
var VALID_INPUT = ['color', 'date', 'datetime', 'datetime-local', 'email',
    'month', 'number', 'password', 'range', 'search', 'tel', 'text', 'time',
    'url', 'week'];

module.exports = BaseEvent(changeLambda);

function changeLambda(ev, broadcast) {
    var target = ev.target

    var isValid =
        (ev.type === 'input' && VALID_INPUT.indexOf(target.type) !== -1) ||
        (ev.type === 'change' && VALID_CHANGE.indexOf(target.type) !== -1);

    if (!isValid) {
        if (ev.startPropagation) {
            ev.startPropagation()
        }
        return
    }

    var value = getFormData(ev.currentTarget)
    var data = extend(value, this.data)

    broadcast(data)
}

},{"./base-event.js":47,"form-data-set/element":53,"xtend":56}],49:[function(require,module,exports){
var BaseEvent = require('./base-event.js');

module.exports = BaseEvent(clickLambda);

function clickLambda(ev, broadcast) {
    var opts = this.opts;

    if (!opts.ctrl && ev.ctrlKey) {
        return;
    }

    if (!opts.meta && ev.metaKey) {
        return;
    }

    if (!opts.rightClick && ev.which === 2) {
        return;
    }

    if (this.opts.preventDefault && ev.preventDefault) {
        ev.preventDefault();
    }

    broadcast(this.data);
}

},{"./base-event.js":47}],50:[function(require,module,exports){
var BaseEvent = require('./base-event.js');

module.exports = BaseEvent(eventLambda);

function eventLambda(ev, broadcast) {
    broadcast(this.data);
}

},{"./base-event.js":47}],51:[function(require,module,exports){
var BaseEvent = require('./base-event.js');

module.exports = BaseEvent(keyLambda);

function keyLambda(ev, broadcast) {
    var key = this.opts.key;

    if (ev.keyCode === key) {
        broadcast(this.data);
    }
}

},{"./base-event.js":47}],52:[function(require,module,exports){
var slice = Array.prototype.slice

module.exports = iterativelyWalk

function iterativelyWalk(nodes, cb) {
    if (!('length' in nodes)) {
        nodes = [nodes]
    }
    
    nodes = slice.call(nodes)

    while(nodes.length) {
        var node = nodes.shift(),
            ret = cb(node)

        if (ret) {
            return ret
        }

        if (node.childNodes && node.childNodes.length) {
            nodes = slice.call(node.childNodes).concat(nodes)
        }
    }
}

},{}],53:[function(require,module,exports){
var walk = require('dom-walk')

var FormData = require('./index.js')

module.exports = getFormData

function buildElems(rootElem) {
    var hash = {}
    if (rootElem.name) {
    	hash[rootElem.name] = rootElem
    }

    walk(rootElem, function (child) {
        if (child.name) {
            hash[child.name] = child
        }
    })


    return hash
}

function getFormData(rootElem) {
    var elements = buildElems(rootElem)

    return FormData(elements)
}

},{"./index.js":54,"dom-walk":52}],54:[function(require,module,exports){
/*jshint maxcomplexity: 10*/

module.exports = FormData

//TODO: Massive spec: http://www.whatwg.org/specs/web-apps/current-work/multipage/association-of-controls-and-forms.html#constructing-form-data-set
function FormData(elements) {
    return Object.keys(elements).reduce(function (acc, key) {
        var elem = elements[key]

        acc[key] = valueOfElement(elem)

        return acc
    }, {})
}

function valueOfElement(elem) {
    if (typeof elem === "function") {
        return elem()
    } else if (containsRadio(elem)) {
        var elems = toList(elem)
        var checked = elems.filter(function (elem) {
            return elem.checked
        })[0] || null

        return checked ? checked.value : null
    } else if (Array.isArray(elem)) {
        return elem.map(valueOfElement).filter(filterNull)
    } else if (elem.tagName === undefined && elem.nodeType === undefined) {
        return FormData(elem)
    } else if (elem.tagName === "INPUT" && isChecked(elem)) {
        if (elem.hasAttribute("value")) {
            return elem.checked ? elem.value : null
        } else {
            return elem.checked
        }
    } else if (elem.tagName === "INPUT") {
        return elem.value
    } else if (elem.tagName === "TEXTAREA") {
        return elem.value
    } else if (elem.tagName === "SELECT") {
        return elem.value
    }
}

function isChecked(elem) {
    return elem.type === "checkbox" || elem.type === "radio"
}

function containsRadio(value) {
    if (value.tagName || value.nodeType) {
        return false
    }

    var elems = toList(value)

    return elems.some(function (elem) {
        return elem.tagName === "INPUT" && elem.type === "radio"
    })
}

function toList(value) {
    if (Array.isArray(value)) {
        return value
    }

    return Object.keys(value).map(prop, value)
}

function prop(x) {
    return this[x]
}

function filterNull(val) {
    return val !== null
}

},{}],55:[function(require,module,exports){
module.exports = hasKeys

function hasKeys(source) {
    return source !== null &&
        (typeof source === "object" ||
        typeof source === "function")
}

},{}],56:[function(require,module,exports){
var hasKeys = require("./has-keys")

module.exports = extend

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        if (!hasKeys(source)) {
            continue
        }

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{"./has-keys":55}],57:[function(require,module,exports){
var extend = require('xtend')
var getFormData = require('form-data-set/element')

var BaseEvent = require('./base-event.js');

var ENTER = 13

module.exports = BaseEvent(submitLambda);

function submitLambda(ev, broadcast) {
    var target = ev.target

    var isValid =
        (ev.type === 'submit' && target.tagName === 'FORM') ||
        (ev.type === 'click' && target.tagName === 'BUTTON') ||
        (ev.type === 'click' && target.type === 'submit') ||
        (
            (target.type === 'text') &&
            (ev.keyCode === ENTER && ev.type === 'keydown')
        )

    if (!isValid) {
        if (ev.startPropagation) {
            ev.startPropagation()
        }
        return
    }

    var value = getFormData(ev.currentTarget)
    var data = extend(value, this.data)

    if (ev.preventDefault) {
        ev.preventDefault();
    }

    broadcast(data);
}

},{"./base-event.js":47,"form-data-set/element":53,"xtend":56}],58:[function(require,module,exports){
var extend = require('xtend')
var getFormData = require('form-data-set/element')

var BaseEvent = require('./base-event.js');

module.exports = BaseEvent(valueLambda);

function valueLambda(ev, broadcast) {
    var value = getFormData(ev.currentTarget)
    var data = extend(value, this.data)

    broadcast(data);
}

},{"./base-event.js":47,"form-data-set/element":53,"xtend":56}],59:[function(require,module,exports){
function Thunk(fn, args, key, eqArgs) {
    this.fn = fn;
    this.args = args;
    this.key = key;
    this.eqArgs = eqArgs;
}

Thunk.prototype.type = 'Thunk';
Thunk.prototype.render = render;
module.exports = Thunk;

function shouldUpdate(current, previous) {
    if (!current || !previous || current.fn !== previous.fn) {
        return true;
    }

    var cargs = current.args;
    var pargs = previous.args;

    return !current.eqArgs(cargs, pargs);
}

function render(previous) {
    if (shouldUpdate(this, previous)) {
        return this.fn.apply(null, this.args);
    } else {
        return previous.vnode;
    }
}

},{}],60:[function(require,module,exports){
var Partial = require('./partial');

module.exports = Partial();

},{"./partial":61}],61:[function(require,module,exports){
var shallowEq = require('./shallow-eq');
var Thunk = require('./immutable-thunk');

module.exports = createPartial;

function createPartial(eq) {
    return function partial(fn) {
        var args = copyOver(arguments, 1);
        var firstArg = args[0];
        var key;

        var eqArgs = eq || shallowEq;

        if (typeof firstArg === 'object' && firstArg !== null) {
            if ('key' in firstArg) {
                key = firstArg.key;
            } else if ('id' in firstArg) {
                key = firstArg.id;
            }
        }

        return new Thunk(fn, args, key, eqArgs);
    };
}

function copyOver(list, offset) {
    var newList = [];
    for (var i = list.length - 1; i >= offset; i--) {
        newList[i - offset] = list[i];
    }
    return newList;
}

},{"./immutable-thunk":59,"./shallow-eq":62}],62:[function(require,module,exports){
module.exports = shallowEq;

function shallowEq(currentArgs, previousArgs) {
    if (currentArgs.length === 0 && previousArgs.length === 0) {
        return true;
    }

    if (currentArgs.length !== previousArgs.length) {
        return false;
    }

    var len = currentArgs.length;

    for (var i = 0; i < len; i++) {
        if (currentArgs[i] !== previousArgs[i]) {
            return false;
        }
    }

    return true;
}

},{}],63:[function(require,module,exports){
/*!
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * ECMAScript compliant, uniform cross-browser split method
 */

/**
 * Splits a string into an array of strings using a regex or string separator. Matches of the
 * separator are not included in the result array. However, if `separator` is a regex that contains
 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
 * cross-browser.
 * @param {String} str String to split.
 * @param {RegExp|String} separator Regex or string to use for separating the string.
 * @param {Number} [limit] Maximum number of items to include in the result array.
 * @returns {Array} Array of substrings.
 * @example
 *
 * // Basic use
 * split('a b c d', ' ');
 * // -> ['a', 'b', 'c', 'd']
 *
 * // With limit
 * split('a b c d', ' ', 2);
 * // -> ['a', 'b']
 *
 * // Backreferences in result array
 * split('..word1 word2..', /([a-z]+)(\d+)/i);
 * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
 */
module.exports = (function split(undef) {

  var nativeSplit = String.prototype.split,
    compliantExecNpcg = /()??/.exec("")[1] === undef,
    // NPCG: nonparticipating capturing group
    self;

  self = function(str, separator, limit) {
    // If `separator` is not a regex, use `nativeSplit`
    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
      return nativeSplit.call(str, separator, limit);
    }
    var output = [],
      flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + // Proposed for ES6
      (separator.sticky ? "y" : ""),
      // Firefox 3+
      lastLastIndex = 0,
      // Make `global` and avoid `lastIndex` issues by working with a copy
      separator = new RegExp(separator.source, flags + "g"),
      separator2, match, lastIndex, lastLength;
    str += ""; // Type-convert
    if (!compliantExecNpcg) {
      // Doesn't need flags gy, but they don't hurt
      separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
    }
    /* Values for `limit`, per the spec:
     * If undefined: 4294967295 // Math.pow(2, 32) - 1
     * If 0, Infinity, or NaN: 0
     * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
     * If negative number: 4294967296 - Math.floor(Math.abs(limit))
     * If other: Type-convert, then use the above rules
     */
    limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
    limit >>> 0; // ToUint32(limit)
    while (match = separator.exec(str)) {
      // `separator.lastIndex` is not reliable cross-browser
      lastIndex = match.index + match[0].length;
      if (lastIndex > lastLastIndex) {
        output.push(str.slice(lastLastIndex, match.index));
        // Fix browsers whose `exec` methods don't consistently return `undefined` for
        // nonparticipating capturing groups
        if (!compliantExecNpcg && match.length > 1) {
          match[0].replace(separator2, function() {
            for (var i = 1; i < arguments.length - 2; i++) {
              if (arguments[i] === undef) {
                match[i] = undef;
              }
            }
          });
        }
        if (match.length > 1 && match.index < str.length) {
          Array.prototype.push.apply(output, match.slice(1));
        }
        lastLength = match[0].length;
        lastLastIndex = lastIndex;
        if (output.length >= limit) {
          break;
        }
      }
      if (separator.lastIndex === match.index) {
        separator.lastIndex++; // Avoid an infinite loop
      }
    }
    if (lastLastIndex === str.length) {
      if (lastLength || !separator.test("")) {
        output.push("");
      }
    } else {
      output.push(str.slice(lastLastIndex));
    }
    return output.length > limit ? output.slice(0, limit) : output;
  };

  return self;
})();

},{}],64:[function(require,module,exports){
arguments[4][9][0].apply(exports,arguments)
},{"dup":9,"individual/one-version":66}],65:[function(require,module,exports){
(function (global){
'use strict';

/*global window, global*/

var root = typeof window !== 'undefined' ?
    window : typeof global !== 'undefined' ?
    global : {};

module.exports = Individual;

function Individual(key, value) {
    if (key in root) {
        return root[key];
    }

    root[key] = value;

    return value;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],66:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"./index.js":65,"dup":11}],67:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"min-document":1}],68:[function(require,module,exports){
"use strict";

module.exports = function isObject(x) {
	return typeof x === "object" && x !== null;
};

},{}],69:[function(require,module,exports){
var nativeIsArray = Array.isArray
var toString = Object.prototype.toString

module.exports = nativeIsArray || isArray

function isArray(obj) {
    return toString.call(obj) === "[object Array]"
}

},{}],70:[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook.js")

module.exports = applyProperties

function applyProperties(node, props, previous) {
    for (var propName in props) {
        var propValue = props[propName]

        if (propValue === undefined) {
            removeProperty(node, propName, propValue, previous);
        } else if (isHook(propValue)) {
            removeProperty(node, propName, propValue, previous)
            if (propValue.hook) {
                propValue.hook(node,
                    propName,
                    previous ? previous[propName] : undefined)
            }
        } else {
            if (isObject(propValue)) {
                patchObject(node, props, previous, propName, propValue);
            } else {
                node[propName] = propValue
            }
        }
    }
}

function removeProperty(node, propName, propValue, previous) {
    if (previous) {
        var previousValue = previous[propName]

        if (!isHook(previousValue)) {
            if (propName === "attributes") {
                for (var attrName in previousValue) {
                    node.removeAttribute(attrName)
                }
            } else if (propName === "style") {
                for (var i in previousValue) {
                    node.style[i] = ""
                }
            } else if (typeof previousValue === "string") {
                node[propName] = ""
            } else {
                node[propName] = null
            }
        } else if (previousValue.unhook) {
            previousValue.unhook(node, propName, propValue)
        }
    }
}

function patchObject(node, props, previous, propName, propValue) {
    var previousValue = previous ? previous[propName] : undefined

    // Set attributes
    if (propName === "attributes") {
        for (var attrName in propValue) {
            var attrValue = propValue[attrName]

            if (attrValue === undefined) {
                node.removeAttribute(attrName)
            } else {
                node.setAttribute(attrName, attrValue)
            }
        }

        return
    }

    if(previousValue && isObject(previousValue) &&
        getPrototype(previousValue) !== getPrototype(propValue)) {
        node[propName] = propValue
        return
    }

    if (!isObject(node[propName])) {
        node[propName] = {}
    }

    var replacer = propName === "style" ? "" : undefined

    for (var k in propValue) {
        var value = propValue[k]
        node[propName][k] = (value === undefined) ? replacer : value
    }
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value.__proto__) {
        return value.__proto__
    } else if (value.constructor) {
        return value.constructor.prototype
    }
}

},{"../vnode/is-vhook.js":82,"is-object":68}],71:[function(require,module,exports){
var document = require("global/document")

var applyProperties = require("./apply-properties")

var isVNode = require("../vnode/is-vnode.js")
var isVText = require("../vnode/is-vtext.js")
var isWidget = require("../vnode/is-widget.js")
var handleThunk = require("../vnode/handle-thunk.js")

module.exports = createElement

function createElement(vnode, opts) {
    var doc = opts ? opts.document || document : document
    var warn = opts ? opts.warn : null

    vnode = handleThunk(vnode).a

    if (isWidget(vnode)) {
        return vnode.init()
    } else if (isVText(vnode)) {
        return doc.createTextNode(vnode.text)
    } else if (!isVNode(vnode)) {
        if (warn) {
            warn("Item is not a valid virtual dom node", vnode)
        }
        return null
    }

    var node = (vnode.namespace === null) ?
        doc.createElement(vnode.tagName) :
        doc.createElementNS(vnode.namespace, vnode.tagName)

    var props = vnode.properties
    applyProperties(node, props)

    var children = vnode.children

    for (var i = 0; i < children.length; i++) {
        var childNode = createElement(children[i], opts)
        if (childNode) {
            node.appendChild(childNode)
        }
    }

    return node
}

},{"../vnode/handle-thunk.js":80,"../vnode/is-vnode.js":83,"../vnode/is-vtext.js":84,"../vnode/is-widget.js":85,"./apply-properties":70,"global/document":67}],72:[function(require,module,exports){
// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
// We don't want to read all of the DOM nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a DOM node if we know that it contains a child of
// interest.

var noChild = {}

module.exports = domIndex

function domIndex(rootNode, tree, indices, nodes) {
    if (!indices || indices.length === 0) {
        return {}
    } else {
        indices.sort(ascending)
        return recurse(rootNode, tree, indices, nodes, 0)
    }
}

function recurse(rootNode, tree, indices, nodes, rootIndex) {
    nodes = nodes || {}


    if (rootNode) {
        if (indexInRange(indices, rootIndex, rootIndex)) {
            nodes[rootIndex] = rootNode
        }

        var vChildren = tree.children

        if (vChildren) {

            var childNodes = rootNode.childNodes

            for (var i = 0; i < tree.children.length; i++) {
                rootIndex += 1

                var vChild = vChildren[i] || noChild
                var nextIndex = rootIndex + (vChild.count || 0)

                // skip recursion down the tree if there are no nodes down here
                if (indexInRange(indices, rootIndex, nextIndex)) {
                    recurse(childNodes[i], vChild, indices, nodes, rootIndex)
                }

                rootIndex = nextIndex
            }
        }
    }

    return nodes
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false
    }

    var minIndex = 0
    var maxIndex = indices.length - 1
    var currentIndex
    var currentItem

    while (minIndex <= maxIndex) {
        currentIndex = ((maxIndex + minIndex) / 2) >> 0
        currentItem = indices[currentIndex]

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right
        } else if (currentItem < left) {
            minIndex = currentIndex + 1
        } else  if (currentItem > right) {
            maxIndex = currentIndex - 1
        } else {
            return true
        }
    }

    return false;
}

function ascending(a, b) {
    return a > b ? 1 : -1
}

},{}],73:[function(require,module,exports){
var applyProperties = require("./apply-properties")

var isWidget = require("../vnode/is-widget.js")
var VPatch = require("../vnode/vpatch.js")

var render = require("./create-element")
var updateWidget = require("./update-widget")

module.exports = applyPatch

function applyPatch(vpatch, domNode, renderOptions) {
    var type = vpatch.type
    var vNode = vpatch.vNode
    var patch = vpatch.patch

    switch (type) {
        case VPatch.REMOVE:
            return removeNode(domNode, vNode)
        case VPatch.INSERT:
            return insertNode(domNode, patch, renderOptions)
        case VPatch.VTEXT:
            return stringPatch(domNode, vNode, patch, renderOptions)
        case VPatch.WIDGET:
            return widgetPatch(domNode, vNode, patch, renderOptions)
        case VPatch.VNODE:
            return vNodePatch(domNode, vNode, patch, renderOptions)
        case VPatch.ORDER:
            reorderChildren(domNode, patch)
            return domNode
        case VPatch.PROPS:
            applyProperties(domNode, patch, vNode.properties)
            return domNode
        case VPatch.THUNK:
            return replaceRoot(domNode,
                renderOptions.patch(domNode, patch, renderOptions))
        default:
            return domNode
    }
}

function removeNode(domNode, vNode) {
    var parentNode = domNode.parentNode

    if (parentNode) {
        parentNode.removeChild(domNode)
    }

    destroyWidget(domNode, vNode);

    return null
}

function insertNode(parentNode, vNode, renderOptions) {
    var newNode = render(vNode, renderOptions)

    if (parentNode) {
        parentNode.appendChild(newNode)
    }

    return parentNode
}

function stringPatch(domNode, leftVNode, vText, renderOptions) {
    var newNode

    if (domNode.nodeType === 3) {
        domNode.replaceData(0, domNode.length, vText.text)
        newNode = domNode
    } else {
        var parentNode = domNode.parentNode
        newNode = render(vText, renderOptions)

        if (parentNode) {
            parentNode.replaceChild(newNode, domNode)
        }
    }

    return newNode
}

function widgetPatch(domNode, leftVNode, widget, renderOptions) {
    var updating = updateWidget(leftVNode, widget)
    var newNode

    if (updating) {
        newNode = widget.update(leftVNode, domNode) || domNode
    } else {
        newNode = render(widget, renderOptions)
    }

    var parentNode = domNode.parentNode

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    if (!updating) {
        destroyWidget(domNode, leftVNode)
    }

    return newNode
}

function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
    var parentNode = domNode.parentNode
    var newNode = render(vNode, renderOptions)

    if (parentNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    return newNode
}

function destroyWidget(domNode, w) {
    if (typeof w.destroy === "function" && isWidget(w)) {
        w.destroy(domNode)
    }
}

function reorderChildren(domNode, bIndex) {
    var children = []
    var childNodes = domNode.childNodes
    var len = childNodes.length
    var i
    var reverseIndex = bIndex.reverse

    for (i = 0; i < len; i++) {
        children.push(domNode.childNodes[i])
    }

    var insertOffset = 0
    var move
    var node
    var insertNode
    var chainLength
    var insertedLength
    var nextSibling
    for (i = 0; i < len;) {
        move = bIndex[i]
        chainLength = 1
        if (move !== undefined && move !== i) {
            // try to bring forward as long of a chain as possible
            while (bIndex[i + chainLength] === move + chainLength) {
                chainLength++;
            }

            // the element currently at this index will be moved later so increase the insert offset
            if (reverseIndex[i] > i + chainLength) {
                insertOffset++
            }

            node = children[move]
            insertNode = childNodes[i + insertOffset] || null
            insertedLength = 0
            while (node !== insertNode && insertedLength++ < chainLength) {
                domNode.insertBefore(node, insertNode);
                node = children[move + insertedLength];
            }

            // the moved element came from the front of the array so reduce the insert offset
            if (move + chainLength < i) {
                insertOffset--
            }
        }

        // element at this index is scheduled to be removed so increase insert offset
        if (i in bIndex.removes) {
            insertOffset++
        }

        i += chainLength
    }
}

function replaceRoot(oldRoot, newRoot) {
    if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
        console.log(oldRoot)
        oldRoot.parentNode.replaceChild(newRoot, oldRoot)
    }

    return newRoot;
}

},{"../vnode/is-widget.js":85,"../vnode/vpatch.js":88,"./apply-properties":70,"./create-element":71,"./update-widget":75}],74:[function(require,module,exports){
var document = require("global/document")
var isArray = require("x-is-array")

var domIndex = require("./dom-index")
var patchOp = require("./patch-op")
module.exports = patch

function patch(rootNode, patches) {
    return patchRecursive(rootNode, patches)
}

function patchRecursive(rootNode, patches, renderOptions) {
    var indices = patchIndices(patches)

    if (indices.length === 0) {
        return rootNode
    }

    var index = domIndex(rootNode, patches.a, indices)
    var ownerDocument = rootNode.ownerDocument

    if (!renderOptions) {
        renderOptions = { patch: patchRecursive }
        if (ownerDocument !== document) {
            renderOptions.document = ownerDocument
        }
    }

    for (var i = 0; i < indices.length; i++) {
        var nodeIndex = indices[i]
        rootNode = applyPatch(rootNode,
            index[nodeIndex],
            patches[nodeIndex],
            renderOptions)
    }

    return rootNode
}

function applyPatch(rootNode, domNode, patchList, renderOptions) {
    if (!domNode) {
        return rootNode
    }

    var newNode

    if (isArray(patchList)) {
        for (var i = 0; i < patchList.length; i++) {
            newNode = patchOp(patchList[i], domNode, renderOptions)

            if (domNode === rootNode) {
                rootNode = newNode
            }
        }
    } else {
        newNode = patchOp(patchList, domNode, renderOptions)

        if (domNode === rootNode) {
            rootNode = newNode
        }
    }

    return rootNode
}

function patchIndices(patches) {
    var indices = []

    for (var key in patches) {
        if (key !== "a") {
            indices.push(Number(key))
        }
    }

    return indices
}

},{"./dom-index":72,"./patch-op":73,"global/document":67,"x-is-array":69}],75:[function(require,module,exports){
var isWidget = require("../vnode/is-widget.js")

module.exports = updateWidget

function updateWidget(a, b) {
    if (isWidget(a) && isWidget(b)) {
        if ("name" in a && "name" in b) {
            return a.id === b.id
        } else {
            return a.init === b.init
        }
    }

    return false
}

},{"../vnode/is-widget.js":85}],76:[function(require,module,exports){
'use strict';

var EvStore = require('ev-store');

module.exports = EvHook;

function EvHook(value) {
    if (!(this instanceof EvHook)) {
        return new EvHook(value);
    }

    this.value = value;
}

EvHook.prototype.hook = function (node, propertyName) {
    var es = EvStore(node);
    var propName = propertyName.substr(3);

    es[propName] = this.value;
};

EvHook.prototype.unhook = function(node, propertyName) {
    var es = EvStore(node);
    var propName = propertyName.substr(3);

    es[propName] = undefined;
};

},{"ev-store":64}],77:[function(require,module,exports){
'use strict';

module.exports = SoftSetHook;

function SoftSetHook(value) {
    if (!(this instanceof SoftSetHook)) {
        return new SoftSetHook(value);
    }

    this.value = value;
}

SoftSetHook.prototype.hook = function (node, propertyName) {
    if (node[propertyName] !== this.value) {
        node[propertyName] = this.value;
    }
};

},{}],78:[function(require,module,exports){
'use strict';

var isArray = require('x-is-array');

var VNode = require('../vnode/vnode.js');
var VText = require('../vnode/vtext.js');
var isVNode = require('../vnode/is-vnode');
var isVText = require('../vnode/is-vtext');
var isWidget = require('../vnode/is-widget');
var isHook = require('../vnode/is-vhook');
var isVThunk = require('../vnode/is-thunk');

var parseTag = require('./parse-tag.js');
var softSetHook = require('./hooks/soft-set-hook.js');
var evHook = require('./hooks/ev-hook.js');

module.exports = h;

function h(tagName, properties, children) {
    var childNodes = [];
    var tag, props, key, namespace;

    if (!children && isChildren(properties)) {
        children = properties;
        props = {};
    }

    props = props || properties || {};
    tag = parseTag(tagName, props);

    // support keys
    if (props.hasOwnProperty('key')) {
        key = props.key;
        props.key = undefined;
    }

    // support namespace
    if (props.hasOwnProperty('namespace')) {
        namespace = props.namespace;
        props.namespace = undefined;
    }

    // fix cursor bug
    if (tag === 'INPUT' &&
        !namespace &&
        props.hasOwnProperty('value') &&
        props.value !== undefined &&
        !isHook(props.value)
    ) {
        props.value = softSetHook(props.value);
    }

    transformProperties(props);

    if (children !== undefined && children !== null) {
        addChild(children, childNodes, tag, props);
    }


    return new VNode(tag, props, childNodes, key, namespace);
}

function addChild(c, childNodes, tag, props) {
    if (typeof c === 'string') {
        childNodes.push(new VText(c));
    } else if (isChild(c)) {
        childNodes.push(c);
    } else if (isArray(c)) {
        for (var i = 0; i < c.length; i++) {
            addChild(c[i], childNodes, tag, props);
        }
    } else if (c === null || c === undefined) {
        return;
    } else {
        throw UnexpectedVirtualElement({
            foreignObject: c,
            parentVnode: {
                tagName: tag,
                properties: props
            }
        });
    }
}

function transformProperties(props) {
    for (var propName in props) {
        if (props.hasOwnProperty(propName)) {
            var value = props[propName];

            if (isHook(value)) {
                continue;
            }

            if (propName.substr(0, 3) === 'ev-') {
                // add ev-foo support
                props[propName] = evHook(value);
            }
        }
    }
}

function isChild(x) {
    return isVNode(x) || isVText(x) || isWidget(x) || isVThunk(x);
}

function isChildren(x) {
    return typeof x === 'string' || isArray(x) || isChild(x);
}

function UnexpectedVirtualElement(data) {
    var err = new Error();

    err.type = 'virtual-hyperscript.unexpected.virtual-element';
    err.message = 'Unexpected virtual child passed to h().\n' +
        'Expected a VNode / Vthunk / VWidget / string but:\n' +
        'got:\n' +
        errorString(data.foreignObject) +
        '.\n' +
        'The parent vnode is:\n' +
        errorString(data.parentVnode)
        '\n' +
        'Suggested fix: change your `h(..., [ ... ])` callsite.';
    err.foreignObject = data.foreignObject;
    err.parentVnode = data.parentVnode;

    return err;
}

function errorString(obj) {
    try {
        return JSON.stringify(obj, null, '    ');
    } catch (e) {
        return String(obj);
    }
}

},{"../vnode/is-thunk":81,"../vnode/is-vhook":82,"../vnode/is-vnode":83,"../vnode/is-vtext":84,"../vnode/is-widget":85,"../vnode/vnode.js":87,"../vnode/vtext.js":89,"./hooks/ev-hook.js":76,"./hooks/soft-set-hook.js":77,"./parse-tag.js":79,"x-is-array":69}],79:[function(require,module,exports){
'use strict';

var split = require('browser-split');

var classIdSplit = /([\.#]?[a-zA-Z0-9_:-]+)/;
var notClassId = /^\.|#/;

module.exports = parseTag;

function parseTag(tag, props) {
    if (!tag) {
        return 'DIV';
    }

    var noId = !(props.hasOwnProperty('id'));

    var tagParts = split(tag, classIdSplit);
    var tagName = null;

    if (notClassId.test(tagParts[1])) {
        tagName = 'DIV';
    }

    var classes, part, type, i;

    for (i = 0; i < tagParts.length; i++) {
        part = tagParts[i];

        if (!part) {
            continue;
        }

        type = part.charAt(0);

        if (!tagName) {
            tagName = part;
        } else if (type === '.') {
            classes = classes || [];
            classes.push(part.substring(1, part.length));
        } else if (type === '#' && noId) {
            props.id = part.substring(1, part.length);
        }
    }

    if (classes) {
        if (props.className) {
            classes.push(props.className);
        }

        props.className = classes.join(' ');
    }

    return props.namespace ? tagName : tagName.toUpperCase();
}

},{"browser-split":63}],80:[function(require,module,exports){
var isVNode = require("./is-vnode")
var isVText = require("./is-vtext")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")

module.exports = handleThunk

function handleThunk(a, b) {
    var renderedA = a
    var renderedB = b

    if (isThunk(b)) {
        renderedB = renderThunk(b, a)
    }

    if (isThunk(a)) {
        renderedA = renderThunk(a, null)
    }

    return {
        a: renderedA,
        b: renderedB
    }
}

function renderThunk(thunk, previous) {
    var renderedThunk = thunk.vnode

    if (!renderedThunk) {
        renderedThunk = thunk.vnode = thunk.render(previous)
    }

    if (!(isVNode(renderedThunk) ||
            isVText(renderedThunk) ||
            isWidget(renderedThunk))) {
        throw new Error("thunk did not return a valid node");
    }

    return renderedThunk
}

},{"./is-thunk":81,"./is-vnode":83,"./is-vtext":84,"./is-widget":85}],81:[function(require,module,exports){
module.exports = isThunk

function isThunk(t) {
    return t && t.type === "Thunk"
}

},{}],82:[function(require,module,exports){
module.exports = isHook

function isHook(hook) {
    return hook &&
      (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") ||
       typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"))
}

},{}],83:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualNode

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version
}

},{"./version":86}],84:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualText

function isVirtualText(x) {
    return x && x.type === "VirtualText" && x.version === version
}

},{"./version":86}],85:[function(require,module,exports){
module.exports = isWidget

function isWidget(w) {
    return w && w.type === "Widget"
}

},{}],86:[function(require,module,exports){
module.exports = "1"

},{}],87:[function(require,module,exports){
var version = require("./version")
var isVNode = require("./is-vnode")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")
var isVHook = require("./is-vhook")

module.exports = VirtualNode

var noProperties = {}
var noChildren = []

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName
    this.properties = properties || noProperties
    this.children = children || noChildren
    this.key = key != null ? String(key) : undefined
    this.namespace = (typeof namespace === "string") ? namespace : null

    var count = (children && children.length) || 0
    var descendants = 0
    var hasWidgets = false
    var hasThunks = false
    var descendantHooks = false
    var hooks

    for (var propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            var property = properties[propName]
            if (isVHook(property) && property.unhook) {
                if (!hooks) {
                    hooks = {}
                }

                hooks[propName] = property
            }
        }
    }

    for (var i = 0; i < count; i++) {
        var child = children[i]
        if (isVNode(child)) {
            descendants += child.count || 0

            if (!hasWidgets && child.hasWidgets) {
                hasWidgets = true
            }

            if (!hasThunks && child.hasThunks) {
                hasThunks = true
            }

            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                descendantHooks = true
            }
        } else if (!hasWidgets && isWidget(child)) {
            if (typeof child.destroy === "function") {
                hasWidgets = true
            }
        } else if (!hasThunks && isThunk(child)) {
            hasThunks = true;
        }
    }

    this.count = count + descendants
    this.hasWidgets = hasWidgets
    this.hasThunks = hasThunks
    this.hooks = hooks
    this.descendantHooks = descendantHooks
}

VirtualNode.prototype.version = version
VirtualNode.prototype.type = "VirtualNode"

},{"./is-thunk":81,"./is-vhook":82,"./is-vnode":83,"./is-widget":85,"./version":86}],88:[function(require,module,exports){
var version = require("./version")

VirtualPatch.NONE = 0
VirtualPatch.VTEXT = 1
VirtualPatch.VNODE = 2
VirtualPatch.WIDGET = 3
VirtualPatch.PROPS = 4
VirtualPatch.ORDER = 5
VirtualPatch.INSERT = 6
VirtualPatch.REMOVE = 7
VirtualPatch.THUNK = 8

module.exports = VirtualPatch

function VirtualPatch(type, vNode, patch) {
    this.type = Number(type)
    this.vNode = vNode
    this.patch = patch
}

VirtualPatch.prototype.version = version
VirtualPatch.prototype.type = "VirtualPatch"

},{"./version":86}],89:[function(require,module,exports){
var version = require("./version")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version
VirtualText.prototype.type = "VirtualText"

},{"./version":86}],90:[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook")

module.exports = diffProps

function diffProps(a, b) {
    var diff

    for (var aKey in a) {
        if (!(aKey in b)) {
            diff = diff || {}
            diff[aKey] = undefined
        }

        var aValue = a[aKey]
        var bValue = b[aKey]

        if (aValue === bValue) {
            continue
        } else if (isObject(aValue) && isObject(bValue)) {
            if (getPrototype(bValue) !== getPrototype(aValue)) {
                diff = diff || {}
                diff[aKey] = bValue
            } else if (isHook(bValue)) {
                 diff = diff || {}
                 diff[aKey] = bValue
            } else {
                var objectDiff = diffProps(aValue, bValue)
                if (objectDiff) {
                    diff = diff || {}
                    diff[aKey] = objectDiff
                }
            }
        } else {
            diff = diff || {}
            diff[aKey] = bValue
        }
    }

    for (var bKey in b) {
        if (!(bKey in a)) {
            diff = diff || {}
            diff[bKey] = b[bKey]
        }
    }

    return diff
}

function getPrototype(value) {
  if (Object.getPrototypeOf) {
    return Object.getPrototypeOf(value)
  } else if (value.__proto__) {
    return value.__proto__
  } else if (value.constructor) {
    return value.constructor.prototype
  }
}

},{"../vnode/is-vhook":82,"is-object":68}],91:[function(require,module,exports){
var isArray = require("x-is-array")

var VPatch = require("../vnode/vpatch")
var isVNode = require("../vnode/is-vnode")
var isVText = require("../vnode/is-vtext")
var isWidget = require("../vnode/is-widget")
var isThunk = require("../vnode/is-thunk")
var handleThunk = require("../vnode/handle-thunk")

var diffProps = require("./diff-props")

module.exports = diff

function diff(a, b) {
    var patch = { a: a }
    walk(a, b, patch, 0)
    return patch
}

function walk(a, b, patch, index) {
    if (a === b) {
        return
    }

    var apply = patch[index]
    var applyClear = false

    if (isThunk(a) || isThunk(b)) {
        thunks(a, b, patch, index)
    } else if (b == null) {

        // If a is a widget we will add a remove patch for it
        // Otherwise any child widgets/hooks must be destroyed.
        // This prevents adding two remove patches for a widget.
        if (!isWidget(a)) {
            clearState(a, patch, index)
            apply = patch[index]
        }

        apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b))
    } else if (isVNode(b)) {
        if (isVNode(a)) {
            if (a.tagName === b.tagName &&
                a.namespace === b.namespace &&
                a.key === b.key) {
                var propsPatch = diffProps(a.properties, b.properties)
                if (propsPatch) {
                    apply = appendPatch(apply,
                        new VPatch(VPatch.PROPS, a, propsPatch))
                }
                apply = diffChildren(a, b, patch, apply, index)
            } else {
                apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
                applyClear = true
            }
        } else {
            apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
            applyClear = true
        }
    } else if (isVText(b)) {
        if (!isVText(a)) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
            applyClear = true
        } else if (a.text !== b.text) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
        }
    } else if (isWidget(b)) {
        if (!isWidget(a)) {
            applyClear = true;
        }

        apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b))
    }

    if (apply) {
        patch[index] = apply
    }

    if (applyClear) {
        clearState(a, patch, index)
    }
}

function diffChildren(a, b, patch, apply, index) {
    var aChildren = a.children
    var bChildren = reorder(aChildren, b.children)

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen

    for (var i = 0; i < len; i++) {
        var leftNode = aChildren[i]
        var rightNode = bChildren[i]
        index += 1

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                apply = appendPatch(apply,
                    new VPatch(VPatch.INSERT, null, rightNode))
            }
        } else {
            walk(leftNode, rightNode, patch, index)
        }

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count
        }
    }

    if (bChildren.moves) {
        // Reorder nodes last
        apply = appendPatch(apply, new VPatch(VPatch.ORDER, a, bChildren.moves))
    }

    return apply
}

function clearState(vNode, patch, index) {
    // TODO: Make this a single walk, not two
    unhook(vNode, patch, index)
    destroyWidgets(vNode, patch, index)
}

// Patch records for all destroyed widgets must be added because we need
// a DOM node reference for the destroy function
function destroyWidgets(vNode, patch, index) {
    if (isWidget(vNode)) {
        if (typeof vNode.destroy === "function") {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(VPatch.REMOVE, vNode, null)
            )
        }
    } else if (isVNode(vNode) && (vNode.hasWidgets || vNode.hasThunks)) {
        var children = vNode.children
        var len = children.length
        for (var i = 0; i < len; i++) {
            var child = children[i]
            index += 1

            destroyWidgets(child, patch, index)

            if (isVNode(child) && child.count) {
                index += child.count
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

// Create a sub-patch for thunks
function thunks(a, b, patch, index) {
    var nodes = handleThunk(a, b);
    var thunkPatch = diff(nodes.a, nodes.b)
    if (hasPatches(thunkPatch)) {
        patch[index] = new VPatch(VPatch.THUNK, null, thunkPatch)
    }
}

function hasPatches(patch) {
    for (var index in patch) {
        if (index !== "a") {
            return true;
        }
    }

    return false;
}

// Execute hooks when two nodes are identical
function unhook(vNode, patch, index) {
    if (isVNode(vNode)) {
        if (vNode.hooks) {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(
                    VPatch.PROPS,
                    vNode,
                    undefinedKeys(vNode.hooks)
                )
            )
        }

        if (vNode.descendantHooks || vNode.hasThunks) {
            var children = vNode.children
            var len = children.length
            for (var i = 0; i < len; i++) {
                var child = children[i]
                index += 1

                unhook(child, patch, index)

                if (isVNode(child) && child.count) {
                    index += child.count
                }
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

function undefinedKeys(obj) {
    var result = {}

    for (var key in obj) {
        result[key] = undefined
    }

    return result
}

// List diff, naive left to right reordering
function reorder(aChildren, bChildren) {

    var bKeys = keyIndex(bChildren)

    if (!bKeys) {
        return bChildren
    }

    var aKeys = keyIndex(aChildren)

    if (!aKeys) {
        return bChildren
    }

    var bMatch = {}, aMatch = {}

    for (var aKey in bKeys) {
        bMatch[bKeys[aKey]] = aKeys[aKey]
    }

    for (var bKey in aKeys) {
        aMatch[aKeys[bKey]] = bKeys[bKey]
    }

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen
    var shuffle = []
    var freeIndex = 0
    var i = 0
    var moveIndex = 0
    var moves = {}
    var removes = moves.removes = {}
    var reverse = moves.reverse = {}
    var hasMoves = false

    while (freeIndex < len) {
        var move = aMatch[i]
        if (move !== undefined) {
            shuffle[i] = bChildren[move]
            if (move !== moveIndex) {
                moves[move] = moveIndex
                reverse[moveIndex] = move
                hasMoves = true
            }
            moveIndex++
        } else if (i in aMatch) {
            shuffle[i] = undefined
            removes[i] = moveIndex++
            hasMoves = true
        } else {
            while (bMatch[freeIndex] !== undefined) {
                freeIndex++
            }

            if (freeIndex < len) {
                var freeChild = bChildren[freeIndex]
                if (freeChild) {
                    shuffle[i] = freeChild
                    if (freeIndex !== moveIndex) {
                        hasMoves = true
                        moves[freeIndex] = moveIndex
                        reverse[moveIndex] = freeIndex
                    }
                    moveIndex++
                }
                freeIndex++
            }
        }
        i++
    }

    if (hasMoves) {
        shuffle.moves = moves
    }

    return shuffle
}

function keyIndex(children) {
    var i, keys

    for (i = 0; i < children.length; i++) {
        var child = children[i]

        if (child.key !== undefined) {
            keys = keys || {}
            keys[child.key] = i
        }
    }

    return keys
}

function appendPatch(apply, patch) {
    if (apply) {
        if (isArray(apply)) {
            apply.push(patch)
        } else {
            apply = [apply, patch]
        }

        return apply
    } else {
        return patch
    }
}

},{"../vnode/handle-thunk":80,"../vnode/is-thunk":81,"../vnode/is-vnode":83,"../vnode/is-vtext":84,"../vnode/is-widget":85,"../vnode/vpatch":88,"./diff-props":90,"x-is-array":69}],92:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"dup":41}],93:[function(require,module,exports){
module.exports = extend

function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],94:[function(require,module,exports){
'use strict';
module.exports = function (month, year) {
	var now = new Date();
	month = month == null ? now.getUTCMonth() : month;
	year = year == null ? now.getUTCFullYear() : year;

	return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
};

},{}],95:[function(require,module,exports){
var _arity = require('./internal/_arity');
var _curry2 = require('./internal/_curry2');


/**
 * Creates a function that is bound to a context.
 * Note: `R.bind` does not provide the additional argument-binding capabilities of
 * [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
 *
 * @func
 * @memberOf R
 * @since v0.6.0
 * @category Function
 * @category Object
 * @see R.partial
 * @sig (* -> *) -> {*} -> (* -> *)
 * @param {Function} fn The function to bind to context
 * @param {Object} thisObj The context to bind `fn` to
 * @return {Function} A function that will execute in the context of `thisObj`.
 */
module.exports = _curry2(function bind(fn, thisObj) {
  return _arity(fn.length, function() {
    return fn.apply(thisObj, arguments);
  });
});

},{"./internal/_arity":96,"./internal/_curry2":99}],96:[function(require,module,exports){
module.exports = function _arity(n, fn) {
  // jshint unused:vars
  switch (n) {
    case 0: return function() { return fn.apply(this, arguments); };
    case 1: return function(a0) { return fn.apply(this, arguments); };
    case 2: return function(a0, a1) { return fn.apply(this, arguments); };
    case 3: return function(a0, a1, a2) { return fn.apply(this, arguments); };
    case 4: return function(a0, a1, a2, a3) { return fn.apply(this, arguments); };
    case 5: return function(a0, a1, a2, a3, a4) { return fn.apply(this, arguments); };
    case 6: return function(a0, a1, a2, a3, a4, a5) { return fn.apply(this, arguments); };
    case 7: return function(a0, a1, a2, a3, a4, a5, a6) { return fn.apply(this, arguments); };
    case 8: return function(a0, a1, a2, a3, a4, a5, a6, a7) { return fn.apply(this, arguments); };
    case 9: return function(a0, a1, a2, a3, a4, a5, a6, a7, a8) { return fn.apply(this, arguments); };
    case 10: return function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) { return fn.apply(this, arguments); };
    default: throw new Error('First argument to _arity must be a non-negative integer no greater than ten');
  }
};

},{}],97:[function(require,module,exports){
var _isArray = require('./_isArray');
var _slice = require('./_slice');


/**
 * Similar to hasMethod, this checks whether a function has a [methodname]
 * function. If it isn't an array it will execute that function otherwise it will
 * default to the ramda implementation.
 *
 * @private
 * @param {Function} fn ramda implemtation
 * @param {String} methodname property to check for a custom implementation
 * @return {Object} Whatever the return value of the method is.
 */
module.exports = function _checkForMethod(methodname, fn) {
  return function() {
    var length = arguments.length;
    if (length === 0) {
      return fn();
    }
    var obj = arguments[length - 1];
    return (_isArray(obj) || typeof obj[methodname] !== 'function') ?
      fn.apply(this, arguments) :
      obj[methodname].apply(obj, _slice(arguments, 0, length - 1));
  };
};

},{"./_isArray":102,"./_slice":104}],98:[function(require,module,exports){
/**
 * Optimized internal one-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */
module.exports = function _curry1(fn) {
  return function f1(a) {
    if (arguments.length === 0) {
      return f1;
    } else if (a != null && a['@@functional/placeholder'] === true) {
      return f1;
    } else {
      return fn.apply(this, arguments);
    }
  };
};

},{}],99:[function(require,module,exports){
var _curry1 = require('./_curry1');


/**
 * Optimized internal two-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */
module.exports = function _curry2(fn) {
  return function f2(a, b) {
    var n = arguments.length;
    if (n === 0) {
      return f2;
    } else if (n === 1 && a != null && a['@@functional/placeholder'] === true) {
      return f2;
    } else if (n === 1) {
      return _curry1(function(b) { return fn(a, b); });
    } else if (n === 2 && a != null && a['@@functional/placeholder'] === true &&
                          b != null && b['@@functional/placeholder'] === true) {
      return f2;
    } else if (n === 2 && a != null && a['@@functional/placeholder'] === true) {
      return _curry1(function(a) { return fn(a, b); });
    } else if (n === 2 && b != null && b['@@functional/placeholder'] === true) {
      return _curry1(function(b) { return fn(a, b); });
    } else {
      return fn(a, b);
    }
  };
};

},{"./_curry1":98}],100:[function(require,module,exports){
var _curry1 = require('./_curry1');
var _curry2 = require('./_curry2');


/**
 * Optimized internal three-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */
module.exports = function _curry3(fn) {
  return function f3(a, b, c) {
    var n = arguments.length;
    if (n === 0) {
      return f3;
    } else if (n === 1 && a != null && a['@@functional/placeholder'] === true) {
      return f3;
    } else if (n === 1) {
      return _curry2(function(b, c) { return fn(a, b, c); });
    } else if (n === 2 && a != null && a['@@functional/placeholder'] === true &&
                          b != null && b['@@functional/placeholder'] === true) {
      return f3;
    } else if (n === 2 && a != null && a['@@functional/placeholder'] === true) {
      return _curry2(function(a, c) { return fn(a, b, c); });
    } else if (n === 2 && b != null && b['@@functional/placeholder'] === true) {
      return _curry2(function(b, c) { return fn(a, b, c); });
    } else if (n === 2) {
      return _curry1(function(c) { return fn(a, b, c); });
    } else if (n === 3 && a != null && a['@@functional/placeholder'] === true &&
                          b != null && b['@@functional/placeholder'] === true &&
                          c != null && c['@@functional/placeholder'] === true) {
      return f3;
    } else if (n === 3 && a != null && a['@@functional/placeholder'] === true &&
                          b != null && b['@@functional/placeholder'] === true) {
      return _curry2(function(a, b) { return fn(a, b, c); });
    } else if (n === 3 && a != null && a['@@functional/placeholder'] === true &&
                          c != null && c['@@functional/placeholder'] === true) {
      return _curry2(function(a, c) { return fn(a, b, c); });
    } else if (n === 3 && b != null && b['@@functional/placeholder'] === true &&
                          c != null && c['@@functional/placeholder'] === true) {
      return _curry2(function(b, c) { return fn(a, b, c); });
    } else if (n === 3 && a != null && a['@@functional/placeholder'] === true) {
      return _curry1(function(a) { return fn(a, b, c); });
    } else if (n === 3 && b != null && b['@@functional/placeholder'] === true) {
      return _curry1(function(b) { return fn(a, b, c); });
    } else if (n === 3 && c != null && c['@@functional/placeholder'] === true) {
      return _curry1(function(c) { return fn(a, b, c); });
    } else {
      return fn(a, b, c);
    }
  };
};

},{"./_curry1":98,"./_curry2":99}],101:[function(require,module,exports){
module.exports = function _has(prop, obj) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

},{}],102:[function(require,module,exports){
/**
 * Tests whether or not an object is an array.
 *
 * @private
 * @param {*} val The object to test.
 * @return {Boolean} `true` if `val` is an array, `false` otherwise.
 * @example
 *
 *      _isArray([]); //=> true
 *      _isArray(null); //=> false
 *      _isArray({}); //=> false
 */
module.exports = Array.isArray || function _isArray(val) {
  return (val != null &&
          val.length >= 0 &&
          Object.prototype.toString.call(val) === '[object Array]');
};

},{}],103:[function(require,module,exports){
var _xwrap = require('./_xwrap');
var bind = require('../bind');
var isArrayLike = require('../isArrayLike');


module.exports = (function() {
  function _arrayReduce(xf, acc, list) {
    var idx = 0, len = list.length;
    while (idx < len) {
      acc = xf['@@transducer/step'](acc, list[idx]);
      if (acc && acc['@@transducer/reduced']) {
        acc = acc['@@transducer/value'];
        break;
      }
      idx += 1;
    }
    return xf['@@transducer/result'](acc);
  }

  function _iterableReduce(xf, acc, iter) {
    var step = iter.next();
    while (!step.done) {
      acc = xf['@@transducer/step'](acc, step.value);
      if (acc && acc['@@transducer/reduced']) {
        acc = acc['@@transducer/value'];
        break;
      }
      step = iter.next();
    }
    return xf['@@transducer/result'](acc);
  }

  function _methodReduce(xf, acc, obj) {
    return xf['@@transducer/result'](obj.reduce(bind(xf['@@transducer/step'], xf), acc));
  }

  var symIterator = (typeof Symbol !== 'undefined') ? Symbol.iterator : '@@iterator';
  return function _reduce(fn, acc, list) {
    if (typeof fn === 'function') {
      fn = _xwrap(fn);
    }
    if (isArrayLike(list)) {
      return _arrayReduce(fn, acc, list);
    }
    if (typeof list.reduce === 'function') {
      return _methodReduce(fn, acc, list);
    }
    if (list[symIterator] != null) {
      return _iterableReduce(fn, acc, list[symIterator]());
    }
    if (typeof list.next === 'function') {
      return _iterableReduce(fn, acc, list);
    }
    throw new TypeError('reduce: list must be array or iterable');
  };
})();

},{"../bind":95,"../isArrayLike":106,"./_xwrap":105}],104:[function(require,module,exports){
/**
 * An optimized, private array `slice` implementation.
 *
 * @private
 * @param {Arguments|Array} args The array or arguments object to consider.
 * @param {Number} [from=0] The array index to slice from, inclusive.
 * @param {Number} [to=args.length] The array index to slice to, exclusive.
 * @return {Array} A new, sliced array.
 * @example
 *
 *      _slice([1, 2, 3, 4, 5], 1, 3); //=> [2, 3]
 *
 *      var firstThreeArgs = function(a, b, c, d) {
 *        return _slice(arguments, 0, 3);
 *      };
 *      firstThreeArgs(1, 2, 3, 4); //=> [1, 2, 3]
 */
module.exports = function _slice(args, from, to) {
  switch (arguments.length) {
    case 1: return _slice(args, 0, args.length);
    case 2: return _slice(args, from, args.length);
    default:
      var list = [];
      var idx = 0;
      var len = Math.max(0, Math.min(args.length, to) - from);
      while (idx < len) {
        list[idx] = args[from + idx];
        idx += 1;
      }
      return list;
  }
};

},{}],105:[function(require,module,exports){
module.exports = (function() {
  function XWrap(fn) {
    this.f = fn;
  }
  XWrap.prototype['@@transducer/init'] = function() {
    throw new Error('init not implemented on XWrap');
  };
  XWrap.prototype['@@transducer/result'] = function(acc) { return acc; };
  XWrap.prototype['@@transducer/step'] = function(acc, x) {
    return this.f(acc, x);
  };

  return function _xwrap(fn) { return new XWrap(fn); };
}());

},{}],106:[function(require,module,exports){
var _curry1 = require('./internal/_curry1');
var _isArray = require('./internal/_isArray');


/**
 * Tests whether or not an object is similar to an array.
 *
 * @func
 * @memberOf R
 * @since v0.5.0
 * @category Type
 * @category List
 * @sig * -> Boolean
 * @param {*} x The object to test.
 * @return {Boolean} `true` if `x` has a numeric length property and extreme indices defined; `false` otherwise.
 * @example
 *
 *      R.isArrayLike([]); //=> true
 *      R.isArrayLike(true); //=> false
 *      R.isArrayLike({}); //=> false
 *      R.isArrayLike({length: 10}); //=> false
 *      R.isArrayLike({0: 'zero', 9: 'nine', length: 10}); //=> true
 */
module.exports = _curry1(function isArrayLike(x) {
  if (_isArray(x)) { return true; }
  if (!x) { return false; }
  if (typeof x !== 'object') { return false; }
  if (x instanceof String) { return false; }
  if (x.nodeType === 1) { return !!x.length; }
  if (x.length === 0) { return true; }
  if (x.length > 0) {
    return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);
  }
  return false;
});

},{"./internal/_curry1":98,"./internal/_isArray":102}],107:[function(require,module,exports){
var _curry1 = require('./internal/_curry1');
var _has = require('./internal/_has');


/**
 * Returns a list containing the names of all the enumerable own
 * properties of the supplied object.
 * Note that the order of the output array is not guaranteed to be
 * consistent across different JS platforms.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {k: v} -> [k]
 * @param {Object} obj The object to extract properties from
 * @return {Array} An array of the object's own properties.
 * @example
 *
 *      R.keys({a: 1, b: 2, c: 3}); //=> ['a', 'b', 'c']
 */
module.exports = (function() {
  // cover IE < 9 keys issues
  var hasEnumBug = !({toString: null}).propertyIsEnumerable('toString');
  var nonEnumerableProps = ['constructor', 'valueOf', 'isPrototypeOf', 'toString',
                            'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  var contains = function contains(list, item) {
    var idx = 0;
    while (idx < list.length) {
      if (list[idx] === item) {
        return true;
      }
      idx += 1;
    }
    return false;
  };

  return typeof Object.keys === 'function' ?
    _curry1(function keys(obj) {
      return Object(obj) !== obj ? [] : Object.keys(obj);
    }) :
    _curry1(function keys(obj) {
      if (Object(obj) !== obj) {
        return [];
      }
      var prop, ks = [], nIdx;
      for (prop in obj) {
        if (_has(prop, obj)) {
          ks[ks.length] = prop;
        }
      }
      if (hasEnumBug) {
        nIdx = nonEnumerableProps.length - 1;
        while (nIdx >= 0) {
          prop = nonEnumerableProps[nIdx];
          if (_has(prop, obj) && !contains(ks, prop)) {
            ks[ks.length] = prop;
          }
          nIdx -= 1;
        }
      }
      return ks;
    });
}());

},{"./internal/_curry1":98,"./internal/_has":101}],108:[function(require,module,exports){
var _curry2 = require('./internal/_curry2');
var keys = require('./keys');


/**
 * Create a new object with the own properties of `a`
 * merged with the own properties of object `b`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {k: v} -> {k: v} -> {k: v}
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 * @example
 *
 *      R.merge({ 'name': 'fred', 'age': 10 }, { 'age': 40 });
 *      //=> { 'name': 'fred', 'age': 40 }
 *
 *      var resetToDefault = R.merge(R.__, {x: 0});
 *      resetToDefault({x: 5, y: 2}); //=> {x: 0, y: 2}
 */
module.exports = _curry2(function merge(a, b) {
  var result = {};
  var ks = keys(a);
  var idx = 0;
  while (idx < ks.length) {
    result[ks[idx]] = a[ks[idx]];
    idx += 1;
  }
  ks = keys(b);
  idx = 0;
  while (idx < ks.length) {
    result[ks[idx]] = b[ks[idx]];
    idx += 1;
  }
  return result;
});

},{"./internal/_curry2":99,"./keys":107}],109:[function(require,module,exports){
var _curry2 = require('./internal/_curry2');


/**
 * Returns a partial copy of an object containing only the keys specified.  If the key does not exist, the
 * property is ignored.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig [k] -> {k: v} -> {k: v}
 * @param {Array} names an array of String property names to copy onto a new object
 * @param {Object} obj The object to copy from
 * @return {Object} A new object with only properties from `names` on it.
 * @see R.omit, R.props
 * @example
 *
 *      R.pick(['a', 'd'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1, d: 4}
 *      R.pick(['a', 'e', 'f'], {a: 1, b: 2, c: 3, d: 4}); //=> {a: 1}
 */
module.exports = _curry2(function pick(names, obj) {
  var result = {};
  var idx = 0;
  while (idx < names.length) {
    if (names[idx] in obj) {
      result[names[idx]] = obj[names[idx]];
    }
    idx += 1;
  }
  return result;
});

},{"./internal/_curry2":99}],110:[function(require,module,exports){
var _curry3 = require('./internal/_curry3');
var _reduce = require('./internal/_reduce');


/**
 * Returns a single item by iterating through the list, successively calling the iterator
 * function and passing it an accumulator value and the current value from the array, and
 * then passing the result to the next call.
 *
 * The iterator function receives two values: *(acc, value)*.  It may use `R.reduced` to
 * shortcut the iteration.
 *
 * Note: `R.reduce` does not skip deleted or unassigned indices (sparse arrays), unlike
 * the native `Array.prototype.reduce` method. For more details on this behavior, see:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Description
 * @see R.reduced
 *
 * Dispatches to the `reduce` method of the third argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig (a,b -> a) -> a -> [b] -> a
 * @param {Function} fn The iterator function. Receives two values, the accumulator and the
 *        current element from the array.
 * @param {*} acc The accumulator value.
 * @param {Array} list The list to iterate over.
 * @return {*} The final, accumulated value.
 * @example
 *
 *      var numbers = [1, 2, 3];
 *      var add = (a, b) => a + b;
 *
 *      R.reduce(add, 10, numbers); //=> 16
 */
module.exports = _curry3(_reduce);

},{"./internal/_curry3":100,"./internal/_reduce":103}],111:[function(require,module,exports){
var _checkForMethod = require('./internal/_checkForMethod');
var _curry3 = require('./internal/_curry3');


/**
 * Returns the elements of the given list or string (or object with a `slice`
 * method) from `fromIndex` (inclusive) to `toIndex` (exclusive).
 *
 * Dispatches to the `slice` method of the third argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.4
 * @category List
 * @sig Number -> Number -> [a] -> [a]
 * @sig Number -> Number -> String -> String
 * @param {Number} fromIndex The start index (inclusive).
 * @param {Number} toIndex The end index (exclusive).
 * @param {*} list
 * @return {*}
 * @example
 *
 *      R.slice(1, 3, ['a', 'b', 'c', 'd']);        //=> ['b', 'c']
 *      R.slice(1, Infinity, ['a', 'b', 'c', 'd']); //=> ['b', 'c', 'd']
 *      R.slice(0, -1, ['a', 'b', 'c', 'd']);       //=> ['a', 'b', 'c']
 *      R.slice(-3, -1, ['a', 'b', 'c', 'd']);      //=> ['b', 'c']
 *      R.slice(0, 3, 'ramda');                     //=> 'ram'
 */
module.exports = _curry3(_checkForMethod('slice', function slice(fromIndex, toIndex, list) {
  return Array.prototype.slice.call(list, fromIndex, toIndex);
}));

},{"./internal/_checkForMethod":97,"./internal/_curry3":100}],112:[function(require,module,exports){
var _curry2 = require('./internal/_curry2');
var slice = require('./slice');


/**
 * Splits a collection into slices of the specified length.
 *
 * @func
 * @memberOf R
 * @since v0.16.0
 * @category List
 * @sig Number -> [a] -> [[a]]
 * @sig Number -> String -> [String]
 * @param {Number} n
 * @param {Array} list
 * @return {Array}
 * @example
 *
 *      R.splitEvery(3, [1, 2, 3, 4, 5, 6, 7]); //=> [[1, 2, 3], [4, 5, 6], [7]]
 *      R.splitEvery(3, 'foobarbaz'); //=> ['foo', 'bar', 'baz']
 */
module.exports = _curry2(function splitEvery(n, list) {
  if (n <= 0) {
    throw new Error('First argument to splitEvery must be a positive integer');
  }
  var result = [];
  var idx = 0;
  while (idx < list.length) {
    result.push(slice(idx, idx += n, list));
  }
  return result;
});

},{"./internal/_curry2":99,"./slice":111}],113:[function(require,module,exports){
var _curry2 = require('./internal/_curry2');


/**
 * Calls an input function `n` times, returning an array containing the results of those
 * function calls.
 *
 * `fn` is passed one argument: The current value of `n`, which begins at `0` and is
 * gradually incremented to `n - 1`.
 *
 * @func
 * @memberOf R
 * @since v0.2.3
 * @category List
 * @sig (i -> a) -> i -> [a]
 * @param {Function} fn The function to invoke. Passed one argument, the current value of `n`.
 * @param {Number} n A value between `0` and `n - 1`. Increments after each function call.
 * @return {Array} An array containing the return values of all calls to `fn`.
 * @example
 *
 *      R.times(R.identity, 5); //=> [0, 1, 2, 3, 4]
 */
module.exports = _curry2(function times(fn, n) {
  var len = Number(n);
  var list = new Array(len);
  var idx = 0;
  while (idx < len) {
    list[idx] = fn(idx);
    idx += 1;
  }
  return list;
});

},{"./internal/_curry2":99}],114:[function(require,module,exports){
var _curry1 = require('./internal/_curry1');
var keys = require('./keys');


/**
 * Returns a list of all the enumerable own properties of the supplied object.
 * Note that the order of the output array is not guaranteed across
 * different JS platforms.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {k: v} -> [v]
 * @param {Object} obj The object to extract values from
 * @return {Array} An array of the values of the object's own properties.
 * @example
 *
 *      R.values({a: 1, b: 2, c: 3}); //=> [1, 2, 3]
 */
module.exports = _curry1(function values(obj) {
  var props = keys(obj);
  var len = props.length;
  var vals = [];
  var idx = 0;
  while (idx < len) {
    vals[idx] = obj[props[idx]];
    idx += 1;
  }
  return vals;
});

},{"./internal/_curry1":98,"./keys":107}],115:[function(require,module,exports){
var merge = require('ramda/src/merge');
var pick = require('ramda/src/pick');
var values = require('ramda/src/values');
var reduce = require('ramda/src/reduce');
var styles = require('./styles');

module.exports = function buildStyle(extendedStyle, styleNames) {
  var styleNamesWithDefault = ['otDefaults'].concat(styleNames || []);
  var stylesWithDefault = values(pick(styleNamesWithDefault, styles));
  var stylesWithExtended = stylesWithDefault.concat([extendedStyle || {}]);
  return reduce(merge, {}, stylesWithExtended);
}

},{"./styles":168,"ramda/src/merge":108,"ramda/src/pick":109,"ramda/src/reduce":110,"ramda/src/values":114}],116:[function(require,module,exports){
var merge = require('ramda/src/merge');

var defaults = {
  boxSizing: 'border-box',
  // fontFamily: '\"source-sans-pro\",\"Helvetica Neue\",Helvetica,Arial,sans-serif',
  fontFamily: '"Helvetica Neue Light", "HelveticaNeue-Light", "Helvetica Neue", Calibri, Helvetica, Arial, sans-serif',
  fontSize: '16px',
  fontStyle: 'normal',
  fontWeight: 400,
  margin: 0,
  padding: 0
};

module.exports = function buildStyle(style) {
  return merge(defaults, style);
}

},{"ramda/src/merge":108}],117:[function(require,module,exports){
var hg = require('mercury');
var buildStyle = require('../../build-style');
var popUp = require('./pop-up');
var dateFormat = require('dateformat');
var languages = require('../../languages');
var translations = require('./translations');

var h = hg.h;

var styles = {
  datePicker: buildStyle({
    borderLeft: '1px solid rgba(0,0,0,.08)'
  }, ['pickerSelector']),
  datePickerLink: buildStyle({}, ['pickerLabel'])
};

module.exports = function datePicker(state) {
  var selectedDate = state.viewModel.selectedDate;
  var date = new Date(selectedDate.year, selectedDate.month, selectedDate.day);
  var language = languages[state.viewModel.language];
  var translation = translations[state.viewModel.locale];

  // FIXME: should only have to run on state initialization
  dateFormat.i18n = {
    dayNames: translation.weekdaysShort.concat(translation.weekdaysFull),
    monthNames: translation.monthsShort.concat(translation.monthsFull)
  };

  return h('div', {
    style: styles.datePicker
  }, [
    h('a', {
      style: styles.datePickerLink,
      'ev-click': hg.send(state.channels.toggleDatePicker)
    }, dateFormat(date, language.dateFormat)),
    // }, dateFormat(date, 'd mmmm, yyyy')),
    popUp(state)
  ]);
}

},{"../../build-style":115,"../../languages":166,"./pop-up":118,"./translations":139,"dateformat":3,"mercury":4}],118:[function(require,module,exports){
var hg = require('mercury');
var splitEvery = require('ramda/src/splitEvery');
var merge = require('ramda/src/merge');
var translations = require('./translations');
var buildStyle = require('./build-style');

var h = hg.h;
var styles = {
  popUp: buildStyle({
    width: '22em',
    height: '18em',
    position: 'absolute',
    left: 'calc(50% - 11rem)',
    borderRadius: '3px',
    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
    padding: '1em',
    boxSizing: 'border-box',
  }),
  popUpHeader: buildStyle({
    textAlign: 'center',
    position: 'relative'
  }),
  popUpTable: buildStyle({
    boxSizing: 'border-box',
    textAlign: 'center',
    borderCollapse: 'collapse',
    borderSpacing: 0,
    tableLayout: 'fixed',
    fontSize: 'inherit',
    width: '100%',
    marginTop: '1rem',
  }),
  dayTd: buildStyle({
    lineHeight: 1.95
  }),
  dayTdContent: buildStyle({
    margin: '0 auto',
    height: '2em',
    width: '2em',
    borderRadius: '100%'
  })
};

var colors = {
  primary: '#DA3743',
  faded: '#f7d7d9'
};

// selected background color: #DA3743
//
module.exports = function popUp(state) {
  var displayedDate = state.viewModel.displayedDate;
  var month = state
    .viewModel
    .years[displayedDate.year][displayedDate.month];

  var translation = merge(translations['en-US'], translations[state.viewModel.locale] || {});

  var dayIndex = 0;
  // use on mouseover
  var dayTrs = splitEvery(7, month.displayedDays)
    .map(function trFromWeek(week) {
      var dayTds = week.map(function tdFromDay(day) {
        var styleTdContent = state.viewModel.highlightedDayIndex === dayIndex ?
          merge(styles.dayTdContent, {
            backgroundColor: colors.faded,
            color: colors.primary
          }) :
          styles.dayTdContent;

        var td = h('td', {
          style: styles.dayTd,
          'ev-mouseout': hg.send(state.channels.mouseoutDay, dayIndex),
          'ev-mouseover': hg.send(state.channels.mouseoverDay, dayIndex),
        }, h('div', { style: styleTdContent }, String(day.dayOfMonth)));

        dayIndex++;
        return td;
      });
      return h('tr', dayTds);
    });

  var dayThs = translation.weekdaysShort.map(function buildDayTh(day) {
    return h('th', day);
  });

  var extendedPopUpStyle = {};
  if (state.viewModel.isDatePickerTop) {
    extendedPopUpStyle.top = '-' + styles.popUp.height;
  }

  if (!state.viewModel.open) {
    extendedPopUpStyle.height = 0;
    extendedPopUpStyle.opacity = 0;
    var translateY = state.viewModel.isDatePickerTop ? '1' : '-1';
    extendedPopUpStyle.transform = 'translateY(' + translateY + 'em) perspective(600px)';
  }
  extendedPopUpStyle.transition = 'transform 0.15s ease-out, opacity 0.15s ease-out, position 0.15s ease-out, height 0s 0.15s';
  var popUpStyle = merge(styles.popUp, extendedPopUpStyle);

  return h('div', {
    style: popUpStyle
  }, [
    h('div', {
      style: styles.popUpHeader
    }, [
      translation.monthsFull[displayedDate.month] + ' ' + displayedDate.year,
      h('div', {
        style: {
          width: '30px',
          height: '30px',
          float: 'left',
          backgroundColor: 'black'
        },
        'ev-click': hg.send(state.channels.lastMonth)
      }),
      h('div', {
        style: {
          height: '30px',
          width: '30px',
          float: 'right',
          backgroundColor: 'black'
        },
        'ev-click': hg.send(state.channels.nextMonth)
      })
    ]),

    h('table', {
      style: styles.popUpTable
    }, [
      h('thead', h('tr', { style: { height: '2em' } }, dayThs)),
      h('tbody', dayTrs)
    ])
  ]);
}

},{"./build-style":116,"./translations":139,"mercury":4,"ramda/src/merge":108,"ramda/src/splitEvery":112}],119:[function(require,module,exports){
module.exports={"monthsFull":["януари","февруари","март","април","май","юни","юли","август","септември","октомври","ноември","декември"],"monthsShort":["янр","фев","мар","апр","май","юни","юли","авг","сеп","окт","ное","дек"],"weekdaysFull":["неделя","понеделник","вторник","сряда","четвъртък","петък","събота"],"weekdaysShort":["нд","пн","вт","ср","чт","пт","сб"],"today":"днес","clear":"изтривам","firstDay":1,"format":"d mmmm yyyy г.","formatSubmit":"yyyy/mm/dd"}
},{}],120:[function(require,module,exports){
module.exports={"monthsFull":["januar","februar","mart","april","maj","juni","juli","august","septembar","oktobar","novembar","decembar"],"monthsShort":["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"],"weekdaysFull":["nedjelja","ponedjeljak","utorak","srijeda","cetvrtak","petak","subota"],"weekdaysShort":["ne","po","ut","sr","če","pe","su"],"today":"danas","clear":"izbrisati","firstDay":1,"format":"dd. mmmm yyyy.","formatSubmit":"yyyy/mm/dd"}
},{}],121:[function(require,module,exports){
module.exports={"monthsFull":["Gener","Febrer","Març","Abril","Maig","juny","Juliol","Agost","Setembre","Octubre","Novembre","Desembre"],"monthsShort":["Gen","Feb","Mar","Abr","Mai","Jun","Jul","Ago","Set","Oct","Nov","Des"],"weekdaysFull":["diumenge","dilluns","dimarts","dimecres","dijous","divendres","dissabte"],"weekdaysShort":["diu","dil","dim","dmc","dij","div","dis"],"today":"avui","clear":"esborrar","close":"tancar","firstDay":1,"format":"dddd d !de mmmm !de yyyy","formatSubmit":"yyyy/mm/dd"}
},{}],122:[function(require,module,exports){
module.exports={"monthsFull":["leden","únor","březen","duben","květen","červen","červenec","srpen","září","říjen","listopad","prosinec"],"monthsShort":["led","úno","bře","dub","kvě","čer","čvc","srp","zář","říj","lis","pro"],"weekdaysFull":["neděle","pondělí","úterý","středa","čtvrtek","pátek","sobota"],"weekdaysShort":["ne","po","út","st","čt","pá","so"],"today":"dnes","clear":"vymazat","firstDay":1,"format":"d. mmmm yyyy","formatSubmit":"yyyy/mm/dd"}
},{}],123:[function(require,module,exports){
module.exports={"monthsFull":["januar","februar","marts","april","maj","juni","juli","august","september","oktober","november","december"],"monthsShort":["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"],"weekdaysFull":["søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag"],"weekdaysShort":["søn","man","tir","ons","tor","fre","lør"],"today":"i dag","clear":"slet","close":"luk","firstDay":1,"format":"d. mmmm yyyy","formatSubmit":"yyyy/mm/dd"}
},{}],124:[function(require,module,exports){
module.exports={"monthsFull":["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],"monthsShort":["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"],"weekdaysFull":["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],"weekdaysShort":["So","Mo","Di","Mi","Do","Fr","Sa"],"today":"Heute","clear":"Löschen","close":"Schließen","firstDay":1,"format":"dddd, dd. mmmm yyyy","formatSubmit":"yyyy/mm/dd"}
},{}],125:[function(require,module,exports){
module.exports={"monthsFull":["Ιανουάριος","Φεβρουάριος","Μάρτιος","Απρίλιος","Μάιος","Ιούνιος","Ιούλιος","Αύγουστος","Σεπτέμβριος","Οκτώβριος","Νοέμβριος","Δεκέμβριος"],"monthsShort":["Ιαν","Φεβ","Μαρ","Απρ","Μαι","Ιουν","Ιουλ","Αυγ","Σεπ","Οκτ","Νοε","Δεκ"],"weekdaysFull":["Κυριακή","Δευτέρα","Τρίτη","Τετάρτη","Πέμπτη","Παρασκευή","Σάββατο"],"weekdaysShort":["Κυρ","Δευ","Τρι","Τετ","Πεμ","Παρ","Σαβ"],"today":"σήμερα","clear":"Διαγραφή","firstDay":1,"format":"d mmmm yyyy","formatSubmit":"yyyy/mm/dd"}
},{}],126:[function(require,module,exports){
module.exports={"monthsFull":["January","February","March","April","May","June","July","August","September","October","November","December"],"monthsShort":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],"weekdaysFull":["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],"weekdaysShort":["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],"format":"d mmmm, yyyy"}

},{}],127:[function(require,module,exports){
module.exports={"monthsFull":["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],"monthsShort":["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"],"weekdaysFull":["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],"weekdaysShort":["dom","lun","mar","mié","jue","vie","sáb"],"today":"hoy","clear":"borrar","close":"cerrar","firstDay":1,"format":"dddd d !de mmmm !de yyyy","formatSubmit":"yyyy/mm/dd"}
},{}],128:[function(require,module,exports){
module.exports={"monthsFull":["jaanuar","veebruar","märts","aprill","mai","juuni","juuli","august","september","oktoober","november","detsember"],"monthsShort":["jaan","veebr","märts","apr","mai","juuni","juuli","aug","sept","okt","nov","dets"],"weekdaysFull":["pühapäev","esmaspäev","teisipäev","kolmapäev","neljapäev","reede","laupäev"],"weekdaysShort":["püh","esm","tei","kol","nel","ree","lau"],"today":"täna","clear":"kustutama","firstDay":1,"format":"d. mmmm yyyy. a","formatSubmit":"yyyy/mm/dd"}
},{}],129:[function(require,module,exports){
module.exports={"monthsFull":["urtarrila","otsaila","martxoa","apirila","maiatza","ekaina","uztaila","abuztua","iraila","urria","azaroa","abendua"],"monthsShort":["urt","ots","mar","api","mai","eka","uzt","abu","ira","urr","aza","abe"],"weekdaysFull":["igandea","astelehena","asteartea","asteazkena","osteguna","ostirala","larunbata"],"weekdaysShort":["ig.","al.","ar.","az.","og.","or.","lr."],"today":"gaur","clear":"garbitu","firstDay":1,"format":"dddd, yyyy(e)ko mmmmren da","formatSubmit":"yyyy/mm/dd"}
},{}],130:[function(require,module,exports){
module.exports={"monthsFull":["ژانویه","فوریه","مارس","آوریل","مه","ژوئن","ژوئیه","اوت","سپتامبر","اکتبر","نوامبر","دسامبر"],"monthsShort":["ژانویه","فوریه","مارس","آوریل","مه","ژوئن","ژوئیه","اوت","سپتامبر","اکتبر","نوامبر","دسامبر"],"weekdaysFull":["یکشنبه","دوشنبه","سه شنبه","چهارشنبه","پنجشنبه","جمعه","شنبه"],"weekdaysShort":["یکشنبه","دوشنبه","سه شنبه","چهارشنبه","پنجشنبه","جمعه","شنبه"],"today":"امروز","clear":"پاک کردن","close":"بستن","format":"yyyy mmmm dd","formatSubmit":"yyyy/mm/dd","labelMonthNext":"ماه بعدی","labelMonthPrev":"ماه قبلی"}
},{}],131:[function(require,module,exports){
module.exports={"monthsFull":["tammikuu","helmikuu","maaliskuu","huhtikuu","toukokuu","kesäkuu","heinäkuu","elokuu","syyskuu","lokakuu","marraskuu","joulukuu"],"monthsShort":["tammi","helmi","maalis","huhti","touko","kesä","heinä","elo","syys","loka","marras","joulu"],"weekdaysFull":["sunnuntai","maanantai","tiistai","keskiviikko","torstai","perjantai","lauantai"],"weekdaysShort":["su","ma","ti","ke","to","pe","la"],"today":"tänään","clear":"tyhjennä","firstDay":1,"format":"d.m.yyyy","formatSubmit":"yyyy/mm/dd"}
},{}],132:[function(require,module,exports){
module.exports={"monthsFull":["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],"monthsShort":["Jan","Fev","Mar","Avr","Mai","Juin","Juil","Aou","Sep","Oct","Nov","Dec"],"weekdaysFull":["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"],"weekdaysShort":["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"],"today":"Aujourd'hui","clear":"Effacer","close":"Fermer","firstDay":1,"format":"dd mmmm yyyy","formatSubmit":"yyyy/mm/dd","labelMonthNext":"Mois suivant","labelMonthPrev":"Mois précédent","labelMonthSelect":"Sélectionner un mois","labelYearSelect":"Sélectionner une année"}
},{}],133:[function(require,module,exports){
module.exports={"monthsFull":["Xaneiro","Febreiro","Marzo","Abril","Maio","Xuño","Xullo","Agosto","Setembro","Outubro","Novembro","Decembro"],"monthsShort":["xan","feb","mar","abr","mai","xun","xul","ago","sep","out","nov","dec"],"weekdaysFull":["domingo","luns","martes","mércores","xoves","venres","sábado"],"weekdaysShort":["dom","lun","mar","mér","xov","ven","sab"],"today":"hoxe","clear":"borrar","firstDay":1,"format":"dddd d !de mmmm !de yyyy","formatSubmit":"yyyy/mm/dd"}
},{}],134:[function(require,module,exports){
module.exports={"monthsFull":["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"],"monthsShort":["ינו","פבר","מרץ","אפר","מאי","יונ","יול","אוג","ספט","אוק","נוב","דצמ"],"weekdaysFull":["יום ראשון","יום שני","יום שלישי","יום רביעי","יום חמישי","יום ששי","יום שבת"],"weekdaysShort":["א","ב","ג","ד","ה","ו","ש"],"today":"היום","clear":"למחוק","format":"yyyy mmmmב d dddd","formatSubmit":"yyyy/mm/dd"}
},{}],135:[function(require,module,exports){
module.exports={"monthsFull":["जनवरी","फरवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितम्बर","अक्टूबर","नवम्बर","दिसम्बर"],"monthsShort":["जन","फर","मार्च","अप्रैल","मई","जून","जु","अग","सित","अक्टू","नव","दिस"],"weekdaysFull":["रविवार","सोमवार","मंगलवार","बुधवार","गुरुवार","शुक्रवार","शनिवार"],"weekdaysShort":["रवि","सोम","मंगल","बुध","गुरु","शुक्र","शनि"],"today":"आज की तारीख चयन करें","clear":"चुनी हुई तारीख को मिटाएँ","close":"विंडो बंद करे","firstDay":1,"format":"dd/mm/yyyy","formatSubmit":"yyyy/mm/dd","labelMonthNext":"अगले माह का चयन करें","labelMonthPrev":"पिछले माह का चयन करें","labelMonthSelect":"किसि एक महीने का चयन करें","labelYearSelect":"किसि एक वर्ष का चयन करें"}
},{}],136:[function(require,module,exports){
module.exports={"monthsFull":["sijećanj","veljača","ožujak","travanj","svibanj","lipanj","srpanj","kolovoz","rujan","listopad","studeni","prosinac"],"monthsShort":["sij","velj","ožu","tra","svi","lip","srp","kol","ruj","lis","stu","pro"],"weekdaysFull":["nedjelja","ponedjeljak","utorak","srijeda","četvrtak","petak","subota"],"weekdaysShort":["ned","pon","uto","sri","čet","pet","sub"],"today":"danas","clear":"izbrisati","firstDay":1,"format":"d. mmmm yyyy.","formatSubmit":"yyyy/mm/dd"}
},{}],137:[function(require,module,exports){
module.exports={"monthsFull":["január","február","március","április","május","június","július","augusztus","szeptember","október","november","december"],"monthsShort":["jan","febr","márc","ápr","máj","jún","júl","aug","szept","okt","nov","dec"],"weekdaysFull":["vasárnap","hétfő","kedd","szerda","csütörtök","péntek","szombat"],"weekdaysShort":["V","H","K","SZe","CS","P","SZo"],"today":"Ma","clear":"Törlés","firstDay":1,"format":"yyyy. mmmm dd.","formatSubmit":"yyyy/mm/dd"}
},{}],138:[function(require,module,exports){
module.exports={"monthsFull":["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"],"monthsShort":["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"],"weekdaysFull":["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"],"weekdaysShort":["Min","Sen","Sel","Rab","Kam","Jum","Sab"],"today":"hari ini","clear":"menghapus","firstDay":1,"format":"d mmmm yyyy","formatSubmit":"yyyy/mm/dd"}
},{}],139:[function(require,module,exports){
module.exports = {
  'bg-BG': require('./bg-BG'),
  'bs-BA': require('./bs-BA'),
  'ca-ES': require('./ca-ES'),
  'cs-CZ': require('./cs-CZ'),
  'da-DK': require('./da-DK'),
  'de-DE': require('./de-DE'),
  'el-GR': require('./el-GR'),
  'en-US': require('./en-US'),
  'es-ES': require('./es-ES'),
  'et-EE': require('./et-EE'),
  'eu-ES': require('./eu-ES'),
  'fa-ir': require('./fa-ir'),
  'fi-FI': require('./fi-FI'),
  'fr-FR': require('./fr-FR'),
  'gl-ES': require('./gl-ES'),
  'he-IL': require('./he-IL'),
  'hi-IN': require('./hi-IN'),
  'hr-HR': require('./hr-HR'),
  'hu-HU': require('./hu-HU'),
  'id-ID': require('./id-ID'),
  'is-IS': require('./is-IS'),
  'it-IT': require('./it-IT'),
  'ja-JP': require('./ja-JP'),
  'ko-KR': require('./ko-KR'),
  'lt-LT': require('./lt-LT'),
  'lv-LV': require('./lv-LV'),
  'nb-NO': require('./nb-NO'),
  'ne-NP': require('./ne-NP'),
  'nl-NL': require('./nl-NL'),
  'pl-PL': require('./pl-PL'),
  'pt-BR': require('./pt-BR'),
  'pt-PT': require('./pt-PT'),
  'ro-RO': require('./ro-RO'),
  'ru-RU': require('./ru-RU'),
  'sk-SK': require('./sk-SK'),
  'sl-SI': require('./sl-SI'),
  'sv-SE': require('./sv-SE'),
  'th-TH': require('./th-TH'),
  'tr-TR': require('./tr-TR'),
  'uk-UA': require('./uk-UA'),
  'vi-VN': require('./vi-VN'),
  'zh-CN': require('./zh-CN'),
  'zh-TW': require('./zh-TW')
};

},{"./bg-BG":119,"./bs-BA":120,"./ca-ES":121,"./cs-CZ":122,"./da-DK":123,"./de-DE":124,"./el-GR":125,"./en-US":126,"./es-ES":127,"./et-EE":128,"./eu-ES":129,"./fa-ir":130,"./fi-FI":131,"./fr-FR":132,"./gl-ES":133,"./he-IL":134,"./hi-IN":135,"./hr-HR":136,"./hu-HU":137,"./id-ID":138,"./is-IS":140,"./it-IT":141,"./ja-JP":142,"./ko-KR":143,"./lt-LT":144,"./lv-LV":145,"./nb-NO":146,"./ne-NP":147,"./nl-NL":148,"./pl-PL":149,"./pt-BR":150,"./pt-PT":151,"./ro-RO":152,"./ru-RU":153,"./sk-SK":154,"./sl-SI":155,"./sv-SE":156,"./th-TH":157,"./tr-TR":158,"./uk-UA":159,"./vi-VN":160,"./zh-CN":161,"./zh-TW":162}],140:[function(require,module,exports){
module.exports={"monthsFull":["janúar","febrúar","mars","apríl","maí","júní","júlí","ágúst","september","október","nóvember","desember"],"monthsShort":["jan","feb","mar","apr","maí","jún","júl","ágú","sep","okt","nóv","des"],"weekdaysFull":["sunnudagur","mánudagur","þriðjudagur","miðvikudagur","fimmtudagur","föstudagur","laugardagur"],"weekdaysShort":["sun","mán","þri","mið","fim","fös","lau"],"today":"Í dag","clear":"Hreinsa","firstDay":1,"format":"dd. mmmm yyyy","formatSubmit":"yyyy/mm/dd"}
},{}],141:[function(require,module,exports){
module.exports={"monthsFull":["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"],"monthsShort":["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"],"weekdaysFull":["domenica","lunedì","martedì","mercoledì","giovedì","venerdì","sabato"],"weekdaysShort":["dom","lun","mar","mer","gio","ven","sab"],"today":"Oggi","clear":"Cancella","close":"Chiudi","firstDay":1,"format":"dddd d mmmm yyyy","formatSubmit":"yyyy/mm/dd","labelMonthNext":"Mese successivo","labelMonthPrev":"Mese precedente","labelMonthSelect":"Seleziona un mese","labelYearSelect":"Seleziona un anno"}
},{}],142:[function(require,module,exports){
module.exports={"monthsFull":["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],"monthsShort":["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],"weekdaysFull":["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"],"weekdaysShort":["日","月","火","水","木","金","土"],"today":"今日","clear":"消去","firstDay":1,"format":"yyyy mm dd","formatSubmit":"yyyy/mm/dd"}
},{}],143:[function(require,module,exports){
module.exports={"monthsFull":["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],"monthsShort":["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],"weekdaysFull":["일요일","월요일","화요일","수요일","목요일","금요일","토요일"],"weekdaysShort":["일","월","화","수","목","금","토"],"today":"오늘","clear":"취소","firstDay":1,"format":"yyyy 년 mm 월 dd 일","formatSubmit":"yyyy/mm/dd"}
},{}],144:[function(require,module,exports){
module.exports={"labelMonthNext":"Sekantis mėnuo","labelMonthPrev":"Ankstesnis mėnuo","labelMonthSelect":"Pasirinkite mėnesį","labelYearSelect":"Pasirinkite metus","monthsFull":["Sausis","Vasaris","Kovas","Balandis","Gegužė","Birželis","Liepa","Rugpjūtis","Rugsėjis","Spalis","Lapkritis","Gruodis"],"monthsShort":["Sau","Vas","Kov","Bal","Geg","Bir","Lie","Rgp","Rgs","Spa","Lap","Grd"],"weekdaysFull":["Sekmadienis","Pirmadienis","Antradienis","Trečiadienis","Ketvirtadienis","Penktadienis","Šeštadienis"],"weekdaysShort":["Sk","Pr","An","Tr","Kt","Pn","Št"],"today":"Šiandien","clear":"Išvalyti","close":"Uždaryti","firstDay":1,"format":"yyyy-mm-dd","formatSubmit":"yyyy/mm/dd"}
},{}],145:[function(require,module,exports){
module.exports={"monthsFull":["Janvāris","Februāris","Marts","Aprīlis","Maijs","Jūnijs","Jūlijs","Augusts","Septembris","Oktobris","Novembris","Decembris"],"monthsShort":["Jan","Feb","Mar","Apr","Mai","Jūn","Jūl","Aug","Sep","Okt","Nov","Dec"],"weekdaysFull":["Svētdiena","Pirmdiena","Otrdiena","Trešdiena","Ceturtdiena","Piektdiena","Sestdiena"],"weekdaysShort":["Sv","P","O","T","C","Pk","S"],"today":"Šodiena","clear":"Atcelt","firstDay":1,"format":"yyyy.mm.dd. dddd","formatSubmit":"yyyy/mm/dd"}
},{}],146:[function(require,module,exports){
module.exports={"monthsFull":["januar","februar","mars","april","mai","juni","juli","august","september","oktober","november","desember"],"monthsShort":["jan","feb","mar","apr","mai","jun","jul","aug","sep","okt","nov","des"],"weekdaysFull":["søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag"],"weekdaysShort":["søn","man","tir","ons","tor","fre","lør"],"today":"i dag","clear":"nullstill","close":"lukk","firstDay":1,"format":"dd. mmm. yyyy","formatSubmit":"yyyy/mm/dd"}
},{}],147:[function(require,module,exports){
module.exports={"monthsFull":["जनवरी","फेब्रुअरी","मार्च","अप्रिल","मे","जुन","जुलाई","अगस्त","सेप्टेम्बर","अक्टोबर","नोवेम्बर","डिसेम्बर"],"monthsShort":["जन","फेब्रु","मार्च","अप्रिल","मे","जुन","जुल","अग","सेप्टे","अक्टो","नोभे","डिसे"],"weekdaysFull":["सोमबार","मङ्लबार","बुधबार","बिहीबार","शुक्रबार","शनिबार","आईतबार"],"weekdaysShort":["सोम","मंगल्","बुध","बिही","शुक्र","शनि","आईत"],"numbers":["०","१","२","३","४","५","६","७","८","९"],"today":"आज","clear":"मेटाउनुहोस्","format":"dddd, dd mmmm, yyyy","formatSubmit":"yyyy/mm/dd"}
},{}],148:[function(require,module,exports){
module.exports={"monthsFull":["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"],"monthsShort":["jan","feb","maa","apr","mei","jun","jul","aug","sep","okt","nov","dec"],"weekdaysFull":["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],"weekdaysShort":["zo","ma","di","wo","do","vr","za"],"today":"vandaag","clear":"verwijderen","close":"sluiten","firstDay":1,"format":"dddd d mmmm yyyy","formatSubmit":"yyyy/mm/dd"}
},{}],149:[function(require,module,exports){
module.exports={"monthsFull":["styczeń","luty","marzec","kwiecień","maj","czerwiec","lipiec","sierpień","wrzesień","październik","listopad","grudzień"],"monthsShort":["sty","lut","mar","kwi","maj","cze","lip","sie","wrz","paź","lis","gru"],"weekdaysFull":["niedziela","poniedziałek","wtorek","środa","czwartek","piątek","sobota"],"weekdaysShort":["niedz.","pn.","wt.","śr.","cz.","pt.","sob."],"today":"Dzisiaj","clear":"Usuń","close":"Zamknij","firstDay":1,"format":"d mmmm yyyy","formatSubmit":"yyyy/mm/dd"}
},{}],150:[function(require,module,exports){
module.exports={"monthsFull":["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"],"monthsShort":["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"],"weekdaysFull":["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"],"weekdaysShort":["dom","seg","ter","qua","qui","sex","sab"],"today":"hoje","clear":"limpar","close":"fechar","format":"dddd, d !de mmmm !de yyyy","formatSubmit":"yyyy/mm/dd"}
},{}],151:[function(require,module,exports){
module.exports={"monthsFull":["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],"monthsShort":["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"],"weekdaysFull":["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"],"weekdaysShort":["dom","seg","ter","qua","qui","sex","sab"],"today":"Hoje","clear":"Limpar","close":"Fechar","format":"d !de mmmm !de yyyy","formatSubmit":"yyyy/mm/dd"}
},{}],152:[function(require,module,exports){
module.exports={"monthsFull":["ianuarie","februarie","martie","aprilie","mai","iunie","iulie","august","septembrie","octombrie","noiembrie","decembrie"],"monthsShort":["ian","feb","mar","apr","mai","iun","iul","aug","sep","oct","noi","dec"],"weekdaysFull":["duminică","luni","marţi","miercuri","joi","vineri","sâmbătă"],"weekdaysShort":["D","L","Ma","Mi","J","V","S"],"today":"azi","clear":"șterge","firstDay":1,"format":"dd mmmm yyyy","formatSubmit":"yyyy/mm/dd"}
},{}],153:[function(require,module,exports){
module.exports={"monthsFull":["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"],"monthsShort":["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"],"weekdaysFull":["воскресенье","понедельник","вторник","среда","четверг","пятница","суббота"],"weekdaysShort":["вс","пн","вт","ср","чт","пт","сб"],"today":"сегодня","clear":"удалить","close":"закрыть","firstDay":1,"format":"d mmmm yyyy г.","formatSubmit":"yyyy/mm/dd"}
},{}],154:[function(require,module,exports){
module.exports={"monthsFull":["január","február","marec","apríl","máj","jún","júl","august","september","október","november","december"],"monthsShort":["jan","feb","mar","apr","máj","jún","júl","aug","sep","okt","nov","dec"],"weekdaysFull":["nedeľa","pondelok","utorok","streda","štvrtok","piatok","sobota"],"weekdaysShort":["Ne","Po","Ut","St","Št","Pi","So"],"today":"dnes","clear":"vymazať","close":"zavrieť","firstDay":1,"format":"d. mmmm yyyy","formatSubmit":"yyyy/mm/dd"}
},{}],155:[function(require,module,exports){
module.exports={"monthsFull":["januar","februar","marec","april","maj","junij","julij","avgust","september","oktober","november","december"],"monthsShort":["jan","feb","mar","apr","maj","jun","jul","avg","sep","okt","nov","dec"],"weekdaysFull":["nedelja","ponedeljek","torek","sreda","četrtek","petek","sobota"],"weekdaysShort":["ned","pon","tor","sre","čet","pet","sob"],"today":"danes","clear":"izbriši","close":"zapri","firstDay":1,"format":"d. mmmm yyyy","formatSubmit":"yyyy/mm/dd"}
},{}],156:[function(require,module,exports){
module.exports={"monthsFull":["januari","februari","mars","april","maj","juni","juli","augusti","september","oktober","november","december"],"monthsShort":["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"],"weekdaysFull":["söndag","måndag","tisdag","onsdag","torsdag","fredag","lördag"],"weekdaysShort":["sön","mån","tis","ons","tor","fre","lör"],"today":"Idag","clear":"Rensa","close":"Stäng","firstDay":1,"format":"yyyy-mm-dd","formatSubmit":"yyyy/mm/dd","labelMonthNext":"Nästa månad","labelMonthPrev":"Föregående månad","labelMonthSelect":"Välj månad","labelYearSelect":"Välj år"}
},{}],157:[function(require,module,exports){
module.exports={"monthsFull":["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"],"monthsShort":["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."],"weekdaysFull":["อาทติย","จันทร","องัคาร","พุธ","พฤหสั บดี","ศกุร","เสาร"],"weekdaysShort":["อ.","จ.","อ.","พ.","พฤ.","ศ.","ส."],"today":"วันนี้","clear":"ลบ","format":"d mmmm yyyy","formatSubmit":"yyyy/mm/dd"}
},{}],158:[function(require,module,exports){
module.exports={"monthsFull":["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"],"monthsShort":["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"],"weekdaysFull":["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"],"weekdaysShort":["Pzr","Pzt","Sal","Çrş","Prş","Cum","Cmt"],"today":"Bugün","clear":"Sil","close":"Kapat","firstDay":1,"format":"dd mmmm yyyy dddd","formatSubmit":"yyyy/mm/dd"}
},{}],159:[function(require,module,exports){
module.exports={"monthsFull":["січень","лютий","березень","квітень","травень","червень","липень","серпень","вересень","жовтень","листопад","грудень"],"monthsShort":["січ","лют","бер","кві","тра","чер","лип","сер","вер","жов","лис","гру"],"weekdaysFull":["неділя","понеділок","вівторок","середа","четвер","п‘ятниця","субота"],"weekdaysShort":["нд","пн","вт","ср","чт","пт","сб"],"today":"сьогодні","clear":"викреслити","firstDay":1,"format":"dd mmmm yyyy p.","formatSubmit":"yyyy/mm/dd"}
},{}],160:[function(require,module,exports){
module.exports={"monthsFull":["Tháng Một","Tháng Hai","Tháng Ba","Tháng Tư","Tháng Năm","Tháng Sáu","Tháng Bảy","Tháng Tám","Tháng Chín","Tháng Mười","Tháng Mười Một","Tháng Mười Hai"],"monthsShort":["Một","Hai","Ba","Tư","Năm","Sáu","Bảy","Tám","Chín","Mưới","Mười Một","Mười Hai"],"weekdaysFull":["Chủ Nhật","Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy"],"weekdaysShort":["C.Nhật","T.Hai","T.Ba","T.Tư","T.Năm","T.Sáu","T.Bảy"],"today":"Hôm Nay","clear":"Xoá","firstDay":1}
},{}],161:[function(require,module,exports){
module.exports={"monthsFull":["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],"monthsShort":["一","二","三","四","五","六","七","八","九","十","十一","十二"],"weekdaysFull":["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],"weekdaysShort":["日","一","二","三","四","五","六"],"today":"今日","clear":"清除","close":"关闭","firstDay":1,"format":"yyyy 年 mm 月 dd 日","formatSubmit":"yyyy/mm/dd"}
},{}],162:[function(require,module,exports){
module.exports={"monthsFull":["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],"monthsShort":["一","二","三","四","五","六","七","八","九","十","十一","十二"],"weekdaysFull":["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],"weekdaysShort":["日","一","二","三","四","五","六"],"today":"今天","clear":"清除","close":"关闭","firstDay":1,"format":"yyyy 年 mm 月 dd 日","formatSubmit":"yyyy/mm/dd"}
},{}],163:[function(require,module,exports){
var h = require('mercury').h;
var buildStyle = require('../build-style');

var styles = {
  picker: buildStyle({}, ['pickerSelector']),
  pickerLink: buildStyle({}, ['pickerLabel']),
  select: buildStyle({}, ['otSelect']),
  option: buildStyle()
};

function option(count) {
  return h('option', {
    value: count,
    style: styles.option
  }, count + ' people');
}

module.exports = function dtpPickerForm(state) {
  var options = [1, 2, 3].map(option);

  return h('div', {
      style: styles.picker
    }, [
      h('a', {
        style: styles.pickerLink
      }, state.viewModel.partySize + ' people'),

      h('select', {
        style: styles.select
      }, options)
    ]
  );
}

},{"../build-style":115,"mercury":4}],164:[function(require,module,exports){
var h = require('mercury').h;
var partySizePicker = require('./party-size-picker');
var datePicker = require('./date-picker');
var buildStyle = require('../build-style');

module.exports = function dtpPickerForm(state) {
  return h('form', {
    style: buildStyle({
      height: '3em',
      width: '59.5em',
    })
  }, [
    partySizePicker(state),
    datePicker(state)
  ]);
}

},{"../build-style":115,"./date-picker":117,"./party-size-picker":163,"mercury":4}],165:[function(require,module,exports){
var hg = require('mercury');
var pickerForm = require('./components/picker-form');
var utils = require('./utils');
var merge = require('ramda/src/merge');

var now = new Date();
var currentDay = now.getDay();
var currentMonth = now.getMonth();
var currentYear = now.getFullYear();
var generateMonth = utils.generateMonthFactory(currentDay, currentMonth, currentYear);

var h = hg.h;

function setMonth(collection, month, year) {
  collection[year] = collection[currentYear] || {};
  collection[year][month] = generateMonth(month, year);
}

function buildInitialViewModel(opts) {

  var initialViewModel = {
    autocompletePlaceholder: 'Location or Restaurant',
    date: '2015-10-10',
    open: hg.value(true),
    isDatePickerTop: hg.value(opts.isElementInBottomHalf || 'false'),
    isElementInBottomHalf: hg.value(opts.isElementInBottomHalf || 'false'),
    displayedDate: hg.struct({
      month: hg.value(currentMonth),
      year: hg.value(currentYear)
    }),
    findATable: 'Find a Table',
    // locale: 'en-US',
    // language: 'en',
    locale: 'ja-JP',
    language: 'ja',
    partySize: 2,
    partySizeLargerParty: 'Larger party',
    partySizePlural: '2 people',
    partySizeSingular: '1 person',
    // should be the index of the td highlighted by the user's mouse
    highlightedDayIndex: hg.value(null),
    selectedDate: hg.struct({
      isSelected: hg.value(true),
      year: hg.value(2015),
      month: hg.value(currentMonth),
      day: hg.value(currentDay)
    }),
    showLargerParty: true,
    showSearch: false,
    time: '23:30',
    timeOptions: [{ value: '23:30', displayValue: '23:30' }],
    timezoneOffset: -420,
    years: {}
  };

  setMonth(initialViewModel.years, currentMonth, currentYear);
  return initialViewModel;
}

function nextMonth(state) {
  var nextDate = utils.getNextDate(state.viewModel.displayedDate.month(), state.viewModel.displayedDate.year());
  setMonth(state.viewModel.years, nextDate.month, nextDate.year);
  state.viewModel.displayedDate.set(nextDate);
}

function lastMonth(state) {
  var lastDate = utils.getLastDate(state.viewModel.displayedDate.month(), state.viewModel.displayedDate.year());
  setMonth(state.viewModel.years, lastDate.month, lastDate.year);
  state.viewModel.displayedDate.set(lastDate);
}

function mouseoutDay(state, dayIndex) {
  state.viewModel.highlightedDayIndex.set(null);
}

function mouseoverDay(state, dayIndex) {
  state.viewModel.highlightedDayIndex.set(dayIndex);
}

function toggleDatePicker(state) {
  if (!state.viewModel.open()) {
    state.viewModel.isDatePickerTop.set(state.viewModel.isElementInBottomHalf());
  }
  state.viewModel.open.set(!state.viewModel.open());
}

function relativePositionChange(state, isElementInBottomHalf) {
  state.viewModel.isElementInBottomHalf.set(isElementInBottomHalf);
}

function getInitialAppState(opts) {
  return hg.state({
    viewModel: hg.struct(buildInitialViewModel(opts)),
    channels: {
      relativePositionChange: relativePositionChange,
      mouseoverDay: mouseoverDay,
      mouseoutDay: mouseoutDay,
      toggleDatePicker: toggleDatePicker,
      // resizeViewport: resizeViewport,
      // scroll: scroll,
      nextMonth: nextMonth,
      lastMonth: lastMonth
    }
  });
}

function render(state) {
  return pickerForm(state);
}

var additionalEvents = ['mouseover', 'mouseout'];

function app(elem, observ, render, opts) {
  if (!elem) {
    throw new Error(
      'Element does not exist. ' +
      'Mercury cannot be initialized.');
  }

  var delegator = hg.Delegator(opts);
  for (i = 0; i < additionalEvents.length; i++) {
    delegator.listenTo(additionalEvents[i]);
  }

  var loop = hg.main(observ(), render, merge({
    diff: hg.diff,
    create: hg.create,
    patch: hg.patch
  }, opts));

  elem.appendChild(loop.target);

  return observ(loop.update);
}

function getPosition(element) {
  var xPosition = 0;
  var yPosition = 0;

  while(element) {
    xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
    yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
    element = element.offsetParent;
  }
  return { x: xPosition, y: yPosition };
}

function getViewportDimensions() {
  var elem = (document.compatMode === "CSS1Compat") ?
    document.documentElement :
    document.body;

  return {
    height: elem.clientHeight,
    width: elem.clientWidth
  };
}

function getPageOffset() {
  var supportPageOffset = window.pageXOffset !== undefined;
  var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");

  var x = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
  var y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

  return { x: x, y: y };
}

function getIsElementInBottomHalf(el) {
  var viewportDimensions = getViewportDimensions();
  var position = getPosition(el);
  var pageOffset = getPageOffset();

  return position.y > viewportDimensions.height / 2;
}

module.exports = {
  render: function(selector) {
    var el = document.querySelector(selector);

    var isElementInBottomHalf = getIsElementInBottomHalf(el);

    var opts = {
      isElementInBottomHalf: isElementInBottomHalf,
    };
    var state = getInitialAppState(opts);

    var timer;
    window.onscroll = function() {
      if(timer) {
        window.clearTimeout(timer);
      }

      timer = window.setTimeout(function() {
        relativePositionChange(state, getIsElementInBottomHalf(el));
      }, 100);
    };

    window.onresize = function() {
      if(timer) {
        window.clearTimeout(timer);
      }

      timer = window.setTimeout(function() {
        relativePositionChange(state, getIsElementInBottomHalf(el));
      }, 100);
    };

//     window.addEventListener("optimizedScroll", function() {
//       pageOffset = getPageOffset();
//       console.log('loc1', pageOffset.y);
//       state.viewModel.pageOffsetY.set(pageOffset.y);
//     });

    app(el, state, render);
  }
};

// <% var extraCssClass = showSearch ? " with-search" : ""; %>
// <div class="dtp-picker hide dtp-lang-<%- language + extraCssClass %>">
//   <form class="dtp-picker-form">
//     <% if (timezoneOffset != null) %>
//       <input type="hidden" name="timezoneOffset"/>
//     <% } %>
//     <input type="text" class="date-picker dtp-picker-selector"/>
//     <select class="time-picker hide">
//       <% for (var i = 1; i < (showLargerParty ? 22 : 21); i++) { %>
//         <% isSelected = i === partySize; %>
//         <% var displayValue = partySizePlural.replace('{0}', i); %>

//         <% if (i === 1) { %>
//           <% displayValue = partySizeSingular.replace('{0}', i); %>
//         <% } else if(i === 21)  { %>
//           <% displayValue = partySizeLargerParty; %>
//         <% } %>

//         <% if(isSelected) %>
//           <option value=<%- i %> selected="selected"> <option>
//         <% else %>
//           <option value=<%- i %>> <%- displayValue %> <option>
//         <% } %>
//       <% } %>
//       <!-- incomplete -->
//     </select>
//     <input type="submit" class="button dtp-picker-button"/>
//   </form>
// </div>


/**
 * Dtp - binds actions to events and sets the proper js to style menus
 *
 */

// OT.createNS('OT.Common.Dtp');

// OT.Common.Dtp = (function($, _, moment){
//   'use strict';

//   var selectors = {
//     partySizePicker: '.party-size-picker',
//     timePicker: '.time-picker',
//     datePicker: '.date-picker',
//     searchText: '.dtp-picker-search',
//     dtpForm: '.dtp-picker-form',
//     timezoneOffset: 'input[name="timezoneOffset"]'
//   };

//   var DTP_COOKIE_IDENTIFIER = "OT_dtp_values",
//       DTP_COOKIE_MAXAGE = 365*24*60*60*1000;

//   var tabIndexCounter = 0,
//       _validateDateTime = true,
//       _shouldEmitChangedEvent = true;

//   var cookies = {
//     get: function(key){
//       var cookied = OT.Common.Cookies.get(DTP_COOKIE_IDENTIFIER);
//       return typeof(key) === 'string' ? ((!!cookied && !!cookied[key]) ? cookied[key] : undefined): cookied;
//     },
//     set: function(values){
//       var cookiedValues = {};
//       cookiedValues[DTP_COOKIE_IDENTIFIER] = _.pick(values, 'covers', 'datetime');

//       return OT.Common.Cookies.set(cookiedValues, DTP_COOKIE_MAXAGE);
//     }
//   };

//   var getMetroOffset = function($dtp){
//     var metroOffset = 0,
//         $dtpOffset = $dtp ? $dtp.find(selectors.timezoneOffset) : [];

//     if($dtpOffset.length > 0){
//       metroOffset = $dtpOffset.val();
//     } else if(!!pageData && pageData.headerTimezoneOffset){
//       metroOffset = pageData.headerTimezoneOffset;
//     }

//     return metroOffset;
//   };

//   var getMetroDateTime = function($dtp){
//     return moment().utc().add(getMetroOffset($dtp), 'm');
//   };

//   var setTabIndexes = function(inputs, startIndex){
//     inputs.partySizePicker.attr("tabindex", startIndex + 1);
//     inputs.datePicker.attr("tabindex", startIndex + 2);
//     inputs.timePicker.attr("tabindex", startIndex + 3);
//     inputs.searchText.attr("tabindex", startIndex + 4);
//     inputs.searchButton.attr("tabindex", startIndex + 5);

//     return startIndex + 5;
//   };

//   var setHighlighting = function(formInputs, labelInputs){

//     var highlightOnFocus = function($formInput, $labelInput){
//       $formInput.focus(function(){
//         $labelInput.addClass('highlighted');
//       });
//     };

//     var unhighlightOnBlur = function($formInput, $labelInput){
//       $formInput.blur(function(){
//         $labelInput.removeClass('highlighted');
//       });
//     };

//     _.forEach(labelInputs, function($labelInput, key){
//       highlightOnFocus(formInputs[key], $labelInput);
//       unhighlightOnBlur(formInputs[key], $labelInput);
//     });
//   };

//   var dtp = {
//     init: function(dtpSelector){

//       $(dtpSelector).each(function(){

//         var $dtp = $(this);

//         // ensure the dtp is hidden before rendering it
//         $dtp.addClass("hide");

//         // inits and renders all the components
//         var metroDateTime = getMetroDateTime($dtp),
//             minDate = OT.Common.Helpers.getMinimumDate(metroDateTime),
//             $timePicker = $dtp.find(selectors.timePicker).OTselect("init"),
//             $partySizePicker = $dtp.find(selectors.partySizePicker).OTselect("init"),
//             $datepicker = $dtp.find(selectors.datePicker).OTdatepicker("init", minDate),
//             $searchText = $dtp.find(selectors.searchText),
//             $form = $dtp.find(selectors.dtpForm),
//             dateTimeValidator = new OT.Common.Helpers.dateTimeValidator();

//         var selectInitValueFor = {
//           covers: function(){

//             var isValid = function(val){
//               return !!val && val<=21 && val>0;
//             };

//             var valueWasSupplied = !$partySizePicker.OTselect("info").unselectedOnInit,
//                 suppliedValue = valueWasSupplied ? $partySizePicker.OTselect("get") : null,
//                 defaultValue = 2;

//             if(!isValid(suppliedValue)){
//               var cookiedValue = cookies.get('covers'),
//                   coversValue = isValid(cookiedValue) ? cookiedValue : defaultValue;

//               $partySizePicker.OTselect("select", coversValue);
//             }
//           },
//           dateTime: function(){

//             var metroDateTime = getMetroDateTime($dtp),
//                 metroDate = metroDateTime.format("YYYY-MM-DD"),
//                 metroTime = metroDateTime.format("HH:mm");

//             var isValid = function(date, time){
//               if(!date || !time){
//                 return false;
//               }

//               var validated = dateTimeValidator.get(date, time, metroDate, metroTime);

//               return validated.date === date && validated.time === time;
//             };

//             var suppliedValue = {
//               time: $timePicker.OTselect("info").unselectedOnInit ? null : $timePicker.OTselect("get"),
//               date: $datepicker.OTdatepicker("getOriginalValue")
//             };

//             var setValues = (function(originalDate, originalTime){
//               return function(newValues){
//                 if(originalDate !== newValues.date){
//                   $datepicker.OTdatepicker("set", newValues.date);
//                 }

//                 if(originalTime !== newValues.time){
//                   $timePicker.OTselect("select", newValues.time);
//                 }
//               };
//             })(suppliedValue.date, suppliedValue.time);

//             if(!isValid(suppliedValue.date, suppliedValue.time)){
//               var cookiedDateTimeValue = cookies.get('datetime'),
//                   splitted = !!cookiedDateTimeValue ? cookiedDateTimeValue.split(" ") : [],
//                   cookiedValue = splitted.length === 0 ? undefined : {
//                     date: splitted[0],
//                     time: splitted[1]
//                   };

//               if(!cookiedValue){
//                 setValues(dateTimeValidator.get(suppliedValue.date, suppliedValue.time, metroDate, metroTime));
//               } else if(isValid(cookiedValue.date, cookiedValue.time)){
//                 setValues(cookiedValue);
//               } else {
//                 setValues(dateTimeValidator.get(cookiedValue.date, cookiedValue.time, metroDate, metroTime));
//               }
//             }
//           }
//         };

//         var hidePastTimes = function(){

//           $timePicker.OTselect("showAll");

//           var metroDateTime = getMetroDateTime($dtp),
//               metroDate = metroDateTime.format("YYYY-MM-DD"),
//               metroTime = metroDateTime.format("HH:mm"),
//               currentDate = $datepicker.OTdatepicker("get", 'yyyy-mm-dd'),
//               availability = OT.Common.Helpers.timeSlotsAvailability(),
//               availableTimeSlots = availability.get(currentDate, metroDate, metroTime),
//               timeOptions = $timePicker.find("option");

//           for(var i = 0; i < timeOptions.length; i++){
//             var $option = $(timeOptions[i]),
//                 value = $option.attr("value");

//             if(!_.contains(availableTimeSlots, value)){
//               $timePicker.OTselect("hide", value);
//             }
//           }
//         };

//         var fixDateTimeValues = function(callback){
//           if(!_validateDateTime){
//             return callback();
//           }

//           var metroDateTime = getMetroDateTime($dtp),
//               metroDate = metroDateTime.format("YYYY-MM-DD"),
//               metroTime = metroDateTime.format("HH:mm"),
//               currentTime = $timePicker.OTselect("get"),
//               currentDate = $datepicker.OTdatepicker("get", 'yyyy-mm-dd'),
//               validDateTime = dateTimeValidator.get(currentDate, currentTime, metroDate, metroTime);

//           if(currentDate !== validDateTime.date){
//             $datepicker.OTdatepicker("set", validDateTime.date);
//           } else if(currentTime !== validDateTime.time){
//             $timePicker.OTselect("select", validDateTime.time);
//           } else if(typeof(callback) === 'function'){
//             callback();
//           }
//         };

//         var formInputs = {
//           partySizePicker: $partySizePicker.find("select"),
//           datePicker: $datepicker.find("input"),
//           timePicker: $timePicker.find("select"),
//           searchText: $searchText,
//           searchButton: $form.find("input.button")
//         };

//         var labelInputs = {
//           partySizePicker: $partySizePicker.find("a"),
//           datePicker: $datepicker.find("a"),
//           timePicker: $timePicker.find("a"),
//           searchText: $searchText
//         };

//         // sets unique tabIndexes to the controls in order to enable switching via keyboard tabs
//         tabIndexCounter = setTabIndexes(formInputs, tabIndexCounter);

//         // binds focus/blur events to controls in order to enable label highlighting when mouse click/keyboard tab switching
//         setHighlighting(formInputs, labelInputs);

//         // sets initial values
//         selectInitValueFor.covers();
//         selectInitValueFor.dateTime();
//         hidePastTimes();

//         // Events bindings
//         var getSearchObj = function(){
//           var covers = $partySizePicker.OTselect("get"),
//               selectedTime = $timePicker.OTselect("get"),
//               selectedDate = $datepicker.OTdatepicker("get", "yyyy-mm-dd"),
//               dateTime = selectedDate + " " + selectedTime,
//               searchText = $searchText.length > 0 ? $searchText.val() : false;

//           return {
//             covers: covers,
//             datetime: dateTime,
//             searchText: searchText,
//             sender: $dtp
//           };
//         };

//         var onDTPChanged = function(){
//           if(_shouldEmitChangedEvent){
//             hidePastTimes();
//             var searchObj = getSearchObj();
//             cookies.set(searchObj);
//             OT.Events.fire("dtp:change", searchObj);
//           }
//         };

//         var searchTextValue = $searchText.length > 0 ? $searchText.val() : false;
//         $searchText.keyup(function(){
//           var newValue = $searchText.length > 0 ? $searchText.val() : false;

//           if(newValue !== searchTextValue){
//             searchTextValue = newValue;
//             onDTPChanged();
//           }
//         });

//         $form.submit(function(e){
//           e.preventDefault();
//           OT.Events.fire("dtp:search", getSearchObj());
//           return false;
//         });

//         OT.Events.on("datepicker:change", function(e, data){
//           if(data.sender.is($datepicker)){
//             fixDateTimeValues(onDTPChanged);
//           }
//         });

//         OT.Events.on("select:change", function(e, data){
//           if(data.sender.is($timePicker)){
//             fixDateTimeValues(onDTPChanged);
//           } else if(data.sender.is($partySizePicker)){
//             onDTPChanged();
//           }
//         });

//         // all done - make it visible
//         $dtp.removeClass("hide");
//         OT.Events.fire("dtp:rendered", getSearchObj());
//       });
//     },

//     set: function($dtp, obj){

//       obj = obj || {};

//       var partyChanged = false,
//           timeChanged = false,
//           dateChanged = false,
//           searchChanged = false,
//           $partySizePicker = $dtp.find(selectors.partySizePicker),
//           $datePicker = $dtp.find(selectors.datePicker),
//           $timePicker = $dtp.find(selectors.timePicker),
//           $searchText = $dtp.find(selectors.searchText),
//           fieldsChanged = 0,
//           fieldsToChange = 0;

//       if(!!obj.covers){
//         if($partySizePicker.OTselect("get").toString() !== obj.covers.toString()){
//           partyChanged = true;
//           fieldsToChange++;
//         }
//       }

//       if(!!obj.date){
//         if($datePicker.OTdatepicker("get", "yyyy-mm-dd").toString() !== obj.date.toString()){
//           dateChanged = true;
//           fieldsToChange++;
//         }
//       }

//       if(!!obj.time){
//         if($timePicker.OTselect("get").toString() !== obj.time.toString()){
//           timeChanged = true;
//           fieldsToChange++;
//         }
//       }

//       if(typeof(obj.searchText) !== 'undefined'){
//         searchChanged = true;
//         fieldsToChange++;
//       }

//       var updateChangeEventEmitterCheck = function(){
//         _shouldEmitChangedEvent = (fieldsToChange - fieldsChanged) < 2;
//       };

//       updateChangeEventEmitterCheck();

//       if(partyChanged){
//         $partySizePicker.OTselect("select", obj.covers);
//         fieldsChanged++;
//         updateChangeEventEmitterCheck();
//       }

//       if(dateChanged){
//         if(timeChanged){
//           _validateDateTime = false;
//         }
//         $datePicker.OTdatepicker("set", obj.date);
//         fieldsChanged++;
//         updateChangeEventEmitterCheck();
//       }

//       if(timeChanged){
//         _validateDateTime = true;
//         $timePicker.OTselect("showAll");
//         $timePicker.OTselect("select", obj.time);
//         fieldsChanged++;
//         updateChangeEventEmitterCheck();
//       }

//       if(searchChanged){
//         if(obj.searchText === false){
//           $searchText.val('').parent().addClass("hide").parent().removeClass("with-search");
//         } else {
//           $searchText.val(obj.searchText).parent().removeClass("hide").parent().addClass("with-search");
//         }
//         fieldsChanged++;
//         updateChangeEventEmitterCheck();
//       }
//     }
//   };

//   $.fn.OTdtp = function(action, param){

//     this.each(function(){
//       var $this = $(this);

//       if(action === "init"){
//         return dtp.init($this);
//       } else if(action === "set"){
//         return dtp.set($this, param);
//       }
//     });
//   };

//   return dtp;
// })(jQuery, _, moment);
// OT.createNS('OT.Common.DatePicker');

// OT.Common.DatePicker = (function($, moment){
//   'use strict';

//   var getLabelValue = function($dp){

//     var selectedDay = $dp.get('highlight', 'yyyy-mm-dd'),
//         today = moment().format('YYYY-MM-DD'),
//         tomorrow = moment().add(1, 'days').format('YYYY-MM-DD'),
//         isToday = (today === selectedDay),
//         isTomorrow = (tomorrow === selectedDay),
//         textLabel = $dp.get();

//     if(OT.Common.TestObject.isActive('todaytomorrow')){
//       if(isToday){
//         return OT.SRS.today;
//       } else if(isTomorrow) {
//         return OT.SRS.tomorrow;
//       }
//     }

//     return textLabel;
//   };

//   var datepicker = {
//     get: function($datepicker, optionalFormat){
//       var $datepickerInput = $datepicker.find('input'),
//           $picker = $datepickerInput.pickadate('picker');

//       if(!!optionalFormat){
//         return $picker.get('select', optionalFormat);
//       }

//       return $picker.get('select');
//     },
//     getOriginalValue: function($datepicker){
//       return $datepicker.find('input').attr('data-value');
//     },
//     init: function($datepicker, minDate){

//       var cssClass = $datepicker.attr('class'),
//           dateValue = $datepicker.val(),
//           $parent = $datepicker.parent(),
//           isJapanese = false,
//           calendarStartsSunday = (typeof(OT) !== 'undefined' && !!OT.SRS) ? !!OT.SRS.calendarStartsSunday : true;

//       var template = function(dateValue){

//         return '<div class="' + cssClass + '">' +
//                '  <a class="dtp-picker-selector-link date-label dtp-picker-label">' + dateValue + '</a>' +
//                '  <input type="text" name="datepicker" class="datepicker dtp-picker-select" data-value="' + dateValue + '" />' +
//                '</div>';
//       };

//       if(dateValue === ''){
//         dateValue = moment().format('YYYY-MM-DD');
//       }

//       $datepicker.after(template(dateValue));
//       $datepicker.remove();
//       $datepicker = $parent.find('.' + cssClass.replace(/ /g, '.'));

//       var $label = $datepicker.find('.date-label'),
//           $datePickerInput = $datepicker.find('input');

//       if(OT.SRS.lang){
//         setupLanguage(OT.SRS.lang);
//         if(OT.SRS.lang === 'ja'){
//           isJapanese = true;
//         }
//       }

//       var fixJapaneseYearMonthLabel = function(){
//         // In case of Japanese, we display Year first + 年 + month on the month's label.

//         var $headerYear = $datepicker.find('.picker__year'),
//             $headerMonth = $datepicker.find('.picker__month'),
//             $parent = $headerMonth.parent(),
//             outerHtml = function($el){ return $('<div />').append($el.clone()).html(); },
//             newHeaderContent = outerHtml($headerYear) + outerHtml($headerMonth);

//         $headerYear.remove();
//         $headerMonth.remove();
//         $parent.prepend(newHeaderContent);
//         $headerYear = $datepicker.find('.picker__year');

//         var headerYearText = $headerYear.text();

//         if(headerYearText.indexOf('年') < 0){
//           $headerYear.text(headerYearText + '年');
//         }
//       };

//       var closeDpIfOpened = function($dp){
//         if(!!$dp.get('open')){
//           $dp.close();
//         }
//       };

//       var getRenderPosition = function(){
//         var calendarHeight = 290,
//             labelHeight = $datePickerInput.height(),
//             datePickerOffset = parseInt($datepicker.offset().top, 10),
//             bodyScroll = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop,
//             $body = $('body'),
//             bodyHeight = $body.height(),
//             marginBottom = bodyScroll + bodyHeight - labelHeight - datePickerOffset,
//             marginTop = datePickerOffset - bodyScroll;

//         return marginTop < calendarHeight ? 'down' : (marginBottom >= calendarHeight ? 'down' : 'up');
//       };

//       $datePickerInput.pickadate({
//         firstDay: calendarStartsSunday ? 0 : 1,
//         min: minDate ? moment(minDate).toDate() : new Date(),
//         formatSubmit: 'yyyy-mm-dd',
//         hiddenPrefix: 'submit_',
//         hiddenSuffix: '',
//         today: '',
//         clear: '',
//         format: OT.Common.Helpers.getDateFormatJS(),
//         onStart: function () {
//           var thisDatepicker = this;
//           $label.text(getLabelValue(thisDatepicker));

//           OT.Events.on('menus:cleared', function(){
//             if($label.hasClass('picker-opening')){
//               $label.removeClass('picker-opening');
//             } else {
//               closeDpIfOpened(thisDatepicker);
//             }
//           });
//         },

//         onOpen: function(){
//           if(isJapanese){
//             fixJapaneseYearMonthLabel();
//           }

//           $label.addClass('picker-opening');
//           OT.Common.Menus.closeAllMenus();
//           $label.addClass('menu-opened');

//           var $cal = $datepicker.find('.picker'),
//               renderPosition = getRenderPosition();

//           $cal.removeClass('up').removeClass('down').addClass(renderPosition);
//         },
//         onClose: function(){
//           $label.removeClass('menu-opened');
//         },
//         onSet: function(){
//           $label.text(getLabelValue(this));
//           OT.Events.fire('datepicker:change', { sender: $datepicker });

//           if(isJapanese){
//             fixJapaneseYearMonthLabel();
//           }
//         }
//       });

//       return $datepicker;
//     },
//     refresh: function($datepicker){
//       var $datepickerInput = $datepicker.find('input');

//       if($datepickerInput.length === 0){
//         return;
//       }

//       var $dp = $datepickerInput.pickadate('picker');

//       if($dp.length === 0){
//         return;
//       }

//       var $label = $datepicker.find('.date-label');

//       if($label.length === 0){
//         return;
//       }

//       $label.text(getLabelValue($dp));
//     },
//     set: function($datepicker, value, format){
//       var $datepickerInput = $datepicker.find('input'),
//           optionalFormat = format || { format: 'yyyy-mm-dd' };

//       return $datepickerInput.pickadate('picker').set('select', value, optionalFormat);
//     }
//   };

//   var setupLanguage = function(lang){
//     if(lang === 'es'){
//       $.extend($.fn.pickadate.defaults, {
//         monthsFull: [ 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre' ],
//         monthsShort: [ 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic' ],
//         weekdaysFull: [ 'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado' ],
//         weekdaysShort: [ 'dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb' ],
//         today: 'hoy',
//         clear: 'borrar',
//         labelMonthNext: 'Mes próximo',
//         labelMonthPrev: 'Mes anterior'
//       });
//     } else if(lang === 'ja'){
//       $.extend($.fn.pickadate.defaults, {
//         monthsFull: [ '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月' ],
//         monthsShort: [ '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月' ],
//         weekdaysFull: [ '日', '月', '火', '水', '木', '金', '土' ],
//         weekdaysShort: [ '日', '月', '火', '水', '木', '金', '土' ],
//         today: '今日',
//         clear: '消去',
//         labelMonthNext: '次月',
//         labelMonthPrev: '前月'
//       });
//     } else if(lang === 'fr'){
//       $.extend($.fn.pickadate.defaults, {
//         monthsFull: [ 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre' ],
//         monthsShort: [ 'Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec' ],
//         weekdaysFull: [ 'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi' ],
//         weekdaysShort: [ 'Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam' ],
//         today: 'Aujourd\'hui',
//         clear: 'Effacer',
//         labelMonthNext: 'Mois suivant',
//         labelMonthPrev: 'Mois précédent'
//       });
//     } else if(lang === 'de'){
//       $.extend($.fn.pickadate.defaults, {
//         monthsFull: [ 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember' ],
//         monthsShort: [ 'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez' ],
//         weekdaysFull: [ 'Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag' ],
//         weekdaysShort: [ 'So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa' ],
//         today: 'Heute',
//         clear: 'Löschen',
//         labelMonthNext: 'Nächste',
//         labelMonthPrev: 'Früher'
//       });
//     }
//   };

//   $.fn.OTdatepicker = function(action, param, param2){

//     var $this = this;

//     if(action === 'init'){
//       return datepicker.init($this, param);
//     } else if(action === 'get'){
//       return datepicker.get($this, param);
//     } else if(action === 'getOriginalValue'){
//       return datepicker.getOriginalValue($this, param);
//     } else if(action === 'refresh'){
//       return datepicker.refresh($this);
//     } else if(action === 'set'){
//       return datepicker.set($this, param, param2);
//     }

//     return this;
//   };

//   return {
//     init: datepicker.init,
//     get: datepicker.get,
//     getOriginalValue: datepicker.getOriginalValue,
//     set: datepicker.set
//   };

// })(jQuery, moment);
//
//
// 'use strict';

// var moment = require('moment');
// var request = require('request');
// var _ = require('underscore');

// var languages = require('./languages');
// var offsets = require('./offsets');

// var get = {
//   date: function(dateTime){
//     return !!dateTime ? moment(dateTime).format('YYYY-MM-DD') : '';
//   },
//   localisedTime: function(time, theme, lang){
//     var dateTime = moment('2001-01-01T' + time),
//         formattedTime = dateTime.format('HH:mm');

//     return (!!theme.match('com|mx') && lang !== 'fr') ? dateTime.format('h:mm') + ' ' + dateTime.format('A') : formattedTime;
//   },
//   partySize: function(partySize, showLargerParty){
//     partySize = !!partySize ? (partySize === '20+' ? 21 : parseInt(partySize, 10)) : 0;
//     return (!showLargerParty && partySize === 21) ? 0 : partySize;
//   },
//   time: function(dateTime){
//     return !!dateTime ? moment(dateTime.replace('Z', '')).format('HH:mm') : '';
//   }
// };

// var themesAndLangs = {
//   com: ['en', 'fr'],
//   couk: ['en'],
//   de: ['de', 'en'],
//   ie: ['en'],
//   jp: ['ja', 'en'],
//   mx: ['es', 'en'],
//   au: ['en']
// };

// var cached = {};

// module.exports.data = function(context, callback){

//   var isAcceptLanguageValid = _.isArray(context.acceptLanguage) && !_.isEmpty(context.acceptLanguage) && !!context.acceptLanguage[0].code,
//       parsedLanguage = isAcceptLanguageValid ? context.acceptLanguage[0].code : '*',
//       themeArg = context.params.theme,
//       theme = (!!themeArg && _.has(themesAndLangs, themeArg)) ? themeArg : 'com',
//       langsForTheme = themesAndLangs[theme],
//       language = _.contains(langsForTheme, parsedLanguage) ? parsedLanguage : langsForTheme[0],
//       showSearch = context.params.showSearch || false,
//       cacheFlushTimeout = 10 * 60 * 1000;

//   var getTimezonesData = function(cb){
//     if(!!cached.timezones){
//       cb(null, cached.timezones);
//     } else {
//       var dataApiUrl = context.plugins.discover('oc-core-data') || undefined;

//       if(!!dataApiUrl){
//         dataApiUrl += '/oc/dtp';

//         request({
//           url: dataApiUrl,
//           timeout: 3000
//         }, function(err, res, body){
//           if(err || res.statusCode !== 200){ return cb(err, offsets); }
//           try {
//             var value = JSON.parse(body);
//             cached.timezones = value;

//             setTimeout(function(){
//               cached.timezones = null;
//             }, cacheFlushTimeout);

//             cb(null, value);
//           } catch(e){
//             cb(e, offsets);
//           }
//         });
//       } else {
//         cb('service not discovered', offsets);
//       }
//     }
//   };

//   getTimezonesData(function(err, data){

//     var offsetsForTheme = data[theme],
//         offsetsForLang = _.contains(_.keys(offsetsForTheme), language) ? offsetsForTheme[language] : offsetsForTheme[_.keys(offsetsForTheme)[0]],
//         offset = offsetsForLang.default;

//     if(!!context.params.metroId && !!offsetsForLang.exceptions && !!offsetsForLang.exceptions[context.params.metroId]){
//       offset = offsetsForLang.exceptions[context.params.metroId];
//     }

//     var __ = function(term){
//       var dictionary = languages[language];
//       return _.has(dictionary, term) ? dictionary[term] : '';
//     };

//     var searchPlaceholder = (!!showSearch && !!context.params.searchPlaceholder) ? context.params.searchPlaceholder : __('textPlaceholder'),
//         showLargerParty = context.params.showLargerParty === false ? false : true,
//         timeOptions = [];

//     for(var i = 0; i<24; i++){
//       var value = (i < 10 ? '0' : '') + i + ':00',
//           halfValue = (i < 10 ? '0' : '') + i + ':30';

//       timeOptions.push({
//         value: value,
//         displayValue: get.localisedTime(value, theme, language)
//       });

//       timeOptions.push({
//         value: halfValue,
//         displayValue: get.localisedTime(halfValue, theme, language)
//       });
//     }

//     callback(null, {
//       showSearch: context.params.showSearch || false,
//       time: get.time(context.params.dateTime),
//       date: get.date(context.params.dateTime),
//       partySize: get.partySize(context.params.partySize, showLargerParty),
//       timeOptions: timeOptions,
//       partySizeSingular: __('partySingular'),
//       partySizePlural: __('partyPlural'),
//       partySizeLargerParty: __('partyLarger'),
//       findATable: __('findATable'),
//       autocompletePlaceholder: searchPlaceholder,
//       timezoneOffset: offset,
//       language: language,
//       showLargerParty: showLargerParty
//     });
//   });
// };
//mixin partySizeDisplayValue(isSelected, i)
  // - var displayValue = partySizePlural.replace('{0}', i);
  // - if(i === 1)
  //   - displayValue = partySizeSingular.replace('{0}', i);
  // - else if(i === 21)
  //   - displayValue = partySizeLargerParty;
  // - if(isSelected)
  //   option(value=i, selected="selected") #{displayValue}
  // - else
  //   option(value=i) #{displayValue}

// - var extraCssClass = showSearch ? " with-search" : "";
// div(class="dtp-picker hide dtp-lang-" + language + extraCssClass)
  // form.dtp-picker-form
  //   - if (timezoneOffset != null)
  //     input(type="hidden", name="timezoneOffset", value=timezoneOffset)
  //   select.party-size-picker.hide
  //     - for (var i = 1; i < (showLargerParty ? 22 : 21); i++)
  //       +partySizeDisplayValue((i === partySize), i)
  //   input.date-picker.dtp-picker-selector(value=date, type="text")
  //   select.time-picker.hide
  //     - for (var i = 0; i < timeOptions.length; i++){
  //       - var displayValue = timeOptions[i]["displayValue"];
  //       - var value = timeOptions[i]["value"];
  //       - var isSelected = value === time;
  //       - if(isSelected)
  //         option(value=value, selected="selected") #{displayValue}
  //       - else
  //         option(value=value) #{displayValue}
  //     - }
  //   - if(showSearch){
  //     div.dtp-picker-search-container
  //       div.dtp-picker-search-icon.icon-search
  //       input.dtp-picker-search(type="text", name="searchText", value="", placeholder=autocompletePlaceholder, data-bind="")
  //   - }
  //   input.button.dtp-picker-button(type="submit", value=findATable)
  //
  //
  // //   /**
 // * Select - transform an html select with options to a new designed one,
 // * with styling, menus, handlers, etc.
 // *
 // */

// OT.createNS('OT.Common.Select');

// OT.Common.Select = (function($, _){
  // 'use strict';

  // var _data = {};

  // var template = function(m){

  //   var t =  '<div class="' + m.cssClass + ' dtp-picker-selector select-native'+ (m.unselectedOnInit ? " unselected-on-init" : '') +'">' +
  //            '  <a class="select-label dtp-picker-selector-link" tabindex="-1">' + m.selectedValue + '</a>' +
  //            '  <select name="' + m.name + '">';

  //   for(var i = 0; i < m.options.length; i++){
  //     var option =  m.options[i],
  //         isChecked = option.selected ? " selected=\"selected\"" : '';

  //     t += '    <option value="' + option.value + '"' + isChecked + '>' + option.display + '</option>';
  //   }

  //   t += '  </select>' +
  //        '</div>';

  //   return t;
  // };

  // var getUniqueName = function(){
  //   var c = 0,
  //       name = "Select_" + c;

  //   while($("select[name='" + name + "']").length > 0){
  //     c++;
  //     name = "Select_" + c;
  //   }

  //   return name;
  // };

  // var getSelectModel = function($select){

  //   var outerHtml = function($el){ return $("<div />").append($el.clone()).html(); },
  //       unselectedOnInit = false;

  //   var name = getUniqueName(),
  //       model = {
  //         name: name,
  //         cssClass: $select.attr("class") || "",
  //         unselectedOnInit: false,
  //         options: _.map($select.find("option"), function(option){
  //           var $option = $(option),
  //               selected = $option.prop('selected');

  //           if(!!selected && outerHtml($option).indexOf("selected") === -1){
  //             unselectedOnInit = true;
  //           }

  //           return {
  //             display: $option.text(),
  //             value: $option.val(),
  //             selected: selected
  //           };
  //         })
  //       };

  //   _data[name] = model.options;

  //   var selected = _.findWhere(model.options, { selected: true });
  //   model.selectedValue = !!selected ? selected.display : '';

  //   if(model.selectedValue === '' || unselectedOnInit){
  //     model.unselectedOnInit = true;
  //   }

  //   return model;
  // };

  // var transformSelect = function($select){
  //   $select.addClass("hide");

  //   var $parent = $select.parent(),
  //       model = getSelectModel($select);

  //   $select.after(template(model));
  //   $select.remove();

  //   var $newSelect = $parent.find("." + model.cssClass.replace(/ /g, '.')),
  //       $label = $newSelect.find(".select-label");

  //   $label.text(model.selectedValue);
  //   $newSelect.removeClass("hide");

  //   return $newSelect;
  // };

  // var select = {

  //   get: function($select){
  //     return $select.find("select").val();
  //   },

  //   hide: function($select, values){
  //     if(!_.isArray(values)){
  //       values = [values];
  //     }

  //     _.forEach(values, function(value){
  //       var optionToHide = $select.find("option[value='" + value + "']");
  //       if(optionToHide.length > 0){
  //         optionToHide.remove();
  //       }
  //     });
  //   },

  //   info: function($select){
  //     return {
  //       unselectedOnInit: $select.hasClass("unselected-on-init")
  //     };
  //   },

  //   init: function($select){
  //     var $newSelect = transformSelect($select),
  //         $label = $newSelect.find(".select-label"),
  //         previousValue = $newSelect.find("select").val();

  //     var refresh = function($select, checkIfChanged){
  //       var selectedValue = $select.val(),
  //           $selectedOption = $select.find("option[value='" + selectedValue + "']"),
  //           selectedDisplayValue = $selectedOption.text();

  //       if(!checkIfChanged || previousValue !== selectedValue){
  //         $label.text(selectedDisplayValue);
  //         previousValue = selectedValue;
  //         OT.Events.fire("select:change", { sender: $select.parent() });
  //       }
  //     };

  //     $newSelect.find('select').on('change', function(){
  //       return refresh($(this));
  //     }).on('keyup', function(){
  //       return refresh($(this), true);
  //     });

  //     return $newSelect;
  //   },

  //   select: function($select, value){
  //     var $selectedOption = $select.find("option[value='" + value + "']"),
  //         $label = $select.find(".select-label");

  //     $select.find("option").removeAttr("selected");
  //     $select.find("select").val(value);
  //     $label.text($selectedOption.text());

  //     OT.Events.fire("select:change", { sender: $select });
  //   },

  //   showAll: function($select){
  //     var selectName = $select.find("select").attr("name"),
  //         initialOptions = _data[selectName] || [],
  //         newOptions = "";

  //     for(var i = 0; i < initialOptions.length; i++){
  //       var option = initialOptions[i];
  //       if($select.find("option[value='" + option.value + "']").length === 0){
  //         newOptions += "<option value='" + option.value + "'>" + option.display + "</option>";
  //       }
  //     }

  //     if(newOptions.length > 0){
  //       $select.find("select").prepend(newOptions);
  //     }
  //   }
  // };

  // $.fn.OTselect = function(action, param){
  //   if(!!select[action]){
  //     return select[action](this, param);
  //   }

  //   return this;
  // };

  // return {
  //   init: select.init,
  //   get: select.get,
  //   select: select.select
  // };

// })(jQuery, _);

},{"./components/picker-form":164,"./utils":174,"mercury":4,"ramda/src/merge":108}],166:[function(require,module,exports){
module.exports={
  "de": {
    "dateFormat": "d mmm yyyy",
    "partySingular": "{0} Person",
    "partyPlural": "{0} Personen",
    "partyLarger": "20+ Personen",
    "findATable": "Tisch Finden",
    "textPlaceholder": "Ort oder Restaurant eingeben"
  },
  "en": {
    "dateFormat": "mmm d, yyyy",
    "partySingular": "{0} person",
    "partyPlural": "{0} people",
    "partyLarger": "Larger party",
    "findATable": "Find a Table",
    "textPlaceholder": "Location or Restaurant"
  },
  "es": {
    "dateFormat": "d mmm yyyy",
    "partySingular": "{0} persona",
    "partyPlural": "{0} personas",
    "partyLarger": "20+ personas",
    "findATable": "Buscar Mesa",
    "textPlaceholder": "Ubicación o nombre de Restaurante"
  },
  "fr": {
    "dateFormat": "d mmm yyyy",
    "partySingular": "{0} personne",
    "partyPlural": "{0} personnes",
    "partyLarger": "20+ personnes",
    "findATable": "Trouver une Table",
    "textPlaceholder": "Location or Restaurant"
  },
  "ja": {
    "dateFormat": "yyyy/m/d",
    "partySingular": "{0}名",
    "partyPlural": "{0}名",
    "partyLarger": "20+名",
    "findATable": "空席を検索する",
    "textPlaceholder": "エリアや店名を入力してください"
  }
}

},{}],167:[function(require,module,exports){
module.exports={
  "numberOfRowsInCalendar": 6,
  "numberOfDaysInCalendar": 42,
  "firstDayInCalendar": 6
}

},{}],168:[function(require,module,exports){
module.exports = {
  otDefaults: require('./ot-defaults'),
  otOption: require('./ot-option'),
  otSelect: require('./ot-select'),
  pickerLabel: require('./picker-label'),
  pickerSelector: require('./picker-selector')
}

},{"./ot-defaults":169,"./ot-option":170,"./ot-select":171,"./picker-label":172,"./picker-selector":173}],169:[function(require,module,exports){
module.exports={
  "background": "#F7F7F7",
  "boxSizing": "border-box",
  "cursor": "default",
  "fontFamily": "\"Helvetica Neue Light\", \"HelveticaNeue-Light\", \"Helvetica Neue\", Calibri, Helvetica, Arial, sans-serif",
  "fontSize": "16px",
  "fontStyle": "normal",
  "fontWeight": 400,
  "lineHeight": "1.2em",
  "margin": 0,
  "padding": 0,
  "position": "relative"
}

},{}],170:[function(require,module,exports){
module.exports={
  "display": "block",
  "fontWeight": "normal",
  "minHeight": "1.2em",
  "padding": "0px 2px 1px",
  "whiteSpace": "pre"
}

},{}],171:[function(require,module,exports){
module.exports={
    "backgroundColor": "#FFF",
    "borderRadius": "0",
    "color": "#333",
    "cursor": "pointer",
    "height": "100%",
    "opacity": "0",
    "position": "absolute",
    "top": "0",
    "width": "100%",
    "zIndex": "2"
}

},{}],172:[function(require,module,exports){
module.exports={
  "overflow": "hidden",
  "white-space": "nowrap",
  "border": "1px solid transparent",
  "display": "block",
  "padding": "0.8125rem 1rem",
  "color": "black",
  "height": "3rem",
  "z-index": 1,
  "text-decoration": "none",
  "background": "transparent",
}

},{}],173:[function(require,module,exports){
module.exports={
  "float": "left",
  "height": "100%",
  "width": "15%"
}

},{}],174:[function(require,module,exports){
var monthDays = require('month-days');
var times = require('ramda/src/times');
var settings = require('./settings');

function getFirstDayOfMonth(month, year) {
  return new Date(year + "-" + (month + 1) + "-01").getDay();
}

function getLastDayOfMonth(numberOfDays, month, year) {
  return new Date(year + "-" + (month + 1) + "-" + (numberOfDays + 1)).getDay();
}

function modulo(n, m) {
  return ((n % m) + m) % m;
}

function getNextDate(month, year) {
  var nextMonth = modulo(month + 1, 12);
  var nextYear = month === 11 ? year + 1 : year;

  return {
    month: nextMonth,
    year: nextYear
  };
}

function getLastDate(month, year) {
  var lastMonth = modulo(month - 1, 12);
  var lastYear = month === 0 ? year - 1 : year;

  return {
    month: lastMonth,
    year: lastYear
  };
}

function generateMonthFactory(currentDay, currentMonth, currentYear) {
  return function generateMonth(month, year) {
    var lastDate = getLastDate(month, year);
    var nextDate = getLastDate(month, year);

    var numberOfDays = monthDays(month, year);
    var numberOfDaysNextMonth = monthDays(nextDate.month, nextDate.year);
    var numberOfDaysLastMonth = monthDays(lastDate.month, lastDate.year);

    var firstDayOfMonth = getFirstDayOfMonth(month, year);
    var lastDayOfMonth = getLastDayOfMonth(numberOfDays, month, year);

    var numberOfDaysShownFromLastMonth = modulo(7 + firstDayOfMonth -
      settings.firstDayInCalendar, 7);

    var numberOfDaysShownFromNextMonth = settings.numberOfDaysInCalendar -
      (numberOfDaysShownFromLastMonth + numberOfDays);

    var daysLastMonth = times(function buildLastMonthDays(dayIndex) {
      return {
        dayOfMonth: numberOfDaysLastMonth - numberOfDaysShownFromLastMonth + dayIndex + 1,
        isDisabled: true
      };
    }, numberOfDaysShownFromLastMonth);

    var daysThisMonth = times(function buildDays(dayIndex) {
      return {
        dayOfMonth: dayIndex + 1,
        isDisabled: dayIndex < currentDay
      };
    }, numberOfDays);

    var daysNextMonth = times(function buildNextMonthDays(dayIndex) {
      return {
        dayOfMonth: dayIndex + 1,
        isDisabled: true
      };
    }, numberOfDaysShownFromNextMonth);

    return {
      name: 'November 2015',
      displayedDays: daysLastMonth.concat(daysThisMonth).concat(daysNextMonth)
    };
  }
}

module.exports = {
  generateMonthFactory: generateMonthFactory,
  getLastDate: getLastDate,
  getNextDate: getNextDate
};

},{"./settings":167,"month-days":94,"ramda/src/times":113}]},{},[165])(165)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1yZXNvbHZlL2VtcHR5LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9kYXRlZm9ybWF0L2xpYi9kYXRlZm9ybWF0LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9hZGQtZXZlbnQuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9kb20tZGVsZWdhdG9yLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2RvbS1kZWxlZ2F0b3IvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9ub2RlX21vZHVsZXMvY3VpZC9kaXN0L2Jyb3dzZXItY3VpZC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9kb20tZGVsZWdhdG9yL25vZGVfbW9kdWxlcy9ldi1zdG9yZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9kb20tZGVsZWdhdG9yL25vZGVfbW9kdWxlcy9ldi1zdG9yZS9ub2RlX21vZHVsZXMvaW5kaXZpZHVhbC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9kb20tZGVsZWdhdG9yL25vZGVfbW9kdWxlcy9ldi1zdG9yZS9ub2RlX21vZHVsZXMvaW5kaXZpZHVhbC9vbmUtdmVyc2lvbi5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9kb20tZGVsZWdhdG9yL25vZGVfbW9kdWxlcy9nbG9iYWwvZG9jdW1lbnQuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9ub2RlX21vZHVsZXMvaW5kaXZpZHVhbC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9kb20tZGVsZWdhdG9yL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2RvbS1kZWxlZ2F0b3Ivbm9kZV9tb2R1bGVzL3dlYWttYXAtc2hpbS9jcmVhdGUtc3RvcmUuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9ub2RlX21vZHVsZXMvd2Vha21hcC1zaGltL2hpZGRlbi1zdG9yZS5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9kb20tZGVsZWdhdG9yL3Byb3h5LWV2ZW50LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2RvbS1kZWxlZ2F0b3IvcmVtb3ZlLWV2ZW50LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2dldmFsL2V2ZW50LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2dldmFsL211bHRpcGxlLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2dldmFsL3NpbmdsZS5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9tYWluLWxvb3AvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvbWFpbi1sb29wL25vZGVfbW9kdWxlcy9lcnJvci9ub2RlX21vZHVsZXMvY2FtZWxpemUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvbWFpbi1sb29wL25vZGVfbW9kdWxlcy9lcnJvci9ub2RlX21vZHVsZXMvc3RyaW5nLXRlbXBsYXRlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL21haW4tbG9vcC9ub2RlX21vZHVsZXMvZXJyb3IvdHlwZWQuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvbWFpbi1sb29wL25vZGVfbW9kdWxlcy9yYWYvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvbWFpbi1sb29wL25vZGVfbW9kdWxlcy9yYWYvbm9kZV9tb2R1bGVzL3BlcmZvcm1hbmNlLW5vdy9saWIvcGVyZm9ybWFuY2Utbm93LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL29ic2Vydi1hcnJheS9hZGQtbGlzdGVuZXIuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LWFycmF5L2FwcGx5LXBhdGNoLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL29ic2Vydi1hcnJheS9hcnJheS1tZXRob2RzLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL29ic2Vydi1hcnJheS9hcnJheS1yZXZlcnNlLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL29ic2Vydi1hcnJheS9hcnJheS1zb3J0LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL29ic2Vydi1hcnJheS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvbGliL3NldC1ub24tZW51bWVyYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvbm9kZV9tb2R1bGVzL2FkaWZmL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL29ic2Vydi1hcnJheS9wdXQuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LWFycmF5L3NldC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvc3BsaWNlLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL29ic2Vydi1hcnJheS90cmFuc2FjdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtc3RydWN0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL29ic2Vydi1zdHJ1Y3Qvbm9kZV9tb2R1bGVzL3h0ZW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL29ic2Vydi12YXJoYXNoL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL29ic2Vydi9jb21wdXRlZC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2L3dhdGNoLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZhbHVlLWV2ZW50L2Jhc2UtZXZlbnQuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmFsdWUtZXZlbnQvY2hhbmdlLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZhbHVlLWV2ZW50L2NsaWNrLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZhbHVlLWV2ZW50L2V2ZW50LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZhbHVlLWV2ZW50L2tleS5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92YWx1ZS1ldmVudC9ub2RlX21vZHVsZXMvZG9tLXdhbGsvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmFsdWUtZXZlbnQvbm9kZV9tb2R1bGVzL2Zvcm0tZGF0YS1zZXQvZWxlbWVudC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92YWx1ZS1ldmVudC9ub2RlX21vZHVsZXMvZm9ybS1kYXRhLXNldC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92YWx1ZS1ldmVudC9ub2RlX21vZHVsZXMveHRlbmQvaGFzLWtleXMuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmFsdWUtZXZlbnQvbm9kZV9tb2R1bGVzL3h0ZW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZhbHVlLWV2ZW50L3N1Ym1pdC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92YWx1ZS1ldmVudC92YWx1ZS5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92ZG9tLXRodW5rL2ltbXV0YWJsZS10aHVuay5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92ZG9tLXRodW5rL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3Zkb20tdGh1bmsvcGFydGlhbC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92ZG9tLXRodW5rL3NoYWxsb3ctZXEuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vbm9kZV9tb2R1bGVzL2Jyb3dzZXItc3BsaXQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vbm9kZV9tb2R1bGVzL2V2LXN0b3JlL25vZGVfbW9kdWxlcy9pbmRpdmlkdWFsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL25vZGVfbW9kdWxlcy9nbG9iYWwvZG9jdW1lbnQuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vbm9kZV9tb2R1bGVzL2lzLW9iamVjdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS9ub2RlX21vZHVsZXMveC1pcy1hcnJheS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92ZG9tL2FwcGx5LXByb3BlcnRpZXMuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdmRvbS9jcmVhdGUtZWxlbWVudC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92ZG9tL2RvbS1pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92ZG9tL3BhdGNoLW9wLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zkb20vcGF0Y2guanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdmRvbS91cGRhdGUtd2lkZ2V0LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3ZpcnR1YWwtaHlwZXJzY3JpcHQvaG9va3MvZXYtaG9vay5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92aXJ0dWFsLWh5cGVyc2NyaXB0L2hvb2tzL3NvZnQtc2V0LWhvb2suanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdmlydHVhbC1oeXBlcnNjcmlwdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92aXJ0dWFsLWh5cGVyc2NyaXB0L3BhcnNlLXRhZy5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92bm9kZS9oYW5kbGUtdGh1bmsuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdm5vZGUvaXMtdGh1bmsuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdm5vZGUvaXMtdmhvb2suanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdm5vZGUvaXMtdm5vZGUuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdm5vZGUvaXMtdnRleHQuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdm5vZGUvaXMtd2lkZ2V0LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zub2RlL3ZlcnNpb24uanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdm5vZGUvdm5vZGUuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdm5vZGUvdnBhdGNoLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zub2RlL3Z0ZXh0LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Z0cmVlL2RpZmYtcHJvcHMuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdnRyZWUvZGlmZi5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy94dGVuZC9tdXRhYmxlLmpzIiwibm9kZV9tb2R1bGVzL21vbnRoLWRheXMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmFtZGEvc3JjL2JpbmQuanMiLCJub2RlX21vZHVsZXMvcmFtZGEvc3JjL2ludGVybmFsL19hcml0eS5qcyIsIm5vZGVfbW9kdWxlcy9yYW1kYS9zcmMvaW50ZXJuYWwvX2NoZWNrRm9yTWV0aG9kLmpzIiwibm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9fY3VycnkxLmpzIiwibm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9fY3VycnkyLmpzIiwibm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9fY3VycnkzLmpzIiwibm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9faGFzLmpzIiwibm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9faXNBcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9yYW1kYS9zcmMvaW50ZXJuYWwvX3JlZHVjZS5qcyIsIm5vZGVfbW9kdWxlcy9yYW1kYS9zcmMvaW50ZXJuYWwvX3NsaWNlLmpzIiwibm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9feHdyYXAuanMiLCJub2RlX21vZHVsZXMvcmFtZGEvc3JjL2lzQXJyYXlMaWtlLmpzIiwibm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9rZXlzLmpzIiwibm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9tZXJnZS5qcyIsIm5vZGVfbW9kdWxlcy9yYW1kYS9zcmMvcGljay5qcyIsIm5vZGVfbW9kdWxlcy9yYW1kYS9zcmMvcmVkdWNlLmpzIiwibm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9zbGljZS5qcyIsIm5vZGVfbW9kdWxlcy9yYW1kYS9zcmMvc3BsaXRFdmVyeS5qcyIsIm5vZGVfbW9kdWxlcy9yYW1kYS9zcmMvdGltZXMuanMiLCJub2RlX21vZHVsZXMvcmFtZGEvc3JjL3ZhbHVlcy5qcyIsInNyYy9idWlsZC1zdHlsZS5qcyIsInNyYy9jb21wb25lbnRzL2RhdGUtcGlja2VyL2J1aWxkLXN0eWxlLmpzIiwic3JjL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIvaW5kZXguanMiLCJzcmMvY29tcG9uZW50cy9kYXRlLXBpY2tlci9wb3AtdXAuanMiLCJzcmMvY29tcG9uZW50cy9kYXRlLXBpY2tlci90cmFuc2xhdGlvbnMvYmctQkcuanNvbiIsInNyYy9jb21wb25lbnRzL2RhdGUtcGlja2VyL3RyYW5zbGF0aW9ucy9icy1CQS5qc29uIiwic3JjL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIvdHJhbnNsYXRpb25zL2NhLUVTLmpzb24iLCJzcmMvY29tcG9uZW50cy9kYXRlLXBpY2tlci90cmFuc2xhdGlvbnMvY3MtQ1ouanNvbiIsInNyYy9jb21wb25lbnRzL2RhdGUtcGlja2VyL3RyYW5zbGF0aW9ucy9kYS1ESy5qc29uIiwic3JjL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIvdHJhbnNsYXRpb25zL2RlLURFLmpzb24iLCJzcmMvY29tcG9uZW50cy9kYXRlLXBpY2tlci90cmFuc2xhdGlvbnMvZWwtR1IuanNvbiIsInNyYy9jb21wb25lbnRzL2RhdGUtcGlja2VyL3RyYW5zbGF0aW9ucy9lbi1VUy5qc29uIiwic3JjL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIvdHJhbnNsYXRpb25zL2VzLUVTLmpzb24iLCJzcmMvY29tcG9uZW50cy9kYXRlLXBpY2tlci90cmFuc2xhdGlvbnMvZXQtRUUuanNvbiIsInNyYy9jb21wb25lbnRzL2RhdGUtcGlja2VyL3RyYW5zbGF0aW9ucy9ldS1FUy5qc29uIiwic3JjL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIvdHJhbnNsYXRpb25zL2ZhLWlyLmpzb24iLCJzcmMvY29tcG9uZW50cy9kYXRlLXBpY2tlci90cmFuc2xhdGlvbnMvZmktRkkuanNvbiIsInNyYy9jb21wb25lbnRzL2RhdGUtcGlja2VyL3RyYW5zbGF0aW9ucy9mci1GUi5qc29uIiwic3JjL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIvdHJhbnNsYXRpb25zL2dsLUVTLmpzb24iLCJzcmMvY29tcG9uZW50cy9kYXRlLXBpY2tlci90cmFuc2xhdGlvbnMvaGUtSUwuanNvbiIsInNyYy9jb21wb25lbnRzL2RhdGUtcGlja2VyL3RyYW5zbGF0aW9ucy9oaS1JTi5qc29uIiwic3JjL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIvdHJhbnNsYXRpb25zL2hyLUhSLmpzb24iLCJzcmMvY29tcG9uZW50cy9kYXRlLXBpY2tlci90cmFuc2xhdGlvbnMvaHUtSFUuanNvbiIsInNyYy9jb21wb25lbnRzL2RhdGUtcGlja2VyL3RyYW5zbGF0aW9ucy9pZC1JRC5qc29uIiwic3JjL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIvdHJhbnNsYXRpb25zL2luZGV4LmpzIiwic3JjL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIvdHJhbnNsYXRpb25zL2lzLUlTLmpzb24iLCJzcmMvY29tcG9uZW50cy9kYXRlLXBpY2tlci90cmFuc2xhdGlvbnMvaXQtSVQuanNvbiIsInNyYy9jb21wb25lbnRzL2RhdGUtcGlja2VyL3RyYW5zbGF0aW9ucy9qYS1KUC5qc29uIiwic3JjL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIvdHJhbnNsYXRpb25zL2tvLUtSLmpzb24iLCJzcmMvY29tcG9uZW50cy9kYXRlLXBpY2tlci90cmFuc2xhdGlvbnMvbHQtTFQuanNvbiIsInNyYy9jb21wb25lbnRzL2RhdGUtcGlja2VyL3RyYW5zbGF0aW9ucy9sdi1MVi5qc29uIiwic3JjL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIvdHJhbnNsYXRpb25zL25iLU5PLmpzb24iLCJzcmMvY29tcG9uZW50cy9kYXRlLXBpY2tlci90cmFuc2xhdGlvbnMvbmUtTlAuanNvbiIsInNyYy9jb21wb25lbnRzL2RhdGUtcGlja2VyL3RyYW5zbGF0aW9ucy9ubC1OTC5qc29uIiwic3JjL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIvdHJhbnNsYXRpb25zL3BsLVBMLmpzb24iLCJzcmMvY29tcG9uZW50cy9kYXRlLXBpY2tlci90cmFuc2xhdGlvbnMvcHQtQlIuanNvbiIsInNyYy9jb21wb25lbnRzL2RhdGUtcGlja2VyL3RyYW5zbGF0aW9ucy9wdC1QVC5qc29uIiwic3JjL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIvdHJhbnNsYXRpb25zL3JvLVJPLmpzb24iLCJzcmMvY29tcG9uZW50cy9kYXRlLXBpY2tlci90cmFuc2xhdGlvbnMvcnUtUlUuanNvbiIsInNyYy9jb21wb25lbnRzL2RhdGUtcGlja2VyL3RyYW5zbGF0aW9ucy9zay1TSy5qc29uIiwic3JjL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIvdHJhbnNsYXRpb25zL3NsLVNJLmpzb24iLCJzcmMvY29tcG9uZW50cy9kYXRlLXBpY2tlci90cmFuc2xhdGlvbnMvc3YtU0UuanNvbiIsInNyYy9jb21wb25lbnRzL2RhdGUtcGlja2VyL3RyYW5zbGF0aW9ucy90aC1USC5qc29uIiwic3JjL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIvdHJhbnNsYXRpb25zL3RyLVRSLmpzb24iLCJzcmMvY29tcG9uZW50cy9kYXRlLXBpY2tlci90cmFuc2xhdGlvbnMvdWstVUEuanNvbiIsInNyYy9jb21wb25lbnRzL2RhdGUtcGlja2VyL3RyYW5zbGF0aW9ucy92aS1WTi5qc29uIiwic3JjL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIvdHJhbnNsYXRpb25zL3poLUNOLmpzb24iLCJzcmMvY29tcG9uZW50cy9kYXRlLXBpY2tlci90cmFuc2xhdGlvbnMvemgtVFcuanNvbiIsInNyYy9jb21wb25lbnRzL3BhcnR5LXNpemUtcGlja2VyLmpzIiwic3JjL2NvbXBvbmVudHMvcGlja2VyLWZvcm0uanMiLCJzcmMvaW5kZXguanMiLCJzcmMvbGFuZ3VhZ2VzLmpzb24iLCJzcmMvc2V0dGluZ3MuanNvbiIsInNyYy9zdHlsZXMvaW5kZXguanMiLCJzcmMvc3R5bGVzL290LWRlZmF1bHRzLmpzb24iLCJzcmMvc3R5bGVzL290LW9wdGlvbi5qc29uIiwic3JjL3N0eWxlcy9vdC1zZWxlY3QuanNvbiIsInNyYy9zdHlsZXMvcGlja2VyLWxhYmVsLmpzb24iLCJzcmMvc3R5bGVzL3BpY2tlci1zZWxlY3Rvci5qc29uIiwic3JjL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNuVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7QUFDQTs7QUNEQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzF3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvKlxuICogRGF0ZSBGb3JtYXQgMS4yLjNcbiAqIChjKSAyMDA3LTIwMDkgU3RldmVuIExldml0aGFuIDxzdGV2ZW5sZXZpdGhhbi5jb20+XG4gKiBNSVQgbGljZW5zZVxuICpcbiAqIEluY2x1ZGVzIGVuaGFuY2VtZW50cyBieSBTY290dCBUcmVuZGEgPHNjb3R0LnRyZW5kYS5uZXQ+XG4gKiBhbmQgS3JpcyBLb3dhbCA8Y2l4YXIuY29tL35rcmlzLmtvd2FsLz5cbiAqXG4gKiBBY2NlcHRzIGEgZGF0ZSwgYSBtYXNrLCBvciBhIGRhdGUgYW5kIGEgbWFzay5cbiAqIFJldHVybnMgYSBmb3JtYXR0ZWQgdmVyc2lvbiBvZiB0aGUgZ2l2ZW4gZGF0ZS5cbiAqIFRoZSBkYXRlIGRlZmF1bHRzIHRvIHRoZSBjdXJyZW50IGRhdGUvdGltZS5cbiAqIFRoZSBtYXNrIGRlZmF1bHRzIHRvIGRhdGVGb3JtYXQubWFza3MuZGVmYXVsdC5cbiAqL1xuXG4oZnVuY3Rpb24oZ2xvYmFsKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgZGF0ZUZvcm1hdCA9IChmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0b2tlbiA9IC9kezEsNH18bXsxLDR9fHl5KD86eXkpP3woW0hoTXNUdF0pXFwxP3xbTGxvU1pXTl18J1teJ10qJ3wnW14nXSonL2c7XG4gICAgICB2YXIgdGltZXpvbmUgPSAvXFxiKD86W1BNQ0VBXVtTRFBdVHwoPzpQYWNpZmljfE1vdW50YWlufENlbnRyYWx8RWFzdGVybnxBdGxhbnRpYykgKD86U3RhbmRhcmR8RGF5bGlnaHR8UHJldmFpbGluZykgVGltZXwoPzpHTVR8VVRDKSg/OlstK11cXGR7NH0pPylcXGIvZztcbiAgICAgIHZhciB0aW1lem9uZUNsaXAgPSAvW14tK1xcZEEtWl0vZztcbiAgXG4gICAgICAvLyBSZWdleGVzIGFuZCBzdXBwb3J0aW5nIGZ1bmN0aW9ucyBhcmUgY2FjaGVkIHRocm91Z2ggY2xvc3VyZVxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChkYXRlLCBtYXNrLCB1dGMsIGdtdCkge1xuICBcbiAgICAgICAgLy8gWW91IGNhbid0IHByb3ZpZGUgdXRjIGlmIHlvdSBza2lwIG90aGVyIGFyZ3MgKHVzZSB0aGUgJ1VUQzonIG1hc2sgcHJlZml4KVxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJiBraW5kT2YoZGF0ZSkgPT09ICdzdHJpbmcnICYmICEvXFxkLy50ZXN0KGRhdGUpKSB7XG4gICAgICAgICAgbWFzayA9IGRhdGU7XG4gICAgICAgICAgZGF0ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICBcbiAgICAgICAgZGF0ZSA9IGRhdGUgfHwgbmV3IERhdGU7XG4gIFxuICAgICAgICBpZighKGRhdGUgaW5zdGFuY2VvZiBEYXRlKSkge1xuICAgICAgICAgIGRhdGUgPSBuZXcgRGF0ZShkYXRlKTtcbiAgICAgICAgfVxuICBcbiAgICAgICAgaWYgKGlzTmFOKGRhdGUpKSB7XG4gICAgICAgICAgdGhyb3cgVHlwZUVycm9yKCdJbnZhbGlkIGRhdGUnKTtcbiAgICAgICAgfVxuICBcbiAgICAgICAgbWFzayA9IFN0cmluZyhkYXRlRm9ybWF0Lm1hc2tzW21hc2tdIHx8IG1hc2sgfHwgZGF0ZUZvcm1hdC5tYXNrc1snZGVmYXVsdCddKTtcbiAgXG4gICAgICAgIC8vIEFsbG93IHNldHRpbmcgdGhlIHV0Yy9nbXQgYXJndW1lbnQgdmlhIHRoZSBtYXNrXG4gICAgICAgIHZhciBtYXNrU2xpY2UgPSBtYXNrLnNsaWNlKDAsIDQpO1xuICAgICAgICBpZiAobWFza1NsaWNlID09PSAnVVRDOicgfHwgbWFza1NsaWNlID09PSAnR01UOicpIHtcbiAgICAgICAgICBtYXNrID0gbWFzay5zbGljZSg0KTtcbiAgICAgICAgICB1dGMgPSB0cnVlO1xuICAgICAgICAgIGlmIChtYXNrU2xpY2UgPT09ICdHTVQ6Jykge1xuICAgICAgICAgICAgZ210ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgXG4gICAgICAgIHZhciBfID0gdXRjID8gJ2dldFVUQycgOiAnZ2V0JztcbiAgICAgICAgdmFyIGQgPSBkYXRlW18gKyAnRGF0ZSddKCk7XG4gICAgICAgIHZhciBEID0gZGF0ZVtfICsgJ0RheSddKCk7XG4gICAgICAgIHZhciBtID0gZGF0ZVtfICsgJ01vbnRoJ10oKTtcbiAgICAgICAgdmFyIHkgPSBkYXRlW18gKyAnRnVsbFllYXInXSgpO1xuICAgICAgICB2YXIgSCA9IGRhdGVbXyArICdIb3VycyddKCk7XG4gICAgICAgIHZhciBNID0gZGF0ZVtfICsgJ01pbnV0ZXMnXSgpO1xuICAgICAgICB2YXIgcyA9IGRhdGVbXyArICdTZWNvbmRzJ10oKTtcbiAgICAgICAgdmFyIEwgPSBkYXRlW18gKyAnTWlsbGlzZWNvbmRzJ10oKTtcbiAgICAgICAgdmFyIG8gPSB1dGMgPyAwIDogZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xuICAgICAgICB2YXIgVyA9IGdldFdlZWsoZGF0ZSk7XG4gICAgICAgIHZhciBOID0gZ2V0RGF5T2ZXZWVrKGRhdGUpO1xuICAgICAgICB2YXIgZmxhZ3MgPSB7XG4gICAgICAgICAgZDogICAgZCxcbiAgICAgICAgICBkZDogICBwYWQoZCksXG4gICAgICAgICAgZGRkOiAgZGF0ZUZvcm1hdC5pMThuLmRheU5hbWVzW0RdLFxuICAgICAgICAgIGRkZGQ6IGRhdGVGb3JtYXQuaTE4bi5kYXlOYW1lc1tEICsgN10sXG4gICAgICAgICAgbTogICAgbSArIDEsXG4gICAgICAgICAgbW06ICAgcGFkKG0gKyAxKSxcbiAgICAgICAgICBtbW06ICBkYXRlRm9ybWF0LmkxOG4ubW9udGhOYW1lc1ttXSxcbiAgICAgICAgICBtbW1tOiBkYXRlRm9ybWF0LmkxOG4ubW9udGhOYW1lc1ttICsgMTJdLFxuICAgICAgICAgIHl5OiAgIFN0cmluZyh5KS5zbGljZSgyKSxcbiAgICAgICAgICB5eXl5OiB5LFxuICAgICAgICAgIGg6ICAgIEggJSAxMiB8fCAxMixcbiAgICAgICAgICBoaDogICBwYWQoSCAlIDEyIHx8IDEyKSxcbiAgICAgICAgICBIOiAgICBILFxuICAgICAgICAgIEhIOiAgIHBhZChIKSxcbiAgICAgICAgICBNOiAgICBNLFxuICAgICAgICAgIE1NOiAgIHBhZChNKSxcbiAgICAgICAgICBzOiAgICBzLFxuICAgICAgICAgIHNzOiAgIHBhZChzKSxcbiAgICAgICAgICBsOiAgICBwYWQoTCwgMyksXG4gICAgICAgICAgTDogICAgcGFkKE1hdGgucm91bmQoTCAvIDEwKSksXG4gICAgICAgICAgdDogICAgSCA8IDEyID8gJ2EnICA6ICdwJyxcbiAgICAgICAgICB0dDogICBIIDwgMTIgPyAnYW0nIDogJ3BtJyxcbiAgICAgICAgICBUOiAgICBIIDwgMTIgPyAnQScgIDogJ1AnLFxuICAgICAgICAgIFRUOiAgIEggPCAxMiA/ICdBTScgOiAnUE0nLFxuICAgICAgICAgIFo6ICAgIGdtdCA/ICdHTVQnIDogdXRjID8gJ1VUQycgOiAoU3RyaW5nKGRhdGUpLm1hdGNoKHRpbWV6b25lKSB8fCBbJyddKS5wb3AoKS5yZXBsYWNlKHRpbWV6b25lQ2xpcCwgJycpLFxuICAgICAgICAgIG86ICAgIChvID4gMCA/ICctJyA6ICcrJykgKyBwYWQoTWF0aC5mbG9vcihNYXRoLmFicyhvKSAvIDYwKSAqIDEwMCArIE1hdGguYWJzKG8pICUgNjAsIDQpLFxuICAgICAgICAgIFM6ICAgIFsndGgnLCAnc3QnLCAnbmQnLCAncmQnXVtkICUgMTAgPiAzID8gMCA6IChkICUgMTAwIC0gZCAlIDEwICE9IDEwKSAqIGQgJSAxMF0sXG4gICAgICAgICAgVzogICAgVyxcbiAgICAgICAgICBOOiAgICBOXG4gICAgICAgIH07XG4gIFxuICAgICAgICByZXR1cm4gbWFzay5yZXBsYWNlKHRva2VuLCBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgICBpZiAobWF0Y2ggaW4gZmxhZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBmbGFnc1ttYXRjaF07XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBtYXRjaC5zbGljZSgxLCBtYXRjaC5sZW5ndGggLSAxKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKCk7XG5cbiAgZGF0ZUZvcm1hdC5tYXNrcyA9IHtcbiAgICAnZGVmYXVsdCc6ICAgICAgICAgICAgICAgJ2RkZCBtbW0gZGQgeXl5eSBISDpNTTpzcycsXG4gICAgJ3Nob3J0RGF0ZSc6ICAgICAgICAgICAgICdtL2QveXknLFxuICAgICdtZWRpdW1EYXRlJzogICAgICAgICAgICAnbW1tIGQsIHl5eXknLFxuICAgICdsb25nRGF0ZSc6ICAgICAgICAgICAgICAnbW1tbSBkLCB5eXl5JyxcbiAgICAnZnVsbERhdGUnOiAgICAgICAgICAgICAgJ2RkZGQsIG1tbW0gZCwgeXl5eScsXG4gICAgJ3Nob3J0VGltZSc6ICAgICAgICAgICAgICdoOk1NIFRUJyxcbiAgICAnbWVkaXVtVGltZSc6ICAgICAgICAgICAgJ2g6TU06c3MgVFQnLFxuICAgICdsb25nVGltZSc6ICAgICAgICAgICAgICAnaDpNTTpzcyBUVCBaJyxcbiAgICAnaXNvRGF0ZSc6ICAgICAgICAgICAgICAgJ3l5eXktbW0tZGQnLFxuICAgICdpc29UaW1lJzogICAgICAgICAgICAgICAnSEg6TU06c3MnLFxuICAgICdpc29EYXRlVGltZSc6ICAgICAgICAgICAneXl5eS1tbS1kZFxcJ1RcXCdISDpNTTpzc28nLFxuICAgICdpc29VdGNEYXRlVGltZSc6ICAgICAgICAnVVRDOnl5eXktbW0tZGRcXCdUXFwnSEg6TU06c3NcXCdaXFwnJyxcbiAgICAnZXhwaXJlc0hlYWRlckZvcm1hdCc6ICAgJ2RkZCwgZGQgbW1tIHl5eXkgSEg6TU06c3MgWidcbiAgfTtcblxuICAvLyBJbnRlcm5hdGlvbmFsaXphdGlvbiBzdHJpbmdzXG4gIGRhdGVGb3JtYXQuaTE4biA9IHtcbiAgICBkYXlOYW1lczogW1xuICAgICAgJ1N1bicsICdNb24nLCAnVHVlJywgJ1dlZCcsICdUaHUnLCAnRnJpJywgJ1NhdCcsXG4gICAgICAnU3VuZGF5JywgJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknXG4gICAgXSxcbiAgICBtb250aE5hbWVzOiBbXG4gICAgICAnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2N0JywgJ05vdicsICdEZWMnLFxuICAgICAgJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXG4gICAgXVxuICB9O1xuXG5mdW5jdGlvbiBwYWQodmFsLCBsZW4pIHtcbiAgdmFsID0gU3RyaW5nKHZhbCk7XG4gIGxlbiA9IGxlbiB8fCAyO1xuICB3aGlsZSAodmFsLmxlbmd0aCA8IGxlbikge1xuICAgIHZhbCA9ICcwJyArIHZhbDtcbiAgfVxuICByZXR1cm4gdmFsO1xufVxuXG4vKipcbiAqIEdldCB0aGUgSVNPIDg2MDEgd2VlayBudW1iZXJcbiAqIEJhc2VkIG9uIGNvbW1lbnRzIGZyb21cbiAqIGh0dHA6Ly90ZWNoYmxvZy5wcm9jdXJpb3Mubmwvay9uNjE4L25ld3Mvdmlldy8zMzc5Ni8xNDg2My9DYWxjdWxhdGUtSVNPLTg2MDEtd2Vlay1hbmQteWVhci1pbi1qYXZhc2NyaXB0Lmh0bWxcbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IGBkYXRlYFxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5mdW5jdGlvbiBnZXRXZWVrKGRhdGUpIHtcbiAgLy8gUmVtb3ZlIHRpbWUgY29tcG9uZW50cyBvZiBkYXRlXG4gIHZhciB0YXJnZXRUaHVyc2RheSA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSk7XG5cbiAgLy8gQ2hhbmdlIGRhdGUgdG8gVGh1cnNkYXkgc2FtZSB3ZWVrXG4gIHRhcmdldFRodXJzZGF5LnNldERhdGUodGFyZ2V0VGh1cnNkYXkuZ2V0RGF0ZSgpIC0gKCh0YXJnZXRUaHVyc2RheS5nZXREYXkoKSArIDYpICUgNykgKyAzKTtcblxuICAvLyBUYWtlIEphbnVhcnkgNHRoIGFzIGl0IGlzIGFsd2F5cyBpbiB3ZWVrIDEgKHNlZSBJU08gODYwMSlcbiAgdmFyIGZpcnN0VGh1cnNkYXkgPSBuZXcgRGF0ZSh0YXJnZXRUaHVyc2RheS5nZXRGdWxsWWVhcigpLCAwLCA0KTtcblxuICAvLyBDaGFuZ2UgZGF0ZSB0byBUaHVyc2RheSBzYW1lIHdlZWtcbiAgZmlyc3RUaHVyc2RheS5zZXREYXRlKGZpcnN0VGh1cnNkYXkuZ2V0RGF0ZSgpIC0gKChmaXJzdFRodXJzZGF5LmdldERheSgpICsgNikgJSA3KSArIDMpO1xuXG4gIC8vIENoZWNrIGlmIGRheWxpZ2h0LXNhdmluZy10aW1lLXN3aXRjaCBvY2N1cmVkIGFuZCBjb3JyZWN0IGZvciBpdFxuICB2YXIgZHMgPSB0YXJnZXRUaHVyc2RheS5nZXRUaW1lem9uZU9mZnNldCgpIC0gZmlyc3RUaHVyc2RheS5nZXRUaW1lem9uZU9mZnNldCgpO1xuICB0YXJnZXRUaHVyc2RheS5zZXRIb3Vycyh0YXJnZXRUaHVyc2RheS5nZXRIb3VycygpIC0gZHMpO1xuXG4gIC8vIE51bWJlciBvZiB3ZWVrcyBiZXR3ZWVuIHRhcmdldCBUaHVyc2RheSBhbmQgZmlyc3QgVGh1cnNkYXlcbiAgdmFyIHdlZWtEaWZmID0gKHRhcmdldFRodXJzZGF5IC0gZmlyc3RUaHVyc2RheSkgLyAoODY0MDAwMDAqNyk7XG4gIHJldHVybiAxICsgTWF0aC5mbG9vcih3ZWVrRGlmZik7XG59XG5cbi8qKlxuICogR2V0IElTTy04NjAxIG51bWVyaWMgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRheSBvZiB0aGUgd2Vla1xuICogMSAoZm9yIE1vbmRheSkgdGhyb3VnaCA3IChmb3IgU3VuZGF5KVxuICogXG4gKiBAcGFyYW0gIHtPYmplY3R9IGBkYXRlYFxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5mdW5jdGlvbiBnZXREYXlPZldlZWsoZGF0ZSkge1xuICB2YXIgZG93ID0gZGF0ZS5nZXREYXkoKTtcbiAgaWYoZG93ID09PSAwKSB7XG4gICAgZG93ID0gNztcbiAgfVxuICByZXR1cm4gZG93O1xufVxuXG4vKipcbiAqIGtpbmQtb2Ygc2hvcnRjdXRcbiAqIEBwYXJhbSAgeyp9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBraW5kT2YodmFsKSB7XG4gIGlmICh2YWwgPT09IG51bGwpIHtcbiAgICByZXR1cm4gJ251bGwnO1xuICB9XG5cbiAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuICd1bmRlZmluZWQnO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWwgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWw7XG4gIH1cblxuICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgcmV0dXJuICdhcnJheSc7XG4gIH1cblxuICByZXR1cm4ge30udG9TdHJpbmcuY2FsbCh2YWwpXG4gICAgLnNsaWNlKDgsIC0xKS50b0xvd2VyQ2FzZSgpO1xufTtcblxuXG5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShkYXRlRm9ybWF0KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGRhdGVGb3JtYXQ7XG4gIH0gZWxzZSB7XG4gICAgZ2xvYmFsLmRhdGVGb3JtYXQgPSBkYXRlRm9ybWF0O1xuICB9XG59KSh0aGlzKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFNpbmdsZUV2ZW50ID0gcmVxdWlyZSgnZ2V2YWwvc2luZ2xlJyk7XG52YXIgTXVsdGlwbGVFdmVudCA9IHJlcXVpcmUoJ2dldmFsL211bHRpcGxlJyk7XG52YXIgZXh0ZW5kID0gcmVxdWlyZSgneHRlbmQnKTtcblxuLypcbiAgICBQcm8gdGlwOiBEb24ndCByZXF1aXJlIGBtZXJjdXJ5YCBpdHNlbGYuXG4gICAgICByZXF1aXJlIGFuZCBkZXBlbmQgb24gYWxsIHRoZXNlIG1vZHVsZXMgZGlyZWN0bHkhXG4qL1xudmFyIG1lcmN1cnkgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvLyBFbnRyeVxuICAgIG1haW46IHJlcXVpcmUoJ21haW4tbG9vcCcpLFxuICAgIGFwcDogYXBwLFxuXG4gICAgLy8gQmFzZVxuICAgIEJhc2VFdmVudDogcmVxdWlyZSgndmFsdWUtZXZlbnQvYmFzZS1ldmVudCcpLFxuXG4gICAgLy8gSW5wdXRcbiAgICBEZWxlZ2F0b3I6IHJlcXVpcmUoJ2RvbS1kZWxlZ2F0b3InKSxcbiAgICAvLyBkZXByZWNhdGVkOiB1c2UgaGcuY2hhbm5lbHMgaW5zdGVhZC5cbiAgICBpbnB1dDogaW5wdXQsXG4gICAgLy8gZGVwcmVjYXRlZDogdXNlIGhnLmNoYW5uZWxzIGluc3RlYWQuXG4gICAgaGFuZGxlczogY2hhbm5lbHMsXG4gICAgY2hhbm5lbHM6IGNoYW5uZWxzLFxuICAgIC8vIGRlcHJlY2F0ZWQ6IHVzZSBoZy5zZW5kIGluc3RlYWQuXG4gICAgZXZlbnQ6IHJlcXVpcmUoJ3ZhbHVlLWV2ZW50L2V2ZW50JyksXG4gICAgc2VuZDogcmVxdWlyZSgndmFsdWUtZXZlbnQvZXZlbnQnKSxcbiAgICAvLyBkZXByZWNhdGVkOiB1c2UgaGcuc2VuZFZhbHVlIGluc3RlYWQuXG4gICAgdmFsdWVFdmVudDogcmVxdWlyZSgndmFsdWUtZXZlbnQvdmFsdWUnKSxcbiAgICBzZW5kVmFsdWU6IHJlcXVpcmUoJ3ZhbHVlLWV2ZW50L3ZhbHVlJyksXG4gICAgLy8gZGVwcmVjYXRlZDogdXNlIGhnLnNlbmRTdWJtaXQgaW5zdGVhZC5cbiAgICBzdWJtaXRFdmVudDogcmVxdWlyZSgndmFsdWUtZXZlbnQvc3VibWl0JyksXG4gICAgc2VuZFN1Ym1pdDogcmVxdWlyZSgndmFsdWUtZXZlbnQvc3VibWl0JyksXG4gICAgLy8gZGVwcmVjYXRlZDogdXNlIGhnLnNlbmRDaGFuZ2UgaW5zdGVhZC5cbiAgICBjaGFuZ2VFdmVudDogcmVxdWlyZSgndmFsdWUtZXZlbnQvY2hhbmdlJyksXG4gICAgc2VuZENoYW5nZTogcmVxdWlyZSgndmFsdWUtZXZlbnQvY2hhbmdlJyksXG4gICAgLy8gZGVwcmVjYXRlZDogdXNlIGhnLnNlbmRLZXkgaW5zdGVhZC5cbiAgICBrZXlFdmVudDogcmVxdWlyZSgndmFsdWUtZXZlbnQva2V5JyksXG4gICAgc2VuZEtleTogcmVxdWlyZSgndmFsdWUtZXZlbnQva2V5JyksXG4gICAgLy8gZGVwcmVjYXRlZCB1c2UgaGcuc2VuZENsaWNrIGluc3RlYWQuXG4gICAgY2xpY2tFdmVudDogcmVxdWlyZSgndmFsdWUtZXZlbnQvY2xpY2snKSxcbiAgICBzZW5kQ2xpY2s6IHJlcXVpcmUoJ3ZhbHVlLWV2ZW50L2NsaWNrJyksXG5cbiAgICAvLyBTdGF0ZVxuICAgIC8vIHJlbW92ZSBmcm9tIGNvcmU6IGZhdm9yIGhnLnZhcmhhc2ggaW5zdGVhZC5cbiAgICBhcnJheTogcmVxdWlyZSgnb2JzZXJ2LWFycmF5JyksXG4gICAgc3RydWN0OiByZXF1aXJlKCdvYnNlcnYtc3RydWN0JyksXG4gICAgLy8gZGVwcmVjYXRlZDogdXNlIGhnLnN0cnVjdCBpbnN0ZWFkLlxuICAgIGhhc2g6IHJlcXVpcmUoJ29ic2Vydi1zdHJ1Y3QnKSxcbiAgICB2YXJoYXNoOiByZXF1aXJlKCdvYnNlcnYtdmFyaGFzaCcpLFxuICAgIHZhbHVlOiByZXF1aXJlKCdvYnNlcnYnKSxcbiAgICBzdGF0ZTogc3RhdGUsXG5cbiAgICAvLyBSZW5kZXJcbiAgICBkaWZmOiByZXF1aXJlKCd2aXJ0dWFsLWRvbS92dHJlZS9kaWZmJyksXG4gICAgcGF0Y2g6IHJlcXVpcmUoJ3ZpcnR1YWwtZG9tL3Zkb20vcGF0Y2gnKSxcbiAgICBwYXJ0aWFsOiByZXF1aXJlKCd2ZG9tLXRodW5rJyksXG4gICAgY3JlYXRlOiByZXF1aXJlKCd2aXJ0dWFsLWRvbS92ZG9tL2NyZWF0ZS1lbGVtZW50JyksXG4gICAgaDogcmVxdWlyZSgndmlydHVhbC1kb20vdmlydHVhbC1oeXBlcnNjcmlwdCcpLFxuXG4gICAgLy8gVXRpbGl0aWVzXG4gICAgLy8gcmVtb3ZlIGZyb20gY29yZTogcmVxdWlyZSBjb21wdXRlZCBkaXJlY3RseSBpbnN0ZWFkLlxuICAgIGNvbXB1dGVkOiByZXF1aXJlKCdvYnNlcnYvY29tcHV0ZWQnKSxcbiAgICAvLyByZW1vdmUgZnJvbSBjb3JlOiByZXF1aXJlIHdhdGNoIGRpcmVjdGx5IGluc3RlYWQuXG4gICAgd2F0Y2g6IHJlcXVpcmUoJ29ic2Vydi93YXRjaCcpXG59O1xuXG5mdW5jdGlvbiBpbnB1dChuYW1lcykge1xuICAgIGlmICghbmFtZXMpIHtcbiAgICAgICAgcmV0dXJuIFNpbmdsZUV2ZW50KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIE11bHRpcGxlRXZlbnQobmFtZXMpO1xufVxuXG5mdW5jdGlvbiBzdGF0ZShvYmopIHtcbiAgICB2YXIgY29weSA9IGV4dGVuZChvYmopO1xuICAgIHZhciAkY2hhbm5lbHMgPSBjb3B5LmNoYW5uZWxzO1xuICAgIHZhciAkaGFuZGxlcyA9IGNvcHkuaGFuZGxlcztcblxuICAgIGlmICgkY2hhbm5lbHMpIHtcbiAgICAgICAgY29weS5jaGFubmVscyA9IG1lcmN1cnkudmFsdWUobnVsbCk7XG4gICAgfSBlbHNlIGlmICgkaGFuZGxlcykge1xuICAgICAgICBjb3B5LmhhbmRsZXMgPSBtZXJjdXJ5LnZhbHVlKG51bGwpO1xuICAgIH1cblxuICAgIHZhciBvYnNlcnYgPSBtZXJjdXJ5LnN0cnVjdChjb3B5KTtcbiAgICBpZiAoJGNoYW5uZWxzKSB7XG4gICAgICAgIG9ic2Vydi5jaGFubmVscy5zZXQobWVyY3VyeS5jaGFubmVscygkY2hhbm5lbHMsIG9ic2VydikpO1xuICAgIH0gZWxzZSBpZiAoJGhhbmRsZXMpIHtcbiAgICAgICAgb2JzZXJ2LmhhbmRsZXMuc2V0KG1lcmN1cnkuY2hhbm5lbHMoJGhhbmRsZXMsIG9ic2VydikpO1xuICAgIH1cbiAgICByZXR1cm4gb2JzZXJ2O1xufVxuXG5mdW5jdGlvbiBjaGFubmVscyhmdW5jcywgY29udGV4dCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhmdW5jcykucmVkdWNlKGNyZWF0ZUhhbmRsZSwge30pO1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlSGFuZGxlKGFjYywgbmFtZSkge1xuICAgICAgICB2YXIgaGFuZGxlID0gbWVyY3VyeS5EZWxlZ2F0b3IuYWxsb2NhdGVIYW5kbGUoXG4gICAgICAgICAgICBmdW5jc1tuYW1lXS5iaW5kKG51bGwsIGNvbnRleHQpKTtcblxuICAgICAgICBhY2NbbmFtZV0gPSBoYW5kbGU7XG4gICAgICAgIHJldHVybiBhY2M7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBhcHAoZWxlbSwgb2JzZXJ2LCByZW5kZXIsIG9wdHMpIHtcbiAgICBtZXJjdXJ5LkRlbGVnYXRvcihvcHRzKTtcbiAgICB2YXIgbG9vcCA9IG1lcmN1cnkubWFpbihvYnNlcnYoKSwgcmVuZGVyLCBleHRlbmQoe1xuICAgICAgICBkaWZmOiBtZXJjdXJ5LmRpZmYsXG4gICAgICAgIGNyZWF0ZTogbWVyY3VyeS5jcmVhdGUsXG4gICAgICAgIHBhdGNoOiBtZXJjdXJ5LnBhdGNoXG4gICAgfSwgb3B0cykpO1xuICAgIGlmIChlbGVtKSB7XG4gICAgICAgIGVsZW0uYXBwZW5kQ2hpbGQobG9vcC50YXJnZXQpO1xuICAgIH1cbiAgICByZXR1cm4gb2JzZXJ2KGxvb3AudXBkYXRlKTtcbn1cbiIsInZhciBFdlN0b3JlID0gcmVxdWlyZShcImV2LXN0b3JlXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gYWRkRXZlbnRcblxuZnVuY3Rpb24gYWRkRXZlbnQodGFyZ2V0LCB0eXBlLCBoYW5kbGVyKSB7XG4gICAgdmFyIGV2ZW50cyA9IEV2U3RvcmUodGFyZ2V0KVxuICAgIHZhciBldmVudCA9IGV2ZW50c1t0eXBlXVxuXG4gICAgaWYgKCFldmVudCkge1xuICAgICAgICBldmVudHNbdHlwZV0gPSBoYW5kbGVyXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGV2ZW50KSkge1xuICAgICAgICBpZiAoZXZlbnQuaW5kZXhPZihoYW5kbGVyKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIGV2ZW50LnB1c2goaGFuZGxlcilcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZXZlbnQgIT09IGhhbmRsZXIpIHtcbiAgICAgICAgZXZlbnRzW3R5cGVdID0gW2V2ZW50LCBoYW5kbGVyXVxuICAgIH1cbn1cbiIsInZhciBnbG9iYWxEb2N1bWVudCA9IHJlcXVpcmUoXCJnbG9iYWwvZG9jdW1lbnRcIilcbnZhciBFdlN0b3JlID0gcmVxdWlyZShcImV2LXN0b3JlXCIpXG52YXIgY3JlYXRlU3RvcmUgPSByZXF1aXJlKFwid2Vha21hcC1zaGltL2NyZWF0ZS1zdG9yZVwiKVxuXG52YXIgYWRkRXZlbnQgPSByZXF1aXJlKFwiLi9hZGQtZXZlbnQuanNcIilcbnZhciByZW1vdmVFdmVudCA9IHJlcXVpcmUoXCIuL3JlbW92ZS1ldmVudC5qc1wiKVxudmFyIFByb3h5RXZlbnQgPSByZXF1aXJlKFwiLi9wcm94eS1ldmVudC5qc1wiKVxuXG52YXIgSEFORExFUl9TVE9SRSA9IGNyZWF0ZVN0b3JlKClcblxubW9kdWxlLmV4cG9ydHMgPSBET01EZWxlZ2F0b3JcblxuZnVuY3Rpb24gRE9NRGVsZWdhdG9yKGRvY3VtZW50KSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIERPTURlbGVnYXRvcikpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBET01EZWxlZ2F0b3IoZG9jdW1lbnQpO1xuICAgIH1cblxuICAgIGRvY3VtZW50ID0gZG9jdW1lbnQgfHwgZ2xvYmFsRG9jdW1lbnRcblxuICAgIHRoaXMudGFyZ2V0ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG4gICAgdGhpcy5ldmVudHMgPSB7fVxuICAgIHRoaXMucmF3RXZlbnRMaXN0ZW5lcnMgPSB7fVxuICAgIHRoaXMuZ2xvYmFsTGlzdGVuZXJzID0ge31cbn1cblxuRE9NRGVsZWdhdG9yLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gYWRkRXZlbnRcbkRPTURlbGVnYXRvci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IHJlbW92ZUV2ZW50XG5cbkRPTURlbGVnYXRvci5hbGxvY2F0ZUhhbmRsZSA9XG4gICAgZnVuY3Rpb24gYWxsb2NhdGVIYW5kbGUoZnVuYykge1xuICAgICAgICB2YXIgaGFuZGxlID0gbmV3IEhhbmRsZSgpXG5cbiAgICAgICAgSEFORExFUl9TVE9SRShoYW5kbGUpLmZ1bmMgPSBmdW5jO1xuXG4gICAgICAgIHJldHVybiBoYW5kbGVcbiAgICB9XG5cbkRPTURlbGVnYXRvci50cmFuc2Zvcm1IYW5kbGUgPVxuICAgIGZ1bmN0aW9uIHRyYW5zZm9ybUhhbmRsZShoYW5kbGUsIGJyb2FkY2FzdCkge1xuICAgICAgICB2YXIgZnVuYyA9IEhBTkRMRVJfU1RPUkUoaGFuZGxlKS5mdW5jXG5cbiAgICAgICAgcmV0dXJuIHRoaXMuYWxsb2NhdGVIYW5kbGUoZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICBicm9hZGNhc3QoZXYsIGZ1bmMpO1xuICAgICAgICB9KVxuICAgIH1cblxuRE9NRGVsZWdhdG9yLnByb3RvdHlwZS5hZGRHbG9iYWxFdmVudExpc3RlbmVyID1cbiAgICBmdW5jdGlvbiBhZGRHbG9iYWxFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZm4pIHtcbiAgICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuZ2xvYmFsTGlzdGVuZXJzW2V2ZW50TmFtZV0gfHwgW107XG4gICAgICAgIGlmIChsaXN0ZW5lcnMuaW5kZXhPZihmbikgPT09IC0xKSB7XG4gICAgICAgICAgICBsaXN0ZW5lcnMucHVzaChmbilcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ2xvYmFsTGlzdGVuZXJzW2V2ZW50TmFtZV0gPSBsaXN0ZW5lcnM7XG4gICAgfVxuXG5ET01EZWxlZ2F0b3IucHJvdG90eXBlLnJlbW92ZUdsb2JhbEV2ZW50TGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUdsb2JhbEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBmbikge1xuICAgICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5nbG9iYWxMaXN0ZW5lcnNbZXZlbnROYW1lXSB8fCBbXTtcblxuICAgICAgICB2YXIgaW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZihmbilcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgbGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgfVxuICAgIH1cblxuRE9NRGVsZWdhdG9yLnByb3RvdHlwZS5saXN0ZW5UbyA9IGZ1bmN0aW9uIGxpc3RlblRvKGV2ZW50TmFtZSkge1xuICAgIGlmICghKGV2ZW50TmFtZSBpbiB0aGlzLmV2ZW50cykpIHtcbiAgICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXSA9IDA7XG4gICAgfVxuXG4gICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXSsrO1xuXG4gICAgaWYgKHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0gIT09IDEpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdmFyIGxpc3RlbmVyID0gdGhpcy5yYXdFdmVudExpc3RlbmVyc1tldmVudE5hbWVdXG4gICAgaWYgKCFsaXN0ZW5lcikge1xuICAgICAgICBsaXN0ZW5lciA9IHRoaXMucmF3RXZlbnRMaXN0ZW5lcnNbZXZlbnROYW1lXSA9XG4gICAgICAgICAgICBjcmVhdGVIYW5kbGVyKGV2ZW50TmFtZSwgdGhpcylcbiAgICB9XG5cbiAgICB0aGlzLnRhcmdldC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgbGlzdGVuZXIsIHRydWUpXG59XG5cbkRPTURlbGVnYXRvci5wcm90b3R5cGUudW5saXN0ZW5UbyA9IGZ1bmN0aW9uIHVubGlzdGVuVG8oZXZlbnROYW1lKSB7XG4gICAgaWYgKCEoZXZlbnROYW1lIGluIHRoaXMuZXZlbnRzKSkge1xuICAgICAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdID0gMDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5ldmVudHNbZXZlbnROYW1lXSA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJhbHJlYWR5IHVubGlzdGVuZWQgdG8gZXZlbnQuXCIpO1xuICAgIH1cblxuICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0tLTtcblxuICAgIGlmICh0aGlzLmV2ZW50c1tldmVudE5hbWVdICE9PSAwKSB7XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHZhciBsaXN0ZW5lciA9IHRoaXMucmF3RXZlbnRMaXN0ZW5lcnNbZXZlbnROYW1lXVxuXG4gICAgaWYgKCFsaXN0ZW5lcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJkb20tZGVsZWdhdG9yI3VubGlzdGVuVG86IGNhbm5vdCBcIiArXG4gICAgICAgICAgICBcInVubGlzdGVuIHRvIFwiICsgZXZlbnROYW1lKVxuICAgIH1cblxuICAgIHRoaXMudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBsaXN0ZW5lciwgdHJ1ZSlcbn1cblxuZnVuY3Rpb24gY3JlYXRlSGFuZGxlcihldmVudE5hbWUsIGRlbGVnYXRvcikge1xuICAgIHZhciBnbG9iYWxMaXN0ZW5lcnMgPSBkZWxlZ2F0b3IuZ2xvYmFsTGlzdGVuZXJzO1xuICAgIHZhciBkZWxlZ2F0b3JUYXJnZXQgPSBkZWxlZ2F0b3IudGFyZ2V0O1xuXG4gICAgcmV0dXJuIGhhbmRsZXJcblxuICAgIGZ1bmN0aW9uIGhhbmRsZXIoZXYpIHtcbiAgICAgICAgdmFyIGdsb2JhbEhhbmRsZXJzID0gZ2xvYmFsTGlzdGVuZXJzW2V2ZW50TmFtZV0gfHwgW11cblxuICAgICAgICBpZiAoZ2xvYmFsSGFuZGxlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdmFyIGdsb2JhbEV2ZW50ID0gbmV3IFByb3h5RXZlbnQoZXYpO1xuICAgICAgICAgICAgZ2xvYmFsRXZlbnQuY3VycmVudFRhcmdldCA9IGRlbGVnYXRvclRhcmdldDtcbiAgICAgICAgICAgIGNhbGxMaXN0ZW5lcnMoZ2xvYmFsSGFuZGxlcnMsIGdsb2JhbEV2ZW50KVxuICAgICAgICB9XG5cbiAgICAgICAgZmluZEFuZEludm9rZUxpc3RlbmVycyhldi50YXJnZXQsIGV2LCBldmVudE5hbWUpXG4gICAgfVxufVxuXG5mdW5jdGlvbiBmaW5kQW5kSW52b2tlTGlzdGVuZXJzKGVsZW0sIGV2LCBldmVudE5hbWUpIHtcbiAgICB2YXIgbGlzdGVuZXIgPSBnZXRMaXN0ZW5lcihlbGVtLCBldmVudE5hbWUpXG5cbiAgICBpZiAobGlzdGVuZXIgJiYgbGlzdGVuZXIuaGFuZGxlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgbGlzdGVuZXJFdmVudCA9IG5ldyBQcm94eUV2ZW50KGV2KTtcbiAgICAgICAgbGlzdGVuZXJFdmVudC5jdXJyZW50VGFyZ2V0ID0gbGlzdGVuZXIuY3VycmVudFRhcmdldFxuICAgICAgICBjYWxsTGlzdGVuZXJzKGxpc3RlbmVyLmhhbmRsZXJzLCBsaXN0ZW5lckV2ZW50KVxuXG4gICAgICAgIGlmIChsaXN0ZW5lckV2ZW50Ll9idWJibGVzKSB7XG4gICAgICAgICAgICB2YXIgbmV4dFRhcmdldCA9IGxpc3RlbmVyLmN1cnJlbnRUYXJnZXQucGFyZW50Tm9kZVxuICAgICAgICAgICAgZmluZEFuZEludm9rZUxpc3RlbmVycyhuZXh0VGFyZ2V0LCBldiwgZXZlbnROYW1lKVxuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRMaXN0ZW5lcih0YXJnZXQsIHR5cGUpIHtcbiAgICAvLyB0ZXJtaW5hdGUgcmVjdXJzaW9uIGlmIHBhcmVudCBpcyBgbnVsbGBcbiAgICBpZiAodGFyZ2V0ID09PSBudWxsIHx8IHR5cGVvZiB0YXJnZXQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG5cbiAgICB2YXIgZXZlbnRzID0gRXZTdG9yZSh0YXJnZXQpXG4gICAgLy8gZmV0Y2ggbGlzdCBvZiBoYW5kbGVyIGZucyBmb3IgdGhpcyBldmVudFxuICAgIHZhciBoYW5kbGVyID0gZXZlbnRzW3R5cGVdXG4gICAgdmFyIGFsbEhhbmRsZXIgPSBldmVudHMuZXZlbnRcblxuICAgIGlmICghaGFuZGxlciAmJiAhYWxsSGFuZGxlcikge1xuICAgICAgICByZXR1cm4gZ2V0TGlzdGVuZXIodGFyZ2V0LnBhcmVudE5vZGUsIHR5cGUpXG4gICAgfVxuXG4gICAgdmFyIGhhbmRsZXJzID0gW10uY29uY2F0KGhhbmRsZXIgfHwgW10sIGFsbEhhbmRsZXIgfHwgW10pXG4gICAgcmV0dXJuIG5ldyBMaXN0ZW5lcih0YXJnZXQsIGhhbmRsZXJzKVxufVxuXG5mdW5jdGlvbiBjYWxsTGlzdGVuZXJzKGhhbmRsZXJzLCBldikge1xuICAgIGhhbmRsZXJzLmZvckVhY2goZnVuY3Rpb24gKGhhbmRsZXIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGhhbmRsZXIoZXYpXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGhhbmRsZXIuaGFuZGxlRXZlbnQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgaGFuZGxlci5oYW5kbGVFdmVudChldilcbiAgICAgICAgfSBlbHNlIGlmIChoYW5kbGVyLnR5cGUgPT09IFwiZG9tLWRlbGVnYXRvci1oYW5kbGVcIikge1xuICAgICAgICAgICAgSEFORExFUl9TVE9SRShoYW5kbGVyKS5mdW5jKGV2KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZG9tLWRlbGVnYXRvcjogdW5rbm93biBoYW5kbGVyIFwiICtcbiAgICAgICAgICAgICAgICBcImZvdW5kOiBcIiArIEpTT04uc3RyaW5naWZ5KGhhbmRsZXJzKSk7XG4gICAgICAgIH1cbiAgICB9KVxufVxuXG5mdW5jdGlvbiBMaXN0ZW5lcih0YXJnZXQsIGhhbmRsZXJzKSB7XG4gICAgdGhpcy5jdXJyZW50VGFyZ2V0ID0gdGFyZ2V0XG4gICAgdGhpcy5oYW5kbGVycyA9IGhhbmRsZXJzXG59XG5cbmZ1bmN0aW9uIEhhbmRsZSgpIHtcbiAgICB0aGlzLnR5cGUgPSBcImRvbS1kZWxlZ2F0b3ItaGFuZGxlXCJcbn1cbiIsInZhciBJbmRpdmlkdWFsID0gcmVxdWlyZShcImluZGl2aWR1YWxcIilcbnZhciBjdWlkID0gcmVxdWlyZShcImN1aWRcIilcbnZhciBnbG9iYWxEb2N1bWVudCA9IHJlcXVpcmUoXCJnbG9iYWwvZG9jdW1lbnRcIilcblxudmFyIERPTURlbGVnYXRvciA9IHJlcXVpcmUoXCIuL2RvbS1kZWxlZ2F0b3IuanNcIilcblxudmFyIHZlcnNpb25LZXkgPSBcIjEzXCJcbnZhciBjYWNoZUtleSA9IFwiX19ET01fREVMRUdBVE9SX0NBQ0hFQFwiICsgdmVyc2lvbktleVxudmFyIGNhY2hlVG9rZW5LZXkgPSBcIl9fRE9NX0RFTEVHQVRPUl9DQUNIRV9UT0tFTkBcIiArIHZlcnNpb25LZXlcbnZhciBkZWxlZ2F0b3JDYWNoZSA9IEluZGl2aWR1YWwoY2FjaGVLZXksIHtcbiAgICBkZWxlZ2F0b3JzOiB7fVxufSlcbnZhciBjb21tb25FdmVudHMgPSBbXG4gICAgXCJibHVyXCIsIFwiY2hhbmdlXCIsIFwiY2xpY2tcIiwgIFwiY29udGV4dG1lbnVcIiwgXCJkYmxjbGlja1wiLFxuICAgIFwiZXJyb3JcIixcImZvY3VzXCIsIFwiZm9jdXNpblwiLCBcImZvY3Vzb3V0XCIsIFwiaW5wdXRcIiwgXCJrZXlkb3duXCIsXG4gICAgXCJrZXlwcmVzc1wiLCBcImtleXVwXCIsIFwibG9hZFwiLCBcIm1vdXNlZG93blwiLCBcIm1vdXNldXBcIixcbiAgICBcInJlc2l6ZVwiLCBcInNlbGVjdFwiLCBcInN1Ym1pdFwiLCBcInRvdWNoY2FuY2VsXCIsXG4gICAgXCJ0b3VjaGVuZFwiLCBcInRvdWNoc3RhcnRcIiwgXCJ1bmxvYWRcIlxuXVxuXG4vKiAgRGVsZWdhdG9yIGlzIGEgdGhpbiB3cmFwcGVyIGFyb3VuZCBhIHNpbmdsZXRvbiBgRE9NRGVsZWdhdG9yYFxuICAgICAgICBpbnN0YW5jZS5cblxuICAgIE9ubHkgb25lIERPTURlbGVnYXRvciBzaG91bGQgZXhpc3QgYmVjYXVzZSB3ZSBkbyBub3Qgd2FudFxuICAgICAgICBkdXBsaWNhdGUgZXZlbnQgbGlzdGVuZXJzIGJvdW5kIHRvIHRoZSBET00uXG5cbiAgICBgRGVsZWdhdG9yYCB3aWxsIGFsc28gYGxpc3RlblRvKClgIGFsbCBldmVudHMgdW5sZXNzXG4gICAgICAgIGV2ZXJ5IGNhbGxlciBvcHRzIG91dCBvZiBpdFxuKi9cbm1vZHVsZS5leHBvcnRzID0gRGVsZWdhdG9yXG5cbmZ1bmN0aW9uIERlbGVnYXRvcihvcHRzKSB7XG4gICAgb3B0cyA9IG9wdHMgfHwge31cbiAgICB2YXIgZG9jdW1lbnQgPSBvcHRzLmRvY3VtZW50IHx8IGdsb2JhbERvY3VtZW50XG5cbiAgICB2YXIgY2FjaGVLZXkgPSBkb2N1bWVudFtjYWNoZVRva2VuS2V5XVxuXG4gICAgaWYgKCFjYWNoZUtleSkge1xuICAgICAgICBjYWNoZUtleSA9XG4gICAgICAgICAgICBkb2N1bWVudFtjYWNoZVRva2VuS2V5XSA9IGN1aWQoKVxuICAgIH1cblxuICAgIHZhciBkZWxlZ2F0b3IgPSBkZWxlZ2F0b3JDYWNoZS5kZWxlZ2F0b3JzW2NhY2hlS2V5XVxuXG4gICAgaWYgKCFkZWxlZ2F0b3IpIHtcbiAgICAgICAgZGVsZWdhdG9yID0gZGVsZWdhdG9yQ2FjaGUuZGVsZWdhdG9yc1tjYWNoZUtleV0gPVxuICAgICAgICAgICAgbmV3IERPTURlbGVnYXRvcihkb2N1bWVudClcbiAgICB9XG5cbiAgICBpZiAob3B0cy5kZWZhdWx0RXZlbnRzICE9PSBmYWxzZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbW1vbkV2ZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZGVsZWdhdG9yLmxpc3RlblRvKGNvbW1vbkV2ZW50c1tpXSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkZWxlZ2F0b3Jcbn1cblxuRGVsZWdhdG9yLmFsbG9jYXRlSGFuZGxlID0gRE9NRGVsZWdhdG9yLmFsbG9jYXRlSGFuZGxlO1xuRGVsZWdhdG9yLnRyYW5zZm9ybUhhbmRsZSA9IERPTURlbGVnYXRvci50cmFuc2Zvcm1IYW5kbGU7XG4iLCIvKipcbiAqIGN1aWQuanNcbiAqIENvbGxpc2lvbi1yZXNpc3RhbnQgVUlEIGdlbmVyYXRvciBmb3IgYnJvd3NlcnMgYW5kIG5vZGUuXG4gKiBTZXF1ZW50aWFsIGZvciBmYXN0IGRiIGxvb2t1cHMgYW5kIHJlY2VuY3kgc29ydGluZy5cbiAqIFNhZmUgZm9yIGVsZW1lbnQgSURzIGFuZCBzZXJ2ZXItc2lkZSBsb29rdXBzLlxuICpcbiAqIEV4dHJhY3RlZCBmcm9tIENMQ1RSXG4gKlxuICogQ29weXJpZ2h0IChjKSBFcmljIEVsbGlvdHQgMjAxMlxuICogTUlUIExpY2Vuc2VcbiAqL1xuXG4vKmdsb2JhbCB3aW5kb3csIG5hdmlnYXRvciwgZG9jdW1lbnQsIHJlcXVpcmUsIHByb2Nlc3MsIG1vZHVsZSAqL1xuKGZ1bmN0aW9uIChhcHApIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICB2YXIgbmFtZXNwYWNlID0gJ2N1aWQnLFxuICAgIGMgPSAwLFxuICAgIGJsb2NrU2l6ZSA9IDQsXG4gICAgYmFzZSA9IDM2LFxuICAgIGRpc2NyZXRlVmFsdWVzID0gTWF0aC5wb3coYmFzZSwgYmxvY2tTaXplKSxcblxuICAgIHBhZCA9IGZ1bmN0aW9uIHBhZChudW0sIHNpemUpIHtcbiAgICAgIHZhciBzID0gXCIwMDAwMDAwMDBcIiArIG51bTtcbiAgICAgIHJldHVybiBzLnN1YnN0cihzLmxlbmd0aC1zaXplKTtcbiAgICB9LFxuXG4gICAgcmFuZG9tQmxvY2sgPSBmdW5jdGlvbiByYW5kb21CbG9jaygpIHtcbiAgICAgIHJldHVybiBwYWQoKE1hdGgucmFuZG9tKCkgKlxuICAgICAgICAgICAgZGlzY3JldGVWYWx1ZXMgPDwgMClcbiAgICAgICAgICAgIC50b1N0cmluZyhiYXNlKSwgYmxvY2tTaXplKTtcbiAgICB9LFxuXG4gICAgc2FmZUNvdW50ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjID0gKGMgPCBkaXNjcmV0ZVZhbHVlcykgPyBjIDogMDtcbiAgICAgIGMrKzsgLy8gdGhpcyBpcyBub3Qgc3VibGltaW5hbFxuICAgICAgcmV0dXJuIGMgLSAxO1xuICAgIH0sXG5cbiAgICBhcGkgPSBmdW5jdGlvbiBjdWlkKCkge1xuICAgICAgLy8gU3RhcnRpbmcgd2l0aCBhIGxvd2VyY2FzZSBsZXR0ZXIgbWFrZXNcbiAgICAgIC8vIGl0IEhUTUwgZWxlbWVudCBJRCBmcmllbmRseS5cbiAgICAgIHZhciBsZXR0ZXIgPSAnYycsIC8vIGhhcmQtY29kZWQgYWxsb3dzIGZvciBzZXF1ZW50aWFsIGFjY2Vzc1xuXG4gICAgICAgIC8vIHRpbWVzdGFtcFxuICAgICAgICAvLyB3YXJuaW5nOiB0aGlzIGV4cG9zZXMgdGhlIGV4YWN0IGRhdGUgYW5kIHRpbWVcbiAgICAgICAgLy8gdGhhdCB0aGUgdWlkIHdhcyBjcmVhdGVkLlxuICAgICAgICB0aW1lc3RhbXAgPSAobmV3IERhdGUoKS5nZXRUaW1lKCkpLnRvU3RyaW5nKGJhc2UpLFxuXG4gICAgICAgIC8vIFByZXZlbnQgc2FtZS1tYWNoaW5lIGNvbGxpc2lvbnMuXG4gICAgICAgIGNvdW50ZXIsXG5cbiAgICAgICAgLy8gQSBmZXcgY2hhcnMgdG8gZ2VuZXJhdGUgZGlzdGluY3QgaWRzIGZvciBkaWZmZXJlbnRcbiAgICAgICAgLy8gY2xpZW50cyAoc28gZGlmZmVyZW50IGNvbXB1dGVycyBhcmUgZmFyIGxlc3NcbiAgICAgICAgLy8gbGlrZWx5IHRvIGdlbmVyYXRlIHRoZSBzYW1lIGlkKVxuICAgICAgICBmaW5nZXJwcmludCA9IGFwaS5maW5nZXJwcmludCgpLFxuXG4gICAgICAgIC8vIEdyYWIgc29tZSBtb3JlIGNoYXJzIGZyb20gTWF0aC5yYW5kb20oKVxuICAgICAgICByYW5kb20gPSByYW5kb21CbG9jaygpICsgcmFuZG9tQmxvY2soKTtcblxuICAgICAgICBjb3VudGVyID0gcGFkKHNhZmVDb3VudGVyKCkudG9TdHJpbmcoYmFzZSksIGJsb2NrU2l6ZSk7XG5cbiAgICAgIHJldHVybiAgKGxldHRlciArIHRpbWVzdGFtcCArIGNvdW50ZXIgKyBmaW5nZXJwcmludCArIHJhbmRvbSk7XG4gICAgfTtcblxuICBhcGkuc2x1ZyA9IGZ1bmN0aW9uIHNsdWcoKSB7XG4gICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKS50b1N0cmluZygzNiksXG4gICAgICBjb3VudGVyLFxuICAgICAgcHJpbnQgPSBhcGkuZmluZ2VycHJpbnQoKS5zbGljZSgwLDEpICtcbiAgICAgICAgYXBpLmZpbmdlcnByaW50KCkuc2xpY2UoLTEpLFxuICAgICAgcmFuZG9tID0gcmFuZG9tQmxvY2soKS5zbGljZSgtMik7XG5cbiAgICAgIGNvdW50ZXIgPSBzYWZlQ291bnRlcigpLnRvU3RyaW5nKDM2KS5zbGljZSgtNCk7XG5cbiAgICByZXR1cm4gZGF0ZS5zbGljZSgtMikgK1xuICAgICAgY291bnRlciArIHByaW50ICsgcmFuZG9tO1xuICB9O1xuXG4gIGFwaS5nbG9iYWxDb3VudCA9IGZ1bmN0aW9uIGdsb2JhbENvdW50KCkge1xuICAgIC8vIFdlIHdhbnQgdG8gY2FjaGUgdGhlIHJlc3VsdHMgb2YgdGhpc1xuICAgIHZhciBjYWNoZSA9IChmdW5jdGlvbiBjYWxjKCkge1xuICAgICAgICB2YXIgaSxcbiAgICAgICAgICBjb3VudCA9IDA7XG5cbiAgICAgICAgZm9yIChpIGluIHdpbmRvdykge1xuICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY291bnQ7XG4gICAgICB9KCkpO1xuXG4gICAgYXBpLmdsb2JhbENvdW50ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gY2FjaGU7IH07XG4gICAgcmV0dXJuIGNhY2hlO1xuICB9O1xuXG4gIGFwaS5maW5nZXJwcmludCA9IGZ1bmN0aW9uIGJyb3dzZXJQcmludCgpIHtcbiAgICByZXR1cm4gcGFkKChuYXZpZ2F0b3IubWltZVR5cGVzLmxlbmd0aCArXG4gICAgICBuYXZpZ2F0b3IudXNlckFnZW50Lmxlbmd0aCkudG9TdHJpbmcoMzYpICtcbiAgICAgIGFwaS5nbG9iYWxDb3VudCgpLnRvU3RyaW5nKDM2KSwgNCk7XG4gIH07XG5cbiAgLy8gZG9uJ3QgY2hhbmdlIGFueXRoaW5nIGZyb20gaGVyZSBkb3duLlxuICBpZiAoYXBwLnJlZ2lzdGVyKSB7XG4gICAgYXBwLnJlZ2lzdGVyKG5hbWVzcGFjZSwgYXBpKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gYXBpO1xuICB9IGVsc2Uge1xuICAgIGFwcFtuYW1lc3BhY2VdID0gYXBpO1xuICB9XG5cbn0odGhpcy5hcHBsaXR1ZGUgfHwgdGhpcykpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgT25lVmVyc2lvbkNvbnN0cmFpbnQgPSByZXF1aXJlKCdpbmRpdmlkdWFsL29uZS12ZXJzaW9uJyk7XG5cbnZhciBNWV9WRVJTSU9OID0gJzcnO1xuT25lVmVyc2lvbkNvbnN0cmFpbnQoJ2V2LXN0b3JlJywgTVlfVkVSU0lPTik7XG5cbnZhciBoYXNoS2V5ID0gJ19fRVZfU1RPUkVfS0VZQCcgKyBNWV9WRVJTSU9OO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEV2U3RvcmU7XG5cbmZ1bmN0aW9uIEV2U3RvcmUoZWxlbSkge1xuICAgIHZhciBoYXNoID0gZWxlbVtoYXNoS2V5XTtcblxuICAgIGlmICghaGFzaCkge1xuICAgICAgICBoYXNoID0gZWxlbVtoYXNoS2V5XSA9IHt9O1xuICAgIH1cblxuICAgIHJldHVybiBoYXNoO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKmdsb2JhbCB3aW5kb3csIGdsb2JhbCovXG5cbnZhciByb290ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgP1xuICAgIHdpbmRvdyA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID9cbiAgICBnbG9iYWwgOiB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbmRpdmlkdWFsO1xuXG5mdW5jdGlvbiBJbmRpdmlkdWFsKGtleSwgdmFsdWUpIHtcbiAgICBpZiAoa2V5IGluIHJvb3QpIHtcbiAgICAgICAgcmV0dXJuIHJvb3Rba2V5XTtcbiAgICB9XG5cbiAgICByb290W2tleV0gPSB2YWx1ZTtcblxuICAgIHJldHVybiB2YWx1ZTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEluZGl2aWR1YWwgPSByZXF1aXJlKCcuL2luZGV4LmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gT25lVmVyc2lvbjtcblxuZnVuY3Rpb24gT25lVmVyc2lvbihtb2R1bGVOYW1lLCB2ZXJzaW9uLCBkZWZhdWx0VmFsdWUpIHtcbiAgICB2YXIga2V5ID0gJ19fSU5ESVZJRFVBTF9PTkVfVkVSU0lPTl8nICsgbW9kdWxlTmFtZTtcbiAgICB2YXIgZW5mb3JjZUtleSA9IGtleSArICdfRU5GT1JDRV9TSU5HTEVUT04nO1xuXG4gICAgdmFyIHZlcnNpb25WYWx1ZSA9IEluZGl2aWR1YWwoZW5mb3JjZUtleSwgdmVyc2lvbik7XG5cbiAgICBpZiAodmVyc2lvblZhbHVlICE9PSB2ZXJzaW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG9ubHkgaGF2ZSBvbmUgY29weSBvZiAnICtcbiAgICAgICAgICAgIG1vZHVsZU5hbWUgKyAnLlxcbicgK1xuICAgICAgICAgICAgJ1lvdSBhbHJlYWR5IGhhdmUgdmVyc2lvbiAnICsgdmVyc2lvblZhbHVlICtcbiAgICAgICAgICAgICcgaW5zdGFsbGVkLlxcbicgK1xuICAgICAgICAgICAgJ1RoaXMgbWVhbnMgeW91IGNhbm5vdCBpbnN0YWxsIHZlcnNpb24gJyArIHZlcnNpb24pO1xuICAgIH1cblxuICAgIHJldHVybiBJbmRpdmlkdWFsKGtleSwgZGVmYXVsdFZhbHVlKTtcbn1cbiIsInZhciB0b3BMZXZlbCA9IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDpcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHt9XG52YXIgbWluRG9jID0gcmVxdWlyZSgnbWluLWRvY3VtZW50Jyk7XG5cbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBkb2N1bWVudDtcbn0gZWxzZSB7XG4gICAgdmFyIGRvY2N5ID0gdG9wTGV2ZWxbJ19fR0xPQkFMX0RPQ1VNRU5UX0NBQ0hFQDQnXTtcblxuICAgIGlmICghZG9jY3kpIHtcbiAgICAgICAgZG9jY3kgPSB0b3BMZXZlbFsnX19HTE9CQUxfRE9DVU1FTlRfQ0FDSEVANCddID0gbWluRG9jO1xuICAgIH1cblxuICAgIG1vZHVsZS5leHBvcnRzID0gZG9jY3k7XG59XG4iLCJ2YXIgcm9vdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID9cbiAgICB3aW5kb3cgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/XG4gICAgZ2xvYmFsIDoge307XG5cbm1vZHVsZS5leHBvcnRzID0gSW5kaXZpZHVhbFxuXG5mdW5jdGlvbiBJbmRpdmlkdWFsKGtleSwgdmFsdWUpIHtcbiAgICBpZiAocm9vdFtrZXldKSB7XG4gICAgICAgIHJldHVybiByb290W2tleV1cbiAgICB9XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocm9vdCwga2V5LCB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAsIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pXG5cbiAgICByZXR1cm4gdmFsdWVcbn1cbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwidmFyIGhpZGRlblN0b3JlID0gcmVxdWlyZSgnLi9oaWRkZW4tc3RvcmUuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVTdG9yZTtcblxuZnVuY3Rpb24gY3JlYXRlU3RvcmUoKSB7XG4gICAgdmFyIGtleSA9IHt9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgaWYgKCh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0JyB8fCBvYmogPT09IG51bGwpICYmXG4gICAgICAgICAgICB0eXBlb2Ygb2JqICE9PSAnZnVuY3Rpb24nXG4gICAgICAgICkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXZWFrbWFwLXNoaW06IEtleSBtdXN0IGJlIG9iamVjdCcpXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc3RvcmUgPSBvYmoudmFsdWVPZihrZXkpO1xuICAgICAgICByZXR1cm4gc3RvcmUgJiYgc3RvcmUuaWRlbnRpdHkgPT09IGtleSA/XG4gICAgICAgICAgICBzdG9yZSA6IGhpZGRlblN0b3JlKG9iaiwga2V5KTtcbiAgICB9O1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBoaWRkZW5TdG9yZTtcblxuZnVuY3Rpb24gaGlkZGVuU3RvcmUob2JqLCBrZXkpIHtcbiAgICB2YXIgc3RvcmUgPSB7IGlkZW50aXR5OiBrZXkgfTtcbiAgICB2YXIgdmFsdWVPZiA9IG9iai52YWx1ZU9mO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgXCJ2YWx1ZU9mXCIsIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlICE9PSBrZXkgP1xuICAgICAgICAgICAgICAgIHZhbHVlT2YuYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IHN0b3JlO1xuICAgICAgICB9LFxuICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHN0b3JlO1xufVxuIiwidmFyIGluaGVyaXRzID0gcmVxdWlyZShcImluaGVyaXRzXCIpXG5cbnZhciBBTExfUFJPUFMgPSBbXG4gICAgXCJhbHRLZXlcIiwgXCJidWJibGVzXCIsIFwiY2FuY2VsYWJsZVwiLCBcImN0cmxLZXlcIixcbiAgICBcImV2ZW50UGhhc2VcIiwgXCJtZXRhS2V5XCIsIFwicmVsYXRlZFRhcmdldFwiLCBcInNoaWZ0S2V5XCIsXG4gICAgXCJ0YXJnZXRcIiwgXCJ0aW1lU3RhbXBcIiwgXCJ0eXBlXCIsIFwidmlld1wiLCBcIndoaWNoXCJcbl1cbnZhciBLRVlfUFJPUFMgPSBbXCJjaGFyXCIsIFwiY2hhckNvZGVcIiwgXCJrZXlcIiwgXCJrZXlDb2RlXCJdXG52YXIgTU9VU0VfUFJPUFMgPSBbXG4gICAgXCJidXR0b25cIiwgXCJidXR0b25zXCIsIFwiY2xpZW50WFwiLCBcImNsaWVudFlcIiwgXCJsYXllclhcIixcbiAgICBcImxheWVyWVwiLCBcIm9mZnNldFhcIiwgXCJvZmZzZXRZXCIsIFwicGFnZVhcIiwgXCJwYWdlWVwiLFxuICAgIFwic2NyZWVuWFwiLCBcInNjcmVlbllcIiwgXCJ0b0VsZW1lbnRcIlxuXVxuXG52YXIgcmtleUV2ZW50ID0gL15rZXl8aW5wdXQvXG52YXIgcm1vdXNlRXZlbnQgPSAvXig/Om1vdXNlfHBvaW50ZXJ8Y29udGV4dG1lbnUpfGNsaWNrL1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb3h5RXZlbnRcblxuZnVuY3Rpb24gUHJveHlFdmVudChldikge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBQcm94eUV2ZW50KSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb3h5RXZlbnQoZXYpXG4gICAgfVxuXG4gICAgaWYgKHJrZXlFdmVudC50ZXN0KGV2LnR5cGUpKSB7XG4gICAgICAgIHJldHVybiBuZXcgS2V5RXZlbnQoZXYpXG4gICAgfSBlbHNlIGlmIChybW91c2VFdmVudC50ZXN0KGV2LnR5cGUpKSB7XG4gICAgICAgIHJldHVybiBuZXcgTW91c2VFdmVudChldilcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IEFMTF9QUk9QUy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcHJvcEtleSA9IEFMTF9QUk9QU1tpXVxuICAgICAgICB0aGlzW3Byb3BLZXldID0gZXZbcHJvcEtleV1cbiAgICB9XG5cbiAgICB0aGlzLl9yYXdFdmVudCA9IGV2XG4gICAgdGhpcy5fYnViYmxlcyA9IGZhbHNlO1xufVxuXG5Qcm94eUV2ZW50LnByb3RvdHlwZS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9yYXdFdmVudC5wcmV2ZW50RGVmYXVsdCgpXG59XG5cblByb3h5RXZlbnQucHJvdG90eXBlLnN0YXJ0UHJvcGFnYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fYnViYmxlcyA9IHRydWU7XG59XG5cbmZ1bmN0aW9uIE1vdXNlRXZlbnQoZXYpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IEFMTF9QUk9QUy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcHJvcEtleSA9IEFMTF9QUk9QU1tpXVxuICAgICAgICB0aGlzW3Byb3BLZXldID0gZXZbcHJvcEtleV1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IE1PVVNFX1BST1BTLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciBtb3VzZVByb3BLZXkgPSBNT1VTRV9QUk9QU1tqXVxuICAgICAgICB0aGlzW21vdXNlUHJvcEtleV0gPSBldlttb3VzZVByb3BLZXldXG4gICAgfVxuXG4gICAgdGhpcy5fcmF3RXZlbnQgPSBldlxufVxuXG5pbmhlcml0cyhNb3VzZUV2ZW50LCBQcm94eUV2ZW50KVxuXG5mdW5jdGlvbiBLZXlFdmVudChldikge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgQUxMX1BST1BTLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBwcm9wS2V5ID0gQUxMX1BST1BTW2ldXG4gICAgICAgIHRoaXNbcHJvcEtleV0gPSBldltwcm9wS2V5XVxuICAgIH1cblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgS0VZX1BST1BTLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciBrZXlQcm9wS2V5ID0gS0VZX1BST1BTW2pdXG4gICAgICAgIHRoaXNba2V5UHJvcEtleV0gPSBldltrZXlQcm9wS2V5XVxuICAgIH1cblxuICAgIHRoaXMuX3Jhd0V2ZW50ID0gZXZcbn1cblxuaW5oZXJpdHMoS2V5RXZlbnQsIFByb3h5RXZlbnQpXG4iLCJ2YXIgRXZTdG9yZSA9IHJlcXVpcmUoXCJldi1zdG9yZVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlbW92ZUV2ZW50XG5cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50KHRhcmdldCwgdHlwZSwgaGFuZGxlcikge1xuICAgIHZhciBldmVudHMgPSBFdlN0b3JlKHRhcmdldClcbiAgICB2YXIgZXZlbnQgPSBldmVudHNbdHlwZV1cblxuICAgIGlmICghZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGV2ZW50KSkge1xuICAgICAgICB2YXIgaW5kZXggPSBldmVudC5pbmRleE9mKGhhbmRsZXIpXG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgIGV2ZW50LnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZXZlbnQgPT09IGhhbmRsZXIpIHtcbiAgICAgICAgZXZlbnRzW3R5cGVdID0gbnVsbFxuICAgIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gRXZlbnRcblxuZnVuY3Rpb24gRXZlbnQoKSB7XG4gICAgdmFyIGxpc3RlbmVycyA9IFtdXG5cbiAgICByZXR1cm4geyBicm9hZGNhc3Q6IGJyb2FkY2FzdCwgbGlzdGVuOiBldmVudCB9XG5cbiAgICBmdW5jdGlvbiBicm9hZGNhc3QodmFsdWUpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxpc3RlbmVyc1tpXSh2YWx1ZSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV2ZW50KGxpc3RlbmVyKSB7XG4gICAgICAgIGxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKVxuXG4gICAgICAgIHJldHVybiByZW1vdmVMaXN0ZW5lclxuXG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKCkge1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gbGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpXG4gICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsInZhciBldmVudCA9IHJlcXVpcmUoXCIuL3NpbmdsZS5qc1wiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IG11bHRpcGxlXG5cbmZ1bmN0aW9uIG11bHRpcGxlKG5hbWVzKSB7XG4gICAgcmV0dXJuIG5hbWVzLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBuYW1lKSB7XG4gICAgICAgIGFjY1tuYW1lXSA9IGV2ZW50KClcbiAgICAgICAgcmV0dXJuIGFjY1xuICAgIH0sIHt9KVxufVxuIiwidmFyIEV2ZW50ID0gcmVxdWlyZSgnLi9ldmVudC5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gU2luZ2xlXG5cbmZ1bmN0aW9uIFNpbmdsZSgpIHtcbiAgICB2YXIgdHVwbGUgPSBFdmVudCgpXG5cbiAgICByZXR1cm4gZnVuY3Rpb24gZXZlbnQodmFsdWUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdHVwbGUubGlzdGVuKHZhbHVlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHR1cGxlLmJyb2FkY2FzdCh2YWx1ZSlcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsInZhciByYWYgPSByZXF1aXJlKFwicmFmXCIpXG52YXIgVHlwZWRFcnJvciA9IHJlcXVpcmUoXCJlcnJvci90eXBlZFwiKVxuXG52YXIgSW52YWxpZFVwZGF0ZUluUmVuZGVyID0gVHlwZWRFcnJvcih7XG4gICAgdHlwZTogXCJtYWluLWxvb3AuaW52YWxpZC51cGRhdGUuaW4tcmVuZGVyXCIsXG4gICAgbWVzc2FnZTogXCJtYWluLWxvb3A6IFVuZXhwZWN0ZWQgdXBkYXRlIG9jY3VycmVkIGluIGxvb3AuXFxuXCIgK1xuICAgICAgICBcIldlIGFyZSBjdXJyZW50bHkgcmVuZGVyaW5nIGEgdmlldywgXCIgK1xuICAgICAgICAgICAgXCJ5b3UgY2FuJ3QgY2hhbmdlIHN0YXRlIHJpZ2h0IG5vdy5cXG5cIiArXG4gICAgICAgIFwiVGhlIGRpZmYgaXM6IHtzdHJpbmdEaWZmfS5cXG5cIiArXG4gICAgICAgIFwiU1VHR0VTVEVEIEZJWDogZmluZCB0aGUgc3RhdGUgbXV0YXRpb24gaW4geW91ciB2aWV3IFwiICtcbiAgICAgICAgICAgIFwib3IgcmVuZGVyaW5nIGZ1bmN0aW9uIGFuZCByZW1vdmUgaXQuXFxuXCIgK1xuICAgICAgICBcIlRoZSB2aWV3IHNob3VsZCBub3QgaGF2ZSBhbnkgc2lkZSBlZmZlY3RzLlxcblwiLFxuICAgIGRpZmY6IG51bGwsXG4gICAgc3RyaW5nRGlmZjogbnVsbFxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBtYWluXG5cbmZ1bmN0aW9uIG1haW4oaW5pdGlhbFN0YXRlLCB2aWV3LCBvcHRzKSB7XG4gICAgb3B0cyA9IG9wdHMgfHwge31cblxuICAgIHZhciBjdXJyZW50U3RhdGUgPSBpbml0aWFsU3RhdGVcbiAgICB2YXIgY3JlYXRlID0gb3B0cy5jcmVhdGVcbiAgICB2YXIgZGlmZiA9IG9wdHMuZGlmZlxuICAgIHZhciBwYXRjaCA9IG9wdHMucGF0Y2hcbiAgICB2YXIgcmVkcmF3U2NoZWR1bGVkID0gZmFsc2VcblxuICAgIHZhciB0cmVlID0gb3B0cy5pbml0aWFsVHJlZSB8fCB2aWV3KGN1cnJlbnRTdGF0ZSlcbiAgICB2YXIgdGFyZ2V0ID0gb3B0cy50YXJnZXQgfHwgY3JlYXRlKHRyZWUsIG9wdHMpXG4gICAgdmFyIGluUmVuZGVyaW5nVHJhbnNhY3Rpb24gPSBmYWxzZVxuXG4gICAgY3VycmVudFN0YXRlID0gbnVsbFxuXG4gICAgdmFyIGxvb3AgPSB7XG4gICAgICAgIHN0YXRlOiBpbml0aWFsU3RhdGUsXG4gICAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgICB1cGRhdGU6IHVwZGF0ZVxuICAgIH1cbiAgICByZXR1cm4gbG9vcFxuXG4gICAgZnVuY3Rpb24gdXBkYXRlKHN0YXRlKSB7XG4gICAgICAgIGlmIChpblJlbmRlcmluZ1RyYW5zYWN0aW9uKSB7XG4gICAgICAgICAgICB0aHJvdyBJbnZhbGlkVXBkYXRlSW5SZW5kZXIoe1xuICAgICAgICAgICAgICAgIGRpZmY6IHN0YXRlLl9kaWZmLFxuICAgICAgICAgICAgICAgIHN0cmluZ0RpZmY6IEpTT04uc3RyaW5naWZ5KHN0YXRlLl9kaWZmKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjdXJyZW50U3RhdGUgPT09IG51bGwgJiYgIXJlZHJhd1NjaGVkdWxlZCkge1xuICAgICAgICAgICAgcmVkcmF3U2NoZWR1bGVkID0gdHJ1ZVxuICAgICAgICAgICAgcmFmKHJlZHJhdylcbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnRTdGF0ZSA9IHN0YXRlXG4gICAgICAgIGxvb3Auc3RhdGUgPSBzdGF0ZVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlZHJhdygpIHtcbiAgICAgICAgcmVkcmF3U2NoZWR1bGVkID0gZmFsc2VcbiAgICAgICAgaWYgKGN1cnJlbnRTdGF0ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBpblJlbmRlcmluZ1RyYW5zYWN0aW9uID0gdHJ1ZVxuICAgICAgICB2YXIgbmV3VHJlZSA9IHZpZXcoY3VycmVudFN0YXRlKVxuXG4gICAgICAgIGlmIChvcHRzLmNyZWF0ZU9ubHkpIHtcbiAgICAgICAgICAgIGluUmVuZGVyaW5nVHJhbnNhY3Rpb24gPSBmYWxzZVxuICAgICAgICAgICAgY3JlYXRlKG5ld1RyZWUsIG9wdHMpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgcGF0Y2hlcyA9IGRpZmYodHJlZSwgbmV3VHJlZSwgb3B0cylcbiAgICAgICAgICAgIGluUmVuZGVyaW5nVHJhbnNhY3Rpb24gPSBmYWxzZVxuICAgICAgICAgICAgdGFyZ2V0ID0gcGF0Y2godGFyZ2V0LCBwYXRjaGVzLCBvcHRzKVxuICAgICAgICB9XG5cbiAgICAgICAgdHJlZSA9IG5ld1RyZWVcbiAgICAgICAgY3VycmVudFN0YXRlID0gbnVsbFxuICAgIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKHR5cGVvZiBvYmogPT09ICdzdHJpbmcnKSByZXR1cm4gY2FtZWxDYXNlKG9iaik7XG4gICAgcmV0dXJuIHdhbGsob2JqKTtcbn07XG5cbmZ1bmN0aW9uIHdhbGsgKG9iaikge1xuICAgIGlmICghb2JqIHx8IHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSByZXR1cm4gb2JqO1xuICAgIGlmIChpc0RhdGUob2JqKSB8fCBpc1JlZ2V4KG9iaikpIHJldHVybiBvYmo7XG4gICAgaWYgKGlzQXJyYXkob2JqKSkgcmV0dXJuIG1hcChvYmosIHdhbGspO1xuICAgIHJldHVybiByZWR1Y2Uob2JqZWN0S2V5cyhvYmopLCBmdW5jdGlvbiAoYWNjLCBrZXkpIHtcbiAgICAgICAgdmFyIGNhbWVsID0gY2FtZWxDYXNlKGtleSk7XG4gICAgICAgIGFjY1tjYW1lbF0gPSB3YWxrKG9ialtrZXldKTtcbiAgICAgICAgcmV0dXJuIGFjYztcbiAgICB9LCB7fSk7XG59XG5cbmZ1bmN0aW9uIGNhbWVsQ2FzZShzdHIpIHtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1tfLi1dKFxcd3wkKS9nLCBmdW5jdGlvbiAoXyx4KSB7XG4gICAgICAgIHJldHVybiB4LnRvVXBwZXJDYXNlKCk7XG4gICAgfSk7XG59XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxudmFyIGlzRGF0ZSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IERhdGVdJztcbn07XG5cbnZhciBpc1JlZ2V4ID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59O1xuXG52YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgICBpZiAoaGFzLmNhbGwob2JqLCBrZXkpKSBrZXlzLnB1c2goa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIGtleXM7XG59O1xuXG5mdW5jdGlvbiBtYXAgKHhzLCBmKSB7XG4gICAgaWYgKHhzLm1hcCkgcmV0dXJuIHhzLm1hcChmKTtcbiAgICB2YXIgcmVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgICAgICByZXMucHVzaChmKHhzW2ldLCBpKSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIHJlZHVjZSAoeHMsIGYsIGFjYykge1xuICAgIGlmICh4cy5yZWR1Y2UpIHJldHVybiB4cy5yZWR1Y2UoZiwgYWNjKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFjYyA9IGYoYWNjLCB4c1tpXSwgaSk7XG4gICAgfVxuICAgIHJldHVybiBhY2M7XG59XG4iLCJ2YXIgbmFyZ3MgPSAvXFx7KFswLTlhLXpBLVpdKylcXH0vZ1xudmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlXG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGVcblxuZnVuY3Rpb24gdGVtcGxhdGUoc3RyaW5nKSB7XG4gICAgdmFyIGFyZ3NcblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyICYmIHR5cGVvZiBhcmd1bWVudHNbMV0gPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgYXJncyA9IGFyZ3VtZW50c1sxXVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgICB9XG5cbiAgICBpZiAoIWFyZ3MgfHwgIWFyZ3MuaGFzT3duUHJvcGVydHkpIHtcbiAgICAgICAgYXJncyA9IHt9XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKG5hcmdzLCBmdW5jdGlvbiByZXBsYWNlQXJnKG1hdGNoLCBpLCBpbmRleCkge1xuICAgICAgICB2YXIgcmVzdWx0XG5cbiAgICAgICAgaWYgKHN0cmluZ1tpbmRleCAtIDFdID09PSBcIntcIiAmJlxuICAgICAgICAgICAgc3RyaW5nW2luZGV4ICsgbWF0Y2gubGVuZ3RoXSA9PT0gXCJ9XCIpIHtcbiAgICAgICAgICAgIHJldHVybiBpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSBhcmdzLmhhc093blByb3BlcnR5KGkpID8gYXJnc1tpXSA6IG51bGxcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IG51bGwgfHwgcmVzdWx0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJcIlxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgIH1cbiAgICB9KVxufVxuIiwidmFyIGNhbWVsaXplID0gcmVxdWlyZShcImNhbWVsaXplXCIpXG52YXIgdGVtcGxhdGUgPSByZXF1aXJlKFwic3RyaW5nLXRlbXBsYXRlXCIpXG52YXIgZXh0ZW5kID0gcmVxdWlyZShcInh0ZW5kL211dGFibGVcIilcblxubW9kdWxlLmV4cG9ydHMgPSBUeXBlZEVycm9yXG5cbmZ1bmN0aW9uIFR5cGVkRXJyb3IoYXJncykge1xuICAgIGlmICghYXJncykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJhcmdzIGlzIHJlcXVpcmVkXCIpO1xuICAgIH1cbiAgICBpZiAoIWFyZ3MudHlwZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJhcmdzLnR5cGUgaXMgcmVxdWlyZWRcIik7XG4gICAgfVxuICAgIGlmICghYXJncy5tZXNzYWdlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImFyZ3MubWVzc2FnZSBpcyByZXF1aXJlZFwiKTtcbiAgICB9XG5cbiAgICB2YXIgbWVzc2FnZSA9IGFyZ3MubWVzc2FnZVxuXG4gICAgaWYgKGFyZ3MudHlwZSAmJiAhYXJncy5uYW1lKSB7XG4gICAgICAgIHZhciBlcnJvck5hbWUgPSBjYW1lbGl6ZShhcmdzLnR5cGUpICsgXCJFcnJvclwiXG4gICAgICAgIGFyZ3MubmFtZSA9IGVycm9yTmFtZVswXS50b1VwcGVyQ2FzZSgpICsgZXJyb3JOYW1lLnN1YnN0cigxKVxuICAgIH1cblxuICAgIGV4dGVuZChjcmVhdGVFcnJvciwgYXJncyk7XG4gICAgY3JlYXRlRXJyb3IuX25hbWUgPSBhcmdzLm5hbWU7XG5cbiAgICByZXR1cm4gY3JlYXRlRXJyb3I7XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVFcnJvcihvcHRzKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBuZXcgRXJyb3IoKVxuXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyZXN1bHQsIFwidHlwZVwiLCB7XG4gICAgICAgICAgICB2YWx1ZTogcmVzdWx0LnR5cGUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSlcblxuICAgICAgICB2YXIgb3B0aW9ucyA9IGV4dGVuZCh7fSwgYXJncywgb3B0cylcblxuICAgICAgICBleHRlbmQocmVzdWx0LCBvcHRpb25zKVxuICAgICAgICByZXN1bHQubWVzc2FnZSA9IHRlbXBsYXRlKG1lc3NhZ2UsIG9wdGlvbnMpXG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cbn1cblxuIiwidmFyIG5vdyA9IHJlcXVpcmUoJ3BlcmZvcm1hbmNlLW5vdycpXG4gICwgZ2xvYmFsID0gdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgPyB7fSA6IHdpbmRvd1xuICAsIHZlbmRvcnMgPSBbJ21veicsICd3ZWJraXQnXVxuICAsIHN1ZmZpeCA9ICdBbmltYXRpb25GcmFtZSdcbiAgLCByYWYgPSBnbG9iYWxbJ3JlcXVlc3QnICsgc3VmZml4XVxuICAsIGNhZiA9IGdsb2JhbFsnY2FuY2VsJyArIHN1ZmZpeF0gfHwgZ2xvYmFsWydjYW5jZWxSZXF1ZXN0JyArIHN1ZmZpeF1cbiAgLCBpc05hdGl2ZSA9IHRydWVcblxuZm9yKHZhciBpID0gMDsgaSA8IHZlbmRvcnMubGVuZ3RoICYmICFyYWY7IGkrKykge1xuICByYWYgPSBnbG9iYWxbdmVuZG9yc1tpXSArICdSZXF1ZXN0JyArIHN1ZmZpeF1cbiAgY2FmID0gZ2xvYmFsW3ZlbmRvcnNbaV0gKyAnQ2FuY2VsJyArIHN1ZmZpeF1cbiAgICAgIHx8IGdsb2JhbFt2ZW5kb3JzW2ldICsgJ0NhbmNlbFJlcXVlc3QnICsgc3VmZml4XVxufVxuXG4vLyBTb21lIHZlcnNpb25zIG9mIEZGIGhhdmUgckFGIGJ1dCBub3QgY0FGXG5pZighcmFmIHx8ICFjYWYpIHtcbiAgaXNOYXRpdmUgPSBmYWxzZVxuXG4gIHZhciBsYXN0ID0gMFxuICAgICwgaWQgPSAwXG4gICAgLCBxdWV1ZSA9IFtdXG4gICAgLCBmcmFtZUR1cmF0aW9uID0gMTAwMCAvIDYwXG5cbiAgcmFmID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICBpZihxdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHZhciBfbm93ID0gbm93KClcbiAgICAgICAgLCBuZXh0ID0gTWF0aC5tYXgoMCwgZnJhbWVEdXJhdGlvbiAtIChfbm93IC0gbGFzdCkpXG4gICAgICBsYXN0ID0gbmV4dCArIF9ub3dcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjcCA9IHF1ZXVlLnNsaWNlKDApXG4gICAgICAgIC8vIENsZWFyIHF1ZXVlIGhlcmUgdG8gcHJldmVudFxuICAgICAgICAvLyBjYWxsYmFja3MgZnJvbSBhcHBlbmRpbmcgbGlzdGVuZXJzXG4gICAgICAgIC8vIHRvIHRoZSBjdXJyZW50IGZyYW1lJ3MgcXVldWVcbiAgICAgICAgcXVldWUubGVuZ3RoID0gMFxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgY3AubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZighY3BbaV0uY2FuY2VsbGVkKSB7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgIGNwW2ldLmNhbGxiYWNrKGxhc3QpXG4gICAgICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgdGhyb3cgZSB9LCAwKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgTWF0aC5yb3VuZChuZXh0KSlcbiAgICB9XG4gICAgcXVldWUucHVzaCh7XG4gICAgICBoYW5kbGU6ICsraWQsXG4gICAgICBjYWxsYmFjazogY2FsbGJhY2ssXG4gICAgICBjYW5jZWxsZWQ6IGZhbHNlXG4gICAgfSlcbiAgICByZXR1cm4gaWRcbiAgfVxuXG4gIGNhZiA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBxdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYocXVldWVbaV0uaGFuZGxlID09PSBoYW5kbGUpIHtcbiAgICAgICAgcXVldWVbaV0uY2FuY2VsbGVkID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZuKSB7XG4gIC8vIFdyYXAgaW4gYSBuZXcgZnVuY3Rpb24gdG8gcHJldmVudFxuICAvLyBgY2FuY2VsYCBwb3RlbnRpYWxseSBiZWluZyBhc3NpZ25lZFxuICAvLyB0byB0aGUgbmF0aXZlIHJBRiBmdW5jdGlvblxuICBpZighaXNOYXRpdmUpIHtcbiAgICByZXR1cm4gcmFmLmNhbGwoZ2xvYmFsLCBmbilcbiAgfVxuICByZXR1cm4gcmFmLmNhbGwoZ2xvYmFsLCBmdW5jdGlvbigpIHtcbiAgICB0cnl7XG4gICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyB0aHJvdyBlIH0sIDApXG4gICAgfVxuICB9KVxufVxubW9kdWxlLmV4cG9ydHMuY2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gIGNhZi5hcHBseShnbG9iYWwsIGFyZ3VtZW50cylcbn1cbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS42LjNcbihmdW5jdGlvbigpIHtcbiAgdmFyIGdldE5hbm9TZWNvbmRzLCBocnRpbWUsIGxvYWRUaW1lO1xuXG4gIGlmICgodHlwZW9mIHBlcmZvcm1hbmNlICE9PSBcInVuZGVmaW5lZFwiICYmIHBlcmZvcm1hbmNlICE9PSBudWxsKSAmJiBwZXJmb3JtYW5jZS5ub3cpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIH07XG4gIH0gZWxzZSBpZiAoKHR5cGVvZiBwcm9jZXNzICE9PSBcInVuZGVmaW5lZFwiICYmIHByb2Nlc3MgIT09IG51bGwpICYmIHByb2Nlc3MuaHJ0aW1lKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoZ2V0TmFub1NlY29uZHMoKSAtIGxvYWRUaW1lKSAvIDFlNjtcbiAgICB9O1xuICAgIGhydGltZSA9IHByb2Nlc3MuaHJ0aW1lO1xuICAgIGdldE5hbm9TZWNvbmRzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaHI7XG4gICAgICBociA9IGhydGltZSgpO1xuICAgICAgcmV0dXJuIGhyWzBdICogMWU5ICsgaHJbMV07XG4gICAgfTtcbiAgICBsb2FkVGltZSA9IGdldE5hbm9TZWNvbmRzKCk7XG4gIH0gZWxzZSBpZiAoRGF0ZS5ub3cpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIERhdGUubm93KCkgLSBsb2FkVGltZTtcbiAgICB9O1xuICAgIGxvYWRUaW1lID0gRGF0ZS5ub3coKTtcbiAgfSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gbG9hZFRpbWU7XG4gICAgfTtcbiAgICBsb2FkVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8qXG4vL0Agc291cmNlTWFwcGluZ1VSTD1wZXJmb3JtYW5jZS1ub3cubWFwXG4qL1xuIiwidmFyIHNldE5vbkVudW1lcmFibGUgPSByZXF1aXJlKFwiLi9saWIvc2V0LW5vbi1lbnVtZXJhYmxlLmpzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFkZExpc3RlbmVyXG5cbmZ1bmN0aW9uIGFkZExpc3RlbmVyKG9ic2VydkFycmF5LCBvYnNlcnYpIHtcbiAgICB2YXIgbGlzdCA9IG9ic2VydkFycmF5Ll9saXN0XG5cbiAgICByZXR1cm4gb2JzZXJ2KGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgdmFsdWVMaXN0ID0gIG9ic2VydkFycmF5KCkuc2xpY2UoKVxuICAgICAgICB2YXIgaW5kZXggPSBsaXN0LmluZGV4T2Yob2JzZXJ2KVxuXG4gICAgICAgIC8vIFRoaXMgY29kZSBwYXRoIHNob3VsZCBuZXZlciBoaXQuIElmIHRoaXMgaGFwcGVuc1xuICAgICAgICAvLyB0aGVyZSdzIGEgYnVnIGluIHRoZSBjbGVhbnVwIGNvZGVcbiAgICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIm9ic2Vydi1hcnJheTogVW5yZW1vdmVkIG9ic2VydiBsaXN0ZW5lclwiXG4gICAgICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKG1lc3NhZ2UpXG4gICAgICAgICAgICBlcnIubGlzdCA9IGxpc3RcbiAgICAgICAgICAgIGVyci5pbmRleCA9IGluZGV4XG4gICAgICAgICAgICBlcnIub2JzZXJ2ID0gb2JzZXJ2XG4gICAgICAgICAgICB0aHJvdyBlcnJcbiAgICAgICAgfVxuXG4gICAgICAgIHZhbHVlTGlzdC5zcGxpY2UoaW5kZXgsIDEsIHZhbHVlKVxuICAgICAgICBzZXROb25FbnVtZXJhYmxlKHZhbHVlTGlzdCwgXCJfZGlmZlwiLCBbIFtpbmRleCwgMSwgdmFsdWVdIF0pXG5cbiAgICAgICAgb2JzZXJ2QXJyYXkuX29ic2VydlNldCh2YWx1ZUxpc3QpXG4gICAgfSlcbn1cbiIsInZhciBhZGRMaXN0ZW5lciA9IHJlcXVpcmUoJy4vYWRkLWxpc3RlbmVyLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSBhcHBseVBhdGNoXG5cbmZ1bmN0aW9uIGFwcGx5UGF0Y2ggKHZhbHVlTGlzdCwgYXJncykge1xuICAgIHZhciBvYnMgPSB0aGlzXG4gICAgdmFyIHZhbHVlQXJncyA9IGFyZ3MubWFwKHVucGFjaylcblxuICAgIHZhbHVlTGlzdC5zcGxpY2UuYXBwbHkodmFsdWVMaXN0LCB2YWx1ZUFyZ3MpXG4gICAgb2JzLl9saXN0LnNwbGljZS5hcHBseShvYnMuX2xpc3QsIGFyZ3MpXG5cbiAgICB2YXIgZXh0cmFSZW1vdmVMaXN0ZW5lcnMgPSBhcmdzLnNsaWNlKDIpLm1hcChmdW5jdGlvbiAob2JzZXJ2KSB7XG4gICAgICAgIHJldHVybiB0eXBlb2Ygb2JzZXJ2ID09PSBcImZ1bmN0aW9uXCIgP1xuICAgICAgICAgICAgYWRkTGlzdGVuZXIob2JzLCBvYnNlcnYpIDpcbiAgICAgICAgICAgIG51bGxcbiAgICB9KVxuXG4gICAgZXh0cmFSZW1vdmVMaXN0ZW5lcnMudW5zaGlmdChhcmdzWzBdLCBhcmdzWzFdKVxuICAgIHZhciByZW1vdmVkTGlzdGVuZXJzID0gb2JzLl9yZW1vdmVMaXN0ZW5lcnMuc3BsaWNlXG4gICAgICAgIC5hcHBseShvYnMuX3JlbW92ZUxpc3RlbmVycywgZXh0cmFSZW1vdmVMaXN0ZW5lcnMpXG5cbiAgICByZW1vdmVkTGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKHJlbW92ZU9ic2Vydkxpc3RlbmVyKSB7XG4gICAgICAgIGlmIChyZW1vdmVPYnNlcnZMaXN0ZW5lcikge1xuICAgICAgICAgICAgcmVtb3ZlT2JzZXJ2TGlzdGVuZXIoKVxuICAgICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiB2YWx1ZUFyZ3Ncbn1cblxuZnVuY3Rpb24gdW5wYWNrKHZhbHVlLCBpbmRleCl7XG4gICAgaWYgKGluZGV4ID09PSAwIHx8IGluZGV4ID09PSAxKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZVxuICAgIH1cbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyB2YWx1ZSgpIDogdmFsdWVcbn1cbiIsInZhciBPYnNlcnZBcnJheSA9IHJlcXVpcmUoXCIuL2luZGV4LmpzXCIpXG5cbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZVxuXG52YXIgQVJSQVlfTUVUSE9EUyA9IFtcbiAgICBcImNvbmNhdFwiLCBcInNsaWNlXCIsIFwiZXZlcnlcIiwgXCJmaWx0ZXJcIiwgXCJmb3JFYWNoXCIsIFwiaW5kZXhPZlwiLFxuICAgIFwiam9pblwiLCBcImxhc3RJbmRleE9mXCIsIFwibWFwXCIsIFwicmVkdWNlXCIsIFwicmVkdWNlUmlnaHRcIixcbiAgICBcInNvbWVcIiwgXCJ0b1N0cmluZ1wiLCBcInRvTG9jYWxlU3RyaW5nXCJcbl1cblxudmFyIG1ldGhvZHMgPSBBUlJBWV9NRVRIT0RTLm1hcChmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiBbbmFtZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcmVzID0gdGhpcy5fbGlzdFtuYW1lXS5hcHBseSh0aGlzLl9saXN0LCBhcmd1bWVudHMpXG5cbiAgICAgICAgaWYgKHJlcyAmJiBBcnJheS5pc0FycmF5KHJlcykpIHtcbiAgICAgICAgICAgIHJlcyA9IE9ic2VydkFycmF5KHJlcylcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXNcbiAgICB9XVxufSlcblxubW9kdWxlLmV4cG9ydHMgPSBBcnJheU1ldGhvZHNcblxuZnVuY3Rpb24gQXJyYXlNZXRob2RzKG9icykge1xuICAgIG9icy5wdXNoID0gb2JzZXJ2QXJyYXlQdXNoXG4gICAgb2JzLnBvcCA9IG9ic2VydkFycmF5UG9wXG4gICAgb2JzLnNoaWZ0ID0gb2JzZXJ2QXJyYXlTaGlmdFxuICAgIG9icy51bnNoaWZ0ID0gb2JzZXJ2QXJyYXlVbnNoaWZ0XG4gICAgb2JzLnJldmVyc2UgPSByZXF1aXJlKFwiLi9hcnJheS1yZXZlcnNlLmpzXCIpXG4gICAgb2JzLnNvcnQgPSByZXF1aXJlKFwiLi9hcnJheS1zb3J0LmpzXCIpXG5cbiAgICBtZXRob2RzLmZvckVhY2goZnVuY3Rpb24gKHR1cGxlKSB7XG4gICAgICAgIG9ic1t0dXBsZVswXV0gPSB0dXBsZVsxXVxuICAgIH0pXG4gICAgcmV0dXJuIG9ic1xufVxuXG5cblxuZnVuY3Rpb24gb2JzZXJ2QXJyYXlQdXNoKCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMpXG4gICAgYXJncy51bnNoaWZ0KHRoaXMuX2xpc3QubGVuZ3RoLCAwKVxuICAgIHRoaXMuc3BsaWNlLmFwcGx5KHRoaXMsIGFyZ3MpXG5cbiAgICByZXR1cm4gdGhpcy5fbGlzdC5sZW5ndGhcbn1cbmZ1bmN0aW9uIG9ic2VydkFycmF5UG9wKCkge1xuICAgIHJldHVybiB0aGlzLnNwbGljZSh0aGlzLl9saXN0Lmxlbmd0aCAtIDEsIDEpWzBdXG59XG5mdW5jdGlvbiBvYnNlcnZBcnJheVNoaWZ0KCkge1xuICAgIHJldHVybiB0aGlzLnNwbGljZSgwLCAxKVswXVxufVxuZnVuY3Rpb24gb2JzZXJ2QXJyYXlVbnNoaWZ0KCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMpXG4gICAgYXJncy51bnNoaWZ0KDAsIDApXG4gICAgdGhpcy5zcGxpY2UuYXBwbHkodGhpcywgYXJncylcblxuICAgIHJldHVybiB0aGlzLl9saXN0Lmxlbmd0aFxufVxuXG5cbmZ1bmN0aW9uIG5vdEltcGxlbWVudGVkKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlB1bGwgcmVxdWVzdCB3ZWxjb21lXCIpXG59XG4iLCJ2YXIgYXBwbHlQYXRjaCA9IHJlcXVpcmUoXCIuL2FwcGx5LXBhdGNoLmpzXCIpXG52YXIgc2V0Tm9uRW51bWVyYWJsZSA9IHJlcXVpcmUoJy4vbGliL3NldC1ub24tZW51bWVyYWJsZS5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gcmV2ZXJzZVxuXG5mdW5jdGlvbiByZXZlcnNlKCkge1xuICAgIHZhciBvYnMgPSB0aGlzXG4gICAgdmFyIGNoYW5nZXMgPSBmYWtlRGlmZihvYnMuX2xpc3Quc2xpY2UoKS5yZXZlcnNlKCkpXG4gICAgdmFyIHZhbHVlTGlzdCA9IG9icygpLnNsaWNlKCkucmV2ZXJzZSgpXG5cbiAgICB2YXIgdmFsdWVDaGFuZ2VzID0gY2hhbmdlcy5tYXAoYXBwbHlQYXRjaC5iaW5kKG9icywgdmFsdWVMaXN0KSlcblxuICAgIHNldE5vbkVudW1lcmFibGUodmFsdWVMaXN0LCBcIl9kaWZmXCIsIHZhbHVlQ2hhbmdlcylcblxuICAgIG9icy5fb2JzZXJ2U2V0KHZhbHVlTGlzdClcbiAgICByZXR1cm4gY2hhbmdlc1xufVxuXG5mdW5jdGlvbiBmYWtlRGlmZihhcnIpIHtcbiAgICB2YXIgX2RpZmZcbiAgICB2YXIgbGVuID0gYXJyLmxlbmd0aFxuXG4gICAgaWYobGVuICUgMikge1xuICAgICAgICB2YXIgbWlkUG9pbnQgPSAobGVuIC0xKSAvIDJcbiAgICAgICAgdmFyIGEgPSBbMCwgbWlkUG9pbnRdLmNvbmNhdChhcnIuc2xpY2UoMCwgbWlkUG9pbnQpKVxuICAgICAgICB2YXIgYiA9IFttaWRQb2ludCArMSwgbWlkUG9pbnRdLmNvbmNhdChhcnIuc2xpY2UobWlkUG9pbnQgKzEsIGxlbikpXG4gICAgICAgIHZhciBfZGlmZiA9IFthLCBiXVxuICAgIH0gZWxzZSB7XG4gICAgICAgIF9kaWZmID0gWyBbMCwgbGVuXS5jb25jYXQoYXJyKSBdXG4gICAgfVxuXG4gICAgcmV0dXJuIF9kaWZmXG59XG4iLCJ2YXIgYXBwbHlQYXRjaCA9IHJlcXVpcmUoXCIuL2FwcGx5LXBhdGNoLmpzXCIpXG52YXIgc2V0Tm9uRW51bWVyYWJsZSA9IHJlcXVpcmUoXCIuL2xpYi9zZXQtbm9uLWVudW1lcmFibGUuanNcIilcblxubW9kdWxlLmV4cG9ydHMgPSBzb3J0XG5cbmZ1bmN0aW9uIHNvcnQoY29tcGFyZSkge1xuICAgIHZhciBvYnMgPSB0aGlzXG4gICAgdmFyIGxpc3QgPSBvYnMuX2xpc3Quc2xpY2UoKVxuXG4gICAgdmFyIHVucGFja2VkID0gdW5wYWNrKGxpc3QpXG5cbiAgICB2YXIgc29ydGVkID0gdW5wYWNrZWRcbiAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oaXQpIHsgcmV0dXJuIGl0LnZhbCB9KVxuICAgICAgICAgICAgLnNvcnQoY29tcGFyZSlcblxuICAgIHZhciBwYWNrZWQgPSByZXBhY2soc29ydGVkLCB1bnBhY2tlZClcblxuICAgIC8vZmFrZSBkaWZmIC0gZm9yIHBlcmZcbiAgICAvL2FkaWZmIG9uIDEwayBpdGVtcyA9PT0gfjMyMDBtc1xuICAgIC8vZmFrZSBvbiAxMGsgaXRlbXMgPT09IH4xMTBtc1xuICAgIHZhciBjaGFuZ2VzID0gWyBbIDAsIHBhY2tlZC5sZW5ndGggXS5jb25jYXQocGFja2VkKSBdXG5cbiAgICB2YXIgdmFsdWVDaGFuZ2VzID0gY2hhbmdlcy5tYXAoYXBwbHlQYXRjaC5iaW5kKG9icywgc29ydGVkKSlcblxuICAgIHNldE5vbkVudW1lcmFibGUoc29ydGVkLCBcIl9kaWZmXCIsIHZhbHVlQ2hhbmdlcylcblxuICAgIG9icy5fb2JzZXJ2U2V0KHNvcnRlZClcbiAgICByZXR1cm4gY2hhbmdlc1xufVxuXG5mdW5jdGlvbiB1bnBhY2sobGlzdCkge1xuICAgIHZhciB1bnBhY2tlZCA9IFtdXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdW5wYWNrZWQucHVzaCh7XG4gICAgICAgICAgICB2YWw6IChcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIGxpc3RbaV0pID8gbGlzdFtpXSgpIDogbGlzdFtpXSxcbiAgICAgICAgICAgIG9iajogbGlzdFtpXVxuICAgICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gdW5wYWNrZWRcbn1cblxuZnVuY3Rpb24gcmVwYWNrKHNvcnRlZCwgdW5wYWNrZWQpIHtcbiAgICB2YXIgcGFja2VkID0gW11cblxuICAgIHdoaWxlKHNvcnRlZC5sZW5ndGgpIHtcbiAgICAgICAgdmFyIHMgPSBzb3J0ZWQuc2hpZnQoKVxuICAgICAgICB2YXIgaW5keCA9IGluZGV4T2YocywgdW5wYWNrZWQpXG4gICAgICAgIGlmKH5pbmR4KSBwYWNrZWQucHVzaCh1bnBhY2tlZC5zcGxpY2UoaW5keCwgMSlbMF0ub2JqKVxuICAgIH1cblxuICAgIHJldHVybiBwYWNrZWRcbn1cblxuZnVuY3Rpb24gaW5kZXhPZihuLCBoKSB7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYobiA9PT0gaFtpXS52YWwpIHJldHVybiBpXG4gICAgfVxuICAgIHJldHVybiAtMVxufVxuIiwidmFyIE9ic2VydiA9IHJlcXVpcmUoXCJvYnNlcnZcIilcblxuLy8gY2lyY3VsYXIgZGVwIGJldHdlZW4gQXJyYXlNZXRob2RzICYgdGhpcyBmaWxlXG5tb2R1bGUuZXhwb3J0cyA9IE9ic2VydkFycmF5XG5cbnZhciBzcGxpY2UgPSByZXF1aXJlKFwiLi9zcGxpY2UuanNcIilcbnZhciBwdXQgPSByZXF1aXJlKFwiLi9wdXQuanNcIilcbnZhciBzZXQgPSByZXF1aXJlKFwiLi9zZXQuanNcIilcbnZhciB0cmFuc2FjdGlvbiA9IHJlcXVpcmUoXCIuL3RyYW5zYWN0aW9uLmpzXCIpXG52YXIgQXJyYXlNZXRob2RzID0gcmVxdWlyZShcIi4vYXJyYXktbWV0aG9kcy5qc1wiKVxudmFyIGFkZExpc3RlbmVyID0gcmVxdWlyZShcIi4vYWRkLWxpc3RlbmVyLmpzXCIpXG5cblxuLyogIE9ic2VydkFycmF5IDo9IChBcnJheTxUPikgPT4gT2JzZXJ2PFxuICAgICAgICBBcnJheTxUPiAmIHsgX2RpZmY6IEFycmF5IH1cbiAgICA+ICYge1xuICAgICAgICBzcGxpY2U6IChpbmRleDogTnVtYmVyLCBhbW91bnQ6IE51bWJlciwgcmVzdC4uLjogVCkgPT5cbiAgICAgICAgICAgIEFycmF5PFQ+LFxuICAgICAgICBwdXNoOiAodmFsdWVzLi4uOiBUKSA9PiBOdW1iZXIsXG4gICAgICAgIGZpbHRlcjogKGxhbWJkYTogRnVuY3Rpb24sIHRoaXNWYWx1ZTogQW55KSA9PiBBcnJheTxUPixcbiAgICAgICAgaW5kZXhPZjogKGl0ZW06IFQsIGZyb21JbmRleDogTnVtYmVyKSA9PiBOdW1iZXJcbiAgICB9XG5cbiAgICBGaXggdG8gbWFrZSBpdCBtb3JlIGxpa2UgT2JzZXJ2SGFzaC5cblxuICAgIEkuZS4geW91IHdyaXRlIG9ic2VydmFibGVzIGludG8gaXQuXG4gICAgICAgIHJlYWRpbmcgbWV0aG9kcyB0YWtlIHBsYWluIEpTIG9iamVjdHMgdG8gcmVhZFxuICAgICAgICBhbmQgdGhlIHZhbHVlIG9mIHRoZSBhcnJheSBpcyBhbHdheXMgYW4gYXJyYXkgb2YgcGxhaW5cbiAgICAgICAgb2Jqc2VjdC5cblxuICAgICAgICBUaGUgb2JzZXJ2IGFycmF5IGluc3RhbmNlIGl0c2VsZiB3b3VsZCBoYXZlIGluZGV4ZWRcbiAgICAgICAgcHJvcGVydGllcyB0aGF0IGFyZSB0aGUgb2JzZXJ2YWJsZXNcbiovXG5mdW5jdGlvbiBPYnNlcnZBcnJheShpbml0aWFsTGlzdCkge1xuICAgIC8vIGxpc3QgaXMgdGhlIGludGVybmFsIG11dGFibGUgbGlzdCBvYnNlcnYgaW5zdGFuY2VzIHRoYXRcbiAgICAvLyBhbGwgbWV0aG9kcyBvbiBgb2JzYCBkaXNwYXRjaCB0by5cbiAgICB2YXIgbGlzdCA9IGluaXRpYWxMaXN0XG4gICAgdmFyIGluaXRpYWxTdGF0ZSA9IFtdXG5cbiAgICAvLyBjb3B5IHN0YXRlIG91dCBvZiBpbml0aWFsTGlzdCBpbnRvIGluaXRpYWxTdGF0ZVxuICAgIGxpc3QuZm9yRWFjaChmdW5jdGlvbiAob2JzZXJ2LCBpbmRleCkge1xuICAgICAgICBpbml0aWFsU3RhdGVbaW5kZXhdID0gdHlwZW9mIG9ic2VydiA9PT0gXCJmdW5jdGlvblwiID9cbiAgICAgICAgICAgIG9ic2VydigpIDogb2JzZXJ2XG4gICAgfSlcblxuICAgIHZhciBvYnMgPSBPYnNlcnYoaW5pdGlhbFN0YXRlKVxuICAgIG9icy5zcGxpY2UgPSBzcGxpY2VcblxuICAgIC8vIG92ZXJyaWRlIHNldCBhbmQgc3RvcmUgb3JpZ2luYWwgZm9yIGxhdGVyIHVzZVxuICAgIG9icy5fb2JzZXJ2U2V0ID0gb2JzLnNldFxuICAgIG9icy5zZXQgPSBzZXRcblxuICAgIG9icy5nZXQgPSBnZXRcbiAgICBvYnMuZ2V0TGVuZ3RoID0gZ2V0TGVuZ3RoXG4gICAgb2JzLnB1dCA9IHB1dFxuICAgIG9icy50cmFuc2FjdGlvbiA9IHRyYW5zYWN0aW9uXG5cbiAgICAvLyB5b3UgYmV0dGVyIG5vdCBtdXRhdGUgdGhpcyBsaXN0IGRpcmVjdGx5XG4gICAgLy8gdGhpcyBpcyB0aGUgbGlzdCBvZiBvYnNlcnZzIGluc3RhbmNlc1xuICAgIG9icy5fbGlzdCA9IGxpc3RcblxuICAgIHZhciByZW1vdmVMaXN0ZW5lcnMgPSBsaXN0Lm1hcChmdW5jdGlvbiAob2JzZXJ2KSB7XG4gICAgICAgIHJldHVybiB0eXBlb2Ygb2JzZXJ2ID09PSBcImZ1bmN0aW9uXCIgP1xuICAgICAgICAgICAgYWRkTGlzdGVuZXIob2JzLCBvYnNlcnYpIDpcbiAgICAgICAgICAgIG51bGxcbiAgICB9KTtcbiAgICAvLyB0aGlzIGlzIGEgbGlzdCBvZiByZW1vdmFsIGZ1bmN0aW9ucyB0aGF0IG11c3QgYmUgY2FsbGVkXG4gICAgLy8gd2hlbiBvYnNlcnYgaW5zdGFuY2VzIGFyZSByZW1vdmVkIGZyb20gYG9icy5saXN0YFxuICAgIC8vIG5vdCBjYWxsaW5nIHRoaXMgbWVhbnMgd2UgZG8gbm90IEdDIG91ciBvYnNlcnYgY2hhbmdlXG4gICAgLy8gbGlzdGVuZXJzLiBXaGljaCBjYXVzZXMgcmFnZSBidWdzXG4gICAgb2JzLl9yZW1vdmVMaXN0ZW5lcnMgPSByZW1vdmVMaXN0ZW5lcnNcblxuICAgIG9icy5fdHlwZSA9IFwib2JzZXJ2LWFycmF5XCJcbiAgICBvYnMuX3ZlcnNpb24gPSBcIjNcIlxuXG4gICAgcmV0dXJuIEFycmF5TWV0aG9kcyhvYnMsIGxpc3QpXG59XG5cbmZ1bmN0aW9uIGdldChpbmRleCkge1xuICAgIHJldHVybiB0aGlzLl9saXN0W2luZGV4XVxufVxuXG5mdW5jdGlvbiBnZXRMZW5ndGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xpc3QubGVuZ3RoXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHNldE5vbkVudW1lcmFibGU7XG5cbmZ1bmN0aW9uIHNldE5vbkVudW1lcmFibGUob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwga2V5LCB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB9KTtcbn1cbiIsImZ1bmN0aW9uIGhlYWQgKGEpIHtcbiAgcmV0dXJuIGFbMF1cbn1cblxuZnVuY3Rpb24gbGFzdCAoYSkge1xuICByZXR1cm4gYVthLmxlbmd0aCAtIDFdXG59XG5cbmZ1bmN0aW9uIHRhaWwoYSkge1xuICByZXR1cm4gYS5zbGljZSgxKVxufVxuXG5mdW5jdGlvbiByZXRyZWF0IChlKSB7XG4gIHJldHVybiBlLnBvcCgpXG59XG5cbmZ1bmN0aW9uIGhhc0xlbmd0aCAoZSkge1xuICByZXR1cm4gZS5sZW5ndGhcbn1cblxuZnVuY3Rpb24gYW55KGFyeSwgdGVzdCkge1xuICBmb3IodmFyIGk9MDtpPGFyeS5sZW5ndGg7aSsrKVxuICAgIGlmKHRlc3QoYXJ5W2ldKSlcbiAgICAgIHJldHVybiB0cnVlXG4gIHJldHVybiBmYWxzZVxufVxuXG5mdW5jdGlvbiBzY29yZSAoYSkge1xuICByZXR1cm4gYS5yZWR1Y2UoZnVuY3Rpb24gKHMsIGEpIHtcbiAgICAgIHJldHVybiBzICsgYS5sZW5ndGggKyBhWzFdICsgMVxuICB9LCAwKVxufVxuXG5mdW5jdGlvbiBiZXN0IChhLCBiKSB7XG4gIHJldHVybiBzY29yZShhKSA8PSBzY29yZShiKSA/IGEgOiBiXG59XG5cblxudmFyIF9ydWxlcyAvLyBzZXQgYXQgdGhlIGJvdHRvbSAgXG5cbi8vIG5vdGUsIG5haXZlIGltcGxlbWVudGF0aW9uLiB3aWxsIGJyZWFrIG9uIGNpcmN1bGFyIG9iamVjdHMuXG5cbmZ1bmN0aW9uIF9lcXVhbChhLCBiKSB7XG4gIGlmKGEgJiYgIWIpIHJldHVybiBmYWxzZVxuICBpZihBcnJheS5pc0FycmF5KGEpKVxuICAgIGlmKGEubGVuZ3RoICE9IGIubGVuZ3RoKSByZXR1cm4gZmFsc2VcbiAgaWYoYSAmJiAnb2JqZWN0JyA9PSB0eXBlb2YgYSkge1xuICAgIGZvcih2YXIgaSBpbiBhKVxuICAgICAgaWYoIV9lcXVhbChhW2ldLCBiW2ldKSkgcmV0dXJuIGZhbHNlXG4gICAgZm9yKHZhciBpIGluIGIpXG4gICAgICBpZighX2VxdWFsKGFbaV0sIGJbaV0pKSByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG4gIHJldHVybiBhID09IGJcbn1cblxuZnVuY3Rpb24gZ2V0QXJncyhhcmdzKSB7XG4gIHJldHVybiBhcmdzLmxlbmd0aCA9PSAxID8gYXJnc1swXSA6IFtdLnNsaWNlLmNhbGwoYXJncylcbn1cblxuLy8gcmV0dXJuIHRoZSBpbmRleCBvZiB0aGUgZWxlbWVudCBub3QgbGlrZSB0aGUgb3RoZXJzLCBvciAtMVxuZnVuY3Rpb24gb2RkRWxlbWVudChhcnksIGNtcCkge1xuICB2YXIgY1xuICBmdW5jdGlvbiBndWVzcyhhKSB7XG4gICAgdmFyIG9kZCA9IC0xXG4gICAgYyA9IDBcbiAgICBmb3IgKHZhciBpID0gYTsgaSA8IGFyeS5sZW5ndGg7IGkgKyspIHtcbiAgICAgIGlmKCFjbXAoYXJ5W2FdLCBhcnlbaV0pKSB7XG4gICAgICAgIG9kZCA9IGksIGMrK1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYyA+IDEgPyAtMSA6IG9kZFxuICB9XG4gIC8vYXNzdW1lIHRoYXQgaXQgaXMgdGhlIGZpcnN0IGVsZW1lbnQuXG4gIHZhciBnID0gZ3Vlc3MoMClcbiAgaWYoLTEgIT0gZykgcmV0dXJuIGdcbiAgLy8wIHdhcyB0aGUgb2RkIG9uZSwgdGhlbiBhbGwgdGhlIG90aGVyIGVsZW1lbnRzIGFyZSBlcXVhbFxuICAvL2Vsc2UgdGhlcmUgbW9yZSB0aGFuIG9uZSBkaWZmZXJlbnQgZWxlbWVudFxuICBndWVzcygxKVxuICByZXR1cm4gYyA9PSAwID8gMCA6IC0xXG59XG52YXIgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGRlcHMsIGV4cG9ydHMpIHtcbiAgdmFyIGVxdWFsID0gKGRlcHMgJiYgZGVwcy5lcXVhbCkgfHwgX2VxdWFsXG4gIGV4cG9ydHMgPSBleHBvcnRzIHx8IHt9IFxuICBleHBvcnRzLmxjcyA9IFxuICBmdW5jdGlvbiBsY3MoKSB7XG4gICAgdmFyIGNhY2hlID0ge31cbiAgICB2YXIgYXJncyA9IGdldEFyZ3MoYXJndW1lbnRzKVxuICAgIHZhciBhID0gYXJnc1swXSwgYiA9IGFyZ3NbMV1cblxuICAgIGZ1bmN0aW9uIGtleSAoYSxiKXtcbiAgICAgIHJldHVybiBhLmxlbmd0aCArICc6JyArIGIubGVuZ3RoXG4gICAgfVxuXG4gICAgLy9maW5kIGxlbmd0aCB0aGF0IG1hdGNoZXMgYXQgdGhlIGhlYWRcblxuICAgIGlmKGFyZ3MubGVuZ3RoID4gMikge1xuICAgICAgLy9pZiBjYWxsZWQgd2l0aCBtdWx0aXBsZSBzZXF1ZW5jZXNcbiAgICAgIC8vcmVjdXJzZSwgc2luY2UgbGNzKGEsIGIsIGMsIGQpID09IGxjcyhsY3MoYSxiKSwgbGNzKGMsZCkpXG4gICAgICBhcmdzLnB1c2gobGNzKGFyZ3Muc2hpZnQoKSwgYXJncy5zaGlmdCgpKSlcbiAgICAgIHJldHVybiBsY3MoYXJncylcbiAgICB9XG4gICAgXG4gICAgLy90aGlzIHdvdWxkIGJlIGltcHJvdmVkIGJ5IHRydW5jYXRpbmcgaW5wdXQgZmlyc3RcbiAgICAvL2FuZCBub3QgcmV0dXJuaW5nIGFuIGxjcyBhcyBhbiBpbnRlcm1lZGlhdGUgc3RlcC5cbiAgICAvL3VudGlsbCB0aGF0IGlzIGEgcGVyZm9ybWFuY2UgcHJvYmxlbS5cblxuICAgIHZhciBzdGFydCA9IDAsIGVuZCA9IDBcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgYS5sZW5ndGggJiYgaSA8IGIubGVuZ3RoIFxuICAgICAgJiYgZXF1YWwoYVtpXSwgYltpXSlcbiAgICAgIDsgaSArK1xuICAgIClcbiAgICAgIHN0YXJ0ID0gaSArIDFcblxuICAgIGlmKGEubGVuZ3RoID09PSBzdGFydClcbiAgICAgIHJldHVybiBhLnNsaWNlKClcblxuICAgIGZvcih2YXIgaSA9IDA7ICBpIDwgYS5sZW5ndGggLSBzdGFydCAmJiBpIDwgYi5sZW5ndGggLSBzdGFydFxuICAgICAgJiYgZXF1YWwoYVthLmxlbmd0aCAtIDEgLSBpXSwgYltiLmxlbmd0aCAtIDEgLSBpXSlcbiAgICAgIDsgaSArK1xuICAgIClcbiAgICAgIGVuZCA9IGlcblxuICAgIGZ1bmN0aW9uIHJlY3Vyc2UgKGEsIGIpIHtcbiAgICAgIGlmKCFhLmxlbmd0aCB8fCAhYi5sZW5ndGgpIHJldHVybiBbXVxuICAgICAgLy9hdm9pZCBleHBvbmVudGlhbCB0aW1lIGJ5IGNhY2hpbmcgdGhlIHJlc3VsdHNcbiAgICAgIGlmKGNhY2hlW2tleShhLCBiKV0pIHJldHVybiBjYWNoZVtrZXkoYSwgYildXG5cbiAgICAgIGlmKGVxdWFsKGFbMF0sIGJbMF0pKVxuICAgICAgICByZXR1cm4gW2hlYWQoYSldLmNvbmNhdChyZWN1cnNlKHRhaWwoYSksIHRhaWwoYikpKVxuICAgICAgZWxzZSB7IFxuICAgICAgICB2YXIgX2EgPSByZWN1cnNlKHRhaWwoYSksIGIpXG4gICAgICAgIHZhciBfYiA9IHJlY3Vyc2UoYSwgdGFpbChiKSlcbiAgICAgICAgcmV0dXJuIGNhY2hlW2tleShhLGIpXSA9IF9hLmxlbmd0aCA+IF9iLmxlbmd0aCA/IF9hIDogX2IgIFxuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICB2YXIgbWlkZGxlQSA9IGEuc2xpY2Uoc3RhcnQsIGEubGVuZ3RoIC0gZW5kKVxuICAgIHZhciBtaWRkbGVCID0gYi5zbGljZShzdGFydCwgYi5sZW5ndGggLSBlbmQpXG5cbiAgICByZXR1cm4gKFxuICAgICAgYS5zbGljZSgwLCBzdGFydCkuY29uY2F0KFxuICAgICAgICByZWN1cnNlKG1pZGRsZUEsIG1pZGRsZUIpXG4gICAgICApLmNvbmNhdChhLnNsaWNlKGEubGVuZ3RoIC0gZW5kKSlcbiAgICApXG4gIH1cblxuICAvLyBnaXZlbiBuIHNlcXVlbmNlcywgY2FsYyB0aGUgbGNzLCBhbmQgdGhlbiBjaHVuayBzdHJpbmdzIGludG8gc3RhYmxlIGFuZCB1bnN0YWJsZSBzZWN0aW9ucy5cbiAgLy8gdW5zdGFibGUgY2h1bmtzIGFyZSBwYXNzZWQgdG8gYnVpbGRcbiAgZXhwb3J0cy5jaHVuayA9XG4gIGZ1bmN0aW9uIChxLCBidWlsZCkge1xuICAgIHZhciBxID0gcS5tYXAoZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUuc2xpY2UoKSB9KVxuICAgIHZhciBsY3MgPSBleHBvcnRzLmxjcy5hcHBseShudWxsLCBxKVxuICAgIHZhciBhbGwgPSBbbGNzXS5jb25jYXQocSlcblxuICAgIGZ1bmN0aW9uIG1hdGNoTGNzIChlKSB7XG4gICAgICBpZihlLmxlbmd0aCAmJiAhbGNzLmxlbmd0aCB8fCAhZS5sZW5ndGggJiYgbGNzLmxlbmd0aClcbiAgICAgICAgcmV0dXJuIGZhbHNlIC8vaW5jYXNlIHRoZSBsYXN0IGl0ZW0gaXMgbnVsbFxuICAgICAgcmV0dXJuIGVxdWFsKGxhc3QoZSksIGxhc3QobGNzKSkgfHwgKChlLmxlbmd0aCArIGxjcy5sZW5ndGgpID09PSAwKVxuICAgIH1cblxuICAgIHdoaWxlKGFueShxLCBoYXNMZW5ndGgpKSB7XG4gICAgICAvL2lmIGVhY2ggZWxlbWVudCBpcyBhdCB0aGUgbGNzIHRoZW4gdGhpcyBjaHVuayBpcyBzdGFibGUuXG4gICAgICB3aGlsZShxLmV2ZXJ5KG1hdGNoTGNzKSAmJiBxLmV2ZXJ5KGhhc0xlbmd0aCkpXG4gICAgICAgIGFsbC5mb3JFYWNoKHJldHJlYXQpXG4gICAgICAvL2NvbGxlY3QgdGhlIGNoYW5nZXMgaW4gZWFjaCBhcnJheSB1cHRvIHRoZSBuZXh0IG1hdGNoIHdpdGggdGhlIGxjc1xuICAgICAgdmFyIGMgPSBmYWxzZVxuICAgICAgdmFyIHVuc3RhYmxlID0gcS5tYXAoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyIGNoYW5nZSA9IFtdXG4gICAgICAgIHdoaWxlKCFtYXRjaExjcyhlKSkge1xuICAgICAgICAgIGNoYW5nZS51bnNoaWZ0KHJldHJlYXQoZSkpXG4gICAgICAgICAgYyA9IHRydWVcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2hhbmdlXG4gICAgICB9KVxuICAgICAgaWYoYykgYnVpbGQocVswXS5sZW5ndGgsIHVuc3RhYmxlKVxuICAgIH1cbiAgfVxuXG4gIC8vY2FsY3VsYXRlIGEgZGlmZiB0aGlzIGlzIG9ubHkgdXBkYXRlc1xuICBleHBvcnRzLm9wdGltaXN0aWNEaWZmID1cbiAgZnVuY3Rpb24gKGEsIGIpIHtcbiAgICB2YXIgTSA9IE1hdGgubWF4KGEubGVuZ3RoLCBiLmxlbmd0aClcbiAgICB2YXIgbSA9IE1hdGgubWluKGEubGVuZ3RoLCBiLmxlbmd0aClcbiAgICB2YXIgcGF0Y2ggPSBbXVxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBNOyBpKyspXG4gICAgICBpZihhW2ldICE9PSBiW2ldKSB7XG4gICAgICAgIHZhciBjdXIgPSBbaSwwXSwgZGVsZXRlcyA9IDBcbiAgICAgICAgd2hpbGUoYVtpXSAhPT0gYltpXSAmJiBpIDwgbSkge1xuICAgICAgICAgIGN1clsxXSA9ICsrZGVsZXRlc1xuICAgICAgICAgIGN1ci5wdXNoKGJbaSsrXSlcbiAgICAgICAgfVxuICAgICAgICAvL3RoZSByZXN0IGFyZSBkZWxldGVzIG9yIGluc2VydHNcbiAgICAgICAgaWYoaSA+PSBtKSB7XG4gICAgICAgICAgLy90aGUgcmVzdCBhcmUgZGVsZXRlc1xuICAgICAgICAgIGlmKGEubGVuZ3RoID4gYi5sZW5ndGgpXG4gICAgICAgICAgICBjdXJbMV0gKz0gYS5sZW5ndGggLSBiLmxlbmd0aFxuICAgICAgICAgIC8vdGhlIHJlc3QgYXJlIGluc2VydHNcbiAgICAgICAgICBlbHNlIGlmKGEubGVuZ3RoIDwgYi5sZW5ndGgpXG4gICAgICAgICAgICBjdXIgPSBjdXIuY29uY2F0KGIuc2xpY2UoYS5sZW5ndGgpKVxuICAgICAgICB9XG4gICAgICAgIHBhdGNoLnB1c2goY3VyKVxuICAgICAgfVxuXG4gICAgcmV0dXJuIHBhdGNoXG4gIH1cblxuICBleHBvcnRzLmRpZmYgPVxuICBmdW5jdGlvbiAoYSwgYikge1xuICAgIHZhciBvcHRpbWlzdGljID0gZXhwb3J0cy5vcHRpbWlzdGljRGlmZihhLCBiKVxuICAgIHZhciBjaGFuZ2VzID0gW11cbiAgICBleHBvcnRzLmNodW5rKFthLCBiXSwgZnVuY3Rpb24gKGluZGV4LCB1bnN0YWJsZSkge1xuICAgICAgdmFyIGRlbCA9IHVuc3RhYmxlLnNoaWZ0KCkubGVuZ3RoXG4gICAgICB2YXIgaW5zZXJ0ID0gdW5zdGFibGUuc2hpZnQoKVxuICAgICAgY2hhbmdlcy5wdXNoKFtpbmRleCwgZGVsXS5jb25jYXQoaW5zZXJ0KSlcbiAgICB9KVxuICAgIHJldHVybiBiZXN0KG9wdGltaXN0aWMsIGNoYW5nZXMpXG4gIH1cblxuICBleHBvcnRzLnBhdGNoID0gZnVuY3Rpb24gKGEsIGNoYW5nZXMsIG11dGF0ZSkge1xuICAgIGlmKG11dGF0ZSAhPT0gdHJ1ZSkgYSA9IGEuc2xpY2UoYSkvL2NvcHkgYVxuICAgIGNoYW5nZXMuZm9yRWFjaChmdW5jdGlvbiAoY2hhbmdlKSB7XG4gICAgICBbXS5zcGxpY2UuYXBwbHkoYSwgY2hhbmdlKVxuICAgIH0pXG4gICAgcmV0dXJuIGFcbiAgfVxuXG4gIC8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQ29uY2VzdG9yXG4gIC8vIG1lLCBjb25jZXN0b3IsIHlvdS4uLlxuICBleHBvcnRzLm1lcmdlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBhcmdzID0gZ2V0QXJncyhhcmd1bWVudHMpXG4gICAgdmFyIHBhdGNoID0gZXhwb3J0cy5kaWZmMyhhcmdzKVxuICAgIHJldHVybiBleHBvcnRzLnBhdGNoKGFyZ3NbMF0sIHBhdGNoKVxuICB9XG5cbiAgZXhwb3J0cy5kaWZmMyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYXJncyA9IGdldEFyZ3MoYXJndW1lbnRzKVxuICAgIHZhciByID0gW11cbiAgICBleHBvcnRzLmNodW5rKGFyZ3MsIGZ1bmN0aW9uIChpbmRleCwgdW5zdGFibGUpIHtcbiAgICAgIHZhciBtaW5lID0gdW5zdGFibGVbMF1cbiAgICAgIHZhciBpbnNlcnQgPSByZXNvbHZlKHVuc3RhYmxlKVxuICAgICAgaWYoZXF1YWwobWluZSwgaW5zZXJ0KSkgcmV0dXJuIFxuICAgICAgci5wdXNoKFtpbmRleCwgbWluZS5sZW5ndGhdLmNvbmNhdChpbnNlcnQpKSBcbiAgICB9KVxuICAgIHJldHVybiByXG4gIH1cbiAgZXhwb3J0cy5vZGRPbmVPdXQgPVxuICAgIGZ1bmN0aW9uIG9kZE9uZU91dCAoY2hhbmdlcykge1xuICAgICAgY2hhbmdlcyA9IGNoYW5nZXMuc2xpY2UoKVxuICAgICAgLy9wdXQgdGhlIGNvbmNlc3RvciBmaXJzdFxuICAgICAgY2hhbmdlcy51bnNoaWZ0KGNoYW5nZXMuc3BsaWNlKDEsMSlbMF0pXG4gICAgICB2YXIgaSA9IG9kZEVsZW1lbnQoY2hhbmdlcywgZXF1YWwpXG4gICAgICBpZihpID09IDApIC8vIGNvbmNlc3RvciB3YXMgZGlmZmVyZW50LCAnZmFsc2UgY29uZmxpY3QnXG4gICAgICAgIHJldHVybiBjaGFuZ2VzWzFdXG4gICAgICBpZiAofmkpXG4gICAgICAgIHJldHVybiBjaGFuZ2VzW2ldIFxuICAgIH1cbiAgZXhwb3J0cy5pbnNlcnRNZXJnZU92ZXJEZWxldGUgPSBcbiAgICAvL2kndmUgaW1wbGVtZW50ZWQgdGhpcyBhcyBhIHNlcGVyYXRlIHJ1bGUsXG4gICAgLy9iZWNhdXNlIEkgaGFkIHNlY29uZCB0aG91Z2h0cyBhYm91dCB0aGlzLlxuICAgIGZ1bmN0aW9uIGluc2VydE1lcmdlT3ZlckRlbGV0ZSAoY2hhbmdlcykge1xuICAgICAgY2hhbmdlcyA9IGNoYW5nZXMuc2xpY2UoKVxuICAgICAgY2hhbmdlcy5zcGxpY2UoMSwxKS8vIHJlbW92ZSBjb25jZXN0b3JcbiAgICAgIFxuICAgICAgLy9pZiB0aGVyZSBpcyBvbmx5IG9uZSBub24gZW1wdHkgY2hhbmdlIHRoYXRzIG9rYXkuXG4gICAgICAvL2Vsc2UgZnVsbCBjb25maWxjdFxuICAgICAgZm9yICh2YXIgaSA9IDAsIG5vbmVtcHR5OyBpIDwgY2hhbmdlcy5sZW5ndGg7IGkrKylcbiAgICAgICAgaWYoY2hhbmdlc1tpXS5sZW5ndGgpIFxuICAgICAgICAgIGlmKCFub25lbXB0eSkgbm9uZW1wdHkgPSBjaGFuZ2VzW2ldXG4gICAgICAgICAgZWxzZSByZXR1cm4gLy8gZnVsbCBjb25mbGljdFxuICAgICAgcmV0dXJuIG5vbmVtcHR5XG4gICAgfVxuXG4gIHZhciBydWxlcyA9IChkZXBzICYmIGRlcHMucnVsZXMpIHx8IFtleHBvcnRzLm9kZE9uZU91dCwgZXhwb3J0cy5pbnNlcnRNZXJnZU92ZXJEZWxldGVdXG5cbiAgZnVuY3Rpb24gcmVzb2x2ZSAoY2hhbmdlcykge1xuICAgIHZhciBsID0gcnVsZXMubGVuZ3RoXG4gICAgZm9yICh2YXIgaSBpbiBydWxlcykgeyAvLyBmaXJzdFxuICAgICAgXG4gICAgICB2YXIgYyA9IHJ1bGVzW2ldICYmIHJ1bGVzW2ldKGNoYW5nZXMpXG4gICAgICBpZihjKSByZXR1cm4gY1xuICAgIH1cbiAgICBjaGFuZ2VzLnNwbGljZSgxLDEpIC8vIHJlbW92ZSBjb25jZXN0b3JcbiAgICAvL3JldHVybmluZyB0aGUgY29uZmxpY3RzIGFzIGFuIG9iamVjdCBpcyBhIHJlYWxseSBiYWQgaWRlYSxcbiAgICAvLyBiZWNhdXNlID09IHdpbGwgbm90IGRldGVjdCB0aGV5IGFyZSB0aGUgc2FtZS4gYW5kIGNvbmZsaWN0cyBidWlsZC5cbiAgICAvLyBiZXR0ZXIgdG8gdXNlXG4gICAgLy8gJzw8PDw8PDw8PDw8PDwnXG4gICAgLy8gb2YgY291cnNlLCBpIHdyb3RlIHRoaXMgYmVmb3JlIGkgc3RhcnRlZCBvbiBzbm9iLCBzbyBpIGRpZG4ndCBrbm93IHRoYXQgdGhlbi5cbiAgICAvKnZhciBjb25mbGljdCA9IFsnPj4+Pj4+Pj4+Pj4+Pj4+PiddXG4gICAgd2hpbGUoY2hhbmdlcy5sZW5ndGgpXG4gICAgICBjb25mbGljdCA9IGNvbmZsaWN0LmNvbmNhdChjaGFuZ2VzLnNoaWZ0KCkpLmNvbmNhdCgnPT09PT09PT09PT09JylcbiAgICBjb25mbGljdC5wb3AoKVxuICAgIGNvbmZsaWN0LnB1c2ggICAgICAgICAgKCc8PDw8PDw8PDw8PDw8PDwnKVxuICAgIGNoYW5nZXMudW5zaGlmdCAgICAgICAoJz4+Pj4+Pj4+Pj4+Pj4+PicpXG4gICAgcmV0dXJuIGNvbmZsaWN0Ki9cbiAgICAvL25haCwgYmV0dGVyIGlzIGp1c3QgdG8gdXNlIGFuIGVxdWFsIGNhbiBoYW5kbGUgb2JqZWN0c1xuICAgIHJldHVybiB7Jz8nOiBjaGFuZ2VzfVxuICB9XG4gIHJldHVybiBleHBvcnRzXG59XG5leHBvcnRzKG51bGwsIGV4cG9ydHMpXG4iLCJ2YXIgYWRkTGlzdGVuZXIgPSByZXF1aXJlKFwiLi9hZGQtbGlzdGVuZXIuanNcIilcbnZhciBzZXROb25FbnVtZXJhYmxlID0gcmVxdWlyZShcIi4vbGliL3NldC1ub24tZW51bWVyYWJsZS5qc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBwdXRcblxuLy8gYG9icy5wdXRgIGlzIGEgbXV0YWJsZSBpbXBsZW1lbnRhdGlvbiBvZiBgYXJyYXlbaW5kZXhdID0gdmFsdWVgXG4vLyB0aGF0IG11dGF0ZXMgYm90aCBgbGlzdGAgYW5kIHRoZSBpbnRlcm5hbCBgdmFsdWVMaXN0YCB0aGF0XG4vLyBpcyB0aGUgY3VycmVudCB2YWx1ZSBvZiBgb2JzYCBpdHNlbGZcbmZ1bmN0aW9uIHB1dChpbmRleCwgdmFsdWUpIHtcbiAgICB2YXIgb2JzID0gdGhpc1xuICAgIHZhciB2YWx1ZUxpc3QgPSBvYnMoKS5zbGljZSgpXG5cbiAgICB2YXIgb3JpZ2luYWxMZW5ndGggPSB2YWx1ZUxpc3QubGVuZ3RoXG4gICAgdmFsdWVMaXN0W2luZGV4XSA9IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gdmFsdWUoKSA6IHZhbHVlXG5cbiAgICBvYnMuX2xpc3RbaW5kZXhdID0gdmFsdWVcblxuICAgIC8vIHJlbW92ZSBwYXN0IHZhbHVlIGxpc3RlbmVyIGlmIHdhcyBvYnNlcnZcbiAgICB2YXIgcmVtb3ZlTGlzdGVuZXIgPSBvYnMuX3JlbW92ZUxpc3RlbmVyc1tpbmRleF1cbiAgICBpZiAocmVtb3ZlTGlzdGVuZXIpe1xuICAgICAgICByZW1vdmVMaXN0ZW5lcigpXG4gICAgfVxuXG4gICAgLy8gYWRkIGxpc3RlbmVyIHRvIHZhbHVlIGlmIG9ic2VydlxuICAgIG9icy5fcmVtb3ZlTGlzdGVuZXJzW2luZGV4XSA9IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID9cbiAgICAgICAgYWRkTGlzdGVuZXIob2JzLCB2YWx1ZSkgOlxuICAgICAgICBudWxsXG5cbiAgICAvLyBmYWtlIHNwbGljZSBkaWZmXG4gICAgdmFyIHZhbHVlQXJncyA9IGluZGV4IDwgb3JpZ2luYWxMZW5ndGggPyBcbiAgICAgICAgW2luZGV4LCAxLCB2YWx1ZUxpc3RbaW5kZXhdXSA6XG4gICAgICAgIFtpbmRleCwgMCwgdmFsdWVMaXN0W2luZGV4XV1cblxuICAgIHNldE5vbkVudW1lcmFibGUodmFsdWVMaXN0LCBcIl9kaWZmXCIsIFt2YWx1ZUFyZ3NdKVxuXG4gICAgb2JzLl9vYnNlcnZTZXQodmFsdWVMaXN0KVxuICAgIHJldHVybiB2YWx1ZVxufSIsInZhciBhcHBseVBhdGNoID0gcmVxdWlyZShcIi4vYXBwbHktcGF0Y2guanNcIilcbnZhciBzZXROb25FbnVtZXJhYmxlID0gcmVxdWlyZShcIi4vbGliL3NldC1ub24tZW51bWVyYWJsZS5qc1wiKVxudmFyIGFkaWZmID0gcmVxdWlyZShcImFkaWZmXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gc2V0XG5cbmZ1bmN0aW9uIHNldChyYXdMaXN0KSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHJhd0xpc3QpKSByYXdMaXN0ID0gW11cblxuICAgIHZhciBvYnMgPSB0aGlzXG4gICAgdmFyIGNoYW5nZXMgPSBhZGlmZi5kaWZmKG9icy5fbGlzdCwgcmF3TGlzdClcbiAgICB2YXIgdmFsdWVMaXN0ID0gb2JzKCkuc2xpY2UoKVxuXG4gICAgdmFyIHZhbHVlQ2hhbmdlcyA9IGNoYW5nZXMubWFwKGFwcGx5UGF0Y2guYmluZChvYnMsIHZhbHVlTGlzdCkpXG5cbiAgICBzZXROb25FbnVtZXJhYmxlKHZhbHVlTGlzdCwgXCJfZGlmZlwiLCB2YWx1ZUNoYW5nZXMpXG5cbiAgICBvYnMuX29ic2VydlNldCh2YWx1ZUxpc3QpXG4gICAgcmV0dXJuIGNoYW5nZXNcbn1cbiIsInZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZVxuXG52YXIgYWRkTGlzdGVuZXIgPSByZXF1aXJlKFwiLi9hZGQtbGlzdGVuZXIuanNcIilcbnZhciBzZXROb25FbnVtZXJhYmxlID0gcmVxdWlyZShcIi4vbGliL3NldC1ub24tZW51bWVyYWJsZS5qc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzcGxpY2VcblxuLy8gYG9icy5zcGxpY2VgIGlzIGEgbXV0YWJsZSBpbXBsZW1lbnRhdGlvbiBvZiBgc3BsaWNlKClgXG4vLyB0aGF0IG11dGF0ZXMgYm90aCBgbGlzdGAgYW5kIHRoZSBpbnRlcm5hbCBgdmFsdWVMaXN0YCB0aGF0XG4vLyBpcyB0aGUgY3VycmVudCB2YWx1ZSBvZiBgb2JzYCBpdHNlbGZcbmZ1bmN0aW9uIHNwbGljZShpbmRleCwgYW1vdW50KSB7XG4gICAgdmFyIG9icyA9IHRoaXNcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKVxuICAgIHZhciB2YWx1ZUxpc3QgPSBvYnMoKS5zbGljZSgpXG5cbiAgICAvLyBnZW5lcmF0ZSBhIGxpc3Qgb2YgYXJncyB0byBtdXRhdGUgdGhlIGludGVybmFsXG4gICAgLy8gbGlzdCBvZiBvbmx5IG9ic1xuICAgIHZhciB2YWx1ZUFyZ3MgPSBhcmdzLm1hcChmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XG4gICAgICAgIGlmIChpbmRleCA9PT0gMCB8fCBpbmRleCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICAgIH1cblxuICAgICAgICAvLyBtdXN0IHVucGFjayBvYnNlcnZhYmxlcyB0aGF0IHdlIGFyZSBhZGRpbmdcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gdmFsdWUoKSA6IHZhbHVlXG4gICAgfSlcblxuICAgIHZhbHVlTGlzdC5zcGxpY2UuYXBwbHkodmFsdWVMaXN0LCB2YWx1ZUFyZ3MpXG4gICAgLy8gd2UgcmVtb3ZlIHRoZSBvYnNlcnZzIHRoYXQgd2UgcmVtb3ZlXG4gICAgdmFyIHJlbW92ZWQgPSBvYnMuX2xpc3Quc3BsaWNlLmFwcGx5KG9icy5fbGlzdCwgYXJncylcblxuICAgIHZhciBleHRyYVJlbW92ZUxpc3RlbmVycyA9IGFyZ3Muc2xpY2UoMikubWFwKGZ1bmN0aW9uIChvYnNlcnYpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBvYnNlcnYgPT09IFwiZnVuY3Rpb25cIiA/XG4gICAgICAgICAgICBhZGRMaXN0ZW5lcihvYnMsIG9ic2VydikgOlxuICAgICAgICAgICAgbnVsbFxuICAgIH0pXG4gICAgZXh0cmFSZW1vdmVMaXN0ZW5lcnMudW5zaGlmdChhcmdzWzBdLCBhcmdzWzFdKVxuICAgIHZhciByZW1vdmVkTGlzdGVuZXJzID0gb2JzLl9yZW1vdmVMaXN0ZW5lcnMuc3BsaWNlXG4gICAgICAgIC5hcHBseShvYnMuX3JlbW92ZUxpc3RlbmVycywgZXh0cmFSZW1vdmVMaXN0ZW5lcnMpXG5cbiAgICByZW1vdmVkTGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKHJlbW92ZU9ic2Vydkxpc3RlbmVyKSB7XG4gICAgICAgIGlmIChyZW1vdmVPYnNlcnZMaXN0ZW5lcikge1xuICAgICAgICAgICAgcmVtb3ZlT2JzZXJ2TGlzdGVuZXIoKVxuICAgICAgICB9XG4gICAgfSlcblxuICAgIHNldE5vbkVudW1lcmFibGUodmFsdWVMaXN0LCBcIl9kaWZmXCIsIFt2YWx1ZUFyZ3NdKVxuXG4gICAgb2JzLl9vYnNlcnZTZXQodmFsdWVMaXN0KVxuICAgIHJldHVybiByZW1vdmVkXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHRyYW5zYWN0aW9uXG5cbmZ1bmN0aW9uIHRyYW5zYWN0aW9uIChmdW5jKSB7XG4gICAgdmFyIG9icyA9IHRoaXNcbiAgICB2YXIgcmF3TGlzdCA9IG9icy5fbGlzdC5zbGljZSgpXG5cbiAgICBpZiAoZnVuYyhyYXdMaXN0KSAhPT0gZmFsc2UpeyAvLyBhbGxvdyBjYW5jZWxcbiAgICAgICAgcmV0dXJuIG9icy5zZXQocmF3TGlzdClcbiAgICB9XG5cbn0iLCJ2YXIgT2JzZXJ2ID0gcmVxdWlyZShcIm9ic2VydlwiKVxudmFyIGV4dGVuZCA9IHJlcXVpcmUoXCJ4dGVuZFwiKVxuXG52YXIgYmxhY2tMaXN0ID0gW1wibmFtZVwiLCBcIl9kaWZmXCIsIFwiX3R5cGVcIiwgXCJfdmVyc2lvblwiXVxudmFyIGJsYWNrTGlzdFJlYXNvbnMgPSB7XG4gICAgXCJuYW1lXCI6IFwiQ2xhc2hlcyB3aXRoIGBGdW5jdGlvbi5wcm90b3R5cGUubmFtZWAuXFxuXCIsXG4gICAgXCJfZGlmZlwiOiBcIl9kaWZmIGlzIHJlc2VydmVkIGtleSBvZiBvYnNlcnYtc3RydWN0LlxcblwiLFxuICAgIFwiX3R5cGVcIjogXCJfdHlwZSBpcyByZXNlcnZlZCBrZXkgb2Ygb2JzZXJ2LXN0cnVjdC5cXG5cIixcbiAgICBcIl92ZXJzaW9uXCI6IFwiX3ZlcnNpb24gaXMgcmVzZXJ2ZWQga2V5IG9mIG9ic2Vydi1zdHJ1Y3QuXFxuXCJcbn1cbnZhciBOT19UUkFOU0FDVElPTiA9IHt9XG5cbmZ1bmN0aW9uIHNldE5vbkVudW1lcmFibGUob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwga2V5LCB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB9KVxufVxuXG4vKiBPYnNlcnZTdHJ1Y3QgOj0gKE9iamVjdDxTdHJpbmcsIE9ic2VydjxUPj4pID0+IFxuICAgIE9iamVjdDxTdHJpbmcsIE9ic2VydjxUPj4gJlxuICAgICAgICBPYnNlcnY8T2JqZWN0PFN0cmluZywgVD4gJiB7XG4gICAgICAgICAgICBfZGlmZjogT2JqZWN0PFN0cmluZywgQW55PlxuICAgICAgICB9PlxuXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBPYnNlcnZTdHJ1Y3RcblxuZnVuY3Rpb24gT2JzZXJ2U3RydWN0KHN0cnVjdCkge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoc3RydWN0KVxuXG4gICAgdmFyIGluaXRpYWxTdGF0ZSA9IHt9XG4gICAgdmFyIGN1cnJlbnRUcmFuc2FjdGlvbiA9IE5PX1RSQU5TQUNUSU9OXG4gICAgdmFyIG5lc3RlZFRyYW5zYWN0aW9uID0gTk9fVFJBTlNBQ1RJT05cblxuICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGlmIChibGFja0xpc3QuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2Fubm90IGNyZWF0ZSBhbiBvYnNlcnYtc3RydWN0IFwiICtcbiAgICAgICAgICAgICAgICBcIndpdGggYSBrZXkgbmFtZWQgJ1wiICsga2V5ICsgXCInLlxcblwiICtcbiAgICAgICAgICAgICAgICBibGFja0xpc3RSZWFzb25zW2tleV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG9ic2VydiA9IHN0cnVjdFtrZXldXG4gICAgICAgIGluaXRpYWxTdGF0ZVtrZXldID0gdHlwZW9mIG9ic2VydiA9PT0gXCJmdW5jdGlvblwiID9cbiAgICAgICAgICAgIG9ic2VydigpIDogb2JzZXJ2XG4gICAgfSlcblxuICAgIHZhciBvYnMgPSBPYnNlcnYoaW5pdGlhbFN0YXRlKVxuICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHZhciBvYnNlcnYgPSBzdHJ1Y3Rba2V5XVxuICAgICAgICBvYnNba2V5XSA9IG9ic2VydlxuXG4gICAgICAgIGlmICh0eXBlb2Ygb2JzZXJ2ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIG9ic2VydihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAobmVzdGVkVHJhbnNhY3Rpb24gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IGV4dGVuZChvYnMoKSlcbiAgICAgICAgICAgICAgICBzdGF0ZVtrZXldID0gdmFsdWVcbiAgICAgICAgICAgICAgICB2YXIgZGlmZiA9IHt9XG4gICAgICAgICAgICAgICAgZGlmZltrZXldID0gdmFsdWUgJiYgdmFsdWUuX2RpZmYgP1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZS5fZGlmZiA6IHZhbHVlXG5cbiAgICAgICAgICAgICAgICBzZXROb25FbnVtZXJhYmxlKHN0YXRlLCBcIl9kaWZmXCIsIGRpZmYpXG4gICAgICAgICAgICAgICAgY3VycmVudFRyYW5zYWN0aW9uID0gc3RhdGVcbiAgICAgICAgICAgICAgICBvYnMuc2V0KHN0YXRlKVxuICAgICAgICAgICAgICAgIGN1cnJlbnRUcmFuc2FjdGlvbiA9IE5PX1RSQU5TQUNUSU9OXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfSlcbiAgICB2YXIgX3NldCA9IG9icy5zZXRcbiAgICBvYnMuc2V0ID0gZnVuY3Rpb24gdHJhY2tEaWZmKHZhbHVlKSB7XG4gICAgICAgIGlmIChjdXJyZW50VHJhbnNhY3Rpb24gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gX3NldCh2YWx1ZSlcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBuZXdTdGF0ZSA9IGV4dGVuZCh2YWx1ZSlcbiAgICAgICAgc2V0Tm9uRW51bWVyYWJsZShuZXdTdGF0ZSwgXCJfZGlmZlwiLCB2YWx1ZSlcbiAgICAgICAgX3NldChuZXdTdGF0ZSlcbiAgICB9XG5cbiAgICBvYnMoZnVuY3Rpb24gKG5ld1N0YXRlKSB7XG4gICAgICAgIGlmIChjdXJyZW50VHJhbnNhY3Rpb24gPT09IG5ld1N0YXRlKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ID0gc3RydWN0W2tleV1cbiAgICAgICAgICAgIHZhciBuZXdPYnNlcnZWYWx1ZSA9IG5ld1N0YXRlW2tleV1cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvYnNlcnYgPT09IFwiZnVuY3Rpb25cIiAmJlxuICAgICAgICAgICAgICAgIG9ic2VydigpICE9PSBuZXdPYnNlcnZWYWx1ZVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgbmVzdGVkVHJhbnNhY3Rpb24gPSBuZXdPYnNlcnZWYWx1ZVxuICAgICAgICAgICAgICAgIG9ic2Vydi5zZXQobmV3U3RhdGVba2V5XSlcbiAgICAgICAgICAgICAgICBuZXN0ZWRUcmFuc2FjdGlvbiA9IE5PX1RSQU5TQUNUSU9OXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfSlcblxuICAgIG9icy5fdHlwZSA9IFwib2JzZXJ2LXN0cnVjdFwiXG4gICAgb2JzLl92ZXJzaW9uID0gXCI1XCJcblxuICAgIHJldHVybiBvYnNcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZXh0ZW5kXG5cbmZ1bmN0aW9uIGV4dGVuZCgpIHtcbiAgICB2YXIgdGFyZ2V0ID0ge31cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV1cblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBpZiAoc291cmNlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGFyZ2V0XG59XG4iLCJ2YXIgT2JzZXJ2ID0gcmVxdWlyZSgnb2JzZXJ2JylcbnZhciBleHRlbmQgPSByZXF1aXJlKCd4dGVuZCcpXG5cbnZhciBOT19UUkFOU0FDVElPTiA9IHt9XG5cbm1vZHVsZS5leHBvcnRzID0gT2JzZXJ2VmFyaGFzaFxuXG5mdW5jdGlvbiBPYnNlcnZWYXJoYXNoIChoYXNoLCBjcmVhdGVWYWx1ZSkge1xuICBjcmVhdGVWYWx1ZSA9IGNyZWF0ZVZhbHVlIHx8IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiB9XG5cbiAgdmFyIGluaXRpYWxTdGF0ZSA9IHt9XG4gIHZhciBjdXJyZW50VHJhbnNhY3Rpb24gPSBOT19UUkFOU0FDVElPTlxuXG4gIHZhciBvYnMgPSBPYnNlcnYoaW5pdGlhbFN0YXRlKVxuICBzZXROb25FbnVtZXJhYmxlKG9icywgJ19yZW1vdmVMaXN0ZW5lcnMnLCB7fSlcblxuICBzZXROb25FbnVtZXJhYmxlKG9icywgJ3NldCcsIG9icy5zZXQpXG4gIHNldE5vbkVudW1lcmFibGUob2JzLCAnZ2V0JywgZ2V0LmJpbmQob2JzKSlcbiAgc2V0Tm9uRW51bWVyYWJsZShvYnMsICdwdXQnLCBwdXQuYmluZChvYnMsIGNyZWF0ZVZhbHVlLCBjdXJyZW50VHJhbnNhY3Rpb24pKVxuICBzZXROb25FbnVtZXJhYmxlKG9icywgJ2RlbGV0ZScsIGRlbC5iaW5kKG9icykpXG5cbiAgZm9yICh2YXIga2V5IGluIGhhc2gpIHtcbiAgICBvYnNba2V5XSA9IHR5cGVvZiBoYXNoW2tleV0gPT09ICdmdW5jdGlvbicgP1xuICAgICAgaGFzaFtrZXldIDogY3JlYXRlVmFsdWUoaGFzaFtrZXldLCBrZXkpXG5cbiAgICBpZiAoaXNGbihvYnNba2V5XSkpIHtcbiAgICAgIG9icy5fcmVtb3ZlTGlzdGVuZXJzW2tleV0gPSBvYnNba2V5XSh3YXRjaChvYnMsIGtleSwgY3VycmVudFRyYW5zYWN0aW9uKSlcbiAgICB9XG4gIH1cblxuICB2YXIgbmV3U3RhdGUgPSB7fVxuICBmb3IgKGtleSBpbiBoYXNoKSB7XG4gICAgdmFyIG9ic2VydiA9IG9ic1trZXldXG4gICAgY2hlY2tLZXkoa2V5KVxuICAgIG5ld1N0YXRlW2tleV0gPSBpc0ZuKG9ic2VydikgPyBvYnNlcnYoKSA6IG9ic2VydlxuICB9XG4gIG9icy5zZXQobmV3U3RhdGUpXG5cbiAgb2JzKGZ1bmN0aW9uIChuZXdTdGF0ZSkge1xuICAgIGlmIChjdXJyZW50VHJhbnNhY3Rpb24gPT09IG5ld1N0YXRlKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gaGFzaCkge1xuICAgICAgdmFyIG9ic2VydiA9IGhhc2hba2V5XVxuXG4gICAgICBpZiAoaXNGbihvYnNlcnYpICYmIG9ic2VydigpICE9PSBuZXdTdGF0ZVtrZXldKSB7XG4gICAgICAgIG9ic2Vydi5zZXQobmV3U3RhdGVba2V5XSlcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIG9ic1xufVxuXG4vLyBhY2Nlc3MgYW5kIG11dGF0ZVxuZnVuY3Rpb24gZ2V0IChrZXkpIHtcbiAgcmV0dXJuIHRoaXNba2V5XVxufVxuXG5mdW5jdGlvbiBwdXQgKGNyZWF0ZVZhbHVlLCBjdXJyZW50VHJhbnNhY3Rpb24sIGtleSwgdmFsKSB7XG4gIGNoZWNrS2V5KGtleSlcblxuICBpZiAodmFsID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nhbm5vdCB2YXJoYXNoLnB1dChrZXksIHVuZGVmaW5lZCkuJylcbiAgfVxuXG4gIHZhciBvYnNlcnYgPSB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nID9cbiAgICB2YWwgOiBjcmVhdGVWYWx1ZSh2YWwsIGtleSlcbiAgdmFyIHN0YXRlID0gZXh0ZW5kKHRoaXMoKSlcblxuICBzdGF0ZVtrZXldID0gaXNGbihvYnNlcnYpID8gb2JzZXJ2KCkgOiBvYnNlcnZcblxuICBpZiAoaXNGbih0aGlzLl9yZW1vdmVMaXN0ZW5lcnNba2V5XSkpIHtcbiAgICB0aGlzLl9yZW1vdmVMaXN0ZW5lcnNba2V5XSgpXG4gIH1cblxuICB0aGlzLl9yZW1vdmVMaXN0ZW5lcnNba2V5XSA9IGlzRm4ob2JzZXJ2KSA/XG4gICAgb2JzZXJ2KHdhdGNoKHRoaXMsIGtleSwgY3VycmVudFRyYW5zYWN0aW9uKSkgOiBudWxsXG5cbiAgc2V0Tm9uRW51bWVyYWJsZShzdGF0ZSwgJ19kaWZmJywgZGlmZihrZXksIHN0YXRlW2tleV0pKVxuXG4gIHRoaXNba2V5XSA9IG9ic2VydlxuICB0aGlzLnNldChzdGF0ZSlcblxuICByZXR1cm4gdGhpc1xufVxuXG5mdW5jdGlvbiBkZWwgKGtleSkge1xuICB2YXIgc3RhdGUgPSBleHRlbmQodGhpcygpKVxuICBpZiAoaXNGbih0aGlzLl9yZW1vdmVMaXN0ZW5lcnNba2V5XSkpIHtcbiAgICB0aGlzLl9yZW1vdmVMaXN0ZW5lcnNba2V5XSgpXG4gIH1cblxuICBkZWxldGUgdGhpcy5fcmVtb3ZlTGlzdGVuZXJzW2tleV1cbiAgZGVsZXRlIHN0YXRlW2tleV1cbiAgZGVsZXRlIHRoaXNba2V5XVxuXG4gIHNldE5vbkVudW1lcmFibGUoc3RhdGUsICdfZGlmZicsIGRpZmYoa2V5LCB1bmRlZmluZWQpKVxuICB0aGlzLnNldChzdGF0ZSlcblxuICByZXR1cm4gdGhpc1xufVxuXG4vLyBwcm9jZXNzaW5nXG5mdW5jdGlvbiB3YXRjaCAob2JzLCBrZXksIGN1cnJlbnRUcmFuc2FjdGlvbikge1xuICByZXR1cm4gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIHN0YXRlID0gZXh0ZW5kKG9icygpKVxuICAgIHN0YXRlW2tleV0gPSB2YWx1ZVxuXG4gICAgc2V0Tm9uRW51bWVyYWJsZShzdGF0ZSwgJ19kaWZmJywgZGlmZihrZXksIHZhbHVlKSlcbiAgICBjdXJyZW50VHJhbnNhY3Rpb24gPSBzdGF0ZVxuICAgIG9icy5zZXQoc3RhdGUpXG4gICAgY3VycmVudFRyYW5zYWN0aW9uID0gTk9fVFJBTlNBQ1RJT05cbiAgfVxufVxuXG5mdW5jdGlvbiBkaWZmIChrZXksIHZhbHVlKSB7XG4gIHZhciBvYmogPSB7fVxuICBvYmpba2V5XSA9IHZhbHVlICYmIHZhbHVlLl9kaWZmID8gdmFsdWUuX2RpZmYgOiB2YWx1ZVxuICByZXR1cm4gb2JqXG59XG5cbmZ1bmN0aW9uIGlzRm4gKG9iaikge1xuICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJ1xufVxuXG5mdW5jdGlvbiBzZXROb25FbnVtZXJhYmxlKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqZWN0LCBrZXksIHtcbiAgICB2YWx1ZTogdmFsdWUsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IGZhbHNlXG4gIH0pXG59XG5cbi8vIGVycm9yc1xudmFyIGJsYWNrbGlzdCA9IHtcbiAgbmFtZTogJ0NsYXNoZXMgd2l0aCBgRnVuY3Rpb24ucHJvdG90eXBlLm5hbWVgLicsXG4gIGdldDogJ2dldCBpcyBhIHJlc2VydmVkIGtleSBvZiBvYnNlcnYtdmFyaGFzaCBtZXRob2QnLFxuICBwdXQ6ICdwdXQgaXMgYSByZXNlcnZlZCBrZXkgb2Ygb2JzZXJ2LXZhcmhhc2ggbWV0aG9kJyxcbiAgJ2RlbGV0ZSc6ICdkZWxldGUgaXMgYSByZXNlcnZlZCBrZXkgb2Ygb2JzZXJ2LXZhcmhhc2ggbWV0aG9kJyxcbiAgX2RpZmY6ICdfZGlmZiBpcyBhIHJlc2VydmVkIGtleSBvZiBvYnNlcnYtdmFyaGFzaCBtZXRob2QnLFxuICBfcmVtb3ZlTGlzdGVuZXJzOiAnX3JlbW92ZUxpc3RlbmVycyBpcyBhIHJlc2VydmVkIGtleSBvZiBvYnNlcnYtdmFyaGFzaCdcbn1cblxuZnVuY3Rpb24gY2hlY2tLZXkgKGtleSkge1xuICBpZiAoIWJsYWNrbGlzdFtrZXldKSByZXR1cm5cbiAgdGhyb3cgbmV3IEVycm9yKFxuICAgICdjYW5ub3QgY3JlYXRlIGFuIG9ic2Vydi12YXJoYXNoIHdpdGgga2V5IGAnICsga2V5ICsgJ2AuICcgKyBibGFja2xpc3Rba2V5XVxuICApXG59XG4iLCJ2YXIgT2JzZXJ2YWJsZSA9IHJlcXVpcmUoXCIuL2luZGV4LmpzXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gY29tcHV0ZWRcblxuZnVuY3Rpb24gY29tcHV0ZWQob2JzZXJ2YWJsZXMsIGxhbWJkYSkge1xuICAgIHZhciB2YWx1ZXMgPSBvYnNlcnZhYmxlcy5tYXAoZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgcmV0dXJuIG8oKVxuICAgIH0pXG4gICAgdmFyIHJlc3VsdCA9IE9ic2VydmFibGUobGFtYmRhLmFwcGx5KG51bGwsIHZhbHVlcykpXG5cbiAgICBvYnNlcnZhYmxlcy5mb3JFYWNoKGZ1bmN0aW9uIChvLCBpbmRleCkge1xuICAgICAgICBvKGZ1bmN0aW9uIChuZXdWYWx1ZSkge1xuICAgICAgICAgICAgdmFsdWVzW2luZGV4XSA9IG5ld1ZhbHVlXG4gICAgICAgICAgICByZXN1bHQuc2V0KGxhbWJkYS5hcHBseShudWxsLCB2YWx1ZXMpKVxuICAgICAgICB9KVxuICAgIH0pXG5cbiAgICByZXR1cm4gcmVzdWx0XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IE9ic2VydmFibGVcblxuZnVuY3Rpb24gT2JzZXJ2YWJsZSh2YWx1ZSkge1xuICAgIHZhciBsaXN0ZW5lcnMgPSBbXVxuICAgIHZhbHVlID0gdmFsdWUgPT09IHVuZGVmaW5lZCA/IG51bGwgOiB2YWx1ZVxuXG4gICAgb2JzZXJ2YWJsZS5zZXQgPSBmdW5jdGlvbiAodikge1xuICAgICAgICB2YWx1ZSA9IHZcbiAgICAgICAgbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGYpIHtcbiAgICAgICAgICAgIGYodilcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4gb2JzZXJ2YWJsZVxuXG4gICAgZnVuY3Rpb24gb2JzZXJ2YWJsZShsaXN0ZW5lcikge1xuICAgICAgICBpZiAoIWxpc3RlbmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgICAgfVxuXG4gICAgICAgIGxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKVxuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICAgICAgICBsaXN0ZW5lcnMuc3BsaWNlKGxpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKSwgMSlcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gd2F0Y2hcblxuZnVuY3Rpb24gd2F0Y2gob2JzZXJ2YWJsZSwgbGlzdGVuZXIpIHtcbiAgICB2YXIgcmVtb3ZlID0gb2JzZXJ2YWJsZShsaXN0ZW5lcilcbiAgICBsaXN0ZW5lcihvYnNlcnZhYmxlKCkpXG4gICAgcmV0dXJuIHJlbW92ZVxufVxuIiwidmFyIERlbGVnYXRvciA9IHJlcXVpcmUoJ2RvbS1kZWxlZ2F0b3InKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VFdmVudFxuXG5mdW5jdGlvbiBCYXNlRXZlbnQobGFtYmRhKSB7XG4gICAgcmV0dXJuIEV2ZW50SGFuZGxlcjtcblxuICAgIGZ1bmN0aW9uIEV2ZW50SGFuZGxlcihmbiwgZGF0YSwgb3B0cykge1xuICAgICAgICB2YXIgaGFuZGxlciA9IHtcbiAgICAgICAgICAgIGZuOiBmbixcbiAgICAgICAgICAgIGRhdGE6IGRhdGEgIT09IHVuZGVmaW5lZCA/IGRhdGEgOiB7fSxcbiAgICAgICAgICAgIG9wdHM6IG9wdHMgfHwge30sXG4gICAgICAgICAgICBoYW5kbGVFdmVudDogaGFuZGxlRXZlbnRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmbiAmJiBmbi50eXBlID09PSAnZG9tLWRlbGVnYXRvci1oYW5kbGUnKSB7XG4gICAgICAgICAgICByZXR1cm4gRGVsZWdhdG9yLnRyYW5zZm9ybUhhbmRsZShmbixcbiAgICAgICAgICAgICAgICBoYW5kbGVMYW1iZGEuYmluZChoYW5kbGVyKSlcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBoYW5kbGVyO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZUxhbWJkYShldiwgYnJvYWRjYXN0KSB7XG4gICAgICAgIGlmICh0aGlzLm9wdHMuc3RhcnRQcm9wYWdhdGlvbiAmJiBldi5zdGFydFByb3BhZ2F0aW9uKSB7XG4gICAgICAgICAgICBldi5zdGFydFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbGFtYmRhLmNhbGwodGhpcywgZXYsIGJyb2FkY2FzdClcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVFdmVudChldikge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXNcblxuICAgICAgICBpZiAoc2VsZi5vcHRzLnN0YXJ0UHJvcGFnYXRpb24gJiYgZXYuc3RhcnRQcm9wYWdhdGlvbikge1xuICAgICAgICAgICAgZXYuc3RhcnRQcm9wYWdhdGlvbigpXG4gICAgICAgIH1cblxuICAgICAgICBsYW1iZGEuY2FsbChzZWxmLCBldiwgYnJvYWRjYXN0KVxuXG4gICAgICAgIGZ1bmN0aW9uIGJyb2FkY2FzdCh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBzZWxmLmZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5mbih2YWx1ZSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5mbi53cml0ZSh2YWx1ZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiIsInZhciBleHRlbmQgPSByZXF1aXJlKCd4dGVuZCcpXG52YXIgZ2V0Rm9ybURhdGEgPSByZXF1aXJlKCdmb3JtLWRhdGEtc2V0L2VsZW1lbnQnKVxuXG52YXIgQmFzZUV2ZW50ID0gcmVxdWlyZSgnLi9iYXNlLWV2ZW50LmpzJylcblxudmFyIFZBTElEX0NIQU5HRSA9IFsnY2hlY2tib3gnLCAnZmlsZScsICdzZWxlY3QtbXVsdGlwbGUnLCAnc2VsZWN0LW9uZSddO1xudmFyIFZBTElEX0lOUFVUID0gWydjb2xvcicsICdkYXRlJywgJ2RhdGV0aW1lJywgJ2RhdGV0aW1lLWxvY2FsJywgJ2VtYWlsJyxcbiAgICAnbW9udGgnLCAnbnVtYmVyJywgJ3Bhc3N3b3JkJywgJ3JhbmdlJywgJ3NlYXJjaCcsICd0ZWwnLCAndGV4dCcsICd0aW1lJyxcbiAgICAndXJsJywgJ3dlZWsnXTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlRXZlbnQoY2hhbmdlTGFtYmRhKTtcblxuZnVuY3Rpb24gY2hhbmdlTGFtYmRhKGV2LCBicm9hZGNhc3QpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZXYudGFyZ2V0XG5cbiAgICB2YXIgaXNWYWxpZCA9XG4gICAgICAgIChldi50eXBlID09PSAnaW5wdXQnICYmIFZBTElEX0lOUFVULmluZGV4T2YodGFyZ2V0LnR5cGUpICE9PSAtMSkgfHxcbiAgICAgICAgKGV2LnR5cGUgPT09ICdjaGFuZ2UnICYmIFZBTElEX0NIQU5HRS5pbmRleE9mKHRhcmdldC50eXBlKSAhPT0gLTEpO1xuXG4gICAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgICAgIGlmIChldi5zdGFydFByb3BhZ2F0aW9uKSB7XG4gICAgICAgICAgICBldi5zdGFydFByb3BhZ2F0aW9uKClcbiAgICAgICAgfVxuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB2YXIgdmFsdWUgPSBnZXRGb3JtRGF0YShldi5jdXJyZW50VGFyZ2V0KVxuICAgIHZhciBkYXRhID0gZXh0ZW5kKHZhbHVlLCB0aGlzLmRhdGEpXG5cbiAgICBicm9hZGNhc3QoZGF0YSlcbn1cbiIsInZhciBCYXNlRXZlbnQgPSByZXF1aXJlKCcuL2Jhc2UtZXZlbnQuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlRXZlbnQoY2xpY2tMYW1iZGEpO1xuXG5mdW5jdGlvbiBjbGlja0xhbWJkYShldiwgYnJvYWRjYXN0KSB7XG4gICAgdmFyIG9wdHMgPSB0aGlzLm9wdHM7XG5cbiAgICBpZiAoIW9wdHMuY3RybCAmJiBldi5jdHJsS2V5KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIW9wdHMubWV0YSAmJiBldi5tZXRhS2V5KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIW9wdHMucmlnaHRDbGljayAmJiBldi53aGljaCA9PT0gMikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0cy5wcmV2ZW50RGVmYXVsdCAmJiBldi5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIGJyb2FkY2FzdCh0aGlzLmRhdGEpO1xufVxuIiwidmFyIEJhc2VFdmVudCA9IHJlcXVpcmUoJy4vYmFzZS1ldmVudC5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VFdmVudChldmVudExhbWJkYSk7XG5cbmZ1bmN0aW9uIGV2ZW50TGFtYmRhKGV2LCBicm9hZGNhc3QpIHtcbiAgICBicm9hZGNhc3QodGhpcy5kYXRhKTtcbn1cbiIsInZhciBCYXNlRXZlbnQgPSByZXF1aXJlKCcuL2Jhc2UtZXZlbnQuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlRXZlbnQoa2V5TGFtYmRhKTtcblxuZnVuY3Rpb24ga2V5TGFtYmRhKGV2LCBicm9hZGNhc3QpIHtcbiAgICB2YXIga2V5ID0gdGhpcy5vcHRzLmtleTtcblxuICAgIGlmIChldi5rZXlDb2RlID09PSBrZXkpIHtcbiAgICAgICAgYnJvYWRjYXN0KHRoaXMuZGF0YSk7XG4gICAgfVxufVxuIiwidmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlXG5cbm1vZHVsZS5leHBvcnRzID0gaXRlcmF0aXZlbHlXYWxrXG5cbmZ1bmN0aW9uIGl0ZXJhdGl2ZWx5V2Fsayhub2RlcywgY2IpIHtcbiAgICBpZiAoISgnbGVuZ3RoJyBpbiBub2RlcykpIHtcbiAgICAgICAgbm9kZXMgPSBbbm9kZXNdXG4gICAgfVxuICAgIFxuICAgIG5vZGVzID0gc2xpY2UuY2FsbChub2RlcylcblxuICAgIHdoaWxlKG5vZGVzLmxlbmd0aCkge1xuICAgICAgICB2YXIgbm9kZSA9IG5vZGVzLnNoaWZ0KCksXG4gICAgICAgICAgICByZXQgPSBjYihub2RlKVxuXG4gICAgICAgIGlmIChyZXQpIHtcbiAgICAgICAgICAgIHJldHVybiByZXRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChub2RlLmNoaWxkTm9kZXMgJiYgbm9kZS5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgbm9kZXMgPSBzbGljZS5jYWxsKG5vZGUuY2hpbGROb2RlcykuY29uY2F0KG5vZGVzKVxuICAgICAgICB9XG4gICAgfVxufVxuIiwidmFyIHdhbGsgPSByZXF1aXJlKCdkb20td2FsaycpXG5cbnZhciBGb3JtRGF0YSA9IHJlcXVpcmUoJy4vaW5kZXguanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldEZvcm1EYXRhXG5cbmZ1bmN0aW9uIGJ1aWxkRWxlbXMocm9vdEVsZW0pIHtcbiAgICB2YXIgaGFzaCA9IHt9XG4gICAgaWYgKHJvb3RFbGVtLm5hbWUpIHtcbiAgICBcdGhhc2hbcm9vdEVsZW0ubmFtZV0gPSByb290RWxlbVxuICAgIH1cblxuICAgIHdhbGsocm9vdEVsZW0sIGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgICBpZiAoY2hpbGQubmFtZSkge1xuICAgICAgICAgICAgaGFzaFtjaGlsZC5uYW1lXSA9IGNoaWxkXG4gICAgICAgIH1cbiAgICB9KVxuXG5cbiAgICByZXR1cm4gaGFzaFxufVxuXG5mdW5jdGlvbiBnZXRGb3JtRGF0YShyb290RWxlbSkge1xuICAgIHZhciBlbGVtZW50cyA9IGJ1aWxkRWxlbXMocm9vdEVsZW0pXG5cbiAgICByZXR1cm4gRm9ybURhdGEoZWxlbWVudHMpXG59XG4iLCIvKmpzaGludCBtYXhjb21wbGV4aXR5OiAxMCovXG5cbm1vZHVsZS5leHBvcnRzID0gRm9ybURhdGFcblxuLy9UT0RPOiBNYXNzaXZlIHNwZWM6IGh0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL2Fzc29jaWF0aW9uLW9mLWNvbnRyb2xzLWFuZC1mb3Jtcy5odG1sI2NvbnN0cnVjdGluZy1mb3JtLWRhdGEtc2V0XG5mdW5jdGlvbiBGb3JtRGF0YShlbGVtZW50cykge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhlbGVtZW50cykucmVkdWNlKGZ1bmN0aW9uIChhY2MsIGtleSkge1xuICAgICAgICB2YXIgZWxlbSA9IGVsZW1lbnRzW2tleV1cblxuICAgICAgICBhY2Nba2V5XSA9IHZhbHVlT2ZFbGVtZW50KGVsZW0pXG5cbiAgICAgICAgcmV0dXJuIGFjY1xuICAgIH0sIHt9KVxufVxuXG5mdW5jdGlvbiB2YWx1ZU9mRWxlbWVudChlbGVtKSB7XG4gICAgaWYgKHR5cGVvZiBlbGVtID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGVsZW0oKVxuICAgIH0gZWxzZSBpZiAoY29udGFpbnNSYWRpbyhlbGVtKSkge1xuICAgICAgICB2YXIgZWxlbXMgPSB0b0xpc3QoZWxlbSlcbiAgICAgICAgdmFyIGNoZWNrZWQgPSBlbGVtcy5maWx0ZXIoZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtLmNoZWNrZWRcbiAgICAgICAgfSlbMF0gfHwgbnVsbFxuXG4gICAgICAgIHJldHVybiBjaGVja2VkID8gY2hlY2tlZC52YWx1ZSA6IG51bGxcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZWxlbSkpIHtcbiAgICAgICAgcmV0dXJuIGVsZW0ubWFwKHZhbHVlT2ZFbGVtZW50KS5maWx0ZXIoZmlsdGVyTnVsbClcbiAgICB9IGVsc2UgaWYgKGVsZW0udGFnTmFtZSA9PT0gdW5kZWZpbmVkICYmIGVsZW0ubm9kZVR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gRm9ybURhdGEoZWxlbSlcbiAgICB9IGVsc2UgaWYgKGVsZW0udGFnTmFtZSA9PT0gXCJJTlBVVFwiICYmIGlzQ2hlY2tlZChlbGVtKSkge1xuICAgICAgICBpZiAoZWxlbS5oYXNBdHRyaWJ1dGUoXCJ2YWx1ZVwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW0uY2hlY2tlZCA/IGVsZW0udmFsdWUgOiBudWxsXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbS5jaGVja2VkXG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGVsZW0udGFnTmFtZSA9PT0gXCJJTlBVVFwiKSB7XG4gICAgICAgIHJldHVybiBlbGVtLnZhbHVlXG4gICAgfSBlbHNlIGlmIChlbGVtLnRhZ05hbWUgPT09IFwiVEVYVEFSRUFcIikge1xuICAgICAgICByZXR1cm4gZWxlbS52YWx1ZVxuICAgIH0gZWxzZSBpZiAoZWxlbS50YWdOYW1lID09PSBcIlNFTEVDVFwiKSB7XG4gICAgICAgIHJldHVybiBlbGVtLnZhbHVlXG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc0NoZWNrZWQoZWxlbSkge1xuICAgIHJldHVybiBlbGVtLnR5cGUgPT09IFwiY2hlY2tib3hcIiB8fCBlbGVtLnR5cGUgPT09IFwicmFkaW9cIlxufVxuXG5mdW5jdGlvbiBjb250YWluc1JhZGlvKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlLnRhZ05hbWUgfHwgdmFsdWUubm9kZVR5cGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgdmFyIGVsZW1zID0gdG9MaXN0KHZhbHVlKVxuXG4gICAgcmV0dXJuIGVsZW1zLnNvbWUoZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgICAgcmV0dXJuIGVsZW0udGFnTmFtZSA9PT0gXCJJTlBVVFwiICYmIGVsZW0udHlwZSA9PT0gXCJyYWRpb1wiXG4gICAgfSlcbn1cblxuZnVuY3Rpb24gdG9MaXN0KHZhbHVlKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZVxuICAgIH1cblxuICAgIHJldHVybiBPYmplY3Qua2V5cyh2YWx1ZSkubWFwKHByb3AsIHZhbHVlKVxufVxuXG5mdW5jdGlvbiBwcm9wKHgpIHtcbiAgICByZXR1cm4gdGhpc1t4XVxufVxuXG5mdW5jdGlvbiBmaWx0ZXJOdWxsKHZhbCkge1xuICAgIHJldHVybiB2YWwgIT09IG51bGxcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gaGFzS2V5c1xuXG5mdW5jdGlvbiBoYXNLZXlzKHNvdXJjZSkge1xuICAgIHJldHVybiBzb3VyY2UgIT09IG51bGwgJiZcbiAgICAgICAgKHR5cGVvZiBzb3VyY2UgPT09IFwib2JqZWN0XCIgfHxcbiAgICAgICAgdHlwZW9mIHNvdXJjZSA9PT0gXCJmdW5jdGlvblwiKVxufVxuIiwidmFyIGhhc0tleXMgPSByZXF1aXJlKFwiLi9oYXMta2V5c1wiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4dGVuZFxuXG5mdW5jdGlvbiBleHRlbmQoKSB7XG4gICAgdmFyIHRhcmdldCA9IHt9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldXG5cbiAgICAgICAgaWYgKCFoYXNLZXlzKHNvdXJjZSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBpZiAoc291cmNlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGFyZ2V0XG59XG4iLCJ2YXIgZXh0ZW5kID0gcmVxdWlyZSgneHRlbmQnKVxudmFyIGdldEZvcm1EYXRhID0gcmVxdWlyZSgnZm9ybS1kYXRhLXNldC9lbGVtZW50JylcblxudmFyIEJhc2VFdmVudCA9IHJlcXVpcmUoJy4vYmFzZS1ldmVudC5qcycpO1xuXG52YXIgRU5URVIgPSAxM1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VFdmVudChzdWJtaXRMYW1iZGEpO1xuXG5mdW5jdGlvbiBzdWJtaXRMYW1iZGEoZXYsIGJyb2FkY2FzdCkge1xuICAgIHZhciB0YXJnZXQgPSBldi50YXJnZXRcblxuICAgIHZhciBpc1ZhbGlkID1cbiAgICAgICAgKGV2LnR5cGUgPT09ICdzdWJtaXQnICYmIHRhcmdldC50YWdOYW1lID09PSAnRk9STScpIHx8XG4gICAgICAgIChldi50eXBlID09PSAnY2xpY2snICYmIHRhcmdldC50YWdOYW1lID09PSAnQlVUVE9OJykgfHxcbiAgICAgICAgKGV2LnR5cGUgPT09ICdjbGljaycgJiYgdGFyZ2V0LnR5cGUgPT09ICdzdWJtaXQnKSB8fFxuICAgICAgICAoXG4gICAgICAgICAgICAodGFyZ2V0LnR5cGUgPT09ICd0ZXh0JykgJiZcbiAgICAgICAgICAgIChldi5rZXlDb2RlID09PSBFTlRFUiAmJiBldi50eXBlID09PSAna2V5ZG93bicpXG4gICAgICAgIClcblxuICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgICBpZiAoZXYuc3RhcnRQcm9wYWdhdGlvbikge1xuICAgICAgICAgICAgZXYuc3RhcnRQcm9wYWdhdGlvbigpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdmFyIHZhbHVlID0gZ2V0Rm9ybURhdGEoZXYuY3VycmVudFRhcmdldClcbiAgICB2YXIgZGF0YSA9IGV4dGVuZCh2YWx1ZSwgdGhpcy5kYXRhKVxuXG4gICAgaWYgKGV2LnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgYnJvYWRjYXN0KGRhdGEpO1xufVxuIiwidmFyIGV4dGVuZCA9IHJlcXVpcmUoJ3h0ZW5kJylcbnZhciBnZXRGb3JtRGF0YSA9IHJlcXVpcmUoJ2Zvcm0tZGF0YS1zZXQvZWxlbWVudCcpXG5cbnZhciBCYXNlRXZlbnQgPSByZXF1aXJlKCcuL2Jhc2UtZXZlbnQuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlRXZlbnQodmFsdWVMYW1iZGEpO1xuXG5mdW5jdGlvbiB2YWx1ZUxhbWJkYShldiwgYnJvYWRjYXN0KSB7XG4gICAgdmFyIHZhbHVlID0gZ2V0Rm9ybURhdGEoZXYuY3VycmVudFRhcmdldClcbiAgICB2YXIgZGF0YSA9IGV4dGVuZCh2YWx1ZSwgdGhpcy5kYXRhKVxuXG4gICAgYnJvYWRjYXN0KGRhdGEpO1xufVxuIiwiZnVuY3Rpb24gVGh1bmsoZm4sIGFyZ3MsIGtleSwgZXFBcmdzKSB7XHJcbiAgICB0aGlzLmZuID0gZm47XHJcbiAgICB0aGlzLmFyZ3MgPSBhcmdzO1xyXG4gICAgdGhpcy5rZXkgPSBrZXk7XHJcbiAgICB0aGlzLmVxQXJncyA9IGVxQXJncztcclxufVxyXG5cclxuVGh1bmsucHJvdG90eXBlLnR5cGUgPSAnVGh1bmsnO1xyXG5UaHVuay5wcm90b3R5cGUucmVuZGVyID0gcmVuZGVyO1xyXG5tb2R1bGUuZXhwb3J0cyA9IFRodW5rO1xyXG5cclxuZnVuY3Rpb24gc2hvdWxkVXBkYXRlKGN1cnJlbnQsIHByZXZpb3VzKSB7XHJcbiAgICBpZiAoIWN1cnJlbnQgfHwgIXByZXZpb3VzIHx8IGN1cnJlbnQuZm4gIT09IHByZXZpb3VzLmZuKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNhcmdzID0gY3VycmVudC5hcmdzO1xyXG4gICAgdmFyIHBhcmdzID0gcHJldmlvdXMuYXJncztcclxuXHJcbiAgICByZXR1cm4gIWN1cnJlbnQuZXFBcmdzKGNhcmdzLCBwYXJncyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlcihwcmV2aW91cykge1xyXG4gICAgaWYgKHNob3VsZFVwZGF0ZSh0aGlzLCBwcmV2aW91cykpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mbi5hcHBseShudWxsLCB0aGlzLmFyZ3MpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gcHJldmlvdXMudm5vZGU7XHJcbiAgICB9XHJcbn1cclxuIiwidmFyIFBhcnRpYWwgPSByZXF1aXJlKCcuL3BhcnRpYWwnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGFydGlhbCgpO1xyXG4iLCJ2YXIgc2hhbGxvd0VxID0gcmVxdWlyZSgnLi9zaGFsbG93LWVxJyk7XG52YXIgVGh1bmsgPSByZXF1aXJlKCcuL2ltbXV0YWJsZS10aHVuaycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVBhcnRpYWw7XG5cbmZ1bmN0aW9uIGNyZWF0ZVBhcnRpYWwoZXEpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gcGFydGlhbChmbikge1xuICAgICAgICB2YXIgYXJncyA9IGNvcHlPdmVyKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIHZhciBmaXJzdEFyZyA9IGFyZ3NbMF07XG4gICAgICAgIHZhciBrZXk7XG5cbiAgICAgICAgdmFyIGVxQXJncyA9IGVxIHx8IHNoYWxsb3dFcTtcblxuICAgICAgICBpZiAodHlwZW9mIGZpcnN0QXJnID09PSAnb2JqZWN0JyAmJiBmaXJzdEFyZyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKCdrZXknIGluIGZpcnN0QXJnKSB7XG4gICAgICAgICAgICAgICAga2V5ID0gZmlyc3RBcmcua2V5O1xuICAgICAgICAgICAgfSBlbHNlIGlmICgnaWQnIGluIGZpcnN0QXJnKSB7XG4gICAgICAgICAgICAgICAga2V5ID0gZmlyc3RBcmcuaWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFRodW5rKGZuLCBhcmdzLCBrZXksIGVxQXJncyk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gY29weU92ZXIobGlzdCwgb2Zmc2V0KSB7XG4gICAgdmFyIG5ld0xpc3QgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gbGlzdC5sZW5ndGggLSAxOyBpID49IG9mZnNldDsgaS0tKSB7XG4gICAgICAgIG5ld0xpc3RbaSAtIG9mZnNldF0gPSBsaXN0W2ldO1xuICAgIH1cbiAgICByZXR1cm4gbmV3TGlzdDtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gc2hhbGxvd0VxO1xyXG5cclxuZnVuY3Rpb24gc2hhbGxvd0VxKGN1cnJlbnRBcmdzLCBwcmV2aW91c0FyZ3MpIHtcclxuICAgIGlmIChjdXJyZW50QXJncy5sZW5ndGggPT09IDAgJiYgcHJldmlvdXNBcmdzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjdXJyZW50QXJncy5sZW5ndGggIT09IHByZXZpb3VzQXJncy5sZW5ndGgpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGxlbiA9IGN1cnJlbnRBcmdzLmxlbmd0aDtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGN1cnJlbnRBcmdzW2ldICE9PSBwcmV2aW91c0FyZ3NbaV0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxufVxyXG4iLCIvKiFcbiAqIENyb3NzLUJyb3dzZXIgU3BsaXQgMS4xLjFcbiAqIENvcHlyaWdodCAyMDA3LTIwMTIgU3RldmVuIExldml0aGFuIDxzdGV2ZW5sZXZpdGhhbi5jb20+XG4gKiBBdmFpbGFibGUgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXG4gKiBFQ01BU2NyaXB0IGNvbXBsaWFudCwgdW5pZm9ybSBjcm9zcy1icm93c2VyIHNwbGl0IG1ldGhvZFxuICovXG5cbi8qKlxuICogU3BsaXRzIGEgc3RyaW5nIGludG8gYW4gYXJyYXkgb2Ygc3RyaW5ncyB1c2luZyBhIHJlZ2V4IG9yIHN0cmluZyBzZXBhcmF0b3IuIE1hdGNoZXMgb2YgdGhlXG4gKiBzZXBhcmF0b3IgYXJlIG5vdCBpbmNsdWRlZCBpbiB0aGUgcmVzdWx0IGFycmF5LiBIb3dldmVyLCBpZiBgc2VwYXJhdG9yYCBpcyBhIHJlZ2V4IHRoYXQgY29udGFpbnNcbiAqIGNhcHR1cmluZyBncm91cHMsIGJhY2tyZWZlcmVuY2VzIGFyZSBzcGxpY2VkIGludG8gdGhlIHJlc3VsdCBlYWNoIHRpbWUgYHNlcGFyYXRvcmAgaXMgbWF0Y2hlZC5cbiAqIEZpeGVzIGJyb3dzZXIgYnVncyBjb21wYXJlZCB0byB0aGUgbmF0aXZlIGBTdHJpbmcucHJvdG90eXBlLnNwbGl0YCBhbmQgY2FuIGJlIHVzZWQgcmVsaWFibHlcbiAqIGNyb3NzLWJyb3dzZXIuXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFN0cmluZyB0byBzcGxpdC5cbiAqIEBwYXJhbSB7UmVnRXhwfFN0cmluZ30gc2VwYXJhdG9yIFJlZ2V4IG9yIHN0cmluZyB0byB1c2UgZm9yIHNlcGFyYXRpbmcgdGhlIHN0cmluZy5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbbGltaXRdIE1heGltdW0gbnVtYmVyIG9mIGl0ZW1zIHRvIGluY2x1ZGUgaW4gdGhlIHJlc3VsdCBhcnJheS5cbiAqIEByZXR1cm5zIHtBcnJheX0gQXJyYXkgb2Ygc3Vic3RyaW5ncy5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gQmFzaWMgdXNlXG4gKiBzcGxpdCgnYSBiIGMgZCcsICcgJyk7XG4gKiAvLyAtPiBbJ2EnLCAnYicsICdjJywgJ2QnXVxuICpcbiAqIC8vIFdpdGggbGltaXRcbiAqIHNwbGl0KCdhIGIgYyBkJywgJyAnLCAyKTtcbiAqIC8vIC0+IFsnYScsICdiJ11cbiAqXG4gKiAvLyBCYWNrcmVmZXJlbmNlcyBpbiByZXN1bHQgYXJyYXlcbiAqIHNwbGl0KCcuLndvcmQxIHdvcmQyLi4nLCAvKFthLXpdKykoXFxkKykvaSk7XG4gKiAvLyAtPiBbJy4uJywgJ3dvcmQnLCAnMScsICcgJywgJ3dvcmQnLCAnMicsICcuLiddXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uIHNwbGl0KHVuZGVmKSB7XG5cbiAgdmFyIG5hdGl2ZVNwbGl0ID0gU3RyaW5nLnByb3RvdHlwZS5zcGxpdCxcbiAgICBjb21wbGlhbnRFeGVjTnBjZyA9IC8oKT8/Ly5leGVjKFwiXCIpWzFdID09PSB1bmRlZixcbiAgICAvLyBOUENHOiBub25wYXJ0aWNpcGF0aW5nIGNhcHR1cmluZyBncm91cFxuICAgIHNlbGY7XG5cbiAgc2VsZiA9IGZ1bmN0aW9uKHN0ciwgc2VwYXJhdG9yLCBsaW1pdCkge1xuICAgIC8vIElmIGBzZXBhcmF0b3JgIGlzIG5vdCBhIHJlZ2V4LCB1c2UgYG5hdGl2ZVNwbGl0YFxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc2VwYXJhdG9yKSAhPT0gXCJbb2JqZWN0IFJlZ0V4cF1cIikge1xuICAgICAgcmV0dXJuIG5hdGl2ZVNwbGl0LmNhbGwoc3RyLCBzZXBhcmF0b3IsIGxpbWl0KTtcbiAgICB9XG4gICAgdmFyIG91dHB1dCA9IFtdLFxuICAgICAgZmxhZ3MgPSAoc2VwYXJhdG9yLmlnbm9yZUNhc2UgPyBcImlcIiA6IFwiXCIpICsgKHNlcGFyYXRvci5tdWx0aWxpbmUgPyBcIm1cIiA6IFwiXCIpICsgKHNlcGFyYXRvci5leHRlbmRlZCA/IFwieFwiIDogXCJcIikgKyAvLyBQcm9wb3NlZCBmb3IgRVM2XG4gICAgICAoc2VwYXJhdG9yLnN0aWNreSA/IFwieVwiIDogXCJcIiksXG4gICAgICAvLyBGaXJlZm94IDMrXG4gICAgICBsYXN0TGFzdEluZGV4ID0gMCxcbiAgICAgIC8vIE1ha2UgYGdsb2JhbGAgYW5kIGF2b2lkIGBsYXN0SW5kZXhgIGlzc3VlcyBieSB3b3JraW5nIHdpdGggYSBjb3B5XG4gICAgICBzZXBhcmF0b3IgPSBuZXcgUmVnRXhwKHNlcGFyYXRvci5zb3VyY2UsIGZsYWdzICsgXCJnXCIpLFxuICAgICAgc2VwYXJhdG9yMiwgbWF0Y2gsIGxhc3RJbmRleCwgbGFzdExlbmd0aDtcbiAgICBzdHIgKz0gXCJcIjsgLy8gVHlwZS1jb252ZXJ0XG4gICAgaWYgKCFjb21wbGlhbnRFeGVjTnBjZykge1xuICAgICAgLy8gRG9lc24ndCBuZWVkIGZsYWdzIGd5LCBidXQgdGhleSBkb24ndCBodXJ0XG4gICAgICBzZXBhcmF0b3IyID0gbmV3IFJlZ0V4cChcIl5cIiArIHNlcGFyYXRvci5zb3VyY2UgKyBcIiQoPyFcXFxccylcIiwgZmxhZ3MpO1xuICAgIH1cbiAgICAvKiBWYWx1ZXMgZm9yIGBsaW1pdGAsIHBlciB0aGUgc3BlYzpcbiAgICAgKiBJZiB1bmRlZmluZWQ6IDQyOTQ5NjcyOTUgLy8gTWF0aC5wb3coMiwgMzIpIC0gMVxuICAgICAqIElmIDAsIEluZmluaXR5LCBvciBOYU46IDBcbiAgICAgKiBJZiBwb3NpdGl2ZSBudW1iZXI6IGxpbWl0ID0gTWF0aC5mbG9vcihsaW1pdCk7IGlmIChsaW1pdCA+IDQyOTQ5NjcyOTUpIGxpbWl0IC09IDQyOTQ5NjcyOTY7XG4gICAgICogSWYgbmVnYXRpdmUgbnVtYmVyOiA0Mjk0OTY3Mjk2IC0gTWF0aC5mbG9vcihNYXRoLmFicyhsaW1pdCkpXG4gICAgICogSWYgb3RoZXI6IFR5cGUtY29udmVydCwgdGhlbiB1c2UgdGhlIGFib3ZlIHJ1bGVzXG4gICAgICovXG4gICAgbGltaXQgPSBsaW1pdCA9PT0gdW5kZWYgPyAtMSA+Pj4gMCA6IC8vIE1hdGgucG93KDIsIDMyKSAtIDFcbiAgICBsaW1pdCA+Pj4gMDsgLy8gVG9VaW50MzIobGltaXQpXG4gICAgd2hpbGUgKG1hdGNoID0gc2VwYXJhdG9yLmV4ZWMoc3RyKSkge1xuICAgICAgLy8gYHNlcGFyYXRvci5sYXN0SW5kZXhgIGlzIG5vdCByZWxpYWJsZSBjcm9zcy1icm93c2VyXG4gICAgICBsYXN0SW5kZXggPSBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aDtcbiAgICAgIGlmIChsYXN0SW5kZXggPiBsYXN0TGFzdEluZGV4KSB7XG4gICAgICAgIG91dHB1dC5wdXNoKHN0ci5zbGljZShsYXN0TGFzdEluZGV4LCBtYXRjaC5pbmRleCkpO1xuICAgICAgICAvLyBGaXggYnJvd3NlcnMgd2hvc2UgYGV4ZWNgIG1ldGhvZHMgZG9uJ3QgY29uc2lzdGVudGx5IHJldHVybiBgdW5kZWZpbmVkYCBmb3JcbiAgICAgICAgLy8gbm9ucGFydGljaXBhdGluZyBjYXB0dXJpbmcgZ3JvdXBzXG4gICAgICAgIGlmICghY29tcGxpYW50RXhlY05wY2cgJiYgbWF0Y2gubGVuZ3RoID4gMSkge1xuICAgICAgICAgIG1hdGNoWzBdLnJlcGxhY2Uoc2VwYXJhdG9yMiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGggLSAyOyBpKyspIHtcbiAgICAgICAgICAgICAgaWYgKGFyZ3VtZW50c1tpXSA9PT0gdW5kZWYpIHtcbiAgICAgICAgICAgICAgICBtYXRjaFtpXSA9IHVuZGVmO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1hdGNoLmxlbmd0aCA+IDEgJiYgbWF0Y2guaW5kZXggPCBzdHIubGVuZ3RoKSB7XG4gICAgICAgICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkob3V0cHV0LCBtYXRjaC5zbGljZSgxKSk7XG4gICAgICAgIH1cbiAgICAgICAgbGFzdExlbmd0aCA9IG1hdGNoWzBdLmxlbmd0aDtcbiAgICAgICAgbGFzdExhc3RJbmRleCA9IGxhc3RJbmRleDtcbiAgICAgICAgaWYgKG91dHB1dC5sZW5ndGggPj0gbGltaXQpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHNlcGFyYXRvci5sYXN0SW5kZXggPT09IG1hdGNoLmluZGV4KSB7XG4gICAgICAgIHNlcGFyYXRvci5sYXN0SW5kZXgrKzsgLy8gQXZvaWQgYW4gaW5maW5pdGUgbG9vcFxuICAgICAgfVxuICAgIH1cbiAgICBpZiAobGFzdExhc3RJbmRleCA9PT0gc3RyLmxlbmd0aCkge1xuICAgICAgaWYgKGxhc3RMZW5ndGggfHwgIXNlcGFyYXRvci50ZXN0KFwiXCIpKSB7XG4gICAgICAgIG91dHB1dC5wdXNoKFwiXCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaChzdHIuc2xpY2UobGFzdExhc3RJbmRleCkpO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0Lmxlbmd0aCA+IGxpbWl0ID8gb3V0cHV0LnNsaWNlKDAsIGxpbWl0KSA6IG91dHB1dDtcbiAgfTtcblxuICByZXR1cm4gc2VsZjtcbn0pKCk7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qZ2xvYmFsIHdpbmRvdywgZ2xvYmFsKi9cblxudmFyIHJvb3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/XG4gICAgd2luZG93IDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgP1xuICAgIGdsb2JhbCA6IHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEluZGl2aWR1YWw7XG5cbmZ1bmN0aW9uIEluZGl2aWR1YWwoa2V5LCB2YWx1ZSkge1xuICAgIGlmIChrZXkgaW4gcm9vdCkge1xuICAgICAgICByZXR1cm4gcm9vdFtrZXldO1xuICAgIH1cblxuICAgIHJvb3Rba2V5XSA9IHZhbHVlO1xuXG4gICAgcmV0dXJuIHZhbHVlO1xufVxuIiwidmFyIHRvcExldmVsID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOlxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDoge31cbnZhciBtaW5Eb2MgPSByZXF1aXJlKCdtaW4tZG9jdW1lbnQnKTtcblxuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGRvY3VtZW50O1xufSBlbHNlIHtcbiAgICB2YXIgZG9jY3kgPSB0b3BMZXZlbFsnX19HTE9CQUxfRE9DVU1FTlRfQ0FDSEVANCddO1xuXG4gICAgaWYgKCFkb2NjeSkge1xuICAgICAgICBkb2NjeSA9IHRvcExldmVsWydfX0dMT0JBTF9ET0NVTUVOVF9DQUNIRUA0J10gPSBtaW5Eb2M7XG4gICAgfVxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBkb2NjeTtcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzT2JqZWN0KHgpIHtcblx0cmV0dXJuIHR5cGVvZiB4ID09PSBcIm9iamVjdFwiICYmIHggIT09IG51bGw7XG59O1xuIiwidmFyIG5hdGl2ZUlzQXJyYXkgPSBBcnJheS5pc0FycmF5XG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nXG5cbm1vZHVsZS5leHBvcnRzID0gbmF0aXZlSXNBcnJheSB8fCBpc0FycmF5XG5cbmZ1bmN0aW9uIGlzQXJyYXkob2JqKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiXG59XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKFwiaXMtb2JqZWN0XCIpXG52YXIgaXNIb29rID0gcmVxdWlyZShcIi4uL3Zub2RlL2lzLXZob29rLmpzXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gYXBwbHlQcm9wZXJ0aWVzXG5cbmZ1bmN0aW9uIGFwcGx5UHJvcGVydGllcyhub2RlLCBwcm9wcywgcHJldmlvdXMpIHtcbiAgICBmb3IgKHZhciBwcm9wTmFtZSBpbiBwcm9wcykge1xuICAgICAgICB2YXIgcHJvcFZhbHVlID0gcHJvcHNbcHJvcE5hbWVdXG5cbiAgICAgICAgaWYgKHByb3BWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZW1vdmVQcm9wZXJ0eShub2RlLCBwcm9wTmFtZSwgcHJvcFZhbHVlLCBwcmV2aW91cyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNIb29rKHByb3BWYWx1ZSkpIHtcbiAgICAgICAgICAgIHJlbW92ZVByb3BlcnR5KG5vZGUsIHByb3BOYW1lLCBwcm9wVmFsdWUsIHByZXZpb3VzKVxuICAgICAgICAgICAgaWYgKHByb3BWYWx1ZS5ob29rKSB7XG4gICAgICAgICAgICAgICAgcHJvcFZhbHVlLmhvb2sobm9kZSxcbiAgICAgICAgICAgICAgICAgICAgcHJvcE5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHByZXZpb3VzID8gcHJldmlvdXNbcHJvcE5hbWVdIDogdW5kZWZpbmVkKVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGlzT2JqZWN0KHByb3BWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBwYXRjaE9iamVjdChub2RlLCBwcm9wcywgcHJldmlvdXMsIHByb3BOYW1lLCBwcm9wVmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBub2RlW3Byb3BOYW1lXSA9IHByb3BWYWx1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVQcm9wZXJ0eShub2RlLCBwcm9wTmFtZSwgcHJvcFZhbHVlLCBwcmV2aW91cykge1xuICAgIGlmIChwcmV2aW91cykge1xuICAgICAgICB2YXIgcHJldmlvdXNWYWx1ZSA9IHByZXZpb3VzW3Byb3BOYW1lXVxuXG4gICAgICAgIGlmICghaXNIb29rKHByZXZpb3VzVmFsdWUpKSB7XG4gICAgICAgICAgICBpZiAocHJvcE5hbWUgPT09IFwiYXR0cmlidXRlc1wiKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgYXR0ck5hbWUgaW4gcHJldmlvdXNWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShhdHRyTmFtZSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHByb3BOYW1lID09PSBcInN0eWxlXCIpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIHByZXZpb3VzVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5zdHlsZVtpXSA9IFwiXCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBwcmV2aW91c1ZhbHVlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgbm9kZVtwcm9wTmFtZV0gPSBcIlwiXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5vZGVbcHJvcE5hbWVdID0gbnVsbFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHByZXZpb3VzVmFsdWUudW5ob29rKSB7XG4gICAgICAgICAgICBwcmV2aW91c1ZhbHVlLnVuaG9vayhub2RlLCBwcm9wTmFtZSwgcHJvcFZhbHVlKVxuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBwYXRjaE9iamVjdChub2RlLCBwcm9wcywgcHJldmlvdXMsIHByb3BOYW1lLCBwcm9wVmFsdWUpIHtcbiAgICB2YXIgcHJldmlvdXNWYWx1ZSA9IHByZXZpb3VzID8gcHJldmlvdXNbcHJvcE5hbWVdIDogdW5kZWZpbmVkXG5cbiAgICAvLyBTZXQgYXR0cmlidXRlc1xuICAgIGlmIChwcm9wTmFtZSA9PT0gXCJhdHRyaWJ1dGVzXCIpIHtcbiAgICAgICAgZm9yICh2YXIgYXR0ck5hbWUgaW4gcHJvcFZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgYXR0clZhbHVlID0gcHJvcFZhbHVlW2F0dHJOYW1lXVxuXG4gICAgICAgICAgICBpZiAoYXR0clZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShhdHRyTmFtZSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIGF0dHJWYWx1ZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmKHByZXZpb3VzVmFsdWUgJiYgaXNPYmplY3QocHJldmlvdXNWYWx1ZSkgJiZcbiAgICAgICAgZ2V0UHJvdG90eXBlKHByZXZpb3VzVmFsdWUpICE9PSBnZXRQcm90b3R5cGUocHJvcFZhbHVlKSkge1xuICAgICAgICBub2RlW3Byb3BOYW1lXSA9IHByb3BWYWx1ZVxuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoIWlzT2JqZWN0KG5vZGVbcHJvcE5hbWVdKSkge1xuICAgICAgICBub2RlW3Byb3BOYW1lXSA9IHt9XG4gICAgfVxuXG4gICAgdmFyIHJlcGxhY2VyID0gcHJvcE5hbWUgPT09IFwic3R5bGVcIiA/IFwiXCIgOiB1bmRlZmluZWRcblxuICAgIGZvciAodmFyIGsgaW4gcHJvcFZhbHVlKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHByb3BWYWx1ZVtrXVxuICAgICAgICBub2RlW3Byb3BOYW1lXVtrXSA9ICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSA/IHJlcGxhY2VyIDogdmFsdWVcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGdldFByb3RvdHlwZSh2YWx1ZSkge1xuICAgIGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWx1ZSlcbiAgICB9IGVsc2UgaWYgKHZhbHVlLl9fcHJvdG9fXykge1xuICAgICAgICByZXR1cm4gdmFsdWUuX19wcm90b19fXG4gICAgfSBlbHNlIGlmICh2YWx1ZS5jb25zdHJ1Y3Rvcikge1xuICAgICAgICByZXR1cm4gdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlXG4gICAgfVxufVxuIiwidmFyIGRvY3VtZW50ID0gcmVxdWlyZShcImdsb2JhbC9kb2N1bWVudFwiKVxuXG52YXIgYXBwbHlQcm9wZXJ0aWVzID0gcmVxdWlyZShcIi4vYXBwbHktcHJvcGVydGllc1wiKVxuXG52YXIgaXNWTm9kZSA9IHJlcXVpcmUoXCIuLi92bm9kZS9pcy12bm9kZS5qc1wiKVxudmFyIGlzVlRleHQgPSByZXF1aXJlKFwiLi4vdm5vZGUvaXMtdnRleHQuanNcIilcbnZhciBpc1dpZGdldCA9IHJlcXVpcmUoXCIuLi92bm9kZS9pcy13aWRnZXQuanNcIilcbnZhciBoYW5kbGVUaHVuayA9IHJlcXVpcmUoXCIuLi92bm9kZS9oYW5kbGUtdGh1bmsuanNcIilcblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVFbGVtZW50XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQodm5vZGUsIG9wdHMpIHtcbiAgICB2YXIgZG9jID0gb3B0cyA/IG9wdHMuZG9jdW1lbnQgfHwgZG9jdW1lbnQgOiBkb2N1bWVudFxuICAgIHZhciB3YXJuID0gb3B0cyA/IG9wdHMud2FybiA6IG51bGxcblxuICAgIHZub2RlID0gaGFuZGxlVGh1bmsodm5vZGUpLmFcblxuICAgIGlmIChpc1dpZGdldCh2bm9kZSkpIHtcbiAgICAgICAgcmV0dXJuIHZub2RlLmluaXQoKVxuICAgIH0gZWxzZSBpZiAoaXNWVGV4dCh2bm9kZSkpIHtcbiAgICAgICAgcmV0dXJuIGRvYy5jcmVhdGVUZXh0Tm9kZSh2bm9kZS50ZXh0KVxuICAgIH0gZWxzZSBpZiAoIWlzVk5vZGUodm5vZGUpKSB7XG4gICAgICAgIGlmICh3YXJuKSB7XG4gICAgICAgICAgICB3YXJuKFwiSXRlbSBpcyBub3QgYSB2YWxpZCB2aXJ0dWFsIGRvbSBub2RlXCIsIHZub2RlKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgdmFyIG5vZGUgPSAodm5vZGUubmFtZXNwYWNlID09PSBudWxsKSA/XG4gICAgICAgIGRvYy5jcmVhdGVFbGVtZW50KHZub2RlLnRhZ05hbWUpIDpcbiAgICAgICAgZG9jLmNyZWF0ZUVsZW1lbnROUyh2bm9kZS5uYW1lc3BhY2UsIHZub2RlLnRhZ05hbWUpXG5cbiAgICB2YXIgcHJvcHMgPSB2bm9kZS5wcm9wZXJ0aWVzXG4gICAgYXBwbHlQcm9wZXJ0aWVzKG5vZGUsIHByb3BzKVxuXG4gICAgdmFyIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW5cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNoaWxkTm9kZSA9IGNyZWF0ZUVsZW1lbnQoY2hpbGRyZW5baV0sIG9wdHMpXG4gICAgICAgIGlmIChjaGlsZE5vZGUpIHtcbiAgICAgICAgICAgIG5vZGUuYXBwZW5kQ2hpbGQoY2hpbGROb2RlKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vZGVcbn1cbiIsIi8vIE1hcHMgYSB2aXJ0dWFsIERPTSB0cmVlIG9udG8gYSByZWFsIERPTSB0cmVlIGluIGFuIGVmZmljaWVudCBtYW5uZXIuXG4vLyBXZSBkb24ndCB3YW50IHRvIHJlYWQgYWxsIG9mIHRoZSBET00gbm9kZXMgaW4gdGhlIHRyZWUgc28gd2UgdXNlXG4vLyB0aGUgaW4tb3JkZXIgdHJlZSBpbmRleGluZyB0byBlbGltaW5hdGUgcmVjdXJzaW9uIGRvd24gY2VydGFpbiBicmFuY2hlcy5cbi8vIFdlIG9ubHkgcmVjdXJzZSBpbnRvIGEgRE9NIG5vZGUgaWYgd2Uga25vdyB0aGF0IGl0IGNvbnRhaW5zIGEgY2hpbGQgb2Zcbi8vIGludGVyZXN0LlxuXG52YXIgbm9DaGlsZCA9IHt9XG5cbm1vZHVsZS5leHBvcnRzID0gZG9tSW5kZXhcblxuZnVuY3Rpb24gZG9tSW5kZXgocm9vdE5vZGUsIHRyZWUsIGluZGljZXMsIG5vZGVzKSB7XG4gICAgaWYgKCFpbmRpY2VzIHx8IGluZGljZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB7fVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGluZGljZXMuc29ydChhc2NlbmRpbmcpXG4gICAgICAgIHJldHVybiByZWN1cnNlKHJvb3ROb2RlLCB0cmVlLCBpbmRpY2VzLCBub2RlcywgMClcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlY3Vyc2Uocm9vdE5vZGUsIHRyZWUsIGluZGljZXMsIG5vZGVzLCByb290SW5kZXgpIHtcbiAgICBub2RlcyA9IG5vZGVzIHx8IHt9XG5cblxuICAgIGlmIChyb290Tm9kZSkge1xuICAgICAgICBpZiAoaW5kZXhJblJhbmdlKGluZGljZXMsIHJvb3RJbmRleCwgcm9vdEluZGV4KSkge1xuICAgICAgICAgICAgbm9kZXNbcm9vdEluZGV4XSA9IHJvb3ROb2RlXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdkNoaWxkcmVuID0gdHJlZS5jaGlsZHJlblxuXG4gICAgICAgIGlmICh2Q2hpbGRyZW4pIHtcblxuICAgICAgICAgICAgdmFyIGNoaWxkTm9kZXMgPSByb290Tm9kZS5jaGlsZE5vZGVzXG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHJlZS5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHJvb3RJbmRleCArPSAxXG5cbiAgICAgICAgICAgICAgICB2YXIgdkNoaWxkID0gdkNoaWxkcmVuW2ldIHx8IG5vQ2hpbGRcbiAgICAgICAgICAgICAgICB2YXIgbmV4dEluZGV4ID0gcm9vdEluZGV4ICsgKHZDaGlsZC5jb3VudCB8fCAwKVxuXG4gICAgICAgICAgICAgICAgLy8gc2tpcCByZWN1cnNpb24gZG93biB0aGUgdHJlZSBpZiB0aGVyZSBhcmUgbm8gbm9kZXMgZG93biBoZXJlXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4SW5SYW5nZShpbmRpY2VzLCByb290SW5kZXgsIG5leHRJbmRleCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVjdXJzZShjaGlsZE5vZGVzW2ldLCB2Q2hpbGQsIGluZGljZXMsIG5vZGVzLCByb290SW5kZXgpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcm9vdEluZGV4ID0gbmV4dEluZGV4XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbm9kZXNcbn1cblxuLy8gQmluYXJ5IHNlYXJjaCBmb3IgYW4gaW5kZXggaW4gdGhlIGludGVydmFsIFtsZWZ0LCByaWdodF1cbmZ1bmN0aW9uIGluZGV4SW5SYW5nZShpbmRpY2VzLCBsZWZ0LCByaWdodCkge1xuICAgIGlmIChpbmRpY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICB2YXIgbWluSW5kZXggPSAwXG4gICAgdmFyIG1heEluZGV4ID0gaW5kaWNlcy5sZW5ndGggLSAxXG4gICAgdmFyIGN1cnJlbnRJbmRleFxuICAgIHZhciBjdXJyZW50SXRlbVxuXG4gICAgd2hpbGUgKG1pbkluZGV4IDw9IG1heEluZGV4KSB7XG4gICAgICAgIGN1cnJlbnRJbmRleCA9ICgobWF4SW5kZXggKyBtaW5JbmRleCkgLyAyKSA+PiAwXG4gICAgICAgIGN1cnJlbnRJdGVtID0gaW5kaWNlc1tjdXJyZW50SW5kZXhdXG5cbiAgICAgICAgaWYgKG1pbkluZGV4ID09PSBtYXhJbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRJdGVtID49IGxlZnQgJiYgY3VycmVudEl0ZW0gPD0gcmlnaHRcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50SXRlbSA8IGxlZnQpIHtcbiAgICAgICAgICAgIG1pbkluZGV4ID0gY3VycmVudEluZGV4ICsgMVxuICAgICAgICB9IGVsc2UgIGlmIChjdXJyZW50SXRlbSA+IHJpZ2h0KSB7XG4gICAgICAgICAgICBtYXhJbmRleCA9IGN1cnJlbnRJbmRleCAtIDFcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGFzY2VuZGluZyhhLCBiKSB7XG4gICAgcmV0dXJuIGEgPiBiID8gMSA6IC0xXG59XG4iLCJ2YXIgYXBwbHlQcm9wZXJ0aWVzID0gcmVxdWlyZShcIi4vYXBwbHktcHJvcGVydGllc1wiKVxuXG52YXIgaXNXaWRnZXQgPSByZXF1aXJlKFwiLi4vdm5vZGUvaXMtd2lkZ2V0LmpzXCIpXG52YXIgVlBhdGNoID0gcmVxdWlyZShcIi4uL3Zub2RlL3ZwYXRjaC5qc1wiKVxuXG52YXIgcmVuZGVyID0gcmVxdWlyZShcIi4vY3JlYXRlLWVsZW1lbnRcIilcbnZhciB1cGRhdGVXaWRnZXQgPSByZXF1aXJlKFwiLi91cGRhdGUtd2lkZ2V0XCIpXG5cbm1vZHVsZS5leHBvcnRzID0gYXBwbHlQYXRjaFxuXG5mdW5jdGlvbiBhcHBseVBhdGNoKHZwYXRjaCwgZG9tTm9kZSwgcmVuZGVyT3B0aW9ucykge1xuICAgIHZhciB0eXBlID0gdnBhdGNoLnR5cGVcbiAgICB2YXIgdk5vZGUgPSB2cGF0Y2gudk5vZGVcbiAgICB2YXIgcGF0Y2ggPSB2cGF0Y2gucGF0Y2hcblxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIFZQYXRjaC5SRU1PVkU6XG4gICAgICAgICAgICByZXR1cm4gcmVtb3ZlTm9kZShkb21Ob2RlLCB2Tm9kZSlcbiAgICAgICAgY2FzZSBWUGF0Y2guSU5TRVJUOlxuICAgICAgICAgICAgcmV0dXJuIGluc2VydE5vZGUoZG9tTm9kZSwgcGF0Y2gsIHJlbmRlck9wdGlvbnMpXG4gICAgICAgIGNhc2UgVlBhdGNoLlZURVhUOlxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ1BhdGNoKGRvbU5vZGUsIHZOb2RlLCBwYXRjaCwgcmVuZGVyT3B0aW9ucylcbiAgICAgICAgY2FzZSBWUGF0Y2guV0lER0VUOlxuICAgICAgICAgICAgcmV0dXJuIHdpZGdldFBhdGNoKGRvbU5vZGUsIHZOb2RlLCBwYXRjaCwgcmVuZGVyT3B0aW9ucylcbiAgICAgICAgY2FzZSBWUGF0Y2guVk5PREU6XG4gICAgICAgICAgICByZXR1cm4gdk5vZGVQYXRjaChkb21Ob2RlLCB2Tm9kZSwgcGF0Y2gsIHJlbmRlck9wdGlvbnMpXG4gICAgICAgIGNhc2UgVlBhdGNoLk9SREVSOlxuICAgICAgICAgICAgcmVvcmRlckNoaWxkcmVuKGRvbU5vZGUsIHBhdGNoKVxuICAgICAgICAgICAgcmV0dXJuIGRvbU5vZGVcbiAgICAgICAgY2FzZSBWUGF0Y2guUFJPUFM6XG4gICAgICAgICAgICBhcHBseVByb3BlcnRpZXMoZG9tTm9kZSwgcGF0Y2gsIHZOb2RlLnByb3BlcnRpZXMpXG4gICAgICAgICAgICByZXR1cm4gZG9tTm9kZVxuICAgICAgICBjYXNlIFZQYXRjaC5USFVOSzpcbiAgICAgICAgICAgIHJldHVybiByZXBsYWNlUm9vdChkb21Ob2RlLFxuICAgICAgICAgICAgICAgIHJlbmRlck9wdGlvbnMucGF0Y2goZG9tTm9kZSwgcGF0Y2gsIHJlbmRlck9wdGlvbnMpKVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGRvbU5vZGVcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZU5vZGUoZG9tTm9kZSwgdk5vZGUpIHtcbiAgICB2YXIgcGFyZW50Tm9kZSA9IGRvbU5vZGUucGFyZW50Tm9kZVxuXG4gICAgaWYgKHBhcmVudE5vZGUpIHtcbiAgICAgICAgcGFyZW50Tm9kZS5yZW1vdmVDaGlsZChkb21Ob2RlKVxuICAgIH1cblxuICAgIGRlc3Ryb3lXaWRnZXQoZG9tTm9kZSwgdk5vZGUpO1xuXG4gICAgcmV0dXJuIG51bGxcbn1cblxuZnVuY3Rpb24gaW5zZXJ0Tm9kZShwYXJlbnROb2RlLCB2Tm9kZSwgcmVuZGVyT3B0aW9ucykge1xuICAgIHZhciBuZXdOb2RlID0gcmVuZGVyKHZOb2RlLCByZW5kZXJPcHRpb25zKVxuXG4gICAgaWYgKHBhcmVudE5vZGUpIHtcbiAgICAgICAgcGFyZW50Tm9kZS5hcHBlbmRDaGlsZChuZXdOb2RlKVxuICAgIH1cblxuICAgIHJldHVybiBwYXJlbnROb2RlXG59XG5cbmZ1bmN0aW9uIHN0cmluZ1BhdGNoKGRvbU5vZGUsIGxlZnRWTm9kZSwgdlRleHQsIHJlbmRlck9wdGlvbnMpIHtcbiAgICB2YXIgbmV3Tm9kZVxuXG4gICAgaWYgKGRvbU5vZGUubm9kZVR5cGUgPT09IDMpIHtcbiAgICAgICAgZG9tTm9kZS5yZXBsYWNlRGF0YSgwLCBkb21Ob2RlLmxlbmd0aCwgdlRleHQudGV4dClcbiAgICAgICAgbmV3Tm9kZSA9IGRvbU5vZGVcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcGFyZW50Tm9kZSA9IGRvbU5vZGUucGFyZW50Tm9kZVxuICAgICAgICBuZXdOb2RlID0gcmVuZGVyKHZUZXh0LCByZW5kZXJPcHRpb25zKVxuXG4gICAgICAgIGlmIChwYXJlbnROb2RlKSB7XG4gICAgICAgICAgICBwYXJlbnROb2RlLnJlcGxhY2VDaGlsZChuZXdOb2RlLCBkb21Ob2RlKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ld05vZGVcbn1cblxuZnVuY3Rpb24gd2lkZ2V0UGF0Y2goZG9tTm9kZSwgbGVmdFZOb2RlLCB3aWRnZXQsIHJlbmRlck9wdGlvbnMpIHtcbiAgICB2YXIgdXBkYXRpbmcgPSB1cGRhdGVXaWRnZXQobGVmdFZOb2RlLCB3aWRnZXQpXG4gICAgdmFyIG5ld05vZGVcblxuICAgIGlmICh1cGRhdGluZykge1xuICAgICAgICBuZXdOb2RlID0gd2lkZ2V0LnVwZGF0ZShsZWZ0Vk5vZGUsIGRvbU5vZGUpIHx8IGRvbU5vZGVcbiAgICB9IGVsc2Uge1xuICAgICAgICBuZXdOb2RlID0gcmVuZGVyKHdpZGdldCwgcmVuZGVyT3B0aW9ucylcbiAgICB9XG5cbiAgICB2YXIgcGFyZW50Tm9kZSA9IGRvbU5vZGUucGFyZW50Tm9kZVxuXG4gICAgaWYgKHBhcmVudE5vZGUgJiYgbmV3Tm9kZSAhPT0gZG9tTm9kZSkge1xuICAgICAgICBwYXJlbnROb2RlLnJlcGxhY2VDaGlsZChuZXdOb2RlLCBkb21Ob2RlKVxuICAgIH1cblxuICAgIGlmICghdXBkYXRpbmcpIHtcbiAgICAgICAgZGVzdHJveVdpZGdldChkb21Ob2RlLCBsZWZ0Vk5vZGUpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ld05vZGVcbn1cblxuZnVuY3Rpb24gdk5vZGVQYXRjaChkb21Ob2RlLCBsZWZ0Vk5vZGUsIHZOb2RlLCByZW5kZXJPcHRpb25zKSB7XG4gICAgdmFyIHBhcmVudE5vZGUgPSBkb21Ob2RlLnBhcmVudE5vZGVcbiAgICB2YXIgbmV3Tm9kZSA9IHJlbmRlcih2Tm9kZSwgcmVuZGVyT3B0aW9ucylcblxuICAgIGlmIChwYXJlbnROb2RlKSB7XG4gICAgICAgIHBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG5ld05vZGUsIGRvbU5vZGUpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ld05vZGVcbn1cblxuZnVuY3Rpb24gZGVzdHJveVdpZGdldChkb21Ob2RlLCB3KSB7XG4gICAgaWYgKHR5cGVvZiB3LmRlc3Ryb3kgPT09IFwiZnVuY3Rpb25cIiAmJiBpc1dpZGdldCh3KSkge1xuICAgICAgICB3LmRlc3Ryb3koZG9tTm9kZSlcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlb3JkZXJDaGlsZHJlbihkb21Ob2RlLCBiSW5kZXgpIHtcbiAgICB2YXIgY2hpbGRyZW4gPSBbXVxuICAgIHZhciBjaGlsZE5vZGVzID0gZG9tTm9kZS5jaGlsZE5vZGVzXG4gICAgdmFyIGxlbiA9IGNoaWxkTm9kZXMubGVuZ3RoXG4gICAgdmFyIGlcbiAgICB2YXIgcmV2ZXJzZUluZGV4ID0gYkluZGV4LnJldmVyc2VcblxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBjaGlsZHJlbi5wdXNoKGRvbU5vZGUuY2hpbGROb2Rlc1tpXSlcbiAgICB9XG5cbiAgICB2YXIgaW5zZXJ0T2Zmc2V0ID0gMFxuICAgIHZhciBtb3ZlXG4gICAgdmFyIG5vZGVcbiAgICB2YXIgaW5zZXJ0Tm9kZVxuICAgIHZhciBjaGFpbkxlbmd0aFxuICAgIHZhciBpbnNlcnRlZExlbmd0aFxuICAgIHZhciBuZXh0U2libGluZ1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47KSB7XG4gICAgICAgIG1vdmUgPSBiSW5kZXhbaV1cbiAgICAgICAgY2hhaW5MZW5ndGggPSAxXG4gICAgICAgIGlmIChtb3ZlICE9PSB1bmRlZmluZWQgJiYgbW92ZSAhPT0gaSkge1xuICAgICAgICAgICAgLy8gdHJ5IHRvIGJyaW5nIGZvcndhcmQgYXMgbG9uZyBvZiBhIGNoYWluIGFzIHBvc3NpYmxlXG4gICAgICAgICAgICB3aGlsZSAoYkluZGV4W2kgKyBjaGFpbkxlbmd0aF0gPT09IG1vdmUgKyBjaGFpbkxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNoYWluTGVuZ3RoKys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHRoZSBlbGVtZW50IGN1cnJlbnRseSBhdCB0aGlzIGluZGV4IHdpbGwgYmUgbW92ZWQgbGF0ZXIgc28gaW5jcmVhc2UgdGhlIGluc2VydCBvZmZzZXRcbiAgICAgICAgICAgIGlmIChyZXZlcnNlSW5kZXhbaV0gPiBpICsgY2hhaW5MZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpbnNlcnRPZmZzZXQrK1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBub2RlID0gY2hpbGRyZW5bbW92ZV1cbiAgICAgICAgICAgIGluc2VydE5vZGUgPSBjaGlsZE5vZGVzW2kgKyBpbnNlcnRPZmZzZXRdIHx8IG51bGxcbiAgICAgICAgICAgIGluc2VydGVkTGVuZ3RoID0gMFxuICAgICAgICAgICAgd2hpbGUgKG5vZGUgIT09IGluc2VydE5vZGUgJiYgaW5zZXJ0ZWRMZW5ndGgrKyA8IGNoYWluTGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZG9tTm9kZS5pbnNlcnRCZWZvcmUobm9kZSwgaW5zZXJ0Tm9kZSk7XG4gICAgICAgICAgICAgICAgbm9kZSA9IGNoaWxkcmVuW21vdmUgKyBpbnNlcnRlZExlbmd0aF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHRoZSBtb3ZlZCBlbGVtZW50IGNhbWUgZnJvbSB0aGUgZnJvbnQgb2YgdGhlIGFycmF5IHNvIHJlZHVjZSB0aGUgaW5zZXJ0IG9mZnNldFxuICAgICAgICAgICAgaWYgKG1vdmUgKyBjaGFpbkxlbmd0aCA8IGkpIHtcbiAgICAgICAgICAgICAgICBpbnNlcnRPZmZzZXQtLVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZWxlbWVudCBhdCB0aGlzIGluZGV4IGlzIHNjaGVkdWxlZCB0byBiZSByZW1vdmVkIHNvIGluY3JlYXNlIGluc2VydCBvZmZzZXRcbiAgICAgICAgaWYgKGkgaW4gYkluZGV4LnJlbW92ZXMpIHtcbiAgICAgICAgICAgIGluc2VydE9mZnNldCsrXG4gICAgICAgIH1cblxuICAgICAgICBpICs9IGNoYWluTGVuZ3RoXG4gICAgfVxufVxuXG5mdW5jdGlvbiByZXBsYWNlUm9vdChvbGRSb290LCBuZXdSb290KSB7XG4gICAgaWYgKG9sZFJvb3QgJiYgbmV3Um9vdCAmJiBvbGRSb290ICE9PSBuZXdSb290ICYmIG9sZFJvb3QucGFyZW50Tm9kZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhvbGRSb290KVxuICAgICAgICBvbGRSb290LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG5ld1Jvb3QsIG9sZFJvb3QpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ld1Jvb3Q7XG59XG4iLCJ2YXIgZG9jdW1lbnQgPSByZXF1aXJlKFwiZ2xvYmFsL2RvY3VtZW50XCIpXG52YXIgaXNBcnJheSA9IHJlcXVpcmUoXCJ4LWlzLWFycmF5XCIpXG5cbnZhciBkb21JbmRleCA9IHJlcXVpcmUoXCIuL2RvbS1pbmRleFwiKVxudmFyIHBhdGNoT3AgPSByZXF1aXJlKFwiLi9wYXRjaC1vcFwiKVxubW9kdWxlLmV4cG9ydHMgPSBwYXRjaFxuXG5mdW5jdGlvbiBwYXRjaChyb290Tm9kZSwgcGF0Y2hlcykge1xuICAgIHJldHVybiBwYXRjaFJlY3Vyc2l2ZShyb290Tm9kZSwgcGF0Y2hlcylcbn1cblxuZnVuY3Rpb24gcGF0Y2hSZWN1cnNpdmUocm9vdE5vZGUsIHBhdGNoZXMsIHJlbmRlck9wdGlvbnMpIHtcbiAgICB2YXIgaW5kaWNlcyA9IHBhdGNoSW5kaWNlcyhwYXRjaGVzKVxuXG4gICAgaWYgKGluZGljZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiByb290Tm9kZVxuICAgIH1cblxuICAgIHZhciBpbmRleCA9IGRvbUluZGV4KHJvb3ROb2RlLCBwYXRjaGVzLmEsIGluZGljZXMpXG4gICAgdmFyIG93bmVyRG9jdW1lbnQgPSByb290Tm9kZS5vd25lckRvY3VtZW50XG5cbiAgICBpZiAoIXJlbmRlck9wdGlvbnMpIHtcbiAgICAgICAgcmVuZGVyT3B0aW9ucyA9IHsgcGF0Y2g6IHBhdGNoUmVjdXJzaXZlIH1cbiAgICAgICAgaWYgKG93bmVyRG9jdW1lbnQgIT09IGRvY3VtZW50KSB7XG4gICAgICAgICAgICByZW5kZXJPcHRpb25zLmRvY3VtZW50ID0gb3duZXJEb2N1bWVudFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmRpY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBub2RlSW5kZXggPSBpbmRpY2VzW2ldXG4gICAgICAgIHJvb3ROb2RlID0gYXBwbHlQYXRjaChyb290Tm9kZSxcbiAgICAgICAgICAgIGluZGV4W25vZGVJbmRleF0sXG4gICAgICAgICAgICBwYXRjaGVzW25vZGVJbmRleF0sXG4gICAgICAgICAgICByZW5kZXJPcHRpb25zKVxuICAgIH1cblxuICAgIHJldHVybiByb290Tm9kZVxufVxuXG5mdW5jdGlvbiBhcHBseVBhdGNoKHJvb3ROb2RlLCBkb21Ob2RlLCBwYXRjaExpc3QsIHJlbmRlck9wdGlvbnMpIHtcbiAgICBpZiAoIWRvbU5vZGUpIHtcbiAgICAgICAgcmV0dXJuIHJvb3ROb2RlXG4gICAgfVxuXG4gICAgdmFyIG5ld05vZGVcblxuICAgIGlmIChpc0FycmF5KHBhdGNoTGlzdCkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRjaExpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG5ld05vZGUgPSBwYXRjaE9wKHBhdGNoTGlzdFtpXSwgZG9tTm9kZSwgcmVuZGVyT3B0aW9ucylcblxuICAgICAgICAgICAgaWYgKGRvbU5vZGUgPT09IHJvb3ROb2RlKSB7XG4gICAgICAgICAgICAgICAgcm9vdE5vZGUgPSBuZXdOb2RlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBuZXdOb2RlID0gcGF0Y2hPcChwYXRjaExpc3QsIGRvbU5vZGUsIHJlbmRlck9wdGlvbnMpXG5cbiAgICAgICAgaWYgKGRvbU5vZGUgPT09IHJvb3ROb2RlKSB7XG4gICAgICAgICAgICByb290Tm9kZSA9IG5ld05vZGVcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByb290Tm9kZVxufVxuXG5mdW5jdGlvbiBwYXRjaEluZGljZXMocGF0Y2hlcykge1xuICAgIHZhciBpbmRpY2VzID0gW11cblxuICAgIGZvciAodmFyIGtleSBpbiBwYXRjaGVzKSB7XG4gICAgICAgIGlmIChrZXkgIT09IFwiYVwiKSB7XG4gICAgICAgICAgICBpbmRpY2VzLnB1c2goTnVtYmVyKGtleSkpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaW5kaWNlc1xufVxuIiwidmFyIGlzV2lkZ2V0ID0gcmVxdWlyZShcIi4uL3Zub2RlL2lzLXdpZGdldC5qc1wiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHVwZGF0ZVdpZGdldFxuXG5mdW5jdGlvbiB1cGRhdGVXaWRnZXQoYSwgYikge1xuICAgIGlmIChpc1dpZGdldChhKSAmJiBpc1dpZGdldChiKSkge1xuICAgICAgICBpZiAoXCJuYW1lXCIgaW4gYSAmJiBcIm5hbWVcIiBpbiBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5pZCA9PT0gYi5pZFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGEuaW5pdCA9PT0gYi5pbml0XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2Vcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEV2U3RvcmUgPSByZXF1aXJlKCdldi1zdG9yZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEV2SG9vaztcblxuZnVuY3Rpb24gRXZIb29rKHZhbHVlKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEV2SG9vaykpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFdkhvb2sodmFsdWUpO1xuICAgIH1cblxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbn1cblxuRXZIb29rLnByb3RvdHlwZS5ob29rID0gZnVuY3Rpb24gKG5vZGUsIHByb3BlcnR5TmFtZSkge1xuICAgIHZhciBlcyA9IEV2U3RvcmUobm9kZSk7XG4gICAgdmFyIHByb3BOYW1lID0gcHJvcGVydHlOYW1lLnN1YnN0cigzKTtcblxuICAgIGVzW3Byb3BOYW1lXSA9IHRoaXMudmFsdWU7XG59O1xuXG5Fdkhvb2sucHJvdG90eXBlLnVuaG9vayA9IGZ1bmN0aW9uKG5vZGUsIHByb3BlcnR5TmFtZSkge1xuICAgIHZhciBlcyA9IEV2U3RvcmUobm9kZSk7XG4gICAgdmFyIHByb3BOYW1lID0gcHJvcGVydHlOYW1lLnN1YnN0cigzKTtcblxuICAgIGVzW3Byb3BOYW1lXSA9IHVuZGVmaW5lZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gU29mdFNldEhvb2s7XG5cbmZ1bmN0aW9uIFNvZnRTZXRIb29rKHZhbHVlKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFNvZnRTZXRIb29rKSkge1xuICAgICAgICByZXR1cm4gbmV3IFNvZnRTZXRIb29rKHZhbHVlKTtcbiAgICB9XG5cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5cblNvZnRTZXRIb29rLnByb3RvdHlwZS5ob29rID0gZnVuY3Rpb24gKG5vZGUsIHByb3BlcnR5TmFtZSkge1xuICAgIGlmIChub2RlW3Byb3BlcnR5TmFtZV0gIT09IHRoaXMudmFsdWUpIHtcbiAgICAgICAgbm9kZVtwcm9wZXJ0eU5hbWVdID0gdGhpcy52YWx1ZTtcbiAgICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJ3gtaXMtYXJyYXknKTtcblxudmFyIFZOb2RlID0gcmVxdWlyZSgnLi4vdm5vZGUvdm5vZGUuanMnKTtcbnZhciBWVGV4dCA9IHJlcXVpcmUoJy4uL3Zub2RlL3Z0ZXh0LmpzJyk7XG52YXIgaXNWTm9kZSA9IHJlcXVpcmUoJy4uL3Zub2RlL2lzLXZub2RlJyk7XG52YXIgaXNWVGV4dCA9IHJlcXVpcmUoJy4uL3Zub2RlL2lzLXZ0ZXh0Jyk7XG52YXIgaXNXaWRnZXQgPSByZXF1aXJlKCcuLi92bm9kZS9pcy13aWRnZXQnKTtcbnZhciBpc0hvb2sgPSByZXF1aXJlKCcuLi92bm9kZS9pcy12aG9vaycpO1xudmFyIGlzVlRodW5rID0gcmVxdWlyZSgnLi4vdm5vZGUvaXMtdGh1bmsnKTtcblxudmFyIHBhcnNlVGFnID0gcmVxdWlyZSgnLi9wYXJzZS10YWcuanMnKTtcbnZhciBzb2Z0U2V0SG9vayA9IHJlcXVpcmUoJy4vaG9va3Mvc29mdC1zZXQtaG9vay5qcycpO1xudmFyIGV2SG9vayA9IHJlcXVpcmUoJy4vaG9va3MvZXYtaG9vay5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGg7XG5cbmZ1bmN0aW9uIGgodGFnTmFtZSwgcHJvcGVydGllcywgY2hpbGRyZW4pIHtcbiAgICB2YXIgY2hpbGROb2RlcyA9IFtdO1xuICAgIHZhciB0YWcsIHByb3BzLCBrZXksIG5hbWVzcGFjZTtcblxuICAgIGlmICghY2hpbGRyZW4gJiYgaXNDaGlsZHJlbihwcm9wZXJ0aWVzKSkge1xuICAgICAgICBjaGlsZHJlbiA9IHByb3BlcnRpZXM7XG4gICAgICAgIHByb3BzID0ge307XG4gICAgfVxuXG4gICAgcHJvcHMgPSBwcm9wcyB8fCBwcm9wZXJ0aWVzIHx8IHt9O1xuICAgIHRhZyA9IHBhcnNlVGFnKHRhZ05hbWUsIHByb3BzKTtcblxuICAgIC8vIHN1cHBvcnQga2V5c1xuICAgIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eSgna2V5JykpIHtcbiAgICAgICAga2V5ID0gcHJvcHMua2V5O1xuICAgICAgICBwcm9wcy5rZXkgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLy8gc3VwcG9ydCBuYW1lc3BhY2VcbiAgICBpZiAocHJvcHMuaGFzT3duUHJvcGVydHkoJ25hbWVzcGFjZScpKSB7XG4gICAgICAgIG5hbWVzcGFjZSA9IHByb3BzLm5hbWVzcGFjZTtcbiAgICAgICAgcHJvcHMubmFtZXNwYWNlID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8vIGZpeCBjdXJzb3IgYnVnXG4gICAgaWYgKHRhZyA9PT0gJ0lOUFVUJyAmJlxuICAgICAgICAhbmFtZXNwYWNlICYmXG4gICAgICAgIHByb3BzLmhhc093blByb3BlcnR5KCd2YWx1ZScpICYmXG4gICAgICAgIHByb3BzLnZhbHVlICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgIWlzSG9vayhwcm9wcy52YWx1ZSlcbiAgICApIHtcbiAgICAgICAgcHJvcHMudmFsdWUgPSBzb2Z0U2V0SG9vayhwcm9wcy52YWx1ZSk7XG4gICAgfVxuXG4gICAgdHJhbnNmb3JtUHJvcGVydGllcyhwcm9wcyk7XG5cbiAgICBpZiAoY2hpbGRyZW4gIT09IHVuZGVmaW5lZCAmJiBjaGlsZHJlbiAhPT0gbnVsbCkge1xuICAgICAgICBhZGRDaGlsZChjaGlsZHJlbiwgY2hpbGROb2RlcywgdGFnLCBwcm9wcyk7XG4gICAgfVxuXG5cbiAgICByZXR1cm4gbmV3IFZOb2RlKHRhZywgcHJvcHMsIGNoaWxkTm9kZXMsIGtleSwgbmFtZXNwYWNlKTtcbn1cblxuZnVuY3Rpb24gYWRkQ2hpbGQoYywgY2hpbGROb2RlcywgdGFnLCBwcm9wcykge1xuICAgIGlmICh0eXBlb2YgYyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY2hpbGROb2Rlcy5wdXNoKG5ldyBWVGV4dChjKSk7XG4gICAgfSBlbHNlIGlmIChpc0NoaWxkKGMpKSB7XG4gICAgICAgIGNoaWxkTm9kZXMucHVzaChjKTtcbiAgICB9IGVsc2UgaWYgKGlzQXJyYXkoYykpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhZGRDaGlsZChjW2ldLCBjaGlsZE5vZGVzLCB0YWcsIHByb3BzKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoYyA9PT0gbnVsbCB8fCBjID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IFVuZXhwZWN0ZWRWaXJ0dWFsRWxlbWVudCh7XG4gICAgICAgICAgICBmb3JlaWduT2JqZWN0OiBjLFxuICAgICAgICAgICAgcGFyZW50Vm5vZGU6IHtcbiAgICAgICAgICAgICAgICB0YWdOYW1lOiB0YWcsXG4gICAgICAgICAgICAgICAgcHJvcGVydGllczogcHJvcHNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1Qcm9wZXJ0aWVzKHByb3BzKSB7XG4gICAgZm9yICh2YXIgcHJvcE5hbWUgaW4gcHJvcHMpIHtcbiAgICAgICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KHByb3BOYW1lKSkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gcHJvcHNbcHJvcE5hbWVdO1xuXG4gICAgICAgICAgICBpZiAoaXNIb29rKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocHJvcE5hbWUuc3Vic3RyKDAsIDMpID09PSAnZXYtJykge1xuICAgICAgICAgICAgICAgIC8vIGFkZCBldi1mb28gc3VwcG9ydFxuICAgICAgICAgICAgICAgIHByb3BzW3Byb3BOYW1lXSA9IGV2SG9vayh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGlzQ2hpbGQoeCkge1xuICAgIHJldHVybiBpc1ZOb2RlKHgpIHx8IGlzVlRleHQoeCkgfHwgaXNXaWRnZXQoeCkgfHwgaXNWVGh1bmsoeCk7XG59XG5cbmZ1bmN0aW9uIGlzQ2hpbGRyZW4oeCkge1xuICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ3N0cmluZycgfHwgaXNBcnJheSh4KSB8fCBpc0NoaWxkKHgpO1xufVxuXG5mdW5jdGlvbiBVbmV4cGVjdGVkVmlydHVhbEVsZW1lbnQoZGF0YSkge1xuICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoKTtcblxuICAgIGVyci50eXBlID0gJ3ZpcnR1YWwtaHlwZXJzY3JpcHQudW5leHBlY3RlZC52aXJ0dWFsLWVsZW1lbnQnO1xuICAgIGVyci5tZXNzYWdlID0gJ1VuZXhwZWN0ZWQgdmlydHVhbCBjaGlsZCBwYXNzZWQgdG8gaCgpLlxcbicgK1xuICAgICAgICAnRXhwZWN0ZWQgYSBWTm9kZSAvIFZ0aHVuayAvIFZXaWRnZXQgLyBzdHJpbmcgYnV0OlxcbicgK1xuICAgICAgICAnZ290OlxcbicgK1xuICAgICAgICBlcnJvclN0cmluZyhkYXRhLmZvcmVpZ25PYmplY3QpICtcbiAgICAgICAgJy5cXG4nICtcbiAgICAgICAgJ1RoZSBwYXJlbnQgdm5vZGUgaXM6XFxuJyArXG4gICAgICAgIGVycm9yU3RyaW5nKGRhdGEucGFyZW50Vm5vZGUpXG4gICAgICAgICdcXG4nICtcbiAgICAgICAgJ1N1Z2dlc3RlZCBmaXg6IGNoYW5nZSB5b3VyIGBoKC4uLiwgWyAuLi4gXSlgIGNhbGxzaXRlLic7XG4gICAgZXJyLmZvcmVpZ25PYmplY3QgPSBkYXRhLmZvcmVpZ25PYmplY3Q7XG4gICAgZXJyLnBhcmVudFZub2RlID0gZGF0YS5wYXJlbnRWbm9kZTtcblxuICAgIHJldHVybiBlcnI7XG59XG5cbmZ1bmN0aW9uIGVycm9yU3RyaW5nKG9iaikge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmosIG51bGwsICcgICAgJyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gU3RyaW5nKG9iaik7XG4gICAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3BsaXQgPSByZXF1aXJlKCdicm93c2VyLXNwbGl0Jyk7XG5cbnZhciBjbGFzc0lkU3BsaXQgPSAvKFtcXC4jXT9bYS16QS1aMC05XzotXSspLztcbnZhciBub3RDbGFzc0lkID0gL15cXC58Iy87XG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2VUYWc7XG5cbmZ1bmN0aW9uIHBhcnNlVGFnKHRhZywgcHJvcHMpIHtcbiAgICBpZiAoIXRhZykge1xuICAgICAgICByZXR1cm4gJ0RJVic7XG4gICAgfVxuXG4gICAgdmFyIG5vSWQgPSAhKHByb3BzLmhhc093blByb3BlcnR5KCdpZCcpKTtcblxuICAgIHZhciB0YWdQYXJ0cyA9IHNwbGl0KHRhZywgY2xhc3NJZFNwbGl0KTtcbiAgICB2YXIgdGFnTmFtZSA9IG51bGw7XG5cbiAgICBpZiAobm90Q2xhc3NJZC50ZXN0KHRhZ1BhcnRzWzFdKSkge1xuICAgICAgICB0YWdOYW1lID0gJ0RJVic7XG4gICAgfVxuXG4gICAgdmFyIGNsYXNzZXMsIHBhcnQsIHR5cGUsIGk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgdGFnUGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcGFydCA9IHRhZ1BhcnRzW2ldO1xuXG4gICAgICAgIGlmICghcGFydCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB0eXBlID0gcGFydC5jaGFyQXQoMCk7XG5cbiAgICAgICAgaWYgKCF0YWdOYW1lKSB7XG4gICAgICAgICAgICB0YWdOYW1lID0gcGFydDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnLicpIHtcbiAgICAgICAgICAgIGNsYXNzZXMgPSBjbGFzc2VzIHx8IFtdO1xuICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKHBhcnQuc3Vic3RyaW5nKDEsIHBhcnQubGVuZ3RoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJyMnICYmIG5vSWQpIHtcbiAgICAgICAgICAgIHByb3BzLmlkID0gcGFydC5zdWJzdHJpbmcoMSwgcGFydC5sZW5ndGgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNsYXNzZXMpIHtcbiAgICAgICAgaWYgKHByb3BzLmNsYXNzTmFtZSkge1xuICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKHByb3BzLmNsYXNzTmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm9wcy5jbGFzc05hbWUgPSBjbGFzc2VzLmpvaW4oJyAnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvcHMubmFtZXNwYWNlID8gdGFnTmFtZSA6IHRhZ05hbWUudG9VcHBlckNhc2UoKTtcbn1cbiIsInZhciBpc1ZOb2RlID0gcmVxdWlyZShcIi4vaXMtdm5vZGVcIilcbnZhciBpc1ZUZXh0ID0gcmVxdWlyZShcIi4vaXMtdnRleHRcIilcbnZhciBpc1dpZGdldCA9IHJlcXVpcmUoXCIuL2lzLXdpZGdldFwiKVxudmFyIGlzVGh1bmsgPSByZXF1aXJlKFwiLi9pcy10aHVua1wiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhbmRsZVRodW5rXG5cbmZ1bmN0aW9uIGhhbmRsZVRodW5rKGEsIGIpIHtcbiAgICB2YXIgcmVuZGVyZWRBID0gYVxuICAgIHZhciByZW5kZXJlZEIgPSBiXG5cbiAgICBpZiAoaXNUaHVuayhiKSkge1xuICAgICAgICByZW5kZXJlZEIgPSByZW5kZXJUaHVuayhiLCBhKVxuICAgIH1cblxuICAgIGlmIChpc1RodW5rKGEpKSB7XG4gICAgICAgIHJlbmRlcmVkQSA9IHJlbmRlclRodW5rKGEsIG51bGwpXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgYTogcmVuZGVyZWRBLFxuICAgICAgICBiOiByZW5kZXJlZEJcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlclRodW5rKHRodW5rLCBwcmV2aW91cykge1xuICAgIHZhciByZW5kZXJlZFRodW5rID0gdGh1bmsudm5vZGVcblxuICAgIGlmICghcmVuZGVyZWRUaHVuaykge1xuICAgICAgICByZW5kZXJlZFRodW5rID0gdGh1bmsudm5vZGUgPSB0aHVuay5yZW5kZXIocHJldmlvdXMpXG4gICAgfVxuXG4gICAgaWYgKCEoaXNWTm9kZShyZW5kZXJlZFRodW5rKSB8fFxuICAgICAgICAgICAgaXNWVGV4dChyZW5kZXJlZFRodW5rKSB8fFxuICAgICAgICAgICAgaXNXaWRnZXQocmVuZGVyZWRUaHVuaykpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcInRodW5rIGRpZCBub3QgcmV0dXJuIGEgdmFsaWQgbm9kZVwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVuZGVyZWRUaHVua1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBpc1RodW5rXHJcblxyXG5mdW5jdGlvbiBpc1RodW5rKHQpIHtcclxuICAgIHJldHVybiB0ICYmIHQudHlwZSA9PT0gXCJUaHVua1wiXHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBpc0hvb2tcblxuZnVuY3Rpb24gaXNIb29rKGhvb2spIHtcbiAgICByZXR1cm4gaG9vayAmJlxuICAgICAgKHR5cGVvZiBob29rLmhvb2sgPT09IFwiZnVuY3Rpb25cIiAmJiAhaG9vay5oYXNPd25Qcm9wZXJ0eShcImhvb2tcIikgfHxcbiAgICAgICB0eXBlb2YgaG9vay51bmhvb2sgPT09IFwiZnVuY3Rpb25cIiAmJiAhaG9vay5oYXNPd25Qcm9wZXJ0eShcInVuaG9va1wiKSlcbn1cbiIsInZhciB2ZXJzaW9uID0gcmVxdWlyZShcIi4vdmVyc2lvblwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzVmlydHVhbE5vZGVcblxuZnVuY3Rpb24gaXNWaXJ0dWFsTm9kZSh4KSB7XG4gICAgcmV0dXJuIHggJiYgeC50eXBlID09PSBcIlZpcnR1YWxOb2RlXCIgJiYgeC52ZXJzaW9uID09PSB2ZXJzaW9uXG59XG4iLCJ2YXIgdmVyc2lvbiA9IHJlcXVpcmUoXCIuL3ZlcnNpb25cIilcblxubW9kdWxlLmV4cG9ydHMgPSBpc1ZpcnR1YWxUZXh0XG5cbmZ1bmN0aW9uIGlzVmlydHVhbFRleHQoeCkge1xuICAgIHJldHVybiB4ICYmIHgudHlwZSA9PT0gXCJWaXJ0dWFsVGV4dFwiICYmIHgudmVyc2lvbiA9PT0gdmVyc2lvblxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBpc1dpZGdldFxuXG5mdW5jdGlvbiBpc1dpZGdldCh3KSB7XG4gICAgcmV0dXJuIHcgJiYgdy50eXBlID09PSBcIldpZGdldFwiXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiMVwiXG4iLCJ2YXIgdmVyc2lvbiA9IHJlcXVpcmUoXCIuL3ZlcnNpb25cIilcbnZhciBpc1ZOb2RlID0gcmVxdWlyZShcIi4vaXMtdm5vZGVcIilcbnZhciBpc1dpZGdldCA9IHJlcXVpcmUoXCIuL2lzLXdpZGdldFwiKVxudmFyIGlzVGh1bmsgPSByZXF1aXJlKFwiLi9pcy10aHVua1wiKVxudmFyIGlzVkhvb2sgPSByZXF1aXJlKFwiLi9pcy12aG9va1wiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpcnR1YWxOb2RlXG5cbnZhciBub1Byb3BlcnRpZXMgPSB7fVxudmFyIG5vQ2hpbGRyZW4gPSBbXVxuXG5mdW5jdGlvbiBWaXJ0dWFsTm9kZSh0YWdOYW1lLCBwcm9wZXJ0aWVzLCBjaGlsZHJlbiwga2V5LCBuYW1lc3BhY2UpIHtcbiAgICB0aGlzLnRhZ05hbWUgPSB0YWdOYW1lXG4gICAgdGhpcy5wcm9wZXJ0aWVzID0gcHJvcGVydGllcyB8fCBub1Byb3BlcnRpZXNcbiAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW4gfHwgbm9DaGlsZHJlblxuICAgIHRoaXMua2V5ID0ga2V5ICE9IG51bGwgPyBTdHJpbmcoa2V5KSA6IHVuZGVmaW5lZFxuICAgIHRoaXMubmFtZXNwYWNlID0gKHR5cGVvZiBuYW1lc3BhY2UgPT09IFwic3RyaW5nXCIpID8gbmFtZXNwYWNlIDogbnVsbFxuXG4gICAgdmFyIGNvdW50ID0gKGNoaWxkcmVuICYmIGNoaWxkcmVuLmxlbmd0aCkgfHwgMFxuICAgIHZhciBkZXNjZW5kYW50cyA9IDBcbiAgICB2YXIgaGFzV2lkZ2V0cyA9IGZhbHNlXG4gICAgdmFyIGhhc1RodW5rcyA9IGZhbHNlXG4gICAgdmFyIGRlc2NlbmRhbnRIb29rcyA9IGZhbHNlXG4gICAgdmFyIGhvb2tzXG5cbiAgICBmb3IgKHZhciBwcm9wTmFtZSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgIGlmIChwcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KHByb3BOYW1lKSkge1xuICAgICAgICAgICAgdmFyIHByb3BlcnR5ID0gcHJvcGVydGllc1twcm9wTmFtZV1cbiAgICAgICAgICAgIGlmIChpc1ZIb29rKHByb3BlcnR5KSAmJiBwcm9wZXJ0eS51bmhvb2spIHtcbiAgICAgICAgICAgICAgICBpZiAoIWhvb2tzKSB7XG4gICAgICAgICAgICAgICAgICAgIGhvb2tzID0ge31cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBob29rc1twcm9wTmFtZV0gPSBwcm9wZXJ0eVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldXG4gICAgICAgIGlmIChpc1ZOb2RlKGNoaWxkKSkge1xuICAgICAgICAgICAgZGVzY2VuZGFudHMgKz0gY2hpbGQuY291bnQgfHwgMFxuXG4gICAgICAgICAgICBpZiAoIWhhc1dpZGdldHMgJiYgY2hpbGQuaGFzV2lkZ2V0cykge1xuICAgICAgICAgICAgICAgIGhhc1dpZGdldHMgPSB0cnVlXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghaGFzVGh1bmtzICYmIGNoaWxkLmhhc1RodW5rcykge1xuICAgICAgICAgICAgICAgIGhhc1RodW5rcyA9IHRydWVcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFkZXNjZW5kYW50SG9va3MgJiYgKGNoaWxkLmhvb2tzIHx8IGNoaWxkLmRlc2NlbmRhbnRIb29rcykpIHtcbiAgICAgICAgICAgICAgICBkZXNjZW5kYW50SG9va3MgPSB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoIWhhc1dpZGdldHMgJiYgaXNXaWRnZXQoY2hpbGQpKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNoaWxkLmRlc3Ryb3kgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIGhhc1dpZGdldHMgPSB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoIWhhc1RodW5rcyAmJiBpc1RodW5rKGNoaWxkKSkge1xuICAgICAgICAgICAgaGFzVGh1bmtzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuY291bnQgPSBjb3VudCArIGRlc2NlbmRhbnRzXG4gICAgdGhpcy5oYXNXaWRnZXRzID0gaGFzV2lkZ2V0c1xuICAgIHRoaXMuaGFzVGh1bmtzID0gaGFzVGh1bmtzXG4gICAgdGhpcy5ob29rcyA9IGhvb2tzXG4gICAgdGhpcy5kZXNjZW5kYW50SG9va3MgPSBkZXNjZW5kYW50SG9va3Ncbn1cblxuVmlydHVhbE5vZGUucHJvdG90eXBlLnZlcnNpb24gPSB2ZXJzaW9uXG5WaXJ0dWFsTm9kZS5wcm90b3R5cGUudHlwZSA9IFwiVmlydHVhbE5vZGVcIlxuIiwidmFyIHZlcnNpb24gPSByZXF1aXJlKFwiLi92ZXJzaW9uXCIpXG5cblZpcnR1YWxQYXRjaC5OT05FID0gMFxuVmlydHVhbFBhdGNoLlZURVhUID0gMVxuVmlydHVhbFBhdGNoLlZOT0RFID0gMlxuVmlydHVhbFBhdGNoLldJREdFVCA9IDNcblZpcnR1YWxQYXRjaC5QUk9QUyA9IDRcblZpcnR1YWxQYXRjaC5PUkRFUiA9IDVcblZpcnR1YWxQYXRjaC5JTlNFUlQgPSA2XG5WaXJ0dWFsUGF0Y2guUkVNT1ZFID0gN1xuVmlydHVhbFBhdGNoLlRIVU5LID0gOFxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpcnR1YWxQYXRjaFxuXG5mdW5jdGlvbiBWaXJ0dWFsUGF0Y2godHlwZSwgdk5vZGUsIHBhdGNoKSB7XG4gICAgdGhpcy50eXBlID0gTnVtYmVyKHR5cGUpXG4gICAgdGhpcy52Tm9kZSA9IHZOb2RlXG4gICAgdGhpcy5wYXRjaCA9IHBhdGNoXG59XG5cblZpcnR1YWxQYXRjaC5wcm90b3R5cGUudmVyc2lvbiA9IHZlcnNpb25cblZpcnR1YWxQYXRjaC5wcm90b3R5cGUudHlwZSA9IFwiVmlydHVhbFBhdGNoXCJcbiIsInZhciB2ZXJzaW9uID0gcmVxdWlyZShcIi4vdmVyc2lvblwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpcnR1YWxUZXh0XG5cbmZ1bmN0aW9uIFZpcnR1YWxUZXh0KHRleHQpIHtcbiAgICB0aGlzLnRleHQgPSBTdHJpbmcodGV4dClcbn1cblxuVmlydHVhbFRleHQucHJvdG90eXBlLnZlcnNpb24gPSB2ZXJzaW9uXG5WaXJ0dWFsVGV4dC5wcm90b3R5cGUudHlwZSA9IFwiVmlydHVhbFRleHRcIlxuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZShcImlzLW9iamVjdFwiKVxudmFyIGlzSG9vayA9IHJlcXVpcmUoXCIuLi92bm9kZS9pcy12aG9va1wiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRpZmZQcm9wc1xuXG5mdW5jdGlvbiBkaWZmUHJvcHMoYSwgYikge1xuICAgIHZhciBkaWZmXG5cbiAgICBmb3IgKHZhciBhS2V5IGluIGEpIHtcbiAgICAgICAgaWYgKCEoYUtleSBpbiBiKSkge1xuICAgICAgICAgICAgZGlmZiA9IGRpZmYgfHwge31cbiAgICAgICAgICAgIGRpZmZbYUtleV0gPSB1bmRlZmluZWRcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhVmFsdWUgPSBhW2FLZXldXG4gICAgICAgIHZhciBiVmFsdWUgPSBiW2FLZXldXG5cbiAgICAgICAgaWYgKGFWYWx1ZSA9PT0gYlZhbHVlKSB7XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KGFWYWx1ZSkgJiYgaXNPYmplY3QoYlZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKGdldFByb3RvdHlwZShiVmFsdWUpICE9PSBnZXRQcm90b3R5cGUoYVZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGRpZmYgPSBkaWZmIHx8IHt9XG4gICAgICAgICAgICAgICAgZGlmZlthS2V5XSA9IGJWYWx1ZVxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc0hvb2soYlZhbHVlKSkge1xuICAgICAgICAgICAgICAgICBkaWZmID0gZGlmZiB8fCB7fVxuICAgICAgICAgICAgICAgICBkaWZmW2FLZXldID0gYlZhbHVlXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBvYmplY3REaWZmID0gZGlmZlByb3BzKGFWYWx1ZSwgYlZhbHVlKVxuICAgICAgICAgICAgICAgIGlmIChvYmplY3REaWZmKSB7XG4gICAgICAgICAgICAgICAgICAgIGRpZmYgPSBkaWZmIHx8IHt9XG4gICAgICAgICAgICAgICAgICAgIGRpZmZbYUtleV0gPSBvYmplY3REaWZmXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGlmZiA9IGRpZmYgfHwge31cbiAgICAgICAgICAgIGRpZmZbYUtleV0gPSBiVmFsdWVcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGJLZXkgaW4gYikge1xuICAgICAgICBpZiAoIShiS2V5IGluIGEpKSB7XG4gICAgICAgICAgICBkaWZmID0gZGlmZiB8fCB7fVxuICAgICAgICAgICAgZGlmZltiS2V5XSA9IGJbYktleV1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkaWZmXG59XG5cbmZ1bmN0aW9uIGdldFByb3RvdHlwZSh2YWx1ZSkge1xuICBpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKSB7XG4gICAgcmV0dXJuIE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWx1ZSlcbiAgfSBlbHNlIGlmICh2YWx1ZS5fX3Byb3RvX18pIHtcbiAgICByZXR1cm4gdmFsdWUuX19wcm90b19fXG4gIH0gZWxzZSBpZiAodmFsdWUuY29uc3RydWN0b3IpIHtcbiAgICByZXR1cm4gdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlXG4gIH1cbn1cbiIsInZhciBpc0FycmF5ID0gcmVxdWlyZShcIngtaXMtYXJyYXlcIilcblxudmFyIFZQYXRjaCA9IHJlcXVpcmUoXCIuLi92bm9kZS92cGF0Y2hcIilcbnZhciBpc1ZOb2RlID0gcmVxdWlyZShcIi4uL3Zub2RlL2lzLXZub2RlXCIpXG52YXIgaXNWVGV4dCA9IHJlcXVpcmUoXCIuLi92bm9kZS9pcy12dGV4dFwiKVxudmFyIGlzV2lkZ2V0ID0gcmVxdWlyZShcIi4uL3Zub2RlL2lzLXdpZGdldFwiKVxudmFyIGlzVGh1bmsgPSByZXF1aXJlKFwiLi4vdm5vZGUvaXMtdGh1bmtcIilcbnZhciBoYW5kbGVUaHVuayA9IHJlcXVpcmUoXCIuLi92bm9kZS9oYW5kbGUtdGh1bmtcIilcblxudmFyIGRpZmZQcm9wcyA9IHJlcXVpcmUoXCIuL2RpZmYtcHJvcHNcIilcblxubW9kdWxlLmV4cG9ydHMgPSBkaWZmXG5cbmZ1bmN0aW9uIGRpZmYoYSwgYikge1xuICAgIHZhciBwYXRjaCA9IHsgYTogYSB9XG4gICAgd2FsayhhLCBiLCBwYXRjaCwgMClcbiAgICByZXR1cm4gcGF0Y2hcbn1cblxuZnVuY3Rpb24gd2FsayhhLCBiLCBwYXRjaCwgaW5kZXgpIHtcbiAgICBpZiAoYSA9PT0gYikge1xuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB2YXIgYXBwbHkgPSBwYXRjaFtpbmRleF1cbiAgICB2YXIgYXBwbHlDbGVhciA9IGZhbHNlXG5cbiAgICBpZiAoaXNUaHVuayhhKSB8fCBpc1RodW5rKGIpKSB7XG4gICAgICAgIHRodW5rcyhhLCBiLCBwYXRjaCwgaW5kZXgpXG4gICAgfSBlbHNlIGlmIChiID09IG51bGwpIHtcblxuICAgICAgICAvLyBJZiBhIGlzIGEgd2lkZ2V0IHdlIHdpbGwgYWRkIGEgcmVtb3ZlIHBhdGNoIGZvciBpdFxuICAgICAgICAvLyBPdGhlcndpc2UgYW55IGNoaWxkIHdpZGdldHMvaG9va3MgbXVzdCBiZSBkZXN0cm95ZWQuXG4gICAgICAgIC8vIFRoaXMgcHJldmVudHMgYWRkaW5nIHR3byByZW1vdmUgcGF0Y2hlcyBmb3IgYSB3aWRnZXQuXG4gICAgICAgIGlmICghaXNXaWRnZXQoYSkpIHtcbiAgICAgICAgICAgIGNsZWFyU3RhdGUoYSwgcGF0Y2gsIGluZGV4KVxuICAgICAgICAgICAgYXBwbHkgPSBwYXRjaFtpbmRleF1cbiAgICAgICAgfVxuXG4gICAgICAgIGFwcGx5ID0gYXBwZW5kUGF0Y2goYXBwbHksIG5ldyBWUGF0Y2goVlBhdGNoLlJFTU9WRSwgYSwgYikpXG4gICAgfSBlbHNlIGlmIChpc1ZOb2RlKGIpKSB7XG4gICAgICAgIGlmIChpc1ZOb2RlKGEpKSB7XG4gICAgICAgICAgICBpZiAoYS50YWdOYW1lID09PSBiLnRhZ05hbWUgJiZcbiAgICAgICAgICAgICAgICBhLm5hbWVzcGFjZSA9PT0gYi5uYW1lc3BhY2UgJiZcbiAgICAgICAgICAgICAgICBhLmtleSA9PT0gYi5rZXkpIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJvcHNQYXRjaCA9IGRpZmZQcm9wcyhhLnByb3BlcnRpZXMsIGIucHJvcGVydGllcylcbiAgICAgICAgICAgICAgICBpZiAocHJvcHNQYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBhcHBseSA9IGFwcGVuZFBhdGNoKGFwcGx5LFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFZQYXRjaChWUGF0Y2guUFJPUFMsIGEsIHByb3BzUGF0Y2gpKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhcHBseSA9IGRpZmZDaGlsZHJlbihhLCBiLCBwYXRjaCwgYXBwbHksIGluZGV4KVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhcHBseSA9IGFwcGVuZFBhdGNoKGFwcGx5LCBuZXcgVlBhdGNoKFZQYXRjaC5WTk9ERSwgYSwgYikpXG4gICAgICAgICAgICAgICAgYXBwbHlDbGVhciA9IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFwcGx5ID0gYXBwZW5kUGF0Y2goYXBwbHksIG5ldyBWUGF0Y2goVlBhdGNoLlZOT0RFLCBhLCBiKSlcbiAgICAgICAgICAgIGFwcGx5Q2xlYXIgPSB0cnVlXG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzVlRleHQoYikpIHtcbiAgICAgICAgaWYgKCFpc1ZUZXh0KGEpKSB7XG4gICAgICAgICAgICBhcHBseSA9IGFwcGVuZFBhdGNoKGFwcGx5LCBuZXcgVlBhdGNoKFZQYXRjaC5WVEVYVCwgYSwgYikpXG4gICAgICAgICAgICBhcHBseUNsZWFyID0gdHJ1ZVxuICAgICAgICB9IGVsc2UgaWYgKGEudGV4dCAhPT0gYi50ZXh0KSB7XG4gICAgICAgICAgICBhcHBseSA9IGFwcGVuZFBhdGNoKGFwcGx5LCBuZXcgVlBhdGNoKFZQYXRjaC5WVEVYVCwgYSwgYikpXG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzV2lkZ2V0KGIpKSB7XG4gICAgICAgIGlmICghaXNXaWRnZXQoYSkpIHtcbiAgICAgICAgICAgIGFwcGx5Q2xlYXIgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgYXBwbHkgPSBhcHBlbmRQYXRjaChhcHBseSwgbmV3IFZQYXRjaChWUGF0Y2guV0lER0VULCBhLCBiKSlcbiAgICB9XG5cbiAgICBpZiAoYXBwbHkpIHtcbiAgICAgICAgcGF0Y2hbaW5kZXhdID0gYXBwbHlcbiAgICB9XG5cbiAgICBpZiAoYXBwbHlDbGVhcikge1xuICAgICAgICBjbGVhclN0YXRlKGEsIHBhdGNoLCBpbmRleClcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRpZmZDaGlsZHJlbihhLCBiLCBwYXRjaCwgYXBwbHksIGluZGV4KSB7XG4gICAgdmFyIGFDaGlsZHJlbiA9IGEuY2hpbGRyZW5cbiAgICB2YXIgYkNoaWxkcmVuID0gcmVvcmRlcihhQ2hpbGRyZW4sIGIuY2hpbGRyZW4pXG5cbiAgICB2YXIgYUxlbiA9IGFDaGlsZHJlbi5sZW5ndGhcbiAgICB2YXIgYkxlbiA9IGJDaGlsZHJlbi5sZW5ndGhcbiAgICB2YXIgbGVuID0gYUxlbiA+IGJMZW4gPyBhTGVuIDogYkxlblxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICB2YXIgbGVmdE5vZGUgPSBhQ2hpbGRyZW5baV1cbiAgICAgICAgdmFyIHJpZ2h0Tm9kZSA9IGJDaGlsZHJlbltpXVxuICAgICAgICBpbmRleCArPSAxXG5cbiAgICAgICAgaWYgKCFsZWZ0Tm9kZSkge1xuICAgICAgICAgICAgaWYgKHJpZ2h0Tm9kZSkge1xuICAgICAgICAgICAgICAgIC8vIEV4Y2VzcyBub2RlcyBpbiBiIG5lZWQgdG8gYmUgYWRkZWRcbiAgICAgICAgICAgICAgICBhcHBseSA9IGFwcGVuZFBhdGNoKGFwcGx5LFxuICAgICAgICAgICAgICAgICAgICBuZXcgVlBhdGNoKFZQYXRjaC5JTlNFUlQsIG51bGwsIHJpZ2h0Tm9kZSkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3YWxrKGxlZnROb2RlLCByaWdodE5vZGUsIHBhdGNoLCBpbmRleClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc1ZOb2RlKGxlZnROb2RlKSAmJiBsZWZ0Tm9kZS5jb3VudCkge1xuICAgICAgICAgICAgaW5kZXggKz0gbGVmdE5vZGUuY291bnRcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChiQ2hpbGRyZW4ubW92ZXMpIHtcbiAgICAgICAgLy8gUmVvcmRlciBub2RlcyBsYXN0XG4gICAgICAgIGFwcGx5ID0gYXBwZW5kUGF0Y2goYXBwbHksIG5ldyBWUGF0Y2goVlBhdGNoLk9SREVSLCBhLCBiQ2hpbGRyZW4ubW92ZXMpKVxuICAgIH1cblxuICAgIHJldHVybiBhcHBseVxufVxuXG5mdW5jdGlvbiBjbGVhclN0YXRlKHZOb2RlLCBwYXRjaCwgaW5kZXgpIHtcbiAgICAvLyBUT0RPOiBNYWtlIHRoaXMgYSBzaW5nbGUgd2Fsaywgbm90IHR3b1xuICAgIHVuaG9vayh2Tm9kZSwgcGF0Y2gsIGluZGV4KVxuICAgIGRlc3Ryb3lXaWRnZXRzKHZOb2RlLCBwYXRjaCwgaW5kZXgpXG59XG5cbi8vIFBhdGNoIHJlY29yZHMgZm9yIGFsbCBkZXN0cm95ZWQgd2lkZ2V0cyBtdXN0IGJlIGFkZGVkIGJlY2F1c2Ugd2UgbmVlZFxuLy8gYSBET00gbm9kZSByZWZlcmVuY2UgZm9yIHRoZSBkZXN0cm95IGZ1bmN0aW9uXG5mdW5jdGlvbiBkZXN0cm95V2lkZ2V0cyh2Tm9kZSwgcGF0Y2gsIGluZGV4KSB7XG4gICAgaWYgKGlzV2lkZ2V0KHZOb2RlKSkge1xuICAgICAgICBpZiAodHlwZW9mIHZOb2RlLmRlc3Ryb3kgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgcGF0Y2hbaW5kZXhdID0gYXBwZW5kUGF0Y2goXG4gICAgICAgICAgICAgICAgcGF0Y2hbaW5kZXhdLFxuICAgICAgICAgICAgICAgIG5ldyBWUGF0Y2goVlBhdGNoLlJFTU9WRSwgdk5vZGUsIG51bGwpXG4gICAgICAgICAgICApXG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzVk5vZGUodk5vZGUpICYmICh2Tm9kZS5oYXNXaWRnZXRzIHx8IHZOb2RlLmhhc1RodW5rcykpIHtcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdk5vZGUuY2hpbGRyZW5cbiAgICAgICAgdmFyIGxlbiA9IGNoaWxkcmVuLmxlbmd0aFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuICAgICAgICAgICAgaW5kZXggKz0gMVxuXG4gICAgICAgICAgICBkZXN0cm95V2lkZ2V0cyhjaGlsZCwgcGF0Y2gsIGluZGV4KVxuXG4gICAgICAgICAgICBpZiAoaXNWTm9kZShjaGlsZCkgJiYgY2hpbGQuY291bnQpIHtcbiAgICAgICAgICAgICAgICBpbmRleCArPSBjaGlsZC5jb3VudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChpc1RodW5rKHZOb2RlKSkge1xuICAgICAgICB0aHVua3Modk5vZGUsIG51bGwsIHBhdGNoLCBpbmRleClcbiAgICB9XG59XG5cbi8vIENyZWF0ZSBhIHN1Yi1wYXRjaCBmb3IgdGh1bmtzXG5mdW5jdGlvbiB0aHVua3MoYSwgYiwgcGF0Y2gsIGluZGV4KSB7XG4gICAgdmFyIG5vZGVzID0gaGFuZGxlVGh1bmsoYSwgYik7XG4gICAgdmFyIHRodW5rUGF0Y2ggPSBkaWZmKG5vZGVzLmEsIG5vZGVzLmIpXG4gICAgaWYgKGhhc1BhdGNoZXModGh1bmtQYXRjaCkpIHtcbiAgICAgICAgcGF0Y2hbaW5kZXhdID0gbmV3IFZQYXRjaChWUGF0Y2guVEhVTkssIG51bGwsIHRodW5rUGF0Y2gpXG4gICAgfVxufVxuXG5mdW5jdGlvbiBoYXNQYXRjaGVzKHBhdGNoKSB7XG4gICAgZm9yICh2YXIgaW5kZXggaW4gcGF0Y2gpIHtcbiAgICAgICAgaWYgKGluZGV4ICE9PSBcImFcIikge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbi8vIEV4ZWN1dGUgaG9va3Mgd2hlbiB0d28gbm9kZXMgYXJlIGlkZW50aWNhbFxuZnVuY3Rpb24gdW5ob29rKHZOb2RlLCBwYXRjaCwgaW5kZXgpIHtcbiAgICBpZiAoaXNWTm9kZSh2Tm9kZSkpIHtcbiAgICAgICAgaWYgKHZOb2RlLmhvb2tzKSB7XG4gICAgICAgICAgICBwYXRjaFtpbmRleF0gPSBhcHBlbmRQYXRjaChcbiAgICAgICAgICAgICAgICBwYXRjaFtpbmRleF0sXG4gICAgICAgICAgICAgICAgbmV3IFZQYXRjaChcbiAgICAgICAgICAgICAgICAgICAgVlBhdGNoLlBST1BTLFxuICAgICAgICAgICAgICAgICAgICB2Tm9kZSxcbiAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkS2V5cyh2Tm9kZS5ob29rcylcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodk5vZGUuZGVzY2VuZGFudEhvb2tzIHx8IHZOb2RlLmhhc1RodW5rcykge1xuICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gdk5vZGUuY2hpbGRyZW5cbiAgICAgICAgICAgIHZhciBsZW4gPSBjaGlsZHJlbi5sZW5ndGhcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuICAgICAgICAgICAgICAgIGluZGV4ICs9IDFcblxuICAgICAgICAgICAgICAgIHVuaG9vayhjaGlsZCwgcGF0Y2gsIGluZGV4KVxuXG4gICAgICAgICAgICAgICAgaWYgKGlzVk5vZGUoY2hpbGQpICYmIGNoaWxkLmNvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ICs9IGNoaWxkLmNvdW50XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChpc1RodW5rKHZOb2RlKSkge1xuICAgICAgICB0aHVua3Modk5vZGUsIG51bGwsIHBhdGNoLCBpbmRleClcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHVuZGVmaW5lZEtleXMob2JqKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdFxufVxuXG4vLyBMaXN0IGRpZmYsIG5haXZlIGxlZnQgdG8gcmlnaHQgcmVvcmRlcmluZ1xuZnVuY3Rpb24gcmVvcmRlcihhQ2hpbGRyZW4sIGJDaGlsZHJlbikge1xuXG4gICAgdmFyIGJLZXlzID0ga2V5SW5kZXgoYkNoaWxkcmVuKVxuXG4gICAgaWYgKCFiS2V5cykge1xuICAgICAgICByZXR1cm4gYkNoaWxkcmVuXG4gICAgfVxuXG4gICAgdmFyIGFLZXlzID0ga2V5SW5kZXgoYUNoaWxkcmVuKVxuXG4gICAgaWYgKCFhS2V5cykge1xuICAgICAgICByZXR1cm4gYkNoaWxkcmVuXG4gICAgfVxuXG4gICAgdmFyIGJNYXRjaCA9IHt9LCBhTWF0Y2ggPSB7fVxuXG4gICAgZm9yICh2YXIgYUtleSBpbiBiS2V5cykge1xuICAgICAgICBiTWF0Y2hbYktleXNbYUtleV1dID0gYUtleXNbYUtleV1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBiS2V5IGluIGFLZXlzKSB7XG4gICAgICAgIGFNYXRjaFthS2V5c1tiS2V5XV0gPSBiS2V5c1tiS2V5XVxuICAgIH1cblxuICAgIHZhciBhTGVuID0gYUNoaWxkcmVuLmxlbmd0aFxuICAgIHZhciBiTGVuID0gYkNoaWxkcmVuLmxlbmd0aFxuICAgIHZhciBsZW4gPSBhTGVuID4gYkxlbiA/IGFMZW4gOiBiTGVuXG4gICAgdmFyIHNodWZmbGUgPSBbXVxuICAgIHZhciBmcmVlSW5kZXggPSAwXG4gICAgdmFyIGkgPSAwXG4gICAgdmFyIG1vdmVJbmRleCA9IDBcbiAgICB2YXIgbW92ZXMgPSB7fVxuICAgIHZhciByZW1vdmVzID0gbW92ZXMucmVtb3ZlcyA9IHt9XG4gICAgdmFyIHJldmVyc2UgPSBtb3Zlcy5yZXZlcnNlID0ge31cbiAgICB2YXIgaGFzTW92ZXMgPSBmYWxzZVxuXG4gICAgd2hpbGUgKGZyZWVJbmRleCA8IGxlbikge1xuICAgICAgICB2YXIgbW92ZSA9IGFNYXRjaFtpXVxuICAgICAgICBpZiAobW92ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzaHVmZmxlW2ldID0gYkNoaWxkcmVuW21vdmVdXG4gICAgICAgICAgICBpZiAobW92ZSAhPT0gbW92ZUluZGV4KSB7XG4gICAgICAgICAgICAgICAgbW92ZXNbbW92ZV0gPSBtb3ZlSW5kZXhcbiAgICAgICAgICAgICAgICByZXZlcnNlW21vdmVJbmRleF0gPSBtb3ZlXG4gICAgICAgICAgICAgICAgaGFzTW92ZXMgPSB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtb3ZlSW5kZXgrK1xuICAgICAgICB9IGVsc2UgaWYgKGkgaW4gYU1hdGNoKSB7XG4gICAgICAgICAgICBzaHVmZmxlW2ldID0gdW5kZWZpbmVkXG4gICAgICAgICAgICByZW1vdmVzW2ldID0gbW92ZUluZGV4KytcbiAgICAgICAgICAgIGhhc01vdmVzID0gdHJ1ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2hpbGUgKGJNYXRjaFtmcmVlSW5kZXhdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBmcmVlSW5kZXgrK1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZnJlZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZyZWVDaGlsZCA9IGJDaGlsZHJlbltmcmVlSW5kZXhdXG4gICAgICAgICAgICAgICAgaWYgKGZyZWVDaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICBzaHVmZmxlW2ldID0gZnJlZUNoaWxkXG4gICAgICAgICAgICAgICAgICAgIGlmIChmcmVlSW5kZXggIT09IG1vdmVJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFzTW92ZXMgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICBtb3Zlc1tmcmVlSW5kZXhdID0gbW92ZUluZGV4XG4gICAgICAgICAgICAgICAgICAgICAgICByZXZlcnNlW21vdmVJbmRleF0gPSBmcmVlSW5kZXhcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBtb3ZlSW5kZXgrK1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmcmVlSW5kZXgrK1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGkrK1xuICAgIH1cblxuICAgIGlmIChoYXNNb3Zlcykge1xuICAgICAgICBzaHVmZmxlLm1vdmVzID0gbW92ZXNcbiAgICB9XG5cbiAgICByZXR1cm4gc2h1ZmZsZVxufVxuXG5mdW5jdGlvbiBrZXlJbmRleChjaGlsZHJlbikge1xuICAgIHZhciBpLCBrZXlzXG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV1cblxuICAgICAgICBpZiAoY2hpbGQua2V5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGtleXMgPSBrZXlzIHx8IHt9XG4gICAgICAgICAgICBrZXlzW2NoaWxkLmtleV0gPSBpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ga2V5c1xufVxuXG5mdW5jdGlvbiBhcHBlbmRQYXRjaChhcHBseSwgcGF0Y2gpIHtcbiAgICBpZiAoYXBwbHkpIHtcbiAgICAgICAgaWYgKGlzQXJyYXkoYXBwbHkpKSB7XG4gICAgICAgICAgICBhcHBseS5wdXNoKHBhdGNoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXBwbHkgPSBbYXBwbHksIHBhdGNoXVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFwcGx5XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHBhdGNoXG4gICAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBleHRlbmRcblxuZnVuY3Rpb24gZXh0ZW5kKHRhcmdldCkge1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV1cblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBpZiAoc291cmNlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGFyZ2V0XG59XG4iLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChtb250aCwgeWVhcikge1xuXHR2YXIgbm93ID0gbmV3IERhdGUoKTtcblx0bW9udGggPSBtb250aCA9PSBudWxsID8gbm93LmdldFVUQ01vbnRoKCkgOiBtb250aDtcblx0eWVhciA9IHllYXIgPT0gbnVsbCA/IG5vdy5nZXRVVENGdWxsWWVhcigpIDogeWVhcjtcblxuXHRyZXR1cm4gbmV3IERhdGUoRGF0ZS5VVEMoeWVhciwgbW9udGggKyAxLCAwKSkuZ2V0VVRDRGF0ZSgpO1xufTtcbiIsInZhciBfYXJpdHkgPSByZXF1aXJlKCcuL2ludGVybmFsL19hcml0eScpO1xudmFyIF9jdXJyeTIgPSByZXF1aXJlKCcuL2ludGVybmFsL19jdXJyeTInKTtcblxuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IGlzIGJvdW5kIHRvIGEgY29udGV4dC5cbiAqIE5vdGU6IGBSLmJpbmRgIGRvZXMgbm90IHByb3ZpZGUgdGhlIGFkZGl0aW9uYWwgYXJndW1lbnQtYmluZGluZyBjYXBhYmlsaXRpZXMgb2ZcbiAqIFtGdW5jdGlvbi5wcm90b3R5cGUuYmluZF0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRnVuY3Rpb24vYmluZCkuXG4gKlxuICogQGZ1bmNcbiAqIEBtZW1iZXJPZiBSXG4gKiBAc2luY2UgdjAuNi4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBzZWUgUi5wYXJ0aWFsXG4gKiBAc2lnICgqIC0+ICopIC0+IHsqfSAtPiAoKiAtPiAqKVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGJpbmQgdG8gY29udGV4dFxuICogQHBhcmFtIHtPYmplY3R9IHRoaXNPYmogVGhlIGNvbnRleHQgdG8gYmluZCBgZm5gIHRvXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gQSBmdW5jdGlvbiB0aGF0IHdpbGwgZXhlY3V0ZSBpbiB0aGUgY29udGV4dCBvZiBgdGhpc09iamAuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gX2N1cnJ5MihmdW5jdGlvbiBiaW5kKGZuLCB0aGlzT2JqKSB7XG4gIHJldHVybiBfYXJpdHkoZm4ubGVuZ3RoLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhpc09iaiwgYXJndW1lbnRzKTtcbiAgfSk7XG59KTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gX2FyaXR5KG4sIGZuKSB7XG4gIC8vIGpzaGludCB1bnVzZWQ6dmFyc1xuICBzd2l0Y2ggKG4pIHtcbiAgICBjYXNlIDA6IHJldHVybiBmdW5jdGlvbigpIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYTApIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24oYTAsIGExKSB7IHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKGEwLCBhMSwgYTIpIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSA0OiByZXR1cm4gZnVuY3Rpb24oYTAsIGExLCBhMiwgYTMpIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSA1OiByZXR1cm4gZnVuY3Rpb24oYTAsIGExLCBhMiwgYTMsIGE0KSB7IHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9O1xuICAgIGNhc2UgNjogcmV0dXJuIGZ1bmN0aW9uKGEwLCBhMSwgYTIsIGEzLCBhNCwgYTUpIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSA3OiByZXR1cm4gZnVuY3Rpb24oYTAsIGExLCBhMiwgYTMsIGE0LCBhNSwgYTYpIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSA4OiByZXR1cm4gZnVuY3Rpb24oYTAsIGExLCBhMiwgYTMsIGE0LCBhNSwgYTYsIGE3KSB7IHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9O1xuICAgIGNhc2UgOTogcmV0dXJuIGZ1bmN0aW9uKGEwLCBhMSwgYTIsIGEzLCBhNCwgYTUsIGE2LCBhNywgYTgpIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSAxMDogcmV0dXJuIGZ1bmN0aW9uKGEwLCBhMSwgYTIsIGEzLCBhNCwgYTUsIGE2LCBhNywgYTgsIGE5KSB7IHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9O1xuICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgdG8gX2FyaXR5IG11c3QgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlciBubyBncmVhdGVyIHRoYW4gdGVuJyk7XG4gIH1cbn07XG4iLCJ2YXIgX2lzQXJyYXkgPSByZXF1aXJlKCcuL19pc0FycmF5Jyk7XG52YXIgX3NsaWNlID0gcmVxdWlyZSgnLi9fc2xpY2UnKTtcblxuXG4vKipcbiAqIFNpbWlsYXIgdG8gaGFzTWV0aG9kLCB0aGlzIGNoZWNrcyB3aGV0aGVyIGEgZnVuY3Rpb24gaGFzIGEgW21ldGhvZG5hbWVdXG4gKiBmdW5jdGlvbi4gSWYgaXQgaXNuJ3QgYW4gYXJyYXkgaXQgd2lsbCBleGVjdXRlIHRoYXQgZnVuY3Rpb24gb3RoZXJ3aXNlIGl0IHdpbGxcbiAqIGRlZmF1bHQgdG8gdGhlIHJhbWRhIGltcGxlbWVudGF0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiByYW1kYSBpbXBsZW10YXRpb25cbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RuYW1lIHByb3BlcnR5IHRvIGNoZWNrIGZvciBhIGN1c3RvbSBpbXBsZW1lbnRhdGlvblxuICogQHJldHVybiB7T2JqZWN0fSBXaGF0ZXZlciB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBtZXRob2QgaXMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gX2NoZWNrRm9yTWV0aG9kKG1ldGhvZG5hbWUsIGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBpZiAobGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gZm4oKTtcbiAgICB9XG4gICAgdmFyIG9iaiA9IGFyZ3VtZW50c1tsZW5ndGggLSAxXTtcbiAgICByZXR1cm4gKF9pc0FycmF5KG9iaikgfHwgdHlwZW9mIG9ialttZXRob2RuYW1lXSAhPT0gJ2Z1bmN0aW9uJykgP1xuICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKSA6XG4gICAgICBvYmpbbWV0aG9kbmFtZV0uYXBwbHkob2JqLCBfc2xpY2UoYXJndW1lbnRzLCAwLCBsZW5ndGggLSAxKSk7XG4gIH07XG59O1xuIiwiLyoqXG4gKiBPcHRpbWl6ZWQgaW50ZXJuYWwgb25lLWFyaXR5IGN1cnJ5IGZ1bmN0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjdXJyeS5cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgY3VycmllZCBmdW5jdGlvbi5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBfY3VycnkxKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiBmMShhKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBmMTtcbiAgICB9IGVsc2UgaWYgKGEgIT0gbnVsbCAmJiBhWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIGYxO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH07XG59O1xuIiwidmFyIF9jdXJyeTEgPSByZXF1aXJlKCcuL19jdXJyeTEnKTtcblxuXG4vKipcbiAqIE9wdGltaXplZCBpbnRlcm5hbCB0d28tYXJpdHkgY3VycnkgZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGN1cnJ5LlxuICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBjdXJyaWVkIGZ1bmN0aW9uLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIF9jdXJyeTIoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGYyKGEsIGIpIHtcbiAgICB2YXIgbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgaWYgKG4gPT09IDApIHtcbiAgICAgIHJldHVybiBmMjtcbiAgICB9IGVsc2UgaWYgKG4gPT09IDEgJiYgYSAhPSBudWxsICYmIGFbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gZjI7XG4gICAgfSBlbHNlIGlmIChuID09PSAxKSB7XG4gICAgICByZXR1cm4gX2N1cnJ5MShmdW5jdGlvbihiKSB7IHJldHVybiBmbihhLCBiKTsgfSk7XG4gICAgfSBlbHNlIGlmIChuID09PSAyICYmIGEgIT0gbnVsbCAmJiBhWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICBiICE9IG51bGwgJiYgYlsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBmMjtcbiAgICB9IGVsc2UgaWYgKG4gPT09IDIgJiYgYSAhPSBudWxsICYmIGFbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gX2N1cnJ5MShmdW5jdGlvbihhKSB7IHJldHVybiBmbihhLCBiKTsgfSk7XG4gICAgfSBlbHNlIGlmIChuID09PSAyICYmIGIgIT0gbnVsbCAmJiBiWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIF9jdXJyeTEoZnVuY3Rpb24oYikgeyByZXR1cm4gZm4oYSwgYik7IH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZm4oYSwgYik7XG4gICAgfVxuICB9O1xufTtcbiIsInZhciBfY3VycnkxID0gcmVxdWlyZSgnLi9fY3VycnkxJyk7XG52YXIgX2N1cnJ5MiA9IHJlcXVpcmUoJy4vX2N1cnJ5MicpO1xuXG5cbi8qKlxuICogT3B0aW1pemVkIGludGVybmFsIHRocmVlLWFyaXR5IGN1cnJ5IGZ1bmN0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjdXJyeS5cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgY3VycmllZCBmdW5jdGlvbi5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBfY3VycnkzKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiBmMyhhLCBiLCBjKSB7XG4gICAgdmFyIG4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGlmIChuID09PSAwKSB7XG4gICAgICByZXR1cm4gZjM7XG4gICAgfSBlbHNlIGlmIChuID09PSAxICYmIGEgIT0gbnVsbCAmJiBhWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIGYzO1xuICAgIH0gZWxzZSBpZiAobiA9PT0gMSkge1xuICAgICAgcmV0dXJuIF9jdXJyeTIoZnVuY3Rpb24oYiwgYykgeyByZXR1cm4gZm4oYSwgYiwgYyk7IH0pO1xuICAgIH0gZWxzZSBpZiAobiA9PT0gMiAmJiBhICE9IG51bGwgJiYgYVsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYiAhPSBudWxsICYmIGJbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gZjM7XG4gICAgfSBlbHNlIGlmIChuID09PSAyICYmIGEgIT0gbnVsbCAmJiBhWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIF9jdXJyeTIoZnVuY3Rpb24oYSwgYykgeyByZXR1cm4gZm4oYSwgYiwgYyk7IH0pO1xuICAgIH0gZWxzZSBpZiAobiA9PT0gMiAmJiBiICE9IG51bGwgJiYgYlsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBfY3VycnkyKGZ1bmN0aW9uKGIsIGMpIHsgcmV0dXJuIGZuKGEsIGIsIGMpOyB9KTtcbiAgICB9IGVsc2UgaWYgKG4gPT09IDIpIHtcbiAgICAgIHJldHVybiBfY3VycnkxKGZ1bmN0aW9uKGMpIHsgcmV0dXJuIGZuKGEsIGIsIGMpOyB9KTtcbiAgICB9IGVsc2UgaWYgKG4gPT09IDMgJiYgYSAhPSBudWxsICYmIGFbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGIgIT0gbnVsbCAmJiBiWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICBjICE9IG51bGwgJiYgY1snQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBmMztcbiAgICB9IGVsc2UgaWYgKG4gPT09IDMgJiYgYSAhPSBudWxsICYmIGFbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGIgIT0gbnVsbCAmJiBiWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIF9jdXJyeTIoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gZm4oYSwgYiwgYyk7IH0pO1xuICAgIH0gZWxzZSBpZiAobiA9PT0gMyAmJiBhICE9IG51bGwgJiYgYVsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYyAhPSBudWxsICYmIGNbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gX2N1cnJ5MihmdW5jdGlvbihhLCBjKSB7IHJldHVybiBmbihhLCBiLCBjKTsgfSk7XG4gICAgfSBlbHNlIGlmIChuID09PSAzICYmIGIgIT0gbnVsbCAmJiBiWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICBjICE9IG51bGwgJiYgY1snQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBfY3VycnkyKGZ1bmN0aW9uKGIsIGMpIHsgcmV0dXJuIGZuKGEsIGIsIGMpOyB9KTtcbiAgICB9IGVsc2UgaWYgKG4gPT09IDMgJiYgYSAhPSBudWxsICYmIGFbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gX2N1cnJ5MShmdW5jdGlvbihhKSB7IHJldHVybiBmbihhLCBiLCBjKTsgfSk7XG4gICAgfSBlbHNlIGlmIChuID09PSAzICYmIGIgIT0gbnVsbCAmJiBiWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIF9jdXJyeTEoZnVuY3Rpb24oYikgeyByZXR1cm4gZm4oYSwgYiwgYyk7IH0pO1xuICAgIH0gZWxzZSBpZiAobiA9PT0gMyAmJiBjICE9IG51bGwgJiYgY1snQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBfY3VycnkxKGZ1bmN0aW9uKGMpIHsgcmV0dXJuIGZuKGEsIGIsIGMpOyB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZuKGEsIGIsIGMpO1xuICAgIH1cbiAgfTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIF9oYXMocHJvcCwgb2JqKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn07XG4iLCIvKipcbiAqIFRlc3RzIHdoZXRoZXIgb3Igbm90IGFuIG9iamVjdCBpcyBhbiBhcnJheS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWwgVGhlIG9iamVjdCB0byB0ZXN0LlxuICogQHJldHVybiB7Qm9vbGVhbn0gYHRydWVgIGlmIGB2YWxgIGlzIGFuIGFycmF5LCBgZmFsc2VgIG90aGVyd2lzZS5cbiAqIEBleGFtcGxlXG4gKlxuICogICAgICBfaXNBcnJheShbXSk7IC8vPT4gdHJ1ZVxuICogICAgICBfaXNBcnJheShudWxsKTsgLy89PiBmYWxzZVxuICogICAgICBfaXNBcnJheSh7fSk7IC8vPT4gZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIF9pc0FycmF5KHZhbCkge1xuICByZXR1cm4gKHZhbCAhPSBudWxsICYmXG4gICAgICAgICAgdmFsLmxlbmd0aCA+PSAwICYmXG4gICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XScpO1xufTtcbiIsInZhciBfeHdyYXAgPSByZXF1aXJlKCcuL194d3JhcCcpO1xudmFyIGJpbmQgPSByZXF1aXJlKCcuLi9iaW5kJyk7XG52YXIgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuLi9pc0FycmF5TGlrZScpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBfYXJyYXlSZWR1Y2UoeGYsIGFjYywgbGlzdCkge1xuICAgIHZhciBpZHggPSAwLCBsZW4gPSBsaXN0Lmxlbmd0aDtcbiAgICB3aGlsZSAoaWR4IDwgbGVuKSB7XG4gICAgICBhY2MgPSB4ZlsnQEB0cmFuc2R1Y2VyL3N0ZXAnXShhY2MsIGxpc3RbaWR4XSk7XG4gICAgICBpZiAoYWNjICYmIGFjY1snQEB0cmFuc2R1Y2VyL3JlZHVjZWQnXSkge1xuICAgICAgICBhY2MgPSBhY2NbJ0BAdHJhbnNkdWNlci92YWx1ZSddO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGlkeCArPSAxO1xuICAgIH1cbiAgICByZXR1cm4geGZbJ0BAdHJhbnNkdWNlci9yZXN1bHQnXShhY2MpO1xuICB9XG5cbiAgZnVuY3Rpb24gX2l0ZXJhYmxlUmVkdWNlKHhmLCBhY2MsIGl0ZXIpIHtcbiAgICB2YXIgc3RlcCA9IGl0ZXIubmV4dCgpO1xuICAgIHdoaWxlICghc3RlcC5kb25lKSB7XG4gICAgICBhY2MgPSB4ZlsnQEB0cmFuc2R1Y2VyL3N0ZXAnXShhY2MsIHN0ZXAudmFsdWUpO1xuICAgICAgaWYgKGFjYyAmJiBhY2NbJ0BAdHJhbnNkdWNlci9yZWR1Y2VkJ10pIHtcbiAgICAgICAgYWNjID0gYWNjWydAQHRyYW5zZHVjZXIvdmFsdWUnXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBzdGVwID0gaXRlci5uZXh0KCk7XG4gICAgfVxuICAgIHJldHVybiB4ZlsnQEB0cmFuc2R1Y2VyL3Jlc3VsdCddKGFjYyk7XG4gIH1cblxuICBmdW5jdGlvbiBfbWV0aG9kUmVkdWNlKHhmLCBhY2MsIG9iaikge1xuICAgIHJldHVybiB4ZlsnQEB0cmFuc2R1Y2VyL3Jlc3VsdCddKG9iai5yZWR1Y2UoYmluZCh4ZlsnQEB0cmFuc2R1Y2VyL3N0ZXAnXSwgeGYpLCBhY2MpKTtcbiAgfVxuXG4gIHZhciBzeW1JdGVyYXRvciA9ICh0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJykgPyBTeW1ib2wuaXRlcmF0b3IgOiAnQEBpdGVyYXRvcic7XG4gIHJldHVybiBmdW5jdGlvbiBfcmVkdWNlKGZuLCBhY2MsIGxpc3QpIHtcbiAgICBpZiAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBmbiA9IF94d3JhcChmbik7XG4gICAgfVxuICAgIGlmIChpc0FycmF5TGlrZShsaXN0KSkge1xuICAgICAgcmV0dXJuIF9hcnJheVJlZHVjZShmbiwgYWNjLCBsaXN0KTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBsaXN0LnJlZHVjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIF9tZXRob2RSZWR1Y2UoZm4sIGFjYywgbGlzdCk7XG4gICAgfVxuICAgIGlmIChsaXN0W3N5bUl0ZXJhdG9yXSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gX2l0ZXJhYmxlUmVkdWNlKGZuLCBhY2MsIGxpc3Rbc3ltSXRlcmF0b3JdKCkpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGxpc3QubmV4dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIF9pdGVyYWJsZVJlZHVjZShmbiwgYWNjLCBsaXN0KTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcigncmVkdWNlOiBsaXN0IG11c3QgYmUgYXJyYXkgb3IgaXRlcmFibGUnKTtcbiAgfTtcbn0pKCk7XG4iLCIvKipcbiAqIEFuIG9wdGltaXplZCwgcHJpdmF0ZSBhcnJheSBgc2xpY2VgIGltcGxlbWVudGF0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FyZ3VtZW50c3xBcnJheX0gYXJncyBUaGUgYXJyYXkgb3IgYXJndW1lbnRzIG9iamVjdCB0byBjb25zaWRlci5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbZnJvbT0wXSBUaGUgYXJyYXkgaW5kZXggdG8gc2xpY2UgZnJvbSwgaW5jbHVzaXZlLlxuICogQHBhcmFtIHtOdW1iZXJ9IFt0bz1hcmdzLmxlbmd0aF0gVGhlIGFycmF5IGluZGV4IHRvIHNsaWNlIHRvLCBleGNsdXNpdmUuXG4gKiBAcmV0dXJuIHtBcnJheX0gQSBuZXcsIHNsaWNlZCBhcnJheS5cbiAqIEBleGFtcGxlXG4gKlxuICogICAgICBfc2xpY2UoWzEsIDIsIDMsIDQsIDVdLCAxLCAzKTsgLy89PiBbMiwgM11cbiAqXG4gKiAgICAgIHZhciBmaXJzdFRocmVlQXJncyA9IGZ1bmN0aW9uKGEsIGIsIGMsIGQpIHtcbiAqICAgICAgICByZXR1cm4gX3NsaWNlKGFyZ3VtZW50cywgMCwgMyk7XG4gKiAgICAgIH07XG4gKiAgICAgIGZpcnN0VGhyZWVBcmdzKDEsIDIsIDMsIDQpOyAvLz0+IFsxLCAyLCAzXVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIF9zbGljZShhcmdzLCBmcm9tLCB0bykge1xuICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBjYXNlIDE6IHJldHVybiBfc2xpY2UoYXJncywgMCwgYXJncy5sZW5ndGgpO1xuICAgIGNhc2UgMjogcmV0dXJuIF9zbGljZShhcmdzLCBmcm9tLCBhcmdzLmxlbmd0aCk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHZhciBsaXN0ID0gW107XG4gICAgICB2YXIgaWR4ID0gMDtcbiAgICAgIHZhciBsZW4gPSBNYXRoLm1heCgwLCBNYXRoLm1pbihhcmdzLmxlbmd0aCwgdG8pIC0gZnJvbSk7XG4gICAgICB3aGlsZSAoaWR4IDwgbGVuKSB7XG4gICAgICAgIGxpc3RbaWR4XSA9IGFyZ3NbZnJvbSArIGlkeF07XG4gICAgICAgIGlkeCArPSAxO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGxpc3Q7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gWFdyYXAoZm4pIHtcbiAgICB0aGlzLmYgPSBmbjtcbiAgfVxuICBYV3JhcC5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9pbml0J10gPSBmdW5jdGlvbigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2luaXQgbm90IGltcGxlbWVudGVkIG9uIFhXcmFwJyk7XG4gIH07XG4gIFhXcmFwLnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL3Jlc3VsdCddID0gZnVuY3Rpb24oYWNjKSB7IHJldHVybiBhY2M7IH07XG4gIFhXcmFwLnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL3N0ZXAnXSA9IGZ1bmN0aW9uKGFjYywgeCkge1xuICAgIHJldHVybiB0aGlzLmYoYWNjLCB4KTtcbiAgfTtcblxuICByZXR1cm4gZnVuY3Rpb24gX3h3cmFwKGZuKSB7IHJldHVybiBuZXcgWFdyYXAoZm4pOyB9O1xufSgpKTtcbiIsInZhciBfY3VycnkxID0gcmVxdWlyZSgnLi9pbnRlcm5hbC9fY3VycnkxJyk7XG52YXIgX2lzQXJyYXkgPSByZXF1aXJlKCcuL2ludGVybmFsL19pc0FycmF5Jyk7XG5cblxuLyoqXG4gKiBUZXN0cyB3aGV0aGVyIG9yIG5vdCBhbiBvYmplY3QgaXMgc2ltaWxhciB0byBhbiBhcnJheS5cbiAqXG4gKiBAZnVuY1xuICogQG1lbWJlck9mIFJcbiAqIEBzaW5jZSB2MC41LjBcbiAqIEBjYXRlZ29yeSBUeXBlXG4gKiBAY2F0ZWdvcnkgTGlzdFxuICogQHNpZyAqIC0+IEJvb2xlYW5cbiAqIEBwYXJhbSB7Kn0geCBUaGUgb2JqZWN0IHRvIHRlc3QuXG4gKiBAcmV0dXJuIHtCb29sZWFufSBgdHJ1ZWAgaWYgYHhgIGhhcyBhIG51bWVyaWMgbGVuZ3RoIHByb3BlcnR5IGFuZCBleHRyZW1lIGluZGljZXMgZGVmaW5lZDsgYGZhbHNlYCBvdGhlcndpc2UuXG4gKiBAZXhhbXBsZVxuICpcbiAqICAgICAgUi5pc0FycmF5TGlrZShbXSk7IC8vPT4gdHJ1ZVxuICogICAgICBSLmlzQXJyYXlMaWtlKHRydWUpOyAvLz0+IGZhbHNlXG4gKiAgICAgIFIuaXNBcnJheUxpa2Uoe30pOyAvLz0+IGZhbHNlXG4gKiAgICAgIFIuaXNBcnJheUxpa2Uoe2xlbmd0aDogMTB9KTsgLy89PiBmYWxzZVxuICogICAgICBSLmlzQXJyYXlMaWtlKHswOiAnemVybycsIDk6ICduaW5lJywgbGVuZ3RoOiAxMH0pOyAvLz0+IHRydWVcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBfY3VycnkxKGZ1bmN0aW9uIGlzQXJyYXlMaWtlKHgpIHtcbiAgaWYgKF9pc0FycmF5KHgpKSB7IHJldHVybiB0cnVlOyB9XG4gIGlmICgheCkgeyByZXR1cm4gZmFsc2U7IH1cbiAgaWYgKHR5cGVvZiB4ICE9PSAnb2JqZWN0JykgeyByZXR1cm4gZmFsc2U7IH1cbiAgaWYgKHggaW5zdGFuY2VvZiBTdHJpbmcpIHsgcmV0dXJuIGZhbHNlOyB9XG4gIGlmICh4Lm5vZGVUeXBlID09PSAxKSB7IHJldHVybiAhIXgubGVuZ3RoOyB9XG4gIGlmICh4Lmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gdHJ1ZTsgfVxuICBpZiAoeC5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHguaGFzT3duUHJvcGVydHkoMCkgJiYgeC5oYXNPd25Qcm9wZXJ0eSh4Lmxlbmd0aCAtIDEpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn0pO1xuIiwidmFyIF9jdXJyeTEgPSByZXF1aXJlKCcuL2ludGVybmFsL19jdXJyeTEnKTtcbnZhciBfaGFzID0gcmVxdWlyZSgnLi9pbnRlcm5hbC9faGFzJyk7XG5cblxuLyoqXG4gKiBSZXR1cm5zIGEgbGlzdCBjb250YWluaW5nIHRoZSBuYW1lcyBvZiBhbGwgdGhlIGVudW1lcmFibGUgb3duXG4gKiBwcm9wZXJ0aWVzIG9mIHRoZSBzdXBwbGllZCBvYmplY3QuXG4gKiBOb3RlIHRoYXQgdGhlIG9yZGVyIG9mIHRoZSBvdXRwdXQgYXJyYXkgaXMgbm90IGd1YXJhbnRlZWQgdG8gYmVcbiAqIGNvbnNpc3RlbnQgYWNyb3NzIGRpZmZlcmVudCBKUyBwbGF0Zm9ybXMuXG4gKlxuICogQGZ1bmNcbiAqIEBtZW1iZXJPZiBSXG4gKiBAc2luY2UgdjAuMS4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAc2lnIHtrOiB2fSAtPiBba11cbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBleHRyYWN0IHByb3BlcnRpZXMgZnJvbVxuICogQHJldHVybiB7QXJyYXl9IEFuIGFycmF5IG9mIHRoZSBvYmplY3QncyBvd24gcHJvcGVydGllcy5cbiAqIEBleGFtcGxlXG4gKlxuICogICAgICBSLmtleXMoe2E6IDEsIGI6IDIsIGM6IDN9KTsgLy89PiBbJ2EnLCAnYicsICdjJ11cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gIC8vIGNvdmVyIElFIDwgOSBrZXlzIGlzc3Vlc1xuICB2YXIgaGFzRW51bUJ1ZyA9ICEoe3RvU3RyaW5nOiBudWxsfSkucHJvcGVydHlJc0VudW1lcmFibGUoJ3RvU3RyaW5nJyk7XG4gIHZhciBub25FbnVtZXJhYmxlUHJvcHMgPSBbJ2NvbnN0cnVjdG9yJywgJ3ZhbHVlT2YnLCAnaXNQcm90b3R5cGVPZicsICd0b1N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJywgJ2hhc093blByb3BlcnR5JywgJ3RvTG9jYWxlU3RyaW5nJ107XG5cbiAgdmFyIGNvbnRhaW5zID0gZnVuY3Rpb24gY29udGFpbnMobGlzdCwgaXRlbSkge1xuICAgIHZhciBpZHggPSAwO1xuICAgIHdoaWxlIChpZHggPCBsaXN0Lmxlbmd0aCkge1xuICAgICAgaWYgKGxpc3RbaWR4XSA9PT0gaXRlbSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlkeCArPSAxO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgcmV0dXJuIHR5cGVvZiBPYmplY3Qua2V5cyA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgX2N1cnJ5MShmdW5jdGlvbiBrZXlzKG9iaikge1xuICAgICAgcmV0dXJuIE9iamVjdChvYmopICE9PSBvYmogPyBbXSA6IE9iamVjdC5rZXlzKG9iaik7XG4gICAgfSkgOlxuICAgIF9jdXJyeTEoZnVuY3Rpb24ga2V5cyhvYmopIHtcbiAgICAgIGlmIChPYmplY3Qob2JqKSAhPT0gb2JqKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICAgIHZhciBwcm9wLCBrcyA9IFtdLCBuSWR4O1xuICAgICAgZm9yIChwcm9wIGluIG9iaikge1xuICAgICAgICBpZiAoX2hhcyhwcm9wLCBvYmopKSB7XG4gICAgICAgICAga3Nba3MubGVuZ3RoXSA9IHByb3A7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChoYXNFbnVtQnVnKSB7XG4gICAgICAgIG5JZHggPSBub25FbnVtZXJhYmxlUHJvcHMubGVuZ3RoIC0gMTtcbiAgICAgICAgd2hpbGUgKG5JZHggPj0gMCkge1xuICAgICAgICAgIHByb3AgPSBub25FbnVtZXJhYmxlUHJvcHNbbklkeF07XG4gICAgICAgICAgaWYgKF9oYXMocHJvcCwgb2JqKSAmJiAhY29udGFpbnMoa3MsIHByb3ApKSB7XG4gICAgICAgICAgICBrc1trcy5sZW5ndGhdID0gcHJvcDtcbiAgICAgICAgICB9XG4gICAgICAgICAgbklkeCAtPSAxO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4ga3M7XG4gICAgfSk7XG59KCkpO1xuIiwidmFyIF9jdXJyeTIgPSByZXF1aXJlKCcuL2ludGVybmFsL19jdXJyeTInKTtcbnZhciBrZXlzID0gcmVxdWlyZSgnLi9rZXlzJyk7XG5cblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgb2JqZWN0IHdpdGggdGhlIG93biBwcm9wZXJ0aWVzIG9mIGBhYFxuICogbWVyZ2VkIHdpdGggdGhlIG93biBwcm9wZXJ0aWVzIG9mIG9iamVjdCBgYmAuXG4gKlxuICogQGZ1bmNcbiAqIEBtZW1iZXJPZiBSXG4gKiBAc2luY2UgdjAuMS4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAc2lnIHtrOiB2fSAtPiB7azogdn0gLT4ge2s6IHZ9XG4gKiBAcGFyYW0ge09iamVjdH0gYVxuICogQHBhcmFtIHtPYmplY3R9IGJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBleGFtcGxlXG4gKlxuICogICAgICBSLm1lcmdlKHsgJ25hbWUnOiAnZnJlZCcsICdhZ2UnOiAxMCB9LCB7ICdhZ2UnOiA0MCB9KTtcbiAqICAgICAgLy89PiB7ICduYW1lJzogJ2ZyZWQnLCAnYWdlJzogNDAgfVxuICpcbiAqICAgICAgdmFyIHJlc2V0VG9EZWZhdWx0ID0gUi5tZXJnZShSLl9fLCB7eDogMH0pO1xuICogICAgICByZXNldFRvRGVmYXVsdCh7eDogNSwgeTogMn0pOyAvLz0+IHt4OiAwLCB5OiAyfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IF9jdXJyeTIoZnVuY3Rpb24gbWVyZ2UoYSwgYikge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIHZhciBrcyA9IGtleXMoYSk7XG4gIHZhciBpZHggPSAwO1xuICB3aGlsZSAoaWR4IDwga3MubGVuZ3RoKSB7XG4gICAgcmVzdWx0W2tzW2lkeF1dID0gYVtrc1tpZHhdXTtcbiAgICBpZHggKz0gMTtcbiAgfVxuICBrcyA9IGtleXMoYik7XG4gIGlkeCA9IDA7XG4gIHdoaWxlIChpZHggPCBrcy5sZW5ndGgpIHtcbiAgICByZXN1bHRba3NbaWR4XV0gPSBiW2tzW2lkeF1dO1xuICAgIGlkeCArPSAxO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59KTtcbiIsInZhciBfY3VycnkyID0gcmVxdWlyZSgnLi9pbnRlcm5hbC9fY3VycnkyJyk7XG5cblxuLyoqXG4gKiBSZXR1cm5zIGEgcGFydGlhbCBjb3B5IG9mIGFuIG9iamVjdCBjb250YWluaW5nIG9ubHkgdGhlIGtleXMgc3BlY2lmaWVkLiAgSWYgdGhlIGtleSBkb2VzIG5vdCBleGlzdCwgdGhlXG4gKiBwcm9wZXJ0eSBpcyBpZ25vcmVkLlxuICpcbiAqIEBmdW5jXG4gKiBAbWVtYmVyT2YgUlxuICogQHNpbmNlIHYwLjEuMFxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHNpZyBba10gLT4ge2s6IHZ9IC0+IHtrOiB2fVxuICogQHBhcmFtIHtBcnJheX0gbmFtZXMgYW4gYXJyYXkgb2YgU3RyaW5nIHByb3BlcnR5IG5hbWVzIHRvIGNvcHkgb250byBhIG5ldyBvYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBjb3B5IGZyb21cbiAqIEByZXR1cm4ge09iamVjdH0gQSBuZXcgb2JqZWN0IHdpdGggb25seSBwcm9wZXJ0aWVzIGZyb20gYG5hbWVzYCBvbiBpdC5cbiAqIEBzZWUgUi5vbWl0LCBSLnByb3BzXG4gKiBAZXhhbXBsZVxuICpcbiAqICAgICAgUi5waWNrKFsnYScsICdkJ10sIHthOiAxLCBiOiAyLCBjOiAzLCBkOiA0fSk7IC8vPT4ge2E6IDEsIGQ6IDR9XG4gKiAgICAgIFIucGljayhbJ2EnLCAnZScsICdmJ10sIHthOiAxLCBiOiAyLCBjOiAzLCBkOiA0fSk7IC8vPT4ge2E6IDF9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gX2N1cnJ5MihmdW5jdGlvbiBwaWNrKG5hbWVzLCBvYmopIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICB2YXIgaWR4ID0gMDtcbiAgd2hpbGUgKGlkeCA8IG5hbWVzLmxlbmd0aCkge1xuICAgIGlmIChuYW1lc1tpZHhdIGluIG9iaikge1xuICAgICAgcmVzdWx0W25hbWVzW2lkeF1dID0gb2JqW25hbWVzW2lkeF1dO1xuICAgIH1cbiAgICBpZHggKz0gMTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufSk7XG4iLCJ2YXIgX2N1cnJ5MyA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvX2N1cnJ5MycpO1xudmFyIF9yZWR1Y2UgPSByZXF1aXJlKCcuL2ludGVybmFsL19yZWR1Y2UnKTtcblxuXG4vKipcbiAqIFJldHVybnMgYSBzaW5nbGUgaXRlbSBieSBpdGVyYXRpbmcgdGhyb3VnaCB0aGUgbGlzdCwgc3VjY2Vzc2l2ZWx5IGNhbGxpbmcgdGhlIGl0ZXJhdG9yXG4gKiBmdW5jdGlvbiBhbmQgcGFzc2luZyBpdCBhbiBhY2N1bXVsYXRvciB2YWx1ZSBhbmQgdGhlIGN1cnJlbnQgdmFsdWUgZnJvbSB0aGUgYXJyYXksIGFuZFxuICogdGhlbiBwYXNzaW5nIHRoZSByZXN1bHQgdG8gdGhlIG5leHQgY2FsbC5cbiAqXG4gKiBUaGUgaXRlcmF0b3IgZnVuY3Rpb24gcmVjZWl2ZXMgdHdvIHZhbHVlczogKihhY2MsIHZhbHVlKSouICBJdCBtYXkgdXNlIGBSLnJlZHVjZWRgIHRvXG4gKiBzaG9ydGN1dCB0aGUgaXRlcmF0aW9uLlxuICpcbiAqIE5vdGU6IGBSLnJlZHVjZWAgZG9lcyBub3Qgc2tpcCBkZWxldGVkIG9yIHVuYXNzaWduZWQgaW5kaWNlcyAoc3BhcnNlIGFycmF5cyksIHVubGlrZVxuICogdGhlIG5hdGl2ZSBgQXJyYXkucHJvdG90eXBlLnJlZHVjZWAgbWV0aG9kLiBGb3IgbW9yZSBkZXRhaWxzIG9uIHRoaXMgYmVoYXZpb3IsIHNlZTpcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L3JlZHVjZSNEZXNjcmlwdGlvblxuICogQHNlZSBSLnJlZHVjZWRcbiAqXG4gKiBEaXNwYXRjaGVzIHRvIHRoZSBgcmVkdWNlYCBtZXRob2Qgb2YgdGhlIHRoaXJkIGFyZ3VtZW50LCBpZiBwcmVzZW50LlxuICpcbiAqIEBmdW5jXG4gKiBAbWVtYmVyT2YgUlxuICogQHNpbmNlIHYwLjEuMFxuICogQGNhdGVnb3J5IExpc3RcbiAqIEBzaWcgKGEsYiAtPiBhKSAtPiBhIC0+IFtiXSAtPiBhXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgaXRlcmF0b3IgZnVuY3Rpb24uIFJlY2VpdmVzIHR3byB2YWx1ZXMsIHRoZSBhY2N1bXVsYXRvciBhbmQgdGhlXG4gKiAgICAgICAgY3VycmVudCBlbGVtZW50IGZyb20gdGhlIGFycmF5LlxuICogQHBhcmFtIHsqfSBhY2MgVGhlIGFjY3VtdWxhdG9yIHZhbHVlLlxuICogQHBhcmFtIHtBcnJheX0gbGlzdCBUaGUgbGlzdCB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcmV0dXJuIHsqfSBUaGUgZmluYWwsIGFjY3VtdWxhdGVkIHZhbHVlLlxuICogQGV4YW1wbGVcbiAqXG4gKiAgICAgIHZhciBudW1iZXJzID0gWzEsIDIsIDNdO1xuICogICAgICB2YXIgYWRkID0gKGEsIGIpID0+IGEgKyBiO1xuICpcbiAqICAgICAgUi5yZWR1Y2UoYWRkLCAxMCwgbnVtYmVycyk7IC8vPT4gMTZcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBfY3VycnkzKF9yZWR1Y2UpO1xuIiwidmFyIF9jaGVja0Zvck1ldGhvZCA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvX2NoZWNrRm9yTWV0aG9kJyk7XG52YXIgX2N1cnJ5MyA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvX2N1cnJ5MycpO1xuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgZWxlbWVudHMgb2YgdGhlIGdpdmVuIGxpc3Qgb3Igc3RyaW5nIChvciBvYmplY3Qgd2l0aCBhIGBzbGljZWBcbiAqIG1ldGhvZCkgZnJvbSBgZnJvbUluZGV4YCAoaW5jbHVzaXZlKSB0byBgdG9JbmRleGAgKGV4Y2x1c2l2ZSkuXG4gKlxuICogRGlzcGF0Y2hlcyB0byB0aGUgYHNsaWNlYCBtZXRob2Qgb2YgdGhlIHRoaXJkIGFyZ3VtZW50LCBpZiBwcmVzZW50LlxuICpcbiAqIEBmdW5jXG4gKiBAbWVtYmVyT2YgUlxuICogQHNpbmNlIHYwLjEuNFxuICogQGNhdGVnb3J5IExpc3RcbiAqIEBzaWcgTnVtYmVyIC0+IE51bWJlciAtPiBbYV0gLT4gW2FdXG4gKiBAc2lnIE51bWJlciAtPiBOdW1iZXIgLT4gU3RyaW5nIC0+IFN0cmluZ1xuICogQHBhcmFtIHtOdW1iZXJ9IGZyb21JbmRleCBUaGUgc3RhcnQgaW5kZXggKGluY2x1c2l2ZSkuXG4gKiBAcGFyYW0ge051bWJlcn0gdG9JbmRleCBUaGUgZW5kIGluZGV4IChleGNsdXNpdmUpLlxuICogQHBhcmFtIHsqfSBsaXN0XG4gKiBAcmV0dXJuIHsqfVxuICogQGV4YW1wbGVcbiAqXG4gKiAgICAgIFIuc2xpY2UoMSwgMywgWydhJywgJ2InLCAnYycsICdkJ10pOyAgICAgICAgLy89PiBbJ2InLCAnYyddXG4gKiAgICAgIFIuc2xpY2UoMSwgSW5maW5pdHksIFsnYScsICdiJywgJ2MnLCAnZCddKTsgLy89PiBbJ2InLCAnYycsICdkJ11cbiAqICAgICAgUi5zbGljZSgwLCAtMSwgWydhJywgJ2InLCAnYycsICdkJ10pOyAgICAgICAvLz0+IFsnYScsICdiJywgJ2MnXVxuICogICAgICBSLnNsaWNlKC0zLCAtMSwgWydhJywgJ2InLCAnYycsICdkJ10pOyAgICAgIC8vPT4gWydiJywgJ2MnXVxuICogICAgICBSLnNsaWNlKDAsIDMsICdyYW1kYScpOyAgICAgICAgICAgICAgICAgICAgIC8vPT4gJ3JhbSdcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBfY3VycnkzKF9jaGVja0Zvck1ldGhvZCgnc2xpY2UnLCBmdW5jdGlvbiBzbGljZShmcm9tSW5kZXgsIHRvSW5kZXgsIGxpc3QpIHtcbiAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGxpc3QsIGZyb21JbmRleCwgdG9JbmRleCk7XG59KSk7XG4iLCJ2YXIgX2N1cnJ5MiA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvX2N1cnJ5MicpO1xudmFyIHNsaWNlID0gcmVxdWlyZSgnLi9zbGljZScpO1xuXG5cbi8qKlxuICogU3BsaXRzIGEgY29sbGVjdGlvbiBpbnRvIHNsaWNlcyBvZiB0aGUgc3BlY2lmaWVkIGxlbmd0aC5cbiAqXG4gKiBAZnVuY1xuICogQG1lbWJlck9mIFJcbiAqIEBzaW5jZSB2MC4xNi4wXG4gKiBAY2F0ZWdvcnkgTGlzdFxuICogQHNpZyBOdW1iZXIgLT4gW2FdIC0+IFtbYV1dXG4gKiBAc2lnIE51bWJlciAtPiBTdHJpbmcgLT4gW1N0cmluZ11cbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcGFyYW0ge0FycmF5fSBsaXN0XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBleGFtcGxlXG4gKlxuICogICAgICBSLnNwbGl0RXZlcnkoMywgWzEsIDIsIDMsIDQsIDUsIDYsIDddKTsgLy89PiBbWzEsIDIsIDNdLCBbNCwgNSwgNl0sIFs3XV1cbiAqICAgICAgUi5zcGxpdEV2ZXJ5KDMsICdmb29iYXJiYXonKTsgLy89PiBbJ2ZvbycsICdiYXInLCAnYmF6J11cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBfY3VycnkyKGZ1bmN0aW9uIHNwbGl0RXZlcnkobiwgbGlzdCkge1xuICBpZiAobiA8PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCB0byBzcGxpdEV2ZXJ5IG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyJyk7XG4gIH1cbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIgaWR4ID0gMDtcbiAgd2hpbGUgKGlkeCA8IGxpc3QubGVuZ3RoKSB7XG4gICAgcmVzdWx0LnB1c2goc2xpY2UoaWR4LCBpZHggKz0gbiwgbGlzdCkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59KTtcbiIsInZhciBfY3VycnkyID0gcmVxdWlyZSgnLi9pbnRlcm5hbC9fY3VycnkyJyk7XG5cblxuLyoqXG4gKiBDYWxscyBhbiBpbnB1dCBmdW5jdGlvbiBgbmAgdGltZXMsIHJldHVybmluZyBhbiBhcnJheSBjb250YWluaW5nIHRoZSByZXN1bHRzIG9mIHRob3NlXG4gKiBmdW5jdGlvbiBjYWxscy5cbiAqXG4gKiBgZm5gIGlzIHBhc3NlZCBvbmUgYXJndW1lbnQ6IFRoZSBjdXJyZW50IHZhbHVlIG9mIGBuYCwgd2hpY2ggYmVnaW5zIGF0IGAwYCBhbmQgaXNcbiAqIGdyYWR1YWxseSBpbmNyZW1lbnRlZCB0byBgbiAtIDFgLlxuICpcbiAqIEBmdW5jXG4gKiBAbWVtYmVyT2YgUlxuICogQHNpbmNlIHYwLjIuM1xuICogQGNhdGVnb3J5IExpc3RcbiAqIEBzaWcgKGkgLT4gYSkgLT4gaSAtPiBbYV1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBpbnZva2UuIFBhc3NlZCBvbmUgYXJndW1lbnQsIHRoZSBjdXJyZW50IHZhbHVlIG9mIGBuYC5cbiAqIEBwYXJhbSB7TnVtYmVyfSBuIEEgdmFsdWUgYmV0d2VlbiBgMGAgYW5kIGBuIC0gMWAuIEluY3JlbWVudHMgYWZ0ZXIgZWFjaCBmdW5jdGlvbiBjYWxsLlxuICogQHJldHVybiB7QXJyYXl9IEFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIHJldHVybiB2YWx1ZXMgb2YgYWxsIGNhbGxzIHRvIGBmbmAuXG4gKiBAZXhhbXBsZVxuICpcbiAqICAgICAgUi50aW1lcyhSLmlkZW50aXR5LCA1KTsgLy89PiBbMCwgMSwgMiwgMywgNF1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBfY3VycnkyKGZ1bmN0aW9uIHRpbWVzKGZuLCBuKSB7XG4gIHZhciBsZW4gPSBOdW1iZXIobik7XG4gIHZhciBsaXN0ID0gbmV3IEFycmF5KGxlbik7XG4gIHZhciBpZHggPSAwO1xuICB3aGlsZSAoaWR4IDwgbGVuKSB7XG4gICAgbGlzdFtpZHhdID0gZm4oaWR4KTtcbiAgICBpZHggKz0gMTtcbiAgfVxuICByZXR1cm4gbGlzdDtcbn0pO1xuIiwidmFyIF9jdXJyeTEgPSByZXF1aXJlKCcuL2ludGVybmFsL19jdXJyeTEnKTtcbnZhciBrZXlzID0gcmVxdWlyZSgnLi9rZXlzJyk7XG5cblxuLyoqXG4gKiBSZXR1cm5zIGEgbGlzdCBvZiBhbGwgdGhlIGVudW1lcmFibGUgb3duIHByb3BlcnRpZXMgb2YgdGhlIHN1cHBsaWVkIG9iamVjdC5cbiAqIE5vdGUgdGhhdCB0aGUgb3JkZXIgb2YgdGhlIG91dHB1dCBhcnJheSBpcyBub3QgZ3VhcmFudGVlZCBhY3Jvc3NcbiAqIGRpZmZlcmVudCBKUyBwbGF0Zm9ybXMuXG4gKlxuICogQGZ1bmNcbiAqIEBtZW1iZXJPZiBSXG4gKiBAc2luY2UgdjAuMS4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAc2lnIHtrOiB2fSAtPiBbdl1cbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBleHRyYWN0IHZhbHVlcyBmcm9tXG4gKiBAcmV0dXJuIHtBcnJheX0gQW4gYXJyYXkgb2YgdGhlIHZhbHVlcyBvZiB0aGUgb2JqZWN0J3Mgb3duIHByb3BlcnRpZXMuXG4gKiBAZXhhbXBsZVxuICpcbiAqICAgICAgUi52YWx1ZXMoe2E6IDEsIGI6IDIsIGM6IDN9KTsgLy89PiBbMSwgMiwgM11cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBfY3VycnkxKGZ1bmN0aW9uIHZhbHVlcyhvYmopIHtcbiAgdmFyIHByb3BzID0ga2V5cyhvYmopO1xuICB2YXIgbGVuID0gcHJvcHMubGVuZ3RoO1xuICB2YXIgdmFscyA9IFtdO1xuICB2YXIgaWR4ID0gMDtcbiAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgIHZhbHNbaWR4XSA9IG9ialtwcm9wc1tpZHhdXTtcbiAgICBpZHggKz0gMTtcbiAgfVxuICByZXR1cm4gdmFscztcbn0pO1xuIiwidmFyIG1lcmdlID0gcmVxdWlyZSgncmFtZGEvc3JjL21lcmdlJyk7XG52YXIgcGljayA9IHJlcXVpcmUoJ3JhbWRhL3NyYy9waWNrJyk7XG52YXIgdmFsdWVzID0gcmVxdWlyZSgncmFtZGEvc3JjL3ZhbHVlcycpO1xudmFyIHJlZHVjZSA9IHJlcXVpcmUoJ3JhbWRhL3NyYy9yZWR1Y2UnKTtcbnZhciBzdHlsZXMgPSByZXF1aXJlKCcuL3N0eWxlcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkU3R5bGUoZXh0ZW5kZWRTdHlsZSwgc3R5bGVOYW1lcykge1xuICB2YXIgc3R5bGVOYW1lc1dpdGhEZWZhdWx0ID0gWydvdERlZmF1bHRzJ10uY29uY2F0KHN0eWxlTmFtZXMgfHwgW10pO1xuICB2YXIgc3R5bGVzV2l0aERlZmF1bHQgPSB2YWx1ZXMocGljayhzdHlsZU5hbWVzV2l0aERlZmF1bHQsIHN0eWxlcykpO1xuICB2YXIgc3R5bGVzV2l0aEV4dGVuZGVkID0gc3R5bGVzV2l0aERlZmF1bHQuY29uY2F0KFtleHRlbmRlZFN0eWxlIHx8IHt9XSk7XG4gIHJldHVybiByZWR1Y2UobWVyZ2UsIHt9LCBzdHlsZXNXaXRoRXh0ZW5kZWQpO1xufVxuIiwidmFyIG1lcmdlID0gcmVxdWlyZSgncmFtZGEvc3JjL21lcmdlJyk7XG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgYm94U2l6aW5nOiAnYm9yZGVyLWJveCcsXG4gIC8vIGZvbnRGYW1pbHk6ICdcXFwic291cmNlLXNhbnMtcHJvXFxcIixcXFwiSGVsdmV0aWNhIE5ldWVcXFwiLEhlbHZldGljYSxBcmlhbCxzYW5zLXNlcmlmJyxcbiAgZm9udEZhbWlseTogJ1wiSGVsdmV0aWNhIE5ldWUgTGlnaHRcIiwgXCJIZWx2ZXRpY2FOZXVlLUxpZ2h0XCIsIFwiSGVsdmV0aWNhIE5ldWVcIiwgQ2FsaWJyaSwgSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZicsXG4gIGZvbnRTaXplOiAnMTZweCcsXG4gIGZvbnRTdHlsZTogJ25vcm1hbCcsXG4gIGZvbnRXZWlnaHQ6IDQwMCxcbiAgbWFyZ2luOiAwLFxuICBwYWRkaW5nOiAwXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkU3R5bGUoc3R5bGUpIHtcbiAgcmV0dXJuIG1lcmdlKGRlZmF1bHRzLCBzdHlsZSk7XG59XG4iLCJ2YXIgaGcgPSByZXF1aXJlKCdtZXJjdXJ5Jyk7XG52YXIgYnVpbGRTdHlsZSA9IHJlcXVpcmUoJy4uLy4uL2J1aWxkLXN0eWxlJyk7XG52YXIgcG9wVXAgPSByZXF1aXJlKCcuL3BvcC11cCcpO1xudmFyIGRhdGVGb3JtYXQgPSByZXF1aXJlKCdkYXRlZm9ybWF0Jyk7XG52YXIgbGFuZ3VhZ2VzID0gcmVxdWlyZSgnLi4vLi4vbGFuZ3VhZ2VzJyk7XG52YXIgdHJhbnNsYXRpb25zID0gcmVxdWlyZSgnLi90cmFuc2xhdGlvbnMnKTtcblxudmFyIGggPSBoZy5oO1xuXG52YXIgc3R5bGVzID0ge1xuICBkYXRlUGlja2VyOiBidWlsZFN0eWxlKHtcbiAgICBib3JkZXJMZWZ0OiAnMXB4IHNvbGlkIHJnYmEoMCwwLDAsLjA4KSdcbiAgfSwgWydwaWNrZXJTZWxlY3RvciddKSxcbiAgZGF0ZVBpY2tlckxpbms6IGJ1aWxkU3R5bGUoe30sIFsncGlja2VyTGFiZWwnXSlcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGF0ZVBpY2tlcihzdGF0ZSkge1xuICB2YXIgc2VsZWN0ZWREYXRlID0gc3RhdGUudmlld01vZGVsLnNlbGVjdGVkRGF0ZTtcbiAgdmFyIGRhdGUgPSBuZXcgRGF0ZShzZWxlY3RlZERhdGUueWVhciwgc2VsZWN0ZWREYXRlLm1vbnRoLCBzZWxlY3RlZERhdGUuZGF5KTtcbiAgdmFyIGxhbmd1YWdlID0gbGFuZ3VhZ2VzW3N0YXRlLnZpZXdNb2RlbC5sYW5ndWFnZV07XG4gIHZhciB0cmFuc2xhdGlvbiA9IHRyYW5zbGF0aW9uc1tzdGF0ZS52aWV3TW9kZWwubG9jYWxlXTtcblxuICAvLyBGSVhNRTogc2hvdWxkIG9ubHkgaGF2ZSB0byBydW4gb24gc3RhdGUgaW5pdGlhbGl6YXRpb25cbiAgZGF0ZUZvcm1hdC5pMThuID0ge1xuICAgIGRheU5hbWVzOiB0cmFuc2xhdGlvbi53ZWVrZGF5c1Nob3J0LmNvbmNhdCh0cmFuc2xhdGlvbi53ZWVrZGF5c0Z1bGwpLFxuICAgIG1vbnRoTmFtZXM6IHRyYW5zbGF0aW9uLm1vbnRoc1Nob3J0LmNvbmNhdCh0cmFuc2xhdGlvbi5tb250aHNGdWxsKVxuICB9O1xuXG4gIHJldHVybiBoKCdkaXYnLCB7XG4gICAgc3R5bGU6IHN0eWxlcy5kYXRlUGlja2VyXG4gIH0sIFtcbiAgICBoKCdhJywge1xuICAgICAgc3R5bGU6IHN0eWxlcy5kYXRlUGlja2VyTGluayxcbiAgICAgICdldi1jbGljayc6IGhnLnNlbmQoc3RhdGUuY2hhbm5lbHMudG9nZ2xlRGF0ZVBpY2tlcilcbiAgICB9LCBkYXRlRm9ybWF0KGRhdGUsIGxhbmd1YWdlLmRhdGVGb3JtYXQpKSxcbiAgICAvLyB9LCBkYXRlRm9ybWF0KGRhdGUsICdkIG1tbW0sIHl5eXknKSksXG4gICAgcG9wVXAoc3RhdGUpXG4gIF0pO1xufVxuIiwidmFyIGhnID0gcmVxdWlyZSgnbWVyY3VyeScpO1xudmFyIHNwbGl0RXZlcnkgPSByZXF1aXJlKCdyYW1kYS9zcmMvc3BsaXRFdmVyeScpO1xudmFyIG1lcmdlID0gcmVxdWlyZSgncmFtZGEvc3JjL21lcmdlJyk7XG52YXIgdHJhbnNsYXRpb25zID0gcmVxdWlyZSgnLi90cmFuc2xhdGlvbnMnKTtcbnZhciBidWlsZFN0eWxlID0gcmVxdWlyZSgnLi9idWlsZC1zdHlsZScpO1xuXG52YXIgaCA9IGhnLmg7XG52YXIgc3R5bGVzID0ge1xuICBwb3BVcDogYnVpbGRTdHlsZSh7XG4gICAgd2lkdGg6ICcyMmVtJyxcbiAgICBoZWlnaHQ6ICcxOGVtJyxcbiAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICBsZWZ0OiAnY2FsYyg1MCUgLSAxMXJlbSknLFxuICAgIGJvcmRlclJhZGl1czogJzNweCcsXG4gICAgYm94U2hhZG93OiAnMCAwIDAgMXB4IHJnYmEoMCwwLDAsLjEpJyxcbiAgICBwYWRkaW5nOiAnMWVtJyxcbiAgICBib3hTaXppbmc6ICdib3JkZXItYm94JyxcbiAgfSksXG4gIHBvcFVwSGVhZGVyOiBidWlsZFN0eWxlKHtcbiAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnXG4gIH0pLFxuICBwb3BVcFRhYmxlOiBidWlsZFN0eWxlKHtcbiAgICBib3hTaXppbmc6ICdib3JkZXItYm94JyxcbiAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgIGJvcmRlckNvbGxhcHNlOiAnY29sbGFwc2UnLFxuICAgIGJvcmRlclNwYWNpbmc6IDAsXG4gICAgdGFibGVMYXlvdXQ6ICdmaXhlZCcsXG4gICAgZm9udFNpemU6ICdpbmhlcml0JyxcbiAgICB3aWR0aDogJzEwMCUnLFxuICAgIG1hcmdpblRvcDogJzFyZW0nLFxuICB9KSxcbiAgZGF5VGQ6IGJ1aWxkU3R5bGUoe1xuICAgIGxpbmVIZWlnaHQ6IDEuOTVcbiAgfSksXG4gIGRheVRkQ29udGVudDogYnVpbGRTdHlsZSh7XG4gICAgbWFyZ2luOiAnMCBhdXRvJyxcbiAgICBoZWlnaHQ6ICcyZW0nLFxuICAgIHdpZHRoOiAnMmVtJyxcbiAgICBib3JkZXJSYWRpdXM6ICcxMDAlJ1xuICB9KVxufTtcblxudmFyIGNvbG9ycyA9IHtcbiAgcHJpbWFyeTogJyNEQTM3NDMnLFxuICBmYWRlZDogJyNmN2Q3ZDknXG59O1xuXG4vLyBzZWxlY3RlZCBiYWNrZ3JvdW5kIGNvbG9yOiAjREEzNzQzXG4vL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwb3BVcChzdGF0ZSkge1xuICB2YXIgZGlzcGxheWVkRGF0ZSA9IHN0YXRlLnZpZXdNb2RlbC5kaXNwbGF5ZWREYXRlO1xuICB2YXIgbW9udGggPSBzdGF0ZVxuICAgIC52aWV3TW9kZWxcbiAgICAueWVhcnNbZGlzcGxheWVkRGF0ZS55ZWFyXVtkaXNwbGF5ZWREYXRlLm1vbnRoXTtcblxuICB2YXIgdHJhbnNsYXRpb24gPSBtZXJnZSh0cmFuc2xhdGlvbnNbJ2VuLVVTJ10sIHRyYW5zbGF0aW9uc1tzdGF0ZS52aWV3TW9kZWwubG9jYWxlXSB8fCB7fSk7XG5cbiAgdmFyIGRheUluZGV4ID0gMDtcbiAgLy8gdXNlIG9uIG1vdXNlb3ZlclxuICB2YXIgZGF5VHJzID0gc3BsaXRFdmVyeSg3LCBtb250aC5kaXNwbGF5ZWREYXlzKVxuICAgIC5tYXAoZnVuY3Rpb24gdHJGcm9tV2Vlayh3ZWVrKSB7XG4gICAgICB2YXIgZGF5VGRzID0gd2Vlay5tYXAoZnVuY3Rpb24gdGRGcm9tRGF5KGRheSkge1xuICAgICAgICB2YXIgc3R5bGVUZENvbnRlbnQgPSBzdGF0ZS52aWV3TW9kZWwuaGlnaGxpZ2h0ZWREYXlJbmRleCA9PT0gZGF5SW5kZXggP1xuICAgICAgICAgIG1lcmdlKHN0eWxlcy5kYXlUZENvbnRlbnQsIHtcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogY29sb3JzLmZhZGVkLFxuICAgICAgICAgICAgY29sb3I6IGNvbG9ycy5wcmltYXJ5XG4gICAgICAgICAgfSkgOlxuICAgICAgICAgIHN0eWxlcy5kYXlUZENvbnRlbnQ7XG5cbiAgICAgICAgdmFyIHRkID0gaCgndGQnLCB7XG4gICAgICAgICAgc3R5bGU6IHN0eWxlcy5kYXlUZCxcbiAgICAgICAgICAnZXYtbW91c2VvdXQnOiBoZy5zZW5kKHN0YXRlLmNoYW5uZWxzLm1vdXNlb3V0RGF5LCBkYXlJbmRleCksXG4gICAgICAgICAgJ2V2LW1vdXNlb3Zlcic6IGhnLnNlbmQoc3RhdGUuY2hhbm5lbHMubW91c2VvdmVyRGF5LCBkYXlJbmRleCksXG4gICAgICAgIH0sIGgoJ2RpdicsIHsgc3R5bGU6IHN0eWxlVGRDb250ZW50IH0sIFN0cmluZyhkYXkuZGF5T2ZNb250aCkpKTtcblxuICAgICAgICBkYXlJbmRleCsrO1xuICAgICAgICByZXR1cm4gdGQ7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBoKCd0cicsIGRheVRkcyk7XG4gICAgfSk7XG5cbiAgdmFyIGRheVRocyA9IHRyYW5zbGF0aW9uLndlZWtkYXlzU2hvcnQubWFwKGZ1bmN0aW9uIGJ1aWxkRGF5VGgoZGF5KSB7XG4gICAgcmV0dXJuIGgoJ3RoJywgZGF5KTtcbiAgfSk7XG5cbiAgdmFyIGV4dGVuZGVkUG9wVXBTdHlsZSA9IHt9O1xuICBpZiAoc3RhdGUudmlld01vZGVsLmlzRGF0ZVBpY2tlclRvcCkge1xuICAgIGV4dGVuZGVkUG9wVXBTdHlsZS50b3AgPSAnLScgKyBzdHlsZXMucG9wVXAuaGVpZ2h0O1xuICB9XG5cbiAgaWYgKCFzdGF0ZS52aWV3TW9kZWwub3Blbikge1xuICAgIGV4dGVuZGVkUG9wVXBTdHlsZS5oZWlnaHQgPSAwO1xuICAgIGV4dGVuZGVkUG9wVXBTdHlsZS5vcGFjaXR5ID0gMDtcbiAgICB2YXIgdHJhbnNsYXRlWSA9IHN0YXRlLnZpZXdNb2RlbC5pc0RhdGVQaWNrZXJUb3AgPyAnMScgOiAnLTEnO1xuICAgIGV4dGVuZGVkUG9wVXBTdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWSgnICsgdHJhbnNsYXRlWSArICdlbSkgcGVyc3BlY3RpdmUoNjAwcHgpJztcbiAgfVxuICBleHRlbmRlZFBvcFVwU3R5bGUudHJhbnNpdGlvbiA9ICd0cmFuc2Zvcm0gMC4xNXMgZWFzZS1vdXQsIG9wYWNpdHkgMC4xNXMgZWFzZS1vdXQsIHBvc2l0aW9uIDAuMTVzIGVhc2Utb3V0LCBoZWlnaHQgMHMgMC4xNXMnO1xuICB2YXIgcG9wVXBTdHlsZSA9IG1lcmdlKHN0eWxlcy5wb3BVcCwgZXh0ZW5kZWRQb3BVcFN0eWxlKTtcblxuICByZXR1cm4gaCgnZGl2Jywge1xuICAgIHN0eWxlOiBwb3BVcFN0eWxlXG4gIH0sIFtcbiAgICBoKCdkaXYnLCB7XG4gICAgICBzdHlsZTogc3R5bGVzLnBvcFVwSGVhZGVyXG4gICAgfSwgW1xuICAgICAgdHJhbnNsYXRpb24ubW9udGhzRnVsbFtkaXNwbGF5ZWREYXRlLm1vbnRoXSArICcgJyArIGRpc3BsYXllZERhdGUueWVhcixcbiAgICAgIGgoJ2RpdicsIHtcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICB3aWR0aDogJzMwcHgnLFxuICAgICAgICAgIGhlaWdodDogJzMwcHgnLFxuICAgICAgICAgIGZsb2F0OiAnbGVmdCcsXG4gICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnYmxhY2snXG4gICAgICAgIH0sXG4gICAgICAgICdldi1jbGljayc6IGhnLnNlbmQoc3RhdGUuY2hhbm5lbHMubGFzdE1vbnRoKVxuICAgICAgfSksXG4gICAgICBoKCdkaXYnLCB7XG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgaGVpZ2h0OiAnMzBweCcsXG4gICAgICAgICAgd2lkdGg6ICczMHB4JyxcbiAgICAgICAgICBmbG9hdDogJ3JpZ2h0JyxcbiAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICdibGFjaydcbiAgICAgICAgfSxcbiAgICAgICAgJ2V2LWNsaWNrJzogaGcuc2VuZChzdGF0ZS5jaGFubmVscy5uZXh0TW9udGgpXG4gICAgICB9KVxuICAgIF0pLFxuXG4gICAgaCgndGFibGUnLCB7XG4gICAgICBzdHlsZTogc3R5bGVzLnBvcFVwVGFibGVcbiAgICB9LCBbXG4gICAgICBoKCd0aGVhZCcsIGgoJ3RyJywgeyBzdHlsZTogeyBoZWlnaHQ6ICcyZW0nIH0gfSwgZGF5VGhzKSksXG4gICAgICBoKCd0Ym9keScsIGRheVRycylcbiAgICBdKVxuICBdKTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcIm1vbnRoc0Z1bGxcIjpbXCLRj9C90YPQsNGA0LhcIixcItGE0LXQstGA0YPQsNGA0LhcIixcItC80LDRgNGCXCIsXCLQsNC/0YDQuNC7XCIsXCLQvNCw0LlcIixcItGO0L3QuFwiLFwi0Y7Qu9C4XCIsXCLQsNCy0LPRg9GB0YJcIixcItGB0LXQv9GC0LXQvNCy0YDQuFwiLFwi0L7QutGC0L7QvNCy0YDQuFwiLFwi0L3QvtC10LzQstGA0LhcIixcItC00LXQutC10LzQstGA0LhcIl0sXCJtb250aHNTaG9ydFwiOltcItGP0L3RgFwiLFwi0YTQtdCyXCIsXCLQvNCw0YBcIixcItCw0L/RgFwiLFwi0LzQsNC5XCIsXCLRjtC90LhcIixcItGO0LvQuFwiLFwi0LDQstCzXCIsXCLRgdC10L9cIixcItC+0LrRglwiLFwi0L3QvtC1XCIsXCLQtNC10LpcIl0sXCJ3ZWVrZGF5c0Z1bGxcIjpbXCLQvdC10LTQtdC70Y9cIixcItC/0L7QvdC10LTQtdC70L3QuNC6XCIsXCLQstGC0L7RgNC90LjQulwiLFwi0YHRgNGP0LTQsFwiLFwi0YfQtdGC0LLRitGA0YLRitC6XCIsXCLQv9C10YLRitC6XCIsXCLRgdGK0LHQvtGC0LBcIl0sXCJ3ZWVrZGF5c1Nob3J0XCI6W1wi0L3QtFwiLFwi0L/QvVwiLFwi0LLRglwiLFwi0YHRgFwiLFwi0YfRglwiLFwi0L/RglwiLFwi0YHQsVwiXSxcInRvZGF5XCI6XCLQtNC90LXRgVwiLFwiY2xlYXJcIjpcItC40LfRgtGA0LjQstCw0LxcIixcImZpcnN0RGF5XCI6MSxcImZvcm1hdFwiOlwiZCBtbW1tIHl5eXkg0LMuXCIsXCJmb3JtYXRTdWJtaXRcIjpcInl5eXkvbW0vZGRcIn0iLCJtb2R1bGUuZXhwb3J0cz17XCJtb250aHNGdWxsXCI6W1wiamFudWFyXCIsXCJmZWJydWFyXCIsXCJtYXJ0XCIsXCJhcHJpbFwiLFwibWFqXCIsXCJqdW5pXCIsXCJqdWxpXCIsXCJhdWd1c3RcIixcInNlcHRlbWJhclwiLFwib2t0b2JhclwiLFwibm92ZW1iYXJcIixcImRlY2VtYmFyXCJdLFwibW9udGhzU2hvcnRcIjpbXCJqYW5cIixcImZlYlwiLFwibWFyXCIsXCJhcHJcIixcIm1halwiLFwianVuXCIsXCJqdWxcIixcImF1Z1wiLFwic2VwXCIsXCJva3RcIixcIm5vdlwiLFwiZGVjXCJdLFwid2Vla2RheXNGdWxsXCI6W1wibmVkamVsamFcIixcInBvbmVkamVsamFrXCIsXCJ1dG9yYWtcIixcInNyaWplZGFcIixcImNldHZydGFrXCIsXCJwZXRha1wiLFwic3Vib3RhXCJdLFwid2Vla2RheXNTaG9ydFwiOltcIm5lXCIsXCJwb1wiLFwidXRcIixcInNyXCIsXCLEjWVcIixcInBlXCIsXCJzdVwiXSxcInRvZGF5XCI6XCJkYW5hc1wiLFwiY2xlYXJcIjpcIml6YnJpc2F0aVwiLFwiZmlyc3REYXlcIjoxLFwiZm9ybWF0XCI6XCJkZC4gbW1tbSB5eXl5LlwiLFwiZm9ybWF0U3VibWl0XCI6XCJ5eXl5L21tL2RkXCJ9IiwibW9kdWxlLmV4cG9ydHM9e1wibW9udGhzRnVsbFwiOltcIkdlbmVyXCIsXCJGZWJyZXJcIixcIk1hcsOnXCIsXCJBYnJpbFwiLFwiTWFpZ1wiLFwianVueVwiLFwiSnVsaW9sXCIsXCJBZ29zdFwiLFwiU2V0ZW1icmVcIixcIk9jdHVicmVcIixcIk5vdmVtYnJlXCIsXCJEZXNlbWJyZVwiXSxcIm1vbnRoc1Nob3J0XCI6W1wiR2VuXCIsXCJGZWJcIixcIk1hclwiLFwiQWJyXCIsXCJNYWlcIixcIkp1blwiLFwiSnVsXCIsXCJBZ29cIixcIlNldFwiLFwiT2N0XCIsXCJOb3ZcIixcIkRlc1wiXSxcIndlZWtkYXlzRnVsbFwiOltcImRpdW1lbmdlXCIsXCJkaWxsdW5zXCIsXCJkaW1hcnRzXCIsXCJkaW1lY3Jlc1wiLFwiZGlqb3VzXCIsXCJkaXZlbmRyZXNcIixcImRpc3NhYnRlXCJdLFwid2Vla2RheXNTaG9ydFwiOltcImRpdVwiLFwiZGlsXCIsXCJkaW1cIixcImRtY1wiLFwiZGlqXCIsXCJkaXZcIixcImRpc1wiXSxcInRvZGF5XCI6XCJhdnVpXCIsXCJjbGVhclwiOlwiZXNib3JyYXJcIixcImNsb3NlXCI6XCJ0YW5jYXJcIixcImZpcnN0RGF5XCI6MSxcImZvcm1hdFwiOlwiZGRkZCBkICFkZSBtbW1tICFkZSB5eXl5XCIsXCJmb3JtYXRTdWJtaXRcIjpcInl5eXkvbW0vZGRcIn0iLCJtb2R1bGUuZXhwb3J0cz17XCJtb250aHNGdWxsXCI6W1wibGVkZW5cIixcIsO6bm9yXCIsXCJixZllemVuXCIsXCJkdWJlblwiLFwia3bEm3RlblwiLFwixI1lcnZlblwiLFwixI1lcnZlbmVjXCIsXCJzcnBlblwiLFwiesOhxZnDrVwiLFwixZnDrWplblwiLFwibGlzdG9wYWRcIixcInByb3NpbmVjXCJdLFwibW9udGhzU2hvcnRcIjpbXCJsZWRcIixcIsO6bm9cIixcImLFmWVcIixcImR1YlwiLFwia3bEm1wiLFwixI1lclwiLFwixI12Y1wiLFwic3JwXCIsXCJ6w6HFmVwiLFwixZnDrWpcIixcImxpc1wiLFwicHJvXCJdLFwid2Vla2RheXNGdWxsXCI6W1wibmVkxJtsZVwiLFwicG9uZMSbbMOtXCIsXCLDunRlcsO9XCIsXCJzdMWZZWRhXCIsXCLEjXR2cnRla1wiLFwicMOhdGVrXCIsXCJzb2JvdGFcIl0sXCJ3ZWVrZGF5c1Nob3J0XCI6W1wibmVcIixcInBvXCIsXCLDunRcIixcInN0XCIsXCLEjXRcIixcInDDoVwiLFwic29cIl0sXCJ0b2RheVwiOlwiZG5lc1wiLFwiY2xlYXJcIjpcInZ5bWF6YXRcIixcImZpcnN0RGF5XCI6MSxcImZvcm1hdFwiOlwiZC4gbW1tbSB5eXl5XCIsXCJmb3JtYXRTdWJtaXRcIjpcInl5eXkvbW0vZGRcIn0iLCJtb2R1bGUuZXhwb3J0cz17XCJtb250aHNGdWxsXCI6W1wiamFudWFyXCIsXCJmZWJydWFyXCIsXCJtYXJ0c1wiLFwiYXByaWxcIixcIm1halwiLFwianVuaVwiLFwianVsaVwiLFwiYXVndXN0XCIsXCJzZXB0ZW1iZXJcIixcIm9rdG9iZXJcIixcIm5vdmVtYmVyXCIsXCJkZWNlbWJlclwiXSxcIm1vbnRoc1Nob3J0XCI6W1wiamFuXCIsXCJmZWJcIixcIm1hclwiLFwiYXByXCIsXCJtYWpcIixcImp1blwiLFwianVsXCIsXCJhdWdcIixcInNlcFwiLFwib2t0XCIsXCJub3ZcIixcImRlY1wiXSxcIndlZWtkYXlzRnVsbFwiOltcInPDuG5kYWdcIixcIm1hbmRhZ1wiLFwidGlyc2RhZ1wiLFwib25zZGFnXCIsXCJ0b3JzZGFnXCIsXCJmcmVkYWdcIixcImzDuHJkYWdcIl0sXCJ3ZWVrZGF5c1Nob3J0XCI6W1wic8O4blwiLFwibWFuXCIsXCJ0aXJcIixcIm9uc1wiLFwidG9yXCIsXCJmcmVcIixcImzDuHJcIl0sXCJ0b2RheVwiOlwiaSBkYWdcIixcImNsZWFyXCI6XCJzbGV0XCIsXCJjbG9zZVwiOlwibHVrXCIsXCJmaXJzdERheVwiOjEsXCJmb3JtYXRcIjpcImQuIG1tbW0geXl5eVwiLFwiZm9ybWF0U3VibWl0XCI6XCJ5eXl5L21tL2RkXCJ9IiwibW9kdWxlLmV4cG9ydHM9e1wibW9udGhzRnVsbFwiOltcIkphbnVhclwiLFwiRmVicnVhclwiLFwiTcOkcnpcIixcIkFwcmlsXCIsXCJNYWlcIixcIkp1bmlcIixcIkp1bGlcIixcIkF1Z3VzdFwiLFwiU2VwdGVtYmVyXCIsXCJPa3RvYmVyXCIsXCJOb3ZlbWJlclwiLFwiRGV6ZW1iZXJcIl0sXCJtb250aHNTaG9ydFwiOltcIkphblwiLFwiRmViXCIsXCJNw6RyXCIsXCJBcHJcIixcIk1haVwiLFwiSnVuXCIsXCJKdWxcIixcIkF1Z1wiLFwiU2VwXCIsXCJPa3RcIixcIk5vdlwiLFwiRGV6XCJdLFwid2Vla2RheXNGdWxsXCI6W1wiU29ubnRhZ1wiLFwiTW9udGFnXCIsXCJEaWVuc3RhZ1wiLFwiTWl0dHdvY2hcIixcIkRvbm5lcnN0YWdcIixcIkZyZWl0YWdcIixcIlNhbXN0YWdcIl0sXCJ3ZWVrZGF5c1Nob3J0XCI6W1wiU29cIixcIk1vXCIsXCJEaVwiLFwiTWlcIixcIkRvXCIsXCJGclwiLFwiU2FcIl0sXCJ0b2RheVwiOlwiSGV1dGVcIixcImNsZWFyXCI6XCJMw7ZzY2hlblwiLFwiY2xvc2VcIjpcIlNjaGxpZcOfZW5cIixcImZpcnN0RGF5XCI6MSxcImZvcm1hdFwiOlwiZGRkZCwgZGQuIG1tbW0geXl5eVwiLFwiZm9ybWF0U3VibWl0XCI6XCJ5eXl5L21tL2RkXCJ9IiwibW9kdWxlLmV4cG9ydHM9e1wibW9udGhzRnVsbFwiOltcIs6ZzrHOvc6/z4XOrM+BzrnOv8+CXCIsXCLOps61zrLPgc6/z4XOrM+BzrnOv8+CXCIsXCLOnM6sz4HPhM65zr/PglwiLFwizpHPgM+Bzq/Ou865zr/PglwiLFwizpzOrM65zr/PglwiLFwizpnOv8+Nzr3Ouc6/z4JcIixcIs6Zzr/Pjc67zrnOv8+CXCIsXCLOkc+NzrPOv8+Fz4PPhM6/z4JcIixcIs6jzrXPgM+Ezq3OvM6yz4HOuc6/z4JcIixcIs6fzrrPhM+OzrLPgc65zr/PglwiLFwizp3Ov86tzrzOss+BzrnOv8+CXCIsXCLOlM61zrrOrc68zrLPgc65zr/PglwiXSxcIm1vbnRoc1Nob3J0XCI6W1wizpnOsc69XCIsXCLOps61zrJcIixcIs6czrHPgVwiLFwizpHPgM+BXCIsXCLOnM6xzrlcIixcIs6Zzr/Phc69XCIsXCLOmc6/z4XOu1wiLFwizpHPhc6zXCIsXCLOo861z4BcIixcIs6fzrrPhFwiLFwizp3Ov861XCIsXCLOlM61zrpcIl0sXCJ3ZWVrZGF5c0Z1bGxcIjpbXCLOms+Fz4HOuc6xzrrOrlwiLFwizpTOtc+Fz4TOrc+BzrFcIixcIs6kz4HOr8+EzrdcIixcIs6kzrXPhM6sz4HPhM63XCIsXCLOoM6tzrzPgM+EzrdcIixcIs6gzrHPgc6xz4POus61z4XOrlwiLFwizqPOrM6yzrLOsc+Ezr9cIl0sXCJ3ZWVrZGF5c1Nob3J0XCI6W1wizprPhc+BXCIsXCLOlM61z4VcIixcIs6kz4HOuVwiLFwizqTOtc+EXCIsXCLOoM61zrxcIixcIs6gzrHPgVwiLFwizqPOsc6yXCJdLFwidG9kYXlcIjpcIs+Dzq7OvM61z4HOsVwiLFwiY2xlYXJcIjpcIs6UzrnOsc6zz4HOsc+Gzq5cIixcImZpcnN0RGF5XCI6MSxcImZvcm1hdFwiOlwiZCBtbW1tIHl5eXlcIixcImZvcm1hdFN1Ym1pdFwiOlwieXl5eS9tbS9kZFwifSIsIm1vZHVsZS5leHBvcnRzPXtcIm1vbnRoc0Z1bGxcIjpbXCJKYW51YXJ5XCIsXCJGZWJydWFyeVwiLFwiTWFyY2hcIixcIkFwcmlsXCIsXCJNYXlcIixcIkp1bmVcIixcIkp1bHlcIixcIkF1Z3VzdFwiLFwiU2VwdGVtYmVyXCIsXCJPY3RvYmVyXCIsXCJOb3ZlbWJlclwiLFwiRGVjZW1iZXJcIl0sXCJtb250aHNTaG9ydFwiOltcIkphblwiLFwiRmViXCIsXCJNYXJcIixcIkFwclwiLFwiTWF5XCIsXCJKdW5cIixcIkp1bFwiLFwiQXVnXCIsXCJTZXBcIixcIk9jdFwiLFwiTm92XCIsXCJEZWNcIl0sXCJ3ZWVrZGF5c0Z1bGxcIjpbXCJTdW5kYXlcIixcIk1vbmRheVwiLFwiVHVlc2RheVwiLFwiV2VkbmVzZGF5XCIsXCJUaHVyc2RheVwiLFwiRnJpZGF5XCIsXCJTYXR1cmRheVwiXSxcIndlZWtkYXlzU2hvcnRcIjpbXCJTdW5cIixcIk1vblwiLFwiVHVlXCIsXCJXZWRcIixcIlRodVwiLFwiRnJpXCIsXCJTYXRcIl0sXCJmb3JtYXRcIjpcImQgbW1tbSwgeXl5eVwifVxuIiwibW9kdWxlLmV4cG9ydHM9e1wibW9udGhzRnVsbFwiOltcImVuZXJvXCIsXCJmZWJyZXJvXCIsXCJtYXJ6b1wiLFwiYWJyaWxcIixcIm1heW9cIixcImp1bmlvXCIsXCJqdWxpb1wiLFwiYWdvc3RvXCIsXCJzZXB0aWVtYnJlXCIsXCJvY3R1YnJlXCIsXCJub3ZpZW1icmVcIixcImRpY2llbWJyZVwiXSxcIm1vbnRoc1Nob3J0XCI6W1wiZW5lXCIsXCJmZWJcIixcIm1hclwiLFwiYWJyXCIsXCJtYXlcIixcImp1blwiLFwianVsXCIsXCJhZ29cIixcInNlcFwiLFwib2N0XCIsXCJub3ZcIixcImRpY1wiXSxcIndlZWtkYXlzRnVsbFwiOltcImRvbWluZ29cIixcImx1bmVzXCIsXCJtYXJ0ZXNcIixcIm1pw6lyY29sZXNcIixcImp1ZXZlc1wiLFwidmllcm5lc1wiLFwic8OhYmFkb1wiXSxcIndlZWtkYXlzU2hvcnRcIjpbXCJkb21cIixcImx1blwiLFwibWFyXCIsXCJtacOpXCIsXCJqdWVcIixcInZpZVwiLFwic8OhYlwiXSxcInRvZGF5XCI6XCJob3lcIixcImNsZWFyXCI6XCJib3JyYXJcIixcImNsb3NlXCI6XCJjZXJyYXJcIixcImZpcnN0RGF5XCI6MSxcImZvcm1hdFwiOlwiZGRkZCBkICFkZSBtbW1tICFkZSB5eXl5XCIsXCJmb3JtYXRTdWJtaXRcIjpcInl5eXkvbW0vZGRcIn0iLCJtb2R1bGUuZXhwb3J0cz17XCJtb250aHNGdWxsXCI6W1wiamFhbnVhclwiLFwidmVlYnJ1YXJcIixcIm3DpHJ0c1wiLFwiYXByaWxsXCIsXCJtYWlcIixcImp1dW5pXCIsXCJqdXVsaVwiLFwiYXVndXN0XCIsXCJzZXB0ZW1iZXJcIixcIm9rdG9vYmVyXCIsXCJub3ZlbWJlclwiLFwiZGV0c2VtYmVyXCJdLFwibW9udGhzU2hvcnRcIjpbXCJqYWFuXCIsXCJ2ZWViclwiLFwibcOkcnRzXCIsXCJhcHJcIixcIm1haVwiLFwianV1bmlcIixcImp1dWxpXCIsXCJhdWdcIixcInNlcHRcIixcIm9rdFwiLFwibm92XCIsXCJkZXRzXCJdLFwid2Vla2RheXNGdWxsXCI6W1wicMO8aGFww6RldlwiLFwiZXNtYXNww6RldlwiLFwidGVpc2lww6RldlwiLFwia29sbWFww6RldlwiLFwibmVsamFww6RldlwiLFwicmVlZGVcIixcImxhdXDDpGV2XCJdLFwid2Vla2RheXNTaG9ydFwiOltcInDDvGhcIixcImVzbVwiLFwidGVpXCIsXCJrb2xcIixcIm5lbFwiLFwicmVlXCIsXCJsYXVcIl0sXCJ0b2RheVwiOlwidMOkbmFcIixcImNsZWFyXCI6XCJrdXN0dXRhbWFcIixcImZpcnN0RGF5XCI6MSxcImZvcm1hdFwiOlwiZC4gbW1tbSB5eXl5LiBhXCIsXCJmb3JtYXRTdWJtaXRcIjpcInl5eXkvbW0vZGRcIn0iLCJtb2R1bGUuZXhwb3J0cz17XCJtb250aHNGdWxsXCI6W1widXJ0YXJyaWxhXCIsXCJvdHNhaWxhXCIsXCJtYXJ0eG9hXCIsXCJhcGlyaWxhXCIsXCJtYWlhdHphXCIsXCJla2FpbmFcIixcInV6dGFpbGFcIixcImFidXp0dWFcIixcImlyYWlsYVwiLFwidXJyaWFcIixcImF6YXJvYVwiLFwiYWJlbmR1YVwiXSxcIm1vbnRoc1Nob3J0XCI6W1widXJ0XCIsXCJvdHNcIixcIm1hclwiLFwiYXBpXCIsXCJtYWlcIixcImVrYVwiLFwidXp0XCIsXCJhYnVcIixcImlyYVwiLFwidXJyXCIsXCJhemFcIixcImFiZVwiXSxcIndlZWtkYXlzRnVsbFwiOltcImlnYW5kZWFcIixcImFzdGVsZWhlbmFcIixcImFzdGVhcnRlYVwiLFwiYXN0ZWF6a2VuYVwiLFwib3N0ZWd1bmFcIixcIm9zdGlyYWxhXCIsXCJsYXJ1bmJhdGFcIl0sXCJ3ZWVrZGF5c1Nob3J0XCI6W1wiaWcuXCIsXCJhbC5cIixcImFyLlwiLFwiYXouXCIsXCJvZy5cIixcIm9yLlwiLFwibHIuXCJdLFwidG9kYXlcIjpcImdhdXJcIixcImNsZWFyXCI6XCJnYXJiaXR1XCIsXCJmaXJzdERheVwiOjEsXCJmb3JtYXRcIjpcImRkZGQsIHl5eXkoZSlrbyBtbW1tcmVuIGRhXCIsXCJmb3JtYXRTdWJtaXRcIjpcInl5eXkvbW0vZGRcIn0iLCJtb2R1bGUuZXhwb3J0cz17XCJtb250aHNGdWxsXCI6W1wi2pjYp9mG2YjbjNmHXCIsXCLZgdmI2LHbjNmHXCIsXCLZhdin2LHYs1wiLFwi2KLZiNix24zZhFwiLFwi2YXZh1wiLFwi2pjZiNim2YZcIixcItqY2YjYptuM2YdcIixcItin2YjYqlwiLFwi2LPZvtiq2KfZhdio2LFcIixcItin2qnYqtio2LFcIixcItmG2YjYp9mF2KjYsVwiLFwi2K/Ys9in2YXYqNixXCJdLFwibW9udGhzU2hvcnRcIjpbXCLamNin2YbZiNuM2YdcIixcItmB2YjYsduM2YdcIixcItmF2KfYsdizXCIsXCLYotmI2LHbjNmEXCIsXCLZhdmHXCIsXCLamNmI2KbZhlwiLFwi2pjZiNim24zZh1wiLFwi2KfZiNiqXCIsXCLYs9m+2KrYp9mF2KjYsVwiLFwi2Kfaqdiq2KjYsVwiLFwi2YbZiNin2YXYqNixXCIsXCLYr9iz2KfZhdio2LFcIl0sXCJ3ZWVrZGF5c0Z1bGxcIjpbXCLbjNqp2LTZhtio2YdcIixcItiv2YjYtNmG2KjZh1wiLFwi2LPZhyDYtNmG2KjZh1wiLFwi2obZh9in2LHYtNmG2KjZh1wiLFwi2b7Zhtis2LTZhtio2YdcIixcItis2YXYudmHXCIsXCLYtNmG2KjZh1wiXSxcIndlZWtkYXlzU2hvcnRcIjpbXCLbjNqp2LTZhtio2YdcIixcItiv2YjYtNmG2KjZh1wiLFwi2LPZhyDYtNmG2KjZh1wiLFwi2obZh9in2LHYtNmG2KjZh1wiLFwi2b7Zhtis2LTZhtio2YdcIixcItis2YXYudmHXCIsXCLYtNmG2KjZh1wiXSxcInRvZGF5XCI6XCLYp9mF2LHZiNiyXCIsXCJjbGVhclwiOlwi2b7Yp9qpINqp2LHYr9mGXCIsXCJjbG9zZVwiOlwi2KjYs9iq2YZcIixcImZvcm1hdFwiOlwieXl5eSBtbW1tIGRkXCIsXCJmb3JtYXRTdWJtaXRcIjpcInl5eXkvbW0vZGRcIixcImxhYmVsTW9udGhOZXh0XCI6XCLZhdin2Ycg2KjYudiv24xcIixcImxhYmVsTW9udGhQcmV2XCI6XCLZhdin2Ycg2YLYqNmE24xcIn0iLCJtb2R1bGUuZXhwb3J0cz17XCJtb250aHNGdWxsXCI6W1widGFtbWlrdXVcIixcImhlbG1pa3V1XCIsXCJtYWFsaXNrdXVcIixcImh1aHRpa3V1XCIsXCJ0b3Vrb2t1dVwiLFwia2Vzw6RrdXVcIixcImhlaW7DpGt1dVwiLFwiZWxva3V1XCIsXCJzeXlza3V1XCIsXCJsb2tha3V1XCIsXCJtYXJyYXNrdXVcIixcImpvdWx1a3V1XCJdLFwibW9udGhzU2hvcnRcIjpbXCJ0YW1taVwiLFwiaGVsbWlcIixcIm1hYWxpc1wiLFwiaHVodGlcIixcInRvdWtvXCIsXCJrZXPDpFwiLFwiaGVpbsOkXCIsXCJlbG9cIixcInN5eXNcIixcImxva2FcIixcIm1hcnJhc1wiLFwiam91bHVcIl0sXCJ3ZWVrZGF5c0Z1bGxcIjpbXCJzdW5udW50YWlcIixcIm1hYW5hbnRhaVwiLFwidGlpc3RhaVwiLFwia2Vza2l2aWlra29cIixcInRvcnN0YWlcIixcInBlcmphbnRhaVwiLFwibGF1YW50YWlcIl0sXCJ3ZWVrZGF5c1Nob3J0XCI6W1wic3VcIixcIm1hXCIsXCJ0aVwiLFwia2VcIixcInRvXCIsXCJwZVwiLFwibGFcIl0sXCJ0b2RheVwiOlwidMOkbsOkw6RuXCIsXCJjbGVhclwiOlwidHloamVubsOkXCIsXCJmaXJzdERheVwiOjEsXCJmb3JtYXRcIjpcImQubS55eXl5XCIsXCJmb3JtYXRTdWJtaXRcIjpcInl5eXkvbW0vZGRcIn0iLCJtb2R1bGUuZXhwb3J0cz17XCJtb250aHNGdWxsXCI6W1wiSmFudmllclwiLFwiRsOpdnJpZXJcIixcIk1hcnNcIixcIkF2cmlsXCIsXCJNYWlcIixcIkp1aW5cIixcIkp1aWxsZXRcIixcIkFvw7t0XCIsXCJTZXB0ZW1icmVcIixcIk9jdG9icmVcIixcIk5vdmVtYnJlXCIsXCJEw6ljZW1icmVcIl0sXCJtb250aHNTaG9ydFwiOltcIkphblwiLFwiRmV2XCIsXCJNYXJcIixcIkF2clwiLFwiTWFpXCIsXCJKdWluXCIsXCJKdWlsXCIsXCJBb3VcIixcIlNlcFwiLFwiT2N0XCIsXCJOb3ZcIixcIkRlY1wiXSxcIndlZWtkYXlzRnVsbFwiOltcIkRpbWFuY2hlXCIsXCJMdW5kaVwiLFwiTWFyZGlcIixcIk1lcmNyZWRpXCIsXCJKZXVkaVwiLFwiVmVuZHJlZGlcIixcIlNhbWVkaVwiXSxcIndlZWtkYXlzU2hvcnRcIjpbXCJEaW1cIixcIkx1blwiLFwiTWFyXCIsXCJNZXJcIixcIkpldVwiLFwiVmVuXCIsXCJTYW1cIl0sXCJ0b2RheVwiOlwiQXVqb3VyZCdodWlcIixcImNsZWFyXCI6XCJFZmZhY2VyXCIsXCJjbG9zZVwiOlwiRmVybWVyXCIsXCJmaXJzdERheVwiOjEsXCJmb3JtYXRcIjpcImRkIG1tbW0geXl5eVwiLFwiZm9ybWF0U3VibWl0XCI6XCJ5eXl5L21tL2RkXCIsXCJsYWJlbE1vbnRoTmV4dFwiOlwiTW9pcyBzdWl2YW50XCIsXCJsYWJlbE1vbnRoUHJldlwiOlwiTW9pcyBwcsOpY8OpZGVudFwiLFwibGFiZWxNb250aFNlbGVjdFwiOlwiU8OpbGVjdGlvbm5lciB1biBtb2lzXCIsXCJsYWJlbFllYXJTZWxlY3RcIjpcIlPDqWxlY3Rpb25uZXIgdW5lIGFubsOpZVwifSIsIm1vZHVsZS5leHBvcnRzPXtcIm1vbnRoc0Z1bGxcIjpbXCJYYW5laXJvXCIsXCJGZWJyZWlyb1wiLFwiTWFyem9cIixcIkFicmlsXCIsXCJNYWlvXCIsXCJYdcOxb1wiLFwiWHVsbG9cIixcIkFnb3N0b1wiLFwiU2V0ZW1icm9cIixcIk91dHVicm9cIixcIk5vdmVtYnJvXCIsXCJEZWNlbWJyb1wiXSxcIm1vbnRoc1Nob3J0XCI6W1wieGFuXCIsXCJmZWJcIixcIm1hclwiLFwiYWJyXCIsXCJtYWlcIixcInh1blwiLFwieHVsXCIsXCJhZ29cIixcInNlcFwiLFwib3V0XCIsXCJub3ZcIixcImRlY1wiXSxcIndlZWtkYXlzRnVsbFwiOltcImRvbWluZ29cIixcImx1bnNcIixcIm1hcnRlc1wiLFwibcOpcmNvcmVzXCIsXCJ4b3Zlc1wiLFwidmVucmVzXCIsXCJzw6FiYWRvXCJdLFwid2Vla2RheXNTaG9ydFwiOltcImRvbVwiLFwibHVuXCIsXCJtYXJcIixcIm3DqXJcIixcInhvdlwiLFwidmVuXCIsXCJzYWJcIl0sXCJ0b2RheVwiOlwiaG94ZVwiLFwiY2xlYXJcIjpcImJvcnJhclwiLFwiZmlyc3REYXlcIjoxLFwiZm9ybWF0XCI6XCJkZGRkIGQgIWRlIG1tbW0gIWRlIHl5eXlcIixcImZvcm1hdFN1Ym1pdFwiOlwieXl5eS9tbS9kZFwifSIsIm1vZHVsZS5leHBvcnRzPXtcIm1vbnRoc0Z1bGxcIjpbXCLXmdeg15XXkNeoXCIsXCLXpNeR16jXldeQ16hcIixcItee16jXpVwiLFwi15DXpNeo15nXnFwiLFwi157XkNeZXCIsXCLXmdeV16DXmVwiLFwi15nXldec15lcIixcIteQ15XXkteV16HXmFwiLFwi16HXpNeY157XkdeoXCIsXCLXkNeV16fXmNeV15HXqFwiLFwi16DXldeR157XkdeoXCIsXCLXk9em157XkdeoXCJdLFwibW9udGhzU2hvcnRcIjpbXCLXmdeg15VcIixcItek15HXqFwiLFwi157XqNelXCIsXCLXkNek16hcIixcItee15DXmVwiLFwi15nXldegXCIsXCLXmdeV15xcIixcIteQ15XXklwiLFwi16HXpNeYXCIsXCLXkNeV16dcIixcIteg15XXkVwiLFwi15PXpteeXCJdLFwid2Vla2RheXNGdWxsXCI6W1wi15nXldedINeo15DXqdeV159cIixcIteZ15XXnSDXqdeg15lcIixcIteZ15XXnSDXqdec15nXqdeZXCIsXCLXmdeV150g16jXkdeZ16LXmVwiLFwi15nXldedINeX157Xmdep15lcIixcIteZ15XXnSDXqdep15lcIixcIteZ15XXnSDXqdeR16pcIl0sXCJ3ZWVrZGF5c1Nob3J0XCI6W1wi15BcIixcIteRXCIsXCLXklwiLFwi15NcIixcIteUXCIsXCLXlVwiLFwi16lcIl0sXCJ0b2RheVwiOlwi15TXmdeV151cIixcImNsZWFyXCI6XCLXnNee15fXldenXCIsXCJmb3JtYXRcIjpcInl5eXkgbW1tbdeRIGQgZGRkZFwiLFwiZm9ybWF0U3VibWl0XCI6XCJ5eXl5L21tL2RkXCJ9IiwibW9kdWxlLmV4cG9ydHM9e1wibW9udGhzRnVsbFwiOltcIuCknOCkqOCkteCksOClgFwiLFwi4KSr4KSw4KS14KSw4KWAXCIsXCLgpK7gpL7gpLDgpY3gpJpcIixcIuCkheCkquCljeCksOCliOCkslwiLFwi4KSu4KSIXCIsXCLgpJzgpYLgpKhcIixcIuCknOClgeCksuCkvuCkiFwiLFwi4KSF4KSX4KS44KWN4KSkXCIsXCLgpLjgpL/gpKTgpK7gpY3gpKzgpLBcIixcIuCkheCkleCljeCkn+ClguCkrOCksFwiLFwi4KSo4KS14KSu4KWN4KSs4KSwXCIsXCLgpKbgpL/gpLjgpK7gpY3gpKzgpLBcIl0sXCJtb250aHNTaG9ydFwiOltcIuCknOCkqFwiLFwi4KSr4KSwXCIsXCLgpK7gpL7gpLDgpY3gpJpcIixcIuCkheCkquCljeCksOCliOCkslwiLFwi4KSu4KSIXCIsXCLgpJzgpYLgpKhcIixcIuCknOClgVwiLFwi4KSF4KSXXCIsXCLgpLjgpL/gpKRcIixcIuCkheCkleCljeCkn+ClglwiLFwi4KSo4KS1XCIsXCLgpKbgpL/gpLhcIl0sXCJ3ZWVrZGF5c0Z1bGxcIjpbXCLgpLDgpLXgpL/gpLXgpL7gpLBcIixcIuCkuOCli+CkruCkteCkvuCksFwiLFwi4KSu4KSC4KSX4KSy4KS14KS+4KSwXCIsXCLgpKzgpYHgpKfgpLXgpL7gpLBcIixcIuCkl+ClgeCksOClgeCkteCkvuCksFwiLFwi4KS24KWB4KSV4KWN4KSw4KS14KS+4KSwXCIsXCLgpLbgpKjgpL/gpLXgpL7gpLBcIl0sXCJ3ZWVrZGF5c1Nob3J0XCI6W1wi4KSw4KS14KS/XCIsXCLgpLjgpYvgpK5cIixcIuCkruCkguCkl+CkslwiLFwi4KSs4KWB4KSnXCIsXCLgpJfgpYHgpLDgpYFcIixcIuCktuClgeCkleCljeCksFwiLFwi4KS24KSo4KS/XCJdLFwidG9kYXlcIjpcIuCkhuCknCDgpJXgpYAg4KSk4KS+4KSw4KWA4KSWIOCkmuCkr+CkqCDgpJXgpLDgpYfgpIJcIixcImNsZWFyXCI6XCLgpJrgpYHgpKjgpYAg4KS54KWB4KSIIOCkpOCkvuCksOClgOCkliDgpJXgpYsg4KSu4KS/4KSf4KS+4KSP4KSBXCIsXCJjbG9zZVwiOlwi4KS14KS/4KSC4KSh4KWLIOCkrOCkguCkpiDgpJXgpLDgpYdcIixcImZpcnN0RGF5XCI6MSxcImZvcm1hdFwiOlwiZGQvbW0veXl5eVwiLFwiZm9ybWF0U3VibWl0XCI6XCJ5eXl5L21tL2RkXCIsXCJsYWJlbE1vbnRoTmV4dFwiOlwi4KSF4KSX4KSy4KWHIOCkruCkvuCkuSDgpJXgpL4g4KSa4KSv4KSoIOCkleCksOClh+CkglwiLFwibGFiZWxNb250aFByZXZcIjpcIuCkquCkv+Ckm+CksuClhyDgpK7gpL7gpLkg4KSV4KS+IOCkmuCkr+CkqCDgpJXgpLDgpYfgpIJcIixcImxhYmVsTW9udGhTZWxlY3RcIjpcIuCkleCkv+CkuOCkvyDgpI/gpJUg4KSu4KS54KWA4KSo4KWHIOCkleCkviDgpJrgpK/gpKgg4KSV4KSw4KWH4KSCXCIsXCJsYWJlbFllYXJTZWxlY3RcIjpcIuCkleCkv+CkuOCkvyDgpI/gpJUg4KS14KSw4KWN4KS3IOCkleCkviDgpJrgpK/gpKgg4KSV4KSw4KWH4KSCXCJ9IiwibW9kdWxlLmV4cG9ydHM9e1wibW9udGhzRnVsbFwiOltcInNpamXEh2FualwiLFwidmVsamHEjWFcIixcIm/FvnVqYWtcIixcInRyYXZhbmpcIixcInN2aWJhbmpcIixcImxpcGFualwiLFwic3JwYW5qXCIsXCJrb2xvdm96XCIsXCJydWphblwiLFwibGlzdG9wYWRcIixcInN0dWRlbmlcIixcInByb3NpbmFjXCJdLFwibW9udGhzU2hvcnRcIjpbXCJzaWpcIixcInZlbGpcIixcIm/FvnVcIixcInRyYVwiLFwic3ZpXCIsXCJsaXBcIixcInNycFwiLFwia29sXCIsXCJydWpcIixcImxpc1wiLFwic3R1XCIsXCJwcm9cIl0sXCJ3ZWVrZGF5c0Z1bGxcIjpbXCJuZWRqZWxqYVwiLFwicG9uZWRqZWxqYWtcIixcInV0b3Jha1wiLFwic3JpamVkYVwiLFwixI1ldHZydGFrXCIsXCJwZXRha1wiLFwic3Vib3RhXCJdLFwid2Vla2RheXNTaG9ydFwiOltcIm5lZFwiLFwicG9uXCIsXCJ1dG9cIixcInNyaVwiLFwixI1ldFwiLFwicGV0XCIsXCJzdWJcIl0sXCJ0b2RheVwiOlwiZGFuYXNcIixcImNsZWFyXCI6XCJpemJyaXNhdGlcIixcImZpcnN0RGF5XCI6MSxcImZvcm1hdFwiOlwiZC4gbW1tbSB5eXl5LlwiLFwiZm9ybWF0U3VibWl0XCI6XCJ5eXl5L21tL2RkXCJ9IiwibW9kdWxlLmV4cG9ydHM9e1wibW9udGhzRnVsbFwiOltcImphbnXDoXJcIixcImZlYnJ1w6FyXCIsXCJtw6FyY2l1c1wiLFwiw6FwcmlsaXNcIixcIm3DoWp1c1wiLFwiasO6bml1c1wiLFwiasO6bGl1c1wiLFwiYXVndXN6dHVzXCIsXCJzemVwdGVtYmVyXCIsXCJva3TDs2JlclwiLFwibm92ZW1iZXJcIixcImRlY2VtYmVyXCJdLFwibW9udGhzU2hvcnRcIjpbXCJqYW5cIixcImZlYnJcIixcIm3DoXJjXCIsXCLDoXByXCIsXCJtw6FqXCIsXCJqw7puXCIsXCJqw7psXCIsXCJhdWdcIixcInN6ZXB0XCIsXCJva3RcIixcIm5vdlwiLFwiZGVjXCJdLFwid2Vla2RheXNGdWxsXCI6W1widmFzw6FybmFwXCIsXCJow6l0ZsWRXCIsXCJrZWRkXCIsXCJzemVyZGFcIixcImNzw7x0w7ZydMO2a1wiLFwicMOpbnRla1wiLFwic3pvbWJhdFwiXSxcIndlZWtkYXlzU2hvcnRcIjpbXCJWXCIsXCJIXCIsXCJLXCIsXCJTWmVcIixcIkNTXCIsXCJQXCIsXCJTWm9cIl0sXCJ0b2RheVwiOlwiTWFcIixcImNsZWFyXCI6XCJUw7ZybMOpc1wiLFwiZmlyc3REYXlcIjoxLFwiZm9ybWF0XCI6XCJ5eXl5LiBtbW1tIGRkLlwiLFwiZm9ybWF0U3VibWl0XCI6XCJ5eXl5L21tL2RkXCJ9IiwibW9kdWxlLmV4cG9ydHM9e1wibW9udGhzRnVsbFwiOltcIkphbnVhcmlcIixcIkZlYnJ1YXJpXCIsXCJNYXJldFwiLFwiQXByaWxcIixcIk1laVwiLFwiSnVuaVwiLFwiSnVsaVwiLFwiQWd1c3R1c1wiLFwiU2VwdGVtYmVyXCIsXCJPa3RvYmVyXCIsXCJOb3ZlbWJlclwiLFwiRGVzZW1iZXJcIl0sXCJtb250aHNTaG9ydFwiOltcIkphblwiLFwiRmViXCIsXCJNYXJcIixcIkFwclwiLFwiTWVpXCIsXCJKdW5cIixcIkp1bFwiLFwiQWd1XCIsXCJTZXBcIixcIk9rdFwiLFwiTm92XCIsXCJEZXNcIl0sXCJ3ZWVrZGF5c0Z1bGxcIjpbXCJNaW5nZ3VcIixcIlNlbmluXCIsXCJTZWxhc2FcIixcIlJhYnVcIixcIkthbWlzXCIsXCJKdW1hdFwiLFwiU2FidHVcIl0sXCJ3ZWVrZGF5c1Nob3J0XCI6W1wiTWluXCIsXCJTZW5cIixcIlNlbFwiLFwiUmFiXCIsXCJLYW1cIixcIkp1bVwiLFwiU2FiXCJdLFwidG9kYXlcIjpcImhhcmkgaW5pXCIsXCJjbGVhclwiOlwibWVuZ2hhcHVzXCIsXCJmaXJzdERheVwiOjEsXCJmb3JtYXRcIjpcImQgbW1tbSB5eXl5XCIsXCJmb3JtYXRTdWJtaXRcIjpcInl5eXkvbW0vZGRcIn0iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgJ2JnLUJHJzogcmVxdWlyZSgnLi9iZy1CRycpLFxuICAnYnMtQkEnOiByZXF1aXJlKCcuL2JzLUJBJyksXG4gICdjYS1FUyc6IHJlcXVpcmUoJy4vY2EtRVMnKSxcbiAgJ2NzLUNaJzogcmVxdWlyZSgnLi9jcy1DWicpLFxuICAnZGEtREsnOiByZXF1aXJlKCcuL2RhLURLJyksXG4gICdkZS1ERSc6IHJlcXVpcmUoJy4vZGUtREUnKSxcbiAgJ2VsLUdSJzogcmVxdWlyZSgnLi9lbC1HUicpLFxuICAnZW4tVVMnOiByZXF1aXJlKCcuL2VuLVVTJyksXG4gICdlcy1FUyc6IHJlcXVpcmUoJy4vZXMtRVMnKSxcbiAgJ2V0LUVFJzogcmVxdWlyZSgnLi9ldC1FRScpLFxuICAnZXUtRVMnOiByZXF1aXJlKCcuL2V1LUVTJyksXG4gICdmYS1pcic6IHJlcXVpcmUoJy4vZmEtaXInKSxcbiAgJ2ZpLUZJJzogcmVxdWlyZSgnLi9maS1GSScpLFxuICAnZnItRlInOiByZXF1aXJlKCcuL2ZyLUZSJyksXG4gICdnbC1FUyc6IHJlcXVpcmUoJy4vZ2wtRVMnKSxcbiAgJ2hlLUlMJzogcmVxdWlyZSgnLi9oZS1JTCcpLFxuICAnaGktSU4nOiByZXF1aXJlKCcuL2hpLUlOJyksXG4gICdoci1IUic6IHJlcXVpcmUoJy4vaHItSFInKSxcbiAgJ2h1LUhVJzogcmVxdWlyZSgnLi9odS1IVScpLFxuICAnaWQtSUQnOiByZXF1aXJlKCcuL2lkLUlEJyksXG4gICdpcy1JUyc6IHJlcXVpcmUoJy4vaXMtSVMnKSxcbiAgJ2l0LUlUJzogcmVxdWlyZSgnLi9pdC1JVCcpLFxuICAnamEtSlAnOiByZXF1aXJlKCcuL2phLUpQJyksXG4gICdrby1LUic6IHJlcXVpcmUoJy4va28tS1InKSxcbiAgJ2x0LUxUJzogcmVxdWlyZSgnLi9sdC1MVCcpLFxuICAnbHYtTFYnOiByZXF1aXJlKCcuL2x2LUxWJyksXG4gICduYi1OTyc6IHJlcXVpcmUoJy4vbmItTk8nKSxcbiAgJ25lLU5QJzogcmVxdWlyZSgnLi9uZS1OUCcpLFxuICAnbmwtTkwnOiByZXF1aXJlKCcuL25sLU5MJyksXG4gICdwbC1QTCc6IHJlcXVpcmUoJy4vcGwtUEwnKSxcbiAgJ3B0LUJSJzogcmVxdWlyZSgnLi9wdC1CUicpLFxuICAncHQtUFQnOiByZXF1aXJlKCcuL3B0LVBUJyksXG4gICdyby1STyc6IHJlcXVpcmUoJy4vcm8tUk8nKSxcbiAgJ3J1LVJVJzogcmVxdWlyZSgnLi9ydS1SVScpLFxuICAnc2stU0snOiByZXF1aXJlKCcuL3NrLVNLJyksXG4gICdzbC1TSSc6IHJlcXVpcmUoJy4vc2wtU0knKSxcbiAgJ3N2LVNFJzogcmVxdWlyZSgnLi9zdi1TRScpLFxuICAndGgtVEgnOiByZXF1aXJlKCcuL3RoLVRIJyksXG4gICd0ci1UUic6IHJlcXVpcmUoJy4vdHItVFInKSxcbiAgJ3VrLVVBJzogcmVxdWlyZSgnLi91ay1VQScpLFxuICAndmktVk4nOiByZXF1aXJlKCcuL3ZpLVZOJyksXG4gICd6aC1DTic6IHJlcXVpcmUoJy4vemgtQ04nKSxcbiAgJ3poLVRXJzogcmVxdWlyZSgnLi96aC1UVycpXG59O1xuIiwibW9kdWxlLmV4cG9ydHM9e1wibW9udGhzRnVsbFwiOltcImphbsO6YXJcIixcImZlYnLDumFyXCIsXCJtYXJzXCIsXCJhcHLDrWxcIixcIm1hw61cIixcImrDum7DrVwiLFwiasO6bMOtXCIsXCLDoWfDunN0XCIsXCJzZXB0ZW1iZXJcIixcIm9rdMOzYmVyXCIsXCJuw7N2ZW1iZXJcIixcImRlc2VtYmVyXCJdLFwibW9udGhzU2hvcnRcIjpbXCJqYW5cIixcImZlYlwiLFwibWFyXCIsXCJhcHJcIixcIm1hw61cIixcImrDum5cIixcImrDumxcIixcIsOhZ8O6XCIsXCJzZXBcIixcIm9rdFwiLFwibsOzdlwiLFwiZGVzXCJdLFwid2Vla2RheXNGdWxsXCI6W1wic3VubnVkYWd1clwiLFwibcOhbnVkYWd1clwiLFwiw75yacOwanVkYWd1clwiLFwibWnDsHZpa3VkYWd1clwiLFwiZmltbXR1ZGFndXJcIixcImbDtnN0dWRhZ3VyXCIsXCJsYXVnYXJkYWd1clwiXSxcIndlZWtkYXlzU2hvcnRcIjpbXCJzdW5cIixcIm3DoW5cIixcIsO+cmlcIixcIm1pw7BcIixcImZpbVwiLFwiZsO2c1wiLFwibGF1XCJdLFwidG9kYXlcIjpcIsONIGRhZ1wiLFwiY2xlYXJcIjpcIkhyZWluc2FcIixcImZpcnN0RGF5XCI6MSxcImZvcm1hdFwiOlwiZGQuIG1tbW0geXl5eVwiLFwiZm9ybWF0U3VibWl0XCI6XCJ5eXl5L21tL2RkXCJ9IiwibW9kdWxlLmV4cG9ydHM9e1wibW9udGhzRnVsbFwiOltcImdlbm5haW9cIixcImZlYmJyYWlvXCIsXCJtYXJ6b1wiLFwiYXByaWxlXCIsXCJtYWdnaW9cIixcImdpdWdub1wiLFwibHVnbGlvXCIsXCJhZ29zdG9cIixcInNldHRlbWJyZVwiLFwib3R0b2JyZVwiLFwibm92ZW1icmVcIixcImRpY2VtYnJlXCJdLFwibW9udGhzU2hvcnRcIjpbXCJnZW5cIixcImZlYlwiLFwibWFyXCIsXCJhcHJcIixcIm1hZ1wiLFwiZ2l1XCIsXCJsdWdcIixcImFnb1wiLFwic2V0XCIsXCJvdHRcIixcIm5vdlwiLFwiZGljXCJdLFwid2Vla2RheXNGdWxsXCI6W1wiZG9tZW5pY2FcIixcImx1bmVkw6xcIixcIm1hcnRlZMOsXCIsXCJtZXJjb2xlZMOsXCIsXCJnaW92ZWTDrFwiLFwidmVuZXJkw6xcIixcInNhYmF0b1wiXSxcIndlZWtkYXlzU2hvcnRcIjpbXCJkb21cIixcImx1blwiLFwibWFyXCIsXCJtZXJcIixcImdpb1wiLFwidmVuXCIsXCJzYWJcIl0sXCJ0b2RheVwiOlwiT2dnaVwiLFwiY2xlYXJcIjpcIkNhbmNlbGxhXCIsXCJjbG9zZVwiOlwiQ2hpdWRpXCIsXCJmaXJzdERheVwiOjEsXCJmb3JtYXRcIjpcImRkZGQgZCBtbW1tIHl5eXlcIixcImZvcm1hdFN1Ym1pdFwiOlwieXl5eS9tbS9kZFwiLFwibGFiZWxNb250aE5leHRcIjpcIk1lc2Ugc3VjY2Vzc2l2b1wiLFwibGFiZWxNb250aFByZXZcIjpcIk1lc2UgcHJlY2VkZW50ZVwiLFwibGFiZWxNb250aFNlbGVjdFwiOlwiU2VsZXppb25hIHVuIG1lc2VcIixcImxhYmVsWWVhclNlbGVjdFwiOlwiU2VsZXppb25hIHVuIGFubm9cIn0iLCJtb2R1bGUuZXhwb3J0cz17XCJtb250aHNGdWxsXCI6W1wiMeaciFwiLFwiMuaciFwiLFwiM+aciFwiLFwiNOaciFwiLFwiNeaciFwiLFwiNuaciFwiLFwiN+aciFwiLFwiOOaciFwiLFwiOeaciFwiLFwiMTDmnIhcIixcIjEx5pyIXCIsXCIxMuaciFwiXSxcIm1vbnRoc1Nob3J0XCI6W1wiMeaciFwiLFwiMuaciFwiLFwiM+aciFwiLFwiNOaciFwiLFwiNeaciFwiLFwiNuaciFwiLFwiN+aciFwiLFwiOOaciFwiLFwiOeaciFwiLFwiMTDmnIhcIixcIjEx5pyIXCIsXCIxMuaciFwiXSxcIndlZWtkYXlzRnVsbFwiOltcIuaXpeabnOaXpVwiLFwi5pyI5puc5pelXCIsXCLngavmm5zml6VcIixcIuawtOabnOaXpVwiLFwi5pyo5puc5pelXCIsXCLph5Hmm5zml6VcIixcIuWcn+abnOaXpVwiXSxcIndlZWtkYXlzU2hvcnRcIjpbXCLml6VcIixcIuaciFwiLFwi54GrXCIsXCLmsLRcIixcIuacqFwiLFwi6YeRXCIsXCLlnJ9cIl0sXCJ0b2RheVwiOlwi5LuK5pelXCIsXCJjbGVhclwiOlwi5raI5Y67XCIsXCJmaXJzdERheVwiOjEsXCJmb3JtYXRcIjpcInl5eXkgbW0gZGRcIixcImZvcm1hdFN1Ym1pdFwiOlwieXl5eS9tbS9kZFwifSIsIm1vZHVsZS5leHBvcnRzPXtcIm1vbnRoc0Z1bGxcIjpbXCIx7JuUXCIsXCIy7JuUXCIsXCIz7JuUXCIsXCI07JuUXCIsXCI17JuUXCIsXCI27JuUXCIsXCI37JuUXCIsXCI47JuUXCIsXCI57JuUXCIsXCIxMOyblFwiLFwiMTHsm5RcIixcIjEy7JuUXCJdLFwibW9udGhzU2hvcnRcIjpbXCIx7JuUXCIsXCIy7JuUXCIsXCIz7JuUXCIsXCI07JuUXCIsXCI17JuUXCIsXCI27JuUXCIsXCI37JuUXCIsXCI47JuUXCIsXCI57JuUXCIsXCIxMOyblFwiLFwiMTHsm5RcIixcIjEy7JuUXCJdLFwid2Vla2RheXNGdWxsXCI6W1wi7J287JqU7J28XCIsXCLsm5TsmpTsnbxcIixcIu2ZlOyalOydvFwiLFwi7IiY7JqU7J28XCIsXCLrqqnsmpTsnbxcIixcIuq4iOyalOydvFwiLFwi7Yag7JqU7J28XCJdLFwid2Vla2RheXNTaG9ydFwiOltcIuydvFwiLFwi7JuUXCIsXCLtmZRcIixcIuyImFwiLFwi66qpXCIsXCLquIhcIixcIu2GoFwiXSxcInRvZGF5XCI6XCLsmKTriphcIixcImNsZWFyXCI6XCLst6jshoxcIixcImZpcnN0RGF5XCI6MSxcImZvcm1hdFwiOlwieXl5eSDrhYQgbW0g7JuUIGRkIOydvFwiLFwiZm9ybWF0U3VibWl0XCI6XCJ5eXl5L21tL2RkXCJ9IiwibW9kdWxlLmV4cG9ydHM9e1wibGFiZWxNb250aE5leHRcIjpcIlNla2FudGlzIG3El251b1wiLFwibGFiZWxNb250aFByZXZcIjpcIkFua3N0ZXNuaXMgbcSXbnVvXCIsXCJsYWJlbE1vbnRoU2VsZWN0XCI6XCJQYXNpcmlua2l0ZSBtxJduZXPEr1wiLFwibGFiZWxZZWFyU2VsZWN0XCI6XCJQYXNpcmlua2l0ZSBtZXR1c1wiLFwibW9udGhzRnVsbFwiOltcIlNhdXNpc1wiLFwiVmFzYXJpc1wiLFwiS292YXNcIixcIkJhbGFuZGlzXCIsXCJHZWd1xb7El1wiLFwiQmlyxb5lbGlzXCIsXCJMaWVwYVwiLFwiUnVncGrFq3Rpc1wiLFwiUnVnc8SXamlzXCIsXCJTcGFsaXNcIixcIkxhcGtyaXRpc1wiLFwiR3J1b2Rpc1wiXSxcIm1vbnRoc1Nob3J0XCI6W1wiU2F1XCIsXCJWYXNcIixcIktvdlwiLFwiQmFsXCIsXCJHZWdcIixcIkJpclwiLFwiTGllXCIsXCJSZ3BcIixcIlJnc1wiLFwiU3BhXCIsXCJMYXBcIixcIkdyZFwiXSxcIndlZWtkYXlzRnVsbFwiOltcIlNla21hZGllbmlzXCIsXCJQaXJtYWRpZW5pc1wiLFwiQW50cmFkaWVuaXNcIixcIlRyZcSNaWFkaWVuaXNcIixcIktldHZpcnRhZGllbmlzXCIsXCJQZW5rdGFkaWVuaXNcIixcIsWgZcWhdGFkaWVuaXNcIl0sXCJ3ZWVrZGF5c1Nob3J0XCI6W1wiU2tcIixcIlByXCIsXCJBblwiLFwiVHJcIixcIkt0XCIsXCJQblwiLFwixaB0XCJdLFwidG9kYXlcIjpcIsWgaWFuZGllblwiLFwiY2xlYXJcIjpcIknFoXZhbHl0aVwiLFwiY2xvc2VcIjpcIlXFvmRhcnl0aVwiLFwiZmlyc3REYXlcIjoxLFwiZm9ybWF0XCI6XCJ5eXl5LW1tLWRkXCIsXCJmb3JtYXRTdWJtaXRcIjpcInl5eXkvbW0vZGRcIn0iLCJtb2R1bGUuZXhwb3J0cz17XCJtb250aHNGdWxsXCI6W1wiSmFudsSBcmlzXCIsXCJGZWJydcSBcmlzXCIsXCJNYXJ0c1wiLFwiQXByxKtsaXNcIixcIk1haWpzXCIsXCJKxatuaWpzXCIsXCJKxatsaWpzXCIsXCJBdWd1c3RzXCIsXCJTZXB0ZW1icmlzXCIsXCJPa3RvYnJpc1wiLFwiTm92ZW1icmlzXCIsXCJEZWNlbWJyaXNcIl0sXCJtb250aHNTaG9ydFwiOltcIkphblwiLFwiRmViXCIsXCJNYXJcIixcIkFwclwiLFwiTWFpXCIsXCJKxatuXCIsXCJKxatsXCIsXCJBdWdcIixcIlNlcFwiLFwiT2t0XCIsXCJOb3ZcIixcIkRlY1wiXSxcIndlZWtkYXlzRnVsbFwiOltcIlN2xJN0ZGllbmFcIixcIlBpcm1kaWVuYVwiLFwiT3RyZGllbmFcIixcIlRyZcWhZGllbmFcIixcIkNldHVydGRpZW5hXCIsXCJQaWVrdGRpZW5hXCIsXCJTZXN0ZGllbmFcIl0sXCJ3ZWVrZGF5c1Nob3J0XCI6W1wiU3ZcIixcIlBcIixcIk9cIixcIlRcIixcIkNcIixcIlBrXCIsXCJTXCJdLFwidG9kYXlcIjpcIsWgb2RpZW5hXCIsXCJjbGVhclwiOlwiQXRjZWx0XCIsXCJmaXJzdERheVwiOjEsXCJmb3JtYXRcIjpcInl5eXkubW0uZGQuIGRkZGRcIixcImZvcm1hdFN1Ym1pdFwiOlwieXl5eS9tbS9kZFwifSIsIm1vZHVsZS5leHBvcnRzPXtcIm1vbnRoc0Z1bGxcIjpbXCJqYW51YXJcIixcImZlYnJ1YXJcIixcIm1hcnNcIixcImFwcmlsXCIsXCJtYWlcIixcImp1bmlcIixcImp1bGlcIixcImF1Z3VzdFwiLFwic2VwdGVtYmVyXCIsXCJva3RvYmVyXCIsXCJub3ZlbWJlclwiLFwiZGVzZW1iZXJcIl0sXCJtb250aHNTaG9ydFwiOltcImphblwiLFwiZmViXCIsXCJtYXJcIixcImFwclwiLFwibWFpXCIsXCJqdW5cIixcImp1bFwiLFwiYXVnXCIsXCJzZXBcIixcIm9rdFwiLFwibm92XCIsXCJkZXNcIl0sXCJ3ZWVrZGF5c0Z1bGxcIjpbXCJzw7huZGFnXCIsXCJtYW5kYWdcIixcInRpcnNkYWdcIixcIm9uc2RhZ1wiLFwidG9yc2RhZ1wiLFwiZnJlZGFnXCIsXCJsw7hyZGFnXCJdLFwid2Vla2RheXNTaG9ydFwiOltcInPDuG5cIixcIm1hblwiLFwidGlyXCIsXCJvbnNcIixcInRvclwiLFwiZnJlXCIsXCJsw7hyXCJdLFwidG9kYXlcIjpcImkgZGFnXCIsXCJjbGVhclwiOlwibnVsbHN0aWxsXCIsXCJjbG9zZVwiOlwibHVra1wiLFwiZmlyc3REYXlcIjoxLFwiZm9ybWF0XCI6XCJkZC4gbW1tLiB5eXl5XCIsXCJmb3JtYXRTdWJtaXRcIjpcInl5eXkvbW0vZGRcIn0iLCJtb2R1bGUuZXhwb3J0cz17XCJtb250aHNGdWxsXCI6W1wi4KSc4KSo4KS14KSw4KWAXCIsXCLgpKvgpYfgpKzgpY3gpLDgpYHgpIXgpLDgpYBcIixcIuCkruCkvuCksOCljeCkmlwiLFwi4KSF4KSq4KWN4KSw4KS/4KSyXCIsXCLgpK7gpYdcIixcIuCknOClgeCkqFwiLFwi4KSc4KWB4KSy4KS+4KSIXCIsXCLgpIXgpJfgpLjgpY3gpKRcIixcIuCkuOClh+CkquCljeCkn+Clh+CkruCljeCkrOCksFwiLFwi4KSF4KSV4KWN4KSf4KWL4KSs4KSwXCIsXCLgpKjgpYvgpLXgpYfgpK7gpY3gpKzgpLBcIixcIuCkoeCkv+CkuOClh+CkruCljeCkrOCksFwiXSxcIm1vbnRoc1Nob3J0XCI6W1wi4KSc4KSoXCIsXCLgpKvgpYfgpKzgpY3gpLDgpYFcIixcIuCkruCkvuCksOCljeCkmlwiLFwi4KSF4KSq4KWN4KSw4KS/4KSyXCIsXCLgpK7gpYdcIixcIuCknOClgeCkqFwiLFwi4KSc4KWB4KSyXCIsXCLgpIXgpJdcIixcIuCkuOClh+CkquCljeCkn+Clh1wiLFwi4KSF4KSV4KWN4KSf4KWLXCIsXCLgpKjgpYvgpK3gpYdcIixcIuCkoeCkv+CkuOClh1wiXSxcIndlZWtkYXlzRnVsbFwiOltcIuCkuOCli+CkruCkrOCkvuCksFwiLFwi4KSu4KSZ4KWN4KSy4KSs4KS+4KSwXCIsXCLgpKzgpYHgpKfgpKzgpL7gpLBcIixcIuCkrOCkv+CkueClgOCkrOCkvuCksFwiLFwi4KS24KWB4KSV4KWN4KSw4KSs4KS+4KSwXCIsXCLgpLbgpKjgpL/gpKzgpL7gpLBcIixcIuCkhuCkiOCkpOCkrOCkvuCksFwiXSxcIndlZWtkYXlzU2hvcnRcIjpbXCLgpLjgpYvgpK5cIixcIuCkruCkguCkl+CksuCljVwiLFwi4KSs4KWB4KSnXCIsXCLgpKzgpL/gpLngpYBcIixcIuCktuClgeCkleCljeCksFwiLFwi4KS24KSo4KS/XCIsXCLgpIbgpIjgpKRcIl0sXCJudW1iZXJzXCI6W1wi4KWmXCIsXCLgpadcIixcIuClqFwiLFwi4KWpXCIsXCLgpapcIixcIuClq1wiLFwi4KWsXCIsXCLgpa1cIixcIuClrlwiLFwi4KWvXCJdLFwidG9kYXlcIjpcIuCkhuCknFwiLFwiY2xlYXJcIjpcIuCkruClh+Ckn+CkvuCkieCkqOClgeCkueCli+CkuOCljVwiLFwiZm9ybWF0XCI6XCJkZGRkLCBkZCBtbW1tLCB5eXl5XCIsXCJmb3JtYXRTdWJtaXRcIjpcInl5eXkvbW0vZGRcIn0iLCJtb2R1bGUuZXhwb3J0cz17XCJtb250aHNGdWxsXCI6W1wiamFudWFyaVwiLFwiZmVicnVhcmlcIixcIm1hYXJ0XCIsXCJhcHJpbFwiLFwibWVpXCIsXCJqdW5pXCIsXCJqdWxpXCIsXCJhdWd1c3R1c1wiLFwic2VwdGVtYmVyXCIsXCJva3RvYmVyXCIsXCJub3ZlbWJlclwiLFwiZGVjZW1iZXJcIl0sXCJtb250aHNTaG9ydFwiOltcImphblwiLFwiZmViXCIsXCJtYWFcIixcImFwclwiLFwibWVpXCIsXCJqdW5cIixcImp1bFwiLFwiYXVnXCIsXCJzZXBcIixcIm9rdFwiLFwibm92XCIsXCJkZWNcIl0sXCJ3ZWVrZGF5c0Z1bGxcIjpbXCJ6b25kYWdcIixcIm1hYW5kYWdcIixcImRpbnNkYWdcIixcIndvZW5zZGFnXCIsXCJkb25kZXJkYWdcIixcInZyaWpkYWdcIixcInphdGVyZGFnXCJdLFwid2Vla2RheXNTaG9ydFwiOltcInpvXCIsXCJtYVwiLFwiZGlcIixcIndvXCIsXCJkb1wiLFwidnJcIixcInphXCJdLFwidG9kYXlcIjpcInZhbmRhYWdcIixcImNsZWFyXCI6XCJ2ZXJ3aWpkZXJlblwiLFwiY2xvc2VcIjpcInNsdWl0ZW5cIixcImZpcnN0RGF5XCI6MSxcImZvcm1hdFwiOlwiZGRkZCBkIG1tbW0geXl5eVwiLFwiZm9ybWF0U3VibWl0XCI6XCJ5eXl5L21tL2RkXCJ9IiwibW9kdWxlLmV4cG9ydHM9e1wibW9udGhzRnVsbFwiOltcInN0eWN6ZcWEXCIsXCJsdXR5XCIsXCJtYXJ6ZWNcIixcImt3aWVjaWXFhFwiLFwibWFqXCIsXCJjemVyd2llY1wiLFwibGlwaWVjXCIsXCJzaWVycGllxYRcIixcIndyemVzaWXFhFwiLFwicGHFumR6aWVybmlrXCIsXCJsaXN0b3BhZFwiLFwiZ3J1ZHppZcWEXCJdLFwibW9udGhzU2hvcnRcIjpbXCJzdHlcIixcImx1dFwiLFwibWFyXCIsXCJrd2lcIixcIm1halwiLFwiY3plXCIsXCJsaXBcIixcInNpZVwiLFwid3J6XCIsXCJwYcW6XCIsXCJsaXNcIixcImdydVwiXSxcIndlZWtkYXlzRnVsbFwiOltcIm5pZWR6aWVsYVwiLFwicG9uaWVkemlhxYJla1wiLFwid3RvcmVrXCIsXCLFm3JvZGFcIixcImN6d2FydGVrXCIsXCJwacSFdGVrXCIsXCJzb2JvdGFcIl0sXCJ3ZWVrZGF5c1Nob3J0XCI6W1wibmllZHouXCIsXCJwbi5cIixcInd0LlwiLFwixZtyLlwiLFwiY3ouXCIsXCJwdC5cIixcInNvYi5cIl0sXCJ0b2RheVwiOlwiRHppc2lhalwiLFwiY2xlYXJcIjpcIlVzdcWEXCIsXCJjbG9zZVwiOlwiWmFta25palwiLFwiZmlyc3REYXlcIjoxLFwiZm9ybWF0XCI6XCJkIG1tbW0geXl5eVwiLFwiZm9ybWF0U3VibWl0XCI6XCJ5eXl5L21tL2RkXCJ9IiwibW9kdWxlLmV4cG9ydHM9e1wibW9udGhzRnVsbFwiOltcImphbmVpcm9cIixcImZldmVyZWlyb1wiLFwibWFyw6dvXCIsXCJhYnJpbFwiLFwibWFpb1wiLFwianVuaG9cIixcImp1bGhvXCIsXCJhZ29zdG9cIixcInNldGVtYnJvXCIsXCJvdXR1YnJvXCIsXCJub3ZlbWJyb1wiLFwiZGV6ZW1icm9cIl0sXCJtb250aHNTaG9ydFwiOltcImphblwiLFwiZmV2XCIsXCJtYXJcIixcImFiclwiLFwibWFpXCIsXCJqdW5cIixcImp1bFwiLFwiYWdvXCIsXCJzZXRcIixcIm91dFwiLFwibm92XCIsXCJkZXpcIl0sXCJ3ZWVrZGF5c0Z1bGxcIjpbXCJkb21pbmdvXCIsXCJzZWd1bmRhLWZlaXJhXCIsXCJ0ZXLDp2EtZmVpcmFcIixcInF1YXJ0YS1mZWlyYVwiLFwicXVpbnRhLWZlaXJhXCIsXCJzZXh0YS1mZWlyYVwiLFwic8OhYmFkb1wiXSxcIndlZWtkYXlzU2hvcnRcIjpbXCJkb21cIixcInNlZ1wiLFwidGVyXCIsXCJxdWFcIixcInF1aVwiLFwic2V4XCIsXCJzYWJcIl0sXCJ0b2RheVwiOlwiaG9qZVwiLFwiY2xlYXJcIjpcImxpbXBhclwiLFwiY2xvc2VcIjpcImZlY2hhclwiLFwiZm9ybWF0XCI6XCJkZGRkLCBkICFkZSBtbW1tICFkZSB5eXl5XCIsXCJmb3JtYXRTdWJtaXRcIjpcInl5eXkvbW0vZGRcIn0iLCJtb2R1bGUuZXhwb3J0cz17XCJtb250aHNGdWxsXCI6W1wiSmFuZWlyb1wiLFwiRmV2ZXJlaXJvXCIsXCJNYXLDp29cIixcIkFicmlsXCIsXCJNYWlvXCIsXCJKdW5ob1wiLFwiSnVsaG9cIixcIkFnb3N0b1wiLFwiU2V0ZW1icm9cIixcIk91dHVicm9cIixcIk5vdmVtYnJvXCIsXCJEZXplbWJyb1wiXSxcIm1vbnRoc1Nob3J0XCI6W1wiamFuXCIsXCJmZXZcIixcIm1hclwiLFwiYWJyXCIsXCJtYWlcIixcImp1blwiLFwianVsXCIsXCJhZ29cIixcInNldFwiLFwib3V0XCIsXCJub3ZcIixcImRlelwiXSxcIndlZWtkYXlzRnVsbFwiOltcIkRvbWluZ29cIixcIlNlZ3VuZGFcIixcIlRlcsOnYVwiLFwiUXVhcnRhXCIsXCJRdWludGFcIixcIlNleHRhXCIsXCJTw6FiYWRvXCJdLFwid2Vla2RheXNTaG9ydFwiOltcImRvbVwiLFwic2VnXCIsXCJ0ZXJcIixcInF1YVwiLFwicXVpXCIsXCJzZXhcIixcInNhYlwiXSxcInRvZGF5XCI6XCJIb2plXCIsXCJjbGVhclwiOlwiTGltcGFyXCIsXCJjbG9zZVwiOlwiRmVjaGFyXCIsXCJmb3JtYXRcIjpcImQgIWRlIG1tbW0gIWRlIHl5eXlcIixcImZvcm1hdFN1Ym1pdFwiOlwieXl5eS9tbS9kZFwifSIsIm1vZHVsZS5leHBvcnRzPXtcIm1vbnRoc0Z1bGxcIjpbXCJpYW51YXJpZVwiLFwiZmVicnVhcmllXCIsXCJtYXJ0aWVcIixcImFwcmlsaWVcIixcIm1haVwiLFwiaXVuaWVcIixcIml1bGllXCIsXCJhdWd1c3RcIixcInNlcHRlbWJyaWVcIixcIm9jdG9tYnJpZVwiLFwibm9pZW1icmllXCIsXCJkZWNlbWJyaWVcIl0sXCJtb250aHNTaG9ydFwiOltcImlhblwiLFwiZmViXCIsXCJtYXJcIixcImFwclwiLFwibWFpXCIsXCJpdW5cIixcIml1bFwiLFwiYXVnXCIsXCJzZXBcIixcIm9jdFwiLFwibm9pXCIsXCJkZWNcIl0sXCJ3ZWVrZGF5c0Z1bGxcIjpbXCJkdW1pbmljxINcIixcImx1bmlcIixcIm1hcsWjaVwiLFwibWllcmN1cmlcIixcImpvaVwiLFwidmluZXJpXCIsXCJzw6JtYsSDdMSDXCJdLFwid2Vla2RheXNTaG9ydFwiOltcIkRcIixcIkxcIixcIk1hXCIsXCJNaVwiLFwiSlwiLFwiVlwiLFwiU1wiXSxcInRvZGF5XCI6XCJhemlcIixcImNsZWFyXCI6XCLImXRlcmdlXCIsXCJmaXJzdERheVwiOjEsXCJmb3JtYXRcIjpcImRkIG1tbW0geXl5eVwiLFwiZm9ybWF0U3VibWl0XCI6XCJ5eXl5L21tL2RkXCJ9IiwibW9kdWxlLmV4cG9ydHM9e1wibW9udGhzRnVsbFwiOltcItGP0L3QstCw0YDRj1wiLFwi0YTQtdCy0YDQsNC70Y9cIixcItC80LDRgNGC0LBcIixcItCw0L/RgNC10LvRj1wiLFwi0LzQsNGPXCIsXCLQuNGO0L3Rj1wiLFwi0LjRjtC70Y9cIixcItCw0LLQs9GD0YHRgtCwXCIsXCLRgdC10L3RgtGP0LHRgNGPXCIsXCLQvtC60YLRj9Cx0YDRj1wiLFwi0L3QvtGP0LHRgNGPXCIsXCLQtNC10LrQsNCx0YDRj1wiXSxcIm1vbnRoc1Nob3J0XCI6W1wi0Y/QvdCyXCIsXCLRhNC10LJcIixcItC80LDRgFwiLFwi0LDQv9GAXCIsXCLQvNCw0LlcIixcItC40Y7QvVwiLFwi0LjRjtC7XCIsXCLQsNCy0LNcIixcItGB0LXQvVwiLFwi0L7QutGCXCIsXCLQvdC+0Y9cIixcItC00LXQulwiXSxcIndlZWtkYXlzRnVsbFwiOltcItCy0L7RgdC60YDQtdGB0LXQvdGM0LVcIixcItC/0L7QvdC10LTQtdC70YzQvdC40LpcIixcItCy0YLQvtGA0L3QuNC6XCIsXCLRgdGA0LXQtNCwXCIsXCLRh9C10YLQstC10YDQs1wiLFwi0L/Rj9GC0L3QuNGG0LBcIixcItGB0YPQsdCx0L7RgtCwXCJdLFwid2Vla2RheXNTaG9ydFwiOltcItCy0YFcIixcItC/0L1cIixcItCy0YJcIixcItGB0YBcIixcItGH0YJcIixcItC/0YJcIixcItGB0LFcIl0sXCJ0b2RheVwiOlwi0YHQtdCz0L7QtNC90Y9cIixcImNsZWFyXCI6XCLRg9C00LDQu9C40YLRjFwiLFwiY2xvc2VcIjpcItC30LDQutGA0YvRgtGMXCIsXCJmaXJzdERheVwiOjEsXCJmb3JtYXRcIjpcImQgbW1tbSB5eXl5INCzLlwiLFwiZm9ybWF0U3VibWl0XCI6XCJ5eXl5L21tL2RkXCJ9IiwibW9kdWxlLmV4cG9ydHM9e1wibW9udGhzRnVsbFwiOltcImphbnXDoXJcIixcImZlYnJ1w6FyXCIsXCJtYXJlY1wiLFwiYXByw61sXCIsXCJtw6FqXCIsXCJqw7puXCIsXCJqw7psXCIsXCJhdWd1c3RcIixcInNlcHRlbWJlclwiLFwib2t0w7NiZXJcIixcIm5vdmVtYmVyXCIsXCJkZWNlbWJlclwiXSxcIm1vbnRoc1Nob3J0XCI6W1wiamFuXCIsXCJmZWJcIixcIm1hclwiLFwiYXByXCIsXCJtw6FqXCIsXCJqw7puXCIsXCJqw7psXCIsXCJhdWdcIixcInNlcFwiLFwib2t0XCIsXCJub3ZcIixcImRlY1wiXSxcIndlZWtkYXlzRnVsbFwiOltcIm5lZGXEvmFcIixcInBvbmRlbG9rXCIsXCJ1dG9yb2tcIixcInN0cmVkYVwiLFwixaF0dnJ0b2tcIixcInBpYXRva1wiLFwic29ib3RhXCJdLFwid2Vla2RheXNTaG9ydFwiOltcIk5lXCIsXCJQb1wiLFwiVXRcIixcIlN0XCIsXCLFoHRcIixcIlBpXCIsXCJTb1wiXSxcInRvZGF5XCI6XCJkbmVzXCIsXCJjbGVhclwiOlwidnltYXphxaVcIixcImNsb3NlXCI6XCJ6YXZyaWXFpVwiLFwiZmlyc3REYXlcIjoxLFwiZm9ybWF0XCI6XCJkLiBtbW1tIHl5eXlcIixcImZvcm1hdFN1Ym1pdFwiOlwieXl5eS9tbS9kZFwifSIsIm1vZHVsZS5leHBvcnRzPXtcIm1vbnRoc0Z1bGxcIjpbXCJqYW51YXJcIixcImZlYnJ1YXJcIixcIm1hcmVjXCIsXCJhcHJpbFwiLFwibWFqXCIsXCJqdW5palwiLFwianVsaWpcIixcImF2Z3VzdFwiLFwic2VwdGVtYmVyXCIsXCJva3RvYmVyXCIsXCJub3ZlbWJlclwiLFwiZGVjZW1iZXJcIl0sXCJtb250aHNTaG9ydFwiOltcImphblwiLFwiZmViXCIsXCJtYXJcIixcImFwclwiLFwibWFqXCIsXCJqdW5cIixcImp1bFwiLFwiYXZnXCIsXCJzZXBcIixcIm9rdFwiLFwibm92XCIsXCJkZWNcIl0sXCJ3ZWVrZGF5c0Z1bGxcIjpbXCJuZWRlbGphXCIsXCJwb25lZGVsamVrXCIsXCJ0b3Jla1wiLFwic3JlZGFcIixcIsSNZXRydGVrXCIsXCJwZXRla1wiLFwic29ib3RhXCJdLFwid2Vla2RheXNTaG9ydFwiOltcIm5lZFwiLFwicG9uXCIsXCJ0b3JcIixcInNyZVwiLFwixI1ldFwiLFwicGV0XCIsXCJzb2JcIl0sXCJ0b2RheVwiOlwiZGFuZXNcIixcImNsZWFyXCI6XCJpemJyacWhaVwiLFwiY2xvc2VcIjpcInphcHJpXCIsXCJmaXJzdERheVwiOjEsXCJmb3JtYXRcIjpcImQuIG1tbW0geXl5eVwiLFwiZm9ybWF0U3VibWl0XCI6XCJ5eXl5L21tL2RkXCJ9IiwibW9kdWxlLmV4cG9ydHM9e1wibW9udGhzRnVsbFwiOltcImphbnVhcmlcIixcImZlYnJ1YXJpXCIsXCJtYXJzXCIsXCJhcHJpbFwiLFwibWFqXCIsXCJqdW5pXCIsXCJqdWxpXCIsXCJhdWd1c3RpXCIsXCJzZXB0ZW1iZXJcIixcIm9rdG9iZXJcIixcIm5vdmVtYmVyXCIsXCJkZWNlbWJlclwiXSxcIm1vbnRoc1Nob3J0XCI6W1wiamFuXCIsXCJmZWJcIixcIm1hclwiLFwiYXByXCIsXCJtYWpcIixcImp1blwiLFwianVsXCIsXCJhdWdcIixcInNlcFwiLFwib2t0XCIsXCJub3ZcIixcImRlY1wiXSxcIndlZWtkYXlzRnVsbFwiOltcInPDtm5kYWdcIixcIm3DpW5kYWdcIixcInRpc2RhZ1wiLFwib25zZGFnXCIsXCJ0b3JzZGFnXCIsXCJmcmVkYWdcIixcImzDtnJkYWdcIl0sXCJ3ZWVrZGF5c1Nob3J0XCI6W1wic8O2blwiLFwibcOlblwiLFwidGlzXCIsXCJvbnNcIixcInRvclwiLFwiZnJlXCIsXCJsw7ZyXCJdLFwidG9kYXlcIjpcIklkYWdcIixcImNsZWFyXCI6XCJSZW5zYVwiLFwiY2xvc2VcIjpcIlN0w6RuZ1wiLFwiZmlyc3REYXlcIjoxLFwiZm9ybWF0XCI6XCJ5eXl5LW1tLWRkXCIsXCJmb3JtYXRTdWJtaXRcIjpcInl5eXkvbW0vZGRcIixcImxhYmVsTW9udGhOZXh0XCI6XCJOw6RzdGEgbcOlbmFkXCIsXCJsYWJlbE1vbnRoUHJldlwiOlwiRsO2cmVnw6VlbmRlIG3DpW5hZFwiLFwibGFiZWxNb250aFNlbGVjdFwiOlwiVsOkbGogbcOlbmFkXCIsXCJsYWJlbFllYXJTZWxlY3RcIjpcIlbDpGxqIMOlclwifSIsIm1vZHVsZS5leHBvcnRzPXtcIm1vbnRoc0Z1bGxcIjpbXCLguKHguIHguKPguLLguITguKFcIixcIuC4geC4uOC4oeC4oOC4suC4nuC4seC4meC4mOC5jFwiLFwi4Lih4Li14LiZ4Liy4LiE4LihXCIsXCLguYDguKHguKnguLLguKLguJlcIixcIuC4nuC4pOC4qeC4oOC4suC4hOC4oVwiLFwi4Lih4Li04LiW4Li44LiZ4Liy4Lii4LiZXCIsXCLguIHguKPguIHguI7guLLguITguKFcIixcIuC4quC4tOC4h+C4q+C4suC4hOC4oVwiLFwi4LiB4Lix4LiZ4Lii4Liy4Lii4LiZXCIsXCLguJXguLjguKXguLLguITguKFcIixcIuC4nuC4pOC4qOC4iOC4tOC4geC4suC4ouC4mVwiLFwi4LiY4Lix4LiZ4Lin4Liy4LiE4LihXCJdLFwibW9udGhzU2hvcnRcIjpbXCLguKEu4LiELlwiLFwi4LiBLuC4ni5cIixcIuC4oeC4tS7guIQuXCIsXCLguYDguKEu4LiiLlwiLFwi4LieLuC4hC5cIixcIuC4oeC4tC7guKIuXCIsXCLguIEu4LiELlwiLFwi4LiqLuC4hC5cIixcIuC4gS7guKIuXCIsXCLguJUu4LiELlwiLFwi4LieLuC4oi5cIixcIuC4mC7guIQuXCJdLFwid2Vla2RheXNGdWxsXCI6W1wi4Lit4Liy4LiX4LiV4Li04LiiXCIsXCLguIjguLHguJnguJfguKNcIixcIuC4reC4h+C4seC4hOC4suC4o1wiLFwi4Lie4Li44LiYXCIsXCLguJ7guKTguKvguKrguLEg4Lia4LiU4Li1XCIsXCLguKjguIHguLjguKNcIixcIuC5gOC4quC4suC4o1wiXSxcIndlZWtkYXlzU2hvcnRcIjpbXCLguK0uXCIsXCLguIguXCIsXCLguK0uXCIsXCLguJ4uXCIsXCLguJ7guKQuXCIsXCLguKguXCIsXCLguKouXCJdLFwidG9kYXlcIjpcIuC4p+C4seC4meC4meC4teC5iVwiLFwiY2xlYXJcIjpcIuC4peC4mlwiLFwiZm9ybWF0XCI6XCJkIG1tbW0geXl5eVwiLFwiZm9ybWF0U3VibWl0XCI6XCJ5eXl5L21tL2RkXCJ9IiwibW9kdWxlLmV4cG9ydHM9e1wibW9udGhzRnVsbFwiOltcIk9jYWtcIixcIsWedWJhdFwiLFwiTWFydFwiLFwiTmlzYW5cIixcIk1hecSxc1wiLFwiSGF6aXJhblwiLFwiVGVtbXV6XCIsXCJBxJ91c3Rvc1wiLFwiRXlsw7xsXCIsXCJFa2ltXCIsXCJLYXPEsW1cIixcIkFyYWzEsWtcIl0sXCJtb250aHNTaG9ydFwiOltcIk9jYVwiLFwixZ51YlwiLFwiTWFyXCIsXCJOaXNcIixcIk1heVwiLFwiSGF6XCIsXCJUZW1cIixcIkHEn3VcIixcIkV5bFwiLFwiRWtpXCIsXCJLYXNcIixcIkFyYVwiXSxcIndlZWtkYXlzRnVsbFwiOltcIlBhemFyXCIsXCJQYXphcnRlc2lcIixcIlNhbMSxXCIsXCLDh2FyxZ9hbWJhXCIsXCJQZXLFn2VtYmVcIixcIkN1bWFcIixcIkN1bWFydGVzaVwiXSxcIndlZWtkYXlzU2hvcnRcIjpbXCJQenJcIixcIlB6dFwiLFwiU2FsXCIsXCLDh3LFn1wiLFwiUHLFn1wiLFwiQ3VtXCIsXCJDbXRcIl0sXCJ0b2RheVwiOlwiQnVnw7xuXCIsXCJjbGVhclwiOlwiU2lsXCIsXCJjbG9zZVwiOlwiS2FwYXRcIixcImZpcnN0RGF5XCI6MSxcImZvcm1hdFwiOlwiZGQgbW1tbSB5eXl5IGRkZGRcIixcImZvcm1hdFN1Ym1pdFwiOlwieXl5eS9tbS9kZFwifSIsIm1vZHVsZS5leHBvcnRzPXtcIm1vbnRoc0Z1bGxcIjpbXCLRgdGW0YfQtdC90YxcIixcItC70Y7RgtC40LlcIixcItCx0LXRgNC10LfQtdC90YxcIixcItC60LLRltGC0LXQvdGMXCIsXCLRgtGA0LDQstC10L3RjFwiLFwi0YfQtdGA0LLQtdC90YxcIixcItC70LjQv9C10L3RjFwiLFwi0YHQtdGA0L/QtdC90YxcIixcItCy0LXRgNC10YHQtdC90YxcIixcItC20L7QstGC0LXQvdGMXCIsXCLQu9C40YHRgtC+0L/QsNC0XCIsXCLQs9GA0YPQtNC10L3RjFwiXSxcIm1vbnRoc1Nob3J0XCI6W1wi0YHRltGHXCIsXCLQu9GO0YJcIixcItCx0LXRgFwiLFwi0LrQstGWXCIsXCLRgtGA0LBcIixcItGH0LXRgFwiLFwi0LvQuNC/XCIsXCLRgdC10YBcIixcItCy0LXRgFwiLFwi0LbQvtCyXCIsXCLQu9C40YFcIixcItCz0YDRg1wiXSxcIndlZWtkYXlzRnVsbFwiOltcItC90LXQtNGW0LvRj1wiLFwi0L/QvtC90LXQtNGW0LvQvtC6XCIsXCLQstGW0LLRgtC+0YDQvtC6XCIsXCLRgdC10YDQtdC00LBcIixcItGH0LXRgtCy0LXRgFwiLFwi0L/igJjRj9GC0L3QuNGG0Y9cIixcItGB0YPQsdC+0YLQsFwiXSxcIndlZWtkYXlzU2hvcnRcIjpbXCLQvdC0XCIsXCLQv9C9XCIsXCLQstGCXCIsXCLRgdGAXCIsXCLRh9GCXCIsXCLQv9GCXCIsXCLRgdCxXCJdLFwidG9kYXlcIjpcItGB0YzQvtCz0L7QtNC90ZZcIixcImNsZWFyXCI6XCLQstC40LrRgNC10YHQu9C40YLQuFwiLFwiZmlyc3REYXlcIjoxLFwiZm9ybWF0XCI6XCJkZCBtbW1tIHl5eXkgcC5cIixcImZvcm1hdFN1Ym1pdFwiOlwieXl5eS9tbS9kZFwifSIsIm1vZHVsZS5leHBvcnRzPXtcIm1vbnRoc0Z1bGxcIjpbXCJUaMOhbmcgTeG7mXRcIixcIlRow6FuZyBIYWlcIixcIlRow6FuZyBCYVwiLFwiVGjDoW5nIFTGsFwiLFwiVGjDoW5nIE7Eg21cIixcIlRow6FuZyBTw6F1XCIsXCJUaMOhbmcgQuG6o3lcIixcIlRow6FuZyBUw6FtXCIsXCJUaMOhbmcgQ2jDrW5cIixcIlRow6FuZyBNxrDhu51pXCIsXCJUaMOhbmcgTcaw4budaSBN4buZdFwiLFwiVGjDoW5nIE3GsOG7nWkgSGFpXCJdLFwibW9udGhzU2hvcnRcIjpbXCJN4buZdFwiLFwiSGFpXCIsXCJCYVwiLFwiVMawXCIsXCJOxINtXCIsXCJTw6F1XCIsXCJC4bqjeVwiLFwiVMOhbVwiLFwiQ2jDrW5cIixcIk3GsOG7m2lcIixcIk3GsOG7nWkgTeG7mXRcIixcIk3GsOG7nWkgSGFpXCJdLFwid2Vla2RheXNGdWxsXCI6W1wiQ2jhu6cgTmjhuq10XCIsXCJUaOG7qSBIYWlcIixcIlRo4bupIEJhXCIsXCJUaOG7qSBUxrBcIixcIlRo4bupIE7Eg21cIixcIlRo4bupIFPDoXVcIixcIlRo4bupIELhuqN5XCJdLFwid2Vla2RheXNTaG9ydFwiOltcIkMuTmjhuq10XCIsXCJULkhhaVwiLFwiVC5CYVwiLFwiVC5UxrBcIixcIlQuTsSDbVwiLFwiVC5Tw6F1XCIsXCJULkLhuqN5XCJdLFwidG9kYXlcIjpcIkjDtG0gTmF5XCIsXCJjbGVhclwiOlwiWG/DoVwiLFwiZmlyc3REYXlcIjoxfSIsIm1vZHVsZS5leHBvcnRzPXtcIm1vbnRoc0Z1bGxcIjpbXCLkuIDmnIhcIixcIuS6jOaciFwiLFwi5LiJ5pyIXCIsXCLlm5vmnIhcIixcIuS6lOaciFwiLFwi5YWt5pyIXCIsXCLkuIPmnIhcIixcIuWFq+aciFwiLFwi5Lmd5pyIXCIsXCLljYHmnIhcIixcIuWNgeS4gOaciFwiLFwi5Y2B5LqM5pyIXCJdLFwibW9udGhzU2hvcnRcIjpbXCLkuIBcIixcIuS6jFwiLFwi5LiJXCIsXCLlm5tcIixcIuS6lFwiLFwi5YWtXCIsXCLkuINcIixcIuWFq1wiLFwi5LmdXCIsXCLljYFcIixcIuWNgeS4gFwiLFwi5Y2B5LqMXCJdLFwid2Vla2RheXNGdWxsXCI6W1wi5pif5pyf5pelXCIsXCLmmJ/mnJ/kuIBcIixcIuaYn+acn+S6jFwiLFwi5pif5pyf5LiJXCIsXCLmmJ/mnJ/lm5tcIixcIuaYn+acn+S6lFwiLFwi5pif5pyf5YWtXCJdLFwid2Vla2RheXNTaG9ydFwiOltcIuaXpVwiLFwi5LiAXCIsXCLkuoxcIixcIuS4iVwiLFwi5ZubXCIsXCLkupRcIixcIuWFrVwiXSxcInRvZGF5XCI6XCLku4rml6VcIixcImNsZWFyXCI6XCLmuIXpmaRcIixcImNsb3NlXCI6XCLlhbPpl61cIixcImZpcnN0RGF5XCI6MSxcImZvcm1hdFwiOlwieXl5eSDlubQgbW0g5pyIIGRkIOaXpVwiLFwiZm9ybWF0U3VibWl0XCI6XCJ5eXl5L21tL2RkXCJ9IiwibW9kdWxlLmV4cG9ydHM9e1wibW9udGhzRnVsbFwiOltcIuS4gOaciFwiLFwi5LqM5pyIXCIsXCLkuInmnIhcIixcIuWbm+aciFwiLFwi5LqU5pyIXCIsXCLlha3mnIhcIixcIuS4g+aciFwiLFwi5YWr5pyIXCIsXCLkuZ3mnIhcIixcIuWNgeaciFwiLFwi5Y2B5LiA5pyIXCIsXCLljYHkuozmnIhcIl0sXCJtb250aHNTaG9ydFwiOltcIuS4gFwiLFwi5LqMXCIsXCLkuIlcIixcIuWbm1wiLFwi5LqUXCIsXCLlha1cIixcIuS4g1wiLFwi5YWrXCIsXCLkuZ1cIixcIuWNgVwiLFwi5Y2B5LiAXCIsXCLljYHkuoxcIl0sXCJ3ZWVrZGF5c0Z1bGxcIjpbXCLmmJ/mnJ/ml6VcIixcIuaYn+acn+S4gFwiLFwi5pif5pyf5LqMXCIsXCLmmJ/mnJ/kuIlcIixcIuaYn+acn+Wbm1wiLFwi5pif5pyf5LqUXCIsXCLmmJ/mnJ/lha1cIl0sXCJ3ZWVrZGF5c1Nob3J0XCI6W1wi5pelXCIsXCLkuIBcIixcIuS6jFwiLFwi5LiJXCIsXCLlm5tcIixcIuS6lFwiLFwi5YWtXCJdLFwidG9kYXlcIjpcIuS7iuWkqVwiLFwiY2xlYXJcIjpcIua4hemZpFwiLFwiY2xvc2VcIjpcIuWFs+mXrVwiLFwiZmlyc3REYXlcIjoxLFwiZm9ybWF0XCI6XCJ5eXl5IOW5tCBtbSDmnIggZGQg5pelXCIsXCJmb3JtYXRTdWJtaXRcIjpcInl5eXkvbW0vZGRcIn0iLCJ2YXIgaCA9IHJlcXVpcmUoJ21lcmN1cnknKS5oO1xudmFyIGJ1aWxkU3R5bGUgPSByZXF1aXJlKCcuLi9idWlsZC1zdHlsZScpO1xuXG52YXIgc3R5bGVzID0ge1xuICBwaWNrZXI6IGJ1aWxkU3R5bGUoe30sIFsncGlja2VyU2VsZWN0b3InXSksXG4gIHBpY2tlckxpbms6IGJ1aWxkU3R5bGUoe30sIFsncGlja2VyTGFiZWwnXSksXG4gIHNlbGVjdDogYnVpbGRTdHlsZSh7fSwgWydvdFNlbGVjdCddKSxcbiAgb3B0aW9uOiBidWlsZFN0eWxlKClcbn07XG5cbmZ1bmN0aW9uIG9wdGlvbihjb3VudCkge1xuICByZXR1cm4gaCgnb3B0aW9uJywge1xuICAgIHZhbHVlOiBjb3VudCxcbiAgICBzdHlsZTogc3R5bGVzLm9wdGlvblxuICB9LCBjb3VudCArICcgcGVvcGxlJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZHRwUGlja2VyRm9ybShzdGF0ZSkge1xuICB2YXIgb3B0aW9ucyA9IFsxLCAyLCAzXS5tYXAob3B0aW9uKTtcblxuICByZXR1cm4gaCgnZGl2Jywge1xuICAgICAgc3R5bGU6IHN0eWxlcy5waWNrZXJcbiAgICB9LCBbXG4gICAgICBoKCdhJywge1xuICAgICAgICBzdHlsZTogc3R5bGVzLnBpY2tlckxpbmtcbiAgICAgIH0sIHN0YXRlLnZpZXdNb2RlbC5wYXJ0eVNpemUgKyAnIHBlb3BsZScpLFxuXG4gICAgICBoKCdzZWxlY3QnLCB7XG4gICAgICAgIHN0eWxlOiBzdHlsZXMuc2VsZWN0XG4gICAgICB9LCBvcHRpb25zKVxuICAgIF1cbiAgKTtcbn1cbiIsInZhciBoID0gcmVxdWlyZSgnbWVyY3VyeScpLmg7XG52YXIgcGFydHlTaXplUGlja2VyID0gcmVxdWlyZSgnLi9wYXJ0eS1zaXplLXBpY2tlcicpO1xudmFyIGRhdGVQaWNrZXIgPSByZXF1aXJlKCcuL2RhdGUtcGlja2VyJyk7XG52YXIgYnVpbGRTdHlsZSA9IHJlcXVpcmUoJy4uL2J1aWxkLXN0eWxlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZHRwUGlja2VyRm9ybShzdGF0ZSkge1xuICByZXR1cm4gaCgnZm9ybScsIHtcbiAgICBzdHlsZTogYnVpbGRTdHlsZSh7XG4gICAgICBoZWlnaHQ6ICczZW0nLFxuICAgICAgd2lkdGg6ICc1OS41ZW0nLFxuICAgIH0pXG4gIH0sIFtcbiAgICBwYXJ0eVNpemVQaWNrZXIoc3RhdGUpLFxuICAgIGRhdGVQaWNrZXIoc3RhdGUpXG4gIF0pO1xufVxuIiwidmFyIGhnID0gcmVxdWlyZSgnbWVyY3VyeScpO1xudmFyIHBpY2tlckZvcm0gPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvcGlja2VyLWZvcm0nKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBtZXJnZSA9IHJlcXVpcmUoJ3JhbWRhL3NyYy9tZXJnZScpO1xuXG52YXIgbm93ID0gbmV3IERhdGUoKTtcbnZhciBjdXJyZW50RGF5ID0gbm93LmdldERheSgpO1xudmFyIGN1cnJlbnRNb250aCA9IG5vdy5nZXRNb250aCgpO1xudmFyIGN1cnJlbnRZZWFyID0gbm93LmdldEZ1bGxZZWFyKCk7XG52YXIgZ2VuZXJhdGVNb250aCA9IHV0aWxzLmdlbmVyYXRlTW9udGhGYWN0b3J5KGN1cnJlbnREYXksIGN1cnJlbnRNb250aCwgY3VycmVudFllYXIpO1xuXG52YXIgaCA9IGhnLmg7XG5cbmZ1bmN0aW9uIHNldE1vbnRoKGNvbGxlY3Rpb24sIG1vbnRoLCB5ZWFyKSB7XG4gIGNvbGxlY3Rpb25beWVhcl0gPSBjb2xsZWN0aW9uW2N1cnJlbnRZZWFyXSB8fCB7fTtcbiAgY29sbGVjdGlvblt5ZWFyXVttb250aF0gPSBnZW5lcmF0ZU1vbnRoKG1vbnRoLCB5ZWFyKTtcbn1cblxuZnVuY3Rpb24gYnVpbGRJbml0aWFsVmlld01vZGVsKG9wdHMpIHtcblxuICB2YXIgaW5pdGlhbFZpZXdNb2RlbCA9IHtcbiAgICBhdXRvY29tcGxldGVQbGFjZWhvbGRlcjogJ0xvY2F0aW9uIG9yIFJlc3RhdXJhbnQnLFxuICAgIGRhdGU6ICcyMDE1LTEwLTEwJyxcbiAgICBvcGVuOiBoZy52YWx1ZSh0cnVlKSxcbiAgICBpc0RhdGVQaWNrZXJUb3A6IGhnLnZhbHVlKG9wdHMuaXNFbGVtZW50SW5Cb3R0b21IYWxmIHx8ICdmYWxzZScpLFxuICAgIGlzRWxlbWVudEluQm90dG9tSGFsZjogaGcudmFsdWUob3B0cy5pc0VsZW1lbnRJbkJvdHRvbUhhbGYgfHwgJ2ZhbHNlJyksXG4gICAgZGlzcGxheWVkRGF0ZTogaGcuc3RydWN0KHtcbiAgICAgIG1vbnRoOiBoZy52YWx1ZShjdXJyZW50TW9udGgpLFxuICAgICAgeWVhcjogaGcudmFsdWUoY3VycmVudFllYXIpXG4gICAgfSksXG4gICAgZmluZEFUYWJsZTogJ0ZpbmQgYSBUYWJsZScsXG4gICAgLy8gbG9jYWxlOiAnZW4tVVMnLFxuICAgIC8vIGxhbmd1YWdlOiAnZW4nLFxuICAgIGxvY2FsZTogJ2phLUpQJyxcbiAgICBsYW5ndWFnZTogJ2phJyxcbiAgICBwYXJ0eVNpemU6IDIsXG4gICAgcGFydHlTaXplTGFyZ2VyUGFydHk6ICdMYXJnZXIgcGFydHknLFxuICAgIHBhcnR5U2l6ZVBsdXJhbDogJzIgcGVvcGxlJyxcbiAgICBwYXJ0eVNpemVTaW5ndWxhcjogJzEgcGVyc29uJyxcbiAgICAvLyBzaG91bGQgYmUgdGhlIGluZGV4IG9mIHRoZSB0ZCBoaWdobGlnaHRlZCBieSB0aGUgdXNlcidzIG1vdXNlXG4gICAgaGlnaGxpZ2h0ZWREYXlJbmRleDogaGcudmFsdWUobnVsbCksXG4gICAgc2VsZWN0ZWREYXRlOiBoZy5zdHJ1Y3Qoe1xuICAgICAgaXNTZWxlY3RlZDogaGcudmFsdWUodHJ1ZSksXG4gICAgICB5ZWFyOiBoZy52YWx1ZSgyMDE1KSxcbiAgICAgIG1vbnRoOiBoZy52YWx1ZShjdXJyZW50TW9udGgpLFxuICAgICAgZGF5OiBoZy52YWx1ZShjdXJyZW50RGF5KVxuICAgIH0pLFxuICAgIHNob3dMYXJnZXJQYXJ0eTogdHJ1ZSxcbiAgICBzaG93U2VhcmNoOiBmYWxzZSxcbiAgICB0aW1lOiAnMjM6MzAnLFxuICAgIHRpbWVPcHRpb25zOiBbeyB2YWx1ZTogJzIzOjMwJywgZGlzcGxheVZhbHVlOiAnMjM6MzAnIH1dLFxuICAgIHRpbWV6b25lT2Zmc2V0OiAtNDIwLFxuICAgIHllYXJzOiB7fVxuICB9O1xuXG4gIHNldE1vbnRoKGluaXRpYWxWaWV3TW9kZWwueWVhcnMsIGN1cnJlbnRNb250aCwgY3VycmVudFllYXIpO1xuICByZXR1cm4gaW5pdGlhbFZpZXdNb2RlbDtcbn1cblxuZnVuY3Rpb24gbmV4dE1vbnRoKHN0YXRlKSB7XG4gIHZhciBuZXh0RGF0ZSA9IHV0aWxzLmdldE5leHREYXRlKHN0YXRlLnZpZXdNb2RlbC5kaXNwbGF5ZWREYXRlLm1vbnRoKCksIHN0YXRlLnZpZXdNb2RlbC5kaXNwbGF5ZWREYXRlLnllYXIoKSk7XG4gIHNldE1vbnRoKHN0YXRlLnZpZXdNb2RlbC55ZWFycywgbmV4dERhdGUubW9udGgsIG5leHREYXRlLnllYXIpO1xuICBzdGF0ZS52aWV3TW9kZWwuZGlzcGxheWVkRGF0ZS5zZXQobmV4dERhdGUpO1xufVxuXG5mdW5jdGlvbiBsYXN0TW9udGgoc3RhdGUpIHtcbiAgdmFyIGxhc3REYXRlID0gdXRpbHMuZ2V0TGFzdERhdGUoc3RhdGUudmlld01vZGVsLmRpc3BsYXllZERhdGUubW9udGgoKSwgc3RhdGUudmlld01vZGVsLmRpc3BsYXllZERhdGUueWVhcigpKTtcbiAgc2V0TW9udGgoc3RhdGUudmlld01vZGVsLnllYXJzLCBsYXN0RGF0ZS5tb250aCwgbGFzdERhdGUueWVhcik7XG4gIHN0YXRlLnZpZXdNb2RlbC5kaXNwbGF5ZWREYXRlLnNldChsYXN0RGF0ZSk7XG59XG5cbmZ1bmN0aW9uIG1vdXNlb3V0RGF5KHN0YXRlLCBkYXlJbmRleCkge1xuICBzdGF0ZS52aWV3TW9kZWwuaGlnaGxpZ2h0ZWREYXlJbmRleC5zZXQobnVsbCk7XG59XG5cbmZ1bmN0aW9uIG1vdXNlb3ZlckRheShzdGF0ZSwgZGF5SW5kZXgpIHtcbiAgc3RhdGUudmlld01vZGVsLmhpZ2hsaWdodGVkRGF5SW5kZXguc2V0KGRheUluZGV4KTtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlRGF0ZVBpY2tlcihzdGF0ZSkge1xuICBpZiAoIXN0YXRlLnZpZXdNb2RlbC5vcGVuKCkpIHtcbiAgICBzdGF0ZS52aWV3TW9kZWwuaXNEYXRlUGlja2VyVG9wLnNldChzdGF0ZS52aWV3TW9kZWwuaXNFbGVtZW50SW5Cb3R0b21IYWxmKCkpO1xuICB9XG4gIHN0YXRlLnZpZXdNb2RlbC5vcGVuLnNldCghc3RhdGUudmlld01vZGVsLm9wZW4oKSk7XG59XG5cbmZ1bmN0aW9uIHJlbGF0aXZlUG9zaXRpb25DaGFuZ2Uoc3RhdGUsIGlzRWxlbWVudEluQm90dG9tSGFsZikge1xuICBzdGF0ZS52aWV3TW9kZWwuaXNFbGVtZW50SW5Cb3R0b21IYWxmLnNldChpc0VsZW1lbnRJbkJvdHRvbUhhbGYpO1xufVxuXG5mdW5jdGlvbiBnZXRJbml0aWFsQXBwU3RhdGUob3B0cykge1xuICByZXR1cm4gaGcuc3RhdGUoe1xuICAgIHZpZXdNb2RlbDogaGcuc3RydWN0KGJ1aWxkSW5pdGlhbFZpZXdNb2RlbChvcHRzKSksXG4gICAgY2hhbm5lbHM6IHtcbiAgICAgIHJlbGF0aXZlUG9zaXRpb25DaGFuZ2U6IHJlbGF0aXZlUG9zaXRpb25DaGFuZ2UsXG4gICAgICBtb3VzZW92ZXJEYXk6IG1vdXNlb3ZlckRheSxcbiAgICAgIG1vdXNlb3V0RGF5OiBtb3VzZW91dERheSxcbiAgICAgIHRvZ2dsZURhdGVQaWNrZXI6IHRvZ2dsZURhdGVQaWNrZXIsXG4gICAgICAvLyByZXNpemVWaWV3cG9ydDogcmVzaXplVmlld3BvcnQsXG4gICAgICAvLyBzY3JvbGw6IHNjcm9sbCxcbiAgICAgIG5leHRNb250aDogbmV4dE1vbnRoLFxuICAgICAgbGFzdE1vbnRoOiBsYXN0TW9udGhcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXIoc3RhdGUpIHtcbiAgcmV0dXJuIHBpY2tlckZvcm0oc3RhdGUpO1xufVxuXG52YXIgYWRkaXRpb25hbEV2ZW50cyA9IFsnbW91c2VvdmVyJywgJ21vdXNlb3V0J107XG5cbmZ1bmN0aW9uIGFwcChlbGVtLCBvYnNlcnYsIHJlbmRlciwgb3B0cykge1xuICBpZiAoIWVsZW0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnRWxlbWVudCBkb2VzIG5vdCBleGlzdC4gJyArXG4gICAgICAnTWVyY3VyeSBjYW5ub3QgYmUgaW5pdGlhbGl6ZWQuJyk7XG4gIH1cblxuICB2YXIgZGVsZWdhdG9yID0gaGcuRGVsZWdhdG9yKG9wdHMpO1xuICBmb3IgKGkgPSAwOyBpIDwgYWRkaXRpb25hbEV2ZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGRlbGVnYXRvci5saXN0ZW5UbyhhZGRpdGlvbmFsRXZlbnRzW2ldKTtcbiAgfVxuXG4gIHZhciBsb29wID0gaGcubWFpbihvYnNlcnYoKSwgcmVuZGVyLCBtZXJnZSh7XG4gICAgZGlmZjogaGcuZGlmZixcbiAgICBjcmVhdGU6IGhnLmNyZWF0ZSxcbiAgICBwYXRjaDogaGcucGF0Y2hcbiAgfSwgb3B0cykpO1xuXG4gIGVsZW0uYXBwZW5kQ2hpbGQobG9vcC50YXJnZXQpO1xuXG4gIHJldHVybiBvYnNlcnYobG9vcC51cGRhdGUpO1xufVxuXG5mdW5jdGlvbiBnZXRQb3NpdGlvbihlbGVtZW50KSB7XG4gIHZhciB4UG9zaXRpb24gPSAwO1xuICB2YXIgeVBvc2l0aW9uID0gMDtcblxuICB3aGlsZShlbGVtZW50KSB7XG4gICAgeFBvc2l0aW9uICs9IChlbGVtZW50Lm9mZnNldExlZnQgLSBlbGVtZW50LnNjcm9sbExlZnQgKyBlbGVtZW50LmNsaWVudExlZnQpO1xuICAgIHlQb3NpdGlvbiArPSAoZWxlbWVudC5vZmZzZXRUb3AgLSBlbGVtZW50LnNjcm9sbFRvcCArIGVsZW1lbnQuY2xpZW50VG9wKTtcbiAgICBlbGVtZW50ID0gZWxlbWVudC5vZmZzZXRQYXJlbnQ7XG4gIH1cbiAgcmV0dXJuIHsgeDogeFBvc2l0aW9uLCB5OiB5UG9zaXRpb24gfTtcbn1cblxuZnVuY3Rpb24gZ2V0Vmlld3BvcnREaW1lbnNpb25zKCkge1xuICB2YXIgZWxlbSA9IChkb2N1bWVudC5jb21wYXRNb2RlID09PSBcIkNTUzFDb21wYXRcIikgP1xuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCA6XG4gICAgZG9jdW1lbnQuYm9keTtcblxuICByZXR1cm4ge1xuICAgIGhlaWdodDogZWxlbS5jbGllbnRIZWlnaHQsXG4gICAgd2lkdGg6IGVsZW0uY2xpZW50V2lkdGhcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0UGFnZU9mZnNldCgpIHtcbiAgdmFyIHN1cHBvcnRQYWdlT2Zmc2V0ID0gd2luZG93LnBhZ2VYT2Zmc2V0ICE9PSB1bmRlZmluZWQ7XG4gIHZhciBpc0NTUzFDb21wYXQgPSAoKGRvY3VtZW50LmNvbXBhdE1vZGUgfHwgXCJcIikgPT09IFwiQ1NTMUNvbXBhdFwiKTtcblxuICB2YXIgeCA9IHN1cHBvcnRQYWdlT2Zmc2V0ID8gd2luZG93LnBhZ2VYT2Zmc2V0IDogaXNDU1MxQ29tcGF0ID8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQgOiBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQ7XG4gIHZhciB5ID0gc3VwcG9ydFBhZ2VPZmZzZXQgPyB3aW5kb3cucGFnZVlPZmZzZXQgOiBpc0NTUzFDb21wYXQgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIDogZG9jdW1lbnQuYm9keS5zY3JvbGxUb3A7XG5cbiAgcmV0dXJuIHsgeDogeCwgeTogeSB9O1xufVxuXG5mdW5jdGlvbiBnZXRJc0VsZW1lbnRJbkJvdHRvbUhhbGYoZWwpIHtcbiAgdmFyIHZpZXdwb3J0RGltZW5zaW9ucyA9IGdldFZpZXdwb3J0RGltZW5zaW9ucygpO1xuICB2YXIgcG9zaXRpb24gPSBnZXRQb3NpdGlvbihlbCk7XG4gIHZhciBwYWdlT2Zmc2V0ID0gZ2V0UGFnZU9mZnNldCgpO1xuXG4gIHJldHVybiBwb3NpdGlvbi55ID4gdmlld3BvcnREaW1lbnNpb25zLmhlaWdodCAvIDI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICByZW5kZXI6IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gICAgdmFyIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG5cbiAgICB2YXIgaXNFbGVtZW50SW5Cb3R0b21IYWxmID0gZ2V0SXNFbGVtZW50SW5Cb3R0b21IYWxmKGVsKTtcblxuICAgIHZhciBvcHRzID0ge1xuICAgICAgaXNFbGVtZW50SW5Cb3R0b21IYWxmOiBpc0VsZW1lbnRJbkJvdHRvbUhhbGYsXG4gICAgfTtcbiAgICB2YXIgc3RhdGUgPSBnZXRJbml0aWFsQXBwU3RhdGUob3B0cyk7XG5cbiAgICB2YXIgdGltZXI7XG4gICAgd2luZG93Lm9uc2Nyb2xsID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZih0aW1lcikge1xuICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgIH1cblxuICAgICAgdGltZXIgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgcmVsYXRpdmVQb3NpdGlvbkNoYW5nZShzdGF0ZSwgZ2V0SXNFbGVtZW50SW5Cb3R0b21IYWxmKGVsKSk7XG4gICAgICB9LCAxMDApO1xuICAgIH07XG5cbiAgICB3aW5kb3cub25yZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmKHRpbWVyKSB7XG4gICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgfVxuXG4gICAgICB0aW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICByZWxhdGl2ZVBvc2l0aW9uQ2hhbmdlKHN0YXRlLCBnZXRJc0VsZW1lbnRJbkJvdHRvbUhhbGYoZWwpKTtcbiAgICAgIH0sIDEwMCk7XG4gICAgfTtcblxuLy8gICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwib3B0aW1pemVkU2Nyb2xsXCIsIGZ1bmN0aW9uKCkge1xuLy8gICAgICAgcGFnZU9mZnNldCA9IGdldFBhZ2VPZmZzZXQoKTtcbi8vICAgICAgIGNvbnNvbGUubG9nKCdsb2MxJywgcGFnZU9mZnNldC55KTtcbi8vICAgICAgIHN0YXRlLnZpZXdNb2RlbC5wYWdlT2Zmc2V0WS5zZXQocGFnZU9mZnNldC55KTtcbi8vICAgICB9KTtcblxuICAgIGFwcChlbCwgc3RhdGUsIHJlbmRlcik7XG4gIH1cbn07XG5cbi8vIDwlIHZhciBleHRyYUNzc0NsYXNzID0gc2hvd1NlYXJjaCA/IFwiIHdpdGgtc2VhcmNoXCIgOiBcIlwiOyAlPlxuLy8gPGRpdiBjbGFzcz1cImR0cC1waWNrZXIgaGlkZSBkdHAtbGFuZy08JS0gbGFuZ3VhZ2UgKyBleHRyYUNzc0NsYXNzICU+XCI+XG4vLyAgIDxmb3JtIGNsYXNzPVwiZHRwLXBpY2tlci1mb3JtXCI+XG4vLyAgICAgPCUgaWYgKHRpbWV6b25lT2Zmc2V0ICE9IG51bGwpICU+XG4vLyAgICAgICA8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJ0aW1lem9uZU9mZnNldFwiLz5cbi8vICAgICA8JSB9ICU+XG4vLyAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJkYXRlLXBpY2tlciBkdHAtcGlja2VyLXNlbGVjdG9yXCIvPlxuLy8gICAgIDxzZWxlY3QgY2xhc3M9XCJ0aW1lLXBpY2tlciBoaWRlXCI+XG4vLyAgICAgICA8JSBmb3IgKHZhciBpID0gMTsgaSA8IChzaG93TGFyZ2VyUGFydHkgPyAyMiA6IDIxKTsgaSsrKSB7ICU+XG4vLyAgICAgICAgIDwlIGlzU2VsZWN0ZWQgPSBpID09PSBwYXJ0eVNpemU7ICU+XG4vLyAgICAgICAgIDwlIHZhciBkaXNwbGF5VmFsdWUgPSBwYXJ0eVNpemVQbHVyYWwucmVwbGFjZSgnezB9JywgaSk7ICU+XG5cbi8vICAgICAgICAgPCUgaWYgKGkgPT09IDEpIHsgJT5cbi8vICAgICAgICAgICA8JSBkaXNwbGF5VmFsdWUgPSBwYXJ0eVNpemVTaW5ndWxhci5yZXBsYWNlKCd7MH0nLCBpKTsgJT5cbi8vICAgICAgICAgPCUgfSBlbHNlIGlmKGkgPT09IDIxKSAgeyAlPlxuLy8gICAgICAgICAgIDwlIGRpc3BsYXlWYWx1ZSA9IHBhcnR5U2l6ZUxhcmdlclBhcnR5OyAlPlxuLy8gICAgICAgICA8JSB9ICU+XG5cbi8vICAgICAgICAgPCUgaWYoaXNTZWxlY3RlZCkgJT5cbi8vICAgICAgICAgICA8b3B0aW9uIHZhbHVlPTwlLSBpICU+IHNlbGVjdGVkPVwic2VsZWN0ZWRcIj4gPG9wdGlvbj5cbi8vICAgICAgICAgPCUgZWxzZSAlPlxuLy8gICAgICAgICAgIDxvcHRpb24gdmFsdWU9PCUtIGkgJT4+IDwlLSBkaXNwbGF5VmFsdWUgJT4gPG9wdGlvbj5cbi8vICAgICAgICAgPCUgfSAlPlxuLy8gICAgICAgPCUgfSAlPlxuLy8gICAgICAgPCEtLSBpbmNvbXBsZXRlIC0tPlxuLy8gICAgIDwvc2VsZWN0PlxuLy8gICAgIDxpbnB1dCB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidXR0b24gZHRwLXBpY2tlci1idXR0b25cIi8+XG4vLyAgIDwvZm9ybT5cbi8vIDwvZGl2PlxuXG5cbi8qKlxuICogRHRwIC0gYmluZHMgYWN0aW9ucyB0byBldmVudHMgYW5kIHNldHMgdGhlIHByb3BlciBqcyB0byBzdHlsZSBtZW51c1xuICpcbiAqL1xuXG4vLyBPVC5jcmVhdGVOUygnT1QuQ29tbW9uLkR0cCcpO1xuXG4vLyBPVC5Db21tb24uRHRwID0gKGZ1bmN0aW9uKCQsIF8sIG1vbWVudCl7XG4vLyAgICd1c2Ugc3RyaWN0JztcblxuLy8gICB2YXIgc2VsZWN0b3JzID0ge1xuLy8gICAgIHBhcnR5U2l6ZVBpY2tlcjogJy5wYXJ0eS1zaXplLXBpY2tlcicsXG4vLyAgICAgdGltZVBpY2tlcjogJy50aW1lLXBpY2tlcicsXG4vLyAgICAgZGF0ZVBpY2tlcjogJy5kYXRlLXBpY2tlcicsXG4vLyAgICAgc2VhcmNoVGV4dDogJy5kdHAtcGlja2VyLXNlYXJjaCcsXG4vLyAgICAgZHRwRm9ybTogJy5kdHAtcGlja2VyLWZvcm0nLFxuLy8gICAgIHRpbWV6b25lT2Zmc2V0OiAnaW5wdXRbbmFtZT1cInRpbWV6b25lT2Zmc2V0XCJdJ1xuLy8gICB9O1xuXG4vLyAgIHZhciBEVFBfQ09PS0lFX0lERU5USUZJRVIgPSBcIk9UX2R0cF92YWx1ZXNcIixcbi8vICAgICAgIERUUF9DT09LSUVfTUFYQUdFID0gMzY1KjI0KjYwKjYwKjEwMDA7XG5cbi8vICAgdmFyIHRhYkluZGV4Q291bnRlciA9IDAsXG4vLyAgICAgICBfdmFsaWRhdGVEYXRlVGltZSA9IHRydWUsXG4vLyAgICAgICBfc2hvdWxkRW1pdENoYW5nZWRFdmVudCA9IHRydWU7XG5cbi8vICAgdmFyIGNvb2tpZXMgPSB7XG4vLyAgICAgZ2V0OiBmdW5jdGlvbihrZXkpe1xuLy8gICAgICAgdmFyIGNvb2tpZWQgPSBPVC5Db21tb24uQ29va2llcy5nZXQoRFRQX0NPT0tJRV9JREVOVElGSUVSKTtcbi8vICAgICAgIHJldHVybiB0eXBlb2Yoa2V5KSA9PT0gJ3N0cmluZycgPyAoKCEhY29va2llZCAmJiAhIWNvb2tpZWRba2V5XSkgPyBjb29raWVkW2tleV0gOiB1bmRlZmluZWQpOiBjb29raWVkO1xuLy8gICAgIH0sXG4vLyAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZXMpe1xuLy8gICAgICAgdmFyIGNvb2tpZWRWYWx1ZXMgPSB7fTtcbi8vICAgICAgIGNvb2tpZWRWYWx1ZXNbRFRQX0NPT0tJRV9JREVOVElGSUVSXSA9IF8ucGljayh2YWx1ZXMsICdjb3ZlcnMnLCAnZGF0ZXRpbWUnKTtcblxuLy8gICAgICAgcmV0dXJuIE9ULkNvbW1vbi5Db29raWVzLnNldChjb29raWVkVmFsdWVzLCBEVFBfQ09PS0lFX01BWEFHRSk7XG4vLyAgICAgfVxuLy8gICB9O1xuXG4vLyAgIHZhciBnZXRNZXRyb09mZnNldCA9IGZ1bmN0aW9uKCRkdHApe1xuLy8gICAgIHZhciBtZXRyb09mZnNldCA9IDAsXG4vLyAgICAgICAgICRkdHBPZmZzZXQgPSAkZHRwID8gJGR0cC5maW5kKHNlbGVjdG9ycy50aW1lem9uZU9mZnNldCkgOiBbXTtcblxuLy8gICAgIGlmKCRkdHBPZmZzZXQubGVuZ3RoID4gMCl7XG4vLyAgICAgICBtZXRyb09mZnNldCA9ICRkdHBPZmZzZXQudmFsKCk7XG4vLyAgICAgfSBlbHNlIGlmKCEhcGFnZURhdGEgJiYgcGFnZURhdGEuaGVhZGVyVGltZXpvbmVPZmZzZXQpe1xuLy8gICAgICAgbWV0cm9PZmZzZXQgPSBwYWdlRGF0YS5oZWFkZXJUaW1lem9uZU9mZnNldDtcbi8vICAgICB9XG5cbi8vICAgICByZXR1cm4gbWV0cm9PZmZzZXQ7XG4vLyAgIH07XG5cbi8vICAgdmFyIGdldE1ldHJvRGF0ZVRpbWUgPSBmdW5jdGlvbigkZHRwKXtcbi8vICAgICByZXR1cm4gbW9tZW50KCkudXRjKCkuYWRkKGdldE1ldHJvT2Zmc2V0KCRkdHApLCAnbScpO1xuLy8gICB9O1xuXG4vLyAgIHZhciBzZXRUYWJJbmRleGVzID0gZnVuY3Rpb24oaW5wdXRzLCBzdGFydEluZGV4KXtcbi8vICAgICBpbnB1dHMucGFydHlTaXplUGlja2VyLmF0dHIoXCJ0YWJpbmRleFwiLCBzdGFydEluZGV4ICsgMSk7XG4vLyAgICAgaW5wdXRzLmRhdGVQaWNrZXIuYXR0cihcInRhYmluZGV4XCIsIHN0YXJ0SW5kZXggKyAyKTtcbi8vICAgICBpbnB1dHMudGltZVBpY2tlci5hdHRyKFwidGFiaW5kZXhcIiwgc3RhcnRJbmRleCArIDMpO1xuLy8gICAgIGlucHV0cy5zZWFyY2hUZXh0LmF0dHIoXCJ0YWJpbmRleFwiLCBzdGFydEluZGV4ICsgNCk7XG4vLyAgICAgaW5wdXRzLnNlYXJjaEJ1dHRvbi5hdHRyKFwidGFiaW5kZXhcIiwgc3RhcnRJbmRleCArIDUpO1xuXG4vLyAgICAgcmV0dXJuIHN0YXJ0SW5kZXggKyA1O1xuLy8gICB9O1xuXG4vLyAgIHZhciBzZXRIaWdobGlnaHRpbmcgPSBmdW5jdGlvbihmb3JtSW5wdXRzLCBsYWJlbElucHV0cyl7XG5cbi8vICAgICB2YXIgaGlnaGxpZ2h0T25Gb2N1cyA9IGZ1bmN0aW9uKCRmb3JtSW5wdXQsICRsYWJlbElucHV0KXtcbi8vICAgICAgICRmb3JtSW5wdXQuZm9jdXMoZnVuY3Rpb24oKXtcbi8vICAgICAgICAgJGxhYmVsSW5wdXQuYWRkQ2xhc3MoJ2hpZ2hsaWdodGVkJyk7XG4vLyAgICAgICB9KTtcbi8vICAgICB9O1xuXG4vLyAgICAgdmFyIHVuaGlnaGxpZ2h0T25CbHVyID0gZnVuY3Rpb24oJGZvcm1JbnB1dCwgJGxhYmVsSW5wdXQpe1xuLy8gICAgICAgJGZvcm1JbnB1dC5ibHVyKGZ1bmN0aW9uKCl7XG4vLyAgICAgICAgICRsYWJlbElucHV0LnJlbW92ZUNsYXNzKCdoaWdobGlnaHRlZCcpO1xuLy8gICAgICAgfSk7XG4vLyAgICAgfTtcblxuLy8gICAgIF8uZm9yRWFjaChsYWJlbElucHV0cywgZnVuY3Rpb24oJGxhYmVsSW5wdXQsIGtleSl7XG4vLyAgICAgICBoaWdobGlnaHRPbkZvY3VzKGZvcm1JbnB1dHNba2V5XSwgJGxhYmVsSW5wdXQpO1xuLy8gICAgICAgdW5oaWdobGlnaHRPbkJsdXIoZm9ybUlucHV0c1trZXldLCAkbGFiZWxJbnB1dCk7XG4vLyAgICAgfSk7XG4vLyAgIH07XG5cbi8vICAgdmFyIGR0cCA9IHtcbi8vICAgICBpbml0OiBmdW5jdGlvbihkdHBTZWxlY3Rvcil7XG5cbi8vICAgICAgICQoZHRwU2VsZWN0b3IpLmVhY2goZnVuY3Rpb24oKXtcblxuLy8gICAgICAgICB2YXIgJGR0cCA9ICQodGhpcyk7XG5cbi8vICAgICAgICAgLy8gZW5zdXJlIHRoZSBkdHAgaXMgaGlkZGVuIGJlZm9yZSByZW5kZXJpbmcgaXRcbi8vICAgICAgICAgJGR0cC5hZGRDbGFzcyhcImhpZGVcIik7XG5cbi8vICAgICAgICAgLy8gaW5pdHMgYW5kIHJlbmRlcnMgYWxsIHRoZSBjb21wb25lbnRzXG4vLyAgICAgICAgIHZhciBtZXRyb0RhdGVUaW1lID0gZ2V0TWV0cm9EYXRlVGltZSgkZHRwKSxcbi8vICAgICAgICAgICAgIG1pbkRhdGUgPSBPVC5Db21tb24uSGVscGVycy5nZXRNaW5pbXVtRGF0ZShtZXRyb0RhdGVUaW1lKSxcbi8vICAgICAgICAgICAgICR0aW1lUGlja2VyID0gJGR0cC5maW5kKHNlbGVjdG9ycy50aW1lUGlja2VyKS5PVHNlbGVjdChcImluaXRcIiksXG4vLyAgICAgICAgICAgICAkcGFydHlTaXplUGlja2VyID0gJGR0cC5maW5kKHNlbGVjdG9ycy5wYXJ0eVNpemVQaWNrZXIpLk9Uc2VsZWN0KFwiaW5pdFwiKSxcbi8vICAgICAgICAgICAgICRkYXRlcGlja2VyID0gJGR0cC5maW5kKHNlbGVjdG9ycy5kYXRlUGlja2VyKS5PVGRhdGVwaWNrZXIoXCJpbml0XCIsIG1pbkRhdGUpLFxuLy8gICAgICAgICAgICAgJHNlYXJjaFRleHQgPSAkZHRwLmZpbmQoc2VsZWN0b3JzLnNlYXJjaFRleHQpLFxuLy8gICAgICAgICAgICAgJGZvcm0gPSAkZHRwLmZpbmQoc2VsZWN0b3JzLmR0cEZvcm0pLFxuLy8gICAgICAgICAgICAgZGF0ZVRpbWVWYWxpZGF0b3IgPSBuZXcgT1QuQ29tbW9uLkhlbHBlcnMuZGF0ZVRpbWVWYWxpZGF0b3IoKTtcblxuLy8gICAgICAgICB2YXIgc2VsZWN0SW5pdFZhbHVlRm9yID0ge1xuLy8gICAgICAgICAgIGNvdmVyczogZnVuY3Rpb24oKXtcblxuLy8gICAgICAgICAgICAgdmFyIGlzVmFsaWQgPSBmdW5jdGlvbih2YWwpe1xuLy8gICAgICAgICAgICAgICByZXR1cm4gISF2YWwgJiYgdmFsPD0yMSAmJiB2YWw+MDtcbi8vICAgICAgICAgICAgIH07XG5cbi8vICAgICAgICAgICAgIHZhciB2YWx1ZVdhc1N1cHBsaWVkID0gISRwYXJ0eVNpemVQaWNrZXIuT1RzZWxlY3QoXCJpbmZvXCIpLnVuc2VsZWN0ZWRPbkluaXQsXG4vLyAgICAgICAgICAgICAgICAgc3VwcGxpZWRWYWx1ZSA9IHZhbHVlV2FzU3VwcGxpZWQgPyAkcGFydHlTaXplUGlja2VyLk9Uc2VsZWN0KFwiZ2V0XCIpIDogbnVsbCxcbi8vICAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWUgPSAyO1xuXG4vLyAgICAgICAgICAgICBpZighaXNWYWxpZChzdXBwbGllZFZhbHVlKSl7XG4vLyAgICAgICAgICAgICAgIHZhciBjb29raWVkVmFsdWUgPSBjb29raWVzLmdldCgnY292ZXJzJyksXG4vLyAgICAgICAgICAgICAgICAgICBjb3ZlcnNWYWx1ZSA9IGlzVmFsaWQoY29va2llZFZhbHVlKSA/IGNvb2tpZWRWYWx1ZSA6IGRlZmF1bHRWYWx1ZTtcblxuLy8gICAgICAgICAgICAgICAkcGFydHlTaXplUGlja2VyLk9Uc2VsZWN0KFwic2VsZWN0XCIsIGNvdmVyc1ZhbHVlKTtcbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICB9LFxuLy8gICAgICAgICAgIGRhdGVUaW1lOiBmdW5jdGlvbigpe1xuXG4vLyAgICAgICAgICAgICB2YXIgbWV0cm9EYXRlVGltZSA9IGdldE1ldHJvRGF0ZVRpbWUoJGR0cCksXG4vLyAgICAgICAgICAgICAgICAgbWV0cm9EYXRlID0gbWV0cm9EYXRlVGltZS5mb3JtYXQoXCJZWVlZLU1NLUREXCIpLFxuLy8gICAgICAgICAgICAgICAgIG1ldHJvVGltZSA9IG1ldHJvRGF0ZVRpbWUuZm9ybWF0KFwiSEg6bW1cIik7XG5cbi8vICAgICAgICAgICAgIHZhciBpc1ZhbGlkID0gZnVuY3Rpb24oZGF0ZSwgdGltZSl7XG4vLyAgICAgICAgICAgICAgIGlmKCFkYXRlIHx8ICF0aW1lKXtcbi8vICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4vLyAgICAgICAgICAgICAgIH1cblxuLy8gICAgICAgICAgICAgICB2YXIgdmFsaWRhdGVkID0gZGF0ZVRpbWVWYWxpZGF0b3IuZ2V0KGRhdGUsIHRpbWUsIG1ldHJvRGF0ZSwgbWV0cm9UaW1lKTtcblxuLy8gICAgICAgICAgICAgICByZXR1cm4gdmFsaWRhdGVkLmRhdGUgPT09IGRhdGUgJiYgdmFsaWRhdGVkLnRpbWUgPT09IHRpbWU7XG4vLyAgICAgICAgICAgICB9O1xuXG4vLyAgICAgICAgICAgICB2YXIgc3VwcGxpZWRWYWx1ZSA9IHtcbi8vICAgICAgICAgICAgICAgdGltZTogJHRpbWVQaWNrZXIuT1RzZWxlY3QoXCJpbmZvXCIpLnVuc2VsZWN0ZWRPbkluaXQgPyBudWxsIDogJHRpbWVQaWNrZXIuT1RzZWxlY3QoXCJnZXRcIiksXG4vLyAgICAgICAgICAgICAgIGRhdGU6ICRkYXRlcGlja2VyLk9UZGF0ZXBpY2tlcihcImdldE9yaWdpbmFsVmFsdWVcIilcbi8vICAgICAgICAgICAgIH07XG5cbi8vICAgICAgICAgICAgIHZhciBzZXRWYWx1ZXMgPSAoZnVuY3Rpb24ob3JpZ2luYWxEYXRlLCBvcmlnaW5hbFRpbWUpe1xuLy8gICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24obmV3VmFsdWVzKXtcbi8vICAgICAgICAgICAgICAgICBpZihvcmlnaW5hbERhdGUgIT09IG5ld1ZhbHVlcy5kYXRlKXtcbi8vICAgICAgICAgICAgICAgICAgICRkYXRlcGlja2VyLk9UZGF0ZXBpY2tlcihcInNldFwiLCBuZXdWYWx1ZXMuZGF0ZSk7XG4vLyAgICAgICAgICAgICAgICAgfVxuXG4vLyAgICAgICAgICAgICAgICAgaWYob3JpZ2luYWxUaW1lICE9PSBuZXdWYWx1ZXMudGltZSl7XG4vLyAgICAgICAgICAgICAgICAgICAkdGltZVBpY2tlci5PVHNlbGVjdChcInNlbGVjdFwiLCBuZXdWYWx1ZXMudGltZSk7XG4vLyAgICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgICB9O1xuLy8gICAgICAgICAgICAgfSkoc3VwcGxpZWRWYWx1ZS5kYXRlLCBzdXBwbGllZFZhbHVlLnRpbWUpO1xuXG4vLyAgICAgICAgICAgICBpZighaXNWYWxpZChzdXBwbGllZFZhbHVlLmRhdGUsIHN1cHBsaWVkVmFsdWUudGltZSkpe1xuLy8gICAgICAgICAgICAgICB2YXIgY29va2llZERhdGVUaW1lVmFsdWUgPSBjb29raWVzLmdldCgnZGF0ZXRpbWUnKSxcbi8vICAgICAgICAgICAgICAgICAgIHNwbGl0dGVkID0gISFjb29raWVkRGF0ZVRpbWVWYWx1ZSA/IGNvb2tpZWREYXRlVGltZVZhbHVlLnNwbGl0KFwiIFwiKSA6IFtdLFxuLy8gICAgICAgICAgICAgICAgICAgY29va2llZFZhbHVlID0gc3BsaXR0ZWQubGVuZ3RoID09PSAwID8gdW5kZWZpbmVkIDoge1xuLy8gICAgICAgICAgICAgICAgICAgICBkYXRlOiBzcGxpdHRlZFswXSxcbi8vICAgICAgICAgICAgICAgICAgICAgdGltZTogc3BsaXR0ZWRbMV1cbi8vICAgICAgICAgICAgICAgICAgIH07XG5cbi8vICAgICAgICAgICAgICAgaWYoIWNvb2tpZWRWYWx1ZSl7XG4vLyAgICAgICAgICAgICAgICAgc2V0VmFsdWVzKGRhdGVUaW1lVmFsaWRhdG9yLmdldChzdXBwbGllZFZhbHVlLmRhdGUsIHN1cHBsaWVkVmFsdWUudGltZSwgbWV0cm9EYXRlLCBtZXRyb1RpbWUpKTtcbi8vICAgICAgICAgICAgICAgfSBlbHNlIGlmKGlzVmFsaWQoY29va2llZFZhbHVlLmRhdGUsIGNvb2tpZWRWYWx1ZS50aW1lKSl7XG4vLyAgICAgICAgICAgICAgICAgc2V0VmFsdWVzKGNvb2tpZWRWYWx1ZSk7XG4vLyAgICAgICAgICAgICAgIH0gZWxzZSB7XG4vLyAgICAgICAgICAgICAgICAgc2V0VmFsdWVzKGRhdGVUaW1lVmFsaWRhdG9yLmdldChjb29raWVkVmFsdWUuZGF0ZSwgY29va2llZFZhbHVlLnRpbWUsIG1ldHJvRGF0ZSwgbWV0cm9UaW1lKSk7XG4vLyAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICB9XG4vLyAgICAgICAgIH07XG5cbi8vICAgICAgICAgdmFyIGhpZGVQYXN0VGltZXMgPSBmdW5jdGlvbigpe1xuXG4vLyAgICAgICAgICAgJHRpbWVQaWNrZXIuT1RzZWxlY3QoXCJzaG93QWxsXCIpO1xuXG4vLyAgICAgICAgICAgdmFyIG1ldHJvRGF0ZVRpbWUgPSBnZXRNZXRyb0RhdGVUaW1lKCRkdHApLFxuLy8gICAgICAgICAgICAgICBtZXRyb0RhdGUgPSBtZXRyb0RhdGVUaW1lLmZvcm1hdChcIllZWVktTU0tRERcIiksXG4vLyAgICAgICAgICAgICAgIG1ldHJvVGltZSA9IG1ldHJvRGF0ZVRpbWUuZm9ybWF0KFwiSEg6bW1cIiksXG4vLyAgICAgICAgICAgICAgIGN1cnJlbnREYXRlID0gJGRhdGVwaWNrZXIuT1RkYXRlcGlja2VyKFwiZ2V0XCIsICd5eXl5LW1tLWRkJyksXG4vLyAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eSA9IE9ULkNvbW1vbi5IZWxwZXJzLnRpbWVTbG90c0F2YWlsYWJpbGl0eSgpLFxuLy8gICAgICAgICAgICAgICBhdmFpbGFibGVUaW1lU2xvdHMgPSBhdmFpbGFiaWxpdHkuZ2V0KGN1cnJlbnREYXRlLCBtZXRyb0RhdGUsIG1ldHJvVGltZSksXG4vLyAgICAgICAgICAgICAgIHRpbWVPcHRpb25zID0gJHRpbWVQaWNrZXIuZmluZChcIm9wdGlvblwiKTtcblxuLy8gICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aW1lT3B0aW9ucy5sZW5ndGg7IGkrKyl7XG4vLyAgICAgICAgICAgICB2YXIgJG9wdGlvbiA9ICQodGltZU9wdGlvbnNbaV0pLFxuLy8gICAgICAgICAgICAgICAgIHZhbHVlID0gJG9wdGlvbi5hdHRyKFwidmFsdWVcIik7XG5cbi8vICAgICAgICAgICAgIGlmKCFfLmNvbnRhaW5zKGF2YWlsYWJsZVRpbWVTbG90cywgdmFsdWUpKXtcbi8vICAgICAgICAgICAgICAgJHRpbWVQaWNrZXIuT1RzZWxlY3QoXCJoaWRlXCIsIHZhbHVlKTtcbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICB9XG4vLyAgICAgICAgIH07XG5cbi8vICAgICAgICAgdmFyIGZpeERhdGVUaW1lVmFsdWVzID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuLy8gICAgICAgICAgIGlmKCFfdmFsaWRhdGVEYXRlVGltZSl7XG4vLyAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbi8vICAgICAgICAgICB9XG5cbi8vICAgICAgICAgICB2YXIgbWV0cm9EYXRlVGltZSA9IGdldE1ldHJvRGF0ZVRpbWUoJGR0cCksXG4vLyAgICAgICAgICAgICAgIG1ldHJvRGF0ZSA9IG1ldHJvRGF0ZVRpbWUuZm9ybWF0KFwiWVlZWS1NTS1ERFwiKSxcbi8vICAgICAgICAgICAgICAgbWV0cm9UaW1lID0gbWV0cm9EYXRlVGltZS5mb3JtYXQoXCJISDptbVwiKSxcbi8vICAgICAgICAgICAgICAgY3VycmVudFRpbWUgPSAkdGltZVBpY2tlci5PVHNlbGVjdChcImdldFwiKSxcbi8vICAgICAgICAgICAgICAgY3VycmVudERhdGUgPSAkZGF0ZXBpY2tlci5PVGRhdGVwaWNrZXIoXCJnZXRcIiwgJ3l5eXktbW0tZGQnKSxcbi8vICAgICAgICAgICAgICAgdmFsaWREYXRlVGltZSA9IGRhdGVUaW1lVmFsaWRhdG9yLmdldChjdXJyZW50RGF0ZSwgY3VycmVudFRpbWUsIG1ldHJvRGF0ZSwgbWV0cm9UaW1lKTtcblxuLy8gICAgICAgICAgIGlmKGN1cnJlbnREYXRlICE9PSB2YWxpZERhdGVUaW1lLmRhdGUpe1xuLy8gICAgICAgICAgICAgJGRhdGVwaWNrZXIuT1RkYXRlcGlja2VyKFwic2V0XCIsIHZhbGlkRGF0ZVRpbWUuZGF0ZSk7XG4vLyAgICAgICAgICAgfSBlbHNlIGlmKGN1cnJlbnRUaW1lICE9PSB2YWxpZERhdGVUaW1lLnRpbWUpe1xuLy8gICAgICAgICAgICAgJHRpbWVQaWNrZXIuT1RzZWxlY3QoXCJzZWxlY3RcIiwgdmFsaWREYXRlVGltZS50aW1lKTtcbi8vICAgICAgICAgICB9IGVsc2UgaWYodHlwZW9mKGNhbGxiYWNrKSA9PT0gJ2Z1bmN0aW9uJyl7XG4vLyAgICAgICAgICAgICBjYWxsYmFjaygpO1xuLy8gICAgICAgICAgIH1cbi8vICAgICAgICAgfTtcblxuLy8gICAgICAgICB2YXIgZm9ybUlucHV0cyA9IHtcbi8vICAgICAgICAgICBwYXJ0eVNpemVQaWNrZXI6ICRwYXJ0eVNpemVQaWNrZXIuZmluZChcInNlbGVjdFwiKSxcbi8vICAgICAgICAgICBkYXRlUGlja2VyOiAkZGF0ZXBpY2tlci5maW5kKFwiaW5wdXRcIiksXG4vLyAgICAgICAgICAgdGltZVBpY2tlcjogJHRpbWVQaWNrZXIuZmluZChcInNlbGVjdFwiKSxcbi8vICAgICAgICAgICBzZWFyY2hUZXh0OiAkc2VhcmNoVGV4dCxcbi8vICAgICAgICAgICBzZWFyY2hCdXR0b246ICRmb3JtLmZpbmQoXCJpbnB1dC5idXR0b25cIilcbi8vICAgICAgICAgfTtcblxuLy8gICAgICAgICB2YXIgbGFiZWxJbnB1dHMgPSB7XG4vLyAgICAgICAgICAgcGFydHlTaXplUGlja2VyOiAkcGFydHlTaXplUGlja2VyLmZpbmQoXCJhXCIpLFxuLy8gICAgICAgICAgIGRhdGVQaWNrZXI6ICRkYXRlcGlja2VyLmZpbmQoXCJhXCIpLFxuLy8gICAgICAgICAgIHRpbWVQaWNrZXI6ICR0aW1lUGlja2VyLmZpbmQoXCJhXCIpLFxuLy8gICAgICAgICAgIHNlYXJjaFRleHQ6ICRzZWFyY2hUZXh0XG4vLyAgICAgICAgIH07XG5cbi8vICAgICAgICAgLy8gc2V0cyB1bmlxdWUgdGFiSW5kZXhlcyB0byB0aGUgY29udHJvbHMgaW4gb3JkZXIgdG8gZW5hYmxlIHN3aXRjaGluZyB2aWEga2V5Ym9hcmQgdGFic1xuLy8gICAgICAgICB0YWJJbmRleENvdW50ZXIgPSBzZXRUYWJJbmRleGVzKGZvcm1JbnB1dHMsIHRhYkluZGV4Q291bnRlcik7XG5cbi8vICAgICAgICAgLy8gYmluZHMgZm9jdXMvYmx1ciBldmVudHMgdG8gY29udHJvbHMgaW4gb3JkZXIgdG8gZW5hYmxlIGxhYmVsIGhpZ2hsaWdodGluZyB3aGVuIG1vdXNlIGNsaWNrL2tleWJvYXJkIHRhYiBzd2l0Y2hpbmdcbi8vICAgICAgICAgc2V0SGlnaGxpZ2h0aW5nKGZvcm1JbnB1dHMsIGxhYmVsSW5wdXRzKTtcblxuLy8gICAgICAgICAvLyBzZXRzIGluaXRpYWwgdmFsdWVzXG4vLyAgICAgICAgIHNlbGVjdEluaXRWYWx1ZUZvci5jb3ZlcnMoKTtcbi8vICAgICAgICAgc2VsZWN0SW5pdFZhbHVlRm9yLmRhdGVUaW1lKCk7XG4vLyAgICAgICAgIGhpZGVQYXN0VGltZXMoKTtcblxuLy8gICAgICAgICAvLyBFdmVudHMgYmluZGluZ3Ncbi8vICAgICAgICAgdmFyIGdldFNlYXJjaE9iaiA9IGZ1bmN0aW9uKCl7XG4vLyAgICAgICAgICAgdmFyIGNvdmVycyA9ICRwYXJ0eVNpemVQaWNrZXIuT1RzZWxlY3QoXCJnZXRcIiksXG4vLyAgICAgICAgICAgICAgIHNlbGVjdGVkVGltZSA9ICR0aW1lUGlja2VyLk9Uc2VsZWN0KFwiZ2V0XCIpLFxuLy8gICAgICAgICAgICAgICBzZWxlY3RlZERhdGUgPSAkZGF0ZXBpY2tlci5PVGRhdGVwaWNrZXIoXCJnZXRcIiwgXCJ5eXl5LW1tLWRkXCIpLFxuLy8gICAgICAgICAgICAgICBkYXRlVGltZSA9IHNlbGVjdGVkRGF0ZSArIFwiIFwiICsgc2VsZWN0ZWRUaW1lLFxuLy8gICAgICAgICAgICAgICBzZWFyY2hUZXh0ID0gJHNlYXJjaFRleHQubGVuZ3RoID4gMCA/ICRzZWFyY2hUZXh0LnZhbCgpIDogZmFsc2U7XG5cbi8vICAgICAgICAgICByZXR1cm4ge1xuLy8gICAgICAgICAgICAgY292ZXJzOiBjb3ZlcnMsXG4vLyAgICAgICAgICAgICBkYXRldGltZTogZGF0ZVRpbWUsXG4vLyAgICAgICAgICAgICBzZWFyY2hUZXh0OiBzZWFyY2hUZXh0LFxuLy8gICAgICAgICAgICAgc2VuZGVyOiAkZHRwXG4vLyAgICAgICAgICAgfTtcbi8vICAgICAgICAgfTtcblxuLy8gICAgICAgICB2YXIgb25EVFBDaGFuZ2VkID0gZnVuY3Rpb24oKXtcbi8vICAgICAgICAgICBpZihfc2hvdWxkRW1pdENoYW5nZWRFdmVudCl7XG4vLyAgICAgICAgICAgICBoaWRlUGFzdFRpbWVzKCk7XG4vLyAgICAgICAgICAgICB2YXIgc2VhcmNoT2JqID0gZ2V0U2VhcmNoT2JqKCk7XG4vLyAgICAgICAgICAgICBjb29raWVzLnNldChzZWFyY2hPYmopO1xuLy8gICAgICAgICAgICAgT1QuRXZlbnRzLmZpcmUoXCJkdHA6Y2hhbmdlXCIsIHNlYXJjaE9iaik7XG4vLyAgICAgICAgICAgfVxuLy8gICAgICAgICB9O1xuXG4vLyAgICAgICAgIHZhciBzZWFyY2hUZXh0VmFsdWUgPSAkc2VhcmNoVGV4dC5sZW5ndGggPiAwID8gJHNlYXJjaFRleHQudmFsKCkgOiBmYWxzZTtcbi8vICAgICAgICAgJHNlYXJjaFRleHQua2V5dXAoZnVuY3Rpb24oKXtcbi8vICAgICAgICAgICB2YXIgbmV3VmFsdWUgPSAkc2VhcmNoVGV4dC5sZW5ndGggPiAwID8gJHNlYXJjaFRleHQudmFsKCkgOiBmYWxzZTtcblxuLy8gICAgICAgICAgIGlmKG5ld1ZhbHVlICE9PSBzZWFyY2hUZXh0VmFsdWUpe1xuLy8gICAgICAgICAgICAgc2VhcmNoVGV4dFZhbHVlID0gbmV3VmFsdWU7XG4vLyAgICAgICAgICAgICBvbkRUUENoYW5nZWQoKTtcbi8vICAgICAgICAgICB9XG4vLyAgICAgICAgIH0pO1xuXG4vLyAgICAgICAgICRmb3JtLnN1Ym1pdChmdW5jdGlvbihlKXtcbi8vICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4vLyAgICAgICAgICAgT1QuRXZlbnRzLmZpcmUoXCJkdHA6c2VhcmNoXCIsIGdldFNlYXJjaE9iaigpKTtcbi8vICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4vLyAgICAgICAgIH0pO1xuXG4vLyAgICAgICAgIE9ULkV2ZW50cy5vbihcImRhdGVwaWNrZXI6Y2hhbmdlXCIsIGZ1bmN0aW9uKGUsIGRhdGEpe1xuLy8gICAgICAgICAgIGlmKGRhdGEuc2VuZGVyLmlzKCRkYXRlcGlja2VyKSl7XG4vLyAgICAgICAgICAgICBmaXhEYXRlVGltZVZhbHVlcyhvbkRUUENoYW5nZWQpO1xuLy8gICAgICAgICAgIH1cbi8vICAgICAgICAgfSk7XG5cbi8vICAgICAgICAgT1QuRXZlbnRzLm9uKFwic2VsZWN0OmNoYW5nZVwiLCBmdW5jdGlvbihlLCBkYXRhKXtcbi8vICAgICAgICAgICBpZihkYXRhLnNlbmRlci5pcygkdGltZVBpY2tlcikpe1xuLy8gICAgICAgICAgICAgZml4RGF0ZVRpbWVWYWx1ZXMob25EVFBDaGFuZ2VkKTtcbi8vICAgICAgICAgICB9IGVsc2UgaWYoZGF0YS5zZW5kZXIuaXMoJHBhcnR5U2l6ZVBpY2tlcikpe1xuLy8gICAgICAgICAgICAgb25EVFBDaGFuZ2VkKCk7XG4vLyAgICAgICAgICAgfVxuLy8gICAgICAgICB9KTtcblxuLy8gICAgICAgICAvLyBhbGwgZG9uZSAtIG1ha2UgaXQgdmlzaWJsZVxuLy8gICAgICAgICAkZHRwLnJlbW92ZUNsYXNzKFwiaGlkZVwiKTtcbi8vICAgICAgICAgT1QuRXZlbnRzLmZpcmUoXCJkdHA6cmVuZGVyZWRcIiwgZ2V0U2VhcmNoT2JqKCkpO1xuLy8gICAgICAgfSk7XG4vLyAgICAgfSxcblxuLy8gICAgIHNldDogZnVuY3Rpb24oJGR0cCwgb2JqKXtcblxuLy8gICAgICAgb2JqID0gb2JqIHx8IHt9O1xuXG4vLyAgICAgICB2YXIgcGFydHlDaGFuZ2VkID0gZmFsc2UsXG4vLyAgICAgICAgICAgdGltZUNoYW5nZWQgPSBmYWxzZSxcbi8vICAgICAgICAgICBkYXRlQ2hhbmdlZCA9IGZhbHNlLFxuLy8gICAgICAgICAgIHNlYXJjaENoYW5nZWQgPSBmYWxzZSxcbi8vICAgICAgICAgICAkcGFydHlTaXplUGlja2VyID0gJGR0cC5maW5kKHNlbGVjdG9ycy5wYXJ0eVNpemVQaWNrZXIpLFxuLy8gICAgICAgICAgICRkYXRlUGlja2VyID0gJGR0cC5maW5kKHNlbGVjdG9ycy5kYXRlUGlja2VyKSxcbi8vICAgICAgICAgICAkdGltZVBpY2tlciA9ICRkdHAuZmluZChzZWxlY3RvcnMudGltZVBpY2tlciksXG4vLyAgICAgICAgICAgJHNlYXJjaFRleHQgPSAkZHRwLmZpbmQoc2VsZWN0b3JzLnNlYXJjaFRleHQpLFxuLy8gICAgICAgICAgIGZpZWxkc0NoYW5nZWQgPSAwLFxuLy8gICAgICAgICAgIGZpZWxkc1RvQ2hhbmdlID0gMDtcblxuLy8gICAgICAgaWYoISFvYmouY292ZXJzKXtcbi8vICAgICAgICAgaWYoJHBhcnR5U2l6ZVBpY2tlci5PVHNlbGVjdChcImdldFwiKS50b1N0cmluZygpICE9PSBvYmouY292ZXJzLnRvU3RyaW5nKCkpe1xuLy8gICAgICAgICAgIHBhcnR5Q2hhbmdlZCA9IHRydWU7XG4vLyAgICAgICAgICAgZmllbGRzVG9DaGFuZ2UrKztcbi8vICAgICAgICAgfVxuLy8gICAgICAgfVxuXG4vLyAgICAgICBpZighIW9iai5kYXRlKXtcbi8vICAgICAgICAgaWYoJGRhdGVQaWNrZXIuT1RkYXRlcGlja2VyKFwiZ2V0XCIsIFwieXl5eS1tbS1kZFwiKS50b1N0cmluZygpICE9PSBvYmouZGF0ZS50b1N0cmluZygpKXtcbi8vICAgICAgICAgICBkYXRlQ2hhbmdlZCA9IHRydWU7XG4vLyAgICAgICAgICAgZmllbGRzVG9DaGFuZ2UrKztcbi8vICAgICAgICAgfVxuLy8gICAgICAgfVxuXG4vLyAgICAgICBpZighIW9iai50aW1lKXtcbi8vICAgICAgICAgaWYoJHRpbWVQaWNrZXIuT1RzZWxlY3QoXCJnZXRcIikudG9TdHJpbmcoKSAhPT0gb2JqLnRpbWUudG9TdHJpbmcoKSl7XG4vLyAgICAgICAgICAgdGltZUNoYW5nZWQgPSB0cnVlO1xuLy8gICAgICAgICAgIGZpZWxkc1RvQ2hhbmdlKys7XG4vLyAgICAgICAgIH1cbi8vICAgICAgIH1cblxuLy8gICAgICAgaWYodHlwZW9mKG9iai5zZWFyY2hUZXh0KSAhPT0gJ3VuZGVmaW5lZCcpe1xuLy8gICAgICAgICBzZWFyY2hDaGFuZ2VkID0gdHJ1ZTtcbi8vICAgICAgICAgZmllbGRzVG9DaGFuZ2UrKztcbi8vICAgICAgIH1cblxuLy8gICAgICAgdmFyIHVwZGF0ZUNoYW5nZUV2ZW50RW1pdHRlckNoZWNrID0gZnVuY3Rpb24oKXtcbi8vICAgICAgICAgX3Nob3VsZEVtaXRDaGFuZ2VkRXZlbnQgPSAoZmllbGRzVG9DaGFuZ2UgLSBmaWVsZHNDaGFuZ2VkKSA8IDI7XG4vLyAgICAgICB9O1xuXG4vLyAgICAgICB1cGRhdGVDaGFuZ2VFdmVudEVtaXR0ZXJDaGVjaygpO1xuXG4vLyAgICAgICBpZihwYXJ0eUNoYW5nZWQpe1xuLy8gICAgICAgICAkcGFydHlTaXplUGlja2VyLk9Uc2VsZWN0KFwic2VsZWN0XCIsIG9iai5jb3ZlcnMpO1xuLy8gICAgICAgICBmaWVsZHNDaGFuZ2VkKys7XG4vLyAgICAgICAgIHVwZGF0ZUNoYW5nZUV2ZW50RW1pdHRlckNoZWNrKCk7XG4vLyAgICAgICB9XG5cbi8vICAgICAgIGlmKGRhdGVDaGFuZ2VkKXtcbi8vICAgICAgICAgaWYodGltZUNoYW5nZWQpe1xuLy8gICAgICAgICAgIF92YWxpZGF0ZURhdGVUaW1lID0gZmFsc2U7XG4vLyAgICAgICAgIH1cbi8vICAgICAgICAgJGRhdGVQaWNrZXIuT1RkYXRlcGlja2VyKFwic2V0XCIsIG9iai5kYXRlKTtcbi8vICAgICAgICAgZmllbGRzQ2hhbmdlZCsrO1xuLy8gICAgICAgICB1cGRhdGVDaGFuZ2VFdmVudEVtaXR0ZXJDaGVjaygpO1xuLy8gICAgICAgfVxuXG4vLyAgICAgICBpZih0aW1lQ2hhbmdlZCl7XG4vLyAgICAgICAgIF92YWxpZGF0ZURhdGVUaW1lID0gdHJ1ZTtcbi8vICAgICAgICAgJHRpbWVQaWNrZXIuT1RzZWxlY3QoXCJzaG93QWxsXCIpO1xuLy8gICAgICAgICAkdGltZVBpY2tlci5PVHNlbGVjdChcInNlbGVjdFwiLCBvYmoudGltZSk7XG4vLyAgICAgICAgIGZpZWxkc0NoYW5nZWQrKztcbi8vICAgICAgICAgdXBkYXRlQ2hhbmdlRXZlbnRFbWl0dGVyQ2hlY2soKTtcbi8vICAgICAgIH1cblxuLy8gICAgICAgaWYoc2VhcmNoQ2hhbmdlZCl7XG4vLyAgICAgICAgIGlmKG9iai5zZWFyY2hUZXh0ID09PSBmYWxzZSl7XG4vLyAgICAgICAgICAgJHNlYXJjaFRleHQudmFsKCcnKS5wYXJlbnQoKS5hZGRDbGFzcyhcImhpZGVcIikucGFyZW50KCkucmVtb3ZlQ2xhc3MoXCJ3aXRoLXNlYXJjaFwiKTtcbi8vICAgICAgICAgfSBlbHNlIHtcbi8vICAgICAgICAgICAkc2VhcmNoVGV4dC52YWwob2JqLnNlYXJjaFRleHQpLnBhcmVudCgpLnJlbW92ZUNsYXNzKFwiaGlkZVwiKS5wYXJlbnQoKS5hZGRDbGFzcyhcIndpdGgtc2VhcmNoXCIpO1xuLy8gICAgICAgICB9XG4vLyAgICAgICAgIGZpZWxkc0NoYW5nZWQrKztcbi8vICAgICAgICAgdXBkYXRlQ2hhbmdlRXZlbnRFbWl0dGVyQ2hlY2soKTtcbi8vICAgICAgIH1cbi8vICAgICB9XG4vLyAgIH07XG5cbi8vICAgJC5mbi5PVGR0cCA9IGZ1bmN0aW9uKGFjdGlvbiwgcGFyYW0pe1xuXG4vLyAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCl7XG4vLyAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuXG4vLyAgICAgICBpZihhY3Rpb24gPT09IFwiaW5pdFwiKXtcbi8vICAgICAgICAgcmV0dXJuIGR0cC5pbml0KCR0aGlzKTtcbi8vICAgICAgIH0gZWxzZSBpZihhY3Rpb24gPT09IFwic2V0XCIpe1xuLy8gICAgICAgICByZXR1cm4gZHRwLnNldCgkdGhpcywgcGFyYW0pO1xuLy8gICAgICAgfVxuLy8gICAgIH0pO1xuLy8gICB9O1xuXG4vLyAgIHJldHVybiBkdHA7XG4vLyB9KShqUXVlcnksIF8sIG1vbWVudCk7XG4vLyBPVC5jcmVhdGVOUygnT1QuQ29tbW9uLkRhdGVQaWNrZXInKTtcblxuLy8gT1QuQ29tbW9uLkRhdGVQaWNrZXIgPSAoZnVuY3Rpb24oJCwgbW9tZW50KXtcbi8vICAgJ3VzZSBzdHJpY3QnO1xuXG4vLyAgIHZhciBnZXRMYWJlbFZhbHVlID0gZnVuY3Rpb24oJGRwKXtcblxuLy8gICAgIHZhciBzZWxlY3RlZERheSA9ICRkcC5nZXQoJ2hpZ2hsaWdodCcsICd5eXl5LW1tLWRkJyksXG4vLyAgICAgICAgIHRvZGF5ID0gbW9tZW50KCkuZm9ybWF0KCdZWVlZLU1NLUREJyksXG4vLyAgICAgICAgIHRvbW9ycm93ID0gbW9tZW50KCkuYWRkKDEsICdkYXlzJykuZm9ybWF0KCdZWVlZLU1NLUREJyksXG4vLyAgICAgICAgIGlzVG9kYXkgPSAodG9kYXkgPT09IHNlbGVjdGVkRGF5KSxcbi8vICAgICAgICAgaXNUb21vcnJvdyA9ICh0b21vcnJvdyA9PT0gc2VsZWN0ZWREYXkpLFxuLy8gICAgICAgICB0ZXh0TGFiZWwgPSAkZHAuZ2V0KCk7XG5cbi8vICAgICBpZihPVC5Db21tb24uVGVzdE9iamVjdC5pc0FjdGl2ZSgndG9kYXl0b21vcnJvdycpKXtcbi8vICAgICAgIGlmKGlzVG9kYXkpe1xuLy8gICAgICAgICByZXR1cm4gT1QuU1JTLnRvZGF5O1xuLy8gICAgICAgfSBlbHNlIGlmKGlzVG9tb3Jyb3cpIHtcbi8vICAgICAgICAgcmV0dXJuIE9ULlNSUy50b21vcnJvdztcbi8vICAgICAgIH1cbi8vICAgICB9XG5cbi8vICAgICByZXR1cm4gdGV4dExhYmVsO1xuLy8gICB9O1xuXG4vLyAgIHZhciBkYXRlcGlja2VyID0ge1xuLy8gICAgIGdldDogZnVuY3Rpb24oJGRhdGVwaWNrZXIsIG9wdGlvbmFsRm9ybWF0KXtcbi8vICAgICAgIHZhciAkZGF0ZXBpY2tlcklucHV0ID0gJGRhdGVwaWNrZXIuZmluZCgnaW5wdXQnKSxcbi8vICAgICAgICAgICAkcGlja2VyID0gJGRhdGVwaWNrZXJJbnB1dC5waWNrYWRhdGUoJ3BpY2tlcicpO1xuXG4vLyAgICAgICBpZighIW9wdGlvbmFsRm9ybWF0KXtcbi8vICAgICAgICAgcmV0dXJuICRwaWNrZXIuZ2V0KCdzZWxlY3QnLCBvcHRpb25hbEZvcm1hdCk7XG4vLyAgICAgICB9XG5cbi8vICAgICAgIHJldHVybiAkcGlja2VyLmdldCgnc2VsZWN0Jyk7XG4vLyAgICAgfSxcbi8vICAgICBnZXRPcmlnaW5hbFZhbHVlOiBmdW5jdGlvbigkZGF0ZXBpY2tlcil7XG4vLyAgICAgICByZXR1cm4gJGRhdGVwaWNrZXIuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLXZhbHVlJyk7XG4vLyAgICAgfSxcbi8vICAgICBpbml0OiBmdW5jdGlvbigkZGF0ZXBpY2tlciwgbWluRGF0ZSl7XG5cbi8vICAgICAgIHZhciBjc3NDbGFzcyA9ICRkYXRlcGlja2VyLmF0dHIoJ2NsYXNzJyksXG4vLyAgICAgICAgICAgZGF0ZVZhbHVlID0gJGRhdGVwaWNrZXIudmFsKCksXG4vLyAgICAgICAgICAgJHBhcmVudCA9ICRkYXRlcGlja2VyLnBhcmVudCgpLFxuLy8gICAgICAgICAgIGlzSmFwYW5lc2UgPSBmYWxzZSxcbi8vICAgICAgICAgICBjYWxlbmRhclN0YXJ0c1N1bmRheSA9ICh0eXBlb2YoT1QpICE9PSAndW5kZWZpbmVkJyAmJiAhIU9ULlNSUykgPyAhIU9ULlNSUy5jYWxlbmRhclN0YXJ0c1N1bmRheSA6IHRydWU7XG5cbi8vICAgICAgIHZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKGRhdGVWYWx1ZSl7XG5cbi8vICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiJyArIGNzc0NsYXNzICsgJ1wiPicgK1xuLy8gICAgICAgICAgICAgICAgJyAgPGEgY2xhc3M9XCJkdHAtcGlja2VyLXNlbGVjdG9yLWxpbmsgZGF0ZS1sYWJlbCBkdHAtcGlja2VyLWxhYmVsXCI+JyArIGRhdGVWYWx1ZSArICc8L2E+JyArXG4vLyAgICAgICAgICAgICAgICAnICA8aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwiZGF0ZXBpY2tlclwiIGNsYXNzPVwiZGF0ZXBpY2tlciBkdHAtcGlja2VyLXNlbGVjdFwiIGRhdGEtdmFsdWU9XCInICsgZGF0ZVZhbHVlICsgJ1wiIC8+JyArXG4vLyAgICAgICAgICAgICAgICAnPC9kaXY+Jztcbi8vICAgICAgIH07XG5cbi8vICAgICAgIGlmKGRhdGVWYWx1ZSA9PT0gJycpe1xuLy8gICAgICAgICBkYXRlVmFsdWUgPSBtb21lbnQoKS5mb3JtYXQoJ1lZWVktTU0tREQnKTtcbi8vICAgICAgIH1cblxuLy8gICAgICAgJGRhdGVwaWNrZXIuYWZ0ZXIodGVtcGxhdGUoZGF0ZVZhbHVlKSk7XG4vLyAgICAgICAkZGF0ZXBpY2tlci5yZW1vdmUoKTtcbi8vICAgICAgICRkYXRlcGlja2VyID0gJHBhcmVudC5maW5kKCcuJyArIGNzc0NsYXNzLnJlcGxhY2UoLyAvZywgJy4nKSk7XG5cbi8vICAgICAgIHZhciAkbGFiZWwgPSAkZGF0ZXBpY2tlci5maW5kKCcuZGF0ZS1sYWJlbCcpLFxuLy8gICAgICAgICAgICRkYXRlUGlja2VySW5wdXQgPSAkZGF0ZXBpY2tlci5maW5kKCdpbnB1dCcpO1xuXG4vLyAgICAgICBpZihPVC5TUlMubGFuZyl7XG4vLyAgICAgICAgIHNldHVwTGFuZ3VhZ2UoT1QuU1JTLmxhbmcpO1xuLy8gICAgICAgICBpZihPVC5TUlMubGFuZyA9PT0gJ2phJyl7XG4vLyAgICAgICAgICAgaXNKYXBhbmVzZSA9IHRydWU7XG4vLyAgICAgICAgIH1cbi8vICAgICAgIH1cblxuLy8gICAgICAgdmFyIGZpeEphcGFuZXNlWWVhck1vbnRoTGFiZWwgPSBmdW5jdGlvbigpe1xuLy8gICAgICAgICAvLyBJbiBjYXNlIG9mIEphcGFuZXNlLCB3ZSBkaXNwbGF5IFllYXIgZmlyc3QgKyDlubQgKyBtb250aCBvbiB0aGUgbW9udGgncyBsYWJlbC5cblxuLy8gICAgICAgICB2YXIgJGhlYWRlclllYXIgPSAkZGF0ZXBpY2tlci5maW5kKCcucGlja2VyX195ZWFyJyksXG4vLyAgICAgICAgICAgICAkaGVhZGVyTW9udGggPSAkZGF0ZXBpY2tlci5maW5kKCcucGlja2VyX19tb250aCcpLFxuLy8gICAgICAgICAgICAgJHBhcmVudCA9ICRoZWFkZXJNb250aC5wYXJlbnQoKSxcbi8vICAgICAgICAgICAgIG91dGVySHRtbCA9IGZ1bmN0aW9uKCRlbCl7IHJldHVybiAkKCc8ZGl2IC8+JykuYXBwZW5kKCRlbC5jbG9uZSgpKS5odG1sKCk7IH0sXG4vLyAgICAgICAgICAgICBuZXdIZWFkZXJDb250ZW50ID0gb3V0ZXJIdG1sKCRoZWFkZXJZZWFyKSArIG91dGVySHRtbCgkaGVhZGVyTW9udGgpO1xuXG4vLyAgICAgICAgICRoZWFkZXJZZWFyLnJlbW92ZSgpO1xuLy8gICAgICAgICAkaGVhZGVyTW9udGgucmVtb3ZlKCk7XG4vLyAgICAgICAgICRwYXJlbnQucHJlcGVuZChuZXdIZWFkZXJDb250ZW50KTtcbi8vICAgICAgICAgJGhlYWRlclllYXIgPSAkZGF0ZXBpY2tlci5maW5kKCcucGlja2VyX195ZWFyJyk7XG5cbi8vICAgICAgICAgdmFyIGhlYWRlclllYXJUZXh0ID0gJGhlYWRlclllYXIudGV4dCgpO1xuXG4vLyAgICAgICAgIGlmKGhlYWRlclllYXJUZXh0LmluZGV4T2YoJ+W5tCcpIDwgMCl7XG4vLyAgICAgICAgICAgJGhlYWRlclllYXIudGV4dChoZWFkZXJZZWFyVGV4dCArICflubQnKTtcbi8vICAgICAgICAgfVxuLy8gICAgICAgfTtcblxuLy8gICAgICAgdmFyIGNsb3NlRHBJZk9wZW5lZCA9IGZ1bmN0aW9uKCRkcCl7XG4vLyAgICAgICAgIGlmKCEhJGRwLmdldCgnb3BlbicpKXtcbi8vICAgICAgICAgICAkZHAuY2xvc2UoKTtcbi8vICAgICAgICAgfVxuLy8gICAgICAgfTtcblxuLy8gICAgICAgdmFyIGdldFJlbmRlclBvc2l0aW9uID0gZnVuY3Rpb24oKXtcbi8vICAgICAgICAgdmFyIGNhbGVuZGFySGVpZ2h0ID0gMjkwLFxuLy8gICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSAkZGF0ZVBpY2tlcklucHV0LmhlaWdodCgpLFxuLy8gICAgICAgICAgICAgZGF0ZVBpY2tlck9mZnNldCA9IHBhcnNlSW50KCRkYXRlcGlja2VyLm9mZnNldCgpLnRvcCwgMTApLFxuLy8gICAgICAgICAgICAgYm9keVNjcm9sbCA9IChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCkgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AsXG4vLyAgICAgICAgICAgICAkYm9keSA9ICQoJ2JvZHknKSxcbi8vICAgICAgICAgICAgIGJvZHlIZWlnaHQgPSAkYm9keS5oZWlnaHQoKSxcbi8vICAgICAgICAgICAgIG1hcmdpbkJvdHRvbSA9IGJvZHlTY3JvbGwgKyBib2R5SGVpZ2h0IC0gbGFiZWxIZWlnaHQgLSBkYXRlUGlja2VyT2Zmc2V0LFxuLy8gICAgICAgICAgICAgbWFyZ2luVG9wID0gZGF0ZVBpY2tlck9mZnNldCAtIGJvZHlTY3JvbGw7XG5cbi8vICAgICAgICAgcmV0dXJuIG1hcmdpblRvcCA8IGNhbGVuZGFySGVpZ2h0ID8gJ2Rvd24nIDogKG1hcmdpbkJvdHRvbSA+PSBjYWxlbmRhckhlaWdodCA/ICdkb3duJyA6ICd1cCcpO1xuLy8gICAgICAgfTtcblxuLy8gICAgICAgJGRhdGVQaWNrZXJJbnB1dC5waWNrYWRhdGUoe1xuLy8gICAgICAgICBmaXJzdERheTogY2FsZW5kYXJTdGFydHNTdW5kYXkgPyAwIDogMSxcbi8vICAgICAgICAgbWluOiBtaW5EYXRlID8gbW9tZW50KG1pbkRhdGUpLnRvRGF0ZSgpIDogbmV3IERhdGUoKSxcbi8vICAgICAgICAgZm9ybWF0U3VibWl0OiAneXl5eS1tbS1kZCcsXG4vLyAgICAgICAgIGhpZGRlblByZWZpeDogJ3N1Ym1pdF8nLFxuLy8gICAgICAgICBoaWRkZW5TdWZmaXg6ICcnLFxuLy8gICAgICAgICB0b2RheTogJycsXG4vLyAgICAgICAgIGNsZWFyOiAnJyxcbi8vICAgICAgICAgZm9ybWF0OiBPVC5Db21tb24uSGVscGVycy5nZXREYXRlRm9ybWF0SlMoKSxcbi8vICAgICAgICAgb25TdGFydDogZnVuY3Rpb24gKCkge1xuLy8gICAgICAgICAgIHZhciB0aGlzRGF0ZXBpY2tlciA9IHRoaXM7XG4vLyAgICAgICAgICAgJGxhYmVsLnRleHQoZ2V0TGFiZWxWYWx1ZSh0aGlzRGF0ZXBpY2tlcikpO1xuXG4vLyAgICAgICAgICAgT1QuRXZlbnRzLm9uKCdtZW51czpjbGVhcmVkJywgZnVuY3Rpb24oKXtcbi8vICAgICAgICAgICAgIGlmKCRsYWJlbC5oYXNDbGFzcygncGlja2VyLW9wZW5pbmcnKSl7XG4vLyAgICAgICAgICAgICAgICRsYWJlbC5yZW1vdmVDbGFzcygncGlja2VyLW9wZW5pbmcnKTtcbi8vICAgICAgICAgICAgIH0gZWxzZSB7XG4vLyAgICAgICAgICAgICAgIGNsb3NlRHBJZk9wZW5lZCh0aGlzRGF0ZXBpY2tlcik7XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgfSk7XG4vLyAgICAgICAgIH0sXG5cbi8vICAgICAgICAgb25PcGVuOiBmdW5jdGlvbigpe1xuLy8gICAgICAgICAgIGlmKGlzSmFwYW5lc2Upe1xuLy8gICAgICAgICAgICAgZml4SmFwYW5lc2VZZWFyTW9udGhMYWJlbCgpO1xuLy8gICAgICAgICAgIH1cblxuLy8gICAgICAgICAgICRsYWJlbC5hZGRDbGFzcygncGlja2VyLW9wZW5pbmcnKTtcbi8vICAgICAgICAgICBPVC5Db21tb24uTWVudXMuY2xvc2VBbGxNZW51cygpO1xuLy8gICAgICAgICAgICRsYWJlbC5hZGRDbGFzcygnbWVudS1vcGVuZWQnKTtcblxuLy8gICAgICAgICAgIHZhciAkY2FsID0gJGRhdGVwaWNrZXIuZmluZCgnLnBpY2tlcicpLFxuLy8gICAgICAgICAgICAgICByZW5kZXJQb3NpdGlvbiA9IGdldFJlbmRlclBvc2l0aW9uKCk7XG5cbi8vICAgICAgICAgICAkY2FsLnJlbW92ZUNsYXNzKCd1cCcpLnJlbW92ZUNsYXNzKCdkb3duJykuYWRkQ2xhc3MocmVuZGVyUG9zaXRpb24pO1xuLy8gICAgICAgICB9LFxuLy8gICAgICAgICBvbkNsb3NlOiBmdW5jdGlvbigpe1xuLy8gICAgICAgICAgICRsYWJlbC5yZW1vdmVDbGFzcygnbWVudS1vcGVuZWQnKTtcbi8vICAgICAgICAgfSxcbi8vICAgICAgICAgb25TZXQ6IGZ1bmN0aW9uKCl7XG4vLyAgICAgICAgICAgJGxhYmVsLnRleHQoZ2V0TGFiZWxWYWx1ZSh0aGlzKSk7XG4vLyAgICAgICAgICAgT1QuRXZlbnRzLmZpcmUoJ2RhdGVwaWNrZXI6Y2hhbmdlJywgeyBzZW5kZXI6ICRkYXRlcGlja2VyIH0pO1xuXG4vLyAgICAgICAgICAgaWYoaXNKYXBhbmVzZSl7XG4vLyAgICAgICAgICAgICBmaXhKYXBhbmVzZVllYXJNb250aExhYmVsKCk7XG4vLyAgICAgICAgICAgfVxuLy8gICAgICAgICB9XG4vLyAgICAgICB9KTtcblxuLy8gICAgICAgcmV0dXJuICRkYXRlcGlja2VyO1xuLy8gICAgIH0sXG4vLyAgICAgcmVmcmVzaDogZnVuY3Rpb24oJGRhdGVwaWNrZXIpe1xuLy8gICAgICAgdmFyICRkYXRlcGlja2VySW5wdXQgPSAkZGF0ZXBpY2tlci5maW5kKCdpbnB1dCcpO1xuXG4vLyAgICAgICBpZigkZGF0ZXBpY2tlcklucHV0Lmxlbmd0aCA9PT0gMCl7XG4vLyAgICAgICAgIHJldHVybjtcbi8vICAgICAgIH1cblxuLy8gICAgICAgdmFyICRkcCA9ICRkYXRlcGlja2VySW5wdXQucGlja2FkYXRlKCdwaWNrZXInKTtcblxuLy8gICAgICAgaWYoJGRwLmxlbmd0aCA9PT0gMCl7XG4vLyAgICAgICAgIHJldHVybjtcbi8vICAgICAgIH1cblxuLy8gICAgICAgdmFyICRsYWJlbCA9ICRkYXRlcGlja2VyLmZpbmQoJy5kYXRlLWxhYmVsJyk7XG5cbi8vICAgICAgIGlmKCRsYWJlbC5sZW5ndGggPT09IDApe1xuLy8gICAgICAgICByZXR1cm47XG4vLyAgICAgICB9XG5cbi8vICAgICAgICRsYWJlbC50ZXh0KGdldExhYmVsVmFsdWUoJGRwKSk7XG4vLyAgICAgfSxcbi8vICAgICBzZXQ6IGZ1bmN0aW9uKCRkYXRlcGlja2VyLCB2YWx1ZSwgZm9ybWF0KXtcbi8vICAgICAgIHZhciAkZGF0ZXBpY2tlcklucHV0ID0gJGRhdGVwaWNrZXIuZmluZCgnaW5wdXQnKSxcbi8vICAgICAgICAgICBvcHRpb25hbEZvcm1hdCA9IGZvcm1hdCB8fCB7IGZvcm1hdDogJ3l5eXktbW0tZGQnIH07XG5cbi8vICAgICAgIHJldHVybiAkZGF0ZXBpY2tlcklucHV0LnBpY2thZGF0ZSgncGlja2VyJykuc2V0KCdzZWxlY3QnLCB2YWx1ZSwgb3B0aW9uYWxGb3JtYXQpO1xuLy8gICAgIH1cbi8vICAgfTtcblxuLy8gICB2YXIgc2V0dXBMYW5ndWFnZSA9IGZ1bmN0aW9uKGxhbmcpe1xuLy8gICAgIGlmKGxhbmcgPT09ICdlcycpe1xuLy8gICAgICAgJC5leHRlbmQoJC5mbi5waWNrYWRhdGUuZGVmYXVsdHMsIHtcbi8vICAgICAgICAgbW9udGhzRnVsbDogWyAnZW5lcm8nLCAnZmVicmVybycsICdtYXJ6bycsICdhYnJpbCcsICdtYXlvJywgJ2p1bmlvJywgJ2p1bGlvJywgJ2Fnb3N0bycsICdzZXB0aWVtYnJlJywgJ29jdHVicmUnLCAnbm92aWVtYnJlJywgJ2RpY2llbWJyZScgXSxcbi8vICAgICAgICAgbW9udGhzU2hvcnQ6IFsgJ2VuZScsICdmZWInLCAnbWFyJywgJ2FicicsICdtYXknLCAnanVuJywgJ2p1bCcsICdhZ28nLCAnc2VwJywgJ29jdCcsICdub3YnLCAnZGljJyBdLFxuLy8gICAgICAgICB3ZWVrZGF5c0Z1bGw6IFsgJ2RvbWluZ28nLCAnbHVuZXMnLCAnbWFydGVzJywgJ21pw6lyY29sZXMnLCAnanVldmVzJywgJ3ZpZXJuZXMnLCAnc8OhYmFkbycgXSxcbi8vICAgICAgICAgd2Vla2RheXNTaG9ydDogWyAnZG9tJywgJ2x1bicsICdtYXInLCAnbWnDqScsICdqdWUnLCAndmllJywgJ3PDoWInIF0sXG4vLyAgICAgICAgIHRvZGF5OiAnaG95Jyxcbi8vICAgICAgICAgY2xlYXI6ICdib3JyYXInLFxuLy8gICAgICAgICBsYWJlbE1vbnRoTmV4dDogJ01lcyBwcsOzeGltbycsXG4vLyAgICAgICAgIGxhYmVsTW9udGhQcmV2OiAnTWVzIGFudGVyaW9yJ1xuLy8gICAgICAgfSk7XG4vLyAgICAgfSBlbHNlIGlmKGxhbmcgPT09ICdqYScpe1xuLy8gICAgICAgJC5leHRlbmQoJC5mbi5waWNrYWRhdGUuZGVmYXVsdHMsIHtcbi8vICAgICAgICAgbW9udGhzRnVsbDogWyAnMeaciCcsICcy5pyIJywgJzPmnIgnLCAnNOaciCcsICc15pyIJywgJzbmnIgnLCAnN+aciCcsICc45pyIJywgJznmnIgnLCAnMTDmnIgnLCAnMTHmnIgnLCAnMTLmnIgnIF0sXG4vLyAgICAgICAgIG1vbnRoc1Nob3J0OiBbICcx5pyIJywgJzLmnIgnLCAnM+aciCcsICc05pyIJywgJzXmnIgnLCAnNuaciCcsICc35pyIJywgJzjmnIgnLCAnOeaciCcsICcxMOaciCcsICcxMeaciCcsICcxMuaciCcgXSxcbi8vICAgICAgICAgd2Vla2RheXNGdWxsOiBbICfml6UnLCAn5pyIJywgJ+eBqycsICfmsLQnLCAn5pyoJywgJ+mHkScsICflnJ8nIF0sXG4vLyAgICAgICAgIHdlZWtkYXlzU2hvcnQ6IFsgJ+aXpScsICfmnIgnLCAn54GrJywgJ+awtCcsICfmnKgnLCAn6YeRJywgJ+WcnycgXSxcbi8vICAgICAgICAgdG9kYXk6ICfku4rml6UnLFxuLy8gICAgICAgICBjbGVhcjogJ+a2iOWOuycsXG4vLyAgICAgICAgIGxhYmVsTW9udGhOZXh0OiAn5qyh5pyIJyxcbi8vICAgICAgICAgbGFiZWxNb250aFByZXY6ICfliY3mnIgnXG4vLyAgICAgICB9KTtcbi8vICAgICB9IGVsc2UgaWYobGFuZyA9PT0gJ2ZyJyl7XG4vLyAgICAgICAkLmV4dGVuZCgkLmZuLnBpY2thZGF0ZS5kZWZhdWx0cywge1xuLy8gICAgICAgICBtb250aHNGdWxsOiBbICdKYW52aWVyJywgJ0bDqXZyaWVyJywgJ01hcnMnLCAnQXZyaWwnLCAnTWFpJywgJ0p1aW4nLCAnSnVpbGxldCcsICdBb8O7dCcsICdTZXB0ZW1icmUnLCAnT2N0b2JyZScsICdOb3ZlbWJyZScsICdEw6ljZW1icmUnIF0sXG4vLyAgICAgICAgIG1vbnRoc1Nob3J0OiBbICdKYW4nLCAnRmV2JywgJ01hcicsICdBdnInLCAnTWFpJywgJ0p1aW4nLCAnSnVpbCcsICdBb3UnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJyBdLFxuLy8gICAgICAgICB3ZWVrZGF5c0Z1bGw6IFsgJ0RpbWFuY2hlJywgJ0x1bmRpJywgJ01hcmRpJywgJ01lcmNyZWRpJywgJ0pldWRpJywgJ1ZlbmRyZWRpJywgJ1NhbWVkaScgXSxcbi8vICAgICAgICAgd2Vla2RheXNTaG9ydDogWyAnRGltJywgJ0x1bicsICdNYXInLCAnTWVyJywgJ0pldScsICdWZW4nLCAnU2FtJyBdLFxuLy8gICAgICAgICB0b2RheTogJ0F1am91cmRcXCdodWknLFxuLy8gICAgICAgICBjbGVhcjogJ0VmZmFjZXInLFxuLy8gICAgICAgICBsYWJlbE1vbnRoTmV4dDogJ01vaXMgc3VpdmFudCcsXG4vLyAgICAgICAgIGxhYmVsTW9udGhQcmV2OiAnTW9pcyBwcsOpY8OpZGVudCdcbi8vICAgICAgIH0pO1xuLy8gICAgIH0gZWxzZSBpZihsYW5nID09PSAnZGUnKXtcbi8vICAgICAgICQuZXh0ZW5kKCQuZm4ucGlja2FkYXRlLmRlZmF1bHRzLCB7XG4vLyAgICAgICAgIG1vbnRoc0Z1bGw6IFsgJ0phbnVhcicsICdGZWJydWFyJywgJ03DpHJ6JywgJ0FwcmlsJywgJ01haScsICdKdW5pJywgJ0p1bGknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPa3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlemVtYmVyJyBdLFxuLy8gICAgICAgICBtb250aHNTaG9ydDogWyAnSmFuJywgJ0ZlYicsICdNw6RyJywgJ0FwcicsICdNYWknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09rdCcsICdOb3YnLCAnRGV6JyBdLFxuLy8gICAgICAgICB3ZWVrZGF5c0Z1bGw6IFsgJ1Nvbm50YWcnLCAnTW9udGFnJywgJ0RpZW5zdGFnJywgJ01pdHR3b2NoJywgJ0Rvbm5lcnN0YWcnLCAnRnJlaXRhZycsICdTYW1zdGFnJyBdLFxuLy8gICAgICAgICB3ZWVrZGF5c1Nob3J0OiBbICdTbycsICdNbycsICdEaScsICdNaScsICdEbycsICdGcicsICdTYScgXSxcbi8vICAgICAgICAgdG9kYXk6ICdIZXV0ZScsXG4vLyAgICAgICAgIGNsZWFyOiAnTMO2c2NoZW4nLFxuLy8gICAgICAgICBsYWJlbE1vbnRoTmV4dDogJ07DpGNoc3RlJyxcbi8vICAgICAgICAgbGFiZWxNb250aFByZXY6ICdGcsO8aGVyJ1xuLy8gICAgICAgfSk7XG4vLyAgICAgfVxuLy8gICB9O1xuXG4vLyAgICQuZm4uT1RkYXRlcGlja2VyID0gZnVuY3Rpb24oYWN0aW9uLCBwYXJhbSwgcGFyYW0yKXtcblxuLy8gICAgIHZhciAkdGhpcyA9IHRoaXM7XG5cbi8vICAgICBpZihhY3Rpb24gPT09ICdpbml0Jyl7XG4vLyAgICAgICByZXR1cm4gZGF0ZXBpY2tlci5pbml0KCR0aGlzLCBwYXJhbSk7XG4vLyAgICAgfSBlbHNlIGlmKGFjdGlvbiA9PT0gJ2dldCcpe1xuLy8gICAgICAgcmV0dXJuIGRhdGVwaWNrZXIuZ2V0KCR0aGlzLCBwYXJhbSk7XG4vLyAgICAgfSBlbHNlIGlmKGFjdGlvbiA9PT0gJ2dldE9yaWdpbmFsVmFsdWUnKXtcbi8vICAgICAgIHJldHVybiBkYXRlcGlja2VyLmdldE9yaWdpbmFsVmFsdWUoJHRoaXMsIHBhcmFtKTtcbi8vICAgICB9IGVsc2UgaWYoYWN0aW9uID09PSAncmVmcmVzaCcpe1xuLy8gICAgICAgcmV0dXJuIGRhdGVwaWNrZXIucmVmcmVzaCgkdGhpcyk7XG4vLyAgICAgfSBlbHNlIGlmKGFjdGlvbiA9PT0gJ3NldCcpe1xuLy8gICAgICAgcmV0dXJuIGRhdGVwaWNrZXIuc2V0KCR0aGlzLCBwYXJhbSwgcGFyYW0yKTtcbi8vICAgICB9XG5cbi8vICAgICByZXR1cm4gdGhpcztcbi8vICAgfTtcblxuLy8gICByZXR1cm4ge1xuLy8gICAgIGluaXQ6IGRhdGVwaWNrZXIuaW5pdCxcbi8vICAgICBnZXQ6IGRhdGVwaWNrZXIuZ2V0LFxuLy8gICAgIGdldE9yaWdpbmFsVmFsdWU6IGRhdGVwaWNrZXIuZ2V0T3JpZ2luYWxWYWx1ZSxcbi8vICAgICBzZXQ6IGRhdGVwaWNrZXIuc2V0XG4vLyAgIH07XG5cbi8vIH0pKGpRdWVyeSwgbW9tZW50KTtcbi8vXG4vL1xuLy8gJ3VzZSBzdHJpY3QnO1xuXG4vLyB2YXIgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG4vLyB2YXIgcmVxdWVzdCA9IHJlcXVpcmUoJ3JlcXVlc3QnKTtcbi8vIHZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG4vLyB2YXIgbGFuZ3VhZ2VzID0gcmVxdWlyZSgnLi9sYW5ndWFnZXMnKTtcbi8vIHZhciBvZmZzZXRzID0gcmVxdWlyZSgnLi9vZmZzZXRzJyk7XG5cbi8vIHZhciBnZXQgPSB7XG4vLyAgIGRhdGU6IGZ1bmN0aW9uKGRhdGVUaW1lKXtcbi8vICAgICByZXR1cm4gISFkYXRlVGltZSA/IG1vbWVudChkYXRlVGltZSkuZm9ybWF0KCdZWVlZLU1NLUREJykgOiAnJztcbi8vICAgfSxcbi8vICAgbG9jYWxpc2VkVGltZTogZnVuY3Rpb24odGltZSwgdGhlbWUsIGxhbmcpe1xuLy8gICAgIHZhciBkYXRlVGltZSA9IG1vbWVudCgnMjAwMS0wMS0wMVQnICsgdGltZSksXG4vLyAgICAgICAgIGZvcm1hdHRlZFRpbWUgPSBkYXRlVGltZS5mb3JtYXQoJ0hIOm1tJyk7XG5cbi8vICAgICByZXR1cm4gKCEhdGhlbWUubWF0Y2goJ2NvbXxteCcpICYmIGxhbmcgIT09ICdmcicpID8gZGF0ZVRpbWUuZm9ybWF0KCdoOm1tJykgKyAnICcgKyBkYXRlVGltZS5mb3JtYXQoJ0EnKSA6IGZvcm1hdHRlZFRpbWU7XG4vLyAgIH0sXG4vLyAgIHBhcnR5U2l6ZTogZnVuY3Rpb24ocGFydHlTaXplLCBzaG93TGFyZ2VyUGFydHkpe1xuLy8gICAgIHBhcnR5U2l6ZSA9ICEhcGFydHlTaXplID8gKHBhcnR5U2l6ZSA9PT0gJzIwKycgPyAyMSA6IHBhcnNlSW50KHBhcnR5U2l6ZSwgMTApKSA6IDA7XG4vLyAgICAgcmV0dXJuICghc2hvd0xhcmdlclBhcnR5ICYmIHBhcnR5U2l6ZSA9PT0gMjEpID8gMCA6IHBhcnR5U2l6ZTtcbi8vICAgfSxcbi8vICAgdGltZTogZnVuY3Rpb24oZGF0ZVRpbWUpe1xuLy8gICAgIHJldHVybiAhIWRhdGVUaW1lID8gbW9tZW50KGRhdGVUaW1lLnJlcGxhY2UoJ1onLCAnJykpLmZvcm1hdCgnSEg6bW0nKSA6ICcnO1xuLy8gICB9XG4vLyB9O1xuXG4vLyB2YXIgdGhlbWVzQW5kTGFuZ3MgPSB7XG4vLyAgIGNvbTogWydlbicsICdmciddLFxuLy8gICBjb3VrOiBbJ2VuJ10sXG4vLyAgIGRlOiBbJ2RlJywgJ2VuJ10sXG4vLyAgIGllOiBbJ2VuJ10sXG4vLyAgIGpwOiBbJ2phJywgJ2VuJ10sXG4vLyAgIG14OiBbJ2VzJywgJ2VuJ10sXG4vLyAgIGF1OiBbJ2VuJ11cbi8vIH07XG5cbi8vIHZhciBjYWNoZWQgPSB7fTtcblxuLy8gbW9kdWxlLmV4cG9ydHMuZGF0YSA9IGZ1bmN0aW9uKGNvbnRleHQsIGNhbGxiYWNrKXtcblxuLy8gICB2YXIgaXNBY2NlcHRMYW5ndWFnZVZhbGlkID0gXy5pc0FycmF5KGNvbnRleHQuYWNjZXB0TGFuZ3VhZ2UpICYmICFfLmlzRW1wdHkoY29udGV4dC5hY2NlcHRMYW5ndWFnZSkgJiYgISFjb250ZXh0LmFjY2VwdExhbmd1YWdlWzBdLmNvZGUsXG4vLyAgICAgICBwYXJzZWRMYW5ndWFnZSA9IGlzQWNjZXB0TGFuZ3VhZ2VWYWxpZCA/IGNvbnRleHQuYWNjZXB0TGFuZ3VhZ2VbMF0uY29kZSA6ICcqJyxcbi8vICAgICAgIHRoZW1lQXJnID0gY29udGV4dC5wYXJhbXMudGhlbWUsXG4vLyAgICAgICB0aGVtZSA9ICghIXRoZW1lQXJnICYmIF8uaGFzKHRoZW1lc0FuZExhbmdzLCB0aGVtZUFyZykpID8gdGhlbWVBcmcgOiAnY29tJyxcbi8vICAgICAgIGxhbmdzRm9yVGhlbWUgPSB0aGVtZXNBbmRMYW5nc1t0aGVtZV0sXG4vLyAgICAgICBsYW5ndWFnZSA9IF8uY29udGFpbnMobGFuZ3NGb3JUaGVtZSwgcGFyc2VkTGFuZ3VhZ2UpID8gcGFyc2VkTGFuZ3VhZ2UgOiBsYW5nc0ZvclRoZW1lWzBdLFxuLy8gICAgICAgc2hvd1NlYXJjaCA9IGNvbnRleHQucGFyYW1zLnNob3dTZWFyY2ggfHwgZmFsc2UsXG4vLyAgICAgICBjYWNoZUZsdXNoVGltZW91dCA9IDEwICogNjAgKiAxMDAwO1xuXG4vLyAgIHZhciBnZXRUaW1lem9uZXNEYXRhID0gZnVuY3Rpb24oY2Ipe1xuLy8gICAgIGlmKCEhY2FjaGVkLnRpbWV6b25lcyl7XG4vLyAgICAgICBjYihudWxsLCBjYWNoZWQudGltZXpvbmVzKTtcbi8vICAgICB9IGVsc2Uge1xuLy8gICAgICAgdmFyIGRhdGFBcGlVcmwgPSBjb250ZXh0LnBsdWdpbnMuZGlzY292ZXIoJ29jLWNvcmUtZGF0YScpIHx8IHVuZGVmaW5lZDtcblxuLy8gICAgICAgaWYoISFkYXRhQXBpVXJsKXtcbi8vICAgICAgICAgZGF0YUFwaVVybCArPSAnL29jL2R0cCc7XG5cbi8vICAgICAgICAgcmVxdWVzdCh7XG4vLyAgICAgICAgICAgdXJsOiBkYXRhQXBpVXJsLFxuLy8gICAgICAgICAgIHRpbWVvdXQ6IDMwMDBcbi8vICAgICAgICAgfSwgZnVuY3Rpb24oZXJyLCByZXMsIGJvZHkpe1xuLy8gICAgICAgICAgIGlmKGVyciB8fCByZXMuc3RhdHVzQ29kZSAhPT0gMjAwKXsgcmV0dXJuIGNiKGVyciwgb2Zmc2V0cyk7IH1cbi8vICAgICAgICAgICB0cnkge1xuLy8gICAgICAgICAgICAgdmFyIHZhbHVlID0gSlNPTi5wYXJzZShib2R5KTtcbi8vICAgICAgICAgICAgIGNhY2hlZC50aW1lem9uZXMgPSB2YWx1ZTtcblxuLy8gICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuLy8gICAgICAgICAgICAgICBjYWNoZWQudGltZXpvbmVzID0gbnVsbDtcbi8vICAgICAgICAgICAgIH0sIGNhY2hlRmx1c2hUaW1lb3V0KTtcblxuLy8gICAgICAgICAgICAgY2IobnVsbCwgdmFsdWUpO1xuLy8gICAgICAgICAgIH0gY2F0Y2goZSl7XG4vLyAgICAgICAgICAgICBjYihlLCBvZmZzZXRzKTtcbi8vICAgICAgICAgICB9XG4vLyAgICAgICAgIH0pO1xuLy8gICAgICAgfSBlbHNlIHtcbi8vICAgICAgICAgY2IoJ3NlcnZpY2Ugbm90IGRpc2NvdmVyZWQnLCBvZmZzZXRzKTtcbi8vICAgICAgIH1cbi8vICAgICB9XG4vLyAgIH07XG5cbi8vICAgZ2V0VGltZXpvbmVzRGF0YShmdW5jdGlvbihlcnIsIGRhdGEpe1xuXG4vLyAgICAgdmFyIG9mZnNldHNGb3JUaGVtZSA9IGRhdGFbdGhlbWVdLFxuLy8gICAgICAgICBvZmZzZXRzRm9yTGFuZyA9IF8uY29udGFpbnMoXy5rZXlzKG9mZnNldHNGb3JUaGVtZSksIGxhbmd1YWdlKSA/IG9mZnNldHNGb3JUaGVtZVtsYW5ndWFnZV0gOiBvZmZzZXRzRm9yVGhlbWVbXy5rZXlzKG9mZnNldHNGb3JUaGVtZSlbMF1dLFxuLy8gICAgICAgICBvZmZzZXQgPSBvZmZzZXRzRm9yTGFuZy5kZWZhdWx0O1xuXG4vLyAgICAgaWYoISFjb250ZXh0LnBhcmFtcy5tZXRyb0lkICYmICEhb2Zmc2V0c0ZvckxhbmcuZXhjZXB0aW9ucyAmJiAhIW9mZnNldHNGb3JMYW5nLmV4Y2VwdGlvbnNbY29udGV4dC5wYXJhbXMubWV0cm9JZF0pe1xuLy8gICAgICAgb2Zmc2V0ID0gb2Zmc2V0c0ZvckxhbmcuZXhjZXB0aW9uc1tjb250ZXh0LnBhcmFtcy5tZXRyb0lkXTtcbi8vICAgICB9XG5cbi8vICAgICB2YXIgX18gPSBmdW5jdGlvbih0ZXJtKXtcbi8vICAgICAgIHZhciBkaWN0aW9uYXJ5ID0gbGFuZ3VhZ2VzW2xhbmd1YWdlXTtcbi8vICAgICAgIHJldHVybiBfLmhhcyhkaWN0aW9uYXJ5LCB0ZXJtKSA/IGRpY3Rpb25hcnlbdGVybV0gOiAnJztcbi8vICAgICB9O1xuXG4vLyAgICAgdmFyIHNlYXJjaFBsYWNlaG9sZGVyID0gKCEhc2hvd1NlYXJjaCAmJiAhIWNvbnRleHQucGFyYW1zLnNlYXJjaFBsYWNlaG9sZGVyKSA/IGNvbnRleHQucGFyYW1zLnNlYXJjaFBsYWNlaG9sZGVyIDogX18oJ3RleHRQbGFjZWhvbGRlcicpLFxuLy8gICAgICAgICBzaG93TGFyZ2VyUGFydHkgPSBjb250ZXh0LnBhcmFtcy5zaG93TGFyZ2VyUGFydHkgPT09IGZhbHNlID8gZmFsc2UgOiB0cnVlLFxuLy8gICAgICAgICB0aW1lT3B0aW9ucyA9IFtdO1xuXG4vLyAgICAgZm9yKHZhciBpID0gMDsgaTwyNDsgaSsrKXtcbi8vICAgICAgIHZhciB2YWx1ZSA9IChpIDwgMTAgPyAnMCcgOiAnJykgKyBpICsgJzowMCcsXG4vLyAgICAgICAgICAgaGFsZlZhbHVlID0gKGkgPCAxMCA/ICcwJyA6ICcnKSArIGkgKyAnOjMwJztcblxuLy8gICAgICAgdGltZU9wdGlvbnMucHVzaCh7XG4vLyAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbi8vICAgICAgICAgZGlzcGxheVZhbHVlOiBnZXQubG9jYWxpc2VkVGltZSh2YWx1ZSwgdGhlbWUsIGxhbmd1YWdlKVxuLy8gICAgICAgfSk7XG5cbi8vICAgICAgIHRpbWVPcHRpb25zLnB1c2goe1xuLy8gICAgICAgICB2YWx1ZTogaGFsZlZhbHVlLFxuLy8gICAgICAgICBkaXNwbGF5VmFsdWU6IGdldC5sb2NhbGlzZWRUaW1lKGhhbGZWYWx1ZSwgdGhlbWUsIGxhbmd1YWdlKVxuLy8gICAgICAgfSk7XG4vLyAgICAgfVxuXG4vLyAgICAgY2FsbGJhY2sobnVsbCwge1xuLy8gICAgICAgc2hvd1NlYXJjaDogY29udGV4dC5wYXJhbXMuc2hvd1NlYXJjaCB8fCBmYWxzZSxcbi8vICAgICAgIHRpbWU6IGdldC50aW1lKGNvbnRleHQucGFyYW1zLmRhdGVUaW1lKSxcbi8vICAgICAgIGRhdGU6IGdldC5kYXRlKGNvbnRleHQucGFyYW1zLmRhdGVUaW1lKSxcbi8vICAgICAgIHBhcnR5U2l6ZTogZ2V0LnBhcnR5U2l6ZShjb250ZXh0LnBhcmFtcy5wYXJ0eVNpemUsIHNob3dMYXJnZXJQYXJ0eSksXG4vLyAgICAgICB0aW1lT3B0aW9uczogdGltZU9wdGlvbnMsXG4vLyAgICAgICBwYXJ0eVNpemVTaW5ndWxhcjogX18oJ3BhcnR5U2luZ3VsYXInKSxcbi8vICAgICAgIHBhcnR5U2l6ZVBsdXJhbDogX18oJ3BhcnR5UGx1cmFsJyksXG4vLyAgICAgICBwYXJ0eVNpemVMYXJnZXJQYXJ0eTogX18oJ3BhcnR5TGFyZ2VyJyksXG4vLyAgICAgICBmaW5kQVRhYmxlOiBfXygnZmluZEFUYWJsZScpLFxuLy8gICAgICAgYXV0b2NvbXBsZXRlUGxhY2Vob2xkZXI6IHNlYXJjaFBsYWNlaG9sZGVyLFxuLy8gICAgICAgdGltZXpvbmVPZmZzZXQ6IG9mZnNldCxcbi8vICAgICAgIGxhbmd1YWdlOiBsYW5ndWFnZSxcbi8vICAgICAgIHNob3dMYXJnZXJQYXJ0eTogc2hvd0xhcmdlclBhcnR5XG4vLyAgICAgfSk7XG4vLyAgIH0pO1xuLy8gfTtcbi8vbWl4aW4gcGFydHlTaXplRGlzcGxheVZhbHVlKGlzU2VsZWN0ZWQsIGkpXG4gIC8vIC0gdmFyIGRpc3BsYXlWYWx1ZSA9IHBhcnR5U2l6ZVBsdXJhbC5yZXBsYWNlKCd7MH0nLCBpKTtcbiAgLy8gLSBpZihpID09PSAxKVxuICAvLyAgIC0gZGlzcGxheVZhbHVlID0gcGFydHlTaXplU2luZ3VsYXIucmVwbGFjZSgnezB9JywgaSk7XG4gIC8vIC0gZWxzZSBpZihpID09PSAyMSlcbiAgLy8gICAtIGRpc3BsYXlWYWx1ZSA9IHBhcnR5U2l6ZUxhcmdlclBhcnR5O1xuICAvLyAtIGlmKGlzU2VsZWN0ZWQpXG4gIC8vICAgb3B0aW9uKHZhbHVlPWksIHNlbGVjdGVkPVwic2VsZWN0ZWRcIikgI3tkaXNwbGF5VmFsdWV9XG4gIC8vIC0gZWxzZVxuICAvLyAgIG9wdGlvbih2YWx1ZT1pKSAje2Rpc3BsYXlWYWx1ZX1cblxuLy8gLSB2YXIgZXh0cmFDc3NDbGFzcyA9IHNob3dTZWFyY2ggPyBcIiB3aXRoLXNlYXJjaFwiIDogXCJcIjtcbi8vIGRpdihjbGFzcz1cImR0cC1waWNrZXIgaGlkZSBkdHAtbGFuZy1cIiArIGxhbmd1YWdlICsgZXh0cmFDc3NDbGFzcylcbiAgLy8gZm9ybS5kdHAtcGlja2VyLWZvcm1cbiAgLy8gICAtIGlmICh0aW1lem9uZU9mZnNldCAhPSBudWxsKVxuICAvLyAgICAgaW5wdXQodHlwZT1cImhpZGRlblwiLCBuYW1lPVwidGltZXpvbmVPZmZzZXRcIiwgdmFsdWU9dGltZXpvbmVPZmZzZXQpXG4gIC8vICAgc2VsZWN0LnBhcnR5LXNpemUtcGlja2VyLmhpZGVcbiAgLy8gICAgIC0gZm9yICh2YXIgaSA9IDE7IGkgPCAoc2hvd0xhcmdlclBhcnR5ID8gMjIgOiAyMSk7IGkrKylcbiAgLy8gICAgICAgK3BhcnR5U2l6ZURpc3BsYXlWYWx1ZSgoaSA9PT0gcGFydHlTaXplKSwgaSlcbiAgLy8gICBpbnB1dC5kYXRlLXBpY2tlci5kdHAtcGlja2VyLXNlbGVjdG9yKHZhbHVlPWRhdGUsIHR5cGU9XCJ0ZXh0XCIpXG4gIC8vICAgc2VsZWN0LnRpbWUtcGlja2VyLmhpZGVcbiAgLy8gICAgIC0gZm9yICh2YXIgaSA9IDA7IGkgPCB0aW1lT3B0aW9ucy5sZW5ndGg7IGkrKyl7XG4gIC8vICAgICAgIC0gdmFyIGRpc3BsYXlWYWx1ZSA9IHRpbWVPcHRpb25zW2ldW1wiZGlzcGxheVZhbHVlXCJdO1xuICAvLyAgICAgICAtIHZhciB2YWx1ZSA9IHRpbWVPcHRpb25zW2ldW1widmFsdWVcIl07XG4gIC8vICAgICAgIC0gdmFyIGlzU2VsZWN0ZWQgPSB2YWx1ZSA9PT0gdGltZTtcbiAgLy8gICAgICAgLSBpZihpc1NlbGVjdGVkKVxuICAvLyAgICAgICAgIG9wdGlvbih2YWx1ZT12YWx1ZSwgc2VsZWN0ZWQ9XCJzZWxlY3RlZFwiKSAje2Rpc3BsYXlWYWx1ZX1cbiAgLy8gICAgICAgLSBlbHNlXG4gIC8vICAgICAgICAgb3B0aW9uKHZhbHVlPXZhbHVlKSAje2Rpc3BsYXlWYWx1ZX1cbiAgLy8gICAgIC0gfVxuICAvLyAgIC0gaWYoc2hvd1NlYXJjaCl7XG4gIC8vICAgICBkaXYuZHRwLXBpY2tlci1zZWFyY2gtY29udGFpbmVyXG4gIC8vICAgICAgIGRpdi5kdHAtcGlja2VyLXNlYXJjaC1pY29uLmljb24tc2VhcmNoXG4gIC8vICAgICAgIGlucHV0LmR0cC1waWNrZXItc2VhcmNoKHR5cGU9XCJ0ZXh0XCIsIG5hbWU9XCJzZWFyY2hUZXh0XCIsIHZhbHVlPVwiXCIsIHBsYWNlaG9sZGVyPWF1dG9jb21wbGV0ZVBsYWNlaG9sZGVyLCBkYXRhLWJpbmQ9XCJcIilcbiAgLy8gICAtIH1cbiAgLy8gICBpbnB1dC5idXR0b24uZHRwLXBpY2tlci1idXR0b24odHlwZT1cInN1Ym1pdFwiLCB2YWx1ZT1maW5kQVRhYmxlKVxuICAvL1xuICAvL1xuICAvLyAvLyAgIC8qKlxuIC8vICogU2VsZWN0IC0gdHJhbnNmb3JtIGFuIGh0bWwgc2VsZWN0IHdpdGggb3B0aW9ucyB0byBhIG5ldyBkZXNpZ25lZCBvbmUsXG4gLy8gKiB3aXRoIHN0eWxpbmcsIG1lbnVzLCBoYW5kbGVycywgZXRjLlxuIC8vICpcbiAvLyAqL1xuXG4vLyBPVC5jcmVhdGVOUygnT1QuQ29tbW9uLlNlbGVjdCcpO1xuXG4vLyBPVC5Db21tb24uU2VsZWN0ID0gKGZ1bmN0aW9uKCQsIF8pe1xuICAvLyAndXNlIHN0cmljdCc7XG5cbiAgLy8gdmFyIF9kYXRhID0ge307XG5cbiAgLy8gdmFyIHRlbXBsYXRlID0gZnVuY3Rpb24obSl7XG5cbiAgLy8gICB2YXIgdCA9ICAnPGRpdiBjbGFzcz1cIicgKyBtLmNzc0NsYXNzICsgJyBkdHAtcGlja2VyLXNlbGVjdG9yIHNlbGVjdC1uYXRpdmUnKyAobS51bnNlbGVjdGVkT25Jbml0ID8gXCIgdW5zZWxlY3RlZC1vbi1pbml0XCIgOiAnJykgKydcIj4nICtcbiAgLy8gICAgICAgICAgICAnICA8YSBjbGFzcz1cInNlbGVjdC1sYWJlbCBkdHAtcGlja2VyLXNlbGVjdG9yLWxpbmtcIiB0YWJpbmRleD1cIi0xXCI+JyArIG0uc2VsZWN0ZWRWYWx1ZSArICc8L2E+JyArXG4gIC8vICAgICAgICAgICAgJyAgPHNlbGVjdCBuYW1lPVwiJyArIG0ubmFtZSArICdcIj4nO1xuXG4gIC8vICAgZm9yKHZhciBpID0gMDsgaSA8IG0ub3B0aW9ucy5sZW5ndGg7IGkrKyl7XG4gIC8vICAgICB2YXIgb3B0aW9uID0gIG0ub3B0aW9uc1tpXSxcbiAgLy8gICAgICAgICBpc0NoZWNrZWQgPSBvcHRpb24uc2VsZWN0ZWQgPyBcIiBzZWxlY3RlZD1cXFwic2VsZWN0ZWRcXFwiXCIgOiAnJztcblxuICAvLyAgICAgdCArPSAnICAgIDxvcHRpb24gdmFsdWU9XCInICsgb3B0aW9uLnZhbHVlICsgJ1wiJyArIGlzQ2hlY2tlZCArICc+JyArIG9wdGlvbi5kaXNwbGF5ICsgJzwvb3B0aW9uPic7XG4gIC8vICAgfVxuXG4gIC8vICAgdCArPSAnICA8L3NlbGVjdD4nICtcbiAgLy8gICAgICAgICc8L2Rpdj4nO1xuXG4gIC8vICAgcmV0dXJuIHQ7XG4gIC8vIH07XG5cbiAgLy8gdmFyIGdldFVuaXF1ZU5hbWUgPSBmdW5jdGlvbigpe1xuICAvLyAgIHZhciBjID0gMCxcbiAgLy8gICAgICAgbmFtZSA9IFwiU2VsZWN0X1wiICsgYztcblxuICAvLyAgIHdoaWxlKCQoXCJzZWxlY3RbbmFtZT0nXCIgKyBuYW1lICsgXCInXVwiKS5sZW5ndGggPiAwKXtcbiAgLy8gICAgIGMrKztcbiAgLy8gICAgIG5hbWUgPSBcIlNlbGVjdF9cIiArIGM7XG4gIC8vICAgfVxuXG4gIC8vICAgcmV0dXJuIG5hbWU7XG4gIC8vIH07XG5cbiAgLy8gdmFyIGdldFNlbGVjdE1vZGVsID0gZnVuY3Rpb24oJHNlbGVjdCl7XG5cbiAgLy8gICB2YXIgb3V0ZXJIdG1sID0gZnVuY3Rpb24oJGVsKXsgcmV0dXJuICQoXCI8ZGl2IC8+XCIpLmFwcGVuZCgkZWwuY2xvbmUoKSkuaHRtbCgpOyB9LFxuICAvLyAgICAgICB1bnNlbGVjdGVkT25Jbml0ID0gZmFsc2U7XG5cbiAgLy8gICB2YXIgbmFtZSA9IGdldFVuaXF1ZU5hbWUoKSxcbiAgLy8gICAgICAgbW9kZWwgPSB7XG4gIC8vICAgICAgICAgbmFtZTogbmFtZSxcbiAgLy8gICAgICAgICBjc3NDbGFzczogJHNlbGVjdC5hdHRyKFwiY2xhc3NcIikgfHwgXCJcIixcbiAgLy8gICAgICAgICB1bnNlbGVjdGVkT25Jbml0OiBmYWxzZSxcbiAgLy8gICAgICAgICBvcHRpb25zOiBfLm1hcCgkc2VsZWN0LmZpbmQoXCJvcHRpb25cIiksIGZ1bmN0aW9uKG9wdGlvbil7XG4gIC8vICAgICAgICAgICB2YXIgJG9wdGlvbiA9ICQob3B0aW9uKSxcbiAgLy8gICAgICAgICAgICAgICBzZWxlY3RlZCA9ICRvcHRpb24ucHJvcCgnc2VsZWN0ZWQnKTtcblxuICAvLyAgICAgICAgICAgaWYoISFzZWxlY3RlZCAmJiBvdXRlckh0bWwoJG9wdGlvbikuaW5kZXhPZihcInNlbGVjdGVkXCIpID09PSAtMSl7XG4gIC8vICAgICAgICAgICAgIHVuc2VsZWN0ZWRPbkluaXQgPSB0cnVlO1xuICAvLyAgICAgICAgICAgfVxuXG4gIC8vICAgICAgICAgICByZXR1cm4ge1xuICAvLyAgICAgICAgICAgICBkaXNwbGF5OiAkb3B0aW9uLnRleHQoKSxcbiAgLy8gICAgICAgICAgICAgdmFsdWU6ICRvcHRpb24udmFsKCksXG4gIC8vICAgICAgICAgICAgIHNlbGVjdGVkOiBzZWxlY3RlZFxuICAvLyAgICAgICAgICAgfTtcbiAgLy8gICAgICAgICB9KVxuICAvLyAgICAgICB9O1xuXG4gIC8vICAgX2RhdGFbbmFtZV0gPSBtb2RlbC5vcHRpb25zO1xuXG4gIC8vICAgdmFyIHNlbGVjdGVkID0gXy5maW5kV2hlcmUobW9kZWwub3B0aW9ucywgeyBzZWxlY3RlZDogdHJ1ZSB9KTtcbiAgLy8gICBtb2RlbC5zZWxlY3RlZFZhbHVlID0gISFzZWxlY3RlZCA/IHNlbGVjdGVkLmRpc3BsYXkgOiAnJztcblxuICAvLyAgIGlmKG1vZGVsLnNlbGVjdGVkVmFsdWUgPT09ICcnIHx8IHVuc2VsZWN0ZWRPbkluaXQpe1xuICAvLyAgICAgbW9kZWwudW5zZWxlY3RlZE9uSW5pdCA9IHRydWU7XG4gIC8vICAgfVxuXG4gIC8vICAgcmV0dXJuIG1vZGVsO1xuICAvLyB9O1xuXG4gIC8vIHZhciB0cmFuc2Zvcm1TZWxlY3QgPSBmdW5jdGlvbigkc2VsZWN0KXtcbiAgLy8gICAkc2VsZWN0LmFkZENsYXNzKFwiaGlkZVwiKTtcblxuICAvLyAgIHZhciAkcGFyZW50ID0gJHNlbGVjdC5wYXJlbnQoKSxcbiAgLy8gICAgICAgbW9kZWwgPSBnZXRTZWxlY3RNb2RlbCgkc2VsZWN0KTtcblxuICAvLyAgICRzZWxlY3QuYWZ0ZXIodGVtcGxhdGUobW9kZWwpKTtcbiAgLy8gICAkc2VsZWN0LnJlbW92ZSgpO1xuXG4gIC8vICAgdmFyICRuZXdTZWxlY3QgPSAkcGFyZW50LmZpbmQoXCIuXCIgKyBtb2RlbC5jc3NDbGFzcy5yZXBsYWNlKC8gL2csICcuJykpLFxuICAvLyAgICAgICAkbGFiZWwgPSAkbmV3U2VsZWN0LmZpbmQoXCIuc2VsZWN0LWxhYmVsXCIpO1xuXG4gIC8vICAgJGxhYmVsLnRleHQobW9kZWwuc2VsZWN0ZWRWYWx1ZSk7XG4gIC8vICAgJG5ld1NlbGVjdC5yZW1vdmVDbGFzcyhcImhpZGVcIik7XG5cbiAgLy8gICByZXR1cm4gJG5ld1NlbGVjdDtcbiAgLy8gfTtcblxuICAvLyB2YXIgc2VsZWN0ID0ge1xuXG4gIC8vICAgZ2V0OiBmdW5jdGlvbigkc2VsZWN0KXtcbiAgLy8gICAgIHJldHVybiAkc2VsZWN0LmZpbmQoXCJzZWxlY3RcIikudmFsKCk7XG4gIC8vICAgfSxcblxuICAvLyAgIGhpZGU6IGZ1bmN0aW9uKCRzZWxlY3QsIHZhbHVlcyl7XG4gIC8vICAgICBpZighXy5pc0FycmF5KHZhbHVlcykpe1xuICAvLyAgICAgICB2YWx1ZXMgPSBbdmFsdWVzXTtcbiAgLy8gICAgIH1cblxuICAvLyAgICAgXy5mb3JFYWNoKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpe1xuICAvLyAgICAgICB2YXIgb3B0aW9uVG9IaWRlID0gJHNlbGVjdC5maW5kKFwib3B0aW9uW3ZhbHVlPSdcIiArIHZhbHVlICsgXCInXVwiKTtcbiAgLy8gICAgICAgaWYob3B0aW9uVG9IaWRlLmxlbmd0aCA+IDApe1xuICAvLyAgICAgICAgIG9wdGlvblRvSGlkZS5yZW1vdmUoKTtcbiAgLy8gICAgICAgfVxuICAvLyAgICAgfSk7XG4gIC8vICAgfSxcblxuICAvLyAgIGluZm86IGZ1bmN0aW9uKCRzZWxlY3Qpe1xuICAvLyAgICAgcmV0dXJuIHtcbiAgLy8gICAgICAgdW5zZWxlY3RlZE9uSW5pdDogJHNlbGVjdC5oYXNDbGFzcyhcInVuc2VsZWN0ZWQtb24taW5pdFwiKVxuICAvLyAgICAgfTtcbiAgLy8gICB9LFxuXG4gIC8vICAgaW5pdDogZnVuY3Rpb24oJHNlbGVjdCl7XG4gIC8vICAgICB2YXIgJG5ld1NlbGVjdCA9IHRyYW5zZm9ybVNlbGVjdCgkc2VsZWN0KSxcbiAgLy8gICAgICAgICAkbGFiZWwgPSAkbmV3U2VsZWN0LmZpbmQoXCIuc2VsZWN0LWxhYmVsXCIpLFxuICAvLyAgICAgICAgIHByZXZpb3VzVmFsdWUgPSAkbmV3U2VsZWN0LmZpbmQoXCJzZWxlY3RcIikudmFsKCk7XG5cbiAgLy8gICAgIHZhciByZWZyZXNoID0gZnVuY3Rpb24oJHNlbGVjdCwgY2hlY2tJZkNoYW5nZWQpe1xuICAvLyAgICAgICB2YXIgc2VsZWN0ZWRWYWx1ZSA9ICRzZWxlY3QudmFsKCksXG4gIC8vICAgICAgICAgICAkc2VsZWN0ZWRPcHRpb24gPSAkc2VsZWN0LmZpbmQoXCJvcHRpb25bdmFsdWU9J1wiICsgc2VsZWN0ZWRWYWx1ZSArIFwiJ11cIiksXG4gIC8vICAgICAgICAgICBzZWxlY3RlZERpc3BsYXlWYWx1ZSA9ICRzZWxlY3RlZE9wdGlvbi50ZXh0KCk7XG5cbiAgLy8gICAgICAgaWYoIWNoZWNrSWZDaGFuZ2VkIHx8IHByZXZpb3VzVmFsdWUgIT09IHNlbGVjdGVkVmFsdWUpe1xuICAvLyAgICAgICAgICRsYWJlbC50ZXh0KHNlbGVjdGVkRGlzcGxheVZhbHVlKTtcbiAgLy8gICAgICAgICBwcmV2aW91c1ZhbHVlID0gc2VsZWN0ZWRWYWx1ZTtcbiAgLy8gICAgICAgICBPVC5FdmVudHMuZmlyZShcInNlbGVjdDpjaGFuZ2VcIiwgeyBzZW5kZXI6ICRzZWxlY3QucGFyZW50KCkgfSk7XG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH07XG5cbiAgLy8gICAgICRuZXdTZWxlY3QuZmluZCgnc2VsZWN0Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCl7XG4gIC8vICAgICAgIHJldHVybiByZWZyZXNoKCQodGhpcykpO1xuICAvLyAgICAgfSkub24oJ2tleXVwJywgZnVuY3Rpb24oKXtcbiAgLy8gICAgICAgcmV0dXJuIHJlZnJlc2goJCh0aGlzKSwgdHJ1ZSk7XG4gIC8vICAgICB9KTtcblxuICAvLyAgICAgcmV0dXJuICRuZXdTZWxlY3Q7XG4gIC8vICAgfSxcblxuICAvLyAgIHNlbGVjdDogZnVuY3Rpb24oJHNlbGVjdCwgdmFsdWUpe1xuICAvLyAgICAgdmFyICRzZWxlY3RlZE9wdGlvbiA9ICRzZWxlY3QuZmluZChcIm9wdGlvblt2YWx1ZT0nXCIgKyB2YWx1ZSArIFwiJ11cIiksXG4gIC8vICAgICAgICAgJGxhYmVsID0gJHNlbGVjdC5maW5kKFwiLnNlbGVjdC1sYWJlbFwiKTtcblxuICAvLyAgICAgJHNlbGVjdC5maW5kKFwib3B0aW9uXCIpLnJlbW92ZUF0dHIoXCJzZWxlY3RlZFwiKTtcbiAgLy8gICAgICRzZWxlY3QuZmluZChcInNlbGVjdFwiKS52YWwodmFsdWUpO1xuICAvLyAgICAgJGxhYmVsLnRleHQoJHNlbGVjdGVkT3B0aW9uLnRleHQoKSk7XG5cbiAgLy8gICAgIE9ULkV2ZW50cy5maXJlKFwic2VsZWN0OmNoYW5nZVwiLCB7IHNlbmRlcjogJHNlbGVjdCB9KTtcbiAgLy8gICB9LFxuXG4gIC8vICAgc2hvd0FsbDogZnVuY3Rpb24oJHNlbGVjdCl7XG4gIC8vICAgICB2YXIgc2VsZWN0TmFtZSA9ICRzZWxlY3QuZmluZChcInNlbGVjdFwiKS5hdHRyKFwibmFtZVwiKSxcbiAgLy8gICAgICAgICBpbml0aWFsT3B0aW9ucyA9IF9kYXRhW3NlbGVjdE5hbWVdIHx8IFtdLFxuICAvLyAgICAgICAgIG5ld09wdGlvbnMgPSBcIlwiO1xuXG4gIC8vICAgICBmb3IodmFyIGkgPSAwOyBpIDwgaW5pdGlhbE9wdGlvbnMubGVuZ3RoOyBpKyspe1xuICAvLyAgICAgICB2YXIgb3B0aW9uID0gaW5pdGlhbE9wdGlvbnNbaV07XG4gIC8vICAgICAgIGlmKCRzZWxlY3QuZmluZChcIm9wdGlvblt2YWx1ZT0nXCIgKyBvcHRpb24udmFsdWUgKyBcIiddXCIpLmxlbmd0aCA9PT0gMCl7XG4gIC8vICAgICAgICAgbmV3T3B0aW9ucyArPSBcIjxvcHRpb24gdmFsdWU9J1wiICsgb3B0aW9uLnZhbHVlICsgXCInPlwiICsgb3B0aW9uLmRpc3BsYXkgKyBcIjwvb3B0aW9uPlwiO1xuICAvLyAgICAgICB9XG4gIC8vICAgICB9XG5cbiAgLy8gICAgIGlmKG5ld09wdGlvbnMubGVuZ3RoID4gMCl7XG4gIC8vICAgICAgICRzZWxlY3QuZmluZChcInNlbGVjdFwiKS5wcmVwZW5kKG5ld09wdGlvbnMpO1xuICAvLyAgICAgfVxuICAvLyAgIH1cbiAgLy8gfTtcblxuICAvLyAkLmZuLk9Uc2VsZWN0ID0gZnVuY3Rpb24oYWN0aW9uLCBwYXJhbSl7XG4gIC8vICAgaWYoISFzZWxlY3RbYWN0aW9uXSl7XG4gIC8vICAgICByZXR1cm4gc2VsZWN0W2FjdGlvbl0odGhpcywgcGFyYW0pO1xuICAvLyAgIH1cblxuICAvLyAgIHJldHVybiB0aGlzO1xuICAvLyB9O1xuXG4gIC8vIHJldHVybiB7XG4gIC8vICAgaW5pdDogc2VsZWN0LmluaXQsXG4gIC8vICAgZ2V0OiBzZWxlY3QuZ2V0LFxuICAvLyAgIHNlbGVjdDogc2VsZWN0LnNlbGVjdFxuICAvLyB9O1xuXG4vLyB9KShqUXVlcnksIF8pO1xuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcImRlXCI6IHtcbiAgICBcImRhdGVGb3JtYXRcIjogXCJkIG1tbSB5eXl5XCIsXG4gICAgXCJwYXJ0eVNpbmd1bGFyXCI6IFwiezB9IFBlcnNvblwiLFxuICAgIFwicGFydHlQbHVyYWxcIjogXCJ7MH0gUGVyc29uZW5cIixcbiAgICBcInBhcnR5TGFyZ2VyXCI6IFwiMjArIFBlcnNvbmVuXCIsXG4gICAgXCJmaW5kQVRhYmxlXCI6IFwiVGlzY2ggRmluZGVuXCIsXG4gICAgXCJ0ZXh0UGxhY2Vob2xkZXJcIjogXCJPcnQgb2RlciBSZXN0YXVyYW50IGVpbmdlYmVuXCJcbiAgfSxcbiAgXCJlblwiOiB7XG4gICAgXCJkYXRlRm9ybWF0XCI6IFwibW1tIGQsIHl5eXlcIixcbiAgICBcInBhcnR5U2luZ3VsYXJcIjogXCJ7MH0gcGVyc29uXCIsXG4gICAgXCJwYXJ0eVBsdXJhbFwiOiBcInswfSBwZW9wbGVcIixcbiAgICBcInBhcnR5TGFyZ2VyXCI6IFwiTGFyZ2VyIHBhcnR5XCIsXG4gICAgXCJmaW5kQVRhYmxlXCI6IFwiRmluZCBhIFRhYmxlXCIsXG4gICAgXCJ0ZXh0UGxhY2Vob2xkZXJcIjogXCJMb2NhdGlvbiBvciBSZXN0YXVyYW50XCJcbiAgfSxcbiAgXCJlc1wiOiB7XG4gICAgXCJkYXRlRm9ybWF0XCI6IFwiZCBtbW0geXl5eVwiLFxuICAgIFwicGFydHlTaW5ndWxhclwiOiBcInswfSBwZXJzb25hXCIsXG4gICAgXCJwYXJ0eVBsdXJhbFwiOiBcInswfSBwZXJzb25hc1wiLFxuICAgIFwicGFydHlMYXJnZXJcIjogXCIyMCsgcGVyc29uYXNcIixcbiAgICBcImZpbmRBVGFibGVcIjogXCJCdXNjYXIgTWVzYVwiLFxuICAgIFwidGV4dFBsYWNlaG9sZGVyXCI6IFwiVWJpY2FjacOzbiBvIG5vbWJyZSBkZSBSZXN0YXVyYW50ZVwiXG4gIH0sXG4gIFwiZnJcIjoge1xuICAgIFwiZGF0ZUZvcm1hdFwiOiBcImQgbW1tIHl5eXlcIixcbiAgICBcInBhcnR5U2luZ3VsYXJcIjogXCJ7MH0gcGVyc29ubmVcIixcbiAgICBcInBhcnR5UGx1cmFsXCI6IFwiezB9IHBlcnNvbm5lc1wiLFxuICAgIFwicGFydHlMYXJnZXJcIjogXCIyMCsgcGVyc29ubmVzXCIsXG4gICAgXCJmaW5kQVRhYmxlXCI6IFwiVHJvdXZlciB1bmUgVGFibGVcIixcbiAgICBcInRleHRQbGFjZWhvbGRlclwiOiBcIkxvY2F0aW9uIG9yIFJlc3RhdXJhbnRcIlxuICB9LFxuICBcImphXCI6IHtcbiAgICBcImRhdGVGb3JtYXRcIjogXCJ5eXl5L20vZFwiLFxuICAgIFwicGFydHlTaW5ndWxhclwiOiBcInswfeWQjVwiLFxuICAgIFwicGFydHlQbHVyYWxcIjogXCJ7MH3lkI1cIixcbiAgICBcInBhcnR5TGFyZ2VyXCI6IFwiMjAr5ZCNXCIsXG4gICAgXCJmaW5kQVRhYmxlXCI6IFwi56m65bit44KS5qSc57Si44GZ44KLXCIsXG4gICAgXCJ0ZXh0UGxhY2Vob2xkZXJcIjogXCLjgqjjg6rjgqLjgoTlupflkI3jgpLlhaXlipvjgZfjgabjgY/jgaDjgZXjgYRcIlxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwibnVtYmVyT2ZSb3dzSW5DYWxlbmRhclwiOiA2LFxuICBcIm51bWJlck9mRGF5c0luQ2FsZW5kYXJcIjogNDIsXG4gIFwiZmlyc3REYXlJbkNhbGVuZGFyXCI6IDZcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBvdERlZmF1bHRzOiByZXF1aXJlKCcuL290LWRlZmF1bHRzJyksXG4gIG90T3B0aW9uOiByZXF1aXJlKCcuL290LW9wdGlvbicpLFxuICBvdFNlbGVjdDogcmVxdWlyZSgnLi9vdC1zZWxlY3QnKSxcbiAgcGlja2VyTGFiZWw6IHJlcXVpcmUoJy4vcGlja2VyLWxhYmVsJyksXG4gIHBpY2tlclNlbGVjdG9yOiByZXF1aXJlKCcuL3BpY2tlci1zZWxlY3RvcicpXG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiYmFja2dyb3VuZFwiOiBcIiNGN0Y3RjdcIixcbiAgXCJib3hTaXppbmdcIjogXCJib3JkZXItYm94XCIsXG4gIFwiY3Vyc29yXCI6IFwiZGVmYXVsdFwiLFxuICBcImZvbnRGYW1pbHlcIjogXCJcXFwiSGVsdmV0aWNhIE5ldWUgTGlnaHRcXFwiLCBcXFwiSGVsdmV0aWNhTmV1ZS1MaWdodFxcXCIsIFxcXCJIZWx2ZXRpY2EgTmV1ZVxcXCIsIENhbGlicmksIEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWZcIixcbiAgXCJmb250U2l6ZVwiOiBcIjE2cHhcIixcbiAgXCJmb250U3R5bGVcIjogXCJub3JtYWxcIixcbiAgXCJmb250V2VpZ2h0XCI6IDQwMCxcbiAgXCJsaW5lSGVpZ2h0XCI6IFwiMS4yZW1cIixcbiAgXCJtYXJnaW5cIjogMCxcbiAgXCJwYWRkaW5nXCI6IDAsXG4gIFwicG9zaXRpb25cIjogXCJyZWxhdGl2ZVwiXG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiZGlzcGxheVwiOiBcImJsb2NrXCIsXG4gIFwiZm9udFdlaWdodFwiOiBcIm5vcm1hbFwiLFxuICBcIm1pbkhlaWdodFwiOiBcIjEuMmVtXCIsXG4gIFwicGFkZGluZ1wiOiBcIjBweCAycHggMXB4XCIsXG4gIFwid2hpdGVTcGFjZVwiOiBcInByZVwiXG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gICAgXCJiYWNrZ3JvdW5kQ29sb3JcIjogXCIjRkZGXCIsXG4gICAgXCJib3JkZXJSYWRpdXNcIjogXCIwXCIsXG4gICAgXCJjb2xvclwiOiBcIiMzMzNcIixcbiAgICBcImN1cnNvclwiOiBcInBvaW50ZXJcIixcbiAgICBcImhlaWdodFwiOiBcIjEwMCVcIixcbiAgICBcIm9wYWNpdHlcIjogXCIwXCIsXG4gICAgXCJwb3NpdGlvblwiOiBcImFic29sdXRlXCIsXG4gICAgXCJ0b3BcIjogXCIwXCIsXG4gICAgXCJ3aWR0aFwiOiBcIjEwMCVcIixcbiAgICBcInpJbmRleFwiOiBcIjJcIlxufVxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIm92ZXJmbG93XCI6IFwiaGlkZGVuXCIsXG4gIFwid2hpdGUtc3BhY2VcIjogXCJub3dyYXBcIixcbiAgXCJib3JkZXJcIjogXCIxcHggc29saWQgdHJhbnNwYXJlbnRcIixcbiAgXCJkaXNwbGF5XCI6IFwiYmxvY2tcIixcbiAgXCJwYWRkaW5nXCI6IFwiMC44MTI1cmVtIDFyZW1cIixcbiAgXCJjb2xvclwiOiBcImJsYWNrXCIsXG4gIFwiaGVpZ2h0XCI6IFwiM3JlbVwiLFxuICBcInotaW5kZXhcIjogMSxcbiAgXCJ0ZXh0LWRlY29yYXRpb25cIjogXCJub25lXCIsXG4gIFwiYmFja2dyb3VuZFwiOiBcInRyYW5zcGFyZW50XCIsXG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiZmxvYXRcIjogXCJsZWZ0XCIsXG4gIFwiaGVpZ2h0XCI6IFwiMTAwJVwiLFxuICBcIndpZHRoXCI6IFwiMTUlXCJcbn1cbiIsInZhciBtb250aERheXMgPSByZXF1aXJlKCdtb250aC1kYXlzJyk7XG52YXIgdGltZXMgPSByZXF1aXJlKCdyYW1kYS9zcmMvdGltZXMnKTtcbnZhciBzZXR0aW5ncyA9IHJlcXVpcmUoJy4vc2V0dGluZ3MnKTtcblxuZnVuY3Rpb24gZ2V0Rmlyc3REYXlPZk1vbnRoKG1vbnRoLCB5ZWFyKSB7XG4gIHJldHVybiBuZXcgRGF0ZSh5ZWFyICsgXCItXCIgKyAobW9udGggKyAxKSArIFwiLTAxXCIpLmdldERheSgpO1xufVxuXG5mdW5jdGlvbiBnZXRMYXN0RGF5T2ZNb250aChudW1iZXJPZkRheXMsIG1vbnRoLCB5ZWFyKSB7XG4gIHJldHVybiBuZXcgRGF0ZSh5ZWFyICsgXCItXCIgKyAobW9udGggKyAxKSArIFwiLVwiICsgKG51bWJlck9mRGF5cyArIDEpKS5nZXREYXkoKTtcbn1cblxuZnVuY3Rpb24gbW9kdWxvKG4sIG0pIHtcbiAgcmV0dXJuICgobiAlIG0pICsgbSkgJSBtO1xufVxuXG5mdW5jdGlvbiBnZXROZXh0RGF0ZShtb250aCwgeWVhcikge1xuICB2YXIgbmV4dE1vbnRoID0gbW9kdWxvKG1vbnRoICsgMSwgMTIpO1xuICB2YXIgbmV4dFllYXIgPSBtb250aCA9PT0gMTEgPyB5ZWFyICsgMSA6IHllYXI7XG5cbiAgcmV0dXJuIHtcbiAgICBtb250aDogbmV4dE1vbnRoLFxuICAgIHllYXI6IG5leHRZZWFyXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldExhc3REYXRlKG1vbnRoLCB5ZWFyKSB7XG4gIHZhciBsYXN0TW9udGggPSBtb2R1bG8obW9udGggLSAxLCAxMik7XG4gIHZhciBsYXN0WWVhciA9IG1vbnRoID09PSAwID8geWVhciAtIDEgOiB5ZWFyO1xuXG4gIHJldHVybiB7XG4gICAgbW9udGg6IGxhc3RNb250aCxcbiAgICB5ZWFyOiBsYXN0WWVhclxuICB9O1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZU1vbnRoRmFjdG9yeShjdXJyZW50RGF5LCBjdXJyZW50TW9udGgsIGN1cnJlbnRZZWFyKSB7XG4gIHJldHVybiBmdW5jdGlvbiBnZW5lcmF0ZU1vbnRoKG1vbnRoLCB5ZWFyKSB7XG4gICAgdmFyIGxhc3REYXRlID0gZ2V0TGFzdERhdGUobW9udGgsIHllYXIpO1xuICAgIHZhciBuZXh0RGF0ZSA9IGdldExhc3REYXRlKG1vbnRoLCB5ZWFyKTtcblxuICAgIHZhciBudW1iZXJPZkRheXMgPSBtb250aERheXMobW9udGgsIHllYXIpO1xuICAgIHZhciBudW1iZXJPZkRheXNOZXh0TW9udGggPSBtb250aERheXMobmV4dERhdGUubW9udGgsIG5leHREYXRlLnllYXIpO1xuICAgIHZhciBudW1iZXJPZkRheXNMYXN0TW9udGggPSBtb250aERheXMobGFzdERhdGUubW9udGgsIGxhc3REYXRlLnllYXIpO1xuXG4gICAgdmFyIGZpcnN0RGF5T2ZNb250aCA9IGdldEZpcnN0RGF5T2ZNb250aChtb250aCwgeWVhcik7XG4gICAgdmFyIGxhc3REYXlPZk1vbnRoID0gZ2V0TGFzdERheU9mTW9udGgobnVtYmVyT2ZEYXlzLCBtb250aCwgeWVhcik7XG5cbiAgICB2YXIgbnVtYmVyT2ZEYXlzU2hvd25Gcm9tTGFzdE1vbnRoID0gbW9kdWxvKDcgKyBmaXJzdERheU9mTW9udGggLVxuICAgICAgc2V0dGluZ3MuZmlyc3REYXlJbkNhbGVuZGFyLCA3KTtcblxuICAgIHZhciBudW1iZXJPZkRheXNTaG93bkZyb21OZXh0TW9udGggPSBzZXR0aW5ncy5udW1iZXJPZkRheXNJbkNhbGVuZGFyIC1cbiAgICAgIChudW1iZXJPZkRheXNTaG93bkZyb21MYXN0TW9udGggKyBudW1iZXJPZkRheXMpO1xuXG4gICAgdmFyIGRheXNMYXN0TW9udGggPSB0aW1lcyhmdW5jdGlvbiBidWlsZExhc3RNb250aERheXMoZGF5SW5kZXgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRheU9mTW9udGg6IG51bWJlck9mRGF5c0xhc3RNb250aCAtIG51bWJlck9mRGF5c1Nob3duRnJvbUxhc3RNb250aCArIGRheUluZGV4ICsgMSxcbiAgICAgICAgaXNEaXNhYmxlZDogdHJ1ZVxuICAgICAgfTtcbiAgICB9LCBudW1iZXJPZkRheXNTaG93bkZyb21MYXN0TW9udGgpO1xuXG4gICAgdmFyIGRheXNUaGlzTW9udGggPSB0aW1lcyhmdW5jdGlvbiBidWlsZERheXMoZGF5SW5kZXgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRheU9mTW9udGg6IGRheUluZGV4ICsgMSxcbiAgICAgICAgaXNEaXNhYmxlZDogZGF5SW5kZXggPCBjdXJyZW50RGF5XG4gICAgICB9O1xuICAgIH0sIG51bWJlck9mRGF5cyk7XG5cbiAgICB2YXIgZGF5c05leHRNb250aCA9IHRpbWVzKGZ1bmN0aW9uIGJ1aWxkTmV4dE1vbnRoRGF5cyhkYXlJbmRleCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGF5T2ZNb250aDogZGF5SW5kZXggKyAxLFxuICAgICAgICBpc0Rpc2FibGVkOiB0cnVlXG4gICAgICB9O1xuICAgIH0sIG51bWJlck9mRGF5c1Nob3duRnJvbU5leHRNb250aCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ05vdmVtYmVyIDIwMTUnLFxuICAgICAgZGlzcGxheWVkRGF5czogZGF5c0xhc3RNb250aC5jb25jYXQoZGF5c1RoaXNNb250aCkuY29uY2F0KGRheXNOZXh0TW9udGgpXG4gICAgfTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2VuZXJhdGVNb250aEZhY3Rvcnk6IGdlbmVyYXRlTW9udGhGYWN0b3J5LFxuICBnZXRMYXN0RGF0ZTogZ2V0TGFzdERhdGUsXG4gIGdldE5leHREYXRlOiBnZXROZXh0RGF0ZVxufTtcbiJdfQ==
