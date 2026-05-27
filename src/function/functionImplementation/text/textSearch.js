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

const textSearch = {
  "LENB": function () {
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
      return text.replace(/[^\x00-\xff]/g, "aa").length;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "LOWER": function () {
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
      return text ? text.toLowerCase() : text;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "UPPER": function () {
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
      return text ? text.toUpperCase() : text;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "EXACT": function () {
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
      //字符串1
      var text1 = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(text1)) {
        return text1;
      }
      text1 = text1.toString();

      //字符串2
      var text2 = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(text2)) {
        return text2;
      }
      text2 = text2.toString();
      return text1 === text2;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "REPLACE": function () {
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
      //字符串1
      var old_text = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(old_text)) {
        return old_text;
      }
      old_text = old_text.toString();

      //进行替换操作的位置
      var start_num = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(start_num)) {
        return start_num;
      }
      if (!isRealNum(start_num)) {
        return formula.error.v;
      }
      start_num = parseInt(start_num);

      //要在文本中替换的字符个数
      var num_chars = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(num_chars)) {
        return num_chars;
      }
      if (!isRealNum(num_chars)) {
        return formula.error.v;
      }
      num_chars = parseInt(num_chars);

      //字符串2
      var new_text = func_methods.getFirstValue(arguments[3], "text");
      if (valueIsError(new_text)) {
        return new_text;
      }
      new_text = new_text.toString();
      return old_text.substr(0, start_num - 1) + new_text + old_text.substr(start_num - 1 + num_chars);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "REPT": function () {
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
      //字符串1
      var text = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(text)) {
        return text;
      }
      text = text.toString();

      //重复次数
      var number_times = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(number_times)) {
        return number_times;
      }
      if (!isRealNum(number_times)) {
        return formula.error.v;
      }
      number_times = parseInt(number_times);
      if (number_times < 0) {
        return formula.error.v;
      }
      if (number_times > 100) {
        number_times = 100;
      }
      return new Array(number_times + 1).join(text);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "SEARCH": function () {
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
      //字符串1
      var find_text = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(find_text)) {
        return find_text;
      }
      find_text = find_text.toString();

      //字符串2
      var within_text = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(within_text)) {
        return within_text;
      }
      within_text = within_text.toString();

      //开始位置
      var start_num = 1;
      if (arguments.length == 3) {
        start_num = func_methods.getFirstValue(arguments[2]);
        if (valueIsError(start_num)) {
          return start_num;
        }
        if (!isRealNum(start_num)) {
          return formula.error.v;
        }
        start_num = parseInt(start_num);
      }
      if (start_num <= 0 || start_num > within_text.length) {
        return formula.error.v;
      }
      var foundAt = within_text.toLowerCase().indexOf(find_text.toLowerCase(), start_num - 1) + 1;
      return foundAt === 0 ? formula.error.v : foundAt;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "SUBSTITUTE": function () {
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
      //需要替换其中字符的文本
      var text = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(text)) {
        return text;
      }
      text = text.toString();

      //需要替换的文本
      var old_text = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(old_text)) {
        return old_text;
      }
      old_text = old_text.toString();

      //用于替换 old_text 的文本
      var new_text = func_methods.getFirstValue(arguments[2], "text");
      if (valueIsError(new_text)) {
        return new_text;
      }
      new_text = new_text.toString();

      //instance_num
      var instance_num = null;
      if (arguments.length == 4) {
        instance_num = func_methods.getFirstValue(arguments[3]);
        if (valueIsError(instance_num)) {
          return instance_num;
        }
        if (!isRealNum(instance_num)) {
          return formula.error.v;
        }
        instance_num = parseInt(instance_num);
      }

      //计算
      var reg = new RegExp(old_text, "g");
      var result;
      if (instance_num == null) {
        result = text.replace(reg, new_text);
      } else {
        if (instance_num <= 0) {
          return formula.error.v;
        }
        var match = text.match(reg);
        if (match == null || instance_num > match.length) {
          return text;
        } else {
          var len = old_text.length;
          var index = 0;
          for (var i = 1; i <= instance_num; i++) {
            index = text.indexOf(old_text, index) + 1;
          }
          result = text.substring(0, index - 1) + new_text + text.substring(index - 1 + len);
        }
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "CLEAN": function () {
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
      var textArr = [];
      for (var i = 0; i < text.length; i++) {
        var code = text.charCodeAt(i);
        if (/[\u4e00-\u9fa5]/g.test(text.charAt(i)) || code > 31 && code < 127) {
          textArr.push(text.charAt(i));
        }
      }
      return textArr.join("");
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "TEXT": function () {
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
      var value = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(value)) {
        return value;
      }
      if (!isRealNum(value)) {
        return formula.error.v;
      }
      value = parseFloat(value);

      //格式
      var format_text = func_methods.getFirstValue(arguments[1], "text");
      if (valueIsError(format_text)) {
        return format_text;
      }
      format_text = format_text.toString();
      return update(format_text, value);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "TRIM": function () {
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
      return text.replace(/ +/g, ' ').trim();
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "VALUE": function () {
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
      return genarate(text)[2];
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "PROPER": function () {
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
      text = text.toString().toLowerCase();
      return text.replace(/[a-zA-Z]+/g, function (word) {
        return word.substring(0, 1).toUpperCase() + word.substring(1);
      });
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  }
};

export default textSearch;
