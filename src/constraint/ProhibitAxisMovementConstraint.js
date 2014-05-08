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

    "use strict";

    /**
     * ProhibitAxisMovementConstraint
     * prohibit axismovement, but allow movement around an epsilon of a specified center
     * @constructor
     * @implements {Constraint}
     */
    XML3D.tools.ProhibitAxisMovementConstraint = new XML3D.tools.Class({

        /**
         * @param {Boolean} x prohibit x axis
         * @param {Boolean} y prohibit y axis
         * @param {Boolean} z prohibit z axis
         * @param {number} epsilon
         * @param {number} center
         */
        initialize: function(x,y,z, epsilon, center){
            /**
             * prohibit x axis
             * @private
             * @type {Boolean}
             */
            this.x = x;
            /**
             * prohibit y axis
             * @private
             * @type {Boolean}
             */
            this.y = y;
            /**
             * prohibit z axis
             * @private
             * @type {Boolean}
             */
            this.z = z;
            /**
             * epsilon
             * @private
             * @type {number}
             */
            this.epsilon = epsilon ? epsilon : 0;
            /**
             * center
             * @private
             * @type {number}
             */
            this.center =  center ? center : 0;

        },

        /** @inheritDoc */
        constrainRotation: function(newRotation, opts){
            return true;
        },

        /** @inheritDoc */
        constrainTranslation: function(newPosition, opts){
            if(!opts || !opts.transformable)
                throw "ProhibitAxisMovementConstraint.constrainTranslation: no transformable in options given.";

            var center = this.center;
            var epsilon = this.epsilon;
            var currentPosition = opts.transformable.getPosition();

            if(this.x && Math.abs(center - newPosition.x) > epsilon) newPosition.x = currentPosition.x;
            if(this.y && Math.abs(center - newPosition.y) > epsilon) newPosition.y = currentPosition.y;
            if(this.z && Math.abs(center - newPosition.z) > epsilon) newPosition.z = currentPosition.z;

            return true;
        }
    });
}());
