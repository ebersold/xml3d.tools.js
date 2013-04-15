(function(){

    "use strict";

    /** This class encapsulates the setup of mouse interaction for the use of camera controllers.
     *  It registers callbacks to the appropriate elements, converts mouse coordinates to be
     *  directly usable by a controller behavior and invokes methods in which users of this class
     *  can perform actions.
     *
     *  Usage:
     *  o instantiate or inherit from this class
     *  o override doActivate(), doDeactivate() and doAction() to handle the mouse events
     *  o call attach() at some point to enable the controller
     *
     *  @constructor
     */
    XMOT.MouseController = new XMOT.Class(XMOT.util.Attachable, {

        /**
         *  @this {XMOT.MouseController}
         */
        initialize: function(targetViewTransformable, options) {

            var options = options || {};

            this.target = targetViewTransformable;

            /** @private */
            this._targetXml3d = XMOT.util.getXml3dRoot(targetViewTransformable.object);

            /** @private */
            this._canvasWidth = this._targetXml3d.width || 800;

            /** @private */
            this._canvasHeight = this._targetXml3d.height || 600;

            /** @private */
            this._currentAction = this.NONE;

            /** @private */
            this._lastMousePos = {
                x : -1,
                y : -1
            };

            /** @private */
            if(options.eventDispatcher)
                this._eventDispatcher = options.eventDispatcher;
            else
                this._eventDispatcher = this._createDefaultEventDispatcher();
        },

        /**
         *  @this {XMOT.MouseController}
         */
        doActivate: function(action) {},

        /**
         *  @this {XMOT.MouseController}
         */
        doDeactivate: function(action) {},

        /**
         *  @this {XMOT.MouseController}
         */
        doAction: function(action) {},

        /**
         *  @this {XMOT.MouseController}
         */
        getScene: function() {
            return this._targetXml3d;
        },

        /**
         *  @this {XMOT.MouseController}
         *  @protected
         *  @override
         */
        onAttach: function() {
            this._toggleAttached(true);
        },

        /**
         *  @this {XMOT.MouseController}
         *  @protected
         *  @override
         */
        onDetach: function() {
            this._toggleAttached(false);
        },

        /**
         *  @this {XMOT.MouseController}
         *  @private
         */
        _toggleAttached: function(doAttach) {

            var regFn = this._eventDispatcher.on.bind(this._eventDispatcher);

            if(!doAttach) {
                regFn = this._eventDispatcher.off.bind(this._eventDispatcher);
            }

            regFn(this._targetXml3d, "mousedown", this._onXML3DMouseDown.bind(this));
            regFn(document.body, "mousemove", this._onBodyMouseMove.bind(this));
            regFn(document.body, "mouseup", this._onBodyMouseUp.bind(this));
        },

        // --- Callbacks ---

        /**
         *  @this {XMOT.MouseController}
         *  @private
         */
        _onXML3DMouseDown: function(evt) {

            this.doActivate(this._constructAction(evt));
            this._rememberPosition(evt);
        },

        /**
         *  @this {XMOT.MouseController}
         *  @private
         */
        _onBodyMouseMove: function(evt) {

            this.doAction(this._constructAction(evt));
            this._rememberPosition(evt);
        },

        /**
         *  @this {XMOT.MouseController}
         *  @private
         */
        _onBodyMouseUp: function(evt) {
            this.doDeactivate(this._constructAction(evt));
            this._rememberPosition(evt);
        },

        /**
         *  @this {XMOT.MouseController}
         *  @private
         */
        _rememberPosition: function(evt) {
            this._lastMousePos.x = evt.pageX;
            this._lastMousePos.y = evt.pageY;
        },

        // --- Utils ---

        /**
         *  @this {XMOT.MouseController}
         *  @private
         */
        _createDefaultEventDispatcher: function() {

            var disp = new XMOT.util.EventDispatcher();

            disp.registerCustomHandler("mousedown", function(evt){
                if(evt.button === XMOT.MOUSEBUTTON_LEFT
                || evt.button === XMOT.MOUSEBUTTON_RIGHT)
                    return true;

                return false;
            });

            return disp;
        },

        /**
         *  @this {XMOT.MouseController}
         *  @private
         */
        _constructAction: function(evt) {

            var deltaX = (evt.pageX - this._lastMousePos.x) / this._canvasWidth;
            var deltaY = (evt.pageY - this._lastMousePos.y) / this._canvasHeight;

            return {
                evt: evt,
                pos: {x: evt.pageX / this._canvasWidth, y: evt.pageY / this._canvasHeight},
                delta: {x: deltaX, y: deltaY}
            };
        }
    });
}());