import {  getSheetIndex,  getluckysheetfile  } from "../../methods/get";
import Store from "../../store";
import locale from "../../locale/locale";
const sizeUtilsModule = {
  getCellRealSize: function (d, cell_r, cell_c) {
    let _this = this;
    let width = Store.defaultcollen;
    let height = Store.defaultrowlen;
    let celldata = d[cell_r][cell_c];
    if (!!celldata && celldata["mc"] != null) {
      let mc = celldata["mc"];
      let margeset = _this.mergeborer(d, mc.r, mc.c);
      if (margeset) {
        let row = margeset.row[1];
        let row_pre = margeset.row[0];
        let row_index = margeset.row[2];
        let row_index_ed = margeset.row[3];
        let col = margeset.column[1];
        let col_pre = margeset.column[0];
        let col_index = margeset.column[2];
        let col_index_ed = margeset.column[3];
        width = col - col_pre - 1;
        height = row - row_pre - 1;
      }
    } else {
      let config = getluckysheetfile()[getSheetIndex(Store.currentSheetIndex)]["config"];
      if (config["columnlen"] != null && config["columnlen"][cell_c] != null) {
        width = config["columnlen"][cell_c];
      }
      if (config["rowlen"] != null && config["rowlen"][cell_r] != null) {
        height = config["rowlen"][cell_r];
      }
    }
    return [width, height];
  },
  getTextHeightCache: {},
  getTextSize: function (text, font) {
    let fontarray = locale().fontarray;
    let f = font || "10pt " + fontarray[0];
    let _this = this;
    if (f in _this.getTextHeightCache) {
      return _this.getTextHeightCache[f];
    }
    if (document.getElementById("luckysheetTextSizeTest") === null) {
      document.body.insertAdjacentHTML('beforeend', '<span id="luckysheetTextSizeTest" style="float:left;white-space:nowrap;visibility:hidden;margin:0;padding:0;">' + text + "</span>");
    }
    let o = document.getElementById("luckysheetTextSizeTest");
    o.textContent = text;
    Object.assign(o.style, {
        font: f
    });
    let w = o.offsetWidth,
      h = o.offsetHeight;
    _this.getTextHeightCache[f] = [w, h];
    return [w, h];
  }
};
export default sizeUtilsModule;