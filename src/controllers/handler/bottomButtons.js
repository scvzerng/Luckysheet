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
    $("#luckysheet-bottom-add-row, #luckysheet-bottom-add-row-input, #luckysheet-bottom-return-top").on(
        "mousedown dblclick mouseup",
        function(e) {
            e.stopPropagation();
        },
    );

    //底部添加行按钮
    $("#luckysheet-bottom-add-row").on("click", function(e) {
        rightClickMenu.hide();
        luckysheetContainerFocus();

        let $t = $(this),
            value = $("#luckysheet-bottom-add-row-input").val();

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

        luckysheetextendtable("row", Store.flowdata.length - 1, value);
    });

    $("#luckysheet-bottom-return-top").on("click", function(e) {
        scrollBarY.setScrollTop(0);
    });
}
