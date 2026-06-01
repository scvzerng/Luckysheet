import { luckysheetupdateCell } from "../../controllers/updateCell";
import Store from "../../store";
import { getLastSelection, getFocusCell } from '../../utils/storeAccess.js';
import { isInputBoxActive } from '../../utils/domUtils.js';
import formula from "../formula";
import formulaDialogs from '../../ui/formulaDialogs.js';
import conditionformatDialog from '../../ui/conditionformatDialog.js';

export function exitEditMode(options = {}){
    if(isInputBoxActive()){


        if (formulaDialogs.formulaSearchC.isVisible() && formula.searchFunctionCell != null) {
            formula.searchFunctionEnter(formulaDialogs.formulaSearchC.el?.querySelector(".luckysheet-formula-search-item-active"));
        }
        else {
            formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
            Store.selections = [{
                "row": [Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[0]],
                "column": [Store.luckysheetCellUpdate[1], Store.luckysheetCellUpdate[1]],
                "row_focus": Store.luckysheetCellUpdate[0],
                "column_focus": Store.luckysheetCellUpdate[1]
            }];
        }

        if(formulaDialogs.searchParm.isVisible()){
            formulaDialogs.searchParm.hide();
        }
        if(formulaDialogs.searchParmSelect.isVisible()){
            formulaDialogs.searchParmSelect.hide();
        }

    }

    if (options.success && typeof options.success === 'function') {
        options.success();
    }
}

export function enterEditMode(options = {}){

    if(conditionformatDialog.main.isVisible()){
        return;
    }
    else if (document.getElementById("luckysheet-cell-selected").offsetWidth > 0) {
        let last = getLastSelection();
        let _focus = getFocusCell();

        let row_index = _focus.row, col_index = _focus.col;

        luckysheetupdateCell(row_index, col_index, Store.sheetData);
    }

    if (options.success && typeof options.success === 'function') {
        options.success();
    }
}
