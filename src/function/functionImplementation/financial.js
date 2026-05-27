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
const financialFunctions = {
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
  "DB": function () {
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
      //资产原值
      var cost = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(cost)) {
        return cost;
      }
      if (!isRealNum(cost)) {
        return formula.error.v;
      }
      cost = parseFloat(cost);

      //资产残值
      var salvage = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(salvage)) {
        return salvage;
      }
      if (!isRealNum(salvage)) {
        return formula.error.v;
      }
      salvage = parseFloat(salvage);

      //资产的折旧期数
      var life = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(life)) {
        return life;
      }
      if (!isRealNum(life)) {
        return formula.error.v;
      }
      life = parseFloat(life);

      //在使用期限内要计算折旧的折旧期
      var period = func_methods.getFirstValue(arguments[3]);
      if (valueIsError(period)) {
        return period;
      }
      if (!isRealNum(period)) {
        return formula.error.v;
      }
      period = parseInt(period);

      //折旧第一年中的月数
      var month = 12;
      if (arguments.length == 5) {
        month = func_methods.getFirstValue(arguments[4]);
        if (valueIsError(month)) {
          return month;
        }
        if (!isRealNum(month)) {
          return formula.error.v;
        }
        month = parseInt(month);
      }
      if (cost < 0 || salvage < 0 || life < 0 || period < 0) {
        return formula.error.nm;
      }
      if (month < 1 || month > 12) {
        return formula.error.nm;
      }
      if (period > life) {
        return formula.error.nm;
      }
      if (salvage >= cost) {
        return 0;
      }

      //计算
      var rate = (1 - Math.pow(salvage / cost, 1 / life)).toFixed(3);
      var initial = cost * rate * month / 12;
      var total = initial;
      var current = 0;
      var ceiling = period === life ? life - 1 : period;
      for (var i = 2; i <= ceiling; i++) {
        current = (cost - total) * rate;
        total += current;
      }
      if (period === 1) {
        var result = initial;
      } else if (period === life) {
        var result = (cost - total) * rate;
      } else {
        var result = current;
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DDB": function () {
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
      //资产原值
      var cost = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(cost)) {
        return cost;
      }
      if (!isRealNum(cost)) {
        return formula.error.v;
      }
      cost = parseFloat(cost);

      //资产残值
      var salvage = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(salvage)) {
        return salvage;
      }
      if (!isRealNum(salvage)) {
        return formula.error.v;
      }
      salvage = parseFloat(salvage);

      //资产的折旧期数
      var life = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(life)) {
        return life;
      }
      if (!isRealNum(life)) {
        return formula.error.v;
      }
      life = parseFloat(life);

      //在使用期限内要计算折旧的折旧期
      var period = func_methods.getFirstValue(arguments[3]);
      if (valueIsError(period)) {
        return period;
      }
      if (!isRealNum(period)) {
        return formula.error.v;
      }
      period = parseInt(period);

      //折旧的递减系数
      var factor = 2;
      if (arguments.length == 5) {
        factor = func_methods.getFirstValue(arguments[4]);
        if (valueIsError(factor)) {
          return factor;
        }
        if (!isRealNum(factor)) {
          return formula.error.v;
        }
        factor = parseFloat(factor);
      }
      if (cost < 0 || salvage < 0 || life < 0 || period < 0 || factor <= 0) {
        return formula.error.nm;
      }
      if (period > life) {
        return formula.error.nm;
      }
      if (salvage >= cost) {
        return 0;
      }

      //计算
      var total = 0;
      var current = 0;
      for (var i = 1; i <= period; i++) {
        current = Math.min((cost - total) * (factor / life), cost - salvage - total);
        total += current;
      }
      return current;
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
  "COUPNUM": function () {
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
      //结算日
      var settlement = func_methods.getCellDate(arguments[0]);
      if (valueIsError(settlement)) {
        return settlement;
      }
      if (!dayjs(settlement).isValid()) {
        return formula.error.v;
      }

      //到期日
      var maturity = func_methods.getCellDate(arguments[1]);
      if (valueIsError(maturity)) {
        return maturity;
      }
      if (!dayjs(maturity).isValid()) {
        return formula.error.v;
      }

      //年付息次数
      var frequency = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(frequency)) {
        return frequency;
      }
      if (!isRealNum(frequency)) {
        return formula.error.v;
      }
      frequency = parseInt(frequency);

      //日计数基准类型
      var basis = 0;
      if (arguments.length == 4) {
        var basis = func_methods.getFirstValue(arguments[3]);
        if (valueIsError(basis)) {
          return basis;
        }
        if (!isRealNum(basis)) {
          return formula.error.v;
        }
        basis = parseInt(basis);
      }
      if (frequency != 1 && frequency != 2 && frequency != 4) {
        return formula.error.nm;
      }
      if (basis < 0 || basis > 4) {
        return formula.error.nm;
      }
      if (dayjs(settlement) - dayjs(maturity) >= 0) {
        return formula.error.nm;
      }

      //计算
      var sd = dayjs(settlement).date();
      var sm = dayjs(settlement).month() + 1;
      var sy = dayjs(settlement).year();
      var ed = dayjs(maturity).date();
      var em = dayjs(maturity).month() + 1;
      var ey = dayjs(maturity).year();
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
          result = (ed + em * 30 + ey * 360 - (sd + sm * 30 + sy * 360)) / (360 / frequency);
          break;
        case 1:
          // Actual/actual
          var ylength = 365;
          if (sy === ey || sy + 1 === ey && (sm > em || sm === em && sd >= ed)) {
            if (sy === ey && func_methods.isLeapYear(sy) || func_methods.feb29Between(settlement, maturity) || em === 1 && ed === 29) {
              ylength = 366;
            }
            return dayjs(maturity).diff(dayjs(settlement), 'days') / (ylength / frequency);
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
          result = dayjs(maturity).diff(dayjs(settlement), 'days') / (average / frequency);
          break;
        case 2:
          // Actual/360
          result = dayjs(maturity).diff(dayjs(settlement), 'days') / (360 / frequency);
          break;
        case 3:
          // Actual/365
          result = dayjs(maturity).diff(dayjs(settlement), 'days') / (365 / frequency);
          break;
        case 4:
          // European 30/360
          result = (ed + em * 30 + ey * 360 - (sd + sm * 30 + sy * 360)) / (360 / frequency);
          break;
      }
      return Math.round(result);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "SYD": function () {
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
      //资产原值
      var cost = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(cost)) {
        return cost;
      }
      if (!isRealNum(cost)) {
        return formula.error.v;
      }
      cost = parseFloat(cost);

      //资产残值
      var salvage = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(salvage)) {
        return salvage;
      }
      if (!isRealNum(salvage)) {
        return formula.error.v;
      }
      salvage = parseFloat(salvage);

      //资产的折旧期数
      var life = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(life)) {
        return life;
      }
      if (!isRealNum(life)) {
        return formula.error.v;
      }
      life = parseFloat(life);

      //在使用期限内要计算折旧的折旧期
      var period = func_methods.getFirstValue(arguments[3]);
      if (valueIsError(period)) {
        return period;
      }
      if (!isRealNum(period)) {
        return formula.error.v;
      }
      period = parseInt(period);
      if (life == 0) {
        return formula.error.nm;
      }
      if (period < 1 || period > life) {
        return formula.error.nm;
      }
      return (cost - salvage) * (life - period + 1) * 2 / (life * (life + 1));
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "TBILLEQ": function () {
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
      //结算日
      var settlement = func_methods.getCellDate(arguments[0]);
      if (valueIsError(settlement)) {
        return settlement;
      }
      if (!dayjs(settlement).isValid()) {
        return formula.error.v;
      }

      //到期日
      var maturity = func_methods.getCellDate(arguments[1]);
      if (valueIsError(maturity)) {
        return maturity;
      }
      if (!dayjs(maturity).isValid()) {
        return formula.error.v;
      }

      //债券购买时的贴现率
      var discount = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(discount)) {
        return discount;
      }
      if (!isRealNum(discount)) {
        return formula.error.v;
      }
      discount = parseFloat(discount);
      if (discount <= 0) {
        return formula.error.nm;
      }
      if (dayjs(settlement) - dayjs(maturity) > 0) {
        return formula.error.nm;
      }
      if (dayjs(maturity) - dayjs(settlement) > 365 * 24 * 60 * 60 * 1000) {
        return formula.error.nm;
      }
      return 365 * discount / (360 - discount * dayjs(maturity).diff(dayjs(settlement), 'days'));
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "TBILLYIELD": function () {
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
      //结算日
      var settlement = func_methods.getCellDate(arguments[0]);
      if (valueIsError(settlement)) {
        return settlement;
      }
      if (!dayjs(settlement).isValid()) {
        return formula.error.v;
      }

      //到期日
      var maturity = func_methods.getCellDate(arguments[1]);
      if (valueIsError(maturity)) {
        return maturity;
      }
      if (!dayjs(maturity).isValid()) {
        return formula.error.v;
      }

      //有价证券的价格
      var pr = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(pr)) {
        return pr;
      }
      if (!isRealNum(pr)) {
        return formula.error.v;
      }
      pr = parseFloat(pr);
      if (pr <= 0) {
        return formula.error.nm;
      }
      if (dayjs(settlement) - dayjs(maturity) >= 0) {
        return formula.error.nm;
      }
      if (dayjs(maturity) - dayjs(settlement) > 365 * 24 * 60 * 60 * 1000) {
        return formula.error.nm;
      }
      return (100 - pr) / pr * (360 / dayjs(maturity).diff(dayjs(settlement), 'days'));
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "TBILLPRICE": function () {
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
      //结算日
      var settlement = func_methods.getCellDate(arguments[0]);
      if (valueIsError(settlement)) {
        return settlement;
      }
      if (!dayjs(settlement).isValid()) {
        return formula.error.v;
      }

      //到期日
      var maturity = func_methods.getCellDate(arguments[1]);
      if (valueIsError(maturity)) {
        return maturity;
      }
      if (!dayjs(maturity).isValid()) {
        return formula.error.v;
      }

      //有价证券的价格
      var discount = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(discount)) {
        return discount;
      }
      if (!isRealNum(discount)) {
        return formula.error.v;
      }
      discount = parseFloat(discount);
      if (discount <= 0) {
        return formula.error.nm;
      }
      if (dayjs(settlement) - dayjs(maturity) > 0) {
        return formula.error.nm;
      }
      if (dayjs(maturity) - dayjs(settlement) > 365 * 24 * 60 * 60 * 1000) {
        return formula.error.nm;
      }
      return 100 * (1 - discount * dayjs(maturity).diff(dayjs(settlement), 'days') / 360);
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
  "ACCRINT": function () {
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
      //有价证券的发行日
      var issue = func_methods.getCellDate(arguments[0]);
      if (valueIsError(issue)) {
        return issue;
      }
      if (!dayjs(issue).isValid()) {
        return formula.error.v;
      }

      //有价证券的首次计息日
      var first_interest = func_methods.getCellDate(arguments[1]);
      if (valueIsError(first_interest)) {
        return first_interest;
      }
      if (!dayjs(first_interest).isValid()) {
        return formula.error.v;
      }

      //有价证券的结算日
      var settlement = func_methods.getCellDate(arguments[2]);
      if (valueIsError(settlement)) {
        return settlement;
      }
      if (!dayjs(settlement).isValid()) {
        return formula.error.v;
      }

      //有价证券的年息票利率
      var rate = func_methods.getFirstValue(arguments[3]);
      if (valueIsError(rate)) {
        return rate;
      }
      if (!isRealNum(rate)) {
        return formula.error.v;
      }
      rate = parseFloat(rate);

      //证券的票面值
      var par = func_methods.getFirstValue(arguments[4]);
      if (valueIsError(par)) {
        return par;
      }
      if (!isRealNum(par)) {
        return formula.error.v;
      }
      par = parseFloat(par);

      //年付息次数
      var frequency = func_methods.getFirstValue(arguments[5]);
      if (valueIsError(frequency)) {
        return frequency;
      }
      if (!isRealNum(frequency)) {
        return formula.error.v;
      }
      frequency = parseInt(frequency);

      //日计数基准类型
      var basis = 0;
      if (arguments.length >= 7) {
        basis = func_methods.getFirstValue(arguments[6]);
        if (valueIsError(basis)) {
          return basis;
        }
        if (!isRealNum(basis)) {
          return formula.error.v;
        }
        basis = parseInt(basis);
      }

      //当结算日期晚于首次计息日期时用于计算总应计利息的方法
      var calc_method = true;
      if (arguments.length == 8) {
        calc_method = func_methods.getCellBoolen(arguments[7]);
        if (valueIsError(calc_method)) {
          return calc_method;
        }
      }
      if (rate <= 0 || par <= 0) {
        return formula.error.nm;
      }
      if (frequency != 1 && frequency != 2 && frequency != 4) {
        return formula.error.nm;
      }
      if (basis < 0 || basis > 4) {
        return formula.error.nm;
      }
      if (dayjs(issue) - dayjs(settlement) >= 0) {
        return formula.error.nm;
      }

      //计算
      var result;
      if (dayjs(settlement) - dayjs(first_interest) >= 0 && !calc_method) {
        var sd = dayjs(first_interest).date();
        var sm = dayjs(first_interest).month() + 1;
        var sy = dayjs(first_interest).year();
        var ed = dayjs(settlement).date();
        var em = dayjs(settlement).month() + 1;
        var ey = dayjs(settlement).year();
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
              if (sy === ey && func_methods.isLeapYear(sy) || func_methods.feb29Between(first_interest, settlement) || em === 1 && ed === 29) {
                ylength = 366;
              }
              return dayjs(settlement).diff(dayjs(first_interest), 'days') / ylength;
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
            result = dayjs(settlement).diff(dayjs(first_interest), 'days') / average;
            break;
          case 2:
            // Actual/360
            result = dayjs(settlement).diff(dayjs(first_interest), 'days') / 360;
            break;
          case 3:
            // Actual/365
            result = dayjs(settlement).diff(dayjs(first_interest), 'days') / 365;
            break;
          case 4:
            // European 30/360
            result = (ed + em * 30 + ey * 360 - (sd + sm * 30 + sy * 360)) / 360;
            break;
        }
      } else {
        var sd = dayjs(issue).date();
        var sm = dayjs(issue).month() + 1;
        var sy = dayjs(issue).year();
        var ed = dayjs(settlement).date();
        var em = dayjs(settlement).month() + 1;
        var ey = dayjs(settlement).year();
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
              if (sy === ey && func_methods.isLeapYear(sy) || func_methods.feb29Between(issue, settlement) || em === 1 && ed === 29) {
                ylength = 366;
              }
              return dayjs(settlement).diff(dayjs(issue), 'days') / ylength;
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
            result = dayjs(settlement).diff(dayjs(issue), 'days') / average;
            break;
          case 2:
            // Actual/360
            result = dayjs(settlement).diff(dayjs(issue), 'days') / 360;
            break;
          case 3:
            // Actual/365
            result = dayjs(settlement).diff(dayjs(issue), 'days') / 365;
            break;
          case 4:
            // European 30/360
            result = (ed + em * 30 + ey * 360 - (sd + sm * 30 + sy * 360)) / 360;
            break;
        }
      }
      return par * rate * result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ACCRINTM": function () {
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
      //有价证券的发行日
      var issue = func_methods.getCellDate(arguments[0]);
      if (valueIsError(issue)) {
        return issue;
      }
      if (!dayjs(issue).isValid()) {
        return formula.error.v;
      }

      //有价证券的到期日
      var settlement = func_methods.getCellDate(arguments[1]);
      if (valueIsError(settlement)) {
        return settlement;
      }
      if (!dayjs(settlement).isValid()) {
        return formula.error.v;
      }

      //有价证券的年息票利率
      var rate = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(rate)) {
        return rate;
      }
      if (!isRealNum(rate)) {
        return formula.error.v;
      }
      rate = parseFloat(rate);

      //证券的票面值
      var par = func_methods.getFirstValue(arguments[3]);
      if (valueIsError(par)) {
        return par;
      }
      if (!isRealNum(par)) {
        return formula.error.v;
      }
      par = parseFloat(par);

      //日计数基准类型
      var basis = 0;
      if (arguments.length == 5) {
        basis = func_methods.getFirstValue(arguments[4]);
        if (valueIsError(basis)) {
          return basis;
        }
        if (!isRealNum(basis)) {
          return formula.error.v;
        }
        basis = parseInt(basis);
      }
      if (rate <= 0 || par <= 0) {
        return formula.error.nm;
      }
      if (basis < 0 || basis > 4) {
        return formula.error.nm;
      }
      if (dayjs(issue) - dayjs(settlement) >= 0) {
        return formula.error.nm;
      }

      //计算
      var sd = dayjs(issue).date();
      var sm = dayjs(issue).month() + 1;
      var sy = dayjs(issue).year();
      var ed = dayjs(settlement).date();
      var em = dayjs(settlement).month() + 1;
      var ey = dayjs(settlement).year();
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
            if (sy === ey && func_methods.isLeapYear(sy) || func_methods.feb29Between(issue, settlement) || em === 1 && ed === 29) {
              ylength = 366;
            }
            return dayjs(settlement).diff(dayjs(issue), 'days') / ylength;
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
          result = dayjs(settlement).diff(dayjs(issue), 'days') / average;
          break;
        case 2:
          // Actual/360
          result = dayjs(settlement).diff(dayjs(issue), 'days') / 360;
          break;
        case 3:
          // Actual/365
          result = dayjs(settlement).diff(dayjs(issue), 'days') / 365;
          break;
        case 4:
          // European 30/360
          result = (ed + em * 30 + ey * 360 - (sd + sm * 30 + sy * 360)) / 360;
          break;
      }
      return par * rate * result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "COUPDAYBS": function () {
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
      //结算日
      var settlement = func_methods.getCellDate(arguments[0]);
      if (valueIsError(settlement)) {
        return settlement;
      }
      if (!dayjs(settlement).isValid()) {
        return formula.error.v;
      }

      //到期日
      var maturity = func_methods.getCellDate(arguments[1]);
      if (valueIsError(maturity)) {
        return maturity;
      }
      if (!dayjs(maturity).isValid()) {
        return formula.error.v;
      }

      //年付息次数
      var frequency = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(frequency)) {
        return frequency;
      }
      if (!isRealNum(frequency)) {
        return formula.error.v;
      }
      frequency = parseInt(frequency);

      //日计数基准类型
      var basis = 0;
      if (arguments.length == 4) {
        basis = func_methods.getFirstValue(arguments[3]);
        if (valueIsError(basis)) {
          return basis;
        }
        if (!isRealNum(basis)) {
          return formula.error.v;
        }
        basis = parseInt(basis);
      }
      if (frequency != 1 && frequency != 2 && frequency != 4) {
        return formula.error.nm;
      }
      if (basis < 0 || basis > 4) {
        return formula.error.nm;
      }
      if (dayjs(settlement) - dayjs(maturity) >= 0) {
        return formula.error.nm;
      }

      //计算
      var interest; //结算日之前的上一个付息日

      var maxCount = Math.ceil(dayjs(maturity).diff(dayjs(settlement), 'months') / (12 / frequency)) + 1;
      for (var i = 1; i <= maxCount; i++) {
        var di = dayjs(maturity).subtract(12 / frequency * i, 'months');
        if (di <= dayjs(settlement)) {
          interest = di;
          break;
        }
      }
      var result;
      switch (basis) {
        case 0:
          // US (NASD) 30/360
          var sd = dayjs(interest).date();
          var sm = dayjs(interest).month() + 1;
          var sy = dayjs(interest).year();
          var ed = dayjs(settlement).date();
          var em = dayjs(settlement).month() + 1;
          var ey = dayjs(settlement).year();
          if (sd === 31 && ed === 31) {
            sd = 30;
            ed = 30;
          } else if (sd === 31) {
            sd = 30;
          } else if (sd === 30 && ed === 31) {
            ed = 30;
          }
          result = ed + em * 30 + ey * 360 - (sd + sm * 30 + sy * 360);
          break;
        case 1: // Actual/actual
        case 2: // Actual/360
        case 3:
          // Actual/365
          result = dayjs(settlement).diff(dayjs(interest), 'days');
          break;
        case 4:
          // European 30/360
          var sd = dayjs(interest).date();
          var sm = dayjs(interest).month() + 1;
          var sy = dayjs(interest).year();
          var ed = dayjs(settlement).date();
          var em = dayjs(settlement).month() + 1;
          var ey = dayjs(settlement).year();
          result = ed + em * 30 + ey * 360 - (sd + sm * 30 + sy * 360);
          break;
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "COUPDAYS": function () {
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
      //结算日
      var settlement = func_methods.getCellDate(arguments[0]);
      if (valueIsError(settlement)) {
        return settlement;
      }
      if (!dayjs(settlement).isValid()) {
        return formula.error.v;
      }

      //到期日
      var maturity = func_methods.getCellDate(arguments[1]);
      if (valueIsError(maturity)) {
        return maturity;
      }
      if (!dayjs(maturity).isValid()) {
        return formula.error.v;
      }

      //年付息次数
      var frequency = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(frequency)) {
        return frequency;
      }
      if (!isRealNum(frequency)) {
        return formula.error.v;
      }
      frequency = parseInt(frequency);

      //日计数基准类型
      var basis = 0;
      if (arguments.length == 4) {
        basis = func_methods.getFirstValue(arguments[3]);
        if (valueIsError(basis)) {
          return basis;
        }
        if (!isRealNum(basis)) {
          return formula.error.v;
        }
        basis = parseInt(basis);
      }
      if (frequency != 1 && frequency != 2 && frequency != 4) {
        return formula.error.nm;
      }
      if (basis < 0 || basis > 4) {
        return formula.error.nm;
      }
      if (dayjs(settlement) - dayjs(maturity) >= 0) {
        return formula.error.nm;
      }

      //计算
      var result;
      switch (basis) {
        case 0:
          // US (NASD) 30/360
          result = 360 / frequency;
          break;
        case 1:
          // Actual/actual
          var maxCount = Math.ceil(dayjs(maturity).diff(dayjs(settlement), 'months') / (12 / frequency)) + 1;
          for (var i = 1; i <= maxCount; i++) {
            var d1 = dayjs(maturity).subtract(12 / frequency * i, 'months');
            if (d1 <= dayjs(settlement)) {
              var d2 = dayjs(maturity).subtract(12 / frequency * (i - 1), 'months');
              result = dayjs(d2).diff(dayjs(d1), 'days');
              break;
            }
          }
          break;
        case 2:
          // Actual/360
          result = 360 / frequency;
          break;
        case 3:
          // Actual/365
          result = 365 / frequency;
          break;
        case 4:
          // European 30/360
          result = 360 / frequency;
          break;
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "COUPDAYSNC": function () {
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
      //结算日
      var settlement = func_methods.getCellDate(arguments[0]);
      if (valueIsError(settlement)) {
        return settlement;
      }
      if (!dayjs(settlement).isValid()) {
        return formula.error.v;
      }

      //到期日
      var maturity = func_methods.getCellDate(arguments[1]);
      if (valueIsError(maturity)) {
        return maturity;
      }
      if (!dayjs(maturity).isValid()) {
        return formula.error.v;
      }

      //年付息次数
      var frequency = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(frequency)) {
        return frequency;
      }
      if (!isRealNum(frequency)) {
        return formula.error.v;
      }
      frequency = parseInt(frequency);

      //日计数基准类型
      var basis = 0;
      if (arguments.length == 4) {
        basis = func_methods.getFirstValue(arguments[3]);
        if (valueIsError(basis)) {
          return basis;
        }
        if (!isRealNum(basis)) {
          return formula.error.v;
        }
        basis = parseInt(basis);
      }
      if (frequency != 1 && frequency != 2 && frequency != 4) {
        return formula.error.nm;
      }
      if (basis < 0 || basis > 4) {
        return formula.error.nm;
      }
      if (dayjs(settlement) - dayjs(maturity) >= 0) {
        return formula.error.nm;
      }

      //计算
      var interest; //结算日之后的下一个付息日

      var maxCount = Math.ceil(dayjs(maturity).diff(dayjs(settlement), 'months') / (12 / frequency)) + 1;
      for (var i = 1; i <= maxCount; i++) {
        var di = dayjs(maturity).subtract(12 / frequency * i, 'months');
        if (di <= dayjs(settlement)) {
          interest = dayjs(maturity).subtract(12 / frequency * (i - 1), 'months');
          break;
        }
      }
      var result;
      switch (basis) {
        case 0:
          // US (NASD) 30/360
          var sd = dayjs(settlement).date();
          var sm = dayjs(settlement).month() + 1;
          var sy = dayjs(settlement).year();
          var ed = dayjs(interest).date();
          var em = dayjs(interest).month() + 1;
          var ey = dayjs(interest).year();
          if (sd === 31 && ed === 31) {
            sd = 30;
            ed = 30;
          } else if (sd === 31) {
            sd = 30;
          } else if (sd === 30 && ed === 31) {
            ed = 30;
          }
          result = ed + em * 30 + ey * 360 - (sd + sm * 30 + sy * 360);
          break;
        case 1: // Actual/actual
        case 2: // Actual/360
        case 3:
          // Actual/365
          result = dayjs(interest).diff(dayjs(settlement), 'days');
          break;
        case 4:
          // European 30/360
          var sd = dayjs(settlement).date();
          var sm = dayjs(settlement).month() + 1;
          var sy = dayjs(settlement).year();
          var ed = dayjs(interest).date();
          var em = dayjs(interest).month() + 1;
          var ey = dayjs(interest).year();
          result = ed + em * 30 + ey * 360 - (sd + sm * 30 + sy * 360);
          break;
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "COUPNCD": function () {
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
      //结算日
      var settlement = func_methods.getCellDate(arguments[0]);
      if (valueIsError(settlement)) {
        return settlement;
      }
      if (!dayjs(settlement).isValid()) {
        return formula.error.v;
      }

      //到期日
      var maturity = func_methods.getCellDate(arguments[1]);
      if (valueIsError(maturity)) {
        return maturity;
      }
      if (!dayjs(maturity).isValid()) {
        return formula.error.v;
      }

      //年付息次数
      var frequency = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(frequency)) {
        return frequency;
      }
      if (!isRealNum(frequency)) {
        return formula.error.v;
      }
      frequency = parseInt(frequency);

      //日计数基准类型
      var basis = 0;
      if (arguments.length == 4) {
        basis = func_methods.getFirstValue(arguments[3]);
        if (valueIsError(basis)) {
          return basis;
        }
        if (!isRealNum(basis)) {
          return formula.error.v;
        }
        basis = parseInt(basis);
      }
      if (frequency != 1 && frequency != 2 && frequency != 4) {
        return formula.error.nm;
      }
      if (basis < 0 || basis > 4) {
        return formula.error.nm;
      }
      if (dayjs(settlement) - dayjs(maturity) >= 0) {
        return formula.error.nm;
      }

      //计算
      var interest; //结算日之后的下一个付息日

      var maxCount = Math.ceil(dayjs(maturity).diff(dayjs(settlement), 'months') / (12 / frequency)) + 1;
      for (var i = 1; i <= maxCount; i++) {
        var di = dayjs(maturity).subtract(12 / frequency * i, 'months');
        if (di <= dayjs(settlement)) {
          interest = dayjs(maturity).subtract(12 / frequency * (i - 1), 'months');
          break;
        }
      }
      return dayjs(interest).format("YYYY-MM-DD");
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "COUPPCD": function () {
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
      //结算日
      var settlement = func_methods.getCellDate(arguments[0]);
      if (valueIsError(settlement)) {
        return settlement;
      }
      if (!dayjs(settlement).isValid()) {
        return formula.error.v;
      }

      //到期日
      var maturity = func_methods.getCellDate(arguments[1]);
      if (valueIsError(maturity)) {
        return maturity;
      }
      if (!dayjs(maturity).isValid()) {
        return formula.error.v;
      }

      //年付息次数
      var frequency = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(frequency)) {
        return frequency;
      }
      if (!isRealNum(frequency)) {
        return formula.error.v;
      }
      frequency = parseInt(frequency);

      //日计数基准类型
      var basis = 0;
      if (arguments.length == 4) {
        basis = func_methods.getFirstValue(arguments[3]);
        if (valueIsError(basis)) {
          return basis;
        }
        if (!isRealNum(basis)) {
          return formula.error.v;
        }
        basis = parseInt(basis);
      }
      if (frequency != 1 && frequency != 2 && frequency != 4) {
        return formula.error.nm;
      }
      if (basis < 0 || basis > 4) {
        return formula.error.nm;
      }
      if (dayjs(settlement) - dayjs(maturity) >= 0) {
        return formula.error.nm;
      }

      //计算
      var interest; //结算日之前的上一个付息日

      var maxCount = Math.ceil(dayjs(maturity).diff(dayjs(settlement), 'months') / (12 / frequency)) + 1;
      for (var i = 1; i <= maxCount; i++) {
        var di = dayjs(maturity).subtract(12 / frequency * i, 'months');
        if (di <= dayjs(settlement)) {
          interest = di;
          break;
        }
      }
      return dayjs(interest).format("YYYY-MM-DD");
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
  "YIELD": function () {
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
      //结算日
      var settlement = func_methods.getCellDate(arguments[0]);
      if (valueIsError(settlement)) {
        return settlement;
      }
      if (!dayjs(settlement).isValid()) {
        return formula.error.v;
      }

      //到期日
      var maturity = func_methods.getCellDate(arguments[1]);
      if (valueIsError(maturity)) {
        return maturity;
      }
      if (!dayjs(maturity).isValid()) {
        return formula.error.v;
      }

      //有价证券的年息票利率
      var rate = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(rate)) {
        return rate;
      }
      if (!isRealNum(rate)) {
        return formula.error.v;
      }
      rate = parseFloat(rate);

      //有价证券的价格
      var pr = func_methods.getFirstValue(arguments[3]);
      if (valueIsError(pr)) {
        return pr;
      }
      if (!isRealNum(pr)) {
        return formula.error.v;
      }
      pr = parseFloat(pr);

      //有价证券的清偿价值
      var redemption = func_methods.getFirstValue(arguments[4]);
      if (valueIsError(redemption)) {
        return redemption;
      }
      if (!isRealNum(redemption)) {
        return formula.error.v;
      }
      redemption = parseFloat(redemption);

      //年付息次数
      var frequency = func_methods.getFirstValue(arguments[5]);
      if (valueIsError(frequency)) {
        return frequency;
      }
      if (!isRealNum(frequency)) {
        return formula.error.v;
      }
      frequency = parseInt(frequency);

      //日计数基准类型
      var basis = 0;
      if (arguments.length == 7) {
        basis = func_methods.getFirstValue(arguments[6]);
        if (valueIsError(basis)) {
          return basis;
        }
        if (!isRealNum(basis)) {
          return formula.error.v;
        }
        basis = parseInt(basis);
      }
      if (rate < 0) {
        return formula.error.nm;
      }
      if (pr <= 0 || redemption <= 0) {
        return formula.error.nm;
      }
      if (frequency != 1 && frequency != 2 && frequency != 4) {
        return formula.error.nm;
      }
      if (basis < 0 || basis > 4) {
        return formula.error.nm;
      }
      if (dayjs(settlement) - dayjs(maturity) >= 0) {
        return formula.error.nm;
      }

      //计算
      var num = window.luckysheet_function.COUPNUM.f(settlement, maturity, frequency, basis);
      if (num > 1) {
        var a = 1;
        var b = 0;
        var yld = a;
        for (var i = 1; i <= 100; i++) {
          var price = window.luckysheet_function.PRICE.f(settlement, maturity, rate, yld, redemption, frequency, basis);
          if (Math.abs(price - pr) < 0.000001) {
            break;
          }
          if (price > pr) {
            b = yld;
          } else {
            a = yld;
          }
          yld = (a + b) / 2;
        }
        var result = yld;
      } else {
        var DSR = window.luckysheet_function.COUPDAYSNC.f(settlement, maturity, frequency, basis);
        var E = window.luckysheet_function.COUPDAYS.f(settlement, maturity, frequency, basis);
        var A = window.luckysheet_function.COUPDAYBS.f(settlement, maturity, frequency, basis);
        var T1 = redemption / 100 + rate / frequency;
        var T2 = pr / 100 + A / E * (rate / frequency);
        var T3 = frequency * E / DSR;
        var result = (T1 - T2) / T2 * T3;
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "YIELDDISC": function () {
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
      //结算日
      var settlement = func_methods.getCellDate(arguments[0]);
      if (valueIsError(settlement)) {
        return settlement;
      }
      if (!dayjs(settlement).isValid()) {
        return formula.error.v;
      }

      //到期日
      var maturity = func_methods.getCellDate(arguments[1]);
      if (valueIsError(maturity)) {
        return maturity;
      }
      if (!dayjs(maturity).isValid()) {
        return formula.error.v;
      }

      //有价证券的价格
      var pr = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(pr)) {
        return pr;
      }
      if (!isRealNum(pr)) {
        return formula.error.v;
      }
      pr = parseFloat(pr);

      //有价证券的清偿价值
      var redemption = func_methods.getFirstValue(arguments[3]);
      if (valueIsError(redemption)) {
        return redemption;
      }
      if (!isRealNum(redemption)) {
        return formula.error.v;
      }
      redemption = parseFloat(redemption);

      //日计数基准类型
      var basis = 0;
      if (arguments.length == 5) {
        basis = func_methods.getFirstValue(arguments[4]);
        if (valueIsError(basis)) {
          return basis;
        }
        if (!isRealNum(basis)) {
          return formula.error.v;
        }
        basis = parseInt(basis);
      }
      if (pr <= 0 || redemption <= 0) {
        return formula.error.nm;
      }
      if (basis < 0 || basis > 4) {
        return formula.error.nm;
      }
      if (dayjs(settlement) - dayjs(maturity) >= 0) {
        return formula.error.nm;
      }
      var yearfrac = window.luckysheet_function.YEARFRAC.f(settlement, maturity, basis);
      return (redemption / pr - 1) / yearfrac;
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
  "INTRATE": function () {
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
      //结算日
      var settlement = func_methods.getCellDate(arguments[0]);
      if (valueIsError(settlement)) {
        return settlement;
      }
      if (!dayjs(settlement).isValid()) {
        return formula.error.v;
      }

      //到期日
      var maturity = func_methods.getCellDate(arguments[1]);
      if (valueIsError(maturity)) {
        return maturity;
      }
      if (!dayjs(maturity).isValid()) {
        return formula.error.v;
      }

      //有价证券的投资额
      var investment = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(investment)) {
        return investment;
      }
      if (!isRealNum(investment)) {
        return formula.error.v;
      }
      investment = parseFloat(investment);

      //有价证券到期时的兑换值
      var redemption = func_methods.getFirstValue(arguments[3]);
      if (valueIsError(redemption)) {
        return redemption;
      }
      if (!isRealNum(redemption)) {
        return formula.error.v;
      }
      redemption = parseFloat(redemption);

      //日计数基准类型
      var basis = 0;
      if (arguments.length == 5) {
        basis = func_methods.getFirstValue(arguments[4]);
        if (valueIsError(basis)) {
          return basis;
        }
        if (!isRealNum(basis)) {
          return formula.error.v;
        }
        basis = parseInt(basis);
      }
      if (investment <= 0 || redemption <= 0) {
        return formula.error.nm;
      }
      if (basis < 0 || basis > 4) {
        return formula.error.nm;
      }
      if (dayjs(settlement) - dayjs(maturity) >= 0) {
        return formula.error.nm;
      }

      //计算
      var sd = dayjs(settlement).date();
      var sm = dayjs(settlement).month() + 1;
      var sy = dayjs(settlement).year();
      var ed = dayjs(maturity).date();
      var em = dayjs(maturity).month() + 1;
      var ey = dayjs(maturity).year();
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
          result = 360 / (ed + em * 30 + ey * 360 - (sd + sm * 30 + sy * 360));
          break;
        case 1:
          // Actual/actual
          var ylength = 365;
          if (sy === ey || sy + 1 === ey && (sm > em || sm === em && sd >= ed)) {
            if (sy === ey && func_methods.isLeapYear(sy) || func_methods.feb29Between(settlement, maturity) || em === 1 && ed === 29) {
              ylength = 366;
            }
            result = ylength / dayjs(maturity).diff(dayjs(settlement), 'days');
            result = (redemption - investment) / investment * result;
            return result;
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
          result = average / dayjs(maturity).diff(dayjs(settlement), 'days');
          break;
        case 2:
          // Actual/360
          result = 360 / dayjs(maturity).diff(dayjs(settlement), 'days');
          break;
        case 3:
          // Actual/365
          result = 365 / dayjs(maturity).diff(dayjs(settlement), 'days');
          break;
        case 4:
          // European 30/360
          result = 360 / (ed + em * 30 + ey * 360 - (sd + sm * 30 + sy * 360));
          break;
      }
      result = (redemption - investment) / investment * result;
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "PRICE": function () {
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
      //结算日
      var settlement = func_methods.getCellDate(arguments[0]);
      if (valueIsError(settlement)) {
        return settlement;
      }
      if (!dayjs(settlement).isValid()) {
        return formula.error.v;
      }

      //到期日
      var maturity = func_methods.getCellDate(arguments[1]);
      if (valueIsError(maturity)) {
        return maturity;
      }
      if (!dayjs(maturity).isValid()) {
        return formula.error.v;
      }

      //有价证券的年息票利率
      var rate = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(rate)) {
        return rate;
      }
      if (!isRealNum(rate)) {
        return formula.error.v;
      }
      rate = parseFloat(rate);

      //有价证券的年收益率
      var yld = func_methods.getFirstValue(arguments[3]);
      if (valueIsError(yld)) {
        return yld;
      }
      if (!isRealNum(yld)) {
        return formula.error.v;
      }
      yld = parseFloat(yld);

      //有价证券的清偿价值
      var redemption = func_methods.getFirstValue(arguments[4]);
      if (valueIsError(redemption)) {
        return redemption;
      }
      if (!isRealNum(redemption)) {
        return formula.error.v;
      }
      redemption = parseFloat(redemption);

      //年付息次数
      var frequency = func_methods.getFirstValue(arguments[5]);
      if (valueIsError(frequency)) {
        return frequency;
      }
      if (!isRealNum(frequency)) {
        return formula.error.v;
      }
      frequency = parseInt(frequency);

      //日计数基准类型
      var basis = 0;
      if (arguments.length == 7) {
        basis = func_methods.getFirstValue(arguments[6]);
        if (valueIsError(basis)) {
          return basis;
        }
        if (!isRealNum(basis)) {
          return formula.error.v;
        }
        basis = parseInt(basis);
      }
      if (rate < 0 || yld < 0) {
        return formula.error.nm;
      }
      if (redemption <= 0) {
        return formula.error.nm;
      }
      if (frequency != 1 && frequency != 2 && frequency != 4) {
        return formula.error.nm;
      }
      if (basis < 0 || basis > 4) {
        return formula.error.nm;
      }
      if (dayjs(settlement) - dayjs(maturity) >= 0) {
        return formula.error.nm;
      }

      //计算
      var DSC = window.luckysheet_function.COUPDAYSNC.f(settlement, maturity, frequency, basis);
      var E = window.luckysheet_function.COUPDAYS.f(settlement, maturity, frequency, basis);
      var A = window.luckysheet_function.COUPDAYBS.f(settlement, maturity, frequency, basis);
      var num = window.luckysheet_function.COUPNUM.f(settlement, maturity, frequency, basis);
      if (num > 1) {
        var T1 = redemption / Math.pow(1 + yld / frequency, num - 1 + DSC / E);
        var T2 = 0;
        for (var i = 1; i <= num; i++) {
          T2 += 100 * rate / frequency / Math.pow(1 + yld / frequency, i - 1 + DSC / E);
        }
        var T3 = 100 * (rate / frequency) * (A / E);
        var result = T1 + T2 - T3;
      } else {
        var DSR = E - A;
        var T1 = 100 * (rate / frequency) + redemption;
        var T2 = yld / frequency * (DSR / E) + 1;
        var T3 = 100 * (rate / frequency) * (A / E);
        var result = T1 / T2 - T3;
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "PRICEDISC": function () {
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
      //结算日
      var settlement = func_methods.getCellDate(arguments[0]);
      if (valueIsError(settlement)) {
        return settlement;
      }
      if (!dayjs(settlement).isValid()) {
        return formula.error.v;
      }

      //到期日
      var maturity = func_methods.getCellDate(arguments[1]);
      if (valueIsError(maturity)) {
        return maturity;
      }
      if (!dayjs(maturity).isValid()) {
        return formula.error.v;
      }

      //有价证券的贴现率
      var discount = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(discount)) {
        return discount;
      }
      if (!isRealNum(discount)) {
        return formula.error.v;
      }
      discount = parseFloat(discount);

      //有价证券的清偿价值
      var redemption = func_methods.getFirstValue(arguments[3]);
      if (valueIsError(redemption)) {
        return redemption;
      }
      if (!isRealNum(redemption)) {
        return formula.error.v;
      }
      redemption = parseFloat(redemption);

      //日计数基准类型
      var basis = 0;
      if (arguments.length == 5) {
        basis = func_methods.getFirstValue(arguments[4]);
        if (valueIsError(basis)) {
          return basis;
        }
        if (!isRealNum(basis)) {
          return formula.error.v;
        }
        basis = parseInt(basis);
      }
      if (discount <= 0 || redemption <= 0) {
        return formula.error.nm;
      }
      if (basis < 0 || basis > 4) {
        return formula.error.nm;
      }
      if (dayjs(settlement) - dayjs(maturity) >= 0) {
        return formula.error.nm;
      }

      //计算
      var sd = dayjs(settlement).date();
      var sm = dayjs(settlement).month() + 1;
      var sy = dayjs(settlement).year();
      var ed = dayjs(maturity).date();
      var em = dayjs(maturity).month() + 1;
      var ey = dayjs(maturity).year();
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
            if (sy === ey && func_methods.isLeapYear(sy) || func_methods.feb29Between(settlement, maturity) || em === 1 && ed === 29) {
              ylength = 366;
            }
            result = dayjs(maturity).diff(dayjs(settlement), 'days') / ylength;
            result = redemption - discount * redemption * result;
            return result;
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
          result = dayjs(maturity).diff(dayjs(settlement), 'days') / average;
          break;
        case 2:
          // Actual/360
          result = dayjs(maturity).diff(dayjs(settlement), 'days') / 360;
          break;
        case 3:
          // Actual/365
          result = dayjs(maturity).diff(dayjs(settlement), 'days') / 365;
          break;
        case 4:
          // European 30/360
          result = (ed + em * 30 + ey * 360 - (sd + sm * 30 + sy * 360)) / 360;
          break;
      }
      result = redemption - discount * redemption * result;
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "PRICEMAT": function () {
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
      //结算日
      var settlement = func_methods.getCellDate(arguments[0]);
      if (valueIsError(settlement)) {
        return settlement;
      }
      if (!dayjs(settlement).isValid()) {
        return formula.error.v;
      }

      //到期日
      var maturity = func_methods.getCellDate(arguments[1]);
      if (valueIsError(maturity)) {
        return maturity;
      }
      if (!dayjs(maturity).isValid()) {
        return formula.error.v;
      }

      //发行日
      var issue = func_methods.getCellDate(arguments[2]);
      if (valueIsError(issue)) {
        return issue;
      }
      if (!dayjs(issue).isValid()) {
        return formula.error.v;
      }

      //有价证券在发行日的利率
      var rate = func_methods.getFirstValue(arguments[3]);
      if (valueIsError(rate)) {
        return rate;
      }
      if (!isRealNum(rate)) {
        return formula.error.v;
      }
      rate = parseFloat(rate);

      //有价证券的年收益率
      var yld = func_methods.getFirstValue(arguments[4]);
      if (valueIsError(yld)) {
        return yld;
      }
      if (!isRealNum(yld)) {
        return formula.error.v;
      }
      yld = parseFloat(yld);

      //日计数基准类型
      var basis = 0;
      if (arguments.length == 6) {
        basis = func_methods.getFirstValue(arguments[5]);
        if (valueIsError(basis)) {
          return basis;
        }
        if (!isRealNum(basis)) {
          return formula.error.v;
        }
        basis = parseInt(basis);
      }
      if (rate < 0 || yld < 0) {
        return formula.error.nm;
      }
      if (basis < 0 || basis > 4) {
        return formula.error.nm;
      }
      if (dayjs(settlement) - dayjs(maturity) >= 0) {
        return formula.error.nm;
      }

      //计算
      var sd = dayjs(settlement).date();
      var sm = dayjs(settlement).month() + 1;
      var sy = dayjs(settlement).year();
      var ed = dayjs(maturity).date();
      var em = dayjs(maturity).month() + 1;
      var ey = dayjs(maturity).year();
      var td = dayjs(issue).date();
      var tm = dayjs(issue).month() + 1;
      var ty = dayjs(issue).year();
      var result;
      switch (basis) {
        case 0:
          // US (NASD) 30/360
          if (sd == 31) {
            sd = 30;
          }
          if (ed == 31) {
            ed = 30;
          }
          if (td == 31) {
            td = 30;
          }
          var B = 360;
          var DSM = ed + em * 30 + ey * 360 - (sd + sm * 30 + sy * 360);
          var DIM = ed + em * 30 + ey * 360 - (td + tm * 30 + ty * 360);
          var A = sd + sm * 30 + sy * 360 - (td + tm * 30 + ty * 360);
          break;
        case 1:
          // Actual/actual
          var ylength = 365;
          if (sy === ey || sy + 1 === ey && (sm > em || sm === em && sd >= ed)) {
            if (sy === ey && func_methods.isLeapYear(sy) || func_methods.feb29Between(settlement, maturity) || em === 1 && ed === 29) {
              ylength = 366;
            }
            var B = ylength;
            var DSM = dayjs(maturity).diff(dayjs(settlement), 'days');
            var DIM = dayjs(settlement).diff(dayjs(issue), 'days');
            var A = dayjs(maturity).diff(dayjs(issue), 'days');
            result = (100 + DIM / B * rate * 100) / (1 + DSM / B * yld) - A / B * rate * 100;
            return result;
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
          var B = average;
          var DSM = dayjs(maturity).diff(dayjs(settlement), 'days');
          var DIM = dayjs(settlement).diff(dayjs(issue), 'days');
          var A = dayjs(maturity).diff(dayjs(issue), 'days');
          break;
        case 2:
          // Actual/360
          var B = 360;
          var DSM = dayjs(maturity).diff(dayjs(settlement), 'days');
          var DIM = dayjs(settlement).diff(dayjs(issue), 'days');
          var A = dayjs(maturity).diff(dayjs(issue), 'days');
          break;
        case 3:
          // Actual/365
          var B = 365;
          var DSM = dayjs(maturity).diff(dayjs(settlement), 'days');
          var DIM = dayjs(settlement).diff(dayjs(issue), 'days');
          var A = dayjs(maturity).diff(dayjs(issue), 'days');
          break;
        case 4:
          // European 30/360
          var B = 360;
          var DSM = ed + em * 30 + ey * 360 - (sd + sm * 30 + sy * 360);
          var DIM = ed + em * 30 + ey * 360 - (td + tm * 30 + ty * 360);
          var A = sd + sm * 30 + sy * 360 - (td + tm * 30 + ty * 360);
          break;
      }
      result = (100 + DIM / B * rate * 100) / (1 + DSM / B * yld) - A / B * rate * 100;
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "RECEIVED": function () {
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
      //结算日
      var settlement = func_methods.getCellDate(arguments[0]);
      if (valueIsError(settlement)) {
        return settlement;
      }
      if (!dayjs(settlement).isValid()) {
        return formula.error.v;
      }

      //到期日
      var maturity = func_methods.getCellDate(arguments[1]);
      if (valueIsError(maturity)) {
        return maturity;
      }
      if (!dayjs(maturity).isValid()) {
        return formula.error.v;
      }

      //有价证券的投资额
      var investment = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(investment)) {
        return investment;
      }
      if (!isRealNum(investment)) {
        return formula.error.v;
      }
      investment = parseFloat(investment);

      //有价证券的贴现率
      var discount = func_methods.getFirstValue(arguments[3]);
      if (valueIsError(discount)) {
        return discount;
      }
      if (!isRealNum(discount)) {
        return formula.error.v;
      }
      discount = parseFloat(discount);

      //日计数基准类型
      var basis = 0;
      if (arguments.length == 5) {
        basis = func_methods.getFirstValue(arguments[4]);
        if (valueIsError(basis)) {
          return basis;
        }
        if (!isRealNum(basis)) {
          return formula.error.v;
        }
        basis = parseFloat(basis);
      }
      if (investment <= 0 || discount <= 0) {
        return formula.error.nm;
      }
      if (basis < 0 || basis > 4) {
        return formula.error.nm;
      }
      if (dayjs(settlement) - dayjs(maturity) >= 0) {
        return formula.error.nm;
      }

      //计算
      var sd = dayjs(settlement).date();
      var sm = dayjs(settlement).month() + 1;
      var sy = dayjs(settlement).year();
      var ed = dayjs(maturity).date();
      var em = dayjs(maturity).month() + 1;
      var ey = dayjs(maturity).year();
      var result;
      switch (basis) {
        case 0:
          // US (NASD) 30/360
          if (sd == 31) {
            sd = 30;
          }
          if (ed == 31) {
            ed = 30;
          }
          var B = 360;
          var DIM = ed + em * 30 + ey * 360 - (sd + sm * 30 + sy * 360);
          break;
        case 1:
          // Actual/actual
          var ylength = 365;
          if (sy === ey || sy + 1 === ey && (sm > em || sm === em && sd >= ed)) {
            if (sy === ey && func_methods.isLeapYear(sy) || func_methods.feb29Between(settlement, maturity) || em === 1 && ed === 29) {
              ylength = 366;
            }
            var B = ylength;
            var DIM = dayjs(maturity).diff(dayjs(settlement), 'days');
            result = investment / (1 - discount * DIM / B);
            return result;
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
          var B = average;
          var DIM = dayjs(maturity).diff(dayjs(settlement), 'days');
          break;
        case 2:
          // Actual/360
          var B = 360;
          var DIM = dayjs(maturity).diff(dayjs(settlement), 'days');
          break;
        case 3:
          // Actual/365
          var B = 365;
          var DIM = dayjs(maturity).diff(dayjs(settlement), 'days');
          break;
        case 4:
          // European 30/360
          var B = 360;
          var DIM = ed + em * 30 + ey * 360 - (sd + sm * 30 + sy * 360);
          break;
      }
      result = investment / (1 - discount * DIM / B);
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DISC": function () {
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
      //结算日
      var settlement = func_methods.getCellDate(arguments[0]);
      if (valueIsError(settlement)) {
        return settlement;
      }
      if (!dayjs(settlement).isValid()) {
        return formula.error.v;
      }

      //到期日
      var maturity = func_methods.getCellDate(arguments[1]);
      if (valueIsError(maturity)) {
        return maturity;
      }
      if (!dayjs(maturity).isValid()) {
        return formula.error.v;
      }

      //有价证券的价格
      var pr = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(pr)) {
        return pr;
      }
      if (!isRealNum(pr)) {
        return formula.error.v;
      }
      pr = parseFloat(pr);

      //有价证券的清偿价值
      var redemption = func_methods.getFirstValue(arguments[3]);
      if (valueIsError(redemption)) {
        return redemption;
      }
      if (!isRealNum(redemption)) {
        return formula.error.v;
      }
      redemption = parseFloat(redemption);

      //日计数基准类型
      var basis = 0;
      if (arguments.length == 5) {
        basis = func_methods.getFirstValue(arguments[4]);
        if (valueIsError(basis)) {
          return basis;
        }
        if (!isRealNum(basis)) {
          return formula.error.v;
        }
        basis = parseFloat(basis);
      }
      if (pr <= 0 || redemption <= 0) {
        return formula.error.nm;
      }
      if (basis < 0 || basis > 4) {
        return formula.error.nm;
      }
      if (dayjs(settlement) - dayjs(maturity) >= 0) {
        return formula.error.nm;
      }

      //计算
      var sd = dayjs(settlement).date();
      var sm = dayjs(settlement).month() + 1;
      var sy = dayjs(settlement).year();
      var ed = dayjs(maturity).date();
      var em = dayjs(maturity).month() + 1;
      var ey = dayjs(maturity).year();
      var result;
      switch (basis) {
        case 0:
          // US (NASD) 30/360
          if (sd == 31) {
            sd = 30;
          }
          if (ed == 31) {
            ed = 30;
          }
          var B = 360;
          var DSM = ed + em * 30 + ey * 360 - (sd + sm * 30 + sy * 360);
          break;
        case 1:
          // Actual/actual
          var ylength = 365;
          if (sy === ey || sy + 1 === ey && (sm > em || sm === em && sd >= ed)) {
            if (sy === ey && func_methods.isLeapYear(sy) || func_methods.feb29Between(settlement, maturity) || em === 1 && ed === 29) {
              ylength = 366;
            }
            var B = ylength;
            var DSM = dayjs(maturity).diff(dayjs(settlement), 'days');
            result = (redemption - pr) / redemption * (B / DSM);
            return result;
          }
          var years = ey - sy + 1;
          var days = (dayjs().set({
            'year': ey + 1,
            'month': 0,
            'date': 1
          }) - dayjs().set({
            'year': sy,
            'month': 0,
            "date": 1
          })) / 1000 / 60 / 60 / 24;
          var average = days / years;
          var B = average;
          var DSM = dayjs(maturity).diff(dayjs(settlement), 'days');
          break;
        case 2:
          // Actual/360
          var B = 360;
          var DSM = dayjs(maturity).diff(dayjs(settlement), 'days');
          break;
        case 3:
          // Actual/365
          var B = 365;
          var DSM = dayjs(maturity).diff(dayjs(settlement), 'days');
          break;
        case 4:
          // European 30/360
          var B = 360;
          var DSM = ed + em * 30 + ey * 360 - (sd + sm * 30 + sy * 360);
          break;
      }
      result = (redemption - pr) / redemption * (B / DSM);
      return result;
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
  "SLN": function () {
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
      //资产原值
      var cost = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(cost)) {
        return cost;
      }
      if (!isRealNum(cost)) {
        return formula.error.v;
      }
      cost = parseFloat(cost);

      //资产残值
      var salvage = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(salvage)) {
        return salvage;
      }
      if (!isRealNum(salvage)) {
        return formula.error.v;
      }
      salvage = parseFloat(salvage);

      //资产的折旧期数
      var life = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(life)) {
        return life;
      }
      if (!isRealNum(life)) {
        return formula.error.v;
      }
      life = parseFloat(life);
      if (life == 0) {
        return formula.error.d;
      }
      return (cost - salvage) / life;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DURATION": function () {
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
      //结算日
      var settlement = func_methods.getCellDate(arguments[0]);
      if (valueIsError(settlement)) {
        return settlement;
      }
      if (!dayjs(settlement).isValid()) {
        return formula.error.v;
      }

      //到期日
      var maturity = func_methods.getCellDate(arguments[1]);
      if (valueIsError(maturity)) {
        return maturity;
      }
      if (!dayjs(maturity).isValid()) {
        return formula.error.v;
      }

      //有价证券的年息票利率
      var coupon = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(coupon)) {
        return coupon;
      }
      if (!isRealNum(coupon)) {
        return formula.error.v;
      }
      coupon = parseFloat(coupon);

      //有价证券的年收益率
      var yld = func_methods.getFirstValue(arguments[3]);
      if (valueIsError(yld)) {
        return yld;
      }
      if (!isRealNum(yld)) {
        return formula.error.v;
      }
      yld = parseFloat(yld);

      //年付息次数
      var frequency = func_methods.getFirstValue(arguments[4]);
      if (valueIsError(frequency)) {
        return frequency;
      }
      if (!isRealNum(frequency)) {
        return formula.error.v;
      }
      frequency = parseInt(frequency);

      //日计数基准类型
      var basis = 0;
      if (arguments.length == 6) {
        basis = func_methods.getFirstValue(arguments[5]);
        if (valueIsError(basis)) {
          return basis;
        }
        if (!isRealNum(basis)) {
          return formula.error.v;
        }
        basis = parseInt(basis);
      }
      if (coupon < 0 || yld < 0) {
        return formula.error.nm;
      }
      if (frequency != 1 && frequency != 2 && frequency != 4) {
        return formula.error.nm;
      }
      if (basis < 0 || basis > 4) {
        return formula.error.nm;
      }
      if (dayjs(settlement) - dayjs(maturity) >= 0) {
        return formula.error.nm;
      }
      var nper = window.luckysheet_function.COUPNUM.f(settlement, maturity, frequency, basis);
      var sum1 = 0;
      var sum2 = 0;
      for (var i = 1; i <= nper; i++) {
        sum1 += 100 * (coupon / frequency) * i / Math.pow(1 + yld / frequency, i);
        sum2 += 100 * (coupon / frequency) / Math.pow(1 + yld / frequency, i);
      }
      var result = (sum1 + 100 * nper / Math.pow(1 + yld / frequency, nper)) / (sum2 + 100 / Math.pow(1 + yld / frequency, nper));
      result = result / frequency;
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "MDURATION": function () {
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
      //结算日
      var settlement = func_methods.getCellDate(arguments[0]);
      if (valueIsError(settlement)) {
        return settlement;
      }
      if (!dayjs(settlement).isValid()) {
        return formula.error.v;
      }

      //到期日
      var maturity = func_methods.getCellDate(arguments[1]);
      if (valueIsError(maturity)) {
        return maturity;
      }
      if (!dayjs(maturity).isValid()) {
        return formula.error.v;
      }

      //有价证券的年息票利率
      var coupon = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(coupon)) {
        return coupon;
      }
      if (!isRealNum(coupon)) {
        return formula.error.v;
      }
      coupon = parseFloat(coupon);

      //有价证券的年收益率
      var yld = func_methods.getFirstValue(arguments[3]);
      if (valueIsError(yld)) {
        return yld;
      }
      if (!isRealNum(yld)) {
        return formula.error.v;
      }
      yld = parseFloat(yld);

      //年付息次数
      var frequency = func_methods.getFirstValue(arguments[4]);
      if (valueIsError(frequency)) {
        return frequency;
      }
      if (!isRealNum(frequency)) {
        return formula.error.v;
      }
      frequency = parseInt(frequency);

      //日计数基准类型
      var basis = 0;
      if (arguments.length == 6) {
        basis = func_methods.getFirstValue(arguments[5]);
        if (valueIsError(basis)) {
          return basis;
        }
        if (!isRealNum(basis)) {
          return formula.error.v;
        }
        basis = parseInt(basis);
      }
      if (coupon < 0 || yld < 0) {
        return formula.error.nm;
      }
      if (frequency != 1 && frequency != 2 && frequency != 4) {
        return formula.error.nm;
      }
      if (basis < 0 || basis > 4) {
        return formula.error.nm;
      }
      if (dayjs(settlement) - dayjs(maturity) >= 0) {
        return formula.error.nm;
      }
      var duration = window.luckysheet_function.DURATION.f(settlement, maturity, coupon, yld, frequency, basis);
      return duration / (1 + yld / frequency);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  }
};
export default financialFunctions;