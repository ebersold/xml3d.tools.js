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
    XML3D.tools.ExamineBehavior = new XML3D.tools.Class(XML3D.tools.CameraBehavior, {

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         *  @param {Element|Transformable} targetViewGroup
         *  @param {Object} options
         *
         *  options:
         *  o rotateSpeed, default 1
         *  o dollySpeed, default 1
         *  o examineOrigin, default: scene's bounding box center on which lookAtScene() is called
         *  o examineOriginResetDistance: default 1. When the target's transformation changes
         *      the internal state needs to be updated. The examination origin is set by offsetting
         *      it by a factor into the camera's forward direction. That factor is this option.
         *
         *  o {min,max}DistanceToExamineOrigin: default {Number.MIN_VALUE, Number.MAX_VALUE},
         *      minimum and maximum distance to the examination origin
         */
        initialize: function(targetViewGroup, options) {

            this.callSuper(targetViewGroup, options);

            /** @private */
            this._targetScene = XML3D.tools.util.getXml3dRoot(this.target.object);

            /** @private */
            this._dollySpeed = 1;

            /** @private */
            this._initialExamineOriginSet = false;

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
            this._targetTracker = new XML3D.tools.TransformTracker(this.target.object);
            this._targetTracker.xfmChanged = this.callback("_onTargetXfmChanged");

            this._parseOptions(options);

            this._updateDistanceToExamineOrigin();
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         *  @inheritDoc
         */
        onAttach: function() {
            XML3D.tools.util.fireWhenMeshesLoaded(this.target.object, this.callback("_updateDollyCoefficient"));

            if(this._initialExamineOriginSet)
                this.lookAt(this._examineOrigin);

            this._doOwnTransformChange = true;
            this._targetTracker.attach();
            this._doOwnTransformChange = false;
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         *  @inheritDoc
         */
        onDetach: function() {
            this._targetTracker.detach();
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         *  @return {window.XML3DVec3}
         */
        getExamineOrigin: function() {
            return new window.XML3DVec3(this._examineOrigin);
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         *  @return {number}
         */
        getDollySpeed: function() {
            return this._dollySpeed;
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         *  @return {number}
         */
        getResetDistanceToExamineOrigin: function() {
            return this._examineOriginResetDistance;
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         *  @param {number} newDistance
         */
        setResetDistanceToExamineOrigin: function(newDistance) {
            this._examineOriginResetDistance = newDistance;
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         *  @param {number} newMinDistance
         */
        setMinDistanceToExamineOrigin: function(newMinDistance) {
            this._minDistanceToExamineOrigin = newMinDistance;
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         *  @param {number} newMaxDistance
         */
        setMaxDistanceToExamineOrigin: function(newMaxDistance) {
            this._maxDistanceToExamineOrigin = newMaxDistance;
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         */
        getMinDistanceToExamineOrigin: function() {
            return this._minDistanceToExamineOrigin;
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         */
        getMaxDistanceToExamineOrigin: function() {
            return this._maxDistanceToExamineOrigin;
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         *  @inheritDoc
         *  @param {number=} distanceToPoint. Default: examine origin reset distance
         */
        lookAt: function(point, distanceToPoint) {

            if(distanceToPoint === undefined)
                distanceToPoint = this._examineOriginResetDistance;

            this._doOwnTransformChange = true;
            this.callSuper(point, distanceToPoint);
            this._doOwnTransformChange = false;

            this._setExamineOrigin(point);
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         *  @param {number} delta the value of how much to dolly from the current pose
         *  @return {boolean} true if the dolly action was actually performed
         */
        dolly: function(delta) {

            var scaledDelta = this._dollySpeed * this._dollyCoefficient * delta;
            var currentScale = this._getDistanceToExamineOrigin();
            var totalScale = this._clampDistanceToExamineOrigin(scaledDelta + currentScale);

            var translVec = this._rotateInTargetSpace(new window.XML3DVec3(0, 0, totalScale));
            var newPosition = this._examineOrigin.add(translVec);

            if(!this._setTargetPosition(newPosition))
                return false;

            this._updateDistanceToExamineOrigin();

            return true;
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         *  @inheritDoc
         */
        rotateByAngles: function(xAxisAngle, yAxisAngle) {

            var newOrientation = this.getNewCameraOrientation(xAxisAngle, yAxisAngle);

            var zAxis = newOrientation.rotateVec3(new XML3DVec3(0,0,1));
            var newViewPos = this._examineOrigin.add(zAxis.scale(this._distanceToExamineOrigin));

            var oldViewPos = this.target.getPosition();
            if(!this._setTargetPosition(newViewPos))
                return false;

            if(!this._setTargetOrientation(newOrientation)) {
                this._setTargetPosition(oldViewPos);
                return false;
            }

            return true;
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         *  @private
         *  @param {Object} options
         */
        _parseOptions: function(options) {

            var options = options || {};
            if(options.dollySpeed !== undefined)
                this._dollySpeed = options.dollySpeed;

            if(options.examineOriginResetDistance !== undefined)
                this._examineOriginResetDistance = options.examineOriginResetDistance;
            else
                this._examineOriginResetDistance = this._getDistanceToExamineOrigin();
            if(options.minDistanceToExamineOrigin !== undefined)
                this._minDistanceToExamineOrigin = options.minDistanceToExamineOrigin;
            if(options.maxDistanceToExamineOrigin !== undefined)
                this._maxDistanceToExamineOrigin = options.maxDistanceToExamineOrigin;

            this._examineOriginResetDistance =
                this._clampDistanceToExamineOrigin(this._examineOriginResetDistance);

            if(options.examineOrigin !== undefined) {
                this._initialExamineOriginSet = true;
                this._examineOrigin.set(options.examineOrigin);

                if(options.examineOriginResetDistance === undefined)
                    this._examineOriginResetDistance = this._getDistanceToExamineOrigin();
            }
            else {
                this._initialExamineOriginSet = false;
                this._resetExamineOrigin();
            }
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         *  @private
         */
        _resetExamineOrigin: function() {
            var scaledDir = this.getLookDirection().scale(this._examineOriginResetDistance);
            this._examineOrigin.set(this.target.getPosition().add(scaledDir));
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         *  @private
         */
        _setExamineOrigin: function(newExamineOrigin) {
            this._examineOrigin.set(newExamineOrigin);
            this._updateDistanceToExamineOrigin();
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         *  @private
         */
        _updateDistanceToExamineOrigin: function() {
            this._setDistanceToExamineOrigin(this._getDistanceToExamineOrigin());
        },

        /**
         *  Set the internal variable _distanceToExamineOrigin to the given distance
         *  and clamping against the bounds.
         *
         *  @this {XML3D.tools.ExamineBehavior}
         *  @private
         *  @param {number} distance
         */
        _setDistanceToExamineOrigin: function(distance) {

            this._distanceToExamineOrigin = this._clampDistanceToExamineOrigin(distance);
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         *  @private
         *  @param {number} distance
         *  @return {number} distance clamped by _{min,max}DistanceToExamineOrigin
         */
        _clampDistanceToExamineOrigin: function(distance) {
            return XML3D.tools.util.clamp(distance, this._minDistanceToExamineOrigin,
                this._maxDistanceToExamineOrigin);
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         *  @private
         *  @return {number} the current distance between the target and the origin
         */
        _getDistanceToExamineOrigin: function() {
            return this._examineOrigin.subtract(this.target.getPosition()).length();
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         *  @private
         */
        _updateDollyCoefficient: function() {
            this._dollyCoefficient = this._targetScene.getBoundingBox().size().length() * 0.5;
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         *  @private
         */
        _onTargetXfmChanged: function() {
            if(this._doOwnTransformChange)
                return;

            var position = this.target.getPosition();

            this._setDistanceToExamineOrigin(this._examineOriginResetDistance);
            var forward = this._rotateInTargetSpace(new window.XML3DVec3(0,0,-1));
            forward = forward.scale(this._distanceToExamineOrigin);
            this._examineOrigin.set(position.add(forward));
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
         *  @private
         *  @param {window.XML3DVec3} vec
         *  @return {window.XML3DVec3}
         */
        _rotateInTargetSpace: function(vec) {
            return this.target.getOrientation().rotateVec3(vec);
        },

        /**
         *  @this {XML3D.tools.ExamineBehavior}
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
         *  @this {XML3D.tools.ExamineBehavior}
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
