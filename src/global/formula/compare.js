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

const compare = {
        isWildcard: function(a, b) {
            //正则匹配通配符: * ? ~* ~?,a目标参数，b通配符
            let _this = this;

            a = a.toString();
            b = b.toString();

            if (_this.isCompareOperator(b).flag) {
                b = _this.isCompareOperator(b).num;
            }

            let str = "";
            for (let i = 0; i < b.length; i++) {
                let v = b.charAt(i);

                if (v == "*") {
                    str += ".*";
                } else if (v == "?") {
                    str += ".";
                } else if (v == "~") {
                    if (b.charAt(i + 1) == "*") {
                        str += "\\*";
                        i++;
                    } else if (b.charAt(i + 1) == "?") {
                        str += "\\?";
                        i++;
                    } else {
                        str += "~";
                    }
                } else {
                    str += v;
                }
            }

            let reg = new RegExp("^" + str + "$", "g");

            return !!a.match(reg);
        },

        isCompareOperator: function(str) {
            //判断前一个或者两个字符是否是比较运算符
            str = str.toString();
            let ope = ""; //存放比较运算符
            let num = ""; //截取比较运算符之后的数字用于实际比较
            let strOne = str.substr(0, 1);
            let strTwo = str.substr(1, 1);
            let flag = false;
            let ret;

            if (strOne == ">") {
                if (strTwo == "=") {
                    ope = str.substr(0, 2);
                    num = str.substr(2);
                    flag = true;
                } else if (strTwo != "=") {
                    ope = str.substr(0, 1);
                    num = str.substr(1);
                    flag = true;
                }
            } else if (strOne == "<") {
                if (strTwo == "=" || strTwo == ">") {
                    ope = str.substr(0, 2);
                    num = str.substr(2);
                    flag = true;
                } else if (strTwo != "=" && strTwo != ">") {
                    ope = str.substr(0, 1);
                    num = str.substr(1);
                    flag = true;
                }
            } else if (strOne == "=" && strTwo != "=") {
                ope = str.substr(0, 1);
                num = str.substr(1);
                flag = true;
            }

            ret = { flag: flag, ope: ope, num: num };

            return ret;
        },

        acompareb: function(a, b) {
            //a 与 b比较，b可为含比较符，通配符
            let _this = this;
            let flag = false;

            if (isRealNum(b)) {
                flag = luckysheet_compareWith(a, "==", b);
            } else if (typeof b == "string") {
                //条件输入字符串，如：">233"
                if (b.indexOf("*") != -1 || b.indexOf("?") != -1) {
                    // 正则匹配：输入通配符："黑*","白?",以及"白?黑*~*"
                    //通配符函数
                    return _this.isWildcard(a, b);
                } else if (_this.isCompareOperator(b).flag) {
                    //"黑糖"
                    let ope = _this.isCompareOperator(b).ope;
                    let num = _this.isCompareOperator(b).num;
                    flag = luckysheet_compareWith(a, ope, num);
                } else {
                    flag = luckysheet_compareWith(a, "==", b);
                }
            }

            return flag;
        },

        compareParams: function(fp, sp, sym) {
            //比较两个字符串或者数字的大小，支持比较对象,暂不支持数组
            let flag = false;

            //判断a和b的数据类型
            let classNameA = toString.call(fp),
                classNameB = toString.call(sp);

            if (sym == ">" && fp > sp) {
                flag = true;
            } else if (sym == ">=" && fp >= sp) {
                flag = true;
            } else if (sym == "<" && fp < sp) {
                flag = true;
            } else if (sym == "<=" && fp <= sp) {
                flag = true;
            } else if (sym == "=" && fp == sp) {
                flag = true;
            } else if (sym == "<>" && fp != sp) {
                flag = true;
            }

            //对象类型比较相等
            if (classNameA == "[object Object]" && classNameB == "[object Object]") {
                //获取a和b的属性长度
                let propsA = Object.getOwnPropertyNames(fp),
                    propsB = Object.getOwnPropertyNames(sp);

                if (propsA.length != propsB.length) {
                    return false;
                }

                for (let i = 0; i < propsA.length; i++) {
                    let propName = propsA[i];
                    //如果对应属性对应值不相等，则返回false
                    if (fp[propName] !== sp[propName]) {
                        return false;
                    }
                }

                return true;
            }

            //数组类型
            if (classNameA == "[object Array]" && classNameB == "[object Array]") {
                if (fp.toString() == sp.toString()) {
                    return true;
                }

                return false;
            }

            return flag;
        },

        parseDecimal: function(num) {
            num = parseFloat(num);
            let d = parseInt(num, 10);

            if (d == 0) {
                return num;
            }

            num = num % d;
            return num;
        }
};

export default compare;
