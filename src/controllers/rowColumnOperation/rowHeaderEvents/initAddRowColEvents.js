import { luckysheetextendtable } from '../../../global/extend';
import method from '../../../global/method';
import tooltip from '../../../global/tooltip';
import { isEditMode, isRealNum } from '../../../global/validate';
import locale from '../../../locale/locale';
import Store from '../../../store';
import { luckysheetContainerFocus } from '../../../utils/util';
import luckysheetConfigsetting from '../../luckysheetConfigsetting';
import rightClickMenu from '../../../ui/rightClickMenu.js';

export function initAddRowColEvents() {
    //向左增加列，向上增加�?
    // document.querySelector("#luckysheet-add-lefttop, #luckysheet-add-lefttop_t").addEventListener("click", function (event) {
    document.getElementById("luckysheet-top-left-add-selected")?.addEventListener("click", function (event) {
      // Click input element, don't comfirm
      if (event.target.nodeName === "INPUT") {
        return;
      }
      rightClickMenu.style.display = 'none';
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
      let $t = this,
        value = $t.querySelector("input")?.value;
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
    document.getElementById("luckysheetColsRowsHandleAdd_row")?.addEventListener("click", function (event) {
      rightClickMenu.style.display = 'none';
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
    document.getElementById("luckysheetColsRowsHandleAdd_column")?.addEventListener("click", function (event) {
      rightClickMenu.style.display = 'none';
      luckysheetContainerFocus();
      if (Store.allowEdit === false) {
        return;
      }
      let st_index = Store.luckysheet_select_save[0].column[0];
      luckysheetextendtable("column", st_index, 1, "lefttop");
    });
  
    // custom right-click a cell buttton click
    document.querySelector(".luckysheetColsRowsHandleAdd_custom")?.addEventListener("click", function (clickEvent) {
      rightClickMenu.style.display = 'none';
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
    // document.getElementById("luckysheet-addTopRows").addEventListener("click", function (event) {
    // document.querySelector("#luckysheetColsRowsHandleAdd_sub .luckysheet-cols-menuitem:first-child").addEventListener("click", function (event) {
  
    //     // Click input element, don't comfirm
    //     if(event.target.nodeName === 'INPUT'){
    //         return;
    //     }
  
    //     rightClickMenu.style.display = 'none';
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
  
    //     let $t = this, value = $t.querySelector("input").value;
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
  
    //     document.getElementById("luckysheetColsRowsHandleAdd_sub").style.display = 'none';
    // })
  
    // // input输入时阻止冒泡，禁止父级元素的确认事件触�?
    // document.querySelector("input.luckysheet-mousedown-cancel").addEventListener("click", function(event) {
    //     event.stopPropagation;
    // })
  
    // document.getElementById("luckysheet-addLeftCols").addEventListener("click", function (event) {
    // document.querySelector("#luckysheetColsRowsHandleAdd_sub .luckysheet-cols-menuitem:nth-child(3)").addEventListener("click", function (event) {
  
    //     // Click input element, don't comfirm
    //     if(event.target.nodeName === 'INPUT'){
    //         return;
    //     }
  
    //     rightClickMenu.style.display = 'none';
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

    //     let $t = this, value = $t.querySelector("input").value;
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

    //     document.getElementById("luckysheetColsRowsHandleAdd_sub").style.display = 'none';

    // })
  
    //向右增加列，向下增加�?
    // document.querySelector("#luckysheet-add-rightbottom, #luckysheet-add-rightbottom_t").addEventListener("click", function (event) {
    document.getElementById("luckysheet-bottom-right-add-selected")?.addEventListener("click", function (event) {
      // Click input element, don't comfirm
      if (event.target.nodeName === "INPUT") {
        return;
      }
      rightClickMenu.style.display = 'none';
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
      let $t = this,
        value = $t.querySelector("input")?.value;
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
