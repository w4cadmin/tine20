/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id$
 */
 
/*global Ext, Tine*/

Ext.ns('Tine.Admin.user');

/**
 * @namespace   Tine.Admin.user
 * @class       Tine.Admin.UserEditDialog
 * @extends     Tine.widgets.dialog.EditDialog
 * 
 * NOTE: this class dosn't use the user namespace as this is not yet supported by generic grid
 * 
 * <p>User Edit Dialog</p>
 * <p>
 * TODO         use quota fieldset checkbox information (checked/unchecked) 
 * </p>
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id$
 * 
 * @param       {Object} config
 * @constructor
 * Create a new Tine.Admin.UserEditDialog
 */
Tine.Admin.UserEditDialog = Ext.extend(Tine.widgets.dialog.EditDialog, {
    
    /**
     * @private
     */
    windowNamePrefix: 'userEditWindow_',
    appName: 'Admin',
    recordClass: Tine.Admin.Model.User,
    recordProxy: Tine.Admin.userBackend,
    evalGrants: false,
    
    /**
     * @private
     */
    initComponent: function () {
        var accountBackend = Tine.Tinebase.registry.get('accountBackend');
        this.ldapBackend = (accountBackend === 'Ldap');

        Tine.Admin.UserEditDialog.superclass.initComponent.call(this);
    },

    /**
     * @private
     */
    onRecordLoad: function () {
        // interrupt process flow until dialog is rendered
        if (! this.rendered) {
            this.onRecordLoad.defer(250, this);
            return;
        }
                
        // samba user
        var response = {
            responseText: Ext.util.JSON.encode(this.record.get('sambaSAM'))
        };
        this.samRecord = Tine.Admin.samUserBackend.recordReader(response);
        // email user
        var emailResponse = {
            responseText: Ext.util.JSON.encode(this.record.get('emailUser'))
        };
        this.emailRecord = Tine.Admin.emailUserBackend.recordReader(emailResponse);
        
        // format dates
        var dateTimeDisplayFields = ['accountLastLogin', 'accountLastPasswordChange', 'logonTime', 'logoffTime', 'pwdLastSet', 'kickoffTime'];
        for (var i = 0; i < dateTimeDisplayFields.length; i += 1) {
            if (dateTimeDisplayFields[i] === 'accountLastLogin' || dateTimeDisplayFields[i] === 'accountLastPasswordChange') {
                this.record.set(dateTimeDisplayFields[i], Tine.Tinebase.common.dateTimeRenderer(this.record.get(dateTimeDisplayFields[i])));
            } else {
                this.samRecord.set(dateTimeDisplayFields[i], Tine.Tinebase.common.dateTimeRenderer(this.samRecord.get(dateTimeDisplayFields[i])));
            }
        }

        this.getForm().loadRecord(this.emailRecord);
        this.getForm().loadRecord(this.samRecord);
        this.record.set('sambaSAM', this.samRecord.data);

        if (Tine.Admin.registry.get('manageSmtpEmailUser')) {
            this.aliasesGrid.setStoreFromArray(this.emailRecord.get('emailAliases'));
            this.forwardsGrid.setStoreFromArray(this.emailRecord.get('emailForwards'));
        }
        
        // load stores for memberships
        if (this.record.id) {
        	this.storeGroups.loadData(this.record.get('accountGroups'));
        	this.storeRoles.loadData(this.record.get('accountRoles'));
        }
        // add to store default primary group
        else {
        	this.storeGroups.add(new Tine.Admin.Model.Group(this.record.get('accountPrimaryGroup')));
        }
        
        Tine.Admin.UserEditDialog.superclass.onRecordLoad.call(this);
    },
    
    /**
     * @private
     */
    onRecordUpdate: function () {
        Tine.Admin.UserEditDialog.superclass.onRecordUpdate.call(this);
        
        var form = this.getForm();
        form.updateRecord(this.samRecord);
        if (this.samRecord.dirty) {
            // only update sam record if something changed
            this.record.set('sambaSAM', '');
            this.record.set('sambaSAM', this.samRecord.data);
        }

        form.updateRecord(this.emailRecord);
        // get aliases / forwards
        if (Tine.Admin.registry.get('manageSmtpEmailUser')) {
            this.emailRecord.set('emailAliases', this.aliasesGrid.getFromStoreAsArray());
            this.emailRecord.set('emailForwards', this.forwardsGrid.getFromStoreAsArray());
        }
        this.record.set('emailUser', '');
        this.record.set('emailUser', this.emailRecord.data);
        
        var newGroups = [],
        	newRoles = [];
        	
        this.storeGroups.each(function (rec) {
        	newGroups.push(rec.data.id);	        
        });
        // add selected primary group to new groups if not exists
        if (newGroups.indexOf(this.record.get('accountPrimaryGroup')) === -1) {
        	newGroups.push(this.record.get('accountPrimaryGroup'));
        }   
         
        this.storeRoles.each(function (rec) {
        	newRoles.push(rec.data.id);	        
        });
        
        this.record.set('accountGroups', newGroups);
        this.record.set('accountRoles', newRoles);
        
        // unset localized datetime fields before saving
        var dateTimeDisplayFields = ['accountLastLogin', 'accountLastPasswordChange', 'logonTime', 'logoffTime', 'pwdLastSet', 'kickoffTime'];
        Ext.each(dateTimeDisplayFields, function (dateTimeDisplayField) {
        	this.record.set(dateTimeDisplayField, '');
        }, this);
    },

    /**
     * 'ok' handler for passwordConfirmWindow
     */
    onPasswordConfirm: function () {
        var confirmForm = this.passwordConfirmWindow.items.first().getForm();
        var confirmValues = confirmForm.getValues();
        var passwordField = this.getForm().findField('accountPassword');
        
        if (! passwordField) {
            // oops: something went wrong, this should not happen
            return;
        }
        
        if (confirmValues.passwordRepeat !== passwordField.getValue()) {
            passwordField.markInvalid(this.app.i18n.gettext('Passwords do not match!'));
            passwordField.passwordsMatch = false;
        } else {
            passwordField.passwordsMatch = true;
            passwordField.clearInvalid();
            
            // focus email field
            this.getForm().findField('accountEmailAddress').focus(true, 100);
        }
        
        this.passwordConfirmWindow.hide();
        confirmForm.reset();
    },
    
    /**
     * Get current primary group (selected from combobox or default primary group)
     * 
     * @return {String} - id of current primary group
     */
    getCurrentPrimaryGroupId: function () {
    	return this.getForm().findField('accountPrimaryGroup').getValue() || this.record.get('accountPrimaryGroup').id;
    },
    
    /**
     * Init user memberships tab
     * 
     * @return {Array} - tab items
     */
    initUserMemberships: function () {
    	this.storeGroups = new Ext.data.JsonStore({
            root: 'results',
            totalProperty: 'totalcount',
            id: 'id',
            fields: Tine.Admin.Model.Group
        });
        
        this.storeRoles = new Ext.data.JsonStore({
            root: 'results',
            totalProperty: 'totalcount',
            id: 'id',
            fields: Tine.Tinebase.Model.Role
        });
    	
    	return [{
    		xtype: 'treepanel',
    		region: 'west',
    		layout: 'fit',
    		width: 120,
    		frame: false,
    		border: true,
    		autoScroll: true,
    		rootVisible: false,
			loader: new Ext.tree.TreeLoader(),
			root: new Ext.tree.AsyncTreeNode({
	            expanded: true,
	            children: [{
	            	text: this.app.i18n.gettext('Groups'),
		            iconCls: 'admin-node-groups',
		            id: 'Groups',
		            leaf: true
	            }, {
	            	text: this.app.i18n.gettext('Roles'),
		            iconCls: 'action_permissions',
		            id: 'Roles',
		            leaf: true
	            }] 
	        }),
	        listeners: {
	        	scope: this,
	        	'click': function (node) {
	        		var centerRegion = node.ownerTree.ownerCt.items.get(1);
	        		
	        		if (! node.pickerGrid) {
	        			node.pickerGrid = this['initUser' + node.id](); 
	        			centerRegion.add(node.pickerGrid);
        				centerRegion.layout.setActiveItem(node.pickerGrid.id);
        				centerRegion.doLayout();
	        		}
	        		else {
	        			centerRegion.layout.setActiveItem(node.pickerGrid.id);
	        		}
	        	}
	        }
    	}, {
    		xtype: 'container',
    		region: 'center',
    		layout: 'card',
    		frame: false,
    		border: true,
    		items: []
    	}];
    },
    
    /**
     * Init User groups picker grid
     * 
     * @return {Tine.widgets.account.PickerGridPanel}
     */
    initUserGroups: function () {
    	var self = this;
    	
        this.pickerGridGroups = new Tine.widgets.account.PickerGridPanel({
        	border: false,
        	frame: false,
            store: this.storeGroups,
            selectType: 'group',
            selectAnyone: false,
            selectTypeDefault: 'group',
            getColumnModel: function () {
				return new Ext.grid.ColumnModel({
		            defaults: { sortable: true },
		            columns:  [
		                {id: 'name', header: _('Name'), dataIndex: this.recordPrefix + 'name', renderer: function (val, meta, record) {
		                	return record.data.id === self.getCurrentPrimaryGroupId() ? (record.data.name + '<span class="x-item-disabled"> (' + self.app.i18n.gettext('Primary group') + ')<span>') : record.data.name;
		                }}
		            ]
		        });
		    }
        }); 
        // disable remove of group if equal to current primary group
        this.pickerGridGroups.selModel.on('beforerowselect', function (sm, index, keep, record) {
        	if (record.data.id === this.getCurrentPrimaryGroupId()) {
        		return false;
        	}
        }, this);
        
    	return this.pickerGridGroups;
    },
    
    /**
     * Init User roles picker grid
     * 
     * @return {Tine.widgets.account.PickerGridPanel}
     */
    initUserRoles: function () {
        this.pickerGridRoles = new Tine.widgets.grid.PickerGridPanel({
        	border: false,
        	frame: false,
			autoExpandColumn: 'name',
			store: this.storeRoles,
			recordClass: Tine.Tinebase.Model.Role,
			columns: [{id: 'name', header: Tine.Tinebase.translation.gettext('Name'), sortable: true, dataIndex: 'name'}],
			initActionsAndToolbars: function () {
		    	Tine.widgets.grid.PickerGridPanel.prototype.initActionsAndToolbars.call(this);
		    	
		    	this.comboPanel = new Ext.Container({
		            layout: 'hfit',
		            border: false,
		            items: this.getSearchCombo(),
		            columnWidth: 1
		        });
		    	
		    	this.tbar = new Ext.Toolbar({
		            items: this.comboPanel,
		            layout: 'column'
		        });
		    },
		    onAddRecordFromCombo: function (recordToAdd) {	        
		        // check if already in
		        if (! this.recordStore.getById(recordToAdd.id)) {
		            this.recordStore.add([recordToAdd]);
		        }
		        this.collapse();
		        this.clearValue();
		        this.reset();
		    }
		}); 
        
    	return this.pickerGridRoles; 
    },
    
    /**
     * Init Fileserver tab items
     * 
     * @return {Array} - array ff fileserver tab items
     */
    initFileserver: function () {
    	if (this.ldapBackend) {
    		return [{
                xtype: 'fieldset',
                title: this.app.i18n.gettext('Unix'),
                autoHeight: true,
                checkboxToggle: false,
                layout: 'hfit',
                items: [{
                    xtype: 'columnform',
                    labelAlign: 'top',
                    formDefaults: {
                        xtype: 'textfield',
                        anchor: '100%',
                        labelSeparator: '',
                        columnWidth: 0.333
                    },
                    items: [[{
                        fieldLabel: this.app.i18n.gettext('Home Directory'),
                        name: 'accountHomeDirectory',
                        columnWidth: 0.666
                    }, {
                        fieldLabel: this.app.i18n.gettext('Login Shell'),
                        name: 'accountLoginShell'
                    }]]
                }]
            }, {
                xtype: 'fieldset',
                title: this.app.i18n.gettext('Windows'),
                autoHeight: true,
                checkboxToggle: false,
                layout: 'hfit',
                items: [{
                    xtype: 'columnform',
                    labelAlign: 'top',
                    formDefaults: {
                        xtype: 'textfield',
                        anchor: '100%',
                        labelSeparator: '',
                        columnWidth: 0.333
                    },
                    items: [[{
                        fieldLabel: this.app.i18n.gettext('Home Drive'),
                        name: 'homeDrive',
                        columnWidth: 0.666
                    }, {
                        xtype: 'displayfield',
                        fieldLabel: this.app.i18n.gettext('Logon Time'),
                        name: 'logonTime',
                        emptyText: this.app.i18n.gettext('never logged in'),
                        style: this.displayFieldStyle
                    }], [{
                        fieldLabel: this.app.i18n.gettext('Home Path'),
                        name: 'homePath',
                        columnWidth: 0.666
                    }, {
                        xtype: 'displayfield',
                        fieldLabel: this.app.i18n.gettext('Logoff Time'),
                        name: 'logoffTime',
                        emptyText: this.app.i18n.gettext('never logged off'),
                        style: this.displayFieldStyle
                    }], [{
                        fieldLabel: this.app.i18n.gettext('Profile Path'),
                        name: 'profilePath',
                        columnWidth: 0.666
                    }, {
                        xtype: 'displayfield',
                        fieldLabel: this.app.i18n.gettext('Password Last Set'),
                        name: 'pwdLastSet',
                        emptyText: this.app.i18n.gettext('never'),
                        style: this.displayFieldStyle
                    }], [{
                        fieldLabel: this.app.i18n.gettext('Logon Script'),
                        name: 'logonScript',
                        columnWidth: 0.666
                    }], [{
                        xtype: 'extuxclearabledatefield',
                        fieldLabel: this.app.i18n.gettext('Password Can Change'),
                        name: 'pwdCanChange',
                        emptyText: this.app.i18n.gettext('not set')
                    }, {
                        xtype: 'extuxclearabledatefield',
                        fieldLabel: this.app.i18n.gettext('Password Must Change'),
                        name: 'pwdMustChange',
                        emptyText: this.app.i18n.gettext('not set')
                    }, {
                        xtype: 'extuxclearabledatefield',
                        fieldLabel: this.app.i18n.gettext('Kick Off Time'),
                        name: 'kickoffTime',
                        emptyText: this.app.i18n.gettext('not set')
                    }]]
                }]
            }];
    	}
    	
    	return [];
    },
    
    /**
     * Init IMAP tab items
     * 
     * @return {Array} - array of IMAP tab items
     */
    initImap: function () {
    	if (Tine.Admin.registry.get('manageImapEmailUser')) {
    		return [{
    			xtype: 'fieldset',
                title: this.app.i18n.gettext('Quota (MB)'),
                autoHeight: true,
                checkboxToggle: true,
                layout: 'hfit',
                items: [{
                    xtype: 'columnform',
                    labelAlign: 'top',
                    formDefaults: {
                        xtype: 'textfield',
                        anchor: '100%',
                        columnWidth: 0.666
                    },
                    items: [[{
                        fieldLabel: this.app.i18n.gettext('Quota'),
                        name: 'emailMailQuota',
                        xtype: 'uxspinner',
                        strategy: new Ext.ux.form.Spinner.NumberStrategy({
                            incrementValue : 10,
                            allowDecimals : false
                        })
                    }], [{
                        fieldLabel: this.app.i18n.gettext('Current Mail Size'),
                        name: 'emailMailSize',
                        xtype: 'displayfield',
                        style: this.displayFieldStyle
                    }]]
                }]
            }, {
                xtype: 'fieldset',
                title: this.app.i18n.gettext('Sieve Quota (MB)'),
                autoHeight: true,
                checkboxToggle: true,
                layout: 'hfit',
                items: [{
                    xtype: 'columnform',
                    labelAlign: 'top',
                    formDefaults: {
                        xtype: 'textfield',
                        anchor: '100%',
                        columnWidth: 0.666
                    },
                    items: [[{
                        fieldLabel: this.app.i18n.gettext('Sieve Quota'),
                        name: 'emailSieveQuota',
                        xtype: 'uxspinner',
                        strategy: new Ext.ux.form.Spinner.NumberStrategy({
                            incrementValue : 10,
                            allowDecimals : false
                        })
                    }], [{
                        fieldLabel: this.app.i18n.gettext('Sieve Size'),
                        name: 'emailSieveSize',
                        xtype: 'displayfield',
                        style: this.displayFieldStyle
                    }]
                    ]
                }]
            }, {
                xtype: 'fieldset',
                title: this.app.i18n.gettext('Information'),
                autoHeight: true,
                checkboxToggle: false,
                layout: 'hfit',
                items: [{
                    xtype: 'columnform',
                    labelAlign: 'top',
                    formDefaults: {
                        xtype: 'displayfield',
                        anchor: '100%',
                        columnWidth: 0.666,
                        style: this.displayFieldStyle
                    },
                    items: [[{
                        fieldLabel: this.app.i18n.gettext('Last Login'),
                        name: 'emailLastLogin'
                    }]]
                }]
            }];
    	}
    	
    	return [];
    },
    
    /**
     * @private
     * 
     * init email grids
     * 
     * TODO     add ctx menu
     * TODO     make border work
     */
    initSmtp: function () {
    	if (Tine.Admin.registry.get('manageSmtpEmailUser')) {
			var commonConfig = {
	            autoExpandColumn: 'email',
	            quickaddMandatory: 'email',
	            //border: true,
	            frame: false,
	            useBBar: true,
	            dataField: 'email',
	            height: 200,
	            columnWidth: 0.5,
	            recordClass: Ext.data.Record.create([
	                { name: 'email' }
	            ])
	        };
    		
    		this.aliasesGrid = new Tine.widgets.grid.QuickaddGridPanel(
	            Ext.apply(commonConfig, {
	                //title:this.app.i18n.gettext('Aliases'),
	                cm: new Ext.grid.ColumnModel([{ 
	                    id: 'email', 
	                    header: this.app.i18n.gettext('Email Alias'), 
	                    dataIndex: 'email', 
	                    width: 300, 
	                    hideable: false, 
	                    sortable: true,
	                    quickaddField: new Ext.form.TextField({
	                        emptyText: this.app.i18n.gettext('Add an alias address...'),
	                        vtype: 'email'
	                    }),
	                    editor: new Ext.form.TextField({allowBlank: false}) 
	                }])
	            })
	        );
	        this.aliasesGrid.render(document.body);
	
	        this.forwardsGrid = new Tine.widgets.grid.QuickaddGridPanel(
	            Ext.apply(commonConfig, {
	                //title:this.app.i18n.gettext('Forwards'),
	                cm: new Ext.grid.ColumnModel([{ 
	                    id: 'email', 
	                    header: this.app.i18n.gettext('Email Forward'), 
	                    dataIndex: 'email', 
	                    width: 300, 
	                    hideable: false, 
	                    sortable: true,
	                    quickaddField: new Ext.form.TextField({
	                        emptyText: this.app.i18n.gettext('Add a forward address...'),
	                        vtype: 'email'
	                    }),
	                    editor: new Ext.form.TextField({allowBlank: false}) 
	                }])
	            })
	        );
	        this.forwardsGrid.render(document.body);
	        
	        return [
	            [this.aliasesGrid, this.forwardsGrid],
		        [{
		            fieldLabel: this.app.i18n.gettext('Forward Only'),
		            name: 'emailForwardOnly',
		            xtype: 'checkbox',
		            columnWidth: 0.666,
		            readOnly: false
		        }]
			];
        }
        
        return [];
    },
    
    /**
     * @private
     */
    getFormItems: function () {
        this.displayFieldStyle = {
            border: 'silver 1px solid',
            padding: '3px',
            height: '11px'
        };
        
        this.passwordConfirmWindow = new Ext.Window({
            title: this.app.i18n.gettext('Password confirmation'),
            closeAction: 'hide',
            modal: true,
            width: 300,
            height: 130,
            //layout: 'fit',
            //plain: true,
            items: new Ext.FormPanel({
                bodyStyle: 'padding:5px;',
                buttonAlign: 'right',
                labelAlign: 'top',
                anchor: '100%',
                items: [{
                    xtype: 'textfield',
                    inputType: 'password',
                    anchor: '100%',
                    id: 'passwordRepeat',
                    fieldLabel: this.app.i18n.gettext('Repeat password'), 
                    name: 'passwordRepeat',
                    listeners: {
                        scope: this,
                        specialkey: function (field, event) {
                            if (event.getKey() === event.ENTER) {
                                this.onPasswordConfirm();
                            }
                        }
                    }
                }],
                buttons: [{
                    text: _('Cancel'),
                    iconCls: 'action_cancel',
                    handler: function () {
                        this.passwordConfirmWindow.hide();
                    },
                    scope: this
                }, {
                    text: _('Ok'),
                    iconCls: 'action_saveAndClose',
                    handler: this.onPasswordConfirm,
                    scope: this
                }]
            }),
            listeners: {
                scope: this,
                show: function (win) {
                    var confirmForm = this.passwordConfirmWindow.items.first().getForm();
                    var confirmField = confirmForm.findField('passwordRepeat');
                    
                    confirmField.focus(true, 500);
                }
            }
        });
        this.passwordConfirmWindow.render(document.body);
        
        return {
            xtype: 'tabpanel',
            deferredRender: false,
            border: false,
            plain: true,
            activeTab: 0,
            items: [{               
                title: this.app.i18n.gettext('Account'),
                autoScroll: true,
                border: false,
                frame: true,
                layout: 'hfit',
                items: [{
                    xtype: 'columnform',
                    labelAlign: 'top',
                    formDefaults: {
                        xtype: 'textfield',
                        anchor: '100%',
                        labelSeparator: '',
                        columnWidth: 0.333
                    },
                    items: [[{
                        fieldLabel: this.app.i18n.gettext('First Name'),
                        name: 'accountFirstName',
                        columnWidth: 0.5,
                        listeners: {
                			render: function (field) {
                    			field.focus(false, 250); 
                    			field.selectText();
            				}
        				}
                    }, {
                        fieldLabel: this.app.i18n.gettext('Last Name'),
                        name: 'accountLastName',
                        allowBlank: false,
                        columnWidth: 0.5
                    }], [{
                        fieldLabel: this.app.i18n.gettext('Login Name'),
                        name: 'accountLoginName',
                        allowBlank: false,
                        columnWidth: 0.5
                    }, {
                        fieldLabel: this.app.i18n.gettext('Password'),
                        id: 'accountPassword',
                        name: 'accountPassword',
                        inputType: 'password',
                        emptyText: this.app.i18n.gettext('no password set'),
                        columnWidth: 0.5,
                        passwordsMatch: true,
                        enableKeyEvents: true,
                        listeners: {
                            scope: this,
                            blur: function (field) {
                                var fieldValue = field.getValue();
                                if (fieldValue !== '') {
                                    // show password confirmation
                                    // NOTE: we can't use Ext.Msg.prompt because field has to be of inputType: 'password'
                                    this.passwordConfirmWindow.show.defer(100, this.passwordConfirmWindow);
                                }
                            },
							destroy: function () {
								// destroy password confirm window
								this.passwordConfirmWindow.destroy();
							},
                            keydown: function (field) {
                                field.passwordsMatch = false;
                            }
                        },
                        validateValue : function (value) {
                            return this.passwordsMatch;
                        }
                    }], [{
                        vtype: 'email',
                        fieldLabel: this.app.i18n.gettext('Emailaddress'),
                        name: 'accountEmailAddress',
                        id: 'accountEmailAddress',
                        columnWidth: 0.5
                    }, {
                        //vtype: 'email',
                        fieldLabel: this.app.i18n.gettext('OpenID'),
                        name: 'openid',
                        columnWidth: 0.5
                    }], [{
                    	xtype: 'tinerecordpickercombobox',
                        fieldLabel: this.app.i18n.gettext('Primary group'),
                        listWidth: 250,
                        name: 'accountPrimaryGroup',
                        blurOnSelect: true,
                        allowBlank: false,
                        recordClass: Tine.Admin.Model.Group,
                        listeners: {
                        	scope: this,
                        	'select': function (combo, record, index) {
                        		// refresh grid
                        		if (this.pickerGridGroups) {
									this.pickerGridGroups.getView().refresh();	
                        		}
                        	}
                        }
                    }, {
                        xtype: 'combo',
                        fieldLabel: this.app.i18n.gettext('Status'),
                        name: 'accountStatus',
                        mode: 'local',
                        triggerAction: 'all',
                        allowBlank: false,
                        editable: false,
                        store: [['enabled', this.app.i18n.gettext('enabled')], ['disabled', this.app.i18n.gettext('disabled')], ['expired', this.app.i18n.gettext('expired')]]
                    }, {
                        xtype: 'extuxclearabledatefield',
                        fieldLabel: this.app.i18n.gettext('Expires'),
                        name: 'accountExpires',
                        emptyText: this.app.i18n.gettext('never')
					}], [{
                        xtype: 'combo',
                        fieldLabel: this.app.i18n.gettext('Visibility'),
                        name: 'visibility',
                        mode: 'local',
                        triggerAction: 'all',
                        allowBlank: false,
                        editable: false,
                        store: [['displayed', this.app.i18n.gettext('Display in addressbook')], ['hidden', this.app.i18n.gettext('Hide from addressbook')]],
                        listeners: {
                            scope: this,
                            select: function (combo, record) {
                                // disable container_id combo if hidden
                                this.getForm().findField('container_id').setDisabled(record.data.field1 === 'hidden');
                            }
                        }
                    }, {
                    	xtype: 'tinerecordpickercombobox',
                        fieldLabel: this.app.i18n.gettext('Saved in Addressbook'),
                        name: 'container_id',
                        blurOnSelect: true,
                        listWidth: 250,
                        recordClass: Tine.Tinebase.Model.Container,
                        disabled: this.record.get('visibility') === 'hidden',
                        recordProxy: Tine.Admin.sharedAddressbookBackend
                    }]] 
				}, {
                    xtype: 'fieldset',
                    title: this.app.i18n.gettext('Information'),
                    autoHeight: true,
                    checkboxToggle: false,
                    layout: 'hfit',
                    items: [{
	                	xtype: 'columnform',
	                    labelAlign: 'top',
	                    formDefaults: {
                    		xtype: 'displayfield',
	                        anchor: '100%',
	                        labelSeparator: '',
	                        columnWidth: 0.333,
                    		style: this.displayFieldStyle
	                    },
	                    items: [[{
	                        fieldLabel: this.app.i18n.gettext('Last login at'),
	                        name: 'accountLastLogin',
	                        emptyText: this.ldapBackend ? this.app.i18n.gettext("don't know") : this.app.i18n.gettext('never logged in')
	                    }, {
	                        fieldLabel: this.app.i18n.gettext('Last login from'),
	                        name: 'accountLastLoginfrom',
	                        emptyText: this.ldapBackend ? this.app.i18n.gettext("don't know") : this.app.i18n.gettext('never logged in')
	                    }, {
	                        fieldLabel: this.app.i18n.gettext('Password set'),
	                        name: 'accountLastPasswordChange',
	                        emptyText: this.app.i18n.gettext('never')
	                    }]]
	                }]
                }]
            }, {
                title: this.app.i18n.gettext('User memberships'),
                border: false,
                frame: false,
                layout: 'border',
                items: this.initUserMemberships()
            }, {
                title: this.app.i18n.gettext('Fileserver'),
                disabled: !this.ldapBackend,
                border: false,
                frame: true,
                items: this.initFileserver()
            }, {
                title: this.app.i18n.gettext('IMAP'),
                disabled: ! Tine.Admin.registry.get('manageImapEmailUser'),
                autoScroll: true,
                border: false,
                frame: true,
                layout: 'hfit',
                items: this.initImap()
			}, {
                xtype: 'columnform',
                title: this.app.i18n.gettext('SMTP'),
                disabled: ! Tine.Admin.registry.get('manageSmtpEmailUser'),
                border: false,
                frame: true,
                labelAlign: 'top',
                formDefaults: {
                    xtype: 'textfield',
                    anchor: '100%',
                    labelSeparator: '',
                    columnWidth: 0.333,
                    readOnly: true
                },
                items: this.initSmtp()
            }]
        };
    }
});

/**
 * User Edit Popup
 * 
 * @param   {Object} config
 * @return  {Ext.ux.Window}
 */
Tine.Admin.UserEditDialog.openWindow = function (config) {
    var id = (config.record && config.record.id) ? config.record.id : 0;
    var window = Tine.WindowFactory.getWindow({
        width: 600,
        height: 400,
        name: Tine.Admin.UserEditDialog.prototype.windowNamePrefix + id,
        contentPanelConstructor: 'Tine.Admin.UserEditDialog',
        contentPanelConstructorConfig: config
    });
    return window;
};
