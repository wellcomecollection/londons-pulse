// MERGED SCRIPTS generated 07 April 2021 11:53

// -------------------------------------------------------
// MERGED: /assets/js/draggabilly.js

/*!
 * Draggabilly PACKAGED v1.0.5
 * Make that shiz draggable
 * http://draggabilly.desandro.com
 */

/*!
 * classie - class helper functions
 * from bonzo https://github.com/ded/bonzo
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false */

( function( window ) {

    'use strict';

    // class helper functions from bonzo https://github.com/ded/bonzo

    function classReg( className ) {
        return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
    }

    // classList support for class management
    // altho to be fair, the api sucks because it won't accept multiple classes at once
    var hasClass, addClass, removeClass;

    if ( 'classList' in document.documentElement ) {
        hasClass = function( elem, c ) {
            return elem.classList.contains( c );
        };
        addClass = function( elem, c ) {
            elem.classList.add( c );
        };
        removeClass = function( elem, c ) {
            elem.classList.remove( c );
        };
    }
    else {
        hasClass = function( elem, c ) {
            return classReg( c ).test( elem.className );
        };
        addClass = function( elem, c ) {
            if ( !hasClass( elem, c ) ) {
                elem.className = elem.className + ' ' + c;
            }
        };
        removeClass = function( elem, c ) {
            elem.className = elem.className.replace( classReg( c ), ' ' );
        };
    }

    function toggleClass( elem, c ) {
        var fn = hasClass( elem, c ) ? removeClass : addClass;
        fn( elem, c );
    }

    var classie = {
        // full names
        hasClass:       hasClass,
        addClass:       addClass,
        removeClass:    removeClass,
        toggleClass:    toggleClass,
        // short names
        has:            hasClass,
        add:            addClass,
        remove:         removeClass,
        toggle:         toggleClass
    };

    // transport
    if ( typeof define === 'function' && define.amd ) {
        // AMD
        define( classie );
    } else {
        // browser global
        window.classie = classie;
    }

})( window );

/*!
 * eventie v1.0.3
 * event binding helper
 *   eventie.bind( elem, 'click', myFn )
 *   eventie.unbind( elem, 'click', myFn )
 */

/*jshint browser: true, undef: true, unused: true */
/*global define: false */

( function( window ) {

    'use strict';

    var docElem = document.documentElement;

    var bind = function() {};

    if ( docElem.addEventListener ) {
        bind = function( obj, type, fn ) {
            obj.addEventListener( type, fn, false );
        };
    }
    else if ( docElem.attachEvent ) {
        bind = function( obj, type, fn ) {
            obj[ type + fn ] = fn.handleEvent ?
            function() {
                var event = window.event;
                // add event.target
                event.target = event.target || event.srcElement;
                fn.handleEvent.call( fn, event );
            } :
            function() {
                var event = window.event;
                // add event.target
                event.target = event.target || event.srcElement;
                fn.call( obj, event );
            };
            obj.attachEvent( "on" + type, obj[ type + fn ] );
        };
    }

    var unbind = function() {};

    if ( docElem.removeEventListener ) {
        unbind = function( obj, type, fn ) {
            obj.removeEventListener( type, fn, false );
        };
    }
    else if ( docElem.detachEvent ) {
        unbind = function( obj, type, fn ) {
            obj.detachEvent( "on" + type, obj[ type + fn ] );
            try {
                delete obj[ type + fn ];
            }
            catch ( err ) {
                // can't delete window object properties
                obj[ type + fn ] = undefined;
            }
        };
    }

    var eventie = {
        bind: bind,
        unbind: unbind
    };

    // transport
    if ( typeof define === 'function' && define.amd ) {
        // AMD
        define( eventie );
    }
    else {
        // browser global
        window.eventie = eventie;
    }

})( this );

/*!
 * EventEmitter v4.2.3 - git.io/ee
 * Oliver Caldwell
 * MIT license
 * @preserve
 */

(function () {
    'use strict';

    /**
     * Class for managing events.
     * Can be extended to provide event functionality in other classes.
     *
     * @class EventEmitter Manages event registering and emitting.
     */
    function EventEmitter() {}

    // Shortcuts to improve speed and size

    // Easy access to the prototype
    var proto = EventEmitter.prototype;

    /**
     * Finds the index of the listener for the event in it's storage array.
     *
     * @param {Function[]} listeners Array of listeners to search through.
     * @param {Function} listener Method to look for.
     * @return {Number} Index of the specified listener, -1 if not found
     * @api private
     */
    function indexOfListener(listeners, listener) {
        var i = listeners.length;
        while (i--) {
            if (listeners[i].listener === listener) {
                return i;
            }
        }

        return -1;
    }

    /**
     * Alias a method while keeping the context correct, to allow for overwriting of target method.
     *
     * @param {String} name The name of the target method.
     * @return {Function} The aliased method
     * @api private
     */
    function alias(name) {
        return function aliasClosure() {
            return this[name].apply(this, arguments);
        };
    }

    /**
     * Returns the listener array for the specified event.
     * Will initialise the event object and listener arrays if required.
     * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
     * Each property in the object response is an array of listener functions.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Function[]|Object} All listener functions for the event.
     */
    proto.getListeners = function getListeners(evt) {
        var events = this._getEvents();
        var response;
        var key;

        // Return a concatenated array of all matching events if
        // the selector is a regular expression.
        if (typeof evt === 'object') {
            response = {};
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    response[key] = events[key];
                }
            }
        }
        else {
            response = events[evt] || (events[evt] = []);
        }

        return response;
    };

    /**
     * Takes a list of listener objects and flattens it into a list of listener functions.
     *
     * @param {Object[]} listeners Raw listener objects.
     * @return {Function[]} Just the listener functions.
     */
    proto.flattenListeners = function flattenListeners(listeners) {
        var flatListeners = [];
        var i;

        for (i = 0; i < listeners.length; i += 1) {
            flatListeners.push(listeners[i].listener);
        }

        return flatListeners;
    };

    /**
     * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Object} All listener functions for an event in an object.
     */
    proto.getListenersAsObject = function getListenersAsObject(evt) {
        var listeners = this.getListeners(evt),
            response;

        if (listeners instanceof Array) {
            response = {};
            response[evt] = listeners;
        }

        return response || listeners;
    };

    /**
     * Adds a listener function to the specified event.
     * The listener will not be added if it is a duplicate.
     * If the listener returns true then it will be removed after it is called.
     * If you pass a regular expression as the event name then the listener will be added to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListener = function addListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt),
            listenerIsWrapped = typeof listener === 'object',
            key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
                listeners[key].push(listenerIsWrapped ? listener : {
                    listener: listener,
                    once: false
                });
            }
        }

        return this;
    };

    /**
     * Alias of addListener
     */
    proto.on = alias('addListener');

    /**
     * Semi-alias of addListener. It will add a listener that will be
     * automatically removed after it's first execution.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addOnceListener = function addOnceListener(evt, listener) {
        return this.addListener(evt, {
            listener: listener,
            once: true
        });
    };

    /**
     * Alias of addOnceListener.
     */
    proto.once = alias('addOnceListener');

    /**
     * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
     * You need to tell it what event names should be matched by a regex.
     *
     * @param {String} evt Name of the event to create.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvent = function defineEvent(evt) {
        this.getListeners(evt);
        return this;
    };

    /**
     * Uses defineEvent to define multiple events.
     *
     * @param {String[]} evts An array of event names to define.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvents = function defineEvents(evts) {
        for (var i = 0; i < evts.length; i += 1) {
            this.defineEvent(evts[i]);
        }
        return this;
    };

    /**
     * Removes a listener function from the specified event.
     * When passed a regular expression as the event name, it will remove the listener from all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to remove the listener from.
     * @param {Function} listener Method to remove from the event.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListener = function removeListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var index;
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                index = indexOfListener(listeners[key], listener);

                if (index !== -1) {
                    listeners[key].splice(index, 1);
                }
            }
        }

        return this;
    };

    /**
     * Alias of removeListener
     */
    proto.off = alias('removeListener');

    /**
     * Adds listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
     * You can also pass it a regular expression to add the array of listeners to all events that match it.
     * Yeah, this function does quite a bit. That's probably a bad thing.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListeners = function addListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(false, evt, listeners);
    };

    /**
     * Removes listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be removed.
     * You can also pass it a regular expression to remove the listeners from all events that match it.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListeners = function removeListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(true, evt, listeners);
    };

    /**
     * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
     * The first argument will determine if the listeners are removed (true) or added (false).
     * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be added/removed.
     * You can also pass it a regular expression to manipulate the listeners of all events that match it.
     *
     * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
        var i;
        var value;
        var single = remove ? this.removeListener : this.addListener;
        var multiple = remove ? this.removeListeners : this.addListeners;

        // If evt is an object then pass each of it's properties to this method
        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
            for (i in evt) {
                if (evt.hasOwnProperty(i) && (value = evt[i])) {
                    // Pass the single listener straight through to the singular method
                    if (typeof value === 'function') {
                        single.call(this, i, value);
                    }
                    else {
                        // Otherwise pass back to the multiple function
                        multiple.call(this, i, value);
                    }
                }
            }
        }
        else {
            // So evt must be a string
            // And listeners must be an array of listeners
            // Loop over it and pass each one to the multiple method
            i = listeners.length;
            while (i--) {
                single.call(this, evt, listeners[i]);
            }
        }

        return this;
    };

    /**
     * Removes all listeners from a specified event.
     * If you do not specify an event then all listeners will be removed.
     * That means every event will be emptied.
     * You can also pass a regex to remove all events that match it.
     *
     * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeEvent = function removeEvent(evt) {
        var type = typeof evt;
        var events = this._getEvents();
        var key;

        // Remove different things depending on the state of evt
        if (type === 'string') {
            // Remove all listeners for the specified event
            delete events[evt];
        }
        else if (type === 'object') {
            // Remove all events matching the regex.
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    delete events[key];
                }
            }
        }
        else {
            // Remove all listeners in all events
            delete this._events;
        }

        return this;
    };

    /**
     * Emits an event of your choice.
     * When emitted, every listener attached to that event will be executed.
     * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
     * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
     * So they will not arrive within the array on the other side, they will be separate.
     * You can also pass a regular expression to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {Array} [args] Optional array of arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emitEvent = function emitEvent(evt, args) {
        var listeners = this.getListenersAsObject(evt);
        var listener;
        var i;
        var key;
        var response;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                i = listeners[key].length;

                while (i--) {
                    // If the listener returns true then it shall be removed from the event
                    // The function is executed either with a basic call or an apply if there is an args array
                    listener = listeners[key][i];

                    if (listener.once === true) {
                        this.removeListener(evt, listener.listener);
                    }

                    response = listener.listener.apply(this, args || []);

                    if (response === this._getOnceReturnValue()) {
                        this.removeListener(evt, listener.listener);
                    }
                }
            }
        }

        return this;
    };

    /**
     * Alias of emitEvent
     */
    proto.trigger = alias('emitEvent');

    /**
     * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
     * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {...*} Optional additional arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emit = function emit(evt) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(evt, args);
    };

    /**
     * Sets the current value to check against when executing listeners. If a
     * listeners return value matches the one set here then it will be removed
     * after execution. This value defaults to true.
     *
     * @param {*} value The new value to check for when executing listeners.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.setOnceReturnValue = function setOnceReturnValue(value) {
        this._onceReturnValue = value;
        return this;
    };

    /**
     * Fetches the current value to check against when executing listeners. If
     * the listeners return value matches this one then it should be removed
     * automatically. It will return true by default.
     *
     * @return {*|Boolean} The current value to check for or the default, true.
     * @api private
     */
    proto._getOnceReturnValue = function _getOnceReturnValue() {
        if (this.hasOwnProperty('_onceReturnValue')) {
            return this._onceReturnValue;
        }
        else {
            return true;
        }
    };

    /**
     * Fetches the events object and creates one if required.
     *
     * @return {Object} The events storage object.
     * @api private
     */
    proto._getEvents = function _getEvents() {
        return this._events || (this._events = {});
    };

    // Expose the class either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return EventEmitter;
        });
    }
    else if (typeof module === 'object' && module.exports){
        module.exports = EventEmitter;
    }
    else {
        this.EventEmitter = EventEmitter;
    }
}.call(this));

/*!
 * getStyleProperty by kangax
 * http://perfectionkills.com/feature-testing-css-properties/
 */

/*jshint browser: true, strict: true, undef: true */
/*globals define: false */

( function( window ) {

    'use strict';

    var prefixes = 'Webkit Moz ms Ms O'.split(' '),
        docElemStyle = document.documentElement.style;

    function getStyleProperty( propName ) {
        if ( !propName ) {
            return;
        }

        // test standard property first
        if ( typeof docElemStyle[ propName ] === 'string' ) {
            return propName;
        }

        // capitalize
        propName = propName.charAt(0).toUpperCase() + propName.slice(1);

        // test vendor specific properties
        var prefixed;
        for ( var i=0, len = prefixes.length; i < len; i++ ) {
            prefixed = prefixes[i] + propName;
            if ( typeof docElemStyle[ prefixed ] === 'string' ) {
                return prefixed;
            }
        }
    }

    // transport
    if ( typeof define === 'function' && define.amd ) {
        // AMD
        define( function() {
            return getStyleProperty;
        });
    }
    else {
        // browser global
        window.getStyleProperty = getStyleProperty;
    }

})( window );

/**
 * getSize v1.1.4
 * measure size of elements
 */

/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false */

( function( window, undefined ) {

    'use strict';

    // -------------------------- helpers -------------------------- //

    var defView = document.defaultView;

    var getStyle = defView && defView.getComputedStyle ?
        function( elem ) {
            return defView.getComputedStyle( elem, null );
        } :
        function( elem ) {
            return elem.currentStyle;
        };

    // get a number from a string, not a percentage
    function getStyleSize( value ) {
        var num = parseFloat( value );
        // not a percent like '100%', and a number
        var isValid = value.indexOf('%') === -1 && !isNaN( num );
        return isValid && num;
    }

    // -------------------------- measurements -------------------------- //

    var measurements = [
        'paddingLeft',
        'paddingRight',
        'paddingTop',
        'paddingBottom',
        'marginLeft',
        'marginRight',
        'marginTop',
        'marginBottom',
        'borderLeftWidth',
        'borderRightWidth',
        'borderTopWidth',
        'borderBottomWidth'
    ];

    function getZeroSize() {
        var size = {
            width: 0,
            height: 0,
            innerWidth: 0,
            innerHeight: 0,
            outerWidth: 0,
            outerHeight: 0
        };
        for ( var i=0, len = measurements.length; i < len; i++ ) {
            var measurement = measurements[i];
            size[ measurement ] = 0;
        }
        return size;
    }


    function defineGetSize( getStyleProperty ) {

        // -------------------------- box sizing -------------------------- //

        var boxSizingProp = getStyleProperty('boxSizing');
        var isBoxSizeOuter;

        /**
         * WebKit measures the outer-width on style.width on border-box elems
         * IE & Firefox measures the inner-width
         */
        ( function() {
            if ( !boxSizingProp ) {
                return;
            }

            var div = document.createElement('div');
            div.style.width = '200px';
            div.style.padding = '1px 2px 3px 4px';
            div.style.borderStyle = 'solid';
            div.style.borderWidth = '1px 2px 3px 4px';
            div.style[ boxSizingProp ] = 'border-box';

            var body = document.body || document.documentElement;
            body.appendChild( div );
            var style = getStyle( div );

            isBoxSizeOuter = getStyleSize( style.width ) === 200;
            body.removeChild( div );
        })();


        // -------------------------- getSize -------------------------- //

        function getSize( elem ) {
            // use querySeletor if elem is string
            if ( typeof elem === 'string' ) {
                elem = document.querySelector( elem );
            }

            // do not proceed on non-objects
            if ( !elem || typeof elem !== 'object' || !elem.nodeType ) {
                return;
            }

            var style = getStyle( elem );

            // if hidden, everything is 0
            if ( style.display === 'none' ) {
                return getZeroSize();
            }

            var size = {};
            size.width  = elem.offsetWidth;
            size.height = elem.offsetHeight;

            var isBorderBox = size.isBorderBox = !!( boxSizingProp &&
            style[ boxSizingProp ] && style[ boxSizingProp ] === 'border-box' );

            // get all measurements
            for ( var i=0, len = measurements.length; i < len; i++ ) {
                var measurement = measurements[i],
                    value       = style[ measurement ],
                    num         = parseFloat( value );
                // any 'auto', 'medium' value will be 0
                size[ measurement ] = !isNaN( num ) ? num : 0;
            }

            var paddingWidth    = size.paddingLeft + size.paddingRight,
                paddingHeight   = size.paddingTop + size.paddingBottom,
                marginWidth     = size.marginLeft + size.marginRight,
                marginHeight    = size.marginTop + size.marginBottom,
                borderWidth     = size.borderLeftWidth + size.borderRightWidth,
                borderHeight    = size.borderTopWidth + size.borderBottomWidth;

            var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;

            // overwrite width and height if we can get it from style
            var styleWidth = getStyleSize( style.width );
            if ( styleWidth !== false ) {
                size.width = styleWidth +
                // add padding and border unless it's already including it
                ( isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth );
            }

            var styleHeight = getStyleSize( style.height );
            if ( styleHeight !== false ) {
                size.height = styleHeight +
                // add padding and border unless it's already including it
                ( isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight );
            }

            size.innerWidth     = size.width - ( paddingWidth + borderWidth );
            size.innerHeight    = size.height - ( paddingHeight + borderHeight );

            size.outerWidth     = size.width + marginWidth;
            size.outerHeight    = size.height + marginHeight;

            return size;
        }

        return getSize;

    }

    // transport
    if ( typeof define === 'function' && define.amd ) {
        // AMD
        define( [ 'get-style-property/get-style-property' ], defineGetSize );
    }
    else {
        // browser global
        window.getSize = defineGetSize( window.getStyleProperty );
    }

})( window );

/*!
 * Draggabilly v1.0.5
 * Make that shiz draggable
 * http://draggabilly.desandro.com
 */

( function( window ) {

    'use strict';

    // vars
    var document = window.document;

    // -------------------------- helpers -------------------------- //

    // extend objects
    function extend( a, b ) {
        for ( var prop in b ) {
            a[ prop ] = b[ prop ];
        }
        return a;
    }

    function noop() {}

    // ----- get style ----- //

    var defView = document.defaultView;

    var getStyle = defView && defView.getComputedStyle ?
        function( elem ) {
            return defView.getComputedStyle( elem, null );
        } :
        function( elem ) {
            return elem.currentStyle;
        };


    // http://stackoverflow.com/a/384380/182183
    var isElement = ( typeof HTMLElement === 'object' ) ?
        function isElementDOM2( obj ) {
            return obj instanceof HTMLElement;
        } :
        function isElementQuirky( obj ) {
            return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
        };

    // -------------------------- definition -------------------------- //

    function draggabillyDefinition( classie, EventEmitter, eventie, getStyleProperty, getSize ) {

        // --------------------------  -------------------------- //

        function Draggabilly( element, options ) {
            this.element = element;

            this.options = extend( {}, this.options );
            extend( this.options, options );

            this._create();
        }

        // inherit EventEmitter methods
        extend( Draggabilly.prototype, EventEmitter.prototype );

        Draggabilly.prototype.options = {};

        Draggabilly.prototype._create = function() {

            // properties
            this.position = {};
            this._getPosition();

            this.startPoint = { x: 0, y: 0 };
            this.dragPoint = { x: 0, y: 0 };

            // So we can stop handles from overlapping.
            this.minX = 0;
            this.maxX = 0;

            this.startPosition = extend( {}, this.position );

            // set relative positioning
            var style = getStyle( this.element );
            if ( style.position !== 'relative' && style.position !== 'absolute' ) {
                this.element.style.position = 'relative';
            }

            this.isEnabled = true;
            this.setHandles();
            this.getSteps();
        };

        /**
         * set this.handles and bind start events to 'em
         */
        Draggabilly.prototype.setHandles = function() {
            var handle = this.element;
            // bind pointer start event
            // listen for both, for devices like Chrome Pixel which has touch and mouse events
            eventie.bind( handle, 'mousedown', this );
            eventie.bind( handle, 'touchstart', this );
        };

        Draggabilly.prototype.setMaxX = function(x) {
            this.maxX = x;
        };

        Draggabilly.prototype.setMinX = function(x) {
            this.minX = x;
        };

        Draggabilly.prototype.getSteps = function() {
            // Deal with intervals
            if( this.options.range ) {
                var range   = this.options.range[1] - this.options.range[0],
                    steps   = Math.ceil(range / this.options.interval) + 1;
                    
                this.stepRatios = [];
                for(var i = 0; i <= steps - 1; i++) {
                    this.stepRatios[i] = (i / (steps - 1)) * 100;
                }
            }
        }

        Draggabilly.prototype.getStepsPx = function() {
            // Deal with intervals
            if( this.options.range ) {
                var range   = this.options.range[1] - this.options.range[0],
                    steps   = Math.ceil(range / this.options.interval) + 1,
                    ppi     = this.containerSize.width / steps;
                    
                this.stepRatiosPx = [];
                for(var i = 0; i <= steps; i++) {
                    this.stepRatiosPx[i] = i * ppi;
                }
            }
        }

        Draggabilly.prototype.pxToPc = function(px) {
            return (px / this.containerSize.width) * 100;
        }

        // TODO replace this with a IE8 test
        var isIE8 = 'attachEvent' in document.documentElement;

        // get left/top position from style
        Draggabilly.prototype._getPosition = function() {
            // properties
            var style = getStyle( this.element );

            // var x = parseInt( style.left, 10 );
            var x = $( this.element ).position().left;
            var y = parseInt( style.top, 10 );

            // clean up 'auto' or other non-integer values
            this.position.x = isNaN( x ) ? 0 : x;
            this.position.y = isNaN( y ) ? 0 : y;
        };

        // -------------------------- events -------------------------- //

        // trigger handler methods for events
        Draggabilly.prototype.handleEvent = function( event ) {
            var method = 'on' + event.type;
            if ( this[ method ] ) {
                this[ method ]( event );
            }
        };

        // returns the touch that we're keeping track of
        Draggabilly.prototype.getTouch = function( touches ) {
            for ( var i=0, len = touches.length; i < len; i++ ) {
                var touch = touches[i];
                if ( touch.identifier === this.pointerIdentifier ) {
                    return touch;
                }
            }
        };

        // ----- start event ----- //

        Draggabilly.prototype.onmousedown = function( event ) {
            this.dragStart( event, event );
        };

        Draggabilly.prototype.ontouchstart = function( event ) {
            // disregard additional touches
            if ( this.isDragging ) {
                return;
            }

            this.dragStart( event, event.changedTouches[0] );
        };

        function setPointerPoint( point, pointer ) {
            point.x = pointer.pageX !== undefined ? pointer.pageX : pointer.clientX;
            point.y = pointer.pageY !== undefined ? pointer.pageY : pointer.clientY;
        }

        Draggabilly.prototype.getClosestStep = function(value) {
            var k   = 0,
                min = 100;

            for(var i = 0; i <= this.stepRatios.length - 1; i++) {
                if(Math.abs(this.stepRatios[i] - value) < min) {
                    min = Math.abs(this.stepRatios[i] - value);
                    k = i;
                }
            }
            return this.stepRatios[k];
        },

        Draggabilly.prototype.getClosestStepPx = function(value) {
            var k   = 0,
                min = this.options.range[1] - this.options.range[0];

            for(var i = 0; i <= this.stepRatiosPx.length - 1; i++) {
                if(Math.abs(this.stepRatiosPx[i] - value) < min) {
                    min = Math.abs(this.stepRatiosPx[i] - value);
                    k = i;
                }
            }
            return this.stepRatiosPx[k];
        },

        /**
         * drag start
         * @param {Event} event
         * @param {Event or Touch} pointer
         */
        Draggabilly.prototype.dragStart = function( event, pointer ) {
            if ( !this.isEnabled ) {
                return;
            }

            if ( event.preventDefault ) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }

            var isTouch = event.type === 'touchstart';

            // save pointer identifier to match up touch events
            this.pointerIdentifier = pointer.identifier;

            this._getPosition();

            this.measureContainment();

            // point where drag began
            setPointerPoint( this.startPoint, pointer );
            // position _when_ drag began
            this.startPosition.x = this.position.x;
            this.startPosition.y = this.position.y;

            var pc = this.pxToPc(this.startPosition.x);

            this.position.x = this.getClosestStep( pc );

            // reset left/top style
            this.setLeftPc();

            this.dragPoint.x = 0;
            this.dragPoint.y = 0;

            this.getStepsPx();

            // bind move and end events
            this._bindEvents({
                events: isTouch ? [ 'touchmove', 'touchend', 'touchcancel' ] : [ 'mousemove', 'mouseup' ],
                // IE8 needs to be bound to document
                node: event.preventDefault ? window : document
            });

            classie.add( this.element, 'is-dragging' );

            // reset isDragging flag
            this.isDragging = true;

            this.emitEvent( 'dragStart', [ this, event, pointer ] );
        };

        Draggabilly.prototype._bindEvents = function( args ) {
            for ( var i=0, len = args.events.length; i < len; i++ ) {
                var event = args.events[i];
                eventie.bind( args.node, event, this );
            }
            // save these arguments
            this._boundEvents = args;
        };

        Draggabilly.prototype._unbindEvents = function() {
            var args = this._boundEvents;
            for ( var i=0, len = args.events.length; i < len; i++ ) {
                var event = args.events[i];
                eventie.unbind( args.node, event, this );
            }
            delete this._boundEvents;
        };

        Draggabilly.prototype.measureContainment = function() {
            var containment = this.options.containment;
            if ( !containment ) {
                return;
            }

            this.size = getSize( this.element );
            var elemRect = this.element.getBoundingClientRect();

            // use element if element
            var container = isElement( containment ) ? containment :
                // fallback to querySelector if string
                typeof containment === 'string' ? document.querySelector( containment ) :
                // otherwise just `true`, use the parent
                this.element.parentNode;

            this.containerSize = getSize( container );
            var containerRect = container.getBoundingClientRect();

            this.relativeStartPosition = {
                x: elemRect.left - containerRect.left,
                y: elemRect.top  - containerRect.top
            };
        };

        // ----- move event ----- //

        Draggabilly.prototype.onmousemove = function( event ) {
            this.dragMove( event, event );
        };

        Draggabilly.prototype.ontouchmove = function( event ) {
            var touch = this.getTouch( event.changedTouches );
            if ( touch ) {
                this.dragMove( event, touch );
            }
        };

        /**
         * drag move
         * @param {Event} event
         * @param {Event or Touch} pointer
         */
        Draggabilly.prototype.dragMove = function( event, pointer ) {

            setPointerPoint( this.dragPoint, pointer );

            this.dragPoint.x -= this.startPoint.x;
            this.dragPoint.y = 0;

            if ( this.options.containment ) {
                var relX        = this.relativeStartPosition.x,
                    dragPointX  = this.dragPoint.x;

                dragPointX = Math.max( dragPointX, - relX );
                if( this.options.dragger == 'main' ) {
                    dragPointX = Math.min( dragPointX, this.containerSize.width - relX - (this.size.width - 2) );
                } else if( this.options.dragger == 'left' ) {
                    dragPointX = Math.min( dragPointX - 4, this.containerSize.width - relX );
                } else {
                    dragPointX = Math.min( dragPointX, this.containerSize.width - relX );
                }
                // console.log( { dpX: dragPointX, other: (this.containerSize.width - relX - this.size.width) } );
                
                this.dragPoint.x = dragPointX;
            }

            var pc = this.pxToPc(this.startPosition.x + this.dragPoint.x),
                px = this.getClosestStepPx( this.startPosition.x + this.dragPoint.x ),
                closestStep = this.getClosestStep( pc ),
                minStep = this.minX ? this.getClosestStep( this.minX ) : 0,
                maxStep = this.maxX ? this.getClosestStep( this.maxX ) : 0;

            this.position.x = closestStep;

            if( minStep )
                this.position.x = closestStep < minStep ? minStep : closestStep;

            if( maxStep )
                this.position.x = closestStep > maxStep ? maxStep : closestStep;

            this.dragPoint.x = px - this.startPosition.x;

            this.emitEvent( 'dragMove', [ this, event, pointer ] );

            this.positionDrag();
        };


        // ----- end event ----- //

        Draggabilly.prototype.onmouseup = function( event ) {
            this.dragEnd( event, event );
        };

        Draggabilly.prototype.ontouchend = function( event ) {
            var touch = this.getTouch( event.changedTouches );
            if ( touch ) {
                this.dragEnd( event, touch );
            }
        };

        /**
         * drag end
         * @param {Event} event
         * @param {Event or Touch} pointer
         */
        Draggabilly.prototype.dragEnd = function( event, pointer ) {
            this.isDragging = false;

            delete this.pointerIdentifier;

            this.setLeftPc();

            // remove events
            this._unbindEvents();

            classie.remove( this.element, 'is-dragging' );

            this.emitEvent( 'dragEnd', [ this, event, pointer ] );
        };

        // ----- cancel event ----- //

        // coerce to end event
        Draggabilly.prototype.ontouchcancel = function( event ) {
            var touch = this.getTouch( event.changedTouches );
            this.dragEnd( event, touch );
        };

        // left/top positioning
        Draggabilly.prototype.setLeftTop = function() {
            this.element.style.left = this.position.x + 'px';
            this.element.style.top  = this.position.y + 'px';
        };

        // left/top positioning
        Draggabilly.prototype.setLeftPc = function(pc) {
            if( pc !== undefined )
                this.position.x = pc;

            this.element.style.left = this.position.x + '%';
        };

        Draggabilly.prototype.positionDrag = Draggabilly.prototype.setLeftPc;

        return Draggabilly;

    } // end definition

    // -------------------------- transport -------------------------- //

    if ( typeof define === 'function' && define.amd ) {
        // AMD
        define( [
            'classie/classie',
            'eventEmitter/EventEmitter',
            'eventie/eventie',
            'get-style-property/get-style-property',
            'get-size/get-size'
        ],
        draggabillyDefinition );
    }
    else {
        // browser global
        window.Draggabilly = draggabillyDefinition(
            window.classie,
            window.EventEmitter,
            window.eventie,
            window.getStyleProperty,
            window.getSize
        );
    }

})( window );


// -------------------------------------------------------
// MERGED: /assets/js/jquery.autocomplete.min.js

/**
*  Ajax Autocomplete for jQuery, version 1.2.7
*  (c) 2013 Tomas Kirda
*
*  Ajax Autocomplete for jQuery is freely distributable under the terms of an MIT-style license.
*  For details, see the web site: http://www.devbridge.com/projects/autocomplete/jquery/
*
*/
(function(e){"function"===typeof define&&define.amd?define(["jquery"],e):e(jQuery)})(function(e){function g(a,b){var c=function(){},c={autoSelectFirst:!1,appendTo:"body",serviceUrl:null,lookup:null,onSelect:null,width:"auto",minChars:1,maxHeight:300,deferRequestBy:0,params:{},formatResult:g.formatResult,delimiter:null,zIndex:9999,type:"GET",noCache:!1,onSearchStart:c,onSearchComplete:c,containerClass:"autocomplete-suggestions",tabDisabled:!1,dataType:"text",lookupFilter:function(a,b,c){return-1!==
a.value.toLowerCase().indexOf(c)},paramName:"query",transformResult:function(a){return"string"===typeof a?e.parseJSON(a):a}};this.element=a;this.el=e(a);this.suggestions=[];this.badQueries=[];this.selectedIndex=-1;this.currentValue=this.element.value;this.intervalId=0;this.cachedResponse=[];this.onChange=this.onChangeInterval=null;this.isLocal=this.ignoreValueChange=!1;this.suggestionsContainer=null;this.options=e.extend({},c,b);this.classes={selected:"autocomplete-selected",suggestion:"autocomplete-suggestion"};
this.initialize();this.setOptions(b)}var h={extend:function(a,b){return e.extend(a,b)},createNode:function(a){var b=document.createElement("div");b.innerHTML=a;return b.firstChild}};g.utils=h;e.Autocomplete=g;g.formatResult=function(a,b){var c="("+b.replace(RegExp("(\\/|\\.|\\*|\\+|\\?|\\||\\(|\\)|\\[|\\]|\\{|\\}|\\\\)","g"),"\\$1")+")";return a.value.replace(RegExp(c,"gi"),"<strong>$1</strong>")};g.prototype={killerFn:null,initialize:function(){var a=this,b="."+a.classes.suggestion,c=a.classes.selected,
d=a.options,f;a.element.setAttribute("autocomplete","off");a.killerFn=function(b){0===e(b.target).closest("."+a.options.containerClass).length&&(a.killSuggestions(),a.disableKillerFn())};if(!d.width||"auto"===d.width)d.width=a.el.outerWidth();a.suggestionsContainer=g.utils.createNode('<div class="'+d.containerClass+'" style="position: absolute; display: none;"></div>');f=e(a.suggestionsContainer);f.appendTo(d.appendTo).width(d.width);f.on("mouseover.autocomplete",b,function(){a.activate(e(this).data("index"))});
f.on("mouseout.autocomplete",function(){a.selectedIndex=-1;f.children("."+c).removeClass(c)});f.on("click.autocomplete",b,function(){a.select(e(this).data("index"),!1)});a.fixPosition();if(window.opera)a.el.on("keypress.autocomplete",function(b){a.onKeyPress(b)});else a.el.on("keydown.autocomplete",function(b){a.onKeyPress(b)});a.el.on("keyup.autocomplete",function(b){a.onKeyUp(b)});a.el.on("blur.autocomplete",function(){a.onBlur()});a.el.on("focus.autocomplete",function(){a.fixPosition()})},onBlur:function(){this.enableKillerFn()},
setOptions:function(a){var b=this.options;h.extend(b,a);if(this.isLocal=e.isArray(b.lookup))b.lookup=this.verifySuggestionsFormat(b.lookup);e(this.suggestionsContainer).css({"max-height":b.maxHeight+"px",width:b.width+"px","z-index":b.zIndex})},clearCache:function(){this.cachedResponse=[];this.badQueries=[]},clear:function(){this.clearCache();this.currentValue=null;this.suggestions=[]},disable:function(){this.disabled=!0},enable:function(){this.disabled=!1},fixPosition:function(){var a;"body"===this.options.appendTo&&
(a=this.el.offset(),e(this.suggestionsContainer).css({top:a.top+this.el.outerHeight()+"px",left:a.left+"px"}))},enableKillerFn:function(){e(document).on("click.autocomplete",this.killerFn)},disableKillerFn:function(){e(document).off("click.autocomplete",this.killerFn)},killSuggestions:function(){var a=this;a.stopKillSuggestions();a.intervalId=window.setInterval(function(){a.hide();a.stopKillSuggestions()},300)},stopKillSuggestions:function(){window.clearInterval(this.intervalId)},onKeyPress:function(a){if(!this.disabled&&
!this.visible&&40===a.keyCode&&this.currentValue)this.suggest();else if(!this.disabled&&this.visible){switch(a.keyCode){case 27:this.el.val(this.currentValue);this.hide();break;case 9:case 13:if(-1===this.selectedIndex){this.hide();return}this.select(this.selectedIndex,13===a.keyCode);if(9===a.keyCode&&!1===this.options.tabDisabled)return;break;case 38:this.moveUp();break;case 40:this.moveDown();break;default:return}a.stopImmediatePropagation();a.preventDefault()}},onKeyUp:function(a){var b=this;
if(!b.disabled){switch(a.keyCode){case 38:case 40:return}clearInterval(b.onChangeInterval);if(b.currentValue!==b.el.val())if(0<b.options.deferRequestBy)b.onChangeInterval=setInterval(function(){b.onValueChange()},b.options.deferRequestBy);else b.onValueChange()}},onValueChange:function(){var a;clearInterval(this.onChangeInterval);this.currentValue=this.element.value;a=this.getQuery(this.currentValue);this.selectedIndex=-1;this.ignoreValueChange?this.ignoreValueChange=!1:a.length<this.options.minChars?
this.hide():this.getSuggestions(a)},getQuery:function(a){var b=this.options.delimiter;if(!b)return e.trim(a);a=a.split(b);return e.trim(a[a.length-1])},getSuggestionsLocal:function(a){var b=a.toLowerCase(),c=this.options.lookupFilter;return{suggestions:e.grep(this.options.lookup,function(d){return c(d,a,b)})}},getSuggestions:function(a){var b,c=this,d=c.options,f=d.serviceUrl;(b=c.isLocal?c.getSuggestionsLocal(a):c.cachedResponse[a])&&e.isArray(b.suggestions)?(c.suggestions=b.suggestions,c.suggest()):
c.isBadQuery(a)||(d.params[d.paramName]=a,!1!==d.onSearchStart.call(c.element,d.params)&&(e.isFunction(d.serviceUrl)&&(f=d.serviceUrl.call(c.element,a)),e.ajax({url:f,data:d.ignoreParams?null:d.params,type:d.type,dataType:d.dataType}).done(function(b){c.processResponse(b,a);d.onSearchComplete.call(c.element,a)})))},isBadQuery:function(a){for(var b=this.badQueries,c=b.length;c--;)if(0===a.indexOf(b[c]))return!0;return!1},hide:function(){this.visible=!1;this.selectedIndex=-1;e(this.suggestionsContainer).hide()},
suggest:function(){if(0===this.suggestions.length)this.hide();else{var a=this.options.formatResult,b=this.getQuery(this.currentValue),c=this.classes.suggestion,d=this.classes.selected,f=e(this.suggestionsContainer),g="";e.each(this.suggestions,function(d,e){g+='<div class="'+c+'" data-index="'+d+'">'+a(e,b)+"</div>"});f.html(g).show();this.visible=!0;this.options.autoSelectFirst&&(this.selectedIndex=0,f.children().first().addClass(d))}},verifySuggestionsFormat:function(a){return a.length&&"string"===
typeof a[0]?e.map(a,function(a){return{value:a,data:null}}):a},processResponse:function(a,b){var c=this.options,d=c.transformResult(a,b);d.suggestions=this.verifySuggestionsFormat(d.suggestions);c.noCache||(this.cachedResponse[d[c.paramName]]=d,0===d.suggestions.length&&this.badQueries.push(d[c.paramName]));b===this.getQuery(this.currentValue)&&(this.suggestions=d.suggestions,this.suggest())},activate:function(a){var b=this.classes.selected,c=e(this.suggestionsContainer),d=c.children();c.children("."+
b).removeClass(b);this.selectedIndex=a;return-1!==this.selectedIndex&&d.length>this.selectedIndex?(a=d.get(this.selectedIndex),e(a).addClass(b),a):null},select:function(a,b){var c=this.suggestions[a];c&&(this.el.val(c),this.ignoreValueChange=b,this.hide(),this.onSelect(a))},moveUp:function(){-1!==this.selectedIndex&&(0===this.selectedIndex?(e(this.suggestionsContainer).children().first().removeClass(this.classes.selected),this.selectedIndex=-1,this.el.val(this.currentValue)):this.adjustScroll(this.selectedIndex-
1))},moveDown:function(){this.selectedIndex!==this.suggestions.length-1&&this.adjustScroll(this.selectedIndex+1)},adjustScroll:function(a){var b=this.activate(a),c,d;b&&(b=b.offsetTop,c=e(this.suggestionsContainer).scrollTop(),d=c+this.options.maxHeight-25,b<c?e(this.suggestionsContainer).scrollTop(b):b>d&&e(this.suggestionsContainer).scrollTop(b-this.options.maxHeight+25),this.el.val(this.getValue(this.suggestions[a].value)))},onSelect:function(a){var b=this.options.onSelect;a=this.suggestions[a];
this.el.val(this.getValue(a.value));e.isFunction(b)&&b.call(this.element,a)},getValue:function(a){var b=this.options.delimiter,c;if(!b)return a;c=this.currentValue;b=c.split(b);return 1===b.length?a:c.substr(0,c.length-b[b.length-1].length)+a},dispose:function(){this.el.off(".autocomplete").removeData("autocomplete");this.disableKillerFn();e(this.suggestionsContainer).remove()}};e.fn.autocomplete=function(a,b){return 0===arguments.length?this.first().data("autocomplete"):this.each(function(){var c=
e(this),d=c.data("autocomplete");if("string"===typeof a){if(d&&"function"===typeof d[a])d[a](b)}else d&&d.dispose&&d.dispose(),d=new g(this,a),c.data("autocomplete",d)})}});

// -------------------------------------------------------
// MERGED: /assets/js/jquery.expander.min.js

/*!
 * Expander - v1.4.11 - 2014-07-16
 * http://plugins.learningjquery.com/expander/
 * Copyright (c) 2014 Karl Swedberg
 * Licensed MIT (http://www.opensource.org/licenses/mit-license.php)
 */

(function(e){e.expander={version:"1.4.11",defaults:{slicePoint:100,sliceOn:null,preserveWords:!0,showWordCount:!1,wordCountText:" ({{count}} words)",widow:4,expandText:"read more",expandPrefix:"&hellip; ",expandAfterSummary:!1,summaryClass:"summary",detailClass:"details",moreClass:"read-more",lessClass:"read-less",moreLinkClass:"more-link",lessLinkClass:"less-link",collapseTimer:0,expandEffect:"slideDown",expandSpeed:250,collapseEffect:"slideUp",collapseSpeed:200,userCollapse:!0,userCollapseText:"read less",userCollapsePrefix:" ",onSlice:null,beforeExpand:null,afterExpand:null,onCollapse:null,afterCollapse:null}},e.fn.expander=function(a){function l(e,a){var l="span",s=e.summary,n=h.exec(s),t=n?n[2].toLowerCase():"";return a?(l="div",n&&"a"!==t&&!e.expandAfterSummary?s=s.replace(h,e.moreLabel+"$1"):s+=e.moreLabel,s='<div class="'+e.summaryClass+'">'+s+"</div>"):s+=e.moreLabel,[s," <",l+' class="'+e.detailClass+'"',">",e.details,"</"+l+">"].join("")}function s(e,a){var l='<span class="'+e.moreClass+'">'+e.expandPrefix;return e.wordCountText=e.showWordCount?e.wordCountText.replace(/\{\{count\}\}/,a.replace(f,"").replace(/\&(?:amp|nbsp);/g,"").replace(/(?:^\s+|\s+$)/,"").match(/\w+/g).length):"",l+='<a href="#" class="'+e.moreLinkClass+'">'+e.expandText+e.wordCountText+"</a></span>"}function n(a,l){return a.lastIndexOf("<")>a.lastIndexOf(">")&&(a=a.slice(0,a.lastIndexOf("<"))),l&&(a=a.replace(p,"")),e.trim(a)}function t(e,a){a.stop(!0,!0)[e.collapseEffect](e.collapseSpeed,function(){var l=a.prev("span."+e.moreClass).show();l.length||a.parent().children("div."+e.summaryClass).show().find("span."+e.moreClass).show(),e.afterCollapse&&e.afterCollapse.call(a)})}function r(a,l,s){a.collapseTimer&&(o=setTimeout(function(){t(a,l),e.isFunction(a.onCollapse)&&a.onCollapse.call(s,!1)},a.collapseTimer))}var i="init";"string"==typeof a&&(i=a,a={});var o,d=e.extend({},e.expander.defaults,a),c=/^<(?:area|br|col|embed|hr|img|input|link|meta|param).*>$/i,p=d.wordEnd||/(&(?:[^;]+;)?|[a-zA-Z\u00C0-\u0100]+)$/,f=/<\/?(\w+)[^>]*>/g,u=/<(\w+)[^>]*>/g,m=/<\/(\w+)>/g,h=/(<\/([^>]+)>)\s*$/,x=/^(<[^>]+>)+.?/,C=/\s\s+/g,v=function(a){return e.trim(a||"").replace(C," ")},g={init:function(){this.each(function(){var a,i,p,h,C,g,w,S,b,y,E,T,k,P,L=[],I=[],O="",$={},j=this,A=e(this),D=e([]),W=e.extend({},d,A.data("expander")||e.meta&&A.data()||{}),z=!!A.find("."+W.detailClass).length,F=!!A.find("*").filter(function(){var a=e(this).css("display");return/^block|table|list/.test(a)}).length,U=F?"div":"span",Q=U+"."+W.detailClass,Z=W.moreClass+"",q=W.lessClass+"",B=W.expandSpeed||0,G=v(A.html()),H=G.slice(0,W.slicePoint);if(W.moreSelector="span."+Z.split(" ").join("."),W.lessSelector="span."+q.split(" ").join("."),!e.data(this,"expanderInit")){for(e.data(this,"expanderInit",!0),e.data(this,"expander",W),e.each(["onSlice","beforeExpand","afterExpand","onCollapse","afterCollapse"],function(a,l){$[l]=e.isFunction(W[l])}),H=n(H),C=H.replace(f,"").length;W.slicePoint>C;)h=G.charAt(H.length),"<"===h&&(h=G.slice(H.length).match(x)[0]),H+=h,C++;if(W.sliceOn){var J=H.indexOf(W.sliceOn);-1!==J&&W.slicePoint>J&&(W.slicePoint=J,H=G.slice(0,W.slicePoint))}for(H=n(H,W.preserveWords),g=H.match(u)||[],w=H.match(m)||[],p=[],e.each(g,function(e,a){c.test(a)||p.push(a)}),g=p,i=w.length,a=0;i>a;a++)w[a]=w[a].replace(m,"$1");if(e.each(g,function(a,l){var s=l.replace(u,"$1"),n=e.inArray(s,w);-1===n?(L.push(l),I.push("</"+s+">")):w.splice(n,1)}),I.reverse(),z)b=A.find(Q).remove().html(),H=A.html(),G=H+b,S="";else{if(b=G.slice(H.length),y=e.trim(b.replace(f,"")),""===y||y.split(/\s+/).length<W.widow)return;S=I.pop()||"",H+=I.join(""),b=L.join("")+b}W.moreLabel=A.find(W.moreSelector).length?"":s(W,b),F?b=G:"&"===H.charAt(H.length-1)&&(O=/^[#\w\d\\]+;/.exec(b),O&&(b=b.slice(O[0].length),H+=O[0])),H+=S,W.summary=H,W.details=b,W.lastCloseTag=S,$.onSlice&&(p=W.onSlice.call(j,W),W=p&&p.details?p:W),E=l(W,F),A.html(E),k=A.find(Q),P=A.find(W.moreSelector),"slideUp"===W.collapseEffect&&"slideDown"!==W.expandEffect||A.is(":hidden")?k.css({display:"none"}):k[W.collapseEffect](0),D=A.find("div."+W.summaryClass),T=function(e){e.preventDefault(),P.hide(),D.hide(),$.beforeExpand&&W.beforeExpand.call(j),k.stop(!1,!0)[W.expandEffect](B,function(){k.css({zoom:""}),$.afterExpand&&W.afterExpand.call(j),r(W,k,j)})},P.find("a").unbind("click.expander").bind("click.expander",T),W.userCollapse&&!A.find(W.lessSelector).length&&A.find(Q).append('<span class="'+W.lessClass+'">'+W.userCollapsePrefix+'<a href="#" class="'+W.lessLinkClass+'">'+W.userCollapseText+"</a></span>"),A.find(W.lessSelector+" a").unbind("click.expander").bind("click.expander",function(a){a.preventDefault(),clearTimeout(o);var l=e(this).closest(Q);t(W,l),$.onCollapse&&W.onCollapse.call(j,!0)})}})},destroy:function(){this.each(function(){var a,l,s=e(this);s.data("expanderInit")&&(a=e.extend({},s.data("expander")||{},d),l=s.find("."+a.detailClass).contents(),s.removeData("expanderInit"),s.removeData("expander"),s.find(a.moreSelector).remove(),s.find("."+a.summaryClass).remove(),s.find("."+a.detailClass).after(l).remove(),s.find(a.lessSelector).remove())})}};return g[i]&&g[i].call(this),this},e.fn.expander.defaults=e.expander.defaults})(jQuery);

// -------------------------------------------------------
// MERGED: /assets/js/placeholders.jquery.min.js

/*
 * The MIT License
 *
 * Copyright (c) 2012 James Allardice
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// Defines the global Placeholders object along with various utility methods
(function (global) {

    "use strict";

    // Cross-browser DOM event binding
    function addEventListener(elem, event, fn) {
        if (elem.addEventListener) {
            return elem.addEventListener(event, fn, false);
        }
        if (elem.attachEvent) {
            return elem.attachEvent("on" + event, fn);
        }
    }

    // Check whether an item is in an array (we don't use Array.prototype.indexOf so we don't clobber any existing polyfills - this is a really simple alternative)
    function inArray(arr, item) {
        var i, len;
        for (i = 0, len = arr.length; i < len; i++) {
            if (arr[i] === item) {
                return true;
            }
        }
        return false;
    }

    // Move the caret to the index position specified. Assumes that the element has focus
    function moveCaret(elem, index) {
        var range;
        if (elem.createTextRange) {
            range = elem.createTextRange();
            range.move("character", index);
            range.select();
        } else if (elem.selectionStart) {
            elem.focus();
            elem.setSelectionRange(index, index);
        }
    }

    // Attempt to change the type property of an input element
    function changeType(elem, type) {
        try {
            elem.type = type;
            return true;
        } catch (e) {
            // You can't change input type in IE8 and below
            return false;
        }
    }

    // Expose public methods
    global.Placeholders = {
        Utils: {
            addEventListener: addEventListener,
            inArray: inArray,
            moveCaret: moveCaret,
            changeType: changeType
        }
    };

}(this));

(function (global) {

    "use strict";

    var validTypes = [
            "text",
            "search",
            "url",
            "tel",
            "email",
            "password",
            "number",
            "textarea"
        ],

        // The list of keycodes that are not allowed when the polyfill is configured to hide-on-input
        badKeys = [

            // The following keys all cause the caret to jump to the end of the input value
            27, // Escape
            33, // Page up
            34, // Page down
            35, // End
            36, // Home

            // Arrow keys allow you to move the caret manually, which should be prevented when the placeholder is visible
            37, // Left
            38, // Up
            39, // Right
            40, // Down

            // The following keys allow you to modify the placeholder text by removing characters, which should be prevented when the placeholder is visible
            8, // Backspace
            46 // Delete
        ],

        // Styling variables
        placeholderStyleColor = "#ccc",
        placeholderClassName = "placeholdersjs",
        classNameRegExp = new RegExp("(?:^|\\s)" + placeholderClassName + "(?!\\S)"),

        // These will hold references to all elements that can be affected. NodeList objects are live, so we only need to get those references once
        inputs, textareas,

        // The various data-* attributes used by the polyfill
        ATTR_CURRENT_VAL = "data-placeholder-value",
        ATTR_ACTIVE = "data-placeholder-active",
        ATTR_INPUT_TYPE = "data-placeholder-type",
        ATTR_FORM_HANDLED = "data-placeholder-submit",
        ATTR_EVENTS_BOUND = "data-placeholder-bound",
        ATTR_OPTION_FOCUS = "data-placeholder-focus",
        ATTR_OPTION_LIVE = "data-placeholder-live",
        ATTR_MAXLENGTH = "data-placeholder-maxlength",

        // Various other variables used throughout the rest of the script
        test = document.createElement("input"),
        head = document.getElementsByTagName("head")[0],
        root = document.documentElement,
        Placeholders = global.Placeholders,
        Utils = Placeholders.Utils,
        hideOnInput, liveUpdates, keydownVal, styleElem, styleRules, placeholder, timer, form, elem, len, i;

    // No-op (used in place of public methods when native support is detected)
    function noop() {}

    // Avoid IE9 activeElement of death when an iframe is used.
    // More info:
    // http://bugs.jquery.com/ticket/13393
    // https://github.com/jquery/jquery/commit/85fc5878b3c6af73f42d61eedf73013e7faae408
    function safeActiveElement() {
        try {
            return document.activeElement;
        } catch (err) {}
    }

    // Hide the placeholder value on a single element. Returns true if the placeholder was hidden and false if it was not (because it wasn't visible in the first place)
    function hidePlaceholder(elem, keydownValue) {
        var type,
            maxLength,
            valueChanged = (!!keydownValue && elem.value !== keydownValue),
            isPlaceholderValue = (elem.value === elem.getAttribute(ATTR_CURRENT_VAL));

        if ((valueChanged || isPlaceholderValue) && elem.getAttribute(ATTR_ACTIVE) === "true") {
            elem.removeAttribute(ATTR_ACTIVE);
            elem.value = elem.value.replace(elem.getAttribute(ATTR_CURRENT_VAL), "");
            elem.className = elem.className.replace(classNameRegExp, "");

            // Restore the maxlength value
            maxLength = elem.getAttribute(ATTR_MAXLENGTH);
            if (parseInt(maxLength, 10) >= 0) { // Old FF returns -1 if attribute not set (see GH-56)
                elem.setAttribute("maxLength", maxLength);
                elem.removeAttribute(ATTR_MAXLENGTH);
            }

            // If the polyfill has changed the type of the element we need to change it back
            type = elem.getAttribute(ATTR_INPUT_TYPE);
            if (type) {
                elem.type = type;
            }
            return true;
        }
        return false;
    }

    // Show the placeholder value on a single element. Returns true if the placeholder was shown and false if it was not (because it was already visible)
    function showPlaceholder(elem) {
        var type,
            maxLength,
            val = elem.getAttribute(ATTR_CURRENT_VAL);
        if (elem.value === "" && val) {
            elem.setAttribute(ATTR_ACTIVE, "true");
            elem.value = val;
            elem.className += " " + placeholderClassName;

            // Store and remove the maxlength value
            maxLength = elem.getAttribute(ATTR_MAXLENGTH);
            if (!maxLength) {
                elem.setAttribute(ATTR_MAXLENGTH, elem.maxLength);
                elem.removeAttribute("maxLength");
            }

            // If the type of element needs to change, change it (e.g. password inputs)
            type = elem.getAttribute(ATTR_INPUT_TYPE);
            if (type) {
                elem.type = "text";
            } else if (elem.type === "password") {
                if (Utils.changeType(elem, "text")) {
                    elem.setAttribute(ATTR_INPUT_TYPE, "password");
                }
            }
            return true;
        }
        return false;
    }

    function handleElem(node, callback) {

        var handleInputsLength, handleTextareasLength, handleInputs, handleTextareas, elem, len, i;

        // Check if the passed in node is an input/textarea (in which case it can't have any affected descendants)
        if (node && node.getAttribute(ATTR_CURRENT_VAL)) {
            callback(node);
        } else {

            // If an element was passed in, get all affected descendants. Otherwise, get all affected elements in document
            handleInputs = node ? node.getElementsByTagName("input") : inputs;
            handleTextareas = node ? node.getElementsByTagName("textarea") : textareas;

            handleInputsLength = handleInputs ? handleInputs.length : 0;
            handleTextareasLength = handleTextareas ? handleTextareas.length : 0;

            // Run the callback for each element
            for (i = 0, len = handleInputsLength + handleTextareasLength; i < len; i++) {
                elem = i < handleInputsLength ? handleInputs[i] : handleTextareas[i - handleInputsLength];
                callback(elem);
            }
        }
    }

    // Return all affected elements to their normal state (remove placeholder value if present)
    function disablePlaceholders(node) {
        handleElem(node, hidePlaceholder);
    }

    // Show the placeholder value on all appropriate elements
    function enablePlaceholders(node) {
        handleElem(node, showPlaceholder);
    }

    // Returns a function that is used as a focus event handler
    function makeFocusHandler(elem) {
        return function () {

            // Only hide the placeholder value if the (default) hide-on-focus behaviour is enabled
            if (hideOnInput && elem.value === elem.getAttribute(ATTR_CURRENT_VAL) && elem.getAttribute(ATTR_ACTIVE) === "true") {

                // Move the caret to the start of the input (this mimics the behaviour of all browsers that do not hide the placeholder on focus)
                Utils.moveCaret(elem, 0);

            } else {

                // Remove the placeholder
                hidePlaceholder(elem);
            }
        };
    }

    // Returns a function that is used as a blur event handler
    function makeBlurHandler(elem) {
        return function () {
            showPlaceholder(elem);
        };
    }

    // Functions that are used as a event handlers when the hide-on-input behaviour has been activated - very basic implementation of the "input" event
    function makeKeydownHandler(elem) {
        return function (e) {
            keydownVal = elem.value;

            //Prevent the use of the arrow keys (try to keep the cursor before the placeholder)
            if (elem.getAttribute(ATTR_ACTIVE) === "true") {
                if (keydownVal === elem.getAttribute(ATTR_CURRENT_VAL) && Utils.inArray(badKeys, e.keyCode)) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                    return false;
                }
            }
        };
    }
    function makeKeyupHandler(elem) {
        return function () {
            hidePlaceholder(elem, keydownVal);

            // If the element is now empty we need to show the placeholder
            if (elem.value === "") {
                elem.blur();
                Utils.moveCaret(elem, 0);
            }
        };
    }
    function makeClickHandler(elem) {
        return function () {
            if (elem === safeActiveElement() && elem.value === elem.getAttribute(ATTR_CURRENT_VAL) && elem.getAttribute(ATTR_ACTIVE) === "true") {
                Utils.moveCaret(elem, 0);
            }
        };
    }

    // Returns a function that is used as a submit event handler on form elements that have children affected by this polyfill
    function makeSubmitHandler(form) {
        return function () {

            // Turn off placeholders on all appropriate descendant elements
            disablePlaceholders(form);
        };
    }

    // Bind event handlers to an element that we need to affect with the polyfill
    function newElement(elem) {

        // If the element is part of a form, make sure the placeholder string is not submitted as a value
        if (elem.form) {
            form = elem.form;

            // If the type of the property is a string then we have a "form" attribute and need to get the real form
            if (typeof form === "string") {
                form = document.getElementById(form);
            }

            // Set a flag on the form so we know it's been handled (forms can contain multiple inputs)
            if (!form.getAttribute(ATTR_FORM_HANDLED)) {
                Utils.addEventListener(form, "submit", makeSubmitHandler(form));
                form.setAttribute(ATTR_FORM_HANDLED, "true");
            }
        }

        // Bind event handlers to the element so we can hide/show the placeholder as appropriate
        Utils.addEventListener(elem, "focus", makeFocusHandler(elem));
        Utils.addEventListener(elem, "blur", makeBlurHandler(elem));

        // If the placeholder should hide on input rather than on focus we need additional event handlers
        if (hideOnInput) {
            Utils.addEventListener(elem, "keydown", makeKeydownHandler(elem));
            Utils.addEventListener(elem, "keyup", makeKeyupHandler(elem));
            Utils.addEventListener(elem, "click", makeClickHandler(elem));
        }

        // Remember that we've bound event handlers to this element
        elem.setAttribute(ATTR_EVENTS_BOUND, "true");
        elem.setAttribute(ATTR_CURRENT_VAL, placeholder);

        // If the element doesn't have a value and is not focussed, set it to the placeholder string
        if (hideOnInput || elem !== safeActiveElement()) {
            showPlaceholder(elem);
        }
    }

    Placeholders.nativeSupport = test.placeholder !== void 0;

    if (!Placeholders.nativeSupport) {

        // Get references to all the input and textarea elements currently in the DOM (live NodeList objects to we only need to do this once)
        inputs = document.getElementsByTagName("input");
        textareas = document.getElementsByTagName("textarea");

        // Get any settings declared as data-* attributes on the root element (currently the only options are whether to hide the placeholder on focus or input and whether to auto-update)
        hideOnInput = root.getAttribute(ATTR_OPTION_FOCUS) === "false";
        liveUpdates = root.getAttribute(ATTR_OPTION_LIVE) !== "false";

        // Create style element for placeholder styles (instead of directly setting style properties on elements - allows for better flexibility alongside user-defined styles)
        styleElem = document.createElement("style");
        styleElem.type = "text/css";

        // Create style rules as text node
        styleRules = document.createTextNode("." + placeholderClassName + " { color:" + placeholderStyleColor + "; }");

        // Append style rules to newly created stylesheet
        if (styleElem.styleSheet) {
            styleElem.styleSheet.cssText = styleRules.nodeValue;
        } else {
            styleElem.appendChild(styleRules);
        }

        // Prepend new style element to the head (before any existing stylesheets, so user-defined rules take precedence)
        head.insertBefore(styleElem, head.firstChild);

        // Set up the placeholders
        for (i = 0, len = inputs.length + textareas.length; i < len; i++) {
            elem = i < inputs.length ? inputs[i] : textareas[i - inputs.length];

            // Get the value of the placeholder attribute, if any. IE10 emulating IE7 fails with getAttribute, hence the use of the attributes node
            placeholder = elem.attributes.placeholder;
            if (placeholder) {

                // IE returns an empty object instead of undefined if the attribute is not present
                placeholder = placeholder.nodeValue;

                // Only apply the polyfill if this element is of a type that supports placeholders, and has a placeholder attribute with a non-empty value
                if (placeholder && Utils.inArray(validTypes, elem.type)) {
                    newElement(elem);
                }
            }
        }

        // If enabled, the polyfill will repeatedly check for changed/added elements and apply to those as well
        timer = setInterval(function () {
            for (i = 0, len = inputs.length + textareas.length; i < len; i++) {
                elem = i < inputs.length ? inputs[i] : textareas[i - inputs.length];

                // Only apply the polyfill if this element is of a type that supports placeholders, and has a placeholder attribute with a non-empty value
                placeholder = elem.attributes.placeholder;
                if (placeholder) {
                    placeholder = placeholder.nodeValue;
                    if (placeholder && Utils.inArray(validTypes, elem.type)) {

                        // If the element hasn't had event handlers bound to it then add them
                        if (!elem.getAttribute(ATTR_EVENTS_BOUND)) {
                            newElement(elem);
                        }

                        // If the placeholder value has changed or not been initialised yet we need to update the display
                        if (placeholder !== elem.getAttribute(ATTR_CURRENT_VAL) || (elem.type === "password" && !elem.getAttribute(ATTR_INPUT_TYPE))) {

                            // Attempt to change the type of password inputs (fails in IE < 9)
                            if (elem.type === "password" && !elem.getAttribute(ATTR_INPUT_TYPE) && Utils.changeType(elem, "text")) {
                                elem.setAttribute(ATTR_INPUT_TYPE, "password");
                            }

                            // If the placeholder value has changed and the placeholder is currently on display we need to change it
                            if (elem.value === elem.getAttribute(ATTR_CURRENT_VAL)) {
                                elem.value = placeholder;
                            }

                            // Keep a reference to the current placeholder value in case it changes via another script
                            elem.setAttribute(ATTR_CURRENT_VAL, placeholder);
                        }
                    }
                } else if (elem.getAttribute(ATTR_ACTIVE)) {
                    hidePlaceholder(elem);
                    elem.removeAttribute(ATTR_CURRENT_VAL);
                }
            }

            // If live updates are not enabled cancel the timer
            if (!liveUpdates) {
                clearInterval(timer);
            }
        }, 100);
    }

    Utils.addEventListener(global, "beforeunload", function () {
        Placeholders.disable();
    });

    // Expose public methods
    Placeholders.disable = Placeholders.nativeSupport ? noop : disablePlaceholders;
    Placeholders.enable = Placeholders.nativeSupport ? noop : enablePlaceholders;

}(this));


// -------------------------------------------------------
// MERGED: /assets/js/interactions.js

window.isPatternPortfolio = !(window.libraryAuthRealm);

// setup globals
var isPP = (document.querySelector('[data-is-pp]')) ? true : false;
var isLibrary = (document.querySelector('[data-library]')) ? true : false;
var isBlog = (document.querySelector('[data-blog]')) ? true : false;
var isCatalogue = (document.querySelector('[data-catalogue]')) ? true : false;


// tc temp
if (typeof console === "undefined" || typeof console.log === "undefined") {
    console = { };
    console.log = function() {
    };
}

/*!
 * jQuery Cookie Plugin
 * https://github.com/carhartl/jquery-cookie
 */
(function (g) {
    g.cookie = function (h, b, a) {
        if (1 < arguments.length && (!/Object/.test(Object.prototype.toString.call(b)) || null === b || void 0 === b)) {
            a = g.extend({}, a); if (null === b || void 0 === b) a.expires = -1; if ("number" === typeof a.expires) { var d = a.expires, c = a.expires = new Date; c.setDate(c.getDate() + d) } b = "" + b; return document.cookie = [encodeURIComponent(h), "=", a.raw ? b : encodeURIComponent(b), a.expires ? "; expires=" + a.expires.toUTCString() : "", a.path ? "; path=" + a.path : "", a.domain ? "; domain=" + a.domain : "", a.secure ? "; secure" :
            ""].join("")
        } for (var a = b || {}, d = a.raw ? function (a) { return a } : decodeURIComponent, c = document.cookie.split("; "), e = 0, f; f = c[e] && c[e].split("=") ; e++) if (d(f[0]) === h) return d(f[1] || ""); return null
    }
})(jQuery);


// Autogrow Textareas
(function($) {
    $.fn.autogrow = function(options) {

        this.filter('textarea').each(function() {

            var $this       = $(this),
                minHeight   = 72,
                lineHeight  = $this.css('lineHeight');

            var shadow = $('<div></div>').css({
                position:   'absolute',
                top:        -10000,
                left:       -10000,
                fontSize:   $this.css('fontSize'),
                fontFamily: $this.css('fontFamily'),
                lineHeight: $this.css('lineHeight'),
                resize:     'none'
            }).appendTo(document.body);

            var update = function() {

                var val = this.value.replace(/</g, '&lt;')
                                    .replace(/>/g, '&gt;')
                                    .replace(/&/g, '&amp;')
                                    .replace(/\n/g, '<br/>');

                shadow.css({width: $(this).width()}).html(val);
                $(this).css('height', Math.max(shadow.height() + 30, minHeight));
            }

            $(this).change(update).keyup(update).keydown(update);

            update.apply(this);

        });

        return this;

    }

})(jQuery);

function supports(prop) {
   var div = document.createElement('div'),
       vendors = ['Khtml','Ms','O','Moz','Webkit'],
       len = vendors.length;
   if (prop in div.style) return true;
   prop = prop.replace(/^[a-z]/, function(val) {
       return val.toUpperCase();
   });
   while(len--) {
       if (vendors[len] + prop in div.style) {
           return true;
       }
   }
   return false;
}

// Asyncronously load javascript
(function(d) {
    window.async = function(url) {
        var a = document.createElement('script');
        a.async = true;
        a.src = url;
        var b = d.getElementsByTagName('script')[0];
        b.parentNode.insertBefore(a, b);
    }
})(document);

// iOS orientationchange bug fix
(function(w){

    // This fix addresses an iOS bug, so return early if the UA claims it's something else.
    if( !( /iPhone|iPad|iPod/.test( navigator.platform ) && navigator.userAgent.indexOf( "AppleWebKit" ) > -1 ) ){
        return;
    }

    var doc = w.document;

    if( !doc.querySelector ){ return; }

    var meta = doc.querySelector( "meta[name=viewport]" ),
        initialContent = meta && meta.getAttribute( "content" ),
        disabledZoom = initialContent + ",maximum-scale=1",
        enabledZoom = initialContent + ",maximum-scale=10",
        enabled = true,
        x, y, z, aig;

    if( !meta ){ return; }

    function restoreZoom(){
        meta.setAttribute( "content", enabledZoom );
        enabled = true;
    }

    function disableZoom(){
        meta.setAttribute( "content", disabledZoom );
        enabled = false;
    }

    function checkTilt( e ){
        aig = e.accelerationIncludingGravity;
        x = Math.abs( aig.x );
        y = Math.abs( aig.y );
        z = Math.abs( aig.z );

        // If portrait orientation and in one of the danger zones
        if( !w.orientation && ( x > 7 || ( ( z > 6 && y < 8 || z < 8 && y > 6 ) && x > 5 ) ) ){
            if( enabled ){
                disableZoom();
            }
        }
        else if( !enabled ){
            restoreZoom();
        }
    }

    w.addEventListener( "orientationchange", restoreZoom, false );
    w.addEventListener( "devicemotion", checkTilt, false );

})(this);

// Flexbox Support Detection
(function() {
    document.getElementsByTagName('html')[0].className += (supports('flex-box') || supports('box-flex'))? ' flexbox' : '';
})();

// Relative Dates
(function(win){
    win.relativeDate = function(from) {
        from = new Date(from);
        var to = new Date;
        var seconds = ((to - from) / 1000);
        var minutes = Math.floor(seconds / 60);
        if (minutes == 0) { return 'less than a minute ago'; }
        if (minutes == 1) { return 'a minute ago'; }
        if (minutes < 45) { return minutes + ' minutes ago'; }
        if (minutes < 90) { return 'an hour ago'; }
        if (minutes < 1440) { return Math.floor(minutes / 60) + ' hours ago'; }
        if (minutes < 2880) { return '1 day ago'; }
        if (minutes < 43200) { return Math.floor(minutes / 1440) + ' days ago'; }
        if (minutes < 86400) { return '1 month ago'; }
        if (minutes < 525960) { return Math.floor(minutes / 43200) + ' months ago'; }
        if (minutes < 1051199) { return '1 year ago'; }
        return Math.floor(minutes / 525960) + ' years ago';
    }
})(this);

// Responsive Selectors
(function (e) {
    function q() { if (p) { var b = []; if (f.querySelectorAll) b = f.querySelectorAll("[data-squery]"); else for (var a = f.getElementsByTagName("*"), c = 0, m = a.length; c < m; ++c) a[c].getAttribute("data-squery") && b.push(a[c]); c = 0; for (m = b.length; c < m; ++c) { for (var a = b[c], d = [], e = a.getAttribute("data-squery").split(" "), g = 0, i = e.length; g < i; ++g) { var h = /(.*):([0-9]*)(px|em)=(.*)/.exec(e[g]); h && d.push(h) } a.cq_rules = a.cq_rules || []; a.cq_rules = a.cq_rules.concat(d); j.push(a) } } } function k() {
        for (var b = 0, a = j.length; b < a; ++b) {
            el =
            j[b]; for (var c = 0, e = el.cq_rules.length; c < e; ++c) {
                var d = el.cq_rules[c], f = parseInt(d[2]); "em" === d[3] && (f = n(parseFloat(d[2]), el)); var g = el, i = d[4], h = g.cloneNode(!0); h.className = (" " + h.className + " ").replace(" " + i + " ", " "); h.style.height = 0; h.style.visibility = "none"; h.style.overflow = "hidden"; h.style.clear = "both"; i = g.parentNode; i.insertBefore(h, g); g = h.offsetWidth; i.removeChild(h); r[d[1]](g, f) ? 0 > el.className.indexOf(d[4]) && (el.className += " " + d[4]) : (d = el.className.replace(RegExp("(^| )" + d[4] + "( |$)"), "$1"),
                d = d.replace(/ $/, ""), el.className = d)
            }
        }
    } function l() { if (!o) { o = !0; q(); k(); e.addEventListener && e.addEventListener("resize", k, !1); var b = n(1, f.body); e.setInterval(function () { var a = n(1, f.body); a !== b && (k(), b = a) }, 100) } } var f = e.document, j = [], p = !0, o = !1, r = { "min-width": function (b, a) { return b > a }, "max-width": function (b, a) { return b < a } }, n = function (b) { return function () { var a = Array.prototype.slice.call(arguments); b.memoize = b.memoize || {}; return a in b.memoize ? b.memoize[a] : b.memoize[a] = b.apply(this, a) } }(function (b, a) {
        var c =
        f.createElement("div"); c.style.fontSize = "1em"; c.style.margin = "0"; c.style.padding = "0"; c.style.border = "none"; c.style.width = "1em"; a.appendChild(c); var e = c.offsetWidth; a.removeChild(c); return Math.round(e * b)
    }); f.addEventListener ? (f.addEventListener("DOMContentLoaded", l, !1), e.addEventListener("load", l, !1)) : f.attachEvent && (f.attachEvent("onreadystatechange", l), e.attachEvent("onload", l)); e.SelectorQueries = {
        add: function (b, a, c, e) {
            for (var c = /([0-9]*)(px|em)/.exec(c), d = 0, f = b.length; d < f; ++d) {
                var g = b[d]; g.cq_rules =
                g.cq_rules || []; g.cq_rules.push([null, a, c[1], c[2], e]); j.push(g)
            } o && k()
        }, ignoreDataAttributes: function () { p = !1 }
    }
})(this);

// Check if we should load high resolution images
(function($) {

    $.fn.responsiveImages = function(width, monitor) {
        this.each(function() {
            $(this).bind('load', function() {
                $(this).responsiveImages(width, false);
            });
            if (!$(this).hasClass('large') && $(this).width() > width) {
                this.className += ' large';
                var src = this.src;
                var ext;
                if (window.isPatternPortfolio) {
                    ext = src.substr(src.lastIndexOf('.'));
                }
                var img = new Image();
                $(img).on('load', { target: this }, function(e) {
                    //window.resizedLog[this.src] = true; // hack
                    e.data.target.src = this.src;
                });

                if (window.isPatternPortfolio) {
                    // OLD:
                    img.src = src.replace(ext, '-large' + ext);
                } else {
                    // NEW:
                    //  * the editor specifies /real/path/to/image.jpg as the carousel image
                    //  * the template emits the image URL like so:
                    //      src="/resize/width/height/cacheSeconds/real/path/to/image.jpg"
                    //      e.g.,            0 indicates scale to fit; width or height can be 0 but not both
                    //      src="/resize/300/0/1800/content/hero-images/home-page-carousel/wellcome-library.jpg
                    //  * the above gives you wellcome-library.jpg scaled to 300px wide
                    // so the replacement should restore the img src to the original image the editor chose
                    // src might start with "http://blahblah/resize..."
                    img.src = removeResize(src);
                }
            }
        });
        if (monitor != false) {
            var el = this;
            $(window).bind('resize', function() {
                el.responsiveImages(width, false);
            });
        }
    };
})(jQuery);

function removeResize(existingSrc) {
    // console.log("removeResize called for " + existingSrc);
    if (existingSrc.indexOf('/resize/') >= 0) {
        //return '/content/hero-images/home-page-carousel/wellcome-library.jpg';
        return '/' + existingSrc.substring(existingSrc.indexOf('/resize/')).split('/').slice(5).join('/');
    }
    return existingSrc;
}

// Throttle Function Calls
function throttle(fn, delay) {
  var timer = null;
  return function () {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

// Responsive Section Navigation
// Inserts toggle links for revealing section navigation on small screens
(function($) {
    if ($('.section-nav').length > 0 || $('.search-option-tabs').length > 0) {
        if ($('.section-nav').length > 0) {
            var $children = $('.section-nav .current').siblings('ul');
            $children = $children.clone().addClass('children-nav');
        } else {
            var $children = $('.search-option-tabs');

        }
        // Are there any children of the current page?
        if ($children.length > 0) {
            if ($('.section-nav').length > 0) {
                $('.section-nav').before($children);
            }
            var $title = $('.page-title');
            $title.after('<a href="#" class="children-nav-toggle"><span>Show Navigation</span></a>');
            $('.children-nav-toggle').on('click', function(e) {
                $(this).blur();
                $(this).toggleClass('active');
                $children.toggleClass('show');
                e.preventDefault();
            });
        }
    }
})(jQuery);

// Responsive Columns
// Ensures columns never get too small
(function($) {
    if ('__proto__' in {} && $('.section.search-section').length == 0) {
        var $columns = $('.group .column');
        // If columns are less than 16em wide, apply the class 'full'
        SelectorQueries.add($columns, "max-width", "15.9em", "full");
        SelectorQueries.ignoreDataAttributes();
    }
})(jQuery);

// Cross browser nth-child fallback for columns
(function($) {
    var $columns = $('.group .column');
    // If nth child isn't supported by the browser
    if ($columns.length > 0 && $columns.eq(0).css('clear') != 'left') {
        $('.group.half .column:nth-child(2n+1), .group.third .column:nth-child(3n+1)').addClass('clear');
        $('.lightbox-assets li:nth-child(4n+1)').addClass('clear');
    }
})(jQuery);



// Main nav
(function($) {
    // track links
    var $mainNav = $('.main-nav');
    if ($mainNav.length) {
        $mainNav.find('a').on('click', function(e) {
            pushTrackEvent({
                category: "Site Interactions",
                action: "Top level navigation",
                label: document.URL + ", " + $(this).attr('href')
            });
        });
    }
})(jQuery);

// Carousel Interactions
(function(win, $) {
    if ($('.carousel').length > 0) {
        var $carousel = $('.carousel'),
            $slide = $('a.slide', $carousel),
            $img = $('img', $carousel),
            large = false,
            fixedHeight = false,
            winWidth = 0;

        // track links
        $slide.find('.action').on('click', function(e) {
            pushTrackEvent({
                category: "Site Interactions",
                action: "Accordion link",
                label: document.URL + ", " + $(this).closest('a').attr('href')
            });
        });

        // Removes inline width and height from images
        function removeCarouselHeight() {
            if (fixedHeight == true && winWidth != $(win).width()) {
                $img.each(function() {
                    $(this).css({width:'', height:''});
                });
                fixedHeight = false;
            }
        }
        // Give images an explicit height based on their inherited widths
        function setCarouselHeight() {
            setTimeout(function() {
                if (winWidth != $(win).width()) {
                    removeCarouselHeight();
                    winWidth = $(win).width();
                    if ($img.parent('a').css('overflow') == 'hidden') {
                        var h = $img.eq(0).height();
                        $img.each(function() {
                            $(this).css({width: 'auto', height: h+1});
                        });
                        $img.eq(0).on('load', function(e) {
                            winWidth = 0;
                            fixedHeight = true;
                            removeCarouselHeight();
                            setCarouselHeight();
                        });
                    }
                }
            }, 10);
        }
        $(win).on('resize', function(e) {
            removeCarouselHeight();
        }).on('resize', throttle(function(e) {
            setCarouselHeight();
        }, 200));
        setCarouselHeight();
        $img.responsiveImages(400);
        // Hover and click functionality
        $carousel.on('click', 'a.slide', function(e) {
            $(this).blur();
            if (!$(this).hasClass('active')) {
                $carousel.addClass('transitioning');
                $('a.slide.active', $carousel).removeClass('active');
                $(this).addClass('active');
                setTimeout(function() {
                    $carousel.removeClass('transitioning');
                }, 500);
                updateNavLinks($(this));
                updatezIndex($(this));
                e.preventDefault();

                pushTrackEvent({
                    category: "Site Interactions",
                    action: "Accordion click",
                    label: document.URL + ", " + $(this).find('img').attr('src')
                });
            }
        }).on('touchstart', 'a.slide', function(e) {}).append('<ul class="carousel-nav"><li><a href="#" class="prev inactive">Previous</a></li><li><a href="#" class="next">Next</a></li></ul>');
        var $prev = $('.carousel-nav a.prev', $carousel),
            $next = $('.carousel-nav a.next', $carousel);
        $('.carousel-nav', $carousel).on('click', 'a', function(e) {
            $(this).blur();
            var $active = $('a.slide.active', $carousel);
            if ($(this).hasClass('prev')) {
                var $new = $active.prev('a.slide');
            } else {
                var $new = $active.next('a.slide');
            }
            if ($new.length > 0) {
                $new.addClass('active top').css({opacity: 0}).animate({opacity: 1}, 300, function() {
                    $active.removeClass('active');
                    $new.removeClass('top');
                });
                updateNavLinks($new);
                updatezIndex($new);
            }
            e.preventDefault();
        });
        function updateNavLinks($active) {
            if ($active.prev('a.slide').length == 0) {
                $prev.addClass('inactive');
            } else {
                $prev.removeClass('inactive');
                if ($active.next('a.slide').length == 0) {
                    $next.addClass('inactive');
                } else {
                    $next.removeClass('inactive');
                }
            }
        }
        function updatezIndex($active) {
            var z = 100;
            $slide = $active;
            while ($slide.length > 0) {
                $slide.css({zIndex: z});
                z = z - 10;
                $slide = $slide.next('a.slide');
            }
            $slide = $active.prev('a.slide');
            while ($slide.length > 0) {
                $slide.css({zIndex: z});
                z = z - 10;
                $slide = $slide.prev('a.slide');
            }
        }
    }
})(this, jQuery);

// Responsive Carousel
(function(win, $) {
    if ($('.subject-carousel').length > 0) {
        var $carousel = $('.subject-carousel'),
            $slides = $('.slide', $carousel);
        if ($slides.length > 1) {
            var $active = $('.slide.active', $carousel);
            $carousel.addClass('with-nav').prepend('<a class="prev disabled" href="#">Previous</a><a class="next" href="#">Next</a>');
            var $nav = $('a.prev, a.next', $carousel),
                $prev = $('a.prev', $carousel),
                $next = $('a.next', $carousel);
            $nav.height($carousel.height()-40);
            $('img', $carousel).on('load', function() {
                setNavHeight();
            });
            $(win).on('resize', function() {
                setNavHeight();
            });
            function setNavHeight() {
                $nav.height($active.height()-20);
            }
            setNavHeight();
            $prev.on('click', function(e) {
                if (!$(this).hasClass('disabled')) {
                    var $slide = $active.prev('.slide');
                    checkDisabled($slide);
                    $slide.css({right: $active.width(), width: $active.width(), height: $active.height(), display: 'block'}).animate({right: 46}, 300, function() {
                        $slide.addClass('active').removeAttr('style');
                        $active.removeClass('active');
                        $active = $slide;
                        setNavHeight();
                    });

                    pushTrackEvent({
                        category: "Site Interactions",
                        action: "Carousel click",
                        label: "Left"
                    });
                }
                e.preventDefault();
            });
            $next.on('click', function(e) {
                if (!$(this).hasClass('disabled')) {
                    var $slide = $active.next('.slide');
                    checkDisabled($slide);
                    $slide.css({left: $active.width(), width: $active.width(), height: $active.height(), display: 'block'}).animate({left: 46}, 300, function() {
                        $slide.addClass('active').removeAttr('style');
                        $active.removeClass('active');
                        $active = $slide;
                        setNavHeight();
                    });

                    pushTrackEvent({
                        category: "Site Interactions",
                        action: "Carousel click",
                        label: "Right"
                    });
                }
                e.preventDefault();
            });
            function checkDisabled($slide) {
                if ($slide.prev('.slide').length == 0) {
                    $prev.addClass('disabled');
                } else {
                    $prev.removeClass('disabled')
                }
                if ($slide.next('.slide').length == 0) {
                    $next.addClass('disabled');
                } else {
                    $next.removeClass('disabled')
                }
            }
        }
    }
})(this, jQuery);

// Responsive Section Image
(function($) {
    $('.section-image').responsiveImages(460);
})(jQuery);

// Social Links Interactions
(function($) {
    if ($('.social-links').length > 0) {
        $('.section.footer').append('<div id="fb-root"></div>');
        async('//connect.facebook.net/en_GB/all.js#xfbml=1');
        async('//platform.twitter.com/widgets.js');
        window.addthis_config = {
            ui_click: true,
            ui_open_windows: true
        };
        window.addthis_share = {
            templates: {
               twitter: '{{title}}: {{url}}'
            }
        };
        async('//s7.addthis.com/js/250/addthis_widget.js#pubid=ra-4f5f35981d6a489d');
    }
})(jQuery);

// Show Latest Tweets
(function($) {
    function standardiseDate(string) {
        var s = string.split(' ');
        string = s[0]+', '+s[2]+' '+s[1]+' '+s[5]+' '+s[3]+' GMT'+s[4];
        return string;
    }
    if ($('.latest-tweets').length > 0) {
        var $latestTweets = $('.latest-tweets');
        var request = $.ajax({
            url: '/handlers/twitterfeed.ashx',
            dataType: 'json'
        });
        request.done(function(tweets) {
            var len = tweets.length,
                html = '',
                links = '';
            for (var i=0; tweet=tweets[i], i<len; i++) {

                tweet.created_at = standardiseDate(tweet.created_at);
                //Build Tweet HTML
                if (tweet.entities) {
                    // Link URLs
                    if (tweet.entities.urls) {
                        for (var j=0, elen=tweet.entities.urls.length; entity=tweet.entities.urls[j], j<elen; j++) {
                            tweet.text = tweet.text.replace(entity.url, '<a href="'+entity.expanded_url+'">'+entity.display_url+'</a>');
                        }
                    }
                    // Link Users
                    if (tweet.entities.user_mentions) {
                        for (var j=0, elen=tweet.entities.user_mentions.length; entity=tweet.entities.user_mentions[j], j<elen; j++) {
                            tweet.text = tweet.text.replace(new RegExp('(^| )@'+entity.screen_name, 'gm'), '$1<a href="http://twitter.com/'+entity.screen_name+'" title="View '+entity.name+'&rsquo;s profile on Twitter">@'+entity.screen_name+'</a>');
                        }
                    }
                    // Link Hashtags
                    if (tweet.entities.hashtags) {
                        for (var j=0, elen=tweet.entities.hashtags.length; entity=tweet.entities.hashtags[j], j<elen; j++) {
                            tweet.text = tweet.text.replace(new RegExp('(^| )#'+entity.text, 'gm'), '$1<a href="https://twitter.com/hashtag/' +entity.text+'" class="muted" title="View this hashtag on Twitter">#'+entity.text+'</a>');
                        }
                    }
                }
                html += '<div id="tweet-'+tweet.id_str+'" class="tweet';
                if (i==0) {
                    html += ' active'
                }
                html += '">'+"\n";
                html += '<blockquote><p>'+tweet.text+"</p></blockquote>\n";
                html += '<p class="date">'+relativeDate(tweet.created_at)+"</p>\n";
                html += "</div>\n";
                links += '<li><a href="#" data-for="tweet-'+tweet.id_str+'"';
                if (i==0) {
                    links += ' class="active"';
                }
                links += '><span>Show Tweet '+i+"</span></a></li>\n";
            }
            html += '<ul class="tweet-links">'+"\n"+links+'</ul>';
            $latestTweets.html(html).addClass('show');
            var nextTweet = setInterval(function() {
                var tweet = $('.tweet.active', $latestTweets).next('.tweet');
                if (tweet.length == 0) {
                    tweet = $('.tweet', $latestTweets).eq(0);
                }
                changeTweet(tweet.attr('id'));
            }, 8000);
            $('.tweet-links a', $latestTweets).on('click', function(e) {
                clearInterval(nextTweet);
                changeTweet($(this).attr('data-for'));
                $(this).blur();
                e.preventDefault();
            });
        });
        request.fail(function() {
            $latestTweets.addClass('show');
        });
        function changeTweet(id) {
            $('.tweet-links .active', $latestTweets).removeClass('active');
            $('.tweet-links [data-for='+id+']', $latestTweets).addClass('active');
            $('.tweet.active', $latestTweets).fadeOut(300, function() {
                $(this).removeClass('active');
                $('.tweet#'+id, $latestTweets).fadeIn(300, function() {
                    $(this).addClass('active');
                });
            });
        }
    }
})(jQuery);

// Artifact Information Toggle
(function($) {
    if ($('.artifact .information').length > 0) {
        var $artifact = $('.artifact'),
            $information = $('.information', $artifact);
        $artifact.append('<a class="reveal" href="#"><span>Show information</span></a>');
        $information.append('<a class="close" href="#">Close</a>');
        var $reveal = $('.reveal', $artifact),
            $close = $('.close', $information);
        $reveal.on('click', function(e) {
            $information.show(300);
            $(this).fadeOut(300);
            e.preventDefault();
        });
        $close.on('click', function(e) {
            $information.hide(300);
            $reveal.fadeIn(300);
            e.preventDefault();
        });
    }
})(jQuery);

// Login Page
//(function() {
//    if($('#username').val()) {
//        $('.bookmarks-form').show();
//    } else {
//        var $bookmarksReveal = $('.reveal-bookmarks');
//        if ($bookmarksReveal.length > 0) {
//            $bookmarksReveal.on('click', function(e) {
//                $('.bookmarks-form').slideDown(300, function() {
//                    $('.bookmarks-form input').eq(0).focus();
//                });
//                e.preventDefault();
//            });
//        }
//    }
//})();

// Search Tool Finder Interactions
(function($) {
    if ($('.search-finder').length > 0) {
        function hasLayout() {
            return ($descriptions.css('position') == 'absolute');
        }
        function setMaxHeight() {
            $heightSelectors.css({height:''});
            var maxHeight = Math.max($searchFinder.height(),
                $descriptions.has('.active').height());
            if (hasLayout()) {
                $heightSelectors.height(maxHeight);
            }
        }
        var $searchFinder = $('.search-finder'),
            $descriptions = $('dd', $searchFinder),
            $heightSelectors = $searchFinder.add($descriptions);
        setMaxHeight();
        $searchFinder.on('click', 'dt', function(e) {
            $(this).blur();
            if ($(this).hasClass('active')) {
                return;
            }
            var $dt = $(this),
                $dd = $dt.next('dd'),
                $dtActive = $('dt.active', $searchFinder),
                $ddActive = $('dd.active', $searchFinder);
            $dtActive.removeClass('active');
            $dt.addClass('active');
            if (hasLayout()) {
                var $activeInner = $('div', $ddActive);
                $activeInner.fadeOut(500, function() {
                    $dd.css({zIndex: 10}).fadeIn(500, function() {
                        $(this).addClass('active').removeAttr('style');
                        $activeInner.removeAttr('style');
                        $ddActive.removeClass('active');
                        setMaxHeight();
                    });
                });
            } else {
                $ddActive.slideUp(500, function() {
                    $(this).removeClass('active').removeAttr('style');
                });
                $dd.slideDown(500, function() {
                    $(this).addClass('active').removeAttr('style');
                });
            }
        });
        $(window).on('resize', function(e) {
            setMaxHeight();
        });
    }
})(jQuery);

// Image Gallery Interactions
(function($) {
    if ($('.image-gallery').length > 0) {
        $('body').prepend('<div class="gallery-overlay"></div>');
        var $overlay = $('.gallery-overlay');
        function initGallery(el, maximised) {
            var $gallery = $(el),
                $slides = $('.slide', el),
                $actions = $('.gallery-images', el),
                $thumbList = $('ul', $actions),
                $prev = $('a.prev', $actions),
                $next = $('a.next', $actions),
                $thumbs = $('li a', $actions),
                slideNum = 0,
                last = $slides.length - 1,
                $overlayGallery;
            $actions.on('click', 'a', function(e) {
                if ($(this).hasClass('prev')) {
                    if (slideNum != 0) {
                        switchImage(--slideNum);
                    }
                } else if ($(this).hasClass('next')) {
                    if (slideNum != last) {
                        switchImage(++slideNum);
                    }
                } else {
                    slideNum = parseInt($thumbs.index(this));
                    switchImage(slideNum);
                }
                e.preventDefault();
            });
            function switchImage(slideNum) {
                var $slide = $slides.eq(slideNum);
                if (!$slide.hasClass('active')) {
                    $slides.filter('.active').removeClass('active');
                    $slide.addClass('active');
                    $('.active', $actions).removeClass('active');
                    var $thumb = $thumbs.eq(slideNum);
                    $thumb.addClass('active');
                    thumbListScroll = $thumbList.scrollLeft();
                    thumbListWidth = $thumbList.width();
                    // console.log(thumbListScroll);
                    thumbPosition = $thumb.position().left;
                    thumbWidth = $thumb.width();
                    // console.log(thumbPosition);
                    if (thumbPosition < 34) {
                        var newPosition = thumbListScroll+thumbPosition-34;
                        // console.log(newPosition);
                        $thumbList.scrollLeft(newPosition);
                    } else if (thumbPosition + thumbWidth > thumbListWidth) {
                        $thumbList.scrollLeft(thumbListScroll + thumbWidth);
                    }
                    if (slideNum == 0) {
                        $prev.addClass('disabled');
                    } else {
                        $prev.removeClass('disabled');
                    }
                    if (slideNum == last) {
                        $next.addClass('disabled');
                    } else {
                        $next.removeClass('disabled');
                    }
                    if (maximised) {
                        $overlayGallery = $('.image-gallery', $overlay);
                        centerGallery($overlayGallery);
                    }
                }
            }
            $gallery.on('click', function(e) {
                e.stopPropagation();
            });
            $overlay.add('.close', $overlay).on('click', function(e) {
                removeOverlay();
                e.preventDefault();
            });
            $slides.on('click', 'img', function(e) {
                if (maximised) {
                    removeOverlay();
                } else {
                    $overlay.html($gallery.clone());
                    $overlayGallery = $('.image-gallery', $overlay);
                    $('.slide img', $overlayGallery).each(function() {
                        /*
                        var src = this.src,
                            ext = src.substr(src.lastIndexOf('.')),
                            src = src.replace(ext, '-large'+ext);
                        this.src = src;*/
                        this.src = removeResize(this.src);
			$(this).on('load', function() {
                            centerGallery($overlayGallery);
                        });
                    });
                    $overlayGallery.prepend('<a class="close" href="#">Close</a>');
                    initGallery($overlayGallery, true);
                    $overlay.css({opacity: 0, display: 'block'});
                    $overlay.animate({opacity: 1}, 300);
                    centerGallery($overlayGallery);
                }
                e.preventDefault();
            });
            function centerGallery($overlayGallery) {
                var top = Math.max(10, $(window).height()/2 - $overlayGallery.height()/2);
                $overlayGallery.css('margin-top', top);
            }
            function removeOverlay() {
                $overlay.fadeOut(300, function() {
                    $('.image-gallery', $overlay).remove();
                });
            }
        }
        $('.image-gallery').each(function() {
            initGallery(this, false);
        });
    }
})(jQuery);

// Global navigation for small screens
(function($) {
    var $html = $('html'),
        $header = $('.section.header'),
        $pageWrap = $('.page-wrap');
    var supportsTransition = supports('transition'),
        ua = navigator.userAgent.toLowerCase(),
        isAndroid = ua.indexOf('android'),
        has3d = (supports('perspective') && !( ($.browser.mozilla && $.browser.version < 13) || (isAndroid !== -1 && parseFloat(ua.slice(isAndroid+8,isAndroid+9)) < 3) ) );
    if (has3d) {
        $('html').addClass('has3d');
    }
    var globalMenu = '<div class="global-menu">';
    if ($('.account-links', $header).length > 0) {
        globalMenu += '<div class="account-links">'+$('.account-links', $header).html()+'</div>';
    }
    var mainNav = $('.main-nav', $header).html();
    if(mainNav) {
        globalMenu += '<ul class="main-nav">'+ mainNav + '</ul>';
    }
    var searchUi = $('.search', $header).html();
    if(searchUi) {
        globalMenu += '<form class="search" method="get" action="'+$('.search', $header).attr('action')+'">' + searchUi + '</form>';
    }
    globalMenu += '<ul class="secondary-nav">'+$('.footer-nav').html()+'</ul>';
    var utLinks = $('.ut .ut-links').html();
    if(utLinks) {
        globalMenu += '<ul class="ut-links">'+ utLinks + '</ul>';
    }
    globalMenu += '</div>';
    $pageWrap.before(globalMenu);
    $('.site-title', $header).before('<a href="#" class="toggle-global-menu"><span></span>Menu</a>');
    var $globalMenu = $('.global-menu');
    var $toggleGlobalMenu = $('.toggle-global-menu', $header);
    $toggleGlobalMenu.on('click', function(e) {
        if ($html.hasClass('reveal-menu')) {
            hideGlobalMenu(500);
        } else {
            showGlobalMenu();
        }
        e.preventDefault();
    });
    function showGlobalMenu() {
        $html.addClass('reveal-menu');
        var width = $(window).width()-50;
        $globalMenu.width(width);
        if (has3d) {
            setTransform('translate3d('+width+'px,0,0)');
        } else {
            $pageWrap.css({marginLeft: width, marginRight: -width});
        }
        $(window).on('touchend scroll', globalTouchEnd).on('resize', globalResize);
    }
    function hideGlobalMenu(animate) {
        if (animate && supportsTransition) {
            setTimeout(function() {
                $html.removeClass('reveal-menu');
            }, animate);
        } else {
            $html.removeClass('reveal-menu');
        }
        if (has3d) {
            setTransform('translate3d(0,0,0)');
        } else {
            $pageWrap.css({marginLeft: 0, marginRight: 0});
        }
        $(window).off('touchend scroll', globalTouchEnd).off('resize', globalResize);
    }
    var globalTouchEnd = throttle(function() {
        if ($(window).scrollLeft() > 20) {
            hideGlobalMenu(false);
        }
    }, 50);
    var globalResize = throttle(function() {
        if ($toggleGlobalMenu.css('display') != 'block') {
            hideGlobalMenu(false);
        }
    }, 50);
    function setTransform(transform) {
        $pageWrap.css({'-webkit-transform': transform, '-moz-transform': transform, '-ms-transform': transform, '-o-transform': transform, 'transform': transform});
    }
})(jQuery);

// Sitemap
(function($) {
    if ($('.sitemap-list').length > 0) {
        var $sitemap = $('.sitemap-list');
        $('ul ul', $sitemap).each(function() {
            $(this).before('<a href="#" class="more">More</a>').hide();
        });
        $sitemap.on('click', '.more', function(e) {
            $(this).next('ul').slideDown(300);
            $(this).slideUp(300, function() {
                $(this).remove();
            });
            e.preventDefault();
        });
    }
})(jQuery);

// Search By Subject
(function($) {
    if ($('.subject-search-results').length > 0) {
        $('.subject-search-results').on('click', '.related-results-toggle', function() {
            $target = $('.related-results', $(this).parents('li'));
            if ($(this).hasClass('close')) {
                $target.slideUp(300);
                $(this).removeClass('close');
            } else {
                $target.slideDown(300);
                $(this).addClass('close');
            }
        });
    }
})(jQuery);

// Blog Comments
(function($) {
    if ($('#commentform').length > 0) {
        var $commentForm = $('#commentform, #reply-title');
        $('#reply-title').before('<a href="#" class="show-commentform button purple">Leave a Reply</a>');
        $('.show-commentform').on('click', function(e) {
            $(this).remove();
            $commentForm.slideDown(300);
            e.preventDefault();
        });
    }
})(jQuery);

// Print link
(function($) {
    $('.print-link').on('click', function(e) {
        window.print();
        e.preventDefault();
    });
})(jQuery);

(function($) {
    if (location.pathname.indexOf("/player") == 0 || location.pathname.indexOf("/oldplayer") == 0) {
        $("#contactUsLink").hide();
    }

    // cookie consent temporarily disabled on wellcomelibrary.org
    if ($.cookie('cookieconsent_lib') != 'agreed') // && window.location.hostname.indexOf('wellcomelibrary.org') == -1)
    {
        $('#cookieconsent').css('display', 'block');
    }

    // temp -make this global...
    var consentCookieOptions = { expires: 9999, path: '/', domain: '.wellcome.ac.uk' };
    // please leave the above line intact, exactly as is. A Regex replaces it with the following for live environments:
    //var consentCookieOptions = { expires: 9999, path: '/', domain: '.wellcome.ac.uk' };

    // and then we have this temporary thing to accomodate multiple hostnames:
    if (consentCookieOptions.domain == '.wellcome.ac.uk' && window.location.hostname.indexOf('wellcomelibrary.org') != -1) {
        consentCookieOptions.domain = ".wellcomelibrary.org";
    }

    $('#accept').click(function() {
        $.cookie('cookieconsent_lib', 'agreed', consentCookieOptions);
        $('#cookieconsent').css('display', 'none');
    });

    // alert popups
    var popupcookie = $.cookie('alertpopups_lib') || '';
    $('.alert-popup').each(function() {
        var popid = this.id;
        if (popupcookie.indexOf(popid) == -1) {
            var popup = $(this);
            popup.show(1500);
            popup.find('a').click(function(ev) {
                $.cookie('alertpopups_lib', popupcookie + popid, consentCookieOptions);
                if ($(this).attr('class') != 'alert-popup-message') {
                    ev.preventDefault();
                }
                popup.hide(500);
            });
        }
    });

 })(jQuery);

// Truncate long text
(function ($) {

if ($.fn.expander) {
    $('div.truncate').expander({
        slicePoint: 800, // default is 100
        expandPrefix: ' ... ', // default is '... '
        expandText: 'Read More', // default is 'read more'
        userCollapseText: '' // default is 'read less'
    });
}

})(jQuery);

// to avoid loading effects
(function ($) {
$.fn.highlight = function () {
    $(this).each(function () {
        var el = $(this);
        el.before("<div/>");
        el.prev()
        .width(el.width())
        .height(el.height())
        .css({
            "position": "absolute",
            "background-color": "#ffff99",
            "opacity": ".9"
        })
    .fadeOut(2000);
    });
};
})(jQuery);

// Search
(function ($) {
/* *** OLD SEARCH FUNCTIONALITY *** */
// Hide the search options.
$('.search-options .search-type').addClass("hidden");

// The search options are not selected.
var searchtypeSelected = false;

    $(".search-options .search-type").hover(
        function () { searchtypeSelected = true; },
        function () {
            searchtypeSelected = false;
        });

$(".search-options .search-field").click(function () {
    $('.search-options .search-type').removeClass("hidden");
    $(".search-options").addClass("search-type-open");
});

$(".search-options .search-field").blur(function () {
    if (!searchtypeSelected) {  // if you click on anything other than the search-type
        $(".search-options .search-type").addClass("hidden");  // hide the results
        $(".search-options").removeClass("search-type-open");
    }
});

$(".search-options .search-type-close").click(function () {
    $(".search-options .search-type").addClass("hidden");  // hide the results
    $(".search-options").removeClass("search-type-open");
});

/* *** NEW SEARCH FUNCTIONALITY; EXPERIMENTAL *** */
/*
var searchCookieName = 'WL_SEARCH_TYPE';
var searchCookieVal = $.cookie(searchCookieName);
var searchWrap       = $('.search-options');
var searchField      = searchWrap.find('.search-field');
var searchType       = searchWrap.find('.search-type');
var searchArrow      = searchWrap.find('.search-type-arrow');
var searchClose      = function() {
	searchWrap.removeClass('search-type-open');
	searchType.addClass('hiding');
};
var searchOpen = function() {
	searchWrap.addClass('search-type-open');
	searchType.removeClass('hiding');
};

// Remember the user's search type selection from the cookie, if set
if ('undefined' !== typeof searchCookieVal && searchCookieVal) {
	searchType.find('input[value=' + searchCookieVal + ']').prop('checked', true);
}

// Set the placeholder correctly
searchField.attr('placeholder', searchType.find('input:checked').attr('data-placeholder'));

// Polyfill the placeholder on the search field for older browsers
Placeholders.disable();
Placeholders.enable(searchField.get(0));

// Hide the search options by default
searchClose();

// Show the search type box on focus or the input
searchField.on('focus', searchOpen);

// Show the search type box on click of the arrow
searchArrow.on('click', function() {
	searchField.focus();
});

// Close the search type box when close button or outside box is clicked
searchWrap.find('.search-type-close').add('html,body').on('click', searchClose);

// Don't close the search type box if click landed in the box or input element
searchType.add(searchField).add(searchArrow).on('click', function(e) {
	e.stopPropagation();
});

// Ensure the search type box is showing when focus is on the radio buttons
searchType.find('input').on('focus', searchOpen);

// Close the search type box when anything else is focused
$('a, input, select, button').on('focus', function() {
	if (!$.contains(searchWrap.get(0), this)) {
		searchClose();
	}
});

// Change placeholder text when search type is changed
searchType.find('input').on('change', function() {
	var placeholder = $(this).attr('data-placeholder');

	if (placeholder) {
		searchField.attr('placeholder', placeholder);
	}

	// Save cookie for the user's selection
	$.cookie(searchCookieName, $(this).val(), {
		expires: 30, // Expires in 30 days
		domain : 'wellcomelibrary.org',
	});
});

// Close the search type box after any type input is selected (even if currently selected)
searchType.find('input').on('click', function(e) {
	e.stopPropagation();
	searchClose();
});

searchType.find('input, a').on('focus', function() {
	searchOpen();
});

// Nasty hack to make IE work properly
searchType.find('label').on('click', function() {
    $(this).find('input').click();

    return false;
});
*/
})(jQuery);

/* Archive Tree Tree */
(function ($) {
    $('.archiveTree.tree ul').each(function(){
    var $parent = $('li', this).last();
    var $height = $parent.height();
    var $newHeight = $height - 20;
    $parent.append('<span class="last-mask" style="height: '+$newHeight+'px"></span>');

/* Archive Tree Collapse */
    $('.archiveTree.collapse.no-js').removeClass('no-js');
    $('.archiveTree.collapse ul').each(function(i) {
        ////
        if($(this).length) {
            $(this).before('<div class="archiveTreeCollapseItem">&#9650;</div>');
        }
        ////
    });
    $('.archiveTree.collapse').on('click', '.archiveTreeCollapseItem', function() {
        //////
        var $nextItem = $(this).next('ul');
        var $nextItemState = $(this).next('ul').data('archive-tree-state');
        //////
        if($nextItemState === 'show') {
            $(this).next('ul').slideDown();
            $nextItem.data('archive-tree-state', 'hide');
            $(this).html('&#9650;');
        }
        else {
            $(this).next('ul').slideUp();
            $nextItem.data('archive-tree-state', 'show');
            $(this).html('&#9660;');
        }
        ///////
    });
});
})(jQuery);


/* Alerts */
(function ($) {
    hasKey = function (obj, key) {
        return obj != null && hasOwnProperty.call(obj, key);
    };
    var $alerts = '';
    var showAlerts = document.querySelector('[data-show-alerts]') ? true : false;

    if (showAlerts) {
        var getAlerts = fetchAlerts();
        getAlerts.done(function (data) {
            if (hasKey(data, 'alerts')) {
                var alerts = data.alerts;
                $.each(alerts, function (key, value) {
                    var alertTemplate = null;
                    if (hasKey(value, 'targets')) {
                        var targets = value.targets;
                        // target options main, blog, catalogue
                        if (isLibrary && targets.indexOf('main') >= 0) {
                            alertTemplate = generateAlert(value);
                        }
                        if (isBlog && targets.indexOf('blog') >= 0) {
                            alertTemplate = generateAlert(value);
                        }
                        if (isCatalogue && targets.indexOf('catalogue') >= 0) {
                            alertTemplate = generateAlert(value);
                        }
                    } else {
                        // no targets - it can go in
                        alertTemplate = generateAlert(value);
                    }
                    if (alertTemplate != null) {
                        $alerts = $alerts + alertTemplate;
                    }
                });
                $('.page-wrap').prepend($alerts);
            }
        });
    }

    function generateAlert(value) {
        var alertTemplate = '<div class="alert {{classes}}"><div class="alert__row"><div class="alert__content">{{title}}{{content}}</div></div></div>';
        var title = (hasKey(value, 'title')) ? value.title : '';
        var content = (hasKey(value, 'content')) ? value.content : '';
        var classes = '';
        classes += (hasKey(value, 'size')) ? ' alert-' + value.size : '';
        classes += (hasKey(value, 'color')) ? ' ' + value.color : '';
        classes += (hasKey(value, 'icon')) ? ' has-icon icon-' + value.icon : '';
        alertTemplate = alertTemplate.replace(/{{title}}/, title);
        alertTemplate = alertTemplate.replace(/{{content}}/, content);
        alertTemplate = alertTemplate.replace(/{{classes}}/, classes);
        return alertTemplate;
    }

    function fetchAlerts() {
        //var url = '//localhost:8080/data/alerts.json';
        var url = '//wellcomelibrary.org/handlers/alerts.ashx';
        return $.ajax({
            type: 'GET',
            url: url,
            cache: false,
            dataType: 'json',
            success: function (data) {
                console.info('Successfully fetched alerts');
            },
            error: function (data) {
                console.info('Unable to fetch alerts');
            },
        });
    }

})(jQuery);

// -------------------------------------------------------
// MERGED: /Scripts/base64.min.js

(function(){var a=typeof window!="undefined"?window:exports,b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",c=function(){try{document.createElement("$")}catch(a){return a}}();a.btoa||(a.btoa=function(a){for(var d,e,f=0,g=b,h="";a.charAt(f|0)||(g="=",f%1);h+=g.charAt(63&d>>8-f%1*8)){e=a.charCodeAt(f+=.75);if(e>255)throw c;d=d<<8|e}return h}),a.atob||(a.atob=function(a){a=a.replace(/=+$/,"");if(a.length%4==1)throw c;for(var d=0,e,f,g=0,h="";f=a.charAt(g++);~f&&(e=d%4?e*64+f:f,d++%4)?h+=String.fromCharCode(255&e>>(-2*d&6)):0)f=b.indexOf(f);return h})})();

// -------------------------------------------------------
// MERGED: /Scripts/utils.js


// debug

// http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function () {
    log.history = log.history || [];   // store logs to an array for reference
    log.history.push(arguments);
    if (this.console) {
        console.log(Array.prototype.slice.call(arguments));
    }
};

// end debug

// string

String.format = function () {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }

    return s;
};

String.prototype.startsWith = function (str) { return this.indexOf(str) == 0; };
String.prototype.trim = function () { return this.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); };
String.prototype.ltrim = function () { return this.replace(/^\s+/, ''); };
String.prototype.rtrim = function () { return this.replace(/\s+$/, ''); };
String.prototype.fulltrim = function () { return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' '); };
String.prototype.toFileName = function () { return this.replace(/[^a-z0-9]/gi, '_').toLowerCase(); };

function ellipsis(text, chars) {
    if (text.length <= chars) return text;
    var trimmedText = text.substr(0, chars);
    trimmedText = trimmedText.substr(0, Math.min(trimmedText.length, trimmedText.lastIndexOf(" ")));
    return trimmedText + "&hellip;";
}

function numericalInput (event) {
    // Allow: backspace, delete, tab and escape
    if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 ||
        // Allow: Ctrl+A
        (event.keyCode == 65 && event.ctrlKey === true) ||
        // Allow: home, end, left, right
        (event.keyCode >= 35 && event.keyCode <= 39)) {
        // let it happen, don't do anything
        return true;
    } else {
        // Ensure that it is a number and stop the keypress
        if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
            event.preventDefault();
            return false;
        }
        return true;
    }
}

// end string

// math

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function roundNumber(num, dec) {
    var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;
}

function normalise(num, min, max) {
    return (num - min) / (max - min);
}

function fitRect(width1, height1, width2, height2) {
    var ratio1 = height1 / width1;
    var ratio2 = height2 / width2;

    var width, height, scale;

    if (ratio1 < ratio2) {
        scale = width2 / width1;
        width = width1 * scale;
        height = height1 * scale;
    }
    if (ratio2 < ratio1) {
        scale = height2 / height1;
        width = width1 * scale;
        height = height1 * scale;
    }

    return { width: Math.floor(width), height: Math.floor(height) };
}

// end math

// array

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) {
                return i;
            }
        }
        return -1;
    };
}

// end array

// date

function getTimeStamp() {
    return new Date().getTime();
}

// end date

// querystring

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if (results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}

// end querystring

// uri

function getUrlParts(url) {
    var a = document.createElement('a');
    a.href = url;

    return {
        href: a.href,
        host: a.host,
        hostname: a.hostname,
        port: a.port,
        pathname: a.pathname,
        protocol: a.protocol,
        hash: a.hash,
        search: a.search
    };
}

function convertToRelativeUrl(url) {
    var parts = getUrlParts(url);
    var relUri = parts.pathname + parts.search;

    if (!relUri.startsWith("/")) {
        relUri = "/" + relUri;
    }

    return relUri;
}

// end uri

// objects

if (typeof Object.create !== 'function') {
    Object.create = function(o) {
        var F = function() {
        };
        F.prototype = o;
        return new F();
    };
}

Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

// end objects

// events

function debounce(fn, debounceDuration) {
    // summary:
    //      Returns a debounced function that will make sure the given 
    //      function is not triggered too much.
    // fn: Function
    //      Function to debounce.
    // debounceDuration: Number
    //      OPTIONAL. The amount of time in milliseconds for which we 
    //      will debounce the function. (defaults to 100ms)

    debounceDuration = debounceDuration || 100;

    return function () {
        if (!fn.debouncing) {
            var args = Array.prototype.slice.apply(arguments);
            fn.lastReturnVal = fn.apply(window, args);
            fn.debouncing = true;
        }
        clearTimeout(fn.debounceTimeout);
        fn.debounceTimeout = setTimeout(function () {
            fn.debouncing = false;
        }, debounceDuration);

        return fn.lastReturnVal;
    };
};

// end events

// dom

function getMaxZIndex(){
    return Math.max.apply(null,$.map($('body > *'), function(e,n){
        if($(e).css('position')=='absolute')
            return parseInt($(e).css('z-index'))||1 ;
        })
    );
}

// end dom

// -------------------------------------------------------
// MERGED: /assets/js/wl.js


$(document).ready(function () {

    // Add "current" class to main navigation links
    if (location.pathname.length > 1 && location.pathname.indexOf('moh/') == -1) {
        $('.main-nav li a').each(function () {
            var navLinkTarget = $(this).attr('href');
            if (navLinkTarget == location.pathname ||
                (navLinkTarget != '/' && location.pathname.indexOf(navLinkTarget) == 0)) {
                $(this).addClass('current');
            }
        });
    } else if (window.location.hostname.indexOf('blog') == -1 && location.pathname.indexOf('moh/') == -1) {
        $('.main-nav li:first-child a').addClass("current");
    }

    // when the user clicks login, store the current url
    //$('.account-links .login').click(function () {
    //    jQuery.cookie('wlredirect', window.location.href, { path: '/' });
    //});

    //if (document.location.protocol.indexOf("https") == 0) {
    //    // avoid unnecessary https traffic
    //    $('a').each(function () {
    //        var newPrefix = window.libraryAuthRealm.replace("https:", "http:");
    //        newPrefix = newPrefix.substr(0, newPrefix.length - 1); // remove last "/"
    //        var tgtHref = $(this).attr('href');
    //        if (tgtHref.indexOf("/") == 0 && tgtHref.indexOf("//") != 0) {
    //            if (tgtHref.indexOf("/account") != 0
    //                && tgtHref.indexOf("/login") != 0
    //                && tgtHref.indexOf("/handlers/auth/Google") != 0)
    //                $(this).attr('href', newPrefix + tgtHref);
    //        }
    //    });
    //}


    // if user is logged in, change top nav links
    function authNav() {

        if (!window.libraryCasServer) return;
        if (window.isPatternPortfolio) return;


        if ($.cookie("wlauthssodisp")) {
            $.ajax({
                url: "/handlers/auth/checkSession.ashx",
                dataType: "jsonp",
                cache: false,
                success: function (response) {
                    console.log(response);
                    if (response === "OK") {
                        changeTopNavLinksForLogin($.cookie("wlauthssodisp"));
                    }
                }
            });
        }
        else {
            $('.site-title.reduced').before('<ul class="account-stores"></ul>');
        }
    }

    String.prototype.contains = function (it) { return this.indexOf(it) != -1; };

    //check if request is from outside to see if we should trigger a non-cached round trip to the server, to trigger a gateway op.
    //console.log("document.referrer: " + document.referrer);
    if (
        window.libraryCasServer && 
        (document.referrer.contains("catalogue.wellcomelibrary.org")
            || document.referrer.contains("search.wellcomelibrary.org")
            || !(document.referrer.contains("wellcomelibrary.org")))
        && !location.search.contains("ticketValidationFailure")
    ) {
        window.addEventListener("message", gatewayCallBack, false);
        var gateway = window.libraryCasServer + "?gateway=true&service=" + window.libraryAuthRealm + "casframe.aspx";
        $('#casFrame').attr('src', gateway);
    }

    authNav();

    function gatewayCallBack(event) {
        console.log("received postMessage");
        if (window.libraryAuthRealm.indexOf(event.origin) === 0 && event.message) {
            changeTopNavLinksForLogin(event.message);
        }
    }

    // tabbed body fields in Microsite
    $('div#tab2').hide();
    $('#tabList li a').click(function (e) {
        e.preventDefault();
        $('#tabList li a').removeClass('current');
        $('.hideable-tab').hide();
        $(this).addClass('current');
        $($(this).attr('href')).show();
        pushTrackEvent({
            category: "Site Interactions",
            action: "Tab Clicked",
            label: $(this).text()
        });
    });

    $('table.images-centered td').has('img').addClass('text-center');

//    // handle the search
//    $("#topSiteSearch").submit(function (e) {
//        // TODO: why no work?
//        //        if ($("#siteRadioButton:checked").length > 0) {
//        //            e.preventDefault();
//        //            var q = $("#searchQuery").val();
//        //            if (q) {
//        //                location.href = "/search/?q=" + q;
//        //            }
//        //        }
//    });

    // link tracking: http://www.blastam.com/blog/index.php/2013/03/how-to-track-downloads-in-google-analytics-v2/
    document.filetypes = /\.(zip|exe|dmg|pdf|doc.*|xls.*|ppt.*|mp3|txt|rar|wma|mov|avi|wmv|flv|wav)$/i;
    document.baseHref = '';
    if ($('base').attr('href') != undefined) document.baseHref = $('base').attr('href');

    $('a.track-link, .track-link a').on('click', function () {

        var el = $(this);
        var track = true;
        var href = (typeof (el.attr('href')) != 'undefined') ? el.attr('href') : "";
        var isThisDomain = href.match(document.domain.split('.').reverse()[1] + '.' + document.domain.split('.').reverse()[0]);
        if (!isThisDomain && href) {
            isThisDomain = (document.domain == href.replace(/^https?\:\/\//i, '').split('/')[0]);
        }
        if (!href.match(/^javascript:/i)) {
            var elEv = [];
            elEv.value = 0, elEv.non_i = false;
            elEv.category = "Links";
            if (href.match(/^mailto\:/i)) {
                elEv.action = "Mailto";
                elEv.label = href.replace(/^mailto\:/i, '');
                elEv.loc = href;
            } else if (href.match(document.filetypes)) {
                var extension = (/[.]/.exec(href)) ? /[^.]+$/.exec(href) : undefined;
                elEv.action = "Download " + extension[0];
                elEv.label = href.replace(/ /g, "-");
                elEv.loc = document.baseHref + href;
            } else if (href.match(/^https?\:/i) && !isThisDomain) {
                elEv.action = "External";
                elEv.label = href.replace(/^https?\:\/\//i, '');
                elEv.non_i = true;
                elEv.loc = href;
            } else if (href.match(/^tel\:/i)) {
                elEv.action = "Telephone";
                elEv.label = href.replace(/^tel\:/i, '');
                elEv.loc = href;
            } else track = false;

            if (track) {
                pushTrackEvent(elEv);
                if (el.attr('target') == undefined || el.attr('target').toLowerCase() != '_blank') {
                    setTimeout(function () { location.href = elEv.loc; }, 400);
                    return false;
                }
            }
        }
    });


    $('.download-as a').on('click', function () {
        var el = $(this);
        var track = false;
        var href = (typeof (el.attr('href')) != 'undefined') ? el.attr('href') : "";
        var elEv = [];
        elEv.value = 0, elEv.non_i = false;
        elEv.category = "Links";
        elEv.label = href.replace(/ /g, "-");
        elEv.loc = document.baseHref + href;
        if (href.indexOf('moh/service/zip') != -1) {
            elEv.action = "Download MoH Zip";
            track = true;
        }
        if (href.indexOf('moh/service/table') != -1) {
            elEv.action = "Download MoH Table";
            track = true;
        }
        if (track) {
            pushTrackEvent(elEv);
            // we don't need to do this becuase we're not unloading the page..
            //            if (el.attr('target') == undefined || el.attr('target').toLowerCase() != '_blank') {
            //                setTimeout(function () { location.href = elEv.loc; }, 400);
            //                return false;
            //            }
        }
    });

    $('#wlReducedLogo').on('click', function (e) {
        if (e.shiftKey || e.metaKey || e.ctrlKey) {
            e.preventDefault();
            var navBNumber = null;
            var otherPageUri, dataUri;
            if (location.pathname.indexOf('/plyr/b') === 0) {
                navBNumber = location.pathname.slice(8, 17);
                otherPageUri = '/item/' + navBNumber;
                dataUri = '/package/' + navBNumber;
            } else if (location.pathname.indexOf('/item/b') === 0) {
                navBNumber = location.pathname.slice(6, 15);
                otherPageUri = '/plyr/' + navBNumber;
                dataUri = '/iiif/' + navBNumber + '/manifest';
            }
            if (!navBNumber) return;
            
            if (e.shiftKey) {
                location.href = otherPageUri;
            }

            if (e.metaKey || e.ctrlKey) {
                location.href = dataUri;
            }
        }
    });

});

function pushTrackEvent(eventObj) {
    console.log("GA trackEvent: " + eventObj.category.toLowerCase() + ", " + eventObj.action.toLowerCase() + ", " + eventObj.label.toLowerCase() + ", " + eventObj.value + ", " + eventObj.non_i);
    if (typeof ga === 'undefined') {
        return;
    }
    ga('send', 'event', eventObj.category.toLowerCase(), eventObj.action.toLowerCase(), eventObj.label.toLowerCase(), eventObj.value || 0, eventObj.non_i);
    //_gaq.push(['_trackEvent', eventObj.category.toLowerCase(), eventObj.action.toLowerCase(), eventObj.label.toLowerCase(), eventObj.value || 0, eventObj.non_i]);
}

function isGuest() {
    var c = $.cookie("wlauthssodisp");
    if (!c) return false;
    var dispName = b64_to_utf8(c);
    var userTypeIndex = dispName.indexOf("|~|");
    return (dispName.substr(userTypeIndex + 3, 1) == 'G');
}

function changeTopNavLinksForLogin(base64DisplayName) {
    var dispName = b64_to_utf8(base64DisplayName);
    if (isGuest()) {
        //$('.account-links').prepend('<span class="user-name">' + dispName.substr(0, userTypeIndex) + '</span>'); //Remove this line after tests.
        $('.account-links').prepend('<span class="user-name"></span>');
        return false;
    }
    var userTypeIndex = dispName.indexOf("|~|");
    $('.account-links').empty();
    $('.account-links').append('<span class="user-name">' + dispName.substr(0, userTypeIndex) + '</span>');
    if (dispName.substr(userTypeIndex + 3, 1) == '.') {
        var patronId = dispName.substring(userTypeIndex + 4);
        var shortPatronId = patronId.slice(0, -1);
        $('.account-links').append('<a class="account button purple" href="' + window.encoreCatalogueSecureBaseUrl + '/patroninfo/' + shortPatronId + '/">My Library Account</a>');
    }
    var loginText = "My Bookmarks";
    $('.account-links').append('<a class="account button purple" href="' + window.libraryAuthRealm + 'account/">' + loginText + '</a>');
    $('.account-links').append('<a class="logout button" href="' + window.libraryAuthRealm + 'handlers/logout.ashx?returnUrl=' + location.pathname + '">Logout</a>');

    $('ul.account-stores').remove();
    //var ugcSettings = '<ul class="account-stores"><li><a href="#">Blah</a> <span>(812)</span></li><li><a href="#">Bookmarks</a> <span>(1)</span></li></ul>';
    var ugcSettings = '<ul class="account-stores"></ul>'; // TODO: make this dynamic later
    $('.site-title.reduced').before(ugcSettings);
}


function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
}

function StringBuffer() {
    this.buffer = [];
}
StringBuffer.prototype.append = function append(string) {
    this.buffer.push(string);
    return this;
};
StringBuffer.prototype.toString = function toString() {
    return this.buffer.join("");
};