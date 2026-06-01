import { datagridgrowth } from './getdata';
import editor from './editor';
import rhchInit from './rhchInit';
import formula from './formula';
import { luckysheetrefreshgrid } from './refresh';
import sheetmanage from '../controllers/sheetmanage';
import Store from '../store';

export default function luckysheetcreatesheet(colwidth, rowheight, data, cfg, active) {
    if(active == null){
        active = true;
    }

    Store.visibleRowPositions = [];
    Store.visibleColPositions = [];
    Store.sheetWidth = 0;
    Store.rh_height = 0;
    Store.zoomRatio = 1;

    if(cfg != null){
        Store.config = cfg;
    }
    else{
        Store.config = {};
    }

    if (data.length == 0) {
        Store.sheetData = datagridgrowth(data, rowheight, colwidth);
    }
    else if (data.length < rowheight && data[0].length < colwidth) {
        Store.sheetData = datagridgrowth(data, rowheight - data.length, colwidth - data[0].length);
    }
    else if (data.length < rowheight) {
        Store.sheetData = datagridgrowth(data, rowheight - data.length, 0);
    }
    else if (data[0].length < colwidth) {
        Store.sheetData = datagridgrowth(data, 0, colwidth - data[0].length);
    }
    else {
        Store.sheetData = data;
    }

    editor.webWorkerFlowDataCache(Store.sheetData);//worker存数据

    rhchInit(rowheight, colwidth);

    if(active){
        sheetmanage.showSheet();

        setTimeout(function () {
            sheetmanage.restoreCache();
            formula.execFunctionGroup();
            sheetmanage.restoreSheetAll(Store.currentSheetIndex);
            luckysheetrefreshgrid();
        }, 1);
    }
}
