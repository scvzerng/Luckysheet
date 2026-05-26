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

export default function documentMouseup() {
    //表格mouseup
    $(document).on("mouseup.luckysheetEvent", function(event) {
        if (luckysheetConfigsetting && luckysheetConfigsetting.hook && luckysheetConfigsetting.hook.sheetMouseup) {
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
                pivotTableMoveState: !!pivotTable && pivotTable.movestate,
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

            method.createHookFunction(
                "sheetMouseup",
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
            // }
        }

        //数据窗格主体
        if (Store.luckysheet_select_status) {
            clearTimeout(Store.countfuncTimeout);
            Store.countfuncTimeout = setTimeout(function() {
                countfunc();
            }, 0);

            //格式刷
            if (menuButton.luckysheetPaintModelOn) {
                selection.pasteHandlerOfPaintModel(Store.luckysheet_copy_save);

                if (menuButton.luckysheetPaintSingle) {
                    //单次 格式刷
                    menuButton.cancelPaintModel();
                }
            }
        }

        Store.luckysheet_select_status = false;
        window.cancelAnimationFrame(Store.jfautoscrollTimeout);
        Store.luckysheet_scroll_status = false;

        $("#luckysheet-cell-selected")
            .find(".luckysheet-cs-fillhandle")
            .css("cursor", "crosshair")
            .end()
            .find(".luckysheet-cs-draghandle")
            .css("cursor", "move");
        $("#luckysheet-cell-main, #luckysheetTableContent, #luckysheet-sheettable_0").css("cursor", "default");

        //行标题窗格主体
        Store.luckysheet_rows_selected_status = false;

        //列标题窗格主体
        Store.luckysheet_cols_selected_status = false;

        Store.luckysheet_model_move_state = false;

        if (formula.functionResizeStatus) {
            formula.functionResizeStatus = false;
            $("#luckysheet-wa-calculate-size").removeAttr("style");
        }

        if (!!luckysheetFreezen.horizontalmovestate) {
            luckysheetFreezen.horizontalmovestate = false;
            $("#luckysheet-freezebar-horizontal").removeClass("luckysheet-freezebar-active");
            $("#luckysheet-freezebar-horizontal")
                .find(".luckysheet-freezebar-horizontal-handle")
                .css("cursor", "-webkit-grab");
            if (luckysheetFreezen.freezenhorizontaldata[4] <= Store.columnHeaderHeight) {
                luckysheetFreezen.cancelFreezenHorizontal();
            }
            luckysheetFreezen.createAssistCanvas();
            luckysheetrefreshgrid();
        }

        if (!!luckysheetFreezen.verticalmovestate) {
            luckysheetFreezen.verticalmovestate = false;
            $("#luckysheet-freezebar-vertical").removeClass("luckysheet-freezebar-active");
            $("#luckysheet-freezebar-vertical")
                .find(".luckysheet-freezebar-vertical-handle")
                .css("cursor", "-webkit-grab");
            if (luckysheetFreezen.freezenverticaldata[4] <= Store.rowHeaderWidth) {
                luckysheetFreezen.cancelFreezenVertical();
            }
            luckysheetFreezen.createAssistCanvas();
            luckysheetrefreshgrid();
        }

        if (!!pivotTable && pivotTable.movestate) {
            $("#luckysheet-modal-dialog-slider-pivot-move").remove();
            pivotTable.movestate = false;
            $(
                "#luckysheet-modal-dialog-pivotTable-list, #luckysheet-modal-dialog-config-filter, #luckysheet-modal-dialog-config-row, #luckysheet-modal-dialog-config-column, #luckysheet-modal-dialog-config-value",
            ).css("cursor", "default");
            if (pivotTable.movesave.containerid != "luckysheet-modal-dialog-pivotTable-list") {
                let $cur = $(event.target).closest(".luckysheet-modal-dialog-slider-config-list");
                if ($cur.length == 0) {
                    if (pivotTable.movesave.containerid == "luckysheet-modal-dialog-config-value") {
                        pivotTable.resetOrderby(pivotTable.movesave.obj);
                    }

                    pivotTable.movesave.obj.remove();
                    pivotTable.showvaluecolrow();
                    $("#luckysheet-modal-dialog-pivotTable-list")
                        .find(".luckysheet-modal-dialog-slider-list-item")
                        .each(function() {
                            $(this)
                                .find(".luckysheet-slider-list-item-selected")
                                .find("i")
                                .remove();
                        });

                    $(
                        "#luckysheet-modal-dialog-config-filter, #luckysheet-modal-dialog-config-row, #luckysheet-modal-dialog-config-column, #luckysheet-modal-dialog-config-value",
                    )
                        .find(".luckysheet-modal-dialog-slider-config-item")
                        .each(function() {
                            let index = $(this).data("index");

                            $("#luckysheet-modal-dialog-pivotTable-list")
                                .find(".luckysheet-modal-dialog-slider-list-item")
                                .each(function() {
                                    let $seleted = $(this).find(".luckysheet-slider-list-item-selected");
                                    if ($(this).data("index") == index && $seleted.find("i").length == 0) {
                                        $seleted.append('<i class="fa fa-check luckysheet-mousedown-cancel"></i>');
                                    }
                                });
                        });

                    pivotTable.refreshPivotTable();
                }
            }
        }

        if (Store.luckysheet_sheet_move_status) {
            Store.luckysheet_sheet_move_status = false;
            Store.luckysheet_sheet_move_data.activeobject.insertBefore($("#luckysheet-sheets-item-clone"));
            Store.luckysheet_sheet_move_data.activeobject.removeAttr("style");
            $("#luckysheet-sheets-item-clone").remove();
            Store.luckysheet_sheet_move_data.cursorobject.css({ cursor: "pointer" });
            Store.luckysheet_sheet_move_data = {};
            sheetmanage.reOrderAllSheet();
        }

        // chart move debounce timer clear
        clearTimeout(Store.chartparam.luckysheetCurrentChartMoveTimeout);

        //图表拖动 chartMix
        if (!!Store.chartparam.luckysheetCurrentChartMove) {
            Store.chartparam.luckysheetCurrentChartMove = false;
            if (Store.chartparam.luckysheetInsertChartTosheetChange) {
                //myTop, myLeft: 本次的chart框位置，scrollLeft,scrollTop: 上一次的滚动条位置
                var myTop = Store.chartparam.luckysheetCurrentChartMoveObj.css("top"),
                    myLeft = Store.chartparam.luckysheetCurrentChartMoveObj.css("left"),
                    scrollLeft = $("#luckysheet-cell-main").scrollLeft(),
                    scrollTop = $("#luckysheet-cell-main").scrollTop();

                //点击时候存储的信息，即上一次操作结束的图表信息，x,y: chart框位置，scrollLeft1,scrollTop1: 滚动条位置
                var x = Store.chartparam.luckysheetCurrentChartMoveXy[2];
                var y = Store.chartparam.luckysheetCurrentChartMoveXy[3];

                var scrollLeft1 = Store.chartparam.luckysheetCurrentChartMoveXy[4];
                var scrollTop1 = Store.chartparam.luckysheetCurrentChartMoveXy[5];

                var chart_id = Store.chartparam.luckysheetCurrentChartMoveObj
                    .find(".luckysheet-modal-dialog-content")
                    .attr("id");

                //去除chartobj,改用chart_id代替即可定位到此图表
                Store.jfredo.push({
                    type: "moveChart",
                    chart_id: chart_id,
                    sheetIndex: Store.currentSheetIndex,
                    myTop: myTop,
                    myLeft: myLeft,
                    scrollTop: scrollTop,
                    scrollLeft: scrollLeft,
                    x: x,
                    y: y,
                    scrollTop1: scrollTop1,
                    scrollLeft1: scrollLeft1,
                });

                // luckysheet.sheetmanage.saveChart({ "chart_id": chart_id, "sheetIndex": sheetIndex, "top": myTop, "left": myLeft });
            }
        }

        //图表改变大小 chartMix
        if (!!Store.chartparam.luckysheetCurrentChartResize) {
            Store.chartparam.luckysheetCurrentChartResize = null;
            if (Store.chartparam.luckysheetInsertChartTosheetChange) {
                var myHeight = Store.chartparam.luckysheetCurrentChartResizeObj.height(),
                    myWidth = Store.chartparam.luckysheetCurrentChartResizeObj.width(),
                    scrollLeft = $("#luckysheet-cell-main").scrollLeft(),
                    scrollTop = $("#luckysheet-cell-main").scrollTop();

                var myTop = Store.chartparam.luckysheetCurrentChartMoveObj.css("top"),
                    myLeft = Store.chartparam.luckysheetCurrentChartMoveObj.css("left");

                var chart_id = Store.chartparam.luckysheetCurrentChartResizeObj
                    .find(".luckysheet-modal-dialog-content")
                    .attr("id");

                var myWidth1 = Store.chartparam.luckysheetCurrentChartResizeXy[2];
                var myHeight1 = Store.chartparam.luckysheetCurrentChartResizeXy[3];
                var x = Store.chartparam.luckysheetCurrentChartResizeXy[4]; //增加上一次的位置x，y
                var y = Store.chartparam.luckysheetCurrentChartResizeXy[5];
                var scrollLeft1 = Store.chartparam.luckysheetCurrentChartResizeXy[6];
                var scrollTop1 = Store.chartparam.luckysheetCurrentChartResizeXy[7];

                Store.jfredo.push({
                    type: "resizeChart",
                    chart_id: chart_id,
                    sheetIndex: Store.currentSheetIndex,
                    myTop: myTop,
                    myLeft: myLeft,
                    myHeight: myHeight,
                    myWidth: myWidth,
                    scrollTop: scrollTop,
                    scrollLeft: scrollLeft,
                    x: x,
                    y: y,
                    myWidth1: myWidth1,
                    myHeight1: myHeight1,
                    scrollTop1: scrollTop1,
                    scrollLeft1: scrollLeft1,
                });

                //加上滚动条的位置
                // luckysheet.sheetmanage.saveChart({ "chart_id": chart_id, "sheetIndex": sheetIndex, "height": myHeight, "width": myWidth, "top": myTop, "left": myLeft, "scrollTop": scrollTop, "scrollLeft": scrollLeft });

            }
        }

        if (!!formula.rangeResize) {
            formula.rangeResizeDragged(
                event,
                formula.rangeResizeObj,
                formula.rangeResize,
                formula.rangeResizexy,
                formula.rangeResizeWinW,
                formula.rangeResizeWinH,
            );
        }

        //image move
        if (imageCtrl.move) {
            imageCtrl.moveImgItem();
        }

        //image resize
        if (imageCtrl.resize) {
            imageCtrl.resizeImgItem();
        }

        //image cropChange
        if (imageCtrl.cropChange) {
            imageCtrl.cropChangeImgItem();
        }

        //批注框 移动
        if (luckysheetPostil.move) {
            luckysheetPostil.move = false;

            let ps_id = luckysheetPostil.currentObj.closest(".luckysheet-postil-show").attr("id");

            let ps_r = ps_id.split("luckysheet-postil-show_")[1].split("_")[0];
            let ps_c = ps_id.split("luckysheet-postil-show_")[1].split("_")[1];

            let d = editor.deepCopyFlowData(Store.flowdata);
            let rc = [];

            d[ps_r][ps_c].ps.left = luckysheetPostil.currentObj.position().left;
            d[ps_r][ps_c].ps.top = luckysheetPostil.currentObj.position().top;
            d[ps_r][ps_c].ps.value = luckysheetPostil.currentObj
                .find(".formulaInputFocus")
                .html()
                .replaceAll("<div>", "\n")
                .replaceAll(/<(.*)>.*?|<(.*) \/>/g, "")
                .trim();

            rc.push(ps_r + "_" + ps_c);

            luckysheetPostil.ref(d, rc);

            $("#" + ps_id).remove();

            if (d[ps_r][ps_c].ps.isshow) {
                luckysheetPostil.buildPs(ps_r, ps_c, d[ps_r][ps_c].ps);
                $("#" + ps_id).addClass("luckysheet-postil-show-active");
                $("#" + ps_id)
                    .find(".luckysheet-postil-dialog-resize")
                    .show();
            } else {
                luckysheetPostil.editPs(ps_r, ps_c);
            }
        }

        //批注框 改变大小
        if (!!luckysheetPostil.resize) {
            luckysheetPostil.resize = null;

            let ps_id = luckysheetPostil.currentObj.closest(".luckysheet-postil-show").attr("id");

            let ps_r = ps_id.split("luckysheet-postil-show_")[1].split("_")[0];
            let ps_c = ps_id.split("luckysheet-postil-show_")[1].split("_")[1];

            let d = editor.deepCopyFlowData(Store.flowdata);
            let rc = [];

            d[ps_r][ps_c].ps.left = luckysheetPostil.currentObj.position().left;
            d[ps_r][ps_c].ps.top = luckysheetPostil.currentObj.position().top;
            d[ps_r][ps_c].ps.width = luckysheetPostil.currentObj.outerWidth();
            d[ps_r][ps_c].ps.height = luckysheetPostil.currentObj.outerHeight();
            d[ps_r][ps_c].ps.value = luckysheetPostil.currentObj
                .find(".formulaInputFocus")
                .html()
                .replaceAll("<div>", "\n")
                .replaceAll(/<(.*)>.*?|<(.*) \/>/g, "")
                .trim();

            rc.push(ps_r + "_" + ps_c);

            luckysheetPostil.ref(d, rc);

            $("#" + ps_id).remove();

            if (d[ps_r][ps_c].ps.isshow) {
                luckysheetPostil.buildPs(ps_r, ps_c, d[ps_r][ps_c].ps);
                $("#" + ps_id).addClass("luckysheet-postil-show-active");
                $("#" + ps_id)
                    .find(".luckysheet-postil-dialog-resize")
                    .show();
            } else {
                luckysheetPostil.editPs(ps_r, ps_c);
            }
        }

        //改变行高
        if (Store.luckysheet_rows_change_size) {
            Store.luckysheet_rows_change_size = false;

            $("#luckysheet-change-size-line").hide();
            $("#luckysheet-rows-change-size").css("opacity", 0);
            $("#luckysheet-sheettable, #luckysheet-rows-h, #luckysheet-rows-h canvas").css("cursor", "default");

            let mouse = mouseposition(event.pageX, event.pageY);
            let scrollTop = $("#luckysheet-rows-h").scrollTop();
            let y = mouse[1] + scrollTop;
            let winH = $(window).height();

            let row_location = rowLocation(y),
                row = row_location[1],
                row_pre = row_location[0],
                row_index = row_location[2];

            let size = y + 3 - Store.luckysheet_rows_change_size_start[0];

            if (y + 3 - Store.luckysheet_rows_change_size_start[0] < 19) {
                size = 19;
            }

            if (y >= winH - 200 + scrollTop) {
                size = winH - 200 - Store.luckysheet_rows_change_size_start[0] + scrollTop;
            }

            let cfg = $.extend(true, {}, Store.config);
            if (cfg["rowlen"] == null) {
                cfg["rowlen"] = {};
            }

            if (cfg["customHeight"] == null) {
                cfg["customHeight"] = {};
            }

            cfg["customHeight"][Store.luckysheet_rows_change_size_start[1]] = 1;

            const changeRowIndex = Store.luckysheet_rows_change_size_start[1];
            let changeRowSelected = false;
            if (Store["luckysheet_select_save"].length > 0) {
                Store["luckysheet_select_save"]
                    .filter((select) => select.row_select)
                    .some((select) => {
                        if (changeRowIndex >= select.row[0] && changeRowIndex <= select.row[1]) {
                            changeRowSelected = true;
                        }
                        return changeRowSelected;
                    });
            }
            if (changeRowSelected) {
                Store["luckysheet_select_save"]
                    .filter((select) => select.row_select)
                    .forEach((select) => {
                        for (let r = select.row[0]; r <= select.row[1]; r++) {
                            cfg["rowlen"][r] = Math.ceil(size / Store.zoomRatio);
                        }
                    });
            } else {
                cfg["rowlen"][Store.luckysheet_rows_change_size_start[1]] = Math.ceil(size / Store.zoomRatio);
            }

            let images = imageCtrl.moveChangeSize("row", Store.luckysheet_rows_change_size_start[1], size);

            if (Store.clearjfundo) {
                Store.jfundo.length = 0;

                Store.jfredo.push({
                    type: "resize",
                    ctrlType: "resizeR",
                    sheetIndex: Store.currentSheetIndex,
                    config: $.extend(true, {}, Store.config),
                    curconfig: $.extend(true, {}, cfg),
                    images: $.extend(true, {}, imageCtrl.images),
                    curImages: $.extend(true, {}, images),
                });
            }

            //config
            Store.config = cfg;
            Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].config = Store.config;


            //images
            Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].images = images;
            imageCtrl.images = images;
            imageCtrl.allImagesShow();

            jfrefreshgrid_rhcw(Store.flowdata.length, null);
        }

        //改变列宽
        if (Store.luckysheet_cols_change_size) {
            Store.luckysheet_cols_change_size = false;
            $("#luckysheet-change-size-line").hide();
            $("#luckysheet-cols-change-size").css("opacity", 0);
            $(
                "#luckysheet-sheettable, #luckysheet-cols-h-c, .luckysheet-cols-h-cells, .luckysheet-cols-h-cells canvas",
            ).css("cursor", "default");

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
            let size = x + 3 - Store.luckysheet_cols_change_size_start[0];

            let firstcolumnlen = Store.defaultcollen;
            if (
                Store.config["columnlen"] != null &&
                Store.config["columnlen"][Store.luckysheet_cols_change_size_start[1]] != null
            ) {
                firstcolumnlen = Store.config["columnlen"][Store.luckysheet_cols_change_size_start[1]];
            }

            if (Math.abs(size - firstcolumnlen) < 3) {
                return;
            }
            if (x + 3 - Store.luckysheet_cols_change_size_start[0] < 30) {
                size = 30;
            }

            if (x >= winW - 100 + scrollLeft) {
                size = winW - 100 - Store.luckysheet_cols_change_size_start[0] + scrollLeft;
            }

            let cfg = $.extend(true, {}, Store.config);
            if (cfg["columnlen"] == null) {
                cfg["columnlen"] = {};
            }

            if (cfg["customWidth"] == null) {
                cfg["customWidth"] = {};
            }

            cfg["customWidth"][Store.luckysheet_cols_change_size_start[1]] = 1;

            const changeColumnIndex = Store.luckysheet_cols_change_size_start[1];
            let changeColumnSelected = false;
            if (Store["luckysheet_select_save"].length > 0) {
                Store["luckysheet_select_save"]
                    .filter((select) => select.column_select)
                    .some((select) => {
                        if (changeColumnIndex >= select.column[0] && changeColumnIndex <= select.column[1]) {
                            changeColumnSelected = true;
                        }
                        return changeColumnSelected;
                    });
            }
            if (changeColumnSelected) {
                Store["luckysheet_select_save"]
                    .filter((select) => select.column_select)
                    .forEach((select) => {
                        for (let r = select.column[0]; r <= select.column[1]; r++) {
                            cfg["columnlen"][r] = Math.ceil(size / Store.zoomRatio);
                        }
                    });
            } else {
                cfg["columnlen"][Store.luckysheet_cols_change_size_start[1]] = Math.ceil(size / Store.zoomRatio);
            }

            let images = imageCtrl.moveChangeSize("column", Store.luckysheet_cols_change_size_start[1], size);

            if (Store.clearjfundo) {
                Store.jfundo.length = 0;

                Store.jfredo.push({
                    type: "resize",
                    ctrlType: "resizeC",
                    sheetIndex: Store.currentSheetIndex,
                    config: $.extend(true, {}, Store.config),
                    curconfig: $.extend(true, {}, cfg),
                    images: $.extend(true, {}, imageCtrl.images),
                    curImages: $.extend(true, {}, images),
                });
            }

            //config
            Store.config = cfg;
            Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].config = Store.config;


            //images
            Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].images = images;
            imageCtrl.images = images;
            imageCtrl.allImagesShow();

            jfrefreshgrid_rhcw(null, Store.flowdata[0].length);

            setTimeout(function() {
                luckysheetrefreshgrid();
            }, 1);
        }

        if (formula.rangeMove) {
            formula.rangeMoveDragged(formula.rangeMoveObj);
        }

        //改变选择框的位置并替换目标单元格
        if (Store.luckysheet_cell_selected_move) {
            $("#luckysheet-cell-selected-move").hide();

            Store.luckysheet_cell_selected_move = false;
            let mouse = mouseposition(event.pageX, event.pageY);


            let scrollLeft = $("#luckysheet-cell-main").scrollLeft();
            let scrollTop = $("#luckysheet-cell-main").scrollTop();

            let x = mouse[0] + scrollLeft;
            let y = mouse[1] + scrollTop;

            let winH = $(window).height() + scrollTop - Store.sheetBarHeight - Store.statisticBarHeight,
                winW = $(window).width() + scrollLeft;

            let row_index = rowLocation(y)[2];
            let col_index = colLocation(x)[2];

            let row_index_original = Store.luckysheet_cell_selected_move_index[0],
                col_index_original = Store.luckysheet_cell_selected_move_index[1];

            if (row_index == row_index_original && col_index == col_index_original) {
                return;
            }

            let d = editor.deepCopyFlowData(Store.flowdata);
            let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];

            let data = getdatabyselection(last);

            let cfg = $.extend(true, {}, Store.config);
            if (cfg["merge"] == null) {
                cfg["merge"] = {};
            }
            if (cfg["rowlen"] == null) {
                cfg["rowlen"] = {};
            }

            //选区包含部分单元格
            if (hasPartMC(cfg, last["row"][0], last["row"][1], last["column"][0], last["column"][1])) {
                if (isEditMode()) {
                    alert(context.locale_drag.noMerge);
                } else {
                    tooltip.info('<i class="fa fa-exclamation-triangle"></i>', context.locale_drag.noMerge);
                }
                return;
            }

            let row_s = last["row"][0] - row_index_original + row_index,
                row_e = last["row"][1] - row_index_original + row_index;
            let col_s = last["column"][0] - col_index_original + col_index,
                col_e = last["column"][1] - col_index_original + col_index;

            if (row_s < 0 || y < 0) {
                row_s = 0;
                row_e = last["row"][1] - last["row"][0];
            }

            if (col_s < 0 || x < 0) {
                col_s = 0;
                col_e = last["column"][1] - last["column"][0];
            }

            if (row_e >= Store.visibledatarow[Store.visibledatarow.length - 1] || y > winH) {
                row_s = Store.visibledatarow.length - 1 - last["row"][1] + last["row"][0];
                row_e = Store.visibledatarow.length - 1;
            }

            if (col_e >= Store.visibledatacolumn[Store.visibledatacolumn.length - 1] || x > winW) {
                col_s = Store.visibledatacolumn.length - 1 - last["column"][1] + last["column"][0];
                col_e = Store.visibledatacolumn.length - 1;
            }

            //替换的位置包含部分单元格
            if (hasPartMC(cfg, row_s, row_e, col_s, col_e)) {
                if (isEditMode()) {
                    alert(context.locale_drag.noMerge);
                } else {
                    tooltip.info('<i class="fa fa-exclamation-triangle"></i>', context.locale_drag.noMerge);
                }
                return;
            }

            let borderInfoCompute = getBorderInfoCompute(Store.currentSheetIndex);

            //删除原本位置的数据
            let RowlChange = null;
            for (let r = last["row"][0]; r <= last["row"][1]; r++) {
                if (r in cfg["rowlen"]) {
                    RowlChange = true;
                }

                for (let c = last["column"][0]; c <= last["column"][1]; c++) {
                    let cell = d[r][c];

                    if (getObjType(cell) == "object" && "mc" in cell) {
                        if (cell["mc"].r + "_" + cell["mc"].c in cfg["merge"]) {
                            delete cfg["merge"][cell["mc"].r + "_" + cell["mc"].c];
                        }
                    }

                    d[r][c] = null;
                }
            }

            //边框
            if (cfg["borderInfo"] && cfg["borderInfo"].length > 0) {
                let borderInfo = [];

                for (let i = 0; i < cfg["borderInfo"].length; i++) {
                    let bd_rangeType = cfg["borderInfo"][i].rangeType;

                    if (bd_rangeType == "range") {
                        let bd_range = cfg["borderInfo"][i].range;
                        let bd_emptyRange = [];

                        for (let j = 0; j < bd_range.length; j++) {
                            bd_emptyRange = bd_emptyRange.concat(
                                conditionformat.CFSplitRange(
                                    bd_range[j],
                                    { row: last["row"], column: last["column"] },
                                    { row: [row_s, row_e], column: [col_s, col_e] },
                                    "restPart",
                                ),
                            );
                        }

                        cfg["borderInfo"][i].range = bd_emptyRange;

                        borderInfo.push(cfg["borderInfo"][i]);
                    } else if (bd_rangeType == "cell") {
                        let bd_r = cfg["borderInfo"][i].value.row_index;
                        let bd_c = cfg["borderInfo"][i].value.col_index;

                        if (
                            !(
                                bd_r >= last["row"][0] &&
                                bd_r <= last["row"][1] &&
                                bd_c >= last["column"][0] &&
                                bd_c <= last["column"][1]
                            )
                        ) {
                            borderInfo.push(cfg["borderInfo"][i]);
                        }
                    }
                }

                cfg["borderInfo"] = borderInfo;
            }
            //替换位置数据更新
            let offsetMC = {};
            for (let r = 0; r < data.length; r++) {
                for (let c = 0; c < data[0].length; c++) {
                    if (borderInfoCompute[r + last["row"][0] + "_" + (c + last["column"][0])]) {
                        let bd_obj = {
                            rangeType: "cell",
                            value: {
                                row_index: r + row_s,
                                col_index: c + col_s,
                                l: borderInfoCompute[r + last["row"][0] + "_" + (c + last["column"][0])].l,
                                r: borderInfoCompute[r + last["row"][0] + "_" + (c + last["column"][0])].r,
                                t: borderInfoCompute[r + last["row"][0] + "_" + (c + last["column"][0])].t,
                                b: borderInfoCompute[r + last["row"][0] + "_" + (c + last["column"][0])].b,
                            },
                        };

                        if (cfg["borderInfo"] == null) {
                            cfg["borderInfo"] = [];
                        }

                        cfg["borderInfo"].push(bd_obj);
                    }

                    let value = "";
                    if (data[r] != null && data[r][c] != null) {
                        value = data[r][c];
                    }

                    if (getObjType(value) == "object" && "mc" in value) {
                        let mc = $.extend(true, {}, value["mc"]);
                        if ("rs" in value["mc"]) {
                            offsetMC[mc.r + "_" + mc.c] = [r + row_s, c + col_s];

                            value["mc"].r = r + row_s;
                            value["mc"].c = c + col_s;

                            cfg["merge"][r + row_s + "_" + (c + col_s)] = value["mc"];
                        } else {
                            value["mc"].r = offsetMC[mc.r + "_" + mc.c][0];
                            value["mc"].c = offsetMC[mc.r + "_" + mc.c][1];
                        }
                    }
                    d[r + row_s][c + col_s] = value;
                }
            }

            if (RowlChange) {
                cfg = rowlenByRange(d, last["row"][0], last["row"][1], cfg);
                cfg = rowlenByRange(d, row_s, row_e, cfg);
            }

            //条件格式
            let cdformat = $.extend(
                true,
                [],
                Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"],
            );
            if (cdformat != null && cdformat.length > 0) {
                for (let i = 0; i < cdformat.length; i++) {
                    let cdformat_cellrange = cdformat[i].cellrange;
                    let emptyRange = [];
                    for (let j = 0; j < cdformat_cellrange.length; j++) {
                        let range = conditionformat.CFSplitRange(
                            cdformat_cellrange[j],
                            { row: last["row"], column: last["column"] },
                            { row: [row_s, row_e], column: [col_s, col_e] },
                            "allPart",
                        );
                        emptyRange = emptyRange.concat(range);
                    }
                    cdformat[i].cellrange = emptyRange;
                }
            }

            let rf;
            if (Store.luckysheet_select_save[0].row_focus == Store.luckysheet_select_save[0].row[0]) {
                rf = row_s;
            } else {
                rf = row_e;
            }

            let cf;
            if (Store.luckysheet_select_save[0].column_focus == Store.luckysheet_select_save[0].column[0]) {
                cf = col_s;
            } else {
                cf = col_e;
            }

            let range = [];
            range.push({ row: last["row"], column: last["column"] });
            range.push({ row: [row_s, row_e], column: [col_s, col_e] });

            last["row"] = [row_s, row_e];
            last["column"] = [col_s, col_e];
            last["row_focus"] = rf;
            last["column_focus"] = cf;

            let allParam = {
                cfg: cfg,
                RowlChange: RowlChange,
                cdformat: cdformat,
            };

            jfrefreshgrid(d, range, allParam);

            selectHightlightShow();

            $("#luckysheet-sheettable").css("cursor", "default");
            clearTimeout(Store.countfuncTimeout);
            Store.countfuncTimeout = setTimeout(function() {
                countfunc();
            }, 500);
        }

        //图表选区拖拽移动
        if (Store.chart_selection.rangeMove) {
            Store.chart_selection.rangeMoveDragged();
        }

        //图表选区拖拽拉伸
        if (!!Store.chart_selection.rangeResize) {
            Store.chart_selection.rangeResizeDragged();
        }

        //选区下拉
        if (Store.luckysheet_cell_selected_extend) {
            Store.luckysheet_cell_selected_extend = false;
            $("#luckysheet-cell-selected-extend").hide();


            let mouse = mouseposition(event.pageX, event.pageY);
            let scrollLeft = $("#luckysheet-cell-main").scrollLeft();
            let scrollTop = $("#luckysheet-cell-main").scrollTop();

            let x = mouse[0] + scrollLeft - 5;
            let y = mouse[1] + scrollTop - 5;

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

            let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
            let row_s = last["row"][0],
                row_e = last["row"][1];
            let col_s = last["column"][0],
                col_e = last["column"][1];

            if (row_s < 0 || y < 0) {
                row_s = 0;
                row_e = last["row"][1] - last["row"][0];
            }

            if (col_s < 0 || x < 0) {
                col_s = 0;
                col_e = last["column"][1] - last["column"][0];
            }

            if (row_e >= Store.visibledatarow[Store.visibledatarow.length - 1] || y > winH) {
                row_s = Store.visibledatarow.length - 1 - last["row"][1] + last["row"][0];
                row_e = Store.visibledatarow.length - 1;
            }

            if (col_e >= Store.visibledatacolumn[Store.visibledatacolumn.length - 1] || x > winW) {
                col_s = Store.visibledatacolumn.length - 1 - last["column"][1] + last["column"][0];
                col_e = Store.visibledatacolumn.length - 1;
            }

            //复制范围
            luckysheetDropCell.copyRange = {
                row: $.extend(true, [], last["row"]),
                column: $.extend(true, [], last["column"]),
            };
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

            if (Math.abs(row_index_original - row_index) > Math.abs(col_index_original - col_index)) {
                if (!(row_index >= row_s && row_index <= row_e)) {
                    if (Store.luckysheet_select_save[0].top_move >= row_pre) {
                        //当往上拖拽时
                        luckysheetDropCell.applyRange = {
                            row: [row_index, last["row"][0] - 1],
                            column: last["column"],
                        };
                        luckysheetDropCell.direction = "up";

                        row_s -= last["row"][0] - row_index;

                        //是否有数据透视表范围
                        if (pivotTable.isPivotRange(row_s, col_e)) {
                            tooltip.info(context.locale_drag.affectPivot, "");
                            return;
                        }
                    } else {
                        //当往下拖拽时
                        luckysheetDropCell.applyRange = {
                            row: [last["row"][1] + 1, row_index],
                            column: last["column"],
                        };
                        luckysheetDropCell.direction = "down";

                        row_e += row_index - last["row"][1];

                        //是否有数据透视表范围
                        if (pivotTable.isPivotRange(row_e, col_e)) {
                            tooltip.info(context.locale_drag.affectPivot, "");
                            return;
                        }
                    }
                } else {
                    return;
                }
            } else {
                if (!(col_index >= col_s && col_index <= col_e)) {
                    if (Store.luckysheet_select_save[0].left_move >= col_pre) {
                        //当往左拖拽时
                        luckysheetDropCell.applyRange = {
                            row: last["row"],
                            column: [col_index, last["column"][0] - 1],
                        };
                        luckysheetDropCell.direction = "left";

                        col_s -= last["column"][0] - col_index;

                        //是否有数据透视表范围
                        if (pivotTable.isPivotRange(row_e, col_s)) {
                            tooltip.info(context.locale_drag.affectPivot, "");
                            return;
                        }
                    } else {
                        //当往右拖拽时
                        luckysheetDropCell.applyRange = {
                            row: last["row"],
                            column: [last["column"][1] + 1, col_index],
                        };
                        luckysheetDropCell.direction = "right";

                        col_e += col_index - last["column"][1];

                        //是否有数据透视表范围
                        if (pivotTable.isPivotRange(row_e, col_e)) {
                            tooltip.info(context.locale_drag.affectPivot, "");
                            return;
                        }
                    }
                } else {
                    return;
                }
            }

            if (Store.config["merge"] != null) {
                let hasMc = false;

                for (let r = last["row"][0]; r <= last["row"][1]; r++) {
                    for (let c = last["column"][0]; c <= last["column"][1]; c++) {
                        let cell = Store.flowdata[r][c];

                        if (cell != null && cell.mc != null) {
                            hasMc = true;
                            break;
                        }
                    }
                }

                if (hasMc) {
                    if (isEditMode()) {
                        alert(context.locale_drag.noMerge);
                    } else {
                        tooltip.info(context.locale_drag.noMerge, "");
                    }

                    return;
                }

                for (let r = row_s; r <= row_e; r++) {
                    for (let c = col_s; c <= col_e; c++) {
                        let cell = Store.flowdata[r][c];

                        if (cell != null && cell.mc != null) {
                            hasMc = true;
                            break;
                        }
                    }
                }

                if (hasMc) {
                    if (isEditMode()) {
                        alert(context.locale_drag.noMerge);
                    } else {
                        tooltip.info(context.locale_drag.noMerge, "");
                    }

                    return;
                }
            }

            last["row"] = [row_s, row_e];
            last["column"] = [col_s, col_e];

            luckysheetDropCell.update();
            luckysheetDropCell.createIcon();

            $("#luckysheet-cell-selected-move").hide();

            $("#luckysheet-sheettable").css("cursor", "default");
            clearTimeout(Store.countfuncTimeout);
            Store.countfuncTimeout = setTimeout(function() {
                countfunc();
            }, 500);
        }
    });
}
