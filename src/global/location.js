import { luckysheet_searcharray } from '../controllers/sheetSearch';
import { getMaxRowIndex, getMaxColIndex } from '../utils/storeAccess.js';
import Store from '../store';

function rowLocationByIndex(row_index) {
    let row = 0, row_pre = 0;
    row = Store.visibleRowPositions[row_index];

    if (row_index == 0) {
        row_pre = 0;
    }
    else {
        row_pre = Store.visibleRowPositions[row_index - 1];
    }

    return [row_pre, row, row_index];
}

function rowLocation(y) {
    let row_index = luckysheet_searcharray(Store.visibleRowPositions, y);

    if (row_index == -1 && y > 0) {
        row_index = getMaxRowIndex();
    }
    else if (row_index == -1 && y <= 0) {
        row_index = 0;
    }

    return rowLocationByIndex(row_index);
}

function colLocationByIndex(col_index){
    let col = 0, col_pre = 0;
    col = Store.visibleColPositions[col_index];

    if (col_index == 0) {
        col_pre = 0;
    }
    else {
        col_pre = Store.visibleColPositions[col_index - 1];
    }

    return [col_pre, col, col_index];
}

function colSpanLocationByIndex(col_index, span){
    let col = 0, col_pre = 0;
    col = Store.visibleColPositions[col_index + span - 1];

    if (col_index == 0) {
        col_pre = 0;
    }
    else {
        col_pre = Store.visibleColPositions[col_index - 1];
    }

    return [col_pre, col, col_index];
}

function colLocation(x) {
    let col_index = luckysheet_searcharray(Store.visibleColPositions, x);

    if (col_index == -1 && x > 0) {
        col_index = getMaxColIndex();
    }
    else if (col_index == -1 && x <= 0) {
        col_index = 0;
    }

    return colLocationByIndex(col_index);
}

function mouseposition(x, y) {
    let container_offset = (() => { const _el = document.getElementById(Store.container); const _r = _el?.getBoundingClientRect(); return _r ? {top: _r.top + window.pageYOffset, left: _r.left + window.pageXOffset} : {top: 0, left: 0}; })();

    let newX = x - container_offset.left - Store.rowHeaderWidth,
        newY = y - container_offset.top - Store.infobarHeight - Store.toolbarHeight - Store.calculatebarHeight - Store.columnHeaderHeight;

    return [newX, newY];
}

export {
    rowLocationByIndex,
    rowLocation,
    colLocationByIndex,
    colSpanLocationByIndex,
    colLocation,
    mouseposition,
}
