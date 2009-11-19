/*
 * Tine 2.0
 * 
 * @license     New BSD License
 * @author      loeppky - based on the work done by MaximGB in Ext.ux.UploadDialog (http://extjs.com/forum/showthread.php?t=21558)
 * @version     $Id$
 *
 */
Ext.namespace('Ext.ux.file');

/**
 * @class Ext.ux.file.BrowsePlugin
 * @param {Object} config Configuration options
 */
Ext.ux.file.BrowsePlugin = function(config) {
    Ext.apply(this, config);
};

Ext.ux.file.BrowsePlugin.prototype = {
    /**
     * @cfg {String} inputFileName
     * Name to use for the hidden input file DOM element.  Deaults to "file".
     */
    inputFileName: 'file',
    /**
     * @property inputFileEl
     * @type Ext.Element
     * Element for the hiden file input.
     * @private
     */
    input_file: null,
    /**
     * @property originalHandler
     * @type Function
     * The handler originally defined for the Ext.Button during construction using the "handler" config option.
     * We need to null out the "handler" property so that it is only called when a file is selected.
     * @private
     */
    originalHandler: null,
    /**
     * @property originalScope
     * @type Object
     * The scope originally defined for the Ext.Button during construction using the "scope" config option.
     * While the "scope" property doesn't need to be nulled, to be consistent with originalHandler, we do.
     * @private
     */
    originalScope: null,
    
    /*
     * Protected Ext.Button overrides
     */
    /**
     * @see Ext.Button.initComponent
     */
    init: function(cmp){
        this.originalHandler = cmp.handler || null;
        this.originalScope = cmp.scope || window;
        this.handler = null;
        this.scope = null;
        
        this.component = cmp;
        
        cmp.on('render', this.onRender, this);
        
        // chain fns
        if (typeof cmp.setDisabled == 'function') {
            cmp.setDisabled = cmp.setDisabled.createSequence(function(disabled) {
                if (this.input_file) {
                    this.input_file.dom.disabled = disabled;
                }
            }, this);
        }
        
        if (typeof cmp.enable == 'function') {
            cmp.enable = cmp.enable.createSequence(function() {
                if (this.input_file) {
                    this.input_file.dom.disabled = false;
                }
            }, this);
        }
        
        if (typeof cmp.disable == 'function') {
            cmp.disable = cmp.disable.createSequence(function() {
                if (this.input_file) {
                    this.input_file.dom.disabled = true;
                }
            }, this);
        }
        
        if (typeof cmp.destroy == 'function') {
            cmp.destroy = cmp.destroy.createSequence(function() {
                var input_file = this.detachInputFile(true);
                input_file.remove();
                input_file = null;
            }, this);
        }
    },
    
    /**
     * @see Ext.Button.onRender
     */
    onRender: function() {
        this.button_container = this.buttonCt || this.component.el.child('tbody') || this.component.el;
        this.button_container.position('relative');
        this.wrap = this.component.el.wrap({cls:'tbody'});
        this.createInputFile();
    },
    
    createInputFile: function() {
        this.input_file = this.wrap.createChild({
            tag: 'input',
            type: 'file',
            size: 1,
            name: this.inputFileName || Ext.id(this.component.el),
            style: "position: absolute; display: block; border: none; cursor: pointer"
        });
        
        var button_box = this.button_container.getBox();
        this.input_file.setStyle('font-size', Math.max(button_box.height, button_box.width) + 'px');
        
        var input_box = this.input_file.getBox();
        var adj = {x: 3, y: 3}
        if (Ext.isIE) {
            adj = {x: 0, y: 3}
        }
        
        this.input_file.setLeft(button_box.width - input_box.width + adj.x + 'px');
        this.input_file.setTop(button_box.height - input_box.height + adj.y + 'px');
        this.input_file.setOpacity(0.0);
            
        if (this.component.handleMouseEvents) {
            this.input_file.on('mouseover', this.component.onMouseOver, this.component);
            this.input_file.on('mousedown', this.component.onMouseDown, this.component);
        }
        
        if(this.component.tooltip){
            if(typeof this.component.tooltip == 'object'){
                Ext.QuickTips.register(Ext.apply({target: this.input_file}, this.component.tooltip));
            } 
            else {
                this.input_file.dom[this.component.tooltipType] = this.component.tooltip;
            }
        }
        
        this.input_file.on('change', this.onInputFileChange, this);
        this.input_file.on('click', function(e) { e.stopPropagation(); });
    },
    
    /**
     * Handler when inputFileEl changes value (i.e. a new file is selected).
     * @private
     */
    onInputFileChange: function(){
        if (this.originalHandler) {
            this.originalHandler.call(this.originalScope, this);
        }
    },
    
    /**
     * Detaches the input file associated with this BrowseButton so that it can be used for other purposed (e.g. uplaoding).
     * The returned input file has all listeners and tooltips applied to it by this class removed.
     * @param {Boolean} whether to create a new input file element for this BrowseButton after detaching.
     * True will prevent creation.  Defaults to false.
     * @return {Ext.Element} the detached input file element.
     */
    detachInputFile : function(no_create) {
        var result = this.input_file;
        
        no_create = no_create || false;
        
        if (typeof this.component.tooltip == 'object') {
            Ext.QuickTips.unregister(this.input_file);
        }
        else {
            this.input_file.dom[this.component.tooltipType] = null;
        }
        this.input_file.removeAllListeners();
        this.input_file = null;
        
        if (!no_create) {
            this.createInputFile();
        }
        return result;
    },
    
    /**
     * @return {Ext.Element} the input file element
     */
    getInputFile: function(){
        return this.input_file;
    }
};
