import { luckysheetdefaultFont } from '../../controllers/constant';
import menuButton from '../../controllers/menuButton';
import { isdatatype, isdatatypemulti } from '../../global/datecontroll';
import { hasChinaword } from '../../global/validate';
import { isNumericString } from './typeUtils.js';
import locale from '../../locale/locale';
import Store from '../../store';
import numeral from 'numeral';
import { getObjType } from './typeUtils.js';

function luckysheetfontformat(format) {
    let fontarray = locale().fontarray;
    if (getObjType(format) == "object") {
        let font = "";

        //font-style
        if (format.it == "0" || format.it == null) {
            font += "normal ";
        } else {
            font += "italic ";
        }

        //font-variant
        font += "normal ";

        //font-weight
        if (format.bl == "0" || format.bl == null) {
            font += "normal ";
        } else {
            font += "bold ";
        }

        //font-size/line-height
        if (!format.fs) {
            font += Store.defaultFontSize + "pt ";
        } else {
            font += Math.ceil(format.fs) + "pt ";
        }

        if (!format.ff) {
            font +=
                fontarray[0] +
                ', "Helvetica Neue", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif';
        } else {
            let fontfamily = null;
            let fontjson = locale().fontjson;
            if (isdatatypemulti(format.ff)["num"]) {
                fontfamily = fontarray[parseInt(format.ff)];
            } else {
                // fontfamily = fontarray[fontjson[format.ff]];
                fontfamily = format.ff;

                fontfamily = fontfamily.replace(/"/g, "").replace(/'/g, "");

                if (fontfamily.indexOf(" ") > -1) {
                    fontfamily = '"' + fontfamily + '"';
                }

                if (fontfamily != null && document.fonts && !document.fonts.check("12px " + fontfamily)) {
                    menuButton.addFontTolist(fontfamily);
                }
            }

            if (fontfamily == null) {
                fontfamily = fontarray[0];
            }

            font +=
                fontfamily +
                ', "Helvetica Neue", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif';
        }

        return font;
    } else {
        return luckysheetdefaultFont();
    }
}

function numFormat(num, type) {
    if (num == null || isNaN(parseFloat(num)) || hasChinaword(num) || num == -Infinity || num == Infinity) {
        return null;
    }

    let floatlen = 6,
        ismustfloat = false;
    if (type == null || type == "auto") {
        if (num < 1) {
            floatlen = 6;
        } else {
            floatlen = 1;
        }
    } else {
        if (isdatatype(type) == "num") {
            floatlen = parseInt(type);
            ismustfloat = true;
        } else {
            floatlen = 6;
        }
    }

    let format = "",
        value = null;
    for (let i = 0; i < floatlen; i++) {
        format += "0";
    }

    if (!ismustfloat) {
        format = "[" + format + "]";
    }

    if (num >= 1e21) {
        value = parseFloat(numeral(num).value());
    } else {
        value = parseFloat(numeral(num).format("0." + format));
    }

    return value;
}

function numfloatlen(n) {
    if (n != null && isNumericString(n)) {
        let value = numeral(n).value();
        let lens = value.toString().split(".");

        if (lens.length == 1) {
            lens = 0;
        } else {
            lens = lens[1].length;
        }

        return lens;
    } else {
        return null;
    }
}

export { luckysheetfontformat, numFormat, numfloatlen };
