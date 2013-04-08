(function(){

    "use strict";

    /** This class will create an xml3d element on top of the given one.
     *  It will forward any mouse events that don't hit an xml3d element to the target
     *  element.
     *  Also it will mirror and track the target element's view.
     */
    XMOT.XML3DOverlay = new XMOT.Class(
        XMOT.util.Attachable, {

        /**
         *  @this {XMOT.XML3DOverlay}
         */
        initialize: function(targetXML3DElement)
        {
            this.xml3dTarget = targetXML3DElement;
            this.xml3d = this._createXML3DElement();

            this._mirroredView = new XMOT.interaction.behaviors.MirroredView(
                targetXML3DElement, this.xml3d);
        },

        /**
         *  @this {XMOT.XML3DOverlay}
         *  @override
         *  @protected
         */
        onAttach: function()
        {
            document.body.appendChild(this.xml3d);
            this._mirroredView.attach();
            this._registerEventListeners(true);
        },

        /**
         *  @this {XMOT.XML3DOverlay}
         *  @override
         *  @protected
         */
        onDetach: function()
        {
            this._registerEventListeners(false);

            this._mirroredView.detach();
            var canvas = this.xml3d.parentNode.previousSibling;

            document.body.removeChild(this.xml3d.parentNode);
            document.body.removeChild(canvas);
        },

        /**
         *  @this {XMOT.XML3DOverlay}
         *  @private
         */
        _createXML3DElement: function()
        {
            var targetWidth = this.xml3dTarget.offsetWidth;
            var targetHeight = this.xml3dTarget.offsetHeight;
            var targetOffset = this._calculateOffset(this.xml3dTarget);
            var zIndex = this._getTargetZIndex();

            var styleAttrib = "width:" + targetWidth + "px;height:" + targetHeight + "px;";
            styleAttrib += "background-color:transparent;";
            styleAttrib += "z-index:" + zIndex + ";";
            styleAttrib += "position:absolute;";
            styleAttrib += "top:" + targetOffset.top + "px;left:" + targetOffset.left + "px;";

            return XMOT.creation.element("xml3d", { style: styleAttrib });
        },

        /**
         *  @this {XMOT.XML3DOverlay}
         *  @private
         */
        _registerEventListeners: function(doAddListener)
        {
            var registerFn = this.xml3d.addEventListener.bind(this.xml3d);
            if(doAddListener === false)
                registerFn = this.xml3d.removeEventListener.bind(this.xml3d);

            registerFn("click", this.callback("_onOverlayMouseEvent"), false);
            registerFn("mousedown", this.callback("_onOverlayMouseEvent"), false);
            registerFn("mouseup", this.callback("_onOverlayMouseEvent"), false);
            registerFn("mouseover", this.callback("_onOverlayMouseEvent"), false);
            registerFn("mousemove", this.callback("_onOverlayMouseEvent"), false);
            registerFn("mouseout", this.callback("_onOverlayMouseEvent"), false);
        },

        /**
         *  @this {XMOT.XML3DOverlay}
         *  @private
         */
        _onOverlayMouseEvent: function(evt)
        {
            var posOverlay = XML3D.util.convertPageCoords(this.xml3d, evt.pageX, evt.pageY);
            var posTarget = XML3D.util.convertPageCoords(this.xml3dTarget, evt.pageX, evt.pageY);

            var elOverlay = this.xml3d.getElementByPoint(posOverlay.x, posOverlay.y);
            var elTarget = this.xml3dTarget.getElementByPoint(posTarget.x, posTarget.y);
            if(!elOverlay) {
                var newEvt = document.createEvent("MouseEvents");
                newEvt.initMouseEvent(evt.type, true, true, window, evt.detail, evt.screenX,
                    evt.screenY, evt.clientX, evt.clientY, evt.ctrlKey, evt.altKey, evt.shiftKey,
                    evt.metaKey, evt.button, null);

                if(elTarget) {
                    elTarget.dispatchEvent(newEvt);
                }
                else {
                    this.xml3dTarget.dispatchEvent(newEvt);
                }
            }
        },

        /**
         *  @this {XMOT.XML3DOverlay}
         *  @private
         */
        _getTargetZIndex: function()
        {
            var zIndex = this._getTargetStyleProperty("z-index");
            if(isNaN(zIndex))
                zIndex = 1;
            else
                zIndex++;

            return zIndex;
        },

        /**
         *  @this {XMOT.XML3DOverlay}
         *  @private
         */
        _getTargetStyleProperty: function(stylePropertyName)
        {
            if (this.xml3dTarget.currentStyle)
                return this.xml3dTarget.currentStyle[stylePropertyName];
            else if (window.getComputedStyle) {
                var computedStyle = document.defaultView.getComputedStyle(this.xml3dTarget,null);
                return computedStyle.getPropertyValue(stylePropertyName);
            }

            throw new Error("XMOT.XML3DOverlay: missing style property '" + stylePropertyName + "' of target element!");
        },

        /** Calculate the offset of the given element and return it.
         *
         *  @param {Object} element
         *  @return {{top:number, left:number}} the offset
         *
         *  This code is taken from http://javascript.info/tutorial/coordinates .
         *  We don't want to do it with the offsetParent way, because the xml3d
         *  element is actually invisible and thus offsetParent will return null
         *  at least in WebKit. Also it's slow. So we use getBoundingClientRect().
         *  However it returns the box relative to the window, not the document.
         *  Thus, we need to incorporate the scroll factor. And because IE is so
         *  awesome some workarounds have to be done and the code gets complicated.
         */
        _calculateOffset: function(element)
        {
            var box = element.getBoundingClientRect();
            var body = document.body;
            var docElem = document.documentElement;

            // get scroll factor (every browser except IE supports page offsets)
            var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
            var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

            // the document (`html` or `body`) can be shifted from left-upper corner in IE. Get the shift.
            var clientTop = docElem.clientTop || body.clientTop || 0;
            var clientLeft = docElem.clientLeft || body.clientLeft || 0;

            var top  = box.top +  scrollTop - clientTop;
            var left = box.left + scrollLeft - clientLeft;

            // for Firefox an additional rounding is sometimes required
            return {top: Math.round(top), left: Math.round(left)};
        }
    });

}());
