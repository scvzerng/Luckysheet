import {  selectHightlightShow } from "../select";
import conditionformat from "../conditionformat";
import editor from "../../global/editor";
import tooltip from "../../global/tooltip";
import formula from "../../global/formula";
import { getBorderInfoCompute } from "../../global/border";
import {  getdatabyselection,  datagridgrowth  } from "../../global/getdata";
import { rowlenByRange } from "../../global/getRowlen";
import {  isEditMode,  hasPartMC } from "../../global/validate";
import {  jfrefreshgrid } from "../../global/refresh";
import {  update  } from "../../global/format";
import {  getObjType } from "../../utils/util";
import { getCurrentFile, getFileBySheetIndex, getLastSelection } from "../../utils/storeAccess.js";
import Store from "../../store";
import locale from "../../locale/locale";
const clipboardCopyPasteModule = {
  pasteHandlerOfCopyPaste: function (copyRange) {
    const _locale = locale();
    const locale_paste = _locale.paste;
    let cfg = $.extend(true, {}, Store.config);
    if (cfg["merge"] == null) {
      cfg["merge"] = {};
    }

    //复制范围
    let copyHasMC = copyRange["HasMC"];
    let copyRowlChange = copyRange["RowlChange"];
    let copySheetIndex = copyRange["dataSheetIndex"];
    let c_r1 = copyRange["copyRange"][0].row[0],
      c_r2 = copyRange["copyRange"][0].row[1],
      c_c1 = copyRange["copyRange"][0].column[0],
      c_c2 = copyRange["copyRange"][0].column[1];
    let arr = [],
      isSameRow = false;
    for (let i = 0; i < copyRange["copyRange"].length; i++) {
      let arrData = getdatabyselection({
        row: copyRange["copyRange"][i].row,
        column: copyRange["copyRange"][i].column
      }, copySheetIndex);
      if (copyRange["copyRange"].length > 1) {
        if (c_r1 == copyRange["copyRange"][1].row[0] && c_r2 == copyRange["copyRange"][1].row[1]) {
          arrData = arrData[0].map(function (col, a) {
            return arrData.map(function (row) {
              return row[a];
            });
          });
          arr = arr.concat(arrData);
          isSameRow = true;
        } else if (c_c1 == copyRange["copyRange"][1].column[0] && c_c2 == copyRange["copyRange"][1].column[1]) {
          arr = arr.concat(arrData);
        }
      } else {
        arr = arrData;
      }
    }
    if (isSameRow) {
      arr = arr[0].map(function (col, b) {
        return arr.map(function (row) {
          return row[b];
        });
      });
    }
    let copyData = $.extend(true, [], arr);

    //多重选择选择区域 单元格如果有函数 则只取值 不取函数
    if (copyRange["copyRange"].length > 1) {
      for (let i = 0; i < copyData.length; i++) {
        for (let j = 0; j < copyData[i].length; j++) {
          if (copyData[i][j] != null && copyData[i][j].f != null) {
            delete copyData[i][j].f;
          }
        }
      }
    }
    let copyh = copyData.length,
      copyc = copyData[0].length;

    //应用范围
    let last = getLastSelection();
    let minh = last["row"][0],
      maxh = last["row"][1]; //应用范围首尾行
    let minc = last["column"][0],
      maxc = last["column"][1]; //应用范围首尾列

    let mh = (maxh - minh + 1) % copyh;
    let mc = (maxc - minc + 1) % copyc;
    if (mh != 0 || mc != 0) {
      //若应用范围不是copydata行列数的整数倍，则取copydata的行列数
      maxh = minh + copyh - 1;
      maxc = minc + copyc - 1;
    }

    //应用范围包含部分合并单元格，则提示
    let has_PartMC = false;
    if (cfg["merge"] != null) {
      has_PartMC = hasPartMC(cfg, minh, maxh, minc, maxc);
    }
    if (has_PartMC) {
      if (isEditMode()) {
        alert(locale_paste.errorNotAllowMerged);
      } else {
        tooltip.info(`<i class="fa fa-exclamation-triangle"></i>${locale_paste.warning}`, locale_paste.errorNotAllowMerged);
      }
      return;
    }
    let timesH = (maxh - minh + 1) / copyh;
    let timesC = (maxc - minc + 1) / copyc;
    let d = editor.deepCopyFlowData(Store.flowdata); //取数据
    let rowMaxLength = d.length;
    let cellMaxLength = d[0].length;

    //若应用范围超过最大行或最大列，增加行列
    let addr = copyh + minh - rowMaxLength,
      addc = copyc + minc - cellMaxLength;
    if (addr > 0 || addc > 0) {
      d = datagridgrowth([].concat(d), addr, addc, true);
    }
    let borderInfoCompute = getBorderInfoCompute(copySheetIndex);
    let mth = 0,
      mtc = 0,
      maxcellCahe = 0,
      maxrowCache = 0;
    for (let th = 1; th <= timesH; th++) {
      for (let tc = 1; tc <= timesC; tc++) {
        mth = minh + (th - 1) * copyh;
        mtc = minc + (tc - 1) * copyc;
        maxrowCache = minh + th * copyh;
        maxcellCahe = minc + tc * copyc;

        //行列位移值 用于单元格有函数
        let offsetRow = mth - c_r1;
        let offsetCol = mtc - c_c1;
        let offsetMC = {};
        for (let h = mth; h < maxrowCache; h++) {
          let x = [].concat(d[h]);
          for (let c = mtc; c < maxcellCahe; c++) {
            if (borderInfoCompute[c_r1 + h - mth + "_" + (c_c1 + c - mtc)]) {
              let bd_obj = {
                rangeType: "cell",
                value: {
                  row_index: h,
                  col_index: c,
                  l: borderInfoCompute[c_r1 + h - mth + "_" + (c_c1 + c - mtc)].l,
                  r: borderInfoCompute[c_r1 + h - mth + "_" + (c_c1 + c - mtc)].r,
                  t: borderInfoCompute[c_r1 + h - mth + "_" + (c_c1 + c - mtc)].t,
                  b: borderInfoCompute[c_r1 + h - mth + "_" + (c_c1 + c - mtc)].b
                }
              };
              if (cfg["borderInfo"] == null) {
                cfg["borderInfo"] = [];
              }
              cfg["borderInfo"].push(bd_obj);
            } else if (borderInfoCompute[h + "_" + c]) {
              let bd_obj = {
                rangeType: "cell",
                value: {
                  row_index: h,
                  col_index: c,
                  l: null,
                  r: null,
                  t: null,
                  b: null
                }
              };
              if (cfg["borderInfo"] == null) {
                cfg["borderInfo"] = [];
              }
              cfg["borderInfo"].push(bd_obj);
            }
            if (getObjType(x[c]) == "object" && "mc" in x[c]) {
              if ("rs" in x[c].mc) {
                delete cfg["merge"][x[c]["mc"].r + "_" + x[c]["mc"].c];
              }
              delete x[c].mc;
            }
            let value = null;
            if (copyData[h - mth] != null && copyData[h - mth][c - mtc] != null) {
              value = $.extend(true, {}, copyData[h - mth][c - mtc]);
            }
            if (value != null && value.f != null) {
              let func = value.f;
              if (offsetRow > 0) {
                func = "=" + formula.functionCopy(func, "down", offsetRow);
              }
              if (offsetRow < 0) {
                func = "=" + formula.functionCopy(func, "up", Math.abs(offsetRow));
              }
              if (offsetCol > 0) {
                func = "=" + formula.functionCopy(func, "right", offsetCol);
              }
              if (offsetCol < 0) {
                func = "=" + formula.functionCopy(func, "left", Math.abs(offsetCol));
              }
              let funcV = formula.execfunction(func, h, c, undefined, true);
              value.f = funcV[2];
              value.v = funcV[1];
              if (value.ct != null && value.ct["fa"] != null) {
                value.m = update(value.ct["fa"], funcV[1]);
              }
            }
            x[c] = $.extend(true, {}, value);
            if (value != null && copyHasMC && "mc" in x[c]) {
              if (x[c]["mc"].rs != null) {
                x[c]["mc"].r = h;
                x[c]["mc"].c = c;
                cfg["merge"][x[c]["mc"].r + "_" + x[c]["mc"].c] = x[c]["mc"];
                offsetMC[value["mc"].r + "_" + value["mc"].c] = [x[c]["mc"].r, x[c]["mc"].c];
              } else {
                x[c] = {
                  mc: {
                    r: offsetMC[value["mc"].r + "_" + value["mc"].c][0],
                    c: offsetMC[value["mc"].r + "_" + value["mc"].c][1]
                  }
                };
              }
            }
          }
          d[h] = x;
        }
      }
    }

    //复制范围 是否有 条件格式和数据验证
    let cdformat = null;
    if (copyRange["copyRange"].length == 1) {
      let c_file = getFileBySheetIndex(copySheetIndex);
      let a_file = getCurrentFile();
      let ruleArr_cf = $.extend(true, [], c_file["luckysheet_conditionformat_save"]);
      if (ruleArr_cf != null && ruleArr_cf.length > 0) {
        cdformat = $.extend(true, [], a_file["luckysheet_conditionformat_save"]);
        for (let i = 0; i < ruleArr_cf.length; i++) {
          let cf_range = ruleArr_cf[i].cellrange;
          let emptyRange = [];
          for (let th = 1; th <= timesH; th++) {
            for (let tc = 1; tc <= timesC; tc++) {
              mth = minh + (th - 1) * copyh;
              mtc = minc + (tc - 1) * copyc;
              maxrowCache = minh + th * copyh;
              maxcellCahe = minc + tc * copyc;
              for (let j = 0; j < cf_range.length; j++) {
                let range = conditionformat.CFSplitRange(cf_range[j], {
                  row: [c_r1, c_r2],
                  column: [c_c1, c_c2]
                }, {
                  row: [mth, maxrowCache - 1],
                  column: [mtc, maxcellCahe - 1]
                }, "operatePart");
                if (range.length > 0) {
                  emptyRange = emptyRange.concat(range);
                }
              }
            }
          }
          if (emptyRange.length > 0) {
            ruleArr_cf[i].cellrange = emptyRange;
            cdformat.push(ruleArr_cf[i]);
          }
        }
      }
    }
    last["row"] = [minh, maxh];
    last["column"] = [minc, maxc];
    if (copyRowlChange || addr > 0 || addc > 0) {
      cfg = rowlenByRange(d, minh, maxh, cfg);
      let allParam = {
        cfg: cfg,
        RowlChange: true,
        cdformat: cdformat
      };
      jfrefreshgrid(d, Store.luckysheet_select_save, allParam);
    } else {
      let allParam = {
        cfg: cfg,
        cdformat: cdformat
      };
      jfrefreshgrid(d, Store.luckysheet_select_save, allParam);
      selectHightlightShow();
    }
  }
};
export default clipboardCopyPasteModule;