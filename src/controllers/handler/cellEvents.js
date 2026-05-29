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
import richTextEditor from '../../ui/richTextEditor.js';
import cellMain from '../../ui/cellMain.js';
import canvasContext from '../../ui/canvasContext.js';

export default function cellEvents() {
    window.addEventListener('resize', function() {
        let luckysheetDocument = document.getElementById(Store.container);
        if (luckysheetDocument) {
            luckysheetsizeauto();
        }
    });

    richTextEditor.onMouseup(function(e) {
        menuButton.inputMenuButtonFocus(e.target);
    });

    cellMain.onCellMousedown(function(event) {
        handleCellMousedown(event);
    });
    cellMain.onCellMouseup(function(event) {
        handleCellMouseup(event);
    });
    cellMain.onCellDblclick(function(event) {
        handleCellDblclick(event);
    });
    canvasContext.el.addEventListener("mousedown", function(event) {
        handleCellMousedown(event);
    });
    canvasContext.el.addEventListener("mouseup", function(event) {
        handleCellMouseup(event);
    });
    canvasContext.el.addEventListener("dblclick", function(event) {
        handleCellDblclick(event);
    });
}
