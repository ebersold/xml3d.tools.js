(function() {    
    /** 
     * For the given node calls the handler method xfmChanged() when 
     * the global transformation changed. This is the case if the transform 
     * attribute of the target node or of one of the parent nodes changed. 
     * Since transform attributes point to transform elements the transformation of 
     * the target node also changes if corresponding transform elements are modified.  
     * 
     * This observer tracks only these changes, though. It does not track whether some local fields 
     * of the target node change since it does not know which there might be. 
     * 
     * The observer registers itself as listener in all parent nodes that have a transform attribute 
     * to find out when changes to that attribute happen. 
     * 
     * @constructor
     * @param {!Object} _targetNode the node to track
     */
    var TransformTracker = function(_targetNode)
    {          
        if(!_targetNode)
            throw "TransformTracker: no target node specified.";
        
        this.xml3d = XML3D.util.getXml3dElement(_targetNode);
        if(!this.xml3d)
            throw "TransformTracker: given node is not a child of an xml3d element."; 
        
        this.targetNode = _targetNode; 
        this._attached = false; 
        
        this.attach(); 
    }; 
    
    var p = TransformTracker.prototype;
    
    /** Event handler to be overriden by the user
     * 
     * @param {!Object} targetNode the node this observer tracks
     * @param {!Event} evt the original DOM event that caused the change
     */
    p.xfmChanged = function(targetNode, evt) { }; 

    /** 
     * Register callbacks in the given node and all parent nodes. 
     * 
     * @this {TransformTracker} 
     * @param {!Object} [node] (internal) the node to register. If not given the 
     *  target node is taken. 
     */
    p.attach = function(node)
    { 
        if(!this._attached)
        {
            if(!node)
                node = this.targetNode; 
            
            if(node.tagName == "xml3d")
                return; 
            
            if(node.tagName == "group")
            {
                node.addEventListener("DOMAttrModified", 
                    XML3D.util.wrapCallback(this, _onGrpAttrModified), false);
                
                var xfm = XML3D.util.transform(node); 
                if(xfm)
                    xfm.addEventListener("DOMAttrModified", 
                        XML3D.util.wrapCallback(this, _onXfmAttrModified), false);
            }
            else if(node.tagName == "view")
            {
                node.addEventListener("DOMAttrModified", 
                    XML3D.util.wrapCallback(this, _onViewAttrModified), false);
            }
            
            this.attach(node.parentNode); 
            
            this._attached = true; 
        }
    };

    /** 
     * Deregister callbacks in the given node and all parent nodes. 
     * 
     * @this {TransformTracker} 
     * @param {Object} node (internal) the node to register. If not given the 
     *  target node is taken. 
     */
    p.detach = function(node)
    { 
        if(this._attached)
        {
            if(!node)
                node = this.targetNode; 
            
            if(node.tagName == "xml3d")
                return; 
            
            if(node.tagName == "group")
            {
                node.removeEventListener("DOMAttrModified", 
                    XML3D.util.wrapCallback(this, _onGrpAttrModified), false);
            
                var xfm = XML3D.util.transform(node);
                if(xfm)
                    node.removeEventListener("DOMAttrModified", 
                        XML3D.util.wrapCallback(this, _onXfmAttrModified), false);
            }
            else if(node.tagName == "view")
            {
                node.removeEventListener("DOMAttrModified", 
                    XML3D.util.wrapCallback(this, _onViewAttrModified), false);
            }
            
            this.detach(node.parentNode);
            
            this._attached = false; 
        }
    };
       
    function _onGrpAttrModified(evt)
    {   
        if(evt.attrName !== "transform")
            return;
        
        this.xfmChanged(this.targetNode, evt);
    };
    
    function _onViewAttrModified(evt)
    {
        if(evt.attrName !== "position"
        && evt.attrName !== "orientation")
            return; 
        
        this.xfmChanged(this.targetNode, evt); 
    }; 
    
    function _onXfmAttrModified(evt)
    {
        this.xfmChanged(this.targetNode, evt); 
    };

    // export 
    XMOT.TransformTracker = TransformTracker; 
}()); 

