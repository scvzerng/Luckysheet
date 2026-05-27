import formula from '../../../global/formula';
import { getcellvalue } from '../../../global/getdata';
import tooltip from '../../../global/tooltip';
import { isEditMode } from '../../../global/validate';
import { getSheetIndex } from '../../../methods/get';
import Store from '../../../store';
import locale from '../../../locale/locale';

export function initNewRuleEvents(_this) {
      const conditionformat_Text = locale().conditionformat;
      // 新建规则
      $(document).off("click.CFnewConditionRule").on("click.CFnewConditionRule", "#newConditionRule", function () {
        let sheetIndex = $("#luckysheet-administerRule-dialog .chooseSheet option:selected").val();
        if (Store.luckysheet_select_save.length == 0) {
          if (isEditMode()) {
            alert(conditionformat_Text.pleaseSelectRange);
          } else {
            tooltip.info(conditionformat_Text.pleaseSelectRange, "");
          }
          return;
        }
        _this.newConditionRuleDialog(1);
      });
      $(document).off("click.CFnewConditionRuleConfirm").on("click.CFnewConditionRuleConfirm", "#luckysheet-newConditionRule-dialog-confirm", function () {
        let index = $("#luckysheet-newConditionRule-dialog .ruleTypeItem.on").index();
        let type1 = $("#luckysheet-newConditionRule-dialog #type1 option:selected").val();
        let type2 = $("#luckysheet-newConditionRule-dialog ." + type1 + "Box #type2 option:selected").val();
        let format, rule;
        if (index == 0) {
          if (type1 == "dataBar") {
            //数据�?
            let color = $(this).parents("#luckysheet-newConditionRule-dialog").find(".dataBarBox .luckysheet-conditionformat-config-color").spectrum("get").toHexString();
            if (type2 == "gradient") {
              //渐变填充
              format = [color, "#ffffff"];
            } else if (type2 == "solid") {
              //实心填充
              format = [color];
            }
            rule = {
              "type": "dataBar",
              "cellrange": $.extend(true, [], Store.luckysheet_select_save),
              "format": format
            };
          } else if (type1 == "colorGradation") {
            //色阶
            let maxcolor = $(this).parents("#luckysheet-newConditionRule-dialog").find(".colorGradationBox .maxVal .luckysheet-conditionformat-config-color").spectrum("get").toRgbString();
            let midcolor = $(this).parents("#luckysheet-newConditionRule-dialog").find(".colorGradationBox .midVal .luckysheet-conditionformat-config-color").spectrum("get").toRgbString();
            let mincolor = $(this).parents("#luckysheet-newConditionRule-dialog").find(".colorGradationBox .minVal .luckysheet-conditionformat-config-color").spectrum("get").toRgbString();
            if (type2 == "threeColor") {
              //三色
              format = [maxcolor, midcolor, mincolor];
            } else if (type2 == "twoColor") {
              //双色
              format = [maxcolor, mincolor];
            }
            rule = {
              "type": "colorGradation",
              "cellrange": $.extend(true, [], Store.luckysheet_select_save),
              "format": format
            };
          } else if (type1 == "icons") {
            //图标�?
            let len = $(this).parents("#luckysheet-newConditionRule-dialog").find(".iconsBox .model").attr("data-len");
            let leftMin = $(this).parents("#luckysheet-newConditionRule-dialog").find(".iconsBox .model").attr("data-leftmin");
            let top = $(this).parents("#luckysheet-newConditionRule-dialog").find(".iconsBox .model").attr("data-top");
            format = {
              "len": len,
              "leftMin": leftMin,
              "top": top
            };
            rule = {
              "type": "icons",
              "cellrange": $.extend(true, [], Store.luckysheet_select_save),
              "format": format
            };
          }
        } else {
          let conditionName = "",
            conditionRange = [],
            conditionValue = [];
          if (index == 1) {
            if (type1 == "number") {
              //单元格�?
              conditionName = type2;
              if (type2 == "betweenness") {
                let v1 = $("#luckysheet-newConditionRule-dialog #conditionVal input").val().trim();
                let v2 = $("#luckysheet-newConditionRule-dialog #conditionVal2 input").val().trim();
  
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
  
                    // If the first value is a custom value, and the cell range selected by the second value, push will cause the position to be wrong
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
              } else {
                //条件�?
                let v = $("#luckysheet-newConditionRule-dialog #conditionVal input").val().trim();
  
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
              }
            } else if (type1 == "text") {
              //特定文本
              conditionName = "textContains";
  
              //条件�?
              let v = $("#luckysheet-newConditionRule-dialog #conditionVal input").val().trim();
  
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
                if (v == "") {
                  _this.infoDialog(conditionformat_Text.conditionValueCanOnly, "");
                  return;
                } else {
                  conditionValue.push(v);
                }
              }
            } else if (type1 == "date") {
              //发生日期
              conditionName = "occurrenceDate";
  
              //条件�?
              let v = $("#luckysheet-newConditionRule-dialog #daterange-btn").val();
              if (v == "" || v == null) {
                _this.infoDialog(conditionformat_Text.pleaseSelectADate, "");
                return;
              }
              conditionValue.push(v);
            }
          } else if (index == 2) {
            //排名靠前靠后
            //条件名称
            if (type1 == "top") {
              if ($("#luckysheet-newConditionRule-dialog #isPercent").is(":selected")) {
                conditionName = "top10%";
              } else {
                conditionName = "top10";
              }
            } else if (type1 == "last") {
              if ($("#luckysheet-newConditionRule-dialog #isPercent").is(":selected")) {
                conditionName = "last10%";
              } else {
                conditionName = "last10";
              }
            }
  
            //条件�?
            let v = $("#luckysheet-newConditionRule-dialog #conditionVal input").val().trim();
            if (parseInt(v) != v || parseInt(v) < 1 || parseInt(v) > 1000) {
              _this.infoDialog(conditionformat_Text.pleaseEnterInteger, "");
              return;
            }
            conditionValue.push(parseInt(v));
          } else if (index == 3) {
            //平均�?
            if (type1 == "AboveAverage") {
              conditionName = "AboveAverage";
              conditionValue.push("AboveAverage");
            } else if (type1 == "SubAverage") {
              conditionName = "SubAverage";
              conditionValue.push("SubAverage");
            }
          } else if (index == 4) {
            //重复�?
            conditionName = "duplicateValue";
            conditionValue.push(type1);
          } else if (index == 5) {
            //公式
            conditionName = "formula";
  
            //条件�?
            let v = $("#luckysheet-newConditionRule-dialog #formulaConditionVal input").val().trim();
            if (v == "") {
              _this.infoDialog("Condition value cannot be empty!", "");
              return;
            }
            conditionValue.push(v);
          }
  
          //格式颜色
          let textcolor;
          if ($("#luckysheet-newConditionRule-dialog #checkTextColor").is(":checked")) {
            textcolor = $("#luckysheet-newConditionRule-dialog #textcolorshow").spectrum("get").toHexString();
          } else {
            textcolor = null;
          }
          let cellcolor;
          if ($("#luckysheet-newConditionRule-dialog #checkCellColor").is(":checked")) {
            cellcolor = $("#luckysheet-newConditionRule-dialog #cellcolorshow").spectrum("get").toHexString();
          } else {
            cellcolor = null;
          }
          format = {
            "textColor": textcolor,
            "cellColor": cellcolor
          };
          rule = {
            "type": "default",
            "cellrange": $.extend(true, [], Store.luckysheet_select_save),
            "format": format,
            "conditionName": conditionName,
            "conditionRange": conditionRange,
            "conditionValue": conditionValue
          };
        }
        $("#luckysheet-newConditionRule-dialog").hide();
  
        //新建规则的入�?
        let source = $(this).attr("data-source");
        if (source == 0) {
          $("#luckysheet-modal-dialog-mask").hide();
  
          //保存之前的规�?
          let fileH = $.extend(true, [], Store.luckysheetfile);
          let historyRules = _this.getHistoryRules(fileH);
  
          //保存当前的规�?
          let ruleArr = Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"] == undefined ? [] : Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"];
          ruleArr.push(rule);
          Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"] = ruleArr;
          let fileC = $.extend(true, [], Store.luckysheetfile);
          let currentRules = _this.getCurrentRules(fileC);
  
          //刷新一次表�?
          _this.ref(historyRules, currentRules);
        } else if (source == 1) {
          //临时存储新规�?
          let ruleArr = !!_this.fileClone[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"] ? _this.fileClone[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"] : [];
          ruleArr.push(rule);
          _this.fileClone[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"] = ruleArr;
  
          //新建规则隐藏，管理规则显�?
          _this.administerRuleDialog();
        }
      });
      $(document).off("click.CFnewConditionRuleClose").on("click.CFnewConditionRuleClose", "#luckysheet-newConditionRule-dialog-close", function () {
        //新建规则的入�?
        let source = $(this).attr("data-source");
        if (source == 0) {
          $("#luckysheet-modal-dialog-mask").hide();
        }
        if (source == 1) {
          $("#luckysheet-administerRule-dialog").show();
        }
  
        //新建规则隐藏
        $("#luckysheet-newConditionRule-dialog").hide();
  
        //隐藏虚线�?
        $("#luckysheet-formula-functionrange-select").hide();
        $("#luckysheet-row-count-show").hide();
        $("#luckysheet-column-count-show").hide();
      });
}
