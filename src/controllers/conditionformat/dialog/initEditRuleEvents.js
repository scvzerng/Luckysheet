import { onNS, offNS } from '../../../utils/migrationHelpers.js';
import { getSheetIndex } from '../../../methods/get';
import { parseConditionRange } from '../rangeParser.js';
import locale from '../../../locale/locale';
import { getPicker } from '../../../components/ColorPicker';
import countShow from '../../../ui/countShow.js';
import formulaRangeSelect from '../../../ui/formulaRangeSelect.js';
import conditionformatDialog from '../../../ui/conditionformatDialog.js';

export function initEditRuleEvents(_this) {
      const conditionformat_Text = locale().conditionformat;
      offNS("CFeditorConditionRule");
      onNS(document, "click.CFeditorConditionRule", "#editorConditionRule", function () {
        let sheetIndex = conditionformatDialog.adminRule.find(".chooseSheet option:checked")?.value;
        let itemIndex = conditionformatDialog.adminRule.find(".ruleList .listBox .item.on")?.getAttribute("data-item");
        let rule = {
          "sheetIndex": sheetIndex,
          "itemIndex": itemIndex,
          "data": _this.fileClone[getSheetIndex(sheetIndex)]["luckysheet_conditionformat_save"][itemIndex]
        };
        _this.editorRule = rule;
        _this.editorConditionRuleDialog();
      });
      offNS("CFeditorConditionRuleConfirm");
      onNS(document, "click.CFeditorConditionRuleConfirm", "#luckysheet-editorConditionRule-dialog-confirm", function () {
        let _editDlg = document.getElementById("luckysheet-editorConditionRule-dialog");
        let index = Array.from(_editDlg.querySelector(".ruleTypeItem.on")?.parentElement?.children || []).indexOf(_editDlg.querySelector(".ruleTypeItem.on"));
        let type1 = _editDlg.querySelector("#type1")?.value;
        let type2 = _editDlg.querySelector("." + type1 + "Box #type2")?.value;
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
            let _editIconsModel = _editDlg.querySelector(".iconsBox .model");
            let len = _editIconsModel?.getAttribute("data-len");
            let leftMin = _editIconsModel?.getAttribute("data-leftmin");
            let top = _editIconsModel?.getAttribute("data-top");
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
                let v1 = _editDlg.querySelector("#conditionVal input")?.value?.trim();
                let v2 = _editDlg.querySelector("#conditionVal2 input")?.value?.trim();
  
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
                let v = _editDlg.querySelector("#conditionVal input")?.value?.trim();
  
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
              let v = _editDlg.querySelector("#conditionVal input")?.value?.trim();
  
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
              let v = _editDlg.querySelector("#daterange-btn")?.value;
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
              if (_editDlg.querySelector("#isPercent")?.checked) {
                conditionName = "top10%";
              } else {
                conditionName = "top10";
              }
            } else if (type1 == "last") {
              if (_editDlg.querySelector("#isPercent")?.checked) {
                conditionName = "last10%";
              } else {
                conditionName = "last10";
              }
            }
  
            //条件�?
            let v = _editDlg.querySelector("#conditionVal input")?.value?.trim();
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
            let v = _editDlg.querySelector("#formulaConditionVal input")?.value?.trim();
            console.log(v);
            if (v == "") {
              _this.infoDialog("Condition value cannot be empty!", "");
              return;
            }
            conditionValue.push(v);
          }
  
          //格式颜色
          let textcolor;
          if (_editDlg.querySelector("#checkTextColor")?.checked) {
            textcolor = getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog #textcolorshow"))?.get('hex') || "#000";
          } else {
            textcolor = null;
          }
          let cellcolor;
          if (_editDlg.querySelector("#checkCellColor")?.checked) {
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
        const _elEditRule1 = document.getElementById("luckysheet-editorConditionRule-dialog"); if (_elEditRule1) _elEditRule1.style.display = 'none';
        _this.administerRuleDialog();
      });
      offNS("CFeditorConditionRuleClose");
      onNS(document, "click.CFeditorConditionRuleClose", "#luckysheet-editorConditionRule-dialog-close", function () {
        //编辑规则隐藏，管理规则显�?
        const _elEditRule2 = document.getElementById("luckysheet-editorConditionRule-dialog"); if (_elEditRule2) _elEditRule2.style.display = 'none';
        conditionformatDialog.adminRule.show();
        //隐藏虚线�?
        formulaRangeSelect.hide();
        countShow.row.hide();
        countShow.column.hide();
      });
}
