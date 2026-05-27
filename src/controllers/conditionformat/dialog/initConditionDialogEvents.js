import { getcellvalue } from '../../../global/getdata';
import { getSheetIndex } from '../../../methods/get';
import Store from '../../../store';
import locale from '../../../locale/locale';

export function initConditionDialogEvents(_this) {
      const conditionformat_Text = locale().conditionformat;
      // 删除规则
      $(document).off("click.CFdeleteConditionRule").on("click.CFdeleteConditionRule", "#deleteConditionRule", function () {
        let sheetIndex = $("#luckysheet-administerRule-dialog .chooseSheet option:selected").val();
        let itemIndex = $("#luckysheet-administerRule-dialog .ruleList .listBox .item.on").attr("data-item");
        _this.fileClone[getSheetIndex(sheetIndex)]["luckysheet_conditionformat_save"].splice(itemIndex, 1);
        _this.administerRuleDialog();
      });
  
      // 规则子菜单弹出层 点击确定修改样式
      $(document).off("click.CFdefault").on("click.CFdefault", "#luckysheet-conditionformat-dialog-confirm", function () {
        //条件名称
        let conditionName = $("#luckysheet-conditionformat-dialog .box").attr("data-itemvalue");
  
        //条件单元�?
        let conditionRange = [];
  
        //条件�?
        let conditionValue = [];
        if (conditionName == "greaterThan" || conditionName == "lessThan" || conditionName == "equal" || conditionName == "textContains") {
          let v = $("#luckysheet-conditionformat-dialog #conditionVal").val().trim();
  
          //条件值是否是选区
          let rangeArr = _this.getRangeByTxt(v);
          if (rangeArr.length > 1) {
            _this.infoDialog(conditionformat_Text.onlySingleCell, "");
            return;
          } else if (rangeArr.length == 1) {
            let r1 = rangeArr[0].row[0],
              r2 = rangeArr[0].row[1];
            let c1 = rangeArr[0].column[0],
              c2 = rangeArr[0].column[1];
            if (r1 == r2 && c1 == c2) {
              v = getcellvalue(r1, c1, Store.flowdata);
              conditionRange.push({
                "row": rangeArr[0].row,
                "column": rangeArr[0].column
              });
              conditionValue.push(v);
            } else {
              _this.infoDialog(conditionformat_Text.onlySingleCell, "");
              return;
            }
          } else if (rangeArr.length == 0) {
            if (isNaN(v) || v == "") {
              _this.infoDialog(conditionformat_Text.conditionValueCanOnly, "");
              return;
            } else {
              conditionValue.push(v);
            }
          }
        } else if (conditionName == "betweenness") {
          //介于
          let v1 = $("#luckysheet-conditionformat-dialog #conditionVal").val().trim();
          let v2 = $("#luckysheet-conditionformat-dialog #conditionVal2").val().trim();
  
          //条件值是否是选区
          let rangeArr1 = _this.getRangeByTxt(v1);
          if (rangeArr1.length > 1) {
            _this.infoDialog(conditionformat_Text.onlySingleCell, "");
            return;
          } else if (rangeArr1.length == 1) {
            let r1 = rangeArr1[0].row[0],
              r2 = rangeArr1[0].row[1];
            let c1 = rangeArr1[0].column[0],
              c2 = rangeArr1[0].column[1];
            if (r1 == r2 && c1 == c2) {
              v1 = getcellvalue(r1, c1, Store.flowdata);
  
              // conditionRange.push({ "row": rangeArr1[0].row, "column": rangeArr1[0].column });
              conditionRange[0] = {
                "row": rangeArr1[0].row,
                "column": rangeArr1[0].column
              };
              conditionValue.push(v1);
            } else {
              _this.infoDialog(conditionformat_Text.onlySingleCell, "");
              return;
            }
          } else if (rangeArr1.length == 0) {
            if (isNaN(v1) || v1 == "") {
              _this.infoDialog(conditionformat_Text.conditionValueCanOnly, "");
              return;
            } else {
              conditionValue.push(v1);
            }
          }
          let rangeArr2 = _this.getRangeByTxt(v2);
          if (rangeArr2.length > 1) {
            _this.infoDialog(conditionformat_Text.onlySingleCell, "");
            return;
          } else if (rangeArr2.length == 1) {
            let r1 = rangeArr2[0].row[0],
              r2 = rangeArr2[0].row[1];
            let c1 = rangeArr2[0].column[0],
              c2 = rangeArr2[0].column[1];
            if (r1 == r2 && c1 == c2) {
              v2 = getcellvalue(r1, c1, Store.flowdata);
  
              // conditionRange.push({ "row": rangeArr2[0].row, "column": rangeArr2[0].column });
              conditionRange[1] = {
                "row": rangeArr2[0].row,
                "column": rangeArr2[0].column
              };
              conditionValue.push(v2);
            } else {
              _this.infoDialog(conditionformat_Text.onlySingleCell, "");
              return;
            }
          } else if (rangeArr2.length == 0) {
            if (isNaN(v2) || v2 == "") {
              _this.infoDialog(conditionformat_Text.conditionValueCanOnly, "");
              return;
            } else {
              conditionValue.push(v2);
            }
          }
        } else if (conditionName == "occurrenceDate") {
          //日期
          let v = $("#luckysheet-conditionformat-dialog #daterange-btn").val();
          if (v == "" || v == null) {
            _this.infoDialog(conditionformat_Text.pleaseSelectADate, "");
            return;
          }
          conditionValue.push(v);
        } else if (conditionName == "duplicateValue") {
          //重复�?
          conditionValue.push($("#luckysheet-conditionformat-dialog #conditionVal option:selected").val());
        } else if (conditionName == "top10" || conditionName == "top10%" || conditionName == "last10" || conditionName == "last10%") {
          let v = $("#luckysheet-conditionformat-dialog #conditionVal").val().trim();
          if (parseInt(v) != v || parseInt(v) < 1 || parseInt(v) > 1000) {
            _this.infoDialog(conditionformat_Text.pleaseEnterInteger, "");
            return;
          }
          conditionValue.push(v);
        } else if (conditionName == "AboveAverage") {
          //高于平均�?
          conditionValue.push("AboveAverage");
        } else if (conditionName == "SubAverage") {
          //低于平均�?
          conditionValue.push("SubAverage");
        }
  
        //格式颜色
        let textcolor;
        if ($("#checkTextColor").is(":checked")) {
          textcolor = $("#textcolorshow").spectrum("get").toHexString();
        } else {
          textcolor = null;
        }
        let cellcolor;
        if ($("#checkCellColor").is(":checked")) {
          cellcolor = $("#cellcolorshow").spectrum("get").toHexString();
        } else {
          cellcolor = null;
        }
  
        //保存之前的规�?
        let fileH = $.extend(true, [], Store.luckysheetfile);
        let historyRules = _this.getHistoryRules(fileH);
  
        //保存当前的规�?
        let rule = {
          "type": "default",
          "cellrange": $.extend(true, [], Store.luckysheet_select_save),
          "format": {
            "textColor": textcolor,
            "cellColor": cellcolor
          },
          "conditionName": conditionName,
          "conditionRange": conditionRange,
          "conditionValue": conditionValue
        };
        let ruleArr = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"] == undefined ? [] : Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"];
        ruleArr.push(rule);
        Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"] = ruleArr;
        let fileC = $.extend(true, [], Store.luckysheetfile);
        let currentRules = _this.getCurrentRules(fileC);
  
        //刷新一次表�?
        _this.ref(historyRules, currentRules);
  
        //隐藏一些dom
        $("#luckysheet-modal-dialog-mask").hide();
        $("#luckysheet-conditionformat-dialog").hide();
      });
  
      // 图标集弹出层 选择
      $(document).off("click.CFicons").on("click.CFicons", "#luckysheet-CFicons-dialog .item", function () {
        $("#luckysheet-modal-dialog-mask").hide();
        $("#luckysheet-CFicons-dialog").hide();
        if (Store.luckysheet_select_save.length > 0) {
          let cellrange = $.extend(true, [], Store.luckysheet_select_save);
          let format = {
            "len": $(this).attr("data-len"),
            "leftMin": $(this).attr("data-leftMin"),
            "top": $(this).attr("data-top")
          };
          _this.updateItem("icons", cellrange, format);
        }
      });
}
