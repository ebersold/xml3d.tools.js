(function(){

    "use strict";

    XMOT.namespace("XMOT.interaction.behaviors");

    /** A GroupMirror mirrors a given group in an own overlay.
     *  It creates the overlay and sets up a MirroredWidgetTarget.
     */
    XMOT.interaction.behaviors.GroupMirror = new XMOT.Class(
        XMOT.util.Attachable, {

        /**
         *  @this {XMOT.interaction.behaviors.GroupMirror}
         *  @param {string} _id
         *  @param {XMOT.Transformable} _target
         */
        initialize: function(_id, _target)
        {
            this._realTarget = _target;

            // overlay
            var xml3dTarget = XMOT.util.getXml3dRoot(_target.object);
            this._xml3dOverlay = new XMOT.XML3DOverlay(xml3dTarget);
            this._xml3dOverlay.attach();

            // mirror the target node
            this._mirroredTarget = new XMOT.interaction.behaviors.MirroredWidgetTarget(
                _id, this._xml3dOverlay, _target);
        },

        onAttach: function()
        {
            this._xml3dOverlay.attach();
            this._mirroredTarget.attach();
        },

        onDetach: function()
        {
            this._mirroredTarget.detach();
            this._xml3dOverlay.detach();
        },

        /**
         *  @this {XMOT.interaction.behaviors.GroupMirror}
         *  @return {XMOT.XML3DOverlay}
         */
        overlay: function()
        {
            return this._xml3dOverlay;
        },

        /**
         *  @this {XMOT.interaction.behaviors.GroupMirror}
         *  @return {XMOT.Transformable} the target node that is mirrored
         */
        target: function()
        {
            return this._realTarget;
        },

        /** Returns a transformable for the mirrored target node with
         *  the given constraint.
         *
         *  @this {XMOT.interaction.behaviors.GroupMirror}
         *  @param {function(XML3DVec3,Object):boolean=} constraint
         *  @return {XMOT.Transformable}
         */
        mirroredTarget: function(constraint)
        {
            return XMOT.ClientMotionFactory.createTransformable(
                this._mirroredTarget.getNode(), constraint);
        }
    });
}());
