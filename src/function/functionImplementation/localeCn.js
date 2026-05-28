import formula from "../../global/formula";
import func_methods from "../../global/func_methods";
import editor from "../../global/editor";
import {  isdatetime } from "../../global/datecontroll";
import {  isRealNum,  valueIsError } from "../../global/validate";
import {  jfrefreshgrid } from "../../global/refresh";
import {  update  } from "../../global/format";
import {  getObjType,  numFormat  } from "../../utils/util";
import Store from "../../store";
import dayjs from 'dayjs';

//公式函数计算
const localeCnFunctions = {
  "AGE_BY_IDCARD": function () {
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
      //身份证号
      var UUserCard = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(UUserCard)) {
        return UUserCard;
      }
      if (!window.luckysheet_function.ISIDCARD.f(UUserCard)) {
        return formula.error.v;
      }
      var birthday = window.luckysheet_function.BIRTHDAY_BY_IDCARD.f(UUserCard);
      if (valueIsError(birthday)) {
        return birthday;
      }
      birthday = dayjs(birthday);
      var cuurentdate = dayjs();
      if (arguments.length == 2) {
        cuurentdate = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(cuurentdate)) {
          return cuurentdate;
        }
        cuurentdate = dayjs(cuurentdate);
      }
      var age = cuurentdate.diff(birthday, "years");
      if (age < 0 || age.toString() == "NaN") {
        return formula.error.v;
      }
      return age;
    } catch (e) {
      var err = e;
      //计算错误检测
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "SEX_BY_IDCARD": function () {
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
      //身份证号
      var UUserCard = func_methods.getFirstValue(arguments[0]).toString();
      if (valueIsError(UUserCard)) {
        return UUserCard;
      }
      if (!window.luckysheet_function.ISIDCARD.f(UUserCard)) {
        return formula.error.v;
      }
      if (parseInt(UUserCard.substr(16, 1)) % 2 == 1) {
        return "男";
      } else {
        return "女";
      }
    } catch (e) {
      var err = e;
      //计算错误检测
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "BIRTHDAY_BY_IDCARD": function () {
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
      //身份证号
      var UUserCard = func_methods.getFirstValue(arguments[0]).toString();
      if (valueIsError(UUserCard)) {
        return UUserCard;
      }
      if (!window.luckysheet_function.ISIDCARD.f(UUserCard)) {
        return formula.error.v;
      }
      var birthday = "";
      if (UUserCard.length == 15) {
        var year = "19" + UUserCard.substring(6, 8) + "/" + UUserCard.substring(8, 10) + "/" + UUserCard.substring(10, 12);
        birthday = year;
      } else if (UUserCard.length == 18) {
        var year = UUserCard.substring(6, 10) + "/" + UUserCard.substring(10, 12) + "/" + UUserCard.substring(12, 14);
        birthday = year;
      }

      //生日格式
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
      if (datetype < 0 || datetype > 2) {
        return formula.error.v;
      }
      if (parseInt(datetype) == 0) {
        return birthday;
      } else if (parseInt(datetype) == 1) {
        return dayjs(birthday).format("YYYY-MM-DD");
      } else if (parseInt(datetype) == 2) {
        return dayjs(birthday).format("YYYY年M月D日");
      }
    } catch (e) {
      var err = e;
      //计算错误检测
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "PROVINCE_BY_IDCARD": function () {
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
      //身份证号
      var UUserCard = func_methods.getFirstValue(arguments[0]).toString();
      if (valueIsError(UUserCard)) {
        return UUserCard;
      }
      if (!window.luckysheet_function.ISIDCARD.f(UUserCard)) {
        return formula.error.v;
      }
      var native = "未知";
      var provinceArray = formula.classlist.province;
      if (UUserCard.substring(0, 2) in provinceArray) {
        native = provinceArray[UUserCard.substring(0, 2)];
      }
      return native;
    } catch (e) {
      var err = e;
      //计算错误检测
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "CITY_BY_IDCARD": function () {
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
      //身份证号
      var UUserCard = func_methods.getFirstValue(arguments[0]).toString();
      if (valueIsError(UUserCard)) {
        return UUserCard;
      }
      if (!window.luckysheet_function.ISIDCARD.f(UUserCard)) {
        return formula.error.v;
      }
      var dataNum = cityData.length,
        native = "未知";
      for (var i = 0; i < dataNum; i++) {
        if (UUserCard.substring(0, 6) == cityData[i].code) {
          native = cityData[i].title;
          break;
        }
      }
      return native;
    } catch (e) {
      var err = e;
      //计算错误检测
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "STAR_BY_IDCARD": function () {
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
      //身份证号
      var UUserCard = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(UUserCard)) {
        return UUserCard;
      }
      if (!window.luckysheet_function.ISIDCARD.f(UUserCard)) {
        return formula.error.v;
      }
      var birthday = window.luckysheet_function.BIRTHDAY_BY_IDCARD.f(UUserCard);
      if (valueIsError(birthday)) {
        return birthday;
      }
      birthday = new Date(birthday);
      var month = birthday.getMonth(),
        day = birthday.getDate();
      var d = new Date(1999, month, day, 0, 0, 0);
      var arr = [];
      arr.push(["魔羯座", new Date(1999, 0, 1, 0, 0, 0)]);
      arr.push(["水瓶座", new Date(1999, 0, 20, 0, 0, 0)]);
      arr.push(["双鱼座", new Date(1999, 1, 19, 0, 0, 0)]);
      arr.push(["白羊座", new Date(1999, 2, 21, 0, 0, 0)]);
      arr.push(["金牛座", new Date(1999, 3, 21, 0, 0, 0)]);
      arr.push(["双子座", new Date(1999, 4, 21, 0, 0, 0)]);
      arr.push(["巨蟹座", new Date(1999, 5, 22, 0, 0, 0)]);
      arr.push(["狮子座", new Date(1999, 6, 23, 0, 0, 0)]);
      arr.push(["处女座", new Date(1999, 7, 23, 0, 0, 0)]);
      arr.push(["天秤座", new Date(1999, 8, 23, 0, 0, 0)]);
      arr.push(["天蝎座", new Date(1999, 9, 23, 0, 0, 0)]);
      arr.push(["射手座", new Date(1999, 10, 22, 0, 0, 0)]);
      arr.push(["魔羯座", new Date(1999, 11, 22, 0, 0, 0)]);
      //console.log(birthday, arr, i);
      for (var i = arr.length - 1; i >= 0; i--) {
        if (d >= arr[i][1]) {
          return arr[i][0];
        }
      }
      return "未找到匹配星座信息";
    } catch (e) {
      var err = e;
      //计算错误检测
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ANIMAL_BY_IDCARD": function () {
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
      //身份证号
      var UUserCard = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(UUserCard)) {
        return UUserCard;
      }
      if (!window.luckysheet_function.ISIDCARD.f(UUserCard)) {
        return formula.error.v;
      }
      var birthday = window.luckysheet_function.BIRTHDAY_BY_IDCARD.f(UUserCard);
      if (valueIsError(birthday)) {
        return birthday;
      }
      birthday = new Date(birthday);
      var list = ["猪", "鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗"];
      var index = (parseInt(birthday.getFullYear()) + 9) % 12;
      if (index != null && !isNaN(index)) {
        return list[index];
      } else {
        return "未找到匹配生肖信息";
      }
    } catch (e) {
      var err = e;
      //计算错误检测
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ISIDCARD": function () {
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
      var idcard = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(idcard)) {
        return idcard;
      }
      var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
      if (reg.test(idcard)) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      var err = e;
      //计算错误检测
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "DATA_CN_STOCK_CLOSE": function () {
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

      //股票代码
      var stockcode = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(stockcode)) {
        return stockcode;
      }

      //日期
      var date = null;
      if (arguments[1] != null) {
        var data_date = arguments[1];
        if (getObjType(data_date) == "array") {
          return formula.error.v;
        } else if (getObjType(data_date) == "object" && data_date.startCell != null) {
          if (data_date.data != null && getObjType(data_date.data) != "array" && data_date.data.ct != null && data_date.data.ct.t == "d") {
            date = update("yyyy-mm-dd", data_date.data.v);
          } else {
            return formula.error.v;
          }
        } else {
          date = data_date;
        }
        if (!isdatetime(date)) {
          return [formula.error.v, "日期错误"];
        }
        date = dayjs(date).format("YYYY-MM-DD");
      }

      //复权除权
      var price = 0;
      if (arguments[2] != null) {
        price = func_methods.getFirstValue(arguments[2]);
        if (valueIsError(price)) {
          return price;
        }
      }
      if (!isRealNum(price)) {
        return formula.error.v;
      }
      price = parseInt(price);
      if (price != 0 && price != 1 && price != 2) {
        return formula.error.v;
      }
      $.post("/dataqk/tu/api/getstockinfo", {
        "stockCode": stockcode,
        "date": date,
        "price": price,
        type: "0"
      }, function (data) {
        var d = editor.deepCopyFlowData(Store.flowdata);
        var v = numFormat(data);
        if (v == null) {
          v = data;
        }
        formula.execFunctionGroup(cell_r, cell_c, v);
        d[cell_r][cell_c] = {
          "v": v,
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
  "DATA_CN_STOCK_OPEN": function () {
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

      //股票代码
      var stockcode = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(stockcode)) {
        return stockcode;
      }

      //日期
      var date = null;
      if (arguments[1] != null) {
        var data_date = arguments[1];
        if (getObjType(data_date) == "array") {
          return formula.error.v;
        } else if (getObjType(data_date) == "object" && data_date.startCell != null) {
          if (data_date.data != null && getObjType(data_date.data) != "array" && data_date.data.ct != null && data_date.data.ct.t == "d") {
            date = update("yyyy-mm-dd", data_date.data.v);
          } else {
            return formula.error.v;
          }
        } else {
          date = data_date;
        }
        if (!isdatetime(date)) {
          return [formula.error.v, "日期错误"];
        }
        date = dayjs(date).format("YYYY-MM-DD");
      }

      //复权除权
      var price = 0;
      if (arguments[2] != null) {
        price = func_methods.getFirstValue(arguments[2]);
        if (valueIsError(price)) {
          return price;
        }
      }
      if (!isRealNum(price)) {
        return formula.error.v;
      }
      price = parseInt(price);
      if (price != 0 && price != 1 && price != 2) {
        return formula.error.v;
      }
      $.post("/dataqk/tu/api/getstockinfo", {
        "stockCode": stockcode,
        "date": date,
        "price": price,
        type: "1"
      }, function (data) {
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
  "DATA_CN_STOCK_MAX": function () {
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

      //股票代码
      var stockcode = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(stockcode)) {
        return stockcode;
      }

      //日期
      var date = null;
      if (arguments[1] != null) {
        var data_date = arguments[1];
        if (getObjType(data_date) == "array") {
          return formula.error.v;
        } else if (getObjType(data_date) == "object" && data_date.startCell != null) {
          if (data_date.data != null && getObjType(data_date.data) != "array" && data_date.data.ct != null && data_date.data.ct.t == "d") {
            date = update("yyyy-mm-dd", data_date.data.v);
          } else {
            return formula.error.v;
          }
        } else {
          date = data_date;
        }
        if (!isdatetime(date)) {
          return [formula.error.v, "日期错误"];
        }
        date = dayjs(date).format("YYYY-MM-DD");
      }

      //复权除权
      var price = 0;
      if (arguments[2] != null) {
        price = func_methods.getFirstValue(arguments[2]);
        if (valueIsError(price)) {
          return price;
        }
      }
      if (!isRealNum(price)) {
        return formula.error.v;
      }
      price = parseInt(price);
      if (price != 0 && price != 1 && price != 2) {
        return formula.error.v;
      }
      $.post("/dataqk/tu/api/getstockinfo", {
        "stockCode": stockcode,
        "date": date,
        "price": price,
        type: "2"
      }, function (data) {
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
  "DATA_CN_STOCK_MIN": function () {
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

      //股票代码
      var stockcode = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(stockcode)) {
        return stockcode;
      }

      //日期
      var date = null;
      if (arguments[1] != null) {
        var data_date = arguments[1];
        if (getObjType(data_date) == "array") {
          return formula.error.v;
        } else if (getObjType(data_date) == "object" && data_date.startCell != null) {
          if (data_date.data != null && getObjType(data_date.data) != "array" && data_date.data.ct != null && data_date.data.ct.t == "d") {
            date = update("yyyy-mm-dd", data_date.data.v);
          } else {
            return formula.error.v;
          }
        } else {
          date = data_date;
        }
        if (!isdatetime(date)) {
          return [formula.error.v, "日期错误"];
        }
        date = dayjs(date).format("YYYY-MM-DD");
      }

      //复权除权
      var price = 0;
      if (arguments[2] != null) {
        price = func_methods.getFirstValue(arguments[2]);
        if (valueIsError(price)) {
          return price;
        }
      }
      if (!isRealNum(price)) {
        return formula.error.v;
      }
      price = parseInt(price);
      if (price != 0 && price != 1 && price != 2) {
        return formula.error.v;
      }
      $.post("/dataqk/tu/api/getstockinfo", {
        "stockCode": stockcode,
        "date": date,
        "price": price,
        type: "3"
      }, function (data) {
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
  "DATA_CN_STOCK_VOLUMN": function () {
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

      //股票代码
      var stockcode = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(stockcode)) {
        return stockcode;
      }

      //日期
      var date = null;
      if (arguments[1] != null) {
        var data_date = arguments[1];
        if (getObjType(data_date) == "array") {
          return formula.error.v;
        } else if (getObjType(data_date) == "object" && data_date.startCell != null) {
          if (data_date.data != null && getObjType(data_date.data) != "array" && data_date.data.ct != null && data_date.data.ct.t == "d") {
            date = update("yyyy-mm-dd", data_date.data.v);
          } else {
            return formula.error.v;
          }
        } else {
          date = data_date;
        }
        if (!isdatetime(date)) {
          return [formula.error.v, "日期错误"];
        }
        date = dayjs(date).format("YYYY-MM-DD");
      }

      //复权除权
      var price = 0;
      if (arguments[2] != null) {
        price = func_methods.getFirstValue(arguments[2]);
        if (valueIsError(price)) {
          return price;
        }
      }
      if (!isRealNum(price)) {
        return formula.error.v;
      }
      price = parseInt(price);
      if (price != 0 && price != 1 && price != 2) {
        return formula.error.v;
      }
      $.post("/dataqk/tu/api/getstockinfo", {
        "stockCode": stockcode,
        "date": date,
        "price": price,
        type: "4"
      }, function (data) {
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
  "DATA_CN_STOCK_AMOUNT": function () {
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

      //股票代码
      var stockcode = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(stockcode)) {
        return stockcode;
      }

      //日期
      var date = null;
      if (arguments[1] != null) {
        var data_date = arguments[1];
        if (getObjType(data_date) == "array") {
          return formula.error.v;
        } else if (getObjType(data_date) == "object" && data_date.startCell != null) {
          if (data_date.data != null && getObjType(data_date.data) != "array" && data_date.data.ct != null && data_date.data.ct.t == "d") {
            date = update("yyyy-mm-dd", data_date.data.v);
          } else {
            return formula.error.v;
          }
        } else {
          date = data_date;
        }
        if (!isdatetime(date)) {
          return [formula.error.v, "日期错误"];
        }
        date = dayjs(date).format("YYYY-MM-DD");
      }

      //复权除权
      var price = 0;
      if (arguments[2] != null) {
        price = func_methods.getFirstValue(arguments[2]);
        if (valueIsError(price)) {
          return price;
        }
      }
      if (!isRealNum(price)) {
        return formula.error.v;
      }
      price = parseInt(price);
      if (price != 0 && price != 1 && price != 2) {
        return formula.error.v;
      }
      $.post("/dataqk/tu/api/getstockinfo", {
        "stockCode": stockcode,
        "date": date,
        "price": price,
        type: "5"
      }, function (data) {
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
export default localeCnFunctions;