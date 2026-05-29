import {  getluckysheetfile  } from "../../methods/get";
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

const dependency = {
        isFunctionRangeSave: false,

        isFunctionRangeSimple: function(txt, r, c, index, dynamicArray_compute) {
            if (txt == null || txt === null) {
                return;
            }

            let txtArray = txt.split(/==|!=|<>|<=|>=|[,()=+-\/*%&^><]/g);
            if (txtArray !== null) {
                for (let i = 0; i < txtArray.length; i++) {
                    let t = txtArray[i];
                    if (t.length <= 1) {
                        continue;
                    }

                    if (t.substr(0, 1) == '"' && t.substr(t.length - 1, 1) == '"') {
                        continue;
                    }

                    this.isFunctionRangeSaveChange(t, r, c, index, dynamicArray_compute);
                }
            }
        },

        isFunctionRangeSimple1: function(txt, r, c, index, dynamicArray_compute) {
            let _this = this;

            if (_this.operatorjson == null) {
                let arr = _this.operator.split("|"),
                    op = {};

                for (let i = 0; i < arr.length; i++) {
                    op[arr[i].toString()] = 1;
                }

                _this.operatorjson = op;
            }

            if (txt.substr(0, 1) == "=") {
                txt = txt.substr(1);
            }

            let funcstack = txt.split("");
            let i = 0,
                str = "",
                function_str = "",
                ispassby = true;

            let matchConfig = {
                bracket: 0,
                comma: 0,
                squote: 0,
                dquote: 0,
            };

            let luckysheetfile = getluckysheetfile();

            while (i < funcstack.length) {
                let s = funcstack[i];

                if (s == "(" && matchConfig.dquote == 0) {
                    matchConfig.bracket += 1;

                    if (str !== null) {
                        function_str += "luckysheet_function." + str.toUpperCase() + ".f(";
                    } else {
                        function_str += "(";
                    }

                    str = "";
                } else if (s == ")" && matchConfig.dquote == 0) {
                    matchConfig.bracket -= 1;
                    function_str += _this.isFunctionRangeSimple(str, r, c, index, dynamicArray_compute) + ")";
                    str = "";
                } else if (s == "," && matchConfig.dquote == 0) {
                    //matchConfig.comma += 1;
                    function_str += _this.isFunctionRangeSimple(str, r, c, index, dynamicArray_compute) + ",";
                    str = "";
                } else if (s in _this.operatorjson && matchConfig.dquote == 0) {
                    let s_next = "";

                    if (i + 1 < funcstack.length) {
                        s_next = funcstack[i + 1];
                    }

                    if (s + s_next in _this.operatorjson) {
                        if (str !== null) {
                            function_str +=
                                _this.isFunctionRangeSimple(str, r, c, index, dynamicArray_compute) + s + s_next;
                            str = "";
                        } else {
                            function_str += s + s_next;
                        }

                        i++;
                    } else {
                        if (str !== null) {
                            function_str += _this.isFunctionRangeSimple(str, r, c, index, dynamicArray_compute) + s;
                            str = "";
                        } else {
                            function_str += s;
                        }
                    }
                } else {
                    str += s;
                }

                if (i == funcstack.length - 1) {
                    if (_this.iscelldata(str.trim())) {
                        _this.isFunctionRangeSaveChange(str, r, c, index, dynamicArray_compute);
                        // if (r != null && c != null) {

                        //     let range = _this.getcellrange($.trim(str));
                        //     let row = range.row,
                        //         col = range.column;

                        //     if ((r + "_" + c) in dynamicArray_compute) {
                        //         let isd_range = false;

                        //         for (let d_r = row[0]; d_r <= row[1]; d_r++) {
                        //             for (let d_c = col[0]; d_c <= col[1]; d_c++) {
                        //                 if ((d_r + "_" + d_c) in dynamicArray_compute && dynamicArray_compute[d_r + "_" + d_c].r == r && dynamicArray_compute[d_r + "_" + d_c].c == c) {
                        //                     isd_range = true;
                        //                 }
                        //             }
                        //         }

                        //         if (isd_range) {
                        //             _this.isFunctionRangeSave = _this.isFunctionRangeSave || true;
                        //         }
                        //         else {
                        //             _this.isFunctionRangeSave = _this.isFunctionRangeSave || false;
                        //         }
                        //     }
                        //     else {
                        //         if (r >= row[0] && r <= row[1] && c >= col[0] && c <= col[1]) {
                        //             _this.isFunctionRangeSave = _this.isFunctionRangeSave || true;
                        //         }
                        //         else {
                        //             _this.isFunctionRangeSave = _this.isFunctionRangeSave || false;
                        //         }
                        //     }
                        // }
                        // else {
                        //     let sheetlen = $.trim(str).split("!");

                        //     if (sheetlen.length > 1) {
                        //         _this.isFunctionRangeSave = _this.isFunctionRangeSave || true;
                        //     }
                        //     else {
                        //         _this.isFunctionRangeSave = _this.isFunctionRangeSave || false;
                        //     }
                        // }
                    } else {
                        //console.log(str);
                    }
                }

                i++;
            }
            //console.log(function_str);
            return function_str;
        },

        isFunctionRangeSelect: function(txt, r, c, index, dynamicArray_compute) {
            if (txt == null || txt == "") {
                return;
            }

            if (index == null) {
                index = Store.currentSheetIndex;
            }
            if (dynamicArray_compute == null) {
                dynamicArray_compute = {};
            }
            let _this = this;
            let txt1 = txt.toUpperCase();
            let isOffsetFunc =
                txt1.indexOf("INDIRECT(") > -1 || txt1.indexOf("OFFSET(") > -1 || txt1.indexOf("INDEX(") > -1;
            if (txt in this.formulaContainCellList) {
                let cellList = this.formulaContainCellList[txt];
                if (isOffsetFunc) {
                    let isoff = cellList["__LuckyisOff__"];
                    if (isoff == true) {
                        for (let cellStr in cellList) {
                            if (cellStr == "__LuckyisOff__") {
                                continue;
                            }
                            this.isFunctionRangeSaveChange(cellStr, r, c, index, dynamicArray_compute);
                        }
                    } else {
                        this.isFunctionRange(txt, r, c, index, dynamicArray_compute, function(str) {
                            _this.addToCellList(txt, str);
                        });
                        cellList["__LuckyisOff__"] = true;
                    }
                } else {
                    for (let cellStr in cellList) {
                        if (cellStr == "__LuckyisOff__") {
                            continue;
                        }
                        this.isFunctionRangeSaveChange(cellStr, r, c, index, dynamicArray_compute);
                    }
                }

                return;
            }

            if (isOffsetFunc) {
                this.isFunctionRange(txt, r, c, index, dynamicArray_compute);
            } else {
                this.isFunctionRangeSimple(txt, r, c, index, dynamicArray_compute);
            }
        },

        isFunctionRange: function(txt, r, c, index, dynamicArray_compute, cellRangeFunction) {
            let _this = this;

            if (_this.operatorjson == null) {
                let arr = _this.operator.split("|"),
                    op = {};

                for (let i = 0; i < arr.length; i++) {
                    op[arr[i].toString()] = 1;
                }

                _this.operatorjson = op;
            }

            if (txt.substr(0, 1) == "=") {
                txt = txt.substr(1);
            }

            let funcstack = txt.split("");
            let i = 0,
                str = "",
                function_str = "",
                ispassby = true;

            let matchConfig = {
                bracket: 0,
                comma: 0,
                squote: 0,
                dquote: 0,
                compare: 0,
                braces: 0,
            };

            // let luckysheetfile = getluckysheetfile();
            // let dynamicArray_compute = luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["dynamicArray_compute"] == null ? {} : luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["dynamicArray_compute"];

            //bracket 0为运算符括号、1为函数括号
            let cal1 = [],
                cal2 = [],
                bracket = [];
            let firstSQ = -1;
            while (i < funcstack.length) {
                let s = funcstack[i];

                if (s == "(" && matchConfig.squote == 0 && matchConfig.dquote == 0 && matchConfig.braces == 0) {
                    if (str !== null && bracket === null) {
                        str = str.toUpperCase();
                        if (str.indexOf(":") > -1) {
                            let funcArray = str.split(":");
                            function_str +=
                                "luckysheet_getSpecialReference(true,'" +
                                funcArray[0].trim().replace(/'/g, "\\'") +
                                "', luckysheet_function." +
                                funcArray[1] +
                                ".f(#lucky#";
                        } else {
                            function_str += "luckysheet_function." + str + ".f(";
                        }
                        bracket.push(1);
                        str = "";
                    } else if (bracket === null) {
                        function_str += "(";
                        bracket.push(0);
                        str = "";
                    } else {
                        bracket.push(0);
                        str += s;
                    }
                } else if (s == ")" && matchConfig.squote == 0 && matchConfig.dquote == 0 && matchConfig.braces == 0) {
                    let bt = bracket.pop();

                    if (bracket === null) {
                        // function_str += _this.isFunctionRange(str,r,c, index,dynamicArray_compute,cellRangeFunction) + ")";
                        // str = "";

                        let functionS = _this.isFunctionRange(str, r, c, index, dynamicArray_compute, cellRangeFunction);
                        if (functionS.indexOf("#lucky#") > -1) {
                            functionS = functionS.replace(/#lucky#/g, "") + ")";
                        }
                        function_str += functionS + ")";
                        str = "";
                    } else {
                        str += s;
                    }
                } else if (s == "{" && matchConfig.squote == 0 && matchConfig.dquote == 0) {
                    str += "{";
                    matchConfig.braces += 1;
                } else if (s == "}" && matchConfig.squote == 0 && matchConfig.dquote == 0) {
                    str += "}";
                    matchConfig.braces -= 1;
                } else if (s == '"' && matchConfig.squote == 0) {
                    if (matchConfig.dquote > 0) {
                        //如果是""代表着输出"
                        if (i < funcstack.length - 1 && funcstack[i + 1] == '"') {
                            i++;
                            str += "\x7F"; //用DEL替换一下""
                        } else {
                            matchConfig.dquote -= 1;
                            str += '"';
                        }
                    } else {
                        matchConfig.dquote += 1;
                        str += '"';
                    }
                } else if (s == "'" && matchConfig.dquote == 0) {
                    str += "'";

                    if (matchConfig.squote > 0) {
                        //if (firstSQ == i - 1)//配对的单引号后第一个字符不能是单引号
                        //{
                        //    代码到了此处应该是公式错误
                        //}
                        //如果是''代表着输出'
                        if (i < funcstack.length - 1 && funcstack[i + 1] == "'") {
                            i++;
                            str += "'";
                        } else {
                            //如果下一个字符不是'代表单引号结束
                            //if (funcstack[i - 1] == "'") {//配对的单引号后最后一个字符不能是单引号
                            //    代码到了此处应该是公式错误
                            //} else {
                            matchConfig.squote -= 1;
                            //}
                        }
                    } else {
                        matchConfig.squote += 1;
                        firstSQ = i;
                    }
                } else if (s == "," && matchConfig.squote == 0 && matchConfig.dquote == 0 && matchConfig.braces == 0) {
                    if (bracket.length <= 1) {
                        // function_str += _this.isFunctionRange(str, r, c, index,dynamicArray_compute,cellRangeFunction) + ",";
                        // str = "";

                        let functionS = _this.isFunctionRange(str, r, c, index, dynamicArray_compute, cellRangeFunction);
                        if (functionS.indexOf("#lucky#") > -1) {
                            functionS = functionS.replace(/#lucky#/g, "") + ")";
                        }
                        function_str += functionS + ",";
                        str = "";
                    } else {
                        str += ",";
                    }
                } else if (
                    s in _this.operatorjson &&
                    matchConfig.squote == 0 &&
                    matchConfig.dquote == 0 &&
                    matchConfig.braces == 0
                ) {
                    let s_next = "";
                    let op = _this.operatorPriority;

                    if (i + 1 < funcstack.length) {
                        s_next = funcstack[i + 1];
                    }

                    if (s + s_next in _this.operatorjson) {
                        if (bracket === null) {
                            if (str.trim() !== null) {
                                cal2.unshift(
                                    _this.isFunctionRange(
                                        str.trim(),
                                        r,
                                        c,
                                        index,
                                        dynamicArray_compute,
                                        cellRangeFunction,
                                    ),
                                );
                            } else if (function_str.trim() !== null) {
                                cal2.unshift(function_str.trim());
                            }

                            if (cal1[0] in _this.operatorjson) {
                                let stackCeilPri = op[cal1[0]];

                                while (cal1 !== null && stackCeilPri != null) {
                                    cal2.unshift(cal1.shift());
                                    stackCeilPri = op[cal1[0]];
                                }
                            }

                            cal1.unshift(s + s_next);

                            function_str = "";
                            str = "";
                        } else {
                            str += s + s_next;
                        }

                        i++;
                    } else {
                        if (bracket === null) {
                            if (str.trim() !== null) {
                                cal2.unshift(
                                    _this.isFunctionRange(
                                        str.trim(),
                                        r,
                                        c,
                                        index,
                                        dynamicArray_compute,
                                        cellRangeFunction,
                                    ),
                                );
                            } else if (function_str.trim() !== null) {
                                cal2.unshift(function_str.trim());
                            }

                            if (cal1[0] in _this.operatorjson) {
                                let stackCeilPri = op[cal1[0]];
                                stackCeilPri = stackCeilPri == null ? 1000 : stackCeilPri;

                                let sPri = op[s];
                                sPri = sPri == null ? 1000 : sPri;

                                while (cal1 !== null && sPri >= stackCeilPri) {
                                    cal2.unshift(cal1.shift());

                                    stackCeilPri = op[cal1[0]];
                                    stackCeilPri = stackCeilPri == null ? 1000 : stackCeilPri;
                                }
                            }

                            cal1.unshift(s);

                            function_str = "";
                            str = "";
                        } else {
                            str += s;
                        }
                    }
                } else {
                    if (matchConfig.dquote == 0 && matchConfig.squote == 0) {
                        str += s.trim();
                    } else {
                        str += s;
                    }
                }

                if (i == funcstack.length - 1) {
                    let endstr = "";
                    let str_nb = str.trim().replace(/'/g, "\\'");
                    if (_this.iscelldata(str_nb) && str_nb.substr(0, 1) != ":") {
                        // endstr = "luckysheet_getcelldata('" + $.trim(str) + "')";
                        endstr = "luckysheet_getcelldata('" + str_nb + "')";
                        _this.isFunctionRangeSaveChange(str, r, c, index, dynamicArray_compute);
                    } else if (str_nb.substr(0, 1) == ":") {
                        str_nb = str_nb.substr(1);
                        if (_this.iscelldata(str_nb)) {
                            endstr = "luckysheet_getSpecialReference(false," + function_str + ",'" + str_nb + "')";
                        }
                    } else {
                        str = str.trim();

                        let regx = /{.*?}/;
                        if (regx.test(str) && str.substr(0, 1) != '"' && str.substr(str.length - 1, 1) != '"') {
                            let arraytxt = regx.exec(str)[0];
                            let arraystart = str.search(regx);
                            let alltxt = "";

                            if (arraystart > 0) {
                                endstr += str.substr(0, arraystart);
                            }

                            endstr += "luckysheet_getarraydata('" + arraytxt + "')";

                            if (arraystart + arraytxt.length < str.length) {
                                endstr += str.substr(arraystart + arraytxt.length, str.length);
                            }
                        } else {
                            endstr = str;
                        }
                    }

                    if (endstr !== null) {
                        cal2.unshift(endstr);
                    }

                    if (cal1 !== null) {
                        if (function_str !== null) {
                            cal2.unshift(function_str);
                            function_str = "";
                        }

                        while (cal1 !== null) {
                            cal2.unshift(cal1.shift());
                        }
                    }

                    if (cal2 !== null) {
                        function_str = _this.calPostfixExpression(cal2);
                    } else {
                        function_str += endstr;
                    }
                }

                i++;
            }
            // console.log(function_str);
            _this.checkSpecialFunctionRange(function_str, r, c, index, dynamicArray_compute, cellRangeFunction);
            return function_str;
        },

        isFunctionRangeSaveChange: function(str, r, c, index, dynamicArray_compute) {
            let _this = this;
            if (r != null && c != null) {
                let range = _this.getcellrange((str || '').trim(), index);
                if (range == null) {
                    return;
                }
                let row = range.row,
                    col = range.column,
                    sheetIndex = range.sheetIndex;

                if (r + "_" + c in dynamicArray_compute && (index == sheetIndex || index == null)) {
                    let isd_range = false;

                    for (let d_r = row[0]; d_r <= row[1]; d_r++) {
                        for (let d_c = col[0]; d_c <= col[1]; d_c++) {
                            if (
                                d_r + "_" + d_c in dynamicArray_compute &&
                                dynamicArray_compute[d_r + "_" + d_c].r == r &&
                                dynamicArray_compute[d_r + "_" + d_c].c == c
                            ) {
                                isd_range = true;
                            }
                        }
                    }

                    if (isd_range) {
                        _this.isFunctionRangeSave = _this.isFunctionRangeSave || true;
                    } else {
                        _this.isFunctionRangeSave = _this.isFunctionRangeSave || false;
                    }
                } else {
                    if (
                        r >= row[0] &&
                        r <= row[1] &&
                        c >= col[0] &&
                        c <= col[1] &&
                        (index == sheetIndex || index == null)
                    ) {
                        _this.isFunctionRangeSave = _this.isFunctionRangeSave || true;
                    } else {
                        _this.isFunctionRangeSave = _this.isFunctionRangeSave || false;
                    }
                }
            } else {
                _this.isFunctionRangeSave = _this.isFunctionRangeSave || false;
                // let sheetlen = $.trim(str).split("!");

                // if (sheetlen.length > 1) {
                //     _this.isFunctionRangeSave = _this.isFunctionRangeSave || true;//if change sheet, it must be true, but this is very slow
                // }
                // else {
                //     _this.isFunctionRangeSave = _this.isFunctionRangeSave || false;
                // }
            }
        },

        checkSpecialFunctionRange: function(function_str, r, c, index, dynamicArray_compute, cellRangeFunction) {
            if (
                function_str.substr(0, 30) == "luckysheet_getSpecialReference" ||
                function_str.substr(0, 20) == "luckysheet_function."
            ) {
                if (function_str.substr(0, 20) == "luckysheet_function.") {
                    let funcName = function_str.split(".")[1];
                    if (funcName != null) {
                        funcName = funcName.toUpperCase();
                        if (funcName != "INDIRECT" && funcName != "OFFSET" && funcName != "INDEX") {
                            return;
                        }
                    }
                }
                try {
                    Store.calculateSheetIndex = index;
                    let str = new Function("return " + function_str)();

                    if (str instanceof Object && str.startCell != null) {
                        str = str.startCell;
                    }
                    let str_nb = (str || '').trim();
                    // console.log(function_str, tempFunc,str, this.iscelldata(str_nb),this.isFunctionRangeSave,r,c);
                    if (this.iscelldata(str_nb)) {
                        if (typeof cellRangeFunction == "function") {
                            cellRangeFunction(str_nb);
                        }
                        // this.isFunctionRangeSaveChange(str, r, c, index, dynamicArray_compute);
                        // console.log(function_str, str, this.isFunctionRangeSave,r,c);
                    }
                } catch {}
            }

            // if (function_str.substr(0, 20) == "luckysheet_function.") {
            //     let funcName = function_str.split(".")[1];
            //     if (funcName != null) {
            //         funcName = funcName.toUpperCase();
            //         if (funcName == "INDIRECT") {
            //             let tempFunc = "luckysheet_indirect_check" + function_str.substr(30, function_str.length);

            //             //tempFunc = tempFunc.replace(/luckysheet_getcelldata/g, "luckysheet_indirect_check_return");

            //             try {
            //                 Store.calculateSheetIndex = index;
            //                 let str = eval(tempFunc);

            //                 if(str instanceof Object && str.data!=null){
            //                     str = str.data.v;
            //                 }
            //                 let str_nb = $.trim(str);
            //                 // console.log(function_str, tempFunc,str, this.iscelldata(str_nb),this.isFunctionRangeSave,r,c);
            //                 if (this.iscelldata(str_nb)) {
            //                     if(typeof(cellRangeFunction)=="function"){
            //                         cellRangeFunction(str_nb);
            //                     }
            //                     this.isFunctionRangeSaveChange(str, r, c, index, dynamicArray_compute);
            //                     // console.log(function_str, str, this.isFunctionRangeSave,r,c);
            //                 }
            //             }
            //             catch{

            //             }

            //         }
            //         else if (funcName == "OFFSET") {
            //             let tempFunc = "luckysheet_offset_check" + function_str.substr(28, function_str.length);

            //             try {
            //                 Store.calculateSheetIndex = index;
            //                 let str = eval(tempFunc);
            //                 if(str instanceof Object && str.data!=null){
            //                     str = str.data.v;
            //                 }
            //                 let str_nb = $.trim(str);
            //                 if (this.iscelldata(str_nb)) {
            //                     if(typeof(cellRangeFunction)=="function"){
            //                         cellRangeFunction(str_nb);
            //                     }
            //                     this.isFunctionRangeSaveChange(str, r, c, index,dynamicArray_compute);
            //                     //console.log(function_str, str, this.isFunctionRangeSave,r,c);
            //                 }
            //             }
            //             catch{

            //             }
            //             //let result = eval(function_str);

            //             //console.log(function_str, result);
            //         }
            //     }

            // }
        },

        execvertex: {},

        execFunctionGroupData: null,

        execFunctionExist: null,

        formulaContainSheetList: {},

        formulaContainCellList: {},

        cellTextToIndexList: {},

        addToCellList: function(formulaTxt, cellstring) {
            if (formulaTxt == null || formulaTxt === null || cellstring == null || cellstring === null) {
                return;
            }
            if (this.formulaContainCellList == null) {
                this.formulaContainCellList = {};
            }

            // formulaTxt = formulaTxt.toUpperCase();
            if (this.formulaContainCellList[formulaTxt] == null) {
                this.formulaContainCellList[formulaTxt] = {};
            }

            this.formulaContainCellList[formulaTxt][cellstring] = 1;
        },

        addToCellIndexList: function(txt, infoObj) {
            if (txt == null || txt === null || infoObj == null) {
                return;
            }
            if (this.cellTextToIndexList == null) {
                this.cellTextToIndexList = {};
            }

            if (txt.indexOf("!") > -1) {
                txt = txt.replace(/\\'/g, "'").replace(/''/g, "'");
                this.cellTextToIndexList[txt] = infoObj;
            } else {
                this.cellTextToIndexList[txt + "_" + infoObj.sheetIndex] = infoObj;
            }

            // console.log(this.cellTextToIndexList);
        },

        addToSheetIndexList: function(formulaTxt, sheetIndex, obIndex) {
            if (formulaTxt == null || formulaTxt === null) {
                return;
            }

            if (sheetIndex == null || sheetIndex === null) {
                sheetIndex = Store.currentSheetIndex;
            }

            if (obIndex == null || obIndex === null) {
                obIndex = "";
            }

            if (this.formulaContainSheetList == null) {
                this.formulaContainSheetList = {};
            }

            if (this.formulaContainSheetList[formulaTxt] == null) {
                this.formulaContainSheetList[formulaTxt] = {};
            }

            this.formulaContainSheetList[formulaTxt][sheetIndex] = obIndex;
        }
};

export default dependency;
