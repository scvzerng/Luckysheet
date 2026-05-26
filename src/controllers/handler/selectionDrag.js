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

const pivotTable = {
    luckysheet_pivotTable_select_state: false,
    movestate: false,
    filter: null,
    row: null,
    column: null,
    values: null,
    pivotDatas: [],
    showType: "",
    movesave: { width: 0, height: 0, containerid: "" },
    pivotclick: function() {},
    isPivotRange: function() { return false; },
    drillDown: function() {},
};

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

export default function selectionDrag() {
    // //禁止前台编辑(只可 框选单元格、滚动查看表格)
    // if(!Store.allowEdit){
    //     return;
    // }

    //选区拖动替换
    $("#luckysheet-cell-main div.luckysheet-cs-draghandle").mousedown(function(event) {
        if (isEditMode() || Store.allowEdit === false) {
            //此模式下禁用选区拖动
            return;
        }

        $("#luckysheet-cell-selected")
            .find(".luckysheet-cs-fillhandle")
            .css("cursor", "move")
            .end()
            .find(".luckysheet-cs-draghandle")
            .css("cursor", "move");
        $("#luckysheet-cell-main, #luckysheetTableContent, #luckysheet-sheettable_0").css("cursor", "move");

        Store.luckysheet_cell_selected_move = true;
        Store.luckysheet_scroll_status = true;

        let mouse = mouseposition(event.pageX, event.pageY);
        let x = mouse[0] + $("#luckysheet-cell-main").scrollLeft();
        let y = mouse[1] + $("#luckysheet-cell-main").scrollTop();

        let row_location = rowLocation(y),
            row_pre = row_location[0],
            row = row_location[1],
            row_index = row_location[2];
        let col_location = colLocation(x),
            col_pre = col_location[0],
            col = col_location[1],
            col_index = col_location[2];

        Store.luckysheet_cell_selected_move_index = [row_index, col_index];

        $("#luckysheet-cell-selected-move").css({
            left: col_pre,
            width: col - col_pre - 1,
            top: row_pre,
            height: row - row_pre - 1,
            display: "block",
        });

        event.stopPropagation();
    });

    //选区下拉
    $("#luckysheet-cell-main div.luckysheet-cs-fillhandle")
        .mousedown(function(event) {
            if (isEditMode() || Store.allowEdit === false) {
                //此模式下禁用选区下拉
                return;
            }

            $("#luckysheet-cell-selected")
                .find(".luckysheet-cs-fillhandle")
                .css("cursor", "crosshair")
                .end()
                .find(".luckysheet-cs-draghandle")
                .css("cursor", "crosshair");
            $("#luckysheet-cell-main, #luckysheetTableContent, #luckysheet-sheettable_0").css("cursor", "crosshair");

            Store.luckysheet_cell_selected_extend_time = setTimeout(function() {
                Store.luckysheet_cell_selected_extend = true;
                Store.luckysheet_scroll_status = true;

                let mouse = mouseposition(event.pageX, event.pageY);
                let x = mouse[0] + $("#luckysheet-cell-main").scrollLeft() - 5;
                let y = mouse[1] + $("#luckysheet-cell-main").scrollTop() - 5;

                let row_location = rowLocation(y),
                    row_pre = row_location[0],
                    row = row_location[1],
                    row_index = row_location[2];
                let col_location = colLocation(x),
                    col_pre = col_location[0],
                    col = col_location[1],
                    col_index = col_location[2];

                Store.luckysheet_cell_selected_extend_index = [row_index, col_index];

                $("#luckysheet-cell-selected-extend").css({
                    left: col_pre,
                    width: col - col_pre - 1,
                    top: row_pre,
                    height: row - row_pre - 1,
                    display: "block",
                });
            }, 100);

            event.stopPropagation();
        })
        .click(function() {
            clearTimeout(Store.luckysheet_cell_selected_extend_time);
            event.stopPropagation();
        })
        .dblclick(function() {
            let last = Store.luckysheet_select_save[0];

            let r0 = last.row[0],
                r1 = last.row[1],
                c0 = last.column[0],
                c1 = last.column[1];

            if (pivotTable.isPivotRange(r0, c0)) {
                return;
            }

            let dropCellState = false;
            let step = 0;

            for (let r = r1 + 1; r < Store.flowdata.length; r++) {
                if (c0 - 1 >= 0 && c1 + 1 < Store.flowdata[0].length) {
                    let cell1 = Store.flowdata[r][c0 - 1];
                    let cell2 = Store.flowdata[r][c1 + 1];

                    if (r == r1 + 1) {
                        if ((cell1 == null || isRealNull(cell1.v)) && (cell2 == null || isRealNull(cell2.v))) {
                            dropCellState = false;
                            break;
                        } else {
                            dropCellState = true;
                            step++;
                        }
                    } else {
                        if ((cell1 == null || isRealNull(cell1.v)) && (cell2 == null || isRealNull(cell2.v))) {
                            break;
                        }

                        step++;
                    }
                } else if (c0 - 1 >= 0) {
                    let cell = Store.flowdata[r][c0 - 1];

                    if (r == r1 + 1) {
                        if (cell == null || isRealNull(cell.v)) {
                            dropCellState = false;
                            break;
                        } else {
                            dropCellState = true;
                            step++;
                        }
                    } else {
                        if (cell == null || isRealNull(cell.v)) {
                            break;
                        }

                        step++;
                    }
                } else if (c1 + 1 < Store.flowdata[0].length) {
                    let cell = Store.flowdata[r][c1 + 1];

                    if (r == r1 + 1) {
                        if (cell == null || isRealNull(cell.v)) {
                            dropCellState = false;
                            break;
                        } else {
                            dropCellState = true;
                            step++;
                        }
                    } else {
                        if (cell == null || isRealNull(cell.v)) {
                            break;
                        }

                        step++;
                    }
                }
            }

            if (!dropCellState || step == 0) {
                event.stopPropagation();
                return;
            }

            //复制范围
            luckysheetDropCell.copyRange = { row: [r0, r1], column: [c0, c1] };

            //applyType
            let typeItemHide = luckysheetDropCell.typeItemHide();

            if (
                !typeItemHide[0] &&
                !typeItemHide[1] &&
                !typeItemHide[2] &&
                !typeItemHide[3] &&
                !typeItemHide[4] &&
                !typeItemHide[5] &&
                !typeItemHide[6]
            ) {
                luckysheetDropCell.applyType = "0";
            } else {
                luckysheetDropCell.applyType = "1";
            }

            luckysheetDropCell.applyRange = { row: [r1 + 1, r1 + step], column: [c0, c1] };
            luckysheetDropCell.direction = "down";

            Store.luckysheet_select_save = [{ row: [r0, r1 + step], column: [c0, c1] }];

            luckysheetDropCell.update();
            luckysheetDropCell.createIcon();

            $("#luckysheet-cell-selected-move").hide();

            $("#luckysheet-sheettable").css("cursor", "default");
            clearTimeout(Store.countfuncTimeout);
            Store.countfuncTimeout = setTimeout(function() {
                countfunc();
            }, 500);

            event.stopPropagation();
        });

}
