import Store from "../../store";
import { getObjType } from "../../utils/util";
import { getCurrentSheetOrder, getDataSize } from '../../utils/storeAccess.js';
import { jfrefreshgrid_rhcw } from "../refresh";
import tooltip from "../tooltip";

export function setRowHeight(rowInfo, options = {}) {
    if(getObjType(rowInfo) != 'object'){
        return tooltip.info("The rowInfo parameter is invalid.", "");
    }

    let {
        order = getCurrentSheetOrder(),
        success
    } = {...options}

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    let cfg = structuredClone(file.config);
    if(cfg['rowlen'] == null){
        cfg['rowlen'] = {};
    }

    for(let r in rowInfo){
        if(parseInt(r) >= 0){
            let len = rowInfo[r];

            if (len === 'auto') {
                cfg['rowlen'][parseInt(r)] = len
            } else {
                if(Number(len) >= 0){
                    cfg['rowlen'][parseInt(r)] = Number(len);
                }
            }
        }
    }

    file.config = cfg;


    if(file.index == Store.currentSheetIndex){
        Store.config = cfg;
        let _dataSize = getDataSize();
        jfrefreshgrid_rhcw(_dataSize.rowCount, _dataSize.colCount);
    }

    if (success && typeof success === 'function') {
        success()
    }
}

export function setColumnWidth(columnInfo, options = {}) {
    if(getObjType(columnInfo) != 'object'){
        return tooltip.info("The columnInfo parameter is invalid.", "");
    }

    let {
        order = getCurrentSheetOrder(),
        success
    } = {...options}

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    let cfg = structuredClone(file.config);
    if(cfg['columnlen'] == null){
        cfg['columnlen'] = {};
    }

    for(let c in columnInfo){
        if(parseInt(c) >= 0){
            let len = columnInfo[c];

            if (len === 'auto') {
                cfg['columnlen'][parseInt(c)] = len
            } else {
                if(Number(len) >= 0){
                    cfg['columnlen'][parseInt(c)] = Number(len);
                }
            }
        }
    }

    file.config = cfg;


    if(file.index == Store.currentSheetIndex){
        Store.config = cfg;
        let _dataSize = getDataSize();
        jfrefreshgrid_rhcw(_dataSize.rowCount, _dataSize.colCount);
    }

    if (success && typeof success === 'function') {
        success()
    }
}

export function getRowHeight(rowInfo, options = {}) {
    if(getObjType(rowInfo) != 'array' || rowInfo.length == 0){
        return tooltip.info("The rowInfo parameter is invalid.", "");
    }

    let {
        order = getCurrentSheetOrder(),
        success
    } = {...options}

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    let cfg = structuredClone(file.config);
    let rowlen = cfg["rowlen"] || {};

    let rowlenObj = {};

    rowInfo.forEach((item) => {
        if(parseInt(item) >= 0){
            let size = rowlen[parseInt(item)] || Store.defaultrowlen;
            rowlenObj[parseInt(item)] = size;
        }
    })

    setTimeout(() => {
        if (success && typeof success === 'function') {
            success()
        }
    }, 1)

    return rowlenObj;
}

export function getColumnWidth(columnInfo, options = {}) {
    if(getObjType(columnInfo) != 'array' || columnInfo.length == 0){
        return tooltip.info("The columnInfo parameter is invalid.", "");
    }

    let {
        order = getCurrentSheetOrder(),
        success
    } = {...options}

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    let cfg = structuredClone(file.config);
    let columnlen = cfg["columnlen"] || {};

    let columnlenObj = {};

    columnInfo.forEach((item) => {
        if(parseInt(item) >= 0){
            let size = columnlen[parseInt(item)] || Store.defaultcollen;
            columnlenObj[parseInt(item)] = size;
        }
    })

    setTimeout(() => {
        if (success && typeof success === 'function') {
            success()
        }
    }, 1)

    return columnlenObj;
}

export function getDefaultRowHeight(options = {}) {
    let {
        order = getCurrentSheetOrder(),
        success
    } = {...options}

    setTimeout(() => {
        if (success && typeof success === 'function') {
            success()
        }
    }, 1)

    // *返回指定的工作表默认行高，如果未配置就返回全局的默认行高
    return Store.luckysheetfile[order].defaultRowHeight || Store.defaultrowlen;
}

export function getDefaultColWidth(options = {}) {
    let {
        order = getCurrentSheetOrder(),
        success
    } = {...options}

    setTimeout(() => {
        if (success && typeof success === 'function') {
            success()
        }
    }, 1)

    // *返回指定的工作表默认列宽，如果未配置就返回全局的默认列宽
    return Store.luckysheetfile[order].defaultColWidth || Store.defaultcollen;
}
