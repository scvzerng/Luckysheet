import mobileinit from "../mobile";
import luckysheetConfigsetting from "../luckysheetConfigsetting";
import luckysheetFreezen from "../freezen";
import luckysheetDropCell from "../dropCell";
import luckysheetPostil from "../postil";
import imageCtrl from "../imageCtrl";
import hyperlinkCtrl from "../hyperlinkCtrl";
import menuButton from "../menuButton";
import conditionformat from "../conditionformat";
import alternateformat from "../alternateformat";
import ifFormulaGenerator from "../ifFormulaGenerator";
import sheetmanage from "../sheetmanage";
import { luckysheetupdateCell } from "../updateCell";
import { luckysheet_searcharray } from "../sheetSearch";
import luckysheetsizeauto from "../resize";
import { luckysheetMoveHighlightCell } from "../sheetMove";
import {
    selectHightlightShow,
    selectIsOverlap,
    selectionCopyShow,
    luckysheet_count_show,
    selectHelpboxFill,
} from "../select";
import selection from "../selection";
import controlHistory from "../controlHistory";
import { hideMenuByCancel } from "../../global/cursorPos";
import { luckysheetdefaultstyle } from "../constant";

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
import { getSheetIndex, getRangetxt } from "../../methods/get";
import { rowLocation, colLocation, mouseposition } from "../../global/location";
import { rowlenByRange } from "../../global/getRowlen";
import { isRealNull, hasPartMC, isEditMode, checkIsAllowEdit } from "../../global/validate";
import { countfunc } from "../../global/count";
import browser from "../../global/browser";
import formula from "../../global/formula";
import { luckysheetextendtable } from "../../global/extend";
import luckysheetscrollevent from "../../global/scroll";
import { jfrefreshgrid, jfrefreshgrid_rhcw, luckysheetrefreshgrid } from "../../global/refresh";
import { getdatabyselection, datagridgrowth } from "../../global/getdata";
import tooltip from "../../global/tooltip";
import editor from "../../global/editor";
import { genarate, update } from "../../global/format";
import method from "../../global/method";
import { getBorderInfoCompute } from "../../global/border";
import { luckysheetDrawMain } from "../../global/draw";
import locale from "../../locale/locale";
import Store from "../../store";
import luckysheetformula from "../../global/formula";
import context from "./context";

export default function globalEvents() {
    $("#luckysheet-rightclick-menu input").on("keydown", function(e) {
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

    $(document)
        .on(
            "visibilitychange.luckysheetEvent webkitvisibilitychange.luckysheetEvent msvisibilitychange.luckysheetEvent",
            copychange,
        )
        .on("mouseleave.luckysheetEvent", function() {
            Store.iscopyself = false;
        })
        .on("mousedown.luckysheetEvent", function(event) {
            //有批注在编辑时
            luckysheetPostil.removeActivePs();

            hideMenuByCancel(event);

            //点击功能栏时 如果是单元格编辑模式 则退出编辑模式
            if (
                $(event.target).closest("#luckysheet-wa-editor").length > 0 &&
                parseInt($("#luckysheet-input-box").css("top")) > 0
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
    $(document).on("mousedown.luckysheetEvent", "div.luckysheet-modal-dialog", function(e) {
        if (!$(e.target).is(".luckysheet-modal-dialog")) {
            return;
        }

        Store.luckysheet_model_move_state = true;

        Store.luckysheet_model_move_obj = $(e.currentTarget);
        let toffset = Store.luckysheet_model_move_obj.offset();
        Store.luckysheet_model_xy = [e.pageX - toffset.left, e.pageY - toffset.top];
    });

    //模态框关闭
    $(document).on(
        "click.luckysheetEvent",
        ".luckysheet-modal-dialog-title-close, .luckysheet-model-close-btn",
        function(e) {
            //选择文本颜色和单元格颜色弹出框取消
            if ($("#textcolorselect").is(":visible") || $("#cellcolorselect").is(":visible")) {
                $("#luckysheet-conditionformat-dialog").show();
            }
            $(e.currentTarget)
                .parents(".luckysheet-modal-dialog")
                .hide();
            $("#luckysheet-modal-dialog-mask").hide();

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
