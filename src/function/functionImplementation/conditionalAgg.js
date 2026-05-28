import { luckysheet_getcelldata, luckysheet_parseData, luckysheet_getValue, luckysheet_calcADPMM } from "../func";
import formula from "../../global/formula";
import {  isRealNum } from "../../global/validate";
import {  ABCatNum,  chatatABC } from "../../utils/util";

//公式函数计算
const conditionalAggFunctions = {
  "SUMIF": function () {
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
      //=SUMIF(A2:A5,">1600000",B2:B5)
      //=SUMIF(A2:A5,">1600000")
      //=SUMIF(A2:A5,3000000,B2:B5)
      //找出range中匹配的字符串
      var sum = 0;
      var rangeData = arguments[0].data;
      var rangeRow = arguments[0].rowl;
      var rangeCol = arguments[0].coll;
      var criteria = luckysheet_parseData(arguments[1]);
      rangeData = formula.getRangeArray(rangeData)[0];

      //如果有第三个参数
      if (arguments[2]) {
        var sumRangeData = [];
        //根据选择的目标的区域确定实际目标区域
        //初始位置
        var sumRangeStart = arguments[2].startCell;
        var sumRangeRow = arguments[2].rowl;
        var sumRangeCol = arguments[2].coll;
        var sumRangeSheet = arguments[2].sheetName;
        if (rangeRow == sumRangeRow && rangeCol == sumRangeCol) {
          sumRangeData = arguments[2].data;
        } else {
          var row = [],
            col = [];
          var sumRangeEnd = "";
          var realSumRange = "";
          //console.log("开始位置！！！",sumRangeStart,typeof(sumRangeStart));
          row[0] = parseInt(sumRangeStart.replace(/[^0-9]/g, "")) - 1;
          col[0] = ABCatNum(sumRangeStart.replace(/[^A-Za-z]/g, ""));

          //根据第一个范围的长宽确定目标范围的末尾位置
          row[1] = row[0] + rangeRow - 1;
          col[1] = col[0] + rangeCol - 1;

          //console.log(row[0],col[0],row[1],col[1]);
          //末尾位置转化为sheet格式：如 F4
          var real_ABC = chatatABC(col[1]);
          var real_Num = row[1] + 1;
          sumRangeEnd = real_ABC + real_Num;
          //console.log("合成新的末尾位置：" + sumRangeEnd);

          realSumRange = sumRangeSheet + "!" + sumRangeStart + ":" + sumRangeEnd;
          sumRangeData = luckysheet_getcelldata(realSumRange).data;
          //console.log("最终的目标范围：",sumRangeData);
        }
        sumRangeData = formula.getRangeArray(sumRangeData)[0];

        //循环遍历查找匹配项
        for (var i = 0; i < rangeData.length; i++) {
          var v = rangeData[i];
          if (!!v && formula.acompareb(v, criteria)) {
            if (!isRealNum(sumRangeData[i])) {
              continue;
            }
            sum = luckysheet_calcADPMM(sum, "+", sumRangeData[i]); // parseFloat(sumRangeData[i]);
          }
        }
      } else {
        //循环遍历查找匹配项
        for (var i = 0; i < rangeData.length; i++) {
          var v = rangeData[i];
          if (!!v && formula.acompareb(v, criteria)) {
            if (!isRealNum(v)) {
              continue;
            }
            sum = luckysheet_calcADPMM(sum, "", v); // parseFloat(v);
          }
        }
      }
      return sum;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  },
  "SUMIFS": function () {
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
      var sum = 0;
      var args = arguments;
      luckysheet_getValue(args);
      var rangeData = formula.getRangeArray(args[0])[0];
      var results = new Array(rangeData.length);
      for (var i = 0; i < results.length; i++) {
        results[i] = true;
      }
      for (var i = 1; i < args.length; i += 2) {
        var range = formula.getRangeArray(args[i])[0];
        var criteria = args[i + 1];
        for (var j = 0; j < range.length; j++) {
          var v = range[j];
          results[j] = results[j] && !!v && formula.acompareb(v, criteria);
        }
      }
      for (var i = 0; i < rangeData.length; i++) {
        if (results[i]) {
          sum = luckysheet_calcADPMM(sum, "+", rangeData[i]); //parseFloat(rangeData[i]);
        }
      }
      return sum;
    } catch (e) {
      var err = e;
      err = formula.errorInfo(err);
      return [formula.error.v, err];
    }
  }
};
export default conditionalAggFunctions;