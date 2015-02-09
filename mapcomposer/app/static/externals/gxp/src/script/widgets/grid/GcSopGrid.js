/**
* Copyright (c) 2008-2011 The Open Planning Project
*
* Published under the GPL license.
* See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
* of the license.
*/

/** api: (define)
 *  module = gxp.grid
 *  class = FeatureGrid
 *  base_link = `Ext.grid.GridPanel <http://extjs.com/deploy/dev/docs/?class=Ext.grid.GridPanel>`_
 */
Ext.namespace("gxp.grid");

/** api: constructor
 *  .. class:: FeatureGrid(config)
 *
 *      Create a new grid displaying the contents of a 
 *      ``GeoExt.data.FeatureStore`` .
 */
gxp.grid.GcSopGrid = Ext.extend(Ext.grid.EditorGridPanel, {

    deleteMsgTitle:'Elimina riga',
    deleteMsg:'Vuoi eliminare la riga selezionato',
    deleteButtonText:'Elimna',
    deleteButtonTooltip:'Elimna riga selezionata',
    editButtonText:'Modifica',
    editButtonTooltip:'Modifica riga  selezionata',
    saveButtonText:'Salva',
    saveButtonTooltip:'Salva modifiche riga  selezionata',
    cancelButtonText:'Annulla',
    cancelButtonTooltip:'Anulla modifiche',
   
    autoScroll: true,
    title: "Sopralluoghi",
    /** api: config[ignoreFields]
     *  ``Array`` of field names from the store's records that should not be
     *  displayed in the grid.
     */
    ignoreFields: null,
    
    format:'JSON',
    filter:null,
     queriableAttribute : null ,
    /** api: config[schema]
     *  ``GeoExt.data.AttributeStore``
     *  Optional schema for the grid. If provided, appropriate field
     *  renderers (e.g. for date or boolean fields) will be used.
     */

    /** api: config[dateFormat]
     *  ``String`` Date format. Default is the value of
     *  ``Ext.form.DateField.prototype.format``.
     */

    /** api: config[timeFormat]
     *  ``String`` Time format. Default is the value of
     *  ``Ext.form.TimeField.prototype.format``.
     */

    /** private: property[layer]
     *  ``OpenLayers.Layer.Vector`` layer displaying features from this grid's
     *  store
     */
    layer: null,
	autoLoad:false,
	actionTooltip: "Zoom To Feature",
    
    /** api: method[initComponent]
     *  Initializes the FeatureGrid.
     */
    initComponent: function(){
      
         this.ignoreFields = ["feature", "state", "fid"].concat(this.ignoreFields);
        if (!this.dateFormat) {
            this.dateFormat = Ext.form.DateField.prototype.format;
        }
        if (!this.timeFormat) {
            this.timeFormat = Ext.form.TimeField.prototype.format;
        }
      
            this.sm= new Ext.grid.RowSelectionModel({
                
           singleSelect:true,
           listeners:{ 
               'beforerowselect':function( sm, rowIndex, keepExisting, record ){
                            if(this.colModel.editing){//Devi controllare che la feature non sia stata modificata e poi puoi permettere il cambio
                                
                                
                            }else if(this.editButton.disabled){//Abiliti i bottoni se non sono stati abilitati
                                this.editButton.enable();
                                this.deleteButton.enable();
                            }
                   
                   
               },
                'rowselect' : function(sm, rowIndex, r ){ //Attiva i tasti per editing
                                console.log('selected');
                                this.feature=r.data.feature;
                                this.attributes = Ext.apply({}, this.feature.attributes);
                               

                                
                },
                'selectionchange': function(sm ){
                    console.log('selcange');
                },
                scope:this
            }
                });    
            this.store= new Ext.data.Store();
            this.cm= new Ext.grid.ColumnModel({columns: []});
            this.bbar=[
             {
            text: this.editButtonText,
            tooltip: this.editButtonTooltip,
            iconCls: "edit",
            disabled:true,
            handler: this.enableEditing,
            scope: this,
            ref:'/editButton'}
            ,
            {
            text: this.deleteButtonText,
            tooltip: this.deleteButtonTooltip,
            iconCls: "delete",
            hidden: false,
            disabled:true,
            handler: this.deleteFeature,
            scope: this,
            ref:'./deleteButton'
            },
        
            {
            text: this.cancelButtonText,
            tooltip: this.cancelButtonTooltip,
            iconCls: "cancel",
            hidden: true,
            handler: function() {
                this.stopEditing(false);
            },
            scope: this,
            ref:'../cancelButton'
        },
        
         {
            text: this.saveButtonText,
            tooltip: this.saveButtonTooltip,
            iconCls: "save",
            hidden: true,
            handler: function() {
                this.stopEditing(true);
            },
            scope: this,
            ref:'../saveButton'
        }
      
            
            
            
            
            
            ];
       
        gxp.grid.GcSopGrid.superclass.initComponent.call(this);       
      
      var me=this;
      //Lo ritardo perchè altrimenti mi elimina il layer del feature manager ma va fixato!!
      window.setTimeout(function(){
           me.target.createLayerRecord({"source":me.source,
         "name":me.typeName},me.setSopLayer,me);   
        
      },3000);
      
    },
 
     loadSop: function(param){
        var params={};
        if(this.oldParam===param)return;//If oalready loaded skip!
         
        console.log(param);
        this.filter=new OpenLayers.Filter.Comparison({
            type:OpenLayers.Filter.Comparison.EQUAL_TO,
            property: this.queriableAttribute,
            value:param
            });
        
        this.store.setOgcFilter(this.filter);
         this.store.load();
       this.oldParam=param;
   },
    
     setSopLayer:function(layerRecord){
         console.log("SOP Layer Arrivato!");
       
        this.layerRecord=layerRecord;           
        this.createStore();
    },
    
    /** private: method[onDestroy]
     *  Clean up anything created here before calling super onDestroy.
     */
    onDestroy: function() {
        gxp.grid.GcSopGrid.superclass.onDestroy.apply(this, arguments);
    },
  

createStore: function() {
        var record = this.layerRecord;
        var source = this.target.getSource(record);
        if (source && source instanceof gxp.plugins.WMSSource) {
            source.getSchema(record, function(schema) {
                if (schema === false) {
                
                    //information about why selected layers are not queriable.                
                    var layer = record.get("layer");
                    var wmsVersion = layer.params.VERSION;
                    Ext.MessageBox.show({
                        title: this.noValidWmsVersionMsgTitle,
                        msg: this.noValidWmsVersionMsgText + wmsVersion,
                        buttons: Ext.Msg.OK,
                        animEl: 'elId',
                        icon: Ext.MessageBox.INFO
                    });
                    
                    this.clearFeatureStore();
                } else
                               
                 {
                    var fields = [], geometryName;
                    var geomRegex = /gml:((Multi)?(Point|Line|Polygon|Curve|Surface|Geometry)).*/;
                    var types = {
                        "xsd:boolean": "boolean",
                        "xsd:int": "int",
                        "xsd:integer": "int",
                        "xsd:short": "int",
                        "xsd:long": "int",
                        "xsd:date": "date",
                        "xsd:string": "string",
                        "xsd:float": "float",
                        "xsd:decimal": "float"
                    };
                    schema.each(function(r) {
                        var match = geomRegex.exec(r.get("type"));
                        if (match) {
                            geometryName = r.get("name");
                            this.geometryType = match[1];
                        } else {
                            // TODO: use (and improve if needed) GeoExt.form.recordToField    
                            var type = types[r.get("type")];
                                var field = {
                                name: r.get("name"),
                                type: type
                            };
                            //TODO consider date type handling in OpenLayers.Format
                            if (type == "date") {
                                field.dateFormat = "Y-m-d\\Z";
                            }
                            fields.push(field);
                        }
                    }, this);
                   
                    var protocolOptions = {    
                        srsName: this.target.mapPanel.map.getProjection(),
                        url: schema.url,
                        featureType: schema.reader.raw.featureTypes[0].typeName,
                        featureNS: schema.reader.raw.targetNamespace,
                        geometryName: geometryName
                    };
                    
                   
                    this.hitCountProtocol = new OpenLayers.Protocol.WFS(Ext.apply({
                        version: "1.1.0",
                        readOptions: {output: "object"},
                        resultType: "hits",
                        filter: this.filter
                    }, protocolOptions));
                    
                   featureStore = new gxp.data.WFSFeatureStore(Ext.apply({
                        fields: fields,
                        proxy: {
                            protocol: {
                                outputFormat: this.format 
                            }
                        },
                        maxFeatures: this.maxFeatures,
                        layer: this.featureLayer,
                        ogcFilter: this.filter,
                        autoLoad: this.autoLoad,
                        autoSave: false,
                        listeners: {
                            "write": function() {
                                console.log('write');
                               // this.redrawMatchingLayers(record);
                            },
                            "load": function() {
                                //this.fireEvent("query", this, this.featureStore, this.filter);
                            },
                            scope: this
                        }
                    }, protocolOptions));
                }
                  this.schema = schema;
                   
           
            this.reconfigure(featureStore, this.createColumnModel(featureStore));

            }, this);
            
                   
        
   
            
            
            
        }      
    },

    /** api: method[getColumns]
     *  :arg store: ``GeoExt.data.FeatureStore``
     *  :return: ``Array``
     *  
     *  Gets the configuration for the column model.
     */
    getColumns: function(store) {
        function getRenderer(format) {
            return function(value) {
                //TODO When http://trac.osgeo.org/openlayers/ticket/3131
                // is resolved, change the 5 lines below to
                // return value.format(format);
                var date = value;
                if (typeof value == "string") {
                     date = Date.parseDate(value.replace(/Z$/, ""), "c");
                }
                return date ? date.format(format) : value;
            };
        }
		
       
		  var columns = [];		
		var name, type, xtype, format, renderer;
        (this.schema || store.fields).each(function(f) {
            if (this.schema) {
                
                name = f.get("name");
                type = f.get("type").split(":").pop();
                 if (type.match(/^[^:]*:?((Multi)?(Point|Line|Polygon|Curve|Surface|Geometry))/)) {
                    // exclude gml geometries
                    return;
                }
                format = null;
                switch (type) {
                    case "date":
                        format = this.dateFormat;
                    case "datetime":
                        format = format ? format : this.dateFormat + " " + this.timeFormat;
                        xtype = undefined;
                        renderer = getRenderer(format);
                        break;
                    case "boolean":
                        xtype = "booleancolumn";
                        break;
                    case "string":
                        xtype = "gridcolumn";
                        break;
                    default:
                        xtype = "numbercolumn";
                }
            } else {
                name = f.name;
            }
             var fieldCfg = GeoExt.form.recordToField(f);
            if (this.ignoreFields.indexOf(name) === -1) {
               
                columns.push({
                    dataIndex: name,
                    header: fieldCfg.fieldLabel,
                    sortable: true,
                    xtype: xtype,
                    format: format,
                    renderer: xtype ? undefined : renderer,
                    editor: fieldCfg
               
                    
                });
            }
        }, this);
        return columns;
    },
    
    /** private: method[createColumnModel]
     *  :arg store: ``GeoExt.data.FeatureStore``
     *  :return: ``Ext.grid.ColumnModel``
     */
    createColumnModel: function(store) {
        var cols = this.getColumns(store);
        return new Ext.grid.ColumnModel(
            {
               editing:false, 
               columns: cols,
                   isCellEditable: function(col, row) {
                if(this.editing) return Ext.grid.ColumnModel.prototype.isCellEditable.call(this, col, row);
                else return false;
                }
               });
    },
     /** private: method[startEditing]
     */
    enableEditing: function() {
        console.log(this);
        if(!this.colModel.editing) {
            this.colModel.editing = true;
            
            this.editButton.hide();
            //this.deleteButton.hide();
            this.saveButton.show();
            this.cancelButton.show();
            
            
            
        }
    },
     /** private: method[stopEditing]
     *  :arg save: ``Boolean`` If set to true, changes will be saved and the
     *      ``featuremodified`` event will be fired.
     */
    stopEditing: function(save) {
        if(this.editing) {
            //TODO remove the line below when
            // http://trac.openlayers.org/ticket/2210 is fixed.
            this.modifyControl.deactivate();
            this.modifyControl.destroy();
            
            var feature = this.feature;
            if (feature.state === this.getDirtyState()) {
                if (save === true) {
                    //TODO When http://trac.osgeo.org/openlayers/ticket/3131
                    // is resolved, remove the if clause below
                    if (this.schema) {
                        var attribute, rec;
                        for (var i in feature.attributes) {
                            rec = this.schema.getAt(this.schema.findExact("name", i));
                            attribute = feature.attributes[i];
                            if (attribute instanceof Date) {
                                var type = rec.get("type").split(":").pop();
                                feature.attributes[i] = attribute.format(
                                    type == "date" ? "Y-m-d" : "c"
                                );
                            }
                        }
                    }
                    this.fireEvent("featuremodified", this, feature);
                } else if(feature.state === OpenLayers.State.INSERT) {
                    this.editing = false;
                    feature.layer.destroyFeatures([feature]);
                    this.fireEvent("canceledit", this, null);
                    this.close();
                } else {
                    var layer = feature.layer;
                    layer.drawFeature(feature, {display: "none"});
                    feature.geometry = this.geometry;
                    feature.attributes = this.attributes;
                    this.setFeatureState(null);
                    this.grid.setSource(feature.attributes);
                    layer.drawFeature(feature);
                    this.fireEvent("canceledit", this, feature);
                }
            }

            if (!this.isDestroyed) {
                this.cancelButton.hide();
                this.saveButton.hide();
                this.editButton.show();
                this.allowDelete && this.deleteButton.show();
            }
            
            this.editing = false;
        }
    },
    
    deleteFeature: function() {
        Ext.Msg.show({
            title: this.deleteMsgTitle,
            msg: this.deleteMsg,
            buttons: Ext.Msg.YESNO,
            fn: function(button) {
                if(button === "yes") {
                    this.setFeatureState(OpenLayers.State.DELETE);
                    this.commit();
                }
            },
            scope: this,
            icon: Ext.MessageBox.QUESTION,
            animEl: this.getEl()
        });
    },
    
    /** private: method[setFeatureState]
     *  Set the state of this popup's feature and trigger a featuremodified
     *  event on the feature's layer.
     */
    setFeatureState: function(state) {
        this.feature.state = state;
        var layer = this.feature.layer;
        /*layer && layer.events.triggerEvent("featuremodified", {
            feature: this.feature
        });*/
    },
    
     /** private: method[getDirtyState]
     *  Get the appropriate OpenLayers.State value to indicate a dirty feature.
     *  We don't cache this value because the popup may remain open through
     *  several state changes.
     */
    getDirtyState: function() {
        return this.feature.state === OpenLayers.State.INSERT ?
            this.feature.state : OpenLayers.State.UPDATE;
    },


  //Committa i cambiamenti  
    commit: function(){
        console.log(this.feature);
        this.store.proxy.protocol.commit(
            [this.feature], {
                callback: function(res) {
                    console.log(res);                    
                }
        });

        
        
    }
});

/** api: xtype = gxp_featuregrid */
Ext.reg('gxp_gcsopgrid', gxp.grid.GcSopGrid); 
