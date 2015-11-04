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

},{"./styles":114,"ramda/src/merge":104,"ramda/src/pick":105,"ramda/src/reduce":106,"ramda/src/values":107}],109:[function(require,module,exports){
var h = require('mercury').h;
var buildStyle = require('../../build-style');
var popUp = require('./pop-up');

var styles = {
  datePicker: buildStyle({
    borderLeft: '1px solid rgba(0,0,0,.08)'
  }, ['pickerSelector']),
  datePickerLink: buildStyle({}, ['pickerLabel'])
};

module.exports = function datePicker(state) {
  return h('div', {
    style: styles.datePicker
  }, [
    h('a', {
      style: styles.datePickerLink
    }, 'Oct 29, 2015'),
    popUp(state)
  ]);
}

// module.exports = {
//   // render: ,
//   // initialState: ,
//   // channels: ,
// }

},{"../../build-style":108,"./pop-up":110,"mercury":3}],110:[function(require,module,exports){
var h = require('mercury').h;

var styles = {
  popUp: {
    width: '22em',
    maxHeight: '22em',
    position: 'absolute',
    left: 'calc(50% - 11rem)',
    borderRadius: '3px',
    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
    padding: '1em',
    boxSizing: 'border-box',
  },
  popUpHeader: {
    boxSizing: 'border-box',
    textAlign: 'center',
    position: 'relative'
  },
  popUpTable: {
    boxSizing: 'border-box',
    textAlign: 'center',
    borderCollapse: 'collapse',
    borderSpacing: 0,
    tableLayout: 'fixed',
    fontSize: 'inherit',
    width: '100%',
    marginTop: '1rem',
  }
};

module.exports = function popUp(state) {
  return h('div', {
    style: styles.popUp
  }, [
    h('div', {
      style: styles.popUpHeader
    }, ['foo']),

    h('table', {
      style: styles.popUpTable
    }, [

      h('thead',
        h('tr', [

        ])
      )
    ])
  ]);
}

},{"mercury":3}],111:[function(require,module,exports){
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

},{"../build-style":108,"mercury":3}],112:[function(require,module,exports){
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

},{"../build-style":108,"./date-picker":109,"./party-size-picker":111,"mercury":3}],113:[function(require,module,exports){
var hg = require('mercury');
var h = hg.h;
var pickerForm = require('./components/picker-form');

function buildInitialViewModel() {
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
    viewModel: hg.struct(buildInitialViewModel()),
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

},{"./components/picker-form":112,"mercury":3}],114:[function(require,module,exports){
module.exports = {
  otDefaults: require('./ot-defaults'),
  otOption: require('./ot-option'),
  otSelect: require('./ot-select'),
  pickerLabel: require('./picker-label'),
  pickerSelector: require('./picker-selector')
}

},{"./ot-defaults":115,"./ot-option":116,"./ot-select":117,"./picker-label":118,"./picker-selector":119}],115:[function(require,module,exports){
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

},{}],116:[function(require,module,exports){
module.exports={
  "display": "block",
  "fontWeight": "normal",
  "minHeight": "1.2em",
  "padding": "0px 2px 1px",
  "whiteSpace": "pre"
}

},{}],117:[function(require,module,exports){
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

},{}],118:[function(require,module,exports){
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

},{}],119:[function(require,module,exports){
module.exports={
  "float": "left",
  "height": "100%",
  "width": "15%"
}

},{}]},{},[113])(113)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1yZXNvbHZlL2VtcHR5LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2RvbS1kZWxlZ2F0b3IvYWRkLWV2ZW50LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2RvbS1kZWxlZ2F0b3IvZG9tLWRlbGVnYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9kb20tZGVsZWdhdG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2RvbS1kZWxlZ2F0b3Ivbm9kZV9tb2R1bGVzL2N1aWQvZGlzdC9icm93c2VyLWN1aWQuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9ub2RlX21vZHVsZXMvZXYtc3RvcmUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9ub2RlX21vZHVsZXMvZXYtc3RvcmUvbm9kZV9tb2R1bGVzL2luZGl2aWR1YWwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9ub2RlX21vZHVsZXMvZXYtc3RvcmUvbm9kZV9tb2R1bGVzL2luZGl2aWR1YWwvb25lLXZlcnNpb24uanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9ub2RlX21vZHVsZXMvZ2xvYmFsL2RvY3VtZW50LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2RvbS1kZWxlZ2F0b3Ivbm9kZV9tb2R1bGVzL2luZGl2aWR1YWwvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9ub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9kb20tZGVsZWdhdG9yL25vZGVfbW9kdWxlcy93ZWFrbWFwLXNoaW0vY3JlYXRlLXN0b3JlLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL2RvbS1kZWxlZ2F0b3Ivbm9kZV9tb2R1bGVzL3dlYWttYXAtc2hpbS9oaWRkZW4tc3RvcmUuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvZG9tLWRlbGVnYXRvci9wcm94eS1ldmVudC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9kb20tZGVsZWdhdG9yL3JlbW92ZS1ldmVudC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9nZXZhbC9ldmVudC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9nZXZhbC9tdWx0aXBsZS5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9nZXZhbC9zaW5nbGUuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvbWFpbi1sb29wL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL21haW4tbG9vcC9ub2RlX21vZHVsZXMvZXJyb3Ivbm9kZV9tb2R1bGVzL2NhbWVsaXplL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL21haW4tbG9vcC9ub2RlX21vZHVsZXMvZXJyb3Ivbm9kZV9tb2R1bGVzL3N0cmluZy10ZW1wbGF0ZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9tYWluLWxvb3Avbm9kZV9tb2R1bGVzL2Vycm9yL3R5cGVkLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL21haW4tbG9vcC9ub2RlX21vZHVsZXMvcmFmL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL21haW4tbG9vcC9ub2RlX21vZHVsZXMvcmFmL25vZGVfbW9kdWxlcy9wZXJmb3JtYW5jZS1ub3cvbGliL3BlcmZvcm1hbmNlLW5vdy5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvYWRkLWxpc3RlbmVyLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL29ic2Vydi1hcnJheS9hcHBseS1wYXRjaC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvYXJyYXktbWV0aG9kcy5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvYXJyYXktcmV2ZXJzZS5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvYXJyYXktc29ydC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LWFycmF5L2xpYi9zZXQtbm9uLWVudW1lcmFibGUuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LWFycmF5L25vZGVfbW9kdWxlcy9hZGlmZi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvcHV0LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL29ic2Vydi1hcnJheS9zZXQuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LWFycmF5L3NwbGljZS5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtYXJyYXkvdHJhbnNhY3Rpb24uanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2LXN0cnVjdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtc3RydWN0L25vZGVfbW9kdWxlcy94dGVuZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYtdmFyaGFzaC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy9vYnNlcnYvY29tcHV0ZWQuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvb2JzZXJ2L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL29ic2Vydi93YXRjaC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92YWx1ZS1ldmVudC9iYXNlLWV2ZW50LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZhbHVlLWV2ZW50L2NoYW5nZS5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92YWx1ZS1ldmVudC9jbGljay5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92YWx1ZS1ldmVudC9ldmVudC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92YWx1ZS1ldmVudC9rZXkuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmFsdWUtZXZlbnQvbm9kZV9tb2R1bGVzL2RvbS13YWxrL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZhbHVlLWV2ZW50L25vZGVfbW9kdWxlcy9mb3JtLWRhdGEtc2V0L2VsZW1lbnQuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmFsdWUtZXZlbnQvbm9kZV9tb2R1bGVzL2Zvcm0tZGF0YS1zZXQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmFsdWUtZXZlbnQvbm9kZV9tb2R1bGVzL3h0ZW5kL2hhcy1rZXlzLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZhbHVlLWV2ZW50L25vZGVfbW9kdWxlcy94dGVuZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92YWx1ZS1ldmVudC9zdWJtaXQuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmFsdWUtZXZlbnQvdmFsdWUuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmRvbS10aHVuay9pbW11dGFibGUtdGh1bmsuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmRvbS10aHVuay9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92ZG9tLXRodW5rL3BhcnRpYWwuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmRvbS10aHVuay9zaGFsbG93LWVxLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL25vZGVfbW9kdWxlcy9icm93c2VyLXNwbGl0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL25vZGVfbW9kdWxlcy9ldi1zdG9yZS9ub2RlX21vZHVsZXMvaW5kaXZpZHVhbC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS9ub2RlX21vZHVsZXMvZ2xvYmFsL2RvY3VtZW50LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL25vZGVfbW9kdWxlcy9pcy1vYmplY3QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vbm9kZV9tb2R1bGVzL3gtaXMtYXJyYXkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdmRvbS9hcHBseS1wcm9wZXJ0aWVzLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zkb20vY3JlYXRlLWVsZW1lbnQuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdmRvbS9kb20taW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdmRvbS9wYXRjaC1vcC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92ZG9tL3BhdGNoLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zkb20vdXBkYXRlLXdpZGdldC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92aXJ0dWFsLWh5cGVyc2NyaXB0L2hvb2tzL2V2LWhvb2suanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdmlydHVhbC1oeXBlcnNjcmlwdC9ob29rcy9zb2Z0LXNldC1ob29rLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3ZpcnR1YWwtaHlwZXJzY3JpcHQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdmlydHVhbC1oeXBlcnNjcmlwdC9wYXJzZS10YWcuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdm5vZGUvaGFuZGxlLXRodW5rLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zub2RlL2lzLXRodW5rLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zub2RlL2lzLXZob29rLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zub2RlL2lzLXZub2RlLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zub2RlL2lzLXZ0ZXh0LmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zub2RlL2lzLXdpZGdldC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92bm9kZS92ZXJzaW9uLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zub2RlL3Zub2RlLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zub2RlL3ZwYXRjaC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92bm9kZS92dGV4dC5qcyIsIm5vZGVfbW9kdWxlcy9tZXJjdXJ5L25vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92dHJlZS9kaWZmLXByb3BzLmpzIiwibm9kZV9tb2R1bGVzL21lcmN1cnkvbm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Z0cmVlL2RpZmYuanMiLCJub2RlX21vZHVsZXMvbWVyY3VyeS9ub2RlX21vZHVsZXMveHRlbmQvbXV0YWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9yYW1kYS9zcmMvYmluZC5qcyIsIm5vZGVfbW9kdWxlcy9yYW1kYS9zcmMvaW50ZXJuYWwvX2FyaXR5LmpzIiwibm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9fY3VycnkxLmpzIiwibm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9fY3VycnkyLmpzIiwibm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9fY3VycnkzLmpzIiwibm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9faGFzLmpzIiwibm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pbnRlcm5hbC9faXNBcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9yYW1kYS9zcmMvaW50ZXJuYWwvX3JlZHVjZS5qcyIsIm5vZGVfbW9kdWxlcy9yYW1kYS9zcmMvaW50ZXJuYWwvX3h3cmFwLmpzIiwibm9kZV9tb2R1bGVzL3JhbWRhL3NyYy9pc0FycmF5TGlrZS5qcyIsIm5vZGVfbW9kdWxlcy9yYW1kYS9zcmMva2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9yYW1kYS9zcmMvbWVyZ2UuanMiLCJub2RlX21vZHVsZXMvcmFtZGEvc3JjL3BpY2suanMiLCJub2RlX21vZHVsZXMvcmFtZGEvc3JjL3JlZHVjZS5qcyIsIm5vZGVfbW9kdWxlcy9yYW1kYS9zcmMvdmFsdWVzLmpzIiwic3JjL2J1aWxkLXN0eWxlLmpzIiwic3JjL2NvbXBvbmVudHMvZGF0ZS1waWNrZXIvaW5kZXguanMiLCJzcmMvY29tcG9uZW50cy9kYXRlLXBpY2tlci9wb3AtdXAuanMiLCJzcmMvY29tcG9uZW50cy9wYXJ0eS1zaXplLXBpY2tlci5qcyIsInNyYy9jb21wb25lbnRzL3BpY2tlci1mb3JtLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL3N0eWxlcy9pbmRleC5qcyIsInNyYy9zdHlsZXMvb3QtZGVmYXVsdHMuanNvbiIsInNyYy9zdHlsZXMvb3Qtb3B0aW9uLmpzb24iLCJzcmMvc3R5bGVzL290LXNlbGVjdC5qc29uIiwic3JjL3N0eWxlcy9waWNrZXItbGFiZWwuanNvbiIsInNyYy9zdHlsZXMvcGlja2VyLXNlbGVjdG9yLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNuVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOWxDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBTaW5nbGVFdmVudCA9IHJlcXVpcmUoJ2dldmFsL3NpbmdsZScpO1xudmFyIE11bHRpcGxlRXZlbnQgPSByZXF1aXJlKCdnZXZhbC9tdWx0aXBsZScpO1xudmFyIGV4dGVuZCA9IHJlcXVpcmUoJ3h0ZW5kJyk7XG5cbi8qXG4gICAgUHJvIHRpcDogRG9uJ3QgcmVxdWlyZSBgbWVyY3VyeWAgaXRzZWxmLlxuICAgICAgcmVxdWlyZSBhbmQgZGVwZW5kIG9uIGFsbCB0aGVzZSBtb2R1bGVzIGRpcmVjdGx5IVxuKi9cbnZhciBtZXJjdXJ5ID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLy8gRW50cnlcbiAgICBtYWluOiByZXF1aXJlKCdtYWluLWxvb3AnKSxcbiAgICBhcHA6IGFwcCxcblxuICAgIC8vIEJhc2VcbiAgICBCYXNlRXZlbnQ6IHJlcXVpcmUoJ3ZhbHVlLWV2ZW50L2Jhc2UtZXZlbnQnKSxcblxuICAgIC8vIElucHV0XG4gICAgRGVsZWdhdG9yOiByZXF1aXJlKCdkb20tZGVsZWdhdG9yJyksXG4gICAgLy8gZGVwcmVjYXRlZDogdXNlIGhnLmNoYW5uZWxzIGluc3RlYWQuXG4gICAgaW5wdXQ6IGlucHV0LFxuICAgIC8vIGRlcHJlY2F0ZWQ6IHVzZSBoZy5jaGFubmVscyBpbnN0ZWFkLlxuICAgIGhhbmRsZXM6IGNoYW5uZWxzLFxuICAgIGNoYW5uZWxzOiBjaGFubmVscyxcbiAgICAvLyBkZXByZWNhdGVkOiB1c2UgaGcuc2VuZCBpbnN0ZWFkLlxuICAgIGV2ZW50OiByZXF1aXJlKCd2YWx1ZS1ldmVudC9ldmVudCcpLFxuICAgIHNlbmQ6IHJlcXVpcmUoJ3ZhbHVlLWV2ZW50L2V2ZW50JyksXG4gICAgLy8gZGVwcmVjYXRlZDogdXNlIGhnLnNlbmRWYWx1ZSBpbnN0ZWFkLlxuICAgIHZhbHVlRXZlbnQ6IHJlcXVpcmUoJ3ZhbHVlLWV2ZW50L3ZhbHVlJyksXG4gICAgc2VuZFZhbHVlOiByZXF1aXJlKCd2YWx1ZS1ldmVudC92YWx1ZScpLFxuICAgIC8vIGRlcHJlY2F0ZWQ6IHVzZSBoZy5zZW5kU3VibWl0IGluc3RlYWQuXG4gICAgc3VibWl0RXZlbnQ6IHJlcXVpcmUoJ3ZhbHVlLWV2ZW50L3N1Ym1pdCcpLFxuICAgIHNlbmRTdWJtaXQ6IHJlcXVpcmUoJ3ZhbHVlLWV2ZW50L3N1Ym1pdCcpLFxuICAgIC8vIGRlcHJlY2F0ZWQ6IHVzZSBoZy5zZW5kQ2hhbmdlIGluc3RlYWQuXG4gICAgY2hhbmdlRXZlbnQ6IHJlcXVpcmUoJ3ZhbHVlLWV2ZW50L2NoYW5nZScpLFxuICAgIHNlbmRDaGFuZ2U6IHJlcXVpcmUoJ3ZhbHVlLWV2ZW50L2NoYW5nZScpLFxuICAgIC8vIGRlcHJlY2F0ZWQ6IHVzZSBoZy5zZW5kS2V5IGluc3RlYWQuXG4gICAga2V5RXZlbnQ6IHJlcXVpcmUoJ3ZhbHVlLWV2ZW50L2tleScpLFxuICAgIHNlbmRLZXk6IHJlcXVpcmUoJ3ZhbHVlLWV2ZW50L2tleScpLFxuICAgIC8vIGRlcHJlY2F0ZWQgdXNlIGhnLnNlbmRDbGljayBpbnN0ZWFkLlxuICAgIGNsaWNrRXZlbnQ6IHJlcXVpcmUoJ3ZhbHVlLWV2ZW50L2NsaWNrJyksXG4gICAgc2VuZENsaWNrOiByZXF1aXJlKCd2YWx1ZS1ldmVudC9jbGljaycpLFxuXG4gICAgLy8gU3RhdGVcbiAgICAvLyByZW1vdmUgZnJvbSBjb3JlOiBmYXZvciBoZy52YXJoYXNoIGluc3RlYWQuXG4gICAgYXJyYXk6IHJlcXVpcmUoJ29ic2Vydi1hcnJheScpLFxuICAgIHN0cnVjdDogcmVxdWlyZSgnb2JzZXJ2LXN0cnVjdCcpLFxuICAgIC8vIGRlcHJlY2F0ZWQ6IHVzZSBoZy5zdHJ1Y3QgaW5zdGVhZC5cbiAgICBoYXNoOiByZXF1aXJlKCdvYnNlcnYtc3RydWN0JyksXG4gICAgdmFyaGFzaDogcmVxdWlyZSgnb2JzZXJ2LXZhcmhhc2gnKSxcbiAgICB2YWx1ZTogcmVxdWlyZSgnb2JzZXJ2JyksXG4gICAgc3RhdGU6IHN0YXRlLFxuXG4gICAgLy8gUmVuZGVyXG4gICAgZGlmZjogcmVxdWlyZSgndmlydHVhbC1kb20vdnRyZWUvZGlmZicpLFxuICAgIHBhdGNoOiByZXF1aXJlKCd2aXJ0dWFsLWRvbS92ZG9tL3BhdGNoJyksXG4gICAgcGFydGlhbDogcmVxdWlyZSgndmRvbS10aHVuaycpLFxuICAgIGNyZWF0ZTogcmVxdWlyZSgndmlydHVhbC1kb20vdmRvbS9jcmVhdGUtZWxlbWVudCcpLFxuICAgIGg6IHJlcXVpcmUoJ3ZpcnR1YWwtZG9tL3ZpcnR1YWwtaHlwZXJzY3JpcHQnKSxcblxuICAgIC8vIFV0aWxpdGllc1xuICAgIC8vIHJlbW92ZSBmcm9tIGNvcmU6IHJlcXVpcmUgY29tcHV0ZWQgZGlyZWN0bHkgaW5zdGVhZC5cbiAgICBjb21wdXRlZDogcmVxdWlyZSgnb2JzZXJ2L2NvbXB1dGVkJyksXG4gICAgLy8gcmVtb3ZlIGZyb20gY29yZTogcmVxdWlyZSB3YXRjaCBkaXJlY3RseSBpbnN0ZWFkLlxuICAgIHdhdGNoOiByZXF1aXJlKCdvYnNlcnYvd2F0Y2gnKVxufTtcblxuZnVuY3Rpb24gaW5wdXQobmFtZXMpIHtcbiAgICBpZiAoIW5hbWVzKSB7XG4gICAgICAgIHJldHVybiBTaW5nbGVFdmVudCgpO1xuICAgIH1cblxuICAgIHJldHVybiBNdWx0aXBsZUV2ZW50KG5hbWVzKTtcbn1cblxuZnVuY3Rpb24gc3RhdGUob2JqKSB7XG4gICAgdmFyIGNvcHkgPSBleHRlbmQob2JqKTtcbiAgICB2YXIgJGNoYW5uZWxzID0gY29weS5jaGFubmVscztcbiAgICB2YXIgJGhhbmRsZXMgPSBjb3B5LmhhbmRsZXM7XG5cbiAgICBpZiAoJGNoYW5uZWxzKSB7XG4gICAgICAgIGNvcHkuY2hhbm5lbHMgPSBtZXJjdXJ5LnZhbHVlKG51bGwpO1xuICAgIH0gZWxzZSBpZiAoJGhhbmRsZXMpIHtcbiAgICAgICAgY29weS5oYW5kbGVzID0gbWVyY3VyeS52YWx1ZShudWxsKTtcbiAgICB9XG5cbiAgICB2YXIgb2JzZXJ2ID0gbWVyY3VyeS5zdHJ1Y3QoY29weSk7XG4gICAgaWYgKCRjaGFubmVscykge1xuICAgICAgICBvYnNlcnYuY2hhbm5lbHMuc2V0KG1lcmN1cnkuY2hhbm5lbHMoJGNoYW5uZWxzLCBvYnNlcnYpKTtcbiAgICB9IGVsc2UgaWYgKCRoYW5kbGVzKSB7XG4gICAgICAgIG9ic2Vydi5oYW5kbGVzLnNldChtZXJjdXJ5LmNoYW5uZWxzKCRoYW5kbGVzLCBvYnNlcnYpKTtcbiAgICB9XG4gICAgcmV0dXJuIG9ic2Vydjtcbn1cblxuZnVuY3Rpb24gY2hhbm5lbHMoZnVuY3MsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoZnVuY3MpLnJlZHVjZShjcmVhdGVIYW5kbGUsIHt9KTtcblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUhhbmRsZShhY2MsIG5hbWUpIHtcbiAgICAgICAgdmFyIGhhbmRsZSA9IG1lcmN1cnkuRGVsZWdhdG9yLmFsbG9jYXRlSGFuZGxlKFxuICAgICAgICAgICAgZnVuY3NbbmFtZV0uYmluZChudWxsLCBjb250ZXh0KSk7XG5cbiAgICAgICAgYWNjW25hbWVdID0gaGFuZGxlO1xuICAgICAgICByZXR1cm4gYWNjO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gYXBwKGVsZW0sIG9ic2VydiwgcmVuZGVyLCBvcHRzKSB7XG4gICAgbWVyY3VyeS5EZWxlZ2F0b3Iob3B0cyk7XG4gICAgdmFyIGxvb3AgPSBtZXJjdXJ5Lm1haW4ob2JzZXJ2KCksIHJlbmRlciwgZXh0ZW5kKHtcbiAgICAgICAgZGlmZjogbWVyY3VyeS5kaWZmLFxuICAgICAgICBjcmVhdGU6IG1lcmN1cnkuY3JlYXRlLFxuICAgICAgICBwYXRjaDogbWVyY3VyeS5wYXRjaFxuICAgIH0sIG9wdHMpKTtcbiAgICBpZiAoZWxlbSkge1xuICAgICAgICBlbGVtLmFwcGVuZENoaWxkKGxvb3AudGFyZ2V0KTtcbiAgICB9XG4gICAgcmV0dXJuIG9ic2Vydihsb29wLnVwZGF0ZSk7XG59XG4iLCJ2YXIgRXZTdG9yZSA9IHJlcXVpcmUoXCJldi1zdG9yZVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFkZEV2ZW50XG5cbmZ1bmN0aW9uIGFkZEV2ZW50KHRhcmdldCwgdHlwZSwgaGFuZGxlcikge1xuICAgIHZhciBldmVudHMgPSBFdlN0b3JlKHRhcmdldClcbiAgICB2YXIgZXZlbnQgPSBldmVudHNbdHlwZV1cblxuICAgIGlmICghZXZlbnQpIHtcbiAgICAgICAgZXZlbnRzW3R5cGVdID0gaGFuZGxlclxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShldmVudCkpIHtcbiAgICAgICAgaWYgKGV2ZW50LmluZGV4T2YoaGFuZGxlcikgPT09IC0xKSB7XG4gICAgICAgICAgICBldmVudC5wdXNoKGhhbmRsZXIpXG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGV2ZW50ICE9PSBoYW5kbGVyKSB7XG4gICAgICAgIGV2ZW50c1t0eXBlXSA9IFtldmVudCwgaGFuZGxlcl1cbiAgICB9XG59XG4iLCJ2YXIgZ2xvYmFsRG9jdW1lbnQgPSByZXF1aXJlKFwiZ2xvYmFsL2RvY3VtZW50XCIpXG52YXIgRXZTdG9yZSA9IHJlcXVpcmUoXCJldi1zdG9yZVwiKVxudmFyIGNyZWF0ZVN0b3JlID0gcmVxdWlyZShcIndlYWttYXAtc2hpbS9jcmVhdGUtc3RvcmVcIilcblxudmFyIGFkZEV2ZW50ID0gcmVxdWlyZShcIi4vYWRkLWV2ZW50LmpzXCIpXG52YXIgcmVtb3ZlRXZlbnQgPSByZXF1aXJlKFwiLi9yZW1vdmUtZXZlbnQuanNcIilcbnZhciBQcm94eUV2ZW50ID0gcmVxdWlyZShcIi4vcHJveHktZXZlbnQuanNcIilcblxudmFyIEhBTkRMRVJfU1RPUkUgPSBjcmVhdGVTdG9yZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gRE9NRGVsZWdhdG9yXG5cbmZ1bmN0aW9uIERPTURlbGVnYXRvcihkb2N1bWVudCkge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBET01EZWxlZ2F0b3IpKSB7XG4gICAgICAgIHJldHVybiBuZXcgRE9NRGVsZWdhdG9yKGRvY3VtZW50KTtcbiAgICB9XG5cbiAgICBkb2N1bWVudCA9IGRvY3VtZW50IHx8IGdsb2JhbERvY3VtZW50XG5cbiAgICB0aGlzLnRhcmdldCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudFxuICAgIHRoaXMuZXZlbnRzID0ge31cbiAgICB0aGlzLnJhd0V2ZW50TGlzdGVuZXJzID0ge31cbiAgICB0aGlzLmdsb2JhbExpc3RlbmVycyA9IHt9XG59XG5cbkRPTURlbGVnYXRvci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGFkZEV2ZW50XG5ET01EZWxlZ2F0b3IucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSByZW1vdmVFdmVudFxuXG5ET01EZWxlZ2F0b3IuYWxsb2NhdGVIYW5kbGUgPVxuICAgIGZ1bmN0aW9uIGFsbG9jYXRlSGFuZGxlKGZ1bmMpIHtcbiAgICAgICAgdmFyIGhhbmRsZSA9IG5ldyBIYW5kbGUoKVxuXG4gICAgICAgIEhBTkRMRVJfU1RPUkUoaGFuZGxlKS5mdW5jID0gZnVuYztcblxuICAgICAgICByZXR1cm4gaGFuZGxlXG4gICAgfVxuXG5ET01EZWxlZ2F0b3IudHJhbnNmb3JtSGFuZGxlID1cbiAgICBmdW5jdGlvbiB0cmFuc2Zvcm1IYW5kbGUoaGFuZGxlLCBicm9hZGNhc3QpIHtcbiAgICAgICAgdmFyIGZ1bmMgPSBIQU5ETEVSX1NUT1JFKGhhbmRsZSkuZnVuY1xuXG4gICAgICAgIHJldHVybiB0aGlzLmFsbG9jYXRlSGFuZGxlKGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgYnJvYWRjYXN0KGV2LCBmdW5jKTtcbiAgICAgICAgfSlcbiAgICB9XG5cbkRPTURlbGVnYXRvci5wcm90b3R5cGUuYWRkR2xvYmFsRXZlbnRMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gYWRkR2xvYmFsRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGZuKSB7XG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLmdsb2JhbExpc3RlbmVyc1tldmVudE5hbWVdIHx8IFtdO1xuICAgICAgICBpZiAobGlzdGVuZXJzLmluZGV4T2YoZm4pID09PSAtMSkge1xuICAgICAgICAgICAgbGlzdGVuZXJzLnB1c2goZm4pXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmdsb2JhbExpc3RlbmVyc1tldmVudE5hbWVdID0gbGlzdGVuZXJzO1xuICAgIH1cblxuRE9NRGVsZWdhdG9yLnByb3RvdHlwZS5yZW1vdmVHbG9iYWxFdmVudExpc3RlbmVyID1cbiAgICBmdW5jdGlvbiByZW1vdmVHbG9iYWxFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZm4pIHtcbiAgICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMuZ2xvYmFsTGlzdGVuZXJzW2V2ZW50TmFtZV0gfHwgW107XG5cbiAgICAgICAgdmFyIGluZGV4ID0gbGlzdGVuZXJzLmluZGV4T2YoZm4pXG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgIH1cbiAgICB9XG5cbkRPTURlbGVnYXRvci5wcm90b3R5cGUubGlzdGVuVG8gPSBmdW5jdGlvbiBsaXN0ZW5UbyhldmVudE5hbWUpIHtcbiAgICBpZiAoIShldmVudE5hbWUgaW4gdGhpcy5ldmVudHMpKSB7XG4gICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0gPSAwO1xuICAgIH1cblxuICAgIHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0rKztcblxuICAgIGlmICh0aGlzLmV2ZW50c1tldmVudE5hbWVdICE9PSAxKSB7XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHZhciBsaXN0ZW5lciA9IHRoaXMucmF3RXZlbnRMaXN0ZW5lcnNbZXZlbnROYW1lXVxuICAgIGlmICghbGlzdGVuZXIpIHtcbiAgICAgICAgbGlzdGVuZXIgPSB0aGlzLnJhd0V2ZW50TGlzdGVuZXJzW2V2ZW50TmFtZV0gPVxuICAgICAgICAgICAgY3JlYXRlSGFuZGxlcihldmVudE5hbWUsIHRoaXMpXG4gICAgfVxuXG4gICAgdGhpcy50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGxpc3RlbmVyLCB0cnVlKVxufVxuXG5ET01EZWxlZ2F0b3IucHJvdG90eXBlLnVubGlzdGVuVG8gPSBmdW5jdGlvbiB1bmxpc3RlblRvKGV2ZW50TmFtZSkge1xuICAgIGlmICghKGV2ZW50TmFtZSBpbiB0aGlzLmV2ZW50cykpIHtcbiAgICAgICAgdGhpcy5ldmVudHNbZXZlbnROYW1lXSA9IDA7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZXZlbnRzW2V2ZW50TmFtZV0gPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYWxyZWFkeSB1bmxpc3RlbmVkIHRvIGV2ZW50LlwiKTtcbiAgICB9XG5cbiAgICB0aGlzLmV2ZW50c1tldmVudE5hbWVdLS07XG5cbiAgICBpZiAodGhpcy5ldmVudHNbZXZlbnROYW1lXSAhPT0gMCkge1xuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLnJhd0V2ZW50TGlzdGVuZXJzW2V2ZW50TmFtZV1cblxuICAgIGlmICghbGlzdGVuZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZG9tLWRlbGVnYXRvciN1bmxpc3RlblRvOiBjYW5ub3QgXCIgK1xuICAgICAgICAgICAgXCJ1bmxpc3RlbiB0byBcIiArIGV2ZW50TmFtZSlcbiAgICB9XG5cbiAgICB0aGlzLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgbGlzdGVuZXIsIHRydWUpXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUhhbmRsZXIoZXZlbnROYW1lLCBkZWxlZ2F0b3IpIHtcbiAgICB2YXIgZ2xvYmFsTGlzdGVuZXJzID0gZGVsZWdhdG9yLmdsb2JhbExpc3RlbmVycztcbiAgICB2YXIgZGVsZWdhdG9yVGFyZ2V0ID0gZGVsZWdhdG9yLnRhcmdldDtcblxuICAgIHJldHVybiBoYW5kbGVyXG5cbiAgICBmdW5jdGlvbiBoYW5kbGVyKGV2KSB7XG4gICAgICAgIHZhciBnbG9iYWxIYW5kbGVycyA9IGdsb2JhbExpc3RlbmVyc1tldmVudE5hbWVdIHx8IFtdXG5cbiAgICAgICAgaWYgKGdsb2JhbEhhbmRsZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHZhciBnbG9iYWxFdmVudCA9IG5ldyBQcm94eUV2ZW50KGV2KTtcbiAgICAgICAgICAgIGdsb2JhbEV2ZW50LmN1cnJlbnRUYXJnZXQgPSBkZWxlZ2F0b3JUYXJnZXQ7XG4gICAgICAgICAgICBjYWxsTGlzdGVuZXJzKGdsb2JhbEhhbmRsZXJzLCBnbG9iYWxFdmVudClcbiAgICAgICAgfVxuXG4gICAgICAgIGZpbmRBbmRJbnZva2VMaXN0ZW5lcnMoZXYudGFyZ2V0LCBldiwgZXZlbnROYW1lKVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZmluZEFuZEludm9rZUxpc3RlbmVycyhlbGVtLCBldiwgZXZlbnROYW1lKSB7XG4gICAgdmFyIGxpc3RlbmVyID0gZ2V0TGlzdGVuZXIoZWxlbSwgZXZlbnROYW1lKVxuXG4gICAgaWYgKGxpc3RlbmVyICYmIGxpc3RlbmVyLmhhbmRsZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIGxpc3RlbmVyRXZlbnQgPSBuZXcgUHJveHlFdmVudChldik7XG4gICAgICAgIGxpc3RlbmVyRXZlbnQuY3VycmVudFRhcmdldCA9IGxpc3RlbmVyLmN1cnJlbnRUYXJnZXRcbiAgICAgICAgY2FsbExpc3RlbmVycyhsaXN0ZW5lci5oYW5kbGVycywgbGlzdGVuZXJFdmVudClcblxuICAgICAgICBpZiAobGlzdGVuZXJFdmVudC5fYnViYmxlcykge1xuICAgICAgICAgICAgdmFyIG5leHRUYXJnZXQgPSBsaXN0ZW5lci5jdXJyZW50VGFyZ2V0LnBhcmVudE5vZGVcbiAgICAgICAgICAgIGZpbmRBbmRJbnZva2VMaXN0ZW5lcnMobmV4dFRhcmdldCwgZXYsIGV2ZW50TmFtZSlcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0TGlzdGVuZXIodGFyZ2V0LCB0eXBlKSB7XG4gICAgLy8gdGVybWluYXRlIHJlY3Vyc2lvbiBpZiBwYXJlbnQgaXMgYG51bGxgXG4gICAgaWYgKHRhcmdldCA9PT0gbnVsbCB8fCB0eXBlb2YgdGFyZ2V0ID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgdmFyIGV2ZW50cyA9IEV2U3RvcmUodGFyZ2V0KVxuICAgIC8vIGZldGNoIGxpc3Qgb2YgaGFuZGxlciBmbnMgZm9yIHRoaXMgZXZlbnRcbiAgICB2YXIgaGFuZGxlciA9IGV2ZW50c1t0eXBlXVxuICAgIHZhciBhbGxIYW5kbGVyID0gZXZlbnRzLmV2ZW50XG5cbiAgICBpZiAoIWhhbmRsZXIgJiYgIWFsbEhhbmRsZXIpIHtcbiAgICAgICAgcmV0dXJuIGdldExpc3RlbmVyKHRhcmdldC5wYXJlbnROb2RlLCB0eXBlKVxuICAgIH1cblxuICAgIHZhciBoYW5kbGVycyA9IFtdLmNvbmNhdChoYW5kbGVyIHx8IFtdLCBhbGxIYW5kbGVyIHx8IFtdKVxuICAgIHJldHVybiBuZXcgTGlzdGVuZXIodGFyZ2V0LCBoYW5kbGVycylcbn1cblxuZnVuY3Rpb24gY2FsbExpc3RlbmVycyhoYW5kbGVycywgZXYpIHtcbiAgICBoYW5kbGVycy5mb3JFYWNoKGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBoYW5kbGVyKGV2KVxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBoYW5kbGVyLmhhbmRsZUV2ZW50ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGhhbmRsZXIuaGFuZGxlRXZlbnQoZXYpXG4gICAgICAgIH0gZWxzZSBpZiAoaGFuZGxlci50eXBlID09PSBcImRvbS1kZWxlZ2F0b3ItaGFuZGxlXCIpIHtcbiAgICAgICAgICAgIEhBTkRMRVJfU1RPUkUoaGFuZGxlcikuZnVuYyhldilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImRvbS1kZWxlZ2F0b3I6IHVua25vd24gaGFuZGxlciBcIiArXG4gICAgICAgICAgICAgICAgXCJmb3VuZDogXCIgKyBKU09OLnN0cmluZ2lmeShoYW5kbGVycykpO1xuICAgICAgICB9XG4gICAgfSlcbn1cblxuZnVuY3Rpb24gTGlzdGVuZXIodGFyZ2V0LCBoYW5kbGVycykge1xuICAgIHRoaXMuY3VycmVudFRhcmdldCA9IHRhcmdldFxuICAgIHRoaXMuaGFuZGxlcnMgPSBoYW5kbGVyc1xufVxuXG5mdW5jdGlvbiBIYW5kbGUoKSB7XG4gICAgdGhpcy50eXBlID0gXCJkb20tZGVsZWdhdG9yLWhhbmRsZVwiXG59XG4iLCJ2YXIgSW5kaXZpZHVhbCA9IHJlcXVpcmUoXCJpbmRpdmlkdWFsXCIpXG52YXIgY3VpZCA9IHJlcXVpcmUoXCJjdWlkXCIpXG52YXIgZ2xvYmFsRG9jdW1lbnQgPSByZXF1aXJlKFwiZ2xvYmFsL2RvY3VtZW50XCIpXG5cbnZhciBET01EZWxlZ2F0b3IgPSByZXF1aXJlKFwiLi9kb20tZGVsZWdhdG9yLmpzXCIpXG5cbnZhciB2ZXJzaW9uS2V5ID0gXCIxM1wiXG52YXIgY2FjaGVLZXkgPSBcIl9fRE9NX0RFTEVHQVRPUl9DQUNIRUBcIiArIHZlcnNpb25LZXlcbnZhciBjYWNoZVRva2VuS2V5ID0gXCJfX0RPTV9ERUxFR0FUT1JfQ0FDSEVfVE9LRU5AXCIgKyB2ZXJzaW9uS2V5XG52YXIgZGVsZWdhdG9yQ2FjaGUgPSBJbmRpdmlkdWFsKGNhY2hlS2V5LCB7XG4gICAgZGVsZWdhdG9yczoge31cbn0pXG52YXIgY29tbW9uRXZlbnRzID0gW1xuICAgIFwiYmx1clwiLCBcImNoYW5nZVwiLCBcImNsaWNrXCIsICBcImNvbnRleHRtZW51XCIsIFwiZGJsY2xpY2tcIixcbiAgICBcImVycm9yXCIsXCJmb2N1c1wiLCBcImZvY3VzaW5cIiwgXCJmb2N1c291dFwiLCBcImlucHV0XCIsIFwia2V5ZG93blwiLFxuICAgIFwia2V5cHJlc3NcIiwgXCJrZXl1cFwiLCBcImxvYWRcIiwgXCJtb3VzZWRvd25cIiwgXCJtb3VzZXVwXCIsXG4gICAgXCJyZXNpemVcIiwgXCJzZWxlY3RcIiwgXCJzdWJtaXRcIiwgXCJ0b3VjaGNhbmNlbFwiLFxuICAgIFwidG91Y2hlbmRcIiwgXCJ0b3VjaHN0YXJ0XCIsIFwidW5sb2FkXCJcbl1cblxuLyogIERlbGVnYXRvciBpcyBhIHRoaW4gd3JhcHBlciBhcm91bmQgYSBzaW5nbGV0b24gYERPTURlbGVnYXRvcmBcbiAgICAgICAgaW5zdGFuY2UuXG5cbiAgICBPbmx5IG9uZSBET01EZWxlZ2F0b3Igc2hvdWxkIGV4aXN0IGJlY2F1c2Ugd2UgZG8gbm90IHdhbnRcbiAgICAgICAgZHVwbGljYXRlIGV2ZW50IGxpc3RlbmVycyBib3VuZCB0byB0aGUgRE9NLlxuXG4gICAgYERlbGVnYXRvcmAgd2lsbCBhbHNvIGBsaXN0ZW5UbygpYCBhbGwgZXZlbnRzIHVubGVzc1xuICAgICAgICBldmVyeSBjYWxsZXIgb3B0cyBvdXQgb2YgaXRcbiovXG5tb2R1bGUuZXhwb3J0cyA9IERlbGVnYXRvclxuXG5mdW5jdGlvbiBEZWxlZ2F0b3Iob3B0cykge1xuICAgIG9wdHMgPSBvcHRzIHx8IHt9XG4gICAgdmFyIGRvY3VtZW50ID0gb3B0cy5kb2N1bWVudCB8fCBnbG9iYWxEb2N1bWVudFxuXG4gICAgdmFyIGNhY2hlS2V5ID0gZG9jdW1lbnRbY2FjaGVUb2tlbktleV1cblxuICAgIGlmICghY2FjaGVLZXkpIHtcbiAgICAgICAgY2FjaGVLZXkgPVxuICAgICAgICAgICAgZG9jdW1lbnRbY2FjaGVUb2tlbktleV0gPSBjdWlkKClcbiAgICB9XG5cbiAgICB2YXIgZGVsZWdhdG9yID0gZGVsZWdhdG9yQ2FjaGUuZGVsZWdhdG9yc1tjYWNoZUtleV1cblxuICAgIGlmICghZGVsZWdhdG9yKSB7XG4gICAgICAgIGRlbGVnYXRvciA9IGRlbGVnYXRvckNhY2hlLmRlbGVnYXRvcnNbY2FjaGVLZXldID1cbiAgICAgICAgICAgIG5ldyBET01EZWxlZ2F0b3IoZG9jdW1lbnQpXG4gICAgfVxuXG4gICAgaWYgKG9wdHMuZGVmYXVsdEV2ZW50cyAhPT0gZmFsc2UpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb21tb25FdmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGRlbGVnYXRvci5saXN0ZW5Ubyhjb21tb25FdmVudHNbaV0pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGVsZWdhdG9yXG59XG5cbkRlbGVnYXRvci5hbGxvY2F0ZUhhbmRsZSA9IERPTURlbGVnYXRvci5hbGxvY2F0ZUhhbmRsZTtcbkRlbGVnYXRvci50cmFuc2Zvcm1IYW5kbGUgPSBET01EZWxlZ2F0b3IudHJhbnNmb3JtSGFuZGxlO1xuIiwiLyoqXG4gKiBjdWlkLmpzXG4gKiBDb2xsaXNpb24tcmVzaXN0YW50IFVJRCBnZW5lcmF0b3IgZm9yIGJyb3dzZXJzIGFuZCBub2RlLlxuICogU2VxdWVudGlhbCBmb3IgZmFzdCBkYiBsb29rdXBzIGFuZCByZWNlbmN5IHNvcnRpbmcuXG4gKiBTYWZlIGZvciBlbGVtZW50IElEcyBhbmQgc2VydmVyLXNpZGUgbG9va3Vwcy5cbiAqXG4gKiBFeHRyYWN0ZWQgZnJvbSBDTENUUlxuICpcbiAqIENvcHlyaWdodCAoYykgRXJpYyBFbGxpb3R0IDIwMTJcbiAqIE1JVCBMaWNlbnNlXG4gKi9cblxuLypnbG9iYWwgd2luZG93LCBuYXZpZ2F0b3IsIGRvY3VtZW50LCByZXF1aXJlLCBwcm9jZXNzLCBtb2R1bGUgKi9cbihmdW5jdGlvbiAoYXBwKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgdmFyIG5hbWVzcGFjZSA9ICdjdWlkJyxcbiAgICBjID0gMCxcbiAgICBibG9ja1NpemUgPSA0LFxuICAgIGJhc2UgPSAzNixcbiAgICBkaXNjcmV0ZVZhbHVlcyA9IE1hdGgucG93KGJhc2UsIGJsb2NrU2l6ZSksXG5cbiAgICBwYWQgPSBmdW5jdGlvbiBwYWQobnVtLCBzaXplKSB7XG4gICAgICB2YXIgcyA9IFwiMDAwMDAwMDAwXCIgKyBudW07XG4gICAgICByZXR1cm4gcy5zdWJzdHIocy5sZW5ndGgtc2l6ZSk7XG4gICAgfSxcblxuICAgIHJhbmRvbUJsb2NrID0gZnVuY3Rpb24gcmFuZG9tQmxvY2soKSB7XG4gICAgICByZXR1cm4gcGFkKChNYXRoLnJhbmRvbSgpICpcbiAgICAgICAgICAgIGRpc2NyZXRlVmFsdWVzIDw8IDApXG4gICAgICAgICAgICAudG9TdHJpbmcoYmFzZSksIGJsb2NrU2l6ZSk7XG4gICAgfSxcblxuICAgIHNhZmVDb3VudGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgYyA9IChjIDwgZGlzY3JldGVWYWx1ZXMpID8gYyA6IDA7XG4gICAgICBjKys7IC8vIHRoaXMgaXMgbm90IHN1YmxpbWluYWxcbiAgICAgIHJldHVybiBjIC0gMTtcbiAgICB9LFxuXG4gICAgYXBpID0gZnVuY3Rpb24gY3VpZCgpIHtcbiAgICAgIC8vIFN0YXJ0aW5nIHdpdGggYSBsb3dlcmNhc2UgbGV0dGVyIG1ha2VzXG4gICAgICAvLyBpdCBIVE1MIGVsZW1lbnQgSUQgZnJpZW5kbHkuXG4gICAgICB2YXIgbGV0dGVyID0gJ2MnLCAvLyBoYXJkLWNvZGVkIGFsbG93cyBmb3Igc2VxdWVudGlhbCBhY2Nlc3NcblxuICAgICAgICAvLyB0aW1lc3RhbXBcbiAgICAgICAgLy8gd2FybmluZzogdGhpcyBleHBvc2VzIHRoZSBleGFjdCBkYXRlIGFuZCB0aW1lXG4gICAgICAgIC8vIHRoYXQgdGhlIHVpZCB3YXMgY3JlYXRlZC5cbiAgICAgICAgdGltZXN0YW1wID0gKG5ldyBEYXRlKCkuZ2V0VGltZSgpKS50b1N0cmluZyhiYXNlKSxcblxuICAgICAgICAvLyBQcmV2ZW50IHNhbWUtbWFjaGluZSBjb2xsaXNpb25zLlxuICAgICAgICBjb3VudGVyLFxuXG4gICAgICAgIC8vIEEgZmV3IGNoYXJzIHRvIGdlbmVyYXRlIGRpc3RpbmN0IGlkcyBmb3IgZGlmZmVyZW50XG4gICAgICAgIC8vIGNsaWVudHMgKHNvIGRpZmZlcmVudCBjb21wdXRlcnMgYXJlIGZhciBsZXNzXG4gICAgICAgIC8vIGxpa2VseSB0byBnZW5lcmF0ZSB0aGUgc2FtZSBpZClcbiAgICAgICAgZmluZ2VycHJpbnQgPSBhcGkuZmluZ2VycHJpbnQoKSxcblxuICAgICAgICAvLyBHcmFiIHNvbWUgbW9yZSBjaGFycyBmcm9tIE1hdGgucmFuZG9tKClcbiAgICAgICAgcmFuZG9tID0gcmFuZG9tQmxvY2soKSArIHJhbmRvbUJsb2NrKCk7XG5cbiAgICAgICAgY291bnRlciA9IHBhZChzYWZlQ291bnRlcigpLnRvU3RyaW5nKGJhc2UpLCBibG9ja1NpemUpO1xuXG4gICAgICByZXR1cm4gIChsZXR0ZXIgKyB0aW1lc3RhbXAgKyBjb3VudGVyICsgZmluZ2VycHJpbnQgKyByYW5kb20pO1xuICAgIH07XG5cbiAgYXBpLnNsdWcgPSBmdW5jdGlvbiBzbHVnKCkge1xuICAgIHZhciBkYXRlID0gbmV3IERhdGUoKS5nZXRUaW1lKCkudG9TdHJpbmcoMzYpLFxuICAgICAgY291bnRlcixcbiAgICAgIHByaW50ID0gYXBpLmZpbmdlcnByaW50KCkuc2xpY2UoMCwxKSArXG4gICAgICAgIGFwaS5maW5nZXJwcmludCgpLnNsaWNlKC0xKSxcbiAgICAgIHJhbmRvbSA9IHJhbmRvbUJsb2NrKCkuc2xpY2UoLTIpO1xuXG4gICAgICBjb3VudGVyID0gc2FmZUNvdW50ZXIoKS50b1N0cmluZygzNikuc2xpY2UoLTQpO1xuXG4gICAgcmV0dXJuIGRhdGUuc2xpY2UoLTIpICtcbiAgICAgIGNvdW50ZXIgKyBwcmludCArIHJhbmRvbTtcbiAgfTtcblxuICBhcGkuZ2xvYmFsQ291bnQgPSBmdW5jdGlvbiBnbG9iYWxDb3VudCgpIHtcbiAgICAvLyBXZSB3YW50IHRvIGNhY2hlIHRoZSByZXN1bHRzIG9mIHRoaXNcbiAgICB2YXIgY2FjaGUgPSAoZnVuY3Rpb24gY2FsYygpIHtcbiAgICAgICAgdmFyIGksXG4gICAgICAgICAgY291bnQgPSAwO1xuXG4gICAgICAgIGZvciAoaSBpbiB3aW5kb3cpIHtcbiAgICAgICAgICBjb3VudCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvdW50O1xuICAgICAgfSgpKTtcblxuICAgIGFwaS5nbG9iYWxDb3VudCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGNhY2hlOyB9O1xuICAgIHJldHVybiBjYWNoZTtcbiAgfTtcblxuICBhcGkuZmluZ2VycHJpbnQgPSBmdW5jdGlvbiBicm93c2VyUHJpbnQoKSB7XG4gICAgcmV0dXJuIHBhZCgobmF2aWdhdG9yLm1pbWVUeXBlcy5sZW5ndGggK1xuICAgICAgbmF2aWdhdG9yLnVzZXJBZ2VudC5sZW5ndGgpLnRvU3RyaW5nKDM2KSArXG4gICAgICBhcGkuZ2xvYmFsQ291bnQoKS50b1N0cmluZygzNiksIDQpO1xuICB9O1xuXG4gIC8vIGRvbid0IGNoYW5nZSBhbnl0aGluZyBmcm9tIGhlcmUgZG93bi5cbiAgaWYgKGFwcC5yZWdpc3Rlcikge1xuICAgIGFwcC5yZWdpc3RlcihuYW1lc3BhY2UsIGFwaSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGFwaTtcbiAgfSBlbHNlIHtcbiAgICBhcHBbbmFtZXNwYWNlXSA9IGFwaTtcbiAgfVxuXG59KHRoaXMuYXBwbGl0dWRlIHx8IHRoaXMpKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIE9uZVZlcnNpb25Db25zdHJhaW50ID0gcmVxdWlyZSgnaW5kaXZpZHVhbC9vbmUtdmVyc2lvbicpO1xuXG52YXIgTVlfVkVSU0lPTiA9ICc3Jztcbk9uZVZlcnNpb25Db25zdHJhaW50KCdldi1zdG9yZScsIE1ZX1ZFUlNJT04pO1xuXG52YXIgaGFzaEtleSA9ICdfX0VWX1NUT1JFX0tFWUAnICsgTVlfVkVSU0lPTjtcblxubW9kdWxlLmV4cG9ydHMgPSBFdlN0b3JlO1xuXG5mdW5jdGlvbiBFdlN0b3JlKGVsZW0pIHtcbiAgICB2YXIgaGFzaCA9IGVsZW1baGFzaEtleV07XG5cbiAgICBpZiAoIWhhc2gpIHtcbiAgICAgICAgaGFzaCA9IGVsZW1baGFzaEtleV0gPSB7fTtcbiAgICB9XG5cbiAgICByZXR1cm4gaGFzaDtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLypnbG9iYWwgd2luZG93LCBnbG9iYWwqL1xuXG52YXIgcm9vdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID9cbiAgICB3aW5kb3cgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/XG4gICAgZ2xvYmFsIDoge307XG5cbm1vZHVsZS5leHBvcnRzID0gSW5kaXZpZHVhbDtcblxuZnVuY3Rpb24gSW5kaXZpZHVhbChrZXksIHZhbHVlKSB7XG4gICAgaWYgKGtleSBpbiByb290KSB7XG4gICAgICAgIHJldHVybiByb290W2tleV07XG4gICAgfVxuXG4gICAgcm9vdFtrZXldID0gdmFsdWU7XG5cbiAgICByZXR1cm4gdmFsdWU7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBJbmRpdmlkdWFsID0gcmVxdWlyZSgnLi9pbmRleC5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9uZVZlcnNpb247XG5cbmZ1bmN0aW9uIE9uZVZlcnNpb24obW9kdWxlTmFtZSwgdmVyc2lvbiwgZGVmYXVsdFZhbHVlKSB7XG4gICAgdmFyIGtleSA9ICdfX0lORElWSURVQUxfT05FX1ZFUlNJT05fJyArIG1vZHVsZU5hbWU7XG4gICAgdmFyIGVuZm9yY2VLZXkgPSBrZXkgKyAnX0VORk9SQ0VfU0lOR0xFVE9OJztcblxuICAgIHZhciB2ZXJzaW9uVmFsdWUgPSBJbmRpdmlkdWFsKGVuZm9yY2VLZXksIHZlcnNpb24pO1xuXG4gICAgaWYgKHZlcnNpb25WYWx1ZSAhPT0gdmVyc2lvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBvbmx5IGhhdmUgb25lIGNvcHkgb2YgJyArXG4gICAgICAgICAgICBtb2R1bGVOYW1lICsgJy5cXG4nICtcbiAgICAgICAgICAgICdZb3UgYWxyZWFkeSBoYXZlIHZlcnNpb24gJyArIHZlcnNpb25WYWx1ZSArXG4gICAgICAgICAgICAnIGluc3RhbGxlZC5cXG4nICtcbiAgICAgICAgICAgICdUaGlzIG1lYW5zIHlvdSBjYW5ub3QgaW5zdGFsbCB2ZXJzaW9uICcgKyB2ZXJzaW9uKTtcbiAgICB9XG5cbiAgICByZXR1cm4gSW5kaXZpZHVhbChrZXksIGRlZmF1bHRWYWx1ZSk7XG59XG4iLCJ2YXIgdG9wTGV2ZWwgPSB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6XG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB7fVxudmFyIG1pbkRvYyA9IHJlcXVpcmUoJ21pbi1kb2N1bWVudCcpO1xuXG5pZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZG9jdW1lbnQ7XG59IGVsc2Uge1xuICAgIHZhciBkb2NjeSA9IHRvcExldmVsWydfX0dMT0JBTF9ET0NVTUVOVF9DQUNIRUA0J107XG5cbiAgICBpZiAoIWRvY2N5KSB7XG4gICAgICAgIGRvY2N5ID0gdG9wTGV2ZWxbJ19fR0xPQkFMX0RPQ1VNRU5UX0NBQ0hFQDQnXSA9IG1pbkRvYztcbiAgICB9XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGRvY2N5O1xufVxuIiwidmFyIHJvb3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/XG4gICAgd2luZG93IDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgP1xuICAgIGdsb2JhbCA6IHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEluZGl2aWR1YWxcblxuZnVuY3Rpb24gSW5kaXZpZHVhbChrZXksIHZhbHVlKSB7XG4gICAgaWYgKHJvb3Rba2V5XSkge1xuICAgICAgICByZXR1cm4gcm9vdFtrZXldXG4gICAgfVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHJvb3QsIGtleSwge1xuICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgLCBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KVxuXG4gICAgcmV0dXJuIHZhbHVlXG59XG4iLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsInZhciBoaWRkZW5TdG9yZSA9IHJlcXVpcmUoJy4vaGlkZGVuLXN0b3JlLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlU3RvcmU7XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0b3JlKCkge1xuICAgIHZhciBrZXkgPSB7fTtcblxuICAgIHJldHVybiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIGlmICgodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcgfHwgb2JqID09PSBudWxsKSAmJlxuICAgICAgICAgICAgdHlwZW9mIG9iaiAhPT0gJ2Z1bmN0aW9uJ1xuICAgICAgICApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignV2Vha21hcC1zaGltOiBLZXkgbXVzdCBiZSBvYmplY3QnKVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHN0b3JlID0gb2JqLnZhbHVlT2Yoa2V5KTtcbiAgICAgICAgcmV0dXJuIHN0b3JlICYmIHN0b3JlLmlkZW50aXR5ID09PSBrZXkgP1xuICAgICAgICAgICAgc3RvcmUgOiBoaWRkZW5TdG9yZShvYmosIGtleSk7XG4gICAgfTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gaGlkZGVuU3RvcmU7XG5cbmZ1bmN0aW9uIGhpZGRlblN0b3JlKG9iaiwga2V5KSB7XG4gICAgdmFyIHN0b3JlID0geyBpZGVudGl0eToga2V5IH07XG4gICAgdmFyIHZhbHVlT2YgPSBvYmoudmFsdWVPZjtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIFwidmFsdWVPZlwiLCB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSAhPT0ga2V5ID9cbiAgICAgICAgICAgICAgICB2YWx1ZU9mLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgOiBzdG9yZTtcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9KTtcblxuICAgIHJldHVybiBzdG9yZTtcbn1cbiIsInZhciBpbmhlcml0cyA9IHJlcXVpcmUoXCJpbmhlcml0c1wiKVxuXG52YXIgQUxMX1BST1BTID0gW1xuICAgIFwiYWx0S2V5XCIsIFwiYnViYmxlc1wiLCBcImNhbmNlbGFibGVcIiwgXCJjdHJsS2V5XCIsXG4gICAgXCJldmVudFBoYXNlXCIsIFwibWV0YUtleVwiLCBcInJlbGF0ZWRUYXJnZXRcIiwgXCJzaGlmdEtleVwiLFxuICAgIFwidGFyZ2V0XCIsIFwidGltZVN0YW1wXCIsIFwidHlwZVwiLCBcInZpZXdcIiwgXCJ3aGljaFwiXG5dXG52YXIgS0VZX1BST1BTID0gW1wiY2hhclwiLCBcImNoYXJDb2RlXCIsIFwia2V5XCIsIFwia2V5Q29kZVwiXVxudmFyIE1PVVNFX1BST1BTID0gW1xuICAgIFwiYnV0dG9uXCIsIFwiYnV0dG9uc1wiLCBcImNsaWVudFhcIiwgXCJjbGllbnRZXCIsIFwibGF5ZXJYXCIsXG4gICAgXCJsYXllcllcIiwgXCJvZmZzZXRYXCIsIFwib2Zmc2V0WVwiLCBcInBhZ2VYXCIsIFwicGFnZVlcIixcbiAgICBcInNjcmVlblhcIiwgXCJzY3JlZW5ZXCIsIFwidG9FbGVtZW50XCJcbl1cblxudmFyIHJrZXlFdmVudCA9IC9ea2V5fGlucHV0L1xudmFyIHJtb3VzZUV2ZW50ID0gL14oPzptb3VzZXxwb2ludGVyfGNvbnRleHRtZW51KXxjbGljay9cblxubW9kdWxlLmV4cG9ydHMgPSBQcm94eUV2ZW50XG5cbmZ1bmN0aW9uIFByb3h5RXZlbnQoZXYpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUHJveHlFdmVudCkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eUV2ZW50KGV2KVxuICAgIH1cblxuICAgIGlmIChya2V5RXZlbnQudGVzdChldi50eXBlKSkge1xuICAgICAgICByZXR1cm4gbmV3IEtleUV2ZW50KGV2KVxuICAgIH0gZWxzZSBpZiAocm1vdXNlRXZlbnQudGVzdChldi50eXBlKSkge1xuICAgICAgICByZXR1cm4gbmV3IE1vdXNlRXZlbnQoZXYpXG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBBTExfUFJPUFMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHByb3BLZXkgPSBBTExfUFJPUFNbaV1cbiAgICAgICAgdGhpc1twcm9wS2V5XSA9IGV2W3Byb3BLZXldXG4gICAgfVxuXG4gICAgdGhpcy5fcmF3RXZlbnQgPSBldlxuICAgIHRoaXMuX2J1YmJsZXMgPSBmYWxzZTtcbn1cblxuUHJveHlFdmVudC5wcm90b3R5cGUucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fcmF3RXZlbnQucHJldmVudERlZmF1bHQoKVxufVxuXG5Qcm94eUV2ZW50LnByb3RvdHlwZS5zdGFydFByb3BhZ2F0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX2J1YmJsZXMgPSB0cnVlO1xufVxuXG5mdW5jdGlvbiBNb3VzZUV2ZW50KGV2KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBBTExfUFJPUFMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHByb3BLZXkgPSBBTExfUFJPUFNbaV1cbiAgICAgICAgdGhpc1twcm9wS2V5XSA9IGV2W3Byb3BLZXldXG4gICAgfVxuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBNT1VTRV9QUk9QUy5sZW5ndGg7IGorKykge1xuICAgICAgICB2YXIgbW91c2VQcm9wS2V5ID0gTU9VU0VfUFJPUFNbal1cbiAgICAgICAgdGhpc1ttb3VzZVByb3BLZXldID0gZXZbbW91c2VQcm9wS2V5XVxuICAgIH1cblxuICAgIHRoaXMuX3Jhd0V2ZW50ID0gZXZcbn1cblxuaW5oZXJpdHMoTW91c2VFdmVudCwgUHJveHlFdmVudClcblxuZnVuY3Rpb24gS2V5RXZlbnQoZXYpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IEFMTF9QUk9QUy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcHJvcEtleSA9IEFMTF9QUk9QU1tpXVxuICAgICAgICB0aGlzW3Byb3BLZXldID0gZXZbcHJvcEtleV1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IEtFWV9QUk9QUy5sZW5ndGg7IGorKykge1xuICAgICAgICB2YXIga2V5UHJvcEtleSA9IEtFWV9QUk9QU1tqXVxuICAgICAgICB0aGlzW2tleVByb3BLZXldID0gZXZba2V5UHJvcEtleV1cbiAgICB9XG5cbiAgICB0aGlzLl9yYXdFdmVudCA9IGV2XG59XG5cbmluaGVyaXRzKEtleUV2ZW50LCBQcm94eUV2ZW50KVxuIiwidmFyIEV2U3RvcmUgPSByZXF1aXJlKFwiZXYtc3RvcmVcIilcblxubW9kdWxlLmV4cG9ydHMgPSByZW1vdmVFdmVudFxuXG5mdW5jdGlvbiByZW1vdmVFdmVudCh0YXJnZXQsIHR5cGUsIGhhbmRsZXIpIHtcbiAgICB2YXIgZXZlbnRzID0gRXZTdG9yZSh0YXJnZXQpXG4gICAgdmFyIGV2ZW50ID0gZXZlbnRzW3R5cGVdXG5cbiAgICBpZiAoIWV2ZW50KSB7XG4gICAgICAgIHJldHVyblxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShldmVudCkpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gZXZlbnQuaW5kZXhPZihoYW5kbGVyKVxuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICBldmVudC5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGV2ZW50ID09PSBoYW5kbGVyKSB7XG4gICAgICAgIGV2ZW50c1t0eXBlXSA9IG51bGxcbiAgICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IEV2ZW50XG5cbmZ1bmN0aW9uIEV2ZW50KCkge1xuICAgIHZhciBsaXN0ZW5lcnMgPSBbXVxuXG4gICAgcmV0dXJuIHsgYnJvYWRjYXN0OiBicm9hZGNhc3QsIGxpc3RlbjogZXZlbnQgfVxuXG4gICAgZnVuY3Rpb24gYnJvYWRjYXN0KHZhbHVlKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsaXN0ZW5lcnNbaV0odmFsdWUpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBldmVudChsaXN0ZW5lcikge1xuICAgICAgICBsaXN0ZW5lcnMucHVzaChsaXN0ZW5lcilcblxuICAgICAgICByZXR1cm4gcmVtb3ZlTGlzdGVuZXJcblxuICAgICAgICBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcigpIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IGxpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKVxuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJ2YXIgZXZlbnQgPSByZXF1aXJlKFwiLi9zaW5nbGUuanNcIilcblxubW9kdWxlLmV4cG9ydHMgPSBtdWx0aXBsZVxuXG5mdW5jdGlvbiBtdWx0aXBsZShuYW1lcykge1xuICAgIHJldHVybiBuYW1lcy5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgbmFtZSkge1xuICAgICAgICBhY2NbbmFtZV0gPSBldmVudCgpXG4gICAgICAgIHJldHVybiBhY2NcbiAgICB9LCB7fSlcbn1cbiIsInZhciBFdmVudCA9IHJlcXVpcmUoJy4vZXZlbnQuanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbmdsZVxuXG5mdW5jdGlvbiBTaW5nbGUoKSB7XG4gICAgdmFyIHR1cGxlID0gRXZlbnQoKVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGV2ZW50KHZhbHVlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgcmV0dXJuIHR1cGxlLmxpc3Rlbih2YWx1ZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0dXBsZS5icm9hZGNhc3QodmFsdWUpXG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJ2YXIgcmFmID0gcmVxdWlyZShcInJhZlwiKVxudmFyIFR5cGVkRXJyb3IgPSByZXF1aXJlKFwiZXJyb3IvdHlwZWRcIilcblxudmFyIEludmFsaWRVcGRhdGVJblJlbmRlciA9IFR5cGVkRXJyb3Ioe1xuICAgIHR5cGU6IFwibWFpbi1sb29wLmludmFsaWQudXBkYXRlLmluLXJlbmRlclwiLFxuICAgIG1lc3NhZ2U6IFwibWFpbi1sb29wOiBVbmV4cGVjdGVkIHVwZGF0ZSBvY2N1cnJlZCBpbiBsb29wLlxcblwiICtcbiAgICAgICAgXCJXZSBhcmUgY3VycmVudGx5IHJlbmRlcmluZyBhIHZpZXcsIFwiICtcbiAgICAgICAgICAgIFwieW91IGNhbid0IGNoYW5nZSBzdGF0ZSByaWdodCBub3cuXFxuXCIgK1xuICAgICAgICBcIlRoZSBkaWZmIGlzOiB7c3RyaW5nRGlmZn0uXFxuXCIgK1xuICAgICAgICBcIlNVR0dFU1RFRCBGSVg6IGZpbmQgdGhlIHN0YXRlIG11dGF0aW9uIGluIHlvdXIgdmlldyBcIiArXG4gICAgICAgICAgICBcIm9yIHJlbmRlcmluZyBmdW5jdGlvbiBhbmQgcmVtb3ZlIGl0LlxcblwiICtcbiAgICAgICAgXCJUaGUgdmlldyBzaG91bGQgbm90IGhhdmUgYW55IHNpZGUgZWZmZWN0cy5cXG5cIixcbiAgICBkaWZmOiBudWxsLFxuICAgIHN0cmluZ0RpZmY6IG51bGxcbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gbWFpblxuXG5mdW5jdGlvbiBtYWluKGluaXRpYWxTdGF0ZSwgdmlldywgb3B0cykge1xuICAgIG9wdHMgPSBvcHRzIHx8IHt9XG5cbiAgICB2YXIgY3VycmVudFN0YXRlID0gaW5pdGlhbFN0YXRlXG4gICAgdmFyIGNyZWF0ZSA9IG9wdHMuY3JlYXRlXG4gICAgdmFyIGRpZmYgPSBvcHRzLmRpZmZcbiAgICB2YXIgcGF0Y2ggPSBvcHRzLnBhdGNoXG4gICAgdmFyIHJlZHJhd1NjaGVkdWxlZCA9IGZhbHNlXG5cbiAgICB2YXIgdHJlZSA9IG9wdHMuaW5pdGlhbFRyZWUgfHwgdmlldyhjdXJyZW50U3RhdGUpXG4gICAgdmFyIHRhcmdldCA9IG9wdHMudGFyZ2V0IHx8IGNyZWF0ZSh0cmVlLCBvcHRzKVxuICAgIHZhciBpblJlbmRlcmluZ1RyYW5zYWN0aW9uID0gZmFsc2VcblxuICAgIGN1cnJlbnRTdGF0ZSA9IG51bGxcblxuICAgIHZhciBsb29wID0ge1xuICAgICAgICBzdGF0ZTogaW5pdGlhbFN0YXRlLFxuICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgdXBkYXRlOiB1cGRhdGVcbiAgICB9XG4gICAgcmV0dXJuIGxvb3BcblxuICAgIGZ1bmN0aW9uIHVwZGF0ZShzdGF0ZSkge1xuICAgICAgICBpZiAoaW5SZW5kZXJpbmdUcmFuc2FjdGlvbikge1xuICAgICAgICAgICAgdGhyb3cgSW52YWxpZFVwZGF0ZUluUmVuZGVyKHtcbiAgICAgICAgICAgICAgICBkaWZmOiBzdGF0ZS5fZGlmZixcbiAgICAgICAgICAgICAgICBzdHJpbmdEaWZmOiBKU09OLnN0cmluZ2lmeShzdGF0ZS5fZGlmZilcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY3VycmVudFN0YXRlID09PSBudWxsICYmICFyZWRyYXdTY2hlZHVsZWQpIHtcbiAgICAgICAgICAgIHJlZHJhd1NjaGVkdWxlZCA9IHRydWVcbiAgICAgICAgICAgIHJhZihyZWRyYXcpXG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50U3RhdGUgPSBzdGF0ZVxuICAgICAgICBsb29wLnN0YXRlID0gc3RhdGVcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWRyYXcoKSB7XG4gICAgICAgIHJlZHJhd1NjaGVkdWxlZCA9IGZhbHNlXG4gICAgICAgIGlmIChjdXJyZW50U3RhdGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgaW5SZW5kZXJpbmdUcmFuc2FjdGlvbiA9IHRydWVcbiAgICAgICAgdmFyIG5ld1RyZWUgPSB2aWV3KGN1cnJlbnRTdGF0ZSlcblxuICAgICAgICBpZiAob3B0cy5jcmVhdGVPbmx5KSB7XG4gICAgICAgICAgICBpblJlbmRlcmluZ1RyYW5zYWN0aW9uID0gZmFsc2VcbiAgICAgICAgICAgIGNyZWF0ZShuZXdUcmVlLCBvcHRzKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHBhdGNoZXMgPSBkaWZmKHRyZWUsIG5ld1RyZWUsIG9wdHMpXG4gICAgICAgICAgICBpblJlbmRlcmluZ1RyYW5zYWN0aW9uID0gZmFsc2VcbiAgICAgICAgICAgIHRhcmdldCA9IHBhdGNoKHRhcmdldCwgcGF0Y2hlcywgb3B0cylcbiAgICAgICAgfVxuXG4gICAgICAgIHRyZWUgPSBuZXdUcmVlXG4gICAgICAgIGN1cnJlbnRTdGF0ZSA9IG51bGxcbiAgICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICh0eXBlb2Ygb2JqID09PSAnc3RyaW5nJykgcmV0dXJuIGNhbWVsQ2FzZShvYmopO1xuICAgIHJldHVybiB3YWxrKG9iaik7XG59O1xuXG5mdW5jdGlvbiB3YWxrIChvYmopIHtcbiAgICBpZiAoIW9iaiB8fCB0eXBlb2Ygb2JqICE9PSAnb2JqZWN0JykgcmV0dXJuIG9iajtcbiAgICBpZiAoaXNEYXRlKG9iaikgfHwgaXNSZWdleChvYmopKSByZXR1cm4gb2JqO1xuICAgIGlmIChpc0FycmF5KG9iaikpIHJldHVybiBtYXAob2JqLCB3YWxrKTtcbiAgICByZXR1cm4gcmVkdWNlKG9iamVjdEtleXMob2JqKSwgZnVuY3Rpb24gKGFjYywga2V5KSB7XG4gICAgICAgIHZhciBjYW1lbCA9IGNhbWVsQ2FzZShrZXkpO1xuICAgICAgICBhY2NbY2FtZWxdID0gd2FsayhvYmpba2V5XSk7XG4gICAgICAgIHJldHVybiBhY2M7XG4gICAgfSwge30pO1xufVxuXG5mdW5jdGlvbiBjYW1lbENhc2Uoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9bXy4tXShcXHd8JCkvZywgZnVuY3Rpb24gKF8seCkge1xuICAgICAgICByZXR1cm4geC50b1VwcGVyQ2FzZSgpO1xuICAgIH0pO1xufVxuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbnZhciBpc0RhdGUgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBEYXRlXSc7XG59O1xuXG52YXIgaXNSZWdleCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufTtcblxudmFyIGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgaWYgKGhhcy5jYWxsKG9iaiwga2V5KSkga2V5cy5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiBrZXlzO1xufTtcblxuZnVuY3Rpb24gbWFwICh4cywgZikge1xuICAgIGlmICh4cy5tYXApIHJldHVybiB4cy5tYXAoZik7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmVzLnB1c2goZih4c1tpXSwgaSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiByZWR1Y2UgKHhzLCBmLCBhY2MpIHtcbiAgICBpZiAoeHMucmVkdWNlKSByZXR1cm4geHMucmVkdWNlKGYsIGFjYyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBhY2MgPSBmKGFjYywgeHNbaV0sIGkpO1xuICAgIH1cbiAgICByZXR1cm4gYWNjO1xufVxuIiwidmFyIG5hcmdzID0gL1xceyhbMC05YS16QS1aXSspXFx9L2dcbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlXG5cbmZ1bmN0aW9uIHRlbXBsYXRlKHN0cmluZykge1xuICAgIHZhciBhcmdzXG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMiAmJiB0eXBlb2YgYXJndW1lbnRzWzFdID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIGFyZ3MgPSBhcmd1bWVudHNbMV1cbiAgICB9IGVsc2Uge1xuICAgICAgICBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgfVxuXG4gICAgaWYgKCFhcmdzIHx8ICFhcmdzLmhhc093blByb3BlcnR5KSB7XG4gICAgICAgIGFyZ3MgPSB7fVxuICAgIH1cblxuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZShuYXJncywgZnVuY3Rpb24gcmVwbGFjZUFyZyhtYXRjaCwgaSwgaW5kZXgpIHtcbiAgICAgICAgdmFyIHJlc3VsdFxuXG4gICAgICAgIGlmIChzdHJpbmdbaW5kZXggLSAxXSA9PT0gXCJ7XCIgJiZcbiAgICAgICAgICAgIHN0cmluZ1tpbmRleCArIG1hdGNoLmxlbmd0aF0gPT09IFwifVwiKSB7XG4gICAgICAgICAgICByZXR1cm4gaVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gYXJncy5oYXNPd25Qcm9wZXJ0eShpKSA/IGFyZ3NbaV0gOiBudWxsXG4gICAgICAgICAgICBpZiAocmVzdWx0ID09PSBudWxsIHx8IHJlc3VsdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiXCJcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICB9XG4gICAgfSlcbn1cbiIsInZhciBjYW1lbGl6ZSA9IHJlcXVpcmUoXCJjYW1lbGl6ZVwiKVxudmFyIHRlbXBsYXRlID0gcmVxdWlyZShcInN0cmluZy10ZW1wbGF0ZVwiKVxudmFyIGV4dGVuZCA9IHJlcXVpcmUoXCJ4dGVuZC9tdXRhYmxlXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gVHlwZWRFcnJvclxuXG5mdW5jdGlvbiBUeXBlZEVycm9yKGFyZ3MpIHtcbiAgICBpZiAoIWFyZ3MpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYXJncyBpcyByZXF1aXJlZFwiKTtcbiAgICB9XG4gICAgaWYgKCFhcmdzLnR5cGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYXJncy50eXBlIGlzIHJlcXVpcmVkXCIpO1xuICAgIH1cbiAgICBpZiAoIWFyZ3MubWVzc2FnZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJhcmdzLm1lc3NhZ2UgaXMgcmVxdWlyZWRcIik7XG4gICAgfVxuXG4gICAgdmFyIG1lc3NhZ2UgPSBhcmdzLm1lc3NhZ2VcblxuICAgIGlmIChhcmdzLnR5cGUgJiYgIWFyZ3MubmFtZSkge1xuICAgICAgICB2YXIgZXJyb3JOYW1lID0gY2FtZWxpemUoYXJncy50eXBlKSArIFwiRXJyb3JcIlxuICAgICAgICBhcmdzLm5hbWUgPSBlcnJvck5hbWVbMF0udG9VcHBlckNhc2UoKSArIGVycm9yTmFtZS5zdWJzdHIoMSlcbiAgICB9XG5cbiAgICBleHRlbmQoY3JlYXRlRXJyb3IsIGFyZ3MpO1xuICAgIGNyZWF0ZUVycm9yLl9uYW1lID0gYXJncy5uYW1lO1xuXG4gICAgcmV0dXJuIGNyZWF0ZUVycm9yO1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlRXJyb3Iob3B0cykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gbmV3IEVycm9yKClcblxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocmVzdWx0LCBcInR5cGVcIiwge1xuICAgICAgICAgICAgdmFsdWU6IHJlc3VsdC50eXBlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pXG5cbiAgICAgICAgdmFyIG9wdGlvbnMgPSBleHRlbmQoe30sIGFyZ3MsIG9wdHMpXG5cbiAgICAgICAgZXh0ZW5kKHJlc3VsdCwgb3B0aW9ucylcbiAgICAgICAgcmVzdWx0Lm1lc3NhZ2UgPSB0ZW1wbGF0ZShtZXNzYWdlLCBvcHRpb25zKVxuXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG59XG5cbiIsInZhciBub3cgPSByZXF1aXJlKCdwZXJmb3JtYW5jZS1ub3cnKVxuICAsIGdsb2JhbCA9IHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8ge30gOiB3aW5kb3dcbiAgLCB2ZW5kb3JzID0gWydtb3onLCAnd2Via2l0J11cbiAgLCBzdWZmaXggPSAnQW5pbWF0aW9uRnJhbWUnXG4gICwgcmFmID0gZ2xvYmFsWydyZXF1ZXN0JyArIHN1ZmZpeF1cbiAgLCBjYWYgPSBnbG9iYWxbJ2NhbmNlbCcgKyBzdWZmaXhdIHx8IGdsb2JhbFsnY2FuY2VsUmVxdWVzdCcgKyBzdWZmaXhdXG4gICwgaXNOYXRpdmUgPSB0cnVlXG5cbmZvcih2YXIgaSA9IDA7IGkgPCB2ZW5kb3JzLmxlbmd0aCAmJiAhcmFmOyBpKyspIHtcbiAgcmFmID0gZ2xvYmFsW3ZlbmRvcnNbaV0gKyAnUmVxdWVzdCcgKyBzdWZmaXhdXG4gIGNhZiA9IGdsb2JhbFt2ZW5kb3JzW2ldICsgJ0NhbmNlbCcgKyBzdWZmaXhdXG4gICAgICB8fCBnbG9iYWxbdmVuZG9yc1tpXSArICdDYW5jZWxSZXF1ZXN0JyArIHN1ZmZpeF1cbn1cblxuLy8gU29tZSB2ZXJzaW9ucyBvZiBGRiBoYXZlIHJBRiBidXQgbm90IGNBRlxuaWYoIXJhZiB8fCAhY2FmKSB7XG4gIGlzTmF0aXZlID0gZmFsc2VcblxuICB2YXIgbGFzdCA9IDBcbiAgICAsIGlkID0gMFxuICAgICwgcXVldWUgPSBbXVxuICAgICwgZnJhbWVEdXJhdGlvbiA9IDEwMDAgLyA2MFxuXG4gIHJhZiA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgaWYocXVldWUubGVuZ3RoID09PSAwKSB7XG4gICAgICB2YXIgX25vdyA9IG5vdygpXG4gICAgICAgICwgbmV4dCA9IE1hdGgubWF4KDAsIGZyYW1lRHVyYXRpb24gLSAoX25vdyAtIGxhc3QpKVxuICAgICAgbGFzdCA9IG5leHQgKyBfbm93XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY3AgPSBxdWV1ZS5zbGljZSgwKVxuICAgICAgICAvLyBDbGVhciBxdWV1ZSBoZXJlIHRvIHByZXZlbnRcbiAgICAgICAgLy8gY2FsbGJhY2tzIGZyb20gYXBwZW5kaW5nIGxpc3RlbmVyc1xuICAgICAgICAvLyB0byB0aGUgY3VycmVudCBmcmFtZSdzIHF1ZXVlXG4gICAgICAgIHF1ZXVlLmxlbmd0aCA9IDBcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGNwLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYoIWNwW2ldLmNhbmNlbGxlZCkge1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICBjcFtpXS5jYWxsYmFjayhsYXN0KVxuICAgICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHRocm93IGUgfSwgMClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIE1hdGgucm91bmQobmV4dCkpXG4gICAgfVxuICAgIHF1ZXVlLnB1c2goe1xuICAgICAgaGFuZGxlOiArK2lkLFxuICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgY2FuY2VsbGVkOiBmYWxzZVxuICAgIH0pXG4gICAgcmV0dXJuIGlkXG4gIH1cblxuICBjYWYgPSBmdW5jdGlvbihoYW5kbGUpIHtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgcXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmKHF1ZXVlW2ldLmhhbmRsZSA9PT0gaGFuZGxlKSB7XG4gICAgICAgIHF1ZXVlW2ldLmNhbmNlbGxlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbikge1xuICAvLyBXcmFwIGluIGEgbmV3IGZ1bmN0aW9uIHRvIHByZXZlbnRcbiAgLy8gYGNhbmNlbGAgcG90ZW50aWFsbHkgYmVpbmcgYXNzaWduZWRcbiAgLy8gdG8gdGhlIG5hdGl2ZSByQUYgZnVuY3Rpb25cbiAgaWYoIWlzTmF0aXZlKSB7XG4gICAgcmV0dXJuIHJhZi5jYWxsKGdsb2JhbCwgZm4pXG4gIH1cbiAgcmV0dXJuIHJhZi5jYWxsKGdsb2JhbCwgZnVuY3Rpb24oKSB7XG4gICAgdHJ5e1xuICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgIH0gY2F0Y2goZSkge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgdGhyb3cgZSB9LCAwKVxuICAgIH1cbiAgfSlcbn1cbm1vZHVsZS5leHBvcnRzLmNhbmNlbCA9IGZ1bmN0aW9uKCkge1xuICBjYWYuYXBwbHkoZ2xvYmFsLCBhcmd1bWVudHMpXG59XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuNi4zXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBnZXROYW5vU2Vjb25kcywgaHJ0aW1lLCBsb2FkVGltZTtcblxuICBpZiAoKHR5cGVvZiBwZXJmb3JtYW5jZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwZXJmb3JtYW5jZSAhPT0gbnVsbCkgJiYgcGVyZm9ybWFuY2Uubm93KSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICB9O1xuICB9IGVsc2UgaWYgKCh0eXBlb2YgcHJvY2VzcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwcm9jZXNzICE9PSBudWxsKSAmJiBwcm9jZXNzLmhydGltZSkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKGdldE5hbm9TZWNvbmRzKCkgLSBsb2FkVGltZSkgLyAxZTY7XG4gICAgfTtcbiAgICBocnRpbWUgPSBwcm9jZXNzLmhydGltZTtcbiAgICBnZXROYW5vU2Vjb25kcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGhyO1xuICAgICAgaHIgPSBocnRpbWUoKTtcbiAgICAgIHJldHVybiBoclswXSAqIDFlOSArIGhyWzFdO1xuICAgIH07XG4gICAgbG9hZFRpbWUgPSBnZXROYW5vU2Vjb25kcygpO1xuICB9IGVsc2UgaWYgKERhdGUubm93KSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBEYXRlLm5vdygpIC0gbG9hZFRpbWU7XG4gICAgfTtcbiAgICBsb2FkVGltZSA9IERhdGUubm93KCk7XG4gIH0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIGxvYWRUaW1lO1xuICAgIH07XG4gICAgbG9hZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgfVxuXG59KS5jYWxsKHRoaXMpO1xuXG4vKlxuLy9AIHNvdXJjZU1hcHBpbmdVUkw9cGVyZm9ybWFuY2Utbm93Lm1hcFxuKi9cbiIsInZhciBzZXROb25FbnVtZXJhYmxlID0gcmVxdWlyZShcIi4vbGliL3NldC1ub24tZW51bWVyYWJsZS5qc1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBhZGRMaXN0ZW5lclxuXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcihvYnNlcnZBcnJheSwgb2JzZXJ2KSB7XG4gICAgdmFyIGxpc3QgPSBvYnNlcnZBcnJheS5fbGlzdFxuXG4gICAgcmV0dXJuIG9ic2VydihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIHZhbHVlTGlzdCA9ICBvYnNlcnZBcnJheSgpLnNsaWNlKClcbiAgICAgICAgdmFyIGluZGV4ID0gbGlzdC5pbmRleE9mKG9ic2VydilcblxuICAgICAgICAvLyBUaGlzIGNvZGUgcGF0aCBzaG91bGQgbmV2ZXIgaGl0LiBJZiB0aGlzIGhhcHBlbnNcbiAgICAgICAgLy8gdGhlcmUncyBhIGJ1ZyBpbiB0aGUgY2xlYW51cCBjb2RlXG4gICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gXCJvYnNlcnYtYXJyYXk6IFVucmVtb3ZlZCBvYnNlcnYgbGlzdGVuZXJcIlxuICAgICAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcihtZXNzYWdlKVxuICAgICAgICAgICAgZXJyLmxpc3QgPSBsaXN0XG4gICAgICAgICAgICBlcnIuaW5kZXggPSBpbmRleFxuICAgICAgICAgICAgZXJyLm9ic2VydiA9IG9ic2VydlxuICAgICAgICAgICAgdGhyb3cgZXJyXG4gICAgICAgIH1cblxuICAgICAgICB2YWx1ZUxpc3Quc3BsaWNlKGluZGV4LCAxLCB2YWx1ZSlcbiAgICAgICAgc2V0Tm9uRW51bWVyYWJsZSh2YWx1ZUxpc3QsIFwiX2RpZmZcIiwgWyBbaW5kZXgsIDEsIHZhbHVlXSBdKVxuXG4gICAgICAgIG9ic2VydkFycmF5Ll9vYnNlcnZTZXQodmFsdWVMaXN0KVxuICAgIH0pXG59XG4iLCJ2YXIgYWRkTGlzdGVuZXIgPSByZXF1aXJlKCcuL2FkZC1saXN0ZW5lci5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gYXBwbHlQYXRjaFxuXG5mdW5jdGlvbiBhcHBseVBhdGNoICh2YWx1ZUxpc3QsIGFyZ3MpIHtcbiAgICB2YXIgb2JzID0gdGhpc1xuICAgIHZhciB2YWx1ZUFyZ3MgPSBhcmdzLm1hcCh1bnBhY2spXG5cbiAgICB2YWx1ZUxpc3Quc3BsaWNlLmFwcGx5KHZhbHVlTGlzdCwgdmFsdWVBcmdzKVxuICAgIG9icy5fbGlzdC5zcGxpY2UuYXBwbHkob2JzLl9saXN0LCBhcmdzKVxuXG4gICAgdmFyIGV4dHJhUmVtb3ZlTGlzdGVuZXJzID0gYXJncy5zbGljZSgyKS5tYXAoZnVuY3Rpb24gKG9ic2Vydikge1xuICAgICAgICByZXR1cm4gdHlwZW9mIG9ic2VydiA9PT0gXCJmdW5jdGlvblwiID9cbiAgICAgICAgICAgIGFkZExpc3RlbmVyKG9icywgb2JzZXJ2KSA6XG4gICAgICAgICAgICBudWxsXG4gICAgfSlcblxuICAgIGV4dHJhUmVtb3ZlTGlzdGVuZXJzLnVuc2hpZnQoYXJnc1swXSwgYXJnc1sxXSlcbiAgICB2YXIgcmVtb3ZlZExpc3RlbmVycyA9IG9icy5fcmVtb3ZlTGlzdGVuZXJzLnNwbGljZVxuICAgICAgICAuYXBwbHkob2JzLl9yZW1vdmVMaXN0ZW5lcnMsIGV4dHJhUmVtb3ZlTGlzdGVuZXJzKVxuXG4gICAgcmVtb3ZlZExpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uIChyZW1vdmVPYnNlcnZMaXN0ZW5lcikge1xuICAgICAgICBpZiAocmVtb3ZlT2JzZXJ2TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHJlbW92ZU9ic2Vydkxpc3RlbmVyKClcbiAgICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gdmFsdWVBcmdzXG59XG5cbmZ1bmN0aW9uIHVucGFjayh2YWx1ZSwgaW5kZXgpe1xuICAgIGlmIChpbmRleCA9PT0gMCB8fCBpbmRleCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gdmFsdWVcbiAgICB9XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gdmFsdWUoKSA6IHZhbHVlXG59XG4iLCJ2YXIgT2JzZXJ2QXJyYXkgPSByZXF1aXJlKFwiLi9pbmRleC5qc1wiKVxuXG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2VcblxudmFyIEFSUkFZX01FVEhPRFMgPSBbXG4gICAgXCJjb25jYXRcIiwgXCJzbGljZVwiLCBcImV2ZXJ5XCIsIFwiZmlsdGVyXCIsIFwiZm9yRWFjaFwiLCBcImluZGV4T2ZcIixcbiAgICBcImpvaW5cIiwgXCJsYXN0SW5kZXhPZlwiLCBcIm1hcFwiLCBcInJlZHVjZVwiLCBcInJlZHVjZVJpZ2h0XCIsXG4gICAgXCJzb21lXCIsIFwidG9TdHJpbmdcIiwgXCJ0b0xvY2FsZVN0cmluZ1wiXG5dXG5cbnZhciBtZXRob2RzID0gQVJSQVlfTUVUSE9EUy5tYXAoZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gW25hbWUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHJlcyA9IHRoaXMuX2xpc3RbbmFtZV0uYXBwbHkodGhpcy5fbGlzdCwgYXJndW1lbnRzKVxuXG4gICAgICAgIGlmIChyZXMgJiYgQXJyYXkuaXNBcnJheShyZXMpKSB7XG4gICAgICAgICAgICByZXMgPSBPYnNlcnZBcnJheShyZXMpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzXG4gICAgfV1cbn0pXG5cbm1vZHVsZS5leHBvcnRzID0gQXJyYXlNZXRob2RzXG5cbmZ1bmN0aW9uIEFycmF5TWV0aG9kcyhvYnMpIHtcbiAgICBvYnMucHVzaCA9IG9ic2VydkFycmF5UHVzaFxuICAgIG9icy5wb3AgPSBvYnNlcnZBcnJheVBvcFxuICAgIG9icy5zaGlmdCA9IG9ic2VydkFycmF5U2hpZnRcbiAgICBvYnMudW5zaGlmdCA9IG9ic2VydkFycmF5VW5zaGlmdFxuICAgIG9icy5yZXZlcnNlID0gcmVxdWlyZShcIi4vYXJyYXktcmV2ZXJzZS5qc1wiKVxuICAgIG9icy5zb3J0ID0gcmVxdWlyZShcIi4vYXJyYXktc29ydC5qc1wiKVxuXG4gICAgbWV0aG9kcy5mb3JFYWNoKGZ1bmN0aW9uICh0dXBsZSkge1xuICAgICAgICBvYnNbdHVwbGVbMF1dID0gdHVwbGVbMV1cbiAgICB9KVxuICAgIHJldHVybiBvYnNcbn1cblxuXG5cbmZ1bmN0aW9uIG9ic2VydkFycmF5UHVzaCgpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgIGFyZ3MudW5zaGlmdCh0aGlzLl9saXN0Lmxlbmd0aCwgMClcbiAgICB0aGlzLnNwbGljZS5hcHBseSh0aGlzLCBhcmdzKVxuXG4gICAgcmV0dXJuIHRoaXMuX2xpc3QubGVuZ3RoXG59XG5mdW5jdGlvbiBvYnNlcnZBcnJheVBvcCgpIHtcbiAgICByZXR1cm4gdGhpcy5zcGxpY2UodGhpcy5fbGlzdC5sZW5ndGggLSAxLCAxKVswXVxufVxuZnVuY3Rpb24gb2JzZXJ2QXJyYXlTaGlmdCgpIHtcbiAgICByZXR1cm4gdGhpcy5zcGxpY2UoMCwgMSlbMF1cbn1cbmZ1bmN0aW9uIG9ic2VydkFycmF5VW5zaGlmdCgpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgIGFyZ3MudW5zaGlmdCgwLCAwKVxuICAgIHRoaXMuc3BsaWNlLmFwcGx5KHRoaXMsIGFyZ3MpXG5cbiAgICByZXR1cm4gdGhpcy5fbGlzdC5sZW5ndGhcbn1cblxuXG5mdW5jdGlvbiBub3RJbXBsZW1lbnRlZCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJQdWxsIHJlcXVlc3Qgd2VsY29tZVwiKVxufVxuIiwidmFyIGFwcGx5UGF0Y2ggPSByZXF1aXJlKFwiLi9hcHBseS1wYXRjaC5qc1wiKVxudmFyIHNldE5vbkVudW1lcmFibGUgPSByZXF1aXJlKCcuL2xpYi9zZXQtbm9uLWVudW1lcmFibGUuanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJldmVyc2VcblxuZnVuY3Rpb24gcmV2ZXJzZSgpIHtcbiAgICB2YXIgb2JzID0gdGhpc1xuICAgIHZhciBjaGFuZ2VzID0gZmFrZURpZmYob2JzLl9saXN0LnNsaWNlKCkucmV2ZXJzZSgpKVxuICAgIHZhciB2YWx1ZUxpc3QgPSBvYnMoKS5zbGljZSgpLnJldmVyc2UoKVxuXG4gICAgdmFyIHZhbHVlQ2hhbmdlcyA9IGNoYW5nZXMubWFwKGFwcGx5UGF0Y2guYmluZChvYnMsIHZhbHVlTGlzdCkpXG5cbiAgICBzZXROb25FbnVtZXJhYmxlKHZhbHVlTGlzdCwgXCJfZGlmZlwiLCB2YWx1ZUNoYW5nZXMpXG5cbiAgICBvYnMuX29ic2VydlNldCh2YWx1ZUxpc3QpXG4gICAgcmV0dXJuIGNoYW5nZXNcbn1cblxuZnVuY3Rpb24gZmFrZURpZmYoYXJyKSB7XG4gICAgdmFyIF9kaWZmXG4gICAgdmFyIGxlbiA9IGFyci5sZW5ndGhcblxuICAgIGlmKGxlbiAlIDIpIHtcbiAgICAgICAgdmFyIG1pZFBvaW50ID0gKGxlbiAtMSkgLyAyXG4gICAgICAgIHZhciBhID0gWzAsIG1pZFBvaW50XS5jb25jYXQoYXJyLnNsaWNlKDAsIG1pZFBvaW50KSlcbiAgICAgICAgdmFyIGIgPSBbbWlkUG9pbnQgKzEsIG1pZFBvaW50XS5jb25jYXQoYXJyLnNsaWNlKG1pZFBvaW50ICsxLCBsZW4pKVxuICAgICAgICB2YXIgX2RpZmYgPSBbYSwgYl1cbiAgICB9IGVsc2Uge1xuICAgICAgICBfZGlmZiA9IFsgWzAsIGxlbl0uY29uY2F0KGFycikgXVxuICAgIH1cblxuICAgIHJldHVybiBfZGlmZlxufVxuIiwidmFyIGFwcGx5UGF0Y2ggPSByZXF1aXJlKFwiLi9hcHBseS1wYXRjaC5qc1wiKVxudmFyIHNldE5vbkVudW1lcmFibGUgPSByZXF1aXJlKFwiLi9saWIvc2V0LW5vbi1lbnVtZXJhYmxlLmpzXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gc29ydFxuXG5mdW5jdGlvbiBzb3J0KGNvbXBhcmUpIHtcbiAgICB2YXIgb2JzID0gdGhpc1xuICAgIHZhciBsaXN0ID0gb2JzLl9saXN0LnNsaWNlKClcblxuICAgIHZhciB1bnBhY2tlZCA9IHVucGFjayhsaXN0KVxuXG4gICAgdmFyIHNvcnRlZCA9IHVucGFja2VkXG4gICAgICAgICAgICAubWFwKGZ1bmN0aW9uKGl0KSB7IHJldHVybiBpdC52YWwgfSlcbiAgICAgICAgICAgIC5zb3J0KGNvbXBhcmUpXG5cbiAgICB2YXIgcGFja2VkID0gcmVwYWNrKHNvcnRlZCwgdW5wYWNrZWQpXG5cbiAgICAvL2Zha2UgZGlmZiAtIGZvciBwZXJmXG4gICAgLy9hZGlmZiBvbiAxMGsgaXRlbXMgPT09IH4zMjAwbXNcbiAgICAvL2Zha2Ugb24gMTBrIGl0ZW1zID09PSB+MTEwbXNcbiAgICB2YXIgY2hhbmdlcyA9IFsgWyAwLCBwYWNrZWQubGVuZ3RoIF0uY29uY2F0KHBhY2tlZCkgXVxuXG4gICAgdmFyIHZhbHVlQ2hhbmdlcyA9IGNoYW5nZXMubWFwKGFwcGx5UGF0Y2guYmluZChvYnMsIHNvcnRlZCkpXG5cbiAgICBzZXROb25FbnVtZXJhYmxlKHNvcnRlZCwgXCJfZGlmZlwiLCB2YWx1ZUNoYW5nZXMpXG5cbiAgICBvYnMuX29ic2VydlNldChzb3J0ZWQpXG4gICAgcmV0dXJuIGNoYW5nZXNcbn1cblxuZnVuY3Rpb24gdW5wYWNrKGxpc3QpIHtcbiAgICB2YXIgdW5wYWNrZWQgPSBbXVxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHVucGFja2VkLnB1c2goe1xuICAgICAgICAgICAgdmFsOiAoXCJmdW5jdGlvblwiID09IHR5cGVvZiBsaXN0W2ldKSA/IGxpc3RbaV0oKSA6IGxpc3RbaV0sXG4gICAgICAgICAgICBvYmo6IGxpc3RbaV1cbiAgICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIHVucGFja2VkXG59XG5cbmZ1bmN0aW9uIHJlcGFjayhzb3J0ZWQsIHVucGFja2VkKSB7XG4gICAgdmFyIHBhY2tlZCA9IFtdXG5cbiAgICB3aGlsZShzb3J0ZWQubGVuZ3RoKSB7XG4gICAgICAgIHZhciBzID0gc29ydGVkLnNoaWZ0KClcbiAgICAgICAgdmFyIGluZHggPSBpbmRleE9mKHMsIHVucGFja2VkKVxuICAgICAgICBpZih+aW5keCkgcGFja2VkLnB1c2godW5wYWNrZWQuc3BsaWNlKGluZHgsIDEpWzBdLm9iailcbiAgICB9XG5cbiAgICByZXR1cm4gcGFja2VkXG59XG5cbmZ1bmN0aW9uIGluZGV4T2YobiwgaCkge1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBoLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmKG4gPT09IGhbaV0udmFsKSByZXR1cm4gaVxuICAgIH1cbiAgICByZXR1cm4gLTFcbn1cbiIsInZhciBPYnNlcnYgPSByZXF1aXJlKFwib2JzZXJ2XCIpXG5cbi8vIGNpcmN1bGFyIGRlcCBiZXR3ZWVuIEFycmF5TWV0aG9kcyAmIHRoaXMgZmlsZVxubW9kdWxlLmV4cG9ydHMgPSBPYnNlcnZBcnJheVxuXG52YXIgc3BsaWNlID0gcmVxdWlyZShcIi4vc3BsaWNlLmpzXCIpXG52YXIgcHV0ID0gcmVxdWlyZShcIi4vcHV0LmpzXCIpXG52YXIgc2V0ID0gcmVxdWlyZShcIi4vc2V0LmpzXCIpXG52YXIgdHJhbnNhY3Rpb24gPSByZXF1aXJlKFwiLi90cmFuc2FjdGlvbi5qc1wiKVxudmFyIEFycmF5TWV0aG9kcyA9IHJlcXVpcmUoXCIuL2FycmF5LW1ldGhvZHMuanNcIilcbnZhciBhZGRMaXN0ZW5lciA9IHJlcXVpcmUoXCIuL2FkZC1saXN0ZW5lci5qc1wiKVxuXG5cbi8qICBPYnNlcnZBcnJheSA6PSAoQXJyYXk8VD4pID0+IE9ic2VydjxcbiAgICAgICAgQXJyYXk8VD4gJiB7IF9kaWZmOiBBcnJheSB9XG4gICAgPiAmIHtcbiAgICAgICAgc3BsaWNlOiAoaW5kZXg6IE51bWJlciwgYW1vdW50OiBOdW1iZXIsIHJlc3QuLi46IFQpID0+XG4gICAgICAgICAgICBBcnJheTxUPixcbiAgICAgICAgcHVzaDogKHZhbHVlcy4uLjogVCkgPT4gTnVtYmVyLFxuICAgICAgICBmaWx0ZXI6IChsYW1iZGE6IEZ1bmN0aW9uLCB0aGlzVmFsdWU6IEFueSkgPT4gQXJyYXk8VD4sXG4gICAgICAgIGluZGV4T2Y6IChpdGVtOiBULCBmcm9tSW5kZXg6IE51bWJlcikgPT4gTnVtYmVyXG4gICAgfVxuXG4gICAgRml4IHRvIG1ha2UgaXQgbW9yZSBsaWtlIE9ic2Vydkhhc2guXG5cbiAgICBJLmUuIHlvdSB3cml0ZSBvYnNlcnZhYmxlcyBpbnRvIGl0LlxuICAgICAgICByZWFkaW5nIG1ldGhvZHMgdGFrZSBwbGFpbiBKUyBvYmplY3RzIHRvIHJlYWRcbiAgICAgICAgYW5kIHRoZSB2YWx1ZSBvZiB0aGUgYXJyYXkgaXMgYWx3YXlzIGFuIGFycmF5IG9mIHBsYWluXG4gICAgICAgIG9ianNlY3QuXG5cbiAgICAgICAgVGhlIG9ic2VydiBhcnJheSBpbnN0YW5jZSBpdHNlbGYgd291bGQgaGF2ZSBpbmRleGVkXG4gICAgICAgIHByb3BlcnRpZXMgdGhhdCBhcmUgdGhlIG9ic2VydmFibGVzXG4qL1xuZnVuY3Rpb24gT2JzZXJ2QXJyYXkoaW5pdGlhbExpc3QpIHtcbiAgICAvLyBsaXN0IGlzIHRoZSBpbnRlcm5hbCBtdXRhYmxlIGxpc3Qgb2JzZXJ2IGluc3RhbmNlcyB0aGF0XG4gICAgLy8gYWxsIG1ldGhvZHMgb24gYG9ic2AgZGlzcGF0Y2ggdG8uXG4gICAgdmFyIGxpc3QgPSBpbml0aWFsTGlzdFxuICAgIHZhciBpbml0aWFsU3RhdGUgPSBbXVxuXG4gICAgLy8gY29weSBzdGF0ZSBvdXQgb2YgaW5pdGlhbExpc3QgaW50byBpbml0aWFsU3RhdGVcbiAgICBsaXN0LmZvckVhY2goZnVuY3Rpb24gKG9ic2VydiwgaW5kZXgpIHtcbiAgICAgICAgaW5pdGlhbFN0YXRlW2luZGV4XSA9IHR5cGVvZiBvYnNlcnYgPT09IFwiZnVuY3Rpb25cIiA/XG4gICAgICAgICAgICBvYnNlcnYoKSA6IG9ic2VydlxuICAgIH0pXG5cbiAgICB2YXIgb2JzID0gT2JzZXJ2KGluaXRpYWxTdGF0ZSlcbiAgICBvYnMuc3BsaWNlID0gc3BsaWNlXG5cbiAgICAvLyBvdmVycmlkZSBzZXQgYW5kIHN0b3JlIG9yaWdpbmFsIGZvciBsYXRlciB1c2VcbiAgICBvYnMuX29ic2VydlNldCA9IG9icy5zZXRcbiAgICBvYnMuc2V0ID0gc2V0XG5cbiAgICBvYnMuZ2V0ID0gZ2V0XG4gICAgb2JzLmdldExlbmd0aCA9IGdldExlbmd0aFxuICAgIG9icy5wdXQgPSBwdXRcbiAgICBvYnMudHJhbnNhY3Rpb24gPSB0cmFuc2FjdGlvblxuXG4gICAgLy8geW91IGJldHRlciBub3QgbXV0YXRlIHRoaXMgbGlzdCBkaXJlY3RseVxuICAgIC8vIHRoaXMgaXMgdGhlIGxpc3Qgb2Ygb2JzZXJ2cyBpbnN0YW5jZXNcbiAgICBvYnMuX2xpc3QgPSBsaXN0XG5cbiAgICB2YXIgcmVtb3ZlTGlzdGVuZXJzID0gbGlzdC5tYXAoZnVuY3Rpb24gKG9ic2Vydikge1xuICAgICAgICByZXR1cm4gdHlwZW9mIG9ic2VydiA9PT0gXCJmdW5jdGlvblwiID9cbiAgICAgICAgICAgIGFkZExpc3RlbmVyKG9icywgb2JzZXJ2KSA6XG4gICAgICAgICAgICBudWxsXG4gICAgfSk7XG4gICAgLy8gdGhpcyBpcyBhIGxpc3Qgb2YgcmVtb3ZhbCBmdW5jdGlvbnMgdGhhdCBtdXN0IGJlIGNhbGxlZFxuICAgIC8vIHdoZW4gb2JzZXJ2IGluc3RhbmNlcyBhcmUgcmVtb3ZlZCBmcm9tIGBvYnMubGlzdGBcbiAgICAvLyBub3QgY2FsbGluZyB0aGlzIG1lYW5zIHdlIGRvIG5vdCBHQyBvdXIgb2JzZXJ2IGNoYW5nZVxuICAgIC8vIGxpc3RlbmVycy4gV2hpY2ggY2F1c2VzIHJhZ2UgYnVnc1xuICAgIG9icy5fcmVtb3ZlTGlzdGVuZXJzID0gcmVtb3ZlTGlzdGVuZXJzXG5cbiAgICBvYnMuX3R5cGUgPSBcIm9ic2Vydi1hcnJheVwiXG4gICAgb2JzLl92ZXJzaW9uID0gXCIzXCJcblxuICAgIHJldHVybiBBcnJheU1ldGhvZHMob2JzLCBsaXN0KVxufVxuXG5mdW5jdGlvbiBnZXQoaW5kZXgpIHtcbiAgICByZXR1cm4gdGhpcy5fbGlzdFtpbmRleF1cbn1cblxuZnVuY3Rpb24gZ2V0TGVuZ3RoKCkge1xuICAgIHJldHVybiB0aGlzLl9saXN0Lmxlbmd0aFxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBzZXROb25FbnVtZXJhYmxlO1xuXG5mdW5jdGlvbiBzZXROb25FbnVtZXJhYmxlKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIGtleSwge1xuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlXG4gICAgfSk7XG59XG4iLCJmdW5jdGlvbiBoZWFkIChhKSB7XG4gIHJldHVybiBhWzBdXG59XG5cbmZ1bmN0aW9uIGxhc3QgKGEpIHtcbiAgcmV0dXJuIGFbYS5sZW5ndGggLSAxXVxufVxuXG5mdW5jdGlvbiB0YWlsKGEpIHtcbiAgcmV0dXJuIGEuc2xpY2UoMSlcbn1cblxuZnVuY3Rpb24gcmV0cmVhdCAoZSkge1xuICByZXR1cm4gZS5wb3AoKVxufVxuXG5mdW5jdGlvbiBoYXNMZW5ndGggKGUpIHtcbiAgcmV0dXJuIGUubGVuZ3RoXG59XG5cbmZ1bmN0aW9uIGFueShhcnksIHRlc3QpIHtcbiAgZm9yKHZhciBpPTA7aTxhcnkubGVuZ3RoO2krKylcbiAgICBpZih0ZXN0KGFyeVtpXSkpXG4gICAgICByZXR1cm4gdHJ1ZVxuICByZXR1cm4gZmFsc2Vcbn1cblxuZnVuY3Rpb24gc2NvcmUgKGEpIHtcbiAgcmV0dXJuIGEucmVkdWNlKGZ1bmN0aW9uIChzLCBhKSB7XG4gICAgICByZXR1cm4gcyArIGEubGVuZ3RoICsgYVsxXSArIDFcbiAgfSwgMClcbn1cblxuZnVuY3Rpb24gYmVzdCAoYSwgYikge1xuICByZXR1cm4gc2NvcmUoYSkgPD0gc2NvcmUoYikgPyBhIDogYlxufVxuXG5cbnZhciBfcnVsZXMgLy8gc2V0IGF0IHRoZSBib3R0b20gIFxuXG4vLyBub3RlLCBuYWl2ZSBpbXBsZW1lbnRhdGlvbi4gd2lsbCBicmVhayBvbiBjaXJjdWxhciBvYmplY3RzLlxuXG5mdW5jdGlvbiBfZXF1YWwoYSwgYikge1xuICBpZihhICYmICFiKSByZXR1cm4gZmFsc2VcbiAgaWYoQXJyYXkuaXNBcnJheShhKSlcbiAgICBpZihhLmxlbmd0aCAhPSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlXG4gIGlmKGEgJiYgJ29iamVjdCcgPT0gdHlwZW9mIGEpIHtcbiAgICBmb3IodmFyIGkgaW4gYSlcbiAgICAgIGlmKCFfZXF1YWwoYVtpXSwgYltpXSkpIHJldHVybiBmYWxzZVxuICAgIGZvcih2YXIgaSBpbiBiKVxuICAgICAgaWYoIV9lcXVhbChhW2ldLCBiW2ldKSkgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICByZXR1cm4gYSA9PSBiXG59XG5cbmZ1bmN0aW9uIGdldEFyZ3MoYXJncykge1xuICByZXR1cm4gYXJncy5sZW5ndGggPT0gMSA/IGFyZ3NbMF0gOiBbXS5zbGljZS5jYWxsKGFyZ3MpXG59XG5cbi8vIHJldHVybiB0aGUgaW5kZXggb2YgdGhlIGVsZW1lbnQgbm90IGxpa2UgdGhlIG90aGVycywgb3IgLTFcbmZ1bmN0aW9uIG9kZEVsZW1lbnQoYXJ5LCBjbXApIHtcbiAgdmFyIGNcbiAgZnVuY3Rpb24gZ3Vlc3MoYSkge1xuICAgIHZhciBvZGQgPSAtMVxuICAgIGMgPSAwXG4gICAgZm9yICh2YXIgaSA9IGE7IGkgPCBhcnkubGVuZ3RoOyBpICsrKSB7XG4gICAgICBpZighY21wKGFyeVthXSwgYXJ5W2ldKSkge1xuICAgICAgICBvZGQgPSBpLCBjKytcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGMgPiAxID8gLTEgOiBvZGRcbiAgfVxuICAvL2Fzc3VtZSB0aGF0IGl0IGlzIHRoZSBmaXJzdCBlbGVtZW50LlxuICB2YXIgZyA9IGd1ZXNzKDApXG4gIGlmKC0xICE9IGcpIHJldHVybiBnXG4gIC8vMCB3YXMgdGhlIG9kZCBvbmUsIHRoZW4gYWxsIHRoZSBvdGhlciBlbGVtZW50cyBhcmUgZXF1YWxcbiAgLy9lbHNlIHRoZXJlIG1vcmUgdGhhbiBvbmUgZGlmZmVyZW50IGVsZW1lbnRcbiAgZ3Vlc3MoMSlcbiAgcmV0dXJuIGMgPT0gMCA/IDAgOiAtMVxufVxudmFyIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkZXBzLCBleHBvcnRzKSB7XG4gIHZhciBlcXVhbCA9IChkZXBzICYmIGRlcHMuZXF1YWwpIHx8IF9lcXVhbFxuICBleHBvcnRzID0gZXhwb3J0cyB8fCB7fSBcbiAgZXhwb3J0cy5sY3MgPSBcbiAgZnVuY3Rpb24gbGNzKCkge1xuICAgIHZhciBjYWNoZSA9IHt9XG4gICAgdmFyIGFyZ3MgPSBnZXRBcmdzKGFyZ3VtZW50cylcbiAgICB2YXIgYSA9IGFyZ3NbMF0sIGIgPSBhcmdzWzFdXG5cbiAgICBmdW5jdGlvbiBrZXkgKGEsYil7XG4gICAgICByZXR1cm4gYS5sZW5ndGggKyAnOicgKyBiLmxlbmd0aFxuICAgIH1cblxuICAgIC8vZmluZCBsZW5ndGggdGhhdCBtYXRjaGVzIGF0IHRoZSBoZWFkXG5cbiAgICBpZihhcmdzLmxlbmd0aCA+IDIpIHtcbiAgICAgIC8vaWYgY2FsbGVkIHdpdGggbXVsdGlwbGUgc2VxdWVuY2VzXG4gICAgICAvL3JlY3Vyc2UsIHNpbmNlIGxjcyhhLCBiLCBjLCBkKSA9PSBsY3MobGNzKGEsYiksIGxjcyhjLGQpKVxuICAgICAgYXJncy5wdXNoKGxjcyhhcmdzLnNoaWZ0KCksIGFyZ3Muc2hpZnQoKSkpXG4gICAgICByZXR1cm4gbGNzKGFyZ3MpXG4gICAgfVxuICAgIFxuICAgIC8vdGhpcyB3b3VsZCBiZSBpbXByb3ZlZCBieSB0cnVuY2F0aW5nIGlucHV0IGZpcnN0XG4gICAgLy9hbmQgbm90IHJldHVybmluZyBhbiBsY3MgYXMgYW4gaW50ZXJtZWRpYXRlIHN0ZXAuXG4gICAgLy91bnRpbGwgdGhhdCBpcyBhIHBlcmZvcm1hbmNlIHByb2JsZW0uXG5cbiAgICB2YXIgc3RhcnQgPSAwLCBlbmQgPSAwXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGEubGVuZ3RoICYmIGkgPCBiLmxlbmd0aCBcbiAgICAgICYmIGVxdWFsKGFbaV0sIGJbaV0pXG4gICAgICA7IGkgKytcbiAgICApXG4gICAgICBzdGFydCA9IGkgKyAxXG5cbiAgICBpZihhLmxlbmd0aCA9PT0gc3RhcnQpXG4gICAgICByZXR1cm4gYS5zbGljZSgpXG5cbiAgICBmb3IodmFyIGkgPSAwOyAgaSA8IGEubGVuZ3RoIC0gc3RhcnQgJiYgaSA8IGIubGVuZ3RoIC0gc3RhcnRcbiAgICAgICYmIGVxdWFsKGFbYS5sZW5ndGggLSAxIC0gaV0sIGJbYi5sZW5ndGggLSAxIC0gaV0pXG4gICAgICA7IGkgKytcbiAgICApXG4gICAgICBlbmQgPSBpXG5cbiAgICBmdW5jdGlvbiByZWN1cnNlIChhLCBiKSB7XG4gICAgICBpZighYS5sZW5ndGggfHwgIWIubGVuZ3RoKSByZXR1cm4gW11cbiAgICAgIC8vYXZvaWQgZXhwb25lbnRpYWwgdGltZSBieSBjYWNoaW5nIHRoZSByZXN1bHRzXG4gICAgICBpZihjYWNoZVtrZXkoYSwgYildKSByZXR1cm4gY2FjaGVba2V5KGEsIGIpXVxuXG4gICAgICBpZihlcXVhbChhWzBdLCBiWzBdKSlcbiAgICAgICAgcmV0dXJuIFtoZWFkKGEpXS5jb25jYXQocmVjdXJzZSh0YWlsKGEpLCB0YWlsKGIpKSlcbiAgICAgIGVsc2UgeyBcbiAgICAgICAgdmFyIF9hID0gcmVjdXJzZSh0YWlsKGEpLCBiKVxuICAgICAgICB2YXIgX2IgPSByZWN1cnNlKGEsIHRhaWwoYikpXG4gICAgICAgIHJldHVybiBjYWNoZVtrZXkoYSxiKV0gPSBfYS5sZW5ndGggPiBfYi5sZW5ndGggPyBfYSA6IF9iICBcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgdmFyIG1pZGRsZUEgPSBhLnNsaWNlKHN0YXJ0LCBhLmxlbmd0aCAtIGVuZClcbiAgICB2YXIgbWlkZGxlQiA9IGIuc2xpY2Uoc3RhcnQsIGIubGVuZ3RoIC0gZW5kKVxuXG4gICAgcmV0dXJuIChcbiAgICAgIGEuc2xpY2UoMCwgc3RhcnQpLmNvbmNhdChcbiAgICAgICAgcmVjdXJzZShtaWRkbGVBLCBtaWRkbGVCKVxuICAgICAgKS5jb25jYXQoYS5zbGljZShhLmxlbmd0aCAtIGVuZCkpXG4gICAgKVxuICB9XG5cbiAgLy8gZ2l2ZW4gbiBzZXF1ZW5jZXMsIGNhbGMgdGhlIGxjcywgYW5kIHRoZW4gY2h1bmsgc3RyaW5ncyBpbnRvIHN0YWJsZSBhbmQgdW5zdGFibGUgc2VjdGlvbnMuXG4gIC8vIHVuc3RhYmxlIGNodW5rcyBhcmUgcGFzc2VkIHRvIGJ1aWxkXG4gIGV4cG9ydHMuY2h1bmsgPVxuICBmdW5jdGlvbiAocSwgYnVpbGQpIHtcbiAgICB2YXIgcSA9IHEubWFwKGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnNsaWNlKCkgfSlcbiAgICB2YXIgbGNzID0gZXhwb3J0cy5sY3MuYXBwbHkobnVsbCwgcSlcbiAgICB2YXIgYWxsID0gW2xjc10uY29uY2F0KHEpXG5cbiAgICBmdW5jdGlvbiBtYXRjaExjcyAoZSkge1xuICAgICAgaWYoZS5sZW5ndGggJiYgIWxjcy5sZW5ndGggfHwgIWUubGVuZ3RoICYmIGxjcy5sZW5ndGgpXG4gICAgICAgIHJldHVybiBmYWxzZSAvL2luY2FzZSB0aGUgbGFzdCBpdGVtIGlzIG51bGxcbiAgICAgIHJldHVybiBlcXVhbChsYXN0KGUpLCBsYXN0KGxjcykpIHx8ICgoZS5sZW5ndGggKyBsY3MubGVuZ3RoKSA9PT0gMClcbiAgICB9XG5cbiAgICB3aGlsZShhbnkocSwgaGFzTGVuZ3RoKSkge1xuICAgICAgLy9pZiBlYWNoIGVsZW1lbnQgaXMgYXQgdGhlIGxjcyB0aGVuIHRoaXMgY2h1bmsgaXMgc3RhYmxlLlxuICAgICAgd2hpbGUocS5ldmVyeShtYXRjaExjcykgJiYgcS5ldmVyeShoYXNMZW5ndGgpKVxuICAgICAgICBhbGwuZm9yRWFjaChyZXRyZWF0KVxuICAgICAgLy9jb2xsZWN0IHRoZSBjaGFuZ2VzIGluIGVhY2ggYXJyYXkgdXB0byB0aGUgbmV4dCBtYXRjaCB3aXRoIHRoZSBsY3NcbiAgICAgIHZhciBjID0gZmFsc2VcbiAgICAgIHZhciB1bnN0YWJsZSA9IHEubWFwKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHZhciBjaGFuZ2UgPSBbXVxuICAgICAgICB3aGlsZSghbWF0Y2hMY3MoZSkpIHtcbiAgICAgICAgICBjaGFuZ2UudW5zaGlmdChyZXRyZWF0KGUpKVxuICAgICAgICAgIGMgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNoYW5nZVxuICAgICAgfSlcbiAgICAgIGlmKGMpIGJ1aWxkKHFbMF0ubGVuZ3RoLCB1bnN0YWJsZSlcbiAgICB9XG4gIH1cblxuICAvL2NhbGN1bGF0ZSBhIGRpZmYgdGhpcyBpcyBvbmx5IHVwZGF0ZXNcbiAgZXhwb3J0cy5vcHRpbWlzdGljRGlmZiA9XG4gIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgdmFyIE0gPSBNYXRoLm1heChhLmxlbmd0aCwgYi5sZW5ndGgpXG4gICAgdmFyIG0gPSBNYXRoLm1pbihhLmxlbmd0aCwgYi5sZW5ndGgpXG4gICAgdmFyIHBhdGNoID0gW11cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgTTsgaSsrKVxuICAgICAgaWYoYVtpXSAhPT0gYltpXSkge1xuICAgICAgICB2YXIgY3VyID0gW2ksMF0sIGRlbGV0ZXMgPSAwXG4gICAgICAgIHdoaWxlKGFbaV0gIT09IGJbaV0gJiYgaSA8IG0pIHtcbiAgICAgICAgICBjdXJbMV0gPSArK2RlbGV0ZXNcbiAgICAgICAgICBjdXIucHVzaChiW2krK10pXG4gICAgICAgIH1cbiAgICAgICAgLy90aGUgcmVzdCBhcmUgZGVsZXRlcyBvciBpbnNlcnRzXG4gICAgICAgIGlmKGkgPj0gbSkge1xuICAgICAgICAgIC8vdGhlIHJlc3QgYXJlIGRlbGV0ZXNcbiAgICAgICAgICBpZihhLmxlbmd0aCA+IGIubGVuZ3RoKVxuICAgICAgICAgICAgY3VyWzFdICs9IGEubGVuZ3RoIC0gYi5sZW5ndGhcbiAgICAgICAgICAvL3RoZSByZXN0IGFyZSBpbnNlcnRzXG4gICAgICAgICAgZWxzZSBpZihhLmxlbmd0aCA8IGIubGVuZ3RoKVxuICAgICAgICAgICAgY3VyID0gY3VyLmNvbmNhdChiLnNsaWNlKGEubGVuZ3RoKSlcbiAgICAgICAgfVxuICAgICAgICBwYXRjaC5wdXNoKGN1cilcbiAgICAgIH1cblxuICAgIHJldHVybiBwYXRjaFxuICB9XG5cbiAgZXhwb3J0cy5kaWZmID1cbiAgZnVuY3Rpb24gKGEsIGIpIHtcbiAgICB2YXIgb3B0aW1pc3RpYyA9IGV4cG9ydHMub3B0aW1pc3RpY0RpZmYoYSwgYilcbiAgICB2YXIgY2hhbmdlcyA9IFtdXG4gICAgZXhwb3J0cy5jaHVuayhbYSwgYl0sIGZ1bmN0aW9uIChpbmRleCwgdW5zdGFibGUpIHtcbiAgICAgIHZhciBkZWwgPSB1bnN0YWJsZS5zaGlmdCgpLmxlbmd0aFxuICAgICAgdmFyIGluc2VydCA9IHVuc3RhYmxlLnNoaWZ0KClcbiAgICAgIGNoYW5nZXMucHVzaChbaW5kZXgsIGRlbF0uY29uY2F0KGluc2VydCkpXG4gICAgfSlcbiAgICByZXR1cm4gYmVzdChvcHRpbWlzdGljLCBjaGFuZ2VzKVxuICB9XG5cbiAgZXhwb3J0cy5wYXRjaCA9IGZ1bmN0aW9uIChhLCBjaGFuZ2VzLCBtdXRhdGUpIHtcbiAgICBpZihtdXRhdGUgIT09IHRydWUpIGEgPSBhLnNsaWNlKGEpLy9jb3B5IGFcbiAgICBjaGFuZ2VzLmZvckVhY2goZnVuY3Rpb24gKGNoYW5nZSkge1xuICAgICAgW10uc3BsaWNlLmFwcGx5KGEsIGNoYW5nZSlcbiAgICB9KVxuICAgIHJldHVybiBhXG4gIH1cblxuICAvLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0NvbmNlc3RvclxuICAvLyBtZSwgY29uY2VzdG9yLCB5b3UuLi5cbiAgZXhwb3J0cy5tZXJnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYXJncyA9IGdldEFyZ3MoYXJndW1lbnRzKVxuICAgIHZhciBwYXRjaCA9IGV4cG9ydHMuZGlmZjMoYXJncylcbiAgICByZXR1cm4gZXhwb3J0cy5wYXRjaChhcmdzWzBdLCBwYXRjaClcbiAgfVxuXG4gIGV4cG9ydHMuZGlmZjMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFyZ3MgPSBnZXRBcmdzKGFyZ3VtZW50cylcbiAgICB2YXIgciA9IFtdXG4gICAgZXhwb3J0cy5jaHVuayhhcmdzLCBmdW5jdGlvbiAoaW5kZXgsIHVuc3RhYmxlKSB7XG4gICAgICB2YXIgbWluZSA9IHVuc3RhYmxlWzBdXG4gICAgICB2YXIgaW5zZXJ0ID0gcmVzb2x2ZSh1bnN0YWJsZSlcbiAgICAgIGlmKGVxdWFsKG1pbmUsIGluc2VydCkpIHJldHVybiBcbiAgICAgIHIucHVzaChbaW5kZXgsIG1pbmUubGVuZ3RoXS5jb25jYXQoaW5zZXJ0KSkgXG4gICAgfSlcbiAgICByZXR1cm4gclxuICB9XG4gIGV4cG9ydHMub2RkT25lT3V0ID1cbiAgICBmdW5jdGlvbiBvZGRPbmVPdXQgKGNoYW5nZXMpIHtcbiAgICAgIGNoYW5nZXMgPSBjaGFuZ2VzLnNsaWNlKClcbiAgICAgIC8vcHV0IHRoZSBjb25jZXN0b3IgZmlyc3RcbiAgICAgIGNoYW5nZXMudW5zaGlmdChjaGFuZ2VzLnNwbGljZSgxLDEpWzBdKVxuICAgICAgdmFyIGkgPSBvZGRFbGVtZW50KGNoYW5nZXMsIGVxdWFsKVxuICAgICAgaWYoaSA9PSAwKSAvLyBjb25jZXN0b3Igd2FzIGRpZmZlcmVudCwgJ2ZhbHNlIGNvbmZsaWN0J1xuICAgICAgICByZXR1cm4gY2hhbmdlc1sxXVxuICAgICAgaWYgKH5pKVxuICAgICAgICByZXR1cm4gY2hhbmdlc1tpXSBcbiAgICB9XG4gIGV4cG9ydHMuaW5zZXJ0TWVyZ2VPdmVyRGVsZXRlID0gXG4gICAgLy9pJ3ZlIGltcGxlbWVudGVkIHRoaXMgYXMgYSBzZXBlcmF0ZSBydWxlLFxuICAgIC8vYmVjYXVzZSBJIGhhZCBzZWNvbmQgdGhvdWdodHMgYWJvdXQgdGhpcy5cbiAgICBmdW5jdGlvbiBpbnNlcnRNZXJnZU92ZXJEZWxldGUgKGNoYW5nZXMpIHtcbiAgICAgIGNoYW5nZXMgPSBjaGFuZ2VzLnNsaWNlKClcbiAgICAgIGNoYW5nZXMuc3BsaWNlKDEsMSkvLyByZW1vdmUgY29uY2VzdG9yXG4gICAgICBcbiAgICAgIC8vaWYgdGhlcmUgaXMgb25seSBvbmUgbm9uIGVtcHR5IGNoYW5nZSB0aGF0cyBva2F5LlxuICAgICAgLy9lbHNlIGZ1bGwgY29uZmlsY3RcbiAgICAgIGZvciAodmFyIGkgPSAwLCBub25lbXB0eTsgaSA8IGNoYW5nZXMubGVuZ3RoOyBpKyspXG4gICAgICAgIGlmKGNoYW5nZXNbaV0ubGVuZ3RoKSBcbiAgICAgICAgICBpZighbm9uZW1wdHkpIG5vbmVtcHR5ID0gY2hhbmdlc1tpXVxuICAgICAgICAgIGVsc2UgcmV0dXJuIC8vIGZ1bGwgY29uZmxpY3RcbiAgICAgIHJldHVybiBub25lbXB0eVxuICAgIH1cblxuICB2YXIgcnVsZXMgPSAoZGVwcyAmJiBkZXBzLnJ1bGVzKSB8fCBbZXhwb3J0cy5vZGRPbmVPdXQsIGV4cG9ydHMuaW5zZXJ0TWVyZ2VPdmVyRGVsZXRlXVxuXG4gIGZ1bmN0aW9uIHJlc29sdmUgKGNoYW5nZXMpIHtcbiAgICB2YXIgbCA9IHJ1bGVzLmxlbmd0aFxuICAgIGZvciAodmFyIGkgaW4gcnVsZXMpIHsgLy8gZmlyc3RcbiAgICAgIFxuICAgICAgdmFyIGMgPSBydWxlc1tpXSAmJiBydWxlc1tpXShjaGFuZ2VzKVxuICAgICAgaWYoYykgcmV0dXJuIGNcbiAgICB9XG4gICAgY2hhbmdlcy5zcGxpY2UoMSwxKSAvLyByZW1vdmUgY29uY2VzdG9yXG4gICAgLy9yZXR1cm5pbmcgdGhlIGNvbmZsaWN0cyBhcyBhbiBvYmplY3QgaXMgYSByZWFsbHkgYmFkIGlkZWEsXG4gICAgLy8gYmVjYXVzZSA9PSB3aWxsIG5vdCBkZXRlY3QgdGhleSBhcmUgdGhlIHNhbWUuIGFuZCBjb25mbGljdHMgYnVpbGQuXG4gICAgLy8gYmV0dGVyIHRvIHVzZVxuICAgIC8vICc8PDw8PDw8PDw8PDw8J1xuICAgIC8vIG9mIGNvdXJzZSwgaSB3cm90ZSB0aGlzIGJlZm9yZSBpIHN0YXJ0ZWQgb24gc25vYiwgc28gaSBkaWRuJ3Qga25vdyB0aGF0IHRoZW4uXG4gICAgLyp2YXIgY29uZmxpY3QgPSBbJz4+Pj4+Pj4+Pj4+Pj4+Pj4nXVxuICAgIHdoaWxlKGNoYW5nZXMubGVuZ3RoKVxuICAgICAgY29uZmxpY3QgPSBjb25mbGljdC5jb25jYXQoY2hhbmdlcy5zaGlmdCgpKS5jb25jYXQoJz09PT09PT09PT09PScpXG4gICAgY29uZmxpY3QucG9wKClcbiAgICBjb25mbGljdC5wdXNoICAgICAgICAgICgnPDw8PDw8PDw8PDw8PDw8JylcbiAgICBjaGFuZ2VzLnVuc2hpZnQgICAgICAgKCc+Pj4+Pj4+Pj4+Pj4+Pj4nKVxuICAgIHJldHVybiBjb25mbGljdCovXG4gICAgLy9uYWgsIGJldHRlciBpcyBqdXN0IHRvIHVzZSBhbiBlcXVhbCBjYW4gaGFuZGxlIG9iamVjdHNcbiAgICByZXR1cm4geyc/JzogY2hhbmdlc31cbiAgfVxuICByZXR1cm4gZXhwb3J0c1xufVxuZXhwb3J0cyhudWxsLCBleHBvcnRzKVxuIiwidmFyIGFkZExpc3RlbmVyID0gcmVxdWlyZShcIi4vYWRkLWxpc3RlbmVyLmpzXCIpXG52YXIgc2V0Tm9uRW51bWVyYWJsZSA9IHJlcXVpcmUoXCIuL2xpYi9zZXQtbm9uLWVudW1lcmFibGUuanNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gcHV0XG5cbi8vIGBvYnMucHV0YCBpcyBhIG11dGFibGUgaW1wbGVtZW50YXRpb24gb2YgYGFycmF5W2luZGV4XSA9IHZhbHVlYFxuLy8gdGhhdCBtdXRhdGVzIGJvdGggYGxpc3RgIGFuZCB0aGUgaW50ZXJuYWwgYHZhbHVlTGlzdGAgdGhhdFxuLy8gaXMgdGhlIGN1cnJlbnQgdmFsdWUgb2YgYG9ic2AgaXRzZWxmXG5mdW5jdGlvbiBwdXQoaW5kZXgsIHZhbHVlKSB7XG4gICAgdmFyIG9icyA9IHRoaXNcbiAgICB2YXIgdmFsdWVMaXN0ID0gb2JzKCkuc2xpY2UoKVxuXG4gICAgdmFyIG9yaWdpbmFsTGVuZ3RoID0gdmFsdWVMaXN0Lmxlbmd0aFxuICAgIHZhbHVlTGlzdFtpbmRleF0gPSB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IHZhbHVlKCkgOiB2YWx1ZVxuXG4gICAgb2JzLl9saXN0W2luZGV4XSA9IHZhbHVlXG5cbiAgICAvLyByZW1vdmUgcGFzdCB2YWx1ZSBsaXN0ZW5lciBpZiB3YXMgb2JzZXJ2XG4gICAgdmFyIHJlbW92ZUxpc3RlbmVyID0gb2JzLl9yZW1vdmVMaXN0ZW5lcnNbaW5kZXhdXG4gICAgaWYgKHJlbW92ZUxpc3RlbmVyKXtcbiAgICAgICAgcmVtb3ZlTGlzdGVuZXIoKVxuICAgIH1cblxuICAgIC8vIGFkZCBsaXN0ZW5lciB0byB2YWx1ZSBpZiBvYnNlcnZcbiAgICBvYnMuX3JlbW92ZUxpc3RlbmVyc1tpbmRleF0gPSB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/XG4gICAgICAgIGFkZExpc3RlbmVyKG9icywgdmFsdWUpIDpcbiAgICAgICAgbnVsbFxuXG4gICAgLy8gZmFrZSBzcGxpY2UgZGlmZlxuICAgIHZhciB2YWx1ZUFyZ3MgPSBpbmRleCA8IG9yaWdpbmFsTGVuZ3RoID8gXG4gICAgICAgIFtpbmRleCwgMSwgdmFsdWVMaXN0W2luZGV4XV0gOlxuICAgICAgICBbaW5kZXgsIDAsIHZhbHVlTGlzdFtpbmRleF1dXG5cbiAgICBzZXROb25FbnVtZXJhYmxlKHZhbHVlTGlzdCwgXCJfZGlmZlwiLCBbdmFsdWVBcmdzXSlcblxuICAgIG9icy5fb2JzZXJ2U2V0KHZhbHVlTGlzdClcbiAgICByZXR1cm4gdmFsdWVcbn0iLCJ2YXIgYXBwbHlQYXRjaCA9IHJlcXVpcmUoXCIuL2FwcGx5LXBhdGNoLmpzXCIpXG52YXIgc2V0Tm9uRW51bWVyYWJsZSA9IHJlcXVpcmUoXCIuL2xpYi9zZXQtbm9uLWVudW1lcmFibGUuanNcIilcbnZhciBhZGlmZiA9IHJlcXVpcmUoXCJhZGlmZlwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNldFxuXG5mdW5jdGlvbiBzZXQocmF3TGlzdCkge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShyYXdMaXN0KSkgcmF3TGlzdCA9IFtdXG5cbiAgICB2YXIgb2JzID0gdGhpc1xuICAgIHZhciBjaGFuZ2VzID0gYWRpZmYuZGlmZihvYnMuX2xpc3QsIHJhd0xpc3QpXG4gICAgdmFyIHZhbHVlTGlzdCA9IG9icygpLnNsaWNlKClcblxuICAgIHZhciB2YWx1ZUNoYW5nZXMgPSBjaGFuZ2VzLm1hcChhcHBseVBhdGNoLmJpbmQob2JzLCB2YWx1ZUxpc3QpKVxuXG4gICAgc2V0Tm9uRW51bWVyYWJsZSh2YWx1ZUxpc3QsIFwiX2RpZmZcIiwgdmFsdWVDaGFuZ2VzKVxuXG4gICAgb2JzLl9vYnNlcnZTZXQodmFsdWVMaXN0KVxuICAgIHJldHVybiBjaGFuZ2VzXG59XG4iLCJ2YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2VcblxudmFyIGFkZExpc3RlbmVyID0gcmVxdWlyZShcIi4vYWRkLWxpc3RlbmVyLmpzXCIpXG52YXIgc2V0Tm9uRW51bWVyYWJsZSA9IHJlcXVpcmUoXCIuL2xpYi9zZXQtbm9uLWVudW1lcmFibGUuanNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gc3BsaWNlXG5cbi8vIGBvYnMuc3BsaWNlYCBpcyBhIG11dGFibGUgaW1wbGVtZW50YXRpb24gb2YgYHNwbGljZSgpYFxuLy8gdGhhdCBtdXRhdGVzIGJvdGggYGxpc3RgIGFuZCB0aGUgaW50ZXJuYWwgYHZhbHVlTGlzdGAgdGhhdFxuLy8gaXMgdGhlIGN1cnJlbnQgdmFsdWUgb2YgYG9ic2AgaXRzZWxmXG5mdW5jdGlvbiBzcGxpY2UoaW5kZXgsIGFtb3VudCkge1xuICAgIHZhciBvYnMgPSB0aGlzXG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMClcbiAgICB2YXIgdmFsdWVMaXN0ID0gb2JzKCkuc2xpY2UoKVxuXG4gICAgLy8gZ2VuZXJhdGUgYSBsaXN0IG9mIGFyZ3MgdG8gbXV0YXRlIHRoZSBpbnRlcm5hbFxuICAgIC8vIGxpc3Qgb2Ygb25seSBvYnNcbiAgICB2YXIgdmFsdWVBcmdzID0gYXJncy5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpbmRleCkge1xuICAgICAgICBpZiAoaW5kZXggPT09IDAgfHwgaW5kZXggPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gbXVzdCB1bnBhY2sgb2JzZXJ2YWJsZXMgdGhhdCB3ZSBhcmUgYWRkaW5nXG4gICAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IHZhbHVlKCkgOiB2YWx1ZVxuICAgIH0pXG5cbiAgICB2YWx1ZUxpc3Quc3BsaWNlLmFwcGx5KHZhbHVlTGlzdCwgdmFsdWVBcmdzKVxuICAgIC8vIHdlIHJlbW92ZSB0aGUgb2JzZXJ2cyB0aGF0IHdlIHJlbW92ZVxuICAgIHZhciByZW1vdmVkID0gb2JzLl9saXN0LnNwbGljZS5hcHBseShvYnMuX2xpc3QsIGFyZ3MpXG5cbiAgICB2YXIgZXh0cmFSZW1vdmVMaXN0ZW5lcnMgPSBhcmdzLnNsaWNlKDIpLm1hcChmdW5jdGlvbiAob2JzZXJ2KSB7XG4gICAgICAgIHJldHVybiB0eXBlb2Ygb2JzZXJ2ID09PSBcImZ1bmN0aW9uXCIgP1xuICAgICAgICAgICAgYWRkTGlzdGVuZXIob2JzLCBvYnNlcnYpIDpcbiAgICAgICAgICAgIG51bGxcbiAgICB9KVxuICAgIGV4dHJhUmVtb3ZlTGlzdGVuZXJzLnVuc2hpZnQoYXJnc1swXSwgYXJnc1sxXSlcbiAgICB2YXIgcmVtb3ZlZExpc3RlbmVycyA9IG9icy5fcmVtb3ZlTGlzdGVuZXJzLnNwbGljZVxuICAgICAgICAuYXBwbHkob2JzLl9yZW1vdmVMaXN0ZW5lcnMsIGV4dHJhUmVtb3ZlTGlzdGVuZXJzKVxuXG4gICAgcmVtb3ZlZExpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uIChyZW1vdmVPYnNlcnZMaXN0ZW5lcikge1xuICAgICAgICBpZiAocmVtb3ZlT2JzZXJ2TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHJlbW92ZU9ic2Vydkxpc3RlbmVyKClcbiAgICAgICAgfVxuICAgIH0pXG5cbiAgICBzZXROb25FbnVtZXJhYmxlKHZhbHVlTGlzdCwgXCJfZGlmZlwiLCBbdmFsdWVBcmdzXSlcblxuICAgIG9icy5fb2JzZXJ2U2V0KHZhbHVlTGlzdClcbiAgICByZXR1cm4gcmVtb3ZlZFxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB0cmFuc2FjdGlvblxuXG5mdW5jdGlvbiB0cmFuc2FjdGlvbiAoZnVuYykge1xuICAgIHZhciBvYnMgPSB0aGlzXG4gICAgdmFyIHJhd0xpc3QgPSBvYnMuX2xpc3Quc2xpY2UoKVxuXG4gICAgaWYgKGZ1bmMocmF3TGlzdCkgIT09IGZhbHNlKXsgLy8gYWxsb3cgY2FuY2VsXG4gICAgICAgIHJldHVybiBvYnMuc2V0KHJhd0xpc3QpXG4gICAgfVxuXG59IiwidmFyIE9ic2VydiA9IHJlcXVpcmUoXCJvYnNlcnZcIilcbnZhciBleHRlbmQgPSByZXF1aXJlKFwieHRlbmRcIilcblxudmFyIGJsYWNrTGlzdCA9IFtcIm5hbWVcIiwgXCJfZGlmZlwiLCBcIl90eXBlXCIsIFwiX3ZlcnNpb25cIl1cbnZhciBibGFja0xpc3RSZWFzb25zID0ge1xuICAgIFwibmFtZVwiOiBcIkNsYXNoZXMgd2l0aCBgRnVuY3Rpb24ucHJvdG90eXBlLm5hbWVgLlxcblwiLFxuICAgIFwiX2RpZmZcIjogXCJfZGlmZiBpcyByZXNlcnZlZCBrZXkgb2Ygb2JzZXJ2LXN0cnVjdC5cXG5cIixcbiAgICBcIl90eXBlXCI6IFwiX3R5cGUgaXMgcmVzZXJ2ZWQga2V5IG9mIG9ic2Vydi1zdHJ1Y3QuXFxuXCIsXG4gICAgXCJfdmVyc2lvblwiOiBcIl92ZXJzaW9uIGlzIHJlc2VydmVkIGtleSBvZiBvYnNlcnYtc3RydWN0LlxcblwiXG59XG52YXIgTk9fVFJBTlNBQ1RJT04gPSB7fVxuXG5mdW5jdGlvbiBzZXROb25FbnVtZXJhYmxlKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIGtleSwge1xuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlXG4gICAgfSlcbn1cblxuLyogT2JzZXJ2U3RydWN0IDo9IChPYmplY3Q8U3RyaW5nLCBPYnNlcnY8VD4+KSA9PiBcbiAgICBPYmplY3Q8U3RyaW5nLCBPYnNlcnY8VD4+ICZcbiAgICAgICAgT2JzZXJ2PE9iamVjdDxTdHJpbmcsIFQ+ICYge1xuICAgICAgICAgICAgX2RpZmY6IE9iamVjdDxTdHJpbmcsIEFueT5cbiAgICAgICAgfT5cblxuKi9cbm1vZHVsZS5leHBvcnRzID0gT2JzZXJ2U3RydWN0XG5cbmZ1bmN0aW9uIE9ic2VydlN0cnVjdChzdHJ1Y3QpIHtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHN0cnVjdClcblxuICAgIHZhciBpbml0aWFsU3RhdGUgPSB7fVxuICAgIHZhciBjdXJyZW50VHJhbnNhY3Rpb24gPSBOT19UUkFOU0FDVElPTlxuICAgIHZhciBuZXN0ZWRUcmFuc2FjdGlvbiA9IE5PX1RSQU5TQUNUSU9OXG5cbiAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBpZiAoYmxhY2tMaXN0LmluZGV4T2Yoa2V5KSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImNhbm5vdCBjcmVhdGUgYW4gb2JzZXJ2LXN0cnVjdCBcIiArXG4gICAgICAgICAgICAgICAgXCJ3aXRoIGEga2V5IG5hbWVkICdcIiArIGtleSArIFwiJy5cXG5cIiArXG4gICAgICAgICAgICAgICAgYmxhY2tMaXN0UmVhc29uc1trZXldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvYnNlcnYgPSBzdHJ1Y3Rba2V5XVxuICAgICAgICBpbml0aWFsU3RhdGVba2V5XSA9IHR5cGVvZiBvYnNlcnYgPT09IFwiZnVuY3Rpb25cIiA/XG4gICAgICAgICAgICBvYnNlcnYoKSA6IG9ic2VydlxuICAgIH0pXG5cbiAgICB2YXIgb2JzID0gT2JzZXJ2KGluaXRpYWxTdGF0ZSlcbiAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICB2YXIgb2JzZXJ2ID0gc3RydWN0W2tleV1cbiAgICAgICAgb2JzW2tleV0gPSBvYnNlcnZcblxuICAgICAgICBpZiAodHlwZW9mIG9ic2VydiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBvYnNlcnYoZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5lc3RlZFRyYW5zYWN0aW9uID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSBleHRlbmQob2JzKCkpXG4gICAgICAgICAgICAgICAgc3RhdGVba2V5XSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgdmFyIGRpZmYgPSB7fVxuICAgICAgICAgICAgICAgIGRpZmZba2V5XSA9IHZhbHVlICYmIHZhbHVlLl9kaWZmID9cbiAgICAgICAgICAgICAgICAgICAgdmFsdWUuX2RpZmYgOiB2YWx1ZVxuXG4gICAgICAgICAgICAgICAgc2V0Tm9uRW51bWVyYWJsZShzdGF0ZSwgXCJfZGlmZlwiLCBkaWZmKVxuICAgICAgICAgICAgICAgIGN1cnJlbnRUcmFuc2FjdGlvbiA9IHN0YXRlXG4gICAgICAgICAgICAgICAgb2JzLnNldChzdGF0ZSlcbiAgICAgICAgICAgICAgICBjdXJyZW50VHJhbnNhY3Rpb24gPSBOT19UUkFOU0FDVElPTlxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH0pXG4gICAgdmFyIF9zZXQgPSBvYnMuc2V0XG4gICAgb2JzLnNldCA9IGZ1bmN0aW9uIHRyYWNrRGlmZih2YWx1ZSkge1xuICAgICAgICBpZiAoY3VycmVudFRyYW5zYWN0aW9uID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9zZXQodmFsdWUpXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbmV3U3RhdGUgPSBleHRlbmQodmFsdWUpXG4gICAgICAgIHNldE5vbkVudW1lcmFibGUobmV3U3RhdGUsIFwiX2RpZmZcIiwgdmFsdWUpXG4gICAgICAgIF9zZXQobmV3U3RhdGUpXG4gICAgfVxuXG4gICAgb2JzKGZ1bmN0aW9uIChuZXdTdGF0ZSkge1xuICAgICAgICBpZiAoY3VycmVudFRyYW5zYWN0aW9uID09PSBuZXdTdGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIG9ic2VydiA9IHN0cnVjdFtrZXldXG4gICAgICAgICAgICB2YXIgbmV3T2JzZXJ2VmFsdWUgPSBuZXdTdGF0ZVtrZXldXG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb2JzZXJ2ID09PSBcImZ1bmN0aW9uXCIgJiZcbiAgICAgICAgICAgICAgICBvYnNlcnYoKSAhPT0gbmV3T2JzZXJ2VmFsdWVcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIG5lc3RlZFRyYW5zYWN0aW9uID0gbmV3T2JzZXJ2VmFsdWVcbiAgICAgICAgICAgICAgICBvYnNlcnYuc2V0KG5ld1N0YXRlW2tleV0pXG4gICAgICAgICAgICAgICAgbmVzdGVkVHJhbnNhY3Rpb24gPSBOT19UUkFOU0FDVElPTlxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH0pXG5cbiAgICBvYnMuX3R5cGUgPSBcIm9ic2Vydi1zdHJ1Y3RcIlxuICAgIG9icy5fdmVyc2lvbiA9IFwiNVwiXG5cbiAgICByZXR1cm4gb2JzXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGV4dGVuZFxuXG5mdW5jdGlvbiBleHRlbmQoKSB7XG4gICAgdmFyIHRhcmdldCA9IHt9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldXG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhcmdldFxufVxuIiwidmFyIE9ic2VydiA9IHJlcXVpcmUoJ29ic2VydicpXG52YXIgZXh0ZW5kID0gcmVxdWlyZSgneHRlbmQnKVxuXG52YXIgTk9fVFJBTlNBQ1RJT04gPSB7fVxuXG5tb2R1bGUuZXhwb3J0cyA9IE9ic2VydlZhcmhhc2hcblxuZnVuY3Rpb24gT2JzZXJ2VmFyaGFzaCAoaGFzaCwgY3JlYXRlVmFsdWUpIHtcbiAgY3JlYXRlVmFsdWUgPSBjcmVhdGVWYWx1ZSB8fCBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogfVxuXG4gIHZhciBpbml0aWFsU3RhdGUgPSB7fVxuICB2YXIgY3VycmVudFRyYW5zYWN0aW9uID0gTk9fVFJBTlNBQ1RJT05cblxuICB2YXIgb2JzID0gT2JzZXJ2KGluaXRpYWxTdGF0ZSlcbiAgc2V0Tm9uRW51bWVyYWJsZShvYnMsICdfcmVtb3ZlTGlzdGVuZXJzJywge30pXG5cbiAgc2V0Tm9uRW51bWVyYWJsZShvYnMsICdzZXQnLCBvYnMuc2V0KVxuICBzZXROb25FbnVtZXJhYmxlKG9icywgJ2dldCcsIGdldC5iaW5kKG9icykpXG4gIHNldE5vbkVudW1lcmFibGUob2JzLCAncHV0JywgcHV0LmJpbmQob2JzLCBjcmVhdGVWYWx1ZSwgY3VycmVudFRyYW5zYWN0aW9uKSlcbiAgc2V0Tm9uRW51bWVyYWJsZShvYnMsICdkZWxldGUnLCBkZWwuYmluZChvYnMpKVxuXG4gIGZvciAodmFyIGtleSBpbiBoYXNoKSB7XG4gICAgb2JzW2tleV0gPSB0eXBlb2YgaGFzaFtrZXldID09PSAnZnVuY3Rpb24nID9cbiAgICAgIGhhc2hba2V5XSA6IGNyZWF0ZVZhbHVlKGhhc2hba2V5XSwga2V5KVxuXG4gICAgaWYgKGlzRm4ob2JzW2tleV0pKSB7XG4gICAgICBvYnMuX3JlbW92ZUxpc3RlbmVyc1trZXldID0gb2JzW2tleV0od2F0Y2gob2JzLCBrZXksIGN1cnJlbnRUcmFuc2FjdGlvbikpXG4gICAgfVxuICB9XG5cbiAgdmFyIG5ld1N0YXRlID0ge31cbiAgZm9yIChrZXkgaW4gaGFzaCkge1xuICAgIHZhciBvYnNlcnYgPSBvYnNba2V5XVxuICAgIGNoZWNrS2V5KGtleSlcbiAgICBuZXdTdGF0ZVtrZXldID0gaXNGbihvYnNlcnYpID8gb2JzZXJ2KCkgOiBvYnNlcnZcbiAgfVxuICBvYnMuc2V0KG5ld1N0YXRlKVxuXG4gIG9icyhmdW5jdGlvbiAobmV3U3RhdGUpIHtcbiAgICBpZiAoY3VycmVudFRyYW5zYWN0aW9uID09PSBuZXdTdGF0ZSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgZm9yICh2YXIga2V5IGluIGhhc2gpIHtcbiAgICAgIHZhciBvYnNlcnYgPSBoYXNoW2tleV1cblxuICAgICAgaWYgKGlzRm4ob2JzZXJ2KSAmJiBvYnNlcnYoKSAhPT0gbmV3U3RhdGVba2V5XSkge1xuICAgICAgICBvYnNlcnYuc2V0KG5ld1N0YXRlW2tleV0pXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIHJldHVybiBvYnNcbn1cblxuLy8gYWNjZXNzIGFuZCBtdXRhdGVcbmZ1bmN0aW9uIGdldCAoa2V5KSB7XG4gIHJldHVybiB0aGlzW2tleV1cbn1cblxuZnVuY3Rpb24gcHV0IChjcmVhdGVWYWx1ZSwgY3VycmVudFRyYW5zYWN0aW9uLCBrZXksIHZhbCkge1xuICBjaGVja0tleShrZXkpXG5cbiAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjYW5ub3QgdmFyaGFzaC5wdXQoa2V5LCB1bmRlZmluZWQpLicpXG4gIH1cblxuICB2YXIgb2JzZXJ2ID0gdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJyA/XG4gICAgdmFsIDogY3JlYXRlVmFsdWUodmFsLCBrZXkpXG4gIHZhciBzdGF0ZSA9IGV4dGVuZCh0aGlzKCkpXG5cbiAgc3RhdGVba2V5XSA9IGlzRm4ob2JzZXJ2KSA/IG9ic2VydigpIDogb2JzZXJ2XG5cbiAgaWYgKGlzRm4odGhpcy5fcmVtb3ZlTGlzdGVuZXJzW2tleV0pKSB7XG4gICAgdGhpcy5fcmVtb3ZlTGlzdGVuZXJzW2tleV0oKVxuICB9XG5cbiAgdGhpcy5fcmVtb3ZlTGlzdGVuZXJzW2tleV0gPSBpc0ZuKG9ic2VydikgP1xuICAgIG9ic2Vydih3YXRjaCh0aGlzLCBrZXksIGN1cnJlbnRUcmFuc2FjdGlvbikpIDogbnVsbFxuXG4gIHNldE5vbkVudW1lcmFibGUoc3RhdGUsICdfZGlmZicsIGRpZmYoa2V5LCBzdGF0ZVtrZXldKSlcblxuICB0aGlzW2tleV0gPSBvYnNlcnZcbiAgdGhpcy5zZXQoc3RhdGUpXG5cbiAgcmV0dXJuIHRoaXNcbn1cblxuZnVuY3Rpb24gZGVsIChrZXkpIHtcbiAgdmFyIHN0YXRlID0gZXh0ZW5kKHRoaXMoKSlcbiAgaWYgKGlzRm4odGhpcy5fcmVtb3ZlTGlzdGVuZXJzW2tleV0pKSB7XG4gICAgdGhpcy5fcmVtb3ZlTGlzdGVuZXJzW2tleV0oKVxuICB9XG5cbiAgZGVsZXRlIHRoaXMuX3JlbW92ZUxpc3RlbmVyc1trZXldXG4gIGRlbGV0ZSBzdGF0ZVtrZXldXG4gIGRlbGV0ZSB0aGlzW2tleV1cblxuICBzZXROb25FbnVtZXJhYmxlKHN0YXRlLCAnX2RpZmYnLCBkaWZmKGtleSwgdW5kZWZpbmVkKSlcbiAgdGhpcy5zZXQoc3RhdGUpXG5cbiAgcmV0dXJuIHRoaXNcbn1cblxuLy8gcHJvY2Vzc2luZ1xuZnVuY3Rpb24gd2F0Y2ggKG9icywga2V5LCBjdXJyZW50VHJhbnNhY3Rpb24pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhciBzdGF0ZSA9IGV4dGVuZChvYnMoKSlcbiAgICBzdGF0ZVtrZXldID0gdmFsdWVcblxuICAgIHNldE5vbkVudW1lcmFibGUoc3RhdGUsICdfZGlmZicsIGRpZmYoa2V5LCB2YWx1ZSkpXG4gICAgY3VycmVudFRyYW5zYWN0aW9uID0gc3RhdGVcbiAgICBvYnMuc2V0KHN0YXRlKVxuICAgIGN1cnJlbnRUcmFuc2FjdGlvbiA9IE5PX1RSQU5TQUNUSU9OXG4gIH1cbn1cblxuZnVuY3Rpb24gZGlmZiAoa2V5LCB2YWx1ZSkge1xuICB2YXIgb2JqID0ge31cbiAgb2JqW2tleV0gPSB2YWx1ZSAmJiB2YWx1ZS5fZGlmZiA/IHZhbHVlLl9kaWZmIDogdmFsdWVcbiAgcmV0dXJuIG9ialxufVxuXG5mdW5jdGlvbiBpc0ZuIChvYmopIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbidcbn1cblxuZnVuY3Rpb24gc2V0Tm9uRW51bWVyYWJsZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwga2V5LCB7XG4gICAgdmFsdWU6IHZhbHVlLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICB9KVxufVxuXG4vLyBlcnJvcnNcbnZhciBibGFja2xpc3QgPSB7XG4gIG5hbWU6ICdDbGFzaGVzIHdpdGggYEZ1bmN0aW9uLnByb3RvdHlwZS5uYW1lYC4nLFxuICBnZXQ6ICdnZXQgaXMgYSByZXNlcnZlZCBrZXkgb2Ygb2JzZXJ2LXZhcmhhc2ggbWV0aG9kJyxcbiAgcHV0OiAncHV0IGlzIGEgcmVzZXJ2ZWQga2V5IG9mIG9ic2Vydi12YXJoYXNoIG1ldGhvZCcsXG4gICdkZWxldGUnOiAnZGVsZXRlIGlzIGEgcmVzZXJ2ZWQga2V5IG9mIG9ic2Vydi12YXJoYXNoIG1ldGhvZCcsXG4gIF9kaWZmOiAnX2RpZmYgaXMgYSByZXNlcnZlZCBrZXkgb2Ygb2JzZXJ2LXZhcmhhc2ggbWV0aG9kJyxcbiAgX3JlbW92ZUxpc3RlbmVyczogJ19yZW1vdmVMaXN0ZW5lcnMgaXMgYSByZXNlcnZlZCBrZXkgb2Ygb2JzZXJ2LXZhcmhhc2gnXG59XG5cbmZ1bmN0aW9uIGNoZWNrS2V5IChrZXkpIHtcbiAgaWYgKCFibGFja2xpc3Rba2V5XSkgcmV0dXJuXG4gIHRocm93IG5ldyBFcnJvcihcbiAgICAnY2Fubm90IGNyZWF0ZSBhbiBvYnNlcnYtdmFyaGFzaCB3aXRoIGtleSBgJyArIGtleSArICdgLiAnICsgYmxhY2tsaXN0W2tleV1cbiAgKVxufVxuIiwidmFyIE9ic2VydmFibGUgPSByZXF1aXJlKFwiLi9pbmRleC5qc1wiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbXB1dGVkXG5cbmZ1bmN0aW9uIGNvbXB1dGVkKG9ic2VydmFibGVzLCBsYW1iZGEpIHtcbiAgICB2YXIgdmFsdWVzID0gb2JzZXJ2YWJsZXMubWFwKGZ1bmN0aW9uIChvKSB7XG4gICAgICAgIHJldHVybiBvKClcbiAgICB9KVxuICAgIHZhciByZXN1bHQgPSBPYnNlcnZhYmxlKGxhbWJkYS5hcHBseShudWxsLCB2YWx1ZXMpKVxuXG4gICAgb2JzZXJ2YWJsZXMuZm9yRWFjaChmdW5jdGlvbiAobywgaW5kZXgpIHtcbiAgICAgICAgbyhmdW5jdGlvbiAobmV3VmFsdWUpIHtcbiAgICAgICAgICAgIHZhbHVlc1tpbmRleF0gPSBuZXdWYWx1ZVxuICAgICAgICAgICAgcmVzdWx0LnNldChsYW1iZGEuYXBwbHkobnVsbCwgdmFsdWVzKSlcbiAgICAgICAgfSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIHJlc3VsdFxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBPYnNlcnZhYmxlXG5cbmZ1bmN0aW9uIE9ic2VydmFibGUodmFsdWUpIHtcbiAgICB2YXIgbGlzdGVuZXJzID0gW11cbiAgICB2YWx1ZSA9IHZhbHVlID09PSB1bmRlZmluZWQgPyBudWxsIDogdmFsdWVcblxuICAgIG9ic2VydmFibGUuc2V0ID0gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgdmFsdWUgPSB2XG4gICAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uIChmKSB7XG4gICAgICAgICAgICBmKHYpXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIG9ic2VydmFibGVcblxuICAgIGZ1bmN0aW9uIG9ic2VydmFibGUobGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKCFsaXN0ZW5lcikge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICAgIH1cblxuICAgICAgICBsaXN0ZW5lcnMucHVzaChsaXN0ZW5lcilcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgICAgICAgbGlzdGVuZXJzLnNwbGljZShsaXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lciksIDEpXG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHdhdGNoXG5cbmZ1bmN0aW9uIHdhdGNoKG9ic2VydmFibGUsIGxpc3RlbmVyKSB7XG4gICAgdmFyIHJlbW92ZSA9IG9ic2VydmFibGUobGlzdGVuZXIpXG4gICAgbGlzdGVuZXIob2JzZXJ2YWJsZSgpKVxuICAgIHJldHVybiByZW1vdmVcbn1cbiIsInZhciBEZWxlZ2F0b3IgPSByZXF1aXJlKCdkb20tZGVsZWdhdG9yJylcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlRXZlbnRcblxuZnVuY3Rpb24gQmFzZUV2ZW50KGxhbWJkYSkge1xuICAgIHJldHVybiBFdmVudEhhbmRsZXI7XG5cbiAgICBmdW5jdGlvbiBFdmVudEhhbmRsZXIoZm4sIGRhdGEsIG9wdHMpIHtcbiAgICAgICAgdmFyIGhhbmRsZXIgPSB7XG4gICAgICAgICAgICBmbjogZm4sXG4gICAgICAgICAgICBkYXRhOiBkYXRhICE9PSB1bmRlZmluZWQgPyBkYXRhIDoge30sXG4gICAgICAgICAgICBvcHRzOiBvcHRzIHx8IHt9LFxuICAgICAgICAgICAgaGFuZGxlRXZlbnQ6IGhhbmRsZUV2ZW50XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZm4gJiYgZm4udHlwZSA9PT0gJ2RvbS1kZWxlZ2F0b3ItaGFuZGxlJykge1xuICAgICAgICAgICAgcmV0dXJuIERlbGVnYXRvci50cmFuc2Zvcm1IYW5kbGUoZm4sXG4gICAgICAgICAgICAgICAgaGFuZGxlTGFtYmRhLmJpbmQoaGFuZGxlcikpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaGFuZGxlcjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVMYW1iZGEoZXYsIGJyb2FkY2FzdCkge1xuICAgICAgICBpZiAodGhpcy5vcHRzLnN0YXJ0UHJvcGFnYXRpb24gJiYgZXYuc3RhcnRQcm9wYWdhdGlvbikge1xuICAgICAgICAgICAgZXYuc3RhcnRQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxhbWJkYS5jYWxsKHRoaXMsIGV2LCBicm9hZGNhc3QpXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlRXZlbnQoZXYpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgICAgICAgaWYgKHNlbGYub3B0cy5zdGFydFByb3BhZ2F0aW9uICYmIGV2LnN0YXJ0UHJvcGFnYXRpb24pIHtcbiAgICAgICAgICAgIGV2LnN0YXJ0UHJvcGFnYXRpb24oKVxuICAgICAgICB9XG5cbiAgICAgICAgbGFtYmRhLmNhbGwoc2VsZiwgZXYsIGJyb2FkY2FzdClcblxuICAgICAgICBmdW5jdGlvbiBicm9hZGNhc3QodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZi5mbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHNlbGYuZm4odmFsdWUpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYuZm4ud3JpdGUodmFsdWUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJ2YXIgZXh0ZW5kID0gcmVxdWlyZSgneHRlbmQnKVxudmFyIGdldEZvcm1EYXRhID0gcmVxdWlyZSgnZm9ybS1kYXRhLXNldC9lbGVtZW50JylcblxudmFyIEJhc2VFdmVudCA9IHJlcXVpcmUoJy4vYmFzZS1ldmVudC5qcycpXG5cbnZhciBWQUxJRF9DSEFOR0UgPSBbJ2NoZWNrYm94JywgJ2ZpbGUnLCAnc2VsZWN0LW11bHRpcGxlJywgJ3NlbGVjdC1vbmUnXTtcbnZhciBWQUxJRF9JTlBVVCA9IFsnY29sb3InLCAnZGF0ZScsICdkYXRldGltZScsICdkYXRldGltZS1sb2NhbCcsICdlbWFpbCcsXG4gICAgJ21vbnRoJywgJ251bWJlcicsICdwYXNzd29yZCcsICdyYW5nZScsICdzZWFyY2gnLCAndGVsJywgJ3RleHQnLCAndGltZScsXG4gICAgJ3VybCcsICd3ZWVrJ107XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZUV2ZW50KGNoYW5nZUxhbWJkYSk7XG5cbmZ1bmN0aW9uIGNoYW5nZUxhbWJkYShldiwgYnJvYWRjYXN0KSB7XG4gICAgdmFyIHRhcmdldCA9IGV2LnRhcmdldFxuXG4gICAgdmFyIGlzVmFsaWQgPVxuICAgICAgICAoZXYudHlwZSA9PT0gJ2lucHV0JyAmJiBWQUxJRF9JTlBVVC5pbmRleE9mKHRhcmdldC50eXBlKSAhPT0gLTEpIHx8XG4gICAgICAgIChldi50eXBlID09PSAnY2hhbmdlJyAmJiBWQUxJRF9DSEFOR0UuaW5kZXhPZih0YXJnZXQudHlwZSkgIT09IC0xKTtcblxuICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgICBpZiAoZXYuc3RhcnRQcm9wYWdhdGlvbikge1xuICAgICAgICAgICAgZXYuc3RhcnRQcm9wYWdhdGlvbigpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdmFyIHZhbHVlID0gZ2V0Rm9ybURhdGEoZXYuY3VycmVudFRhcmdldClcbiAgICB2YXIgZGF0YSA9IGV4dGVuZCh2YWx1ZSwgdGhpcy5kYXRhKVxuXG4gICAgYnJvYWRjYXN0KGRhdGEpXG59XG4iLCJ2YXIgQmFzZUV2ZW50ID0gcmVxdWlyZSgnLi9iYXNlLWV2ZW50LmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZUV2ZW50KGNsaWNrTGFtYmRhKTtcblxuZnVuY3Rpb24gY2xpY2tMYW1iZGEoZXYsIGJyb2FkY2FzdCkge1xuICAgIHZhciBvcHRzID0gdGhpcy5vcHRzO1xuXG4gICAgaWYgKCFvcHRzLmN0cmwgJiYgZXYuY3RybEtleSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFvcHRzLm1ldGEgJiYgZXYubWV0YUtleSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFvcHRzLnJpZ2h0Q2xpY2sgJiYgZXYud2hpY2ggPT09IDIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdHMucHJldmVudERlZmF1bHQgJiYgZXYucHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG5cbiAgICBicm9hZGNhc3QodGhpcy5kYXRhKTtcbn1cbiIsInZhciBCYXNlRXZlbnQgPSByZXF1aXJlKCcuL2Jhc2UtZXZlbnQuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlRXZlbnQoZXZlbnRMYW1iZGEpO1xuXG5mdW5jdGlvbiBldmVudExhbWJkYShldiwgYnJvYWRjYXN0KSB7XG4gICAgYnJvYWRjYXN0KHRoaXMuZGF0YSk7XG59XG4iLCJ2YXIgQmFzZUV2ZW50ID0gcmVxdWlyZSgnLi9iYXNlLWV2ZW50LmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZUV2ZW50KGtleUxhbWJkYSk7XG5cbmZ1bmN0aW9uIGtleUxhbWJkYShldiwgYnJvYWRjYXN0KSB7XG4gICAgdmFyIGtleSA9IHRoaXMub3B0cy5rZXk7XG5cbiAgICBpZiAoZXYua2V5Q29kZSA9PT0ga2V5KSB7XG4gICAgICAgIGJyb2FkY2FzdCh0aGlzLmRhdGEpO1xuICAgIH1cbn1cbiIsInZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZVxuXG5tb2R1bGUuZXhwb3J0cyA9IGl0ZXJhdGl2ZWx5V2Fsa1xuXG5mdW5jdGlvbiBpdGVyYXRpdmVseVdhbGsobm9kZXMsIGNiKSB7XG4gICAgaWYgKCEoJ2xlbmd0aCcgaW4gbm9kZXMpKSB7XG4gICAgICAgIG5vZGVzID0gW25vZGVzXVxuICAgIH1cbiAgICBcbiAgICBub2RlcyA9IHNsaWNlLmNhbGwobm9kZXMpXG5cbiAgICB3aGlsZShub2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIG5vZGUgPSBub2Rlcy5zaGlmdCgpLFxuICAgICAgICAgICAgcmV0ID0gY2Iobm9kZSlcblxuICAgICAgICBpZiAocmV0KSB7XG4gICAgICAgICAgICByZXR1cm4gcmV0XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobm9kZS5jaGlsZE5vZGVzICYmIG5vZGUuY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIG5vZGVzID0gc2xpY2UuY2FsbChub2RlLmNoaWxkTm9kZXMpLmNvbmNhdChub2RlcylcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsInZhciB3YWxrID0gcmVxdWlyZSgnZG9tLXdhbGsnKVxuXG52YXIgRm9ybURhdGEgPSByZXF1aXJlKCcuL2luZGV4LmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRGb3JtRGF0YVxuXG5mdW5jdGlvbiBidWlsZEVsZW1zKHJvb3RFbGVtKSB7XG4gICAgdmFyIGhhc2ggPSB7fVxuICAgIGlmIChyb290RWxlbS5uYW1lKSB7XG4gICAgXHRoYXNoW3Jvb3RFbGVtLm5hbWVdID0gcm9vdEVsZW1cbiAgICB9XG5cbiAgICB3YWxrKHJvb3RFbGVtLCBmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICAgICAgaWYgKGNoaWxkLm5hbWUpIHtcbiAgICAgICAgICAgIGhhc2hbY2hpbGQubmFtZV0gPSBjaGlsZFxuICAgICAgICB9XG4gICAgfSlcblxuXG4gICAgcmV0dXJuIGhhc2hcbn1cblxuZnVuY3Rpb24gZ2V0Rm9ybURhdGEocm9vdEVsZW0pIHtcbiAgICB2YXIgZWxlbWVudHMgPSBidWlsZEVsZW1zKHJvb3RFbGVtKVxuXG4gICAgcmV0dXJuIEZvcm1EYXRhKGVsZW1lbnRzKVxufVxuIiwiLypqc2hpbnQgbWF4Y29tcGxleGl0eTogMTAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZvcm1EYXRhXG5cbi8vVE9ETzogTWFzc2l2ZSBzcGVjOiBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS9hc3NvY2lhdGlvbi1vZi1jb250cm9scy1hbmQtZm9ybXMuaHRtbCNjb25zdHJ1Y3RpbmctZm9ybS1kYXRhLXNldFxuZnVuY3Rpb24gRm9ybURhdGEoZWxlbWVudHMpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoZWxlbWVudHMpLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBrZXkpIHtcbiAgICAgICAgdmFyIGVsZW0gPSBlbGVtZW50c1trZXldXG5cbiAgICAgICAgYWNjW2tleV0gPSB2YWx1ZU9mRWxlbWVudChlbGVtKVxuXG4gICAgICAgIHJldHVybiBhY2NcbiAgICB9LCB7fSlcbn1cblxuZnVuY3Rpb24gdmFsdWVPZkVsZW1lbnQoZWxlbSkge1xuICAgIGlmICh0eXBlb2YgZWxlbSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBlbGVtKClcbiAgICB9IGVsc2UgaWYgKGNvbnRhaW5zUmFkaW8oZWxlbSkpIHtcbiAgICAgICAgdmFyIGVsZW1zID0gdG9MaXN0KGVsZW0pXG4gICAgICAgIHZhciBjaGVja2VkID0gZWxlbXMuZmlsdGVyKGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbS5jaGVja2VkXG4gICAgICAgIH0pWzBdIHx8IG51bGxcblxuICAgICAgICByZXR1cm4gY2hlY2tlZCA/IGNoZWNrZWQudmFsdWUgOiBudWxsXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGVsZW0pKSB7XG4gICAgICAgIHJldHVybiBlbGVtLm1hcCh2YWx1ZU9mRWxlbWVudCkuZmlsdGVyKGZpbHRlck51bGwpXG4gICAgfSBlbHNlIGlmIChlbGVtLnRhZ05hbWUgPT09IHVuZGVmaW5lZCAmJiBlbGVtLm5vZGVUeXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIEZvcm1EYXRhKGVsZW0pXG4gICAgfSBlbHNlIGlmIChlbGVtLnRhZ05hbWUgPT09IFwiSU5QVVRcIiAmJiBpc0NoZWNrZWQoZWxlbSkpIHtcbiAgICAgICAgaWYgKGVsZW0uaGFzQXR0cmlidXRlKFwidmFsdWVcIikpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtLmNoZWNrZWQgPyBlbGVtLnZhbHVlIDogbnVsbFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW0uY2hlY2tlZFxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChlbGVtLnRhZ05hbWUgPT09IFwiSU5QVVRcIikge1xuICAgICAgICByZXR1cm4gZWxlbS52YWx1ZVxuICAgIH0gZWxzZSBpZiAoZWxlbS50YWdOYW1lID09PSBcIlRFWFRBUkVBXCIpIHtcbiAgICAgICAgcmV0dXJuIGVsZW0udmFsdWVcbiAgICB9IGVsc2UgaWYgKGVsZW0udGFnTmFtZSA9PT0gXCJTRUxFQ1RcIikge1xuICAgICAgICByZXR1cm4gZWxlbS52YWx1ZVxuICAgIH1cbn1cblxuZnVuY3Rpb24gaXNDaGVja2VkKGVsZW0pIHtcbiAgICByZXR1cm4gZWxlbS50eXBlID09PSBcImNoZWNrYm94XCIgfHwgZWxlbS50eXBlID09PSBcInJhZGlvXCJcbn1cblxuZnVuY3Rpb24gY29udGFpbnNSYWRpbyh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZS50YWdOYW1lIHx8IHZhbHVlLm5vZGVUeXBlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHZhciBlbGVtcyA9IHRvTGlzdCh2YWx1ZSlcblxuICAgIHJldHVybiBlbGVtcy5zb21lKGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgICAgIHJldHVybiBlbGVtLnRhZ05hbWUgPT09IFwiSU5QVVRcIiAmJiBlbGVtLnR5cGUgPT09IFwicmFkaW9cIlxuICAgIH0pXG59XG5cbmZ1bmN0aW9uIHRvTGlzdCh2YWx1ZSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdmFsdWVcbiAgICB9XG5cbiAgICByZXR1cm4gT2JqZWN0LmtleXModmFsdWUpLm1hcChwcm9wLCB2YWx1ZSlcbn1cblxuZnVuY3Rpb24gcHJvcCh4KSB7XG4gICAgcmV0dXJuIHRoaXNbeF1cbn1cblxuZnVuY3Rpb24gZmlsdGVyTnVsbCh2YWwpIHtcbiAgICByZXR1cm4gdmFsICE9PSBudWxsXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGhhc0tleXNcblxuZnVuY3Rpb24gaGFzS2V5cyhzb3VyY2UpIHtcbiAgICByZXR1cm4gc291cmNlICE9PSBudWxsICYmXG4gICAgICAgICh0eXBlb2Ygc291cmNlID09PSBcIm9iamVjdFwiIHx8XG4gICAgICAgIHR5cGVvZiBzb3VyY2UgPT09IFwiZnVuY3Rpb25cIilcbn1cbiIsInZhciBoYXNLZXlzID0gcmVxdWlyZShcIi4vaGFzLWtleXNcIilcblxubW9kdWxlLmV4cG9ydHMgPSBleHRlbmRcblxuZnVuY3Rpb24gZXh0ZW5kKCkge1xuICAgIHZhciB0YXJnZXQgPSB7fVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXVxuXG4gICAgICAgIGlmICghaGFzS2V5cyhzb3VyY2UpKSB7XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhcmdldFxufVxuIiwidmFyIGV4dGVuZCA9IHJlcXVpcmUoJ3h0ZW5kJylcbnZhciBnZXRGb3JtRGF0YSA9IHJlcXVpcmUoJ2Zvcm0tZGF0YS1zZXQvZWxlbWVudCcpXG5cbnZhciBCYXNlRXZlbnQgPSByZXF1aXJlKCcuL2Jhc2UtZXZlbnQuanMnKTtcblxudmFyIEVOVEVSID0gMTNcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlRXZlbnQoc3VibWl0TGFtYmRhKTtcblxuZnVuY3Rpb24gc3VibWl0TGFtYmRhKGV2LCBicm9hZGNhc3QpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZXYudGFyZ2V0XG5cbiAgICB2YXIgaXNWYWxpZCA9XG4gICAgICAgIChldi50eXBlID09PSAnc3VibWl0JyAmJiB0YXJnZXQudGFnTmFtZSA9PT0gJ0ZPUk0nKSB8fFxuICAgICAgICAoZXYudHlwZSA9PT0gJ2NsaWNrJyAmJiB0YXJnZXQudGFnTmFtZSA9PT0gJ0JVVFRPTicpIHx8XG4gICAgICAgIChldi50eXBlID09PSAnY2xpY2snICYmIHRhcmdldC50eXBlID09PSAnc3VibWl0JykgfHxcbiAgICAgICAgKFxuICAgICAgICAgICAgKHRhcmdldC50eXBlID09PSAndGV4dCcpICYmXG4gICAgICAgICAgICAoZXYua2V5Q29kZSA9PT0gRU5URVIgJiYgZXYudHlwZSA9PT0gJ2tleWRvd24nKVxuICAgICAgICApXG5cbiAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgICAgaWYgKGV2LnN0YXJ0UHJvcGFnYXRpb24pIHtcbiAgICAgICAgICAgIGV2LnN0YXJ0UHJvcGFnYXRpb24oKVxuICAgICAgICB9XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHZhciB2YWx1ZSA9IGdldEZvcm1EYXRhKGV2LmN1cnJlbnRUYXJnZXQpXG4gICAgdmFyIGRhdGEgPSBleHRlbmQodmFsdWUsIHRoaXMuZGF0YSlcblxuICAgIGlmIChldi5wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIGJyb2FkY2FzdChkYXRhKTtcbn1cbiIsInZhciBleHRlbmQgPSByZXF1aXJlKCd4dGVuZCcpXG52YXIgZ2V0Rm9ybURhdGEgPSByZXF1aXJlKCdmb3JtLWRhdGEtc2V0L2VsZW1lbnQnKVxuXG52YXIgQmFzZUV2ZW50ID0gcmVxdWlyZSgnLi9iYXNlLWV2ZW50LmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZUV2ZW50KHZhbHVlTGFtYmRhKTtcblxuZnVuY3Rpb24gdmFsdWVMYW1iZGEoZXYsIGJyb2FkY2FzdCkge1xuICAgIHZhciB2YWx1ZSA9IGdldEZvcm1EYXRhKGV2LmN1cnJlbnRUYXJnZXQpXG4gICAgdmFyIGRhdGEgPSBleHRlbmQodmFsdWUsIHRoaXMuZGF0YSlcblxuICAgIGJyb2FkY2FzdChkYXRhKTtcbn1cbiIsImZ1bmN0aW9uIFRodW5rKGZuLCBhcmdzLCBrZXksIGVxQXJncykge1xyXG4gICAgdGhpcy5mbiA9IGZuO1xyXG4gICAgdGhpcy5hcmdzID0gYXJncztcclxuICAgIHRoaXMua2V5ID0ga2V5O1xyXG4gICAgdGhpcy5lcUFyZ3MgPSBlcUFyZ3M7XHJcbn1cclxuXHJcblRodW5rLnByb3RvdHlwZS50eXBlID0gJ1RodW5rJztcclxuVGh1bmsucHJvdG90eXBlLnJlbmRlciA9IHJlbmRlcjtcclxubW9kdWxlLmV4cG9ydHMgPSBUaHVuaztcclxuXHJcbmZ1bmN0aW9uIHNob3VsZFVwZGF0ZShjdXJyZW50LCBwcmV2aW91cykge1xyXG4gICAgaWYgKCFjdXJyZW50IHx8ICFwcmV2aW91cyB8fCBjdXJyZW50LmZuICE9PSBwcmV2aW91cy5mbikge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBjYXJncyA9IGN1cnJlbnQuYXJncztcclxuICAgIHZhciBwYXJncyA9IHByZXZpb3VzLmFyZ3M7XHJcblxyXG4gICAgcmV0dXJuICFjdXJyZW50LmVxQXJncyhjYXJncywgcGFyZ3MpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXIocHJldmlvdXMpIHtcclxuICAgIGlmIChzaG91bGRVcGRhdGUodGhpcywgcHJldmlvdXMpKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZm4uYXBwbHkobnVsbCwgdGhpcy5hcmdzKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHByZXZpb3VzLnZub2RlO1xyXG4gICAgfVxyXG59XHJcbiIsInZhciBQYXJ0aWFsID0gcmVxdWlyZSgnLi9wYXJ0aWFsJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnRpYWwoKTtcclxuIiwidmFyIHNoYWxsb3dFcSA9IHJlcXVpcmUoJy4vc2hhbGxvdy1lcScpO1xudmFyIFRodW5rID0gcmVxdWlyZSgnLi9pbW11dGFibGUtdGh1bmsnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVQYXJ0aWFsO1xuXG5mdW5jdGlvbiBjcmVhdGVQYXJ0aWFsKGVxKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIHBhcnRpYWwoZm4pIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBjb3B5T3Zlcihhcmd1bWVudHMsIDEpO1xuICAgICAgICB2YXIgZmlyc3RBcmcgPSBhcmdzWzBdO1xuICAgICAgICB2YXIga2V5O1xuXG4gICAgICAgIHZhciBlcUFyZ3MgPSBlcSB8fCBzaGFsbG93RXE7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBmaXJzdEFyZyA9PT0gJ29iamVjdCcgJiYgZmlyc3RBcmcgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmICgna2V5JyBpbiBmaXJzdEFyZykge1xuICAgICAgICAgICAgICAgIGtleSA9IGZpcnN0QXJnLmtleTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoJ2lkJyBpbiBmaXJzdEFyZykge1xuICAgICAgICAgICAgICAgIGtleSA9IGZpcnN0QXJnLmlkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBUaHVuayhmbiwgYXJncywga2V5LCBlcUFyZ3MpO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIGNvcHlPdmVyKGxpc3QsIG9mZnNldCkge1xuICAgIHZhciBuZXdMaXN0ID0gW107XG4gICAgZm9yICh2YXIgaSA9IGxpc3QubGVuZ3RoIC0gMTsgaSA+PSBvZmZzZXQ7IGktLSkge1xuICAgICAgICBuZXdMaXN0W2kgLSBvZmZzZXRdID0gbGlzdFtpXTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld0xpc3Q7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHNoYWxsb3dFcTtcclxuXHJcbmZ1bmN0aW9uIHNoYWxsb3dFcShjdXJyZW50QXJncywgcHJldmlvdXNBcmdzKSB7XHJcbiAgICBpZiAoY3VycmVudEFyZ3MubGVuZ3RoID09PSAwICYmIHByZXZpb3VzQXJncy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY3VycmVudEFyZ3MubGVuZ3RoICE9PSBwcmV2aW91c0FyZ3MubGVuZ3RoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBsZW4gPSBjdXJyZW50QXJncy5sZW5ndGg7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgIGlmIChjdXJyZW50QXJnc1tpXSAhPT0gcHJldmlvdXNBcmdzW2ldKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuIiwiLyohXG4gKiBDcm9zcy1Ccm93c2VyIFNwbGl0IDEuMS4xXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDEyIFN0ZXZlbiBMZXZpdGhhbiA8c3RldmVubGV2aXRoYW4uY29tPlxuICogQXZhaWxhYmxlIHVuZGVyIHRoZSBNSVQgTGljZW5zZVxuICogRUNNQVNjcmlwdCBjb21wbGlhbnQsIHVuaWZvcm0gY3Jvc3MtYnJvd3NlciBzcGxpdCBtZXRob2RcbiAqL1xuXG4vKipcbiAqIFNwbGl0cyBhIHN0cmluZyBpbnRvIGFuIGFycmF5IG9mIHN0cmluZ3MgdXNpbmcgYSByZWdleCBvciBzdHJpbmcgc2VwYXJhdG9yLiBNYXRjaGVzIG9mIHRoZVxuICogc2VwYXJhdG9yIGFyZSBub3QgaW5jbHVkZWQgaW4gdGhlIHJlc3VsdCBhcnJheS4gSG93ZXZlciwgaWYgYHNlcGFyYXRvcmAgaXMgYSByZWdleCB0aGF0IGNvbnRhaW5zXG4gKiBjYXB0dXJpbmcgZ3JvdXBzLCBiYWNrcmVmZXJlbmNlcyBhcmUgc3BsaWNlZCBpbnRvIHRoZSByZXN1bHQgZWFjaCB0aW1lIGBzZXBhcmF0b3JgIGlzIG1hdGNoZWQuXG4gKiBGaXhlcyBicm93c2VyIGJ1Z3MgY29tcGFyZWQgdG8gdGhlIG5hdGl2ZSBgU3RyaW5nLnByb3RvdHlwZS5zcGxpdGAgYW5kIGNhbiBiZSB1c2VkIHJlbGlhYmx5XG4gKiBjcm9zcy1icm93c2VyLlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBTdHJpbmcgdG8gc3BsaXQuXG4gKiBAcGFyYW0ge1JlZ0V4cHxTdHJpbmd9IHNlcGFyYXRvciBSZWdleCBvciBzdHJpbmcgdG8gdXNlIGZvciBzZXBhcmF0aW5nIHRoZSBzdHJpbmcuXG4gKiBAcGFyYW0ge051bWJlcn0gW2xpbWl0XSBNYXhpbXVtIG51bWJlciBvZiBpdGVtcyB0byBpbmNsdWRlIGluIHRoZSByZXN1bHQgYXJyYXkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IEFycmF5IG9mIHN1YnN0cmluZ3MuXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIEJhc2ljIHVzZVxuICogc3BsaXQoJ2EgYiBjIGQnLCAnICcpO1xuICogLy8gLT4gWydhJywgJ2InLCAnYycsICdkJ11cbiAqXG4gKiAvLyBXaXRoIGxpbWl0XG4gKiBzcGxpdCgnYSBiIGMgZCcsICcgJywgMik7XG4gKiAvLyAtPiBbJ2EnLCAnYiddXG4gKlxuICogLy8gQmFja3JlZmVyZW5jZXMgaW4gcmVzdWx0IGFycmF5XG4gKiBzcGxpdCgnLi53b3JkMSB3b3JkMi4uJywgLyhbYS16XSspKFxcZCspL2kpO1xuICogLy8gLT4gWycuLicsICd3b3JkJywgJzEnLCAnICcsICd3b3JkJywgJzInLCAnLi4nXVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiBzcGxpdCh1bmRlZikge1xuXG4gIHZhciBuYXRpdmVTcGxpdCA9IFN0cmluZy5wcm90b3R5cGUuc3BsaXQsXG4gICAgY29tcGxpYW50RXhlY05wY2cgPSAvKCk/Py8uZXhlYyhcIlwiKVsxXSA9PT0gdW5kZWYsXG4gICAgLy8gTlBDRzogbm9ucGFydGljaXBhdGluZyBjYXB0dXJpbmcgZ3JvdXBcbiAgICBzZWxmO1xuXG4gIHNlbGYgPSBmdW5jdGlvbihzdHIsIHNlcGFyYXRvciwgbGltaXQpIHtcbiAgICAvLyBJZiBgc2VwYXJhdG9yYCBpcyBub3QgYSByZWdleCwgdXNlIGBuYXRpdmVTcGxpdGBcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHNlcGFyYXRvcikgIT09IFwiW29iamVjdCBSZWdFeHBdXCIpIHtcbiAgICAgIHJldHVybiBuYXRpdmVTcGxpdC5jYWxsKHN0ciwgc2VwYXJhdG9yLCBsaW1pdCk7XG4gICAgfVxuICAgIHZhciBvdXRwdXQgPSBbXSxcbiAgICAgIGZsYWdzID0gKHNlcGFyYXRvci5pZ25vcmVDYXNlID8gXCJpXCIgOiBcIlwiKSArIChzZXBhcmF0b3IubXVsdGlsaW5lID8gXCJtXCIgOiBcIlwiKSArIChzZXBhcmF0b3IuZXh0ZW5kZWQgPyBcInhcIiA6IFwiXCIpICsgLy8gUHJvcG9zZWQgZm9yIEVTNlxuICAgICAgKHNlcGFyYXRvci5zdGlja3kgPyBcInlcIiA6IFwiXCIpLFxuICAgICAgLy8gRmlyZWZveCAzK1xuICAgICAgbGFzdExhc3RJbmRleCA9IDAsXG4gICAgICAvLyBNYWtlIGBnbG9iYWxgIGFuZCBhdm9pZCBgbGFzdEluZGV4YCBpc3N1ZXMgYnkgd29ya2luZyB3aXRoIGEgY29weVxuICAgICAgc2VwYXJhdG9yID0gbmV3IFJlZ0V4cChzZXBhcmF0b3Iuc291cmNlLCBmbGFncyArIFwiZ1wiKSxcbiAgICAgIHNlcGFyYXRvcjIsIG1hdGNoLCBsYXN0SW5kZXgsIGxhc3RMZW5ndGg7XG4gICAgc3RyICs9IFwiXCI7IC8vIFR5cGUtY29udmVydFxuICAgIGlmICghY29tcGxpYW50RXhlY05wY2cpIHtcbiAgICAgIC8vIERvZXNuJ3QgbmVlZCBmbGFncyBneSwgYnV0IHRoZXkgZG9uJ3QgaHVydFxuICAgICAgc2VwYXJhdG9yMiA9IG5ldyBSZWdFeHAoXCJeXCIgKyBzZXBhcmF0b3Iuc291cmNlICsgXCIkKD8hXFxcXHMpXCIsIGZsYWdzKTtcbiAgICB9XG4gICAgLyogVmFsdWVzIGZvciBgbGltaXRgLCBwZXIgdGhlIHNwZWM6XG4gICAgICogSWYgdW5kZWZpbmVkOiA0Mjk0OTY3Mjk1IC8vIE1hdGgucG93KDIsIDMyKSAtIDFcbiAgICAgKiBJZiAwLCBJbmZpbml0eSwgb3IgTmFOOiAwXG4gICAgICogSWYgcG9zaXRpdmUgbnVtYmVyOiBsaW1pdCA9IE1hdGguZmxvb3IobGltaXQpOyBpZiAobGltaXQgPiA0Mjk0OTY3Mjk1KSBsaW1pdCAtPSA0Mjk0OTY3Mjk2O1xuICAgICAqIElmIG5lZ2F0aXZlIG51bWJlcjogNDI5NDk2NzI5NiAtIE1hdGguZmxvb3IoTWF0aC5hYnMobGltaXQpKVxuICAgICAqIElmIG90aGVyOiBUeXBlLWNvbnZlcnQsIHRoZW4gdXNlIHRoZSBhYm92ZSBydWxlc1xuICAgICAqL1xuICAgIGxpbWl0ID0gbGltaXQgPT09IHVuZGVmID8gLTEgPj4+IDAgOiAvLyBNYXRoLnBvdygyLCAzMikgLSAxXG4gICAgbGltaXQgPj4+IDA7IC8vIFRvVWludDMyKGxpbWl0KVxuICAgIHdoaWxlIChtYXRjaCA9IHNlcGFyYXRvci5leGVjKHN0cikpIHtcbiAgICAgIC8vIGBzZXBhcmF0b3IubGFzdEluZGV4YCBpcyBub3QgcmVsaWFibGUgY3Jvc3MtYnJvd3NlclxuICAgICAgbGFzdEluZGV4ID0gbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGg7XG4gICAgICBpZiAobGFzdEluZGV4ID4gbGFzdExhc3RJbmRleCkge1xuICAgICAgICBvdXRwdXQucHVzaChzdHIuc2xpY2UobGFzdExhc3RJbmRleCwgbWF0Y2guaW5kZXgpKTtcbiAgICAgICAgLy8gRml4IGJyb3dzZXJzIHdob3NlIGBleGVjYCBtZXRob2RzIGRvbid0IGNvbnNpc3RlbnRseSByZXR1cm4gYHVuZGVmaW5lZGAgZm9yXG4gICAgICAgIC8vIG5vbnBhcnRpY2lwYXRpbmcgY2FwdHVyaW5nIGdyb3Vwc1xuICAgICAgICBpZiAoIWNvbXBsaWFudEV4ZWNOcGNnICYmIG1hdGNoLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICBtYXRjaFswXS5yZXBsYWNlKHNlcGFyYXRvcjIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoIC0gMjsgaSsrKSB7XG4gICAgICAgICAgICAgIGlmIChhcmd1bWVudHNbaV0gPT09IHVuZGVmKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2hbaV0gPSB1bmRlZjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtYXRjaC5sZW5ndGggPiAxICYmIG1hdGNoLmluZGV4IDwgc3RyLmxlbmd0aCkge1xuICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KG91dHB1dCwgbWF0Y2guc2xpY2UoMSkpO1xuICAgICAgICB9XG4gICAgICAgIGxhc3RMZW5ndGggPSBtYXRjaFswXS5sZW5ndGg7XG4gICAgICAgIGxhc3RMYXN0SW5kZXggPSBsYXN0SW5kZXg7XG4gICAgICAgIGlmIChvdXRwdXQubGVuZ3RoID49IGxpbWl0KSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzZXBhcmF0b3IubGFzdEluZGV4ID09PSBtYXRjaC5pbmRleCkge1xuICAgICAgICBzZXBhcmF0b3IubGFzdEluZGV4Kys7IC8vIEF2b2lkIGFuIGluZmluaXRlIGxvb3BcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGxhc3RMYXN0SW5kZXggPT09IHN0ci5sZW5ndGgpIHtcbiAgICAgIGlmIChsYXN0TGVuZ3RoIHx8ICFzZXBhcmF0b3IudGVzdChcIlwiKSkge1xuICAgICAgICBvdXRwdXQucHVzaChcIlwiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goc3RyLnNsaWNlKGxhc3RMYXN0SW5kZXgpKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dC5sZW5ndGggPiBsaW1pdCA/IG91dHB1dC5zbGljZSgwLCBsaW1pdCkgOiBvdXRwdXQ7XG4gIH07XG5cbiAgcmV0dXJuIHNlbGY7XG59KSgpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKmdsb2JhbCB3aW5kb3csIGdsb2JhbCovXG5cbnZhciByb290ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgP1xuICAgIHdpbmRvdyA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID9cbiAgICBnbG9iYWwgOiB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbmRpdmlkdWFsO1xuXG5mdW5jdGlvbiBJbmRpdmlkdWFsKGtleSwgdmFsdWUpIHtcbiAgICBpZiAoa2V5IGluIHJvb3QpIHtcbiAgICAgICAgcmV0dXJuIHJvb3Rba2V5XTtcbiAgICB9XG5cbiAgICByb290W2tleV0gPSB2YWx1ZTtcblxuICAgIHJldHVybiB2YWx1ZTtcbn1cbiIsInZhciB0b3BMZXZlbCA9IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDpcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHt9XG52YXIgbWluRG9jID0gcmVxdWlyZSgnbWluLWRvY3VtZW50Jyk7XG5cbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBkb2N1bWVudDtcbn0gZWxzZSB7XG4gICAgdmFyIGRvY2N5ID0gdG9wTGV2ZWxbJ19fR0xPQkFMX0RPQ1VNRU5UX0NBQ0hFQDQnXTtcblxuICAgIGlmICghZG9jY3kpIHtcbiAgICAgICAgZG9jY3kgPSB0b3BMZXZlbFsnX19HTE9CQUxfRE9DVU1FTlRfQ0FDSEVANCddID0gbWluRG9jO1xuICAgIH1cblxuICAgIG1vZHVsZS5leHBvcnRzID0gZG9jY3k7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc09iamVjdCh4KSB7XG5cdHJldHVybiB0eXBlb2YgeCA9PT0gXCJvYmplY3RcIiAmJiB4ICE9PSBudWxsO1xufTtcbiIsInZhciBuYXRpdmVJc0FycmF5ID0gQXJyYXkuaXNBcnJheVxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5hdGl2ZUlzQXJyYXkgfHwgaXNBcnJheVxuXG5mdW5jdGlvbiBpc0FycmF5KG9iaikge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09IFwiW29iamVjdCBBcnJheV1cIlxufVxuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZShcImlzLW9iamVjdFwiKVxudmFyIGlzSG9vayA9IHJlcXVpcmUoXCIuLi92bm9kZS9pcy12aG9vay5qc1wiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFwcGx5UHJvcGVydGllc1xuXG5mdW5jdGlvbiBhcHBseVByb3BlcnRpZXMobm9kZSwgcHJvcHMsIHByZXZpb3VzKSB7XG4gICAgZm9yICh2YXIgcHJvcE5hbWUgaW4gcHJvcHMpIHtcbiAgICAgICAgdmFyIHByb3BWYWx1ZSA9IHByb3BzW3Byb3BOYW1lXVxuXG4gICAgICAgIGlmIChwcm9wVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmVtb3ZlUHJvcGVydHkobm9kZSwgcHJvcE5hbWUsIHByb3BWYWx1ZSwgcHJldmlvdXMpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzSG9vayhwcm9wVmFsdWUpKSB7XG4gICAgICAgICAgICByZW1vdmVQcm9wZXJ0eShub2RlLCBwcm9wTmFtZSwgcHJvcFZhbHVlLCBwcmV2aW91cylcbiAgICAgICAgICAgIGlmIChwcm9wVmFsdWUuaG9vaykge1xuICAgICAgICAgICAgICAgIHByb3BWYWx1ZS5ob29rKG5vZGUsXG4gICAgICAgICAgICAgICAgICAgIHByb3BOYW1lLFxuICAgICAgICAgICAgICAgICAgICBwcmV2aW91cyA/IHByZXZpb3VzW3Byb3BOYW1lXSA6IHVuZGVmaW5lZClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpc09iamVjdChwcm9wVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hPYmplY3Qobm9kZSwgcHJvcHMsIHByZXZpb3VzLCBwcm9wTmFtZSwgcHJvcFZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbm9kZVtwcm9wTmFtZV0gPSBwcm9wVmFsdWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlUHJvcGVydHkobm9kZSwgcHJvcE5hbWUsIHByb3BWYWx1ZSwgcHJldmlvdXMpIHtcbiAgICBpZiAocHJldmlvdXMpIHtcbiAgICAgICAgdmFyIHByZXZpb3VzVmFsdWUgPSBwcmV2aW91c1twcm9wTmFtZV1cblxuICAgICAgICBpZiAoIWlzSG9vayhwcmV2aW91c1ZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKHByb3BOYW1lID09PSBcImF0dHJpYnV0ZXNcIikge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGF0dHJOYW1lIGluIHByZXZpb3VzVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoYXR0ck5hbWUpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9wTmFtZSA9PT0gXCJzdHlsZVwiKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBwcmV2aW91c1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuc3R5bGVbaV0gPSBcIlwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcHJldmlvdXNWYWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIG5vZGVbcHJvcE5hbWVdID0gXCJcIlxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBub2RlW3Byb3BOYW1lXSA9IG51bGxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChwcmV2aW91c1ZhbHVlLnVuaG9vaykge1xuICAgICAgICAgICAgcHJldmlvdXNWYWx1ZS51bmhvb2sobm9kZSwgcHJvcE5hbWUsIHByb3BWYWx1ZSlcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcGF0Y2hPYmplY3Qobm9kZSwgcHJvcHMsIHByZXZpb3VzLCBwcm9wTmFtZSwgcHJvcFZhbHVlKSB7XG4gICAgdmFyIHByZXZpb3VzVmFsdWUgPSBwcmV2aW91cyA/IHByZXZpb3VzW3Byb3BOYW1lXSA6IHVuZGVmaW5lZFxuXG4gICAgLy8gU2V0IGF0dHJpYnV0ZXNcbiAgICBpZiAocHJvcE5hbWUgPT09IFwiYXR0cmlidXRlc1wiKSB7XG4gICAgICAgIGZvciAodmFyIGF0dHJOYW1lIGluIHByb3BWYWx1ZSkge1xuICAgICAgICAgICAgdmFyIGF0dHJWYWx1ZSA9IHByb3BWYWx1ZVthdHRyTmFtZV1cblxuICAgICAgICAgICAgaWYgKGF0dHJWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoYXR0ck5hbWUpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCBhdHRyVmFsdWUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZihwcmV2aW91c1ZhbHVlICYmIGlzT2JqZWN0KHByZXZpb3VzVmFsdWUpICYmXG4gICAgICAgIGdldFByb3RvdHlwZShwcmV2aW91c1ZhbHVlKSAhPT0gZ2V0UHJvdG90eXBlKHByb3BWYWx1ZSkpIHtcbiAgICAgICAgbm9kZVtwcm9wTmFtZV0gPSBwcm9wVmFsdWVcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKCFpc09iamVjdChub2RlW3Byb3BOYW1lXSkpIHtcbiAgICAgICAgbm9kZVtwcm9wTmFtZV0gPSB7fVxuICAgIH1cblxuICAgIHZhciByZXBsYWNlciA9IHByb3BOYW1lID09PSBcInN0eWxlXCIgPyBcIlwiIDogdW5kZWZpbmVkXG5cbiAgICBmb3IgKHZhciBrIGluIHByb3BWYWx1ZSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBwcm9wVmFsdWVba11cbiAgICAgICAgbm9kZVtwcm9wTmFtZV1ba10gPSAodmFsdWUgPT09IHVuZGVmaW5lZCkgPyByZXBsYWNlciA6IHZhbHVlXG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRQcm90b3R5cGUodmFsdWUpIHtcbiAgICBpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpXG4gICAgfSBlbHNlIGlmICh2YWx1ZS5fX3Byb3RvX18pIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLl9fcHJvdG9fX1xuICAgIH0gZWxzZSBpZiAodmFsdWUuY29uc3RydWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZVxuICAgIH1cbn1cbiIsInZhciBkb2N1bWVudCA9IHJlcXVpcmUoXCJnbG9iYWwvZG9jdW1lbnRcIilcblxudmFyIGFwcGx5UHJvcGVydGllcyA9IHJlcXVpcmUoXCIuL2FwcGx5LXByb3BlcnRpZXNcIilcblxudmFyIGlzVk5vZGUgPSByZXF1aXJlKFwiLi4vdm5vZGUvaXMtdm5vZGUuanNcIilcbnZhciBpc1ZUZXh0ID0gcmVxdWlyZShcIi4uL3Zub2RlL2lzLXZ0ZXh0LmpzXCIpXG52YXIgaXNXaWRnZXQgPSByZXF1aXJlKFwiLi4vdm5vZGUvaXMtd2lkZ2V0LmpzXCIpXG52YXIgaGFuZGxlVGh1bmsgPSByZXF1aXJlKFwiLi4vdm5vZGUvaGFuZGxlLXRodW5rLmpzXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlRWxlbWVudFxuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50KHZub2RlLCBvcHRzKSB7XG4gICAgdmFyIGRvYyA9IG9wdHMgPyBvcHRzLmRvY3VtZW50IHx8IGRvY3VtZW50IDogZG9jdW1lbnRcbiAgICB2YXIgd2FybiA9IG9wdHMgPyBvcHRzLndhcm4gOiBudWxsXG5cbiAgICB2bm9kZSA9IGhhbmRsZVRodW5rKHZub2RlKS5hXG5cbiAgICBpZiAoaXNXaWRnZXQodm5vZGUpKSB7XG4gICAgICAgIHJldHVybiB2bm9kZS5pbml0KClcbiAgICB9IGVsc2UgaWYgKGlzVlRleHQodm5vZGUpKSB7XG4gICAgICAgIHJldHVybiBkb2MuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dClcbiAgICB9IGVsc2UgaWYgKCFpc1ZOb2RlKHZub2RlKSkge1xuICAgICAgICBpZiAod2Fybikge1xuICAgICAgICAgICAgd2FybihcIkl0ZW0gaXMgbm90IGEgdmFsaWQgdmlydHVhbCBkb20gbm9kZVwiLCB2bm9kZSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIHZhciBub2RlID0gKHZub2RlLm5hbWVzcGFjZSA9PT0gbnVsbCkgP1xuICAgICAgICBkb2MuY3JlYXRlRWxlbWVudCh2bm9kZS50YWdOYW1lKSA6XG4gICAgICAgIGRvYy5jcmVhdGVFbGVtZW50TlModm5vZGUubmFtZXNwYWNlLCB2bm9kZS50YWdOYW1lKVxuXG4gICAgdmFyIHByb3BzID0gdm5vZGUucHJvcGVydGllc1xuICAgIGFwcGx5UHJvcGVydGllcyhub2RlLCBwcm9wcylcblxuICAgIHZhciBjaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGlsZE5vZGUgPSBjcmVhdGVFbGVtZW50KGNoaWxkcmVuW2ldLCBvcHRzKVxuICAgICAgICBpZiAoY2hpbGROb2RlKSB7XG4gICAgICAgICAgICBub2RlLmFwcGVuZENoaWxkKGNoaWxkTm9kZSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBub2RlXG59XG4iLCIvLyBNYXBzIGEgdmlydHVhbCBET00gdHJlZSBvbnRvIGEgcmVhbCBET00gdHJlZSBpbiBhbiBlZmZpY2llbnQgbWFubmVyLlxuLy8gV2UgZG9uJ3Qgd2FudCB0byByZWFkIGFsbCBvZiB0aGUgRE9NIG5vZGVzIGluIHRoZSB0cmVlIHNvIHdlIHVzZVxuLy8gdGhlIGluLW9yZGVyIHRyZWUgaW5kZXhpbmcgdG8gZWxpbWluYXRlIHJlY3Vyc2lvbiBkb3duIGNlcnRhaW4gYnJhbmNoZXMuXG4vLyBXZSBvbmx5IHJlY3Vyc2UgaW50byBhIERPTSBub2RlIGlmIHdlIGtub3cgdGhhdCBpdCBjb250YWlucyBhIGNoaWxkIG9mXG4vLyBpbnRlcmVzdC5cblxudmFyIG5vQ2hpbGQgPSB7fVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRvbUluZGV4XG5cbmZ1bmN0aW9uIGRvbUluZGV4KHJvb3ROb2RlLCB0cmVlLCBpbmRpY2VzLCBub2Rlcykge1xuICAgIGlmICghaW5kaWNlcyB8fCBpbmRpY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4ge31cbiAgICB9IGVsc2Uge1xuICAgICAgICBpbmRpY2VzLnNvcnQoYXNjZW5kaW5nKVxuICAgICAgICByZXR1cm4gcmVjdXJzZShyb290Tm9kZSwgdHJlZSwgaW5kaWNlcywgbm9kZXMsIDApXG4gICAgfVxufVxuXG5mdW5jdGlvbiByZWN1cnNlKHJvb3ROb2RlLCB0cmVlLCBpbmRpY2VzLCBub2Rlcywgcm9vdEluZGV4KSB7XG4gICAgbm9kZXMgPSBub2RlcyB8fCB7fVxuXG5cbiAgICBpZiAocm9vdE5vZGUpIHtcbiAgICAgICAgaWYgKGluZGV4SW5SYW5nZShpbmRpY2VzLCByb290SW5kZXgsIHJvb3RJbmRleCkpIHtcbiAgICAgICAgICAgIG5vZGVzW3Jvb3RJbmRleF0gPSByb290Tm9kZVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHZDaGlsZHJlbiA9IHRyZWUuY2hpbGRyZW5cblxuICAgICAgICBpZiAodkNoaWxkcmVuKSB7XG5cbiAgICAgICAgICAgIHZhciBjaGlsZE5vZGVzID0gcm9vdE5vZGUuY2hpbGROb2Rlc1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRyZWUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICByb290SW5kZXggKz0gMVxuXG4gICAgICAgICAgICAgICAgdmFyIHZDaGlsZCA9IHZDaGlsZHJlbltpXSB8fCBub0NoaWxkXG4gICAgICAgICAgICAgICAgdmFyIG5leHRJbmRleCA9IHJvb3RJbmRleCArICh2Q2hpbGQuY291bnQgfHwgMClcblxuICAgICAgICAgICAgICAgIC8vIHNraXAgcmVjdXJzaW9uIGRvd24gdGhlIHRyZWUgaWYgdGhlcmUgYXJlIG5vIG5vZGVzIGRvd24gaGVyZVxuICAgICAgICAgICAgICAgIGlmIChpbmRleEluUmFuZ2UoaW5kaWNlcywgcm9vdEluZGV4LCBuZXh0SW5kZXgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlY3Vyc2UoY2hpbGROb2Rlc1tpXSwgdkNoaWxkLCBpbmRpY2VzLCBub2Rlcywgcm9vdEluZGV4KVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJvb3RJbmRleCA9IG5leHRJbmRleFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vZGVzXG59XG5cbi8vIEJpbmFyeSBzZWFyY2ggZm9yIGFuIGluZGV4IGluIHRoZSBpbnRlcnZhbCBbbGVmdCwgcmlnaHRdXG5mdW5jdGlvbiBpbmRleEluUmFuZ2UoaW5kaWNlcywgbGVmdCwgcmlnaHQpIHtcbiAgICBpZiAoaW5kaWNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgdmFyIG1pbkluZGV4ID0gMFxuICAgIHZhciBtYXhJbmRleCA9IGluZGljZXMubGVuZ3RoIC0gMVxuICAgIHZhciBjdXJyZW50SW5kZXhcbiAgICB2YXIgY3VycmVudEl0ZW1cblxuICAgIHdoaWxlIChtaW5JbmRleCA8PSBtYXhJbmRleCkge1xuICAgICAgICBjdXJyZW50SW5kZXggPSAoKG1heEluZGV4ICsgbWluSW5kZXgpIC8gMikgPj4gMFxuICAgICAgICBjdXJyZW50SXRlbSA9IGluZGljZXNbY3VycmVudEluZGV4XVxuXG4gICAgICAgIGlmIChtaW5JbmRleCA9PT0gbWF4SW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50SXRlbSA+PSBsZWZ0ICYmIGN1cnJlbnRJdGVtIDw9IHJpZ2h0XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudEl0ZW0gPCBsZWZ0KSB7XG4gICAgICAgICAgICBtaW5JbmRleCA9IGN1cnJlbnRJbmRleCArIDFcbiAgICAgICAgfSBlbHNlICBpZiAoY3VycmVudEl0ZW0gPiByaWdodCkge1xuICAgICAgICAgICAgbWF4SW5kZXggPSBjdXJyZW50SW5kZXggLSAxXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBhc2NlbmRpbmcoYSwgYikge1xuICAgIHJldHVybiBhID4gYiA/IDEgOiAtMVxufVxuIiwidmFyIGFwcGx5UHJvcGVydGllcyA9IHJlcXVpcmUoXCIuL2FwcGx5LXByb3BlcnRpZXNcIilcblxudmFyIGlzV2lkZ2V0ID0gcmVxdWlyZShcIi4uL3Zub2RlL2lzLXdpZGdldC5qc1wiKVxudmFyIFZQYXRjaCA9IHJlcXVpcmUoXCIuLi92bm9kZS92cGF0Y2guanNcIilcblxudmFyIHJlbmRlciA9IHJlcXVpcmUoXCIuL2NyZWF0ZS1lbGVtZW50XCIpXG52YXIgdXBkYXRlV2lkZ2V0ID0gcmVxdWlyZShcIi4vdXBkYXRlLXdpZGdldFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFwcGx5UGF0Y2hcblxuZnVuY3Rpb24gYXBwbHlQYXRjaCh2cGF0Y2gsIGRvbU5vZGUsIHJlbmRlck9wdGlvbnMpIHtcbiAgICB2YXIgdHlwZSA9IHZwYXRjaC50eXBlXG4gICAgdmFyIHZOb2RlID0gdnBhdGNoLnZOb2RlXG4gICAgdmFyIHBhdGNoID0gdnBhdGNoLnBhdGNoXG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSBWUGF0Y2guUkVNT1ZFOlxuICAgICAgICAgICAgcmV0dXJuIHJlbW92ZU5vZGUoZG9tTm9kZSwgdk5vZGUpXG4gICAgICAgIGNhc2UgVlBhdGNoLklOU0VSVDpcbiAgICAgICAgICAgIHJldHVybiBpbnNlcnROb2RlKGRvbU5vZGUsIHBhdGNoLCByZW5kZXJPcHRpb25zKVxuICAgICAgICBjYXNlIFZQYXRjaC5WVEVYVDpcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmdQYXRjaChkb21Ob2RlLCB2Tm9kZSwgcGF0Y2gsIHJlbmRlck9wdGlvbnMpXG4gICAgICAgIGNhc2UgVlBhdGNoLldJREdFVDpcbiAgICAgICAgICAgIHJldHVybiB3aWRnZXRQYXRjaChkb21Ob2RlLCB2Tm9kZSwgcGF0Y2gsIHJlbmRlck9wdGlvbnMpXG4gICAgICAgIGNhc2UgVlBhdGNoLlZOT0RFOlxuICAgICAgICAgICAgcmV0dXJuIHZOb2RlUGF0Y2goZG9tTm9kZSwgdk5vZGUsIHBhdGNoLCByZW5kZXJPcHRpb25zKVxuICAgICAgICBjYXNlIFZQYXRjaC5PUkRFUjpcbiAgICAgICAgICAgIHJlb3JkZXJDaGlsZHJlbihkb21Ob2RlLCBwYXRjaClcbiAgICAgICAgICAgIHJldHVybiBkb21Ob2RlXG4gICAgICAgIGNhc2UgVlBhdGNoLlBST1BTOlxuICAgICAgICAgICAgYXBwbHlQcm9wZXJ0aWVzKGRvbU5vZGUsIHBhdGNoLCB2Tm9kZS5wcm9wZXJ0aWVzKVxuICAgICAgICAgICAgcmV0dXJuIGRvbU5vZGVcbiAgICAgICAgY2FzZSBWUGF0Y2guVEhVTks6XG4gICAgICAgICAgICByZXR1cm4gcmVwbGFjZVJvb3QoZG9tTm9kZSxcbiAgICAgICAgICAgICAgICByZW5kZXJPcHRpb25zLnBhdGNoKGRvbU5vZGUsIHBhdGNoLCByZW5kZXJPcHRpb25zKSlcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBkb21Ob2RlXG4gICAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVOb2RlKGRvbU5vZGUsIHZOb2RlKSB7XG4gICAgdmFyIHBhcmVudE5vZGUgPSBkb21Ob2RlLnBhcmVudE5vZGVcblxuICAgIGlmIChwYXJlbnROb2RlKSB7XG4gICAgICAgIHBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZG9tTm9kZSlcbiAgICB9XG5cbiAgICBkZXN0cm95V2lkZ2V0KGRvbU5vZGUsIHZOb2RlKTtcblxuICAgIHJldHVybiBudWxsXG59XG5cbmZ1bmN0aW9uIGluc2VydE5vZGUocGFyZW50Tm9kZSwgdk5vZGUsIHJlbmRlck9wdGlvbnMpIHtcbiAgICB2YXIgbmV3Tm9kZSA9IHJlbmRlcih2Tm9kZSwgcmVuZGVyT3B0aW9ucylcblxuICAgIGlmIChwYXJlbnROb2RlKSB7XG4gICAgICAgIHBhcmVudE5vZGUuYXBwZW5kQ2hpbGQobmV3Tm9kZSlcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyZW50Tm9kZVxufVxuXG5mdW5jdGlvbiBzdHJpbmdQYXRjaChkb21Ob2RlLCBsZWZ0Vk5vZGUsIHZUZXh0LCByZW5kZXJPcHRpb25zKSB7XG4gICAgdmFyIG5ld05vZGVcblxuICAgIGlmIChkb21Ob2RlLm5vZGVUeXBlID09PSAzKSB7XG4gICAgICAgIGRvbU5vZGUucmVwbGFjZURhdGEoMCwgZG9tTm9kZS5sZW5ndGgsIHZUZXh0LnRleHQpXG4gICAgICAgIG5ld05vZGUgPSBkb21Ob2RlXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHBhcmVudE5vZGUgPSBkb21Ob2RlLnBhcmVudE5vZGVcbiAgICAgICAgbmV3Tm9kZSA9IHJlbmRlcih2VGV4dCwgcmVuZGVyT3B0aW9ucylcblxuICAgICAgICBpZiAocGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgcGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobmV3Tm9kZSwgZG9tTm9kZSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXdOb2RlXG59XG5cbmZ1bmN0aW9uIHdpZGdldFBhdGNoKGRvbU5vZGUsIGxlZnRWTm9kZSwgd2lkZ2V0LCByZW5kZXJPcHRpb25zKSB7XG4gICAgdmFyIHVwZGF0aW5nID0gdXBkYXRlV2lkZ2V0KGxlZnRWTm9kZSwgd2lkZ2V0KVxuICAgIHZhciBuZXdOb2RlXG5cbiAgICBpZiAodXBkYXRpbmcpIHtcbiAgICAgICAgbmV3Tm9kZSA9IHdpZGdldC51cGRhdGUobGVmdFZOb2RlLCBkb21Ob2RlKSB8fCBkb21Ob2RlXG4gICAgfSBlbHNlIHtcbiAgICAgICAgbmV3Tm9kZSA9IHJlbmRlcih3aWRnZXQsIHJlbmRlck9wdGlvbnMpXG4gICAgfVxuXG4gICAgdmFyIHBhcmVudE5vZGUgPSBkb21Ob2RlLnBhcmVudE5vZGVcblxuICAgIGlmIChwYXJlbnROb2RlICYmIG5ld05vZGUgIT09IGRvbU5vZGUpIHtcbiAgICAgICAgcGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobmV3Tm9kZSwgZG9tTm9kZSlcbiAgICB9XG5cbiAgICBpZiAoIXVwZGF0aW5nKSB7XG4gICAgICAgIGRlc3Ryb3lXaWRnZXQoZG9tTm9kZSwgbGVmdFZOb2RlKVxuICAgIH1cblxuICAgIHJldHVybiBuZXdOb2RlXG59XG5cbmZ1bmN0aW9uIHZOb2RlUGF0Y2goZG9tTm9kZSwgbGVmdFZOb2RlLCB2Tm9kZSwgcmVuZGVyT3B0aW9ucykge1xuICAgIHZhciBwYXJlbnROb2RlID0gZG9tTm9kZS5wYXJlbnROb2RlXG4gICAgdmFyIG5ld05vZGUgPSByZW5kZXIodk5vZGUsIHJlbmRlck9wdGlvbnMpXG5cbiAgICBpZiAocGFyZW50Tm9kZSkge1xuICAgICAgICBwYXJlbnROb2RlLnJlcGxhY2VDaGlsZChuZXdOb2RlLCBkb21Ob2RlKVxuICAgIH1cblxuICAgIHJldHVybiBuZXdOb2RlXG59XG5cbmZ1bmN0aW9uIGRlc3Ryb3lXaWRnZXQoZG9tTm9kZSwgdykge1xuICAgIGlmICh0eXBlb2Ygdy5kZXN0cm95ID09PSBcImZ1bmN0aW9uXCIgJiYgaXNXaWRnZXQodykpIHtcbiAgICAgICAgdy5kZXN0cm95KGRvbU5vZGUpXG4gICAgfVxufVxuXG5mdW5jdGlvbiByZW9yZGVyQ2hpbGRyZW4oZG9tTm9kZSwgYkluZGV4KSB7XG4gICAgdmFyIGNoaWxkcmVuID0gW11cbiAgICB2YXIgY2hpbGROb2RlcyA9IGRvbU5vZGUuY2hpbGROb2Rlc1xuICAgIHZhciBsZW4gPSBjaGlsZE5vZGVzLmxlbmd0aFxuICAgIHZhciBpXG4gICAgdmFyIHJldmVyc2VJbmRleCA9IGJJbmRleC5yZXZlcnNlXG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgY2hpbGRyZW4ucHVzaChkb21Ob2RlLmNoaWxkTm9kZXNbaV0pXG4gICAgfVxuXG4gICAgdmFyIGluc2VydE9mZnNldCA9IDBcbiAgICB2YXIgbW92ZVxuICAgIHZhciBub2RlXG4gICAgdmFyIGluc2VydE5vZGVcbiAgICB2YXIgY2hhaW5MZW5ndGhcbiAgICB2YXIgaW5zZXJ0ZWRMZW5ndGhcbiAgICB2YXIgbmV4dFNpYmxpbmdcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOykge1xuICAgICAgICBtb3ZlID0gYkluZGV4W2ldXG4gICAgICAgIGNoYWluTGVuZ3RoID0gMVxuICAgICAgICBpZiAobW92ZSAhPT0gdW5kZWZpbmVkICYmIG1vdmUgIT09IGkpIHtcbiAgICAgICAgICAgIC8vIHRyeSB0byBicmluZyBmb3J3YXJkIGFzIGxvbmcgb2YgYSBjaGFpbiBhcyBwb3NzaWJsZVxuICAgICAgICAgICAgd2hpbGUgKGJJbmRleFtpICsgY2hhaW5MZW5ndGhdID09PSBtb3ZlICsgY2hhaW5MZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjaGFpbkxlbmd0aCsrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB0aGUgZWxlbWVudCBjdXJyZW50bHkgYXQgdGhpcyBpbmRleCB3aWxsIGJlIG1vdmVkIGxhdGVyIHNvIGluY3JlYXNlIHRoZSBpbnNlcnQgb2Zmc2V0XG4gICAgICAgICAgICBpZiAocmV2ZXJzZUluZGV4W2ldID4gaSArIGNoYWluTGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaW5zZXJ0T2Zmc2V0KytcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbm9kZSA9IGNoaWxkcmVuW21vdmVdXG4gICAgICAgICAgICBpbnNlcnROb2RlID0gY2hpbGROb2Rlc1tpICsgaW5zZXJ0T2Zmc2V0XSB8fCBudWxsXG4gICAgICAgICAgICBpbnNlcnRlZExlbmd0aCA9IDBcbiAgICAgICAgICAgIHdoaWxlIChub2RlICE9PSBpbnNlcnROb2RlICYmIGluc2VydGVkTGVuZ3RoKysgPCBjaGFpbkxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGRvbU5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIGluc2VydE5vZGUpO1xuICAgICAgICAgICAgICAgIG5vZGUgPSBjaGlsZHJlblttb3ZlICsgaW5zZXJ0ZWRMZW5ndGhdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB0aGUgbW92ZWQgZWxlbWVudCBjYW1lIGZyb20gdGhlIGZyb250IG9mIHRoZSBhcnJheSBzbyByZWR1Y2UgdGhlIGluc2VydCBvZmZzZXRcbiAgICAgICAgICAgIGlmIChtb3ZlICsgY2hhaW5MZW5ndGggPCBpKSB7XG4gICAgICAgICAgICAgICAgaW5zZXJ0T2Zmc2V0LS1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGVsZW1lbnQgYXQgdGhpcyBpbmRleCBpcyBzY2hlZHVsZWQgdG8gYmUgcmVtb3ZlZCBzbyBpbmNyZWFzZSBpbnNlcnQgb2Zmc2V0XG4gICAgICAgIGlmIChpIGluIGJJbmRleC5yZW1vdmVzKSB7XG4gICAgICAgICAgICBpbnNlcnRPZmZzZXQrK1xuICAgICAgICB9XG5cbiAgICAgICAgaSArPSBjaGFpbkxlbmd0aFxuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVwbGFjZVJvb3Qob2xkUm9vdCwgbmV3Um9vdCkge1xuICAgIGlmIChvbGRSb290ICYmIG5ld1Jvb3QgJiYgb2xkUm9vdCAhPT0gbmV3Um9vdCAmJiBvbGRSb290LnBhcmVudE5vZGUpIHtcbiAgICAgICAgY29uc29sZS5sb2cob2xkUm9vdClcbiAgICAgICAgb2xkUm9vdC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChuZXdSb290LCBvbGRSb290KVxuICAgIH1cblxuICAgIHJldHVybiBuZXdSb290O1xufVxuIiwidmFyIGRvY3VtZW50ID0gcmVxdWlyZShcImdsb2JhbC9kb2N1bWVudFwiKVxudmFyIGlzQXJyYXkgPSByZXF1aXJlKFwieC1pcy1hcnJheVwiKVxuXG52YXIgZG9tSW5kZXggPSByZXF1aXJlKFwiLi9kb20taW5kZXhcIilcbnZhciBwYXRjaE9wID0gcmVxdWlyZShcIi4vcGF0Y2gtb3BcIilcbm1vZHVsZS5leHBvcnRzID0gcGF0Y2hcblxuZnVuY3Rpb24gcGF0Y2gocm9vdE5vZGUsIHBhdGNoZXMpIHtcbiAgICByZXR1cm4gcGF0Y2hSZWN1cnNpdmUocm9vdE5vZGUsIHBhdGNoZXMpXG59XG5cbmZ1bmN0aW9uIHBhdGNoUmVjdXJzaXZlKHJvb3ROb2RlLCBwYXRjaGVzLCByZW5kZXJPcHRpb25zKSB7XG4gICAgdmFyIGluZGljZXMgPSBwYXRjaEluZGljZXMocGF0Y2hlcylcblxuICAgIGlmIChpbmRpY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gcm9vdE5vZGVcbiAgICB9XG5cbiAgICB2YXIgaW5kZXggPSBkb21JbmRleChyb290Tm9kZSwgcGF0Y2hlcy5hLCBpbmRpY2VzKVxuICAgIHZhciBvd25lckRvY3VtZW50ID0gcm9vdE5vZGUub3duZXJEb2N1bWVudFxuXG4gICAgaWYgKCFyZW5kZXJPcHRpb25zKSB7XG4gICAgICAgIHJlbmRlck9wdGlvbnMgPSB7IHBhdGNoOiBwYXRjaFJlY3Vyc2l2ZSB9XG4gICAgICAgIGlmIChvd25lckRvY3VtZW50ICE9PSBkb2N1bWVudCkge1xuICAgICAgICAgICAgcmVuZGVyT3B0aW9ucy5kb2N1bWVudCA9IG93bmVyRG9jdW1lbnRcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5kaWNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbm9kZUluZGV4ID0gaW5kaWNlc1tpXVxuICAgICAgICByb290Tm9kZSA9IGFwcGx5UGF0Y2gocm9vdE5vZGUsXG4gICAgICAgICAgICBpbmRleFtub2RlSW5kZXhdLFxuICAgICAgICAgICAgcGF0Y2hlc1tub2RlSW5kZXhdLFxuICAgICAgICAgICAgcmVuZGVyT3B0aW9ucylcbiAgICB9XG5cbiAgICByZXR1cm4gcm9vdE5vZGVcbn1cblxuZnVuY3Rpb24gYXBwbHlQYXRjaChyb290Tm9kZSwgZG9tTm9kZSwgcGF0Y2hMaXN0LCByZW5kZXJPcHRpb25zKSB7XG4gICAgaWYgKCFkb21Ob2RlKSB7XG4gICAgICAgIHJldHVybiByb290Tm9kZVxuICAgIH1cblxuICAgIHZhciBuZXdOb2RlXG5cbiAgICBpZiAoaXNBcnJheShwYXRjaExpc3QpKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0Y2hMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBuZXdOb2RlID0gcGF0Y2hPcChwYXRjaExpc3RbaV0sIGRvbU5vZGUsIHJlbmRlck9wdGlvbnMpXG5cbiAgICAgICAgICAgIGlmIChkb21Ob2RlID09PSByb290Tm9kZSkge1xuICAgICAgICAgICAgICAgIHJvb3ROb2RlID0gbmV3Tm9kZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbmV3Tm9kZSA9IHBhdGNoT3AocGF0Y2hMaXN0LCBkb21Ob2RlLCByZW5kZXJPcHRpb25zKVxuXG4gICAgICAgIGlmIChkb21Ob2RlID09PSByb290Tm9kZSkge1xuICAgICAgICAgICAgcm9vdE5vZGUgPSBuZXdOb2RlXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcm9vdE5vZGVcbn1cblxuZnVuY3Rpb24gcGF0Y2hJbmRpY2VzKHBhdGNoZXMpIHtcbiAgICB2YXIgaW5kaWNlcyA9IFtdXG5cbiAgICBmb3IgKHZhciBrZXkgaW4gcGF0Y2hlcykge1xuICAgICAgICBpZiAoa2V5ICE9PSBcImFcIikge1xuICAgICAgICAgICAgaW5kaWNlcy5wdXNoKE51bWJlcihrZXkpKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGluZGljZXNcbn1cbiIsInZhciBpc1dpZGdldCA9IHJlcXVpcmUoXCIuLi92bm9kZS9pcy13aWRnZXQuanNcIilcblxubW9kdWxlLmV4cG9ydHMgPSB1cGRhdGVXaWRnZXRcblxuZnVuY3Rpb24gdXBkYXRlV2lkZ2V0KGEsIGIpIHtcbiAgICBpZiAoaXNXaWRnZXQoYSkgJiYgaXNXaWRnZXQoYikpIHtcbiAgICAgICAgaWYgKFwibmFtZVwiIGluIGEgJiYgXCJuYW1lXCIgaW4gYikge1xuICAgICAgICAgICAgcmV0dXJuIGEuaWQgPT09IGIuaWRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBhLmluaXQgPT09IGIuaW5pdFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBFdlN0b3JlID0gcmVxdWlyZSgnZXYtc3RvcmUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBFdkhvb2s7XG5cbmZ1bmN0aW9uIEV2SG9vayh2YWx1ZSkge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBFdkhvb2spKSB7XG4gICAgICAgIHJldHVybiBuZXcgRXZIb29rKHZhbHVlKTtcbiAgICB9XG5cbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG59XG5cbkV2SG9vay5wcm90b3R5cGUuaG9vayA9IGZ1bmN0aW9uIChub2RlLCBwcm9wZXJ0eU5hbWUpIHtcbiAgICB2YXIgZXMgPSBFdlN0b3JlKG5vZGUpO1xuICAgIHZhciBwcm9wTmFtZSA9IHByb3BlcnR5TmFtZS5zdWJzdHIoMyk7XG5cbiAgICBlc1twcm9wTmFtZV0gPSB0aGlzLnZhbHVlO1xufTtcblxuRXZIb29rLnByb3RvdHlwZS51bmhvb2sgPSBmdW5jdGlvbihub2RlLCBwcm9wZXJ0eU5hbWUpIHtcbiAgICB2YXIgZXMgPSBFdlN0b3JlKG5vZGUpO1xuICAgIHZhciBwcm9wTmFtZSA9IHByb3BlcnR5TmFtZS5zdWJzdHIoMyk7XG5cbiAgICBlc1twcm9wTmFtZV0gPSB1bmRlZmluZWQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNvZnRTZXRIb29rO1xuXG5mdW5jdGlvbiBTb2Z0U2V0SG9vayh2YWx1ZSkge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBTb2Z0U2V0SG9vaykpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTb2Z0U2V0SG9vayh2YWx1ZSk7XG4gICAgfVxuXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xufVxuXG5Tb2Z0U2V0SG9vay5wcm90b3R5cGUuaG9vayA9IGZ1bmN0aW9uIChub2RlLCBwcm9wZXJ0eU5hbWUpIHtcbiAgICBpZiAobm9kZVtwcm9wZXJ0eU5hbWVdICE9PSB0aGlzLnZhbHVlKSB7XG4gICAgICAgIG5vZGVbcHJvcGVydHlOYW1lXSA9IHRoaXMudmFsdWU7XG4gICAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGlzQXJyYXkgPSByZXF1aXJlKCd4LWlzLWFycmF5Jyk7XG5cbnZhciBWTm9kZSA9IHJlcXVpcmUoJy4uL3Zub2RlL3Zub2RlLmpzJyk7XG52YXIgVlRleHQgPSByZXF1aXJlKCcuLi92bm9kZS92dGV4dC5qcycpO1xudmFyIGlzVk5vZGUgPSByZXF1aXJlKCcuLi92bm9kZS9pcy12bm9kZScpO1xudmFyIGlzVlRleHQgPSByZXF1aXJlKCcuLi92bm9kZS9pcy12dGV4dCcpO1xudmFyIGlzV2lkZ2V0ID0gcmVxdWlyZSgnLi4vdm5vZGUvaXMtd2lkZ2V0Jyk7XG52YXIgaXNIb29rID0gcmVxdWlyZSgnLi4vdm5vZGUvaXMtdmhvb2snKTtcbnZhciBpc1ZUaHVuayA9IHJlcXVpcmUoJy4uL3Zub2RlL2lzLXRodW5rJyk7XG5cbnZhciBwYXJzZVRhZyA9IHJlcXVpcmUoJy4vcGFyc2UtdGFnLmpzJyk7XG52YXIgc29mdFNldEhvb2sgPSByZXF1aXJlKCcuL2hvb2tzL3NvZnQtc2V0LWhvb2suanMnKTtcbnZhciBldkhvb2sgPSByZXF1aXJlKCcuL2hvb2tzL2V2LWhvb2suanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBoO1xuXG5mdW5jdGlvbiBoKHRhZ05hbWUsIHByb3BlcnRpZXMsIGNoaWxkcmVuKSB7XG4gICAgdmFyIGNoaWxkTm9kZXMgPSBbXTtcbiAgICB2YXIgdGFnLCBwcm9wcywga2V5LCBuYW1lc3BhY2U7XG5cbiAgICBpZiAoIWNoaWxkcmVuICYmIGlzQ2hpbGRyZW4ocHJvcGVydGllcykpIHtcbiAgICAgICAgY2hpbGRyZW4gPSBwcm9wZXJ0aWVzO1xuICAgICAgICBwcm9wcyA9IHt9O1xuICAgIH1cblxuICAgIHByb3BzID0gcHJvcHMgfHwgcHJvcGVydGllcyB8fCB7fTtcbiAgICB0YWcgPSBwYXJzZVRhZyh0YWdOYW1lLCBwcm9wcyk7XG5cbiAgICAvLyBzdXBwb3J0IGtleXNcbiAgICBpZiAocHJvcHMuaGFzT3duUHJvcGVydHkoJ2tleScpKSB7XG4gICAgICAgIGtleSA9IHByb3BzLmtleTtcbiAgICAgICAgcHJvcHMua2V5ID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8vIHN1cHBvcnQgbmFtZXNwYWNlXG4gICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KCduYW1lc3BhY2UnKSkge1xuICAgICAgICBuYW1lc3BhY2UgPSBwcm9wcy5uYW1lc3BhY2U7XG4gICAgICAgIHByb3BzLm5hbWVzcGFjZSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvLyBmaXggY3Vyc29yIGJ1Z1xuICAgIGlmICh0YWcgPT09ICdJTlBVVCcgJiZcbiAgICAgICAgIW5hbWVzcGFjZSAmJlxuICAgICAgICBwcm9wcy5oYXNPd25Qcm9wZXJ0eSgndmFsdWUnKSAmJlxuICAgICAgICBwcm9wcy52YWx1ZSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICFpc0hvb2socHJvcHMudmFsdWUpXG4gICAgKSB7XG4gICAgICAgIHByb3BzLnZhbHVlID0gc29mdFNldEhvb2socHJvcHMudmFsdWUpO1xuICAgIH1cblxuICAgIHRyYW5zZm9ybVByb3BlcnRpZXMocHJvcHMpO1xuXG4gICAgaWYgKGNoaWxkcmVuICE9PSB1bmRlZmluZWQgJiYgY2hpbGRyZW4gIT09IG51bGwpIHtcbiAgICAgICAgYWRkQ2hpbGQoY2hpbGRyZW4sIGNoaWxkTm9kZXMsIHRhZywgcHJvcHMpO1xuICAgIH1cblxuXG4gICAgcmV0dXJuIG5ldyBWTm9kZSh0YWcsIHByb3BzLCBjaGlsZE5vZGVzLCBrZXksIG5hbWVzcGFjZSk7XG59XG5cbmZ1bmN0aW9uIGFkZENoaWxkKGMsIGNoaWxkTm9kZXMsIHRhZywgcHJvcHMpIHtcbiAgICBpZiAodHlwZW9mIGMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNoaWxkTm9kZXMucHVzaChuZXcgVlRleHQoYykpO1xuICAgIH0gZWxzZSBpZiAoaXNDaGlsZChjKSkge1xuICAgICAgICBjaGlsZE5vZGVzLnB1c2goYyk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KGMpKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYWRkQ2hpbGQoY1tpXSwgY2hpbGROb2RlcywgdGFnLCBwcm9wcyk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGMgPT09IG51bGwgfHwgYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBVbmV4cGVjdGVkVmlydHVhbEVsZW1lbnQoe1xuICAgICAgICAgICAgZm9yZWlnbk9iamVjdDogYyxcbiAgICAgICAgICAgIHBhcmVudFZub2RlOiB7XG4gICAgICAgICAgICAgICAgdGFnTmFtZTogdGFnLFxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHByb3BzXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtUHJvcGVydGllcyhwcm9wcykge1xuICAgIGZvciAodmFyIHByb3BOYW1lIGluIHByb3BzKSB7XG4gICAgICAgIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eShwcm9wTmFtZSkpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHByb3BzW3Byb3BOYW1lXTtcblxuICAgICAgICAgICAgaWYgKGlzSG9vayh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHByb3BOYW1lLnN1YnN0cigwLCAzKSA9PT0gJ2V2LScpIHtcbiAgICAgICAgICAgICAgICAvLyBhZGQgZXYtZm9vIHN1cHBvcnRcbiAgICAgICAgICAgICAgICBwcm9wc1twcm9wTmFtZV0gPSBldkhvb2sodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc0NoaWxkKHgpIHtcbiAgICByZXR1cm4gaXNWTm9kZSh4KSB8fCBpc1ZUZXh0KHgpIHx8IGlzV2lkZ2V0KHgpIHx8IGlzVlRodW5rKHgpO1xufVxuXG5mdW5jdGlvbiBpc0NoaWxkcmVuKHgpIHtcbiAgICByZXR1cm4gdHlwZW9mIHggPT09ICdzdHJpbmcnIHx8IGlzQXJyYXkoeCkgfHwgaXNDaGlsZCh4KTtcbn1cblxuZnVuY3Rpb24gVW5leHBlY3RlZFZpcnR1YWxFbGVtZW50KGRhdGEpIHtcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKCk7XG5cbiAgICBlcnIudHlwZSA9ICd2aXJ0dWFsLWh5cGVyc2NyaXB0LnVuZXhwZWN0ZWQudmlydHVhbC1lbGVtZW50JztcbiAgICBlcnIubWVzc2FnZSA9ICdVbmV4cGVjdGVkIHZpcnR1YWwgY2hpbGQgcGFzc2VkIHRvIGgoKS5cXG4nICtcbiAgICAgICAgJ0V4cGVjdGVkIGEgVk5vZGUgLyBWdGh1bmsgLyBWV2lkZ2V0IC8gc3RyaW5nIGJ1dDpcXG4nICtcbiAgICAgICAgJ2dvdDpcXG4nICtcbiAgICAgICAgZXJyb3JTdHJpbmcoZGF0YS5mb3JlaWduT2JqZWN0KSArXG4gICAgICAgICcuXFxuJyArXG4gICAgICAgICdUaGUgcGFyZW50IHZub2RlIGlzOlxcbicgK1xuICAgICAgICBlcnJvclN0cmluZyhkYXRhLnBhcmVudFZub2RlKVxuICAgICAgICAnXFxuJyArXG4gICAgICAgICdTdWdnZXN0ZWQgZml4OiBjaGFuZ2UgeW91ciBgaCguLi4sIFsgLi4uIF0pYCBjYWxsc2l0ZS4nO1xuICAgIGVyci5mb3JlaWduT2JqZWN0ID0gZGF0YS5mb3JlaWduT2JqZWN0O1xuICAgIGVyci5wYXJlbnRWbm9kZSA9IGRhdGEucGFyZW50Vm5vZGU7XG5cbiAgICByZXR1cm4gZXJyO1xufVxuXG5mdW5jdGlvbiBlcnJvclN0cmluZyhvYmopIHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqLCBudWxsLCAnICAgICcpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIFN0cmluZyhvYmopO1xuICAgIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHNwbGl0ID0gcmVxdWlyZSgnYnJvd3Nlci1zcGxpdCcpO1xuXG52YXIgY2xhc3NJZFNwbGl0ID0gLyhbXFwuI10/W2EtekEtWjAtOV86LV0rKS87XG52YXIgbm90Q2xhc3NJZCA9IC9eXFwufCMvO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlVGFnO1xuXG5mdW5jdGlvbiBwYXJzZVRhZyh0YWcsIHByb3BzKSB7XG4gICAgaWYgKCF0YWcpIHtcbiAgICAgICAgcmV0dXJuICdESVYnO1xuICAgIH1cblxuICAgIHZhciBub0lkID0gIShwcm9wcy5oYXNPd25Qcm9wZXJ0eSgnaWQnKSk7XG5cbiAgICB2YXIgdGFnUGFydHMgPSBzcGxpdCh0YWcsIGNsYXNzSWRTcGxpdCk7XG4gICAgdmFyIHRhZ05hbWUgPSBudWxsO1xuXG4gICAgaWYgKG5vdENsYXNzSWQudGVzdCh0YWdQYXJ0c1sxXSkpIHtcbiAgICAgICAgdGFnTmFtZSA9ICdESVYnO1xuICAgIH1cblxuICAgIHZhciBjbGFzc2VzLCBwYXJ0LCB0eXBlLCBpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IHRhZ1BhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHBhcnQgPSB0YWdQYXJ0c1tpXTtcblxuICAgICAgICBpZiAoIXBhcnQpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdHlwZSA9IHBhcnQuY2hhckF0KDApO1xuXG4gICAgICAgIGlmICghdGFnTmFtZSkge1xuICAgICAgICAgICAgdGFnTmFtZSA9IHBhcnQ7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJy4nKSB7XG4gICAgICAgICAgICBjbGFzc2VzID0gY2xhc3NlcyB8fCBbXTtcbiAgICAgICAgICAgIGNsYXNzZXMucHVzaChwYXJ0LnN1YnN0cmluZygxLCBwYXJ0Lmxlbmd0aCkpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICcjJyAmJiBub0lkKSB7XG4gICAgICAgICAgICBwcm9wcy5pZCA9IHBhcnQuc3Vic3RyaW5nKDEsIHBhcnQubGVuZ3RoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjbGFzc2VzKSB7XG4gICAgICAgIGlmIChwcm9wcy5jbGFzc05hbWUpIHtcbiAgICAgICAgICAgIGNsYXNzZXMucHVzaChwcm9wcy5jbGFzc05hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvcHMuY2xhc3NOYW1lID0gY2xhc3Nlcy5qb2luKCcgJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb3BzLm5hbWVzcGFjZSA/IHRhZ05hbWUgOiB0YWdOYW1lLnRvVXBwZXJDYXNlKCk7XG59XG4iLCJ2YXIgaXNWTm9kZSA9IHJlcXVpcmUoXCIuL2lzLXZub2RlXCIpXG52YXIgaXNWVGV4dCA9IHJlcXVpcmUoXCIuL2lzLXZ0ZXh0XCIpXG52YXIgaXNXaWRnZXQgPSByZXF1aXJlKFwiLi9pcy13aWRnZXRcIilcbnZhciBpc1RodW5rID0gcmVxdWlyZShcIi4vaXMtdGh1bmtcIilcblxubW9kdWxlLmV4cG9ydHMgPSBoYW5kbGVUaHVua1xuXG5mdW5jdGlvbiBoYW5kbGVUaHVuayhhLCBiKSB7XG4gICAgdmFyIHJlbmRlcmVkQSA9IGFcbiAgICB2YXIgcmVuZGVyZWRCID0gYlxuXG4gICAgaWYgKGlzVGh1bmsoYikpIHtcbiAgICAgICAgcmVuZGVyZWRCID0gcmVuZGVyVGh1bmsoYiwgYSlcbiAgICB9XG5cbiAgICBpZiAoaXNUaHVuayhhKSkge1xuICAgICAgICByZW5kZXJlZEEgPSByZW5kZXJUaHVuayhhLCBudWxsKVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGE6IHJlbmRlcmVkQSxcbiAgICAgICAgYjogcmVuZGVyZWRCXG4gICAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXJUaHVuayh0aHVuaywgcHJldmlvdXMpIHtcbiAgICB2YXIgcmVuZGVyZWRUaHVuayA9IHRodW5rLnZub2RlXG5cbiAgICBpZiAoIXJlbmRlcmVkVGh1bmspIHtcbiAgICAgICAgcmVuZGVyZWRUaHVuayA9IHRodW5rLnZub2RlID0gdGh1bmsucmVuZGVyKHByZXZpb3VzKVxuICAgIH1cblxuICAgIGlmICghKGlzVk5vZGUocmVuZGVyZWRUaHVuaykgfHxcbiAgICAgICAgICAgIGlzVlRleHQocmVuZGVyZWRUaHVuaykgfHxcbiAgICAgICAgICAgIGlzV2lkZ2V0KHJlbmRlcmVkVGh1bmspKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0aHVuayBkaWQgbm90IHJldHVybiBhIHZhbGlkIG5vZGVcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlbmRlcmVkVGh1bmtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gaXNUaHVua1xyXG5cclxuZnVuY3Rpb24gaXNUaHVuayh0KSB7XHJcbiAgICByZXR1cm4gdCAmJiB0LnR5cGUgPT09IFwiVGh1bmtcIlxyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gaXNIb29rXG5cbmZ1bmN0aW9uIGlzSG9vayhob29rKSB7XG4gICAgcmV0dXJuIGhvb2sgJiZcbiAgICAgICh0eXBlb2YgaG9vay5ob29rID09PSBcImZ1bmN0aW9uXCIgJiYgIWhvb2suaGFzT3duUHJvcGVydHkoXCJob29rXCIpIHx8XG4gICAgICAgdHlwZW9mIGhvb2sudW5ob29rID09PSBcImZ1bmN0aW9uXCIgJiYgIWhvb2suaGFzT3duUHJvcGVydHkoXCJ1bmhvb2tcIikpXG59XG4iLCJ2YXIgdmVyc2lvbiA9IHJlcXVpcmUoXCIuL3ZlcnNpb25cIilcblxubW9kdWxlLmV4cG9ydHMgPSBpc1ZpcnR1YWxOb2RlXG5cbmZ1bmN0aW9uIGlzVmlydHVhbE5vZGUoeCkge1xuICAgIHJldHVybiB4ICYmIHgudHlwZSA9PT0gXCJWaXJ0dWFsTm9kZVwiICYmIHgudmVyc2lvbiA9PT0gdmVyc2lvblxufVxuIiwidmFyIHZlcnNpb24gPSByZXF1aXJlKFwiLi92ZXJzaW9uXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gaXNWaXJ0dWFsVGV4dFxuXG5mdW5jdGlvbiBpc1ZpcnR1YWxUZXh0KHgpIHtcbiAgICByZXR1cm4geCAmJiB4LnR5cGUgPT09IFwiVmlydHVhbFRleHRcIiAmJiB4LnZlcnNpb24gPT09IHZlcnNpb25cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gaXNXaWRnZXRcblxuZnVuY3Rpb24gaXNXaWRnZXQodykge1xuICAgIHJldHVybiB3ICYmIHcudHlwZSA9PT0gXCJXaWRnZXRcIlxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBcIjFcIlxuIiwidmFyIHZlcnNpb24gPSByZXF1aXJlKFwiLi92ZXJzaW9uXCIpXG52YXIgaXNWTm9kZSA9IHJlcXVpcmUoXCIuL2lzLXZub2RlXCIpXG52YXIgaXNXaWRnZXQgPSByZXF1aXJlKFwiLi9pcy13aWRnZXRcIilcbnZhciBpc1RodW5rID0gcmVxdWlyZShcIi4vaXMtdGh1bmtcIilcbnZhciBpc1ZIb29rID0gcmVxdWlyZShcIi4vaXMtdmhvb2tcIilcblxubW9kdWxlLmV4cG9ydHMgPSBWaXJ0dWFsTm9kZVxuXG52YXIgbm9Qcm9wZXJ0aWVzID0ge31cbnZhciBub0NoaWxkcmVuID0gW11cblxuZnVuY3Rpb24gVmlydHVhbE5vZGUodGFnTmFtZSwgcHJvcGVydGllcywgY2hpbGRyZW4sIGtleSwgbmFtZXNwYWNlKSB7XG4gICAgdGhpcy50YWdOYW1lID0gdGFnTmFtZVxuICAgIHRoaXMucHJvcGVydGllcyA9IHByb3BlcnRpZXMgfHwgbm9Qcm9wZXJ0aWVzXG4gICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuIHx8IG5vQ2hpbGRyZW5cbiAgICB0aGlzLmtleSA9IGtleSAhPSBudWxsID8gU3RyaW5nKGtleSkgOiB1bmRlZmluZWRcbiAgICB0aGlzLm5hbWVzcGFjZSA9ICh0eXBlb2YgbmFtZXNwYWNlID09PSBcInN0cmluZ1wiKSA/IG5hbWVzcGFjZSA6IG51bGxcblxuICAgIHZhciBjb3VudCA9IChjaGlsZHJlbiAmJiBjaGlsZHJlbi5sZW5ndGgpIHx8IDBcbiAgICB2YXIgZGVzY2VuZGFudHMgPSAwXG4gICAgdmFyIGhhc1dpZGdldHMgPSBmYWxzZVxuICAgIHZhciBoYXNUaHVua3MgPSBmYWxzZVxuICAgIHZhciBkZXNjZW5kYW50SG9va3MgPSBmYWxzZVxuICAgIHZhciBob29rc1xuXG4gICAgZm9yICh2YXIgcHJvcE5hbWUgaW4gcHJvcGVydGllcykge1xuICAgICAgICBpZiAocHJvcGVydGllcy5oYXNPd25Qcm9wZXJ0eShwcm9wTmFtZSkpIHtcbiAgICAgICAgICAgIHZhciBwcm9wZXJ0eSA9IHByb3BlcnRpZXNbcHJvcE5hbWVdXG4gICAgICAgICAgICBpZiAoaXNWSG9vayhwcm9wZXJ0eSkgJiYgcHJvcGVydHkudW5ob29rKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFob29rcykge1xuICAgICAgICAgICAgICAgICAgICBob29rcyA9IHt9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaG9va3NbcHJvcE5hbWVdID0gcHJvcGVydHlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuICAgICAgICBpZiAoaXNWTm9kZShjaGlsZCkpIHtcbiAgICAgICAgICAgIGRlc2NlbmRhbnRzICs9IGNoaWxkLmNvdW50IHx8IDBcblxuICAgICAgICAgICAgaWYgKCFoYXNXaWRnZXRzICYmIGNoaWxkLmhhc1dpZGdldHMpIHtcbiAgICAgICAgICAgICAgICBoYXNXaWRnZXRzID0gdHJ1ZVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWhhc1RodW5rcyAmJiBjaGlsZC5oYXNUaHVua3MpIHtcbiAgICAgICAgICAgICAgICBoYXNUaHVua3MgPSB0cnVlXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghZGVzY2VuZGFudEhvb2tzICYmIChjaGlsZC5ob29rcyB8fCBjaGlsZC5kZXNjZW5kYW50SG9va3MpKSB7XG4gICAgICAgICAgICAgICAgZGVzY2VuZGFudEhvb2tzID0gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCFoYXNXaWRnZXRzICYmIGlzV2lkZ2V0KGNoaWxkKSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjaGlsZC5kZXN0cm95ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBoYXNXaWRnZXRzID0gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCFoYXNUaHVua3MgJiYgaXNUaHVuayhjaGlsZCkpIHtcbiAgICAgICAgICAgIGhhc1RodW5rcyA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmNvdW50ID0gY291bnQgKyBkZXNjZW5kYW50c1xuICAgIHRoaXMuaGFzV2lkZ2V0cyA9IGhhc1dpZGdldHNcbiAgICB0aGlzLmhhc1RodW5rcyA9IGhhc1RodW5rc1xuICAgIHRoaXMuaG9va3MgPSBob29rc1xuICAgIHRoaXMuZGVzY2VuZGFudEhvb2tzID0gZGVzY2VuZGFudEhvb2tzXG59XG5cblZpcnR1YWxOb2RlLnByb3RvdHlwZS52ZXJzaW9uID0gdmVyc2lvblxuVmlydHVhbE5vZGUucHJvdG90eXBlLnR5cGUgPSBcIlZpcnR1YWxOb2RlXCJcbiIsInZhciB2ZXJzaW9uID0gcmVxdWlyZShcIi4vdmVyc2lvblwiKVxuXG5WaXJ0dWFsUGF0Y2guTk9ORSA9IDBcblZpcnR1YWxQYXRjaC5WVEVYVCA9IDFcblZpcnR1YWxQYXRjaC5WTk9ERSA9IDJcblZpcnR1YWxQYXRjaC5XSURHRVQgPSAzXG5WaXJ0dWFsUGF0Y2guUFJPUFMgPSA0XG5WaXJ0dWFsUGF0Y2guT1JERVIgPSA1XG5WaXJ0dWFsUGF0Y2guSU5TRVJUID0gNlxuVmlydHVhbFBhdGNoLlJFTU9WRSA9IDdcblZpcnR1YWxQYXRjaC5USFVOSyA9IDhcblxubW9kdWxlLmV4cG9ydHMgPSBWaXJ0dWFsUGF0Y2hcblxuZnVuY3Rpb24gVmlydHVhbFBhdGNoKHR5cGUsIHZOb2RlLCBwYXRjaCkge1xuICAgIHRoaXMudHlwZSA9IE51bWJlcih0eXBlKVxuICAgIHRoaXMudk5vZGUgPSB2Tm9kZVxuICAgIHRoaXMucGF0Y2ggPSBwYXRjaFxufVxuXG5WaXJ0dWFsUGF0Y2gucHJvdG90eXBlLnZlcnNpb24gPSB2ZXJzaW9uXG5WaXJ0dWFsUGF0Y2gucHJvdG90eXBlLnR5cGUgPSBcIlZpcnR1YWxQYXRjaFwiXG4iLCJ2YXIgdmVyc2lvbiA9IHJlcXVpcmUoXCIuL3ZlcnNpb25cIilcblxubW9kdWxlLmV4cG9ydHMgPSBWaXJ0dWFsVGV4dFxuXG5mdW5jdGlvbiBWaXJ0dWFsVGV4dCh0ZXh0KSB7XG4gICAgdGhpcy50ZXh0ID0gU3RyaW5nKHRleHQpXG59XG5cblZpcnR1YWxUZXh0LnByb3RvdHlwZS52ZXJzaW9uID0gdmVyc2lvblxuVmlydHVhbFRleHQucHJvdG90eXBlLnR5cGUgPSBcIlZpcnR1YWxUZXh0XCJcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoXCJpcy1vYmplY3RcIilcbnZhciBpc0hvb2sgPSByZXF1aXJlKFwiLi4vdm5vZGUvaXMtdmhvb2tcIilcblxubW9kdWxlLmV4cG9ydHMgPSBkaWZmUHJvcHNcblxuZnVuY3Rpb24gZGlmZlByb3BzKGEsIGIpIHtcbiAgICB2YXIgZGlmZlxuXG4gICAgZm9yICh2YXIgYUtleSBpbiBhKSB7XG4gICAgICAgIGlmICghKGFLZXkgaW4gYikpIHtcbiAgICAgICAgICAgIGRpZmYgPSBkaWZmIHx8IHt9XG4gICAgICAgICAgICBkaWZmW2FLZXldID0gdW5kZWZpbmVkXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYVZhbHVlID0gYVthS2V5XVxuICAgICAgICB2YXIgYlZhbHVlID0gYlthS2V5XVxuXG4gICAgICAgIGlmIChhVmFsdWUgPT09IGJWYWx1ZSkge1xuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgfSBlbHNlIGlmIChpc09iamVjdChhVmFsdWUpICYmIGlzT2JqZWN0KGJWYWx1ZSkpIHtcbiAgICAgICAgICAgIGlmIChnZXRQcm90b3R5cGUoYlZhbHVlKSAhPT0gZ2V0UHJvdG90eXBlKGFWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBkaWZmID0gZGlmZiB8fCB7fVxuICAgICAgICAgICAgICAgIGRpZmZbYUtleV0gPSBiVmFsdWVcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNIb29rKGJWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgZGlmZiA9IGRpZmYgfHwge31cbiAgICAgICAgICAgICAgICAgZGlmZlthS2V5XSA9IGJWYWx1ZVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgb2JqZWN0RGlmZiA9IGRpZmZQcm9wcyhhVmFsdWUsIGJWYWx1ZSlcbiAgICAgICAgICAgICAgICBpZiAob2JqZWN0RGlmZikge1xuICAgICAgICAgICAgICAgICAgICBkaWZmID0gZGlmZiB8fCB7fVxuICAgICAgICAgICAgICAgICAgICBkaWZmW2FLZXldID0gb2JqZWN0RGlmZlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRpZmYgPSBkaWZmIHx8IHt9XG4gICAgICAgICAgICBkaWZmW2FLZXldID0gYlZhbHVlXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBiS2V5IGluIGIpIHtcbiAgICAgICAgaWYgKCEoYktleSBpbiBhKSkge1xuICAgICAgICAgICAgZGlmZiA9IGRpZmYgfHwge31cbiAgICAgICAgICAgIGRpZmZbYktleV0gPSBiW2JLZXldXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGlmZlxufVxuXG5mdW5jdGlvbiBnZXRQcm90b3R5cGUodmFsdWUpIHtcbiAgaWYgKE9iamVjdC5nZXRQcm90b3R5cGVPZikge1xuICAgIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpXG4gIH0gZWxzZSBpZiAodmFsdWUuX19wcm90b19fKSB7XG4gICAgcmV0dXJuIHZhbHVlLl9fcHJvdG9fX1xuICB9IGVsc2UgaWYgKHZhbHVlLmNvbnN0cnVjdG9yKSB7XG4gICAgcmV0dXJuIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZVxuICB9XG59XG4iLCJ2YXIgaXNBcnJheSA9IHJlcXVpcmUoXCJ4LWlzLWFycmF5XCIpXG5cbnZhciBWUGF0Y2ggPSByZXF1aXJlKFwiLi4vdm5vZGUvdnBhdGNoXCIpXG52YXIgaXNWTm9kZSA9IHJlcXVpcmUoXCIuLi92bm9kZS9pcy12bm9kZVwiKVxudmFyIGlzVlRleHQgPSByZXF1aXJlKFwiLi4vdm5vZGUvaXMtdnRleHRcIilcbnZhciBpc1dpZGdldCA9IHJlcXVpcmUoXCIuLi92bm9kZS9pcy13aWRnZXRcIilcbnZhciBpc1RodW5rID0gcmVxdWlyZShcIi4uL3Zub2RlL2lzLXRodW5rXCIpXG52YXIgaGFuZGxlVGh1bmsgPSByZXF1aXJlKFwiLi4vdm5vZGUvaGFuZGxlLXRodW5rXCIpXG5cbnZhciBkaWZmUHJvcHMgPSByZXF1aXJlKFwiLi9kaWZmLXByb3BzXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gZGlmZlxuXG5mdW5jdGlvbiBkaWZmKGEsIGIpIHtcbiAgICB2YXIgcGF0Y2ggPSB7IGE6IGEgfVxuICAgIHdhbGsoYSwgYiwgcGF0Y2gsIDApXG4gICAgcmV0dXJuIHBhdGNoXG59XG5cbmZ1bmN0aW9uIHdhbGsoYSwgYiwgcGF0Y2gsIGluZGV4KSB7XG4gICAgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdmFyIGFwcGx5ID0gcGF0Y2hbaW5kZXhdXG4gICAgdmFyIGFwcGx5Q2xlYXIgPSBmYWxzZVxuXG4gICAgaWYgKGlzVGh1bmsoYSkgfHwgaXNUaHVuayhiKSkge1xuICAgICAgICB0aHVua3MoYSwgYiwgcGF0Y2gsIGluZGV4KVxuICAgIH0gZWxzZSBpZiAoYiA9PSBudWxsKSB7XG5cbiAgICAgICAgLy8gSWYgYSBpcyBhIHdpZGdldCB3ZSB3aWxsIGFkZCBhIHJlbW92ZSBwYXRjaCBmb3IgaXRcbiAgICAgICAgLy8gT3RoZXJ3aXNlIGFueSBjaGlsZCB3aWRnZXRzL2hvb2tzIG11c3QgYmUgZGVzdHJveWVkLlxuICAgICAgICAvLyBUaGlzIHByZXZlbnRzIGFkZGluZyB0d28gcmVtb3ZlIHBhdGNoZXMgZm9yIGEgd2lkZ2V0LlxuICAgICAgICBpZiAoIWlzV2lkZ2V0KGEpKSB7XG4gICAgICAgICAgICBjbGVhclN0YXRlKGEsIHBhdGNoLCBpbmRleClcbiAgICAgICAgICAgIGFwcGx5ID0gcGF0Y2hbaW5kZXhdXG4gICAgICAgIH1cblxuICAgICAgICBhcHBseSA9IGFwcGVuZFBhdGNoKGFwcGx5LCBuZXcgVlBhdGNoKFZQYXRjaC5SRU1PVkUsIGEsIGIpKVxuICAgIH0gZWxzZSBpZiAoaXNWTm9kZShiKSkge1xuICAgICAgICBpZiAoaXNWTm9kZShhKSkge1xuICAgICAgICAgICAgaWYgKGEudGFnTmFtZSA9PT0gYi50YWdOYW1lICYmXG4gICAgICAgICAgICAgICAgYS5uYW1lc3BhY2UgPT09IGIubmFtZXNwYWNlICYmXG4gICAgICAgICAgICAgICAgYS5rZXkgPT09IGIua2V5KSB7XG4gICAgICAgICAgICAgICAgdmFyIHByb3BzUGF0Y2ggPSBkaWZmUHJvcHMoYS5wcm9wZXJ0aWVzLCBiLnByb3BlcnRpZXMpXG4gICAgICAgICAgICAgICAgaWYgKHByb3BzUGF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgYXBwbHkgPSBhcHBlbmRQYXRjaChhcHBseSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWUGF0Y2goVlBhdGNoLlBST1BTLCBhLCBwcm9wc1BhdGNoKSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXBwbHkgPSBkaWZmQ2hpbGRyZW4oYSwgYiwgcGF0Y2gsIGFwcGx5LCBpbmRleClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXBwbHkgPSBhcHBlbmRQYXRjaChhcHBseSwgbmV3IFZQYXRjaChWUGF0Y2guVk5PREUsIGEsIGIpKVxuICAgICAgICAgICAgICAgIGFwcGx5Q2xlYXIgPSB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcHBseSA9IGFwcGVuZFBhdGNoKGFwcGx5LCBuZXcgVlBhdGNoKFZQYXRjaC5WTk9ERSwgYSwgYikpXG4gICAgICAgICAgICBhcHBseUNsZWFyID0gdHJ1ZVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChpc1ZUZXh0KGIpKSB7XG4gICAgICAgIGlmICghaXNWVGV4dChhKSkge1xuICAgICAgICAgICAgYXBwbHkgPSBhcHBlbmRQYXRjaChhcHBseSwgbmV3IFZQYXRjaChWUGF0Y2guVlRFWFQsIGEsIGIpKVxuICAgICAgICAgICAgYXBwbHlDbGVhciA9IHRydWVcbiAgICAgICAgfSBlbHNlIGlmIChhLnRleHQgIT09IGIudGV4dCkge1xuICAgICAgICAgICAgYXBwbHkgPSBhcHBlbmRQYXRjaChhcHBseSwgbmV3IFZQYXRjaChWUGF0Y2guVlRFWFQsIGEsIGIpKVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChpc1dpZGdldChiKSkge1xuICAgICAgICBpZiAoIWlzV2lkZ2V0KGEpKSB7XG4gICAgICAgICAgICBhcHBseUNsZWFyID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFwcGx5ID0gYXBwZW5kUGF0Y2goYXBwbHksIG5ldyBWUGF0Y2goVlBhdGNoLldJREdFVCwgYSwgYikpXG4gICAgfVxuXG4gICAgaWYgKGFwcGx5KSB7XG4gICAgICAgIHBhdGNoW2luZGV4XSA9IGFwcGx5XG4gICAgfVxuXG4gICAgaWYgKGFwcGx5Q2xlYXIpIHtcbiAgICAgICAgY2xlYXJTdGF0ZShhLCBwYXRjaCwgaW5kZXgpXG4gICAgfVxufVxuXG5mdW5jdGlvbiBkaWZmQ2hpbGRyZW4oYSwgYiwgcGF0Y2gsIGFwcGx5LCBpbmRleCkge1xuICAgIHZhciBhQ2hpbGRyZW4gPSBhLmNoaWxkcmVuXG4gICAgdmFyIGJDaGlsZHJlbiA9IHJlb3JkZXIoYUNoaWxkcmVuLCBiLmNoaWxkcmVuKVxuXG4gICAgdmFyIGFMZW4gPSBhQ2hpbGRyZW4ubGVuZ3RoXG4gICAgdmFyIGJMZW4gPSBiQ2hpbGRyZW4ubGVuZ3RoXG4gICAgdmFyIGxlbiA9IGFMZW4gPiBiTGVuID8gYUxlbiA6IGJMZW5cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgdmFyIGxlZnROb2RlID0gYUNoaWxkcmVuW2ldXG4gICAgICAgIHZhciByaWdodE5vZGUgPSBiQ2hpbGRyZW5baV1cbiAgICAgICAgaW5kZXggKz0gMVxuXG4gICAgICAgIGlmICghbGVmdE5vZGUpIHtcbiAgICAgICAgICAgIGlmIChyaWdodE5vZGUpIHtcbiAgICAgICAgICAgICAgICAvLyBFeGNlc3Mgbm9kZXMgaW4gYiBuZWVkIHRvIGJlIGFkZGVkXG4gICAgICAgICAgICAgICAgYXBwbHkgPSBhcHBlbmRQYXRjaChhcHBseSxcbiAgICAgICAgICAgICAgICAgICAgbmV3IFZQYXRjaChWUGF0Y2guSU5TRVJULCBudWxsLCByaWdodE5vZGUpKVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2FsayhsZWZ0Tm9kZSwgcmlnaHROb2RlLCBwYXRjaCwgaW5kZXgpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNWTm9kZShsZWZ0Tm9kZSkgJiYgbGVmdE5vZGUuY291bnQpIHtcbiAgICAgICAgICAgIGluZGV4ICs9IGxlZnROb2RlLmNvdW50XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoYkNoaWxkcmVuLm1vdmVzKSB7XG4gICAgICAgIC8vIFJlb3JkZXIgbm9kZXMgbGFzdFxuICAgICAgICBhcHBseSA9IGFwcGVuZFBhdGNoKGFwcGx5LCBuZXcgVlBhdGNoKFZQYXRjaC5PUkRFUiwgYSwgYkNoaWxkcmVuLm1vdmVzKSlcbiAgICB9XG5cbiAgICByZXR1cm4gYXBwbHlcbn1cblxuZnVuY3Rpb24gY2xlYXJTdGF0ZSh2Tm9kZSwgcGF0Y2gsIGluZGV4KSB7XG4gICAgLy8gVE9ETzogTWFrZSB0aGlzIGEgc2luZ2xlIHdhbGssIG5vdCB0d29cbiAgICB1bmhvb2sodk5vZGUsIHBhdGNoLCBpbmRleClcbiAgICBkZXN0cm95V2lkZ2V0cyh2Tm9kZSwgcGF0Y2gsIGluZGV4KVxufVxuXG4vLyBQYXRjaCByZWNvcmRzIGZvciBhbGwgZGVzdHJveWVkIHdpZGdldHMgbXVzdCBiZSBhZGRlZCBiZWNhdXNlIHdlIG5lZWRcbi8vIGEgRE9NIG5vZGUgcmVmZXJlbmNlIGZvciB0aGUgZGVzdHJveSBmdW5jdGlvblxuZnVuY3Rpb24gZGVzdHJveVdpZGdldHModk5vZGUsIHBhdGNoLCBpbmRleCkge1xuICAgIGlmIChpc1dpZGdldCh2Tm9kZSkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2Tm9kZS5kZXN0cm95ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHBhdGNoW2luZGV4XSA9IGFwcGVuZFBhdGNoKFxuICAgICAgICAgICAgICAgIHBhdGNoW2luZGV4XSxcbiAgICAgICAgICAgICAgICBuZXcgVlBhdGNoKFZQYXRjaC5SRU1PVkUsIHZOb2RlLCBudWxsKVxuICAgICAgICAgICAgKVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChpc1ZOb2RlKHZOb2RlKSAmJiAodk5vZGUuaGFzV2lkZ2V0cyB8fCB2Tm9kZS5oYXNUaHVua3MpKSB7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHZOb2RlLmNoaWxkcmVuXG4gICAgICAgIHZhciBsZW4gPSBjaGlsZHJlbi5sZW5ndGhcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV1cbiAgICAgICAgICAgIGluZGV4ICs9IDFcblxuICAgICAgICAgICAgZGVzdHJveVdpZGdldHMoY2hpbGQsIHBhdGNoLCBpbmRleClcblxuICAgICAgICAgICAgaWYgKGlzVk5vZGUoY2hpbGQpICYmIGNoaWxkLmNvdW50KSB7XG4gICAgICAgICAgICAgICAgaW5kZXggKz0gY2hpbGQuY291bnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNUaHVuayh2Tm9kZSkpIHtcbiAgICAgICAgdGh1bmtzKHZOb2RlLCBudWxsLCBwYXRjaCwgaW5kZXgpXG4gICAgfVxufVxuXG4vLyBDcmVhdGUgYSBzdWItcGF0Y2ggZm9yIHRodW5rc1xuZnVuY3Rpb24gdGh1bmtzKGEsIGIsIHBhdGNoLCBpbmRleCkge1xuICAgIHZhciBub2RlcyA9IGhhbmRsZVRodW5rKGEsIGIpO1xuICAgIHZhciB0aHVua1BhdGNoID0gZGlmZihub2Rlcy5hLCBub2Rlcy5iKVxuICAgIGlmIChoYXNQYXRjaGVzKHRodW5rUGF0Y2gpKSB7XG4gICAgICAgIHBhdGNoW2luZGV4XSA9IG5ldyBWUGF0Y2goVlBhdGNoLlRIVU5LLCBudWxsLCB0aHVua1BhdGNoKVxuICAgIH1cbn1cblxuZnVuY3Rpb24gaGFzUGF0Y2hlcyhwYXRjaCkge1xuICAgIGZvciAodmFyIGluZGV4IGluIHBhdGNoKSB7XG4gICAgICAgIGlmIChpbmRleCAhPT0gXCJhXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG4vLyBFeGVjdXRlIGhvb2tzIHdoZW4gdHdvIG5vZGVzIGFyZSBpZGVudGljYWxcbmZ1bmN0aW9uIHVuaG9vayh2Tm9kZSwgcGF0Y2gsIGluZGV4KSB7XG4gICAgaWYgKGlzVk5vZGUodk5vZGUpKSB7XG4gICAgICAgIGlmICh2Tm9kZS5ob29rcykge1xuICAgICAgICAgICAgcGF0Y2hbaW5kZXhdID0gYXBwZW5kUGF0Y2goXG4gICAgICAgICAgICAgICAgcGF0Y2hbaW5kZXhdLFxuICAgICAgICAgICAgICAgIG5ldyBWUGF0Y2goXG4gICAgICAgICAgICAgICAgICAgIFZQYXRjaC5QUk9QUyxcbiAgICAgICAgICAgICAgICAgICAgdk5vZGUsXG4gICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZEtleXModk5vZGUuaG9va3MpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZOb2RlLmRlc2NlbmRhbnRIb29rcyB8fCB2Tm9kZS5oYXNUaHVua3MpIHtcbiAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IHZOb2RlLmNoaWxkcmVuXG4gICAgICAgICAgICB2YXIgbGVuID0gY2hpbGRyZW4ubGVuZ3RoXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV1cbiAgICAgICAgICAgICAgICBpbmRleCArPSAxXG5cbiAgICAgICAgICAgICAgICB1bmhvb2soY2hpbGQsIHBhdGNoLCBpbmRleClcblxuICAgICAgICAgICAgICAgIGlmIChpc1ZOb2RlKGNoaWxkKSAmJiBjaGlsZC5jb3VudCkge1xuICAgICAgICAgICAgICAgICAgICBpbmRleCArPSBjaGlsZC5jb3VudFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNUaHVuayh2Tm9kZSkpIHtcbiAgICAgICAgdGh1bmtzKHZOb2RlLCBudWxsLCBwYXRjaCwgaW5kZXgpXG4gICAgfVxufVxuXG5mdW5jdGlvbiB1bmRlZmluZWRLZXlzKG9iaikge1xuICAgIHZhciByZXN1bHQgPSB7fVxuXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgICByZXN1bHRba2V5XSA9IHVuZGVmaW5lZFxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHRcbn1cblxuLy8gTGlzdCBkaWZmLCBuYWl2ZSBsZWZ0IHRvIHJpZ2h0IHJlb3JkZXJpbmdcbmZ1bmN0aW9uIHJlb3JkZXIoYUNoaWxkcmVuLCBiQ2hpbGRyZW4pIHtcblxuICAgIHZhciBiS2V5cyA9IGtleUluZGV4KGJDaGlsZHJlbilcblxuICAgIGlmICghYktleXMpIHtcbiAgICAgICAgcmV0dXJuIGJDaGlsZHJlblxuICAgIH1cblxuICAgIHZhciBhS2V5cyA9IGtleUluZGV4KGFDaGlsZHJlbilcblxuICAgIGlmICghYUtleXMpIHtcbiAgICAgICAgcmV0dXJuIGJDaGlsZHJlblxuICAgIH1cblxuICAgIHZhciBiTWF0Y2ggPSB7fSwgYU1hdGNoID0ge31cblxuICAgIGZvciAodmFyIGFLZXkgaW4gYktleXMpIHtcbiAgICAgICAgYk1hdGNoW2JLZXlzW2FLZXldXSA9IGFLZXlzW2FLZXldXG4gICAgfVxuXG4gICAgZm9yICh2YXIgYktleSBpbiBhS2V5cykge1xuICAgICAgICBhTWF0Y2hbYUtleXNbYktleV1dID0gYktleXNbYktleV1cbiAgICB9XG5cbiAgICB2YXIgYUxlbiA9IGFDaGlsZHJlbi5sZW5ndGhcbiAgICB2YXIgYkxlbiA9IGJDaGlsZHJlbi5sZW5ndGhcbiAgICB2YXIgbGVuID0gYUxlbiA+IGJMZW4gPyBhTGVuIDogYkxlblxuICAgIHZhciBzaHVmZmxlID0gW11cbiAgICB2YXIgZnJlZUluZGV4ID0gMFxuICAgIHZhciBpID0gMFxuICAgIHZhciBtb3ZlSW5kZXggPSAwXG4gICAgdmFyIG1vdmVzID0ge31cbiAgICB2YXIgcmVtb3ZlcyA9IG1vdmVzLnJlbW92ZXMgPSB7fVxuICAgIHZhciByZXZlcnNlID0gbW92ZXMucmV2ZXJzZSA9IHt9XG4gICAgdmFyIGhhc01vdmVzID0gZmFsc2VcblxuICAgIHdoaWxlIChmcmVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgdmFyIG1vdmUgPSBhTWF0Y2hbaV1cbiAgICAgICAgaWYgKG1vdmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc2h1ZmZsZVtpXSA9IGJDaGlsZHJlblttb3ZlXVxuICAgICAgICAgICAgaWYgKG1vdmUgIT09IG1vdmVJbmRleCkge1xuICAgICAgICAgICAgICAgIG1vdmVzW21vdmVdID0gbW92ZUluZGV4XG4gICAgICAgICAgICAgICAgcmV2ZXJzZVttb3ZlSW5kZXhdID0gbW92ZVxuICAgICAgICAgICAgICAgIGhhc01vdmVzID0gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbW92ZUluZGV4KytcbiAgICAgICAgfSBlbHNlIGlmIChpIGluIGFNYXRjaCkge1xuICAgICAgICAgICAgc2h1ZmZsZVtpXSA9IHVuZGVmaW5lZFxuICAgICAgICAgICAgcmVtb3Zlc1tpXSA9IG1vdmVJbmRleCsrXG4gICAgICAgICAgICBoYXNNb3ZlcyA9IHRydWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdoaWxlIChiTWF0Y2hbZnJlZUluZGV4XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZnJlZUluZGV4KytcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGZyZWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgICAgIHZhciBmcmVlQ2hpbGQgPSBiQ2hpbGRyZW5bZnJlZUluZGV4XVxuICAgICAgICAgICAgICAgIGlmIChmcmVlQ2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2h1ZmZsZVtpXSA9IGZyZWVDaGlsZFxuICAgICAgICAgICAgICAgICAgICBpZiAoZnJlZUluZGV4ICE9PSBtb3ZlSW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc01vdmVzID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgbW92ZXNbZnJlZUluZGV4XSA9IG1vdmVJbmRleFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV2ZXJzZVttb3ZlSW5kZXhdID0gZnJlZUluZGV4XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbW92ZUluZGV4KytcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZnJlZUluZGV4KytcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpKytcbiAgICB9XG5cbiAgICBpZiAoaGFzTW92ZXMpIHtcbiAgICAgICAgc2h1ZmZsZS5tb3ZlcyA9IG1vdmVzXG4gICAgfVxuXG4gICAgcmV0dXJuIHNodWZmbGVcbn1cblxuZnVuY3Rpb24ga2V5SW5kZXgoY2hpbGRyZW4pIHtcbiAgICB2YXIgaSwga2V5c1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldXG5cbiAgICAgICAgaWYgKGNoaWxkLmtleSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBrZXlzID0ga2V5cyB8fCB7fVxuICAgICAgICAgICAga2V5c1tjaGlsZC5rZXldID0gaVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGtleXNcbn1cblxuZnVuY3Rpb24gYXBwZW5kUGF0Y2goYXBwbHksIHBhdGNoKSB7XG4gICAgaWYgKGFwcGx5KSB7XG4gICAgICAgIGlmIChpc0FycmF5KGFwcGx5KSkge1xuICAgICAgICAgICAgYXBwbHkucHVzaChwYXRjaClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFwcGx5ID0gW2FwcGx5LCBwYXRjaF1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhcHBseVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBwYXRjaFxuICAgIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZXh0ZW5kXG5cbmZ1bmN0aW9uIGV4dGVuZCh0YXJnZXQpIHtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldXG5cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhcmdldFxufVxuIiwidmFyIF9hcml0eSA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvX2FyaXR5Jyk7XG52YXIgX2N1cnJ5MiA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvX2N1cnJ5MicpO1xuXG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgaXMgYm91bmQgdG8gYSBjb250ZXh0LlxuICogTm90ZTogYFIuYmluZGAgZG9lcyBub3QgcHJvdmlkZSB0aGUgYWRkaXRpb25hbCBhcmd1bWVudC1iaW5kaW5nIGNhcGFiaWxpdGllcyBvZlxuICogW0Z1bmN0aW9uLnByb3RvdHlwZS5iaW5kXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbi9iaW5kKS5cbiAqXG4gKiBAZnVuY1xuICogQG1lbWJlck9mIFJcbiAqIEBzaW5jZSB2MC42LjBcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHNlZSBSLnBhcnRpYWxcbiAqIEBzaWcgKCogLT4gKikgLT4geyp9IC0+ICgqIC0+ICopXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gYmluZCB0byBjb250ZXh0XG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc09iaiBUaGUgY29udGV4dCB0byBiaW5kIGBmbmAgdG9cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBBIGZ1bmN0aW9uIHRoYXQgd2lsbCBleGVjdXRlIGluIHRoZSBjb250ZXh0IG9mIGB0aGlzT2JqYC5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBfY3VycnkyKGZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNPYmopIHtcbiAgcmV0dXJuIF9hcml0eShmbi5sZW5ndGgsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmbi5hcHBseSh0aGlzT2JqLCBhcmd1bWVudHMpO1xuICB9KTtcbn0pO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBfYXJpdHkobiwgZm4pIHtcbiAgLy8ganNoaW50IHVudXNlZDp2YXJzXG4gIHN3aXRjaCAobikge1xuICAgIGNhc2UgMDogcmV0dXJuIGZ1bmN0aW9uKCkgeyByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfTtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbihhMCkgeyByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbihhMCwgYTEpIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24oYTAsIGExLCBhMikgeyByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfTtcbiAgICBjYXNlIDQ6IHJldHVybiBmdW5jdGlvbihhMCwgYTEsIGEyLCBhMykgeyByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfTtcbiAgICBjYXNlIDU6IHJldHVybiBmdW5jdGlvbihhMCwgYTEsIGEyLCBhMywgYTQpIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSA2OiByZXR1cm4gZnVuY3Rpb24oYTAsIGExLCBhMiwgYTMsIGE0LCBhNSkgeyByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfTtcbiAgICBjYXNlIDc6IHJldHVybiBmdW5jdGlvbihhMCwgYTEsIGEyLCBhMywgYTQsIGE1LCBhNikgeyByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfTtcbiAgICBjYXNlIDg6IHJldHVybiBmdW5jdGlvbihhMCwgYTEsIGEyLCBhMywgYTQsIGE1LCBhNiwgYTcpIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgY2FzZSA5OiByZXR1cm4gZnVuY3Rpb24oYTAsIGExLCBhMiwgYTMsIGE0LCBhNSwgYTYsIGE3LCBhOCkgeyByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfTtcbiAgICBjYXNlIDEwOiByZXR1cm4gZnVuY3Rpb24oYTAsIGExLCBhMiwgYTMsIGE0LCBhNSwgYTYsIGE3LCBhOCwgYTkpIHsgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7IH07XG4gICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCB0byBfYXJpdHkgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyIG5vIGdyZWF0ZXIgdGhhbiB0ZW4nKTtcbiAgfVxufTtcbiIsIi8qKlxuICogT3B0aW1pemVkIGludGVybmFsIG9uZS1hcml0eSBjdXJyeSBmdW5jdGlvbi5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY3VycnkuXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gVGhlIGN1cnJpZWQgZnVuY3Rpb24uXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gX2N1cnJ5MShmbikge1xuICByZXR1cm4gZnVuY3Rpb24gZjEoYSkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gZjE7XG4gICAgfSBlbHNlIGlmIChhICE9IG51bGwgJiYgYVsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBmMTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9O1xufTtcbiIsInZhciBfY3VycnkxID0gcmVxdWlyZSgnLi9fY3VycnkxJyk7XG5cblxuLyoqXG4gKiBPcHRpbWl6ZWQgaW50ZXJuYWwgdHdvLWFyaXR5IGN1cnJ5IGZ1bmN0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjdXJyeS5cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBUaGUgY3VycmllZCBmdW5jdGlvbi5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBfY3VycnkyKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiBmMihhLCBiKSB7XG4gICAgdmFyIG4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGlmIChuID09PSAwKSB7XG4gICAgICByZXR1cm4gZjI7XG4gICAgfSBlbHNlIGlmIChuID09PSAxICYmIGEgIT0gbnVsbCAmJiBhWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIGYyO1xuICAgIH0gZWxzZSBpZiAobiA9PT0gMSkge1xuICAgICAgcmV0dXJuIF9jdXJyeTEoZnVuY3Rpb24oYikgeyByZXR1cm4gZm4oYSwgYik7IH0pO1xuICAgIH0gZWxzZSBpZiAobiA9PT0gMiAmJiBhICE9IG51bGwgJiYgYVsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYiAhPSBudWxsICYmIGJbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gZjI7XG4gICAgfSBlbHNlIGlmIChuID09PSAyICYmIGEgIT0gbnVsbCAmJiBhWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIF9jdXJyeTEoZnVuY3Rpb24oYSkgeyByZXR1cm4gZm4oYSwgYik7IH0pO1xuICAgIH0gZWxzZSBpZiAobiA9PT0gMiAmJiBiICE9IG51bGwgJiYgYlsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBfY3VycnkxKGZ1bmN0aW9uKGIpIHsgcmV0dXJuIGZuKGEsIGIpOyB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZuKGEsIGIpO1xuICAgIH1cbiAgfTtcbn07XG4iLCJ2YXIgX2N1cnJ5MSA9IHJlcXVpcmUoJy4vX2N1cnJ5MScpO1xudmFyIF9jdXJyeTIgPSByZXF1aXJlKCcuL19jdXJyeTInKTtcblxuXG4vKipcbiAqIE9wdGltaXplZCBpbnRlcm5hbCB0aHJlZS1hcml0eSBjdXJyeSBmdW5jdGlvbi5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY3VycnkuXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gVGhlIGN1cnJpZWQgZnVuY3Rpb24uXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gX2N1cnJ5Myhmbikge1xuICByZXR1cm4gZnVuY3Rpb24gZjMoYSwgYiwgYykge1xuICAgIHZhciBuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBpZiAobiA9PT0gMCkge1xuICAgICAgcmV0dXJuIGYzO1xuICAgIH0gZWxzZSBpZiAobiA9PT0gMSAmJiBhICE9IG51bGwgJiYgYVsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBmMztcbiAgICB9IGVsc2UgaWYgKG4gPT09IDEpIHtcbiAgICAgIHJldHVybiBfY3VycnkyKGZ1bmN0aW9uKGIsIGMpIHsgcmV0dXJuIGZuKGEsIGIsIGMpOyB9KTtcbiAgICB9IGVsc2UgaWYgKG4gPT09IDIgJiYgYSAhPSBudWxsICYmIGFbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGIgIT0gbnVsbCAmJiBiWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIGYzO1xuICAgIH0gZWxzZSBpZiAobiA9PT0gMiAmJiBhICE9IG51bGwgJiYgYVsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBfY3VycnkyKGZ1bmN0aW9uKGEsIGMpIHsgcmV0dXJuIGZuKGEsIGIsIGMpOyB9KTtcbiAgICB9IGVsc2UgaWYgKG4gPT09IDIgJiYgYiAhPSBudWxsICYmIGJbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gX2N1cnJ5MihmdW5jdGlvbihiLCBjKSB7IHJldHVybiBmbihhLCBiLCBjKTsgfSk7XG4gICAgfSBlbHNlIGlmIChuID09PSAyKSB7XG4gICAgICByZXR1cm4gX2N1cnJ5MShmdW5jdGlvbihjKSB7IHJldHVybiBmbihhLCBiLCBjKTsgfSk7XG4gICAgfSBlbHNlIGlmIChuID09PSAzICYmIGEgIT0gbnVsbCAmJiBhWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICBiICE9IG51bGwgJiYgYlsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYyAhPSBudWxsICYmIGNbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gZjM7XG4gICAgfSBlbHNlIGlmIChuID09PSAzICYmIGEgIT0gbnVsbCAmJiBhWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICBiICE9IG51bGwgJiYgYlsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBfY3VycnkyKGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIGZuKGEsIGIsIGMpOyB9KTtcbiAgICB9IGVsc2UgaWYgKG4gPT09IDMgJiYgYSAhPSBudWxsICYmIGFbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGMgIT0gbnVsbCAmJiBjWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIF9jdXJyeTIoZnVuY3Rpb24oYSwgYykgeyByZXR1cm4gZm4oYSwgYiwgYyk7IH0pO1xuICAgIH0gZWxzZSBpZiAobiA9PT0gMyAmJiBiICE9IG51bGwgJiYgYlsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYyAhPSBudWxsICYmIGNbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gX2N1cnJ5MihmdW5jdGlvbihiLCBjKSB7IHJldHVybiBmbihhLCBiLCBjKTsgfSk7XG4gICAgfSBlbHNlIGlmIChuID09PSAzICYmIGEgIT0gbnVsbCAmJiBhWydAQGZ1bmN0aW9uYWwvcGxhY2Vob2xkZXInXSA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIF9jdXJyeTEoZnVuY3Rpb24oYSkgeyByZXR1cm4gZm4oYSwgYiwgYyk7IH0pO1xuICAgIH0gZWxzZSBpZiAobiA9PT0gMyAmJiBiICE9IG51bGwgJiYgYlsnQEBmdW5jdGlvbmFsL3BsYWNlaG9sZGVyJ10gPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBfY3VycnkxKGZ1bmN0aW9uKGIpIHsgcmV0dXJuIGZuKGEsIGIsIGMpOyB9KTtcbiAgICB9IGVsc2UgaWYgKG4gPT09IDMgJiYgYyAhPSBudWxsICYmIGNbJ0BAZnVuY3Rpb25hbC9wbGFjZWhvbGRlciddID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gX2N1cnJ5MShmdW5jdGlvbihjKSB7IHJldHVybiBmbihhLCBiLCBjKTsgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmbihhLCBiLCBjKTtcbiAgICB9XG4gIH07XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBfaGFzKHByb3AsIG9iaikge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59O1xuIiwiLyoqXG4gKiBUZXN0cyB3aGV0aGVyIG9yIG5vdCBhbiBvYmplY3QgaXMgYW4gYXJyYXkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsIFRoZSBvYmplY3QgdG8gdGVzdC5cbiAqIEByZXR1cm4ge0Jvb2xlYW59IGB0cnVlYCBpZiBgdmFsYCBpcyBhbiBhcnJheSwgYGZhbHNlYCBvdGhlcndpc2UuXG4gKiBAZXhhbXBsZVxuICpcbiAqICAgICAgX2lzQXJyYXkoW10pOyAvLz0+IHRydWVcbiAqICAgICAgX2lzQXJyYXkobnVsbCk7IC8vPT4gZmFsc2VcbiAqICAgICAgX2lzQXJyYXkoe30pOyAvLz0+IGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiBfaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuICh2YWwgIT0gbnVsbCAmJlxuICAgICAgICAgIHZhbC5sZW5ndGggPj0gMCAmJlxuICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBBcnJheV0nKTtcbn07XG4iLCJ2YXIgX3h3cmFwID0gcmVxdWlyZSgnLi9feHdyYXAnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnLi4vYmluZCcpO1xudmFyIGlzQXJyYXlMaWtlID0gcmVxdWlyZSgnLi4vaXNBcnJheUxpa2UnKTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gX2FycmF5UmVkdWNlKHhmLCBhY2MsIGxpc3QpIHtcbiAgICB2YXIgaWR4ID0gMCwgbGVuID0gbGlzdC5sZW5ndGg7XG4gICAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgICAgYWNjID0geGZbJ0BAdHJhbnNkdWNlci9zdGVwJ10oYWNjLCBsaXN0W2lkeF0pO1xuICAgICAgaWYgKGFjYyAmJiBhY2NbJ0BAdHJhbnNkdWNlci9yZWR1Y2VkJ10pIHtcbiAgICAgICAgYWNjID0gYWNjWydAQHRyYW5zZHVjZXIvdmFsdWUnXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZHggKz0gMTtcbiAgICB9XG4gICAgcmV0dXJuIHhmWydAQHRyYW5zZHVjZXIvcmVzdWx0J10oYWNjKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIF9pdGVyYWJsZVJlZHVjZSh4ZiwgYWNjLCBpdGVyKSB7XG4gICAgdmFyIHN0ZXAgPSBpdGVyLm5leHQoKTtcbiAgICB3aGlsZSAoIXN0ZXAuZG9uZSkge1xuICAgICAgYWNjID0geGZbJ0BAdHJhbnNkdWNlci9zdGVwJ10oYWNjLCBzdGVwLnZhbHVlKTtcbiAgICAgIGlmIChhY2MgJiYgYWNjWydAQHRyYW5zZHVjZXIvcmVkdWNlZCddKSB7XG4gICAgICAgIGFjYyA9IGFjY1snQEB0cmFuc2R1Y2VyL3ZhbHVlJ107XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgc3RlcCA9IGl0ZXIubmV4dCgpO1xuICAgIH1cbiAgICByZXR1cm4geGZbJ0BAdHJhbnNkdWNlci9yZXN1bHQnXShhY2MpO1xuICB9XG5cbiAgZnVuY3Rpb24gX21ldGhvZFJlZHVjZSh4ZiwgYWNjLCBvYmopIHtcbiAgICByZXR1cm4geGZbJ0BAdHJhbnNkdWNlci9yZXN1bHQnXShvYmoucmVkdWNlKGJpbmQoeGZbJ0BAdHJhbnNkdWNlci9zdGVwJ10sIHhmKSwgYWNjKSk7XG4gIH1cblxuICB2YXIgc3ltSXRlcmF0b3IgPSAodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcpID8gU3ltYm9sLml0ZXJhdG9yIDogJ0BAaXRlcmF0b3InO1xuICByZXR1cm4gZnVuY3Rpb24gX3JlZHVjZShmbiwgYWNjLCBsaXN0KSB7XG4gICAgaWYgKHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZm4gPSBfeHdyYXAoZm4pO1xuICAgIH1cbiAgICBpZiAoaXNBcnJheUxpa2UobGlzdCkpIHtcbiAgICAgIHJldHVybiBfYXJyYXlSZWR1Y2UoZm4sIGFjYywgbGlzdCk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgbGlzdC5yZWR1Y2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBfbWV0aG9kUmVkdWNlKGZuLCBhY2MsIGxpc3QpO1xuICAgIH1cbiAgICBpZiAobGlzdFtzeW1JdGVyYXRvcl0gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIF9pdGVyYWJsZVJlZHVjZShmbiwgYWNjLCBsaXN0W3N5bUl0ZXJhdG9yXSgpKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBsaXN0Lm5leHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBfaXRlcmFibGVSZWR1Y2UoZm4sIGFjYywgbGlzdCk7XG4gICAgfVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3JlZHVjZTogbGlzdCBtdXN0IGJlIGFycmF5IG9yIGl0ZXJhYmxlJyk7XG4gIH07XG59KSgpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIFhXcmFwKGZuKSB7XG4gICAgdGhpcy5mID0gZm47XG4gIH1cbiAgWFdyYXAucHJvdG90eXBlWydAQHRyYW5zZHVjZXIvaW5pdCddID0gZnVuY3Rpb24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbml0IG5vdCBpbXBsZW1lbnRlZCBvbiBYV3JhcCcpO1xuICB9O1xuICBYV3JhcC5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9yZXN1bHQnXSA9IGZ1bmN0aW9uKGFjYykgeyByZXR1cm4gYWNjOyB9O1xuICBYV3JhcC5wcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9zdGVwJ10gPSBmdW5jdGlvbihhY2MsIHgpIHtcbiAgICByZXR1cm4gdGhpcy5mKGFjYywgeCk7XG4gIH07XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIF94d3JhcChmbikgeyByZXR1cm4gbmV3IFhXcmFwKGZuKTsgfTtcbn0oKSk7XG4iLCJ2YXIgX2N1cnJ5MSA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvX2N1cnJ5MScpO1xudmFyIF9pc0FycmF5ID0gcmVxdWlyZSgnLi9pbnRlcm5hbC9faXNBcnJheScpO1xuXG5cbi8qKlxuICogVGVzdHMgd2hldGhlciBvciBub3QgYW4gb2JqZWN0IGlzIHNpbWlsYXIgdG8gYW4gYXJyYXkuXG4gKlxuICogQGZ1bmNcbiAqIEBtZW1iZXJPZiBSXG4gKiBAc2luY2UgdjAuNS4wXG4gKiBAY2F0ZWdvcnkgVHlwZVxuICogQGNhdGVnb3J5IExpc3RcbiAqIEBzaWcgKiAtPiBCb29sZWFuXG4gKiBAcGFyYW0geyp9IHggVGhlIG9iamVjdCB0byB0ZXN0LlxuICogQHJldHVybiB7Qm9vbGVhbn0gYHRydWVgIGlmIGB4YCBoYXMgYSBudW1lcmljIGxlbmd0aCBwcm9wZXJ0eSBhbmQgZXh0cmVtZSBpbmRpY2VzIGRlZmluZWQ7IGBmYWxzZWAgb3RoZXJ3aXNlLlxuICogQGV4YW1wbGVcbiAqXG4gKiAgICAgIFIuaXNBcnJheUxpa2UoW10pOyAvLz0+IHRydWVcbiAqICAgICAgUi5pc0FycmF5TGlrZSh0cnVlKTsgLy89PiBmYWxzZVxuICogICAgICBSLmlzQXJyYXlMaWtlKHt9KTsgLy89PiBmYWxzZVxuICogICAgICBSLmlzQXJyYXlMaWtlKHtsZW5ndGg6IDEwfSk7IC8vPT4gZmFsc2VcbiAqICAgICAgUi5pc0FycmF5TGlrZSh7MDogJ3plcm8nLCA5OiAnbmluZScsIGxlbmd0aDogMTB9KTsgLy89PiB0cnVlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gX2N1cnJ5MShmdW5jdGlvbiBpc0FycmF5TGlrZSh4KSB7XG4gIGlmIChfaXNBcnJheSh4KSkgeyByZXR1cm4gdHJ1ZTsgfVxuICBpZiAoIXgpIHsgcmV0dXJuIGZhbHNlOyB9XG4gIGlmICh0eXBlb2YgeCAhPT0gJ29iamVjdCcpIHsgcmV0dXJuIGZhbHNlOyB9XG4gIGlmICh4IGluc3RhbmNlb2YgU3RyaW5nKSB7IHJldHVybiBmYWxzZTsgfVxuICBpZiAoeC5ub2RlVHlwZSA9PT0gMSkgeyByZXR1cm4gISF4Lmxlbmd0aDsgfVxuICBpZiAoeC5sZW5ndGggPT09IDApIHsgcmV0dXJuIHRydWU7IH1cbiAgaWYgKHgubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiB4Lmhhc093blByb3BlcnR5KDApICYmIHguaGFzT3duUHJvcGVydHkoeC5sZW5ndGggLSAxKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59KTtcbiIsInZhciBfY3VycnkxID0gcmVxdWlyZSgnLi9pbnRlcm5hbC9fY3VycnkxJyk7XG52YXIgX2hhcyA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvX2hhcycpO1xuXG5cbi8qKlxuICogUmV0dXJucyBhIGxpc3QgY29udGFpbmluZyB0aGUgbmFtZXMgb2YgYWxsIHRoZSBlbnVtZXJhYmxlIG93blxuICogcHJvcGVydGllcyBvZiB0aGUgc3VwcGxpZWQgb2JqZWN0LlxuICogTm90ZSB0aGF0IHRoZSBvcmRlciBvZiB0aGUgb3V0cHV0IGFycmF5IGlzIG5vdCBndWFyYW50ZWVkIHRvIGJlXG4gKiBjb25zaXN0ZW50IGFjcm9zcyBkaWZmZXJlbnQgSlMgcGxhdGZvcm1zLlxuICpcbiAqIEBmdW5jXG4gKiBAbWVtYmVyT2YgUlxuICogQHNpbmNlIHYwLjEuMFxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHNpZyB7azogdn0gLT4gW2tdXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gZXh0cmFjdCBwcm9wZXJ0aWVzIGZyb21cbiAqIEByZXR1cm4ge0FycmF5fSBBbiBhcnJheSBvZiB0aGUgb2JqZWN0J3Mgb3duIHByb3BlcnRpZXMuXG4gKiBAZXhhbXBsZVxuICpcbiAqICAgICAgUi5rZXlzKHthOiAxLCBiOiAyLCBjOiAzfSk7IC8vPT4gWydhJywgJ2InLCAnYyddXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuICAvLyBjb3ZlciBJRSA8IDkga2V5cyBpc3N1ZXNcbiAgdmFyIGhhc0VudW1CdWcgPSAhKHt0b1N0cmluZzogbnVsbH0pLnByb3BlcnR5SXNFbnVtZXJhYmxlKCd0b1N0cmluZycpO1xuICB2YXIgbm9uRW51bWVyYWJsZVByb3BzID0gWydjb25zdHJ1Y3RvcicsICd2YWx1ZU9mJywgJ2lzUHJvdG90eXBlT2YnLCAndG9TdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdwcm9wZXJ0eUlzRW51bWVyYWJsZScsICdoYXNPd25Qcm9wZXJ0eScsICd0b0xvY2FsZVN0cmluZyddO1xuXG4gIHZhciBjb250YWlucyA9IGZ1bmN0aW9uIGNvbnRhaW5zKGxpc3QsIGl0ZW0pIHtcbiAgICB2YXIgaWR4ID0gMDtcbiAgICB3aGlsZSAoaWR4IDwgbGlzdC5sZW5ndGgpIHtcbiAgICAgIGlmIChsaXN0W2lkeF0gPT09IGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBpZHggKz0gMTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIHJldHVybiB0eXBlb2YgT2JqZWN0LmtleXMgPT09ICdmdW5jdGlvbicgP1xuICAgIF9jdXJyeTEoZnVuY3Rpb24ga2V5cyhvYmopIHtcbiAgICAgIHJldHVybiBPYmplY3Qob2JqKSAhPT0gb2JqID8gW10gOiBPYmplY3Qua2V5cyhvYmopO1xuICAgIH0pIDpcbiAgICBfY3VycnkxKGZ1bmN0aW9uIGtleXMob2JqKSB7XG4gICAgICBpZiAoT2JqZWN0KG9iaikgIT09IG9iaikge1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9XG4gICAgICB2YXIgcHJvcCwga3MgPSBbXSwgbklkeDtcbiAgICAgIGZvciAocHJvcCBpbiBvYmopIHtcbiAgICAgICAgaWYgKF9oYXMocHJvcCwgb2JqKSkge1xuICAgICAgICAgIGtzW2tzLmxlbmd0aF0gPSBwcm9wO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaGFzRW51bUJ1Zykge1xuICAgICAgICBuSWR4ID0gbm9uRW51bWVyYWJsZVByb3BzLmxlbmd0aCAtIDE7XG4gICAgICAgIHdoaWxlIChuSWR4ID49IDApIHtcbiAgICAgICAgICBwcm9wID0gbm9uRW51bWVyYWJsZVByb3BzW25JZHhdO1xuICAgICAgICAgIGlmIChfaGFzKHByb3AsIG9iaikgJiYgIWNvbnRhaW5zKGtzLCBwcm9wKSkge1xuICAgICAgICAgICAga3Nba3MubGVuZ3RoXSA9IHByb3A7XG4gICAgICAgICAgfVxuICAgICAgICAgIG5JZHggLT0gMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGtzO1xuICAgIH0pO1xufSgpKTtcbiIsInZhciBfY3VycnkyID0gcmVxdWlyZSgnLi9pbnRlcm5hbC9fY3VycnkyJyk7XG52YXIga2V5cyA9IHJlcXVpcmUoJy4va2V5cycpO1xuXG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IG9iamVjdCB3aXRoIHRoZSBvd24gcHJvcGVydGllcyBvZiBgYWBcbiAqIG1lcmdlZCB3aXRoIHRoZSBvd24gcHJvcGVydGllcyBvZiBvYmplY3QgYGJgLlxuICpcbiAqIEBmdW5jXG4gKiBAbWVtYmVyT2YgUlxuICogQHNpbmNlIHYwLjEuMFxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHNpZyB7azogdn0gLT4ge2s6IHZ9IC0+IHtrOiB2fVxuICogQHBhcmFtIHtPYmplY3R9IGFcbiAqIEBwYXJhbSB7T2JqZWN0fSBiXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAZXhhbXBsZVxuICpcbiAqICAgICAgUi5tZXJnZSh7ICduYW1lJzogJ2ZyZWQnLCAnYWdlJzogMTAgfSwgeyAnYWdlJzogNDAgfSk7XG4gKiAgICAgIC8vPT4geyAnbmFtZSc6ICdmcmVkJywgJ2FnZSc6IDQwIH1cbiAqXG4gKiAgICAgIHZhciByZXNldFRvRGVmYXVsdCA9IFIubWVyZ2UoUi5fXywge3g6IDB9KTtcbiAqICAgICAgcmVzZXRUb0RlZmF1bHQoe3g6IDUsIHk6IDJ9KTsgLy89PiB7eDogMCwgeTogMn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBfY3VycnkyKGZ1bmN0aW9uIG1lcmdlKGEsIGIpIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICB2YXIga3MgPSBrZXlzKGEpO1xuICB2YXIgaWR4ID0gMDtcbiAgd2hpbGUgKGlkeCA8IGtzLmxlbmd0aCkge1xuICAgIHJlc3VsdFtrc1tpZHhdXSA9IGFba3NbaWR4XV07XG4gICAgaWR4ICs9IDE7XG4gIH1cbiAga3MgPSBrZXlzKGIpO1xuICBpZHggPSAwO1xuICB3aGlsZSAoaWR4IDwga3MubGVuZ3RoKSB7XG4gICAgcmVzdWx0W2tzW2lkeF1dID0gYltrc1tpZHhdXTtcbiAgICBpZHggKz0gMTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufSk7XG4iLCJ2YXIgX2N1cnJ5MiA9IHJlcXVpcmUoJy4vaW50ZXJuYWwvX2N1cnJ5MicpO1xuXG5cbi8qKlxuICogUmV0dXJucyBhIHBhcnRpYWwgY29weSBvZiBhbiBvYmplY3QgY29udGFpbmluZyBvbmx5IHRoZSBrZXlzIHNwZWNpZmllZC4gIElmIHRoZSBrZXkgZG9lcyBub3QgZXhpc3QsIHRoZVxuICogcHJvcGVydHkgaXMgaWdub3JlZC5cbiAqXG4gKiBAZnVuY1xuICogQG1lbWJlck9mIFJcbiAqIEBzaW5jZSB2MC4xLjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBzaWcgW2tdIC0+IHtrOiB2fSAtPiB7azogdn1cbiAqIEBwYXJhbSB7QXJyYXl9IG5hbWVzIGFuIGFycmF5IG9mIFN0cmluZyBwcm9wZXJ0eSBuYW1lcyB0byBjb3B5IG9udG8gYSBuZXcgb2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gY29weSBmcm9tXG4gKiBAcmV0dXJuIHtPYmplY3R9IEEgbmV3IG9iamVjdCB3aXRoIG9ubHkgcHJvcGVydGllcyBmcm9tIGBuYW1lc2Agb24gaXQuXG4gKiBAc2VlIFIub21pdCwgUi5wcm9wc1xuICogQGV4YW1wbGVcbiAqXG4gKiAgICAgIFIucGljayhbJ2EnLCAnZCddLCB7YTogMSwgYjogMiwgYzogMywgZDogNH0pOyAvLz0+IHthOiAxLCBkOiA0fVxuICogICAgICBSLnBpY2soWydhJywgJ2UnLCAnZiddLCB7YTogMSwgYjogMiwgYzogMywgZDogNH0pOyAvLz0+IHthOiAxfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IF9jdXJyeTIoZnVuY3Rpb24gcGljayhuYW1lcywgb2JqKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgdmFyIGlkeCA9IDA7XG4gIHdoaWxlIChpZHggPCBuYW1lcy5sZW5ndGgpIHtcbiAgICBpZiAobmFtZXNbaWR4XSBpbiBvYmopIHtcbiAgICAgIHJlc3VsdFtuYW1lc1tpZHhdXSA9IG9ialtuYW1lc1tpZHhdXTtcbiAgICB9XG4gICAgaWR4ICs9IDE7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn0pO1xuIiwidmFyIF9jdXJyeTMgPSByZXF1aXJlKCcuL2ludGVybmFsL19jdXJyeTMnKTtcbnZhciBfcmVkdWNlID0gcmVxdWlyZSgnLi9pbnRlcm5hbC9fcmVkdWNlJyk7XG5cblxuLyoqXG4gKiBSZXR1cm5zIGEgc2luZ2xlIGl0ZW0gYnkgaXRlcmF0aW5nIHRocm91Z2ggdGhlIGxpc3QsIHN1Y2Nlc3NpdmVseSBjYWxsaW5nIHRoZSBpdGVyYXRvclxuICogZnVuY3Rpb24gYW5kIHBhc3NpbmcgaXQgYW4gYWNjdW11bGF0b3IgdmFsdWUgYW5kIHRoZSBjdXJyZW50IHZhbHVlIGZyb20gdGhlIGFycmF5LCBhbmRcbiAqIHRoZW4gcGFzc2luZyB0aGUgcmVzdWx0IHRvIHRoZSBuZXh0IGNhbGwuXG4gKlxuICogVGhlIGl0ZXJhdG9yIGZ1bmN0aW9uIHJlY2VpdmVzIHR3byB2YWx1ZXM6ICooYWNjLCB2YWx1ZSkqLiAgSXQgbWF5IHVzZSBgUi5yZWR1Y2VkYCB0b1xuICogc2hvcnRjdXQgdGhlIGl0ZXJhdGlvbi5cbiAqXG4gKiBOb3RlOiBgUi5yZWR1Y2VgIGRvZXMgbm90IHNraXAgZGVsZXRlZCBvciB1bmFzc2lnbmVkIGluZGljZXMgKHNwYXJzZSBhcnJheXMpLCB1bmxpa2VcbiAqIHRoZSBuYXRpdmUgYEFycmF5LnByb3RvdHlwZS5yZWR1Y2VgIG1ldGhvZC4gRm9yIG1vcmUgZGV0YWlscyBvbiB0aGlzIGJlaGF2aW9yLCBzZWU6XG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9yZWR1Y2UjRGVzY3JpcHRpb25cbiAqIEBzZWUgUi5yZWR1Y2VkXG4gKlxuICogRGlzcGF0Y2hlcyB0byB0aGUgYHJlZHVjZWAgbWV0aG9kIG9mIHRoZSB0aGlyZCBhcmd1bWVudCwgaWYgcHJlc2VudC5cbiAqXG4gKiBAZnVuY1xuICogQG1lbWJlck9mIFJcbiAqIEBzaW5jZSB2MC4xLjBcbiAqIEBjYXRlZ29yeSBMaXN0XG4gKiBAc2lnIChhLGIgLT4gYSkgLT4gYSAtPiBbYl0gLT4gYVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGl0ZXJhdG9yIGZ1bmN0aW9uLiBSZWNlaXZlcyB0d28gdmFsdWVzLCB0aGUgYWNjdW11bGF0b3IgYW5kIHRoZVxuICogICAgICAgIGN1cnJlbnQgZWxlbWVudCBmcm9tIHRoZSBhcnJheS5cbiAqIEBwYXJhbSB7Kn0gYWNjIFRoZSBhY2N1bXVsYXRvciB2YWx1ZS5cbiAqIEBwYXJhbSB7QXJyYXl9IGxpc3QgVGhlIGxpc3QgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHJldHVybiB7Kn0gVGhlIGZpbmFsLCBhY2N1bXVsYXRlZCB2YWx1ZS5cbiAqIEBleGFtcGxlXG4gKlxuICogICAgICB2YXIgbnVtYmVycyA9IFsxLCAyLCAzXTtcbiAqICAgICAgdmFyIGFkZCA9IChhLCBiKSA9PiBhICsgYjtcbiAqXG4gKiAgICAgIFIucmVkdWNlKGFkZCwgMTAsIG51bWJlcnMpOyAvLz0+IDE2XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gX2N1cnJ5MyhfcmVkdWNlKTtcbiIsInZhciBfY3VycnkxID0gcmVxdWlyZSgnLi9pbnRlcm5hbC9fY3VycnkxJyk7XG52YXIga2V5cyA9IHJlcXVpcmUoJy4va2V5cycpO1xuXG5cbi8qKlxuICogUmV0dXJucyBhIGxpc3Qgb2YgYWxsIHRoZSBlbnVtZXJhYmxlIG93biBwcm9wZXJ0aWVzIG9mIHRoZSBzdXBwbGllZCBvYmplY3QuXG4gKiBOb3RlIHRoYXQgdGhlIG9yZGVyIG9mIHRoZSBvdXRwdXQgYXJyYXkgaXMgbm90IGd1YXJhbnRlZWQgYWNyb3NzXG4gKiBkaWZmZXJlbnQgSlMgcGxhdGZvcm1zLlxuICpcbiAqIEBmdW5jXG4gKiBAbWVtYmVyT2YgUlxuICogQHNpbmNlIHYwLjEuMFxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHNpZyB7azogdn0gLT4gW3ZdXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIFRoZSBvYmplY3QgdG8gZXh0cmFjdCB2YWx1ZXMgZnJvbVxuICogQHJldHVybiB7QXJyYXl9IEFuIGFycmF5IG9mIHRoZSB2YWx1ZXMgb2YgdGhlIG9iamVjdCdzIG93biBwcm9wZXJ0aWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiAgICAgIFIudmFsdWVzKHthOiAxLCBiOiAyLCBjOiAzfSk7IC8vPT4gWzEsIDIsIDNdXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gX2N1cnJ5MShmdW5jdGlvbiB2YWx1ZXMob2JqKSB7XG4gIHZhciBwcm9wcyA9IGtleXMob2JqKTtcbiAgdmFyIGxlbiA9IHByb3BzLmxlbmd0aDtcbiAgdmFyIHZhbHMgPSBbXTtcbiAgdmFyIGlkeCA9IDA7XG4gIHdoaWxlIChpZHggPCBsZW4pIHtcbiAgICB2YWxzW2lkeF0gPSBvYmpbcHJvcHNbaWR4XV07XG4gICAgaWR4ICs9IDE7XG4gIH1cbiAgcmV0dXJuIHZhbHM7XG59KTtcbiIsInZhciBtZXJnZSA9IHJlcXVpcmUoJ3JhbWRhL3NyYy9tZXJnZScpO1xudmFyIHBpY2sgPSByZXF1aXJlKCdyYW1kYS9zcmMvcGljaycpO1xudmFyIHZhbHVlcyA9IHJlcXVpcmUoJ3JhbWRhL3NyYy92YWx1ZXMnKTtcbnZhciByZWR1Y2UgPSByZXF1aXJlKCdyYW1kYS9zcmMvcmVkdWNlJyk7XG52YXIgc3R5bGVzID0gcmVxdWlyZSgnLi9zdHlsZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFN0eWxlKGV4dGVuZGVkU3R5bGUsIHN0eWxlTmFtZXMpIHtcbiAgdmFyIHN0eWxlTmFtZXNXaXRoRGVmYXVsdCA9IFsnb3REZWZhdWx0cyddLmNvbmNhdChzdHlsZU5hbWVzIHx8IFtdKTtcbiAgdmFyIHN0eWxlc1dpdGhEZWZhdWx0ID0gdmFsdWVzKHBpY2soc3R5bGVOYW1lc1dpdGhEZWZhdWx0LCBzdHlsZXMpKTtcbiAgdmFyIHN0eWxlc1dpdGhFeHRlbmRlZCA9IHN0eWxlc1dpdGhEZWZhdWx0LmNvbmNhdChbZXh0ZW5kZWRTdHlsZSB8fCB7fV0pO1xuICByZXR1cm4gcmVkdWNlKG1lcmdlLCB7fSwgc3R5bGVzV2l0aEV4dGVuZGVkKTtcbn1cbiIsInZhciBoID0gcmVxdWlyZSgnbWVyY3VyeScpLmg7XG52YXIgYnVpbGRTdHlsZSA9IHJlcXVpcmUoJy4uLy4uL2J1aWxkLXN0eWxlJyk7XG52YXIgcG9wVXAgPSByZXF1aXJlKCcuL3BvcC11cCcpO1xuXG52YXIgc3R5bGVzID0ge1xuICBkYXRlUGlja2VyOiBidWlsZFN0eWxlKHtcbiAgICBib3JkZXJMZWZ0OiAnMXB4IHNvbGlkIHJnYmEoMCwwLDAsLjA4KSdcbiAgfSwgWydwaWNrZXJTZWxlY3RvciddKSxcbiAgZGF0ZVBpY2tlckxpbms6IGJ1aWxkU3R5bGUoe30sIFsncGlja2VyTGFiZWwnXSlcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGF0ZVBpY2tlcihzdGF0ZSkge1xuICByZXR1cm4gaCgnZGl2Jywge1xuICAgIHN0eWxlOiBzdHlsZXMuZGF0ZVBpY2tlclxuICB9LCBbXG4gICAgaCgnYScsIHtcbiAgICAgIHN0eWxlOiBzdHlsZXMuZGF0ZVBpY2tlckxpbmtcbiAgICB9LCAnT2N0IDI5LCAyMDE1JyksXG4gICAgcG9wVXAoc3RhdGUpXG4gIF0pO1xufVxuXG4vLyBtb2R1bGUuZXhwb3J0cyA9IHtcbi8vICAgLy8gcmVuZGVyOiAsXG4vLyAgIC8vIGluaXRpYWxTdGF0ZTogLFxuLy8gICAvLyBjaGFubmVsczogLFxuLy8gfVxuIiwidmFyIGggPSByZXF1aXJlKCdtZXJjdXJ5JykuaDtcblxudmFyIHN0eWxlcyA9IHtcbiAgcG9wVXA6IHtcbiAgICB3aWR0aDogJzIyZW0nLFxuICAgIG1heEhlaWdodDogJzIyZW0nLFxuICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgIGxlZnQ6ICdjYWxjKDUwJSAtIDExcmVtKScsXG4gICAgYm9yZGVyUmFkaXVzOiAnM3B4JyxcbiAgICBib3hTaGFkb3c6ICcwIDAgMCAxcHggcmdiYSgwLDAsMCwuMSknLFxuICAgIHBhZGRpbmc6ICcxZW0nLFxuICAgIGJveFNpemluZzogJ2JvcmRlci1ib3gnLFxuICB9LFxuICBwb3BVcEhlYWRlcjoge1xuICAgIGJveFNpemluZzogJ2JvcmRlci1ib3gnLFxuICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgcG9zaXRpb246ICdyZWxhdGl2ZSdcbiAgfSxcbiAgcG9wVXBUYWJsZToge1xuICAgIGJveFNpemluZzogJ2JvcmRlci1ib3gnLFxuICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgYm9yZGVyQ29sbGFwc2U6ICdjb2xsYXBzZScsXG4gICAgYm9yZGVyU3BhY2luZzogMCxcbiAgICB0YWJsZUxheW91dDogJ2ZpeGVkJyxcbiAgICBmb250U2l6ZTogJ2luaGVyaXQnLFxuICAgIHdpZHRoOiAnMTAwJScsXG4gICAgbWFyZ2luVG9wOiAnMXJlbScsXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcG9wVXAoc3RhdGUpIHtcbiAgcmV0dXJuIGgoJ2RpdicsIHtcbiAgICBzdHlsZTogc3R5bGVzLnBvcFVwXG4gIH0sIFtcbiAgICBoKCdkaXYnLCB7XG4gICAgICBzdHlsZTogc3R5bGVzLnBvcFVwSGVhZGVyXG4gICAgfSwgWydmb28nXSksXG5cbiAgICBoKCd0YWJsZScsIHtcbiAgICAgIHN0eWxlOiBzdHlsZXMucG9wVXBUYWJsZVxuICAgIH0sIFtcblxuICAgICAgaCgndGhlYWQnLFxuICAgICAgICBoKCd0cicsIFtcblxuICAgICAgICBdKVxuICAgICAgKVxuICAgIF0pXG4gIF0pO1xufVxuIiwidmFyIGggPSByZXF1aXJlKCdtZXJjdXJ5JykuaDtcbnZhciBidWlsZFN0eWxlID0gcmVxdWlyZSgnLi4vYnVpbGQtc3R5bGUnKTtcblxudmFyIHN0eWxlcyA9IHtcbiAgcGlja2VyOiBidWlsZFN0eWxlKHt9LCBbJ3BpY2tlclNlbGVjdG9yJ10pLFxuICBwaWNrZXJMaW5rOiBidWlsZFN0eWxlKHt9LCBbJ3BpY2tlckxhYmVsJ10pLFxuICBzZWxlY3Q6IGJ1aWxkU3R5bGUoe30sIFsnb3RTZWxlY3QnXSksXG4gIG9wdGlvbjogYnVpbGRTdHlsZSgpXG59O1xuXG5mdW5jdGlvbiBvcHRpb24oY291bnQpIHtcbiAgcmV0dXJuIGgoJ29wdGlvbicsIHtcbiAgICB2YWx1ZTogY291bnQsXG4gICAgc3R5bGU6IHN0eWxlcy5vcHRpb25cbiAgfSwgY291bnQgKyAnIHBlb3BsZScpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGR0cFBpY2tlckZvcm0oc3RhdGUpIHtcbiAgdmFyIG9wdGlvbnMgPSBbMSwgMiwgM10ubWFwKG9wdGlvbik7XG5cbiAgcmV0dXJuIGgoJ2RpdicsIHtcbiAgICAgIHN0eWxlOiBzdHlsZXMucGlja2VyXG4gICAgfSwgW1xuICAgICAgaCgnYScsIHtcbiAgICAgICAgc3R5bGU6IHN0eWxlcy5waWNrZXJMaW5rXG4gICAgICB9LCBzdGF0ZS52aWV3TW9kZWwucGFydHlTaXplICsgJyBwZW9wbGUnKSxcblxuICAgICAgaCgnc2VsZWN0Jywge1xuICAgICAgICBzdHlsZTogc3R5bGVzLnNlbGVjdFxuICAgICAgfSwgb3B0aW9ucylcbiAgICBdXG4gICk7XG59XG4iLCJ2YXIgaCA9IHJlcXVpcmUoJ21lcmN1cnknKS5oO1xudmFyIHBhcnR5U2l6ZVBpY2tlciA9IHJlcXVpcmUoJy4vcGFydHktc2l6ZS1waWNrZXInKTtcbnZhciBkYXRlUGlja2VyID0gcmVxdWlyZSgnLi9kYXRlLXBpY2tlcicpO1xudmFyIGJ1aWxkU3R5bGUgPSByZXF1aXJlKCcuLi9idWlsZC1zdHlsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGR0cFBpY2tlckZvcm0oc3RhdGUpIHtcbiAgcmV0dXJuIGgoJ2Zvcm0nLCB7XG4gICAgc3R5bGU6IGJ1aWxkU3R5bGUoe1xuICAgICAgaGVpZ2h0OiAnM2VtJyxcbiAgICAgIHdpZHRoOiAnNTkuNWVtJyxcbiAgICB9KVxuICB9LCBbXG4gICAgcGFydHlTaXplUGlja2VyKHN0YXRlKSxcbiAgICBkYXRlUGlja2VyKHN0YXRlKVxuICBdKTtcbn1cbiIsInZhciBoZyA9IHJlcXVpcmUoJ21lcmN1cnknKTtcbnZhciBoID0gaGcuaDtcbnZhciBwaWNrZXJGb3JtID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3BpY2tlci1mb3JtJyk7XG5cbmZ1bmN0aW9uIGJ1aWxkSW5pdGlhbFZpZXdNb2RlbCgpIHtcbiAgcmV0dXJuIHtcbiAgICBzaG93U2VhcmNoOiBmYWxzZSxcbiAgICB0aW1lOiAnMjM6MzAnLFxuICAgIGRhdGU6ICcyMDE1LTEwLTEwJyxcbiAgICBwYXJ0eVNpemU6IDIsXG4gICAgdGltZU9wdGlvbnM6IFtcbiAgICAgIHtcbiAgICAgICAgdmFsdWU6ICcyMzozMCcsXG4gICAgICAgIGRpc3BsYXlWYWx1ZTogJzIzOjMwJyxcbiAgICAgIH1cbiAgICBdLFxuICAgIHBhcnR5U2l6ZVNpbmd1bGFyOiAnMSBwZXJzb24nLFxuICAgIHBhcnR5U2l6ZVBsdXJhbDogJzIgcGVvcGxlJyxcbiAgICBwYXJ0eVNpemVMYXJnZXJQYXJ0eTogJ0xhcmdlciBwYXJ0eScsXG4gICAgZmluZEFUYWJsZTogJ0ZpbmQgYSBUYWJsZScsXG4gICAgYXV0b2NvbXBsZXRlUGxhY2Vob2xkZXI6ICdMb2NhdGlvbiBvciBSZXN0YXVyYW50JyxcbiAgICB0aW1lem9uZU9mZnNldDogLTQyMCxcbiAgICBsYW5ndWFnZTogJ2VuJyxcbiAgICBzaG93TGFyZ2VyUGFydHk6IHRydWVcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRJbml0aWFsQXBwU3RhdGUoKSB7XG4gIHJldHVybiBoZy5zdGF0ZSh7XG4gICAgdmlld01vZGVsOiBoZy5zdHJ1Y3QoYnVpbGRJbml0aWFsVmlld01vZGVsKCkpLFxuICAgIGNoYW5uZWxzOiB7fVxuICB9KTtcbn1cblxuXG5mdW5jdGlvbiByZW5kZXIoc3RhdGUpIHtcbiAgcmV0dXJuIHBpY2tlckZvcm0oc3RhdGUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcmVuZGVyOiBmdW5jdGlvbihzZWxlY3Rvcikge1xuICAgIHZhciBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgIGhnLmFwcChlbCwgZ2V0SW5pdGlhbEFwcFN0YXRlKCksIHJlbmRlcik7XG4gIH1cbn07XG5cbi8vIDwlIHZhciBleHRyYUNzc0NsYXNzID0gc2hvd1NlYXJjaCA/IFwiIHdpdGgtc2VhcmNoXCIgOiBcIlwiOyAlPlxuLy8gPGRpdiBjbGFzcz1cImR0cC1waWNrZXIgaGlkZSBkdHAtbGFuZy08JS0gbGFuZ3VhZ2UgKyBleHRyYUNzc0NsYXNzICU+XCI+XG4vLyAgIDxmb3JtIGNsYXNzPVwiZHRwLXBpY2tlci1mb3JtXCI+XG4vLyAgICAgPCUgaWYgKHRpbWV6b25lT2Zmc2V0ICE9IG51bGwpICU+XG4vLyAgICAgICA8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJ0aW1lem9uZU9mZnNldFwiLz5cbi8vICAgICA8JSB9ICU+XG4vLyAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJkYXRlLXBpY2tlciBkdHAtcGlja2VyLXNlbGVjdG9yXCIvPlxuLy8gICAgIDxzZWxlY3QgY2xhc3M9XCJ0aW1lLXBpY2tlciBoaWRlXCI+XG4vLyAgICAgICA8JSBmb3IgKHZhciBpID0gMTsgaSA8IChzaG93TGFyZ2VyUGFydHkgPyAyMiA6IDIxKTsgaSsrKSB7ICU+XG4vLyAgICAgICAgIDwlIGlzU2VsZWN0ZWQgPSBpID09PSBwYXJ0eVNpemU7ICU+XG4vLyAgICAgICAgIDwlIHZhciBkaXNwbGF5VmFsdWUgPSBwYXJ0eVNpemVQbHVyYWwucmVwbGFjZSgnezB9JywgaSk7ICU+XG5cbi8vICAgICAgICAgPCUgaWYgKGkgPT09IDEpIHsgJT5cbi8vICAgICAgICAgICA8JSBkaXNwbGF5VmFsdWUgPSBwYXJ0eVNpemVTaW5ndWxhci5yZXBsYWNlKCd7MH0nLCBpKTsgJT5cbi8vICAgICAgICAgPCUgfSBlbHNlIGlmKGkgPT09IDIxKSAgeyAlPlxuLy8gICAgICAgICAgIDwlIGRpc3BsYXlWYWx1ZSA9IHBhcnR5U2l6ZUxhcmdlclBhcnR5OyAlPlxuLy8gICAgICAgICA8JSB9ICU+XG5cbi8vICAgICAgICAgPCUgaWYoaXNTZWxlY3RlZCkgJT5cbi8vICAgICAgICAgICA8b3B0aW9uIHZhbHVlPTwlLSBpICU+IHNlbGVjdGVkPVwic2VsZWN0ZWRcIj4gPG9wdGlvbj5cbi8vICAgICAgICAgPCUgZWxzZSAlPlxuLy8gICAgICAgICAgIDxvcHRpb24gdmFsdWU9PCUtIGkgJT4+IDwlLSBkaXNwbGF5VmFsdWUgJT4gPG9wdGlvbj5cbi8vICAgICAgICAgPCUgfSAlPlxuLy8gICAgICAgPCUgfSAlPlxuLy8gICAgICAgPCEtLSBpbmNvbXBsZXRlIC0tPlxuLy8gICAgIDwvc2VsZWN0PlxuLy8gICAgIDxpbnB1dCB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJidXR0b24gZHRwLXBpY2tlci1idXR0b25cIi8+XG4vLyAgIDwvZm9ybT5cbi8vIDwvZGl2PlxuXG5cbi8qKlxuICogRHRwIC0gYmluZHMgYWN0aW9ucyB0byBldmVudHMgYW5kIHNldHMgdGhlIHByb3BlciBqcyB0byBzdHlsZSBtZW51c1xuICpcbiAqL1xuXG4vLyBPVC5jcmVhdGVOUygnT1QuQ29tbW9uLkR0cCcpO1xuXG4vLyBPVC5Db21tb24uRHRwID0gKGZ1bmN0aW9uKCQsIF8sIG1vbWVudCl7XG4vLyAgICd1c2Ugc3RyaWN0JztcblxuLy8gICB2YXIgc2VsZWN0b3JzID0ge1xuLy8gICAgIHBhcnR5U2l6ZVBpY2tlcjogJy5wYXJ0eS1zaXplLXBpY2tlcicsXG4vLyAgICAgdGltZVBpY2tlcjogJy50aW1lLXBpY2tlcicsXG4vLyAgICAgZGF0ZVBpY2tlcjogJy5kYXRlLXBpY2tlcicsXG4vLyAgICAgc2VhcmNoVGV4dDogJy5kdHAtcGlja2VyLXNlYXJjaCcsXG4vLyAgICAgZHRwRm9ybTogJy5kdHAtcGlja2VyLWZvcm0nLFxuLy8gICAgIHRpbWV6b25lT2Zmc2V0OiAnaW5wdXRbbmFtZT1cInRpbWV6b25lT2Zmc2V0XCJdJ1xuLy8gICB9O1xuXG4vLyAgIHZhciBEVFBfQ09PS0lFX0lERU5USUZJRVIgPSBcIk9UX2R0cF92YWx1ZXNcIixcbi8vICAgICAgIERUUF9DT09LSUVfTUFYQUdFID0gMzY1KjI0KjYwKjYwKjEwMDA7XG5cbi8vICAgdmFyIHRhYkluZGV4Q291bnRlciA9IDAsXG4vLyAgICAgICBfdmFsaWRhdGVEYXRlVGltZSA9IHRydWUsXG4vLyAgICAgICBfc2hvdWxkRW1pdENoYW5nZWRFdmVudCA9IHRydWU7XG5cbi8vICAgdmFyIGNvb2tpZXMgPSB7XG4vLyAgICAgZ2V0OiBmdW5jdGlvbihrZXkpe1xuLy8gICAgICAgdmFyIGNvb2tpZWQgPSBPVC5Db21tb24uQ29va2llcy5nZXQoRFRQX0NPT0tJRV9JREVOVElGSUVSKTtcbi8vICAgICAgIHJldHVybiB0eXBlb2Yoa2V5KSA9PT0gJ3N0cmluZycgPyAoKCEhY29va2llZCAmJiAhIWNvb2tpZWRba2V5XSkgPyBjb29raWVkW2tleV0gOiB1bmRlZmluZWQpOiBjb29raWVkO1xuLy8gICAgIH0sXG4vLyAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZXMpe1xuLy8gICAgICAgdmFyIGNvb2tpZWRWYWx1ZXMgPSB7fTtcbi8vICAgICAgIGNvb2tpZWRWYWx1ZXNbRFRQX0NPT0tJRV9JREVOVElGSUVSXSA9IF8ucGljayh2YWx1ZXMsICdjb3ZlcnMnLCAnZGF0ZXRpbWUnKTtcblxuLy8gICAgICAgcmV0dXJuIE9ULkNvbW1vbi5Db29raWVzLnNldChjb29raWVkVmFsdWVzLCBEVFBfQ09PS0lFX01BWEFHRSk7XG4vLyAgICAgfVxuLy8gICB9O1xuXG4vLyAgIHZhciBnZXRNZXRyb09mZnNldCA9IGZ1bmN0aW9uKCRkdHApe1xuLy8gICAgIHZhciBtZXRyb09mZnNldCA9IDAsXG4vLyAgICAgICAgICRkdHBPZmZzZXQgPSAkZHRwID8gJGR0cC5maW5kKHNlbGVjdG9ycy50aW1lem9uZU9mZnNldCkgOiBbXTtcblxuLy8gICAgIGlmKCRkdHBPZmZzZXQubGVuZ3RoID4gMCl7XG4vLyAgICAgICBtZXRyb09mZnNldCA9ICRkdHBPZmZzZXQudmFsKCk7XG4vLyAgICAgfSBlbHNlIGlmKCEhcGFnZURhdGEgJiYgcGFnZURhdGEuaGVhZGVyVGltZXpvbmVPZmZzZXQpe1xuLy8gICAgICAgbWV0cm9PZmZzZXQgPSBwYWdlRGF0YS5oZWFkZXJUaW1lem9uZU9mZnNldDtcbi8vICAgICB9XG5cbi8vICAgICByZXR1cm4gbWV0cm9PZmZzZXQ7XG4vLyAgIH07XG5cbi8vICAgdmFyIGdldE1ldHJvRGF0ZVRpbWUgPSBmdW5jdGlvbigkZHRwKXtcbi8vICAgICByZXR1cm4gbW9tZW50KCkudXRjKCkuYWRkKGdldE1ldHJvT2Zmc2V0KCRkdHApLCAnbScpO1xuLy8gICB9O1xuXG4vLyAgIHZhciBzZXRUYWJJbmRleGVzID0gZnVuY3Rpb24oaW5wdXRzLCBzdGFydEluZGV4KXtcbi8vICAgICBpbnB1dHMucGFydHlTaXplUGlja2VyLmF0dHIoXCJ0YWJpbmRleFwiLCBzdGFydEluZGV4ICsgMSk7XG4vLyAgICAgaW5wdXRzLmRhdGVQaWNrZXIuYXR0cihcInRhYmluZGV4XCIsIHN0YXJ0SW5kZXggKyAyKTtcbi8vICAgICBpbnB1dHMudGltZVBpY2tlci5hdHRyKFwidGFiaW5kZXhcIiwgc3RhcnRJbmRleCArIDMpO1xuLy8gICAgIGlucHV0cy5zZWFyY2hUZXh0LmF0dHIoXCJ0YWJpbmRleFwiLCBzdGFydEluZGV4ICsgNCk7XG4vLyAgICAgaW5wdXRzLnNlYXJjaEJ1dHRvbi5hdHRyKFwidGFiaW5kZXhcIiwgc3RhcnRJbmRleCArIDUpO1xuXG4vLyAgICAgcmV0dXJuIHN0YXJ0SW5kZXggKyA1O1xuLy8gICB9O1xuXG4vLyAgIHZhciBzZXRIaWdobGlnaHRpbmcgPSBmdW5jdGlvbihmb3JtSW5wdXRzLCBsYWJlbElucHV0cyl7XG5cbi8vICAgICB2YXIgaGlnaGxpZ2h0T25Gb2N1cyA9IGZ1bmN0aW9uKCRmb3JtSW5wdXQsICRsYWJlbElucHV0KXtcbi8vICAgICAgICRmb3JtSW5wdXQuZm9jdXMoZnVuY3Rpb24oKXtcbi8vICAgICAgICAgJGxhYmVsSW5wdXQuYWRkQ2xhc3MoJ2hpZ2hsaWdodGVkJyk7XG4vLyAgICAgICB9KTtcbi8vICAgICB9O1xuXG4vLyAgICAgdmFyIHVuaGlnaGxpZ2h0T25CbHVyID0gZnVuY3Rpb24oJGZvcm1JbnB1dCwgJGxhYmVsSW5wdXQpe1xuLy8gICAgICAgJGZvcm1JbnB1dC5ibHVyKGZ1bmN0aW9uKCl7XG4vLyAgICAgICAgICRsYWJlbElucHV0LnJlbW92ZUNsYXNzKCdoaWdobGlnaHRlZCcpO1xuLy8gICAgICAgfSk7XG4vLyAgICAgfTtcblxuLy8gICAgIF8uZm9yRWFjaChsYWJlbElucHV0cywgZnVuY3Rpb24oJGxhYmVsSW5wdXQsIGtleSl7XG4vLyAgICAgICBoaWdobGlnaHRPbkZvY3VzKGZvcm1JbnB1dHNba2V5XSwgJGxhYmVsSW5wdXQpO1xuLy8gICAgICAgdW5oaWdobGlnaHRPbkJsdXIoZm9ybUlucHV0c1trZXldLCAkbGFiZWxJbnB1dCk7XG4vLyAgICAgfSk7XG4vLyAgIH07XG5cbi8vICAgdmFyIGR0cCA9IHtcbi8vICAgICBpbml0OiBmdW5jdGlvbihkdHBTZWxlY3Rvcil7XG5cbi8vICAgICAgICQoZHRwU2VsZWN0b3IpLmVhY2goZnVuY3Rpb24oKXtcblxuLy8gICAgICAgICB2YXIgJGR0cCA9ICQodGhpcyk7XG5cbi8vICAgICAgICAgLy8gZW5zdXJlIHRoZSBkdHAgaXMgaGlkZGVuIGJlZm9yZSByZW5kZXJpbmcgaXRcbi8vICAgICAgICAgJGR0cC5hZGRDbGFzcyhcImhpZGVcIik7XG5cbi8vICAgICAgICAgLy8gaW5pdHMgYW5kIHJlbmRlcnMgYWxsIHRoZSBjb21wb25lbnRzXG4vLyAgICAgICAgIHZhciBtZXRyb0RhdGVUaW1lID0gZ2V0TWV0cm9EYXRlVGltZSgkZHRwKSxcbi8vICAgICAgICAgICAgIG1pbkRhdGUgPSBPVC5Db21tb24uSGVscGVycy5nZXRNaW5pbXVtRGF0ZShtZXRyb0RhdGVUaW1lKSxcbi8vICAgICAgICAgICAgICR0aW1lUGlja2VyID0gJGR0cC5maW5kKHNlbGVjdG9ycy50aW1lUGlja2VyKS5PVHNlbGVjdChcImluaXRcIiksXG4vLyAgICAgICAgICAgICAkcGFydHlTaXplUGlja2VyID0gJGR0cC5maW5kKHNlbGVjdG9ycy5wYXJ0eVNpemVQaWNrZXIpLk9Uc2VsZWN0KFwiaW5pdFwiKSxcbi8vICAgICAgICAgICAgICRkYXRlcGlja2VyID0gJGR0cC5maW5kKHNlbGVjdG9ycy5kYXRlUGlja2VyKS5PVGRhdGVwaWNrZXIoXCJpbml0XCIsIG1pbkRhdGUpLFxuLy8gICAgICAgICAgICAgJHNlYXJjaFRleHQgPSAkZHRwLmZpbmQoc2VsZWN0b3JzLnNlYXJjaFRleHQpLFxuLy8gICAgICAgICAgICAgJGZvcm0gPSAkZHRwLmZpbmQoc2VsZWN0b3JzLmR0cEZvcm0pLFxuLy8gICAgICAgICAgICAgZGF0ZVRpbWVWYWxpZGF0b3IgPSBuZXcgT1QuQ29tbW9uLkhlbHBlcnMuZGF0ZVRpbWVWYWxpZGF0b3IoKTtcblxuLy8gICAgICAgICB2YXIgc2VsZWN0SW5pdFZhbHVlRm9yID0ge1xuLy8gICAgICAgICAgIGNvdmVyczogZnVuY3Rpb24oKXtcblxuLy8gICAgICAgICAgICAgdmFyIGlzVmFsaWQgPSBmdW5jdGlvbih2YWwpe1xuLy8gICAgICAgICAgICAgICByZXR1cm4gISF2YWwgJiYgdmFsPD0yMSAmJiB2YWw+MDtcbi8vICAgICAgICAgICAgIH07XG5cbi8vICAgICAgICAgICAgIHZhciB2YWx1ZVdhc1N1cHBsaWVkID0gISRwYXJ0eVNpemVQaWNrZXIuT1RzZWxlY3QoXCJpbmZvXCIpLnVuc2VsZWN0ZWRPbkluaXQsXG4vLyAgICAgICAgICAgICAgICAgc3VwcGxpZWRWYWx1ZSA9IHZhbHVlV2FzU3VwcGxpZWQgPyAkcGFydHlTaXplUGlja2VyLk9Uc2VsZWN0KFwiZ2V0XCIpIDogbnVsbCxcbi8vICAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWUgPSAyO1xuXG4vLyAgICAgICAgICAgICBpZighaXNWYWxpZChzdXBwbGllZFZhbHVlKSl7XG4vLyAgICAgICAgICAgICAgIHZhciBjb29raWVkVmFsdWUgPSBjb29raWVzLmdldCgnY292ZXJzJyksXG4vLyAgICAgICAgICAgICAgICAgICBjb3ZlcnNWYWx1ZSA9IGlzVmFsaWQoY29va2llZFZhbHVlKSA/IGNvb2tpZWRWYWx1ZSA6IGRlZmF1bHRWYWx1ZTtcblxuLy8gICAgICAgICAgICAgICAkcGFydHlTaXplUGlja2VyLk9Uc2VsZWN0KFwic2VsZWN0XCIsIGNvdmVyc1ZhbHVlKTtcbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICB9LFxuLy8gICAgICAgICAgIGRhdGVUaW1lOiBmdW5jdGlvbigpe1xuXG4vLyAgICAgICAgICAgICB2YXIgbWV0cm9EYXRlVGltZSA9IGdldE1ldHJvRGF0ZVRpbWUoJGR0cCksXG4vLyAgICAgICAgICAgICAgICAgbWV0cm9EYXRlID0gbWV0cm9EYXRlVGltZS5mb3JtYXQoXCJZWVlZLU1NLUREXCIpLFxuLy8gICAgICAgICAgICAgICAgIG1ldHJvVGltZSA9IG1ldHJvRGF0ZVRpbWUuZm9ybWF0KFwiSEg6bW1cIik7XG5cbi8vICAgICAgICAgICAgIHZhciBpc1ZhbGlkID0gZnVuY3Rpb24oZGF0ZSwgdGltZSl7XG4vLyAgICAgICAgICAgICAgIGlmKCFkYXRlIHx8ICF0aW1lKXtcbi8vICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4vLyAgICAgICAgICAgICAgIH1cblxuLy8gICAgICAgICAgICAgICB2YXIgdmFsaWRhdGVkID0gZGF0ZVRpbWVWYWxpZGF0b3IuZ2V0KGRhdGUsIHRpbWUsIG1ldHJvRGF0ZSwgbWV0cm9UaW1lKTtcblxuLy8gICAgICAgICAgICAgICByZXR1cm4gdmFsaWRhdGVkLmRhdGUgPT09IGRhdGUgJiYgdmFsaWRhdGVkLnRpbWUgPT09IHRpbWU7XG4vLyAgICAgICAgICAgICB9O1xuXG4vLyAgICAgICAgICAgICB2YXIgc3VwcGxpZWRWYWx1ZSA9IHtcbi8vICAgICAgICAgICAgICAgdGltZTogJHRpbWVQaWNrZXIuT1RzZWxlY3QoXCJpbmZvXCIpLnVuc2VsZWN0ZWRPbkluaXQgPyBudWxsIDogJHRpbWVQaWNrZXIuT1RzZWxlY3QoXCJnZXRcIiksXG4vLyAgICAgICAgICAgICAgIGRhdGU6ICRkYXRlcGlja2VyLk9UZGF0ZXBpY2tlcihcImdldE9yaWdpbmFsVmFsdWVcIilcbi8vICAgICAgICAgICAgIH07XG5cbi8vICAgICAgICAgICAgIHZhciBzZXRWYWx1ZXMgPSAoZnVuY3Rpb24ob3JpZ2luYWxEYXRlLCBvcmlnaW5hbFRpbWUpe1xuLy8gICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24obmV3VmFsdWVzKXtcbi8vICAgICAgICAgICAgICAgICBpZihvcmlnaW5hbERhdGUgIT09IG5ld1ZhbHVlcy5kYXRlKXtcbi8vICAgICAgICAgICAgICAgICAgICRkYXRlcGlja2VyLk9UZGF0ZXBpY2tlcihcInNldFwiLCBuZXdWYWx1ZXMuZGF0ZSk7XG4vLyAgICAgICAgICAgICAgICAgfVxuXG4vLyAgICAgICAgICAgICAgICAgaWYob3JpZ2luYWxUaW1lICE9PSBuZXdWYWx1ZXMudGltZSl7XG4vLyAgICAgICAgICAgICAgICAgICAkdGltZVBpY2tlci5PVHNlbGVjdChcInNlbGVjdFwiLCBuZXdWYWx1ZXMudGltZSk7XG4vLyAgICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgICB9O1xuLy8gICAgICAgICAgICAgfSkoc3VwcGxpZWRWYWx1ZS5kYXRlLCBzdXBwbGllZFZhbHVlLnRpbWUpO1xuXG4vLyAgICAgICAgICAgICBpZighaXNWYWxpZChzdXBwbGllZFZhbHVlLmRhdGUsIHN1cHBsaWVkVmFsdWUudGltZSkpe1xuLy8gICAgICAgICAgICAgICB2YXIgY29va2llZERhdGVUaW1lVmFsdWUgPSBjb29raWVzLmdldCgnZGF0ZXRpbWUnKSxcbi8vICAgICAgICAgICAgICAgICAgIHNwbGl0dGVkID0gISFjb29raWVkRGF0ZVRpbWVWYWx1ZSA/IGNvb2tpZWREYXRlVGltZVZhbHVlLnNwbGl0KFwiIFwiKSA6IFtdLFxuLy8gICAgICAgICAgICAgICAgICAgY29va2llZFZhbHVlID0gc3BsaXR0ZWQubGVuZ3RoID09PSAwID8gdW5kZWZpbmVkIDoge1xuLy8gICAgICAgICAgICAgICAgICAgICBkYXRlOiBzcGxpdHRlZFswXSxcbi8vICAgICAgICAgICAgICAgICAgICAgdGltZTogc3BsaXR0ZWRbMV1cbi8vICAgICAgICAgICAgICAgICAgIH07XG5cbi8vICAgICAgICAgICAgICAgaWYoIWNvb2tpZWRWYWx1ZSl7XG4vLyAgICAgICAgICAgICAgICAgc2V0VmFsdWVzKGRhdGVUaW1lVmFsaWRhdG9yLmdldChzdXBwbGllZFZhbHVlLmRhdGUsIHN1cHBsaWVkVmFsdWUudGltZSwgbWV0cm9EYXRlLCBtZXRyb1RpbWUpKTtcbi8vICAgICAgICAgICAgICAgfSBlbHNlIGlmKGlzVmFsaWQoY29va2llZFZhbHVlLmRhdGUsIGNvb2tpZWRWYWx1ZS50aW1lKSl7XG4vLyAgICAgICAgICAgICAgICAgc2V0VmFsdWVzKGNvb2tpZWRWYWx1ZSk7XG4vLyAgICAgICAgICAgICAgIH0gZWxzZSB7XG4vLyAgICAgICAgICAgICAgICAgc2V0VmFsdWVzKGRhdGVUaW1lVmFsaWRhdG9yLmdldChjb29raWVkVmFsdWUuZGF0ZSwgY29va2llZFZhbHVlLnRpbWUsIG1ldHJvRGF0ZSwgbWV0cm9UaW1lKSk7XG4vLyAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICB9XG4vLyAgICAgICAgIH07XG5cbi8vICAgICAgICAgdmFyIGhpZGVQYXN0VGltZXMgPSBmdW5jdGlvbigpe1xuXG4vLyAgICAgICAgICAgJHRpbWVQaWNrZXIuT1RzZWxlY3QoXCJzaG93QWxsXCIpO1xuXG4vLyAgICAgICAgICAgdmFyIG1ldHJvRGF0ZVRpbWUgPSBnZXRNZXRyb0RhdGVUaW1lKCRkdHApLFxuLy8gICAgICAgICAgICAgICBtZXRyb0RhdGUgPSBtZXRyb0RhdGVUaW1lLmZvcm1hdChcIllZWVktTU0tRERcIiksXG4vLyAgICAgICAgICAgICAgIG1ldHJvVGltZSA9IG1ldHJvRGF0ZVRpbWUuZm9ybWF0KFwiSEg6bW1cIiksXG4vLyAgICAgICAgICAgICAgIGN1cnJlbnREYXRlID0gJGRhdGVwaWNrZXIuT1RkYXRlcGlja2VyKFwiZ2V0XCIsICd5eXl5LW1tLWRkJyksXG4vLyAgICAgICAgICAgICAgIGF2YWlsYWJpbGl0eSA9IE9ULkNvbW1vbi5IZWxwZXJzLnRpbWVTbG90c0F2YWlsYWJpbGl0eSgpLFxuLy8gICAgICAgICAgICAgICBhdmFpbGFibGVUaW1lU2xvdHMgPSBhdmFpbGFiaWxpdHkuZ2V0KGN1cnJlbnREYXRlLCBtZXRyb0RhdGUsIG1ldHJvVGltZSksXG4vLyAgICAgICAgICAgICAgIHRpbWVPcHRpb25zID0gJHRpbWVQaWNrZXIuZmluZChcIm9wdGlvblwiKTtcblxuLy8gICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aW1lT3B0aW9ucy5sZW5ndGg7IGkrKyl7XG4vLyAgICAgICAgICAgICB2YXIgJG9wdGlvbiA9ICQodGltZU9wdGlvbnNbaV0pLFxuLy8gICAgICAgICAgICAgICAgIHZhbHVlID0gJG9wdGlvbi5hdHRyKFwidmFsdWVcIik7XG5cbi8vICAgICAgICAgICAgIGlmKCFfLmNvbnRhaW5zKGF2YWlsYWJsZVRpbWVTbG90cywgdmFsdWUpKXtcbi8vICAgICAgICAgICAgICAgJHRpbWVQaWNrZXIuT1RzZWxlY3QoXCJoaWRlXCIsIHZhbHVlKTtcbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICB9XG4vLyAgICAgICAgIH07XG5cbi8vICAgICAgICAgdmFyIGZpeERhdGVUaW1lVmFsdWVzID0gZnVuY3Rpb24oY2FsbGJhY2spe1xuLy8gICAgICAgICAgIGlmKCFfdmFsaWRhdGVEYXRlVGltZSl7XG4vLyAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbi8vICAgICAgICAgICB9XG5cbi8vICAgICAgICAgICB2YXIgbWV0cm9EYXRlVGltZSA9IGdldE1ldHJvRGF0ZVRpbWUoJGR0cCksXG4vLyAgICAgICAgICAgICAgIG1ldHJvRGF0ZSA9IG1ldHJvRGF0ZVRpbWUuZm9ybWF0KFwiWVlZWS1NTS1ERFwiKSxcbi8vICAgICAgICAgICAgICAgbWV0cm9UaW1lID0gbWV0cm9EYXRlVGltZS5mb3JtYXQoXCJISDptbVwiKSxcbi8vICAgICAgICAgICAgICAgY3VycmVudFRpbWUgPSAkdGltZVBpY2tlci5PVHNlbGVjdChcImdldFwiKSxcbi8vICAgICAgICAgICAgICAgY3VycmVudERhdGUgPSAkZGF0ZXBpY2tlci5PVGRhdGVwaWNrZXIoXCJnZXRcIiwgJ3l5eXktbW0tZGQnKSxcbi8vICAgICAgICAgICAgICAgdmFsaWREYXRlVGltZSA9IGRhdGVUaW1lVmFsaWRhdG9yLmdldChjdXJyZW50RGF0ZSwgY3VycmVudFRpbWUsIG1ldHJvRGF0ZSwgbWV0cm9UaW1lKTtcblxuLy8gICAgICAgICAgIGlmKGN1cnJlbnREYXRlICE9PSB2YWxpZERhdGVUaW1lLmRhdGUpe1xuLy8gICAgICAgICAgICAgJGRhdGVwaWNrZXIuT1RkYXRlcGlja2VyKFwic2V0XCIsIHZhbGlkRGF0ZVRpbWUuZGF0ZSk7XG4vLyAgICAgICAgICAgfSBlbHNlIGlmKGN1cnJlbnRUaW1lICE9PSB2YWxpZERhdGVUaW1lLnRpbWUpe1xuLy8gICAgICAgICAgICAgJHRpbWVQaWNrZXIuT1RzZWxlY3QoXCJzZWxlY3RcIiwgdmFsaWREYXRlVGltZS50aW1lKTtcbi8vICAgICAgICAgICB9IGVsc2UgaWYodHlwZW9mKGNhbGxiYWNrKSA9PT0gJ2Z1bmN0aW9uJyl7XG4vLyAgICAgICAgICAgICBjYWxsYmFjaygpO1xuLy8gICAgICAgICAgIH1cbi8vICAgICAgICAgfTtcblxuLy8gICAgICAgICB2YXIgZm9ybUlucHV0cyA9IHtcbi8vICAgICAgICAgICBwYXJ0eVNpemVQaWNrZXI6ICRwYXJ0eVNpemVQaWNrZXIuZmluZChcInNlbGVjdFwiKSxcbi8vICAgICAgICAgICBkYXRlUGlja2VyOiAkZGF0ZXBpY2tlci5maW5kKFwiaW5wdXRcIiksXG4vLyAgICAgICAgICAgdGltZVBpY2tlcjogJHRpbWVQaWNrZXIuZmluZChcInNlbGVjdFwiKSxcbi8vICAgICAgICAgICBzZWFyY2hUZXh0OiAkc2VhcmNoVGV4dCxcbi8vICAgICAgICAgICBzZWFyY2hCdXR0b246ICRmb3JtLmZpbmQoXCJpbnB1dC5idXR0b25cIilcbi8vICAgICAgICAgfTtcblxuLy8gICAgICAgICB2YXIgbGFiZWxJbnB1dHMgPSB7XG4vLyAgICAgICAgICAgcGFydHlTaXplUGlja2VyOiAkcGFydHlTaXplUGlja2VyLmZpbmQoXCJhXCIpLFxuLy8gICAgICAgICAgIGRhdGVQaWNrZXI6ICRkYXRlcGlja2VyLmZpbmQoXCJhXCIpLFxuLy8gICAgICAgICAgIHRpbWVQaWNrZXI6ICR0aW1lUGlja2VyLmZpbmQoXCJhXCIpLFxuLy8gICAgICAgICAgIHNlYXJjaFRleHQ6ICRzZWFyY2hUZXh0XG4vLyAgICAgICAgIH07XG5cbi8vICAgICAgICAgLy8gc2V0cyB1bmlxdWUgdGFiSW5kZXhlcyB0byB0aGUgY29udHJvbHMgaW4gb3JkZXIgdG8gZW5hYmxlIHN3aXRjaGluZyB2aWEga2V5Ym9hcmQgdGFic1xuLy8gICAgICAgICB0YWJJbmRleENvdW50ZXIgPSBzZXRUYWJJbmRleGVzKGZvcm1JbnB1dHMsIHRhYkluZGV4Q291bnRlcik7XG5cbi8vICAgICAgICAgLy8gYmluZHMgZm9jdXMvYmx1ciBldmVudHMgdG8gY29udHJvbHMgaW4gb3JkZXIgdG8gZW5hYmxlIGxhYmVsIGhpZ2hsaWdodGluZyB3aGVuIG1vdXNlIGNsaWNrL2tleWJvYXJkIHRhYiBzd2l0Y2hpbmdcbi8vICAgICAgICAgc2V0SGlnaGxpZ2h0aW5nKGZvcm1JbnB1dHMsIGxhYmVsSW5wdXRzKTtcblxuLy8gICAgICAgICAvLyBzZXRzIGluaXRpYWwgdmFsdWVzXG4vLyAgICAgICAgIHNlbGVjdEluaXRWYWx1ZUZvci5jb3ZlcnMoKTtcbi8vICAgICAgICAgc2VsZWN0SW5pdFZhbHVlRm9yLmRhdGVUaW1lKCk7XG4vLyAgICAgICAgIGhpZGVQYXN0VGltZXMoKTtcblxuLy8gICAgICAgICAvLyBFdmVudHMgYmluZGluZ3Ncbi8vICAgICAgICAgdmFyIGdldFNlYXJjaE9iaiA9IGZ1bmN0aW9uKCl7XG4vLyAgICAgICAgICAgdmFyIGNvdmVycyA9ICRwYXJ0eVNpemVQaWNrZXIuT1RzZWxlY3QoXCJnZXRcIiksXG4vLyAgICAgICAgICAgICAgIHNlbGVjdGVkVGltZSA9ICR0aW1lUGlja2VyLk9Uc2VsZWN0KFwiZ2V0XCIpLFxuLy8gICAgICAgICAgICAgICBzZWxlY3RlZERhdGUgPSAkZGF0ZXBpY2tlci5PVGRhdGVwaWNrZXIoXCJnZXRcIiwgXCJ5eXl5LW1tLWRkXCIpLFxuLy8gICAgICAgICAgICAgICBkYXRlVGltZSA9IHNlbGVjdGVkRGF0ZSArIFwiIFwiICsgc2VsZWN0ZWRUaW1lLFxuLy8gICAgICAgICAgICAgICBzZWFyY2hUZXh0ID0gJHNlYXJjaFRleHQubGVuZ3RoID4gMCA/ICRzZWFyY2hUZXh0LnZhbCgpIDogZmFsc2U7XG5cbi8vICAgICAgICAgICByZXR1cm4ge1xuLy8gICAgICAgICAgICAgY292ZXJzOiBjb3ZlcnMsXG4vLyAgICAgICAgICAgICBkYXRldGltZTogZGF0ZVRpbWUsXG4vLyAgICAgICAgICAgICBzZWFyY2hUZXh0OiBzZWFyY2hUZXh0LFxuLy8gICAgICAgICAgICAgc2VuZGVyOiAkZHRwXG4vLyAgICAgICAgICAgfTtcbi8vICAgICAgICAgfTtcblxuLy8gICAgICAgICB2YXIgb25EVFBDaGFuZ2VkID0gZnVuY3Rpb24oKXtcbi8vICAgICAgICAgICBpZihfc2hvdWxkRW1pdENoYW5nZWRFdmVudCl7XG4vLyAgICAgICAgICAgICBoaWRlUGFzdFRpbWVzKCk7XG4vLyAgICAgICAgICAgICB2YXIgc2VhcmNoT2JqID0gZ2V0U2VhcmNoT2JqKCk7XG4vLyAgICAgICAgICAgICBjb29raWVzLnNldChzZWFyY2hPYmopO1xuLy8gICAgICAgICAgICAgT1QuRXZlbnRzLmZpcmUoXCJkdHA6Y2hhbmdlXCIsIHNlYXJjaE9iaik7XG4vLyAgICAgICAgICAgfVxuLy8gICAgICAgICB9O1xuXG4vLyAgICAgICAgIHZhciBzZWFyY2hUZXh0VmFsdWUgPSAkc2VhcmNoVGV4dC5sZW5ndGggPiAwID8gJHNlYXJjaFRleHQudmFsKCkgOiBmYWxzZTtcbi8vICAgICAgICAgJHNlYXJjaFRleHQua2V5dXAoZnVuY3Rpb24oKXtcbi8vICAgICAgICAgICB2YXIgbmV3VmFsdWUgPSAkc2VhcmNoVGV4dC5sZW5ndGggPiAwID8gJHNlYXJjaFRleHQudmFsKCkgOiBmYWxzZTtcblxuLy8gICAgICAgICAgIGlmKG5ld1ZhbHVlICE9PSBzZWFyY2hUZXh0VmFsdWUpe1xuLy8gICAgICAgICAgICAgc2VhcmNoVGV4dFZhbHVlID0gbmV3VmFsdWU7XG4vLyAgICAgICAgICAgICBvbkRUUENoYW5nZWQoKTtcbi8vICAgICAgICAgICB9XG4vLyAgICAgICAgIH0pO1xuXG4vLyAgICAgICAgICRmb3JtLnN1Ym1pdChmdW5jdGlvbihlKXtcbi8vICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4vLyAgICAgICAgICAgT1QuRXZlbnRzLmZpcmUoXCJkdHA6c2VhcmNoXCIsIGdldFNlYXJjaE9iaigpKTtcbi8vICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4vLyAgICAgICAgIH0pO1xuXG4vLyAgICAgICAgIE9ULkV2ZW50cy5vbihcImRhdGVwaWNrZXI6Y2hhbmdlXCIsIGZ1bmN0aW9uKGUsIGRhdGEpe1xuLy8gICAgICAgICAgIGlmKGRhdGEuc2VuZGVyLmlzKCRkYXRlcGlja2VyKSl7XG4vLyAgICAgICAgICAgICBmaXhEYXRlVGltZVZhbHVlcyhvbkRUUENoYW5nZWQpO1xuLy8gICAgICAgICAgIH1cbi8vICAgICAgICAgfSk7XG5cbi8vICAgICAgICAgT1QuRXZlbnRzLm9uKFwic2VsZWN0OmNoYW5nZVwiLCBmdW5jdGlvbihlLCBkYXRhKXtcbi8vICAgICAgICAgICBpZihkYXRhLnNlbmRlci5pcygkdGltZVBpY2tlcikpe1xuLy8gICAgICAgICAgICAgZml4RGF0ZVRpbWVWYWx1ZXMob25EVFBDaGFuZ2VkKTtcbi8vICAgICAgICAgICB9IGVsc2UgaWYoZGF0YS5zZW5kZXIuaXMoJHBhcnR5U2l6ZVBpY2tlcikpe1xuLy8gICAgICAgICAgICAgb25EVFBDaGFuZ2VkKCk7XG4vLyAgICAgICAgICAgfVxuLy8gICAgICAgICB9KTtcblxuLy8gICAgICAgICAvLyBhbGwgZG9uZSAtIG1ha2UgaXQgdmlzaWJsZVxuLy8gICAgICAgICAkZHRwLnJlbW92ZUNsYXNzKFwiaGlkZVwiKTtcbi8vICAgICAgICAgT1QuRXZlbnRzLmZpcmUoXCJkdHA6cmVuZGVyZWRcIiwgZ2V0U2VhcmNoT2JqKCkpO1xuLy8gICAgICAgfSk7XG4vLyAgICAgfSxcblxuLy8gICAgIHNldDogZnVuY3Rpb24oJGR0cCwgb2JqKXtcblxuLy8gICAgICAgb2JqID0gb2JqIHx8IHt9O1xuXG4vLyAgICAgICB2YXIgcGFydHlDaGFuZ2VkID0gZmFsc2UsXG4vLyAgICAgICAgICAgdGltZUNoYW5nZWQgPSBmYWxzZSxcbi8vICAgICAgICAgICBkYXRlQ2hhbmdlZCA9IGZhbHNlLFxuLy8gICAgICAgICAgIHNlYXJjaENoYW5nZWQgPSBmYWxzZSxcbi8vICAgICAgICAgICAkcGFydHlTaXplUGlja2VyID0gJGR0cC5maW5kKHNlbGVjdG9ycy5wYXJ0eVNpemVQaWNrZXIpLFxuLy8gICAgICAgICAgICRkYXRlUGlja2VyID0gJGR0cC5maW5kKHNlbGVjdG9ycy5kYXRlUGlja2VyKSxcbi8vICAgICAgICAgICAkdGltZVBpY2tlciA9ICRkdHAuZmluZChzZWxlY3RvcnMudGltZVBpY2tlciksXG4vLyAgICAgICAgICAgJHNlYXJjaFRleHQgPSAkZHRwLmZpbmQoc2VsZWN0b3JzLnNlYXJjaFRleHQpLFxuLy8gICAgICAgICAgIGZpZWxkc0NoYW5nZWQgPSAwLFxuLy8gICAgICAgICAgIGZpZWxkc1RvQ2hhbmdlID0gMDtcblxuLy8gICAgICAgaWYoISFvYmouY292ZXJzKXtcbi8vICAgICAgICAgaWYoJHBhcnR5U2l6ZVBpY2tlci5PVHNlbGVjdChcImdldFwiKS50b1N0cmluZygpICE9PSBvYmouY292ZXJzLnRvU3RyaW5nKCkpe1xuLy8gICAgICAgICAgIHBhcnR5Q2hhbmdlZCA9IHRydWU7XG4vLyAgICAgICAgICAgZmllbGRzVG9DaGFuZ2UrKztcbi8vICAgICAgICAgfVxuLy8gICAgICAgfVxuXG4vLyAgICAgICBpZighIW9iai5kYXRlKXtcbi8vICAgICAgICAgaWYoJGRhdGVQaWNrZXIuT1RkYXRlcGlja2VyKFwiZ2V0XCIsIFwieXl5eS1tbS1kZFwiKS50b1N0cmluZygpICE9PSBvYmouZGF0ZS50b1N0cmluZygpKXtcbi8vICAgICAgICAgICBkYXRlQ2hhbmdlZCA9IHRydWU7XG4vLyAgICAgICAgICAgZmllbGRzVG9DaGFuZ2UrKztcbi8vICAgICAgICAgfVxuLy8gICAgICAgfVxuXG4vLyAgICAgICBpZighIW9iai50aW1lKXtcbi8vICAgICAgICAgaWYoJHRpbWVQaWNrZXIuT1RzZWxlY3QoXCJnZXRcIikudG9TdHJpbmcoKSAhPT0gb2JqLnRpbWUudG9TdHJpbmcoKSl7XG4vLyAgICAgICAgICAgdGltZUNoYW5nZWQgPSB0cnVlO1xuLy8gICAgICAgICAgIGZpZWxkc1RvQ2hhbmdlKys7XG4vLyAgICAgICAgIH1cbi8vICAgICAgIH1cblxuLy8gICAgICAgaWYodHlwZW9mKG9iai5zZWFyY2hUZXh0KSAhPT0gJ3VuZGVmaW5lZCcpe1xuLy8gICAgICAgICBzZWFyY2hDaGFuZ2VkID0gdHJ1ZTtcbi8vICAgICAgICAgZmllbGRzVG9DaGFuZ2UrKztcbi8vICAgICAgIH1cblxuLy8gICAgICAgdmFyIHVwZGF0ZUNoYW5nZUV2ZW50RW1pdHRlckNoZWNrID0gZnVuY3Rpb24oKXtcbi8vICAgICAgICAgX3Nob3VsZEVtaXRDaGFuZ2VkRXZlbnQgPSAoZmllbGRzVG9DaGFuZ2UgLSBmaWVsZHNDaGFuZ2VkKSA8IDI7XG4vLyAgICAgICB9O1xuXG4vLyAgICAgICB1cGRhdGVDaGFuZ2VFdmVudEVtaXR0ZXJDaGVjaygpO1xuXG4vLyAgICAgICBpZihwYXJ0eUNoYW5nZWQpe1xuLy8gICAgICAgICAkcGFydHlTaXplUGlja2VyLk9Uc2VsZWN0KFwic2VsZWN0XCIsIG9iai5jb3ZlcnMpO1xuLy8gICAgICAgICBmaWVsZHNDaGFuZ2VkKys7XG4vLyAgICAgICAgIHVwZGF0ZUNoYW5nZUV2ZW50RW1pdHRlckNoZWNrKCk7XG4vLyAgICAgICB9XG5cbi8vICAgICAgIGlmKGRhdGVDaGFuZ2VkKXtcbi8vICAgICAgICAgaWYodGltZUNoYW5nZWQpe1xuLy8gICAgICAgICAgIF92YWxpZGF0ZURhdGVUaW1lID0gZmFsc2U7XG4vLyAgICAgICAgIH1cbi8vICAgICAgICAgJGRhdGVQaWNrZXIuT1RkYXRlcGlja2VyKFwic2V0XCIsIG9iai5kYXRlKTtcbi8vICAgICAgICAgZmllbGRzQ2hhbmdlZCsrO1xuLy8gICAgICAgICB1cGRhdGVDaGFuZ2VFdmVudEVtaXR0ZXJDaGVjaygpO1xuLy8gICAgICAgfVxuXG4vLyAgICAgICBpZih0aW1lQ2hhbmdlZCl7XG4vLyAgICAgICAgIF92YWxpZGF0ZURhdGVUaW1lID0gdHJ1ZTtcbi8vICAgICAgICAgJHRpbWVQaWNrZXIuT1RzZWxlY3QoXCJzaG93QWxsXCIpO1xuLy8gICAgICAgICAkdGltZVBpY2tlci5PVHNlbGVjdChcInNlbGVjdFwiLCBvYmoudGltZSk7XG4vLyAgICAgICAgIGZpZWxkc0NoYW5nZWQrKztcbi8vICAgICAgICAgdXBkYXRlQ2hhbmdlRXZlbnRFbWl0dGVyQ2hlY2soKTtcbi8vICAgICAgIH1cblxuLy8gICAgICAgaWYoc2VhcmNoQ2hhbmdlZCl7XG4vLyAgICAgICAgIGlmKG9iai5zZWFyY2hUZXh0ID09PSBmYWxzZSl7XG4vLyAgICAgICAgICAgJHNlYXJjaFRleHQudmFsKCcnKS5wYXJlbnQoKS5hZGRDbGFzcyhcImhpZGVcIikucGFyZW50KCkucmVtb3ZlQ2xhc3MoXCJ3aXRoLXNlYXJjaFwiKTtcbi8vICAgICAgICAgfSBlbHNlIHtcbi8vICAgICAgICAgICAkc2VhcmNoVGV4dC52YWwob2JqLnNlYXJjaFRleHQpLnBhcmVudCgpLnJlbW92ZUNsYXNzKFwiaGlkZVwiKS5wYXJlbnQoKS5hZGRDbGFzcyhcIndpdGgtc2VhcmNoXCIpO1xuLy8gICAgICAgICB9XG4vLyAgICAgICAgIGZpZWxkc0NoYW5nZWQrKztcbi8vICAgICAgICAgdXBkYXRlQ2hhbmdlRXZlbnRFbWl0dGVyQ2hlY2soKTtcbi8vICAgICAgIH1cbi8vICAgICB9XG4vLyAgIH07XG5cbi8vICAgJC5mbi5PVGR0cCA9IGZ1bmN0aW9uKGFjdGlvbiwgcGFyYW0pe1xuXG4vLyAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKCl7XG4vLyAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuXG4vLyAgICAgICBpZihhY3Rpb24gPT09IFwiaW5pdFwiKXtcbi8vICAgICAgICAgcmV0dXJuIGR0cC5pbml0KCR0aGlzKTtcbi8vICAgICAgIH0gZWxzZSBpZihhY3Rpb24gPT09IFwic2V0XCIpe1xuLy8gICAgICAgICByZXR1cm4gZHRwLnNldCgkdGhpcywgcGFyYW0pO1xuLy8gICAgICAgfVxuLy8gICAgIH0pO1xuLy8gICB9O1xuXG4vLyAgIHJldHVybiBkdHA7XG4vLyB9KShqUXVlcnksIF8sIG1vbWVudCk7XG4vLyBPVC5jcmVhdGVOUygnT1QuQ29tbW9uLkRhdGVQaWNrZXInKTtcblxuLy8gT1QuQ29tbW9uLkRhdGVQaWNrZXIgPSAoZnVuY3Rpb24oJCwgbW9tZW50KXtcbi8vICAgJ3VzZSBzdHJpY3QnO1xuXG4vLyAgIHZhciBnZXRMYWJlbFZhbHVlID0gZnVuY3Rpb24oJGRwKXtcblxuLy8gICAgIHZhciBzZWxlY3RlZERheSA9ICRkcC5nZXQoJ2hpZ2hsaWdodCcsICd5eXl5LW1tLWRkJyksXG4vLyAgICAgICAgIHRvZGF5ID0gbW9tZW50KCkuZm9ybWF0KCdZWVlZLU1NLUREJyksXG4vLyAgICAgICAgIHRvbW9ycm93ID0gbW9tZW50KCkuYWRkKDEsICdkYXlzJykuZm9ybWF0KCdZWVlZLU1NLUREJyksXG4vLyAgICAgICAgIGlzVG9kYXkgPSAodG9kYXkgPT09IHNlbGVjdGVkRGF5KSxcbi8vICAgICAgICAgaXNUb21vcnJvdyA9ICh0b21vcnJvdyA9PT0gc2VsZWN0ZWREYXkpLFxuLy8gICAgICAgICB0ZXh0TGFiZWwgPSAkZHAuZ2V0KCk7XG5cbi8vICAgICBpZihPVC5Db21tb24uVGVzdE9iamVjdC5pc0FjdGl2ZSgndG9kYXl0b21vcnJvdycpKXtcbi8vICAgICAgIGlmKGlzVG9kYXkpe1xuLy8gICAgICAgICByZXR1cm4gT1QuU1JTLnRvZGF5O1xuLy8gICAgICAgfSBlbHNlIGlmKGlzVG9tb3Jyb3cpIHtcbi8vICAgICAgICAgcmV0dXJuIE9ULlNSUy50b21vcnJvdztcbi8vICAgICAgIH1cbi8vICAgICB9XG5cbi8vICAgICByZXR1cm4gdGV4dExhYmVsO1xuLy8gICB9O1xuXG4vLyAgIHZhciBkYXRlcGlja2VyID0ge1xuLy8gICAgIGdldDogZnVuY3Rpb24oJGRhdGVwaWNrZXIsIG9wdGlvbmFsRm9ybWF0KXtcbi8vICAgICAgIHZhciAkZGF0ZXBpY2tlcklucHV0ID0gJGRhdGVwaWNrZXIuZmluZCgnaW5wdXQnKSxcbi8vICAgICAgICAgICAkcGlja2VyID0gJGRhdGVwaWNrZXJJbnB1dC5waWNrYWRhdGUoJ3BpY2tlcicpO1xuXG4vLyAgICAgICBpZighIW9wdGlvbmFsRm9ybWF0KXtcbi8vICAgICAgICAgcmV0dXJuICRwaWNrZXIuZ2V0KCdzZWxlY3QnLCBvcHRpb25hbEZvcm1hdCk7XG4vLyAgICAgICB9XG5cbi8vICAgICAgIHJldHVybiAkcGlja2VyLmdldCgnc2VsZWN0Jyk7XG4vLyAgICAgfSxcbi8vICAgICBnZXRPcmlnaW5hbFZhbHVlOiBmdW5jdGlvbigkZGF0ZXBpY2tlcil7XG4vLyAgICAgICByZXR1cm4gJGRhdGVwaWNrZXIuZmluZCgnaW5wdXQnKS5hdHRyKCdkYXRhLXZhbHVlJyk7XG4vLyAgICAgfSxcbi8vICAgICBpbml0OiBmdW5jdGlvbigkZGF0ZXBpY2tlciwgbWluRGF0ZSl7XG5cbi8vICAgICAgIHZhciBjc3NDbGFzcyA9ICRkYXRlcGlja2VyLmF0dHIoJ2NsYXNzJyksXG4vLyAgICAgICAgICAgZGF0ZVZhbHVlID0gJGRhdGVwaWNrZXIudmFsKCksXG4vLyAgICAgICAgICAgJHBhcmVudCA9ICRkYXRlcGlja2VyLnBhcmVudCgpLFxuLy8gICAgICAgICAgIGlzSmFwYW5lc2UgPSBmYWxzZSxcbi8vICAgICAgICAgICBjYWxlbmRhclN0YXJ0c1N1bmRheSA9ICh0eXBlb2YoT1QpICE9PSAndW5kZWZpbmVkJyAmJiAhIU9ULlNSUykgPyAhIU9ULlNSUy5jYWxlbmRhclN0YXJ0c1N1bmRheSA6IHRydWU7XG5cbi8vICAgICAgIHZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKGRhdGVWYWx1ZSl7XG5cbi8vICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwiJyArIGNzc0NsYXNzICsgJ1wiPicgK1xuLy8gICAgICAgICAgICAgICAgJyAgPGEgY2xhc3M9XCJkdHAtcGlja2VyLXNlbGVjdG9yLWxpbmsgZGF0ZS1sYWJlbCBkdHAtcGlja2VyLWxhYmVsXCI+JyArIGRhdGVWYWx1ZSArICc8L2E+JyArXG4vLyAgICAgICAgICAgICAgICAnICA8aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwiZGF0ZXBpY2tlclwiIGNsYXNzPVwiZGF0ZXBpY2tlciBkdHAtcGlja2VyLXNlbGVjdFwiIGRhdGEtdmFsdWU9XCInICsgZGF0ZVZhbHVlICsgJ1wiIC8+JyArXG4vLyAgICAgICAgICAgICAgICAnPC9kaXY+Jztcbi8vICAgICAgIH07XG5cbi8vICAgICAgIGlmKGRhdGVWYWx1ZSA9PT0gJycpe1xuLy8gICAgICAgICBkYXRlVmFsdWUgPSBtb21lbnQoKS5mb3JtYXQoJ1lZWVktTU0tREQnKTtcbi8vICAgICAgIH1cblxuLy8gICAgICAgJGRhdGVwaWNrZXIuYWZ0ZXIodGVtcGxhdGUoZGF0ZVZhbHVlKSk7XG4vLyAgICAgICAkZGF0ZXBpY2tlci5yZW1vdmUoKTtcbi8vICAgICAgICRkYXRlcGlja2VyID0gJHBhcmVudC5maW5kKCcuJyArIGNzc0NsYXNzLnJlcGxhY2UoLyAvZywgJy4nKSk7XG5cbi8vICAgICAgIHZhciAkbGFiZWwgPSAkZGF0ZXBpY2tlci5maW5kKCcuZGF0ZS1sYWJlbCcpLFxuLy8gICAgICAgICAgICRkYXRlUGlja2VySW5wdXQgPSAkZGF0ZXBpY2tlci5maW5kKCdpbnB1dCcpO1xuXG4vLyAgICAgICBpZihPVC5TUlMubGFuZyl7XG4vLyAgICAgICAgIHNldHVwTGFuZ3VhZ2UoT1QuU1JTLmxhbmcpO1xuLy8gICAgICAgICBpZihPVC5TUlMubGFuZyA9PT0gJ2phJyl7XG4vLyAgICAgICAgICAgaXNKYXBhbmVzZSA9IHRydWU7XG4vLyAgICAgICAgIH1cbi8vICAgICAgIH1cblxuLy8gICAgICAgdmFyIGZpeEphcGFuZXNlWWVhck1vbnRoTGFiZWwgPSBmdW5jdGlvbigpe1xuLy8gICAgICAgICAvLyBJbiBjYXNlIG9mIEphcGFuZXNlLCB3ZSBkaXNwbGF5IFllYXIgZmlyc3QgKyDlubQgKyBtb250aCBvbiB0aGUgbW9udGgncyBsYWJlbC5cblxuLy8gICAgICAgICB2YXIgJGhlYWRlclllYXIgPSAkZGF0ZXBpY2tlci5maW5kKCcucGlja2VyX195ZWFyJyksXG4vLyAgICAgICAgICAgICAkaGVhZGVyTW9udGggPSAkZGF0ZXBpY2tlci5maW5kKCcucGlja2VyX19tb250aCcpLFxuLy8gICAgICAgICAgICAgJHBhcmVudCA9ICRoZWFkZXJNb250aC5wYXJlbnQoKSxcbi8vICAgICAgICAgICAgIG91dGVySHRtbCA9IGZ1bmN0aW9uKCRlbCl7IHJldHVybiAkKCc8ZGl2IC8+JykuYXBwZW5kKCRlbC5jbG9uZSgpKS5odG1sKCk7IH0sXG4vLyAgICAgICAgICAgICBuZXdIZWFkZXJDb250ZW50ID0gb3V0ZXJIdG1sKCRoZWFkZXJZZWFyKSArIG91dGVySHRtbCgkaGVhZGVyTW9udGgpO1xuXG4vLyAgICAgICAgICRoZWFkZXJZZWFyLnJlbW92ZSgpO1xuLy8gICAgICAgICAkaGVhZGVyTW9udGgucmVtb3ZlKCk7XG4vLyAgICAgICAgICRwYXJlbnQucHJlcGVuZChuZXdIZWFkZXJDb250ZW50KTtcbi8vICAgICAgICAgJGhlYWRlclllYXIgPSAkZGF0ZXBpY2tlci5maW5kKCcucGlja2VyX195ZWFyJyk7XG5cbi8vICAgICAgICAgdmFyIGhlYWRlclllYXJUZXh0ID0gJGhlYWRlclllYXIudGV4dCgpO1xuXG4vLyAgICAgICAgIGlmKGhlYWRlclllYXJUZXh0LmluZGV4T2YoJ+W5tCcpIDwgMCl7XG4vLyAgICAgICAgICAgJGhlYWRlclllYXIudGV4dChoZWFkZXJZZWFyVGV4dCArICflubQnKTtcbi8vICAgICAgICAgfVxuLy8gICAgICAgfTtcblxuLy8gICAgICAgdmFyIGNsb3NlRHBJZk9wZW5lZCA9IGZ1bmN0aW9uKCRkcCl7XG4vLyAgICAgICAgIGlmKCEhJGRwLmdldCgnb3BlbicpKXtcbi8vICAgICAgICAgICAkZHAuY2xvc2UoKTtcbi8vICAgICAgICAgfVxuLy8gICAgICAgfTtcblxuLy8gICAgICAgdmFyIGdldFJlbmRlclBvc2l0aW9uID0gZnVuY3Rpb24oKXtcbi8vICAgICAgICAgdmFyIGNhbGVuZGFySGVpZ2h0ID0gMjkwLFxuLy8gICAgICAgICAgICAgbGFiZWxIZWlnaHQgPSAkZGF0ZVBpY2tlcklucHV0LmhlaWdodCgpLFxuLy8gICAgICAgICAgICAgZGF0ZVBpY2tlck9mZnNldCA9IHBhcnNlSW50KCRkYXRlcGlja2VyLm9mZnNldCgpLnRvcCwgMTApLFxuLy8gICAgICAgICAgICAgYm9keVNjcm9sbCA9IChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCkgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AsXG4vLyAgICAgICAgICAgICAkYm9keSA9ICQoJ2JvZHknKSxcbi8vICAgICAgICAgICAgIGJvZHlIZWlnaHQgPSAkYm9keS5oZWlnaHQoKSxcbi8vICAgICAgICAgICAgIG1hcmdpbkJvdHRvbSA9IGJvZHlTY3JvbGwgKyBib2R5SGVpZ2h0IC0gbGFiZWxIZWlnaHQgLSBkYXRlUGlja2VyT2Zmc2V0LFxuLy8gICAgICAgICAgICAgbWFyZ2luVG9wID0gZGF0ZVBpY2tlck9mZnNldCAtIGJvZHlTY3JvbGw7XG5cbi8vICAgICAgICAgcmV0dXJuIG1hcmdpblRvcCA8IGNhbGVuZGFySGVpZ2h0ID8gJ2Rvd24nIDogKG1hcmdpbkJvdHRvbSA+PSBjYWxlbmRhckhlaWdodCA/ICdkb3duJyA6ICd1cCcpO1xuLy8gICAgICAgfTtcblxuLy8gICAgICAgJGRhdGVQaWNrZXJJbnB1dC5waWNrYWRhdGUoe1xuLy8gICAgICAgICBmaXJzdERheTogY2FsZW5kYXJTdGFydHNTdW5kYXkgPyAwIDogMSxcbi8vICAgICAgICAgbWluOiBtaW5EYXRlID8gbW9tZW50KG1pbkRhdGUpLnRvRGF0ZSgpIDogbmV3IERhdGUoKSxcbi8vICAgICAgICAgZm9ybWF0U3VibWl0OiAneXl5eS1tbS1kZCcsXG4vLyAgICAgICAgIGhpZGRlblByZWZpeDogJ3N1Ym1pdF8nLFxuLy8gICAgICAgICBoaWRkZW5TdWZmaXg6ICcnLFxuLy8gICAgICAgICB0b2RheTogJycsXG4vLyAgICAgICAgIGNsZWFyOiAnJyxcbi8vICAgICAgICAgZm9ybWF0OiBPVC5Db21tb24uSGVscGVycy5nZXREYXRlRm9ybWF0SlMoKSxcbi8vICAgICAgICAgb25TdGFydDogZnVuY3Rpb24gKCkge1xuLy8gICAgICAgICAgIHZhciB0aGlzRGF0ZXBpY2tlciA9IHRoaXM7XG4vLyAgICAgICAgICAgJGxhYmVsLnRleHQoZ2V0TGFiZWxWYWx1ZSh0aGlzRGF0ZXBpY2tlcikpO1xuXG4vLyAgICAgICAgICAgT1QuRXZlbnRzLm9uKCdtZW51czpjbGVhcmVkJywgZnVuY3Rpb24oKXtcbi8vICAgICAgICAgICAgIGlmKCRsYWJlbC5oYXNDbGFzcygncGlja2VyLW9wZW5pbmcnKSl7XG4vLyAgICAgICAgICAgICAgICRsYWJlbC5yZW1vdmVDbGFzcygncGlja2VyLW9wZW5pbmcnKTtcbi8vICAgICAgICAgICAgIH0gZWxzZSB7XG4vLyAgICAgICAgICAgICAgIGNsb3NlRHBJZk9wZW5lZCh0aGlzRGF0ZXBpY2tlcik7XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgfSk7XG4vLyAgICAgICAgIH0sXG5cbi8vICAgICAgICAgb25PcGVuOiBmdW5jdGlvbigpe1xuLy8gICAgICAgICAgIGlmKGlzSmFwYW5lc2Upe1xuLy8gICAgICAgICAgICAgZml4SmFwYW5lc2VZZWFyTW9udGhMYWJlbCgpO1xuLy8gICAgICAgICAgIH1cblxuLy8gICAgICAgICAgICRsYWJlbC5hZGRDbGFzcygncGlja2VyLW9wZW5pbmcnKTtcbi8vICAgICAgICAgICBPVC5Db21tb24uTWVudXMuY2xvc2VBbGxNZW51cygpO1xuLy8gICAgICAgICAgICRsYWJlbC5hZGRDbGFzcygnbWVudS1vcGVuZWQnKTtcblxuLy8gICAgICAgICAgIHZhciAkY2FsID0gJGRhdGVwaWNrZXIuZmluZCgnLnBpY2tlcicpLFxuLy8gICAgICAgICAgICAgICByZW5kZXJQb3NpdGlvbiA9IGdldFJlbmRlclBvc2l0aW9uKCk7XG5cbi8vICAgICAgICAgICAkY2FsLnJlbW92ZUNsYXNzKCd1cCcpLnJlbW92ZUNsYXNzKCdkb3duJykuYWRkQ2xhc3MocmVuZGVyUG9zaXRpb24pO1xuLy8gICAgICAgICB9LFxuLy8gICAgICAgICBvbkNsb3NlOiBmdW5jdGlvbigpe1xuLy8gICAgICAgICAgICRsYWJlbC5yZW1vdmVDbGFzcygnbWVudS1vcGVuZWQnKTtcbi8vICAgICAgICAgfSxcbi8vICAgICAgICAgb25TZXQ6IGZ1bmN0aW9uKCl7XG4vLyAgICAgICAgICAgJGxhYmVsLnRleHQoZ2V0TGFiZWxWYWx1ZSh0aGlzKSk7XG4vLyAgICAgICAgICAgT1QuRXZlbnRzLmZpcmUoJ2RhdGVwaWNrZXI6Y2hhbmdlJywgeyBzZW5kZXI6ICRkYXRlcGlja2VyIH0pO1xuXG4vLyAgICAgICAgICAgaWYoaXNKYXBhbmVzZSl7XG4vLyAgICAgICAgICAgICBmaXhKYXBhbmVzZVllYXJNb250aExhYmVsKCk7XG4vLyAgICAgICAgICAgfVxuLy8gICAgICAgICB9XG4vLyAgICAgICB9KTtcblxuLy8gICAgICAgcmV0dXJuICRkYXRlcGlja2VyO1xuLy8gICAgIH0sXG4vLyAgICAgcmVmcmVzaDogZnVuY3Rpb24oJGRhdGVwaWNrZXIpe1xuLy8gICAgICAgdmFyICRkYXRlcGlja2VySW5wdXQgPSAkZGF0ZXBpY2tlci5maW5kKCdpbnB1dCcpO1xuXG4vLyAgICAgICBpZigkZGF0ZXBpY2tlcklucHV0Lmxlbmd0aCA9PT0gMCl7XG4vLyAgICAgICAgIHJldHVybjtcbi8vICAgICAgIH1cblxuLy8gICAgICAgdmFyICRkcCA9ICRkYXRlcGlja2VySW5wdXQucGlja2FkYXRlKCdwaWNrZXInKTtcblxuLy8gICAgICAgaWYoJGRwLmxlbmd0aCA9PT0gMCl7XG4vLyAgICAgICAgIHJldHVybjtcbi8vICAgICAgIH1cblxuLy8gICAgICAgdmFyICRsYWJlbCA9ICRkYXRlcGlja2VyLmZpbmQoJy5kYXRlLWxhYmVsJyk7XG5cbi8vICAgICAgIGlmKCRsYWJlbC5sZW5ndGggPT09IDApe1xuLy8gICAgICAgICByZXR1cm47XG4vLyAgICAgICB9XG5cbi8vICAgICAgICRsYWJlbC50ZXh0KGdldExhYmVsVmFsdWUoJGRwKSk7XG4vLyAgICAgfSxcbi8vICAgICBzZXQ6IGZ1bmN0aW9uKCRkYXRlcGlja2VyLCB2YWx1ZSwgZm9ybWF0KXtcbi8vICAgICAgIHZhciAkZGF0ZXBpY2tlcklucHV0ID0gJGRhdGVwaWNrZXIuZmluZCgnaW5wdXQnKSxcbi8vICAgICAgICAgICBvcHRpb25hbEZvcm1hdCA9IGZvcm1hdCB8fCB7IGZvcm1hdDogJ3l5eXktbW0tZGQnIH07XG5cbi8vICAgICAgIHJldHVybiAkZGF0ZXBpY2tlcklucHV0LnBpY2thZGF0ZSgncGlja2VyJykuc2V0KCdzZWxlY3QnLCB2YWx1ZSwgb3B0aW9uYWxGb3JtYXQpO1xuLy8gICAgIH1cbi8vICAgfTtcblxuLy8gICB2YXIgc2V0dXBMYW5ndWFnZSA9IGZ1bmN0aW9uKGxhbmcpe1xuLy8gICAgIGlmKGxhbmcgPT09ICdlcycpe1xuLy8gICAgICAgJC5leHRlbmQoJC5mbi5waWNrYWRhdGUuZGVmYXVsdHMsIHtcbi8vICAgICAgICAgbW9udGhzRnVsbDogWyAnZW5lcm8nLCAnZmVicmVybycsICdtYXJ6bycsICdhYnJpbCcsICdtYXlvJywgJ2p1bmlvJywgJ2p1bGlvJywgJ2Fnb3N0bycsICdzZXB0aWVtYnJlJywgJ29jdHVicmUnLCAnbm92aWVtYnJlJywgJ2RpY2llbWJyZScgXSxcbi8vICAgICAgICAgbW9udGhzU2hvcnQ6IFsgJ2VuZScsICdmZWInLCAnbWFyJywgJ2FicicsICdtYXknLCAnanVuJywgJ2p1bCcsICdhZ28nLCAnc2VwJywgJ29jdCcsICdub3YnLCAnZGljJyBdLFxuLy8gICAgICAgICB3ZWVrZGF5c0Z1bGw6IFsgJ2RvbWluZ28nLCAnbHVuZXMnLCAnbWFydGVzJywgJ21pw6lyY29sZXMnLCAnanVldmVzJywgJ3ZpZXJuZXMnLCAnc8OhYmFkbycgXSxcbi8vICAgICAgICAgd2Vla2RheXNTaG9ydDogWyAnZG9tJywgJ2x1bicsICdtYXInLCAnbWnDqScsICdqdWUnLCAndmllJywgJ3PDoWInIF0sXG4vLyAgICAgICAgIHRvZGF5OiAnaG95Jyxcbi8vICAgICAgICAgY2xlYXI6ICdib3JyYXInLFxuLy8gICAgICAgICBsYWJlbE1vbnRoTmV4dDogJ01lcyBwcsOzeGltbycsXG4vLyAgICAgICAgIGxhYmVsTW9udGhQcmV2OiAnTWVzIGFudGVyaW9yJ1xuLy8gICAgICAgfSk7XG4vLyAgICAgfSBlbHNlIGlmKGxhbmcgPT09ICdqYScpe1xuLy8gICAgICAgJC5leHRlbmQoJC5mbi5waWNrYWRhdGUuZGVmYXVsdHMsIHtcbi8vICAgICAgICAgbW9udGhzRnVsbDogWyAnMeaciCcsICcy5pyIJywgJzPmnIgnLCAnNOaciCcsICc15pyIJywgJzbmnIgnLCAnN+aciCcsICc45pyIJywgJznmnIgnLCAnMTDmnIgnLCAnMTHmnIgnLCAnMTLmnIgnIF0sXG4vLyAgICAgICAgIG1vbnRoc1Nob3J0OiBbICcx5pyIJywgJzLmnIgnLCAnM+aciCcsICc05pyIJywgJzXmnIgnLCAnNuaciCcsICc35pyIJywgJzjmnIgnLCAnOeaciCcsICcxMOaciCcsICcxMeaciCcsICcxMuaciCcgXSxcbi8vICAgICAgICAgd2Vla2RheXNGdWxsOiBbICfml6UnLCAn5pyIJywgJ+eBqycsICfmsLQnLCAn5pyoJywgJ+mHkScsICflnJ8nIF0sXG4vLyAgICAgICAgIHdlZWtkYXlzU2hvcnQ6IFsgJ+aXpScsICfmnIgnLCAn54GrJywgJ+awtCcsICfmnKgnLCAn6YeRJywgJ+WcnycgXSxcbi8vICAgICAgICAgdG9kYXk6ICfku4rml6UnLFxuLy8gICAgICAgICBjbGVhcjogJ+a2iOWOuycsXG4vLyAgICAgICAgIGxhYmVsTW9udGhOZXh0OiAn5qyh5pyIJyxcbi8vICAgICAgICAgbGFiZWxNb250aFByZXY6ICfliY3mnIgnXG4vLyAgICAgICB9KTtcbi8vICAgICB9IGVsc2UgaWYobGFuZyA9PT0gJ2ZyJyl7XG4vLyAgICAgICAkLmV4dGVuZCgkLmZuLnBpY2thZGF0ZS5kZWZhdWx0cywge1xuLy8gICAgICAgICBtb250aHNGdWxsOiBbICdKYW52aWVyJywgJ0bDqXZyaWVyJywgJ01hcnMnLCAnQXZyaWwnLCAnTWFpJywgJ0p1aW4nLCAnSnVpbGxldCcsICdBb8O7dCcsICdTZXB0ZW1icmUnLCAnT2N0b2JyZScsICdOb3ZlbWJyZScsICdEw6ljZW1icmUnIF0sXG4vLyAgICAgICAgIG1vbnRoc1Nob3J0OiBbICdKYW4nLCAnRmV2JywgJ01hcicsICdBdnInLCAnTWFpJywgJ0p1aW4nLCAnSnVpbCcsICdBb3UnLCAnU2VwJywgJ09jdCcsICdOb3YnLCAnRGVjJyBdLFxuLy8gICAgICAgICB3ZWVrZGF5c0Z1bGw6IFsgJ0RpbWFuY2hlJywgJ0x1bmRpJywgJ01hcmRpJywgJ01lcmNyZWRpJywgJ0pldWRpJywgJ1ZlbmRyZWRpJywgJ1NhbWVkaScgXSxcbi8vICAgICAgICAgd2Vla2RheXNTaG9ydDogWyAnRGltJywgJ0x1bicsICdNYXInLCAnTWVyJywgJ0pldScsICdWZW4nLCAnU2FtJyBdLFxuLy8gICAgICAgICB0b2RheTogJ0F1am91cmRcXCdodWknLFxuLy8gICAgICAgICBjbGVhcjogJ0VmZmFjZXInLFxuLy8gICAgICAgICBsYWJlbE1vbnRoTmV4dDogJ01vaXMgc3VpdmFudCcsXG4vLyAgICAgICAgIGxhYmVsTW9udGhQcmV2OiAnTW9pcyBwcsOpY8OpZGVudCdcbi8vICAgICAgIH0pO1xuLy8gICAgIH0gZWxzZSBpZihsYW5nID09PSAnZGUnKXtcbi8vICAgICAgICQuZXh0ZW5kKCQuZm4ucGlja2FkYXRlLmRlZmF1bHRzLCB7XG4vLyAgICAgICAgIG1vbnRoc0Z1bGw6IFsgJ0phbnVhcicsICdGZWJydWFyJywgJ03DpHJ6JywgJ0FwcmlsJywgJ01haScsICdKdW5pJywgJ0p1bGknLCAnQXVndXN0JywgJ1NlcHRlbWJlcicsICdPa3RvYmVyJywgJ05vdmVtYmVyJywgJ0RlemVtYmVyJyBdLFxuLy8gICAgICAgICBtb250aHNTaG9ydDogWyAnSmFuJywgJ0ZlYicsICdNw6RyJywgJ0FwcicsICdNYWknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJywgJ09rdCcsICdOb3YnLCAnRGV6JyBdLFxuLy8gICAgICAgICB3ZWVrZGF5c0Z1bGw6IFsgJ1Nvbm50YWcnLCAnTW9udGFnJywgJ0RpZW5zdGFnJywgJ01pdHR3b2NoJywgJ0Rvbm5lcnN0YWcnLCAnRnJlaXRhZycsICdTYW1zdGFnJyBdLFxuLy8gICAgICAgICB3ZWVrZGF5c1Nob3J0OiBbICdTbycsICdNbycsICdEaScsICdNaScsICdEbycsICdGcicsICdTYScgXSxcbi8vICAgICAgICAgdG9kYXk6ICdIZXV0ZScsXG4vLyAgICAgICAgIGNsZWFyOiAnTMO2c2NoZW4nLFxuLy8gICAgICAgICBsYWJlbE1vbnRoTmV4dDogJ07DpGNoc3RlJyxcbi8vICAgICAgICAgbGFiZWxNb250aFByZXY6ICdGcsO8aGVyJ1xuLy8gICAgICAgfSk7XG4vLyAgICAgfVxuLy8gICB9O1xuXG4vLyAgICQuZm4uT1RkYXRlcGlja2VyID0gZnVuY3Rpb24oYWN0aW9uLCBwYXJhbSwgcGFyYW0yKXtcblxuLy8gICAgIHZhciAkdGhpcyA9IHRoaXM7XG5cbi8vICAgICBpZihhY3Rpb24gPT09ICdpbml0Jyl7XG4vLyAgICAgICByZXR1cm4gZGF0ZXBpY2tlci5pbml0KCR0aGlzLCBwYXJhbSk7XG4vLyAgICAgfSBlbHNlIGlmKGFjdGlvbiA9PT0gJ2dldCcpe1xuLy8gICAgICAgcmV0dXJuIGRhdGVwaWNrZXIuZ2V0KCR0aGlzLCBwYXJhbSk7XG4vLyAgICAgfSBlbHNlIGlmKGFjdGlvbiA9PT0gJ2dldE9yaWdpbmFsVmFsdWUnKXtcbi8vICAgICAgIHJldHVybiBkYXRlcGlja2VyLmdldE9yaWdpbmFsVmFsdWUoJHRoaXMsIHBhcmFtKTtcbi8vICAgICB9IGVsc2UgaWYoYWN0aW9uID09PSAncmVmcmVzaCcpe1xuLy8gICAgICAgcmV0dXJuIGRhdGVwaWNrZXIucmVmcmVzaCgkdGhpcyk7XG4vLyAgICAgfSBlbHNlIGlmKGFjdGlvbiA9PT0gJ3NldCcpe1xuLy8gICAgICAgcmV0dXJuIGRhdGVwaWNrZXIuc2V0KCR0aGlzLCBwYXJhbSwgcGFyYW0yKTtcbi8vICAgICB9XG5cbi8vICAgICByZXR1cm4gdGhpcztcbi8vICAgfTtcblxuLy8gICByZXR1cm4ge1xuLy8gICAgIGluaXQ6IGRhdGVwaWNrZXIuaW5pdCxcbi8vICAgICBnZXQ6IGRhdGVwaWNrZXIuZ2V0LFxuLy8gICAgIGdldE9yaWdpbmFsVmFsdWU6IGRhdGVwaWNrZXIuZ2V0T3JpZ2luYWxWYWx1ZSxcbi8vICAgICBzZXQ6IGRhdGVwaWNrZXIuc2V0XG4vLyAgIH07XG5cbi8vIH0pKGpRdWVyeSwgbW9tZW50KTtcbi8vXG4vL1xuLy8gJ3VzZSBzdHJpY3QnO1xuXG4vLyB2YXIgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG4vLyB2YXIgcmVxdWVzdCA9IHJlcXVpcmUoJ3JlcXVlc3QnKTtcbi8vIHZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG4vLyB2YXIgbGFuZ3VhZ2VzID0gcmVxdWlyZSgnLi9sYW5ndWFnZXMnKTtcbi8vIHZhciBvZmZzZXRzID0gcmVxdWlyZSgnLi9vZmZzZXRzJyk7XG5cbi8vIHZhciBnZXQgPSB7XG4vLyAgIGRhdGU6IGZ1bmN0aW9uKGRhdGVUaW1lKXtcbi8vICAgICByZXR1cm4gISFkYXRlVGltZSA/IG1vbWVudChkYXRlVGltZSkuZm9ybWF0KCdZWVlZLU1NLUREJykgOiAnJztcbi8vICAgfSxcbi8vICAgbG9jYWxpc2VkVGltZTogZnVuY3Rpb24odGltZSwgdGhlbWUsIGxhbmcpe1xuLy8gICAgIHZhciBkYXRlVGltZSA9IG1vbWVudCgnMjAwMS0wMS0wMVQnICsgdGltZSksXG4vLyAgICAgICAgIGZvcm1hdHRlZFRpbWUgPSBkYXRlVGltZS5mb3JtYXQoJ0hIOm1tJyk7XG5cbi8vICAgICByZXR1cm4gKCEhdGhlbWUubWF0Y2goJ2NvbXxteCcpICYmIGxhbmcgIT09ICdmcicpID8gZGF0ZVRpbWUuZm9ybWF0KCdoOm1tJykgKyAnICcgKyBkYXRlVGltZS5mb3JtYXQoJ0EnKSA6IGZvcm1hdHRlZFRpbWU7XG4vLyAgIH0sXG4vLyAgIHBhcnR5U2l6ZTogZnVuY3Rpb24ocGFydHlTaXplLCBzaG93TGFyZ2VyUGFydHkpe1xuLy8gICAgIHBhcnR5U2l6ZSA9ICEhcGFydHlTaXplID8gKHBhcnR5U2l6ZSA9PT0gJzIwKycgPyAyMSA6IHBhcnNlSW50KHBhcnR5U2l6ZSwgMTApKSA6IDA7XG4vLyAgICAgcmV0dXJuICghc2hvd0xhcmdlclBhcnR5ICYmIHBhcnR5U2l6ZSA9PT0gMjEpID8gMCA6IHBhcnR5U2l6ZTtcbi8vICAgfSxcbi8vICAgdGltZTogZnVuY3Rpb24oZGF0ZVRpbWUpe1xuLy8gICAgIHJldHVybiAhIWRhdGVUaW1lID8gbW9tZW50KGRhdGVUaW1lLnJlcGxhY2UoJ1onLCAnJykpLmZvcm1hdCgnSEg6bW0nKSA6ICcnO1xuLy8gICB9XG4vLyB9O1xuXG4vLyB2YXIgdGhlbWVzQW5kTGFuZ3MgPSB7XG4vLyAgIGNvbTogWydlbicsICdmciddLFxuLy8gICBjb3VrOiBbJ2VuJ10sXG4vLyAgIGRlOiBbJ2RlJywgJ2VuJ10sXG4vLyAgIGllOiBbJ2VuJ10sXG4vLyAgIGpwOiBbJ2phJywgJ2VuJ10sXG4vLyAgIG14OiBbJ2VzJywgJ2VuJ10sXG4vLyAgIGF1OiBbJ2VuJ11cbi8vIH07XG5cbi8vIHZhciBjYWNoZWQgPSB7fTtcblxuLy8gbW9kdWxlLmV4cG9ydHMuZGF0YSA9IGZ1bmN0aW9uKGNvbnRleHQsIGNhbGxiYWNrKXtcblxuLy8gICB2YXIgaXNBY2NlcHRMYW5ndWFnZVZhbGlkID0gXy5pc0FycmF5KGNvbnRleHQuYWNjZXB0TGFuZ3VhZ2UpICYmICFfLmlzRW1wdHkoY29udGV4dC5hY2NlcHRMYW5ndWFnZSkgJiYgISFjb250ZXh0LmFjY2VwdExhbmd1YWdlWzBdLmNvZGUsXG4vLyAgICAgICBwYXJzZWRMYW5ndWFnZSA9IGlzQWNjZXB0TGFuZ3VhZ2VWYWxpZCA/IGNvbnRleHQuYWNjZXB0TGFuZ3VhZ2VbMF0uY29kZSA6ICcqJyxcbi8vICAgICAgIHRoZW1lQXJnID0gY29udGV4dC5wYXJhbXMudGhlbWUsXG4vLyAgICAgICB0aGVtZSA9ICghIXRoZW1lQXJnICYmIF8uaGFzKHRoZW1lc0FuZExhbmdzLCB0aGVtZUFyZykpID8gdGhlbWVBcmcgOiAnY29tJyxcbi8vICAgICAgIGxhbmdzRm9yVGhlbWUgPSB0aGVtZXNBbmRMYW5nc1t0aGVtZV0sXG4vLyAgICAgICBsYW5ndWFnZSA9IF8uY29udGFpbnMobGFuZ3NGb3JUaGVtZSwgcGFyc2VkTGFuZ3VhZ2UpID8gcGFyc2VkTGFuZ3VhZ2UgOiBsYW5nc0ZvclRoZW1lWzBdLFxuLy8gICAgICAgc2hvd1NlYXJjaCA9IGNvbnRleHQucGFyYW1zLnNob3dTZWFyY2ggfHwgZmFsc2UsXG4vLyAgICAgICBjYWNoZUZsdXNoVGltZW91dCA9IDEwICogNjAgKiAxMDAwO1xuXG4vLyAgIHZhciBnZXRUaW1lem9uZXNEYXRhID0gZnVuY3Rpb24oY2Ipe1xuLy8gICAgIGlmKCEhY2FjaGVkLnRpbWV6b25lcyl7XG4vLyAgICAgICBjYihudWxsLCBjYWNoZWQudGltZXpvbmVzKTtcbi8vICAgICB9IGVsc2Uge1xuLy8gICAgICAgdmFyIGRhdGFBcGlVcmwgPSBjb250ZXh0LnBsdWdpbnMuZGlzY292ZXIoJ29jLWNvcmUtZGF0YScpIHx8IHVuZGVmaW5lZDtcblxuLy8gICAgICAgaWYoISFkYXRhQXBpVXJsKXtcbi8vICAgICAgICAgZGF0YUFwaVVybCArPSAnL29jL2R0cCc7XG5cbi8vICAgICAgICAgcmVxdWVzdCh7XG4vLyAgICAgICAgICAgdXJsOiBkYXRhQXBpVXJsLFxuLy8gICAgICAgICAgIHRpbWVvdXQ6IDMwMDBcbi8vICAgICAgICAgfSwgZnVuY3Rpb24oZXJyLCByZXMsIGJvZHkpe1xuLy8gICAgICAgICAgIGlmKGVyciB8fCByZXMuc3RhdHVzQ29kZSAhPT0gMjAwKXsgcmV0dXJuIGNiKGVyciwgb2Zmc2V0cyk7IH1cbi8vICAgICAgICAgICB0cnkge1xuLy8gICAgICAgICAgICAgdmFyIHZhbHVlID0gSlNPTi5wYXJzZShib2R5KTtcbi8vICAgICAgICAgICAgIGNhY2hlZC50aW1lem9uZXMgPSB2YWx1ZTtcblxuLy8gICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuLy8gICAgICAgICAgICAgICBjYWNoZWQudGltZXpvbmVzID0gbnVsbDtcbi8vICAgICAgICAgICAgIH0sIGNhY2hlRmx1c2hUaW1lb3V0KTtcblxuLy8gICAgICAgICAgICAgY2IobnVsbCwgdmFsdWUpO1xuLy8gICAgICAgICAgIH0gY2F0Y2goZSl7XG4vLyAgICAgICAgICAgICBjYihlLCBvZmZzZXRzKTtcbi8vICAgICAgICAgICB9XG4vLyAgICAgICAgIH0pO1xuLy8gICAgICAgfSBlbHNlIHtcbi8vICAgICAgICAgY2IoJ3NlcnZpY2Ugbm90IGRpc2NvdmVyZWQnLCBvZmZzZXRzKTtcbi8vICAgICAgIH1cbi8vICAgICB9XG4vLyAgIH07XG5cbi8vICAgZ2V0VGltZXpvbmVzRGF0YShmdW5jdGlvbihlcnIsIGRhdGEpe1xuXG4vLyAgICAgdmFyIG9mZnNldHNGb3JUaGVtZSA9IGRhdGFbdGhlbWVdLFxuLy8gICAgICAgICBvZmZzZXRzRm9yTGFuZyA9IF8uY29udGFpbnMoXy5rZXlzKG9mZnNldHNGb3JUaGVtZSksIGxhbmd1YWdlKSA/IG9mZnNldHNGb3JUaGVtZVtsYW5ndWFnZV0gOiBvZmZzZXRzRm9yVGhlbWVbXy5rZXlzKG9mZnNldHNGb3JUaGVtZSlbMF1dLFxuLy8gICAgICAgICBvZmZzZXQgPSBvZmZzZXRzRm9yTGFuZy5kZWZhdWx0O1xuXG4vLyAgICAgaWYoISFjb250ZXh0LnBhcmFtcy5tZXRyb0lkICYmICEhb2Zmc2V0c0ZvckxhbmcuZXhjZXB0aW9ucyAmJiAhIW9mZnNldHNGb3JMYW5nLmV4Y2VwdGlvbnNbY29udGV4dC5wYXJhbXMubWV0cm9JZF0pe1xuLy8gICAgICAgb2Zmc2V0ID0gb2Zmc2V0c0ZvckxhbmcuZXhjZXB0aW9uc1tjb250ZXh0LnBhcmFtcy5tZXRyb0lkXTtcbi8vICAgICB9XG5cbi8vICAgICB2YXIgX18gPSBmdW5jdGlvbih0ZXJtKXtcbi8vICAgICAgIHZhciBkaWN0aW9uYXJ5ID0gbGFuZ3VhZ2VzW2xhbmd1YWdlXTtcbi8vICAgICAgIHJldHVybiBfLmhhcyhkaWN0aW9uYXJ5LCB0ZXJtKSA/IGRpY3Rpb25hcnlbdGVybV0gOiAnJztcbi8vICAgICB9O1xuXG4vLyAgICAgdmFyIHNlYXJjaFBsYWNlaG9sZGVyID0gKCEhc2hvd1NlYXJjaCAmJiAhIWNvbnRleHQucGFyYW1zLnNlYXJjaFBsYWNlaG9sZGVyKSA/IGNvbnRleHQucGFyYW1zLnNlYXJjaFBsYWNlaG9sZGVyIDogX18oJ3RleHRQbGFjZWhvbGRlcicpLFxuLy8gICAgICAgICBzaG93TGFyZ2VyUGFydHkgPSBjb250ZXh0LnBhcmFtcy5zaG93TGFyZ2VyUGFydHkgPT09IGZhbHNlID8gZmFsc2UgOiB0cnVlLFxuLy8gICAgICAgICB0aW1lT3B0aW9ucyA9IFtdO1xuXG4vLyAgICAgZm9yKHZhciBpID0gMDsgaTwyNDsgaSsrKXtcbi8vICAgICAgIHZhciB2YWx1ZSA9IChpIDwgMTAgPyAnMCcgOiAnJykgKyBpICsgJzowMCcsXG4vLyAgICAgICAgICAgaGFsZlZhbHVlID0gKGkgPCAxMCA/ICcwJyA6ICcnKSArIGkgKyAnOjMwJztcblxuLy8gICAgICAgdGltZU9wdGlvbnMucHVzaCh7XG4vLyAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbi8vICAgICAgICAgZGlzcGxheVZhbHVlOiBnZXQubG9jYWxpc2VkVGltZSh2YWx1ZSwgdGhlbWUsIGxhbmd1YWdlKVxuLy8gICAgICAgfSk7XG5cbi8vICAgICAgIHRpbWVPcHRpb25zLnB1c2goe1xuLy8gICAgICAgICB2YWx1ZTogaGFsZlZhbHVlLFxuLy8gICAgICAgICBkaXNwbGF5VmFsdWU6IGdldC5sb2NhbGlzZWRUaW1lKGhhbGZWYWx1ZSwgdGhlbWUsIGxhbmd1YWdlKVxuLy8gICAgICAgfSk7XG4vLyAgICAgfVxuXG4vLyAgICAgY2FsbGJhY2sobnVsbCwge1xuLy8gICAgICAgc2hvd1NlYXJjaDogY29udGV4dC5wYXJhbXMuc2hvd1NlYXJjaCB8fCBmYWxzZSxcbi8vICAgICAgIHRpbWU6IGdldC50aW1lKGNvbnRleHQucGFyYW1zLmRhdGVUaW1lKSxcbi8vICAgICAgIGRhdGU6IGdldC5kYXRlKGNvbnRleHQucGFyYW1zLmRhdGVUaW1lKSxcbi8vICAgICAgIHBhcnR5U2l6ZTogZ2V0LnBhcnR5U2l6ZShjb250ZXh0LnBhcmFtcy5wYXJ0eVNpemUsIHNob3dMYXJnZXJQYXJ0eSksXG4vLyAgICAgICB0aW1lT3B0aW9uczogdGltZU9wdGlvbnMsXG4vLyAgICAgICBwYXJ0eVNpemVTaW5ndWxhcjogX18oJ3BhcnR5U2luZ3VsYXInKSxcbi8vICAgICAgIHBhcnR5U2l6ZVBsdXJhbDogX18oJ3BhcnR5UGx1cmFsJyksXG4vLyAgICAgICBwYXJ0eVNpemVMYXJnZXJQYXJ0eTogX18oJ3BhcnR5TGFyZ2VyJyksXG4vLyAgICAgICBmaW5kQVRhYmxlOiBfXygnZmluZEFUYWJsZScpLFxuLy8gICAgICAgYXV0b2NvbXBsZXRlUGxhY2Vob2xkZXI6IHNlYXJjaFBsYWNlaG9sZGVyLFxuLy8gICAgICAgdGltZXpvbmVPZmZzZXQ6IG9mZnNldCxcbi8vICAgICAgIGxhbmd1YWdlOiBsYW5ndWFnZSxcbi8vICAgICAgIHNob3dMYXJnZXJQYXJ0eTogc2hvd0xhcmdlclBhcnR5XG4vLyAgICAgfSk7XG4vLyAgIH0pO1xuLy8gfTtcbi8vbWl4aW4gcGFydHlTaXplRGlzcGxheVZhbHVlKGlzU2VsZWN0ZWQsIGkpXG4gIC8vIC0gdmFyIGRpc3BsYXlWYWx1ZSA9IHBhcnR5U2l6ZVBsdXJhbC5yZXBsYWNlKCd7MH0nLCBpKTtcbiAgLy8gLSBpZihpID09PSAxKVxuICAvLyAgIC0gZGlzcGxheVZhbHVlID0gcGFydHlTaXplU2luZ3VsYXIucmVwbGFjZSgnezB9JywgaSk7XG4gIC8vIC0gZWxzZSBpZihpID09PSAyMSlcbiAgLy8gICAtIGRpc3BsYXlWYWx1ZSA9IHBhcnR5U2l6ZUxhcmdlclBhcnR5O1xuICAvLyAtIGlmKGlzU2VsZWN0ZWQpXG4gIC8vICAgb3B0aW9uKHZhbHVlPWksIHNlbGVjdGVkPVwic2VsZWN0ZWRcIikgI3tkaXNwbGF5VmFsdWV9XG4gIC8vIC0gZWxzZVxuICAvLyAgIG9wdGlvbih2YWx1ZT1pKSAje2Rpc3BsYXlWYWx1ZX1cblxuLy8gLSB2YXIgZXh0cmFDc3NDbGFzcyA9IHNob3dTZWFyY2ggPyBcIiB3aXRoLXNlYXJjaFwiIDogXCJcIjtcbi8vIGRpdihjbGFzcz1cImR0cC1waWNrZXIgaGlkZSBkdHAtbGFuZy1cIiArIGxhbmd1YWdlICsgZXh0cmFDc3NDbGFzcylcbiAgLy8gZm9ybS5kdHAtcGlja2VyLWZvcm1cbiAgLy8gICAtIGlmICh0aW1lem9uZU9mZnNldCAhPSBudWxsKVxuICAvLyAgICAgaW5wdXQodHlwZT1cImhpZGRlblwiLCBuYW1lPVwidGltZXpvbmVPZmZzZXRcIiwgdmFsdWU9dGltZXpvbmVPZmZzZXQpXG4gIC8vICAgc2VsZWN0LnBhcnR5LXNpemUtcGlja2VyLmhpZGVcbiAgLy8gICAgIC0gZm9yICh2YXIgaSA9IDE7IGkgPCAoc2hvd0xhcmdlclBhcnR5ID8gMjIgOiAyMSk7IGkrKylcbiAgLy8gICAgICAgK3BhcnR5U2l6ZURpc3BsYXlWYWx1ZSgoaSA9PT0gcGFydHlTaXplKSwgaSlcbiAgLy8gICBpbnB1dC5kYXRlLXBpY2tlci5kdHAtcGlja2VyLXNlbGVjdG9yKHZhbHVlPWRhdGUsIHR5cGU9XCJ0ZXh0XCIpXG4gIC8vICAgc2VsZWN0LnRpbWUtcGlja2VyLmhpZGVcbiAgLy8gICAgIC0gZm9yICh2YXIgaSA9IDA7IGkgPCB0aW1lT3B0aW9ucy5sZW5ndGg7IGkrKyl7XG4gIC8vICAgICAgIC0gdmFyIGRpc3BsYXlWYWx1ZSA9IHRpbWVPcHRpb25zW2ldW1wiZGlzcGxheVZhbHVlXCJdO1xuICAvLyAgICAgICAtIHZhciB2YWx1ZSA9IHRpbWVPcHRpb25zW2ldW1widmFsdWVcIl07XG4gIC8vICAgICAgIC0gdmFyIGlzU2VsZWN0ZWQgPSB2YWx1ZSA9PT0gdGltZTtcbiAgLy8gICAgICAgLSBpZihpc1NlbGVjdGVkKVxuICAvLyAgICAgICAgIG9wdGlvbih2YWx1ZT12YWx1ZSwgc2VsZWN0ZWQ9XCJzZWxlY3RlZFwiKSAje2Rpc3BsYXlWYWx1ZX1cbiAgLy8gICAgICAgLSBlbHNlXG4gIC8vICAgICAgICAgb3B0aW9uKHZhbHVlPXZhbHVlKSAje2Rpc3BsYXlWYWx1ZX1cbiAgLy8gICAgIC0gfVxuICAvLyAgIC0gaWYoc2hvd1NlYXJjaCl7XG4gIC8vICAgICBkaXYuZHRwLXBpY2tlci1zZWFyY2gtY29udGFpbmVyXG4gIC8vICAgICAgIGRpdi5kdHAtcGlja2VyLXNlYXJjaC1pY29uLmljb24tc2VhcmNoXG4gIC8vICAgICAgIGlucHV0LmR0cC1waWNrZXItc2VhcmNoKHR5cGU9XCJ0ZXh0XCIsIG5hbWU9XCJzZWFyY2hUZXh0XCIsIHZhbHVlPVwiXCIsIHBsYWNlaG9sZGVyPWF1dG9jb21wbGV0ZVBsYWNlaG9sZGVyLCBkYXRhLWJpbmQ9XCJcIilcbiAgLy8gICAtIH1cbiAgLy8gICBpbnB1dC5idXR0b24uZHRwLXBpY2tlci1idXR0b24odHlwZT1cInN1Ym1pdFwiLCB2YWx1ZT1maW5kQVRhYmxlKVxuICAvL1xuICAvL1xuICAvLyAvLyAgIC8qKlxuIC8vICogU2VsZWN0IC0gdHJhbnNmb3JtIGFuIGh0bWwgc2VsZWN0IHdpdGggb3B0aW9ucyB0byBhIG5ldyBkZXNpZ25lZCBvbmUsXG4gLy8gKiB3aXRoIHN0eWxpbmcsIG1lbnVzLCBoYW5kbGVycywgZXRjLlxuIC8vICpcbiAvLyAqL1xuXG4vLyBPVC5jcmVhdGVOUygnT1QuQ29tbW9uLlNlbGVjdCcpO1xuXG4vLyBPVC5Db21tb24uU2VsZWN0ID0gKGZ1bmN0aW9uKCQsIF8pe1xuICAvLyAndXNlIHN0cmljdCc7XG5cbiAgLy8gdmFyIF9kYXRhID0ge307XG5cbiAgLy8gdmFyIHRlbXBsYXRlID0gZnVuY3Rpb24obSl7XG5cbiAgLy8gICB2YXIgdCA9ICAnPGRpdiBjbGFzcz1cIicgKyBtLmNzc0NsYXNzICsgJyBkdHAtcGlja2VyLXNlbGVjdG9yIHNlbGVjdC1uYXRpdmUnKyAobS51bnNlbGVjdGVkT25Jbml0ID8gXCIgdW5zZWxlY3RlZC1vbi1pbml0XCIgOiAnJykgKydcIj4nICtcbiAgLy8gICAgICAgICAgICAnICA8YSBjbGFzcz1cInNlbGVjdC1sYWJlbCBkdHAtcGlja2VyLXNlbGVjdG9yLWxpbmtcIiB0YWJpbmRleD1cIi0xXCI+JyArIG0uc2VsZWN0ZWRWYWx1ZSArICc8L2E+JyArXG4gIC8vICAgICAgICAgICAgJyAgPHNlbGVjdCBuYW1lPVwiJyArIG0ubmFtZSArICdcIj4nO1xuXG4gIC8vICAgZm9yKHZhciBpID0gMDsgaSA8IG0ub3B0aW9ucy5sZW5ndGg7IGkrKyl7XG4gIC8vICAgICB2YXIgb3B0aW9uID0gIG0ub3B0aW9uc1tpXSxcbiAgLy8gICAgICAgICBpc0NoZWNrZWQgPSBvcHRpb24uc2VsZWN0ZWQgPyBcIiBzZWxlY3RlZD1cXFwic2VsZWN0ZWRcXFwiXCIgOiAnJztcblxuICAvLyAgICAgdCArPSAnICAgIDxvcHRpb24gdmFsdWU9XCInICsgb3B0aW9uLnZhbHVlICsgJ1wiJyArIGlzQ2hlY2tlZCArICc+JyArIG9wdGlvbi5kaXNwbGF5ICsgJzwvb3B0aW9uPic7XG4gIC8vICAgfVxuXG4gIC8vICAgdCArPSAnICA8L3NlbGVjdD4nICtcbiAgLy8gICAgICAgICc8L2Rpdj4nO1xuXG4gIC8vICAgcmV0dXJuIHQ7XG4gIC8vIH07XG5cbiAgLy8gdmFyIGdldFVuaXF1ZU5hbWUgPSBmdW5jdGlvbigpe1xuICAvLyAgIHZhciBjID0gMCxcbiAgLy8gICAgICAgbmFtZSA9IFwiU2VsZWN0X1wiICsgYztcblxuICAvLyAgIHdoaWxlKCQoXCJzZWxlY3RbbmFtZT0nXCIgKyBuYW1lICsgXCInXVwiKS5sZW5ndGggPiAwKXtcbiAgLy8gICAgIGMrKztcbiAgLy8gICAgIG5hbWUgPSBcIlNlbGVjdF9cIiArIGM7XG4gIC8vICAgfVxuXG4gIC8vICAgcmV0dXJuIG5hbWU7XG4gIC8vIH07XG5cbiAgLy8gdmFyIGdldFNlbGVjdE1vZGVsID0gZnVuY3Rpb24oJHNlbGVjdCl7XG5cbiAgLy8gICB2YXIgb3V0ZXJIdG1sID0gZnVuY3Rpb24oJGVsKXsgcmV0dXJuICQoXCI8ZGl2IC8+XCIpLmFwcGVuZCgkZWwuY2xvbmUoKSkuaHRtbCgpOyB9LFxuICAvLyAgICAgICB1bnNlbGVjdGVkT25Jbml0ID0gZmFsc2U7XG5cbiAgLy8gICB2YXIgbmFtZSA9IGdldFVuaXF1ZU5hbWUoKSxcbiAgLy8gICAgICAgbW9kZWwgPSB7XG4gIC8vICAgICAgICAgbmFtZTogbmFtZSxcbiAgLy8gICAgICAgICBjc3NDbGFzczogJHNlbGVjdC5hdHRyKFwiY2xhc3NcIikgfHwgXCJcIixcbiAgLy8gICAgICAgICB1bnNlbGVjdGVkT25Jbml0OiBmYWxzZSxcbiAgLy8gICAgICAgICBvcHRpb25zOiBfLm1hcCgkc2VsZWN0LmZpbmQoXCJvcHRpb25cIiksIGZ1bmN0aW9uKG9wdGlvbil7XG4gIC8vICAgICAgICAgICB2YXIgJG9wdGlvbiA9ICQob3B0aW9uKSxcbiAgLy8gICAgICAgICAgICAgICBzZWxlY3RlZCA9ICRvcHRpb24ucHJvcCgnc2VsZWN0ZWQnKTtcblxuICAvLyAgICAgICAgICAgaWYoISFzZWxlY3RlZCAmJiBvdXRlckh0bWwoJG9wdGlvbikuaW5kZXhPZihcInNlbGVjdGVkXCIpID09PSAtMSl7XG4gIC8vICAgICAgICAgICAgIHVuc2VsZWN0ZWRPbkluaXQgPSB0cnVlO1xuICAvLyAgICAgICAgICAgfVxuXG4gIC8vICAgICAgICAgICByZXR1cm4ge1xuICAvLyAgICAgICAgICAgICBkaXNwbGF5OiAkb3B0aW9uLnRleHQoKSxcbiAgLy8gICAgICAgICAgICAgdmFsdWU6ICRvcHRpb24udmFsKCksXG4gIC8vICAgICAgICAgICAgIHNlbGVjdGVkOiBzZWxlY3RlZFxuICAvLyAgICAgICAgICAgfTtcbiAgLy8gICAgICAgICB9KVxuICAvLyAgICAgICB9O1xuXG4gIC8vICAgX2RhdGFbbmFtZV0gPSBtb2RlbC5vcHRpb25zO1xuXG4gIC8vICAgdmFyIHNlbGVjdGVkID0gXy5maW5kV2hlcmUobW9kZWwub3B0aW9ucywgeyBzZWxlY3RlZDogdHJ1ZSB9KTtcbiAgLy8gICBtb2RlbC5zZWxlY3RlZFZhbHVlID0gISFzZWxlY3RlZCA/IHNlbGVjdGVkLmRpc3BsYXkgOiAnJztcblxuICAvLyAgIGlmKG1vZGVsLnNlbGVjdGVkVmFsdWUgPT09ICcnIHx8IHVuc2VsZWN0ZWRPbkluaXQpe1xuICAvLyAgICAgbW9kZWwudW5zZWxlY3RlZE9uSW5pdCA9IHRydWU7XG4gIC8vICAgfVxuXG4gIC8vICAgcmV0dXJuIG1vZGVsO1xuICAvLyB9O1xuXG4gIC8vIHZhciB0cmFuc2Zvcm1TZWxlY3QgPSBmdW5jdGlvbigkc2VsZWN0KXtcbiAgLy8gICAkc2VsZWN0LmFkZENsYXNzKFwiaGlkZVwiKTtcblxuICAvLyAgIHZhciAkcGFyZW50ID0gJHNlbGVjdC5wYXJlbnQoKSxcbiAgLy8gICAgICAgbW9kZWwgPSBnZXRTZWxlY3RNb2RlbCgkc2VsZWN0KTtcblxuICAvLyAgICRzZWxlY3QuYWZ0ZXIodGVtcGxhdGUobW9kZWwpKTtcbiAgLy8gICAkc2VsZWN0LnJlbW92ZSgpO1xuXG4gIC8vICAgdmFyICRuZXdTZWxlY3QgPSAkcGFyZW50LmZpbmQoXCIuXCIgKyBtb2RlbC5jc3NDbGFzcy5yZXBsYWNlKC8gL2csICcuJykpLFxuICAvLyAgICAgICAkbGFiZWwgPSAkbmV3U2VsZWN0LmZpbmQoXCIuc2VsZWN0LWxhYmVsXCIpO1xuXG4gIC8vICAgJGxhYmVsLnRleHQobW9kZWwuc2VsZWN0ZWRWYWx1ZSk7XG4gIC8vICAgJG5ld1NlbGVjdC5yZW1vdmVDbGFzcyhcImhpZGVcIik7XG5cbiAgLy8gICByZXR1cm4gJG5ld1NlbGVjdDtcbiAgLy8gfTtcblxuICAvLyB2YXIgc2VsZWN0ID0ge1xuXG4gIC8vICAgZ2V0OiBmdW5jdGlvbigkc2VsZWN0KXtcbiAgLy8gICAgIHJldHVybiAkc2VsZWN0LmZpbmQoXCJzZWxlY3RcIikudmFsKCk7XG4gIC8vICAgfSxcblxuICAvLyAgIGhpZGU6IGZ1bmN0aW9uKCRzZWxlY3QsIHZhbHVlcyl7XG4gIC8vICAgICBpZighXy5pc0FycmF5KHZhbHVlcykpe1xuICAvLyAgICAgICB2YWx1ZXMgPSBbdmFsdWVzXTtcbiAgLy8gICAgIH1cblxuICAvLyAgICAgXy5mb3JFYWNoKHZhbHVlcywgZnVuY3Rpb24odmFsdWUpe1xuICAvLyAgICAgICB2YXIgb3B0aW9uVG9IaWRlID0gJHNlbGVjdC5maW5kKFwib3B0aW9uW3ZhbHVlPSdcIiArIHZhbHVlICsgXCInXVwiKTtcbiAgLy8gICAgICAgaWYob3B0aW9uVG9IaWRlLmxlbmd0aCA+IDApe1xuICAvLyAgICAgICAgIG9wdGlvblRvSGlkZS5yZW1vdmUoKTtcbiAgLy8gICAgICAgfVxuICAvLyAgICAgfSk7XG4gIC8vICAgfSxcblxuICAvLyAgIGluZm86IGZ1bmN0aW9uKCRzZWxlY3Qpe1xuICAvLyAgICAgcmV0dXJuIHtcbiAgLy8gICAgICAgdW5zZWxlY3RlZE9uSW5pdDogJHNlbGVjdC5oYXNDbGFzcyhcInVuc2VsZWN0ZWQtb24taW5pdFwiKVxuICAvLyAgICAgfTtcbiAgLy8gICB9LFxuXG4gIC8vICAgaW5pdDogZnVuY3Rpb24oJHNlbGVjdCl7XG4gIC8vICAgICB2YXIgJG5ld1NlbGVjdCA9IHRyYW5zZm9ybVNlbGVjdCgkc2VsZWN0KSxcbiAgLy8gICAgICAgICAkbGFiZWwgPSAkbmV3U2VsZWN0LmZpbmQoXCIuc2VsZWN0LWxhYmVsXCIpLFxuICAvLyAgICAgICAgIHByZXZpb3VzVmFsdWUgPSAkbmV3U2VsZWN0LmZpbmQoXCJzZWxlY3RcIikudmFsKCk7XG5cbiAgLy8gICAgIHZhciByZWZyZXNoID0gZnVuY3Rpb24oJHNlbGVjdCwgY2hlY2tJZkNoYW5nZWQpe1xuICAvLyAgICAgICB2YXIgc2VsZWN0ZWRWYWx1ZSA9ICRzZWxlY3QudmFsKCksXG4gIC8vICAgICAgICAgICAkc2VsZWN0ZWRPcHRpb24gPSAkc2VsZWN0LmZpbmQoXCJvcHRpb25bdmFsdWU9J1wiICsgc2VsZWN0ZWRWYWx1ZSArIFwiJ11cIiksXG4gIC8vICAgICAgICAgICBzZWxlY3RlZERpc3BsYXlWYWx1ZSA9ICRzZWxlY3RlZE9wdGlvbi50ZXh0KCk7XG5cbiAgLy8gICAgICAgaWYoIWNoZWNrSWZDaGFuZ2VkIHx8IHByZXZpb3VzVmFsdWUgIT09IHNlbGVjdGVkVmFsdWUpe1xuICAvLyAgICAgICAgICRsYWJlbC50ZXh0KHNlbGVjdGVkRGlzcGxheVZhbHVlKTtcbiAgLy8gICAgICAgICBwcmV2aW91c1ZhbHVlID0gc2VsZWN0ZWRWYWx1ZTtcbiAgLy8gICAgICAgICBPVC5FdmVudHMuZmlyZShcInNlbGVjdDpjaGFuZ2VcIiwgeyBzZW5kZXI6ICRzZWxlY3QucGFyZW50KCkgfSk7XG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH07XG5cbiAgLy8gICAgICRuZXdTZWxlY3QuZmluZCgnc2VsZWN0Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCl7XG4gIC8vICAgICAgIHJldHVybiByZWZyZXNoKCQodGhpcykpO1xuICAvLyAgICAgfSkub24oJ2tleXVwJywgZnVuY3Rpb24oKXtcbiAgLy8gICAgICAgcmV0dXJuIHJlZnJlc2goJCh0aGlzKSwgdHJ1ZSk7XG4gIC8vICAgICB9KTtcblxuICAvLyAgICAgcmV0dXJuICRuZXdTZWxlY3Q7XG4gIC8vICAgfSxcblxuICAvLyAgIHNlbGVjdDogZnVuY3Rpb24oJHNlbGVjdCwgdmFsdWUpe1xuICAvLyAgICAgdmFyICRzZWxlY3RlZE9wdGlvbiA9ICRzZWxlY3QuZmluZChcIm9wdGlvblt2YWx1ZT0nXCIgKyB2YWx1ZSArIFwiJ11cIiksXG4gIC8vICAgICAgICAgJGxhYmVsID0gJHNlbGVjdC5maW5kKFwiLnNlbGVjdC1sYWJlbFwiKTtcblxuICAvLyAgICAgJHNlbGVjdC5maW5kKFwib3B0aW9uXCIpLnJlbW92ZUF0dHIoXCJzZWxlY3RlZFwiKTtcbiAgLy8gICAgICRzZWxlY3QuZmluZChcInNlbGVjdFwiKS52YWwodmFsdWUpO1xuICAvLyAgICAgJGxhYmVsLnRleHQoJHNlbGVjdGVkT3B0aW9uLnRleHQoKSk7XG5cbiAgLy8gICAgIE9ULkV2ZW50cy5maXJlKFwic2VsZWN0OmNoYW5nZVwiLCB7IHNlbmRlcjogJHNlbGVjdCB9KTtcbiAgLy8gICB9LFxuXG4gIC8vICAgc2hvd0FsbDogZnVuY3Rpb24oJHNlbGVjdCl7XG4gIC8vICAgICB2YXIgc2VsZWN0TmFtZSA9ICRzZWxlY3QuZmluZChcInNlbGVjdFwiKS5hdHRyKFwibmFtZVwiKSxcbiAgLy8gICAgICAgICBpbml0aWFsT3B0aW9ucyA9IF9kYXRhW3NlbGVjdE5hbWVdIHx8IFtdLFxuICAvLyAgICAgICAgIG5ld09wdGlvbnMgPSBcIlwiO1xuXG4gIC8vICAgICBmb3IodmFyIGkgPSAwOyBpIDwgaW5pdGlhbE9wdGlvbnMubGVuZ3RoOyBpKyspe1xuICAvLyAgICAgICB2YXIgb3B0aW9uID0gaW5pdGlhbE9wdGlvbnNbaV07XG4gIC8vICAgICAgIGlmKCRzZWxlY3QuZmluZChcIm9wdGlvblt2YWx1ZT0nXCIgKyBvcHRpb24udmFsdWUgKyBcIiddXCIpLmxlbmd0aCA9PT0gMCl7XG4gIC8vICAgICAgICAgbmV3T3B0aW9ucyArPSBcIjxvcHRpb24gdmFsdWU9J1wiICsgb3B0aW9uLnZhbHVlICsgXCInPlwiICsgb3B0aW9uLmRpc3BsYXkgKyBcIjwvb3B0aW9uPlwiO1xuICAvLyAgICAgICB9XG4gIC8vICAgICB9XG5cbiAgLy8gICAgIGlmKG5ld09wdGlvbnMubGVuZ3RoID4gMCl7XG4gIC8vICAgICAgICRzZWxlY3QuZmluZChcInNlbGVjdFwiKS5wcmVwZW5kKG5ld09wdGlvbnMpO1xuICAvLyAgICAgfVxuICAvLyAgIH1cbiAgLy8gfTtcblxuICAvLyAkLmZuLk9Uc2VsZWN0ID0gZnVuY3Rpb24oYWN0aW9uLCBwYXJhbSl7XG4gIC8vICAgaWYoISFzZWxlY3RbYWN0aW9uXSl7XG4gIC8vICAgICByZXR1cm4gc2VsZWN0W2FjdGlvbl0odGhpcywgcGFyYW0pO1xuICAvLyAgIH1cblxuICAvLyAgIHJldHVybiB0aGlzO1xuICAvLyB9O1xuXG4gIC8vIHJldHVybiB7XG4gIC8vICAgaW5pdDogc2VsZWN0LmluaXQsXG4gIC8vICAgZ2V0OiBzZWxlY3QuZ2V0LFxuICAvLyAgIHNlbGVjdDogc2VsZWN0LnNlbGVjdFxuICAvLyB9O1xuXG4vLyB9KShqUXVlcnksIF8pO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIG90RGVmYXVsdHM6IHJlcXVpcmUoJy4vb3QtZGVmYXVsdHMnKSxcbiAgb3RPcHRpb246IHJlcXVpcmUoJy4vb3Qtb3B0aW9uJyksXG4gIG90U2VsZWN0OiByZXF1aXJlKCcuL290LXNlbGVjdCcpLFxuICBwaWNrZXJMYWJlbDogcmVxdWlyZSgnLi9waWNrZXItbGFiZWwnKSxcbiAgcGlja2VyU2VsZWN0b3I6IHJlcXVpcmUoJy4vcGlja2VyLXNlbGVjdG9yJylcbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJiYWNrZ3JvdW5kXCI6IFwiI0Y3RjdGN1wiLFxuICBcImJveFNpemluZ1wiOiBcImJvcmRlci1ib3hcIixcbiAgXCJjdXJzb3JcIjogXCJkZWZhdWx0XCIsXG4gIFwiZm9udEZhbWlseVwiOiBcIlxcXCJzb3VyY2Utc2Fucy1wcm9cXFwiLFxcXCJIZWx2ZXRpY2EgTmV1ZVxcXCIsSGVsdmV0aWNhLEFyaWFsLHNhbnMtc2VyaWZcIixcbiAgXCJmb250U2l6ZVwiOiBcIjE2cHhcIixcbiAgXCJmb250U3R5bGVcIjogXCJub3JtYWxcIixcbiAgXCJmb250V2VpZ2h0XCI6IDQwMCxcbiAgXCJsaW5lSGVpZ2h0XCI6IFwiMS4yZW1cIixcbiAgXCJtYXJnaW5cIjogMCxcbiAgXCJwYWRkaW5nXCI6IDAsXG4gIFwicG9zaXRpb25cIjogXCJyZWxhdGl2ZVwiXG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiZGlzcGxheVwiOiBcImJsb2NrXCIsXG4gIFwiZm9udFdlaWdodFwiOiBcIm5vcm1hbFwiLFxuICBcIm1pbkhlaWdodFwiOiBcIjEuMmVtXCIsXG4gIFwicGFkZGluZ1wiOiBcIjBweCAycHggMXB4XCIsXG4gIFwid2hpdGVTcGFjZVwiOiBcInByZVwiXG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gICAgXCJiYWNrZ3JvdW5kQ29sb3JcIjogXCIjRkZGXCIsXG4gICAgXCJib3JkZXJSYWRpdXNcIjogXCIwXCIsXG4gICAgXCJjb2xvclwiOiBcIiMzMzNcIixcbiAgICBcImN1cnNvclwiOiBcInBvaW50ZXJcIixcbiAgICBcImhlaWdodFwiOiBcIjEwMCVcIixcbiAgICBcIm9wYWNpdHlcIjogXCIwXCIsXG4gICAgXCJwb3NpdGlvblwiOiBcImFic29sdXRlXCIsXG4gICAgXCJ0b3BcIjogXCIwXCIsXG4gICAgXCJ3aWR0aFwiOiBcIjEwMCVcIixcbiAgICBcInpJbmRleFwiOiBcIjJcIlxufVxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIm92ZXJmbG93XCI6IFwiaGlkZGVuXCIsXG4gIFwid2hpdGUtc3BhY2VcIjogXCJub3dyYXBcIixcbiAgXCJib3JkZXJcIjogXCIxcHggc29saWQgdHJhbnNwYXJlbnRcIixcbiAgXCJkaXNwbGF5XCI6IFwiYmxvY2tcIixcbiAgXCJwYWRkaW5nXCI6IFwiMC44MTI1cmVtIDFyZW1cIixcbiAgXCJjb2xvclwiOiBcImJsYWNrXCIsXG4gIFwiaGVpZ2h0XCI6IFwiM3JlbVwiLFxuICBcInotaW5kZXhcIjogMSxcbiAgXCJ0ZXh0LWRlY29yYXRpb25cIjogXCJub25lXCIsXG4gIFwiYmFja2dyb3VuZFwiOiBcInRyYW5zcGFyZW50XCIsXG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiZmxvYXRcIjogXCJsZWZ0XCIsXG4gIFwiaGVpZ2h0XCI6IFwiMTAwJVwiLFxuICBcIndpZHRoXCI6IFwiMTUlXCJcbn1cbiJdfQ==
