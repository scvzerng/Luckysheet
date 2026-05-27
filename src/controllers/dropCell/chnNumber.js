import { rowLocationByIndex, colLocationByIndex } from "../../global/location";
import { countfunc } from "../../global/count";
import { getBorderInfoCompute } from "../../global/border";
import { isRealNum } from "../../global/validate";
import { genarate, update } from "../../global/format";
import { jfrefreshgrid } from "../../global/refresh";
import editor from "../../global/editor";
import formula from "../../global/formula";
import conditionformat from "../conditionformat";
import { selectHightlightShow } from "../select";
import { getSheetIndex } from "../../methods/get";
import { getObjType, replaceHtml } from "../../utils/util";
import Store from "../../store";
import locale from "../../locale/locale";
import dayjs from 'dayjs';

//选区下拉
const chnNumberModule = {
  //down-往下拖拽，right-往右拖拽，up-往上拖拽，left-往左拖拽
  chnNumChar: {
    "零": 0,
    "一": 1,
    "二": 2,
    "三": 3,
    "四": 4,
    "五": 5,
    "六": 6,
    "七": 7,
    "八": 8,
    "九": 9
  },
  chnNameValue: {
    "十": {
      value: 10,
      secUnit: false
    },
    "百": {
      value: 100,
      secUnit: false
    },
    "千": {
      value: 1000,
      secUnit: false
    },
    "万": {
      value: 10000,
      secUnit: true
    },
    "亿": {
      value: 100000000,
      secUnit: true
    }
  },
  ChineseToNumber: function (chnStr) {
    let _this = this;
    let rtn = 0;
    let section = 0;
    let number = 0;
    let secUnit = false;
    let str = chnStr.split("");
    for (let i = 0; i < str.length; i++) {
      let num = _this.chnNumChar[str[i]];
      if (typeof num != "undefined") {
        number = num;
        if (i == str.length - 1) {
          section += number;
        }
      } else {
        let unit = _this.chnNameValue[str[i]].value;
        secUnit = _this.chnNameValue[str[i]].secUnit;
        if (secUnit) {
          section = (section + number) * unit;
          rtn += section;
          section = 0;
        } else {
          section += number * unit;
        }
        number = 0;
      }
    }
    return rtn + section;
  },
  chnNumChar2: ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"],
  chnUnitSection: ["", "万", "亿", "万亿", "亿亿"],
  chnUnitChar: ["", "十", "百", "千"],
  SectionToChinese: function (section) {
    let _this = this;
    let strIns = '',
      chnStr = '';
    let unitPos = 0;
    let zero = true;
    while (section > 0) {
      let v = section % 10;
      if (v == 0) {
        if (!zero) {
          zero = true;
          chnStr = _this.chnNumChar2[v] + chnStr;
        }
      } else {
        zero = false;
        strIns = _this.chnNumChar2[v];
        strIns += _this.chnUnitChar[unitPos];
        chnStr = strIns + chnStr;
      }
      unitPos++;
      section = Math.floor(section / 10);
    }
    return chnStr;
  },
  NumberToChinese: function (num) {
    let _this = this;
    let unitPos = 0;
    let strIns = '',
      chnStr = '';
    let needZero = false;
    if (num == 0) {
      return _this.chnNumChar2[0];
    }
    while (num > 0) {
      let section = num % 10000;
      if (needZero) {
        chnStr = _this.chnNumChar2[0] + chnStr;
      }
      strIns = _this.SectionToChinese(section);
      strIns += section != 0 ? _this.chnUnitSection[unitPos] : _this.chnUnitSection[0];
      chnStr = strIns + chnStr;
      needZero = section < 1000 && section > 0;
      num = Math.floor(num / 10000);
      unitPos++;
    }
    return chnStr;
  },
  isChnNumber: function (txt) {
    let _this = this;
    let isChnNumber = true;
    if (txt) {
      //如果不判断，出现undefined的时候这里会报错
      if (txt.length == 1) {
        if (txt == "日" || txt in _this.chnNumChar) {
          isChnNumber = true;
        } else {
          isChnNumber = false;
        }
      } else {
        let str = txt.split("");
        for (let i = 0; i < str.length; i++) {
          if (!(str[i] in _this.chnNumChar || str[i] in _this.chnNameValue)) {
            isChnNumber = false;
            break;
          }
        }
      }
    }
    return isChnNumber;
  }
};
export default chnNumberModule;