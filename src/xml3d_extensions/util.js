/** This file contains miscellaneous utilities, that are added to the XML3D.util namespace. 
 */
(function() {
    
    var u = {};   
    
    /** Extend the target object with all attributes from the source object
     * 
     *  @param tarobj the object to be extended 
     *  @param srcobj the object from which to take the attributes 
     */
    function extend(tarobj, srcobj)
    { 
        for(var attr in srcobj)
            tarobj[attr] = srcobj[attr]; 
    }
    
    /** 
     * Can be used to wrap the given method into a closure that preserves the 
     * this pointer inside the given function. Internally an object 
     * __callbacks will be attached to the given object. This way several calls 
     * to this function with the same function will return the same wrapper. 
     * This is needed to successfully unregister callbacks again. 
     * 
     * @param {!Object} obj the object on which to call the method f 
     * @param {!function()} fn the method to be wrapped  
     * 
     * @return {function()} the wrapped function 
     */    
    u.wrapCallback = function(obj, fn)
    {
        
        if(!obj.__callbacks)
            obj.__callbacks = {};
        
        if(!obj.__callbacks[fn])
        {
            var method = fn;
            var self = obj; 
            
            obj.__callbacks[fn] = function() { 
                return method.apply(self, arguments); 
            };
        }
        
        return obj.__callbacks[fn]; 
    };
    
    /** 
     * Retrieve the world bounding box of a given node
     * 
     * @param {!Object} node 
     * @return {XML3DBox} 
     */
    u.getWorldBBox = function(node)
    {
        if(!node.getBoundingBox)
            return new window.XML3DBox(); 
        
        var bbox = node.getBoundingBox(); 
        
        if(node.parentNode.getWorldMatrix)
        {
            var parentGlobMat = node.parentNode.getWorldMatrix();        
            bbox.transform(parentGlobMat);
        }
        
        return bbox; 
    };
    
    /** 
     * Retrieve the bounding box of the children of a given node. 
     * 
     * @param {!Object} node
     * @return {XML3DBox} 
     */
    u.getChildrenBBox = function(node)
    {
        var bbox = new window.XML3DBox(); 
             
        var curChild = node.firstChild; 
        while(curChild)
        {
            if(curChild.getBoundingBox)
                bbox.extend(curChild.getBoundingBox());
            
            curChild = curChild.nextSibling; 
        }
        
        return bbox; 
    };
    
    /** Returns the xml3d element in which the given element is contained.
     * If none is found, null is returned. 
     * 
     * @param {!Object} el
     * @return {Object} 
     */
    u.getXml3dElement = function(el)
    {
        if(el.tagName == "xml3d")
            return el; 
        
        if(el.parentNode)
            return XML3D.util.getXml3dElement(el.parentNode); 
        
        return null; 
    }; 
    
    /** Internal helper method. Gets and/or sets a reference pointed to by attrName 
     *  of the element el. For more information see XML3D.util.transform() 
     *  or XML3D.util.shader().  
     *  
     *  @param {!Object} el
     *  @param {!string} attrName
     *  @param {Object} newRefNode 
     *  
     *  @return {Object} 
     */
    function getOrSetRefNode(el, attrName, newRefNode)
    {        
        var oldRefNode = null; 

        var oldRef = el.getAttribute(attrName); 
        if(oldRef && oldRef.length > 0)
            oldRefNode = XML3D.URIResolver.resolveLocal(oldRef);
            
        if(newRefNode)
        {
            var newRef = newRefNode.getAttribute("id"); 
            if(newRef && newRef.length > 0)
            {                
                newRef = "#" + newRef;               
                el.setAttribute(attrName, newRef);                
            }             
        }
        
        return oldRefNode;       
    }; 
    
    /** 
     * Retrieve or set the transform node of a given group node. 
     * 
     * @param {!Object} grp the desired group node
     * @param {Object} xfm (optional) the transform element to which grp's 
     *  transform attribute should be set. The transform has to have an 
     *  id attribute.  
     * 
     * @return {Object} if one argument is given, it returns the current transform
     *  element of el. If two arguments are given, it returns the transform element set 
     *  before it was overridden by xfm.
     */
    u.transform = function(grp, xfm)
    {
        if(grp.tagName !== "group")
            throw "XML3D.util.transform(): given element is not a group."; 
        
        return getOrSetRefNode(grp, "transform", xfm);
    }; 
    
    /** Retrieve or set the shader of the given group node. 
     * 
     * @param {!Object} grp the group of which to retrieve the shader. 
     * @param {Object} sh (optional) the shader element to which el's shader 
     *  attribute should be set. The shader has to have an id attribute. 
     *  
     * @return {Object} if one argument is given, it returns the current shader of el. If 
     *  two arguments are given, it returns the shader set before it was overridden by sh. 
     */
    u.shader = function(grp, sh)
    {
        if(grp.tagName !== "group")
            throw "XML3D.util.shader(): given element is not a group.";  
        
        return getOrSetRefNode(grp, "shader", sh);
    };
    
    /** 
     * Returns the first defs element of the given xml3d element. If none exists, 
     * a corresponding element is created, appended to xml3d and returned. 
     * 
     * @param {!Object} xml3d the xml3d element of which to return the defs element
     * 
     * @return {Object} the first defs element of the given xml3d element 
     */
    u.getOrCreateDefsElement = function(xml3d)
    {
        var defs = XML3D.util.evaluateXPathExpr(
                xml3d, './/xml3d:defs[1]').singleNodeValue;
        
        if(!defs)
        {
            defs = XML3D.createElement("defs"); 
            xml3d.appendChild(defs);  
        }
        
        return defs; 
    }; 

    // export
    if(!XML3D.util) 
        XML3D.util = {}; 
    
    XML3D.util.extend = extend; 
    
    extend(XML3D.util, u);
}());
