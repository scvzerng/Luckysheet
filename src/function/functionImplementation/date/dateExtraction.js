import formula from "../../../global/formula";
import func_methods from "../../../global/func_methods";
import {  isRealNum,  valueIsError } from "../../../global/validate";
import {  getObjType } from "../../../utils/util";
import dayjs from 'dayjs';

const dateExtraction = {
  "SECOND": function () {
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
      //时间值
      var time_text = func_methods.getCellDate(arguments[0]);
      if (valueIsError(time_text)) {
        return time_text;
      }
      if (!dayjs(time_text).isValid()) {
        return formula.error.v;
      }
      var result = dayjs(time_text).seconds();
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "MINUTE": function () {
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
      //时间值
      var time_text = func_methods.getCellDate(arguments[0]);
      if (valueIsError(time_text)) {
        return time_text;
      }
      if (!dayjs(time_text).isValid()) {
        return formula.error.v;
      }
      var result = dayjs(time_text).minutes();
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "HOUR": function () {
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
      //时间值
      var time_text = func_methods.getCellDate(arguments[0]);
      if (valueIsError(time_text)) {
        return time_text;
      }
      if (!dayjs(time_text).isValid()) {
        return formula.error.v;
      }
      var result = dayjs(time_text).hours();
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "NOW": function () {
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
      return dayjs().format("YYYY-M-D HH:mm");
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "NETWORKDAYS": function () {
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
        var result = window.luckysheet_function.NETWORKDAYS_INTL.f(arguments[0], arguments[1], 1, arguments[2]);
      } else {
        var result = window.luckysheet_function.NETWORKDAYS_INTL.f(arguments[0], arguments[1], 1);
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "NETWORKDAYS_INTL": function () {
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

      //用于计算净工作日天数的时间段开始日期
      var start_date = func_methods.getCellDate(arguments[0]);
      if (valueIsError(start_date)) {
        return start_date;
      }
      if (!dayjs(start_date).isValid()) {
        return formula.error.v;
      }

      //用于计算净工作日天数的时间段结束日期
      var end_date = func_methods.getCellDate(arguments[1]);
      if (valueIsError(end_date)) {
        return end_date;
      }
      if (!dayjs(end_date).isValid()) {
        return formula.error.v;
      }

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
      var days = dayjs(end_date).diff(dayjs(start_date), 'days') + 1;
      var total = days;
      var day = dayjs(start_date);
      for (i = 0; i < days; i++) {
        var d = dayjs(day).weekday();
        var dec = false;
        if (getObjType(weekend) == "array") {
          if (d === weekend[0] || d === weekend[1]) {
            dec = true;
          }
        } else {
          if (d == 0) {
            d = 7;
          }
          if (weekend.charAt(d - 1) == "0") {
            dec = true;
          }
        }
        for (var j = 0; j < holidays.length; j++) {
          if (dayjs(day).diff(dayjs(holidays[j]), 'days') === 0) {
            dec = true;
            break;
          }
        }
        if (dec) {
          total--;
        }
        day = dayjs(day).add(1, 'days');
      }
      return total;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ISOWEEKNUM": function () {
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
      //用于日期和时间计算的日期
      var date = func_methods.getCellDate(arguments[0]);
      if (valueIsError(date)) {
        return date;
      }
      if (!dayjs(date).isValid()) {
        return formula.error.v;
      }

      //计算
      return dayjs(date).isoWeeks();
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "WEEKNUM": function () {
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
      var WEEK_STARTS = [undefined, 7, 1, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 1, 2, 3, 4, 5, 6, 7];

      //用于计算净工作日天数的时间段开始日期
      var serial_number = func_methods.getCellDate(arguments[0]);
      if (valueIsError(serial_number)) {
        return serial_number;
      }
      if (!dayjs(serial_number).isValid()) {
        return formula.error.v;
      }

      //用于表示哪些天为周末的数字或字符串
      var return_type = 1;
      if (arguments.length == 2) {
        return_type = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(return_type)) {
          return return_type;
        }
        if (!isRealNum(return_type)) {
          return formula.error.v;
        }
        return_type = parseInt(return_type);
      }
      if (return_type == 21) {
        return window.luckysheet_function.ISOWEEKNUM.f(arguments[0]);
      }
      if ([1, 2, 11, 12, 13, 14, 15, 16, 17].indexOf(return_type) == -1) {
        return formula.error.nm;
      }

      //计算
      var week_start = WEEK_STARTS[return_type];
      var inc = dayjs(serial_number).isoWeekday() >= week_start ? 1 : 0;
      var result = dayjs(serial_number).isoWeeks() + inc;
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "WEEKDAY": function () {
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
      var WEEK_TYPES = [[], [1, 2, 3, 4, 5, 6, 7], [7, 1, 2, 3, 4, 5, 6], [6, 0, 1, 2, 3, 4, 5], [], [], [], [], [], [], [], [7, 1, 2, 3, 4, 5, 6], [6, 7, 1, 2, 3, 4, 5], [5, 6, 7, 1, 2, 3, 4], [4, 5, 6, 7, 1, 2, 3], [3, 4, 5, 6, 7, 1, 2], [2, 3, 4, 5, 6, 7, 1], [1, 2, 3, 4, 5, 6, 7]];

      //用于计算净工作日天数的时间段开始日期
      var serial_number = func_methods.getCellDate(arguments[0]);
      if (valueIsError(serial_number)) {
        return serial_number;
      }
      if (!dayjs(serial_number).isValid()) {
        return formula.error.v;
      }

      //以数字指示使用哪种编号顺序来表示星期几
      var return_type = 1;
      if (arguments.length == 2) {
        return_type = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(return_type)) {
          return return_type;
        }
        if (!isRealNum(return_type)) {
          return formula.error.v;
        }
        return_type = parseInt(return_type);
      }
      if ([1, 2, 3, 11, 12, 13, 14, 15, 16, 17].indexOf(return_type) == -1) {
        return formula.error.nm;
      }

      //计算
      var result = WEEK_TYPES[return_type][dayjs(serial_number).day()];
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
};

export default dateExtraction;
