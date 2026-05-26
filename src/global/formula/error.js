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

const error = {
        error: {
            v: "#VALUE!", //错误的参数或运算符
            n: "#NAME?", //公式名称错误
            na: "#N/A", //函数或公式中没有可用数值
            r: "#REF!", //删除了由其他公式引用的单元格
            d: "#DIV/0!", //除数是0或空单元格
            nm: "#NUM!", //当公式或函数中某个数字有问题时
            nl: "#NULL!", //交叉运算符（空格）使用不正确
            sp: "#SPILL!", //数组范围有其它值
        },

        errorInfo: function(err) {
            return err;
        },

        errorParamCheck: function(thisp, data, i) {
            let type, require;
            let _locale = locale();
            let locale_formulaMore = _locale.formulaMore;
            if (i < thisp.length) {
                type = thisp[i].type;
                require = thisp[i].require;
            } else {
                type = thisp[thisp.length - 1].type;
                require = thisp[thisp.length - 1].require;
            }

            if (require == "o" && (data == null || data == "")) {
                return [true, locale_formulaMore.tipSuccessText];
            }

            if (type.indexOf("all") > -1) {
                return [true, locale_formulaMore.tipSuccessText];
            } else {
                if (type.indexOf("range") > -1 && (getObjType(data) == "object" || getObjType(data) == "array")) {
                    return [true, locale_formulaMore.tipSuccessText];
                }

                if (type.indexOf("number") > -1 && (isRealNum(data) || getObjType(data) == "boolean")) {
                    return [true, locale_formulaMore.tipSuccessText];
                }

                if (type.indexOf("string") > -1 && getObjType(data) == "string") {
                    return [true, locale_formulaMore.tipSuccessText];
                }

                if (type.indexOf("date") > -1 && isdatetime(data)) {
                    return [true, locale_formulaMore.tipSuccessText];
                }

                return [false, locale_formulaMore.tipParamErrorText];
            }
        }
};

export default error;
