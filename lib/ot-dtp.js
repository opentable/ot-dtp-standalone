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

},{"dom-delegator":6,"geval/multiple":19,"geval/single":20,"main-loop":21,"observ":44,"observ-array":32,"observ-struct":39,"observ-varhash":41,"observ/computed":43,"observ/watch":45,"value-event/base-event":46,"value-event/change":47,"value-event/click":48,"value-event/event":49,"value-event/key":50,"value-event/submit":56,"value-event/value":57,"vdom-thunk":59,"virtual-dom/vdom/create-element":70,"virtual-dom/vdom/patch":73,"virtual-dom/virtual-hyperscript":77,"virtual-dom/vtree/diff":90,"xtend":91}],4:[function(require,module,exports){
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

},{"ev-store":8}],5:[function(require,module,exports){
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

},{"./add-event.js":4,"./proxy-event.js":16,"./remove-event.js":17,"ev-store":8,"global/document":11,"weakmap-shim/create-store":14}],6:[function(require,module,exports){
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

},{"./dom-delegator.js":5,"cuid":7,"global/document":11,"individual":12}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{"individual/one-version":10}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{"./index.js":9}],11:[function(require,module,exports){
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

},{"min-document":1}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{"./hidden-store.js":15}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{"inherits":13}],17:[function(require,module,exports){
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

},{"ev-store":8}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
var event = require("./single.js")

module.exports = multiple

function multiple(names) {
    return names.reduce(function (acc, name) {
        acc[name] = event()
        return acc
    }, {})
}

},{"./single.js":20}],20:[function(require,module,exports){
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

},{"./event.js":18}],21:[function(require,module,exports){
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

},{"error/typed":24,"raf":25}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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


},{"camelize":22,"string-template":23,"xtend/mutable":92}],25:[function(require,module,exports){
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

},{"performance-now":26}],26:[function(require,module,exports){
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

},{"_process":2}],27:[function(require,module,exports){
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

},{"./lib/set-non-enumerable.js":33}],28:[function(require,module,exports){
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

},{"./add-listener.js":27}],29:[function(require,module,exports){
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

},{"./array-reverse.js":30,"./array-sort.js":31,"./index.js":32}],30:[function(require,module,exports){
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

},{"./apply-patch.js":28,"./lib/set-non-enumerable.js":33}],31:[function(require,module,exports){
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

},{"./apply-patch.js":28,"./lib/set-non-enumerable.js":33}],32:[function(require,module,exports){
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

},{"./add-listener.js":27,"./array-methods.js":29,"./put.js":35,"./set.js":36,"./splice.js":37,"./transaction.js":38,"observ":44}],33:[function(require,module,exports){
module.exports = setNonEnumerable;

function setNonEnumerable(object, key, value) {
    Object.defineProperty(object, key, {
        value: value,
        writable: true,
        configurable: true,
        enumerable: false
    });
}

},{}],34:[function(require,module,exports){
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

},{}],35:[function(require,module,exports){
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
},{"./add-listener.js":27,"./lib/set-non-enumerable.js":33}],36:[function(require,module,exports){
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

},{"./apply-patch.js":28,"./lib/set-non-enumerable.js":33,"adiff":34}],37:[function(require,module,exports){
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

},{"./add-listener.js":27,"./lib/set-non-enumerable.js":33}],38:[function(require,module,exports){
module.exports = transaction

function transaction (func) {
    var obs = this
    var rawList = obs._list.slice()

    if (func(rawList) !== false){ // allow cancel
        return obs.set(rawList)
    }

}
},{}],39:[function(require,module,exports){
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

},{"observ":44,"xtend":40}],40:[function(require,module,exports){
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

},{}],41:[function(require,module,exports){
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

},{"observ":44,"xtend":42}],42:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"dup":40}],43:[function(require,module,exports){
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

},{"./index.js":44}],44:[function(require,module,exports){
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

},{}],45:[function(require,module,exports){
module.exports = watch

function watch(observable, listener) {
    var remove = observable(listener)
    listener(observable())
    return remove
}

},{}],46:[function(require,module,exports){
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

},{"dom-delegator":6}],47:[function(require,module,exports){
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

},{"./base-event.js":46,"form-data-set/element":52,"xtend":55}],48:[function(require,module,exports){
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

},{"./base-event.js":46}],49:[function(require,module,exports){
var BaseEvent = require('./base-event.js');

module.exports = BaseEvent(eventLambda);

function eventLambda(ev, broadcast) {
    broadcast(this.data);
}

},{"./base-event.js":46}],50:[function(require,module,exports){
var BaseEvent = require('./base-event.js');

module.exports = BaseEvent(keyLambda);

function keyLambda(ev, broadcast) {
    var key = this.opts.key;

    if (ev.keyCode === key) {
        broadcast(this.data);
    }
}

},{"./base-event.js":46}],51:[function(require,module,exports){
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

},{}],52:[function(require,module,exports){
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

},{"./index.js":53,"dom-walk":51}],53:[function(require,module,exports){
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

},{}],54:[function(require,module,exports){
module.exports = hasKeys

function hasKeys(source) {
    return source !== null &&
        (typeof source === "object" ||
        typeof source === "function")
}

},{}],55:[function(require,module,exports){
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

},{"./has-keys":54}],56:[function(require,module,exports){
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

},{"./base-event.js":46,"form-data-set/element":52,"xtend":55}],57:[function(require,module,exports){
var extend = require('xtend')
var getFormData = require('form-data-set/element')

var BaseEvent = require('./base-event.js');

module.exports = BaseEvent(valueLambda);

function valueLambda(ev, broadcast) {
    var value = getFormData(ev.currentTarget)
    var data = extend(value, this.data)

    broadcast(data);
}

},{"./base-event.js":46,"form-data-set/element":52,"xtend":55}],58:[function(require,module,exports){
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

},{}],59:[function(require,module,exports){
var Partial = require('./partial');

module.exports = Partial();

},{"./partial":60}],60:[function(require,module,exports){
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

},{"./immutable-thunk":58,"./shallow-eq":61}],61:[function(require,module,exports){
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

},{}],62:[function(require,module,exports){
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

},{}],63:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8,"individual/one-version":65}],64:[function(require,module,exports){
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

},{}],65:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"./index.js":64,"dup":10}],66:[function(require,module,exports){
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

},{"min-document":1}],67:[function(require,module,exports){
"use strict";

module.exports = function isObject(x) {
	return typeof x === "object" && x !== null;
};

},{}],68:[function(require,module,exports){
var nativeIsArray = Array.isArray
var toString = Object.prototype.toString

module.exports = nativeIsArray || isArray

function isArray(obj) {
    return toString.call(obj) === "[object Array]"
}

},{}],69:[function(require,module,exports){
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

},{"../vnode/is-vhook.js":81,"is-object":67}],70:[function(require,module,exports){
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

},{"../vnode/handle-thunk.js":79,"../vnode/is-vnode.js":82,"../vnode/is-vtext.js":83,"../vnode/is-widget.js":84,"./apply-properties":69,"global/document":66}],71:[function(require,module,exports){
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

},{}],72:[function(require,module,exports){
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

},{"../vnode/is-widget.js":84,"../vnode/vpatch.js":87,"./apply-properties":69,"./create-element":70,"./update-widget":74}],73:[function(require,module,exports){
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

},{"./dom-index":71,"./patch-op":72,"global/document":66,"x-is-array":68}],74:[function(require,module,exports){
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

},{"../vnode/is-widget.js":84}],75:[function(require,module,exports){
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

},{"ev-store":63}],76:[function(require,module,exports){
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

},{}],77:[function(require,module,exports){
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

},{"../vnode/is-thunk":80,"../vnode/is-vhook":81,"../vnode/is-vnode":82,"../vnode/is-vtext":83,"../vnode/is-widget":84,"../vnode/vnode.js":86,"../vnode/vtext.js":88,"./hooks/ev-hook.js":75,"./hooks/soft-set-hook.js":76,"./parse-tag.js":78,"x-is-array":68}],78:[function(require,module,exports){
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

},{"browser-split":62}],79:[function(require,module,exports){
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

},{"./is-thunk":80,"./is-vnode":82,"./is-vtext":83,"./is-widget":84}],80:[function(require,module,exports){
module.exports = isThunk

function isThunk(t) {
    return t && t.type === "Thunk"
}

},{}],81:[function(require,module,exports){
module.exports = isHook

function isHook(hook) {
    return hook &&
      (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") ||
       typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"))
}

},{}],82:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualNode

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version
}

},{"./version":85}],83:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualText

function isVirtualText(x) {
    return x && x.type === "VirtualText" && x.version === version
}

},{"./version":85}],84:[function(require,module,exports){
module.exports = isWidget

function isWidget(w) {
    return w && w.type === "Widget"
}

},{}],85:[function(require,module,exports){
module.exports = "1"

},{}],86:[function(require,module,exports){
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

},{"./is-thunk":80,"./is-vhook":81,"./is-vnode":82,"./is-widget":84,"./version":85}],87:[function(require,module,exports){
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

},{"./version":85}],88:[function(require,module,exports){
var version = require("./version")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version
VirtualText.prototype.type = "VirtualText"

},{"./version":85}],89:[function(require,module,exports){
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

},{"../vnode/is-vhook":81,"is-object":67}],90:[function(require,module,exports){
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

},{"../vnode/handle-thunk":79,"../vnode/is-thunk":80,"../vnode/is-vnode":82,"../vnode/is-vtext":83,"../vnode/is-widget":84,"../vnode/vpatch":87,"./diff-props":89,"x-is-array":68}],91:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"dup":40}],92:[function(require,module,exports){
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

},{}],93:[function(require,module,exports){
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

},{"./internal/_arity":94,"./internal/_curry2":96}],94:[function(require,module,exports){
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

},{}],95:[function(require,module,exports){
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

},{}],96:[function(require,module,exports){
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

},{"./_curry1":95}],97:[function(require,module,exports){
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

},{"./_curry1":95,"./_curry2":96}],98:[function(require,module,exports){
module.exports = function _has(prop, obj) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

},{}],99:[function(require,module,exports){
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

},{}],100:[function(require,module,exports){
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

},{"../bind":93,"../isArrayLike":102,"./_xwrap":101}],101:[function(require,module,exports){
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

},{}],102:[function(require,module,exports){
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

},{"./internal/_curry1":95,"./internal/_isArray":99}],103:[function(require,module,exports){
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

},{"./internal/_curry1":95,"./internal/_has":98}],104:[function(require,module,exports){
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

},{"./internal/_curry2":96,"./keys":103}],105:[function(require,module,exports){
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

},{"./internal/_curry2":96}],106:[function(require,module,exports){
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

},{"./internal/_curry3":97,"./internal/_reduce":100}],107:[function(require,module,exports){
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

},{"./internal/_curry1":95,"./keys":103}],108:[function(require,module,exports){
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

},{"./styles":113,"ramda/src/merge":104,"ramda/src/pick":105,"ramda/src/reduce":106,"ramda/src/values":107}],109:[function(require,module,exports){
var h = require('mercury').h;
var partySizePicker = require('./party-size-picker');
var buildStyle = require('../build-style');

var styles = {
  datePicker: buildStyle({}, ['pickerSelector']),
  datePickerLink: buildStyle({}, ['pickerLabel'])
};

module.exports = function datePicker(state) {
  return h('div', {
    style: styles.datePicker
  }, [
    h('a', {
      style: styles.datePickerLink
    }, 'Oct 29, 2015'),
  ]);
}

},{"../build-style":108,"./party-size-picker":110,"mercury":3}],110:[function(require,module,exports){
var h = require('mercury').h;
var buildStyle = require('../build-style');

var styles = {
  picker: buildStyle({
    float: 'left',
    height: '48px',
    lineHeight: '19.2px',
    width: '157.797px',
  }),
  pickerLink: buildStyle({}, ['pickerLabel']),
  select: buildStyle({
    alignItems: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    borderBottomColor: 'rgb(166, 166, 166)',
    borderBottomLeftRadius: '0px',
    borderBottomRightRadius: '0px',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderImageOutset: '0px',
    borderImageRepeat: 'stretch',
    borderImageSlice: '100%',
    borderImageSource: 'none',
    borderImageWidth: '1',
    borderLeftColor: 'rgb(166, 166, 166)',
    borderLeftStyle: 'solid',
    borderLeftWidth: '1px',
    borderRightColor: 'rgb(166, 166, 166)',
    borderRightStyle: 'solid',
    borderRightWidth: '1px',
    borderTopColor: 'rgb(166, 166, 166)',
    borderTopLeftRadius: '0px',
    borderTopRightRadius: '0px',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    boxSizing: 'border-box',
    color: 'rgb(51, 51, 51)',
    cursor: 'pointer',
    display: 'block',
    height: '48px',
    letterSpacing: 'normal',
    lineHeight: '19.2px',
    marginBottom: '0px',
    marginLeft: '0px',
    marginRight: '0px',
    marginTop: '0px',
    opacity: '0',
    overflowX: 'visible',
    overflowY: 'visible',
    position: 'absolute',
    textAlign: 'start',
    textIndent: '0px',
    textRendering: 'auto',
    textShadow: 'none',
    textTransform: 'none',
    top: '0px',
    whiteSpace: 'pre',
    width: '157.797px',
    wordSpacing: '0px',
    writingMode: 'lr-tb',
    zIndex: '2',
  }),
  option: buildStyle({
    color: 'rgb(51, 51, 51)',
    cursor: 'pointer',
    display: 'block',
    height: 'auto',
    letterSpacing: 'normal',
    lineHeight: 'normal',
    minHeight: '19.2px',
    paddingBottom: '1px',
    paddingLeft: '2px',
    paddingRight: '2px',
    paddingTop: '0px',
    textAlign: 'start',
    textIndent: '0px',
    textShadow: 'none',
    textTransform: 'none',
    whiteSpace: 'pre',
    width: 'auto',
    wordSpacing: '0px',
  })
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

},{"../build-style":108,"mercury":3}],111:[function(require,module,exports){
var h = require('mercury').h;
var partySizePicker = require('./party-size-picker');
var datePicker = require('./date-picker');
var buildStyle = require('../build-style');

module.exports = function dtpPickerForm(state) {
  return h('form', {
    style: buildStyle({ height: '3em' })
  }, [
    partySizePicker(state),
    datePicker(state)
  ]);
}

},{"../build-style":108,"./date-picker":109,"./party-size-picker":110,"mercury":3}],112:[function(require,module,exports){
var hg = require('mercury');
var h = hg.h;
var pickerForm = require('./components/picker-form');

function getInitialViewModel() {
  return {
    showSearch: false,
    time: '23:30',
    date: '2015-10-10',
    partySize: 2,
    timeOptions: [
      {
        value: '23:30',
        displayValue: '23:30',
      }
    ],
    partySizeSingular: '1 person',
    partySizePlural: '2 people',
    partySizeLargerParty: 'Larger party',
    findATable: 'Find a Table',
    autocompletePlaceholder: 'Location or Restaurant',
    timezoneOffset: -420,
    language: 'en',
    showLargerParty: true
  }
}

function getInitialAppState() {
  return hg.state({
    viewModel: hg.struct(getInitialViewModel()),
    channels: {}
  });
}


function render(state) {
  return pickerForm(state);
}

module.exports = {
  render: function(selector) {
    var el = document.querySelector(selector);
    hg.app(el, getInitialAppState(), render);
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

},{"./components/picker-form":111,"mercury":3}],113:[function(require,module,exports){
module.exports = {
  otDefaults: require('./ot-defaults'),
  pickerLabel: require('./picker-label'),
  pickerSelector: require('./picker-selector')
}

},{"./ot-defaults":114,"./picker-label":115,"./picker-selector":116}],114:[function(require,module,exports){
module.exports={
  "background": "#F7F7F7",
  "boxSizing": "border-box",
  "cursor": "default",
  "fontFamily": "\"source-sans-pro\",\"Helvetica Neue\",Helvetica,Arial,sans-serif",
  "fontSize": "16px",
  "fontStyle": "normal",
  "fontWeight": 400,
  "lineHeight": "1.2em",
  "margin": 0,
  "padding": 0,
  "position": "relative"
}

},{}],115:[function(require,module,exports){
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

},{}],116:[function(require,module,exports){
module.exports={
  "borderLeft": "1px solid rgba(0,0,0,.08)",
  "float": "left",
  "height": "100%",
  "width": "15%"
}

},{}]},{},[112])(112)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1yZXNvbHZlL2VtcHR5LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2RvbS1kZWxlZ2F0b3IvYWRkLWV2ZW50LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2RvbS1kZWxlZ2F0b3IvZG9tLWRlbGVnYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9kb20tZGVsZWdhdG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2RvbS1kZWxlZ2F0b3Ivbm9kZV9tb2R1bGVzL2N1aWQvZGlzdC9icm93c2VyLWN1aWQuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9ub2RlX21vZHVsZXMvZXYtc3RvcmUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9ub2RlX21vZHVsZXMvZXYtc3RvcmUvbm9kZV9tb2R1bGVzL2luZGl2aWR1YWwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9ub2RlX21vZHVsZXMvZXYtc3RvcmUvbm9kZV9tb2R1bGVzL2luZGl2aWR1YWwvb25lLXZlcnNpb24uanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9ub2RlX21vZHVsZXMvZ2xvYmFsL2RvY3VtZW50LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2RvbS1kZWxlZ2F0b3Ivbm9kZV9tb2R1bGVzL2luZGl2aWR1YWwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9ub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9kb20tZGVsZWdhdG9yL25vZGVfbW9kdWxlcy93ZWFrbWFwLXNoaW0vY3JlYXRlLXN0b3JlLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2RvbS1kZWxlZ2F0b3Ivbm9kZV9tb2R1bGVzL3dlYWttYXAtc2hpbS9oaWRkZW4tc3RvcmUuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9wcm94eS1ldmVudC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9kb20tZGVsZWdhdG9yL3JlbW92ZS1ldmVudC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9nZXZhbC9ldmVudC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9nZXZhbC9tdWx0aXBsZS5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9nZXZhbC9zaW5nbGUuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvbWFpbi1sb29wL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL21haW4tbG9vcC9ub2RlX21vZHVsZXMvZXJyb3Ivbm9kZV9tb2R1bGVzL2NhbWVsaXplL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL21haW4tbG9vcC9ub2RlX21vZHVsZXMvZXJyb3Ivbm9kZV9tb2R1bGVzL3N0cmluZy10ZW1wbGF0ZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9tYWluLWxvb3Avbm9kZV9tb2R1bGVzL2Vycm9yL3R5cGVkLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL21haW4tbG9vcC9ub2RlX21vZHVsZXMvcmFmL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL21haW4tbG9vcC9ub2RlX21vZHVsZXMvcmFmL25vZGVfbW9kdWxlcy9wZXJmb3JtYW5jZS1ub3cvbGliL3BlcmZvcm1hbmNlLW5vdy5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvYWRkLWxpc3RlbmVyLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL29ic2Vydi1hcnJheS9hcHBseS1wYXRjaC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvYXJyYXktbWV0aG9kcy5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvYXJyYXktcmV2ZXJzZS5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvYXJyYXktc29ydC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LWFycmF5L2xpYi9zZXQtbm9uLWVudW1lcmFibGUuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LWFycmF5L25vZGVfbW9kdWxlcy9hZGlmZi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvcHV0LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL29ic2Vydi1hcnJheS9zZXQuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LWFycmF5L3NwbGljZS5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvdHJhbnNhY3Rpb24uanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LXN0cnVjdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtc3RydWN0L25vZGVfbW9kdWxlcy94dGVuZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtdmFyaGFzaC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYvY29tcHV0ZWQuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL29ic2Vydi93YXRjaC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92YWx1ZS1ldmVudC9iYXNlLWV2ZW50LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZhbHVlLWV2ZW50L2NoYW5nZS5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92YWx1ZS1ldmVudC9jbGljay5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92YWx1ZS1ldmVudC9ldmVudC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92YWx1ZS1ldmVudC9rZXkuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmFsdWUtZXZlbnQvbm9kZV9tb2R1bGVzL2RvbS13YWxrL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZhbHVlLWV2ZW50L25vZGVfbW9kdWxlcy9mb3JtLWRhdGEtc2V0L2VsZW1lbnQuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmFsdWUtZXZlbnQvbm9kZV9tb2R1bGVzL2Zvcm0tZGF0YS1zZXQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmFsdWUtZXZlbnQvbm9kZV9tb2R1bGVzL3h0ZW5kL2hhcy1rZXlzLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZhbHVlLWV2ZW50L25vZGVfbW9kdWxlcy94dGVuZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92YWx1ZS1ldmVudC9zdWJtaXQuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmFsdWUtZXZlbnQvdmFsdWUuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmRvbS10aHVuay9pbW11dGFibGUtdGh1bmsuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmRvbS10aHVuay9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92ZG9tLXRodW5rL3BhcnRpYWwuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmRvbS10aHVuay9zaGFsbG93LWVxLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL25vZGVfbW9kdWxlcy9icm93c2VyLXNwbGl0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL25vZGVfbW9kdWxlcy9ldi1zdG9yZS9ub2RlX21vZHVsZXMvaW5kaXZpZHVhbC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS9ub2RlX21vZHVsZXMvZ2xvYmFsL2RvY3VtZW50LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL25vZGVfbW9kdWxlcy9pcy1vYmplY3QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vbm9kZV9tb2R1bGVzL3gtaXMtYXJyYXkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdmRvbS9hcHBseS1wcm9wZXJ0aWVzLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zkb20vY3JlYXRlLWVsZW1lbnQuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdmRvbS9kb20taW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdmRvbS9wYXRjaC1vcC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92ZG9tL3BhdGNoLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zkb20vdXBkYXRlLXdpZGdldC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92aXJ0dWFsLWh5cGVyc2NyaXB0L2hvb2tzL2V2LWhvb2suanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdmlydHVhbC1oeXBlcnNjcmlwdC9ob29rcy9zb2Z0LXNldC1ob29rLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3ZpcnR1YWwtaHlwZXJzY3JpcHQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdmlydHVhbC1oeXBlcnNjcmlwdC9wYXJzZS10YWcuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdm5vZGUvaGFuZGxlLXRodW5rLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zub2RlL2lzLXRodW5rLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zub2RlL2lzLXZob29rLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zub2RlL2lzLXZub2RlLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zub2RlL2lzLXZ0ZXh0LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zub2RlL2lzLXdpZGdldC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92bm9kZS92ZXJzaW9uLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zub2RlL3Zub2RlLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zub2RlL3ZwYXRjaC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92bm9kZS92dGV4dC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92dHJlZS9kaWZmLXByb3BzLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Z0cmVlL2RpZmYuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMveHRlbmQvbXV0YWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9yYW1kYS9zcmMvYmluZC5qcyIsIm5vZGVfbW9kdWxlcy9yYW1kYS9zcmMvaW50ZXJuYWwvX2FyaXR5LmpzIiwibm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9fY3VycnkxLmpzIiwibm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9fY3VycnkyLmpzIiwibm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9fY3VycnkzLmpzIiwibm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9faGFzLmpzIiwibm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9faXNBcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9yYW1kYS9zcmMvaW50ZXJuYWwvX3JlZHVjZS5qcyIsIm5vZGVfbW9kdWxlcy9yYW1kYS9zcmMvaW50ZXJuYWwvX3h3cmFwLmpzIiwibm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pc0FycmF5TGlrZS5qcyIsIm5vZGVfbW9kdWxlcy9yYW1kYS9zcmMva2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9yYW1kYS9zcmMvbWVyZ2UuanMiLCJub2RlX21vZHVsZXMvcmFtZGEvc3JjL3BpY2suanMiLCJub2RlX21vZHVsZXMvcmFtZGEvc3JjL3JlZHVjZS5qcyIsIm5vZGVfbW9kdWxlcy9yYW1kYS9zcmMvdmFsdWVzLmpzIiwic3JjL2J1aWxkLXN0eWxlLmpzIiwic3JjL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIuanMiLCJzcmMvY29tcG9uZW50cy9wYXJ0eS1zaXplLXBpY2tlci5qcyIsInNyYy9jb21wb25lbnRzL3BpY2tlci1mb3JtLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL3N0eWxlcy9pbmRleC5qcyIsInNyYy9zdHlsZXMvb3QtZGVmYXVsdHMuanNvbiIsInNyYy9zdHlsZXMvcGlja2VyLWxhYmVsLmpzb24iLCJzcmMvc3R5bGVzL3BpY2tlci1zZWxlY3Rvci5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN4SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDblVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5bENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2luZ2xlRXZlbnQgPSByZXF1aXJlKCdnZXZhbC9zaW5nbGUnKTtcbnZhciBNdWx0aXBsZUV2ZW50ID0gcmVxdWlyZSgnZ2V2YWwvbXVsdGlwbGUnKTtcbnZhciBleHRlbmQgPSByZXF1aXJlKCd4dGVuZCcpO1xuXG4vKlxuICAgIFBybyB0aXA6IERvbid0IHJlcXVpcmUgYG1lcmN1cnlgIGl0c2VsZi5cbiAgICAgIHJlcXVpcmUgYW5kIGRlcGVuZCBvbiBhbGwgdGhlc2UgbW9kdWxlcyBkaXJlY3RseSFcbiovXG52YXIgbWVyY3VyeSA9IG1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8vIEVudHJ5XG4gICAgbWFpbjogcmVxdWlyZSgnbWFpbi1sb29wJyksXG4gICAgYXBwOiBhcHAsXG5cbiAgICAvLyBCYXNlXG4gICAgQmFzZUV2ZW50OiByZXF1aXJlKCd2YWx1ZS1ldmVudC9iYXNlLWV2ZW50JyksXG5cbiAgICAvLyBJbnB1dFxuICAgIERlbGVnYXRvcjogcmVxdWlyZSgnZG9tLWRlbGVnYXRvcicpLFxuICAgIC8vIGRlcHJlY2F0ZWQ6IHVzZSBoZy5jaGFubmVscyBpbnN0ZWFkLlxuICAgIGlucHV0OiBpbnB1dCxcbiAgICAvLyBkZXByZWNhdGVkOiB1c2UgaGcuY2hhbm5lbHMgaW5zdGVhZC5cbiAgICBoYW5kbGVzOiBjaGFubmVscyxcbiAgICBjaGFubmVsczogY2hhbm5lbHMsXG4gICAgLy8gZGVwcmVjYXRlZDogdXNlIGhnLnNlbmQgaW5zdGVhZC5cbiAgICBldmVudDogcmVxdWlyZSgndmFsdWUtZXZlbnQvZXZlbnQnKSxcbiAgICBzZW5kOiByZXF1aXJlKCd2YWx1ZS1ldmVudC9ldmVudCcpLFxuICAgIC8vIGRlcHJlY2F0ZWQ6IHVzZSBoZy5zZW5kVmFsdWUgaW5zdGVhZC5cbiAgICB2YWx1ZUV2ZW50OiByZXF1aXJlKCd2YWx1ZS1ldmVudC92YWx1ZScpLFxuICAgIHNlbmRWYWx1ZTogcmVxdWlyZSgndmFsdWUtZXZlbnQvdmFsdWUnKSxcbiAgICAvLyBkZXByZWNhdGVkOiB1c2UgaGcuc2VuZFN1Ym1pdCBpbnN0ZWFkLlxuICAgIHN1Ym1pdEV2ZW50OiByZXF1aXJlKCd2YWx1ZS1ldmVudC9zdWJtaXQnKSxcbiAgICBzZW5kU3VibWl0OiByZXF1aXJlKCd2YWx1ZS1ldmVudC9zdWJtaXQnKSxcbiAgICAvLyBkZXByZWNhdGVkOiB1c2UgaGcuc2VuZENoYW5nZSBpbnN0ZWFkLlxuICAgIGNoYW5nZUV2ZW50OiByZXF1aXJlKCd2YWx1ZS1ldmVudC9jaGFuZ2UnKSxcbiAgICBzZW5kQ2hhbmdlOiByZXF1aXJlKCd2YWx1ZS1ldmVudC9jaGFuZ2UnKSxcbiAgICAvLyBkZXByZWNhdGVkOiB1c2UgaGcuc2VuZEtleSBpbnN0ZWFkLlxuICAgIGtleUV2ZW50OiByZXF1aXJlKCd2YWx1ZS1ldmVudC9rZXknKSxcbiAgICBzZW5kS2V5OiByZXF1aXJlKCd2YWx1ZS1ldmVudC9rZXknKSxcbiAgICAvLyBkZXByZWNhdGVkIHVzZSBoZy5zZW5kQ2xpY2sgaW5zdGVhZC5cbiAgICBjbGlja0V2ZW50OiByZXF1aXJlKCd2YWx1ZS1ldmVudC9jbGljaycpLFxuICAgIHNlbmRDbGljazogcmVxdWlyZSgndmFsdWUtZXZlbnQvY2xpY2snKSxcblxuICAgIC8vIFN0YXRlXG4gICAgLy8gcmVtb3ZlIGZyb20gY29yZTogZmF2b3IgaGcudmFyaGFzaCBpbnN0ZWFkLlxuICAgIGFycmF5OiByZXF1aXJlKCdvYnNlcnYtYXJyYXknKSxcbiAgICBzdHJ1Y3Q6IHJlcXVpcmUoJ29ic2Vydi1zdHJ1Y3QnKSxcbiAgICAvLyBkZXByZWNhdGVkOiB1c2UgaGcuc3RydWN0IGluc3RlYWQuXG4gICAgaGFzaDogcmVxdWlyZSgnb2JzZXJ2LXN0cnVjdCcpLFxuICAgIHZhcmhhc2g6IHJlcXVpcmUoJ29ic2Vydi12YXJoYXNoJyksXG4gICAgdmFsdWU6IHJlcXVpcmUoJ29ic2VydicpLFxuICAgIHN0YXRlOiBzdGF0ZSxcblxuICAgIC8vIFJlbmRlclxuICAgIGRpZmY6IHJlcXVpcmUoJ3ZpcnR1YWwtZG9tL3Z0cmVlL2RpZmYnKSxcbiAgICBwYXRjaDogcmVxdWlyZSgndmlydHVhbC1kb20vdmRvbS9wYXRjaCcpLFxuICAgIHBhcnRpYWw6IHJlcXVpcmUoJ3Zkb20tdGh1bmsnKSxcbiAgICBjcmVhdGU6IHJlcXVpcmUoJ3ZpcnR1YWwtZG9tL3Zkb20vY3JlYXRlLWVsZW1lbnQnKSxcbiAgICBoOiByZXF1aXJlKCd2aXJ0dWFsLWRvbS92aXJ0dWFsLWh5cGVyc2NyaXB0JyksXG5cbiAgICAvLyBVdGlsaXRpZXNcbiAgICAvLyByZW1vdmUgZnJvbSBjb3JlOiByZXF1aXJlIGNvbXB1dGVkIGRpcmVjdGx5IGluc3RlYWQuXG4gICAgY29tcHV0ZWQ6IHJlcXVpcmUoJ29ic2Vydi9jb21wdXRlZCcpLFxuICAgIC8vIHJlbW92ZSBmcm9tIGNvcmU6IHJlcXVpcmUgd2F0Y2ggZGlyZWN0bHkgaW5zdGVhZC5cbiAgICB3YXRjaDogcmVxdWlyZSgnb2JzZXJ2L3dhdGNoJylcbn07XG5cbmZ1bmN0aW9uIGlucHV0KG5hbWVzKSB7XG4gICAgaWYgKCFuYW1lcykge1xuICAgICAgICByZXR1cm4gU2luZ2xlRXZlbnQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gTXVsdGlwbGVFdmVudChuYW1lcyk7XG59XG5cbmZ1bmN0aW9uIHN0YXRlKG9iaikge1xuICAgIHZhciBjb3B5ID0gZXh0ZW5kKG9iaik7XG4gICAgdmFyICRjaGFubmVscyA9IGNvcHkuY2hhbm5lbHM7XG4gICAgdmFyICRoYW5kbGVzID0gY29weS5oYW5kbGVzO1xuXG4gICAgaWYgKCRjaGFubmVscykge1xuICAgICAgICBjb3B5LmNoYW5uZWxzID0gbWVyY3VyeS52YWx1ZShudWxsKTtcbiAgICB9IGVsc2UgaWYgKCRoYW5kbGVzKSB7XG4gICAgICAgIGNvcHkuaGFuZGxlcyA9IG1lcmN1cnkudmFsdWUobnVsbCk7XG4gICAgfVxuXG4gICAgdmFyIG9ic2VydiA9IG1lcmN1cnkuc3RydWN0KGNvcHkpO1xuICAgIGlmICgkY2hhbm5lbHMpIHtcbiAgICAgICAgb2JzZXJ2LmNoYW5uZWxzLnNldChtZXJjdXJ5LmNoYW5uZWxzKCRjaGFubmVscywgb2JzZXJ2KSk7XG4gICAgfSBlbHNlIGlmICgkaGFuZGxlcykge1xuICAgICAgICBvYnNlcnYuaGFuZGxlcy5zZXQobWVyY3VyeS5jaGFubmVscygkaGFuZGxlcywgb2JzZXJ2KSk7XG4gICAgfVxuICAgIHJldHVybiBvYnNlcnY7XG59XG5cbmZ1bmN0aW9uIGNoYW5uZWxzKGZ1bmNzLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGZ1bmNzKS5yZWR1Y2UoY3JlYXRlSGFuZGxlLCB7fSk7XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVIYW5kbGUoYWNjLCBuYW1lKSB7XG4gICAgICAgIHZhciBoYW5kbGUgPSBtZXJjdXJ5LkRlbGVnYXRvci5hbGxvY2F0ZUhhbmRsZShcbiAgICAgICAgICAgIGZ1bmNzW25hbWVdLmJpbmQobnVsbCwgY29udGV4dCkpO1xuXG4gICAgICAgIGFjY1tuYW1lXSA9IGhhbmRsZTtcbiAgICAgICAgcmV0dXJuIGFjYztcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGFwcChlbGVtLCBvYnNlcnYsIHJlbmRlciwgb3B0cykge1xuICAgIG1lcmN1cnkuRGVsZWdhdG9yKG9wdHMpO1xuICAgIHZhciBsb29wID0gbWVyY3VyeS5tYWluKG9ic2VydigpLCByZW5kZXIsIGV4dGVuZCh7XG4gICAgICAgIGRpZmY6IG1lcmN1cnkuZGlmZixcbiAgICAgICAgY3JlYXRlOiBtZXJjdXJ5LmNyZWF0ZSxcbiAgICAgICAgcGF0Y2g6IG1lcmN1cnkucGF0Y2hcbiAgICB9LCBvcHRzKSk7XG4gICAgaWYgKGVsZW0pIHtcbiAgICAgICAgZWxlbS5hcHBlbmRDaGlsZChsb29wLnRhcmdldCk7XG4gICAgfVxuICAgIHJldHVybiBvYnNlcnYobG9vcC51cGRhdGUpO1xufVxuIiwidmFyIEV2U3RvcmUgPSByZXF1aXJlKFwiZXYtc3RvcmVcIilcblxubW9kdWxlLmV4cG9ydHMgPSBhZGRFdmVudFxuXG5mdW5jdGlvbiBhZGRFdmVudCh0YXJnZXQsIHR5cGUsIGhhbmRsZXIpIHtcbiAgICB2YXIgZXZlbnRzID0gRXZTdG9yZSh0YXJnZXQpXG4gICAgdmFyIGV2ZW50ID0gZXZlbnRzW3R5cGVdXG5cbiAgICBpZiAoIWV2ZW50KSB7XG4gICAgICAgIGV2ZW50c1t0eXBlXSA9IGhhbmRsZXJcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZXZlbnQpKSB7XG4gICAgICAgIGlmIChldmVudC5pbmRleE9mKGhhbmRsZXIpID09PSAtMSkge1xuICAgICAgICAgICAgZXZlbnQucHVzaChoYW5kbGVyKVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChldmVudCAhPT0gaGFuZGxlcikge1xuICAgICAgICBldmVudHNbdHlwZV0gPSBbZXZlbnQsIGhhbmRsZXJdXG4gICAgfVxufVxuIiwidmFyIGdsb2JhbERvY3VtZW50ID0gcmVxdWlyZShcImdsb2JhbC9kb2N1bWVudFwiKVxudmFyIEV2U3RvcmUgPSByZXF1aXJlKFwiZXYtc3RvcmVcIilcbnZhciBjcmVhdGVTdG9yZSA9IHJlcXVpcmUoXCJ3ZWFrbWFwLXNoaW0vY3JlYXRlLXN0b3JlXCIpXG5cbnZhciBhZGRFdmVudCA9IHJlcXVpcmUoXCIuL2FkZC1ldmVudC5qc1wiKVxudmFyIHJlbW92ZUV2ZW50ID0gcmVxdWlyZShcIi4vcmVtb3ZlLWV2ZW50LmpzXCIpXG52YXIgUHJveHlFdmVudCA9IHJlcXVpcmUoXCIuL3Byb3h5LWV2ZW50LmpzXCIpXG5cbnZhciBIQU5ETEVSX1NUT1JFID0gY3JlYXRlU3RvcmUoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IERPTURlbGVnYXRvclxuXG5mdW5jdGlvbiBET01EZWxlZ2F0b3IoZG9jdW1lbnQpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgRE9NRGVsZWdhdG9yKSkge1xuICAgICAgICByZXR1cm4gbmV3IERPTURlbGVnYXRvcihkb2N1bWVudCk7XG4gICAgfVxuXG4gICAgZG9jdW1lbnQgPSBkb2N1bWVudCB8fCBnbG9iYWxEb2N1bWVudFxuXG4gICAgdGhpcy50YXJnZXQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcbiAgICB0aGlzLmV2ZW50cyA9IHt9XG4gICAgdGhpcy5yYXdFdmVudExpc3RlbmVycyA9IHt9XG4gICAgdGhpcy5nbG9iYWxMaXN0ZW5lcnMgPSB7fVxufVxuXG5ET01EZWxlZ2F0b3IucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBhZGRFdmVudFxuRE9NRGVsZWdhdG9yLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gcmVtb3ZlRXZlbnRcblxuRE9NRGVsZWdhdG9yLmFsbG9jYXRlSGFuZGxlID1cbiAgICBmdW5jdGlvbiBhbGxvY2F0ZUhhbmRsZShmdW5jKSB7XG4gICAgICAgIHZhciBoYW5kbGUgPSBuZXcgSGFuZGxlKClcblxuICAgICAgICBIQU5ETEVSX1NUT1JFKGhhbmRsZSkuZnVuYyA9IGZ1bmM7XG5cbiAgICAgICAgcmV0dXJuIGhhbmRsZVxuICAgIH1cblxuRE9NRGVsZWdhdG9yLnRyYW5zZm9ybUhhbmRsZSA9XG4gICAgZnVuY3Rpb24gdHJhbnNmb3JtSGFuZGxlKGhhbmRsZSwgYnJvYWRjYXN0KSB7XG4gICAgICAgIHZhciBmdW5jID0gSEFORExFUl9TVE9SRShoYW5kbGUpLmZ1bmNcblxuICAgICAgICByZXR1cm4gdGhpcy5hbGxvY2F0ZUhhbmRsZShmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIGJyb2FkY2FzdChldiwgZnVuYyk7XG4gICAgICAgIH0pXG4gICAgfVxuXG5ET01EZWxlZ2F0b3IucHJvdG90eXBlLmFkZEdsb2JhbEV2ZW50TGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIGFkZEdsb2JhbEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBmbikge1xuICAgICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5nbG9iYWxMaXN0ZW5lcnNbZXZlbnROYW1lXSB8fCBbXTtcbiAgICAgICAgaWYgKGxpc3RlbmVycy5pbmRleE9mKGZuKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy5wdXNoKGZuKVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5nbG9iYWxMaXN0ZW5lcnNbZXZlbnROYW1lXSA9IGxpc3RlbmVycztcbiAgICB9XG5cbkRPTURlbGVnYXRvci5wcm90b3R5cGUucmVtb3ZlR2xvYmFsRXZlbnRMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcmVtb3ZlR2xvYmFsRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGZuKSB7XG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLmdsb2JhbExpc3RlbmVyc1tldmVudE5hbWVdIHx8IFtdO1xuXG4gICAgICAgIHZhciBpbmRleCA9IGxpc3RlbmVycy5pbmRleE9mKGZuKVxuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICBsaXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICB9XG4gICAgfVxuXG5ET01EZWxlZ2F0b3IucHJvdG90eXBlLmxpc3RlblRvID0gZnVuY3Rpb24gbGlzdGVuVG8oZXZlbnROYW1lKSB7XG4gICAgaWYgKCEoZXZlbnROYW1lIGluIHRoaXMuZXZlbnRzKSkge1xuICAgICAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdID0gMDtcbiAgICB9XG5cbiAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdKys7XG5cbiAgICBpZiAodGhpcy5ldmVudHNbZXZlbnROYW1lXSAhPT0gMSkge1xuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLnJhd0V2ZW50TGlzdGVuZXJzW2V2ZW50TmFtZV1cbiAgICBpZiAoIWxpc3RlbmVyKSB7XG4gICAgICAgIGxpc3RlbmVyID0gdGhpcy5yYXdFdmVudExpc3RlbmVyc1tldmVudE5hbWVdID1cbiAgICAgICAgICAgIGNyZWF0ZUhhbmRsZXIoZXZlbnROYW1lLCB0aGlzKVxuICAgIH1cblxuICAgIHRoaXMudGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBsaXN0ZW5lciwgdHJ1ZSlcbn1cblxuRE9NRGVsZWdhdG9yLnByb3RvdHlwZS51bmxpc3RlblRvID0gZnVuY3Rpb24gdW5saXN0ZW5UbyhldmVudE5hbWUpIHtcbiAgICBpZiAoIShldmVudE5hbWUgaW4gdGhpcy5ldmVudHMpKSB7XG4gICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0gPSAwO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmV2ZW50c1tldmVudE5hbWVdID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImFscmVhZHkgdW5saXN0ZW5lZCB0byBldmVudC5cIik7XG4gICAgfVxuXG4gICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXS0tO1xuXG4gICAgaWYgKHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0gIT09IDApIHtcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdmFyIGxpc3RlbmVyID0gdGhpcy5yYXdFdmVudExpc3RlbmVyc1tldmVudE5hbWVdXG5cbiAgICBpZiAoIWxpc3RlbmVyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImRvbS1kZWxlZ2F0b3IjdW5saXN0ZW5UbzogY2Fubm90IFwiICtcbiAgICAgICAgICAgIFwidW5saXN0ZW4gdG8gXCIgKyBldmVudE5hbWUpXG4gICAgfVxuXG4gICAgdGhpcy50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGxpc3RlbmVyLCB0cnVlKVxufVxuXG5mdW5jdGlvbiBjcmVhdGVIYW5kbGVyKGV2ZW50TmFtZSwgZGVsZWdhdG9yKSB7XG4gICAgdmFyIGdsb2JhbExpc3RlbmVycyA9IGRlbGVnYXRvci5nbG9iYWxMaXN0ZW5lcnM7XG4gICAgdmFyIGRlbGVnYXRvclRhcmdldCA9IGRlbGVnYXRvci50YXJnZXQ7XG5cbiAgICByZXR1cm4gaGFuZGxlclxuXG4gICAgZnVuY3Rpb24gaGFuZGxlcihldikge1xuICAgICAgICB2YXIgZ2xvYmFsSGFuZGxlcnMgPSBnbG9iYWxMaXN0ZW5lcnNbZXZlbnROYW1lXSB8fCBbXVxuXG4gICAgICAgIGlmIChnbG9iYWxIYW5kbGVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YXIgZ2xvYmFsRXZlbnQgPSBuZXcgUHJveHlFdmVudChldik7XG4gICAgICAgICAgICBnbG9iYWxFdmVudC5jdXJyZW50VGFyZ2V0ID0gZGVsZWdhdG9yVGFyZ2V0O1xuICAgICAgICAgICAgY2FsbExpc3RlbmVycyhnbG9iYWxIYW5kbGVycywgZ2xvYmFsRXZlbnQpXG4gICAgICAgIH1cblxuICAgICAgICBmaW5kQW5kSW52b2tlTGlzdGVuZXJzKGV2LnRhcmdldCwgZXYsIGV2ZW50TmFtZSlcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGZpbmRBbmRJbnZva2VMaXN0ZW5lcnMoZWxlbSwgZXYsIGV2ZW50TmFtZSkge1xuICAgIHZhciBsaXN0ZW5lciA9IGdldExpc3RlbmVyKGVsZW0sIGV2ZW50TmFtZSlcblxuICAgIGlmIChsaXN0ZW5lciAmJiBsaXN0ZW5lci5oYW5kbGVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBsaXN0ZW5lckV2ZW50ID0gbmV3IFByb3h5RXZlbnQoZXYpO1xuICAgICAgICBsaXN0ZW5lckV2ZW50LmN1cnJlbnRUYXJnZXQgPSBsaXN0ZW5lci5jdXJyZW50VGFyZ2V0XG4gICAgICAgIGNhbGxMaXN0ZW5lcnMobGlzdGVuZXIuaGFuZGxlcnMsIGxpc3RlbmVyRXZlbnQpXG5cbiAgICAgICAgaWYgKGxpc3RlbmVyRXZlbnQuX2J1YmJsZXMpIHtcbiAgICAgICAgICAgIHZhciBuZXh0VGFyZ2V0ID0gbGlzdGVuZXIuY3VycmVudFRhcmdldC5wYXJlbnROb2RlXG4gICAgICAgICAgICBmaW5kQW5kSW52b2tlTGlzdGVuZXJzKG5leHRUYXJnZXQsIGV2LCBldmVudE5hbWUpXG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGdldExpc3RlbmVyKHRhcmdldCwgdHlwZSkge1xuICAgIC8vIHRlcm1pbmF0ZSByZWN1cnNpb24gaWYgcGFyZW50IGlzIGBudWxsYFxuICAgIGlmICh0YXJnZXQgPT09IG51bGwgfHwgdHlwZW9mIHRhcmdldCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIHZhciBldmVudHMgPSBFdlN0b3JlKHRhcmdldClcbiAgICAvLyBmZXRjaCBsaXN0IG9mIGhhbmRsZXIgZm5zIGZvciB0aGlzIGV2ZW50XG4gICAgdmFyIGhhbmRsZXIgPSBldmVudHNbdHlwZV1cbiAgICB2YXIgYWxsSGFuZGxlciA9IGV2ZW50cy5ldmVudFxuXG4gICAgaWYgKCFoYW5kbGVyICYmICFhbGxIYW5kbGVyKSB7XG4gICAgICAgIHJldHVybiBnZXRMaXN0ZW5lcih0YXJnZXQucGFyZW50Tm9kZSwgdHlwZSlcbiAgICB9XG5cbiAgICB2YXIgaGFuZGxlcnMgPSBbXS5jb25jYXQoaGFuZGxlciB8fCBbXSwgYWxsSGFuZGxlciB8fCBbXSlcbiAgICByZXR1cm4gbmV3IExpc3RlbmVyKHRhcmdldCwgaGFuZGxlcnMpXG59XG5cbmZ1bmN0aW9uIGNhbGxMaXN0ZW5lcnMoaGFuZGxlcnMsIGV2KSB7XG4gICAgaGFuZGxlcnMuZm9yRWFjaChmdW5jdGlvbiAoaGFuZGxlcikge1xuICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgaGFuZGxlcihldilcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaGFuZGxlci5oYW5kbGVFdmVudCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBoYW5kbGVyLmhhbmRsZUV2ZW50KGV2KVxuICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIudHlwZSA9PT0gXCJkb20tZGVsZWdhdG9yLWhhbmRsZVwiKSB7XG4gICAgICAgICAgICBIQU5ETEVSX1NUT1JFKGhhbmRsZXIpLmZ1bmMoZXYpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJkb20tZGVsZWdhdG9yOiB1bmtub3duIGhhbmRsZXIgXCIgK1xuICAgICAgICAgICAgICAgIFwiZm91bmQ6IFwiICsgSlNPTi5zdHJpbmdpZnkoaGFuZGxlcnMpKTtcbiAgICAgICAgfVxuICAgIH0pXG59XG5cbmZ1bmN0aW9uIExpc3RlbmVyKHRhcmdldCwgaGFuZGxlcnMpIHtcbiAgICB0aGlzLmN1cnJlbnRUYXJnZXQgPSB0YXJnZXRcbiAgICB0aGlzLmhhbmRsZXJzID0gaGFuZGxlcnNcbn1cblxuZnVuY3Rpb24gSGFuZGxlKCkge1xuICAgIHRoaXMudHlwZSA9IFwiZG9tLWRlbGVnYXRvci1oYW5kbGVcIlxufVxuIiwidmFyIEluZGl2aWR1YWwgPSByZXF1aXJlKFwiaW5kaXZpZHVhbFwiKVxudmFyIGN1aWQgPSByZXF1aXJlKFwiY3VpZFwiKVxudmFyIGdsb2JhbERvY3VtZW50ID0gcmVxdWlyZShcImdsb2JhbC9kb2N1bWVudFwiKVxuXG52YXIgRE9NRGVsZWdhdG9yID0gcmVxdWlyZShcIi4vZG9tLWRlbGVnYXRvci5qc1wiKVxuXG52YXIgdmVyc2lvbktleSA9IFwiMTNcIlxudmFyIGNhY2hlS2V5ID0gXCJfX0RPTV9ERUxFR0FUT1JfQ0FDSEVAXCIgKyB2ZXJzaW9uS2V5XG52YXIgY2FjaGVUb2tlbktleSA9IFwiX19ET01fREVMRUdBVE9SX0NBQ0hFX1RPS0VOQFwiICsgdmVyc2lvbktleVxudmFyIGRlbGVnYXRvckNhY2hlID0gSW5kaXZpZHVhbChjYWNoZUtleSwge1xuICAgIGRlbGVnYXRvcnM6IHt9XG59KVxudmFyIGNvbW1vbkV2ZW50cyA9IFtcbiAgICBcImJsdXJcIiwgXCJjaGFuZ2VcIiwgXCJjbGlja1wiLCAgXCJjb250ZXh0bWVudVwiLCBcImRibGNsaWNrXCIsXG4gICAgXCJlcnJvclwiLFwiZm9jdXNcIiwgXCJmb2N1c2luXCIsIFwiZm9jdXNvdXRcIiwgXCJpbnB1dFwiLCBcImtleWRvd25cIixcbiAgICBcImtleXByZXNzXCIsIFwia2V5dXBcIiwgXCJsb2FkXCIsIFwibW91c2Vkb3duXCIsIFwibW91c2V1cFwiLFxuICAgIFwicmVzaXplXCIsIFwic2VsZWN0XCIsIFwic3VibWl0XCIsIFwidG91Y2hjYW5jZWxcIixcbiAgICBcInRvdWNoZW5kXCIsIFwidG91Y2hzdGFydFwiLCBcInVubG9hZFwiXG5dXG5cbi8qICBEZWxlZ2F0b3IgaXMgYSB0aGluIHdyYXBwZXIgYXJvdW5kIGEgc2luZ2xldG9uIGBET01EZWxlZ2F0b3JgXG4gICAgICAgIGluc3RhbmNlLlxuXG4gICAgT25seSBvbmUgRE9NRGVsZWdhdG9yIHNob3VsZCBleGlzdCBiZWNhdXNlIHdlIGRvIG5vdCB3YW50XG4gICAgICAgIGR1cGxpY2F0ZSBldmVudCBsaXN0ZW5lcnMgYm91bmQgdG8gdGhlIERPTS5cblxuICAgIGBEZWxlZ2F0b3JgIHdpbGwgYWxzbyBgbGlzdGVuVG8oKWAgYWxsIGV2ZW50cyB1bmxlc3NcbiAgICAgICAgZXZlcnkgY2FsbGVyIG9wdHMgb3V0IG9mIGl0XG4qL1xubW9kdWxlLmV4cG9ydHMgPSBEZWxlZ2F0b3JcblxuZnVuY3Rpb24gRGVsZWdhdG9yKG9wdHMpIHtcbiAgICBvcHRzID0gb3B0cyB8fCB7fVxuICAgIHZhciBkb2N1bWVudCA9IG9wdHMuZG9jdW1lbnQgfHwgZ2xvYmFsRG9jdW1lbnRcblxuICAgIHZhciBjYWNoZUtleSA9IGRvY3VtZW50W2NhY2hlVG9rZW5LZXldXG5cbiAgICBpZiAoIWNhY2hlS2V5KSB7XG4gICAgICAgIGNhY2hlS2V5ID1cbiAgICAgICAgICAgIGRvY3VtZW50W2NhY2hlVG9rZW5LZXldID0gY3VpZCgpXG4gICAgfVxuXG4gICAgdmFyIGRlbGVnYXRvciA9IGRlbGVnYXRvckNhY2hlLmRlbGVnYXRvcnNbY2FjaGVLZXldXG5cbiAgICBpZiAoIWRlbGVnYXRvcikge1xuICAgICAgICBkZWxlZ2F0b3IgPSBkZWxlZ2F0b3JDYWNoZS5kZWxlZ2F0b3JzW2NhY2hlS2V5XSA9XG4gICAgICAgICAgICBuZXcgRE9NRGVsZWdhdG9yKGRvY3VtZW50KVxuICAgIH1cblxuICAgIGlmIChvcHRzLmRlZmF1bHRFdmVudHMgIT09IGZhbHNlKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29tbW9uRXZlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBkZWxlZ2F0b3IubGlzdGVuVG8oY29tbW9uRXZlbnRzW2ldKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlbGVnYXRvclxufVxuXG5EZWxlZ2F0b3IuYWxsb2NhdGVIYW5kbGUgPSBET01EZWxlZ2F0b3IuYWxsb2NhdGVIYW5kbGU7XG5EZWxlZ2F0b3IudHJhbnNmb3JtSGFuZGxlID0gRE9NRGVsZWdhdG9yLnRyYW5zZm9ybUhhbmRsZTtcbiIsIi8qKlxuICogY3VpZC5qc1xuICogQ29sbGlzaW9uLXJlc2lzdGFudCBVSUQgZ2VuZXJhdG9yIGZvciBicm93c2VycyBhbmQgbm9kZS5cbiAqIFNlcXVlbnRpYWwgZm9yIGZhc3QgZGIgbG9va3VwcyBhbmQgcmVjZW5jeSBzb3J0aW5nLlxuICogU2FmZSBmb3IgZWxlbWVudCBJRHMgYW5kIHNlcnZlci1zaWRlIGxvb2t1cHMuXG4gKlxuICogRXh0cmFjdGVkIGZyb20gQ0xDVFJcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIEVyaWMgRWxsaW90dCAyMDEyXG4gKiBNSVQgTGljZW5zZVxuICovXG5cbi8qZ2xvYmFsIHdpbmRvdywgbmF2aWdhdG9yLCBkb2N1bWVudCwgcmVxdWlyZSwgcHJvY2VzcywgbW9kdWxlICovXG4oZnVuY3Rpb24gKGFwcCkge1xuICAndXNlIHN0cmljdCc7XG4gIHZhciBuYW1lc3BhY2UgPSAnY3VpZCcsXG4gICAgYyA9IDAsXG4gICAgYmxvY2tTaXplID0gNCxcbiAgICBiYXNlID0gMzYsXG4gICAgZGlzY3JldGVWYWx1ZXMgPSBNYXRoLnBvdyhiYXNlLCBibG9ja1NpemUpLFxuXG4gICAgcGFkID0gZnVuY3Rpb24gcGFkKG51bSwgc2l6ZSkge1xuICAgICAgdmFyIHMgPSBcIjAwMDAwMDAwMFwiICsgbnVtO1xuICAgICAgcmV0dXJuIHMuc3Vic3RyKHMubGVuZ3RoLXNpemUpO1xuICAgIH0sXG5cbiAgICByYW5kb21CbG9jayA9IGZ1bmN0aW9uIHJhbmRvbUJsb2NrKCkge1xuICAgICAgcmV0dXJuIHBhZCgoTWF0aC5yYW5kb20oKSAqXG4gICAgICAgICAgICBkaXNjcmV0ZVZhbHVlcyA8PCAwKVxuICAgICAgICAgICAgLnRvU3RyaW5nKGJhc2UpLCBibG9ja1NpemUpO1xuICAgIH0sXG5cbiAgICBzYWZlQ291bnRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGMgPSAoYyA8IGRpc2NyZXRlVmFsdWVzKSA/IGMgOiAwO1xuICAgICAgYysrOyAvLyB0aGlzIGlzIG5vdCBzdWJsaW1pbmFsXG4gICAgICByZXR1cm4gYyAtIDE7XG4gICAgfSxcblxuICAgIGFwaSA9IGZ1bmN0aW9uIGN1aWQoKSB7XG4gICAgICAvLyBTdGFydGluZyB3aXRoIGEgbG93ZXJjYXNlIGxldHRlciBtYWtlc1xuICAgICAgLy8gaXQgSFRNTCBlbGVtZW50IElEIGZyaWVuZGx5LlxuICAgICAgdmFyIGxldHRlciA9ICdjJywgLy8gaGFyZC1jb2RlZCBhbGxvd3MgZm9yIHNlcXVlbnRpYWwgYWNjZXNzXG5cbiAgICAgICAgLy8gdGltZXN0YW1wXG4gICAgICAgIC8vIHdhcm5pbmc6IHRoaXMgZXhwb3NlcyB0aGUgZXhhY3QgZGF0ZSBhbmQgdGltZVxuICAgICAgICAvLyB0aGF0IHRoZSB1aWQgd2FzIGNyZWF0ZWQuXG4gICAgICAgIHRpbWVzdGFtcCA9IChuZXcgRGF0ZSgpLmdldFRpbWUoKSkudG9TdHJpbmcoYmFzZSksXG5cbiAgICAgICAgLy8gUHJldmVudCBzYW1lLW1hY2hpbmUgY29sbGlzaW9ucy5cbiAgICAgICAgY291bnRlcixcblxuICAgICAgICAvLyBBIGZldyBjaGFycyB0byBnZW5lcmF0ZSBkaXN0aW5jdCBpZHMgZm9yIGRpZmZlcmVudFxuICAgICAgICAvLyBjbGllbnRzIChzbyBkaWZmZXJlbnQgY29tcHV0ZXJzIGFyZSBmYXIgbGVzc1xuICAgICAgICAvLyBsaWtlbHkgdG8gZ2VuZXJhdGUgdGhlIHNhbWUgaWQpXG4gICAgICAgIGZpbmdlcnByaW50ID0gYXBpLmZpbmdlcnByaW50KCksXG5cbiAgICAgICAgLy8gR3JhYiBzb21lIG1vcmUgY2hhcnMgZnJvbSBNYXRoLnJhbmRvbSgpXG4gICAgICAgIHJhbmRvbSA9IHJhbmRvbUJsb2NrKCkgKyByYW5kb21CbG9jaygpO1xuXG4gICAgICAgIGNvdW50ZXIgPSBwYWQoc2FmZUNvdW50ZXIoKS50b1N0cmluZyhiYXNlKSwgYmxvY2tTaXplKTtcblxuICAgICAgcmV0dXJuICAobGV0dGVyICsgdGltZXN0YW1wICsgY291bnRlciArIGZpbmdlcnByaW50ICsgcmFuZG9tKTtcbiAgICB9O1xuXG4gIGFwaS5zbHVnID0gZnVuY3Rpb24gc2x1ZygpIHtcbiAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpLnRvU3RyaW5nKDM2KSxcbiAgICAgIGNvdW50ZXIsXG4gICAgICBwcmludCA9IGFwaS5maW5nZXJwcmludCgpLnNsaWNlKDAsMSkgK1xuICAgICAgICBhcGkuZmluZ2VycHJpbnQoKS5zbGljZSgtMSksXG4gICAgICByYW5kb20gPSByYW5kb21CbG9jaygpLnNsaWNlKC0yKTtcblxuICAgICAgY291bnRlciA9IHNhZmVDb3VudGVyKCkudG9TdHJpbmcoMzYpLnNsaWNlKC00KTtcblxuICAgIHJldHVybiBkYXRlLnNsaWNlKC0yKSArXG4gICAgICBjb3VudGVyICsgcHJpbnQgKyByYW5kb207XG4gIH07XG5cbiAgYXBpLmdsb2JhbENvdW50ID0gZnVuY3Rpb24gZ2xvYmFsQ291bnQoKSB7XG4gICAgLy8gV2Ugd2FudCB0byBjYWNoZSB0aGUgcmVzdWx0cyBvZiB0aGlzXG4gICAgdmFyIGNhY2hlID0gKGZ1bmN0aW9uIGNhbGMoKSB7XG4gICAgICAgIHZhciBpLFxuICAgICAgICAgIGNvdW50ID0gMDtcblxuICAgICAgICBmb3IgKGkgaW4gd2luZG93KSB7XG4gICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb3VudDtcbiAgICAgIH0oKSk7XG5cbiAgICBhcGkuZ2xvYmFsQ291bnQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBjYWNoZTsgfTtcbiAgICByZXR1cm4gY2FjaGU7XG4gIH07XG5cbiAgYXBpLmZpbmdlcnByaW50ID0gZnVuY3Rpb24gYnJvd3NlclByaW50KCkge1xuICAgIHJldHVybiBwYWQoKG5hdmlnYXRvci5taW1lVHlwZXMubGVuZ3RoICtcbiAgICAgIG5hdmlnYXRvci51c2VyQWdlbnQubGVuZ3RoKS50b1N0cmluZygzNikgK1xuICAgICAgYXBpLmdsb2JhbENvdW50KCkudG9TdHJpbmcoMzYpLCA0KTtcbiAgfTtcblxuICAvLyBkb24ndCBjaGFuZ2UgYW55dGhpbmcgZnJvbSBoZXJlIGRvd24uXG4gIGlmIChhcHAucmVnaXN0ZXIpIHtcbiAgICBhcHAucmVnaXN0ZXIobmFtZXNwYWNlLCBhcGkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBhcGk7XG4gIH0gZWxzZSB7XG4gICAgYXBwW25hbWVzcGFjZV0gPSBhcGk7XG4gIH1cblxufSh0aGlzLmFwcGxpdHVkZSB8fCB0aGlzKSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBPbmVWZXJzaW9uQ29uc3RyYWludCA9IHJlcXVpcmUoJ2luZGl2aWR1YWwvb25lLXZlcnNpb24nKTtcblxudmFyIE1ZX1ZFUlNJT04gPSAnNyc7XG5PbmVWZXJzaW9uQ29uc3RyYWludCgnZXYtc3RvcmUnLCBNWV9WRVJTSU9OKTtcblxudmFyIGhhc2hLZXkgPSAnX19FVl9TVE9SRV9LRVlAJyArIE1ZX1ZFUlNJT047XG5cbm1vZHVsZS5leHBvcnRzID0gRXZTdG9yZTtcblxuZnVuY3Rpb24gRXZTdG9yZShlbGVtKSB7XG4gICAgdmFyIGhhc2ggPSBlbGVtW2hhc2hLZXldO1xuXG4gICAgaWYgKCFoYXNoKSB7XG4gICAgICAgIGhhc2ggPSBlbGVtW2hhc2hLZXldID0ge307XG4gICAgfVxuXG4gICAgcmV0dXJuIGhhc2g7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qZ2xvYmFsIHdpbmRvdywgZ2xvYmFsKi9cblxudmFyIHJvb3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/XG4gICAgd2luZG93IDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgP1xuICAgIGdsb2JhbCA6IHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEluZGl2aWR1YWw7XG5cbmZ1bmN0aW9uIEluZGl2aWR1YWwoa2V5LCB2YWx1ZSkge1xuICAgIGlmIChrZXkgaW4gcm9vdCkge1xuICAgICAgICByZXR1cm4gcm9vdFtrZXldO1xuICAgIH1cblxuICAgIHJvb3Rba2V5XSA9IHZhbHVlO1xuXG4gICAgcmV0dXJuIHZhbHVlO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgSW5kaXZpZHVhbCA9IHJlcXVpcmUoJy4vaW5kZXguanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBPbmVWZXJzaW9uO1xuXG5mdW5jdGlvbiBPbmVWZXJzaW9uKG1vZHVsZU5hbWUsIHZlcnNpb24sIGRlZmF1bHRWYWx1ZSkge1xuICAgIHZhciBrZXkgPSAnX19JTkRJVklEVUFMX09ORV9WRVJTSU9OXycgKyBtb2R1bGVOYW1lO1xuICAgIHZhciBlbmZvcmNlS2V5ID0ga2V5ICsgJ19FTkZPUkNFX1NJTkdMRVRPTic7XG5cbiAgICB2YXIgdmVyc2lvblZhbHVlID0gSW5kaXZpZHVhbChlbmZvcmNlS2V5LCB2ZXJzaW9uKTtcblxuICAgIGlmICh2ZXJzaW9uVmFsdWUgIT09IHZlcnNpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW4gb25seSBoYXZlIG9uZSBjb3B5IG9mICcgK1xuICAgICAgICAgICAgbW9kdWxlTmFtZSArICcuXFxuJyArXG4gICAgICAgICAgICAnWW91IGFscmVhZHkgaGF2ZSB2ZXJzaW9uICcgKyB2ZXJzaW9uVmFsdWUgK1xuICAgICAgICAgICAgJyBpbnN0YWxsZWQuXFxuJyArXG4gICAgICAgICAgICAnVGhpcyBtZWFucyB5b3UgY2Fubm90IGluc3RhbGwgdmVyc2lvbiAnICsgdmVyc2lvbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIEluZGl2aWR1YWwoa2V5LCBkZWZhdWx0VmFsdWUpO1xufVxuIiwidmFyIHRvcExldmVsID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOlxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDoge31cbnZhciBtaW5Eb2MgPSByZXF1aXJlKCdtaW4tZG9jdW1lbnQnKTtcblxuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGRvY3VtZW50O1xufSBlbHNlIHtcbiAgICB2YXIgZG9jY3kgPSB0b3BMZXZlbFsnX19HTE9CQUxfRE9DVU1FTlRfQ0FDSEVANCddO1xuXG4gICAgaWYgKCFkb2NjeSkge1xuICAgICAgICBkb2NjeSA9IHRvcExldmVsWydfX0dMT0JBTF9ET0NVTUVOVF9DQUNIRUA0J10gPSBtaW5Eb2M7XG4gICAgfVxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBkb2NjeTtcbn1cbiIsInZhciByb290ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgP1xuICAgIHdpbmRvdyA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID9cbiAgICBnbG9iYWwgOiB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbmRpdmlkdWFsXG5cbmZ1bmN0aW9uIEluZGl2aWR1YWwoa2V5LCB2YWx1ZSkge1xuICAgIGlmIChyb290W2tleV0pIHtcbiAgICAgICAgcmV0dXJuIHJvb3Rba2V5XVxuICAgIH1cblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyb290LCBrZXksIHtcbiAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICwgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcblxuICAgIHJldHVybiB2YWx1ZVxufVxuIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCJ2YXIgaGlkZGVuU3RvcmUgPSByZXF1aXJlKCcuL2hpZGRlbi1zdG9yZS5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVN0b3JlO1xuXG5mdW5jdGlvbiBjcmVhdGVTdG9yZSgpIHtcbiAgICB2YXIga2V5ID0ge307XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICBpZiAoKHR5cGVvZiBvYmogIT09ICdvYmplY3QnIHx8IG9iaiA9PT0gbnVsbCkgJiZcbiAgICAgICAgICAgIHR5cGVvZiBvYmogIT09ICdmdW5jdGlvbidcbiAgICAgICAgKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dlYWttYXAtc2hpbTogS2V5IG11c3QgYmUgb2JqZWN0JylcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdG9yZSA9IG9iai52YWx1ZU9mKGtleSk7XG4gICAgICAgIHJldHVybiBzdG9yZSAmJiBzdG9yZS5pZGVudGl0eSA9PT0ga2V5ID9cbiAgICAgICAgICAgIHN0b3JlIDogaGlkZGVuU3RvcmUob2JqLCBrZXkpO1xuICAgIH07XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGhpZGRlblN0b3JlO1xuXG5mdW5jdGlvbiBoaWRkZW5TdG9yZShvYmosIGtleSkge1xuICAgIHZhciBzdG9yZSA9IHsgaWRlbnRpdHk6IGtleSB9O1xuICAgIHZhciB2YWx1ZU9mID0gb2JqLnZhbHVlT2Y7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBcInZhbHVlT2ZcIiwge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgIT09IGtleSA/XG4gICAgICAgICAgICAgICAgdmFsdWVPZi5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDogc3RvcmU7XG4gICAgICAgIH0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG5cbiAgICByZXR1cm4gc3RvcmU7XG59XG4iLCJ2YXIgaW5oZXJpdHMgPSByZXF1aXJlKFwiaW5oZXJpdHNcIilcblxudmFyIEFMTF9QUk9QUyA9IFtcbiAgICBcImFsdEtleVwiLCBcImJ1YmJsZXNcIiwgXCJjYW5jZWxhYmxlXCIsIFwiY3RybEtleVwiLFxuICAgIFwiZXZlbnRQaGFzZVwiLCBcIm1ldGFLZXlcIiwgXCJyZWxhdGVkVGFyZ2V0XCIsIFwic2hpZnRLZXlcIixcbiAgICBcInRhcmdldFwiLCBcInRpbWVTdGFtcFwiLCBcInR5cGVcIiwgXCJ2aWV3XCIsIFwid2hpY2hcIlxuXVxudmFyIEtFWV9QUk9QUyA9IFtcImNoYXJcIiwgXCJjaGFyQ29kZVwiLCBcImtleVwiLCBcImtleUNvZGVcIl1cbnZhciBNT1VTRV9QUk9QUyA9IFtcbiAgICBcImJ1dHRvblwiLCBcImJ1dHRvbnNcIiwgXCJjbGllbnRYXCIsIFwiY2xpZW50WVwiLCBcImxheWVyWFwiLFxuICAgIFwibGF5ZXJZXCIsIFwib2Zmc2V0WFwiLCBcIm9mZnNldFlcIiwgXCJwYWdlWFwiLCBcInBhZ2VZXCIsXG4gICAgXCJzY3JlZW5YXCIsIFwic2NyZWVuWVwiLCBcInRvRWxlbWVudFwiXG5dXG5cbnZhciBya2V5RXZlbnQgPSAvXmtleXxpbnB1dC9cbnZhciBybW91c2VFdmVudCA9IC9eKD86bW91c2V8cG9pbnRlcnxjb250ZXh0bWVudSl8Y2xpY2svXG5cbm1vZHVsZS5leHBvcnRzID0gUHJveHlFdmVudFxuXG5mdW5jdGlvbiBQcm94eUV2ZW50KGV2KSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFByb3h5RXZlbnQpKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJveHlFdmVudChldilcbiAgICB9XG5cbiAgICBpZiAocmtleUV2ZW50LnRlc3QoZXYudHlwZSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBLZXlFdmVudChldilcbiAgICB9IGVsc2UgaWYgKHJtb3VzZUV2ZW50LnRlc3QoZXYudHlwZSkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBNb3VzZUV2ZW50KGV2KVxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgQUxMX1BST1BTLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBwcm9wS2V5ID0gQUxMX1BST1BTW2ldXG4gICAgICAgIHRoaXNbcHJvcEtleV0gPSBldltwcm9wS2V5XVxuICAgIH1cblxuICAgIHRoaXMuX3Jhd0V2ZW50ID0gZXZcbiAgICB0aGlzLl9idWJibGVzID0gZmFsc2U7XG59XG5cblByb3h5RXZlbnQucHJvdG90eXBlLnByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX3Jhd0V2ZW50LnByZXZlbnREZWZhdWx0KClcbn1cblxuUHJveHlFdmVudC5wcm90b3R5cGUuc3RhcnRQcm9wYWdhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9idWJibGVzID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gTW91c2VFdmVudChldikge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgQUxMX1BST1BTLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBwcm9wS2V5ID0gQUxMX1BST1BTW2ldXG4gICAgICAgIHRoaXNbcHJvcEtleV0gPSBldltwcm9wS2V5XVxuICAgIH1cblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgTU9VU0VfUFJPUFMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmFyIG1vdXNlUHJvcEtleSA9IE1PVVNFX1BST1BTW2pdXG4gICAgICAgIHRoaXNbbW91c2VQcm9wS2V5XSA9IGV2W21vdXNlUHJvcEtleV1cbiAgICB9XG5cbiAgICB0aGlzLl9yYXdFdmVudCA9IGV2XG59XG5cbmluaGVyaXRzKE1vdXNlRXZlbnQsIFByb3h5RXZlbnQpXG5cbmZ1bmN0aW9uIEtleUV2ZW50KGV2KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBBTExfUFJPUFMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHByb3BLZXkgPSBBTExfUFJPUFNbaV1cbiAgICAgICAgdGhpc1twcm9wS2V5XSA9IGV2W3Byb3BLZXldXG4gICAgfVxuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBLRVlfUFJPUFMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmFyIGtleVByb3BLZXkgPSBLRVlfUFJPUFNbal1cbiAgICAgICAgdGhpc1trZXlQcm9wS2V5XSA9IGV2W2tleVByb3BLZXldXG4gICAgfVxuXG4gICAgdGhpcy5fcmF3RXZlbnQgPSBldlxufVxuXG5pbmhlcml0cyhLZXlFdmVudCwgUHJveHlFdmVudClcbiIsInZhciBFdlN0b3JlID0gcmVxdWlyZShcImV2LXN0b3JlXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gcmVtb3ZlRXZlbnRcblxuZnVuY3Rpb24gcmVtb3ZlRXZlbnQodGFyZ2V0LCB0eXBlLCBoYW5kbGVyKSB7XG4gICAgdmFyIGV2ZW50cyA9IEV2U3RvcmUodGFyZ2V0KVxuICAgIHZhciBldmVudCA9IGV2ZW50c1t0eXBlXVxuXG4gICAgaWYgKCFldmVudCkge1xuICAgICAgICByZXR1cm5cbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZXZlbnQpKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGV2ZW50LmluZGV4T2YoaGFuZGxlcilcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgZXZlbnQuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChldmVudCA9PT0gaGFuZGxlcikge1xuICAgICAgICBldmVudHNbdHlwZV0gPSBudWxsXG4gICAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBFdmVudFxuXG5mdW5jdGlvbiBFdmVudCgpIHtcbiAgICB2YXIgbGlzdGVuZXJzID0gW11cblxuICAgIHJldHVybiB7IGJyb2FkY2FzdDogYnJvYWRjYXN0LCBsaXN0ZW46IGV2ZW50IH1cblxuICAgIGZ1bmN0aW9uIGJyb2FkY2FzdCh2YWx1ZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGlzdGVuZXJzW2ldKHZhbHVlKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXZlbnQobGlzdGVuZXIpIHtcbiAgICAgICAgbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpXG5cbiAgICAgICAgcmV0dXJuIHJlbW92ZUxpc3RlbmVyXG5cbiAgICAgICAgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcilcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwidmFyIGV2ZW50ID0gcmVxdWlyZShcIi4vc2luZ2xlLmpzXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gbXVsdGlwbGVcblxuZnVuY3Rpb24gbXVsdGlwbGUobmFtZXMpIHtcbiAgICByZXR1cm4gbmFtZXMucmVkdWNlKGZ1bmN0aW9uIChhY2MsIG5hbWUpIHtcbiAgICAgICAgYWNjW25hbWVdID0gZXZlbnQoKVxuICAgICAgICByZXR1cm4gYWNjXG4gICAgfSwge30pXG59XG4iLCJ2YXIgRXZlbnQgPSByZXF1aXJlKCcuL2V2ZW50LmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSBTaW5nbGVcblxuZnVuY3Rpb24gU2luZ2xlKCkge1xuICAgIHZhciB0dXBsZSA9IEV2ZW50KClcblxuICAgIHJldHVybiBmdW5jdGlvbiBldmVudCh2YWx1ZSkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB0dXBsZS5saXN0ZW4odmFsdWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdHVwbGUuYnJvYWRjYXN0KHZhbHVlKVxuICAgICAgICB9XG4gICAgfVxufVxuIiwidmFyIHJhZiA9IHJlcXVpcmUoXCJyYWZcIilcbnZhciBUeXBlZEVycm9yID0gcmVxdWlyZShcImVycm9yL3R5cGVkXCIpXG5cbnZhciBJbnZhbGlkVXBkYXRlSW5SZW5kZXIgPSBUeXBlZEVycm9yKHtcbiAgICB0eXBlOiBcIm1haW4tbG9vcC5pbnZhbGlkLnVwZGF0ZS5pbi1yZW5kZXJcIixcbiAgICBtZXNzYWdlOiBcIm1haW4tbG9vcDogVW5leHBlY3RlZCB1cGRhdGUgb2NjdXJyZWQgaW4gbG9vcC5cXG5cIiArXG4gICAgICAgIFwiV2UgYXJlIGN1cnJlbnRseSByZW5kZXJpbmcgYSB2aWV3LCBcIiArXG4gICAgICAgICAgICBcInlvdSBjYW4ndCBjaGFuZ2Ugc3RhdGUgcmlnaHQgbm93LlxcblwiICtcbiAgICAgICAgXCJUaGUgZGlmZiBpczoge3N0cmluZ0RpZmZ9LlxcblwiICtcbiAgICAgICAgXCJTVUdHRVNURUQgRklYOiBmaW5kIHRoZSBzdGF0ZSBtdXRhdGlvbiBpbiB5b3VyIHZpZXcgXCIgK1xuICAgICAgICAgICAgXCJvciByZW5kZXJpbmcgZnVuY3Rpb24gYW5kIHJlbW92ZSBpdC5cXG5cIiArXG4gICAgICAgIFwiVGhlIHZpZXcgc2hvdWxkIG5vdCBoYXZlIGFueSBzaWRlIGVmZmVjdHMuXFxuXCIsXG4gICAgZGlmZjogbnVsbCxcbiAgICBzdHJpbmdEaWZmOiBudWxsXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1haW5cblxuZnVuY3Rpb24gbWFpbihpbml0aWFsU3RhdGUsIHZpZXcsIG9wdHMpIHtcbiAgICBvcHRzID0gb3B0cyB8fCB7fVxuXG4gICAgdmFyIGN1cnJlbnRTdGF0ZSA9IGluaXRpYWxTdGF0ZVxuICAgIHZhciBjcmVhdGUgPSBvcHRzLmNyZWF0ZVxuICAgIHZhciBkaWZmID0gb3B0cy5kaWZmXG4gICAgdmFyIHBhdGNoID0gb3B0cy5wYXRjaFxuICAgIHZhciByZWRyYXdTY2hlZHVsZWQgPSBmYWxzZVxuXG4gICAgdmFyIHRyZWUgPSBvcHRzLmluaXRpYWxUcmVlIHx8IHZpZXcoY3VycmVudFN0YXRlKVxuICAgIHZhciB0YXJnZXQgPSBvcHRzLnRhcmdldCB8fCBjcmVhdGUodHJlZSwgb3B0cylcbiAgICB2YXIgaW5SZW5kZXJpbmdUcmFuc2FjdGlvbiA9IGZhbHNlXG5cbiAgICBjdXJyZW50U3RhdGUgPSBudWxsXG5cbiAgICB2YXIgbG9vcCA9IHtcbiAgICAgICAgc3RhdGU6IGluaXRpYWxTdGF0ZSxcbiAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIHVwZGF0ZTogdXBkYXRlXG4gICAgfVxuICAgIHJldHVybiBsb29wXG5cbiAgICBmdW5jdGlvbiB1cGRhdGUoc3RhdGUpIHtcbiAgICAgICAgaWYgKGluUmVuZGVyaW5nVHJhbnNhY3Rpb24pIHtcbiAgICAgICAgICAgIHRocm93IEludmFsaWRVcGRhdGVJblJlbmRlcih7XG4gICAgICAgICAgICAgICAgZGlmZjogc3RhdGUuX2RpZmYsXG4gICAgICAgICAgICAgICAgc3RyaW5nRGlmZjogSlNPTi5zdHJpbmdpZnkoc3RhdGUuX2RpZmYpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGN1cnJlbnRTdGF0ZSA9PT0gbnVsbCAmJiAhcmVkcmF3U2NoZWR1bGVkKSB7XG4gICAgICAgICAgICByZWRyYXdTY2hlZHVsZWQgPSB0cnVlXG4gICAgICAgICAgICByYWYocmVkcmF3KVxuICAgICAgICB9XG5cbiAgICAgICAgY3VycmVudFN0YXRlID0gc3RhdGVcbiAgICAgICAgbG9vcC5zdGF0ZSA9IHN0YXRlXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVkcmF3KCkge1xuICAgICAgICByZWRyYXdTY2hlZHVsZWQgPSBmYWxzZVxuICAgICAgICBpZiAoY3VycmVudFN0YXRlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGluUmVuZGVyaW5nVHJhbnNhY3Rpb24gPSB0cnVlXG4gICAgICAgIHZhciBuZXdUcmVlID0gdmlldyhjdXJyZW50U3RhdGUpXG5cbiAgICAgICAgaWYgKG9wdHMuY3JlYXRlT25seSkge1xuICAgICAgICAgICAgaW5SZW5kZXJpbmdUcmFuc2FjdGlvbiA9IGZhbHNlXG4gICAgICAgICAgICBjcmVhdGUobmV3VHJlZSwgb3B0cylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBwYXRjaGVzID0gZGlmZih0cmVlLCBuZXdUcmVlLCBvcHRzKVxuICAgICAgICAgICAgaW5SZW5kZXJpbmdUcmFuc2FjdGlvbiA9IGZhbHNlXG4gICAgICAgICAgICB0YXJnZXQgPSBwYXRjaCh0YXJnZXQsIHBhdGNoZXMsIG9wdHMpXG4gICAgICAgIH1cblxuICAgICAgICB0cmVlID0gbmV3VHJlZVxuICAgICAgICBjdXJyZW50U3RhdGUgPSBudWxsXG4gICAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ3N0cmluZycpIHJldHVybiBjYW1lbENhc2Uob2JqKTtcbiAgICByZXR1cm4gd2FsayhvYmopO1xufTtcblxuZnVuY3Rpb24gd2FsayAob2JqKSB7XG4gICAgaWYgKCFvYmogfHwgdHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHJldHVybiBvYmo7XG4gICAgaWYgKGlzRGF0ZShvYmopIHx8IGlzUmVnZXgob2JqKSkgcmV0dXJuIG9iajtcbiAgICBpZiAoaXNBcnJheShvYmopKSByZXR1cm4gbWFwKG9iaiwgd2Fsayk7XG4gICAgcmV0dXJuIHJlZHVjZShvYmplY3RLZXlzKG9iaiksIGZ1bmN0aW9uIChhY2MsIGtleSkge1xuICAgICAgICB2YXIgY2FtZWwgPSBjYW1lbENhc2Uoa2V5KTtcbiAgICAgICAgYWNjW2NhbWVsXSA9IHdhbGsob2JqW2tleV0pO1xuICAgICAgICByZXR1cm4gYWNjO1xuICAgIH0sIHt9KTtcbn1cblxuZnVuY3Rpb24gY2FtZWxDYXNlKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvW18uLV0oXFx3fCQpL2csIGZ1bmN0aW9uIChfLHgpIHtcbiAgICAgICAgcmV0dXJuIHgudG9VcHBlckNhc2UoKTtcbiAgICB9KTtcbn1cblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG52YXIgaXNEYXRlID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufTtcblxudmFyIGlzUmVnZXggPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBSZWdFeHBdJztcbn07XG5cbnZhciBoYXMgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIG9iamVjdEtleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChoYXMuY2FsbChvYmosIGtleSkpIGtleXMucHVzaChrZXkpO1xuICAgIH1cbiAgICByZXR1cm4ga2V5cztcbn07XG5cbmZ1bmN0aW9uIG1hcCAoeHMsIGYpIHtcbiAgICBpZiAoeHMubWFwKSByZXR1cm4geHMubWFwKGYpO1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJlcy5wdXNoKGYoeHNbaV0sIGkpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn1cblxuZnVuY3Rpb24gcmVkdWNlICh4cywgZiwgYWNjKSB7XG4gICAgaWYgKHhzLnJlZHVjZSkgcmV0dXJuIHhzLnJlZHVjZShmLCBhY2MpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYWNjID0gZihhY2MsIHhzW2ldLCBpKTtcbiAgICB9XG4gICAgcmV0dXJuIGFjYztcbn1cbiIsInZhciBuYXJncyA9IC9cXHsoWzAtOWEtekEtWl0rKVxcfS9nXG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2VcblxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZVxuXG5mdW5jdGlvbiB0ZW1wbGF0ZShzdHJpbmcpIHtcbiAgICB2YXIgYXJnc1xuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIgJiYgdHlwZW9mIGFyZ3VtZW50c1sxXSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICBhcmdzID0gYXJndW1lbnRzWzFdXG4gICAgfSBlbHNlIHtcbiAgICAgICAgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgIH1cblxuICAgIGlmICghYXJncyB8fCAhYXJncy5oYXNPd25Qcm9wZXJ0eSkge1xuICAgICAgICBhcmdzID0ge31cbiAgICB9XG5cbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UobmFyZ3MsIGZ1bmN0aW9uIHJlcGxhY2VBcmcobWF0Y2gsIGksIGluZGV4KSB7XG4gICAgICAgIHZhciByZXN1bHRcblxuICAgICAgICBpZiAoc3RyaW5nW2luZGV4IC0gMV0gPT09IFwie1wiICYmXG4gICAgICAgICAgICBzdHJpbmdbaW5kZXggKyBtYXRjaC5sZW5ndGhdID09PSBcIn1cIikge1xuICAgICAgICAgICAgcmV0dXJuIGlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IGFyZ3MuaGFzT3duUHJvcGVydHkoaSkgPyBhcmdzW2ldIDogbnVsbFxuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gbnVsbCB8fCByZXN1bHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIlwiXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgfVxuICAgIH0pXG59XG4iLCJ2YXIgY2FtZWxpemUgPSByZXF1aXJlKFwiY2FtZWxpemVcIilcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoXCJzdHJpbmctdGVtcGxhdGVcIilcbnZhciBleHRlbmQgPSByZXF1aXJlKFwieHRlbmQvbXV0YWJsZVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFR5cGVkRXJyb3JcblxuZnVuY3Rpb24gVHlwZWRFcnJvcihhcmdzKSB7XG4gICAgaWYgKCFhcmdzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImFyZ3MgaXMgcmVxdWlyZWRcIik7XG4gICAgfVxuICAgIGlmICghYXJncy50eXBlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImFyZ3MudHlwZSBpcyByZXF1aXJlZFwiKTtcbiAgICB9XG4gICAgaWYgKCFhcmdzLm1lc3NhZ2UpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYXJncy5tZXNzYWdlIGlzIHJlcXVpcmVkXCIpO1xuICAgIH1cblxuICAgIHZhciBtZXNzYWdlID0gYXJncy5tZXNzYWdlXG5cbiAgICBpZiAoYXJncy50eXBlICYmICFhcmdzLm5hbWUpIHtcbiAgICAgICAgdmFyIGVycm9yTmFtZSA9IGNhbWVsaXplKGFyZ3MudHlwZSkgKyBcIkVycm9yXCJcbiAgICAgICAgYXJncy5uYW1lID0gZXJyb3JOYW1lWzBdLnRvVXBwZXJDYXNlKCkgKyBlcnJvck5hbWUuc3Vic3RyKDEpXG4gICAgfVxuXG4gICAgZXh0ZW5kKGNyZWF0ZUVycm9yLCBhcmdzKTtcbiAgICBjcmVhdGVFcnJvci5fbmFtZSA9IGFyZ3MubmFtZTtcblxuICAgIHJldHVybiBjcmVhdGVFcnJvcjtcblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG9wdHMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBFcnJvcigpXG5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHJlc3VsdCwgXCJ0eXBlXCIsIHtcbiAgICAgICAgICAgIHZhbHVlOiByZXN1bHQudHlwZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KVxuXG4gICAgICAgIHZhciBvcHRpb25zID0gZXh0ZW5kKHt9LCBhcmdzLCBvcHRzKVxuXG4gICAgICAgIGV4dGVuZChyZXN1bHQsIG9wdGlvbnMpXG4gICAgICAgIHJlc3VsdC5tZXNzYWdlID0gdGVtcGxhdGUobWVzc2FnZSwgb3B0aW9ucylcblxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgfVxufVxuXG4iLCJ2YXIgbm93ID0gcmVxdWlyZSgncGVyZm9ybWFuY2Utbm93JylcbiAgLCBnbG9iYWwgPSB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyA/IHt9IDogd2luZG93XG4gICwgdmVuZG9ycyA9IFsnbW96JywgJ3dlYmtpdCddXG4gICwgc3VmZml4ID0gJ0FuaW1hdGlvbkZyYW1lJ1xuICAsIHJhZiA9IGdsb2JhbFsncmVxdWVzdCcgKyBzdWZmaXhdXG4gICwgY2FmID0gZ2xvYmFsWydjYW5jZWwnICsgc3VmZml4XSB8fCBnbG9iYWxbJ2NhbmNlbFJlcXVlc3QnICsgc3VmZml4XVxuICAsIGlzTmF0aXZlID0gdHJ1ZVxuXG5mb3IodmFyIGkgPSAwOyBpIDwgdmVuZG9ycy5sZW5ndGggJiYgIXJhZjsgaSsrKSB7XG4gIHJhZiA9IGdsb2JhbFt2ZW5kb3JzW2ldICsgJ1JlcXVlc3QnICsgc3VmZml4XVxuICBjYWYgPSBnbG9iYWxbdmVuZG9yc1tpXSArICdDYW5jZWwnICsgc3VmZml4XVxuICAgICAgfHwgZ2xvYmFsW3ZlbmRvcnNbaV0gKyAnQ2FuY2VsUmVxdWVzdCcgKyBzdWZmaXhdXG59XG5cbi8vIFNvbWUgdmVyc2lvbnMgb2YgRkYgaGF2ZSByQUYgYnV0IG5vdCBjQUZcbmlmKCFyYWYgfHwgIWNhZikge1xuICBpc05hdGl2ZSA9IGZhbHNlXG5cbiAgdmFyIGxhc3QgPSAwXG4gICAgLCBpZCA9IDBcbiAgICAsIHF1ZXVlID0gW11cbiAgICAsIGZyYW1lRHVyYXRpb24gPSAxMDAwIC8gNjBcblxuICByYWYgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIGlmKHF1ZXVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdmFyIF9ub3cgPSBub3coKVxuICAgICAgICAsIG5leHQgPSBNYXRoLm1heCgwLCBmcmFtZUR1cmF0aW9uIC0gKF9ub3cgLSBsYXN0KSlcbiAgICAgIGxhc3QgPSBuZXh0ICsgX25vd1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNwID0gcXVldWUuc2xpY2UoMClcbiAgICAgICAgLy8gQ2xlYXIgcXVldWUgaGVyZSB0byBwcmV2ZW50XG4gICAgICAgIC8vIGNhbGxiYWNrcyBmcm9tIGFwcGVuZGluZyBsaXN0ZW5lcnNcbiAgICAgICAgLy8gdG8gdGhlIGN1cnJlbnQgZnJhbWUncyBxdWV1ZVxuICAgICAgICBxdWV1ZS5sZW5ndGggPSAwXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBjcC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmKCFjcFtpXS5jYW5jZWxsZWQpIHtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgY3BbaV0uY2FsbGJhY2sobGFzdClcbiAgICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyB0aHJvdyBlIH0sIDApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCBNYXRoLnJvdW5kKG5leHQpKVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKHtcbiAgICAgIGhhbmRsZTogKytpZCxcbiAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayxcbiAgICAgIGNhbmNlbGxlZDogZmFsc2VcbiAgICB9KVxuICAgIHJldHVybiBpZFxuICB9XG5cbiAgY2FmID0gZnVuY3Rpb24oaGFuZGxlKSB7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZihxdWV1ZVtpXS5oYW5kbGUgPT09IGhhbmRsZSkge1xuICAgICAgICBxdWV1ZVtpXS5jYW5jZWxsZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4pIHtcbiAgLy8gV3JhcCBpbiBhIG5ldyBmdW5jdGlvbiB0byBwcmV2ZW50XG4gIC8vIGBjYW5jZWxgIHBvdGVudGlhbGx5IGJlaW5nIGFzc2lnbmVkXG4gIC8vIHRvIHRoZSBuYXRpdmUgckFGIGZ1bmN0aW9uXG4gIGlmKCFpc05hdGl2ZSkge1xuICAgIHJldHVybiByYWYuY2FsbChnbG9iYWwsIGZuKVxuICB9XG4gIHJldHVybiByYWYuY2FsbChnbG9iYWwsIGZ1bmN0aW9uKCkge1xuICAgIHRyeXtcbiAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHRocm93IGUgfSwgMClcbiAgICB9XG4gIH0pXG59XG5tb2R1bGUuZXhwb3J0cy5jYW5jZWwgPSBmdW5jdGlvbigpIHtcbiAgY2FmLmFwcGx5KGdsb2JhbCwgYXJndW1lbnRzKVxufVxuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjYuM1xuKGZ1bmN0aW9uKCkge1xuICB2YXIgZ2V0TmFub1NlY29uZHMsIGhydGltZSwgbG9hZFRpbWU7XG5cbiAgaWYgKCh0eXBlb2YgcGVyZm9ybWFuY2UgIT09IFwidW5kZWZpbmVkXCIgJiYgcGVyZm9ybWFuY2UgIT09IG51bGwpICYmIHBlcmZvcm1hbmNlLm5vdykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgfTtcbiAgfSBlbHNlIGlmICgodHlwZW9mIHByb2Nlc3MgIT09IFwidW5kZWZpbmVkXCIgJiYgcHJvY2VzcyAhPT0gbnVsbCkgJiYgcHJvY2Vzcy5ocnRpbWUpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChnZXROYW5vU2Vjb25kcygpIC0gbG9hZFRpbWUpIC8gMWU2O1xuICAgIH07XG4gICAgaHJ0aW1lID0gcHJvY2Vzcy5ocnRpbWU7XG4gICAgZ2V0TmFub1NlY29uZHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBocjtcbiAgICAgIGhyID0gaHJ0aW1lKCk7XG4gICAgICByZXR1cm4gaHJbMF0gKiAxZTkgKyBoclsxXTtcbiAgICB9O1xuICAgIGxvYWRUaW1lID0gZ2V0TmFub1NlY29uZHMoKTtcbiAgfSBlbHNlIGlmIChEYXRlLm5vdykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gRGF0ZS5ub3coKSAtIGxvYWRUaW1lO1xuICAgIH07XG4gICAgbG9hZFRpbWUgPSBEYXRlLm5vdygpO1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBsb2FkVGltZTtcbiAgICB9O1xuICAgIGxvYWRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIH1cblxufSkuY2FsbCh0aGlzKTtcblxuLypcbi8vQCBzb3VyY2VNYXBwaW5nVVJMPXBlcmZvcm1hbmNlLW5vdy5tYXBcbiovXG4iLCJ2YXIgc2V0Tm9uRW51bWVyYWJsZSA9IHJlcXVpcmUoXCIuL2xpYi9zZXQtbm9uLWVudW1lcmFibGUuanNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gYWRkTGlzdGVuZXJcblxuZnVuY3Rpb24gYWRkTGlzdGVuZXIob2JzZXJ2QXJyYXksIG9ic2Vydikge1xuICAgIHZhciBsaXN0ID0gb2JzZXJ2QXJyYXkuX2xpc3RcblxuICAgIHJldHVybiBvYnNlcnYoZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciB2YWx1ZUxpc3QgPSAgb2JzZXJ2QXJyYXkoKS5zbGljZSgpXG4gICAgICAgIHZhciBpbmRleCA9IGxpc3QuaW5kZXhPZihvYnNlcnYpXG5cbiAgICAgICAgLy8gVGhpcyBjb2RlIHBhdGggc2hvdWxkIG5ldmVyIGhpdC4gSWYgdGhpcyBoYXBwZW5zXG4gICAgICAgIC8vIHRoZXJlJ3MgYSBidWcgaW4gdGhlIGNsZWFudXAgY29kZVxuICAgICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IFwib2JzZXJ2LWFycmF5OiBVbnJlbW92ZWQgb2JzZXJ2IGxpc3RlbmVyXCJcbiAgICAgICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IobWVzc2FnZSlcbiAgICAgICAgICAgIGVyci5saXN0ID0gbGlzdFxuICAgICAgICAgICAgZXJyLmluZGV4ID0gaW5kZXhcbiAgICAgICAgICAgIGVyci5vYnNlcnYgPSBvYnNlcnZcbiAgICAgICAgICAgIHRocm93IGVyclxuICAgICAgICB9XG5cbiAgICAgICAgdmFsdWVMaXN0LnNwbGljZShpbmRleCwgMSwgdmFsdWUpXG4gICAgICAgIHNldE5vbkVudW1lcmFibGUodmFsdWVMaXN0LCBcIl9kaWZmXCIsIFsgW2luZGV4LCAxLCB2YWx1ZV0gXSlcblxuICAgICAgICBvYnNlcnZBcnJheS5fb2JzZXJ2U2V0KHZhbHVlTGlzdClcbiAgICB9KVxufVxuIiwidmFyIGFkZExpc3RlbmVyID0gcmVxdWlyZSgnLi9hZGQtbGlzdGVuZXIuanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFwcGx5UGF0Y2hcblxuZnVuY3Rpb24gYXBwbHlQYXRjaCAodmFsdWVMaXN0LCBhcmdzKSB7XG4gICAgdmFyIG9icyA9IHRoaXNcbiAgICB2YXIgdmFsdWVBcmdzID0gYXJncy5tYXAodW5wYWNrKVxuXG4gICAgdmFsdWVMaXN0LnNwbGljZS5hcHBseSh2YWx1ZUxpc3QsIHZhbHVlQXJncylcbiAgICBvYnMuX2xpc3Quc3BsaWNlLmFwcGx5KG9icy5fbGlzdCwgYXJncylcblxuICAgIHZhciBleHRyYVJlbW92ZUxpc3RlbmVycyA9IGFyZ3Muc2xpY2UoMikubWFwKGZ1bmN0aW9uIChvYnNlcnYpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBvYnNlcnYgPT09IFwiZnVuY3Rpb25cIiA/XG4gICAgICAgICAgICBhZGRMaXN0ZW5lcihvYnMsIG9ic2VydikgOlxuICAgICAgICAgICAgbnVsbFxuICAgIH0pXG5cbiAgICBleHRyYVJlbW92ZUxpc3RlbmVycy51bnNoaWZ0KGFyZ3NbMF0sIGFyZ3NbMV0pXG4gICAgdmFyIHJlbW92ZWRMaXN0ZW5lcnMgPSBvYnMuX3JlbW92ZUxpc3RlbmVycy5zcGxpY2VcbiAgICAgICAgLmFwcGx5KG9icy5fcmVtb3ZlTGlzdGVuZXJzLCBleHRyYVJlbW92ZUxpc3RlbmVycylcblxuICAgIHJlbW92ZWRMaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAocmVtb3ZlT2JzZXJ2TGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKHJlbW92ZU9ic2Vydkxpc3RlbmVyKSB7XG4gICAgICAgICAgICByZW1vdmVPYnNlcnZMaXN0ZW5lcigpXG4gICAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHZhbHVlQXJnc1xufVxuXG5mdW5jdGlvbiB1bnBhY2sodmFsdWUsIGluZGV4KXtcbiAgICBpZiAoaW5kZXggPT09IDAgfHwgaW5kZXggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgfVxuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IHZhbHVlKCkgOiB2YWx1ZVxufVxuIiwidmFyIE9ic2VydkFycmF5ID0gcmVxdWlyZShcIi4vaW5kZXguanNcIilcblxudmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlXG5cbnZhciBBUlJBWV9NRVRIT0RTID0gW1xuICAgIFwiY29uY2F0XCIsIFwic2xpY2VcIiwgXCJldmVyeVwiLCBcImZpbHRlclwiLCBcImZvckVhY2hcIiwgXCJpbmRleE9mXCIsXG4gICAgXCJqb2luXCIsIFwibGFzdEluZGV4T2ZcIiwgXCJtYXBcIiwgXCJyZWR1Y2VcIiwgXCJyZWR1Y2VSaWdodFwiLFxuICAgIFwic29tZVwiLCBcInRvU3RyaW5nXCIsIFwidG9Mb2NhbGVTdHJpbmdcIlxuXVxuXG52YXIgbWV0aG9kcyA9IEFSUkFZX01FVEhPRFMubWFwKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIFtuYW1lLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByZXMgPSB0aGlzLl9saXN0W25hbWVdLmFwcGx5KHRoaXMuX2xpc3QsIGFyZ3VtZW50cylcblxuICAgICAgICBpZiAocmVzICYmIEFycmF5LmlzQXJyYXkocmVzKSkge1xuICAgICAgICAgICAgcmVzID0gT2JzZXJ2QXJyYXkocmVzKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc1xuICAgIH1dXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFycmF5TWV0aG9kc1xuXG5mdW5jdGlvbiBBcnJheU1ldGhvZHMob2JzKSB7XG4gICAgb2JzLnB1c2ggPSBvYnNlcnZBcnJheVB1c2hcbiAgICBvYnMucG9wID0gb2JzZXJ2QXJyYXlQb3BcbiAgICBvYnMuc2hpZnQgPSBvYnNlcnZBcnJheVNoaWZ0XG4gICAgb2JzLnVuc2hpZnQgPSBvYnNlcnZBcnJheVVuc2hpZnRcbiAgICBvYnMucmV2ZXJzZSA9IHJlcXVpcmUoXCIuL2FycmF5LXJldmVyc2UuanNcIilcbiAgICBvYnMuc29ydCA9IHJlcXVpcmUoXCIuL2FycmF5LXNvcnQuanNcIilcblxuICAgIG1ldGhvZHMuZm9yRWFjaChmdW5jdGlvbiAodHVwbGUpIHtcbiAgICAgICAgb2JzW3R1cGxlWzBdXSA9IHR1cGxlWzFdXG4gICAgfSlcbiAgICByZXR1cm4gb2JzXG59XG5cblxuXG5mdW5jdGlvbiBvYnNlcnZBcnJheVB1c2goKSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICBhcmdzLnVuc2hpZnQodGhpcy5fbGlzdC5sZW5ndGgsIDApXG4gICAgdGhpcy5zcGxpY2UuYXBwbHkodGhpcywgYXJncylcblxuICAgIHJldHVybiB0aGlzLl9saXN0Lmxlbmd0aFxufVxuZnVuY3Rpb24gb2JzZXJ2QXJyYXlQb3AoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3BsaWNlKHRoaXMuX2xpc3QubGVuZ3RoIC0gMSwgMSlbMF1cbn1cbmZ1bmN0aW9uIG9ic2VydkFycmF5U2hpZnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3BsaWNlKDAsIDEpWzBdXG59XG5mdW5jdGlvbiBvYnNlcnZBcnJheVVuc2hpZnQoKSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICBhcmdzLnVuc2hpZnQoMCwgMClcbiAgICB0aGlzLnNwbGljZS5hcHBseSh0aGlzLCBhcmdzKVxuXG4gICAgcmV0dXJuIHRoaXMuX2xpc3QubGVuZ3RoXG59XG5cblxuZnVuY3Rpb24gbm90SW1wbGVtZW50ZWQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiUHVsbCByZXF1ZXN0IHdlbGNvbWVcIilcbn1cbiIsInZhciBhcHBseVBhdGNoID0gcmVxdWlyZShcIi4vYXBwbHktcGF0Y2guanNcIilcbnZhciBzZXROb25FbnVtZXJhYmxlID0gcmVxdWlyZSgnLi9saWIvc2V0LW5vbi1lbnVtZXJhYmxlLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSByZXZlcnNlXG5cbmZ1bmN0aW9uIHJldmVyc2UoKSB7XG4gICAgdmFyIG9icyA9IHRoaXNcbiAgICB2YXIgY2hhbmdlcyA9IGZha2VEaWZmKG9icy5fbGlzdC5zbGljZSgpLnJldmVyc2UoKSlcbiAgICB2YXIgdmFsdWVMaXN0ID0gb2JzKCkuc2xpY2UoKS5yZXZlcnNlKClcblxuICAgIHZhciB2YWx1ZUNoYW5nZXMgPSBjaGFuZ2VzLm1hcChhcHBseVBhdGNoLmJpbmQob2JzLCB2YWx1ZUxpc3QpKVxuXG4gICAgc2V0Tm9uRW51bWVyYWJsZSh2YWx1ZUxpc3QsIFwiX2RpZmZcIiwgdmFsdWVDaGFuZ2VzKVxuXG4gICAgb2JzLl9vYnNlcnZTZXQodmFsdWVMaXN0KVxuICAgIHJldHVybiBjaGFuZ2VzXG59XG5cbmZ1bmN0aW9uIGZha2VEaWZmKGFycikge1xuICAgIHZhciBfZGlmZlxuICAgIHZhciBsZW4gPSBhcnIubGVuZ3RoXG5cbiAgICBpZihsZW4gJSAyKSB7XG4gICAgICAgIHZhciBtaWRQb2ludCA9IChsZW4gLTEpIC8gMlxuICAgICAgICB2YXIgYSA9IFswLCBtaWRQb2ludF0uY29uY2F0KGFyci5zbGljZSgwLCBtaWRQb2ludCkpXG4gICAgICAgIHZhciBiID0gW21pZFBvaW50ICsxLCBtaWRQb2ludF0uY29uY2F0KGFyci5zbGljZShtaWRQb2ludCArMSwgbGVuKSlcbiAgICAgICAgdmFyIF9kaWZmID0gW2EsIGJdXG4gICAgfSBlbHNlIHtcbiAgICAgICAgX2RpZmYgPSBbIFswLCBsZW5dLmNvbmNhdChhcnIpIF1cbiAgICB9XG5cbiAgICByZXR1cm4gX2RpZmZcbn1cbiIsInZhciBhcHBseVBhdGNoID0gcmVxdWlyZShcIi4vYXBwbHktcGF0Y2guanNcIilcbnZhciBzZXROb25FbnVtZXJhYmxlID0gcmVxdWlyZShcIi4vbGliL3NldC1ub24tZW51bWVyYWJsZS5qc1wiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNvcnRcblxuZnVuY3Rpb24gc29ydChjb21wYXJlKSB7XG4gICAgdmFyIG9icyA9IHRoaXNcbiAgICB2YXIgbGlzdCA9IG9icy5fbGlzdC5zbGljZSgpXG5cbiAgICB2YXIgdW5wYWNrZWQgPSB1bnBhY2sobGlzdClcblxuICAgIHZhciBzb3J0ZWQgPSB1bnBhY2tlZFxuICAgICAgICAgICAgLm1hcChmdW5jdGlvbihpdCkgeyByZXR1cm4gaXQudmFsIH0pXG4gICAgICAgICAgICAuc29ydChjb21wYXJlKVxuXG4gICAgdmFyIHBhY2tlZCA9IHJlcGFjayhzb3J0ZWQsIHVucGFja2VkKVxuXG4gICAgLy9mYWtlIGRpZmYgLSBmb3IgcGVyZlxuICAgIC8vYWRpZmYgb24gMTBrIGl0ZW1zID09PSB+MzIwMG1zXG4gICAgLy9mYWtlIG9uIDEwayBpdGVtcyA9PT0gfjExMG1zXG4gICAgdmFyIGNoYW5nZXMgPSBbIFsgMCwgcGFja2VkLmxlbmd0aCBdLmNvbmNhdChwYWNrZWQpIF1cblxuICAgIHZhciB2YWx1ZUNoYW5nZXMgPSBjaGFuZ2VzLm1hcChhcHBseVBhdGNoLmJpbmQob2JzLCBzb3J0ZWQpKVxuXG4gICAgc2V0Tm9uRW51bWVyYWJsZShzb3J0ZWQsIFwiX2RpZmZcIiwgdmFsdWVDaGFuZ2VzKVxuXG4gICAgb2JzLl9vYnNlcnZTZXQoc29ydGVkKVxuICAgIHJldHVybiBjaGFuZ2VzXG59XG5cbmZ1bmN0aW9uIHVucGFjayhsaXN0KSB7XG4gICAgdmFyIHVucGFja2VkID0gW11cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICB1bnBhY2tlZC5wdXNoKHtcbiAgICAgICAgICAgIHZhbDogKFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgbGlzdFtpXSkgPyBsaXN0W2ldKCkgOiBsaXN0W2ldLFxuICAgICAgICAgICAgb2JqOiBsaXN0W2ldXG4gICAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiB1bnBhY2tlZFxufVxuXG5mdW5jdGlvbiByZXBhY2soc29ydGVkLCB1bnBhY2tlZCkge1xuICAgIHZhciBwYWNrZWQgPSBbXVxuXG4gICAgd2hpbGUoc29ydGVkLmxlbmd0aCkge1xuICAgICAgICB2YXIgcyA9IHNvcnRlZC5zaGlmdCgpXG4gICAgICAgIHZhciBpbmR4ID0gaW5kZXhPZihzLCB1bnBhY2tlZClcbiAgICAgICAgaWYofmluZHgpIHBhY2tlZC5wdXNoKHVucGFja2VkLnNwbGljZShpbmR4LCAxKVswXS5vYmopXG4gICAgfVxuXG4gICAgcmV0dXJuIHBhY2tlZFxufVxuXG5mdW5jdGlvbiBpbmRleE9mKG4sIGgpIHtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgaC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZihuID09PSBoW2ldLnZhbCkgcmV0dXJuIGlcbiAgICB9XG4gICAgcmV0dXJuIC0xXG59XG4iLCJ2YXIgT2JzZXJ2ID0gcmVxdWlyZShcIm9ic2VydlwiKVxuXG4vLyBjaXJjdWxhciBkZXAgYmV0d2VlbiBBcnJheU1ldGhvZHMgJiB0aGlzIGZpbGVcbm1vZHVsZS5leHBvcnRzID0gT2JzZXJ2QXJyYXlcblxudmFyIHNwbGljZSA9IHJlcXVpcmUoXCIuL3NwbGljZS5qc1wiKVxudmFyIHB1dCA9IHJlcXVpcmUoXCIuL3B1dC5qc1wiKVxudmFyIHNldCA9IHJlcXVpcmUoXCIuL3NldC5qc1wiKVxudmFyIHRyYW5zYWN0aW9uID0gcmVxdWlyZShcIi4vdHJhbnNhY3Rpb24uanNcIilcbnZhciBBcnJheU1ldGhvZHMgPSByZXF1aXJlKFwiLi9hcnJheS1tZXRob2RzLmpzXCIpXG52YXIgYWRkTGlzdGVuZXIgPSByZXF1aXJlKFwiLi9hZGQtbGlzdGVuZXIuanNcIilcblxuXG4vKiAgT2JzZXJ2QXJyYXkgOj0gKEFycmF5PFQ+KSA9PiBPYnNlcnY8XG4gICAgICAgIEFycmF5PFQ+ICYgeyBfZGlmZjogQXJyYXkgfVxuICAgID4gJiB7XG4gICAgICAgIHNwbGljZTogKGluZGV4OiBOdW1iZXIsIGFtb3VudDogTnVtYmVyLCByZXN0Li4uOiBUKSA9PlxuICAgICAgICAgICAgQXJyYXk8VD4sXG4gICAgICAgIHB1c2g6ICh2YWx1ZXMuLi46IFQpID0+IE51bWJlcixcbiAgICAgICAgZmlsdGVyOiAobGFtYmRhOiBGdW5jdGlvbiwgdGhpc1ZhbHVlOiBBbnkpID0+IEFycmF5PFQ+LFxuICAgICAgICBpbmRleE9mOiAoaXRlbTogVCwgZnJvbUluZGV4OiBOdW1iZXIpID0+IE51bWJlclxuICAgIH1cblxuICAgIEZpeCB0byBtYWtlIGl0IG1vcmUgbGlrZSBPYnNlcnZIYXNoLlxuXG4gICAgSS5lLiB5b3Ugd3JpdGUgb2JzZXJ2YWJsZXMgaW50byBpdC5cbiAgICAgICAgcmVhZGluZyBtZXRob2RzIHRha2UgcGxhaW4gSlMgb2JqZWN0cyB0byByZWFkXG4gICAgICAgIGFuZCB0aGUgdmFsdWUgb2YgdGhlIGFycmF5IGlzIGFsd2F5cyBhbiBhcnJheSBvZiBwbGFpblxuICAgICAgICBvYmpzZWN0LlxuXG4gICAgICAgIFRoZSBvYnNlcnYgYXJyYXkgaW5zdGFuY2UgaXRzZWxmIHdvdWxkIGhhdmUgaW5kZXhlZFxuICAgICAgICBwcm9wZXJ0aWVzIHRoYXQgYXJlIHRoZSBvYnNlcnZhYmxlc1xuKi9cbmZ1bmN0aW9uIE9ic2VydkFycmF5KGluaXRpYWxMaXN0KSB7XG4gICAgLy8gbGlzdCBpcyB0aGUgaW50ZXJuYWwgbXV0YWJsZSBsaXN0IG9ic2VydiBpbnN0YW5jZXMgdGhhdFxuICAgIC8vIGFsbCBtZXRob2RzIG9uIGBvYnNgIGRpc3BhdGNoIHRvLlxuICAgIHZhciBsaXN0ID0gaW5pdGlhbExpc3RcbiAgICB2YXIgaW5pdGlhbFN0YXRlID0gW11cblxuICAgIC8vIGNvcHkgc3RhdGUgb3V0IG9mIGluaXRpYWxMaXN0IGludG8gaW5pdGlhbFN0YXRlXG4gICAgbGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChvYnNlcnYsIGluZGV4KSB7XG4gICAgICAgIGluaXRpYWxTdGF0ZVtpbmRleF0gPSB0eXBlb2Ygb2JzZXJ2ID09PSBcImZ1bmN0aW9uXCIgP1xuICAgICAgICAgICAgb2JzZXJ2KCkgOiBvYnNlcnZcbiAgICB9KVxuXG4gICAgdmFyIG9icyA9IE9ic2Vydihpbml0aWFsU3RhdGUpXG4gICAgb2JzLnNwbGljZSA9IHNwbGljZVxuXG4gICAgLy8gb3ZlcnJpZGUgc2V0IGFuZCBzdG9yZSBvcmlnaW5hbCBmb3IgbGF0ZXIgdXNlXG4gICAgb2JzLl9vYnNlcnZTZXQgPSBvYnMuc2V0XG4gICAgb2JzLnNldCA9IHNldFxuXG4gICAgb2JzLmdldCA9IGdldFxuICAgIG9icy5nZXRMZW5ndGggPSBnZXRMZW5ndGhcbiAgICBvYnMucHV0ID0gcHV0XG4gICAgb2JzLnRyYW5zYWN0aW9uID0gdHJhbnNhY3Rpb25cblxuICAgIC8vIHlvdSBiZXR0ZXIgbm90IG11dGF0ZSB0aGlzIGxpc3QgZGlyZWN0bHlcbiAgICAvLyB0aGlzIGlzIHRoZSBsaXN0IG9mIG9ic2VydnMgaW5zdGFuY2VzXG4gICAgb2JzLl9saXN0ID0gbGlzdFxuXG4gICAgdmFyIHJlbW92ZUxpc3RlbmVycyA9IGxpc3QubWFwKGZ1bmN0aW9uIChvYnNlcnYpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBvYnNlcnYgPT09IFwiZnVuY3Rpb25cIiA/XG4gICAgICAgICAgICBhZGRMaXN0ZW5lcihvYnMsIG9ic2VydikgOlxuICAgICAgICAgICAgbnVsbFxuICAgIH0pO1xuICAgIC8vIHRoaXMgaXMgYSBsaXN0IG9mIHJlbW92YWwgZnVuY3Rpb25zIHRoYXQgbXVzdCBiZSBjYWxsZWRcbiAgICAvLyB3aGVuIG9ic2VydiBpbnN0YW5jZXMgYXJlIHJlbW92ZWQgZnJvbSBgb2JzLmxpc3RgXG4gICAgLy8gbm90IGNhbGxpbmcgdGhpcyBtZWFucyB3ZSBkbyBub3QgR0Mgb3VyIG9ic2VydiBjaGFuZ2VcbiAgICAvLyBsaXN0ZW5lcnMuIFdoaWNoIGNhdXNlcyByYWdlIGJ1Z3NcbiAgICBvYnMuX3JlbW92ZUxpc3RlbmVycyA9IHJlbW92ZUxpc3RlbmVyc1xuXG4gICAgb2JzLl90eXBlID0gXCJvYnNlcnYtYXJyYXlcIlxuICAgIG9icy5fdmVyc2lvbiA9IFwiM1wiXG5cbiAgICByZXR1cm4gQXJyYXlNZXRob2RzKG9icywgbGlzdClcbn1cblxuZnVuY3Rpb24gZ2V0KGluZGV4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2xpc3RbaW5kZXhdXG59XG5cbmZ1bmN0aW9uIGdldExlbmd0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbGlzdC5sZW5ndGhcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gc2V0Tm9uRW51bWVyYWJsZTtcblxuZnVuY3Rpb24gc2V0Tm9uRW51bWVyYWJsZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqZWN0LCBrZXksIHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0pO1xufVxuIiwiZnVuY3Rpb24gaGVhZCAoYSkge1xuICByZXR1cm4gYVswXVxufVxuXG5mdW5jdGlvbiBsYXN0IChhKSB7XG4gIHJldHVybiBhW2EubGVuZ3RoIC0gMV1cbn1cblxuZnVuY3Rpb24gdGFpbChhKSB7XG4gIHJldHVybiBhLnNsaWNlKDEpXG59XG5cbmZ1bmN0aW9uIHJldHJlYXQgKGUpIHtcbiAgcmV0dXJuIGUucG9wKClcbn1cblxuZnVuY3Rpb24gaGFzTGVuZ3RoIChlKSB7XG4gIHJldHVybiBlLmxlbmd0aFxufVxuXG5mdW5jdGlvbiBhbnkoYXJ5LCB0ZXN0KSB7XG4gIGZvcih2YXIgaT0wO2k8YXJ5Lmxlbmd0aDtpKyspXG4gICAgaWYodGVzdChhcnlbaV0pKVxuICAgICAgcmV0dXJuIHRydWVcbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIHNjb3JlIChhKSB7XG4gIHJldHVybiBhLnJlZHVjZShmdW5jdGlvbiAocywgYSkge1xuICAgICAgcmV0dXJuIHMgKyBhLmxlbmd0aCArIGFbMV0gKyAxXG4gIH0sIDApXG59XG5cbmZ1bmN0aW9uIGJlc3QgKGEsIGIpIHtcbiAgcmV0dXJuIHNjb3JlKGEpIDw9IHNjb3JlKGIpID8gYSA6IGJcbn1cblxuXG52YXIgX3J1bGVzIC8vIHNldCBhdCB0aGUgYm90dG9tICBcblxuLy8gbm90ZSwgbmFpdmUgaW1wbGVtZW50YXRpb24uIHdpbGwgYnJlYWsgb24gY2lyY3VsYXIgb2JqZWN0cy5cblxuZnVuY3Rpb24gX2VxdWFsKGEsIGIpIHtcbiAgaWYoYSAmJiAhYikgcmV0dXJuIGZhbHNlXG4gIGlmKEFycmF5LmlzQXJyYXkoYSkpXG4gICAgaWYoYS5sZW5ndGggIT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZVxuICBpZihhICYmICdvYmplY3QnID09IHR5cGVvZiBhKSB7XG4gICAgZm9yKHZhciBpIGluIGEpXG4gICAgICBpZighX2VxdWFsKGFbaV0sIGJbaV0pKSByZXR1cm4gZmFsc2VcbiAgICBmb3IodmFyIGkgaW4gYilcbiAgICAgIGlmKCFfZXF1YWwoYVtpXSwgYltpXSkpIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgcmV0dXJuIGEgPT0gYlxufVxuXG5mdW5jdGlvbiBnZXRBcmdzKGFyZ3MpIHtcbiAgcmV0dXJuIGFyZ3MubGVuZ3RoID09IDEgPyBhcmdzWzBdIDogW10uc2xpY2UuY2FsbChhcmdzKVxufVxuXG4vLyByZXR1cm4gdGhlIGluZGV4IG9mIHRoZSBlbGVtZW50IG5vdCBsaWtlIHRoZSBvdGhlcnMsIG9yIC0xXG5mdW5jdGlvbiBvZGRFbGVtZW50KGFyeSwgY21wKSB7XG4gIHZhciBjXG4gIGZ1bmN0aW9uIGd1ZXNzKGEpIHtcbiAgICB2YXIgb2RkID0gLTFcbiAgICBjID0gMFxuICAgIGZvciAodmFyIGkgPSBhOyBpIDwgYXJ5Lmxlbmd0aDsgaSArKykge1xuICAgICAgaWYoIWNtcChhcnlbYV0sIGFyeVtpXSkpIHtcbiAgICAgICAgb2RkID0gaSwgYysrXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjID4gMSA/IC0xIDogb2RkXG4gIH1cbiAgLy9hc3N1bWUgdGhhdCBpdCBpcyB0aGUgZmlyc3QgZWxlbWVudC5cbiAgdmFyIGcgPSBndWVzcygwKVxuICBpZigtMSAhPSBnKSByZXR1cm4gZ1xuICAvLzAgd2FzIHRoZSBvZGQgb25lLCB0aGVuIGFsbCB0aGUgb3RoZXIgZWxlbWVudHMgYXJlIGVxdWFsXG4gIC8vZWxzZSB0aGVyZSBtb3JlIHRoYW4gb25lIGRpZmZlcmVudCBlbGVtZW50XG4gIGd1ZXNzKDEpXG4gIHJldHVybiBjID09IDAgPyAwIDogLTFcbn1cbnZhciBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZGVwcywgZXhwb3J0cykge1xuICB2YXIgZXF1YWwgPSAoZGVwcyAmJiBkZXBzLmVxdWFsKSB8fCBfZXF1YWxcbiAgZXhwb3J0cyA9IGV4cG9ydHMgfHwge30gXG4gIGV4cG9ydHMubGNzID0gXG4gIGZ1bmN0aW9uIGxjcygpIHtcbiAgICB2YXIgY2FjaGUgPSB7fVxuICAgIHZhciBhcmdzID0gZ2V0QXJncyhhcmd1bWVudHMpXG4gICAgdmFyIGEgPSBhcmdzWzBdLCBiID0gYXJnc1sxXVxuXG4gICAgZnVuY3Rpb24ga2V5IChhLGIpe1xuICAgICAgcmV0dXJuIGEubGVuZ3RoICsgJzonICsgYi5sZW5ndGhcbiAgICB9XG5cbiAgICAvL2ZpbmQgbGVuZ3RoIHRoYXQgbWF0Y2hlcyBhdCB0aGUgaGVhZFxuXG4gICAgaWYoYXJncy5sZW5ndGggPiAyKSB7XG4gICAgICAvL2lmIGNhbGxlZCB3aXRoIG11bHRpcGxlIHNlcXVlbmNlc1xuICAgICAgLy9yZWN1cnNlLCBzaW5jZSBsY3MoYSwgYiwgYywgZCkgPT0gbGNzKGxjcyhhLGIpLCBsY3MoYyxkKSlcbiAgICAgIGFyZ3MucHVzaChsY3MoYXJncy5zaGlmdCgpLCBhcmdzLnNoaWZ0KCkpKVxuICAgICAgcmV0dXJuIGxjcyhhcmdzKVxuICAgIH1cbiAgICBcbiAgICAvL3RoaXMgd291bGQgYmUgaW1wcm92ZWQgYnkgdHJ1bmNhdGluZyBpbnB1dCBmaXJzdFxuICAgIC8vYW5kIG5vdCByZXR1cm5pbmcgYW4gbGNzIGFzIGFuIGludGVybWVkaWF0ZSBzdGVwLlxuICAgIC8vdW50aWxsIHRoYXQgaXMgYSBwZXJmb3JtYW5jZSBwcm9ibGVtLlxuXG4gICAgdmFyIHN0YXJ0ID0gMCwgZW5kID0gMFxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBhLmxlbmd0aCAmJiBpIDwgYi5sZW5ndGggXG4gICAgICAmJiBlcXVhbChhW2ldLCBiW2ldKVxuICAgICAgOyBpICsrXG4gICAgKVxuICAgICAgc3RhcnQgPSBpICsgMVxuXG4gICAgaWYoYS5sZW5ndGggPT09IHN0YXJ0KVxuICAgICAgcmV0dXJuIGEuc2xpY2UoKVxuXG4gICAgZm9yKHZhciBpID0gMDsgIGkgPCBhLmxlbmd0aCAtIHN0YXJ0ICYmIGkgPCBiLmxlbmd0aCAtIHN0YXJ0XG4gICAgICAmJiBlcXVhbChhW2EubGVuZ3RoIC0gMSAtIGldLCBiW2IubGVuZ3RoIC0gMSAtIGldKVxuICAgICAgOyBpICsrXG4gICAgKVxuICAgICAgZW5kID0gaVxuXG4gICAgZnVuY3Rpb24gcmVjdXJzZSAoYSwgYikge1xuICAgICAgaWYoIWEubGVuZ3RoIHx8ICFiLmxlbmd0aCkgcmV0dXJuIFtdXG4gICAgICAvL2F2b2lkIGV4cG9uZW50aWFsIHRpbWUgYnkgY2FjaGluZyB0aGUgcmVzdWx0c1xuICAgICAgaWYoY2FjaGVba2V5KGEsIGIpXSkgcmV0dXJuIGNhY2hlW2tleShhLCBiKV1cblxuICAgICAgaWYoZXF1YWwoYVswXSwgYlswXSkpXG4gICAgICAgIHJldHVybiBbaGVhZChhKV0uY29uY2F0KHJlY3Vyc2UodGFpbChhKSwgdGFpbChiKSkpXG4gICAgICBlbHNlIHsgXG4gICAgICAgIHZhciBfYSA9IHJlY3Vyc2UodGFpbChhKSwgYilcbiAgICAgICAgdmFyIF9iID0gcmVjdXJzZShhLCB0YWlsKGIpKVxuICAgICAgICByZXR1cm4gY2FjaGVba2V5KGEsYildID0gX2EubGVuZ3RoID4gX2IubGVuZ3RoID8gX2EgOiBfYiAgXG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIHZhciBtaWRkbGVBID0gYS5zbGljZShzdGFydCwgYS5sZW5ndGggLSBlbmQpXG4gICAgdmFyIG1pZGRsZUIgPSBiLnNsaWNlKHN0YXJ0LCBiLmxlbmd0aCAtIGVuZClcblxuICAgIHJldHVybiAoXG4gICAgICBhLnNsaWNlKDAsIHN0YXJ0KS5jb25jYXQoXG4gICAgICAgIHJlY3Vyc2UobWlkZGxlQSwgbWlkZGxlQilcbiAgICAgICkuY29uY2F0KGEuc2xpY2UoYS5sZW5ndGggLSBlbmQpKVxuICAgIClcbiAgfVxuXG4gIC8vIGdpdmVuIG4gc2VxdWVuY2VzLCBjYWxjIHRoZSBsY3MsIGFuZCB0aGVuIGNodW5rIHN0cmluZ3MgaW50byBzdGFibGUgYW5kIHVuc3RhYmxlIHNlY3Rpb25zLlxuICAvLyB1bnN0YWJsZSBjaHVua3MgYXJlIHBhc3NlZCB0byBidWlsZFxuICBleHBvcnRzLmNodW5rID1cbiAgZnVuY3Rpb24gKHEsIGJ1aWxkKSB7XG4gICAgdmFyIHEgPSBxLm1hcChmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS5zbGljZSgpIH0pXG4gICAgdmFyIGxjcyA9IGV4cG9ydHMubGNzLmFwcGx5KG51bGwsIHEpXG4gICAgdmFyIGFsbCA9IFtsY3NdLmNvbmNhdChxKVxuXG4gICAgZnVuY3Rpb24gbWF0Y2hMY3MgKGUpIHtcbiAgICAgIGlmKGUubGVuZ3RoICYmICFsY3MubGVuZ3RoIHx8ICFlLmxlbmd0aCAmJiBsY3MubGVuZ3RoKVxuICAgICAgICByZXR1cm4gZmFsc2UgLy9pbmNhc2UgdGhlIGxhc3QgaXRlbSBpcyBudWxsXG4gICAgICByZXR1cm4gZXF1YWwobGFzdChlKSwgbGFzdChsY3MpKSB8fCAoKGUubGVuZ3RoICsgbGNzLmxlbmd0aCkgPT09IDApXG4gICAgfVxuXG4gICAgd2hpbGUoYW55KHEsIGhhc0xlbmd0aCkpIHtcbiAgICAgIC8vaWYgZWFjaCBlbGVtZW50IGlzIGF0IHRoZSBsY3MgdGhlbiB0aGlzIGNodW5rIGlzIHN0YWJsZS5cbiAgICAgIHdoaWxlKHEuZXZlcnkobWF0Y2hMY3MpICYmIHEuZXZlcnkoaGFzTGVuZ3RoKSlcbiAgICAgICAgYWxsLmZvckVhY2gocmV0cmVhdClcbiAgICAgIC8vY29sbGVjdCB0aGUgY2hhbmdlcyBpbiBlYWNoIGFycmF5IHVwdG8gdGhlIG5leHQgbWF0Y2ggd2l0aCB0aGUgbGNzXG4gICAgICB2YXIgYyA9IGZhbHNlXG4gICAgICB2YXIgdW5zdGFibGUgPSBxLm1hcChmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgY2hhbmdlID0gW11cbiAgICAgICAgd2hpbGUoIW1hdGNoTGNzKGUpKSB7XG4gICAgICAgICAgY2hhbmdlLnVuc2hpZnQocmV0cmVhdChlKSlcbiAgICAgICAgICBjID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjaGFuZ2VcbiAgICAgIH0pXG4gICAgICBpZihjKSBidWlsZChxWzBdLmxlbmd0aCwgdW5zdGFibGUpXG4gICAgfVxuICB9XG5cbiAgLy9jYWxjdWxhdGUgYSBkaWZmIHRoaXMgaXMgb25seSB1cGRhdGVzXG4gIGV4cG9ydHMub3B0aW1pc3RpY0RpZmYgPVxuICBmdW5jdGlvbiAoYSwgYikge1xuICAgIHZhciBNID0gTWF0aC5tYXgoYS5sZW5ndGgsIGIubGVuZ3RoKVxuICAgIHZhciBtID0gTWF0aC5taW4oYS5sZW5ndGgsIGIubGVuZ3RoKVxuICAgIHZhciBwYXRjaCA9IFtdXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IE07IGkrKylcbiAgICAgIGlmKGFbaV0gIT09IGJbaV0pIHtcbiAgICAgICAgdmFyIGN1ciA9IFtpLDBdLCBkZWxldGVzID0gMFxuICAgICAgICB3aGlsZShhW2ldICE9PSBiW2ldICYmIGkgPCBtKSB7XG4gICAgICAgICAgY3VyWzFdID0gKytkZWxldGVzXG4gICAgICAgICAgY3VyLnB1c2goYltpKytdKVxuICAgICAgICB9XG4gICAgICAgIC8vdGhlIHJlc3QgYXJlIGRlbGV0ZXMgb3IgaW5zZXJ0c1xuICAgICAgICBpZihpID49IG0pIHtcbiAgICAgICAgICAvL3RoZSByZXN0IGFyZSBkZWxldGVzXG4gICAgICAgICAgaWYoYS5sZW5ndGggPiBiLmxlbmd0aClcbiAgICAgICAgICAgIGN1clsxXSArPSBhLmxlbmd0aCAtIGIubGVuZ3RoXG4gICAgICAgICAgLy90aGUgcmVzdCBhcmUgaW5zZXJ0c1xuICAgICAgICAgIGVsc2UgaWYoYS5sZW5ndGggPCBiLmxlbmd0aClcbiAgICAgICAgICAgIGN1ciA9IGN1ci5jb25jYXQoYi5zbGljZShhLmxlbmd0aCkpXG4gICAgICAgIH1cbiAgICAgICAgcGF0Y2gucHVzaChjdXIpXG4gICAgICB9XG5cbiAgICByZXR1cm4gcGF0Y2hcbiAgfVxuXG4gIGV4cG9ydHMuZGlmZiA9XG4gIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgdmFyIG9wdGltaXN0aWMgPSBleHBvcnRzLm9wdGltaXN0aWNEaWZmKGEsIGIpXG4gICAgdmFyIGNoYW5nZXMgPSBbXVxuICAgIGV4cG9ydHMuY2h1bmsoW2EsIGJdLCBmdW5jdGlvbiAoaW5kZXgsIHVuc3RhYmxlKSB7XG4gICAgICB2YXIgZGVsID0gdW5zdGFibGUuc2hpZnQoKS5sZW5ndGhcbiAgICAgIHZhciBpbnNlcnQgPSB1bnN0YWJsZS5zaGlmdCgpXG4gICAgICBjaGFuZ2VzLnB1c2goW2luZGV4LCBkZWxdLmNvbmNhdChpbnNlcnQpKVxuICAgIH0pXG4gICAgcmV0dXJuIGJlc3Qob3B0aW1pc3RpYywgY2hhbmdlcylcbiAgfVxuXG4gIGV4cG9ydHMucGF0Y2ggPSBmdW5jdGlvbiAoYSwgY2hhbmdlcywgbXV0YXRlKSB7XG4gICAgaWYobXV0YXRlICE9PSB0cnVlKSBhID0gYS5zbGljZShhKS8vY29weSBhXG4gICAgY2hhbmdlcy5mb3JFYWNoKGZ1bmN0aW9uIChjaGFuZ2UpIHtcbiAgICAgIFtdLnNwbGljZS5hcHBseShhLCBjaGFuZ2UpXG4gICAgfSlcbiAgICByZXR1cm4gYVxuICB9XG5cbiAgLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Db25jZXN0b3JcbiAgLy8gbWUsIGNvbmNlc3RvciwgeW91Li4uXG4gIGV4cG9ydHMubWVyZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFyZ3MgPSBnZXRBcmdzKGFyZ3VtZW50cylcbiAgICB2YXIgcGF0Y2ggPSBleHBvcnRzLmRpZmYzKGFyZ3MpXG4gICAgcmV0dXJuIGV4cG9ydHMucGF0Y2goYXJnc1swXSwgcGF0Y2gpXG4gIH1cblxuICBleHBvcnRzLmRpZmYzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBhcmdzID0gZ2V0QXJncyhhcmd1bWVudHMpXG4gICAgdmFyIHIgPSBbXVxuICAgIGV4cG9ydHMuY2h1bmsoYXJncywgZnVuY3Rpb24gKGluZGV4LCB1bnN0YWJsZSkge1xuICAgICAgdmFyIG1pbmUgPSB1bnN0YWJsZVswXVxuICAgICAgdmFyIGluc2VydCA9IHJlc29sdmUodW5zdGFibGUpXG4gICAgICBpZihlcXVhbChtaW5lLCBpbnNlcnQpKSByZXR1cm4gXG4gICAgICByLnB1c2goW2luZGV4LCBtaW5lLmxlbmd0aF0uY29uY2F0KGluc2VydCkpIFxuICAgIH0pXG4gICAgcmV0dXJuIHJcbiAgfVxuICBleHBvcnRzLm9kZE9uZU91dCA9XG4gICAgZnVuY3Rpb24gb2RkT25lT3V0IChjaGFuZ2VzKSB7XG4gICAgICBjaGFuZ2VzID0gY2hhbmdlcy5zbGljZSgpXG4gICAgICAvL3B1dCB0aGUgY29uY2VzdG9yIGZpcnN0XG4gICAgICBjaGFuZ2VzLnVuc2hpZnQoY2hhbmdlcy5zcGxpY2UoMSwxKVswXSlcbiAgICAgIHZhciBpID0gb2RkRWxlbWVudChjaGFuZ2VzLCBlcXVhbClcbiAgICAgIGlmKGkgPT0gMCkgLy8gY29uY2VzdG9yIHdhcyBkaWZmZXJlbnQsICdmYWxzZSBjb25mbGljdCdcbiAgICAgICAgcmV0dXJuIGNoYW5nZXNbMV1cbiAgICAgIGlmICh+aSlcbiAgICAgICAgcmV0dXJuIGNoYW5nZXNbaV0gXG4gICAgfVxuICBleHBvcnRzLmluc2VydE1lcmdlT3ZlckRlbGV0ZSA9IFxuICAgIC8vaSd2ZSBpbXBsZW1lbnRlZCB0aGlzIGFzIGEgc2VwZXJhdGUgcnVsZSxcbiAgICAvL2JlY2F1c2UgSSBoYWQgc2Vjb25kIHRob3VnaHRzIGFib3V0IHRoaXMuXG4gICAgZnVuY3Rpb24gaW5zZXJ0TWVyZ2VPdmVyRGVsZXRlIChjaGFuZ2VzKSB7XG4gICAgICBjaGFuZ2VzID0gY2hhbmdlcy5zbGljZSgpXG4gICAgICBjaGFuZ2VzLnNwbGljZSgxLDEpLy8gcmVtb3ZlIGNvbmNlc3RvclxuICAgICAgXG4gICAgICAvL2lmIHRoZXJlIGlzIG9ubHkgb25lIG5vbiBlbXB0eSBjaGFuZ2UgdGhhdHMgb2theS5cbiAgICAgIC8vZWxzZSBmdWxsIGNvbmZpbGN0XG4gICAgICBmb3IgKHZhciBpID0gMCwgbm9uZW1wdHk7IGkgPCBjaGFuZ2VzLmxlbmd0aDsgaSsrKVxuICAgICAgICBpZihjaGFuZ2VzW2ldLmxlbmd0aCkgXG4gICAgICAgICAgaWYoIW5vbmVtcHR5KSBub25lbXB0eSA9IGNoYW5nZXNbaV1cbiAgICAgICAgICBlbHNlIHJldHVybiAvLyBmdWxsIGNvbmZsaWN0XG4gICAgICByZXR1cm4gbm9uZW1wdHlcbiAgICB9XG5cbiAgdmFyIHJ1bGVzID0gKGRlcHMgJiYgZGVwcy5ydWxlcykgfHwgW2V4cG9ydHMub2RkT25lT3V0LCBleHBvcnRzLmluc2VydE1lcmdlT3ZlckRlbGV0ZV1cblxuICBmdW5jdGlvbiByZXNvbHZlIChjaGFuZ2VzKSB7XG4gICAgdmFyIGwgPSBydWxlcy5sZW5ndGhcbiAgICBmb3IgKHZhciBpIGluIHJ1bGVzKSB7IC8vIGZpcnN0XG4gICAgICBcbiAgICAgIHZhciBjID0gcnVsZXNbaV0gJiYgcnVsZXNbaV0oY2hhbmdlcylcbiAgICAgIGlmKGMpIHJldHVybiBjXG4gICAgfVxuICAgIGNoYW5nZXMuc3BsaWNlKDEsMSkgLy8gcmVtb3ZlIGNvbmNlc3RvclxuICAgIC8vcmV0dXJuaW5nIHRoZSBjb25mbGljdHMgYXMgYW4gb2JqZWN0IGlzIGEgcmVhbGx5IGJhZCBpZGVhLFxuICAgIC8vIGJlY2F1c2UgPT0gd2lsbCBub3QgZGV0ZWN0IHRoZXkgYXJlIHRoZSBzYW1lLiBhbmQgY29uZmxpY3RzIGJ1aWxkLlxuICAgIC8vIGJldHRlciB0byB1c2VcbiAgICAvLyAnPDw8PDw8PDw8PDw8PCdcbiAgICAvLyBvZiBjb3Vyc2UsIGkgd3JvdGUgdGhpcyBiZWZvcmUgaSBzdGFydGVkIG9uIHNub2IsIHNvIGkgZGlkbid0IGtub3cgdGhhdCB0aGVuLlxuICAgIC8qdmFyIGNvbmZsaWN0ID0gWyc+Pj4+Pj4+Pj4+Pj4+Pj4+J11cbiAgICB3aGlsZShjaGFuZ2VzLmxlbmd0aClcbiAgICAgIGNvbmZsaWN0ID0gY29uZmxpY3QuY29uY2F0KGNoYW5nZXMuc2hpZnQoKSkuY29uY2F0KCc9PT09PT09PT09PT0nKVxuICAgIGNvbmZsaWN0LnBvcCgpXG4gICAgY29uZmxpY3QucHVzaCAgICAgICAgICAoJzw8PDw8PDw8PDw8PDw8PCcpXG4gICAgY2hhbmdlcy51bnNoaWZ0ICAgICAgICgnPj4+Pj4+Pj4+Pj4+Pj4+JylcbiAgICByZXR1cm4gY29uZmxpY3QqL1xuICAgIC8vbmFoLCBiZXR0ZXIgaXMganVzdCB0byB1c2UgYW4gZXF1YWwgY2FuIGhhbmRsZSBvYmplY3RzXG4gICAgcmV0dXJuIHsnPyc6IGNoYW5nZXN9XG4gIH1cbiAgcmV0dXJuIGV4cG9ydHNcbn1cbmV4cG9ydHMobnVsbCwgZXhwb3J0cylcbiIsInZhciBhZGRMaXN0ZW5lciA9IHJlcXVpcmUoXCIuL2FkZC1saXN0ZW5lci5qc1wiKVxudmFyIHNldE5vbkVudW1lcmFibGUgPSByZXF1aXJlKFwiLi9saWIvc2V0LW5vbi1lbnVtZXJhYmxlLmpzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHB1dFxuXG4vLyBgb2JzLnB1dGAgaXMgYSBtdXRhYmxlIGltcGxlbWVudGF0aW9uIG9mIGBhcnJheVtpbmRleF0gPSB2YWx1ZWBcbi8vIHRoYXQgbXV0YXRlcyBib3RoIGBsaXN0YCBhbmQgdGhlIGludGVybmFsIGB2YWx1ZUxpc3RgIHRoYXRcbi8vIGlzIHRoZSBjdXJyZW50IHZhbHVlIG9mIGBvYnNgIGl0c2VsZlxuZnVuY3Rpb24gcHV0KGluZGV4LCB2YWx1ZSkge1xuICAgIHZhciBvYnMgPSB0aGlzXG4gICAgdmFyIHZhbHVlTGlzdCA9IG9icygpLnNsaWNlKClcblxuICAgIHZhciBvcmlnaW5hbExlbmd0aCA9IHZhbHVlTGlzdC5sZW5ndGhcbiAgICB2YWx1ZUxpc3RbaW5kZXhdID0gdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyB2YWx1ZSgpIDogdmFsdWVcblxuICAgIG9icy5fbGlzdFtpbmRleF0gPSB2YWx1ZVxuXG4gICAgLy8gcmVtb3ZlIHBhc3QgdmFsdWUgbGlzdGVuZXIgaWYgd2FzIG9ic2VydlxuICAgIHZhciByZW1vdmVMaXN0ZW5lciA9IG9icy5fcmVtb3ZlTGlzdGVuZXJzW2luZGV4XVxuICAgIGlmIChyZW1vdmVMaXN0ZW5lcil7XG4gICAgICAgIHJlbW92ZUxpc3RlbmVyKClcbiAgICB9XG5cbiAgICAvLyBhZGQgbGlzdGVuZXIgdG8gdmFsdWUgaWYgb2JzZXJ2XG4gICAgb2JzLl9yZW1vdmVMaXN0ZW5lcnNbaW5kZXhdID0gdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgP1xuICAgICAgICBhZGRMaXN0ZW5lcihvYnMsIHZhbHVlKSA6XG4gICAgICAgIG51bGxcblxuICAgIC8vIGZha2Ugc3BsaWNlIGRpZmZcbiAgICB2YXIgdmFsdWVBcmdzID0gaW5kZXggPCBvcmlnaW5hbExlbmd0aCA/IFxuICAgICAgICBbaW5kZXgsIDEsIHZhbHVlTGlzdFtpbmRleF1dIDpcbiAgICAgICAgW2luZGV4LCAwLCB2YWx1ZUxpc3RbaW5kZXhdXVxuXG4gICAgc2V0Tm9uRW51bWVyYWJsZSh2YWx1ZUxpc3QsIFwiX2RpZmZcIiwgW3ZhbHVlQXJnc10pXG5cbiAgICBvYnMuX29ic2VydlNldCh2YWx1ZUxpc3QpXG4gICAgcmV0dXJuIHZhbHVlXG59IiwidmFyIGFwcGx5UGF0Y2ggPSByZXF1aXJlKFwiLi9hcHBseS1wYXRjaC5qc1wiKVxudmFyIHNldE5vbkVudW1lcmFibGUgPSByZXF1aXJlKFwiLi9saWIvc2V0LW5vbi1lbnVtZXJhYmxlLmpzXCIpXG52YXIgYWRpZmYgPSByZXF1aXJlKFwiYWRpZmZcIilcblxubW9kdWxlLmV4cG9ydHMgPSBzZXRcblxuZnVuY3Rpb24gc2V0KHJhd0xpc3QpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocmF3TGlzdCkpIHJhd0xpc3QgPSBbXVxuXG4gICAgdmFyIG9icyA9IHRoaXNcbiAgICB2YXIgY2hhbmdlcyA9IGFkaWZmLmRpZmYob2JzLl9saXN0LCByYXdMaXN0KVxuICAgIHZhciB2YWx1ZUxpc3QgPSBvYnMoKS5zbGljZSgpXG5cbiAgICB2YXIgdmFsdWVDaGFuZ2VzID0gY2hhbmdlcy5tYXAoYXBwbHlQYXRjaC5iaW5kKG9icywgdmFsdWVMaXN0KSlcblxuICAgIHNldE5vbkVudW1lcmFibGUodmFsdWVMaXN0LCBcIl9kaWZmXCIsIHZhbHVlQ2hhbmdlcylcblxuICAgIG9icy5fb2JzZXJ2U2V0KHZhbHVlTGlzdClcbiAgICByZXR1cm4gY2hhbmdlc1xufVxuIiwidmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlXG5cbnZhciBhZGRMaXN0ZW5lciA9IHJlcXVpcmUoXCIuL2FkZC1saXN0ZW5lci5qc1wiKVxudmFyIHNldE5vbkVudW1lcmFibGUgPSByZXF1aXJlKFwiLi9saWIvc2V0LW5vbi1lbnVtZXJhYmxlLmpzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNwbGljZVxuXG4vLyBgb2JzLnNwbGljZWAgaXMgYSBtdXRhYmxlIGltcGxlbWVudGF0aW9uIG9mIGBzcGxpY2UoKWBcbi8vIHRoYXQgbXV0YXRlcyBib3RoIGBsaXN0YCBhbmQgdGhlIGludGVybmFsIGB2YWx1ZUxpc3RgIHRoYXRcbi8vIGlzIHRoZSBjdXJyZW50IHZhbHVlIG9mIGBvYnNgIGl0c2VsZlxuZnVuY3Rpb24gc3BsaWNlKGluZGV4LCBhbW91bnQpIHtcbiAgICB2YXIgb2JzID0gdGhpc1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApXG4gICAgdmFyIHZhbHVlTGlzdCA9IG9icygpLnNsaWNlKClcblxuICAgIC8vIGdlbmVyYXRlIGEgbGlzdCBvZiBhcmdzIHRvIG11dGF0ZSB0aGUgaW50ZXJuYWxcbiAgICAvLyBsaXN0IG9mIG9ubHkgb2JzXG4gICAgdmFyIHZhbHVlQXJncyA9IGFyZ3MubWFwKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgaWYgKGluZGV4ID09PSAwIHx8IGluZGV4ID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG11c3QgdW5wYWNrIG9ic2VydmFibGVzIHRoYXQgd2UgYXJlIGFkZGluZ1xuICAgICAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyB2YWx1ZSgpIDogdmFsdWVcbiAgICB9KVxuXG4gICAgdmFsdWVMaXN0LnNwbGljZS5hcHBseSh2YWx1ZUxpc3QsIHZhbHVlQXJncylcbiAgICAvLyB3ZSByZW1vdmUgdGhlIG9ic2VydnMgdGhhdCB3ZSByZW1vdmVcbiAgICB2YXIgcmVtb3ZlZCA9IG9icy5fbGlzdC5zcGxpY2UuYXBwbHkob2JzLl9saXN0LCBhcmdzKVxuXG4gICAgdmFyIGV4dHJhUmVtb3ZlTGlzdGVuZXJzID0gYXJncy5zbGljZSgyKS5tYXAoZnVuY3Rpb24gKG9ic2Vydikge1xuICAgICAgICByZXR1cm4gdHlwZW9mIG9ic2VydiA9PT0gXCJmdW5jdGlvblwiID9cbiAgICAgICAgICAgIGFkZExpc3RlbmVyKG9icywgb2JzZXJ2KSA6XG4gICAgICAgICAgICBudWxsXG4gICAgfSlcbiAgICBleHRyYVJlbW92ZUxpc3RlbmVycy51bnNoaWZ0KGFyZ3NbMF0sIGFyZ3NbMV0pXG4gICAgdmFyIHJlbW92ZWRMaXN0ZW5lcnMgPSBvYnMuX3JlbW92ZUxpc3RlbmVycy5zcGxpY2VcbiAgICAgICAgLmFwcGx5KG9icy5fcmVtb3ZlTGlzdGVuZXJzLCBleHRyYVJlbW92ZUxpc3RlbmVycylcblxuICAgIHJlbW92ZWRMaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAocmVtb3ZlT2JzZXJ2TGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKHJlbW92ZU9ic2Vydkxpc3RlbmVyKSB7XG4gICAgICAgICAgICByZW1vdmVPYnNlcnZMaXN0ZW5lcigpXG4gICAgICAgIH1cbiAgICB9KVxuXG4gICAgc2V0Tm9uRW51bWVyYWJsZSh2YWx1ZUxpc3QsIFwiX2RpZmZcIiwgW3ZhbHVlQXJnc10pXG5cbiAgICBvYnMuX29ic2VydlNldCh2YWx1ZUxpc3QpXG4gICAgcmV0dXJuIHJlbW92ZWRcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gdHJhbnNhY3Rpb25cblxuZnVuY3Rpb24gdHJhbnNhY3Rpb24gKGZ1bmMpIHtcbiAgICB2YXIgb2JzID0gdGhpc1xuICAgIHZhciByYXdMaXN0ID0gb2JzLl9saXN0LnNsaWNlKClcblxuICAgIGlmIChmdW5jKHJhd0xpc3QpICE9PSBmYWxzZSl7IC8vIGFsbG93IGNhbmNlbFxuICAgICAgICByZXR1cm4gb2JzLnNldChyYXdMaXN0KVxuICAgIH1cblxufSIsInZhciBPYnNlcnYgPSByZXF1aXJlKFwib2JzZXJ2XCIpXG52YXIgZXh0ZW5kID0gcmVxdWlyZShcInh0ZW5kXCIpXG5cbnZhciBibGFja0xpc3QgPSBbXCJuYW1lXCIsIFwiX2RpZmZcIiwgXCJfdHlwZVwiLCBcIl92ZXJzaW9uXCJdXG52YXIgYmxhY2tMaXN0UmVhc29ucyA9IHtcbiAgICBcIm5hbWVcIjogXCJDbGFzaGVzIHdpdGggYEZ1bmN0aW9uLnByb3RvdHlwZS5uYW1lYC5cXG5cIixcbiAgICBcIl9kaWZmXCI6IFwiX2RpZmYgaXMgcmVzZXJ2ZWQga2V5IG9mIG9ic2Vydi1zdHJ1Y3QuXFxuXCIsXG4gICAgXCJfdHlwZVwiOiBcIl90eXBlIGlzIHJlc2VydmVkIGtleSBvZiBvYnNlcnYtc3RydWN0LlxcblwiLFxuICAgIFwiX3ZlcnNpb25cIjogXCJfdmVyc2lvbiBpcyByZXNlcnZlZCBrZXkgb2Ygb2JzZXJ2LXN0cnVjdC5cXG5cIlxufVxudmFyIE5PX1RSQU5TQUNUSU9OID0ge31cblxuZnVuY3Rpb24gc2V0Tm9uRW51bWVyYWJsZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqZWN0LCBrZXksIHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0pXG59XG5cbi8qIE9ic2VydlN0cnVjdCA6PSAoT2JqZWN0PFN0cmluZywgT2JzZXJ2PFQ+PikgPT4gXG4gICAgT2JqZWN0PFN0cmluZywgT2JzZXJ2PFQ+PiAmXG4gICAgICAgIE9ic2VydjxPYmplY3Q8U3RyaW5nLCBUPiAmIHtcbiAgICAgICAgICAgIF9kaWZmOiBPYmplY3Q8U3RyaW5nLCBBbnk+XG4gICAgICAgIH0+XG5cbiovXG5tb2R1bGUuZXhwb3J0cyA9IE9ic2VydlN0cnVjdFxuXG5mdW5jdGlvbiBPYnNlcnZTdHJ1Y3Qoc3RydWN0KSB7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhzdHJ1Y3QpXG5cbiAgICB2YXIgaW5pdGlhbFN0YXRlID0ge31cbiAgICB2YXIgY3VycmVudFRyYW5zYWN0aW9uID0gTk9fVFJBTlNBQ1RJT05cbiAgICB2YXIgbmVzdGVkVHJhbnNhY3Rpb24gPSBOT19UUkFOU0FDVElPTlxuXG4gICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgaWYgKGJsYWNrTGlzdC5pbmRleE9mKGtleSkgIT09IC0xKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjYW5ub3QgY3JlYXRlIGFuIG9ic2Vydi1zdHJ1Y3QgXCIgK1xuICAgICAgICAgICAgICAgIFwid2l0aCBhIGtleSBuYW1lZCAnXCIgKyBrZXkgKyBcIicuXFxuXCIgK1xuICAgICAgICAgICAgICAgIGJsYWNrTGlzdFJlYXNvbnNba2V5XSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgb2JzZXJ2ID0gc3RydWN0W2tleV1cbiAgICAgICAgaW5pdGlhbFN0YXRlW2tleV0gPSB0eXBlb2Ygb2JzZXJ2ID09PSBcImZ1bmN0aW9uXCIgP1xuICAgICAgICAgICAgb2JzZXJ2KCkgOiBvYnNlcnZcbiAgICB9KVxuXG4gICAgdmFyIG9icyA9IE9ic2Vydihpbml0aWFsU3RhdGUpXG4gICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdmFyIG9ic2VydiA9IHN0cnVjdFtrZXldXG4gICAgICAgIG9ic1trZXldID0gb2JzZXJ2XG5cbiAgICAgICAgaWYgKHR5cGVvZiBvYnNlcnYgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgb2JzZXJ2KGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmIChuZXN0ZWRUcmFuc2FjdGlvbiA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gZXh0ZW5kKG9icygpKVxuICAgICAgICAgICAgICAgIHN0YXRlW2tleV0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgIHZhciBkaWZmID0ge31cbiAgICAgICAgICAgICAgICBkaWZmW2tleV0gPSB2YWx1ZSAmJiB2YWx1ZS5fZGlmZiA/XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLl9kaWZmIDogdmFsdWVcblxuICAgICAgICAgICAgICAgIHNldE5vbkVudW1lcmFibGUoc3RhdGUsIFwiX2RpZmZcIiwgZGlmZilcbiAgICAgICAgICAgICAgICBjdXJyZW50VHJhbnNhY3Rpb24gPSBzdGF0ZVxuICAgICAgICAgICAgICAgIG9icy5zZXQoc3RhdGUpXG4gICAgICAgICAgICAgICAgY3VycmVudFRyYW5zYWN0aW9uID0gTk9fVFJBTlNBQ1RJT05cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9KVxuICAgIHZhciBfc2V0ID0gb2JzLnNldFxuICAgIG9icy5zZXQgPSBmdW5jdGlvbiB0cmFja0RpZmYodmFsdWUpIHtcbiAgICAgICAgaWYgKGN1cnJlbnRUcmFuc2FjdGlvbiA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfc2V0KHZhbHVlKVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG5ld1N0YXRlID0gZXh0ZW5kKHZhbHVlKVxuICAgICAgICBzZXROb25FbnVtZXJhYmxlKG5ld1N0YXRlLCBcIl9kaWZmXCIsIHZhbHVlKVxuICAgICAgICBfc2V0KG5ld1N0YXRlKVxuICAgIH1cblxuICAgIG9icyhmdW5jdGlvbiAobmV3U3RhdGUpIHtcbiAgICAgICAgaWYgKGN1cnJlbnRUcmFuc2FjdGlvbiA9PT0gbmV3U3RhdGUpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHZhciBvYnNlcnYgPSBzdHJ1Y3Rba2V5XVxuICAgICAgICAgICAgdmFyIG5ld09ic2VydlZhbHVlID0gbmV3U3RhdGVba2V5XVxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9ic2VydiA9PT0gXCJmdW5jdGlvblwiICYmXG4gICAgICAgICAgICAgICAgb2JzZXJ2KCkgIT09IG5ld09ic2VydlZhbHVlXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBuZXN0ZWRUcmFuc2FjdGlvbiA9IG5ld09ic2VydlZhbHVlXG4gICAgICAgICAgICAgICAgb2JzZXJ2LnNldChuZXdTdGF0ZVtrZXldKVxuICAgICAgICAgICAgICAgIG5lc3RlZFRyYW5zYWN0aW9uID0gTk9fVFJBTlNBQ1RJT05cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9KVxuXG4gICAgb2JzLl90eXBlID0gXCJvYnNlcnYtc3RydWN0XCJcbiAgICBvYnMuX3ZlcnNpb24gPSBcIjVcIlxuXG4gICAgcmV0dXJuIG9ic1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBleHRlbmRcblxuZnVuY3Rpb24gZXh0ZW5kKCkge1xuICAgIHZhciB0YXJnZXQgPSB7fVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXVxuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0YXJnZXRcbn1cbiIsInZhciBPYnNlcnYgPSByZXF1aXJlKCdvYnNlcnYnKVxudmFyIGV4dGVuZCA9IHJlcXVpcmUoJ3h0ZW5kJylcblxudmFyIE5PX1RSQU5TQUNUSU9OID0ge31cblxubW9kdWxlLmV4cG9ydHMgPSBPYnNlcnZWYXJoYXNoXG5cbmZ1bmN0aW9uIE9ic2VydlZhcmhhc2ggKGhhc2gsIGNyZWF0ZVZhbHVlKSB7XG4gIGNyZWF0ZVZhbHVlID0gY3JlYXRlVmFsdWUgfHwgZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqIH1cblxuICB2YXIgaW5pdGlhbFN0YXRlID0ge31cbiAgdmFyIGN1cnJlbnRUcmFuc2FjdGlvbiA9IE5PX1RSQU5TQUNUSU9OXG5cbiAgdmFyIG9icyA9IE9ic2Vydihpbml0aWFsU3RhdGUpXG4gIHNldE5vbkVudW1lcmFibGUob2JzLCAnX3JlbW92ZUxpc3RlbmVycycsIHt9KVxuXG4gIHNldE5vbkVudW1lcmFibGUob2JzLCAnc2V0Jywgb2JzLnNldClcbiAgc2V0Tm9uRW51bWVyYWJsZShvYnMsICdnZXQnLCBnZXQuYmluZChvYnMpKVxuICBzZXROb25FbnVtZXJhYmxlKG9icywgJ3B1dCcsIHB1dC5iaW5kKG9icywgY3JlYXRlVmFsdWUsIGN1cnJlbnRUcmFuc2FjdGlvbikpXG4gIHNldE5vbkVudW1lcmFibGUob2JzLCAnZGVsZXRlJywgZGVsLmJpbmQob2JzKSlcblxuICBmb3IgKHZhciBrZXkgaW4gaGFzaCkge1xuICAgIG9ic1trZXldID0gdHlwZW9mIGhhc2hba2V5XSA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgICBoYXNoW2tleV0gOiBjcmVhdGVWYWx1ZShoYXNoW2tleV0sIGtleSlcblxuICAgIGlmIChpc0ZuKG9ic1trZXldKSkge1xuICAgICAgb2JzLl9yZW1vdmVMaXN0ZW5lcnNba2V5XSA9IG9ic1trZXldKHdhdGNoKG9icywga2V5LCBjdXJyZW50VHJhbnNhY3Rpb24pKVxuICAgIH1cbiAgfVxuXG4gIHZhciBuZXdTdGF0ZSA9IHt9XG4gIGZvciAoa2V5IGluIGhhc2gpIHtcbiAgICB2YXIgb2JzZXJ2ID0gb2JzW2tleV1cbiAgICBjaGVja0tleShrZXkpXG4gICAgbmV3U3RhdGVba2V5XSA9IGlzRm4ob2JzZXJ2KSA/IG9ic2VydigpIDogb2JzZXJ2XG4gIH1cbiAgb2JzLnNldChuZXdTdGF0ZSlcblxuICBvYnMoZnVuY3Rpb24gKG5ld1N0YXRlKSB7XG4gICAgaWYgKGN1cnJlbnRUcmFuc2FjdGlvbiA9PT0gbmV3U3RhdGUpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGZvciAodmFyIGtleSBpbiBoYXNoKSB7XG4gICAgICB2YXIgb2JzZXJ2ID0gaGFzaFtrZXldXG5cbiAgICAgIGlmIChpc0ZuKG9ic2VydikgJiYgb2JzZXJ2KCkgIT09IG5ld1N0YXRlW2tleV0pIHtcbiAgICAgICAgb2JzZXJ2LnNldChuZXdTdGF0ZVtrZXldKVxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICByZXR1cm4gb2JzXG59XG5cbi8vIGFjY2VzcyBhbmQgbXV0YXRlXG5mdW5jdGlvbiBnZXQgKGtleSkge1xuICByZXR1cm4gdGhpc1trZXldXG59XG5cbmZ1bmN0aW9uIHB1dCAoY3JlYXRlVmFsdWUsIGN1cnJlbnRUcmFuc2FjdGlvbiwga2V5LCB2YWwpIHtcbiAgY2hlY2tLZXkoa2V5KVxuXG4gIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2Fubm90IHZhcmhhc2gucHV0KGtleSwgdW5kZWZpbmVkKS4nKVxuICB9XG5cbiAgdmFyIG9ic2VydiA9IHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicgP1xuICAgIHZhbCA6IGNyZWF0ZVZhbHVlKHZhbCwga2V5KVxuICB2YXIgc3RhdGUgPSBleHRlbmQodGhpcygpKVxuXG4gIHN0YXRlW2tleV0gPSBpc0ZuKG9ic2VydikgPyBvYnNlcnYoKSA6IG9ic2VydlxuXG4gIGlmIChpc0ZuKHRoaXMuX3JlbW92ZUxpc3RlbmVyc1trZXldKSkge1xuICAgIHRoaXMuX3JlbW92ZUxpc3RlbmVyc1trZXldKClcbiAgfVxuXG4gIHRoaXMuX3JlbW92ZUxpc3RlbmVyc1trZXldID0gaXNGbihvYnNlcnYpID9cbiAgICBvYnNlcnYod2F0Y2godGhpcywga2V5LCBjdXJyZW50VHJhbnNhY3Rpb24pKSA6IG51bGxcblxuICBzZXROb25FbnVtZXJhYmxlKHN0YXRlLCAnX2RpZmYnLCBkaWZmKGtleSwgc3RhdGVba2V5XSkpXG5cbiAgdGhpc1trZXldID0gb2JzZXJ2XG4gIHRoaXMuc2V0KHN0YXRlKVxuXG4gIHJldHVybiB0aGlzXG59XG5cbmZ1bmN0aW9uIGRlbCAoa2V5KSB7XG4gIHZhciBzdGF0ZSA9IGV4dGVuZCh0aGlzKCkpXG4gIGlmIChpc0ZuKHRoaXMuX3JlbW92ZUxpc3RlbmVyc1trZXldKSkge1xuICAgIHRoaXMuX3JlbW92ZUxpc3RlbmVyc1trZXldKClcbiAgfVxuXG4gIGRlbGV0ZSB0aGlzLl9yZW1vdmVMaXN0ZW5lcnNba2V5XVxuICBkZWxldGUgc3RhdGVba2V5XVxuICBkZWxldGUgdGhpc1trZXldXG5cbiAgc2V0Tm9uRW51bWVyYWJsZShzdGF0ZSwgJ19kaWZmJywgZGlmZihrZXksIHVuZGVmaW5lZCkpXG4gIHRoaXMuc2V0KHN0YXRlKVxuXG4gIHJldHVybiB0aGlzXG59XG5cbi8vIHByb2Nlc3NpbmdcbmZ1bmN0aW9uIHdhdGNoIChvYnMsIGtleSwgY3VycmVudFRyYW5zYWN0aW9uKSB7XG4gIHJldHVybiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgc3RhdGUgPSBleHRlbmQob2JzKCkpXG4gICAgc3RhdGVba2V5XSA9IHZhbHVlXG5cbiAgICBzZXROb25FbnVtZXJhYmxlKHN0YXRlLCAnX2RpZmYnLCBkaWZmKGtleSwgdmFsdWUpKVxuICAgIGN1cnJlbnRUcmFuc2FjdGlvbiA9IHN0YXRlXG4gICAgb2JzLnNldChzdGF0ZSlcbiAgICBjdXJyZW50VHJhbnNhY3Rpb24gPSBOT19UUkFOU0FDVElPTlxuICB9XG59XG5cbmZ1bmN0aW9uIGRpZmYgKGtleSwgdmFsdWUpIHtcbiAgdmFyIG9iaiA9IHt9XG4gIG9ialtrZXldID0gdmFsdWUgJiYgdmFsdWUuX2RpZmYgPyB2YWx1ZS5fZGlmZiA6IHZhbHVlXG4gIHJldHVybiBvYmpcbn1cblxuZnVuY3Rpb24gaXNGbiAob2JqKSB7XG4gIHJldHVybiB0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nXG59XG5cbmZ1bmN0aW9uIHNldE5vbkVudW1lcmFibGUob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIGtleSwge1xuICAgIHZhbHVlOiB2YWx1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogZmFsc2VcbiAgfSlcbn1cblxuLy8gZXJyb3JzXG52YXIgYmxhY2tsaXN0ID0ge1xuICBuYW1lOiAnQ2xhc2hlcyB3aXRoIGBGdW5jdGlvbi5wcm90b3R5cGUubmFtZWAuJyxcbiAgZ2V0OiAnZ2V0IGlzIGEgcmVzZXJ2ZWQga2V5IG9mIG9ic2Vydi12YXJoYXNoIG1ldGhvZCcsXG4gIHB1dDogJ3B1dCBpcyBhIHJlc2VydmVkIGtleSBvZiBvYnNlcnYtdmFyaGFzaCBtZXRob2QnLFxuICAnZGVsZXRlJzogJ2RlbGV0ZSBpcyBhIHJlc2VydmVkIGtleSBvZiBvYnNlcnYtdmFyaGFzaCBtZXRob2QnLFxuICBfZGlmZjogJ19kaWZmIGlzIGEgcmVzZXJ2ZWQga2V5IG9mIG9ic2Vydi12YXJoYXNoIG1ldGhvZCcsXG4gIF9yZW1vdmVMaXN0ZW5lcnM6ICdfcmVtb3ZlTGlzdGVuZXJzIGlzIGEgcmVzZXJ2ZWQga2V5IG9mIG9ic2Vydi12YXJoYXNoJ1xufVxuXG5mdW5jdGlvbiBjaGVja0tleSAoa2V5KSB7XG4gIGlmICghYmxhY2tsaXN0W2tleV0pIHJldHVyblxuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgJ2Nhbm5vdCBjcmVhdGUgYW4gb2JzZXJ2LXZhcmhhc2ggd2l0aCBrZXkgYCcgKyBrZXkgKyAnYC4gJyArIGJsYWNrbGlzdFtrZXldXG4gIClcbn1cbiIsInZhciBPYnNlcnZhYmxlID0gcmVxdWlyZShcIi4vaW5kZXguanNcIilcblxubW9kdWxlLmV4cG9ydHMgPSBjb21wdXRlZFxuXG5mdW5jdGlvbiBjb21wdXRlZChvYnNlcnZhYmxlcywgbGFtYmRhKSB7XG4gICAgdmFyIHZhbHVlcyA9IG9ic2VydmFibGVzLm1hcChmdW5jdGlvbiAobykge1xuICAgICAgICByZXR1cm4gbygpXG4gICAgfSlcbiAgICB2YXIgcmVzdWx0ID0gT2JzZXJ2YWJsZShsYW1iZGEuYXBwbHkobnVsbCwgdmFsdWVzKSlcblxuICAgIG9ic2VydmFibGVzLmZvckVhY2goZnVuY3Rpb24gKG8sIGluZGV4KSB7XG4gICAgICAgIG8oZnVuY3Rpb24gKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICB2YWx1ZXNbaW5kZXhdID0gbmV3VmFsdWVcbiAgICAgICAgICAgIHJlc3VsdC5zZXQobGFtYmRhLmFwcGx5KG51bGwsIHZhbHVlcykpXG4gICAgICAgIH0pXG4gICAgfSlcblxuICAgIHJldHVybiByZXN1bHRcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gT2JzZXJ2YWJsZVxuXG5mdW5jdGlvbiBPYnNlcnZhYmxlKHZhbHVlKSB7XG4gICAgdmFyIGxpc3RlbmVycyA9IFtdXG4gICAgdmFsdWUgPSB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IHZhbHVlXG5cbiAgICBvYnNlcnZhYmxlLnNldCA9IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIHZhbHVlID0gdlxuICAgICAgICBsaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAoZikge1xuICAgICAgICAgICAgZih2KVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIHJldHVybiBvYnNlcnZhYmxlXG5cbiAgICBmdW5jdGlvbiBvYnNlcnZhYmxlKGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICghbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgICB9XG5cbiAgICAgICAgbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpXG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy5zcGxpY2UobGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpLCAxKVxuICAgICAgICB9XG4gICAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB3YXRjaFxuXG5mdW5jdGlvbiB3YXRjaChvYnNlcnZhYmxlLCBsaXN0ZW5lcikge1xuICAgIHZhciByZW1vdmUgPSBvYnNlcnZhYmxlKGxpc3RlbmVyKVxuICAgIGxpc3RlbmVyKG9ic2VydmFibGUoKSlcbiAgICByZXR1cm4gcmVtb3ZlXG59XG4iLCJ2YXIgRGVsZWdhdG9yID0gcmVxdWlyZSgnZG9tLWRlbGVnYXRvcicpXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZUV2ZW50XG5cbmZ1bmN0aW9uIEJhc2VFdmVudChsYW1iZGEpIHtcbiAgICByZXR1cm4gRXZlbnRIYW5kbGVyO1xuXG4gICAgZnVuY3Rpb24gRXZlbnRIYW5kbGVyKGZuLCBkYXRhLCBvcHRzKSB7XG4gICAgICAgIHZhciBoYW5kbGVyID0ge1xuICAgICAgICAgICAgZm46IGZuLFxuICAgICAgICAgICAgZGF0YTogZGF0YSAhPT0gdW5kZWZpbmVkID8gZGF0YSA6IHt9LFxuICAgICAgICAgICAgb3B0czogb3B0cyB8fCB7fSxcbiAgICAgICAgICAgIGhhbmRsZUV2ZW50OiBoYW5kbGVFdmVudFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZuICYmIGZuLnR5cGUgPT09ICdkb20tZGVsZWdhdG9yLWhhbmRsZScpIHtcbiAgICAgICAgICAgIHJldHVybiBEZWxlZ2F0b3IudHJhbnNmb3JtSGFuZGxlKGZuLFxuICAgICAgICAgICAgICAgIGhhbmRsZUxhbWJkYS5iaW5kKGhhbmRsZXIpKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGhhbmRsZXI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlTGFtYmRhKGV2LCBicm9hZGNhc3QpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0cy5zdGFydFByb3BhZ2F0aW9uICYmIGV2LnN0YXJ0UHJvcGFnYXRpb24pIHtcbiAgICAgICAgICAgIGV2LnN0YXJ0UHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBsYW1iZGEuY2FsbCh0aGlzLCBldiwgYnJvYWRjYXN0KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZUV2ZW50KGV2KSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpc1xuXG4gICAgICAgIGlmIChzZWxmLm9wdHMuc3RhcnRQcm9wYWdhdGlvbiAmJiBldi5zdGFydFByb3BhZ2F0aW9uKSB7XG4gICAgICAgICAgICBldi5zdGFydFByb3BhZ2F0aW9uKClcbiAgICAgICAgfVxuXG4gICAgICAgIGxhbWJkYS5jYWxsKHNlbGYsIGV2LCBicm9hZGNhc3QpXG5cbiAgICAgICAgZnVuY3Rpb24gYnJvYWRjYXN0KHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHNlbGYuZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZuKHZhbHVlKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLmZuLndyaXRlKHZhbHVlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIiwidmFyIGV4dGVuZCA9IHJlcXVpcmUoJ3h0ZW5kJylcbnZhciBnZXRGb3JtRGF0YSA9IHJlcXVpcmUoJ2Zvcm0tZGF0YS1zZXQvZWxlbWVudCcpXG5cbnZhciBCYXNlRXZlbnQgPSByZXF1aXJlKCcuL2Jhc2UtZXZlbnQuanMnKVxuXG52YXIgVkFMSURfQ0hBTkdFID0gWydjaGVja2JveCcsICdmaWxlJywgJ3NlbGVjdC1tdWx0aXBsZScsICdzZWxlY3Qtb25lJ107XG52YXIgVkFMSURfSU5QVVQgPSBbJ2NvbG9yJywgJ2RhdGUnLCAnZGF0ZXRpbWUnLCAnZGF0ZXRpbWUtbG9jYWwnLCAnZW1haWwnLFxuICAgICdtb250aCcsICdudW1iZXInLCAncGFzc3dvcmQnLCAncmFuZ2UnLCAnc2VhcmNoJywgJ3RlbCcsICd0ZXh0JywgJ3RpbWUnLFxuICAgICd1cmwnLCAnd2VlayddO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VFdmVudChjaGFuZ2VMYW1iZGEpO1xuXG5mdW5jdGlvbiBjaGFuZ2VMYW1iZGEoZXYsIGJyb2FkY2FzdCkge1xuICAgIHZhciB0YXJnZXQgPSBldi50YXJnZXRcblxuICAgIHZhciBpc1ZhbGlkID1cbiAgICAgICAgKGV2LnR5cGUgPT09ICdpbnB1dCcgJiYgVkFMSURfSU5QVVQuaW5kZXhPZih0YXJnZXQudHlwZSkgIT09IC0xKSB8fFxuICAgICAgICAoZXYudHlwZSA9PT0gJ2NoYW5nZScgJiYgVkFMSURfQ0hBTkdFLmluZGV4T2YodGFyZ2V0LnR5cGUpICE9PSAtMSk7XG5cbiAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgICAgaWYgKGV2LnN0YXJ0UHJvcGFnYXRpb24pIHtcbiAgICAgICAgICAgIGV2LnN0YXJ0UHJvcGFnYXRpb24oKVxuICAgICAgICB9XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHZhciB2YWx1ZSA9IGdldEZvcm1EYXRhKGV2LmN1cnJlbnRUYXJnZXQpXG4gICAgdmFyIGRhdGEgPSBleHRlbmQodmFsdWUsIHRoaXMuZGF0YSlcblxuICAgIGJyb2FkY2FzdChkYXRhKVxufVxuIiwidmFyIEJhc2VFdmVudCA9IHJlcXVpcmUoJy4vYmFzZS1ldmVudC5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VFdmVudChjbGlja0xhbWJkYSk7XG5cbmZ1bmN0aW9uIGNsaWNrTGFtYmRhKGV2LCBicm9hZGNhc3QpIHtcbiAgICB2YXIgb3B0cyA9IHRoaXMub3B0cztcblxuICAgIGlmICghb3B0cy5jdHJsICYmIGV2LmN0cmxLZXkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghb3B0cy5tZXRhICYmIGV2Lm1ldGFLZXkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghb3B0cy5yaWdodENsaWNrICYmIGV2LndoaWNoID09PSAyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRzLnByZXZlbnREZWZhdWx0ICYmIGV2LnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgYnJvYWRjYXN0KHRoaXMuZGF0YSk7XG59XG4iLCJ2YXIgQmFzZUV2ZW50ID0gcmVxdWlyZSgnLi9iYXNlLWV2ZW50LmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZUV2ZW50KGV2ZW50TGFtYmRhKTtcblxuZnVuY3Rpb24gZXZlbnRMYW1iZGEoZXYsIGJyb2FkY2FzdCkge1xuICAgIGJyb2FkY2FzdCh0aGlzLmRhdGEpO1xufVxuIiwidmFyIEJhc2VFdmVudCA9IHJlcXVpcmUoJy4vYmFzZS1ldmVudC5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VFdmVudChrZXlMYW1iZGEpO1xuXG5mdW5jdGlvbiBrZXlMYW1iZGEoZXYsIGJyb2FkY2FzdCkge1xuICAgIHZhciBrZXkgPSB0aGlzLm9wdHMua2V5O1xuXG4gICAgaWYgKGV2LmtleUNvZGUgPT09IGtleSkge1xuICAgICAgICBicm9hZGNhc3QodGhpcy5kYXRhKTtcbiAgICB9XG59XG4iLCJ2YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2VcblxubW9kdWxlLmV4cG9ydHMgPSBpdGVyYXRpdmVseVdhbGtcblxuZnVuY3Rpb24gaXRlcmF0aXZlbHlXYWxrKG5vZGVzLCBjYikge1xuICAgIGlmICghKCdsZW5ndGgnIGluIG5vZGVzKSkge1xuICAgICAgICBub2RlcyA9IFtub2Rlc11cbiAgICB9XG4gICAgXG4gICAgbm9kZXMgPSBzbGljZS5jYWxsKG5vZGVzKVxuXG4gICAgd2hpbGUobm9kZXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBub2RlID0gbm9kZXMuc2hpZnQoKSxcbiAgICAgICAgICAgIHJldCA9IGNiKG5vZGUpXG5cbiAgICAgICAgaWYgKHJldCkge1xuICAgICAgICAgICAgcmV0dXJuIHJldFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5vZGUuY2hpbGROb2RlcyAmJiBub2RlLmNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBub2RlcyA9IHNsaWNlLmNhbGwobm9kZS5jaGlsZE5vZGVzKS5jb25jYXQobm9kZXMpXG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJ2YXIgd2FsayA9IHJlcXVpcmUoJ2RvbS13YWxrJylcblxudmFyIEZvcm1EYXRhID0gcmVxdWlyZSgnLi9pbmRleC5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0Rm9ybURhdGFcblxuZnVuY3Rpb24gYnVpbGRFbGVtcyhyb290RWxlbSkge1xuICAgIHZhciBoYXNoID0ge31cbiAgICBpZiAocm9vdEVsZW0ubmFtZSkge1xuICAgIFx0aGFzaFtyb290RWxlbS5uYW1lXSA9IHJvb3RFbGVtXG4gICAgfVxuXG4gICAgd2Fsayhyb290RWxlbSwgZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICAgIGlmIChjaGlsZC5uYW1lKSB7XG4gICAgICAgICAgICBoYXNoW2NoaWxkLm5hbWVdID0gY2hpbGRcbiAgICAgICAgfVxuICAgIH0pXG5cblxuICAgIHJldHVybiBoYXNoXG59XG5cbmZ1bmN0aW9uIGdldEZvcm1EYXRhKHJvb3RFbGVtKSB7XG4gICAgdmFyIGVsZW1lbnRzID0gYnVpbGRFbGVtcyhyb290RWxlbSlcblxuICAgIHJldHVybiBGb3JtRGF0YShlbGVtZW50cylcbn1cbiIsIi8qanNoaW50IG1heGNvbXBsZXhpdHk6IDEwKi9cblxubW9kdWxlLmV4cG9ydHMgPSBGb3JtRGF0YVxuXG4vL1RPRE86IE1hc3NpdmUgc3BlYzogaHR0cDovL3d3dy53aGF0d2cub3JnL3NwZWNzL3dlYi1hcHBzL2N1cnJlbnQtd29yay9tdWx0aXBhZ2UvYXNzb2NpYXRpb24tb2YtY29udHJvbHMtYW5kLWZvcm1zLmh0bWwjY29uc3RydWN0aW5nLWZvcm0tZGF0YS1zZXRcbmZ1bmN0aW9uIEZvcm1EYXRhKGVsZW1lbnRzKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGVsZW1lbnRzKS5yZWR1Y2UoZnVuY3Rpb24gKGFjYywga2V5KSB7XG4gICAgICAgIHZhciBlbGVtID0gZWxlbWVudHNba2V5XVxuXG4gICAgICAgIGFjY1trZXldID0gdmFsdWVPZkVsZW1lbnQoZWxlbSlcblxuICAgICAgICByZXR1cm4gYWNjXG4gICAgfSwge30pXG59XG5cbmZ1bmN0aW9uIHZhbHVlT2ZFbGVtZW50KGVsZW0pIHtcbiAgICBpZiAodHlwZW9mIGVsZW0gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gZWxlbSgpXG4gICAgfSBlbHNlIGlmIChjb250YWluc1JhZGlvKGVsZW0pKSB7XG4gICAgICAgIHZhciBlbGVtcyA9IHRvTGlzdChlbGVtKVxuICAgICAgICB2YXIgY2hlY2tlZCA9IGVsZW1zLmZpbHRlcihmdW5jdGlvbiAoZWxlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW0uY2hlY2tlZFxuICAgICAgICB9KVswXSB8fCBudWxsXG5cbiAgICAgICAgcmV0dXJuIGNoZWNrZWQgPyBjaGVja2VkLnZhbHVlIDogbnVsbFxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShlbGVtKSkge1xuICAgICAgICByZXR1cm4gZWxlbS5tYXAodmFsdWVPZkVsZW1lbnQpLmZpbHRlcihmaWx0ZXJOdWxsKVxuICAgIH0gZWxzZSBpZiAoZWxlbS50YWdOYW1lID09PSB1bmRlZmluZWQgJiYgZWxlbS5ub2RlVHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBGb3JtRGF0YShlbGVtKVxuICAgIH0gZWxzZSBpZiAoZWxlbS50YWdOYW1lID09PSBcIklOUFVUXCIgJiYgaXNDaGVja2VkKGVsZW0pKSB7XG4gICAgICAgIGlmIChlbGVtLmhhc0F0dHJpYnV0ZShcInZhbHVlXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbS5jaGVja2VkID8gZWxlbS52YWx1ZSA6IG51bGxcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtLmNoZWNrZWRcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZWxlbS50YWdOYW1lID09PSBcIklOUFVUXCIpIHtcbiAgICAgICAgcmV0dXJuIGVsZW0udmFsdWVcbiAgICB9IGVsc2UgaWYgKGVsZW0udGFnTmFtZSA9PT0gXCJURVhUQVJFQVwiKSB7XG4gICAgICAgIHJldHVybiBlbGVtLnZhbHVlXG4gICAgfSBlbHNlIGlmIChlbGVtLnRhZ05hbWUgPT09IFwiU0VMRUNUXCIpIHtcbiAgICAgICAgcmV0dXJuIGVsZW0udmFsdWVcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGlzQ2hlY2tlZChlbGVtKSB7XG4gICAgcmV0dXJuIGVsZW0udHlwZSA9PT0gXCJjaGVja2JveFwiIHx8IGVsZW0udHlwZSA9PT0gXCJyYWRpb1wiXG59XG5cbmZ1bmN0aW9uIGNvbnRhaW5zUmFkaW8odmFsdWUpIHtcbiAgICBpZiAodmFsdWUudGFnTmFtZSB8fCB2YWx1ZS5ub2RlVHlwZSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICB2YXIgZWxlbXMgPSB0b0xpc3QodmFsdWUpXG5cbiAgICByZXR1cm4gZWxlbXMuc29tZShmdW5jdGlvbiAoZWxlbSkge1xuICAgICAgICByZXR1cm4gZWxlbS50YWdOYW1lID09PSBcIklOUFVUXCIgJiYgZWxlbS50eXBlID09PSBcInJhZGlvXCJcbiAgICB9KVxufVxuXG5mdW5jdGlvbiB0b0xpc3QodmFsdWUpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgfVxuXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHZhbHVlKS5tYXAocHJvcCwgdmFsdWUpXG59XG5cbmZ1bmN0aW9uIHByb3AoeCkge1xuICAgIHJldHVybiB0aGlzW3hdXG59XG5cbmZ1bmN0aW9uIGZpbHRlck51bGwodmFsKSB7XG4gICAgcmV0dXJuIHZhbCAhPT0gbnVsbFxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBoYXNLZXlzXG5cbmZ1bmN0aW9uIGhhc0tleXMoc291cmNlKSB7XG4gICAgcmV0dXJuIHNvdXJjZSAhPT0gbnVsbCAmJlxuICAgICAgICAodHlwZW9mIHNvdXJjZSA9PT0gXCJvYmplY3RcIiB8fFxuICAgICAgICB0eXBlb2Ygc291cmNlID09PSBcImZ1bmN0aW9uXCIpXG59XG4iLCJ2YXIgaGFzS2V5cyA9IHJlcXVpcmUoXCIuL2hhcy1rZXlzXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gZXh0ZW5kXG5cbmZ1bmN0aW9uIGV4dGVuZCgpIHtcbiAgICB2YXIgdGFyZ2V0ID0ge31cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV1cblxuICAgICAgICBpZiAoIWhhc0tleXMoc291cmNlKSkge1xuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0YXJnZXRcbn1cbiIsInZhciBleHRlbmQgPSByZXF1aXJlKCd4dGVuZCcpXG52YXIgZ2V0Rm9ybURhdGEgPSByZXF1aXJlKCdmb3JtLWRhdGEtc2V0L2VsZW1lbnQnKVxuXG52YXIgQmFzZUV2ZW50ID0gcmVxdWlyZSgnLi9iYXNlLWV2ZW50LmpzJyk7XG5cbnZhciBFTlRFUiA9IDEzXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZUV2ZW50KHN1Ym1pdExhbWJkYSk7XG5cbmZ1bmN0aW9uIHN1Ym1pdExhbWJkYShldiwgYnJvYWRjYXN0KSB7XG4gICAgdmFyIHRhcmdldCA9IGV2LnRhcmdldFxuXG4gICAgdmFyIGlzVmFsaWQgPVxuICAgICAgICAoZXYudHlwZSA9PT0gJ3N1Ym1pdCcgJiYgdGFyZ2V0LnRhZ05hbWUgPT09ICdGT1JNJykgfHxcbiAgICAgICAgKGV2LnR5cGUgPT09ICdjbGljaycgJiYgdGFyZ2V0LnRhZ05hbWUgPT09ICdCVVRUT04nKSB8fFxuICAgICAgICAoZXYudHlwZSA9PT0gJ2NsaWNrJyAmJiB0YXJnZXQudHlwZSA9PT0gJ3N1Ym1pdCcpIHx8XG4gICAgICAgIChcbiAgICAgICAgICAgICh0YXJnZXQudHlwZSA9PT0gJ3RleHQnKSAmJlxuICAgICAgICAgICAgKGV2LmtleUNvZGUgPT09IEVOVEVSICYmIGV2LnR5cGUgPT09ICdrZXlkb3duJylcbiAgICAgICAgKVxuXG4gICAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgICAgIGlmIChldi5zdGFydFByb3BhZ2F0aW9uKSB7XG4gICAgICAgICAgICBldi5zdGFydFByb3BhZ2F0aW9uKClcbiAgICAgICAgfVxuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB2YXIgdmFsdWUgPSBnZXRGb3JtRGF0YShldi5jdXJyZW50VGFyZ2V0KVxuICAgIHZhciBkYXRhID0gZXh0ZW5kKHZhbHVlLCB0aGlzLmRhdGEpXG5cbiAgICBpZiAoZXYucHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG5cbiAgICBicm9hZGNhc3QoZGF0YSk7XG59XG4iLCJ2YXIgZXh0ZW5kID0gcmVxdWlyZSgneHRlbmQnKVxudmFyIGdldEZvcm1EYXRhID0gcmVxdWlyZSgnZm9ybS1kYXRhLXNldC9lbGVtZW50JylcblxudmFyIEJhc2VFdmVudCA9IHJlcXVpcmUoJy4vYmFzZS1ldmVudC5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VFdmVudCh2YWx1ZUxhbWJkYSk7XG5cbmZ1bmN0aW9uIHZhbHVlTGFtYmRhKGV2LCBicm9hZGNhc3QpIHtcbiAgICB2YXIgdmFsdWUgPSBnZXRGb3JtRGF0YShldi5jdXJyZW50VGFyZ2V0KVxuICAgIHZhciBkYXRhID0gZXh0ZW5kKHZhbHVlLCB0aGlzLmRhdGEpXG5cbiAgICBicm9hZGNhc3QoZGF0YSk7XG59XG4iLCJmdW5jdGlvbiBUaHVuayhmbiwgYXJncywga2V5LCBlcUFyZ3MpIHtcclxuICAgIHRoaXMuZm4gPSBmbjtcclxuICAgIHRoaXMuYXJncyA9IGFyZ3M7XHJcbiAgICB0aGlzLmtleSA9IGtleTtcclxuICAgIHRoaXMuZXFBcmdzID0gZXFBcmdzO1xyXG59XHJcblxyXG5UaHVuay5wcm90b3R5cGUudHlwZSA9ICdUaHVuayc7XHJcblRodW5rLnByb3RvdHlwZS5yZW5kZXIgPSByZW5kZXI7XHJcbm1vZHVsZS5leHBvcnRzID0gVGh1bms7XHJcblxyXG5mdW5jdGlvbiBzaG91bGRVcGRhdGUoY3VycmVudCwgcHJldmlvdXMpIHtcclxuICAgIGlmICghY3VycmVudCB8fCAhcHJldmlvdXMgfHwgY3VycmVudC5mbiAhPT0gcHJldmlvdXMuZm4pIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgY2FyZ3MgPSBjdXJyZW50LmFyZ3M7XHJcbiAgICB2YXIgcGFyZ3MgPSBwcmV2aW91cy5hcmdzO1xyXG5cclxuICAgIHJldHVybiAhY3VycmVudC5lcUFyZ3MoY2FyZ3MsIHBhcmdzKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyKHByZXZpb3VzKSB7XHJcbiAgICBpZiAoc2hvdWxkVXBkYXRlKHRoaXMsIHByZXZpb3VzKSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZuLmFwcGx5KG51bGwsIHRoaXMuYXJncyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBwcmV2aW91cy52bm9kZTtcclxuICAgIH1cclxufVxyXG4iLCJ2YXIgUGFydGlhbCA9IHJlcXVpcmUoJy4vcGFydGlhbCcpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQYXJ0aWFsKCk7XHJcbiIsInZhciBzaGFsbG93RXEgPSByZXF1aXJlKCcuL3NoYWxsb3ctZXEnKTtcbnZhciBUaHVuayA9IHJlcXVpcmUoJy4vaW1tdXRhYmxlLXRodW5rJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlUGFydGlhbDtcblxuZnVuY3Rpb24gY3JlYXRlUGFydGlhbChlcSkge1xuICAgIHJldHVybiBmdW5jdGlvbiBwYXJ0aWFsKGZuKSB7XG4gICAgICAgIHZhciBhcmdzID0gY29weU92ZXIoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgdmFyIGZpcnN0QXJnID0gYXJnc1swXTtcbiAgICAgICAgdmFyIGtleTtcblxuICAgICAgICB2YXIgZXFBcmdzID0gZXEgfHwgc2hhbGxvd0VxO1xuXG4gICAgICAgIGlmICh0eXBlb2YgZmlyc3RBcmcgPT09ICdvYmplY3QnICYmIGZpcnN0QXJnICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoJ2tleScgaW4gZmlyc3RBcmcpIHtcbiAgICAgICAgICAgICAgICBrZXkgPSBmaXJzdEFyZy5rZXk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCdpZCcgaW4gZmlyc3RBcmcpIHtcbiAgICAgICAgICAgICAgICBrZXkgPSBmaXJzdEFyZy5pZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgVGh1bmsoZm4sIGFyZ3MsIGtleSwgZXFBcmdzKTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBjb3B5T3ZlcihsaXN0LCBvZmZzZXQpIHtcbiAgICB2YXIgbmV3TGlzdCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSBsaXN0Lmxlbmd0aCAtIDE7IGkgPj0gb2Zmc2V0OyBpLS0pIHtcbiAgICAgICAgbmV3TGlzdFtpIC0gb2Zmc2V0XSA9IGxpc3RbaV07XG4gICAgfVxuICAgIHJldHVybiBuZXdMaXN0O1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBzaGFsbG93RXE7XHJcblxyXG5mdW5jdGlvbiBzaGFsbG93RXEoY3VycmVudEFyZ3MsIHByZXZpb3VzQXJncykge1xyXG4gICAgaWYgKGN1cnJlbnRBcmdzLmxlbmd0aCA9PT0gMCAmJiBwcmV2aW91c0FyZ3MubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGN1cnJlbnRBcmdzLmxlbmd0aCAhPT0gcHJldmlvdXNBcmdzLmxlbmd0aCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbGVuID0gY3VycmVudEFyZ3MubGVuZ3RoO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICBpZiAoY3VycmVudEFyZ3NbaV0gIT09IHByZXZpb3VzQXJnc1tpXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcbiIsIi8qIVxuICogQ3Jvc3MtQnJvd3NlciBTcGxpdCAxLjEuMVxuICogQ29weXJpZ2h0IDIwMDctMjAxMiBTdGV2ZW4gTGV2aXRoYW4gPHN0ZXZlbmxldml0aGFuLmNvbT5cbiAqIEF2YWlsYWJsZSB1bmRlciB0aGUgTUlUIExpY2Vuc2VcbiAqIEVDTUFTY3JpcHQgY29tcGxpYW50LCB1bmlmb3JtIGNyb3NzLWJyb3dzZXIgc3BsaXQgbWV0aG9kXG4gKi9cblxuLyoqXG4gKiBTcGxpdHMgYSBzdHJpbmcgaW50byBhbiBhcnJheSBvZiBzdHJpbmdzIHVzaW5nIGEgcmVnZXggb3Igc3RyaW5nIHNlcGFyYXRvci4gTWF0Y2hlcyBvZiB0aGVcbiAqIHNlcGFyYXRvciBhcmUgbm90IGluY2x1ZGVkIGluIHRoZSByZXN1bHQgYXJyYXkuIEhvd2V2ZXIsIGlmIGBzZXBhcmF0b3JgIGlzIGEgcmVnZXggdGhhdCBjb250YWluc1xuICogY2FwdHVyaW5nIGdyb3VwcywgYmFja3JlZmVyZW5jZXMgYXJlIHNwbGljZWQgaW50byB0aGUgcmVzdWx0IGVhY2ggdGltZSBgc2VwYXJhdG9yYCBpcyBtYXRjaGVkLlxuICogRml4ZXMgYnJvd3NlciBidWdzIGNvbXBhcmVkIHRvIHRoZSBuYXRpdmUgYFN0cmluZy5wcm90b3R5cGUuc3BsaXRgIGFuZCBjYW4gYmUgdXNlZCByZWxpYWJseVxuICogY3Jvc3MtYnJvd3Nlci5cbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgU3RyaW5nIHRvIHNwbGl0LlxuICogQHBhcmFtIHtSZWdFeHB8U3RyaW5nfSBzZXBhcmF0b3IgUmVnZXggb3Igc3RyaW5nIHRvIHVzZSBmb3Igc2VwYXJhdGluZyB0aGUgc3RyaW5nLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtsaW1pdF0gTWF4aW11bSBudW1iZXIgb2YgaXRlbXMgdG8gaW5jbHVkZSBpbiB0aGUgcmVzdWx0IGFycmF5LlxuICogQHJldHVybnMge0FycmF5fSBBcnJheSBvZiBzdWJzdHJpbmdzLlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBCYXNpYyB1c2VcbiAqIHNwbGl0KCdhIGIgYyBkJywgJyAnKTtcbiAqIC8vIC0+IFsnYScsICdiJywgJ2MnLCAnZCddXG4gKlxuICogLy8gV2l0aCBsaW1pdFxuICogc3BsaXQoJ2EgYiBjIGQnLCAnICcsIDIpO1xuICogLy8gLT4gWydhJywgJ2InXVxuICpcbiAqIC8vIEJhY2tyZWZlcmVuY2VzIGluIHJlc3VsdCBhcnJheVxuICogc3BsaXQoJy4ud29yZDEgd29yZDIuLicsIC8oW2Etel0rKShcXGQrKS9pKTtcbiAqIC8vIC0+IFsnLi4nLCAnd29yZCcsICcxJywgJyAnLCAnd29yZCcsICcyJywgJy4uJ11cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gc3BsaXQodW5kZWYpIHtcblxuICB2YXIgbmF0aXZlU3BsaXQgPSBTdHJpbmcucHJvdG90eXBlLnNwbGl0LFxuICAgIGNvbXBsaWFudEV4ZWNOcGNnID0gLygpPz8vLmV4ZWMoXCJcIilbMV0gPT09IHVuZGVmLFxuICAgIC8vIE5QQ0c6IG5vbnBhcnRpY2lwYXRpbmcgY2FwdHVyaW5nIGdyb3VwXG4gICAgc2VsZjtcblxuICBzZWxmID0gZnVuY3Rpb24oc3RyLCBzZXBhcmF0b3IsIGxpbWl0KSB7XG4gICAgLy8gSWYgYHNlcGFyYXRvcmAgaXMgbm90IGEgcmVnZXgsIHVzZSBgbmF0aXZlU3BsaXRgXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzZXBhcmF0b3IpICE9PSBcIltvYmplY3QgUmVnRXhwXVwiKSB7XG4gICAgICByZXR1cm4gbmF0aXZlU3BsaXQuY2FsbChzdHIsIHNlcGFyYXRvciwgbGltaXQpO1xuICAgIH1cbiAgICB2YXIgb3V0cHV0ID0gW10sXG4gICAgICBmbGFncyA9IChzZXBhcmF0b3IuaWdub3JlQ2FzZSA/IFwiaVwiIDogXCJcIikgKyAoc2VwYXJhdG9yLm11bHRpbGluZSA/IFwibVwiIDogXCJcIikgKyAoc2VwYXJhdG9yLmV4dGVuZGVkID8gXCJ4XCIgOiBcIlwiKSArIC8vIFByb3Bvc2VkIGZvciBFUzZcbiAgICAgIChzZXBhcmF0b3Iuc3RpY2t5ID8gXCJ5XCIgOiBcIlwiKSxcbiAgICAgIC8vIEZpcmVmb3ggMytcbiAgICAgIGxhc3RMYXN0SW5kZXggPSAwLFxuICAgICAgLy8gTWFrZSBgZ2xvYmFsYCBhbmQgYXZvaWQgYGxhc3RJbmRleGAgaXNzdWVzIGJ5IHdvcmtpbmcgd2l0aCBhIGNvcHlcbiAgICAgIHNlcGFyYXRvciA9IG5ldyBSZWdFeHAoc2VwYXJhdG9yLnNvdXJjZSwgZmxhZ3MgKyBcImdcIiksXG4gICAgICBzZXBhcmF0b3IyLCBtYXRjaCwgbGFzdEluZGV4LCBsYXN0TGVuZ3RoO1xuICAgIHN0ciArPSBcIlwiOyAvLyBUeXBlLWNvbnZlcnRcbiAgICBpZiAoIWNvbXBsaWFudEV4ZWNOcGNnKSB7XG4gICAgICAvLyBEb2Vzbid0IG5lZWQgZmxhZ3MgZ3ksIGJ1dCB0aGV5IGRvbid0IGh1cnRcbiAgICAgIHNlcGFyYXRvcjIgPSBuZXcgUmVnRXhwKFwiXlwiICsgc2VwYXJhdG9yLnNvdXJjZSArIFwiJCg/IVxcXFxzKVwiLCBmbGFncyk7XG4gICAgfVxuICAgIC8qIFZhbHVlcyBmb3IgYGxpbWl0YCwgcGVyIHRoZSBzcGVjOlxuICAgICAqIElmIHVuZGVmaW5lZDogNDI5NDk2NzI5NSAvLyBNYXRoLnBvdygyLCAzMikgLSAxXG4gICAgICogSWYgMCwgSW5maW5pdHksIG9yIE5hTjogMFxuICAgICAqIElmIHBvc2l0aXZlIG51bWJlcjogbGltaXQgPSBNYXRoLmZsb29yKGxpbWl0KTsgaWYgKGxpbWl0ID4gNDI5NDk2NzI5NSkgbGltaXQgLT0gNDI5NDk2NzI5NjtcbiAgICAgKiBJZiBuZWdhdGl2ZSBudW1iZXI6IDQyOTQ5NjcyOTYgLSBNYXRoLmZsb29yKE1hdGguYWJzKGxpbWl0KSlcbiAgICAgKiBJZiBvdGhlcjogVHlwZS1jb252ZXJ0LCB0aGVuIHVzZSB0aGUgYWJvdmUgcnVsZXNcbiAgICAgKi9cbiAgICBsaW1pdCA9IGxpbWl0ID09PSB1bmRlZiA/IC0xID4+PiAwIDogLy8gTWF0aC5wb3coMiwgMzIpIC0gMVxuICAgIGxpbWl0ID4+PiAwOyAvLyBUb1VpbnQzMihsaW1pdClcbiAgICB3aGlsZSAobWF0Y2ggPSBzZXBhcmF0b3IuZXhlYyhzdHIpKSB7XG4gICAgICAvLyBgc2VwYXJhdG9yLmxhc3RJbmRleGAgaXMgbm90IHJlbGlhYmxlIGNyb3NzLWJyb3dzZXJcbiAgICAgIGxhc3RJbmRleCA9IG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoO1xuICAgICAgaWYgKGxhc3RJbmRleCA+IGxhc3RMYXN0SW5kZXgpIHtcbiAgICAgICAgb3V0cHV0LnB1c2goc3RyLnNsaWNlKGxhc3RMYXN0SW5kZXgsIG1hdGNoLmluZGV4KSk7XG4gICAgICAgIC8vIEZpeCBicm93c2VycyB3aG9zZSBgZXhlY2AgbWV0aG9kcyBkb24ndCBjb25zaXN0ZW50bHkgcmV0dXJuIGB1bmRlZmluZWRgIGZvclxuICAgICAgICAvLyBub25wYXJ0aWNpcGF0aW5nIGNhcHR1cmluZyBncm91cHNcbiAgICAgICAgaWYgKCFjb21wbGlhbnRFeGVjTnBjZyAmJiBtYXRjaC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgbWF0Y2hbMF0ucmVwbGFjZShzZXBhcmF0b3IyLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aCAtIDI7IGkrKykge1xuICAgICAgICAgICAgICBpZiAoYXJndW1lbnRzW2ldID09PSB1bmRlZikge1xuICAgICAgICAgICAgICAgIG1hdGNoW2ldID0gdW5kZWY7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWF0Y2gubGVuZ3RoID4gMSAmJiBtYXRjaC5pbmRleCA8IHN0ci5sZW5ndGgpIHtcbiAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShvdXRwdXQsIG1hdGNoLnNsaWNlKDEpKTtcbiAgICAgICAgfVxuICAgICAgICBsYXN0TGVuZ3RoID0gbWF0Y2hbMF0ubGVuZ3RoO1xuICAgICAgICBsYXN0TGFzdEluZGV4ID0gbGFzdEluZGV4O1xuICAgICAgICBpZiAob3V0cHV0Lmxlbmd0aCA+PSBsaW1pdCkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc2VwYXJhdG9yLmxhc3RJbmRleCA9PT0gbWF0Y2guaW5kZXgpIHtcbiAgICAgICAgc2VwYXJhdG9yLmxhc3RJbmRleCsrOyAvLyBBdm9pZCBhbiBpbmZpbml0ZSBsb29wXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChsYXN0TGFzdEluZGV4ID09PSBzdHIubGVuZ3RoKSB7XG4gICAgICBpZiAobGFzdExlbmd0aCB8fCAhc2VwYXJhdG9yLnRlc3QoXCJcIikpIHtcbiAgICAgICAgb3V0cHV0LnB1c2goXCJcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dC5wdXNoKHN0ci5zbGljZShsYXN0TGFzdEluZGV4KSk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQubGVuZ3RoID4gbGltaXQgPyBvdXRwdXQuc2xpY2UoMCwgbGltaXQpIDogb3V0cHV0O1xuICB9O1xuXG4gIHJldHVybiBzZWxmO1xufSkoKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLypnbG9iYWwgd2luZG93LCBnbG9iYWwqL1xuXG52YXIgcm9vdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID9cbiAgICB3aW5kb3cgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/XG4gICAgZ2xvYmFsIDoge307XG5cbm1vZHVsZS5leHBvcnRzID0gSW5kaXZpZHVhbDtcblxuZnVuY3Rpb24gSW5kaXZpZHVhbChrZXksIHZhbHVlKSB7XG4gICAgaWYgKGtleSBpbiByb290KSB7XG4gICAgICAgIHJldHVybiByb290W2tleV07XG4gICAgfVxuXG4gICAgcm9vdFtrZXldID0gdmFsdWU7XG5cbiAgICByZXR1cm4gdmFsdWU7XG59XG4iLCJ2YXIgdG9wTGV2ZWwgPSB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6XG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB7fVxudmFyIG1pbkRvYyA9IHJlcXVpcmUoJ21pbi1kb2N1bWVudCcpO1xuXG5pZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZG9jdW1lbnQ7XG59IGVsc2Uge1xuICAgIHZhciBkb2NjeSA9IHRvcExldmVsWydfX0dMT0JBTF9ET0NVTUVOVF9DQUNIRUA0J107XG5cbiAgICBpZiAoIWRvY2N5KSB7XG4gICAgICAgIGRvY2N5ID0gdG9wTGV2ZWxbJ19fR0xPQkFMX0RPQ1VNRU5UX0NBQ0hFQDQnXSA9IG1pbkRvYztcbiAgICB9XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGRvY2N5O1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNPYmplY3QoeCkge1xuXHRyZXR1cm4gdHlwZW9mIHggPT09IFwib2JqZWN0XCIgJiYgeCAhPT0gbnVsbDtcbn07XG4iLCJ2YXIgbmF0aXZlSXNBcnJheSA9IEFycmF5LmlzQXJyYXlcbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdcblxubW9kdWxlLmV4cG9ydHMgPSBuYXRpdmVJc0FycmF5IHx8IGlzQXJyYXlcblxuZnVuY3Rpb24gaXNBcnJheShvYmopIHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09PSBcIltvYmplY3QgQXJyYXldXCJcbn1cbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoXCJpcy1vYmplY3RcIilcbnZhciBpc0hvb2sgPSByZXF1aXJlKFwiLi4vdm5vZGUvaXMtdmhvb2suanNcIilcblxubW9kdWxlLmV4cG9ydHMgPSBhcHBseVByb3BlcnRpZXNcblxuZnVuY3Rpb24gYXBwbHlQcm9wZXJ0aWVzKG5vZGUsIHByb3BzLCBwcmV2aW91cykge1xuICAgIGZvciAodmFyIHByb3BOYW1lIGluIHByb3BzKSB7XG4gICAgICAgIHZhciBwcm9wVmFsdWUgPSBwcm9wc1twcm9wTmFtZV1cblxuICAgICAgICBpZiAocHJvcFZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJlbW92ZVByb3BlcnR5KG5vZGUsIHByb3BOYW1lLCBwcm9wVmFsdWUsIHByZXZpb3VzKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0hvb2socHJvcFZhbHVlKSkge1xuICAgICAgICAgICAgcmVtb3ZlUHJvcGVydHkobm9kZSwgcHJvcE5hbWUsIHByb3BWYWx1ZSwgcHJldmlvdXMpXG4gICAgICAgICAgICBpZiAocHJvcFZhbHVlLmhvb2spIHtcbiAgICAgICAgICAgICAgICBwcm9wVmFsdWUuaG9vayhub2RlLFxuICAgICAgICAgICAgICAgICAgICBwcm9wTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgcHJldmlvdXMgPyBwcmV2aW91c1twcm9wTmFtZV0gOiB1bmRlZmluZWQpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoaXNPYmplY3QocHJvcFZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoT2JqZWN0KG5vZGUsIHByb3BzLCBwcmV2aW91cywgcHJvcE5hbWUsIHByb3BWYWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5vZGVbcHJvcE5hbWVdID0gcHJvcFZhbHVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVByb3BlcnR5KG5vZGUsIHByb3BOYW1lLCBwcm9wVmFsdWUsIHByZXZpb3VzKSB7XG4gICAgaWYgKHByZXZpb3VzKSB7XG4gICAgICAgIHZhciBwcmV2aW91c1ZhbHVlID0gcHJldmlvdXNbcHJvcE5hbWVdXG5cbiAgICAgICAgaWYgKCFpc0hvb2socHJldmlvdXNWYWx1ZSkpIHtcbiAgICAgICAgICAgIGlmIChwcm9wTmFtZSA9PT0gXCJhdHRyaWJ1dGVzXCIpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBhdHRyTmFtZSBpbiBwcmV2aW91c1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKGF0dHJOYW1lKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcE5hbWUgPT09IFwic3R5bGVcIikge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gcHJldmlvdXNWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBub2RlLnN0eWxlW2ldID0gXCJcIlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHByZXZpb3VzVmFsdWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBub2RlW3Byb3BOYW1lXSA9IFwiXCJcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbm9kZVtwcm9wTmFtZV0gPSBudWxsXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocHJldmlvdXNWYWx1ZS51bmhvb2spIHtcbiAgICAgICAgICAgIHByZXZpb3VzVmFsdWUudW5ob29rKG5vZGUsIHByb3BOYW1lLCBwcm9wVmFsdWUpXG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhdGNoT2JqZWN0KG5vZGUsIHByb3BzLCBwcmV2aW91cywgcHJvcE5hbWUsIHByb3BWYWx1ZSkge1xuICAgIHZhciBwcmV2aW91c1ZhbHVlID0gcHJldmlvdXMgPyBwcmV2aW91c1twcm9wTmFtZV0gOiB1bmRlZmluZWRcblxuICAgIC8vIFNldCBhdHRyaWJ1dGVzXG4gICAgaWYgKHByb3BOYW1lID09PSBcImF0dHJpYnV0ZXNcIikge1xuICAgICAgICBmb3IgKHZhciBhdHRyTmFtZSBpbiBwcm9wVmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBhdHRyVmFsdWUgPSBwcm9wVmFsdWVbYXR0ck5hbWVdXG5cbiAgICAgICAgICAgIGlmIChhdHRyVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKGF0dHJOYW1lKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgYXR0clZhbHVlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYocHJldmlvdXNWYWx1ZSAmJiBpc09iamVjdChwcmV2aW91c1ZhbHVlKSAmJlxuICAgICAgICBnZXRQcm90b3R5cGUocHJldmlvdXNWYWx1ZSkgIT09IGdldFByb3RvdHlwZShwcm9wVmFsdWUpKSB7XG4gICAgICAgIG5vZGVbcHJvcE5hbWVdID0gcHJvcFZhbHVlXG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICghaXNPYmplY3Qobm9kZVtwcm9wTmFtZV0pKSB7XG4gICAgICAgIG5vZGVbcHJvcE5hbWVdID0ge31cbiAgICB9XG5cbiAgICB2YXIgcmVwbGFjZXIgPSBwcm9wTmFtZSA9PT0gXCJzdHlsZVwiID8gXCJcIiA6IHVuZGVmaW5lZFxuXG4gICAgZm9yICh2YXIgayBpbiBwcm9wVmFsdWUpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gcHJvcFZhbHVlW2tdXG4gICAgICAgIG5vZGVbcHJvcE5hbWVdW2tdID0gKHZhbHVlID09PSB1bmRlZmluZWQpID8gcmVwbGFjZXIgOiB2YWx1ZVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0UHJvdG90eXBlKHZhbHVlKSB7XG4gICAgaWYgKE9iamVjdC5nZXRQcm90b3R5cGVPZikge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlKVxuICAgIH0gZWxzZSBpZiAodmFsdWUuX19wcm90b19fKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZS5fX3Byb3RvX19cbiAgICB9IGVsc2UgaWYgKHZhbHVlLmNvbnN0cnVjdG9yKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGVcbiAgICB9XG59XG4iLCJ2YXIgZG9jdW1lbnQgPSByZXF1aXJlKFwiZ2xvYmFsL2RvY3VtZW50XCIpXG5cbnZhciBhcHBseVByb3BlcnRpZXMgPSByZXF1aXJlKFwiLi9hcHBseS1wcm9wZXJ0aWVzXCIpXG5cbnZhciBpc1ZOb2RlID0gcmVxdWlyZShcIi4uL3Zub2RlL2lzLXZub2RlLmpzXCIpXG52YXIgaXNWVGV4dCA9IHJlcXVpcmUoXCIuLi92bm9kZS9pcy12dGV4dC5qc1wiKVxudmFyIGlzV2lkZ2V0ID0gcmVxdWlyZShcIi4uL3Zub2RlL2lzLXdpZGdldC5qc1wiKVxudmFyIGhhbmRsZVRodW5rID0gcmVxdWlyZShcIi4uL3Zub2RlL2hhbmRsZS10aHVuay5qc1wiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUVsZW1lbnRcblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudCh2bm9kZSwgb3B0cykge1xuICAgIHZhciBkb2MgPSBvcHRzID8gb3B0cy5kb2N1bWVudCB8fCBkb2N1bWVudCA6IGRvY3VtZW50XG4gICAgdmFyIHdhcm4gPSBvcHRzID8gb3B0cy53YXJuIDogbnVsbFxuXG4gICAgdm5vZGUgPSBoYW5kbGVUaHVuayh2bm9kZSkuYVxuXG4gICAgaWYgKGlzV2lkZ2V0KHZub2RlKSkge1xuICAgICAgICByZXR1cm4gdm5vZGUuaW5pdCgpXG4gICAgfSBlbHNlIGlmIChpc1ZUZXh0KHZub2RlKSkge1xuICAgICAgICByZXR1cm4gZG9jLmNyZWF0ZVRleHROb2RlKHZub2RlLnRleHQpXG4gICAgfSBlbHNlIGlmICghaXNWTm9kZSh2bm9kZSkpIHtcbiAgICAgICAgaWYgKHdhcm4pIHtcbiAgICAgICAgICAgIHdhcm4oXCJJdGVtIGlzIG5vdCBhIHZhbGlkIHZpcnR1YWwgZG9tIG5vZGVcIiwgdm5vZGUpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG5cbiAgICB2YXIgbm9kZSA9ICh2bm9kZS5uYW1lc3BhY2UgPT09IG51bGwpID9cbiAgICAgICAgZG9jLmNyZWF0ZUVsZW1lbnQodm5vZGUudGFnTmFtZSkgOlxuICAgICAgICBkb2MuY3JlYXRlRWxlbWVudE5TKHZub2RlLm5hbWVzcGFjZSwgdm5vZGUudGFnTmFtZSlcblxuICAgIHZhciBwcm9wcyA9IHZub2RlLnByb3BlcnRpZXNcbiAgICBhcHBseVByb3BlcnRpZXMobm9kZSwgcHJvcHMpXG5cbiAgICB2YXIgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlblxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgY2hpbGROb2RlID0gY3JlYXRlRWxlbWVudChjaGlsZHJlbltpXSwgb3B0cylcbiAgICAgICAgaWYgKGNoaWxkTm9kZSkge1xuICAgICAgICAgICAgbm9kZS5hcHBlbmRDaGlsZChjaGlsZE5vZGUpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbm9kZVxufVxuIiwiLy8gTWFwcyBhIHZpcnR1YWwgRE9NIHRyZWUgb250byBhIHJlYWwgRE9NIHRyZWUgaW4gYW4gZWZmaWNpZW50IG1hbm5lci5cbi8vIFdlIGRvbid0IHdhbnQgdG8gcmVhZCBhbGwgb2YgdGhlIERPTSBub2RlcyBpbiB0aGUgdHJlZSBzbyB3ZSB1c2Vcbi8vIHRoZSBpbi1vcmRlciB0cmVlIGluZGV4aW5nIHRvIGVsaW1pbmF0ZSByZWN1cnNpb24gZG93biBjZXJ0YWluIGJyYW5jaGVzLlxuLy8gV2Ugb25seSByZWN1cnNlIGludG8gYSBET00gbm9kZSBpZiB3ZSBrbm93IHRoYXQgaXQgY29udGFpbnMgYSBjaGlsZCBvZlxuLy8gaW50ZXJlc3QuXG5cbnZhciBub0NoaWxkID0ge31cblxubW9kdWxlLmV4cG9ydHMgPSBkb21JbmRleFxuXG5mdW5jdGlvbiBkb21JbmRleChyb290Tm9kZSwgdHJlZSwgaW5kaWNlcywgbm9kZXMpIHtcbiAgICBpZiAoIWluZGljZXMgfHwgaW5kaWNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHt9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaW5kaWNlcy5zb3J0KGFzY2VuZGluZylcbiAgICAgICAgcmV0dXJuIHJlY3Vyc2Uocm9vdE5vZGUsIHRyZWUsIGluZGljZXMsIG5vZGVzLCAwKVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVjdXJzZShyb290Tm9kZSwgdHJlZSwgaW5kaWNlcywgbm9kZXMsIHJvb3RJbmRleCkge1xuICAgIG5vZGVzID0gbm9kZXMgfHwge31cblxuXG4gICAgaWYgKHJvb3ROb2RlKSB7XG4gICAgICAgIGlmIChpbmRleEluUmFuZ2UoaW5kaWNlcywgcm9vdEluZGV4LCByb290SW5kZXgpKSB7XG4gICAgICAgICAgICBub2Rlc1tyb290SW5kZXhdID0gcm9vdE5vZGVcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB2Q2hpbGRyZW4gPSB0cmVlLmNoaWxkcmVuXG5cbiAgICAgICAgaWYgKHZDaGlsZHJlbikge1xuXG4gICAgICAgICAgICB2YXIgY2hpbGROb2RlcyA9IHJvb3ROb2RlLmNoaWxkTm9kZXNcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmVlLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcm9vdEluZGV4ICs9IDFcblxuICAgICAgICAgICAgICAgIHZhciB2Q2hpbGQgPSB2Q2hpbGRyZW5baV0gfHwgbm9DaGlsZFxuICAgICAgICAgICAgICAgIHZhciBuZXh0SW5kZXggPSByb290SW5kZXggKyAodkNoaWxkLmNvdW50IHx8IDApXG5cbiAgICAgICAgICAgICAgICAvLyBza2lwIHJlY3Vyc2lvbiBkb3duIHRoZSB0cmVlIGlmIHRoZXJlIGFyZSBubyBub2RlcyBkb3duIGhlcmVcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXhJblJhbmdlKGluZGljZXMsIHJvb3RJbmRleCwgbmV4dEluZGV4KSkge1xuICAgICAgICAgICAgICAgICAgICByZWN1cnNlKGNoaWxkTm9kZXNbaV0sIHZDaGlsZCwgaW5kaWNlcywgbm9kZXMsIHJvb3RJbmRleClcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByb290SW5kZXggPSBuZXh0SW5kZXhcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBub2Rlc1xufVxuXG4vLyBCaW5hcnkgc2VhcmNoIGZvciBhbiBpbmRleCBpbiB0aGUgaW50ZXJ2YWwgW2xlZnQsIHJpZ2h0XVxuZnVuY3Rpb24gaW5kZXhJblJhbmdlKGluZGljZXMsIGxlZnQsIHJpZ2h0KSB7XG4gICAgaWYgKGluZGljZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHZhciBtaW5JbmRleCA9IDBcbiAgICB2YXIgbWF4SW5kZXggPSBpbmRpY2VzLmxlbmd0aCAtIDFcbiAgICB2YXIgY3VycmVudEluZGV4XG4gICAgdmFyIGN1cnJlbnRJdGVtXG5cbiAgICB3aGlsZSAobWluSW5kZXggPD0gbWF4SW5kZXgpIHtcbiAgICAgICAgY3VycmVudEluZGV4ID0gKChtYXhJbmRleCArIG1pbkluZGV4KSAvIDIpID4+IDBcbiAgICAgICAgY3VycmVudEl0ZW0gPSBpbmRpY2VzW2N1cnJlbnRJbmRleF1cblxuICAgICAgICBpZiAobWluSW5kZXggPT09IG1heEluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gY3VycmVudEl0ZW0gPj0gbGVmdCAmJiBjdXJyZW50SXRlbSA8PSByaWdodFxuICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRJdGVtIDwgbGVmdCkge1xuICAgICAgICAgICAgbWluSW5kZXggPSBjdXJyZW50SW5kZXggKyAxXG4gICAgICAgIH0gZWxzZSAgaWYgKGN1cnJlbnRJdGVtID4gcmlnaHQpIHtcbiAgICAgICAgICAgIG1heEluZGV4ID0gY3VycmVudEluZGV4IC0gMVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gYXNjZW5kaW5nKGEsIGIpIHtcbiAgICByZXR1cm4gYSA+IGIgPyAxIDogLTFcbn1cbiIsInZhciBhcHBseVByb3BlcnRpZXMgPSByZXF1aXJlKFwiLi9hcHBseS1wcm9wZXJ0aWVzXCIpXG5cbnZhciBpc1dpZGdldCA9IHJlcXVpcmUoXCIuLi92bm9kZS9pcy13aWRnZXQuanNcIilcbnZhciBWUGF0Y2ggPSByZXF1aXJlKFwiLi4vdm5vZGUvdnBhdGNoLmpzXCIpXG5cbnZhciByZW5kZXIgPSByZXF1aXJlKFwiLi9jcmVhdGUtZWxlbWVudFwiKVxudmFyIHVwZGF0ZVdpZGdldCA9IHJlcXVpcmUoXCIuL3VwZGF0ZS13aWRnZXRcIilcblxubW9kdWxlLmV4cG9ydHMgPSBhcHBseVBhdGNoXG5cbmZ1bmN0aW9uIGFwcGx5UGF0Y2godnBhdGNoLCBkb21Ob2RlLCByZW5kZXJPcHRpb25zKSB7XG4gICAgdmFyIHR5cGUgPSB2cGF0Y2gudHlwZVxuICAgIHZhciB2Tm9kZSA9IHZwYXRjaC52Tm9kZVxuICAgIHZhciBwYXRjaCA9IHZwYXRjaC5wYXRjaFxuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgVlBhdGNoLlJFTU9WRTpcbiAgICAgICAgICAgIHJldHVybiByZW1vdmVOb2RlKGRvbU5vZGUsIHZOb2RlKVxuICAgICAgICBjYXNlIFZQYXRjaC5JTlNFUlQ6XG4gICAgICAgICAgICByZXR1cm4gaW5zZXJ0Tm9kZShkb21Ob2RlLCBwYXRjaCwgcmVuZGVyT3B0aW9ucylcbiAgICAgICAgY2FzZSBWUGF0Y2guVlRFWFQ6XG4gICAgICAgICAgICByZXR1cm4gc3RyaW5nUGF0Y2goZG9tTm9kZSwgdk5vZGUsIHBhdGNoLCByZW5kZXJPcHRpb25zKVxuICAgICAgICBjYXNlIFZQYXRjaC5XSURHRVQ6XG4gICAgICAgICAgICByZXR1cm4gd2lkZ2V0UGF0Y2goZG9tTm9kZSwgdk5vZGUsIHBhdGNoLCByZW5kZXJPcHRpb25zKVxuICAgICAgICBjYXNlIFZQYXRjaC5WTk9ERTpcbiAgICAgICAgICAgIHJldHVybiB2Tm9kZVBhdGNoKGRvbU5vZGUsIHZOb2RlLCBwYXRjaCwgcmVuZGVyT3B0aW9ucylcbiAgICAgICAgY2FzZSBWUGF0Y2guT1JERVI6XG4gICAgICAgICAgICByZW9yZGVyQ2hpbGRyZW4oZG9tTm9kZSwgcGF0Y2gpXG4gICAgICAgICAgICByZXR1cm4gZG9tTm9kZVxuICAgICAgICBjYXNlIFZQYXRjaC5QUk9QUzpcbiAgICAgICAgICAgIGFwcGx5UHJvcGVydGllcyhkb21Ob2RlLCBwYXRjaCwgdk5vZGUucHJvcGVydGllcylcbiAgICAgICAgICAgIHJldHVybiBkb21Ob2RlXG4gICAgICAgIGNhc2UgVlBhdGNoLlRIVU5LOlxuICAgICAgICAgICAgcmV0dXJuIHJlcGxhY2VSb290KGRvbU5vZGUsXG4gICAgICAgICAgICAgICAgcmVuZGVyT3B0aW9ucy5wYXRjaChkb21Ob2RlLCBwYXRjaCwgcmVuZGVyT3B0aW9ucykpXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gZG9tTm9kZVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlTm9kZShkb21Ob2RlLCB2Tm9kZSkge1xuICAgIHZhciBwYXJlbnROb2RlID0gZG9tTm9kZS5wYXJlbnROb2RlXG5cbiAgICBpZiAocGFyZW50Tm9kZSkge1xuICAgICAgICBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKGRvbU5vZGUpXG4gICAgfVxuXG4gICAgZGVzdHJveVdpZGdldChkb21Ob2RlLCB2Tm9kZSk7XG5cbiAgICByZXR1cm4gbnVsbFxufVxuXG5mdW5jdGlvbiBpbnNlcnROb2RlKHBhcmVudE5vZGUsIHZOb2RlLCByZW5kZXJPcHRpb25zKSB7XG4gICAgdmFyIG5ld05vZGUgPSByZW5kZXIodk5vZGUsIHJlbmRlck9wdGlvbnMpXG5cbiAgICBpZiAocGFyZW50Tm9kZSkge1xuICAgICAgICBwYXJlbnROb2RlLmFwcGVuZENoaWxkKG5ld05vZGUpXG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcmVudE5vZGVcbn1cblxuZnVuY3Rpb24gc3RyaW5nUGF0Y2goZG9tTm9kZSwgbGVmdFZOb2RlLCB2VGV4dCwgcmVuZGVyT3B0aW9ucykge1xuICAgIHZhciBuZXdOb2RlXG5cbiAgICBpZiAoZG9tTm9kZS5ub2RlVHlwZSA9PT0gMykge1xuICAgICAgICBkb21Ob2RlLnJlcGxhY2VEYXRhKDAsIGRvbU5vZGUubGVuZ3RoLCB2VGV4dC50ZXh0KVxuICAgICAgICBuZXdOb2RlID0gZG9tTm9kZVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBwYXJlbnROb2RlID0gZG9tTm9kZS5wYXJlbnROb2RlXG4gICAgICAgIG5ld05vZGUgPSByZW5kZXIodlRleHQsIHJlbmRlck9wdGlvbnMpXG5cbiAgICAgICAgaWYgKHBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgIHBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG5ld05vZGUsIGRvbU5vZGUpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV3Tm9kZVxufVxuXG5mdW5jdGlvbiB3aWRnZXRQYXRjaChkb21Ob2RlLCBsZWZ0Vk5vZGUsIHdpZGdldCwgcmVuZGVyT3B0aW9ucykge1xuICAgIHZhciB1cGRhdGluZyA9IHVwZGF0ZVdpZGdldChsZWZ0Vk5vZGUsIHdpZGdldClcbiAgICB2YXIgbmV3Tm9kZVxuXG4gICAgaWYgKHVwZGF0aW5nKSB7XG4gICAgICAgIG5ld05vZGUgPSB3aWRnZXQudXBkYXRlKGxlZnRWTm9kZSwgZG9tTm9kZSkgfHwgZG9tTm9kZVxuICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld05vZGUgPSByZW5kZXIod2lkZ2V0LCByZW5kZXJPcHRpb25zKVxuICAgIH1cblxuICAgIHZhciBwYXJlbnROb2RlID0gZG9tTm9kZS5wYXJlbnROb2RlXG5cbiAgICBpZiAocGFyZW50Tm9kZSAmJiBuZXdOb2RlICE9PSBkb21Ob2RlKSB7XG4gICAgICAgIHBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG5ld05vZGUsIGRvbU5vZGUpXG4gICAgfVxuXG4gICAgaWYgKCF1cGRhdGluZykge1xuICAgICAgICBkZXN0cm95V2lkZ2V0KGRvbU5vZGUsIGxlZnRWTm9kZSlcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3Tm9kZVxufVxuXG5mdW5jdGlvbiB2Tm9kZVBhdGNoKGRvbU5vZGUsIGxlZnRWTm9kZSwgdk5vZGUsIHJlbmRlck9wdGlvbnMpIHtcbiAgICB2YXIgcGFyZW50Tm9kZSA9IGRvbU5vZGUucGFyZW50Tm9kZVxuICAgIHZhciBuZXdOb2RlID0gcmVuZGVyKHZOb2RlLCByZW5kZXJPcHRpb25zKVxuXG4gICAgaWYgKHBhcmVudE5vZGUpIHtcbiAgICAgICAgcGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobmV3Tm9kZSwgZG9tTm9kZSlcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3Tm9kZVxufVxuXG5mdW5jdGlvbiBkZXN0cm95V2lkZ2V0KGRvbU5vZGUsIHcpIHtcbiAgICBpZiAodHlwZW9mIHcuZGVzdHJveSA9PT0gXCJmdW5jdGlvblwiICYmIGlzV2lkZ2V0KHcpKSB7XG4gICAgICAgIHcuZGVzdHJveShkb21Ob2RlKVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVvcmRlckNoaWxkcmVuKGRvbU5vZGUsIGJJbmRleCkge1xuICAgIHZhciBjaGlsZHJlbiA9IFtdXG4gICAgdmFyIGNoaWxkTm9kZXMgPSBkb21Ob2RlLmNoaWxkTm9kZXNcbiAgICB2YXIgbGVuID0gY2hpbGROb2Rlcy5sZW5ndGhcbiAgICB2YXIgaVxuICAgIHZhciByZXZlcnNlSW5kZXggPSBiSW5kZXgucmV2ZXJzZVxuXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGNoaWxkcmVuLnB1c2goZG9tTm9kZS5jaGlsZE5vZGVzW2ldKVxuICAgIH1cblxuICAgIHZhciBpbnNlcnRPZmZzZXQgPSAwXG4gICAgdmFyIG1vdmVcbiAgICB2YXIgbm9kZVxuICAgIHZhciBpbnNlcnROb2RlXG4gICAgdmFyIGNoYWluTGVuZ3RoXG4gICAgdmFyIGluc2VydGVkTGVuZ3RoXG4gICAgdmFyIG5leHRTaWJsaW5nXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjspIHtcbiAgICAgICAgbW92ZSA9IGJJbmRleFtpXVxuICAgICAgICBjaGFpbkxlbmd0aCA9IDFcbiAgICAgICAgaWYgKG1vdmUgIT09IHVuZGVmaW5lZCAmJiBtb3ZlICE9PSBpKSB7XG4gICAgICAgICAgICAvLyB0cnkgdG8gYnJpbmcgZm9yd2FyZCBhcyBsb25nIG9mIGEgY2hhaW4gYXMgcG9zc2libGVcbiAgICAgICAgICAgIHdoaWxlIChiSW5kZXhbaSArIGNoYWluTGVuZ3RoXSA9PT0gbW92ZSArIGNoYWluTGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY2hhaW5MZW5ndGgrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gdGhlIGVsZW1lbnQgY3VycmVudGx5IGF0IHRoaXMgaW5kZXggd2lsbCBiZSBtb3ZlZCBsYXRlciBzbyBpbmNyZWFzZSB0aGUgaW5zZXJ0IG9mZnNldFxuICAgICAgICAgICAgaWYgKHJldmVyc2VJbmRleFtpXSA+IGkgKyBjaGFpbkxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGluc2VydE9mZnNldCsrXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG5vZGUgPSBjaGlsZHJlblttb3ZlXVxuICAgICAgICAgICAgaW5zZXJ0Tm9kZSA9IGNoaWxkTm9kZXNbaSArIGluc2VydE9mZnNldF0gfHwgbnVsbFxuICAgICAgICAgICAgaW5zZXJ0ZWRMZW5ndGggPSAwXG4gICAgICAgICAgICB3aGlsZSAobm9kZSAhPT0gaW5zZXJ0Tm9kZSAmJiBpbnNlcnRlZExlbmd0aCsrIDwgY2hhaW5MZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBkb21Ob2RlLmluc2VydEJlZm9yZShub2RlLCBpbnNlcnROb2RlKTtcbiAgICAgICAgICAgICAgICBub2RlID0gY2hpbGRyZW5bbW92ZSArIGluc2VydGVkTGVuZ3RoXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gdGhlIG1vdmVkIGVsZW1lbnQgY2FtZSBmcm9tIHRoZSBmcm9udCBvZiB0aGUgYXJyYXkgc28gcmVkdWNlIHRoZSBpbnNlcnQgb2Zmc2V0XG4gICAgICAgICAgICBpZiAobW92ZSArIGNoYWluTGVuZ3RoIDwgaSkge1xuICAgICAgICAgICAgICAgIGluc2VydE9mZnNldC0tXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBlbGVtZW50IGF0IHRoaXMgaW5kZXggaXMgc2NoZWR1bGVkIHRvIGJlIHJlbW92ZWQgc28gaW5jcmVhc2UgaW5zZXJ0IG9mZnNldFxuICAgICAgICBpZiAoaSBpbiBiSW5kZXgucmVtb3Zlcykge1xuICAgICAgICAgICAgaW5zZXJ0T2Zmc2V0KytcbiAgICAgICAgfVxuXG4gICAgICAgIGkgKz0gY2hhaW5MZW5ndGhcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VSb290KG9sZFJvb3QsIG5ld1Jvb3QpIHtcbiAgICBpZiAob2xkUm9vdCAmJiBuZXdSb290ICYmIG9sZFJvb3QgIT09IG5ld1Jvb3QgJiYgb2xkUm9vdC5wYXJlbnROb2RlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKG9sZFJvb3QpXG4gICAgICAgIG9sZFJvb3QucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobmV3Um9vdCwgb2xkUm9vdClcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3Um9vdDtcbn1cbiIsInZhciBkb2N1bWVudCA9IHJlcXVpcmUoXCJnbG9iYWwvZG9jdW1lbnRcIilcbnZhciBpc0FycmF5ID0gcmVxdWlyZShcIngtaXMtYXJyYXlcIilcblxudmFyIGRvbUluZGV4ID0gcmVxdWlyZShcIi4vZG9tLWluZGV4XCIpXG52YXIgcGF0Y2hPcCA9IHJlcXVpcmUoXCIuL3BhdGNoLW9wXCIpXG5tb2R1bGUuZXhwb3J0cyA9IHBhdGNoXG5cbmZ1bmN0aW9uIHBhdGNoKHJvb3ROb2RlLCBwYXRjaGVzKSB7XG4gICAgcmV0dXJuIHBhdGNoUmVjdXJzaXZlKHJvb3ROb2RlLCBwYXRjaGVzKVxufVxuXG5mdW5jdGlvbiBwYXRjaFJlY3Vyc2l2ZShyb290Tm9kZSwgcGF0Y2hlcywgcmVuZGVyT3B0aW9ucykge1xuICAgIHZhciBpbmRpY2VzID0gcGF0Y2hJbmRpY2VzKHBhdGNoZXMpXG5cbiAgICBpZiAoaW5kaWNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHJvb3ROb2RlXG4gICAgfVxuXG4gICAgdmFyIGluZGV4ID0gZG9tSW5kZXgocm9vdE5vZGUsIHBhdGNoZXMuYSwgaW5kaWNlcylcbiAgICB2YXIgb3duZXJEb2N1bWVudCA9IHJvb3ROb2RlLm93bmVyRG9jdW1lbnRcblxuICAgIGlmICghcmVuZGVyT3B0aW9ucykge1xuICAgICAgICByZW5kZXJPcHRpb25zID0geyBwYXRjaDogcGF0Y2hSZWN1cnNpdmUgfVxuICAgICAgICBpZiAob3duZXJEb2N1bWVudCAhPT0gZG9jdW1lbnQpIHtcbiAgICAgICAgICAgIHJlbmRlck9wdGlvbnMuZG9jdW1lbnQgPSBvd25lckRvY3VtZW50XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIG5vZGVJbmRleCA9IGluZGljZXNbaV1cbiAgICAgICAgcm9vdE5vZGUgPSBhcHBseVBhdGNoKHJvb3ROb2RlLFxuICAgICAgICAgICAgaW5kZXhbbm9kZUluZGV4XSxcbiAgICAgICAgICAgIHBhdGNoZXNbbm9kZUluZGV4XSxcbiAgICAgICAgICAgIHJlbmRlck9wdGlvbnMpXG4gICAgfVxuXG4gICAgcmV0dXJuIHJvb3ROb2RlXG59XG5cbmZ1bmN0aW9uIGFwcGx5UGF0Y2gocm9vdE5vZGUsIGRvbU5vZGUsIHBhdGNoTGlzdCwgcmVuZGVyT3B0aW9ucykge1xuICAgIGlmICghZG9tTm9kZSkge1xuICAgICAgICByZXR1cm4gcm9vdE5vZGVcbiAgICB9XG5cbiAgICB2YXIgbmV3Tm9kZVxuXG4gICAgaWYgKGlzQXJyYXkocGF0Y2hMaXN0KSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGNoTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbmV3Tm9kZSA9IHBhdGNoT3AocGF0Y2hMaXN0W2ldLCBkb21Ob2RlLCByZW5kZXJPcHRpb25zKVxuXG4gICAgICAgICAgICBpZiAoZG9tTm9kZSA9PT0gcm9vdE5vZGUpIHtcbiAgICAgICAgICAgICAgICByb290Tm9kZSA9IG5ld05vZGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld05vZGUgPSBwYXRjaE9wKHBhdGNoTGlzdCwgZG9tTm9kZSwgcmVuZGVyT3B0aW9ucylcblxuICAgICAgICBpZiAoZG9tTm9kZSA9PT0gcm9vdE5vZGUpIHtcbiAgICAgICAgICAgIHJvb3ROb2RlID0gbmV3Tm9kZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJvb3ROb2RlXG59XG5cbmZ1bmN0aW9uIHBhdGNoSW5kaWNlcyhwYXRjaGVzKSB7XG4gICAgdmFyIGluZGljZXMgPSBbXVxuXG4gICAgZm9yICh2YXIga2V5IGluIHBhdGNoZXMpIHtcbiAgICAgICAgaWYgKGtleSAhPT0gXCJhXCIpIHtcbiAgICAgICAgICAgIGluZGljZXMucHVzaChOdW1iZXIoa2V5KSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpbmRpY2VzXG59XG4iLCJ2YXIgaXNXaWRnZXQgPSByZXF1aXJlKFwiLi4vdm5vZGUvaXMtd2lkZ2V0LmpzXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gdXBkYXRlV2lkZ2V0XG5cbmZ1bmN0aW9uIHVwZGF0ZVdpZGdldChhLCBiKSB7XG4gICAgaWYgKGlzV2lkZ2V0KGEpICYmIGlzV2lkZ2V0KGIpKSB7XG4gICAgICAgIGlmIChcIm5hbWVcIiBpbiBhICYmIFwibmFtZVwiIGluIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhLmlkID09PSBiLmlkXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYS5pbml0ID09PSBiLmluaXRcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgRXZTdG9yZSA9IHJlcXVpcmUoJ2V2LXN0b3JlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRXZIb29rO1xuXG5mdW5jdGlvbiBFdkhvb2sodmFsdWUpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgRXZIb29rKSkge1xuICAgICAgICByZXR1cm4gbmV3IEV2SG9vayh2YWx1ZSk7XG4gICAgfVxuXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xufVxuXG5Fdkhvb2sucHJvdG90eXBlLmhvb2sgPSBmdW5jdGlvbiAobm9kZSwgcHJvcGVydHlOYW1lKSB7XG4gICAgdmFyIGVzID0gRXZTdG9yZShub2RlKTtcbiAgICB2YXIgcHJvcE5hbWUgPSBwcm9wZXJ0eU5hbWUuc3Vic3RyKDMpO1xuXG4gICAgZXNbcHJvcE5hbWVdID0gdGhpcy52YWx1ZTtcbn07XG5cbkV2SG9vay5wcm90b3R5cGUudW5ob29rID0gZnVuY3Rpb24obm9kZSwgcHJvcGVydHlOYW1lKSB7XG4gICAgdmFyIGVzID0gRXZTdG9yZShub2RlKTtcbiAgICB2YXIgcHJvcE5hbWUgPSBwcm9wZXJ0eU5hbWUuc3Vic3RyKDMpO1xuXG4gICAgZXNbcHJvcE5hbWVdID0gdW5kZWZpbmVkO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBTb2Z0U2V0SG9vaztcblxuZnVuY3Rpb24gU29mdFNldEhvb2sodmFsdWUpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU29mdFNldEhvb2spKSB7XG4gICAgICAgIHJldHVybiBuZXcgU29mdFNldEhvb2sodmFsdWUpO1xuICAgIH1cblxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbn1cblxuU29mdFNldEhvb2sucHJvdG90eXBlLmhvb2sgPSBmdW5jdGlvbiAobm9kZSwgcHJvcGVydHlOYW1lKSB7XG4gICAgaWYgKG5vZGVbcHJvcGVydHlOYW1lXSAhPT0gdGhpcy52YWx1ZSkge1xuICAgICAgICBub2RlW3Byb3BlcnR5TmFtZV0gPSB0aGlzLnZhbHVlO1xuICAgIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0FycmF5ID0gcmVxdWlyZSgneC1pcy1hcnJheScpO1xuXG52YXIgVk5vZGUgPSByZXF1aXJlKCcuLi92bm9kZS92bm9kZS5qcycpO1xudmFyIFZUZXh0ID0gcmVxdWlyZSgnLi4vdm5vZGUvdnRleHQuanMnKTtcbnZhciBpc1ZOb2RlID0gcmVxdWlyZSgnLi4vdm5vZGUvaXMtdm5vZGUnKTtcbnZhciBpc1ZUZXh0ID0gcmVxdWlyZSgnLi4vdm5vZGUvaXMtdnRleHQnKTtcbnZhciBpc1dpZGdldCA9IHJlcXVpcmUoJy4uL3Zub2RlL2lzLXdpZGdldCcpO1xudmFyIGlzSG9vayA9IHJlcXVpcmUoJy4uL3Zub2RlL2lzLXZob29rJyk7XG52YXIgaXNWVGh1bmsgPSByZXF1aXJlKCcuLi92bm9kZS9pcy10aHVuaycpO1xuXG52YXIgcGFyc2VUYWcgPSByZXF1aXJlKCcuL3BhcnNlLXRhZy5qcycpO1xudmFyIHNvZnRTZXRIb29rID0gcmVxdWlyZSgnLi9ob29rcy9zb2Z0LXNldC1ob29rLmpzJyk7XG52YXIgZXZIb29rID0gcmVxdWlyZSgnLi9ob29rcy9ldi1ob29rLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gaDtcblxuZnVuY3Rpb24gaCh0YWdOYW1lLCBwcm9wZXJ0aWVzLCBjaGlsZHJlbikge1xuICAgIHZhciBjaGlsZE5vZGVzID0gW107XG4gICAgdmFyIHRhZywgcHJvcHMsIGtleSwgbmFtZXNwYWNlO1xuXG4gICAgaWYgKCFjaGlsZHJlbiAmJiBpc0NoaWxkcmVuKHByb3BlcnRpZXMpKSB7XG4gICAgICAgIGNoaWxkcmVuID0gcHJvcGVydGllcztcbiAgICAgICAgcHJvcHMgPSB7fTtcbiAgICB9XG5cbiAgICBwcm9wcyA9IHByb3BzIHx8IHByb3BlcnRpZXMgfHwge307XG4gICAgdGFnID0gcGFyc2VUYWcodGFnTmFtZSwgcHJvcHMpO1xuXG4gICAgLy8gc3VwcG9ydCBrZXlzXG4gICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KCdrZXknKSkge1xuICAgICAgICBrZXkgPSBwcm9wcy5rZXk7XG4gICAgICAgIHByb3BzLmtleSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvLyBzdXBwb3J0IG5hbWVzcGFjZVxuICAgIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eSgnbmFtZXNwYWNlJykpIHtcbiAgICAgICAgbmFtZXNwYWNlID0gcHJvcHMubmFtZXNwYWNlO1xuICAgICAgICBwcm9wcy5uYW1lc3BhY2UgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLy8gZml4IGN1cnNvciBidWdcbiAgICBpZiAodGFnID09PSAnSU5QVVQnICYmXG4gICAgICAgICFuYW1lc3BhY2UgJiZcbiAgICAgICAgcHJvcHMuaGFzT3duUHJvcGVydHkoJ3ZhbHVlJykgJiZcbiAgICAgICAgcHJvcHMudmFsdWUgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAhaXNIb29rKHByb3BzLnZhbHVlKVxuICAgICkge1xuICAgICAgICBwcm9wcy52YWx1ZSA9IHNvZnRTZXRIb29rKHByb3BzLnZhbHVlKTtcbiAgICB9XG5cbiAgICB0cmFuc2Zvcm1Qcm9wZXJ0aWVzKHByb3BzKTtcblxuICAgIGlmIChjaGlsZHJlbiAhPT0gdW5kZWZpbmVkICYmIGNoaWxkcmVuICE9PSBudWxsKSB7XG4gICAgICAgIGFkZENoaWxkKGNoaWxkcmVuLCBjaGlsZE5vZGVzLCB0YWcsIHByb3BzKTtcbiAgICB9XG5cblxuICAgIHJldHVybiBuZXcgVk5vZGUodGFnLCBwcm9wcywgY2hpbGROb2Rlcywga2V5LCBuYW1lc3BhY2UpO1xufVxuXG5mdW5jdGlvbiBhZGRDaGlsZChjLCBjaGlsZE5vZGVzLCB0YWcsIHByb3BzKSB7XG4gICAgaWYgKHR5cGVvZiBjID09PSAnc3RyaW5nJykge1xuICAgICAgICBjaGlsZE5vZGVzLnB1c2gobmV3IFZUZXh0KGMpKTtcbiAgICB9IGVsc2UgaWYgKGlzQ2hpbGQoYykpIHtcbiAgICAgICAgY2hpbGROb2Rlcy5wdXNoKGMpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShjKSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFkZENoaWxkKGNbaV0sIGNoaWxkTm9kZXMsIHRhZywgcHJvcHMpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChjID09PSBudWxsIHx8IGMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgVW5leHBlY3RlZFZpcnR1YWxFbGVtZW50KHtcbiAgICAgICAgICAgIGZvcmVpZ25PYmplY3Q6IGMsXG4gICAgICAgICAgICBwYXJlbnRWbm9kZToge1xuICAgICAgICAgICAgICAgIHRhZ05hbWU6IHRhZyxcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBwcm9wc1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybVByb3BlcnRpZXMocHJvcHMpIHtcbiAgICBmb3IgKHZhciBwcm9wTmFtZSBpbiBwcm9wcykge1xuICAgICAgICBpZiAocHJvcHMuaGFzT3duUHJvcGVydHkocHJvcE5hbWUpKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBwcm9wc1twcm9wTmFtZV07XG5cbiAgICAgICAgICAgIGlmIChpc0hvb2sodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwcm9wTmFtZS5zdWJzdHIoMCwgMykgPT09ICdldi0nKSB7XG4gICAgICAgICAgICAgICAgLy8gYWRkIGV2LWZvbyBzdXBwb3J0XG4gICAgICAgICAgICAgICAgcHJvcHNbcHJvcE5hbWVdID0gZXZIb29rKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gaXNDaGlsZCh4KSB7XG4gICAgcmV0dXJuIGlzVk5vZGUoeCkgfHwgaXNWVGV4dCh4KSB8fCBpc1dpZGdldCh4KSB8fCBpc1ZUaHVuayh4KTtcbn1cblxuZnVuY3Rpb24gaXNDaGlsZHJlbih4KSB7XG4gICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnc3RyaW5nJyB8fCBpc0FycmF5KHgpIHx8IGlzQ2hpbGQoeCk7XG59XG5cbmZ1bmN0aW9uIFVuZXhwZWN0ZWRWaXJ0dWFsRWxlbWVudChkYXRhKSB7XG4gICAgdmFyIGVyciA9IG5ldyBFcnJvcigpO1xuXG4gICAgZXJyLnR5cGUgPSAndmlydHVhbC1oeXBlcnNjcmlwdC51bmV4cGVjdGVkLnZpcnR1YWwtZWxlbWVudCc7XG4gICAgZXJyLm1lc3NhZ2UgPSAnVW5leHBlY3RlZCB2aXJ0dWFsIGNoaWxkIHBhc3NlZCB0byBoKCkuXFxuJyArXG4gICAgICAgICdFeHBlY3RlZCBhIFZOb2RlIC8gVnRodW5rIC8gVldpZGdldCAvIHN0cmluZyBidXQ6XFxuJyArXG4gICAgICAgICdnb3Q6XFxuJyArXG4gICAgICAgIGVycm9yU3RyaW5nKGRhdGEuZm9yZWlnbk9iamVjdCkgK1xuICAgICAgICAnLlxcbicgK1xuICAgICAgICAnVGhlIHBhcmVudCB2bm9kZSBpczpcXG4nICtcbiAgICAgICAgZXJyb3JTdHJpbmcoZGF0YS5wYXJlbnRWbm9kZSlcbiAgICAgICAgJ1xcbicgK1xuICAgICAgICAnU3VnZ2VzdGVkIGZpeDogY2hhbmdlIHlvdXIgYGgoLi4uLCBbIC4uLiBdKWAgY2FsbHNpdGUuJztcbiAgICBlcnIuZm9yZWlnbk9iamVjdCA9IGRhdGEuZm9yZWlnbk9iamVjdDtcbiAgICBlcnIucGFyZW50Vm5vZGUgPSBkYXRhLnBhcmVudFZub2RlO1xuXG4gICAgcmV0dXJuIGVycjtcbn1cblxuZnVuY3Rpb24gZXJyb3JTdHJpbmcob2JqKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iaiwgbnVsbCwgJyAgICAnKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBTdHJpbmcob2JqKTtcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBzcGxpdCA9IHJlcXVpcmUoJ2Jyb3dzZXItc3BsaXQnKTtcblxudmFyIGNsYXNzSWRTcGxpdCA9IC8oW1xcLiNdP1thLXpBLVowLTlfOi1dKykvO1xudmFyIG5vdENsYXNzSWQgPSAvXlxcLnwjLztcblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZVRhZztcblxuZnVuY3Rpb24gcGFyc2VUYWcodGFnLCBwcm9wcykge1xuICAgIGlmICghdGFnKSB7XG4gICAgICAgIHJldHVybiAnRElWJztcbiAgICB9XG5cbiAgICB2YXIgbm9JZCA9ICEocHJvcHMuaGFzT3duUHJvcGVydHkoJ2lkJykpO1xuXG4gICAgdmFyIHRhZ1BhcnRzID0gc3BsaXQodGFnLCBjbGFzc0lkU3BsaXQpO1xuICAgIHZhciB0YWdOYW1lID0gbnVsbDtcblxuICAgIGlmIChub3RDbGFzc0lkLnRlc3QodGFnUGFydHNbMV0pKSB7XG4gICAgICAgIHRhZ05hbWUgPSAnRElWJztcbiAgICB9XG5cbiAgICB2YXIgY2xhc3NlcywgcGFydCwgdHlwZSwgaTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCB0YWdQYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBwYXJ0ID0gdGFnUGFydHNbaV07XG5cbiAgICAgICAgaWYgKCFwYXJ0KSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHR5cGUgPSBwYXJ0LmNoYXJBdCgwKTtcblxuICAgICAgICBpZiAoIXRhZ05hbWUpIHtcbiAgICAgICAgICAgIHRhZ05hbWUgPSBwYXJ0O1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICcuJykge1xuICAgICAgICAgICAgY2xhc3NlcyA9IGNsYXNzZXMgfHwgW107XG4gICAgICAgICAgICBjbGFzc2VzLnB1c2gocGFydC5zdWJzdHJpbmcoMSwgcGFydC5sZW5ndGgpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnIycgJiYgbm9JZCkge1xuICAgICAgICAgICAgcHJvcHMuaWQgPSBwYXJ0LnN1YnN0cmluZygxLCBwYXJ0Lmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY2xhc3Nlcykge1xuICAgICAgICBpZiAocHJvcHMuY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICBjbGFzc2VzLnB1c2gocHJvcHMuY2xhc3NOYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3BzLmNsYXNzTmFtZSA9IGNsYXNzZXMuam9pbignICcpO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9wcy5uYW1lc3BhY2UgPyB0YWdOYW1lIDogdGFnTmFtZS50b1VwcGVyQ2FzZSgpO1xufVxuIiwidmFyIGlzVk5vZGUgPSByZXF1aXJlKFwiLi9pcy12bm9kZVwiKVxudmFyIGlzVlRleHQgPSByZXF1aXJlKFwiLi9pcy12dGV4dFwiKVxudmFyIGlzV2lkZ2V0ID0gcmVxdWlyZShcIi4vaXMtd2lkZ2V0XCIpXG52YXIgaXNUaHVuayA9IHJlcXVpcmUoXCIuL2lzLXRodW5rXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gaGFuZGxlVGh1bmtcblxuZnVuY3Rpb24gaGFuZGxlVGh1bmsoYSwgYikge1xuICAgIHZhciByZW5kZXJlZEEgPSBhXG4gICAgdmFyIHJlbmRlcmVkQiA9IGJcblxuICAgIGlmIChpc1RodW5rKGIpKSB7XG4gICAgICAgIHJlbmRlcmVkQiA9IHJlbmRlclRodW5rKGIsIGEpXG4gICAgfVxuXG4gICAgaWYgKGlzVGh1bmsoYSkpIHtcbiAgICAgICAgcmVuZGVyZWRBID0gcmVuZGVyVGh1bmsoYSwgbnVsbClcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBhOiByZW5kZXJlZEEsXG4gICAgICAgIGI6IHJlbmRlcmVkQlxuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyVGh1bmsodGh1bmssIHByZXZpb3VzKSB7XG4gICAgdmFyIHJlbmRlcmVkVGh1bmsgPSB0aHVuay52bm9kZVxuXG4gICAgaWYgKCFyZW5kZXJlZFRodW5rKSB7XG4gICAgICAgIHJlbmRlcmVkVGh1bmsgPSB0aHVuay52bm9kZSA9IHRodW5rLnJlbmRlcihwcmV2aW91cylcbiAgICB9XG5cbiAgICBpZiAoIShpc1ZOb2RlKHJlbmRlcmVkVGh1bmspIHx8XG4gICAgICAgICAgICBpc1ZUZXh0KHJlbmRlcmVkVGh1bmspIHx8XG4gICAgICAgICAgICBpc1dpZGdldChyZW5kZXJlZFRodW5rKSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidGh1bmsgZGlkIG5vdCByZXR1cm4gYSB2YWxpZCBub2RlXCIpO1xuICAgIH1cblxuICAgIHJldHVybiByZW5kZXJlZFRodW5rXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGlzVGh1bmtcclxuXHJcbmZ1bmN0aW9uIGlzVGh1bmsodCkge1xyXG4gICAgcmV0dXJuIHQgJiYgdC50eXBlID09PSBcIlRodW5rXCJcclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGlzSG9va1xuXG5mdW5jdGlvbiBpc0hvb2soaG9vaykge1xuICAgIHJldHVybiBob29rICYmXG4gICAgICAodHlwZW9mIGhvb2suaG9vayA9PT0gXCJmdW5jdGlvblwiICYmICFob29rLmhhc093blByb3BlcnR5KFwiaG9va1wiKSB8fFxuICAgICAgIHR5cGVvZiBob29rLnVuaG9vayA9PT0gXCJmdW5jdGlvblwiICYmICFob29rLmhhc093blByb3BlcnR5KFwidW5ob29rXCIpKVxufVxuIiwidmFyIHZlcnNpb24gPSByZXF1aXJlKFwiLi92ZXJzaW9uXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gaXNWaXJ0dWFsTm9kZVxuXG5mdW5jdGlvbiBpc1ZpcnR1YWxOb2RlKHgpIHtcbiAgICByZXR1cm4geCAmJiB4LnR5cGUgPT09IFwiVmlydHVhbE5vZGVcIiAmJiB4LnZlcnNpb24gPT09IHZlcnNpb25cbn1cbiIsInZhciB2ZXJzaW9uID0gcmVxdWlyZShcIi4vdmVyc2lvblwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzVmlydHVhbFRleHRcblxuZnVuY3Rpb24gaXNWaXJ0dWFsVGV4dCh4KSB7XG4gICAgcmV0dXJuIHggJiYgeC50eXBlID09PSBcIlZpcnR1YWxUZXh0XCIgJiYgeC52ZXJzaW9uID09PSB2ZXJzaW9uXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGlzV2lkZ2V0XG5cbmZ1bmN0aW9uIGlzV2lkZ2V0KHcpIHtcbiAgICByZXR1cm4gdyAmJiB3LnR5cGUgPT09IFwiV2lkZ2V0XCJcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gXCIxXCJcbiIsInZhciB2ZXJzaW9uID0gcmVxdWlyZShcIi4vdmVyc2lvblwiKVxudmFyIGlzVk5vZGUgPSByZXF1aXJlKFwiLi9pcy12bm9kZVwiKVxudmFyIGlzV2lkZ2V0ID0gcmVxdWlyZShcIi4vaXMtd2lkZ2V0XCIpXG52YXIgaXNUaHVuayA9IHJlcXVpcmUoXCIuL2lzLXRodW5rXCIpXG52YXIgaXNWSG9vayA9IHJlcXVpcmUoXCIuL2lzLXZob29rXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gVmlydHVhbE5vZGVcblxudmFyIG5vUHJvcGVydGllcyA9IHt9XG52YXIgbm9DaGlsZHJlbiA9IFtdXG5cbmZ1bmN0aW9uIFZpcnR1YWxOb2RlKHRhZ05hbWUsIHByb3BlcnRpZXMsIGNoaWxkcmVuLCBrZXksIG5hbWVzcGFjZSkge1xuICAgIHRoaXMudGFnTmFtZSA9IHRhZ05hbWVcbiAgICB0aGlzLnByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzIHx8IG5vUHJvcGVydGllc1xuICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbiB8fCBub0NoaWxkcmVuXG4gICAgdGhpcy5rZXkgPSBrZXkgIT0gbnVsbCA/IFN0cmluZyhrZXkpIDogdW5kZWZpbmVkXG4gICAgdGhpcy5uYW1lc3BhY2UgPSAodHlwZW9mIG5hbWVzcGFjZSA9PT0gXCJzdHJpbmdcIikgPyBuYW1lc3BhY2UgOiBudWxsXG5cbiAgICB2YXIgY291bnQgPSAoY2hpbGRyZW4gJiYgY2hpbGRyZW4ubGVuZ3RoKSB8fCAwXG4gICAgdmFyIGRlc2NlbmRhbnRzID0gMFxuICAgIHZhciBoYXNXaWRnZXRzID0gZmFsc2VcbiAgICB2YXIgaGFzVGh1bmtzID0gZmFsc2VcbiAgICB2YXIgZGVzY2VuZGFudEhvb2tzID0gZmFsc2VcbiAgICB2YXIgaG9va3NcblxuICAgIGZvciAodmFyIHByb3BOYW1lIGluIHByb3BlcnRpZXMpIHtcbiAgICAgICAgaWYgKHByb3BlcnRpZXMuaGFzT3duUHJvcGVydHkocHJvcE5hbWUpKSB7XG4gICAgICAgICAgICB2YXIgcHJvcGVydHkgPSBwcm9wZXJ0aWVzW3Byb3BOYW1lXVxuICAgICAgICAgICAgaWYgKGlzVkhvb2socHJvcGVydHkpICYmIHByb3BlcnR5LnVuaG9vaykge1xuICAgICAgICAgICAgICAgIGlmICghaG9va3MpIHtcbiAgICAgICAgICAgICAgICAgICAgaG9va3MgPSB7fVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGhvb2tzW3Byb3BOYW1lXSA9IHByb3BlcnR5XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV1cbiAgICAgICAgaWYgKGlzVk5vZGUoY2hpbGQpKSB7XG4gICAgICAgICAgICBkZXNjZW5kYW50cyArPSBjaGlsZC5jb3VudCB8fCAwXG5cbiAgICAgICAgICAgIGlmICghaGFzV2lkZ2V0cyAmJiBjaGlsZC5oYXNXaWRnZXRzKSB7XG4gICAgICAgICAgICAgICAgaGFzV2lkZ2V0cyA9IHRydWVcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFoYXNUaHVua3MgJiYgY2hpbGQuaGFzVGh1bmtzKSB7XG4gICAgICAgICAgICAgICAgaGFzVGh1bmtzID0gdHJ1ZVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWRlc2NlbmRhbnRIb29rcyAmJiAoY2hpbGQuaG9va3MgfHwgY2hpbGQuZGVzY2VuZGFudEhvb2tzKSkge1xuICAgICAgICAgICAgICAgIGRlc2NlbmRhbnRIb29rcyA9IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghaGFzV2lkZ2V0cyAmJiBpc1dpZGdldChjaGlsZCkpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2hpbGQuZGVzdHJveSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgaGFzV2lkZ2V0cyA9IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghaGFzVGh1bmtzICYmIGlzVGh1bmsoY2hpbGQpKSB7XG4gICAgICAgICAgICBoYXNUaHVua3MgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jb3VudCA9IGNvdW50ICsgZGVzY2VuZGFudHNcbiAgICB0aGlzLmhhc1dpZGdldHMgPSBoYXNXaWRnZXRzXG4gICAgdGhpcy5oYXNUaHVua3MgPSBoYXNUaHVua3NcbiAgICB0aGlzLmhvb2tzID0gaG9va3NcbiAgICB0aGlzLmRlc2NlbmRhbnRIb29rcyA9IGRlc2NlbmRhbnRIb29rc1xufVxuXG5WaXJ0dWFsTm9kZS5wcm90b3R5cGUudmVyc2lvbiA9IHZlcnNpb25cblZpcnR1YWxOb2RlLnByb3RvdHlwZS50eXBlID0gXCJWaXJ0dWFsTm9kZVwiXG4iLCJ2YXIgdmVyc2lvbiA9IHJlcXVpcmUoXCIuL3ZlcnNpb25cIilcblxuVmlydHVhbFBhdGNoLk5PTkUgPSAwXG5WaXJ0dWFsUGF0Y2guVlRFWFQgPSAxXG5WaXJ0dWFsUGF0Y2guVk5PREUgPSAyXG5WaXJ0dWFsUGF0Y2guV0lER0VUID0gM1xuVmlydHVhbFBhdGNoLlBST1BTID0gNFxuVmlydHVhbFBhdGNoLk9SREVSID0gNVxuVmlydHVhbFBhdGNoLklOU0VSVCA9IDZcblZpcnR1YWxQYXRjaC5SRU1PVkUgPSA3XG5WaXJ0dWFsUGF0Y2guVEhVTksgPSA4XG5cbm1vZHVsZS5leHBvcnRzID0gVmlydHVhbFBhdGNoXG5cbmZ1bmN0aW9uIFZpcnR1YWxQYXRjaCh0eXBlLCB2Tm9kZSwgcGF0Y2gpIHtcbiAgICB0aGlzLnR5cGUgPSBOdW1iZXIodHlwZSlcbiAgICB0aGlzLnZOb2RlID0gdk5vZGVcbiAgICB0aGlzLnBhdGNoID0gcGF0Y2hcbn1cblxuVmlydHVhbFBhdGNoLnByb3RvdHlwZS52ZXJzaW9uID0gdmVyc2lvblxuVmlydHVhbFBhdGNoLnByb3RvdHlwZS50eXBlID0gXCJWaXJ0dWFsUGF0Y2hcIlxuIiwidmFyIHZlcnNpb24gPSByZXF1aXJlKFwiLi92ZXJzaW9uXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gVmlydHVhbFRleHRcblxuZnVuY3Rpb24gVmlydHVhbFRleHQodGV4dCkge1xuICAgIHRoaXMudGV4dCA9IFN0cmluZyh0ZXh0KVxufVxuXG5WaXJ0dWFsVGV4dC5wcm90b3R5cGUudmVyc2lvbiA9IHZlcnNpb25cblZpcnR1YWxUZXh0LnByb3RvdHlwZS50eXBlID0gXCJWaXJ0dWFsVGV4dFwiXG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKFwiaXMtb2JqZWN0XCIpXG52YXIgaXNIb29rID0gcmVxdWlyZShcIi4uL3Zub2RlL2lzLXZob29rXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gZGlmZlByb3BzXG5cbmZ1bmN0aW9uIGRpZmZQcm9wcyhhLCBiKSB7XG4gICAgdmFyIGRpZmZcblxuICAgIGZvciAodmFyIGFLZXkgaW4gYSkge1xuICAgICAgICBpZiAoIShhS2V5IGluIGIpKSB7XG4gICAgICAgICAgICBkaWZmID0gZGlmZiB8fCB7fVxuICAgICAgICAgICAgZGlmZlthS2V5XSA9IHVuZGVmaW5lZFxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGFWYWx1ZSA9IGFbYUtleV1cbiAgICAgICAgdmFyIGJWYWx1ZSA9IGJbYUtleV1cblxuICAgICAgICBpZiAoYVZhbHVlID09PSBiVmFsdWUpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QoYVZhbHVlKSAmJiBpc09iamVjdChiVmFsdWUpKSB7XG4gICAgICAgICAgICBpZiAoZ2V0UHJvdG90eXBlKGJWYWx1ZSkgIT09IGdldFByb3RvdHlwZShhVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgZGlmZiA9IGRpZmYgfHwge31cbiAgICAgICAgICAgICAgICBkaWZmW2FLZXldID0gYlZhbHVlXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzSG9vayhiVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgIGRpZmYgPSBkaWZmIHx8IHt9XG4gICAgICAgICAgICAgICAgIGRpZmZbYUtleV0gPSBiVmFsdWVcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIG9iamVjdERpZmYgPSBkaWZmUHJvcHMoYVZhbHVlLCBiVmFsdWUpXG4gICAgICAgICAgICAgICAgaWYgKG9iamVjdERpZmYpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlmZiA9IGRpZmYgfHwge31cbiAgICAgICAgICAgICAgICAgICAgZGlmZlthS2V5XSA9IG9iamVjdERpZmZcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkaWZmID0gZGlmZiB8fCB7fVxuICAgICAgICAgICAgZGlmZlthS2V5XSA9IGJWYWx1ZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgYktleSBpbiBiKSB7XG4gICAgICAgIGlmICghKGJLZXkgaW4gYSkpIHtcbiAgICAgICAgICAgIGRpZmYgPSBkaWZmIHx8IHt9XG4gICAgICAgICAgICBkaWZmW2JLZXldID0gYltiS2V5XVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRpZmZcbn1cblxuZnVuY3Rpb24gZ2V0UHJvdG90eXBlKHZhbHVlKSB7XG4gIGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YpIHtcbiAgICByZXR1cm4gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlKVxuICB9IGVsc2UgaWYgKHZhbHVlLl9fcHJvdG9fXykge1xuICAgIHJldHVybiB2YWx1ZS5fX3Byb3RvX19cbiAgfSBlbHNlIGlmICh2YWx1ZS5jb25zdHJ1Y3Rvcikge1xuICAgIHJldHVybiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGVcbiAgfVxufVxuIiwidmFyIGlzQXJyYXkgPSByZXF1aXJlKFwieC1pcy1hcnJheVwiKVxuXG52YXIgVlBhdGNoID0gcmVxdWlyZShcIi4uL3Zub2RlL3ZwYXRjaFwiKVxudmFyIGlzVk5vZGUgPSByZXF1aXJlKFwiLi4vdm5vZGUvaXMtdm5vZGVcIilcbnZhciBpc1ZUZXh0ID0gcmVxdWlyZShcIi4uL3Zub2RlL2lzLXZ0ZXh0XCIpXG52YXIgaXNXaWRnZXQgPSByZXF1aXJlKFwiLi4vdm5vZGUvaXMtd2lkZ2V0XCIpXG52YXIgaXNUaHVuayA9IHJlcXVpcmUoXCIuLi92bm9kZS9pcy10aHVua1wiKVxudmFyIGhhbmRsZVRodW5rID0gcmVxdWlyZShcIi4uL3Zub2RlL2hhbmRsZS10aHVua1wiKVxuXG52YXIgZGlmZlByb3BzID0gcmVxdWlyZShcIi4vZGlmZi1wcm9wc1wiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRpZmZcblxuZnVuY3Rpb24gZGlmZihhLCBiKSB7XG4gICAgdmFyIHBhdGNoID0geyBhOiBhIH1cbiAgICB3YWxrKGEsIGIsIHBhdGNoLCAwKVxuICAgIHJldHVybiBwYXRjaFxufVxuXG5mdW5jdGlvbiB3YWxrKGEsIGIsIHBhdGNoLCBpbmRleCkge1xuICAgIGlmIChhID09PSBiKSB7XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHZhciBhcHBseSA9IHBhdGNoW2luZGV4XVxuICAgIHZhciBhcHBseUNsZWFyID0gZmFsc2VcblxuICAgIGlmIChpc1RodW5rKGEpIHx8IGlzVGh1bmsoYikpIHtcbiAgICAgICAgdGh1bmtzKGEsIGIsIHBhdGNoLCBpbmRleClcbiAgICB9IGVsc2UgaWYgKGIgPT0gbnVsbCkge1xuXG4gICAgICAgIC8vIElmIGEgaXMgYSB3aWRnZXQgd2Ugd2lsbCBhZGQgYSByZW1vdmUgcGF0Y2ggZm9yIGl0XG4gICAgICAgIC8vIE90aGVyd2lzZSBhbnkgY2hpbGQgd2lkZ2V0cy9ob29rcyBtdXN0IGJlIGRlc3Ryb3llZC5cbiAgICAgICAgLy8gVGhpcyBwcmV2ZW50cyBhZGRpbmcgdHdvIHJlbW92ZSBwYXRjaGVzIGZvciBhIHdpZGdldC5cbiAgICAgICAgaWYgKCFpc1dpZGdldChhKSkge1xuICAgICAgICAgICAgY2xlYXJTdGF0ZShhLCBwYXRjaCwgaW5kZXgpXG4gICAgICAgICAgICBhcHBseSA9IHBhdGNoW2luZGV4XVxuICAgICAgICB9XG5cbiAgICAgICAgYXBwbHkgPSBhcHBlbmRQYXRjaChhcHBseSwgbmV3IFZQYXRjaChWUGF0Y2guUkVNT1ZFLCBhLCBiKSlcbiAgICB9IGVsc2UgaWYgKGlzVk5vZGUoYikpIHtcbiAgICAgICAgaWYgKGlzVk5vZGUoYSkpIHtcbiAgICAgICAgICAgIGlmIChhLnRhZ05hbWUgPT09IGIudGFnTmFtZSAmJlxuICAgICAgICAgICAgICAgIGEubmFtZXNwYWNlID09PSBiLm5hbWVzcGFjZSAmJlxuICAgICAgICAgICAgICAgIGEua2V5ID09PSBiLmtleSkge1xuICAgICAgICAgICAgICAgIHZhciBwcm9wc1BhdGNoID0gZGlmZlByb3BzKGEucHJvcGVydGllcywgYi5wcm9wZXJ0aWVzKVxuICAgICAgICAgICAgICAgIGlmIChwcm9wc1BhdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGFwcGx5ID0gYXBwZW5kUGF0Y2goYXBwbHksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgVlBhdGNoKFZQYXRjaC5QUk9QUywgYSwgcHJvcHNQYXRjaCkpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFwcGx5ID0gZGlmZkNoaWxkcmVuKGEsIGIsIHBhdGNoLCBhcHBseSwgaW5kZXgpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFwcGx5ID0gYXBwZW5kUGF0Y2goYXBwbHksIG5ldyBWUGF0Y2goVlBhdGNoLlZOT0RFLCBhLCBiKSlcbiAgICAgICAgICAgICAgICBhcHBseUNsZWFyID0gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXBwbHkgPSBhcHBlbmRQYXRjaChhcHBseSwgbmV3IFZQYXRjaChWUGF0Y2guVk5PREUsIGEsIGIpKVxuICAgICAgICAgICAgYXBwbHlDbGVhciA9IHRydWVcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNWVGV4dChiKSkge1xuICAgICAgICBpZiAoIWlzVlRleHQoYSkpIHtcbiAgICAgICAgICAgIGFwcGx5ID0gYXBwZW5kUGF0Y2goYXBwbHksIG5ldyBWUGF0Y2goVlBhdGNoLlZURVhULCBhLCBiKSlcbiAgICAgICAgICAgIGFwcGx5Q2xlYXIgPSB0cnVlXG4gICAgICAgIH0gZWxzZSBpZiAoYS50ZXh0ICE9PSBiLnRleHQpIHtcbiAgICAgICAgICAgIGFwcGx5ID0gYXBwZW5kUGF0Y2goYXBwbHksIG5ldyBWUGF0Y2goVlBhdGNoLlZURVhULCBhLCBiKSlcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNXaWRnZXQoYikpIHtcbiAgICAgICAgaWYgKCFpc1dpZGdldChhKSkge1xuICAgICAgICAgICAgYXBwbHlDbGVhciA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBhcHBseSA9IGFwcGVuZFBhdGNoKGFwcGx5LCBuZXcgVlBhdGNoKFZQYXRjaC5XSURHRVQsIGEsIGIpKVxuICAgIH1cblxuICAgIGlmIChhcHBseSkge1xuICAgICAgICBwYXRjaFtpbmRleF0gPSBhcHBseVxuICAgIH1cblxuICAgIGlmIChhcHBseUNsZWFyKSB7XG4gICAgICAgIGNsZWFyU3RhdGUoYSwgcGF0Y2gsIGluZGV4KVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZGlmZkNoaWxkcmVuKGEsIGIsIHBhdGNoLCBhcHBseSwgaW5kZXgpIHtcbiAgICB2YXIgYUNoaWxkcmVuID0gYS5jaGlsZHJlblxuICAgIHZhciBiQ2hpbGRyZW4gPSByZW9yZGVyKGFDaGlsZHJlbiwgYi5jaGlsZHJlbilcblxuICAgIHZhciBhTGVuID0gYUNoaWxkcmVuLmxlbmd0aFxuICAgIHZhciBiTGVuID0gYkNoaWxkcmVuLmxlbmd0aFxuICAgIHZhciBsZW4gPSBhTGVuID4gYkxlbiA/IGFMZW4gOiBiTGVuXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHZhciBsZWZ0Tm9kZSA9IGFDaGlsZHJlbltpXVxuICAgICAgICB2YXIgcmlnaHROb2RlID0gYkNoaWxkcmVuW2ldXG4gICAgICAgIGluZGV4ICs9IDFcblxuICAgICAgICBpZiAoIWxlZnROb2RlKSB7XG4gICAgICAgICAgICBpZiAocmlnaHROb2RlKSB7XG4gICAgICAgICAgICAgICAgLy8gRXhjZXNzIG5vZGVzIGluIGIgbmVlZCB0byBiZSBhZGRlZFxuICAgICAgICAgICAgICAgIGFwcGx5ID0gYXBwZW5kUGF0Y2goYXBwbHksXG4gICAgICAgICAgICAgICAgICAgIG5ldyBWUGF0Y2goVlBhdGNoLklOU0VSVCwgbnVsbCwgcmlnaHROb2RlKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdhbGsobGVmdE5vZGUsIHJpZ2h0Tm9kZSwgcGF0Y2gsIGluZGV4KVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzVk5vZGUobGVmdE5vZGUpICYmIGxlZnROb2RlLmNvdW50KSB7XG4gICAgICAgICAgICBpbmRleCArPSBsZWZ0Tm9kZS5jb3VudFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGJDaGlsZHJlbi5tb3Zlcykge1xuICAgICAgICAvLyBSZW9yZGVyIG5vZGVzIGxhc3RcbiAgICAgICAgYXBwbHkgPSBhcHBlbmRQYXRjaChhcHBseSwgbmV3IFZQYXRjaChWUGF0Y2guT1JERVIsIGEsIGJDaGlsZHJlbi5tb3ZlcykpXG4gICAgfVxuXG4gICAgcmV0dXJuIGFwcGx5XG59XG5cbmZ1bmN0aW9uIGNsZWFyU3RhdGUodk5vZGUsIHBhdGNoLCBpbmRleCkge1xuICAgIC8vIFRPRE86IE1ha2UgdGhpcyBhIHNpbmdsZSB3YWxrLCBub3QgdHdvXG4gICAgdW5ob29rKHZOb2RlLCBwYXRjaCwgaW5kZXgpXG4gICAgZGVzdHJveVdpZGdldHModk5vZGUsIHBhdGNoLCBpbmRleClcbn1cblxuLy8gUGF0Y2ggcmVjb3JkcyBmb3IgYWxsIGRlc3Ryb3llZCB3aWRnZXRzIG11c3QgYmUgYWRkZWQgYmVjYXVzZSB3ZSBuZWVkXG4vLyBhIERPTSBub2RlIHJlZmVyZW5jZSBmb3IgdGhlIGRlc3Ryb3kgZnVuY3Rpb25cbmZ1bmN0aW9uIGRlc3Ryb3lXaWRnZXRzKHZOb2RlLCBwYXRjaCwgaW5kZXgpIHtcbiAgICBpZiAoaXNXaWRnZXQodk5vZGUpKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygdk5vZGUuZGVzdHJveSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBwYXRjaFtpbmRleF0gPSBhcHBlbmRQYXRjaChcbiAgICAgICAgICAgICAgICBwYXRjaFtpbmRleF0sXG4gICAgICAgICAgICAgICAgbmV3IFZQYXRjaChWUGF0Y2guUkVNT1ZFLCB2Tm9kZSwgbnVsbClcbiAgICAgICAgICAgIClcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNWTm9kZSh2Tm9kZSkgJiYgKHZOb2RlLmhhc1dpZGdldHMgfHwgdk5vZGUuaGFzVGh1bmtzKSkge1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSB2Tm9kZS5jaGlsZHJlblxuICAgICAgICB2YXIgbGVuID0gY2hpbGRyZW4ubGVuZ3RoXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldXG4gICAgICAgICAgICBpbmRleCArPSAxXG5cbiAgICAgICAgICAgIGRlc3Ryb3lXaWRnZXRzKGNoaWxkLCBwYXRjaCwgaW5kZXgpXG5cbiAgICAgICAgICAgIGlmIChpc1ZOb2RlKGNoaWxkKSAmJiBjaGlsZC5jb3VudCkge1xuICAgICAgICAgICAgICAgIGluZGV4ICs9IGNoaWxkLmNvdW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzVGh1bmsodk5vZGUpKSB7XG4gICAgICAgIHRodW5rcyh2Tm9kZSwgbnVsbCwgcGF0Y2gsIGluZGV4KVxuICAgIH1cbn1cblxuLy8gQ3JlYXRlIGEgc3ViLXBhdGNoIGZvciB0aHVua3NcbmZ1bmN0aW9uIHRodW5rcyhhLCBiLCBwYXRjaCwgaW5kZXgpIHtcbiAgICB2YXIgbm9kZXMgPSBoYW5kbGVUaHVuayhhLCBiKTtcbiAgICB2YXIgdGh1bmtQYXRjaCA9IGRpZmYobm9kZXMuYSwgbm9kZXMuYilcbiAgICBpZiAoaGFzUGF0Y2hlcyh0aHVua1BhdGNoKSkge1xuICAgICAgICBwYXRjaFtpbmRleF0gPSBuZXcgVlBhdGNoKFZQYXRjaC5USFVOSywgbnVsbCwgdGh1bmtQYXRjaClcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGhhc1BhdGNoZXMocGF0Y2gpIHtcbiAgICBmb3IgKHZhciBpbmRleCBpbiBwYXRjaCkge1xuICAgICAgICBpZiAoaW5kZXggIT09IFwiYVwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuLy8gRXhlY3V0ZSBob29rcyB3aGVuIHR3byBub2RlcyBhcmUgaWRlbnRpY2FsXG5mdW5jdGlvbiB1bmhvb2sodk5vZGUsIHBhdGNoLCBpbmRleCkge1xuICAgIGlmIChpc1ZOb2RlKHZOb2RlKSkge1xuICAgICAgICBpZiAodk5vZGUuaG9va3MpIHtcbiAgICAgICAgICAgIHBhdGNoW2luZGV4XSA9IGFwcGVuZFBhdGNoKFxuICAgICAgICAgICAgICAgIHBhdGNoW2luZGV4XSxcbiAgICAgICAgICAgICAgICBuZXcgVlBhdGNoKFxuICAgICAgICAgICAgICAgICAgICBWUGF0Y2guUFJPUFMsXG4gICAgICAgICAgICAgICAgICAgIHZOb2RlLFxuICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWRLZXlzKHZOb2RlLmhvb2tzKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2Tm9kZS5kZXNjZW5kYW50SG9va3MgfHwgdk5vZGUuaGFzVGh1bmtzKSB7XG4gICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSB2Tm9kZS5jaGlsZHJlblxuICAgICAgICAgICAgdmFyIGxlbiA9IGNoaWxkcmVuLmxlbmd0aFxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldXG4gICAgICAgICAgICAgICAgaW5kZXggKz0gMVxuXG4gICAgICAgICAgICAgICAgdW5ob29rKGNoaWxkLCBwYXRjaCwgaW5kZXgpXG5cbiAgICAgICAgICAgICAgICBpZiAoaXNWTm9kZShjaGlsZCkgJiYgY2hpbGQuY291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gY2hpbGQuY291bnRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzVGh1bmsodk5vZGUpKSB7XG4gICAgICAgIHRodW5rcyh2Tm9kZSwgbnVsbCwgcGF0Y2gsIGluZGV4KVxuICAgIH1cbn1cblxuZnVuY3Rpb24gdW5kZWZpbmVkS2V5cyhvYmopIHtcbiAgICB2YXIgcmVzdWx0ID0ge31cblxuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSB1bmRlZmluZWRcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0XG59XG5cbi8vIExpc3QgZGlmZiwgbmFpdmUgbGVmdCB0byByaWdodCByZW9yZGVyaW5nXG5mdW5jdGlvbiByZW9yZGVyKGFDaGlsZHJlbiwgYkNoaWxkcmVuKSB7XG5cbiAgICB2YXIgYktleXMgPSBrZXlJbmRleChiQ2hpbGRyZW4pXG5cbiAgICBpZiAoIWJLZXlzKSB7XG4gICAgICAgIHJldHVybiBiQ2hpbGRyZW5cbiAgICB9XG5cbiAgICB2YXIgYUtleXMgPSBrZXlJbmRleChhQ2hpbGRyZW4pXG5cbiAgICBpZiAoIWFLZXlzKSB7XG4gICAgICAgIHJldHVybiBiQ2hpbGRyZW5cbiAgICB9XG5cbiAgICB2YXIgYk1hdGNoID0ge30sIGFNYXRjaCA9IHt9XG5cbiAgICBmb3IgKHZhciBhS2V5IGluIGJLZXlzKSB7XG4gICAgICAgIGJNYXRjaFtiS2V5c1thS2V5XV0gPSBhS2V5c1thS2V5XVxuICAgIH1cblxuICAgIGZvciAodmFyIGJLZXkgaW4gYUtleXMpIHtcbiAgICAgICAgYU1hdGNoW2FLZXlzW2JLZXldXSA9IGJLZXlzW2JLZXldXG4gICAgfVxuXG4gICAgdmFyIGFMZW4gPSBhQ2hpbGRyZW4ubGVuZ3RoXG4gICAgdmFyIGJMZW4gPSBiQ2hpbGRyZW4ubGVuZ3RoXG4gICAgdmFyIGxlbiA9IGFMZW4gPiBiTGVuID8gYUxlbiA6IGJMZW5cbiAgICB2YXIgc2h1ZmZsZSA9IFtdXG4gICAgdmFyIGZyZWVJbmRleCA9IDBcbiAgICB2YXIgaSA9IDBcbiAgICB2YXIgbW92ZUluZGV4ID0gMFxuICAgIHZhciBtb3ZlcyA9IHt9XG4gICAgdmFyIHJlbW92ZXMgPSBtb3Zlcy5yZW1vdmVzID0ge31cbiAgICB2YXIgcmV2ZXJzZSA9IG1vdmVzLnJldmVyc2UgPSB7fVxuICAgIHZhciBoYXNNb3ZlcyA9IGZhbHNlXG5cbiAgICB3aGlsZSAoZnJlZUluZGV4IDwgbGVuKSB7XG4gICAgICAgIHZhciBtb3ZlID0gYU1hdGNoW2ldXG4gICAgICAgIGlmIChtb3ZlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHNodWZmbGVbaV0gPSBiQ2hpbGRyZW5bbW92ZV1cbiAgICAgICAgICAgIGlmIChtb3ZlICE9PSBtb3ZlSW5kZXgpIHtcbiAgICAgICAgICAgICAgICBtb3Zlc1ttb3ZlXSA9IG1vdmVJbmRleFxuICAgICAgICAgICAgICAgIHJldmVyc2VbbW92ZUluZGV4XSA9IG1vdmVcbiAgICAgICAgICAgICAgICBoYXNNb3ZlcyA9IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1vdmVJbmRleCsrXG4gICAgICAgIH0gZWxzZSBpZiAoaSBpbiBhTWF0Y2gpIHtcbiAgICAgICAgICAgIHNodWZmbGVbaV0gPSB1bmRlZmluZWRcbiAgICAgICAgICAgIHJlbW92ZXNbaV0gPSBtb3ZlSW5kZXgrK1xuICAgICAgICAgICAgaGFzTW92ZXMgPSB0cnVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3aGlsZSAoYk1hdGNoW2ZyZWVJbmRleF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGZyZWVJbmRleCsrXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmcmVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgICAgICB2YXIgZnJlZUNoaWxkID0gYkNoaWxkcmVuW2ZyZWVJbmRleF1cbiAgICAgICAgICAgICAgICBpZiAoZnJlZUNoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNodWZmbGVbaV0gPSBmcmVlQ2hpbGRcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZyZWVJbmRleCAhPT0gbW92ZUluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNNb3ZlcyA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVzW2ZyZWVJbmRleF0gPSBtb3ZlSW5kZXhcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldmVyc2VbbW92ZUluZGV4XSA9IGZyZWVJbmRleFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG1vdmVJbmRleCsrXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZyZWVJbmRleCsrXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaSsrXG4gICAgfVxuXG4gICAgaWYgKGhhc01vdmVzKSB7XG4gICAgICAgIHNodWZmbGUubW92ZXMgPSBtb3Zlc1xuICAgIH1cblxuICAgIHJldHVybiBzaHVmZmxlXG59XG5cbmZ1bmN0aW9uIGtleUluZGV4KGNoaWxkcmVuKSB7XG4gICAgdmFyIGksIGtleXNcblxuICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuXG4gICAgICAgIGlmIChjaGlsZC5rZXkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAga2V5cyA9IGtleXMgfHwge31cbiAgICAgICAgICAgIGtleXNbY2hpbGQua2V5XSA9IGlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBrZXlzXG59XG5cbmZ1bmN0aW9uIGFwcGVuZFBhdGNoKGFwcGx5LCBwYXRjaCkge1xuICAgIGlmIChhcHBseSkge1xuICAgICAgICBpZiAoaXNBcnJheShhcHBseSkpIHtcbiAgICAgICAgICAgIGFwcGx5LnB1c2gocGF0Y2gpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcHBseSA9IFthcHBseSwgcGF0Y2hdXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXBwbHlcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcGF0Y2hcbiAgICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGV4dGVuZFxuXG5mdW5jdGlvbiBleHRlbmQodGFyZ2V0KSB7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXVxuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0YXJnZXRcbn1cbiIsInZhciBfYXJpdHkgPSByZXF1aXJlKCcuL2ludGVybmFsL19hcml0eScpO1xudmFyIF9jdXJyeTIgPSByZXF1aXJlKCcuL2ludGVybmFsL19jdXJyeTInKTtcblxuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IGlzIGJvdW5kIHRvIGEgY29udGV4dC5cbiAqIE5vdGU6IGBSLmJpbmRgIGRvZXMgbm90IHByb3ZpZGUgdGhlIGFkZGl0aW9uYWwgYXJndW1lbnQtYmluZGluZyBjYXBhYmlsaXRpZXMgb2ZcbiAqIFtGdW5jdGlvbi5wcm90b3R5cGUuYmluZF0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRnVuY3Rpb24vYmluZCkuXG4gKlxuICogQGZ1bmNcbiAqIEBtZW1iZXJPZiBSXG4gKiBAc2luY2UgdjAuNi4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBzZWUgUi5wYXJ0aWFsXG4gKiBAc2lnICgqIC0+ICopIC0+IHsqfSAtPiAoKiAtPiAqKVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGJpbmQgdG8gY29udGV4dFxuICogQHBhcmFtIHtPYmplY3R9IHRoaXNPYmogVGhlIGNvbnRleHQgdG8gYmluZCBgZm5gIHRvXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gQSBmdW5jdGlvbiB0aGF0IHdpbGwgZXhlY3V0ZSBpbiB0aGUgY29udGV4dCBvZiBgdGhpc09iamAuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gX2N1cnJ5MihmdW5jdGlvbiBiaW5kKGZuLCB0aGlzT2JqKSB7XG4gIHJldHVybiBfYXJpdHkoZm4ubGVuZ3RoLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhpc09iaiwgYXJndW1lbnRzKTtcbiAgfSk7XG59KTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gX2FyaXR5KG4sIGZuKSB7XG4gIC8vIGpzaGludCB1bnVzZWQ6dmFyc1xuICBzd2l0Y2ggKG4pIHtcbiAgICBjYXNlIDA6IHJldHVybiBmdW5jdGlvbigpIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYTApIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24oYTAsIGExKSB7IHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKGEwLCBhMSwgYTIpIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSA0OiByZXR1cm4gZnVuY3Rpb24oYTAsIGExLCBhMiwgYTMpIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSA1OiByZXR1cm4gZnVuY3Rpb24oYTAsIGExLCBhMiwgYTMsIGE0KSB7IHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9O1xuICAgIGNhc2UgNjogcmV0dXJuIGZ1bmN0aW9uKGEwLCBhMSwgYTIsIGEzLCBhNCwgYTUpIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSA3OiByZXR1cm4gZnVuY3Rpb24oYTAsIGExLCBhMiwgYTMsIGE0LCBhNSwgYTYpIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSA4OiByZXR1cm4gZnVuY3Rpb24oYTAsIGExLCBhMiwgYTMsIGE0LCBhNSwgYTYsIGE3KSB7IHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9O1xuICAgIGNhc2UgOTogcmV0dXJuIGZ1bmN0aW9uKGEwLCBhMSwgYTIsIGEzLCBhNCwgYTUsIGE2LCBhNywgYTgpIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSAxMDogcmV0dXJuIGZ1bmN0aW9uKGEwLCBhMSwgYTIsIGEzLCBhNCwgYTUsIGE2LCBhNywgYTgsIGE5KSB7IHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpOyB9O1xuICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgdG8gX2FyaXR5IG11c3QgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlciBubyBncmVhdGVyIHRoYW4gdGVuJyk7XG4gIH1cbn07XG4iLCIvKipcbiAqIE9wdGltaXplZCBpbnRlcm5hbCBvbmUtYXJpdHkgY3VycnkgZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGN1cnJ5LlxuICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBjdXJyaWVkIGZ1bmN0aW9uLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIF9jdXJyeTEoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGYxKGEpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGYxO1xuICAgIH0gZWxzZSBpZiAoYSAhPSBudWxsICYmIGFbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gZjE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfTtcbn07XG4iLCJ2YXIgX2N1cnJ5MSA9IHJlcXVpcmUoJy4vX2N1cnJ5MScpO1xuXG5cbi8qKlxuICogT3B0aW1pemVkIGludGVybmFsIHR3by1hcml0eSBjdXJyeSBmdW5jdGlvbi5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY3VycnkuXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gVGhlIGN1cnJpZWQgZnVuY3Rpb24uXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gX2N1cnJ5Mihmbikge1xuICByZXR1cm4gZnVuY3Rpb24gZjIoYSwgYikge1xuICAgIHZhciBuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBpZiAobiA9PT0gMCkge1xuICAgICAgcmV0dXJuIGYyO1xuICAgIH0gZWxzZSBpZiAobiA9PT0gMSAmJiBhICE9IG51bGwgJiYgYVsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBmMjtcbiAgICB9IGVsc2UgaWYgKG4gPT09IDEpIHtcbiAgICAgIHJldHVybiBfY3VycnkxKGZ1bmN0aW9uKGIpIHsgcmV0dXJuIGZuKGEsIGIpOyB9KTtcbiAgICB9IGVsc2UgaWYgKG4gPT09IDIgJiYgYSAhPSBudWxsICYmIGFbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGIgIT0gbnVsbCAmJiBiWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIGYyO1xuICAgIH0gZWxzZSBpZiAobiA9PT0gMiAmJiBhICE9IG51bGwgJiYgYVsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBfY3VycnkxKGZ1bmN0aW9uKGEpIHsgcmV0dXJuIGZuKGEsIGIpOyB9KTtcbiAgICB9IGVsc2UgaWYgKG4gPT09IDIgJiYgYiAhPSBudWxsICYmIGJbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gX2N1cnJ5MShmdW5jdGlvbihiKSB7IHJldHVybiBmbihhLCBiKTsgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmbihhLCBiKTtcbiAgICB9XG4gIH07XG59O1xuIiwidmFyIF9jdXJyeTEgPSByZXF1aXJlKCcuL19jdXJyeTEnKTtcbnZhciBfY3VycnkyID0gcmVxdWlyZSgnLi9fY3VycnkyJyk7XG5cblxuLyoqXG4gKiBPcHRpbWl6ZWQgaW50ZXJuYWwgdGhyZWUtYXJpdHkgY3VycnkgZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGN1cnJ5LlxuICogQHJldHVybiB7RnVuY3Rpb259IFRoZSBjdXJyaWVkIGZ1bmN0aW9uLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIF9jdXJyeTMoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGYzKGEsIGIsIGMpIHtcbiAgICB2YXIgbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgaWYgKG4gPT09IDApIHtcbiAgICAgIHJldHVybiBmMztcbiAgICB9IGVsc2UgaWYgKG4gPT09IDEgJiYgYSAhPSBudWxsICYmIGFbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gZjM7XG4gICAgfSBlbHNlIGlmIChuID09PSAxKSB7XG4gICAgICByZXR1cm4gX2N1cnJ5MihmdW5jdGlvbihiLCBjKSB7IHJldHVybiBmbihhLCBiLCBjKTsgfSk7XG4gICAgfSBlbHNlIGlmIChuID09PSAyICYmIGEgIT0gbnVsbCAmJiBhWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICBiICE9IG51bGwgJiYgYlsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBmMztcbiAgICB9IGVsc2UgaWYgKG4gPT09IDIgJiYgYSAhPSBudWxsICYmIGFbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gX2N1cnJ5MihmdW5jdGlvbihhLCBjKSB7IHJldHVybiBmbihhLCBiLCBjKTsgfSk7XG4gICAgfSBlbHNlIGlmIChuID09PSAyICYmIGIgIT0gbnVsbCAmJiBiWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIF9jdXJyeTIoZnVuY3Rpb24oYiwgYykgeyByZXR1cm4gZm4oYSwgYiwgYyk7IH0pO1xuICAgIH0gZWxzZSBpZiAobiA9PT0gMikge1xuICAgICAgcmV0dXJuIF9jdXJyeTEoZnVuY3Rpb24oYykgeyByZXR1cm4gZm4oYSwgYiwgYyk7IH0pO1xuICAgIH0gZWxzZSBpZiAobiA9PT0gMyAmJiBhICE9IG51bGwgJiYgYVsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYiAhPSBudWxsICYmIGJbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGMgIT0gbnVsbCAmJiBjWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIGYzO1xuICAgIH0gZWxzZSBpZiAobiA9PT0gMyAmJiBhICE9IG51bGwgJiYgYVsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYiAhPSBudWxsICYmIGJbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gX2N1cnJ5MihmdW5jdGlvbihhLCBiKSB7IHJldHVybiBmbihhLCBiLCBjKTsgfSk7XG4gICAgfSBlbHNlIGlmIChuID09PSAzICYmIGEgIT0gbnVsbCAmJiBhWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICBjICE9IG51bGwgJiYgY1snQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBfY3VycnkyKGZ1bmN0aW9uKGEsIGMpIHsgcmV0dXJuIGZuKGEsIGIsIGMpOyB9KTtcbiAgICB9IGVsc2UgaWYgKG4gPT09IDMgJiYgYiAhPSBudWxsICYmIGJbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGMgIT0gbnVsbCAmJiBjWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIF9jdXJyeTIoZnVuY3Rpb24oYiwgYykgeyByZXR1cm4gZm4oYSwgYiwgYyk7IH0pO1xuICAgIH0gZWxzZSBpZiAobiA9PT0gMyAmJiBhICE9IG51bGwgJiYgYVsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBfY3VycnkxKGZ1bmN0aW9uKGEpIHsgcmV0dXJuIGZuKGEsIGIsIGMpOyB9KTtcbiAgICB9IGVsc2UgaWYgKG4gPT09IDMgJiYgYiAhPSBudWxsICYmIGJbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gX2N1cnJ5MShmdW5jdGlvbihiKSB7IHJldHVybiBmbihhLCBiLCBjKTsgfSk7XG4gICAgfSBlbHNlIGlmIChuID09PSAzICYmIGMgIT0gbnVsbCAmJiBjWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIF9jdXJyeTEoZnVuY3Rpb24oYykgeyByZXR1cm4gZm4oYSwgYiwgYyk7IH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZm4oYSwgYiwgYyk7XG4gICAgfVxuICB9O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gX2hhcyhwcm9wLCBvYmopIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufTtcbiIsIi8qKlxuICogVGVzdHMgd2hldGhlciBvciBub3QgYW4gb2JqZWN0IGlzIGFuIGFycmF5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbCBUaGUgb2JqZWN0IHRvIHRlc3QuXG4gKiBAcmV0dXJuIHtCb29sZWFufSBgdHJ1ZWAgaWYgYHZhbGAgaXMgYW4gYXJyYXksIGBmYWxzZWAgb3RoZXJ3aXNlLlxuICogQGV4YW1wbGVcbiAqXG4gKiAgICAgIF9pc0FycmF5KFtdKTsgLy89PiB0cnVlXG4gKiAgICAgIF9pc0FycmF5KG51bGwpOyAvLz0+IGZhbHNlXG4gKiAgICAgIF9pc0FycmF5KHt9KTsgLy89PiBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gX2lzQXJyYXkodmFsKSB7XG4gIHJldHVybiAodmFsICE9IG51bGwgJiZcbiAgICAgICAgICB2YWwubGVuZ3RoID49IDAgJiZcbiAgICAgICAgICBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXldJyk7XG59O1xuIiwidmFyIF94d3JhcCA9IHJlcXVpcmUoJy4vX3h3cmFwJyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJy4uL2JpbmQnKTtcbnZhciBpc0FycmF5TGlrZSA9IHJlcXVpcmUoJy4uL2lzQXJyYXlMaWtlJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIF9hcnJheVJlZHVjZSh4ZiwgYWNjLCBsaXN0KSB7XG4gICAgdmFyIGlkeCA9IDAsIGxlbiA9IGxpc3QubGVuZ3RoO1xuICAgIHdoaWxlIChpZHggPCBsZW4pIHtcbiAgICAgIGFjYyA9IHhmWydAQHRyYW5zZHVjZXIvc3RlcCddKGFjYywgbGlzdFtpZHhdKTtcbiAgICAgIGlmIChhY2MgJiYgYWNjWydAQHRyYW5zZHVjZXIvcmVkdWNlZCddKSB7XG4gICAgICAgIGFjYyA9IGFjY1snQEB0cmFuc2R1Y2VyL3ZhbHVlJ107XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWR4ICs9IDE7XG4gICAgfVxuICAgIHJldHVybiB4ZlsnQEB0cmFuc2R1Y2VyL3Jlc3VsdCddKGFjYyk7XG4gIH1cblxuICBmdW5jdGlvbiBfaXRlcmFibGVSZWR1Y2UoeGYsIGFjYywgaXRlcikge1xuICAgIHZhciBzdGVwID0gaXRlci5uZXh0KCk7XG4gICAgd2hpbGUgKCFzdGVwLmRvbmUpIHtcbiAgICAgIGFjYyA9IHhmWydAQHRyYW5zZHVjZXIvc3RlcCddKGFjYywgc3RlcC52YWx1ZSk7XG4gICAgICBpZiAoYWNjICYmIGFjY1snQEB0cmFuc2R1Y2VyL3JlZHVjZWQnXSkge1xuICAgICAgICBhY2MgPSBhY2NbJ0BAdHJhbnNkdWNlci92YWx1ZSddO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHN0ZXAgPSBpdGVyLm5leHQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHhmWydAQHRyYW5zZHVjZXIvcmVzdWx0J10oYWNjKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF9tZXRob2RSZWR1Y2UoeGYsIGFjYywgb2JqKSB7XG4gICAgcmV0dXJuIHhmWydAQHRyYW5zZHVjZXIvcmVzdWx0J10ob2JqLnJlZHVjZShiaW5kKHhmWydAQHRyYW5zZHVjZXIvc3RlcCddLCB4ZiksIGFjYykpO1xuICB9XG5cbiAgdmFyIHN5bUl0ZXJhdG9yID0gKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnKSA/IFN5bWJvbC5pdGVyYXRvciA6ICdAQGl0ZXJhdG9yJztcbiAgcmV0dXJuIGZ1bmN0aW9uIF9yZWR1Y2UoZm4sIGFjYywgbGlzdCkge1xuICAgIGlmICh0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGZuID0gX3h3cmFwKGZuKTtcbiAgICB9XG4gICAgaWYgKGlzQXJyYXlMaWtlKGxpc3QpKSB7XG4gICAgICByZXR1cm4gX2FycmF5UmVkdWNlKGZuLCBhY2MsIGxpc3QpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGxpc3QucmVkdWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gX21ldGhvZFJlZHVjZShmbiwgYWNjLCBsaXN0KTtcbiAgICB9XG4gICAgaWYgKGxpc3Rbc3ltSXRlcmF0b3JdICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBfaXRlcmFibGVSZWR1Y2UoZm4sIGFjYywgbGlzdFtzeW1JdGVyYXRvcl0oKSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgbGlzdC5uZXh0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gX2l0ZXJhYmxlUmVkdWNlKGZuLCBhY2MsIGxpc3QpO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdyZWR1Y2U6IGxpc3QgbXVzdCBiZSBhcnJheSBvciBpdGVyYWJsZScpO1xuICB9O1xufSkoKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBYV3JhcChmbikge1xuICAgIHRoaXMuZiA9IGZuO1xuICB9XG4gIFhXcmFwLnByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL2luaXQnXSA9IGZ1bmN0aW9uKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignaW5pdCBub3QgaW1wbGVtZW50ZWQgb24gWFdyYXAnKTtcbiAgfTtcbiAgWFdyYXAucHJvdG90eXBlWydAQHRyYW5zZHVjZXIvcmVzdWx0J10gPSBmdW5jdGlvbihhY2MpIHsgcmV0dXJuIGFjYzsgfTtcbiAgWFdyYXAucHJvdG90eXBlWydAQHRyYW5zZHVjZXIvc3RlcCddID0gZnVuY3Rpb24oYWNjLCB4KSB7XG4gICAgcmV0dXJuIHRoaXMuZihhY2MsIHgpO1xuICB9O1xuXG4gIHJldHVybiBmdW5jdGlvbiBfeHdyYXAoZm4pIHsgcmV0dXJuIG5ldyBYV3JhcChmbik7IH07XG59KCkpO1xuIiwidmFyIF9jdXJyeTEgPSByZXF1aXJlKCcuL2ludGVybmFsL19jdXJyeTEnKTtcbnZhciBfaXNBcnJheSA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvX2lzQXJyYXknKTtcblxuXG4vKipcbiAqIFRlc3RzIHdoZXRoZXIgb3Igbm90IGFuIG9iamVjdCBpcyBzaW1pbGFyIHRvIGFuIGFycmF5LlxuICpcbiAqIEBmdW5jXG4gKiBAbWVtYmVyT2YgUlxuICogQHNpbmNlIHYwLjUuMFxuICogQGNhdGVnb3J5IFR5cGVcbiAqIEBjYXRlZ29yeSBMaXN0XG4gKiBAc2lnICogLT4gQm9vbGVhblxuICogQHBhcmFtIHsqfSB4IFRoZSBvYmplY3QgdG8gdGVzdC5cbiAqIEByZXR1cm4ge0Jvb2xlYW59IGB0cnVlYCBpZiBgeGAgaGFzIGEgbnVtZXJpYyBsZW5ndGggcHJvcGVydHkgYW5kIGV4dHJlbWUgaW5kaWNlcyBkZWZpbmVkOyBgZmFsc2VgIG90aGVyd2lzZS5cbiAqIEBleGFtcGxlXG4gKlxuICogICAgICBSLmlzQXJyYXlMaWtlKFtdKTsgLy89PiB0cnVlXG4gKiAgICAgIFIuaXNBcnJheUxpa2UodHJ1ZSk7IC8vPT4gZmFsc2VcbiAqICAgICAgUi5pc0FycmF5TGlrZSh7fSk7IC8vPT4gZmFsc2VcbiAqICAgICAgUi5pc0FycmF5TGlrZSh7bGVuZ3RoOiAxMH0pOyAvLz0+IGZhbHNlXG4gKiAgICAgIFIuaXNBcnJheUxpa2UoezA6ICd6ZXJvJywgOTogJ25pbmUnLCBsZW5ndGg6IDEwfSk7IC8vPT4gdHJ1ZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IF9jdXJyeTEoZnVuY3Rpb24gaXNBcnJheUxpa2UoeCkge1xuICBpZiAoX2lzQXJyYXkoeCkpIHsgcmV0dXJuIHRydWU7IH1cbiAgaWYgKCF4KSB7IHJldHVybiBmYWxzZTsgfVxuICBpZiAodHlwZW9mIHggIT09ICdvYmplY3QnKSB7IHJldHVybiBmYWxzZTsgfVxuICBpZiAoeCBpbnN0YW5jZW9mIFN0cmluZykgeyByZXR1cm4gZmFsc2U7IH1cbiAgaWYgKHgubm9kZVR5cGUgPT09IDEpIHsgcmV0dXJuICEheC5sZW5ndGg7IH1cbiAgaWYgKHgubGVuZ3RoID09PSAwKSB7IHJldHVybiB0cnVlOyB9XG4gIGlmICh4Lmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4geC5oYXNPd25Qcm9wZXJ0eSgwKSAmJiB4Lmhhc093blByb3BlcnR5KHgubGVuZ3RoIC0gMSk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufSk7XG4iLCJ2YXIgX2N1cnJ5MSA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvX2N1cnJ5MScpO1xudmFyIF9oYXMgPSByZXF1aXJlKCcuL2ludGVybmFsL19oYXMnKTtcblxuXG4vKipcbiAqIFJldHVybnMgYSBsaXN0IGNvbnRhaW5pbmcgdGhlIG5hbWVzIG9mIGFsbCB0aGUgZW51bWVyYWJsZSBvd25cbiAqIHByb3BlcnRpZXMgb2YgdGhlIHN1cHBsaWVkIG9iamVjdC5cbiAqIE5vdGUgdGhhdCB0aGUgb3JkZXIgb2YgdGhlIG91dHB1dCBhcnJheSBpcyBub3QgZ3VhcmFudGVlZCB0byBiZVxuICogY29uc2lzdGVudCBhY3Jvc3MgZGlmZmVyZW50IEpTIHBsYXRmb3Jtcy5cbiAqXG4gKiBAZnVuY1xuICogQG1lbWJlck9mIFJcbiAqIEBzaW5jZSB2MC4xLjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBzaWcge2s6IHZ9IC0+IFtrXVxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIGV4dHJhY3QgcHJvcGVydGllcyBmcm9tXG4gKiBAcmV0dXJuIHtBcnJheX0gQW4gYXJyYXkgb2YgdGhlIG9iamVjdCdzIG93biBwcm9wZXJ0aWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiAgICAgIFIua2V5cyh7YTogMSwgYjogMiwgYzogM30pOyAvLz0+IFsnYScsICdiJywgJ2MnXVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgLy8gY292ZXIgSUUgPCA5IGtleXMgaXNzdWVzXG4gIHZhciBoYXNFbnVtQnVnID0gISh7dG9TdHJpbmc6IG51bGx9KS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgndG9TdHJpbmcnKTtcbiAgdmFyIG5vbkVudW1lcmFibGVQcm9wcyA9IFsnY29uc3RydWN0b3InLCAndmFsdWVPZicsICdpc1Byb3RvdHlwZU9mJywgJ3RvU3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAncHJvcGVydHlJc0VudW1lcmFibGUnLCAnaGFzT3duUHJvcGVydHknLCAndG9Mb2NhbGVTdHJpbmcnXTtcblxuICB2YXIgY29udGFpbnMgPSBmdW5jdGlvbiBjb250YWlucyhsaXN0LCBpdGVtKSB7XG4gICAgdmFyIGlkeCA9IDA7XG4gICAgd2hpbGUgKGlkeCA8IGxpc3QubGVuZ3RoKSB7XG4gICAgICBpZiAobGlzdFtpZHhdID09PSBpdGVtKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgaWR4ICs9IDE7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICByZXR1cm4gdHlwZW9mIE9iamVjdC5rZXlzID09PSAnZnVuY3Rpb24nID9cbiAgICBfY3VycnkxKGZ1bmN0aW9uIGtleXMob2JqKSB7XG4gICAgICByZXR1cm4gT2JqZWN0KG9iaikgIT09IG9iaiA/IFtdIDogT2JqZWN0LmtleXMob2JqKTtcbiAgICB9KSA6XG4gICAgX2N1cnJ5MShmdW5jdGlvbiBrZXlzKG9iaikge1xuICAgICAgaWYgKE9iamVjdChvYmopICE9PSBvYmopIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgICAgdmFyIHByb3AsIGtzID0gW10sIG5JZHg7XG4gICAgICBmb3IgKHByb3AgaW4gb2JqKSB7XG4gICAgICAgIGlmIChfaGFzKHByb3AsIG9iaikpIHtcbiAgICAgICAgICBrc1trcy5sZW5ndGhdID0gcHJvcDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGhhc0VudW1CdWcpIHtcbiAgICAgICAgbklkeCA9IG5vbkVudW1lcmFibGVQcm9wcy5sZW5ndGggLSAxO1xuICAgICAgICB3aGlsZSAobklkeCA+PSAwKSB7XG4gICAgICAgICAgcHJvcCA9IG5vbkVudW1lcmFibGVQcm9wc1tuSWR4XTtcbiAgICAgICAgICBpZiAoX2hhcyhwcm9wLCBvYmopICYmICFjb250YWlucyhrcywgcHJvcCkpIHtcbiAgICAgICAgICAgIGtzW2tzLmxlbmd0aF0gPSBwcm9wO1xuICAgICAgICAgIH1cbiAgICAgICAgICBuSWR4IC09IDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBrcztcbiAgICB9KTtcbn0oKSk7XG4iLCJ2YXIgX2N1cnJ5MiA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvX2N1cnJ5MicpO1xudmFyIGtleXMgPSByZXF1aXJlKCcuL2tleXMnKTtcblxuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBvYmplY3Qgd2l0aCB0aGUgb3duIHByb3BlcnRpZXMgb2YgYGFgXG4gKiBtZXJnZWQgd2l0aCB0aGUgb3duIHByb3BlcnRpZXMgb2Ygb2JqZWN0IGBiYC5cbiAqXG4gKiBAZnVuY1xuICogQG1lbWJlck9mIFJcbiAqIEBzaW5jZSB2MC4xLjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBzaWcge2s6IHZ9IC0+IHtrOiB2fSAtPiB7azogdn1cbiAqIEBwYXJhbSB7T2JqZWN0fSBhXG4gKiBAcGFyYW0ge09iamVjdH0gYlxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGV4YW1wbGVcbiAqXG4gKiAgICAgIFIubWVyZ2UoeyAnbmFtZSc6ICdmcmVkJywgJ2FnZSc6IDEwIH0sIHsgJ2FnZSc6IDQwIH0pO1xuICogICAgICAvLz0+IHsgJ25hbWUnOiAnZnJlZCcsICdhZ2UnOiA0MCB9XG4gKlxuICogICAgICB2YXIgcmVzZXRUb0RlZmF1bHQgPSBSLm1lcmdlKFIuX18sIHt4OiAwfSk7XG4gKiAgICAgIHJlc2V0VG9EZWZhdWx0KHt4OiA1LCB5OiAyfSk7IC8vPT4ge3g6IDAsIHk6IDJ9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gX2N1cnJ5MihmdW5jdGlvbiBtZXJnZShhLCBiKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgdmFyIGtzID0ga2V5cyhhKTtcbiAgdmFyIGlkeCA9IDA7XG4gIHdoaWxlIChpZHggPCBrcy5sZW5ndGgpIHtcbiAgICByZXN1bHRba3NbaWR4XV0gPSBhW2tzW2lkeF1dO1xuICAgIGlkeCArPSAxO1xuICB9XG4gIGtzID0ga2V5cyhiKTtcbiAgaWR4ID0gMDtcbiAgd2hpbGUgKGlkeCA8IGtzLmxlbmd0aCkge1xuICAgIHJlc3VsdFtrc1tpZHhdXSA9IGJba3NbaWR4XV07XG4gICAgaWR4ICs9IDE7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn0pO1xuIiwidmFyIF9jdXJyeTIgPSByZXF1aXJlKCcuL2ludGVybmFsL19jdXJyeTInKTtcblxuXG4vKipcbiAqIFJldHVybnMgYSBwYXJ0aWFsIGNvcHkgb2YgYW4gb2JqZWN0IGNvbnRhaW5pbmcgb25seSB0aGUga2V5cyBzcGVjaWZpZWQuICBJZiB0aGUga2V5IGRvZXMgbm90IGV4aXN0LCB0aGVcbiAqIHByb3BlcnR5IGlzIGlnbm9yZWQuXG4gKlxuICogQGZ1bmNcbiAqIEBtZW1iZXJPZiBSXG4gKiBAc2luY2UgdjAuMS4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAc2lnIFtrXSAtPiB7azogdn0gLT4ge2s6IHZ9XG4gKiBAcGFyYW0ge0FycmF5fSBuYW1lcyBhbiBhcnJheSBvZiBTdHJpbmcgcHJvcGVydHkgbmFtZXMgdG8gY29weSBvbnRvIGEgbmV3IG9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIGNvcHkgZnJvbVxuICogQHJldHVybiB7T2JqZWN0fSBBIG5ldyBvYmplY3Qgd2l0aCBvbmx5IHByb3BlcnRpZXMgZnJvbSBgbmFtZXNgIG9uIGl0LlxuICogQHNlZSBSLm9taXQsIFIucHJvcHNcbiAqIEBleGFtcGxlXG4gKlxuICogICAgICBSLnBpY2soWydhJywgJ2QnXSwge2E6IDEsIGI6IDIsIGM6IDMsIGQ6IDR9KTsgLy89PiB7YTogMSwgZDogNH1cbiAqICAgICAgUi5waWNrKFsnYScsICdlJywgJ2YnXSwge2E6IDEsIGI6IDIsIGM6IDMsIGQ6IDR9KTsgLy89PiB7YTogMX1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBfY3VycnkyKGZ1bmN0aW9uIHBpY2sobmFtZXMsIG9iaikge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIHZhciBpZHggPSAwO1xuICB3aGlsZSAoaWR4IDwgbmFtZXMubGVuZ3RoKSB7XG4gICAgaWYgKG5hbWVzW2lkeF0gaW4gb2JqKSB7XG4gICAgICByZXN1bHRbbmFtZXNbaWR4XV0gPSBvYmpbbmFtZXNbaWR4XV07XG4gICAgfVxuICAgIGlkeCArPSAxO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59KTtcbiIsInZhciBfY3VycnkzID0gcmVxdWlyZSgnLi9pbnRlcm5hbC9fY3VycnkzJyk7XG52YXIgX3JlZHVjZSA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvX3JlZHVjZScpO1xuXG5cbi8qKlxuICogUmV0dXJucyBhIHNpbmdsZSBpdGVtIGJ5IGl0ZXJhdGluZyB0aHJvdWdoIHRoZSBsaXN0LCBzdWNjZXNzaXZlbHkgY2FsbGluZyB0aGUgaXRlcmF0b3JcbiAqIGZ1bmN0aW9uIGFuZCBwYXNzaW5nIGl0IGFuIGFjY3VtdWxhdG9yIHZhbHVlIGFuZCB0aGUgY3VycmVudCB2YWx1ZSBmcm9tIHRoZSBhcnJheSwgYW5kXG4gKiB0aGVuIHBhc3NpbmcgdGhlIHJlc3VsdCB0byB0aGUgbmV4dCBjYWxsLlxuICpcbiAqIFRoZSBpdGVyYXRvciBmdW5jdGlvbiByZWNlaXZlcyB0d28gdmFsdWVzOiAqKGFjYywgdmFsdWUpKi4gIEl0IG1heSB1c2UgYFIucmVkdWNlZGAgdG9cbiAqIHNob3J0Y3V0IHRoZSBpdGVyYXRpb24uXG4gKlxuICogTm90ZTogYFIucmVkdWNlYCBkb2VzIG5vdCBza2lwIGRlbGV0ZWQgb3IgdW5hc3NpZ25lZCBpbmRpY2VzIChzcGFyc2UgYXJyYXlzKSwgdW5saWtlXG4gKiB0aGUgbmF0aXZlIGBBcnJheS5wcm90b3R5cGUucmVkdWNlYCBtZXRob2QuIEZvciBtb3JlIGRldGFpbHMgb24gdGhpcyBiZWhhdmlvciwgc2VlOlxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvcmVkdWNlI0Rlc2NyaXB0aW9uXG4gKiBAc2VlIFIucmVkdWNlZFxuICpcbiAqIERpc3BhdGNoZXMgdG8gdGhlIGByZWR1Y2VgIG1ldGhvZCBvZiB0aGUgdGhpcmQgYXJndW1lbnQsIGlmIHByZXNlbnQuXG4gKlxuICogQGZ1bmNcbiAqIEBtZW1iZXJPZiBSXG4gKiBAc2luY2UgdjAuMS4wXG4gKiBAY2F0ZWdvcnkgTGlzdFxuICogQHNpZyAoYSxiIC0+IGEpIC0+IGEgLT4gW2JdIC0+IGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBpdGVyYXRvciBmdW5jdGlvbi4gUmVjZWl2ZXMgdHdvIHZhbHVlcywgdGhlIGFjY3VtdWxhdG9yIGFuZCB0aGVcbiAqICAgICAgICBjdXJyZW50IGVsZW1lbnQgZnJvbSB0aGUgYXJyYXkuXG4gKiBAcGFyYW0geyp9IGFjYyBUaGUgYWNjdW11bGF0b3IgdmFsdWUuXG4gKiBAcGFyYW0ge0FycmF5fSBsaXN0IFRoZSBsaXN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEByZXR1cm4geyp9IFRoZSBmaW5hbCwgYWNjdW11bGF0ZWQgdmFsdWUuXG4gKiBAZXhhbXBsZVxuICpcbiAqICAgICAgdmFyIG51bWJlcnMgPSBbMSwgMiwgM107XG4gKiAgICAgIHZhciBhZGQgPSAoYSwgYikgPT4gYSArIGI7XG4gKlxuICogICAgICBSLnJlZHVjZShhZGQsIDEwLCBudW1iZXJzKTsgLy89PiAxNlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IF9jdXJyeTMoX3JlZHVjZSk7XG4iLCJ2YXIgX2N1cnJ5MSA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvX2N1cnJ5MScpO1xudmFyIGtleXMgPSByZXF1aXJlKCcuL2tleXMnKTtcblxuXG4vKipcbiAqIFJldHVybnMgYSBsaXN0IG9mIGFsbCB0aGUgZW51bWVyYWJsZSBvd24gcHJvcGVydGllcyBvZiB0aGUgc3VwcGxpZWQgb2JqZWN0LlxuICogTm90ZSB0aGF0IHRoZSBvcmRlciBvZiB0aGUgb3V0cHV0IGFycmF5IGlzIG5vdCBndWFyYW50ZWVkIGFjcm9zc1xuICogZGlmZmVyZW50IEpTIHBsYXRmb3Jtcy5cbiAqXG4gKiBAZnVuY1xuICogQG1lbWJlck9mIFJcbiAqIEBzaW5jZSB2MC4xLjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBzaWcge2s6IHZ9IC0+IFt2XVxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIGV4dHJhY3QgdmFsdWVzIGZyb21cbiAqIEByZXR1cm4ge0FycmF5fSBBbiBhcnJheSBvZiB0aGUgdmFsdWVzIG9mIHRoZSBvYmplY3QncyBvd24gcHJvcGVydGllcy5cbiAqIEBleGFtcGxlXG4gKlxuICogICAgICBSLnZhbHVlcyh7YTogMSwgYjogMiwgYzogM30pOyAvLz0+IFsxLCAyLCAzXVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IF9jdXJyeTEoZnVuY3Rpb24gdmFsdWVzKG9iaikge1xuICB2YXIgcHJvcHMgPSBrZXlzKG9iaik7XG4gIHZhciBsZW4gPSBwcm9wcy5sZW5ndGg7XG4gIHZhciB2YWxzID0gW107XG4gIHZhciBpZHggPSAwO1xuICB3aGlsZSAoaWR4IDwgbGVuKSB7XG4gICAgdmFsc1tpZHhdID0gb2JqW3Byb3BzW2lkeF1dO1xuICAgIGlkeCArPSAxO1xuICB9XG4gIHJldHVybiB2YWxzO1xufSk7XG4iLCJ2YXIgbWVyZ2UgPSByZXF1aXJlKCdyYW1kYS9zcmMvbWVyZ2UnKTtcbnZhciBwaWNrID0gcmVxdWlyZSgncmFtZGEvc3JjL3BpY2snKTtcbnZhciB2YWx1ZXMgPSByZXF1aXJlKCdyYW1kYS9zcmMvdmFsdWVzJyk7XG52YXIgcmVkdWNlID0gcmVxdWlyZSgncmFtZGEvc3JjL3JlZHVjZScpO1xudmFyIHN0eWxlcyA9IHJlcXVpcmUoJy4vc3R5bGVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRTdHlsZShleHRlbmRlZFN0eWxlLCBzdHlsZU5hbWVzKSB7XG4gIHZhciBzdHlsZU5hbWVzV2l0aERlZmF1bHQgPSBbJ290RGVmYXVsdHMnXS5jb25jYXQoc3R5bGVOYW1lcyB8fCBbXSk7XG4gIHZhciBzdHlsZXNXaXRoRGVmYXVsdCA9IHZhbHVlcyhwaWNrKHN0eWxlTmFtZXNXaXRoRGVmYXVsdCwgc3R5bGVzKSk7XG4gIHZhciBzdHlsZXNXaXRoRXh0ZW5kZWQgPSBzdHlsZXNXaXRoRGVmYXVsdC5jb25jYXQoW2V4dGVuZGVkU3R5bGUgfHwge31dKTtcbiAgcmV0dXJuIHJlZHVjZShtZXJnZSwge30sIHN0eWxlc1dpdGhFeHRlbmRlZCk7XG59XG4iLCJ2YXIgaCA9IHJlcXVpcmUoJ21lcmN1cnknKS5oO1xudmFyIHBhcnR5U2l6ZVBpY2tlciA9IHJlcXVpcmUoJy4vcGFydHktc2l6ZS1waWNrZXInKTtcbnZhciBidWlsZFN0eWxlID0gcmVxdWlyZSgnLi4vYnVpbGQtc3R5bGUnKTtcblxudmFyIHN0eWxlcyA9IHtcbiAgZGF0ZVBpY2tlcjogYnVpbGRTdHlsZSh7fSwgWydwaWNrZXJTZWxlY3RvciddKSxcbiAgZGF0ZVBpY2tlckxpbms6IGJ1aWxkU3R5bGUoe30sIFsncGlja2VyTGFiZWwnXSlcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGF0ZVBpY2tlcihzdGF0ZSkge1xuICByZXR1cm4gaCgnZGl2Jywge1xuICAgIHN0eWxlOiBzdHlsZXMuZGF0ZVBpY2tlclxuICB9LCBbXG4gICAgaCgnYScsIHtcbiAgICAgIHN0eWxlOiBzdHlsZXMuZGF0ZVBpY2tlckxpbmtcbiAgICB9LCAnT2N0IDI5LCAyMDE1JyksXG4gIF0pO1xufVxuIiwidmFyIGggPSByZXF1aXJlKCdtZXJjdXJ5JykuaDtcbnZhciBidWlsZFN0eWxlID0gcmVxdWlyZSgnLi4vYnVpbGQtc3R5bGUnKTtcblxudmFyIHN0eWxlcyA9IHtcbiAgcGlja2VyOiBidWlsZFN0eWxlKHtcbiAgICBmbG9hdDogJ2xlZnQnLFxuICAgIGhlaWdodDogJzQ4cHgnLFxuICAgIGxpbmVIZWlnaHQ6ICcxOS4ycHgnLFxuICAgIHdpZHRoOiAnMTU3Ljc5N3B4JyxcbiAgfSksXG4gIHBpY2tlckxpbms6IGJ1aWxkU3R5bGUoe30sIFsncGlja2VyTGFiZWwnXSksXG4gIHNlbGVjdDogYnVpbGRTdHlsZSh7XG4gICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXG4gICAgYmFja2dyb3VuZENvbG9yOiAncmdiKDI1NSwgMjU1LCAyNTUpJyxcbiAgICBib3JkZXJCb3R0b21Db2xvcjogJ3JnYigxNjYsIDE2NiwgMTY2KScsXG4gICAgYm9yZGVyQm90dG9tTGVmdFJhZGl1czogJzBweCcsXG4gICAgYm9yZGVyQm90dG9tUmlnaHRSYWRpdXM6ICcwcHgnLFxuICAgIGJvcmRlckJvdHRvbVN0eWxlOiAnc29saWQnLFxuICAgIGJvcmRlckJvdHRvbVdpZHRoOiAnMXB4JyxcbiAgICBib3JkZXJJbWFnZU91dHNldDogJzBweCcsXG4gICAgYm9yZGVySW1hZ2VSZXBlYXQ6ICdzdHJldGNoJyxcbiAgICBib3JkZXJJbWFnZVNsaWNlOiAnMTAwJScsXG4gICAgYm9yZGVySW1hZ2VTb3VyY2U6ICdub25lJyxcbiAgICBib3JkZXJJbWFnZVdpZHRoOiAnMScsXG4gICAgYm9yZGVyTGVmdENvbG9yOiAncmdiKDE2NiwgMTY2LCAxNjYpJyxcbiAgICBib3JkZXJMZWZ0U3R5bGU6ICdzb2xpZCcsXG4gICAgYm9yZGVyTGVmdFdpZHRoOiAnMXB4JyxcbiAgICBib3JkZXJSaWdodENvbG9yOiAncmdiKDE2NiwgMTY2LCAxNjYpJyxcbiAgICBib3JkZXJSaWdodFN0eWxlOiAnc29saWQnLFxuICAgIGJvcmRlclJpZ2h0V2lkdGg6ICcxcHgnLFxuICAgIGJvcmRlclRvcENvbG9yOiAncmdiKDE2NiwgMTY2LCAxNjYpJyxcbiAgICBib3JkZXJUb3BMZWZ0UmFkaXVzOiAnMHB4JyxcbiAgICBib3JkZXJUb3BSaWdodFJhZGl1czogJzBweCcsXG4gICAgYm9yZGVyVG9wU3R5bGU6ICdzb2xpZCcsXG4gICAgYm9yZGVyVG9wV2lkdGg6ICcxcHgnLFxuICAgIGJveFNpemluZzogJ2JvcmRlci1ib3gnLFxuICAgIGNvbG9yOiAncmdiKDUxLCA1MSwgNTEpJyxcbiAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICBkaXNwbGF5OiAnYmxvY2snLFxuICAgIGhlaWdodDogJzQ4cHgnLFxuICAgIGxldHRlclNwYWNpbmc6ICdub3JtYWwnLFxuICAgIGxpbmVIZWlnaHQ6ICcxOS4ycHgnLFxuICAgIG1hcmdpbkJvdHRvbTogJzBweCcsXG4gICAgbWFyZ2luTGVmdDogJzBweCcsXG4gICAgbWFyZ2luUmlnaHQ6ICcwcHgnLFxuICAgIG1hcmdpblRvcDogJzBweCcsXG4gICAgb3BhY2l0eTogJzAnLFxuICAgIG92ZXJmbG93WDogJ3Zpc2libGUnLFxuICAgIG92ZXJmbG93WTogJ3Zpc2libGUnLFxuICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgIHRleHRBbGlnbjogJ3N0YXJ0JyxcbiAgICB0ZXh0SW5kZW50OiAnMHB4JyxcbiAgICB0ZXh0UmVuZGVyaW5nOiAnYXV0bycsXG4gICAgdGV4dFNoYWRvdzogJ25vbmUnLFxuICAgIHRleHRUcmFuc2Zvcm06ICdub25lJyxcbiAgICB0b3A6ICcwcHgnLFxuICAgIHdoaXRlU3BhY2U6ICdwcmUnLFxuICAgIHdpZHRoOiAnMTU3Ljc5N3B4JyxcbiAgICB3b3JkU3BhY2luZzogJzBweCcsXG4gICAgd3JpdGluZ01vZGU6ICdsci10YicsXG4gICAgekluZGV4OiAnMicsXG4gIH0pLFxuICBvcHRpb246IGJ1aWxkU3R5bGUoe1xuICAgIGNvbG9yOiAncmdiKDUxLCA1MSwgNTEpJyxcbiAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICBkaXNwbGF5OiAnYmxvY2snLFxuICAgIGhlaWdodDogJ2F1dG8nLFxuICAgIGxldHRlclNwYWNpbmc6ICdub3JtYWwnLFxuICAgIGxpbmVIZWlnaHQ6ICdub3JtYWwnLFxuICAgIG1pbkhlaWdodDogJzE5LjJweCcsXG4gICAgcGFkZGluZ0JvdHRvbTogJzFweCcsXG4gICAgcGFkZGluZ0xlZnQ6ICcycHgnLFxuICAgIHBhZGRpbmdSaWdodDogJzJweCcsXG4gICAgcGFkZGluZ1RvcDogJzBweCcsXG4gICAgdGV4dEFsaWduOiAnc3RhcnQnLFxuICAgIHRleHRJbmRlbnQ6ICcwcHgnLFxuICAgIHRleHRTaGFkb3c6ICdub25lJyxcbiAgICB0ZXh0VHJhbnNmb3JtOiAnbm9uZScsXG4gICAgd2hpdGVTcGFjZTogJ3ByZScsXG4gICAgd2lkdGg6ICdhdXRvJyxcbiAgICB3b3JkU3BhY2luZzogJzBweCcsXG4gIH0pXG59O1xuXG5mdW5jdGlvbiBvcHRpb24oY291bnQpIHtcbiAgcmV0dXJuIGgoJ29wdGlvbicsIHtcbiAgICB2YWx1ZTogY291bnQsXG4gICAgc3R5bGU6IHN0eWxlcy5vcHRpb25cbiAgfSwgY291bnQgKyAnIHBlb3BsZScpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGR0cFBpY2tlckZvcm0oc3RhdGUpIHtcbiAgdmFyIG9wdGlvbnMgPSBbMSwgMiwgM10ubWFwKG9wdGlvbik7XG5cbiAgcmV0dXJuIGgoJ2RpdicsIHtcbiAgICAgIHN0eWxlOiBzdHlsZXMucGlja2VyXG4gICAgfSwgW1xuICAgICAgaCgnYScsIHtcbiAgICAgICAgc3R5bGU6IHN0eWxlcy5waWNrZXJMaW5rXG4gICAgICB9LCBzdGF0ZS52aWV3TW9kZWwucGFydHlTaXplICsgJyBwZW9wbGUnKSxcblxuICAgICAgaCgnc2VsZWN0Jywge1xuICAgICAgICBzdHlsZTogc3R5bGVzLnNlbGVjdFxuICAgICAgfSwgb3B0aW9ucylcbiAgICBdXG4gICk7XG59XG4iLCJ2YXIgaCA9IHJlcXVpcmUoJ21lcmN1cnknKS5oO1xudmFyIHBhcnR5U2l6ZVBpY2tlciA9IHJlcXVpcmUoJy4vcGFydHktc2l6ZS1waWNrZXInKTtcbnZhciBkYXRlUGlja2VyID0gcmVxdWlyZSgnLi9kYXRlLXBpY2tlcicpO1xudmFyIGJ1aWxkU3R5bGUgPSByZXF1aXJlKCcuLi9idWlsZC1zdHlsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGR0cFBpY2tlckZvcm0oc3RhdGUpIHtcbiAgcmV0dXJuIGgoJ2Zvcm0nLCB7XG4gICAgc3R5bGU6IGJ1aWxkU3R5bGUoeyBoZWlnaHQ6ICczZW0nIH0pXG4gIH0sIFtcbiAgICBwYXJ0eVNpemVQaWNrZXIoc3RhdGUpLFxuICAgIGRhdGVQaWNrZXIoc3RhdGUpXG4gIF0pO1xufVxuIiwidmFyIGhnID0gcmVxdWlyZSgnbWVyY3VyeScpO1xudmFyIGggPSBoZy5oO1xudmFyIHBpY2tlckZvcm0gPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvcGlja2VyLWZvcm0nKTtcblxuZnVuY3Rpb24gZ2V0SW5pdGlhbFZpZXdNb2RlbCgpIHtcbiAgcmV0dXJuIHtcbiAgICBzaG93U2VhcmNoOiBmYWxzZSxcbiAgICB0aW1lOiAnMjM6MzAnLFxuICAgIGRhdGU6ICcyMDE1LTEwLTEwJyxcbiAgICBwYXJ0eVNpemU6IDIsXG4gICAgdGltZU9wdGlvbnM6IFtcbiAgICAgIHtcbiAgICAgICAgdmFsdWU6ICcyMzozMCcsXG4gICAgICAgIGRpc3BsYXlWYWx1ZTogJzIzOjMwJyxcbiAgICAgIH1cbiAgICBdLFxuICAgIHBhcnR5U2l6ZVNpbmd1bGFyOiAnMSBwZXJzb24nLFxuICAgIHBhcnR5U2l6ZVBsdXJhbDogJzIgcGVvcGxlJyxcbiAgICBwYXJ0eVNpemVMYXJnZXJQYXJ0eTogJ0xhcmdlciBwYXJ0eScsXG4gICAgZmluZEFUYWJsZTogJ0ZpbmQgYSBUYWJsZScsXG4gICAgYXV0b2NvbXBsZXRlUGxhY2Vob2xkZXI6ICdMb2NhdGlvbiBvciBSZXN0YXVyYW50JyxcbiAgICB0aW1lem9uZU9mZnNldDogLTQyMCxcbiAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICBzaG93TGFyZ2VyUGFydHk6IHRydWVcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRJbml0aWFsQXBwU3RhdGUoKSB7XG4gIHJldHVybiBoZy5zdGF0ZSh7XG4gICAgdmlld01vZGVsOiBoZy5zdHJ1Y3QoZ2V0SW5pdGlhbFZpZXdNb2RlbCgpKSxcbiAgICBjaGFubmVsczoge31cbiAgfSk7XG59XG5cblxuZnVuY3Rpb24gcmVuZGVyKHN0YXRlKSB7XG4gIHJldHVybiBwaWNrZXJGb3JtKHN0YXRlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHJlbmRlcjogZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICBoZy5hcHAoZWwsIGdldEluaXRpYWxBcHBTdGF0ZSgpLCByZW5kZXIpO1xuICB9XG59O1xuXG4vLyA8JSB2YXIgZXh0cmFDc3NDbGFzcyA9IHNob3dTZWFyY2ggPyBcIiB3aXRoLXNlYXJjaFwiIDogXCJcIjsgJT5cbi8vIDxkaXYgY2xhc3M9XCJkdHAtcGlja2VyIGhpZGUgZHRwLWxhbmctPCUtIGxhbmd1YWdlICsgZXh0cmFDc3NDbGFzcyAlPlwiPlxuLy8gICA8Zm9ybSBjbGFzcz1cImR0cC1waWNrZXItZm9ybVwiPlxuLy8gICAgIDwlIGlmICh0aW1lem9uZU9mZnNldCAhPSBudWxsKSAlPlxuLy8gICAgICAgPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwidGltZXpvbmVPZmZzZXRcIi8+XG4vLyAgICAgPCUgfSAlPlxuLy8gICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzPVwiZGF0ZS1waWNrZXIgZHRwLXBpY2tlci1zZWxlY3RvclwiLz5cbi8vICAgICA8c2VsZWN0IGNsYXNzPVwidGltZS1waWNrZXIgaGlkZVwiPlxuLy8gICAgICAgPCUgZm9yICh2YXIgaSA9IDE7IGkgPCAoc2hvd0xhcmdlclBhcnR5ID8gMjIgOiAyMSk7IGkrKykgeyAlPlxuLy8gICAgICAgICA8JSBpc1NlbGVjdGVkID0gaSA9PT0gcGFydHlTaXplOyAlPlxuLy8gICAgICAgICA8JSB2YXIgZGlzcGxheVZhbHVlID0gcGFydHlTaXplUGx1cmFsLnJlcGxhY2UoJ3swfScsIGkpOyAlPlxuXG4vLyAgICAgICAgIDwlIGlmIChpID09PSAxKSB7ICU+XG4vLyAgICAgICAgICAgPCUgZGlzcGxheVZhbHVlID0gcGFydHlTaXplU2luZ3VsYXIucmVwbGFjZSgnezB9JywgaSk7ICU+XG4vLyAgICAgICAgIDwlIH0gZWxzZSBpZihpID09PSAyMSkgIHsgJT5cbi8vICAgICAgICAgICA8JSBkaXNwbGF5VmFsdWUgPSBwYXJ0eVNpemVMYXJnZXJQYXJ0eTsgJT5cbi8vICAgICAgICAgPCUgfSAlPlxuXG4vLyAgICAgICAgIDwlIGlmKGlzU2VsZWN0ZWQpICU+XG4vLyAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT08JS0gaSAlPiBzZWxlY3RlZD1cInNlbGVjdGVkXCI+IDxvcHRpb24+XG4vLyAgICAgICAgIDwlIGVsc2UgJT5cbi8vICAgICAgICAgICA8b3B0aW9uIHZhbHVlPTwlLSBpICU+PiA8JS0gZGlzcGxheVZhbHVlICU+IDxvcHRpb24+XG4vLyAgICAgICAgIDwlIH0gJT5cbi8vICAgICAgIDwlIH0gJT5cbi8vICAgICAgIDwhLS0gaW5jb21wbGV0ZSAtLT5cbi8vICAgICA8L3NlbGVjdD5cbi8vICAgICA8aW5wdXQgdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwiYnV0dG9uIGR0cC1waWNrZXItYnV0dG9uXCIvPlxuLy8gICA8L2Zvcm0+XG4vLyA8L2Rpdj5cblxuXG4vKipcbiAqIER0cCAtIGJpbmRzIGFjdGlvbnMgdG8gZXZlbnRzIGFuZCBzZXRzIHRoZSBwcm9wZXIganMgdG8gc3R5bGUgbWVudXNcbiAqXG4gKi9cblxuLy8gT1QuY3JlYXRlTlMoJ09ULkNvbW1vbi5EdHAnKTtcblxuLy8gT1QuQ29tbW9uLkR0cCA9IChmdW5jdGlvbigkLCBfLCBtb21lbnQpe1xuLy8gICAndXNlIHN0cmljdCc7XG5cbi8vICAgdmFyIHNlbGVjdG9ycyA9IHtcbi8vICAgICBwYXJ0eVNpemVQaWNrZXI6ICcucGFydHktc2l6ZS1waWNrZXInLFxuLy8gICAgIHRpbWVQaWNrZXI6ICcudGltZS1waWNrZXInLFxuLy8gICAgIGRhdGVQaWNrZXI6ICcuZGF0ZS1waWNrZXInLFxuLy8gICAgIHNlYXJjaFRleHQ6ICcuZHRwLXBpY2tlci1zZWFyY2gnLFxuLy8gICAgIGR0cEZvcm06ICcuZHRwLXBpY2tlci1mb3JtJyxcbi8vICAgICB0aW1lem9uZU9mZnNldDogJ2lucHV0W25hbWU9XCJ0aW1lem9uZU9mZnNldFwiXSdcbi8vICAgfTtcblxuLy8gICB2YXIgRFRQX0NPT0tJRV9JREVOVElGSUVSID0gXCJPVF9kdHBfdmFsdWVzXCIsXG4vLyAgICAgICBEVFBfQ09PS0lFX01BWEFHRSA9IDM2NSoyNCo2MCo2MCoxMDAwO1xuXG4vLyAgIHZhciB0YWJJbmRleENvdW50ZXIgPSAwLFxuLy8gICAgICAgX3ZhbGlkYXRlRGF0ZVRpbWUgPSB0cnVlLFxuLy8gICAgICAgX3Nob3VsZEVtaXRDaGFuZ2VkRXZlbnQgPSB0cnVlO1xuXG4vLyAgIHZhciBjb29raWVzID0ge1xuLy8gICAgIGdldDogZnVuY3Rpb24oa2V5KXtcbi8vICAgICAgIHZhciBjb29raWVkID0gT1QuQ29tbW9uLkNvb2tpZXMuZ2V0KERUUF9DT09LSUVfSURFTlRJRklFUik7XG4vLyAgICAgICByZXR1cm4gdHlwZW9mKGtleSkgPT09ICdzdHJpbmcnID8gKCghIWNvb2tpZWQgJiYgISFjb29raWVkW2tleV0pID8gY29va2llZFtrZXldIDogdW5kZWZpbmVkKTogY29va2llZDtcbi8vICAgICB9LFxuLy8gICAgIHNldDogZnVuY3Rpb24odmFsdWVzKXtcbi8vICAgICAgIHZhciBjb29raWVkVmFsdWVzID0ge307XG4vLyAgICAgICBjb29raWVkVmFsdWVzW0RUUF9DT09LSUVfSURFTlRJRklFUl0gPSBfLnBpY2sodmFsdWVzLCAnY292ZXJzJywgJ2RhdGV0aW1lJyk7XG5cbi8vICAgICAgIHJldHVybiBPVC5Db21tb24uQ29va2llcy5zZXQoY29va2llZFZhbHVlcywgRFRQX0NPT0tJRV9NQVhBR0UpO1xuLy8gICAgIH1cbi8vICAgfTtcblxuLy8gICB2YXIgZ2V0TWV0cm9PZmZzZXQgPSBmdW5jdGlvbigkZHRwKXtcbi8vICAgICB2YXIgbWV0cm9PZmZzZXQgPSAwLFxuLy8gICAgICAgICAkZHRwT2Zmc2V0ID0gJGR0cCA/ICRkdHAuZmluZChzZWxlY3RvcnMudGltZXpvbmVPZmZzZXQpIDogW107XG5cbi8vICAgICBpZigkZHRwT2Zmc2V0Lmxlbmd0aCA+IDApe1xuLy8gICAgICAgbWV0cm9PZmZzZXQgPSAkZHRwT2Zmc2V0LnZhbCgpO1xuLy8gICAgIH0gZWxzZSBpZighIXBhZ2VEYXRhICYmIHBhZ2VEYXRhLmhlYWRlclRpbWV6b25lT2Zmc2V0KXtcbi8vICAgICAgIG1ldHJvT2Zmc2V0ID0gcGFnZURhdGEuaGVhZGVyVGltZXpvbmVPZmZzZXQ7XG4vLyAgICAgfVxuXG4vLyAgICAgcmV0dXJuIG1ldHJvT2Zmc2V0O1xuLy8gICB9O1xuXG4vLyAgIHZhciBnZXRNZXRyb0RhdGVUaW1lID0gZnVuY3Rpb24oJGR0cCl7XG4vLyAgICAgcmV0dXJuIG1vbWVudCgpLnV0YygpLmFkZChnZXRNZXRyb09mZnNldCgkZHRwKSwgJ20nKTtcbi8vICAgfTtcblxuLy8gICB2YXIgc2V0VGFiSW5kZXhlcyA9IGZ1bmN0aW9uKGlucHV0cywgc3RhcnRJbmRleCl7XG4vLyAgICAgaW5wdXRzLnBhcnR5U2l6ZVBpY2tlci5hdHRyKFwidGFiaW5kZXhcIiwgc3RhcnRJbmRleCArIDEpO1xuLy8gICAgIGlucHV0cy5kYXRlUGlja2VyLmF0dHIoXCJ0YWJpbmRleFwiLCBzdGFydEluZGV4ICsgMik7XG4vLyAgICAgaW5wdXRzLnRpbWVQaWNrZXIuYXR0cihcInRhYmluZGV4XCIsIHN0YXJ0SW5kZXggKyAzKTtcbi8vICAgICBpbnB1dHMuc2VhcmNoVGV4dC5hdHRyKFwidGFiaW5kZXhcIiwgc3RhcnRJbmRleCArIDQpO1xuLy8gICAgIGlucHV0cy5zZWFyY2hCdXR0b24uYXR0cihcInRhYmluZGV4XCIsIHN0YXJ0SW5kZXggKyA1KTtcblxuLy8gICAgIHJldHVybiBzdGFydEluZGV4ICsgNTtcbi8vICAgfTtcblxuLy8gICB2YXIgc2V0SGlnaGxpZ2h0aW5nID0gZnVuY3Rpb24oZm9ybUlucHV0cywgbGFiZWxJbnB1dHMpe1xuXG4vLyAgICAgdmFyIGhpZ2hsaWdodE9uRm9jdXMgPSBmdW5jdGlvbigkZm9ybUlucHV0LCAkbGFiZWxJbnB1dCl7XG4vLyAgICAgICAkZm9ybUlucHV0LmZvY3VzKGZ1bmN0aW9uKCl7XG4vLyAgICAgICAgICRsYWJlbElucHV0LmFkZENsYXNzKCdoaWdobGlnaHRlZCcpO1xuLy8gICAgICAgfSk7XG4vLyAgICAgfTtcblxuLy8gICAgIHZhciB1bmhpZ2hsaWdodE9uQmx1ciA9IGZ1bmN0aW9uKCRmb3JtSW5wdXQsICRsYWJlbElucHV0KXtcbi8vICAgICAgICRmb3JtSW5wdXQuYmx1cihmdW5jdGlvbigpe1xuLy8gICAgICAgICAkbGFiZWxJbnB1dC5yZW1vdmVDbGFzcygnaGlnaGxpZ2h0ZWQnKTtcbi8vICAgICAgIH0pO1xuLy8gICAgIH07XG5cbi8vICAgICBfLmZvckVhY2gobGFiZWxJbnB1dHMsIGZ1bmN0aW9uKCRsYWJlbElucHV0LCBrZXkpe1xuLy8gICAgICAgaGlnaGxpZ2h0T25Gb2N1cyhmb3JtSW5wdXRzW2tleV0sICRsYWJlbElucHV0KTtcbi8vICAgICAgIHVuaGlnaGxpZ2h0T25CbHVyKGZvcm1JbnB1dHNba2V5XSwgJGxhYmVsSW5wdXQpO1xuLy8gICAgIH0pO1xuLy8gICB9O1xuXG4vLyAgIHZhciBkdHAgPSB7XG4vLyAgICAgaW5pdDogZnVuY3Rpb24oZHRwU2VsZWN0b3Ipe1xuXG4vLyAgICAgICAkKGR0cFNlbGVjdG9yKS5lYWNoKGZ1bmN0aW9uKCl7XG5cbi8vICAgICAgICAgdmFyICRkdHAgPSAkKHRoaXMpO1xuXG4vLyAgICAgICAgIC8vIGVuc3VyZSB0aGUgZHRwIGlzIGhpZGRlbiBiZWZvcmUgcmVuZGVyaW5nIGl0XG4vLyAgICAgICAgICRkdHAuYWRkQ2xhc3MoXCJoaWRlXCIpO1xuXG4vLyAgICAgICAgIC8vIGluaXRzIGFuZCByZW5kZXJzIGFsbCB0aGUgY29tcG9uZW50c1xuLy8gICAgICAgICB2YXIgbWV0cm9EYXRlVGltZSA9IGdldE1ldHJvRGF0ZVRpbWUoJGR0cCksXG4vLyAgICAgICAgICAgICBtaW5EYXRlID0gT1QuQ29tbW9uLkhlbHBlcnMuZ2V0TWluaW11bURhdGUobWV0cm9EYXRlVGltZSksXG4vLyAgICAgICAgICAgICAkdGltZVBpY2tlciA9ICRkdHAuZmluZChzZWxlY3RvcnMudGltZVBpY2tlcikuT1RzZWxlY3QoXCJpbml0XCIpLFxuLy8gICAgICAgICAgICAgJHBhcnR5U2l6ZVBpY2tlciA9ICRkdHAuZmluZChzZWxlY3RvcnMucGFydHlTaXplUGlja2VyKS5PVHNlbGVjdChcImluaXRcIiksXG4vLyAgICAgICAgICAgICAkZGF0ZXBpY2tlciA9ICRkdHAuZmluZChzZWxlY3RvcnMuZGF0ZVBpY2tlcikuT1RkYXRlcGlja2VyKFwiaW5pdFwiLCBtaW5EYXRlKSxcbi8vICAgICAgICAgICAgICRzZWFyY2hUZXh0ID0gJGR0cC5maW5kKHNlbGVjdG9ycy5zZWFyY2hUZXh0KSxcbi8vICAgICAgICAgICAgICRmb3JtID0gJGR0cC5maW5kKHNlbGVjdG9ycy5kdHBGb3JtKSxcbi8vICAgICAgICAgICAgIGRhdGVUaW1lVmFsaWRhdG9yID0gbmV3IE9ULkNvbW1vbi5IZWxwZXJzLmRhdGVUaW1lVmFsaWRhdG9yKCk7XG5cbi8vICAgICAgICAgdmFyIHNlbGVjdEluaXRWYWx1ZUZvciA9IHtcbi8vICAgICAgICAgICBjb3ZlcnM6IGZ1bmN0aW9uKCl7XG5cbi8vICAgICAgICAgICAgIHZhciBpc1ZhbGlkID0gZnVuY3Rpb24odmFsKXtcbi8vICAgICAgICAgICAgICAgcmV0dXJuICEhdmFsICYmIHZhbDw9MjEgJiYgdmFsPjA7XG4vLyAgICAgICAgICAgICB9O1xuXG4vLyAgICAgICAgICAgICB2YXIgdmFsdWVXYXNTdXBwbGllZCA9ICEkcGFydHlTaXplUGlja2VyLk9Uc2VsZWN0KFwiaW5mb1wiKS51bnNlbGVjdGVkT25Jbml0LFxuLy8gICAgICAgICAgICAgICAgIHN1cHBsaWVkVmFsdWUgPSB2YWx1ZVdhc1N1cHBsaWVkID8gJHBhcnR5U2l6ZVBpY2tlci5PVHNlbGVjdChcImdldFwiKSA6IG51bGwsXG4vLyAgICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlID0gMjtcblxuLy8gICAgICAgICAgICAgaWYoIWlzVmFsaWQoc3VwcGxpZWRWYWx1ZSkpe1xuLy8gICAgICAgICAgICAgICB2YXIgY29va2llZFZhbHVlID0gY29va2llcy5nZXQoJ2NvdmVycycpLFxuLy8gICAgICAgICAgICAgICAgICAgY292ZXJzVmFsdWUgPSBpc1ZhbGlkKGNvb2tpZWRWYWx1ZSkgPyBjb29raWVkVmFsdWUgOiBkZWZhdWx0VmFsdWU7XG5cbi8vICAgICAgICAgICAgICAgJHBhcnR5U2l6ZVBpY2tlci5PVHNlbGVjdChcInNlbGVjdFwiLCBjb3ZlcnNWYWx1ZSk7XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgfSxcbi8vICAgICAgICAgICBkYXRlVGltZTogZnVuY3Rpb24oKXtcblxuLy8gICAgICAgICAgICAgdmFyIG1ldHJvRGF0ZVRpbWUgPSBnZXRNZXRyb0RhdGVUaW1lKCRkdHApLFxuLy8gICAgICAgICAgICAgICAgIG1ldHJvRGF0ZSA9IG1ldHJvRGF0ZVRpbWUuZm9ybWF0KFwiWVlZWS1NTS1ERFwiKSxcbi8vICAgICAgICAgICAgICAgICBtZXRyb1RpbWUgPSBtZXRyb0RhdGVUaW1lLmZvcm1hdChcIkhIOm1tXCIpO1xuXG4vLyAgICAgICAgICAgICB2YXIgaXNWYWxpZCA9IGZ1bmN0aW9uKGRhdGUsIHRpbWUpe1xuLy8gICAgICAgICAgICAgICBpZighZGF0ZSB8fCAhdGltZSl7XG4vLyAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuLy8gICAgICAgICAgICAgICB9XG5cbi8vICAgICAgICAgICAgICAgdmFyIHZhbGlkYXRlZCA9IGRhdGVUaW1lVmFsaWRhdG9yLmdldChkYXRlLCB0aW1lLCBtZXRyb0RhdGUsIG1ldHJvVGltZSk7XG5cbi8vICAgICAgICAgICAgICAgcmV0dXJuIHZhbGlkYXRlZC5kYXRlID09PSBkYXRlICYmIHZhbGlkYXRlZC50aW1lID09PSB0aW1lO1xuLy8gICAgICAgICAgICAgfTtcblxuLy8gICAgICAgICAgICAgdmFyIHN1cHBsaWVkVmFsdWUgPSB7XG4vLyAgICAgICAgICAgICAgIHRpbWU6ICR0aW1lUGlja2VyLk9Uc2VsZWN0KFwiaW5mb1wiKS51bnNlbGVjdGVkT25Jbml0ID8gbnVsbCA6ICR0aW1lUGlja2VyLk9Uc2VsZWN0KFwiZ2V0XCIpLFxuLy8gICAgICAgICAgICAgICBkYXRlOiAkZGF0ZXBpY2tlci5PVGRhdGVwaWNrZXIoXCJnZXRPcmlnaW5hbFZhbHVlXCIpXG4vLyAgICAgICAgICAgICB9O1xuXG4vLyAgICAgICAgICAgICB2YXIgc2V0VmFsdWVzID0gKGZ1bmN0aW9uKG9yaWdpbmFsRGF0ZSwgb3JpZ2luYWxUaW1lKXtcbi8vICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKG5ld1ZhbHVlcyl7XG4vLyAgICAgICAgICAgICAgICAgaWYob3JpZ2luYWxEYXRlICE9PSBuZXdWYWx1ZXMuZGF0ZSl7XG4vLyAgICAgICAgICAgICAgICAgICAkZGF0ZXBpY2tlci5PVGRhdGVwaWNrZXIoXCJzZXRcIiwgbmV3VmFsdWVzLmRhdGUpO1xuLy8gICAgICAgICAgICAgICAgIH1cblxuLy8gICAgICAgICAgICAgICAgIGlmKG9yaWdpbmFsVGltZSAhPT0gbmV3VmFsdWVzLnRpbWUpe1xuLy8gICAgICAgICAgICAgICAgICAgJHRpbWVQaWNrZXIuT1RzZWxlY3QoXCJzZWxlY3RcIiwgbmV3VmFsdWVzLnRpbWUpO1xuLy8gICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgICAgfTtcbi8vICAgICAgICAgICAgIH0pKHN1cHBsaWVkVmFsdWUuZGF0ZSwgc3VwcGxpZWRWYWx1ZS50aW1lKTtcblxuLy8gICAgICAgICAgICAgaWYoIWlzVmFsaWQoc3VwcGxpZWRWYWx1ZS5kYXRlLCBzdXBwbGllZFZhbHVlLnRpbWUpKXtcbi8vICAgICAgICAgICAgICAgdmFyIGNvb2tpZWREYXRlVGltZVZhbHVlID0gY29va2llcy5nZXQoJ2RhdGV0aW1lJyksXG4vLyAgICAgICAgICAgICAgICAgICBzcGxpdHRlZCA9ICEhY29va2llZERhdGVUaW1lVmFsdWUgPyBjb29raWVkRGF0ZVRpbWVWYWx1ZS5zcGxpdChcIiBcIikgOiBbXSxcbi8vICAgICAgICAgICAgICAgICAgIGNvb2tpZWRWYWx1ZSA9IHNwbGl0dGVkLmxlbmd0aCA9PT0gMCA/IHVuZGVmaW5lZCA6IHtcbi8vICAgICAgICAgICAgICAgICAgICAgZGF0ZTogc3BsaXR0ZWRbMF0sXG4vLyAgICAgICAgICAgICAgICAgICAgIHRpbWU6IHNwbGl0dGVkWzFdXG4vLyAgICAgICAgICAgICAgICAgICB9O1xuXG4vLyAgICAgICAgICAgICAgIGlmKCFjb29raWVkVmFsdWUpe1xuLy8gICAgICAgICAgICAgICAgIHNldFZhbHVlcyhkYXRlVGltZVZhbGlkYXRvci5nZXQoc3VwcGxpZWRWYWx1ZS5kYXRlLCBzdXBwbGllZFZhbHVlLnRpbWUsIG1ldHJvRGF0ZSwgbWV0cm9UaW1lKSk7XG4vLyAgICAgICAgICAgICAgIH0gZWxzZSBpZihpc1ZhbGlkKGNvb2tpZWRWYWx1ZS5kYXRlLCBjb29raWVkVmFsdWUudGltZSkpe1xuLy8gICAgICAgICAgICAgICAgIHNldFZhbHVlcyhjb29raWVkVmFsdWUpO1xuLy8gICAgICAgICAgICAgICB9IGVsc2Uge1xuLy8gICAgICAgICAgICAgICAgIHNldFZhbHVlcyhkYXRlVGltZVZhbGlkYXRvci5nZXQoY29va2llZFZhbHVlLmRhdGUsIGNvb2tpZWRWYWx1ZS50aW1lLCBtZXRyb0RhdGUsIG1ldHJvVGltZSkpO1xuLy8gICAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgfVxuLy8gICAgICAgICB9O1xuXG4vLyAgICAgICAgIHZhciBoaWRlUGFzdFRpbWVzID0gZnVuY3Rpb24oKXtcblxuLy8gICAgICAgICAgICR0aW1lUGlja2VyLk9Uc2VsZWN0KFwic2hvd0FsbFwiKTtcblxuLy8gICAgICAgICAgIHZhciBtZXRyb0RhdGVUaW1lID0gZ2V0TWV0cm9EYXRlVGltZSgkZHRwKSxcbi8vICAgICAgICAgICAgICAgbWV0cm9EYXRlID0gbWV0cm9EYXRlVGltZS5mb3JtYXQoXCJZWVlZLU1NLUREXCIpLFxuLy8gICAgICAgICAgICAgICBtZXRyb1RpbWUgPSBtZXRyb0RhdGVUaW1lLmZvcm1hdChcIkhIOm1tXCIpLFxuLy8gICAgICAgICAgICAgICBjdXJyZW50RGF0ZSA9ICRkYXRlcGlja2VyLk9UZGF0ZXBpY2tlcihcImdldFwiLCAneXl5eS1tbS1kZCcpLFxuLy8gICAgICAgICAgICAgICBhdmFpbGFiaWxpdHkgPSBPVC5Db21tb24uSGVscGVycy50aW1lU2xvdHNBdmFpbGFiaWxpdHkoKSxcbi8vICAgICAgICAgICAgICAgYXZhaWxhYmxlVGltZVNsb3RzID0gYXZhaWxhYmlsaXR5LmdldChjdXJyZW50RGF0ZSwgbWV0cm9EYXRlLCBtZXRyb1RpbWUpLFxuLy8gICAgICAgICAgICAgICB0aW1lT3B0aW9ucyA9ICR0aW1lUGlja2VyLmZpbmQoXCJvcHRpb25cIik7XG5cbi8vICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGltZU9wdGlvbnMubGVuZ3RoOyBpKyspe1xuLy8gICAgICAgICAgICAgdmFyICRvcHRpb24gPSAkKHRpbWVPcHRpb25zW2ldKSxcbi8vICAgICAgICAgICAgICAgICB2YWx1ZSA9ICRvcHRpb24uYXR0cihcInZhbHVlXCIpO1xuXG4vLyAgICAgICAgICAgICBpZighXy5jb250YWlucyhhdmFpbGFibGVUaW1lU2xvdHMsIHZhbHVlKSl7XG4vLyAgICAgICAgICAgICAgICR0aW1lUGlja2VyLk9Uc2VsZWN0KFwiaGlkZVwiLCB2YWx1ZSk7XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgfVxuLy8gICAgICAgICB9O1xuXG4vLyAgICAgICAgIHZhciBmaXhEYXRlVGltZVZhbHVlcyA9IGZ1bmN0aW9uKGNhbGxiYWNrKXtcbi8vICAgICAgICAgICBpZighX3ZhbGlkYXRlRGF0ZVRpbWUpe1xuLy8gICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4vLyAgICAgICAgICAgfVxuXG4vLyAgICAgICAgICAgdmFyIG1ldHJvRGF0ZVRpbWUgPSBnZXRNZXRyb0RhdGVUaW1lKCRkdHApLFxuLy8gICAgICAgICAgICAgICBtZXRyb0RhdGUgPSBtZXRyb0RhdGVUaW1lLmZvcm1hdChcIllZWVktTU0tRERcIiksXG4vLyAgICAgICAgICAgICAgIG1ldHJvVGltZSA9IG1ldHJvRGF0ZVRpbWUuZm9ybWF0KFwiSEg6bW1cIiksXG4vLyAgICAgICAgICAgICAgIGN1cnJlbnRUaW1lID0gJHRpbWVQaWNrZXIuT1RzZWxlY3QoXCJnZXRcIiksXG4vLyAgICAgICAgICAgICAgIGN1cnJlbnREYXRlID0gJGRhdGVwaWNrZXIuT1RkYXRlcGlja2VyKFwiZ2V0XCIsICd5eXl5LW1tLWRkJyksXG4vLyAgICAgICAgICAgICAgIHZhbGlkRGF0ZVRpbWUgPSBkYXRlVGltZVZhbGlkYXRvci5nZXQoY3VycmVudERhdGUsIGN1cnJlbnRUaW1lLCBtZXRyb0RhdGUsIG1ldHJvVGltZSk7XG5cbi8vICAgICAgICAgICBpZihjdXJyZW50RGF0ZSAhPT0gdmFsaWREYXRlVGltZS5kYXRlKXtcbi8vICAgICAgICAgICAgICRkYXRlcGlja2VyLk9UZGF0ZXBpY2tlcihcInNldFwiLCB2YWxpZERhdGVUaW1lLmRhdGUpO1xuLy8gICAgICAgICAgIH0gZWxzZSBpZihjdXJyZW50VGltZSAhPT0gdmFsaWREYXRlVGltZS50aW1lKXtcbi8vICAgICAgICAgICAgICR0aW1lUGlja2VyLk9Uc2VsZWN0KFwic2VsZWN0XCIsIHZhbGlkRGF0ZVRpbWUudGltZSk7XG4vLyAgICAgICAgICAgfSBlbHNlIGlmKHR5cGVvZihjYWxsYmFjaykgPT09ICdmdW5jdGlvbicpe1xuLy8gICAgICAgICAgICAgY2FsbGJhY2soKTtcbi8vICAgICAgICAgICB9XG4vLyAgICAgICAgIH07XG5cbi8vICAgICAgICAgdmFyIGZvcm1JbnB1dHMgPSB7XG4vLyAgICAgICAgICAgcGFydHlTaXplUGlja2VyOiAkcGFydHlTaXplUGlja2VyLmZpbmQoXCJzZWxlY3RcIiksXG4vLyAgICAgICAgICAgZGF0ZVBpY2tlcjogJGRhdGVwaWNrZXIuZmluZChcImlucHV0XCIpLFxuLy8gICAgICAgICAgIHRpbWVQaWNrZXI6ICR0aW1lUGlja2VyLmZpbmQoXCJzZWxlY3RcIiksXG4vLyAgICAgICAgICAgc2VhcmNoVGV4dDogJHNlYXJjaFRleHQsXG4vLyAgICAgICAgICAgc2VhcmNoQnV0dG9uOiAkZm9ybS5maW5kKFwiaW5wdXQuYnV0dG9uXCIpXG4vLyAgICAgICAgIH07XG5cbi8vICAgICAgICAgdmFyIGxhYmVsSW5wdXRzID0ge1xuLy8gICAgICAgICAgIHBhcnR5U2l6ZVBpY2tlcjogJHBhcnR5U2l6ZVBpY2tlci5maW5kKFwiYVwiKSxcbi8vICAgICAgICAgICBkYXRlUGlja2VyOiAkZGF0ZXBpY2tlci5maW5kKFwiYVwiKSxcbi8vICAgICAgICAgICB0aW1lUGlja2VyOiAkdGltZVBpY2tlci5maW5kKFwiYVwiKSxcbi8vICAgICAgICAgICBzZWFyY2hUZXh0OiAkc2VhcmNoVGV4dFxuLy8gICAgICAgICB9O1xuXG4vLyAgICAgICAgIC8vIHNldHMgdW5pcXVlIHRhYkluZGV4ZXMgdG8gdGhlIGNvbnRyb2xzIGluIG9yZGVyIHRvIGVuYWJsZSBzd2l0Y2hpbmcgdmlhIGtleWJvYXJkIHRhYnNcbi8vICAgICAgICAgdGFiSW5kZXhDb3VudGVyID0gc2V0VGFiSW5kZXhlcyhmb3JtSW5wdXRzLCB0YWJJbmRleENvdW50ZXIpO1xuXG4vLyAgICAgICAgIC8vIGJpbmRzIGZvY3VzL2JsdXIgZXZlbnRzIHRvIGNvbnRyb2xzIGluIG9yZGVyIHRvIGVuYWJsZSBsYWJlbCBoaWdobGlnaHRpbmcgd2hlbiBtb3VzZSBjbGljay9rZXlib2FyZCB0YWIgc3dpdGNoaW5nXG4vLyAgICAgICAgIHNldEhpZ2hsaWdodGluZyhmb3JtSW5wdXRzLCBsYWJlbElucHV0cyk7XG5cbi8vICAgICAgICAgLy8gc2V0cyBpbml0aWFsIHZhbHVlc1xuLy8gICAgICAgICBzZWxlY3RJbml0VmFsdWVGb3IuY292ZXJzKCk7XG4vLyAgICAgICAgIHNlbGVjdEluaXRWYWx1ZUZvci5kYXRlVGltZSgpO1xuLy8gICAgICAgICBoaWRlUGFzdFRpbWVzKCk7XG5cbi8vICAgICAgICAgLy8gRXZlbnRzIGJpbmRpbmdzXG4vLyAgICAgICAgIHZhciBnZXRTZWFyY2hPYmogPSBmdW5jdGlvbigpe1xuLy8gICAgICAgICAgIHZhciBjb3ZlcnMgPSAkcGFydHlTaXplUGlja2VyLk9Uc2VsZWN0KFwiZ2V0XCIpLFxuLy8gICAgICAgICAgICAgICBzZWxlY3RlZFRpbWUgPSAkdGltZVBpY2tlci5PVHNlbGVjdChcImdldFwiKSxcbi8vICAgICAgICAgICAgICAgc2VsZWN0ZWREYXRlID0gJGRhdGVwaWNrZXIuT1RkYXRlcGlja2VyKFwiZ2V0XCIsIFwieXl5eS1tbS1kZFwiKSxcbi8vICAgICAgICAgICAgICAgZGF0ZVRpbWUgPSBzZWxlY3RlZERhdGUgKyBcIiBcIiArIHNlbGVjdGVkVGltZSxcbi8vICAgICAgICAgICAgICAgc2VhcmNoVGV4dCA9ICRzZWFyY2hUZXh0Lmxlbmd0aCA+IDAgPyAkc2VhcmNoVGV4dC52YWwoKSA6IGZhbHNlO1xuXG4vLyAgICAgICAgICAgcmV0dXJuIHtcbi8vICAgICAgICAgICAgIGNvdmVyczogY292ZXJzLFxuLy8gICAgICAgICAgICAgZGF0ZXRpbWU6IGRhdGVUaW1lLFxuLy8gICAgICAgICAgICAgc2VhcmNoVGV4dDogc2VhcmNoVGV4dCxcbi8vICAgICAgICAgICAgIHNlbmRlcjogJGR0cFxuLy8gICAgICAgICAgIH07XG4vLyAgICAgICAgIH07XG5cbi8vICAgICAgICAgdmFyIG9uRFRQQ2hhbmdlZCA9IGZ1bmN0aW9uKCl7XG4vLyAgICAgICAgICAgaWYoX3Nob3VsZEVtaXRDaGFuZ2VkRXZlbnQpe1xuLy8gICAgICAgICAgICAgaGlkZVBhc3RUaW1lcygpO1xuLy8gICAgICAgICAgICAgdmFyIHNlYXJjaE9iaiA9IGdldFNlYXJjaE9iaigpO1xuLy8gICAgICAgICAgICAgY29va2llcy5zZXQoc2VhcmNoT2JqKTtcbi8vICAgICAgICAgICAgIE9ULkV2ZW50cy5maXJlKFwiZHRwOmNoYW5nZVwiLCBzZWFyY2hPYmopO1xuLy8gICAgICAgICAgIH1cbi8vICAgICAgICAgfTtcblxuLy8gICAgICAgICB2YXIgc2VhcmNoVGV4dFZhbHVlID0gJHNlYXJjaFRleHQubGVuZ3RoID4gMCA/ICRzZWFyY2hUZXh0LnZhbCgpIDogZmFsc2U7XG4vLyAgICAgICAgICRzZWFyY2hUZXh0LmtleXVwKGZ1bmN0aW9uKCl7XG4vLyAgICAgICAgICAgdmFyIG5ld1ZhbHVlID0gJHNlYXJjaFRleHQubGVuZ3RoID4gMCA/ICRzZWFyY2hUZXh0LnZhbCgpIDogZmFsc2U7XG5cbi8vICAgICAgICAgICBpZihuZXdWYWx1ZSAhPT0gc2VhcmNoVGV4dFZhbHVlKXtcbi8vICAgICAgICAgICAgIHNlYXJjaFRleHRWYWx1ZSA9IG5ld1ZhbHVlO1xuLy8gICAgICAgICAgICAgb25EVFBDaGFuZ2VkKCk7XG4vLyAgICAgICAgICAgfVxuLy8gICAgICAgICB9KTtcblxuLy8gICAgICAgICAkZm9ybS5zdWJtaXQoZnVuY3Rpb24oZSl7XG4vLyAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuLy8gICAgICAgICAgIE9ULkV2ZW50cy5maXJlKFwiZHRwOnNlYXJjaFwiLCBnZXRTZWFyY2hPYmooKSk7XG4vLyAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuLy8gICAgICAgICB9KTtcblxuLy8gICAgICAgICBPVC5FdmVudHMub24oXCJkYXRlcGlja2VyOmNoYW5nZVwiLCBmdW5jdGlvbihlLCBkYXRhKXtcbi8vICAgICAgICAgICBpZihkYXRhLnNlbmRlci5pcygkZGF0ZXBpY2tlcikpe1xuLy8gICAgICAgICAgICAgZml4RGF0ZVRpbWVWYWx1ZXMob25EVFBDaGFuZ2VkKTtcbi8vICAgICAgICAgICB9XG4vLyAgICAgICAgIH0pO1xuXG4vLyAgICAgICAgIE9ULkV2ZW50cy5vbihcInNlbGVjdDpjaGFuZ2VcIiwgZnVuY3Rpb24oZSwgZGF0YSl7XG4vLyAgICAgICAgICAgaWYoZGF0YS5zZW5kZXIuaXMoJHRpbWVQaWNrZXIpKXtcbi8vICAgICAgICAgICAgIGZpeERhdGVUaW1lVmFsdWVzKG9uRFRQQ2hhbmdlZCk7XG4vLyAgICAgICAgICAgfSBlbHNlIGlmKGRhdGEuc2VuZGVyLmlzKCRwYXJ0eVNpemVQaWNrZXIpKXtcbi8vICAgICAgICAgICAgIG9uRFRQQ2hhbmdlZCgpO1xuLy8gICAgICAgICAgIH1cbi8vICAgICAgICAgfSk7XG5cbi8vICAgICAgICAgLy8gYWxsIGRvbmUgLSBtYWtlIGl0IHZpc2libGVcbi8vICAgICAgICAgJGR0cC5yZW1vdmVDbGFzcyhcImhpZGVcIik7XG4vLyAgICAgICAgIE9ULkV2ZW50cy5maXJlKFwiZHRwOnJlbmRlcmVkXCIsIGdldFNlYXJjaE9iaigpKTtcbi8vICAgICAgIH0pO1xuLy8gICAgIH0sXG5cbi8vICAgICBzZXQ6IGZ1bmN0aW9uKCRkdHAsIG9iail7XG5cbi8vICAgICAgIG9iaiA9IG9iaiB8fCB7fTtcblxuLy8gICAgICAgdmFyIHBhcnR5Q2hhbmdlZCA9IGZhbHNlLFxuLy8gICAgICAgICAgIHRpbWVDaGFuZ2VkID0gZmFsc2UsXG4vLyAgICAgICAgICAgZGF0ZUNoYW5nZWQgPSBmYWxzZSxcbi8vICAgICAgICAgICBzZWFyY2hDaGFuZ2VkID0gZmFsc2UsXG4vLyAgICAgICAgICAgJHBhcnR5U2l6ZVBpY2tlciA9ICRkdHAuZmluZChzZWxlY3RvcnMucGFydHlTaXplUGlja2VyKSxcbi8vICAgICAgICAgICAkZGF0ZVBpY2tlciA9ICRkdHAuZmluZChzZWxlY3RvcnMuZGF0ZVBpY2tlciksXG4vLyAgICAgICAgICAgJHRpbWVQaWNrZXIgPSAkZHRwLmZpbmQoc2VsZWN0b3JzLnRpbWVQaWNrZXIpLFxuLy8gICAgICAgICAgICRzZWFyY2hUZXh0ID0gJGR0cC5maW5kKHNlbGVjdG9ycy5zZWFyY2hUZXh0KSxcbi8vICAgICAgICAgICBmaWVsZHNDaGFuZ2VkID0gMCxcbi8vICAgICAgICAgICBmaWVsZHNUb0NoYW5nZSA9IDA7XG5cbi8vICAgICAgIGlmKCEhb2JqLmNvdmVycyl7XG4vLyAgICAgICAgIGlmKCRwYXJ0eVNpemVQaWNrZXIuT1RzZWxlY3QoXCJnZXRcIikudG9TdHJpbmcoKSAhPT0gb2JqLmNvdmVycy50b1N0cmluZygpKXtcbi8vICAgICAgICAgICBwYXJ0eUNoYW5nZWQgPSB0cnVlO1xuLy8gICAgICAgICAgIGZpZWxkc1RvQ2hhbmdlKys7XG4vLyAgICAgICAgIH1cbi8vICAgICAgIH1cblxuLy8gICAgICAgaWYoISFvYmouZGF0ZSl7XG4vLyAgICAgICAgIGlmKCRkYXRlUGlja2VyLk9UZGF0ZXBpY2tlcihcImdldFwiLCBcInl5eXktbW0tZGRcIikudG9TdHJpbmcoKSAhPT0gb2JqLmRhdGUudG9TdHJpbmcoKSl7XG4vLyAgICAgICAgICAgZGF0ZUNoYW5nZWQgPSB0cnVlO1xuLy8gICAgICAgICAgIGZpZWxkc1RvQ2hhbmdlKys7XG4vLyAgICAgICAgIH1cbi8vICAgICAgIH1cblxuLy8gICAgICAgaWYoISFvYmoudGltZSl7XG4vLyAgICAgICAgIGlmKCR0aW1lUGlja2VyLk9Uc2VsZWN0KFwiZ2V0XCIpLnRvU3RyaW5nKCkgIT09IG9iai50aW1lLnRvU3RyaW5nKCkpe1xuLy8gICAgICAgICAgIHRpbWVDaGFuZ2VkID0gdHJ1ZTtcbi8vICAgICAgICAgICBmaWVsZHNUb0NoYW5nZSsrO1xuLy8gICAgICAgICB9XG4vLyAgICAgICB9XG5cbi8vICAgICAgIGlmKHR5cGVvZihvYmouc2VhcmNoVGV4dCkgIT09ICd1bmRlZmluZWQnKXtcbi8vICAgICAgICAgc2VhcmNoQ2hhbmdlZCA9IHRydWU7XG4vLyAgICAgICAgIGZpZWxkc1RvQ2hhbmdlKys7XG4vLyAgICAgICB9XG5cbi8vICAgICAgIHZhciB1cGRhdGVDaGFuZ2VFdmVudEVtaXR0ZXJDaGVjayA9IGZ1bmN0aW9uKCl7XG4vLyAgICAgICAgIF9zaG91bGRFbWl0Q2hhbmdlZEV2ZW50ID0gKGZpZWxkc1RvQ2hhbmdlIC0gZmllbGRzQ2hhbmdlZCkgPCAyO1xuLy8gICAgICAgfTtcblxuLy8gICAgICAgdXBkYXRlQ2hhbmdlRXZlbnRFbWl0dGVyQ2hlY2soKTtcblxuLy8gICAgICAgaWYocGFydHlDaGFuZ2VkKXtcbi8vICAgICAgICAgJHBhcnR5U2l6ZVBpY2tlci5PVHNlbGVjdChcInNlbGVjdFwiLCBvYmouY292ZXJzKTtcbi8vICAgICAgICAgZmllbGRzQ2hhbmdlZCsrO1xuLy8gICAgICAgICB1cGRhdGVDaGFuZ2VFdmVudEVtaXR0ZXJDaGVjaygpO1xuLy8gICAgICAgfVxuXG4vLyAgICAgICBpZihkYXRlQ2hhbmdlZCl7XG4vLyAgICAgICAgIGlmKHRpbWVDaGFuZ2VkKXtcbi8vICAgICAgICAgICBfdmFsaWRhdGVEYXRlVGltZSA9IGZhbHNlO1xuLy8gICAgICAgICB9XG4vLyAgICAgICAgICRkYXRlUGlja2VyLk9UZGF0ZXBpY2tlcihcInNldFwiLCBvYmouZGF0ZSk7XG4vLyAgICAgICAgIGZpZWxkc0NoYW5nZWQrKztcbi8vICAgICAgICAgdXBkYXRlQ2hhbmdlRXZlbnRFbWl0dGVyQ2hlY2soKTtcbi8vICAgICAgIH1cblxuLy8gICAgICAgaWYodGltZUNoYW5nZWQpe1xuLy8gICAgICAgICBfdmFsaWRhdGVEYXRlVGltZSA9IHRydWU7XG4vLyAgICAgICAgICR0aW1lUGlja2VyLk9Uc2VsZWN0KFwic2hvd0FsbFwiKTtcbi8vICAgICAgICAgJHRpbWVQaWNrZXIuT1RzZWxlY3QoXCJzZWxlY3RcIiwgb2JqLnRpbWUpO1xuLy8gICAgICAgICBmaWVsZHNDaGFuZ2VkKys7XG4vLyAgICAgICAgIHVwZGF0ZUNoYW5nZUV2ZW50RW1pdHRlckNoZWNrKCk7XG4vLyAgICAgICB9XG5cbi8vICAgICAgIGlmKHNlYXJjaENoYW5nZWQpe1xuLy8gICAgICAgICBpZihvYmouc2VhcmNoVGV4dCA9PT0gZmFsc2Upe1xuLy8gICAgICAgICAgICRzZWFyY2hUZXh0LnZhbCgnJykucGFyZW50KCkuYWRkQ2xhc3MoXCJoaWRlXCIpLnBhcmVudCgpLnJlbW92ZUNsYXNzKFwid2l0aC1zZWFyY2hcIik7XG4vLyAgICAgICAgIH0gZWxzZSB7XG4vLyAgICAgICAgICAgJHNlYXJjaFRleHQudmFsKG9iai5zZWFyY2hUZXh0KS5wYXJlbnQoKS5yZW1vdmVDbGFzcyhcImhpZGVcIikucGFyZW50KCkuYWRkQ2xhc3MoXCJ3aXRoLXNlYXJjaFwiKTtcbi8vICAgICAgICAgfVxuLy8gICAgICAgICBmaWVsZHNDaGFuZ2VkKys7XG4vLyAgICAgICAgIHVwZGF0ZUNoYW5nZUV2ZW50RW1pdHRlckNoZWNrKCk7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy8gICB9O1xuXG4vLyAgICQuZm4uT1RkdHAgPSBmdW5jdGlvbihhY3Rpb24sIHBhcmFtKXtcblxuLy8gICAgIHRoaXMuZWFjaChmdW5jdGlvbigpe1xuLy8gICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcblxuLy8gICAgICAgaWYoYWN0aW9uID09PSBcImluaXRcIil7XG4vLyAgICAgICAgIHJldHVybiBkdHAuaW5pdCgkdGhpcyk7XG4vLyAgICAgICB9IGVsc2UgaWYoYWN0aW9uID09PSBcInNldFwiKXtcbi8vICAgICAgICAgcmV0dXJuIGR0cC5zZXQoJHRoaXMsIHBhcmFtKTtcbi8vICAgICAgIH1cbi8vICAgICB9KTtcbi8vICAgfTtcblxuLy8gICByZXR1cm4gZHRwO1xuLy8gfSkoalF1ZXJ5LCBfLCBtb21lbnQpO1xuLy8gT1QuY3JlYXRlTlMoJ09ULkNvbW1vbi5EYXRlUGlja2VyJyk7XG5cbi8vIE9ULkNvbW1vbi5EYXRlUGlja2VyID0gKGZ1bmN0aW9uKCQsIG1vbWVudCl7XG4vLyAgICd1c2Ugc3RyaWN0JztcblxuLy8gICB2YXIgZ2V0TGFiZWxWYWx1ZSA9IGZ1bmN0aW9uKCRkcCl7XG5cbi8vICAgICB2YXIgc2VsZWN0ZWREYXkgPSAkZHAuZ2V0KCdoaWdobGlnaHQnLCAneXl5eS1tbS1kZCcpLFxuLy8gICAgICAgICB0b2RheSA9IG1vbWVudCgpLmZvcm1hdCgnWVlZWS1NTS1ERCcpLFxuLy8gICAgICAgICB0b21vcnJvdyA9IG1vbWVudCgpLmFkZCgxLCAnZGF5cycpLmZvcm1hdCgnWVlZWS1NTS1ERCcpLFxuLy8gICAgICAgICBpc1RvZGF5ID0gKHRvZGF5ID09PSBzZWxlY3RlZERheSksXG4vLyAgICAgICAgIGlzVG9tb3Jyb3cgPSAodG9tb3Jyb3cgPT09IHNlbGVjdGVkRGF5KSxcbi8vICAgICAgICAgdGV4dExhYmVsID0gJGRwLmdldCgpO1xuXG4vLyAgICAgaWYoT1QuQ29tbW9uLlRlc3RPYmplY3QuaXNBY3RpdmUoJ3RvZGF5dG9tb3Jyb3cnKSl7XG4vLyAgICAgICBpZihpc1RvZGF5KXtcbi8vICAgICAgICAgcmV0dXJuIE9ULlNSUy50b2RheTtcbi8vICAgICAgIH0gZWxzZSBpZihpc1RvbW9ycm93KSB7XG4vLyAgICAgICAgIHJldHVybiBPVC5TUlMudG9tb3Jyb3c7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuXG4vLyAgICAgcmV0dXJuIHRleHRMYWJlbDtcbi8vICAgfTtcblxuLy8gICB2YXIgZGF0ZXBpY2tlciA9IHtcbi8vICAgICBnZXQ6IGZ1bmN0aW9uKCRkYXRlcGlja2VyLCBvcHRpb25hbEZvcm1hdCl7XG4vLyAgICAgICB2YXIgJGRhdGVwaWNrZXJJbnB1dCA9ICRkYXRlcGlja2VyLmZpbmQoJ2lucHV0JyksXG4vLyAgICAgICAgICAgJHBpY2tlciA9ICRkYXRlcGlja2VySW5wdXQucGlja2FkYXRlKCdwaWNrZXInKTtcblxuLy8gICAgICAgaWYoISFvcHRpb25hbEZvcm1hdCl7XG4vLyAgICAgICAgIHJldHVybiAkcGlja2VyLmdldCgnc2VsZWN0Jywgb3B0aW9uYWxGb3JtYXQpO1xuLy8gICAgICAgfVxuXG4vLyAgICAgICByZXR1cm4gJHBpY2tlci5nZXQoJ3NlbGVjdCcpO1xuLy8gICAgIH0sXG4vLyAgICAgZ2V0T3JpZ2luYWxWYWx1ZTogZnVuY3Rpb24oJGRhdGVwaWNrZXIpe1xuLy8gICAgICAgcmV0dXJuICRkYXRlcGlja2VyLmZpbmQoJ2lucHV0JykuYXR0cignZGF0YS12YWx1ZScpO1xuLy8gICAgIH0sXG4vLyAgICAgaW5pdDogZnVuY3Rpb24oJGRhdGVwaWNrZXIsIG1pbkRhdGUpe1xuXG4vLyAgICAgICB2YXIgY3NzQ2xhc3MgPSAkZGF0ZXBpY2tlci5hdHRyKCdjbGFzcycpLFxuLy8gICAgICAgICAgIGRhdGVWYWx1ZSA9ICRkYXRlcGlja2VyLnZhbCgpLFxuLy8gICAgICAgICAgICRwYXJlbnQgPSAkZGF0ZXBpY2tlci5wYXJlbnQoKSxcbi8vICAgICAgICAgICBpc0phcGFuZXNlID0gZmFsc2UsXG4vLyAgICAgICAgICAgY2FsZW5kYXJTdGFydHNTdW5kYXkgPSAodHlwZW9mKE9UKSAhPT0gJ3VuZGVmaW5lZCcgJiYgISFPVC5TUlMpID8gISFPVC5TUlMuY2FsZW5kYXJTdGFydHNTdW5kYXkgOiB0cnVlO1xuXG4vLyAgICAgICB2YXIgdGVtcGxhdGUgPSBmdW5jdGlvbihkYXRlVmFsdWUpe1xuXG4vLyAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cIicgKyBjc3NDbGFzcyArICdcIj4nICtcbi8vICAgICAgICAgICAgICAgICcgIDxhIGNsYXNzPVwiZHRwLXBpY2tlci1zZWxlY3Rvci1saW5rIGRhdGUtbGFiZWwgZHRwLXBpY2tlci1sYWJlbFwiPicgKyBkYXRlVmFsdWUgKyAnPC9hPicgK1xuLy8gICAgICAgICAgICAgICAgJyAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cImRhdGVwaWNrZXJcIiBjbGFzcz1cImRhdGVwaWNrZXIgZHRwLXBpY2tlci1zZWxlY3RcIiBkYXRhLXZhbHVlPVwiJyArIGRhdGVWYWx1ZSArICdcIiAvPicgK1xuLy8gICAgICAgICAgICAgICAgJzwvZGl2Pic7XG4vLyAgICAgICB9O1xuXG4vLyAgICAgICBpZihkYXRlVmFsdWUgPT09ICcnKXtcbi8vICAgICAgICAgZGF0ZVZhbHVlID0gbW9tZW50KCkuZm9ybWF0KCdZWVlZLU1NLUREJyk7XG4vLyAgICAgICB9XG5cbi8vICAgICAgICRkYXRlcGlja2VyLmFmdGVyKHRlbXBsYXRlKGRhdGVWYWx1ZSkpO1xuLy8gICAgICAgJGRhdGVwaWNrZXIucmVtb3ZlKCk7XG4vLyAgICAgICAkZGF0ZXBpY2tlciA9ICRwYXJlbnQuZmluZCgnLicgKyBjc3NDbGFzcy5yZXBsYWNlKC8gL2csICcuJykpO1xuXG4vLyAgICAgICB2YXIgJGxhYmVsID0gJGRhdGVwaWNrZXIuZmluZCgnLmRhdGUtbGFiZWwnKSxcbi8vICAgICAgICAgICAkZGF0ZVBpY2tlcklucHV0ID0gJGRhdGVwaWNrZXIuZmluZCgnaW5wdXQnKTtcblxuLy8gICAgICAgaWYoT1QuU1JTLmxhbmcpe1xuLy8gICAgICAgICBzZXR1cExhbmd1YWdlKE9ULlNSUy5sYW5nKTtcbi8vICAgICAgICAgaWYoT1QuU1JTLmxhbmcgPT09ICdqYScpe1xuLy8gICAgICAgICAgIGlzSmFwYW5lc2UgPSB0cnVlO1xuLy8gICAgICAgICB9XG4vLyAgICAgICB9XG5cbi8vICAgICAgIHZhciBmaXhKYXBhbmVzZVllYXJNb250aExhYmVsID0gZnVuY3Rpb24oKXtcbi8vICAgICAgICAgLy8gSW4gY2FzZSBvZiBKYXBhbmVzZSwgd2UgZGlzcGxheSBZZWFyIGZpcnN0ICsg5bm0ICsgbW9udGggb24gdGhlIG1vbnRoJ3MgbGFiZWwuXG5cbi8vICAgICAgICAgdmFyICRoZWFkZXJZZWFyID0gJGRhdGVwaWNrZXIuZmluZCgnLnBpY2tlcl9feWVhcicpLFxuLy8gICAgICAgICAgICAgJGhlYWRlck1vbnRoID0gJGRhdGVwaWNrZXIuZmluZCgnLnBpY2tlcl9fbW9udGgnKSxcbi8vICAgICAgICAgICAgICRwYXJlbnQgPSAkaGVhZGVyTW9udGgucGFyZW50KCksXG4vLyAgICAgICAgICAgICBvdXRlckh0bWwgPSBmdW5jdGlvbigkZWwpeyByZXR1cm4gJCgnPGRpdiAvPicpLmFwcGVuZCgkZWwuY2xvbmUoKSkuaHRtbCgpOyB9LFxuLy8gICAgICAgICAgICAgbmV3SGVhZGVyQ29udGVudCA9IG91dGVySHRtbCgkaGVhZGVyWWVhcikgKyBvdXRlckh0bWwoJGhlYWRlck1vbnRoKTtcblxuLy8gICAgICAgICAkaGVhZGVyWWVhci5yZW1vdmUoKTtcbi8vICAgICAgICAgJGhlYWRlck1vbnRoLnJlbW92ZSgpO1xuLy8gICAgICAgICAkcGFyZW50LnByZXBlbmQobmV3SGVhZGVyQ29udGVudCk7XG4vLyAgICAgICAgICRoZWFkZXJZZWFyID0gJGRhdGVwaWNrZXIuZmluZCgnLnBpY2tlcl9feWVhcicpO1xuXG4vLyAgICAgICAgIHZhciBoZWFkZXJZZWFyVGV4dCA9ICRoZWFkZXJZZWFyLnRleHQoKTtcblxuLy8gICAgICAgICBpZihoZWFkZXJZZWFyVGV4dC5pbmRleE9mKCflubQnKSA8IDApe1xuLy8gICAgICAgICAgICRoZWFkZXJZZWFyLnRleHQoaGVhZGVyWWVhclRleHQgKyAn5bm0Jyk7XG4vLyAgICAgICAgIH1cbi8vICAgICAgIH07XG5cbi8vICAgICAgIHZhciBjbG9zZURwSWZPcGVuZWQgPSBmdW5jdGlvbigkZHApe1xuLy8gICAgICAgICBpZighISRkcC5nZXQoJ29wZW4nKSl7XG4vLyAgICAgICAgICAgJGRwLmNsb3NlKCk7XG4vLyAgICAgICAgIH1cbi8vICAgICAgIH07XG5cbi8vICAgICAgIHZhciBnZXRSZW5kZXJQb3NpdGlvbiA9IGZ1bmN0aW9uKCl7XG4vLyAgICAgICAgIHZhciBjYWxlbmRhckhlaWdodCA9IDI5MCxcbi8vICAgICAgICAgICAgIGxhYmVsSGVpZ2h0ID0gJGRhdGVQaWNrZXJJbnB1dC5oZWlnaHQoKSxcbi8vICAgICAgICAgICAgIGRhdGVQaWNrZXJPZmZzZXQgPSBwYXJzZUludCgkZGF0ZXBpY2tlci5vZmZzZXQoKS50b3AsIDEwKSxcbi8vICAgICAgICAgICAgIGJvZHlTY3JvbGwgPSAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3ApIHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wLFxuLy8gICAgICAgICAgICAgJGJvZHkgPSAkKCdib2R5JyksXG4vLyAgICAgICAgICAgICBib2R5SGVpZ2h0ID0gJGJvZHkuaGVpZ2h0KCksXG4vLyAgICAgICAgICAgICBtYXJnaW5Cb3R0b20gPSBib2R5U2Nyb2xsICsgYm9keUhlaWdodCAtIGxhYmVsSGVpZ2h0IC0gZGF0ZVBpY2tlck9mZnNldCxcbi8vICAgICAgICAgICAgIG1hcmdpblRvcCA9IGRhdGVQaWNrZXJPZmZzZXQgLSBib2R5U2Nyb2xsO1xuXG4vLyAgICAgICAgIHJldHVybiBtYXJnaW5Ub3AgPCBjYWxlbmRhckhlaWdodCA/ICdkb3duJyA6IChtYXJnaW5Cb3R0b20gPj0gY2FsZW5kYXJIZWlnaHQgPyAnZG93bicgOiAndXAnKTtcbi8vICAgICAgIH07XG5cbi8vICAgICAgICRkYXRlUGlja2VySW5wdXQucGlja2FkYXRlKHtcbi8vICAgICAgICAgZmlyc3REYXk6IGNhbGVuZGFyU3RhcnRzU3VuZGF5ID8gMCA6IDEsXG4vLyAgICAgICAgIG1pbjogbWluRGF0ZSA/IG1vbWVudChtaW5EYXRlKS50b0RhdGUoKSA6IG5ldyBEYXRlKCksXG4vLyAgICAgICAgIGZvcm1hdFN1Ym1pdDogJ3l5eXktbW0tZGQnLFxuLy8gICAgICAgICBoaWRkZW5QcmVmaXg6ICdzdWJtaXRfJyxcbi8vICAgICAgICAgaGlkZGVuU3VmZml4OiAnJyxcbi8vICAgICAgICAgdG9kYXk6ICcnLFxuLy8gICAgICAgICBjbGVhcjogJycsXG4vLyAgICAgICAgIGZvcm1hdDogT1QuQ29tbW9uLkhlbHBlcnMuZ2V0RGF0ZUZvcm1hdEpTKCksXG4vLyAgICAgICAgIG9uU3RhcnQ6IGZ1bmN0aW9uICgpIHtcbi8vICAgICAgICAgICB2YXIgdGhpc0RhdGVwaWNrZXIgPSB0aGlzO1xuLy8gICAgICAgICAgICRsYWJlbC50ZXh0KGdldExhYmVsVmFsdWUodGhpc0RhdGVwaWNrZXIpKTtcblxuLy8gICAgICAgICAgIE9ULkV2ZW50cy5vbignbWVudXM6Y2xlYXJlZCcsIGZ1bmN0aW9uKCl7XG4vLyAgICAgICAgICAgICBpZigkbGFiZWwuaGFzQ2xhc3MoJ3BpY2tlci1vcGVuaW5nJykpe1xuLy8gICAgICAgICAgICAgICAkbGFiZWwucmVtb3ZlQ2xhc3MoJ3BpY2tlci1vcGVuaW5nJyk7XG4vLyAgICAgICAgICAgICB9IGVsc2Uge1xuLy8gICAgICAgICAgICAgICBjbG9zZURwSWZPcGVuZWQodGhpc0RhdGVwaWNrZXIpO1xuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICAgIH0pO1xuLy8gICAgICAgICB9LFxuXG4vLyAgICAgICAgIG9uT3BlbjogZnVuY3Rpb24oKXtcbi8vICAgICAgICAgICBpZihpc0phcGFuZXNlKXtcbi8vICAgICAgICAgICAgIGZpeEphcGFuZXNlWWVhck1vbnRoTGFiZWwoKTtcbi8vICAgICAgICAgICB9XG5cbi8vICAgICAgICAgICAkbGFiZWwuYWRkQ2xhc3MoJ3BpY2tlci1vcGVuaW5nJyk7XG4vLyAgICAgICAgICAgT1QuQ29tbW9uLk1lbnVzLmNsb3NlQWxsTWVudXMoKTtcbi8vICAgICAgICAgICAkbGFiZWwuYWRkQ2xhc3MoJ21lbnUtb3BlbmVkJyk7XG5cbi8vICAgICAgICAgICB2YXIgJGNhbCA9ICRkYXRlcGlja2VyLmZpbmQoJy5waWNrZXInKSxcbi8vICAgICAgICAgICAgICAgcmVuZGVyUG9zaXRpb24gPSBnZXRSZW5kZXJQb3NpdGlvbigpO1xuXG4vLyAgICAgICAgICAgJGNhbC5yZW1vdmVDbGFzcygndXAnKS5yZW1vdmVDbGFzcygnZG93bicpLmFkZENsYXNzKHJlbmRlclBvc2l0aW9uKTtcbi8vICAgICAgICAgfSxcbi8vICAgICAgICAgb25DbG9zZTogZnVuY3Rpb24oKXtcbi8vICAgICAgICAgICAkbGFiZWwucmVtb3ZlQ2xhc3MoJ21lbnUtb3BlbmVkJyk7XG4vLyAgICAgICAgIH0sXG4vLyAgICAgICAgIG9uU2V0OiBmdW5jdGlvbigpe1xuLy8gICAgICAgICAgICRsYWJlbC50ZXh0KGdldExhYmVsVmFsdWUodGhpcykpO1xuLy8gICAgICAgICAgIE9ULkV2ZW50cy5maXJlKCdkYXRlcGlja2VyOmNoYW5nZScsIHsgc2VuZGVyOiAkZGF0ZXBpY2tlciB9KTtcblxuLy8gICAgICAgICAgIGlmKGlzSmFwYW5lc2Upe1xuLy8gICAgICAgICAgICAgZml4SmFwYW5lc2VZZWFyTW9udGhMYWJlbCgpO1xuLy8gICAgICAgICAgIH1cbi8vICAgICAgICAgfVxuLy8gICAgICAgfSk7XG5cbi8vICAgICAgIHJldHVybiAkZGF0ZXBpY2tlcjtcbi8vICAgICB9LFxuLy8gICAgIHJlZnJlc2g6IGZ1bmN0aW9uKCRkYXRlcGlja2VyKXtcbi8vICAgICAgIHZhciAkZGF0ZXBpY2tlcklucHV0ID0gJGRhdGVwaWNrZXIuZmluZCgnaW5wdXQnKTtcblxuLy8gICAgICAgaWYoJGRhdGVwaWNrZXJJbnB1dC5sZW5ndGggPT09IDApe1xuLy8gICAgICAgICByZXR1cm47XG4vLyAgICAgICB9XG5cbi8vICAgICAgIHZhciAkZHAgPSAkZGF0ZXBpY2tlcklucHV0LnBpY2thZGF0ZSgncGlja2VyJyk7XG5cbi8vICAgICAgIGlmKCRkcC5sZW5ndGggPT09IDApe1xuLy8gICAgICAgICByZXR1cm47XG4vLyAgICAgICB9XG5cbi8vICAgICAgIHZhciAkbGFiZWwgPSAkZGF0ZXBpY2tlci5maW5kKCcuZGF0ZS1sYWJlbCcpO1xuXG4vLyAgICAgICBpZigkbGFiZWwubGVuZ3RoID09PSAwKXtcbi8vICAgICAgICAgcmV0dXJuO1xuLy8gICAgICAgfVxuXG4vLyAgICAgICAkbGFiZWwudGV4dChnZXRMYWJlbFZhbHVlKCRkcCkpO1xuLy8gICAgIH0sXG4vLyAgICAgc2V0OiBmdW5jdGlvbigkZGF0ZXBpY2tlciwgdmFsdWUsIGZvcm1hdCl7XG4vLyAgICAgICB2YXIgJGRhdGVwaWNrZXJJbnB1dCA9ICRkYXRlcGlja2VyLmZpbmQoJ2lucHV0JyksXG4vLyAgICAgICAgICAgb3B0aW9uYWxGb3JtYXQgPSBmb3JtYXQgfHwgeyBmb3JtYXQ6ICd5eXl5LW1tLWRkJyB9O1xuXG4vLyAgICAgICByZXR1cm4gJGRhdGVwaWNrZXJJbnB1dC5waWNrYWRhdGUoJ3BpY2tlcicpLnNldCgnc2VsZWN0JywgdmFsdWUsIG9wdGlvbmFsRm9ybWF0KTtcbi8vICAgICB9XG4vLyAgIH07XG5cbi8vICAgdmFyIHNldHVwTGFuZ3VhZ2UgPSBmdW5jdGlvbihsYW5nKXtcbi8vICAgICBpZihsYW5nID09PSAnZXMnKXtcbi8vICAgICAgICQuZXh0ZW5kKCQuZm4ucGlja2FkYXRlLmRlZmF1bHRzLCB7XG4vLyAgICAgICAgIG1vbnRoc0Z1bGw6IFsgJ2VuZXJvJywgJ2ZlYnJlcm8nLCAnbWFyem8nLCAnYWJyaWwnLCAnbWF5bycsICdqdW5pbycsICdqdWxpbycsICdhZ29zdG8nLCAnc2VwdGllbWJyZScsICdvY3R1YnJlJywgJ25vdmllbWJyZScsICdkaWNpZW1icmUnIF0sXG4vLyAgICAgICAgIG1vbnRoc1Nob3J0OiBbICdlbmUnLCAnZmViJywgJ21hcicsICdhYnInLCAnbWF5JywgJ2p1bicsICdqdWwnLCAnYWdvJywgJ3NlcCcsICdvY3QnLCAnbm92JywgJ2RpYycgXSxcbi8vICAgICAgICAgd2Vla2RheXNGdWxsOiBbICdkb21pbmdvJywgJ2x1bmVzJywgJ21hcnRlcycsICdtacOpcmNvbGVzJywgJ2p1ZXZlcycsICd2aWVybmVzJywgJ3PDoWJhZG8nIF0sXG4vLyAgICAgICAgIHdlZWtkYXlzU2hvcnQ6IFsgJ2RvbScsICdsdW4nLCAnbWFyJywgJ21pw6knLCAnanVlJywgJ3ZpZScsICdzw6FiJyBdLFxuLy8gICAgICAgICB0b2RheTogJ2hveScsXG4vLyAgICAgICAgIGNsZWFyOiAnYm9ycmFyJyxcbi8vICAgICAgICAgbGFiZWxNb250aE5leHQ6ICdNZXMgcHLDs3hpbW8nLFxuLy8gICAgICAgICBsYWJlbE1vbnRoUHJldjogJ01lcyBhbnRlcmlvcidcbi8vICAgICAgIH0pO1xuLy8gICAgIH0gZWxzZSBpZihsYW5nID09PSAnamEnKXtcbi8vICAgICAgICQuZXh0ZW5kKCQuZm4ucGlja2FkYXRlLmRlZmF1bHRzLCB7XG4vLyAgICAgICAgIG1vbnRoc0Z1bGw6IFsgJzHmnIgnLCAnMuaciCcsICcz5pyIJywgJzTmnIgnLCAnNeaciCcsICc25pyIJywgJzfmnIgnLCAnOOaciCcsICc55pyIJywgJzEw5pyIJywgJzEx5pyIJywgJzEy5pyIJyBdLFxuLy8gICAgICAgICBtb250aHNTaG9ydDogWyAnMeaciCcsICcy5pyIJywgJzPmnIgnLCAnNOaciCcsICc15pyIJywgJzbmnIgnLCAnN+aciCcsICc45pyIJywgJznmnIgnLCAnMTDmnIgnLCAnMTHmnIgnLCAnMTLmnIgnIF0sXG4vLyAgICAgICAgIHdlZWtkYXlzRnVsbDogWyAn5pelJywgJ+aciCcsICfngasnLCAn5rC0JywgJ+acqCcsICfph5EnLCAn5ZyfJyBdLFxuLy8gICAgICAgICB3ZWVrZGF5c1Nob3J0OiBbICfml6UnLCAn5pyIJywgJ+eBqycsICfmsLQnLCAn5pyoJywgJ+mHkScsICflnJ8nIF0sXG4vLyAgICAgICAgIHRvZGF5OiAn5LuK5pelJyxcbi8vICAgICAgICAgY2xlYXI6ICfmtojljrsnLFxuLy8gICAgICAgICBsYWJlbE1vbnRoTmV4dDogJ+asoeaciCcsXG4vLyAgICAgICAgIGxhYmVsTW9udGhQcmV2OiAn5YmN5pyIJ1xuLy8gICAgICAgfSk7XG4vLyAgICAgfSBlbHNlIGlmKGxhbmcgPT09ICdmcicpe1xuLy8gICAgICAgJC5leHRlbmQoJC5mbi5waWNrYWRhdGUuZGVmYXVsdHMsIHtcbi8vICAgICAgICAgbW9udGhzRnVsbDogWyAnSmFudmllcicsICdGw6l2cmllcicsICdNYXJzJywgJ0F2cmlsJywgJ01haScsICdKdWluJywgJ0p1aWxsZXQnLCAnQW/Du3QnLCAnU2VwdGVtYnJlJywgJ09jdG9icmUnLCAnTm92ZW1icmUnLCAnRMOpY2VtYnJlJyBdLFxuLy8gICAgICAgICBtb250aHNTaG9ydDogWyAnSmFuJywgJ0ZldicsICdNYXInLCAnQXZyJywgJ01haScsICdKdWluJywgJ0p1aWwnLCAnQW91JywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYycgXSxcbi8vICAgICAgICAgd2Vla2RheXNGdWxsOiBbICdEaW1hbmNoZScsICdMdW5kaScsICdNYXJkaScsICdNZXJjcmVkaScsICdKZXVkaScsICdWZW5kcmVkaScsICdTYW1lZGknIF0sXG4vLyAgICAgICAgIHdlZWtkYXlzU2hvcnQ6IFsgJ0RpbScsICdMdW4nLCAnTWFyJywgJ01lcicsICdKZXUnLCAnVmVuJywgJ1NhbScgXSxcbi8vICAgICAgICAgdG9kYXk6ICdBdWpvdXJkXFwnaHVpJyxcbi8vICAgICAgICAgY2xlYXI6ICdFZmZhY2VyJyxcbi8vICAgICAgICAgbGFiZWxNb250aE5leHQ6ICdNb2lzIHN1aXZhbnQnLFxuLy8gICAgICAgICBsYWJlbE1vbnRoUHJldjogJ01vaXMgcHLDqWPDqWRlbnQnXG4vLyAgICAgICB9KTtcbi8vICAgICB9IGVsc2UgaWYobGFuZyA9PT0gJ2RlJyl7XG4vLyAgICAgICAkLmV4dGVuZCgkLmZuLnBpY2thZGF0ZS5kZWZhdWx0cywge1xuLy8gICAgICAgICBtb250aHNGdWxsOiBbICdKYW51YXInLCAnRmVicnVhcicsICdNw6RyeicsICdBcHJpbCcsICdNYWknLCAnSnVuaScsICdKdWxpJywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2t0b2JlcicsICdOb3ZlbWJlcicsICdEZXplbWJlcicgXSxcbi8vICAgICAgICAgbW9udGhzU2hvcnQ6IFsgJ0phbicsICdGZWInLCAnTcOkcicsICdBcHInLCAnTWFpJywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPa3QnLCAnTm92JywgJ0RleicgXSxcbi8vICAgICAgICAgd2Vla2RheXNGdWxsOiBbICdTb25udGFnJywgJ01vbnRhZycsICdEaWVuc3RhZycsICdNaXR0d29jaCcsICdEb25uZXJzdGFnJywgJ0ZyZWl0YWcnLCAnU2Ftc3RhZycgXSxcbi8vICAgICAgICAgd2Vla2RheXNTaG9ydDogWyAnU28nLCAnTW8nLCAnRGknLCAnTWknLCAnRG8nLCAnRnInLCAnU2EnIF0sXG4vLyAgICAgICAgIHRvZGF5OiAnSGV1dGUnLFxuLy8gICAgICAgICBjbGVhcjogJ0zDtnNjaGVuJyxcbi8vICAgICAgICAgbGFiZWxNb250aE5leHQ6ICdOw6RjaHN0ZScsXG4vLyAgICAgICAgIGxhYmVsTW9udGhQcmV2OiAnRnLDvGhlcidcbi8vICAgICAgIH0pO1xuLy8gICAgIH1cbi8vICAgfTtcblxuLy8gICAkLmZuLk9UZGF0ZXBpY2tlciA9IGZ1bmN0aW9uKGFjdGlvbiwgcGFyYW0sIHBhcmFtMil7XG5cbi8vICAgICB2YXIgJHRoaXMgPSB0aGlzO1xuXG4vLyAgICAgaWYoYWN0aW9uID09PSAnaW5pdCcpe1xuLy8gICAgICAgcmV0dXJuIGRhdGVwaWNrZXIuaW5pdCgkdGhpcywgcGFyYW0pO1xuLy8gICAgIH0gZWxzZSBpZihhY3Rpb24gPT09ICdnZXQnKXtcbi8vICAgICAgIHJldHVybiBkYXRlcGlja2VyLmdldCgkdGhpcywgcGFyYW0pO1xuLy8gICAgIH0gZWxzZSBpZihhY3Rpb24gPT09ICdnZXRPcmlnaW5hbFZhbHVlJyl7XG4vLyAgICAgICByZXR1cm4gZGF0ZXBpY2tlci5nZXRPcmlnaW5hbFZhbHVlKCR0aGlzLCBwYXJhbSk7XG4vLyAgICAgfSBlbHNlIGlmKGFjdGlvbiA9PT0gJ3JlZnJlc2gnKXtcbi8vICAgICAgIHJldHVybiBkYXRlcGlja2VyLnJlZnJlc2goJHRoaXMpO1xuLy8gICAgIH0gZWxzZSBpZihhY3Rpb24gPT09ICdzZXQnKXtcbi8vICAgICAgIHJldHVybiBkYXRlcGlja2VyLnNldCgkdGhpcywgcGFyYW0sIHBhcmFtMik7XG4vLyAgICAgfVxuXG4vLyAgICAgcmV0dXJuIHRoaXM7XG4vLyAgIH07XG5cbi8vICAgcmV0dXJuIHtcbi8vICAgICBpbml0OiBkYXRlcGlja2VyLmluaXQsXG4vLyAgICAgZ2V0OiBkYXRlcGlja2VyLmdldCxcbi8vICAgICBnZXRPcmlnaW5hbFZhbHVlOiBkYXRlcGlja2VyLmdldE9yaWdpbmFsVmFsdWUsXG4vLyAgICAgc2V0OiBkYXRlcGlja2VyLnNldFxuLy8gICB9O1xuXG4vLyB9KShqUXVlcnksIG1vbWVudCk7XG4vL1xuLy9cbi8vICd1c2Ugc3RyaWN0JztcblxuLy8gdmFyIG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpO1xuLy8gdmFyIHJlcXVlc3QgPSByZXF1aXJlKCdyZXF1ZXN0Jyk7XG4vLyB2YXIgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcblxuLy8gdmFyIGxhbmd1YWdlcyA9IHJlcXVpcmUoJy4vbGFuZ3VhZ2VzJyk7XG4vLyB2YXIgb2Zmc2V0cyA9IHJlcXVpcmUoJy4vb2Zmc2V0cycpO1xuXG4vLyB2YXIgZ2V0ID0ge1xuLy8gICBkYXRlOiBmdW5jdGlvbihkYXRlVGltZSl7XG4vLyAgICAgcmV0dXJuICEhZGF0ZVRpbWUgPyBtb21lbnQoZGF0ZVRpbWUpLmZvcm1hdCgnWVlZWS1NTS1ERCcpIDogJyc7XG4vLyAgIH0sXG4vLyAgIGxvY2FsaXNlZFRpbWU6IGZ1bmN0aW9uKHRpbWUsIHRoZW1lLCBsYW5nKXtcbi8vICAgICB2YXIgZGF0ZVRpbWUgPSBtb21lbnQoJzIwMDEtMDEtMDFUJyArIHRpbWUpLFxuLy8gICAgICAgICBmb3JtYXR0ZWRUaW1lID0gZGF0ZVRpbWUuZm9ybWF0KCdISDptbScpO1xuXG4vLyAgICAgcmV0dXJuICghIXRoZW1lLm1hdGNoKCdjb218bXgnKSAmJiBsYW5nICE9PSAnZnInKSA/IGRhdGVUaW1lLmZvcm1hdCgnaDptbScpICsgJyAnICsgZGF0ZVRpbWUuZm9ybWF0KCdBJykgOiBmb3JtYXR0ZWRUaW1lO1xuLy8gICB9LFxuLy8gICBwYXJ0eVNpemU6IGZ1bmN0aW9uKHBhcnR5U2l6ZSwgc2hvd0xhcmdlclBhcnR5KXtcbi8vICAgICBwYXJ0eVNpemUgPSAhIXBhcnR5U2l6ZSA/IChwYXJ0eVNpemUgPT09ICcyMCsnID8gMjEgOiBwYXJzZUludChwYXJ0eVNpemUsIDEwKSkgOiAwO1xuLy8gICAgIHJldHVybiAoIXNob3dMYXJnZXJQYXJ0eSAmJiBwYXJ0eVNpemUgPT09IDIxKSA/IDAgOiBwYXJ0eVNpemU7XG4vLyAgIH0sXG4vLyAgIHRpbWU6IGZ1bmN0aW9uKGRhdGVUaW1lKXtcbi8vICAgICByZXR1cm4gISFkYXRlVGltZSA/IG1vbWVudChkYXRlVGltZS5yZXBsYWNlKCdaJywgJycpKS5mb3JtYXQoJ0hIOm1tJykgOiAnJztcbi8vICAgfVxuLy8gfTtcblxuLy8gdmFyIHRoZW1lc0FuZExhbmdzID0ge1xuLy8gICBjb206IFsnZW4nLCAnZnInXSxcbi8vICAgY291azogWydlbiddLFxuLy8gICBkZTogWydkZScsICdlbiddLFxuLy8gICBpZTogWydlbiddLFxuLy8gICBqcDogWydqYScsICdlbiddLFxuLy8gICBteDogWydlcycsICdlbiddLFxuLy8gICBhdTogWydlbiddXG4vLyB9O1xuXG4vLyB2YXIgY2FjaGVkID0ge307XG5cbi8vIG1vZHVsZS5leHBvcnRzLmRhdGEgPSBmdW5jdGlvbihjb250ZXh0LCBjYWxsYmFjayl7XG5cbi8vICAgdmFyIGlzQWNjZXB0TGFuZ3VhZ2VWYWxpZCA9IF8uaXNBcnJheShjb250ZXh0LmFjY2VwdExhbmd1YWdlKSAmJiAhXy5pc0VtcHR5KGNvbnRleHQuYWNjZXB0TGFuZ3VhZ2UpICYmICEhY29udGV4dC5hY2NlcHRMYW5ndWFnZVswXS5jb2RlLFxuLy8gICAgICAgcGFyc2VkTGFuZ3VhZ2UgPSBpc0FjY2VwdExhbmd1YWdlVmFsaWQgPyBjb250ZXh0LmFjY2VwdExhbmd1YWdlWzBdLmNvZGUgOiAnKicsXG4vLyAgICAgICB0aGVtZUFyZyA9IGNvbnRleHQucGFyYW1zLnRoZW1lLFxuLy8gICAgICAgdGhlbWUgPSAoISF0aGVtZUFyZyAmJiBfLmhhcyh0aGVtZXNBbmRMYW5ncywgdGhlbWVBcmcpKSA/IHRoZW1lQXJnIDogJ2NvbScsXG4vLyAgICAgICBsYW5nc0ZvclRoZW1lID0gdGhlbWVzQW5kTGFuZ3NbdGhlbWVdLFxuLy8gICAgICAgbGFuZ3VhZ2UgPSBfLmNvbnRhaW5zKGxhbmdzRm9yVGhlbWUsIHBhcnNlZExhbmd1YWdlKSA/IHBhcnNlZExhbmd1YWdlIDogbGFuZ3NGb3JUaGVtZVswXSxcbi8vICAgICAgIHNob3dTZWFyY2ggPSBjb250ZXh0LnBhcmFtcy5zaG93U2VhcmNoIHx8IGZhbHNlLFxuLy8gICAgICAgY2FjaGVGbHVzaFRpbWVvdXQgPSAxMCAqIDYwICogMTAwMDtcblxuLy8gICB2YXIgZ2V0VGltZXpvbmVzRGF0YSA9IGZ1bmN0aW9uKGNiKXtcbi8vICAgICBpZighIWNhY2hlZC50aW1lem9uZXMpe1xuLy8gICAgICAgY2IobnVsbCwgY2FjaGVkLnRpbWV6b25lcyk7XG4vLyAgICAgfSBlbHNlIHtcbi8vICAgICAgIHZhciBkYXRhQXBpVXJsID0gY29udGV4dC5wbHVnaW5zLmRpc2NvdmVyKCdvYy1jb3JlLWRhdGEnKSB8fCB1bmRlZmluZWQ7XG5cbi8vICAgICAgIGlmKCEhZGF0YUFwaVVybCl7XG4vLyAgICAgICAgIGRhdGFBcGlVcmwgKz0gJy9vYy9kdHAnO1xuXG4vLyAgICAgICAgIHJlcXVlc3Qoe1xuLy8gICAgICAgICAgIHVybDogZGF0YUFwaVVybCxcbi8vICAgICAgICAgICB0aW1lb3V0OiAzMDAwXG4vLyAgICAgICAgIH0sIGZ1bmN0aW9uKGVyciwgcmVzLCBib2R5KXtcbi8vICAgICAgICAgICBpZihlcnIgfHwgcmVzLnN0YXR1c0NvZGUgIT09IDIwMCl7IHJldHVybiBjYihlcnIsIG9mZnNldHMpOyB9XG4vLyAgICAgICAgICAgdHJ5IHtcbi8vICAgICAgICAgICAgIHZhciB2YWx1ZSA9IEpTT04ucGFyc2UoYm9keSk7XG4vLyAgICAgICAgICAgICBjYWNoZWQudGltZXpvbmVzID0gdmFsdWU7XG5cbi8vICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbi8vICAgICAgICAgICAgICAgY2FjaGVkLnRpbWV6b25lcyA9IG51bGw7XG4vLyAgICAgICAgICAgICB9LCBjYWNoZUZsdXNoVGltZW91dCk7XG5cbi8vICAgICAgICAgICAgIGNiKG51bGwsIHZhbHVlKTtcbi8vICAgICAgICAgICB9IGNhdGNoKGUpe1xuLy8gICAgICAgICAgICAgY2IoZSwgb2Zmc2V0cyk7XG4vLyAgICAgICAgICAgfVxuLy8gICAgICAgICB9KTtcbi8vICAgICAgIH0gZWxzZSB7XG4vLyAgICAgICAgIGNiKCdzZXJ2aWNlIG5vdCBkaXNjb3ZlcmVkJywgb2Zmc2V0cyk7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy8gICB9O1xuXG4vLyAgIGdldFRpbWV6b25lc0RhdGEoZnVuY3Rpb24oZXJyLCBkYXRhKXtcblxuLy8gICAgIHZhciBvZmZzZXRzRm9yVGhlbWUgPSBkYXRhW3RoZW1lXSxcbi8vICAgICAgICAgb2Zmc2V0c0ZvckxhbmcgPSBfLmNvbnRhaW5zKF8ua2V5cyhvZmZzZXRzRm9yVGhlbWUpLCBsYW5ndWFnZSkgPyBvZmZzZXRzRm9yVGhlbWVbbGFuZ3VhZ2VdIDogb2Zmc2V0c0ZvclRoZW1lW18ua2V5cyhvZmZzZXRzRm9yVGhlbWUpWzBdXSxcbi8vICAgICAgICAgb2Zmc2V0ID0gb2Zmc2V0c0ZvckxhbmcuZGVmYXVsdDtcblxuLy8gICAgIGlmKCEhY29udGV4dC5wYXJhbXMubWV0cm9JZCAmJiAhIW9mZnNldHNGb3JMYW5nLmV4Y2VwdGlvbnMgJiYgISFvZmZzZXRzRm9yTGFuZy5leGNlcHRpb25zW2NvbnRleHQucGFyYW1zLm1ldHJvSWRdKXtcbi8vICAgICAgIG9mZnNldCA9IG9mZnNldHNGb3JMYW5nLmV4Y2VwdGlvbnNbY29udGV4dC5wYXJhbXMubWV0cm9JZF07XG4vLyAgICAgfVxuXG4vLyAgICAgdmFyIF9fID0gZnVuY3Rpb24odGVybSl7XG4vLyAgICAgICB2YXIgZGljdGlvbmFyeSA9IGxhbmd1YWdlc1tsYW5ndWFnZV07XG4vLyAgICAgICByZXR1cm4gXy5oYXMoZGljdGlvbmFyeSwgdGVybSkgPyBkaWN0aW9uYXJ5W3Rlcm1dIDogJyc7XG4vLyAgICAgfTtcblxuLy8gICAgIHZhciBzZWFyY2hQbGFjZWhvbGRlciA9ICghIXNob3dTZWFyY2ggJiYgISFjb250ZXh0LnBhcmFtcy5zZWFyY2hQbGFjZWhvbGRlcikgPyBjb250ZXh0LnBhcmFtcy5zZWFyY2hQbGFjZWhvbGRlciA6IF9fKCd0ZXh0UGxhY2Vob2xkZXInKSxcbi8vICAgICAgICAgc2hvd0xhcmdlclBhcnR5ID0gY29udGV4dC5wYXJhbXMuc2hvd0xhcmdlclBhcnR5ID09PSBmYWxzZSA/IGZhbHNlIDogdHJ1ZSxcbi8vICAgICAgICAgdGltZU9wdGlvbnMgPSBbXTtcblxuLy8gICAgIGZvcih2YXIgaSA9IDA7IGk8MjQ7IGkrKyl7XG4vLyAgICAgICB2YXIgdmFsdWUgPSAoaSA8IDEwID8gJzAnIDogJycpICsgaSArICc6MDAnLFxuLy8gICAgICAgICAgIGhhbGZWYWx1ZSA9IChpIDwgMTAgPyAnMCcgOiAnJykgKyBpICsgJzozMCc7XG5cbi8vICAgICAgIHRpbWVPcHRpb25zLnB1c2goe1xuLy8gICAgICAgICB2YWx1ZTogdmFsdWUsXG4vLyAgICAgICAgIGRpc3BsYXlWYWx1ZTogZ2V0LmxvY2FsaXNlZFRpbWUodmFsdWUsIHRoZW1lLCBsYW5ndWFnZSlcbi8vICAgICAgIH0pO1xuXG4vLyAgICAgICB0aW1lT3B0aW9ucy5wdXNoKHtcbi8vICAgICAgICAgdmFsdWU6IGhhbGZWYWx1ZSxcbi8vICAgICAgICAgZGlzcGxheVZhbHVlOiBnZXQubG9jYWxpc2VkVGltZShoYWxmVmFsdWUsIHRoZW1lLCBsYW5ndWFnZSlcbi8vICAgICAgIH0pO1xuLy8gICAgIH1cblxuLy8gICAgIGNhbGxiYWNrKG51bGwsIHtcbi8vICAgICAgIHNob3dTZWFyY2g6IGNvbnRleHQucGFyYW1zLnNob3dTZWFyY2ggfHwgZmFsc2UsXG4vLyAgICAgICB0aW1lOiBnZXQudGltZShjb250ZXh0LnBhcmFtcy5kYXRlVGltZSksXG4vLyAgICAgICBkYXRlOiBnZXQuZGF0ZShjb250ZXh0LnBhcmFtcy5kYXRlVGltZSksXG4vLyAgICAgICBwYXJ0eVNpemU6IGdldC5wYXJ0eVNpemUoY29udGV4dC5wYXJhbXMucGFydHlTaXplLCBzaG93TGFyZ2VyUGFydHkpLFxuLy8gICAgICAgdGltZU9wdGlvbnM6IHRpbWVPcHRpb25zLFxuLy8gICAgICAgcGFydHlTaXplU2luZ3VsYXI6IF9fKCdwYXJ0eVNpbmd1bGFyJyksXG4vLyAgICAgICBwYXJ0eVNpemVQbHVyYWw6IF9fKCdwYXJ0eVBsdXJhbCcpLFxuLy8gICAgICAgcGFydHlTaXplTGFyZ2VyUGFydHk6IF9fKCdwYXJ0eUxhcmdlcicpLFxuLy8gICAgICAgZmluZEFUYWJsZTogX18oJ2ZpbmRBVGFibGUnKSxcbi8vICAgICAgIGF1dG9jb21wbGV0ZVBsYWNlaG9sZGVyOiBzZWFyY2hQbGFjZWhvbGRlcixcbi8vICAgICAgIHRpbWV6b25lT2Zmc2V0OiBvZmZzZXQsXG4vLyAgICAgICBsYW5ndWFnZTogbGFuZ3VhZ2UsXG4vLyAgICAgICBzaG93TGFyZ2VyUGFydHk6IHNob3dMYXJnZXJQYXJ0eVxuLy8gICAgIH0pO1xuLy8gICB9KTtcbi8vIH07XG4vL21peGluIHBhcnR5U2l6ZURpc3BsYXlWYWx1ZShpc1NlbGVjdGVkLCBpKVxuICAvLyAtIHZhciBkaXNwbGF5VmFsdWUgPSBwYXJ0eVNpemVQbHVyYWwucmVwbGFjZSgnezB9JywgaSk7XG4gIC8vIC0gaWYoaSA9PT0gMSlcbiAgLy8gICAtIGRpc3BsYXlWYWx1ZSA9IHBhcnR5U2l6ZVNpbmd1bGFyLnJlcGxhY2UoJ3swfScsIGkpO1xuICAvLyAtIGVsc2UgaWYoaSA9PT0gMjEpXG4gIC8vICAgLSBkaXNwbGF5VmFsdWUgPSBwYXJ0eVNpemVMYXJnZXJQYXJ0eTtcbiAgLy8gLSBpZihpc1NlbGVjdGVkKVxuICAvLyAgIG9wdGlvbih2YWx1ZT1pLCBzZWxlY3RlZD1cInNlbGVjdGVkXCIpICN7ZGlzcGxheVZhbHVlfVxuICAvLyAtIGVsc2VcbiAgLy8gICBvcHRpb24odmFsdWU9aSkgI3tkaXNwbGF5VmFsdWV9XG5cbi8vIC0gdmFyIGV4dHJhQ3NzQ2xhc3MgPSBzaG93U2VhcmNoID8gXCIgd2l0aC1zZWFyY2hcIiA6IFwiXCI7XG4vLyBkaXYoY2xhc3M9XCJkdHAtcGlja2VyIGhpZGUgZHRwLWxhbmctXCIgKyBsYW5ndWFnZSArIGV4dHJhQ3NzQ2xhc3MpXG4gIC8vIGZvcm0uZHRwLXBpY2tlci1mb3JtXG4gIC8vICAgLSBpZiAodGltZXpvbmVPZmZzZXQgIT0gbnVsbClcbiAgLy8gICAgIGlucHV0KHR5cGU9XCJoaWRkZW5cIiwgbmFtZT1cInRpbWV6b25lT2Zmc2V0XCIsIHZhbHVlPXRpbWV6b25lT2Zmc2V0KVxuICAvLyAgIHNlbGVjdC5wYXJ0eS1zaXplLXBpY2tlci5oaWRlXG4gIC8vICAgICAtIGZvciAodmFyIGkgPSAxOyBpIDwgKHNob3dMYXJnZXJQYXJ0eSA/IDIyIDogMjEpOyBpKyspXG4gIC8vICAgICAgICtwYXJ0eVNpemVEaXNwbGF5VmFsdWUoKGkgPT09IHBhcnR5U2l6ZSksIGkpXG4gIC8vICAgaW5wdXQuZGF0ZS1waWNrZXIuZHRwLXBpY2tlci1zZWxlY3Rvcih2YWx1ZT1kYXRlLCB0eXBlPVwidGV4dFwiKVxuICAvLyAgIHNlbGVjdC50aW1lLXBpY2tlci5oaWRlXG4gIC8vICAgICAtIGZvciAodmFyIGkgPSAwOyBpIDwgdGltZU9wdGlvbnMubGVuZ3RoOyBpKyspe1xuICAvLyAgICAgICAtIHZhciBkaXNwbGF5VmFsdWUgPSB0aW1lT3B0aW9uc1tpXVtcImRpc3BsYXlWYWx1ZVwiXTtcbiAgLy8gICAgICAgLSB2YXIgdmFsdWUgPSB0aW1lT3B0aW9uc1tpXVtcInZhbHVlXCJdO1xuICAvLyAgICAgICAtIHZhciBpc1NlbGVjdGVkID0gdmFsdWUgPT09IHRpbWU7XG4gIC8vICAgICAgIC0gaWYoaXNTZWxlY3RlZClcbiAgLy8gICAgICAgICBvcHRpb24odmFsdWU9dmFsdWUsIHNlbGVjdGVkPVwic2VsZWN0ZWRcIikgI3tkaXNwbGF5VmFsdWV9XG4gIC8vICAgICAgIC0gZWxzZVxuICAvLyAgICAgICAgIG9wdGlvbih2YWx1ZT12YWx1ZSkgI3tkaXNwbGF5VmFsdWV9XG4gIC8vICAgICAtIH1cbiAgLy8gICAtIGlmKHNob3dTZWFyY2gpe1xuICAvLyAgICAgZGl2LmR0cC1waWNrZXItc2VhcmNoLWNvbnRhaW5lclxuICAvLyAgICAgICBkaXYuZHRwLXBpY2tlci1zZWFyY2gtaWNvbi5pY29uLXNlYXJjaFxuICAvLyAgICAgICBpbnB1dC5kdHAtcGlja2VyLXNlYXJjaCh0eXBlPVwidGV4dFwiLCBuYW1lPVwic2VhcmNoVGV4dFwiLCB2YWx1ZT1cIlwiLCBwbGFjZWhvbGRlcj1hdXRvY29tcGxldGVQbGFjZWhvbGRlciwgZGF0YS1iaW5kPVwiXCIpXG4gIC8vICAgLSB9XG4gIC8vICAgaW5wdXQuYnV0dG9uLmR0cC1waWNrZXItYnV0dG9uKHR5cGU9XCJzdWJtaXRcIiwgdmFsdWU9ZmluZEFUYWJsZSlcbiAgLy9cbiAgLy9cbiAgLy8gLy8gICAvKipcbiAvLyAqIFNlbGVjdCAtIHRyYW5zZm9ybSBhbiBodG1sIHNlbGVjdCB3aXRoIG9wdGlvbnMgdG8gYSBuZXcgZGVzaWduZWQgb25lLFxuIC8vICogd2l0aCBzdHlsaW5nLCBtZW51cywgaGFuZGxlcnMsIGV0Yy5cbiAvLyAqXG4gLy8gKi9cblxuLy8gT1QuY3JlYXRlTlMoJ09ULkNvbW1vbi5TZWxlY3QnKTtcblxuLy8gT1QuQ29tbW9uLlNlbGVjdCA9IChmdW5jdGlvbigkLCBfKXtcbiAgLy8gJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIHZhciBfZGF0YSA9IHt9O1xuXG4gIC8vIHZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKG0pe1xuXG4gIC8vICAgdmFyIHQgPSAgJzxkaXYgY2xhc3M9XCInICsgbS5jc3NDbGFzcyArICcgZHRwLXBpY2tlci1zZWxlY3RvciBzZWxlY3QtbmF0aXZlJysgKG0udW5zZWxlY3RlZE9uSW5pdCA/IFwiIHVuc2VsZWN0ZWQtb24taW5pdFwiIDogJycpICsnXCI+JyArXG4gIC8vICAgICAgICAgICAgJyAgPGEgY2xhc3M9XCJzZWxlY3QtbGFiZWwgZHRwLXBpY2tlci1zZWxlY3Rvci1saW5rXCIgdGFiaW5kZXg9XCItMVwiPicgKyBtLnNlbGVjdGVkVmFsdWUgKyAnPC9hPicgK1xuICAvLyAgICAgICAgICAgICcgIDxzZWxlY3QgbmFtZT1cIicgKyBtLm5hbWUgKyAnXCI+JztcblxuICAvLyAgIGZvcih2YXIgaSA9IDA7IGkgPCBtLm9wdGlvbnMubGVuZ3RoOyBpKyspe1xuICAvLyAgICAgdmFyIG9wdGlvbiA9ICBtLm9wdGlvbnNbaV0sXG4gIC8vICAgICAgICAgaXNDaGVja2VkID0gb3B0aW9uLnNlbGVjdGVkID8gXCIgc2VsZWN0ZWQ9XFxcInNlbGVjdGVkXFxcIlwiIDogJyc7XG5cbiAgLy8gICAgIHQgKz0gJyAgICA8b3B0aW9uIHZhbHVlPVwiJyArIG9wdGlvbi52YWx1ZSArICdcIicgKyBpc0NoZWNrZWQgKyAnPicgKyBvcHRpb24uZGlzcGxheSArICc8L29wdGlvbj4nO1xuICAvLyAgIH1cblxuICAvLyAgIHQgKz0gJyAgPC9zZWxlY3Q+JyArXG4gIC8vICAgICAgICAnPC9kaXY+JztcblxuICAvLyAgIHJldHVybiB0O1xuICAvLyB9O1xuXG4gIC8vIHZhciBnZXRVbmlxdWVOYW1lID0gZnVuY3Rpb24oKXtcbiAgLy8gICB2YXIgYyA9IDAsXG4gIC8vICAgICAgIG5hbWUgPSBcIlNlbGVjdF9cIiArIGM7XG5cbiAgLy8gICB3aGlsZSgkKFwic2VsZWN0W25hbWU9J1wiICsgbmFtZSArIFwiJ11cIikubGVuZ3RoID4gMCl7XG4gIC8vICAgICBjKys7XG4gIC8vICAgICBuYW1lID0gXCJTZWxlY3RfXCIgKyBjO1xuICAvLyAgIH1cblxuICAvLyAgIHJldHVybiBuYW1lO1xuICAvLyB9O1xuXG4gIC8vIHZhciBnZXRTZWxlY3RNb2RlbCA9IGZ1bmN0aW9uKCRzZWxlY3Qpe1xuXG4gIC8vICAgdmFyIG91dGVySHRtbCA9IGZ1bmN0aW9uKCRlbCl7IHJldHVybiAkKFwiPGRpdiAvPlwiKS5hcHBlbmQoJGVsLmNsb25lKCkpLmh0bWwoKTsgfSxcbiAgLy8gICAgICAgdW5zZWxlY3RlZE9uSW5pdCA9IGZhbHNlO1xuXG4gIC8vICAgdmFyIG5hbWUgPSBnZXRVbmlxdWVOYW1lKCksXG4gIC8vICAgICAgIG1vZGVsID0ge1xuICAvLyAgICAgICAgIG5hbWU6IG5hbWUsXG4gIC8vICAgICAgICAgY3NzQ2xhc3M6ICRzZWxlY3QuYXR0cihcImNsYXNzXCIpIHx8IFwiXCIsXG4gIC8vICAgICAgICAgdW5zZWxlY3RlZE9uSW5pdDogZmFsc2UsXG4gIC8vICAgICAgICAgb3B0aW9uczogXy5tYXAoJHNlbGVjdC5maW5kKFwib3B0aW9uXCIpLCBmdW5jdGlvbihvcHRpb24pe1xuICAvLyAgICAgICAgICAgdmFyICRvcHRpb24gPSAkKG9wdGlvbiksXG4gIC8vICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSAkb3B0aW9uLnByb3AoJ3NlbGVjdGVkJyk7XG5cbiAgLy8gICAgICAgICAgIGlmKCEhc2VsZWN0ZWQgJiYgb3V0ZXJIdG1sKCRvcHRpb24pLmluZGV4T2YoXCJzZWxlY3RlZFwiKSA9PT0gLTEpe1xuICAvLyAgICAgICAgICAgICB1bnNlbGVjdGVkT25Jbml0ID0gdHJ1ZTtcbiAgLy8gICAgICAgICAgIH1cblxuICAvLyAgICAgICAgICAgcmV0dXJuIHtcbiAgLy8gICAgICAgICAgICAgZGlzcGxheTogJG9wdGlvbi50ZXh0KCksXG4gIC8vICAgICAgICAgICAgIHZhbHVlOiAkb3B0aW9uLnZhbCgpLFxuICAvLyAgICAgICAgICAgICBzZWxlY3RlZDogc2VsZWN0ZWRcbiAgLy8gICAgICAgICAgIH07XG4gIC8vICAgICAgICAgfSlcbiAgLy8gICAgICAgfTtcblxuICAvLyAgIF9kYXRhW25hbWVdID0gbW9kZWwub3B0aW9ucztcblxuICAvLyAgIHZhciBzZWxlY3RlZCA9IF8uZmluZFdoZXJlKG1vZGVsLm9wdGlvbnMsIHsgc2VsZWN0ZWQ6IHRydWUgfSk7XG4gIC8vICAgbW9kZWwuc2VsZWN0ZWRWYWx1ZSA9ICEhc2VsZWN0ZWQgPyBzZWxlY3RlZC5kaXNwbGF5IDogJyc7XG5cbiAgLy8gICBpZihtb2RlbC5zZWxlY3RlZFZhbHVlID09PSAnJyB8fCB1bnNlbGVjdGVkT25Jbml0KXtcbiAgLy8gICAgIG1vZGVsLnVuc2VsZWN0ZWRPbkluaXQgPSB0cnVlO1xuICAvLyAgIH1cblxuICAvLyAgIHJldHVybiBtb2RlbDtcbiAgLy8gfTtcblxuICAvLyB2YXIgdHJhbnNmb3JtU2VsZWN0ID0gZnVuY3Rpb24oJHNlbGVjdCl7XG4gIC8vICAgJHNlbGVjdC5hZGRDbGFzcyhcImhpZGVcIik7XG5cbiAgLy8gICB2YXIgJHBhcmVudCA9ICRzZWxlY3QucGFyZW50KCksXG4gIC8vICAgICAgIG1vZGVsID0gZ2V0U2VsZWN0TW9kZWwoJHNlbGVjdCk7XG5cbiAgLy8gICAkc2VsZWN0LmFmdGVyKHRlbXBsYXRlKG1vZGVsKSk7XG4gIC8vICAgJHNlbGVjdC5yZW1vdmUoKTtcblxuICAvLyAgIHZhciAkbmV3U2VsZWN0ID0gJHBhcmVudC5maW5kKFwiLlwiICsgbW9kZWwuY3NzQ2xhc3MucmVwbGFjZSgvIC9nLCAnLicpKSxcbiAgLy8gICAgICAgJGxhYmVsID0gJG5ld1NlbGVjdC5maW5kKFwiLnNlbGVjdC1sYWJlbFwiKTtcblxuICAvLyAgICRsYWJlbC50ZXh0KG1vZGVsLnNlbGVjdGVkVmFsdWUpO1xuICAvLyAgICRuZXdTZWxlY3QucmVtb3ZlQ2xhc3MoXCJoaWRlXCIpO1xuXG4gIC8vICAgcmV0dXJuICRuZXdTZWxlY3Q7XG4gIC8vIH07XG5cbiAgLy8gdmFyIHNlbGVjdCA9IHtcblxuICAvLyAgIGdldDogZnVuY3Rpb24oJHNlbGVjdCl7XG4gIC8vICAgICByZXR1cm4gJHNlbGVjdC5maW5kKFwic2VsZWN0XCIpLnZhbCgpO1xuICAvLyAgIH0sXG5cbiAgLy8gICBoaWRlOiBmdW5jdGlvbigkc2VsZWN0LCB2YWx1ZXMpe1xuICAvLyAgICAgaWYoIV8uaXNBcnJheSh2YWx1ZXMpKXtcbiAgLy8gICAgICAgdmFsdWVzID0gW3ZhbHVlc107XG4gIC8vICAgICB9XG5cbiAgLy8gICAgIF8uZm9yRWFjaCh2YWx1ZXMsIGZ1bmN0aW9uKHZhbHVlKXtcbiAgLy8gICAgICAgdmFyIG9wdGlvblRvSGlkZSA9ICRzZWxlY3QuZmluZChcIm9wdGlvblt2YWx1ZT0nXCIgKyB2YWx1ZSArIFwiJ11cIik7XG4gIC8vICAgICAgIGlmKG9wdGlvblRvSGlkZS5sZW5ndGggPiAwKXtcbiAgLy8gICAgICAgICBvcHRpb25Ub0hpZGUucmVtb3ZlKCk7XG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH0pO1xuICAvLyAgIH0sXG5cbiAgLy8gICBpbmZvOiBmdW5jdGlvbigkc2VsZWN0KXtcbiAgLy8gICAgIHJldHVybiB7XG4gIC8vICAgICAgIHVuc2VsZWN0ZWRPbkluaXQ6ICRzZWxlY3QuaGFzQ2xhc3MoXCJ1bnNlbGVjdGVkLW9uLWluaXRcIilcbiAgLy8gICAgIH07XG4gIC8vICAgfSxcblxuICAvLyAgIGluaXQ6IGZ1bmN0aW9uKCRzZWxlY3Qpe1xuICAvLyAgICAgdmFyICRuZXdTZWxlY3QgPSB0cmFuc2Zvcm1TZWxlY3QoJHNlbGVjdCksXG4gIC8vICAgICAgICAgJGxhYmVsID0gJG5ld1NlbGVjdC5maW5kKFwiLnNlbGVjdC1sYWJlbFwiKSxcbiAgLy8gICAgICAgICBwcmV2aW91c1ZhbHVlID0gJG5ld1NlbGVjdC5maW5kKFwic2VsZWN0XCIpLnZhbCgpO1xuXG4gIC8vICAgICB2YXIgcmVmcmVzaCA9IGZ1bmN0aW9uKCRzZWxlY3QsIGNoZWNrSWZDaGFuZ2VkKXtcbiAgLy8gICAgICAgdmFyIHNlbGVjdGVkVmFsdWUgPSAkc2VsZWN0LnZhbCgpLFxuICAvLyAgICAgICAgICAgJHNlbGVjdGVkT3B0aW9uID0gJHNlbGVjdC5maW5kKFwib3B0aW9uW3ZhbHVlPSdcIiArIHNlbGVjdGVkVmFsdWUgKyBcIiddXCIpLFxuICAvLyAgICAgICAgICAgc2VsZWN0ZWREaXNwbGF5VmFsdWUgPSAkc2VsZWN0ZWRPcHRpb24udGV4dCgpO1xuXG4gIC8vICAgICAgIGlmKCFjaGVja0lmQ2hhbmdlZCB8fCBwcmV2aW91c1ZhbHVlICE9PSBzZWxlY3RlZFZhbHVlKXtcbiAgLy8gICAgICAgICAkbGFiZWwudGV4dChzZWxlY3RlZERpc3BsYXlWYWx1ZSk7XG4gIC8vICAgICAgICAgcHJldmlvdXNWYWx1ZSA9IHNlbGVjdGVkVmFsdWU7XG4gIC8vICAgICAgICAgT1QuRXZlbnRzLmZpcmUoXCJzZWxlY3Q6Y2hhbmdlXCIsIHsgc2VuZGVyOiAkc2VsZWN0LnBhcmVudCgpIH0pO1xuICAvLyAgICAgICB9XG4gIC8vICAgICB9O1xuXG4gIC8vICAgICAkbmV3U2VsZWN0LmZpbmQoJ3NlbGVjdCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpe1xuICAvLyAgICAgICByZXR1cm4gcmVmcmVzaCgkKHRoaXMpKTtcbiAgLy8gICAgIH0pLm9uKCdrZXl1cCcsIGZ1bmN0aW9uKCl7XG4gIC8vICAgICAgIHJldHVybiByZWZyZXNoKCQodGhpcyksIHRydWUpO1xuICAvLyAgICAgfSk7XG5cbiAgLy8gICAgIHJldHVybiAkbmV3U2VsZWN0O1xuICAvLyAgIH0sXG5cbiAgLy8gICBzZWxlY3Q6IGZ1bmN0aW9uKCRzZWxlY3QsIHZhbHVlKXtcbiAgLy8gICAgIHZhciAkc2VsZWN0ZWRPcHRpb24gPSAkc2VsZWN0LmZpbmQoXCJvcHRpb25bdmFsdWU9J1wiICsgdmFsdWUgKyBcIiddXCIpLFxuICAvLyAgICAgICAgICRsYWJlbCA9ICRzZWxlY3QuZmluZChcIi5zZWxlY3QtbGFiZWxcIik7XG5cbiAgLy8gICAgICRzZWxlY3QuZmluZChcIm9wdGlvblwiKS5yZW1vdmVBdHRyKFwic2VsZWN0ZWRcIik7XG4gIC8vICAgICAkc2VsZWN0LmZpbmQoXCJzZWxlY3RcIikudmFsKHZhbHVlKTtcbiAgLy8gICAgICRsYWJlbC50ZXh0KCRzZWxlY3RlZE9wdGlvbi50ZXh0KCkpO1xuXG4gIC8vICAgICBPVC5FdmVudHMuZmlyZShcInNlbGVjdDpjaGFuZ2VcIiwgeyBzZW5kZXI6ICRzZWxlY3QgfSk7XG4gIC8vICAgfSxcblxuICAvLyAgIHNob3dBbGw6IGZ1bmN0aW9uKCRzZWxlY3Qpe1xuICAvLyAgICAgdmFyIHNlbGVjdE5hbWUgPSAkc2VsZWN0LmZpbmQoXCJzZWxlY3RcIikuYXR0cihcIm5hbWVcIiksXG4gIC8vICAgICAgICAgaW5pdGlhbE9wdGlvbnMgPSBfZGF0YVtzZWxlY3ROYW1lXSB8fCBbXSxcbiAgLy8gICAgICAgICBuZXdPcHRpb25zID0gXCJcIjtcblxuICAvLyAgICAgZm9yKHZhciBpID0gMDsgaSA8IGluaXRpYWxPcHRpb25zLmxlbmd0aDsgaSsrKXtcbiAgLy8gICAgICAgdmFyIG9wdGlvbiA9IGluaXRpYWxPcHRpb25zW2ldO1xuICAvLyAgICAgICBpZigkc2VsZWN0LmZpbmQoXCJvcHRpb25bdmFsdWU9J1wiICsgb3B0aW9uLnZhbHVlICsgXCInXVwiKS5sZW5ndGggPT09IDApe1xuICAvLyAgICAgICAgIG5ld09wdGlvbnMgKz0gXCI8b3B0aW9uIHZhbHVlPSdcIiArIG9wdGlvbi52YWx1ZSArIFwiJz5cIiArIG9wdGlvbi5kaXNwbGF5ICsgXCI8L29wdGlvbj5cIjtcbiAgLy8gICAgICAgfVxuICAvLyAgICAgfVxuXG4gIC8vICAgICBpZihuZXdPcHRpb25zLmxlbmd0aCA+IDApe1xuICAvLyAgICAgICAkc2VsZWN0LmZpbmQoXCJzZWxlY3RcIikucHJlcGVuZChuZXdPcHRpb25zKTtcbiAgLy8gICAgIH1cbiAgLy8gICB9XG4gIC8vIH07XG5cbiAgLy8gJC5mbi5PVHNlbGVjdCA9IGZ1bmN0aW9uKGFjdGlvbiwgcGFyYW0pe1xuICAvLyAgIGlmKCEhc2VsZWN0W2FjdGlvbl0pe1xuICAvLyAgICAgcmV0dXJuIHNlbGVjdFthY3Rpb25dKHRoaXMsIHBhcmFtKTtcbiAgLy8gICB9XG5cbiAgLy8gICByZXR1cm4gdGhpcztcbiAgLy8gfTtcblxuICAvLyByZXR1cm4ge1xuICAvLyAgIGluaXQ6IHNlbGVjdC5pbml0LFxuICAvLyAgIGdldDogc2VsZWN0LmdldCxcbiAgLy8gICBzZWxlY3Q6IHNlbGVjdC5zZWxlY3RcbiAgLy8gfTtcblxuLy8gfSkoalF1ZXJ5LCBfKTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBvdERlZmF1bHRzOiByZXF1aXJlKCcuL290LWRlZmF1bHRzJyksXG4gIHBpY2tlckxhYmVsOiByZXF1aXJlKCcuL3BpY2tlci1sYWJlbCcpLFxuICBwaWNrZXJTZWxlY3RvcjogcmVxdWlyZSgnLi9waWNrZXItc2VsZWN0b3InKVxufVxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcImJhY2tncm91bmRcIjogXCIjRjdGN0Y3XCIsXG4gIFwiYm94U2l6aW5nXCI6IFwiYm9yZGVyLWJveFwiLFxuICBcImN1cnNvclwiOiBcImRlZmF1bHRcIixcbiAgXCJmb250RmFtaWx5XCI6IFwiXFxcInNvdXJjZS1zYW5zLXByb1xcXCIsXFxcIkhlbHZldGljYSBOZXVlXFxcIixIZWx2ZXRpY2EsQXJpYWwsc2Fucy1zZXJpZlwiLFxuICBcImZvbnRTaXplXCI6IFwiMTZweFwiLFxuICBcImZvbnRTdHlsZVwiOiBcIm5vcm1hbFwiLFxuICBcImZvbnRXZWlnaHRcIjogNDAwLFxuICBcImxpbmVIZWlnaHRcIjogXCIxLjJlbVwiLFxuICBcIm1hcmdpblwiOiAwLFxuICBcInBhZGRpbmdcIjogMCxcbiAgXCJwb3NpdGlvblwiOiBcInJlbGF0aXZlXCJcbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJvdmVyZmxvd1wiOiBcImhpZGRlblwiLFxuICBcIndoaXRlLXNwYWNlXCI6IFwibm93cmFwXCIsXG4gIFwiYm9yZGVyXCI6IFwiMXB4IHNvbGlkIHRyYW5zcGFyZW50XCIsXG4gIFwiZGlzcGxheVwiOiBcImJsb2NrXCIsXG4gIFwicGFkZGluZ1wiOiBcIjAuODEyNXJlbSAxcmVtXCIsXG4gIFwiY29sb3JcIjogXCJibGFja1wiLFxuICBcImhlaWdodFwiOiBcIjNyZW1cIixcbiAgXCJ6LWluZGV4XCI6IDEsXG4gIFwidGV4dC1kZWNvcmF0aW9uXCI6IFwibm9uZVwiLFxuICBcImJhY2tncm91bmRcIjogXCJ0cmFuc3BhcmVudFwiLFxufVxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcImJvcmRlckxlZnRcIjogXCIxcHggc29saWQgcmdiYSgwLDAsMCwuMDgpXCIsXG4gIFwiZmxvYXRcIjogXCJsZWZ0XCIsXG4gIFwiaGVpZ2h0XCI6IFwiMTAwJVwiLFxuICBcIndpZHRoXCI6IFwiMTUlXCJcbn1cbiJdfQ==
