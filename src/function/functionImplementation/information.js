import {  getSheetIndex,  getluckysheetfile } from "../../methods/get";
import formula from "../../global/formula";
import func_methods from "../../global/func_methods";
import {  isRealNum,  isRealNull,  valueIsError } from "../../global/validate";
import { genarate, update } from "../../global/format";
import {  getObjType } from "../../utils/util";
import Store from "../../store";
import dayjs from 'dayjs';
import numeral from 'numeral';

//公式函数计算
const informationFunctions = {
  "ISFORMULA": function () {
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
      var data_cell = arguments[0];
      var cell;
      if (getObjType(data_cell) == "object" && data_cell.startCell != null) {
        if (data_cell.data == null) {
          return false;
        }
        if (getObjType(data_cell.data) == "array") {
          cell = data_cell.data[0][0];
        } else {
          cell = data_cell.data;
        }
        if (cell != null && cell.f != null) {
          return true;
        } else {
          return false;
        }
      } else {
        return formula.error.v;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "CELL": function () {
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
      //单元格信息的类型
      var data_info_type = arguments[0];
      var info_type;
      if (getObjType(data_info_type) == "array") {
        if (getObjType(data_info_type[0]) == "array") {
          if (!func_methods.isDyadicArr(data_info_type)) {
            return formula.error.v;
          }
          info_type = data_info_type[0][0];
        } else {
          info_type = data_info_type[0];
        }
      } else if (getObjType(data_info_type) == "object" && data_info_type.startCell != null) {
        if (data_info_type.data == null) {
          return formula.error.v;
        } else {
          if (getObjType(data_info_type.data) == "array") {
            return formula.error.v;
          }
          info_type = data_info_type.data.v;
          if (isRealNull(info_type)) {
            return formula.error.v;
          }
        }
      } else {
        info_type = data_info_type;
      }

      //单元格
      var data_reference = arguments[1];
      var reference;
      if (getObjType(data_reference) == "object" && data_reference.startCell != null) {
        reference = data_reference.startCell;
      } else {
        return formula.error.v;
      }
      if (["address", "col", "color", "contents", "filename", "format", "parentheses", "prefix", "protect", "row", "type", "width"].indexOf(info_type) == -1) {
        return formula.error.v;
      }
      var file = getluckysheetfile()[getSheetIndex(Store.currentSheetIndex)];
      var cellrange = formula.getcellrange(reference);
      var row_index = cellrange.row[0];
      var col_index = cellrange.column[0];

      // let sheetdata = null;
      // sheetdata = Store.sheetData;
      // if (formula.execFunctionGroupData != null) {
      //     sheetdata = formula.execFunctionGroupData;
      // }

      let luckysheetfile = getluckysheetfile();
      let index = getSheetIndex(Store.calculateSheetIndex);
      let sheetdata = luckysheetfile[index].data;
      let value;
      if (formula.execFunctionGlobalData != null && formula.execFunctionGlobalData[row_index + "_" + col_index + "_" + Store.calculateSheetIndex] != null) {
        value = formula.execFunctionGlobalData[row_index + "_" + col_index + "_" + Store.calculateSheetIndex].v;
      } else if (sheetdata[row_index][col_index] != null && sheetdata[row_index][col_index].v != null && sheetdata[row_index][col_index].v != "") {
        value = sheetdata[row_index][col_index];
        if (value instanceof Object) {
          value = value.v;
        }
      } else {
        value = 0;
      }
      switch (info_type) {
        case "address":
          return reference;
          break;
        case "col":
          return col_index + 1;
          break;
        case "color":
          return 0;
          break;
        case "contents":
          // if (sheetdata[row_index][col_index] == null || sheetdata[row_index][col_index].v == null || sheetdata[row_index][col_index].v ==""){
          //     value = 0;
          // }

          return value;
          break;
        case "filename":
          return file.name;
          break;
        case "format":
          if (sheetdata[row_index][col_index] == null || sheetdata[row_index][col_index].ct == null) {
            return "G";
          }
          return sheetdata[row_index][col_index].ct.fa;
          break;
        case "parentheses":
          if (sheetdata[row_index][col_index] == null || sheetdata[row_index][col_index].v == null || sheetdata[row_index][col_index].v == "") {
            return 0;
          }
          if (sheetdata[row_index][col_index].v > 0) {
            return 1;
          } else {
            return 0;
          }
          break;
        case "prefix":
          if (value == 0) {
            return "";
          }
          if (sheetdata[row_index][col_index].ht == 0) {
            //居中对齐
            return "^";
          } else if (sheetdata[row_index][col_index].ht == 1) {
            //左对齐
            return "'";
          } else if (sheetdata[row_index][col_index].ht == 2) {
            //右对齐
            return '"';
          } else {
            return "";
          }
          break;
        case "protect":
          return 0;
          break;
        case "row":
          return row_index + 1;
          break;
        case "type":
          if (value == 0) {
            return "b";
          }
          return "l";
          break;
        case "width":
          var cfg = file.config;
          if (cfg["columnlen"] != null && col_index in cfg["columnlen"]) {
            return cfg["columnlen"][col_index];
          }
          return Store.defaultcollen;
          break;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "NA": function () {
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
      return formula.error.na;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ERROR_TYPE": function () {
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
      //单元格
      var data_error_val = arguments[0];
      var error_val;
      if (getObjType(data_error_val) == "array") {
        if (getObjType(data_error_val[0]) == "array") {
          if (!func_methods.isDyadicArr(data_error_val)) {
            return formula.error.v;
          }
          error_val = data_error_val[0][0];
        } else {
          error_val = data_error_val[0];
        }
      } else if (getObjType(data_error_val) == "object" && data_error_val.startCell != null) {
        if (data_error_val.data == null) {
          return formula.error.na;
        }
        if (getObjType(data_error_val.data) == "array") {
          error_val = data_error_val.data[0][0];
          if (error_val == null || isRealNull(error_val.v)) {
            return formula.error.na;
          }
          error_val = error_val.v;
        } else {
          if (isRealNull(data_error_val.data.v)) {
            return formula.error.na;
          }
          error_val = data_error_val.data.v;
        }
      } else {
        error_val = data_error_val;
      }
      var error_obj = {
        "#NULL!": 1,
        "#DIV/0!": 2,
        "#VALUE!": 3,
        "#REF!": 4,
        "#NAME?": 5,
        "#NUM!": 6,
        "#N/A": 7,
        "#GETTING_DATA": 8
      };
      if (error_val in error_obj) {
        return error_obj[error_val];
      } else {
        return formula.error.na;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ISBLANK": function () {
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
      //单元格
      var data_error_val = arguments[0];
      var error_val;
      if (getObjType(data_error_val) == "object" && data_error_val.startCell != null) {
        if (data_error_val.data == null) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ISERR": function () {
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
      //单元格
      var data_value = arguments[0];
      var value;
      if (getObjType(data_value) == "array") {
        if (getObjType(data_value[0]) == "array") {
          if (!func_methods.isDyadicArr(data_value)) {
            return formula.error.v;
          }
          value = data_value[0][0];
        } else {
          value = data_value[0];
        }
      } else if (getObjType(data_value) == "object" && data_value.startCell != null) {
        if (getObjType(data_value.data) == "array") {
          return true;
        }
        if (data_value.data == null || isRealNull(data_value.data.v)) {
          return false;
        }
        value = data_value.data.v;
      } else {
        value = data_value;
      }
      if (["#VALUE!", "#REF!", "#DIV/0!", "#NUM!", "#NAME?", "#NULL!"].indexOf(value) > -1) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ISERROR": function () {
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
      //单元格
      var data_value = arguments[0];
      var value;
      if (getObjType(data_value) == "array") {
        if (getObjType(data_value[0]) == "array") {
          if (!func_methods.isDyadicArr(data_value)) {
            return formula.error.v;
          }
          value = data_value[0][0];
        } else {
          value = data_value[0];
        }
      } else if (getObjType(data_value) == "object" && data_value.startCell != null) {
        if (getObjType(data_value.data) == "array") {
          return true;
        }
        if (data_value.data == null || isRealNull(data_value.data.v)) {
          return false;
        }
        value = data_value.data.v;
      } else {
        value = data_value;
      }
      if (["#N/A", "#VALUE!", "#REF!", "#DIV/0!", "#NUM!", "#NAME?", "#NULL!"].indexOf(value) > -1) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ISLOGICAL": function () {
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
      //单元格
      var data_value = arguments[0];
      var value;
      if (getObjType(data_value) == "array") {
        if (getObjType(data_value[0]) == "array") {
          if (!func_methods.isDyadicArr(data_value)) {
            return formula.error.v;
          }
          value = data_value[0][0];
        } else {
          value = data_value[0];
        }
      } else if (getObjType(data_value) == "object" && data_value.startCell != null) {
        if (getObjType(data_value.data) == "array") {
          return false;
        }
        if (data_value.data == null || isRealNull(data_value.data.v)) {
          return false;
        }
        value = data_value.data.v;
      } else {
        value = data_value;
      }
      if (value.toString().toLowerCase() == "true" || value.toString().toLowerCase() == "false") {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ISNA": function () {
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
      //单元格
      var data_value = arguments[0];
      var value;
      if (getObjType(data_value) == "array") {
        if (getObjType(data_value[0]) == "array") {
          if (!func_methods.isDyadicArr(data_value)) {
            return formula.error.v;
          }
          value = data_value[0][0];
        } else {
          value = data_value[0];
        }
      } else if (getObjType(data_value) == "object" && data_value.startCell != null) {
        if (getObjType(data_value.data) == "array") {
          return false;
        }
        if (data_value.data == null || isRealNull(data_value.data.v)) {
          return false;
        }
        value = data_value.data.v;
      } else {
        value = data_value;
      }
      if (value.toString() == "#N/A") {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ISNONTEXT": function () {
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
      //单元格
      var data_value = arguments[0];
      var value;
      if (getObjType(data_value) == "array") {
        if (getObjType(data_value[0]) == "array") {
          if (!func_methods.isDyadicArr(data_value)) {
            return formula.error.v;
          }
          value = data_value[0][0];
        } else {
          value = data_value[0];
        }
      } else if (getObjType(data_value) == "object" && data_value.startCell != null) {
        if (getObjType(data_value.data) == "array") {
          return true;
        }
        if (data_value.data == null || isRealNull(data_value.data.v)) {
          return true;
        }
        value = data_value.data.v;
      } else {
        value = data_value;
      }
      if (["#N/A", "#VALUE!", "#REF!", "#DIV/0!", "#NUM!", "#NAME?", "#NULL!"].indexOf(value) > -1) {
        return true;
      } else if (value.toString().toLowerCase() == "true" || value.toString().toLowerCase() == "false") {
        return true;
      } else if (isRealNum(value)) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ISNUMBER": function () {
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
      //单元格
      var data_value = arguments[0];
      var value;
      if (getObjType(data_value) == "array") {
        if (getObjType(data_value[0]) == "array") {
          if (!func_methods.isDyadicArr(data_value)) {
            return formula.error.v;
          }
          value = data_value[0][0];
        } else {
          value = data_value[0];
        }
      } else if (getObjType(data_value) == "object" && data_value.startCell != null) {
        if (getObjType(data_value.data) == "array") {
          return false;
        }
        if (data_value.data == null || isRealNull(data_value.data.v)) {
          return false;
        }
        value = data_value.data.v;
      } else {
        value = data_value;
      }
      if (isRealNum(value)) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ISREF": function () {
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
      if (getObjType(arguments[0]) == "object" && arguments[0].startCell != null) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "ISTEXT": function () {
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
      //单元格
      var data_value = arguments[0];
      var value;
      if (getObjType(data_value) == "array") {
        if (getObjType(data_value[0]) == "array") {
          if (!func_methods.isDyadicArr(data_value)) {
            return formula.error.v;
          }
          value = data_value[0][0];
        } else {
          value = data_value[0];
        }
      } else if (getObjType(data_value) == "object" && data_value.startCell != null) {
        if (getObjType(data_value.data) == "array") {
          return false;
        }
        if (data_value.data == null || isRealNull(data_value.data.v)) {
          return false;
        }
        value = data_value.data.v;
      } else {
        value = data_value;
      }
      if (["#N/A", "#VALUE!", "#REF!", "#DIV/0!", "#NUM!", "#NAME?", "#NULL!"].indexOf(value) > -1) {
        return false;
      } else if (value.toString().toLowerCase() == "true" || value.toString().toLowerCase() == "false") {
        return false;
      } else if (isRealNum(value)) {
        return false;
      } else {
        return true;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "TYPE": function () {
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
      //单元格
      var data_value = arguments[0];
      var value;
      if (getObjType(data_value) == "array") {
        return 64;
      } else if (getObjType(data_value) == "object" && data_value.startCell != null) {
        if (getObjType(data_value.data) == "array") {
          return 16;
        }
        if (data_value.data == null || isRealNull(data_value.data.v)) {
          return 1;
        }
        value = data_value.data.v;
      } else {
        value = data_value;
      }
      if (["#N/A", "#VALUE!", "#REF!", "#DIV/0!", "#NUM!", "#NAME?", "#NULL!"].indexOf(value) > -1) {
        return 16;
      } else if (value.toString().toLowerCase() == "true" || value.toString().toLowerCase() == "false") {
        return 4;
      } else if (isRealNum(value)) {
        return 1;
      } else {
        return 2;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "N": function () {
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
      //单元格
      var data_value = arguments[0];
      var value;
      if (getObjType(data_value) == "array") {
        if (getObjType(data_value[0]) == "array") {
          if (!func_methods.isDyadicArr(data_value)) {
            return formula.error.v;
          }
          value = data_value[0][0];
        } else {
          value = data_value[0];
        }
      } else if (getObjType(data_value) == "object" && data_value.startCell != null) {
        if (getObjType(data_value.data) == "array") {
          value = data_value.data[0][0];
          if (value == null || isRealNull(value.v)) {
            return 0;
          }
          value = value.v;
        } else {
          if (data_value.data == null || isRealNull(data_value.data.v)) {
            return 0;
          }
          value = data_value.data.v;
        }
      } else {
        value = data_value;
      }
      if (["#N/A", "#VALUE!", "#REF!", "#DIV/0!", "#NUM!", "#NAME?", "#NULL!"].indexOf(value) > -1) {
        return value;
      } else if (value.toString().toLowerCase() == "true" || value.toString().toLowerCase() == "false") {
        if (value.toString().toLowerCase() == "true") {
          return 1;
        } else {
          return 0;
        }
      } else if (isRealNum(value)) {
        return parseFloat(value);
      } else {
        return 0;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "TO_DATE": function () {
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
      return update("yyyy-mm-dd", value);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "TO_PURE_NUMBER": function () {
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
      var value = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(value)) {
        return value;
      }
      if (dayjs(value).isValid()) {
        return genarate(value)[2];
      } else {
        return numeral(value).value() == null ? value : numeral(value).value();
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "TO_TEXT": function () {
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
      var value = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(value)) {
        return value;
      }
      return update("@", value);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "TO_DOLLARS": function () {
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
      return update("$ 0.00", value);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "TO_PERCENT": function () {
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
      return update("0%", value);
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  }
};
export default informationFunctions;