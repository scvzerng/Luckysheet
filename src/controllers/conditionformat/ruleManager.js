import { getSheetIndex, getRangetxt } from "../../methods/get";
import { replaceHtml, getObjType, chatatABC } from "../../utils/util";
import formula from "../../global/formula";
import { isRealNull, isEditMode } from "../../global/validate";
import tooltip from "../../global/tooltip";
import { luckysheetrefreshgrid } from "../../global/refresh";
import { getcellvalue } from "../../global/getdata";
import { genarate } from "../../global/format";
import { modelHTML, luckysheet_CFiconsImg } from "../constant";
import { selectionCopyShow } from "../select";
import sheetmanage from "../sheetmanage";
import locale from "../../locale/locale";
import Store from "../../store";
import dayjs from 'dayjs';

//条件格式
const ruleManagerModule = {
  getConditionRuleList: function (index) {
    let _this = this;
    $("#luckysheet-administerRule-dialog .ruleList .listBox").empty();
    let ruleArr = _this.fileClone[getSheetIndex(index)].luckysheet_conditionformat_save; //条件格式规则集合
    if (ruleArr != null && ruleArr.length > 0) {
      const conditionformat_Text = locale().conditionformat;
      for (let i = 0; i < ruleArr.length; i++) {
        let type = ruleArr[i]["type"]; //规则类型
        let format = ruleArr[i]["format"]; //规则样式
        let cellrange = ruleArr[i]["cellrange"]; //规则应用范围

        let ruleName; //规则名称
        let formatHtml = ''; //样式dom
        if (type == "dataBar") {
          ruleName = conditionformat_Text.dataBar;
          formatHtml = '<canvas width="46" height="18" style="width: 46px;height: 18px;margin: 3px 0 0 5px;"></canvas>';
        } else if (type == "colorGradation") {
          ruleName = conditionformat_Text.colorGradation;
          formatHtml = '<canvas width="46" height="18" style="width: 46px;height: 18px;margin: 3px 0 0 5px;"></canvas>';
        } else if (type == "icons") {
          ruleName = conditionformat_Text.icons;
          formatHtml = '<canvas width="46" height="18" style="width: 46px;height: 18px;margin: 3px 0 0 5px;"></canvas>';
        } else {
          ruleName = _this.getConditionRuleName(ruleArr[i].conditionName, ruleArr[i].conditionRange, ruleArr[i].conditionValue);
          if (format["textColor"] != null) {
            formatHtml += '<span class="colorbox" title="' + conditionformat_Text.textColor + '" style="background-color:' + format["textColor"] + '"></span>';
          }
          if (format["cellColor"] != null) {
            formatHtml += '<span class="colorbox" title="' + conditionformat_Text.cellColor + '" style="background-color:' + format["cellColor"] + '"></span>';
          }
        }

        //应用范围dom
        let rangeTxtArr = [];
        for (let s = 0; s < cellrange.length; s++) {
          let r1 = cellrange[s].row[0],
            r2 = cellrange[s].row[1];
          let c1 = cellrange[s].column[0],
            c2 = cellrange[s].column[1];
          rangeTxtArr.push(chatatABC(c1) + (r1 + 1) + ":" + chatatABC(c2) + (r2 + 1));
        }

        //条件格式规则列表dom
        let itemHtml = '<div class="item" data-item="' + i + '">' + '<div class="ruleName" title="' + ruleName + '">' + ruleName + '</div>' + '<div class="format">' + formatHtml + '</div>' + '<div class="ruleRange">' + '<input class="formulaInputFocus" readonly="true" value="' + rangeTxtArr.join(",") + '"/>' + '<i class="fa fa-table" aria-hidden="true" title="' + conditionformat_Text.selectRange + '"></i>' + '</div>' + '</div>';
        $("#luckysheet-administerRule-dialog .ruleList .listBox").prepend(itemHtml);
      }
      $("#luckysheet-administerRule-dialog .ruleList .listBox .item canvas").each(function (i) {
        let x = $(this).closest(".item").attr("data-item");
        let type = ruleArr[x]["type"];
        let format = ruleArr[x]["format"];
        let can = $(this).get(0).getContext("2d");
        if (type == "dataBar") {
          if (format.length == 2) {
            let my_gradient = can.createLinearGradient(0, 0, 46, 0);
            my_gradient.addColorStop(0, format[0]);
            my_gradient.addColorStop(1, format[1]);
            can.fillStyle = my_gradient;
            can.fillRect(0, 0, 46, 18);
            can.beginPath();
            can.moveTo(0, 0);
            can.lineTo(0, 18);
            can.lineTo(46, 18);
            can.lineTo(46, 0);
            can.lineTo(0, 0);
            can.lineWidth = Store.devicePixelRatio;
            can.strokeStyle = format[0];
            can.stroke();
            can.closePath();
          } else if (format.length == 1) {
            can.fillStyle = format[0];
            can.fillRect(0, 0, 46, 18);
            can.beginPath();
            can.moveTo(0, 0);
            can.lineTo(0, 18);
            can.lineTo(46, 18);
            can.lineTo(46, 0);
            can.lineTo(0, 0);
            can.lineWidth = Store.devicePixelRatio;
            can.strokeStyle = format[0];
            can.stroke();
            can.closePath();
          }
        } else if (type == "colorGradation") {
          let my_gradient = can.createLinearGradient(0, 0, 46, 0);
          if (format.length == 3) {
            my_gradient.addColorStop(0, format[0]);
            my_gradient.addColorStop(0.5, format[1]);
            my_gradient.addColorStop(1, format[2]);
          } else if (format.length == 2) {
            my_gradient.addColorStop(0, format[0]);
            my_gradient.addColorStop(1, format[1]);
          }
          can.fillStyle = my_gradient;
          can.fillRect(0, 0, 46, 18);
        } else if (type == "icons") {
          let len = format["len"];
          let l = format["leftMin"];
          let t = format["top"];
          let w1 = 32 * len + 10 * (len - 1);
          let h1 = 32;
          let w2 = 46;
          let h2 = 46 * 32 / w1;
          if (l == "0") {
            can.drawImage(luckysheet_CFiconsImg, 0, t * 32, w1, h1, 0, (18 - h2) / 2, w2, h2);
          } else if (l == "5") {
            can.drawImage(luckysheet_CFiconsImg, 210, t * 32, w1, h1, 0, (18 - h2) / 2, w2, h2);
          }
        }
      });
      $("#luckysheet-administerRule-dialog .ruleList .listBox .item").eq(0).addClass("on");
    }
  },
  getConditionRuleName: function (conditionName, conditionRange, conditionValue) {
    //v 有条件单元格取条件单元格，若无取条件值
    let v;
    if (conditionRange[0] != null) {
      v = chatatABC(conditionRange[0]["column"][0]) + (conditionRange[0]["row"][0] + 1);
    } else {
      v = conditionValue[0];
    }
    const conditionformat_Text = locale().conditionformat;

    //返回条件格式规则名称
    if (conditionName == "greaterThan") {
      return conditionformat_Text.cellValue + " > " + v;
    } else if (conditionName == "lessThan") {
      return conditionformat_Text.cellValue + " < " + v;
    } else if (conditionName == "betweenness") {
      let v2;
      if (conditionRange[1] != null) {
        v2 = chatatABC(conditionRange[1]["column"][0]) + (conditionRange[1]["row"][0] + 1);
      } else {
        v2 = conditionValue[1];
      }
      return conditionformat_Text.cellValue + " " + conditionformat_Text.between + " " + v + " " + conditionformat_Text.in + " " + v2 + " " + conditionformat_Text.between2;
    } else if (conditionName == "equal") {
      return conditionformat_Text.cellValue + " = " + v;
    } else if (conditionName == "textContains") {
      return conditionformat_Text.cellValue + conditionformat_Text.contain + " =" + v;
    } else if (conditionName == "occurrenceDate") {
      return conditionValue;
    } else if (conditionName == "duplicateValue") {
      if (conditionValue == "0") {
        return conditionformat_Text.duplicateValue;
      }
      if (conditionValue == "1") {
        return conditionformat_Text.uniqueValue;
      }
    } else if (conditionName == "top10") {
      return conditionformat_Text.top + " " + v + " " + conditionformat_Text.oneself;
    } else if (conditionName == "top10%") {
      return conditionformat_Text.top + " " + v + "% " + conditionformat_Text.oneself;
    } else if (conditionName == "last10") {
      return conditionformat_Text.last + " " + v + " " + conditionformat_Text.oneself;
    } else if (conditionName == "last10%") {
      return conditionformat_Text.last + " " + v + "% " + conditionformat_Text.oneself;
    } else if (conditionName == "AboveAverage") {
      return conditionformat_Text.aboveAverage;
    } else if (conditionName == "SubAverage") {
      return conditionformat_Text.belowAverage;
    } else if (conditionName == "formula") {
      if (v.slice(0, 1) != '=') {
        v = '=' + v;
      }
      return conditionformat_Text.formula + ': ' + v;
    }
  },
  updateItem: function (type, cellrange, format) {
    let _this = this;
    let index = getSheetIndex(Store.currentSheetIndex);

    //保存之前的规则
    let fileH = $.extend(true, [], Store.luckysheetfile);
    let historyRules = _this.getHistoryRules(fileH);

    //保存当前的规则
    let ruleArr;
    if (type == "delSheet") {
      ruleArr = [];
    } else {
      let rule = {
        "type": type,
        "cellrange": cellrange,
        "format": format
      };
      ruleArr = Store.luckysheetfile[index]["luckysheet_conditionformat_save"] == null ? [] : Store.luckysheetfile[index]["luckysheet_conditionformat_save"];
      ruleArr.push(rule);
    }
    Store.luckysheetfile[index]["luckysheet_conditionformat_save"] = ruleArr;
    let fileC = $.extend(true, [], Store.luckysheetfile);
    let currentRules = _this.getCurrentRules(fileC);

    //刷新一次表格
    _this.ref(historyRules, currentRules);
  },
  getHistoryRules: function (fileH) {
    let historyRules = [];
    for (let h = 0; h < fileH.length; h++) {
      historyRules.push({
        "sheetIndex": fileH[h]["index"],
        "luckysheet_conditionformat_save": fileH[h]["luckysheet_conditionformat_save"]
      });
    }
    return historyRules;
  },
  getCurrentRules: function (fileC) {
    let currentRules = [];
    for (let c = 0; c < fileC.length; c++) {
      currentRules.push({
        "sheetIndex": fileC[c]["index"],
        "luckysheet_conditionformat_save": fileC[c]["luckysheet_conditionformat_save"]
      });
    }
    return currentRules;
  },
  ref: function (historyRules, currentRules) {
    if (Store.clearjfundo) {
      Store.jfundo.length = 0;
      let redo = {};
      redo["type"] = "updateCF";
      redo["data"] = {
        "historyRules": historyRules,
        "currentRules": currentRules
      };
      Store.jfredo.push(redo);
    }
    setTimeout(function () {
      luckysheetrefreshgrid();
    }, 1);
  }
};
export default ruleManagerModule;