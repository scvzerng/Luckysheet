import { onNS, offNS } from '../../../utils/migrationHelpers.js';
import { parseConditionRange } from '../rangeParser.js';
import tooltip from '../../../global/tooltip';
import { isEditMode } from '../../../global/validate';
import { getSheetIndex } from '../../../methods/get';
import { getCurrentFile } from '../../../utils/storeAccess.js';
import Store from '../../../store';
import locale from '../../../locale/locale';
import { getPicker } from '../../../components/ColorPicker';
import { hideModalMask } from '../../../utils/domUtils.js';
import countShow from '../../../ui/countShow.js';
import formulaRangeSelect from '../../../ui/formulaRangeSelect.js';
import conditionformatDialog from '../../../ui/conditionformatDialog.js';

export function initNewRuleEvents(_this) {
      const conditionformat_Text = locale().conditionformat;
      // 新建规则
      offNS("CFnewConditionRule");
      onNS(document, "click.CFnewConditionRule", "#newConditionRule", function () {
        let sheetIndex = conditionformatDialog.adminRule.find(".chooseSheet option:checked")?.value;
        if (Store.selections.length == 0) {
          if (isEditMode()) {
            alert(conditionformat_Text.pleaseSelectRange);
          } else {
            tooltip.info(conditionformat_Text.pleaseSelectRange, "");
          }
          return;
        }
        _this.newConditionRuleDialog(1);
      });
      offNS("CFnewConditionRuleConfirm");
      onNS(document, "click.CFnewConditionRuleConfirm", "#luckysheet-newConditionRule-dialog-confirm", function () {
        let _newDlg = document.getElementById("luckysheet-newConditionRule-dialog");
        let index = Array.from(_newDlg.querySelector(".ruleTypeItem.on")?.parentElement?.children || []).indexOf(_newDlg.querySelector(".ruleTypeItem.on"));
        let type1 = _newDlg.querySelector("#type1")?.value;
        let type2 = _newDlg.querySelector("." + type1 + "Box #type2")?.value;
        let format, rule;
        if (index == 0) {
          if (type1 == "dataBar") {
            //数据�?
            let color = getPicker(document.querySelector("#luckysheet-newConditionRule-dialog .dataBarBox .luckysheet-conditionformat-config-color"))?.get('hex') || "#000";
            if (type2 == "gradient") {
              //渐变填充
              format = [color, "#ffffff"];
            } else if (type2 == "solid") {
              //实心填充
              format = [color];
            }
            rule = {
              "type": "dataBar",
              "cellrange": structuredClone(Store.selections),
              "format": format
            };
          } else if (type1 == "colorGradation") {
            //色阶
            let maxcolor = getPicker(document.querySelector("#luckysheet-newConditionRule-dialog .colorGradationBox .maxVal .luckysheet-conditionformat-config-color"))?.get('rgb') || "rgb(0, 0, 0)";
            let midcolor = getPicker(document.querySelector("#luckysheet-newConditionRule-dialog .colorGradationBox .midVal .luckysheet-conditionformat-config-color"))?.get('rgb') || "rgb(0, 0, 0)";
            let mincolor = getPicker(document.querySelector("#luckysheet-newConditionRule-dialog .colorGradationBox .minVal .luckysheet-conditionformat-config-color"))?.get('rgb') || "rgb(0, 0, 0)";
            if (type2 == "threeColor") {
              //三色
              format = [maxcolor, midcolor, mincolor];
            } else if (type2 == "twoColor") {
              //双色
              format = [maxcolor, mincolor];
            }
            rule = {
              "type": "colorGradation",
              "cellrange": structuredClone(Store.selections),
              "format": format
            };
          } else if (type1 == "icons") {
            //图标�?
            let _newIconsModel = _newDlg.querySelector(".iconsBox .model");
            let len = _newIconsModel?.getAttribute("data-len");
            let leftMin = _newIconsModel?.getAttribute("data-leftmin");
            let top = _newIconsModel?.getAttribute("data-top");
            format = {
              "len": len,
              "leftMin": leftMin,
              "top": top
            };
            rule = {
              "type": "icons",
              "cellrange": structuredClone(Store.selections),
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
                let v1 = _newDlg.querySelector("#conditionVal input")?.value?.trim();
                let v2 = _newDlg.querySelector("#conditionVal2 input")?.value?.trim();
  
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
                let v = _newDlg.querySelector("#conditionVal input")?.value?.trim();
  
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
              let v = _newDlg.querySelector("#conditionVal input")?.value?.trim();
  
              let result = parseConditionRange(v, _this, conditionformat_Text, { allowNonNumeric: true });
              if (result == null) {
                return;
              }
              conditionRange.push(...result.conditionRange);
              conditionValue.push(...result.conditionValue);
            } else if (type1 == "date") {
              //发生日期
              conditionName = "occurrenceDate";
  
              //条件�?
              let v = _newDlg.querySelector("#daterange-btn")?.value;
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
              if (_newDlg.querySelector("#isPercent")?.checked) {
                conditionName = "top10%";
              } else {
                conditionName = "top10";
              }
            } else if (type1 == "last") {
              if (_newDlg.querySelector("#isPercent")?.checked) {
                conditionName = "last10%";
              } else {
                conditionName = "last10";
              }
            }
  
            //条件�?
            let v = _newDlg.querySelector("#conditionVal input")?.value?.trim();
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
            let v = _newDlg.querySelector("#formulaConditionVal input")?.value?.trim();
            if (v == "") {
              _this.infoDialog("Condition value cannot be empty!", "");
              return;
            }
            conditionValue.push(v);
          }
  
          //格式颜色
          let textcolor;
          if (_newDlg.querySelector("#checkTextColor")?.checked) {
            textcolor = getPicker(document.querySelector("#luckysheet-newConditionRule-dialog #textcolorshow"))?.get('hex') || "#000";
          } else {
            textcolor = null;
          }
          let cellcolor;
          if (_newDlg.querySelector("#checkCellColor")?.checked) {
            cellcolor = getPicker(document.querySelector("#luckysheet-newConditionRule-dialog #cellcolorshow"))?.get('hex') || "#000";
          } else {
            cellcolor = null;
          }
          format = {
            "textColor": textcolor,
            "cellColor": cellcolor
          };
          rule = {
            "type": "default",
            "cellrange": structuredClone(Store.selections),
            "format": format,
            "conditionName": conditionName,
            "conditionRange": conditionRange,
            "conditionValue": conditionValue
          };
        }
        const _elNewRule1 = document.getElementById("luckysheet-newConditionRule-dialog"); if (_elNewRule1) _elNewRule1.style.display = 'none';
  
        //新建规则的入�?
        let source = this.getAttribute("data-source");
        if (source == 0) {
          hideModalMask();
  
          //保存之前的规�?
          let fileH = structuredClone(Store.luckysheetfile);
          let historyRules = _this.getHistoryRules(fileH);
  
          //保存当前的规�?
          let ruleArr = getCurrentFile()["luckysheet_conditionformat_save"] == undefined ? [] : getCurrentFile()["luckysheet_conditionformat_save"];
          ruleArr.push(rule);
          getCurrentFile()["luckysheet_conditionformat_save"] = ruleArr;
          let fileC = structuredClone(Store.luckysheetfile);
          let currentRules = _this.getCurrentRules(fileC);
  
          //刷新一次表�?
          _this.ref(historyRules, currentRules);
        } else if (source == 1) {
          //临时存储新规�?
          let ruleArr = _this.fileClone[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"] ? _this.fileClone[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"] : [];
          ruleArr.push(rule);
          _this.fileClone[getSheetIndex(Store.currentSheetIndex)]["luckysheet_conditionformat_save"] = ruleArr;
  
          //新建规则隐藏，管理规则显�?
          _this.administerRuleDialog();
        }
      });
      offNS("CFnewConditionRuleClose");
      onNS(document, "click.CFnewConditionRuleClose", "#luckysheet-newConditionRule-dialog-close", function () {
        //新建规则的入�?
        let source = this.getAttribute("data-source");
        if (source == 0) {
          hideModalMask();
        }
        if (source == 1) {
          conditionformatDialog.adminRule.show();
        }
  
        //新建规则隐藏
        const _elNewRule2 = document.getElementById("luckysheet-newConditionRule-dialog"); if (_elNewRule2) _elNewRule2.style.display = 'none';
  
        //隐藏虚线�?
        formulaRangeSelect.hide();
        countShow.row.hide();
        countShow.column.hide();
      });
}
