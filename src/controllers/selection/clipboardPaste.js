import {  selectHightlightShow } from "../select";
import menuButton from "../menuButton";
import editor from "../../global/editor";
import tooltip from "../../global/tooltip";
import formula from "../../global/formula";
import {  datagridgrowth  } from "../../global/getdata";
import { isEditMode, hasPartMC, isRealNum } from "../../global/validate";
import {  jfrefreshgrid } from "../../global/refresh";
import { genarate, update } from "../../global/format";
import {  getObjType,  luckysheetfontformat  } from "../../utils/util";
import Store from "../../store";
import locale from "../../locale/locale";
import imageCtrl from "../imageCtrl";
const clipboardPasteModule = {
  isPasteAction: false,
  paste: function (e, triggerType) {
    //paste事件
    let _this = this;
    if (Store.allowEdit === false) {
      return;
    }
    const _locale = locale();
    const local_drag = _locale.drag;
    let textarea = $("#luckysheet-copy-content");
    textarea.focus();
    textarea.select();

    // 等50毫秒，keyPress事件发生了再去处理数据
    setTimeout(function () {
      let data = textarea.html();
      if (data.indexOf("luckysheet_copy_action_table") > -1 && Store.luckysheet_copy_save["copyRange"] != null && Store.luckysheet_copy_save["copyRange"].length > 0) {
        if (Store.luckysheet_paste_iscut) {
          Store.luckysheet_paste_iscut = false;
          _this.pasteHandlerOfCutPaste(Store.luckysheet_copy_save);
          _this.clearcopy(e);
        } else {
          _this.pasteHandlerOfCopyPaste(Store.luckysheet_copy_save);
        }
      } else if (data.indexOf("luckysheet_copy_action_image") > -1) {
        imageCtrl.pasteImgItem();
      } else if (triggerType != "btn") {
        _this.pasteHandler(data);
      } else {
        if (isEditMode()) {
          alert(local_drag.pasteMustKeybordAlert);
        } else {
          tooltip.info(local_drag.pasteMustKeybordAlertHTMLTitle, local_drag.pasteMustKeybordAlertHTML);
        }
      }
    }, 10);
  },
  pasteHandler: function (data, borderInfo) {
    if (Store.allowEdit === false) {
      return;
    }
    const _locale = locale();
    const locale_paste = _locale.paste;
    if (Store.luckysheet_select_save.length > 1) {
      if (isEditMode()) {
        alert(locale_paste.errorNotAllowMulti);
      } else {
        tooltip.info(`<i class="fa fa-exclamation-triangle"></i>${locale_paste.warning}`, locale_paste.errorNotAllowMulti);
      }
    }
    if (typeof data == "object") {
      if (data.length == 0) {
        return;
      }
      let cfg = $.extend(true, {}, Store.config);
      if (cfg["merge"] == null) {
        cfg["merge"] = {};
      }
      if (JSON.stringify(borderInfo).length > 2 && cfg["borderInfo"] == null) {
        cfg["borderInfo"] = [];
      }
      let copyh = data.length,
        copyc = data[0].length;
      let minh = Store.luckysheet_select_save[0].row[0],
        //应用范围首尾行
        maxh = minh + copyh - 1;
      let minc = Store.luckysheet_select_save[0].column[0],
        //应用范围首尾列
        maxc = minc + copyc - 1;

      //应用范围包含部分合并单元格，则return提示
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

      //若应用范围超过最大行或最大列，增加行列
      let addr = maxh - rowMaxLength + 1,
        addc = maxc - cellMaxLength + 1;
      if (addr > 0 || addc > 0) {
        d = datagridgrowth([].concat(d), addr, addc, true);
      }
      if (cfg["rowlen"] == null) {
        cfg["rowlen"] = {};
      }
      let RowlChange = false;
      let offsetMC = {};
      for (let h = minh; h <= maxh; h++) {
        let x = [].concat(d[h]);
        let currentRowLen = Store.defaultrowlen;
        if (cfg["rowlen"][h] != null) {
          currentRowLen = cfg["rowlen"][h];
        }
        for (let c = minc; c <= maxc; c++) {
          if (getObjType(x[c]) == "object" && "mc" in x[c]) {
            if ("rs" in x[c].mc) {
              delete cfg["merge"][x[c]["mc"].r + "_" + x[c]["mc"].c];
            }
            delete x[c].mc;
          }
          let value = null;
          if (data[h - minh] != null && data[h - minh][c - minc] != null) {
            value = data[h - minh][c - minc];
          }
          x[c] = $.extend(true, {}, value);
          if (value != null && "mc" in x[c]) {
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
          if (borderInfo[h - minh + "_" + (c - minc)]) {
            let bd_obj = {
              rangeType: "cell",
              value: {
                row_index: h,
                col_index: c,
                l: borderInfo[h - minh + "_" + (c - minc)].l,
                r: borderInfo[h - minh + "_" + (c - minc)].r,
                t: borderInfo[h - minh + "_" + (c - minc)].t,
                b: borderInfo[h - minh + "_" + (c - minc)].b
              }
            };
            cfg["borderInfo"].push(bd_obj);
          }
          let fontset = luckysheetfontformat(x[c]);
          let oneLineTextHeight = menuButton.getTextSize("田", fontset)[1];
          //比较计算高度和当前高度取最大高度
          if (oneLineTextHeight > currentRowLen) {
            currentRowLen = oneLineTextHeight;
            RowlChange = true;
          }
        }
        d[h] = x;
        if (currentRowLen != Store.defaultrowlen) {
          cfg["rowlen"][h] = currentRowLen;
        }
      }
      Store.luckysheet_select_save = [{
        row: [minh, maxh],
        column: [minc, maxc]
      }];
      if (addr > 0 || addc > 0 || RowlChange) {
        let allParam = {
          cfg: cfg,
          RowlChange: true
        };
        jfrefreshgrid(d, Store.luckysheet_select_save, allParam);
      } else {
        let allParam = {
          cfg: cfg
        };
        jfrefreshgrid(d, Store.luckysheet_select_save, allParam);
        selectHightlightShow();
      }
    } else {
      data = data.replace(/\r/g, "");
      let dataChe = [];
      let che = data.split("\n"),
        colchelen = che[0].split("\t").length;
      for (let i = 0; i < che.length; i++) {
        if (che[i].split("\t").length < colchelen) {
          continue;
        }
        dataChe.push(che[i].split("\t"));
      }
      let d = editor.deepCopyFlowData(Store.flowdata); //取数据

      let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
      let curR = last["row"] == null ? 0 : last["row"][0];
      let curC = last["column"] == null ? 0 : last["column"][0];
      let rlen = dataChe.length,
        clen = dataChe[0].length;

      //应用范围包含部分合并单元格，则return提示
      let has_PartMC = false;
      if (Store.config["merge"] != null) {
        has_PartMC = hasPartMC(Store.config, curR, curR + rlen - 1, curC, curC + clen - 1);
      }
      if (has_PartMC) {
        if (isEditMode()) {
          alert(locale_paste.errorNotAllowMerged);
        } else {
          tooltip.info(`<i class="fa fa-exclamation-triangle"></i>${locale_paste.warning}`, locale_paste.errorNotAllowMerged);
        }
        return;
      }
      let addr = curR + rlen - d.length,
        addc = curC + clen - d[0].length;
      if (addr > 0 || addc > 0) {
        d = datagridgrowth([].concat(d), addr, addc, true);
      }
      for (let r = 0; r < rlen; r++) {
        let x = [].concat(d[r + curR]);
        for (let c = 0; c < clen; c++) {
          let originCell = x[c + curC];
          let value = dataChe[r][c];
          if (isRealNum(value)) {
            // 如果单元格设置了纯文本格式，那么就不要转成数值类型了，防止数值过大自动转成科学计数法
            if (originCell && originCell.ct && originCell.ct.fa === "@") {
              value = String(value);
            } else {
              value = parseFloat(value);
            }
          }
          if (originCell instanceof Object) {
            originCell.v = value;
            if (originCell.ct != null && originCell.ct.fa != null) {
              originCell.m = update(originCell["ct"]["fa"], value);
            } else {
              originCell.m = value;
            }
            if (originCell.f != null && originCell.f.length > 0) {
              originCell.f = "";
              formula.delFunctionGroup(r + curR, c + curC, Store.currentSheetIndex);
            }
          } else {
            let cell = {};
            let mask = genarate(value);
            cell.v = mask[2];
            cell.ct = mask[1];
            cell.m = mask[0];
            x[c + curC] = cell;
          }
        }
        d[r + curR] = x;
      }
      last["row"] = [curR, curR + rlen - 1];
      last["column"] = [curC, curC + clen - 1];
      if (addr > 0 || addc > 0) {
        let allParam = {
          RowlChange: true
        };
        jfrefreshgrid(d, Store.luckysheet_select_save, allParam);
      } else {
        jfrefreshgrid(d, Store.luckysheet_select_save);
        selectHightlightShow();
      }
    }
  }
};
export default clipboardPasteModule;