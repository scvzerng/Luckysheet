import formula from "../../../global/formula";
import func_methods from "../../../global/func_methods";
import {  isRealNum,  valueIsError } from "../../../global/validate";
import dayjs from 'dayjs';

const financialBond = {
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

export default financialBond;
