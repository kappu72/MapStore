/**
 *  Copyright (C) 2007 - 2012 GeoSolutions S.A.S.
 *  http://www.geo-solutions.it
 *
 *  GPLv3 + Classpath exception
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

Ext.namespace('gxp.he');

/**
 * @author Lorenzo Natali
 */

/** api: constructor
 *  .. class:: JSChartsPanel(config)
 *
 *    Table that renders pipeline statistic's customer capacity
 *
 */
Ext.namespace('gxp.he.grid');
gxp.he.grid.CustomerCapacityGrid = Ext.extend(Ext.grid.GridPanel,{
    xtype: 'he_grid_customercapacity',
    layout:'fit',
    
    columns: [
        {
            id       :'rate',
            header   : 'Rate', 
            width    : 25,
            sortable : true, 
            dataIndex: 'rate'
        },
        {
            id       : 'customername',
            header   : 'Customer Name', 
            width    : 75, 
            sortable : true, 
            //renderer : 'usMoney', 
            dataIndex: 'customername'
        },
        {

            id: 'capacity', 
            header   : 'Capacity',
            dataIndex: 'capacity',
            fakebar : [
            '<div class="x-progress-wrap">',
                '<div class="x-progress-inner">',
                    '<div class="x-progress-bar" style="height: 16px; width: {barwidth}px;">',
                    '<div class="x-progress-text" style="z-index: 99; width: {textwidth}px;text-align:left;margin: 1px 5px 1px 5px;padding: 0px;"><div style="width: {factor}px; height: 18px;">{progress}</div></div>',
                '</div>',
                '<div class="x-progress-text x-progress-text-back"><div style="width: {factor}px; height: 18px;text-align:left;">{progress}</div></div>',
                '</div>',
            '</div>'].join(''),
            width: 50, 
            max: 250,
            renderer : function(val, metaData, record, rowIndex, colIndex, store) {
                if(val) {
                    var progress = Math.round((val || 0) * 100) / 100;
                    var id = Ext.id();
                    var shift = 4;
                    var factor = this.width ;

                    return '<span id="progressbar-' + id + '">' + 
                            this.fakebar
                                .replace(/\{progress\}/g,progress) 
                                .replace(/\{factor\}/g,( factor))
                                .replace(/\{barwidth\}/g,( factor/ this.max * progress))
                                .replace(/\{textwidth\}/g,Math.max((factor / this.max * progress) - shift,0))
                        + '</span>';
                } else {
                    return '';
                }
            }
        }
    ]

});
Ext.reg(gxp.he.grid.CustomerCapacityGrid.prototype.xtype, gxp.he.grid.CustomerCapacityGrid);