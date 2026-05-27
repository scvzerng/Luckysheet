import { selectionCopyShow, selectIsOverlap } from "../select";
import { luckyColor, iconfontObjects } from "../constant";
import luckysheetConfigsetting from "../luckysheetConfigsetting";
import luckysheetMoreFormat from "../moreFormat";
import alternateformat from "../alternateformat";
import conditionformat from "../conditionformat";
import { luckysheet_searcharray } from "../sheetSearch";
import luckysheetFreezen from "../freezen";
import luckysheetsizeauto from "../resize";
import { createFilter } from "../filter";
import luckysheetSearchReplace from "../searchReplace";
import luckysheetLocationCell from "../locationCell";
import ifFormulaGenerator from "../ifFormulaGenerator";
import { luckysheetupdateCell } from "../updateCell";
import insertFormula from "../insertFormula";
import sheetmanage from "../sheetmanage";
import luckysheetPostil from "../postil";
import { isRealNum, isRealNull, isEditMode, hasPartMC, checkIsAllowEdit } from "../../global/validate";
import tooltip from "../../global/tooltip";
import editor from "../../global/editor";
import { genarate, update, is_date } from "../../global/format";
import { jfrefreshgrid, luckysheetrefreshgrid } from "../../global/refresh";
import { sortSelection } from "../../global/sort";
import luckysheetformula from "../../global/formula";
import { rowLocationByIndex, colLocationByIndex } from "../../global/location";
import { isdatatypemulti } from "../../global/datecontroll";
import { rowlenByRange, getCellTextSplitArr } from "../../global/getRowlen";
import { setcellvalue } from "../../global/setdata";
import { getFontStyleByCell, checkstatusByCell } from "../../global/getdata";
import { countfunc } from "../../global/count";
import { hideMenuByCancel } from "../../global/cursorPos";
import { getSheetIndex, getRangetxt, getluckysheetfile } from "../../methods/get";
import { setluckysheetfile } from "../../methods/set";
import { isInlineStringCell, isInlineStringCT, updateInlineStringFormat, convertCssToStyleList, inlineStyleAffectAttribute, updateInlineStringFormatOutside } from "../inlineString";
import { replaceHtml, getObjType, rgbTohex, mouseclickposition, luckysheetfontformat, luckysheetContainerFocus } from "../../utils/util";
import Store from "../../store";
import locale from "../../locale/locale";
import { checkTheStatusOfTheSelectedCells, frozenFirstRow, frozenFirstColumn } from "../../global/api";
const formulaAutoInputModule = {
  activeFormulaInput: function (row_index, col_index, rowh, columnh, formula, isnull) {
    let _this = this;
    if (isnull == null) {
      isnull = false;
    }
    luckysheetupdateCell(row_index, col_index, Store.flowdata, true);
    if (isnull) {
      let formulaTxt = '<span dir="auto" class="luckysheet-formula-text-color">=</span><span dir="auto" class="luckysheet-formula-text-color">' + formula.toUpperCase() + '</span><span dir="auto" class="luckysheet-formula-text-color">(</span><span dir="auto" class="luckysheet-formula-text-color">)</span>';
      $("#luckysheet-rich-text-editor").html(formulaTxt);
      let currSelection = window.getSelection();
      let $span = $("#luckysheet-rich-text-editor").find("span");
      luckysheetformula.setCaretPosition($span.get($span.length - 2), 0, 1);
      return;
    }
    let row_pre = rowLocationByIndex(rowh[0])[0],
      row = rowLocationByIndex(rowh[1])[1],
      col_pre = colLocationByIndex(columnh[0])[0],
      col = colLocationByIndex(columnh[1])[1];
    let formulaTxt = '<span dir="auto" class="luckysheet-formula-text-color">=</span><span dir="auto" class="luckysheet-formula-text-color">' + formula.toUpperCase() + '</span><span dir="auto" class="luckysheet-formula-text-color">(</span><span class="luckysheet-formula-functionrange-cell" rangeindex="0" dir="auto" style="color:' + luckyColor[0] + ';">' + getRangetxt(Store.currentSheetIndex, {
      row: rowh,
      column: columnh
    }, Store.currentSheetIndex) + '</span><span dir="auto" class="luckysheet-formula-text-color">)</span>';
    $("#luckysheet-rich-text-editor").html(formulaTxt);
    luckysheetformula.israngeseleciton();
    luckysheetformula.rangestart = true;
    luckysheetformula.rangedrag_column_start = false;
    luckysheetformula.rangedrag_row_start = false;
    luckysheetformula.rangechangeindex = 0;
    luckysheetformula.rangeSetValue({
      row: rowh,
      column: columnh
    });
    luckysheetformula.func_selectedrange = {
      left: col_pre,
      width: col - col_pre - 1,
      top: row_pre,
      height: row - row_pre - 1,
      left_move: col_pre,
      width_move: col - col_pre - 1,
      top_move: row_pre,
      height_move: row - row_pre - 1,
      row: [row_index, row_index],
      column: [col_index, col_index]
    };
    $("#luckysheet-formula-functionrange-select").css({
      left: col_pre,
      width: col - col_pre - 1,
      top: row_pre,
      height: row - row_pre - 1
    }).show();
    $("#luckysheet-formula-help-c").hide();
  },
  backFormulaInput: function (d, r, c, rowh, columnh, formula) {
    let _this = this;
    let f = "=" + formula.toUpperCase() + "(" + getRangetxt(Store.currentSheetIndex, {
      row: rowh,
      column: columnh
    }, Store.currentSheetIndex) + ")";
    let v = luckysheetformula.execfunction(f, r, c);
    let value = {
      v: v[1],
      f: v[2]
    };
    setcellvalue(r, c, d, value);
    luckysheetformula.execFunctionExist.push({
      r: r,
      c: c,
      i: Store.currentSheetIndex
    });

    //刷新生成公式所在的单元格，刷新calcChain
    Store.luckysheet_select_save.push({
      "row": [r, r],
      "column": [c, c]
    });
  },
  checkNoNullValue: function (cell) {
    let v = cell;
    if (getObjType(v) == "object") {
      v = v.v;
    }
    if (!isRealNull(v) && isdatatypemulti(v).num && (cell.ct == null || cell.ct.t == null || cell.ct.t == "n" || cell.ct.t == "g")) {
      return true;
    } else {
      return false;
    }
  },
  checkNoNullValueAll: function (cell) {
    let v = cell;
    if (getObjType(v) == "object") {
      v = v.v;
    }
    if (!isRealNull(v)) {
      return true;
    } else {
      return false;
    }
  },
  getNoNullValue: function (d, st_x, ed, type) {
    let _this = this;
    let hasValueSum = 0,
      hasValueStart = null;
    let nullNum = 0,
      nullTime = 0;
    for (let r = ed - 1; r >= 0; r--) {
      let cell;
      if (type == "c") {
        cell = d[st_x][r];
      } else {
        cell = d[r][st_x];
      }
      if (_this.checkNoNullValue(cell)) {
        hasValueSum++;
        hasValueStart = r;
      } else if (cell == null || cell.v == null || cell.v == "") {
        nullNum++;
        if (nullNum >= 40) {
          if (nullTime <= 0) {
            nullTime = 1;
          } else {
            break;
          }
        }
      } else {
        break;
      }
    }
    return hasValueStart;
  },
  singleFormulaInput: function (d, _index, fix, st_m, ed_m, formula, type, noNum, noNull) {
    let _this = this;
    if (type == null) {
      type = "r";
    }
    if (noNum == null) {
      noNum = true;
    }
    if (noNull == null) {
      noNull = true;
    }
    let isNull = true,
      isNum = false;
    for (let c = st_m; c <= ed_m; c++) {
      let cell = null;
      if (type == "c") {
        cell = d[c][fix];
      } else {
        cell = d[fix][c];
      }
      if (_this.checkNoNullValue(cell)) {
        isNull = false;
        isNum = true;
      } else if (_this.checkNoNullValueAll(cell)) {
        isNull = false;
      }
    }
    if (isNull && noNull) {
      let st_r_r = _this.getNoNullValue(d, _index, fix, type);
      if (st_r_r == null) {
        if (type == "c") {
          _this.activeFormulaInput(_index, fix, null, null, formula, true);
        } else {
          _this.activeFormulaInput(fix, _index, null, null, formula, true);
        }
      } else {
        if (_index == st_m) {
          for (let c = st_m; c <= ed_m; c++) {
            let st_r_r = _this.getNoNullValue(d, c, fix, type);
            if (st_r_r == null) {
              break;
            }
            if (type == "c") {
              _this.backFormulaInput(d, c, fix, [c, c], [st_r_r, fix - 1], formula);
            } else {
              _this.backFormulaInput(d, fix, c, [st_r_r, fix - 1], [c, c], formula);
            }
          }
        } else {
          for (let c = ed_m; c >= st_m; c--) {
            let st_r_r = _this.getNoNullValue(d, c, fix, type);
            if (st_r_r == null) {
              break;
            }
            if (type == "c") {
              _this.backFormulaInput(d, c, fix, [c, c], [st_r_r, fix - 1], formula);
            } else {
              _this.backFormulaInput(d, fix, c, [st_r_r, fix - 1], [c, c], formula);
            }
          }
        }
      }
    } else if (isNum && noNum) {
      let cell = null;
      if (type == "c") {
        cell = d[ed_m + 1][fix];
      } else {
        cell = d[fix][ed_m + 1];
      }

      /* 备注：在搜寻的时候排除自己以解决单元格函数引用自己的问题 */
      if (cell != null && cell.v != null && cell.v.toString().length > 0) {
        let c = ed_m + 1;
        if (type == "c") {
          cell = d[ed_m + 1][fix];
        } else {
          cell = d[fix][ed_m + 1];
        }
        while (cell != null && cell.v != null && cell.v.toString().length > 0) {
          c++;
          let len = null;
          if (type == "c") {
            len = d.length;
          } else {
            len = d[0].length;
          }
          if (c >= len) {
            return;
          }
          if (type == "c") {
            cell = d[c][fix];
          } else {
            cell = d[fix][c];
          }
        }
        if (type == "c") {
          _this.backFormulaInput(d, c, fix, [st_m, ed_m], [fix, fix], formula);
        } else {
          _this.backFormulaInput(d, fix, c, [fix, fix], [st_m, ed_m], formula);
        }
      } else {
        if (type == "c") {
          _this.backFormulaInput(d, ed_m + 1, fix, [st_m, ed_m], [fix, fix], formula);
        } else {
          _this.backFormulaInput(d, fix, ed_m + 1, [fix, fix], [st_m, ed_m], formula);
        }
      }
    } else {
      return true;
    }
  },
  autoSelectionFormula: function (formula) {
    let _this = this;
    let d = editor.deepCopyFlowData(Store.flowdata);
    let nullfindnum = 40;
    let isfalse = true;
    let select_save_len = Store.luckysheet_select_save.length;
    luckysheetformula.execFunctionExist = [];
    let execFormulaInput_c = function (d, st_r, ed_r, st_c, ed_c, formula) {
      let st_c_c = _this.getNoNullValue(d, st_r, ed_c, "c");
      if (st_c_c == null) {
        _this.activeFormulaInput(st_r, st_c, null, null, formula, true);
      } else {
        _this.activeFormulaInput(st_r, st_c, [st_r, ed_r], [st_c_c, ed_c - 1], formula);
      }
    };
    let execFormulaInput = function (d, st_r, ed_r, st_c, ed_c, formula) {
      let st_r_c = _this.getNoNullValue(d, st_c, ed_r, "r");
      if (st_r_c == null) {
        execFormulaInput_c(d, st_r, ed_r, st_c, ed_c, formula);
      } else {
        _this.activeFormulaInput(st_r, st_c, [st_r_c, ed_r - 1], [st_c, ed_c], formula);
      }
    };
    for (let s = 0; s < select_save_len; s++) {
      let st_r = Store.luckysheet_select_save[s].row[0],
        ed_r = Store.luckysheet_select_save[s].row[1];
      let st_c = Store.luckysheet_select_save[s].column[0],
        ed_c = Store.luckysheet_select_save[s].column[1];
      let row_index = Store.luckysheet_select_save[s].row_focus,
        col_index = Store.luckysheet_select_save[s].column_focus;
      if (st_r == ed_r && st_c == ed_c) {
        if (ed_r - 1 < 0 && ed_c - 1 < 0) {
          _this.activeFormulaInput(st_r, st_c, null, null, formula, true);
          return;
        }
        if (ed_r - 1 >= 0 && _this.checkNoNullValue(d[ed_r - 1][st_c])) {
          execFormulaInput(d, st_r, ed_r, st_c, ed_c, formula);
        } else if (ed_c - 1 >= 0 && _this.checkNoNullValue(d[st_r][ed_c - 1])) {
          execFormulaInput_c(d, st_r, ed_r, st_c, ed_c, formula);
        } else {
          execFormulaInput(d, st_r, ed_r, st_c, ed_c, formula);
        }
      } else if (st_r == ed_r) {
        isfalse = _this.singleFormulaInput(d, col_index, st_r, st_c, ed_c, formula, "r");
      } else if (st_c == ed_c) {
        isfalse = _this.singleFormulaInput(d, row_index, st_c, st_r, ed_r, formula, "c");
      } else {
        let r_false = true;
        for (let r = st_r; r <= ed_r; r++) {
          r_false = _this.singleFormulaInput(d, col_index, r, st_c, ed_c, formula, "r", true, false) && r_false;
        }
        let c_false = true;
        for (let c = st_c; c <= ed_c; c++) {
          c_false = _this.singleFormulaInput(d, row_index, c, st_r, ed_r, formula, "c", true, false) && c_false;
        }
        isfalse = !!r_false && !!c_false;
      }
      isfalse = isfalse && isfalse;
    }
    if (!isfalse) {
      luckysheetformula.execFunctionExist.reverse();
      luckysheetformula.execFunctionGroup(null, null, null, null, d);
      jfrefreshgrid(d, Store.luckysheet_select_save);
      clearTimeout(Store.jfcountfuncTimeout);
      Store.jfcountfuncTimeout = setTimeout(function () {
        countfunc();
      }, 500);
    }
  }
};
export default formulaAutoInputModule;