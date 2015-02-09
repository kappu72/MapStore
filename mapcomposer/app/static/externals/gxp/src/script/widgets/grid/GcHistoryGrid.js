/**
* Copyright (c) 2008-2011 The Open Planning Project
*
* Published under the GPL license.
* See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
* of the license.
*/

/** api: (define)
 *  module = gxp.grid
 *  class = GcHistoryGrid
 *  base_link = `Ext.grid.GridPanel <http://extjs.com/deploy/dev/docs/?class=Ext.grid.GridPanel>`_
 */
Ext.namespace("gxp.grid");

/** api: constructor
 *  .. class:: GcHistoryGrid(config)
 *
 *      Create a new grid displaying the contents of a 
 *      .
 */
gxp.grid.GcHistoryGrid = Ext.extend(Ext.grid.GridPanel, {

  /** api: xtype = gxp_googlegeocodercombo */
    xtype: "gxp_gchistroygrid",

    /** api: config[queryDelay]
     *  ``Number`` Delay before the search occurs.  Default is 100ms.
     */
    queryDelay: 100,
    
    /** private: config[typeAhead]
     * the queryParameter for WFS
     */
    queryParam : "cql_filter",
    typeAhead: false,
    displayInfo: false,
    hideTrigger:true,
    
    /** api: config[displayField]
     * If a template is not defined, this is the field to show.
     * for the exemple below it can be "codice_ato"
     */
    displayField: "",
    
    /** api: config[mapPanel]
     *  the mapPanel
     */
    mapPanel:  null,
    /** api: config[url]
     *  url to perform requests
     */
    url:  '',
    /** api: config[typeName]
     *  the tipe name to search
     */
    typeName: '',
    /**
     * private config[root]
     * the root node containing feature data.
     */
    root:'features',
    /**
     * private config[recordId]
     * the id of the record.
     */
    recordId: 'fid',
    
    custom  : null,
    
    geometry: null,
    
    /** api: config[recordModel]
     *  ``Ext.Record | Array`` record model to create the store
     *  for restricting search.
     * exemple: 
     * recordModel: [
     *  {name: 'id', mapping: 'id'},
     *  {name: 'geometry', mapping: 'geometry'},
     *  {name: 'codice_ato', mapping: 'properties.codice_ato'},
     *  {name: 'denominazi', mapping: 'properties.denominazi'}
     *  
     *   ],
     */
    recordModel: null,
    
    /** api: config[queriableAttributes]
     *  ``String | Array`` feature attributes to query
     *  for restricting search.
     * for the exemple is ['codice_ato','denominazi']
     */
    queriableAttribute : null ,
    
    /** api: config[sortBy]
     *  ``String | Array`` sorting attribute
     *  needed for pagination.
     */
    sortBy : '',

    /** api: config[pageSize]
     *  ``Integer`` page size of result list.
     *  needed for pagination. default is 10
     */
    pageSize:30,
    /** api: config[loadingText]
     *  ``String`` loading text for i18n 
     */
    loadingText: 'Searching...',
    /** api: config[emptyText]
     *  ``String`` empty text for i18n 
     */
    emptyText: "Search",
    /** api: config[width]
     *  ``int`` width of the text box. default is 200
     */
    width: 200,
    
    /** defines style for the search result item
     */
    itemSelector:  'div.search-item',
    
    /** api: config[tpl]
     *  ``Ext.XTemplate`` the template to show results.
     */
    tpl: null,
    
    /** api: config[predicate]
     *  ``String`` predicate to use for search (LIKE,ILIKE,=...).
     */
    predicate: '=',
    /** api: config[vendorParams]
     *  ``String`` additional parameters object. cql_filters
     *  is used in AND the search params. (see listeners->beforequery)
     */
    vendorParams: '',

    outputFormat: 'application/json',
    
    
    clearOnFocus:true,
    /** private: method[initComponent]
     *  Override
     */
    initComponent: function() {
        
        this.store = new Ext.data.JsonStore({
            combo: this,
            root: this.root,
            messageProperty: 'crs',
            autoLoad: false,
            fields:this.recordModel,
            mapPanel: this.mapPanel,
            url: this.url,
            vendorParams: this.vendorParams,
            paramNames:{
                start: "startindex",
                limit: "maxfeatures",
                sort: "sortBy"
                
            },
            baseParams:{
                service:'WFS',
                version:'1.1.0',
                request:'GetFeature',
                typeName:this.typeName ,
                outputFormat: this.outputFormat,
                sortBy: this.sortBy
                
            
            },
            listeners:{
                beforeload: function(store){
                    var mapPanel = (this.mapPanel?this.mapPanel:this.combo.target.mapPanel);
                    store.setBaseParam( 'srsName', mapPanel.map.getProjection() );
                    for (var name in this.vendorParams ) {
                        if(this.vendorParams.hasOwnProperty(name)){
                            if(name!='cql_filter' && name != "startindex" && name != "maxfeatures" && name != 'outputFormat' ){
                                store.setBaseParam(store, this.vendorParams[name]);
                            }
                        }
                    }
                }
            },
            
            loadRecords : function(o, options, success){
                if (this.isDestroyed === true) {
                    return;
                }
                if(!o || success === false){
                    if(success !== false){
                        this.fireEvent('load', this, [], options);
                    }
                    if(options.callback){
                        options.callback.call(options.scope || this, [], options, false, o);
                    }
                    return;
                }
                console.log(this.reader.jsonData.crs);
               // this.combo.crs = this.reader.jsonData.crs;
                //custom total workaround
                var estimateTotal = function(o,options,store){
                    var current = o.totalRecords +  options.params[store.paramNames.start] ;
                    var currentCeiling = options.params[store.paramNames.start] + options.params[store.paramNames.limit];
                    if(current < currentCeiling){
                        return current;
                    }else{
                        return 100000000000000000; 
                    }
                };
                o.totalRecords = estimateTotal(o,options,this);
                //end of custom total workaround
                
                var r = o.records, t = o.totalRecords || r.length;
                if(!options || options.add !== true){
                    if(this.pruneModifiedRecords){
                        this.modified = [];
                    }
                    for(var i = 0, len = r.length; i < len; i++){
                        r[i].join(this);
                    }
                    if(this.snapshot){
                        this.data = this.snapshot;
                        delete this.snapshot;
                    }
                    this.clearData();
                    this.data.addAll(r);
                    this.totalLength = t;
                    this.applySort();
                    this.fireEvent('datachanged', this);
                }else{
                    this.totalLength = Math.max(t, this.data.length+r.length);
                    this.add(r);
                }
                this.fireEvent('load', this, r, options);
                if(options.callback){
                    options.callback.call(options.scope || this, r, options, true);
                }
            }
            
        });
        
       this.sm= new Ext.grid.RowSelectionModel({singleSelect:true});
    
    if(this.pageSize){
      this.bbar = new Ext.PagingToolbar({
                    store: this.store,
                    pageSize: this.pageSize,
                    renderTo:this.footer,
                    afterPageText:"",
                    beforePageText:"",
                    listeners:{
                        render: function(){
                            this.last.setVisible(false);
                            //this.inputItem.disable();
                        }
                    }
                });
                
       }
      
        return gxp.grid.GcHistoryGrid.superclass.initComponent.apply(this, arguments);
    },
    
   loadHistory: function(param){
        var params={};
        if(this.oldParam===param)return;//If oalready loaded skip!
        
       //Preparo il filtro con il valore passato ed eseguo la query
       this.vendorParams={cql_filter:this.queriableAttribute+this.predicate+""+param+""};
       this.store.setBaseParam(this.queryParam,this.queriableAttribute+this.predicate+param);
       if(this.pageSize){
         this.store.load({  params:{
                startindex: 0,          
        maxfeatures: this.pageSize
           }});
       }else this.store.load();
       this.oldParam=param;
   }
    
 
 
 } );
 Ext.reg(gxp.grid.GcHistoryGrid.prototype.xtype, gxp.grid.GcHistoryGrid);
