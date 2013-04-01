/**
 * Tracks the active view of the given xml3d tag for changes and invokes the given
 * callback when a change happened.
 *
 * @param {!Object} targetXml3dElement the xml3d section whose active view is to be tracked
 * @param {function(viewTracker:!Object,evt:!Event)=} onXfmChanged the callback to be invoked
 */
XMOT.ViewTracker = new XMOT.Class({

    /** @this {XMOT.ViewTracker} */
    initialize: function(targetXml3dElement, onXfmChanged)
    {
        if(onXfmChanged)
            this.xfmChanged = onXfmChanged;

        /** @private */
        this._currentViewElement = null;

        /** @private */
        this._xml3d = targetXml3dElement;
        if(!this._xml3d)
            throw "ViewTracker: given xml3d node not given";

        /** the TransformTracker used to track changes in the active view element
         *  @private
         */
        this._xfmObs = null;
        /** @private */
        this._attached = false;
    },

    /** Event handler to be overriden by the user
     *
     *  @this {XMOT.ViewTracker}
     *  @param {Object} viewTracker this instance
     *  @param {Object} evt the original DOM event that caused the change
     */
    xfmChanged: function(viewTracker, evt) { },

    /** @this {XMOT.ViewTracker} */
    attach: function()
    {
        if(!this._attached)
        {
            this._xml3d.addEventListener("DOMAttrModified",
                this.callback("_onXml3DAttrModified"), false);

            this._currentViewElement = XML3D.util.getOrCreateActiveView(this._xml3d);

            if(this._xfmObs)
                this._xfmObs.detach();
            this._xfmObs = new XMOT.TransformTracker(this._currentViewElement);
            this._xfmObs.xfmChanged = this.callback("_onXfmChanged");
            this._xfmObs.attach();

            this._attached = true;
        }
    },

    /** @this {XMOT.ViewTracker} */
    detach: function()
    {
        if(this._attached)
        {
            this._xfmObs.detach();
            this._xml3d.removeEventListener("DOMAttrModified",
                this.callback("_onXml3DAttrModified"), false);

            this._attached = false;
        }
    },

    /** @this {XMOT.ViewTracker} */
    getCurrentView: function()
    {
        return this._currentViewElement;
    },

    /**
     *  @private
     *  @this {XMOT.ViewTracker}
     */
    _onXml3DAttrModified: function(evt)
    {
        if(evt.attrName !== "activeView")
            return;

        this.detach();
        this.attach();
    },

    /**
     *  @private
     *  @this {XMOT.ViewTracker}
     */
    _onXfmChanged: function(targetNode, evt)
    {
        if(this.xfmChanged)
            this.xfmChanged(this, evt);
    }
});
