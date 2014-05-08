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
/**
 * User: ebersold
 * Date: 10/24/12
 * Time: 2:06 PM
 */
init = function () {
    XML3D.tools.GamepadEventProvider.enable();

    //create connector
    var ls = document.getElementById("ls");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "LB" && e.detail.padID == 0) ls.innerHTML = "down";
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "LB" && e.detail.padID == 0) ls.innerHTML = "up";
    }, false);
    var rs = document.getElementById("rs");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "RB" && e.detail.padID == 0) rs.innerHTML = "down";
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "RB" && e.detail.padID == 0) rs.innerHTML = "up";
    }, false);
    var lt = document.getElementById("lt");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "LT" && e.detail.padID == 0) lt.innerHTML = "down - " + e.detail.value;
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "LT" && e.detail.padID == 0) lt.innerHTML = "up - " + e.detail.value;
    }, false);
    var rt = document.getElementById("rt");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "RT" && e.detail.padID == 0) rt.innerHTML = "down - " + e.detail.value;
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "RT" && e.detail.padID == 0) rt.innerHTML = "up - " + e.detail.value;
    }, false);
    var start = document.getElementById("start");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "Start" && e.detail.padID == 0) start.innerHTML = "down";
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "Start" && e.detail.padID == 0) start.innerHTML = "up";
    }, false);
    var back = document.getElementById("back");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "Back" && e.detail.padID == 0) back.innerHTML = "down"
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "Back" && e.detail.padID == 0) back.innerHTML = "up";
    }, false);
    var x = document.getElementById("x");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "X" && e.detail.padID == 0) x.innerHTML = "down";
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "X" && e.detail.padID == 0) x.innerHTML = "up";
    }, false);
    var y = document.getElementById("y");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "Y" && e.detail.padID == 0) y.innerHTML = "down"
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "Y" && e.detail.padID == 0) y.innerHTML = "up";
    }, false);
    var a = document.getElementById("a");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "A" && e.detail.padID == 0) a.innerHTML = "down";
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "A" && e.detail.padID == 0) a.innerHTML = "up";
    }, false);
    var b = document.getElementById("b");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "B" && e.detail.padID == 0) b.innerHTML = "down"
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "B" && e.detail.padID == 0) b.innerHTML = "up";
    }, false);
    var lsb = document.getElementById("lsb");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "LeftStickClick" && e.detail.padID == 0) lsb.innerHTML = "down";
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "LeftStickClick" && e.detail.padID == 0) lsb.innerHTML = "up";
    }, false);
    var rsb = document.getElementById("rsb");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "RightStickClick" && e.detail.padID == 0) rsb.innerHTML = "down"
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "RightStickClick" && e.detail.padID == 0) rsb.innerHTML = "up";
    }, false);
    var dpl = document.getElementById("dpl");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "Left" && e.detail.padID == 0) dpl.innerHTML = "down";
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "Left" && e.detail.padID == 0) dpl.innerHTML = "up";
    }, false);
    var dpr = document.getElementById("dpr");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "Right" && e.detail.padID == 0) dpr.innerHTML = "down"
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "Right" && e.detail.padID == 0) dpr.innerHTML = "up";
    }, false);
    var dpu = document.getElementById("dpu");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "Up" && e.detail.padID == 0) dpu.innerHTML = "down";
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "Up" && e.detail.padID == 0) dpu.innerHTML = "up";
    }, false);
    var dpd = document.getElementById("dpd");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "Down" && e.detail.padID == 0) dpd.innerHTML = "down"
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "Down" && e.detail.padID == 0) dpd.innerHTML = "up";
    }, false);
    var xl = document.getElementById("x-l");
    window.addEventListener("GamepadAxis", function (e) {
        if (e.detail.axis == "LeftStickX" && e.detail.padID == 0) xl.innerHTML = e.detail.value;
    }, false);
    var yl = document.getElementById("y-l");
    window.addEventListener("GamepadAxis", function (e) {
        if (e.detail.axis == "LeftStickY" && e.detail.padID == 0) yl.innerHTML = e.detail.value;
    }, false);
    var xr = document.getElementById("x-r");
    window.addEventListener("GamepadAxis", function (e) {
        if (e.detail.axis == "RightStickX" && e.detail.padID == 0) xr.innerHTML = e.detail.value;
    }, false);
    var yr = document.getElementById("y-r");
    window.addEventListener("GamepadAxis", function (e) {
        if (e.detail.axis == "RightStickY" && e.detail.padID == 0) yr.innerHTML = e.detail.value;
    }, false);

    var ls2 = document.getElementById("ls2");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "LB" && e.detail.padID == 1) ls2.innerHTML = "down";
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "LB" && e.detail.padID == 1) ls2.innerHTML = "up";
    }, false);
    var rs2 = document.getElementById("rs2");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "RB" && e.detail.padID == 1) rs2.innerHTML = "down";
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "RB" && e.detail.padID == 1) rs2.innerHTML = "up";
    }, false);
    var lt2 = document.getElementById("lt2");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "LT" && e.detail.padID == 1) lt2.innerHTML = "down - " + e.detail.value;
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "LT" && e.detail.padID == 1) lt2.innerHTML = "up - " + e.detail.value;
    }, false);
    var rt2 = document.getElementById("rt2");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "RT" && e.detail.padID == 1) rt2.innerHTML = "down - " + e.detail.value;
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "RT" && e.detail.padID == 1) rt2.innerHTML = "up - " + e.detail.value;
    }, false);
    var start2 = document.getElementById("start2");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "Start" && e.detail.padID == 1) start2.innerHTML = "down";
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "Start" && e.detail.padID == 1) start2.innerHTML = "up";
    }, false);
    var back2 = document.getElementById("back2");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "Back" && e.detail.padID == 1) back2.innerHTML = "down"
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "Back" && e.detail.padID == 1) back2.innerHTML = "up";
    }, false);
    var x2 = document.getElementById("x2");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "X" && e.detail.padID == 1) x2.innerHTML = "down";
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "X" && e.detail.padID == 1) x2.innerHTML = "up";
    }, false);
    var y2 = document.getElementById("y2");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "Y" && e.detail.padID == 1) y2.innerHTML = "down"
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "Y" && e.detail.padID == 1) y2.innerHTML = "up";
    }, false);
    var a2 = document.getElementById("a2");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "A" && e.detail.padID == 1) a2.innerHTML = "down";
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "A" && e.detail.padID == 1) a2.innerHTML = "up";
    }, false);
    var b2 = document.getElementById("b2");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "B" && e.detail.padID == 1) b2.innerHTML = "down"
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "B" && e.detail.padID == 1) b2.innerHTML = "up";
    }, false);
    var lsb2 = document.getElementById("lsb2");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "LeftStickClick" && e.detail.padID == 1) lsb2.innerHTML = "down";
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "LeftStickClick" && e.detail.padID == 1) lsb2.innerHTML = "up";
    }, false);
    var rsb2 = document.getElementById("rsb2");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "RightStickClick" && e.detail.padID == 1) rsb2.innerHTML = "down"
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "RightStickClick" && e.detail.padID == 1) rsb2.innerHTML = "up";
    }, false);
    var dpl2 = document.getElementById("dpl2");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "Left" && e.detail.padID == 1) dpl2.innerHTML = "down";
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "Left" && e.detail.padID == 1) dpl2.innerHTML = "up";
    }, false);
    var dpr2 = document.getElementById("dpr2");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "Right" && e.detail.padID == 1) dpr2.innerHTML = "down"
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "Right" && e.detail.padID == 1) dpr2.innerHTML = "up";
    }, false);
    var dpu2 = document.getElementById("dpu2");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "Up" && e.detail.padID == 1) dpu2.innerHTML = "down";
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "Up" && e.detail.padID == 1) dpu2.innerHTML = "up";
    }, false);
    var dpd2 = document.getElementById("dpd2");
    window.addEventListener("GamepadButtonDown", function (e) {
        if (e.detail.button == "Down" && e.detail.padID == 1) dpd2.innerHTML = "down"
    }, false);
    window.addEventListener("GamepadButtonUp", function (e) {
        if (e.detail.button == "Down" && e.detail.padID == 1) dpd2.innerHTML = "up";
    }, false);
    var xl2 = document.getElementById("x-l2");
    window.addEventListener("GamepadAxis", function (e) {
        if (e.detail.axis == "LeftStickX" && e.detail.padID == 1) xl2.innerHTML = e.detail.value;
    }, false);
    var yl2 = document.getElementById("y-l2");
    window.addEventListener("GamepadAxis", function (e) {
        if (e.detail.axis == "LeftStickY" && e.detail.padID == 1) yl2.innerHTML = e.detail.value;
    }, false);
    var xr2 = document.getElementById("x-r2");
    window.addEventListener("GamepadAxis", function (e) {
        if (e.detail.axis == "RightStickX" && e.detail.padID == 1) xr2.innerHTML = e.detail.value;
    }, false);
    var yr2 = document.getElementById("y-r2");
    window.addEventListener("GamepadAxis", function (e) {
        if (e.detail.axis == "RightStickY" && e.detail.padID == 1) yr2.innerHTML = e.detail.value;
    }, false);
}
