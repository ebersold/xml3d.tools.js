
XMOT.namespace("XMOT.interaction.widgets");

/**
 * A TransformBox uses the TranslaterBox, Scaler and SingleAxisRotator to set up a
 * composed widget, that can be translated, rotated and scaled.
 *
 * @extends XMOT.interaction.widgets.Widget
 */
XMOT.interaction.widgets.TransformBox = new XMOT.Class(
    XMOT.interaction.widgets.Widget, {

    listenerTypes: [
        "translation:dragstart", "translation:dragend",
        "rotation:dragstart", "rotation:dragend",
        "scaling:dragstart", "scaling:dragend"
    ],

    /** Setup axis-flip options and initialize the base class.
     *
     * @param {string} _id
     * @param {XMOT.Transformable} _target
     * @param {{rotationFlips:{x: boolean, y: boolean, z: boolean},translationConstraints:Object,enableScaling:boolean}=} options
     *
     * There are a couple of options that can be set (all optional).
     * o rotationFlips can be used to specify whether to flip the rotation around the given local axis.
     * o translationConstraints specifies constraints for the TranslateBox instance. They will be forwarded
     *   to TranslateBox as-is. Thus, take a look at the XMOT.interaction.widgets.TranslateBox() for
     *   more information.
     * o enableScaling: if true scaling behavior is enabled. Else only the geometry will be used (the four cubes). The
     *   geometry will be used anyway because this hides the overlapping rotation handles nicely.
     */
    initialize: function(_id, _target, options)
    {
        this.callSuper(_id, _target);

        this._flipRotAxes = {x: false, y: false, z: false};
        this._enableScaling = true;
        this._rotationSpeed = 1;

        options = options || {};
        if(XMOT.util.isDefined(options.rotationFlips))
        {
            this._flipRotAxes.x = options.rotationFlips.x || false;
            this._flipRotAxes.y = options.rotationFlips.y || false;
            this._flipRotAxes.z = options.rotationFlips.z || false;
        }
        if(XMOT.util.isDefined(options.translationConstraints))
        {
            this._translConstraints = options.translationConstraints;
        }
        if(XMOT.util.isDefined(options.enableScaling))
        {
            this._enableScaling = options.enableScaling;
        }
        if(XMOT.util.isDefined(options.rotationSpeed))
        {
            this._rotationSpeed = options.rotationSpeed;
        }
    },

    /**
     *  @this {XMOT.interaction.widgets.TransformBox}
     *  @override
     *  @protected
     */
    onCreateBehavior: function()
    {
        this._setupTranslater();
        this._setupRotater();
        this._setupScaler();
    },

    _setupTranslater: function()
    {
        this.behavior["translbox"] = new XMOT.interaction.widgets.TranslateBox(
            this.ID + "_translbox", this.target, this._translConstraints);
        this.behavior["translbox"].attach();

        this.behavior["translbox"].addListener("dragstart", this.callback("_onTranslationDragStart"));
        this.behavior["translbox"].addListener("dragend", this.callback("_onTranslationDragEnd"));
    },

    _setupRotater: function()
    {
        // options objects for the SingleAxisRotator
        var axes = [
            {axis: "x", color: "0.7 0 0", highlightColor: "0.9 0 0"},
            {axis: "y", color: "0 0.7 0", highlightColor: "0 0.9 0"},
            {axis: "z", color: "0 0 0.7", highlightColor: "0 0 0.9"}
        ];

        for(var i = 0; i < axes.length; i++)
            axes[i].rotationSpeed = this._rotationSpeed;

        for(var i = 0; i < axes.length; i++)
        {
            var ax = axes[i].axis;
            var id = ax + "rot";

            this.behavior[id] = new XMOT.interaction.widgets.SingleAxisRotator(
                this.ID + "_" + id, this.target, axes[i]
            );
            this.behavior[id].attach();

            this.behavior[id].addListener("dragstart", this.callback("_onRotationDragStart"));
            this.behavior[id].addListener("dragend", this.callback("_onRotationDragEnd"));
        }
    },

    _setupScaler: function()
    {
        if(this._enableScaling === true)
        {
            this.behavior["scaler"] = new XMOT.interaction.widgets.UniformScaler(
                    this.ID + "_scaler", this.target);
            this.behavior["scaler"].attach();
            this.behavior["scaler"].addListener("dragstart", this.callback("_onScalingDragStart"));
            this.behavior["scaler"].addListener("dragend", this.callback("_onScalingDragEnd"));
        }
        else // setup geometry only
        {
            this._scalerGeometry = new XMOT.interaction.geometry.UniformScaler(this);
            this._scalerGeometry.constructAndAttach();
        }
    },

    _onTranslationDragStart: function()
    {
        this.notifyListeners("translation:dragstart", this);
    },

    _onTranslationDragEnd: function()
    {
        this.notifyListeners("translation:dragend", this);
    },

    _onRotationDragStart: function()
    {
        this.notifyListeners("rotation:dragstart", this);
    },

    _onRotationDragEnd: function()
    {
        this.notifyListeners("rotation:dragend", this);
    },

    _onScalingDragStart: function()
    {
        this.notifyListeners("scaling:dragstart", this);
    },

    _onScalingDragEnd: function()
    {
        this.notifyListeners("scaling:dragend", this);
    }
});
