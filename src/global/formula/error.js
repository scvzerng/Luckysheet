import {  getObjType } from "../../utils/util";
import {  isRealNum, error as errorConst } from "../validate";
import {  isdatetime } from "../datecontroll";
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
import locale from "../../locale/locale";

const error = {
        error: errorConst,

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
