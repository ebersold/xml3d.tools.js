muh = 0;
moveable = undefined;
function initMoveable(){
	var cube = document.getElementById("cube");
	var factory = new XMOT.ClientMotionFactory;
	var constraint = new XMOT.CollisionConstraint(5.0, 5.0, [0,1,0], "collision.png");
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
}

function moveCube()
{
	document.getElementById("notification").innerHTML = "Moving the Cube ...";
	if(muh%2)
		moveable.setPosition([1.0, 0.0, 1.0]);
	else
		moveable.setPosition([2.0, 0.0, 2.0]);
	muh++;
	document.getElementById("notification").innerHTML = "Moved the Cube ...";
}

function translateCube()
{
	document.getElementById("notification").innerHTML = "Translating the Cube ...";
	if(muh%2)
		moveable.translate([1.0, 0.0, 1.0]);
	else
		moveable.translate([-2.0, 0.0, -2.0]);
	muh++;
	document.getElementById("notification").innerHTML = "Translated the Cube ...";
}

function moveCubeTo()
{
	document.getElementById("notification").innerHTML = "Moving the Cube To ...";
	moveable.moveTo([1.0, 0.0, 1.0],500).moveTo([4.0, 0.0, 1.0],1000).moveTo([4.0, 0.0, 4.0],1500).moveTo([1.0, 0.0, 4.0],2000).moveTo([1.0, 0.0, 1.0,], 2500);
	muh++;
	document.getElementById("notification").innerHTML = "Ehm... Cube should have moved";
	animate();
}

function animate(){
	window.requestAnimFrame(animate);
	TWEEN.update();
}