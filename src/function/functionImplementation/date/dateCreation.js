import formula from "../../../global/formula";
import func_methods from "../../../global/func_methods";
import {  isdatetime } from "../../../global/datecontroll";
import {  isRealNum,  valueIsError } from "../../../global/validate";
import {  genarate } from "../../../global/format";
import dayjs from 'dayjs';

const dateCreation = {
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
};

export default dateCreation;
