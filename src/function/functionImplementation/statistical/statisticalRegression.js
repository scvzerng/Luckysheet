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

const statisticalRegression = {
  "INTERCEPT": function () {
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
      //x轴上用于预测的值
      var x = 0;

      //代表因变量数据数组或矩阵的范围
      var data_known_y = arguments[0];
      var known_y = [];
      if (getObjType(data_known_y) == "array") {
        if (getObjType(data_known_y[0]) == "array" && !func_methods.isDyadicArr(data_known_y)) {
          return formula.error.v;
        }
        known_y = known_y.concat(func_methods.getDataArr(data_known_y, false));
      } else if (getObjType(data_known_y) == "object" && data_known_y.startCell != null) {
        known_y = known_y.concat(func_methods.getCellDataArr(data_known_y, "text", false));
      } else {
        known_y.push(data_known_y);
      }

      //代表自变量数据数组或矩阵的范围
      var data_known_x = arguments[1];
      var known_x = [];
      if (getObjType(data_known_x) == "array") {
        if (getObjType(data_known_x[0]) == "array" && !func_methods.isDyadicArr(data_known_x)) {
          return formula.error.v;
        }
        known_x = known_x.concat(func_methods.getDataArr(data_known_x, false));
      } else if (getObjType(data_known_x) == "object" && data_known_x.startCell != null) {
        known_x = known_x.concat(func_methods.getCellDataArr(data_known_x, "text", false));
      } else {
        known_x.push(data_known_x);
      }
      if (known_y.length != known_x.length) {
        return formula.error.na;
      }

      //known_y 和 known_x 只取数值
      var data_y = [],
        data_x = [];
      for (var i = 0; i < known_y.length; i++) {
        var num_y = known_y[i];
        var num_x = known_x[i];
        if (isRealNum(num_y) && isRealNum(num_x)) {
          data_y.push(parseFloat(num_y));
          data_x.push(parseFloat(num_x));
        }
      }
      if (func_methods.variance_s(data_x) == 0) {
        return formula.error.d;
      }

      //计算
      var xmean = jStat.mean(data_x);
      var ymean = jStat.mean(data_y);
      var n = data_x.length;
      var num = 0;
      var den = 0;
      for (var i = 0; i < n; i++) {
        num += (data_x[i] - xmean) * (data_y[i] - ymean);
        den += Math.pow(data_x[i] - xmean, 2);
      }
      var b = num / den;
      var a = ymean - b * xmean;
      return a + b * x;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "KURT": function () {
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
      var dataArr = [];
      for (var i = 0; i < arguments.length; i++) {
        var data = arguments[i];
        if (getObjType(data) == "array") {
          if (getObjType(data[0]) == "array" && !func_methods.isDyadicArr(data)) {
            return formula.error.v;
          }
          dataArr = dataArr.concat(func_methods.getDataArr(data, true));
        } else if (getObjType(data) == "object" && data.startCell != null) {
          dataArr = dataArr.concat(func_methods.getCellDataArr(data, "text", true));
        } else {
          dataArr.push(data);
        }
      }

      //剔除不是数值类型的值
      var dataArr_n = [];
      for (var j = 0; j < dataArr.length; j++) {
        var number = dataArr[j];
        if (!isRealNum(number)) {
          return formula.error.v;
        }
        number = parseFloat(number);
        dataArr_n.push(number);
      }
      if (dataArr_n.length < 4 || func_methods.standardDeviation_s(dataArr_n) == 0) {
        return formula.error.d;
      }

      //计算
      var mean = jStat.mean(dataArr_n);
      var n = dataArr_n.length;
      var sigma = 0;
      for (var i = 0; i < n; i++) {
        sigma += Math.pow(dataArr_n[i] - mean, 4);
      }
      sigma = sigma / Math.pow(jStat.stdev(dataArr_n, true), 4);
      return n * (n + 1) / ((n - 1) * (n - 2) * (n - 3)) * sigma - 3 * (n - 1) * (n - 1) / ((n - 2) * (n - 3));
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "FORECAST": function () {
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
      //x轴上用于预测的值
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);

      //代表因变量数据数组或矩阵的范围
      var data_known_y = arguments[1];
      var known_y = [];
      if (getObjType(data_known_y) == "array") {
        if (getObjType(data_known_y[0]) == "array" && !func_methods.isDyadicArr(data_known_y)) {
          return formula.error.v;
        }
        known_y = known_y.concat(func_methods.getDataArr(data_known_y, false));
      } else if (getObjType(data_known_y) == "object" && data_known_y.startCell != null) {
        known_y = known_y.concat(func_methods.getCellDataArr(data_known_y, "text", false));
      } else {
        known_y.push(data_known_y);
      }

      //代表自变量数据数组或矩阵的范围
      var data_known_x = arguments[2];
      var known_x = [];
      if (getObjType(data_known_x) == "array") {
        if (getObjType(data_known_x[0]) == "array" && !func_methods.isDyadicArr(data_known_x)) {
          return formula.error.v;
        }
        known_x = known_x.concat(func_methods.getDataArr(data_known_x, false));
      } else if (getObjType(data_known_x) == "object" && data_known_x.startCell != null) {
        known_x = known_x.concat(func_methods.getCellDataArr(data_known_x, "text", false));
      } else {
        known_x.push(data_known_x);
      }
      if (known_y.length != known_x.length) {
        return formula.error.na;
      }

      //known_y 和 known_x 只取数值
      var data_y = [],
        data_x = [];
      for (var i = 0; i < known_y.length; i++) {
        var num_y = known_y[i];
        var num_x = known_x[i];
        if (isRealNum(num_y) && isRealNum(num_x)) {
          data_y.push(parseFloat(num_y));
          data_x.push(parseFloat(num_x));
        }
      }
      if (func_methods.variance_s(data_x) == 0) {
        return formula.error.d;
      }

      //计算
      var xmean = jStat.mean(data_x);
      var ymean = jStat.mean(data_y);
      var n = data_x.length;
      var num = 0;
      var den = 0;
      for (var i = 0; i < n; i++) {
        num += (data_x[i] - xmean) * (data_y[i] - ymean);
        den += Math.pow(data_x[i] - xmean, 2);
      }
      var b = num / den;
      var a = ymean - b * xmean;
      return a + b * x;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "FISHERINV": function () {
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
      var y = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(y)) {
        return y;
      }
      if (!isRealNum(y)) {
        return formula.error.v;
      }
      y = parseFloat(y);
      var e2y = Math.exp(2 * y);
      return (e2y - 1) / (e2y + 1);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "FISHER": function () {
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
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);
      if (x <= -1 || x >= 1) {
        return formula.error.nm;
      }
      return Math.log((1 + x) / (1 - x)) / 2;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "CORREL": function () {
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
      //代表因变量数据数组或矩阵的范围
      var data_known_y = arguments[0];
      var known_y = [];
      if (getObjType(data_known_y) == "array") {
        if (getObjType(data_known_y[0]) == "array" && !func_methods.isDyadicArr(data_known_y)) {
          return formula.error.v;
        }
        known_y = known_y.concat(func_methods.getDataArr(data_known_y, false));
      } else if (getObjType(data_known_y) == "object" && data_known_y.startCell != null) {
        known_y = known_y.concat(func_methods.getCellDataArr(data_known_y, "text", false));
      } else {
        known_y.push(data_known_y);
      }

      //代表自变量数据数组或矩阵的范围
      var data_known_x = arguments[1];
      var known_x = [];
      if (getObjType(data_known_x) == "array") {
        if (getObjType(data_known_x[0]) == "array" && !func_methods.isDyadicArr(data_known_x)) {
          return formula.error.v;
        }
        known_x = known_x.concat(func_methods.getDataArr(data_known_x, false));
      } else if (getObjType(data_known_x) == "object" && data_known_x.startCell != null) {
        known_x = known_x.concat(func_methods.getCellDataArr(data_known_x, "text", false));
      } else {
        known_x.push(data_known_x);
      }
      if (known_y.length != known_x.length) {
        return formula.error.na;
      }

      //known_y 和 known_x 只取数值
      var data_y = [],
        data_x = [];
      for (var i = 0; i < known_y.length; i++) {
        var num_y = known_y[i];
        var num_x = known_x[i];
        if (isRealNum(num_y) && isRealNum(num_x)) {
          data_y.push(parseFloat(num_y));
          data_x.push(parseFloat(num_x));
        }
      }
      if (data_y.length == 0 || data_x.length == 0 || func_methods.standardDeviation(data_y) == 0 || func_methods.standardDeviation(data_x) == 0) {
        return formula.error.d;
      }
      return jStat.corrcoeff(data_y, data_x);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "COVARIANCE_P": function () {
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
      //代表自变量数据数组或矩阵的范围
      var data_known_x = arguments[0];
      var known_x = [];
      if (getObjType(data_known_x) == "array") {
        if (getObjType(data_known_x[0]) == "array" && !func_methods.isDyadicArr(data_known_x)) {
          return formula.error.v;
        }
        known_x = known_x.concat(func_methods.getDataArr(data_known_x, false));
      } else if (getObjType(data_known_x) == "object" && data_known_x.startCell != null) {
        known_x = known_x.concat(func_methods.getCellDataArr(data_known_x, "text", false));
      } else {
        known_x.push(data_known_x);
      }

      //代表因变量数据数组或矩阵的范围
      var data_known_y = arguments[1];
      var known_y = [];
      if (getObjType(data_known_y) == "array") {
        if (getObjType(data_known_y[0]) == "array" && !func_methods.isDyadicArr(data_known_y)) {
          return formula.error.v;
        }
        known_y = known_y.concat(func_methods.getDataArr(data_known_y, false));
      } else if (getObjType(data_known_y) == "object" && data_known_y.startCell != null) {
        known_y = known_y.concat(func_methods.getCellDataArr(data_known_y, "text", false));
      } else {
        known_y.push(data_known_y);
      }
      if (known_x.length != known_y.length) {
        return formula.error.na;
      }

      //known_y 和 known_x 只取数值
      var data_x = [],
        data_y = [];
      for (var i = 0; i < known_x.length; i++) {
        var num_x = known_x[i];
        var num_y = known_y[i];
        if (isRealNum(num_x) && isRealNum(num_y)) {
          data_x.push(parseFloat(num_x));
          data_y.push(parseFloat(num_y));
        }
      }
      if (data_x.length == 0 || data_y.length == 0) {
        return formula.error.d;
      }

      //计算
      var mean1 = jStat.mean(data_x);
      var mean2 = jStat.mean(data_y);
      var result = 0;
      for (var i = 0; i < data_x.length; i++) {
        result += (data_x[i] - mean1) * (data_y[i] - mean2);
      }
      result = result / data_x.length;
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "COVARIANCE_S": function () {
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
      //代表自变量数据数组或矩阵的范围
      var data_known_x = arguments[0];
      var known_x = [];
      if (getObjType(data_known_x) == "array") {
        if (getObjType(data_known_x[0]) == "array" && !func_methods.isDyadicArr(data_known_x)) {
          return formula.error.v;
        }
        known_x = known_x.concat(func_methods.getDataArr(data_known_x, false));
      } else if (getObjType(data_known_x) == "object" && data_known_x.startCell != null) {
        known_x = known_x.concat(func_methods.getCellDataArr(data_known_x, "text", false));
      } else {
        known_x.push(data_known_x);
      }

      //代表因变量数据数组或矩阵的范围
      var data_known_y = arguments[1];
      var known_y = [];
      if (getObjType(data_known_y) == "array") {
        if (getObjType(data_known_y[0]) == "array" && !func_methods.isDyadicArr(data_known_y)) {
          return formula.error.v;
        }
        known_y = known_y.concat(func_methods.getDataArr(data_known_y, false));
      } else if (getObjType(data_known_y) == "object" && data_known_y.startCell != null) {
        known_y = known_y.concat(func_methods.getCellDataArr(data_known_y, "text", false));
      } else {
        known_y.push(data_known_y);
      }
      if (known_x.length != known_y.length) {
        return formula.error.na;
      }

      //known_y 和 known_x 只取数值
      var data_x = [],
        data_y = [];
      for (var i = 0; i < known_x.length; i++) {
        var num_x = known_x[i];
        var num_y = known_y[i];
        if (isRealNum(num_x) && isRealNum(num_y)) {
          data_x.push(parseFloat(num_x));
          data_y.push(parseFloat(num_y));
        }
      }
      if (data_x.length == 0 || data_y.length == 0) {
        return formula.error.d;
      }
      return jStat.covariance(data_x, data_y);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DEVSQ": function () {
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
      var dataArr = [];
      for (var i = 0; i < arguments.length; i++) {
        var data = arguments[i];
        if (getObjType(data) == "array") {
          if (getObjType(data[0]) == "array" && !func_methods.isDyadicArr(data)) {
            return formula.error.v;
          }
          dataArr = dataArr.concat(func_methods.getDataArr(data, true));
        } else if (getObjType(data) == "object" && data.startCell != null) {
          dataArr = dataArr.concat(func_methods.getCellDataArr(data, "number", true));
        } else {
          if (!isRealNum(data)) {
            if (getObjType(data) == "boolean") {
              if (data.toString().toLowerCase() == "true") {
                dataArr.push(1);
              } else if (data.toString().toLowerCase() == "false") {
                dataArr.push(0);
              }
            } else {
              return formula.error.v;
            }
          } else {
            dataArr.push(data);
          }
        }
      }
      var dataArr_n = [];
      for (var i = 0; i < dataArr.length; i++) {
        var number = dataArr[i];
        if (isRealNum(number)) {
          dataArr_n.push(parseFloat(number));
        }
      }
      var mean = jStat.mean(dataArr_n);
      var result = 0;
      for (var i = 0; i < dataArr_n.length; i++) {
        result += Math.pow(dataArr_n[i] - mean, 2);
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "PEARSON": function () {
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
      //代表自变量数据数组或矩阵的范围
      var data_known_x = arguments[0];
      var known_x = [];
      if (getObjType(data_known_x) == "array") {
        if (getObjType(data_known_x[0]) == "array" && !func_methods.isDyadicArr(data_known_x)) {
          return formula.error.v;
        }
        known_x = known_x.concat(func_methods.getDataArr(data_known_x, false));
      } else if (getObjType(data_known_x) == "object" && data_known_x.startCell != null) {
        known_x = known_x.concat(func_methods.getCellDataArr(data_known_x, "text", false));
      } else {
        known_x.push(data_known_x);
      }

      //代表因变量数据数组或矩阵的范围
      var data_known_y = arguments[1];
      var known_y = [];
      if (getObjType(data_known_y) == "array") {
        if (getObjType(data_known_y[0]) == "array" && !func_methods.isDyadicArr(data_known_y)) {
          return formula.error.v;
        }
        known_y = known_y.concat(func_methods.getDataArr(data_known_y, false));
      } else if (getObjType(data_known_y) == "object" && data_known_y.startCell != null) {
        known_y = known_y.concat(func_methods.getCellDataArr(data_known_y, "text", false));
      } else {
        known_y.push(data_known_y);
      }
      if (known_x.length != known_y.length) {
        return formula.error.na;
      }

      //known_y 和 known_x 只取数值
      var data_x = [],
        data_y = [];
      for (var i = 0; i < known_x.length; i++) {
        var num_x = known_x[i];
        var num_y = known_y[i];
        if (isRealNum(num_x) && isRealNum(num_y)) {
          data_x.push(parseFloat(num_x));
          data_y.push(parseFloat(num_y));
        }
      }
      if (data_y.length == 0 || data_x.length == 0) {
        return formula.error.d;
      }

      //计算
      var xmean = jStat.mean(data_x);
      var ymean = jStat.mean(data_y);
      var n = data_x.length;
      var num = 0;
      var den1 = 0;
      var den2 = 0;
      for (var i = 0; i < n; i++) {
        num += (data_x[i] - xmean) * (data_y[i] - ymean);
        den1 += Math.pow(data_x[i] - xmean, 2);
        den2 += Math.pow(data_y[i] - ymean, 2);
      }
      return num / Math.sqrt(den1 * den2);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "RSQ": function () {
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
      //代表因变量数据数组或矩阵的范围
      var data_known_y = arguments[0];
      var known_y = [];
      if (getObjType(data_known_y) == "array") {
        if (getObjType(data_known_y[0]) == "array" && !func_methods.isDyadicArr(data_known_y)) {
          return formula.error.v;
        }
        known_y = known_y.concat(func_methods.getDataArr(data_known_y, false));
      } else if (getObjType(data_known_y) == "object" && data_known_y.startCell != null) {
        known_y = known_y.concat(func_methods.getCellDataArr(data_known_y, "text", false));
      } else {
        if (!isRealNum(data_known_y)) {
          return formula.error.v;
        }
        known_y.push(data_known_y);
      }

      //代表自变量数据数组或矩阵的范围
      var data_known_x = arguments[1];
      var known_x = [];
      if (getObjType(data_known_x) == "array") {
        if (getObjType(data_known_x[0]) == "array" && !func_methods.isDyadicArr(data_known_x)) {
          return formula.error.v;
        }
        known_x = known_x.concat(func_methods.getDataArr(data_known_x, false));
      } else if (getObjType(data_known_x) == "object" && data_known_x.startCell != null) {
        known_x = known_x.concat(func_methods.getCellDataArr(data_known_x, "text", false));
      } else {
        if (!isRealNum(data_known_x)) {
          return formula.error.v;
        }
        known_x.push(data_known_x);
      }
      if (known_y.length != known_x.length) {
        return formula.error.na;
      }

      //known_y 和 known_x 只取数值
      var data_y = [],
        data_x = [];
      for (var i = 0; i < known_y.length; i++) {
        var num_y = known_y[i];
        var num_x = known_x[i];
        if (isRealNum(num_y) && isRealNum(num_x)) {
          data_y.push(parseFloat(num_y));
          data_x.push(parseFloat(num_x));
        }
      }
      if (data_y.length == 0 || data_x.length == 0) {
        return formula.error.d;
      }
      return Math.pow(window.luckysheet_function.PEARSON.f(data_y, data_x), 2);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "STEYX": function () {
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
      //代表因变量数据数组或矩阵的范围
      var known_y = [];
      if (getObjType(arguments[0]) == "array") {
        if (getObjType(arguments[0][0]) == "array" && !func_methods.isDyadicArr(arguments[0])) {
          return formula.error.v;
        }
        known_y = known_y.concat(func_methods.getDataArr(arguments[0], false));
      } else if (getObjType(arguments[0]) == "object" && arguments[0].startCell != null) {
        known_y = known_y.concat(func_methods.getCellDataArr(arguments[0], "text", false));
      } else {
        if (!isRealNum(arguments[0])) {
          return formula.error.v;
        }
        known_y.push(arguments[0]);
      }

      //代表自变量数据数组或矩阵的范围
      var known_x = [];
      if (getObjType(arguments[1]) == "array") {
        if (getObjType(arguments[1][0]) == "array" && !func_methods.isDyadicArr(arguments[1])) {
          return formula.error.v;
        }
        known_x = known_x.concat(func_methods.getDataArr(arguments[1], false));
      } else if (getObjType(arguments[1]) == "object" && arguments[1].startCell != null) {
        known_x = known_x.concat(func_methods.getCellDataArr(arguments[1], "text", false));
      } else {
        if (!isRealNum(arguments[1])) {
          return formula.error.v;
        }
        known_x.push(arguments[1]);
      }
      if (known_y.length != known_x.length) {
        return formula.error.na;
      }

      //known_y 和 known_x 只取数值
      var data_y = [],
        data_x = [];
      for (var i = 0; i < known_y.length; i++) {
        var num_y = known_y[i];
        var num_x = known_x[i];
        if (isRealNum(num_y) && isRealNum(num_x)) {
          data_y.push(parseFloat(num_y));
          data_x.push(parseFloat(num_x));
        }
      }
      if (data_y.length < 3 || data_x.length < 3) {
        return formula.error.d;
      }

      //计算
      var xmean = jStat.mean(data_x);
      var ymean = jStat.mean(data_y);
      var n = data_x.length;
      var lft = 0;
      var num = 0;
      var den = 0;
      for (var i = 0; i < n; i++) {
        lft += Math.pow(data_y[i] - ymean, 2);
        num += (data_x[i] - xmean) * (data_y[i] - ymean);
        den += Math.pow(data_x[i] - xmean, 2);
      }
      return Math.sqrt((lft - num * num / den) / (n - 2));
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "SLOPE": function () {
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
      //代表因变量数据数组或矩阵的范围
      var known_y = [];
      if (getObjType(arguments[0]) == "array") {
        if (getObjType(arguments[0][0]) == "array" && !func_methods.isDyadicArr(arguments[0])) {
          return formula.error.v;
        }
        known_y = known_y.concat(func_methods.getDataArr(arguments[0], false));
      } else if (getObjType(arguments[0]) == "object" && arguments[0].startCell != null) {
        known_y = known_y.concat(func_methods.getCellDataArr(arguments[0], "text", false));
      } else {
        if (!isRealNum(arguments[0])) {
          return formula.error.v;
        }
        known_y.push(arguments[0]);
      }

      //代表自变量数据数组或矩阵的范围
      var known_x = [];
      if (getObjType(arguments[1]) == "array") {
        if (getObjType(arguments[1][0]) == "array" && !func_methods.isDyadicArr(arguments[1])) {
          return formula.error.v;
        }
        known_x = known_x.concat(func_methods.getDataArr(arguments[1], false));
      } else if (getObjType(arguments[1]) == "object" && arguments[1].startCell != null) {
        known_x = known_x.concat(func_methods.getCellDataArr(arguments[1], "text", false));
      } else {
        if (!isRealNum(arguments[1])) {
          return formula.error.v;
        }
        known_x.push(arguments[1]);
      }
      if (known_y.length != known_x.length) {
        return formula.error.na;
      }

      //known_y 和 known_x 只取数值
      var data_y = [],
        data_x = [];
      for (var i = 0; i < known_y.length; i++) {
        var num_y = known_y[i];
        var num_x = known_x[i];
        if (isRealNum(num_y) && isRealNum(num_x)) {
          data_y.push(parseFloat(num_y));
          data_x.push(parseFloat(num_x));
        }
      }
      if (data_y.length < 3 || data_x.length < 3) {
        return formula.error.d;
      }

      //计算
      var xmean = jStat.mean(data_x);
      var ymean = jStat.mean(data_y);
      var n = data_x.length;
      var num = 0;
      var den = 0;
      for (var i = 0; i < n; i++) {
        num += (data_x[i] - xmean) * (data_y[i] - ymean);
        den += Math.pow(data_x[i] - xmean, 2);
      }
      return num / den;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
};

export default statisticalRegression;
