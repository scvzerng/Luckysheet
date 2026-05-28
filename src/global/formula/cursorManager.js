import { luckysheetRangeLast } from "../cursorPos";
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

const cursorManager = {
        functionHTMLIndex: 0,

        functionRangeIndex: null,

        findrangeindex: function(v, vp) {
            let _this = this;

            let re = /<span.*?>/g;
            let v_a = v.replace(re, ""),
                vp_a = vp.replace(re, "");
            v_a = v_a.split("</span>");
            vp_a = vp_a.split("</span>");
            v_a.pop();
            vp_a.pop();

            let pfri = _this.functionRangeIndex;
            let i = 0;
            let spanlen = vp_a.length > v_a.length ? v_a.length : vp_a.length;

            let vplen = vp_a.length,
                vlen = v_a.length;
            //不增加元素输入
            if (vplen == vlen) {
                let i = pfri[0];
                let p = vp_a[i],
                    n = v_a[i];

                if (p == null) {
                    if (vp_a.length <= i) {
                        pfri = [vp_a.length - 1, vp_a.length - 1];
                    } else if (v_a.length <= i) {
                        pfri = [v_a.length - 1, v_a.length - 1];
                    }

                    return pfri;
                } else if (p.length == n.length) {
                    if (vp_a[i + 1] != null && v_a[i + 1] != null && vp_a[i + 1].length < v_a[i + 1].length) {
                        pfri[0] = pfri[0] + 1;
                        pfri[1] = 1;
                    }

                    return pfri;
                } else if (p.length > n.length) {
                    if (
                        p != null &&
                        v_a[i + 1] != null &&
                        v_a[i + 1].substr(0, 1) == '"' &&
                        (p.indexOf("{") > -1 || p.indexOf("}") > -1)
                    ) {
                        pfri[0] = pfri[0] + 1;
                        pfri[1] = 1;
                    }

                    return pfri;
                } else if (p.length < n.length) {
                    if (pfri[1] > n.length) {
                        pfri[1] = n.length;
                    }

                    return pfri;
                }
            }
            //减少元素输入
            else if (vplen > vlen) {
                let i = pfri[0];
                let p = vp_a[i],
                    n = v_a[i];

                if (n == null) {
                    if (v_a[i - 1].indexOf("{") > -1) {
                        pfri[0] = pfri[0] - 1;
                        let start = v_a[i - 1].search("{");
                        pfri[1] = pfri[1] + start;
                    } else {
                        pfri[0] = 0;
                        pfri[1] = 0;
                    }
                } else if (p.length == n.length) {
                    if (
                        v_a[i + 1] != null &&
                        (v_a[i + 1].substr(0, 1) == '"' || v_a[i + 1].substr(0, 1) == "{" || v_a[i + 1].substr(0, 1) == "}")
                    ) {
                        pfri[0] = pfri[0] + 1;
                        pfri[1] = 1;
                    } else if (p != null && p.length > 2 && p.substr(0, 1) == '"' && p.substr(p.length - 1, 1) == '"') {
                        //pfri[1] = n.length-1;
                    } else if (v_a[i] != null && v_a[i] == '")') {
                        pfri[1] = 1;
                    } else if (v_a[i] != null && v_a[i] == '"}') {
                        pfri[1] = 1;
                    } else if (v_a[i] != null && v_a[i] == "{)") {
                        pfri[1] = 1;
                    } else {
                        pfri[1] = n.length;
                    }

                    return pfri;
                } else if (p.length > n.length) {
                    if (
                        v_a[i + 1] != null &&
                        (v_a[i + 1].substr(0, 1) == '"' || v_a[i + 1].substr(0, 1) == "{" || v_a[i + 1].substr(0, 1) == "}")
                    ) {
                        pfri[0] = pfri[0] + 1;
                        pfri[1] = 1;
                    }

                    return pfri;
                } else if (p.length < n.length) {
                    return pfri;
                }

                return pfri;
            }
            //增加元素输入
            else if (vplen < vlen) {
                let i = pfri[0];
                let p = vp_a[i],
                    n = v_a[i];

                if (p == null) {
                    pfri[0] = v_a.length - 1;

                    if (n != null) {
                        pfri[1] = n.length;
                    } else {
                        pfri[1] = 1;
                    }
                } else if (p.length == n.length) {
                    if (
                        vp_a[i + 1] != null &&
                        (vp_a[i + 1].substr(0, 1) == '"' ||
                            vp_a[i + 1].substr(0, 1) == "{" ||
                            vp_a[i + 1].substr(0, 1) == "}")
                    ) {
                        pfri[1] = n.length;
                    } else if (
                        v_a[i + 1] != null &&
                        v_a[i + 1].substr(0, 1) == '"' &&
                        (v_a[i + 1].substr(0, 1) == "{" || v_a[i + 1].substr(0, 1) == "}")
                    ) {
                        pfri[0] = pfri[0] + 1;
                        pfri[1] = 1;
                    } else if (
                        n != null &&
                        n.substr(0, 1) == '"' &&
                        n.substr(n.length - 1, 1) == '"' &&
                        p.substr(0, 1) == '"' &&
                        p.substr(p.length - 1, 1) == ")"
                    ) {
                        pfri[1] = n.length;
                    } else if (
                        n != null &&
                        n.substr(0, 1) == "{" &&
                        n.substr(n.length - 1, 1) == "}" &&
                        p.substr(0, 1) == "{" &&
                        p.substr(p.length - 1, 1) == ")"
                    ) {
                        pfri[1] = n.length;
                    } else {
                        pfri[0] = pfri[0] + vlen - vplen;
                        if (v_a.length > vp_a.length) {
                            pfri[1] = v_a[i + 1].length;
                        } else {
                            pfri[1] = 1;
                        }
                    }

                    return pfri;
                } else if (p.length > n.length) {
                    if (p != null && p.substr(0, 1) == '"') {
                        pfri[1] = n.length;
                    } else if (v_a[i + 1] != null && /{.*?}/.test(v_a[i + 1])) {
                        pfri[0] = pfri[0] + 1;
                        pfri[1] = v_a[i + 1].length;
                    } else if (
                        p != null &&
                        v_a[i + 1].substr(0, 1) == '"' &&
                        (p.indexOf("{") > -1 || p.indexOf("}") > -1)
                    ) {
                        pfri[0] = pfri[0] + 1;
                        pfri[1] = 1;
                    } else if (p != null && (p.indexOf("{") > -1 || p.indexOf("}") > -1)) {
                    } else {
                        pfri[0] = pfri[0] + vlen - vplen - 1;
                        pfri[1] = v_a[i - 1].length;
                    }

                    return pfri;
                } else if (p.length < n.length) {
                    return pfri;
                }

                return pfri;
            }

            return null;
        },

        setCaretPosition: function(textDom, children, pos) {
            try {
                let el = textDom;
                let range = document.createRange();
                let sel = window.getSelection();
                range.setStart(el.childNodes[children], pos);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                el.focus();
            } catch (err) {
                luckysheetRangeLast(this.rangeResizeTo[0]);
            }
        },

        functionRange: function(obj, v, vp) {
            let _this = this;

            if (window.getSelection) {
                //ie11 10 9 ff safari
                let currSelection = window.getSelection();
                let fri = _this.findrangeindex(v, vp);

                if (fri == null) {
                    currSelection.selectAllChildren(obj.get(0));
                    currSelection.collapseToEnd();
                } else {
                    _this.setCaretPosition(obj.find("span").get(fri[0]), 0, fri[1]);
                }
            } else if (document.selection) {
                //ie10 9 8 7 6 5
                _this.functionRangeIndex.moveToElementText(obj); //range定位到obj
                _this.functionRangeIndex.collapse(false); //光标移至最后
                _this.functionRangeIndex.select();
            }
        }
};

export default cursorManager;
