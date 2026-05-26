import { replaceHtml, getObjType, chatatABC, ABCatNum, luckysheetfontformat } from "../../utils/util";
import { getSheetIndex, getRangetxt, getluckysheetfile } from "../../methods/get";
import { setluckysheetfile } from "../../methods/set";
import { luckyColor } from "../../controllers/constant";
import sheetmanage from "../../controllers/sheetmanage";
import menuButton from "../../controllers/menuButton";
import luckysheetFreezen from "../../controllers/freezen";
import { seletedHighlistByindex, luckysheet_count_show } from "../../controllers/select";
import { isRealNum, isRealNull, valueIsError, isEditMode } from "../validate";
import { isdatetime, isdatatype } from "../datecontroll";
import { getCellTextSplitArr, getCellTextInfo } from "../getRowlen";
import { getcellvalue, getcellFormula, getInlineStringNoStyle, getOrigincell } from "../getdata";
import { setcellvalue } from "../setdata";
import { genarate, valueShowEs } from "../format";
import editor from "../editor";
import tooltip from "../tooltip";
import { rowLocation, colLocation, colLocationByIndex, mouseposition } from "../location";
import { luckysheetRangeLast } from "../cursorPos";
import { jfrefreshgrid } from "../refresh";
import { isInlineStringCell, convertSpanToShareString } from "../../controllers/inlineString";
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
import locale from "../../locale/locale";
import json from "../json";
import method from "../method";

const formulaString = {
        operator: "==|!=|<>|<=|>=|=|+|-|>|<|/|*|%|&|^",

        operatorjson: null,

        functionCopy: function(txt, mode, step) {
            let _this = this;

            if (_this.operatorjson == null) {
                let arr = _this.operator.split("|"),
                    op = {};

                for (let i = 0; i < arr.length; i++) {
                    op[arr[i].toString()] = 1;
                }

                _this.operatorjson = op;
            }

            if (mode == null) {
                mode = "down";
            }

            if (step == null) {
                step = 1;
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

            while (i < funcstack.length) {
                let s = funcstack[i];

                if (s == "(" && matchConfig.dquote == 0) {
                    matchConfig.bracket += 1;

                    if (str.length > 0) {
                        function_str += str + "(";
                    } else {
                        function_str += "(";
                    }

                    str = "";
                } else if (s == ")" && matchConfig.dquote == 0) {
                    matchConfig.bracket -= 1;
                    function_str += _this.functionCopy(str, mode, step) + ")";
                    str = "";
                } else if (s == '"' && matchConfig.squote == 0) {
                    if (matchConfig.dquote > 0) {
                        function_str += str + '"';
                        matchConfig.dquote -= 1;
                        str = "";
                    } else {
                        matchConfig.dquote += 1;
                        str += '"';
                    }
                } else if (s == "," && matchConfig.dquote == 0) {
                    function_str += _this.functionCopy(str, mode, step) + ",";
                    str = "";
                } else if (s == "&" && matchConfig.dquote == 0) {
                    if (str.length > 0) {
                        function_str += _this.functionCopy(str, mode, step) + "&";
                        str = "";
                    } else {
                        function_str += "&";
                    }
                } else if (s in _this.operatorjson && matchConfig.dquote == 0) {
                    let s_next = "";

                    if (i + 1 < funcstack.length) {
                        s_next = funcstack[i + 1];
                    }

                    let p = i - 1,
                        s_pre = null;

                    if (p >= 0) {
                        do {
                            s_pre = funcstack[p--];
                        } while (p >= 0 && s_pre == " ");
                    }

                    if (s + s_next in _this.operatorjson) {
                        if (str.length > 0) {
                            function_str += _this.functionCopy(str, mode, step) + s + s_next;
                            str = "";
                        } else {
                            function_str += s + s_next;
                        }

                        i++;
                    } else if (
                        !/[^0-9]/.test(s_next) &&
                        s == "-" &&
                        (s_pre == "(" || s_pre == null || s_pre == "," || s_pre == " " || s_pre in _this.operatorjson)
                    ) {
                        str += s;
                    } else {
                        if (str.length > 0) {
                            function_str += _this.functionCopy(str, mode, step) + s;
                            str = "";
                        } else {
                            function_str += s;
                        }
                    }
                } else {
                    str += s;
                }

                if (i == funcstack.length - 1) {
                    if (_this.iscelldata($.trim(str))) {
                        if (mode == "down") {
                            function_str += _this.downparam($.trim(str), step);
                        } else if (mode == "up") {
                            function_str += _this.upparam($.trim(str), step);
                        } else if (mode == "left") {
                            function_str += _this.leftparam($.trim(str), step);
                        } else if (mode == "right") {
                            function_str += _this.rightparam($.trim(str), step);
                        }
                    } else {
                        function_str += $.trim(str);
                    }
                }

                i++;
            }

            return function_str;
        },

        isfreezonFuc: function(txt) {
            let row = txt.replace(/[^0-9]/g, "");
            let col = txt.replace(/[^A-Za-z]/g, "");
            let row$ = txt.substr(txt.indexOf(row) - 1, 1);
            let col$ = txt.substr(txt.indexOf(col) - 1, 1);
            let ret = [false, false];

            if (row$ == "$") {
                ret[0] = true;
            }
            if (col$ == "$") {
                ret[1] = true;
            }

            return ret;
        },

        setfreezonFuceExe: function(rangetxt) {
            let row = parseInt(rangetxt.replace(/[^0-9]/g, ""));
            let col = ABCatNum(rangetxt.replace(/[^A-Za-z]/g, ""));
            let $row = "$",
                $col = "$";

            if (!isNaN(row) && !isNaN(col)) {
                return $col + chatatABC(col) + $row + row;
            } else if (!isNaN(row)) {
                return $row + row;
            } else if (!isNaN(col)) {
                return $col + chatatABC(col);
            } else {
                return rangetxt;
            }
        },

        setfreezonFuc: function(event) {
            let _this = this;

            let obj = _this.getrangeseleciton();
            if (!_this.iscelldata(obj.text())) {
                return;
            }

            let txt = obj.text(),
                pos = window.getSelection().anchorOffset;
            let val = txt.split("!"),
                rangetxt,
                prefix = "";

            if (val.length > 1) {
                rangetxt = val[1];
                prefix = val[0] + "!";
            } else {
                rangetxt = val[0];
            }

            let newtxt = "",
                newpos = "";
            let rangetxtIndex = rangetxt.indexOf(":");

            if (rangetxtIndex == -1) {
                newtxt = prefix + _this.setfreezonFuceExe(rangetxt);
                newpos = newtxt.length;
            } else {
                rangetxt = rangetxt.split(":");

                if (pos > rangetxtIndex) {
                    let ret = prefix + rangetxt[0] + ":" + _this.setfreezonFuceExe(rangetxt[1]);
                    newtxt = ret;
                    newpos = ret.length;
                } else {
                    let firsttxt = prefix + _this.setfreezonFuceExe(rangetxt[0]);
                    let ret = firsttxt + ":" + rangetxt[1];
                    newtxt = ret;
                    newpos = firsttxt.length;
                }
            }

            obj.text(prefix + newtxt);
            _this.setCaretPosition(obj.get(0), 0, newpos);
        },

        updateparam: function(orient, txt, step) {
            let _this = this;

            let val = txt.split("!"),
                rangetxt,
                prefix = "";

            if (val.length > 1) {
                rangetxt = val[1];
                prefix = val[0] + "!";
            } else {
                rangetxt = val[0];
            }

            if (rangetxt.indexOf(":") == -1) {
                let row = parseInt(rangetxt.replace(/[^0-9]/g, ""));
                let col = ABCatNum(rangetxt.replace(/[^A-Za-z]/g, ""));
                let freezonFuc = _this.isfreezonFuc(rangetxt);
                let $row = freezonFuc[0] ? "$" : "",
                    $col = freezonFuc[1] ? "$" : "";

                if (orient == "u" && !freezonFuc[0]) {
                    row -= step;
                } else if (orient == "r" && !freezonFuc[1]) {
                    col += step;
                } else if (orient == "l" && !freezonFuc[1]) {
                    col -= step;
                } else if (orient == "d" && !freezonFuc[0]) {
                    row += step;
                }

                if (row < 0 || col < 0) {
                    return _this.error.r;
                }

                if (!isNaN(row) && !isNaN(col)) {
                    return prefix + $col + chatatABC(col) + $row + row;
                } else if (!isNaN(row)) {
                    return prefix + $row + row;
                } else if (!isNaN(col)) {
                    return prefix + $col + chatatABC(col);
                } else {
                    return txt;
                }
            } else {
                rangetxt = rangetxt.split(":");
                let row = [],
                    col = [];

                row[0] = parseInt(rangetxt[0].replace(/[^0-9]/g, ""));
                row[1] = parseInt(rangetxt[1].replace(/[^0-9]/g, ""));
                if (row[0] > row[1]) {
                    return txt;
                }

                col[0] = ABCatNum(rangetxt[0].replace(/[^A-Za-z]/g, ""));
                col[1] = ABCatNum(rangetxt[1].replace(/[^A-Za-z]/g, ""));
                if (col[0] > col[1]) {
                    return txt;
                }

                let freezonFuc0 = _this.isfreezonFuc(rangetxt[0]);
                let freezonFuc1 = _this.isfreezonFuc(rangetxt[1]);
                let $row0 = freezonFuc0[0] ? "$" : "",
                    $col0 = freezonFuc0[1] ? "$" : "";
                let $row1 = freezonFuc1[0] ? "$" : "",
                    $col1 = freezonFuc1[1] ? "$" : "";

                if (orient == "u") {
                    if (!freezonFuc0[0]) {
                        row[0] -= step;
                    }

                    if (!freezonFuc1[0]) {
                        row[1] -= step;
                    }
                } else if (orient == "r") {
                    if (!freezonFuc0[1]) {
                        col[0] += step;
                    }

                    if (!freezonFuc1[1]) {
                        col[1] += step;
                    }
                } else if (orient == "l") {
                    if (!freezonFuc0[1]) {
                        col[0] -= step;
                    }

                    if (!freezonFuc1[1]) {
                        col[1] -= step;
                    }
                } else if (orient == "d") {
                    if (!freezonFuc0[0]) {
                        row[0] += step;
                    }

                    if (!freezonFuc1[0]) {
                        row[1] += step;
                    }
                }

                if (row[0] < 0 || col[0] < 0) {
                    return _this.error.r;
                }

                if (isNaN(col[0]) && isNaN(col[1])) {
                    return prefix + $row0 + row[0] + ":" + $row1 + row[1];
                } else if (isNaN(row[0]) && isNaN(row[1])) {
                    return prefix + $col0 + chatatABC(col[0]) + ":" + $col1 + chatatABC(col[1]);
                } else {
                    return (
                        prefix +
                        $col0 +
                        chatatABC(col[0]) +
                        $row0 +
                        row[0] +
                        ":" +
                        $col1 +
                        chatatABC(col[1]) +
                        $row1 +
                        row[1]
                    );
                }
            }
        },

        downparam: function(txt, step) {
            return this.updateparam("d", txt, step);
        },

        upparam: function(txt, step) {
            return this.updateparam("u", txt, step);
        },

        leftparam: function(txt, step) {
            return this.updateparam("l", txt, step);
        },

        rightparam: function(txt, step) {
            return this.updateparam("r", txt, step);
        },

        functionStrChange: function(txt, type, rc, orient, stindex, step) {
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
                bracket: 0, //括号
                comma: 0, //逗号
                squote: 0, //单引号
                dquote: 0, //双引号
            };

            while (i < funcstack.length) {
                let s = funcstack[i];

                if (s == "(" && matchConfig.dquote == 0) {
                    matchConfig.bracket += 1;

                    if (str.length > 0) {
                        function_str += str + "(";
                    } else {
                        function_str += "(";
                    }

                    str = "";
                } else if (s == ")" && matchConfig.dquote == 0) {
                    matchConfig.bracket -= 1;
                    function_str += _this.functionStrChange(str, type, rc, orient, stindex, step) + ")";
                    str = "";
                } else if (s == '"' && matchConfig.squote == 0) {
                    if (matchConfig.dquote > 0) {
                        function_str += str + '"';
                        matchConfig.dquote -= 1;
                        str = "";
                    } else {
                        matchConfig.dquote += 1;
                        str += '"';
                    }
                } else if (s == "," && matchConfig.dquote == 0) {
                    function_str += _this.functionStrChange(str, type, rc, orient, stindex, step) + ",";
                    str = "";
                } else if (s == "&" && matchConfig.dquote == 0) {
                    if (str.length > 0) {
                        function_str += _this.functionStrChange(str, type, rc, orient, stindex, step) + "&";
                        str = "";
                    } else {
                        function_str += "&";
                    }
                } else if (s in _this.operatorjson && matchConfig.dquote == 0) {
                    let s_next = "";

                    if (i + 1 < funcstack.length) {
                        s_next = funcstack[i + 1];
                    }

                    let p = i - 1,
                        s_pre = null;

                    if (p >= 0) {
                        do {
                            s_pre = funcstack[p--];
                        } while (p >= 0 && s_pre == " ");
                    }

                    if (s + s_next in _this.operatorjson) {
                        if (str.length > 0) {
                            function_str += _this.functionStrChange(str, type, rc, orient, stindex, step) + s + s_next;
                            str = "";
                        } else {
                            function_str += s + s_next;
                        }

                        i++;
                    } else if (
                        !/[^0-9]/.test(s_next) &&
                        s == "-" &&
                        (s_pre == "(" || s_pre == null || s_pre == "," || s_pre == " " || s_pre in _this.operatorjson)
                    ) {
                        str += s;
                    } else {
                        if (str.length > 0) {
                            function_str += _this.functionStrChange(str, type, rc, orient, stindex, step) + s;
                            str = "";
                        } else {
                            function_str += s;
                        }
                    }
                } else {
                    str += s;
                }

                if (i == funcstack.length - 1) {
                    if (!str.includes("!") && _this.iscelldata($.trim(str))) {
                        function_str += _this.functionStrChange_range($.trim(str), type, rc, orient, stindex, step);
                    } else {
                        function_str += $.trim(str);
                    }
                }

                i++;
            }

            return function_str;
        },

        functionStrChange_range: function(txt, type, rc, orient, stindex, step) {
            let _this = this;

            let val = txt.split("!"),
                rangetxt,
                prefix = "";

            if (val.length > 1) {
                rangetxt = val[1];
                prefix = val[0] + "!";
            } else {
                rangetxt = val[0];
            }

            let r1, r2, c1, c2;
            let $row0, $row1, $col0, $col1;

            if (rangetxt.indexOf(":") == -1) {
                r1 = r2 = parseInt(rangetxt.replace(/[^0-9]/g, "")) - 1;
                c1 = c2 = ABCatNum(rangetxt.replace(/[^A-Za-z]/g, ""));

                let freezonFuc = _this.isfreezonFuc(rangetxt);

                ($row0 = $row1 = freezonFuc[0] ? "$" : ""), ($col0 = $col1 = freezonFuc[1] ? "$" : "");
            } else {
                rangetxt = rangetxt.split(":");

                r1 = parseInt(rangetxt[0].replace(/[^0-9]/g, "")) - 1;
                r2 = parseInt(rangetxt[1].replace(/[^0-9]/g, "")) - 1;
                if (r1 > r2) {
                    return txt;
                }

                c1 = ABCatNum(rangetxt[0].replace(/[^A-Za-z]/g, ""));
                c2 = ABCatNum(rangetxt[1].replace(/[^A-Za-z]/g, ""));
                if (c1 > c2) {
                    return txt;
                }

                let freezonFuc0 = _this.isfreezonFuc(rangetxt[0]);
                $row0 = freezonFuc0[0] ? "$" : "";
                $col0 = freezonFuc0[1] ? "$" : "";

                let freezonFuc1 = _this.isfreezonFuc(rangetxt[1]);
                $row1 = freezonFuc1[0] ? "$" : "";
                $col1 = freezonFuc1[1] ? "$" : "";
            }

            if (type == "del") {
                if (rc == "row") {
                    if (r1 >= stindex && r2 <= stindex + step - 1) {
                        return _this.error.r;
                    }

                    if (r1 > stindex + step - 1) {
                        r1 -= step;
                    } else if (r1 >= stindex) {
                        r1 = stindex;
                    }

                    if (r2 > stindex + step - 1) {
                        r2 -= step;
                    } else if (r2 >= stindex) {
                        r2 = stindex - 1;
                    }

                    if (r1 < 0) {
                        r1 = 0;
                    }

                    if (r2 < r1) {
                        r2 = r1;
                    }
                } else if (rc == "col") {
                    if (c1 >= stindex && c2 <= stindex + step - 1) {
                        return _this.error.r;
                    }

                    if (c1 > stindex + step - 1) {
                        c1 -= step;
                    } else if (c1 >= stindex) {
                        c1 = stindex;
                    }

                    if (c2 > stindex + step - 1) {
                        c2 -= step;
                    } else if (c2 >= stindex) {
                        c2 = stindex - 1;
                    }

                    if (c1 < 0) {
                        c1 = 0;
                    }

                    if (c2 < c1) {
                        c2 = c1;
                    }
                }

                if (r1 == r2 && c1 == c2) {
                    if (!isNaN(r1) && !isNaN(c1)) {
                        return prefix + $col0 + chatatABC(c1) + $row0 + (r1 + 1);
                    } else if (!isNaN(r1)) {
                        return prefix + $row0 + (r1 + 1);
                    } else if (!isNaN(c1)) {
                        return prefix + $col0 + chatatABC(c1);
                    } else {
                        return txt;
                    }
                } else {
                    if (isNaN(c1) && isNaN(c2)) {
                        return prefix + $row0 + (r1 + 1) + ":" + $row1 + (r2 + 1);
                    } else if (isNaN(r1) && isNaN(r2)) {
                        return prefix + $col0 + chatatABC(c1) + ":" + $col1 + chatatABC(c2);
                    } else {
                        return (
                            prefix +
                            $col0 +
                            chatatABC(c1) +
                            $row0 +
                            (r1 + 1) +
                            ":" +
                            $col1 +
                            chatatABC(c2) +
                            $row1 +
                            (r2 + 1)
                        );
                    }
                }
            } else if (type == "add") {
                if (rc == "row") {
                    if (orient == "lefttop") {
                        if (r1 >= stindex) {
                            r1 += step;
                        }

                        if (r2 >= stindex) {
                            r2 += step;
                        }
                    } else if (orient == "rightbottom") {
                        if (r1 > stindex) {
                            r1 += step;
                        }

                        if (r2 > stindex) {
                            r2 += step;
                        }
                    }
                } else if (rc == "col") {
                    if (orient == "lefttop") {
                        if (c1 >= stindex) {
                            c1 += step;
                        }

                        if (c2 >= stindex) {
                            c2 += step;
                        }
                    } else if (orient == "rightbottom") {
                        if (c1 > stindex) {
                            c1 += step;
                        }

                        if (c2 > stindex) {
                            c2 += step;
                        }
                    }
                }

                if (r1 == r2 && c1 == c2) {
                    if (!isNaN(r1) && !isNaN(c1)) {
                        return prefix + $col0 + chatatABC(c1) + $row0 + (r1 + 1);
                    } else if (!isNaN(r1)) {
                        return prefix + $row0 + (r1 + 1);
                    } else if (!isNaN(c1)) {
                        return prefix + $col0 + chatatABC(c1);
                    } else {
                        return txt;
                    }
                } else {
                    if (isNaN(c1) && isNaN(c2)) {
                        return prefix + $row0 + (r1 + 1) + ":" + $row1 + (r2 + 1);
                    } else if (isNaN(r1) && isNaN(r2)) {
                        return prefix + $col0 + chatatABC(c1) + ":" + $col1 + chatatABC(c2);
                    } else {
                        return (
                            prefix +
                            $col0 +
                            chatatABC(c1) +
                            $row0 +
                            (r1 + 1) +
                            ":" +
                            $col1 +
                            chatatABC(c2) +
                            $row1 +
                            (r2 + 1)
                        );
                    }
                }
            }
        }
};

export default formulaString;
