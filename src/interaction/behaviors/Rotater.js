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

    XML3D.tools.namespace("XML3D.tools.interaction.behaviors");

    /** The Rotater takes the translation given by the PlaneSensor and interprets
     *  the individual components as angle in radians along the corresponding axis.
     *
     *  @extends XML3D.tools.interaction.behaviors.PlaneSensor
     */
    XML3D.tools.interaction.behaviors.Rotater = new XML3D.tools.Class(
        XML3D.tools.interaction.behaviors.PlaneSensor,
    {
        /** Constructor of Rotater
         *
         *  @this {XML3D.tools.interaction.behaviors.Rotater}
         *
         *  @param {string} id the id of this sensor
         *  @param {Array.<Object>} pickGrps the group this sensor will listen for events
         *  @param {XML3D.tools.Transformable=} targetTransformable the group this sensor will modify.
         *                 If not given, it is equal to the first element in pickGrp.
         *  @param {number=} rotSpeed rotation speed, default is 1
         *                  See XML3D.interaction.behaviors.PlaneSensor for further information.
         *  @param {XML3D.tools.util.EventDispatcher=} eventDispatcher the object used to register events
         *
         *  @throws "target no transform" if the target group doesn't have a transform
         *           attribute
         */
        initialize: function(id, pickGrps, targetTransformable, rotSpeed, eventDispatcher)
        {
            // --- setup pdsensor ---
            this.callSuper(id, pickGrps, undefined, undefined, eventDispatcher);

            // --- setup this sensor ---
            if(!targetTransformable)
                targetTransformable = XML3D.tools.MotionFactory.createTransformable(pickGrps[0]);

            this.targetTransformable = targetTransformable;

            this._rotationSpeed = 1;
            if(rotSpeed)
                this._rotationSpeed = rotSpeed;

            this._initialRotation = new XML3DRotation(this.targetTransformable.getOrientation());
            this._rotationOffset = new XML3DRotation(this._initialRotation);

            this._rotationXAxis = new XML3DVec3(-1, 0, 0);
            this._rotationYAxis = new XML3DVec3(0, 1, 0);
            this._rotationZAxis = new XML3DVec3(0, 0, 1);

            // listeners
            this.addListener("dragstart", this.callback("_onRotaterDragStart"));
            this.addListener("translchanged", this.callback("_onRotaterTranslChanged"));
        },

        /**
         *  @this {XML3D.tools.interaction.behaviors.Rotater}
         *
         *  @param {string=} axis. Should be "x", "y" or "z"
         *  @return {string} current/new restriction
         */
        axisRestriction: function(axis)
        {
            if(XML3D.tools.util.isDefined(axis))
            {
                this._axisRestriction = axis;
            }

            return this._axisRestriction;
        },

        /**
         *  @this {XML3D.tools.interaction.behaviors.Rotater}
         */
        clearAxisRestriction: function()
        {
            this._axisRestriction = undefined;
        },

        /** reset the rotation that gets remembered between drags
         *
         *  @this {XML3D.tools.interaction.behaviors.Rotater}
         */
        resetRotation: function()
        {
            this.targetTransformable.setOrientation(this._initialRotation);
        },

        /** Set or retrieve the rotation speed
         *
         *  @this {XML3D.tools.interaction.behaviors.Rotater}
         *
         *  @param {number} [speed] default: do not set the speed.
         *  @return {number} the current speed
         */
        rotationSpeed: function(speed)
        {
            if(speed)
                this.trackBall.rotationSpeed = speed;

            return this.trackBall.rotationSpeed;
        },

        // ========================================================================
        // --- Private ---
        // ========================================================================

        /**
         *  @private
         *  @this {XML3D.tools.interaction.behaviors.Rotater}
         *
         *  @param {XML3D.tools.interaction.behaviors.Rotater} sensor
         */
        _onRotaterDragStart: function(sensor)
        {
            // update the offset with perhaps changed rotation
            this._rotationOffset = new window.XML3DRotation(this.targetTransformable.transform.rotation);
            this._updateRotationAxes();
        },

        /**
         *  @this {XML3D.tools.interaction.behaviors.Rotater}
         *  @private
         *
         *  @param {XML3D.tools.interaction.behaviors.Rotater} sensor
         */
        _onRotaterTranslChanged: function(sensor)
        {
            var t = sensor.getCanonicalTranslation();

            // calculate angle along the axes
            /** in the z=1 plane x-translation should map to y-axis rotation
             *  and y-translation to x-axis rotation
             */
            var angleX = t.y * this._rotationSpeed;
            var angleY = t.x * this._rotationSpeed;

            // apply axis restrictions
            var rotation = new XML3DRotation();
            if(this._axisRestriction === undefined)
            {
                var rotX = new XML3DRotation(this._rotationXAxis, angleX);
                var rotY = new XML3DRotation(this._rotationYAxis, angleY);
                rotation.set(rotY.multiply(rotX));
            }
            else
            {
                var angleSum = angleX + angleY;
                var axis = new XML3DVec3();

                if(this._axisRestriction === "x")
                {
                    axis.set(this._rotationXAxis);
                }
                else if(this._axisRestriction === "y")
                {
                    axis.set(this._rotationYAxis);
                }
                else // === "z"
                {
                    axis.set(this._rotationZAxis);
                }

                rotation.setAxisAngle(axis, angleSum);
            }

            // apply rotation offset
            rotation.set(this._rotationOffset.multiply(rotation));

            // and update target orientation
            this.targetTransformable.setOrientation(rotation);
        },

        /**
         * We will always rotate around the local axes, e.g. (1,0,0) for the x-axis. However,
         * dependent on the view, we might want to rotate around (-1,0,0) for example to stay
         * coherent with the mouse movement.
         * Thus, we will transform these axes from view space to the target space and there take
         * the signs of the corresponding axis.
         *
         * @private
         */
        _updateRotationAxes: function() {
            // get view to target matrix
            var view = XML3D.util.getOrCreateActiveView(this.xml3d);
            var viewToWorldMatrix = view.getViewMatrix().inverse();
            var worldToTargetMatrix = this.targetTransformable.object.getWorldMatrix().inverse();
            var viewToTargetMatrix = viewToWorldMatrix.multiply(worldToTargetMatrix);

            // calculate signs
            var xAxisFactor = viewToTargetMatrix.multiplyDir(new XML3DVec3(-1, 0, 0)).x;
            var yAxisFactor = viewToTargetMatrix.multiplyDir(new XML3DVec3(0, 1, 0)).y;
            var zAxisFactor = viewToTargetMatrix.multiplyDir(new XML3DVec3(0, 0, 1)).z;
            var xAxisSign = this._getSignOfValue(xAxisFactor);
            var yAxisSign = this._getSignOfValue(yAxisFactor);
            var zAxisSign = this._getSignOfValue(zAxisFactor);

            // update axes
            this._rotationXAxis = new XML3DVec3(xAxisSign, 0, 0);
            this._rotationYAxis = new XML3DVec3(0, yAxisSign, 0);
            this._rotationZAxis = new XML3DVec3(0, 0, zAxisSign);
        },

        _getSignOfValue: function(value) {
            return (value < 0) ? -1 : 1;
        }
    });
}());
