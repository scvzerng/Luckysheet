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
import rightClickMenu from "../../ui/rightClickMenu.js";

export default function contextMenu() {
    document.querySelector(".luckysheet-grid-container").addEventListener("contextmenu", function(e) {
        e.preventDefault();
    });
    rightClickMenu.el.addEventListener("contextmenu", function(e) {
        e.preventDefault();
    });
}
