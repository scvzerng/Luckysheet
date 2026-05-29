import { deepMerge } from '../../utils/migrationHelpers.js';
import {  selectHightlightShow } from "../select";
import conditionformat from "../conditionformat";
import editor from "../../global/editor";
import tooltip from "../../global/tooltip";
import { getBorderInfoCompute } from "../../global/border";
import {  getdatabyselection } from "../../global/getdata";
import { rowlenByRange } from "../../global/getRowlen";
import {  isEditMode,  hasPartMC } from "../../global/validate";
import {  jfrefreshgrid } from "../../global/refresh";
import {  update  } from "../../global/format";
import {  getObjType } from "../../utils/util";
import { getCurrentFile, getFileBySheetIndex, getLastSelection } from "../../utils/storeAccess.js";
import Store from "../../store";
import locale from "../../locale/locale";
const clipboardPaintModelModule = {
  pasteHandlerOfPaintModel: function (copyRange) {
    const _locale = locale();
    const locale_paste = _locale.paste;
    let cfg = structuredClone(Store.config);
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
    let copyData = structuredClone(getdatabyselection({
      row: [c_r1, c_r2],
      column: [c_c1, c_c2]
    }, copySheetIndex));

    //应用范围
    let last = getLastSelection();
    let minh = last["row"][0],
      maxh = last["row"][1]; //应用范围首尾行
    let minc = last["column"][0],
      maxc = last["column"][1]; //应用范围首尾列

    let copyh = copyData.length,
      copyc = copyData[0].length;
    if (minh == maxh && minc == maxc) {
      //应用范围是一个单元格，自动增加到复制范围大小 (若自动增加的范围包含部分合并单元格，则提示)
      let has_PartMC = false;
      if (cfg["merge"] != null) {
        has_PartMC = hasPartMC(cfg, minh, minh + copyh - 1, minc, minc + copyc - 1);
      }
      if (has_PartMC) {
        if (isEditMode()) {
          alert(locale_paste.errorNotAllowMerged);
        } else {
          tooltip.info(`<i class="fa fa-exclamation-triangle"></i>${locale_paste.warning}`, locale_paste.errorNotAllowMerged);
        }
        return;
      }
      maxh = minh + copyh - 1;
      maxc = minc + copyc - 1;
    }
    let timesH = Math.ceil((maxh - minh + 1) / copyh); //复制行 组数
    let timesC = Math.ceil((maxc - minc + 1) / copyc); //复制列 组数

    let d = editor.deepCopyFlowData(Store.flowdata); //取数据
    let cellMaxLength = d[0].length;
    let rowMaxLength = d.length;
    let borderInfoCompute = getBorderInfoCompute(copySheetIndex);
    let mth = 0,
      mtc = 0,
      maxcellCahe = 0,
      maxrowCache = 0;
    for (let th = 1; th <= timesH; th++) {
      for (let tc = 1; tc <= timesC; tc++) {
        mth = minh + (th - 1) * copyh;
        mtc = minc + (tc - 1) * copyc;
        maxrowCache = minh + th * copyh > rowMaxLength ? rowMaxLength : minh + th * copyh;
        if (maxrowCache > maxh + 1) {
          maxrowCache = maxh + 1;
        }
        maxcellCahe = minc + tc * copyc > cellMaxLength ? cellMaxLength : minc + tc * copyc;
        if (maxcellCahe > maxc + 1) {
          maxcellCahe = maxc + 1;
        }
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
              value = copyData[h - mth][c - mtc];
            }
            if (value != null) {
              delete value["v"];
              delete value["m"];
              delete value["f"];
              delete value["spl"];
              if (value.ct && value.ct.t == "inlineStr") {
                delete value.ct;
              }
              if (getObjType(x[c]) == "object") {
                if (x[c].ct && x[c].ct.t === "inlineStr") {
                  delete value["ct"];
                } else {
                  let format = ["bg", "fc", "ct", "ht", "vt", "bl", "it", "cl", "un", "fs", "ff", "tb"];
                  format.forEach(item => {
                    Reflect.deleteProperty(x[c], item);
                  });
                }
              } else {
                x[c] = {
                  v: x[c]
                };
              }
              x[c] = deepMerge(x[c], value);
              if (x[c].ct && x[c].ct.t === "inlineStr") {
                x[c].ct.s.forEach(item => item = deepMerge(item, value));
              }
              if (copyHasMC && "mc" in x[c]) {
                if (x[c]["mc"].rs != null) {
                  x[c]["mc"].r = h;
                  if (x[c]["mc"].rs + h >= maxrowCache) {
                    x[c]["mc"].rs = maxrowCache - h;
                  }
                  x[c]["mc"].c = c;
                  if (x[c]["mc"].cs + c >= maxcellCahe) {
                    x[c]["mc"].cs = maxcellCahe - c;
                  }
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
              if (x[c].v != null) {
                if (value["ct"] != null && value["ct"]["fa"] != null) {
                  let mask = update(value["ct"]["fa"], x[c].v);
                  x[c].m = mask;
                }
              }
            }
          }
          d[h] = x;
        }
      }
    }

    //复制范围 是否有 条件格式
    let cdformat = null;
    let ruleArr = structuredClone(getFileBySheetIndex(copySheetIndex)["luckysheet_conditionformat_save"]);
    if (ruleArr != null && ruleArr.length > 0) {
      cdformat = structuredClone(getCurrentFile()["luckysheet_conditionformat_save"]);
      for (let i = 0; i < ruleArr.length; i++) {
        let cdformat_cellrange = ruleArr[i].cellrange;
        let emptyRange = [];
        for (let j = 0; j < cdformat_cellrange.length; j++) {
          let range = conditionformat.CFSplitRange(cdformat_cellrange[j], {
            row: [c_r1, c_r2],
            column: [c_c1, c_c2]
          }, {
            row: [minh, maxh],
            column: [minc, maxc]
          }, "operatePart");
          if (range.length > 0) {
            emptyRange = emptyRange.concat(range);
          }
        }
        if (emptyRange.length > 0) {
          ruleArr[i].cellrange = [{
            row: [minh, maxh],
            column: [minc, maxc]
          }];
          cdformat.push(ruleArr[i]);
        }
      }
    }
    last["row"] = [minh, maxh];
    last["column"] = [minc, maxc];
    if (copyRowlChange) {
      cfg = rowlenByRange(d, minh, maxh, cfg);
      let allParam = {
        cfg: cfg,
        RowlChange: true,
        cdformat: cdformat
      };
      jfrefreshgrid(d, Store.luckysheet_select_save, allParam);
    } else {
      // 选区格式刷存在超出边界的情况
      if (maxh >= d.length) {
        maxh = d.length - 1;
      }
      cfg = rowlenByRange(d, minh, maxh, cfg); //更新行高
      let allParam = {
        cfg: cfg,
        RowlChange: true,
        cdformat: cdformat
      };
      jfrefreshgrid(d, Store.luckysheet_select_save, allParam);
      selectHightlightShow();
    }
  }
};
export default clipboardPaintModelModule;