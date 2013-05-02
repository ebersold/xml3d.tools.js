(function(){

    "use strict";

    XMOT.namespace("XMOT.interaction.widgets");

    /**
     * The TranslateBox places a semi-transparent cube around the target object. By
     * dragging the sides of that cube the target geometry gets translated along the
     * dragged plane.
     *
     * @extends XMOT.interaction.widgets.Widget
     */
    XMOT.interaction.widgets.TranslateBox = new XMOT.Class(
        XMOT.interaction.widgets.Widget, {

        GeometryType: XMOT.interaction.geometry.TranslateBox,

        /**
         *  @inheritDoc
         *  @this {XMOT.interaction.widgets.TranslateBox}
         *
         *  @param {{xyplane:XMOT.Constraint,yzplane:XMOT.Constraint,xzplane:XMOT.Constraint}} constraints
         *
         *  For each plane a constraint can be specified, that will be applied when
         *  updating the translations. The parameter itself as well as all properties
         *  are optional.
         */
        initialize: function(_id, _target, constraints)
        {
            this.callSuper(_id, _target);

            this._constraints = constraints || {};
        },

        // --------------------------------
        // -- Creation --
        // --------------------------------

        /**
         *  @this {XMOT.interaction.widgets.TranslateBox}
         *  @override
         *  @protected
         */
        onCreateBehavior: function()
        {
            this._addTransSensor("xytrans", this._constraints.xyplane);
            this._addTransSensor("xytrans_inv", this._constraints.xyplane);
            this._addTransSensor("yztrans", this._constraints.yzplane);
            this._addTransSensor("yztrans_inv", this._constraints.yzplane);
            this._addTransSensor("xztrans", this._constraints.xzplane);
            this._addTransSensor("xztrans_inv", this._constraints.xzplane);
        },

        // --------------------------------
        // -- Behavior --
        // --------------------------------
        /** Highlights the active plane by modifying the shader under the id localShaderID
         *
         *  @this {XMOT.interaction.widgets.TranslateBox}
         *  @private
         *
         *  @param {XMOT.interaction.behaviors.PDSensor} sensor
         */
        _onDragStart: function(sensor)
        {
            XMOT.util.shader(sensor.pickGroups[0],
                this.geometry.geo.defs["s_transl_highlight"]);
        },

        /** Removes the highlight of the active plane .
         *
         *  @this {XMOT.interaction.widgets.TranslateBox}
         *  @private
         *
         *  @param {XMOT.interaction.behaviors.PDSensor} sensor
         */
        _onDragEnd: function(sensor)
        {
            XMOT.util.shader(sensor.pickGroups[0],
                this.geometry.geo.defs["s_transl"]);
        },

        // --------------------------------
        // -- helpers --
        // --------------------------------
        /**
         *  @this {XMOT.interaction.widgets.TranslateBox}
         *  @private
         *
         *  @param {string} localID
         *  @param {XMOT.Constraint=} constraint
         */
        _addTransSensor: function(localID, constraint)
        {
            // create sensor
            var pickGrp = this.element(localID);
            var id = this.globalID(localID + "Sensor");

            var rootTransformable = XMOT.ClientMotionFactory.createTransformable(this.root.object, constraint);

            this.behavior[localID] = new XMOT.interaction.behaviors.Translater(
                id, [pickGrp], rootTransformable, pickGrp);

            // attach listeners
            this.behavior[localID].addListener("dragstart", this.callback("_onDragStart"));
            this.behavior[localID].addListener("dragend", this.callback("_onDragEnd"));
        }
    });
}());
