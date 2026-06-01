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
import hyperlinkCtrl from '../../controllers/hyperlinkCtrl';
import { createFilterOptions } from '../../controllers/filter';
import { selectHightlightShow } from '../../controllers/select';
import Store from '../../store';
import { getCurrentFile, syncConfigToStore, syncDataToStore, getDataSize, getFileBySheetIndex } from '../../utils/storeAccess.js';
import { isRowHidden } from '../../utils/util';
import { getScrollPosition } from '../../utils/domUtils.js';

import {  clearRefreshCanvasTimeOut,  setRefreshCanvasTimeOut } from './refreshCore';
import { luckysheetrefreshgrid, jfrefreshgrid_rhcw } from './refreshCanvas';

function jfrefreshgrid_adRC(data, cfg, ctrlType, ctrlValue, calc, filterObj, cf, af, freezen, hyperlink){
    let file = getCurrentFile();
    //merge改变对应的单元格值改变
    let mcData = [];
    for(let m in cfg["merge"]){
        let mc = cfg["merge"][m];

        for(let r = mc.r; r <= mc.r + mc.rs - 1; r++){
            for(let c = mc.c; c <= mc.c + mc.cs - 1; c++){
                if(data[r][c] == null){
                    data[r][c] = {};
                }

                if(r == mc.r && c == mc.c){
                    data[r][c].mc = mc;
                }
                else{
                    data[r][c].mc = { "r": mc.r, "c": mc.c };
                }

                mcData.push({ "r": r, "c": c });                       
            }
        }
    }

    //公式链中公式范围改变对应单元格值的改变
    let funcData = [];
    // if(calc.length > 0){
    //     // 取消execFunctionGroupData，改用execFunctionGlobalData
    //     // formula.execFunctionGroupData = data;

    //     for(let i = 0; i < calc.length; i++){
    //         let clc = calc[i];
    //         let clc_r = clc.r, clc_c = clc.c, clc_i = clc.index, clc_funcStr =  getcellFormula(clc_r, clc_c, clc_i, data);
            
    //         let clc_result = formula.execfunction(clc_funcStr, clc_r, clc_c, clc_i,null, true);
    //         clc.func = clc_result;

    //         if(data[clc_r][clc_c].f == clc_funcStr){
    //             setcellvalue(clc_r, clc_c, data, clc_result[1]);
    //             // funcData存储当前结果没有用处，每次还是需要从calc公式链实时从当前数据中计算比较靠谱
    //             // funcData.push({ "r": clc_r, "c": clc_c });
    //         }
    //     }
    // }

    if(Store.clearjfundo){
        Store.jfundo.length  = 0;

        Store.jfredo.push({
            "type": ctrlType,
            "sheetIndex": Store.currentSheetIndex,
            "data": Store.sheetData,
            "curData": data,
            "config": structuredClone(Store.config),
            "curConfig": cfg,
            "ctrlValue": ctrlValue,
            "mcData": mcData,
            "calc": structuredClone(file.calcChain),
            "curCalc": calc,
            "funcData": funcData,
            "filterObj": { "filter_select": structuredClone(file.filter_select), "filter": structuredClone(file.filter) },
            "curFilterObj": filterObj,
            "cf": structuredClone(file.luckysheet_conditionformat_save),
            "curCf": cf,
            "af": structuredClone(file.luckysheet_alternateformat_save),
            "curAf": af,
            "freezen": { "freezenhorizontaldata": luckysheetFreezen.freezenhorizontaldata, "freezenverticaldata": luckysheetFreezen.freezenverticaldata },
            "curFreezen": freezen,
            "hyperlink": structuredClone(file.hyperlink),
            "curHyperlink": hyperlink,
            "range": file.luckysheet_select_save,
            "dataRange": [...file.luckysheet_select_save]// 保留操作时的选区
        });
    }

    let index = ctrlValue.index,
        len = ctrlValue.len,
        rc = ctrlValue.rc;

    if(ctrlType == "addRC"){
        let direction = ctrlValue.direction,
            restore = ctrlValue.restore;

        let addData = [];
        if(restore){
            if(rc == "r"){
                let st_r;
                if(direction == "lefttop"){
                    st_r = index;
                }
                else if(direction == "rightbottom"){
                    st_r = index + 1;
                }
                let ed_r = st_r + len - 1;

                for(let r = st_r; r <= ed_r; r++){
                    let row = [];
                    for(let c = 0; c < data[0].length; c++){
                        let cell = data[r][c];
                        row.push(cell);
                    }
                    addData.push(row);
                }
            }
            else if(rc == "c"){
                let st_c;
                if(direction == "lefttop"){
                    st_c = index;
                }
                else if(direction == "rightbottom"){
                    st_c = index + 1;
                }
                let ed_c = st_c + len - 1;

                for(let r = 0; r < data.length; r++){
                    let row = [];
                    for(let c = st_c; c <= ed_c; c++){
                        let cell = data[r][c];
                        row.push(cell);
                    }
                    addData.push(row);
                }
            }
        }

    }
    else if(ctrlType == "delRC"){
    }

    //Store.sheetData
    Store.sheetData = data;
    editor.webWorkerFlowDataCache(Store.sheetData);//worker存数据
    file.data = data;

    //config
    Store.config = cfg;
    file.config = Store.config;

    //mcData
    for(let i = 0; i < mcData.length; i++){
        let mcData_r = mcData[i].r,
            mcData_c = mcData[i].c;

    }

    //公式链中公式范围改变对应单元格值的改变
    if(calc.length > 0){
        // 取消execFunctionGroupData，改用execFunctionGlobalData
        // formula.execFunctionGroupData = data;

        for(let i = 0; i < calc.length; i++){
            let clc = calc[i];
            let clc_r = clc.r, clc_c = clc.c, clc_i = clc.index, clc_funcStr =  getcellFormula(clc_r, clc_c, clc_i, data);
            
            let clc_result = formula.execfunction(clc_funcStr, clc_r, clc_c, clc_i,null, true);
            clc.func = clc_result;

            if(data[clc_r][clc_c].f == clc_funcStr){
                setcellvalue(clc_r, clc_c, data, clc_result[1]);
                // funcData存储当前结果没有用处，每次还是需要从calc公式链实时从当前数据中计算比较靠谱
                // funcData.push({ "r": clc_r, "c": clc_c });
            }
        }
    }

    //calc函数链
    file.calcChain = calc;
    for(let i = 0; i < funcData.length; i++){
        let funcData_r = funcData[i].r,
            funcData_c = funcData[i].c;

    }

    //筛选配置
    if(filterObj != null){
        file.filter_select = filterObj.filter_select;
        file.filter = filterObj.filter;
    }
    else{
        file.filter_select = null;
        file.filter = null;
    }
    createFilterOptions(file.filter_select, file.filter);

    //条件格式配置
    file.luckysheet_conditionformat_save = cf;

    //交替颜色配置
    file.luckysheet_alternateformat_save = af;

    //冻结配置
    if(freezen != null){
        luckysheetFreezen.freezenhorizontaldata = freezen.freezenhorizontaldata;
        luckysheetFreezen.freezenverticaldata = freezen.freezenverticaldata;
    }
    else{
        luckysheetFreezen.freezenhorizontaldata = null;
        luckysheetFreezen.freezenverticaldata = null;
    }

    //数据验证

    //超链接
    hyperlinkCtrl.hyperlink = hyperlink;
    file.hyperlink = hyperlink;

    //行高、列宽刷新
    let _dataSize = getDataSize();
    jfrefreshgrid_rhcw(_dataSize.rowCount, _dataSize.colCount);
}

//删除单元格 刷新表格
function jfrefreshgrid_deleteCell(data, cfg, ctrl, calc, filterObj, cf, hyperlink){
    let file = getCurrentFile();
    clearRefreshCanvasTimeOut();
    //merge改变对应的单元格值改变
    let mcData = [];
    if(JSON.stringify(cfg["merge"]) == "{}"){
        for(let r = 0; r < data.length; r++){
            for(let c = 0; c < data[0].length; c++){
                let cell = data[r][c];
    
                if(cell != null && cell.mc != null){
                    delete cell.mc;
                    mcData.push({ "r": r, "c": c });
                }
            }
        }
    }
    else{
        for(let m in cfg["merge"]){
            let mc = cfg["merge"][m];
    
            for(let r = mc.r; r <= mc.r + mc.rs - 1; r++){
                for(let c = mc.c; c <= mc.c + mc.cs - 1; c++){
                    if(data[r][c] == null){
                        data[r][c] = {};
                    }
    
                    // if(r == mc.r && c == mc.c){
                    //     data[r][c].mc = mc;
                    // }
                    // else{
                    //     data[r][c].mc = { "r": mc.r, "c": mc.c };
                    // }
    
                    // mcData.push({ "r": r, "c": c });        
                    

                    if(r == mc.r && c == mc.c){
                        if(JSON.stringify(data[r][c].mc) !=JSON.stringify(mc)){
                            data[r][c].mc = mc;
                            mcData.push({ "r": r, "c": c });   
                        }
                    }
                    else{
                        let tempMc = { "r": mc.r, "c": mc.c };
                        if(JSON.stringify(data[r][c].mc) != JSON.stringify(tempMc)){
                            data[r][c].mc = tempMc;
                            mcData.push({ "r": r, "c": c });   
                        }
                    }   
                }
            }
        }
    }

    //公式链中公式范围改变对应单元格值的改变
    let funcData = [];
    // if(calc.length > 0){
    //     // formula.execFunctionGroupData = data;

    //     for(let i = 0; i < calc.length; i++){
    //         let clc = calc[i];
    //         let clc_r = clc.r, clc_c = clc.c, clc_i = clc.index, clc_funcStr =  getcellFormula(clc_r, clc_c, clc_i, data);
    //         let clc_result = formula.execfunction(clc_funcStr, clc_r, clc_c, clc_i,null, true);
    //         clc.func = clc_result;

    //         if(data[clc_r][clc_c].f == clc_funcStr){
    //             setcellvalue(clc_r, clc_c, data, clc_result[1]);
    //             funcData.push({ "r": clc_r, "c": clc_c });
    //         }
    //     }
    // }

    if(Store.clearjfundo){
        Store.jfundo.length  = 0;

        Store.jfredo.push({
            "type": "deleteCell",
            "sheetIndex": Store.currentSheetIndex,
            "ctrl": ctrl,
            "data": Store.sheetData,
            "curData": data,
            "config": structuredClone(Store.config),
            "curConfig": cfg,
            "mcData": mcData,
            "calc": structuredClone(file.calcChain),
            "curCalc": calc,
            "funcData": funcData,
            "filterObj": { "filter_select": structuredClone(file.filter_select), "filter": structuredClone(file.filter) },
            "curFilterObj": filterObj,
            "cf": structuredClone(file.luckysheet_conditionformat_save),
            "curCf": cf,
            "hyperlink": structuredClone(file.hyperlink),
            "curHyperlink": hyperlink,
            "range": file.luckysheet_select_save,
            "dataRange": [...file.luckysheet_select_save] // 保留操作时的选区
        });
    }

    //Store.sheetData
    Store.sheetData = data;
    editor.webWorkerFlowDataCache(Store.sheetData);//worker存数据
    file.data = data;

    //config
    Store.config = cfg;
    file.config = Store.config;

    //mcData
    for(let i = 0; i < mcData.length; i++){
        let mcData_r = mcData[i].r,
            mcData_c = mcData[i].c;

    }

    //公式链中公式范围改变对应单元格值的改变
    if(calc.length > 0){
        // formula.execFunctionGroupData = data;

        for(let i = 0; i < calc.length; i++){
            let clc = calc[i];
            let clc_r = clc.r, clc_c = clc.c, clc_i = clc.index, clc_funcStr =  getcellFormula(clc_r, clc_c, clc_i, data);
            let clc_result = formula.execfunction(clc_funcStr, clc_r, clc_c, clc_i,null, true);
            clc.func = clc_result;

            if(data[clc_r][clc_c].f == clc_funcStr){
                setcellvalue(clc_r, clc_c, data, clc_result[1]);
                // funcData.push({ "r": clc_r, "c": clc_c });
            }
        }
    }

    //calc函数链
    file.calcChain = calc;
    for(let i = 0; i < funcData.length; i++){
        let funcData_r = funcData[i].r,
            funcData_c = funcData[i].c;

    }

    //筛选配置
    if(filterObj != null){
        file.filter_select = filterObj.filter_select;
        file.filter = filterObj.filter;
    }
    else{
        file.filter_select = null;
        file.filter = null;
    }
    createFilterOptions(file.filter_select, file.filter);

    //条件格式配置
    file.luckysheet_conditionformat_save = cf;

    //数据验证

    //超链接
    hyperlinkCtrl.hyperlink = hyperlink;
    file.hyperlink = hyperlink;

    setRefreshCanvasTimeOut(setTimeout(function () {
        luckysheetrefreshgrid();
    }, 1));
}

//复制剪切 刷新表格
function jfrefreshgrid_pastcut(source, target, RowlChange){
    //单元格数据更新联动
    let execF_rc = {};
    formula.execFunctionExist = [];
    clearRefreshCanvasTimeOut();
    for(let r = source["range"].row[0]; r <= source["range"].row[1]; r++){
        for(let c = source["range"].column[0]; c <= source["range"].column[1]; c++){
            if((r + "_" + c + "_" + source["sheetIndex"]) in execF_rc){
                continue;
            }

            execF_rc[r + "_" + c + "_" + source["sheetIndex"]] = 0;
            formula.execFunctionExist.push({ "r": r, "c": c, "i": source["sheetIndex"] });
        }
    }

    for(let r = target["range"].row[0]; r <= target["range"].row[1]; r++){
        for(let c = target["range"].column[0]; c <= target["range"].column[1]; c++){
            if((r + "_" + c + "_" + target["sheetIndex"]) in execF_rc){
                continue;
            }

            execF_rc[r + "_" + c + "_" + target["sheetIndex"]] = 0;
            formula.execFunctionExist.push({ "r": r, "c": c, "i": target["sheetIndex"] });
        }
    }



    if(Store.clearjfundo){
        Store.jfundo.length  = 0;

        Store.jfredo.push({
            "type": "pasteCut",
            "source": source,
            "target": target,
            "RowlChange": RowlChange
        })
    }

    //config
    let rowHeight;
    if(Store.currentSheetIndex == source["sheetIndex"]){
        Store.config = source["curConfig"];
        rowHeight = source["curData"].length;
        getFileBySheetIndex(target["sheetIndex"])["config"] = target["curConfig"];
    }
    else if(Store.currentSheetIndex == target["sheetIndex"]){
        Store.config = target["curConfig"];
        rowHeight = target["curData"].length;
        getFileBySheetIndex(source["sheetIndex"])["config"] = source["curConfig"];
    }

    if(RowlChange){
        Store.visibledatarow = [];
        Store.rh_height = 0;
        
        for (let i = 0; i < rowHeight; i++) {
            let rowlen = Store.defaultrowlen;
            
            if (Store.config["rowlen"] != null && Store.config["rowlen"][i] != null) {
                rowlen = Store.config["rowlen"][i];
            }

            if (isRowHidden(i)) {
                rowlen = Store.config["rowhidden"][i];
                Store.visibledatarow.push(Store.rh_height);
                continue;
            }
            else {
                Store.rh_height += rowlen + 1;
            }

            Store.visibledatarow.push(Store.rh_height);//行的临时长度分布
        }
        Store.rh_height += 80;
        // sheetmanage.showSheet();

        if(Store.currentSheetIndex == source["sheetIndex"]){
            let rowlenArr = computeRowlenArr(target["curData"].length, target["curConfig"]);
            getFileBySheetIndex(target["sheetIndex"])["visibledatarow"] = rowlenArr;
        }
        else if(Store.currentSheetIndex == target["sheetIndex"]){
            let rowlenArr = computeRowlenArr(source["curData"].length, source["curConfig"]);
            getFileBySheetIndex(source["sheetIndex"])["visibledatarow"] = rowlenArr;
        }
    }

    //Store.sheetData
    if(Store.currentSheetIndex == source["sheetIndex"]){
        Store.sheetData = source["curData"];
        getFileBySheetIndex(target["sheetIndex"])["data"] = target["curData"];
    }
    else if(Store.currentSheetIndex == target["sheetIndex"]){
        Store.sheetData = target["curData"];
        getFileBySheetIndex(source["sheetIndex"])["data"] = source["curData"];
    }
    editor.webWorkerFlowDataCache(Store.sheetData);//worker存数据
    syncDataToStore();
    
    //luckysheet_select_save
    if(Store.currentSheetIndex == target["sheetIndex"]){
        Store.selections = [{"row": target["range"].row, "column": target["range"].column}];
    }
    else{
        Store.selections = [{"row": source["range"].row, "column": source["range"].column}];
    }
    if(Store.selections.length > 0){
        //有选区时，刷新一下选区
        selectHightlightShow();
    }

    //条件格式
    getFileBySheetIndex(source["sheetIndex"]).luckysheet_conditionformat_save = source["curCdformat"];
    getFileBySheetIndex(target["sheetIndex"]).luckysheet_conditionformat_save = target["curCdformat"];

    //数据验证
    if(Store.currentSheetIndex == source["sheetIndex"]){
    }
    else if(Store.currentSheetIndex == target["sheetIndex"]){
    }

    formula.execFunctionExist.reverse();
    formula.execFunctionGroup(null, null, null, null, target["curData"]);
    formula.execFunctionGlobalData = null;

    let file = getCurrentFile();
    let scroll = getScrollPosition();
    file.scrollTop  = scroll.scrollTop;
    file.scrollLeft = scroll.scrollLeft
    
    sheetmanage.showSheet();

    setRefreshCanvasTimeOut(setTimeout(function () {
        luckysheetrefreshgrid();
    }, 1));

    sheetmanage.storeSheetParamALL();

    //saveparam
    //来源表
    //目的表
    
    //来源表
    //目的表

    //来源表
    //目的表

    //来源表
    //目的表
}

export { jfrefreshgrid_adRC, jfrefreshgrid_deleteCell, jfrefreshgrid_pastcut };
