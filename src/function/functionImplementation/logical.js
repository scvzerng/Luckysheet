import formula from "../../global/formula";
import func_methods from "../../global/func_methods";
import {  isRealNum,  valueIsError,  error  } from "../../global/validate";
import {  getObjType } from "../../utils/util";

//公式函数计算
const logicalFunctions = {
  "NOT": function () {
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
      //logical
      var logical = func_methods.getCellBoolen(arguments[0]);
      if (valueIsError(logical)) {
        return logical;
      }
      return !logical;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "TRUE": function () {
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
      return true;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "FALSE": function () {
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
      return false;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "AND": function () {
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
      var result = true;
      for (var i = 0; i < arguments.length; i++) {
        var logical = func_methods.getCellBoolen(arguments[i]);
        if (valueIsError(logical)) {
          return logical;
        }
        if (!logical) {
          result = false;
          break;
        }
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "IFERROR": function () {
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
      var value_if_error = func_methods.getFirstValue(arguments[1], "text");
      var value = func_methods.getFirstValue(arguments[0], "text");
      // (getObjType(value) === 'string' && value.trim() === ''It means that the cell associated with IFERROR has been deleted by keyboard
      if (valueIsError(value) || getObjType(value) === 'string' && value.trim() === '') {
        return value_if_error;
      }
      return value;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "IF": function () {
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
      //要测试的条件
      var logical_test = func_methods.getCellBoolen(arguments[0]);
      if (valueIsError(logical_test)) {
        return logical_test;
      }

      //结果为 TRUE
      var value_if_true = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(value_if_true) && value_if_true != error.d) {
        return value_if_true;
      }

      //结果为 FALSE
      var value_if_false = "";
      if (arguments.length == 3) {
        value_if_false = func_methods.getFirstValue(arguments[2], "text");
        if (valueIsError(value_if_false) && value_if_false != error.d) {
          return value_if_false;
        }
      }
      if (logical_test) {
        return value_if_true;
      } else {
        return value_if_false;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "OR": function () {
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
      var result = false;
      for (var i = 0; i < arguments.length; i++) {
        var logical = func_methods.getCellBoolen(arguments[i]);
        if (valueIsError(logical)) {
          return logical;
        }
        if (logical) {
          result = true;
          break;
        }
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "NE": function () {
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
      //value1
      var value1 = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(value1)) {
        return value1;
      }

      //value2
      var value2 = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(value2)) {
        return value2;
      }
      return value1 != value2;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "EQ": function () {
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
      //value1
      var value1 = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(value1)) {
        return value1;
      }

      //value2
      var value2 = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(value2)) {
        return value2;
      }
      return value1 == value2;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "GT": function () {
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
      //value1
      var value1 = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(value1)) {
        return value1;
      }
      if (!isRealNum(value1)) {
        return formula.error.v;
      }
      value1 = parseFloat(value1);

      //value2
      var value2 = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(value2)) {
        return value2;
      }
      if (!isRealNum(value2)) {
        return formula.error.v;
      }
      value2 = parseFloat(value2);
      return value1 > value2;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "GTE": function () {
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
      //value1
      var value1 = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(value1)) {
        return value1;
      }
      if (!isRealNum(value1)) {
        return formula.error.v;
      }
      value1 = parseFloat(value1);

      //value2
      var value2 = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(value2)) {
        return value2;
      }
      if (!isRealNum(value2)) {
        return formula.error.v;
      }
      value2 = parseFloat(value2);
      return value1 >= value2;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "LT": function () {
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
      //value1
      var value1 = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(value1)) {
        return value1;
      }
      if (!isRealNum(value1)) {
        return formula.error.v;
      }
      value1 = parseFloat(value1);

      //value2
      var value2 = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(value2)) {
        return value2;
      }
      if (!isRealNum(value2)) {
        return formula.error.v;
      }
      value2 = parseFloat(value2);
      return value1 < value2;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "LTE": function () {
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
      //value1
      var value1 = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(value1)) {
        return value1;
      }
      if (!isRealNum(value1)) {
        return formula.error.v;
      }
      value1 = parseFloat(value1);

      //value2
      var value2 = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(value2)) {
        return value2;
      }
      if (!isRealNum(value2)) {
        return formula.error.v;
      }
      value2 = parseFloat(value2);
      return value1 <= value2;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ADD": function () {
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
      //value1
      var value1 = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(value1)) {
        return value1;
      }
      if (!isRealNum(value1)) {
        return formula.error.v;
      }
      value1 = parseFloat(value1);

      //value2
      var value2 = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(value2)) {
        return value2;
      }
      if (!isRealNum(value2)) {
        return formula.error.v;
      }
      value2 = parseFloat(value2);
      return value1 + value2;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "MINUS": function () {
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
      //value1
      var value1 = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(value1)) {
        return value1;
      }
      if (!isRealNum(value1)) {
        return formula.error.v;
      }
      value1 = parseFloat(value1);

      //value2
      var value2 = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(value2)) {
        return value2;
      }
      if (!isRealNum(value2)) {
        return formula.error.v;
      }
      value2 = parseFloat(value2);
      return value1 - value2;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "MULTIPLY": function () {
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
      //value1
      var value1 = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(value1)) {
        return value1;
      }
      if (!isRealNum(value1)) {
        return formula.error.v;
      }
      value1 = parseFloat(value1);

      //value2
      var value2 = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(value2)) {
        return value2;
      }
      if (!isRealNum(value2)) {
        return formula.error.v;
      }
      value2 = parseFloat(value2);
      return value1 * value2;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DIVIDE": function () {
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
      //value1
      var value1 = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(value1)) {
        return value1;
      }
      if (!isRealNum(value1)) {
        return formula.error.v;
      }
      value1 = parseFloat(value1);

      //value2
      var value2 = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(value2)) {
        return value2;
      }
      if (!isRealNum(value2)) {
        return formula.error.v;
      }
      value2 = parseFloat(value2);
      if (value2 == 0) {
        return formula.error.d;
      }
      return value1 / value2;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "UNARY_PERCENT": function () {
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
      //要作为百分比解释的数值
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);
      var result = number / 100;
      return Math.round(result * 100) / 100;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  }
};
export default logicalFunctions;