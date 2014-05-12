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
(function(){

    /**
     *  @constructor
     *  @extends {XML3D.tools.DefaultConstraint}
     */
    XML3D.tools.AlongSurfaceTranslationConstraint = new XML3D.tools.Class(
        XML3D.tools.DefaultConstraint,
    {
        initialize: function(targetTransformable)
        {
            this._target = targetTransformable;
            XML3D.tools.util.fireWhenMeshesLoaded(this._target.object, this._initWhenTargetReady.bind(this));
        },

        _initWhenTargetReady: function()
        {
            this._oldPosition = null;
            this._translationDirection = new XML3DVec3(0, 0, 1);
            this._rayDirection = new XML3DVec3(0, -1, 0);
            this._initialHeight = this._target.getPosition().y;

            var bbox = XML3D.tools.util.getWorldBBox(this._target.object);
            var bboxSize = bbox.size();

            // take bbox half of diagonal of xz-plane as radius
            // xz-plane: gonna translate along that plane only
            this._boundingSphereRadius = Math.sqrt(bboxSize.x*bboxSize.x + bboxSize.z*bboxSize.z) / 2;
            this._targetHalfHeight = bboxSize.y/2;
        },

        /** @inheritDoc */
        constrainTranslation: function(newPosition, opts)
        {
            if(!opts.transformable)
            {
                console.log("AlongSurfaceTranslationConstraint: no transformable given. Won't apply any constraint.");
                return true;
            }

            var surfaceHeight = this._getSurfaceHeight();
            if(surfaceHeight === null)
                return true;

            newPosition.y = this._initialHeight + surfaceHeight;
            this._updateTranslationDirection(newPosition);

            return true;
        },

        _getSurfaceHeight: function()
        {
            var rayOrigin = this._getRayOrigin();
            var ray = new XML3DRay(rayOrigin, this._rayDirection);
            var hitPoint = new XML3DVec3();

            var hitElement = xml3d.getElementByRay(ray, hitPoint);
            if(!hitElement)
                return null;

            if(!this._target.object.parentNode.getWorldMatrix)
                return hitPoint.y;

            // transform hit point from world to local space
            var worldToLocalMatrix = this._target.object.parentNode.getWorldMatrix().inverse();
            hitPoint = worldToLocalMatrix.multiplyPt(hitPoint);
            return hitPoint.y;
        },

        _getRayOrigin: function()
        {
            // offset the origin to be outside the target in the translation direction
            var rayOriginOffset = this._translationDirection.scale(this._boundingSphereRadius + 0.5);
            // place it at height of the model to be sure to be above the surface
            rayOriginOffset.y += this._targetHalfHeight; // added to target center, so half height

            // add the offset to the position of the target
            var objectCenter = XML3D.tools.util.getWorldBBox(this._target.object).center();
            return objectCenter.add(rayOriginOffset);
        },

        _updateTranslationDirection: function(newPosition)
        {
            if(!this._oldPosition)
            {
                this._oldPosition = new XML3DVec3(newPosition);
                return;
            }

            var localDirection = newPosition.subtract(this._oldPosition);
            var localToWorldMatrix = this._target.object.getWorldMatrix();
            this._translationDirection = localToWorldMatrix.multiplyDir(localDirection);
            this._translationDirection = this._translationDirection.normalize();
        }
    });
}());
