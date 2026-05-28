import {  luckysheetdeletetable } from '../../../global/extend';
import method from '../../../global/method';
import tooltip from '../../../global/tooltip';
import {  isEditMode } from '../../../global/validate';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus } from '../../../utils/util';
import rightClickMenu from '../../../ui/rightClickMenu.js';

export function initDeleteRowColEvents() {
  
    // $("#luckysheet-addBottomRows").click(function (event) {
    // $("#luckysheetColsRowsHandleAdd_sub .luckysheet-cols-menuitem:nth-child(2)").click(function (event) {
  
    //      // Click input element, don't comfirm
    //      if(event.target.nodeName === 'INPUT'){
    //         return;
    //     }
  
    //     rightClickMenu.hide();
    //     luckysheetContainerFocus();
  
    //     const _locale = locale();
    //     const locale_drag = _locale.drag;
    //     const locale_info = _locale.info;
  
    //     if(Store.luckysheet_select_save.length > 1){
    //         if(isEditMode()){
    //             alert(locale_drag.noMulti);
    //         }
    //         else{
    //             tooltip.info(locale_drag.noMulti, "");
    //         }
  
    //         return;
    //     }
  
    //     let $t = $(this), value = $t.find("input").val();
    //     if (!isRealNum(value)) {
    //         if(isEditMode()){
    //             alert(locale_info.tipInputNumber);
    //         }
    //         else{
    //             tooltip.info(locale_info.tipInputNumber, "");
    //         }
  
    //         return;
    //     }
  
    //     value = parseInt(value);
  
    //     if (value < 1 || value > 100) {
    //         if(isEditMode()){
    //             alert(locale_info.tipInputNumberLimit);
    //         }
    //         else{
    //             tooltip.info(locale_info.tipInputNumberLimit, "");
    //         }
  
    //         return;
    //     }
  
    //     let st_index = Store.luckysheet_select_save[0].row[1];
    //     luckysheetextendtable('row', st_index, value, "rightbottom");
  
    //     $("#luckysheetColsRowsHandleAdd_sub").hide();
  
    // });
    // $("#luckysheet-addRightCols").click(function (event) {
    // $("#luckysheetColsRowsHandleAdd_sub .luckysheet-cols-menuitem:nth-child(4)").click(function (event) {
  
    //     // Click input element, don't comfirm
    //     if(event.target.nodeName === 'INPUT'){
    //         return;
    //     }
    //     rightClickMenu.hide();
    //     luckysheetContainerFocus();
  
    //     const _locale = locale();
    //     const locale_drag = _locale.drag;
    //     const locale_info = _locale.info;
  
    //     if(Store.luckysheet_select_save.length > 1){
    //         if(isEditMode()){
    //             alert(locale_drag.noMulti);
    //         }
    //         else{
    //             tooltip.info(locale_drag.noMulti, "");
    //         }
  
    //         return;
    //     }
  
    //     let $t = $(this), value = $t.find("input").val();
    //     if (!isRealNum(value)) {
    //         if(isEditMode()){
    //             alert(locale_info.tipInputNumber);
    //         }
    //         else{
    //             tooltip.info(locale_info.tipInputNumber, "");
    //         }
  
    //         return;
    //     }
  
    //     value = parseInt(value);
  
    //     if (value < 1 || value > 100) {
    //         if(isEditMode()){
    //             alert(locale_info.tipInputNumberLimit);
    //         }
    //         else{
    //             tooltip.info(locale_info.tipInputNumberLimit, "");
    //         }
  
    //         return;
    //     }
  
    //     let st_index = Store.luckysheet_select_save[0].column[1];
    //     luckysheetextendtable('column', st_index, value, "rightbottom");
  
    //     $("#luckysheetColsRowsHandleAdd_sub").hide();
  
    // });
  
    //删除选中行列
    $("#luckysheet-del-selected, #luckysheet-del-selected_t").click(function (event) {
      rightClickMenu.hide();
      luckysheetContainerFocus();
      const locale_drag = locale().drag;
      if (Store.luckysheet_select_save.length > 1) {
        if (Store.luckysheetRightHeadClickIs == "row") {
          if (isEditMode()) {
            alert(locale_drag.noMulti);
          } else {
            tooltip.info(locale_drag.noMulti, "");
          }
        } else if (Store.luckysheetRightHeadClickIs == "column") {
          if (isEditMode()) {
            alert(locale_drag.noMulti);
          } else {
            tooltip.info(locale_drag.noMulti, "");
          }
        }
        return;
      }
      let st_index = Store.luckysheet_select_save[0][Store.luckysheetRightHeadClickIs][0],
        ed_index = Store.luckysheet_select_save[0][Store.luckysheetRightHeadClickIs][1];
      if (!method.createHookFunction("rowDeleteBefore", st_index, ed_index, Store.luckysheetRightHeadClickIs)) {
        return;
      }
      luckysheetdeletetable(Store.luckysheetRightHeadClickIs, st_index, ed_index);
    });
    $("#luckysheet-delRows").click(function (event) {
      rightClickMenu.hide();
      luckysheetContainerFocus();
      const locale_drag = locale().drag;
      if (Store.luckysheet_select_save.length > 1) {
        if (Store.luckysheetRightHeadClickIs == "row") {
          if (isEditMode()) {
            alert(locale_drag.noMulti);
          } else {
            tooltip.info(locale_drag.noMulti, "");
          }
        } else if (Store.luckysheetRightHeadClickIs == "column") {
          if (isEditMode()) {
            alert(locale_drag.noMulti);
          } else {
            tooltip.info(locale_drag.noMulti, "");
          }
        }
        return;
      }
      let st_index = Store.luckysheet_select_save[0].row[0],
        ed_index = Store.luckysheet_select_save[0].row[1];
      if (!method.createHookFunction("rowDeleteBefore", st_index, ed_index, 'row')) {
        return;
      }
      luckysheetdeletetable('row', st_index, ed_index);
    });
    $("#luckysheet-delCols").click(function (event) {
      rightClickMenu.hide();
      luckysheetContainerFocus();
      const locale_drag = locale().drag;
      if (Store.luckysheet_select_save.length > 1) {
        if (Store.luckysheetRightHeadClickIs == "row") {
          if (isEditMode()) {
            alert(locale_drag.noMulti);
          } else {
            tooltip.info(locale_drag.noMulti, "");
          }
        } else if (Store.luckysheetRightHeadClickIs == "column") {
          if (isEditMode()) {
            alert(locale_drag.noMulti);
          } else {
            tooltip.info(locale_drag.noMulti, "");
          }
        }
        return;
      }
      let st_index = Store.luckysheet_select_save[0].column[0],
        ed_index = Store.luckysheet_select_save[0].column[1];
      luckysheetdeletetable("column", st_index, ed_index);
    });
}
