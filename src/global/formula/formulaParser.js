import { luckyColor } from "../../controllers/constant";
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

const formulaParser = {
        functionHTMLGenerate: function(txt) {
            let _this = this;

            if (txt.length == 0 || txt.substr(0, 1) != "=") {
                return txt;
            }

            _this.functionHTMLIndex = 0;

            return '<span dir="auto" class="luckysheet-formula-text-color">=</span>' + _this.functionHTML(txt);
        },

        functionHTML: function(txt) {
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
                braces: 0,
            };

            while (i < funcstack.length) {
                let s = funcstack[i];

                if (s == "(" && matchConfig.squote == 0 && matchConfig.dquote == 0 && matchConfig.braces == 0) {
                    matchConfig.bracket += 1;

                    if (str.length > 0) {
                        function_str +=
                            '<span dir="auto" class="luckysheet-formula-text-func">' +
                            str +
                            '</span><span dir="auto" class="luckysheet-formula-text-lpar">(</span>';
                    } else {
                        function_str += '<span dir="auto" class="luckysheet-formula-text-lpar">(</span>';
                    }

                    str = "";
                } else if (s == ")" && matchConfig.squote == 0 && matchConfig.dquote == 0 && matchConfig.braces == 0) {
                    matchConfig.bracket -= 1;
                    function_str +=
                        _this.functionHTML(str) + '<span dir="auto" class="luckysheet-formula-text-rpar">)</span>';
                    str = "";
                } else if (s == "{" && matchConfig.squote == 0 && matchConfig.dquote == 0) {
                    str += "{";
                    matchConfig.braces += 1;
                } else if (s == "}" && matchConfig.squote == 0 && matchConfig.dquote == 0) {
                    str += "}";
                    matchConfig.braces -= 1;
                } else if (s == '"' && matchConfig.squote == 0) {
                    if (matchConfig.dquote > 0) {
                        if (str.length > 0) {
                            function_str += str + '"</span>';
                        } else {
                            function_str += '"</span>';
                        }

                        matchConfig.dquote -= 1;
                        str = "";
                    } else {
                        matchConfig.dquote += 1;

                        if (str.length > 0) {
                            function_str +=
                                _this.functionHTML(str) + '<span dir="auto" class="luckysheet-formula-text-string">"';
                        } else {
                            function_str += '<span dir="auto" class="luckysheet-formula-text-string">"';
                        }

                        str = "";
                    }
                }
                //修正例如输入公式='1-2'!A1时，只有2'!A1是luckysheet-formula-functionrange-cell色，'1-是黑色的问题。
                else if (s == "'" && matchConfig.dquote == 0) {
                    str += "'";
                    matchConfig.squote = matchConfig.squote == 0 ? 1 : 0;
                } else if (s == "," && matchConfig.squote == 0 && matchConfig.dquote == 0 && matchConfig.braces == 0) {
                    //matchConfig.comma += 1;
                    function_str +=
                        _this.functionHTML(str) + '<span dir="auto" class="luckysheet-formula-text-comma">,</span>';
                    str = "";
                } else if (s == "&" && matchConfig.squote == 0 && matchConfig.dquote == 0 && matchConfig.braces == 0) {
                    if (str.length > 0) {
                        function_str +=
                            _this.functionHTML(str) +
                            '<span dir="auto" class="luckysheet-formula-text-calc">' +
                            "&" +
                            "</span>";
                        str = "";
                    } else {
                        function_str += '<span dir="auto" class="luckysheet-formula-text-calc">' + "&" + "</span>";
                    }
                } else if (
                    s in _this.operatorjson &&
                    matchConfig.squote == 0 &&
                    matchConfig.dquote == 0 &&
                    matchConfig.braces == 0
                ) {
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
                            function_str +=
                                _this.functionHTML(str) +
                                '<span dir="auto" class="luckysheet-formula-text-calc">' +
                                s +
                                s_next +
                                "</span>";
                            str = "";
                        } else {
                            function_str +=
                                '<span dir="auto" class="luckysheet-formula-text-calc">' + s + s_next + "</span>";
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
                            function_str +=
                                _this.functionHTML(str) +
                                '<span dir="auto" class="luckysheet-formula-text-calc">' +
                                s +
                                "</span>";
                            str = "";
                        } else {
                            function_str += '<span dir="auto" class="luckysheet-formula-text-calc">' + s + "</span>";
                        }
                    }
                } else {
                    str += s;
                }

                if (i == funcstack.length - 1) {
                    //function_str += str;
                    if (_this.iscelldata(str.trim())) {
                        function_str +=
                            '<span class="luckysheet-formula-functionrange-cell" rangeindex="' +
                            _this.functionHTMLIndex +
                            '" dir="auto" style="color:' +
                            luckyColor[_this.functionHTMLIndex] +
                            ';">' +
                            str +
                            "</span>";
                        _this.functionHTMLIndex++;
                    } else if (matchConfig.dquote > 0) {
                        function_str += str + "</span>";
                    } else if (str.indexOf("</span>") == -1 && str.length > 0) {
                        let regx = /{.*?}/;

                        if (regx.test(str.trim())) {
                            let arraytxt = regx.exec(str)[0];
                            let arraystart = str.search(regx);
                            let alltxt = "";

                            if (arraystart > 0) {
                                alltxt +=
                                    '<span dir="auto" class="luckysheet-formula-text-color">' +
                                    str.substr(0, arraystart) +
                                    "</span>";
                            }

                            alltxt +=
                                '<span dir="auto" style="color:#959a05" class="luckysheet-formula-text-array">' +
                                arraytxt +
                                "</span>";

                            if (arraystart + arraytxt.length < str.length) {
                                alltxt +=
                                    '<span dir="auto" class="luckysheet-formula-text-color">' +
                                    str.substr(arraystart + arraytxt.length, str.length) +
                                    "</span>";
                            }

                            function_str += alltxt;
                        } else {
                            function_str += '<span dir="auto" class="luckysheet-formula-text-color">' + str + "</span>";
                        }
                    }
                }

                i++;
            }

            return function_str;
        },

        getfunctionParam: function(txt) {
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
                function_str = "";
            let matchConfig = {
                bracket: 0,
                comma: 0,
                squote: 0,
                dquote: 0,
                compare: 0,
            };

            //bracket 0为运算符括号、1为函数括号
            let fn = null,
                param = [],
                bracket = [];

            while (i < funcstack.length) {
                let s = funcstack[i];

                if (s == "(" && matchConfig.dquote == 0) {
                    if (str.length > 0 && bracket.length == 0) {
                        fn = str.toUpperCase();
                        bracket.push(1);
                        str = "";
                    } else if (bracket.length == 0) {
                        //function_str += "(";
                        bracket.push(0);
                        str = "";
                    } else {
                        bracket.push(0);
                        str += s;
                    }
                } else if (s == ")" && matchConfig.dquote == 0) {
                    let bt = bracket.pop();

                    if (bracket.length == 0) {
                        param.push(str);
                        str = "";
                    } else {
                        str += s;
                    }
                } else if (s == '"') {
                    str += '"';

                    if (matchConfig.dquote > 0) {
                        matchConfig.dquote -= 1;
                        str = "";
                    } else {
                        matchConfig.dquote += 1;
                    }
                } else if (s == "," && matchConfig.dquote == 0) {
                    if (bracket.length <= 1) {
                        param.push(str);
                        str = "";
                    } else {
                        str += ",";
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

                    if (
                        !/[^0-9]/.test(s_next) &&
                        s == "-" &&
                        (s_pre == "(" || s_pre == null || s_pre == "," || s_pre == " " || s_pre in _this.operatorjson)
                    ) {
                        if (matchConfig.dquote == 0) {
                            str += s.trim();
                        } else {
                            str += s;
                        }
                    } else {
                        function_str = "";
                        str = "";
                    }
                } else {
                    if (matchConfig.dquote == 0) {
                        str += s.trim();
                    } else {
                        str += s;
                    }
                }

                i++;
            }

            return { fn: fn, param: param };
        },

        calPostfixExpression: function(cal) {
            if (cal.length == 0) {
                return "";
            }

            let stack = [];
            for (let i = cal.length - 1; i >= 0; i--) {
                let c = cal[i];
                if (c in this.operatorjson) {
                    let s2 = stack.pop();
                    let s1 = stack.pop();

                    let str = "luckysheet_compareWith(" + s1 + ",'" + c + "', " + s2 + ")";

                    stack.push(str);
                } else {
                    stack.push(c);
                }
            }

            if (stack.length > 0) {
                return stack[0];
            } else {
                return "";
            }
        },

        checkBracketNum: function(fp) {
            let bra_l = fp.match(/\(/g),
                bra_r = fp.match(/\)/g),
                bra_tl_txt = fp.match(/(['"])(?:(?!\1).)*?\1/g),
                bra_tr_txt = fp.match(/(['"])(?:(?!\1).)*?\1/g);

            let bra_l_len = 0,
                bra_r_len = 0;
            if (bra_l != null) {
                bra_l_len += bra_l.length;
            }
            if (bra_r != null) {
                bra_r_len += bra_r.length;
            }

            let bra_tl_len = 0,
                bra_tr_len = 0;
            if (bra_tl_txt != null) {
                for (let i = 0; i < bra_tl_txt.length; i++) {
                    let bra_tl = bra_tl_txt[i].match(/\(/g);
                    if (bra_tl != null) {
                        bra_tl_len += bra_tl.length;
                    }
                }
            }

            if (bra_tr_txt != null) {
                for (let i = 0; i < bra_tr_txt.length; i++) {
                    let bra_tr = bra_tr_txt[i].match(/\)/g);
                    if (bra_tr != null) {
                        bra_tr_len += bra_tr.length;
                    }
                }
            }

            bra_l_len -= bra_tl_len;
            bra_r_len -= bra_tr_len;

            if (bra_l_len != bra_r_len) {
                return false;
            } else {
                return true;
            }
        },

        operatorPriority: {
            "^": 0,
            "%": 1,
            "*": 1,
            "/": 1,
            "+": 2,
            "-": 2,
        },

        functionParserExe: function(txt) {
            let _this = this;
            // let txt1 = txt.toUpperCase();
            // return this.functionParser(txt, function(c){
            //     _this.addToCellList(txt, c);
            // });
            return this.functionParser(txt);
        },

        functionParser: function(txt, cellRangeFunction) {
            let _this = this;

            if (_this.operatorjson == null) {
                let arr = _this.operator.split("|"),
                    op = {};

                for (let i = 0; i < arr.length; i++) {
                    op[arr[i].toString()] = 1;
                }

                _this.operatorjson = op;
            }

            if (txt == null) {
                return "";
            }

            if (txt.substr(0, 2) == "=+") {
                txt = txt.substr(2);
            } else if (txt.substr(0, 1) == "=") {
                txt = txt.substr(1);
            }

            let funcstack = txt.split("");
            let i = 0,
                str = "",
                function_str = "";

            let matchConfig = {
                bracket: 0,
                comma: 0,
                squote: 0,
                dquote: 0,
                compare: 0,
                braces: 0,
            };

            //=(sum(b1:c10)+10)*5-100

            //=MAX(B1:C10,10)*5-100

            // =(sum(max(B1:C10,10)*5-100,((1+1)*2+5)/2,10)+count(B1:C10,10*5-100))*5-100

            //=SUM(MAX(B1:C10,10)*5-100,((1+1)*2+5)/2,10)+COUNT(B1:C10,10*5-100)

            //=SUM(MAX(B1:C10,10)*5-100,((1+1)*2+5)/2,10)

            //=SUM(10,((1+1)*2+5)/2,10)

            //=SUM(MAX(B1:C10,10)*5-100)

            //=IFERROR(IF(ROW()-ROW($G$3)=1,$F4+$D4,SUM($D1:INDEX($D$4:$D$9,1,1),$F1:INDEX($F$4:$F$9,1,1))), "")

            //=IFERROR(IF(ROW()-ROW($G$3)=1,$F4+$D4,SUM(INDEX($D$4:$D$9,1,1):$D4,INDEX($F$4:$F$9,1,1):$F4)), "")

            //=SUM(I$4:OFFSET(I10,0,0))

            //bracket 0为运算符括号、1为函数括号
            let cal1 = [],
                cal2 = [],
                bracket = [];
            let firstSQ = -1;
            while (i < funcstack.length) {
                let s = funcstack[i];

                if (s == "(" && matchConfig.squote == 0 && matchConfig.dquote == 0 && matchConfig.braces == 0) {
                    if (str.length > 0 && bracket.length == 0) {
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
                    } else if (bracket.length == 0) {
                        function_str += "(";
                        bracket.push(0);
                        str = "";
                    } else {
                        bracket.push(0);
                        str += s;
                    }
                } else if (s == ")" && matchConfig.squote == 0 && matchConfig.dquote == 0 && matchConfig.braces == 0) {
                    let bt = bracket.pop();

                    if (bracket.length == 0) {
                        let functionS = _this.functionParser(str, cellRangeFunction);
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
                            str += "\x7F"; //用非打印控制字符DEL替换一下""
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
                        if (firstSQ == i - 1) {
                            //配对的单引号后第一个字符不能是单引号
                            return "";
                        }
                        //如果是''代表着输出'
                        if (i < funcstack.length - 1 && funcstack[i + 1] == "'") {
                            i++;
                            str += "'";
                        } else {
                            //如果下一个字符不是'代表单引号结束
                            if (funcstack[i - 1] == "'") {
                                //配对的单引号后最后一个字符不能是单引号
                                return "";
                            } else {
                                matchConfig.squote -= 1;
                            }
                        }
                    } else {
                        matchConfig.squote += 1;
                        firstSQ = i;
                    }
                } else if (s == "," && matchConfig.squote == 0 && matchConfig.dquote == 0 && matchConfig.braces == 0) {
                    if (bracket.length <= 1) {
                        let functionS = _this.functionParser(str, cellRangeFunction);
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
                        if (bracket.length == 0) {
                            if (str.trim().length > 0) {
                                cal2.unshift(_this.functionParser(str.trim(), cellRangeFunction));
                            } else if (function_str.trim().length > 0) {
                                cal2.unshift(function_str.trim());
                            }

                            if (cal1[0] in _this.operatorjson) {
                                let stackCeilPri = op[cal1[0]];

                                while (cal1.length > 0 && stackCeilPri != null) {
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
                        if (bracket.length == 0) {
                            if (str.trim().length > 0) {
                                cal2.unshift(_this.functionParser(str.trim(), cellRangeFunction));
                            } else if (function_str.trim().length > 0) {
                                cal2.unshift(function_str.trim());
                            }

                            if (cal1[0] in _this.operatorjson) {
                                let stackCeilPri = op[cal1[0]];
                                stackCeilPri = stackCeilPri == null ? 1000 : stackCeilPri;

                                let sPri = op[s];
                                sPri = sPri == null ? 1000 : sPri;

                                while (cal1.length > 0 && sPri >= stackCeilPri) {
                                    cal2.unshift(cal1.shift());

                                    stackCeilPri = op[cal1[0]];
                                    stackCeilPri = stackCeilPri == null ? 1000 : stackCeilPri;
                                }
                            }

                            // 修复类似=1--1、=1---1、=1+--+1--1这类连续+-混合写法计算结果和wps和office不一致的bug, by @kdevilpf 2023-10-08
                            for (let ls = i + 1; ls < funcstack.length; ls++) {
                                if (["--", "++"].includes(s + funcstack[ls])) {
                                    s = "+";
                                } else if (["-+", "+-"].includes(s + funcstack[ls])) {
                                    s = "-";
                                } else {
                                    if (ls > i + 1) {
                                        i = ls - 1;
                                    }
                                    break;
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
                        // str += $.trim(s);
                        str += s; //Do not use $.trim(s). When obtaining the worksheet name that contains spaces, you should keep the spaces
                    } else {
                        str += s;
                    }
                }

                if (i == funcstack.length - 1) {
                    let endstr = "";
                    let str_nb = str.trim().replace(/'/g, "\\'");
                    if (_this.iscelldata(str_nb) && str_nb.substr(0, 1) != ":") {
                        endstr = "luckysheet_getcelldata('" + str_nb + "')";
                        if (typeof cellRangeFunction == "function") {
                            cellRangeFunction(str_nb);
                        }
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

                    if (endstr.length > 0) {
                        cal2.unshift(endstr);
                    }

                    if (cal1.length > 0) {
                        if (function_str.length > 0) {
                            cal2.unshift(function_str);
                            function_str = "";
                        }

                        while (cal1.length > 0) {
                            cal2.unshift(cal1.shift());
                        }
                    }

                    if (cal2.length > 0) {
                        function_str = _this.calPostfixExpression(cal2);
                    } else {
                        function_str += endstr;
                    }
                }

                i++;
            }
            // console.log(function_str);
            return function_str;
        }
};

export default formulaParser;
