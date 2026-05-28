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
    $("#luckysheet-wa-calculate-size").mousedown(function(e) {
        let y = e.pageY;
        formula.functionResizeData.y = y;
        formula.functionResizeStatus = true;
        formula.functionResizeData.calculatebarHeight = Store.calculatebarHeight;
        if (formula.rangetosheet && formula.rangetosheet != null) {
            formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
        }
    });

    // 点击设置字体大小的下拉箭头，把自动聚焦输入框去除（认为下拉设置字体大小，不需要聚焦输入框）
    // //toolbar菜单
    // $("#" + Store.container + " .luckysheet-wa-editor").on("click", ".luckysheet-toolbar-zoom-combobox", function (e) {
    //     $(e.currentTarget).addClass("luckysheet-toolbar-combo-button-open");
    //     $(e.currentTarget).find(".luckysheet-toolbar-combo-button-input").focus();
    // });

    // $("#" + Store.container + " .luckysheet-wa-editor").on("blur", ".luckysheet-toolbar-combo-button-input", function (e) {
    //     $(e.currentTarget).closest(".luckysheet-toolbar-zoom-combobox").removeClass("luckysheet-toolbar-combo-button-open");
    // });

    //表格格式处理
    menuButton.initialMenuButton();

    let dpi_x = document.getElementById("testdpidiv").offsetWidth * Store.devicePixelRatio;
    let dpi_y = document.getElementById("testdpidiv").offsetHeight * Store.devicePixelRatio;
}
