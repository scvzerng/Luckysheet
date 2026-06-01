import { getSheetIndex } from "../../methods/get";
import { luckysheet_searcharray } from "../sheetSearch";
import Store from "../../store";
import { getCurrentFile, getLastSelection, getFocusCell } from "../../utils/storeAccess.js";
import freezeCoreModule from "./freezeCore";
const freezeConfigModule = {
  /**
   * 
   * @param {string} operate  "freezenRow"/ "freezenColumn"......
   * @param {Number | String} order 工作表索引；默认值为当前工作表索引
   * @param {Object} focus 冻结选区时的focus单元格行列值构成的对象；格式为{ row_focus:0, column_focus:0 }
   */
  saveFrozen: function (operate, order, focus = {}) {
    if (order == null) {
      order = getSheetIndex(Store.currentSheetIndex);
    }

    // New configuration attribute of sheet: frozen, which stores more semantic configuration for initialization and transmission to the backend. freezenhorizontaldata is still used as local data

    const select_save = getLastSelection();
    const _focus = getFocusCell();
    const row_focus = _focus.row == null ? select_save["row"][0] : _focus.row;
    const column_focus = _focus.col == null ? select_save["column"][0] : _focus.col;
    const range = {
      row_focus: focus.row_focus || row_focus,
      column_focus: focus.column_focus || column_focus
    };
    const frozen = {
      "freezenRow": {
        type: 'row'
      },
      "freezenColumn": {
        type: 'column'
      },
      "freezenRC": {
        type: 'both'
      },
      "freezenRowRange": {
        type: 'rangeRow',
        range: range
      },
      "freezenColumnRange": {
        type: 'rangeColumn',
        range: range
      },
      "freezenRCRange": {
        type: 'rangeBoth',
        range: range
      },
      "freezenCancel": {
        type: 'cancel'
      }
    };

    // store frozen
    Store.luckysheetfile[order]["frozen"] = frozen[operate];
  },
  frozenTofreezen: function () {
    // get frozen type
    let file = getCurrentFile();
    const frozen = file["frozen"];
    if (frozen == null) {
      return;
    }
    let freezen = null;

    // transform to freezen
    if (frozen.type === 'row') {
      let scrollTop = 0;
      let row_st = luckysheet_searcharray(Store.visibleRowPositions, scrollTop);
      if (row_st == -1) {
        row_st = 0;
      }
      let top = Store.visibleRowPositions[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
      let freezenhorizontaldata = [Store.visibleRowPositions[row_st], row_st + 1, scrollTop, freezeCoreModule.cutVolumn(Store.visibleRowPositions, row_st + 1), top];
      freezen = {
        horizontal: {
          freezenhorizontaldata: freezenhorizontaldata,
          top: top
        }
      };
    } else if (frozen.type === 'column') {
      let scrollLeft = 0;
      let col_st = luckysheet_searcharray(Store.visibleColPositions, scrollLeft);
      if (col_st == -1) {
        col_st = 0;
      }
      let left = Store.visibleColPositions[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
      let freezenverticaldata = [Store.visibleColPositions[col_st], col_st + 1, scrollLeft, freezeCoreModule.cutVolumn(Store.visibleColPositions, col_st + 1), left];
      freezen = {
        vertical: {
          freezenverticaldata: freezenverticaldata,
          left: left
        }
      };
    } else if (frozen.type === 'both') {
      let scrollTop = 0;
      let row_st = luckysheet_searcharray(Store.visibleRowPositions, scrollTop);
      if (row_st == -1) {
        row_st = 0;
      }
      let top = Store.visibleRowPositions[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
      let freezenhorizontaldata = [Store.visibleRowPositions[row_st], row_st + 1, scrollTop, freezeCoreModule.cutVolumn(Store.visibleRowPositions, row_st + 1), top];
      let scrollLeft = 0;
      let col_st = luckysheet_searcharray(Store.visibleColPositions, scrollLeft);
      if (col_st == -1) {
        col_st = 0;
      }
      let left = Store.visibleColPositions[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
      let freezenverticaldata = [Store.visibleColPositions[col_st], col_st + 1, scrollLeft, freezeCoreModule.cutVolumn(Store.visibleColPositions, col_st + 1), left];
      freezen = {
        horizontal: {
          freezenhorizontaldata: freezenhorizontaldata,
          top: top
        },
        vertical: {
          freezenverticaldata: freezenverticaldata,
          left: left
        }
      };
    } else if (frozen.type === 'rangeRow') {
      let scrollTop = 0;
      let row_st = luckysheet_searcharray(Store.visibleRowPositions, scrollTop);
      let row_focus = frozen.range["row_focus"];
      if (row_focus > row_st) {
        row_st = row_focus;
      }
      if (row_st == -1) {
        row_st = 0;
      }
      let top = Store.visibleRowPositions[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
      let freezenhorizontaldata = [Store.visibleRowPositions[row_st], row_st + 1, scrollTop, freezeCoreModule.cutVolumn(Store.visibleRowPositions, row_st + 1), top];
      freezen = {
        horizontal: {
          freezenhorizontaldata: freezenhorizontaldata,
          top: top
        }
      };
    } else if (frozen.type === 'rangeColumn') {
      let scrollLeft = 0;
      let col_st = luckysheet_searcharray(Store.visibleColPositions, scrollLeft);
      let column_focus = frozen.range["column_focus"];
      if (column_focus > col_st) {
        col_st = column_focus;
      }
      if (col_st == -1) {
        col_st = 0;
      }
      let left = Store.visibleColPositions[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
      let freezenverticaldata = [Store.visibleColPositions[col_st], col_st + 1, scrollLeft, freezeCoreModule.cutVolumn(Store.visibleColPositions, col_st + 1), left];
      freezen = {
        vertical: {
          freezenverticaldata: freezenverticaldata,
          left: left
        }
      };
    } else if (frozen.type === 'rangeBoth') {
      let scrollTop = 0;
      let row_st = luckysheet_searcharray(Store.visibleRowPositions, scrollTop);
      let row_focus = frozen.range["row_focus"];
      if (row_focus > row_st) {
        row_st = row_focus;
      }
      if (row_st == -1) {
        row_st = 0;
      }
      let top = Store.visibleRowPositions[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
      let freezenhorizontaldata = [Store.visibleRowPositions[row_st], row_st + 1, scrollTop, freezeCoreModule.cutVolumn(Store.visibleRowPositions, row_st + 1), top];
      let scrollLeft = 0;
      let col_st = luckysheet_searcharray(Store.visibleColPositions, scrollLeft);
      let column_focus = frozen.range["column_focus"];
      if (column_focus > col_st) {
        col_st = column_focus;
      }
      if (col_st == -1) {
        col_st = 0;
      }
      let left = Store.visibleColPositions[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
      let freezenverticaldata = [Store.visibleColPositions[col_st], col_st + 1, scrollLeft, freezeCoreModule.cutVolumn(Store.visibleColPositions, col_st + 1), left];
      freezen = {
        horizontal: {
          freezenhorizontaldata: freezenhorizontaldata,
          top: top
        },
        vertical: {
          freezenverticaldata: freezenverticaldata,
          left: left
        }
      };
    } else if (frozen.type === 'cancel') {
      freezen = {
        horizontal: null,
        vertical: null
      };
    }
    file["freezen"] = freezen;
  }
};
export default freezeConfigModule;