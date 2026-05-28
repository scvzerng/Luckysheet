import Store from '../store/index.js';
import { getSheetIndex } from '../methods/get.js';

export function getCurrentFile() {
    let order = getSheetIndex(Store.currentSheetIndex);
    if (order == null) {
        return null;
    }
    return Store.luckysheetfile[order];
}

export function getCurrentSheetOrder() {
    return getSheetIndex(Store.currentSheetIndex);
}

export function getLastSelection() {
    if (Store.luckysheet_select_save == null || Store.luckysheet_select_save.length === 0) {
        return null;
    }
    return Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
}

export function getFocusCell() {
    let last = getLastSelection();
    if (last == null) {
        return null;
    }
    return {
        row: last["row_focus"],
        col: last["column_focus"]
    };
}

export function getFlowData() {
    return Store.flowdata;
}

export function getCell(row, col, data) {
    data = data || Store.flowdata;
    if (data == null) {
        return null;
    }
    if (data[row] == null) {
        return null;
    }
    return data[row][col] || null;
}

export function getDataSize(data) {
    data = data || Store.flowdata;
    if (data == null || data.length === 0) {
        return { rowCount: 0, colCount: 0 };
    }
    return {
        rowCount: data.length,
        colCount: data[0] ? data[0].length : 0
    };
}

export function getMaxRowIndex() {
    if (Store.visibledatarow == null || Store.visibledatarow.length === 0) {
        return 0;
    }
    return Store.visibledatarow.length - 1;
}

export function getMaxColIndex() {
    if (Store.visibledatacolumn == null || Store.visibledatacolumn.length === 0) {
        return 0;
    }
    return Store.visibledatacolumn.length - 1;
}

export function syncConfigToStore() {
    let file = getCurrentFile();
    if (file != null) {
        file.config = Store.config;
    }
}

export function syncDataToStore() {
    let file = getCurrentFile();
    if (file != null) {
        file.data = Store.flowdata;
    }
}

export function getHeaderTotalHeight() {
    return Store.infobarHeight + Store.toolbarHeight + Store.calculatebarHeight + Store.columnHeaderHeight;
}
