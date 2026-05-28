import { countfunc } from '../../../global/count';
import formula from '../../../global/formula';
import { colLocation, mouseposition, rowLocationByIndex } from '../../../global/location';
import { checkIsAllowEdit, isEditMode } from '../../../global/validate';
import locale from '../../../locale/locale';
import { getRangetxt } from '../../../methods/get';
import Store from '../../../store';
import { getLastSelection, setLastSelection, getMaxRowIndex } from '../../../utils/storeAccess.js';
import { $$, showrightclickmenu } from '../../../utils/util';
import imageCtrl from '../../imageCtrl';
import luckysheetConfigsetting from '../../luckysheetConfigsetting';
import menuButton from '../../menuButton';
import luckysheetPostil from '../../postil';
import { luckysheet_count_show, selectHelpboxFill, selectHightlightShow } from '../../select';
import formulaDialogs from '../../../ui/formulaDialogs.js';
import rightClickMenu from '../../../ui/rightClickMenu.js';
import inputBox from '../../../ui/inputBox.js';
import richTextEditor from '../../../ui/richTextEditor.js';
import { colHeader } from '../../../ui/rowColHeader.js';
import formulaRangeSelect from '../../../ui/formulaRangeSelect.js';
import functionBox from '../../../ui/functionBox.js';
import resizeHandles from '../../../ui/resizeHandles.js';

export function initColHeaderEvents() {
    colHeader.onMousedown(function (event) {
      //有批注在编辑�?
      luckysheetPostil.removeActivePs();
  
      //图片 active/cropping
      if ($("#luckysheet-modal-dialog-activeImage").is(":visible") || $("#luckysheet-modal-dialog-cropping").is(":visible")) {
        imageCtrl.cancelActiveImgItem();
      }
      let mouse = mouseposition(event.pageX, event.pageY);
      let x = mouse[0] + colHeader.getScrollLeft();
      let row_index = getMaxRowIndex(),
        row = Store.visibledatarow[row_index],
        row_pre = 0;
      let col_location = colLocation(x),
        col = col_location[1],
        col_pre = col_location[0],
        col_index = col_location[2];
      Store.orderbyindex = col_index; //排序全局函数
  
      rightClickMenu.hide();
      $("#luckysheet-sheet-list, #luckysheet-rightclick-sheet-menu").hide();
      $("#luckysheet-filter-menu, #luckysheet-filter-submenu").hide();
  
      //mousedown是右�?
      if (event.which == "3") {
        let isright = false;
        for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
          let obj_s = Store.luckysheet_select_save[s];
          if (obj_s["column"] != null && col_index >= obj_s["column"][0] && col_index <= obj_s["column"][1] && obj_s["row"][0] == 0 && obj_s["row"][1] == Store.flowdata.length - 1) {
            isright = true;
            break;
          }
        }
        if (isright) {
          return;
        }
      }
      let left = col_pre,
        width = col - col_pre - 1;
      let columnseleted = [col_index, col_index];
      Store.luckysheet_scroll_status = true;
  
      //公式相关
      let $input = inputBox.el;
      if (parseInt($input.css("top")) > 0) {
        if (formula.rangestart || formula.rangedrag_column_start || formula.rangedrag_row_start || formula.israngeseleciton() || formulaDialogs.ifFormulaMultiRange.isVisible()) {
          //公式选区
          let changeparam = menuButton.mergeMoveMain(columnseleted, [0, row_index], {
            row_focus: 0,
            column_focus: col_index
          }, row_pre, row, left, width);
          if (changeparam != null) {
            columnseleted = changeparam[0];
            //rowseleted= changeparam[1];
            //top = changeparam[2];
            //height = changeparam[3];
            left = changeparam[4];
            width = changeparam[5];
          }
          if (event.shiftKey) {
            let last = formula.func_selectedrange;
            let left = 0,
              width = 0,
              columnseleted = [];
            if (last.left > col_pre) {
              left = col_pre;
              width = last.left + last.width - col_pre;
              if (last.column[1] > last.column_focus) {
                last.column[1] = last.column_focus;
              }
              columnseleted = [col_index, last.column[1]];
            } else if (last.left == col_pre) {
              left = col_pre;
              width = last.left + last.width - col_pre;
              columnseleted = [col_index, last.column[0]];
            } else {
              left = last.left;
              width = col - last.left - 1;
              if (last.column[0] < last.column_focus) {
                last.column[0] = last.column_focus;
              }
              columnseleted = [last.column[0], col_index];
            }
            let changeparam = menuButton.mergeMoveMain(columnseleted, [0, row_index], {
              row_focus: 0,
              column_focus: col_index
            }, row_pre, row, left, width);
            if (changeparam != null) {
              columnseleted = changeparam[0];
              //rowseleted= changeparam[1];
              //top = changeparam[2];
              //height = changeparam[3];
              left = changeparam[4];
              width = changeparam[5];
            }
            last["column"] = columnseleted;
            last["left_move"] = left;
            last["width_move"] = width;
            formula.func_selectedrange = last;
          } else if (event.ctrlKey && richTextEditor.find("span").last().text() != ",") {
            //按住ctrl 选择选区， 先处理上一个选区
            let vText = richTextEditor.getText() + ",";
            if (vText.length > 0 && vText.substr(0, 1) == "=") {
              vText = formula.functionHTMLGenerate(vText);
              if (window.getSelection) {
                // all browsers, except IE before version 9
                let currSelection = window.getSelection();
                formula.functionRangeIndex = [$(currSelection.anchorNode).parent().index(), currSelection.anchorOffset];
              } else {
                // Internet Explorer before version 9
                let textRange = document.selection.createRange();
                formula.functionRangeIndex = textRange;
              }
              richTextEditor.html(vText);
              formula.canceFunctionrangeSelected();
              formula.createRangeHightlight();
            }
            formula.rangestart = false;
            formula.rangedrag_column_start = false;
            formula.rangedrag_row_start = false;
            functionBox.setHtml(vText);
            formula.rangeHightlightselected(richTextEditor.el);
  
            //再进�?选区的选择
            formula.israngeseleciton();
            formula.func_selectedrange = {
              left: left,
              width: width,
              top: rowLocationByIndex(0)[0],
              height: rowLocationByIndex(0)[1] - rowLocationByIndex(0)[0] - 1,
              left_move: left,
              width_move: width,
              top_move: row_pre,
              height_move: row - row_pre - 1,
              row: [0, row_index],
              column: columnseleted,
              row_focus: 0,
              column_focus: col_index
            };
          } else {
            formula.func_selectedrange = {
              left: left,
              width: width,
              top: rowLocationByIndex(0)[0],
              height: rowLocationByIndex(0)[1] - rowLocationByIndex(0)[0] - 1,
              left_move: left,
              width_move: width,
              top_move: row_pre,
              height_move: row - row_pre - 1,
              row: [0, row_index],
              column: columnseleted,
              row_focus: 0,
              column_focus: col_index
            };
          }
          if (formula.rangestart || formula.rangedrag_column_start || formula.rangedrag_row_start || formula.israngeseleciton()) {
            formula.rangeSetValue({
              row: [null, null],
              column: columnseleted
            });
          } else if (formulaDialogs.ifFormulaMultiRange.isVisible()) {
            //if公式生成�?
            let range = getRangetxt(Store.currentSheetIndex, {
              row: [0, row_index],
              column: columnseleted
            }, Store.currentSheetIndex);
            $("#luckysheet-ifFormulaGenerator-multiRange-dialog input").val(range);
          }
          formula.rangedrag_column_start = true;
          formula.rangestart = false;
          formula.rangedrag_row_start = false;
          formulaRangeSelect.showAt({
            left: left,
            width: width,
            top: row_pre,
            height: row - row_pre - 1
          });
          formulaDialogs.formulaHelp.hide();
          luckysheet_count_show(left, row_pre, width, row - row_pre - 1, [0, row_index], columnseleted);
          return;
        } else {
          formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
          Store.luckysheet_cols_selected_status = true;
        }
      } else {
        Store.luckysheet_cols_selected_status = true;
      }
      if (Store.luckysheet_cols_selected_status) {
        if (event.shiftKey) {
          //按住shift点击列索引选取范围
          let last = $.extend(true, {}, getLastSelection()); //选区最后一个
  
          let left = 0,
            width = 0,
            columnseleted = [];
          if (last.left > col_pre) {
            left = col_pre;
            width = last.left + last.width - col_pre;
            if (last.column[1] > last.column_focus) {
              last.column[1] = last.column_focus;
            }
            columnseleted = [col_index, last.column[1]];
          } else if (last.left == col_pre) {
            left = col_pre;
            width = last.left + last.width - col_pre;
            columnseleted = [col_index, last.column[0]];
          } else {
            left = last.left;
            width = col - last.left - 1;
            if (last.column[0] < last.column_focus) {
              last.column[0] = last.column_focus;
            }
            columnseleted = [last.column[0], col_index];
          }
          last["column"] = columnseleted;
          last["left_move"] = left;
          last["width_move"] = width;
          setLastSelection(last);
        } else if (event.ctrlKey) {
          //选区添加
          Store.luckysheet_select_save.push({
            left: left,
            width: width,
            top: rowLocationByIndex(0)[0],
            height: rowLocationByIndex(0)[1] - rowLocationByIndex(0)[0] - 1,
            left_move: left,
            width_move: width,
            top_move: row_pre,
            height_move: row - row_pre - 1,
            row: [0, row_index],
            column: columnseleted,
            row_focus: 0,
            column_focus: col_index,
            column_select: true
          });
        } else {
          Store.luckysheet_select_save.length = 0;
          Store.luckysheet_select_save.push({
            left: left,
            width: width,
            top: rowLocationByIndex(0)[0],
            height: rowLocationByIndex(0)[1] - rowLocationByIndex(0)[0] - 1,
            left_move: left,
            width_move: width,
            top_move: row_pre,
            height_move: row - row_pre - 1,
            row: [0, row_index],
            column: columnseleted,
            row_focus: 0,
            column_focus: col_index,
            column_select: true
          });
        }
        selectHightlightShow();
  
        //允许编辑后的后台更新�?
      }
      selectHelpboxFill();
      setTimeout(function () {
        clearTimeout(Store.countfuncTimeout);
        countfunc();
      }, 101);
      if (Store.luckysheet_cols_menu_status) {
        rightClickMenu.hide();
        resizeHandles.colHover.hide();
        $("#luckysheet-cols-menu-btn").hide();
        Store.luckysheet_cols_menu_status = false;
      }
      event.stopPropagation();
    });
    colHeader.onMousemove(function (event) {
      if (Store.luckysheet_cols_selected_status || Store.luckysheet_select_status) {
        resizeHandles.colHover.hide();
        $("#luckysheet-cols-menu-btn").hide();
        return;
      }
      if (Store.luckysheet_cols_menu_status || Store.luckysheet_cols_change_size) {
        return;
      }
      let mouse = mouseposition(event.pageX, event.pageY);
      let x = mouse[0] + colHeader.getScrollLeft();
      let col_location = colLocation(x),
        col = col_location[1],
        col_pre = col_location[0],
        col_index = col_location[2];
      resizeHandles.colHover.setCss({
        left: col_pre,
        width: col - col_pre - 1,
        display: "block"
      });
      $("#luckysheet-cols-menu-btn").css({
        left: col - 19,
        display: "block"
      });
      resizeHandles.colChangeSize.setCss({
        left: col - 5
      });
      if (x < col && x >= col - 5) {
        resizeHandles.colChangeSize.setCss({
          opacity: 0
        });
        $("#luckysheet-cols-menu-btn").hide();
      } else {
        resizeHandles.changeSizeLine.hide();
        resizeHandles.colChangeSize.setCss({opacity: 0});
      }
    });
    colHeader.onMouseleave(function (event) {
      if (Store.luckysheet_cols_menu_status || Store.luckysheet_cols_change_size) {
        return;
      }
      resizeHandles.colHover.hide();
      $("#luckysheet-cols-menu-btn").hide();
      resizeHandles.colChangeSize.setCss({opacity: 0});
    });
    colHeader.onMouseup(function (event) {
      if (event.which == 3) {
        // *如果禁止前台编辑，则中止下一步操�?
        if (!checkIsAllowEdit()) {
          return;
        }
        if (isEditMode()) {
          //非编辑模式下禁止右键功能�?
          return;
        }
        Store.luckysheetRightHeadClickIs = "column";
        $("#luckysheet-rightclick-menu .luckysheet-cols-rows-shift-word").text(locale().rightclick.column);
        $("#luckysheet-rightclick-menu .luckysheet-cols-rows-shift-size").text(locale().rightclick.width);
        $("#luckysheet-rightclick-menu .luckysheet-cols-rows-shift-left").text(locale().rightclick.left);
        $("#luckysheet-rightclick-menu .luckysheet-cols-rows-shift-right").text(locale().rightclick.right);
        $("#luckysheet-cols-rows-add").show();
        $("#luckysheet-cols-rows-data").show();
        $("#luckysheet-cols-rows-shift").hide();
        $("#luckysheet-cols-rows-handleincell").hide();
        $$("#luckysheet-cols-rows-add .luckysheet-menuseparator").style.display = "block";
        $$("#luckysheet-cols-rows-data .luckysheet-menuseparator").style.display = "block";
  
        // 自定义右键菜单：向左向右增加列，删除列，隐藏显示列，设置列宽
        const cellRightClickConfig = luckysheetConfigsetting.cellRightClickConfig;
  
        // 如果全部按钮都隐藏，则整个菜单容器也要隐�?
        if (!cellRightClickConfig.copy && !cellRightClickConfig.copyAs && !cellRightClickConfig.paste && !cellRightClickConfig.insertColumn && !cellRightClickConfig.deleteColumn && !cellRightClickConfig.hideColumn && !cellRightClickConfig.columnWidth && !cellRightClickConfig.clear && !cellRightClickConfig.matrix && !cellRightClickConfig.sort && !cellRightClickConfig.filter && !cellRightClickConfig.image && !cellRightClickConfig.link && !cellRightClickConfig.data) {
          return;
        }
        $$("#luckysheet-top-left-add-selected").style.display = cellRightClickConfig.insertColumn ? "block" : "none";
        $$("#luckysheet-bottom-right-add-selected").style.display = cellRightClickConfig.insertColumn ? "block" : "none";
        $$("#luckysheet-del-selected").style.display = cellRightClickConfig.deleteColumn ? "block" : "none";
        $$("#luckysheet-hide-selected").style.display = cellRightClickConfig.hideColumn ? "block" : "none";
        $$("#luckysheet-show-selected").style.display = cellRightClickConfig.hideColumn ? "block" : "none";
        $$("#luckysheet-column-row-width-selected").style.display = cellRightClickConfig.columnWidth ? "block" : "none";
  
        // 1. 当一个功能菜单块上方的功能块按钮都隐藏的时候，下方的功能块的顶部分割线也需要隐�?
        if (!cellRightClickConfig.copy && !cellRightClickConfig.copyAs && !cellRightClickConfig.paste) {
          $$("#luckysheet-cols-rows-add .luckysheet-menuseparator").style.display = "none";
          if (!cellRightClickConfig.insertColumn && !cellRightClickConfig.deleteColumn && !cellRightClickConfig.hideColumn && !cellRightClickConfig.columnWidth) {
            $$("#luckysheet-cols-rows-data .luckysheet-menuseparator").style.display = "none";
          }
        }
  
        // 2. 当一个功能菜单块内所有的按钮都隐藏的时候，它顶部的分割线也需要隐藏掉
        if (!cellRightClickConfig.insertColumn && !cellRightClickConfig.deleteColumn && !cellRightClickConfig.hideColumn && !cellRightClickConfig.columnWidth) {
          $$("#luckysheet-cols-rows-add .luckysheet-menuseparator").style.display = "none";
        }
        if (!cellRightClickConfig.clear && !cellRightClickConfig.matrix && !cellRightClickConfig.sort && !cellRightClickConfig.filter && !cellRightClickConfig.image && !cellRightClickConfig.link && !cellRightClickConfig.data) {
          $$("#luckysheet-cols-rows-data .luckysheet-menuseparator").style.display = "none";
        }
        rightClickMenu.showAt(event.pageX, $(this).offset().top + 18);
        Store.luckysheet_cols_menu_status = true;
  
        //列宽默认�?
        let cfg = $.extend(true, {}, Store.config);
        if (cfg["columnlen"] == null) {
          cfg["columnlen"] = {};
        }
        let first_collen = cfg["columnlen"][Store.luckysheet_select_save[0].column[0]] == null ? Store.defaultcollen : cfg["columnlen"][Store.luckysheet_select_save[0].column[0]];
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
          $("#luckysheet-cols-rows-add").find("input[type='number'].rcsize").val(first_collen);
        } else {
          $("#luckysheet-cols-rows-add").find("input[type='number'].rcsize").val("");
        }
      }
    });
  
    //表格行标�?改变行高按钮
}
