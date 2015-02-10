{

   "scaleOverlayMode": "basic",
   "gsSources":{ 
    "geosolutions":
     {
            "ptype": "gxp_wmssource",
            "url": "http://84.33.2.28:8081/geoserver/it.geosolutions/ows",
            "title": "GeoSolutions GeoServer",
            "SRS": "EPSG:900913",
            "version":"1.1.1",
            "layersCachedExtent": [
                -20037508.34,-20037508.34,
                20037508.34,20037508.34
            ],
            "layerBaseParams":{
                "FORMAT":"image/png8",
                "TILED":true
            }
        },
    
 
        "mapquest": {
            "ptype": "gxp_mapquestsource"
        }, 
        "osm": { 
            "ptype": "gxp_osmsource"
        },
        "google": {
            "ptype": "gxp_googlesource" 
        },
        "bing": {
            "ptype": "gxp_bingsource" 
        }, 
        "ol": { 
            "ptype": "gxp_olsource" 
        }
    },
    "loadingPanel": {
        "width": 100,
        "height": 100,
        "center": true
    },
    "map": {
        "projection": "EPSG:900913",
        "units": "m",
        "center": [1000000.000000, 5520000.000000],
        "zoom":11,
        "maxExtent": [
            -20037508.34, -20037508.34,
            20037508.34, 20037508.34
        ],
        "layers": [
            {
                "source": "google",
                "title": "Google Roadmap",
                "name": "ROADMAP",
                "group": "background"
            },{
                "source": "google",
                "title": "Google Terrain",
                "name": "TERRAIN",
                "group": "background"
            },{
                "source": "google",
                "title": "Google Hybrid",
                "name": "HYBRID",
                "group": "background"
            },{
                "source": "mapquest",
                "title": "MapQuest OpenStreetMap",
                "name": "osm",
                "group": "background"
            },{
                "source": "osm",
                "title": "Open Street Map",
                "name": "mapnik",
                "group": "background"
            },{
                "source": "bing",
                "title": "Bing Aerial",
                "name": "Aerial",
                "group": "background"
            },{
                "source": "bing",
                "title": "Bing Aerial With Labels",
                "name": "AerialWithLabels",
                "group": "background"
            },{
                "source": "ol",
                "group": "background",
                "fixed": true,
                "type": "OpenLayers.Layer",
                "visibility": false,
                "args": [
                    "None", {"visibility": false}
                ]
            },
             {
        "source":"geosolutions",
        "name":"punti_abbandono",
        "infoFormat": "application/vnd.ogc.gml",
        "title":"punti_abbandono",
        "visibility":true,
        "opacity":1,
        "selected":false,
        "format":"image/png",
        "styles":"abbandono",
        "transparent":true
        }
        ]},
"portalConfig": {
        "header":false
    },
"customComposerWest" :{
     "region":"east",
     "collapsed":true
 }, 
    "customPanels":[ 
               {
                 "title": "Segnalazioni", 
                "layout" : "vBox",
                "width": 600,
                 "minSize": 100,
                "maxSize": 250,
                 "collapsible": true,
                  "collapseMode": "mini",
                "region": "west",
                "align" : "stretch",
                  "border": false,
               
                "items":[
               {
                    "xtype": "panel",
                    "header":false,       
                    "flex":2,
                    "border": false,
                    "id": "seglist",
                    "layout": "fit",
                    "tbar":[]
                }, {
                    "xtype": "panel",
                    "title": "Ricerca Segnalazioni",         
                    "border": false,
                    "flex":1,
                    "width": 600,
                    "id": "qrypnl",
                    "layout": "fit",
                    "header": true
                }
                ]
                 }
    ],  
    "scaleOverlayUnits":{
        "bottomOutUnits":"mi",    
        "bottomInUnits":"ft",    
        "topInUnits":"m",    
        "topOutUnits":"km"
    },
    "customTools":[
  
        {
            "ptype": "gxp_embedmapdialog",
            "actionTarget": {"target": "paneltbar", "index": 2},
            "embeddedTemplateName": "viewer",
            "showDirectURL": true
        }, {
            "ptype": "gxp_categoryinitializer",
                    "silentErrors": true,
            "neededCategories": ["MAPSTORECONFIG", "GEOCOLLECT", "MAP"]
        }, {
           "ptype": "gxp_mouseposition",
           "displayProjectionCode":"EPSG:4326",
           "customCss": "font-weight: bold; text-shadow: 1px 0px 0px #FAFAFA, 1px 1px 0px #FAFAFA, 0px 1px 0px #FAFAFA,-1px 1px 0px #FAFAFA, -1px 0px 0px #FAFAFA, -1px -1px 0px #FAFAFA, 0px -1px 0px #FAFAFA, 1px -1px 0px #FAFAFA, 1px 4px 5px #aeaeae;color:#050505 "
        },
        
     
        {
          "ptype": "gxp_featuremanager",
          "id": "featuremanager",
          "autoLoadFeatures":true,
          "pagingType":1,
            "maxFeatures":20,
             "autoSetLayer":false,
         
            "layer": {
         "source":"geosolutions",
         "name":"punti_abbandono"
            }
        },
      
         {  
            "ptype": "gxp_featureeditor",
            "featureManager": "featuremanager",
            "id":"featureEdit", 
            "toggleGroup": "toolGroup",
            "showSelectedOnly":false,
            "actionTarget": {"target": "seglist.tbar", "index": 0}
        },{
          "ptype": "gxp_gcseggrid",
          "featureManager": "featuremanager",
           "featureEditor": "featureEdit",
           "selectOnMap": true,
          "ignoreFields":["DATA_RILEV"],
          "outputConfig": {
              "id": "featuregrid",
               "ignoreFields":["DATA_RILEV"],
              "header":false
          },
         "outputTarget": "seglist",
          "exportFormats": ["CSV","shape-zip"]
        }, 
        {
          "ptype": "gxp_spatialqueryform",
          "featureManager": "featuremanager",
          "featureGridContainer": "seglist",
          "outputTarget": "qrypnl",
          "showSelectionSummary": true,
          "actions": null,
          "id": "bboxquery",
          "outputConfig":{
                  "outputSRS": "EPSG:900913",
                  "selectStyle":{
                          "strokeColor": "#ee9900",
                          "fillColor": "#ee9900",
                          "fillOpacity": 0.4,
                          "strokeWidth": 1
                  },
                  "spatialFilterOptions": {    
                          "lonMax": 20037508.34,  
                          "lonMin": -20037508.34,
                          "latMax": 20037508.34,  
                          "latMin": -20037508.34  
                  },
                  "bufferOptions": {
                        "minValue": 1,
                        "maxValue": 10000,
                        "decimalPrecision": 2,
                        "distanceUnits": "m"
                  }
          },
          "spatialSelectorsConfig":{
                "bbox":{
                    "xtype": "gxp_spatial_bbox_selector"
                },
                "buffer":{
                    "xtype": "gxp_spatial_buffer_selector"
                },
                "circle":{
                    "xtype": "gxp_spatial_circle_selector",
                    "zoomToCurrentExtent": true
                },
                "polygon":{
                    "xtype": "gxp_spatial_polygon_selector"
                }
              }
        }, {
            "ptype": "gxp_addlayer",
            "showCapabilitiesGrid": true,
            "useEvents": false,
            "showReport": "never",
            "directAddLayer": false,
            "id": "addlayer"
        }, {
            "actions": ["-"], 
            "actionTarget": "paneltbar"
        }, {
            "ptype": "gxp_geolocationmenu",
            "actionTarget": {"target": "paneltbar", "index": 23},
            "toggleGroup": "toolGroup"
        }, {
            "actions": ["->"], 
            "actionTarget": "paneltbar"
        }, {
            "ptype": "gxp_help",
            "actionTarget": "paneltbar",
            "text": "Help",
            "tooltip":"MapStore Guide",
            "index": 24,
            "showOnStartup": false,
            "fileDocURL": "MapStore-Help.pdf"
        }, {
            "ptype": "gxp_about",
            "poweredbyURL": "http://www.geo-solutions.it/about/contacts/",
            "actionTarget": {"target": "panelbbar", "index": 1}
        }, {
            "ptype": "gxp_languageselector",
            "actionTarget": {"target": "panelbbar", "index": 3}
        },  {
            "ptype": "gxp_wmsgetfeatureinfo_menu", 
            "regex": "[\\s\\S]*[\\w]+[\\s\\S]*",
            "picturesBrowserConfig": {
                "baseUrl": "http://geocollect.geo-solutions.it/opensdi2-manager/mvc/fileManager/extJSbrowser",
                "folder": "/geocollect/media/punti_abbandono/",
                "featureProperty": "MY_ORIG_ID",
                "urlSuffix":"/2"
            },
            "useTabPanel": false,
            "toggleGroup": "toolGroup",
            "actionTarget": {"target": "paneltbar", "index": 20}
        }
    
        
        
        
      
    ]
    

}
