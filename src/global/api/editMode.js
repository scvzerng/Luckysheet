import { luckysheetupdateCell } from "../../controllers/updateCell";
import Store from "../../store";
import formula from "../formula";

export function exitEditMode(options = {}){
    if(parseInt($("#luckysheet-input-box").css("top")) > 0){


        if ($("#luckysheet-formula-search-c").is(":visible") && formula.searchFunctionCell != null) {
            formula.searchFunctionEnter($("#luckysheet-formula-search-c").find(".luckysheet-formula-search-item-active"));
        }
        else {
            formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
            Store.luckysheet_select_save = [{
                "row": [Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[0]],
                "column": [Store.luckysheetCellUpdate[1], Store.luckysheetCellUpdate[1]],
                "row_focus": Store.luckysheetCellUpdate[0],
                "column_focus": Store.luckysheetCellUpdate[1]
            }];
        }

        //若有参数弹出框，隐藏
        if($("#luckysheet-search-formula-parm").is(":visible")){
            $("#luckysheet-search-formula-parm").hide();
        }
        //若有参数选取范围弹出框，隐藏
        if($("#luckysheet-search-formula-parm-select").is(":visible")){
            $("#luckysheet-search-formula-parm-select").hide();
        }

    }

    if (options.success && typeof options.success === 'function') {
        options.success();
    }
}

export function enterEditMode(options = {}){

    if($("#luckysheet-conditionformat-dialog").is(":visible")){
        return;
    }
    else if ($("#luckysheet-cell-selected").is(":visible")) {
        let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];

        let row_index = last["row_focus"], col_index = last["column_focus"];

        luckysheetupdateCell(row_index, col_index, Store.flowdata);
    }

    if (options.success && typeof options.success === 'function') {
        options.success();
    }
}
