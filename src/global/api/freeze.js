import luckysheetFreezen from "../../controllers/freezen";
import locale from "../../locale/locale";
import { getSheetIndex } from "../../methods/get";
import Store from "../../store";
import formula from "../formula";
import { luckysheetrefreshgrid } from "../refresh";
import tooltip from "../tooltip";
import { isEditMode } from "../validate";

export function frozenFirstRow(order) {
    // store frozen
    luckysheetFreezen.saveFrozen("freezenRow", order);

    // 冻结为当前sheet页
    if (!order || order == getSheetIndex(Store.currentSheetIndex)) {
        let freezenhorizontaldata, row_st, top;
        if (luckysheetFreezen.freezenRealFirstRowColumn) {
            let row_st = 0;
            top = Store.visibledatarow[row_st] - 2 + Store.columnHeaderHeight;
            freezenhorizontaldata = [
                Store.visibledatarow[row_st],
                row_st + 1,
                0,
                luckysheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1),
                top
            ];
        } else {
            let scrollTop = $("#luckysheet-cell-main").scrollTop();
            row_st = luckysheet_searcharray(Store.visibledatarow, scrollTop);
            if(row_st == -1){
                row_st = 0;
            }

            top = Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
            freezenhorizontaldata = [
                Store.visibledatarow[row_st],
                row_st + 1,
                scrollTop,
                luckysheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1),
                top
            ];
        }

        luckysheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);

        if (luckysheetFreezen.freezenverticaldata != null) {
            luckysheetFreezen.cancelFreezenVertical();
            luckysheetFreezen.createAssistCanvas();
            luckysheetrefreshgrid();
        }

        luckysheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);
        luckysheetFreezen.createAssistCanvas();
        luckysheetrefreshgrid();
    }
}

export function frozenFirstColumn(order) {
    // store frozen
    luckysheetFreezen.saveFrozen("freezenColumn", order);

    // 冻结为当前sheet页
    if (!order || order == getSheetIndex(Store.currentSheetIndex)) {
        let freezenverticaldata, col_st, left;
        if (luckysheetFreezen.freezenRealFirstRowColumn) {
            col_st = 0;
            left = Store.visibledatacolumn[col_st] - 2 + Store.rowHeaderWidth;
            freezenverticaldata = [
                Store.visibledatacolumn[col_st],
                col_st + 1,
                0,
                luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1),
                left
            ];
        } else {
            let scrollLeft = $("#luckysheet-cell-main").scrollLeft();

            col_st = luckysheet_searcharray(Store.visibledatacolumn, scrollLeft);
            if(col_st == -1){
                col_st = 0;
            }

            left = Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
            freezenverticaldata = [
                Store.visibledatacolumn[col_st],
                col_st + 1,
                scrollLeft,
                luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1),
                left
            ];
        }

        luckysheetFreezen.saveFreezen(null, null, freezenverticaldata, left);

        if (luckysheetFreezen.freezenhorizontaldata != null) {
            luckysheetFreezen.cancelFreezenHorizontal();
            luckysheetFreezen.createAssistCanvas();
            luckysheetrefreshgrid();
        }

        luckysheetFreezen.createFreezenVertical(freezenverticaldata, left);
        luckysheetFreezen.createAssistCanvas();
        luckysheetrefreshgrid();
    }
}

export function frozenRowRange(range, order) {
    const locale_frozen = locale().freezen;

    if (!range || (!range.hasOwnProperty('row_focus') && !formula.iscelldata(range))) {
        if(isEditMode()){
            alert(locale_frozen.noSeletionError);
        } else{
            tooltip.info(locale_frozen.noSeletionError, "");
        }
        return
    }

    if (typeof range === 'string' && formula.iscelldata(range)) {
        range = formula.getcellrange(range)
        range = {
            row_focus: range.row[0],
            column_focus: range.column[0]
        }
    }
    // store frozen
    luckysheetFreezen.saveFrozen("freezenRowRange", order, range);

    if (!order || order == getSheetIndex(Store.currentSheetIndex)) {
        let scrollTop = $("#luckysheet-cell-main").scrollTop();
        let row_st = luckysheet_searcharray(Store.visibledatarow, scrollTop);

        let row_focus = range.row_focus;
        if(row_focus > row_st){
            row_st = row_focus;
        }
        if(row_st == -1){
            row_st = 0;
        }

        let top = Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
        let freezenhorizontaldata = [
            Store.visibledatarow[row_st],
            row_st + 1,
            scrollTop,
            luckysheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1),
            top
        ];
        luckysheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);

        if (luckysheetFreezen.freezenverticaldata != null) {
            luckysheetFreezen.cancelFreezenVertical();
            luckysheetFreezen.createAssistCanvas();
            luckysheetrefreshgrid();
        }

        luckysheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);
        luckysheetFreezen.createAssistCanvas();
        luckysheetrefreshgrid();
    }

}

export function frozenColumnRange(range, order) {
    const locale_frozen = locale().freezen;
    let isStringRange = typeof range === 'string' && formula.iscelldata(range);

    if (!range || (!range.hasOwnProperty('column_focus') && !isStringRange)) {
        if(isEditMode()){
            alert(locale_frozen.noSeletionError);
        } else{
            tooltip.info(locale_frozen.noSeletionError, "");
        }
        return
    }

    if (isStringRange) {
        range = formula.getcellrange(range)
        range = {
            row_focus: range.row[0],
            column_focus: range.column[0]
        }
    }
    // store frozen
    luckysheetFreezen.saveFrozen("freezenColumnRange", order, range);

    if (!order || order == getSheetIndex(Store.currentSheetIndex)) {
        let scrollLeft = $("#luckysheet-cell-main").scrollLeft();
        let col_st = luckysheet_searcharray(Store.visibledatacolumn, scrollLeft);

        let column_focus = range.column_focus;
        if(column_focus > col_st){
            col_st = column_focus;
        }
        if(col_st == -1){
            col_st = 0;
        }

        let left = Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
        let freezenverticaldata = [
            Store.visibledatacolumn[col_st],
            col_st + 1,
            scrollLeft,
            luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1),
            left
        ];
        luckysheetFreezen.saveFreezen(null, null, freezenverticaldata, left);

        if (luckysheetFreezen.freezenhorizontaldata != null) {
            luckysheetFreezen.cancelFreezenHorizontal();
            luckysheetFreezen.createAssistCanvas();
            luckysheetrefreshgrid();
        }

        luckysheetFreezen.createFreezenVertical(freezenverticaldata, left);
        luckysheetFreezen.createAssistCanvas();
        luckysheetrefreshgrid();
    }
}

export function cancelFrozen(order) {
    luckysheetFreezen.saveFrozen("freezenCancel", order);

    // 取消当前sheet冻结时，刷新canvas
    if (!order || order == getSheetIndex(Store.currentSheetIndex)) {
        if (luckysheetFreezen.freezenverticaldata != null) {
            luckysheetFreezen.cancelFreezenVertical();
        }
        if (luckysheetFreezen.freezenhorizontaldata != null) {
            luckysheetFreezen.cancelFreezenHorizontal();
        }
        luckysheetFreezen.createAssistCanvas();
        luckysheetrefreshgrid();
    }
}

export function setHorizontalFrozen(isRange, options = {}) {
    let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
    let {
        range,
        order = curSheetOrder,
        success
    } = { ...options };

    // 若已存在冻结，取消之前的冻结效果
    cancelFrozen(order);

    if (!isRange) {
        frozenFirstRow(order)
    } else { // 选区行冻结
        frozenRowRange(range, order);
    }

    if (success && typeof success === 'function') {
        success()
    }
}

export function setVerticalFrozen(isRange, options = {}) {
    let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
    let {
        range,
        order = curSheetOrder,
        success
    } = { ...options };

    // 若已存在冻结，取消之前的冻结效果
    cancelFrozen(order);

    if (!isRange) {
        frozenFirstColumn(order);
    } else {
        frozenColumnRange(range, order);
    }

    if (success && typeof success === 'function') {
        success()
    }
}

export function setBothFrozen(isRange, options = {}) {
    let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
    let {
        range,
        order = curSheetOrder,
        success
    } = { ...options };

    let isCurrentSheet = !order || order == getSheetIndex(Store.currentSheetIndex);
    const locale_frozen = locale().freezen;

    // 若已存在冻结，取消之前的冻结效果
    cancelFrozen(order);

    // 冻结首行列
    if (!isRange) {
        // store frozen
        luckysheetFreezen.saveFrozen("freezenRC", order)

        if (isCurrentSheet) {
            let scrollTop = $("#luckysheet-cell-main").scrollTop();
            let row_st = luckysheet_searcharray(Store.visibledatarow, scrollTop);
            if(row_st == -1){
                row_st = 0;
            }
            let top = Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
            let freezenhorizontaldata = [
                Store.visibledatarow[row_st],
                row_st + 1,
                scrollTop,
                luckysheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1),
                top
            ];
            luckysheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);

            luckysheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);

            let scrollLeft = $("#luckysheet-cell-main").scrollLeft();
            let col_st = luckysheet_searcharray(Store.visibledatacolumn, scrollLeft);
            if(col_st == -1){
                col_st = 0;
            }
            let left = Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
            let freezenverticaldata = [
                Store.visibledatacolumn[col_st],
                col_st + 1,
                scrollLeft,
                luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1),
                left
            ];
            luckysheetFreezen.saveFreezen(null, null, freezenverticaldata, left);

            luckysheetFreezen.createFreezenVertical(freezenverticaldata, left);

            luckysheetFreezen.createAssistCanvas();
            luckysheetrefreshgrid();
        }
    } else {   // 冻结行列到选区
        // store frozen
        luckysheetFreezen.saveFrozen("freezenRCRange", order, range)

        let isStringRange = typeof range === 'string' && formula.iscelldata(range);
        if (isCurrentSheet) {
            if ((!range || !(range.hasOwnProperty('column_focus') && range.hasOwnProperty('row_focus'))) && !isStringRange) {
                if(isEditMode()){
                    alert(locale_frozen.noSeletionError);
                } else{
                    tooltip.info(locale_frozen.noSeletionError, "");
                }
                return
            }

            if (isStringRange) {
                range = formula.getcellrange(range)
                range = {
                    row_focus: range.row[0],
                    column_focus: range.column[0]
                }
            }

            let scrollTop = $("#luckysheet-cell-main").scrollTop();
            let row_st = luckysheet_searcharray(Store.visibledatarow, scrollTop);

            let row_focus = range.row_focus;

            if(row_focus > row_st){
                row_st = row_focus;
            }

            if(row_st == -1){
                row_st = 0;
            }

            let top = Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
            let freezenhorizontaldata = [
                Store.visibledatarow[row_st],
                row_st + 1,
                scrollTop,
                luckysheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1),
                top
            ];
            luckysheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);

            luckysheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);

            let scrollLeft = $("#luckysheet-cell-main").scrollLeft();
            let col_st = luckysheet_searcharray(Store.visibledatacolumn, scrollLeft);

            let column_focus = range.column_focus;

            if(column_focus > col_st){
                col_st = column_focus;
            }

            if(col_st == -1){
                col_st = 0;
            }

            let left = Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
            let freezenverticaldata = [
                Store.visibledatacolumn[col_st],
                col_st + 1,
                scrollLeft,
                luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1),
                left
            ];
            luckysheetFreezen.saveFreezen(null, null, freezenverticaldata, left);

            luckysheetFreezen.createFreezenVertical(freezenverticaldata, left);

            luckysheetFreezen.createAssistCanvas();
            luckysheetrefreshgrid();
        }
    }
}
