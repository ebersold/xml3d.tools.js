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
(function() {

    "use strict";

    /**
     * Tracks the active view of the given xml3d tag for changes and invokes the given
     * callback when a change happened.
     *
     * @param {!Object} targetXml3dElement the xml3d section whose active view is to be tracked
     * @param {function(viewTracker:!Object,evt:!Event)=} onXfmChanged the callback to be invoked
     */
    XML3D.tools.ViewTracker = new XML3D.tools.Class({

        /** @this {XML3D.tools.ViewTracker} */
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
         *  @this {XML3D.tools.ViewTracker}
         *  @param {Object} viewTracker this instance
         *  @param {Object} evt the original DOM event that caused the change
         */
        xfmChanged: function(viewTracker, evt) { },

        /** @this {XML3D.tools.ViewTracker} */
        attach: function()
        {
            if(!this._attached)
            {
                this._xml3d.addEventListener("DOMAttrModified",
                    this.callback("_onXml3DAttrModified"), false);

                this._currentViewElement = XML3D.util.getOrCreateActiveView(this._xml3d);

                if(this._xfmObs)
                    this._xfmObs.detach();
                this._xfmObs = new XML3D.tools.TransformTracker(this._currentViewElement);
                this._xfmObs.xfmChanged = this.callback("_onXfmChanged");
                this._xfmObs.attach();

                this._onXfmChanged();
                this._attached = true;
            }
        },

        /** @this {XML3D.tools.ViewTracker} */
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

        /** @this {XML3D.tools.ViewTracker} */
        getCurrentView: function()
        {
            return this._currentViewElement;
        },

        /**
         *  @private
         *  @this {XML3D.tools.ViewTracker}
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
         *  @this {XML3D.tools.ViewTracker}
         */
        _onXfmChanged: function(targetNode, evt)
        {
            if(this.xfmChanged)
                this.xfmChanged(this, evt);
        }
    });
}());
