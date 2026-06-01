import { onNS, offNS } from '../utils/migrationHelpers.js';
import { replaceHtml, chatatABC } from "../utils/util";
import { hideModalMask, getScrollPosition } from "../utils/domUtils.js";
import { getCurrentFile, getLastSelection, getFocusCell } from "../utils/storeAccess.js";
import { modelHTML, keycode } from "./constant";
import { selectHightlightShow } from "./select";
import sheetmanage from "./sheetmanage";
import { isEditMode } from "../global/validate";
import { valueShowEs } from "../global/format";
import { setcellvalue } from "../global/setdata";
import { jfrefreshgrid } from "../global/refresh";
import editor from "../global/editor";
import tooltip from "../global/tooltip";
import func_methods from "../global/func_methods";
import Store from "../store";
import locale from "../locale/locale";
import escapeHtml from "escape-html";
import scrollBarX from '../ui/scrollBarX.js';
import scrollBarY from '../ui/scrollBarY.js';
import cellMain from '../ui/cellMain.js';

//查找替换
const luckysheetSearchReplace = {
    createDialog: function(source) {
        hideModalMask();
        const _srEl = document.getElementById("luckysheet-search-replace");
        if (_srEl) _srEl.remove();

        const _locale = locale();
        const locale_findAndReplace = _locale.findAndReplace;
        const locale_button = _locale.button;

        let content =
            '<div class="tabBox">' +
            '<span id="searchTab">' +
            locale_findAndReplace.find +
            "</span>" +
            '<span id="replaceTab">' +
            locale_findAndReplace.replace +
            "</span>" +
            "</div>" +
            '<div class="ctBox">' +
            '<div class="inputBox">' +
            '<div class="textboxs" id="searchInput">' +
            locale_findAndReplace.findTextbox +
            '：<input class="formulaInputFocus" spellcheck="false" value=""/></div>' +
            '<div class="textboxs" id="replaceInput">' +
            locale_findAndReplace.replaceTextbox +
            '：<input class="formulaInputFocus" spellcheck="false" value=""/></div>' +
            '<div class="checkboxs">' +
            '<div id="regCheck">' +
            '<input type="checkbox"/>' +
            "<span>" +
            locale_findAndReplace.regexTextbox +
            "</span>" +
            "</div>" +
            '<div id="wordCheck">' +
            '<input type="checkbox"/>' +
            "<span>" +
            locale_findAndReplace.wholeTextbox +
            "</span>" +
            "</div>" +
            '<div id="caseCheck">' +
            '<input type="checkbox"/>' +
            "<span>" +
            locale_findAndReplace.distinguishTextbox +
            "</span>" +
            "</div>" +
            "</div>" +
            "</div>" +
            '<div class="btnBox">' +
            '<button id="replaceAllBtn" class="btn btn-default">' +
            locale_findAndReplace.allReplaceBtn +
            "</button>" +
            '<button id="replaceBtn" class="btn btn-default">' +
            locale_findAndReplace.replaceBtn +
            "</button>" +
            '<button id="searchAllBtn" class="btn btn-default">' +
            locale_findAndReplace.allFindBtn +
            "</button>" +
            '<button id="searchNextBtn" class="btn btn-default">' +
            locale_findAndReplace.findBtn +
            "</button>" +
            "</div>" +
            "</div>";

        document.body.insertAdjacentHTML('beforeend',
            replaceHtml(modelHTML, {
                id: "luckysheet-search-replace",
                addclass: "luckysheet-search-replace",
                title: "",
                content: content,
                botton:
                    '<button class="btn btn-default luckysheet-model-close-btn">' + locale_button.close + "</button>",
                style: "z-index:100003",
                close: locale_button.close,
            }),
        );
        let _srEl2 = document.getElementById("luckysheet-search-replace");
        let _srContent = _srEl2?.querySelector(".luckysheet-modal-dialog-content");
        if (_srContent) _srContent.style.minWidth = '500px';
        let myh = _srEl2?.offsetHeight || 0,
            myw = _srEl2?.offsetWidth || 0;
        let winw = document.documentElement.clientWidth,
            winh = document.documentElement.clientHeight;
        let scrollLeft = document.documentElement.scrollLeft,
            scrollTop = document.documentElement.scrollTop;
        let _srEl3 = document.getElementById("luckysheet-search-replace");
        if (_srEl3) {
          Object.assign(_srEl3.style, { left: (winw + scrollLeft - myw) / 2 + 'px', top: (winh + scrollTop - myh) / 3 + 'px' });
          _srEl3.style.display = '';
        }

        if (source == "0") {
            let _searchTab = document.querySelector("#luckysheet-search-replace #searchTab");
            if (_searchTab) {
              _searchTab.classList.add("on");
              Array.from(_searchTab.parentElement.children).filter(s => s !== _searchTab).forEach(s => s.classList.remove("on"));
            }
            const _elRepIn1 = document.querySelector("#luckysheet-search-replace #replaceInput"); if (_elRepIn1) _elRepIn1.style.display = 'none';
            const _elRepAll1 = document.querySelector("#luckysheet-search-replace #replaceAllBtn"); if (_elRepAll1) _elRepAll1.style.display = 'none';
            const _elRepBtn1 = document.querySelector("#luckysheet-search-replace #replaceBtn"); if (_elRepBtn1) _elRepBtn1.style.display = 'none';
        } else if (source == "1") {
            let _replaceTab = document.querySelector("#luckysheet-search-replace #replaceTab");
            if (_replaceTab) {
              _replaceTab.classList.add("on");
              Array.from(_replaceTab.parentElement.children).filter(s => s !== _replaceTab).forEach(s => s.classList.remove("on"));
            }
            const _elRepIn2 = document.querySelector("#luckysheet-search-replace #replaceInput"); if (_elRepIn2) _elRepIn2.style.display = '';
            const _elRepAll2 = document.querySelector("#luckysheet-search-replace #replaceAllBtn"); if (_elRepAll2) _elRepAll2.style.display = '';
            const _elRepBtn2 = document.querySelector("#luckysheet-search-replace #replaceBtn"); if (_elRepBtn2) _elRepBtn2.style.display = '';
        }
    },
    init: function() {
        let _this = this;

        //查找替换 切换
        offNS("SRtabBoxspan");
        onNS(document, "click.SRtabBoxspan", "#luckysheet-search-replace .tabBox span", function() {
                this.classList.add("on");
                Array.from(this.parentElement.children).filter(s => s !== this).forEach(s => s.classList.remove("on"));

                let $id = this.getAttribute("id");
                if ($id == "searchTab") {
                    const _elRepIn3 = document.querySelector("#luckysheet-search-replace #replaceInput"); if (_elRepIn3) _elRepIn3.style.display = 'none';
                    const _elRepAll3 = document.querySelector("#luckysheet-search-replace #replaceAllBtn"); if (_elRepAll3) _elRepAll3.style.display = 'none';
                    const _elRepBtn3 = document.querySelector("#luckysheet-search-replace #replaceBtn"); if (_elRepBtn3) _elRepBtn3.style.display = 'none';

                    let _srSearchInput = document.querySelector("#luckysheet-search-replace #searchInput input"); if (_srSearchInput) _srSearchInput.focus();
                } else if ($id == "replaceTab") {
                    const _elRepIn4 = document.querySelector("#luckysheet-search-replace #replaceInput"); if (_elRepIn4) _elRepIn4.style.display = '';
                    const _elRepAll4 = document.querySelector("#luckysheet-search-replace #replaceAllBtn"); if (_elRepAll4) _elRepAll4.style.display = '';
                    const _elRepBtn4 = document.querySelector("#luckysheet-search-replace #replaceBtn"); if (_elRepBtn4) _elRepBtn4.style.display = '';

                    let _srReplaceInput = document.querySelector("#luckysheet-search-replace #replaceInput input"); if (_srReplaceInput) _srReplaceInput.focus();
                }
            });

        //查找下一个
        offNS("SRsearchInput");
        onNS(document, "keyup.SRsearchInput", "#luckysheet-search-replace #searchInput input", function(event) {
                let kcode = event.keyCode;
                if (kcode == keycode.ENTER) {
                    _this.searchNext();
                }
            });
        offNS("SRsearchNextBtn");
        onNS(document, "click.SRsearchNextBtn", "#luckysheet-search-replace #searchNextBtn", function() {
                _this.searchNext();
            });

        //查找全部
        offNS("SRsearchAllBtn");
        onNS(document, "click.SRsearchAllBtn", "#luckysheet-search-replace #searchAllBtn", function() {
                _this.searchAll();
            });
        offNS("SRsearchAllboxItem");
        onNS(document, "click.SRsearchAllboxItem", "#luckysheet-search-replace #searchAllbox .boxItem", function() {
                this.classList.add("on");
                Array.from(this.parentElement.children).filter(s => s !== this).forEach(s => s.classList.remove("on"));

                let r = this.getAttribute("data-row");
                let c = this.getAttribute("data-col");
                let sheetIndex = this.getAttribute("data-sheetIndex");

                if (sheetIndex != Store.currentSheetIndex) {
                    sheetmanage.changeSheetExec(sheetIndex);
                }

                Store.luckysheet_select_save = [{ row: [r, r], column: [c, c] }];

                selectHightlightShow();

                let scroll = getScrollPosition();
                let scrollLeft = scroll.scrollLeft,
                    scrollTop = scroll.scrollTop;
                let winH = cellMain.getHeight(),
                    winW = cellMain.getWidth();

                let row = Store.visibledatarow[r],
                    row_pre = r - 1 == -1 ? 0 : Store.visibledatarow[r - 1];
                let col = Store.visibledatacolumn[c],
                    col_pre = c - 1 == -1 ? 0 : Store.visibledatacolumn[c - 1];

                if (col - scrollLeft - winW + 20 > 0) {
                    scrollBarX.setScrollLeft(col - winW + 20);
                } else if (col_pre - scrollLeft - 20 < 0) {
                    scrollBarX.setScrollLeft(col_pre - 20);
                }

                if (row - scrollTop - winH + 20 > 0) {
                    scrollBarY.setScrollTop(row - winH + 20);
                } else if (row_pre - scrollTop - 20 < 0) {
                    scrollBarY.setScrollTop(row_pre - 20);
                }
            });

        //替换
        offNS("SRreplaceBtn");
        onNS(document, "click.SRreplaceBtn", "#luckysheet-search-replace #replaceBtn", function() {
                _this.replace();
            });

        //全部替换
        offNS("SRreplaceAllBtn");
        onNS(document, "click.SRreplaceAllBtn", "#luckysheet-search-replace #replaceAllBtn", function() {
                _this.replaceAll();
            });
    },
    searchNext: function() {
        let _this = this;

        let searchText = document.querySelector("#luckysheet-search-replace #searchInput input")?.value;
        if (searchText == "" || searchText == null) {
            return;
        }
        const _locale = locale();
        const locale_findAndReplace = _locale.findAndReplace;
        let range;
        if (
            Store.luckysheet_select_save.length == 0 ||
            (Store.luckysheet_select_save.length == 1 &&
                Store.luckysheet_select_save[0].row[0] == Store.luckysheet_select_save[0].row[1] &&
                Store.luckysheet_select_save[0].column[0] == Store.luckysheet_select_save[0].column[1])
        ) {
            range = [
                {
                    row: [0, Store.sheetData.length - 1],
                    column: [0, Store.sheetData[0].length - 1],
                },
            ];
        } else {
            range = structuredClone(Store.luckysheet_select_save);
        }

        let searchIndexArr = _this.getSearchIndexArr(searchText, range);

        if (searchIndexArr.length == 0) {
            if (isEditMode()) {
                alert(locale_findAndReplace.noFindTip);
            } else {
                tooltip.info(locale_findAndReplace.noFindTip, "");
            }

            return;
        }

        let count = 0;

        if (
            Store.luckysheet_select_save.length == 0 ||
            (Store.luckysheet_select_save.length == 1 &&
                Store.luckysheet_select_save[0].row[0] == Store.luckysheet_select_save[0].row[1] &&
                Store.luckysheet_select_save[0].column[0] == Store.luckysheet_select_save[0].column[1])
        ) {
            if (Store.luckysheet_select_save.length == 0) {
                count = 0;
            } else {
                for (let i = 0; i < searchIndexArr.length; i++) {
                    if (
                        searchIndexArr[i].r == Store.luckysheet_select_save[0].row[0] &&
                        searchIndexArr[i].c == Store.luckysheet_select_save[0].column[0]
                    ) {
                        if (i == searchIndexArr.length - 1) {
                            count = 0;
                        } else {
                            count = i + 1;
                        }

                        break;
                    }
                }
            }

            Store.luckysheet_select_save = [
                {
                    row: [searchIndexArr[count].r, searchIndexArr[count].r],
                    column: [searchIndexArr[count].c, searchIndexArr[count].c],
                },
            ];
        } else {
            let rf = range[range.length - 1].row_focus;
            let cf = range[range.length - 1].column_focus;

            for (let i = 0; i < searchIndexArr.length; i++) {
                if (searchIndexArr[i].r == rf && searchIndexArr[i].c == cf) {
                    if (i == searchIndexArr.length - 1) {
                        count = 0;
                    } else {
                        count = i + 1;
                    }

                    break;
                }
            }

            for (let s = 0; s < range.length; s++) {
                let r1 = range[s].row[0],
                    r2 = range[s].row[1];
                let c1 = range[s].column[0],
                    c2 = range[s].column[1];

                if (
                    searchIndexArr[count].r >= r1 &&
                    searchIndexArr[count].r <= r2 &&
                    searchIndexArr[count].c >= c1 &&
                    searchIndexArr[count].c <= c2
                ) {
                    let obj = range[s];
                    obj["row_focus"] = searchIndexArr[count].r;
                    obj["column_focus"] = searchIndexArr[count].c;
                    range.splice(s, 1);
                    range.push(obj);

                    break;
                }
            }

            Store.luckysheet_select_save = range;
        }

        selectHightlightShow();

        let scroll = getScrollPosition();
        let scrollLeft = scroll.scrollLeft,
            scrollTop = scroll.scrollTop;
        let winH = cellMain.getHeight(),
        winW = cellMain.getWidth();

        let row = Store.visibledatarow[searchIndexArr[count].r],
            row_pre = searchIndexArr[count].r - 1 == -1 ? 0 : Store.visibledatarow[searchIndexArr[count].r - 1];
        let col = Store.visibledatacolumn[searchIndexArr[count].c],
            col_pre = searchIndexArr[count].c - 1 == -1 ? 0 : Store.visibledatacolumn[searchIndexArr[count].c - 1];

        if (col - scrollLeft - winW + 20 > 0) {
            scrollBarX.setScrollLeft(col - winW + 20);
        } else if (col_pre - scrollLeft - 20 < 0) {
            scrollBarX.setScrollLeft(col_pre - 20);
        }

        if (row - scrollTop - winH + 20 > 0) {
            scrollBarY.setScrollTop(row - winH + 20);
        } else if (row_pre - scrollTop - 20 < 0) {
            scrollBarY.setScrollTop(row_pre - 20);
        }

        let _searchAllbox = document.querySelector("#searchAllbox");
        if (_searchAllbox && _searchAllbox.offsetWidth > 0) {
            document.querySelectorAll("#luckysheet-search-replace #searchAllbox .boxItem").forEach(el => el.classList.remove("on"));
        }
    },
    searchAll: function() {
        let _this = this;

        const _locale = locale();
        const locale_findAndReplace = _locale.findAndReplace;

        let _searchAllboxEl = document.querySelector("#luckysheet-search-replace #searchAllbox");
        if (_searchAllboxEl) _searchAllboxEl.remove();

        let searchText = document.querySelector("#luckysheet-search-replace #searchInput input")?.value;
        if (searchText == "" || searchText == null) {
            return;
        }

        /**
         * fix #1115 查找改为全局查找（todo: 后续可以传入range）
         */
        let range;
        // if(Store.luckysheet_select_save.length == 0 || (Store.luckysheet_select_save.length == 1 && Store.luckysheet_select_save[0].row[0] == Store.luckysheet_select_save[0].row[1] && Store.luckysheet_select_save[0].column[0] == Store.luckysheet_select_save[0].column[1])){
        range = [
            {
                row: [0, Store.sheetData.length - 1],
                column: [0, Store.sheetData[0].length - 1],
            },
        ];
        // }
        // else{
        //     range = structuredClone(Store.luckysheet_select_save);
        // }

        let searchIndexArr = _this.getSearchIndexArr(searchText, range);

        if (searchIndexArr.length == 0) {
            if (isEditMode()) {
                alert(locale_findAndReplace.noFindTip);
            } else {
                tooltip.info(locale_findAndReplace.noFindTip, "");
            }

            return;
        }

        let searchAllHtml = "";

        for (let i = 0; i < searchIndexArr.length; i++) {
            let value_ShowEs = valueShowEs(searchIndexArr[i].r, searchIndexArr[i].c, Store.sheetData).toString();

            if (value_ShowEs.indexOf("</") > -1 && value_ShowEs.indexOf(">") > -1) {
                searchAllHtml +=
                    '<div class="boxItem" data-row="' +
                    searchIndexArr[i].r +
                    '" data-col="' +
                    searchIndexArr[i].c +
                    '" data-sheetIndex="' +
                    Store.currentSheetIndex +
                    '">' +
                    "<span>" +
                    escapeHtml(getCurrentFile().name) +
                    "</span>" +
                    "<span>" +
                    chatatABC(searchIndexArr[i].c) +
                    (searchIndexArr[i].r + 1) +
                    "</span>" +
                    "<span>" +
                    escapeHtml(value_ShowEs) +
                    "</span>" +
                    "</div>";
            } else {
                searchAllHtml +=
                    '<div class="boxItem" data-row="' +
                    searchIndexArr[i].r +
                    '" data-col="' +
                    searchIndexArr[i].c +
                    '" data-sheetIndex="' +
                    Store.currentSheetIndex +
                    '">' +
                    "<span>" +
                    getCurrentFile().name +
                    "</span>" +
                    "<span>" +
                    chatatABC(searchIndexArr[i].c) +
                    (searchIndexArr[i].r + 1) +
                    "</span>" +
                    '<span title="' +
                    escapeHtml(value_ShowEs) +
                    '">' +
                    escapeHtml(value_ShowEs) +
                    "</span>" +
                    "</div>";
            }
        }

        let _srEl4 = document.getElementById("luckysheet-search-replace");
        if (_srEl4) {
          _srEl4.insertAdjacentHTML('beforeend',
            `<div id="searchAllbox"><div class="boxTitle"><span>${locale_findAndReplace.searchTargetSheet}</span><span>${locale_findAndReplace.searchTargetCell}</span><span>${locale_findAndReplace.searchTargetValue}</span></div><div class="boxMain">${searchAllHtml}</div></div>`,
          );
        }

        let _firstBoxItem = document.querySelector("#luckysheet-search-replace #searchAllbox .boxItem");
        if (_firstBoxItem) {
          _firstBoxItem.classList.add("on");
          Array.from(_firstBoxItem.parentElement.children).filter(s => s !== _firstBoxItem).forEach(s => s.classList.remove("on"));
        }

        Store.luckysheet_select_save = [
            {
                row: [searchIndexArr[0].r, searchIndexArr[0].r],
                column: [searchIndexArr[0].c, searchIndexArr[0].c],
            },
        ];

        selectHightlightShow();
    },
    getSearchIndexArr: function(searchText, range) {
        const arr = [];
        const obj = {};

        const _srContainer = document.getElementById("luckysheet-search-replace");
        const isChecked = (inputId) => {
          let _cb = _srContainer?.querySelector('#' + inputId + ' input[type=\'checkbox\']');
          return _cb ? _cb.checked : false;
        };

        //正则表达式匹配
        const regCheck = isChecked("regCheck");
        //整词匹配
        const wordCheck = isChecked("wordCheck");
        //区分大小写匹配
        const caseCheck = isChecked("caseCheck");

        let regExpFlags = "g";
        if (!caseCheck) {
            searchText = searchText.toLowerCase();
            regExpFlags += "i";
        }

        const addResult = (r, c) => {
            if (!(r + "_" + c in obj)) {
                obj[r + "_" + c] = 0;
                arr.push({ r: r, c: c });
            }
        };

        for (let s = 0; s < range.length; s++) {
            const r1 = range[s].row[0],
                r2 = range[s].row[1];
            const c1 = range[s].column[0],
                c2 = range[s].column[1];

            for (let r = r1; r <= r2; r++) {
                for (let c = c1; c <= c2; c++) {
                    const cell = Store.sheetData[r][c];

                    if (cell != null) {
                        let value = valueShowEs(r, c, Store.sheetData);

                        if (value == 0) {
                            value = value.toString();
                        }

                        if (value != null && value != "") {
                            let wasFound = false;
                            value = value.toString();
                            value = caseCheck ? value : value.toLowerCase();

                            if (wordCheck) {
                                //整词
                                wasFound = searchText == value;
                            } else if (regCheck) {
                                //正则表达式
                                let reg = new RegExp(func_methods.getRegExpStr(searchText), regExpFlags);
                                wasFound = reg.test(value);
                            } else {
                                wasFound = ~value.indexOf(searchText);
                            }

                            wasFound && addResult(r, c);
                        }
                    }
                }
            }
        }

        return arr;
    },
    replace: function() {
        let _this = this;

        const _locale = locale();
        const locale_findAndReplace = _locale.findAndReplace;

        if (!Store.allowEdit) {
            tooltip.info(locale_findAndReplace.modeTip, "");
            return;
        }

        let searchText = document.querySelector("#luckysheet-search-replace #searchInput input")?.value;
        if (searchText == "" || searchText == null) {
            if (isEditMode()) {
                alert(locale_findAndReplace.searchInputTip);
            } else {
                tooltip.info(locale_findAndReplace.searchInputTip, "");
            }

            return;
        }

        let range;
        if (
            Store.luckysheet_select_save.length == 0 ||
            (Store.luckysheet_select_save.length == 1 &&
                Store.luckysheet_select_save[0].row[0] == Store.luckysheet_select_save[0].row[1] &&
                Store.luckysheet_select_save[0].column[0] == Store.luckysheet_select_save[0].column[1])
        ) {
            range = [
                {
                    row: [0, Store.sheetData.length - 1],
                    column: [0, Store.sheetData[0].length - 1],
                },
            ];
        } else {
            range = structuredClone(Store.luckysheet_select_save);
        }

        let searchIndexArr = _this.getSearchIndexArr(searchText, range);

        if (searchIndexArr.length == 0) {
            if (isEditMode()) {
                alert(locale_findAndReplace.noReplceTip);
            } else {
                tooltip.info(locale_findAndReplace.noReplceTip, "");
            }

            return;
        }

        let count = null;

        let last = getLastSelection();
        let _focus = getFocusCell();
        let rf = _focus.row;
        let cf = _focus.col;

        for (let i = 0; i < searchIndexArr.length; i++) {
            if (searchIndexArr[i].r == rf && searchIndexArr[i].c == cf) {
                count = i;
                break;
            }
        }

        if (count == null) {
            if (searchIndexArr.length == 0) {
                if (isEditMode()) {
                    alert(locale_findAndReplace.noMatchTip);
                } else {
                    tooltip.info(locale_findAndReplace.noMatchTip, "");
                }

                return;
            } else {
                count = 0;
            }
        }

        //正则表达式匹配
        let regCheck = false;
        let _regCb = document.querySelector("#luckysheet-search-replace #regCheck input[type='checkbox']");
        if (_regCb && _regCb.checked) {
            regCheck = true;
        }

        //整词匹配
        let wordCheck = false;
        let _wordCb = document.querySelector("#luckysheet-search-replace #wordCheck input[type='checkbox']");
        if (_wordCb && _wordCb.checked) {
            wordCheck = true;
        }

        //区分大小写匹配
        let caseCheck = false;
        let _caseCb = document.querySelector("#luckysheet-search-replace #caseCheck input[type='checkbox']");
        if (_caseCb && _caseCb.checked) {
            caseCheck = true;
        }

        let replaceText = document.querySelector("#luckysheet-search-replace #replaceInput input")?.value;

        let d = editor.deepCopyFlowData(Store.sheetData);

        let r, c;
        if (wordCheck) {
            r = searchIndexArr[count].r;
            c = searchIndexArr[count].c;

            let v = replaceText;

            setcellvalue(r, c, d, v);
        } else {
            let reg;
            if (caseCheck) {
                reg = new RegExp(func_methods.getRegExpStr(searchText), "g");
            } else {
                reg = new RegExp(func_methods.getRegExpStr(searchText), "ig");
            }

            r = searchIndexArr[count].r;
            c = searchIndexArr[count].c;

            let v = valueShowEs(r, c, d)
                .toString()
                .replace(reg, replaceText);

            setcellvalue(r, c, d, v);
        }

        Store.luckysheet_select_save = [{ row: [r, r], column: [c, c] }];

        if (document.querySelector("#luckysheet-search-replace #searchAllbox")?.offsetWidth > 0) {
            const _elSearchBox1 = document.querySelector("#luckysheet-search-replace #searchAllbox"); if (_elSearchBox1) _elSearchBox1.style.display = 'none';
        }

        jfrefreshgrid(d, Store.luckysheet_select_save);
        selectHightlightShow();

        let scroll = getScrollPosition();
        let scrollLeft = scroll.scrollLeft,
            scrollTop = scroll.scrollTop;
        let winH = cellMain.getHeight(),
            winW = cellMain.getWidth();

        let row = Store.visibledatarow[r],
            row_pre = r - 1 == -1 ? 0 : Store.visibledatarow[r - 1];
        let col = Store.visibledatacolumn[c],
            col_pre = c - 1 == -1 ? 0 : Store.visibledatacolumn[c - 1];

        if (col - scrollLeft - winW + 20 > 0) {
            scrollBarX.setScrollLeft(col - winW + 20);
        } else if (col_pre - scrollLeft - 20 < 0) {
            scrollBarX.setScrollLeft(col_pre - 20);
        }

        if (row - scrollTop - winH + 20 > 0) {
            scrollBarY.setScrollTop(row - winH + 20);
        } else if (row_pre - scrollTop - 20 < 0) {
            scrollBarY.setScrollTop(row_pre - 20);
        }
    },
    replaceAll: function() {
        let _this = this;

        const _locale = locale();
        const locale_findAndReplace = _locale.findAndReplace;

        if (!Store.allowEdit) {
            tooltip.info(locale_findAndReplace.modeTip, "");
            return;
        }

        let searchText = document.querySelector("#luckysheet-search-replace #searchInput input")?.value;
        if (searchText == "" || searchText == null) {
            if (isEditMode()) {
                alert(locale_findAndReplace.searchInputTip);
            } else {
                tooltip.info(locale_findAndReplace.searchInputTip, "");
            }

            return;
        }

        let range;
        if (
            Store.luckysheet_select_save.length == 0 ||
            (Store.luckysheet_select_save.length == 1 &&
                Store.luckysheet_select_save[0].row[0] == Store.luckysheet_select_save[0].row[1] &&
                Store.luckysheet_select_save[0].column[0] == Store.luckysheet_select_save[0].column[1])
        ) {
            range = [
                {
                    row: [0, Store.sheetData.length - 1],
                    column: [0, Store.sheetData[0].length - 1],
                },
            ];
        } else {
            range = structuredClone(Store.luckysheet_select_save);
        }

        let searchIndexArr = _this.getSearchIndexArr(searchText, range);

        if (searchIndexArr.length == 0) {
            if (isEditMode()) {
                alert(locale_findAndReplace.noReplceTip);
            } else {
                tooltip.info(locale_findAndReplace.noReplceTip, "");
            }

            return;
        }

        //正则表达式匹配
        let regCheck = false;
        let _regCb2 = document.querySelector("#luckysheet-search-replace #regCheck input[type='checkbox']");
        if (_regCb2 && _regCb2.checked) {
            regCheck = true;
        }

        //整词匹配
        let wordCheck = false;
        let _wordCb2 = document.querySelector("#luckysheet-search-replace #wordCheck input[type='checkbox']");
        if (_wordCb2 && _wordCb2.checked) {
            wordCheck = true;
        }

        //区分大小写匹配
        let caseCheck = false;
        let _caseCb2 = document.querySelector("#luckysheet-search-replace #caseCheck input[type='checkbox']");
        if (_caseCb2 && _caseCb2.checked) {
            caseCheck = true;
        }

        let replaceText = document.querySelector("#luckysheet-search-replace #replaceInput input")?.value;

        let d = editor.deepCopyFlowData(Store.sheetData);
        let replaceCount = 0;
        if (wordCheck) {
            for (let i = 0; i < searchIndexArr.length; i++) {
                let r = searchIndexArr[i].r;
                let c = searchIndexArr[i].c;

                let v = replaceText;

                setcellvalue(r, c, d, v);

                range.push({ row: [r, r], column: [c, c] });
                replaceCount++;
            }
        } else {
            let reg;
            if (caseCheck) {
                reg = new RegExp(func_methods.getRegExpStr(searchText), "g");
            } else {
                reg = new RegExp(func_methods.getRegExpStr(searchText), "ig");
            }

            for (let i = 0; i < searchIndexArr.length; i++) {
                let r = searchIndexArr[i].r;
                let c = searchIndexArr[i].c;

                let v = valueShowEs(r, c, d)
                    .toString()
                    .replace(reg, replaceText);

                setcellvalue(r, c, d, v);

                range.push({ row: [r, r], column: [c, c] });
                replaceCount++;
            }
        }

        if (document.querySelector("#luckysheet-search-replace #searchAllbox")?.offsetWidth > 0) {
            const _elSearchBox2 = document.querySelector("#luckysheet-search-replace #searchAllbox"); if (_elSearchBox2) _elSearchBox2.style.display = 'none';
        }

        jfrefreshgrid(d, range);

        Store.luckysheet_select_save = structuredClone(range);
        selectHightlightShow();

        let succeedInfo = replaceHtml(locale_findAndReplace.successTip, {
            xlength: replaceCount,
        });
        if (isEditMode()) {
            alert(succeedInfo);
        } else {
            tooltip.info(succeedInfo, "");
        }
    },
};

export default luckysheetSearchReplace;
