import luckysheetPostil from "../postil";
import imageCtrl from "../imageCtrl";
import menuButton from "../menuButton";
import method from "../../global/method";
import { selectHightlightShow, luckysheet_count_show, selectHelpboxFill } from "../select";
import { getObjType, showrightclickmenu, luckysheetContainerFocus, luckysheetfontformat, $$ } from "../../utils/util";
import { getSheetIndex, getRangetxt } from "../../methods/get";
import { rowLocation, rowLocationByIndex, colLocation, colLocationByIndex, mouseposition } from "../../global/location";
import { isRealNull, isRealNum, hasPartMC, isEditMode, checkIsAllowEdit } from "../../global/validate";
import { countfunc } from "../../global/count";
import formula from "../../global/formula";
import { luckysheetextendtable, luckysheetdeletetable, luckysheetDeleteCell } from "../../global/extend";
import { jfrefreshgrid, jfrefreshgridall, jfrefreshgrid_rhcw } from "../../global/refresh";
import { getcellvalue } from "../../global/getdata";
import tooltip from "../../global/tooltip";
import editor from "../../global/editor";
import locale from "../../locale/locale";
import { getMeasureText, getCellTextInfo } from "../../global/getRowlen";
import { luckysheet_searcharray } from "../../controllers/sheetSearch";
import { isInlineStringCell } from "../inlineString";
import Store from "../../store";
import luckysheetConfigsetting from "../luckysheetConfigsetting";
function deleteRows(type, st_index, ed_index) {
  Store.luckysheetRightHeadClickIs = "column";
}
function deleteColumns() {}
export { deleteRows, deleteColumns };