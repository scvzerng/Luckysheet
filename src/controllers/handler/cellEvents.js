import luckysheetsizeauto from "../resize";
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
import Store from "../../store";
import menuButton from "../menuButton";

import { handleCellMousedown } from './cellEventsSub/handleCellMousedown.js';
import { handleCellMouseup } from './cellEventsSub/handleCellMouseup.js';
import { handleCellDblclick } from './cellEventsSub/handleCellDblclick.js';

export default function cellEvents() {
    $(window).resize(function() {
        let luckysheetDocument = document.getElementById(Store.container);
        if (luckysheetDocument) {
            luckysheetsizeauto();
        }
    });

    $("#luckysheet-rich-text-editor").mouseup(function(e) {
        menuButton.inputMenuButtonFocus(e.target);
    });

    $("#luckysheet-cell-main, #luckysheetTableContent")
        .mousedown(function(event) {
            handleCellMousedown(event);
        })
        .mouseup(function(event) {
            handleCellMouseup(event);
        })
        .dblclick(function(event) {
            handleCellDblclick(event);
        });
}
