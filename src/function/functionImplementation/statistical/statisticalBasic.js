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

const statisticalBasic = {
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
};

export default statisticalBasic;
