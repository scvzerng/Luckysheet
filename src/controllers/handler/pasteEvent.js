import { onNS, offNS } from '../../utils/migrationHelpers.js';
import imageCtrl from "../imageCtrl";
import menuButton from "../menuButton";
import {
    selectHightlightShow,
    selectIsOverlap,
    selectionCopyShow,
    luckysheet_count_show,
    selectHelpboxFill,
} from "../select";
import selection from "../selection";

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
import {  getFileBySheetIndex } from "../../utils/storeAccess.js";
import {  isEditMode } from "../../global/validate";
import editor from "../../global/editor";
import {  genarate } from "../../global/format";
import method from "../../global/method";
import locale from "../../locale/locale";
import Store from "../../store";
import richTextEditor from '../../ui/richTextEditor.js';

export default function pasteEvent() {
    //粘贴事件处理
    onNS(document, "paste.luckysheetEvent", null, function(e) {
        if (isEditMode()) {
            //此模式下禁用粘贴
            return;
        }

        if (selection.isPasteAction) {
            richTextEditor.blur();
            selection.isPasteAction = false;

            let clipboardData = e.originalEvent && e.originalEvent.clipboardData;

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
                    d = editor.deepCopyFlowData(Store.sheetData);
                } else {
                    d = getFileBySheetIndex(copy_index).data;
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
                            const _tmpDiv = document.createElement('div'); _tmpDiv.innerHTML = cpDataArr[r - copy_r1][c - copy_c1];
                            const cpData = _tmpDiv.textContent.replace(/\s|\n/g, " ");
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
                    const _copyContent = document.getElementById("luckysheet-copy-content"); _copyContent.innerHTML = txtdata;

                    let data = new Array(_copyContent.querySelectorAll("table tr").length);
                    let colLen = 0;
                    const cellElements = "th, td";
                    const _firstRowCells = _copyContent.querySelectorAll("table tr")[0] ? _copyContent.querySelectorAll("table tr")[0].querySelectorAll(cellElements) : [];
                    _firstRowCells.forEach(function(td) {
                            let colspan = parseInt(td.getAttribute("colspan"));
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
                    _copyContent
                        .querySelectorAll("table tr")
                        .forEach(function(tr) {
                            let c = 0;
                            tr.querySelectorAll(cellElements).forEach(function(td) {
                                let cell = {};
                                let txt = td.textContent;
                                if (txt.trim().length == 0) {
                                    cell.v = null;
                                    cell.m = "";
                                } else {
                                    let mask = genarate(td.textContent);
                                    cell.v = mask[2];
                                    cell.ct = mask[1];
                                    cell.m = mask[0];
                                }

                                let bg = getComputedStyle(td).backgroundColor;
                                if (bg == "rgba(0, 0, 0, 0)") {
                                    bg = null;
                                }

                                cell.bg = bg;

                                let bl = getComputedStyle(td).fontWeight;
                                if (bl == 400 || bl == "normal") {
                                    cell.bl = 0;
                                } else {
                                    cell.bl = 1;
                                }

                                // 检测下划线
                                let un = getComputedStyle(td).textDecoration;
                                if (un.indexOf("underline") != -1) {
                                    cell.un = 1;
                                }

                                let it = getComputedStyle(td).fontStyle;
                                if (it == "normal") {
                                    cell.it = 0;
                                } else {
                                    cell.it = 1;
                                }

                                let ff = getComputedStyle(td).fontFamily;
                                let ffs = ff.split(",");
                                for (let i = 0; i < ffs.length; i++) {
                                    let fa = ffs[i].toLowerCase().trim();
                                    fa = locale_fontjson[fa];
                                    if (fa == null) {
                                        cell.ff = 0;
                                    } else {
                                        cell.ff = fa;
                                        break;
                                    }
                                }
                                let fs = Math.round((parseInt(getComputedStyle(td).fontSize) * 72) / 96);
                                cell.fs = fs;

                                let fc = getComputedStyle(td).color;
                                cell.fc = fc;

                                // 水平对齐属性
                                let ht = getComputedStyle(td).textAlign;
                                if (ht == "center") {
                                    cell.ht = 0;
                                } else if (ht == "right") {
                                    cell.ht = 2;
                                } else {
                                    cell.ht = 1;
                                }

                                // 垂直对齐属性
                                let vt = getComputedStyle(td).verticalAlign;
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
                                    let rowspan = parseInt(td.getAttribute("rowspan"));
                                    let colspan = parseInt(td.getAttribute("colspan"));

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
                                                let bt = getComputedStyle(td).borderTop;
                                                if (
                                                    bt != null &&
                                                    bt.length > 0 &&
                                                    bt.substr(0, 3).toLowerCase() != "0px"
                                                ) {
                                                    let width = getComputedStyle(td).borderTopWidth;
                                                    let type = getComputedStyle(td).borderTopStyle;
                                                    let color = getComputedStyle(td).borderTopColor;
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
                                                let bb = getComputedStyle(td).borderBottom;
                                                if (
                                                    bb != null &&
                                                    bb.length > 0 &&
                                                    bb.substr(0, 3).toLowerCase() != "0px"
                                                ) {
                                                    let width = getComputedStyle(td).borderBottomWidth;
                                                    let type = getComputedStyle(td).borderBottomStyle;
                                                    let color = getComputedStyle(td).borderBottomColor;
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
                                                let bl = getComputedStyle(td).borderLeft;
                                                if (
                                                    bl != null &&
                                                    bl.length > 0 &&
                                                    bl.substr(0, 3).toLowerCase() != "0px"
                                                ) {
                                                    let width = getComputedStyle(td).borderLeftWidth;
                                                    let type = getComputedStyle(td).borderLeftStyle;
                                                    let color = getComputedStyle(td).borderLeftColor;
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
                                                let br = getComputedStyle(td).borderRight;
                                                if (
                                                    br != null &&
                                                    br.length > 0 &&
                                                    br.substr(0, 3).toLowerCase() != "0px"
                                                ) {
                                                    let width = getComputedStyle(td).borderRightWidth;
                                                    let type = getComputedStyle(td).borderRightStyle;
                                                    let color = getComputedStyle(td).borderRightColor;
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
                    _copyContent.innerHTML = '';
                }

                //复制的是图片
                else if (clipboardData.files.length == 1 && clipboardData.files[0].type.indexOf("image") > -1) {
                    imageCtrl.insertImg(clipboardData.files[0]);

                    return;
                } else {
                    txtdata = clipboardData.getData("text/plain");
                    selection.pasteHandler(txtdata);
                }
                _copyContent.innerHTML = '';
            }
        } else if (richTextEditor.el.contains(e.target)) {
            // 阻止默认粘贴
            e.preventDefault();

            let clipboardData = e.originalEvent && e.originalEvent.clipboardData;
            let text = clipboardData.getData("text/plain");
            // 插入
            document.execCommand("insertText", false, text);
        }
    });
}
