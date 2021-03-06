/*
Copyright (c) 2010-2014
              DFKI - German Research Center for Artificial Intelligence
              www.dfki.de

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
 so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/** This class manages listeners for given events, for a variable number of arguments.
 *
 *  It holds a map from event names to listeners. The event names can be managed
 *  through add/removeListenerTypes() and isListenerType(). Also derived classes
 *  may define a property "listenerTypes", that will be automatically parsed during
 *  the Observable's constructor.
 *
 *  To register an event, addListener() should be called with the associated event
 *  name and a callback method.
 *
 *  All listeners of an event type can be called with notifyListeners(), which expects the
 *  corresponding event name.
 */
XML3D.tools.util.Observable = new XML3D.tools.Class({

    /**
     *  @this {XML3D.tools.util.Observable}
     */
    initialize: function()
    {
        /** @private */
        this._listeners = {};
        /** @private */
        this._listenerTypes = {};

        // initialize types from derived classes
        if(this.listenerTypes)
            this.addListenerTypes(this.listenerTypes);
    },

    /** Remembers the given (array of) event name as valid event names.
     *
     *  @this {XML3D.tools.util.Observable}
     */
    addListenerTypes: function(listenerTypes)
    {
        if(!listenerTypes)
            return;

        if(listenerTypes.constructor == Array)
        {
            for(var i = 0; i < listenerTypes.length; i++)
            {
                var type = listenerTypes[i];
                if(this._listenerTypes[type] === true)
                    throw "XML3D.tools.util.Observable: type already registered: '" + type + "'!";

                this._listenerTypes[type] = true;
            }
        }
        else if(this._listenerTypes[listenerTypes] === true)
        {
            throw "XML3D.tools.util.Observable: type already registered: '" + listenerTypes + "'!";
        }
        else
            this._listenerTypes[listenerTypes] = true;
    },

    /** Remove the given listener types from the array. The listeners will not be
     *  removed!
     *
     *  @this {XML3D.tools.util.Observable}
     */
    removeListenerTypes: function(listenerTypes)
    {
        if(!listenerTypes)
            return;

        if(listenerTypes.constructor == Array)
        {
            for(var i = 0; i < listenerTypes.length; i++)
                this._listenerTypes[listenerTypes[i]] = false;
        }
        else
            this._listenerTypes[listenerTypes] = false;
    },


    /** Add a listener for the given event type
     *
     *  @this {XML3D.tools.util.Observable}
     *
     *  @param {string} evtname
     *  @param {function()} listener
     */
    addListener: function(evtname, listener)
    {
        if(this.isListenerType(evtname))
        {
            if(!this._listeners[evtname])
                this._listeners[evtname] = [];

            this._listeners[evtname].push(listener);
        }
    },

    /** Remove first occurence of given element.
     *
     *  @this {XML3D.tools.util.Observable}
     *  @param {string} evtname
     *  @param {function()} listener
     */
    removeListener: function(evtname, listener)
    {
        if(this.isListenerType(evtname))
        {
            if(!this._listeners[evtname])
                return;

            for(var i = 0; i < this._listeners[evtname].length; i++)
            {
                if(this._listeners[evtname][i] === listener)
                {
                    this._listeners[evtname].slice(i, 1);
                    return;
                }
            }
        }
    },

    /** Notifies all listeners. Arguments can be given to this function that get
     *     forwarded to each listener.
     *
     *  @this {XML3D.tools.util.Observable}
     *  @param {string} evtname
     */
    notifyListeners: function(evtname)
    {
        if(this.isListenerType(evtname)
        && this._listeners[evtname])
        {
            var args = Array.prototype.slice.call(arguments);
            for(var i = 0; i < this._listeners[evtname].length; i++)
                this._listeners[evtname][i].apply(this, args.slice(1));
        }
    },

    /** Returns whether this listener manager manages the given event name.
     *
     *  @this {XML3D.tools.util.Observable}
     *  @param {string} evtname
     *  @return {boolean} true if evtname is registered as a listener type.
     */
    isListenerType: function(evtname)
    {
        return (this._listenerTypes[evtname] === true);
    }
});
