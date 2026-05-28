import formula from "../../../global/formula";
import func_methods from "../../../global/func_methods";
import {  isRealNum,  valueIsError } from "../../../global/validate";

const mathTrigonometric = {
  "TAN": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
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
      return Math.tan(number);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "TANH": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
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
      var e2 = Math.exp(2 * number);
      return (e2 - 1) / (e2 + 1);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ATAN": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
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
      return Math.atan(number);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ASINH": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
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
      return Math.log(number + Math.sqrt(number * number + 1));
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ACOS": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
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
      if (number < -1 || number > 1) {
        return formula.error.nm;
      }
      return Math.acos(number);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ACOSH": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
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
      if (number < 1) {
        return formula.error.nm;
      }
      return Math.log(number + Math.sqrt(number * number - 1));
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ATANH": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
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
      if (number <= -1 || number >= 1) {
        return formula.error.nm;
      }
      return Math.log((1 + number) / (1 - number)) / 2;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ATAN2": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
    }

    //参数类型错误检测
    for (var i = 0; i < arguments.length; i++) {
      var p = formula.errorParamCheck(this.p, arguments[i], i);
      if (!p[0]) {
        return formula.error.v;
      }
    }
    try {
      //要计算其与x轴夹角大小的线段的终点x坐标
      var number_x = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number_x)) {
        return number_x;
      }
      if (!isRealNum(number_x)) {
        return formula.error.v;
      }
      number_x = parseFloat(number_x);

      //要计算其与x轴夹角大小的线段的终点y坐标
      var number_y = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(number_y)) {
        return number_y;
      }
      if (!isRealNum(number_y)) {
        return formula.error.v;
      }
      number_y = parseFloat(number_y);
      if (number_x == 0 && number_y == 0) {
        return formula.error.d;
      }
      return Math.atan2(number_y, number_x);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "COSH": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
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
      return (Math.exp(number) + Math.exp(-number)) / 2;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "LN": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
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
      return Math.log(number);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "LOG": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
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
      if (arguments.length == 2) {
        var base = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(base)) {
          return base;
        }
        if (!isRealNum(base)) {
          return formula.error.v;
        }
        base = parseFloat(base);
        if (base <= 0) {
          return formula.error.nm;
        }
      } else {
        var base = 10;
      }
      return Math.log(number) / Math.log(base);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "LOG10": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
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
      return Math.log(number) / Math.log(10);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ASIN": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
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
      if (number < -1 || number > 1) {
        return formula.error.nm;
      }
      return Math.asin(number);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "RADIANS": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
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
      return number * Math.PI / 180;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DEGREES": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
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
      return number * 180 / Math.PI;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "SIN": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
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
      return Math.sin(number);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "SINH": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
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
      return (Math.exp(number) - Math.exp(-number)) / 2;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "COS": function () {
    //必要参数个数错误检测
    if (arguments.length < this.m[0] || arguments.length > this.m[1]) {
      return formula.error.na;
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
      return Math.cos(number);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
};

export default mathTrigonometric;
