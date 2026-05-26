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

export default function documentMousemove() {
    //表格mousemove
    $(document).on("mousemove.luckysheetEvent", function(event) {
        luckysheetPostil.overshow(event); //有批注显示
        hyperlinkCtrl.overshow(event); //链接提示显示

        window.cancelAnimationFrame(Store.jfautoscrollTimeout);

        if (luckysheetConfigsetting && luckysheetConfigsetting.hook && luckysheetConfigsetting.hook.sheetMousemove) {
            let mouse = mouseposition(event.pageX, event.pageY);
            let x = mouse[0] + $("#luckysheet-cell-main").scrollLeft();
            let y = mouse[1] + $("#luckysheet-cell-main").scrollTop();

            let row_location = rowLocation(y),
                row = row_location[1],
                row_pre = row_location[0],
                row_index = row_location[2];
            let col_location = colLocation(x),
                col = col_location[1],
                col_pre = col_location[0],
                col_index = col_location[2];

            let margeset = menuButton.mergeborer(Store.flowdata, row_index, col_index);
            if (!!margeset) {
                row = margeset.row[1];
                row_pre = margeset.row[0];
                row_index = margeset.row[2];

                col = margeset.column[1];
                col_pre = margeset.column[0];
                col_index = margeset.column[2];
            }

            // if(Store.flowdata[row_index] && Store.flowdata[row_index][col_index]){
            let sheetFile = sheetmanage.getSheetByIndex();

            let moveState = {
                functionResizeStatus: formula.functionResizeStatus,
                horizontalmoveState: !!luckysheetFreezen.horizontalmovestate,
                verticalmoveState: !!luckysheetFreezen.verticalmovestate,
                sheetMoveStatus: Store.luckysheet_sheet_move_status,
                scrollStatus: !!Store.luckysheet_scroll_status,
                selectStatus: !!Store.luckysheet_select_status,
                rowsSelectedStatus: !!Store.luckysheet_rows_selected_status,
                colsSelectedStatus: !!Store.luckysheet_cols_selected_status,
                cellSelectedMove: !!Store.luckysheet_cell_selected_move,
                cellSelectedExtend: !!Store.luckysheet_cell_selected_extend,
                colsChangeSize: !!Store.luckysheet_cols_change_size,
                rowsChangeSize: !!Store.luckysheet_rows_change_size,
                chartMove: !!Store.chartparam.luckysheetCurrentChartMove,
                chartResize: !!Store.chartparam.luckysheetCurrentChartResize,
                rangeResize: !!formula.rangeResize,
                rangeMove: !!formula.rangeMove,
            };

            let luckysheetTableContent = $("#luckysheetTableContent")
                .get(0)
                .getContext("2d");

            if (Store.flowdata && Store.flowdata[row_index]) {
                method.createHookFunction(
                    "sheetMousemove",
                    Store.flowdata[row_index][col_index],
                    {
                        r: row_index,
                        c: col_index,
                        start_r: row_pre,
                        start_c: col_pre,
                        end_r: row,
                        end_c: col,
                    },
                    sheetFile,
                    moveState,
                    luckysheetTableContent,
                );
            }
            // }
        }

        if (formula.functionResizeStatus) {
            let y = event.pageY;
            let movepx = y - formula.functionResizeData.y;
            let mpx = formula.functionResizeData.calculatebarHeight + movepx;
            let winh = Math.round($(window).height() / 2);

            if (mpx <= 28) {
                if (mpx <= 20) {
                    return;
                }
                mpx = 28;
            } else if (mpx >= winh) {
                if (mpx >= winh + 8) {
                    return;
                }
                mpx = winh;
            }

            Store.calculatebarHeight = mpx;
            $("#luckysheet-wa-calculate").css("height", Store.calculatebarHeight - 2);
            $("#luckysheet-wa-calculate-size").css({ background: "#5e5e5e", cursor: "ns-resize" });

            clearTimeout(formula.functionResizeTimeout);
            formula.functionResizeTimeout = setTimeout(function() {
                luckysheetsizeauto();
            }, 15);
        } else if (!!luckysheetFreezen.horizontalmovestate) {
            let mouse = mouseposition(event.pageX, event.pageY);
            let scrollLeft = $("#luckysheet-cell-main").scrollLeft();
            let scrollTop = $("#luckysheet-cell-main").scrollTop();
            let x = mouse[0] + scrollLeft;
            let y = mouse[1] + scrollTop;

            let row_location = rowLocation(y),
                row = row_location[1],
                row_pre = row_location[0],
                row_index = row_location[2];
            let top = mouse[1] + Store.columnHeaderHeight;

            if (top < Store.columnHeaderHeight) {
                top = Store.columnHeaderHeight;
            }

            if (top > luckysheetFreezen.windowHeight - 4) {
                top = luckysheetFreezen.windowHeight - 4;
            }

            $("#luckysheet-freezebar-horizontal")
                .find(".luckysheet-freezebar-horizontal-handle")
                .css({ top: top });

            if (top + scrollTop - Store.columnHeaderHeight >= row_pre + (row - row_pre) / 2) {
                top = row - 2 - scrollTop + Store.columnHeaderHeight;
                luckysheetFreezen.freezenhorizontaldata = [
                    row,
                    row_index + 1,
                    scrollTop,
                    luckysheetFreezen.cutVolumn(Store.visibledatarow, row_index + 1),
                    top,
                ];
            } else {
                top = row_pre - 2 - scrollTop + Store.columnHeaderHeight;
                luckysheetFreezen.freezenhorizontaldata = [
                    row_pre,
                    row_index,
                    scrollTop,
                    luckysheetFreezen.cutVolumn(Store.visibledatarow, row_index),
                    top,
                ];
            }

            $("#luckysheet-freezebar-horizontal")
                .find(".luckysheet-freezebar-horizontal-drop")
                .css({ top: top });
            luckysheetFreezen.saveFreezen(luckysheetFreezen.freezenhorizontaldata, top, null, null);
        } else if (!!luckysheetFreezen.verticalmovestate) {
            let mouse = mouseposition(event.pageX, event.pageY);
            let scrollLeft = $("#luckysheet-cell-main").scrollLeft();
            let scrollTop = $("#luckysheet-cell-main").scrollTop();
            let x = mouse[0] + scrollLeft;
            let y = mouse[1] + scrollTop;

            let col_location = colLocation(x),
                col = col_location[1],
                col_pre = col_location[0],
                col_index = col_location[2];

            let left = mouse[0] + Store.rowHeaderWidth;

            if (left < Store.rowHeaderWidth) {
                left = Store.rowHeaderWidth;
            }

            if (left > luckysheetFreezen.windowWidth - 4) {
                left = luckysheetFreezen.windowWidth - 4;
            }

            $("#luckysheet-freezebar-vertical")
                .find(".luckysheet-freezebar-vertical-handle")
                .css({ left: left });

            if (left + scrollLeft - Store.rowHeaderWidth >= col_pre + (col - col_pre) / 2) {
                left = col - 2 - scrollLeft + Store.rowHeaderWidth;
                luckysheetFreezen.freezenverticaldata = [
                    col,
                    col_index + 1,
                    scrollLeft,
                    luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_index + 1),
                    left,
                ];
            } else {
                left = col_pre - 2 - scrollLeft + Store.rowHeaderWidth;
                luckysheetFreezen.freezenverticaldata = [
                    col_pre,
                    col_index,
                    scrollLeft,
                    luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_index),
                    left,
                ];
            }

            $("#luckysheet-freezebar-vertical")
                .find(".luckysheet-freezebar-vertical-drop")
                .css({ left: left });
            luckysheetFreezen.saveFreezen(null, null, luckysheetFreezen.freezenverticaldata, left);
            luckysheetsizeauto(); //调节选区时下部单元格溢出
        } else if (Store.luckysheet_sheet_move_status) {
            let scrollLeft = $("#luckysheet-sheet-container-c").scrollLeft();
            let x = event.pageX + scrollLeft;

            if (Math.abs(event.pageX - Store.luckysheet_sheet_move_data.pageX) < 3) {
                return;
            }

            let winW = $("#luckysheet-sheet-container").width();
            let left = x - Store.luckysheet_sheet_move_data.curleft - $("#luckysheet-sheet-container").offset().left;
            Store.luckysheet_sheet_move_data.activeobject.css({ left: left });

            let row_index = luckysheet_searcharray(
                Store.luckysheet_sheet_move_data.widthlist,
                left + Store.luckysheet_sheet_move_data.curleft,
            );
            Store.luckysheet_sheet_move_data.cursorobject.css({ cursor: "move" });

            if (left - scrollLeft <= 6) {
                $("#luckysheet-sheets-leftscroll").click();
            }

            if (left - scrollLeft >= winW - 40) {
                $("#luckysheet-sheets-rightscroll").click();
            }

            if (row_index != Store.luckysheet_sheet_move_data.curindex) {
                if (row_index == -1 && left > 0) {
                    row_index = Store.luckysheet_sheet_move_data.widthlist.length - 1;
                    $("#luckysheet-sheets-item-clone").insertAfter(
                        $("#luckysheet-sheet-area div.luckysheet-sheets-item:visible").eq(row_index),
                    );
                } else if (row_index == -1 && left <= 0) {
                    $("#luckysheet-sheets-item-clone").insertBefore(
                        $("#luckysheet-sheet-area div.luckysheet-sheets-item:visible").eq(0),
                    );
                } else {
                    $("#luckysheet-sheets-item-clone").insertAfter(
                        $("#luckysheet-sheet-area div.luckysheet-sheets-item:visible").eq(row_index),
                    );
                }

                Store.luckysheet_sheet_move_data.widthlist = [];
                $("#luckysheet-sheet-area div.luckysheet-sheets-item:visible").each(function(i) {
                    if (i == 0) {
                        Store.luckysheet_sheet_move_data.widthlist.push(parseInt($(this).outerWidth()));
                    } else {
                        Store.luckysheet_sheet_move_data.widthlist.push(
                            parseInt($(this).outerWidth()) + Store.luckysheet_sheet_move_data.widthlist[i - 1],
                        );
                    }
                });

                Store.luckysheet_sheet_move_data.curindex = $(
                    "#luckysheet-sheet-area div.luckysheet-sheets-item:visible",
                ).index($("#luckysheet-sheets-item-clone"));
            }
        } else if (Store.luckysheet_model_move_state) {
            let scrollTop = $(document).scrollTop(),
                scrollLeft = $(document).scrollLeft();
            let y = event.pageY + scrollTop,
                x = event.pageX + scrollLeft;
            let winH = $(window).height(),
                winW = $(window).width();
            let myh = Store.luckysheet_model_move_obj.height(),
                myw = Store.luckysheet_model_move_obj.width();
            let top = y - Store.luckysheet_model_xy[1],
                left = x - Store.luckysheet_model_xy[0];

            if (top < 0) {
                top = 0;
            }

            if (top + myh + 62 > winH) {
                top = winH - myh - 62;
            }

            if (left < 0) {
                left = 0;
            }

            if (left + myw + 86 > winW) {
                left = winW - myw - 86;
            }

            Store.luckysheet_model_move_obj.css({ top: top, left: left });
            event.preventDefault();
        } else if (
            !!Store.luckysheet_scroll_status ||
            !!Store.luckysheet_select_status ||
            !!Store.luckysheet_rows_selected_status ||
            !!Store.luckysheet_cols_selected_status ||
            !!Store.luckysheet_cell_selected_move ||
            !!Store.luckysheet_cell_selected_extend ||
            !!Store.luckysheet_cols_change_size ||
            !!Store.luckysheet_rows_change_size ||
            !!Store.chartparam.luckysheetCurrentChartMove ||
            !!Store.chartparam.luckysheetCurrentChartResize ||
            !!formula.rangeResize ||
            !!formula.rangeMove
        ) {
            if (Store.luckysheet_select_status) {
                clearTimeout(Store.countfuncTimeout);
                Store.countfuncTimeout = setTimeout(function() {
                    countfunc();
                }, 500);
            }

            function mouseRender() {
                if (
                    Store.luckysheet_scroll_status &&
                    !Store.luckysheet_cols_change_size &&
                    !Store.luckysheet_rows_change_size
                ) {
                    let mouse = mouseposition(event.pageX, event.pageY);
                    let left = $("#luckysheet-scrollbar-x").scrollLeft(),
                        top = $("#luckysheet-scrollbar-y").scrollTop();
                    let x = mouse[0];
                    let y = mouse[1];
                    let winH = $("#luckysheet-cell-main").height() - 20 * Store.zoomRatio,
                        winW = $("#luckysheet-cell-main").width() - 60 * Store.zoomRatio;

                    if (y < 0 || y > winH) {
                        let stop;
                        if (y < 0) {
                            stop = top + y / 2;
                        } else {
                            stop = top + (y - winH) / 2;
                        }
                        $("#luckysheet-scrollbar-y").scrollTop(stop);
                    }

                    if (x < 0 || x > winW) {
                        let sleft;
                        if (x < 0) {
                            sleft = left + x / 2;
                        } else {
                            sleft = left + (x - winW) / 2;
                        }

                        $("#luckysheet-scrollbar-x").scrollLeft(sleft);
                    }
                }
                if (Store.luckysheet_select_status) {
                    let mouse = mouseposition(event.pageX, event.pageY);
                    let x = mouse[0] + $("#luckysheet-cell-main").scrollLeft();
                    let y = mouse[1] + $("#luckysheet-cell-main").scrollTop();

                    let row_location = rowLocation(y),
                        row = row_location[1],
                        row_pre = row_location[0],
                        row_index = row_location[2];
                    let col_location = colLocation(x),
                        col = col_location[1],
                        col_pre = col_location[0],
                        col_index = col_location[2];

                    let last = $.extend(
                        true,
                        {},
                        Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1],
                    );

                    let top = 0,
                        height = 0,
                        rowseleted = [];
                    if (last.top > row_pre) {
                        top = row_pre;
                        height = last.top + last.height - row_pre;

                        if (last.row[1] > last.row_focus) {
                            last.row[1] = last.row_focus;
                        }

                        rowseleted = [row_index, last.row[1]];
                    } else if (last.top == row_pre) {
                        top = row_pre;
                        height = last.top + last.height - row_pre;
                        rowseleted = [row_index, last.row[0]];
                    } else {
                        top = last.top;
                        height = row - last.top - 1;

                        if (last.row[0] < last.row_focus) {
                            last.row[0] = last.row_focus;
                        }

                        rowseleted = [last.row[0], row_index];
                    }

                    let left = 0,
                        width = 0,
                        columnseleted = [];
                    if (last.left > col_pre) {
                        left = col_pre;
                        width = last.left + last.width - col_pre;

                        if (last.column[1] > last.column_focus) {
                            last.column[1] = last.column_focus;
                        }

                        columnseleted = [col_index, last.column[1]];
                    } else if (last.left == col_pre) {
                        left = col_pre;
                        width = last.left + last.width - col_pre;
                        columnseleted = [col_index, last.column[0]];
                    } else {
                        left = last.left;
                        width = col - last.left - 1;

                        if (last.column[0] < last.column_focus) {
                            last.column[0] = last.column_focus;
                        }

                        columnseleted = [last.column[0], col_index];
                    }

                    let changeparam = menuButton.mergeMoveMain(
                        columnseleted,
                        rowseleted,
                        last,
                        top,
                        height,
                        left,
                        width,
                    );
                    if (changeparam != null) {
                        columnseleted = changeparam[0];
                        rowseleted = changeparam[1];
                        top = changeparam[2];
                        height = changeparam[3];
                        left = changeparam[4];
                        width = changeparam[5];
                    }

                    last["row"] = rowseleted;
                    last["column"] = columnseleted;

                    last["left_move"] = left;
                    last["width_move"] = width;
                    last["top_move"] = top;
                    last["height_move"] = height;

                    Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1] = last;

                    selectHightlightShow();
                    luckysheetFreezen.scrollFreezen();

                    // selectHelpboxFill();

                    //交替颜色选择范围
                    if ($("#luckysheet-alternateformat-rangeDialog").is(":visible")) {
                        $("#luckysheet-alternateformat-rangeDialog input").val(
                            getRangetxt(
                                Store.currentSheetIndex,
                                Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1],
                            ),
                        );
                    }

                } else if (conditionformat.selectStatus) {
                    let mouse = mouseposition(event.pageX, event.pageY);
                    let x = mouse[0] + $("#luckysheet-cell-main").scrollLeft();
                    let y = mouse[1] + $("#luckysheet-cell-main").scrollTop();

                    let row_location = rowLocation(y),
                        row = row_location[1],
                        row_pre = row_location[0],
                        row_index = row_location[2];
                    let col_location = colLocation(x),
                        col = col_location[1],
                        col_pre = col_location[0],
                        col_index = col_location[2];

                    let last = conditionformat.selectRange[conditionformat.selectRange.length - 1];

                    let top = 0,
                        height = 0,
                        rowseleted = [];
                    if (last.top > row_pre) {
                        top = row_pre;
                        height = last.top + last.height - row_pre;

                        if (last.row[1] > last.row_focus) {
                            last.row[1] = last.row_focus;
                        }

                        rowseleted = [row_index, last.row[1]];
                    } else if (last.top == row_pre) {
                        top = row_pre;
                        height = last.top + last.height - row_pre;
                        rowseleted = [row_index, last.row[0]];
                    } else {
                        top = last.top;
                        height = row - last.top - 1;

                        if (last.row[0] < last.row_focus) {
                            last.row[0] = last.row_focus;
                        }

                        rowseleted = [last.row[0], row_index];
                    }

                    let left = 0,
                        width = 0,
                        columnseleted = [];
                    if (last.left > col_pre) {
                        left = col_pre;
                        width = last.left + last.width - col_pre;

                        if (last.column[1] > last.column_focus) {
                            last.column[1] = last.column_focus;
                        }

                        columnseleted = [col_index, last.column[1]];
                    } else if (last.left == col_pre) {
                        left = col_pre;
                        width = last.left + last.width - col_pre;
                        columnseleted = [col_index, last.column[0]];
                    } else {
                        left = last.left;
                        width = col - last.left - 1;

                        if (last.column[0] < last.column_focus) {
                            last.column[0] = last.column_focus;
                        }

                        columnseleted = [last.column[0], col_index];
                    }

                    let changeparam = menuButton.mergeMoveMain(
                        columnseleted,
                        rowseleted,
                        last,
                        top,
                        height,
                        left,
                        width,
                    );
                    if (changeparam != null) {
                        columnseleted = changeparam[0];
                        rowseleted = changeparam[1];
                        top = changeparam[2];
                        height = changeparam[3];
                        left = changeparam[4];
                        width = changeparam[5];
                    }

                    last["row"] = rowseleted;
                    last["column"] = columnseleted;

                    last["left_move"] = left;
                    last["width_move"] = width;
                    last["top_move"] = top;
                    last["height_move"] = height;

                    conditionformat.selectRange[conditionformat.selectRange.length - 1] = last;

                    selectionCopyShow(conditionformat.selectRange);

                    let range = conditionformat.getTxtByRange(conditionformat.selectRange);
                    $("#luckysheet-multiRange-dialog input").val(range);
                } else if (formula.rangestart) {
                    formula.rangedrag(event);
                } else if (formula.rangedrag_row_start) {
                    formula.rangedrag_row(event);
                } else if (formula.rangedrag_column_start) {
                    formula.rangedrag_column(event);
                } else if (Store.luckysheet_rows_selected_status) {
                    let mouse = mouseposition(event.pageX, event.pageY);
                    let y = mouse[1] + $("#luckysheet-rows-h").scrollTop();
                    if (y < 0) {
                        return false;
                    }

                    let row_location = rowLocation(y),
                        row = row_location[1],
                        row_pre = row_location[0],
                        row_index = row_location[2];
                    let col_index = Store.visibledatacolumn.length - 1,
                        col = Store.visibledatacolumn[col_index],
                        col_pre = 0;

                    let last = $.extend(
                        true,
                        {},
                        Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1],
                    );

                    let top = 0,
                        height = 0,
                        rowseleted = [];
                    if (last.top > row_pre) {
                        top = row_pre;
                        height = last.top + last.height - row_pre;

                        if (last.row[1] > last.row_focus) {
                            last.row[1] = last.row_focus;
                        }

                        rowseleted = [row_index, last.row[1]];
                    } else if (last.top == row_pre) {
                        top = row_pre;
                        height = last.top + last.height - row_pre;
                        rowseleted = [row_index, last.row[0]];
                    } else {
                        top = last.top;
                        height = row - last.top - 1;

                        if (last.row[0] < last.row_focus) {
                            last.row[0] = last.row_focus;
                        }

                        rowseleted = [last.row[0], row_index];
                    }

                    last["row"] = rowseleted;

                    last["top_move"] = top;
                    last["height_move"] = height;

                    Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1] = last;

                    selectHightlightShow();
                    clearTimeout(Store.countfuncTimeout);
                    Store.countfuncTimeout = setTimeout(function() {
                        countfunc();
                    }, 500);
                } else if (Store.luckysheet_cols_selected_status) {
                    let mouse = mouseposition(event.pageX, event.pageY);
                    let x = mouse[0] + $("#luckysheet-cols-h-c").scrollLeft();
                    if (x < 0) {
                        return false;
                    }

                    let row_index = Store.visibledatarow.length - 1,
                        row = Store.visibledatarow[row_index],
                        row_pre = 0;
                    let col_location = colLocation(x),
                        col = col_location[1],
                        col_pre = col_location[0],
                        col_index = col_location[2];

                    let last = $.extend(
                        true,
                        {},
                        Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1],
                    );

                    let left = 0,
                        width = 0,
                        columnseleted = [];
                    if (last.left > col_pre) {
                        left = col_pre;
                        width = last.left + last.width - col_pre;

                        if (last.column[1] > last.column_focus) {
                            last.column[1] = last.column_focus;
                        }

                        columnseleted = [col_index, last.column[1]];
                    } else if (last.left == col_pre) {
                        left = col_pre;
                        width = last.left + last.width - col_pre;
                        columnseleted = [col_index, last.column[0]];
                    } else {
                        left = last.left;
                        width = col - last.left - 1;

                        if (last.column[0] < last.column_focus) {
                            last.column[0] = last.column_focus;
                        }

                        columnseleted = [last.column[0], col_index];
                    }

                    last["column"] = columnseleted;

                    last["left_move"] = left;
                    last["width_move"] = width;

                    Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1] = last;

                    selectHightlightShow();
                    clearTimeout(Store.countfuncTimeout);
                    Store.countfuncTimeout = setTimeout(function() {
                        countfunc();
                    }, 500);
                } else if (Store.luckysheet_cell_selected_move) {
                    let mouse = mouseposition(event.pageX, event.pageY);

                    let scrollLeft = $("#luckysheet-cell-main").scrollLeft();
                    let scrollTop = $("#luckysheet-cell-main").scrollTop();

                    let x = mouse[0] + scrollLeft;
                    let y = mouse[1] + scrollTop;

                    let winH = $(window).height() + scrollTop - Store.sheetBarHeight - Store.statisticBarHeight,
                        winW = $(window).width() + scrollLeft;

                    let row_location = rowLocation(y),
                        row = row_location[1],
                        row_pre = row_location[0],
                        row_index = row_location[2];
                    let col_location = colLocation(x),
                        col = col_location[1],
                        col_pre = col_location[0],
                        col_index = col_location[2];

                    let row_index_original = Store.luckysheet_cell_selected_move_index[0],
                        col_index_original = Store.luckysheet_cell_selected_move_index[1];

                    let row_s = Store.luckysheet_select_save[0]["row"][0] - row_index_original + row_index,
                        row_e = Store.luckysheet_select_save[0]["row"][1] - row_index_original + row_index;

                    let col_s = Store.luckysheet_select_save[0]["column"][0] - col_index_original + col_index,
                        col_e = Store.luckysheet_select_save[0]["column"][1] - col_index_original + col_index;

                    if (row_s < 0 || y < 0) {
                        row_s = 0;
                        row_e = Store.luckysheet_select_save[0]["row"][1] - Store.luckysheet_select_save[0]["row"][0];
                    }

                    if (col_s < 0 || x < 0) {
                        col_s = 0;
                        col_e =
                            Store.luckysheet_select_save[0]["column"][1] - Store.luckysheet_select_save[0]["column"][0];
                    }

                    if (row_e >= Store.visibledatarow[Store.visibledatarow.length - 1] || y > winH) {
                        row_s =
                            Store.visibledatarow.length -
                            1 -
                            Store.luckysheet_select_save[0]["row"][1] +
                            Store.luckysheet_select_save[0]["row"][0];
                        row_e = Store.visibledatarow.length - 1;
                    }

                    if (col_e >= Store.visibledatacolumn[Store.visibledatacolumn.length - 1] || x > winW) {
                        col_s =
                            Store.visibledatacolumn.length -
                            1 -
                            Store.luckysheet_select_save[0]["column"][1] +
                            Store.luckysheet_select_save[0]["column"][0];
                        col_e = Store.visibledatacolumn.length - 1;
                    }

                    col_pre = col_s - 1 == -1 ? 0 : Store.visibledatacolumn[col_s - 1];
                    col = Store.visibledatacolumn[col_e];
                    row_pre = row_s - 1 == -1 ? 0 : Store.visibledatarow[row_s - 1];
                    row = Store.visibledatarow[row_e];

                    $("#luckysheet-cell-selected-move").css({
                        left: col_pre,
                        width: col - col_pre - 2,
                        top: row_pre,
                        height: row - row_pre - 2,
                        display: "block",
                    });
                } else if (Store.luckysheet_cell_selected_extend) {
                    let mouse = mouseposition(event.pageX, event.pageY);
                    let scrollLeft = $("#luckysheet-cell-main").scrollLeft() - 5;
                    let scrollTop = $("#luckysheet-cell-main").scrollTop() - 5;

                    let x = mouse[0] + scrollLeft;
                    let y = mouse[1] + scrollTop;

                    let winH = $(window).height() + scrollTop - Store.sheetBarHeight - Store.statisticBarHeight,
                        winW = $(window).width() + scrollLeft;

                    let row_location = rowLocation(y),
                        row = row_location[1],
                        row_pre = row_location[0],
                        row_index = row_location[2];
                    let col_location = colLocation(x),
                        col = col_location[1],
                        col_pre = col_location[0],
                        col_index = col_location[2];

                    let row_index_original = Store.luckysheet_cell_selected_extend_index[0],
                        col_index_original = Store.luckysheet_cell_selected_extend_index[1];

                    let row_s = Store.luckysheet_select_save[0]["row"][0],
                        row_e = Store.luckysheet_select_save[0]["row"][1];
                    let col_s = Store.luckysheet_select_save[0]["column"][0],
                        col_e = Store.luckysheet_select_save[0]["column"][1];

                    if (row_s < 0 || y < 0) {
                        row_s = 0;
                        row_e = Store.luckysheet_select_save[0]["row"][1] - Store.luckysheet_select_save[0]["row"][0];
                    }

                    if (col_s < 0 || x < 0) {
                        col_s = 0;
                        col_e =
                            Store.luckysheet_select_save[0]["column"][1] - Store.luckysheet_select_save[0]["column"][0];
                    }

                    if (row_e >= Store.visibledatarow[Store.visibledatarow.length - 1] || y > winH) {
                        row_s =
                            Store.visibledatarow.length -
                            1 -
                            Store.luckysheet_select_save[0]["row"][1] +
                            Store.luckysheet_select_save[0]["row"][0];
                        row_e = Store.visibledatarow.length - 1;
                    }

                    if (col_e >= Store.visibledatacolumn[Store.visibledatacolumn.length - 1] || x > winW) {
                        col_s =
                            Store.visibledatacolumn.length -
                            1 -
                            Store.luckysheet_select_save[0]["column"][1] +
                            Store.luckysheet_select_save[0]["column"][0];
                        col_e = Store.visibledatacolumn.length - 1;
                    }

                    let top = Store.luckysheet_select_save[0].top_move,
                        height = Store.luckysheet_select_save[0].height_move;
                    let left = Store.luckysheet_select_save[0].left_move,
                        width = Store.luckysheet_select_save[0].width_move;

                    if (Math.abs(row_index_original - row_index) > Math.abs(col_index_original - col_index)) {
                        if (!(row_index >= row_s && row_index <= row_e)) {
                            if (Store.luckysheet_select_save[0].top_move >= row_pre) {
                                top = row_pre;
                                height =
                                    Store.luckysheet_select_save[0].top_move +
                                    Store.luckysheet_select_save[0].height_move -
                                    row_pre;
                            } else {
                                top = Store.luckysheet_select_save[0].top_move;
                                height = row - Store.luckysheet_select_save[0].top_move - 1;
                            }
                        }
                    } else {
                        if (!(col_index >= col_s && col_index <= col_e)) {
                            if (Store.luckysheet_select_save[0].left_move >= col_pre) {
                                left = col_pre;
                                width =
                                    Store.luckysheet_select_save[0].left_move +
                                    Store.luckysheet_select_save[0].width_move -
                                    col_pre;
                            } else {
                                left = Store.luckysheet_select_save[0].left_move;
                                width = col - Store.luckysheet_select_save[0].left_move - 1;
                            }
                        }
                    }

                    $("#luckysheet-cell-selected-extend").css({
                        left: left,
                        width: width,
                        top: top,
                        height: height,
                        display: "block",
                    });
                } else if (Store.luckysheet_cols_change_size) {
                    let mouse = mouseposition(event.pageX, event.pageY);
                    let scrollLeft = $("#luckysheet-cols-h-c").scrollLeft();
                    let x = mouse[0] + scrollLeft;
                    let winW = $(window).width();

                    let row_index = Store.visibledatarow.length - 1,
                        row = Store.visibledatarow[row_index],
                        row_pre = 0;
                    let col_location = colLocation(x),
                        col = col_location[1],
                        col_pre = col_location[0],
                        col_index = col_location[2];

                    if (x + 3 - Store.luckysheet_cols_change_size_start[0] > 30 && x < winW + scrollLeft - 100) {
                        $("#luckysheet-change-size-line").css({ left: x });
                        $("#luckysheet-cols-change-size").css({ left: x - 2 });
                    }
                } else if (Store.luckysheet_rows_change_size) {
                    let mouse = mouseposition(event.pageX, event.pageY);
                    let scrollTop = $("#luckysheet-rows-h").scrollTop();
                    let y = mouse[1] + scrollTop;
                    let winH = $(window).height();

                    let row_location = rowLocation(y),
                        row = row_location[1],
                        row_pre = row_location[0],
                        row_index = row_location[2];

                    if (y + 3 - Store.luckysheet_rows_change_size_start[0] > 19 && y < winH + scrollTop - 200) {
                        $("#luckysheet-change-size-line").css({ top: y });
                        $("#luckysheet-rows-change-size").css({ top: y });
                    }
                }
                // chart move
                else if (!!Store.chartparam.luckysheetCurrentChartMove) {
                    const mouse = mouseposition(event.pageX, event.pageY);
                    const x = mouse[0] + $("#luckysheet-cell-main").scrollLeft();
                    const y = mouse[1] + $("#luckysheet-cell-main").scrollTop();

                    const myh = Store.chartparam.luckysheetCurrentChartMoveObj.height(),
                        myw = Store.chartparam.luckysheetCurrentChartMoveObj.width();
                    let top = y - Store.chartparam.luckysheetCurrentChartMoveXy[1],
                        left = x - Store.chartparam.luckysheetCurrentChartMoveXy[0];

                    if (top < 0) {
                        top = 0;
                    }

                    if (top + myh + 42 + 6 > Store.chartparam.luckysheetCurrentChartMoveWinH) {
                        top = Store.chartparam.luckysheetCurrentChartMoveWinH - myh - 42 - 6;
                    }

                    if (left < 0) {
                        left = 0;
                    }

                    if (left + myw + 22 + 36 > Store.chartparam.luckysheetCurrentChartMoveWinW) {
                        left = Store.chartparam.luckysheetCurrentChartMoveWinW - myw - 22 - 36;
                    }

                    Store.chartparam.luckysheetCurrentChartMoveObj.css({ top: top, left: left });

                    if (
                        luckysheetFreezen.freezenhorizontaldata != null ||
                        luckysheetFreezen.freezenverticaldata != null
                    ) {
                        luckysheetFreezen.scrollAdapt();

                        const toffset = Store.chartparam.luckysheetCurrentChartMoveObj.offset();
                        const tpsition = Store.chartparam.luckysheetCurrentChartMoveObj.position();
                        Store.chartparam.luckysheetCurrentChartMoveXy = [
                            event.pageX - toffset.left,
                            event.pageY - toffset.top,
                            tpsition.left,
                            tpsition.top,
                            $("#luckysheet-scrollbar-x").scrollLeft(),
                            $("#luckysheet-scrollbar-y").scrollTop(),
                        ];
                    }
                }
                // chart resize
                else if (!!Store.chartparam.luckysheetCurrentChartResize) {
                    const scrollTop = $("#luckysheet-cell-main").scrollTop(),
                        scrollLeft = $("#luckysheet-cell-main").scrollLeft();
                    const mouse = mouseposition(event.pageX, event.pageY);
                    const x = mouse[0] + scrollLeft;
                    const y = mouse[1] + scrollTop;

                    if (x < 0 || y < 0) {
                        return false;
                    }

                    const myh = Store.chartparam.luckysheetCurrentChartResizeObj.height(),
                        myw = Store.chartparam.luckysheetCurrentChartResizeObj.width();
                    const topchange = y - Store.chartparam.luckysheetCurrentChartResizeXy[1],
                        leftchange = x - Store.chartparam.luckysheetCurrentChartResizeXy[0];

                    let top = Store.chartparam.luckysheetCurrentChartResizeXy[5],
                        height = Store.chartparam.luckysheetCurrentChartResizeXy[3],
                        left = Store.chartparam.luckysheetCurrentChartResizeXy[4],
                        width = Store.chartparam.luckysheetCurrentChartResizeXy[2];

                    if (
                        Store.chartparam.luckysheetCurrentChartResize == "lm" ||
                        Store.chartparam.luckysheetCurrentChartResize == "lt" ||
                        Store.chartparam.luckysheetCurrentChartResize == "lb"
                    ) {
                        left = x;
                        width = Store.chartparam.luckysheetCurrentChartResizeXy[2] - leftchange;
                        if (
                            left >
                            Store.chartparam.luckysheetCurrentChartResizeXy[2] +
                                Store.chartparam.luckysheetCurrentChartResizeXy[4] -
                                60
                        ) {
                            left =
                                Store.chartparam.luckysheetCurrentChartResizeXy[2] +
                                Store.chartparam.luckysheetCurrentChartResizeXy[4] -
                                60;
                            width =
                                Store.chartparam.luckysheetCurrentChartResizeXy[2] -
                                (Store.chartparam.luckysheetCurrentChartResizeXy[2] +
                                    Store.chartparam.luckysheetCurrentChartResizeXy[4] -
                                    60 -
                                    Store.chartparam.luckysheetCurrentChartResizeXy[0]);
                        } else if (left <= 0) {
                            left = 0;
                            width =
                                Store.chartparam.luckysheetCurrentChartResizeXy[2] +
                                Store.chartparam.luckysheetCurrentChartResizeXy[0];
                        }
                    }

                    if (
                        Store.chartparam.luckysheetCurrentChartResize == "rm" ||
                        Store.chartparam.luckysheetCurrentChartResize == "rt" ||
                        Store.chartparam.luckysheetCurrentChartResize == "rb"
                    ) {
                        width = Store.chartparam.luckysheetCurrentChartResizeXy[2] + leftchange;
                        if (width < 60) {
                            width = 60;
                        } else if (
                            width >=
                            Store.chartparam.luckysheetCurrentChartResizeWinW -
                                Store.chartparam.luckysheetCurrentChartResizeXy[4] -
                                22 -
                                36
                        ) {
                            width =
                                Store.chartparam.luckysheetCurrentChartResizeWinW -
                                Store.chartparam.luckysheetCurrentChartResizeXy[4] -
                                22 -
                                36;
                        }
                    }

                    if (
                        Store.chartparam.luckysheetCurrentChartResize == "mt" ||
                        Store.chartparam.luckysheetCurrentChartResize == "lt" ||
                        Store.chartparam.luckysheetCurrentChartResize == "rt"
                    ) {
                        top = y;
                        height = Store.chartparam.luckysheetCurrentChartResizeXy[3] - topchange;
                        if (
                            top >
                            Store.chartparam.luckysheetCurrentChartResizeXy[3] +
                                Store.chartparam.luckysheetCurrentChartResizeXy[5] -
                                60
                        ) {
                            top =
                                Store.chartparam.luckysheetCurrentChartResizeXy[3] +
                                Store.chartparam.luckysheetCurrentChartResizeXy[5] -
                                60;
                            height =
                                Store.chartparam.luckysheetCurrentChartResizeXy[3] -
                                (Store.chartparam.luckysheetCurrentChartResizeXy[3] +
                                    Store.chartparam.luckysheetCurrentChartResizeXy[5] -
                                    60 -
                                    Store.chartparam.luckysheetCurrentChartResizeXy[1]);
                        } else if (top <= 0) {
                            top = 0;
                            height =
                                Store.chartparam.luckysheetCurrentChartResizeXy[3] +
                                Store.chartparam.luckysheetCurrentChartResizeXy[1];
                        }
                    }

                    if (
                        Store.chartparam.luckysheetCurrentChartResize == "mb" ||
                        Store.chartparam.luckysheetCurrentChartResize == "lb" ||
                        Store.chartparam.luckysheetCurrentChartResize == "rb"
                    ) {
                        height = Store.chartparam.luckysheetCurrentChartResizeXy[3] + topchange;
                        if (height < 60) {
                            height = 60;
                        } else if (
                            height >=
                            Store.chartparam.luckysheetCurrentChartResizeWinH -
                                Store.chartparam.luckysheetCurrentChartResizeXy[5] -
                                42 -
                                6
                        ) {
                            height =
                                Store.chartparam.luckysheetCurrentChartResizeWinH -
                                Store.chartparam.luckysheetCurrentChartResizeXy[5] -
                                42 -
                                6;
                        }
                    }

                    const resizedata = { top: top, left: left, height: height, width: width };
                    Store.chartparam.luckysheetCurrentChartResizeObj.css(resizedata);
                    // resize chart
                    Store.resizeChart(Store.chartparam.luckysheetCurrentChart);
                }
                //image move
                else if (imageCtrl.move) {
                    let mouse = mouseposition(event.pageX, event.pageY);

                    let x = mouse[0] + $("#luckysheet-cell-main").scrollLeft();
                    let y = mouse[1] + $("#luckysheet-cell-main").scrollTop();

                    let imgItem = imageCtrl.images[imageCtrl.currentImgId];
                    if (imgItem.isFixedPos) {
                        x = event.pageX;
                        y = event.pageY;
                    }

                    let myh = $("#luckysheet-modal-dialog-activeImage").height(),
                        myw = $("#luckysheet-modal-dialog-activeImage").width();

                    let top = y - imageCtrl.moveXY[1],
                        left = x - imageCtrl.moveXY[0];

                    let minTop = 0,
                        maxTop = imageCtrl.currentWinH - myh - 42 - 6,
                        minLeft = 0,
                        maxLeft = imageCtrl.currentWinW - myw - 22 - 36;

                    if (imgItem.isFixedPos) {
                        minTop =
                            Store.infobarHeight +
                            Store.toolbarHeight +
                            Store.calculatebarHeight +
                            Store.columnHeaderHeight;
                        maxTop = minTop + Store.cellmainHeight - Store.cellMainSrollBarSize - myh;
                        minLeft = Store.rowHeaderWidth;
                        maxLeft = minLeft + Store.cellmainWidth - Store.cellMainSrollBarSize - myw;
                    }

                    if (top < minTop) {
                        top = minTop;
                    }

                    if (top > maxTop) {
                        top = maxTop;
                    }

                    if (left < minLeft) {
                        left = minLeft;
                    }

                    if (left > maxLeft) {
                        left = maxLeft;
                    }

                    $("#luckysheet-modal-dialog-activeImage").css({ left: left, top: top });
                }
                //image resize
                else if (!!imageCtrl.resize) {
                    let mouse = mouseposition(event.pageX, event.pageY);
                    let scrollLeft = $("#luckysheet-cell-main").scrollLeft();
                    let scrollTop = $("#luckysheet-cell-main").scrollTop();
                    let x = mouse[0] + scrollLeft;
                    let y = mouse[1] + scrollTop;

                    if (x < 0 || y < 0) {
                        return false;
                    }

                    let resizeXY = imageCtrl.resizeXY;

                    let topchange = y - resizeXY[1],
                        leftchange = x - resizeXY[0];

                    let top = resizeXY[5],
                        height = resizeXY[3],
                        left = resizeXY[4],
                        width = resizeXY[2];

                    let resize = imageCtrl.resize;
                    let imgItem = imageCtrl.images[imageCtrl.currentImgId];

                    if (imgItem.isFixedPos) {
                        let minTop =
                            Store.infobarHeight +
                            Store.toolbarHeight +
                            Store.calculatebarHeight +
                            Store.columnHeaderHeight;
                        let minLeft = Store.rowHeaderWidth;

                        if (resize == "lt") {
                            //左上
                            left = resizeXY[4] - resizeXY[6] + leftchange;

                            if (left < minLeft) {
                                left = minLeft;
                            }

                            if (left > resizeXY[4] - resizeXY[6] + resizeXY[2] - 1) {
                                left = resizeXY[4] - resizeXY[6] + resizeXY[2] - 1;
                            }

                            width = resizeXY[4] - resizeXY[6] + resizeXY[2] - left;

                            height = Math.round(width * (resizeXY[3] / resizeXY[2]));
                            top = resizeXY[5] - resizeXY[7] + resizeXY[3] - height;

                            if (top < minTop) {
                                top = minTop;
                                height = resizeXY[5] - resizeXY[7] + resizeXY[3] - top;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                                left = resizeXY[4] - resizeXY[6] + resizeXY[2] - width;
                            }

                            if (top > resizeXY[5] - resizeXY[7] + resizeXY[3] - 1) {
                                top = resizeXY[5] - resizeXY[7] + resizeXY[3] - 1;
                                height = resizeXY[5] - resizeXY[7] + resizeXY[3] - top;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                                left = resizeXY[4] - resizeXY[6] + resizeXY[2] - width;
                            }
                        } else if (resize == "lm") {
                            //左中
                            left = resizeXY[4] - resizeXY[6] + leftchange;

                            if (left < minLeft) {
                                left = minLeft;
                            }

                            if (left > resizeXY[4] - resizeXY[6] + resizeXY[2] - 1) {
                                left = resizeXY[4] - resizeXY[6] + resizeXY[2] - 1;
                            }

                            width = resizeXY[4] - resizeXY[6] + resizeXY[2] - left;

                            top = resizeXY[5] - resizeXY[7];
                            height = resizeXY[3];
                        } else if (resize == "lb") {
                            //左下
                            left = resizeXY[4] - resizeXY[6] + leftchange;

                            if (left < minLeft) {
                                left = minLeft;
                            }

                            if (left > resizeXY[4] - resizeXY[6] + resizeXY[2] - 1) {
                                left = resizeXY[4] - resizeXY[6] + resizeXY[2] - 1;
                            }

                            width = resizeXY[4] - resizeXY[6] + resizeXY[2] - left;

                            height = Math.round(width * (resizeXY[3] / resizeXY[2]));

                            top = resizeXY[5] - resizeXY[7];

                            if (height < 1) {
                                height = 1;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                                left = resizeXY[4] - resizeXY[6] + resizeXY[2] - width;
                            }

                            if (height > minTop + Store.cellmainHeight - Store.cellMainSrollBarSize - top) {
                                height = minTop + Store.cellmainHeight - Store.cellMainSrollBarSize - top;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                                left = resizeXY[4] - resizeXY[6] + resizeXY[2] - width;
                            }
                        } else if (resize == "rt") {
                            //右上
                            left = resizeXY[4] - resizeXY[6];

                            width = resizeXY[2] + leftchange;

                            if (width < 1) {
                                width = 1;
                            }

                            if (width > minLeft + Store.cellmainWidth - Store.cellMainSrollBarSize - left) {
                                width = minLeft + Store.cellmainWidth - Store.cellMainSrollBarSize - left;
                            }

                            height = Math.round(width * (resizeXY[3] / resizeXY[2]));
                            top = resizeXY[5] - resizeXY[7] + resizeXY[3] - height;

                            if (top < minTop) {
                                top = minTop;
                                height = resizeXY[5] - resizeXY[7] + resizeXY[3] - top;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                            }

                            if (top > resizeXY[5] - resizeXY[7] + resizeXY[3] - 1) {
                                top = resizeXY[5] - resizeXY[7] + resizeXY[3] - 1;
                                height = resizeXY[5] - resizeXY[7] + resizeXY[3] - top;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                            }
                        } else if (resize == "rm") {
                            //右中
                            left = resizeXY[4] - resizeXY[6];

                            width = resizeXY[2] + leftchange;

                            if (width < 1) {
                                width = 1;
                            }

                            if (width > minLeft + Store.cellmainWidth - Store.cellMainSrollBarSize - left) {
                                width = minLeft + Store.cellmainWidth - Store.cellMainSrollBarSize - left;
                            }

                            top = resizeXY[5] - resizeXY[7];
                            height = resizeXY[3];
                        } else if (resize == "rb") {
                            //右下
                            left = resizeXY[4] - resizeXY[6];

                            width = resizeXY[2] + leftchange;

                            if (width < 1) {
                                width = 1;
                            }

                            if (width > minLeft + Store.cellmainWidth - Store.cellMainSrollBarSize - left) {
                                width = minLeft + Store.cellmainWidth - Store.cellMainSrollBarSize - left;
                            }

                            height = Math.round(width * (resizeXY[3] / resizeXY[2]));
                            top = resizeXY[5] - resizeXY[7];

                            if (height < 1) {
                                height = 1;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                            }

                            if (height > minTop + Store.cellmainHeight - Store.cellMainSrollBarSize - top) {
                                height = minTop + Store.cellmainHeight - Store.cellMainSrollBarSize - top;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                            }
                        } else if (resize == "mt") {
                            //中上
                            left = resizeXY[4] - resizeXY[6];
                            width = resizeXY[2];

                            top = resizeXY[5] - resizeXY[7] + topchange;

                            if (top < minTop) {
                                top = minTop;
                            }

                            if (top > resizeXY[5] - resizeXY[7] + resizeXY[3] - 1) {
                                top = resizeXY[5] - resizeXY[7] + resizeXY[3] - 1;
                            }

                            height = resizeXY[5] - resizeXY[7] + resizeXY[3] - top;
                        } else if (resize == "mb") {
                            //中下
                            left = resizeXY[4] - resizeXY[6];
                            width = resizeXY[2];

                            top = resizeXY[5] - resizeXY[7];

                            height = resizeXY[3] + topchange;

                            if (height < 1) {
                                height = 1;
                            }

                            if (height > minTop + Store.cellmainHeight - Store.cellMainSrollBarSize - top) {
                                height = minTop + Store.cellmainHeight - Store.cellMainSrollBarSize - top;
                            }
                        }
                    } else {
                        if (resize == "lt") {
                            //左上
                            left = x;
                            width = resizeXY[2] - leftchange;

                            if (left > resizeXY[2] + resizeXY[4] - 1) {
                                left = resizeXY[2] + resizeXY[4] - 1;
                                width = resizeXY[2] + resizeXY[0] - (resizeXY[2] + resizeXY[4] - 1);
                            } else if (left <= 0) {
                                left = 0;
                                width = resizeXY[2] + resizeXY[0];
                            }

                            height = Math.round(width * (resizeXY[3] / resizeXY[2]));
                            top = resizeXY[3] + resizeXY[1] - height;

                            if (top > resizeXY[3] + resizeXY[5] - 1) {
                                top = resizeXY[3] + resizeXY[5] - 1;
                                height = resizeXY[3] + resizeXY[1] - (resizeXY[3] + resizeXY[5] - 1);

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                                left = resizeXY[2] + resizeXY[0] - width;
                            } else if (top <= 0) {
                                top = 0;
                                height = resizeXY[3] + resizeXY[1];

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                                left = resizeXY[2] + resizeXY[0] - width;
                            }
                        } else if (resize == "lm") {
                            //左中
                            left = x;
                            width = resizeXY[2] - leftchange;

                            if (left > resizeXY[2] + resizeXY[4] - 1) {
                                left = resizeXY[2] + resizeXY[4] - 1;
                                width = resizeXY[2] + resizeXY[0] - (resizeXY[2] + resizeXY[4] - 1);
                            } else if (left <= 0) {
                                left = 0;
                                width = resizeXY[2] + resizeXY[0];
                            }
                        } else if (resize == "lb") {
                            //左下
                            left = x;
                            width = resizeXY[2] - leftchange;

                            if (left > resizeXY[2] + resizeXY[4] - 1) {
                                left = resizeXY[2] + resizeXY[4] - 1;
                                width = resizeXY[2] + resizeXY[0] - (resizeXY[2] + resizeXY[4] - 1);
                            } else if (left <= 0) {
                                left = 0;
                                width = resizeXY[2] + resizeXY[0];
                            }

                            height = Math.round(width * (resizeXY[3] / resizeXY[2]));

                            if (height < 1) {
                                height = 1;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                                left = resizeXY[2] + resizeXY[0] - width;
                            } else if (height >= imageCtrl.currentWinH - resizeXY[5] - 42 - 6) {
                                height = imageCtrl.currentWinH - resizeXY[5] - 42 - 6;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                                left = resizeXY[2] + resizeXY[0] - width;
                            }
                        } else if (resize == "rt") {
                            //右上
                            width = resizeXY[2] + leftchange;

                            if (width < 1) {
                                width = 1;
                            } else if (width >= imageCtrl.currentWinW - resizeXY[4] - 22 - 36) {
                                width = imageCtrl.currentWinW - resizeXY[4] - 22 - 36;
                            }

                            height = Math.round(width * (resizeXY[3] / resizeXY[2]));
                            top = resizeXY[3] + resizeXY[1] - height;

                            if (top > resizeXY[3] + resizeXY[5] - 1) {
                                top = resizeXY[3] + resizeXY[5] - 1;
                                height = resizeXY[3] + resizeXY[1] - (resizeXY[3] + resizeXY[5] - 1);

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                            } else if (top <= 0) {
                                top = 0;
                                height = resizeXY[3] + resizeXY[1];

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                            }
                        } else if (resize == "rm") {
                            //右中
                            width = resizeXY[2] + leftchange;

                            if (width < 1) {
                                width = 1;
                            } else if (width >= imageCtrl.currentWinW - resizeXY[4] - 22 - 36) {
                                width = imageCtrl.currentWinW - resizeXY[4] - 22 - 36;
                            }
                        } else if (resize == "rb") {
                            //右下
                            width = resizeXY[2] + leftchange;

                            if (width < 1) {
                                width = 1;
                            } else if (width >= imageCtrl.currentWinW - resizeXY[4] - 22 - 36) {
                                width = imageCtrl.currentWinW - resizeXY[4] - 22 - 36;
                            }

                            height = Math.round(width * (resizeXY[3] / resizeXY[2]));

                            if (height < 1) {
                                height = 1;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                            } else if (height >= imageCtrl.currentWinH - resizeXY[5] - 42 - 6) {
                                height = imageCtrl.currentWinH - resizeXY[5] - 42 - 6;

                                width = Math.round(height * (resizeXY[2] / resizeXY[3]));
                            }
                        } else if (resize == "mt") {
                            //中上
                            top = y;
                            height = resizeXY[3] - topchange;

                            if (top > resizeXY[3] + resizeXY[5] - 1) {
                                top = resizeXY[3] + resizeXY[5] - 1;
                                height = resizeXY[3] + resizeXY[1] - (resizeXY[3] + resizeXY[5] - 1);
                            } else if (top <= 0) {
                                top = 0;
                                height = resizeXY[3] + resizeXY[1];
                            }
                        } else if (resize == "mb") {
                            //中下
                            height = resizeXY[3] + topchange;

                            if (height < 1) {
                                height = 1;
                            } else if (height >= imageCtrl.currentWinH - resizeXY[5] - 42 - 6) {
                                height = imageCtrl.currentWinH - resizeXY[5] - 42 - 6;
                            }
                        }
                    }

                    $("#luckysheet-modal-dialog-activeImage").css({
                        width: width,
                        height: height,
                        left: left,
                        top: top,
                    });

                    let scaleX = width / imgItem.crop.width;
                    let scaleY = height / imgItem.crop.height;
                    let defaultWidth = Math.round(imgItem.default.width * scaleX);
                    let defaultHeight = Math.round(imgItem.default.height * scaleY);
                    let offsetLeft = Math.round(imgItem.crop.offsetLeft * scaleX);
                    let offsetTop = Math.round(imgItem.crop.offsetTop * scaleY);

                    $("#luckysheet-modal-dialog-activeImage .luckysheet-modal-dialog-content").css({
                        "background-size": defaultWidth + "px " + defaultHeight + "px",
                        "background-position": -offsetLeft + "px " + -offsetTop + "px",
                    });
                }
                //image cropChange
                else if (!!imageCtrl.cropChange) {
                    let mouse = mouseposition(event.pageX, event.pageY);
                    let x = mouse[0] + $("#luckysheet-cell-main").scrollLeft();
                    let y = mouse[1] + $("#luckysheet-cell-main").scrollTop();

                    if (x < 0 || y < 0) {
                        return false;
                    }

                    let cropChangeXY = imageCtrl.cropChangeXY;

                    let topchange = y - cropChangeXY[1],
                        leftchange = x - cropChangeXY[0];

                    let imgItem = imageCtrl.images[imageCtrl.currentImgId];
                    let cropChange = imageCtrl.cropChange;
                    let width, height, offsetLeft, offsetTop;

                    if (cropChange == "lt") {
                        //左上
                        offsetLeft = imgItem.crop.offsetLeft + leftchange;

                        if (offsetLeft < 0) {
                            offsetLeft = 0;
                        }

                        if (offsetLeft > imgItem.crop.width + imgItem.crop.offsetLeft - 1) {
                            offsetLeft = imgItem.crop.width + imgItem.crop.offsetLeft - 1;
                        }

                        width = imgItem.crop.width + imgItem.crop.offsetLeft - offsetLeft;

                        offsetTop = imgItem.crop.offsetTop + topchange;

                        if (offsetTop < 0) {
                            offsetTop = 0;
                        }

                        if (offsetTop > imgItem.crop.height + imgItem.crop.offsetTop - 1) {
                            offsetTop = imgItem.crop.height + imgItem.crop.offsetTop - 1;
                        }

                        height = imgItem.crop.height + imgItem.crop.offsetTop - offsetTop;
                    } else if (cropChange == "lm") {
                        //左中
                        offsetLeft = imgItem.crop.offsetLeft + leftchange;

                        if (offsetLeft < 0) {
                            offsetLeft = 0;
                        }

                        if (offsetLeft > imgItem.crop.width + imgItem.crop.offsetLeft - 1) {
                            offsetLeft = imgItem.crop.width + imgItem.crop.offsetLeft - 1;
                        }

                        width = imgItem.crop.width + imgItem.crop.offsetLeft - offsetLeft;

                        offsetTop = imgItem.crop.offsetTop;
                        height = imgItem.crop.height;
                    } else if (cropChange == "lb") {
                        //左下
                        offsetLeft = imgItem.crop.offsetLeft + leftchange;

                        if (offsetLeft < 0) {
                            offsetLeft = 0;
                        }

                        if (offsetLeft > imgItem.crop.width + imgItem.crop.offsetLeft - 1) {
                            offsetLeft = imgItem.crop.width + imgItem.crop.offsetLeft - 1;
                        }

                        width = imgItem.crop.width + imgItem.crop.offsetLeft - offsetLeft;

                        offsetTop = imgItem.crop.offsetTop;

                        height = imgItem.crop.height + topchange;

                        if (height < 1) {
                            height = 1;
                        }

                        if (height > imgItem.default.height - offsetTop) {
                            height = imgItem.default.height - offsetTop;
                        }
                    } else if (cropChange == "rt") {
                        //右上
                        offsetLeft = imgItem.crop.offsetLeft;

                        width = imgItem.crop.width + leftchange;

                        if (width < 1) {
                            width = 1;
                        }

                        if (width > imgItem.default.width - offsetLeft) {
                            width = imgItem.default.width - offsetLeft;
                        }

                        offsetTop = imgItem.crop.offsetTop + topchange;

                        if (offsetTop < 0) {
                            offsetTop = 0;
                        }

                        if (offsetTop > imgItem.crop.height + imgItem.crop.offsetTop - 1) {
                            offsetTop = imgItem.crop.height + imgItem.crop.offsetTop - 1;
                        }

                        height = imgItem.crop.height + imgItem.crop.offsetTop - offsetTop;
                    } else if (cropChange == "rm") {
                        //右中
                        offsetLeft = imgItem.crop.offsetLeft;

                        width = imgItem.crop.width + leftchange;

                        if (width < 1) {
                            width = 1;
                        }

                        if (width > imgItem.default.width - offsetLeft) {
                            width = imgItem.default.width - offsetLeft;
                        }

                        offsetTop = imgItem.crop.offsetTop;
                        height = imgItem.crop.height;
                    } else if (cropChange == "rb") {
                        //右下
                        offsetLeft = imgItem.crop.offsetLeft;

                        width = imgItem.crop.width + leftchange;

                        if (width < 1) {
                            width = 1;
                        }

                        if (width > imgItem.default.width - offsetLeft) {
                            width = imgItem.default.width - offsetLeft;
                        }

                        offsetTop = imgItem.crop.offsetTop;

                        height = imgItem.crop.height + topchange;

                        if (height < 1) {
                            height = 1;
                        }

                        if (height > imgItem.default.height - offsetTop) {
                            height = imgItem.default.height - offsetTop;
                        }
                    } else if (cropChange == "mt") {
                        //中上
                        offsetLeft = imgItem.crop.offsetLeft;
                        width = imgItem.crop.width;

                        offsetTop = imgItem.crop.offsetTop + topchange;

                        if (offsetTop < 0) {
                            offsetTop = 0;
                        }

                        if (offsetTop > imgItem.crop.height + imgItem.crop.offsetTop - 1) {
                            offsetTop = imgItem.crop.height + imgItem.crop.offsetTop - 1;
                        }

                        height = imgItem.crop.height + imgItem.crop.offsetTop - offsetTop;
                    } else if (cropChange == "mb") {
                        //中下
                        offsetLeft = imgItem.crop.offsetLeft;
                        width = imgItem.crop.width;

                        offsetTop = imgItem.crop.offsetTop;

                        height = imgItem.crop.height + topchange;

                        if (height < 1) {
                            height = 1;
                        }

                        if (height > imgItem.default.height - offsetTop) {
                            height = imgItem.default.height - offsetTop;
                        }
                    }

                    let left = imgItem.default.left + offsetLeft;
                    let top = imgItem.default.top + offsetTop;

                    if (imgItem.isFixedPos) {
                        left = imgItem.fixedLeft + offsetLeft;
                        top = imgItem.fixedTop + offsetTop;
                    }

                    $("#luckysheet-modal-dialog-cropping")
                        .show()
                        .css({
                            width: width,
                            height: height,
                            left: left,
                            top: top,
                        });

                    let imageUrlHandle = Store.toJsonOptions && Store.toJsonOptions["imageUrlHandle"];
                    let imgSrc = typeof imageUrlHandle === "function" ? imageUrlHandle(imgItem.src) : imgItem.src;

                    $("#luckysheet-modal-dialog-cropping .cropping-mask").css({
                        width: imgItem.default.width,
                        height: imgItem.default.height,
                        "background-image": "url(" + imgSrc + ")",
                        left: -offsetLeft,
                        top: -offsetTop,
                    });

                    $("#luckysheet-modal-dialog-cropping .cropping-content").css({
                        "background-image": "url(" + imgSrc + ")",
                        "background-size": imgItem.default.width + "px " + imgItem.default.height + "px",
                        "background-position": -offsetLeft + "px " + -offsetTop + "px",
                    });

                    imageCtrl.cropChangeObj = {
                        width: width,
                        height: height,
                        offsetLeft: offsetLeft,
                        offsetTop: offsetTop,
                    };
                } else if (luckysheetPostil.move) {
                    let mouse = mouseposition(event.pageX, event.pageY);
                    let x = mouse[0] + $("#luckysheet-cell-main").scrollLeft();
                    let y = mouse[1] + $("#luckysheet-cell-main").scrollTop();

                    let myh = luckysheetPostil.currentObj.outerHeight(),
                        myw = luckysheetPostil.currentObj.outerWidth();

                    let top = y - luckysheetPostil.moveXY[1],
                        left = x - luckysheetPostil.moveXY[0];

                    if (top < 0) {
                        top = 0;
                    }

                    if (top + myh + 42 + 6 > luckysheetPostil.currentWinH) {
                        top = luckysheetPostil.currentWinH - myh - 42 - 6;
                    }

                    if (left < 0) {
                        left = 0;
                    }

                    if (left + myw + 22 + 36 > luckysheetPostil.currentWinW) {
                        left = luckysheetPostil.currentWinW - myw - 22 - 36;
                    }

                    luckysheetPostil.currentObj.css({ left: left, top: top });
                } else if (!!luckysheetPostil.resize) {
                    let mouse = mouseposition(event.pageX, event.pageY);
                    let x = mouse[0] + $("#luckysheet-cell-main").scrollLeft();
                    let y = mouse[1] + $("#luckysheet-cell-main").scrollTop();

                    if (x < 0 || y < 0) {
                        return false;
                    }

                    let resizeXY = luckysheetPostil.resizeXY;

                    let topchange = y - resizeXY[1],
                        leftchange = x - resizeXY[0];

                    let top = resizeXY[5],
                        height = resizeXY[3],
                        left = resizeXY[4],
                        width = resizeXY[2];

                    let resize = luckysheetPostil.resize;

                    if (resize == "lm" || resize == "lt" || resize == "lb") {
                        left = x;
                        width = resizeXY[2] - leftchange;

                        if (left > resizeXY[2] + resizeXY[4] - 60) {
                            left = resizeXY[2] + resizeXY[4] - 60;
                            width = resizeXY[2] - (resizeXY[2] + resizeXY[4] - 60 - resizeXY[0]);
                        } else if (left <= 0) {
                            left = 0;
                            width = resizeXY[2] + resizeXY[0];
                        }
                    }

                    if (resize == "rm" || resize == "rt" || resize == "rb") {
                        width = resizeXY[2] + leftchange;

                        if (width < 60) {
                            width = 60;
                        } else if (width >= luckysheetPostil.currentWinW - resizeXY[4] - 22 - 36) {
                            width = luckysheetPostil.currentWinW - resizeXY[4] - 22 - 36;
                        }
                    }

                    if (resize == "mt" || resize == "lt" || resize == "rt") {
                        top = y;
                        height = resizeXY[3] - topchange;

                        if (top > resizeXY[3] + resizeXY[5] - 60) {
                            top = resizeXY[3] + resizeXY[5] - 60;
                            height = resizeXY[3] - (resizeXY[3] + resizeXY[5] - 60 - resizeXY[1]);
                        } else if (top <= 0) {
                            top = 0;
                            height = resizeXY[3] + resizeXY[1];
                        }
                    }

                    if (resize == "mb" || resize == "lb" || resize == "rb") {
                        height = resizeXY[3] + topchange;

                        if (height < 60) {
                            height = 60;
                        } else if (height >= luckysheetPostil.currentWinH - resizeXY[5] - 42 - 6) {
                            height = luckysheetPostil.currentWinH - resizeXY[5] - 42 - 6;
                        }
                    }

                    luckysheetPostil.currentObj.css({ width: width, height: height, left: left, top: top });
                } else if (!!formula.rangeResize) {
                    formula.rangeResizeDraging(
                        event,
                        formula.rangeResizeObj,
                        formula.rangeResizexy,
                        formula.rangeResize,
                        formula.rangeResizeWinW,
                        formula.rangeResizeWinH,
                        Store.ch_width,
                        Store.rh_height,
                    );
                } else if (!!formula.rangeMove) {
                    formula.rangeMoveDraging(
                        event,
                        formula.rangeMovexy,
                        formula.rangeMoveObj.data("range"),
                        formula.rangeMoveObj,
                        Store.sheetBarHeight,
                        Store.statisticBarHeight,
                    );
                } else if (!!Store.chart_selection.rangeResize) {
                    Store.chart_selection.rangeResizeDraging(event, Store.sheetBarHeight, Store.statisticBarHeight);
                } else if (!!Store.chart_selection.rangeMove) {
                    Store.chart_selection.rangeMoveDraging(event, Store.sheetBarHeight, Store.statisticBarHeight);
                }

                Store.jfautoscrollTimeout = window.requestAnimationFrame(mouseRender);
            }

            Store.jfautoscrollTimeout = window.requestAnimationFrame(mouseRender);
        }
    });
}
