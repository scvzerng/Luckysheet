import { getSheetIndex } from '../../../methods/get';
import { parseConditionRange } from '../rangeParser.js';
import locale from '../../../locale/locale';
import { getPicker } from '../../../components/ColorPicker';

export function initEditRuleEvents(_this) {
      const conditionformat_Text = locale().conditionformat;
      // 编辑规则
      $(document).off("click.CFeditorConditionRule").on("click.CFeditorConditionRule", "#editorConditionRule", function () {
        let sheetIndex = $("#luckysheet-administerRule-dialog .chooseSheet option:selected").val();
        let itemIndex = $("#luckysheet-administerRule-dialog .ruleList .listBox .item.on").attr("data-item");
        let rule = {
          "sheetIndex": sheetIndex,
          "itemIndex": itemIndex,
          "data": _this.fileClone[getSheetIndex(sheetIndex)]["luckysheet_conditionformat_save"][itemIndex]
        };
        _this.editorRule = rule;
        _this.editorConditionRuleDialog();
      });
      $(document).off("click.CFeditorConditionRuleConfirm").on("click.CFeditorConditionRuleConfirm", "#luckysheet-editorConditionRule-dialog-confirm", function () {
        let index = $("#luckysheet-editorConditionRule-dialog .ruleTypeItem.on").index();
        let type1 = $("#luckysheet-editorConditionRule-dialog #type1 option:selected").val();
        let type2 = $("#luckysheet-editorConditionRule-dialog ." + type1 + "Box #type2 option:selected").val();
        let cellrange = _this.editorRule["data"].cellrange;
        let format, rule;
        if (index == 0) {
          if (type1 == "dataBar") {
            //数据�?
            let color = getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog .dataBarBox .luckysheet-conditionformat-config-color"))?.get('hex') || "#000";
            if (type2 == "gradient") {
              //渐变填充
              format = [color, "#ffffff"];
            } else if (type2 == "solid") {
              //实心填充
              format = [color];
            }
            rule = {
              "type": "dataBar",
              "cellrange": cellrange,
              "format": format
            };
          } else if (type1 == "colorGradation") {
            //色阶
            let maxcolor = getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog .colorGradationBox .maxVal .luckysheet-conditionformat-config-color"))?.get('rgb') || "rgb(0, 0, 0)";
            let midcolor = getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog .colorGradationBox .midVal .luckysheet-conditionformat-config-color"))?.get('rgb') || "rgb(0, 0, 0)";
            let mincolor = getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog .colorGradationBox .minVal .luckysheet-conditionformat-config-color"))?.get('rgb') || "rgb(0, 0, 0)";
            if (type2 == "threeColor") {
              //三色
              format = [maxcolor, midcolor, mincolor];
            } else if (type2 == "twoColor") {
              //双色
              format = [maxcolor, mincolor];
            }
            rule = {
              "type": "colorGradation",
              "cellrange": cellrange,
              "format": format
            };
          } else if (type1 == "icons") {
            //图标�?
            let len = $(this).parents("#luckysheet-editorConditionRule-dialog").find(".iconsBox .model").attr("data-len");
            let leftMin = $(this).parents("#luckysheet-editorConditionRule-dialog").find(".iconsBox .model").attr("data-leftmin");
            let top = $(this).parents("#luckysheet-editorConditionRule-dialog").find(".iconsBox .model").attr("data-top");
            format = {
              "len": len,
              "leftMin": leftMin,
              "top": top
            };
            rule = {
              "type": "icons",
              "cellrange": cellrange,
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
                let v1 = $("#luckysheet-editorConditionRule-dialog #conditionVal input").val().trim();
                let v2 = $("#luckysheet-editorConditionRule-dialog #conditionVal2 input").val().trim();
  
                let result1 = parseConditionRange(v1, _this, conditionformat_Text);
                if (result1 == null) {
                  return;
                }
                if (result1.conditionRange.length > 0) {
                  conditionRange[0] = result1.conditionRange[0];
                }
                conditionValue.push(...result1.conditionValue);

                let result2 = parseConditionRange(v2, _this, conditionformat_Text);
                if (result2 == null) {
                  return;
                }
                if (result2.conditionRange.length > 0) {
                  conditionRange[1] = result2.conditionRange[0];
                }
                conditionValue.push(...result2.conditionValue);
              } else {
                //条件�?
                let v = $("#luckysheet-editorConditionRule-dialog #conditionVal input").val().trim();
  
                let result = parseConditionRange(v, _this, conditionformat_Text);
                if (result == null) {
                  return;
                }
                conditionRange.push(...result.conditionRange);
                conditionValue.push(...result.conditionValue);
              }
            } else if (type1 == "text") {
              //特定文本
              conditionName = "textContains";
  
              //条件�?
              let v = $("#luckysheet-editorConditionRule-dialog #conditionVal input").val().trim();
  
              let result = parseConditionRange(v, _this, conditionformat_Text);
              if (result == null) {
                return;
              }
              conditionRange.push(...result.conditionRange);
              conditionValue.push(...result.conditionValue);
            } else if (type1 == "date") {
              //发生日期
              conditionName = "occurrenceDate";
  
              //条件�?
              let v = $("#luckysheet-editorConditionRule-dialog #daterange-btn").val();
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
              if ($("#luckysheet-editorConditionRule-dialog #isPercent").is(":selected")) {
                conditionName = "top10%";
              } else {
                conditionName = "top10";
              }
            } else if (type1 == "last") {
              if ($("#luckysheet-editorConditionRule-dialog #isPercent").is(":selected")) {
                conditionName = "last10%";
              } else {
                conditionName = "last10";
              }
            }
  
            //条件�?
            let v = $("#luckysheet-editorConditionRule-dialog #conditionVal input").val().trim();
            if (parseInt(v) != v || parseInt(v) < 1 || parseInt(v) > 1000) {
              _this.infoDialog(conditionformat_Text.pleaseEnterInteger, "");
              return;
            }
            conditionValue.push(v);
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
            let v = $("#luckysheet-editorConditionRule-dialog #formulaConditionVal input").val().trim();
            console.log(v);
            if (v == "") {
              _this.infoDialog("Condition value cannot be empty!", "");
              return;
            }
            conditionValue.push(v);
          }
  
          //格式颜色
          let textcolor;
          if ($("#luckysheet-editorConditionRule-dialog #checkTextColor").is(":checked")) {
            textcolor = getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog #textcolorshow"))?.get('hex') || "#000";
          } else {
            textcolor = null;
          }
          let cellcolor;
          if ($("#luckysheet-editorConditionRule-dialog #checkCellColor").is(":checked")) {
            cellcolor = getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog #cellcolorshow"))?.get('hex') || "#000";
          } else {
            cellcolor = null;
          }
          format = {
            "textColor": textcolor,
            "cellColor": cellcolor
          };
          rule = {
            "type": "default",
            "cellrange": cellrange,
            "format": format,
            "conditionName": conditionName,
            "conditionRange": conditionRange,
            "conditionValue": conditionValue
          };
        }
  
        //修改编辑的规�?
        let sheetIndex = _this.editorRule["sheetIndex"];
        let itemIndex = _this.editorRule["itemIndex"];
        _this.fileClone[getSheetIndex(sheetIndex)]["luckysheet_conditionformat_save"][itemIndex] = rule;
  
        //编辑规则隐藏，管理规则显�?
        $("#luckysheet-editorConditionRule-dialog").hide();
        _this.administerRuleDialog();
      });
      $(document).off("click.CFeditorConditionRuleClose").on("click.CFeditorConditionRuleClose", "#luckysheet-editorConditionRule-dialog-close", function () {
        //编辑规则隐藏，管理规则显�?
        $("#luckysheet-editorConditionRule-dialog").hide();
        $("#luckysheet-administerRule-dialog").show();
        //隐藏虚线�?
        $("#luckysheet-formula-functionrange-select").hide();
        $("#luckysheet-row-count-show").hide();
        $("#luckysheet-column-count-show").hide();
      });
}
