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

export default function chartRangeSelect() {
    //左上角返回按钮
    $("#luckysheet_info_detail_title").click(function() {
        window.open(luckysheetConfigsetting.myFolderUrl, "_self");
    });

    //图表选区mousedown
    $("#luckysheet-chart-rangeShow").on("mousedown.chartRangeShowMove", ".luckysheet-chart-rangeShow-move", function(
        event,
    ) {
        Store.chart_selection.rangeMove = true;
        Store.luckysheet_scroll_status = true;

        Store.chart_selection.rangeMoveObj = $(this).parent();

        let chart_json = Store.currentChart;

        let $id = $(this)
            .parent()
            .attr("id");
        if ($id == "luckysheet-chart-rangeShow-content") {
            let row_s = chart_json.rangeArray[0].row[0] + chart_json.rangeSplitArray.content.row[0];
            let col_s = chart_json.rangeArray[0].column[0] + chart_json.rangeSplitArray.content.column[0];

            Store.chart_selection.rangeMoveIndex = [row_s, col_s];
        } else if ($id == "luckysheet-chart-rangeShow-rowtitle") {
            let row_s = chart_json.rangeArray[0].row[0] + chart_json.rangeSplitArray.rowtitle.row[0];
            let col_s = chart_json.rangeArray[0].column[0] + chart_json.rangeSplitArray.rowtitle.column[0];

            Store.chart_selection.rangeMoveIndex = [row_s, col_s];
        } else if ($id == "luckysheet-chart-rangeShow-coltitle") {
            let row_s = chart_json.rangeArray[0].row[0] + chart_json.rangeSplitArray.coltitle.row[0];
            let col_s = chart_json.rangeArray[0].column[0] + chart_json.rangeSplitArray.coltitle.column[0];

            Store.chart_selection.rangeMoveIndex = [row_s, col_s];
        }

        let mouse = mouseposition(event.pageX, event.pageY);
        let x = mouse[0] + $("#luckysheet-cell-main").scrollLeft();
        let y = mouse[1] + $("#luckysheet-cell-main").scrollTop();
        let type = $(this).data("type");
        if (type == "top") {
            y += 3;
        } else if (type == "right") {
            x -= 3;
        } else if (type == "bottom") {
            y -= 3;
        } else if (type == "left") {
            x += 3;
        }

        let row_index = rowLocation(y)[2];
        let col_index = colLocation(x)[2];

        Store.chart_selection.rangeMovexy = [row_index, col_index];

        event.stopPropagation();
    });

    $("#luckysheet-chart-rangeShow").on(
        "mousedown.chartRangeShowResize",
        ".luckysheet-chart-rangeShow-resize",
        function(event) {
            Store.chart_selection.rangeResize = $(this).data("type"); //开始状态resize
            Store.luckysheet_scroll_status = true;

            Store.chart_selection.rangeResizeObj = $(this).parent();

            let chart_json = Store.currentChart;
            let row_s;
            let row_e;
            let col_s;
            let col_e;

            let $id = $(this)
                .parent()
                .attr("id");
            if ($id == "luckysheet-chart-rangeShow-content") {
                if (chart_json.rangeRowCheck.exits) {
                    row_s = chart_json.rangeArray[0].row[0] + chart_json.rangeSplitArray.content.row[0];
                    row_e = chart_json.rangeArray[0].row[0] + chart_json.rangeSplitArray.content.row[1];
                } else {
                    row_s = chart_json.rangeSplitArray.content.row[0];
                    row_e = chart_json.rangeSplitArray.content.row[0];
                }

                if (chart_json.rangeColCheck.exits) {
                    col_s = chart_json.rangeArray[0].column[0] + chart_json.rangeSplitArray.content.column[0];
                    col_e = chart_json.rangeArray[0].column[0] + chart_json.rangeSplitArray.content.column[1];
                } else {
                    col_s = chart_json.rangeSplitArray.content.column[0];
                    col_e = chart_json.rangeSplitArray.content.column[1];
                }

                Store.chart_selection.rangeResizeIndex = { row: [row_s, row_e], column: [col_s, col_e] };
            } else if ($id == "luckysheet-chart-rangeShow-rowtitle") {
                let row_s = chart_json.rangeArray[0].row[0] + chart_json.rangeSplitArray.rowtitle.row[0];
                let row_e = chart_json.rangeArray[0].row[0] + chart_json.rangeSplitArray.rowtitle.row[1];

                let col_s = chart_json.rangeArray[0].column[0] + chart_json.rangeSplitArray.rowtitle.column[0];
                let col_e = chart_json.rangeArray[0].column[0] + chart_json.rangeSplitArray.rowtitle.column[1];

                Store.chart_selection.rangeResizeIndex = { row: [row_s, row_e], column: [col_s, col_e] };
            } else if ($id == "luckysheet-chart-rangeShow-coltitle") {
                let row_s = chart_json.rangeArray[0].row[0] + chart_json.rangeSplitArray.coltitle.row[0];
                let row_e = chart_json.rangeArray[0].row[0] + chart_json.rangeSplitArray.coltitle.row[1];

                let col_s = chart_json.rangeArray[0].column[0] + chart_json.rangeSplitArray.coltitle.column[0];
                let col_e = chart_json.rangeArray[0].column[0] + chart_json.rangeSplitArray.coltitle.column[1];

                Store.chart_selection.rangeResizeIndex = { row: [row_s, row_e], column: [col_s, col_e] };
            }

            let mouse = mouseposition(event.pageX, event.pageY);
            let x = mouse[0] + $("#luckysheet-cell-main").scrollLeft();
            let y = mouse[1] + $("#luckysheet-cell-main").scrollTop();

            if (Store.chart_selection.rangeResize == "lt") {
                x += 3;
                y += 3;
            } else if (Store.chart_selection.rangeResize == "lb") {
                x += 3;
                y -= 3;
            } else if (Store.chart_selection.rangeResize == "rt") {
                x -= 3;
                y += 3;
            } else if (Store.chart_selection.rangeResize == "rb") {
                x -= 3;
                y -= 3;
            }

            let row_index = rowLocation(y)[2];
            let col_index = colLocation(x)[2];

            Store.chart_selection.rangeResizexy = [row_index, col_index];

            event.stopPropagation();
        },
    );
}
