import { getSheetIndex, getRangetxt } from "../../methods/get";
import { replaceHtml, getObjType, chatatABC } from "../../utils/util";
import formula from "../../global/formula";
import { isRealNull, isEditMode } from "../../global/validate";
import tooltip from "../../global/tooltip";
import { luckysheetrefreshgrid } from "../../global/refresh";
import { getcellvalue } from "../../global/getdata";
import { genarate } from "../../global/format";
import { modelHTML, luckysheet_CFiconsImg } from "../constant";
import { selectionCopyShow } from "../select";
import sheetmanage from "../sheetmanage";
import locale from "../../locale/locale";
import Store from "../../store";
import dayjs from 'dayjs';

//条件格式
const utilsModule = {
  getTxtByRange: function (range) {
    if (range.length > 0) {
      let txt = [];
      for (let s = 0; s < range.length; s++) {
        let r1 = range[s].row[0],
          r2 = range[s].row[1];
        let c1 = range[s].column[0],
          c2 = range[s].column[1];
        txt.push(getRangetxt(Store.currentSheetIndex, {
          "row": [r1, r2],
          "column": [c1, c2]
        }, Store.currentSheetIndex));
      }
      return txt.join(",");
    }
  },
  getRangeByTxt: function (txt) {
    let range = [];
    txt = txt.toString();
    if (txt.indexOf(",") != -1) {
      let arr = txt.split(",");
      for (let i = 0; i < arr.length; i++) {
        if (formula.iscelldata(arr[i])) {
          range.push(formula.getcellrange(arr[i]));
        } else {
          range = [];
          break;
        }
      }
    } else {
      if (formula.iscelldata(txt)) {
        range.push(formula.getcellrange(txt));
      }
    }
    return range;
  }
};
export default utilsModule;