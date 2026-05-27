import formula from '../../global/formula';
import tooltip from '../../global/tooltip';
import { getdatabyselectionD } from '../../global/getdata';
import { getSheetIndex, getluckysheetfile, getRangetxt } from '../../methods/get';
import { ABCatNum } from '../../utils/util';
import Store from '../../store';

function luckysheet_getcelldata(txt) {
    if (window.luckysheet_getcelldata_cache == null) {
        window.luckysheet_getcelldata_cache = {};
    }

    if (txt in window.luckysheet_getcelldata_cache) {
        return window.luckysheet_getcelldata_cache[txt];
    }

    let luckysheetfile = getluckysheetfile();
    let val = txt.split("!");
    let sheettxt = "",
        rangetxt = "",
        sheetIndex = -1,
        sheetdata = null;

    if (val.length > 1) {
        sheettxt = val[0].replace(/''/g,"'");
        rangetxt = val[1];

        if(sheettxt.substr(0,1)=="'" && sheettxt.substr(sheettxt.length-1,1)=="'"){
            sheettxt = sheettxt.substring(1,sheettxt.length-1);
        }

        for (let i in luckysheetfile) {
            if (sheettxt == luckysheetfile[i].name) {
                sheetIndex = luckysheetfile[i].index;
                sheetdata = luckysheetfile[i].data;
                break;
            }
        }

        if (sheetIndex == -1) {
            sheetIndex = 0;
        }
    }
    else {
        let index = getSheetIndex(Store.calculateSheetIndex);
        sheettxt = luckysheetfile[index].name;
        sheetIndex = luckysheetfile[index].index;
        sheetdata = luckysheetfile[index].data;
        rangetxt = val[0];
    }

    if (rangetxt.indexOf(":") == -1) {
        let row = parseInt(rangetxt.replace(/[^0-9]/g, "")) - 1;
        let col = ABCatNum(rangetxt.replace(/[^A-Za-z]/g, ""));

        if (!isNaN(row) && !isNaN(col)) {
            let ret = getdatabyselectionD(sheetdata, {
                "row": [row, row],
                "column": [col, col]
            })[0][0];

            if (formula.execFunctionGlobalData != null) {
                let ef = formula.execFunctionGlobalData[row+"_"+col+"_"+sheetIndex];
                if(ef!=null){
                    ret = ef;
                }
            }

            let rowl = 1;
            let coll = 1;
            let retAll= {
                "sheetName": sheettxt,
                "startCell": rangetxt,
                "rowl": rowl,
                "coll": coll,
                "data": ret
            };

            window.luckysheet_getcelldata_cache[txt] = retAll;

            return retAll;
        }
        else {
            return [];
        }
    }
    else {
        rangetxt = rangetxt.split(":");
        let row = [], col = [];
        row[0] = parseInt(rangetxt[0].replace(/[^0-9]/g, "")) - 1;
        row[1] = parseInt(rangetxt[1].replace(/[^0-9]/g, "")) - 1;

        if (isNaN(row[0])) {
            row[0] = 0;
        }

        if (isNaN(row[1])) {
            row[1] = sheetdata.length - 1;
        }

        if (row[0] > row[1]) {
            tooltip.info("选择失败", "输入范围错误！");
            return [];
        }

        col[0] = ABCatNum(rangetxt[0].replace(/[^A-Za-z]/g, ""));
        col[1] = ABCatNum(rangetxt[1].replace(/[^A-Za-z]/g, ""));

        if (isNaN(col[0])) {
            col[0] = 0;
        }

        if (isNaN(col[1])) {
            col[1] = sheetdata[0].length - 1;
        }

        if (col[0] > col[1]) {
            tooltip.info("选择失败", "输入范围错误！");
            return [];
        }

        let ret = getdatabyselectionD(sheetdata, {
            "row": row,
            "column": col
        });

        if(formula.execFunctionGlobalData!=null){
            for(let r=row[0];r<=row[1];r++){
                for(let c=col[0];c<=col[1];c++){
                    let ef = formula.execFunctionGlobalData[r+"_"+c+"_"+sheetIndex];
                    if(ef!=null){
                        ret[r-row[0]][c-col[0]] = ef;
                    }
                }
            }
        }

        let rowl = row[1] - row[0] + 1;
        let coll = col[1] - col[0] + 1;
        let retAll= {
            "sheetName": sheettxt,
            "startCell": rangetxt[0],
            "rowl": rowl,
            "coll": coll,
            "data": ret
        };

        window.luckysheet_getcelldata_cache[txt] = retAll;

        return retAll;
    }
}

export { luckysheet_getcelldata };
