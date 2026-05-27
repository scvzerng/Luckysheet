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

const lookupSearch = {
  "OFFSET": function () {
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
      //用于计算行列偏移量的起点
      if (!(getObjType(arguments[0]) == "object" && arguments[0].startCell != null)) {
        return formula.error.v;
      }
      var reference = arguments[0].startCell;
      let sheetName = arguments[0].sheetName;

      //要偏移的行数
      var rows = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(rows)) {
        return rows;
      }
      if (!isRealNum(rows)) {
        return formula.error.v;
      }
      rows = parseInt(rows);

      //要偏移的列数
      var cols = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(cols)) {
        return cols;
      }
      if (!isRealNum(cols)) {
        return formula.error.v;
      }
      cols = parseInt(cols);

      //要从偏移目标开始返回的范围的高度
      var height = arguments[0].rowl;
      if (arguments.length >= 4) {
        height = func_methods.getFirstValue(arguments[3]);
        if (valueIsError(height)) {
          return height;
        }
        if (!isRealNum(height)) {
          return formula.error.v;
        }
        height = parseInt(height);
      }

      //要从偏移目标开始返回的范围的宽度
      var width = arguments[0].coll;
      if (arguments.length == 5) {
        width = func_methods.getFirstValue(arguments[4]);
        if (valueIsError(width)) {
          return width;
        }
        if (!isRealNum(width)) {
          return formula.error.v;
        }
        width = parseInt(width);
      }
      if (height < 1 || width < 1) {
        return formula.error.r;
      }

      //计算
      var cellrange = formula.getcellrange(reference);
      var cellRow0 = cellrange["row"][0];
      var cellCol0 = cellrange["column"][0];
      cellRow0 += rows;
      cellCol0 += cols;
      var cellRow1 = cellRow0 + height - 1;
      var cellCol1 = cellCol0 + width - 1;

      // let sheetdata = null;
      // sheetdata = Store.flowdata;
      // if (formula.execFunctionGroupData != null) {
      //     sheetdata = formula.execFunctionGroupData;
      // }

      let luckysheetfile = getluckysheetfile();
      let index = getSheetIndex(Store.calculateSheetIndex);
      let sheetdata = luckysheetfile[index].data;
      if (cellRow0 < 0 || cellRow1 >= sheetdata.length || cellCol0 < 0 || cellCol1 >= sheetdata[0].length) {
        return formula.error.r;
      }
      var result = [];
      for (var r = cellRow0; r <= cellRow1; r++) {
        var rowArr = [];
        for (var c = cellCol0; c <= cellCol1; c++) {
          if (formula.execFunctionGlobalData != null && formula.execFunctionGlobalData[r + "_" + c + "_" + Store.calculateSheetIndex] != null) {
            let ef = formula.execFunctionGlobalData[r + "_" + c + "_" + Store.calculateSheetIndex];
            if (ef != null) {
              rowArr.push(ef.v);
            } else {
              rowArr.push(0);
            }
          } else if (sheetdata[r][c] != null && !isRealNull(sheetdata[r][c].v)) {
            rowArr.push(sheetdata[r][c].v);
          } else {
            rowArr.push(0);
          }
        }
        result.push(rowArr);
      }
      let retAll = {
        "sheetName": sheetName,
        "startCell": getRangetxt(Store.calculateSheetIndex, {
          row: [cellRow0, cellRow1],
          column: [cellCol0, cellCol1]
        }),
        "rowl": cellRow0,
        "coll": cellCol0,
        "data": result
      };
      return retAll;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "MATCH": function () {
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
      //lookup_value
      var lookup_value = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(lookup_value)) {
        return lookup_value;
      }

      //lookup_array
      var data_lookup_array = arguments[1];
      var lookup_array = [];
      if (getObjType(data_lookup_array) == "array") {
        if (getObjType(data_lookup_array[0]) == "array") {
          if (!func_methods.isDyadicArr(data_lookup_array)) {
            return formula.error.v;
          }
          return formula.error.na;
        } else {
          for (var i = 0; i < data_lookup_array.length; i++) {
            lookup_array.push(data_lookup_array[i]);
          }
        }
      } else if (getObjType(data_lookup_array) == "object" && data_lookup_array.startCell != null) {
        if (data_lookup_array.rowl > 1 && data_lookup_array.coll > 1) {
          return formula.error.na;
        }
        if (data_lookup_array.data != null) {
          if (getObjType(data_lookup_array.data) == "array") {
            for (var i = 0; i < data_lookup_array.data.length; i++) {
              for (var j = 0; j < data_lookup_array.data[i].length; j++) {
                if (data_lookup_array.data[i][j] != null && !isRealNull(data_lookup_array.data[i][j].v)) {
                  lookup_array.push(data_lookup_array.data[i][j].v);
                }
              }
            }
          } else {
            lookup_array.push(data_lookup_array.data.v);
          }
        }
      }

      //match_type
      var match_type = 1;
      if (arguments.length == 3) {
        match_type = func_methods.getFirstValue(arguments[2]);
        if (valueIsError(match_type)) {
          return match_type;
        }
        if (!isRealNum(match_type)) {
          return formula.error.v;
        }
        match_type = Math.ceil(parseFloat(match_type));
      }
      if ([-1, 0, 1].indexOf(match_type) == -1) {
        return formula.error.na;
      }

      //计算
      var index;
      var indexValue;
      for (var idx = 0; idx < lookup_array.length; idx++) {
        if (match_type === 1) {
          if (lookup_array[idx] === lookup_value) {
            return idx + 1;
          } else if (lookup_array[idx] < lookup_value) {
            if (!indexValue) {
              index = idx + 1;
              indexValue = lookup_array[idx];
            } else if (lookup_array[idx] > indexValue) {
              index = idx + 1;
              indexValue = lookup_array[idx];
            }
          }
        } else if (match_type === 0) {
          if (typeof lookup_value === 'string') {
            lookup_value = lookup_value.replace(/\?/g, '.');
            if (lookup_array[idx].toLowerCase().match(lookup_value.toLowerCase())) {
              return idx + 1;
            }
          } else {
            if (lookup_array[idx] === lookup_value) {
              return idx + 1;
            }
          }
        } else if (match_type === -1) {
          if (lookup_array[idx] === lookup_value) {
            return idx + 1;
          } else if (lookup_array[idx] > lookup_value) {
            if (!indexValue) {
              index = idx + 1;
              indexValue = lookup_array[idx];
            } else if (lookup_array[idx] < indexValue) {
              index = idx + 1;
              indexValue = lookup_array[idx];
            }
          }
        }
      }
      return index ? index : formula.error.na;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "VLOOKUP": function () {
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
      //lookup_value
      var lookup_value = func_methods.getFirstValue(arguments[0], "text");
      if (valueIsError(lookup_value)) {
        return lookup_value;
      }
      if (lookup_value.toString().replace(/\s/g, "") == "") {
        return formula.error.na;
      }

      //table_array
      var data_table_array = arguments[1];
      var table_array = [];
      if (getObjType(data_table_array) == "array") {
        if (getObjType(data_table_array[0]) == "array") {
          if (!func_methods.isDyadicArr(data_table_array)) {
            return formula.error.v;
          }
          for (var i = 0; i < data_table_array.length; i++) {
            var rowArr = [];
            for (var j = 0; j < data_table_array[i].length; j++) {
              rowArr.push(data_table_array[i][j]);
            }
            table_array.push(rowArr);
          }
        } else {
          var rowArr = [];
          for (var i = 0; i < data_table_array.length; i++) {
            rowArr.push(data_table_array[i]);
          }
          table_array.push(rowArr);
        }
      } else if (getObjType(data_table_array) == "object" && data_table_array.startCell != null) {
        table_array = func_methods.getCellDataDyadicArr(data_table_array, "text");
      } else {
        return formula.error.v;
      }

      //col_index_num
      var col_index_num = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(col_index_num)) {
        return col_index_num;
      }
      if (!isRealNum(col_index_num)) {
        return formula.error.v;
      }
      col_index_num = parseInt(col_index_num);

      //range_lookup
      var range_lookup = true;
      if (arguments.length == 4) {
        range_lookup = func_methods.getCellBoolen(arguments[3]);
        if (valueIsError(range_lookup)) {
          return range_lookup;
        }
      }

      //判断
      if (col_index_num < 1) {
        return formula.error.v;
      } else if (col_index_num > table_array[0].length) {
        return formula.error.r;
      }

      //计算
      if (range_lookup) {
        table_array = orderbydata(table_array, 0, true);
        for (var r = 0; r < table_array.length; r++) {
          var v = table_array[r][0];
          var result;
          if (isdatetime(lookup_value) && isdatetime(v)) {
            result = diff(lookup_value, v);
          } else if (isRealNum(lookup_value) && isRealNum(v)) {
            result = numeral(lookup_value).value() - numeral(v).value();
          } else if (!isRealNum(lookup_value) && !isRealNum(v)) {
            result = lookup_value.localeCompare(v, "zh");
          } else if (!isRealNum(lookup_value)) {
            result = 1;
          } else if (!isRealNum(v)) {
            result = -1;
          }
          if (result < 0) {
            if (r == 0) {
              return formula.error.na;
            } else {
              return table_array[r - 1][col_index_num - 1];
            }
          } else {
            if (r == table_array.length - 1) {
              return table_array[r][col_index_num - 1];
            }
          }
        }
      } else {
        var index = null;
        for (var r = 0; r < table_array.length; r++) {
          if (lookup_value.toString() == table_array[r][0].toString()) {
            index = r;
            break;
          }
        }
        if (index == null) {
          return formula.error.na;
        }
        return table_array[index][col_index_num - 1];
      }
    } catch (e) {
      var err = e;
      //计算错误检测
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "HLOOKUP": function () {
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
      var searchkey = arguments[0];
      if (typeof searchkey == "object") {
        searchkey = arguments[0].data;
        if (getObjType(searchkey) == "array") {
          searchkey = searchkey[r];
          if (getObjType(searchkey) == "array") {
            searchkey = searchkey[c];
          }
        } else {
          searchkey = searchkey.v;
        }
      }
      var range = arguments[1].data;
      var index = arguments[2];
      var isaccurate = false;
      if (arguments.length > 3) {
        isaccurate = !!arguments[3];
      }
      if (index > range.rowl) {
        return [formula.error.v, "索引超过了范围的长度，" + range[0].length];
      }
      if (index < 1) {
        return [formula.error.v, "索引必须大于1"];
      }
      var result = formula.error.na;
      for (var c = 0; c < range[0].length; c++) {
        var matchv = getcellvalue(0, c, range);
        var showv = getcellvalue(index - 1, c, range);
        if (isaccurate) {
          if (matchv.indexOf(searchkey) > -1) {
            result = showv;
          }
        } else {
          if (formula.acompareb(matchv, searchkey)) {
            result = showv;
            return result;
          }
        }
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "LOOKUP": function () {
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
      //完成矢量形式（数组形式不推荐，未做）
      //=LOOKUP(4.19, A2:A6, B2:B6)
      //=LOOKUP(0, A2:A6, B2:B6)
      var cell_r = window.luckysheetCurrentRow;
      var cell_c = window.luckysheetCurrentColumn;
      var searchkey = arguments[0];
      if (typeof searchkey == "object") {
        searchkey = arguments[0].data;
        if (getObjType(searchkey) == "array") {
          searchkey = searchkey[r];
          if (getObjType(searchkey) == "array") {
            searchkey = searchkey[c];
          }
        } else {
          searchkey = searchkey.v;
        }
      }

      //必须为一维数组
      var range = arguments[1].data;
      var range2;
      var result = formula.error.na;
      function sortNum(a, b) {
        //用于排序
        return b - a;
      }

      //获得两个范围的数组
      range = formula.getRangeArray(range)[0];
      if (arguments[2]) {
        range2 = arguments[2].data;
        range2 = formula.getRangeArray(range2)[0];
      }
      if (typeof searchkey == "string") {
        //字符串直接判断是否相等

        for (var i = 0; i < range.length; i++) {
          var matchv = range[i];
          var showv;
          if (arguments[2]) {
            showv = range2[i];
            if (matchv == searchkey) {
              result = showv;
            }
          } else {
            if (formula.acompareb(matchv, searchkey)) {
              result = matchv;
            }
          }
        }
      } else if (isdatatype(searchkey) == "num") {
        //数字判断1.是否相等2.不等，去找接近值
        var rangeNow = [];
        for (var i = 0; i < range.length; i++) {
          var matchv = range[i];
          var showv;
          if (arguments[2]) {
            showv = range2[i];
            if (matchv == searchkey) {
              result = showv;
              return result;
            } else if (matchv != searchkey && isdatatype(matchv) == "num") {
              rangeNow.push(matchv);
            }
          } else {
            if (matchv == searchkey) {
              result = matchv;
              return result;
            } else if (matchv != searchkey && isdatatype(matchv) == "num") {
              rangeNow.push(matchv);
            }
          }
        }
        if (rangeNow.length != 0) {
          rangeNow.push(searchkey);
          rangeNow.sort(sortNum);
          var index = rangeNow.indexOf(searchkey);
          if (index == rangeNow.length - 1) {
            return [formula.error.na, "找不到对应参数"];
          } else {
            var mat = rangeNow[index + 1];
            if (arguments[2]) {
              var i = range.indexOf(mat); //改成数组
              result = range2[i];
            } else {
              result = mat;
            }
          }
        }
      }
      return result;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "INDEX": function () {
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
      //单元格区域或数组常量
      var data_array = arguments[0];
      var array = [];
      let isReference = false;
      if (getObjType(data_array) == "array") {
        if (getObjType(data_array[0]) == "array" && !func_methods.isDyadicArr(data_array)) {
          return formula.error.v;
        }
        array = func_methods.getDataDyadicArr(data_array);
      } else if (getObjType(data_array) == "object" && data_array.startCell != null) {
        array = func_methods.getCellDataDyadicArr(data_array, "number");
        isReference = true;
      }
      var rowlen = array.length,
        collen = array[0].length;

      //选择数组中的某行，函数从该行返回数值
      var row_num = func_methods.getFirstValue(arguments[1]);
      if (valueIsError(row_num)) {
        return row_num;
      }
      if (!isRealNum(row_num)) {
        return formula.error.v;
      }
      row_num = parseInt(row_num);

      //选择数组中的某列，函数从该列返回数值
      var column_num = func_methods.getFirstValue(arguments[2]);
      if (valueIsError(column_num)) {
        return column_num;
      }
      if (row_num < 0 || isRealNum(column_num) && column_num < 0) {
        return formula.error.v;
      }
      if (rowlen == 1 && column_num == undefined) {
        column_num = row_num;
        row_num = 1;
      }
      if (row_num > rowlen || isRealNum(column_num) && column_num > collen) {
        return formula.error.r;
      }
      if (isReference) {
        var cellrange = formula.getcellrange(data_array.startCell);
        var cellRow0 = cellrange["row"][0];
        var cellCol0 = cellrange["column"][0];
        let data = array;
        if (row_num == 0 || column_num == 0) {
          if (row_num == 0) {
            data = array[0];
            row_num = 1;
          } else {
            data = array[row_num - 1];
          }
          if (isRealNum(column_num)) {
            if (column_num == 0) {
              data = data[0];
              column_num = 1;
            } else {
              data = data[column_num - 1];
            }
          } else {
            column_num = 1;
          }
        } else {
          if (!isRealNum(row_num)) {
            row_num = 1;
          }
          if (!isRealNum(column_num)) {
            column_num = 1;
          }
          data = array[row_num - 1][column_num - 1];
        }
        let row_index = cellRow0 + row_num - 1,
          column_index = cellCol0 + column_num - 1;
        let retAll = {
          "sheetName": data_array.sheetName,
          "startCell": getRangetxt(Store.calculateSheetIndex, {
            row: [row_index, row_index],
            column: [column_index, column_index]
          }),
          "rowl": row_index,
          "coll": column_index,
          "data": data
        };
        return retAll;
      } else {
        //计算

        if (!isRealNum(column_num)) {
          return formula.error.v;
        }
        column_num = parseInt(column_num);
        if (row_num <= 0 || column_num <= 0) {
          return formula.error.v;
        }
        return array[row_num - 1][column_num - 1];
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "GETPIVOTDATA": function () {
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
      return formula.error.v;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "CHOOSE": function () {
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
      //指定要返回哪一项
      var index_num = func_methods.getFirstValue(arguments[0]);
      if (valueIsError(index_num)) {
        return index_num;
      }
      if (!isRealNum(index_num)) {
        return formula.error.v;
      }
      index_num = parseInt(index_num);
      if (index_num < 1 || index_num > arguments.length - 1) {
        return formula.error.v;
      }
      var data_result = arguments[index_num];
      if (getObjType(data_result) == "array") {
        if (getObjType(data_result[0]) == "array" && !func_methods.isDyadicArr(data_result)) {
          return formula.error.v;
        }
        return data_result;
      } else if (getObjType(data_result) == "object" && data_result.startCell != null) {
        if (data_result.data == null) {
          return 0;
        }
        if (getObjType(data_result.data) == "array") {
          var result = func_methods.getCellDataDyadicArr(data_result.data, "number");
          return result;
        } else {
          if (isRealNull(data_result.data.v)) {
            return 0;
          }
          return data_result.data.v;
        }
      } else {
        return data_result;
      }
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "HYPERLINK": function () {
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
      return formula.error.v;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  }
};

export default lookupSearch;
