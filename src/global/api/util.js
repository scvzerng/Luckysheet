import conditionformat from "../../controllers/conditionformat";
import luckysheetConfigsetting from "../../controllers/luckysheetConfigsetting";
import menuButton from "../../controllers/menuButton";
import luckysheetsizeauto from "../../controllers/resize";
import luckysheetSearchReplace from "../../controllers/searchReplace";
import sheetmanage from "../../controllers/sheetmanage";
import locale from "../../locale/locale";
import Store from "../../store";
import { getObjType } from "../../utils/util";
import formula from "../formula";
import method from "../method";
import { getRangeWithFlatten } from "./rangeRead";
import { luckysheetrefreshgrid } from "../refresh";

export function getRangeByTxt(txt){

    // 默认取当前第一个范围
    if(txt == null){
        return {
            column:Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1].column,
            row:Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1].row
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
    $('#luckysheet-bottom-pager').remove()
    $('#luckysheet-sheet-content').after('<div id="luckysheet-bottom-pager" style="font-size: 14px; margin-left: 10px; display: inline-block;"></div>')
    $("#luckysheet-bottom-pager").sPage({
        page: config.pageIndex, //当前页码，必填
        total: config.total, //数据总条数，必填
        selectOption: config.selectOption, // 选择每页的行数，
        pageSize: config.pageSize, //每页显示多少条数据，默认10条
        showTotal: config.showTotal, // 是否显示总数，默认关闭：false
        showSkip: config.showSkip, //是否显示跳页，默认关闭：false
        showPN: config.showPN, //是否显示上下翻页，默认开启：true
        prevPage: config.prevPage || prevPage, //上翻页文字描述，默认"上一页"
        nextPage: config.nextPage || nextPage, //下翻页文字描述，默认"下一页"
        totalTxt: config.totalTxt || total + config.total, // 数据总条数文字描述，{total}为占位符，默认"总共：{total}"
        backFun: function (page) {
            page.pageIndex = page.page
            if(!method.createHookFunction("onTogglePager", page)){ return; }
        }
    });
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
    data = data || Store.flowdata;
    if(r == null && c == null){
        /* 获取选取范围 */
        let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length -1];

        r = last.row_focus || last.row[0];
        c = last.column_focus || last.column[0];
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
        let cell = Store.flowdata[r][c];
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
    $("#luckysheet-search-replace #searchInput input").focus();
}
