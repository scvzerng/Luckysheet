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
  
                  $("#luckysheet-cols-rows-data").show();
                  $("#luckysheet-cols-rows-handleincell").show();
                  $("#luckysheet-cols-rows-add, #luckysheet-cols-rows-shift").hide();
  
                  $$("#luckysheet-cols-rows-data .luckysheet-menuseparator").style.display = "block";
                  $$("#luckysheet-cols-rows-handleincell .luckysheet-menuseparator").style.display = "block";
  
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
  
                      $("#luckysheet-cols-rows-add").show();
                      // $("#luckysheet-cols-rows-data").show();
                      $("#luckysheet-cols-rows-shift").hide();
                      $("#luckysheet-cols-rows-handleincell").hide();
                      Store.luckysheet_cols_menu_status = true;
  
                      $$("#luckysheet-cols-rows-add .luckysheet-menuseparator").style.display = "block";
  
                      // 自定义右键菜单：向左向右增加列，删除列，隐藏显示列，设置列宽
                      $$("#luckysheet-top-left-add-selected").style.display = cellRightClickConfig.insertColumn
                          ? "block"
                          : "none";
                      $$("#luckysheet-bottom-right-add-selected").style.display = cellRightClickConfig.insertColumn
                          ? "block"
                          : "none";
                      $$("#luckysheet-del-selected").style.display = cellRightClickConfig.deleteColumn ? "block" : "none";
                      $$("#luckysheet-hide-selected").style.display = cellRightClickConfig.hideColumn ? "block" : "none";
                      $$("#luckysheet-show-selected").style.display = cellRightClickConfig.hideColumn ? "block" : "none";
                      $$("#luckysheet-column-row-width-selected").style.display = cellRightClickConfig.columnWidth
                          ? "block"
                          : "none";
  
                      // 1. 当一个功能菜单块上方的功能块按钮都隐藏的时候，下方的功能块的顶部分割线也需要隐藏
                      if (!cellRightClickConfig.copy && !cellRightClickConfig.copyAs && !cellRightClickConfig.paste) {
                          $$("#luckysheet-cols-rows-add .luckysheet-menuseparator").style.display = "none";
  
                          if (
                              !cellRightClickConfig.insertColumn &&
                              !cellRightClickConfig.deleteColumn &&
                              !cellRightClickConfig.hideColumn &&
                              !cellRightClickConfig.columnWidth
                          ) {
                              $$("#luckysheet-cols-rows-data .luckysheet-menuseparator").style.display = "none";
                          }
                      }
  
                      // 2.当一个功能菜单块内所有的按钮都隐藏的时候，它顶部的分割线也需要隐藏掉
                      if (
                          !cellRightClickConfig.insertColumn &&
                          !cellRightClickConfig.deleteColumn &&
                          !cellRightClickConfig.hideColumn &&
                          !cellRightClickConfig.columnWidth
                      ) {
                          $$("#luckysheet-cols-rows-add .luckysheet-menuseparator").style.display = "none";
                      }
  
                      //列宽默认值
                      let cfg = $.extend(true, {}, Store.config);
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
                          $("#luckysheet-cols-rows-add")
                              .find("input[type='number'].rcsize")
                              .val(first_collen);
                      } else {
                          $("#luckysheet-cols-rows-add")
                              .find("input[type='number'].rcsize")
                              .val("");
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
                      $("#luckysheet-cols-rows-add").show();
                      // $("#luckysheet-cols-rows-data").show();
                      $("#luckysheet-cols-rows-shift").hide();
                      $("#luckysheet-cols-rows-handleincell").hide();
                      Store.luckysheet_cols_menu_status = true;
  
                      $$("#luckysheet-cols-rows-add .luckysheet-menuseparator").style.display = "block";
  
                      // 自定义右键菜单：向上向下增加行，删除行，隐藏显示行，设置行高
                      $$("#luckysheet-top-left-add-selected").style.display = cellRightClickConfig.insertRow
                          ? "block"
                          : "none";
                      $$("#luckysheet-bottom-right-add-selected").style.display = cellRightClickConfig.insertRow
                          ? "block"
                          : "none";
                      $$("#luckysheet-del-selected").style.display = cellRightClickConfig.deleteRow ? "block" : "none";
                      $$("#luckysheet-hide-selected").style.display = cellRightClickConfig.hideRow ? "block" : "none";
                      $$("#luckysheet-show-selected").style.display = cellRightClickConfig.hideRow ? "block" : "none";
                      $$("#luckysheet-column-row-width-selected").style.display = cellRightClickConfig.rowHeight
                          ? "block"
                          : "none";
  
                      // 1. 当一个功能菜单块上方的功能块按钮都隐藏的时候，下方的功能块的顶部分割线也需要隐藏
                      if (!cellRightClickConfig.copy && !cellRightClickConfig.copyAs && !cellRightClickConfig.paste) {
                          $$("#luckysheet-cols-rows-add .luckysheet-menuseparator").style.display = "none";
  
                          if (
                              !cellRightClickConfig.insertRow &&
                              !cellRightClickConfig.deleteRow &&
                              !cellRightClickConfig.hideRow &&
                              !cellRightClickConfig.rowHeight
                          ) {
                              $$("#luckysheet-cols-rows-data .luckysheet-menuseparator").style.display = "none";
                          }
                      }
  
                      // 2. 当一个功能菜单块内所有的按钮都隐藏的时候，它顶部的分割线也需要隐藏掉
                      if (
                          !cellRightClickConfig.insertRow &&
                          !cellRightClickConfig.deleteRow &&
                          !cellRightClickConfig.hideRow &&
                          !cellRightClickConfig.rowHeight
                      ) {
                          $$("#luckysheet-cols-rows-add .luckysheet-menuseparator").style.display = "none";
                      }
  
                      //行高默认值
                      let cfg = $.extend(true, {}, Store.config);
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
                          $("#luckysheet-cols-rows-add")
                              .find("input[type='number'].rcsize")
                              .val(first_rowlen);
                      } else {
                          $("#luckysheet-cols-rows-add")
                              .find("input[type='number'].rcsize")
                              .val("");
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
                          $$("#luckysheet-cols-rows-handleincell .luckysheet-menuseparator").style.display = "none";
  
                          if (
                              !cellRightClickConfig.insertRow &&
                              !cellRightClickConfig.insertColumn &&
                              !cellRightClickConfig.deleteRow &&
                              !cellRightClickConfig.deleteColumn &&
                              !cellRightClickConfig.deleteCell
                          ) {
                              $$("#luckysheet-cols-rows-data .luckysheet-menuseparator").style.display = "none";
                          }
                      }
  
                      if (
                          !cellRightClickConfig.insertRow &&
                          !cellRightClickConfig.insertColumn &&
                          !cellRightClickConfig.deleteRow &&
                          !cellRightClickConfig.deleteColumn &&
                          !cellRightClickConfig.deleteCell
                      ) {
                          $$("#luckysheet-cols-rows-handleincell .luckysheet-menuseparator").style.display = "none";
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
                      $$("#luckysheet-cols-rows-data .luckysheet-menuseparator").style.display = "none";
                  }
  
                  rightClickMenu.showAt(x, y);
              }
  
              // 备注：在mousedown中发送光标信息会漏处理部分(选区)范围
}
