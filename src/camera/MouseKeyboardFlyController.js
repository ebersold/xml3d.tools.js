(function(){

    "use strict";

    /** This controller brings together the mouse control and XMOT.FlyBehavior
     *  to provide fly mode navigation using the mouse and keyboard.
     *
     *  @constructor
     */
    XMOT.MouseKeyboardFlyController = new XMOT.Class(XMOT.util.Attachable, {

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @param {Element|Transformable} targetViewGroup
         *  @param {Object} options
         *
         *  options:
         *  o mouse: options to be passed to XMOT.MouseController
         *  o keyboard: options to be passed to XMOT.KeyboardController
         *  o disableMovement: if true, no movement will be possible
         *  o disableRotation: if true, no looking around is possible
         *
         *  For other options see FlyBehavior.
         *
         *  By default, the view can be rotated using the left mouse button,
         *  and movement can be done using W,A,S,D keys.
         */
        initialize: function(targetViewGroup, options) {

            this.callSuper();

            var options = options || {};
            options.mouse = options.mouse || {};
            options.keyboard = options.keyboard || {};

            this.target = XMOT.util.getOrCreateTransformable(targetViewGroup);

            this.behavior = new XMOT.FlyBehavior(this.target, options);

            if(options.mouse.eventDispatcher === undefined)
                options.mouse.eventDispatcher = this._createMouseEventDispatcher();

            this._mouseCtrl = new XMOT.MouseController(this.target, options.mouse);
            this._mouseCtrl.onDrag = this.callback("_onDrag");

            this._keyCtrl = new XMOT.KeyboardController(this.target, options.keyboard);
            this._keyCtrl.onKeyDown = this.callback("_onKeyDown");
            this._keyCtrl.onKeyUp = this.callback("_onKeyUp");

            this._continuousInputProcessing = false;

            /** map keyvalue => boolean */
            this._currentlyPressedKeys = {};

            this._disableMovement = false;
            if(options.disableMovement === true)
                this._disableMovement = true;
            this._disableRotation = false;
            if(options.disableRotation === true)
                this._disableRotation = true;
        },

        lookAt: function(point) {
            this.behavior.lookAt(point);
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         */
        getMoveSpeed: function() {
            return this.behavior.getMoveSpeed();
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         */
        setMoveSpeed: function(speed) {
            this.behavior.setMoveSpeed(speed);
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         */
        getRotationSpeed: function() {
            return this.behavior.getRotationSpeed();
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         */
        setRotationSpeed: function(speed) {
            this.behavior.setRotationSpeed(speed);
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @protected
         *  @override
         */
        onAttach: function() {
            if(!this._disableRotation)
                this._mouseCtrl.attach();
            if(!this._disableMovement)
                this._keyCtrl.attach();
            this._startInputProcessingLoop();
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @protected
         *  @override
         */
        onDetach: function() {
            this._mouseCtrl.detach();
            this._keyCtrl.detach();
            this._stopInputProcessingLoop();
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @private
         */
        _onDrag: function(action) {
            // we want mouse x-axis movement to map to y-axis rotation
            // so we flip the delta values
            this.behavior.rotateByAngles(-action.delta.y, -action.delta.x);
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @private
         */
        _onKeyDown: function(evt) {

            this._currentlyPressedKeys[evt.keyCode] = true;
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @private
         */
        _onKeyUp: function(evt) {

            this._currentlyPressedKeys[evt.keyCode] = false;
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @private
         */
        _startInputProcessingLoop: function() {
            this._continuousInputProcessing = true;
            this._inputProcessingLoop();
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @private
         */
        _stopInputProcessingLoop: function() {
            this._continuousInputProcessing = false;
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @private
         */
        _inputProcessingLoop: function() {

            if(!this._continuousInputProcessing) {
                return;
            }

            if(this._currentlyPressedKeys[XMOT.KEY_W] === true) {
                this.behavior.moveForward();
            }
            if(this._currentlyPressedKeys[XMOT.KEY_S] === true) {
                this.behavior.moveBackward();
            }
            if(this._currentlyPressedKeys[XMOT.KEY_A] === true) {
                this.behavior.stepLeft();
            }
            if(this._currentlyPressedKeys[XMOT.KEY_D] === true) {
                this.behavior.stepRight();
            }

            window.requestAnimationFrame(this.callback("_inputProcessingLoop"));
        },

        /**
         *  @this {XMOT.MouseKeyboardFlyController}
         *  @private
         */
        _createMouseEventDispatcher: function() {

            var disp = new XMOT.util.EventDispatcher();

            disp.registerCustomHandler("mousedown", function(evt){
                if(evt.button === XMOT.MOUSEBUTTON_LEFT)
                    return true;

                return false;
            });

            return disp;
        }
    });
}());