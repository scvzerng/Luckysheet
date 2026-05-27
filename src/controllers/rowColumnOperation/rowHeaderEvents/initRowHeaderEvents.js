import { countfunc } from '../../../global/count';
import editor from '../../../global/editor';
import formula from '../../../global/formula';
import { colLocationByIndex, mouseposition, rowLocation } from '../../../global/location';
import { checkIsAllowEdit, isEditMode } from '../../../global/validate';
import locale from '../../../locale/locale';
import { getRangetxt } from '../../../methods/get';
import Store from '../../../store';
import { $$, showrightclickmenu } from '../../../utils/util';
import imageCtrl from '../../imageCtrl';
import luckysheetConfigsetting from '../../luckysheetConfigsetting';
import menuButton from '../../menuButton';
import luckysheetPostil from '../../postil';
import { luckysheet_count_show, selectHelpboxFill, selectHightlightShow } from '../../select';

export function initRowHeaderEvents() {
    $("#luckysheet-rows-h").mousedown(function (event) {
      //有批注在编辑�?
      luckysheetPostil.removeActivePs();
  
      //图片 active/cropping
      if ($("#luckysheet-modal-dialog-activeImage").is(":visible") || $("#luckysheet-modal-dialog-cropping").is(":visible")) {
        imageCtrl.cancelActiveImgItem();
      }
      let mouse = mouseposition(event.pageX, event.pageY);
      let y = mouse[1] + $("#luckysheet-rows-h").scrollTop();
      let row_location = rowLocation(y),
        row = row_location[1],
        row_pre = row_location[0],
        row_index = row_location[2];
      let col_index = Store.visibledatacolumn.length - 1,
        col = Store.visibledatacolumn[col_index],
        col_pre = 0;
      $("#luckysheet-rightclick-menu").hide();
      $("#luckysheet-sheet-list, #luckysheet-rightclick-sheet-menu").hide();
  
      //mousedown是右�?
      if (event.which == "3") {
        let isright = false;
        for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
          let obj_s = Store.luckysheet_select_save[s];
          if (obj_s["row"] != null && row_index >= obj_s["row"][0] && row_index <= obj_s["row"][1] && obj_s["column"][0] == 0 && obj_s["column"][1] == Store.flowdata[0].length - 1) {
            isright = true;
            break;
          }
        }
        if (isright) {
          return;
        }
      }
      let top = row_pre,
        height = row - row_pre - 1;
      let rowseleted = [row_index, row_index];
      Store.luckysheet_scroll_status = true;
  
      //公式相关
      let $input = $("#luckysheet-input-box");
      if (parseInt($input.css("top")) > 0) {
        if (formula.rangestart || formula.rangedrag_column_start || formula.rangedrag_row_start || formula.israngeseleciton() || $("#luckysheet-ifFormulaGenerator-multiRange-dialog").is(":visible")) {
          //公式选区
          let changeparam = menuButton.mergeMoveMain([0, col_index], rowseleted, {
            row_focus: row_index,
            column_focus: 0
          }, top, height, col_pre, col);
          if (changeparam != null) {
            //columnseleted = changeparam[0];
            rowseleted = changeparam[1];
            top = changeparam[2];
            height = changeparam[3];
            //left = changeparam[4];
            //width = changeparam[5];
          }
          if (event.shiftKey) {
            let last = formula.func_selectedrange;
            let top = 0,
              height = 0,
              rowseleted = [];
            if (last.top > row_pre) {
              top = row_pre;
              height = last.top + last.height - row_pre;
              if (last.row[1] > last.row_focus) {
                last.row[1] = last.row_focus;
              }
              rowseleted = [row_index, last.row[1]];
            } else if (last.top == row_pre) {
              top = row_pre;
              height = last.top + last.height - row_pre;
              rowseleted = [row_index, last.row[0]];
            } else {
              top = last.top;
              height = row - last.top - 1;
              if (last.row[0] < last.row_focus) {
                last.row[0] = last.row_focus;
              }
              rowseleted = [last.row[0], row_index];
            }
            let changeparam = menuButton.mergeMoveMain([0, col_index], rowseleted, {
              row_focus: row_index,
              column_focus: 0
            }, top, height, col_pre, col);
            if (changeparam != null) {
              // columnseleted = changeparam[0];
              rowseleted = changeparam[1];
              top = changeparam[2];
              height = changeparam[3];
              // left = changeparam[4];
              // width = changeparam[5];
            }
            last["row"] = rowseleted;
            last["top_move"] = top;
            last["height_move"] = height;
            formula.func_selectedrange = last;
          } else if (event.ctrlKey && $("#luckysheet-rich-text-editor").find("span").last().text() != ",") {
            //按住ctrl 选择选区�? 先处理上一个选区
            let vText = $("#luckysheet-rich-text-editor").text() + ",";
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
              $("#luckysheet-rich-text-editor").html(vText);
              formula.canceFunctionrangeSelected();
              formula.createRangeHightlight();
            }
            formula.rangestart = false;
            formula.rangedrag_column_start = false;
            formula.rangedrag_row_start = false;
            $("#luckysheet-functionbox-cell").html(vText);
            formula.rangeHightlightselected($("#luckysheet-rich-text-editor"));
  
            //再进�?选区的选择
            formula.israngeseleciton();
            formula.func_selectedrange = {
              left: colLocationByIndex(0)[0],
              width: colLocationByIndex(0)[1] - colLocationByIndex(0)[0] - 1,
              top: top,
              height: height,
              left_move: col_pre,
              width_move: col - col_pre - 1,
              top_move: top,
              height_move: height,
              row: rowseleted,
              column: [0, col_index],
              row_focus: row_index,
              column_focus: 0
            };
          } else {
            formula.func_selectedrange = {
              left: colLocationByIndex(0)[0],
              width: colLocationByIndex(0)[1] - colLocationByIndex(0)[0] - 1,
              top: top,
              height: height,
              left_move: col_pre,
              width_move: col - col_pre - 1,
              top_move: top,
              height_move: height,
              row: rowseleted,
              column: [0, col_index],
              row_focus: row_index,
              column_focus: 0
            };
          }
          if (formula.rangestart || formula.rangedrag_column_start || formula.rangedrag_row_start || formula.israngeseleciton()) {
            formula.rangeSetValue({
              row: rowseleted,
              column: [null, null]
            });
          } else if ($("#luckysheet-ifFormulaGenerator-multiRange-dialog").is(":visible")) {
            //if公式生成�?
            let range = getRangetxt(Store.currentSheetIndex, {
              row: rowseleted,
              column: [0, col_index]
            }, Store.currentSheetIndex);
            $("#luckysheet-ifFormulaGenerator-multiRange-dialog input").val(range);
          }
          formula.rangedrag_row_start = true;
          formula.rangestart = false;
          formula.rangedrag_column_start = false;
          $("#luckysheet-formula-functionrange-select").css({
            left: col_pre,
            width: col - col_pre - 1,
            top: top,
            height: height
          }).show();
          $("#luckysheet-formula-help-c").hide();
          luckysheet_count_show(col_pre, top, col - col_pre - 1, height, rowseleted, [0, col_index]);
          setTimeout(function () {
            let currSelection = window.getSelection();
            let anchorOffset = currSelection.anchorNode;
            let $editor;
            if ($("#luckysheet-search-formula-parm").is(":visible") || $("#luckysheet-search-formula-parm-select").is(":visible")) {
              $editor = $("#luckysheet-rich-text-editor");
              formula.rangechangeindex = formula.data_parm_index;
            } else {
              $editor = $(anchorOffset).closest("div");
            }
            let $span = $editor.find("span[rangeindex='" + formula.rangechangeindex + "']");
            formula.setCaretPosition($span.get(0), 0, $span.html().length);
          }, 1);
          return;
        } else {
          formula.updatecell(Store.luckysheetCellUpdate[0], Store.luckysheetCellUpdate[1]);
          Store.luckysheet_rows_selected_status = true;
        }
      } else {
        Store.luckysheet_rows_selected_status = true;
      }
      if (Store.luckysheet_rows_selected_status) {
        if (event.shiftKey) {
          //按住shift点击行索引选取范围
          let last = $.extend(true, {}, Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1]); //选区最后一�?
  
          let top = 0,
            height = 0,
            rowseleted = [];
          if (last.top > row_pre) {
            top = row_pre;
            height = last.top + last.height - row_pre;
            if (last.row[1] > last.row_focus) {
              last.row[1] = last.row_focus;
            }
            rowseleted = [row_index, last.row[1]];
          } else if (last.top == row_pre) {
            top = row_pre;
            height = last.top + last.height - row_pre;
            rowseleted = [row_index, last.row[0]];
          } else {
            top = last.top;
            height = row - last.top - 1;
            if (last.row[0] < last.row_focus) {
              last.row[0] = last.row_focus;
            }
            rowseleted = [last.row[0], row_index];
          }
          last["row"] = rowseleted;
          last["top_move"] = top;
          last["height_move"] = height;
          Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1] = last;
        } else if (event.ctrlKey) {
          Store.luckysheet_select_save.push({
            left: colLocationByIndex(0)[0],
            width: colLocationByIndex(0)[1] - colLocationByIndex(0)[0] - 1,
            top: top,
            height: height,
            left_move: col_pre,
            width_move: col - col_pre - 1,
            top_move: top,
            height_move: height,
            row: rowseleted,
            column: [0, col_index],
            row_focus: row_index,
            column_focus: 0,
            row_select: true
          });
        } else {
          Store.luckysheet_select_save.length = 0;
          Store.luckysheet_select_save.push({
            left: colLocationByIndex(0)[0],
            width: colLocationByIndex(0)[1] - colLocationByIndex(0)[0] - 1,
            top: top,
            height: height,
            left_move: col_pre,
            width_move: col - col_pre - 1,
            top_move: top,
            height_move: height,
            row: rowseleted,
            column: [0, col_index],
            row_focus: row_index,
            column_focus: 0,
            row_select: true
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
    }).mousemove(function (event) {
      if (Store.luckysheet_rows_selected_status || Store.luckysheet_rows_change_size || Store.luckysheet_select_status) {
        $("#luckysheet-rows-h-hover").hide();
        return;
      }
      let mouse = mouseposition(event.pageX, event.pageY);
      let y = mouse[1] + $("#luckysheet-rows-h").scrollTop();
      let row_location = rowLocation(y),
        row = row_location[1],
        row_pre = row_location[0],
        row_index = row_location[2];
      $("#luckysheet-rows-h-hover").css({
        top: row_pre,
        height: row - row_pre - 1,
        display: "block"
      });
      if (y < row - 1 && y >= row - 5) {
        $("#luckysheet-rows-change-size").css({
          top: row - 3,
          opacity: 0
        });
      } else {
        $("#luckysheet-rows-change-size").css("opacity", 0);
      }
    }).mouseleave(function (event) {
      $("#luckysheet-rows-h-hover").hide();
      $("#luckysheet-rows-change-size").css("opacity", 0);
    }).mouseup(function (event) {
      if (event.which == 3) {
        // *如果禁止前台编辑，则中止下一步操�?
        if (!checkIsAllowEdit()) {
          return;
        }
        if (isEditMode()) {
          //非编辑模式下禁止右键功能�?
          return;
        }
        $("#luckysheet-cols-rows-shift").hide();
        Store.luckysheetRightHeadClickIs = "row";
        $("#luckysheet-rightclick-menu .luckysheet-cols-rows-shift-word").text(locale().rightclick.row);
        $("#luckysheet-rightclick-menu .luckysheet-cols-rows-shift-size").text(locale().rightclick.height);
        $("#luckysheet-rightclick-menu .luckysheet-cols-rows-shift-left").text(locale().rightclick.top);
        $("#luckysheet-rightclick-menu .luckysheet-cols-rows-shift-right").text(locale().rightclick.bottom);
        $("#luckysheet-cols-rows-add").show();
        $("#luckysheet-cols-rows-data").show();
        $("#luckysheet-cols-rows-shift").hide();
        $("#luckysheet-cols-rows-handleincell").hide();
        $$("#luckysheet-cols-rows-add .luckysheet-menuseparator").style.display = "block";
        $$("#luckysheet-cols-rows-data .luckysheet-menuseparator").style.display = "block";
  
        // 自定义右键菜单：向上向下增加行，删除行，隐藏显示行，设置行高
        const cellRightClickConfig = luckysheetConfigsetting.cellRightClickConfig;
  
        // 如果全部按钮都隐藏，则整个菜单容器也要隐�?
        if (!cellRightClickConfig.copy && !cellRightClickConfig.copyAs && !cellRightClickConfig.paste && !cellRightClickConfig.insertRow && !cellRightClickConfig.deleteRow && !cellRightClickConfig.hideRow && !cellRightClickConfig.rowHeight && !cellRightClickConfig.clear && !cellRightClickConfig.matrix && !cellRightClickConfig.sort && !cellRightClickConfig.filter && !cellRightClickConfig.image && !cellRightClickConfig.link && !cellRightClickConfig.data) {
          return;
        }
        $$("#luckysheet-top-left-add-selected").style.display = cellRightClickConfig.insertRow ? "block" : "none";
        $$("#luckysheet-bottom-right-add-selected").style.display = cellRightClickConfig.insertRow ? "block" : "none";
        $$("#luckysheet-del-selected").style.display = cellRightClickConfig.deleteRow ? "block" : "none";
        $$("#luckysheet-hide-selected").style.display = cellRightClickConfig.hideRow ? "block" : "none";
        $$("#luckysheet-show-selected").style.display = cellRightClickConfig.hideRow ? "block" : "none";
        $$("#luckysheet-column-row-width-selected").style.display = cellRightClickConfig.rowHeight ? "block" : "none";
  
        // 1. 当一个功能菜单块上方的功能块按钮都隐藏的时候，下方的功能块的顶部分割线也需要隐�?
        if (!cellRightClickConfig.copy && !cellRightClickConfig.copyAs && !cellRightClickConfig.paste) {
          $$("#luckysheet-cols-rows-add .luckysheet-menuseparator").style.display = "none";
          if (!cellRightClickConfig.insertRow && !cellRightClickConfig.deleteRow && !cellRightClickConfig.hideRow && !cellRightClickConfig.rowHeight) {
            $$("#luckysheet-cols-rows-data .luckysheet-menuseparator").style.display = "none";
          }
        }
  
        // 2. 当一个功能菜单块内所有的按钮都隐藏的时候，它顶部的分割线也需要隐藏掉
        if (!cellRightClickConfig.insertRow && !cellRightClickConfig.deleteRow && !cellRightClickConfig.hideRow && !cellRightClickConfig.rowHeight) {
          $$("#luckysheet-cols-rows-add .luckysheet-menuseparator").style.display = "none";
        }
        if (!cellRightClickConfig.clear && !cellRightClickConfig.matrix && !cellRightClickConfig.sort && !cellRightClickConfig.filter && !cellRightClickConfig.image && !cellRightClickConfig.link && !cellRightClickConfig.data) {
          $$("#luckysheet-cols-rows-data .luckysheet-menuseparator").style.display = "none";
        }
        showrightclickmenu($("#luckysheet-rightclick-menu"), $(this).offset().left + 46, event.pageY);
        Store.luckysheet_cols_menu_status = true;
  
        //行高默认�?
        let cfg = $.extend(true, {}, Store.config);
        if (cfg["rowlen"] == null) {
          cfg["rowlen"] = {};
        }
        let first_rowlen = cfg["rowlen"][Store.luckysheet_select_save[0].row[0]] == null ? Store.defaultrowlen : cfg["rowlen"][Store.luckysheet_select_save[0].row[0]];
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
          $("#luckysheet-cols-rows-add").find("input[type='number'].rcsize").val(first_rowlen);
        } else {
          $("#luckysheet-cols-rows-add").find("input[type='number'].rcsize").val("");
        }
      }
    });
  
    //表格列标�?mouse事件
}
