/**
* Copyright (c) 2008-2011 The Open Planning Project
*
* Published under the GPL license.
* See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
* of the license.
*/

/** api: (define)
 *  module = gxp
 *  class = IncidentiEditPopup
 *  extends = FeatureEditPopup
 */

/** api: constructor
 *  .. class:: IncidentiEditPopup(config)
 *
 *      Create a new popup which displays the attributes of a feature and
 *      makes the feature editable,
 *      using an ``OpenLayers.Control.MofidyFeature``.
 */
Ext.namespace("gxp");
gxp.IncidentiEditPopup = Ext.extend(gxp.FeatureEditPopup, {

    searchFieldStore:null,

  initComponent: function() {
        this.addEvents(
            /** api: events[featuremodified]
             *  Fires when the feature associated with this popup has been
             *  modified (i.e. when the user clicks "Save" on the popup) or
             *  deleted (i.e. when the user clicks "Delete" on the popup).
             *
             *  Listener arguments:
             *  * panel - :class:`gxp.FeatureEditPopup` This popup.
             *  * feature - ``OpenLayers.Feature`` The modified feature.
             */
            "featuremodified",
            
            /** api: events[canceledit]
             *  Fires when the user exits the editing mode by pressing the
             *  "Cancel" button or selecting "No" in the popup's close dialog.
             *  
             *  Listener arguments:
             *  * panel - :class:`gxp.FeatureEditPopup` This popup.
             *  * feature - ``OpenLayers.Feature`` The feature. Will be null
             *    if editing of a feature that was just inserted was cancelled.
             */
            "canceledit",
            
            /** api: events[cancelclose]
             *  Fires when the user answers "Cancel" to the dialog that
             *  appears when a popup with unsaved changes is closed.
             *  
             *  Listener arguments:
             *  * panel - :class:`gxp.FeatureEditPopup` This popup.
             */
            "cancelclose"
        );

        var baseProtocol={
            srsName: this.target.mapPanel.map.getProjection(),
            url: "http://sit.comune.bolzano.it/geoserver/wfs?",
            geometryName: "GEOMETRY"

                        }
        var fieldGridEditors ={};
        if(this.incidentiConfig)
        for(fieldName in this.incidentiConfig){

           

            var fieldConfig=this.incidentiConfig[fieldName];
            var fieldProtocolOptions = Ext.apply(baseProtocol,{    
                        featureType: fieldConfig.layer.featureType,
                        featureNS: fieldConfig.layer.featureNS                      
                    });
            var fieldStore=new gxp.data.WFSFeatureStore(Ext.apply({
                        fields:[{
                                name: fieldConfig.valueField.name,
                                type: fieldConfig.valueField.type
                            },{
                                name: fieldConfig.displayField.name,
                                type: fieldConfig.displayField.type
                            }],
                        proxy: {
                            protocol: {
                                outputFormat: "JSON"
                            }
                        },
                        maxFeatures: 10,
                        autoLoad: false,
                        autoSave: false
                    }, fieldProtocolOptions));
            var fieldCombo=new Ext.form.ComboBox({
                            xtype: "combo",
                            store: fieldStore,
                            valueNotFoundText:"Click on map",
                            editable:false,
                            queryMode:'local',
                            typeAhead:false,
                            triggerAction: "query",
                            valueField: fieldConfig.valueField.name,
                            displayField: fieldConfig.displayField.name
                        })
            var fieldGridEditor=    new Ext.grid.GridEditor(fieldCombo,{
                    fieldStore:fieldStore,
                    distance:fieldConfig.distance,
                    listeners:{
                        "beforestartedit":function(ed){

                            this.searchFieldStore=ed.fieldStore,
                            this.distance=ed.distance,
                            this.target.mapPanel.map.events.register(
                            "click", this, this.searchField
                            );
                        },
                        "complete":function(){
                            this.searchFieldStore=null,
                            this.distance=null,
                            this.target.mapPanel.map.events.unregister(
                            "click", this, this.searchField
                            );
                        },
                        "beforecomplete":function( me,value, startValue ){
                            if(!Ext.isNumber(value))me.setValue( startValue);
                        },
                        scope:this
                    }
                });
                fieldGridEditors[fieldName]=fieldGridEditor;

        };    
        
        if (!this.dateFormat) {
            this.dateFormat = Ext.form.DateField.prototype.format;
        }
        if (!this.timeFormat) {
            this.timeFormat = Ext.form.TimeField.prototype.format;
        }
        var feature = this.feature;
        if (!feature.geometry){
                var mapCenter =this.target.mapPanel.map.getCenter()
                feature.geometry=new OpenLayers.Geometry.Point(mapCenter.lon,mapCenter.lat);
                feature.fakeGeometry=true;
        }
        if (!this.location) {
            this.location = feature
        };
        
        this.anchored = !this.editing;
        
        var customEditors = {};
        
        var customRenderers = {};
        if(this.schema) {
            var attributes = {};
            if (this.fields) {
                if (!this.excludeFields) {
                    this.excludeFields = [];
                }
                // determine the order of attributes
                for (var i=0,ii=this.fields.length; i<ii; ++i) {
                    attributes[this.fields[i]] = null;
                }
            }
            var ucFields = this.fields ?
                this.fields.join(",").toUpperCase().split(",") : [];
            this.schema.each(function(r) {
                var type = r.get("type");
                if (type.match(/^[^:]*:?((Multi)?(Point|Line|Polygon|Curve|Surface|Geometry))/)) {
                    // exclude gml geometries
                    return;
                }
                var name = r.get("name");
                if (this.fields) {
                    if (ucFields.indexOf(name.toUpperCase()) == -1) {
                        this.excludeFields.push(name);
                    }
                }
                var value = feature.attributes[name];
                var fieldCfg = GeoExt.form.recordToField(r);
                var listeners;
                if (typeof value == "string") {
                    var format;
                    switch(type.split(":").pop()) {
                        case "date":
                            format = this.dateFormat;
                            fieldCfg.editable = false;
                        case "dateTime":
                            if (!format) {
                                format = this.dateFormat + " " + this.timeFormat;
                                // make dateTime fields editable because the
                                // date picker does not allow to edit time
                                fieldCfg.editable = true;
                            }
                            fieldCfg.format = format;
                            //TODO When http://trac.osgeo.org/openlayers/ticket/3131
                            // is resolved, remove the listeners assignment below
                            listeners = {
                                "startedit": function(el, value) {
                                    if (!(value instanceof Date)) {
                                        var date = Date.parseDate(value.replace(/Z$/, ""), "c");
                                        if (date) {
                                            this.setValue(date);
                                        }
                                    }
                                }
                            };
                            customRenderers[name] = (function() {
                                return function(value) {
                                    //TODO When http://trac.osgeo.org/openlayers/ticket/3131
                                    // is resolved, change the 5 lines below to
                                    // return value.format(format);
                                    var date = value;
                                    if (typeof value == "string") {
                                        date = Date.parseDate(value.replace(/Z$/, ""), "c");
                                    }
                                    return date ? date.format(format) : value;
                                }
                            })();
                            break;
                        case "boolean":
                            listeners = {
                                "startedit": function(el, value) {
                                    this.setValue(Boolean(value));
                                }
                            }
                            break;
                    }
                }
                customEditors[name] = new Ext.grid.GridEditor({
                    field: Ext.create(fieldCfg),
                    listeners: listeners
                });
                attributes[name] = value;
            }, this);
            feature.attributes = attributes;
        }
        
        if(!this.title && feature.fid) {
            this.title = feature.fid;
        }

        Ext.apply(customEditors,fieldGridEditors);       


        this.editButton = new Ext.Button({
            text: this.editButtonText,
            tooltip: this.editButtonTooltip,
            iconCls: "edit",
            handler: this.startEditing,
            scope: this
        });

        
        this.deleteButton = new Ext.Button({
            text: this.deleteButtonText,
            tooltip: this.deleteButtonTooltip,
            iconCls: "delete",
            hidden: !this.allowDelete,
            handler: this.deleteFeature,
            scope: this
        });
        
        this.cancelButton = new Ext.Button({
            text: this.cancelButtonText,
            tooltip: this.cancelButtonTooltip,
            iconCls: "cancel",
            hidden: true,
            handler: function() {
                this.stopEditing(false);
            },
            scope: this
        });
        
        this.saveButton = new Ext.Button({
            text: this.saveButtonText,
            tooltip: this.saveButtonTooltip,
            iconCls: "save",
            hidden: true,
            handler: function() {
                this.stopEditing(true);
            },
            scope: this
        });
        
        var ucExcludeFields = this.excludeFields ?
            this.excludeFields.join(",").toUpperCase().split(",") : [];
        this.grid = new Ext.grid.PropertyGrid({
            border: false,
            source: feature.attributes,
            customEditors: customEditors,
            customRenderers: customRenderers,
            viewConfig: {
                forceFit: true,
                getRowClass: function(record) {
                    if (ucExcludeFields.indexOf(record.get("name").toUpperCase()) !== -1) {
                        return "x-hide-nosize";
                    }
                }
            },
            listeners: {
                "beforeedit": function() {
                    return this.editing;
                },
                "propertychange": function() {
                    this.setFeatureState(this.getDirtyState());
                },
                scope: this
            },
            initComponent: function() {
                //TODO This is a workaround for maintaining the order of the
                // feature attributes. Decide if this should be handled in
                // another way.
                var origSort = Ext.data.Store.prototype.sort;
                Ext.data.Store.prototype.sort = function() {};
                Ext.grid.PropertyGrid.prototype.initComponent.apply(this, arguments);
                Ext.data.Store.prototype.sort = origSort;
            }
        });
        
        /**
         * TODO: This is a workaround for getting attributes with undefined
         * values to show up in the property grid.  Decide if this should be 
         * handled in another way.
         */
        this.grid.propStore.isEditableValue = function() {return true;};

        this.items = [
            this.grid
        ];

        this.bbar = new Ext.Toolbar({
            hidden: this.readOnly,
            items: [
                this.editButton,
                this.deleteButton,
                this.saveButton,
                this.cancelButton
            ]
        });
        
        gxp.FeatureEditPopup.superclass.initComponent.call(this);
        
        this.on({
            "show": function() {
                if(this.editing) {
                    this.editing = null;
                    this.startEditing();
                }
            },
            "beforeclose": function(){
                this.searchFieldStore=null,
                this.distance=null,
                 this.target.mapPanel.map.events.unregister(
                            "click", this, this.searchField
                            );
                if(!this.editing) {
                    return;
                }
                if(this.feature.state === this.getDirtyState()) {
                    Ext.Msg.show({
                        title: this.closeMsgTitle,
                        msg: this.closeMsg,
                        buttons: Ext.Msg.YESNOCANCEL,
                        fn: function(button) {
                            if(button && button !== "cancel") {
                                this.stopEditing(button === "yes");
                                this.close();
                            } else {
                                this.fireEvent("cancelclose", this);
                            }
                        },
                        scope: this,
                        icon: Ext.MessageBox.QUESTION,
                        animEl: this.getEl()
                    });
                    return false;
                } else {
                    this.stopEditing(false);
                }
            },
            scope: this
        });
    },
       /** private: method[startEditing]
     */
    startEditing: function() {
        if(!this.editing) {
            if(!this.feature.geometry){
                var mapCenter =this.target.mapPanel.map.getCenter();
                this.feature.geometry=new OpenLayers.Geometry.Point(mapCenter.lon,mapCenter.lat);
                this.feature.fakeGeometry=true;
            }
            gxp.IncidentiEditPopup.superclass.startEditing.call(this);
        }
    },
    
    /** private: method[stopEditing]
     *  :arg save: ``Boolean`` If set to true, changes will be saved and the
     *      ``featuremodified`` event will be fired.
     */
    stopEditing: function(save) {
        if(this.editing) {
            
            var feature = this.feature;
            var layer= feature.layer;
            if((save===false && feature.fakeGeometry )|| (feature.fakeGeometry && !feature.modified )|| (feature.fakeGeometry && !feature.modified.geometry)){
                this.modifyControl.unselectFeature(feature);
                layer.drawFeature(this.feature, 'delete'); 
                this.feature.geometry=null;
                this.feature.modified=null;
                this.geometry=null;
            }
            this.feature.fakeGeometry=false;
            gxp.IncidentiEditPopup.superclass.stopEditing.call(this,save);
          
        }
    },
       /** private: method[searchField]
     *  Search for nearest civici e strade in bolzano cartografia
     */
    searchField:function(evt){
        var evtLL = this.target.mapPanel.map.getLonLatFromPixel(evt.xy);
        var dist=(this.distance)?this.distance:100;
        var filter  = new OpenLayers.Filter.Spatial({
                            type:OpenLayers.Filter.Spatial.DWITHIN,
                             value: new OpenLayers.Geometry.Point(evtLL.lon, evtLL.lat),
                             distance:dist,
                             distanceUnits:'meter'
                        });
                this.searchFieldStore.setOgcFilter(filter);
                this.searchFieldStore.load();
        }

 



});

/** api: xtype = gxp_icidentieditpopup */
Ext.reg('gxp_icidentieditpopup', gxp.IncidentiEditPopup);