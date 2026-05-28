import formula from "../../../global/formula";
import func_methods from "../../../global/func_methods";
import {  isRealNum,  valueIsError } from "../../../global/validate";
import {  getObjType } from "../../../utils/util";
import dayjs from 'dayjs';

const financialCashflow = {
  "EFFECT": function () {
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
      //每年的名义利率
      var nominal_rate = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(nominal_rate)) {
        return nominal_rate;
      }
      if (!isRealNum(nominal_rate)) {
        return formula.error.v;
      }
      nominal_rate = parseFloat(nominal_rate);

      //每年的复利计算期数
      var npery = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(npery)) {
        return npery;
      }
      if (!isRealNum(npery)) {
        return formula.error.v;
      }
      npery = parseInt(npery);
      if (nominal_rate <= 0 || npery < 1) {
        return formula.error.nm;
      }
      return Math.pow(1 + nominal_rate / npery, npery) - 1;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DOLLAR": function () {
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
      //要设置格式的值
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);

      //显示的小数位数
      var decimals = 2;
      if (arguments.length == 2) {
        decimals = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(decimals)) {
          return decimals;
        }
        if (!isRealNum(decimals)) {
          return formula.error.v;
        }
        decimals = parseInt(decimals);
      }
      if (decimals > 9) {
        decimals = 9;
      }
      var foucsStatus = "0.";
      for (var i = 1; i <= decimals; i++) {
        foucsStatus += "0";
      }

      //计算
      var sign = number > 0 ? 1 : -1;
      return sign * Math.floor(Math.abs(number) * Math.pow(10, decimals)) / Math.pow(10, decimals);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DOLLARDE": function () {
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
      //分数
      var fractional_dollar = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(fractional_dollar)) {
        return fractional_dollar;
      }
      if (!isRealNum(fractional_dollar)) {
        return formula.error.v;
      }
      fractional_dollar = parseFloat(fractional_dollar);

      //用作分数中的分母的整数
      var fraction = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(fraction)) {
        return fraction;
      }
      if (!isRealNum(fraction)) {
        return formula.error.v;
      }
      fraction = parseInt(fraction);
      if (fraction < 0) {
        return formula.error.nm;
      } else if (fraction == 0) {
        return formula.error.d;
      }

      //计算
      var result = parseInt(fractional_dollar, 10);
      result += fractional_dollar % 1 * Math.pow(10, Math.ceil(Math.log(fraction) / Math.LN10)) / fraction;
      var power = Math.pow(10, Math.ceil(Math.log(fraction) / Math.LN2) + 1);
      result = Math.round(result * power) / power;
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DOLLARFR": function () {
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
      //小数
      var decimal_dollar = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(decimal_dollar)) {
        return decimal_dollar;
      }
      if (!isRealNum(decimal_dollar)) {
        return formula.error.v;
      }
      decimal_dollar = parseFloat(decimal_dollar);

      //用作分数中的分母的整数
      var fraction = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(fraction)) {
        return fraction;
      }
      if (!isRealNum(fraction)) {
        return formula.error.v;
      }
      fraction = parseInt(fraction);
      if (fraction < 0) {
        return formula.error.nm;
      } else if (fraction == 0) {
        return formula.error.d;
      }

      //计算
      var result = parseInt(decimal_dollar, 10);
      result += decimal_dollar % 1 * Math.pow(10, -Math.ceil(Math.log(fraction) / Math.LN10)) * fraction;
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "RATE": function () {
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
      //年金的付款总期数。
      var nper = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(nper)) {
        return nper;
      }
      if (!isRealNum(nper)) {
        return formula.error.v;
      }
      nper = parseFloat(nper);

      //每期的付款金额
      var pmt = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(pmt)) {
        return pmt;
      }
      if (!isRealNum(pmt)) {
        return formula.error.v;
      }
      pmt = parseFloat(pmt);

      //现值
      var pv = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(pv)) {
        return pv;
      }
      if (!isRealNum(pv)) {
        return formula.error.v;
      }
      pv = parseFloat(pv);

      //最后一次付款后希望得到的现金余额
      var fv = 0;
      if (arguments.length >= 4) {
        fv = func_methods.getFirstValue(arguments[3]);
        if (valueIsError(fv)) {
          return fv;
        }
        if (!isRealNum(fv)) {
          return formula.error.v;
        }
        fv = parseFloat(fv);
      }

      //指定各期的付款时间是在期初还是期末
      var type = 0;
      if (arguments.length >= 5) {
        type = func_methods.getFirstValue(arguments[4]);
        if (valueIsError(type)) {
          return type;
        }
        if (!isRealNum(type)) {
          return formula.error.v;
        }
        type = parseFloat(type);
      }

      //预期利率
      var guess = 0.1;
      if (arguments.length == 6) {
        guess = func_methods.getFirstValue(arguments[5]);
        if (valueIsError(guess)) {
          return guess;
        }
        if (!isRealNum(guess)) {
          return formula.error.v;
        }
        guess = parseFloat(guess);
      }
      if (type != 0 && type != 1) {
        return formula.error.nm;
      }

      //计算
      var epsMax = 1e-6;
      var iterMax = 100;
      var iter = 0;
      var close = false;
      var rate = guess;
      while (iter < iterMax && !close) {
        var t1 = Math.pow(rate + 1, nper);
        var t2 = Math.pow(rate + 1, nper - 1);
        var f1 = fv + t1 * pv + pmt * (t1 - 1) * (rate * type + 1) / rate;
        var f2 = nper * t2 * pv - pmt * (t1 - 1) * (rate * type + 1) / Math.pow(rate, 2);
        var f3 = nper * pmt * t2 * (rate * type + 1) / rate + pmt * (t1 - 1) * type / rate;
        var newRate = rate - f1 / (f2 + f3);
        if (Math.abs(newRate - rate) < epsMax) close = true;
        iter++;
        rate = newRate;
      }
      if (!close) return formula.error.nm;
      return rate;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "CUMPRINC": function () {
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
      //利率
      var rate = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(rate)) {
        return rate;
      }
      if (!isRealNum(rate)) {
        return formula.error.v;
      }
      rate = parseFloat(rate);

      //总付款期数
      var nper = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(nper)) {
        return nper;
      }
      if (!isRealNum(nper)) {
        return formula.error.v;
      }
      nper = parseFloat(nper);

      //年金的现值
      var pv = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(pv)) {
        return pv;
      }
      if (!isRealNum(pv)) {
        return formula.error.v;
      }
      pv = parseFloat(pv);

      //首期
      var start_period = func_methods.getFirstValue(arguments[3]);
      if (valueIsError(start_period)) {
        return start_period;
      }
      if (!isRealNum(start_period)) {
        return formula.error.v;
      }
      start_period = parseInt(start_period);

      //末期
      var end_period = func_methods.getFirstValue(arguments[4]);
      if (valueIsError(end_period)) {
        return end_period;
      }
      if (!isRealNum(end_period)) {
        return formula.error.v;
      }
      end_period = parseInt(end_period);

      //指定各期的付款时间是在期初还是期末
      var type = func_methods.getFirstValue(arguments[5]);
      if (valueIsError(type)) {
        return type;
      }
      if (!isRealNum(type)) {
        return formula.error.v;
      }
      type = parseFloat(type);
      if (rate <= 0 || nper <= 0 || pv <= 0) {
        return formula.error.nm;
      }
      if (start_period < 1 || end_period < 1 || start_period > end_period) {
        return formula.error.nm;
      }
      if (type != 0 && type != 1) {
        return formula.error.nm;
      }

      //计算
      var payment = window.luckysheet_function.PMT.f(rate, nper, pv, 0, type);
      var principal = 0;
      if (start_period === 1) {
        if (type === 0) {
          principal = payment + pv * rate;
        } else {
          principal = payment;
        }
        start_period++;
      }
      for (var i = start_period; i <= end_period; i++) {
        if (type > 0) {
          principal += payment - (window.luckysheet_function.FV.f(rate, i - 2, payment, pv, 1) - payment) * rate;
        } else {
          principal += payment - window.luckysheet_function.FV.f(rate, i - 1, payment, pv, 0) * rate;
        }
      }
      return principal;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "PV": function () {
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
      //利率
      var rate = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(rate)) {
        return rate;
      }
      if (!isRealNum(rate)) {
        return formula.error.v;
      }
      rate = parseFloat(rate);

      //总付款期数
      var nper = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(nper)) {
        return nper;
      }
      if (!isRealNum(nper)) {
        return formula.error.v;
      }
      nper = parseFloat(nper);

      //每期的付款金额
      var pmt = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(pmt)) {
        return pmt;
      }
      if (!isRealNum(pmt)) {
        return formula.error.v;
      }
      pmt = parseFloat(pmt);

      //最后一次付款后希望得到的现金余额
      var fv = 0;
      if (arguments.length >= 4) {
        fv = func_methods.getFirstValue(arguments[3]);
        if (valueIsError(fv)) {
          return fv;
        }
        if (!isRealNum(fv)) {
          return formula.error.v;
        }
        fv = parseFloat(fv);
      }

      //指定各期的付款时间是在期初还是期末
      var type = 0;
      if (arguments.length >= 5) {
        type = func_methods.getFirstValue(arguments[4]);
        if (valueIsError(type)) {
          return type;
        }
        if (!isRealNum(type)) {
          return formula.error.v;
        }
        type = parseFloat(type);
      }
      if (type != 0 && type != 1) {
        return formula.error.nm;
      }

      //计算
      if (rate === 0) {
        var result = -pmt * nper - fv;
      } else {
        var result = ((1 - Math.pow(1 + rate, nper)) / rate * pmt * (1 + rate * type) - fv) / Math.pow(1 + rate, nper);
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "FV": function () {
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
      //利率
      var rate = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(rate)) {
        return rate;
      }
      if (!isRealNum(rate)) {
        return formula.error.v;
      }
      rate = parseFloat(rate);

      //总付款期数
      var nper = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(nper)) {
        return nper;
      }
      if (!isRealNum(nper)) {
        return formula.error.v;
      }
      nper = parseFloat(nper);

      //每期的付款金额
      var pmt = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(pmt)) {
        return pmt;
      }
      if (!isRealNum(pmt)) {
        return formula.error.v;
      }
      pmt = parseFloat(pmt);

      //现值，或一系列未来付款的当前值的累积和
      var pv = 0;
      if (arguments.length >= 4) {
        pv = func_methods.getFirstValue(arguments[3]);
        if (valueIsError(pv)) {
          return pv;
        }
        if (!isRealNum(pv)) {
          return formula.error.v;
        }
        pv = parseFloat(pv);
      }

      //指定各期的付款时间是在期初还是期末
      var type = 0;
      if (arguments.length >= 5) {
        type = func_methods.getFirstValue(arguments[4]);
        if (valueIsError(type)) {
          return type;
        }
        if (!isRealNum(type)) {
          return formula.error.v;
        }
        type = parseFloat(type);
      }
      if (type != 0 && type != 1) {
        return formula.error.nm;
      }

      //计算
      var result;
      if (rate === 0) {
        result = pv + pmt * nper;
      } else {
        var term = Math.pow(1 + rate, nper);
        if (type === 1) {
          result = pv * term + pmt * (1 + rate) * (term - 1) / rate;
        } else {
          result = pv * term + pmt * (term - 1) / rate;
        }
      }
      return -result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "FVSCHEDULE": function () {
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
      //现值
      var principal = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(principal)) {
        return principal;
      }
      if (!isRealNum(principal)) {
        return formula.error.v;
      }
      principal = parseFloat(principal);

      //一组利率
      var data_schedule = arguments[1];
      var schedule = [];
      if (getObjType(data_schedule) == "array") {
        if (getObjType(data_schedule[0]) == "array" && !func_methods.isDyadicArr(data_schedule)) {
          return formula.error.v;
        }
        schedule = schedule.concat(func_methods.getDataArr(data_schedule, false));
      } else if (getObjType(data_schedule) == "object" && data_schedule.startCell != null) {
        schedule = schedule.concat(func_methods.getCellDataArr(data_schedule, "number", false));
      } else {
        schedule.push(data_schedule);
      }
      var schedule_n = [];
      for (var i = 0; i < schedule.length; i++) {
        var number = schedule[i];
        if (!isRealNum(number)) {
          return formula.error.v;
        }
        schedule_n.push(parseFloat(number));
      }

      //计算
      var n = schedule_n.length;
      var future = principal;
      for (var i = 0; i < n; i++) {
        future *= 1 + schedule_n[i];
      }
      return future;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "NOMINAL": function () {
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
      //每年的实际利率
      var effect_rate = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(effect_rate)) {
        return effect_rate;
      }
      if (!isRealNum(effect_rate)) {
        return formula.error.v;
      }
      effect_rate = parseFloat(effect_rate);

      //每年的复利期数
      var npery = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(npery)) {
        return npery;
      }
      if (!isRealNum(npery)) {
        return formula.error.v;
      }
      npery = parseInt(npery);
      if (effect_rate <= 0 || npery < 1) {
        return formula.error.nm;
      }
      return (Math.pow(effect_rate + 1, 1 / npery) - 1) * npery;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "XIRR": function () {
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
      //投资相关收益或支出的数组或范围
      var data_values = arguments[0];
      var values = [];
      if (getObjType(data_values) == "array") {
        if (getObjType(data_values[0]) == "array" && !func_methods.isDyadicArr(data_values)) {
          return formula.error.v;
        }
        values = values.concat(func_methods.getDataArr(data_values, false));
      } else if (getObjType(data_values) == "object" && data_values.startCell != null) {
        values = values.concat(func_methods.getCellDataArr(data_values, "number", false));
      } else {
        values.push(data_values);
      }
      var values_n = [];
      for (var i = 0; i < values.length; i++) {
        var number = values[i];
        if (!isRealNum(number)) {
          return formula.error.v;
        }
        values_n.push(parseFloat(number));
      }

      //与现金流数额参数中的现金流对应的日期数组或范围
      var dates = func_methods.getCellrangeDate(arguments[1]);
      if (valueIsError(dates)) {
        return dates;
      }
      for (var i = 0; i < dates.length; i++) {
        if (!dayjs(dates[i]).isValid()) {
          return formula.error.v;
        }
      }

      //对内部回报率的估算值
      var guess = 0.1;
      if (arguments.length == 3) {
        guess = func_methods.getFirstValue(arguments[2]);
        if (valueIsError(guess)) {
          return guess;
        }
        if (!isRealNum(guess)) {
          return formula.error.v;
        }
        guess = parseFloat(guess);
      }
      var positive = false;
      var negative = false;
      for (var i = 0; i < values_n.length; i++) {
        if (values_n[i] > 0) {
          positive = true;
        }
        if (values_n[i] < 0) {
          negative = true;
        }
        if (positive && negative) {
          break;
        }
      }
      if (!positive || !negative) {
        return formula.error.nm;
      }
      if (values_n.length != dates.length) {
        return formula.error.nm;
      }

      //计算
      var irrResult = function (values, dates, rate) {
        var r = rate + 1;
        var result = values[0];
        for (var i = 1; i < values.length; i++) {
          result += values[i] / Math.pow(r, window.luckysheet_function.DAYS.f(dates[i], dates[0]) / 365);
        }
        return result;
      };
      var irrResultDeriv = function (values, dates, rate) {
        var r = rate + 1;
        var result = 0;
        for (var i = 1; i < values.length; i++) {
          var frac = window.luckysheet_function.DAYS.f(dates[i], dates[0]) / 365;
          result -= frac * values[i] / Math.pow(r, frac + 1);
        }
        return result;
      };
      var resultRate = guess;
      var epsMax = 1e-10;
      var newRate, epsRate, resultValue;
      var contLoop = true;
      do {
        resultValue = irrResult(values_n, dates, resultRate);
        newRate = resultRate - resultValue / irrResultDeriv(values_n, dates, resultRate);
        epsRate = Math.abs(newRate - resultRate);
        resultRate = newRate;
        contLoop = epsRate > epsMax && Math.abs(resultValue) > epsMax;
      } while (contLoop);
      return resultRate;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "MIRR": function () {
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
      //投资相关收益或支出的数组或范围
      var data_values = arguments[0];
      var values = [];
      if (getObjType(data_values) == "array") {
        if (getObjType(data_values[0]) == "array" && !func_methods.isDyadicArr(data_values)) {
          return formula.error.v;
        }
        values = values.concat(func_methods.getDataArr(data_values, false));
      } else if (getObjType(data_values) == "object" && data_values.startCell != null) {
        values = values.concat(func_methods.getCellDataArr(data_values, "number", false));
      } else {
        values.push(data_values);
      }
      var values_n = [];
      for (var i = 0; i < values.length; i++) {
        var number = values[i];
        if (!isRealNum(number)) {
          return formula.error.v;
        }
        values_n.push(parseFloat(number));
      }

      //现金流中使用的资金支付的利率
      var finance_rate = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(finance_rate)) {
        return finance_rate;
      }
      if (!isRealNum(finance_rate)) {
        return formula.error.v;
      }
      finance_rate = parseFloat(finance_rate);

      //将现金流再投资的收益率
      var reinvest_rate = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(reinvest_rate)) {
        return reinvest_rate;
      }
      if (!isRealNum(reinvest_rate)) {
        return formula.error.v;
      }
      reinvest_rate = parseFloat(reinvest_rate);

      //计算
      var n = values_n.length;
      var payments = [];
      var incomes = [];
      for (var i = 0; i < n; i++) {
        if (values_n[i] < 0) {
          payments.push(values_n[i]);
        } else {
          incomes.push(values_n[i]);
        }
      }
      if (payments.length == 0 || incomes.length == 0) {
        return formula.error.d;
      }
      var num = -window.luckysheet_function.NPV.f(reinvest_rate, incomes) * Math.pow(1 + reinvest_rate, n - 1);
      var den = window.luckysheet_function.NPV.f(finance_rate, payments) * (1 + finance_rate);
      return Math.pow(num / den, 1 / (n - 1)) - 1;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "IRR": function () {
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
      //投资相关收益或支出的数组或范围
      var data_values = arguments[0];
      var values = [];
      if (getObjType(data_values) == "array") {
        if (getObjType(data_values[0]) == "array" && !func_methods.isDyadicArr(data_values)) {
          return formula.error.v;
        }
        values = values.concat(func_methods.getDataArr(data_values, false));
      } else if (getObjType(data_values) == "object" && data_values.startCell != null) {
        values = values.concat(func_methods.getCellDataArr(data_values, "number", true));
      } else {
        values.push(data_values);
      }
      var values_n = [];
      for (var i = 0; i < values.length; i++) {
        var number = values[i];
        if (!isRealNum(number)) {
          return formula.error.v;
        }
        values_n.push(parseFloat(number));
      }

      //对内部回报率的估算值
      var guess = 0.1;
      if (arguments.length == 2) {
        guess = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(guess)) {
          return guess;
        }
        if (!isRealNum(guess)) {
          return formula.error.v;
        }
        guess = parseFloat(guess);
      }
      var dates = [];
      var positive = false;
      var negative = false;
      for (var i = 0; i < values.length; i++) {
        dates[i] = i === 0 ? 0 : dates[i - 1] + 365;
        if (values[i] > 0) {
          positive = true;
        }
        if (values[i] < 0) {
          negative = true;
        }
      }
      if (!positive || !negative) {
        return formula.error.nm;
      }

      //计算
      var irrResult = function (values, dates, rate) {
        var r = rate + 1;
        var result = values[0];
        for (var i = 1; i < values.length; i++) {
          // result += values[i] / Math.pow(r, window.luckysheet_function.DAYS.f(dates[i], dates[0]) / 365);
          result += values[i] / Math.pow(r, (dates[i] - dates[0]) / 365);
        }
        return result;
      };
      var irrResultDeriv = function (values, dates, rate) {
        var r = rate + 1;
        var result = 0;
        for (var i = 1; i < values.length; i++) {
          // var frac = window.luckysheet_function.DAYS.f(dates[i], dates[0]) / 365;
          var frac = (dates[i] - dates[0]) / 365;
          result -= frac * values[i] / Math.pow(r, frac + 1);
        }
        return result;
      };
      var resultRate = guess;
      var epsMax = 1e-10;
      var newRate, epsRate, resultValue;
      var contLoop = true;
      do {
        resultValue = irrResult(values_n, dates, resultRate);
        newRate = resultRate - resultValue / irrResultDeriv(values_n, dates, resultRate);
        epsRate = Math.abs(newRate - resultRate);
        resultRate = newRate;
        contLoop = epsRate > epsMax && Math.abs(resultValue) > epsMax;
      } while (contLoop);
      return resultRate;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "NPV": function () {
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
      //某一期间的贴现率
      var rate = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(rate)) {
        return rate;
      }
      if (!isRealNum(rate)) {
        return formula.error.v;
      }
      rate = parseFloat(rate);

      //支出（负值）和收益（正值）
      var values = [];
      for (var i = 1; i < arguments.length; i++) {
        var data = arguments[i];
        if (getObjType(data) == "array") {
          if (getObjType(data[0]) == "array" && !func_methods.isDyadicArr(data)) {
            return formula.error.v;
          }
          values = values.concat(func_methods.getDataArr(data, true));
        } else if (getObjType(data) == "object" && data.startCell != null) {
          values = values.concat(func_methods.getCellDataArr(data, "number", true));
        } else {
          values.push(data);
        }
      }
      var values_n = [];
      for (var i = 0; i < values.length; i++) {
        var number = values[i];
        if (isRealNum(number)) {
          values_n.push(parseFloat(number));
        }
      }

      //计算
      var result = 0;
      if (values_n.length > 0) {
        for (var i = 0; i < values_n.length; i++) {
          result += values_n[i] / Math.pow(1 + rate, i + 1);
        }
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "XNPV": function () {
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
      //应用于现金流的贴现率
      var rate = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(rate)) {
        return rate;
      }
      if (!isRealNum(rate)) {
        return formula.error.v;
      }
      rate = parseFloat(rate);

      //与 dates 中的支付时间相对应的一系列现金流
      var data_values = arguments[1];
      var values = [];
      if (getObjType(data_values) == "array") {
        if (getObjType(data_values[0]) == "array" && !func_methods.isDyadicArr(data_values)) {
          return formula.error.v;
        }
        values = values.concat(func_methods.getDataArr(data_values, false));
      } else if (getObjType(data_values) == "object" && data_values.startCell != null) {
        values = values.concat(func_methods.getCellDataArr(data_values, "number", false));
      } else {
        values.push(data_values);
      }
      var values_n = [];
      for (var i = 0; i < values.length; i++) {
        var number = values[i];
        if (!isRealNum(number)) {
          return formula.error.v;
        }
        values_n.push(parseFloat(number));
      }

      //与现金流支付相对应的支付日期表
      var dates = func_methods.getCellrangeDate(arguments[2]);
      if (valueIsError(dates)) {
        return dates;
      }
      for (var i = 0; i < dates.length; i++) {
        if (!dayjs(dates[i]).isValid()) {
          return formula.error.v;
        }
      }
      if (values_n.length != dates.length) {
        return formula.error.nm;
      }

      //计算
      var result = 0;
      for (var i = 0; i < values_n.length; i++) {
        result += values_n[i] / Math.pow(1 + rate, window.luckysheet_function.DAYS.f(dates[i], dates[0]) / 365);
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "CUMIPMT": function () {
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
      //利率
      var rate = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(rate)) {
        return rate;
      }
      if (!isRealNum(rate)) {
        return formula.error.v;
      }
      rate = parseFloat(rate);

      //总付款期数
      var nper = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(nper)) {
        return nper;
      }
      if (!isRealNum(nper)) {
        return formula.error.v;
      }
      nper = parseFloat(nper);

      //年金的现值
      var pv = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(pv)) {
        return pv;
      }
      if (!isRealNum(pv)) {
        return formula.error.v;
      }
      pv = parseFloat(pv);

      //首期
      var start_period = func_methods.getFirstValue(arguments[3]);
      if (valueIsError(start_period)) {
        return start_period;
      }
      if (!isRealNum(start_period)) {
        return formula.error.v;
      }
      start_period = parseInt(start_period);

      //末期
      var end_period = func_methods.getFirstValue(arguments[4]);
      if (valueIsError(end_period)) {
        return end_period;
      }
      if (!isRealNum(end_period)) {
        return formula.error.v;
      }
      end_period = parseInt(end_period);

      //指定各期的付款时间是在期初还是期末
      var type = func_methods.getFirstValue(arguments[5]);
      if (valueIsError(type)) {
        return type;
      }
      if (!isRealNum(type)) {
        return formula.error.v;
      }
      type = parseFloat(type);
      if (rate <= 0 || nper <= 0 || pv <= 0) {
        return formula.error.nm;
      }
      if (start_period < 1 || end_period < 1 || start_period > end_period) {
        return formula.error.nm;
      }
      if (type != 0 && type != 1) {
        return formula.error.nm;
      }

      //计算
      var payment = window.luckysheet_function.PMT.f(rate, nper, pv, 0, type);
      var interest = 0;
      if (start_period === 1) {
        if (type === 0) {
          interest = -pv;
          start_period++;
        }
      }
      for (var i = start_period; i <= end_period; i++) {
        if (type === 1) {
          interest += window.luckysheet_function.FV.f(rate, i - 2, payment, pv, 1) - payment;
        } else {
          interest += window.luckysheet_function.FV.f(rate, i - 1, payment, pv, 0);
        }
      }
      interest *= rate;
      return interest;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "PMT": function () {
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
      //贷款利率
      var rate = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(rate)) {
        return rate;
      }
      if (!isRealNum(rate)) {
        return formula.error.v;
      }
      rate = parseFloat(rate);

      //该项贷款的付款总数
      var nper = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(nper)) {
        return nper;
      }
      if (!isRealNum(nper)) {
        return formula.error.v;
      }
      nper = parseFloat(nper);

      //现值
      var pv = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(pv)) {
        return pv;
      }
      if (!isRealNum(pv)) {
        return formula.error.v;
      }
      pv = parseFloat(pv);

      //最后一次付款后希望得到的现金余额
      var fv = 0;
      if (arguments.length >= 4) {
        fv = func_methods.getFirstValue(arguments[3]);
        if (valueIsError(fv)) {
          return fv;
        }
        if (!isRealNum(fv)) {
          return formula.error.v;
        }
        fv = parseFloat(fv);
      }

      //指定各期的付款时间是在期初还是期末
      var type = 0;
      if (arguments.length == 5) {
        type = func_methods.getFirstValue(arguments[4]);
        if (valueIsError(type)) {
          return type;
        }
        if (!isRealNum(type)) {
          return formula.error.v;
        }
        type = parseFloat(type);
      }
      if (type != 0 && type != 1) {
        return formula.error.nm;
      }

      //计算
      var result;
      if (rate === 0) {
        result = (pv + fv) / nper;
      } else {
        var term = Math.pow(1 + rate, nper);
        if (type === 1) {
          result = (fv * rate / (term - 1) + pv * rate / (1 - 1 / term)) / (1 + rate);
        } else {
          result = fv * rate / (term - 1) + pv * rate / (1 - 1 / term);
        }
      }
      return -result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "IPMT": function () {
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
      //利率
      var rate = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(rate)) {
        return rate;
      }
      if (!isRealNum(rate)) {
        return formula.error.v;
      }
      rate = parseFloat(rate);

      //用于计算其利息数额的期数
      var per = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(per)) {
        return per;
      }
      if (!isRealNum(per)) {
        return formula.error.v;
      }
      per = parseFloat(per);

      //总付款期数
      var nper = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(nper)) {
        return nper;
      }
      if (!isRealNum(nper)) {
        return formula.error.v;
      }
      nper = parseFloat(nper);

      //现值
      var pv = func_methods.getFirstValue(arguments[3]);
      if (valueIsError(pv)) {
        return pv;
      }
      if (!isRealNum(pv)) {
        return formula.error.v;
      }
      pv = parseFloat(pv);

      //最后一次付款后希望得到的现金余额
      var fv = 0;
      if (arguments.length >= 5) {
        fv = func_methods.getFirstValue(arguments[4]);
        if (valueIsError(fv)) {
          return fv;
        }
        if (!isRealNum(fv)) {
          return formula.error.v;
        }
        fv = parseFloat(fv);
      }

      //指定各期的付款时间是在期初还是期末
      var type = 0;
      if (arguments.length >= 6) {
        type = func_methods.getFirstValue(arguments[5]);
        if (valueIsError(type)) {
          return type;
        }
        if (!isRealNum(type)) {
          return formula.error.v;
        }
        type = parseFloat(type);
      }
      if (per < 1 || per > nper) {
        return formula.error.nm;
      }
      if (type != 0 && type != 1) {
        return formula.error.nm;
      }

      //计算
      var payment = window.luckysheet_function.PMT.f(rate, nper, pv, fv, type);
      var interest;
      if (per === 1) {
        if (type === 1) {
          interest = 0;
        } else {
          interest = -pv;
        }
      } else {
        if (type === 1) {
          interest = window.luckysheet_function.FV.f(rate, per - 2, payment, pv, 1) - payment;
        } else {
          interest = window.luckysheet_function.FV.f(rate, per - 1, payment, pv, 0);
        }
      }
      var result = interest * rate;
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "PPMT": function () {
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
      //利率
      var rate = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(rate)) {
        return rate;
      }
      if (!isRealNum(rate)) {
        return formula.error.v;
      }
      rate = parseFloat(rate);

      //用于计算其利息数额的期数
      var per = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(per)) {
        return per;
      }
      if (!isRealNum(per)) {
        return formula.error.v;
      }
      per = parseFloat(per);

      //总付款期数
      var nper = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(nper)) {
        return nper;
      }
      if (!isRealNum(nper)) {
        return formula.error.v;
      }
      nper = parseFloat(nper);

      //现值
      var pv = func_methods.getFirstValue(arguments[3]);
      if (valueIsError(pv)) {
        return pv;
      }
      if (!isRealNum(pv)) {
        return formula.error.v;
      }
      pv = parseFloat(pv);

      //最后一次付款后希望得到的现金余额
      var fv = 0;
      if (arguments.length >= 5) {
        fv = func_methods.getFirstValue(arguments[4]);
        if (valueIsError(fv)) {
          return fv;
        }
        if (!isRealNum(fv)) {
          return formula.error.v;
        }
        fv = parseFloat(fv);
      }

      //指定各期的付款时间是在期初还是期末
      var type = 0;
      if (arguments.length >= 6) {
        type = func_methods.getFirstValue(arguments[5]);
        if (valueIsError(type)) {
          return type;
        }
        if (!isRealNum(type)) {
          return formula.error.v;
        }
        type = parseFloat(type);
      }
      if (per < 1 || per > nper) {
        return formula.error.nm;
      }
      if (type != 0 && type != 1) {
        return formula.error.nm;
      }

      //计算
      var payment = window.luckysheet_function.PMT.f(rate, nper, pv, fv, type);
      var payment2 = window.luckysheet_function.IPMT.f(rate, per, nper, pv, fv, type);
      return payment - payment2;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "NPER": function () {
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
      //利率
      var rate = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(rate)) {
        return rate;
      }
      if (!isRealNum(rate)) {
        return formula.error.v;
      }
      rate = parseFloat(rate);

      //各期所应支付的金额
      var pmt = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(pmt)) {
        return pmt;
      }
      if (!isRealNum(pmt)) {
        return formula.error.v;
      }
      pmt = parseFloat(pmt);

      //现值
      var pv = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(pv)) {
        return pv;
      }
      if (!isRealNum(pv)) {
        return formula.error.v;
      }
      pv = parseFloat(pv);

      //最后一次付款后希望得到的现金余额
      var fv = 0;
      if (arguments.length >= 4) {
        fv = func_methods.getFirstValue(arguments[3]);
        if (valueIsError(fv)) {
          return fv;
        }
        if (!isRealNum(fv)) {
          return formula.error.v;
        }
        fv = parseFloat(fv);
      }

      //指定各期的付款时间是在期初还是期末
      var type = 0;
      if (arguments.length >= 5) {
        type = func_methods.getFirstValue(arguments[4]);
        if (valueIsError(type)) {
          return type;
        }
        if (!isRealNum(type)) {
          return formula.error.v;
        }
        type = parseFloat(type);
      }
      if (type != 0 && type != 1) {
        return formula.error.nm;
      }

      //计算
      var num = pmt * (1 + rate * type) - fv * rate;
      var den = pv * rate + pmt * (1 + rate * type);
      return Math.log(num / den) / Math.log(1 + rate);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
};

export default financialCashflow;
