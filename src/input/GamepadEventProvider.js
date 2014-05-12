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
/**
 * User: ebersold
 * Date: 10/23/12
 * Time: 12:34 PM
 */

(function () {

    "use strict";

	/**
	 * A GamepadAttribute
	 * @param name {string}
	 * @param value {number}
	 * @constructor
	 */
	function GamepadAttribute(name, value) {
		this.name = name;
		this.value = value;
	}

	/**
	 * Gamepad
	 * @constructor
	 */
	var Gamepad = new XML3D.tools.Class({

        initialize: function(status) {
            this.timestamp = status.timestamp;
            this.id = status.id;
            this.index = status.index;
        },

        /**
         * @abstract
         * @param newStatus
         */
        updateStatus: function (newStatus) { },

        getId: function () {
            return this.id;
        },

        getIndex: function () {
            return this.index;
        },

        dispatchButtonEvent: function (attribute) {
            var eventName = attribute.value ? "GamepadButtonDown" : "GamepadButtonUp";
            var detail = {
                button: attribute.name,
                value: attribute.value,
                padID: this.index
            };
            this.dispatchCustomEvent(eventName, detail);
        },

        dispatchAxisEvent: function (attribute) {
            var eventName = "GamepadAxis";
            var detail = {
                axis: attribute.name,
                value: attribute.value,
                padID: this.index
            };
            this.dispatchCustomEvent(eventName, detail);
        },

        dispatchCustomEvent: function (eventName, detail) {
            var options = {
                detail: detail,
                bubbles: true,
                cancelable: false
            };
            var event = new window.CustomEvent(eventName, options);
            document.dispatchEvent(event);
        }
    });

    /**
     * XBox360Gamepad
     * @extends Gamepad
     * @constructor
     */
    var XBox360Gamepad = new XML3D.tools.Class(Gamepad, {

        initialize: function(status) {
            this.callSuper(status);

            this.buttons = [];
            this.axes = [];
            this.initButtons(status);
            this.initAxes(status);
        },

        initButtons: function (status) {
            this.buttons.push(new GamepadAttribute("A", status.buttons[0]));
            this.buttons.push(new GamepadAttribute("B", status.buttons[1]));
            this.buttons.push(new GamepadAttribute("X", status.buttons[3]));
            this.buttons.push(new GamepadAttribute("Y", status.buttons[2]));
            this.buttons.push(new GamepadAttribute("LB", status.buttons[4]));
            this.buttons.push(new GamepadAttribute("RB", status.buttons[5]));
            this.buttons.push(new GamepadAttribute("LT", status.buttons[6]));
            this.buttons.push(new GamepadAttribute("RT", status.buttons[7]));
            this.buttons.push(new GamepadAttribute("Back", status.buttons[8]));
            this.buttons.push(new GamepadAttribute("Start", status.buttons[9]));
            this.buttons.push(new GamepadAttribute("LeftStickClick", status.buttons[10]));
            this.buttons.push(new GamepadAttribute("RightStickClick", status.buttons[11]));
            this.buttons.push(new GamepadAttribute("Up", status.buttons[12]));
            this.buttons.push(new GamepadAttribute("Down", status.buttons[13]));
            this.buttons.push(new GamepadAttribute("Left", status.buttons[14]));
            this.buttons.push(new GamepadAttribute("Right", status.buttons[15]));
        },

        initAxes: function (status) {
            this.axisEpsilon = 0.001;
            this.axes.push(new GamepadAttribute("LeftStickX", status.axes[0]));
            this.axes.push(new GamepadAttribute("LeftStickY", status.axes[1]));
            this.axes.push(new GamepadAttribute("RightStickX", status.axes[2]));
            this.axes.push(new GamepadAttribute("RightStickY", status.axes[3]));
        },

        updateStatus: function (newStatus) {
            if (newStatus.timestamp === this.timestamp ||
                newStatus.index !== this.index ||
                newStatus.id !== this.id) {
                return;
            }
            this.updateButtons(newStatus);
            this.updateAxes(newStatus);
        },

        updateButtons: function (newStatus) {
            for(var i=0; i<this.buttons.length; i++){
                if(this.buttons[i].value !== newStatus.buttons[i]){
                    this.buttons[i].value = newStatus.buttons[i];
                    this.dispatchButtonEvent(this.buttons[i]);
                }
            }
        },

        updateAxes: function (newStatus) {
            for(var i=0; i<this.axes.length; i++){
                if(newStatus[i] !== this.axes[i].value && Math.abs(this.axes[i].value - newStatus.axes[i]) > this.axisEpsilon){
                    this.axes[i].value = newStatus.axes[i];
                    this.dispatchAxisEvent(this.axes[i]);
                }
            }
        }
    });

    var UnknownControllerIdError = new XML3D.tools.Class({

        initialize: function(controllerId) {
            this.controllerId = controllerId;
        }
    });

	/**
	 * GamepadConnector - Singleton
	 * This whole module will only work with Chrome 21 (or higher)
	 * @private
	 * @constructor
	 */
    XML3D.tools.GamepadEventProvider = new XML3D.tools.Singleton({

        enable: function() {
            if (!this._gamepadApiAvailable()) {
                console.log("No Gamepad API available");
                return;
            }

            this.pollingInProgress = false;
            this.pads = [];
            this._startPolling();
        },

        disable: function() {
            this.pollingInProgress = false;
        },

        _startPolling: function() {
            if (!this.pollingInProgress) {
                this.pollingInProgress = true;
                this._onePoll();
            }
        },

        _gamepadApiAvailable: function() {
            return !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;
        },

        _onePoll: function() {
            var newStatusData = this._getNewStatusDataFromAPI();
            if (!newStatusData) {
                console.log("Cannot retrieve gamepad data");
                return;
            }
            this._processNewStatusData(newStatusData);
            this._nextPoll();
        },

        _getNewStatusDataFromAPI: function() {
            return (navigator.webkitGetGamepads && navigator.webkitGetGamepads()) || navigator.webkitGamepads;
        },

        _processNewStatusData: function(newStatusData) {
            this._handleNewlyConnectedGamepads(newStatusData);
            this._handleDisconnectedGamepads(newStatusData);
            this._updateGamepads(newStatusData);
        },

        _handleNewlyConnectedGamepads: function (newStatusData) {
            for (var i=0; i<newStatusData.length; i++) {
                if(!newStatusData[i]) {
                    continue;
                }
                this._handleNewlyConnectedGamepad(newStatusData[i]);
            }
        },

        _handleNewlyConnectedGamepad: function(statusData) {
            var index = statusData.index;
            if(index === undefined || this.pads[index] !== undefined){
                return;
            }

            try {
                this.pads[index] = this._createNewGamepad(statusData);
            } catch(error) {
                if(!error.controllerId) {
                    throw error;
                }
                console.log("Unknown controller id: " + error.controllerId);
                this.pads[index] = null;
            }
        },

        _createNewGamepad: function (newGamepadData) {
            var id = newGamepadData.id;
            if(id.indexOf("Xbox 360 Controller") !== -1){
                return new XBox360Gamepad(newGamepadData);
            }
            throw new UnknownControllerIdError(id);
        },

        _handleDisconnectedGamepads: function (newStatusData) {
            for(var i=0; i<this.pads.length; i++){
                if(!this.pads[i]){
                    continue;
                }
                var index = this.pads[i].getIndex();
                if( !newStatusData[index] ){
                    this.pads[index] = undefined;
                }
            }
        },

        _updateGamepads: function (newStatusData) {
            for(var i=0; i<this.pads.length; i++){
                if(!this.pads[i]){
                    continue;
                }
                var index = this.pads[i].getIndex();
                this.pads[i].updateStatus(newStatusData[index]);
            }
        },

        _nextPoll: function () {
            if(!this.pollingInProgress){
                return;
            }
            if(window.requestAnimFrame){
                window.requestAnimFrame(this._onePoll.bind(this), undefined);
            }
            else if(window.requestAnimationFrame){
                window.requestAnimationFrame(this._onePoll.bind(this), undefined);
            }
        }
    });
}());
