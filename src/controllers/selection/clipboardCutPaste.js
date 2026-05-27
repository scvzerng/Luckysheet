import { selectHightlightShow, selectionCopyShow } from "../select";
import menuButton from "../menuButton";
import conditionformat from "../conditionformat";
import editor from "../../global/editor";
import tooltip from "../../global/tooltip";
import formula from "../../global/formula";
import { getBorderInfoCompute } from "../../global/border";
import { getdatabyselection, getcellvalue, datagridgrowth } from "../../global/getdata";
import { rowlenByRange } from "../../global/getRowlen";
import { isEditMode, hasPartMC, isRealNum } from "../../global/validate";
import { jfrefreshgrid, jfrefreshgrid_pastcut } from "../../global/refresh";
import { genarate, update } from "../../global/format";
import { getSheetIndex } from "../../methods/get";
import { replaceHtml, getObjType, luckysheetfontformat } from "../../utils/util";
import Store from "../../store";
import locale from "../../locale/locale";
import imageCtrl from "../imageCtrl";
const clipboardCutPasteModule = {
  pasteHandlerOfCutPaste: function (copyRange) {
    if (Store.allowEdit === false) {
      return;
    }
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
    let copyData = $.extend(true, [], getdatabyselection({
      row: [c_r1, c_r2],
      column: [c_c1, c_c2]
    }, copySheetIndex));
    let copyh = copyData.length,
      copyc = copyData[0].length;

    //应用范围
    let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
    let minh = last["row_focus"],
      maxh = minh + copyh - 1; //应用范围首尾行
    let minc = last["column_focus"],
      maxc = minc + copyc - 1; //应用范围首尾列

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
    let d = editor.deepCopyFlowData(Store.flowdata); //取数据
    let rowMaxLength = d.length;
    let cellMaxLength = d[0].length;
    let addr = copyh + minh - rowMaxLength,
      addc = copyc + minc - cellMaxLength;
    if (addr > 0 || addc > 0) {
      d = datagridgrowth([].concat(d), addr, addc, true);
    }
    let borderInfoCompute = getBorderInfoCompute(copySheetIndex);

    //剪切粘贴在当前表操作，删除剪切范围内数据、合并单元格
    if (Store.currentSheetIndex == copySheetIndex) {
      for (let i = c_r1; i <= c_r2; i++) {
        for (let j = c_c1; j <= c_c2; j++) {
          let cell = d[i][j];
          if (getObjType(cell) == "object" && "mc" in cell) {
            if ("rs" in cell["mc"]) {
              delete cfg["merge"][cell["mc"].r + "_" + cell["mc"].c];
            }
            delete cell["mc"];
          }
          d[i][j] = null;
        }
      }

      //边框
      if (cfg["borderInfo"] && cfg["borderInfo"].length > 0) {
        let source_borderInfo = [];
        for (let i = 0; i < cfg["borderInfo"].length; i++) {
          let bd_rangeType = cfg["borderInfo"][i].rangeType;
          if (bd_rangeType == "range") {
            let bd_range = cfg["borderInfo"][i].range;
            let bd_emptyRange = [];
            for (let j = 0; j < bd_range.length; j++) {
              bd_emptyRange = bd_emptyRange.concat(conditionformat.CFSplitRange(bd_range[j], {
                row: [c_r1, c_r2],
                column: [c_c1, c_c2]
              }, {
                row: [minh, maxh],
                column: [minc, maxc]
              }, "restPart"));
            }
            cfg["borderInfo"][i].range = bd_emptyRange;
            source_borderInfo.push(cfg["borderInfo"][i]);
          } else if (bd_rangeType == "cell") {
            let bd_r = cfg["borderInfo"][i].value.row_index;
            let bd_c = cfg["borderInfo"][i].value.col_index;
            if (!(bd_r >= c_r1 && bd_r <= c_r2 && bd_c >= c_c1 && bd_c <= c_c2)) {
              source_borderInfo.push(cfg["borderInfo"][i]);
            }
          }
        }
        cfg["borderInfo"] = source_borderInfo;
      }
    }
    let offsetMC = {};
    for (let h = minh; h <= maxh; h++) {
      let x = [].concat(d[h]);
      for (let c = minc; c <= maxc; c++) {
        if (borderInfoCompute[c_r1 + h - minh + "_" + (c_c1 + c - minc)]) {
          let bd_obj = {
            rangeType: "cell",
            value: {
              row_index: h,
              col_index: c,
              l: borderInfoCompute[c_r1 + h - minh + "_" + (c_c1 + c - minc)].l,
              r: borderInfoCompute[c_r1 + h - minh + "_" + (c_c1 + c - minc)].r,
              t: borderInfoCompute[c_r1 + h - minh + "_" + (c_c1 + c - minc)].t,
              b: borderInfoCompute[c_r1 + h - minh + "_" + (c_c1 + c - minc)].b
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
        if (copyData[h - minh] != null && copyData[h - minh][c - minc] != null) {
          value = copyData[h - minh][c - minc];
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
    last["row"] = [minh, maxh];
    last["column"] = [minc, maxc];

    //若有行高改变，重新计算行高改变
    if (copyRowlChange) {
      if (Store.currentSheetIndex != copySheetIndex) {
        cfg = rowlenByRange(d, minh, maxh, cfg);
      } else {
        cfg = rowlenByRange(d, c_r1, c_r2, cfg);
        cfg = rowlenByRange(d, minh, maxh, cfg);
      }
    }
    let source, target;
    if (Store.currentSheetIndex != copySheetIndex) {
      //跨表操作
      let sourceData = $.extend(true, [], Store.luckysheetfile[getSheetIndex(copySheetIndex)]["data"]);
      let sourceConfig = $.extend(true, {}, Store.luckysheetfile[getSheetIndex(copySheetIndex)]["config"]);
      let sourceCurData = $.extend(true, [], sourceData);
      let sourceCurConfig = $.extend(true, {}, sourceConfig);
      if (sourceCurConfig["merge"] == null) {
        sourceCurConfig["merge"] = {};
      }
      for (let source_r = c_r1; source_r <= c_r2; source_r++) {
        for (let source_c = c_c1; source_c <= c_c2; source_c++) {
          let cell = sourceCurData[source_r][source_c];
          if (getObjType(cell) == "object" && "mc" in cell) {
            if ("rs" in cell["mc"]) {
              delete sourceCurConfig["merge"][cell["mc"].r + "_" + cell["mc"].c];
            }
            delete cell["mc"];
          }
          sourceCurData[source_r][source_c] = null;
        }
      }
      if (copyRowlChange) {
        sourceCurConfig = rowlenByRange(sourceCurData, c_r1, c_r2, sourceCurConfig);
      }

      //边框
      if (sourceCurConfig["borderInfo"] && sourceCurConfig["borderInfo"].length > 0) {
        let source_borderInfo = [];
        for (let i = 0; i < sourceCurConfig["borderInfo"].length; i++) {
          let bd_rangeType = sourceCurConfig["borderInfo"][i].rangeType;
          if (bd_rangeType == "range") {
            let bd_range = sourceCurConfig["borderInfo"][i].range;
            let bd_emptyRange = [];
            for (let j = 0; j < bd_range.length; j++) {
              bd_emptyRange = bd_emptyRange.concat(conditionformat.CFSplitRange(bd_range[j], {
                row: [c_r1, c_r2],
                column: [c_c1, c_c2]
              }, {
                row: [minh, maxh],
                column: [minc, maxc]
              }, "restPart"));
            }
            sourceCurConfig["borderInfo"][i].range = bd_emptyRange;
            source_borderInfo.push(sourceCurConfig["borderInfo"][i]);
          } else if (bd_rangeType == "cell") {
            let bd_r = sourceCurConfig["borderInfo"][i].value.row_index;
            let bd_c = sourceCurConfig["borderInfo"][i].value.col_index;
            if (!(bd_r >= c_r1 && bd_r <= c_r2 && bd_c >= c_c1 && bd_c <= c_c2)) {
              source_borderInfo.push(sourceCurConfig["borderInfo"][i]);
            }
          }
        }
        sourceCurConfig["borderInfo"] = source_borderInfo;
      }

      //条件格式
      let source_cdformat = $.extend(true, [], Store.luckysheetfile[getSheetIndex(copySheetIndex)]["luckysheet_conditionformat_save"]);
      let source_curCdformat = $.extend(true, [], source_cdformat);
      let ruleArr = [];
      if (source_curCdformat != null && source_curCdformat.length > 0) {
        for (let i = 0; i < source_curCdformat.length; i++) {
          let source_curCdformat_cellrange = source_curCdformat[i].cellrange;
          let emptyRange = [];
          let emptyRange2 = [];
          for (let j = 0; j < source_curCdformat_cellrange.length; j++) {
            let range = conditionformat.CFSplitRange(source_curCdformat_cellrange[j], {
              row: [c_r1, c_r2],
              column: [c_c1, c_c2]
            }, {
              row: [minh, maxh],
              column: [minc, maxc]
            }, "restPart");
            emptyRange = emptyRange.concat(range);
            let range2 = conditionformat.CFSplitRange(source_curCdformat_cellrange[j], {
              row: [c_r1, c_r2],
              column: [c_c1, c_c2]
            }, {
              row: [minh, maxh],
              column: [minc, maxc]
            }, "operatePart");
            if (range2.length > 0) {
              emptyRange2 = emptyRange2.concat(range2);
            }
          }
          source_curCdformat[i].cellrange = emptyRange;
          if (emptyRange2.length > 0) {
            let ruleObj = $.extend(true, {}, source_curCdformat[i]);
            ruleObj.cellrange = emptyRange2;
            ruleArr.push(ruleObj);
          }
        }
      }
      let target_cdformat = $.extend(true, [], Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"]);
      let target_curCdformat = $.extend(true, [], target_cdformat);
      if (ruleArr.length > 0) {
        target_curCdformat = target_curCdformat.concat(ruleArr);
      }
      source = {
        sheetIndex: copySheetIndex,
        data: sourceData,
        curData: sourceCurData,
        config: sourceConfig,
        curConfig: sourceCurConfig,
        cdformat: source_cdformat,
        curCdformat: source_curCdformat,
        range: {
          row: [c_r1, c_r2],
          column: [c_c1, c_c2]
        }
      };
      target = {
        sheetIndex: Store.currentSheetIndex,
        data: Store.flowdata,
        curData: d,
        config: $.extend(true, {}, Store.config),
        curConfig: cfg,
        cdformat: target_cdformat,
        curCdformat: target_curCdformat,
        range: {
          row: [minh, maxh],
          column: [minc, maxc]
        }
      };
    } else {
      //条件格式
      let cdformat = $.extend(true, [], Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"]);
      let curCdformat = $.extend(true, [], cdformat);
      if (curCdformat != null && curCdformat.length > 0) {
        for (let i = 0; i < curCdformat.length; i++) {
          let cellrange = curCdformat[i].cellrange;
          let emptyRange = [];
          for (let j = 0; j < cellrange.length; j++) {
            let range = conditionformat.CFSplitRange(cellrange[j], {
              row: [c_r1, c_r2],
              column: [c_c1, c_c2]
            }, {
              row: [minh, maxh],
              column: [minc, maxc]
            }, "allPart");
            emptyRange = emptyRange.concat(range);
          }
          curCdformat[i].cellrange = emptyRange;
        }
      }

      //当前表操作
      source = {
        sheetIndex: Store.currentSheetIndex,
        data: Store.flowdata,
        curData: d,
        config: $.extend(true, {}, Store.config),
        curConfig: cfg,
        cdformat: cdformat,
        curCdformat: curCdformat,
        range: {
          row: [c_r1, c_r2],
          column: [c_c1, c_c2]
        }
      };
      target = {
        sheetIndex: Store.currentSheetIndex,
        data: Store.flowdata,
        curData: d,
        config: $.extend(true, {}, Store.config),
        curConfig: cfg,
        cdformat: cdformat,
        curCdformat: curCdformat,
        range: {
          row: [minh, maxh],
          column: [minc, maxc]
        }
      };
    }
    if (addr > 0 || addc > 0) {
      jfrefreshgrid_pastcut(source, target, true);
    } else {
      jfrefreshgrid_pastcut(source, target, copyRowlChange);
    }
  }
};
export default clipboardCutPasteModule;