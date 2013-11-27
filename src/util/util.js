/**
 * This file constructs the XMOT.util namespace and adds miscellaneous utilities.
 */
(function() {

    "use strict";

    XMOT.namespace("XMOT.util");

    var u = XMOT.util;

    /**
     * Returns whether the object is actually given as argument. If it is it has
     * to be not undefined and not null.
     *
     * @param {Object=} obj
     * @return {boolean} true if the object is actually defined
     */
    u.isDefined = function(obj)
    {
        return (obj !== undefined && obj !== null);
    };

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

    u.getLocalBBox = function(node)
    {
        if(!node.getBoundingBox)
            return new window.XML3DBox();
        var bbox = node.getBoundingBox();

        if(node.parentNode.getWorldMatrix)
        {
            var parentGlobMat = node.parentNode.getWorldMatrix();
            var invParentGlobMat = parentGlobMat.inverse();
            bbox.transform(invParentGlobMat);
        }

        return bbox;
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

        return node.getBoundingBox();
    };

    /**
     * Returns the given node's parent world matrix. If no parent is present
     * or doesn't have a getWorldMatrix() method the identity matrix is returned.
     *
     * @param {Object} node
     * @return {window.XML3DMatrix}
     */
    u.getParentWorldMatrix = function(node)
    {
        if(!XMOT.util.isDefined(node.parentNode)
        || !XMOT.util.isDefined(node.parentNode.getWorldMatrix))
            return new window.XML3DMatrix();

        return node.parentNode.getWorldMatrix();
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

    /**
     *  Clamps the given value to lie within [min,max].
     *
     *  @param {number} value
     *  @param {number} min
     *  @param {number} max
     *  @return {number}
     */
    u.clamp = function(value, min, max)
    {
        return Math.min(max, Math.max(min, value));
    };

    /**
     * A shader is actually a node with a number of children, each of which defines
     * an attribute 'name' and has a TextNode child. This method searches for the child
     * of the given element, that has the 'name' attribute with the given name, replaces the
     * TextNode content with the given value and returns the old value.
     *
     * @param shaderElement
     * @param attributeName
     * @param attributeValue
     * @return {string} the old value of the shader attribute
     */
    u.setShaderAttribute = function(shaderElement, attributeName, attributeValue)
    {
        for(var i = 0; i < shaderElement.childNodes.length; i++)
        {
            var node = shaderElement.childNodes[i];
            if(node.name === attributeName)
            {
                var oldValue = node.childNodes[0].nodeValue;
                node.childNodes[0].nodeValue = attributeValue;
                return oldValue;
            }
        }

        throw new Error("Given attribute is not defined: " + attributeName);
    };
}());


