import formula from '../formula';
import editor from '../editor';
import { 
    luckysheetDrawMain, 
    luckysheetDrawgridRowTitle, 
    luckysheetDrawgridColumnTitle 
} from '../draw';
import sheetmanage from '../../controllers/sheetmanage';
import hyperlinkCtrl from '../../controllers/hyperlinkCtrl';
import { getCurrentFile, syncConfigToStore, syncDataToStore, getDataSize } from '../../utils/storeAccess.js';
import { selectHightlightShow } from '../../controllers/select';
import Store from '../../store';
import { luckysheetrefreshgrid, jfrefreshgrid_rhcw } from './refreshCanvas';
import { getRefreshCanvasTimeOut, setRefreshCanvasTimeOut, clearRefreshCanvasTimeOut } from './refreshState';

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
        data = Store.sheetData;
    }

    if(range == null){
        range = Store.luckysheet_select_save;
    }
    range = JSON.parse(JSON.stringify(range));

    clearRefreshCanvasTimeOut();
    if(allParam == null){
        allParam = {};
    }

    let cfg = allParam["cfg"];  //config
    let calc = allParam["calc"];
    let RowlChange = allParam["RowlChange"];  //行高改变
    let cdformat = allParam["cdformat"];  //条件格式
    let dynamicArray = allParam["dynamicArray"];  //动态数组
    let hyperlink = allParam["hyperlink"];

    let file = getCurrentFile();

    if (Store.clearjfundo) {
        Store.jfundo.length  = 0;

        let curConfig;
        if(cfg == null){
            curConfig = structuredClone(Store.config);
        }
        else{
            curConfig = structuredClone(cfg);
        }

        let curCdformat;
        if(cdformat == null){
            curCdformat = structuredClone(file["luckysheet_conditionformat_save"]);
        }
        else{
            curCdformat = cdformat;
        }

        let curDynamicArray;
        if(dynamicArray == null){
            curDynamicArray = structuredClone(file["dynamicArray"]);
        }
        else{
            curDynamicArray = dynamicArray;
        }
        
        Store.jfredo.push({ 
            "type": "datachange", 
            "data": Store.sheetData, 
            "curdata": data,
            "sheetIndex": Store.currentSheetIndex, 
            "config": structuredClone(Store.config), 
            "curConfig": curConfig,
            "calc": structuredClone(file.calcChain),
            "curCalc": calc,
            "cdformat":  structuredClone(file["luckysheet_conditionformat_save"]),
            "curCdformat": curCdformat,
            "RowlChange": RowlChange,
            "dynamicArray": structuredClone(file["dynamicArray"]),
            "curDynamicArray": curDynamicArray,
            "hyperlink": hyperlink && structuredClone(file.hyperlink),
            "curHyperlink": hyperlink,
            "range": range,
            "dataRange": [...file.luckysheet_select_save]// 保留操作时的选区
        });
    }

    //Store.sheetData
    Store.sheetData = data;
    editor.webWorkerFlowDataCache(Store.sheetData);//worker存数据
    file.data = Store.sheetData;

    // 必须要处理，可能之前的config为空，则也需要清空
    if(cfg != null){
        Store.config = cfg;
        file.config = Store.config;


        if(RowlChange != null){
            let _dataSize = getDataSize();
            jfrefreshgrid_rhcw(_dataSize.rowCount, _dataSize.colCount);
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
        setRefreshCanvasTimeOut(setTimeout(function () {
            luckysheetrefreshgrid();
        }, 1));
    }

    /* 选区同步 */
    selectHightlightShow();
    window.luckysheet_getcelldata_cache = null;
}

function jfrefreshgridall(colwidth, rowheight, data, cfg, range, ctrlType, ctrlValue, cdformat, isRefreshCanvas=true) {
    let redo = {}, isRunExecFunction=false;
    clearRefreshCanvasTimeOut();
    if (ctrlType == "cellRowChange") {
        redo["type"] = "cellRowChange";
        redo["config"] = structuredClone(Store.config);
        redo["curconfig"] = structuredClone(cfg);

        redo["range"] = structuredClone(Store.luckysheet_select_save);
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
        redo["config"] = structuredClone(Store.config);
        redo["curconfig"] = structuredClone(cfg);

        redo["range"] = structuredClone(Store.luckysheet_select_save);
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
        redo["config"] = structuredClone(Store.config);
        redo["curconfig"] = structuredClone(cfg);

        redo["range"] = structuredClone(Store.luckysheet_select_save);
        redo["currange"] = range;

        redo["ctrlType"] = ctrlType;
        redo["ctrlValue"] = ctrlValue;

    }
    else if (ctrlType.indexOf("dele")>-1) {
        redo["type"] = "dele";
        redo["config"] = structuredClone(Store.config);
        redo["curconfig"] = structuredClone(cfg);

        redo["range"] = structuredClone(Store.luckysheet_select_save);
        redo["currange"] = range;

        redo["ctrlType"] = ctrlType;
        redo["ctrlValue"] = ctrlValue;

    }
    else {
        redo["type"] = "datachangeAll";

        redo["range"] = structuredClone(Store.luckysheet_select_save);
        redo["currange"] = range;

        redo["ctrlType"] = ctrlType;
        redo["ctrlValue"] = ctrlValue;

        isRunExecFunction = true;
    }

    if (Store.clearjfundo) {
        Store.jfundo.length  = 0;

        redo["data"] = Store.sheetData;
        redo["curdata"] = data;
        redo["sheetIndex"] = Store.currentSheetIndex;
        redo["cdformat"] = structuredClone(getCurrentFile()["luckysheet_conditionformat_save"]);
        redo["curCdformat"] = cdformat;

        Store.jfredo.push(redo);
    }

    //Store.sheetData
    Store.sheetData = data;
    editor.webWorkerFlowDataCache(data);//worker存数据
    syncDataToStore();

    //config
    if (cfg != null) {
        Store.config = cfg;
        syncConfigToStore();

    }

    //条件格式
    if(cdformat != null){
        getCurrentFile()["luckysheet_conditionformat_save"] = cdformat;
    
    }

    //选区
    Store.luckysheet_select_save = structuredClone(range);
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
        setRefreshCanvasTimeOut(setTimeout(function () {
            luckysheetrefreshgrid();
        }, 1));
    }


    sheetmanage.storeSheetParamALL();
    
    window.luckysheet_getcelldata_cache = null;
}

function jfrefreshrange(data, range, cdformat) {
    clearRefreshCanvasTimeOut();

    if (Store.clearjfundo) {
        Store.jfundo.length  = 0;

        Store.jfredo.push({ 
            "type": "rangechange", 
            "data": Store.sheetData, 
            "curdata": data,
            "range": range, 
            "sheetIndex": Store.currentSheetIndex,
            "cdformat":  structuredClone(getCurrentFile()["luckysheet_conditionformat_save"]),
            "curCdformat": cdformat 
        });
    }

    //flowdata
    Store.sheetData = data;
    editor.webWorkerFlowDataCache(Store.sheetData);//worker存数据

    syncDataToStore();

    //条件格式
    if(cdformat != null){
        getCurrentFile()["luckysheet_conditionformat_save"] = cdformat;
    }

    //单元格数据更新联动
    runExecFunction(range, Store.currentSheetIndex, data);

    //刷新表格
    setRefreshCanvasTimeOut(setTimeout(function () {
        luckysheetrefreshgrid();
    }, 1));
}

export { jfrefreshgrid, jfrefreshgridall, jfrefreshrange, getRefreshCanvasTimeOut, setRefreshCanvasTimeOut, clearRefreshCanvasTimeOut, runExecFunction };
