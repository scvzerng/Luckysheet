import rhchInit from '../rhchInit';
import formula from '../formula';
import editor from '../editor';
import { setcellvalue } from '../setdata';
import { getcellFormula } from '../getdata';
import { computeRowlenArr } from '../getRowlen';
import { 
    luckysheetDrawMain, 
    luckysheetDrawgridRowTitle, 
    luckysheetDrawgridColumnTitle 
} from '../draw';
import luckysheetFreezen from '../../controllers/freezen';
import sheetmanage from '../../controllers/sheetmanage';
import luckysheetPostil from '../../controllers/postil';
import hyperlinkCtrl from '../../controllers/hyperlinkCtrl';
import { createFilterOptions } from '../../controllers/filter';
import { getSheetIndex } from '../../methods/get';
import { selectHightlightShow } from '../../controllers/select';
import Store from '../../store';

let refreshCanvasTimeOut;

function getRefreshCanvasTimeOut() {
    return refreshCanvasTimeOut;
}

function setRefreshCanvasTimeOut(value) {
    refreshCanvasTimeOut = value;
}

function clearRefreshCanvasTimeOut() {
    clearTimeout(refreshCanvasTimeOut);
    refreshCanvasTimeOut = undefined;
}

function runExecFunction(range, index, data){
    formula.execFunctionExist = [];
    for(let s = 0; s < range.length; s++){
        for(let r = range[s].row[0]; r <= range[s].row[1]; r++){
            for(let c = range[s].column[0]; c <= range[s].column[1]; c++){
                formula.execFunctionExist.push({ "r": r, "c": c, "i": index });
            }
        }
    }
    formula.execFunctionExist.reverse();
    formula.execFunctionGroup(null, null, null, null, data);
    formula.execFunctionGlobalData = null;
}

function jfrefreshgrid(data, range, allParam, isRunExecFunction = true, isRefreshCanvas = true) {
    if(data == null){
        data = Store.flowdata;
    }

    if(range == null){
        range = Store.luckysheet_select_save;
    }
    range = JSON.parse(JSON.stringify(range));

    clearTimeout(refreshCanvasTimeOut);

    //关联参数
    if(allParam == null){
        allParam = {};
    }

    let cfg = allParam["cfg"];  //config
    let calc = allParam["calc"];
    let RowlChange = allParam["RowlChange"];  //行高改变
    let cdformat = allParam["cdformat"];  //条件格式
    let dynamicArray = allParam["dynamicArray"];  //动态数组
    let hyperlink = allParam["hyperlink"];

    let file = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)];

    if (Store.clearjfundo) {
        Store.jfundo.length  = 0;

        let curConfig;
        if(cfg == null){
            curConfig = $.extend(true, {}, Store.config);
        }
        else{
            curConfig = $.extend(true, {}, cfg);
        }

        let curCdformat;
        if(cdformat == null){
            curCdformat = $.extend(true, [], file["luckysheet_conditionformat_save"]);
        }
        else{
            curCdformat = cdformat;
        }

        let curDynamicArray;
        if(dynamicArray == null){
            curDynamicArray = $.extend(true, [], file["dynamicArray"]);
        }
        else{
            curDynamicArray = dynamicArray;
        }
        
        Store.jfredo.push({ 
            "type": "datachange", 
            "data": Store.flowdata, 
            "curdata": data,
            "sheetIndex": Store.currentSheetIndex, 
            "config": $.extend(true, {}, Store.config), 
            "curConfig": curConfig,
            "calc": $.extend(true, [], file.calcChain),
            "curCalc": calc,
            "cdformat":  $.extend(true, [], file["luckysheet_conditionformat_save"]),
            "curCdformat": curCdformat,
            "RowlChange": RowlChange,
            "dynamicArray": $.extend(true, [], file["dynamicArray"]),
            "curDynamicArray": curDynamicArray,
            "hyperlink": hyperlink && $.extend(true, {}, file.hyperlink),
            "curHyperlink": hyperlink,
            "range": range,
            "dataRange": [...file.luckysheet_select_save]// 保留操作时的选区
        });
    }

    //Store.flowdata
    Store.flowdata = data;
    editor.webWorkerFlowDataCache(Store.flowdata);//worker存数据
    file.data = Store.flowdata;

    // 必须要处理，可能之前的config为空，则也需要清空
    if(cfg != null){
        Store.config = cfg;
        file.config = Store.config;


        if(RowlChange != null){
            jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
        }
    }

    if(calc != null){
        file.calcChain = calc;
    }

    //condition format, null or empty array are not processed
    if(cdformat != null && cdformat.length !== 0){
        file["luckysheet_conditionformat_save"] = cdformat;

    }

    //动态数组
    if(dynamicArray != null){
        file["dynamicArray"] = dynamicArray;

    }

    if(hyperlink != null){
        file["hyperlink"] = hyperlink;
        hyperlinkCtrl.hyperlink = hyperlink;
    }

    //更新数据的范围
    for(let s = 0; s < range.length; s++){
        let r1 = range[s].row[0];
        let c1 = range[s].column[0];

    }
    //单元格数据更新联动
    if (isRunExecFunction) {
        runExecFunction(range, Store.currentSheetIndex, data);
    }
    //刷新表格
    if(isRefreshCanvas){
        refreshCanvasTimeOut = setTimeout(function () {
            luckysheetrefreshgrid();
        }, 1);
    }

    /* 选区同步 */
    selectHightlightShow();
    window.luckysheet_getcelldata_cache = null;
}

function jfrefreshgridall(colwidth, rowheight, data, cfg, range, ctrlType, ctrlValue, cdformat, isRefreshCanvas=true) {
    let redo = {}, isRunExecFunction=false;
    clearTimeout(refreshCanvasTimeOut);
    if (ctrlType == "cellRowChange") {
        redo["type"] = "cellRowChange";
        redo["config"] = $.extend(true, {}, Store.config);
        redo["curconfig"] = $.extend(true, {}, cfg);

        redo["range"] = $.extend(true, [], Store.luckysheet_select_save);
        redo["currange"] = range;

        redo["ctrlType"] = ctrlType;
        redo["ctrlValue"] = ctrlValue;

        let setfield = cfg["rowlen"];

        if(setfield == null){
            setfield = {};
        }

    }
    else if (ctrlType == "resizeC") {
        redo["type"] = "resize";
        redo["config"] = $.extend(true, {}, Store.config);
        redo["curconfig"] = $.extend(true, {}, cfg);

        redo["range"] = $.extend(true, [], Store.luckysheet_select_save);
        redo["currange"] = range;

        redo["ctrlType"] = ctrlType;
        redo["ctrlValue"] = ctrlValue;

        let setfield = cfg["columnlen"];

        if(setfield == null){
            setfield = {};
        }

    }
    else if (ctrlType.indexOf("extend")>-1) {
        redo["type"] = "extend";
        redo["config"] = $.extend(true, {}, Store.config);
        redo["curconfig"] = $.extend(true, {}, cfg);

        redo["range"] = $.extend(true, [], Store.luckysheet_select_save);
        redo["currange"] = range;

        redo["ctrlType"] = ctrlType;
        redo["ctrlValue"] = ctrlValue;

    }
    else if (ctrlType.indexOf("dele")>-1) {
        redo["type"] = "dele";
        redo["config"] = $.extend(true, {}, Store.config);
        redo["curconfig"] = $.extend(true, {}, cfg);

        redo["range"] = $.extend(true, [], Store.luckysheet_select_save);
        redo["currange"] = range;

        redo["ctrlType"] = ctrlType;
        redo["ctrlValue"] = ctrlValue;

    }
    else {
        redo["type"] = "datachangeAll";

        redo["range"] = $.extend(true, [], Store.luckysheet_select_save);
        redo["currange"] = range;

        redo["ctrlType"] = ctrlType;
        redo["ctrlValue"] = ctrlValue;

        isRunExecFunction = true;
    }

    if (Store.clearjfundo) {
        Store.jfundo.length  = 0;

        redo["data"] = Store.flowdata;
        redo["curdata"] = data;
        redo["sheetIndex"] = Store.currentSheetIndex;
        redo["cdformat"] = $.extend(true, [], Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"]);
        redo["curCdformat"] = cdformat;

        Store.jfredo.push(redo);
    }

    //Store.flowdata
    Store.flowdata = data;
    editor.webWorkerFlowDataCache(data);//worker存数据
    Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].data = Store.flowdata;

    //config
    if (cfg != null) {
        Store.config = cfg;
        Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].config = Store.config;

    }

    //条件格式
    if(cdformat != null){
        Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"] = cdformat;
    
    }

    //选区
    Store.luckysheet_select_save = $.extend(true, [], range);
    if(Store.luckysheet_select_save.length > 0){
        //有选区时，刷新一下选区
        selectHightlightShow();
    }


    if(isRunExecFunction){
        //单元格数据更新联动
        runExecFunction(range, Store.currentSheetIndex, data);
    }

    //行高、列宽 刷新  
    jfrefreshgrid_rhcw(rowheight, colwidth);

    if(isRefreshCanvas){
        refreshCanvasTimeOut = setTimeout(function () {
            luckysheetrefreshgrid();
        }, 1);
    }
    

    sheetmanage.storeSheetParamALL();
    
    window.luckysheet_getcelldata_cache = null;
}

function jfrefreshrange(data, range, cdformat) {
    clearTimeout(refreshCanvasTimeOut);

    if (Store.clearjfundo) {
        Store.jfundo.length  = 0;

        Store.jfredo.push({ 
            "type": "rangechange", 
            "data": Store.flowdata, 
            "curdata": data,
            "range": range, 
            "sheetIndex": Store.currentSheetIndex,
            "cdformat":  $.extend(true, [],  Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"]),
            "curCdformat": cdformat 
        });
    }

    //flowdata
    Store.flowdata = data;
    editor.webWorkerFlowDataCache(Store.flowdata);//worker存数据

    Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].data = Store.flowdata;

    //条件格式
    if(cdformat != null){
        Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"] = cdformat;
    }

    //单元格数据更新联动
    runExecFunction(range, Store.currentSheetIndex, data);

    //刷新表格
    refreshCanvasTimeOut = setTimeout(function () {
        luckysheetrefreshgrid();
    }, 1);
}

export { jfrefreshgrid, jfrefreshgridall, jfrefreshrange, getRefreshCanvasTimeOut, setRefreshCanvasTimeOut, clearRefreshCanvasTimeOut, runExecFunction };
