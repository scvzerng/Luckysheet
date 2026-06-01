import { isRealNull, isEditMode } from '../../global/validate';
import tooltip from '../../global/tooltip';
import { selectHightlightShow } from '../select';
import { luckysheetMoveEndCell } from '../sheetMove';
import locale from '../../locale/locale';
import Store from '../../store';
import { createFilterOptions } from './createFilterOptions';
import rightClickMenu from '../../ui/rightClickMenu.js';

function createFilter() {

    if(Store.luckysheet_select_save.length > 1){
        rightClickMenu.hide();
        [document.getElementById("luckysheet-filter-menu"), document.getElementById("luckysheet-filter-submenu")].forEach(el => { if (el) el.style.display = 'none'; });
        const _elContainer = document.getElementById(Store.container); if (_elContainer) { _elContainer.setAttribute("tabindex", 0); _elContainer.focus(); }

        const locale_splitText = locale().splitText;

        if(isEditMode()){
            alert(locale_splitText.tipNoMulti);
        }
        else{
            tooltip.info(locale_splitText.tipNoMulti, "");
        }

        return;
    }

    const _elFilterSelRm = document.getElementById("luckysheet-filter-selected-sheet" + Store.currentSheetIndex); if (_elFilterSelRm) _elFilterSelRm.remove();
    const _elFilterOptRm = document.getElementById("luckysheet-filter-options-sheet" + Store.currentSheetIndex); if (_elFilterOptRm) _elFilterOptRm.remove();

    let last = Store.luckysheet_select_save[0];
    if (last["row"][0] == last["row"][1] && last["column"][0] == last["column"][1]) {
        let st_c, ed_c, curR = last["row"][1];

        for (let c = 0; c < Store.sheetData[curR].length; c++) {
            let cell = Store.sheetData[curR][c];

            if (cell != null && !isRealNull(cell.v)) {
                if (st_c == null) {
                    st_c = c;
                }
            }
            else if (st_c != null) {
                ed_c = c - 1;
                break;
            }
        }

        if (ed_c == null) {
            ed_c = Store.sheetData[curR].length - 1;
        }

        Store.luckysheet_select_save = [{ "row": [curR, curR], "column": [st_c, ed_c] }];
        selectHightlightShow();

        Store.luckysheet_shiftpositon = structuredClone(last);
        luckysheetMoveEndCell("down", "range");
    }
    else if (last["row"][1] - last["row"][0] < 2) {
        Store.luckysheet_shiftpositon = structuredClone(last);
        luckysheetMoveEndCell("down", "range");
    }

    Store.luckysheet_filter_save = structuredClone(Store.luckysheet_select_save[0]);

    createFilterOptions(Store.luckysheet_filter_save);


    if (Store.filterchage) {
        Store.jfredo.push({ 
            "type": "filtershow", 
            "data": [], 
            "curdata": [], 
            "sheetIndex": Store.currentSheetIndex, 
            "filter_save": Store.luckysheet_filter_save 
        });
    }
}

export { createFilter };
