import {  chatatABC,  ABCatNum } from "../../utils/util";
import {  getSheetIndex,  getluckysheetfile  } from "../../methods/get";
import {  isdatatype  } from "../datecontroll";
import {  genarate } from "../format";
// import luckysheet_function from '../function/luckysheet_function';
// import functionlist from '../function/functionlist';
import {
    luckysheet_compareWith,
    luckysheet_getarraydata,
    luckysheet_getcelldata,
    luckysheet_parseData,
    luckysheet_getValue,
    luckysheet_indirect_check,
    luckysheet_indirect_check_return,
    luckysheet_offset_check,
    luckysheet_calcADPMM,
    luckysheet_getSpecialReference,
} from "../../function/func";
import Store from "../../store";

const cellRange = {
        cellOffset: function(range, rows, cols, height, width) {
            // 参数：range or cell , rows,cols,height,width
            let startCell = range.startCell;
            let rowl = range.rowl;
            let coll = range.coll;
            let startCellRow = parseInt(startCell.replace(/[^0-9]/g, ""));
            let startCellCol = ABCatNum(startCell.replace(/[^A-Za-z]/g, ""));

            let row = [],
                col = [],
                offsetRange;
            row[0] = startCellRow + rows;
            col[0] = startCellCol + cols;

            row[1] = row[0] + height - 1;
            col[1] = col[0] + width - 1;

            col[0] = chatatABC(col[0]);
            col[1] = chatatABC(col[1]);

            let cellF = col[0] + row[0];
            let cellL = col[1] + row[1];

            if (cellF == cellL) {
                offsetRange = range.sheetName + "!" + cellF;
            } else {
                offsetRange = range.sheetName + "!" + cellF + ":" + cellL;
            }

            return offsetRange;
        },

        parseDatetoNum: function(date) {
            //函数中获取到时间格式或者数字形式统一转化为数字进行运算
            let _this = this;

            if (typeof date == "object" && typeof date.v == "number") {
                date = date.v;
            } else if (isdatatype(date) == "num") {
                date = parseFloat(date);
            } else if (isdatatype(date) == "date") {
                date = genarate(date)[2];
            } else {
                return _this.error.v;
            }

            return date;
        },
        //获取一维数组,

        getRangeArray: function(range) {
            let rangeNow = [];
            let fmt = "General";

            if (range.length == 1) {
                //一行
                for (let c = 0; c < range[0].length; c++) {
                    if (range[0][c] != null && range[0][c].v) {
                        rangeNow.push(range[0][c].v);
                        let f = range[0][c].ct?.fa;
                        fmt = fmt == "General" ? f : fmt;
                    } else {
                        //若单元格为null或为空，此处推入null（待考虑是否使用"null"）
                        rangeNow.push(null);
                    }
                }
            } else if (range[0].length == 1) {
                //一列
                for (let r = 0; r < range.length; r++) {
                    if (range[r][0] != null && range[r][0].v) {
                        rangeNow.push(range[r][0].v);
                        let f = range[r][0].ct?.fa;
                        fmt = fmt == "General" ? f : fmt;
                    } else {
                        rangeNow.push(null);
                    }
                }
            } else {
                for (let r = 0; r < range.length; r++) {
                    for (let c = 0; c < range[r].length; c++) {
                        if (range[r][c] != null && range[r][c].v) {
                            rangeNow.push(range[r][c].v);
                            let f = range[r][c].ct?.fa;
                            fmt = fmt == "General" ? f : fmt;
                        } else {
                            rangeNow.push(null);
                        }
                    }
                }
            }

            fmt = fmt ?? "General";

            range = rangeNow;

            return [range, fmt];
        },
        //获取二维数组：qksheet格式[[{v,m,ct}] ==> [1],

        getRangeArrayTwo: function(range) {
            let data = $.extend(true, [], range);

            if (data.length == 1) {
                //一行
                for (let c = 0; c < data[0].length; c++) {
                    if (data[0][c] instanceof Object) {
                        if (data[0][c] != null && data[0][c] instanceof Object && !!data[0][c].m) {
                            data[0][c] = data[0][c].m;
                        } else {
                            if (data[0][c] != null && data[0][c] instanceof Object && !!data[0][c].v) {
                                data[0][c] = data[0][c].v;
                            } else {
                                data[0][c] = null;
                            }
                        }
                    }
                }
            } else if (data[0].length == 1) {
                //一列
                for (let r = 0; r < data.length; r++) {
                    if (data[r][0] instanceof Object) {
                        if (data[r][0] != null && data[r][0] instanceof Object && !!data[r][0].m) {
                            data[r][0] = data[r][0].m;
                        } else {
                            if (data[r][0] != null && data[r][0] instanceof Object && !!data[r][0].v) {
                                data[r][0] = data[r][0].v;
                            } else {
                                data[r][0] = null;
                            }
                        }
                    }
                }
            } else {
                for (let r = 0; r < data.length; r++) {
                    for (let c = 0; c < data[r].length; c++) {
                        if (data[r][c] instanceof Object) {
                            if (data[r][c] != null && data[r][c] instanceof Object && !!data[r][c].m) {
                                data[r][c] = data[r][c].m;
                            } else {
                                if (data[r][c] != null && data[r][c] instanceof Object && !!data[r][c].v) {
                                    data[r][c] = data[r][c].v;
                                } else {
                                    data[r][c] = null;
                                }
                            }
                        }
                    }
                }
            }

            return data;
        },

        getcellrange: function(txt, formulaIndex) {
            if (txt == null || txt.length == 0) {
                return;
            }

            let sheettxt = "",
                rangetxt = "",
                sheetIndex = null,
                sheetdata = null;

            let luckysheetfile = getluckysheetfile();

            if (txt.indexOf("!") > -1) {
                if (txt in this.cellTextToIndexList) {
                    return this.cellTextToIndexList[txt];
                }

                let val = txt.split("!");
                sheettxt = val[0];
                rangetxt = val[1];

                sheettxt = sheettxt.replace(/\\'/g, "'").replace(/''/g, "'");
                if (sheettxt.substr(0, 1) == "'" && sheettxt.substr(sheettxt.length - 1, 1) == "'") {
                    sheettxt = sheettxt.substring(1, sheettxt.length - 1);
                }
                for (let i in luckysheetfile) {
                    if (sheettxt == luckysheetfile[i].name) {
                        sheetIndex = luckysheetfile[i].index;
                        sheetdata = luckysheetfile[i].data;
                        break;
                    }
                }
            } else {
                let i = formulaIndex;
                if (i == null) {
                    i = Store.currentSheetIndex;
                }
                if (txt + "_" + i in this.cellTextToIndexList) {
                    return this.cellTextToIndexList[txt + "_" + i];
                }
                let index = getSheetIndex(i);
                sheettxt = luckysheetfile[index].name;
                sheetIndex = luckysheetfile[index].index;
                sheetdata = Store.flowdata;
                rangetxt = txt;
            }

            // fix =VLOOKUP(D9,数据透视表!A:D,2,0)
            if(sheetdata == null){
                return null
            }

            if (rangetxt.indexOf(":") == -1) {
                let row = parseInt(rangetxt.replace(/[^0-9]/g, "")) - 1;
                let col = ABCatNum(rangetxt.replace(/[^A-Za-z]/g, ""));

                if (!isNaN(row) && !isNaN(col)) {
                    let item = {
                        row: [row, row],
                        column: [col, col],
                        sheetIndex: sheetIndex,
                    };
                    this.addToCellIndexList(txt, item);
                    return item;
                } else {
                    return null;
                }
            } else {
                rangetxt = rangetxt.split(":");
                let row = [],
                    col = [];
                row[0] = parseInt(rangetxt[0].replace(/[^0-9]/g, "")) - 1;
                row[1] = parseInt(rangetxt[1].replace(/[^0-9]/g, "")) - 1;
                if (isNaN(row[0])) {
                    row[0] = 0;
                }
                if (isNaN(row[1])) {
                    row[1] = sheetdata.length - 1;
                }
                if (row[0] > row[1]) {
                    return null;
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
                    return null;
                }

                let item = {
                    row: row,
                    column: col,
                    sheetIndex: sheetIndex,
                };
                this.addToCellIndexList(txt, item);
                return item;
            }
        },

        iscellformat: function(txt) {
            let re_abc = /[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ][123456789]/;
        },

        iscelldata: function(txt) {
            //判断是否为单元格格式
            let val = txt.split("!"),
                rangetxt;

            if (val.length > 1) {
                // Supports cross-table references
                rangetxt = val[1];
            } else {
                rangetxt = val[0];
            }

            let reg_cell = /^(([a-zA-Z]+)|([$][a-zA-Z]+))(([0-9]+)|([$][0-9]+))$/g; //增加正则判断单元格为字母+数字的格式：如 A1:B3
            let reg_cellRange = /^(((([a-zA-Z]+)|([$][a-zA-Z]+))(([0-9]+)|([$][0-9]+)))|((([a-zA-Z]+)|([$][a-zA-Z]+))))$/g; //增加正则判断单元格为字母+数字或字母的格式：如 A1:B3，A:A

            if (rangetxt.indexOf(":") == -1) {
                let row = parseInt(rangetxt.replace(/[^0-9]/g, "")) - 1;
                let col = ABCatNum(rangetxt.replace(/[^A-Za-z]/g, ""));

                if (!isNaN(row) && !isNaN(col) && rangetxt.toString().match(reg_cell)) {
                    return true;
                } else if (!isNaN(row)) {
                    return false;
                } else if (!isNaN(col)) {
                    return false;
                } else {
                    return false;
                }
            } else {
                reg_cellRange = /^(((([a-zA-Z]+)|([$][a-zA-Z]+))(([0-9]+)|([$][0-9]+)))|((([a-zA-Z]+)|([$][a-zA-Z]+)))|((([0-9]+)|([$][0-9]+s))))$/g;

                rangetxt = rangetxt.split(":");

                let row = [],
                    col = [];
                row[0] = parseInt(rangetxt[0].replace(/[^0-9]/g, "")) - 1;
                row[1] = parseInt(rangetxt[1].replace(/[^0-9]/g, "")) - 1;
                if (row[0] > row[1]) {
                    return false;
                }

                col[0] = ABCatNum(rangetxt[0].replace(/[^A-Za-z]/g, ""));
                col[1] = ABCatNum(rangetxt[1].replace(/[^A-Za-z]/g, ""));
                if (col[0] > col[1]) {
                    return false;
                }

                if (rangetxt[0].toString().match(reg_cellRange) && rangetxt[1].toString().match(reg_cellRange)) {
                    return true;
                } else {
                    return false;
                }
            }
        }
};

export default cellRange;
