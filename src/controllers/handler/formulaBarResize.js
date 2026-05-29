import menuButton from "../menuButton";
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
import formula from "../../global/formula";
import Store from "../../store";

export default function formulaBarResize() {
    document.getElementById("luckysheet-wa-calculate-size").addEventListener("mousedown", function(e) {
        let y = e.pageY;
        formula.functionResizeData.y = y;
        formula.functionResizeStatus = true;
        formula.functionResizeData.calculatebarHeight = Store.calculatebarHeight;
        if (formula.rangetosheet && formula.rangetosheet != null) {
            formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
        }
    });

    menuButton.initialMenuButton();

    let dpi_x = document.getElementById("testdpidiv").offsetWidth * Store.devicePixelRatio;
    let dpi_y = document.getElementById("testdpidiv").offsetHeight * Store.devicePixelRatio;
}
