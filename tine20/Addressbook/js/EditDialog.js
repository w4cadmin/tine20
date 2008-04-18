
/**
 * Addressbook Edit Dialog
 * 
 * @todo make country selection a widget
 */
Tine.Addressbook.ContactEditDialog.getEditForm = function() {
    var savePath = {
        layout: 'column',
        autoHeight: true,
        border: false,
        bodyStyle: 'margin-top: 5px;',
        defaults: {
            border: false,
            layout: 'form'
            //bodyStyle:'margin:10px',
        },
        items: [{
            columnWidth: .5,
            layout: 'column',
            border: false,
            items:[{
                layout: 'form',
                labelWidth: 70,
                border: false,
                items:
                    new Tine.widgets.container.selectionComboBox({
                        fieldLabel:'Saved in',
                        width: 150,
                        name: 'owner',
                        itemName: 'Addressbook',
                        appName: 'Addressbook'
                    })
                }/*,{
                    hideLabels: true,
                    bodyStyle: 'margin-left: 3px;',
                    //border: true,
                    items: {
                        xtype: 'checkbox',
                        boxLabel: 'Private',
                        disabled: true
                    }
                }*/]
            },{
                columnWidth: .5,
                labelWidth: 100,
                items: {
                    xtype: 'combo',
                    fieldLabel: 'Display Name',
                    name: 'n_fn',
                    disabled: true,
                    anchor: '100% r'
                }
            }
        ]
    };
    
    var personalInformationExpandArea = new Ext.Panel({
        layout: 'anchor',
        onResize: function(w, h){
            this.items.each(function(item){
                if(item.rendered) {
                    item.setWidth(w);
                }
            });
        },
        items:[
            {
                layout: 'column',
                items:[
                    {
                        columnWidth: .2,
                        layout: 'form',
                        labelAlign: 'top',
                        bodyStyle: 'padding-right: 5px;',
                        items: {
                            xtype: 'textfield',
                            labelSeparator: '',
                            anchor: '100%',
                            fieldLabel:'Room', 
                            name:'room'
                        }
                    },
                    {
                        columnWidth: .4,
                        layout: 'form',
                        labelAlign: 'top',
                        bodyStyle: 'padding-right: 5px;',
                        items: {
                            xtype: 'textfield',
                            labelSeparator: '',
                            anchor: '100%',
                            fieldLabel:'Job Role', 
                            name:'role'
                        }
                    },
                    {
                        columnWidth: .4,
                        layout: 'form',
                        labelAlign: 'top',
                        bodyStyle: 'padding-right: 5px;',
                        items: {
                            xtype: 'textfield',
                            labelSeparator: '',
                            anchor: '100%',
                            fieldLabel:'Name Assistent', 
                            name:'assistent'
                        }
                    }
                ]
            },
            {
                layout: 'column',
                items:[
                    {
                        columnWidth: .5,
                        layout: 'form',
                        labelAlign: 'top',
                        bodyStyle: 'padding-right: 5px;',
                        items: {
                            xtype: 'textfield',
                            labelSeparator: '',
                            anchor: '100%',
                            fieldLabel:'Middle Name(s)', 
                            name:'n_middle'
                        }
                    },
                    {
                        columnWidth: .5,
                        layout: 'form',
                        labelAlign: 'top',
                        bodyStyle: 'padding-right: 5px;',
                        items: {
                            xtype: 'textfield',
                            labelSeparator: '',
                            anchor: '100%',
                            fieldLabel:'Suffix', 
                            name:'n_suffix'
                        }
                    }
                ]
            }
        ]
    });
    
    var personalInformation = {
        title: 'Personal Information',
        xtype: 'expanderfieldset',
        layout: 'anchor',
        onResize: function(w, h){
            this.items.each(function(item){
                if(item.rendered) {
                    item.setWidth(w-10);
                }
            });
        },
        collapsible: true,
        autoHeight: true,
        items:[
            {
                layout: 'column',
                items:[
                    {
                        columnWidth: 1,
                        layout: 'anchor',
                        onResize: function(w, h){
                            this.items.each(function(item){
                                if(item.rendered) {
                                    item.setWidth(w);
                                }
                            });
                        },
                        items: [
                            {
                                layout: 'column',
                                items:[
                                    {
                                        columnWidth: .2,
                                        layout: 'form',
                                        labelAlign: 'top',
                                        bodyStyle: 'padding-right: 5px;',
                                        items: {
                                            xtype: 'textfield',
                                            labelSeparator: '',
                                            anchor: '100%',
                                            fieldLabel:'Title', 
                                            name:'n_prefix'
                                        }
                                    },
                                    {
                                        columnWidth: .4,
                                        layout: 'form',
                                        labelAlign: 'top',
                                        bodyStyle: 'padding-right: 5px;',
                                        items: {
                                            xtype: 'textfield',
                                            labelSeparator: '',
                                            anchor: '100%',
                                            fieldLabel:'First Name', 
                                            name:'n_given'
                                        }
                                    },
                                    {
                                        columnWidth: .4,
                                        layout: 'form',
                                        labelAlign: 'top',
                                        bodyStyle: 'padding-right: 5px;',
                                        items: {
                                            xtype: 'textfield',
                                            labelSeparator: '',
                                            anchor: '100%',
                                            fieldLabel:'Last Name', 
                                            name:'n_family'
                                        }
                                    }
                                ]
                            },
                            {
                                layout: 'column',
                                items:[
                                    {
                                        columnWidth: .6,
                                        layout: 'form',
                                        labelAlign: 'top',
                                        bodyStyle: 'padding-right: 5px;',
                                        items: {
                                            xtype: 'mirrortextfield',
                                            labelSeparator: '',
                                            anchor: '100%',
                                            fieldLabel:'Company', 
                                            name:'org_name',
                                        }
                                    },
                                    {
                                        columnWidth: .4,
                                        layout: 'form',
                                        labelAlign: 'top',
                                        bodyStyle: 'padding-right: 5px;',
                                        items: {
                                            xtype: 'textfield',
                                            labelSeparator: '',
                                            anchor: '100%',
                                            fieldLabel: 'Job Title',
                                             name: 'title',
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        width: 90,
                        html: '<img src="images/empty_photo.jpg" width="90px">'
                    }
                ]
            },
            personalInformationExpandArea
        ]
    };
 
    var contactInformationBasePanel = Ext.ux.layout.ColumnFormLayout(
    {
        labelAlign: 'top',
        defaults: {
            xtype:'icontextfield',
            anchor: '100%',
            labelSeparator: '',
            columnWidth: .333
        },
        items: [
            [
                {
                    fieldLabel:'Phone', 
                    labelIcon: 'images/oxygen/16x16/apps/kcall.png',
                    name:'tel_work'
                },
                {
                    fieldLabel:'Mobile',
                    labelIcon: 'images/oxygen/16x16/devices/phone.png',
                    name:'tel_cell'
                },
                {
                    fieldLabel:'Fax', 
                    labelIcon: 'images/oxygen/16x16/devices/printer.png',
                    name:'tel_fax'
                }
            ],
            [
                {
                    fieldLabel:'E-Mail', 
                    labelIcon: 'images/oxygen/16x16/actions/kontact-mail.png',
                    name:'email'
                },
                {
                    xtype: 'mirrortextfield',
                    fieldLabel:'Web',
                    labelIcon: 'images/oxygen/16x16/actions/network.png',
                    name:'url',
                },
                {
                    fieldLabel:'Phone Assistent', 
                    labelIcon: 'images/oxygen/16x16/apps/kcall.png',
                    name:'tel_assistent'
                }
            ],
            [
                {
                    fieldLabel:'Phone (private)',
                    labelIcon: 'images/oxygen/16x16/apps/kcall.png',
                    name:'tel_home'
                },
                {
                    fieldLabel:'E-Mail (private)', 
                    labelIcon: 'images/oxygen/16x16/actions/kontact-mail.png',
                    name:'email_home'
                },
                {
                    fieldLabel:'Mobile (private)',
                    labelIcon: 'images/oxygen/16x16/devices/phone.png',
                    name:'tel_cell_private'
                }
            ]
        ]
    });
    
    var contactInformation = new Ext.form.FieldSet({
        collapsible: true,
        layout: 'anchor',
        autoHeight:true,
        title: 'Contact Information',
        items: [
            contactInformationBasePanel,
            //contactInformationExpandArea
        ]
    });
    
    var companyInformation = {
        xtype: 'tabpanel',
        deferredRender:false,
        //autoHeight: true,
        height: 160,
        activeTab: 0,
        border: false,
        defaults: {
            frame: true
        },
        items: [
            Ext.apply({ title: 'Company Information' }, Ext.ux.layout.ColumnFormLayout({
                //layout: 'form',
                labelAlign: 'top',
                defaults: {
                    xtype:'textfield',
                    anchor:'100%',
                    labelSeparator: '',
                    columnWidth: .333
                },
                items: [
                    [
                        {
                            xtype: 'mirrortextfield',
                            fieldLabel:'Company Name', 
                            name:'org_name'
                        },
                        {
                            fieldLabel:'Street', 
                            name:'adr_one_street'
                        },
                        {
                            fieldLabel:'Street 2', 
                            name:'adr_one_street2'
                        }
                    ],
                    [
                        {
                            fieldLabel:'Region',
                            name:'adr_one_region'
                        },
                        {
                            fieldLabel:'Postal Code', 
                            name:'adr_one_postalcode'
                        },
                        {
                            fieldLabel:'City',
                            name:'adr_one_locality'
                        }
                    ],
                    [
                        new Ext.form.ComboBox({
                            fieldLabel: 'Country',
                            name: 'adr_one_countryname',
                            hiddenName:'adr_one_countryname',
                            store: new Ext.data.JsonStore({
                                baseParams: {
                                    method:'Tinebase.getCountryList'
                                },
                                root: 'results',
                                id: 'shortName',
                                fields: ['shortName', 'translatedName'],
                                remoteSort: false
                            }),
                            displayField:'translatedName',
                            valueField:'shortName',
                            typeAhead: true,
                            mode: 'remote',
                            triggerAction: 'all',
                            emptyText:'Select a state...',
                            selectOnFocus:true,
                            anchor:'95%'
                        })
                    ]
                ]
            })),
            Ext.apply({ title: 'Private Information' }, Ext.ux.layout.ColumnFormLayout({
                labelAlign: 'top',
                defaults: {
                    xtype:'textfield',
                    anchor:'100%',
                    labelSeparator: '',
                    columnWidth: .333
                },
                items: [
                    [

                        {
                            fieldLabel:'Street', 
                            name:'adr_two_street'
                        },
                        {
                            fieldLabel:'Street 2', 
                            name:'adr_two_street2'
                        }
                    ],
                    [
                        {
                            fieldLabel:'Region',
                            name:'adr_two_region'
                        },
                        {
                            fieldLabel:'Postal Code', 
                            name:'adr_two_postalcode'
                        },
                        {
                            fieldLabel:'City',
                            name:'adr_two_locality'
                        }
                    ],
                    [
                        new Ext.form.ComboBox({
                            fieldLabel: 'Country',
                            name: 'adr_two_countryname',
                            hiddenName:'adr_two_countryname',
                            store: new Ext.data.JsonStore({
                                baseParams: {
                                    method:'Tinebase.getCountryList'
                                },
                                root: 'results',
                                id: 'shortName',
                                fields: ['shortName', 'translatedName'],
                                remoteSort: false
                            }),
                            displayField:'translatedName',
                            valueField:'shortName',
                            typeAhead: true,
                            mode: 'remote',
                            triggerAction: 'all',
                            emptyText:'Select a state...',
                            selectOnFocus:true,
                            anchor:'95%'
                        })
                    ]
                ]
            })),
            {
                title: 'Custom Fields',
                html: '',
                disabled: true
            }
        ]
    };
    
    var tags = new Tine.widgets.tags.TagPanel({
        height: 230,
        customHeight: 230,
        border: false,
        style: 'border:1px solid #B5B8C8;',
        //labelAlign: 'top'
    });
    
    
    var contactTabPanel = {
        title: 'Contact',
        autoScroll: true,
        layout: 'border',
        border: false,
        items: [
            {
                layout: 'anchor',
                id: 'adbEditDialogContactLeft',
                region: 'center',
                items: [
                    personalInformation,
                    contactInformation,
                    companyInformation
                ],
                // fix resizing in border layout
                onResize: function(w,h){
                    this.items.each(function(item){
                        if (item.rendered) {
                            item.setWidth(w);
                        }
                    });
                }
            },
            {
                // tags & notes
                layout: 'anchor',
                region: 'east',
                width: 200,
                split: true,
                collapsible: true,
                collapseMode: 'mini',
                margins: '0 5 0 5',
                //bodyStyle: 'border:1px solid #B5B8C8;',
                bodyStyle: 'padding-left: 5px;',
                items: [
                    tags,
                    {
                        xtype: 'panel',
                        layout: 'form',
                        labelAlign: 'top',
                        items: [{
                            labelSeparator: '',
                            xtype:'textarea',
                            name: 'note',
                            fieldLabel: 'Notes',
                            grow: false,
                            preventScrollbars:false,
                            anchor:'100%',
                            //width: 215,
                            height: 205
                        }]
                    }
                ],
                // fix resizing in border layout
                onResize: function(w,h){
                    this.items.each(function(item){
                        if (item.rendered) {
                            item.setWidth(w);
                        }
                    });
                }
            }
        ]
    };
    
    var tabPanel = {
        xtype:'tabpanel',
        defaults: {
            frame: true
        },
        height: 500,
        plain:true,
        activeTab: 0,
        border: false,
        items:[
            contactTabPanel,
            {
                title: 'Links [2]',
                disabled: true
            },
            {
                title: 'Activity [5/+2]',
                disabled: true
            },
            {
                title: 'History',
                disabled: true
            }
        ]
    };
    
    
    // hacks to supress the bottom scrollbar when the side scollbar apreas
    /*
    personalInformationExpandArea.on('expand', function(panel){
        var wrap = Ext.getCmp('adbEditDialogContactLeft').getEl().up('div.x-column-inner');
        wrap.setWidth(wrap.up('div').getWidth()-16);
    });
    contactInformationExpandArea.on('expand', function(panel){
        var wrap = Ext.getCmp('adbEditDialogContactLeft').getEl().up('div.x-column-inner');
        wrap.setWidth(wrap.up('div').getWidth()-16);
    });
    //workarround Extjs layout bugs
    contactInformationBasePanel.on('resize', function(cmp){
        cmp.setHeight(cmp.customHeight);
    });
    */
    tags.on('resize', function(cmp){
        cmp.setHeight(cmp.customHeight);
    });
    return [
        tabPanel,
        savePath
    ];
}