import {luckysheetupdateCell} from './updateCell';
import { keycode } from './constant';
import { 
    luckysheetMoveHighlightCell,
} from './sheetMove';

import insertFormula from './insertFormula';
import { 
    rowLocation, 
    colLocation, 
    mouseposition 
} from '../global/location';
import { isEditMode } from '../global/validate';
import formula from '../global/formula';
import tooltip from '../global/tooltip';
import locale from '../locale/locale';
import Store from '../store';
import { getLastSelection, getFocusCell } from '../utils/storeAccess.js';
import { getScrollPosition } from '../utils/domUtils.js';
import formulaDialogs from '../ui/formulaDialogs.js';
import inputBox from '../ui/inputBox.js';
import richTextEditor from '../ui/richTextEditor.js';
import functionBox from '../ui/functionBox.js';
import cellMain from '../ui/cellMain.js';

export function formulaBarInitial(){
    const _locale = locale();
    const locale_formula= _locale.formula;

    functionBox.el.addEventListener("focus", function () {
        if(isEditMode()){
            return;
        }

        if(Store.luckysheet_select_save.length > 0){
            let last = getLastSelection();

            let _focus = getFocusCell();
            let row_index = _focus.row, col_index = _focus.col;
            
            luckysheetupdateCell(row_index, col_index, Store.flowdata, null, true);
            formula.rangeResizeTo = functionBox.el;
        }
    });
    functionBox.el.addEventListener("keydown", function (event) {
        if(isEditMode()){
            return;
        }

        let ctrlKey = event.ctrlKey;
        let altKey = event.altKey;
        let shiftKey = event.shiftKey;
        let kcode = event.keyCode;
        let inputboxEl = inputBox.el;

        if (kcode == keycode.ENTER && parseInt(inputboxEl.style.top) > 0) {
            if (formulaDialogs.formulaSearchC.isVisible() && formula.searchFunctionCell != null) {
                formula.searchFunctionEnter(formulaDialogs.formulaSearchC.el?.querySelector(".luckysheet-formula-search-item-active"));
            }
            else {
                formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
                Store.luckysheet_select_save = [{ "row": [Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[0]], "column": [Store.luckysheetCellUpdate[1], Store.luckysheetCellUpdate[1]], "row_focus": Store.luckysheetCellUpdate[0], "column_focus": Store.luckysheetCellUpdate[1] }];
                luckysheetMoveHighlightCell("down", 1, "rangeOfSelect");
                richTextEditor.focus();
            }
            event.preventDefault();
        }
        else if (kcode == keycode.ESC && parseInt(inputboxEl.style.top) > 0) {
            formula.dontupdate();
            luckysheetMoveHighlightCell("down", 0, "rangeOfSelect");
            richTextEditor.focus();
            event.preventDefault();
        }
        else if (kcode == keycode.F4 && parseInt(inputboxEl.style.top) > 0) {
            formula.setfreezonFuc(event);
            event.preventDefault();
        }
        else if (kcode == keycode.UP && parseInt(inputboxEl.style.top) > 0) {
            if (formulaDialogs.formulaSearchC.isVisible()) {
                let activeItem = formulaDialogs.formulaSearchC.el?.querySelector(".luckysheet-formula-search-item-active");
                let prevItem = activeItem ? activeItem.previousElementSibling : null;
                if (!prevItem) {
                    let items = formulaDialogs.formulaSearchC.el?.querySelectorAll(".luckysheet-formula-search-item");
                    prevItem = items[items.length - 1];
                }
                formulaDialogs.formulaSearchC.el?.querySelectorAll(".luckysheet-formula-search-item").forEach(function(el) {
                    el.classList.remove("luckysheet-formula-search-item-active");
                });
                if (prevItem) prevItem.classList.add("luckysheet-formula-search-item-active");
                event.preventDefault();
            }
        }
        else if (kcode == keycode.DOWN && parseInt(inputboxEl.style.top) > 0) {
            if (formulaDialogs.formulaSearchC.isVisible()) {
                let activeItem = formulaDialogs.formulaSearchC.el?.querySelector(".luckysheet-formula-search-item-active");
                let nextItem = activeItem ? activeItem.nextElementSibling : null;
                if (!nextItem) {
                    nextItem = formulaDialogs.formulaSearchC.el?.querySelector(".luckysheet-formula-search-item");
                }
                formulaDialogs.formulaSearchC.el?.querySelectorAll(".luckysheet-formula-search-item").forEach(function(el) {
                    el.classList.remove("luckysheet-formula-search-item-active");
                });
                if (nextItem) nextItem.classList.add("luckysheet-formula-search-item-active");
                event.preventDefault();
            }
        }
        else if (kcode == keycode.LEFT && parseInt(inputboxEl.style.top) > 0) {
            formula.rangeHightlightselected(functionBox.el);
        }
        else if (kcode == keycode.RIGHT && parseInt(inputboxEl.style.top) > 0) {
            formula.rangeHightlightselected(functionBox.el);
        }
        else if (!((kcode >= 112 && kcode <= 123) || kcode <= 46 || kcode == 144 || kcode == 108 || event.ctrlKey || event.altKey || (event.shiftKey && (kcode == 37 || kcode == 38 || kcode == 39 || kcode == 40))) || kcode == 8 || kcode == 32 || kcode == 46 || (event.ctrlKey && kcode == 86)) {
            formula.functionInputHanddler(richTextEditor.el, functionBox.el, kcode);
        }
    });
    functionBox.el.addEventListener("click", function () {
        if(isEditMode()){
            return;
        }

        formula.rangeHightlightselected(functionBox.el);
    });

    functionBox.onCancelClick(function () {
        if (!functionBox.el.classList.contains("luckysheet-wa-calculate-active")) {
            return;
        }
        if(formulaDialogs.searchParm.isVisible()){
            formulaDialogs.searchParm.hide();
        }
        if(formulaDialogs.searchParmSelect.isVisible()){
            formulaDialogs.searchParmSelect.hide();
        }

        formula.dontupdate();
        luckysheetMoveHighlightCell("down", 0, "rangeOfSelect");
    });

    functionBox.onConfirmClick(function () {
        if (!functionBox.el.classList.contains("luckysheet-wa-calculate-active")) {
            return;
        }
        if(formulaDialogs.searchParm.isVisible()){
            formulaDialogs.searchParm.hide();
        }
        if(formulaDialogs.searchParmSelect.isVisible()){
            formulaDialogs.searchParmSelect.hide();
        }

        formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
        luckysheetMoveHighlightCell("down", 0, "rangeOfSelect");
    });

    document.getElementById("luckysheet-wa-functionbox-fx").addEventListener("click", function () {
        if(Store.luckysheet_select_save.length == 0){
            if(isEditMode()){
                alert(locale_formula.tipSelectCell);
            }
            else{
                tooltip.info(locale_formula.tipSelectCell,"");
            }

            return;
        }

        let last = getLastSelection();

        let _focus = getFocusCell();
        let row_index = _focus.row, col_index = _focus.col;

        luckysheetupdateCell(row_index, col_index, Store.flowdata);
        
        let cell = Store.flowdata[row_index][col_index];
        if(cell != null && cell.f != null){
            let functionStr = formula.getfunctionParam(cell.f);
            if(functionStr.fn != null){
                insertFormula.formulaParmDialog(functionStr.fn, functionStr.param);
            }
            else{
                insertFormula.formulaListDialog();
            }
        }
        else{
            richTextEditor.setHtml('<span dir="auto" class="luckysheet-formula-text-color">=</span>');
            functionBox.setHtml(richTextEditor.getHtml());
            insertFormula.formulaListDialog();
        }

        insertFormula.init();
    });

    document.getElementById("luckysheet-formula-functionrange").addEventListener("mousedown", function (event) {
        let target = event.target;
        if (!target.classList.contains("luckysheet-copy")) return;
        formula.rangeMove = true;
        Store.luckysheet_scroll_status = true;
        let parentEl = target.parentElement;
        formula.rangeMoveObj = parentEl;
        formula.rangeMoveIndex = parentEl.getAttribute("rangeindex");
        
        let mouse = mouseposition(event.pageX, event.pageY);
        let scroll = getScrollPosition();
        let x = mouse[0] + scroll.scrollLeft;
        let y = mouse[1] + scroll.scrollTop;
        let _elHighlight = document.getElementById("luckysheet-formula-functionrange-highlight-" + formula.rangeMoveIndex);
        if (_elHighlight) {
            let _elCopyHc = _elHighlight.querySelector(".luckysheet-selection-copy-hc");
            if (_elCopyHc) _elCopyHc.style.opacity = 0.13;
        }
        
        let type = target.dataset.type;
        if (type == "top") {
            y += 3;
        }
        else if (type == "right") {
            x -= 3;
        }
        else if (type == "bottom") {
            y -= 3;
        }
        else if (type == "left") {
            x += 3;
        }

        let row_index = rowLocation(y)[2];
        let col_index = colLocation(x)[2];

        formula.rangeMovexy = [row_index, col_index];
        document.getElementById("luckysheet-sheet-table").style.cursor = "move";
        event.stopPropagation();
    });

    document.getElementById("luckysheet-formula-functionrange").addEventListener("mousedown", function (event) {
        let target = event.target;
        if (!target.classList.contains("luckysheet-highlight")) return;
        formula.rangeResize = target.dataset.type;
        let parentEl = target.parentElement;
        formula.rangeResizeIndex = parentEl.getAttribute("rangeindex");
        
        let mouse = mouseposition(event.pageX, event.pageY),
            scroll = getScrollPosition(),
            scrollLeft = scroll.scrollLeft,
            scrollTop = scroll.scrollTop;
        let x = mouse[0] + scrollLeft;
        let y = mouse[1] + scrollTop;
        formula.rangeResizeObj = parentEl;
        let _elHighlight2 = document.getElementById("luckysheet-formula-functionrange-highlight-" + formula.rangeResizeIndex);
        if (_elHighlight2) {
            let _elCopyHc2 = _elHighlight2.querySelector(".luckysheet-selection-copy-hc");
            if (_elCopyHc2) _elCopyHc2.style.opacity = 0.13;
        }
        
        if (formula.rangeResize == "lt") {
            x += 3;
            y += 3;
        }
        else if (formula.rangeResize == "lb") {
            x += 3;
            y -= 3;
        }
        else if (formula.rangeResize == "rt") {
            x -= 3;
            y += 3;
        }
        else if (formula.rangeResize == "rb") {
            x -= 3;
            y -= 3;
        }

        let row_location = rowLocation(y), 
            row = row_location[1], 
            row_pre = row_location[0], 
            row_index = row_location[2];
        let col_location = colLocation(x), 
            col = col_location[1], 
            col_pre = col_location[0], 
            col_index = col_location[2];

        let position = {top: parentEl.offsetTop, left: parentEl.offsetLeft};
        formula.rangeResizexy = [
            col_pre, 
            row_pre, 
            parentEl.offsetWidth, 
            parentEl.offsetHeight, 
            position.left + scrollLeft, 
            position.top + scrollTop, col, row
        ];
        formula.rangeResizeWinH = cellMain.getScrollHeight();
        formula.rangeResizeWinW = cellMain.getScrollWidth();
        Store.luckysheet_scroll_status = true;
        event.stopPropagation();
    });
}
