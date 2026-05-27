import luckysheetConfigsetting from "../../controllers/luckysheetConfigsetting";
import { luckysheet_getcelldata, luckysheet_parseData, luckysheet_getValue, luckysheet_calcADPMM } from "../func";
import { inverse } from "../matrix_methods";
import { getSheetIndex, getluckysheetfile, getRangetxt } from "../../methods/get";
import menuButton from "../../controllers/menuButton";
import formula from "../../global/formula";
import func_methods from "../../global/func_methods";
import editor from "../../global/editor";
import { isdatetime, diff, isdatatype } from "../../global/datecontroll";
import { isRealNum, isRealNull, valueIsError, error } from "../../global/validate";
import { jfrefreshgrid, jfrefreshgridall } from "../../global/refresh";
import { genarate, update } from "../../global/format";
import { orderbydata } from "../../global/sort";
import { getcellvalue, datagridgrowth } from "../../global/getdata";
import { getObjType, ABCatNum, chatatABC, numFormat } from "../../utils/util";
import Store from "../../store";
import dayjs from 'dayjs';
import numeral from 'numeral';
import { getAirTable, companyTargetData, companyTargetData10, companyTargetData11, companyTargetData12, excelToLuckyArray, excelToArray, askAIData } from "../../demoData/getTargetData";
import { setcellvalue } from "../../global/setdata";
import jStat from 'jstat';

//公式函数计算
const dateFunctions = {
  "ISDATE": function () {
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
      //日期
      var date = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(date)) {
        return date;
      }
      return isdatetime(date);
    } catch (e) {
      var err = e;
      //计算错误检测
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "TIME": function () {
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
      //时
      var hour = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(hour)) {
        return hour;
      }
      if (!isRealNum(hour)) {
        return formula.error.v;
      }
      hour = parseInt(hour);

      //分
      var minute = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(minute)) {
        return minute;
      }
      if (!isRealNum(minute)) {
        return formula.error.v;
      }
      minute = parseInt(minute);

      //秒
      var second = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(second)) {
        return second;
      }
      if (!isRealNum(second)) {
        return formula.error.v;
      }
      second = parseInt(second);
      if (hour < 0 || hour > 32767) {
        return formula.error.nm;
      } else if (hour > 24) {
        hour = hour % 24;
      }
      if (minute < 0 || minute > 32767) {
        return formula.error.nm;
      }
      if (second < 0 || second > 32767) {
        return formula.error.nm;
      }

      //计算
      var time = dayjs().set({
        'hour': hour,
        'minute': minute,
        'second': second
      });
      return dayjs(time).format("h:mm:ss a");
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "TIMEVALUE": function () {
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
      //用于表示时间的字符串
      var time_text = func_methods.getCellDate(arguments[0]);
      if (valueIsError(time_text)) {
        return time_text;
      }

      //计算
      if (!dayjs(time_text).isValid()) {
        return formula.error.v;
      }
      return (3600 * dayjs(time_text).get('hour') + 60 * dayjs(time_text).get('minute') + dayjs(time_text).get('second')) / 86400;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "EOMONTH": function () {
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
      //用于计算结果的参照日期
      var start_date = func_methods.getCellDate(arguments[0]);
      if (valueIsError(start_date)) {
        return start_date;
      }

      //月数
      var months = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(months)) {
        return months;
      }
      if (!isRealNum(months)) {
        return formula.error.v;
      }
      months = parseInt(months);
      if (!dayjs(start_date).isValid()) {
        return formula.error.v;
      }

      //计算
      var date = dayjs(start_date).add(months + 1, 'months').set('date', 1).subtract(1, 'days');
      var mask = genarate(dayjs(date).format("YYYY-MM-DD H:mm:ss"));
      var result = mask[2];
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "EDATE": function () {
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
      //用于计算结果的参照日期
      var start_date = func_methods.getCellDate(arguments[0]);
      if (valueIsError(start_date)) {
        return start_date;
      }

      //月数
      var months = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(months)) {
        return months;
      }
      if (!isRealNum(months)) {
        return formula.error.v;
      }
      months = parseInt(months);
      if (!dayjs(start_date).isValid()) {
        return formula.error.v;
      }

      //计算
      var date = dayjs(start_date).add(months, 'months');
      var mask = genarate(dayjs(date).format("YYYY-MM-DD h:mm:ss"));
      var result = mask[2];
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
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
export default dateFunctions;