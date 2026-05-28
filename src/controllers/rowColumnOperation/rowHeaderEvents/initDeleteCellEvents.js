import editor from '../../../global/editor';
import { luckysheetDeleteCell } from '../../../global/extend';
import formula from '../../../global/formula';
import {  jfrefreshgrid } from '../../../global/refresh';
import tooltip from '../../../global/tooltip';
import { hasPartMC, isEditMode } from '../../../global/validate';
import locale from '../../../locale/locale';
import { getCurrentFile } from '../../../utils/storeAccess.js';
import Store from '../../../store';
import { getObjType, luckysheetContainerFocus } from '../../../utils/util';
import rightClickMenu from '../../../ui/rightClickMenu.js';
import richTextEditor from '../../../ui/richTextEditor.js';

export function initDeleteCellEvents() {
    //隐藏、显示行
    // $("#luckysheet-hidRows").click(function (event) {
    //     rightClickMenu.hide();
    //     luckysheetContainerFocus();
  
    //     let cfg = $.extend(true, {}, Store.config);
    //     if(cfg["rowhidden"] == null){
    //         cfg["rowhidden"] = {};
    //     }
  
    //     for(let s = 0; s < Store.luckysheet_select_save.length; s++){
    //         let r1 = Store.luckysheet_select_save[s].row[0],
    //             r2 = Store.luckysheet_select_save[s].row[1];
  
    //         for(let r = r1; r <= r2; r++){
    //             cfg["rowhidden"][r] = 0;
    //         }
    //     }
  
    //     //保存撤销
    //     if(Store.clearjfundo){
    //         let redo = {};
    //         redo["type"] = "showHidRows";
    //         redo["sheetIndex"] = Store.currentSheetIndex;
    //         redo["config"] = $.extend(true, {}, Store.config);
    //         redo["curconfig"] = cfg;
  
    //         Store.jfundo.length  = 0;
    //         Store.jfredo.push(redo);
    //     }
  
    //     //config
    //     Store.config = cfg;
    //     syncConfigToStore();
  
    //     //行高、列�?刷新
    //     jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
    // })
    // $("#luckysheet-showHidRows").click(function (event) {
    //     rightClickMenu.hide();
    //     luckysheetContainerFocus();
  
    //     let cfg = $.extend(true, {}, Store.config);
    //     if(cfg["rowhidden"] == null){
    //         return;
    //     }
  
    //     for(let s = 0; s < Store.luckysheet_select_save.length; s++){
    //         let r1 = Store.luckysheet_select_save[s].row[0],
    //             r2 = Store.luckysheet_select_save[s].row[1];
  
    //         for(let r = r1; r <= r2; r++){
    //             delete cfg["rowhidden"][r];
    //         }
    //     }
  
    //     //保存撤销
    //     if(Store.clearjfundo){
    //         let redo = {};
    //         redo["type"] = "showHidRows";
    //         redo["sheetIndex"] = Store.currentSheetIndex;
    //         redo["config"] = $.extend(true, {}, Store.config);
    //         redo["curconfig"] = cfg;
  
    //         Store.jfundo.length  = 0;
    //         Store.jfredo.push(redo);
    //     }
  
    //     //config
    //     Store.config = cfg;
    //     syncConfigToStore();
  
    //     //行高、列�?刷新
    //     jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
    // })
  
    //隐藏、显示列
    // $("#luckysheet-hidCols").click(function (event) {
    //     rightClickMenu.hide();
    //     luckysheetContainerFocus();
  
    //     let cfg = $.extend(true, {}, Store.config);
    //     if(cfg["colhidden"] == null){
    //         cfg["colhidden"] = {};
    //     }
  
    //     for(let s = 0; s < Store.luckysheet_select_save.length; s++){
    //         let c1 = Store.luckysheet_select_save[s].column[0],
    //             c2 = Store.luckysheet_select_save[s].column[1];
  
    //         for(let c = c1; c <= c2; c++){
    //             cfg["colhidden"][c] = 0;
    //         }
    //     }
  
    //     //保存撤销
    //     if(Store.clearjfundo){
    //         let redo = {};
    //         redo["type"] = "showHidCols";
    //         redo["sheetIndex"] = Store.currentSheetIndex;
    //         redo["config"] = $.extend(true, {}, Store.config);
    //         redo["curconfig"] = cfg;
  
    //         Store.jfundo.length  = 0;
    //         Store.jfredo.push(redo);
    //     }
  
    //     //config
    //     Store.config = cfg;
    //     syncConfigToStore();
  
    //     //行高、列�?刷新
    //     jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
    // })
    // $("#luckysheet-showHidCols").click(function (event) {
    //     rightClickMenu.hide();
    //     luckysheetContainerFocus();
  
    //     let cfg = $.extend(true, {}, Store.config);
    //     if(cfg["colhidden"] == null){
    //         return;
    //     }
  
    //     for(let s = 0; s < Store.luckysheet_select_save.length; s++){
    //         let c1 = Store.luckysheet_select_save[s].column[0],
    //             c2 = Store.luckysheet_select_save[s].column[1];
  
    //         for(let c = c1; c <= c2; c++){
    //             delete cfg["colhidden"][c];
    //         }
    //     }
  
    //     //保存撤销
    //     if(Store.clearjfundo){
    //         let redo = {};
    //         redo["type"] = "showHidCols";
    //         redo["sheetIndex"] = Store.currentSheetIndex;
    //         redo["config"] = $.extend(true, {}, Store.config);
    //         redo["curconfig"] = cfg;
  
    //         Store.jfundo.length  = 0;
    //         Store.jfredo.push(redo);
    //     }
  
    //     //config
    //     Store.config = cfg;
    //     syncConfigToStore();
  
    //     //行高、列�?刷新
    //     jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
    // })
  
    //删除单元格（左移、上移）
    $("#luckysheet-delCellsMoveLeft").click(function (event) {
      $("body .luckysheet-cols-menu").hide();
      luckysheetContainerFocus();
      const locale_drag = locale().drag;
      if (Store.luckysheet_select_save.length > 1) {
        if (isEditMode()) {
          alert(locale_drag.noMulti);
        } else {
          tooltip.info(locale_drag.noMulti, "");
        }
        return;
      }
      let str = Store.luckysheet_select_save[0].row[0],
        edr = Store.luckysheet_select_save[0].row[1],
        stc = Store.luckysheet_select_save[0].column[0],
        edc = Store.luckysheet_select_save[0].column[1];
      luckysheetDeleteCell("moveLeft", str, edr, stc, edc);
    });
    $("#luckysheet-delCellsMoveUp").click(function (event) {
      $("body .luckysheet-cols-menu").hide();
      luckysheetContainerFocus();
      const locale_drag = locale().drag;
      if (Store.luckysheet_select_save.length > 1) {
        if (isEditMode()) {
          alert(locale_drag.noMulti);
        } else {
          tooltip.info(locale_drag.noMulti, "");
        }
        return;
      }
      let str = Store.luckysheet_select_save[0].row[0],
        edr = Store.luckysheet_select_save[0].row[1],
        stc = Store.luckysheet_select_save[0].column[0],
        edc = Store.luckysheet_select_save[0].column[1];
      luckysheetDeleteCell("moveUp", str, edr, stc, edc);
    });
  
    //清除单元格内�?
    $("#luckysheet-delete-text").click(function () {
      rightClickMenu.hide();
      luckysheetContainerFocus();
      if (Store.allowEdit === false) {
        return;
      }
      if (Store.luckysheet_select_save.length > 0) {
        let d = editor.deepCopyFlowData(Store.flowdata);
        let has_PartMC = false;
        for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
          let r1 = Store.luckysheet_select_save[s].row[0],
            r2 = Store.luckysheet_select_save[s].row[1];
          let c1 = Store.luckysheet_select_save[s].column[0],
            c2 = Store.luckysheet_select_save[s].column[1];
          if (hasPartMC(Store.config, r1, r2, c1, c2)) {
            has_PartMC = true;
            break;
          }
        }
        if (has_PartMC) {
          const locale_drag = locale().drag;
          if (isEditMode()) {
            alert(locale_drag.noPartMerge);
          } else {
            tooltip.info(locale_drag.noPartMerge, "");
          }
          return;
        }
        const file = getCurrentFile();
        const hyperlink = file.hyperlink && $.extend(true, {}, file.hyperlink);
        let hyperlinkUpdated;
        for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
          let r1 = Store.luckysheet_select_save[s].row[0],
            r2 = Store.luckysheet_select_save[s].row[1];
          let c1 = Store.luckysheet_select_save[s].column[0],
            c2 = Store.luckysheet_select_save[s].column[1];
          for (let r = r1; r <= r2; r++) {
            for (let c = c1; c <= c2; c++) {
              if (getObjType(d[r][c]) == "object") {
                delete d[r][c]["m"];
                delete d[r][c]["v"];
                if (d[r][c]["f"] != null) {
                  delete d[r][c]["f"];
                  formula.delFunctionGroup(r, c, Store.currentSheetIndex);
                  delete d[r][c]["spl"];
                }
                if (d[r][c]["ct"] != null && d[r][c]["ct"].t == "inlineStr") {
                  delete d[r][c]["ct"];
                }
              } else {
                d[r][c] = null;
              }
              // 同步清除 hyperlink
              if (hyperlink?.[`${r}_${c}`]) {
                delete hyperlink[`${r}_${c}`];
                hyperlinkUpdated = true;
              }
            }
          }
        }
        jfrefreshgrid(d, Store.luckysheet_select_save, hyperlinkUpdated && {
          hyperlink
        });
  
        // 清空编辑框的内容
        // 备注：在functionInputHanddler方法中会把该标签的内容拷贝到 #luckysheet-functionbox-cell
        richTextEditor.setHtml("");
      }
    });
}
