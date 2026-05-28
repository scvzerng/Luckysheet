import { getObjType } from "../../utils/util";
import formula from "../../global/formula";
import { isRealNull } from "../../global/validate";
import { countfunc } from "../../global/count";
import menuButton from "../menuButton";
import { selectHightlightShow } from "../select";
import Store from "../../store";
import { getLastSelection } from "../../utils/storeAccess.js";
import { luckysheetMoveHighlightRange } from "./rangeMove";
import { getNextIndex } from "./dataBoundary";
import { getScrollPosition } from "../../utils/domUtils.js";
import scrollBarX from "../../ui/scrollBarX.js";
import scrollBarY from "../../ui/scrollBarY.js";
import formulaRangeSelect from '../../ui/formulaRangeSelect.js';
import cellMain from '../../ui/cellMain.js';
function luckysheetMoveEndCell(postion, type, isScroll, terminal, onlyvalue) {
  if (isScroll == null) {
    isScroll = true;
  }
  if (!postion) {
    postion = "down";
  }
  if (!type) {
    type = "cell";
  }
  if (onlyvalue == null) {
    onlyvalue = false;
  }
  let last = getLastSelection();
  let curR = last["row"] == null ? 0 : last["row"][0];
  let curC = last["column"] == null ? 0 : last["column"][0];
  let startR = last["row"] == null ? 0 : last["row"][0];
  let startC = last["column"] == null ? 0 : last["column"][0];
  let endR = last["row"] == null ? 0 : last["row"][1];
  let endC = last["column"] == null ? 0 : last["column"][1];
  formula.fucntionboxshow(curR, curC);
  if (type == "range") {
    // need var
    var p_startR = Store.luckysheet_shiftpositon["row"][0];
    var p_startC = Store.luckysheet_shiftpositon["column"][0];
    let p_endR = Store.luckysheet_shiftpositon["row"][1];
    let p_endC = Store.luckysheet_shiftpositon["column"][1];
    if (postion == "down" || postion == "up") {
      if (p_endR < endR) {
        curR = last["row"] == null ? 0 : last["row"][1];
      } else if (p_startR > startR) {
        curR = last["row"] == null ? 0 : last["row"][0];
      } else if (p_endR == endR && p_startR == startR) {
        if (postion == "down") {
          curR = last["row"] == null ? 0 : last["row"][1];
        } else {
          curR = last["row"] == null ? 0 : last["row"][0];
        }
      }
    } else if (postion == "right" || postion == "left") {
      if (p_endC < endC) {
        curC = last["column"] == null ? 0 : last["column"][1];
      } else if (p_startC > startC) {
        curC = last["column"] == null ? 0 : last["column"][0];
      } else if (p_endC == endC && p_startC == startC) {
        if (postion == "right") {
          curC = last["column"] == null ? 0 : last["column"][1];
        } else {
          curC = last["column"] == null ? 0 : last["column"][0];
        }
      }
    }
  }
  let datarowlen = Store.flowdata.length,
    datacolumnlen = Store.flowdata[0].length;
  let data = Store.flowdata,
    moveP = "",
    moveV = 0;
  if (postion == "up") {
    if (curR == 0) {
      return;
    } else {
      let stvalue = [],
        p = null,
        i = 0,
        p_pre = null;
      for (let c = startC; c <= endC; c++) {
        stvalue = [];
        i = 0;
        for (let r = curR - 1; r >= 0; r--) {
          let cell = data[r][c];
          if (getObjType(cell) == "object" && isRealNull(cell.v)) {
            stvalue.push(false);
          } else if (isRealNull(cell)) {
            stvalue.push(false);
          } else {
            stvalue.push(true);
          }
          if (stvalue.length > 1) {
            if (stvalue[i] == true && stvalue[i - 1] == false) {
              p = r;
              break;
            } else if (stvalue[i] == false && stvalue[i - 1] == true) {
              p = r + 1;
              break;
            }
          }
          i++;
        }
        if (p == null) {
          p = 0;
        }
        if (p_pre == null || p < p_pre) {
          p_pre = p;
        }
      }
      moveP = "down";
      moveV = p_pre - curR;
    }
  } else if (postion == "down") {
    if (curR == datarowlen - 1) {
      return;
    } else {
      let stvalue = [],
        p = null,
        i = 0,
        p_pre = null;
      for (let c = startC; c <= endC; c++) {
        stvalue = [];
        i = 0;
        for (let r = curR + 1; r < data.length; r++) {
          let cell = data[r][c];
          if (getObjType(cell) == "object" && isRealNull(cell.v)) {
            stvalue.push(false);
          } else if (isRealNull(cell)) {
            stvalue.push(false);
          } else {
            stvalue.push(true);
          }
          if (stvalue.length > 1) {
            if (stvalue[i] == true && stvalue[i - 1] == false) {
              p = r;
              break;
            } else if (stvalue[i] == false && stvalue[i - 1] == true) {
              p = r - 1;
              break;
            }
          }
          i++;
        }
        if (p == null) {
          p = data.length - 1;
        }
        if (p_pre == null || p > p_pre) {
          p_pre = p;
        }
      }
      moveP = "down";
      moveV = p_pre - curR;
    }
  } else if (postion == "left") {
    if (curC == 0) {
      return;
    } else {
      let stvalue = [],
        p = null,
        i = 0,
        p_pre = null;
      for (let r = startR; r <= endR; r++) {
        stvalue = [];
        i = 0;
        for (let c = curC - 1; c >= 0; c--) {
          let cell = data[r][c];
          if (getObjType(cell) == "object" && isRealNull(cell.v)) {
            stvalue.push(false);
          } else if (isRealNull(cell)) {
            stvalue.push(false);
          } else {
            stvalue.push(true);
          }
          if (stvalue.length > 1) {
            if (stvalue[i] == true && stvalue[i - 1] == false) {
              p = c;
              break;
            } else if (stvalue[i] == false && stvalue[i - 1] == true) {
              p = c + 1;
              break;
            }
          }
          i++;
        }
        if (p == null) {
          p = 0;
        }
        if (p_pre == null || p < p_pre) {
          p_pre = p;
        }
      }
      moveP = "right";
      moveV = p_pre - curC;
    }
  } else if (postion == "right") {
    if (curC == datacolumnlen - 1) {
      return;
    } else {
      let stvalue = [],
        p = null,
        i = 0,
        p_pre = null;
      for (let r = startR; r <= endR; r++) {
        stvalue = [];
        i = 0;
        for (let c = curC + 1; c < data[0].length; c++) {
          let cell = data[r][c];
          if (getObjType(cell) == "object" && isRealNull(cell.v)) {
            stvalue.push(false);
          } else if (isRealNull(cell)) {
            stvalue.push(false);
          } else {
            stvalue.push(true);
          }
          if (stvalue.length > 1) {
            if (stvalue[i] == true && stvalue[i - 1] == false) {
              p = c;
              break;
            } else if (stvalue[i] == false && stvalue[i - 1] == true) {
              p = c - 1;
              break;
            }
          }
          i++;
        }
        if (p == null) {
          p = data[0].length - 1;
        }
        if (p_pre == null || p > p_pre) {
          p_pre = p;
        }
      }
      moveP = "right";
      moveV = p_pre - curC;
    }
  }
  if (type == "range") {
    if (postion == "up") {
      if (p_endR < endR) {
        if (moveV + curR < p_endR) {
          moveV = p_endR - curR;
        }
      }
    } else if (postion == "down") {
      if (p_startR > startR) {
        if (moveV + curR > p_startR) {
          moveV = p_startR - curR;
        }
      }
    } else if (postion == "left") {
      if (p_endC < endC) {
        if (moveV + curC < p_endC) {
          moveV = p_endC - curC;
        }
      }
    } else if (postion == "right") {
      if (p_startC > startC) {
        if (moveV + curC > p_startC) {
          moveV = p_startC - curC;
        }
      }
    }
    if (terminal != null && Math.abs(moveV) > Math.abs(terminal)) {
      moveV = terminal;
    }
  }
  if (!onlyvalue) {
    if (type == "cell") {
      luckysheetMoveHighlightCell(moveP, moveV, "rangeOfSelect", isScroll);
    } else if (type == "range") {
      luckysheetMoveHighlightRange(moveP, moveV, "rangeOfSelect", isScroll);
    }
  } else {
    return moveV;
  }
}

//方向键  调整单元格
function luckysheetMoveHighlightCell(postion, index, type, isScroll) {
  if (isScroll == null) {
    isScroll = true;
  }
  if (!postion) {
    postion == "down";
  }
  let datarowlen = Store.flowdata.length,
    datacolumnlen = Store.flowdata[0].length;
  let row, row_pre, row_index, row_index_ed;
  let col, col_pre, col_index, col_index_ed;
  if (type == "rangeOfSelect") {
    let last = getLastSelection();
    let curR;
    if (last["row_focus"] == null) {
      curR = last["row"][0];
    } else {
      curR = last["row_focus"];
    }
    let curC;
    if (last["column_focus"] == null) {
      curC = last["column"][0];
    } else {
      curC = last["column_focus"];
    }

    //focus单元格 是否是合并单元格
    let margeset = menuButton.mergeborer(Store.flowdata, curR, curC);
    if (margeset) {
      let str_r = margeset.row[2];
      let end_r = margeset.row[3];
      let str_c = margeset.column[2];
      let end_c = margeset.column[3];
      if (index > 0) {
        if (postion == "down") {
          curR = end_r;
          curC = str_c;
        } else if (postion == "right") {
          curR = str_r;
          curC = end_c;
        }
      } else {
        curR = str_r;
        curC = str_c;
      }
    }
    let moveX = last["moveXY"] == null ? curR : last["moveXY"].x;
    let moveY = last["moveXY"] == null ? curC : last["moveXY"].y;
    if (postion == "down") {
      curR += index;
      moveX = curR;
    } else if (postion == "right") {
      curC += index;
      moveY = curC;
    }
    if (curR >= datarowlen) {
      curR = datarowlen - 1;
      moveX = curR;
    }
    if (curR < 0) {
      curR = 0;
      moveX = curR;
    }
    if (curC >= datacolumnlen) {
      curC = datacolumnlen - 1;
      moveY = curC;
    }
    if (curC < 0) {
      curC = 0;
      moveY = curC;
    }

    //移动的下一个单元格是否是合并的单元格
    let margeset2 = menuButton.mergeborer(Store.flowdata, curR, curC);
    if (margeset2) {
      row = margeset2.row[1];
      row_pre = margeset2.row[0];
      row_index = margeset2.row[2];
      row_index_ed = margeset2.row[3];
      col = margeset2.column[1];
      col_pre = margeset2.column[0];
      col_index = margeset2.column[2];
      col_index_ed = margeset2.column[3];
    } else {
      row = Store.visibledatarow[moveX];
      row_pre = moveX - 1 == -1 ? 0 : Store.visibledatarow[moveX - 1];
      // row_index = moveX;
      // row_index_ed = moveX;

      col = Store.visibledatacolumn[moveY];
      col_pre = moveY - 1 == -1 ? 0 : Store.visibledatacolumn[moveY - 1];
      // col_index = moveY;
      // col_index_ed = moveY;

      row_index = row_index_ed = curR;
      col_index = col_index_ed = curC;
    }
    last["row"] = [row_index, row_index_ed];
    last["column"] = [col_index, col_index_ed];
    last["row_focus"] = row_index;
    last["column_focus"] = col_index;
    last["moveXY"] = {
      "x": moveX,
      "y": moveY
    };
    selectHightlightShow();
    formula.fucntionboxshow(row_index, col_index);
  } else if (type == "rangeOfFormula") {
    let last = formula.func_selectedrange;
    let curR;
    if (last["row_focus"] == null) {
      curR = last["row"][0];
    } else {
      curR = last["row_focus"];
    }
    let curC;
    if (last["column_focus"] == null) {
      curC = last["column"][0];
    } else {
      curC = last["column_focus"];
    }

    //focus单元格 是否是合并单元格
    let margeset = menuButton.mergeborer(Store.flowdata, curR, curC);
    if (margeset) {
      let str_r = margeset.row[2];
      let end_r = margeset.row[3];
      let str_c = margeset.column[2];
      let end_c = margeset.column[3];
      if (index > 0) {
        if (postion == "down") {
          curR = end_r;
          curC = str_c;
        } else if (postion == "right") {
          curR = str_r;
          curC = end_c;
        }
      } else {
        curR = str_r;
        curC = str_c;
      }
    }
    let moveX = last["moveXY"] == null ? curR : last["moveXY"].x;
    let moveY = last["moveXY"] == null ? curC : last["moveXY"].y;
    if (postion == "down") {
      curR += index;
      moveX = curR;
    } else if (postion == "right") {
      curC += index;
      moveY = curC;
    }
    if (curR >= datarowlen) {
      curR = datarowlen - 1;
      moveX = curR;
    }
    if (curR < 0) {
      curR = 0;
      moveX = curR;
    }
    if (curC >= datacolumnlen) {
      curC = datacolumnlen - 1;
      moveY = curC;
    }
    if (curC < 0) {
      curC = 0;
      moveY = curC;
    }

    //移动的下一个单元格是否是合并的单元格
    let margeset2 = menuButton.mergeborer(Store.flowdata, curR, curC);
    if (margeset2) {
      row = margeset2.row[1];
      row_pre = margeset2.row[0];
      row_index = margeset2.row[2];
      row_index_ed = margeset2.row[3];
      col = margeset2.column[1];
      col_pre = margeset2.column[0];
      col_index = margeset2.column[2];
      col_index_ed = margeset2.column[3];
    } else {
      row = Store.visibledatarow[moveX];
      row_pre = moveX - 1 == -1 ? 0 : Store.visibledatarow[moveX - 1];
      row_index = moveX;
      row_index_ed = moveX;
      col = Store.visibledatacolumn[moveY];
      col_pre = moveY - 1 == -1 ? 0 : Store.visibledatacolumn[moveY - 1];
      col_index = moveY;
      col_index_ed = moveY;
    }
    formula.func_selectedrange = {
      "left": col_pre,
      "width": col - col_pre - 1,
      "top": row_pre,
      "height": row - row_pre - 1,
      "left_move": col_pre,
      "width_move": col - col_pre - 1,
      "top_move": row_pre,
      "height_move": row - row_pre - 1,
      "row": [row_index, row_index_ed],
      "column": [col_index, col_index_ed],
      "row_focus": row_index,
      "column_focus": col_index,
      "moveXY": {
        "x": moveX,
        "y": moveY
      }
    };
    formulaRangeSelect.showAt({
      "left": col_pre,
      "width": col - col_pre - 1,
      "top": row_pre,
      "height": row - row_pre - 1
    });
    formula.rangeSetValue({
      "row": [row_index, row_index_ed],
      "column": [col_index, col_index_ed]
    });
  }
  let scroll = getScrollPosition();
  let scrollLeft = scroll.scrollLeft;
  let scrollTop = scroll.scrollTop;
  let winH = cellMain.getHeight(),
    winW = cellMain.getWidth();
  let sleft = 0,
    stop = 0;
  if (col - scrollLeft - winW + 20 > 0) {
    sleft = col - winW + 20;
    if (isScroll) {
      scrollBarX.setScrollLeft(sleft);
    }
  } else if (col_pre - scrollLeft - 20 < 0) {
    sleft = col_pre - 20;
    if (isScroll) {
      scrollBarX.setScrollLeft(sleft);
    }
  }
  if (row - scrollTop - winH + 20 > 0) {
    stop = row - winH + 20;
    if (isScroll) {
      scrollBarY.setScrollTop(stop);
    }
  } else if (row_pre - scrollTop - 20 < 0) {
    stop = row_pre - 20;
    if (isScroll) {
      scrollBarY.setScrollTop(stop);
    }
  }
  clearTimeout(Store.countfuncTimeout);
  countfunc();

  // 移动单元格通知后台
}

//ctrl + 方向键  调整单元格
function luckysheetMoveHighlightCell2(postion, type, isScroll) {
  if (!isScroll) {
    isScroll = true;
  }
  let row, row_pre;
  let col, col_pre;
  if (type == "rangeOfSelect") {
    let last = getLastSelection();
    let rf = last["row_focus"],
      cf = last["column_focus"];
    let focusIsMerge = false,
      mc = {};
    if (Store.config["merge"] != null && rf + "_" + cf in Store.config["merge"]) {
      focusIsMerge = true;
      mc = Store.config["merge"][rf + "_" + cf];
    }
    if (postion == "down") {
      if (rf == Store.flowdata.length - 1) {
        return;
      }
      if (focusIsMerge) {
        rf = getNextIndex("down", cf, mc.r + mc.rs - 1, Store.flowdata.length - 1);
      } else {
        rf = getNextIndex("down", cf, rf, Store.flowdata.length - 1);
      }
    } else if (postion == "up") {
      if (rf == 0) {
        return;
      }
      if (focusIsMerge) {
        rf = getNextIndex("up", cf, 0, mc.r);
      } else {
        rf = getNextIndex("up", cf, 0, rf);
      }
    } else if (postion == "right") {
      if (cf == Store.flowdata[0].length - 1) {
        return;
      }
      if (focusIsMerge) {
        cf = getNextIndex("right", rf, mc.c + mc.cs - 1, Store.flowdata[0].length - 1);
      } else {
        cf = getNextIndex("right", rf, cf, Store.flowdata[0].length - 1);
      }
    } else if (postion == "left") {
      if (cf == 0) {
        return;
      }
      if (focusIsMerge) {
        cf = getNextIndex("left", rf, 0, mc.c);
      } else {
        cf = getNextIndex("left", rf, 0, cf);
      }
    }
    let rowseleted = [rf, rf];
    let columnseleted = [cf, cf];
    row = Store.visibledatarow[rf];
    row_pre = rf - 1 == -1 ? 0 : Store.visibledatarow[rf - 1];
    col = Store.visibledatacolumn[cf];
    col_pre = cf - 1 == -1 ? 0 : Store.visibledatacolumn[cf - 1];
    let changeparam = menuButton.mergeMoveMain(columnseleted, rowseleted, last, row_pre, row - row_pre - 1, col_pre, col - col_pre - 1);
    if (changeparam != null) {
      columnseleted = changeparam[0];
      rowseleted = changeparam[1];
      // top = changeparam[2];
      // height = changeparam[3];
      // left = changeparam[4];
      // width = changeparam[5];
    }
    Store.luckysheet_select_save = [{
      "row": rowseleted,
      "column": columnseleted
    }];
    selectHightlightShow();
    formula.fucntionboxshow(rf, cf);
  } else if (type == "rangeOfFormula") {
    let last = formula.func_selectedrange;
    let rf = last["row_focus"],
      cf = last["column_focus"];
    let focusIsMerge = false,
      mc = {};
    if (Store.config["merge"] != null && rf + "_" + cf in Store.config["merge"]) {
      focusIsMerge = true;
      mc = Store.config["merge"][rf + "_" + cf];
    }
    if (postion == "down") {
      if (rf == Store.flowdata.length - 1) {
        return;
      }
      if (focusIsMerge) {
        rf = getNextIndex("down", cf, mc.r + mc.rs - 1, Store.flowdata.length - 1);
      } else {
        rf = getNextIndex("down", cf, rf, Store.flowdata.length - 1);
      }
    } else if (postion == "up") {
      if (rf == 0) {
        return;
      }
      if (focusIsMerge) {
        rf = getNextIndex("up", cf, 0, mc.r);
      } else {
        rf = getNextIndex("up", cf, 0, rf);
      }
    } else if (postion == "right") {
      if (cf == Store.flowdata[0].length - 1) {
        return;
      }
      if (focusIsMerge) {
        cf = getNextIndex("right", rf, mc.c + mc.cs - 1, Store.flowdata[0].length - 1);
      } else {
        cf = getNextIndex("right", rf, cf, Store.flowdata[0].length - 1);
      }
    } else if (postion == "left") {
      if (cf == 0) {
        return;
      }
      if (focusIsMerge) {
        cf = getNextIndex("left", rf, 0, mc.c);
      } else {
        cf = getNextIndex("left", rf, 0, cf);
      }
    }
    let rowseleted = [rf, rf];
    let columnseleted = [cf, cf];
    row = Store.visibledatarow[rf];
    row_pre = rf - 1 == -1 ? 0 : Store.visibledatarow[rf - 1];
    col = Store.visibledatacolumn[cf];
    col_pre = cf - 1 == -1 ? 0 : Store.visibledatacolumn[cf - 1];
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
    formulaRangeSelect.showAt({
      "left": left,
      "width": width,
      "top": top,
      "height": height
    });
    formula.rangeSetValue({
      "row": rowseleted,
      "column": columnseleted
    });
  }
  let scroll = getScrollPosition();
  let scrollLeft = scroll.scrollLeft;
  let scrollTop = scroll.scrollTop;
  let winH = cellMain.getHeight(),
    winW = cellMain.getWidth();
  let sleft = 0,
    stop = 0;
  if (col - scrollLeft - winW + 20 > 0) {
    sleft = col - winW + 20;
    if (isScroll) {
      scrollBarX.setScrollLeft(sleft);
    }
  } else if (col_pre - scrollLeft - 20 < 0) {
    sleft = col_pre - 20;
    if (isScroll) {
      scrollBarX.setScrollLeft(sleft);
    }
  }
  if (row - scrollTop - winH + 20 > 0) {
    stop = row - winH + 20;
    if (isScroll) {
      scrollBarY.setScrollTop(stop);
    }
  } else if (row_pre - scrollTop - 20 < 0) {
    stop = row_pre - 20;
    if (isScroll) {
      scrollBarY.setScrollTop(stop);
    }
  }
  clearTimeout(Store.countfuncTimeout);
  countfunc();
}

//shift + 方向键  调整选区
export { luckysheetMoveEndCell, luckysheetMoveHighlightCell, luckysheetMoveHighlightCell2 };