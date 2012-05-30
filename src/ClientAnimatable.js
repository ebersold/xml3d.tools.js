goog.require("goog.inherits");
goog.require("goog.base");

(function(){

	/**
	 * An implementation of Animatable
	 * @constructor
	 * @implements Animatable
	 * @extends ClientMoveable
	 */
	var ClientAnimatable = function(obj, transform, constraint){

		//call parent constructor here
		goog.base(this, obj, transform, constraint);

		/**
		 * Map of KeyframeAnimations
		 * @private
		 * @type {string, {animation: KeyframeAnimation, opt: Object=}}
		 */
		this.availableAnimations = {};
		/**
		 * Map of active KeyframeAnimations
		 * Note: This works since the IDs are only numbers.
		 * Those numbers are turned into strings  and those are used as keys.
		 * @private
		 * @type {number, {animation: KeyframeAnimation, queue: Array.<tween>, opt: Object=}}
		 */
		this.activeAnimations = {};
		/**
		 * Counter of IDs for active animations
		 * Attention: this might turn to infinity
		 * @private
		 * @type {number}
		 */
		this.idCounter = 0;
	};

	//inheritence is done here
	goog.inherits(ClientAnimatable, XMOT.ClientMoveable);

    var a = ClientAnimatable.prototype;

    /** @inheritDoc */
    a.addAnimation = function(animation, opt){
		//do not change optons of the animation, store options of the animation of this animatable
		//same animation might have different options on another animatable
		this.availableAnimations[animation.name] = new Object();
		var tmp = this.availableAnimations[animation.name];
		tmp.opt = opt;
		tmp.animation = animation;
    };

    /** @inheritDoc */
    a.startAnimation = function(name, opt){
		var id = this.idCounter;
		this.idCounter++;
		this.activeAnimations[id] = new Object();
		var tmp = this.activeAnimations[id];
		tmp.animation = this.availableAnimations[name].animation;
		tmp.queue = [];
		tmp.opt = opt;
		tmp.animation.start(id, this);
		return id;
    };

    /** @inheritDoc */
    a.stopAnimation = function(id){
		//stop animation
		var queue = this.activeAnimations[id].queue;
		queue.pop().stop();
		queue = [];
		//delete from map - TODO how to do this correctly?
		this.activeAnimations[id] = {};
		return this;
    };

    /** @inheritDoc
     * We need to override the moveTo function of the Moveable in order to be able to stop single animations
     * and have more than one animation at a single time.
     * Name might not be that good?
     * good idea to override?
     */
    a.moveTo = function(animationID, position, orientation, time, opt){
    	//TODO: rotation shows some strange behaviour!
		//no movement needed
		if(position == undefined && orientation == undefined) return this;

		var queue = this.activeAnimations[animationID].queue;

		/*Some Debug output
		if(orientation === undefined)
			console.log("moveTo: now: " + (new Date()).getSeconds() + "pos: " + position[0] + " " + position[1]+ " " +position[2] + " ori: undefined" + " time: " + time );
		else if(position === undefined)
			console.log("moveTo: now: " + (new Date()).getSeconds() + "pos undefined ori: " + orientation[0]+ " " +orientation[1]+ " " +orientation[2]+ " " +orientation[3]+ " time: " + time );
		else
			console.log("moveTo: now: " + (new Date()).getSeconds() + "pos: " + position[0] + " " + position[1]+ " " +position[2] + " ori: " + orientation[0]+ " " +orientation[1]+ " " +orientation[2]+ " " +orientation[3]+ " time: " + time );
		 */
		//endMotionData = data where the last motion ended; if the queue is empty, this is where we are
		if( queue.length == 0){
			var trans = this.transform.translation;
			var rot = this.transform.rotation;
			this.endMotionData	=  {pos_x:trans.x, pos_y:trans.y, pos_z:trans.z, ori_x:rot._axis.x, ori_y:rot._axis.y, ori_z:rot._axis.z, ori_a:rot._angle};
		}
		//start of the chained motion is end of the the one before, if there is one before
    	//var currentData = this.endMotionData; need copyconstructor
		var currentData = {pos_x:this.endMotionData.pos_x, pos_y:this.endMotionData.pos_y, pos_z:this.endMotionData.pos_z, ori_x:this.endMotionData.ori_x, ori_y:this.endMotionData.ori_y, ori_z:this.endMotionData.ori_z, ori_a:this.endMotionData.ori_a};

		//if undefined keep old values
		//TODO: if undefined do not modify!!!
		var destData = {pos_x:this.endMotionData.pos_x, pos_y:this.endMotionData.pos_y, pos_z:this.endMotionData.pos_z, ori_x:this.endMotionData.ori_x, ori_y:this.endMotionData.ori_y, ori_z:this.endMotionData.ori_z, ori_a:this.endMotionData.ori_a};
		if(orientation === undefined){
			destData.pos_x = position[0];
			destData.pos_y = position[1];
			destData.pos_z = position[2];
		}else if(position === undefined){
			//TODO: is there a better way to address the data of the rotation?
			destData.ori_x = orientation[0];
			destData.ori_y = orientation[1];
			destData.ori_z = orientation[2];
			destData.ori_a = orientation[3];
		}
		else
			destData = {pos_x:position[0], pos_y:position[1], pos_z:position[2], ori_x:orientation[0], ori_y:orientation[1], ori_z:orientation[2], ori_a:orientation[3]};

		//TODO: var algo = this.checkOption("interpolationalgorithm", animationID);
		var tween = new TWEEN.Tween(currentData).to(destData, time);

		//this.endMotionData = destData;
		this.endMotionData = {pos_x:destData.pos_x, pos_y:destData.pos_y, pos_z:destData.pos_z, ori_x:destData.ori_x, ori_y:destData.ori_y, ori_z:destData.ori_z, ori_a:destData.ori_a};

		var that = this;
		//update callback
		tween.onUpdate( function() {
			//console.log("animation update! " + (new Date()).getSeconds() );
			if(position != undefined)
				that.setPosition([currentData.pos_x, currentData.pos_y, currentData.pos_z]);
			if(orientation != undefined)
				that.setOrientation([currentData.ori_x, currentData.ori_y, currentData.ori_z, currentData.ori_a]);
		} );

		//callback on complete
		tween.onComplete( function(){
			console.log("movement ended:" + (new Date()).getSeconds() );
			//last motion step, just in case
			that.setPosition([currentData.pos_x, currentData.pos_y, currentData.pos_z]);
			that.setOrientation([currentData.ori_x, currentData.ori_y, currentData.ori_z, currentData.ori_a]);
			//remove finished tween from the end of the queue
			queue.pop();
			//start next tween (end of the queue), if there is any in the queue
			if(queue.length > 0){
				queue[queue.length-1].start();
				console.log("movement started:" + (new Date()).getSeconds() );
			}
			else{
				//animation ended -> callback or loop
				console.log("animation ended:" + (new Date()).getSeconds() );
				var numberOfLoops = that.checkOption("loop", animationID);
				if(isFinite(numberOfLoops)){
					if( numberOfLoops > 1 ){ //we must loop again
						var currentAnimation = that.activeAnimations[id];
						currentAnimation.opt.loop = numberOfLoops - 1;
						currentAnimation.queue = []; //reset array
						currentAnimation.animation.start(id, that);
						//TODO: loop is bug
					}else {
						//no more loops, we are finished and now the callback
						var cb = that.checkOption("callback", animationID);
						if(typeof(cb) === "function") cb();
					}
				}
				else{
					//infinite loops
					that.start(that.activeAnimations[id].animation.name, that.activeAnimations[id].opt);
				}
			}
		});

		//push tween to the beginning of the queue and start if queue was empty
		queue.unshift(tween);
		if( queue.length-1 == 0){
			tween.start();
			//console.log("animation started:" + (new Date()).getSeconds() );
			XMOT.animate();
		}
		return this;
    };

	/**
	 * Checks for a single options and returns the correct value according to the hierachy of different opts
	 * @param {string} name name of the option
	 * @param {number} animationID
	 */
	a.checkOption = function(name, animationID){
		//options provided at start of the animation
		var startOpt = this.activeAnimations[animationID].opt;
		if(typeof(startOpt) != "undefined" && typeof(startOpt[name]) != "undefined"){
			return startOpt[name];
		}
		else {
			//options provided while adding the animation to the animatable
			var animationOpt = this.availableAnimations[this.activeAnimations[id].animation.name].opt;
			if(typeof(animationOpt) != "undefined" && typeof(animationOpt[name]) != "undefined"){
				return animationOpt[name];
			}else
				//option of the animation itself
				return this.activeAnimations[id].animation[name];
		}
	};

    //export
	XMOT.ClientAnimatable = ClientAnimatable;

}());