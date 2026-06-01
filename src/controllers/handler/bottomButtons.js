import luckysheetConfigsetting from "../luckysheetConfigsetting";
import {
    selectHightlightShow,
    selectIsOverlap,
    selectionCopyShow,
    luckysheet_count_show,
    selectHelpboxFill,
} from "../select";

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
import {  isEditMode } from "../../global/validate";
import { luckysheetextendtable } from "../../global/extend";
import tooltip from "../../global/tooltip";
import Store from "../../store";
import context from "./context";
import scrollBarY from '../../ui/scrollBarY.js';
import rightClickMenu from '../../ui/rightClickMenu.js';

export default function bottomButtons() {
    document.querySelectorAll("#luckysheet-bottom-add-row, #luckysheet-bottom-add-row-input, #luckysheet-bottom-return-top").forEach(function(el) {
        el.addEventListener("mousedown", function(e) { e.stopPropagation(); });
        el.addEventListener("dblclick", function(e) { e.stopPropagation(); });
        el.addEventListener("mouseup", function(e) { e.stopPropagation(); });
    });

    const _addRow = document.getElementById("luckysheet-bottom-add-row");
    if (_addRow) _addRow.addEventListener("click", function(e) {
        rightClickMenu.hide();
        luckysheetContainerFocus();

        let value = document.getElementById("luckysheet-bottom-add-row-input").value;

        if (value == "") {
            value = luckysheetConfigsetting.addRowCount || 100;
        }

        if (isNaN(parseInt(value))) {
            if (isEditMode()) {
                alert(context.locale_info.tipInputNumber);
            } else {
                tooltip.info("error", context.locale_info.tipInputNumber);
            }
            return;
        }

        value = parseInt(value);
        if (value < 1 || value > 100) {
            if (isEditMode()) {
                alert(context.locale_info.tipInputNumberLimit);
            } else {
                tooltip.info("error", context.locale_info.tipInputNumberLimit);
            }
            return;
        }

        luckysheetextendtable("row", Store.sheetData.length - 1, value);
    });

    const _returnTop = document.getElementById("luckysheet-bottom-return-top");
    if (_returnTop) _returnTop.addEventListener("click", function(e) {
        scrollBarY.setScrollTop(0);
    });
}
