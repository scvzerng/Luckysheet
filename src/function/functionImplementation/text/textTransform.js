import formula from "../../../global/formula";
import func_methods from "../../../global/func_methods";
import {  isRealNum,  valueIsError } from "../../../global/validate";
import {  update  } from "../../../global/format";
import {  getObjType } from "../../../utils/util";

const textTransform = {
  "T": function () {
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
      //文本
      var value = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(value)) {
        return value;
      }
      return getObjType(value) == "string" ? value : '';
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "FIXED": function () {
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
      //要进行舍入并转换为文本的数字
      var number = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(number)) {
        return number;
      }
      if (!isRealNum(number)) {
        return formula.error.v;
      }
      number = parseFloat(number);

      //小数位数
      var decimals = 2;
      if (arguments.length >= 2) {
        decimals = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(decimals)) {
          return decimals;
        }
        if (!isRealNum(decimals)) {
          return formula.error.v;
        }
        decimals = parseInt(decimals);
      }

      //逻辑值
      var no_commas = false;
      if (arguments.length == 3) {
        no_commas = func_methods.getCellBoolen(arguments[2]);
        if (valueIsError(no_commas)) {
          return no_commas;
        }
      }
      if (decimals > 127) {
        return formula.error.v;
      }

      //计算
      var format = no_commas ? '0' : '#,##0';
      if (decimals <= 0) {
        number = Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
      } else if (decimals > 0) {
        format += '.' + new Array(decimals + 1).join('0');
      }
      return update(format, number);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "FIND": function () {
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
      //要查找的文本
      var find_text = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(find_text)) {
        return find_text;
      }
      find_text = find_text.toString();

      //包含要查找文本的文本
      var within_text = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(within_text)) {
        return within_text;
      }
      within_text = within_text.toString();

      //指定开始进行查找的字符
      var start_num = 1;
      if (arguments.length == 3) {
        start_num = func_methods.getFirstValue(arguments[2]);
        if (valueIsError(start_num)) {
          return start_num;
        }
        if (!isRealNum(start_num)) {
          return formula.error.v;
        }
        start_num = parseFloat(start_num);
      }
      if (start_num < 0 || start_num > within_text.length) {
        return formula.error.v;
      }
      if (find_text == "") {
        return start_num;
      }
      if (within_text.indexOf(find_text) == -1) {
        return formula.error.v;
      }
      var result = within_text.indexOf(find_text, start_num - 1) + 1;
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "FINDB": function () {
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
      //要查找的文本
      var find_text = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(find_text)) {
        return find_text;
      }
      find_text = find_text.toString();

      //包含要查找文本的文本
      var within_text = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(within_text)) {
        return within_text;
      }
      within_text = within_text.toString();

      //指定开始进行查找的字符
      var start_num = 1;
      if (arguments.length == 3) {
        start_num = func_methods.getFirstValue(arguments[2]);
        if (valueIsError(start_num)) {
          return start_num;
        }
        if (!isRealNum(start_num)) {
          return formula.error.v;
        }
        start_num = parseFloat(start_num);
      }
      if (start_num < 0 || start_num > within_text.length) {
        return formula.error.v;
      }
      if (find_text == "") {
        return start_num;
      }
      if (within_text.indexOf(find_text) == -1) {
        return formula.error.v;
      }
      var strArr = within_text.split("");
      var index = within_text.indexOf(find_text, start_num - 1);
      var result = 0;
      for (var i = 0; i < index; i++) {
        if (/[^\x00-\xff]/g.test(strArr[i])) {
          result += 2;
        } else {
          result += 1;
        }
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "JOIN": function () {
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
      //定界符
      var separator = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(separator)) {
        return separator;
      }

      //值或数组
      var dataArr = [];
      for (var i = 1; i < arguments.length; i++) {
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
      return dataArr.join(separator);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "LEFT": function () {
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
      //包含要提取���字符的文本字符串
      var text = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(text)) {
        return text;
      }
      text = text.toString();

      //提取的字符的数量
      var num_chars = 1;
      if (arguments.length == 2) {
        num_chars = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(num_chars)) {
          return num_chars;
        }
        if (!isRealNum(num_chars)) {
          return formula.error.v;
        }
        num_chars = parseInt(num_chars);
      }
      if (num_chars < 0) {
        return formula.error.v;
      }

      //计算
      if (num_chars >= text.length) {
        return text;
      } else if (num_chars == 0) {
        return "";
      } else {
        return text.substr(0, num_chars);
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "RIGHT": function () {
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
      //包含要提取的字符的文本字符串
      var text = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(text)) {
        return text;
      }
      text = text.toString();

      //提取的字符的数量
      var num_chars = 1;
      if (arguments.length == 2) {
        num_chars = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(num_chars)) {
          return num_chars;
        }
        if (!isRealNum(num_chars)) {
          return formula.error.v;
        }
        num_chars = parseInt(num_chars);
      }
      if (num_chars < 0) {
        return formula.error.v;
      }

      //计算
      if (num_chars >= text.length) {
        return text;
      } else if (num_chars == 0) {
        return "";
      } else {
        return text.substr(-num_chars, num_chars);
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "MID": function () {
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
      //包含要提取的字符的文本字符串
      var text = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(text)) {
        return text;
      }
      text = text.toString();

      //开始提取的位置
      var start_num = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(start_num)) {
        return start_num;
      }
      if (!isRealNum(start_num)) {
        return formula.error.v;
      }
      start_num = parseInt(start_num);

      //提取的字符的数量
      var num_chars = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(num_chars)) {
        return num_chars;
      }
      if (!isRealNum(num_chars)) {
        return formula.error.v;
      }
      num_chars = parseInt(num_chars);
      if (start_num < 1 || num_chars < 0) {
        return formula.error.v;
      }

      //计算
      if (start_num > text.length) {
        return "";
      }
      if (start_num + num_chars > text.length) {
        return text.substr(start_num - 1, text.length - start_num + 1);
      }
      return text.substr(start_num - 1, num_chars);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "LEN": function () {
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
      text = text.toString();
      return text.length;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
};

export default textTransform;
