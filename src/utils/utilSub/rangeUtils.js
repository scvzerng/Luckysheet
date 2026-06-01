import Store from '../../store/index.js';
import { getObjType } from './typeUtils.js';

function transformRangeToAbsolute(txt1) {
    if (txt1 == null || txt1.length == 0) {
        return null;
    }

    let txtArray = txt1.split(",");
    let ret = "";
    for (let i = 0; i < txtArray.length; i++) {
        let txt = txtArray[i];
        let txtSplit = txt.split("!"),
            sheetName = "",
            rangeTxt = "";
        if (txtSplit.length > 1) {
            sheetName = txtSplit[0];
            rangeTxt = txtSplit[1];
        } else {
            rangeTxt = txtSplit[0];
        }

        let rangeTxtArray = rangeTxt.split(":");

        let rangeRet = "";
        for (let a = 0; a < rangeTxtArray.length; a++) {
            let t = rangeTxtArray[a];

            let row = t.replace(/[^0-9]/g, "");
            let col = t.replace(/[^A-Za-z]/g, "");
            let rangeTT = "";
            if (col != "") {
                rangeTT += "$" + col;
            }

            if (row != "") {
                rangeTT += "$" + row;
            }

            rangeRet += rangeTT + ":";
        }

        rangeRet = rangeRet.substr(0, rangeRet.length - 1);

        ret += sheetName + rangeRet + ",";
    }

    return ret.substr(0, ret.length - 1);
}

function isRowHidden(r, config) {
    config = config || Store.config;
    return config != null && config["rowhidden"] != null && config["rowhidden"][r] != null;
}

function isColHidden(c, config) {
    config = config || Store.config;
    return config != null && config["colhidden"] != null && config["colhidden"][c] != null;
}

function isCellValid(data, r, c) {
    return data != null && data[r] != null && data[r][c] != null;
}

function isMergeCell(cell) {
    return getObjType(cell) == "object" && "mc" in cell && cell.mc != null && cell.mc.rs != null;
}

function iterateCellRange(cellrange, callback, options) {
    options = options || {};
    let skipHidden = options.skipHidden || false;
    let skipNull = options.skipNull || false;
    let data = options.data || Store.sheetData;
    let config = options.config || Store.config;

    for (let s = 0; s < cellrange.length; s++) {
        for (let r = cellrange[s].row[0]; r <= cellrange[s].row[1]; r++) {
            if (skipHidden && isRowHidden(r, config)) {
                continue;
            }
            for (let c = cellrange[s].column[0]; c <= cellrange[s].column[1]; c++) {
                if (skipHidden && isColHidden(c, config)) {
                    continue;
                }
                let cellValue = null;
                if (isCellValid(data, r, c)) {
                    cellValue = data[r][c];
                } else if (skipNull) {
                    continue;
                }
                let result = callback(r, c, cellValue);
                if (result === false) {
                    return;
                }
            }
        }
    }
}

export { transformRangeToAbsolute, isRowHidden, isColHidden, isCellValid, isMergeCell, iterateCellRange };
