import { selectHightlightShow, selectionCopyShow } from "../select";
import menuButton from "../menuButton";
import conditionformat from "../conditionformat";
import editor from "../../global/editor";
import tooltip from "../../global/tooltip";
import formula from "../../global/formula";
import { getBorderInfoCompute } from "../../global/border";
import { getdatabyselection, getcellvalue, datagridgrowth } from "../../global/getdata";
import { rowlenByRange } from "../../global/getRowlen";
import { isEditMode, hasPartMC, isRealNum } from "../../global/validate";
import { jfrefreshgrid, jfrefreshgrid_pastcut } from "../../global/refresh";
import { genarate, update } from "../../global/format";
import { getSheetIndex } from "../../methods/get";
import { replaceHtml, getObjType, luckysheetfontformat } from "../../utils/util";
import Store from "../../store";
import locale from "../../locale/locale";
import imageCtrl from "../imageCtrl";
const utilsModule = {
  matchcopy: function (data1, data2) {
    let data1cache = [],
      data2cache = [],
      data1len,
      data2len;
    if (typeof data1 == "object") {
      data1cache = data1;
    } else {
      data1cache = data1.split("\n");
      for (let i = 0; i < data1cache.length; i++) {
        data1cache[i] = data1cache[i].split("\t");
      }
    }
    data1len = data1cache.length;
    if (typeof data2 == "object") {
      data2cache = data2;
    } else {
      data2cache = data2.split("\n");
      for (let i = 0; i < data2cache.length; i++) {
        data2cache[i] = data2cache[i].split("\t");
      }
    }
    data2len = data2cache.length;
    if (data1len != data2len) {
      return false;
    }
    for (let r1 = 0; r1 < data1len; r1++) {
      if (Store.config["rowhidden"] != null && Store.config["rowhidden"][r1] != null) {
        continue;
      }
      for (let r2 = 0; r2 < data2len; r2++) {
        if (data1cache[r1].length != data2cache[r2].length) {
          return false;
        }
      }
    }
    for (let r = 0; r < data1len; r++) {
      if (Store.config["rowhidden"] != null && Store.config["rowhidden"][r] != null) {
        continue;
      }
      for (let c = 0; c < data1cache[0].length; c++) {
        if (getcellvalue(r, c, data1cache) != getcellvalue(r, c, data2cache)) {
          return false;
        }
      }
    }
    return true;
  }
};
export default utilsModule;