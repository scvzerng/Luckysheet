import mobileinit from "../mobile";
import luckysheetConfigsetting from "../luckysheetConfigsetting";
import luckysheetFreezen from "../freezen";
import luckysheetDropCell from "../dropCell";
import luckysheetPostil from "../postil";
import imageCtrl from "../imageCtrl";
import hyperlinkCtrl from "../hyperlinkCtrl";
import menuButton from "../menuButton";
import conditionformat from "../conditionformat";
import alternateformat from "../alternateformat";
import ifFormulaGenerator from "../ifFormulaGenerator";
import sheetmanage from "../sheetmanage";
import { luckysheetupdateCell } from "../updateCell";
import { luckysheet_searcharray } from "../sheetSearch";
import luckysheetsizeauto from "../resize";
import { luckysheetMoveHighlightCell } from "../sheetMove";
import {
    selectHightlightShow,
    selectIsOverlap,
    selectionCopyShow,
    luckysheet_count_show,
    selectHelpboxFill,
} from "../select";
import selection from "../selection";
import controlHistory from "../controlHistory";
import { hideMenuByCancel } from "../../global/cursorPos";
import { luckysheetdefaultstyle } from "../constant";

const pivotTable = {
    luckysheet_pivotTable_select_state: false,
    movestate: false,
    filter: null,
    row: null,
    column: null,
    values: null,
    pivotDatas: [],
    showType: "",
    movesave: { width: 0, height: 0, containerid: "" },
    pivotclick: function() {},
    isPivotRange: function() { return false; },
    drillDown: function() {},
};

import {
    replaceHtml,
    getObjType,
    chatatABC,
    ArrayUnique,
    showrightclickmenu,
    luckysheetactiveCell,
    luckysheetContainerFocus,
    $$,
} from "../../utils/util";
import { getSheetIndex, getRangetxt } from "../../methods/get";
import { rowLocation, colLocation, mouseposition } from "../../global/location";
import { rowlenByRange } from "../../global/getRowlen";
import { isRealNull, hasPartMC, isEditMode, checkIsAllowEdit } from "../../global/validate";
import { countfunc } from "../../global/count";
import browser from "../../global/browser";
import formula from "../../global/formula";
import { luckysheetextendtable } from "../../global/extend";
import luckysheetscrollevent from "../../global/scroll";
import { jfrefreshgrid, jfrefreshgrid_rhcw, luckysheetrefreshgrid } from "../../global/refresh";
import { getdatabyselection, datagridgrowth } from "../../global/getdata";
import tooltip from "../../global/tooltip";
import editor from "../../global/editor";
import { genarate, update } from "../../global/format";
import method from "../../global/method";
import { getBorderInfoCompute } from "../../global/border";
import { luckysheetDrawMain } from "../../global/draw";
import locale from "../../locale/locale";
import Store from "../../store";
import luckysheetformula from "../../global/formula";
import context from "./context";

export default function pasteEvent() {
    //粘贴事件处理
    $(document).on("paste.luckysheetEvent", function(e) {
        if (isEditMode()) {
            //此模式下禁用粘贴
            return;
        }

        if (selection.isPasteAction) {
            $("#luckysheet-rich-text-editor").blur();
            selection.isPasteAction = false;

            let clipboardData = window.clipboardData; //for IE
            if (!clipboardData) {
                // for chrome
                clipboardData = e.originalEvent.clipboardData;
            }

            let txtdata = clipboardData.getData("text/html") || clipboardData.getData("text/plain");

            //如果标示是qksheet复制的内容，判断剪贴板内容是否是当前页面复制的内容
            let isEqual = true;
            if (
                txtdata.indexOf("luckysheet_copy_action_table") > -1 &&
                Store.luckysheet_copy_save["copyRange"] != null &&
                Store.luckysheet_copy_save["copyRange"].length > 0
            ) {
                //剪贴板内容解析
                let cpDataArr = [];

                let reg = new RegExp("<tr.*?>(.*?)</tr>", "gs");
                let reg2 = new RegExp("<td.*?>(.*?)</td>", "gs");

                let regArr = txtdata.match(reg) || [];

                for (let i = 0; i < regArr.length; i++) {
                    let cpRowArr = [];

                    let reg2Arr = regArr[i].match(reg2);

                    if (reg2Arr != null) {
                        for (let j = 0; j < reg2Arr.length; j++) {
                            let cpValue = reg2Arr[j].replace(/<td.*?>/gs, "").replace(/<\/td>/gs, "");
                            cpRowArr.push(cpValue);
                        }
                    }

                    cpDataArr.push(cpRowArr);
                }

                //当前页面复制区内容
                let copy_r1 = Store.luckysheet_copy_save["copyRange"][0].row[0],
                    copy_r2 = Store.luckysheet_copy_save["copyRange"][0].row[1],
                    copy_c1 = Store.luckysheet_copy_save["copyRange"][0].column[0],
                    copy_c2 = Store.luckysheet_copy_save["copyRange"][0].column[1];

                let copy_index = Store.luckysheet_copy_save["dataSheetIndex"];

                let d;
                if (copy_index == Store.currentSheetIndex) {
                    d = editor.deepCopyFlowData(Store.flowdata);
                } else {
                    d = Store.luckysheetfile[getSheetIndex(copy_index)].data;
                }

                for (let r = copy_r1; r <= copy_r2; r++) {
                    if (r - copy_r1 > cpDataArr.length - 1) {
                        break;
                    }

                    for (let c = copy_c1; c <= copy_c2; c++) {
                        let cell = d[r][c];
                        let isInlineStr = false;
                        if (cell != null && cell.mc != null && cell.mc.rs == null) {
                            continue;
                        }

                        let v;
                        if (cell != null) {
                            if (cell.ct != null && cell.ct.fa.indexOf("w") > -1) {
                                v = d[r][c].v;
                            } else {
                                v = d[r][c].m;
                            }
                        } else {
                            v = "";
                        }

                        if (v == null && d[r][c] && d[r][c].ct && d[r][c].ct.t == "inlineStr") {
                            v = d[r][c].ct.s.map((val) => val.v).join("");
                            isInlineStr = true;
                        }
                        if (v == null) {
                            v = "";
                        }
                        if (isInlineStr) {
                            const cpData = $(cpDataArr[r - copy_r1][c - copy_c1])
                                .text()
                                .replace(/\s|\n/g, " ");
                            const storeValue = v.replace(/\n/g, "").replace(/\s/g, " ");
                            if (cpData != storeValue) {
                                isEqual = false;
                                break;
                            }
                        } else {
                            if (cpDataArr[r - copy_r1][c - copy_c1] != v) {
                                isEqual = false;
                                break;
                            }
                        }
                    }
                }
            }

            const locale_fontjson = locale().fontjson;

            // hook
            if (!method.createHookFunction("rangePasteBefore", Store.luckysheet_select_save, txtdata)) {
                return;
            }

            if (
                txtdata.indexOf("luckysheet_copy_action_table") > -1 &&
                Store.luckysheet_copy_save["copyRange"] != null &&
                Store.luckysheet_copy_save["copyRange"].length > 0 &&
                isEqual
            ) {
                //剪切板内容 和 luckysheet本身复制的内容 一致
                if (Store.luckysheet_paste_iscut) {
                    Store.luckysheet_paste_iscut = false;
                    selection.pasteHandlerOfCutPaste(Store.luckysheet_copy_save);
                    selection.clearcopy(e);
                } else {
                    selection.pasteHandlerOfCopyPaste(Store.luckysheet_copy_save);
                }
            } else if (txtdata.indexOf("luckysheet_copy_action_image") > -1) {
                imageCtrl.pasteImgItem();
            } else {
                if (txtdata.indexOf("table") > -1) {
                    $("#luckysheet-copy-content").html(txtdata);

                    let data = new Array($("#luckysheet-copy-content").find("table tr").length);
                    let colLen = 0;
                    const cellElements = "th, td";
                    $("#luckysheet-copy-content")
                        .find("table tr")
                        .eq(0)
                        .find(cellElements)
                        .each(function() {
                            let colspan = parseInt($(this).attr("colspan"));
                            if (isNaN(colspan)) {
                                colspan = 1;
                            }
                            colLen += colspan;
                        });

                    for (let i = 0; i < data.length; i++) {
                        data[i] = new Array(colLen);
                    }

                    let r = 0;
                    let borderInfo = {};
                    $("#luckysheet-copy-content")
                        .find("table tr")
                        .each(function() {
                            let $tr = $(this);
                            let c = 0;
                            $tr.find(cellElements).each(function() {
                                let $td = $(this);
                                let cell = {};
                                let txt = $td.text();
                                if ($.trim(txt).length == 0) {
                                    cell.v = null;
                                    cell.m = "";
                                } else {
                                    let mask = genarate($td.text());
                                    cell.v = mask[2];
                                    cell.ct = mask[1];
                                    cell.m = mask[0];
                                }

                                let bg = $td.css("background-color");
                                if (bg == "rgba(0, 0, 0, 0)") {
                                    bg = null;
                                }

                                cell.bg = bg;

                                let bl = $td.css("font-weight");
                                if (bl == 400 || bl == "normal") {
                                    cell.bl = 0;
                                } else {
                                    cell.bl = 1;
                                }

                                // 检测下划线
                                let un = $td.css("text-decoration");
                                if (un.indexOf("underline") != -1) {
                                    cell.un = 1;
                                }

                                let it = $td.css("font-style");
                                if (it == "normal") {
                                    cell.it = 0;
                                } else {
                                    cell.it = 1;
                                }

                                let ff = $td.css("font-family");
                                let ffs = ff.split(",");
                                for (let i = 0; i < ffs.length; i++) {
                                    let fa = $.trim(ffs[i].toLowerCase());
                                    fa = locale_fontjson[fa];
                                    if (fa == null) {
                                        cell.ff = 0;
                                    } else {
                                        cell.ff = fa;
                                        break;
                                    }
                                }
                                let fs = Math.round((parseInt($td.css("font-size")) * 72) / 96);
                                cell.fs = fs;

                                let fc = $td.css("color");
                                cell.fc = fc;

                                // 水平对齐属性
                                let ht = $td.css("text-align");
                                if (ht == "center") {
                                    cell.ht = 0;
                                } else if (ht == "right") {
                                    cell.ht = 2;
                                } else {
                                    cell.ht = 1;
                                }

                                // 垂直对齐属性
                                let vt = $td.css("vertical-align");
                                if (vt == "middle") {
                                    cell.vt = 0;
                                } else if (vt == "top" || vt == "text-top") {
                                    cell.vt = 1;
                                } else {
                                    cell.vt = 2;
                                }

                                while (c < colLen && data[r][c] != null) {
                                    c++;
                                }

                                if (c == colLen) {
                                    return true;
                                }

                                if (data[r][c] == null) {
                                    data[r][c] = cell;
                                    let rowspan = parseInt($td.attr("rowspan"));
                                    let colspan = parseInt($td.attr("colspan"));

                                    if (isNaN(rowspan)) {
                                        rowspan = 1;
                                    }

                                    if (isNaN(colspan)) {
                                        colspan = 1;
                                    }

                                    let r_ab = Store.luckysheet_select_save[0]["row"][0] + r;
                                    let c_ab = Store.luckysheet_select_save[0]["column"][0] + c;

                                    for (let rp = 0; rp < rowspan; rp++) {
                                        for (let cp = 0; cp < colspan; cp++) {
                                            if (rp == 0) {
                                                let bt = $td.css("border-top");
                                                if (
                                                    bt != null &&
                                                    bt.length > 0 &&
                                                    bt.substr(0, 3).toLowerCase() != "0px"
                                                ) {
                                                    let width = $td.css("border-top-width");
                                                    let type = $td.css("border-top-style");
                                                    let color = $td.css("border-top-color");
                                                    let borderconfig = menuButton.getQKBorder(width, type, color);

                                                    if (borderInfo[r + rp + "_" + (c + cp)] == null) {
                                                        borderInfo[r + rp + "_" + (c + cp)] = {};
                                                    }

                                                    borderInfo[r + rp + "_" + (c + cp)].t = {
                                                        style: borderconfig[0],
                                                        color: borderconfig[1],
                                                    };
                                                }
                                            }

                                            if (rp == rowspan - 1) {
                                                let bb = $td.css("border-bottom");
                                                if (
                                                    bb != null &&
                                                    bb.length > 0 &&
                                                    bb.substr(0, 3).toLowerCase() != "0px"
                                                ) {
                                                    let width = $td.css("border-bottom-width");
                                                    let type = $td.css("border-bottom-style");
                                                    let color = $td.css("border-bottom-color");
                                                    let borderconfig = menuButton.getQKBorder(width, type, color);

                                                    if (borderInfo[r + rp + "_" + (c + cp)] == null) {
                                                        borderInfo[r + rp + "_" + (c + cp)] = {};
                                                    }

                                                    borderInfo[r + rp + "_" + (c + cp)].b = {
                                                        style: borderconfig[0],
                                                        color: borderconfig[1],
                                                    };
                                                }
                                            }

                                            if (cp == 0) {
                                                let bl = $td.css("border-left");
                                                if (
                                                    bl != null &&
                                                    bl.length > 0 &&
                                                    bl.substr(0, 3).toLowerCase() != "0px"
                                                ) {
                                                    let width = $td.css("border-left-width");
                                                    let type = $td.css("border-left-style");
                                                    let color = $td.css("border-left-color");
                                                    let borderconfig = menuButton.getQKBorder(width, type, color);

                                                    if (borderInfo[r + rp + "_" + (c + cp)] == null) {
                                                        borderInfo[r + rp + "_" + (c + cp)] = {};
                                                    }

                                                    borderInfo[r + rp + "_" + (c + cp)].l = {
                                                        style: borderconfig[0],
                                                        color: borderconfig[1],
                                                    };
                                                }
                                            }

                                            if (cp == colspan - 1) {
                                                let br = $td.css("border-right");
                                                if (
                                                    br != null &&
                                                    br.length > 0 &&
                                                    br.substr(0, 3).toLowerCase() != "0px"
                                                ) {
                                                    let width = $td.css("border-right-width");
                                                    let type = $td.css("border-right-style");
                                                    let color = $td.css("border-right-color");
                                                    let borderconfig = menuButton.getQKBorder(width, type, color);

                                                    if (borderInfo[r + rp + "_" + (c + cp)] == null) {
                                                        borderInfo[r + rp + "_" + (c + cp)] = {};
                                                    }

                                                    borderInfo[r + rp + "_" + (c + cp)].r = {
                                                        style: borderconfig[0],
                                                        color: borderconfig[1],
                                                    };
                                                }
                                            }

                                            if (rp == 0 && cp == 0) {
                                                continue;
                                            }

                                            data[r + rp][c + cp] = { mc: { r: r_ab, c: c_ab } };
                                        }
                                    }

                                    if (rowspan > 1 || colspan > 1) {
                                        let first = { rs: rowspan, cs: colspan, r: r_ab, c: c_ab };
                                        data[r][c].mc = first;
                                    }
                                }

                                c++;

                                if (c == colLen) {
                                    return true;
                                }
                            });

                            r++;
                        });

                    Store.luckysheet_selection_range = [];
                    selection.pasteHandler(data, borderInfo);
                    $("#luckysheet-copy-content").empty();
                }

                //复制的是图片
                else if (clipboardData.files.length == 1 && clipboardData.files[0].type.indexOf("image") > -1) {
                    imageCtrl.insertImg(clipboardData.files[0]);

                    return;
                } else {
                    txtdata = clipboardData.getData("text/plain");
                    selection.pasteHandler(txtdata);
                }
                $("#luckysheet-copy-content").empty();
            }
        } else if ($(e.target).closest("#luckysheet-rich-text-editor").length > 0) {
            // 阻止默认粘贴
            e.preventDefault();

            let clipboardData = window.clipboardData; //for IE
            if (!clipboardData) {
                // for chrome
                clipboardData = e.originalEvent.clipboardData;
            }
            let text = clipboardData.getData("text/plain");
            // 插入
            document.execCommand("insertText", false, text);
        }
    });
}
