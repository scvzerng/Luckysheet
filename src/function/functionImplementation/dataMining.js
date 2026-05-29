import formula from "../../global/formula";
import func_methods from "../../global/func_methods";
import editor from "../../global/editor";
import {  isRealNum,  valueIsError } from "../../global/validate";
import {  jfrefreshgrid } from "../../global/refresh";
import Store from "../../store";

//公式函数计算
const dataMiningFunctions = {
  "DM_TEXT_CUTWORD": function () {
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
      var cell_r = window.luckysheetCurrentRow;
      var cell_c = window.luckysheetCurrentColumn;
      var cell_fp = window.luckysheetCurrentFunction;

      //任意需要分词的文本
      var text = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(text)) {
        return text;
      }

      //分词模式
      var datetype = 0;
      if (arguments[1] != null) {
        datetype = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(datetype)) {
          return datetype;
        }
      }
      if (!isRealNum(datetype)) {
        return formula.error.v;
      }
      datetype = parseInt(datetype);
      if (datetype != 0 && datetype != 1 && datetype != 2) {
        return formula.error.v;
      }
      fetch("/dataqk/tu/api/cutword", {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "text": text,
          "type": datetype
        }).toString()
      }).then(function(response) { return response.text(); }).then(function (data) {
        var d = [].concat(Store.flowdata);
        formula.execFunctionGroup(cell_r, cell_c, data);
        d[cell_r][cell_c] = {
          "v": data,
          "f": cell_fp
        };
        jfrefreshgrid(d, [{
          "row": [cell_r, cell_r],
          "column": [cell_c, cell_c]
        }]);
      });
      return "loading...";
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DM_TEXT_TFIDF": function () {
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
      var cell_r = window.luckysheetCurrentRow;
      var cell_c = window.luckysheetCurrentColumn;
      var cell_fp = window.luckysheetCurrentFunction;

      //任意需要分词的文本
      var text = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(text)) {
        return text;
      }

      //关键词个数
      var count = 20;
      if (arguments[1] != null) {
        count = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(count)) {
          return count;
        }
      }
      if (!isRealNum(count)) {
        return formula.error.v;
      }
      count = parseInt(count);

      //语料库
      var set = 0;
      if (arguments[2] != null) {
        set = func_methods.getFirstValue(arguments[2]);
        if (valueIsError(set)) {
          return set;
        }
      }
      if (!isRealNum(set)) {
        return formula.error.v;
      }
      set = parseInt(set);
      if (count < 0) {
        return formula.error.v;
      }
      if (set != 0 && set != 1 && set != 2) {
        return formula.error.v;
      }
      fetch("/dataqk/tu/api/tfidf", {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "text": text,
          "count": count,
          "set": set
        }).toString()
      }).then(function(response) { return response.text(); }).then(function (data) {
        var d = editor.deepCopyFlowData(Store.flowdata);
        formula.execFunctionGroup(cell_r, cell_c, data);
        d[cell_r][cell_c] = {
          "v": data,
          "f": cell_fp
        };
        jfrefreshgrid(d, [{
          "row": [cell_r, cell_r],
          "column": [cell_c, cell_c]
        }]);
      });
      return "loading...";
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DM_TEXT_TEXTRANK": function () {
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
      var cell_r = window.luckysheetCurrentRow;
      var cell_c = window.luckysheetCurrentColumn;
      var cell_fp = window.luckysheetCurrentFunction;

      //任意需要分词的文本
      var text = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(text)) {
        return text;
      }

      //关键词个数
      var count = 20;
      if (arguments[1] != null) {
        count = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(count)) {
          return count;
        }
      }
      if (!isRealNum(count)) {
        return formula.error.v;
      }
      count = parseInt(count);

      //语料库
      var set = 0;
      if (arguments[2] != null) {
        set = func_methods.getFirstValue(arguments[2]);
        if (valueIsError(set)) {
          return set;
        }
      }
      if (!isRealNum(set)) {
        return formula.error.v;
      }
      set = parseInt(set);
      if (count < 0) {
        return formula.error.v;
      }
      if (set != 0 && set != 1 && set != 2) {
        return formula.error.v;
      }
      fetch("/dataqk/tu/api/tfidf", {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "text": text,
          "count": count,
          "set": set
        }).toString()
      }).then(function(response) { return response.text(); }).then(function (data) {
        var d = editor.deepCopyFlowData(Store.flowdata);
        formula.execFunctionGroup(cell_r, cell_c, data);
        d[cell_r][cell_c] = {
          "v": data,
          "f": cell_fp
        };
        jfrefreshgrid(d, [{
          "row": [cell_r, cell_r],
          "column": [cell_c, cell_c]
        }]);
      });
      return "loading...";
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  }
};
export default dataMiningFunctions;