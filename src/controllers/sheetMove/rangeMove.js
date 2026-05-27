import { getObjType } from "../../utils/util";
import formula from "../../global/formula";
import { isRealNull } from "../../global/validate";
import { countfunc } from "../../global/count";
import menuButton from "../menuButton";
import { selectHightlightShow } from "../select";
import Store from "../../store";
import { rowHasMerge, colHasMerge, getRowMerge, getColMerge } from "./mergeHelper";
import { getNextIndex } from "./dataBoundary";
//shift + 方向键  调整选区
function luckysheetMoveHighlightRange(postion, index, type, isScroll) {
  if (isScroll == null) {
    isScroll = true;
  }
  if (!postion) {
    postion == "down";
  }
  let row, row_pre;
  let col, col_pre;
  if (type == "rangeOfSelect") {
    let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
    let curR = last["row"][0],
      endR = last["row"][1];
    let curC = last["column"][0],
      endC = last["column"][1];
    let rf = last["row_focus"],
      cf = last["column_focus"];
    let datarowlen = Store.flowdata.length,
      datacolumnlen = Store.flowdata[0].length;
    if (postion == "down") {
      //选区上下变动
      if (rowHasMerge(rf, curC, endC)) {
        //focus单元格所在行有合并单元格
        let rfMerge = getRowMerge(rf, curC, endC);
        let rf_str = rfMerge[0],
          rf_end = rfMerge[1];
        if (rf_str > curR && rf_end == endR) {
          if (index > 0 && rowHasMerge(curR, curC, endC)) {
            curR = getRowMerge(curR, curC, endC)[1];
          }
          curR += index;
        } else if (rf_end < endR && rf_str == curR) {
          if (index < 0 && rowHasMerge(endR, curC, endC)) {
            endR = getRowMerge(endR, curC, endC)[0];
          }
          endR += index;
        } else {
          if (index > 0) {
            endR += index;
          } else {
            curR += index;
          }
        }
      } else {
        if (rf > curR && rf == endR) {
          if (index > 0 && rowHasMerge(curR, curC, endC)) {
            curR = getRowMerge(curR, curC, endC)[1];
          }
          curR += index;
        } else if (rf < endR && rf == curR) {
          if (index < 0 && rowHasMerge(endR, curC, endC)) {
            endR = getRowMerge(endR, curC, endC)[0];
          }
          endR += index;
        } else if (rf == curR && rf == endR) {
          if (index > 0) {
            endR += index;
          } else {
            curR += index;
          }
        }
      }
      if (endR >= datarowlen) {
        endR = datarowlen - 1;
      }
      if (endR < 0) {
        endR = 0;
      }
      if (curR >= datarowlen) {
        curR = datarowlen - 1;
      }
      if (curR < 0) {
        curR = 0;
      }
    } else {
      if (colHasMerge(cf, curR, endR)) {
        //focus单元格所在列有合并单元格
        let cfMerge = getColMerge(cf, curR, endR);
        let cf_str = cfMerge[0],
          cf_end = cfMerge[1];
        if (cf_str > curC && cf_end == endC) {
          if (index > 0 && colHasMerge(curC, curR, endR)) {
            curC = getColMerge(curC, curR, endR)[1];
          }
          curC += index;
        } else if (cf_end < endC && cf_str == curC) {
          if (index < 0 && colHasMerge(endC, curR, endR)) {
            endC = getColMerge(endC, curR, endR)[0];
          }
          endC += index;
        } else {
          if (index > 0) {
            endC += index;
          } else {
            curC += index;
          }
        }
      } else {
        if (cf > curC && cf == endC) {
          if (index > 0 && colHasMerge(curC, curR, endR)) {
            curC = getColMerge(curC, curR, endR)[1];
          }
          curC += index;
        } else if (cf < endC && cf == curC) {
          if (index < 0 && colHasMerge(endC, curR, endR)) {
            endC = getColMerge(endC, curR, endR)[0];
          }
          endC += index;
        } else if (cf == curC && cf == endC) {
          if (index > 0) {
            endC += index;
          } else {
            curC += index;
          }
        }
      }
      if (endC >= datacolumnlen) {
        endC = datacolumnlen - 1;
      }
      if (endC < 0) {
        endC = 0;
      }
      if (curC >= datacolumnlen) {
        curC = datacolumnlen - 1;
      }
      if (curC < 0) {
        curC = 0;
      }
    }
    let rowseleted = [curR, endR];
    let columnseleted = [curC, endC];
    row = Store.visibledatarow[endR];
    row_pre = curR - 1 == -1 ? 0 : Store.visibledatarow[curR - 1];
    col = Store.visibledatacolumn[endC];
    col_pre = curC - 1 == -1 ? 0 : Store.visibledatacolumn[curC - 1];
    let changeparam = menuButton.mergeMoveMain(columnseleted, rowseleted, last, row_pre, row - row_pre - 1, col_pre, col - col_pre - 1);
    if (changeparam != null) {
      columnseleted = changeparam[0];
      rowseleted = changeparam[1];
      // top = changeparam[2];
      // height = changeparam[3];
      // left = changeparam[4];
      // width = changeparam[5];
    }
    last["row"] = rowseleted;
    last["column"] = columnseleted;
    selectHightlightShow();
  } else if (type == "rangeOfFormula") {
    let last = formula.func_selectedrange;
    let curR = last["row"][0],
      endR = last["row"][1];
    let curC = last["column"][0],
      endC = last["column"][1];
    let rf = last["row_focus"],
      cf = last["column_focus"];
    let datarowlen = Store.flowdata.length,
      datacolumnlen = Store.flowdata[0].length;
    if (postion == "down") {
      //选区上下变动
      if (rowHasMerge(rf, curC, endC)) {
        //focus单元格所在行有合并单元格
        let rfMerge = getRowMerge(rf, curC, endC);
        let rf_str = rfMerge[0],
          rf_end = rfMerge[1];
        if (rf_str > curR && rf_end == endR) {
          if (index > 0 && rowHasMerge(curR, curC, endC)) {
            curR = getRowMerge(curR, curC, endC)[1];
          }
          curR += index;
        } else if (rf_end < endR && rf_str == curR) {
          if (index < 0 && rowHasMerge(endR, curC, endC)) {
            endR = getRowMerge(endR, curC, endC)[0];
          }
          endR += index;
        } else {
          if (index > 0) {
            endR += index;
          } else {
            curR += index;
          }
        }
      } else {
        if (rf > curR && rf == endR) {
          if (index > 0 && rowHasMerge(curR, curC, endC)) {
            curR = getRowMerge(curR, curC, endC)[1];
          }
          curR += index;
        } else if (rf < endR && rf == curR) {
          if (index < 0 && rowHasMerge(endR, curC, endC)) {
            endR = getRowMerge(endR, curC, endC)[0];
          }
          endR += index;
        } else if (rf == curR && rf == endR) {
          if (index > 0) {
            endR += index;
          } else {
            curR += index;
          }
        }
      }
      if (endR >= datarowlen) {
        endR = datarowlen - 1;
      }
      if (endR < 0) {
        endR = 0;
      }
      if (curR >= datarowlen) {
        curR = datarowlen - 1;
      }
      if (curR < 0) {
        curR = 0;
      }
    } else {
      if (colHasMerge(cf, curR, endR)) {
        //focus单元格所在列有合并单元格
        let cfMerge = getColMerge(cf, curR, endR);
        let cf_str = cfMerge[0],
          cf_end = cfMerge[1];
        if (cf_str > curC && cf_end == endC) {
          if (index > 0 && colHasMerge(curC, curR, endR)) {
            curC = getColMerge(curC, curR, endR)[1];
          }
          curC += index;
        } else if (cf_end < endC && cf_str == curC) {
          if (index < 0 && colHasMerge(endC, curR, endR)) {
            endC = getColMerge(endC, curR, endR)[0];
          }
          endC += index;
        } else {
          if (index > 0) {
            endC += index;
          } else {
            curC += index;
          }
        }
      } else {
        if (cf > curC && cf == endC) {
          if (index > 0 && colHasMerge(curC, curR, endR)) {
            curC = getColMerge(curC, curR, endR)[1];
          }
          curC += index;
        } else if (cf < endC && cf == curC) {
          if (index < 0 && colHasMerge(endC, curR, endR)) {
            endC = getColMerge(endC, curR, endR)[0];
          }
          endC += index;
        } else if (cf == curC && cf == endC) {
          if (index > 0) {
            endC += index;
          } else {
            curC += index;
          }
        }
      }
      if (endC >= datacolumnlen) {
        endC = datacolumnlen - 1;
      }
      if (endC < 0) {
        endC = 0;
      }
      if (curC >= datacolumnlen) {
        curC = datacolumnlen - 1;
      }
      if (curC < 0) {
        curC = 0;
      }
    }
    let rowseleted = [curR, endR];
    let columnseleted = [curC, endC];
    row = Store.visibledatarow[endR];
    row_pre = curR - 1 == -1 ? 0 : Store.visibledatarow[curR - 1];
    col = Store.visibledatacolumn[endC];
    col_pre = curC - 1 == -1 ? 0 : Store.visibledatacolumn[curC - 1];
    let top = row_pre,
      height = row - row_pre - 1;
    let left = col_pre,
      width = col - col_pre - 1;
    let changeparam = menuButton.mergeMoveMain(columnseleted, rowseleted, last, top, height, left, width);
    if (changeparam != null) {
      columnseleted = changeparam[0];
      rowseleted = changeparam[1];
      top = changeparam[2];
      height = changeparam[3];
      left = changeparam[4];
      width = changeparam[5];
    }
    formula.func_selectedrange = {
      "left": left,
      "width": width,
      "top": top,
      "height": height,
      "left_move": left,
      "width_move": width,
      "top_move": top,
      "height_move": height,
      "row": rowseleted,
      "column": columnseleted,
      "row_focus": rf,
      "column_focus": cf
    };
    $("#luckysheet-formula-functionrange-select").css({
      "left": left,
      "width": width,
      "top": top,
      "height": height
    }).show();
    formula.rangeSetValue({
      "row": rowseleted,
      "column": columnseleted
    });
  }
  let scrollLeft = $("#luckysheet-cell-main").scrollLeft();
  let scrollTop = $("#luckysheet-cell-main").scrollTop();
  let winH = $("#luckysheet-cell-main").height(),
    winW = $("#luckysheet-cell-main").width();
  let sleft = 0,
    stop = 0;
  if (col - scrollLeft - winW + 20 > 0) {
    sleft = col - winW + 20;
    if (isScroll) {
      $("#luckysheet-scrollbar-x").scrollLeft(sleft);
    }
  } else if (col_pre - scrollLeft - 20 < 0) {
    sleft = col_pre - 20;
    if (isScroll) {
      $("#luckysheet-scrollbar-x").scrollLeft(sleft);
    }
  }
  if (row - scrollTop - winH + 20 > 0) {
    stop = row - winH + 20;
    if (isScroll) {
      $("#luckysheet-scrollbar-y").scrollTop(stop);
    }
  } else if (row_pre - scrollTop - 20 < 0) {
    stop = row_pre - 20;
    if (isScroll) {
      $("#luckysheet-scrollbar-y").scrollTop(stop);
    }
  }
  clearTimeout(Store.countfuncTimeout);
  countfunc();
}

//ctrl + shift + 方向键  调整选区
function luckysheetMoveHighlightRange2(postion, type, isScroll) {
  if (!isScroll) {
    isScroll = true;
  }
  let row, row_pre;
  let col, col_pre;
  if (type == "rangeOfSelect") {
    let last = Store.luckysheet_select_save[Store.luckysheet_select_save.length - 1];
    let rf = last["row_focus"],
      cf = last["column_focus"];
    let r1 = last["row"][0],
      r2 = last["row"][1];
    let c1 = last["column"][0],
      c2 = last["column"][1];
    if (postion == "down") {
      if (r2 == Store.flowdata.length - 1) {
        return;
      }
      if (rowHasMerge(rf, c1, c2)) {
        //focus所在行有合并单元格
        let rfMerge = getRowMerge(rf, c1, c2);
        let rf_str = rfMerge[0],
          rf_end = rfMerge[1];
        if (rf_str > r1 && rf_end == r2) {
          r1 = getNextIndex("down", cf, r1, r2);
        } else {
          r2 = getNextIndex("down", cf, r2, Store.flowdata.length - 1);
        }
      } else {
        if (rf > r1 && rf == r2) {
          r1 = getNextIndex("down", cf, r1, r2);
        } else {
          r2 = getNextIndex("down", cf, r2, Store.flowdata.length - 1);
        }
      }
    } else if (postion == "up") {
      if (r1 == 0) {
        return;
      }
      if (rowHasMerge(rf, c1, c2)) {
        //focus所在行有合并单元格
        let rfMerge = getRowMerge(rf, c1, c2);
        let rf_str = rfMerge[0],
          rf_end = rfMerge[1];
        if (rf_end < r2 && rf_str == r1) {
          r2 = getNextIndex("up", cf, r1, r2);
        } else {
          r1 = getNextIndex("up", cf, 0, r1);
        }
      } else {
        if (rf < r2 && rf == r1) {
          r2 = getNextIndex("up", cf, r1, r2);
        } else {
          r1 = getNextIndex("up", cf, 0, r1);
        }
      }
    } else if (postion == "right") {
      if (c2 == Store.flowdata[0].length - 1) {
        return;
      }
      if (colHasMerge(cf, r1, r2)) {
        //focus所在行有合并单元格
        let cfMerge = getColMerge(cf, r1, r2);
        let cf_str = cfMerge[0],
          cf_end = cfMerge[1];
        if (cf_str > c1 && cf_end == c2) {
          c1 = getNextIndex("right", rf, c1, c2);
        } else {
          c2 = getNextIndex("right", rf, c2, Store.flowdata[0].length - 1);
        }
      } else {
        if (cf > c1 && cf == c2) {
          c1 = getNextIndex("right", rf, c1, c2);
        } else {
          c2 = getNextIndex("right", rf, c2, Store.flowdata[0].length - 1);
        }
      }
    } else if (postion == "left") {
      if (c1 == 0) {
        return;
      }
      if (colHasMerge(cf, r1, r2)) {
        //focus所在行有合并单元格
        let cfMerge = getColMerge(cf, r1, r2);
        let cf_str = cfMerge[0],
          cf_end = cfMerge[1];
        if (cf_end < c2 && cf_str == c1) {
          c2 = getNextIndex("left", rf, c1, c2);
        } else {
          c1 = getNextIndex("left", rf, 0, c1);
        }
      } else {
        if (cf < c2 && cf == c1) {
          c2 = getNextIndex("left", rf, c1, c2);
        } else {
          c1 = getNextIndex("left", rf, 0, c1);
        }
      }
    }
    let rowseleted = [r1, r2];
    let columnseleted = [c1, c2];
    row = Store.visibledatarow[r2];
    row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
    col = Store.visibledatacolumn[c2];
    col_pre = c1 - 1 == -1 ? 0 : Store.visibledatacolumn[c1 - 1];
    let changeparam = menuButton.mergeMoveMain(columnseleted, rowseleted, last, row_pre, row - row_pre - 1, col_pre, col - col_pre - 1);
    if (changeparam != null) {
      columnseleted = changeparam[0];
      rowseleted = changeparam[1];
      // top = changeparam[2];
      // height = changeparam[3];
      // left = changeparam[4];
      // width = changeparam[5];
    }
    last["row"] = rowseleted;
    last["column"] = columnseleted;
    selectHightlightShow();
  } else if (type == "rangeOfFormula") {
    let last = formula.func_selectedrange;
    let rf = last["row_focus"],
      cf = last["column_focus"];
    let r1 = last["row"][0],
      r2 = last["row"][1];
    let c1 = last["column"][0],
      c2 = last["column"][1];
    if (postion == "down") {
      if (r2 == Store.flowdata.length - 1) {
        return;
      }
      if (rowHasMerge(rf, c1, c2)) {
        //focus所在行有合并单元格
        let rfMerge = getRowMerge(rf, c1, c2);
        let rf_str = rfMerge[0],
          rf_end = rfMerge[1];
        if (rf_str > r1 && rf_end == r2) {
          r1 = getNextIndex("down", cf, r1, r2);
        } else {
          r2 = getNextIndex("down", cf, r2, Store.flowdata.length - 1);
        }
      } else {
        if (rf > r1 && rf == r2) {
          r1 = getNextIndex("down", cf, r1, r2);
        } else {
          r2 = getNextIndex("down", cf, r2, Store.flowdata.length - 1);
        }
      }
    } else if (postion == "up") {
      if (r1 == 0) {
        return;
      }
      if (rowHasMerge(rf, c1, c2)) {
        //focus所在行有合并单元格
        let rfMerge = getRowMerge(rf, c1, c2);
        let rf_str = rfMerge[0],
          rf_end = rfMerge[1];
        if (rf_end < r2 && rf_str == r1) {
          r2 = getNextIndex("up", cf, r1, r2);
        } else {
          r1 = getNextIndex("up", cf, 0, r1);
        }
      } else {
        if (rf < r2 && rf == r1) {
          r2 = getNextIndex("up", cf, r1, r2);
        } else {
          r1 = getNextIndex("up", cf, 0, r1);
        }
      }
    } else if (postion == "right") {
      if (c2 == Store.flowdata[0].length - 1) {
        return;
      }
      if (colHasMerge(cf, r1, r2)) {
        //focus所在行有合并单元格
        let cfMerge = getColMerge(cf, r1, r2);
        let cf_str = cfMerge[0],
          cf_end = cfMerge[1];
        if (cf_str > c1 && cf_end == c2) {
          c1 = getNextIndex("right", rf, c1, c2);
        } else {
          c2 = getNextIndex("right", rf, c2, Store.flowdata[0].length - 1);
        }
      } else {
        if (cf > c1 && cf == c2) {
          c1 = getNextIndex("right", rf, c1, c2);
        } else {
          c2 = getNextIndex("right", rf, c2, Store.flowdata[0].length - 1);
        }
      }
    } else if (postion == "left") {
      if (c1 == 0) {
        return;
      }
      if (colHasMerge(cf, r1, r2)) {
        //focus所在行有合并单元格
        let cfMerge = getColMerge(cf, r1, r2);
        let cf_str = cfMerge[0],
          cf_end = cfMerge[1];
        if (cf_end < c2 && cf_str == c1) {
          c2 = getNextIndex("left", rf, c1, c2);
        } else {
          c1 = getNextIndex("left", rf, 0, c1);
        }
      } else {
        if (cf < c2 && cf == c1) {
          c2 = getNextIndex("left", rf, c1, c2);
        } else {
          c1 = getNextIndex("left", rf, 0, c1);
        }
      }
    }
    let rowseleted = [r1, r2];
    let columnseleted = [c1, c2];
    row = Store.visibledatarow[r2];
    row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
    col = Store.visibledatacolumn[c2];
    col_pre = c1 - 1 == -1 ? 0 : Store.visibledatacolumn[c1 - 1];
    let top = row_pre,
      height = row - row_pre - 1;
    let left = col_pre,
      width = col - col_pre - 1;
    let changeparam = menuButton.mergeMoveMain(columnseleted, rowseleted, last, top, height, left, width);
    if (changeparam != null) {
      columnseleted = changeparam[0];
      rowseleted = changeparam[1];
      top = changeparam[2];
      height = changeparam[3];
      left = changeparam[4];
      width = changeparam[5];
    }
    formula.func_selectedrange = {
      "left": left,
      "width": width,
      "top": top,
      "height": height,
      "left_move": left,
      "width_move": width,
      "top_move": top,
      "height_move": height,
      "row": rowseleted,
      "column": columnseleted,
      "row_focus": rf,
      "column_focus": cf
    };
    $("#luckysheet-formula-functionrange-select").css({
      "left": left,
      "width": width,
      "top": top,
      "height": height
    }).show();
    formula.rangeSetValue({
      "row": rowseleted,
      "column": columnseleted
    });
  }
  let scrollLeft = $("#luckysheet-cell-main").scrollLeft();
  let scrollTop = $("#luckysheet-cell-main").scrollTop();
  let winH = $("#luckysheet-cell-main").height(),
    winW = $("#luckysheet-cell-main").width();
  let sleft = 0,
    stop = 0;
  if (col - scrollLeft - winW + 20 > 0) {
    sleft = col - winW + 20;
    if (isScroll) {
      $("#luckysheet-scrollbar-x").scrollLeft(sleft);
    }
  } else if (col_pre - scrollLeft - 20 < 0) {
    sleft = col_pre - 20;
    if (isScroll) {
      $("#luckysheet-scrollbar-x").scrollLeft(sleft);
    }
  }
  if (row - scrollTop - winH + 20 > 0) {
    stop = row - winH + 20;
    if (isScroll) {
      $("#luckysheet-scrollbar-y").scrollTop(stop);
    }
  } else if (row_pre - scrollTop - 20 < 0) {
    stop = row_pre - 20;
    if (isScroll) {
      $("#luckysheet-scrollbar-y").scrollTop(stop);
    }
  }
  clearTimeout(Store.countfuncTimeout);
  countfunc();
}

//shift + 方向键 / ctrl + shift + 方向键 功能
export { luckysheetMoveHighlightRange, luckysheetMoveHighlightRange2 };