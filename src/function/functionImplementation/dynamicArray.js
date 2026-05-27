import luckysheetConfigsetting from "../../controllers/luckysheetConfigsetting";
import { luckysheet_getcelldata, luckysheet_parseData, luckysheet_getValue, luckysheet_calcADPMM } from "../func";
import { inverse } from "../matrix_methods";
import { getSheetIndex, getluckysheetfile, getRangetxt } from "../../methods/get";
import menuButton from "../../controllers/menuButton";
import formula from "../../global/formula";
import func_methods from "../../global/func_methods";
import editor from "../../global/editor";
import { isdatetime, diff, isdatatype } from "../../global/datecontroll";
import { isRealNum, isRealNull, valueIsError, error } from "../../global/validate";
import { jfrefreshgrid, jfrefreshgridall } from "../../global/refresh";
import { genarate, update } from "../../global/format";
import { orderbydata } from "../../global/sort";
import { getcellvalue, datagridgrowth } from "../../global/getdata";
import { getObjType, ABCatNum, chatatABC, numFormat } from "../../utils/util";
import Store from "../../store";
import dayjs from 'dayjs';
import numeral from 'numeral';
import { getAirTable, companyTargetData, companyTargetData10, companyTargetData11, companyTargetData12, excelToLuckyArray, excelToArray, askAIData } from "../../demoData/getTargetData";
import { setcellvalue } from "../../global/setdata";
import jStat from 'jstat';

//公式函数计算
const dynamicArrayFunctions = {
  "SORT": function () {
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
      //要排序的范围或数组
      var data_array = arguments[0];
      var array = [],
        rowlen = 1,
        collen = 1;
      if (getObjType(data_array) == "array") {
        if (getObjType(data_array[0]) == "array") {
          if (!func_methods.isDyadicArr(data_array)) {
            return formula.error.v;
          }
          for (var i = 0; i < data_array.length; i++) {
            var rowArr = [];
            for (var j = 0; j < data_array[i].length; j++) {
              var number = data_array[i][j];
              rowArr.push(number);
            }
            array.push(rowArr);
          }
          rowlen = array.length;
          collen = array[0].length;
        } else {
          for (var i = 0; i < data_array.length; i++) {
            var number = data_array[i];
            array.push(number);
          }
          rowlen = array.length;
        }
      } else if (getObjType(data_array) == "object" && data_array.startCell != null) {
        if (data_array.data != null) {
          if (getObjType(data_array.data) == "array") {
            for (var i = 0; i < data_array.data.length; i++) {
              var rowArr = [];
              for (var j = 0; j < data_array.data[i].length; j++) {
                if (data_array.data[i][j] != null) {
                  var number = data_array.data[i][j].v;
                  if (isRealNull(number)) {
                    number = 0;
                  }
                  rowArr.push(number);
                } else {
                  rowArr.push(0);
                }
              }
              array.push(rowArr);
            }
            rowlen = array.length;
            collen = array[0].length;
          } else {
            var number = data_array.data.v;
            if (isRealNull(number)) {
              number = 0;
            }
            array.push(number);
          }
        } else {
          array.push(0);
        }
      } else {
        var number = data_array;
        array.push(number);
      }

      //表示要排序的行或列的数字（默认row1/col1）
      var sort_index = 1;
      if (arguments.length >= 2) {
        sort_index = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(sort_index)) {
          return sort_index;
        }
        if (!isRealNum(sort_index)) {
          return formula.error.v;
        }
        sort_index = parseInt(sort_index);
      }

      //表示所需排序顺序的数字；1表示升序（默认），-1表示降序。
      var sort_order = 1;
      if (arguments.length >= 3) {
        sort_order = func_methods.getFirstValue(arguments[2]);
        if (valueIsError(sort_order)) {
          return sort_order;
        }
        if (!isRealNum(sort_order)) {
          return formula.error.v;
        }
        sort_order = Math.floor(parseFloat(sort_order));
      }

      //表示所需排序方向的逻辑值；按行排序为FALSE（默认），按列排序为TRUE。
      var by_col = false;
      if (arguments.length == 4) {
        by_col = func_methods.getCellBoolen(arguments[3]);
        if (valueIsError(by_col)) {
          return by_col;
        }
      }
      if (by_col) {
        if (sort_index < 1 || sort_index > rowlen) {
          return formula.error.v;
        }
      } else {
        if (sort_index < 1 || sort_index > collen) {
          return formula.error.v;
        }
      }
      if (sort_order != 1 && sort_order != -1) {
        return formula.error.v;
      }

      //计算
      var asc = function (x, y) {
        if (getObjType(x) == "array") {
          x = x[sort_index - 1];
        }
        if (getObjType(y) == "array") {
          y = y[sort_index - 1];
        }
        if (!isNaN(x) && !isNaN(y)) {
          return x - y;
        } else if (!isNaN(x)) {
          return -1;
        } else if (!isNaN(y)) {
          return 1;
        } else {
          if (x > y) {
            return 1;
          } else if (x < y) {
            return -1;
          }
        }
      };
      var desc = function (x, y) {
        if (getObjType(x) == "array") {
          x = x[sort_index - 1];
        }
        if (getObjType(y) == "array") {
          y = y[sort_index - 1];
        }
        if (!isNaN(x) && !isNaN(y)) {
          return y - x;
        } else if (!isNaN(x)) {
          return 1;
        } else if (!isNaN(y)) {
          return -1;
        } else {
          if (x > y) {
            return -1;
          } else if (x < y) {
            return 1;
          }
        }
      };
      if (by_col) {
        array = array[0].map(function (col, a) {
          return array.map(function (row) {
            return row[a];
          });
        });
        if (sort_order == 1) {
          array.sort(asc);
        }
        if (sort_order == -1) {
          array.sort(desc);
        }
        array = array[0].map(function (col, b) {
          return array.map(function (row) {
            return row[b];
          });
        });
      } else {
        if (sort_order == 1) {
          array.sort(asc);
        }
        if (sort_order == -1) {
          array.sort(desc);
        }
      }
      return array;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "FILTER": function () {
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
      //要筛选的数组或范围
      var data_array = arguments[0];
      var array = [];
      if (getObjType(data_array) == "array") {
        if (getObjType(data_array[0]) == "array" && !func_methods.isDyadicArr(data_array)) {
          return formula.error.v;
        }
        array = func_methods.getDataDyadicArr(data_array);
      } else if (getObjType(data_array) == "object" && data_array.startCell != null) {
        array = func_methods.getCellDataDyadicArr(data_array, "number");
      } else {
        var rowArr = [];
        rowArr.push(parseFloat(data_array));
        array.push(rowArr);
      }
      var rowlen = array.length,
        collen = array[0].length;

      //布尔数组，其高度或宽度与数组相同
      var data_include = arguments[1];
      var include = [];
      var type = "row"; //筛选方式 row - 行，col - 列

      if (getObjType(data_include) == "array") {
        if (getObjType(data_include[0]) == "array") {
          if (!func_methods.isDyadicArr(data_include)) {
            return formula.error.v;
          }
          if (data_include.length > 1 && data_include[0].length > 1) {
            return formula.error.v;
          }
          if (data_include.length > 1) {
            if (data_include.length != array.length) {
              return formula.error.v;
            }
            type = "row";
            for (var i = 0; i < data_include.length; i++) {
              var txt = data_include[i][0];
              if (getObjType(txt) == "boolean") {} else if (getObjType(txt) == "string" && (txt.toLowerCase() == "true" || txt.toLowerCase() == "false")) {
                if (txt.toLowerCase() == "true") {
                  txt = true;
                } else if (txt.toLowerCase() == "false") {
                  txt = false;
                }
              } else if (isRealNum(txt)) {
                txt = parseFloat(txt);
                txt = txt == 0 ? false : true;
              } else {
                return formula.error.v;
              }
              include.push(txt);
            }
          }
          if (data_include[0].length > 1) {
            if (data_include[0].length != array[0].length) {
              return formula.error.v;
            }
            type = "col";
            for (var i = 0; i < data_include[0].length; i++) {
              var txt = data_include[0][i];
              if (getObjType(txt) == "boolean") {} else if (getObjType(txt) == "string" && (txt.toLowerCase() == "true" || txt.toLowerCase() == "false")) {
                if (txt.toLowerCase() == "true") {
                  txt = true;
                } else if (txt.toLowerCase() == "false") {
                  txt = false;
                }
              } else if (isRealNum(txt)) {
                txt = parseFloat(txt);
                txt = txt == 0 ? false : true;
              } else {
                return formula.error.v;
              }
              include.push(txt);
            }
          }
        } else {
          if (data_include.length != array[0].length) {
            return formula.error.v;
          }
          type = "col";
          for (var i = 0; i < data_include.length; i++) {
            var txt = data_include[i];
            if (getObjType(txt) == "boolean") {} else if (getObjType(txt) == "string" && (txt.toLowerCase() == "true" || txt.toLowerCase() == "false")) {
              if (txt.toLowerCase() == "true") {
                txt = true;
              } else if (txt.toLowerCase() == "false") {
                txt = false;
              }
            } else if (isRealNum(txt)) {
              txt = parseFloat(txt);
              txt = txt == 0 ? false : true;
            } else {
              return formula.error.v;
            }
            include.push(txt);
          }
        }
      } else if (getObjType(data_include) == "object" && data_include.data != null && getObjType(data_include.data) == "array") {
        if (data_include.data.length > 1 && data_include.data[0].length > 1) {
          return formula.error.v;
        }
        if (data_include.data.length > 1) {
          if (data_include.data.length != array.length) {
            return formula.error.v;
          }
          type = "row";
          for (var i = 0; i < data_include.data.length; i++) {
            var txt = data_include.data[i][0].v;
            if (isRealNull(txt)) {
              txt = 0;
            }
            if (getObjType(txt) == "boolean") {} else if (getObjType(txt) == "string" && (txt.toLowerCase() == "true" || txt.toLowerCase() == "false")) {
              if (txt.toLowerCase() == "true") {
                txt = true;
              } else if (txt.toLowerCase() == "false") {
                txt = false;
              }
            } else if (isRealNum(txt)) {
              txt = parseFloat(txt);
              txt = txt == 0 ? false : true;
            } else {
              return formula.error.v;
            }
            include.push(txt);
          }
        }
        if (data_include.data[0].length > 1) {
          if (data_include.data[0].length != array[0].length) {
            return formula.error.v;
          }
          type = "col";
          for (var i = 0; i < data_include.data[0].length; i++) {
            var txt = data_include.data[0][i].v;
            if (isRealNull(txt)) {
              txt = 0;
            }
            if (getObjType(txt) == "boolean") {} else if (getObjType(txt) == "string" && (txt.toLowerCase() == "true" || txt.toLowerCase() == "false")) {
              if (txt.toLowerCase() == "true") {
                txt = true;
              } else if (txt.toLowerCase() == "false") {
                txt = false;
              }
            } else if (isRealNum(txt)) {
              txt = parseFloat(txt);
              txt = txt == 0 ? false : true;
            } else {
              return formula.error.v;
            }
            include.push(txt);
          }
        }
      } else {
        return formula.error.v;
      }

      //如果包含数组中的所有值都为空(filter不返回任何值)，则返回的值
      var if_empty = "";
      if (arguments.length == 3) {
        if_empty = func_methods.getFirstValue(arguments[2], "text");
        if (valueIsError(if_empty)) {
          return if_empty;
        }
      }

      //计算
      var result = [];
      if (type == "row") {
        for (var i = 0; i < array.length; i++) {
          if (include[i]) {
            result.push(array[i]);
          }
        }
      } else {
        for (var i = 0; i < array.length; i++) {
          var rowArr = [];
          for (var j = 0; j < array[0].length; j++) {
            if (include[j]) {
              rowArr.push(array[i][j]);
            }
          }
          if (rowArr.length > 0) {
            result.push(rowArr);
          }
        }
      }
      if (result.length == 0) {
        return if_empty;
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "UNIQUE": function () {
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
      //从其返回唯一值的数组或区域
      var data_array = arguments[0];
      var array = [];
      if (getObjType(data_array) == "array") {
        if (getObjType(data_array[0]) == "array" && !func_methods.isDyadicArr(data_array)) {
          return formula.error.v;
        }
        array = func_methods.getDataDyadicArr(data_array);
      } else if (getObjType(data_array) == "object" && data_array.startCell != null) {
        array = func_methods.getCellDataDyadicArr(data_array, "number");
      } else {
        var rowArr = [];
        rowArr.push(parseFloat(data_array));
        array.push(rowArr);
      }

      //逻辑值，指示如何比较；按行 = FALSE 或省略；按列 = TRUE
      var by_col = false;
      if (arguments.length >= 2) {
        by_col = func_methods.getCellBoolen(arguments[1]);
        if (valueIsError(by_col)) {
          return by_col;
        }
      }

      //逻辑值，仅返回唯一值中出现一次 = TRUE；包括所有唯一值 = FALSE 或省略
      var occurs_once = false;
      if (arguments.length == 3) {
        occurs_once = func_methods.getCellBoolen(arguments[2]);
        if (valueIsError(occurs_once)) {
          return occurs_once;
        }
      }

      //计算
      if (by_col) {
        array = array[0].map(function (col, a) {
          return array.map(function (row) {
            return row[a];
          });
        });
        var strObj = {},
          strArr = [];
        var allUnique = [];
        for (var i = 0; i < array.length; i++) {
          var str = '';
          for (var j = 0; j < array[i].length; j++) {
            str += array[i][j].toString() + "|||";
          }
          strArr.push(str);
          if (!(str in strObj)) {
            strObj[str] = 0;
            allUnique.push(array[i]);
          }
        }
        if (occurs_once) {
          var oneUnique = [];
          for (var i = 0; i < strArr.length; i++) {
            if (strArr.indexOf(strArr[i]) == strArr.lastIndexOf(strArr[i])) {
              oneUnique.push(array[i]);
            }
          }
          oneUnique = oneUnique[0].map(function (col, a) {
            return oneUnique.map(function (row) {
              return row[a];
            });
          });
          return oneUnique;
        } else {
          allUnique = allUnique[0].map(function (col, a) {
            return allUnique.map(function (row) {
              return row[a];
            });
          });
          return allUnique;
        }
      } else {
        var strObj = {},
          strArr = [];
        var allUnique = [];
        for (var i = 0; i < array.length; i++) {
          var str = '';
          for (var j = 0; j < array[i].length; j++) {
            str += array[i][j].toString() + "|||";
          }
          strArr.push(str);
          if (!(str in strObj)) {
            strObj[str] = 0;
            allUnique.push(array[i]);
          }
        }
        if (occurs_once) {
          var oneUnique = [];
          for (var i = 0; i < strArr.length; i++) {
            if (strArr.indexOf(strArr[i]) == strArr.lastIndexOf(strArr[i])) {
              oneUnique.push(array[i]);
            }
          }
          return oneUnique;
        } else {
          return allUnique;
        }
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "RANDARRAY": function () {
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
      //要返回的行数
      var rows = 1;
      if (arguments.length >= 1) {
        rows = func_methods.getFirstValue(arguments[0]);
        if (valueIsError(rows)) {
          return rows;
        }
        if (!isRealNum(rows)) {
          return formula.error.v;
        }
        rows = parseInt(rows);
      }

      //要返回的列数
      var cols = 1;
      if (arguments.length == 2) {
        cols = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(cols)) {
          return cols;
        }
        if (!isRealNum(cols)) {
          return formula.error.v;
        }
        cols = parseInt(cols);
      }
      if (rows <= 0 || cols <= 0) {
        return formula.error.v;
      }

      //计算
      var result = [];
      for (var i = 0; i < rows; i++) {
        var result_row = [];
        for (var j = 0; j < cols; j++) {
          result_row.push(Math.random().toFixed(9));
        }
        result.push(result_row);
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "SEQUENCE": function () {
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
      //要返回的行数
      var rows = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(rows)) {
        return rows;
      }
      if (!isRealNum(rows)) {
        return formula.error.v;
      }
      rows = parseInt(rows);

      //要返回的列数
      var cols = 1;
      if (arguments.length >= 2) {
        cols = func_methods.getFirstValue(arguments[1]);
        if (valueIsError(cols)) {
          return cols;
        }
        if (!isRealNum(cols)) {
          return formula.error.v;
        }
        cols = parseInt(cols);
      }

      //序列中的第一个数字
      var start = 1;
      if (arguments.length >= 3) {
        start = func_methods.getFirstValue(arguments[2]);
        if (valueIsError(start)) {
          return start;
        }
        if (!isRealNum(start)) {
          return formula.error.v;
        }
        start = parseFloat(start);
      }

      //序列中每个序列值的增量
      var step = 1;
      if (arguments.length == 4) {
        step = func_methods.getFirstValue(arguments[3]);
        if (valueIsError(step)) {
          return step;
        }
        if (!isRealNum(step)) {
          return formula.error.v;
        }
        step = parseFloat(step);
      }
      if (rows <= 0 || cols <= 0) {
        return formula.error.v;
      }

      //计算
      var result = [];
      for (var i = 0; i < rows; i++) {
        var result_row = [];
        for (var j = 0; j < cols; j++) {
          var number = start + step * (j + cols * i);
          result_row.push(number);
        }
        result.push(result_row);
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  }
};
export default dynamicArrayFunctions;