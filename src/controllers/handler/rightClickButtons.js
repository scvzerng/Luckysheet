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

export default function rightClickButtons() {
    //右键菜单 复制按钮
    $("#luckysheet-copy-btn, #luckysheet-cols-copy-btn, #luckysheet-paste-btn-title").click(function(event) {
        $(this)
            .parent()
            .hide();
        //复制范围内包含部分合并单元格，提示
        if (Store.config["merge"] != null) {
            let has_PartMC = false;

            for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
                let r1 = Store.luckysheet_select_save[s].row[0],
                    r2 = Store.luckysheet_select_save[s].row[1];
                let c1 = Store.luckysheet_select_save[s].column[0],
                    c2 = Store.luckysheet_select_save[s].column[1];

                has_PartMC = hasPartMC(Store.config, r1, r2, c1, c2);

                if (has_PartMC) {
                    break;
                }
            }

            if (has_PartMC) {
                if (isEditMode()) {
                    alert(context.locale_drag.noPartMerge);
                } else {
                    tooltip.info(context.locale_drag.noPartMerge, "");
                }
                return;
            }
        }

        //多重选区 有条件格式时 提示
        let cdformat = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].luckysheet_conditionformat_save;
        if (Store.luckysheet_select_save.length > 1 && cdformat != null && cdformat.length > 0) {
            let hasCF = false;

            let cf_compute = conditionformat.getComputeMap();

            label: for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
                if (hasCF) {
                    break;
                }

                let r1 = Store.luckysheet_select_save[s].row[0],
                    r2 = Store.luckysheet_select_save[s].row[1];
                let c1 = Store.luckysheet_select_save[s].column[0],
                    c2 = Store.luckysheet_select_save[s].column[1];

                for (let r = r1; r <= r2; r++) {
                    for (let c = c1; c <= c2; c++) {
                        if (conditionformat.checksCF(r, c, cf_compute) != null) {
                            hasCF = true;
                            continue label;
                        }
                    }
                }
            }

            if (hasCF) {
                if (isEditMode()) {
                    alert(context.locale_drag.noMulti);
                } else {
                    tooltip.info(context.locale_drag.noMulti, "");
                }
                return;
            }
        }

        //多重选区 行不一样且列不一样时 提示
        if (Store.luckysheet_select_save.length > 1) {
            let isSameRow = true,
                str_r = Store.luckysheet_select_save[0].row[0],
                end_r = Store.luckysheet_select_save[0].row[1];
            let isSameCol = true,
                str_c = Store.luckysheet_select_save[0].column[0],
                end_c = Store.luckysheet_select_save[0].column[1];

            for (let s = 1; s < Store.luckysheet_select_save.length; s++) {
                if (
                    Store.luckysheet_select_save[s].row[0] != str_r ||
                    Store.luckysheet_select_save[s].row[1] != end_r
                ) {
                    isSameRow = false;
                }
                if (
                    Store.luckysheet_select_save[s].column[0] != str_c ||
                    Store.luckysheet_select_save[s].column[1] != end_c
                ) {
                    isSameCol = false;
                }
            }

            if ((!isSameRow && !isSameCol) || selectIsOverlap()) {
                if (isEditMode()) {
                    alert(context.locale_drag.noMulti);
                } else {
                    tooltip.info(context.locale_drag.noMulti, "");
                }
                return;
            }
        }

        selection.copy(event);
    });

    //右键菜单 粘贴按钮
    $("#luckysheet-copy-paste, #luckysheet-cols-paste-btn, #luckysheet-paste-btn-title").click(function(event) {
        selection.paste(event, "btn");
        $(this)
            .parent()
            .hide();
    });

    //Menu bar, Chart button
    $("#luckysheet-chart-btn-title").click(function() {
        createLuckyChart();
    });

    // Right-click the menu, chart generation
    $("#luckysheetdatavisual").click(function() {
        createLuckyChart();
        $("#luckysheet-rightclick-menu").hide();
    });

    //菜单栏 数据透视表
    $("#luckysheet-pivot-btn-title").click(function(e) {
        pivotTable.createPivotTable(e);
    });

    //菜单栏 插入图片按钮
    $("#luckysheet-insertImg-btn-title").click(function() {
        // *如果禁止前台编辑，则中止下一步操作
        if (!checkIsAllowEdit()) {
            tooltip.info("", locale().pivotTable.errorNotAllowEdit);
            return;
        }
        $("#luckysheet-imgUpload").click();
    });
    $("#luckysheetInsertImage").click(function() {
        $("#luckysheet-imgUpload").click();
        $("#luckysheet-rightclick-menu").hide();
    });
    $("#luckysheet-imgUpload").click(function(e) {
        e.stopPropagation();
    });
    $("#luckysheet-imgUpload").on("change", function(e) {
        let file = e.currentTarget.files[0];
        imageCtrl.insertImg(file);
    });

    //菜单栏 插入链接按钮
    $("#luckysheet-insertLink-btn-title").click(function() {
        // *如果禁止前台编辑，则中止下一步操作
        if (!checkIsAllowEdit()) {
            tooltip.info("", locale().pivotTable.errorNotAllowEdit);
        }

        hyperlinkCtrl.createDialog();
        hyperlinkCtrl.init();
    });
    $("#luckysheetInsertLink").click(function() {
        $("#luckysheet-insertLink-btn-title").click();
        $("#luckysheet-rightclick-menu").hide();
    });
}
