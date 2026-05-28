import formula from "../../../global/formula";
import func_methods from "../../../global/func_methods";
import {  isdatetime } from "../../../global/datecontroll";
import {  isRealNum,  valueIsError } from "../../../global/validate";
import {  genarate } from "../../../global/format";
import {  getObjType } from "../../../utils/util";
import dayjs from 'dayjs';

const dateCalculation = {
  "DAY": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //用于计算净工作日天数的时间段开始日期
      var serial_number = func_methods.getCellDate(arguments[0]);
      if (valueIsError(serial_number)) {
        return serial_number;
      }
      if (!dayjs(serial_number).isValid()) {
        return formula.error.v;
      }

      //计算
      return dayjs(serial_number).date();
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DAYS": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //结束日期
      var end_date = func_methods.getCellDate(arguments[0]);
      if (valueIsError(end_date)) {
        return end_date;
      }
      if (!dayjs(end_date).isValid()) {
        return formula.error.v;
      }

      //开始日期
      var start_date = func_methods.getCellDate(arguments[1]);
      if (valueIsError(start_date)) {
        return start_date;
      }
      if (!dayjs(start_date).isValid()) {
        return formula.error.v;
      }

      //计算
      var result = dayjs(end_date).diff(dayjs(start_date), 'days');
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DAYS360": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //开始日期
      var start_date = func_methods.getCellDate(arguments[0]);
      if (valueIsError(start_date)) {
        return start_date;
      }
      if (!dayjs(start_date).isValid()) {
        return formula.error.v;
      }

      //结束日期
      var end_date = func_methods.getCellDate(arguments[1]);
      if (valueIsError(end_date)) {
        return end_date;
      }
      if (!dayjs(end_date).isValid()) {
        return formula.error.v;
      }

      //天数计算方法
      var method = false;
      if (arguments.length == 3) {
        method = func_methods.getCellBoolen(arguments[2]);
        if (valueIsError(method)) {
          return method;
        }
      }

      //计算
      var sm = dayjs(start_date).month();
      var em = dayjs(end_date).month();
      var sd, ed;
      if (method) {
        sd = dayjs(start_date).date() === 31 ? 30 : dayjs(start_date).date();
        ed = dayjs(end_date).date() === 31 ? 30 : dayjs(end_date).date();
      } else {
        var smd = dayjs().set({
          'year': dayjs(start_date).year(),
          'month': sm + 1,
          'date': 0
        }).date();
        var emd = dayjs().set({
          'year': dayjs(end_date).year(),
          'month': em + 1,
          'date': 0
        }).date();
        sd = dayjs(start_date).date() === smd ? 30 : dayjs(start_date).date();
        if (dayjs(end_date).date() === emd) {
          if (sd < 30) {
            em++;
            ed = 1;
          } else {
            ed = 30;
          }
        } else {
          ed = dayjs(end_date).date();
        }
      }
      var result = 360 * dayjs(end_date).diff(dayjs(start_date), 'years') + 30 * (em - sm) + (ed - sd);
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DATE": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //年
      var year = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(year)) {
        return year;
      }
      if (!isRealNum(year)) {
        return formula.error.v;
      }
      year = parseInt(year);

      //月
      var month = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(month)) {
        return month;
      }
      if (!isRealNum(month)) {
        return formula.error.v;
      }
      month = parseInt(month);

      //日
      var day = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(day)) {
        return day;
      }
      if (!isRealNum(day)) {
        return formula.error.v;
      }
      day = parseInt(day);
      if (year < 0 || year >= 10000) {
        return formula.error.nm;
      } else if (year >= 0 && year <= 1899) {
        year = year + 1900;
      }
      var date = dayjs().set({
        'year': year,
        'month': month - 1,
        "date": day
      });
      if (dayjs(date).year() < 1900) {
        return formula.error.nm;
      }
      return dayjs(date).format("YYYY-MM-DD");
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DATEVALUE": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //开始日期
      var date_text = func_methods.getCellDate(arguments[0]);
      if (valueIsError(date_text)) {
        return date_text;
      }
      if (!dayjs(date_text).isValid()) {
        return formula.error.v;
      }

      //计算
      date_text = dayjs(date_text).format("YYYY-MM-DD");
      var result = genarate(date_text)[2];
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DATEDIF": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      for (var i = 0; i < arguments.length - 1; i++) {
        arguments[i] = func_methods.getCellDate(arguments[i]);
        if (!isdatetime(arguments[i])) {
          return formula.error.v;
        }
      }
      var startDate = dayjs(arguments[0]);
      var endDate = dayjs(arguments[1]);
      var unit = arguments[2];
      var result = formula.error.v;
      if (window.luckysheet_function.DAYS.f(endDate, startDate) < 0) {
        return formula.error.v;
      }
      switch (unit) {
        case "Y":
        case "y":
          result = endDate.diff(startDate, "years", false);
          break;
        case "M":
        case "m":
          result = endDate.diff(startDate, "months", false);
          break;
        case "D":
        case "d":
          result = endDate.diff(startDate, "days", false);
          break;
        case "MD":
        case "md":
          result = endDate.format('DD') - startDate.format('DD');
          break;
        case "YM":
        case "ym":
          var startM = parseInt(startDate.format('M')); //注意字符串转化为数字
          var endM = parseInt(endDate.format('M'));
          result = startM <= endM ? endM - startM : endM + 12 - startM;
          break;
        case "YD":
        case "yd":
          const format = `${endDate.$y}-MM-DD`;
          var startM = genarate(startDate.format(format))[2];
          var endM = genarate(endDate.format(format))[2];
          result = startM <= endM ? endM - startM : endM + 365 - startM;
          break;
        default:
          result = formula.error.v;
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "WORKDAY": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      if (arguments.length == 3) {
        var result = window.luckysheet_function.WORKDAY_INTL.f(arguments[0], arguments[1], 1, arguments[2]);
      } else {
        var result = window.luckysheet_function.WORKDAY_INTL.f(arguments[0], arguments[1], 1);
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "WORKDAY_INTL": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      var WEEKEND_TYPES = [[], [6, 0], [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], undefined, undefined, undefined, [0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6]];

      //计算的开始日期
      var start_date = func_methods.getCellDate(arguments[0]);
      if (valueIsError(start_date)) {
        return start_date;
      }
      if (!dayjs(start_date).isValid()) {
        return formula.error.v;
      }

      //工作日的天数
      var days = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(days)) {
        return days;
      }
      if (!isRealNum(days)) {
        return formula.error.v;
      }
      days = parseInt(days);

      //用于表示哪些天为周末的数字或字符串
      var weekend = WEEKEND_TYPES[1];
      if (arguments.length >= 3) {
        weekend = arguments[2];
        if (typeof weekend == "string" && weekend.length == "7" && /^[0-1]{7}$/g.test(weekend)) {} else {
          weekend = func_methods.getFirstValue(arguments[2]);
          if (valueIsError(weekend)) {
            return weekend;
          }
          if (!isRealNum(weekend)) {
            return formula.error.v;
          }
          weekend = parseInt(weekend);
          if (weekend < 1 || weekend > 7 && weekend < 11 || weekend > 17) {
            return formula.error.nm;
          }
          weekend = WEEKEND_TYPES[weekend];
        }
      }

      //这是一个范围或数组常量，其中包含作为节假日的日期
      var holidays = [];
      if (arguments.length == 4) {
        holidays = func_methods.getCellrangeDate(arguments[3]);
        if (valueIsError(holidays)) {
          return holidays;
        }
      }
      for (var i = 0; i < holidays.length; i++) {
        if (!dayjs(holidays[i]).isValid()) {
          return formula.error.v;
        }
      }

      //计算
      var d = 0;
      while (d < days) {
        start_date = dayjs(start_date).add(1, 'days');
        var day = dayjs(start_date).weekday();
        if (getObjType(weekend)) {
          if (day === weekend[0] || day === weekend[1]) {
            continue;
          }
        } else {
          if (day == 0) {
            day = 7;
          }
          if (weekend.charAt(day - 1) == "0") {
            continue;
          }
        }
        for (var j = 0; j < holidays.length; j++) {
          if (dayjs(start_date).diff(dayjs(holidays[j]), 'days') === 0) {
            d--;
            break;
          }
        }
        d++;
      }
      return dayjs(start_date).format("YYYY-MM-DD");
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "YEAR": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //开始日期
      var serial_number = func_methods.getCellDate(arguments[0]);
      if (valueIsError(serial_number)) {
        return serial_number;
      }
      if (!dayjs(serial_number).isValid()) {
        return formula.error.v;
      }

      //计算
      return dayjs(serial_number).year();
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "YEARFRAC": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //开始日期
      var start_date = func_methods.getCellDate(arguments[0]);
      if (valueIsError(start_date)) {
        return start_date;
      }
      if (!dayjs(start_date).isValid()) {
        return formula.error.v;
      }

      //结束日期
      var end_date = func_methods.getCellDate(arguments[1]);
      if (valueIsError(end_date)) {
        return end_date;
      }
      if (!dayjs(end_date).isValid()) {
        return formula.error.v;
      }

      //日计数基准类型
      var basis = 0;
      if (arguments.length == 3) {
        basis = func_methods.getFirstValue(arguments[2]);
        if (valueIsError(basis)) {
          return basis;
        }
        if (!isRealNum(basis)) {
          return formula.error.v;
        }
        basis = parseInt(basis);
      }
      if (basis < 0 || basis > 4) {
        return formula.error.nm;
      }

      //计算
      var sd = dayjs(start_date).date();
      var sm = dayjs(start_date).month() + 1;
      var sy = dayjs(start_date).year();
      var ed = dayjs(end_date).date();
      var em = dayjs(end_date).month() + 1;
      var ey = dayjs(end_date).year();
      var result;
      switch (basis) {
        case 0:
          // US (NASD) 30/360
          if (sd === 31 && ed === 31) {
            sd = 30;
            ed = 30;
          } else if (sd === 31) {
            sd = 30;
          } else if (sd === 30 && ed === 31) {
            ed = 30;
          }
          result = (ed + em * 30 + ey * 360 - (sd + sm * 30 + sy * 360)) / 360;
          break;
        case 1:
          // Actual/actual
          var ylength = 365;
          if (sy === ey || sy + 1 === ey && (sm > em || sm === em && sd >= ed)) {
            if (sy === ey && func_methods.isLeapYear(sy) || func_methods.feb29Between(start_date, end_date) || em === 1 && ed === 29) {
              ylength = 366;
            }
            return dayjs(end_date).diff(dayjs(start_date), 'days') / ylength;
          }
          var years = ey - sy + 1;
          var days = (dayjs().set({
            'year': ey + 1,
            'month': 0,
            'date': 1
          }) - dayjs().set({
            'year': sy,
            'month': 0,
            'date': 1
          })) / 1000 / 60 / 60 / 24;
          var average = days / years;
          result = dayjs(end_date).diff(dayjs(start_date), 'days') / average;
          break;
        case 2:
          // Actual/360
          result = dayjs(end_date).diff(dayjs(start_date), 'days') / 360;
          break;
        case 3:
          // Actual/365
          result = dayjs(end_date).diff(dayjs(start_date), 'days') / 365;
          break;
        case 4:
          // European 30/360
          result = (ed + em * 30 + ey * 360 - (sd + sm * 30 + sy * 360)) / 360;
          break;
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "TODAY": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      return dayjs().format("YYYY-MM-DD");
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "MONTH": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //开始日期
      var serial_number = func_methods.getCellDate(arguments[0]);
      if (valueIsError(serial_number)) {
        return serial_number;
      }
      if (!dayjs(serial_number).isValid()) {
        return formula.error.v;
      }

      //计算
      return dayjs(serial_number).month() + 1;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  }
};

export default dateCalculation;
