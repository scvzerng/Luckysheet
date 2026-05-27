import func_methods from '../../global/func_methods';
import { valueIsError, error } from '../../global/validate';
import { isRealNum } from '../../global/validate';
import { getObjType } from '../../utils/util';
import { getRangetxt } from '../../methods/get';
import formula from '../../global/formula';
import Store from '../../store';
import { luckysheet_getcelldata } from './getCellData';

function luckysheet_indirect_check() {
    let cellTxt = arguments[0];
    if (cellTxt == null || cellTxt.length == 0) {
        return null;
    }
    return cellTxt;
}

function luckysheet_indirect_check_return(txt) {
    return txt;
}

function luckysheet_offset_check() {
    if (!(getObjType(arguments[0]) == "object" && arguments[0].startCell != null)) {
        return formula.error.v;
    }

    var reference = arguments[0].startCell;

    var rows = func_methods.getFirstValue(arguments[1]);
    if (valueIsError(rows)) {
        return rows;
    }

    if (!isRealNum(rows)) {
        return formula.error.v;
    }

    rows = parseInt(rows);

    var cols = func_methods.getFirstValue(arguments[2]);
    if (valueIsError(cols)) {
        return cols;
    }

    if (!isRealNum(cols)) {
        return formula.error.v;
    }

    cols = parseInt(cols);

    var height = arguments[0].rowl;
    if (arguments.length >= 4) {
        height = func_methods.getFirstValue(arguments[3]);
        if (valueIsError(height)) {
            return height;
        }

        if (!isRealNum(height)) {
            return formula.error.v;
        }

        height = parseInt(height);
    }

    var width = arguments[0].coll;
    if (arguments.length == 5) {
        width = func_methods.getFirstValue(arguments[4]);
        if (valueIsError(width)) {
            return width;
        }

        if (!isRealNum(width)) {
            return formula.error.v;
        }

        width = parseInt(width);
    }

    if (height < 1 || width < 1) {
        return formula.error.r;
    }

    var cellrange = formula.getcellrange(reference);
    var cellRow0 = cellrange["row"][0];
    var cellCol0 = cellrange["column"][0];

    cellRow0 += rows;
    cellCol0 += cols;

    var cellRow1 = cellRow0 + height - 1;
    var cellCol1 = cellCol0 + width - 1;

    if (cellRow0 < 0 || cellRow1 >= Store.flowdata.length || cellCol0 < 0 || cellCol1 >= Store.flowdata[0].length) {
        return formula.error.r;
    }

    return getRangetxt(Store.calculateSheetIndex, {
        row: [cellRow0, cellRow1],
        column: [cellCol0, cellCol1]
    });
}

function luckysheet_getSpecialReference(isCellFirst, param1, param2) {
    let functionRange, rangeTxt;
    if(isCellFirst){
        rangeTxt = param1;
        functionRange = param2;
    }
    else{
        functionRange = param1;
        rangeTxt = param2;
    }

    if(functionRange.startCell.indexOf(":")>-1 || rangeTxt.indexOf(":")>-1){
        return error.v;
    }

    if(isCellFirst){
        return luckysheet_getcelldata(rangeTxt + ":" +functionRange.startCell);
    }
    else{
        let rangeT = rangeTxt, sheetName="";
        if(rangeTxt.indexOf("!")>-1){
            let rangetxtArr = rangeTxt.split("!");
            sheetName = rangetxtArr[0] + "!";
            rangeT = rangetxtArr[1];
        }
        return luckysheet_getcelldata(sheetName + functionRange.startCell + ":" + rangeT);
    }
}

export { luckysheet_indirect_check, luckysheet_indirect_check_return, luckysheet_offset_check, luckysheet_getSpecialReference };
