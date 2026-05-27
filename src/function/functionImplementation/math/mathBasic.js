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

const mathBasic = {
  "SUM": function () {
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
      var sum = 0;
      if (dataArr.length > 0) {
        for (var i = 0; i < dataArr.length; i++) {
          if (valueIsError(dataArr[i])) {
            return dataArr[i];
          }
          if (!isRealNum(dataArr[i])) {
            continue;
          }
          sum = luckysheet_calcADPMM(sum, "+", dataArr[i]); // parseFloat(dataArr[i]);
        }
      }
      return sum;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "CEILING": function () {
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
      //number
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);

      //significance
      var significance = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(significance)) {
        return significance;
      }
      if (!isRealNum(significance)) {
        return formula.error.v;
      }
      significance = parseFloat(significance);
      if (significance == 0) {
        return 0;
      }
      if (number > 0 && significance < 0) {
        return formula.error.nm;
      }
      return Math.ceil(number / significance) * significance;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ABS": function () {
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
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);
      return Math.abs(number);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "MULTINOMIAL": function () {
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
      var sum = 0,
        divisor = 1;
      for (var i = 0; i < dataArr.length; i++) {
        var number = dataArr[i];
        if (!isRealNum(number)) {
          return formula.error.v;
        }
        number = parseFloat(number);
        if (number < 0) {
          return formula.error.nm;
        }
        sum += number;
        divisor *= func_methods.factorial(number);
      }
      return func_methods.factorial(sum) / divisor;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "INT": function () {
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
      if (getObjType(data) == "array") {
        if (getObjType(data[0]) == "array") {
          if (!func_methods.isDyadicArr(data)) {
            return formula.error.v;
          }
          if (!isRealNum(data[0][0])) {
            return formula.error.v;
          }
          return Math.floor(parseFloat(data[0][0]));
        } else {
          if (!isRealNum(data[0])) {
            return formula.error.v;
          }
          return Math.floor(parseFloat(data[0]));
        }
      } else if (getObjType(data) == "object" && data.startCell != null) {
        if (data.coll > 1) {
          return formula.error.v;
        }
        if (data.rowl > 1) {
          var cellrange = formula.getcellrange(data.startCell);
          var str = cellrange.row[0];
          if (window.luckysheetCurrentRow < str || window.luckysheetCurrentRow > str + data.rowl - 1) {
            return formula.error.v;
          }
          var cell = data.data[window.luckysheetCurrentRow - str][0];
        } else {
          var cell = data.data;
        }
        if (cell == null || isRealNull(cell.v)) {
          return 0;
        }
        if (!isRealNum(cell.v)) {
          return formula.error.v;
        }
        return Math.floor(parseFloat(cell.v));
      } else {
        if (getObjType(data) == "boolean") {
          if (data.toString().toLowerCase() == "true") {
            return 1;
          }
          if (data.toString().toLowerCase() == "false") {
            return 0;
          }
        }
        if (!isRealNum(data)) {
          return formula.error.v;
        }
        return Math.floor(parseFloat(data));
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ISEVEN": function () {
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
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseInt(number);
      return Math.abs(number) & 1 ? false : true;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ISODD": function () {
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
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseInt(number);
      return Math.abs(number) & 1 ? true : false;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "LCM": function () {
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
      var o = [];
      for (var i = 0; i < arguments.length; i++) {
        var data = arguments[i];
        if (getObjType(data) == "array") {
          if (getObjType(data[0]) == "array") {
            if (!func_methods.isDyadicArr(data)) {
              return formula.error.v;
            }
            o = o.concat(func_methods.getDataArr(data));
          } else {
            o = o.concat(data);
          }
        } else if (getObjType(data) == "object" && data.startCell != null) {
          o = o.concat(func_methods.getCellDataArr(data, "number", true));
        } else {
          o.push(data);
        }
      }
      for (var y = 0; y < o.length; y++) {
        var number = o[y];
        if (!isRealNum(number)) {
          return formula.error.v;
        }
        number = parseInt(number);
        if (number < 0) {
          return formula.error.nm;
        }
        o[y] = number;
      }
      for (var i, j, n, d, r = 1; (n = o.pop()) !== undefined;) {
        if (n == 0) {
          r = 0;
        }
        while (n > 1) {
          if (n % 2) {
            for (i = 3, j = Math.floor(Math.sqrt(n)); i <= j && n % i; i += 2) {
              //empty
            }
            d = i <= j ? i : n;
          } else {
            d = 2;
          }
          for (n /= d, r *= d, i = o.length; i; o[--i] % d === 0 && (o[i] /= d) === 1 && o.splice(i, 1)) {
            //empty
          }
        }
      }
      if (r >= Math.pow(2, 53)) {
        return formula.error.nm;
      }
      return r;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "MOD": function () {
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
      //被除数
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);

      //除数
      var divisor = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(divisor)) {
        return divisor;
      }
      if (!isRealNum(divisor)) {
        return formula.error.v;
      }
      divisor = parseFloat(divisor);
      if (divisor == 0) {
        return formula.error.d;
      }

      //计算结果
      var modulus = Math.abs(number % divisor);
      return divisor > 0 ? modulus : -modulus;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "MROUND": function () {
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
      //要舍入的值
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);

      //要舍入到的倍数
      var multiple = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(multiple)) {
        return multiple;
      }
      if (!isRealNum(multiple)) {
        return formula.error.v;
      }
      multiple = parseFloat(multiple);
      if (number * multiple < 0) {
        return formula.error.nm;
      }

      //计算结果
      return Math.round(number / multiple) * multiple;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ODD": function () {
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
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);
      var temp = Math.ceil(Math.abs(number));
      temp = temp & 1 ? temp : temp + 1;
      return number >= 0 ? temp : -temp;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "SUMSQ": function () {
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
      var sum = 0;
      if (dataArr.length > 0) {
        for (var i = 0; i < dataArr.length; i++) {
          var number = dataArr[i];
          if (!isRealNum(number)) {
            return formula.error.v;
          }
          number = parseFloat(number);
          sum += number * number;
        }
      }
      return sum;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "COMBIN": function () {
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
      //项目的数量
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseInt(number);

      //每一组合中项目的数量
      var number_chosen = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(number_chosen)) {
        return number_chosen;
      }
      if (!isRealNum(number_chosen)) {
        return formula.error.v;
      }
      number_chosen = parseInt(number_chosen);
      if (number < 0 || number_chosen < 0 || number < number_chosen) {
        return formula.error.nm;
      }

      //计算结果
      return func_methods.factorial(number) / (func_methods.factorial(number_chosen) * func_methods.factorial(number - number_chosen));
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "RAND": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }
    try {
      return Math.floor(Math.random() * 1000000000) / 1000000000;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ERFC": function () {
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
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);
      return jStat.erfc(number);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "EVEN": function () {
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
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);
      var temp = Math.ceil(Math.abs(number));
      temp = temp & 1 ? temp + 1 : temp;
      return number > 0 ? temp : -temp;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "EXP": function () {
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
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);
      return Math.exp(number);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "FACT": function () {
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
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        if (getObjType(number) == "boolean") {
          if (number.toString().toLowerCase() == "true") {
            number = 1;
          } else if (number.toString().toLowerCase() == "false") {
            number = 0;
          }
        } else {
          return formula.error.v;
        }
      }
      number = parseInt(number);
      if (number < 0) {
        return formula.error.nm;
      }
      return func_methods.factorial(number);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "FACTDOUBLE": function () {
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
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        if (getObjType(number) == "boolean") {
          if (number.toString().toLowerCase() == "true") {
            number = 1;
          } else if (number.toString().toLowerCase() == "false") {
            number = 0;
          }
        } else {
          return formula.error.v;
        }
      }
      number = parseInt(number);
      if (number < 0) {
        return formula.error.nm;
      }
      return func_methods.factorialDouble(number);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "PI": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }
    try {
      return Math.PI;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "FLOOR": function () {
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
      //number
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);

      //significance
      var significance = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(significance)) {
        return significance;
      }
      if (!isRealNum(significance)) {
        return formula.error.v;
      }
      significance = parseFloat(significance);
      if (significance == 0) {
        return formula.error.d;
      }
      if (number > 0 && significance < 0) {
        return formula.error.nm;
      }

      //计算
      var precision = -Math.floor(Math.log(Math.abs(significance)) / Math.log(10));
      if (number >= 0) {
        return Math.floor(number / significance) * significance * Math.pow(10, precision) / Math.pow(10, precision);
      } else {
        return -(Math.ceil(Math.abs(number) / significance) * significance * Math.pow(10, precision)) / Math.pow(10, precision);
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "GCD": function () {
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
          dataArr = dataArr.concat(func_methods.getCellDataArr(data, "number", false));
        } else {
          dataArr.push(data);
        }
      }
      if (!isRealNum(dataArr[0])) {
        return formula.error.v;
      }
      var x = parseInt(dataArr[0]);
      if (x < 0 || x >= Math.pow(2, 53)) {
        return formula.error.nm;
      }
      for (var i = 1; i < dataArr.length; i++) {
        var y = dataArr[i];
        if (!isRealNum(y)) {
          return formula.error.v;
        }
        y = parseInt(y);
        if (y < 0 || y >= Math.pow(2, 53)) {
          return formula.error.nm;
        }
        while (x && y) {
          if (x > y) {
            x %= y;
          } else {
            y %= x;
          }
        }
        x += y;
      }
      return x;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "RANDBETWEEN": function () {
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
      //下界
      var bottom = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(bottom)) {
        return bottom;
      }
      if (!isRealNum(bottom)) {
        return formula.error.v;
      }
      bottom = parseInt(bottom);

      //上界
      var top = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(top)) {
        return top;
      }
      if (!isRealNum(top)) {
        return formula.error.v;
      }
      top = parseInt(top);
      if (bottom > top) {
        return formula.error.nm;
      }

      //计算
      return bottom + Math.ceil((top - bottom + 1) * Math.random()) - 1;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ROUND": function () {
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
      //四舍五入的数字
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);

      //位数
      var digits = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(digits)) {
        return digits;
      }
      if (!isRealNum(digits)) {
        return formula.error.v;
      }
      digits = parseInt(digits);

      //计算
      var sign = number > 0 ? 1 : -1;
      return sign * Math.round(Math.abs(number) * Math.pow(10, digits)) / Math.pow(10, digits);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ROUNDDOWN": function () {
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
      //四舍五入的数字
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);

      //位数
      var digits = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(digits)) {
        return digits;
      }
      if (!isRealNum(digits)) {
        return formula.error.v;
      }
      digits = parseInt(digits);

      //计算
      var sign = number > 0 ? 1 : -1;
      return sign * Math.floor(Math.abs(number) * Math.pow(10, digits)) / Math.pow(10, digits);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ROUNDUP": function () {
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
      //四舍五入的数字
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);

      //位数
      var digits = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(digits)) {
        return digits;
      }
      if (!isRealNum(digits)) {
        return formula.error.v;
      }
      digits = parseInt(digits);

      //计算
      var sign = number > 0 ? 1 : -1;
      return sign * Math.ceil(Math.abs(number) * Math.pow(10, digits)) / Math.pow(10, digits);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "SERIESSUM": function () {
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
      //幂级数的输入值
      var x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(x)) {
        return x;
      }
      if (!isRealNum(x)) {
        return formula.error.v;
      }
      x = parseFloat(x);

      //x 的首项乘幂
      var n = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(n)) {
        return n;
      }
      if (!isRealNum(n)) {
        return formula.error.v;
      }
      n = parseFloat(n);

      //级数中每一项的乘幂 n 的步长增加值
      var m = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(m)) {
        return m;
      }
      if (!isRealNum(m)) {
        return formula.error.v;
      }
      m = parseFloat(m);

      //与 x 的每个连续乘幂相乘的一组系数
      var data_coefficients = arguments[3];
      var coefficients = [];
      if (getObjType(data_coefficients) == "array") {
        if (getObjType(data_coefficients[0]) == "array" && !func_methods.isDyadicArr(data_coefficients)) {
          return formula.error.v;
        }
        coefficients = coefficients.concat(func_methods.getDataArr(data_coefficients, false));
      } else if (getObjType(data_coefficients) == "object" && data_coefficients.startCell != null) {
        coefficients = coefficients.concat(func_methods.getCellDataArr(data_coefficients, "number", false));
      } else {
        coefficients.push(data_coefficients);
      }

      //计算
      if (!isRealNum(coefficients[0])) {
        return formula.error.v;
      }
      var result = parseFloat(coefficients[0]) * Math.pow(x, n);
      for (var i = 1; i < coefficients.length; i++) {
        var number = coefficients[i];
        if (!isRealNum(number)) {
          return formula.error.v;
        }
        number = parseFloat(number);
        result += number * Math.pow(x, n + i * m);
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "SIGN": function () {
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
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);
      if (number > 0) {
        return 1;
      } else if (number == 0) {
        return 0;
      } else if (number < 0) {
        return -1;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "SQRT": function () {
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
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);
      if (number < 0) {
        return formula.error.nm;
      }
      return Math.sqrt(number);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "SQRTPI": function () {
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
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);
      if (number < 0) {
        return formula.error.nm;
      }
      return Math.sqrt(number * Math.PI);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "GAMMALN": function () {
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
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);
      if (number <= 0) {
        return formula.error.nm;
      }
      return jStat.gammaln(number);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "TRUNC": function () {
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
      //要截取的数据
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);

      //位数
      if (arguments.length == 2) {
        var digits = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(digits)) {
          return digits;
        }
        if (!isRealNum(digits)) {
          return formula.error.v;
        }
        digits = parseInt(digits);
      } else {
        var digits = 0;
      }

      //计算
      var sign = number > 0 ? 1 : -1;
      return sign * Math.floor(Math.abs(number) * Math.pow(10, digits)) / Math.pow(10, digits);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "QUOTIENT": function () {
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
      //被除数
      var numerator = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(numerator)) {
        return numerator;
      }
      if (!isRealNum(numerator)) {
        return formula.error.v;
      }
      numerator = parseFloat(numerator);

      //除数
      var denominator = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(denominator)) {
        return denominator;
      }
      if (!isRealNum(denominator)) {
        return formula.error.v;
      }
      denominator = parseFloat(denominator);
      if (denominator == 0) {
        return formula.error.d;
      }

      //计算
      return parseInt(numerator / denominator, 10);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "POWER": function () {
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
      //底数
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);

      //指数
      var power = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(power)) {
        return power;
      }
      if (!isRealNum(power)) {
        return formula.error.v;
      }
      power = parseFloat(power);
      if (number == 0 && power == 0) {
        return formula.error.nm;
      }
      if (number < 0 && power.toString().indexOf(".") > -1) {
        return formula.error.nm;
      }
      return Math.pow(number, power);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "PRODUCT": function () {
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
      var result = 1;
      for (var i = 0; i < dataArr.length; i++) {
        var number = dataArr[i];
        if (!isRealNum(number)) {
          return formula.error.v;
        }
        number = parseFloat(number);
        result *= number;
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  }
};

export default mathBasic;
