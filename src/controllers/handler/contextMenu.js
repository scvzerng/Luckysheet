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

export default function contextMenu() {
    //禁止浏览器 右键默认菜单
    $(".luckysheet-grid-container, #luckysheet-rightclick-menu").on("contextmenu", function(e) {
        e.preventDefault();
    });
}
