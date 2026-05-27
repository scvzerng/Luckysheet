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
const arrayMatrixFunctions = {
  "SUMX2MY2": function () {
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
      //第一个数组或数值区域
      var data_array_x = arguments[0];
      var array_x = [];
      if (getObjType(data_array_x) == "array") {
        if (getObjType(data_array_x[0]) == "array" && !func_methods.isDyadicArr(data_array_x)) {
          return formula.error.v;
        }
        array_x = array_x.concat(func_methods.getDataArr(data_array_x, false));
      } else if (getObjType(data_array_x) == "object" && data_array_x.startCell != null) {
        array_x = array_x.concat(func_methods.getCellDataArr(data_array_x, "text", false));
      } else {
        array_x.push(data_array_x);
      }

      //第二个数组或数值区域
      var data_array_y = arguments[1];
      var array_y = [];
      if (getObjType(data_array_y) == "array") {
        if (getObjType(data_array_y[0]) == "array" && !func_methods.isDyadicArr(data_array_y)) {
          return formula.error.v;
        }
        array_y = array_y.concat(func_methods.getDataArr(data_array_y, false));
      } else if (getObjType(data_array_y) == "object" && data_array_y.startCell != null) {
        array_y = array_y.concat(func_methods.getCellDataArr(data_array_y, "text", false));
      } else {
        array_y.push(data_array_y);
      }
      if (array_x.length != array_y.length) {
        return formula.error.na;
      }

      //array_x 和 array_y 只取数值
      var data_x = [],
        data_y = [];
      for (var i = 0; i < array_x.length; i++) {
        var num_x = array_x[i];
        var num_y = array_y[i];
        if (isRealNum(num_x) && isRealNum(num_y)) {
          data_x.push(parseFloat(num_x));
          data_y.push(parseFloat(num_y));
        }
      }

      //计算
      var sum = 0;
      for (var i = 0; i < data_x.length; i++) {
        sum += Math.pow(data_x[i], 2) - Math.pow(data_y[i], 2);
      }
      return sum;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "SUMX2PY2": function () {
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
      //第一个数组或数值区域
      var data_array_x = arguments[0];
      var array_x = [];
      if (getObjType(data_array_x) == "array") {
        if (getObjType(data_array_x[0]) == "array" && !func_methods.isDyadicArr(data_array_x)) {
          return formula.error.v;
        }
        array_x = array_x.concat(func_methods.getDataArr(data_array_x, false));
      } else if (getObjType(data_array_x) == "object" && data_array_x.startCell != null) {
        array_x = array_x.concat(func_methods.getCellDataArr(data_array_x, "text", false));
      } else {
        array_x.push(data_array_x);
      }

      //第二个数组或数值区域
      var data_array_y = arguments[1];
      var array_y = [];
      if (getObjType(data_array_y) == "array") {
        if (getObjType(data_array_y[0]) == "array" && !func_methods.isDyadicArr(data_array_y)) {
          return formula.error.v;
        }
        array_y = array_y.concat(func_methods.getDataArr(data_array_y, false));
      } else if (getObjType(data_array_y) == "object" && data_array_y.startCell != null) {
        array_y = array_y.concat(func_methods.getCellDataArr(data_array_y, "text", false));
      } else {
        array_y.push(data_array_y);
      }
      if (array_x.length != array_y.length) {
        return formula.error.na;
      }

      //array_x 和 array_y 只取数值
      var data_x = [],
        data_y = [];
      for (var i = 0; i < array_x.length; i++) {
        var num_x = array_x[i];
        var num_y = array_y[i];
        if (isRealNum(num_x) && isRealNum(num_y)) {
          data_x.push(parseFloat(num_x));
          data_y.push(parseFloat(num_y));
        }
      }

      //计算
      var sum = 0;
      for (var i = 0; i < data_x.length; i++) {
        sum += Math.pow(data_x[i], 2) + Math.pow(data_y[i], 2);
      }
      return sum;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "SUMXMY2": function () {
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
      //第一个数组或数值区域
      var data_array_x = arguments[0];
      var array_x = [];
      if (getObjType(data_array_x) == "array") {
        if (getObjType(data_array_x[0]) == "array" && !func_methods.isDyadicArr(data_array_x)) {
          return formula.error.v;
        }
        array_x = array_x.concat(func_methods.getDataArr(data_array_x, false));
      } else if (getObjType(data_array_x) == "object" && data_array_x.startCell != null) {
        array_x = array_x.concat(func_methods.getCellDataArr(data_array_x, "text", false));
      } else {
        array_x.push(data_array_x);
      }

      //第二个数组或数值区域
      var data_array_y = arguments[1];
      var array_y = [];
      if (getObjType(data_array_y) == "array") {
        if (getObjType(data_array_y[0]) == "array" && !func_methods.isDyadicArr(data_array_y)) {
          return formula.error.v;
        }
        array_y = array_y.concat(func_methods.getDataArr(data_array_y, false));
      } else if (getObjType(data_array_y) == "object" && data_array_y.startCell != null) {
        array_y = array_y.concat(func_methods.getCellDataArr(data_array_y, "text", false));
      } else {
        array_y.push(data_array_y);
      }
      if (array_x.length != array_y.length) {
        return formula.error.na;
      }

      //array_x 和 array_y 只取数值
      var data_x = [],
        data_y = [];
      for (var i = 0; i < array_x.length; i++) {
        var num_x = array_x[i];
        var num_y = array_y[i];
        if (isRealNum(num_x) && isRealNum(num_y)) {
          data_x.push(parseFloat(num_x));
          data_y.push(parseFloat(num_y));
        }
      }

      //计算
      var sum = 0;
      for (var i = 0; i < data_x.length; i++) {
        sum += Math.pow(data_x[i] - data_y[i], 2);
      }
      return sum;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "TRANSPOSE": function () {
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
      //从其返回唯一值的数组或区域
      var data_array = arguments[0];
      var array = [];
      if (getObjType(data_array) == "array") {
        if (getObjType(data_array[0]) == "array" && !func_methods.isDyadicArr(data_array)) {
          return formula.error.v;
        }
        array = func_methods.getDataDyadicArr(data_array);
      } else if (getObjType(data_array) == "object" && data_array.startCell != null) {
        array = func_methods.getCellDataDyadicArr(data_array, "number");
      }
      array = array[0].map(function (col, a) {
        return array.map(function (row) {
          return row[a];
        });
      });
      return array;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "TREND": function () {
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
      //已知的 y 值集合
      var data_known_y = arguments[0];
      var known_y = [];
      if (getObjType(data_known_y) == "array") {
        if (getObjType(data_known_y[0]) == "array" && !func_methods.isDyadicArr(data_known_y)) {
          return formula.error.v;
        }
        known_y = func_methods.getDataDyadicArr(data_known_y);
      } else if (getObjType(data_known_y) == "object" && data_known_y.startCell != null) {
        known_y = func_methods.getCellDataDyadicArr(data_known_y, "text");
      } else {
        if (!isRealNum(data_known_y)) {
          return formula.error.v;
        }
        var rowArr = [];
        rowArr.push(parseFloat(data_known_y));
        known_y.push(rowArr);
      }
      var known_y_rowlen = known_y.length;
      var known_y_collen = known_y[0].length;
      for (var i = 0; i < known_y_rowlen; i++) {
        for (var j = 0; j < known_y_collen; j++) {
          if (!isRealNum(known_y[i][j])) {
            return formula.error.v;
          }
          known_y[i][j] = parseFloat(known_y[i][j]);
        }
      }

      //可选 x 值集合
      var known_x = [];
      for (var i = 1; i <= known_y_rowlen; i++) {
        for (var j = 1; j <= known_y_collen; j++) {
          var number = (i - 1) * known_y_collen + j;
          known_x.push(number);
        }
      }
      if (arguments.length >= 2) {
        var data_known_x = arguments[1];
        known_x = [];
        if (getObjType(data_known_x) == "array") {
          if (getObjType(data_known_x[0]) == "array" && !func_methods.isDyadicArr(data_known_x)) {
            return formula.error.v;
          }
          known_x = func_methods.getDataDyadicArr(data_known_x);
        } else if (getObjType(data_known_x) == "object" && data_known_x.startCell != null) {
          known_x = func_methods.getCellDataDyadicArr(data_known_x, "text");
        } else {
          if (!isRealNum(data_known_x)) {
            return formula.error.v;
          }
          var rowArr = [];
          rowArr.push(parseFloat(data_known_x));
          known_x.push(rowArr);
        }
        for (var i = 0; i < known_x.length; i++) {
          for (var j = 0; j < known_x[0].length; j++) {
            if (!isRealNum(known_x[i][j])) {
              return formula.error.v;
            }
            known_x[i][j] = parseFloat(known_x[i][j]);
          }
        }
      }
      var known_x_rowlen = known_x.length;
      var known_x_collen = known_x[0].length;

      //新 x 值
      var new_x = known_x;
      if (arguments.length >= 3) {
        var data_new_x = arguments[2];
        new_x = [];
        if (getObjType(data_new_x) == "array") {
          if (getObjType(data_new_x[0]) == "array" && !func_methods.isDyadicArr(data_new_x)) {
            return formula.error.v;
          }
          new_x = func_methods.getDataDyadicArr(data_new_x);
        } else if (getObjType(data_new_x) == "object" && data_new_x.startCell != null) {
          new_x = func_methods.getCellDataDyadicArr(data_new_x, "text");
        } else {
          if (!isRealNum(data_new_x)) {
            return formula.error.v;
          }
          var rowArr = [];
          rowArr.push(parseFloat(data_new_x));
          new_x.push(rowArr);
        }
        for (var i = 0; i < new_x.length; i++) {
          for (var j = 0; j < new_x[0].length; j++) {
            if (!isRealNum(new_x[i][j])) {
              return formula.error.v;
            }
            new_x[i][j] = parseFloat(new_x[i][j]);
          }
        }
      }

      //逻辑值
      var const_b = true;
      if (arguments.length == 4) {
        const_b = func_methods.getCellBoolen(arguments[3]);
        if (valueIsError(const_b)) {
          return const_b;
        }
      }
      if (known_y_rowlen != known_x_rowlen || known_y_collen != known_x_collen) {
        return formula.error.r;
      }

      //计算
      function leastSquare(arr_x, arr_y) {
        var xSum = 0,
          ySum = 0,
          xySum = 0,
          x2Sum = 0;
        for (var i = 0; i < arr_x.length; i++) {
          for (var j = 0; j < arr_x[i].length; j++) {
            xSum += arr_x[i][j];
            ySum += arr_y[i][j];
            xySum += arr_x[i][j] * arr_y[i][j];
            x2Sum += arr_x[i][j] * arr_x[i][j];
          }
        }
        var n = arr_x.length * arr_x[0].length;
        var xMean = xSum / n;
        var yMean = ySum / n;
        var xyMean = xySum / n;
        var x2Mean = x2Sum / n;
        var m = (xyMean - xMean * yMean) / (x2Mean - xMean * xMean);
        var b = yMean - m * xMean;
        return [m, b];
      }
      var ls = leastSquare(known_x, known_y);
      var m = ls[0];
      if (const_b) {
        var b = ls[1];
      } else {
        var b = 0;
      }
      var result = [];
      for (var i = 0; i < new_x.length; i++) {
        for (var j = 0; j < new_x[i].length; j++) {
          var x = new_x[i][j];
          var y = m * x + b;
          result.push(Math.round(y * 1000000000) / 1000000000);
        }
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "FREQUENCY": function () {
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
      //频率数组
      var data_data_array = arguments[0];
      var data_array = [];
      if (getObjType(data_data_array) == "array") {
        if (getObjType(data_data_array[0]) == "array" && !func_methods.isDyadicArr(data_data_array)) {
          return formula.error.v;
        }
        data_array = data_array.concat(func_methods.getDataArr(data_data_array, true));
      } else if (getObjType(data_data_array) == "object" && data_data_array.startCell != null) {
        data_array = data_array.concat(func_methods.getCellDataArr(data_data_array, "number", true));
      } else {
        if (!isRealNum(data_data_array)) {
          return formula.error.v;
        }
        data_array.push(data_data_array);
      }
      var data_array_n = [];
      for (var i = 0; i < data_array.length; i++) {
        if (isRealNum(data_array[i])) {
          data_array_n.push(parseFloat(data_array[i]));
        }
      }

      //间隔数组
      var data_bins_array = arguments[1];
      var bins_array = [];
      if (getObjType(data_bins_array) == "array") {
        if (getObjType(data_bins_array[0]) == "array" && !func_methods.isDyadicArr(data_bins_array)) {
          return formula.error.v;
        }
        bins_array = bins_array.concat(func_methods.getDataArr(data_bins_array, true));
      } else if (getObjType(data_bins_array) == "object" && data_bins_array.startCell != null) {
        bins_array = bins_array.concat(func_methods.getCellDataArr(data_bins_array, "number", true));
      } else {
        if (!isRealNum(data_bins_array)) {
          return formula.error.v;
        }
        bins_array.push(data_bins_array);
      }
      var bins_array_n = [];
      for (var i = 0; i < bins_array.length; i++) {
        if (isRealNum(bins_array[i])) {
          bins_array_n.push(parseFloat(bins_array[i]));
        }
      }

      //计算
      if (data_array_n.length == 0 && bins_array_n.length == 0) {
        return [[0], [0]];
      } else if (data_array_n.length == 0) {
        var result = [[0]];
        for (var i = 0; i < bins_array_n.length; i++) {
          result.push([0]);
        }
        return result;
      } else if (bins_array_n.length == 0) {
        return [[0], [data_array_n.length]];
      } else {
        bins_array_n.sort(function (a, b) {
          return a - b;
        });
        var result = [];
        for (var i = 0; i < bins_array_n.length; i++) {
          if (i == 0) {
            var count = 0;
            for (var j = 0; j < data_array_n.length; j++) {
              if (data_array_n[j] <= bins_array_n[0]) {
                count++;
              }
            }
            result.push([count]);
          } else if (i == bins_array_n.length - 1) {
            var count1 = 0,
              count2 = 0;
            for (var j = 0; j < data_array_n.length; j++) {
              if (data_array_n[j] <= bins_array_n[i] && data_array_n[j] > bins_array_n[i - 1]) {
                count1++;
              }
              if (data_array_n[j] > bins_array_n[i]) {
                count2++;
              }
            }
            result.push([count1]);
            result.push([count2]);
          } else {
            var count = 0;
            for (var j = 0; j < data_array_n.length; j++) {
              if (data_array_n[j] <= bins_array_n[i] && data_array_n[j] > bins_array_n[i - 1]) {
                count++;
              }
            }
            result.push([count]);
          }
        }
        return result;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "GROWTH": function () {
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
      //已知的 y 值集合
      var data_known_y = arguments[0];
      var known_y = [];
      if (getObjType(data_known_y) == "array") {
        if (getObjType(data_known_y[0]) == "array" && !func_methods.isDyadicArr(data_known_y)) {
          return formula.error.v;
        }
        known_y = func_methods.getDataDyadicArr(data_known_y);
      } else if (getObjType(data_known_y) == "object" && data_known_y.startCell != null) {
        known_y = func_methods.getCellDataDyadicArr(data_known_y, "text");
      } else {
        if (!isRealNum(data_known_y)) {
          return formula.error.v;
        }
        var rowArr = [];
        rowArr.push(parseFloat(data_known_y));
        known_y.push(rowArr);
      }
      var known_y_rowlen = known_y.length;
      var known_y_collen = known_y[0].length;
      for (var i = 0; i < known_y_rowlen; i++) {
        for (var j = 0; j < known_y_collen; j++) {
          if (!isRealNum(known_y[i][j])) {
            return formula.error.v;
          }
          known_y[i][j] = parseFloat(known_y[i][j]);
        }
      }

      //可选 x 值集合
      var known_x = [];
      for (var i = 1; i <= known_y_rowlen; i++) {
        for (var j = 1; j <= known_y_collen; j++) {
          var number = (i - 1) * known_y_collen + j;
          known_x.push(number);
        }
      }
      if (arguments.length >= 2) {
        var data_known_x = arguments[1];
        known_x = [];
        if (getObjType(data_known_x) == "array") {
          if (getObjType(data_known_x[0]) == "array" && !func_methods.isDyadicArr(data_known_x)) {
            return formula.error.v;
          }
          known_x = func_methods.getDataDyadicArr(data_known_x);
        } else if (getObjType(data_known_x) == "object" && data_known_x.startCell != null) {
          known_x = func_methods.getCellDataDyadicArr(data_known_x, "text");
        } else {
          if (!isRealNum(data_known_x)) {
            return formula.error.v;
          }
          var rowArr = [];
          rowArr.push(parseFloat(data_known_x));
          known_x.push(rowArr);
        }
        for (var i = 0; i < known_x.length; i++) {
          for (var j = 0; j < known_x[0].length; j++) {
            if (!isRealNum(known_x[i][j])) {
              return formula.error.v;
            }
            known_x[i][j] = parseFloat(known_x[i][j]);
          }
        }
      }
      var known_x_rowlen = known_x.length;
      var known_x_collen = known_x[0].length;

      //新 x 值
      var new_x = known_x;
      if (arguments.length >= 3) {
        var data_new_x = arguments[2];
        new_x = [];
        if (getObjType(data_new_x) == "array") {
          if (getObjType(data_new_x[0]) == "array" && !func_methods.isDyadicArr(data_new_x)) {
            return formula.error.v;
          }
          new_x = func_methods.getDataDyadicArr(data_new_x);
        } else if (getObjType(data_new_x) == "object" && data_new_x.startCell != null) {
          new_x = func_methods.getCellDataDyadicArr(data_new_x, "text");
        } else {
          if (!isRealNum(data_new_x)) {
            return formula.error.v;
          }
          var rowArr = [];
          rowArr.push(parseFloat(data_new_x));
          new_x.push(rowArr);
        }
        for (var i = 0; i < new_x.length; i++) {
          for (var j = 0; j < new_x[0].length; j++) {
            if (!isRealNum(new_x[i][j])) {
              return formula.error.v;
            }
            new_x[i][j] = parseFloat(new_x[i][j]);
          }
        }
      }

      //逻辑值
      var const_b = true;
      if (arguments.length == 4) {
        const_b = func_methods.getCellBoolen(arguments[3]);
        if (valueIsError(const_b)) {
          return const_b;
        }
      }
      if (known_y_rowlen != known_x_rowlen || known_y_collen != known_x_collen) {
        return formula.error.r;
      }

      //计算
      function leastSquare(arr_x, arr_y) {
        var xSum = 0,
          ySum = 0,
          xySum = 0,
          x2Sum = 0;
        for (var i = 0; i < arr_x.length; i++) {
          for (var j = 0; j < arr_x[i].length; j++) {
            xSum += arr_x[i][j];
            // ySum += arr_y[i][j];
            ySum += Math.log(arr_y[i][j]);
            // xySum += arr_x[i][j] * arr_y[i][j];
            xySum += arr_x[i][j] * Math.log(arr_y[i][j]);
            x2Sum += arr_x[i][j] * arr_x[i][j];
          }
        }
        var n = arr_x.length * arr_x[0].length;
        var xMean = xSum / n;
        var yMean = ySum / n;
        var xyMean = xySum / n;
        var x2Mean = x2Sum / n;
        var m = (xyMean - xMean * yMean) / (x2Mean - xMean * xMean);
        var b = yMean - m * xMean;
        return [Math.exp(m), Math.exp(b)];
      }
      var ls = leastSquare(known_x, known_y);
      var m = ls[0];
      if (const_b) {
        var b = ls[1];
      } else {
        var b = 1;
      }
      var result = [];
      for (var i = 0; i < new_x.length; i++) {
        for (var j = 0; j < new_x[i].length; j++) {
          var x = new_x[i][j];
          var y = b * Math.pow(m, x);
          // var y = Math.exp(b + m * x);

          result.push(Math.round(y * 1000000000) / 1000000000);
        }
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "LINEST": function () {
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
      return formula.error.v;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "LOGEST": function () {
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
      return formula.error.v;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "MDETERM": function () {
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
      //数组
      var data_array = arguments[0];
      var array = [];
      if (getObjType(data_array) == "array") {
        if (getObjType(data_array[0]) == "array" && !func_methods.isDyadicArr(data_array)) {
          return formula.error.v;
        }
        array = func_methods.getDataDyadicArr(data_array);
      } else if (getObjType(data_array) == "object" && data_array.startCell != null) {
        array = func_methods.getCellDataDyadicArr(data_array, "text");
      } else {
        var rowArr = [];
        rowArr.push(data_array);
        array.push(rowArr);
      }
      for (var i = 0; i < array.length; i++) {
        for (var j = 0; j < array[i].length; j++) {
          if (!isRealNum(array[i][j])) {
            return formula.error.v;
          }
          array[i][j] = parseFloat(array[i][j]);
        }
      }
      if (array.length != array[0].length) {
        return formula.error.v;
      }

      //计算
      function Ma(a, n) {
        var A;
        var b = new Array();
        if (n == 1) {
          A = a[0][0];
          return A;
        } else if (n == 2) {
          A = a[0][0] * a[1][1] - a[0][1] * a[1][0];
          return A;
        } else if (n == 3) {
          A = a[0][0] * a[1][1] * a[2][2] + a[1][0] * a[2][1] * a[0][2] + a[2][0] * a[0][1] * a[1][2] - a[2][0] * a[1][1] * a[0][2] - a[0][0] * a[2][1] * a[1][2] - a[1][0] * a[0][1] * a[2][2];
          return A;
        } else {
          A = 0;
          var c = new Array();
          var e = new Array();
          for (var i = 0; i < n; i++) {
            b[i] = a[i][0] * Math.pow(-1, i + 1 + 1);
          }
          for (var i = 0; i < n; i++) {
            e[i] = new Array();
            for (var j = 0; j < n - 1; j++) {
              e[i][j] = a[i][j + 1];
            }
          }
          for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
              c[j] = new Array();
              for (var k = 0; k < n - 1; k++) {
                if (i > j) {
                  c[j][k] = e[j][k];
                } else if (i < j) {
                  c[j - 1][k] = e[j][k];
                }
              }
            }
            A += b[i] * arguments.callee(c, n - 1);
          }
          return A;
        }
      }
      return Ma(array, array.length);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "MINVERSE": function () {
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
      //数组
      var data_array = arguments[0];
      var array = [];
      if (getObjType(data_array) == "array") {
        if (getObjType(data_array[0]) == "array" && !func_methods.isDyadicArr(data_array)) {
          return formula.error.v;
        }
        array = func_methods.getDataDyadicArr(data_array);
      } else if (getObjType(data_array) == "object" && data_array.startCell != null) {
        array = func_methods.getCellDataDyadicArr(data_array, "text");
      } else {
        var rowArr = [];
        rowArr.push(data_array);
        array.push(rowArr);
      }
      for (var i = 0; i < array.length; i++) {
        for (var j = 0; j < array[i].length; j++) {
          if (!isRealNum(array[i][j])) {
            return formula.error.v;
          }
          array[i][j] = parseFloat(array[i][j]);
        }
      }
      if (array.length != array[0].length) {
        return formula.error.v;
      }

      //计算
      return inverse(array);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "MMULT": function () {
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
      //数组1
      var data_array1 = arguments[0];
      var array1 = [];
      if (getObjType(data_array1) == "array") {
        if (getObjType(data_array1[0]) == "array" && !func_methods.isDyadicArr(data_array1)) {
          return formula.error.v;
        }
        array1 = func_methods.getDataDyadicArr(data_array1);
      } else if (getObjType(data_array1) == "object" && data_array1.startCell != null) {
        array1 = func_methods.getCellDataDyadicArr(data_array1, "text");
      } else {
        var rowArr = [];
        rowArr.push(data_array1);
        array1.push(rowArr);
      }
      for (var i = 0; i < array1.length; i++) {
        for (var j = 0; j < array1[i].length; j++) {
          if (!isRealNum(array1[i][j])) {
            return formula.error.v;
          }
          array1[i][j] = parseFloat(array1[i][j]);
        }
      }

      //数组2
      var data_array2 = arguments[1];
      var array2 = [];
      if (getObjType(data_array2) == "array") {
        if (getObjType(data_array2[0]) == "array" && !func_methods.isDyadicArr(data_array2)) {
          return formula.error.v;
        }
        array2 = func_methods.getDataDyadicArr(data_array2);
      } else if (getObjType(data_array2) == "object" && data_array2.startCell != null) {
        array2 = func_methods.getCellDataDyadicArr(data_array2, "text");
      } else {
        var rowArr = [];
        rowArr.push(data_array2);
        array2.push(rowArr);
      }
      for (var i = 0; i < array2.length; i++) {
        for (var j = 0; j < array2[i].length; j++) {
          if (!isRealNum(array2[i][j])) {
            return formula.error.v;
          }
          array2[i][j] = parseFloat(array2[i][j]);
        }
      }

      //计算
      if (array1[0].length != array2.length) {
        return formula.error.v;
      }
      var rowlen = array1.length;
      var collen = array2[0].length;
      var result = [];
      for (var m = 0; m < rowlen; m++) {
        var rowArr = [];
        for (var n = 0; n < collen; n++) {
          var value = 0;
          for (var p = 0; p < array1[0].length; p++) {
            value += array1[m][p] * array2[p][n];
          }
          rowArr.push(value);
        }
        result.push(rowArr);
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "SUMPRODUCT": function () {
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
      //第一个数组
      //数组1
      var data_array1 = arguments[0];
      var array1 = [];
      if (getObjType(data_array1) == "array") {
        if (getObjType(data_array1[0]) == "array" && !func_methods.isDyadicArr(data_array1)) {
          return formula.error.v;
        }
        array1 = func_methods.getDataDyadicArr(data_array1);
      } else if (getObjType(data_array1) == "object" && data_array1.startCell != null) {
        array1 = func_methods.getCellDataDyadicArr(data_array1, "text");
      } else {
        var rowArr = [];
        rowArr.push(data_array1);
        array1.push(rowArr);
      }
      for (var i = 0; i < array1.length; i++) {
        for (var j = 0; j < array1[i].length; j++) {
          if (!isRealNum(array1[i][j])) {
            array1[i][j] = 0;
          } else {
            array1[i][j] = parseFloat(array1[i][j]);
          }
        }
      }
      var rowlen = array1.length;
      var collen = array1[0].length;
      if (arguments.length >= 2) {
        for (var i = 1; i < arguments.length; i++) {
          var data = arguments[i];
          var arr = [];
          if (getObjType(data) == "array") {
            if (getObjType(data[0]) == "array" && !func_methods.isDyadicArr(data)) {
              return formula.error.v;
            }
            arr = func_methods.getDataDyadicArr(data);
          } else if (getObjType(data) == "object" && data.startCell != null) {
            arr = func_methods.getCellDataDyadicArr(data, "text");
          } else {
            var rowArr = [];
            rowArr.push(data);
            arr.push(rowArr);
          }
          if (arr.length != rowlen || arr[0].length != collen) {
            return formula.error.v;
          }
          for (var m = 0; m < rowlen; m++) {
            for (var n = 0; n < collen; n++) {
              if (!isRealNum(arr[m][n])) {
                array1[m][n] = 0;
              } else {
                array1[m][n] = array1[m][n] * parseFloat(arr[m][n]);
              }
            }
          }
        }
      }
      var sum = 0;
      for (var m = 0; m < rowlen; m++) {
        for (var n = 0; n < collen; n++) {
          sum += array1[m][n];
        }
      }
      return sum;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  }
};
export default arrayMatrixFunctions;