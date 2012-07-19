(function(){
	/**
	 * ClientKeyframeAnimation implementation
	 * @param{string} name name of the animation
	 * @param{Array.<number>} keys keys
	 * @param{Array.<number>|undefined} positionValues
	 * @param{Array.<number>|undefined} orientationValues
	 * @constructor
	 * @implements{Animation}
	 */
	function ClientKeyframeAnimation(name, keys, positionValues, orientationValues, scaleValues, opt){

		/**
		 * name of animation
		 * @private
		 * @type {string}
		 */
		this.name = name;
		/**
		 * Array of the keys
		 * @private
		 * @type{Array.<number>}
		 */
		this.keys = keys;
		/**
		 * Array fo the position values
		 * @private
		 * @type{Array.<number>|undefined}
		 */
		this.positionValues = positionValues;
		/**
		 * Array of the orientation values
		 * @private
		 * @type{Array.<number>|undefined}
		 */
		this.orientationValues = orientationValues;
		/**
		 * Array of the scale values
		 * @private
		 * @type{Array.<number>|undefined}
		 */
		this.scaleValues = scaleValues;

		//options - set defaults
		/**
		 * loop
		 * @private
		 * @type {number}
		 */
		this.loop = 1;
		/**
		 * delay
		 * @private
		 * @type{number}
		 */
		this.delay = 0;
		/**
		 * Duration of the animation
		 * @private
		 * @type {number}
		 */
		this.duration = 1000;
		/**
		 * easing
		 * @private
		 * @type {Function}
		 */
		this.easing = TWEEN.Easing.Linear.None;
		/**
		 * Callback, executed as soon as the animation ended
		 * @private
		 * @type {Function}
		 */
		this.callback = function(){};
		if(opt){
			this.setOptions(opt);
		}
	};

	var k = ClientKeyframeAnimation.prototype;

	/** @inheritDoc */
	k.applyAnimation = function(animatable, currentTime, startTime, endTime, easing){
		var t = (currentTime - startTime) / (endTime - startTime);
		if(easing && typeof(easing) === "function") t = easing(t); //otherwise its linear
		var lmo = this.keys.length - 1;
		if (t <= this.keys[0]){
			this.setValue( animatable, this.getPosition(0), this.getOrientation(0), this.getScale(0) );
		}else if (t >= this.keys[lmo]){
			this.setValue( animatable, this.getPosition(lmo), this.getOrientation(lmo), this.getScale(lmo) );
		}else{
			for ( var i = 0; i < lmo; i++){
				if (this.keys[i] < t && t <= this.keys[i + 1]) {
					var p = (t - this.keys[i]) / (this.keys[i + 1] - this.keys[i]);
					this.setValue( animatable, this.getInterpolatedPosition(i, p), this.getInterpolatedOrientation(i, p), this.getInterpolatedScale(i, p) );
				}
			}
		}
	};

	/**
	 * Set position and animation of the animatable
	 * @private
	 * @param {Animatable} animatable
	 * @param {Array.<number>|undefined} position
	 * @param {Array.<number>|undefined} orientation
	 */
	k.setValue = function(animatable, position, orientation, scale){
		if(position != undefined)
			animatable.setPosition(position);
		if(orientation != undefined)
			animatable.setOrientation(orientation);
		if(scale != undefined)
			animatable.setScale(scale);
	};

	/**
	 * Interpolates positionvalues between index i and index i+1 with parameter t
	 * @private
	 * @param {number} index
	 * @param {number} t interpolationparameter
	 * @return {Array.<number>|undefined} Position
	 */
	k.getInterpolatedPosition = function(index, t){
		if(this.positionValues == undefined) return undefined;
		return this.interpolateArray(this.getPosition(index), this.getPosition(index+1), t);
	};

	/**
	 * Interpolates scalevalues between index i and index i+1 with parameter t
	 * @private
	 * @param {number} index
	 * @param {number} t interpolationparameter
	 * @return {Array.<number>|undefined} Position
	 */
	k.getInterpolatedScale = function(index, t){
		if(this.scaleValues == undefined) return undefined;
		return this.interpolateArray(this.getScale(index), this.getScale(index+1), t);
	};

	/**
	 * Interpolate the values of two arrays
	 * @private
	 * @param{Array.<number>} a1 array 1
	 * @param{Array.<number>} a2 array 2
	 * @param {number} t interpolationparameter
	 * @return {Array.<number>|undefined} interpolated array
	 */
	k.interpolateArray = function(a1, a2, t){
		var ret = [];
		var i = 0;
		var l = a1.length;
		if(a1.length != a2.length) return undefined;
		for(i=0; i<l; i++ ){
			ret[i] = a1[i] + ( a2[i] - a1[i] ) * t;
		}
		return ret;
	};

	/**
	 * Interpolates keyvalues between index i and index i+1 with parameter t
	 * @private
	 * @param {number} index
	 * @param {number} t interpolationparameter
	 * @return {Array.<number>|undefined} Orientation
	 */
	k.getInterpolatedOrientation = function(index, t){
		if(this.orientationValues == undefined) return undefined;
		var start = this.getOrientation(index);
		var end = this.getOrientation(index+1);
		return XMOT.slerp(start, end, t);
	};

	/**
	 * Gets a position corresponding to a key
	 * @private
	 * @param {number} key
	 * @return {Array.<number>|undefined} Position
	 */
	k.getPosition = function(key){
		if(this.positionValues == undefined || key > this.keys.length-1 /*just in case*/) return undefined;
		var index = key*3;
		return [ this.positionValues[index], this.positionValues[index+1], this.positionValues[index+2] ];
	};

	/**
	 * Gets a sacle corresponding to a key
	 * @private
	 * @param {number} key
	 * @return {Array.<number>|undefined} Position
	 */
	k.getScale = function(key){
		if(this.scaleValues == undefined || key > this.keys.length-1 /*just in case*/) return undefined;
		var index = key*3;
		return [ this.scaleValues[index], this.scaleValues[index+1], this.scaleValues[index+2] ];
	};

	/**
	 * Gets an orientation corresponding to a key
	 * @private
	 * @param {number} key
	 * @return {Array.<number>|undefined} Orientation
	 */
	k.getOrientation = function(key){
		if(this.orientationValues == undefined || key > this.keys.length-1 /*just in case*/) return undefined;
		var index = key*4;
		return [ this.orientationValues[index], this.orientationValues[index+1], this.orientationValues[index+2], this.orientationValues[index+3] ];
	};

	/** @inheritDoc */
	k.getOptions = function(){
		return {duration: this.duration, loop: this.loop, delay: this.delay, easing: this.easing, callback: this.callback};
	};

    /** @inheritDoc */
    k.setOptions = function(opt){
		if(opt.loop)
			this.loop = opt.loop;
		if(opt.duration)
			this.duration = opt.duration;
		if(opt.easingk && typeof(opt.easing) === "function")
			this.easing = opt.easing;
		if(opt.callback && typeof(opt.callback) === "function")
			this.callback = opt.callback;
    };

	//export
	XMOT.ClientKeyframeAnimation = ClientKeyframeAnimation;
}());