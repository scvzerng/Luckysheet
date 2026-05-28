
//选区下拉
const typeDetectorModule = {
  isExtendNumber: function (txt) {
    let reg = /0|([1-9]+[0-9]*)/g;
    let isExtendNumber = reg.test(txt);
    if (isExtendNumber) {
      let match = txt.match(reg);
      let matchTxt = match[match.length - 1];
      let matchIndex = txt.lastIndexOf(matchTxt);
      let beforeTxt = txt.substr(0, matchIndex);
      let afterTxt = txt.substr(matchIndex + matchTxt.length);
      return [isExtendNumber, Number(matchTxt), beforeTxt, afterTxt];
    } else {
      return [isExtendNumber];
    }
  },
  isChnWeek1: function (txt) {
    let _this = this;
    let isChnWeek1;
    if (txt.length == 1) {
      if (txt == "日" || _this.ChineseToNumber(txt) < 7) {
        isChnWeek1 = true;
      } else {
        isChnWeek1 = false;
      }
    } else {
      isChnWeek1 = false;
    }
    return isChnWeek1;
  },
  isChnWeek2: function (txt) {
    let isChnWeek2;
    if (txt.length == 2) {
      if (txt == "周一" || txt == "周二" || txt == "周三" || txt == "周四" || txt == "周五" || txt == "周六" || txt == "周日") {
        isChnWeek2 = true;
      } else {
        isChnWeek2 = false;
      }
    } else {
      isChnWeek2 = false;
    }
    return isChnWeek2;
  },
  isChnWeek3: function (txt) {
    let isChnWeek3;
    if (txt.length == 3) {
      if (txt == "星期一" || txt == "星期二" || txt == "星期三" || txt == "星期四" || txt == "星期五" || txt == "星期六" || txt == "星期日") {
        isChnWeek3 = true;
      } else {
        isChnWeek3 = false;
      }
    } else {
      isChnWeek3 = false;
    }
    return isChnWeek3;
  }
};
export default typeDetectorModule;