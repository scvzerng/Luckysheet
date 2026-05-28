import formula from "../../../global/formula";
import func_methods from "../../../global/func_methods";
import {  isRealNum,  valueIsError } from "../../../global/validate";

const textManipulation = {
  "CONCAT": function () {
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
      var value1 = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(value1)) {
        return value1;
      }

      //value2
      var value2 = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(value2)) {
        return value2;
      }
      return value1 + "" + value2;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "CONCATENATE": function () {
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
      var result = "";
      for (var i = 0; i < arguments.length; i++) {
        var text = func_methods.getFirstValue(arguments[i], "text");
        if (valueIsError(text)) {
          return text;
        }
        result = result + "" + text;
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "CODE": function () {
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
      //字符串
      var text = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(text)) {
        return text;
      }
      if (text == "") {
        return formula.error.v;
      }
      return text.charCodeAt(0);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "CHAR": function () {
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
      //数字
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseInt(number);
      if (number < 1 || number > 255) {
        return formula.error.v;
      }
      return String.fromCharCode(number);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ARABIC": function () {
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
      //字符串
      var text = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(text)) {
        return text;
      }
      text = text.toString().toUpperCase();
      if (!/^M*(?:D?C{0,3}|C[MD])(?:L?X{0,3}|X[CL])(?:V?I{0,3}|I[XV])$/.test(text)) {
        return formula.error.v;
      }
      var r = 0;
      text.replace(/[MDLV]|C[MD]?|X[CL]?|I[XV]?/g, function (i) {
        r += {
          M: 1000,
          CM: 900,
          D: 500,
          CD: 400,
          C: 100,
          XC: 90,
          L: 50,
          XL: 40,
          X: 10,
          IX: 9,
          V: 5,
          IV: 4,
          I: 1
        }[i];
      });
      return r;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ROMAN": function () {
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
      //数字
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseInt(number);
      if (number == 0) {
        return "";
      } else if (number < 1 || number > 3999) {
        return formula.error.v;
      }

      //计算
      function convert(num) {
        var a = [["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"], ["", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"], ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"], ["", "M", "MM", "MMM"]];
        var i = a[3][Math.floor(num / 1000)];
        var j = a[2][Math.floor(num % 1000 / 100)];
        var k = a[1][Math.floor(num % 100 / 10)];
        var l = a[0][num % 10];
        return i + j + k + l;
      }
      return convert(number);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "REGEXEXTRACT": function () {
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
      //输入文本
      var text = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(text)) {
        return text;
      }

      //表达式
      var regular_expression = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(regular_expression)) {
        return regular_expression;
      }
      var match = text.match(new RegExp(regular_expression));
      return match ? match[match.length > 1 ? match.length - 1 : 0] : null;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "REGEXMATCH": function () {
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
      //输入文本
      var text = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(text)) {
        return text;
      }

      //表达式
      var regular_expression = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(regular_expression)) {
        return regular_expression;
      }
      var match = text.match(new RegExp(regular_expression));
      return match ? true : false;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "REGEXREPLACE": function () {
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
      //输入文本
      var text = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(text)) {
        return text;
      }

      //表达式
      var regular_expression = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(regular_expression)) {
        return regular_expression;
      }

      //插入文本
      var replacement = func_methods.getFirstValue(arguments[2], "text");
      if (valueIsError(replacement)) {
        return replacement;
      }
      return text.replace(new RegExp(regular_expression), replacement);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
};

export default textManipulation;
