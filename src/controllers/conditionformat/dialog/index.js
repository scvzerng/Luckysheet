import {  getRangetxt  } from "../../../methods/get";
import {  replaceHtml } from "../../../utils/util";
import {  modelHTML } from "../../constant";
import { selectionCopyShow } from "../../select";
import luckysheetConfigsetting from "../../luckysheetConfigsetting";
import locale from "../../../locale/locale";
import Store from "../../../store";
import dayjs from 'dayjs';
import { createColorPicker, getPicker, STANDARD_PALETTE } from '../../../components/ColorPicker';
import '../../../components/ColorPicker/colorPicker.css';
import { showModalMask, hideModalMask } from '../../../utils/domUtils.js';
import formulaDialogs from '../../../ui/formulaDialogs.js';
import conditionformatDialog from '../../../ui/conditionformatDialog.js';

import { initAdminRuleEvents } from './initAdminRuleEvents.js';
import { initNewRuleEvents } from './initNewRuleEvents.js';
import { initEditRuleEvents } from './initEditRuleEvents.js';
import { initRuleTypeEvents } from './initRuleTypeEvents.js';
import { initConditionDialogEvents } from './initConditionDialogEvents.js';
import { initRangeAndCloseEvents } from './initRangeAndCloseEvents.js';

const dialogModule = {
  ruleTypeHtml: function () {
    const conditionformat_Text = locale().conditionformat;
    return `<div class="ruleTypeBox">
                        <div class="ruleTypeItem">
                            <span class="icon iconfont-luckysheet luckysheet-iconfont-youjiantou"></span>
                            <span>${conditionformat_Text.ruleTypeItem1}</span>
                        </div>
                        <div class="ruleTypeItem">
                            <span class="icon iconfont-luckysheet luckysheet-iconfont-youjiantou"></span>
                            <span>${conditionformat_Text.ruleTypeItem2}</span>
                        </div>
                        <div class="ruleTypeItem">
                            <span class="icon iconfont-luckysheet luckysheet-iconfont-youjiantou"></span>
                            <span>${conditionformat_Text.ruleTypeItem3}</span>
                        </div>
                        <div class="ruleTypeItem">
                            <span class="icon iconfont-luckysheet luckysheet-iconfont-youjiantou"></span>
                            <span>${conditionformat_Text.ruleTypeItem4}</span>
                        </div>
                        <div class="ruleTypeItem">
                            <span class="icon iconfont-luckysheet luckysheet-iconfont-youjiantou"></span>
                            <span>${conditionformat_Text.ruleTypeItem5}</span>
                        </div>
                        <div class="ruleTypeItem">
                            <span class="icon iconfont-luckysheet luckysheet-iconfont-youjiantou"></span>
                            <span>${conditionformat_Text.ruleTypeItem6}</span>
                        </div>
                    </div>`;
  },
  textCellColorHtml: function () {
    const conditionformat_Text = locale().conditionformat;
    return `<div id="textCellColor">
                        <div class="colorbox">
                            <input id="checkTextColor" type="checkbox" checked="checked">
                            <label for="checkTextColor">${conditionformat_Text.textColor}�?/label>
                            <input id="textcolorshow" data-tips="${conditionformat_Text.textColor}" data-func="background" class="luckysheet-conditionformat-config-color" type="text" value="#9c0006" style="display: none;">
                        </div>
                        <div class="colorbox">
                            <input id="checkCellColor" type="checkbox" checked="checked">
                            <label for="checkCellColor">${conditionformat_Text.cellColor}�?/label>
                            <input id="cellcolorshow" data-tips="${conditionformat_Text.cellColor}" data-func="background" class="luckysheet-conditionformat-config-color" type="text" value="#ffc7ce" style="display: none;">
                        </div>
                    </div>`;
  },
  init: function () {
    let _this = this;
    const conditionformat_Text = locale().conditionformat;
    initAdminRuleEvents(_this);
    initNewRuleEvents(_this);
    initEditRuleEvents(_this);
    initRuleTypeEvents(_this);
    initConditionDialogEvents(_this);
    initRangeAndCloseEvents(_this);
  },
    singleRangeDialog: function (source, value) {
    hideModalMask();
    formulaDialogs.singleRange.remove();
    const conditionformat_Text = locale().conditionformat;
    $("body").append(replaceHtml(modelHTML, {
      "id": "luckysheet-singleRange-dialog",
      "addclass": "luckysheet-singleRange-dialog",
      "title": conditionformat_Text.selectCell,
      "content": `<input readonly="readonly" placeholder="${conditionformat_Text.pleaseSelectCell}" value="${value}"/>`,
      "botton": `<button id="luckysheet-singleRange-dialog-confirm" class="btn btn-primary" data-source="${source}">${conditionformat_Text.confirm}</button>
                        <button id="luckysheet-singleRange-dialog-close" class="btn btn-default" data-source="${source}">${conditionformat_Text.cancel}</button>`,
      "style": "z-index:100003"
    }));
    let $t = formulaDialogs.singleRange.el.find(".luckysheet-modal-dialog-content").css("min-width", 300).end(),
      myh = $t.outerHeight(),
      myw = $t.outerWidth();
    let winw = document.documentElement.clientWidth,
      winh = document.documentElement.clientHeight;
    let scrollLeft = document.documentElement.scrollLeft,
      scrollTop = document.documentElement.scrollTop;
    formulaDialogs.singleRange.showAt({
      "left": (winw + scrollLeft - myw) / 2,
      "top": (winh + scrollTop - myh) / 3
    });
  },
  multiRangeDialog: function (dataItem, value) {
    let _this = this;
    hideModalMask();
    formulaDialogs.multiRange.remove();
    const conditionformat_Text = locale().conditionformat;
    $("body").append(replaceHtml(modelHTML, {
      "id": "luckysheet-multiRange-dialog",
      "addclass": "luckysheet-multiRange-dialog",
      "title": conditionformat_Text.selectRange,
      "content": `<input readonly="readonly" placeholder="${conditionformat_Text.pleaseSelectRange}" value="${value}"/>`,
      "botton": `<button id="luckysheet-multiRange-dialog-confirm" class="btn btn-primary" data-item="${dataItem}">${conditionformat_Text.confirm}</button>
                        <button id="luckysheet-multiRange-dialog-close" class="btn btn-default">${conditionformat_Text.cancel}</button>`,
      "style": "z-index:100003"
    }));
    let $t = formulaDialogs.multiRange.el.find(".luckysheet-modal-dialog-content").css("min-width", 300).end(),
      myh = $t.outerHeight(),
      myw = $t.outerWidth();
    let winw = document.documentElement.clientWidth,
      winh = document.documentElement.clientHeight;
    let scrollLeft = document.documentElement.scrollLeft,
      scrollTop = document.documentElement.scrollTop;
    formulaDialogs.multiRange.showAt({
      "left": (winw + scrollLeft - myw) / 2,
      "top": (winh + scrollTop - myh) / 3
    });
    selectionCopyShow(_this.getRangeByTxt(value));
  },
  conditionformatDialog: function (title, content) {
    let _this = this;
    showModalMask();
    conditionformatDialog.main.remove();
    const conditionformat_Text = locale().conditionformat;
    $("body").append(replaceHtml(modelHTML, {
      "id": "luckysheet-conditionformat-dialog",
      "addclass": "luckysheet-conditionformat-dialog",
      "title": title,
      "content": content,
      "botton": `<button id="luckysheet-conditionformat-dialog-confirm" class="btn btn-primary">${conditionformat_Text.confirm}</button>
                        <button class="btn btn-default luckysheet-model-close-btn">${conditionformat_Text.cancel}</button>`,
      "style": "z-index:9999"
    }));
    let $t = conditionformatDialog.main.find(".luckysheet-modal-dialog-content").css("min-width", 300).end(),
      myh = $t.outerHeight(),
      myw = $t.outerWidth();
    let winw = document.documentElement.clientWidth,
      winh = document.documentElement.clientHeight;
    let scrollLeft = document.documentElement.scrollLeft,
      scrollTop = document.documentElement.scrollTop;
    conditionformatDialog.main.el.css({
      "left": (winw + scrollLeft - myw) / 2,
      "top": (winh + scrollTop - myh) / 3
    }).show();
    _this.init();
    _this.colorSelectInit();
    if (title == locale().conditionformat.conditionformat_occurrenceDate) {
      _this.daterangeInit("luckysheet-conditionformat-dialog");
    }
  },
  CFiconsDialog: function () {
    showModalMask();
    $("#luckysheet-CFicons-dialog").remove();
    const conditionformat_Text = locale().conditionformat;
    let content = `<div class="box">
                            <div style="margin-bottom: 10px;">${conditionformat_Text.pleaseSelectIcon}</div>
                            <div class="title">${conditionformat_Text.direction}</div>
                            <div class="list">
                                <div class="left">
                                    <div class="item" data-len="3" data-leftMin="0" data-top="0" title="${conditionformat_Text.threeWayArrow}(${conditionformat_Text.multicolor})"><div style="background-position:0 0;"></div></div>
                                    <div class="item" data-len="3" data-leftMin="0" data-top="1" title="${conditionformat_Text.threeTriangles}"><div style="background-position:0 -20px;"></div></div>
                                    <div class="item" data-len="4" data-leftMin="0" data-top="2" title="${conditionformat_Text.fourWayArrow}(${conditionformat_Text.multicolor})"><div style="background-position:0 -40px;"></div></div>
                                    <div class="item" data-len="5" data-leftMin="0" data-top="3" title="${conditionformat_Text.fiveWayArrow}(${conditionformat_Text.multicolor})"><div style="background-position:0 -60px;"></div></div>
                                </div>
                                <div class="right">
                                    <div class="item" data-len="3" data-leftMin="5" data-top="0" title="${conditionformat_Text.threeWayArrow}(${conditionformat_Text.grayColor})"><div style="background-position:-131px 0;"></div></div>
                                    <div class="item" data-len="4" data-leftMin="5" data-top="1" title="${conditionformat_Text.fourWayArrow}(${conditionformat_Text.grayColor})"><div style="background-position:-131px -20px;"></div></div>
                                    <div class="item" data-len="5" data-leftMin="5" data-top="2" title="${conditionformat_Text.fiveWayArrow}(${conditionformat_Text.grayColor})"><div style="background-position:-131px -40px;"></div></div>
                                </div>
                                <div style="clear:both;"></div>
                            </div>
                            <div class="title">${conditionformat_Text.shape}</div>
                            <div class="list">
                                <div class="left">
                                    <div class="item" data-len="3" data-leftMin="0" data-top="4" title="${conditionformat_Text.threeColorTrafficLight}(${conditionformat_Text.rimless})"><div style="background-position:0 -80px;"></div></div>
                                    <div class="item" data-len="3" data-leftMin="0" data-top="5" title="${conditionformat_Text.threeSigns}"><div style="background-position:0 -100px;"></div></div>
                                    <div class="item" data-len="4" data-leftMin="0" data-top="6" title="${conditionformat_Text.greenRedBlackGradient}"><div style="background-position:0 -120px;"></div></div>
                                </div>
                                <div class="right">
                                    <div class="item" data-len="3" data-leftMin="5" data-top="4" title="${conditionformat_Text.threeColorTrafficLight}(${conditionformat_Text.bordered})"><div style="background-position:-131px -80px;"></div></div>
                                    <div class="item" data-len="4" data-leftMin="5" data-top="5" title="${conditionformat_Text.fourColorTrafficLight}"><div style="background-position:-131px -100px;"></div></div>
                                </div>
                                <div style="clear:both;"></div>
                            </div>
                            <div class="title">${conditionformat_Text.mark}</div>
                            <div class="list">
                                <div class="left">
                                    <div class="item" data-len="3" data-leftMin="0" data-top="7" title="${conditionformat_Text.threeSymbols}(${conditionformat_Text.circled})"><div style="background-position:0 -140px;"></div></div>
                                    <div class="item" data-len="3" data-leftMin="0" data-top="8" title="${conditionformat_Text.tricolorFlag}"><div style="background-position:0 -160px;"></div></div>
                                </div>
                                <div class="right">
                                    <div class="item" data-len="3" data-leftMin="5" data-top="7" title="${conditionformat_Text.threeSymbols}(${conditionformat_Text.noCircle})"><div style="background-position:-131px -140px;"></div></div>
                                </div>
                                <div style="clear:both;"></div>
                            </div>
                            <div class="title">${conditionformat_Text.grade}</div>
                            <div class="list">
                                <div class="left">
                                    <div class="item" data-len="3" data-leftMin="0" data-top="9" title="${conditionformat_Text.threeStars}"><div style="background-position:0 -180px;"></div></div>
                                    <div class="item" data-len="5" data-leftMin="0" data-top="10" title="${conditionformat_Text.fiveQuadrantDiagram}"><div style="background-position:0 -200px;"></div></div>
                                    <div class="item" data-len="5" data-leftMin="0" data-top="11" title="${conditionformat_Text.fiveBoxes}"><div style="background-position:0 -220px;"></div></div>
                                </div>
                                <div class="right">
                                    <div class="item" data-len="4" data-leftMin="5" data-top="9" title="${conditionformat_Text.grade4}"><div style="background-position:-131px -180px;"></div></div>
                                    <div class="item" data-len="5" data-leftMin="5" data-top="10" title="${conditionformat_Text.grade5}"><div style="background-position:-131px -200px;"></div></div>
                                </div>
                                <div style="clear:both;"></div>
                            </div>
                        </div>`;
    $("body").append(replaceHtml(modelHTML, {
      "id": "luckysheet-CFicons-dialog",
      "addclass": "luckysheet-CFicons-dialog",
      "title": conditionformat_Text.icons,
      "content": content,
      "botton": `<button class="btn btn-default luckysheet-model-close-btn">${conditionformat_Text.close}</button>`,
      "style": "z-index:100003"
    }));
    let $t = $("#luckysheet-CFicons-dialog").find(".luckysheet-modal-dialog-content").css("min-width", 400).end(),
      myh = $t.outerHeight(),
      myw = $t.outerWidth();
    let winw = document.documentElement.clientWidth,
      winh = document.documentElement.clientHeight;
    let scrollLeft = document.documentElement.scrollLeft,
      scrollTop = document.documentElement.scrollTop;
    $("#luckysheet-CFicons-dialog").css({
      "left": (winw + scrollLeft - myw) / 2,
      "top": (winh + scrollTop - myh) / 3
    }).show();
  },
  administerRuleDialog: function () {
    showModalMask();
    conditionformatDialog.adminRule.remove();
    const conditionformat_Text = locale().conditionformat;

    //工作表
    let opHtml = '';
    for (let j = 0; j < Store.luckysheetfile.length; j++) {
      if (Store.luckysheetfile[j].status == "1") {
        opHtml += `<option value="${Store.luckysheetfile[j]["index"]}" selected="selected">
                                ${conditionformat_Text.currentSheet}：${Store.luckysheetfile[j]["name"]}
                            </option>`;
      } else {
        opHtml += `<option value="${Store.luckysheetfile[j]["index"]}">
                                ${conditionformat_Text.sheet}：${Store.luckysheetfile[j]["name"]}
                            </option>`;
      }
    }
    let content = `<div class="chooseSheet">
                            <label>${conditionformat_Text.showRules}：</label>
                            <select>${opHtml}</select>
                        </div>
                        <div class="ruleBox">
                            <div class="ruleBtn">
                                <button id="newConditionRule" class="btn btn-default">${conditionformat_Text.newRule}</button>
                                <button id="editorConditionRule" class="btn btn-default">${conditionformat_Text.editRule}</button>
                                <button id="deleteConditionRule" class="btn btn-default">${conditionformat_Text.deleteRule}</button>
                            </div>
                            <div class="ruleList">
                                <div class="listTitle">
                                    <span>${conditionformat_Text.rule}</span>
                                    <span>${conditionformat_Text.format}</span>
                                    <span>${conditionformat_Text.applyRange}</span>
                                </div>
                                <div class="listBox"></div>
                            </div>
                        </div>`;
    $("body").append(replaceHtml(modelHTML, {
      "id": "luckysheet-administerRule-dialog",
      "addclass": "luckysheet-administerRule-dialog",
      "title": conditionformat_Text.conditionformatManageRules,
      "content": content,
      "botton": `<button id="luckysheet-administerRule-dialog-confirm" class="btn btn-primary">${conditionformat_Text.confirm}</button>
                        <button id="luckysheet-administerRule-dialog-close" class="btn btn-default">${conditionformat_Text.close}</button>`,
      "style": "z-index:100003"
    }));
    let $t = conditionformatDialog.adminRule.find(".luckysheet-modal-dialog-content").css("min-width", 400).end(),
      myh = $t.outerHeight(),
      myw = $t.outerWidth();
    let winw = document.documentElement.clientWidth,
      winh = document.documentElement.clientHeight;
    let scrollLeft = document.documentElement.scrollLeft,
      scrollTop = document.documentElement.scrollTop;
    conditionformatDialog.adminRule.el.css({
      "left": (winw + scrollLeft - myw) / 2,
      "top": (winh + scrollTop - myh) / 3
    }).show();

    //当前工作表的规则列表
    let index = conditionformatDialog.adminRule.find(".chooseSheet option:selected").val();
    this.getConditionRuleList(index);
  },
  newConditionRuleDialog: function (source) {
    let _this = this;
    const conditionformat_Text = locale().conditionformat;

    //规则说明
    let ruleExplainHtml = _this.getRuleExplain(0);

    //弹出层
    showModalMask();
    conditionformatDialog.adminRule.hide();
    conditionformatDialog.newRule.remove();
    let content = '<div>' + '<div class="boxTitle">' + conditionformat_Text.chooseRuleType + '：</div>' + _this.ruleTypeHtml() + '<div class="boxTitle">' + conditionformat_Text.editRuleDescription + '：</div>' + '<div class="ruleExplainBox">' + ruleExplainHtml + '</div>' + '</div>';
    $("body").append(replaceHtml(modelHTML, {
      "id": "luckysheet-newConditionRule-dialog",
      "addclass": "luckysheet-newEditorRule-dialog",
      "title": conditionformat_Text.newFormatRule,
      "content": content,
      "botton": `<button id="luckysheet-newConditionRule-dialog-confirm" class="btn btn-primary" data-source="${source}">${conditionformat_Text.confirm}</button>
                        <button id="luckysheet-newConditionRule-dialog-close" class="btn btn-default" data-source="${source}">${conditionformat_Text.cancel}</button>`,
      "style": "z-index:100003"
    }));
    let $t = $("#luckysheet-newConditionRule-dialog").find(".luckysheet-modal-dialog-content").css("min-width", 400).end(),
      myh = $t.outerHeight(),
      myw = $t.outerWidth();
    let winw = document.documentElement.clientWidth,
      winh = document.documentElement.clientHeight;
    let scrollLeft = document.documentElement.scrollLeft,
      scrollTop = document.documentElement.scrollTop;
    $("#luckysheet-newConditionRule-dialog").css({
      "left": (winw + scrollLeft - myw) / 2,
      "top": (winh + scrollTop - myh) / 3
    }).show();

    //index的规则类型focus
    $("#luckysheet-newConditionRule-dialog .ruleTypeBox .ruleTypeItem:eq(0)").addClass("on").siblings().removeClass("on");
    _this.colorSelectInit();
  },
  editorConditionRuleDialog: function () {
    let _this = this;
    const conditionformat_Text = locale().conditionformat;
    let rule = _this.editorRule.data;
    if (rule == null) {
      return;
    }
    let ruleType = rule["type"],
      ruleFormat = rule["format"],
      conditionName = rule["conditionName"];
    let index, type1;
    if (ruleType == "dataBar" || ruleType == "colorGradation" || ruleType == "icons") {
      index = 0;
      type1 = ruleType;
    } else {
      if (conditionName == "greaterThan" || conditionName == "lessThan" || conditionName == "betweenness" || conditionName == "equal" || conditionName == "textContains" || conditionName == "occurrenceDate") {
        index = 1;
        if (conditionName == "greaterThan" || conditionName == "lessThan" || conditionName == "betweenness" || conditionName == "equal") {
          type1 = "number";
        } else if (conditionName == "textContains") {
          type1 = "text";
        } else if (conditionName == "occurrenceDate") {
          type1 = "date";
        }
      } else if (conditionName == "top10" || conditionName == "top10%" || conditionName == "last10" || conditionName == "last10%") {
        index = 2;
        if (conditionName == "top10" || conditionName == "top10%") {
          type1 = "top";
        } else if (conditionName == "last10" || conditionName == "last10%") {
          type1 = "last";
        }
      } else if (conditionName == "AboveAverage" || conditionName == "SubAverage") {
        index = 3;
        type1 = conditionName;
      } else if (conditionName == "duplicateValue") {
        index = 4;
        type1 = rule["conditionValue"];
      } else if (conditionName == "formula") {
        index = 5;
      }
    }

    //规则说明
    let ruleExplainHtml = _this.getRuleExplain(index);

    //弹出层
    showModalMask();
    conditionformatDialog.adminRule.hide();
    conditionformatDialog.editRule.remove();
    let content = '<div>' + '<div class="boxTitle">' + conditionformat_Text.chooseRuleType + '：</div>' + _this.ruleTypeHtml() + '<div class="boxTitle">' + conditionformat_Text.editRuleDescription + '：</div>' + '<div class="ruleExplainBox">' + ruleExplainHtml + '</div>' + '</div>';
    $("body").append(replaceHtml(modelHTML, {
      "id": "luckysheet-editorConditionRule-dialog",
      "addclass": "luckysheet-newEditorRule-dialog",
      "title": conditionformat_Text.editFormatRule,
      "content": content,
      "botton": `<button id="luckysheet-editorConditionRule-dialog-confirm" class="btn btn-primary">${conditionformat_Text.confirm}</button>
                        <button id="luckysheet-editorConditionRule-dialog-close" class="btn btn-default">${conditionformat_Text.cancel}</button>`,
      "style": "z-index:100003"
    }));
    let $t = $("#luckysheet-editorConditionRule-dialog").find(".luckysheet-modal-dialog-content").css("min-width", 400).end(),
      myh = $t.outerHeight(),
      myw = $t.outerWidth();
    let winw = document.documentElement.clientWidth,
      winh = document.documentElement.clientHeight;
    let scrollLeft = document.documentElement.scrollLeft,
      scrollTop = document.documentElement.scrollTop;
    $("#luckysheet-editorConditionRule-dialog").css({
      "left": (winw + scrollLeft - myw) / 2,
      "top": (winh + scrollTop - myh) / 3
    }).show();
    _this.colorSelectInit();

    //规则类型focus
    $("#luckysheet-editorConditionRule-dialog .ruleTypeBox .ruleTypeItem:eq(" + index + ")").addClass("on").siblings().removeClass("on");

    //type1
    $("#luckysheet-editorConditionRule-dialog #type1").val(type1);
    if (type1 == "dataBar" || type1 == "colorGradation" || type1 == "icons" || type1 == "number" || type1 == "text" || type1 == "date") {
      $("#luckysheet-editorConditionRule-dialog ." + type1 + "Box").show();
      $("#luckysheet-editorConditionRule-dialog ." + type1 + "Box").siblings().hide();
    }
    if (type1 == "date") {
      _this.daterangeInit("luckysheet-editorConditionRule-dialog");
    }

    //type2  format  value
    if (ruleType == "dataBar" || ruleType == "colorGradation" || ruleType == "icons") {
      if (type1 == "dataBar") {
        if (ruleFormat.length == 2) {
          $("#luckysheet-editorConditionRule-dialog .dataBarBox #type2").val("gradient");
        } else if (ruleFormat.length == 1) {
          $("#luckysheet-editorConditionRule-dialog .dataBarBox #type2").val("solid");
        }
        getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog .dataBarBox .luckysheet-conditionformat-config-color"))?.set(ruleFormat[0]);
      } else if (type1 == "colorGradation") {
        if (ruleFormat.length == 3) {
          $("#luckysheet-editorConditionRule-dialog .colorGradationBox #type2").val("threeColor");
          $("#luckysheet-editorConditionRule-dialog .colorGradationBox .midVal").show();
          getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog .colorGradationBox .maxVal .luckysheet-conditionformat-config-color"))?.set(ruleFormat[0]);
          getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog .colorGradationBox .midVal .luckysheet-conditionformat-config-color"))?.set(ruleFormat[1]);
          getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog .colorGradationBox .minVal .luckysheet-conditionformat-config-color"))?.set(ruleFormat[2]);
        } else if (ruleFormat.length == 2) {
          $("#luckysheet-editorConditionRule-dialog .colorGradationBox #type2").val("twoColor");
          $("#luckysheet-editorConditionRule-dialog .colorGradationBox .midVal").hide();
          getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog .colorGradationBox .maxVal .luckysheet-conditionformat-config-color"))?.set(ruleFormat[0]);
          getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog .colorGradationBox .minVal .luckysheet-conditionformat-config-color"))?.set(ruleFormat[1]);
        }
      } else if (type1 == "icons") {
        let len = ruleFormat["len"];
        let l = ruleFormat["leftMin"];
        let t = ruleFormat["top"];
        $("#luckysheet-editorConditionRule-dialog .iconsBox li").each(function (i, e) {
          if ($(e).find("div").attr("data-len") == len && $(e).find("div").attr("data-leftmin") == l && $(e).find("div").attr("data-top") == t) {
            $("#luckysheet-editorConditionRule-dialog .iconsBox .showbox .model").css("background-position", $(e).find("div").css("background-position"));
            $("#luckysheet-editorConditionRule-dialog .iconsBox .showbox .model").attr("data-len", $(e).find("div").attr("data-len"));
            $("#luckysheet-editorConditionRule-dialog .iconsBox .showbox .model").attr("data-leftmin", $(e).find("div").attr("data-leftmin"));
            $("#luckysheet-editorConditionRule-dialog .iconsBox .showbox .model").attr("data-top", $(e).find("div").attr("data-leftmin"));
            $("#luckysheet-editorConditionRule-dialog .iconsBox .showbox .model").attr("title", $(e).find("div").attr("title"));
            return true;
          }
        });
      }
    } else {
      if (type1 == "number") {
        $("#luckysheet-editorConditionRule-dialog .numberBox #type2").val(conditionName);
        let val1;
        if (rule.conditionRange[0] != null) {
          val1 = getRangetxt(Store.currentSheetIndex, {
            "row": rule.conditionRange[0]["row"],
            "column": rule.conditionRange[0]["column"]
          }, Store.currentSheetIndex);
        } else {
          val1 = rule.conditionValue[0];
        }
        $("#luckysheet-editorConditionRule-dialog .numberBox #conditionVal input").val(val1);
        if (conditionName == "betweenness") {
          $("#luckysheet-editorConditionRule-dialog .numberBox .txt").show();
          $("#luckysheet-editorConditionRule-dialog .numberBox #conditionVal2").show();
          let val2;
          if (rule.conditionRange[1] != null) {
            val2 = getRangetxt(Store.currentSheetIndex, {
              "row": rule.conditionRange[1]["row"],
              "column": rule.conditionRange[1]["column"]
            }, Store.currentSheetIndex);
          } else {
            val2 = rule.conditionValue[1];
          }
          $("#luckysheet-editorConditionRule-dialog .numberBox #conditionVal2 input").val(val2);
        } else {
          $("#luckysheet-editorConditionRule-dialog .numberBox .txt").hide();
          $("#luckysheet-editorConditionRule-dialog .numberBox #conditionVal2").hide();
        }
      } else if (type1 == "text") {
        let val1;
        if (rule.conditionRange[0] != null) {
          val1 = getRangetxt(Store.currentSheetIndex, {
            "row": rule.conditionRange[0]["row"],
            "column": rule.conditionRange[0]["column"]
          }, Store.currentSheetIndex);
        } else {
          val1 = rule.conditionValue[0];
        }
        $("#luckysheet-editorConditionRule-dialog .textBox #conditionVal input").val(val1);
      } else if (type1 == "date") {
        _this.daterangeInit("luckysheet-editorConditionRule-dialog");
        let val1 = rule.conditionValue[0];
        $("#luckysheet-editorConditionRule-dialog .dateBox #daterange-btn").val(val1);
      } else if (type1 == "top" || type1 == "last") {
        let val1 = rule.conditionValue[0];
        if (conditionName == "top10%" || conditionName == "last10%") {
          $("#luckysheet-editorConditionRule-dialog #isPercent").attr("checked", "checked");
        }
      } else {
        if (conditionName == "formula") {
          let val1 = rule.conditionValue[0];
          $("#luckysheet-editorConditionRule-dialog #formulaConditionVal input").val(val1);
        }
      }
      getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog #textcolorshow"))?.set(ruleFormat.textColor);
      getPicker(document.querySelector("#luckysheet-editorConditionRule-dialog #cellcolorshow"))?.set(ruleFormat.cellColor);
    }
  },
  infoDialog: function (title, content) {
    showModalMask();
    $("#luckysheet-conditionformat-info-dialog").remove();
    $("body").append(replaceHtml(modelHTML, {
      "id": "luckysheet-conditionformat-info-dialog",
      "addclass": "",
      "title": title,
      "content": content,
      "botton": `<button id="luckysheet-conditionformat-info-dialog-close" class="btn btn-default">${locale().conditionformat.close}</button>`,
      "style": "z-index:100003"
    }));
    let $t = $("#luckysheet-conditionformat-info-dialog").find(".luckysheet-modal-dialog-content").css("min-width", 300).end(),
      myh = $t.outerHeight(),
      myw = $t.outerWidth();
    let winw = document.documentElement.clientWidth,
      winh = document.documentElement.clientHeight;
    let scrollLeft = document.documentElement.scrollLeft,
      scrollTop = document.documentElement.scrollTop;
    $("#luckysheet-conditionformat-info-dialog").css({
      "left": (winw + scrollLeft - myw) / 2,
      "top": (winh + scrollTop - myh) / 3
    }).show();
  },
  getRuleExplain: function (index) {
    const conditionformat_Text = locale().conditionformat;
    let textCellColorHtml = this.textCellColorHtml();
    let ruleExplainHtml;
    switch (index) {
      case 0:
        //基于各自值设置所有单元格的格式
        ruleExplainHtml = `<div class="title">${conditionformat_Text.ruleTypeItem1}：</div>
                                    <div style="height: 30px;margin-bottom: 5px;">
                                        <label style="display: block;width: 80px;height: 30px;line-height: 30px;float: left;">${conditionformat_Text.formatStyle}：</label>
                                        <select id="type1">
                                            <option value="dataBar">${conditionformat_Text.dataBar}</option>
                                            <option value="colorGradation">${conditionformat_Text.colorGradation}</option>
                                            <option value="icons">${conditionformat_Text.icons}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <div class="type1Box dataBarBox">
                                            <div style="height: 30px;margin-bottom: 5px;">
                                                <label style="display: block;width: 80px;height: 30px;line-height: 30px;float: left;">${conditionformat_Text.fillType}：</label>
                                                <select id="type2">
                                                    <option value="gradient">${conditionformat_Text.gradient}</option>
                                                    <option value="solid">${conditionformat_Text.solid}</option>
                                                </select>
                                            </div>
                                            <div style="height: 30px;margin-bottom: 5px;">
                                                <label style="display: block;width: 80px;height: 30px;line-height: 30px;float: left;">${conditionformat_Text.color}：</label>
                                                <input data-tips="${conditionformat_Text.dataBarColor}" data-func="background" class="luckysheet-conditionformat-config-color" type="text" value="#638ec6" style="display: none;"> 
                                            </div>
                                        </div>
                                        <div class="type1Box colorGradationBox" style="display: none;">
                                            <div style="height: 30px;margin-bottom: 5px;">
                                                <label style="display: block;width: 80px;height: 30px;line-height: 30px;float: left;">${conditionformat_Text.fillType}：</label>
                                                <select id="type2">
                                                    <option value="threeColor">${conditionformat_Text.tricolor}</option>
                                                    <option value="twoColor">${conditionformat_Text.twocolor}</option>
                                                </select>
                                            </div>
                                            <div class="maxVal" style="height: 30px;margin-bottom: 5px;">
                                                <label style="display: block;width: 80px;height: 30px;line-height: 30px;float: left;">${conditionformat_Text.maxValue}：</label>
                                                <input data-tips="${conditionformat_Text.maxValue} ${conditionformat_Text.color}" data-func="background" class="luckysheet-conditionformat-config-color" type="text" value="rgb(99, 190, 123)" style="display: none;">
                                            </div>
                                            <div class="midVal" style="height: 30px;margin-bottom: 5px;">
                                                <label style="display: block;width: 80px;height: 30px;line-height: 30px;float: left;">${conditionformat_Text.medianValue}：</label>
                                                <input data-tips="${conditionformat_Text.medianValue} ${conditionformat_Text.color}" data-func="background" class="luckysheet-conditionformat-config-color" type="text" value="rgb(255, 235, 132)" style="display: none;">
                                            </div>
                                            <div class="minVal" style="height: 30px;margin-bottom: 5px;">
                                                <label style="display: block;width: 80px;height: 30px;line-height: 30px;float: left;">${conditionformat_Text.minValue}：</label>
                                                <input data-tips="${conditionformat_Text.minValue} ${conditionformat_Text.color}" data-func="background" class="luckysheet-conditionformat-config-color" type="text" value="rgb(248, 105, 107)" style="display: none;">
                                            </div>
                                        </div>
                                        <div class="type1Box iconsBox" style="display: none;">
                                            <label>${conditionformat_Text.fillType}：</label>
                                            <div class="showbox">
                                                <div class="model" data-len="3" data-leftmin="0" data-top="0" title="${conditionformat_Text.threeWayArrow}(${conditionformat_Text.multicolor})" style="background-position: 0 0;"></div>
                                                <span class="ui-selectmenu-icon ui-icon ui-icon-triangle-1-s" style="margin-top: 2px;"></span>
                                            </div>
                                            <ul>
                                                <li><div data-len="3" data-leftmin="0" data-top="0" title="${conditionformat_Text.threeWayArrow}(${conditionformat_Text.multicolor})" style="background-position: 0 0;"></div></li>
                                                <li><div data-len="3" data-leftmin="5" data-top="0" title="${conditionformat_Text.threeWayArrow}(${conditionformat_Text.grayColor})" style="background-position: -131px 0;"></div></li>
                                                <li><div data-len="3" data-leftmin="0" data-top="1" title="${conditionformat_Text.threeTriangles}" style="background-position: 0 -20px;"></div></li>
                                                <li><div data-len="4" data-leftmin="0" data-top="2" title="${conditionformat_Text.fourWayArrow}(${conditionformat_Text.multicolor})" style="background-position: 0 -40px;"></div></li>
                                                <li><div data-len="4" data-leftmin="5" data-top="1" title="${conditionformat_Text.fourWayArrow}(${conditionformat_Text.grayColor})" style="background-position: -131px -20px;"></div></li>
                                                <li><div data-len="5" data-leftmin="0" data-top="3" title="${conditionformat_Text.fiveWayArrow}(${conditionformat_Text.multicolor})" style="background-position: 0 -60px;"></div></li>
                                                <li><div data-len="5" data-leftmin="5" data-top="2" title="${conditionformat_Text.fiveWayArrow}(${conditionformat_Text.grayColor})" style="background-position: -131px -40px;"></div></li>
                                                <li><div data-len="3" data-leftmin="0" data-top="4" title="${conditionformat_Text.threeColorTrafficLight}(${conditionformat_Text.rimless})" style="background-position: 0 -80px;"></div></li>
                                                <li><div data-len="3" data-leftmin="5" data-top="4" title="${conditionformat_Text.threeColorTrafficLight}(${conditionformat_Text.bordered})" style="background-position: -131px -80px;"></div></li>
                                                <li><div data-len="3" data-leftmin="0" data-top="5" title="${conditionformat_Text.threeSigns}" style="background-position: 0 -100px;"></div></li>
                                                <li><div data-len="4" data-leftmin="5" data-top="5" title="${conditionformat_Text.fourColorTrafficLight}" style="background-position: -131px -100px;"></div></li>
                                                <li><div data-len="4" data-leftmin="0" data-top="6" title="${conditionformat_Text.greenRedBlackGradient}" style="background-position: 0 -120px;"></div></li>
                                                <li><div data-len="3" data-leftmin="0" data-top="7" title="${conditionformat_Text.threeSymbols}(${conditionformat_Text.circled})" style="background-position: 0 -140px;"></div></li>
                                                <li><div data-len="3" data-leftmin="5" data-top="7" title="${conditionformat_Text.threeSymbols}(${conditionformat_Text.noCircle})" style="background-position: -131px -140px;"></div></li>
                                                <li><div data-len="3" data-leftmin="0" data-top="8" title="${conditionformat_Text.tricolorFlag}" style="background-position: 0 -160px;"></div></li>
                                                <li><div data-len="3" data-leftmin="0" data-top="9" title="${conditionformat_Text.threeStars}" style="background-position: 0 -180px;"></div></li>
                                                <li><div data-len="5" data-leftmin="0" data-top="10" title="${conditionformat_Text.fiveQuadrantDiagram}" style="background-position: 0 -200px;"></div></li>
                                                <li><div data-len="5" data-leftmin="0" data-top="11" title="${conditionformat_Text.fiveBoxes}" style="background-position: 0 -220px;"></div></li>
                                                <li><div data-len="4" data-leftmin="5" data-top="9" title="${conditionformat_Text.grade4}" style="background-position: -131px -180px;"></div></li>
                                                <li><div data-len="5" data-leftmin="5" data-top="10" title="${conditionformat_Text.grade5}" style="background-position: -131px -200px;"></div></li>
                                            </ul>
                                        </div>
                                    </div>`;
        break;
      case 1:
        //只为包含以下内容的单元格设置格式
        ruleExplainHtml = `<div class="title">${conditionformat_Text.ruleTypeItem2_title}：</div>
                                    <div style="height: 30px;margin-bottom: 10px;">
                                        <select id="type1">
                                            <option value="number">${conditionformat_Text.cellValue}</option>
                                            <option value="text">${conditionformat_Text.specificText}</option>
                                            <option value="date">${conditionformat_Text.occurrence}</option>
                                        </select>
                                        <div>
                                            <div class="type1Box numberBox">
                                                <select id="type2">
                                                    <option value="greaterThan">${conditionformat_Text.greaterThan}</option>
                                                    <option value="lessThan">${conditionformat_Text.lessThan}</option>
                                                    <option value="betweenness">${conditionformat_Text.between}</option>
                                                    <option value="equal">${conditionformat_Text.equal}</option>
                                                </select>
                                                <div class="inpbox range" id="conditionVal">
                                                    <input class="formulaInputFocus"/>
                                                    <i class="fa fa-table" aria-hidden="true" title="${conditionformat_Text.selectCell}"></i>
                                                </div>
                                                <span class="txt" style="display: none;">${conditionformat_Text.in}</span>
                                                <div class="inpbox range" id="conditionVal2" style="display: none;">
                                                    <input class="formulaInputFocus"/>
                                                    <i class="fa fa-table" aria-hidden="true" title="${conditionformat_Text.selectDataRange}"></i>
                                                </div>
                                            </div>
                                            <div class="type1Box textBox" style="display: none;">
                                                <select id="type2">
                                                    <option value="">${conditionformat_Text.contain}</option>
                                                </select>
                                                <div class="inpbox range" id="conditionVal">
                                                    <input class="formulaInputFocus"/>
                                                    <i class="fa fa-table" aria-hidden="true" title="${conditionformat_Text.selectCell}"></i>
                                                </div>
                                            </div>
                                            <div class="type1Box dateBox" style="display: none;">
                                                <div style="width: 162px;" class="inpbox">
                                                    <input style="width: 150px;" id="daterange-btn" readonly="readonly" placeholder="${conditionformat_Text.pleaseSelectADate}"/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="title">${conditionformat_Text.setFormat}: </div>${textCellColorHtml}`;
        break;
      case 2:
        //仅对排名靠前或靠后的数值设置格式
        ruleExplainHtml = `<div class="title">${conditionformat_Text.ruleTypeItem3_title}：</div>
                                    <div style="height: 30px;margin-bottom: 10px;">
                                        <select id="type1">
                                            <option value="top">${conditionformat_Text.top}</option>
                                            <option value="last">${conditionformat_Text.last}</option>
                                        </select>
                                        <div class="inpbox" id="conditionVal">
                                            <input class="formulaInputFocus" type="number" value="10"/>
                                        </div>
                                        <input id="isPercent" type="checkbox"/>
                                        <label for="isPercent" class="txt">${conditionformat_Text.selectRange_percent}</label>
                                    </div>
                                    <div class="title">${conditionformat_Text.setFormat}：</div>${textCellColorHtml}`;
        break;
      case 3:
        //仅对高于或低于平均值的数值设置格式
        ruleExplainHtml = `<div class="title">${conditionformat_Text.ruleTypeItem4_title}：</div>
                                    <div style="height: 30px;margin-bottom: 10px;">
                                        <select id="type1">
                                            <option value="AboveAverage">${conditionformat_Text.above}</option>
                                            <option value="SubAverage">${conditionformat_Text.below}</option>
                                        </select>
                                        <span class="txt">${conditionformat_Text.selectRange_average}</span>
                                    </div>
                                    <div class="title">${conditionformat_Text.setFormat}：</div>${textCellColorHtml}`;
        break;
      case 4:
        //仅对唯一值或重复值设置格式
        ruleExplainHtml = `<div class="title">${conditionformat_Text.all}：</div>
                                    <div style="height: 30px;margin-bottom: 10px;">
                                        <select id="type1">
                                            <option value="0">${conditionformat_Text.duplicateValue}</option>
                                            <option value="1">${conditionformat_Text.uniqueValue}</option>
                                        </select>
                                        <span class="txt">${conditionformat_Text.selectRange_value}</span>
                                    </div>
                                    <div class="title">${conditionformat_Text.setFormat}：</div>${textCellColorHtml}`;
        break;
      case 5:
        //使用公式确定要设置格式的单元格
        ruleExplainHtml = `<div class="title">${conditionformat_Text.ruleTypeItem2_title}：</div>
                                    <div style="height: 30px;margin-bottom: 10px;">
                                        <div class="inpbox range" id="formulaConditionVal" style="width: 250px;">
                                            <input class="formulaInputFocus" style="width: 200px;"/>
                                            <i class="fa fa-table" aria-hidden="true" title="${conditionformat_Text.selectCell}"></i>
                                        </div>
                                    </div>
                                    <div class="title">${conditionformat_Text.setFormat}: </div>${textCellColorHtml}`;
        break;
    }
    return ruleExplainHtml;
  },
  colorSelectInit: function () {
    document.querySelectorAll(".luckysheet-conditionformat-config-color").forEach(function(el) {
      createColorPicker(el, {
        palette: STANDARD_PALETTE,
        format: 'hex'
      });
    });
  },
  daterangeInit: function (id) {
    const conditionformat_Text = locale().conditionformat;
    const regexSingleDate = /^\d{4}-\d{2}-\d{2}$/; // 匹配  "YYYY-MM-DD"
    const regexStartEndDate = /^\d{4}-\d{2}-\d{2} to \d{4}-\d{2}-\d{2}$/; // 匹配 "YYYY-MM-DD to YYYY-MM-DD"
    // const regexStartEndDate = /^(\d{4}-\d{2}-\d{2})( to (\d{4}-\d{2}-\d{2}))?$/; // 

    //日期选择插件
    $('.ranges_1 ul').remove();
    const daterangeBtn = $('#' + id).find("#daterange-btn");
    daterangeBtn.flatpickr({
      mode: "range",
      onChange: (data, label) => {
        const [start, end] = data;
        //label:通过它来知道用户选择的是什么，传给后台进行相应的展示
        let format1 = [conditionformat_Text.yesterday, conditionformat_Text.today];
        let format2 = [conditionformat_Text.lastWeek, conditionformat_Text.thisWeek, conditionformat_Text.lastMonth, conditionformat_Text.thisMonth, conditionformat_Text.lastYear, conditionformat_Text.thisYear, conditionformat_Text.last7days, conditionformat_Text.last30days];
        if (label == conditionformat_Text.all) {
          daterangeBtn.val('');
        } else if (format1.indexOf(label) > -1) {
          daterangeBtn.val(dayjs(start).format('YYYY/MM/DD'));
        } else if (format2.indexOf(label) > -1) {
          daterangeBtn.val(dayjs(start).format('YYYY/MM/DD') + '-' + dayjs(end).format('YYYY/MM/DD'));
        }

        // 匹配  "2023-05-17 to 2023-05-19"
        const isValidSingleFormat = regexSingleDate.test(label);
        const isValidStartEndFormat = regexStartEndDate.test(label);
        if (isValidSingleFormat) {
          daterangeBtn.val(dayjs(start).format('YYYY/MM/DD'));
        } else if (isValidStartEndFormat) {
          daterangeBtn.val(dayjs(start).format('YYYY/MM/DD') + '-' + dayjs(end).format('YYYY/MM/DD'));
        }
      }
    });
  }
};
export default dialogModule;