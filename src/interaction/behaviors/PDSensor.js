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
(function(){

    "use strict";

    XML3D.tools.namespace("XML3D.tools.interaction.behaviors");

    /** A simple pointing device sensor.
     *
     * Listens to mouse events and notifies listeners of dragging events, i.e.
     * start/end of dragging and the dragging itself, as well as touch events,
     * when the pointing device touched an element (e.g. mouse click event).
     * The state of the sensor includes a pointing device position (represented
     * by a ray), the current hit element and corresponding hit point.
     *
     * Users of the class register handlers to the dragging events
     * "dragstart", "drag" and "dragend".
     *
     * @extends XML3D.tools.util.Observable
     *
     */
    XML3D.tools.interaction.behaviors.PDSensor = new XML3D.tools.Class(
        XML3D.tools.util.Observable, {

        listenerTypes: [
            "dragstart", "drag", "dragend", // args (this, MouseEvent)
            "touch", 						// args (this, MouseEvent "mouseup"), drag executed on same location
            "attach", "detach" 				// args (),  raised during calls to attach()/detach()
        ],

        /** Constructor of PDSensor
         * @this {XML3D.tools.interaction.behaviors.PDSensor}
         *
         * @param {string} id the id of this sensor
         * @param {Array.<Object>} grps the groups this sensor should look for. All should have the same xml3d root element.
         * @param {XML3D.tools.util.EventDispatcher=} eventDispatcher the object used to register events
         */
        initialize: function(id, grps, eventDispatcher)
        {
        	this.callSuper();

            this.ID = id;
            this.xml3d = XML3D.tools.util.getXml3dRoot(grps[0]);
            this.pickGroups = grps;

            // event dispatcher
            if(eventDispatcher !== undefined)
                this._eventDispatcher = eventDispatcher;
            else
                this._eventDispatcher = new XML3D.tools.util.EventDispatcher();

            // -- pointing device's pose and hit information --
            this.pdPose = new window.XML3DRay(new window.XML3DVec3(0,0,0), new window.XML3DVec3(0,0,1));
            this.curHitElement = null;
            this.curHitPoint = null; // if hit occured, holds hit point, else is null

            // pointing stuff
            /** @private */
            this._sensorIsActive = false;
            /** @private */
            this._numObjsOver = 0; // number of objects the sensor is pointing towards
            /** @private */
            this._mouseDownPos = {x: -1, y: -1};

            // attach sensor
            /** @private */
            this._isAttached = false;
            this.attach();
        },

        // -- attaching/detaching of mouse events --
        /**
         * @this {XML3D.tools.interaction.behaviors.PDSensor}
         */
        attach: function()
        {
            if(!this._isAttached)
            {
                this._toggleAttached(true);
                this.notifyListeners("attach");
            }
        },

        /**
         * @this {XML3D.tools.interaction.behaviors.PDSensor}
         */
        detach: function()
        {
            if(this._isAttached)
            {
                this._toggleAttached(false);
                this.notifyListeners("detach");
            }
        },

        // -- Status access --
        /**
         * @this {XML3D.tools.interaction.behaviors.PDSensor}
         */
        isOver: function() { return (this._numObjsOver === 0); },
        /**
         * @this {XML3D.tools.interaction.behaviors.PDSensor}
         */
        isActive: function() { return this._sensorIsActive; },

        // ========================================================================
        // --- Private ---
        // ========================================================================

        /** Internal helper method to (de-)register event listeners
         *
         *  @this {XML3D.tools.interaction.behaviors.PDSensor}
         *  @private
         *  @param {boolean} doAttach
         */
        _toggleAttached: function(doAttach)
        {
            var registerFn = this._eventDispatcher.on.bind(this._eventDispatcher);
            if(!doAttach)
                registerFn = this._eventDispatcher.off.bind(this._eventDispatcher);

            for(var i = 0; i < this.pickGroups.length; i++)
            {
                registerFn(this.pickGroups[i], "mouseover", this.callback("_onMouseOver"));
                registerFn(this.pickGroups[i], "mouseout", this.callback("_onMouseOut"));
                registerFn(this.pickGroups[i], "mousedown", this.callback("_onMouseDown"));
            }

            registerFn(document.body, "mousemove", this.callback("_onMouseMove"));
            registerFn(document.body, "mouseup", this.callback("_onMouseUp"));
            registerFn(document.body, "mouseout", this.callback("_onMouseOutOfCanvas"));

            this._firstPickGroupTransformable = XML3D.tools.MotionFactory.createTransformable(this.pickGroups[0]);

            this._isAttached = !this._isAttached;
        },

        // -- Mouse Event Handlers --
        /** onMouseOver: called if pd is moved over the influenced groups
         *
         *  @this {XML3D.tools.interaction.behaviors.PDSensor}
         *  @private
         *  @param {MouseEvent} evt
         */
        _onMouseOver: function(evt)
        {
            this._numObjsOver++;
        },

        /** onMouseOut: called when pd is moved out of influenced groups
         *
         *  @this {XML3D.tools.interaction.behaviors.PDSensor}
         *  @private
         *
         *  @param {MouseEvent} evt
         */
        _onMouseOut: function(evt)
        {
            this._numObjsOver--;
        },

        /** onMouseOutOfCanvas: called when the mouse leaves
         *
         * @this {XML3D.tools.interaction.behaviors.PDSensor}
         * @private
         * @param evt
         */
    	_onMouseOutOfCanvas: function(evt)
    	{
    		if(this._sensorIsActive)
                if(evt.fromElement.tagName.toLowerCase() == "canvas")
    				this._onMouseUp(evt);
    	},

        /** onMouseDown: called when primary pd button is pressed over influenced groups
         *
         *  @this {XML3D.tools.interaction.behaviors.PDSensor}
         *  @private
         *  @param {MouseEvent} evt
         */
        _onMouseDown: function(evt)
        {
        	evt.stopPropagation();

            this._mouseDownPos = {x: evt.pageX, y: evt.pageY};

            this._pickAndUpdateStatus(evt.pageX, evt.pageY);

            this._sensorIsActive = true;

            this.notifyListeners("dragstart", this, evt);
        },

        /** onMouseMove: called whenever the pd is moved
         *  important: it is called when a move happens in xml3d tag,
         *  not just over influenced groups
         *
         *  @this {XML3D.tools.interaction.behaviors.PDSensor}
         *  @private
         *  @param {MouseEvent} evt
         */
        _onMouseMove: function(evt)
        {
            if(this._sensorIsActive)
            {
                evt.stopPropagation();
                this._pickAndUpdateStatus(evt.pageX, evt.pageY);
                this.notifyListeners("drag", this, evt);
            }
        },

        /** Called when mouseup on xml3d element.
         *
         *  @this {XML3D.tools.interaction.behaviors.PDSensor}
         *  @private
         *
         *  @param {MouseEvent} evt
         */
        _onMouseUp: function(evt)
        {
            this._pickAndUpdateStatus(evt.pageX, evt.pageY);

            if(this._sensorIsActive)
            {
                evt.stopPropagation();

                this._sensorIsActive = false;

                this.notifyListeners("dragend", this, evt);
            }

            // raise click if: mouse position is same for mousedown and mouseup event
            // and an element is currently hit
            if(this.curHitElement
            && this._mouseDownPos.x === evt.pageX
            && this._mouseDownPos.y === evt.pageY
            && evt.button == 0) // only take left-button clicks as touch
                this.notifyListeners("touch", this, evt);
        },

        /** perform a pick with the given page coordinates and update the internal state.
         *
         *  @this {XML3D.tools.interaction.behaviors.PDSensor}
         *  @private
         *  @param {number} pageX
         *  @param {number} pageY
         */
        _pickAndUpdateStatus: function(pageX, pageY)
        {
            /** This is a bugfix I just can't track down somehow. When moving an object with an overlay widget,
             *  e.g. the gizmos, the picking afterwards will report the same point on the whole geometry of a widget part.
             *  It only occurs when using the overlay and won't occur when just translating the elements manually.
             *  Some update must fail, because the next line solves the bug.
             */
            this._firstPickGroupTransformable.setPosition(this._firstPickGroupTransformable.getPosition());

            // update pd sensor status
            this.pdPose = this.xml3d.generateRay(pageX, pageY);

            this.curHitPoint = new window.XML3DVec3();
            this.curHitElement = this.xml3d.getElementByPoint(pageX, pageY, this.curHitPoint);

            if(!this.curHitElement)
                this.curHitPoint = null; // invalidate hit point
        }
    });
}());
