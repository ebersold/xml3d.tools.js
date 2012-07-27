muh = 0;
moveable = undefined;
function initMoveable(){
	var cube = document.getElementById("cube");
	var factory = new XMOT.ClientMotionFactory;
	var constraint = new XMOT.CollisionConstraint(5.0, 5.0, "collision.png");
	moveable = factory.createMoveable(cube, constraint);
};

function rotateCube()
{
	document.getElementById("notification").innerHTML = "Rotating the Cube ...";
	if(muh%2)
		moveable.setOrientation([0.0, 1.0, 0.0, 0.5]);
	else
		moveable.setOrientation([0.0, 1.0, 0.0, 0.25]);
	muh++;
	document.getElementById("notification").innerHTML = "Rotated the Cube ...";
};

function moveCube()
{
	document.getElementById("notification").innerHTML = "Moving the Cube ...";
	if(muh%2)
		moveable.setPosition([1.0, 0.0, 1.0]);
	else
		moveable.setPosition([2.0, 0.0, 2.0]);
	muh++;
	document.getElementById("notification").innerHTML = "Moved the Cube ...";
};

function translateCube()
{
	document.getElementById("notification").innerHTML = "Translating the Cube ...";
	if(muh%2)
		moveable.translate([1.0, 0.0, 1.0]);
	else
		moveable.translate([-2.0, 0.0, -2.0]);
	muh++;
	document.getElementById("notification").innerHTML = "Translated the Cube ...";
};

function moveCubeTo()
{
	document.getElementById("notification").innerHTML = "Moving the Cube To ...";
	moveable.moveTo([1.0, 0.0, 1.0], XMOT.axisAngleToQuaternion([0.0, 1.0, 0.0], 0.5), 1000);
	moveable.moveTo(undefined, XMOT.axisAngleToQuaternion([0.0, 1.0, 0.0], Math.PI), 1500);
	moveable.moveTo([1.0, 0.0, 4.0], undefined, 2000);
	moveable.moveTo([4.0, 0.0, 4.0], undefined, 2500);
	moveable.moveTo([4.0, 0.0, 1.0], undefined, 3000);
	moveable.moveTo([1.0, 0.0, 1.0], XMOT.axisAngleToQuaternion([0.0, 1.0, 0.0], 0.5), 3500);
	document.getElementById("notification").innerHTML = "Ehm... Cube should have moved";
};

function controller() {
	if(!window.Gamepad) return;
    var sensitvity = 0.1;
    var pads = Gamepad.getStates();
    for ( var i = 0; i < pads.length; ++i) {
        var pad = pads[i];
        //console.log(pads);
        if (pad) {
            var x = (pad.leftStickY < -0.15 || pad.leftStickY > 0.15) ? pad.leftStickY : 0;
            var z = (pad.leftStickX < -0.15 || pad.leftStickX > 0.15) ? pad.leftStickX : 0;
            moveable.translate([-x*sensitvity, 0, z*sensitvity]);
        }
    }
}

function stop()
{
	moveable.stop();
};