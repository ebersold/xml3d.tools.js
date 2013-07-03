(function(){

    "use strict";

    /** This behavior will provide "examine" mode camera control on the given
     *  target transformable.
     *  This behavior does have no notion of the interaction device. All it needs
     *  are deltaX and deltaY values, from which it computes the camera pose.
     *
     *  Usage: call dolly() and rotate().
     *
     *  @constructor
     */
    XMOT.ExamineControllerBehavior = new XMOT.Class({

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @param {Element|Transformable} targetViewGroup
         *  @param {Object} options
         *
         *  options:
         *  o rotateSpeed, default 1
         *  o dollySpeed, default 40
         *  o examineOrigin, default scene's bounding box center
         */
        initialize: function(targetViewGroup, options) {

            this.target = XMOT.util.getOrCreateTransformable(targetViewGroup);

            /** @private */
            this._targetScene = XMOT.util.getXml3dRoot(this.target.object);

            /** @private */
            this._rotateSpeed = 1;
            /** @private */
            this._dollySpeed = 1;

            /** @private */
            this._examineOrigin = this._getExamineOriginFromScene();

            /** @private */
            this._angleXAxis = 0;
            /** @private */
            this._angleYAxis =  0;
            /** @private */
            this._distanceExamineOriginTarget = 0;
            /** @private */
            this._dollyCoefficient = this._calculateDollyCoefficient();

            this._parseOptions(options);

            this._updateDistanceExamineOriginTarget();
            this.lookAt(this._examineOrigin);
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @return {window.XML3DVec3}
         */
        getExamineOrigin: function() {
            return new window.XML3DVec3(this._examineOrigin);
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @return {number}
         */
        getRotateSpeed: function() {
            return this._rotateSpeed;
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @return {number}
         */
        getDollySpeed: function() {
            return this._dollySpeed;
        },

        // TODO: have method setExamineOrigin()
        // o doesn't change camera pose at all
        // o only changes examine origin and thus axis around which to rotate

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @param {window.XML3DVec3} targetPt
         */
        lookAt: function(targetPt) {

            this._examineOrigin.set(targetPt);
            this._updateDistanceExamineOriginTarget();

            var forward = this._examineOrigin.subtract(this.target.getPosition());
            forward = forward.normalize();

            var temporaryUp = this._rotateInTargetSpace(new window.XML3DVec3(0,1,0));

            var right = forward.cross(temporaryUp);
            if (right.length() < XMOT.math.EPSILON)
            {
                right = this._rotateInTargetSpace(new window.XML3DVec3(1,0,0));
            }
            right = right.normalize();

            var up = right.cross(forward);

            var orientation = new window.XML3DRotation();
            orientation.setFromBasis(right, up, forward.negate());

            this.target.setOrientation(orientation);

            var eulerAngles = XMOT.math.rotationToEulerXY(orientation);
            this._angleXAxis = eulerAngles.x;
            this._angleYAxis = eulerAngles.y;

            // compensate for precision errors for euler angle calculation
            // by rotating by no delta
            this.rotate(0,0);
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @param {number} delta the value of how much to dolly from the current pose
         */
        dolly: function(delta) {

            var scaledDelta = this._dollySpeed * this._dollyCoefficient * delta;

            var translVec = new window.XML3DVec3(0, 0, scaledDelta);
            translVec = this.target.getOrientation().rotateVec3(translVec);

            this.target.translate(translVec);

            this._updateDistanceExamineOriginTarget();
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @param {number} deltaXAxis the value on how much to scale on the x-axis
         *  @param {number} deltaYAxis the value on how much to scale on the y-axis
         */
        rotate: function(deltaXAxis, deltaYAxis) {

            this._angleYAxis -= this._rotateSpeed * deltaYAxis;
            var xAxisAngle = this._angleXAxis + this._rotateSpeed * deltaXAxis;
            this._angleXAxis = this._constrainXAxisAngle(xAxisAngle);

            // Position
            var position = this._calculateCurrentPosition();

            this.target.setPosition(position);

            // Right
            var cosAngleYAxis = Math.cos(this._angleYAxis);
            var sinAngleYAxis = Math.sin(this._angleYAxis);

            var right = new window.XML3DVec3(cosAngleYAxis,0,-sinAngleYAxis);
            right = right.normalize();

            // direction
            var direction = this._examineOrigin.subtract(position);
            direction = direction.normalize();

            // up
            var up = right.cross(direction);

            var orientation = new window.XML3DRotation();
            orientation.setFromBasis(right, up, direction.negate());
            this.target.setOrientation(orientation);
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @private
         *  @param {Object} options
         */
        _parseOptions: function(options) {

            var options = options || {};
            if(options.rotateSpeed !== undefined)
                this._rotateSpeed = options.rotateSpeed;
            if(options.dollySpeed !== undefined)
                this._dollySpeed = options.dollySpeed;
            if(options.examineOrigin !== undefined)
                this._examineOrigin = options.examineOrigin;
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @private
         */
        _updateDistanceExamineOriginTarget: function() {

            var tarToOrig = this._examineOrigin.subtract(this.target.getPosition());
            if(tarToOrig.length() < XMOT.math.EPSILON) {
                throw new Error("Examine origin and camera position coincide!");
            }
            this._distanceExamineOriginTarget = tarToOrig.length();
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @private
         *  @return {number}
         */
        _calculateDollyCoefficient: function() {
            return this._targetScene.getBoundingBox().size().length() * 0.5;
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @private
         *  @return {window.XML3DVec3}
         */
        _getExamineOriginFromScene: function() {

            var orig = new window.XML3DVec3(0,0,0);

            var bb = this._targetScene.getBoundingBox();
            if (!bb.isEmpty()) {
                orig.set(bb.center());
            }

            return orig;
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @private
         *
         *  @return {window.XML3DVec3}
         */
        _calculateCurrentPosition: function() {
            var cosAngleXAxis = Math.cos(this._angleXAxis);
            var cosAngleYAxis = Math.cos(this._angleYAxis);
            var sinAngleYAxis = Math.sin(this._angleYAxis);

            var position = new window.XML3DVec3(
                cosAngleXAxis * sinAngleYAxis,
                Math.sin(this._angleXAxis),
                cosAngleXAxis * cosAngleYAxis);
            position = position.normalize();

            position = position.scale(this._distanceExamineOriginTarget);

            return position.add(this._examineOrigin);
        },

        /** Constrain the given angle to lie within [-90,90] degree interval to
         *  avoid gimbal lock.
         *
         *  @this {XMOT.ExamineControllerBehavior}
         *  @private
         *  @param angle
         *  @return {number}
         */
        _constrainXAxisAngle: function(angle) {
            return Math.max(-Math.PI / 2.0, Math.min(Math.PI / 2.0, angle));
        },

        /**
         *  @this {XMOT.ExamineControllerBehavior}
         *  @private
         *
         *  @return {window.XML3DVec3}
         */
        _rotateInTargetSpace: function(vec) {
            return this.target.getOrientation().rotateVec3(vec);
        }
    });
}());
