import { onNS, offNS } from '../../../utils/migrationHelpers.js';
import { parseConditionRange } from '../rangeParser.js';
import { getSheetIndex } from '../../../methods/get';
import { getCurrentFile } from '../../../utils/storeAccess.js';
import Store from '../../../store';
import locale from '../../../locale/locale';
import { getPicker } from '../../../components/ColorPicker';
import { hideModalMask } from '../../../utils/domUtils.js';
import conditionformatDialog from '../../../ui/conditionformatDialog.js';

export function initConditionDialogEvents(_this) {
      const conditionformat_Text = locale().conditionformat;
      // 删除规则
      offNS("CFdeleteConditionRule");
      onNS(document, "click.CFdeleteConditionRule", "#deleteConditionRule", function () {
        let sheetIndex = conditionformatDialog.adminRule.find(".chooseSheet option:selected").val();
        let itemIndex = conditionformatDialog.adminRule.find(".ruleList .listBox .item.on").attr("data-item");
        _this.fileClone[getSheetIndex(sheetIndex)]["luckysheet_conditionformat_save"].splice(itemIndex, 1);
        _this.administerRuleDialog();
      });
  
      // 规则子菜单弹出层 点击确定修改样式
      offNS("CFdefault");
      onNS(document, "click.CFdefault", "#luckysheet-conditionformat-dialog-confirm", function () {
        //条件名称
        let conditionName = conditionformatDialog.main.find(".box").attr("data-itemvalue");
  
        //条件单元�?
        let conditionRange = [];
  
        //条件�?
        let conditionValue = [];
        if (conditionName == "greaterThan" || conditionName == "lessThan" || conditionName == "equal" || conditionName == "textContains") {
          let v = conditionformatDialog.main.find("#conditionVal").val().trim();
  
          let result = parseConditionRange(v, _this, conditionformat_Text);
          if (result == null) {
            return;
          }
          conditionRange.push(...result.conditionRange);
          conditionValue.push(...result.conditionValue);
        } else if (conditionName == "betweenness") {
          //介于
          let v1 = conditionformatDialog.main.find("#conditionVal").val().trim();
          let v2 = conditionformatDialog.main.find("#conditionVal2").val().trim();
  
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
        } else if (conditionName == "occurrenceDate") {
          //日期
          let v = conditionformatDialog.main.find("#daterange-btn").val();
          if (v == "" || v == null) {
            _this.infoDialog(conditionformat_Text.pleaseSelectADate, "");
            return;
          }
          conditionValue.push(v);
        } else if (conditionName == "duplicateValue") {
          //重复�?
          conditionValue.push(conditionformatDialog.main.find("#conditionVal option:selected").val());
        } else if (conditionName == "top10" || conditionName == "top10%" || conditionName == "last10" || conditionName == "last10%") {
          let v = conditionformatDialog.main.find("#conditionVal").val().trim();
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
        if (document.getElementById("checkTextColor")?.checked) {
          textcolor = getPicker(document.getElementById("textcolorshow"))?.get('hex') || "#000";
        } else {
          textcolor = null;
        }
        let cellcolor;
        if (document.getElementById("checkCellColor")?.checked) {
          cellcolor = getPicker(document.getElementById("cellcolorshow"))?.get('hex') || "#fff";
        } else {
          cellcolor = null;
        }
  
        //保存之前的规�?
        let fileH = structuredClone(Store.luckysheetfile);
        let historyRules = _this.getHistoryRules(fileH);
  
        //保存当前的规�?
        let rule = {
          "type": "default",
          "cellrange": structuredClone(Store.luckysheet_select_save),
          "format": {
            "textColor": textcolor,
            "cellColor": cellcolor
          },
          "conditionName": conditionName,
          "conditionRange": conditionRange,
          "conditionValue": conditionValue
        };
        let ruleArr = getCurrentFile()["luckysheet_conditionformat_save"] == undefined ? [] : getCurrentFile()["luckysheet_conditionformat_save"];
        ruleArr.push(rule);
        getCurrentFile()["luckysheet_conditionformat_save"] = ruleArr;
        let fileC = structuredClone(Store.luckysheetfile);
        let currentRules = _this.getCurrentRules(fileC);
  
        //刷新一次表�?
        _this.ref(historyRules, currentRules);
  
        //隐藏一些dom
        hideModalMask();
        conditionformatDialog.main.hide();
      });
  
      // 图标集弹出层 选择
      offNS("CFicons");
      onNS(document, "click.CFicons", "#luckysheet-CFicons-dialog .item", function () {
        hideModalMask();
        const _elCFicons = document.getElementById("luckysheet-CFicons-dialog"); if (_elCFicons) _elCFicons.style.display = 'none';
        if (Store.luckysheet_select_save.length > 0) {
          let cellrange = structuredClone(Store.luckysheet_select_save);
          let format = {
            "len": this.getAttribute("data-len"),
            "leftMin": this.getAttribute("data-leftMin"),
            "top": this.getAttribute("data-top")
          };
          _this.updateItem("icons", cellrange, format);
        }
      });
}
