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
    XMOT.ExamineBehavior = new XMOT.Class(XMOT.util.Attachable, {

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @param {Element|Transformable} targetViewGroup
         *  @param {Object} options
         *
         *  options:
         *  o rotateSpeed, default 1
         *  o dollySpeed, default 40
         *  o examineOrigin, default: scene's bounding box center on which lookAtScene() is called
         *  o examineOriginResetDistance: default 1. When the target's transformation changes
         *      the internal state needs to be updated. The examination origin is set by offsetting
         *      it by a factor into the camera's forward direction. That factor is this option.
         *
         *  o {min,max}DistanceToExamineOrigin: default {Number.MIN_VALUE, Number.MAX_VALUE},
         *      minimum and maximum distance to the examination origin
         *
         *  o {min,max}AngleXAxis: constraints for the rotation around the x-axis. Default is
         *      {-Math.PI/2, Math.PI/2} to avoid gimbal lock.
         *  o {min,max}AngleYAxis: constraints for the rotation around the y-axis. Default is
         *      {-Number.MAX_VALUE, Number.MAX_VALUE}.
         *
         *  The min and max angle values specify values that are NOT to be reached. They are modified
         *  with a bias of 0.01 (i.e. min is actually min + 0.01 and max is max - 0.01)
         */
        initialize: function(targetViewGroup, options) {

            this.callSuper();

            this.target = XMOT.util.getOrCreateTransformable(targetViewGroup);

            /** @private */
            this._targetScene = XMOT.util.getXml3dRoot(this.target.object);

            /** @private */
            this._rotateSpeed = 1;
            /** @private */
            this._dollySpeed = 1;

            /** @private */
            this._examineOrigin = new window.XML3DVec3();

            /** @private */
            this._dollyCoefficient = 1;

            /** @private */
            this._minDistanceToExamineOrigin = 0.1;
            /** @private */
            this._maxDistanceToExamineOrigin = Number.MAX_VALUE;

            /** @private */
            this._examineOriginResetDistance = 10;
            /** @private */
            this._distanceToExamineOrigin = 0;

            /** Helper to keep track when we are changing our own transformation.
             *  Since we will update internal values when the transformation changes
             *  from outside we have to know when not to do this.
             *
             *  @private
             */
            this._doOwnTransformChange = false;

            /** @private */
            this._targetTracker = new XMOT.TransformTracker(this.target.object);
            this._targetTracker.xfmChanged = this.callback("_onTargetXfmChanged");

            this._parseOptions(options);
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @inheritDoc
         */
        onAttach: function() {
            XMOT.util.fireWhenMeshesLoaded(this.target.object, this.callback("_updateDollyCoefficient"));

            this._targetTracker.attach();
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @inheritDoc
         */
        onDetach: function() {
            this._targetTracker.detach();
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @return {window.XML3DVec3}
         */
        getExamineOrigin: function() {
            return new window.XML3DVec3(this._examineOrigin);
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @return {number}
         */
        getRotateSpeed: function() {
            return this._rotateSpeed;
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @return {number}
         */
        getDollySpeed: function() {
            return this._dollySpeed;
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @return {number}
         */
        getResetDistanceToExamineOrigin: function() {
            return this._examineOriginResetDistance;
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @param {number} newDistance
         */
        setResetDistanceToExamineOrigin: function(newDistance) {
            this._examineOriginResetDistance = newDistance;
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @param {number} newMinDistance
         */
        setMinDistanceToExamineOrigin: function(newMinDistance) {
            this._minDistanceToExamineOrigin = newMinDistance;
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @param {number} newMaxDistance
         */
        setMaxDistanceToExamineOrigin: function(newMaxDistance) {
            this._maxDistanceToExamineOrigin = newMaxDistance;
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         */
        getMinDistanceToExamineOrigin: function() {
            return this._minDistanceToExamineOrigin;
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         */
        getMaxDistanceToExamineOrigin: function() {
            return this._maxDistanceToExamineOrigin;
        },

        /** Resets the camera pose to look at the whole scene.
         *
         *  @this {XMOT.ExamineBehavior}
         *  @param {number=} distance to the scene center, default: scene's aabb diagonal
         *  @return {boolean} true if the transformation was actually performed
         */
        lookAtScene: function(distanceToSceneCenter) {

            var callback = function() {
                this._onSceneMeshesLoaded(distanceToSceneCenter);
            }.bind(this);
            XMOT.util.fireWhenMeshesLoaded(this._targetScene, callback);

            return true;
        },

        _onSceneMeshesLoaded: function(distanceToSceneCenter) {

            var defaultDistance = this._examineOriginResetDistance;
            if(distanceToSceneCenter === undefined)
                distanceToSceneCenter = defaultDistance;

            var sceneCenter = new window.XML3DVec3(0,0,0);

            var bb = this._targetScene.getBoundingBox();
            if (!bb.isEmpty()) {
                sceneCenter.set(bb.center());

                if(distanceToSceneCenter === defaultDistance) {

                    var bbDiagonal = bb.size().length();
                    if(bbDiagonal > distanceToSceneCenter) {
                        distanceToSceneCenter = bbDiagonal;
                    }
                }
            }

            this.resetTargetPose(sceneCenter, distanceToSceneCenter);
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @param {window.XML3DVec3} targetPt
         *  @return {boolean} whether the transformation has been actually applied
         */
        lookAt: function(targetPt) {

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

            // perform actual setting
            var oldExamineOrigin = new XML3DVec3(this._examineOrigin);
            var oldDistance = this._distanceToExamineOrigin;

            this._examineOrigin.set(targetPt);
            this._updateDistanceToExamineOrigin();

            if(!this.rotate(orientation)) {
                this._examineOrigin.set(oldExamineOrigin);
                this._setDistanceToExamineOrigin(oldDistance);
                return false;
            }

            return true;
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @param {window.XML3DVec3} newExamineOrigin
         *  @param {number} distanceToExamineOrigin
         *  @return {boolean} true if the reset was successful
         */
        resetTargetPose: function(newExamineOrigin, distanceToExamineOrigin) {

            var positionOffset = new window.XML3DVec3(0, 0, distanceToExamineOrigin);
            var targetPosition = newExamineOrigin.add(positionOffset);

            if(!this._setTargetPosition(targetPosition))
                return false;

            this._examineOrigin.set(newExamineOrigin);
            this._setDistanceToExamineOrigin(distanceToExamineOrigin);

            return true;
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @param {number} delta the value of how much to dolly from the current pose
         *  @return {boolean} true if the dolly action was actually performed
         */
        dolly: function(delta) {

            var scaledDelta = this._dollySpeed * this._dollyCoefficient * delta;
            var currentScale = this._getDistanceToExamineOrigin();
            var totalScale = this._clampDistanceToExamineOrigin(scaledDelta + currentScale);

            var translVec = new window.XML3DVec3(0, 0, totalScale);
            translVec = this.target.getOrientation().rotateVec3(translVec);
            var newPosition = this._examineOrigin.add(translVec);

            if(!this._setTargetPosition(newPosition))
                return false;

            this._updateDistanceToExamineOrigin();

            return true;
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @param {window.XML3DRotation} orientation
         *  @return {boolean} true if the rotate action was actually performed
         */
        rotate: function(orientation) {

            var eulerAngles = XMOT.math.rotationToEuler(orientation);
            return this.rotateByAngles(-eulerAngles.x, -eulerAngles.y);
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @param {number} deltaXAxis the value on how much to scale on the x-axis
         *  @param {number} deltaYAxis the value on how much to scale on the y-axis
         *  @return {boolean} true if the rotate action was actually performed
         */
        rotateByAngles: function(deltaXAxis, deltaYAxis) {

            var yAxisAngle = -this._rotateSpeed * deltaYAxis;
            var xAxisAngle = -this._rotateSpeed * deltaXAxis;

            var mx = new XML3DRotation(new XML3DVec3(1,0,0), xAxisAngle);
            var my = new XML3DRotation(new XML3DVec3(0,1,0), yAxisAngle);
            var newViewOrient = my.multiply(this.target.getOrientation().multiply(mx));

            var zAxis = newViewOrient.rotateVec3(new XML3DVec3(0,0,1));
            var newViewPos = this._examineOrigin.add(zAxis.scale(this._distanceToExamineOrigin));

            var oldViewPos = this.target.getPosition();
            if(!this._setTargetPosition(newViewPos))
                return false;

            if(!this._setTargetOrientation(newViewOrient)) {
                this._setTargetPosition(oldViewPos);
                return false;
            }

            return true;
        },

        /**
         *  @this {XMOT.ExamineBehavior}
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
                this._examineOrigin.set(options.examineOrigin);

            if(options.examineOriginResetDistance !== undefined)
                this._examineOriginResetDistance = options.examineOriginResetDistance;
            if(options.minDistanceToExamineOrigin !== undefined)
                this._minDistanceToExamineOrigin = options.minDistanceToExamineOrigin;
            if(options.maxDistanceToExamineOrigin !== undefined)
                this._maxDistanceToExamineOrigin = options.maxDistanceToExamineOrigin;

            this._examineOriginResetDistance = this._clampDistanceToExamineOrigin(this._examineOriginResetDistance);
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @private
         */
        _updateDistanceToExamineOrigin: function() {
            this._setDistanceToExamineOrigin(this._getDistanceToExamineOrigin());
        },

        /**
         *  Set the internal variable _distanceToExamineOrigin to the given distance
         *  and clamping against the bounds.
         *
         *  @this {XMOT.ExamineBehavior}
         *  @private
         *  @param {number} distance
         */
        _setDistanceToExamineOrigin: function(distance) {

            this._distanceToExamineOrigin = this._clampDistanceToExamineOrigin(distance);
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @private
         *  @param {number} distance
         *  @return {number} distance clamped by _{min,max}DistanceToExamineOrigin
         */
        _clampDistanceToExamineOrigin: function(distance) {
            return XMOT.util.clamp(distance, this._minDistanceToExamineOrigin,
                this._maxDistanceToExamineOrigin);
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @private
         *  @return {number} the current distance between the target and the origin
         */
        _getDistanceToExamineOrigin: function() {
            return this._examineOrigin.subtract(this.target.getPosition()).length();
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @private
         */
        _updateDollyCoefficient: function() {
            this._dollyCoefficient = this._targetScene.getBoundingBox().size().length() * 0.5;
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @private
         */
        _onTargetXfmChanged: function() {
            if(this._doOwnTransformChange)
                return;

            var position = this.target.getPosition();

            // update pose
            this._setDistanceToExamineOrigin(this._examineOriginResetDistance);
            var forward = this._rotateInTargetSpace(new window.XML3DVec3(0,0,-1));
            forward = forward.scale(this._examineOriginResetDistance);
            this._examineOrigin.set(position.add(forward));
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @private
         *
         *  @return {window.XML3DVec3}
         */
        _rotateInTargetSpace: function(vec) {
            return this.target.getOrientation().rotateVec3(vec);
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @private
         *  @param {window.XML3DVec3} position
         *  @return {boolean} whether setting was successful
         */
        _setTargetPosition: function(position) {
            this._doOwnTransformChange = true;
            var usePosition = this.target.setPosition(position);
            this._doOwnTransformChange = false;
            return usePosition;
        },

        /**
         *  @this {XMOT.ExamineBehavior}
         *  @private
         *  @param {window.XML3DRotation} orientation
         *  @return {boolean} whether setting was successful
         */
        _setTargetOrientation: function(orientation) {
            this._doOwnTransformChange = true;
            var useOrientation = this.target.setOrientation(orientation);
            this._doOwnTransformChange = false;
            return useOrientation;
        }
    });
}());
