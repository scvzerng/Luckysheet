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
const statisticalFunctions = {
  "AVERAGE": function () {
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
          if (getObjType(data[0]) == "array") {
            if (!func_methods.isDyadicArr(data)) {
              return formula.error.v;
            }
            dataArr = dataArr.concat(func_methods.getDataArr(data, true));
          } else {
            dataArr = dataArr.concat(data);
          }
        } else if (getObjType(data) == "object" && data.startCell != null) {
          dataArr = dataArr.concat(func_methods.getCellDataArr(data, "text", true));
        } else {
          dataArr.push(data);
        }
      }
      var sum = 0,
        count = 0;
      for (var i = 0; i < dataArr.length; i++) {
        if (valueIsError(dataArr[i])) {
          return dataArr[i];
        } else if (!isRealNum(dataArr[i])) {
          return formula.error.v;
        }
        sum = luckysheet_calcADPMM(sum, "+", dataArr[i]); // parseFloat(dataArr[i]);
        count++;
      }
      if (count == 0) {
        return formula.error.d;
      }
      return luckysheet_calcADPMM(sum, "/", count); // sum / count;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "COUNT": function () {
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
          if (getObjType(data[0]) == "array") {
            if (!func_methods.isDyadicArr(data)) {
              return formula.error.v;
            }
            dataArr = dataArr.concat(func_methods.getDataArr(data, true));
          } else {
            dataArr = dataArr.concat(data);
          }
        } else if (getObjType(data) == "object" && data.startCell != null) {
          dataArr = dataArr.concat(func_methods.getCellDataArr(data, "text", true));
        } else {
          if (getObjType(data) == "boolean") {
            if (data.toString().toLowerCase() == "true") {
              dataArr.push(1);
            } else if (data.toString().toLowerCase() == "false") {
              dataArr.push(0);
            }
          } else {
            dataArr.push(data);
          }
        }
      }
      var count = 0;
      for (var i = 0; i < dataArr.length; i++) {
        if (isRealNum(dataArr[i])) {
          count++;
        }
      }
      return count;
    } catch (e) {
      var err = e;
      //计算错误检测
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "COUNTA": function () {
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
          if (getObjType(data[0]) == "array") {
            if (!func_methods.isDyadicArr(data)) {
              return formula.error.v;
            }
            dataArr = dataArr.concat(func_methods.getDataArr(data));
          } else {
            dataArr = dataArr.concat(data);
          }
        } else if (getObjType(data) == "object" && data.startCell != null) {
          dataArr = dataArr.concat(func_methods.getCellDataArr(data, "text", true));
        } else {
          dataArr.push(data);
        }
      }
      return dataArr.length;
    } catch (err) {
      //计算错误检测
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "MAX": function () {
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
          if (getObjType(data[0]) == "array") {
            if (!func_methods.isDyadicArr(data)) {
              return formula.error.v;
            }
            dataArr = dataArr.concat(func_methods.getDataArr(data, true));
          } else {
            dataArr = dataArr.concat(data);
          }
        } else if (getObjType(data) == "object" && data.startCell != null) {
          dataArr = dataArr.concat(func_methods.getCellDataArr(data, "number", true));
        } else {
          dataArr.push(data);
        }
      }
      var max = null;
      for (var i = 0; i < dataArr.length; i++) {
        if (valueIsError(dataArr[i])) {
          return dataArr[i];
        }
        if (!isRealNum(dataArr[i])) {
          continue;
        }
        if (max == null || parseFloat(dataArr[i]) > max) {
          max = parseFloat(dataArr[i]);
        }
      }
      return max == null ? 0 : max;
    } catch (e) {
      var err = e;
      //计算错误检测
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "MIN": function () {
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
          if (getObjType(data[0]) == "array") {
            if (!func_methods.isDyadicArr(data)) {
              return formula.error.v;
            }
            dataArr = dataArr.concat(func_methods.getDataArr(data, true));
          } else {
            dataArr = dataArr.concat(data);
          }
        } else if (getObjType(data) == "object" && data.startCell != null) {
          dataArr = dataArr.concat(func_methods.getCellDataArr(data, "number", true));
        } else {
          dataArr.push(data);
        }
      }
      var min = null;
      for (var i = 0; i < dataArr.length; i++) {
        if (valueIsError(dataArr[i])) {
          return dataArr[i];
        }
        if (!isRealNum(dataArr[i])) {
          continue;
        }
        if (min == null || parseFloat(dataArr[i]) < min) {
          min = parseFloat(dataArr[i]);
        }
      }
      return min == null ? 0 : min;
    } catch (e) {
      var err = e;
      //计算错误检测
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "COUNTBLANK": function () {
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
      var data = arguments[0];
      var sum = 0;
      if (getObjType(data) == "object" && data.startCell != null) {
        if (data.data == null) {
          return 1;
        }
        if (getObjType(data.data) == "array") {
          for (var r = 0; r < data.data.length; r++) {
            for (var c = 0; c < data.data[r].length; c++) {
              if (data.data[r][c] == null || isRealNull(data.data[r][c].v)) {
                sum++;
              }
            }
          }
        } else {
          if (isRealNull(data.data.v)) {
            sum++;
          }
        }
      }
      return sum;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "SUBTOTAL": function () {
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
      //数字 1-11 或 101-111，用于指定要为分类汇总使用的函数
      var data_function_num = arguments[0];
      var function_num;
      if (getObjType(data_function_num) == "array") {
        if (getObjType(data_function_num[0]) == "array") {
          if (!func_methods.isDyadicArr(data_function_num)) {
            return formula.error.v;
          }
          function_num = [];
          for (var i = 0; i < data_function_num.length; i++) {
            var rowArr = [];
            for (var j = 0; j < data_function_num[i].length; j++) {
              rowArr.push(data_function_num[i][j]);
            }
            function_num.push(rowArr);
          }
        } else {
          function_num = [];
          for (var i = 0; i < data_function_num.length; i++) {
            function_num.push(data_function_num[i]);
          }
        }
      } else if (getObjType(data_function_num) == "object" && data_function_num.startCell != null) {
        function_num = func_methods.getFirstValue(data_function_num);
      } else {
        function_num = data_function_num;
      }
      var arr = Array.prototype.slice.apply(arguments);
      arr.shift();

      //计算结果
      if (getObjType(function_num) == "array") {
        var result = [];
        if (getObjType(function_num[0]) == "array") {
          for (var i = 0; i < function_num.length; i++) {
            var rowArr = [];
            for (var j = 0; j < function_num[i].length; j++) {
              var value = function_num[i][j];
              if (valueIsError(value)) {
                rowArr.push(value);
              } else if (!isRealNum(value)) {
                rowArr.push(formula.error.v);
              } else {
                value = parseInt(value);
                if (value < 1 || value > 111 || value > 11 && value < 101) {
                  rowArr.push(formula.error.v);
                } else {
                  rowArr.push(compute(value));
                }
              }
            }
            result.push(rowArr);
          }
        } else {
          for (var i = 0; i < function_num.length; i++) {
            var value = function_num[i];
            if (valueIsError(value)) {
              result.push(value);
            } else if (!isRealNum(value)) {
              result.push(formula.error.v);
            } else {
              value = parseInt(value);
              if (value < 1 || value > 111 || value > 11 && value < 101) {
                result.push(formula.error.v);
              } else {
                result.push(compute(value));
              }
            }
          }
        }
        return result;
      } else {
        if (valueIsError(function_num)) {
          return function_num;
        }
        if (!isRealNum(function_num)) {
          return formula.error.v;
        }
        function_num = parseInt(function_num);
        if (function_num < 1 || function_num > 111 || function_num > 11 && function_num < 101) {
          return formula.error.v;
        }
        return compute(function_num);
      }
      function compute(function_num) {
        switch (function_num) {
          case 1: //AVERAGE
          case 101:
            return window.luckysheet_function.AVERAGE.f.apply(window.luckysheet_function.AVERAGE, arr);
            break;
          case 2: //COUNT
          case 102:
            return window.luckysheet_function.COUNT.f.apply(window.luckysheet_function.COUNT, arr);
            break;
          case 3: //COUNTA
          case 103:
            return window.luckysheet_function.COUNTA.f.apply(window.luckysheet_function.COUNTA, arr);
            break;
          case 4: //MAX
          case 104:
            return window.luckysheet_function.MAX.f.apply(window.luckysheet_function.MAX, arr);
            break;
          case 5: //MIN
          case 105:
            return window.luckysheet_function.MIN.f.apply(window.luckysheet_function.MIN, arr);
            break;
          case 6: //PRODUCT
          case 106:
            return window.luckysheet_function.PRODUCT.f.apply(window.luckysheet_function.PRODUCT, arr);
            break;
          case 7: //STDEV
          case 107:
            return window.luckysheet_function.STDEVA.f.apply(window.luckysheet_function.STDEVA, arr);
            break;
          case 8: //STDEVP
          case 108:
            return window.luckysheet_function.STDEVP.f.apply(window.luckysheet_function.STDEVP, arr);
            break;
          case 9: //SUM
          case 109:
            return window.luckysheet_function.SUM.f.apply(window.luckysheet_function.SUM, arr);
            break;
          case 10: //VAR
          case 110:
            return window.luckysheet_function.VAR_S.f.apply(window.luckysheet_function.VAR_S, arr);
            break;
          case 11: //VARP
          case 111:
            return window.luckysheet_function.VAR_P.f.apply(window.luckysheet_function.VAR_P, arr);
            break;
        }
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "COUNTIF": function () {
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
      //范围
      var data_range = arguments[0];
      var range;
      if (getObjType(data_range) == "object" && data_range.startCell != null) {
        range = data_range.data;
      } else {
        return formula.error.v;
      }

      //条件
      var data_criteria = arguments[1];
      var criteria;
      if (getObjType(data_criteria) == "array") {
        criteria = [];
        if (getObjType(data_criteria[0]) == "array") {
          if (!func_methods.isDyadicArr(data_criteria)) {
            return formula.error.v;
          }
          for (var i = 0; i < data_criteria.length; i++) {
            var rowArr = [];
            for (var j = 0; j < data_criteria[i].length; j++) {
              rowArr.push(data_criteria[i][j]);
            }
            criteria.push(rowArr);
          }
        } else {
          for (var i = 0; i < data_criteria.length; i++) {
            criteria.push(data_criteria[i]);
          }
        }
      } else if (getObjType(data_criteria) == "object" && data_criteria.startCell != null) {
        if (data_criteria.rowl > 1 || data_criteria.coll > 1) {
          return 0;
        }
        criteria = data_criteria.data.v;
      } else {
        criteria = data_criteria;
      }

      //计算
      if (getObjType(criteria) == "array") {
        var result = [];
        if (getObjType(criteria[0]) == "array") {
          for (var i = 0; i < criteria.length; i++) {
            var rowArr = [];
            for (var j = 0; j < criteria[i].length; j++) {
              rowArr.push(getCriteriaResult(range, criteria[i][j]));
            }
            result.push(rowArr);
          }
        } else {
          for (var i = 0; i < criteria.length; i++) {
            result.push(getCriteriaResult(range, criteria[i]));
          }
        }
        return result;
      } else {
        return getCriteriaResult(range, criteria);
      }
      function getCriteriaResult(range, criter) {
        if (!/[<>=!*?]/.test(criter)) {
          criter = '=="' + criter + '"';
        }
        criter = criter.replace("<>", "!=");
        var matches = 0;
        if (getObjType(range) == "array") {
          for (var i = 0; i < range.length; i++) {
            for (var j = 0; j < range[i].length; j++) {
              if (range[i][j] != null && !isRealNull(range[i][j].v)) {
                var value = range[i][j].v;
                if (criter.indexOf("*") > -1 || criter.indexOf("?") > -1) {
                  if (formula.isWildcard(value, criter)) {
                    matches++;
                  }
                } else {
                  if (typeof value !== 'string') {
                    if (new Function("return " + value + criter)()) {
                      matches++;
                    }
                  } else {
                    if (new Function("return " + '"' + value + '"' + criter)()) {
                      matches++;
                    }
                  }
                }
              }
            }
          }
        } else {
          if (range != null && !isRealNull(range.v)) {
            var value = range.v;
            if (criter.indexOf("*") > -1 || criter.indexOf("?") > -1) {
              if (formula.isWildcard(value, criter)) {
                matches++;
              }
            } else {
              if (typeof value !== 'string') {
                if (new Function("return " + value + criter)()) {
                  matches++;
                }
              } else {
                if (new Function("return " + '"' + value + '"' + criter)()) {
                  matches++;
                }
              }
            }
          }
        }
        return matches;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "COUNTUNIQUE": function () {
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
      return window.luckysheet_function.UNIQUE.f(dataArr);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "COUNTIFS": function () {
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
      var args = arguments;
      luckysheet_getValue(args);
      var results = new Array(formula.getRangeArray(args[0])[0].length);
      for (var i = 0; i < results.length; i++) {
        results[i] = true;
      }
      for (var i = 0; i < args.length; i += 2) {
        var range = formula.getRangeArray(args[i])[0];
        var criteria = args[i + 1];
        for (var j = 0; j < range.length; j++) {
          var v = range[j];
          results[j] = results[j] && !!v && formula.acompareb(v, criteria);
        }
      }
      var result = 0;
      for (var i = 0; i < results.length; i++) {
        if (results[i]) {
          result++;
        }
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "HARMEAN": function () {
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
          dataArr.push(data);
        }
      }
      var den = 0,
        len = 0;
      for (var i = 0; i < dataArr.length; i++) {
        var number = dataArr[i];
        if (!isRealNum(number)) {
          return formula.error.v;
        }
        number = parseFloat(number);
        if (number <= 0) {
          return formula.error.nm;
        }
        den += 1 / number;
        len++;
      }
      return len / den;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "HYPGEOMDIST": function () {
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
      //样本中成功的次数
      var sample_s = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(sample_s)) {
        return sample_s;
      }
      if (!isRealNum(sample_s)) {
        return formula.error.v;
      }
      sample_s = parseInt(sample_s);

      //样本量
      var number_sample = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(number_sample)) {
        return number_sample;
      }
      if (!isRealNum(number_sample)) {
        return formula.error.v;
      }
      number_sample = parseInt(number_sample);

      //总体中成功的次数
      var population_s = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(population_s)) {
        return population_s;
      }
      if (!isRealNum(population_s)) {
        return formula.error.v;
      }
      population_s = parseInt(population_s);

      //总体大小
      var number_pop = func_methods.getFirstValue(arguments[3]);
      if (valueIsError(number_pop)) {
        return number_pop;
      }
      if (!isRealNum(number_pop)) {
        return formula.error.v;
      }
      number_pop = parseInt(number_pop);

      //决定函数形式的逻辑值
      var cumulative = func_methods.getCellBoolen(arguments[4]);
      if (valueIsError(cumulative)) {
        return cumulative;
      }
      if (sample_s < 0 || sample_s > Math.min(number_sample, population_s) || sample_s < Math.max(0, number_sample - number_pop + population_s)) {
        return formula.error.nm;
      }
      if (number_sample <= 0 || number_sample > number_pop) {
        return formula.error.nm;
      }
      if (population_s <= 0 || population_s > number_pop) {
        return formula.error.nm;
      }
      if (number_pop <= 0) {
        return formula.error.nm;
      }

      //计算
      function pdf(x, n, M, N) {
        var a = func_methods.factorial(M) / (func_methods.factorial(x) * func_methods.factorial(M - x));
        var b = func_methods.factorial(N - M) / (func_methods.factorial(n - x) * func_methods.factorial(N - M - n + x));
        var c = func_methods.factorial(N) / (func_methods.factorial(n) * func_methods.factorial(N - n));
        return a * b / c;
      }
      function cdf(x, n, M, N) {
        var sum = 0;
        for (var i = 0; i <= x; i++) {
          sum += pdf(i, n, M, N);
        }
        return sum;
      }
      return cumulative ? cdf(sample_s, number_sample, population_s, number_pop) : pdf(sample_s, number_sample, population_s, number_pop);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
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
  "LARGE": function () {
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
      //数组或范围
      var dataArr = [];
      if (getObjType(arguments[0]) == "array") {
        if (getObjType(arguments[0][0]) == "array" && !func_methods.isDyadicArr(arguments[0])) {
          return formula.error.v;
        }
        dataArr = dataArr.concat(func_methods.getDataArr(arguments[0], true));
      } else if (getObjType(arguments[0]) == "object" && arguments[0].startCell != null) {
        dataArr = dataArr.concat(func_methods.getCellDataArr(arguments[0], "text", true));
      } else {
        dataArr.push(arguments[0]);
      }
      var dataArr_n = [];
      for (var j = 0; j < dataArr.length; j++) {
        var number = dataArr[j];
        if (!isRealNum(number)) {
          return formula.error.v;
        }
        number = parseFloat(number);
        dataArr_n.push(number);
      }

      //要返回的元素的排行位置
      var n;
      if (getObjType(arguments[1]) == "array") {
        if (getObjType(arguments[1][0]) == "array" && !func_methods.isDyadicArr(arguments[1])) {
          return formula.error.v;
        }
        n = func_methods.getDataArr(arguments[1]);
      } else if (getObjType(arguments[1]) == "object" && arguments[1].startCell != null) {
        if (arguments[1].rowl > 1 || arguments[1].coll > 1) {
          return formula.error.v;
        }
        var cell = arguments[1].data;
        if (cell == null || isRealNull(cell.v)) {
          var n = 0;
        } else {
          var n = cell.v;
        }
      } else {
        n = arguments[1];
      }

      //计算
      if (getObjType(n) == "array") {
        if (dataArr_n.length == 0) {
          return formula.error.nm;
        }
        var result = [];
        for (var i = 0; i < n.length; i++) {
          if (!isRealNum(n[i])) {
            result.push(formula.error.v);
            continue;
          }
          n[i] = Math.ceil(parseFloat(n[i]));
          if (n[i] <= 0 || n[i] > dataArr_n.length) {
            result.push(formula.error.nm);
            continue;
          }
          result.push(dataArr.sort(function (a, b) {
            return b - a;
          })[n[i] - 1]);
        }
        return result;
      } else {
        if (!isRealNum(n)) {
          return formula.error.v;
        }
        n = Math.ceil(parseFloat(n));
        if (dataArr_n.length == 0) {
          return formula.error.nm;
        }
        if (n <= 0 || n > dataArr_n.length) {
          return formula.error.nm;
        }
        return dataArr.sort(function (a, b) {
          return b - a;
        })[n - 1];
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "STDEVA": function () {
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
          dataArr = dataArr.concat(func_methods.getDataArr(data, false));
        } else if (getObjType(data) == "object" && data.startCell != null) {
          dataArr = dataArr.concat(func_methods.getCellDataArr(data, "text", false));
        } else {
          dataArr.push(data);
        }
      }

      //不是数值类型的值转化成数字（true为1，false和文本为0）
      var dataArr_n = [];
      for (var j = 0; j < dataArr.length; j++) {
        var number = dataArr[j];
        if (!isRealNum(number)) {
          if (number.toString().toLowerCase() == "true") {
            number = 1;
          } else {
            number = 0;
          }
        } else {
          number = parseFloat(number);
        }
        dataArr_n.push(number);
      }
      if (dataArr_n.length == 0) {
        return 0;
      }
      if (dataArr_n.length == 1) {
        return formula.error.d;
      }
      return func_methods.standardDeviation_s(dataArr_n);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "STDEVP": function () {
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
      if (dataArr_n.length == 0) {
        return 0;
      }
      if (dataArr_n.length == 1) {
        return formula.error.d;
      }
      return func_methods.standardDeviation(dataArr_n);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "GEOMEAN": function () {
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
          if (getObjType(data) == "boolean") {
            if (data.toString().toLowerCase() == "true") {
              dataArr.push(1);
            } else if (data.toString().toLowerCase() == "false") {
              dataArr.push(0);
            }
          } else if (isRealNum(data)) {
            dataArr.push(data);
          } else {
            return formula.error.v;
          }
        }
      }

      //剔除不是数值类型的值
      var dataArr_n = [];
      for (var j = 0; j < dataArr.length; j++) {
        var number = dataArr[j];
        if (!isRealNum(number)) {
          continue;
        }
        number = parseFloat(number);
        if (number <= 0) {
          return formula.error.nm;
        }
        dataArr_n.push(number);
      }
      if (dataArr_n.length == 0) {
        return formula.error.nm;
      }
      return jStat.geomean(dataArr_n);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "RANK_EQ": function () {
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
      //要确定其排名的值
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);

      //包含相关数据集的数组或范围
      var data_ref = arguments[1];
      var ref = [];
      if (getObjType(data_ref) == "array") {
        if (getObjType(data_ref[0]) == "array" && !func_methods.isDyadicArr(data_ref)) {
          return formula.error.v;
        }
        ref = ref.concat(func_methods.getDataArr(data_ref, true));
      } else if (getObjType(data_ref) == "object" && data_ref.startCell != null) {
        ref = ref.concat(func_methods.getCellDataArr(data_ref, "number", true));
      } else {
        ref.push(data_ref);
      }
      var ref_n = [];
      for (var j = 0; j < ref.length; j++) {
        var num = ref[j];
        if (!isRealNum(num)) {
          return formula.error.v;
        }
        num = parseFloat(num);
        ref_n.push(num);
      }

      //要按升序还是按降序考虑“data”中的值
      if (arguments.length == 3) {
        var order = func_methods.getCellBoolen(arguments[2]);
        if (valueIsError(order)) {
          return order;
        }
      } else {
        var order = false;
      }

      //计算
      var sort = order ? function (a, b) {
        return a - b;
      } : function (a, b) {
        return b - a;
      };
      ref_n = ref_n.sort(sort);
      var index = ref_n.indexOf(number);
      if (index == -1) {
        return formula.error.na;
      } else {
        return index + 1;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "RANK_AVG": function () {
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
      //要确定其排名的值
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);

      //包含相关数据集的数组或范围
      var data_ref = arguments[1];
      var ref = [];
      if (getObjType(data_ref) == "array") {
        if (getObjType(data_ref[0]) == "array" && !func_methods.isDyadicArr(data_ref)) {
          return formula.error.v;
        }
        ref = ref.concat(func_methods.getDataArr(data_ref, true));
      } else if (getObjType(data_ref) == "object" && data_ref.startCell != null) {
        ref = ref.concat(func_methods.getCellDataArr(data_ref, "number", true));
      } else {
        ref.push(data_ref);
      }
      var ref_n = [];
      for (var j = 0; j < ref.length; j++) {
        var num = ref[j];
        if (!isRealNum(num)) {
          return formula.error.v;
        }
        num = parseFloat(num);
        ref_n.push(num);
      }

      //要按升序还是按降序考虑“data”中的值
      if (arguments.length == 3) {
        var order = func_methods.getFirstValue(arguments[2]);
        if (valueIsError(order)) {
          return order;
        }
        if (getObjType(order) == "boolean") {} else if (getObjType(order) == "string" && (order.toLowerCase() == "true" || order.toLowerCase() == "false")) {
          if (order.toLowerCase() == "true") {
            order = true;
          }
          if (order.toLowerCase() == "false") {
            order = false;
          }
        } else if (isRealNum(order)) {
          order = parseFloat(order);
          order = order == 0 ? false : true;
        } else {
          return formula.error.v;
        }
      } else {
        var order = false;
      }

      //计算
      var sort = order ? function (a, b) {
        return a - b;
      } : function (a, b) {
        return b - a;
      };
      ref_n = ref_n.sort(sort);
      var count = 0;
      for (var i = 0; i < ref_n.length; i++) {
        if (ref_n[i] == number) {
          count++;
        }
      }
      return count > 1 ? (2 * ref_n.indexOf(number) + count + 1) / 2 : ref_n.indexOf(number) + 1;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "PERCENTRANK_EXC": function () {
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
      //包含相关数据集的数组或范围
      var data_ref = arguments[0];
      var ref = [];
      if (getObjType(data_ref) == "array") {
        if (getObjType(data_ref[0]) == "array" && !func_methods.isDyadicArr(data_ref)) {
          return formula.error.v;
        }
        ref = ref.concat(func_methods.getDataArr(data_ref, true));
      } else if (getObjType(data_ref) == "object" && data_ref.startCell != null) {
        ref = ref.concat(func_methods.getCellDataArr(data_ref, "number", true));
      } else {
        ref.push(data_ref);
      }
      var ref_n = [];
      for (var j = 0; j < ref.length; j++) {
        var number = ref[j];
        if (!isRealNum(number)) {
          return formula.error.v;
        }
        number = parseFloat(number);
        ref_n.push(number);
      }

      //要确定其百分比排位的值
      var x = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);

      //要在计算中使用的有效位数
      if (arguments.length == 3) {
        var significance = func_methods.getFirstValue(arguments[2]);
        if (valueIsError(significance)) {
          return significance;
        }
        if (!isRealNum(significance)) {
          return formula.error.v;
        }
        significance = parseInt(significance);
      } else {
        var significance = 3;
      }
      if (ref_n.length == 0) {
        return formula.error.nm;
      }
      if (significance < 1) {
        return formula.error.nm;
      }

      //计算
      if (ref_n.length == 1 && ref_n[0] == x) {
        return 1;
      }
      ref_n = ref_n.sort(function (a, b) {
        return a - b;
      });
      var uniques = window.luckysheet_function.UNIQUE.f(ref_n)[0];
      var n = ref_n.length;
      var m = uniques.length;
      var power = Math.pow(10, significance);
      var result = 0;
      var match = false;
      var i = 0;
      while (!match && i < m) {
        if (x === uniques[i]) {
          result = (ref_n.indexOf(uniques[i]) + 1) / (n + 1);
          match = true;
        } else if (x >= uniques[i] && (x < uniques[i + 1] || i === m - 1)) {
          result = (ref_n.lastIndexOf(uniques[i]) + 1 + (x - uniques[i]) / (uniques[i + 1] - uniques[i])) / (n + 1);
          match = true;
        }
        i++;
      }
      if (isNaN(result)) {
        return formula.error.na;
      } else {
        return Math.floor(result * power) / power;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "PERCENTRANK_INC": function () {
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
      //包含相关数据集的数组或范围
      var data_ref = arguments[0];
      var ref = [];
      if (getObjType(data_ref) == "array") {
        if (getObjType(data_ref[0]) == "array" && !func_methods.isDyadicArr(data_ref)) {
          return formula.error.v;
        }
        ref = ref.concat(func_methods.getDataArr(data_ref, true));
      } else if (getObjType(data_ref) == "object" && data_ref.startCell != null) {
        ref = ref.concat(func_methods.getCellDataArr(data_ref, "number", true));
      } else {
        ref.push(data_ref);
      }
      var ref_n = [];
      for (var j = 0; j < ref.length; j++) {
        var number = ref[j];
        if (!isRealNum(number)) {
          return formula.error.v;
        }
        number = parseFloat(number);
        ref_n.push(number);
      }

      //要确定其百分比排位的值
      var x = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);

      //要在计算中使用的有效位数
      if (arguments.length == 3) {
        var significance = func_methods.getFirstValue(arguments[2]);
        if (valueIsError(significance)) {
          return significance;
        }
        if (!isRealNum(significance)) {
          return formula.error.v;
        }
        significance = parseInt(significance);
      } else {
        var significance = 3;
      }
      if (ref_n.length == 0) {
        return formula.error.nm;
      }
      if (significance < 1) {
        return formula.error.nm;
      }

      //计算
      if (ref_n.length == 1 && ref_n[0] == x) {
        return 1;
      }
      ref_n = ref_n.sort(function (a, b) {
        return a - b;
      });
      var uniques = window.luckysheet_function.UNIQUE.f(ref_n)[0];
      var n = ref_n.length;
      var m = uniques.length;
      var power = Math.pow(10, significance);
      var result = 0;
      var match = false;
      var i = 0;
      while (!match && i < m) {
        if (x === uniques[i]) {
          result = ref_n.indexOf(uniques[i]) / (n - 1);
          match = true;
        } else if (x >= uniques[i] && (x < uniques[i + 1] || i === m - 1)) {
          result = (ref_n.lastIndexOf(uniques[i]) + (x - uniques[i]) / (uniques[i + 1] - uniques[i])) / (n - 1);
          match = true;
        }
        i++;
      }
      if (isNaN(result)) {
        return formula.error.na;
      } else {
        return Math.floor(result * power) / power;
      }
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
  "MODE_SNGL": function () {
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
            return formula.error.v;
          }
          dataArr.push(data);
        }
      }
      var dataArr_n = [];
      for (var i = 0; i < dataArr.length; i++) {
        var number = dataArr[i];
        if (isRealNum(number)) {
          dataArr_n.push(parseFloat(number));
        }
      }
      var count = {};
      var maxItems = [];
      var max = 0;
      var currentItem;
      for (var i = 0; i < dataArr_n.length; i++) {
        currentItem = dataArr_n[i];
        count[currentItem] = count[currentItem] ? count[currentItem] + 1 : 1;
        if (count[currentItem] > max) {
          max = count[currentItem];
          maxItems = [];
        }
        if (count[currentItem] == max) {
          maxItems[maxItems.length] = currentItem;
        }
      }
      if (max <= 1) {
        return formula.error.na;
      }
      var resultIndex = dataArr_n.indexOf(maxItems[0]);
      for (var j = 0; j < maxItems.length; j++) {
        var index = dataArr_n.indexOf(maxItems[j]);
        if (index < resultIndex) {
          resultIndex = index;
        }
      }
      return dataArr_n[resultIndex];
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "WEIBULL_DIST": function () {
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
      //WEIBULL 分布函数的输入值
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);

      //Weibull 分布函数的形状参数
      var alpha = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(alpha)) {
        return alpha;
      }
      if (!isRealNum(alpha)) {
        return formula.error.v;
      }
      alpha = parseFloat(alpha);

      //Weibull 分布函数的尺度参数
      var beta = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(beta)) {
        return beta;
      }
      if (!isRealNum(beta)) {
        return formula.error.v;
      }
      beta = parseFloat(beta);

      //决定函数形式的逻辑值
      var cumulative = func_methods.getCellBoolen(arguments[3]);
      if (valueIsError(cumulative)) {
        return cumulative;
      }
      if (x < 0 || alpha <= 0 || beta <= 0) {
        return formula.error.nm;
      }
      return cumulative ? 1 - Math.exp(-Math.pow(x / beta, alpha)) : Math.pow(x, alpha - 1) * Math.exp(-Math.pow(x / beta, alpha)) * alpha / Math.pow(beta, alpha);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "AVEDEV": function () {
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
            return formula.error.v;
          }
          dataArr.push(data);
        }
      }
      var dataArr_n = [];
      for (var i = 0; i < dataArr.length; i++) {
        var number = dataArr[i];
        if (isRealNum(number)) {
          dataArr_n.push(parseFloat(number));
        }
      }
      if (dataArr_n.length == 0) {
        return formula.error.nm;
      }
      return jStat.sum(jStat(dataArr_n).subtract(jStat.mean(dataArr_n)).abs()[0]) / dataArr_n.length;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "AVERAGEA": function () {
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
          dataArr = dataArr.concat(func_methods.getDataArr(data, false));
        } else if (getObjType(data) == "object" && data.startCell != null) {
          dataArr = dataArr.concat(func_methods.getCellDataArr(data, "number", true));
        } else {
          if (number.toString.toLowerCase() == "true") {
            dataArr.push(1);
          } else if (number.toString.toLowerCase() == "false") {
            dataArr.push(0);
          } else if (isRealNum(data)) {
            dataArr.push(data);
          } else {
            return formula.error.v;
          }
        }
      }
      var sum = 0,
        count = 0;
      for (var i = 0; i < dataArr.length; i++) {
        var number = dataArr[i];
        if (isRealNum(number)) {
          sum += parseFloat(number);
        } else {
          if (number.toString().toLowerCase() == "true") {
            sum += 1;
          } else {
            sum += 0;
          }
        }
        count++;
      }
      if (count == 0) {
        return formula.error.d;
      }
      return sum / count;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "BINOM_DIST": function () {
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
      //试验的成功次数
      var number_s = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number_s)) {
        return number_s;
      }
      if (!isRealNum(number_s)) {
        return formula.error.v;
      }
      number_s = parseInt(number_s);

      //独立检验的次数
      var trials = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(trials)) {
        return trials;
      }
      if (!isRealNum(trials)) {
        return formula.error.v;
      }
      trials = parseInt(trials);

      //任一给定检验的成功概率
      var probability_s = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(probability_s)) {
        return probability_s;
      }
      if (!isRealNum(probability_s)) {
        return formula.error.v;
      }
      probability_s = parseFloat(probability_s);

      //是否使用二项式累积分布
      var cumulative = func_methods.getCellBoolen(arguments[3]);
      if (valueIsError(cumulative)) {
        return cumulative;
      }
      if (number_s < 0 || number_s > trials) {
        return formula.error.nm;
      }
      if (probability_s < 0 || probability_s > 1) {
        return formula.error.nm;
      }
      return cumulative ? jStat.binomial.cdf(number_s, trials, probability_s) : jStat.binomial.pdf(number_s, trials, probability_s);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "BINOM_INV": function () {
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
      //贝努利试验次数
      var trials = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(trials)) {
        return trials;
      }
      if (!isRealNum(trials)) {
        return formula.error.v;
      }
      trials = parseInt(trials);

      //任一次给定检验的成功概率
      var probability_s = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(probability_s)) {
        return probability_s;
      }
      if (!isRealNum(probability_s)) {
        return formula.error.v;
      }
      probability_s = parseFloat(probability_s);

      //期望的临界概率
      var alpha = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(alpha)) {
        return alpha;
      }
      if (!isRealNum(alpha)) {
        return formula.error.v;
      }
      alpha = parseFloat(alpha);
      if (trials < 0) {
        return formula.error.nm;
      }
      if (probability_s < 0 || probability_s > 1) {
        return formula.error.nm;
      }
      if (alpha < 0 || alpha > 1) {
        return formula.error.nm;
      }

      //计算
      var x = 0;
      while (x <= trials) {
        if (jStat.binomial.cdf(x, trials, probability_s) >= alpha) {
          return x;
        }
        x++;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "CONFIDENCE_NORM": function () {
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
      //置信水平
      var alpha = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(alpha)) {
        return alpha;
      }
      if (!isRealNum(alpha)) {
        return formula.error.v;
      }
      alpha = parseFloat(alpha);

      //数据区域的总体标准偏差
      var standard_dev = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(standard_dev)) {
        return standard_dev;
      }
      if (!isRealNum(standard_dev)) {
        return formula.error.v;
      }
      standard_dev = parseFloat(standard_dev);

      //样本总量的大小
      var size = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(size)) {
        return size;
      }
      if (!isRealNum(size)) {
        return formula.error.v;
      }
      size = parseInt(size);
      if (alpha <= 0 || alpha >= 1) {
        return formula.error.nm;
      }
      if (standard_dev <= 0) {
        return formula.error.nm;
      }
      if (size < 1) {
        return formula.error.nm;
      }
      return jStat.normalci(1, alpha, standard_dev, size)[1] - 1;
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
  "EXPON_DIST": function () {
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
      //指数分布函数的输入值
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);

      //用于指定指数分布函数的 lambda 值
      var lambda = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(lambda)) {
        return lambda;
      }
      if (!isRealNum(lambda)) {
        return formula.error.v;
      }
      lambda = parseFloat(lambda);

      //是否使用指数累积分布
      var cumulative = func_methods.getCellBoolen(arguments[2]);
      if (valueIsError(cumulative)) {
        return cumulative;
      }
      if (x < 0) {
        return formula.error.nm;
      }
      if (lambda < 0) {
        return formula.error.nm;
      }
      return cumulative ? jStat.exponential.cdf(x, lambda) : jStat.exponential.pdf(x, lambda);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "AVERAGEIF": function () {
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
      var sum = 0;
      var count = 0;
      var rangeData = arguments[0].data;
      var rangeRow = arguments[0].rowl;
      var rangeCol = arguments[0].coll;
      var criteria = luckysheet_parseData(arguments[1]);
      var sumRangeData = [];

      //如果有第三个参数
      if (arguments[2]) {
        //根据选择的目标的区域确定实际目标区域
        //初始位置
        var sumRangeStart = arguments[2].startCell;
        var sumRangeRow = arguments[2].rowl;
        var sumRangeCol = arguments[2].coll;
        var sumRangeSheet = arguments[2].sheetName;
        if (rangeRow == sumRangeRow && rangeCol == sumRangeCol) {
          sumRangeData = arguments[2].data;
        } else {
          var row = [],
            col = [];
          var sumRangeEnd = "";
          var realSumRange = "";
          //console.log("开始位置！！！",sumRangeStart,typeof(sumRangeStart));
          row[0] = parseInt(sumRangeStart.replace(/[^0-9]/g, "")) - 1;
          col[0] = ABCatNum(sumRangeStart.replace(/[^A-Za-z]/g, ""));

          //根据第一个范围的长宽确定目标范围的末尾位置
          row[1] = row[0] + rangeRow - 1;
          col[1] = col[0] + rangeCol - 1;

          //console.log(row[0],col[0],row[1],col[1]);
          //末尾位置转化为sheet格式：如 F4
          var real_ABC = chatatABC(col[1]);
          var real_Num = row[1] + 1;
          sumRangeEnd = real_ABC + real_Num;
          //console.log("合成新的末尾位置：" + sumRangeEnd);

          realSumRange = sumRangeSheet + "!" + sumRangeStart + ":" + sumRangeEnd;
          sumRangeData = luckysheet_getcelldata(realSumRange).data;
          //console.log("最终的目标范围：",sumRangeData);
        }
        sumRangeData = formula.getRangeArray(sumRangeData)[0];
      }
      rangeData = formula.getRangeArray(rangeData)[0];

      //循环遍历查找匹配项
      for (var i = 0; i < rangeData.length; i++) {
        var v = rangeData[i];
        if (!!v && formula.acompareb(v, criteria)) {
          var vnow = sumRangeData[i] || v;
          if (!isRealNum(vnow)) {
            continue;
          }
          sum += parseFloat(vnow);
          count++;
        }
      }
      if (sum == 0 || count == 0) {
        return formula.error.d;
      } else {
        return numFormat(sum / count);
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "AVERAGEIFS": function () {
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
      var sum = 0;
      var count = 0;
      var args = arguments;
      luckysheet_getValue(args);
      var rangeData = formula.getRangeArray(args[0])[0];
      var results = new Array(rangeData.length);
      for (var i = 0; i < results.length; i++) {
        results[i] = true;
      }
      for (var i = 1; i < args.length; i += 2) {
        var range = formula.getRangeArray(args[i])[0];
        var criteria = args[i + 1];
        for (var j = 0; j < range.length; j++) {
          var v = range[j];
          results[j] = results[j] && !!v && formula.acompareb(v, criteria);
        }
      }
      for (var i = 0; i < rangeData.length; i++) {
        if (results[i] && isRealNum(rangeData[i])) {
          sum += parseFloat(rangeData[i]);
          count++;
        }
      }
      if (sum == 0 || count == 0) {
        return formula.error.d;
      } else {
        return numFormat(sum / count);
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "PERMUT": function () {
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
      //表示对象个数的整数
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseInt(number);

      //表示每个排列中对象个数的整数
      var number_chosen = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(number_chosen)) {
        return number_chosen;
      }
      if (!isRealNum(number_chosen)) {
        return formula.error.v;
      }
      number_chosen = parseInt(number_chosen);
      if (number <= 0 || number_chosen < 0) {
        return formula.error.nm;
      }
      if (number < number_chosen) {
        return formula.error.nm;
      }
      return func_methods.factorial(number) / func_methods.factorial(number - number_chosen);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "TRIMMEAN": function () {
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
      //包含相关数据集的数组或范围
      var data_dataArr = arguments[0];
      var dataArr = [];
      if (getObjType(data_dataArr) == "array") {
        if (getObjType(data_dataArr[0]) == "array" && !func_methods.isDyadicArr(data_dataArr)) {
          return formula.error.v;
        }
        dataArr = dataArr.concat(func_methods.getDataArr(data_dataArr, false));
      } else if (getObjType(data_dataArr) == "object" && data_dataArr.startCell != null) {
        dataArr = dataArr.concat(func_methods.getCellDataArr(data_dataArr, "number", false));
      } else {
        dataArr.push(data_dataArr);
      }
      var dataArr_n = [];
      for (var i = 0; i < dataArr.length; i++) {
        var number = dataArr[i];
        if (isRealNum(number)) {
          dataArr_n.push(parseFloat(number));
        }
      }

      //排除比例
      var percent = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(percent)) {
        return percent;
      }
      if (!isRealNum(percent)) {
        return formula.error.v;
      }
      percent = parseFloat(percent);
      if (dataArr_n.length == 0) {
        return formula.error.nm;
      }
      if (percent < 0 || percent > 1) {
        return formula.error.nm;
      }

      //计算
      function rest(array, idx) {
        idx = idx || 1;
        if (!array || typeof array.slice !== 'function') {
          return array;
        }
        return array.slice(idx);
      }
      ;
      function initial(array, idx) {
        idx = idx || 1;
        if (!array || typeof array.slice !== 'function') {
          return array;
        }
        return array.slice(0, array.length - idx);
      }
      ;
      dataArr_n.sort(function (a, b) {
        return a - b;
      });
      var trim = window.luckysheet_function.FLOOR.f(dataArr_n.length * percent, 2) / 2;
      var result = rest(dataArr_n, trim);
      result = initial(result, trim);
      result = jStat.mean(result);
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "PERCENTILE_EXC": function () {
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
      //定义相对位置的数组或数据区域
      var data_dataArr = arguments[0];
      var dataArr = [];
      if (getObjType(data_dataArr) == "array") {
        if (getObjType(data_dataArr[0]) == "array" && !func_methods.isDyadicArr(data_dataArr)) {
          return formula.error.v;
        }
        dataArr = dataArr.concat(func_methods.getDataArr(data_dataArr, false));
      } else if (getObjType(data_dataArr) == "object" && data_dataArr.startCell != null) {
        dataArr = dataArr.concat(func_methods.getCellDataArr(data_dataArr, "number", false));
      } else {
        dataArr.push(data_dataArr);
      }
      var dataArr_n = [];
      for (var i = 0; i < dataArr.length; i++) {
        var number = dataArr[i];
        if (isRealNum(number)) {
          dataArr_n.push(parseFloat(number));
        }
      }

      //0 到 1 之间的百分点值，不包含 0 和 1
      var k = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(k)) {
        return k;
      }
      if (!isRealNum(k)) {
        return formula.error.v;
      }
      k = parseFloat(k);
      if (dataArr_n.length == 0) {
        return formula.error.nm;
      }
      if (k <= 0 || k >= 1) {
        return formula.error.nm;
      }

      //计算
      dataArr_n = dataArr_n.sort(function (a, b) {
        return a - b;
      });
      var n = dataArr_n.length;
      if (k < 1 / (n + 1) || k > 1 - 1 / (n + 1)) {
        return formula.error.nm;
      }
      var l = k * (n + 1) - 1;
      var fl = Math.floor(l);
      return l === fl ? dataArr_n[l] : dataArr_n[fl] + (l - fl) * (dataArr_n[fl + 1] - dataArr_n[fl]);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "PERCENTILE_INC": function () {
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
      //定义相对位置的数组或数据区域
      var data_dataArr = arguments[0];
      var dataArr = [];
      if (getObjType(data_dataArr) == "array") {
        if (getObjType(data_dataArr[0]) == "array" && !func_methods.isDyadicArr(data_dataArr)) {
          return formula.error.v;
        }
        dataArr = dataArr.concat(func_methods.getDataArr(data_dataArr, false));
      } else if (getObjType(data_dataArr) == "object" && data_dataArr.startCell != null) {
        dataArr = dataArr.concat(func_methods.getCellDataArr(data_dataArr, "number", false));
      } else {
        dataArr.push(data_dataArr);
      }
      var dataArr_n = [];
      for (var i = 0; i < dataArr.length; i++) {
        var number = dataArr[i];
        if (isRealNum(number)) {
          dataArr_n.push(parseFloat(number));
        }
      }

      //0 到 1 之间的百分点值，不包含 0 和 1
      var k = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(k)) {
        return k;
      }
      if (!isRealNum(k)) {
        return formula.error.v;
      }
      k = parseFloat(k);
      if (dataArr_n.length == 0) {
        return formula.error.nm;
      }
      if (k < 0 || k > 1) {
        return formula.error.nm;
      }

      //计算
      dataArr_n = dataArr_n.sort(function (a, b) {
        return a - b;
      });
      var n = dataArr_n.length;
      var l = k * (n - 1);
      var fl = Math.floor(l);
      return l === fl ? dataArr_n[l] : dataArr_n[fl] + (l - fl) * (dataArr_n[fl + 1] - dataArr_n[fl]);
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
  "NORM_S_INV": function () {
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
      //对应于正态分布的概率
      var probability = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(probability)) {
        return probability;
      }
      if (!isRealNum(probability)) {
        return formula.error.v;
      }
      probability = parseFloat(probability);
      if (probability <= 0 || probability >= 1) {
        return formula.error.nm;
      }
      return jStat.normal.inv(probability, 0, 1);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "NORM_S_DIST": function () {
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
      //需要计算其分布的数值
      var z = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(z)) {
        return z;
      }
      if (!isRealNum(z)) {
        return formula.error.v;
      }
      z = parseFloat(z);

      //决定函数形式的逻辑值
      var cumulative = func_methods.getCellBoolen(arguments[1]);
      if (valueIsError(cumulative)) {
        return cumulative;
      }
      return cumulative ? jStat.normal.cdf(z, 0, 1) : jStat.normal.pdf(z, 0, 1);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "NORM_INV": function () {
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
      //对应于正态分布的概率
      var probability = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(probability)) {
        return probability;
      }
      if (!isRealNum(probability)) {
        if (getObjType(probability) == "boolean") {
          if (probability.toString().toLowerCase() == "true") {
            probability = 1;
          } else if (probability.toString().toLowerCase() == "false") {
            probability = 0;
          }
        } else {
          return formula.error.v;
        }
      }
      probability = parseFloat(probability);

      //分布的算术平均值
      var mean = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(mean)) {
        return mean;
      }
      if (!isRealNum(mean)) {
        if (getObjType(mean) == "boolean") {
          if (mean.toString().toLowerCase() == "true") {
            mean = 1;
          } else if (mean.toString().toLowerCase() == "false") {
            mean = 0;
          }
        } else {
          return formula.error.v;
        }
      }
      mean = parseFloat(mean);

      //分布的标准偏差
      var standard_dev = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(standard_dev)) {
        return standard_dev;
      }
      if (!isRealNum(standard_dev)) {
        if (getObjType(standard_dev) == "boolean") {
          if (standard_dev.toString().toLowerCase() == "true") {
            standard_dev = 1;
          } else if (standard_dev.toString().toLowerCase() == "false") {
            standard_dev = 0;
          }
        } else {
          return formula.error.v;
        }
      }
      standard_dev = parseFloat(standard_dev);
      if (probability <= 0 || probability >= 1) {
        return formula.error.nm;
      }
      if (standard_dev <= 0) {
        return formula.error.nm;
      }

      //计算
      return jStat.normal.inv(probability, mean, standard_dev);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "NORM_DIST": function () {
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
      //需要计算其分布的数值
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        if (getObjType(x) == "boolean") {
          if (x.toString().toLowerCase() == "true") {
            x = 1;
          } else if (x.toString().toLowerCase() == "false") {
            x = 0;
          }
        } else {
          return formula.error.v;
        }
      }
      x = parseFloat(x);

      //分布的算术平均值
      var mean = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(mean)) {
        return mean;
      }
      if (!isRealNum(mean)) {
        return formula.error.v;
      }
      mean = parseFloat(mean);

      //分布的标准偏差
      var standard_dev = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(standard_dev)) {
        return standard_dev;
      }
      if (!isRealNum(standard_dev)) {
        return formula.error.v;
      }
      standard_dev = parseFloat(standard_dev);

      //决定函数形式的逻辑值
      var cumulative = func_methods.getCellBoolen(arguments[3]);
      if (valueIsError(cumulative)) {
        return cumulative;
      }
      if (standard_dev <= 0) {
        return formula.error.nm;
      }
      return cumulative ? jStat.normal.cdf(x, mean, standard_dev) : jStat.normal.pdf(x, mean, standard_dev);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "NEGBINOM_DIST": function () {
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
      //要模拟的失败次数
      var number_f = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number_f)) {
        return number_f;
      }
      if (!isRealNum(number_f)) {
        return formula.error.v;
      }
      number_f = parseInt(number_f);

      //要模拟的成功次数
      var number_s = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(number_s)) {
        return number_s;
      }
      if (!isRealNum(number_s)) {
        return formula.error.v;
      }
      number_s = parseInt(number_s);

      //任一次给定检验的成功概率
      var probability_s = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(probability_s)) {
        return probability_s;
      }
      if (!isRealNum(probability_s)) {
        return formula.error.v;
      }
      probability_s = parseFloat(probability_s);

      //决定函数形式的逻辑值
      var cumulative = func_methods.getCellBoolen(arguments[3]);
      if (valueIsError(cumulative)) {
        return cumulative;
      }
      if (probability_s < 0 || probability_s > 1) {
        return formula.error.nm;
      }
      if (number_f < 0 || number_s < 1) {
        return formula.error.nm;
      }
      return cumulative ? jStat.negbin.cdf(number_f, number_s, probability_s) : jStat.negbin.pdf(number_f, number_s, probability_s);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "MINA": function () {
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
          dataArr = dataArr.concat(func_methods.getDataArr(data, false));
        } else if (getObjType(data) == "object" && data.startCell != null) {
          dataArr = dataArr.concat(func_methods.getCellDataArr(data, "number", true));
        } else {
          if (number.toString.toLowerCase() == "true") {
            dataArr.push(1);
          } else if (number.toString.toLowerCase() == "false") {
            dataArr.push(0);
          } else if (isRealNum(data)) {
            dataArr.push(data);
          } else {
            return formula.error.v;
          }
        }
      }
      var dataArr_n = [];
      for (var i = 0; i < dataArr.length; i++) {
        var number = dataArr[i];
        if (isRealNum(number)) {
          dataArr_n.push(parseFloat(number));
        } else {
          if (number.toString().toLowerCase() == "true") {
            dataArr_n.push(1);
          } else {
            dataArr_n.push(0);
          }
        }
      }
      return dataArr_n.length === 0 ? 0 : Math.min.apply(Math, dataArr_n);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "MEDIAN": function () {
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
            return formula.error.v;
          }
          dataArr.push(data);
        }
      }
      var dataArr_n = [];
      for (var i = 0; i < dataArr.length; i++) {
        var number = dataArr[i];
        if (isRealNum(number)) {
          dataArr_n.push(parseFloat(number));
        }
      }
      return jStat.median(dataArr_n);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "MAXA": function () {
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
          dataArr = dataArr.concat(func_methods.getDataArr(data, false));
        } else if (getObjType(data) == "object" && data.startCell != null) {
          dataArr = dataArr.concat(func_methods.getCellDataArr(data, "number", true));
        } else {
          if (number.toString.toLowerCase() == "true") {
            dataArr.push(1);
          } else if (number.toString.toLowerCase() == "false") {
            dataArr.push(0);
          } else if (isRealNum(data)) {
            dataArr.push(data);
          } else {
            return formula.error.v;
          }
        }
      }
      var dataArr_n = [];
      for (var i = 0; i < dataArr.length; i++) {
        var number = dataArr[i];
        if (isRealNum(number)) {
          dataArr_n.push(parseFloat(number));
        } else {
          if (number.toString().toLowerCase() == "true") {
            dataArr_n.push(1);
          } else {
            dataArr_n.push(0);
          }
        }
      }
      return dataArr_n.length === 0 ? 0 : Math.max.apply(Math, dataArr_n);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "LOGNORM_INV": function () {
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
      //与对数分布相关的概率
      var probability = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(probability)) {
        return probability;
      }
      if (!isRealNum(probability)) {
        return formula.error.v;
      }
      probability = parseFloat(probability);

      //ln(x) 的平均值
      var mean = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(mean)) {
        return mean;
      }
      if (!isRealNum(mean)) {
        return formula.error.v;
      }
      mean = parseFloat(mean);

      //ln(x) 的标准偏差
      var standard_dev = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(standard_dev)) {
        return standard_dev;
      }
      if (!isRealNum(standard_dev)) {
        return formula.error.v;
      }
      standard_dev = parseFloat(standard_dev);
      if (probability <= 0 || probability >= 1) {
        return formula.error.nm;
      }
      if (standard_dev <= 0) {
        return formula.error.nm;
      }
      return jStat.lognormal.inv(probability, mean, standard_dev);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "LOGNORM_DIST": function () {
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
      //与对数分布相关的概率
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);

      //ln(x) 的平均值
      var mean = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(mean)) {
        return mean;
      }
      if (!isRealNum(mean)) {
        return formula.error.v;
      }
      mean = parseFloat(mean);

      //ln(x) 的标准偏差
      var standard_dev = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(standard_dev)) {
        return standard_dev;
      }
      if (!isRealNum(standard_dev)) {
        return formula.error.v;
      }
      standard_dev = parseFloat(standard_dev);

      //决定函数形式的逻辑值
      var cumulative = func_methods.getCellBoolen(arguments[3]);
      if (valueIsError(cumulative)) {
        return cumulative;
      }
      if (x <= 0 || standard_dev <= 0) {
        return formula.error.nm;
      }
      return cumulative ? jStat.lognormal.cdf(x, mean, standard_dev) : jStat.lognormal.pdf(x, mean, standard_dev);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "Z_TEST": function () {
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
      //用来检验 x 的数组或数据区域
      var dataArr = [];
      if (getObjType(arguments[0]) == "array") {
        if (getObjType(arguments[0][0]) == "array" && !func_methods.isDyadicArr(arguments[0])) {
          return formula.error.v;
        }
        dataArr = dataArr.concat(func_methods.getDataArr(arguments[0], true));
      } else if (getObjType(arguments[0]) == "object" && arguments[0].startCell != null) {
        dataArr = dataArr.concat(func_methods.getCellDataArr(arguments[0], "text", true));
      } else {
        dataArr.push(arguments[0]);
      }
      var dataArr_n = [];
      for (var j = 0; j < dataArr.length; j++) {
        var number = dataArr[j];
        if (isRealNum(number)) {
          dataArr_n.push(parseFloat(number));
        }
      }

      //要测试的值
      var x = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);
      if (dataArr_n.length == 0) {
        return formula.error.na;
      }

      //总体（已知）标准偏差。 如果省略，则使用样本标准偏差
      var sigma = func_methods.standardDeviation_s(dataArr_n);
      if (arguments.length == 3) {
        sigma = func_methods.getFirstValue(arguments[2]);
        if (valueIsError(sigma)) {
          return sigma;
        }
        if (!isRealNum(sigma)) {
          return formula.error.v;
        }
        sigma = parseFloat(sigma);
      }

      //计算
      var n = dataArr_n.length;
      var mean = window.luckysheet_function.AVERAGE.f.apply(window.luckysheet_function.AVERAGE, dataArr_n);
      return 1 - window.luckysheet_function.NORM_S_DIST.f((mean - x) / (sigma / Math.sqrt(n)), "true");
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "PROB": function () {
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
      //x_range
      var data_x_range = [];
      if (getObjType(arguments[0]) == "array") {
        if (getObjType(arguments[0][0]) == "array" && !func_methods.isDyadicArr(arguments[0])) {
          return formula.error.v;
        }
        data_x_range = data_x_range.concat(func_methods.getDataArr(arguments[0], false));
      } else if (getObjType(arguments[0]) == "object" && arguments[0].startCell != null) {
        data_x_range = data_x_range.concat(func_methods.getCellDataArr(arguments[0], "text", false));
      } else {
        data_x_range.push(arguments[0]);
      }

      //prob_range
      var data_prob_range = [];
      if (getObjType(arguments[1]) == "array") {
        if (getObjType(arguments[1][0]) == "array" && !func_methods.isDyadicArr(arguments[1])) {
          return formula.error.v;
        }
        data_prob_range = data_prob_range.concat(func_methods.getDataArr(arguments[1], false));
      } else if (getObjType(arguments[1]) == "object" && arguments[1].startCell != null) {
        data_prob_range = data_prob_range.concat(func_methods.getCellDataArr(arguments[1], "text", false));
      } else {
        data_prob_range.push(arguments[1]);
      }
      if (data_x_range.length != data_prob_range.length) {
        return formula.error.na;
      }

      //data_x_range 和 data_prob_range 只取数值
      var x_range = [],
        prob_range = [],
        prob_range_sum = 0;
      for (var i = 0; i < data_x_range.length; i++) {
        var num_x_range = data_x_range[i];
        var num_prob_range = data_prob_range[i];
        if (isRealNum(num_x_range) && isRealNum(num_prob_range)) {
          x_range.push(parseFloat(num_x_range));
          prob_range.push(parseFloat(num_prob_range));
          prob_range_sum += parseFloat(num_prob_range);
          if (parseFloat(num_prob_range) <= 0 || parseFloat(num_prob_range) > 1) {
            return formula.error.nm;
          }
        }
      }
      if (prob_range_sum != 1) {
        return formula.error.nm;
      }

      //要计算其概率的数值下界
      var lower_limit = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(lower_limit)) {
        return lower_limit;
      }
      if (!isRealNum(lower_limit)) {
        return formula.error.v;
      }
      lower_limit = parseFloat(lower_limit);

      //要计算其概率的数值上界
      var upper_limit = lower_limit;
      if (arguments.length == 4) {
        upper_limit = func_methods.getFirstValue(arguments[3]);
        if (valueIsError(upper_limit)) {
          return upper_limit;
        }
        if (!isRealNum(upper_limit)) {
          return formula.error.v;
        }
        upper_limit = parseFloat(upper_limit);
      }

      //计算
      var result = 0;
      for (var i = 0; i < x_range.length; i++) {
        if (x_range[i] >= lower_limit && x_range[i] <= upper_limit) {
          result += prob_range[i];
        }
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "QUARTILE_EXC": function () {
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
      //要求得四分位数值的数组或数字型单元格区域
      var data_array = [];
      if (getObjType(arguments[0]) == "array") {
        if (getObjType(arguments[0][0]) == "array" && !func_methods.isDyadicArr(arguments[0])) {
          return formula.error.v;
        }
        data_array = data_array.concat(func_methods.getDataArr(arguments[0], true));
      } else if (getObjType(arguments[0]) == "object" && arguments[0].startCell != null) {
        data_array = data_array.concat(func_methods.getCellDataArr(arguments[0], "text", true));
      } else {
        if (!isRealNum(arguments[0])) {
          return formula.error.v;
        }
        data_array.push(arguments[0]);
      }
      var array = [];
      for (var i = 0; i < data_array.length; i++) {
        var number = data_array[i];
        if (isRealNum(number)) {
          array.push(parseFloat(number));
        }
      }

      //要返回第几个四分位值
      var quart = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(quart)) {
        return quart;
      }
      if (!isRealNum(quart)) {
        return formula.error.v;
      }
      quart = parseInt(quart);
      if (array.length == 0) {
        return formula.error.nm;
      }
      if (quart <= 0 || quart >= 4) {
        return formula.error.nm;
      }

      //计算
      switch (quart) {
        case 1:
          return window.luckysheet_function.PERCENTILE_EXC.f(array, 0.25);
        case 2:
          return window.luckysheet_function.PERCENTILE_EXC.f(array, 0.5);
        case 3:
          return window.luckysheet_function.PERCENTILE_EXC.f(array, 0.75);
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "QUARTILE_INC": function () {
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
      //要求得四分位数值的数组或数字型单元格区域
      var data_array = [];
      if (getObjType(arguments[0]) == "array") {
        if (getObjType(arguments[0][0]) == "array" && !func_methods.isDyadicArr(arguments[0])) {
          return formula.error.v;
        }
        data_array = data_array.concat(func_methods.getDataArr(arguments[0], true));
      } else if (getObjType(arguments[0]) == "object" && arguments[0].startCell != null) {
        data_array = data_array.concat(func_methods.getCellDataArr(arguments[0], "text", true));
      } else {
        if (!isRealNum(arguments[0])) {
          return formula.error.v;
        }
        data_array.push(arguments[0]);
      }
      var array = [];
      for (var i = 0; i < data_array.length; i++) {
        var number = data_array[i];
        if (isRealNum(number)) {
          array.push(parseFloat(number));
        }
      }

      //要返回第几个四分位值
      var quart = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(quart)) {
        return quart;
      }
      if (!isRealNum(quart)) {
        return formula.error.v;
      }
      quart = parseInt(quart);
      if (array.length == 0) {
        return formula.error.nm;
      }
      if (quart < 0 || quart > 4) {
        return formula.error.nm;
      }

      //计算
      switch (quart) {
        case 0:
          return Math.min.apply(Math, array);
        case 1:
          return window.luckysheet_function.PERCENTILE_INC.f(array, 0.25);
        case 2:
          return window.luckysheet_function.PERCENTILE_INC.f(array, 0.5);
        case 3:
          return window.luckysheet_function.PERCENTILE_INC.f(array, 0.75);
        case 4:
          return Math.max.apply(Math, array);
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "POISSON_DIST": function () {
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
      //事件数
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseInt(x);

      //期望值
      var mean = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(mean)) {
        return mean;
      }
      if (!isRealNum(mean)) {
        return formula.error.v;
      }
      mean = parseFloat(mean);

      //决定函数形式的逻辑值
      var cumulative = func_methods.getCellBoolen(arguments[2]);
      if (valueIsError(cumulative)) {
        return cumulative;
      }
      if (x < 0 || mean < 0) {
        return formula.error.nm;
      }
      return cumulative ? jStat.poisson.cdf(x, mean) : jStat.poisson.pdf(x, mean);
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
  "T_DIST": function () {
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
      //T-分布函数的输入
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);

      //自由度数值
      var degrees_freedom = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(degrees_freedom)) {
        return degrees_freedom;
      }
      if (!isRealNum(degrees_freedom)) {
        return formula.error.v;
      }
      degrees_freedom = parseInt(degrees_freedom);

      //决定函数形式的逻辑值
      var cumulative = func_methods.getCellBoolen(arguments[2]);
      if (valueIsError(cumulative)) {
        return cumulative;
      }
      if (degrees_freedom < 1) {
        return formula.error.nm;
      }
      return cumulative ? jStat.studentt.cdf(x, degrees_freedom) : jStat.studentt.pdf(x, degrees_freedom);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "T_DIST_2T": function () {
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
      //T-分布函数的输入
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);

      //自由度数值
      var degrees_freedom = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(degrees_freedom)) {
        return degrees_freedom;
      }
      if (!isRealNum(degrees_freedom)) {
        return formula.error.v;
      }
      degrees_freedom = parseInt(degrees_freedom);
      if (x < 0 || degrees_freedom < 1) {
        return formula.error.nm;
      }
      return (1 - jStat.studentt.cdf(x, degrees_freedom)) * 2;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "T_DIST_RT": function () {
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
      //T-分布函数的输入
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);

      //自由度数值
      var degrees_freedom = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(degrees_freedom)) {
        return degrees_freedom;
      }
      if (!isRealNum(degrees_freedom)) {
        return formula.error.v;
      }
      degrees_freedom = parseInt(degrees_freedom);
      if (degrees_freedom < 1) {
        return formula.error.nm;
      }
      return 1 - jStat.studentt.cdf(x, degrees_freedom);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "T_INV": function () {
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
      //与学生的 t 分布相关的概率
      var probability = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(probability)) {
        return probability;
      }
      if (!isRealNum(probability)) {
        return formula.error.v;
      }
      probability = parseFloat(probability);

      //自由度数值
      var deg_freedom = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(deg_freedom)) {
        return deg_freedom;
      }
      if (!isRealNum(deg_freedom)) {
        return formula.error.v;
      }
      deg_freedom = parseInt(deg_freedom);
      if (probability <= 0 || probability > 1) {
        return formula.error.nm;
      }
      if (deg_freedom < 1) {
        return formula.error.nm;
      }
      return jStat.studentt.inv(probability, deg_freedom);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "T_INV_2T": function () {
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
      //与学生的 t 分布相关的概率
      var probability = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(probability)) {
        return probability;
      }
      if (!isRealNum(probability)) {
        return formula.error.v;
      }
      probability = parseFloat(probability);

      //自由度数值
      var deg_freedom = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(deg_freedom)) {
        return deg_freedom;
      }
      if (!isRealNum(deg_freedom)) {
        return formula.error.v;
      }
      deg_freedom = parseInt(deg_freedom);
      if (probability <= 0 || probability > 1) {
        return formula.error.nm;
      }
      if (deg_freedom < 1) {
        return formula.error.nm;
      }
      return Math.abs(jStat.studentt.inv(probability / 2, deg_freedom));
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "T_TEST": function () {
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
      //第一个数据集
      var known_x = [];
      if (getObjType(arguments[0]) == "array") {
        if (getObjType(arguments[0][0]) == "array" && !func_methods.isDyadicArr(arguments[0])) {
          return formula.error.v;
        }
        known_x = known_x.concat(func_methods.getDataArr(arguments[0], false));
      } else if (getObjType(arguments[0]) == "object" && arguments[0].startCell != null) {
        known_x = known_x.concat(func_methods.getCellDataArr(arguments[0], "text", false));
      } else {
        if (!isRealNum(arguments[0])) {
          return formula.error.v;
        }
        known_x.push(arguments[0]);
      }

      // var data_x = [];
      var data_x = known_x;

      //第二个数据集
      var known_y = [];
      if (getObjType(arguments[1]) == "array") {
        if (getObjType(arguments[1][0]) == "array" && !func_methods.isDyadicArr(arguments[1])) {
          return formula.error.v;
        }
        known_y = known_y.concat(func_methods.getDataArr(arguments[1], false));
      } else if (getObjType(arguments[1]) == "object" && arguments[1].startCell != null) {
        known_y = known_y.concat(func_methods.getCellDataArr(arguments[1], "text", false));
      } else {
        if (!isRealNum(arguments[1])) {
          return formula.error.v;
        }
        known_y.push(arguments[1]);
      }

      // var data_y = [];
      var data_y = known_y;

      //指定分布的尾数
      var tails = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(tails)) {
        return tails;
      }
      if (!isRealNum(tails)) {
        return formula.error.v;
      }
      tails = parseInt(tails);

      //指定 t 检验的类型
      var type = func_methods.getFirstValue(arguments[3]);
      if (valueIsError(type)) {
        return type;
      }
      if (!isRealNum(type)) {
        return formula.error.v;
      }
      type = parseInt(type);
      if ([1, 2].indexOf(tails) == -1) {
        return formula.error.nm;
      }
      if ([1, 2, 3].indexOf(type) == -1) {
        return formula.error.nm;
      }

      //计算
      var t = null,
        df = null;
      if (type == 1) {
        var diff_arr = [];
        for (i = 0; i < data_x.length; i++) {
          diff_arr.push(data_x[i] - data_y[i]);
        }
        var diff_mean = Math.abs(jStat.mean(diff_arr));
        var diff_sd = func_methods.standardDeviation_s(diff_arr);
        t = diff_mean / (diff_sd / Math.sqrt(data_x.length));
        df = data_x.length - 1;
      } else {
        var mean_x = jStat.mean(data_x);
        var mean_y = jStat.mean(data_y);
        var s_x = func_methods.variance_s(data_x);
        var s_y = func_methods.variance_s(data_y);
        t = Math.abs(mean_x - mean_y) / Math.sqrt(s_x / data_x.length + s_y / data_y.length);
        switch (type) {
          case 2:
            df = data_x.length + data_y.length - 2;
            break;
          case 3:
            df = Math.pow(s_x / data_x.length + s_y / data_y.length, 2) / (Math.pow(s_x / data_x.length, 2) / (data_x.length - 1) + Math.pow(s_y / data_y.length, 2) / (data_y.length - 1));
            break;
        }
      }
      if (tails == 1) {
        var result = window.luckysheet_function.T_DIST_RT.f(t, df);
      } else if (tails == 2) {
        var result = window.luckysheet_function.T_DIST_2T.f(t, df);
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "F_DIST": function () {
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
      //用来计算函数的值
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);

      //分子自由度
      var degrees_freedom1 = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(degrees_freedom1)) {
        return degrees_freedom1;
      }
      if (!isRealNum(degrees_freedom1)) {
        return formula.error.v;
      }
      degrees_freedom1 = parseInt(degrees_freedom1);

      //分母自由度
      var degrees_freedom2 = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(degrees_freedom2)) {
        return degrees_freedom2;
      }
      if (!isRealNum(degrees_freedom2)) {
        return formula.error.v;
      }
      degrees_freedom2 = parseInt(degrees_freedom2);

      //用于确定函数形式的逻辑值
      var cumulative = func_methods.getCellBoolen(arguments[3]);
      if (valueIsError(cumulative)) {
        return cumulative;
      }
      if (x < 0) {
        return formula.error.nm;
      }
      if (degrees_freedom1 < 1) {
        return formula.error.nm;
      }
      if (degrees_freedom2 < 1) {
        return formula.error.nm;
      }
      return cumulative ? jStat.centralF.cdf(x, degrees_freedom1, degrees_freedom2) : jStat.centralF.pdf(x, degrees_freedom1, degrees_freedom2);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "F_DIST_RT": function () {
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
      //用来计算函数的值
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);

      //分子自由度
      var degrees_freedom1 = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(degrees_freedom1)) {
        return degrees_freedom1;
      }
      if (!isRealNum(degrees_freedom1)) {
        return formula.error.v;
      }
      degrees_freedom1 = parseInt(degrees_freedom1);

      //分母自由度
      var degrees_freedom2 = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(degrees_freedom2)) {
        return degrees_freedom2;
      }
      if (!isRealNum(degrees_freedom2)) {
        return formula.error.v;
      }
      degrees_freedom2 = parseInt(degrees_freedom2);
      if (x < 0) {
        return formula.error.nm;
      }
      if (degrees_freedom1 < 1) {
        return formula.error.nm;
      }
      if (degrees_freedom2 < 1) {
        return formula.error.nm;
      }
      return 1 - jStat.centralF.cdf(x, degrees_freedom1, degrees_freedom2);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "VAR_P": function () {
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
            return formula.error.v;
          }
          dataArr.push(data);
        }
      }
      var dataArr_n = [];
      for (var i = 0; i < dataArr.length; i++) {
        var number = dataArr[i];
        if (isRealNum(number)) {
          dataArr_n.push(parseFloat(number));
        }
      }
      if (dataArr_n.length == 0) {
        return formula.error.d;
      }
      var n = dataArr_n.length;
      var sigma = 0;
      var mean = window.luckysheet_function.AVERAGE.f.apply(window.luckysheet_function.AVERAGE, dataArr_n);
      for (var i = 0; i < n; i++) {
        sigma += Math.pow(dataArr_n[i] - mean, 2);
      }
      return sigma / n;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "VAR_S": function () {
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
            return formula.error.v;
          }
          dataArr.push(data);
        }
      }
      var dataArr_n = [];
      for (var i = 0; i < dataArr.length; i++) {
        var number = dataArr[i];
        if (isRealNum(number)) {
          dataArr_n.push(parseFloat(number));
        }
      }
      if (dataArr_n.length == 0) {
        return formula.error.d;
      }
      var n = dataArr_n.length;
      var sigma = 0;
      var mean = window.luckysheet_function.AVERAGE.f.apply(window.luckysheet_function.AVERAGE, dataArr_n);
      for (var i = 0; i < n; i++) {
        sigma += Math.pow(dataArr_n[i] - mean, 2);
      }
      return sigma / (n - 1);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "VARA": function () {
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
          dataArr = dataArr.concat(func_methods.getDataArr(data, false));
        } else if (getObjType(data) == "object" && data.startCell != null) {
          dataArr = dataArr.concat(func_methods.getCellDataArr(data, "number", true));
        } else {
          if (number.toString.toLowerCase() == "true") {
            dataArr.push(1);
          } else if (number.toString.toLowerCase() == "false") {
            dataArr.push(0);
          } else if (isRealNum(data)) {
            dataArr.push(data);
          } else {
            return formula.error.v;
          }
        }
      }
      var dataArr_n = [];
      for (var i = 0; i < dataArr.length; i++) {
        var number = dataArr[i];
        if (isRealNum(number)) {
          dataArr_n.push(parseFloat(number));
        } else {
          if (number.toString().toLowerCase() == "true") {
            dataArr_n.push(1);
          } else {
            dataArr_n.push(0);
          }
        }
      }
      var n = dataArr_n.length;
      var sigma = 0;
      var mean = window.luckysheet_function.AVERAGE.f.apply(window.luckysheet_function.AVERAGE, dataArr_n);
      for (var i = 0; i < n; i++) {
        sigma += Math.pow(dataArr_n[i] - mean, 2);
      }
      return sigma / (n - 1);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "VARPA": function () {
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
          dataArr = dataArr.concat(func_methods.getDataArr(data, false));
        } else if (getObjType(data) == "object" && data.startCell != null) {
          dataArr = dataArr.concat(func_methods.getCellDataArr(data, "number", true));
        } else {
          if (number.toString.toLowerCase() == "true") {
            dataArr.push(1);
          } else if (number.toString.toLowerCase() == "false") {
            dataArr.push(0);
          } else if (isRealNum(data)) {
            dataArr.push(data);
          } else {
            return formula.error.v;
          }
        }
      }
      var dataArr_n = [];
      for (var i = 0; i < dataArr.length; i++) {
        var number = dataArr[i];
        if (isRealNum(number)) {
          dataArr_n.push(parseFloat(number));
        } else {
          if (number.toString().toLowerCase() == "true") {
            dataArr_n.push(1);
          } else {
            dataArr_n.push(0);
          }
        }
      }
      var n = dataArr_n.length;
      var sigma = 0;
      var mean = window.luckysheet_function.AVERAGE.f.apply(window.luckysheet_function.AVERAGE, dataArr_n);
      for (var i = 0; i < n; i++) {
        sigma += Math.pow(dataArr_n[i] - mean, 2);
      }
      return sigma / n;
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
  "STANDARDIZE": function () {
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
      //要正态化的随机变量值
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);

      //分布的均值
      var mean = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(mean)) {
        return mean;
      }
      if (!isRealNum(mean)) {
        return formula.error.v;
      }
      mean = parseFloat(mean);

      //分布的标准偏差
      var standard_dev = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(standard_dev)) {
        return standard_dev;
      }
      if (!isRealNum(standard_dev)) {
        return formula.error.v;
      }
      standard_dev = parseFloat(standard_dev);
      if (standard_dev <= 0) {
        return formula.error.nm;
      }
      return (x - mean) / standard_dev;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "SMALL": function () {
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
      //要正态化的随机变量值
      var dataArr = [];
      if (getObjType(arguments[0]) == "array") {
        if (getObjType(arguments[0][0]) == "array" && !func_methods.isDyadicArr(arguments[0])) {
          return formula.error.v;
        }
        dataArr = dataArr.concat(func_methods.getDataArr(arguments[0], true));
      } else if (getObjType(arguments[0]) == "object" && arguments[0].startCell != null) {
        dataArr = dataArr.concat(func_methods.getCellDataArr(arguments[0], "number", true));
      } else {
        if (!isRealNum(arguments[0])) {
          return formula.error.v;
        }
        dataArr.push(arguments[0]);
      }
      var dataArr_n = [];
      for (var i = 0; i < dataArr.length; i++) {
        var number = dataArr[i];
        if (isRealNum(number)) {
          dataArr_n.push(parseFloat(number));
        }
      }

      //要返回的数据在数组或数据区域里的位置（从小到大）
      var k = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(k)) {
        return k;
      }
      if (!isRealNum(k)) {
        return formula.error.v;
      }
      k = parseInt(k);
      if (dataArr_n.length == 0) {
        return formula.error.nm;
      }
      if (k <= 0 || k > dataArr_n.length) {
        return formula.error.nm;
      }

      //计算

      return dataArr_n.sort(function (a, b) {
        return a - b;
      })[k - 1];
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
  "SKEW": function () {
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
            return formula.error.v;
          }
          dataArr.push(data);
        }
      }
      var dataArr_n = [];
      for (var i = 0; i < dataArr.length; i++) {
        var number = dataArr[i];
        if (isRealNum(number)) {
          dataArr_n.push(parseFloat(number));
        }
      }
      if (dataArr_n.length < 3 || func_methods.standardDeviation_s(dataArr_n) == 0) {
        return formula.error.d;
      }

      //计算
      var mean = jStat.mean(dataArr_n);
      var n = dataArr_n.length;
      var sigma = 0;
      for (var i = 0; i < n; i++) {
        sigma += Math.pow(dataArr_n[i] - mean, 3);
      }
      return n * sigma / ((n - 1) * (n - 2) * Math.pow(jStat.stdev(dataArr_n, true), 3));
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "SKEW_P": function () {
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
            return formula.error.v;
          }
          dataArr.push(data);
        }
      }
      var dataArr_n = [];
      for (var i = 0; i < dataArr.length; i++) {
        var number = dataArr[i];
        if (isRealNum(number)) {
          dataArr_n.push(parseFloat(number));
        }
      }
      if (dataArr_n.length < 3 || func_methods.standardDeviation_s(dataArr_n) == 0) {
        return formula.error.d;
      }

      //计算
      var mean = jStat.mean(dataArr_n);
      var n = dataArr_n.length;
      var m2 = 0;
      var m3 = 0;
      for (var i = 0; i < n; i++) {
        m3 += Math.pow(dataArr_n[i] - mean, 3);
        m2 += Math.pow(dataArr_n[i] - mean, 2);
      }
      m3 = m3 / n;
      m2 = m2 / n;
      return m3 / Math.pow(m2, 3 / 2);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  }
};
export default statisticalFunctions;