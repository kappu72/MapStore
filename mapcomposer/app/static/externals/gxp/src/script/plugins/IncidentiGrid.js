/**
* Copyright (c) 2008-2011 The Open Planning Project
*
* Published under the GPL license.
* See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
* of the license.
*/

/**
 * @requires plugins/ClickableFeatures.js
 * @include widgets/grid/FeatureGrid.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = FeatureGrid
 */

/** api: (extends)
 *  plugins/gxp.plugins.FeatureGrid.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: IncidentiGrid(config)
 *
 *    Plugin for displaying incidenti features in a grid. Requires a
 *    :class:`gxp.plugins.FeatureManager`. Also provides a context menu for
 *    the grid.
 */   
gxp.plugins.IncidentiGrid = Ext.extend(gxp.plugins.FeatureGrid, {
    
    /** api: ptype = gxp_featuregrid */
    ptype: "gxp_incidentigrid",

    /** api: config[civicoProperty]
     *  Configura il campo sul quale ricercare per elementi null
     **/
    civicoProperty:'ID_STRASSE_1',
    /** api: config[stradeProperty]
     *  Configura il campo sul quale ricercare per elementi null
     **/
    stradeProperty:'ID_VIC_1',
    


    /** api: method[addOutput]
     */
    addOutput: function(config) {
    	var featureManager = this.target.tools[this.featureManager];
    	var tbar=[];
    	
        var geomBtn= new Ext.Button(        
            {   width:120,
                enableToggle: true,
                text: 'Senza Geometria',
                tooltip:'Filtra Incidenti Senza Geometria',
                toggleGroup :"filtraIncidenti",
                toggleHandler :function(btn,pressed){
                	if(pressed){

                		featureManager.loadFeatures(new OpenLayers.Filter.Comparison({
    						type:OpenLayers.Filter.Comparison.IS_NULL,
    						property:featureManager.featureStore.geometryName
    						}));
                	}
                },
                listeners:{
                    "click":function(btn,ev){
                        if(!btn.pressed)featureManager.loadFeatures(null);
                    }
                },
                pressed: false });
        
        tbar.push(geomBtn);
        tbar.push('-');

        var civiciBtn= new Ext.Button(        
            {   width:120,
                enableToggle: true,
                text: 'Senza Civico',
                tooltip:'Filtra Incidenti Senza Civico',
                toggleGroup :"filtraIncidenti",
                toggleHandler :function(btn,pressed){
                    if(pressed){

                        featureManager.loadFeatures(new OpenLayers.Filter.Comparison({
                            type:OpenLayers.Filter.Comparison.IS_NULL,
                            property:this.civicoProperty
                            }));
                    }
                },
                scope:this,
                listeners:{
                    "click":function(btn,ev){
                        if(!btn.pressed)featureManager.loadFeatures(null);
                    }
                },
                pressed: false });
        tbar.push(civiciBtn);	
        tbar.push('-');
       	var stradeBtn= new Ext.Button(        
            {   width:120,
                enableToggle: true,
                text: 'Senza Strade',
                tooltip:'Filtra Incidenti Senza Strade',
                toggleGroup :"filtraIncidenti",
                toggleHandler :function(btn,pressed){
                    if(pressed){

                        featureManager.loadFeatures(new OpenLayers.Filter.Comparison({
                            type:OpenLayers.Filter.Comparison.IS_NULL,
                            property:this.stradeProperty
                            }));
                    }
                },
                scope:this,
                listeners:{
                    "click":function(btn,ev){
                        if(!btn.pressed)featureManager.loadFeatures(null);
                    }
                },
                pressed: false });
        	tbar.push(stradeBtn);
         
           config=Ext.apply({tbar:tbar},config||{});
    	 gxp.plugins.IncidentiGrid.superclass.addOutput.call(this, config);
    }
});





Ext.preg(gxp.plugins.IncidentiGrid.prototype.ptype, gxp.plugins.IncidentiGrid);
