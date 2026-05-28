import formula from "../../../global/formula";
import func_methods from "../../../global/func_methods";
import {  isRealNum,  valueIsError,  error  } from "../../../global/validate";

const engineeringConversion = {
  "BIN2DEC": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //二进制数
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!/^[01]{1,10}$/g.test(number)) {
        return formula.error.nm;
      }

      //计算
      var result = parseInt(number, 2);
      var stringified = number.toString();
      if (stringified.length === 10 && stringified.substring(0, 1) === '1') {
        return parseInt(stringified.substring(1), 2) - 512;
      } else {
        return result;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "BIN2HEX": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //二进制数
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }

      //有效位数
      var places = null;
      if (arguments.length == 2) {
        places = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(places)) {
          return places;
        }
        if (!isRealNum(places)) {
          return formula.error.v;
        }
        places = parseInt(places);
      }
      if (!/^[01]{1,10}$/g.test(number)) {
        return formula.error.nm;
      }

      //计算
      var result = parseInt(number, 2).toString(16).toUpperCase();
      if (places == null) {
        return result;
      } else {
        if (places < 0 || places < result.length) {
          return formula.error.nm;
        }
        return new Array(places - result.length + 1).join('0') + result;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "BIN2OCT": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //二进制数
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }

      //有效位数
      var places = null;
      if (arguments.length == 2) {
        places = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(places)) {
          return places;
        }
        if (!isRealNum(places)) {
          return formula.error.v;
        }
        places = parseInt(places);
      }
      if (!/^[01]{1,10}$/g.test(number)) {
        return formula.error.nm;
      }

      //计算
      var stringified = number.toString();
      if (stringified.length === 10 && stringified.substring(0, 1) === '1') {
        return (1073741312 + parseInt(stringified.substring(1), 2)).toString(8);
      }
      var result = parseInt(number, 2).toString(8);
      if (places == null) {
        return result;
      } else {
        if (places < 0 || places < result.length) {
          return formula.error.nm;
        }
        return new Array(places - result.length + 1).join('0') + result;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DEC2BIN": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //十进制数
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);

      //有效位数
      var places = null;
      if (arguments.length == 2) {
        places = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(places)) {
          return places;
        }
        if (!isRealNum(places)) {
          return formula.error.v;
        }
        places = parseInt(places);
      }
      if (!/^-?[0-9]{1,3}$/.test(number) || number < -512 || number > 511) {
        return formula.error.nm;
      }

      //计算
      if (number < 0) {
        return '1' + new Array(9 - (512 + number).toString(2).length).join('0') + (512 + number).toString(2);
      }
      var result = parseInt(number, 10).toString(2);
      if (places == null) {
        return result;
      } else {
        if (places < 0 || places < result.length) {
          return formula.error.nm;
        }
        return new Array(places - result.length + 1).join('0') + result;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DEC2HEX": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //十进制数
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);

      //有效位数
      var places = null;
      if (arguments.length == 2) {
        places = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(places)) {
          return places;
        }
        if (!isRealNum(places)) {
          return formula.error.v;
        }
        places = parseInt(places);
      }
      if (!/^-?[0-9]{1,12}$/.test(number) || number < -549755813888 || number > 549755813887) {
        return formula.error.nm;
      }

      //计算
      if (number < 0) {
        return (1099511627776 + number).toString(16).toUpperCase();
      }
      var result = parseInt(number, 10).toString(16).toUpperCase();
      if (places == null) {
        return result;
      } else {
        if (places < 0 || places < result.length) {
          return formula.error.nm;
        }
        return new Array(places - result.length + 1).join('0') + result;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DEC2OCT": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //十进制数
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);

      //有效位数
      var places = null;
      if (arguments.length == 2) {
        places = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(places)) {
          return places;
        }
        if (!isRealNum(places)) {
          return formula.error.v;
        }
        places = parseInt(places);
      }
      if (!/^-?[0-9]{1,9}$/.test(number) || number < -536870912 || number > 536870911) {
        return formula.error.nm;
      }

      //计算
      if (number < 0) {
        return (1073741824 + number).toString(8);
      }
      var result = parseInt(number, 10).toString(8);
      if (places == null) {
        return result;
      } else {
        if (places < 0 || places < result.length) {
          return formula.error.nm;
        }
        return new Array(places - result.length + 1).join('0') + result;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "HEX2BIN": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //十六进制数
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }

      //有效位数
      var places = null;
      if (arguments.length == 2) {
        places = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(places)) {
          return places;
        }
        if (!isRealNum(places)) {
          return formula.error.v;
        }
        places = parseInt(places);
      }
      if (!/^[0-9A-Fa-f]{1,10}$/.test(number)) {
        return formula.error.nm;
      }

      //计算
      var negative = number.length === 10 && number.substring(0, 1).toLowerCase() === 'f' ? true : false;
      var decimal = negative ? parseInt(number, 16) - 1099511627776 : parseInt(number, 16);
      if (decimal < -512 || decimal > 511) {
        return formula.error.nm;
      }
      if (negative) {
        return '1' + new Array(9 - (512 + decimal).toString(2).length).join('0') + (512 + decimal).toString(2);
      }
      var result = decimal.toString(2);
      if (places == null) {
        return result;
      } else {
        if (places < 0 || places < result.length) {
          return formula.error.nm;
        }
        return new Array(places - result.length + 1).join('0') + result;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "HEX2DEC": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //十六进制数
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!/^[0-9A-Fa-f]{1,10}$/.test(number)) {
        return formula.error.nm;
      }

      //计算
      var decimal = parseInt(number, 16);
      return decimal >= 549755813888 ? decimal - 1099511627776 : decimal;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "HEX2OCT": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //十六进制数
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }

      //有效位数
      var places = null;
      if (arguments.length == 2) {
        places = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(places)) {
          return places;
        }
        if (!isRealNum(places)) {
          return formula.error.v;
        }
        places = parseInt(places);
      }
      if (!/^[0-9A-Fa-f]{1,10}$/.test(number)) {
        return formula.error.nm;
      }

      //计算
      var decimal = parseInt(number, 16);
      if (decimal > 536870911 && decimal < 1098974756864) {
        return formula.error.nm;
      }
      if (decimal >= 1098974756864) {
        return (decimal - 1098437885952).toString(8);
      }
      var result = decimal.toString(8);
      if (places == null) {
        return result;
      } else {
        if (places < 0 || places < result.length) {
          return formula.error.nm;
        }
        return new Array(places - result.length + 1).join('0') + result;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "OCT2BIN": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //八进制数
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }

      //有效位数
      var places = null;
      if (arguments.length == 2) {
        places = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(places)) {
          return places;
        }
        if (!isRealNum(places)) {
          return formula.error.v;
        }
        places = parseInt(places);
      }
      if (!/^[0-7]{1,10}$/.test(number)) {
        return formula.error.nm;
      }

      //计算
      number = number.toString();
      var negative = number.length === 10 && number.substring(0, 1) === '7' ? true : false;
      var decimal = negative ? parseInt(number, 8) - 1073741824 : parseInt(number, 8);
      if (decimal < -512 || decimal > 511) {
        return error.num;
      }
      if (negative) {
        return '1' + new Array(9 - (512 + decimal).toString(2).length).join('0') + (512 + decimal).toString(2);
      }
      var result = decimal.toString(2);
      if (places == null) {
        return result;
      } else {
        if (places < 0 || places < result.length) {
          return formula.error.nm;
        }
        return new Array(places - result.length + 1).join('0') + result;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "OCT2DEC": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //八进制数
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!/^[0-7]{1,10}$/.test(number)) {
        return formula.error.nm;
      }

      //计算
      var decimal = parseInt(number, 8);
      return decimal >= 536870912 ? decimal - 1073741824 : decimal;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "OCT2HEX": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //八进制数
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }

      //有效位数
      var places = null;
      if (arguments.length == 2) {
        places = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(places)) {
          return places;
        }
        if (!isRealNum(places)) {
          return formula.error.v;
        }
        places = parseInt(places);
      }
      if (!/^[0-7]{1,10}$/.test(number)) {
        return formula.error.nm;
      }

      //计算
      var decimal = parseInt(number, 8);
      if (decimal >= 536870912) {
        return 'FF' + (decimal + 3221225472).toString(16).toUpperCase();
      }
      var result = decimal.toString(16).toUpperCase();
      if (places == null) {
        return result;
      } else {
        if (places < 0 || places < result.length) {
          return formula.error.nm;
        }
        return new Array(places - result.length + 1).join('0') + result;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
};

export default engineeringConversion;
