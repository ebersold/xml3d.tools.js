(function(){
	/**
	 * A CameraController
	 * In order to use this gamepad functiponality of this class do as follows:
	 * 1. Use Chrome.
	 * 2. Get A XBox360 Controller.
	 * 3. Activate the gamepad api of chrome -> about:flags
	 * 4. Add the gamepad.js to your application: http://www.gamepadjs.com/
	 * 5. Have Fun :-)
	 * @constructor
	 * @param {string} camera_id name of the group of the camera
	 * @param {Array.<number>} initialRotation rotation to rotate the camera in a manner, that "forward" is a movement along -z
	 * @param {string} mouseButton "left", "right", "middle"
	 * @param {boolean} inspectMode determine wether to use inspectMode or not
	 */
	function CameraController(camera_id, initialRotation, mouseButton, inspectMode){
		/**
		 * @private
		 * @type {Object}
		 */
		this.currentlyPressedKeys = {};
		/**
		 * Points of Interest
		 * @private
		 * @type {Array.<{pos:Array.<number>, ori:Array.<number>}>}
		 */
		this.poi = [];
		/**
		 * Time to move to the next poi in milliseconds
		 * @private
		 * @type {number}
		 */
		this.poiMoveToTime = 3000; //ms
		/**
		 * last visited poi
		 * @private
		 * @type {number}
		 */
		this.currentPoi = 0;
		/**
		 * needed to check if the used poi button is released before triggering the next movement
		 * @private
		 * @type {boolean}
		 */
		this.allowPoi = true; 
		/**
		 * Old mouse position
		 * @private
		 * @type {{x: number, y: number}}
		 */
		this.oldMousePosition = {x:0,y:0};
		/**
		 * flag: mouse button currently down
		 * @private
		 * @type {boolean}
		 */
		this.mouseButtonIsDown = false;
		/**
		 * factor to slow or speed movement
		 * @private
		 * @type {number}
		 */
		this.slowthis = 1;
		/**
		 * Sensivity for movement of gamepad
		 * @private
		 * @type {number}
		 */
		this.moveSensivityPad = 0.4 * this.slowthis;
		/**
		 * Sensivity for rotation of gamepad
		 * @private
		 * @type {number}
		 */
		this.rotationSensivityPad = 0.0025 * this.slowthis;
		/**
		 * Sensivity for movement of keyboard
		 * @private
		 * @type {number}
		 */
		this.moveSensivityKeyboard = 0.75 * this.slowthis;
		/**
		 * Sensivity for rotation of mouse and keyboard
		 * @private
		 * @type {number}
		 */
		this.rotationSensivityMouse = 0.005 * this.slowthis;
		/**
		 * Angle, that we currently look up or down
		 * @private
		 * @type {number}
		 */
		this.angleUp = 0;
		/**
		 * Constraint
		 * @private
		 * @type {ConstraintCollection}
		 */
		this.constraint = new XMOT.ConstraintCollection();
	
		var factory = new XMOT.ClientMotionFactory();
		var cam = document.getElementById(camera_id);
		/**
		 * The Moveable
		 * @private
		 * @type {Moveable}
		 */
		this.moveable = factory.createMoveable(cam, this.constraint);
		this.moveable.rotate(initialRotation);
		/**
		 * starting point of the moveable, used to reset position and orientation
		 * @private
		 * @type {{position: Array.<number>, orientation: Array.<number>}}
		 */
		this.startingPoint = {position:this.moveable.getPosition(), orientation:this.moveable.getOrientation()};

		/**
		 * Mousebutton on which the camera turns:
		 * 0 = left, 1 = middle, 2 = right;
		 */
		this.mouseButton = 0;
		this.setMouseButtonValue(mouseButton);

		this.pointToRotateAround = [0,0,0];

		/**
		 * camera mode freeflight
		 * @type {Boolean}
		 */
		this.cameraModeInspect = inspectMode;
		this.cameraModeFreeflight = !this.cameraModeInspect;

		this.initEvents();

		//finally, register in the animation loop
		if( !XMOT.registeredCameraController){
			XMOT.registeredCameraController = this;
			XMOT.animate();
		}
		else
			throw "Only one CameraController allowed.";
	};
	var cc = CameraController.prototype;

	cc.activateInspectCameraMode = function(){
		this.cameraModeInspect = true;
		this.cameraModeFreeflight = !this.cameraModeInspect;
	};

	cc.activateFreeFlightCameraMode = function(){
		this.cameraModeFreeflight = true;
		this.cameraModeInspect = !this.cameraModeFreeflight;
	};

	/**
	 * Sets the used mouseButton for camera motion
	 */
	cc.setMouseButtonValue = function(button){
		if(button == "left") this.mouseButton = 0;
		else if(button == "middle") this.mouseButton = 1;
		else if(button == "right") this.mouseButton = 2;
	};

	/**
	 * Get current position in local space
	 * @public
	 * @return {Array.<number>} 3D vector
	 */
	cc.getPosition = function(){
		return this.moveable.getPosition();
	};

	/**
	 * Get current orientation in local space
	 * @public
	 * @return {Array.<number>} quaternion
	 */
	cc.getOrientation = function(){
		return this.moveable.getOrientation();
	};

	// public:
	/**
	 * Add a Point of Interest
	 * @public
	 * @param {Array.<number>} position
	 * @param {Array.<number>} orientation
	 * @return {CameraController} this
	 */
	cc.addPointOfInterest = function(position, orientation){
		this.poi.push({pos:position, ori:orientation});
		return this;
	};

	/**
	 * Remove the latest added Point of Interest
	 * @public
	 * @return {CameraController} this
	 */
	cc.removePointOfInterest = function(){
		this.poi.pop();
		return this;
	};

	/**
	 * Add a Constraint
	 * @public
	 * @param {Constraint} constraint
	 */
	cc.addConstraint = function(constraint){
		this.constraint.addConstraint(constraint);
	};

	/**
	 * Update movement
	 * @public
	 */
	cc.update = function(){
		this.updateController();
		this.updateKeyMovement();
	};

	// private:
	/**
	 * updates the controller - gets called autmatically
	 * To use the Controller the gamepad.js is needed as well.
	 * @private
	 */
	cc.updateController = function() {
		if(!window.Gamepad)return;
		var pads = Gamepad.getStates();
		for ( var i = 0; i < pads.length; ++i) {
			var pad = pads[i];
			if (pad) {
				if(pad.rightShoulder1){ //lower shoulder buttons
					this.nextPoi();
				}
				if(pad.leftShoulder1){
					this.beforePoi();
				}
				if(pad.rightShoulder0){ //upper shoulder buttons
					this.moveUpAndDown(-this.moveSensivityPad);
				}
				if(pad.leftShoulder0){
					this.moveUpAndDown(this.moveSensivityPad);
				}
				if(pad.start){
					this.reset();
				}
				//back and for
				var y = (pad.leftStickY < -0.15 || pad.leftStickY > 0.15) ? pad.leftStickY : 0;
				if(y != 0) this.moveBackAndForward(y*this.moveSensivityPad);
				//left and right - transalte
				var x = (pad.leftStickX < -0.15 || pad.leftStickX > 0.15) ? pad.leftStickX : 0;
				if(x != 0) this.moveLeftAndRight(x*this.moveSensivityPad);
				//up and down
				var rotUpDown = (pad.rightStickY < -0.15 || pad.rightStickY > 0.15) ? pad.rightStickY : 0;
				if(rotUpDown != 0) this.rotateUpAndDown(-this.rotationSensivityPad*rotUpDown);
				//left and right - rotate
				var rotLeftRight = (pad.rightStickX < -0.15 || pad.rightStickX > 0.15) ? pad.rightStickX : 0;
				if(rotLeftRight != 0) this.rotateUpAndDown(-this.rotationSensivityPad*rotLeftRight);
			}
		}
	};

	// ---------- functions to handle movement ----------
	/**
	 * Move camera back and forward
	 * @private
	 * @param {number} l length of the movement
	 */
	cc.moveBackAndForward = function(l){
		var vecX = [0, 0, 1];
		var result = vec3.create();
		quat4.multiplyVec3(this.moveable.getOrientation(),vecX, result);
		this.moveable.translate(vec3.scale(vec3.normalize(result), l));
	};

	/**
	 * Move camera left and right (strafe)
	 * @private
	 * @param {number} l length of the movement
	 */
	cc.moveLeftAndRight = function(l){
		var vecY = [1, 0, 0]; // global x is local z of the camera
		var result = vec3.create();
		quat4.multiplyVec3(this.moveable.getOrientation(),vecY, result);
		this.moveable.translate(vec3.scale(vec3.normalize(result), l));
	};

	/**
	 * Move camera Up and Down
	 * @private
	 * @param {number} l length of the movement
	 */
	cc.moveUpAndDown = function(l){
		var vecY = [0, 1, 0];
		var result = vec3.create();
		quat4.multiplyVec3(this.moveable.getOrientation(),vecY, result);
		this.moveable.translate(vec3.scale(vec3.normalize(result), l));
	};

	/**
	 * Move to the next Point of Interest
	 * @private
	 */
	cc.nextPoi = function(){
		if(this.poi.length == 0 || !this.allowPoi || this.moveable.movementInProgress()) return;
		this.currentPoi = this.currentPoi == this.poi.length-1 ? 0 : this.currentPoi+1;
		var movetopoi = this.poi[this.currentPoi];
		this.allowPoi = false;
		var that = this;
		this.moveable.moveTo(movetopoi.pos, movetopoi.ori, this.poiMoveToTime, {queueing: false, callback: function(){that.moveToCallback();}});
	};

	/**
	 * Move to the next Point of Interest
	 * @private
	 */
	cc.beforePoi = function(){
		if(this.poi.length == 0 || !this.allowPoi || this.moveable.movementInProgress()) return;
		this.currentPoi = this.currentPoi == 0 ? this.poi.length-1 : this.currentPoi-1;
		var movetopoi = this.poi[this.currentPoi];
		this.allowPoi = false;
		var that = this;
		this.moveable.moveTo(movetopoi.pos, movetopoi.ori, this.poiMoveToTime, {queueing: false, callback: function(){that.moveToCallback();}});
	};

	/**
	 * Stops the current movement to a poi
	 * @public
	 */
	cc.stopMovementToPoi = function(){
		this.moveable.stop();
		this.allowPoi = true;
	};

	/**
	 * rotate up/down before any other movement, this prevends from rolling
	 * @private
	 */
	cc.preventRolling = function(){
		this.moveable.rotate( XMOT.axisAngleToQuaternion( [1,0,0], -this.angleUp) );
		this.angleUp = 0;
	};

	/**
	 * Rotates the camera up and down by an given angle
	 * @private 
	 * @param {number} angle
	 */
	cc.rotateCameraUpAndDown = function(angle){
		this.angleUp += angle*Math.PI;
		this.moveable.rotate( XMOT.axisAngleToQuaternion( [1,0,0], angle*Math.PI) );
	};

	/**
	 * Rotates the camera left and right by an given angle
	 * @private 
	 * @param {number} angle
	 */
	cc.rotateCameraLeftAndRight = function(angle){
		//rotate up/down befor rotating sidewards, this prevends from rolling
		this.moveable.rotate( XMOT.axisAngleToQuaternion( [1,0,0], -this.angleUp) );
		this.moveable.rotate( XMOT.axisAngleToQuaternion( [0,1,0], angle*Math.PI) );
		//and rotate up/down again
		this.moveable.rotate( XMOT.axisAngleToQuaternion( [1,0,0], this.angleUp) );
	};

	cc.rotateCameraAroundPointLeftAndRight = function(angle){
		var distanceToLookAt = this.distanceToLookAtPoint(this.pointToRotateAround);
		//var cameraDirection = this.cameraDirectionAsXML3D();
		//var translationToOrigin = this.moveable.transform.translation.negate();
		this.moveable.setPosition([0,0,0]);
		this.rotateCameraLeftAndRight(angle);
		var newDirection = this.cameraDirectionAsXML3D();
		var tmp = newDirection.scale(distanceToLookAt).negate();
		this.moveable.setPosition([tmp.x, tmp.y, tmp.z]);
		this.moveable.translate(this.pointToRotateAround);
	};

	cc.rotateCameraAroundPointUpAndDown = function(angle){
		var distanceToLookAt = this.distanceToLookAtPoint(this.pointToRotateAround);
		//var cameraDirection = this.cameraDirectionAsXML3D();
		//var translationToOrigin = this.moveable.transform.translation.negate();
		this.moveable.setPosition([0,0,0]);
		this.rotateCameraUpAndDown(angle);
		var newDirection = this.cameraDirectionAsXML3D();
		var tmp = newDirection.scale(distanceToLookAt).negate();
		this.moveable.setPosition([tmp.x, tmp.y, tmp.z]);
		this.moveable.translate(this.pointToRotateAround);
	};

	cc.distanceToLookAtPoint = function(point){
		var camPosition = this.moveable.transform.translation;
		var p = new XML3DVec3(point[0],point[1],point[2]);
		return camPosition.subtract(p).length();
	};

	cc.cameraDirectionAsXML3D = function(){
		var camOrientation = this.moveable.transform.rotation;
		// as per spec: [getOrientation] is the orientation multiplied with the default direction (0, 0, -1)
		return camOrientation.rotateVec3(new XML3DVec3(0,0,-1)).normalize();
	};

	/**
	 * Resets the camera to the starting Position
	 * @private 
	 */
	cc.reset = function(){
		this.moveable.setPosition(this.startingPoint.position);
		this.moveable.setOrientation(this.startingPoint.orientation);
		this.angleUp = 0;
	};

	/**
	 * Callback of the movement to a PoI
	 * Needed to prevent movement while we move to a PoI
	 * @private 
	 */
	cc.moveToCallback = function(){
		this.allowPoi = true;
	};
	
	// ---------- event handler ----------

	/**
	 * Init Events
	 * @private
	 */
	cc.initEvents = function(){
		//registered on window, since registring on div did not work, events never triggered
		var that = this;
		window.addEventListener("keydown", function(e){that.keypressEventHandler(e);}, false);
		window.addEventListener("keyup", function(e){that.keyUpEventHandler(e);}, false);
		window.addEventListener("mousemove", function(e){that.mouseMovementHandler(e);}, false);
		window.addEventListener("mousedown", function(e){that.mouseDownHandler(e);}, false);
		window.addEventListener("mouseup", function(e){that.mouseUpHandler(e);}, false);
	};

	/**
	 * Handles key events
	 * @private
	 * @param {Event} e event
	 */
	cc.keypressEventHandler = function(e){
		if(!this.allowPoi) return;
		e = window.event || e;
		var kc = e.keyCode;
		if(! this.currentlyPressedKeys[kc])
		{
			var flag = this.moveWithKey(kc);
			if(flag){
				this.currentlyPressedKeys[kc] = true;
			}
			switch(kc){
				case 69 : this.nextPoi(); break; // q
				case 81 : this.beforePoi(); break; // e
				case 82 : this.reset(); break; //r
				default : flag = false; break;
			}
			if(flag) this.stopDefaultEventAction(e);
		}
	};

	/**
	 * Removes key from the list of currently pressed keys
	 * @param {Event} e
	 */
	cc.keyUpEventHandler = function(e){
	    if(!this.allowPoi) return;
	    e = window.event || e;
	    delete this.currentlyPressedKeys[e.keyCode];
	};

	/**
	 * handle single key
	 * @private
	 * @param {number} keyCode
	 * @return {boolean}
	 */
	cc.moveWithKey = function(keyCode){
	    switch(keyCode){
			case 83 : this.moveBackAndForward(this.moveSensivityKeyboard); break; // s
			case 87 : this.moveBackAndForward(-this.moveSensivityKeyboard); break; // w
			case 65 : this.moveLeftAndRight(-this.moveSensivityKeyboard); break; // a
			case 68 : this.moveLeftAndRight(this.moveSensivityKeyboard); break; // d
			case 33 : this.moveUpAndDown(this.moveSensivityKeyboard); break; //page up
			case 34 : this.moveUpAndDown(-this.moveSensivityKeyboard); break; //page down
			//TODO: check for rotateAroundPoint oder normal rotate somewhere
			case 38 : this.rotateUpAndDown(this.rotationSensivityMouse); break; // up Arrow
			case 40 : this.rotateUpAndDown(-this.rotationSensivityMouse); break; // down Arrow
			case 37 : this.rotateLeftAndRight(this.rotationSensivityMouse); break; // left Arrow
			case 39 : this.rotateLeftAndRight(-this.rotationSensivityMouse); break; // right Arrow
	        default : return false; break;
	    }
	    return true;
	};

	cc.rotateLeftAndRight = function(angle)
	{
		if(this.cameraModeInspect){
			this.rotateCameraAroundPointLeftAndRight(angle);
		}else if(this.cameraModeFreeflight){
			this.rotateCameraLeftAndRight(angle);
		}
	};

	cc.rotateUpAndDown = function(angle)
	{
		if(this.cameraModeInspect){
			this.rotateCameraAroundPointUpAndDown(angle);
		}else if(this.cameraModeFreeflight){
			this.rotateCameraUpAndDown(angle);
		}
	};

	/**
	 * update movement of currently pressed keys
	 * @private
	 */
	cc.updateKeyMovement = function(){
	    for(var kc in this.currentlyPressedKeys){
	        this.moveWithKey(kc*1); //*1 -> to make its a number now
	    }
	};

	/**
	 * Handles mousemovement events
	 * @private
	 * @param {Event} e event
	 */
	cc.mouseMovementHandler = function(e){
		if(!this.mouseButtonIsDown || !this.allowPoi) return;
		var currentX = e.pageX;
		var currentY = e.pageY;
		var x = currentX - this.oldMousePosition.x;
		var y = currentY - this.oldMousePosition.y;
		this.oldMousePosition.x = currentX;
		this.oldMousePosition.y = currentY;
		if(x != 0)
			this.rotateLeftAndRight(-this.rotationSensivityMouse*x);
		if(y != 0)
			this.rotateUpAndDown(-this.rotationSensivityMouse*y);
	};

	/**
	 * Handles mousebutton up event
	 * @private
	 * @param {Event} e event
	 */
	cc.mouseUpHandler = function(e){
		if(e.button == this.mouseButton){
			this.stopDefaultEventAction(e);
			this.mouseButtonIsDown = false;
		}
	};

	/**
	 * Handles mousebutton down events
	 * @private
	 * @param {Event} e event
	 */
	cc.mouseDownHandler = function(e){
		if(e.button == this.mouseButton){
			this.stopDefaultEventAction(e);
			this.mouseButtonIsDown = true;
			this.oldMousePosition.x = e.pageX;
			this.oldMousePosition.y = e.pageY;
		}
	};

	/**
	 * Stops HTML Default action of events
	 * Note: in some Browsers the context menu still apears, but there is a workaround:
	 * <body ... oncontextmenu="return false;">
	 * @param {Object} e event
	 */
	cc.stopDefaultEventAction = function(e){
		if (e && e.preventDefault) {
			e.preventDefault();
		} else if (window.event && window.event.returnValue){
			window.eventReturnValue = false;
		}
	};

	XMOT.CameraController = CameraController;
}());