import { countfunc } from '../../../global/count';
import formula from '../../../global/formula';
import { colLocationByIndex, mouseposition, rowLocation } from '../../../global/location';
import { checkIsAllowEdit, isEditMode } from '../../../global/validate';
import locale from '../../../locale/locale';
import { getRangetxt } from '../../../methods/get';
import Store from '../../../store';
import { getLastSelection, setLastSelection, getMaxColIndex } from '../../../utils/storeAccess.js';
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
import { rowHeader } from '../../../ui/rowColHeader.js';
import formulaRangeSelect from '../../../ui/formulaRangeSelect.js';
import functionBox from '../../../ui/functionBox.js';
import resizeHandles from '../../../ui/resizeHandles.js';
import imageDialog from '../../../ui/imageDialog.js';

export function initRowHeaderEvents() {
    rowHeader.onMousedown(function (event) {
      //有批注在编辑�?
      luckysheetPostil.removeActivePs();
  
      //图片 active/cropping
      if (imageDialog.active.isVisible() || imageDialog.cropping.isVisible()) {
        imageCtrl.cancelActiveImgItem();
      }
      let mouse = mouseposition(event.pageX, event.pageY);
      let y = mouse[1] + rowHeader.getScrollTop();
      let row_location = rowLocation(y),
        row = row_location[1],
        row_pre = row_location[0],
        row_index = row_location[2];
      let col_index = getMaxColIndex(),
        col = Store.visibledatacolumn[col_index],
        col_pre = 0;
      rightClickMenu.style.display = 'none';
      [document.getElementById("luckysheet-sheet-list"), document.getElementById("luckysheet-rightclick-sheet-menu")].forEach(el => { if (el) el.style.display = 'none'; });
  
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
      let $input = inputBox.el;
      if (parseInt(getComputedStyle($input).top) > 0) {
        if (formula.rangestart || formula.rangedrag_column_start || formula.rangedrag_row_start || formula.israngeseleciton() || formulaDialogs.ifFormulaMultiRange.isVisible()) {
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
          } else if (event.ctrlKey && (() => { const _spans = richTextEditor.el.querySelectorAll("span"); return _spans.length > 0 && _spans[_spans.length - 1].textContent != ","; })()) {
            let vText = richTextEditor.getText() + ",";
            if (vText !== null && vText.substr(0, 1) == "=") {
              vText = formula.functionHTMLGenerate(vText);
              if (window.getSelection) {
                // all browsers, except IE before version 9
                let currSelection = window.getSelection();
                let _an = currSelection.anchorNode;
                let _p = _an && _an.nodeType === Node.TEXT_NODE ? _an.parentElement : _an;
                formula.functionRangeIndex = [_p && _p.parentElement ? Array.from(_p.parentElement.children).indexOf(_p) : -1, currSelection.anchorOffset];
              } else {
                // Internet Explorer before version 9
                let textRange = document.selection.createRange();
                formula.functionRangeIndex = textRange;
              }
              richTextEditor.setHtml(vText);
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
          } else if (formulaDialogs.ifFormulaMultiRange.isVisible()) {
            //if公式生成�?
            let range = getRangetxt(Store.currentSheetIndex, {
              row: rowseleted,
              column: [0, col_index]
            }, Store.currentSheetIndex);
            formulaDialogs.ifFormulaMultiRange.querySelector("input").value = range;
          }
          formula.rangedrag_row_start = true;
          formula.rangestart = false;
          formula.rangedrag_column_start = false;
          formulaRangeSelect.showAt({
            left: col_pre,
            width: col - col_pre - 1,
            top: top,
            height: height
          });
          formulaDialogs.formulaHelp.style.display = 'none';
          luckysheet_count_show(col_pre, top, col - col_pre - 1, height, rowseleted, [0, col_index]);
          setTimeout(function () {
            let currSelection = window.getSelection();
            let anchorOffset = currSelection.anchorNode;
            let $editor;
            if (formulaDialogs.searchParm.isVisible() || formulaDialogs.searchParmSelect.isVisible()) {
              $editor = richTextEditor.el;
              formula.rangechangeindex = formula.data_parm_index;
            } else {
              $editor = anchorOffset.closest("div");
            }
            let $span = $editor.querySelector("span[rangeindex='" + formula.rangechangeindex + "']");
            formula.setCaretPosition($span, 0, $span.innerHTML.length);
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
          let last = structuredClone(getLastSelection()); //选区最后一个
  
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
          setLastSelection(last);
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
    });
    rowHeader.onMousemove(function (event) {
      if (Store.luckysheet_rows_selected_status || Store.luckysheet_rows_change_size || Store.luckysheet_select_status) {
        resizeHandles.rowHover.style.display = 'none';
        return;
      }
      let mouse = mouseposition(event.pageX, event.pageY);
      let y = mouse[1] + rowHeader.getScrollTop();
      let row_location = rowLocation(y),
        row = row_location[1],
        row_pre = row_location[0],
        row_index = row_location[2];
      resizeHandles.rowHover.setCss({
        top: row_pre,
        height: row - row_pre - 1,
        display: "block"
      });
      if (y < row - 1 && y >= row - 5) {
        resizeHandles.rowChangeSize.setCss({
          top: row - 3,
          opacity: 0
        });
      } else {
        resizeHandles.rowChangeSize.setCss({opacity: 0});
      }
    });
    rowHeader.onMouseleave(function (event) {
      resizeHandles.rowHover.style.display = 'none';
      resizeHandles.rowChangeSize.setCss({opacity: 0});
    });
    rowHeader.onMouseup(function (event) {
      if (event.which == 3) {
        // *如果禁止前台编辑，则中止下一步操�?
        if (!checkIsAllowEdit()) {
          return;
        }
        if (isEditMode()) {
          //非编辑模式下禁止右键功能�?
          return;
        }
        const _elShift1 = document.getElementById("luckysheet-cols-rows-shift"); if (_elShift1) _elShift1.style.display = 'none';
        Store.luckysheetRightHeadClickIs = "row";
        rightClickMenu.findText(".luckysheet-cols-rows-shift-word", locale().rightclick.row);
        rightClickMenu.findText(".luckysheet-cols-rows-shift-size", locale().rightclick.height);
        rightClickMenu.findText(".luckysheet-cols-rows-shift-left", locale().rightclick.top);
        rightClickMenu.findText(".luckysheet-cols-rows-shift-right", locale().rightclick.bottom);
        const _elAdd1 = document.getElementById("luckysheet-cols-rows-add"); if (_elAdd1) _elAdd1.style.display = '';
        const _elData1 = document.getElementById("luckysheet-cols-rows-data"); if (_elData1) _elData1.style.display = '';
        const _elShift2 = document.getElementById("luckysheet-cols-rows-shift"); if (_elShift2) _elShift2.style.display = 'none';
        const _elHandleInCell1 = document.getElementById("luckysheet-cols-rows-handleincell"); if (_elHandleInCell1) _elHandleInCell1.style.display = 'none';
        document.querySelector("#luckysheet-cols-rows-add .luckysheet-menuseparator").style.display = "block";
        document.querySelector("#luckysheet-cols-rows-data .luckysheet-menuseparator").style.display = "block";
  
        // 自定义右键菜单：向上向下增加行，删除行，隐藏显示行，设置行高
        const cellRightClickConfig = luckysheetConfigsetting.cellRightClickConfig;
  
        // 如果全部按钮都隐藏，则整个菜单容器也要隐�?
        if (!cellRightClickConfig.copy && !cellRightClickConfig.copyAs && !cellRightClickConfig.paste && !cellRightClickConfig.insertRow && !cellRightClickConfig.deleteRow && !cellRightClickConfig.hideRow && !cellRightClickConfig.rowHeight && !cellRightClickConfig.clear && !cellRightClickConfig.matrix && !cellRightClickConfig.sort && !cellRightClickConfig.filter && !cellRightClickConfig.image && !cellRightClickConfig.link && !cellRightClickConfig.data) {
          return;
        }
        document.getElementById("luckysheet-top-left-add-selected").style.display = cellRightClickConfig.insertRow ? "block" : "none";
        document.getElementById("luckysheet-bottom-right-add-selected").style.display = cellRightClickConfig.insertRow ? "block" : "none";
        document.getElementById("luckysheet-del-selected").style.display = cellRightClickConfig.deleteRow ? "block" : "none";
        document.getElementById("luckysheet-hide-selected").style.display = cellRightClickConfig.hideRow ? "block" : "none";
        document.getElementById("luckysheet-show-selected").style.display = cellRightClickConfig.hideRow ? "block" : "none";
        document.getElementById("luckysheet-column-row-width-selected").style.display = cellRightClickConfig.rowHeight ? "block" : "none";
  
        // 1. 当一个功能菜单块上方的功能块按钮都隐藏的时候，下方的功能块的顶部分割线也需要隐�?
        if (!cellRightClickConfig.copy && !cellRightClickConfig.copyAs && !cellRightClickConfig.paste) {
          document.querySelector("#luckysheet-cols-rows-add .luckysheet-menuseparator").style.display = "none";
          if (!cellRightClickConfig.insertRow && !cellRightClickConfig.deleteRow && !cellRightClickConfig.hideRow && !cellRightClickConfig.rowHeight) {
            document.querySelector("#luckysheet-cols-rows-data .luckysheet-menuseparator").style.display = "none";
          }
        }
  
        // 2. 当一个功能菜单块内所有的按钮都隐藏的时候，它顶部的分割线也需要隐藏掉
        if (!cellRightClickConfig.insertRow && !cellRightClickConfig.deleteRow && !cellRightClickConfig.hideRow && !cellRightClickConfig.rowHeight) {
          document.querySelector("#luckysheet-cols-rows-add .luckysheet-menuseparator").style.display = "none";
        }
        if (!cellRightClickConfig.clear && !cellRightClickConfig.matrix && !cellRightClickConfig.sort && !cellRightClickConfig.filter && !cellRightClickConfig.image && !cellRightClickConfig.link && !cellRightClickConfig.data) {
          document.querySelector("#luckysheet-cols-rows-data .luckysheet-menuseparator").style.display = "none";
        }
        rightClickMenu.showAt(this.getBoundingClientRect().left + window.pageXOffset + 46, event.pageY);
        Store.luckysheet_cols_menu_status = true;
  
        //行高默认�?
        let cfg = structuredClone(Store.config);
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
          document.getElementById("luckysheet-cols-rows-add").querySelector("input[type='number'].rcsize").value = first_rowlen;
        } else {
          document.getElementById("luckysheet-cols-rows-add").querySelector("input[type='number'].rcsize").value = "";
        }
      }
    });
  
    //表格列标�?mouse事件
}
