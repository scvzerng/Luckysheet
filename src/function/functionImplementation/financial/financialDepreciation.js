import luckysheetConfigsetting from "../../../controllers/luckysheetConfigsetting";
import { luckysheet_getcelldata, luckysheet_parseData, luckysheet_getValue, luckysheet_calcADPMM } from "../../func";
import { inverse } from "../../matrix_methods";
import { getSheetIndex, getluckysheetfile, getRangetxt } from "../../../methods/get";
import menuButton from "../../../controllers/menuButton";
import formula from "../../../global/formula";
import func_methods from "../../../global/func_methods";
import editor from "../../../global/editor";
import { isdatetime, diff, isdatatype } from "../../../global/datecontroll";
import { isRealNum, isRealNull, valueIsError, error } from "../../../global/validate";
import { jfrefreshgrid, jfrefreshgridall } from "../../../global/refresh";
import { genarate, update } from "../../../global/format";
import { orderbydata } from "../../../global/sort";
import { getcellvalue, datagridgrowth } from "../../../global/getdata";
import { getObjType, ABCatNum, chatatABC, numFormat } from "../../../utils/util";
import Store from "../../../store";
import dayjs from 'dayjs';
import numeral from 'numeral';
import { getAirTable, companyTargetData, companyTargetData10, companyTargetData11, companyTargetData12, excelToLuckyArray, excelToArray, askAIData } from "../../../demoData/getTargetData";
import { setcellvalue } from "../../../global/setdata";
import jStat from 'jstat';

const financialDepreciation = {
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
};

export default financialDepreciation;
