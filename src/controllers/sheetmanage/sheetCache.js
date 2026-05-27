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
const sheetCacheModule = {
  execCache: function (item) {
    let _this = this;
    let type = item.t;
    let index = item.i;
    let value = item.v;
    let file = Store.luckysheetfile[_this.getSheetIndex(index)];
    if (type == "sha") {
      Store.luckysheetfile.push(value);
    } else if (type == "shc") {
      let copyjson = $.extend(true, {}, Store.luckysheetfile[_this.getSheetIndex(value.copyindex)]);
      copyjson.index = index;
      Store.luckysheetfile.push(copyjson);
    } else if (type == "shd") {
      Store.luckysheetfile.splice(value.deleIndex, 1);
    } else if (type == "shr") {
      for (let pos in value) {
        Store.luckysheetfile[_this.getSheetIndex(pos)].order = value[pos];
      }
    }
    if ((file == null || file.load != "1") && !(type in {
      sha: 0,
      shc: 0,
      shd: 0,
      shr: 0
    })) {
      _this.CacheNotLoadControll.push(item);
      return;
    }
    if (type == "v") {
      let r = item.r,
        c = item.c,
        v = item.v;
      let data = _this.getSheetData(index);
      file.data[r][c] = v;
    } else if (type == "fc") {
      let op = item.op,
        pos = item.pos;
      if (getObjType(value) != "object") {
        value = new Function("return " + value)();
      }
      let r = value.r,
        c = value.c;
      if (op == "del") {
        formula.delFunctionGroup(r, c, index);
      } else {
        formula.insertUpdateFunctionGroup(r, c, index);
      }
    } else if (type == "cg") {
      let v = value,
        k = item.k;
      let config1 = _this.getSheetConfig(index);
      if (!(k in config1)) {
        config1[k] = {};
      }
      for (let key in v) {
        config1[k][key] = v[key];
      }
      Store.config = config1;
    } else if (type == "f") {
      let v = value,
        op = item.op,
        pos = item.pos;
      let filter = file.filter;
      if (filter == null) {
        filter = {};
      }
      if (op == "upOrAdd") {
        filter[pos] = v;
      } else if (op == "del") {
        delete filter[pos];
      }
    } else if (type == "fsc") {
      file.filter = null;
      file.filter_select = null;
    } else if (type == "fsr") {
      let v = value;
      file.filter = v.filter;
      file.filter_select = v.filter_select;
    } else if (type == "sh") {
      let op = item.op,
        cur = item.cur,
        v = value;
      if (op == "hide") {
        file.status = 0;
        Store.luckysheetfile[_this.getSheetIndex(cur)].status = 1;
      } else if (op == "show") {
        for (let i = 0; i < Store.luckysheetfile.length; i++) {
          Store.luckysheetfile[i].status = 0;
        }
        file.status = 1;
      }
    } else if (type == "all") {
      let k = item.k,
        s = item.s;
      if (s && getObjType(value) != "object") {
        file[k] = JSON.stringify(value);
      } else {
        file[k] = value;
      }
    } else if (type == "drc") {
      let rc = item.rc,
        index = value.index,
        len = value.len;
      let celldata = file.celldata;
      if (rc == "r") {
        for (let i = 0; celldata.length == 0; i++) {
          let cell = celldata[i];
          if (cell.r >= index && cell.r < index + len) {
            delete celldata[i];
          } else if (cell.r >= index + len) {
            cell.r -= len;
          }
        }
        file.row -= len;
      } else {
        for (let i = 0; celldata.length == 0; i++) {
          let cell = celldata[i];
          if (cell.c >= index && cell.c < index + len) {
            delete celldata[i];
          } else if (cell.c >= index + len) {
            cell.c -= len;
          }
        }
        file.column -= len;
      }
      let ret = [];
      for (let i = 0; i < celldata.length; i++) {
        if (celldata[i] != null) {
          ret.push(celldata[i]);
        }
      }
      file.celldata = ret;
      let mtype, mst, med;
      if (rc == "r") {
        mtype = "row";
      } else {
        mtype = "column";
      }
      mst = index;
      med = index + len - 1;
      luckysheetdeletetable(mtype, mst, med, true);
    } else if (type == "arc") {
      let rc = item.rc,
        index = value.index,
        len = value.len;
      let celldata = file.celldata;
      if (rc == "r") {
        for (let i = 0; i < celldata.length; i++) {
          let cell = celldata[i];
          if (cell.r > index) {
            cell.r += len;
          }
        }
        file.row += len;
      } else {
        for (let i = 0; i < celldata.length; i++) {
          let cell = celldata[i];
          if (cell.c > index) {
            cell.c += len;
          }
        }
        file.column += len;
      }
      let mtype;
      if (rc == "r") {
        mtype = "row";
      } else {
        mtype = "column";
      }
      luckysheetextendtable(mtype, index, len, true);
    } else if (type == "na") {} else if (type == "thumb") {
      setTimeout(function () {
        _this.imageRequest();
      }, 2000);
    }
  },
  CacheNotLoadControll: []
};
export default sheetCacheModule;