window.addEventListener("load", onLoad, false);

var gizmo = null;
var gizmo1 = null;
var cameraCtrl = null;
var targetMirror = null;

var gizmoRadios = null;

function onLoad() {

    var targetGroup = $("#g_mainTarget")[0];
    targetTransformable = XML3D.tools.MotionFactory.createTransformable(targetGroup);

    gizmoRadios = document.getElementsByName('gizmotype');
    $(gizmoRadios).click(onChangeGizmoType);

    cameraCtrl = new XML3D.tools.MouseKeyboardFlyController($("#v_camera")[0].parentNode, {
        rotateSpeed: 5
    });
    cameraCtrl.attach();

    XML3D.tools.util.fireWhenMeshesLoaded(targetGroup, onChangeGizmoType);
};

function onChangeGizmoType()
{
    detachGizmos();

    switch(getGizmoType())
    {
    case "translate":
        createGizmosTranslate();
        break;

    case "rotate":
        createGizmosRotate();
        break;
    }
};

function getGizmoType()
{
    for (var i = 0; i < gizmoRadios.length; i++)
    {
        if (gizmoRadios[i].checked)
        {
            return gizmoRadios[i].value;
        }
    }

    return "none";
};

function detachGizmos()
{
    if(gizmo)
    {
        gizmo.detach();
        gizmo = null;
    }
    if(gizmo1)
    {
        gizmo1.detach();
        gizmo = null;
    }
    if(targetMirror)
    {
        targetMirror.detach();
        targetMirror = null;
    }
};

function createGizmosTranslate()
{
    gizmo = new XML3D.tools.interaction.widgets.TranslateGizmo("myGizmo", {
        target: targetTransformable
        // uncomment the line below to test disabling of specific component
        //, disabledComponents: ["xyplane", "yzplane", "xzplane"]
    });
    gizmo.attach();
};

function createGizmosRotate()
{
    gizmo = new XML3D.tools.interaction.widgets.RotateGizmo("myGizmo", {
        target: targetTransformable,
        geometry: {
            scale: new XML3DVec3(2, 2, 2),
            bandWidth: 1.1
        }
    });
    gizmo.attach();
};
