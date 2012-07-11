(function() {

    /**
     * A Moveable implementation.
     * @constructor
     * @implements{Moveable}
     */
    function ClientMoveable(object, transform, constraint) {
    	/**
		 * Object which shall be moveable
		 * @protected
		 * @type {Object}
		 */
		this.object = object;
		/**
		 * Transform coords of the object and the Moveable
		 * @protected
		 * @type {Object}
		 */
		this.transform = transform;
		/**
		 * Constraint of the movement
		 * @protected
		 * @type {Constraint}
		 */
		this.constraint = constraint;
		/**
		 * Queue of movements
		 * @private
		 * @type {Array.<{tween: tween, startPosition:Array.<number>, endPosition:Array.<number>, startOrientation:Array.<number>, endOrientation:Array.<number>}>}
		 */
		this.motionQueue = new Array();
    };

    var p = ClientMoveable.prototype;

    /** @inheritDoc */
    p.setPosition = function(position){
		if(this.constraint.constrainTranslation(position, this))
			this.transform.translation.set(position[0],position[1],position[2]);
		return this;
    };

    /** @inheritDoc */
	p.setOrientation = function(orientation){
		if(this.constraint.constrainRotation(orientation, this)){
			this.transform.rotation.setQuaternion( new XML3DVec3(orientation[0],orientation[1],orientation[2]), orientation[3] );
		}
		return this;
    };

    /** @inheritDoc */
    p.setScale = function(scale){
    	this.transform.scale.set(new XML3DVec3(scale[0], scale[1], scale[2]));
    };

    /** @inheritDoc */
    p.getPosition = function(){
    	return [this.transform.translation.x, this.transform.translation.y, this.transform.translation.z];
    };

    /** @inheritDoc */
    p.getOrientation = function(){
    	var axis = this.transform.rotation.axis;
    	var angle = this.transform.rotation.angle;
    	return XMOT.axisAngleToQuaternion([axis.x, axis.y, axis.z], angle);
    };

    /** @inheritDoc */
    p.getScale = function(){
    	return this.transform.scale;
    };

    /** @inheritDoc */
    p.translate = function(translation){
    	var currentPos = this.getPosition();
    	return this.setPosition([currentPos[0]+translation[0], currentPos[1]+translation[1], currentPos[2]+translation[2]]);
    };

    /** @inheritDoc */
    p.rotate = function(orientation){
		var modifier = new XML3DRotation();
		modifier.setQuaternion( new XML3DVec3(orientation[0],orientation[1],orientation[2]), orientation[3] );
		var destination = this.transform.rotation.multiply( modifier );
		if(this.constraint.constrainRotation(orientation, this))
			this.transform.rotation.set(destination);
		return this;
    };

    /** @inheritDoc */
    p.scale = function(factor){
    	this.transform.scale.multiply(new XML3DVec3(factor[0], factor[1], factor[2]));
    	return this;
    };

    /** @inheritDoc */
    p.moveTo = function(position, orientation, time, opt){
    	opt = opt || {};
    	//no movement needed
    	var queueingAllowed = opt.queueing || true;
		if( (position == undefined && orientation == undefined) || //nowhere to moveto
				( !queueingAllowed && this.movementInProgress()) ) //queuing forbiden, but something in progress
					return this;

		//create new queue entry of the new given data:
		var newEntry = {};
		var tween = new TWEEN.Tween({t:0}).to({t:time}, time);
		if(opt.delay != undefined) tween.delay(opt.delay);
		var that = this;
		var easing = opt.easing;
		//update callback
		tween.onUpdate( function() {
			//this is the data interpolated by the tween
			that.movement(this.t, 0, time, easing);
		} );
		//callback on complete
		tween.onComplete( function(){
			//this is the data interpolated by the tween

			//start next tween (beginning of the queue), if there is any in the queue
			if(that.motionQueue.length > 1){ //we did not remove the finished one yet
				//set startpos / ori of the following moveTo, instead of setting at definition
				var followingMovement = that.motionQueue[1];
				var endedMovement = that.motionQueue[0];
				followingMovement.startPosition = endedMovement.endPosition || that.getPosition();
				followingMovement.startOrientation = endedMovement.endOrientation || that.getOrientation();
				followingMovement.tween.start();
			}
			//remove finished tween from the beginning of the queue
			that.motionQueue.shift();
			//callback after the movement finished
			if(opt.callback && typeof(opt.callback) === "function")
				opt.callback();
		});
		newEntry.tween = tween;
		newEntry.endPosition = position;
		newEntry.endOrientation = orientation;
		//default start values, are the current values
		//those are overwritten if a tween ends before us, see the onComplete callback
		newEntry.startPosition = this.getPosition();
		newEntry.startOrientation = this.getOrientation();

		//push tween to the end of the queue and start if queue was empty
		this.motionQueue.push(newEntry);
		if( this.motionQueue.length-1 == 0){
			newEntry.tween.start();
			if(!XMOT.animating) {
				XMOT.animate();
				XMOT.animating = true;
			}
		}
		return this;
    };

    /**
     * Applies one movement step to the moveable
     * @private
     * @param {number}currentTime
     * @param {number} startTime
     * @param {number} endTime
     * @param {Function} easing
     */
    p.movement = function(currentTime, startTime, endTime, easing){
		var t = (currentTime - startTime) / (endTime - startTime);
		if(easing && typeof(easing) === "function") t = easing(t); //otherwise its linear
		var pos = this.interpolatePosition(t);
		var ori = this.interpolateOrientation(t);
		this.setValue(pos, ori);
    };

    /**
     * Interpolates the position of the current movement
     * @private
     * @param {number} t interpolation parameter
     * @return {Array.<number>|undefined} position
     */
    p.interpolatePosition = function(t){
		var end = this.motionQueue[0].endPosition;
		if(end == undefined) return undefined;
		var start = this.motionQueue[0].startPosition;
		var ret = [];
		var i = 0;
		for(i=0; i<start.length; i++ ){
			ret[i] = start[i] + ( end[i] - start[i] ) * t;
		}
		return ret;
    };

    /**
     * interpoaltes the orientation of the current movement
     * @private
     * @param {number} t interpolation paramater
     * @return {Array.<number>|undefined} orientation
     */
    p.interpolateOrientation = function(t){
		var end = this.motionQueue[0].endOrientation;
		if(end == undefined) return undefined;
		var start = this.motionQueue[0].startOrientation;
		return XMOT.slerp(start, end, t);
    };

    /**
	 * Set position and animation of the moveable
	 * @private
	 * @param {Array.<number>|undefined} position
	 * @param {Array.<number>|undefined} orientation
	 */
	p.setValue = function(position, orientation){
		if(position != undefined)
			this.setPosition(position);
		if(orientation != undefined)
			this.setOrientation(orientation);
	};

	/** @inheritDoc */
	p.movementInProgress = function(){
		return this.motionQueue.length > 0;
	};

    /**@inheritDoc */
    p.stop = function(){
		this.motionQueue.shift().tween.stop();
		this.motionQueue = []; //clear array
    };

    /** @inheritDoc */
    p.setConstraint = function(constraint){
		this.constraint = constraint;
    };

    //export
    XMOT.ClientMoveable = ClientMoveable;

}());