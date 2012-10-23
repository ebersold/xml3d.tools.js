/**
 * User: ebersold
 * Date: 10/23/12
 * Time: 12:34 PM
 */

var XMOT = XMOT || {};

(function() {

	/**
	 * A GamepadAttribute
	 * @param name {string}
	 * @param keycode {number}
	 * @param value {number|Boolean}
	 * @constructor
	 */
	function GamepadAttribute(name, keycode, value){
		this.name = name;
		this.keycode = keycode;
		this.value = value;
	}

	/**
	 * Gamepad
	 * @interface
	 * @constructor
	 */
	function Gamepad(status){
		this.timestamp = status.timestamp;
		this.id = status.id;
		this.index = status.index;
	}
	Gamepad.prototype.updateStatus = function(newStatus){ };
	Gamepad.prototype.createKeyCodeMap = function(newStatus){ };

	Gamepad.prototype.getId = function(){
		return this.id;
	};

	Gamepad.prototype.getIndex = function(){
		return this.index;
	};

	Gamepad.prototype.dispatchButtonEvent = function(down, keycode){
		this.dispatchEvent(down, keycode, undefined);
	};

	Gamepad.prototype.dispatchAxisEvent = function(data, keycode){
		this.dispatchEvent(true, keycode, data);
	};

	Gamepad.prototype.dispatchEvent = function(down, keycode, data){
		var event = document.createEvent("Event");
		var eventName = down ? "keydown" : "keyup";
		event.initEvent(eventName, true, true);
		event.keyCode = keycode;
		event.data = data;
		document.dispatchEvent(event);
	};



	/**
	 * XBox360Gamepad
	 * @extends Gamepad
	 * @constructor
	 */
	function XBox360Gamepad(status){
		XMOT.base(this, status);
		this.left_shoulder_button = status.buttons[4];
		this.right_shoulder_button = status.buttons[5];
		this.left_trigger = status.buttons[6]; //number not bool
		this.right_trigger = status.buttons[7];//number not bool
		this.start_button = status.buttons[9];
		this.back_button = status.buttons[8];
		this.x_button = status.buttons[2];
		this.y_button = status.buttons[3];
		this.a_button = status.buttons[0];
		this.b_button = status.buttons[1];
		this.left_stick_button = status.buttons[10];
		this.right_stick_button = status.buttons[11];
		this.dpad_left = status.buttons[14];
		this.dpad_right = status.buttons[15];
		this.dpad_up = status.buttons[12];
		this.dpad_down = status.buttons[13];
		this.left_stick_x_axis = status.axes[0];
		this.left_stick_y_axis = status.axes[1];
		this.right_stick_x_axis = status.axes[2];
		this.right_stick_y_axis = status.axes[3];
	}

	XMOT.inherit(XBox360Gamepad, Gamepad);

	XBox360Gamepad.prototype.updateStatus = function(newStatus){
		if(newStatus.timestamp == this.timestamp) return;
		this.checkLeftShoulderButton(newStatus.buttons[4]);
		this.checkRightShoulderButton(newStatus.buttons[5]);
		this.checkLeftTrigger(newStatus.buttons[6]);
		this.checkRightTrigger(newStatus.buttons[7]);
		this.checkStartButton(newStatus.buttons[9]);
		this.checkBackButton(newStatus.buttons[8]);
		this.checkXButton(newStatus.buttons[2]);
		this.checkYButton(newStatus.buttons[3]);
		this.checkAButton(newStatus.buttons[0]);
		this.checkBButton(newStatus.buttons[1]);
		this.checkLeftStickButton(newStatus.buttons[10]);
		this.checkRightStickButton(newStatus.buttons[11]);
		this.checkDPadLeft(newStatus.buttons[14]);
		this.checkDPadRight(newStatus.buttons[15]);
		this.checkDPadUp(newStatus.buttons[12]);
		this.checkDPadDown(newStatus.buttons[13]);
		this.checkLeftXAxis(newStatus.axes[0]);
		this.checkLeftYAxis(newStatus.axes[1]);
		this.checkRightXAxis(newStatus.axes[2]);
		this.checkRightYAxis(newStatus.axes[3]);
	};

	XBox360Gamepad.prototype.checkLeftShoulderButton = function(newValue){
		if(this.left_shoulder_button != newValue ){
			this.left_shoulder_button = newValue;
			this.dispatchButtonEvent(this.left_shoulder_button, 5000);
		}
	};

	XBox360Gamepad.prototype.checkRightShoulderButton = function(newValue){
		if(this.right_shoulder_button != newValue ){
			this.right_shoulder_button = newValue;
			this.dispatchButtonEvent(this.right_shoulder_button, 5001);
		}
	};

	XBox360Gamepad.prototype.checkLeftTrigger = function(newValue){
		if(this.left_trigger != newValue ){
			this.left_trigger = newValue;
			this.dispatchAxisEvent(this.left_trigger, 5002);
		}
	};

	XBox360Gamepad.prototype.checkRightTrigger = function(newValue){
		if(this.right_trigger != newValue ){
			this.right_trigger = newValue;
			this.dispatchAxisEvent(this.right_trigger, 5003);
		}
	};

	XBox360Gamepad.prototype.checkStartButton = function(newValue){
		if(this.start_button != newValue ){
			this.start_button = newValue;
			this.dispatchButtonEvent(this.start_button, 5004);
		}
	};

	XBox360Gamepad.prototype.checkBackButton = function(newValue){
		if(this.back_button != newValue ){
			this.back_button = newValue;
			this.dispatchButtonEvent(this.back_button, 5005);
		}
	};

	XBox360Gamepad.prototype.checkXButton = function(newValue){
		if(this.x_button != newValue ){
			this.x_button = newValue;
			this.dispatchButtonEvent(this.x_button, 5006);
		}
	};

	XBox360Gamepad.prototype.checkYButton = function(newValue){
		if(this.y_button != newValue ){
			this.y_button = newValue;
			this.dispatchButtonEvent(this.y_button, 5007);
		}
	};

	XBox360Gamepad.prototype.checkAButton = function(newValue){
		if(this.a_button != newValue ){
			this.a_button = newValue;
			this.dispatchButtonEvent(this.a_button, 5008);
		}
	};

	XBox360Gamepad.prototype.checkBButton = function(newValue){
		if(this.b_button != newValue ){
			this.b_button = newValue;
			this.dispatchButtonEvent(this.b_button, 5009);
		}
	};

	XBox360Gamepad.prototype.checkLeftStickButton = function(newValue){
		if(this.left_stick_button != newValue ){
			this.left_stick_button = newValue;
			this.dispatchButtonEvent(this.left_stick_button, 5010);
		}
	};

	XBox360Gamepad.prototype.checkRightStickButton = function(newValue){
		if(this.right_stick_button != newValue ){
			this.right_stick_button = newValue;
			this.dispatchButtonEvent(this.right_stick_button, 5011);
		}
	};

	XBox360Gamepad.prototype.checkDPadLeft = function(newValue){
		if(this.dpad_left != newValue ){
			this.dpad_left = newValue;
			this.dispatchButtonEvent(this.dpad_left, 5012);
		}
	};

	XBox360Gamepad.prototype.checkDPadRight = function(newValue){
		if(this.dpad_right != newValue ){
			this.dpad_right = newValue;
			this.dispatchButtonEvent(this.dpad_right, 5013);
		}
	};

	XBox360Gamepad.prototype.checkDPadUp = function(newValue){
		if(this.dpad_up != newValue ){
			this.dpad_up = newValue;
			this.dispatchButtonEvent(this.dpad_up, 5014);
		}
	};

	XBox360Gamepad.prototype.checkDPadDown = function(newValue){
		if(this.dpad_down != newValue ){
			this.dpad_down = newValue;
			this.dispatchButtonEvent(this.dpad_down, 5015);
		}
	};

	XBox360Gamepad.prototype.checkLeftXAxis = function(newValue){
		if(this.left_stick_x_axis != newValue ){
			this.left_stick_x_axis = newValue;
			this.dispatchAxisEvent(this.left_stick_x_axis, 5016);
		}
	};

	XBox360Gamepad.prototype.checkLeftYAxis = function(newValue){
		if(this.left_stick_y_axis != newValue ){
			this.left_stick_y_axis = newValue;
			this.dispatchAxisEvent(this.left_stick_y_axis, 5017);
		}
	};

	XBox360Gamepad.prototype.checkRightXAxis = function(newValue){
		if(this.right_stick_x_axis != newValue ){
			this.right_stick_x_axis = newValue;
			this.dispatchAxisEvent(this.right_stick_x_axis, 5018);
		}
	};

	XBox360Gamepad.prototype.checkRightYAxis = function(newValue){
		if(this.right_stick_y_axis != newValue ){
			this.right_stick_y_axis = newValue;
			this.dispatchAxisEvent(this.right_stick_y_axis, 5019);
		}
	};


	/**
	 * GamepadConnector
	 * TODO: better name? GamepadEventGenerator?
	 * TODO: make the events keycodes somehow configurable?
	 * This whole module will only work with Chrome 21 (or higher)
	 * @constructor
	 */
	function GamepadConnector() {
		if( !this.gamepadApiAvailable() ){
			console.log("No Gamepad API available");
			return;
		}
		this.pollingInProgress = false;
		this.pads = [];
		this.startPolling();
	}

	GamepadConnector.prototype.gamepadApiAvailable = function(){
		//TODO: user Modernizr to check for gamepad
		return !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;
	};

	GamepadConnector.prototype.startPolling = function(){
		if(!this.pollingInProgress){
			this.pollingInProgress = true;
			this.onePoll();
		}
	};

	GamepadConnector.prototype.onePoll = function(){
		var newStatusData = this.getNewStatusDataFromAPI();
		if( !newStatusData ){
			console.log("Cannot retrieve gamepad data");
			return;
		}
		this.processNewStatusData(newStatusData);
		this.nextPoll();
	};

	GamepadConnector.prototype.getNewStatusDataFromAPI = function(){
		return (navigator.webkitGetGamepads && navigator.webkitGetGamepads()) || navigator.webkitGamepads;
	};

	GamepadConnector.prototype.processNewStatusData = function(newStatusData){
		this.handleNewlyConnectedGamepads(newStatusData);
		this.handleDisconnectedGamepads(newStatusData);
		this.updateGamepads(newStatusData);
	};

	//TODO: maybe the connection / disconnection handling can be made more easily, however i have to test this using more than one controller!
	// do we need to check for the index that way? why not keeping the index as it is, all the time?
	// can we detect a newly connected device on an before used index?
	GamepadConnector.prototype.handleNewlyConnectedGamepads = function(newStatusData){
		for(var i=0; i<newStatusData.length; i++){
			var index = newStatusData[i] ? newStatusData[i].index : undefined;
			if(index != undefined && !this.pads[index]){
				this.pads[index] = this.createNewGamepad(newStatusData[i]);
			}
		}
	};

	GamepadConnector.prototype.createNewGamepad = function(newGamepadData){
		var id = newGamepadData.id;
		if(id.indexOf("Xbox 360 Controller") != -1){
			return new XBox360Gamepad(newGamepadData);
		}
		console.log("Unknown Controller id: " + id);
		return undefined;
	};

	GamepadConnector.prototype.handleDisconnectedGamepads = function(newStatusData){
		for(var i=0; i<this.pads.length; i++){
			var index = this.pads[i].getIndex();
			if( !newStatusData[index] )
				this.pads[index] = undefined;
		}
	};

	GamepadConnector.prototype.updateGamepads = function(newStatusData){
		for(var i=0; i<this.pads.length; i++){
			var index = this.pads[i].getIndex();
			this.pads[i].updateStatus(newStatusData[index]);
		}
	};

	GamepadConnector.prototype.nextPoll = function(){
		if(!this.pollingInProgress) return;
		if(window.requestAnimFrame)
			window.requestAnimFrame(this.onePoll.bind(this), undefined);
		else if(window.requestAnimationFrame)
			window.requestAnimationFrame(this.onePoll.bind(this), undefined);
	};

	GamepadConnector.prototype.stopPolling = function(){
		this.pollingInProgress = false;
	};

	GamepadConnector.prototype.getKeycodeMap = function(){
		return this.createKeyCodeMap();
	};

	GamepadConnector.prototype.createKeyCodeMap = function(){
		var keycodeMap = [];
		for(var i=0; i<this.pads.length; i++){
			var index = this.pads[i].getIndex();
			keycodeMap[index] = this.pads[i].createKeyCodeMap();
		}
		return keycodeMap;
	};

	//export
	XMOT.GamepadConnector = GamepadConnector;
}());
