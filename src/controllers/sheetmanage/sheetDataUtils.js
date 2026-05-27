import { isEditMode } from "../../global/validate";
import cleargridelement from "../../global/cleargridelement";
import { getdatabyselectionD, getcellvalue, datagridgrowth, getcellFormula } from "../../global/getdata";
import { setcellvalue } from "../../global/setdata";
import luckysheetcreatedom from "../../global/createdom";
import tooltip from "../../global/tooltip";
import formula from "../../global/formula";
import { luckysheetrefreshgrid, jfrefreshgrid_rhcw, jfrefreshgrid } from "../../global/refresh";
import rhchInit from "../../global/rhchInit";
import editor from "../../global/editor";
import { luckysheetextendtable, luckysheetdeletetable } from "../../global/extend";
import { isRealNum } from "../../global/validate";
import { replaceHtml, getObjType, chatatABC, arrayRemoveItem } from "../../utils/util";
import { sheetHTML, luckysheetlodingHTML } from "../constant";
import luckysheetConfigsetting from "../luckysheetConfigsetting";
import luckysheetsizeauto from "../resize";
import luckysheetPostil from "../postil";
import imageCtrl from "../imageCtrl";
import hyperlinkCtrl from "../hyperlinkCtrl";
import luckysheetFreezen from "../freezen";
import { createFilterOptions, labelFilterOptionState } from "../filter";
import { selectHightlightShow, selectionCopyShow } from "../select";
import Store from "../../store";
import locale from "../../locale/locale";
import { changeSheetContainerSize, menuToolBarWidth } from "../resize";
import { zoomNumberDomBind } from "../zoom";
import menuButton from "../menuButton";
import method from "../../global/method";
import luckysheetformula from "../../global/formula";
import localforage from 'localforage';
const sheetDataUtilsModule = {
  getGridData: function (d) {
    let ret = [];
    for (let r = 0; r < d.length; r++) {
      for (let c = 0; c < d[0].length; c++) {
        if (d[r][c] == null) {
          continue;
        }
        ret.push({
          r: r,
          c: c,
          v: d[r][c]
        });
      }
    }
    return ret;
  },
  buildGridData: function (file) {
    let row = file.row == null ? Store.defaultrowNum : file.row,
      column = file.column == null ? Store.defaultcolumnNum : file.column,
      data = file.data && file.data.length > 0 ? file.data : datagridgrowth([], row, column),
      celldata = file.celldata;
    if (file.data && file.data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[0].length; j++) {
          setcellvalue(i, j, data, data[i][j]);
        }
      }
    } else {
      if (celldata && celldata.length > 0) {
        for (let i = 0; i < celldata.length; i++) {
          let item = celldata[i];
          let r = item.r;
          let c = item.c;
          let v = item.v;
          if (r >= data.length) {
            data = datagridgrowth(data, r - data.length + 1, 0);
          }
          if (c >= data[0].length) {
            data = datagridgrowth(data, 0, c - data[0].length + 1);
          }
          setcellvalue(r, c, data, v);
        }
      }
    }

    if (file.calcChain == null) {
      file.calcChain = [];
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[0].length; j++) {
          let cell = data[i][j];
          if (cell != null && cell.f != null) {
            file.calcChain.push({
              r: i,
              c: j,
              index: file.index,
            });
          }
        }
      }
    }

    //亿万格式+精确度 恢复全局初始化
    luckysheetConfigsetting.autoFormatw = false;
    luckysheetConfigsetting.accuracy = undefined;
    return data;
  },
  cutGridData: function (d) {
    let rowindex = 0;
    for (let r = d.length - 1; r >= 0; r--) {
      let isnull = true;
      for (let c = 0; c < d[0].length; c++) {
        let value = getcellvalue(r, c);
        if (value != null && $.trim(value).length > 0) {
          isnull = false;
          break;
        }
      }
      if (!isnull) {
        break;
      } else {
        rowindex = r;
      }
    }
    return d.slice(0, rowindex);
  },
  addGridData: function (celldata, row, column) {
    let data = datagridgrowth([], row, column);
    if (celldata != null) {
      for (let i = 0; i < celldata.length; i++) {
        let item = celldata[i];
        let r = item.r;
        let c = item.c;
        let v = item.v;
        if (r >= data.length) {
          data = datagridgrowth(data, r - data.length + 1, 0);
        }
        if (c >= data[0].length) {
          data = datagridgrowth(data, 0, c - data[0].length + 1);
        }
        setcellvalue(r, c, data, v);
      }
    }
    return data;
  },
  getSheetData: function (sheetIndex) {
    if (sheetIndex == null) {
      sheetIndex = Store.currentSheetIndex;
    }
    return Store.luckysheetfile[this.getSheetIndex(sheetIndex)].data;
  },
  getSheetConfig: function (sheetIndex) {
    let _this = this;
    if (sheetIndex == null) {
      sheetIndex = Store.currentSheetIndex;
    }
    let config = Store.luckysheetfile[_this.getSheetIndex(sheetIndex)].config;
    if (config == null) {
      Store.luckysheetfile[_this.getSheetIndex(sheetIndex)].config = {};
    }
    return Store.luckysheetfile[_this.getSheetIndex(sheetIndex)].config;
  },
  getSheetMerge: function () {
    if (Store.config.merge == null) {
      return null;
    }
    return Store.config.merge;
  },
  getRangetxt: function (sheetIndex, range, currentIndex) {
    let sheettxt = "";
    if (currentIndex == null) {
      currentIndex = Store.currentSheetIndex;
    }
    if (sheetIndex != currentIndex) {
      sheettxt = Store.luckysheetfile[this.getSheetIndex(sheetIndex)].name + "!";
    }
    let row0 = range["row"][0],
      row1 = range["row"][1];
    let column0 = range["column"][0],
      column1 = range["column"][1];
    if (row0 == null && row1 == null) {
      return sheettxt + chatatABC(column0) + ":" + chatatABC(column1);
    } else if (column0 == null && column1 == null) {
      return sheettxt + (row0 + 1) + ":" + (row1 + 1);
    } else {
      if (column0 == column1 && row0 == row1) {
        return sheettxt + chatatABC(column0) + (row0 + 1);
      } else {
        return sheettxt + chatatABC(column0) + (row0 + 1) + ":" + chatatABC(column1) + (row1 + 1);
      }
    }
  }
};
export default sheetDataUtilsModule;