import {  getSheetIndex } from "../../methods/get";
import Store from "../../store";

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
    let rgb1 = color1.split(',');
    let r1 = parseInt(rgb1[0].split('(')[1]);
    let g1 = parseInt(rgb1[1]);
    let b1 = parseInt(rgb1[2].split(')')[0]);
    let rgb2 = color2.split(',');
    let r2 = parseInt(rgb2[0].split('(')[1]);
    let g2 = parseInt(rgb2[1]);
    let b2 = parseInt(rgb2[2].split(')')[0]);
    let r = Math.round(r1 - (r1 - r2) / (value1 - value2) * (value1 - value));
    let g = Math.round(g1 - (g1 - g2) / (value1 - value2) * (value1 - value));
    let b = Math.round(b1 - (b1 - b2) / (value1 - value2) * (value1 - value));
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }
};
export default computeModule;
