import { getSheetIndex } from "../../methods/get";
import Store from "../../store";
import func_methods from "../func_methods";
import { jfrefreshgrid, luckysheetrefreshgrid } from "../refresh";
import tooltip from "../tooltip";
import { setCellValue } from "./cellOperation";

export function find(content, options = {}) {
    if (!content && content != 0) {
        return tooltip.info('Search content cannot be null or empty', '')
    }

    let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
    let {
        isRegularExpression = false,
        isWholeWord = false,
        isCaseSensitive = false,
        order = curSheetOrder,
        type = "m"
    } = { ...options };
    let targetSheetData = Store.luckysheetfile[order].data;

    let result = [];
    for (let i = 0; i < targetSheetData.length; i++) {
        const rowArr = targetSheetData[i];

        for (let j = 0; j < rowArr.length; j++) {
            const cell = rowArr[j];

            if (!cell) {
                continue;
            }

            // 添加cell的row, column属性
            // replace方法中的setCellValue中需要使用该属性
            cell.row = i;
            cell.column = j;

            if (isWholeWord) {
                if (isCaseSensitive) {
                    if (content.toString() == cell[type]) {
                        result.push(cell)
                    }
                } else {
                    if (cell[type] && content.toString().toLowerCase() == cell[type].toLowerCase()) {
                        result.push(cell)
                    }
                }
            } else if (isRegularExpression) {
                let reg;
                if (isCaseSensitive) {
                    reg = new RegExp(func_methods.getRegExpStr(content), 'g')
                } else {
                    reg = new RegExp(func_methods.getRegExpStr(content), 'ig')
                }
                if (reg.test(cell[type])) {
                    result.push(cell)
                }
            } else if (isCaseSensitive) {
                let reg = new RegExp(func_methods.getRegExpStr(content), 'g');
                if (reg.test(cell[type])) {
                    result.push(cell);
                }
            } else {
                let reg = new RegExp(func_methods.getRegExpStr(content), 'ig');
                if (reg.test(cell[type])) {
                    result.push(cell);
                }
            }
        }
    }

    return result;
}

export function replace(content, replaceContent, options = {}) {
    let matchCells = find(content, options)
    let curSheetOrder = getSheetIndex(Store.currentSheetIndex);
    let {
        order = curSheetOrder,
    } = {...options}

    let file = Store.luckysheetfile[order];

    if(file == null){
        return tooltip.info("The order parameter is invalid.", "");
    }
    let sheetData = $.extend(true, [], file.data);

    matchCells.forEach(cell => {
        cell.m = replaceContent;
        setCellValue(cell.row, cell.column, replaceContent, {order: order, isRefresh: false});
    })

    let fileData = $.extend(true, [], file.data);
    file.data.length = 0;
    file.data.push(...sheetData);

    if(file.index == Store.currentSheetIndex){
        jfrefreshgrid(fileData, undefined, undefined, true, false);
    }

    luckysheetrefreshgrid();

    if (options.success && typeof options.success === 'function') {
        options.success(matchCells)
    }
    return matchCells;
}
