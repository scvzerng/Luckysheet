import { onNS, offNS } from '../../utils/migrationHelpers.js';
import luckysheetPostil from "../postil";
import { luckysheetMoveHighlightCell } from "../sheetMove";
import {
    selectHightlightShow,
    selectIsOverlap,
    selectionCopyShow,
    luckysheet_count_show,
    selectHelpboxFill,
} from "../select";
import controlHistory from "../controlHistory";
import { hideMenuByCancel } from "../../global/cursorPos";
import { isInputBoxActive, hideModalMask } from "../../utils/domUtils.js";

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
import { countfunc } from "../../global/count";
import formula from "../../global/formula";
import Store from "../../store";
import rightClickMenu from "../../ui/rightClickMenu.js";
import conditionformatDialog from '../../ui/conditionformatDialog.js';
import functionBox from '../../ui/functionBox.js';

export default function globalEvents() {
    rightClickMenu.find("input").on("keydown", function(e) {
        e.stopPropagation();
    });

    $("#luckysheet-modal-dialog-mask").on("click dbclick mousedown mousemove mouseup", function(e) {
        e.stopPropagation();
        e.preventDefault();
    });

    let copychange = function() {
        if (document.hidden || document.webkitHidden || document.msHidden) {
            Store.iscopyself = false;
        }
    };

    onNS(document, "visibilitychange.luckysheetEvent", null, copychange);
    onNS(document, "webkitvisibilitychange.luckysheetEvent", null, copychange);
    onNS(document, "msvisibilitychange.luckysheetEvent", null, copychange);
    onNS(document, "mouseleave.luckysheetEvent", null, function() {
        Store.iscopyself = false;
    });
    onNS(document, "mousedown.luckysheetEvent", null, function(event) {
        luckysheetPostil.removeActivePs();

        hideMenuByCancel(event);

        if (
            $(event.target).closest("#luckysheet-wa-editor").length > 0 &&
            isInputBoxActive()
        ) {
            formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
            luckysheetMoveHighlightCell("down", 0, "rangeOfSelect");
        }
    });

    //表格左上角点击 全选表格
    $("#luckysheet-left-top").click(function(event) {

        $("#luckysheet-wa-functionbox-confirm").click();
        Store.luckysheet_select_status = false;

        Store.luckysheet_select_save = [
            {
                row: [0, Store.flowdata.length - 1],
                column: [0, Store.flowdata[0].length - 1],
                row_focus: 0,
                column_focus: 0,
                row_select: true,
                column_select: true,
            },
        ];
        selectHightlightShow();

        clearTimeout(Store.countfuncTimeout);
        Store.countfuncTimeout = setTimeout(function() {
            countfunc();
        }, 500);


        event.stopPropagation();
    });

    //回退 重做 按钮
    $("#luckysheet-icon-undo").click(function(event) {
        if ($(this).hasClass("disabled")) {
            return;
        }
        controlHistory.redo(event);
    });
    $("#luckysheet-icon-redo").click(function(event) {
        if ($(this).hasClass("disabled")) {
            return;
        }
        controlHistory.undo(event);
    });

    //模态框拖动
    onNS(document, "mousedown.luckysheetEvent", "div.luckysheet-modal-dialog", function(e) {
        if (!$(e.target).is(".luckysheet-modal-dialog")) {
            return;
        }

        Store.luckysheet_model_move_state = true;

        Store.luckysheet_model_move_obj = $(e.currentTarget);
        let toffset = Store.luckysheet_model_move_obj.offset();
        Store.luckysheet_model_xy = [e.pageX - toffset.left, e.pageY - toffset.top];
    });

    //模态框关闭
    onNS(document, "click.luckysheetEvent", ".luckysheet-modal-dialog-title-close, .luckysheet-model-close-btn", function(e) {
            //选择文本颜色和单元格颜色弹出框取消
            if ($("#textcolorselect").is(":visible") || $("#cellcolorselect").is(":visible")) {
                conditionformatDialog.main.show();
            }
            $(e.currentTarget)
                .parents(".luckysheet-modal-dialog")
                .hide();
            hideModalMask();

            //函数查找功能所有弹出框关闭和取消
            if (
                $(this)
                    .parents(".luckysheet-modal-dialog")
                    .hasClass("luckysheet-search-formula")
            ) {
                formula.dontupdate();
                luckysheetMoveHighlightCell("down", 0, "rangeOfSelect");
            }
            if (
                $(this)
                    .parents(".luckysheet-modal-dialog")
                    .hasClass("luckysheet-search-formula-parm")
            ) {
                formula.dontupdate();
                luckysheetMoveHighlightCell("down", 0, "rangeOfSelect");
            }
            if (
                $(this)
                    .parents(".luckysheet-modal-dialog")
                    .hasClass("luckysheet-search-formula-parm-select")
            ) {
                formula.dontupdate();
                luckysheetMoveHighlightCell("down", 0, "rangeOfSelect");
            }

            luckysheetContainerFocus();
        },
    );
}
