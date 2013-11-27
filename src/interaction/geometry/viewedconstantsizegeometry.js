(function(){

    "use strict";

    XMOT.namespace("XMOT.interaction.geometry");

    /**
     */
    XMOT.interaction.geometry.ViewedConstantSizeGeometry = new XMOT.Class(
        XMOT.interaction.geometry.Geometry, {

        /**
         *  @this {XMOT.interaction.geometry.ViewedConstantSizeGeometry}
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

            this.callSuper(widget);

            if(options.scale)
                this._customWidgetScale = new XML3DVec3(options.scale);
            else
                this._customWidgetScale = new XML3DVec3(1, 1, 1);
            this._initialRootScaling = new XML3DVec3(1,1,1);
        },

        /**
         *  @this {XMOT.interaction.geometry.ViewedConstantSizeGeometry}
         *  @protected
         */
        onCreateGraph: function()
        {
            this.callSuper();

            var xfmable = this.geo.getGraphRootTransformable();
            this._initialRootScaling.set(xfmable.getScale().multiply(this._customWidgetScale));
            xfmable.setScale(this._initialRootScaling);
        },

        /** @inheritDoc */
        onViewXfmChanged: function() {

            this.callSuper();
            this._adaptWidgetScaleToViewPose();
        },

        /** This is called when the target transformation changes.
         *
         *  @this {XMOT.interaction.geometry.Geometry}
         *  @protected
         */
        onTargetXfmChanged: function() {

            this.callSuper();
            this._adaptWidgetScaleToViewPose();
        },

        /**
         *  @this {XMOT.interaction.geometry.ViewedConstantSizeGeometry}
         *  @private
         */
        _adaptWidgetScaleToViewPose: function() {

            var rootViewDist = this._getWidgetViewDistance();
            var rootViewScaling = new XML3DVec3(rootViewDist, rootViewDist, rootViewDist);
            var absoluteRootViewScaling = rootViewScaling.multiply(
                this._getWidgetParentInverseScaling());
            var finalRootScale = this._initialRootScaling.multiply(absoluteRootViewScaling);
            this.geo.getGraphRootTransformable().setScale(finalRootScale);
        },

        /**
         *  @this {XMOT.interaction.geometry.ViewedConstantSizeGeometry}
         *  @private
         *  @return {number} distance between the widget's root node and the view
         */
        _getWidgetViewDistance: function() {

            var curView = XML3D.util.getOrCreateActiveView(this.widget.xml3d);;
            var viewPos = curView.getWorldMatrix().translation();

            var rootPos = this.geo.getGraphRoot().getWorldMatrix().translation();
            return rootPos.subtract(viewPos).length();
        },

        /**
         *  @this {XMOT.interaction.geometry.ViewedConstantSizeGeometry}
         *  @private
         *  @return {window.XML3DVec3} world-to-local scaling vector of the widget's parent node
         */
        _getWidgetParentInverseScaling: function() {
            var scale = parentWorldMatrix.scaling();
            return new XML3DVec3(1/scale.x, 1/scale.y, 1/scale.z);
        }
    });
}());
