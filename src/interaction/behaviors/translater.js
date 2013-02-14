
XMOT.namespace("XMOT.interaction.behaviors");

/** Translater is a plane sensor that maps the translation output of that sensor
 *  directly to the given group transform's translation attribute.
 *
 *  @extends XMOT.interaction.behaviors.PlaneSensor
 */
XMOT.interaction.behaviors.Translater = new XMOT.Class(
        XMOT.interaction.behaviors.PlaneSensor,
{
    /** Constructor of Translater
     *
     *  @this {XMOT.interaction.behaviors.Translater}
     *
     *  @param {string} id the id of this sensor
     *  @param {Array.<Object>} pickGrps the group this sensor should look for
     *  @param {XMOT.Transformable} targetTransformable the movable this sensor will modify.
     *                 If not given, a Movable will be created from the first element of pickGrps
     *  @param {XML3DVec3|!Object} [planeOrient] the group or vector the sensor takes to decide where the plane
     *             normal should reside. If it's a group the local z=0 plane of the given group is taken.
     *             If a vector is given, the vector directly is taken. If not specified a plane
     *             parallel to the user's view is taken.
     */
    initialize: function(id, pickGrps, targetTransformable, planeOrient)
    {

        if(!targetTransformable)
            targetTransformable = XMOT.ClientMotionFactory.createTransformable(pickGrps[0]);

        this.targetTransformable = targetTransformable;

        // take local matrix as initial offset
        // we manipulate the transform node of the group, so take the local one
        this._translationOffset = new window.XML3DVec3(this.targetTransformable.transform.translation);

        this.callSuper(id, pickGrps, planeOrient);

        this.addListener("dragstart", this.callback("_onTransPlaneDragStart"));
        this.addListener("translchanged", this.callback("_onTranslChanged"));
    },


    // ========================================================================
    // --- Private ---
    // ========================================================================

    /**
     *  @this {XMOT.interaction.behaviors.Translater}
     *  @private
     *
     *  @param {XMOT.interaction.behaviors.Translater} sensor
     */
    _onTransPlaneDragStart: function(sensor)
    {
        this._translationOffset.set(this.targetTransformable.transform.translation);
    },

    /**
     *  @this {XMOT.interaction.behaviors.Translater}
     *  @private
     *
     *  @param {XMOT.interaction.behaviors.Translater} sensor
     */
    _onTranslChanged: function(sensor)
    {
        var localTranslation = this._transformPtToTargetLocalSpace(this.translation);

        var finalTransl = this._translationOffset.add(localTranslation);
        this.targetTransformable.setPosition(finalTransl);
    },

    _transformPtToTargetLocalSpace: function(vec)
    {
        var invParentMatrix = this.targetTransformable.object.parentNode.getWorldMatrix().inverse();
        return invParentMatrix.multiplyPt(vec, 1);
    }
});
