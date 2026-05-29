import locale from "../../locale/locale";
import { getSheetIndex } from "../../methods/get";
import Store from "../../store";
import { luckysheetextendtable, luckysheetdeletetable } from "../extend";
import { jfrefreshgrid_rhcw } from "../refresh";
import tooltip from "../tooltip";
import { isRealNum, isEditMode } from "../validate";

export function insertRowOrColumn(type, index = 0, options = {}) {
    if(!isRealNum(index)){
        return tooltip.info('The index parameter is invalid.', '');
    }

    let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
    let {
        number = 1,
        order = curSheetOrder,
        success
    } = {...options}

    let _locale = locale();
    let locale_info = _locale.info;
    if (!isRealNum(number)) {
        if(isEditMode()){
            alert(locale_info.tipInputNumber);
        } else{
            tooltip.info(locale_info.tipInputNumber, "");
        }
        return;
    }

    number = parseInt(number);
    if (number < 1 || number > 100) {
        if(isEditMode()){
            alert(locale_info.tipInputNumberLimit);
        } else{
            tooltip.info(locale_info.tipInputNumberLimit, "");
        }
        return;
    }

    // 默认在行上方增加行，列左侧增加列
    let sheetIndex;
    if (!isNaN(order)){
        if(Store.luckysheetfile[order]){
            sheetIndex = Store.luckysheetfile[order].index;
        }
    }

    luckysheetextendtable(type, index, number, "lefttop", sheetIndex);

    if (success && typeof success === 'function') {
        success();
    }
}

export function insertRowBottomOrColumnRight(type, index = 0, options = {}) {
    if(!isRealNum(index)){
        return tooltip.info('The index parameter is invalid.', '');
    }

    let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
    let {
        number = 1,
        order = curSheetOrder,
        success
    } = {...options}

    let _locale = locale();
    let locale_info = _locale.info;
    if (!isRealNum(number)) {
        if(isEditMode()){
            alert(locale_info.tipInputNumber);
        } else{
            tooltip.info(locale_info.tipInputNumber, "");
        }
        return;
    }

    number = parseInt(number);
    if (number < 1 || number > 100) {
        if(isEditMode()){
            alert(locale_info.tipInputNumberLimit);
        } else{
            tooltip.info(locale_info.tipInputNumberLimit, "");
        }
        return;
    }

    // 默认在行上方增加行，列左侧增加列
    let sheetIndex;
    if(order){
        if(Store.luckysheetfile[order]){
            sheetIndex = Store.luckysheetfile[order].index;
        }
    }

    luckysheetextendtable(type, index, number, "rightbottom", sheetIndex);

    if (success && typeof success === 'function') {
        success();
    }
}

export function insertRow(row = 0, options = {}) {
    insertRowOrColumn('row', row, options)
}

export function insertRowBottom(row = 0, options = {}) {
    insertRowBottomOrColumnRight('row', row, options)
}

export function insertColumn(column = 0, options = {}) {
    insertRowOrColumn('column', column, options)
}

export function insertColumnRight(column = 0, options = {}) {
    insertRowBottomOrColumnRight('column', column, options)
}

export function deleteRowOrColumn(type, startIndex, endIndex, options = {}) {
    if (!isRealNum(startIndex) || !isRealNum(endIndex)) {
        return tooltip.info('Please enter the index for deleting rows or columns correctly.', '')
    }

    let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
    let {
        order = curSheetOrder,
        success
    } = {...options}


    let sheetIndex;
    if(order){
        if(Store.luckysheetfile[order]){
            sheetIndex = Store.luckysheetfile[order].index;
        }
    }
    luckysheetdeletetable(type, startIndex, endIndex, sheetIndex);

    if (success && typeof success === 'function') {
        success()
    }
}

export function deleteRow(rowStart, rowEnd, options = {}) {
    deleteRowOrColumn('row', rowStart, rowEnd, options)
}

export function deleteColumn(columnStart, columnEnd, options = {}) {
    deleteRowOrColumn('column', columnStart, columnEnd, options)
}

export function hideRowOrColumn(type, startIndex, endIndex, options = {}) {
    if (!isRealNum(startIndex) || !isRealNum(endIndex)) {
        return tooltip.info('Please enter the index for deleting rows or columns correctly.', '')
    }

    let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
    let {
        order = curSheetOrder,
        success
    } = {...options}

    let file = Store.luckysheetfile[order];
    let cfgKey = type === 'row' ? 'rowhidden': 'colhidden';
    let cfg = structuredClone(file.config);
    if(cfg[cfgKey] == null) {
        cfg[cfgKey] = {};
    }

    for (let i = startIndex; i <= endIndex; i++) {
        cfg[cfgKey][i] = 0;
    }

    //保存撤销
    if(Store.clearjfundo){
        let redo = {};
        redo["type"] = type === 'row' ? 'showHidRows' : 'showHidCols';
        redo["sheetIndex"] = file.index;
        redo["config"] = structuredClone(file.config);
        redo["curconfig"] = cfg;

        Store.jfundo.length  = 0;
        Store.jfredo.push(redo);
    }

    Store.luckysheetfile[order].config = cfg;

    // 若操作sheet为当前sheet页，行高、列宽 刷新
    if (order == curSheetOrder) {
        //config
        Store.config = cfg;
        jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
    }

    if (success && typeof success === 'function') {
        success();
    }
}

export function showRowOrColumn(type, startIndex, endIndex, options = {}) {
    if (!isRealNum(startIndex) || !isRealNum(endIndex)) {
        return tooltip.info('Please enter the index for deleting rows or columns correctly.', '')
    }

    let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
    let {
        order = curSheetOrder,
        success
    } = {...options}

    let file = Store.luckysheetfile[order];
    let cfgKey = type === 'row' ? 'rowhidden': 'colhidden';
    let cfg = structuredClone(file.config);
    if(cfg[cfgKey] == null) {
        return;
    }

    for (let i = startIndex; i <= endIndex; i++) {
        delete cfg[cfgKey][i];
    }

    //保存撤销
    if(Store.clearjfundo){
        let redo = {};
        redo["type"] = type === 'row' ? 'showHidRows' : 'showHidCols';
        redo["sheetIndex"] = file.index;
        redo["config"] = structuredClone(file.config);
        redo["curconfig"] = cfg;

        Store.jfundo.length  = 0;
        Store.jfredo.push(redo);
    }

    //config
    Store.luckysheetfile[order].config = Store.config;

    // 若操作sheet为当前sheet页，行高、列宽 刷新
    if (order === curSheetOrder) {
        Store.config = cfg;
        jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
    }

    if (success && typeof success === 'function') {
        success();
    }
}

export function hideRow(startIndex, endIndex, options = {}) {
    hideRowOrColumn('row', startIndex, endIndex, options);
}

export function showRow(startIndex, endIndex, options = {}) {
    showRowOrColumn('row', startIndex, endIndex, options);
}

export function hideColumn(startIndex, endIndex, options = {}) {
    hideRowOrColumn('column', startIndex, endIndex, options);
}

export function showColumn(startIndex, endIndex, options = {}) {
    showRowOrColumn('column', startIndex, endIndex, options);
}
