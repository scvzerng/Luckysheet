import sheetmanage from "../sheetmanage";
import {  isRealNull } from "../../global/validate";
import {  getObjType } from "../../utils/util";
import Store from "../../store";
const mergeCalcModule = {
  moveMergeData: function (d, offset_r, offset_c) {
    if (isRealNull(d)) {
      return d;
    }
    let deleMC = [],
      insertMC = [],
      hasMC = false;
    for (let r = 0; r < d.length; r++) {
      for (let c = 0; c < d[0].length; c++) {
        let cell = d[r][c];
        if (getObjType(cell) == "object" && "mc" in cell) {
          if (cell.mc.rs != null) {
            deleMC.push({
              rs: cell.mc.rs,
              cs: cell.mc.cs,
              r: cell.mc.r,
              c: cell.mc.c
            });
            insertMC.push({
              rs: cell.mc.rs,
              cs: cell.mc.cs,
              r: cell.mc.r + offset_r,
              c: cell.mc.c + offset_c
            });
            hasMC = true;
          }
          d[r][c].mc.r += offset_r;
          d[r][c].mc.c += offset_c;
        }
      }
    }
    return {
      deleMC: deleMC,
      insertMC: insertMC,
      hasMC: hasMC
    };
  },
  getRangeInMerge: function (st_r, rlen, st_c, clen, sheetIndex) {
    let _this = this;
    let mergelist = [];
    let cfg = null;
    if (sheetIndex != null) {
      cfg = $.extend(true, {}, _this.getSheetConfig());
    } else {
      cfg = $.extend(true, {}, Store.config);
    }
    if (cfg != null && cfg["merge"] != null) {
      for (let key in cfg["merge"]) {
        let mc = cfg["merge"][key];
        if (!(st_r + rlen - 1 < mc.r || st_r > mc.r + mc.rs - 1) && !(st_c + clen - 1 < mc.c || st_c > mc.c + mc.cs - 1)) {
          mergelist.push(mc);
        }
      }
    }
    return mergelist;
  },
  mergeborer: function (d, row_index, col_index) {
    if (d == null || d[row_index] == null) {
      console.warn("Merge info is null", row_index, col_index);
      return null;
    }
    let value = d[row_index][col_index];
    if (getObjType(value) == "object" && "mc" in value) {
      let margeMaindata = value["mc"];
      if (margeMaindata == null) {
        console.warn("Merge info is null", row_index, col_index);
        return null;
      }
      col_index = margeMaindata.c;
      row_index = margeMaindata.r;
      if (d[row_index][col_index] == null) {
        console.warn("Main merge Cell info is null", row_index, col_index);
        return null;
      }
      let col_rs = d[row_index][col_index].mc.cs;
      let row_rs = d[row_index][col_index].mc.rs;
      let margeMain = d[row_index][col_index].mc;
      let start_r, end_r, row, row_pre;
      for (let r = row_index; r < margeMain.rs + row_index; r++) {
        if (r == 0) {
          start_r = -1;
        } else {
          start_r = Store.visibledatarow[r - 1] - 1;
        }
        end_r = Store.visibledatarow[r];
        if (row_pre == null) {
          row_pre = start_r;
          row = end_r;
        } else {
          row += end_r - start_r - 1;
        }
      }
      let start_c, end_c, col, col_pre;
      for (let c = col_index; c < margeMain.cs + col_index; c++) {
        if (c == 0) {
          start_c = 0;
        } else {
          start_c = Store.visibledatacolumn[c - 1];
        }
        end_c = Store.visibledatacolumn[c];
        if (col_pre == null) {
          col_pre = start_c;
          col = end_c;
        } else {
          col += end_c - start_c;
        }
      }
      return {
        row: [row_pre, row, row_index, row_index + row_rs - 1],
        column: [col_pre, col, col_index, col_index + col_rs - 1]
      };
    } else {
      return null;
    }
  },
  mergeMoveData: {},
  mergeMoveMain: function (columnseleted, rowseleted, s, top, height, left, width) {
    let _this = this;
    let mergesetting = sheetmanage.getSheetMerge();
    if (mergesetting == null) {
      return;
    }
    let mcset = [];
    for (let key in mergesetting) {
      mcset.push(key);
    }
    if (rowseleted[0] > rowseleted[1]) {
      rowseleted[1] = rowseleted[0];
    }
    if (columnseleted[0] > columnseleted[1]) {
      columnseleted[1] = columnseleted[0];
    }
    let offloop = true;
    _this.mergeMoveData = {};
    while (offloop) {
      offloop = false;
      for (let i = 0; i < mcset.length; i++) {
        let key = mcset[i];
        let mc = mergesetting[key];
        if (key in _this.mergeMoveData) {
          continue;
        }
        let changeparam = _this.mergeMove(mc, columnseleted, rowseleted, s, top, height, left, width);
        if (changeparam != null) {
          _this.mergeMoveData[key] = mc;
          columnseleted = changeparam[0];
          rowseleted = changeparam[1];
          top = changeparam[2];
          height = changeparam[3];
          left = changeparam[4];
          width = changeparam[5];
          offloop = true;
        } else {
          delete _this.mergeMoveData[key];
        }
      }
    }
    return [columnseleted, rowseleted, top, height, left, width];
  },
  mergeMove: function (mc, columnseleted, rowseleted, s, top, height, left, width) {
    let _this = this;
    let row_st = mc.r,
      row_ed = mc.r + mc.rs - 1;
    let col_st = mc.c,
      col_ed = mc.c + mc.cs - 1;
    let ismatch = false;
    if (columnseleted[1] < columnseleted[0]) {
      columnseleted[0] = columnseleted[1];
    }
    if (rowseleted[1] < rowseleted[0]) {
      rowseleted[0] = rowseleted[1];
    }
    if (columnseleted[0] <= col_st && columnseleted[1] >= col_ed && rowseleted[0] <= row_st && rowseleted[1] >= row_ed || !(columnseleted[1] < col_st || columnseleted[0] > col_ed) && !(rowseleted[1] < row_st || rowseleted[0] > row_ed)) {
      let margeset = _this.mergeborer(Store.flowdata, mc.r, mc.c);
      if (!!margeset) {
        let row = margeset.row[1],
          row_pre = margeset.row[0],
          row_index = margeset.row[2],
          col = margeset.column[1],
          col_pre = margeset.column[0],
          col_index = margeset.column[2];
        if (!(columnseleted[1] < col_st || columnseleted[0] > col_ed)) {
          //向上滑动
          if (rowseleted[0] <= row_ed && rowseleted[0] >= row_st) {
            height += top - row_pre;
            top = row_pre;
            rowseleted[0] = row_st;
          }

          //向下滑动或者居中时往上滑动的向下补齐
          if (rowseleted[1] >= row_st && rowseleted[1] <= row_ed) {
            if (s.row_focus >= row_st && s.row_focus <= row_ed) {
              height = row - top;
            } else {
              height = row - top;
            }
            rowseleted[1] = row_ed;
          }
        }
        if (!(rowseleted[1] < row_st || rowseleted[0] > row_ed)) {
          if (columnseleted[0] <= col_ed && columnseleted[0] >= col_st) {
            width += left - col_pre;
            left = col_pre;
            columnseleted[0] = col_st;
          }

          //向右滑动或者居中时往左滑动的向下补齐
          if (columnseleted[1] >= col_st && columnseleted[1] <= col_ed) {
            if (s.column_focus >= col_st && s.column_focus <= col_ed) {
              width = col - left;
            } else {
              width = col - left;
            }
            columnseleted[1] = col_ed;
          }
        }
        ismatch = true;
      }
    }
    if (ismatch) {
      return [columnseleted, rowseleted, top, height, left, width];
    } else {
      return null;
    }
  }
};
export default mergeCalcModule;