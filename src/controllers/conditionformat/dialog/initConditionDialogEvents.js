import { parseConditionRange } from '../rangeParser.js';
import { getSheetIndex } from '../../../methods/get';
import { getCurrentFile } from '../../../utils/storeAccess.js';
import Store from '../../../store';
import locale from '../../../locale/locale';
import { getPicker } from '../../../components/ColorPicker';

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
  
          let result = parseConditionRange(v, _this, conditionformat_Text);
          if (result == null) {
            return;
          }
          conditionRange.push(...result.conditionRange);
          conditionValue.push(...result.conditionValue);
        } else if (conditionName == "betweenness") {
          //介于
          let v1 = $("#luckysheet-conditionformat-dialog #conditionVal").val().trim();
          let v2 = $("#luckysheet-conditionformat-dialog #conditionVal2").val().trim();
  
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
          textcolor = getPicker(document.getElementById("textcolorshow"))?.get('hex') || "#000";
        } else {
          textcolor = null;
        }
        let cellcolor;
        if ($("#checkCellColor").is(":checked")) {
          cellcolor = getPicker(document.getElementById("cellcolorshow"))?.get('hex') || "#fff";
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
        let ruleArr = getCurrentFile()["luckysheet_conditionformat_save"] == undefined ? [] : getCurrentFile()["luckysheet_conditionformat_save"];
        ruleArr.push(rule);
        getCurrentFile()["luckysheet_conditionformat_save"] = ruleArr;
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
