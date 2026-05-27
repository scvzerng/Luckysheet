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

const statisticalRanking = {
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

export default statisticalRanking;
