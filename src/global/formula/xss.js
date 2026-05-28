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

const xss = {
        xssDeal: function(str) {
            if (typeof str !== "string") return str;
            return str.replace(/<script>/g, "&lt;script&gt;").replace(/<\/script>/, "&lt;/script&gt;");
        },

        ltGtSignDeal: function(str) {
            if (typeof str !== "string") return str;
            if (str.substr(0, 5) === "<span" || str.startsWith("=")) {
                return str;
            }
            return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
};

export default xss;
