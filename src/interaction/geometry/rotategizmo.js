(function(){

    "use strict";

    XMOT.namespace("XMOT.interaction.geometry");

    /** The tree of this geometry looks like this:
     *  o graph root
     *      o widget container
     *          o xaxis
     *          o yaxis
     *          o zaxis
     *
     *  The axes can be retrieved by their name using getGeo().
     */
    XMOT.interaction.geometry.RotateGizmo = new XMOT.Class(
        XMOT.interaction.geometry.ViewedConstantSizeGeometry, {

        /**
         *  @this {XMOT.interaction.geometry.RotateGizmo}
         *  @param {XMOT.interaction.widgets.Widget} widget
         *  @param {Object=} options
         *
         *  options:
         *      o scale: a custom scale that should be applied to the geometry
         */
        initialize: function(widget, options)
        {
            if(!options)
                options = {};
            options = XMOT.extend({}, options);

            var customScale = new XML3DVec3(0.05, 0.05, 0.05);
            if(!options.scale)
                options.scale = customScale;
            else
                options.scale = options.scale.multiply(customScale);

            this.callSuper(widget, options);
        },

        /**
         *  @this {XMOT.interaction.geometry.RotateGizmo}
         *  @override
         *  @protected
         */
        onCreateDefsElements: function()
        {
            this.callSuper();

            this._createAxisDefsElements("xaxis", "0 0.8 0", "0 1 0 -1.57", 1);
            this._createAxisDefsElements("yaxis", "0.8 0 0", "1 0 0 1.57", 1.01);
            this._createAxisDefsElements("zaxis", "0 0 0.8", "0 0 1 0", 1.02);
        },

        /**
         *  @this {XMOT.interaction.geometry.RotateGizmo}
         *  @override
         *  @protected
         */
        onCreateGraph: function()
        {
            this.callSuper();

            this.setGeo("xaxis", this._createAxisGroup("xaxis"));
            this.setGeo("yaxis", this._createAxisGroup("yaxis"));
            this.setGeo("zaxis", this._createAxisGroup("zaxis"));

            this.geo.addToGraphRoot([
                this.getGeo("xaxis"),
                this.getGeo("yaxis"),
                this.getGeo("zaxis")
            ]);
        },

        /**
         *  @this {XMOT.interaction.geometry.RotateGizmo}
         *  @private
         *
         *  @param {string} id
         *  @param {string} color
         *  @param {string=} rotation
         */
        _createAxisDefsElements: function(id, color, rotation, scaleFactor)
        {
            var scaleVec = new XML3DVec3(1, 1, 0.075);
            scaleVec = scaleVec.scale(scaleFactor);

            this.geo.addTransforms("t_" + id, {
                scale: scaleVec.str(),
                rotation: rotation
            });

            this.geo.addShaders("s_" + id, {
                shaderType: "urn:xml3d:shader:eyelight",
                diffuseColor: color,
                ambientIntensity: "0.3",
                transparency: "0.5"
            });
        },

        /**
         *  @this {XMOT.interaction.geometry.RotateGizmo}
         *  @private
         *
         *  @param {string} id
         */
        _createAxisGroup: function(id)
        {
            return XMOT.creation.element("group", {
                transform: "#" + this.geo.globalID("t_" + id),
                shader: "#" + this.geo.globalID("s_" + id),
                children: [
                    XMOT.creation.cylinder(this.geo.xml3d)
                ]
            });
        }
    });
}());
