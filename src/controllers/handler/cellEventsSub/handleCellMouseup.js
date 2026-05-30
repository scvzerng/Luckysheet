import luckysheetConfigsetting from '../../luckysheetConfigsetting';
import Store from '../../../store';
import { isEditMode } from '../../../global/validate';
import { $$, showrightclickmenu } from '../../../utils/util';
import locale from '../../../locale/locale';
import rightClickMenu from '../../../ui/rightClickMenu.js';

export function handleCellMouseup(event) {
              if (event.which == "3") {
                  //禁止前台编辑(只可 框选单元格、滚动查看表格)
                  if (!Store.allowEdit) {
                      return;
                  }
  
                  if (isEditMode()) {
                      //非编辑模式下禁止右键功能框
                      return;
                  }
  
                  let x = event.pageX;
                  let y = event.pageY;
                  let data = Store.flowdata;
  
                  let obj_s = Store.luckysheet_select_save[0];
  
                  const cellRightClickConfig = luckysheetConfigsetting.cellRightClickConfig;
  
                  const _colsRowsData = document.getElementById("luckysheet-cols-rows-data"); if (_colsRowsData) _colsRowsData.style.display = '';
                  const _handleInCell = document.getElementById("luckysheet-cols-rows-handleincell"); if (_handleInCell) _handleInCell.style.display = '';
                  const _colsRowsAdd = document.getElementById("luckysheet-cols-rows-add"); if (_colsRowsAdd) _colsRowsAdd.style.display = 'none';
                  const _colsRowsShift = document.getElementById("luckysheet-cols-rows-shift"); if (_colsRowsShift) _colsRowsShift.style.display = 'none';
  
                  const _sep1 = document.querySelector("#luckysheet-cols-rows-data .luckysheet-menuseparator"); if (_sep1) _sep1.style.display = "block";
                  const _sep2 = document.querySelector("#luckysheet-cols-rows-handleincell .luckysheet-menuseparator"); if (_sep2) _sep2.style.display = "block";
  
                  if (obj_s["row"] != null && obj_s["row"][0] == 0 && obj_s["row"][1] == Store.flowdata.length - 1) {
                      // 如果全部按钮都隐藏，则整个菜单容器也要隐藏
                      if (
                          !cellRightClickConfig.copy &&
                          !cellRightClickConfig.copyAs &&
                          !cellRightClickConfig.paste &&
                          !cellRightClickConfig.insertColumn &&
                          !cellRightClickConfig.deleteColumn &&
                          !cellRightClickConfig.hideColumn &&
                          !cellRightClickConfig.columnWidth &&
                          !cellRightClickConfig.clear &&
                          !cellRightClickConfig.matrix &&
                          !cellRightClickConfig.sort &&
                          !cellRightClickConfig.filter &&
                          !cellRightClickConfig.image &&
                          !cellRightClickConfig.link &&
                          !cellRightClickConfig.data
                      ) {
                          return;
                      }
  
                      Store.luckysheetRightHeadClickIs = "column";

                      rightClickMenu.findText(".luckysheet-cols-rows-shift-word", locale().rightclick.column);
                      rightClickMenu.findText(".luckysheet-cols-rows-shift-size", locale().rightclick.width);
                      rightClickMenu.findText(".luckysheet-cols-rows-shift-left", locale().rightclick.left);
                      rightClickMenu.findText(".luckysheet-cols-rows-shift-right", locale().rightclick.right);
  
                      if (_colsRowsAdd) _colsRowsAdd.style.display = '';
                      // document.getElementById("luckysheet-cols-rows-data").style.display = '';
                      if (_colsRowsShift) _colsRowsShift.style.display = 'none';
                      if (_handleInCell) _handleInCell.style.display = 'none';
                      Store.luckysheet_cols_menu_status = true;

                      const _sep3 = document.querySelector("#luckysheet-cols-rows-add .luckysheet-menuseparator"); if (_sep3) _sep3.style.display = "block";

                      const _tlAdd = document.getElementById("luckysheet-top-left-add-selected"); if (_tlAdd) _tlAdd.style.display = cellRightClickConfig.insertColumn
                          ? "block"
                          : "none";
                      const _brAdd = document.getElementById("luckysheet-bottom-right-add-selected"); if (_brAdd) _brAdd.style.display = cellRightClickConfig.insertColumn
                          ? "block"
                          : "none";
                      const _delSel = document.getElementById("luckysheet-del-selected"); if (_delSel) _delSel.style.display = cellRightClickConfig.deleteColumn ? "block" : "none";
                      const _hideSel = document.getElementById("luckysheet-hide-selected"); if (_hideSel) _hideSel.style.display = cellRightClickConfig.hideColumn ? "block" : "none";
                      const _showSel = document.getElementById("luckysheet-show-selected"); if (_showSel) _showSel.style.display = cellRightClickConfig.hideColumn ? "block" : "none";
                      const _crwSel = document.getElementById("luckysheet-column-row-width-selected"); if (_crwSel) _crwSel.style.display = cellRightClickConfig.columnWidth
                          ? "block"
                          : "none";
  
                      // 1. 当一个功能菜单块上方的功能块按钮都隐藏的时候，下方的功能块的顶部分割线也需要隐藏
                      if (!cellRightClickConfig.copy && !cellRightClickConfig.copyAs && !cellRightClickConfig.paste) {
                          const _sep4 = document.querySelector("#luckysheet-cols-rows-add .luckysheet-menuseparator"); if (_sep4) _sep4.style.display = "none";
  
                          if (
                              !cellRightClickConfig.insertColumn &&
                              !cellRightClickConfig.deleteColumn &&
                              !cellRightClickConfig.hideColumn &&
                              !cellRightClickConfig.columnWidth
                          ) {
                              const _sep5 = document.querySelector("#luckysheet-cols-rows-data .luckysheet-menuseparator"); if (_sep5) _sep5.style.display = "none";
                          }
                      }
  
                      if (
                          !cellRightClickConfig.insertColumn &&
                          !cellRightClickConfig.deleteColumn &&
                          !cellRightClickConfig.hideColumn &&
                          !cellRightClickConfig.columnWidth
                      ) {
                          const _sep6 = document.querySelector("#luckysheet-cols-rows-add .luckysheet-menuseparator"); if (_sep6) _sep6.style.display = "none";
                      }
  
                      //列宽默认值
                      let cfg = structuredClone(Store.config);
                      if (cfg["columnlen"] == null) {
                          cfg["columnlen"] = {};
                      }
  
                      let first_collen =
                          cfg["columnlen"][Store.luckysheet_select_save[0].column[0]] == null
                              ? Store.defaultcollen
                              : cfg["columnlen"][Store.luckysheet_select_save[0].column[0]];
                      let isSame = true;
  
                      for (let i = 0; i < Store.luckysheet_select_save.length; i++) {
                          let s = Store.luckysheet_select_save[i];
                          let c1 = s.column[0],
                              c2 = s.column[1];
  
                          for (let c = c1; c <= c2; c++) {
                              let collen = cfg["columnlen"][c] == null ? Store.defaultcollen : cfg["columnlen"][c];
  
                              if (collen != first_collen) {
                                  isSame = false;
                                  break;
                              }
                          }
                      }
  
                      if (isSame) {
                          const _rcSizeInput = _colsRowsAdd ? _colsRowsAdd.querySelector("input[type='number'].rcsize") : null;
                          if (_rcSizeInput) _rcSizeInput.value = first_collen;
                      } else {
                          const _rcSizeInput = _colsRowsAdd ? _colsRowsAdd.querySelector("input[type='number'].rcsize") : null;
                          if (_rcSizeInput) _rcSizeInput.value = "";
                      }
                  } else if (
                      obj_s["column"] != null &&
                      obj_s["column"][0] == 0 &&
                      obj_s["column"][1] == Store.flowdata[0].length - 1
                  ) {
                      // 如果全部按钮都隐藏，则整个菜单容器也要隐藏
                      if (
                          !cellRightClickConfig.copy &&
                          !cellRightClickConfig.copyAs &&
                          !cellRightClickConfig.paste &&
                          !cellRightClickConfig.insertRow &&
                          !cellRightClickConfig.deleteRow &&
                          !cellRightClickConfig.hideRow &&
                          !cellRightClickConfig.rowHeight &&
                          !cellRightClickConfig.clear &&
                          !cellRightClickConfig.matrix &&
                          !cellRightClickConfig.sort &&
                          !cellRightClickConfig.filter &&
                          !cellRightClickConfig.image &&
                          !cellRightClickConfig.link &&
                          !cellRightClickConfig.data
                      ) {
                          return;
                      }
  
                      Store.luckysheetRightHeadClickIs = "row";

                      rightClickMenu.findText(".luckysheet-cols-rows-shift-word", locale().rightclick.row);
                      rightClickMenu.findText(".luckysheet-cols-rows-shift-size", locale().rightclick.height);
                      rightClickMenu.findText(".luckysheet-cols-rows-shift-left", locale().rightclick.top);
                      rightClickMenu.findText(".luckysheet-cols-rows-shift-right", locale().rightclick.bottom);
                      if (_colsRowsAdd) _colsRowsAdd.style.display = '';
                      // document.getElementById("luckysheet-cols-rows-data").style.display = '';
                      if (_colsRowsShift) _colsRowsShift.style.display = 'none';
                      if (_handleInCell) _handleInCell.style.display = 'none';
                      Store.luckysheet_cols_menu_status = true;
  
                      const _sep7 = document.querySelector("#luckysheet-cols-rows-add .luckysheet-menuseparator"); if (_sep7) _sep7.style.display = "block";

                      const _tlAdd2 = document.getElementById("luckysheet-top-left-add-selected"); if (_tlAdd2) _tlAdd2.style.display = cellRightClickConfig.insertRow
                          ? "block"
                          : "none";
                      const _brAdd2 = document.getElementById("luckysheet-bottom-right-add-selected"); if (_brAdd2) _brAdd2.style.display = cellRightClickConfig.insertRow
                          ? "block"
                          : "none";
                      const _delSel2 = document.getElementById("luckysheet-del-selected"); if (_delSel2) _delSel2.style.display = cellRightClickConfig.deleteRow ? "block" : "none";
                      const _hideSel2 = document.getElementById("luckysheet-hide-selected"); if (_hideSel2) _hideSel2.style.display = cellRightClickConfig.hideRow ? "block" : "none";
                      const _showSel2 = document.getElementById("luckysheet-show-selected"); if (_showSel2) _showSel2.style.display = cellRightClickConfig.hideRow ? "block" : "none";
                      const _crwSel2 = document.getElementById("luckysheet-column-row-width-selected"); if (_crwSel2) _crwSel2.style.display = cellRightClickConfig.rowHeight
                          ? "block"
                          : "none";
  
                      // 1. 当一个功能菜单块上方的功能块按钮都隐藏的时候，下方的功能块的顶部分割线也需要隐藏
                      if (!cellRightClickConfig.copy && !cellRightClickConfig.copyAs && !cellRightClickConfig.paste) {
                          const _sep8 = document.querySelector("#luckysheet-cols-rows-add .luckysheet-menuseparator"); if (_sep8) _sep8.style.display = "none";

                          if (
                              !cellRightClickConfig.insertRow &&
                              !cellRightClickConfig.deleteRow &&
                              !cellRightClickConfig.hideRow &&
                              !cellRightClickConfig.rowHeight
                          ) {
                              const _sep9 = document.querySelector("#luckysheet-cols-rows-data .luckysheet-menuseparator"); if (_sep9) _sep9.style.display = "none";
                          }
                      }

                      if (
                          !cellRightClickConfig.insertRow &&
                          !cellRightClickConfig.deleteRow &&
                          !cellRightClickConfig.hideRow &&
                          !cellRightClickConfig.rowHeight
                      ) {
                          const _sep10 = document.querySelector("#luckysheet-cols-rows-add .luckysheet-menuseparator"); if (_sep10) _sep10.style.display = "none";
                      }
  
                      //行高默认值
                      let cfg = structuredClone(Store.config);
                      if (cfg["rowlen"] == null) {
                          cfg["rowlen"] = {};
                      }
  
                      let first_rowlen =
                          cfg["rowlen"][Store.luckysheet_select_save[0].row[0]] == null
                              ? Store.defaultrowlen
                              : cfg["rowlen"][Store.luckysheet_select_save[0].row[0]];
                      let isSame = true;
  
                      for (let i = 0; i < Store.luckysheet_select_save.length; i++) {
                          let s = Store.luckysheet_select_save[i];
                          let r1 = s.row[0],
                              r2 = s.row[1];
  
                          for (let r = r1; r <= r2; r++) {
                              let rowlen = cfg["rowlen"][r] == null ? Store.defaultrowlen : cfg["rowlen"][r];
  
                              if (rowlen != first_rowlen) {
                                  isSame = false;
                                  break;
                              }
                          }
                      }
  
                      if (isSame) {
                          const _rcSizeInput2 = _colsRowsAdd ? _colsRowsAdd.querySelector("input[type='number'].rcsize") : null;
                          if (_rcSizeInput2) _rcSizeInput2.value = first_rowlen;
                      } else {
                          const _rcSizeInput2 = _colsRowsAdd ? _colsRowsAdd.querySelector("input[type='number'].rcsize") : null;
                          if (_rcSizeInput2) _rcSizeInput2.value = "";
                      }
                  } else {
                      // 如果全部按钮都隐藏，则整个菜单容器也要隐藏
                      if (
                          !cellRightClickConfig.copy &&
                          !cellRightClickConfig.copyAs &&
                          !cellRightClickConfig.paste &&
                          !cellRightClickConfig.insertRow &&
                          !cellRightClickConfig.insertColumn &&
                          !cellRightClickConfig.deleteRow &&
                          !cellRightClickConfig.deleteColumn &&
                          !cellRightClickConfig.deleteCell &&
                          !cellRightClickConfig.clear &&
                          !cellRightClickConfig.matrix &&
                          !cellRightClickConfig.sort &&
                          !cellRightClickConfig.filter &&
                          !cellRightClickConfig.image &&
                          !cellRightClickConfig.link &&
                          !cellRightClickConfig.data
                      ) {
                          return;
                      }
  
                      // 当一个功能菜单块上方的功能块按钮都隐藏的时候，下方的功能块的顶部分割线也需要隐藏
                      if (!cellRightClickConfig.copy && !cellRightClickConfig.copyAs && !cellRightClickConfig.paste) {
                          const _sep11 = document.querySelector("#luckysheet-cols-rows-handleincell .luckysheet-menuseparator"); if (_sep11) _sep11.style.display = "none";

                          if (
                              !cellRightClickConfig.insertRow &&
                              !cellRightClickConfig.insertColumn &&
                              !cellRightClickConfig.deleteRow &&
                              !cellRightClickConfig.deleteColumn &&
                              !cellRightClickConfig.deleteCell
                          ) {
                              const _sep12 = document.querySelector("#luckysheet-cols-rows-data .luckysheet-menuseparator"); if (_sep12) _sep12.style.display = "none";
                          }
                      }

                      if (
                          !cellRightClickConfig.insertRow &&
                          !cellRightClickConfig.insertColumn &&
                          !cellRightClickConfig.deleteRow &&
                          !cellRightClickConfig.deleteColumn &&
                          !cellRightClickConfig.deleteCell
                      ) {
                          const _sep13 = document.querySelector("#luckysheet-cols-rows-handleincell .luckysheet-menuseparator"); if (_sep13) _sep13.style.display = "none";
                      }
                  }
  
                  // 当一个功能菜单块内所有的按钮都隐藏的时候，它顶部的分割线也需要隐藏掉
                  if (
                      !cellRightClickConfig.clear &&
                      !cellRightClickConfig.matrix &&
                      !cellRightClickConfig.sort &&
                      !cellRightClickConfig.filter &&
                      !cellRightClickConfig.image &&
                      !cellRightClickConfig.link &&
                      !cellRightClickConfig.data
                  ) {
                      const _sep14 = document.querySelector("#luckysheet-cols-rows-data .luckysheet-menuseparator"); if (_sep14) _sep14.style.display = "none";
                  }
  
                  rightClickMenu.showAt(x, y);
              }
  
              // 备注：在mousedown中发送光标信息会漏处理部分(选区)范围
}
