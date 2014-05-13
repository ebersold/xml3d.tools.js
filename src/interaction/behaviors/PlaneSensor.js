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

    /** A plane sensor is a pointing device sensor that maps the movement of
     *  the pointing device on a plane. Listeners can be registered for the
     *  event "translchanged", which is raised whenever the pointing
     *  device changed the position on that plane.
     *  In this case the translation property gives the translation since the
     *  start of dragging.
     *
     *  In addition a constraint can be specified to adjust the calculated translation.
     *
     *  One handy thing is the getCanonicalTranslation() method. No matter what the
     *  current plane origin or normal is, this returns the translation in the
     *  canonical [o: (0,0,0), d: (0,0,1)] plane. This comes in handy when
     *  you need to rely on two dimensions (often the case with mouse).
     *
     *  @extends XML3D.tools.interaction.behaviors.PDSensor
     */

    XML3D.tools.interaction.behaviors.PlaneSensor = new XML3D.tools.Class(
        XML3D.tools.interaction.behaviors.PDSensor,
    {
        /** Constructor of PlaneSensor
         *
         *  @this {XML3D.tools.interaction.behaviors.PlaneSensor}
         *
         *  @param {string} id the id of this sensor
         *  @param {Array.<Object>} grps the groups this sensor should look for
         *  @param {window.XML3DVec3|!Object=} planeOrient the group or vector the sensor takes to decide where the plane
         * 			normal should reside. If it's a group the local z=0 plane of the given group is taken.
         * 			If a vector is given, the vector directly is taken. If not specified a plane
         * 			parallel to the user's view is taken.
         *  @param {Object=} translationConstraint constraint that is applied to the final translation output
         *  @param {XML3D.tools.util.EventDispatcher=} eventDispatcher the object used to register events
         */
        initialize: function(id, grps, planeOrient, translationConstraint, eventDispatcher)
        {
            this.callSuper(id, grps, eventDispatcher);

            // the translation in the plane during a drag operation
            this.translation = new window.XML3DVec3(0,0,0);

            this._plane = new XML3D.tools.util.Plane(this.xml3d);
            this._plane.setOrientation(planeOrient);

            /** The translation constraint for constraining the final output value */
            if(translationConstraint !== undefined && translationConstraint !== null)
                this._translationConstraint = translationConstraint;
            else
                this._translationConstraint = new XML3D.tools.BoxedTranslationConstraint();

            // setup listeners
            this.addListenerTypes("translchanged");

            this.addListener("dragstart", this.callback("_onPlaneDragStart"));
            this.addListener("drag", this.callback("_onPlaneDrag"));
            this.addListener("dragend", this.callback("_onPlaneDragEnd"));
        },

        setPlaneOrientation: function(newPlaneOrientation)
        {
            this._plane.setOrientation(newPlaneOrientation);
        },

        /** retrieve the current translation value in the canonical
         *  direction (0,0,1) no matter what the current normal is.
         *
         *  In this method no constraints are applied!
         *
         *  @this {XML3D.tools.interaction.behaviors.PlaneSensor}
         *
         *  @return {XML3DVec3}
         */
        getCanonicalTranslation: function()
        {
            var rotToLocal = new XML3DRotation();
            rotToLocal.setRotation(this._plane.normal(), new XML3DVec3(0,0,1));
            var tp = rotToLocal.rotateVec3(this.translation);

            return tp;
        },

        // ========================================================================
        // --- Private ---
        // ========================================================================

        // --- Drag methods ---
        /** Callback for PDSensor's dragstart event
         *
         *  @this {XML3D.tools.interaction.behaviors.PlaneSensor}
         *  @private
         *
         *  @param {XML3D.tools.interaction.behaviors.PDSensor} sensor
         */
        _onPlaneDragStart: function(sensor)
        {
            this._plane.origin(sensor.curHitPoint);
            this._planeHitPoint = this._plane.origin();
        },

        /** Callback for PDSensor's drag event
         *
         *  @this {XML3D.tools.interaction.behaviors.PlaneSensor}
         *  @private
         *
         *  @param {XML3D.tools.interaction.behaviors.PDSensor} sensor
         */
        _onPlaneDrag: function(sensor)
        {
            var hitP = this._calcPlaneHitPoint();
            if(!hitP)
                return;
            this._planeHitPoint = hitP;

            this._calcTranslation();

            this.notifyListeners("translchanged", this);
        },

        /** Callback for PDSensor's dragend event
         *
         *  @this {XML3D.tools.interaction.behaviors.PlaneSensor}
         *  @private
         *
         *  @param {XML3D.tools.interaction.behaviors.PDSensor} sensor
         */
        _onPlaneDragEnd: function(sensor)
        {
        },

        /** Calculate the hit point on the sensor's plane.
         *
         *  @this {XML3D.tools.interaction.behaviors.PlaneSensor}
         *  @private
         *
         *  @return {XML3DVec3} the hit point or null in case no hit occured
         */
        _calcPlaneHitPoint: function()
        {
            // intersect ray with view plane norm
            var intersectHitP = new window.XML3DVec3();
            if(1 !== XML3D.tools.math.intersectRayPlane(this.pdPose,
                this._plane.origin(), this._plane.normal(), intersectHitP))
            {
                // either didnt hit or whole ray lies on plane
                // ignore it
                return null;
            }

            return intersectHitP;
        },

        /** Calculate translation based on the current _planeHitPoint
         *  and apply translation offset and constrain it. It will set
         *  the translation property of this instance.
         *
         *  @this {XML3D.tools.interaction.behaviors.PlaneSensor}
         *  @private
         */
        _calcTranslation: function()
        {
            var transl = this._planeHitPoint.subtract(this._plane.origin());
            if(this._translationConstraint.constrainTranslation(transl))
                this.translation.set(transl);
        }
    });
}());
