import menuButton from "../../controllers/menuButton";
import { selectHightlightShow } from "../../controllers/select";
import Store from "../../store";
import { getObjType } from "../../utils/util";
import { getCurrentSheetOrder, getLastSelection } from '../../utils/storeAccess.js';
import formula from "../formula";
import { jfrefreshgrid, luckysheetrefreshgrid } from "../refresh";
import tooltip from "../tooltip";
import { setCellValue } from "./cellOperation";
import cellSelectedFocus from '../../ui/cellSelectedFocus.js';
import countShow from '../../ui/countShow.js';

export function setRangeShow(range, options = {}) {
    if(getObjType(range) == 'string'){
        if(!formula.iscelldata(range)){
            return tooltip.info("The range parameter is invalid.", "");
        }

        let cellrange = formula.getcellrange(range);
        range = [{
            "row": cellrange.row,
            "column": cellrange.column
        }]
    }
    else if(getObjType(range) == 'object'){
        if(range.row == null || range.column == null){
            return tooltip.info("The range parameter is invalid.", "");
        }

        range = [{
            "row": range.row,
            "column": range.column
        }];
    }

    if(getObjType(range) == 'array'){
        for(let i = 0; i < range.length; i++){
            if(getObjType(range[i]) === 'string'){
                if(!formula.iscelldata(range[i])){
                    return tooltip.info("The range parameter is invalid.", "");
                }
                let cellrange = formula.getcellrange(range[i]);
                range[i] = {
                    "row": cellrange.row,
                    "column": cellrange.column
                }
            }
            else if(getObjType(range) == 'object'){
                if(range.row == null || range.column == null){
                    return tooltip.info("The range parameter is invalid.", "");
                }
                range = {
                    "row": range.row,
                    "column": range.column
                };
            }
        }
    }

    if(getObjType(range) != 'array'){
        return tooltip.info("The range parameter is invalid.", "");
    }

    let {
        show = true,
        order = getCurrentSheetOrder(),
        success
    } = {...options}

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }

    for(let i = 0; i < range.length; i++){
        let changeparam = menuButton.mergeMoveMain(range[i].column, range[i].row, range[i]);
        if(changeparam) {
            range[i] = {
                "row": changeparam[1],
                "column": changeparam[0]
            }
        }
    }

    file.luckysheet_select_save = range;

    if(file.index == Store.currentSheetIndex){
        Store.luckysheet_select_save = range;
        selectHightlightShow();

        if(!show){
            $("#luckysheet-cell-selected-boxs").hide();
            cellSelectedFocus.hide();
            countShow.row.hide();
            countShow.column.hide();
            $("#luckysheet-rows-h-selected").empty();
            $("#luckysheet-cols-h-selected").empty();
        }
    }

    if (success && typeof success === 'function') {
        success();
    }
}

export function setRangeValue(data, options = {}) {
    let curSheetOrder = getCurrentSheetOrder();
    let curRange = getLastSelection();
    let {
        range = curRange,
        isRefresh = true,
        order = curSheetOrder,
        success
    } = {...options}

    if (data == null) {
        return tooltip.info('The data which will be set to range cannot be null.', '')
    }

    if (range instanceof Array) {
        return tooltip.info('setRangeValue only supports a single selection.', '')
    }

    if (typeof range === 'string' && formula.iscelldata(range)) {
        range = formula.getcellrange(range)
    }

    let rowCount = range.row[1] - range.row[0] + 1,
        columnCount = range.column[1] - range.column[0] + 1;

    if (data.length !== rowCount || data[0].length !== columnCount) {
        return tooltip.info('The data to be set does not match the selection.', '')
    }

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }
    let sheetData = $.extend(true, [], file.data);

    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < columnCount; j++) {
            let row = range.row[0] + i,
                column = range.column[0] + j;
            setCellValue(row, column, data[i][j], {order: order, isRefresh: false})
        }
    }

    let fileData = $.extend(true, [], file.data);
    file.data.length = 0;
    file.data.push(...sheetData);

    if(file.index == Store.currentSheetIndex){
        jfrefreshgrid(fileData, [{
            row: range.row,
            column: range.column,
        }], undefined, true, false);
    }

    if(isRefresh) {
        luckysheetrefreshgrid();
    }

    if (success && typeof success === 'function') {
        success();
    }
}

export function setSingleRangeFormat(attr, value, options = {}) {
    let curSheetOrder = getCurrentSheetOrder();
    let curRange = getLastSelection();
    let {
        range = curRange,
        order = curSheetOrder,
    } = {...options}

    if (!attr) {
        tooltip.info('Arguments attr cannot be null or undefined.', '')
        return 'error';
    }

    if (range instanceof Array) {
        tooltip.info('setRangeValue only supports a single selection.', '')
        return 'error';
    }

    if(getObjType(range) == 'string'){
        if(!formula.iscelldata(range)){
            tooltip.info("The range parameter is invalid.", "");
            return 'error';
        }

        range = formula.getcellrange(range);
    }

    if(getObjType(range) != 'object' || range.row == null || range.column == null){
        tooltip.info("The range parameter is invalid.", "");
        return 'error';
    }

    for (let r = range.row[0]; r <= range.row[1]; r++) {
        for (let c = range.column[0]; c <= range.column[1]; c++) {
            console.log('r',r);
            console.log('c',c);
            setCellValue(r, c, {[attr]: value}, {
                order: order,
                isRefresh: false,
              })
        }
    }
}

 export function setRangeFormat(attr, value, options = {}) {
    let curSheetOrder = getCurrentSheetOrder();
    let curRange = JSON.parse(JSON.stringify(Store.luckysheet_select_save));
    let {
        range = curRange,
        order = curSheetOrder,
        success
    } = {...options}

    if(getObjType(range) == 'string'){
        if(!formula.iscelldata(range)){
            return tooltip.info("The range parameter is invalid.", "");
        }

        let cellrange = formula.getcellrange(range);
        range = [{
            "row": cellrange.row,
            "column": cellrange.column
        }]
    }
    else if(getObjType(range) == 'object'){
        if(range.row == null || range.column == null){
            return tooltip.info("The range parameter is invalid.", "");
        }

        range = [{
            "row": range.row,
            "column": range.column
        }];
    }

    if(getObjType(range) != 'array'){
        return tooltip.info("The range parameter is invalid.", "");
    }

    let file = Store.luckysheetfile[order];

    let result = []

    for (let i = 0; i < range.length; i++) {
        result.push(setSingleRangeFormat(attr, value, { range: range[i], order: order }));
    }

    let fileData = $.extend(true, [], file.data);
    if(result.some(i => i === 'error')) {
        file.data.length = 0;
        file.data.push(...fileData);
        return false;
    }

    file.data.length = 0;
    file.data.push(...fileData);

    if(file.index == Store.currentSheetIndex){
        jfrefreshgrid(fileData, undefined, undefined, true, false);
    }

    luckysheetrefreshgrid();

    if (success && typeof success === 'function') {
    }
}
