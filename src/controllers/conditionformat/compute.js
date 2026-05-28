import {  getSheetIndex } from "../../methods/get";
import Store from "../../store";
import { parseRgbString } from "../../utils/utilSub/colorUtils.js";

import { computeDataBar } from './computeSub/computeDataBar.js';
import { computeColorGradation } from './computeSub/computeColorGradation.js';
import { computeIcons } from './computeSub/computeIcons.js';
import { computeDefault } from './computeSub/computeDefault.js';

const computeModule = {
  compute: function (ruleArr, d) {
    let _this = this;
    if (ruleArr == null) {
      return;
    }
    let computeMap = {};
    if (ruleArr.length > 0) {
      for (let i = 0; i < ruleArr.length; i++) {
        let type = ruleArr[i]["type"];
        let cellrange = ruleArr[i]["cellrange"];
        let format = ruleArr[i]["format"];
        if (type == "dataBar") {
          computeDataBar(_this, computeMap, type, cellrange, format, ruleArr, i, d);
        } else if (type == "colorGradation") {
          computeColorGradation(_this, computeMap, type, cellrange, format, ruleArr, i, d);
        } else if (type == "icons") {
          computeIcons(_this, computeMap, type, cellrange, format, ruleArr, i, d);
        } else {
          computeDefault(_this, computeMap, type, cellrange, format, ruleArr, i, d);
        }
      }
    }
    
    return computeMap;
  },
  getComputeMap: function (sheetIndex) {
    let index = getSheetIndex(Store.currentSheetIndex);
    if (sheetIndex != null) {
      index = getSheetIndex(sheetIndex);
    }
    let ruleArr = Store.luckysheetfile[index]["luckysheet_conditionformat_save"];
    let data = Store.luckysheetfile[index]["data"];
    if (data == null) {
      return null;
    }
    let computeMap = this.compute(ruleArr, data);
    return computeMap;
  },
  checksCF: function (r, c, computeMap) {
    if (computeMap != null && r + "_" + c in computeMap) {
      return computeMap[r + "_" + c];
    } else {
      return null;
    }
  },
  getcolorGradation: function (color1, color2, value1, value2, value) {
    let c1 = parseRgbString(color1);
    let c2 = parseRgbString(color2);
    if (!c1 || !c2) return color1;
    let r = Math.round(c1.r - (c1.r - c2.r) / (value1 - value2) * (value1 - value));
    let g = Math.round(c1.g - (c1.g - c2.g) / (value1 - value2) * (value1 - value));
    let b = Math.round(c1.b - (c1.b - c2.b) / (value1 - value2) * (value1 - value));
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }
};
export default computeModule;
