import { luckysheetextendtable } from '../../../global/extend';
import method from '../../../global/method';
import tooltip from '../../../global/tooltip';
import { isEditMode, isRealNum } from '../../../global/validate';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus } from '../../../utils/util';
import luckysheetConfigsetting from '../../luckysheetConfigsetting';

export function initAddRowColEvents() {
    //向左增加列，向上增加�?
    // $("#luckysheet-add-lefttop, #luckysheet-add-lefttop_t").click(function (event) {
    $("#luckysheet-top-left-add-selected").click(function (event) {
      // Click input element, don't comfirm
      if (event.target.nodeName === "INPUT") {
        return;
      }
      $("#luckysheet-rightclick-menu").hide();
      luckysheetContainerFocus();
      const _locale = locale();
      const locale_drag = _locale.drag;
      const locale_info = _locale.info;
      if (Store.luckysheet_select_save.length > 1) {
        if (isEditMode()) {
          alert(locale_drag.noMulti);
        } else {
          tooltip.info(locale_drag.noMulti, "");
        }
        return;
      }
      let $t = $(this),
        value = $t.find("input").val();
      if (!isRealNum(value)) {
        if (isEditMode()) {
          alert(locale_info.tipInputNumber);
        } else {
          tooltip.info(locale_info.tipInputNumber, "");
        }
        return;
      }
      value = parseInt(value);
      if (value < 1 || value > 100) {
        if (isEditMode()) {
          alert(locale_info.tipInputNumberLimit);
        } else {
          tooltip.info(locale_info.tipInputNumberLimit, "");
        }
        return;
      }
      let st_index = Store.luckysheet_select_save[0][Store.luckysheetRightHeadClickIs][0];
      if (!method.createHookFunction("rowInsertBefore", st_index, value, "lefttop", Store.luckysheetRightHeadClickIs)) {
        return;
      }
      luckysheetextendtable(Store.luckysheetRightHeadClickIs, st_index, value, "lefttop");
    });
  
    // When you right-click a cell, a row is inserted before the row by default
    $("#luckysheetColsRowsHandleAdd_row").click(function (event) {
      $("#luckysheet-rightclick-menu").hide();
      luckysheetContainerFocus();
      if (Store.allowEdit === false) {
        return;
      }
      let st_index = Store.luckysheet_select_save[0].row[0];
      if (!method.createHookFunction("rowInsertBefore", st_index, 1, "lefttop", Store.luckysheetRightHeadClickIs)) {
        return;
      }
      luckysheetextendtable('row', st_index, 1, "lefttop");
    });
    $("#luckysheetColsRowsHandleAdd_column").click(function (event) {
      $("#luckysheet-rightclick-menu").hide();
      luckysheetContainerFocus();
      if (Store.allowEdit === false) {
        return;
      }
      let st_index = Store.luckysheet_select_save[0].column[0];
      luckysheetextendtable("column", st_index, 1, "lefttop");
    });
  
    // custom right-click a cell buttton click
    $(".luckysheetColsRowsHandleAdd_custom").click(function (clickEvent) {
      $("#luckysheet-rightclick-menu").hide();
      const cellRightClickConfig = luckysheetConfigsetting.cellRightClickConfig;
      const rowIndex = Store.luckysheet_select_save[0].row[0];
      const columnIndex = Store.luckysheet_select_save[0].column[0];
      if (cellRightClickConfig.customs[Number(clickEvent.currentTarget.dataset.index)]) {
        try {
          cellRightClickConfig.customs[Number(clickEvent.currentTarget.dataset.index)].onClick(clickEvent, event, {
            rowIndex,
            columnIndex
          });
        } catch (e) {
          console.error("custom click error", e);
        }
      }
    });
    // Add the row up, and click the text area to trigger the confirmation instead of clicking the confirmation button to enhance the experience
    // $("#luckysheet-addTopRows").click(function (event) {
    // $("#luckysheetColsRowsHandleAdd_sub .luckysheet-cols-menuitem:first-child").click(function (event) {
  
    //     // Click input element, don't comfirm
    //     if(event.target.nodeName === 'INPUT'){
    //         return;
    //     }
  
    //     $("#luckysheet-rightclick-menu").hide();
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
  
    //     let st_index = Store.luckysheet_select_save[0].row[0];
    //     luckysheetextendtable('row', st_index, value, "lefttop");
  
    //     $("#luckysheetColsRowsHandleAdd_sub").hide();
    // })
  
    // // input输入时阻止冒泡，禁止父级元素的确认事件触�?
    // $("input.luckysheet-mousedown-cancel").click(function(event) {
    //     event.stopPropagation;
    // })
  
    // $("#luckysheet-addLeftCols").click(function (event) {
    // $("#luckysheetColsRowsHandleAdd_sub .luckysheet-cols-menuitem:nth-child(3)").click(function (event) {
  
    //     // Click input element, don't comfirm
    //     if(event.target.nodeName === 'INPUT'){
    //         return;
    //     }
  
    //     $("#luckysheet-rightclick-menu").hide();
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
  
    //     let st_index = Store.luckysheet_select_save[0].column[0];
    //     luckysheetextendtable('column', st_index, value, "lefttop");
  
    //     $("#luckysheetColsRowsHandleAdd_sub").hide();
  
    // })
  
    //向右增加列，向下增加�?
    // $("#luckysheet-add-rightbottom, #luckysheet-add-rightbottom_t").click(function (event) {
    $("#luckysheet-bottom-right-add-selected").click(function (event) {
      // Click input element, don't comfirm
      if (event.target.nodeName === "INPUT") {
        return;
      }
      $("#luckysheet-rightclick-menu").hide();
      luckysheetContainerFocus();
      const _locale = locale();
      const locale_drag = _locale.drag;
      const locale_info = _locale.info;
      if (Store.luckysheet_select_save.length > 1) {
        if (isEditMode()) {
          alert(locale_drag.noMulti);
        } else {
          tooltip.info(locale_drag.noMulti, "");
        }
        return;
      }
      let $t = $(this),
        value = $t.find("input").val();
      if (!isRealNum(value)) {
        if (isEditMode()) {
          alert(locale_info.tipInputNumber);
        } else {
          tooltip.info(locale_info.tipInputNumber, "");
        }
        return;
      }
      value = parseInt(value);
      if (value < 1 || value > 100) {
        if (isEditMode()) {
          alert(locale_info.tipInputNumberLimit);
        } else {
          tooltip.info(locale_info.tipInputNumberLimit, "");
        }
        return;
      }
      let st_index = Store.luckysheet_select_save[0][Store.luckysheetRightHeadClickIs][1];
      if (!method.createHookFunction("rowInsertBefore", st_index, value, "rightbottom", Store.luckysheetRightHeadClickIs)) {
        return;
      }
      luckysheetextendtable(Store.luckysheetRightHeadClickIs, st_index, value, "rightbottom");
    });
}
