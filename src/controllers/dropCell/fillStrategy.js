import { genarate, update } from "../../global/format";
import dayjs from 'dayjs';

//选区下拉
const fillStrategyModule = {
  FillCopy: function (data, len) {
    let applyData = [];
    for (let i = 1; i <= len; i++) {
      let index = (i - 1) % data.length;
      let d = $.extend(true, {}, data[index]);
      applyData.push(d);
    }
    return applyData;
  },
  FillSeries: function (data, len, direction) {
    let _this = this;
    let applyData = [];
    let dataNumArr = [];
    for (let j = 0; j < data.length; j++) {
      dataNumArr.push(Number(data[j]["v"]));
    }
    if (data.length > 2 && _this.isEqualRatio(dataNumArr)) {
      //等比数列
      for (let i = 1; i <= len; i++) {
        let index = (i - 1) % data.length;
        let d = $.extend(true, {}, data[index]);
        let num;
        if (direction == "down" || direction == "right") {
          num = Number(data[data.length - 1]["v"]) * Math.pow(Number(data[1]["v"]) / Number(data[0]["v"]), i);
        } else if (direction == "up" || direction == "left") {
          num = Number(data[0]["v"]) / Math.pow(Number(data[1]["v"]) / Number(data[0]["v"]), i);
        }
        d["v"] = num;
        d["m"] = update(d["ct"]["fa"], num);
        applyData.push(d);
      }
    } else {
      //线性数列
      let xArr = _this.getXArr(data.length);
      for (let i = 1; i <= len; i++) {
        let index = (i - 1) % data.length;
        let d = $.extend(true, {}, data[index]);
        let y;
        if (direction == "down" || direction == "right") {
          y = _this.forecast(data.length + i, dataNumArr, xArr);
        } else if (direction == "up" || direction == "left") {
          y = _this.forecast(1 - i, dataNumArr, xArr);
        }
        d["v"] = y;
        d["m"] = update(d["ct"]["fa"], y);
        applyData.push(d);
      }
    }
    return applyData;
  },
  FillExtendNumber: function (data, len, step) {
    let _this = this;
    let applyData = [];
    let reg = /0|([1-9]+[0-9]*)/g;
    for (let i = 1; i <= len; i++) {
      let index = (i - 1) % data.length;
      let d = $.extend(true, {}, data[index]);
      let last = data[data.length - 1]["m"];
      let match = last.match(reg);
      let lastTxt = match[match.length - 1];
      let num = Math.abs(Number(lastTxt) + step * i);
      let lastIndex = last.lastIndexOf(lastTxt);
      let valueTxt = last.substr(0, lastIndex) + num.toString() + last.substr(lastIndex + lastTxt.length);
      d["v"] = valueTxt;
      d["m"] = valueTxt;
      applyData.push(d);
    }
    return applyData;
  },
  FillOnlyFormat: function (data, len) {
    let applyData = [];
    for (let i = 1; i <= len; i++) {
      let index = (i - 1) % data.length;
      let d = $.extend(true, {}, data[index]);
      delete d["f"];
      delete d["m"];
      delete d["v"];
      applyData.push(d);
    }
    return applyData;
  },
  FillWithoutFormat: function (dataArr) {
    let applyData = [];
    for (let i = 0; i < dataArr.length; i++) {
      let d = $.extend(true, {}, dataArr[i]);
      let obj;
      if (d["f"] == null) {
        obj = {
          "m": d["v"].toString(),
          "v": d["v"]
        };
      } else {
        obj = {
          "f": d["f"],
          "m": d["v"].toString(),
          "v": d["v"]
        };
      }
      applyData.push(obj);
    }
    return applyData;
  },
  FillDays: function (data, len, step) {
    let applyData = [];
    for (let i = 1; i <= len; i++) {
      let index = (i - 1) % data.length;
      let d = $.extend(true, {}, data[index]);
      let date = update("yyyy-MM-dd", d["v"]);
      date = dayjs(date).add(step * i, "days").format("YYYY-MM-DD");
      d["v"] = genarate(date)[2];
      d["m"] = update(d["ct"]["fa"], d["v"]);
      applyData.push(d);
    }
    return applyData;
  },
  FillMonths: function (data, len, step) {
    let applyData = [];
    for (let i = 1; i <= len; i++) {
      let index = (i - 1) % data.length;
      let d = $.extend(true, {}, data[index]);
      let date = update("yyyy-MM-dd", d["v"]);
      date = dayjs(date).add(step * i, "months").format("YYYY-MM-DD");
      d["v"] = genarate(date)[2];
      d["m"] = update(d["ct"]["fa"], d["v"]);
      applyData.push(d);
    }
    return applyData;
  },
  FillYears: function (data, len, step) {
    let applyData = [];
    for (let i = 1; i <= len; i++) {
      let index = (i - 1) % data.length;
      let d = $.extend(true, {}, data[index]);
      let date = update("yyyy-MM-dd", d["v"]);
      date = dayjs(date).add(step * i, "years").format("YYYY-MM-DD");
      d["v"] = genarate(date)[2];
      d["m"] = update(d["ct"]["fa"], d["v"]);
      applyData.push(d);
    }
    return applyData;
  },
  FillChnWeek: function (data, len, step) {
    let _this = this;
    let applyData = [];
    for (let i = 1; i <= len; i++) {
      let index = (i - 1) % data.length;
      let d = $.extend(true, {}, data[index]);
      let num;
      if (data[data.length - 1]["m"] == "日") {
        num = 7 + step * i;
      } else {
        num = _this.ChineseToNumber(data[data.length - 1]["m"]) + step * i;
      }
      if (num < 0) {
        num = Math.ceil(Math.abs(num) / 7) * 7 + num;
      }
      let rsd = num % 7;
      if (rsd == 0) {
        d["m"] = "日";
        d["v"] = "日";
      } else if (rsd == 1) {
        d["m"] = "一";
        d["v"] = "一";
      } else if (rsd == 2) {
        d["m"] = "二";
        d["v"] = "二";
      } else if (rsd == 3) {
        d["m"] = "三";
        d["v"] = "三";
      } else if (rsd == 4) {
        d["m"] = "四";
        d["v"] = "四";
      } else if (rsd == 5) {
        d["m"] = "五";
        d["v"] = "五";
      } else if (rsd == 6) {
        d["m"] = "六";
        d["v"] = "六";
      }
      applyData.push(d);
    }
    return applyData;
  },
  FillChnWeek2: function (data, len, step) {
    let _this = this;
    let applyData = [];
    for (let i = 1; i <= len; i++) {
      let index = (i - 1) % data.length;
      let d = $.extend(true, {}, data[index]);
      let num;
      if (data[data.length - 1]["m"] == "周日") {
        num = 7 + step * i;
      } else {
        let last = data[data.length - 1]["m"];
        let txt = last.substr(last.length - 1, 1);
        num = _this.ChineseToNumber(txt) + step * i;
      }
      if (num < 0) {
        num = Math.ceil(Math.abs(num) / 7) * 7 + num;
      }
      let rsd = num % 7;
      if (rsd == 0) {
        d["m"] = "周日";
        d["v"] = "周日";
      } else if (rsd == 1) {
        d["m"] = "周一";
        d["v"] = "周一";
      } else if (rsd == 2) {
        d["m"] = "周二";
        d["v"] = "周二";
      } else if (rsd == 3) {
        d["m"] = "周三";
        d["v"] = "周三";
      } else if (rsd == 4) {
        d["m"] = "周四";
        d["v"] = "周四";
      } else if (rsd == 5) {
        d["m"] = "周五";
        d["v"] = "周五";
      } else if (rsd == 6) {
        d["m"] = "周六";
        d["v"] = "周六";
      }
      applyData.push(d);
    }
    return applyData;
  },
  FillChnWeek3: function (data, len, step) {
    let _this = this;
    let applyData = [];
    for (let i = 1; i <= len; i++) {
      let index = (i - 1) % data.length;
      let d = $.extend(true, {}, data[index]);
      let num;
      if (data[data.length - 1]["m"] == "星期日") {
        num = 7 + step * i;
      } else {
        let last = data[data.length - 1]["m"];
        let txt = last.substr(last.length - 1, 1);
        num = _this.ChineseToNumber(txt) + step * i;
      }
      if (num < 0) {
        num = Math.ceil(Math.abs(num) / 7) * 7 + num;
      }
      let rsd = num % 7;
      if (rsd == 0) {
        d["m"] = "星期日";
        d["v"] = "星期日";
      } else if (rsd == 1) {
        d["m"] = "星期一";
        d["v"] = "星期一";
      } else if (rsd == 2) {
        d["m"] = "星期二";
        d["v"] = "星期二";
      } else if (rsd == 3) {
        d["m"] = "星期三";
        d["v"] = "星期三";
      } else if (rsd == 4) {
        d["m"] = "星期四";
        d["v"] = "星期四";
      } else if (rsd == 5) {
        d["m"] = "星期五";
        d["v"] = "星期五";
      } else if (rsd == 6) {
        d["m"] = "星期六";
        d["v"] = "星期六";
      }
      applyData.push(d);
    }
    return applyData;
  },
  FillChnNumber: function (data, len, step) {
    let _this = this;
    let applyData = [];
    for (let i = 1; i <= len; i++) {
      let index = (i - 1) % data.length;
      let d = $.extend(true, {}, data[index]);
      let num = _this.ChineseToNumber(data[data.length - 1]["m"]) + step * i,
        txt;
      if (num <= 0) {
        txt = "零";
      } else {
        txt = _this.NumberToChinese(num);
      }
      d["v"] = txt;
      d["m"] = txt.toString();
      applyData.push(d);
    }
    return applyData;
  }
};
export default fillStrategyModule;