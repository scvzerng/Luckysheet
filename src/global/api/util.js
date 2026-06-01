import conditionformat from "../../controllers/conditionformat";
import luckysheetConfigsetting from "../../controllers/luckysheetConfigsetting";
import menuButton from "../../controllers/menuButton";
import luckysheetsizeauto from "../../controllers/resize";
import luckysheetSearchReplace from "../../controllers/searchReplace";
import sheetmanage from "../../controllers/sheetmanage";
import locale from "../../locale/locale";
import Store from "../../store";
import { getObjType } from "../../utils/util";
import { getLastSelection, getFocusCell } from '../../utils/storeAccess.js';
import formula from "../formula";
import method from "../method";
import { getRangeWithFlatten } from "./rangeRead";
import { luckysheetrefreshgrid } from "../refresh";
import sPage from "../../plugins/js/sPage.js";

export function getRangeByTxt(txt){

    // 默认取当前第一个范围
    if(txt == null){
        return {
            column:getLastSelection().column,
            row:getLastSelection().row
        }
    }

    const range = conditionformat.getRangeByTxt(txt);

    return {
        column:range[0].column,
        row:range[0].row
    };
}

export function getTxtByRange(range=Store.luckysheet_select_save){

    // 单个范围
    if(getObjType(range) === 'object'){
        range = [range];
    }
    return conditionformat.getTxtByRange(range);
}

export function pagerInit (config) {
    const {prevPage, nextPage, total} = locale().button;
    document.getElementById("luckysheet-bottom-pager")?.remove()
    const _sheetContent = document.getElementById("luckysheet-sheet-content");
    if (_sheetContent) _sheetContent.insertAdjacentHTML('afterend', '<div id="luckysheet-bottom-pager" style="font-size: 14px; margin-left: 10px; display: inline-block;"></div>');
    const pagerEl = document.getElementById("luckysheet-bottom-pager");
    if (pagerEl) {
        new sPage(pagerEl, {
            page: config.pageIndex,
            total: config.total,
            selectOption: config.selectOption,
            pageSize: config.pageSize,
            showTotal: config.showTotal,
            showSkip: config.showSkip,
            showPN: config.showPN,
            prevPage: config.prevPage || prevPage,
            nextPage: config.nextPage || nextPage,
            totalTxt: config.totalTxt || total + config.total,
            backFun: function (page) {
                page.pageIndex = page.page
                if(!method.createHookFunction("onTogglePager", page)){ return; }
            }
        });
    }
}

export function refreshFormula (success) {
    formula.execFunctionGroupForce(true);
    luckysheetrefreshgrid()
    setTimeout(() => {
      if (success && typeof success === 'function') {
          success();
      }
    })
}

export function updataSheet (options = {}) {
    let {data, success} = options
    let files = Store.luckysheetfile
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < files.length; j++) {
            if (files[j].index === data[i].index) {
                files[j] = data[i]
            }
        }
    }
    let file = files[sheetmanage.getSheetIndex(Store.currentSheetIndex)],
        sheetData = sheetmanage.buildGridData(file);
    file.data = sheetData

    luckysheetsizeauto(false);

    sheetmanage.mergeCalculation(file["index"]);
    sheetmanage.setSheetParam();
    setTimeout(function () {
        sheetmanage.showSheet();
        sheetmanage.restoreCache();
        formula.execFunctionGroupForce(luckysheetConfigsetting.forceCalculation);
        sheetmanage.restoreSheetAll(Store.currentSheetIndex);
        luckysheetrefreshgrid();
        if (success && typeof success === 'function') {
            success();
        }
    }, 1);
}

export function refreshMenuButtonFocus(data ,r,c , success){
    data = data || Store.sheetData;
    if(r == null && c == null){
        /* 获取选取范围 */
        let last = getLastSelection();
        let _focus = getFocusCell();

        r = _focus.row || last.row[0];
        c = _focus.col || last.column[0];
    }

    menuButton.menuButtonFocus(data, r, c);

    setTimeout(() => {
        if (success && typeof success === 'function') {
            success();
        }
    })
}

export function checkTheStatusOfTheSelectedCells(type,status){

    /* 获取选区内所有的单元格-扁平后的处理 */
    let cells = getRangeWithFlatten();

    let flag = cells.every(({r,c})=>{
        let cell = Store.sheetData[r][c];
        if(cell == null){
            return false;
        }
        return cell[type] == status;
    })

    return flag;
}

export function openSearchDialog(source = 1){
    luckysheetSearchReplace.createDialog(source);
    luckysheetSearchReplace.init();
    document.querySelector("#luckysheet-search-replace #searchInput input")?.focus();
}
