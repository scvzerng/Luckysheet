import luckysheetConfigsetting from './luckysheetConfigsetting';
import menuButton from './menuButton';
import conditionformat from './conditionformat';
import {luckysheetupdateCell,setCenterInputPosition} from './updateCell';
import { keycode } from './constant';
import { 
    luckysheetMoveHighlightCell, 
    luckysheetMoveHighlightCell2, 
    luckysheetMoveHighlightRange, 
    luckysheetMoveHighlightRange2 
} from './sheetMove';
import { selectHightlightShow, selectIsOverlap } from './select';
import selection from './selection';
import searchReplace from './searchReplace';
import controlHistory from './controlHistory';
import imageCtrl from './imageCtrl';

import { 
    getByteLen,
    getNowDateTime,
    luckysheetactiveCell,
} from '../utils/util';
import { getCurrentFile, getLastSelection, getFocusCell } from '../utils/storeAccess.js';
import { isInputBoxActive, isModalMaskVisible, getScrollPosition } from '../utils/domUtils.js';
import { hasPartMC, isEditMode } from '../global/validate';
import { luckysheetRangeLast } from '../global/cursorPos';
import formula from '../global/formula';
import cleargridelement from '../global/cleargridelement';
import tooltip from '../global/tooltip';
import locale from '../locale/locale';
import {enterKeyControll} from './inlineString';
import Store from '../store';
import scrollBarX from '../ui/scrollBarX.js';
import scrollBarY from '../ui/scrollBarY.js';
import formulaDialogs from '../ui/formulaDialogs.js';
import inputBox from '../ui/inputBox.js';
import inputBoxIndex from '../ui/inputBoxIndex.js';
import richTextEditor from '../ui/richTextEditor.js';
import functionBox from '../ui/functionBox.js';
import cellMain from '../ui/cellMain.js';
import formulaRangeSelect from '../ui/formulaRangeSelect.js';
import conditionformatDialog from '../ui/conditionformatDialog.js';


let luckysheet_shiftkeydown = false;

function formulaMoveEvent(dir, ctrlKey, shiftKey, event){
    if (formulaDialogs.formulaSearchC.isVisible() && (dir=="up" || dir=="down") ) {
        let _searchEl = formulaDialogs.formulaSearchC.el;
        let _obj;
        if(dir=="down"){
            let _active = _searchEl.querySelector(".luckysheet-formula-search-item-active");
            _obj = _active ? _active.nextElementSibling : null;
            if (!_obj) {
                _obj = _searchEl.querySelector(".luckysheet-formula-search-item");
            }
        }
        else if(dir=="up"){
            let _active = _searchEl.querySelector(".luckysheet-formula-search-item-active");
            _obj = _active ? _active.previousElementSibling : null;
            if (!_obj) {
                let _items = _searchEl.querySelectorAll(".luckysheet-formula-search-item");
                _obj = _items.length > 0 ? _items[_items.length - 1] : null;
            }
        }


        _searchEl.querySelectorAll(".luckysheet-formula-search-item").forEach(el => el.classList.remove("luckysheet-formula-search-item-active"));
        if (_obj) _obj.classList.add("luckysheet-formula-search-item-active");

        event.preventDefault();
    }
    else{
        if(formulaRangeSelect.isVisible()){
            if(ctrlKey && shiftKey){
                luckysheetMoveHighlightRange2(dir, "rangeOfFormula");
            }
            else if(ctrlKey){
                luckysheetMoveHighlightCell2(dir, "rangeOfFormula");
            }
            else if(shiftKey){
                let dir_n = dir, step = 1;
                if(dir == 'up'){
                    dir_n = 'down';
                    step = -1;
                }
                if(dir == 'left'){
                    dir_n = 'right';
                    step = -1;
                }

                luckysheetMoveHighlightRange(dir_n, step, "rangeOfFormula");
            }
            else{
                let dir_n = dir, step = 1;
                if(dir == 'up'){
                    dir_n = 'down';
                    step = -1;
                }
                if(dir == 'left'){
                    dir_n = 'right';
                    step = -1;
                }

                luckysheetMoveHighlightCell(dir_n, step, "rangeOfFormula");
            }   
            event.preventDefault();
        }
        else if(formula.israngeseleciton()){
            let anchor = window.getSelection().anchorNode;
            if(anchor.parentElement && anchor.parentElement.nextElementSibling && (anchor.parentElement.nextElementSibling.textContent == null || anchor.parentElement.nextElementSibling.textContent == "")){
                let vText = inputBoxIndex.getText();
                let range = formula.getcellrange(vText);

                if(range == null){
                    range = formula.getcellrange(inputBoxIndex.getText());
                }

                let r1 = range["row"][0], r2 = range["row"][1];
                let c1 = range["column"][0], c2 = range["column"][1];

                let row = Store.visibledatarow[r2], 
                    row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
                let col = Store.visibledatacolumn[c2], 
                    col_pre = c1 - 1 == -1 ? 0 : Store.visibledatacolumn[c1 - 1];

                formula.func_selectedrange = {
                    "left": col_pre,
                    "width": col - col_pre - 1,
                    "top": row_pre,
                    "height": row - row_pre - 1,
                    "left_move": col_pre,
                    "width_move": col - col_pre - 1,
                    "top_move": row_pre,
                    "height_move": row - row_pre - 1,
                    "row": [r1, r2],
                    "column": [c1, c2],
                    "row_focus": r1,
                    "column_focus": c1
                };

                formula.rangeSetValue({ "row": [r1, r2], "column": [c1, c2] });

                formula.rangestart = true;
                formula.rangedrag_column_start = false;
                formula.rangedrag_row_start = false;
                
                if(ctrlKey && shiftKey){
                    luckysheetMoveHighlightRange2(dir, "rangeOfFormula");
                }
                else if(ctrlKey){
                    luckysheetMoveHighlightCell2(dir, "rangeOfFormula");
                }
                else if(shiftKey){
                    let dir_n = dir, step = 1;
                    if(dir == 'up'){
                        dir_n = 'down';
                        step = -1;
                    }
                    if(dir == 'left'){
                        dir_n = 'right';
                        step = -1;
                    }
                    
                    luckysheetMoveHighlightRange(dir_n, step, "rangeOfFormula");
                }
                else{
                    let dir_n = dir, step = 1;
                    if(dir == 'up'){
                        dir_n = 'down';
                        step = -1;
                    }
                    if(dir == 'left'){
                        dir_n = 'right';
                        step = -1;
                    }
                    
                    luckysheetMoveHighlightCell(dir_n, step, "rangeOfFormula");
                } 

                event.preventDefault();
            }

        }
        else if(!ctrlKey && !shiftKey){
            let anchorNode = window.getSelection().anchorNode;
            if (!anchorNode) return;
            let anchorEl = anchorNode.nodeType === Node.TEXT_NODE ? anchorNode.parentElement : anchorNode;
            let anchorOffset = window.getSelection().anchorOffset;

            if(dir == 'up'){
                if(anchorEl && anchorEl.tagName === "SPAN" && anchorEl.nextElementSibling === null && anchorOffset > 0){
                    formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
                    luckysheetMoveHighlightCell("down", -1, "rangeOfSelect");

                    event.preventDefault();
                }
                else if(anchorEl === richTextEditor.el && anchorEl.childElementCount == anchorOffset){
                    formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
                    luckysheetMoveHighlightCell("down", -1, "rangeOfSelect");

                    event.preventDefault();
                }
                else if(anchorEl && anchorEl.parentElement === richTextEditor.el && anchorEl.textContent.length == anchorOffset){
                    formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
                    luckysheetMoveHighlightCell("down", -1, "rangeOfSelect");

                    event.preventDefault();
                }
            }
            else if(dir == 'down'){
                if(anchorEl && anchorEl.tagName === "SPAN" && anchorEl.nextElementSibling === null && anchorOffset > 0){
                    formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
                    luckysheetMoveHighlightCell("down", 1, "rangeOfSelect");

                    event.preventDefault();
                }
                else if(anchorEl === richTextEditor.el && anchorEl.childElementCount == anchorOffset){
                    formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
                    luckysheetMoveHighlightCell("down", 1, "rangeOfSelect");

                    event.preventDefault();
                }
                else if(anchorEl && anchorEl.parentElement === richTextEditor.el && anchorEl.textContent.length == anchorOffset){
                    formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
                    luckysheetMoveHighlightCell("down", 1, "rangeOfSelect");

                    event.preventDefault();
                }
            }
            else if(dir == 'left'){
                if(anchorEl && anchorEl.tagName === "SPAN" && anchorEl.previousElementSibling === null && anchorOffset == 0){
                    formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
                    luckysheetMoveHighlightCell("right", -1, "rangeOfSelect");

                    event.preventDefault();
                }
                else if(anchorEl === richTextEditor.el && anchorOffset == 1){
                    formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
                    luckysheetMoveHighlightCell("right", -1, "rangeOfSelect");

                    event.preventDefault();
                }
                else if(anchorEl && anchorEl.parentElement === richTextEditor.el && anchorOffset == 0){
                    formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
                    luckysheetMoveHighlightCell("right", -1, "rangeOfSelect");

                    event.preventDefault();
                }
                else{
                    formula.rangeHightlightselected(richTextEditor.el);
                }
            }
            else if(dir == 'right'){
                if(anchorEl && anchorEl.tagName === "SPAN" && anchorEl.nextElementSibling === null && anchorOffset > 0){
                    formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
                    luckysheetMoveHighlightCell("right", 1, "rangeOfSelect");

                    event.preventDefault();
                }
                else if(anchorEl === richTextEditor.el && anchorEl.childElementCount == anchorOffset){
                    formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
                    luckysheetMoveHighlightCell("right", 1, "rangeOfSelect");

                    event.preventDefault();
                }
                else if(anchorEl && anchorEl.parentElement === richTextEditor.el && anchorEl.textContent.length == anchorOffset){
                    formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
                    luckysheetMoveHighlightCell("right", 1, "rangeOfSelect");

                    event.preventDefault();
                }
                else{
                    formula.rangeHightlightselected(richTextEditor.el);
                }
            }
        }
    }
}

export function keyboardInitial(){
    const _locale = locale();
    const locale_drag = _locale.drag;

    //单元格编辑输�?
    inputBox.el.addEventListener("click", function () {
        formula.rangeHightlightselected(richTextEditor.el);
    });
    [inputBox.el, document.getElementById(Store.container)].forEach(_el => {
    if (_el) _el.addEventListener("keydown", function (event) {
        let ctrlKey = event.ctrlKey;
        let altKey = event.altKey;
        let shiftKey = event.shiftKey;
        let kcode = event.keyCode;

        if (isModalMaskVisible() || event.target.classList.contains("luckysheet-mousedown-cancel") || event.target.classList.contains("sp-input") || (isInputBoxActive() && event.target.closest(".luckysheet-input-box") !== null && kcode != keycode.ENTER && kcode != keycode.TAB && kcode != keycode.UP && kcode != keycode.DOWN && kcode != keycode.LEFT && kcode != keycode.RIGHT)) {
            let anchorNode = window.getSelection().anchorNode;
            let anchorEl = anchorNode ? (anchorNode.nodeType === Node.TEXT_NODE ? anchorNode.parentElement : anchorNode) : null;
            
            if(anchorEl && (anchorEl.closest("#luckysheet-helpbox-cell") !== null || anchorEl === document.getElementById("luckysheet-helpbox-cell"))){
                if(kcode == keycode.ENTER){
                    let helpboxValue = document.getElementById("luckysheet-helpbox-cell").textContent;

                    if(formula.iscelldata(helpboxValue)){
                        let cellrange = formula.getcellrange(helpboxValue);
                        
                        Store.luckysheet_select_save = [{ "row": cellrange["row"], "column": cellrange["column"], "row_focus": cellrange["row"][0], "column_focus": cellrange["column"][0] }];
                        selectHightlightShow();
                        
                        let _helpboxEl = document.getElementById("luckysheet-helpbox-cell"); if (_helpboxEl) _helpboxEl.blur();

                        let scroll = getScrollPosition();
                        let scrollLeft = scroll.scrollLeft,
                            scrollTop = scroll.scrollTop;
                        let winH = cellMain.getHeight(), 
                            winW = cellMain.getWidth();

                        let row = Store.visibledatarow[cellrange["row"][1]], 
                            row_pre = cellrange["row"][0] - 1 == -1 ? 0 : Store.visibledatarow[cellrange["row"][0] - 1];
                        let col = Store.visibledatacolumn[cellrange["column"][1]], 
                            col_pre = cellrange["column"][0] - 1 == -1 ? 0 : Store.visibledatacolumn[cellrange["column"][0] - 1];

                        if (col - scrollLeft - winW + 20 > 0) {
                            scrollBarX.setScrollLeft(col - winW + 20);
                        }
                        else if (col_pre - scrollLeft - 20 < 0) {
                            scrollBarX.setScrollLeft(col_pre - 20);
                        }

                        if (row - scrollTop - winH + 20 > 0) {
                            scrollBarY.setScrollTop(row - winH + 20);
                        }
                        else if (row_pre - scrollTop - 20 < 0) {
                            scrollBarY.setScrollTop(row_pre - 20);
                        }
                    }
                }
            }
            
            return;
        }

        if (isModalMaskVisible() || event.target.classList.contains("luckysheet-mousedown-cancel") || event.target.classList.contains("formulaInputFocus")) {
            return;
        }
        
        let inputboxEl = inputBox.el;
        
        if((altKey || event.metaKey) && kcode == keycode.ENTER && parseInt(inputboxEl.style.top) > 0){
            let last = getLastSelection();
            let _focus = getFocusCell();
            let row_index = _focus.row, col_index = _focus.col;
            enterKeyControll(Store.flowdata[row_index][col_index]);
            event.preventDefault();
        }
        else if (kcode == keycode.ENTER && parseInt(inputboxEl.style.top) > 0) {
            if (formulaDialogs.formulaSearchC.isVisible() && formula.searchFunctionCell != null) {
                formula.searchFunctionEnter(formulaDialogs.formulaSearchC.el.querySelector(".luckysheet-formula-search-item-active"));
            }
            else {
                formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
                Store.luckysheet_select_save = [{ 
                    "row": [Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[0]], 
                    "column": [Store.luckysheetCellUpdate[1], Store.luckysheetCellUpdate[1]], 
                    "row_focus": Store.luckysheetCellUpdate[0], 
                    "column_focus": Store.luckysheetCellUpdate[1] 
                }];
                luckysheetMoveHighlightCell("down", 1, "rangeOfSelect");
            }

            if(formulaDialogs.searchParm.isVisible()){
                formulaDialogs.searchParm.hide();
            }
            if(formulaDialogs.searchParmSelect.isVisible()){
                formulaDialogs.searchParmSelect.hide();
            }
            event.preventDefault();
        }
        else if (kcode == keycode.TAB) {
            if (parseInt(inputboxEl.style.top) > 0) {
                return;
            }

            luckysheetMoveHighlightCell("right", 1, "rangeOfSelect");
            event.preventDefault();
        }
        else if(kcode == keycode.F2){
            if (parseInt(inputboxEl.style.top) > 0) {
                return;
            }

            let last = getLastSelection();
            let _focus = getFocusCell();
            let row_index = _focus.row, col_index = _focus.col;
            luckysheetupdateCell(row_index, col_index, Store.flowdata);
            event.preventDefault();
        }
        else if (kcode == keycode.F4 && parseInt(inputboxEl.style.top) > 0) {
            formula.setfreezonFuc(event);
            event.preventDefault();
        }
        else if (kcode == keycode.ESC && parseInt(inputboxEl.style.top) > 0) {
            formula.dontupdate();
            luckysheetMoveHighlightCell("down", 0, "rangeOfSelect");
            event.preventDefault();
        }
        else if (kcode == keycode.ENTER) {
            if(event.target.classList.contains("formulaInputFocus") || conditionformatDialog.main.isVisible()){
                return;
            }
            else if (String.fromCharCode(kcode) != null && document.getElementById("luckysheet-cell-selected")?.offsetWidth > 0) {
                let last = getLastSelection();
                let _focus = getFocusCell();
                let row_index = _focus.row, col_index = _focus.col;
                luckysheetupdateCell(row_index, col_index, Store.flowdata);
                event.preventDefault();
            }
        }
        else {
            if (ctrlKey || event.metaKey) {
                if (shiftKey) {
                    if (!luckysheet_shiftkeydown) {
                        Store.luckysheet_shiftpositon = structuredClone(getLastSelection());
                        Store.luckysheet_shiftkeydown = true;
                    }

                    //Ctrl + shift + 方向�? 调整选区
                    if (kcode == keycode.UP) {
                        if (parseInt(inputboxEl.style.top) > 0 || formulaDialogs.singleRange.isVisible() || formulaDialogs.multiRange.isVisible()) {
                            return;
                        }

                        luckysheetMoveHighlightRange2("up", "rangeOfSelect");
                    }
                    else if (kcode == keycode.DOWN) {
                        if (parseInt(inputboxEl.style.top) > 0 || formulaDialogs.singleRange.isVisible() || formulaDialogs.multiRange.isVisible()) {
                            return;
                        }

                        luckysheetMoveHighlightRange2("down", "rangeOfSelect");
                    }
                    else if (kcode == keycode.LEFT) {
                        if (parseInt(inputboxEl.style.top) > 0 || formulaDialogs.singleRange.isVisible() || formulaDialogs.multiRange.isVisible()) {
                            return;
                        }

                        luckysheetMoveHighlightRange2("left", "rangeOfSelect");
                    }
                    else if (kcode == keycode.RIGHT) {
                        if (parseInt(inputboxEl.style.top) > 0 || formulaDialogs.singleRange.isVisible() || formulaDialogs.multiRange.isVisible()) {
                            return;
                        }

                        luckysheetMoveHighlightRange2("right", "rangeOfSelect");
                    }
                    else if (kcode == 186 || kcode == 222) {
                        let last = getLastSelection();
                        let _focus = getFocusCell();
                        let row_index = _focus.row, 
                            col_index = _focus.col;
                        luckysheetupdateCell(row_index, col_index, Store.flowdata, true);

                        let value = getNowDateTime(2);
                        richTextEditor.setHtml(value);
                        luckysheetRangeLast(richTextEditor.getNativeElement());
                        formula.functionInputHanddler(functionBox.el, richTextEditor.el, kcode);
                    }
                }
                else if (kcode == 66) {//Ctrl + B  加粗
                    document.getElementById("luckysheet-icon-bold").click();
                }
                else if (kcode == 67) {//Ctrl + C  复制
                    if(imageCtrl.currentImgId != null){
                        imageCtrl.copyImgItem(event);
                        return;
                    }

                    //复制时存在格式刷状态，取消格式�?
                    if(menuButton.luckysheetPaintModelOn){
                        menuButton.cancelPaintModel();
                    }
                    
                    if(Store.luckysheet_select_save.length == 0){
                        return;
                    }

                    //复制范围内包含部分合并单元格，提�?
                    if(Store.config["merge"] != null){
                        let has_PartMC = false;

                        for(let s = 0; s < Store.luckysheet_select_save.length; s++){
                            let r1 = Store.luckysheet_select_save[s].row[0], 
                                r2 = Store.luckysheet_select_save[s].row[1];
                            let c1 = Store.luckysheet_select_save[s].column[0], 
                                c2 = Store.luckysheet_select_save[s].column[1];

                            has_PartMC = hasPartMC(Store.config, r1, r2, c1, c2);

                            if(has_PartMC){
                                break;
                            }
                        }

                        if(has_PartMC){
                            if(isEditMode()){
                                alert(locale_drag.noMerge);
                            }
                            else{
                                tooltip.info(locale_drag.noMerge, ""); 
                            }
                            return;    
                        }
                    }

                    //多重选区 有条件格式时 提示
                    let cdformat = getCurrentFile().luckysheet_conditionformat_save;
                    if(Store.luckysheet_select_save.length > 1 && cdformat != null && cdformat.length > 0){
                        let hasCF = false;

                        let cf_compute = conditionformat.getComputeMap();

                        label:
                        for(let s = 0; s < Store.luckysheet_select_save.length; s++){
                            if(hasCF){
                                break;
                            }
                            
                            let r1 = Store.luckysheet_select_save[s].row[0], 
                                r2 = Store.luckysheet_select_save[s].row[1];
                            let c1 = Store.luckysheet_select_save[s].column[0], 
                                c2 = Store.luckysheet_select_save[s].column[1];

                            for(let r = r1; r <= r2; r++){
                                for(let c = c1; c <= c2; c++){
                                    if(conditionformat.checksCF(r, c, cf_compute) != null){
                                        hasCF = true;
                                        continue label;
                                    }
                                }
                            }
                        }

                        if(hasCF){
                            if(isEditMode()){
                                alert(locale_drag.noMulti);
                            }
                            else{
                                tooltip.info(locale_drag.noMulti, "");
                            }
                            return;
                        }
                    }

                    //多重选区 行不一样且列不一样时 提示
                    if(Store.luckysheet_select_save.length > 1){ 
                        let isSameRow = true, 
                            str_r = Store.luckysheet_select_save[0].row[0], 
                            end_r = Store.luckysheet_select_save[0].row[1];
                        let isSameCol = true, 
                            str_c = Store.luckysheet_select_save[0].column[0], 
                            end_c = Store.luckysheet_select_save[0].column[1];
                        
                        for(let s = 1; s < Store.luckysheet_select_save.length; s++){
                            if(Store.luckysheet_select_save[s].row[0] != str_r || Store.luckysheet_select_save[s].row[1] != end_r){
                                isSameRow = false;
                            }
                            if(Store.luckysheet_select_save[s].column[0] != str_c || Store.luckysheet_select_save[s].column[1] != end_c){
                                isSameCol = false;
                            }
                        }

                        if((!isSameRow && !isSameCol) || selectIsOverlap()){
                            if(isEditMode()){
                                alert(locale_drag.noMulti);
                            }
                            else{
                                tooltip.info(locale_drag.noMulti, ""); 
                            }
                            return;
                        }    
                    }

                    selection.copy(event);

                    Store.luckysheet_paste_iscut = false;
                    luckysheetactiveCell();

                    event.stopPropagation();
                    return;
                }
                else if (kcode == 70) {//Ctrl + F  查找
                    searchReplace.createDialog(0);
                    searchReplace.init();

                    let _srFocus = document.querySelector("#luckysheet-search-replace #searchInput input"); if (_srFocus) _srFocus.focus();
                }
                else if (kcode == 72) {//Ctrl + H  替换
                    searchReplace.createDialog(1);
                    searchReplace.init();

                    let _srFocus = document.querySelector("#luckysheet-search-replace #searchInput input"); if (_srFocus) _srFocus.focus();
                }
                else if (kcode == 73) {//Ctrl + I  斜体
                    document.getElementById("luckysheet-icon-italic").click();
                }
                else if (kcode == 86) {//Ctrl + V  粘贴
                    if (isEditMode() || Store.allowEdit === false){//此模式下禁用粘贴
                        return;
                    }

                    if(event.target.classList.contains("formulaInputFocus")){
                        return;
                    }

                    if(Store.luckysheet_select_save.length > 1){
                        if(isEditMode()){
                            alert(locale_drag.noPaste);
                        }
                        else{
                            tooltip.info(locale_drag.noPaste, "");
                        }
                        return;
                    }

                    selection.isPasteAction = true;
                    luckysheetactiveCell();

                    event.stopPropagation();
                    return;
                }
                else if (kcode == 88) {//Ctrl + X  剪切
                    //复制时存在格式刷状态，取消格式�?
                    if(menuButton.luckysheetPaintModelOn){
                        menuButton.cancelPaintModel();
                    }

                    if(Store.luckysheet_select_save.length == 0){
                        return;
                    }

                    //复制范围内包含部分合并单元格，提�?
                    if(Store.config["merge"] != null){
                        let has_PartMC = false;

                        for(let s = 0; s < Store.luckysheet_select_save.length; s++){
                            let r1 = Store.luckysheet_select_save[s].row[0], 
                                r2 = Store.luckysheet_select_save[s].row[1];
                            let c1 = Store.luckysheet_select_save[s].column[0], 
                                c2 = Store.luckysheet_select_save[s].column[1];

                            has_PartMC = hasPartMC(Store.config, r1, r2, c1, c2);

                            if(has_PartMC){
                                break;
                            }
                        }

                        if(has_PartMC){
                            if(luckysheetConfigsetting.editMode){
                                alert(_locale_drag.noMerge);
                            }
                            else{
                                tooltip.info(_locale_drag.noMerge, ""); 
                            }
                            return;    
                        }
                    }

                    //多重选区�?提示
                    if(Store.luckysheet_select_save.length > 1){
                        if(isEditMode()){
                            alert(locale_drag.noMulti);
                        }
                        else{
                            tooltip.info(locale_drag.noMulti, ""); 
                        }
                        return;
                    }

                    selection.copy(event);

                    Store.luckysheet_paste_iscut = true;
                    luckysheetactiveCell();
                    
                    event.stopPropagation();
                    return;
                }
                else if (kcode == 90) {//Ctrl + Z  撤销
                    controlHistory.redo(event);
                    luckysheetactiveCell();
                    event.stopPropagation();
                    return;
                }
                else if (kcode == 89) {//Ctrl + Y  重做
                    controlHistory.undo(event);
                    luckysheetactiveCell();
                    event.stopPropagation();
                    return;
                }
                else if (kcode == keycode.UP) {//Ctrl + up  调整单元�?
                    if (parseInt(inputboxEl.style.top) > 0 || formulaDialogs.singleRange.isVisible() || formulaDialogs.multiRange.isVisible()) {
                        return;
                    }

                    luckysheetMoveHighlightCell2("up", "rangeOfSelect");
                }
                else if (kcode == keycode.DOWN) {//Ctrl + down  调整单元�?
                    if (parseInt(inputboxEl.style.top) > 0 || formulaDialogs.singleRange.isVisible() || formulaDialogs.multiRange.isVisible()) {
                        return;
                    }

                    luckysheetMoveHighlightCell2("down", "rangeOfSelect");
                }
                else if (kcode == keycode.LEFT) {//Ctrl + top  调整单元�?
                    if (parseInt(inputboxEl.style.top) > 0 || formulaDialogs.singleRange.isVisible() || formulaDialogs.multiRange.isVisible()) {
                        return;
                    }

                    luckysheetMoveHighlightCell2("left", "rangeOfSelect");
                }
                else if (kcode == keycode.RIGHT) {//Ctrl + right  调整单元�?
                    if (parseInt(inputboxEl.style.top) > 0 || formulaDialogs.singleRange.isVisible() || formulaDialogs.multiRange.isVisible()) {
                        return;
                    }

                    luckysheetMoveHighlightCell2("right", "rangeOfSelect");
                }
                else if (kcode == 186) {//Ctrl + ; 填充系统日期
                    let last = getLastSelection();
                    let _focus = getFocusCell();
                    let row_index = _focus.row, 
                        col_index = _focus.col;
                    luckysheetupdateCell(row_index, col_index, Store.flowdata, true);

                    let value = getNowDateTime(1);
                    richTextEditor.setHtml(value);
                    luckysheetRangeLast(richTextEditor.getNativeElement());
                    formula.functionInputHanddler(functionBox.el, richTextEditor.el, kcode);
                }
                else if (kcode == 222) {
                    let last = getLastSelection();
                    let _focus = getFocusCell();
                    let row_index = _focus.row,
                        col_index = _focus.col;
                    luckysheetupdateCell(row_index, col_index, Store.flowdata, true);

                    let value = getNowDateTime(2);
                    richTextEditor.setHtml(value);
                    luckysheetRangeLast(richTextEditor.getNativeElement());
                    formula.functionInputHanddler(functionBox.el, richTextEditor.el, kcode);
                }
                else if (String.fromCharCode(kcode).toLocaleUpperCase() == "A") {
                    document.getElementById("luckysheet-left-top").click()
                }

                event.preventDefault();
                return;
            }
            else if (shiftKey && (kcode == keycode.UP || kcode == keycode.DOWN || kcode == keycode.LEFT || kcode == keycode.RIGHT || (altKey && (kcode == 53 || kcode == 101)))) {
                if (parseInt(inputboxEl.style.top) > 0 || event.target.classList.contains("formulaInputFocus")) {
                    return;
                }

                if (!luckysheet_shiftkeydown) {
                    Store.luckysheet_shiftpositon = structuredClone(getLastSelection());
                    Store.luckysheet_shiftkeydown = true;
                }

                //shift + 方向�?调整选区
                if (kcode == keycode.UP) {
                    if(formulaDialogs.singleRange.isVisible() || formulaDialogs.multiRange.isVisible()){
                        return;
                    } 

                    luckysheetMoveHighlightRange("down", -1, "rangeOfSelect");
                }
                else if (kcode == keycode.DOWN) {
                    if(formulaDialogs.singleRange.isVisible() || formulaDialogs.multiRange.isVisible()){
                        return;
                    }

                    luckysheetMoveHighlightRange("down", 1, "rangeOfSelect");
                }
                else if (kcode == keycode.LEFT) {
                    if(formulaDialogs.singleRange.isVisible() || formulaDialogs.multiRange.isVisible()){
                        return;
                    }

                    luckysheetMoveHighlightRange("right", -1, "rangeOfSelect");
                }
                else if (kcode == keycode.RIGHT) {
                    if(formulaDialogs.singleRange.isVisible() || formulaDialogs.multiRange.isVisible()){
                        return;
                    }
                    
                    luckysheetMoveHighlightRange("right", 1, "rangeOfSelect");
                }
                else if (altKey && (kcode == 53 || kcode == 101)) {
                    //Alt + Shift + 5（删除线�?
                    document.getElementById("luckysheet-icon-strikethrough").click();
                }

                event.preventDefault();
            }
            else if (kcode == keycode.ESC) {
                if(menuButton.luckysheetPaintModelOn){
                    menuButton.cancelPaintModel();
                }
                else{
                    cleargridelement(event);
                    event.preventDefault(); 
                }

                selectHightlightShow();
            }
            else if (kcode == keycode.DELETE || kcode == keycode.BACKSPACE) {
                if(imageCtrl.currentImgId != null){
                    imageCtrl.removeImgItem();
                }
                else{
                    document.getElementById("luckysheet-delete-text").click();
                }

                event.preventDefault();
            }
            else if(kcode == 8 && imageCtrl.currentImgId != null){
                imageCtrl.removeImgItem();
                event.preventDefault();
            }
            else if (kcode == keycode.UP) {
                if (parseInt(inputboxEl.style.top) > 0 || Store.luckysheet_cell_selected_move || Store.luckysheet_cell_selected_extend || event.target.classList.contains("formulaInputFocus") || formulaDialogs.singleRange.isVisible() || formulaDialogs.multiRange.isVisible()) {
                    return;
                }

                luckysheetMoveHighlightCell("down", -1, "rangeOfSelect");
                event.preventDefault();
            }
            else if (kcode == keycode.DOWN) {
                if (parseInt(inputboxEl.style.top) > 0 || Store.luckysheet_cell_selected_move || Store.luckysheet_cell_selected_extend || event.target.classList.contains("formulaInputFocus") || formulaDialogs.singleRange.isVisible() || formulaDialogs.multiRange.isVisible()) {
                    return;
                }

                luckysheetMoveHighlightCell("down", 1, "rangeOfSelect");
                event.preventDefault();
            }
            else if (kcode == keycode.LEFT) {
                if (parseInt(inputboxEl.style.top) > 0 || Store.luckysheet_cell_selected_move || Store.luckysheet_cell_selected_extend || event.target.classList.contains("formulaInputFocus") || formulaDialogs.singleRange.isVisible() || formulaDialogs.multiRange.isVisible()) {
                    return;
                }

                luckysheetMoveHighlightCell("right", -1, "rangeOfSelect");
                event.preventDefault();
            }
            else if (kcode == keycode.RIGHT) {
                if (parseInt(inputboxEl.style.top) > 0 || Store.luckysheet_cell_selected_move || Store.luckysheet_cell_selected_extend || event.target.classList.contains("formulaInputFocus") || formulaDialogs.singleRange.isVisible() || formulaDialogs.multiRange.isVisible()) {
                    return;
                }

                luckysheetMoveHighlightCell("right", 1, "rangeOfSelect");
                event.preventDefault();
            }
            else if (!((kcode >= 112 && kcode <= 123) || kcode <= 46 || kcode == 144 || kcode == 108 || event.ctrlKey || event.altKey || (event.shiftKey && (kcode == 37 || kcode == 38 || kcode == 39 || kcode == 40))) || kcode == 8 || kcode == 32 || kcode == 46 || kcode == 0 || (event.ctrlKey && kcode == 86)) {
                if (String.fromCharCode(kcode) != null && document.getElementById("luckysheet-cell-selected")?.offsetWidth > 0 && (kcode != keycode.CAPSLOCK && kcode != keycode.WIN && kcode != 18)) {
                    let last = getLastSelection();
                    let _focus = getFocusCell();
                    let row_index = _focus.row, col_index = _focus.col;

                    luckysheetupdateCell(row_index, col_index, Store.flowdata, true);
                    if(kcode == 8){
                        richTextEditor.setHtml("<br/>");
                    }
                    formula.functionInputHanddler(functionBox.el, richTextEditor.el, kcode);
                }
            }
        }
        
        luckysheetactiveCell();

        event.stopPropagation();
    });
    });

    //单元格编�?keydown (公式 上下左右键移�?
    [document.getElementById(Store.container), inputBox.el].forEach(_el2 => {
    if (_el2) _el2.addEventListener("keydown", function (event) {
        if (isModalMaskVisible() || event.target.classList.contains("luckysheet-mousedown-cancel") || event.target.classList.contains("formulaInputFocus")) {
            return;
        }

        let ctrlKey = event.ctrlKey;
        let altKey = event.altKey;
        let shiftKey = event.shiftKey;
        let kcode = event.keyCode;

        let inputboxEl = inputBox.el;
        if (kcode == keycode.ESC && isInputBoxActive()) {
            formula.dontupdate();
            luckysheetMoveHighlightCell("down", 0, "rangeOfSelect");
            event.preventDefault();
        }
        else if (kcode == keycode.ENTER && parseInt(inputboxEl.style.top) > 0) {
            if (formulaDialogs.formulaSearchC.isVisible() && formula.searchFunctionCell != null) {
                formula.searchFunctionEnter(formulaDialogs.formulaSearchC.el.querySelector(".luckysheet-formula-search-item-active"));
                event.preventDefault();
            }
        }
        else if(kcode == keycode.TAB && parseInt(inputboxEl.style.top) > 0){
            if (formulaDialogs.formulaSearchC.isVisible() && formula.searchFunctionCell != null) {
                formula.searchFunctionEnter(formulaDialogs.formulaSearchC.el.querySelector(".luckysheet-formula-search-item-active"));
            }
            else{
                formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
                luckysheetMoveHighlightCell("right", 1, "rangeOfSelect");
            }

            event.preventDefault();
        }
        else if (kcode == keycode.F4 && parseInt(inputboxEl.style.top) > 0) {
            formula.setfreezonFuc(event);
            event.preventDefault();
        }
        else if (kcode == keycode.UP && parseInt(inputboxEl.style.top) > 0) {
            formulaMoveEvent("up", ctrlKey, shiftKey,event);
        }
        else if (kcode == keycode.DOWN && parseInt(inputboxEl.style.top) > 0) {
            formulaMoveEvent("down", ctrlKey, shiftKey,event);
        }
        else if (kcode == keycode.LEFT && parseInt(inputboxEl.style.top) > 0) {
            formulaMoveEvent("left", ctrlKey, shiftKey,event);
        }
        else if (kcode == keycode.RIGHT && parseInt(inputboxEl.style.top) > 0) {
            formulaMoveEvent("right", ctrlKey, shiftKey,event);
        }
        else if (!((kcode >= 112 && kcode <= 123) || kcode <= 46 || kcode == 144 || kcode == 108 || event.ctrlKey || event.altKey || (event.shiftKey && (kcode == 37 || kcode == 38 || kcode == 39 || kcode == 40 || kcode == keycode.WIN || kcode == keycode.WIN_R || kcode == keycode.MENU))) || kcode == 8 || kcode == 32 || kcode == 46 || (event.ctrlKey && kcode == 86)) {
                formula.functionInputHanddler(functionBox.el, richTextEditor.el, kcode);
                setCenterInputPosition(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1], Store.flowdata);
        }
    });
    if (_el2) _el2.addEventListener("keyup", function (e) {
        let kcode = e.keyCode;
        
        if (!e.shiftKey && kcode == 16) {
            Store.luckysheet_shiftkeydown = false;
            Store.luckysheet_shiftpositon = null;
        }

        if(isInputBoxActive() && (kcode == 13 || kcode == 16 || kcode == 32)){
        }

        e.preventDefault();
    });
    });

    //top workBook rename
    let _infoInput = document.getElementById("luckysheet_info_detail_input");
    if (_infoInput) {
        _infoInput.value = luckysheetConfigsetting.title;
        _infoInput.style.width = getByteLen(luckysheetConfigsetting.title) * 10 + 'px';
        _infoInput.addEventListener("keydown", function(e){
            let kcode = e.keyCode;
            if(kcode == keycode.ENTER){
                this.blur();
                this.dispatchEvent(new Event('change'));
            }
        });
        _infoInput.addEventListener('input', function() {
            let inputlen = getByteLen(this.value)*10;
            let updatelen = document.getElementById("luckysheet_info_detail_update")?.offsetWidth || 0;
            let savelen = document.getElementById("luckysheet_info_detail_save")?.offsetWidth || 0;
            let userlen = (document.getElementById("luckysheet_info_detail_user")?.parentElement?.offsetWidth || 0)+60;
            let containerlen = document.getElementById(Store.container)?.offsetWidth || 0;
            let otherlen = 100;

            let minuslen = containerlen- savelen - updatelen - userlen - otherlen;
            if(inputlen > minuslen){
                document.getElementById("luckysheet_info_detail_input").style.width = minuslen + 'px';
            }
            else{
                document.getElementById("luckysheet_info_detail_input").style.width = inputlen + 'px';
            }
        });
        _infoInput.addEventListener('change', function(){
        });
    }


    // 右击菜单的input输入�?敲击Enter一样生�?
    [document.getElementById(Store.container), ...document.querySelectorAll("input.luckysheet-mousedown-cancel")].forEach(_el3 => {
    if (_el3) _el3.addEventListener("keydown", function (event) {

        const element =  event.target.closest('.luckysheet-cols-menuitem');
        if (typeof(element) != 'undefined' && element != null && event.keyCode === 13){
            element.click();
        }

    });
    });
}
