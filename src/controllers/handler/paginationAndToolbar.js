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

export default function paginationAndToolbar() {
    //是否允许加载下一页
    if (luckysheetConfigsetting.enablePage) {
        $("#luckysheet-bottom-page-next")
            .click(function() {
                let queryExps = luckysheetConfigsetting.pageInfo.queryExps;
                let reportId = luckysheetConfigsetting.pageInfo.reportId;
                let fields = luckysheetConfigsetting.pageInfo.fields;
                let mobile = luckysheetConfigsetting.pageInfo.mobile;
                let frezon = luckysheetConfigsetting.pageInfo.frezon;
                let currentPage = luckysheetConfigsetting.pageInfo.currentPage;
                let totalPage = luckysheetConfigsetting.pageInfo.totalPage;
                let pageUrl = luckysheetConfigsetting.pageInfo.pageUrl;

                method.addDataAjax(
                    {
                        queryExps: queryExps,
                        reportId: reportId,
                        fields: fields,
                        mobile: mobile,
                        frezon: frezon,
                        pageIndex: currentPage,
                        currentPage: currentPage,
                    },
                    Store.currentSheetIndex,
                    pageUrl,
                    function() {
                        luckysheetConfigsetting.pageInfo.currentPage++;
                        if (
                            luckysheetConfigsetting.pageInfo.totalPage == luckysheetConfigsetting.pageInfo.currentPage
                        ) {
                            $("#luckysheet-bottom-page-next").hide();
                            let pageInfoFull = replaceHtml(context.locale_info.pageInfoFull, {
                                total: luckysheetConfigsetting.total,
                                totalPage: luckysheetConfigsetting.pageInfo.totalPage,
                            });
                            $("#luckysheet-bottom-page-info").html(pageInfoFull);
                        } else {
                            let pageInfo = replaceHtml(context.locale_info.pageInfo, {
                                total: luckysheetConfigsetting.total,
                                totalPage: luckysheetConfigsetting.pageInfo.totalPage,
                                currentPage: luckysheetConfigsetting.pageInfo.currentPage,
                            });
                            $("#luckysheet-bottom-page-info").html(pageInfo);
                        }
                    },
                );
            })
            .mousedown(function(e) {
                e.stopPropagation();
            });
    }

    //回到顶部
    $("#luckysheet-bottom-bottom-top")
        .click(function() {
            $("#luckysheet-scrollbar-y").scrollTop(0);
        })
        .mousedown(function(e) {
            e.stopPropagation();
        });

    $("#luckysheet-wa-editor,#luckysheet-icon-morebtn-div,.luckysheet-toolbar-button").click(function(e) {
        if (this.id != "luckysheet-icon-paintformat" && menuButton.luckysheetPaintModelOn) {
            menuButton.cancelPaintModel();
        }
    });
}
