﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿import sheetmanage from './sheetmanage';
import { sheetselectlistitemHTML, sheetselectlistHTML, keycode } from './constant';
import {
    replaceHtml,
    mouseclickposition,
} from '../utils/util';
import { getSheetIndex } from '../methods/get';
import { isEditMode } from '../global/validate';
import formula from '../global/formula';
import cleargridelement from '../global/cleargridelement';
import tooltip from '../global/tooltip';
import {selectTextDom} from '../global/cursorPos';
import locale from '../locale/locale';
import Store from '../store';
import { isInputBoxActive, resetInputBoxStyle } from '../utils/domUtils.js';
import luckysheetConfigsetting from './luckysheetConfigsetting';
import {pagerInit} from '../global/api'
import method from '../global/method';
import luckysheetsizeauto from './resize';
import inputBox from '../ui/inputBox.js';
import inputBoxIndex from '../ui/inputBoxIndex.js';
import sheetContainer from '../ui/sheetContainer.js';
import { createColorPicker, getPicker, STANDARD_PALETTE, SHEET_TAB_PALETTE } from '../components/ColorPicker';
import '../components/ColorPicker/colorPicker.css';

//表格底部名称栏区域 相关事件（增、删、改、隐藏显示、颜色等等）
let isInitialSheetConfig = false, luckysheetcurrentSheetitem = null, jfdbclicklagTimeout = null,oldSheetFileName = "";
function showsheetconfigmenu() {
    if (!isInitialSheetConfig) {
        isInitialSheetConfig = true;
        const _locale = locale();
        let locale_toolbar = _locale.toolbar;
        createColorPicker(document.getElementById("luckysheetsheetconfigcolorur"), {
            showPalette: true,
            preferredFormat: "hex",
            clickoutFiresChange: false,
            showInitial: true,
            showInput: true,
            flat: true,
            hideAfterPaletteSelect: false,
            showSelectionPalette: true,
            maxPaletteSize: 10,
            cancelText: _locale.sheetconfig.cancelText,
            chooseText: _locale.sheetconfig.chooseText,
            togglePaletteMoreText: locale_toolbar.toolMore,
            togglePaletteLessText: locale_toolbar.toolLess,
            clearText: locale_toolbar.clearText,
            noColorSelectedText: locale_toolbar.noColorSelectedText,
            palette: SHEET_TAB_PALETTE,
            change: function (color) {
                let $input = this;
                if (color != null) {
                    color = color.toHexString();
                }
                else {
                    color = "rgb(0, 0, 0)";
                }

                let oldcolor = null;
                if(luckysheetcurrentSheetitem.querySelector(".luckysheet-sheets-item-color") !== null){
                    oldcolor = getComputedStyle(luckysheetcurrentSheetitem.querySelector(".luckysheet-sheets-item-color")).backgroundColor;
                }

                let _colorEl = luckysheetcurrentSheetitem.querySelector(".luckysheet-sheets-item-color");
                if (_colorEl) _colorEl.remove();
                luckysheetcurrentSheetitem.insertAdjacentHTML('beforeend', '<div class="luckysheet-sheets-item-color" style=" position: absolute; width: 100%; height: 3px; bottom: 0px; left: 0px; background-color: ' + color + ';"></div>');
                let index = getSheetIndex(Store.currentSheetIndex);
                Store.luckysheetfile[index].color = color;

                if (Store.clearjfundo) {
                    let redo = {};
                    redo["type"] = "sheetColor";
                    redo["sheetIndex"] = Store.currentSheetIndex;

                    redo["oldcolor"] = oldcolor;
                    redo["color"] = color;

                    Store.jfundo.length = 0;
                    Store.jfredo.push(redo);
                }
            }
        });

        document.getElementById("luckysheetsheetconfigcolorreset").addEventListener("click", function () {
            let oldcolor = null;
            if(luckysheetcurrentSheetitem.querySelector(".luckysheet-sheets-item-color") !== null){
                oldcolor = getComputedStyle(luckysheetcurrentSheetitem.querySelector(".luckysheet-sheets-item-color")).backgroundColor;
            }

            let _colorEl2 = luckysheetcurrentSheetitem.querySelector(".luckysheet-sheets-item-color");
            if (_colorEl2) _colorEl2.remove();
            let index = getSheetIndex(Store.currentSheetIndex);
            Store.luckysheetfile[index].color = null;

            if (Store.clearjfundo) {
                let redo = {};
                redo["type"] = "sheetColor";
                redo["sheetIndex"] = Store.currentSheetIndex;

                redo["oldcolor"] = oldcolor;
                redo["color"] = null;

                Store.jfundo.length = 0;
                Store.jfredo.push(redo);
            }
        });
    }

    let index = getSheetIndex(Store.currentSheetIndex);
    if (Store.luckysheetfile[index].color != null && Store.luckysheetfile[index].color !== null) {
        getPicker(document.getElementById("luckysheetsheetconfigcolorur"))?.set(Store.luckysheetfile[index].color);

    }

    document.getElementById("luckysheetsheetconfigcolorur").parentElement.querySelector("span, div, button, input, a").classList.add("luckysheet-mousedown-cancel");

    // 如果全部按钮设置了隐藏，则不显示
    const config = luckysheetConfigsetting.sheetRightClickConfig;
    // if(!config.delete && !config.copy && !config.rename && !config.color && !config.hide && !config.move){
    if(Object.values(config).every(ele=> !ele)){
        return;
    }

    setTimeout(function(){
        mouseclickposition(document.getElementById("luckysheet-rightclick-sheet-menu"), luckysheetcurrentSheetitem.getBoundingClientRect().left + luckysheetcurrentSheetitem.offsetWidth, luckysheetcurrentSheetitem.getBoundingClientRect().top + window.pageYOffset - 18, "leftbottom");
    },1);
}

let luckysheetsheetrightclick = function ($t, $cur, e) {
        //引用单元格范围时，禁止切换sheer
    clearTimeout(jfdbclicklagTimeout);
    if ($cur.classList.contains("luckysheet-sheets-item-name") && $cur.getAttribute("contenteditable") == "true") {
        return;
    }
    if (formula.rangestart || formula.rangedrag_column_start || formula.rangedrag_row_start || formula.israngeseleciton()) {
        setTimeout(function () {
            formula.setCaretPosition(formula.rangeSetValueTo, 0, formula.rangeSetValueTo.textContent.length);
            formula.createRangeHightlight();
            inputBoxIndex.setSheetPrefix("<span class='luckysheet-input-box-index-sheettxt'>" + sheetmanage.getSheetName(formula.rangetosheet) + "!</span>");
            inputBoxIndex.setCss({"left": inputBox.getCss("left"), "top": (parseInt(inputBox.getCss("top")) - 20) + "px", "z-index": inputBox.getCss("z-index")});
        }, 1);
    }
    else {
        //保存正在编辑的单元格内容
        if (isInputBoxActive()) {
            formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
        }

        resetInputBoxStyle();
        document.querySelector("#luckysheet-formula-functionrange .luckysheet-formula-functionrange-highlight")?.remove();
    }

    document.querySelector("#luckysheet-sheet-area div.luckysheet-sheets-item").classList.remove("luckysheet-sheets-item-active");
    $t.classList.add("luckysheet-sheets-item-active");
    cleargridelement(e);
    sheetmanage.changeSheet($t.dataset.index);

    document.querySelector("#luckysheet-sheet-list, #luckysheet-rightclick-sheet-menu").style.display = 'none';

    if ($cur.classList.contains("luckysheet-sheets-item-menu") || $cur.classList.contains("fa-sort-desc") || e.which == "3") {
        luckysheetcurrentSheetitem = $cur.closest(".luckysheet-sheets-item");
        showsheetconfigmenu();
    }
    luckysheetsizeauto();
}

export function initialSheetBar(){
    const _locale = locale();
    const locale_sheetconfig = _locale.sheetconfig;
    isInitialSheetConfig = false

    document.getElementById("luckysheet-sheet-area").addEventListener("mousedown", function (e) {
        let _target = e.target.closest("div.luckysheet-sheets-item");
        if (!_target) return;
        if(isEditMode()){
            return;
        }

        let $t = _target, $cur = e.target, $item = $cur.closest(".luckysheet-sheets-item");

        if (e.which == "3") {
            setTimeout(() => {
                luckysheetsheetrightclick($t, $cur, e);
                luckysheetcurrentSheetitem = $item;
                showsheetconfigmenu();
                return;
            }, 0);
        }

        if ($item.classList.contains("luckysheet-sheets-item-active") && $item.querySelector(".luckysheet-sheets-item-name").getAttribute("contenteditable") == "false") {
            jfdbclicklagTimeout = setTimeout(function () {
                Store.luckysheet_sheet_move_status = true;
                Store.luckysheet_sheet_move_data = {};
                Store.luckysheet_sheet_move_data.widthlist = [];

                let visibleItems = Array.from(document.querySelectorAll("#luckysheet-sheet-area div.luckysheet-sheets-item")).filter(el => el.offsetWidth > 0);
                visibleItems.forEach(function(el, i) {
                    if (i == 0) {
                        Store.luckysheet_sheet_move_data.widthlist.push(parseInt(el.offsetWidth));
                    }
                    else {
                        Store.luckysheet_sheet_move_data.widthlist.push(parseInt(el.offsetWidth) + Store.luckysheet_sheet_move_data.widthlist[i - 1]);
                    }
                });

                Store.luckysheet_sheet_move_data.curindex = Array.from($item.parentElement.children).indexOf($item);
                let x = e.pageX;
                Store.luckysheet_sheet_move_data.curleft = x - $item.getBoundingClientRect().left - window.pageXOffset;
                Store.luckysheet_sheet_move_data.pageX = x;
                Store.luckysheet_sheet_move_data.activeobject = $item;
                Store.luckysheet_sheet_move_data.cursorobject = $cur;
                let $itemclone = $item.cloneNode(true);
                $itemclone.style.visibility = "hidden";
                $itemclone.setAttribute("id", "luckysheet-sheets-item-clone");
                $item.insertAdjacentElement('afterend', $itemclone);
                Object.assign($item.style, { "position": "absolute", "opacity": 0.8, "cursor": "move", "transition": "initial", "zIndex": 10 });
            }, 200);
        }
    });
    document.getElementById("luckysheet-sheet-area").addEventListener("click", function (e) {
        let _target = e.target.closest("div.luckysheet-sheets-item");
        if (!_target) return;
        if(isEditMode()){
            return;
        }

        let $t = _target, $cur = e.target;
        luckysheetsheetrightclick($t, $cur, e);
    });

    let luckysheetsheetnameeditor = function ($t) {
        if(Store.allowEdit===false || !luckysheetConfigsetting.sheetRightClickConfig.rename){
            return;
        }
        $t.setAttribute("contenteditable", "true");
        $t.classList.add("luckysheet-mousedown-cancel");
        $t.dataset.oldtxt = $t.textContent;

        setTimeout(function () {
            selectTextDom($t);
        }, 1);
    }

    document.getElementById("luckysheet-sheet-area").addEventListener("dblclick", function (e) {
        let _target = e.target.closest("span.luckysheet-sheets-item-name");
        if (!_target) return;
        luckysheetsheetnameeditor(_target);
    });

    let compositionFlag = true;
    document.getElementById("luckysheet-sheet-area").addEventListener("compositionstart", function (e) {
        let _target = e.target.closest("span.luckysheet-sheets-item-name");
        if (!_target) return;
        compositionFlag = false;
    });
    document.getElementById("luckysheet-sheet-area").addEventListener("compositionend", function (e) {
        let _target = e.target.closest("span.luckysheet-sheets-item-name");
        if (!_target) return;
        compositionFlag = true;
    });
    document.getElementById("luckysheet-sheet-area").addEventListener("input", function (e) {
        let _target = e.target.closest("span.luckysheet-sheets-item-name");
        if (!_target) return;
        if(Store.allowEdit===false){
            return;
        }

        if(Store.limitSheetNameLength === false){
            return
        }

        let maxLength = Store.defaultSheetNameMaxLength;
        if(maxLength  === 0){
            return
        }

        setTimeout( ()=> {
            if (compositionFlag) {

                if (_target.textContent.length >= maxLength) {
                    setTimeout(() => {
                        _target.textContent = _target.textContent.substring(0, maxLength);

                        let range = window.getSelection();
                        range.selectAllChildren(_target);
                        range.collapseToEnd();
                    }, 0);
                 }
            }
        }, 0);
    });

    document.getElementById("luckysheet-sheet-area").addEventListener("blur", function (e) {
        let _target = e.target.closest("span.luckysheet-sheets-item-name");
        if (!_target) return;
        if(Store.allowEdit===false){
            return;
        }

        let $t = _target;
        let txt = $t.textContent, oldtxt = $t.dataset.oldtxt;

        if(0 === _target.textContent.length){
            tooltip.info("", locale_sheetconfig.sheetNamecannotIsEmptyError);
            $t.textContent = oldtxt;
            $t.setAttribute("contenteditable", "false");
            return;
        }

        if(txt.length>31 || txt.charAt(0)=="'" || txt.charAt(txt.length-1)=="'" || /[：\:\\\/？\?\*\[\]]+/.test(txt)){
            tooltip.info("", locale_sheetconfig.sheetNameSpecCharError);
            $t.textContent = oldtxt;
            $t.setAttribute("contenteditable", "false");
            return;
        }

        let index = getSheetIndex(Store.currentSheetIndex);
        for (let i = 0; i < Store.luckysheetfile.length; i++) {
            if (index != i && Store.luckysheetfile[i].name == txt) {
                if(isEditMode()){
                    alert(locale_sheetconfig.tipNameRepeat);
                }
                else{
                    tooltip.info("", locale_sheetconfig.tipNameRepeat);
                }
                $t.textContent = oldtxt;
                $t.setAttribute("contenteditable", "false");
                return;
            }
        }

        sheetmanage.sheetArrowShowAndHide();

        Store.luckysheetfile[index].name = txt;

        $t.setAttribute("contenteditable", "false");
        $t.classList.remove("luckysheet-mousedown-cancel");

        if (Store.clearjfundo) {
            let redo = {};
            redo["type"] = "sheetName";
            redo["sheetIndex"] = Store.currentSheetIndex;

            redo["oldtxt"] = oldtxt;
            redo["txt"] = txt;

            Store.jfundo.length = 0;
            Store.jfredo.push(redo);
        }
        method.createHookFunction('sheetEditNameAfter', {
            i: Store.luckysheetfile[index].index,
            oldName: oldtxt, newName: txt 
        });
    }, true);

    document.getElementById("luckysheet-sheet-area").addEventListener("keydown", function (e) {
        let _target = e.target.closest("span.luckysheet-sheets-item-name");
        if (!_target) return;
        if(Store.allowEdit===false){
            return;
        }
        let kcode = e.keyCode;
        let $t = _target;
        if (kcode == keycode.ENTER) {
            let index = getSheetIndex(Store.currentSheetIndex);
            oldSheetFileName = Store.luckysheetfile[index].name || oldSheetFileName;
            Store.luckysheetfile[index].name = $t.textContent;
            $t.setAttribute("contenteditable", "false");
        }
    });

    document.getElementById("luckysheetsheetconfigrename").addEventListener("click", function () {
        var $name = luckysheetcurrentSheetitem.querySelector("span.luckysheet-sheets-item-name")
        // 钩子 sheetEditNameBefore
        if (!method.createHookFunction('sheetEditNameBefore', { i: luckysheetcurrentSheetitem.dataset.index , name: $name.textContent })){
            return;
        }
        luckysheetsheetnameeditor(luckysheetcurrentSheetitem.querySelector("span.luckysheet-sheets-item-name"));
        resetInputBoxStyle();
        document.querySelector("#luckysheet-sheet-list, #luckysheet-rightclick-sheet-menu").style.display = 'none';
    });

    document.getElementById("luckysheetsheetconfigshow").addEventListener("click", function () {
        document.getElementById("luckysheet-sheets-m").click();
        resetInputBoxStyle();
        document.getElementById("luckysheet-rightclick-sheet-menu").style.display = 'none';
    });

    document.getElementById("luckysheetsheetconfigmoveleft").addEventListener("click", function () {
        let _prev = luckysheetcurrentSheetitem.previousElementSibling;
        while (_prev && _prev.offsetWidth === 0) { _prev = _prev.previousElementSibling; }
        if (_prev) {
            _prev.parentElement.insertBefore(luckysheetcurrentSheetitem, _prev);
            sheetmanage.reOrderAllSheet();
        }
        resetInputBoxStyle();
        document.querySelector("#luckysheet-sheet-list, #luckysheet-rightclick-sheet-menu").style.display = 'none';
    });

    document.getElementById("luckysheetsheetconfigmoveright").addEventListener("click", function () {
        let _next = luckysheetcurrentSheetitem.nextElementSibling;
        while (_next && _next.offsetWidth === 0) { _next = _next.nextElementSibling; }
        if (_next) {
            _next.parentElement.insertBefore(luckysheetcurrentSheetitem, _next.nextElementSibling);
            sheetmanage.reOrderAllSheet();
        }
        resetInputBoxStyle();
        document.querySelector("#luckysheet-sheet-list, #luckysheet-rightclick-sheet-menu").style.display = 'none';
    });

    document.getElementById("luckysheetsheetconfigdelete").addEventListener("click", function (e) {
        document.querySelector("#luckysheet-sheet-list, #luckysheet-rightclick-sheet-menu").style.display = 'none';

        if(sheetContainer.findVisible(".luckysheet-sheets-item").length <= 1){
            if(isEditMode()){
                alert(locale_sheetconfig.noMoreSheet);
            }
            else{
                tooltip.info(locale_sheetconfig.noMoreSheet, "");
            }

            return;
        }

        let index = getSheetIndex(Store.currentSheetIndex);

        tooltip.confirm(locale_sheetconfig.confirmDelete+"【" + Store.luckysheetfile[index].name + "】？", "<span style='color:#9e9e9e;font-size:12px;'>"+locale_sheetconfig.redoDelete+"</span>", function () {
            sheetmanage.deleteSheet(luckysheetcurrentSheetitem.dataset.index);
        }, null);

        resetInputBoxStyle();
    });

    document.getElementById("luckysheetsheetconfigcopy").addEventListener("click", function (e) {
        sheetmanage.copySheet(luckysheetcurrentSheetitem.dataset.index, e);
        resetInputBoxStyle();
        document.querySelector("#luckysheet-sheet-list, #luckysheet-rightclick-sheet-menu").style.display = 'none';
    });

    document.getElementById("luckysheetsheetconfighide").addEventListener("click", function () {
        if (Array.from(document.querySelectorAll("#luckysheet-sheet-area div.luckysheet-sheets-item")).filter(el => el.offsetWidth > 0).length == 1) {
            if(isEditMode()){
                alert(locale_sheetconfig.noHide);
            }
            else{
                tooltip.info("", locale_sheetconfig.noHide);
            }
            return;
        }
        sheetmanage.setSheetHide(luckysheetcurrentSheetitem.dataset.index);
        resetInputBoxStyle();
        document.querySelector("#luckysheet-sheet-list, #luckysheet-rightclick-sheet-menu").style.display = 'none';
    });

    document.getElementById("luckysheet-sheets-add").addEventListener("click", function (e) {
        //保存正在编辑的单元格内容
        if (isInputBoxActive()) {
            formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
        }

        sheetmanage.addNewSheet(e);
        sheetmanage.locationSheet();
        resetInputBoxStyle();
    });

    let sheetscrollani = null, sheetscrollstart = 0, sheetscrollend = 0, sheetscrollstep = 150;
    document.getElementById("luckysheet-sheets-leftscroll").addEventListener("click", function () {
        sheetscrollstart = sheetContainer.getScrollLeft();
        sheetscrollend = sheetContainer.getScrollLeft() - sheetscrollstep;

        if (sheetscrollend <= 0) {
            document.querySelector("#luckysheet-sheet-container .docs-sheet-fade-left").style.display = 'none';
        }
        document.querySelector("#luckysheet-sheet-container .docs-sheet-fade-right").style.display = '';

        clearInterval(sheetscrollani);
        sheetscrollani = setInterval(function () {
            sheetscrollstart -= 4;
            sheetContainer.setScrollLeft(sheetscrollstart);
            if (sheetscrollstart <= sheetscrollend) {
                clearInterval(sheetscrollani);
            }
        }, 1);
    });

    document.getElementById("luckysheet-sheets-rightscroll").addEventListener("click", function () {
        sheetscrollstart = sheetContainer.getScrollLeft();
        sheetscrollend = sheetContainer.getScrollLeft() + sheetscrollstep;

        if (sheetscrollstart > 0) {
            document.querySelector("#luckysheet-sheet-container .docs-sheet-fade-right").style.display = 'none';
        }
        document.querySelector("#luckysheet-sheet-container .docs-sheet-fade-left").style.display = '';

        clearInterval(sheetscrollani);
        sheetscrollani = setInterval(function () {
            sheetscrollstart += 4;
            sheetContainer.setScrollLeft(sheetscrollstart);
            if (sheetscrollstart >= sheetscrollend) {
                clearInterval(sheetscrollani);
            }
        }, 1);
    });

    let initialOpenSheet = true;
    document.getElementById("luckysheet-sheets-m").addEventListener("click", function (e) {
        //保存正在编辑的单元格内容
        if (isInputBoxActive()) {
            formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
        }

        document.getElementById("luckysheet-sheet-list").innerHTML = "";

        let item = "";
        for (let i = 0; i < Store.luckysheetfile.length; i++) {
            let f = Store.luckysheetfile[i], icon = '', style = "";
            if (f["status"] == 1) {
                icon = '<i class="fa fa-check" aria-hidden="true"></i>';
            }

            if (f["hide"] == 1) {
                icon = '<i class="fa fa-low-vision" aria-hidden="true"></i>';
                style += "color:#BBBBBB;";
            }

            if (f["color"] != null && f["color"] !== null) {
                style += "border-right:4px solid " + f["color"] + ";";
            }

            item += replaceHtml(sheetselectlistitemHTML, { "index": f["index"], "name": f["name"], "icon": icon, "style": style });
        }

        if (initialOpenSheet) {
            document.getElementById(Store.container).insertAdjacentHTML('beforeend', replaceHtml(sheetselectlistHTML, { "item": item }));
            document.getElementById("luckysheet-sheet-list").addEventListener("click", function (e) {
                let _target = e.target.closest(".luckysheet-cols-menuitem");
                if (!_target) return;
                if(isEditMode()){
                    return;
                }

                let $item = _target, index = $item.dataset.index;

                if ($item.dataset.index != Store.currentSheetIndex) {
                    sheetmanage.setSheetShow(index);
                    sheetmanage.locationSheet();
                }
            });

            initialOpenSheet = false;
        }
        else {
            const _el = document.getElementById("luckysheet-sheet-list"); if (_el) _el.innerHTML = item;
        }

        let $t = document.getElementById("luckysheet-sheet-list");

        let left = this.getBoundingClientRect().left - document.getElementById(Store.container).getBoundingClientRect().left;
        let bottom = this.offsetHeight + document.getElementById("luckysheet-sta-content").offsetHeight + 12;
        Object.assign($t.style, {left: left + 'px', bottom: bottom + 'px'}); $t.style.display = '';
        resetInputBoxStyle();
    });

    // 初始化分页器
    if (luckysheetConfigsetting.pager) {
        pagerInit(luckysheetConfigsetting.pager)
    }

}
