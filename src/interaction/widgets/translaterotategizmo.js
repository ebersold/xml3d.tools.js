(function(){

    "use strict";

    XMOT.namespace("XMOT.interaction.widgets");

    /**
     *  A TranslateRotateGizmo simply combines TranslateGizmo and RotateGizmo.
     *
     *  @extends XMOT.interaction.widgets.OverlayWidget
     */
    XMOT.interaction.widgets.TranslateRotateGizmo = new XMOT.Class(
        XMOT.interaction.widgets.OverlayWidget, {

        /**
         *  @this {XMOT.interaction.widgets.TranslateRotateGizmo}
         *  @override
         *  @protected
         */
        onCreateBehavior: function()
        {
            var options = {
                mirror: this.mirror(),
                geometry: {scale: new XML3DVec3(0.08,0.08,0.08)}
            };

            this.behavior["translater"] = new XMOT.interaction.widgets.TranslateGizmo(
                this.globalID("translater"), options);
            this.behavior["translater"].attach();

            this.behavior["rotater"] = new XMOT.interaction.widgets.RotateGizmo(
                this.globalID("rotater"), options);
            this.behavior["rotater"].attach();
        }
    });
}());
